import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { AnalyticsService } from './analytics.service';
import { User } from '../../models';

export class AnalyticsController {
  /**
   * GET /api/v1/analytics/principal/curriculum-coverage
   */
  static async getPrincipalCurriculumCoverage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) return res.status(400).json({ success: false, message: 'Institution ID is required' });
      const data = await AnalyticsService.getPrincipalCurriculumCoverage(institutionId);
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/principal/evaluation-progress
   */
  static async getPrincipalEvaluationProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) return res.status(400).json({ success: false, message: 'Institution ID is required' });
      const data = await AnalyticsService.getPrincipalEvaluationProgress(institutionId);
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/principal/attendance
   */
  static async getPrincipalAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, message: 'Institution ID is required' });
      }
      const data = await AnalyticsService.getPrincipalAttendanceOverview(institutionId);
      return res.json({ success: true, data, message: 'Attendance overview retrieved successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/principal
   */
  static async getPrincipalAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || (req.headers['x-institution-id'] as string);
      const academicYearId = req.query.academicYearId as string;
      const classId = req.query.classId as string;
      const sectionId = req.query.sectionId as string;
      const examinationId = req.query.examinationId as string;

      if (!institutionId) {
        return res.status(400).json({ success: false, message: 'Institution ID is required' });
      }

      const analytics = await AnalyticsService.getPrincipalAnalytics(institutionId, {
        academicYearId,
        classId,
        sectionId,
        examinationId,
      });
      return res.json({ success: true, data: analytics, message: 'Principal academic analytics retrieved successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/class-teacher/:sectionId
   */
  static async getClassTeacherAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const examinationId = req.query.examinationId as string;
      const analytics = await AnalyticsService.getClassTeacherAnalytics(sectionId, examinationId);
      return res.json({ success: true, data: analytics, message: 'Class Teacher section analytics retrieved successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/subject-teacher
   */
  static async getSubjectTeacherAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user?.userId;
      if (!teacherId) {
        return res.status(401).json({ success: false, message: 'Teacher authentication required' });
      }
      const sectionId = req.query.sectionId as string;
      const centralSubjectId = req.query.centralSubjectId as string;

      const analytics = await AnalyticsService.getSubjectTeacherAnalytics(teacherId, sectionId, centralSubjectId);
      return res.json({ success: true, data: analytics, message: 'Subject Teacher analytics retrieved successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/analytics/syllabus/progress
   */
  static async recordSyllabusProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || (req.headers['x-institution-id'] as string);
      const teacherId = req.user?.userId;
      if (!institutionId || !teacherId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      if (req.user?.role === 'TEACHER') {
        return res.status(403).json({ success: false, message: 'Teachers must save syllabus progress through /teacher/syllabus' });
      }

      const doc = await AnalyticsService.recordSyllabusProgress({
        institutionId,
        teacherId,
        ...req.body,
      });

      return res.json({ success: true, data: doc, message: 'Syllabus progress updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/export/report-card/:studentId/:examinationId
   */
  static async exportReportCardPdf(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { studentId, examinationId } = req.params;
      const role = req.user?.role;

      // Access control: students may only download their own report card (published marks only);
      // staff may only download for students of their own institution.
      if (role === 'STUDENT') {
        if (String(req.user?.userId) !== String(studentId)) {
          return res.status(403).json({ success: false, message: 'You can only download your own report card' });
        }
      } else if (role !== 'SUPER_ADMIN') {
        if (!['SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL', 'TEACHER'].includes(role || '')) {
          return res.status(403).json({ success: false, message: 'Not authorized to download report cards' });
        }
        const target = await User.findById(studentId, 'institutionId role').lean();
        if (!target || String(target.institutionId) !== String(req.user?.institutionId)) {
          return res.status(404).json({ success: false, message: 'Student not found' });
        }
      }

      const pdfBuffer = await AnalyticsService.exportReportCardPdf(studentId, examinationId, { publishedOnly: role === 'STUDENT' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="NepalCDC_ReportCard_${studentId}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/export/results-csv/:sectionId/:examinationId
   */
  static async exportClassResultsCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId, examinationId } = req.params;
      const csvData = await AnalyticsService.exportClassResultsCsv(sectionId, examinationId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ClassResults_${sectionId}.csv"`);
      return res.status(200).send(csvData);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/export/attendance-csv/:sectionId
   */
  static async exportAttendanceCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const csvData = await AnalyticsService.exportAttendanceCsv(sectionId, startDate, endDate);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="AttendanceReport_${sectionId}.csv"`);
      return res.status(200).send(csvData);
    } catch (err) {
      next(err);
    }
  }
}
