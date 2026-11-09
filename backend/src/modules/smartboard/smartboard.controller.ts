import { Response, NextFunction } from 'express';
import { SmartBoardService } from './smartboard.service';
import { ApiResponse } from '../../common/utils/response.util';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';

function getInstId(req: AuthenticatedRequest): string {
  const id = req.institutionId || req.user?.institutionId;
  if (!id) {
    throw { status: 400, message: 'Institution context missing' };
  }
  return String(id);
}

export class SmartBoardController {
  /**
   * Who is using the board and what is being taught — drives the board header
   * (teacher name, school, subject, class and section). Every id is optional.
   */
  static async getHeaderContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { Types } = await import('mongoose');
      const { User, Institution, CentralSubject, Section, Class } = await import('../../models');
      const valid = (v: any) => typeof v === 'string' && Types.ObjectId.isValid(v);
      const subjectId = req.query.subjectId as string | undefined;
      const sectionId = req.query.sectionId as string | undefined;
      const instId = req.institutionId || req.user?.institutionId;

      const [user, institution, subject, section] = await Promise.all([
        User.findById(req.user!.userId).select('fullName fullNameNepali role').lean() as any,
        instId && valid(String(instId)) ? (Institution.findById(String(instId)).select('name nameNepali logoUrl').lean() as any) : null,
        valid(subjectId) ? (CentralSubject.findById(subjectId).select('name nameNepali code gradeNumber').lean() as any) : null,
        valid(sectionId) ? (Section.findById(sectionId).select('name classId').lean() as any) : null,
      ]);
      const cls: any = section?.classId ? await Class.findById(section.classId).select('name gradeNumber').lean() : null;
      const grade = cls?.gradeNumber ?? subject?.gradeNumber ?? null;

      return ApiResponse.success(
        res,
        {
          teacher: user ? { fullName: user.fullName, fullNameNepali: user.fullNameNepali || '', role: user.role } : null,
          institution: institution ? { name: institution.name, nameNepali: institution.nameNepali || '', logoUrl: institution.logoUrl || '' } : null,
          subject: subject ? { name: subject.name, nameNepali: subject.nameNepali || '', code: subject.code || '', gradeNumber: subject.gradeNumber } : null,
          class: grade ? { gradeNumber: grade, name: cls?.name || `Class ${grade}` } : null,
          section: section ? { name: section.name } : null,
        },
        'Smart Board context'
      );
    } catch (error) {
      next(error);
    }
  }

  // ── Classroom Sessions ────────────────────────────────────────
  static async startSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user!.userId;
      const institutionId = getInstId(req);

      const {
        classId,
        sectionId,
        subjectId,
        textbookId,
        chapterNumber,
        chapterTitle,
        lessonTitle,
        initialResourceType,
        initialResourceName,
        initialResourceUrl,
      } = req.body;

      if (!classId || !sectionId || !subjectId) {
        return ApiResponse.error(res, 'Class, section, and subject are required to launch Smart Board', 400);
      }

      const result = await SmartBoardService.startClassroomSession({
        institutionId,
        teacherId,
        classId,
        sectionId,
        subjectId,
        textbookId,
        chapterNumber: chapterNumber ? parseInt(chapterNumber, 10) : undefined,
        chapterTitle,
        lessonTitle,
        initialResourceType,
        initialResourceName,
        initialResourceUrl,
      });

      return ApiResponse.success(res, result, 'Classroom session initialized and launcher generated', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = getInstId(req);
      const updated = await SmartBoardService.updateClassroomSession(
        req.params.id,
        institutionId,
        req.body
      );
      return ApiResponse.success(res, updated, 'Classroom session updated');
    } catch (error) {
      next(error);
    }
  }

  static async endSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = getInstId(req);
      const ended = await SmartBoardService.endClassroomSession(
        req.params.id,
        institutionId,
        req.body
      );
      return ApiResponse.success(res, ended, 'Classroom session ended successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getActiveSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user!.userId;
      const institutionId = getInstId(req);
      const active = await SmartBoardService.getActiveClassroomSession(teacherId, institutionId);
      return ApiResponse.success(res, active, 'Active classroom session retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = getInstId(req);
      const teacherId = req.query.teacherId as string | undefined;
      const classId = req.query.classId as string | undefined;
      const subjectId = req.query.subjectId as string | undefined;

      const sessions = await SmartBoardService.listClassroomSessions(institutionId, teacherId, {
        classId,
        subjectId,
      });
      return ApiResponse.success(res, sessions, 'Classroom sessions history retrieved');
    } catch (error) {
      next(error);
    }
  }

  // ── Annotations ───────────────────────────────────────────────
  static async saveAnnotation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user!.userId;
      const institutionId = getInstId(req);

      const {
        classId,
        sectionId,
        subjectId,
        textbookId,
        pageNumber,
        title,
        annotationData,
        drawDataUrl,
        boardState,
        isSharedWithStudents,
      } = req.body;

      if (!annotationData) {
        return ApiResponse.error(res, 'Annotation drawing data is required', 400);
      }

      const annotation = await SmartBoardService.saveAnnotationSession({
        institutionId,
        teacherId,
        classId,
        sectionId,
        subjectId,
        textbookId,
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : 1,
        title: title || 'Smart Board Annotation',
        annotationData,
        drawDataUrl,
        boardState,
        isSharedWithStudents,
      });

      return ApiResponse.success(res, annotation, 'Annotations saved to school cloud', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listAnnotations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = getInstId(req);
      const textbookId = req.query.textbookId as string | undefined;
      const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber as string, 10) : undefined;
      const subjectId = req.query.subjectId as string | undefined;
      const teacherId = req.query.teacherId as string | undefined;

      const notes = await SmartBoardService.listAnnotationSessions({
        institutionId,
        teacherId,
        textbookId,
        pageNumber,
        subjectId,
      });

      return ApiResponse.success(res, notes, 'Annotation sessions retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getAnnotation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = getInstId(req);
      const note = await SmartBoardService.getAnnotationSessionById(req.params.id, institutionId);
      return ApiResponse.success(res, note, 'Annotation session retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async deleteAnnotation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user!.userId;
      const institutionId = getInstId(req);
      const result = await SmartBoardService.deleteAnnotationSession(
        req.params.id,
        institutionId,
        teacherId
      );
      return ApiResponse.success(res, result, 'Annotation removed');
    } catch (error) {
      next(error);
    }
  }

  // ── Activities & Simulations ──────────────────────────────────
  static async listActivities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const subjectId = req.query.subjectId as string | undefined;
      const type = req.query.type as string | undefined;

      const activities = await SmartBoardService.listActivities({ grade, subjectId, type });
      return ApiResponse.success(res, activities, 'Interactive activities catalog loaded');
    } catch (error) {
      next(error);
    }
  }

  static async listSimulations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const domain = req.query.domain as string | undefined;

      const sims = await SmartBoardService.listSimulations({ grade, domain });
      return ApiResponse.success(res, sims, 'Interactive simulations loaded');
    } catch (error) {
      next(error);
    }
  }

  // ── Legacy Compatibility (rbac-bridge.js & access-guard.js) ───
  static async getContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subjectId = req.params.id;
      const sectionId = (req.query.sectionId as string) || (req.query.section as string);
      const userId = req.user?.userId;

      if (!userId) {
        return ApiResponse.error(res, 'User identity required', 401, 'AUTH_REQUIRED');
      }

      const context = await SmartBoardService.getSmartboardContext(subjectId, userId, sectionId);
      return res.status(200).json({
        success: true,
        data: context,
        ...context,
      });
    } catch (error) {
      next(error);
    }
  }

  static async shareNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = getInstId(req);
      const note = await SmartBoardService.shareBoardNotes({
        ...req.body,
        teacherId: req.user!.userId,
        institutionId,
        isSuperAdmin: req.user?.role === 'SUPER_ADMIN',
      });
      return ApiResponse.success(res, note, 'Notes shared');
    } catch (error) {
      next(error);
    }
  }

  static async getSimulationEntitlements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, {
        authenticated: true,
        bands: ['GRADES_1_8', 'GRADES_9_12', 'ENGINEERING', 'SCIENCE', 'MATHEMATICS'],
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkSimulationAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, {
        simulationId: req.params.id,
        hasAccess: true,
        licenseType: 'INSTITUTION_ACTIVE',
      });
    } catch (error) {
      next(error);
    }
  }
}
