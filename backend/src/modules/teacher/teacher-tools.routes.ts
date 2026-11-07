import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { ApiResponse } from '../../common/utils/response.util';
import { TeachingDiaryService, StudentDossierService } from './teacher-tools.service';
import { assertTeacherTeachesSection } from '../../common/utils/teacher-scope.util';

/** Teaching diary and student dossier: available to every teacher, for the classes they teach. Mounted inside the teacher router (auth, role and tenant checks already applied). */
const router = Router();
const inst = (req: AuthenticatedRequest) => String(req.institutionId || req.user?.institutionId || '');
const handle = (fn: (req: AuthenticatedRequest) => Promise<any>, message: string, status = 200) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!inst(req)) throw { status: 400, message: 'Institution context is required.', code: 'INSTITUTION_CONTEXT_REQUIRED' };
    return ApiResponse.success(res, await fn(req), message, status);
  } catch (e) {
    next(e);
  }
};
const uid = (req: AuthenticatedRequest) => req.user!.userId;

router.get('/diary', handle((r) => TeachingDiaryService.list(uid(r), inst(r), r.query), 'Diary loaded'));
router.get('/diary/progress', handle((r) => TeachingDiaryService.progress(uid(r), inst(r), String(r.query.sectionId), String(r.query.centralSubjectId)), 'Progress loaded'));
router.get('/diary/chapters', handle(async (r) => { await assertTeacherTeachesSection(uid(r), inst(r), String(r.query.sectionId), String(r.query.centralSubjectId)); return TeachingDiaryService.chapters(String(r.query.sectionId), String(r.query.centralSubjectId), uid(r)); }, 'Chapters loaded'));
router.put('/diary/plan', handle((r) => TeachingDiaryService.savePlan(uid(r), inst(r), r.body), 'Course outline saved'));
router.post('/diary', handle((r) => TeachingDiaryService.create(uid(r), inst(r), r.body), 'Diary entry saved', 201));
router.put('/diary/:id', handle((r) => TeachingDiaryService.update(uid(r), r.params.id, r.body), 'Diary entry updated'));
router.delete('/diary/:id', handle((r) => TeachingDiaryService.remove(uid(r), r.params.id), 'Diary entry deleted'));
router.get('/students/:studentId/dossier', handle((r) => StudentDossierService.dossier(uid(r), inst(r), r.params.studentId, r.query.sectionId as string | undefined), 'Student dossier loaded'));

export const teacherToolsRoutes = router;
