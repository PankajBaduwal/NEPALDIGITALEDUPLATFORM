import { Response, NextFunction } from 'express';
import { TeacherService } from './teacher.service';
import { ApiResponse } from '../../common/utils/response.util';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';

export class TeacherController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.getOverview(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'Teacher overview loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getAssignedClasses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.getAssignedClassesAndSubjects(req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'Assigned classes and subjects loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getSubjectWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId, centralSubjectId } = req.params;
      const data = await TeacherService.getSubjectWorkspace(req.user!.userId, req.institutionId!, {
        sectionId,
        centralSubjectId,
      });
      return ApiResponse.success(res, data, 'Subject workspace loaded');
    } catch (err) {
      next(err);
    }
  }

  static async recordAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.recordSectionAttendance(req.user!.userId, req.institutionId!, req.body);
      return ApiResponse.success(res, data, 'Attendance recorded successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getAttendanceHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const date = req.query.date as string | undefined;
      const data = await TeacherService.getSectionAttendanceHistory(req.user!.userId, req.institutionId!, sectionId, date);
      return ApiResponse.success(res, data, 'Attendance history loaded');
    } catch (err) {
      next(err);
    }
  }

  static async createAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.createAssessment(req.user!.userId, req.institutionId!, req.body);
      return ApiResponse.success(res, data, 'Assessment created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getAssessments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const subjectId = req.query.centralSubjectId as string | undefined;
      const data = await TeacherService.getAssessments(req.user!.userId, req.institutionId!, sectionId, subjectId);
      return ApiResponse.success(res, data, 'Assessments loaded');
    } catch (err) {
      next(err);
    }
  }

  static async recordMarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.recordSubjectMarks(req.user!.userId, req.institutionId!, req.body);
      return ApiResponse.success(res, data, 'Marks recorded and graded successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getSyllabus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId, centralSubjectId } = req.params;
      const data = await TeacherService.getSyllabus(req.user!.userId, req.institutionId!, sectionId, centralSubjectId);
      return ApiResponse.success(res, data, 'Syllabus loaded');
    } catch (err) {
      next(err);
    }
  }

  static async saveSyllabusProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.saveSyllabusProgress(req.user!.userId, req.institutionId!, req.body);
      return ApiResponse.success(res, data, 'Syllabus progress saved');
    } catch (err) {
      next(err);
    }
  }

  static async getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.getStudentInsights(
        req.user!.userId,
        req.institutionId!,
        req.params.sectionId,
        (req.query.centralSubjectId as string) || undefined
      );
      return ApiResponse.success(res, data, 'Student insights loaded');
    } catch (err) {
      next(err);
    }
  }

  static async addRemark(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.addRemark(req.user!.userId, req.institutionId!, req.body);
      return ApiResponse.success(res, data, 'Saved', 201);
    } catch (err) {
      next(err);
    }
  }

  static async listRemarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.listRemarks(req.user!.userId, req.institutionId!, req.params.sectionId, (req.query.studentId as string) || undefined);
      return ApiResponse.success(res, data, 'Remarks loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getMarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.params;
      const data = await TeacherService.getAssessmentMarks(assessmentId, req.user!.userId, req.institutionId!);
      return ApiResponse.success(res, data, 'Assessment marks loaded');
    } catch (err) {
      next(err);
    }
  }

  static async createAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await TeacherService.createAssignment(req.user!.userId, req.institutionId!, req.body);
      return ApiResponse.success(res, data, 'Assignment posted successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const subjectId = req.query.centralSubjectId as string | undefined;
      const data = await TeacherService.getAssignments(req.user!.userId, sectionId, subjectId);
      return ApiResponse.success(res, data, 'Assignments loaded');
    } catch (err) {
      next(err);
    }
  }

  static async getSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.params;
      const data = await TeacherService.getAssignmentSubmissions(req.user!.userId, assignmentId, req.institutionId!);
      return ApiResponse.success(res, data, 'Assignment submissions loaded');
    } catch (err) {
      next(err);
    }
  }

  static async gradeSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { submissionId } = req.params;
      const { marksObtained, feedback } = req.body;
      const data = await TeacherService.gradeAssignmentSubmission(
        req.user!.userId,
        submissionId,
        marksObtained,
        feedback,
        req.institutionId!
      );
      return ApiResponse.success(res, data, 'Submission graded successfully');
    } catch (err) {
      next(err);
    }
  }
}

