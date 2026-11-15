import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { ApiResponse } from '../../common/utils/response.util';
import { TeacherAssistantService } from './teacher-assistant.service';

export class TeacherAssistantController {
  /**
   * Main Teacher Teaching Assistant Query Endpoint
   */
  static async ask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = {
        userId: req.user!.userId,
        role: req.user!.role,
        institutionId: req.institutionId || req.user?.institutionId,
      };

      const result = await TeacherAssistantService.ask(user, req.body);
      return ApiResponse.success(res, result, 'Teaching Assistant response generated');
    } catch (error: any) {
      if (error.status === 403 || error.code === 'TEACHER_ONLY_FEATURE') {
        return ApiResponse.error(res, error.message || 'Access restricted to teachers and administrators', 403);
      }
      next(error);
    }
  }

  /**
   * List conversations for current teacher
   */
  static async listConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const textbookId = req.query.textbookId as string | undefined;
      const list = await TeacherAssistantService.listConversations(req.user!.userId, textbookId);
      return ApiResponse.success(res, list, 'Teacher conversations retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single conversation details & messages
   */
  static async getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await TeacherAssistantService.getConversation(req.params.id, req.user!.userId);
      return ApiResponse.success(res, result, 'Conversation loaded');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archive / Delete conversation
   */
  static async archiveConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await TeacherAssistantService.archiveConversation(req.params.id, req.user!.userId);
      return ApiResponse.success(res, result, 'Conversation archived');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export content directly for Smart Board presentation or annotation
   */
  static async exportSmartBoard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, content, pageNumber, textbookId, chapterNumber } = req.body;
      const smartBoardPayload = {
        title: title || 'Teaching Assistant Notes',
        textbookId,
        pageNumber: pageNumber || 1,
        chapterNumber,
        formattedContent: content,
        generatedAt: new Date().toISOString(),
        boardUrl: `/smartboard/index.html?textbookId=${encodeURIComponent(textbookId || '')}&page=${pageNumber || 1}&title=${encodeURIComponent(title || 'Lesson Plan')}`,
      };
      return ApiResponse.success(res, smartBoardPayload, 'Smart Board export payload prepared');
    } catch (error) {
      next(error);
    }
  }
}
