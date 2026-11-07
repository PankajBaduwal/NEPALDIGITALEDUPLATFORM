import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentRemark extends Document {
  institutionId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId?: mongoose.Types.ObjectId | string | null;
  teacherId: mongoose.Types.ObjectId | string;
  kind: 'REMARK' | 'INTERVENTION';
  title?: string;
  text: string;
  createdAt: Date;
}

const StudentRemarkSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', default: null },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: ['REMARK', 'INTERVENTION'], default: 'REMARK' },
    title: { type: String, default: '' },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const StudentRemark =
  mongoose.models.StudentRemark || mongoose.model<IStudentRemark>('StudentRemark', StudentRemarkSchema, 'studentRemarks');
