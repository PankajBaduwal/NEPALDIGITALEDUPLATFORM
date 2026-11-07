import mongoose, { Schema, Document } from 'mongoose';

// ══════════════════════════════════════════════════════════════════
// 1. CURRICULUM VERSION / FRAMEWORK (e.g., NCF-2076, NCF-2081)
// ══════════════════════════════════════════════════════════════════
export interface ICurriculumVersion extends Document {
  id: string;
  code: string; // e.g. "NCF-2076", "NCF-2081"
  name: string; // "National Curriculum Framework 2076"
  nameNepali?: string; // "राष्ट्रिय पाठ्यक्रम प्रारूप २०७६"
  revisionYearBS: number; // 2076, 2081
  isActive: boolean;
  description?: string;
}

const CurriculumVersionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    nameNepali: { type: String },
    revisionYearBS: { type: Number, required: true, default: 2076 },
    isActive: { type: Boolean, default: true },
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// 2. TEXTBOOK CHAPTER MODEL
// ══════════════════════════════════════════════════════════════════
export interface ITextbookChapter extends Document {
  id: string;
  textbookId: mongoose.Types.ObjectId | string;
  unitNumber?: number;
  unitTitle?: string;
  chapterNumber: number;
  title: string;
  titleNepali?: string;
  startPage: number;
  endPage: number;
  summary?: string;
  extractedTextPreview?: string;
  source?: 'TABLE_OF_CONTENTS' | 'MANUAL';
  verificationStatus?: 'VERIFIED' | 'NEEDS_REVIEW';
}

const TextbookChapterSchema = new Schema(
  {
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook', required: true, index: true },
    unitNumber: { type: Number },
    unitTitle: { type: String },
    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true },
    titleNepali: { type: String },
    startPage: { type: Number, required: true, default: 1 },
    endPage: { type: Number, required: true, default: 1 },
    summary: { type: String },
    extractedTextPreview: { type: String },
    source: { type: String, enum: ['TABLE_OF_CONTENTS', 'MANUAL'], default: 'MANUAL' },
    verificationStatus: { type: String, enum: ['VERIFIED', 'NEEDS_REVIEW'], default: 'NEEDS_REVIEW' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.textbookId = ret.textbookId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
TextbookChapterSchema.index({ textbookId: 1, chapterNumber: 1 });

// ══════════════════════════════════════════════════════════════════
// 3. TEXTBOOK TOPIC & LEARNING OBJECTIVES
// ══════════════════════════════════════════════════════════════════
export interface ITextbookTopic extends Document {
  id: string;
  chapterId: mongoose.Types.ObjectId | string;
  topicNumber: number;
  title: string;
  titleNepali?: string;
  startPage?: number;
  learningObjectives: string[];
}

const TextbookTopicSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: 'TextbookChapter', required: true, index: true },
    topicNumber: { type: Number, required: true },
    title: { type: String, required: true },
    titleNepali: { type: String },
    startPage: { type: Number },
    learningObjectives: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.chapterId = ret.chapterId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// 4. CONTENT PROCESSING JOB (Async PDF Pipeline)
// ══════════════════════════════════════════════════════════════════
export interface IContentProcessingJob extends Document {
  id: string;
  textbookId: mongoose.Types.ObjectId | string;
  fileName: string;
  fileHash: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalPages: number;
  processedPages: number;
  extractedChaptersCount: number;
  errorDetails?: string;
  startedAt?: Date;
  completedAt?: Date;
}

const ContentProcessingJobSchema = new Schema(
  {
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook', required: true, index: true },
    fileName: { type: String, required: true },
    fileHash: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'QUEUED',
      index: true,
    },
    totalPages: { type: Number, default: 0 },
    processedPages: { type: Number, default: 0 },
    extractedChaptersCount: { type: Number, default: 0 },
    errorDetails: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.textbookId = ret.textbookId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// 5. REFERENCE DOCUMENT (TVET curricula, teacher resource books)
// ══════════════════════════════════════════════════════════════════
export interface IReferenceDocument extends Document {
  id: string;
  title: string;
  documentType: 'CURRICULUM' | 'TEACHER_RESOURCE';
  gradeFrom?: number;
  gradeTo?: number;
  language?: string;
  sourceRelativePath: string;
  fileHash: string;
  fileSize: number;
  pageCount: number;
  textLayer?: string;
  isActive: boolean;
}

const ReferenceDocumentSchema = new Schema(
  {
    title: { type: String, required: true },
    documentType: { type: String, enum: ['CURRICULUM', 'TEACHER_RESOURCE'], required: true, index: true },
    gradeFrom: { type: Number },
    gradeTo: { type: Number },
    language: { type: String },
    sourceRelativePath: { type: String, required: true, unique: true },
    fileHash: { type: String, required: true, index: true },
    fileSize: { type: Number, default: 0 },
    pageCount: { type: Number, default: 0 },
    textLayer: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ReferenceDocument =
  mongoose.models.ReferenceDocument ||
  mongoose.model<IReferenceDocument>('ReferenceDocument', ReferenceDocumentSchema, 'referenceDocuments');

export const CurriculumVersion =
  mongoose.models.CurriculumVersion ||
  mongoose.model<ICurriculumVersion>('CurriculumVersion', CurriculumVersionSchema);

export const TextbookChapter =
  mongoose.models.TextbookChapter ||
  mongoose.model<ITextbookChapter>('TextbookChapter', TextbookChapterSchema);

export const TextbookTopic =
  mongoose.models.TextbookTopic ||
  mongoose.model<ITextbookTopic>('TextbookTopic', TextbookTopicSchema);

export const ContentProcessingJob =
  mongoose.models.ContentProcessingJob ||
  mongoose.model<IContentProcessingJob>('ContentProcessingJob', ContentProcessingJobSchema);

