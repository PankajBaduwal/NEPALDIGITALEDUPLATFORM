import mongoose from 'mongoose';
import {
  User, Institution, StudentEnrollment, Notification, SchoolAnnouncement, EmergencyAlert, PrincipalNotice, TeacherAbsence, SchoolSeal,
  TimetableEntry, SubstituteAssignment, ClassroomSession,
} from '../../models';
import { SocketService } from '../../common/services/socket.service';
import { SmsService } from '../../common/services/sms.service';
import { AuditService } from '../../common/services/audit.service';
import { NotificationService } from '../notifications/notification.service';
import { TimetableBuilderService } from '../timetable/timetable-builder.service';
import { TimetableService, schoolClock } from '../timetable/timetable.service';

export const fail = (status: number, message: string, code: string) => ({ status, message, code });
export const isId = (v: any) => /^[a-f0-9]{24}$/i.test(String(v || ''));
export const isoOk = (v: any) => /^\d{4}-\d{2}-\d{2}$/.test(String(v)) && !isNaN(new Date(`${v}T06:00:00Z`).getTime());
const utcDay = (iso: string) => new Date(`${iso}T00:00:00Z`);
const dayOf = (iso: string) => schoolClock(new Date(`${iso}T06:00:00Z`)).day;
const toMin = (t?: string) => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? Number(m[1]) * 60 + Number(m[2]) : NaN; };
const idStr = (v: any) => String(v?._id || v?.id || v || '');

// ── Notice history (kept on the server) ──────────────────────────────────────────────────
export const PrincipalNoticeService = {
  async log(userId: string, institutionId: string, b: any) {
    const title = String(b?.title || '').trim().slice(0, 200);
    if (!title) throw fail(400, 'A notice needs a title.', 'INVALID_INPUT');
    const row: any = await PrincipalNotice.create({
      institutionId, sentBy: userId, title, message: String(b?.message || '').slice(0, 2000), recipient: String(b?.recipient || '').slice(0, 200),
      recipientRole: ['STUDENT', 'TEACHER', 'ALL'].includes(b?.recipientRole) ? b.recipientRole : 'ALL', type: String(b?.type || 'ANNOUNCEMENT').slice(0, 40),
      priority: ['HIGH', 'NORMAL', 'URGENT'].includes(b?.priority) ? b.priority : 'NORMAL',
    });
    return row.toJSON();
  },
  async list(institutionId: string) {
    const rows: any[] = await PrincipalNotice.find({ institutionId }).sort({ createdAt: -1 }).limit(200).populate('sentBy', 'fullName').lean();
    return rows.map((r) => ({ id: String(r._id), title: r.title, message: r.message, recipient: r.recipient, recipientRole: r.recipientRole, type: r.type, priority: r.priority, sentAt: r.createdAt, sentBy: r.sentBy?.fullName || '' }));
  },
};

// ── Emergency broadcast ──────────────────────────────────────────────────────────────────
const KIND_TITLE: Record<string, string> = { CLOSURE: 'School closed', WEATHER: 'Weather alert', SAFETY: 'Safety alert', OTHER: 'Important notice' };

async function recipientsOf(institutionId: string, audience: { teachers?: boolean; students?: boolean }) {
  const roles = ['PRINCIPAL', 'SCHOOL_ADMIN', ...(audience.teachers !== false ? ['TEACHER'] : []), ...(audience.students !== false ? ['STUDENT'] : [])];
  const users: any[] = await User.find({ institutionId, role: { $in: roles }, status: { $nin: ['INACTIVE', 'SUSPENDED'] } }, 'role phone').lean();
  return users;
}

/** Unique valid mobile numbers: guardians of the chosen students and the chosen staff. */
async function phonesFor(users: any[]) {
  const phones = new Set<string>();
  let invalid = 0;
  const add = (raw?: string) => { if (!raw) return; const n = SmsService.normalize(raw); if (n) phones.add(n); else invalid++; };
  for (const u of users.filter((x) => x.role === 'TEACHER' || x.role === 'PRINCIPAL')) add(u.phone);
  const studentIds = users.filter((x) => x.role === 'STUDENT').map((x) => x._id);
  if (studentIds.length) {
    const enr: any[] = await StudentEnrollment.find({ studentId: { $in: studentIds }, status: 'ENROLLED' }, 'guardianPhone').lean();
    for (const e of enr) add(e.guardianPhone);
  }
  return { phones: [...phones], invalid };
}

async function sendSmsBatch(alertId: string, phones: string[], text: string) {
  let sent = 0, failed = 0, i = 0;
  const worker = async () => { while (i < phones.length) { const p = phones[i++]; const r = await SmsService.send(p, text); r.ok ? sent++ : failed++; } };
  await Promise.all(Array.from({ length: 8 }, worker));
  await EmergencyAlert.updateOne({ _id: alertId }, { $set: { 'stats.smsSent': sent, 'stats.smsFailed': failed, 'stats.smsPrepared': 0 } });
}

async function deliver(institutionId: string, users: any[], title: string, message: string, metadata: Record<string, any>) {
  if (!users.length) return 0;
  const now = new Date();
  const docs = users.map((u) => ({ recipientId: u._id, institutionId: new mongoose.Types.ObjectId(institutionId), type: 'SYSTEM_ALERT', title, message, priority: 'URGENT', metadata, isRead: false, createdAt: now, updatedAt: now }));
  const inserted: any[] = await Notification.insertMany(docs);
  inserted.forEach((n) => SocketService.emitNotification(String(n.recipientId), n.toJSON ? n.toJSON() : n));
  return inserted.length;
}

export const EmergencyService = {
  async send(userId: string, role: string, institutionId: string, b: any) {
    if (b?.confirm !== true) throw fail(400, 'Confirm the alert before sending it to everyone.', 'CONFIRM_REQUIRED');
    const kind = ['CLOSURE', 'WEATHER', 'SAFETY', 'OTHER'].includes(b?.kind) ? b.kind : 'CLOSURE';
    const message = String(b?.message || '').trim();
    if (message.length < 5) throw fail(400, 'Write the alert message (at least a few words).', 'INVALID_INPUT');
    if (message.length > 480) throw fail(400, 'Keep the message under 480 characters so it fits in an SMS.', 'INVALID_INPUT');
    if (b?.closureDate && !isoOk(b.closureDate)) throw fail(400, 'Choose a valid closure date.', 'INVALID_DATE');
    const audience = { teachers: b?.teachers !== false, students: b?.students !== false, guardiansSms: b?.sms !== false };
    const [inst, sender]: [any, any] = await Promise.all([Institution.findById(institutionId, 'name').lean(), User.findById(userId, 'fullName').lean()]);
    const title = String(b?.title || KIND_TITLE[kind]).trim().slice(0, 160);
    const alert: any = await EmergencyAlert.create({ institutionId, kind, title, message, closureDate: b?.closureDate ? utcDay(b.closureDate) : undefined, audience, sentBy: userId, stats: { smsConfigured: SmsService.isConfigured() } });
    const users = await recipientsOf(institutionId, audience);
    const inApp = await deliver(institutionId, users, `🚨 ${title}`, message, { emergency: true, alertId: String(alert._id), kind });
    await SchoolAnnouncement.create({ institutionId, title: `🚨 ${title}`, content: message, targetAudience: 'ALL', publishedBy: userId, announcementType: 'INSTITUTIONAL', priority: 'URGENT', authorRole: role, authorName: sender?.fullName || '' });
    await PrincipalNotice.create({ institutionId, sentBy: userId, title: `Emergency: ${title}`, message, recipient: 'Whole school', recipientRole: 'ALL', type: 'EMERGENCY', priority: 'URGENT' });

    let smsInfo: any = { requested: audience.guardiansSms, configured: SmsService.isConfigured(), numbers: 0, invalidNumbers: 0, status: 'OFF' };
    if (audience.guardiansSms) {
      const { phones, invalid } = await phonesFor(users);
      const text = `${title}: ${message} - ${inst?.name || 'School'}`.slice(0, 480);
      smsInfo = { requested: true, configured: SmsService.isConfigured(), numbers: phones.length, invalidNumbers: invalid, status: !SmsService.isConfigured() ? 'NOT_CONFIGURED' : phones.length ? 'SENDING' : 'NO_NUMBERS' };
      await EmergencyAlert.updateOne({ _id: alert._id }, { $set: { 'stats.smsInvalid': invalid, 'stats.smsPrepared': SmsService.isConfigured() ? 0 : phones.length } });
      if (SmsService.isConfigured() && phones.length) sendSmsBatch(String(alert._id), phones.slice(0, 3000), text).catch((e) => console.error('Emergency SMS batch failed:', e?.message));
    }
    await EmergencyAlert.updateOne({ _id: alert._id }, { $set: { 'stats.inApp': inApp } });
    await AuditService.log({ operatorId: userId, operatorRole: role, action: 'EMERGENCY_ALERT_SENT', entityType: 'Institution', entityId: institutionId, details: { kind, title, inApp, sms: smsInfo } });
    return { id: String(alert._id), title, inApp, sms: smsInfo };
  },

  async clear(userId: string, role: string, institutionId: string, id: string, b: any) {
    const alert: any = isId(id) && (await EmergencyAlert.findOne({ _id: id, institutionId }));
    if (!alert) throw fail(404, 'Alert not found.', 'NOT_FOUND');
    if (alert.status === 'CLEARED') throw fail(409, 'This alert has already been cleared.', 'ALREADY_CLEARED');
    const message = String(b?.message || 'The earlier alert is over. Normal school activities continue.').trim().slice(0, 480);
    const users = await recipientsOf(institutionId, alert.audience || {});
    const inApp = await deliver(institutionId, users, '✅ All clear', message, { emergency: true, alertId: String(alert._id), kind: 'ALL_CLEAR' });
    alert.status = 'CLEARED'; alert.clearedAt = new Date(); alert.clearMessage = message; await alert.save();
    await AuditService.log({ operatorId: userId, operatorRole: role, action: 'EMERGENCY_ALERT_CLEARED', entityType: 'Institution', entityId: institutionId, details: { alertId: id, inApp } });
    return { id, inApp };
  },

  async list(institutionId: string) {
    const rows: any[] = await EmergencyAlert.find({ institutionId }).sort({ createdAt: -1 }).limit(50).populate('sentBy', 'fullName').lean();
    return { smsConfigured: SmsService.isConfigured(), alerts: rows.map((r) => ({ id: String(r._id), kind: r.kind, title: r.title, message: r.message, closureDate: r.closureDate, status: r.status, sentAt: r.createdAt, clearedAt: r.clearedAt, sentBy: r.sentBy?.fullName || '', stats: r.stats })) };
  },
};

// ── Daily teacher absence & cover ────────────────────────────────────────────────────────
type Cand = { id: string; name: string; score: number; sameSubject: boolean; sameSection: boolean; sameClass: boolean; load: number };

export const CoverService = {
  async plan(institutionId: string, teacherId: string, iso: string) {
    if (!isId(teacherId)) throw fail(400, 'Choose a teacher.', 'INVALID_INPUT');
    if (!isoOk(iso)) throw fail(400, 'Choose a valid date.', 'INVALID_DATE');
    const teacher: any = await User.findOne({ _id: teacherId, institutionId, role: 'TEACHER' }, 'fullName').lean();
    if (!teacher) throw fail(404, 'Teacher not found in your school.', 'NOT_FOUND');
    const day = dayOf(iso);
    const date = utcDay(iso);
    const pubIds = await TimetableBuilderService.publishedTimetableIds({ institutionId });
    const [all, subs, absences, staff]: [any[], any[], any[], any[]] = await Promise.all([
      TimetableEntry.find({ timetableId: { $in: pubIds } }).populate('sectionId', 'name').populate('classId', 'gradeNumber name').populate('centralSubjectId', 'name').lean() as any,
      SubstituteAssignment.find({ institutionId, date, status: 'CONFIRMED' }).populate('substituteTeacherId', 'fullName').lean() as any,
      TeacherAbsence.find({ institutionId, date }, 'teacherId').lean() as any,
      User.find({ institutionId, role: 'TEACHER', status: 'ACTIVE', _id: { $ne: teacherId } }, 'fullName').lean() as any,
    ]);
    const absent = new Set(absences.map((a) => String(a.teacherId)));
    absent.add(teacherId);
    const todays = all.filter((e) => e.dayOfWeek === day);
    const mine = todays.filter((e) => String(e.teacherId) === teacherId).sort((a, b) => a.periodNumber - b.periodNumber);
    const busy = new Map<number, Set<string>>();
    const load = new Map<string, number>();
    const bump = (t: string, p: number) => { if (!busy.has(p)) busy.set(p, new Set()); busy.get(p)!.add(t); load.set(t, (load.get(t) || 0) + 1); };
    for (const e of todays) bump(String(e.teacherId), e.periodNumber);
    for (const s of subs) bump(idStr(s.substituteTeacherId), s.periodNumber);
    const knows = new Map<string, { sections: Set<string>; subjects: Set<string>; classes: Set<string> }>();
    for (const e of all) {
      const k = knows.get(String(e.teacherId)) || { sections: new Set(), subjects: new Set(), classes: new Set() };
      k.sections.add(idStr(e.sectionId)); k.subjects.add(idStr(e.centralSubjectId)); k.classes.add(idStr(e.classId));
      knows.set(String(e.teacherId), k);
    }
    const existing = new Map(subs.filter((s) => String(s.originalTeacherId) === teacherId).map((s) => [String(s.timetableEntryId), s]));
    const periods = mine.map((e) => {
      const ex: any = existing.get(String(e._id));
      const cands: Cand[] = staff
        .filter((t) => !absent.has(String(t._id)) && !busy.get(e.periodNumber)?.has(String(t._id)))
        .map((t) => {
          const k = knows.get(String(t._id));
          const sameSubject = !!k?.subjects.has(idStr(e.centralSubjectId)); const sameSection = !!k?.sections.has(idStr(e.sectionId)); const sameClass = !!k?.classes.has(idStr(e.classId));
          const l = load.get(String(t._id)) || 0;
          return { id: String(t._id), name: t.fullName, score: (sameSubject ? 3 : 0) + (sameSection ? 2 : 0) + (sameClass ? 1 : 0) - l * 0.6, sameSubject, sameSection, sameClass, load: l };
        })
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
      let suggested: string | null = null;
      if (!ex && cands[0]) { suggested = cands[0].id; bump(cands[0].id, e.periodNumber); } // later periods see this teacher as busier
      return {
        entryId: String(e._id), periodNumber: e.periodNumber, startTime: e.startTime, endTime: e.endTime,
        section: `Class ${e.classId?.gradeNumber ?? ''} ${e.sectionId?.name || ''}`.trim(), subject: e.centralSubjectId?.name || '',
        covered: ex ? { substitutionId: String(ex._id), teacherId: idStr(ex.substituteTeacherId), teacherName: ex.substituteTeacherId?.fullName || '' } : null,
        suggested, candidates: cands.slice(0, 8),
      };
    });
    return { teacher: { id: teacherId, name: teacher.fullName }, date: iso, day, periods, uncovered: periods.filter((p) => !p.covered && !p.suggested).length };
  },

  async apply(userId: string, role: string, institutionId: string, b: any) {
    const iso = String(b?.date || '');
    const plan = await this.plan(institutionId, String(b?.teacherId), iso);
    const leaveType = ['SICK', 'CASUAL', 'OFFICIAL', 'OTHER'].includes(b?.leaveType) ? b.leaveType : 'SICK';
    const reason = String(b?.reason || '').slice(0, 300);
    const chosen = new Map<string, string>();
    for (const a of Array.isArray(b?.assignments) ? b.assignments : []) if (isId(a?.timetableEntryId) && isId(a?.substituteTeacherId)) chosen.set(String(a.timetableEntryId), String(a.substituteTeacherId));
    await TeacherAbsence.updateOne({ institutionId, teacherId: b.teacherId, date: utcDay(iso) }, { $set: { leaveType, reason, recordedBy: userId, periodsAffected: plan.periods.length } }, { upsert: true });
    const done: any[] = [], skipped: any[] = [], errors: any[] = [];
    for (const p of plan.periods) {
      if (p.covered) { skipped.push({ period: p.periodNumber, section: p.section, reason: `Already covered by ${p.covered.teacherName}` }); continue; }
      const pick = chosen.get(p.entryId) || (b?.auto === false ? null : p.suggested);
      if (!pick) { errors.push({ period: p.periodNumber, section: p.section, subject: p.subject, error: 'No free teacher is available for this period.' }); continue; }
      try {
        await TimetableService.assignSubstitution({ institutionId, timetableEntryId: p.entryId, substituteTeacherId: pick, date: iso, assignedBy: userId, assignedByRole: role, reason: reason || `${plan.teacher.name} on ${leaveType.toLowerCase()} leave` });
        const name = p.candidates.find((c) => c.id === pick)?.name || '';
        done.push({ period: p.periodNumber, section: p.section, subject: p.subject, substituteId: pick, substitute: name });
        await NotificationService.sendNotification({ recipientId: pick, institutionId, type: 'SYSTEM_ALERT', title: 'Cover assigned', message: `You are covering period ${p.periodNumber} (${p.section}, ${p.subject}) on ${iso} for ${plan.teacher.name}.`, priority: 'HIGH', metadata: { date: iso, period: p.periodNumber } }).catch(() => undefined);
      } catch (e: any) {
        errors.push({ period: p.periodNumber, section: p.section, subject: p.subject, error: e?.message || 'Could not assign this period.' });
      }
    }
    const covered = plan.periods.filter((p) => p.covered).length + done.length;
    await TeacherAbsence.updateOne({ institutionId, teacherId: b.teacherId, date: utcDay(iso) }, { $set: { periodsCovered: covered } });
    await AuditService.log({ operatorId: userId, operatorRole: role, action: 'TEACHER_COVER_ARRANGED', entityType: 'User', entityId: b.teacherId, details: { date: iso, leaveType, assigned: done.length, unresolved: errors.length } });
    return { teacher: plan.teacher, date: iso, assigned: done, alreadyCovered: skipped, unresolved: errors };
  },

  /** Teachers away on a day, with how many of their periods are covered. */
  async absences(institutionId: string, iso: string) {
    if (!isoOk(iso)) throw fail(400, 'Choose a valid date.', 'INVALID_DATE');
    const rows: any[] = await TeacherAbsence.find({ institutionId, date: utcDay(iso) }).populate('teacherId', 'fullName').lean();
    return rows.map((r) => ({ id: String(r._id), teacherId: idStr(r.teacherId), teacher: r.teacherId?.fullName || '', leaveType: r.leaveType, reason: r.reason, periodsAffected: r.periodsAffected, periodsCovered: r.periodsCovered }));
  },

  /** Undo a leave: cancel its cover assignments and remove the absence record. */
  async cancel(userId: string, role: string, institutionId: string, absenceId: string) {
    const a: any = isId(absenceId) && (await TeacherAbsence.findOne({ _id: absenceId, institutionId }));
    if (!a) throw fail(404, 'Absence record not found.', 'NOT_FOUND');
    const r = await SubstituteAssignment.updateMany({ institutionId, originalTeacherId: a.teacherId, date: a.date, status: 'CONFIRMED' }, { $set: { status: 'CANCELLED' } });
    await a.deleteOne();
    await AuditService.log({ operatorId: userId, operatorRole: role, action: 'TEACHER_COVER_CANCELLED', entityType: 'User', entityId: String(a.teacherId), details: { date: a.date, cancelled: r.modifiedCount } });
    return { cancelled: r.modifiedCount };
  },
};

// ── Live Smart Board classrooms ──────────────────────────────────────────────────────────
export const LiveClassroomService = {
  async overview(institutionId: string) {
    const clock = schoolClock();
    const [sessions, pubIds]: [any[], any[]] = await Promise.all([
      ClassroomSession.find({ institutionId, status: { $in: ['ACTIVE', 'PAUSED'] } })
        .populate('teacherId', 'fullName').populate('sectionId', 'name').populate('classId', 'gradeNumber name').populate('subjectId', 'name').populate('textbookId', 'title').sort({ sessionStart: -1 }).lean() as any,
      TimetableBuilderService.publishedTimetableIds({ institutionId }),
    ]);
    const entries: any[] = await TimetableEntry.find({ timetableId: { $in: pubIds }, dayOfWeek: clock.day }).populate('teacherId', 'fullName').populate('sectionId', 'name').populate('classId', 'gradeNumber').populate('centralSubjectId', 'name').lean() as any;
    const nowEntries = entries.filter((e) => toMin(e.startTime) <= clock.minutes && clock.minutes < toMin(e.endTime));
    const liveSections = new Set(sessions.filter((s) => s.status === 'ACTIVE').map((s) => idStr(s.sectionId)));
    const liveTeachers = new Set(sessions.filter((s) => s.status === 'ACTIVE').map((s) => idStr(s.teacherId)));
    const now = Date.now();
    return {
      now: { day: clock.day, time: `${String(Math.floor(clock.minutes / 60)).padStart(2, '0')}:${String(clock.minutes % 60).padStart(2, '0')}` },
      totals: { live: sessions.filter((s) => s.status === 'ACTIVE').length, paused: sessions.filter((s) => s.status === 'PAUSED').length, scheduledNow: nowEntries.length },
      sessions: sessions.map((s) => {
        const minutes = Math.max(0, Math.round((now - +new Date(s.sessionStart)) / 60000));
        return {
          id: String(s._id), status: s.status, teacher: s.teacherId?.fullName || '', className: `Class ${s.classId?.gradeNumber ?? ''}`.trim(), section: s.sectionId?.name || '', subject: s.subjectId?.name || '',
          textbook: s.textbookId?.title || '', chapterNumber: s.chapterNumber, chapterTitle: s.chapterTitle || '', lessonTitle: s.lessonTitle || '',
          startedAt: s.sessionStart, minutes, stale: minutes > 8 * 60,
          resources: (s.resourcesUsed || []).slice(-3).map((r: any) => ({ type: r.type, name: r.name })),
        };
      }),
      scheduledNow: nowEntries.map((e) => ({
        period: e.periodNumber, time: `${e.startTime}-${e.endTime}`, section: `Class ${e.classId?.gradeNumber ?? ''} ${e.sectionId?.name || ''}`.trim(), subject: e.centralSubjectId?.name || '', teacher: e.teacherId?.fullName || '',
        usingSmartBoard: liveSections.has(idStr(e.sectionId)) || liveTeachers.has(idStr(e.teacherId)),
      })),
    };
  },
};

// ── Stamp and signature ─────────────────────────────────────────────────────────────────
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function parsePng(input: any, label: string): Buffer {
  const raw = String(input || '');
  const b64 = raw.includes(',') ? raw.slice(raw.indexOf(',') + 1) : raw;
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < 100 || !buf.subarray(0, 8).equals(PNG_SIG)) throw fail(400, `The ${label} must be a PNG image.`, 'INVALID_IMAGE');
  if (buf.length > 800 * 1024) throw fail(400, `The ${label} is larger than 800 KB. Use a smaller scan.`, 'IMAGE_TOO_LARGE');
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  if (!w || !h || w > 4000 || h > 4000) throw fail(400, `The ${label} dimensions are not valid (max 4000 px).`, 'INVALID_IMAGE');
  return buf;
}
const dataUrl = (b?: Buffer | null) => (b && b.length ? `data:image/png;base64,${Buffer.from(b as any).toString('base64')}` : null);

export const SealService = {
  async get(institutionId: string) {
    const s: any = await SchoolSeal.findOne({ institutionId }).lean();
    return { stamp: dataUrl(s?.stamp?.buffer ? Buffer.from(s.stamp.buffer) : s?.stamp), signature: dataUrl(s?.signature?.buffer ? Buffer.from(s.signature.buffer) : s?.signature), signerName: s?.signerName || '', signerTitle: s?.signerTitle || 'Principal', updatedAt: s?.updatedAt || null };
  },
  /** Raw PNG buffers for document generation. */
  async buffers(institutionId: string) {
    const s: any = await SchoolSeal.findOne({ institutionId }).lean();
    const toBuf = (x: any) => (x ? (x.buffer ? Buffer.from(x.buffer) : Buffer.from(x)) : null);
    return { stamp: toBuf(s?.stamp), signature: toBuf(s?.signature), signerName: s?.signerName || '', signerTitle: s?.signerTitle || 'Principal' };
  },
  async save(userId: string, role: string, institutionId: string, b: any) {
    const set: any = { updatedBy: userId };
    const unset: any = {};
    if (b?.stamp) set.stamp = parsePng(b.stamp, 'stamp'); else if (b?.clearStamp) unset.stamp = 1;
    if (b?.signature) set.signature = parsePng(b.signature, 'signature'); else if (b?.clearSignature) unset.signature = 1;
    if (typeof b?.signerName === 'string') set.signerName = b.signerName.trim().slice(0, 120);
    if (typeof b?.signerTitle === 'string') set.signerTitle = b.signerTitle.trim().slice(0, 80) || 'Principal';
    await SchoolSeal.updateOne({ institutionId }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { upsert: true });
    await AuditService.log({ operatorId: userId, operatorRole: role, action: 'SCHOOL_SEAL_UPDATED', entityType: 'Institution', entityId: institutionId, details: { stamp: !!b?.stamp, signature: !!b?.signature, clearStamp: !!b?.clearStamp, clearSignature: !!b?.clearSignature } });
    return this.get(institutionId);
  },
};
