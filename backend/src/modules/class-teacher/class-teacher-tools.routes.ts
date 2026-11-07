import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { ApiResponse } from '../../common/utils/response.util';
import { UserRole } from '../../common/constants/roles';
import { AbsenceNoticeService, LedgerExportService } from './class-teacher-tools.service';

/** Class-teacher-only tools. A user who is not the designated class teacher of the section is refused (403). */
const router = Router();
router.use(authorize(UserRole.TEACHER));
const inst = (req: AuthenticatedRequest) => String(req.institutionId || req.user?.institutionId || '');
const uid = (req: AuthenticatedRequest) => req.user!.userId;
const handle = (fn: (req: AuthenticatedRequest) => Promise<any>, message: string, status = 200) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!inst(req)) throw { status: 400, message: 'Institution context is required.', code: 'INSTITUTION_CONTEXT_REQUIRED' };
    return ApiResponse.success(res, await fn(req), message, status);
  } catch (e) {
    next(e);
  }
};

router.get('/section/:sectionId/absentees', handle((r) => AbsenceNoticeService.absentees(uid(r), inst(r), r.params.sectionId, String(r.query.date || new Date().toISOString().slice(0, 10))), 'Absent students loaded'));
router.post('/section/:sectionId/absence-notices', handle((r) => AbsenceNoticeService.send(uid(r), inst(r), r.params.sectionId, r.body), 'Absence notices processed', 201));
router.get('/section/:sectionId/absence-notices', handle((r) => AbsenceNoticeService.history(uid(r), inst(r), r.params.sectionId), 'Notice history loaded'));

router.get('/section/:sectionId/export', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!inst(req)) throw { status: 400, message: 'Institution context is required.', code: 'INSTITUTION_CONTEXT_REQUIRED' };
    const type = req.query.type === 'cas' ? 'cas' : 'terminal';
    const format = req.query.format === 'pdf' ? 'pdf' : 'xlsx';
    const ledger = await LedgerExportService.build(uid(req), inst(req), req.params.sectionId, type, req.query.examName as string | undefined);
    const buf = format === 'pdf' ? await LedgerExportService.toPdf(ledger) : await LedgerExportService.toXlsx(ledger);
    const safe = `${type === 'cas' ? 'CAS-ledger' : 'terminal-marks'}-${ledger.classLine}`.replace(/[^A-Za-z0-9]+/g, '-').toLowerCase();
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safe}.${format}"`);
    res.send(buf);
  } catch (e) {
    next(e);
  }
});

export const classTeacherToolsRoutes = router;
