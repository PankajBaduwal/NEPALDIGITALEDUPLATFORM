import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { SimulationActivityService } from './simulation-activity.service';
import { StudentEnrollment } from '../../models';

/** For students, class/section always come from their own enrollment, never from the client. */
async function studentPlacement(studentId: string): Promise<{ classId: string; sectionId: string } | null> {
  const enrollment: any = await StudentEnrollment.findOne({ studentId, status: 'ENROLLED' }).populate('sectionId', 'classId');
  if (!enrollment?.sectionId) return null;
  return { sectionId: String(enrollment.sectionId._id), classId: String(enrollment.sectionId.classId) };
}

function getInstId(req: AuthenticatedRequest): string {
  const instId = req.institutionId || req.user?.institutionId;
  if (!instId) {
    throw new Error('Tenant context missing: institutionId required');
  }
  return String(instId);
}


const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * What a student may see of a question: everything needed to answer it, but never the answer key.
 * Scoring happens on the server against the stored data, so nothing here is needed for grading.
 */
function sanitizeQuestionForStudent(q: any): any {
  const plain = q.toJSON ? q.toJSON() : { ...q };
  const data: any = { ...(plain.data || {}) };
  switch (plain.type) {
    case 'MCQ':
    case 'TRUE_FALSE':
      data.options = (data.options || []).map(({ isCorrect, ...rest }: any) => rest);
      break;
    case 'MATCHING': {
      // Keep the left items in order but deal the right-hand texts out in a shuffled order,
      // so the pairs no longer reveal which text belongs to which item.
      const pairs: any[] = data.pairs || [];
      const rights = shuffle(pairs.map((p) => p.right));
      data.pairs = pairs.map((p, i) => ({ id: p.id, left: p.left, right: rights[i] }));
      break;
    }
    case 'DRAG_DROP':
      data.items = (data.items || []).map(({ correctCategory, ...rest }: any) => rest);
      break;
    case 'FILL_BLANKS':
      data.blanks = (data.blanks || []).map(({ acceptedAnswers, ...rest }: any) => rest);
      break;
    case 'DIAGRAM_LABELING': {
      const hotspots: any[] = data.hotspots || [];
      data.labelOptions = shuffle(hotspots.map((h) => h.label));
      data.hotspots = hotspots.map(({ label, ...rest }: any) => rest);
      break;
    }
    case 'NUMERICAL':
      delete data.correctValue;
      delete data.tolerance;
      break;
    case 'ORDERING':
      data.items = shuffle((data.items || []).map(({ correctOrder, ...rest }: any) => rest));
      break;
  }
  return { ...plain, data, explanation: undefined };
}

export class SimulationActivityController {
  // ── Simulations ───────────────────────────────────────────────
  static async listSimulations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const subjectCode = req.query.subjectCode as string | undefined;
      const chapterNumber = req.query.chapterNumber ? parseInt(req.query.chapterNumber as string, 10) : undefined;
      const language = req.query.language as string | undefined;
      const search = req.query.search as string | undefined;
      const simulationType = req.query.simulationType as string | undefined;
      // Only the platform administrator may see unpublished items; everyone else always gets published ones.
      // "all" (used by the admin library) means no filter, it is not the same as "false".
      const isPublished =
        req.user?.role !== 'SUPER_ADMIN'
          ? true
          : req.query.isPublished === undefined || req.query.isPublished === 'all'
            ? undefined
            : req.query.isPublished === 'true';

      const items = await SimulationActivityService.listSimulations({
        grade,
        subjectCode,
        chapterNumber,
        language,
        search,
        simulationType,
        isPublished,
      });

      res.json({ success: true, count: items.length, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getLibraryHierarchy(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const hierarchy = await SimulationActivityService.getLibraryHierarchy();
      res.json({ success: true, data: hierarchy });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async saveSimulationProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userRole = (req.user?.role || 'TEACHER') as any;
      const instId = req.institutionId || req.user?.institutionId;
      const code = req.params.code;

      const progress = await SimulationActivityService.recordSimulationProgress({
        userId,
        studentId: userRole === 'STUDENT' ? userId : undefined,
        institutionId: instId,
        userRole,
        simulationCode: code,
        ...req.body,
      });

      res.json({ success: true, data: progress });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getSimulationProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const code = req.params.code;
      const progress = await SimulationActivityService.getSimulationProgress(userId, code);
      res.json({ success: true, data: progress });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getAllSimulationProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const progressList = await SimulationActivityService.getAllSimulationProgress(userId);
      res.json({ success: true, data: progressList });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getSimulationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sim = await SimulationActivityService.getSimulationById(req.params.id);
      if (!sim) {
        res.status(404).json({ success: false, error: 'Simulation not found' });
        return;
      }
      res.json({ success: true, data: sim });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async createSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sim = await SimulationActivityService.createSimulation({
        ...req.body,
        createdBy: req.user?.userId,
      });
      res.status(201).json({ success: true, data: sim });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updateSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sim = await SimulationActivityService.updateSimulation(req.params.id, req.body);
      if (!sim) {
        res.status(404).json({ success: false, error: 'Simulation not found' });
        return;
      }
      res.json({ success: true, data: sim });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await SimulationActivityService.deleteSimulation(req.params.id);
      res.json({ success: true, message: 'Simulation deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async togglePublishSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { isPublished } = req.body;
      const sim = await SimulationActivityService.togglePublishSimulation(req.params.id, isPublished);
      res.json({ success: true, data: sim });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async launchSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sim = await SimulationActivityService.recordLaunch(req.params.id);
      res.json({ success: true, data: sim });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async addSimulationVersion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ver = await SimulationActivityService.addSimulationVersion(req.params.id, req.body);
      res.status(201).json({ success: true, data: ver });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async addSimulationAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const asset = await SimulationActivityService.addSimulationAsset(req.params.id, req.body);
      res.status(201).json({ success: true, data: asset });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // ── Activities ────────────────────────────────────────────────
  static async listActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const subjectCode = req.query.subjectCode as string | undefined;
      const type = req.query.type as string | undefined;
      const search = req.query.search as string | undefined;
      // Only the platform administrator may see unpublished items; everyone else always gets published ones.
      // "all" (used by the admin library) means no filter, it is not the same as "false".
      const isPublished =
        req.user?.role !== 'SUPER_ADMIN'
          ? true
          : req.query.isPublished === undefined || req.query.isPublished === 'all'
            ? undefined
            : req.query.isPublished === 'true';

      const items = await SimulationActivityService.listActivities({
        grade,
        subjectCode,
        type,
        search,
        isPublished,
      });

      res.json({ success: true, count: items.length, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getActivityById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const act: any = await SimulationActivityService.getActivityById(req.params.id);
      if (!act) {
        res.status(404).json({ success: false, error: 'Activity not found' });
        return;
      }
      if (req.user?.role === 'STUDENT') {
        if (act.isPublished === false) {
          res.status(404).json({ success: false, error: 'Activity not found' });
          return;
        }
        // Explanations are revealed in the attempt review, not up front
        act.questions = (act.questions || []).map(sanitizeQuestionForStudent);
      }
      res.json({ success: true, data: act });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async createActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { questions, ...activityData } = req.body;
      const act = await SimulationActivityService.createActivity(
        {
          ...activityData,
          createdBy: req.user?.userId,
        },
        questions
      );
      res.status(201).json({ success: true, data: act });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updateActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const act = await SimulationActivityService.updateActivity(req.params.id, req.body);
      if (!act) {
        res.status(404).json({ success: false, error: 'Activity not found' });
        return;
      }
      res.json({ success: true, data: act });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await SimulationActivityService.deleteActivity(req.params.id);
      res.json({ success: true, message: 'Activity deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async togglePublishActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { isPublished } = req.body;
      const act = await SimulationActivityService.togglePublishActivity(req.params.id, isPublished);
      res.json({ success: true, data: act });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async addQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const q = await SimulationActivityService.addQuestion(req.params.id, req.body);
      res.status(201).json({ success: true, data: q });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updateQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const q = await SimulationActivityService.updateQuestion(req.params.id, req.body);
      res.json({ success: true, data: q });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await SimulationActivityService.deleteQuestion(req.params.id);
      res.json({ success: true, message: 'Question deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── Assignments (Teacher) ─────────────────────────────────────
  static async createAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instId = getInstId(req);
      const asgn = await SimulationActivityService.createAssignment(req.user!.userId, instId, req.body);
      res.status(201).json({ success: true, data: asgn });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async listTeacherAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instId = getInstId(req);
      const items = await SimulationActivityService.listTeacherAssignments(req.user!.userId, instId);
      res.json({ success: true, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async listStudentAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instId = getInstId(req);
      let classId = req.query.classId as string;
      let sectionId = req.query.sectionId as string;

      if (req.user?.role === 'STUDENT') {
        const placement = await studentPlacement(req.user.userId);
        if (!placement) {
          res.json({ success: true, data: [] });
          return;
        }
        classId = placement.classId;
        sectionId = placement.sectionId;
      }

      if (!classId || !sectionId) {
        res.status(400).json({ success: false, error: 'classId and sectionId required' });
        return;
      }

      const items = await SimulationActivityService.listStudentAssignments(instId, classId, sectionId);
      res.json({ success: true, data: items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getAssignmentAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instId = getInstId(req);
      const stats = await SimulationActivityService.getAssignmentAnalytics(req.params.id, instId);
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── Attempts & Progress (Student) ─────────────────────────────
  static async submitAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instId = getInstId(req);
      const studentId = req.user!.userId;
      const studentName = req.user?.username || 'Student';
      let { classId, sectionId } = req.body;
      const { assignmentId, answers, timeSpentSeconds } = req.body;

      if (req.user?.role === 'STUDENT') {
        const placement = await studentPlacement(studentId);
        if (!placement) {
          res.status(403).json({ success: false, error: 'You are not enrolled in a class' });
          return;
        }
        classId = placement.classId;
        sectionId = placement.sectionId;
      }

      if (!classId || !sectionId) {
        res.status(400).json({ success: false, error: 'classId and sectionId are required' });
        return;
      }

      const attempt = await SimulationActivityService.submitAttempt({
        studentId,
        studentName,
        institutionId: instId,
        classId,
        sectionId,
        activityId: req.params.id,
        assignmentId,
        answers: answers || [],
        timeSpentSeconds: timeSpentSeconds || 0,
      });

      res.status(201).json({ success: true, data: attempt });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getStudentAttempts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const attempts = await SimulationActivityService.getStudentAttempts(studentId, req.params.id);
      res.json({ success: true, data: attempts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getStudentProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instId = getInstId(req);
      const studentId = req.user!.userId;
      const progress = await SimulationActivityService.getStudentProgress(studentId, instId);
      res.json({ success: true, data: progress });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
