import { Response, NextFunction } from 'express';
import { AcademicService } from './academic.service';
import { ApiResponse } from '../../common/utils/response.util';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';

export class AcademicController {
  static async createYear(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const year = await AcademicService.createAcademicYear(req.institutionId!, req.body.name);
      return ApiResponse.success(res, year, 'Academic year created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async createClass(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cls = await AcademicService.createClass(req.institutionId!, parseInt(req.body.gradeNumber, 10), req.body.name);
      return ApiResponse.success(res, cls, 'Class created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async createSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const section = await AcademicService.createSection(req.body);
      return ApiResponse.success(res, section, 'Section created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async assignClassTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AcademicService.assignClassTeacher(req.params.sectionId, req.body.teacherId);
      return ApiResponse.success(res, result, 'Class teacher assigned');
    } catch (error) {
      next(error);
    }
  }

  static async assignSubject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const allocation = await AcademicService.assignSubjectTeacher(req.institutionId!, req.body, { userId: req.user!.userId, role: req.user!.role });
      return ApiResponse.success(res, allocation, 'Subject allocated to teacher', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyAllocations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const allocations = await AcademicService.getTeacherAllocations(req.user!.userId);
      return ApiResponse.success(res, allocations, 'Teacher allocations loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getMyClassTeacherSections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sections = await AcademicService.getClassTeacherSections(req.user!.userId);
      return ApiResponse.success(res, sections, 'Class teacher supervised sections loaded');
    } catch (error) {
      next(error);
    }
  }

  static async enrollStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const enrollment = await AcademicService.enrollStudent(req.institutionId!, req.body);
      return ApiResponse.success(res, enrollment, 'Student enrolled in section', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getSectionStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const students = await AcademicService.getSectionStudents(req.params.sectionId);
      return ApiResponse.success(res, students, 'Section students loaded');
    } catch (error) {
      next(error);
    }
  }

  static async recordAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const records = await AcademicService.markAttendance(req.institutionId!, req.user!.userId, req.body);
      return ApiResponse.success(res, records, 'Attendance recorded');
    } catch (error) {
      next(error);
    }
  }

  static async recordMarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const marks = await AcademicService.recordMarks(req.params.assessmentId, req.body.marks);
      return ApiResponse.success(res, marks, 'Marks recorded');
    } catch (error) {
      next(error);
    }
  }

  static async publishResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const assessment = await AcademicService.publishAssessmentResults(req.params.assessmentId, req.user!.userId);
      return ApiResponse.success(res, assessment, 'Assessment results published');
    } catch (error) {
      next(error);
    }
  }

  static async getMyResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const results = await AcademicService.getStudentResults(req.user!.userId);
      return ApiResponse.success(res, results, 'Published results loaded');
    } catch (error) {
      next(error);
    }
  }
}

