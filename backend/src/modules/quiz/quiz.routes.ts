import { Router } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { requireFeatureAccess } from '../../common/middleware/feature-access.middleware';
import { FeatureKey } from '../../models/FeatureAccess';
import { QuizController } from './quiz.controller';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Teacher quiz management
router.post(
  '/',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.QUIZZES),
  requireFeatureAccess(FeatureKey.QUIZZES_TEACHER_CREATE),
  QuizController.createQuiz
);
router.post(
  '/generate-ai',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.QUIZZES),
  requireFeatureAccess(FeatureKey.QUIZZES_TEACHER_CREATE),
  QuizController.generateAIQuiz
);
router.get(
  '/institution',
  authorize('SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  QuizController.getInstitutionalQuizzes
);
router.get(
  '/teacher',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  QuizController.getTeacherQuizzes
);
router.put(
  '/:id',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.QUIZZES, { resource: 'quiz' }),
  requireFeatureAccess(FeatureKey.QUIZZES_TEACHER_CREATE, { resource: 'quiz' }),
  QuizController.updateQuiz
);
router.patch(
  '/:id/publish',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.QUIZZES, { resource: 'quiz' }),
  requireFeatureAccess(FeatureKey.QUIZZES_TEACHER_CREATE, { resource: 'quiz' }),
  QuizController.publishQuiz
);
router.get(
  '/:id/analytics',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  QuizController.getQuizAnalytics
);

// Student quiz portal
router.get(
  '/:id/review',
  authorize('TEACHER'),
  QuizController.getReviewQueue
);
router.post(
  '/:id/review',
  authorize('TEACHER'),
  QuizController.reviewAnswer
);
router.get(
  '/student',
  authorize('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.QUIZZES),
  requireFeatureAccess(FeatureKey.QUIZZES_ONLINE_ACCESS),
  QuizController.getStudentQuizzes
);
router.get(
  '/:id',
  authorize('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.QUIZZES, { resource: 'quiz' }),
  // "Online access" is the student-facing switch; teachers must still be able to open their own quizzes to edit them
  (req: any, res: any, next: any) =>
    req.user?.role === 'STUDENT'
      ? requireFeatureAccess(FeatureKey.QUIZZES_ONLINE_ACCESS, { resource: 'quiz' })(req, res, next)
      : next(),
  QuizController.getQuizById
);
router.post(
  '/:id/attempt',
  authorize('STUDENT'),
  requireFeatureAccess(FeatureKey.QUIZZES, { resource: 'quiz' }),
  requireFeatureAccess(FeatureKey.QUIZZES_ONLINE_ACCESS, { resource: 'quiz' }),
  QuizController.submitQuizAttempt
);

export const quizRoutes = router;
