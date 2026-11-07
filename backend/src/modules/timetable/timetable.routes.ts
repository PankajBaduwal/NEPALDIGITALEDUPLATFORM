import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { requireSchoolAcademicContext } from '../../common/middleware/school-context.middleware';
import { TimetableController as C } from './timetable.controller';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Principals and School Admins act on their own school; Super Admin only where the school allows it.
const staffRead = [authorize('SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'), requireSchoolAcademicContext({ write: false })];
const staffWrite = [authorize('SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'), requireSchoolAcademicContext({ write: true })];

// ── Configuration: working days, periods, breaks ────────────────
router.get('/periods', C.getPeriods);
router.get('/config', ...staffRead, C.getConfig);
router.put('/config', ...staffWrite, C.configureTemplate);
router.post('/template', ...staffWrite, C.configureTemplate);

// ── Versioned builder ───────────────────────────────────────────
router.get('/builder/overview', ...staffRead, C.overview);
router.get('/builder/sections/:sectionId', ...staffRead, C.builderContext);
router.post('/builder/sections/:sectionId/drafts', ...staffWrite, C.createDraft);
router.get('/builder/timetables/:id', ...staffRead, C.getTimetable);
router.put('/builder/timetables/:id/entries', ...staffWrite, C.setEntry);
router.delete('/builder/timetables/:id/entries/:entryId', ...staffWrite, C.removeDraftEntry);
router.post('/builder/timetables/:id/validate', ...staffRead, C.validate);
router.post('/builder/timetables/:id/submit', ...staffWrite, C.submit);
router.post('/builder/timetables/:id/return', ...staffWrite, C.returnToDraft);
router.post('/builder/timetables/:id/publish', ...staffWrite, C.publish);
router.post('/builder/timetables/:id/archive', ...staffWrite, C.archive);
router.get('/history', ...staffRead, C.history);

// ── Single-slot API (writes into the section draft) ─────────────
router.post('/conflicts/check', ...staffRead, C.checkConflicts);
router.post('/entries', ...staffWrite, C.assignEntry);
router.delete('/entries/:id', ...staffWrite, C.removeEntry);

// ── Substitutions ───────────────────────────────────────────────
router.post('/substitutions', ...staffWrite, C.assignSubstitution);

// ── Published views ─────────────────────────────────────────────
router.get('/teacher/:teacherId?', authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'), C.getTeacherSchedule);
router.get('/student/:sectionId', C.getStudentSchedule);
router.get('/principal/overview', ...staffRead, C.getPrincipalOverview);
router.get('/today', ...staffRead, C.getTodaySchedule);

// ── Smart Board ─────────────────────────────────────────────────
router.get('/smartboard/suggestion', authorize('TEACHER'), C.getSmartBoardSuggestion);

export const timetableRoutes = router;
