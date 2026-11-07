import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { requireSchoolAcademicContext } from '../../common/middleware/school-context.middleware';
import { AcademicPlanningController as C } from './academic-planning.controller';

const router = Router();
router.use(authMiddleware, tenantMiddleware);

const read = [authorize('PRINCIPAL', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), requireSchoolAcademicContext({ write: false })];
const write = [authorize('PRINCIPAL', 'SCHOOL_ADMIN', 'SUPER_ADMIN'), requireSchoolAcademicContext({ write: true })];

router.get('/structure', ...read, C.structure);
router.get('/explorer', ...read, C.explorer);
router.patch('/sections/:sectionId/medium', ...write, C.setSectionMedium);
router.put('/sections/:sectionId/subjects', ...write, C.setSectionSubjects);
router.get('/allocations', ...read, C.listAllocations);
router.post('/allocations', ...write, C.allocate);
router.delete('/allocations/:id', ...write, C.removeAllocation);
router.get('/workload', ...read, C.workload);

export const academicPlanningRoutes = router;
