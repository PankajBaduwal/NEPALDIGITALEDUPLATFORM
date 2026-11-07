import mongoose from 'mongoose';
import { AcademicMaterial, IAcademicMaterial, AcademicMaterialCategory } from '../../models/AcademicMaterial';
import { StudentEnrollment, Section } from '../../models';
import { NotificationService } from '../notifications/notification.service';

export interface UploadMaterialInput {
  institutionId: string;
  uploadedBy: string;
  classId: string;
  sectionId?: string;
  centralSubjectId: string;
  medium?: 'ENGLISH' | 'NEPALI' | 'BOTH';
  category?: AcademicMaterialCategory;
  title: string;
  description?: string;
  chapterNumber?: number;
  topic?: string;
  fileUrl: string;
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
}

export class AcademicMaterialService {
  /**
   * Upload and register a new academic learning material
   */
  static async uploadMaterial(input: UploadMaterialInput): Promise<IAcademicMaterial> {
    const mat = new AcademicMaterial({
      ...input,
      medium: input.medium || 'BOTH',
      category: input.category || 'LECTURE_NOTE',
    });

    await mat.save();

    // Notify students
    try {
      // StudentEnrollment has no institutionId/classId fields: resolve the sections first
      let sectionFilter: any;
      if (input.sectionId) {
        sectionFilter = input.sectionId;
      } else {
        const classSections = await Section.find({ classId: input.classId }).select('_id');
        sectionFilter = { $in: classSections.map((x) => x._id) };
      }
      const query: any = { sectionId: sectionFilter, status: 'ENROLLED' };

      const enrollments = await StudentEnrollment.find(query).select('studentId');
      for (const e of enrollments) {
        await NotificationService.sendNotification({
          recipientId: e.studentId.toString(),
          institutionId: input.institutionId,
          title: 'New Study Material Shared',
          message: `New ${mat.category.replace('_', ' ').toLowerCase()}: "${mat.title}" has been shared.`,
          type: 'ANNOUNCEMENT',
        });
      }
    } catch {
      // non-blocking
    }

    return mat;
  }

  /**
   * List materials uploaded by teacher
   */
  static async getTeacherMaterials(
    institutionId: string,
    teacherId: string,
    centralSubjectId?: string,
    classId?: string
  ): Promise<any[]> {
    const query: any = { institutionId, uploadedBy: teacherId };
    if (centralSubjectId) query.centralSubjectId = centralSubjectId;
    if (classId) query.classId = classId;

    const list = await AcademicMaterial.find(query)
      .populate('classId', 'name gradeNumber')
      .populate('sectionId', 'name')
      .populate('centralSubjectId', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    return list.map((m) => ({
      ...m,
      id: m._id.toString(),
      fileUrl: `/academic-materials/${m._id.toString()}/file`,
    }));
  }

  /**
   * List permitted materials for enrolled student
   */
  static async getStudentMaterials(
    institutionId: string,
    classId: string,
    sectionId: string,
    centralSubjectId?: string,
    category?: string
  ): Promise<any[]> {
    const query: any = {
      institutionId,
      classId,
      $or: [
        { sectionId },
        { sectionId: null },
        { sectionId: { $exists: false } },
      ],
    };

    if (centralSubjectId) query.centralSubjectId = centralSubjectId;
    if (category) query.category = category;

    const list = await AcademicMaterial.find(query)
      .populate('centralSubjectId', 'name code')
      .populate('uploadedBy', 'fullName name')
      .sort({ createdAt: -1 })
      .lean();

    return list.map((m) => ({
      id: m._id.toString(),
      title: m.title,
      description: m.description,
      category: m.category,
      medium: m.medium,
      chapterNumber: m.chapterNumber,
      topic: m.topic,
      fileUrl: `/academic-materials/${m._id.toString()}/file`,
      originalFilename: m.originalFilename,
      fileSizeBytes: m.fileSizeBytes,
      mimeType: m.mimeType,
      downloadCount: m.downloadCount,
      createdAt: m.createdAt,
      subjectName: (m.centralSubjectId as any)?.name || 'General',
      subjectCode: (m.centralSubjectId as any)?.code || '',
      uploadedByName: (m.uploadedBy as any)?.fullName || (m.uploadedBy as any)?.name || 'Teacher',
    }));
  }

  /**
   * Delete uploaded material
   */
  static async deleteMaterial(materialId: string, teacherId: string): Promise<boolean> {
    const res = await AcademicMaterial.findOneAndDelete({ _id: materialId, uploadedBy: teacherId });
    return Boolean(res);
  }

  /**
   * Increment download count
   */
  static async recordDownload(materialId: string, institutionId?: string): Promise<void> {
    await AcademicMaterial.findOneAndUpdate({ _id: materialId, ...(institutionId ? { institutionId } : {}) }, { $inc: { downloadCount: 1 } });
  }
}
