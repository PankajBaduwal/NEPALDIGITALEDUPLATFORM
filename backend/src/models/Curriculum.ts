import mongoose, { Schema, Document } from 'mongoose';

// Central Subject (Curriculum)
export interface ICentralSubject extends Document {
  id: string;
  code: string;
  name: string;
  nameNepali: string;
  gradeNumber: number;
  stream: string;
  isCompulsory: boolean;
  creditHours: number;
  /** Logical subject identity shared by English and Nepali editions, e.g. "MATHEMATICS". */
  logicalKey?: string;
  category?: string;
  sharedAcrossMedia?: boolean;
  availableMedia?: string[];
  /** EXTRACTED = backed by a PDF in Nepal data; NO_SOURCE_PDF = configured subject with no source textbook. */
  sourceStatus?: 'EXTRACTED' | 'NO_SOURCE_PDF';
  verificationStatus?: 'VERIFIED' | 'NEEDS_REVIEW' | 'UNVERIFIED';
  isActive?: boolean;
}

const CentralSubjectSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    nameNepali: { type: String, required: true },
    gradeNumber: { type: Number, required: true, min: 1, max: 12, index: true },
    stream: { type: String, default: 'GENERAL' },
    isCompulsory: { type: Boolean, default: true },
    creditHours: { type: Number, default: 4 },
    logicalKey: { type: String, index: true },
    category: { type: String },
    sharedAcrossMedia: { type: Boolean, default: false },
    availableMedia: { type: [String], default: [] },
    sourceStatus: { type: String, enum: ['EXTRACTED', 'NO_SOURCE_PDF'], default: 'NO_SOURCE_PDF' },
    verificationStatus: { type: String, enum: ['VERIFIED', 'NEEDS_REVIEW', 'UNVERIFIED'], default: 'UNVERIFIED' },
    isActive: { type: Boolean, default: true, index: true },
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

// Central Textbook
export interface ITextbook extends Document {
  id: string;
  subjectId: mongoose.Types.ObjectId | string;
  curriculumVersionId?: mongoose.Types.ObjectId | string;
  title: string;
  titleNepali?: string;
  gradeNumber?: number;
  medium: string; // 'NEPALI' | 'ENGLISH' | 'BOTH' (language textbooks used by every section)
  logicalKey?: string;
  documentType?: 'TEXTBOOK' | 'SELF_STUDY';
  language?: string;
  sourceRelativePath?: string;
  textLayer?: string;
  confidence?: string;
  verificationStatus?: 'VERIFIED' | 'NEEDS_REVIEW';
  extractionStatus?: 'CHAPTERS_EXTRACTED' | 'CHAPTERS_NOT_EXTRACTED';
  issues?: string[];
  isActive?: boolean;
  /** Set when a Super Admin replaced the Nepal data PDF; sync then leaves this record alone. */
  supersededSource?: string;
  /** Set when a Super Admin corrected the mapping; sync keeps subject, medium and title. */
  curatedAt?: Date;
  edition?: string;
  publicationYear?: number;
  fileHash?: string;
  fileSize?: number;
  pdfPath: string;
  thumbnailUrl?: string;
  pageCount: number;
  status: 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'ARCHIVED';
  isApprovedByCDC: boolean;
  chapters?: Array<{
    chapterNumber: number;
    name: string;
    nameNepali?: string;
    startPage: number;
    endPage: number;
    topics: Array<{ title: string; startPage?: number }>;
  }>;
}

const TextbookSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    curriculumVersionId: { type: Schema.Types.ObjectId, ref: 'CurriculumVersion' },
    title: { type: String, required: true },
    titleNepali: { type: String },
    gradeNumber: { type: Number, min: 1, max: 12, index: true },
    medium: { type: String, enum: ['NEPALI', 'ENGLISH', 'BOTH'], required: true, index: true },
    logicalKey: { type: String, index: true },
    documentType: { type: String, enum: ['TEXTBOOK', 'SELF_STUDY'], default: 'TEXTBOOK' },
    language: { type: String },
    sourceRelativePath: { type: String, index: true },
    textLayer: { type: String },
    confidence: { type: String },
    verificationStatus: { type: String, enum: ['VERIFIED', 'NEEDS_REVIEW'], default: 'NEEDS_REVIEW' },
    extractionStatus: { type: String, enum: ['CHAPTERS_EXTRACTED', 'CHAPTERS_NOT_EXTRACTED'] },
    issues: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    supersededSource: { type: String },
    curatedAt: { type: Date },
    edition: { type: String },
    publicationYear: { type: Number },
    fileHash: { type: String, index: true },
    fileSize: { type: Number, default: 0 },
    pdfPath: { type: String, required: true },
    thumbnailUrl: { type: String },
    pageCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED',
      index: true,
    },
    isApprovedByCDC: { type: Boolean, default: true },
    chapters: [
      {
        chapterNumber: { type: Number, required: true },
        name: { type: String, required: true },
        nameNepali: { type: String },
        startPage: { type: Number, default: 1 },
        endPage: { type: Number, default: 1 },
        topics: [
          {
            title: { type: String, required: true },
            startPage: { type: Number },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.subjectId = ret.subjectId?.toString();
        if (ret.curriculumVersionId) ret.curriculumVersionId = ret.curriculumVersionId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Simulation Catalog
export interface ISimulationCatalog extends Document {
  id: string;
  subjectId?: mongoose.Types.ObjectId | string;
  title: string;
  titleNepali?: string;
  domain: string; // 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'MATH', 'GEOGRAPHY'
  simulationType: string;
  entryUrl: string;
  isPremium: boolean;
  gradeLevels: number[];
}

const SimulationCatalogSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    title: { type: String, required: true },
    titleNepali: { type: String },
    domain: { type: String, required: true, index: true },
    simulationType: { type: String, default: 'HTML5_CANVAS' },
    entryUrl: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    gradeLevels: { type: [Number], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.subjectId) ret.subjectId = ret.subjectId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CentralSubject = mongoose.models.CentralSubject || mongoose.model<ICentralSubject>('CentralSubject', CentralSubjectSchema);
export const Textbook = mongoose.models.Textbook || mongoose.model<ITextbook>('Textbook', TextbookSchema);
export const SimulationCatalog = mongoose.models.SimulationCatalog || mongoose.model<ISimulationCatalog>('SimulationCatalog', SimulationCatalogSchema);

