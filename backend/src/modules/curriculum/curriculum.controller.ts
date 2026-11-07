import { Request, Response, NextFunction } from 'express';
import { CurriculumService } from './curriculum.service';
import { ApiResponse } from '../../common/utils/response.util';

export class CurriculumController {
  // ── Curriculum Versions ───────────────────────────────────────
  static async listVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const versions = await CurriculumService.listCurriculumVersions();
      return ApiResponse.success(res, versions, 'Curriculum versions retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await CurriculumService.createCurriculumVersion(req.body);
      return ApiResponse.success(res, version, 'Curriculum framework version created', 201);
    } catch (error) {
      next(error);
    }
  }

  // ── Subjects ──────────────────────────────────────────────────
  static async listSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const medium = req.query.medium as string | undefined;

      const subjects = await CurriculumService.listSubjects(grade, medium);
      return ApiResponse.success(res, subjects, 'Curriculum subjects loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const subject = await CurriculumService.getSubjectById(req.params.id);
      return ApiResponse.success(res, subject, 'Subject curriculum loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getSubjectChapters(req: Request, res: Response, next: NextFunction) {
    try {
      const chapters = await CurriculumService.getSubjectChapters(req.params.id);
      return ApiResponse.success(res, chapters, 'Subject chapters loaded');
    } catch (error) {
      next(error);
    }
  }

  static async createSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const subject = await CurriculumService.createSubject(req.body);
      return ApiResponse.success(res, subject, 'Subject registered in central curriculum', 201);
    } catch (error) {
      next(error);
    }
  }

  // ── Textbooks ─────────────────────────────────────────────────
  static async listTextbooks(req: Request, res: Response, next: NextFunction) {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const medium = req.query.medium as string | undefined;
      const subjectId = req.query.subjectId as string | undefined;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 250;

      const result = await CurriculumService.listTextbooks({
        grade,
        medium,
        subjectId,
        status,
        search,
        page,
        limit,
      });

      return ApiResponse.success(res, result, 'Textbook catalog retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getTextbook(req: Request, res: Response, next: NextFunction) {
    try {
      const textbook = await CurriculumService.getTextbookDetails(req.params.id);
      return ApiResponse.success(res, textbook, 'Textbook details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async uploadTextbook(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 'No PDF file uploaded', 400);
      }

      const {
        title,
        titleNepali,
        gradeNumber,
        medium,
        subjectId,
        curriculumVersionId,
        edition,
        publicationYear,
      } = req.body;

      if (!title || !gradeNumber || !medium || !subjectId) {
        return ApiResponse.error(
          res,
          'Required fields missing: title, gradeNumber, medium, subjectId',
          400
        );
      }

      const textbook = await CurriculumService.addTextbook({
        title,
        titleNepali,
        gradeNumber: parseInt(gradeNumber, 10),
        medium: medium.toUpperCase() as 'NEPALI' | 'ENGLISH',
        subjectId,
        curriculumVersionId,
        edition,
        publicationYear: publicationYear ? parseInt(publicationYear, 10) : 2081,
        pdfPath: req.file.path,
        originalFileName: req.file.originalname,
      });

      return ApiResponse.success(res, textbook, 'Textbook uploaded and queued for processing', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTextbook(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await CurriculumService.updateTextbook(req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Textbook updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTextbook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CurriculumService.deleteTextbook(req.params.id);
      return ApiResponse.success(res, result, 'Textbook removed');
    } catch (error) {
      next(error);
    }
  }

  static async streamPdf(req: Request, res: Response, next: NextFunction) {
    try {
      await CurriculumService.streamPdf(req.params.textbookId, req, res);
    } catch (error) {
      next(error);
    }
  }

  // ── Auto-Ingestion of 141 CDC Books ───────────────────────────
  static async ingestNepalData(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await CurriculumService.scanAndIngestNepalData();
      return ApiResponse.success(res, results, 'Nepal CDC curriculum ingestion initiated');
    } catch (error) {
      next(error);
    }
  }

  // ── Chapter & Topic Management ────────────────────────────────
  static async getChapters(req: Request, res: Response, next: NextFunction) {
    try {
      const chapters = await CurriculumService.getChapters(req.params.textbookId);
      return ApiResponse.success(res, chapters, 'Textbook chapters loaded');
    } catch (error) {
      next(error);
    }
  }

  static async createChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const chapter = await CurriculumService.createChapter({
        textbookId: req.params.textbookId,
        ...req.body,
      });
      return ApiResponse.success(res, chapter, 'Chapter created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const chapter = await CurriculumService.updateChapter(req.params.chapterId, req.body);
      return ApiResponse.success(res, chapter, 'Chapter updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteChapter(req: Request, res: Response, next: NextFunction) {
    try {
      await CurriculumService.deleteChapter(req.params.chapterId);
      return ApiResponse.success(res, null, 'Chapter deleted');
    } catch (error) {
      next(error);
    }
  }

  static async createTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const topic = await CurriculumService.createTopic({
        chapterId: req.params.chapterId,
        ...req.body,
      });
      return ApiResponse.success(res, topic, 'Topic created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const topic = await CurriculumService.updateTopic(req.params.topicId, req.body);
      return ApiResponse.success(res, topic, 'Topic updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTopic(req: Request, res: Response, next: NextFunction) {
    try {
      await CurriculumService.deleteTopic(req.params.topicId);
      return ApiResponse.success(res, null, 'Topic deleted');
    } catch (error) {
      next(error);
    }
  }

  // ── Processing Jobs ───────────────────────────────────────────
  static async listProcessingJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await CurriculumService.listProcessingJobs();
      return ApiResponse.success(res, jobs, 'Content processing jobs retrieved');
    } catch (error) {
      next(error);
    }
  }

  // ── Simulations ───────────────────────────────────────────────
  static async listSimulations(req: Request, res: Response, next: NextFunction) {
    try {
      const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
      const domain = req.query.domain as string | undefined;
      const sims = await CurriculumService.listSimulations({ grade, domain });
      return ApiResponse.success(res, sims, 'Simulation catalog loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getSimulation(req: Request, res: Response, next: NextFunction) {
    try {
      const sim = await CurriculumService.getSimulationById(req.params.id);
      return ApiResponse.success(res, sim, 'Simulation details loaded');
    } catch (error) {
      next(error);
    }
  }
}
