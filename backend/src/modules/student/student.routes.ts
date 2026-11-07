import { Router } from 'express';
import { StudentController } from './student.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';
import { requireFeatureAccess } from '../../common/middleware/feature-access.middleware';
import { FeatureKey } from '../../models/FeatureAccess';

const router = Router();

router.use(authMiddleware);
router.use(authorize(UserRole.STUDENT, UserRole.SUPER_ADMIN));
router.use(tenantMiddleware);
router.use(requireFeatureAccess(FeatureKey.STUDENT_DASHBOARD));

router.get('/overview', StudentController.getOverview);
router.get('/subjects', StudentController.getSubjects);
router.get('/attendance', StudentController.getAttendance);
router.get('/results', StudentController.getResults);
router.get('/assignments', StudentController.getAssignments);
router.get('/assignments/submissions', StudentController.getMySubmissions);
router.get('/notes', StudentController.getNotes);
router.get('/announcements', StudentController.getAnnouncements);

export const studentRoutes = router;
