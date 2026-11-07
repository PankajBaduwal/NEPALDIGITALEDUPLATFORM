import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CurriculumController } from './curriculum.controller';
import { CurriculumLibraryController as Lib } from './curriculum-library.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads/textbooks');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration for textbook PDFs
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${sanitized}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB for textbooks
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported for textbooks'));
    }
  },
});

// ── Curriculum Framework Versions ─────────────────────────────
router.get('/versions', CurriculumController.listVersions);
router.post(
  '/versions',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.createVersion
);

// ── Central Subjects ──────────────────────────────────────────
router.get('/subjects', CurriculumController.listSubjects);
router.get('/subjects/:id/chapters', CurriculumController.getSubjectChapters);
router.get('/subjects/:id', CurriculumController.getSubject);
router.post(
  '/subjects',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.createSubject
);

// ── Digital Textbook Library ──────────────────────────────────
router.get('/textbooks', CurriculumController.listTextbooks);
router.get('/textbooks/:id', CurriculumController.getTextbook);

// Super Admin Textbook Management
router.post(
  '/textbooks',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  upload.single('pdf'),
  CurriculumController.uploadTextbook
);
router.put(
  '/textbooks/:id',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.updateTextbook
);
router.delete(
  '/textbooks/:id',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.deleteTextbook
);

// Auto-Ingest 141 Official CDC Textbooks from 'Nepal data/'
router.post(
  '/ingest-nepal-data',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.ingestNepalData
);

// PDF Streaming with Byte-Range seeking support.
// Requires a session token with permission for the textbook, or a textbook-scoped access token.
router.post('/textbooks/:id/access', authMiddleware, Lib.textbookAccess);
router.get('/textbooks/:textbookId/pdf', Lib.streamPdf);

// ── Nepal Curriculum & Textbook Library ───────────────────────
const SA = authorize('SUPER_ADMIN');
const SCHOOL_READERS = authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER');

// Curriculum documents + teaching materials (Nepal data/Curriculum (T), Teaching Materials)
router.get('/reference-materials', authMiddleware, SCHOOL_READERS, Lib.schoolReferenceMaterials);
router.post('/reference-materials/:id/access', authMiddleware, SCHOOL_READERS, Lib.referenceMaterialAccess);
router.get('/reference-materials/:id/pdf', Lib.streamReferenceMaterial);
router.get('/library/overview', authMiddleware, SA, Lib.overview);
router.get('/library/grades/:grade/subjects', authMiddleware, SCHOOL_READERS, Lib.gradeSubjects);
router.get('/library/subjects/:id', authMiddleware, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), Lib.subjectDetail);
router.get('/library/search', authMiddleware, SA, Lib.search);
router.patch('/library/subjects/:id', authMiddleware, SA, Lib.updateSubject);
router.post('/library/subjects/:id/link', authMiddleware, SA, Lib.linkSubjects);
router.patch('/library/textbooks/:id', authMiddleware, SA, Lib.updateTextbook);
router.post('/library/textbooks/:id/replace-pdf', authMiddleware, SA, upload.single('pdf'), Lib.replacePdf);
router.get('/library/issues', authMiddleware, SA, Lib.issues);
router.get('/library/reference-documents', authMiddleware, SA, Lib.referenceDocuments);
router.get('/library/reference-documents/:id/pdf', authMiddleware, SA, Lib.streamReferenceDocument);
router.get('/library/institutions', authMiddleware, SA, Lib.institutions);
router.get('/library/reports/:name', authMiddleware, SA, Lib.report);
router.get('/library/sync-status', authMiddleware, SA, Lib.syncStatus);
router.post('/library/sync', authMiddleware, SA, Lib.sync);
router.post('/library/rescan', authMiddleware, SA, Lib.rescan);

// ── Chapter & Topic Management ────────────────────────────────
router.get('/textbooks/:textbookId/chapters', CurriculumController.getChapters);
router.post(
  '/textbooks/:textbookId/chapters',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.createChapter
);
router.put(
  '/chapters/:chapterId',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.updateChapter
);
router.delete(
  '/chapters/:chapterId',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.deleteChapter
);

router.post(
  '/chapters/:chapterId/topics',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.createTopic
);
router.put(
  '/topics/:topicId',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.updateTopic
);
router.delete(
  '/topics/:topicId',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.deleteTopic
);

// ── Content Processing Jobs ───────────────────────────────────
router.get(
  '/jobs',
  authMiddleware,
  authorize('SUPER_ADMIN'),
  CurriculumController.listProcessingJobs
);

// ── Simulation Catalog ────────────────────────────────────────
router.get('/simulations', CurriculumController.listSimulations);
router.get('/simulations/:id', CurriculumController.getSimulation);

export const curriculumRoutes = router;
