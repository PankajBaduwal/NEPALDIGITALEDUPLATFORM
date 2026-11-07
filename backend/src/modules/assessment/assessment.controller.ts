import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { AssessmentService } from './assessment.service';
import { ExamAssessment } from '../../models';

export class AssessmentController {
  // ── 1. ATTENDANCE ─────────────────────────────────────────────
  static async recordAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution ID required' });
        return;
      }

      const result = await AssessmentService.recordAttendanceSession({
        ...req.body,
        institutionId,
        actorRole: req.user!.role,
        takenBy: req.user!.userId,
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.status >= 400 && err.status < 600 ? err.status : 400).json({ success: false, message: err.message, error: err.message });
    }
  }

  static async listAttendanceSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(403).json({ success: false, error: 'Institution context is required.' });
        return;
      }
      const sessions = await AssessmentService.listAttendanceSessions({
        institutionId: institutionId.toString(),
        sectionId: req.query.sectionId as string,
        centralSubjectId: req.query.centralSubjectId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        actorId: req.user!.userId,
        actorRole: req.user!.role,
      });

      res.json({ success: true, data: sessions });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  }

  static async getStudentAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(403).json({ success: false, error: 'Institution context is required.' });
        return;
      }
      const requestedStudentId = req.params.studentId;
      if (req.user?.role === 'STUDENT' && requestedStudentId && requestedStudentId !== req.user.userId) {
        res.status(403).json({ success: false, error: 'Students can only view their own attendance.' });
        return;
      }
      const studentId = req.user?.role === 'STUDENT' ? req.user.userId : requestedStudentId || req.user!.userId;
      const result = await AssessmentService.getStudentAttendance(
        studentId,
        institutionId.toString(),
        req.query.sectionId as string,
        'EXCLUDE_APPROVED_LEAVE',
        req.user!.userId,
        req.user!.role
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  }

  // ── 2. EXAMINATIONS ───────────────────────────────────────────
  static async createExamination(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution ID required' });
        return;
      }

      const exam = await AssessmentService.createExamination({
        ...req.body,
        institutionId,
      });

      res.status(201).json({ success: true, data: exam });
    } catch (err: any) {
      res.status(err.status >= 400 && err.status < 600 ? err.status : 400).json({ success: false, message: err.message, error: err.message });
    }
  }

  static async listExaminations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const list = await AssessmentService.listExaminations(institutionId!);
      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async publishExamination(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId && req.user?.role !== 'SUPER_ADMIN') {
        res.status(403).json({ success: false, error: 'Institution context is required.' });
        return;
      }
      const exam = await AssessmentService.publishExamination(
        req.params.id,
        req.user!.userId,
        institutionId?.toString()
      );
      res.json({ success: true, data: exam, message: 'Examination results successfully published to students' });
    } catch (err: any) {
      res.status(err.status >= 400 && err.status < 600 ? err.status : 400).json({ success: false, message: err.message, error: err.message });
    }
  }

  // ── 3. ASSESSMENTS & MARKS ENTRY ──────────────────────────────
  static async listAssessments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const { sectionId, examinationId, centralSubjectId } = req.query;
      const query: any = { institutionId };
      if (sectionId) query.sectionId = sectionId;
      if (examinationId) query.examinationId = examinationId;
      if (centralSubjectId) query.centralSubjectId = centralSubjectId;

      const items = await ExamAssessment.find(query)
        .populate('centralSubjectId', 'name code')
        .populate('sectionId', 'name')
        .populate('examinationId', 'name code')
        .sort({ createdAt: -1 });

      res.json({ success: true, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async bulkCreateAssessments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const { assessments } = req.body;
      if (!Array.isArray(assessments)) {
        res.status(400).json({ success: false, error: 'Assessments array required' });
        return;
      }
      const created = await ExamAssessment.insertMany(
        assessments.map((a: any) => ({ ...a, institutionId }))
      );
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(err.status >= 400 && err.status < 600 ? err.status : 400).json({ success: false, message: err.message, error: err.message });
    }
  }

  static async createAssessment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const assessment = await AssessmentService.createAssessment({
        ...req.body,
        institutionId: institutionId!,
        actorId: req.user!.userId,
        actorRole: req.user!.role,
      });

      res.status(201).json({ success: true, data: assessment });
    } catch (err: any) {
      res.status(err.status >= 400 && err.status < 600 ? err.status : 400).json({ success: false, message: err.message, error: err.message });
    }
  }

  static async enterMarks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await AssessmentService.enterMarks({
        teacherId: req.user!.userId,
        userRole: req.user!.role,
        institutionId: (req.institutionId || req.user?.institutionId)?.toString(),
        assessmentId: req.params.id,
        saveAsDraft: Boolean(req.body.saveAsDraft),
        marks: req.body.marks || [],
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.status >= 400 && err.status < 600 ? err.status : 400).json({ success: false, message: err.message, error: err.message });
    }
  }

  static async transitionWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId && req.user?.role !== 'SUPER_ADMIN') {
        res.status(403).json({ success: false, error: 'Institution context is required.' });
        return;
      }
      const assessment = await AssessmentService.transitionWorkflow({
        assessmentId: req.params.id,
        institutionId: institutionId?.toString(),
        targetStatus: req.body.targetStatus,
        actorId: req.user!.userId,
        actorRole: req.user!.role,
        reason: req.body.reason,
      });

      res.json({ success: true, data: assessment });
    } catch (err: any) {
      res.status(err.status >= 400 && err.status < 600 ? err.status : 400).json({ success: false, message: err.message, error: err.message });
    }
  }

  // ── 4. CLASS TEACHER CONSOLE ──────────────────────────────────
  static async getSectionExamOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await AssessmentService.getSectionExamOverview(
        req.institutionId!.toString(),
        req.params.sectionId,
        req.query.examinationId as string,
        req.user!.userId,
        req.user!.role
      );
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getConsolidatedResults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await AssessmentService.getConsolidatedResults(
        req.institutionId!.toString(),
        req.params.sectionId,
        req.query.examinationId as string,
        req.user!.userId,
        req.user!.role
      );
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── 5. PRINCIPAL & AUDIT TRAIL ────────────────────────────────
  static async getPrincipalDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const data = await AssessmentService.getPrincipalDashboard(institutionId!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getMarksAuditTrail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const logs = await AssessmentService.getMarksAuditTrail(institutionId!, Number(req.query.limit) || 50);
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── 6. STUDENT RESULTS (PUBLISHED ONLY) ────────────────────────
  static async getStudentPublishedResults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(403).json({ success: false, error: 'Institution context is required.' });
        return;
      }
      const results = await AssessmentService.getStudentPublishedResults(studentId, institutionId.toString());
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
