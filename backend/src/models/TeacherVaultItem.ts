import mongoose, { Schema } from 'mongoose';

export type VaultKind = 'PDF' | 'PRESENTATION' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'SPREADSHEET' | 'TEXT' | 'OTHER';

/**
 * A teacher's private teaching material: organised by subject, unit and topic, and launchable on the Smart Board.
 */
const TeacherVaultItemSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true },
    unitNumber: { type: Number },
    unitTitle: { type: String, trim: true, required: true },
    topic: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: '' },
    kind: { type: String, enum: ['PDF', 'PRESENTATION', 'DOCUMENT', 'VIDEO', 'AUDIO', 'IMAGE', 'SPREADSHEET', 'TEXT', 'OTHER'], default: 'OTHER', index: true },
    storedName: { type: String, required: true },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
    extension: { type: String, default: '' },
    fileSizeBytes: { type: Number, default: 0 },
    lastLaunchedAt: { type: Date },
    launchCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = String(ret._id);
        ['institutionId', 'teacherId', 'classId', 'sectionId', 'centralSubjectId'].forEach((k) => { if (ret[k]) ret[k] = String(ret[k]); });
        delete ret._id;
        delete ret.__v;
        delete ret.storedName;
        return ret;
      },
    },
  }
);
TeacherVaultItemSchema.index({ teacherId: 1, centralSubjectId: 1, classId: 1, unitNumber: 1 });

export const TeacherVaultItem =
  mongoose.models.TeacherVaultItem || mongoose.model('TeacherVaultItem', TeacherVaultItemSchema, 'teacherVaultItems');
