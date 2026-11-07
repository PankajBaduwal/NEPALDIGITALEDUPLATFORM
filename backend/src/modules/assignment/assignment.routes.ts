import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { requireFeatureAccess } from '../../common/middleware/feature-access.middleware';
import { FeatureKey } from '../../models/FeatureAccess';
import { AssignmentController } from './assignment.controller';

const router = Router();

// Multer storage for assignment files
const uploadDir = path.resolve(process.cwd(), 'uploads/assignments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get(
  '/files/:filename',
  authorize('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssignmentController.downloadFile
);

// Teacher assignment management
router.post(
  '/',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  upload.single('file'),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS_CREATION),
  AssignmentController.createAssignment
);
router.post(
  '/generate-ai',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS_CREATION),
  AssignmentController.generateAIAssignment
);
router.get(
  '/institution',
  authorize('SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssignmentController.getInstitutionalAssignments
);
router.get(
  '/teacher',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssignmentController.getTeacherAssignments
);
router.put(
  '/:id',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  upload.single('file'),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS, { resource: 'assignment' }),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS_CREATION, { resource: 'assignment' }),
  AssignmentController.updateAssignment
);
router.get(
  '/:id/submissions',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS, { resource: 'assignment' }),
  AssignmentController.getSubmissions
);
router.post(
  '/submissions/:id/auto-check',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssignmentController.autoCheckSubmission
);
router.patch(
  '/submissions/:id/grade',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AssignmentController.gradeSubmission
);

// Student portal
router.get(
  '/student',
  authorize('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS_VISIBILITY),
  AssignmentController.getStudentAssignments
);
router.get(
  '/:id',
  authorize('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS, { resource: 'assignment' }),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS_VISIBILITY, { resource: 'assignment' }),
  AssignmentController.getAssignmentById
);
router.post(
  '/:id/submit',
  authorize('STUDENT'),
  upload.single('file'),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS, { resource: 'assignment' }),
  requireFeatureAccess(FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION, { resource: 'assignment' }),
  AssignmentController.submitAssignment
);

export const assignmentRoutes = router;
