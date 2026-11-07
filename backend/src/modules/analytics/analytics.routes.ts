import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';

const router = Router();

// Protect all routes with JWT and tenant isolation
router.use(authMiddleware);
router.use(tenantMiddleware);

// 1. Principal & School Administration Analytics Dashboard
router.get(
  '/principal',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  AnalyticsController.getPrincipalAnalytics
);

router.get(
  '/principal/attendance',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL'),
  AnalyticsController.getPrincipalAttendance
);

router.get(
  '/principal/curriculum-coverage',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL'),
  AnalyticsController.getPrincipalCurriculumCoverage
);

router.get(
  '/principal/evaluation-progress',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL'),
  AnalyticsController.getPrincipalEvaluationProgress
);

// 2. Class Teacher Analytics & At-Risk Support
router.get(
  '/class-teacher/:sectionId',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'),
  AnalyticsController.getClassTeacherAnalytics
);

// 3. Subject Teacher Analytics
router.get(
  '/subject-teacher',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'),
  AnalyticsController.getSubjectTeacherAnalytics
);

// 4. Syllabus Progress Tracking
router.post(
  '/syllabus/progress',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'),
  AnalyticsController.recordSyllabusProgress
);

// 5. Official Export Endpoints
router.get(
  '/export/report-card/:studentId/:examinationId',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'),
  AnalyticsController.exportReportCardPdf
);

router.get(
  '/export/results-csv/:sectionId/:examinationId',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'),
  AnalyticsController.exportClassResultsCsv
);

router.get(
  '/export/attendance-csv/:sectionId',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'),
  AnalyticsController.exportAttendanceCsv
);

export const analyticsRouter = router;
