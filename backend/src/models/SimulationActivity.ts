import mongoose, { Schema, Document } from 'mongoose';

// ══════════════════════════════════════════════════════════════════
// 1. SIMULATION MODEL
// ══════════════════════════════════════════════════════════════════
export interface ISimulation extends Document {
  id: string;
  code: string;
  title: string;
  titleNepali?: string;
  description: string;
  descriptionNepali?: string;
  learningObjectives: string[];
  learningObjectivesNepali?: string[];
  gradeLevels: number[]; // 1 to 12
  subjectId?: mongoose.Types.ObjectId | string;
  subjectCode?: string;
  subjectName?: string;
  subjectNameNepali?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  chapterTitleNepali?: string;
  topicName?: string;
  topicNameNepali?: string;
  language: 'ne' | 'en' | 'both';
  simulationType: '2D_CANVAS' | '3D_WEBGL' | 'HTML5_SIM' | 'REACT_INTERACTIVE';
  runtimeUrl: string;
  componentKey?: string;
  thumbnailUrl?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes?: number;
  status?: 'AVAILABLE' | 'COMING_SOON' | 'RESTRICTED';
  isPublished: boolean;
  currentVersion: string;
  tags: string[];
  config?: Record<string, any>;
  viewsCount: number;
  smartBoardLaunches: number;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const SimulationSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    titleNepali: { type: String },
    description: { type: String, required: true },
    descriptionNepali: { type: String },
    learningObjectives: { type: [String], default: [] },
    learningObjectivesNepali: { type: [String], default: [] },
    gradeLevels: { type: [Number], required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    subjectCode: { type: String, index: true },
    subjectName: { type: String },
    subjectNameNepali: { type: String },
    chapterNumber: { type: Number, index: true },
    chapterTitle: { type: String },
    chapterTitleNepali: { type: String },
    topicName: { type: String },
    topicNameNepali: { type: String },
    language: { type: String, enum: ['ne', 'en', 'both'], default: 'both', index: true },
    simulationType: {
      type: String,
      enum: ['2D_CANVAS', '3D_WEBGL', 'HTML5_SIM', 'REACT_INTERACTIVE'],
      default: '2D_CANVAS',
      index: true,
    },
    runtimeUrl: { type: String, required: true },
    componentKey: { type: String, index: true },
    thumbnailUrl: { type: String },
    difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    estimatedMinutes: { type: Number, default: 15 },
    status: { type: String, enum: ['AVAILABLE', 'COMING_SOON', 'RESTRICTED'], default: 'AVAILABLE' },
    isPublished: { type: Boolean, default: true, index: true },
    currentVersion: { type: String, default: '1.0.0' },
    tags: { type: [String], default: [] },
    config: { type: Schema.Types.Mixed, default: {} },
    viewsCount: { type: Number, default: 0 },
    smartBoardLaunches: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.subjectId) ret.subjectId = ret.subjectId.toString();
        if (ret.createdBy) ret.createdBy = ret.createdBy.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
SimulationSchema.index({ gradeLevels: 1, subjectCode: 1, chapterNumber: 1, isPublished: 1 });

// ══════════════════════════════════════════════════════════════════
// 2. SIMULATION VERSION MODEL
// ══════════════════════════════════════════════════════════════════
export interface ISimulationVersion extends Document {
  id: string;
  simulationId: mongoose.Types.ObjectId | string;
  versionNumber: string;
  changelog: string;
  bundleUrl?: string;
  isCurrent: boolean;
  releaseNotes?: string;
  createdAt: Date;
}

const SimulationVersionSchema = new Schema(
  {
    simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
    versionNumber: { type: String, required: true },
    changelog: { type: String, default: 'Initial release' },
    bundleUrl: { type: String },
    isCurrent: { type: Boolean, default: true },
    releaseNotes: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.simulationId = ret.simulationId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
SimulationVersionSchema.index({ simulationId: 1, versionNumber: 1 }, { unique: true });

// ══════════════════════════════════════════════════════════════════
// 3. SIMULATION ASSET MODEL
// ══════════════════════════════════════════════════════════════════
export interface ISimulationAsset extends Document {
  id: string;
  simulationId: mongoose.Types.ObjectId | string;
  assetName: string;
  assetType: 'IMAGE' | 'MODEL_3D' | 'AUDIO' | 'DATA_JSON' | 'SCRIPT' | 'STYLESHEET';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

const SimulationAssetSchema = new Schema(
  {
    simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
    assetName: { type: String, required: true },
    assetType: {
      type: String,
      enum: ['IMAGE', 'MODEL_3D', 'AUDIO', 'DATA_JSON', 'SCRIPT', 'STYLESHEET'],
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.simulationId = ret.simulationId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// 4. SIMULATION TOPIC MODEL (Curriculum alignment)
// ══════════════════════════════════════════════════════════════════
export interface ISimulationTopic extends Document {
  id: string;
  simulationId: mongoose.Types.ObjectId | string;
  chapterId?: mongoose.Types.ObjectId | string;
  curriculumTopicId?: mongoose.Types.ObjectId | string;
  curriculumTopicTitle: string;
  curriculumTopicTitleNepali?: string;
  prerequisiteSkills: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes: number;
}

const SimulationTopicSchema = new Schema(
  {
    simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: 'TextbookChapter' },
    curriculumTopicId: { type: Schema.Types.ObjectId, ref: 'TextbookTopic' },
    curriculumTopicTitle: { type: String, required: true },
    curriculumTopicTitleNepali: { type: String },
    prerequisiteSkills: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'INTERMEDIATE',
    },
    estimatedMinutes: { type: Number, default: 15 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.simulationId = ret.simulationId?.toString();
        if (ret.chapterId) ret.chapterId = ret.chapterId.toString();
        if (ret.curriculumTopicId) ret.curriculumTopicId = ret.curriculumTopicId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// 5. ACTIVITY MODEL
// ══════════════════════════════════════════════════════════════════
export type ActivityType =
  | 'MCQ'
  | 'TRUE_FALSE'
  | 'MATCHING'
  | 'DRAG_DROP'
  | 'FILL_BLANKS'
  | 'DIAGRAM_LABELING'
  | 'NUMERICAL'
  | 'ORDERING';

export interface IActivity extends Document {
  id: string;
  code: string;
  title: string;
  titleNepali?: string;
  description: string;
  type: ActivityType;
  gradeLevels: number[];
  subjectId?: mongoose.Types.ObjectId | string;
  subjectCode?: string;
  chapterNumber?: number;
  topicName?: string;
  learningObjectives: string[];
  totalMarks: number;
  passingScore: number;
  timeLimitMinutes: number;
  isPublished: boolean;
  questionsCount: number;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    titleNepali: { type: String },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'MCQ',
        'TRUE_FALSE',
        'MATCHING',
        'DRAG_DROP',
        'FILL_BLANKS',
        'DIAGRAM_LABELING',
        'NUMERICAL',
        'ORDERING',
      ],
      required: true,
      index: true,
    },
    gradeLevels: { type: [Number], required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    subjectCode: { type: String, index: true },
    chapterNumber: { type: Number },
    topicName: { type: String },
    learningObjectives: { type: [String], default: [] },
    totalMarks: { type: Number, default: 10 },
    passingScore: { type: Number, default: 4 },
    timeLimitMinutes: { type: Number, default: 15 },
    isPublished: { type: Boolean, default: true, index: true },
    questionsCount: { type: Number, default: 1 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.subjectId) ret.subjectId = ret.subjectId.toString();
        if (ret.createdBy) ret.createdBy = ret.createdBy.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
ActivitySchema.index({ gradeLevels: 1, subjectCode: 1, type: 1 });

// ══════════════════════════════════════════════════════════════════
// 6. ACTIVITY QUESTION MODEL
// ══════════════════════════════════════════════════════════════════
export interface IActivityQuestion extends Document {
  id: string;
  activityId: mongoose.Types.ObjectId | string;
  questionNumber: number;
  type: ActivityType;
  prompt: string;
  promptNepali?: string;
  points: number;
  explanation: string;
  hint?: string;
  data: Record<string, any>;
  createdAt: Date;
}

const ActivityQuestionSchema = new Schema(
  {
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true, index: true },
    questionNumber: { type: Number, required: true },
    type: {
      type: String,
      enum: [
        'MCQ',
        'TRUE_FALSE',
        'MATCHING',
        'DRAG_DROP',
        'FILL_BLANKS',
        'DIAGRAM_LABELING',
        'NUMERICAL',
        'ORDERING',
      ],
      required: true,
    },
    prompt: { type: String, required: true },
    promptNepali: { type: String },
    points: { type: Number, default: 1 },
    explanation: { type: String, default: '' },
    hint: { type: String },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.activityId = ret.activityId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
ActivityQuestionSchema.index({ activityId: 1, questionNumber: 1 });

// ══════════════════════════════════════════════════════════════════
// 7. ACTIVITY ASSIGNMENT MODEL (Teacher assigns to Class/Section)
// ══════════════════════════════════════════════════════════════════
export interface IActivityAssignment extends Document {
  id: string;
  activityId: mongoose.Types.ObjectId | string;
  institutionId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  subjectId?: mongoose.Types.ObjectId | string;
  dueDate?: Date;
  status: 'ACTIVE' | 'ARCHIVED';
  allowRetries: boolean;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityAssignmentSchema = new Schema(
  {
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    dueDate: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
    allowRetries: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 3 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.activityId = ret.activityId?.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.teacherId = ret.teacherId?.toString();
        ret.classId = ret.classId?.toString();
        ret.sectionId = ret.sectionId?.toString();
        if (ret.subjectId) ret.subjectId = ret.subjectId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
ActivityAssignmentSchema.index({ institutionId: 1, classId: 1, sectionId: 1, status: 1 });

// ══════════════════════════════════════════════════════════════════
// 8. ACTIVITY ATTEMPT MODEL (Student submission)
// ══════════════════════════════════════════════════════════════════
export interface IActivityAttemptItem {
  questionId: string;
  studentAnswer: any;
  isCorrect: boolean;
  scoreEarned: number;
  feedback?: string;
}

export interface IActivityAttempt extends Document {
  id: string;
  activityId: mongoose.Types.ObjectId | string;
  assignmentId?: mongoose.Types.ObjectId | string;
  institutionId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  studentName?: string;
  classId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  answers: IActivityAttemptItem[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  status?: 'COMPLETED' | 'TIMED_OUT' | 'SUBMITTED';
  completedAt: Date;
  createdAt: Date;
}

const ActivityAttemptSchema = new Schema(
  {
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true, index: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'ActivityAssignment', index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    answers: [
      {
        questionId: { type: String, required: true },
        studentAnswer: { type: Schema.Types.Mixed },
        isCorrect: { type: Boolean, required: true },
        scoreEarned: { type: Number, required: true, default: 0 },
        feedback: { type: String },
      },
    ],
    totalScore: { type: Number, required: true, default: 0 },
    maxScore: { type: Number, required: true, default: 10 },
    percentage: { type: Number, required: true, default: 0 },
    passed: { type: Boolean, required: true, default: false },
    timeSpentSeconds: { type: Number, default: 0 },
    status: { type: String, enum: ['COMPLETED', 'TIMED_OUT', 'SUBMITTED'], default: 'COMPLETED' },
    completedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.activityId = ret.activityId?.toString();
        if (ret.assignmentId) ret.assignmentId = ret.assignmentId.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.studentId = ret.studentId?.toString();
        ret.classId = ret.classId?.toString();
        ret.sectionId = ret.sectionId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
ActivityAttemptSchema.index({ studentId: 1, activityId: 1 });
ActivityAttemptSchema.index({ institutionId: 1, classId: 1, sectionId: 1 });

// ══════════════════════════════════════════════════════════════════
// 9. ACTIVITY PROGRESS MODEL
// ══════════════════════════════════════════════════════════════════
export interface IActivityProgress extends Document {
  id: string;
  studentId: mongoose.Types.ObjectId | string;
  institutionId: mongoose.Types.ObjectId | string;
  activityId: mongoose.Types.ObjectId | string;
  subjectId?: mongoose.Types.ObjectId | string;
  grade: number;
  bestScore: number;
  highestPercentage: number;
  attemptsCount: number;
  isCompleted: boolean;
  lastAttemptedAt: Date;
}

const ActivityProgressSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', index: true },
    grade: { type: Number, required: true, index: true },
    bestScore: { type: Number, default: 0 },
    highestPercentage: { type: Number, default: 0 },
    attemptsCount: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    lastAttemptedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.studentId = ret.studentId?.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.activityId = ret.activityId?.toString();
        if (ret.subjectId) ret.subjectId = ret.subjectId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
ActivityProgressSchema.index({ studentId: 1, activityId: 1 }, { unique: true });

// ══════════════════════════════════════════════════════════════════
// 10. SIMULATION PROGRESS MODEL (Student / Teacher progress)
// ══════════════════════════════════════════════════════════════════
export interface ISimulationProgress extends Document {
  id: string;
  userId: mongoose.Types.ObjectId | string;
  studentId?: mongoose.Types.ObjectId | string;
  institutionId?: mongoose.Types.ObjectId | string;
  userRole: 'TEACHER' | 'STUDENT' | 'SUPER_ADMIN' | 'SCHOOL_ADMIN';
  gradeLevel: number;
  subjectCode: string;
  chapterNumber: number;
  simulationCode: string;
  simulationTitle: string;
  completedLevels: number[];
  attempts: number;
  correctAnswers: number;
  totalQuestions: number;
  assessmentScore: number;
  percentage: number;
  timeSpentSeconds: number;
  conceptsToReview: string[];
  conceptsUnderstood: string[];
  isCompleted: boolean;
  lastAttemptedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SimulationProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    userRole: { type: String, enum: ['TEACHER', 'STUDENT', 'SUPER_ADMIN', 'SCHOOL_ADMIN'], default: 'STUDENT' },
    gradeLevel: { type: Number, required: true, index: true },
    subjectCode: { type: String, required: true, index: true },
    chapterNumber: { type: Number, required: true, index: true },
    simulationCode: { type: String, required: true, index: true },
    simulationTitle: { type: String, required: true },
    completedLevels: { type: [Number], default: [] },
    attempts: { type: Number, default: 1 },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 12 },
    assessmentScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
    conceptsToReview: { type: [String], default: [] },
    conceptsUnderstood: { type: [String], default: [] },
    isCompleted: { type: Boolean, default: false },
    lastAttemptedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId?.toString();
        if (ret.studentId) ret.studentId = ret.studentId.toString();
        if (ret.institutionId) ret.institutionId = ret.institutionId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
SimulationProgressSchema.index({ userId: 1, simulationCode: 1 }, { unique: true });
SimulationProgressSchema.index({ institutionId: 1, gradeLevel: 1, subjectCode: 1 });

// ══════════════════════════════════════════════════════════════════
// MODEL EXPORTS
// ══════════════════════════════════════════════════════════════════
export const Simulation = mongoose.model<ISimulation>('Simulation', SimulationSchema);
export const SimulationVersion = mongoose.model<ISimulationVersion>('SimulationVersion', SimulationVersionSchema);
export const SimulationAsset = mongoose.model<ISimulationAsset>('SimulationAsset', SimulationAssetSchema);
export const SimulationTopic = mongoose.model<ISimulationTopic>('SimulationTopic', SimulationTopicSchema);
export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
export const ActivityQuestion = mongoose.model<IActivityQuestion>('ActivityQuestion', ActivityQuestionSchema);
export const ActivityAssignment = mongoose.model<IActivityAssignment>('ActivityAssignment', ActivityAssignmentSchema);
export const ActivityAttempt = mongoose.model<IActivityAttempt>('ActivityAttempt', ActivityAttemptSchema);
export const ActivityProgress = mongoose.model<IActivityProgress>('ActivityProgress', ActivityProgressSchema);
export const SimulationProgress = mongoose.model<ISimulationProgress>('SimulationProgress', SimulationProgressSchema);

