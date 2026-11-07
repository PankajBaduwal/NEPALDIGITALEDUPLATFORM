import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { AIService } from './ai.service';
import { FeatureAccessService } from '../feature-access/feature-access.service';
import { FeatureKey } from '../../models/FeatureAccess';
import { CentralSubject } from '../../models';
import mongoose from 'mongoose';
import { GeminiService } from '../rag/gemini.service';
import { SmartBoardVisionService } from '../rag/smartboard-vision.service';
import { trackAiUsage } from '../rag/usage.service';

/** The UI sends a CentralSubject ObjectId; the RAG index filters by subject code and grade. */
async function normalizeSubject(subject?: string, grade?: number): Promise<{ subjectCode?: string; grade?: number }> {
  if (subject && mongoose.isValidObjectId(subject)) {
    const doc: any = await CentralSubject.findById(subject, 'code gradeNumber').lean();
    if (doc) return { subjectCode: doc.code, grade: grade ?? doc.gradeNumber };
  }
  return { subjectCode: subject || undefined, grade };
}

async function studentAiBlocked(institutionId: string | undefined, role: string): Promise<boolean> {
  if (!institutionId || role !== 'STUDENT') return false;
  const resolution = await FeatureAccessService.resolveFeatureAccess({
    institutionId: institutionId.toString(),
    featureKey: FeatureKey.AI_STUDENT_ACCESS,
  });
  return !resolution.effectiveEnabled;
}

export class AIController {
  static async scope(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await AIService.getScope({ userId: req.user!.userId, role: req.user!.role, institutionId: req.institutionId || req.user?.institutionId });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.status || 400).json({ success: false, error: err.message });
    }
  }

  static async archive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await AIService.archiveConversation(req.user!.userId, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  /**
   * Main RAG Chat query endpoint
   */
  static async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const institutionId = req.institutionId || req.user?.institutionId || undefined;
      const userRole = req.user!.role;
      if (!['STUDENT', 'TEACHER', 'SUPER_ADMIN'].includes(userRole)) {
        res.status(403).json({ success: false, error: 'The AI textbook assistant is available to students and teachers.' });
        return;
      }

      if (institutionId && userRole === 'STUDENT') {
        const resolution = await FeatureAccessService.resolveFeatureAccess({
          institutionId: institutionId.toString(),
          featureKey: FeatureKey.AI_STUDENT_ACCESS,
        });

        if (!resolution.effectiveEnabled) {
          res.status(403).json({
            success: false,
            error: {
              code: 'STUDENT_AI_ACCESS_DISABLED',
              message: 'Student AI Assistant access is disabled by your school administrator.',
            },
          });
          return;
        }
      }

      const norm = await normalizeSubject(req.body?.subjectCode, req.body?.grade);
      const result = await AIService.chat(userId, institutionId, userRole, { ...req.body, ...norm });
      res.json({ success: true, data: result });
    } catch (err: any) {
      // Never leak provider details or keys to the browser
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 400;
      const msg = /gemini|api key|quota/i.test(String(err.message)) && !/Daily AI/.test(String(err.message)) ? 'The AI service is busy or unavailable. Please try again shortly.' : err.message;
      res.status(status === 429 ? 429 : status).json({ success: false, error: msg });
    }
  }

  /**
   * List user's conversations
   */
  static async listConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const items = await AIService.listConversations(req.user!.userId);
      res.json({ success: true, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get all messages for a conversation
   */
  static async getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await AIService.getConversationMessages(req.user!.userId, req.params.id);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  /**
   * Submit feedback (thumbs up / down)
   */
  static async submitFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const feedback = await AIService.submitFeedback({
        messageId: req.body.messageId,
        userId: req.user!.userId,
        institutionId: req.institutionId || req.user?.institutionId || undefined,
        rating: req.body.rating,
        comment: req.body.comment,
      });
      res.json({ success: true, data: feedback });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Get token and query usage stats
   */
  static async getUsage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user?.role === 'STUDENT') {
        res.status(403).json({ success: false, message: 'Not authorized to view AI usage' });
        return;
      }
      const institutionId = req.institutionId || req.user?.institutionId || undefined;
      const stats = await AIService.getUsageStats(institutionId);
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Legacy query endpoint kept for backwards compatibility with earlier client calls
   */
  static async query(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user ? req.user.userId : 'anonymous';
      const institutionId = req.institutionId || req.user?.institutionId || undefined;
      const userRole = req.user ? req.user.role : 'STUDENT';
      const { question, subjectId, chapter, topic } = req.body;

      // Smart Board requests (board selection + optional image) use the vision + textbook RAG path
      if (req.body?.boardContext && req.user && ['TEACHER', 'SUPER_ADMIN'].includes(userRole) && GeminiService.isConfigured()) {
        const boardUser = { userId: req.user.userId, role: userRole, institutionId };
        const result = await trackAiUsage({ userId: boardUser.userId, institutionId: institutionId?.toString(), role: userRole, feature: 'SMARTBOARD_VISION' }, () => SmartBoardVisionService.analyze(boardUser, req.body), (r: any) => ({ grounded: r.courseMaterialStatus === 'FOUND' || r.courseMaterialStatus === 'PARTIAL' }));
        res.json({ success: true, data: result });
        return;
      }

      if (await studentAiBlocked(institutionId?.toString(), userRole)) {
        res.status(403).json({
          success: false,
          message: 'Student AI Assistant access is disabled by your school administrator.',
          error: { code: 'STUDENT_AI_ACCESS_DISABLED', message: 'Student AI Assistant access is disabled by your school administrator.' },
        });
        return;
      }

      const norm = await normalizeSubject(subjectId, req.body?.grade);
      const result = await AIService.chat(userId, institutionId, userRole, {
        query: question || 'Explain concept',
        ...norm,
        chapterNumber: typeof chapter === 'number' ? chapter : undefined,
        chapterTitle: typeof chapter === 'string' ? chapter : topic,
        mode: userRole === 'TEACHER' ? 'TEACHER_LESSON_PLAN' : 'STUDENT_TUTOR',
      });

      res.json({
        success: true,
        data: {
          answer: result.content,
          explanation: result.citations && result.citations[0] ? result.citations[0].excerpt : '',
          citations: result.citations,
          suggestedQuestions: result.suggestedQuestions,
        },
      });
    } catch (err: any) {
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 400;
      const msg = /gemini|api key|quota/i.test(String(err.message)) ? 'The AI service is busy or its daily limit was reached. Please try again later.' : err.message;
      res.status(status).json({ success: false, error: msg, message: msg });
    }
  }
}
