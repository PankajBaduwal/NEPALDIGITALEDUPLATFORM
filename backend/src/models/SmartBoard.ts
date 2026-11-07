import mongoose, { Schema, Document } from 'mongoose';

// ══════════════════════════════════════════════════════════════════
// 1. SMART BOARD NOTE (Whiteboard Drawing Saves)
// ══════════════════════════════════════════════════════════════════
export interface ISmartBoardNote extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  sectionId?: mongoose.Types.ObjectId | string;
  subjectId?: mongoose.Types.ObjectId | string;
  title: string;
  sessionDate: Date;
  drawingData: Record<string, any>;
  exportedPdfPath?: string;
  isSharedWithStudents: boolean;
}

const SmartBoardNoteSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    title: { type: String, required: true },
    sessionDate: { type: Date, default: Date.now },
    drawingData: { type: Schema.Types.Mixed, required: true },
    exportedPdfPath: { type: String },
    isSharedWithStudents: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        // keep a populated teacher ({ fullName }) so students can see who shared the note
        if (!(ret.teacherId && typeof ret.teacherId === 'object' && !(ret.teacherId as any)._bsontype && (ret.teacherId as any).fullName !== undefined)) ret.teacherId = ret.teacherId?.toString();
        if (ret.sectionId) ret.sectionId = ret.sectionId.toString();
        if (ret.subjectId) ret.subjectId = ret.subjectId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// 2. ANNOTATION SESSION (Textbook & Board Annotations Overlay)
// ══════════════════════════════════════════════════════════════════
export interface IAnnotationSession extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  sectionId?: mongoose.Types.ObjectId | string;
  subjectId?: mongoose.Types.ObjectId | string;
  textbookId?: mongoose.Types.ObjectId | string;
  pageNumber: number;
  title: string;
  annotationData: Record<string, any>;
  drawDataUrl?: string; // Base64 thumbnail or visual snapshot
  boardState?: Record<string, any>; // Complete App.getBoardState()
  isSharedWithStudents: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnotationSessionSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook', index: true },
    pageNumber: { type: Number, default: 1 },
    title: { type: String, required: true },
    annotationData: { type: Schema.Types.Mixed, required: true },
    drawDataUrl: { type: String },
    boardState: { type: Schema.Types.Mixed },
    isSharedWithStudents: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.teacherId = ret.teacherId?.toString();
        if (ret.classId) ret.classId = ret.classId.toString();
        if (ret.sectionId) ret.sectionId = ret.sectionId.toString();
        if (ret.subjectId) ret.subjectId = ret.subjectId.toString();
        if (ret.textbookId) ret.textbookId = ret.textbookId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
AnnotationSessionSchema.index({ institutionId: 1, teacherId: 1, textbookId: 1, pageNumber: 1 });

// ══════════════════════════════════════════════════════════════════
// 3. CLASSROOM SESSION (Digital Classroom Tracking)
// ══════════════════════════════════════════════════════════════════
export interface IClassroomSessionResource {
  type: 'TEXTBOOK' | 'SIMULATION' | 'ACTIVITY' | 'WHITEBOARD';
  name: string;
  url?: string;
  timeSpentSeconds?: number;
}

export interface IClassroomSession extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  subjectId: mongoose.Types.ObjectId | string;
  textbookId?: mongoose.Types.ObjectId | string;
  chapterNumber?: number;
  chapterTitle?: string;
  lessonTitle?: string;
  sessionStart: Date;
  sessionEnd?: Date;
  durationSeconds: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  resourcesUsed: IClassroomSessionResource[];
  lessonCoverage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassroomSessionSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook', index: true },
    chapterNumber: { type: Number },
    chapterTitle: { type: String },
    lessonTitle: { type: String },
    sessionStart: { type: Date, default: Date.now },
    sessionEnd: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'PAUSED'],
      default: 'ACTIVE',
      index: true,
    },
    resourcesUsed: [
      {
        type: { type: String, enum: ['TEXTBOOK', 'SIMULATION', 'ACTIVITY', 'WHITEBOARD'], required: true },
        name: { type: String, required: true },
        url: { type: String },
        timeSpentSeconds: { type: Number, default: 0 },
      },
    ],
    lessonCoverage: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.teacherId = ret.teacherId?.toString();
        ret.classId = ret.classId?.toString();
        ret.sectionId = ret.sectionId?.toString();
        ret.subjectId = ret.subjectId?.toString();
        if (ret.textbookId) ret.textbookId = ret.textbookId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
ClassroomSessionSchema.index({ institutionId: 1, teacherId: 1, status: 1 });

// ══════════════════════════════════════════════════════════════════
// 4. ACTIVITY CATALOG (Interactive Activities Model)
// ══════════════════════════════════════════════════════════════════
export interface IActivityCatalog extends Document {
  id: string;
  title: string;
  titleNepali?: string;
  type: 'MCQ' | 'DRAG_DROP' | 'MATCHING' | 'DIAGRAM_LABELING' | 'INTERACTIVE_EXERCISE';
  subjectId?: mongoose.Types.ObjectId | string;
  gradeLevels: number[];
  chapterNumber?: number;
  contentData: Record<string, any>;
  isInteractive: boolean;
}

const ActivityCatalogSchema = new Schema(
  {
    title: { type: String, required: true },
    titleNepali: { type: String },
    type: {
      type: String,
      enum: ['MCQ', 'DRAG_DROP', 'MATCHING', 'DIAGRAM_LABELING', 'INTERACTIVE_EXERCISE'],
      required: true,
      index: true,
    },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    gradeLevels: { type: [Number], default: [] },
    chapterNumber: { type: Number },
    contentData: { type: Schema.Types.Mixed, default: {} },
    isInteractive: { type: Boolean, default: true },
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

export const SmartBoardNote =
  mongoose.models.SmartBoardNote || mongoose.model<ISmartBoardNote>('SmartBoardNote', SmartBoardNoteSchema);

export const AnnotationSession =
  mongoose.models.AnnotationSession ||
  mongoose.model<IAnnotationSession>('AnnotationSession', AnnotationSessionSchema);

export const ClassroomSession =
  mongoose.models.ClassroomSession ||
  mongoose.model<IClassroomSession>('ClassroomSession', ClassroomSessionSchema);

export const ActivityCatalog =
  mongoose.models.ActivityCatalog ||
  mongoose.model<IActivityCatalog>('ActivityCatalog', ActivityCatalogSchema);
