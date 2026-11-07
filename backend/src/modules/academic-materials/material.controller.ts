import { assertTeacherTeachesSection, assertTeacherTeachesClass } from '../../common/utils/teacher-scope.util';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { FeatureKey } from '../../models/FeatureAccess';
import path from 'path';
import { AcademicMaterial, StudentEnrollment } from '../../models';
import { FeatureAccessService } from '../feature-access/feature-access.service';
import { AcademicMaterialService } from './material.service';

const getMaterialFeatureKey = (category: string): FeatureKey => {
  if (category === 'LECTURE_NOTE') return FeatureKey.NOTES;
  if (category === 'PRESENTATION') return FeatureKey.PRESENTATIONS;
  if (category === 'VIDEO') return FeatureKey.VIDEOS;
  return FeatureKey.MATERIALS;
};

export class AcademicMaterialController {
  /**
   * POST /api/academic-materials/upload
   * Teacher uploads notes / study material
   */
  static async uploadMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded. Please select a valid document.' });
        return;
      }

      const institutionId = req.institutionId || req.user?.institutionId;
      const uploadedBy = req.user!.userId;

      if (!institutionId) {
        res.status(400).json({ success: false, error: 'Institution context missing.' });
        return;
      }

      let verifiedClassId = req.body.classId;
      if (req.user!.role === 'TEACHER') {
        try {
          const scope = req.body.sectionId
            ? await assertTeacherTeachesSection(uploadedBy, institutionId.toString(), req.body.sectionId, req.body.centralSubjectId)
            : await assertTeacherTeachesClass(uploadedBy, institutionId.toString(), req.body.classId, req.body.centralSubjectId);
          verifiedClassId = scope.classId;
        } catch (e: any) {
          res.status(e.status || 403).json({ success: false, message: e.message, error: e.message });
          return;
        }
      }

      const fileUrl = `/uploads/materials/${req.file.filename}`;

      const material = await AcademicMaterialService.uploadMaterial({
        ...req.body,
        classId: verifiedClassId,
        institutionId: institutionId.toString(),
        uploadedBy,
        fileUrl,
        originalFilename: req.file.originalname,
        fileSizeBytes: req.file.size,
        mimeType: req.file.mimetype,
      });

      res.status(201).json({ success: true, data: material, message: 'Learning resource uploaded and shared successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/academic-materials/teacher
   * Teacher lists uploaded materials
   */
  static async getTeacherMaterials(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const teacherId = req.user!.userId;
      const { centralSubjectId, classId } = req.query;

      const list = await AcademicMaterialService.getTeacherMaterials(
        institutionId!.toString(),
        teacherId,
        centralSubjectId as string,
        classId as string
      );

      res.json({ success: true, data: list });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/academic-materials/student
   * Student lists available study materials
   */
  static async getStudentMaterials(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      let { classId, sectionId } = req.query;
      const { centralSubjectId, category } = req.query;

      if (req.user?.role === 'STUDENT') {
        const context = await FeatureAccessService.resolveFeatureAccess({
          institutionId: institutionId!.toString(),
          studentId: req.user.userId,
          featureKey: FeatureKey.MATERIALS,
        });
        if (!context.sectionId || !context.classId) {
          res.json({ success: true, data: [] });
          return;
        }
        sectionId = context.sectionId;
        classId = context.classId;
      }

      if (!classId || !sectionId) {
        res.status(400).json({ success: false, error: 'classId and sectionId query parameters required.' });
        return;
      }

      const list = await AcademicMaterialService.getStudentMaterials(
        institutionId!.toString(),
        classId as string,
        sectionId as string,
        centralSubjectId as string,
        category as string
      );

      if (req.user?.role !== 'STUDENT') {
        res.json({ success: true, data: list });
        return;
      }

      const accessibleMaterials = await Promise.all(
        list.map(async (material) => {
          const access = await FeatureAccessService.resolveFeatureAccess({
            institutionId: institutionId!.toString(),
            classId: classId as string,
            sectionId: sectionId as string,
            studentId: req.user!.userId,
            featureKey: getMaterialFeatureKey(material.category),
          });
          return access.effectiveEnabled ? material : null;
        })
      );
      res.json({ success: true, data: accessibleMaterials.filter((material) => material !== null) });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async downloadMaterialFile(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const institutionId = req.institutionId || req.user?.institutionId;
        const material = await AcademicMaterial.findOne({
          _id: req.params.id,
          institutionId,
        }).select('fileUrl originalFilename classId sectionId uploadedBy');
        if (!material || !material.fileUrl.startsWith('/uploads/materials/')) {
          res.status(404).json({ success: false, error: 'Learning resource file not found.' });
          return;
        }

        // Students may only download materials shared with their own class / section
        if (req.user?.role === 'STUDENT') {
          const enrollment: any = await StudentEnrollment.findOne({ studentId: req.user.userId, status: 'ENROLLED' }).populate('sectionId', 'classId');
          const mySectionId = String(enrollment?.sectionId?._id || '');
          const myClassId = String(enrollment?.sectionId?.classId || '');
          const classMatches = !material.classId || String(material.classId) === myClassId;
          const sectionMatches = !material.sectionId || String(material.sectionId) === mySectionId;
          if (!enrollment || !classMatches || !sectionMatches) {
            res.status(404).json({ success: false, error: 'Learning resource file not found.' });
            return;
          }
        }

        const filePath = path.resolve(process.cwd(), 'uploads', 'materials', path.basename(material.fileUrl));
        res.download(filePath, material.originalFilename, (error) => {
          if (error && !res.headersSent) {
            res.status(404).json({ success: false, error: 'Learning resource file is unavailable.' });
          }
        });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    }

  /**
   * DELETE /api/academic-materials/:id
   * Teacher deletes material
   */
  static async deleteMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const teacherId = req.user!.userId;
      const success = await AcademicMaterialService.deleteMaterial(req.params.id, teacherId);
      if (!success) {
        res.status(404).json({ success: false, error: 'Material not found or unauthorized.' });
        return;
      }
      res.json({ success: true, message: 'Material deleted successfully.' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/academic-materials/:id/download
   * Records download event
   */
  static async recordDownload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await AcademicMaterialService.recordDownload(req.params.id, (req.institutionId || req.user?.institutionId) as string);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
