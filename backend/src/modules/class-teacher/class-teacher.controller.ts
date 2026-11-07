import { Response, NextFunction } from 'express';
import { ClassTeacherService } from './class-teacher.service';
import { ApiResponse } from '../../common/utils/response.util';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';

export class ClassTeacherController {
  static async getSectionOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const institutionId = req.institutionId || req.user?.institutionId;
      const data = await ClassTeacherService.getSectionOverview(req.user!.userId, sectionId, institutionId!.toString(), req.user?.role);
      return ApiResponse.success(res, data, 'Class Teacher section overview loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getConsolidatedResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const institutionId = req.institutionId || req.user?.institutionId;
      const examName = req.query.examName as string | undefined;
      const data = await ClassTeacherService.getConsolidatedResults(req.user!.userId, sectionId, institutionId!.toString(), examName, req.user?.role);
      return ApiResponse.success(res, data, 'Consolidated section marksheet loaded');
    } catch (err) {
      next(err);
    }
  }

  static async publishResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const { assessmentIds } = req.body;
      const institutionId = req.institutionId || req.user?.institutionId;
      const data = await ClassTeacherService.publishSectionResults(
        req.user!.userId,
        sectionId,
        assessmentIds,
        institutionId!.toString(),
        req.user!.role
      );
      return ApiResponse.success(res, data, 'Section exam results published to students');
    } catch (err) {
      next(err);
    }
  }
}
