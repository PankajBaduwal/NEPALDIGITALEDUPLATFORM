import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { ApiResponse } from '../../common/utils/response.util';
import { User, StudentEnrollment } from '../../models';
import { PrincipalNoticeService, EmergencyService, CoverService, LiveClassroomService, SealService, fail } from './principal-tools.service';
import { AnnualReportService, MarksheetService, TransferCertificateService } from './principal-documents.service';

/** Principal-only tools (also open to the school admin): emergency alerts, teacher cover, live classrooms, stamp and signature, reports and certificates. */
const router = Router();
router.use(authMiddleware, tenantMiddleware, authorize('PRINCIPAL', 'SCHOOL_ADMIN'));

const inst = (req: AuthenticatedRequest) => String(req.institutionId || req.user?.institutionId || '');
const uid = (req: AuthenticatedRequest) => req.user!.userId;
const role = (req: AuthenticatedRequest) => String(req.user!.role);
const handle = (fn: (req: AuthenticatedRequest) => Promise<any>, message: string, status = 200) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!inst(req)) throw fail(400, 'Institution context is required.', 'INSTITUTION_CONTEXT_REQUIRED');
    return ApiResponse.success(res, await fn(req), message, status);
  } catch (e) { next(e); }
};
const file = (fn: (req: AuthenticatedRequest) => Promise<{ buffer: Buffer; name: string }>) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!inst(req)) throw fail(400, 'Institution context is required.', 'INSTITUTION_CONTEXT_REQUIRED');
    const { buffer, name } = await fn(req);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${name.replace(/[^\w.-]+/g, '_')}"`);
    res.setHeader('Content-Length', String(buffer.length));
    res.end(buffer);
  } catch (e) { next(e); }
};
const q = (req: AuthenticatedRequest, k: string) => String(req.query[k] ?? '');

// Notice history (stored on the server)
router.get('/notices', handle((r) => PrincipalNoticeService.list(inst(r)), 'Notices loaded'));
router.post('/notices', handle((r) => PrincipalNoticeService.log(uid(r), inst(r), r.body), 'Notice recorded', 201));

// Emergency alerts
router.get('/emergency', handle((r) => EmergencyService.list(inst(r)), 'Alerts loaded'));
router.post('/emergency', handle((r) => EmergencyService.send(uid(r), role(r), inst(r), r.body), 'Emergency alert sent', 201));
router.post('/emergency/:id/clear', handle((r) => EmergencyService.clear(uid(r), role(r), inst(r), r.params.id, r.body), 'All-clear sent'));

// Teacher absence and cover
router.get('/teachers', handle(async (r) => (await User.find({ institutionId: inst(r), role: 'TEACHER', status: 'ACTIVE' }, 'fullName').sort({ fullName: 1 }).lean()).map((t: any) => ({ id: String(t._id), name: t.fullName })), 'Teachers loaded'));
router.get('/cover/plan', handle((r) => CoverService.plan(inst(r), q(r, 'teacherId'), q(r, 'date')), 'Cover plan ready'));
router.post('/cover/apply', handle((r) => CoverService.apply(uid(r), role(r), inst(r), r.body), 'Cover arranged'));
router.get('/cover/absences', handle((r) => CoverService.absences(inst(r), q(r, 'date')), 'Absences loaded'));
router.delete('/cover/absences/:id', handle((r) => CoverService.cancel(uid(r), role(r), inst(r), r.params.id), 'Cover cancelled'));

// Live Smart Board classrooms
router.get('/live-classrooms', handle((r) => LiveClassroomService.overview(inst(r)), 'Live classrooms loaded'));

// Stamp and signature
router.get('/seal', handle((r) => SealService.get(inst(r)), 'Seal loaded'));
router.put('/seal', handle((r) => SealService.save(uid(r), role(r), inst(r), r.body), 'Seal saved'));

// Student lookup for marksheets and certificates
router.get('/students', handle(async (r) => {
  const term = q(r, 'q').trim();
  if (term.length < 2) return [];
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 60);
  const users: any[] = await User.find({ institutionId: inst(r), role: 'STUDENT', fullName: { $regex: safe, $options: 'i' } }, 'fullName').limit(15).lean();
  const enr: any[] = await StudentEnrollment.find({ studentId: { $in: users.map((u) => u._id) }, status: 'ENROLLED' }).populate({ path: 'sectionId', populate: { path: 'classId', select: 'gradeNumber' } }).lean();
  return users.map((u) => { const e = enr.find((x) => String(x.studentId) === String(u._id)); return { id: String(u._id), name: u.fullName, className: e ? `Class ${e.sectionId?.classId?.gradeNumber ?? ''} ${e.sectionId?.name ?? ''}`.trim() : 'Not enrolled', roll: e?.rollNumber }; });
}, 'Students loaded'));

// Documents (PDF)
router.get('/reports/annual', file(async (r) => ({ buffer: await AnnualReportService.pdf(inst(r)), name: 'Annual_School_Performance_Report.pdf' })));
router.get('/marksheet/:studentId', file(async (r) => { const m = await MarksheetService.pdf(inst(r), r.params.studentId, q(r, 'examName') || undefined); return { buffer: m.buffer, name: `Marksheet_${m.student}.pdf` }; }));
router.get('/transfer-certificates', handle((r) => TransferCertificateService.list(inst(r)), 'Certificates loaded'));
router.post('/transfer-certificates/:studentId', file(async (r) => { const t = await TransferCertificateService.issue(uid(r), role(r), inst(r), r.params.studentId, r.body); return { buffer: t.pdf, name: `${t.certificateNumber}.pdf` }; }));
router.get('/transfer-certificates/:id/pdf', file(async (r) => { const t = await TransferCertificateService.pdf(inst(r), r.params.id); return { buffer: t.pdf, name: `${t.certificateNumber}.pdf` }; }));

export const principalToolsRoutes = router;
