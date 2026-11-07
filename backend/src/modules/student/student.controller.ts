import { Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import { ApiResponse } from '../../common/utils/response.util';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';

export class StudentController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await StudentService.getOverview(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'Student overview loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getSubjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await StudentService.getMySubjects(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'Student subjects, textbooks & simulations loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await StudentService.getMyAttendance(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'Personal attendance log loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await StudentService.getMyResults(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'Published exam results loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await StudentService.getMyAssignments(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'Pending assignments loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await StudentService.getMySmartBoardNotes(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'Smart Board shared notes loaded');
    } catch (err) {
      next(err);
    }
  }

  static async submitAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.params;
      const data = await StudentService.submitAssignment(
        req.user!.userId,
        req.institutionId!,
        assignmentId,
        req.body
      );
      return ApiResponse.success(res, data, 'Assignment submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getMySubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await StudentService.getMySubmissions(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'My assignment submissions loaded');
    } catch (err) {
      next(err);
    }
  }
  static async getAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await StudentService.getAnnouncements(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'School announcements loaded');
    } catch (err) {
      next(err);
    }
  }
}
