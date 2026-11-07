import { Router } from 'express';
import { ClassTeacherController } from './class-teacher.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';
import { classTeacherToolsRoutes } from './class-teacher-tools.routes';

const router = Router();

router.use(authMiddleware);
router.use(authorize(UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN));
router.use(tenantMiddleware);

router.get('/section/:sectionId/overview', authorize(UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN), ClassTeacherController.getSectionOverview);
router.get('/section/:sectionId/consolidated-results', authorize(UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN), ClassTeacherController.getConsolidatedResults);
router.post(
  '/section/:sectionId/publish-results',
  authorize(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN),
  ClassTeacherController.publishResults
);

// Absence notices and ledger exports: the designated class teacher only
router.use(classTeacherToolsRoutes);

export const classTeacherRoutes = router;
