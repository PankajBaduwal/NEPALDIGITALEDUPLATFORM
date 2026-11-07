import mongoose, { Schema, Document } from 'mongoose';

export type AcademicMaterialCategory =
  | 'LECTURE_NOTE'
  | 'PRESENTATION'
  | 'VIDEO'
  | 'WORKSHEET'
  | 'PRACTICE_QUESTION'
  | 'REFERENCE_MATERIAL'
  | 'GENERAL_DOCUMENT';

export interface IAcademicMaterial extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  uploadedBy: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  sectionId?: mongoose.Types.ObjectId | string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  medium: 'ENGLISH' | 'NEPALI' | 'BOTH';
  category: AcademicMaterialCategory;
  title: string;
  description?: string;
  chapterNumber?: number;
  topic?: string;
  fileUrl: string;
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  downloadCount: number;
  isPublicToClass: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicMaterialSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    medium: { type: String, enum: ['ENGLISH', 'NEPALI', 'BOTH'], default: 'BOTH' },
    category: {
      type: String,
      enum: [
        'LECTURE_NOTE',
        'PRESENTATION',
        'VIDEO',
        'WORKSHEET',
        'PRACTICE_QUESTION',
        'REFERENCE_MATERIAL',
        'GENERAL_DOCUMENT',
      ],
      default: 'LECTURE_NOTE',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    chapterNumber: { type: Number },
    topic: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    originalFilename: { type: String, required: true },
    fileSizeBytes: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/octet-stream' },
    downloadCount: { type: Number, default: 0 },
    isPublicToClass: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.uploadedBy = ret.uploadedBy?.toString();
        ret.classId = ret.classId?.toString();
        if (ret.sectionId) ret.sectionId = ret.sectionId?.toString();
        ret.centralSubjectId = ret.centralSubjectId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

AcademicMaterialSchema.index({ institutionId: 1, classId: 1, centralSubjectId: 1 });
AcademicMaterialSchema.index({ uploadedBy: 1, createdAt: -1 });

export const AcademicMaterial =
  mongoose.models.AcademicMaterial ||
  mongoose.model<IAcademicMaterial>('AcademicMaterial', AcademicMaterialSchema, 'academicMaterials');
