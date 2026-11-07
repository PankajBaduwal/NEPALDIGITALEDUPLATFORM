import { assertTeacherTeachesSection } from '../../common/utils/teacher-scope.util';
import { RagGenerationService, GenerationAvailability } from '../rag/generation.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { QuizService } from './quiz.service';
import { AIQuizService } from './ai-quiz.service';
import { Section } from '../../models';
import { FeatureAccessService } from '../feature-access/feature-access.service';
import { FeatureKey } from '../../models/FeatureAccess';
import { trackAiUsage } from '../rag/usage.service';

export class QuizController {
  /** GET /api/quizzes/:id/review - written answers waiting for the teacher */
  static async getReviewQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await QuizService.getReviewQueue(req.params.id, req.user!.userId, String(req.institutionId || req.user?.institutionId));
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message, error: err.message });
    }
  }

  /** POST /api/quizzes/:id/review - award marks for one written answer */
  static async reviewAnswer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await QuizService.reviewAnswer(req.params.id, req.user!.userId, String(req.institutionId || req.user?.institutionId), req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message, error: err.message });
    }
  }

  /**
   * POST /api/quizzes
   * Teacher creates a new quiz (DRAFT)
   */
  static async createQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const teacherId = req.user!.userId;

      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution context missing.' });
        return;
      }

      let verifiedClassId = req.body.classId;
      if (req.user!.role === 'TEACHER') {
        try {
          const scope = await assertTeacherTeachesSection(teacherId, institutionId.toString(), req.body.sectionId, req.body.centralSubjectId);
          verifiedClassId = scope.classId;
        } catch (e: any) {
          res.status(e.status || 403).json({ success: false, message: e.message, error: e.message });
          return;
        }
      }

      const quiz = await QuizService.createQuiz({
        ...req.body,
        classId: verifiedClassId,
        institutionId: institutionId.toString(),
        teacherId,
      });

      res.status(201).json({ success: true, data: quiz, message: 'Quiz draft created successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/quizzes/generate-ai
   * Teacher requests AI quiz generation draft
   */
  static async generateAIQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution context missing.' });
        return;
      }

      const user = { userId: req.user!.userId, role: req.user!.role, institutionId: institutionId.toString() };
      const grounded = await GenerationAvailability.available(req.body?.centralSubjectId);
      const result = grounded
        ? await trackAiUsage({ userId: user.userId, institutionId: user.institutionId, role: user.role, feature: 'QUIZ_GENERATION' }, () => RagGenerationService.quiz(user, req.body), () => ({ grounded: true }))
        : { ...(await AIQuizService.generateQuizQuestions({ ...req.body, institutionId: institutionId.toString() })), antiHallucinationVerified: false, groundingSource: 'Template draft — textbook not indexed for this subject yet; review carefully.' };

      res.json({ success: true, data: result, message: 'AI quiz draft generated for review.' });
    } catch (err: any) {
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 400;
      const msg = /gemini|api key|quota/i.test(String(err.message)) ? 'The AI service is busy or its daily limit was reached. Please try again later.' : err.message;
      res.status(status).json({ success: false, error: msg });
    }
  }

  /**
   * PUT /api/quizzes/:id
   * Teacher updates an existing quiz
   */
  static async updateQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const quizId = req.params.id;

      const quiz = await QuizService.updateQuiz(quizId, teacherId, req.body);
      res.json({ success: true, data: quiz, message: 'Quiz updated successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * PATCH /api/quizzes/:id/publish
   * Teacher publishes a quiz
   */
  static async publishQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const quizId = req.params.id;

      const quiz = await QuizService.publishQuiz(quizId, teacherId);
      res.json({ success: true, data: quiz, message: 'Quiz published and visible to students.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/quizzes/institution
   * Principal & School Admin lists all institutional quizzes
   */
  static async getInstitutionalQuizzes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution context missing.' });
        return;
      }
      const { classId, sectionId, centralSubjectId, teacherId, status } = req.query;

      const result = await QuizService.getInstitutionalQuizzes(institutionId.toString(), {
        classId: classId as string,
        sectionId: sectionId as string,
        centralSubjectId: centralSubjectId as string,
        teacherId: teacherId as string,
        status: status as string,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/quizzes/teacher
   * List all quizzes created by this teacher
   */
  static async getTeacherQuizzes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const teacherId = req.user!.userId;
      const { sectionId, centralSubjectId } = req.query;

      const quizzes = await QuizService.getTeacherQuizzes(
        institutionId!.toString(),
        teacherId,
        sectionId as string,
        centralSubjectId as string
      );

      res.json({ success: true, data: quizzes });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/quizzes/student
   * List published quizzes for the student
   */
  static async getStudentQuizzes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const studentId = req.user!.userId;
      let { classId, sectionId } = req.query;

      if (req.user?.role === 'STUDENT') {
        const context = await FeatureAccessService.resolveFeatureAccess({
          institutionId: institutionId!.toString(),
          studentId,
          featureKey: FeatureKey.QUIZZES,
        });
        classId = context.classId;
        sectionId = context.sectionId;
      } else if (!classId || !sectionId) {
        const sec = sectionId ? await Section.findById(sectionId).select('classId').lean() : null;
        if (sec?.classId) classId = sec.classId.toString();
      }

      if (!classId || !sectionId) {
        res.json({ success: true, data: [] });
        return;
      }

      const quizzes = await QuizService.getStudentQuizzes(
        institutionId!.toString(),
        studentId,
        classId as string,
        sectionId as string
      );

      res.json({ success: true, data: quizzes });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/quizzes/:id
   * Get quiz details
   */
  static async getQuizById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const quizId = req.params.id;
      const userRole = req.user!.role;
      const userId = req.user!.userId;
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution context missing.' });
        return;
      }

      const quiz = await QuizService.getQuizById(
        quizId,
        institutionId.toString(),
        String(userRole),
        userId
      );
      res.json({ success: true, data: quiz });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/quizzes/:id/attempt
   * Student submits quiz attempt
   */
  static async submitQuizAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const quizId = req.params.id;
      const studentId = req.user!.userId;
      const institutionId = req.institutionId || req.user?.institutionId;
      const { answers, timeSpentSeconds, warningsCount, securityEvents, isAutoSubmitted } = req.body;

      if (!Array.isArray(answers)) {
        res.status(400).json({ success: false, error: 'answers must be an array.' });
        return;
      }

      const attempt = await QuizService.submitQuizAttempt(
        quizId,
        studentId,
        institutionId!.toString(),
        answers,
        timeSpentSeconds || 0,
        {
          warningsCount,
          securityEvents,
          isAutoSubmitted,
        }
      );

      res.status(201).json({ success: true, data: attempt, message: 'Quiz submitted successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/quizzes/:id/analytics
   * Teacher views quiz analytics
   */
  static async getQuizAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const quizId = req.params.id;
      const teacherId = req.user!.userId;

      const analytics = await QuizService.getQuizAnalytics(quizId, teacherId);
      res.json({ success: true, data: analytics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
