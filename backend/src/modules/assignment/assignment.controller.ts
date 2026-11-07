import { assertTeacherTeachesSection } from '../../common/utils/teacher-scope.util';
import { RagGenerationService, GenerationAvailability } from '../rag/generation.service';
import fs from 'fs';
import path from 'path';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { AssignmentService } from './assignment.service';
import { AIAssignmentService } from './ai-assignment.service';
import { FeatureAccessService } from '../feature-access/feature-access.service';
import { FeatureKey } from '../../models/FeatureAccess';
import { trackAiUsage } from '../rag/usage.service';

export class AssignmentController {
  static async downloadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filename = req.params.filename;
      const institutionId = req.institutionId || req.user?.institutionId;
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!institutionId || !userId || !role || path.basename(filename) !== filename || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
        res.status(404).json({ success: false, error: 'Assignment file not found.' });
        return;
      }

      const fileUrl = `/uploads/assignments/${filename}`;
      const hasAccess = await AssignmentService.canDownloadFile(
        institutionId.toString(),
        userId,
        String(role),
        fileUrl
      );
      if (!hasAccess) {
        res.status(404).json({ success: false, error: 'Assignment file not found.' });
        return;
      }

      const uploadRoot = path.resolve(process.cwd(), 'uploads', 'assignments');
      const filePath = path.resolve(uploadRoot, filename);
      if (!filePath.startsWith(`${uploadRoot}${path.sep}`) || !fs.existsSync(filePath)) {
        res.status(404).json({ success: false, error: 'Assignment file not found.' });
        return;
      }

      res.download(filePath, filename, (error) => {
        if (error && !res.headersSent) {
          res.status(404).json({ success: false, error: 'Assignment file could not be downloaded.' });
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Assignment file download failed.' });
    }
  }

  /**
   * POST /api/assignments
   * Create assignment (manual)
   */
  static async createAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const teacherId = req.user!.userId;

      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution context missing.' });
        return;
      }

      // Parse JSON fields if passed via FormData
      const parseJsonIfString = (val: any) => {
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch { return val; }
        }
        return val;
      };

      let attachments: string[] = parseJsonIfString(req.body.attachments) || [];
      let attachedDocuments = parseJsonIfString(req.body.attachedDocuments) || [];

      if (req.file) {
        const fileUrl = `/uploads/assignments/${req.file.filename}`;
        attachments.push(fileUrl);
        attachedDocuments.push({
          name: req.file.originalname,
          size: req.file.size,
          url: fileUrl,
          mimeType: req.file.mimetype,
        });
      }

      const questions = parseJsonIfString(req.body.questions) || [];
      const rubric = parseJsonIfString(req.body.rubric) || [];
      const curriculumUnits = parseJsonIfString(req.body.curriculumUnits) || [];
      const submissionSettings = parseJsonIfString(req.body.submissionSettings);
      const evaluationRules = parseJsonIfString(req.body.evaluationRules);
      const copyDetectionSettings = parseJsonIfString(req.body.copyDetectionSettings);
      const autoCheckingSettings = parseJsonIfString(req.body.autoCheckingSettings);
      const aiGenerationMetadata = parseJsonIfString(req.body.aiGenerationMetadata);

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

      const assignment = await AssignmentService.createAssignment({
        ...req.body,
        classId: verifiedClassId,
        attachments,
        attachedDocuments,
        questions,
        rubric,
        curriculumUnits,
        submissionSettings,
        evaluationRules,
        copyDetectionSettings,
        autoCheckingSettings,
        aiGenerationMetadata,
        institutionId: institutionId.toString(),
        teacherId,
      });

      res.status(201).json({ success: true, data: assignment, message: 'Assignment created successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/assignments/generate-ai
   * AI Assignment generation draft
   */
  static async generateAIAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = { userId: req.user!.userId, role: req.user!.role, institutionId: req.institutionId || req.user?.institutionId };
      const grounded = await GenerationAvailability.available(req.body?.centralSubjectId);
      const draft = grounded
        ? await trackAiUsage({ userId: user.userId, institutionId: user.institutionId as any, role: user.role, feature: 'ASSIGNMENT_GENERATION' }, () => RagGenerationService.assignment(user, req.body), () => ({ grounded: true }))
        : { ...(await AIAssignmentService.generateAssignmentDraft(req.body)), antiHallucinationVerified: false, groundingSource: 'Template draft — textbook not indexed for this subject yet; review carefully.' };
      res.json({ success: true, data: draft, message: 'AI assignment draft generated for teacher review.' });
    } catch (err: any) {
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 400;
      const msg = /gemini|api key|quota/i.test(String(err.message)) ? 'The AI service is busy or its daily limit was reached. Please try again later.' : err.message;
      res.status(status).json({ success: false, error: msg });
    }
  }

  /**
   * PUT /api/assignments/:id
   * Update assignment
   */
  static async updateAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const assignmentId = req.params.id;
      const updates = { ...req.body };
      const jsonFields = [
        'attachments',
        'attachedDocuments',
        'questions',
        'rubric',
        'curriculumUnits',
        'submissionSettings',
        'evaluationRules',
        'copyDetectionSettings',
        'autoCheckingSettings',
        'aiGenerationMetadata',
      ];
      for (const field of jsonFields) {
        if (typeof updates[field] === 'string') {
          updates[field] = JSON.parse(updates[field]);
        }
      }

      if (req.file) {
        const fileUrl = `/uploads/assignments/${req.file.filename}`;
        updates.attachments = [...(Array.isArray(updates.attachments) ? updates.attachments : []), fileUrl];
        updates.attachedDocuments = [
          ...(Array.isArray(updates.attachedDocuments) ? updates.attachedDocuments : []),
          {
            name: req.file.originalname,
            size: req.file.size,
            url: fileUrl,
            mimeType: req.file.mimetype,
          },
        ];
      }

      const assignment = await AssignmentService.updateAssignment(assignmentId, teacherId, updates);
      res.json({ success: true, data: assignment, message: 'Assignment updated successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/assignments/institution
   * Principal & School Admin lists all institutional assignments
   */
  static async getInstitutionalAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution context missing.' });
        return;
      }
      const { classId, sectionId, centralSubjectId, teacherId, status } = req.query;

      const result = await AssignmentService.getInstitutionalAssignments(institutionId.toString(), {
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
   * GET /api/assignments/teacher
   * Teacher lists assignments
   */
  static async getTeacherAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const teacherId = req.user!.userId;
      const { sectionId, centralSubjectId } = req.query;

      const list = await AssignmentService.getTeacherAssignments(
        institutionId!.toString(),
        teacherId,
        sectionId as string,
        centralSubjectId as string
      );

      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/assignments/student
   * Student lists assignments
   */
  static async getStudentAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const studentId = req.user!.userId;
      let { sectionId } = req.query;

      if (req.user?.role === 'STUDENT') {
        const context = await FeatureAccessService.resolveFeatureAccess({
          institutionId: institutionId!.toString(),
          studentId,
          featureKey: FeatureKey.ASSIGNMENTS,
        });
        sectionId = context.sectionId;
      }

      if (!sectionId) {
        res.json({ success: true, data: [] });
        return;
      }

      const list = await AssignmentService.getStudentAssignments(
        institutionId!.toString(),
        studentId,
        sectionId as string
      );

      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/assignments/:id
   * Get single assignment
   */
  static async getAssignmentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution context missing.' });
        return;
      }
      const assignment = await AssignmentService.getAssignmentById(
        req.params.id,
        institutionId.toString(),
        req.user!.userId,
        String(req.user!.role)
      );
      res.json({ success: true, data: assignment });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/assignments/:id/submit
   * Student submits assignment (text or file upload)
   */
  static async submitAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      const studentId = req.user!.userId;
      const institutionId = req.institutionId || req.user?.institutionId;

      let fileUrl = req.body.fileUrl;
      let originalFilename = req.body.originalFilename;
      let fileSizeBytes = req.body.fileSizeBytes;

      if (req.file) {
        fileUrl = `/uploads/assignments/${req.file.filename}`;
        originalFilename = req.file.originalname;
        fileSizeBytes = req.file.size;
      }

      let submittedFiles = req.body.submittedFiles;
      if (typeof submittedFiles === 'string') {
        try { submittedFiles = JSON.parse(submittedFiles); } catch {}
      }

      const submission = await AssignmentService.submitAssignment(
        assignmentId,
        studentId,
        institutionId!.toString(),
        {
          content: req.body.content,
          textAnswers: req.body.textAnswers || req.body.content,
          fileUrl,
          originalFilename,
          fileSizeBytes,
          submittedFiles: Array.isArray(submittedFiles) ? submittedFiles : undefined,
        }
      );

      // Never expose the plagiarism report (it names other students) to the submitting student
      const safe: any = (submission as any).toObject ? (submission as any).toObject() : { ...submission };
      delete safe.similarityReport;
      res.status(201).json({ success: true, data: safe, message: 'Assignment submitted successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/assignments/:id/submissions
   * Teacher lists student submissions
   */
  static async getSubmissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const assignmentId = req.params.id;
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution context missing.' });
        return;
      }

      const submissions = await AssignmentService.getSubmissionsForAssignment(
        assignmentId,
        req.user!.userId,
        institutionId.toString(),
        String(req.user!.role)
      );
      res.json({ success: true, data: submissions });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/assignments/submissions/:id/auto-check
   * Run AI / automated grading analysis on submission
   */
  static async autoCheckSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const submissionId = req.params.id;
      const userId = req.user!.userId;
      const institutionId = (req.institutionId || req.user?.institutionId)?.toString();
      const role = String(req.user!.role);

      const result = await AssignmentService.autoCheckSubmission(
        submissionId,
        userId,
        institutionId,
        role
      );

      res.json({ success: true, data: result, message: 'Automated evaluation completed successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * PATCH /api/assignments/submissions/:id/grade
   * Teacher evaluates submission
   */
  static async gradeSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const submissionId = req.params.id;
      const teacherId = req.user!.userId;
      const { marksObtained, feedback, rubricScores, ocrCorrectedText } = req.body;

      if (marksObtained === undefined || marksObtained === null) {
        res.status(400).json({ success: false, error: 'marksObtained is required.' });
        return;
      }

      let parsedRubricScores = rubricScores;
      if (typeof parsedRubricScores === 'string') {
        try { parsedRubricScores = JSON.parse(parsedRubricScores); } catch {}
      }

      const submission = await AssignmentService.gradeSubmission(submissionId, teacherId, {
        marksObtained: Number(marksObtained),
        feedback,
        rubricScores: Array.isArray(parsedRubricScores) ? parsedRubricScores : undefined,
        ocrCorrectedText,
      }, (req.institutionId || req.user?.institutionId)?.toString(), String(req.user!.role));

      res.json({ success: true, data: submission, message: 'Submission evaluated and graded successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
