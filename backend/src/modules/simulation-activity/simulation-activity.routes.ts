import { Router } from 'express';
import { SimulationActivityController } from './simulation-activity.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { requireFeatureAccess } from '../../common/middleware/feature-access.middleware';
import { FeatureKey } from '../../models/FeatureAccess';

const router = Router();

// ── Simulations ───────────────────────────────────────────────
router.get('/hierarchy', authMiddleware, SimulationActivityController.getLibraryHierarchy);
router.get('/simulations', authMiddleware, SimulationActivityController.listSimulations);
router.get('/simulations/progress/my', authMiddleware, SimulationActivityController.getAllSimulationProgress);
router.get('/simulations/:code/progress', authMiddleware, SimulationActivityController.getSimulationProgress);
router.post('/simulations/:code/progress', authMiddleware, SimulationActivityController.saveSimulationProgress);
router.get('/simulations/:id', authMiddleware, SimulationActivityController.getSimulationById);
router.post(
  '/simulations',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  SimulationActivityController.createSimulation
);
router.put(
  '/simulations/:id',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  SimulationActivityController.updateSimulation
);
router.delete(
  '/simulations/:id',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  SimulationActivityController.deleteSimulation
);
router.patch(
  '/simulations/:id/publish',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  SimulationActivityController.togglePublishSimulation
);
router.post('/simulations/:id/launch', authMiddleware, SimulationActivityController.launchSimulation);
router.post(
  '/simulations/:id/versions',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  SimulationActivityController.addSimulationVersion
);
router.post(
  '/simulations/:id/assets',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  SimulationActivityController.addSimulationAsset
);

// ── Activities ────────────────────────────────────────────────
router.get('/activities', authMiddleware, SimulationActivityController.listActivities);
router.get('/activities/:id', authMiddleware, SimulationActivityController.getActivityById);
router.post(
  '/activities',
  authMiddleware,
  authorize('SUPER_ADMIN', 'TEACHER'),
  SimulationActivityController.createActivity
);
router.put(
  '/activities/:id',
  authMiddleware,
  authorize('SUPER_ADMIN', 'TEACHER'),
  SimulationActivityController.updateActivity
);
router.delete(
  '/activities/:id',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  SimulationActivityController.deleteActivity
);
router.patch(
  '/activities/:id/publish',
  authMiddleware,
  authorize('SUPER_ADMIN', 'TEACHER'),
  SimulationActivityController.togglePublishActivity
);

// ── Activity Questions ────────────────────────────────────────
router.post(
  '/activities/:id/questions',
  authMiddleware,
  authorize('SUPER_ADMIN', 'TEACHER'),
  SimulationActivityController.addQuestion
);
router.put(
  '/questions/:id',
  authMiddleware,
  authorize('SUPER_ADMIN', 'TEACHER'),
  SimulationActivityController.updateQuestion
);
router.delete(
  '/questions/:id',
  authMiddleware,
  authorize('SUPER_ADMIN', 'TEACHER'),
  SimulationActivityController.deleteQuestion
);

// ── Assignments (Teacher & Student) ───────────────────────────
router.post(
  '/assignments',
  authMiddleware,
  tenantMiddleware,
  authorize('TEACHER', 'SCHOOL_ADMIN'),
  SimulationActivityController.createAssignment
);
router.get(
  '/assignments/teacher',
  authMiddleware,
  tenantMiddleware,
  authorize('TEACHER'),
  SimulationActivityController.listTeacherAssignments
);
router.get(
  '/assignments/student',
  authMiddleware,
  tenantMiddleware,
  authorize('STUDENT'),
  SimulationActivityController.listStudentAssignments
);
router.get(
  '/assignments/:id/analytics',
  authMiddleware,
  tenantMiddleware,
  authorize('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'),
  SimulationActivityController.getAssignmentAnalytics
);

// ── Attempts & Progress (Student) ─────────────────────────────
router.post(
  '/activities/:id/attempt',
  authMiddleware,
  tenantMiddleware,
  authorize('STUDENT'),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION),
  SimulationActivityController.submitAttempt
);
router.get(
  '/activities/:id/attempts/my',
  authMiddleware,
  authorize('STUDENT'),
  SimulationActivityController.getStudentAttempts
);
router.get(
  '/progress/my',
  authMiddleware,
  tenantMiddleware,
  authorize('STUDENT'),
  SimulationActivityController.getStudentProgress
);

export const simulationActivityRoutes = router;
