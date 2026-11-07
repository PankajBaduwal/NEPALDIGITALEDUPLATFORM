import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { AssessmentController } from './assessment.controller';

const router = Router();

// Apply Auth and Tenant Isolation across all assessment routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// ── Attendance ──────────────────────────────────────────────────
router.post(
  '/attendance',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.recordAttendance
);
router.get(
  '/attendance',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.listAttendanceSessions
);
router.get(
  '/attendance/student/:studentId?',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'STUDENT'),
  AssessmentController.getStudentAttendance
);

// ── Examinations ────────────────────────────────────────────────
router.post(
  '/examinations',
  authorize('SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.createExamination
);
router.get(
  '/examinations',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.listExaminations
);
router.patch(
  '/examinations/:id/publish',
  authorize('SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.publishExamination
);

// ── Assessments & Marks ─────────────────────────────────────────
router.post(
  '/bulk-create',
  authorize('SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'COLLEGE_ADMIN'),
  AssessmentController.bulkCreateAssessments
);
router.get(
  '/items',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'COLLEGE_ADMIN'),
  AssessmentController.listAssessments
);
router.post(
  '/items',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN', 'COLLEGE_ADMIN'),
  AssessmentController.createAssessment
);
router.post(
  '/items/:id/marks',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.enterMarks
);
router.patch(
  '/items/:id/workflow',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.transitionWorkflow
);

// ── Class Teacher Console ───────────────────────────────────────
router.get(
  '/section/:sectionId/overview',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.getSectionExamOverview
);
router.get(
  '/section/:sectionId/consolidated',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.getConsolidatedResults
);

// ── Principal Monitoring & Audit ────────────────────────────────
router.get(
  '/principal/dashboard',
  authorize('SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.getPrincipalDashboard
);
router.get(
  '/audit-trail',
  authorize('SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssessmentController.getMarksAuditTrail
);

// ── Student Portal (Published Only) ─────────────────────────────
router.get('/student/results', authorize('STUDENT'), AssessmentController.getStudentPublishedResults);

export const assessmentRoutes = router;
