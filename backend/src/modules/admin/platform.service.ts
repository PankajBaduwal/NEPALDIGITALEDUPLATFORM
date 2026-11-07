import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';
import { Institution, User, InstitutionSubscription } from '../../models';
import { SchoolAnnouncement } from '../../models/Announcement';
import { RagUsage } from '../../models/Rag';
import { AuditService } from '../../common/services/audit.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

const DAY = 86_400_000;
const fail = (status: number, message: string, code: string) => ({ status, message, code });
const regexSafe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const PlatformService = {
  // ── Institution health ──────────────────────────────────────────────────────────────────
  /** One row per school: people, recent activity, AI use and subscription state, with simple warning flags. */
  async health(query: { search?: string; province?: string; flag?: string }) {
    const filter: any = {};
    if (query.province) filter.province = query.province;
    if (query.search) {
      const rx = new RegExp(regexSafe(String(query.search).trim()), 'i');
      filter.$or = [{ name: rx }, { emisCode: rx }, { district: rx }];
    }
    const institutions: any[] = await Institution.find(filter, 'name emisCode province district status type').sort({ name: 1 }).lean();
    const ids = institutions.map((i) => i._id);
    const now = Date.now();
    const weekAgo = new Date(now - 7 * DAY);
    const monthAgo = new Date(now - 30 * DAY);

    const [people, activity, aiByInst, subs] = await Promise.all([
      User.aggregate([{ $match: { institutionId: { $in: ids } } }, { $group: { _id: { i: '$institutionId', r: '$role' }, n: { $sum: 1 } } }]),
      User.aggregate([
        { $match: { institutionId: { $in: ids } } },
        { $group: { _id: '$institutionId', lastLoginAt: { $max: '$lastLoginAt' }, lastSeenAt: { $max: '$lastSeenAt' }, active7d: { $sum: { $cond: [{ $gte: ['$lastSeenAt', weekAgo] }, 1, 0] } } } },
      ]),
      RagUsage.aggregate([
        { $match: { createdAt: { $gte: monthAgo }, institutionId: { $in: ids } } },
        { $group: { _id: '$institutionId', requests: { $sum: 1 }, tokens: { $sum: { $add: [{ $ifNull: ['$inputTokens', 0] }, { $ifNull: ['$outputTokens', 0] }] } } } },
      ]),
      InstitutionSubscription.find({ institutionId: { $in: ids } }).sort({ endDate: -1 }).populate('planId', 'name').lean() as any,
    ]);

    const firstTracked: any = await User.findOne({ lastLoginAt: { $exists: true } }, 'lastLoginAt').sort({ lastLoginAt: 1 }).lean();
    const trackingSince: number | null = firstTracked?.lastLoginAt ? new Date(firstTracked.lastLoginAt).getTime() : null;
    const pk = new Map<string, any>();
    people.forEach((p: any) => {
      const k = String(p._id.i);
      const cur = pk.get(k) || {};
      cur[p._id.r] = p.n;
      pk.set(k, cur);
    });
    const act = new Map(activity.map((a: any) => [String(a._id), a]));
    const ai = new Map(aiByInst.map((a: any) => [String(a._id), a]));
    const sub = new Map<string, any>();
    (subs as any[]).forEach((s) => { if (!sub.has(String(s.institutionId))) sub.set(String(s.institutionId), s); });

    let rows = institutions.map((i) => {
      const k = String(i._id);
      const a: any = act.get(k) || {};
      const s: any = sub.get(k);
      const daysLeft = s?.endDate ? Math.ceil((new Date(s.endDate).getTime() - now) / DAY) : null;
      const lastSeen = a.lastSeenAt || a.lastLoginAt || null;
      const flags: string[] = [];
      if (!s) flags.push('NO_SUBSCRIPTION');
      else if (['EXPIRED', 'SUSPENDED', 'CANCELLED'].includes(s.status) || (daysLeft !== null && daysLeft < 0)) flags.push('SUBSCRIPTION_INACTIVE');
      else if (daysLeft !== null && daysLeft <= 30) flags.push('SUBSCRIPTION_EXPIRING');
      // Sign-ins are only recorded from the day this feature went live, so "quiet" is not claimed before 14 days of tracking
      const trackedLongEnough = trackingSince !== null && now - trackingSince > 14 * DAY;
      if (i.status === 'ACTIVE' && (lastSeen ? now - new Date(lastSeen).getTime() > 14 * DAY : trackedLongEnough)) flags.push('NO_RECENT_ACTIVITY');
      const p = pk.get(k) || {};
      return {
        id: k,
        name: i.name,
        emisCode: i.emisCode,
        province: i.province,
        district: i.district,
        status: i.status,
        students: p.STUDENT || 0,
        teachers: p.TEACHER || 0,
        lastLoginAt: a.lastLoginAt || null,
        lastSeenAt: lastSeen,
        activeUsers7d: a.active7d || 0,
        aiRequests30d: (ai.get(k) as any)?.requests || 0,
        aiTokens30d: (ai.get(k) as any)?.tokens || 0,
        subscription: s ? { plan: s.planId?.name || s.planCode, status: s.status, endDate: s.endDate, daysLeft } : null,
        flags,
      };
    });
    if (query.flag) rows = rows.filter((r) => (query.flag === 'ANY' ? r.flags.length > 0 : r.flags.includes(query.flag as string)));
    const summary = {
      institutions: institutions.length,
      expiringSoon: rows.filter((r) => r.flags.includes('SUBSCRIPTION_EXPIRING')).length,
      inactiveSubscriptions: rows.filter((r) => r.flags.includes('SUBSCRIPTION_INACTIVE') || r.flags.includes('NO_SUBSCRIPTION')).length,
      quietSchools: rows.filter((r) => r.flags.includes('NO_RECENT_ACTIVITY')).length,
      activeUsers7d: rows.reduce((n, r) => n + r.activeUsers7d, 0),
    };
    return { summary, rows };
  },

  // ── AI usage ────────────────────────────────────────────────────────────────────────────
  async aiUsage(daysRaw: any) {
    const days = Math.min(90, Math.max(1, Number(daysRaw) || 30));
    const since = new Date(Date.now() - days * DAY);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [totals, byFeature, daily, byInstitution, today] = await Promise.all([
      RagUsage.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: null, requests: { $sum: 1 }, failed: { $sum: { $cond: ['$ok', 0, 1] } }, grounded: { $sum: { $cond: ['$grounded', 1, 0] } }, input: { $sum: { $ifNull: ['$inputTokens', 0] } }, output: { $sum: { $ifNull: ['$outputTokens', 0] } }, avgLatency: { $avg: '$latencyMs' } } }]),
      RagUsage.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: '$feature', requests: { $sum: 1 }, tokens: { $sum: { $add: [{ $ifNull: ['$inputTokens', 0] }, { $ifNull: ['$outputTokens', 0] }] } } } }, { $sort: { requests: -1 } }]),
      RagUsage.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, requests: { $sum: 1 }, tokens: { $sum: { $add: [{ $ifNull: ['$inputTokens', 0] }, { $ifNull: ['$outputTokens', 0] }] } } } }, { $sort: { _id: 1 } }]),
      RagUsage.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$institutionId', requests: { $sum: 1 }, failed: { $sum: { $cond: ['$ok', 0, 1] } }, tokens: { $sum: { $add: [{ $ifNull: ['$inputTokens', 0] }, { $ifNull: ['$outputTokens', 0] }] } } } },
        { $sort: { requests: -1 } },
        { $limit: 50 },
      ]),
      RagUsage.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);
    const insts: any[] = await Institution.find({ _id: { $in: byInstitution.map((b: any) => b._id).filter(Boolean) } }, 'name emisCode').lean();
    const nameOf = new Map(insts.map((i) => [String(i._id), i]));
    const t: any = totals[0] || {};
    const dailyLimit = Number(process.env.GEMINI_DAILY_LIMIT) || 80;
    return {
      days,
      totals: { requests: t.requests || 0, failed: t.failed || 0, grounded: t.grounded || 0, inputTokens: t.input || 0, outputTokens: t.output || 0, avgLatencyMs: Math.round(t.avgLatency || 0) },
      quota: {
        usedToday: today,
        dailyLimit,
        tier: ENV.GEMINI_API_KEY ? (process.env.GEMINI_TIER || 'free') : 'not configured',
        note: 'Daily limit is the platform total you configure with GEMINI_DAILY_LIMIT. The free tier allows about 20 answers per model per day (about 80 with the model fallback chain).',
        model: ENV.GEMINI_TEXT_MODEL,
      },
      byFeature: byFeature.map((f: any) => ({ feature: f._id || 'unknown', requests: f.requests, tokens: f.tokens })),
      daily: daily.map((d: any) => ({ date: d._id, requests: d.requests, tokens: d.tokens })),
      byInstitution: byInstitution.map((b: any) => ({ institutionId: b._id ? String(b._id) : null, name: (b._id && (nameOf.get(String(b._id)) as any)?.name) || 'Platform / unassigned', emisCode: (b._id && (nameOf.get(String(b._id)) as any)?.emisCode) || '', requests: b.requests, failed: b.failed, tokens: b.tokens })),
    };
  },

  // ── Platform-wide announcements ────────────────────────────────────────────────────────
  async sendAnnouncement(admin: { userId: string; username?: string }, body: any) {
    const title = String(body?.title || '').trim();
    const content = String(body?.content || '').trim();
    if (!title || !content) throw fail(400, 'A title and a message are required.', 'INVALID_INPUT');
    if (title.length > 160 || content.length > 4000) throw fail(400, 'The title (160) or message (4000 characters) is too long.', 'INVALID_INPUT');
    const scope = String(body?.scope || 'ALL');
    const filter: any = { status: 'ACTIVE' };
    let scopeLabel = 'All schools';
    if (scope === 'PROVINCE') {
      if (!body?.province) throw fail(400, 'Choose a province.', 'INVALID_INPUT');
      filter.province = String(body.province);
      scopeLabel = String(body.province);
    } else if (scope === 'INSTITUTIONS') {
      const ids: string[] = Array.isArray(body?.institutionIds) ? body.institutionIds.map(String) : [];
      if (!ids.length) throw fail(400, 'Choose at least one school.', 'INVALID_INPUT');
      filter._id = { $in: ids };
      scopeLabel = `${ids.length} selected school${ids.length === 1 ? '' : 's'}`;
    } else if (scope !== 'ALL') {
      throw fail(400, 'Unknown audience.', 'INVALID_INPUT');
    }
    const targets: any[] = await Institution.find(filter, '_id').lean();
    if (!targets.length) throw fail(404, 'No active schools match that audience.', 'NO_RECIPIENTS');
    const audience = ['ALL', 'TEACHERS', 'STUDENTS'].includes(body?.audience) ? body.audience : 'ALL';
    const priority = ['NORMAL', 'HIGH', 'URGENT'].includes(body?.priority) ? body.priority : 'NORMAL';
    const batchId = crypto.randomBytes(6).toString('hex');
    await SchoolAnnouncement.insertMany(
      targets.map((t) => ({
        institutionId: t._id, title, content, targetAudience: audience, publishedBy: admin.userId, announcementType: 'INSTITUTIONAL',
        authorRole: 'SUPER_ADMIN', authorName: 'Central Administration', priority, platformBatchId: batchId, platformScope: scopeLabel,
      }))
    );
    await AuditService.log({ operatorId: admin.userId, operatorRole: 'SUPER_ADMIN', action: 'PLATFORM_ANNOUNCEMENT_SENT', entityType: 'Announcement', entityId: batchId, details: { title, scope: scopeLabel, audience, priority, institutions: targets.length } });
    return { batchId, institutions: targets.length, scope: scopeLabel };
  },

  async listAnnouncements() {
    const rows: any[] = await SchoolAnnouncement.aggregate([
      { $match: { platformBatchId: { $exists: true, $ne: null } } },
      { $group: { _id: '$platformBatchId', title: { $first: '$title' }, content: { $first: '$content' }, scope: { $first: '$platformScope' }, audience: { $first: '$targetAudience' }, priority: { $first: '$priority' }, sentAt: { $min: '$createdAt' }, institutions: { $sum: 1 } } },
      { $sort: { sentAt: -1 } },
      { $limit: 50 },
    ]);
    return rows.map((r) => ({ batchId: r._id, title: r.title, content: r.content, scope: r.scope, audience: r.audience, priority: r.priority, sentAt: r.sentAt, institutions: r.institutions }));
  },

  async withdrawAnnouncement(admin: { userId: string }, batchId: string) {
    const r = await SchoolAnnouncement.deleteMany({ platformBatchId: batchId });
    if (!r.deletedCount) throw fail(404, 'That announcement was not found.', 'NOT_FOUND');
    await AuditService.log({ operatorId: admin.userId, operatorRole: 'SUPER_ADMIN', action: 'PLATFORM_ANNOUNCEMENT_WITHDRAWN', entityType: 'Announcement', entityId: batchId, details: { removedFrom: r.deletedCount } });
    return { removedFrom: r.deletedCount };
  },

  // ── Subscriptions: list and bulk actions ───────────────────────────────────────────────
  async listSubscriptions(query: { status?: string; search?: string }) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    let rows: any[] = await InstitutionSubscription.find(filter).sort({ endDate: 1 }).populate('institutionId', 'name emisCode province').populate('planId', 'name').lean();
    if (query.search) {
      const rx = new RegExp(regexSafe(String(query.search).trim()), 'i');
      rows = rows.filter((r) => rx.test(r.institutionId?.name || '') || rx.test(r.institutionId?.emisCode || ''));
    }
    const now = Date.now();
    return rows.map((r) => ({
      id: String(r._id),
      institution: r.institutionId ? { id: String(r.institutionId._id), name: r.institutionId.name, emisCode: r.institutionId.emisCode, province: r.institutionId.province } : null,
      plan: r.planId?.name || r.planCode,
      status: r.status,
      endDate: r.endDate,
      daysLeft: r.endDate ? Math.ceil((new Date(r.endDate).getTime() - now) / DAY) : null,
    }));
  },

  async bulkSubscriptions(admin: { userId: string }, body: any) {
    const ids: string[] = Array.isArray(body?.subscriptionIds) ? [...new Set<string>(body.subscriptionIds.map(String))] : [];
    const action = String(body?.action || '');
    if (!ids.length) throw fail(400, 'Select at least one subscription.', 'INVALID_INPUT');
    if (ids.length > 200) throw fail(400, 'Select at most 200 subscriptions at a time.', 'INVALID_INPUT');
    if (!['EXTEND', 'SUSPEND', 'ACTIVATE'].includes(action)) throw fail(400, 'Unknown action.', 'INVALID_INPUT');
    const months = Math.min(60, Math.max(1, Number(body?.months) || 12));
    const reason = String(body?.reason || '').trim();
    if (action === 'SUSPEND' && !reason) throw fail(400, 'Give a reason for the suspension.', 'INVALID_INPUT');
    const results: Array<{ id: string; ok: boolean; error?: string }> = [];
    for (const id of ids) {
      try {
        if (action === 'EXTEND') await SubscriptionsService.extendSubscription({ subscriptionId: id, additionalMonths: months, reason: reason || `Bulk extension by ${months} months`, performedBy: admin.userId });
        else if (action === 'SUSPEND') await SubscriptionsService.suspendSubscription({ subscriptionId: id, reason, performedBy: admin.userId });
        else await SubscriptionsService.activateSubscription({ subscriptionId: id, reason: reason || 'Reactivated in bulk by Super Admin', performedBy: admin.userId });
        results.push({ id, ok: true });
      } catch (e: any) {
        results.push({ id, ok: false, error: e?.message || 'Failed' });
      }
    }
    const okCount = results.filter((r) => r.ok).length;
    await AuditService.log({ operatorId: admin.userId, operatorRole: 'SUPER_ADMIN', action: `BULK_SUBSCRIPTION_${action}`, entityType: 'InstitutionSubscription', details: { requested: ids.length, succeeded: okCount, months: action === 'EXTEND' ? months : undefined, reason: reason || undefined } });
    return { requested: ids.length, succeeded: okCount, failed: ids.length - okCount, results };
  },

  // ── View as a school administrator ─────────────────────────────────────────────────────
  async impersonate(admin: { userId: string; username?: string }, body: any, ip?: string) {
    const institutionId = String(body?.institutionId || '');
    if (!/^[a-f0-9]{24}$/i.test(institutionId)) throw fail(400, 'Choose a school.', 'INVALID_INPUT');
    const institution: any = await Institution.findById(institutionId).lean();
    if (!institution) throw fail(404, 'School not found.', 'NOT_FOUND');
    if (institution.status !== 'ACTIVE') throw fail(409, 'Only active schools can be viewed.', 'INSTITUTION_INACTIVE');
    const wanted = ['SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL'].includes(body?.role) ? [body.role] : ['SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL'];
    let target: any = null;
    for (const role of wanted) {
      target = await User.findOne({ institutionId, role, status: 'ACTIVE' }).sort({ createdAt: 1 });
      if (target) break;
    }
    if (!target) throw fail(404, 'This school has no active administrator to view as.', 'NO_TARGET');
    const token = jwt.sign(
      { userId: target.id, username: target.username, role: target.role, institutionId: String(institutionId), impersonatedBy: admin.userId, impersonatedByUsername: admin.username },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );
    await AuditService.log({ operatorId: admin.userId, operatorRole: 'SUPER_ADMIN', action: 'IMPERSONATION_STARTED', entityType: 'User', entityId: target.id, ipAddress: ip, details: { institution: institution.name, viewingAs: target.username, role: target.role, expiresInMinutes: 60 } });
    return {
      token,
      accessToken: token,
      expiresInMinutes: 60,
      user: { id: target.id, username: target.username, fullName: target.fullName, email: target.email, role: target.role, institutionId: String(institutionId), institutionName: institution.name, institutionCode: institution.emisCode, activePackages: [], isImpersonated: true },
    };
  },
};
