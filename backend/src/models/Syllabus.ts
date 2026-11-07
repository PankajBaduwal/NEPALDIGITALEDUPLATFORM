import mongoose, { Schema, Document } from 'mongoose';

export type SyllabusChapterStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ISyllabusProgress extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  textbookId?: mongoose.Types.ObjectId | string;
  chapterNumber: number;
  chapterTitle: string;
  status: SyllabusChapterStatus;
  coveredTopics: string[];
  totalTopics: number;
  learningObjectives: string[];
  completedObjectives: string[];
  completionPercentage: number;
  startDate?: Date;
  completedDate?: Date;
  teachingHoursSpent: number;
  teachingNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SyllabusProgressSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook', default: null },
    chapterNumber: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
      index: true,
    },
    coveredTopics: [{ type: String }],
    totalTopics: { type: Number, default: 0 },
    learningObjectives: [{ type: String }],
    completedObjectives: [{ type: String }],
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    startDate: { type: Date, default: null },
    completedDate: { type: Date, default: null },
    teachingHoursSpent: { type: Number, default: 0 },
    teachingNotes: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.academicYearId = ret.academicYearId?.toString();
        ret.classId = ret.classId?.toString();
        ret.sectionId = ret.sectionId?.toString();
        ret.centralSubjectId = ret.centralSubjectId?.toString();
        ret.teacherId = ret.teacherId?.toString();
        if (ret.textbookId) ret.textbookId = ret.textbookId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to ensure uniqueness per section, subject, and chapter
SyllabusProgressSchema.index(
  { sectionId: 1, centralSubjectId: 1, chapterNumber: 1 },
  { unique: true }
);

// Fast analytics lookup
SyllabusProgressSchema.index({ institutionId: 1, classId: 1, status: 1 });
SyllabusProgressSchema.index({ teacherId: 1, centralSubjectId: 1 });

export const SyllabusProgress = mongoose.model<ISyllabusProgress>(
  'SyllabusProgress',
  SyllabusProgressSchema,
  'syllabusProgress'
);

