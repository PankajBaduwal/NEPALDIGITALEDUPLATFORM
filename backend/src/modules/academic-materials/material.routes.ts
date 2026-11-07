import { NextFunction, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { requireFeatureAccess } from '../../common/middleware/feature-access.middleware';
import { FeatureKey } from '../../models/FeatureAccess';
import { AcademicMaterial } from '../../models/AcademicMaterial';
import { AcademicMaterialController } from './material.controller';

const router = Router();

// Multer storage for learning materials
const uploadDir = path.resolve(process.cwd(), 'uploads/materials');
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
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max
});

const requireMaterialFeature = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let category = String(req.body?.category || req.query?.category || 'LECTURE_NOTE').toUpperCase();
    if (req.params.id) {
      const institutionId = req.institutionId || req.user?.institutionId;
      const material = await AcademicMaterial.findOne({ _id: req.params.id, institutionId }).select('category');
      if (!material) {
        res.status(404).json({ success: false, error: 'Learning resource not found.' });
        return;
      }
      category = material.category;
    }
    const featureKey = category === 'PRESENTATION'
      ? FeatureKey.PRESENTATIONS
      : category === 'VIDEO'
        ? FeatureKey.VIDEOS
        : category === 'LECTURE_NOTE'
          ? FeatureKey.NOTES
          : FeatureKey.MATERIALS;
    await requireFeatureAccess(featureKey, req.params.id ? { resource: 'material' } : undefined)(req, res, next);
  } catch (error) {
    next(error);
  }
};

router.use(authMiddleware);
router.use(tenantMiddleware);

// Teacher material management
router.post(
  '/upload',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  upload.single('file'),
  requireMaterialFeature,
  AcademicMaterialController.uploadMaterial
);
router.get(
  '/teacher',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AcademicMaterialController.getTeacherMaterials
);
router.delete(
  '/:id',
  authorize('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AcademicMaterialController.deleteMaterial
);

// Student access
router.get(
  '/:id/file',
  authorize('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireMaterialFeature,
  AcademicMaterialController.downloadMaterialFile
);
router.get(
  '/student',
  authorize('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  AcademicMaterialController.getStudentMaterials
);
router.post(
  '/:id/download',
  authorize('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'),
  requireMaterialFeature,
  AcademicMaterialController.recordDownload
);

export const academicMaterialRoutes = router;
