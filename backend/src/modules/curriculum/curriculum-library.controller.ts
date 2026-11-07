import fs from 'fs';
import { Response, NextFunction } from 'express';
import { ApiResponse } from '../../common/utils/response.util';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { TokenUtil } from '../../common/utils/token.util';
import { CurriculumLibraryService } from './curriculum-library.service';
import { CurriculumService } from './curriculum.service';
import { TextbookAccessService, TeachingMedium } from './textbook-access.service';
import { NepalCurriculumSyncService } from './nepal-data/nepal-curriculum-sync.service';
import { AuditService } from '../../common/services/audit.service';

const medium = (m: any): TeachingMedium | null => (m === 'ENGLISH' || m === 'NEPALI' ? m : null);
const actor = (req: AuthenticatedRequest) => ({ userId: req.user!.userId, role: req.user!.role });

type Handler = (req: AuthenticatedRequest, res: Response) => Promise<any>;
const wrap = (fn: Handler, message: string) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await fn(req, res);
    if (!res.headersSent) return ApiResponse.success(res, data, message);
  } catch (err) {
    next(err);
  }
};

export class CurriculumLibraryController {
  static overview = wrap(() => CurriculumLibraryService.overview(), 'Curriculum library overview');
  static gradeSubjects = wrap(
    (req) => CurriculumLibraryService.gradeSubjects(Number(req.params.grade), medium(req.query.medium), req.user?.role === 'SUPER_ADMIN' && req.query.includeInactive === 'true'),
    'Subjects for class loaded'
  );
  static subjectDetail = wrap((req) => CurriculumLibraryService.subjectDetail(req.params.id), 'Subject detail loaded');
  static search = wrap(
    (req) => CurriculumLibraryService.search(String(req.query.q || ''), req.query.grade ? Number(req.query.grade) : undefined, req.query.medium as string),
    'Search results'
  );
  static updateSubject = wrap((req) => CurriculumLibraryService.updateSubject(req.params.id, req.body, actor(req)), 'Subject updated');
  static linkSubjects = wrap((req) => CurriculumLibraryService.linkSubjects(req.params.id, req.body.targetSubjectId, actor(req)), 'Subjects linked');
  static updateTextbook = wrap((req) => CurriculumLibraryService.updateTextbookMapping(req.params.id, req.body, actor(req)), 'Textbook updated');
  static replacePdf = wrap(async (req) => {
    if (!req.file) throw { status: 400, message: 'No PDF uploaded' };
    return CurriculumLibraryService.replacePdf(req.params.id, req.file, actor(req));
  }, 'Textbook PDF replaced');
  static issues = wrap(() => CurriculumLibraryService.issues(), 'Library issues');
  static referenceDocuments = wrap(() => CurriculumLibraryService.referenceDocuments(), 'Reference documents');
  static institutions = wrap(() => CurriculumLibraryService.institutionUsage(), 'Institution usage');
  static report = wrap(async (req) => CurriculumLibraryService.report(req.params.name), 'Report loaded');
  static syncStatus = wrap(async () => NepalCurriculumSyncService.extractionState, 'Sync status');
  static sync = wrap(async (req) => {
    const summary = await NepalCurriculumSyncService.syncFromSnapshot(req.user!.userId);
    await AuditService.log({ operatorId: req.user!.userId, operatorRole: req.user!.role, action: 'CURRICULUM_LIBRARY_SYNCED', entityType: 'CurriculumLibrary', details: summary });
    return summary;
  }, 'Curriculum library synced from extraction snapshot');
  static rescan = wrap(async (req) => {
    const state = await CurriculumService.scanAndIngestNepalData(req.user!.userId);
    await AuditService.log({ operatorId: req.user!.userId, operatorRole: req.user!.role, action: 'CURRICULUM_LIBRARY_RESCAN_STARTED', entityType: 'CurriculumLibrary' });
    return state;
  }, 'Nepal data re-scan started');

  static streamReferenceDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const file = await CurriculumLibraryService.streamReferenceDocument(req.params.id);
      if (!fs.existsSync(file)) return ApiResponse.error(res, 'Reference document file missing on storage', 404, 'FILE_MISSING');
      res.setHeader('Content-Type', 'application/pdf');
      fs.createReadStream(file).pipe(res);
    } catch (err) {
      next(err);
    }
  };

  /** Curriculum documents and teaching materials from Nepal data, readable by school staff. */
  static schoolReferenceMaterials = wrap(async () => {
    const docs = await CurriculumLibraryService.referenceDocuments();
    return docs
      .filter((d: any) => d.isActive !== false)
      .map((d: any) => ({
        id: String(d.id || d._id),
        title: d.title,
        documentType: d.documentType,
        gradeFrom: d.gradeFrom ?? null,
        gradeTo: d.gradeTo ?? null,
        language: d.language,
        pageCount: d.pageCount,
        sourceRelativePath: d.sourceRelativePath,
      }));
  }, 'Reference materials');

  static referenceMaterialAccess = wrap(async (req) => {
    const id = req.params.id;
    const docs = await CurriculumLibraryService.referenceDocuments();
    if (!docs.some((d: any) => String(d.id || d._id) === id)) throw { status: 404, message: 'Material not found' };
    const token = TextbookAccessService.issueAccessToken(req.user!, `ref:${id}`);
    return { url: `/api/v1/curriculum/reference-materials/${id}/pdf?access=${encodeURIComponent(token)}`, expiresIn: '2h' };
  }, 'Material access granted');

  static streamReferenceMaterial = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const access = req.query.access ? String(req.query.access) : '';
      if (!access || !TextbookAccessService.verifyAccessToken(access, `ref:${id}`)) {
        return ApiResponse.error(res, 'Access token required', 401, 'AUTH_REQUIRED');
      }
      const file = await CurriculumLibraryService.streamReferenceDocument(id);
      if (!fs.existsSync(file)) return ApiResponse.error(res, 'File missing on storage', 404, 'FILE_MISSING');
      const size = fs.statSync(file).size;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Accept-Ranges', 'bytes');
      const range = req.headers.range;
      if (range) {
        const m = /bytes=(\d*)-(\d*)/.exec(range);
        const start = m && m[1] ? parseInt(m[1], 10) : 0;
        const end = m && m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
        if (start > end || start >= size) {
          res.status(416).setHeader('Content-Range', `bytes */${size}`);
          return res.end();
        }
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
        res.setHeader('Content-Length', String(end - start + 1));
        return void fs.createReadStream(file, { start, end }).pipe(res);
      }
      res.setHeader('Content-Length', String(size));
      fs.createReadStream(file).pipe(res);
    } catch (err) {
      next(err);
    }
  };

  /** Issue a short-lived, textbook-scoped PDF URL after checking the caller's permission. */
  static textbookAccess = wrap((req) => TextbookAccessService.signedPdfUrl(req.user!, req.params.id), 'Textbook access granted');

  /**
   * PDF streaming. Accepts a textbook-scoped `access` token (iframes, Smart Board) or a
   * normal session token, in which case the same permission check runs.
   */
  static streamPdf = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { textbookId } = req.params;
      const access = req.query.access ? String(req.query.access) : '';
      if (!access || !TextbookAccessService.verifyAccessToken(access, textbookId)) {
        const header = req.headers.authorization;
        const raw = header?.startsWith('Bearer ') ? header.slice(7) : req.query.token ? String(req.query.token) : '';
        if (!raw) return ApiResponse.error(res, 'Authentication required to open textbooks', 401, 'AUTH_REQUIRED');
        let user;
        try {
          user = TokenUtil.verify(raw);
        } catch {
          return ApiResponse.error(res, 'Invalid or expired session token', 401, 'INVALID_TOKEN');
        }
        const check = await TextbookAccessService.canAccess(user, textbookId);
        if (!check.allowed) return ApiResponse.error(res, check.reason || 'Access denied', 403, 'TEXTBOOK_ACCESS_DENIED');
      }
      await CurriculumService.streamPdf(textbookId, req, res);
    } catch (err) {
      next(err);
    }
  };
}
