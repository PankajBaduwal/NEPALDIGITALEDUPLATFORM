import mongoose, { Schema, Document } from 'mongoose';

export type QuestionType =
  | 'MCQ'
  | 'MULTIPLE_CORRECT'
  | 'FILL_BLANK'
  | 'ASSERTION_REASON'
  | 'NUMERICAL'
  | 'SHORT_CONCEPTUAL'
  | 'CASE_SCENARIO'
  | 'TRUE_FALSE'
  | 'MATCHING'
  | 'DESCRIPTIVE';

export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface IQuizOption {
  id: string;
  text: string;
}

export interface IQuizMatchingPair {
  left: string;
  right: string;
}

export interface IQuizQuestion {
  id?: string;
  questionText: string;
  questionType: QuestionType;
  options: IQuizOption[];
  correctAnswers: string | string[] | number; // Option ID(s), text, or numerical value
  marks: number;
  explanation?: string;
  chapterNumber?: number;
  topic?: string;
  unit?: string | number;
  assertionText?: string;
  reasonText?: string;
  numericalAnswer?: number;
  tolerance?: number;
  unitLabel?: string;
  matchingPairs?: IQuizMatchingPair[];
  bloomLevel?: string;
  negativeMarks?: number;
  rubricGuide?: string;
}

export interface IQuizCurriculumUnit {
  unitNumber: number;
  title: string;
  description?: string;
}

export interface IQuizSecuritySettings {
  enforceFullscreen?: boolean;
  detectTabSwitch?: boolean;
  autoSubmitOnViolations?: boolean;
  blockCopyPaste?: boolean;
  maxWarnings?: number;
  navigationRule?: 'FREE' | 'SEQUENTIAL';
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
}

export interface IQuizAttemptPolicy {
  maxAttempts?: number;
}

export interface IQuizResultSettings {
  showResultImmediately?: boolean;
  showExplanations?: boolean;
  allowReviewAnswers?: boolean;
  showCorrectAfterClose?: boolean;
  hideMarksUntilApproval?: boolean;
}

export interface IQuizNegativeMarking {
  enabled?: boolean;
  penaltyPerWrong?: number;
}

export interface IQuizSourceNote {
  title: string;
  fileUrl?: string;
  content?: string;
}

export interface IQuiz extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  title: string;
  description?: string;
  medium: 'ENGLISH' | 'NEPALI' | 'BOTH';
  textbookId?: mongoose.Types.ObjectId | string;
  chapterNumber?: number;
  topic?: string;
  curriculumUnits?: IQuizCurriculumUnit[];
  targetMode?: 'CHAPTER_WISE' | 'COMBINED';
  difficultyLevel: QuizDifficulty;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  passingScorePercent?: number;
  instructions?: string;
  startTime?: Date;
  endTime?: Date;
  questions: IQuizQuestion[];
  securitySettings?: IQuizSecuritySettings;
  attemptPolicy?: IQuizAttemptPolicy;
  resultSettings?: IQuizResultSettings;
  negativeMarking?: IQuizNegativeMarking;
  sourceNotes?: IQuizSourceNote[];
  isAiGenerated: boolean;
  aiGenerationMetadata?: any;
  status: QuizStatus;
  createdAt: Date;
  updatedAt: Date;
}

const QuizOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const QuizMatchingPairSchema = new Schema(
  {
    left: { type: String, required: true },
    right: { type: String, required: true },
  },
  { _id: false }
);

const QuizQuestionSchema = new Schema(
  {
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: [
        'MCQ',
        'MULTIPLE_CORRECT',
        'FILL_BLANK',
        'ASSERTION_REASON',
        'NUMERICAL',
        'SHORT_CONCEPTUAL',
        'CASE_SCENARIO',
        'TRUE_FALSE',
        'MATCHING',
        'DESCRIPTIVE',
      ],
      default: 'MCQ',
    },
    options: { type: [QuizOptionSchema], default: [] },
    correctAnswers: { type: Schema.Types.Mixed, required: true },
    marks: { type: Number, default: 1, min: 0.5 },
    explanation: { type: String },
    chapterNumber: { type: Number },
    topic: { type: String },
    unit: { type: Schema.Types.Mixed },
    assertionText: { type: String },
    reasonText: { type: String },
    numericalAnswer: { type: Number },
    tolerance: { type: Number, default: 0 },
    unitLabel: { type: String },
    matchingPairs: { type: [QuizMatchingPairSchema], default: [] },
    bloomLevel: { type: String },
    negativeMarks: { type: Number, default: 0 },
    rubricGuide: { type: String },
  },
  { _id: true }
);

const QuizSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    medium: { type: String, enum: ['ENGLISH', 'NEPALI', 'BOTH'], default: 'BOTH' },
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook' },
    chapterNumber: { type: Number },
    topic: { type: String },
    curriculumUnits: {
      type: Schema.Types.Mixed,
      default: [],
    },
    targetMode: { type: String, enum: ['CHAPTER_WISE', 'COMBINED'], default: 'CHAPTER_WISE' },
    difficultyLevel: { type: String, enum: ['EASY', 'MEDIUM', 'HARD', 'MIXED'], default: 'MEDIUM' },
    durationMinutes: { type: Number, required: true, default: 20, min: 1, max: 180 },
    totalMarks: { type: Number, required: true, default: 10, min: 1 },
    passingMarks: { type: Number, default: 4 },
    passingScorePercent: { type: Number, default: 50 },
    instructions: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    questions: { type: [QuizQuestionSchema], default: [] },
    securitySettings: {
      enforceFullscreen: { type: Boolean, default: true },
      detectTabSwitch: { type: Boolean, default: true },
      autoSubmitOnViolations: { type: Boolean, default: true },
      blockCopyPaste: { type: Boolean, default: true },
      maxWarnings: { type: Number, default: 3 },
      navigationRule: { type: String, enum: ['FREE', 'SEQUENTIAL'], default: 'FREE' },
      randomizeQuestions: { type: Boolean, default: false },
      randomizeOptions: { type: Boolean, default: false },
    },
    attemptPolicy: {
      maxAttempts: { type: Number, default: 1 },
    },
    resultSettings: {
      showResultImmediately: { type: Boolean, default: true },
      showExplanations: { type: Boolean, default: true },
      allowReviewAnswers: { type: Boolean, default: true },
      showCorrectAfterClose: { type: Boolean, default: false },
      hideMarksUntilApproval: { type: Boolean, default: false },
    },
    negativeMarking: {
      enabled: { type: Boolean, default: false },
      penaltyPerWrong: { type: Number, default: 0.25 },
    },
    sourceNotes: {
      type: [{ title: String, fileUrl: String, content: String }],
      default: [],
    },
    isAiGenerated: { type: Boolean, default: false },
    aiGenerationMetadata: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT', index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
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

QuizSchema.index({ institutionId: 1, sectionId: 1, status: 1 });
QuizSchema.index({ teacherId: 1, createdAt: -1 });

export const Quiz =
  mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema, 'quizzes');

// ══════════════════════════════════════════════════════════════════
// QUIZ ATTEMPT / SUBMISSION
// ══════════════════════════════════════════════════════════════════
export interface IQuizSecurityEvent {
  eventType: 'FULLSCREEN_EXIT' | 'TAB_SWITCH' | 'COPY_PASTE_ATTEMPT' | 'WARNING_TRIGGERED' | 'FOCUS_LOST';
  timestamp: Date;
  details?: string;
}

export interface IQuizAttemptAnswer {
  questionId: string;
  selectedOption: string | string[] | number;
  isCorrect?: boolean;
  scoreAwarded?: number;
  explanation?: string;
  needsReview?: boolean;
}

export interface IQuizAttempt extends Document {
  id: string;
  quizId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  institutionId: mongoose.Types.ObjectId | string;
  attemptNumber: number;
  warningsCount: number;
  securityEvents: IQuizSecurityEvent[];
  answers: IQuizAttemptAnswer[];
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  submittedAt: Date;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED';
  createdAt: Date;
  updatedAt: Date;
}

const QuizSecurityEventSchema = new Schema(
  {
    eventType: {
      type: String,
      enum: ['FULLSCREEN_EXIT', 'TAB_SWITCH', 'COPY_PASTE_ATTEMPT', 'WARNING_TRIGGERED', 'FOCUS_LOST'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
  },
  { _id: false }
);

const QuizAttemptAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    selectedOption: { type: Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean },
    scoreAwarded: { type: Number, default: 0 },
    explanation: { type: String },
    // Free-text answer that automatic grading could not match; a teacher must review it
    needsReview: { type: Boolean, default: false },
  },
  { _id: false }
);

const QuizAttemptSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    attemptNumber: { type: Number, default: 1 },
    warningsCount: { type: Number, default: 0 },
    securityEvents: { type: [QuizSecurityEventSchema], default: [] },
    answers: { type: [QuizAttemptAnswerSchema], default: [] },
    score: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, required: true, default: 10 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    timeSpentSeconds: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED'], default: 'SUBMITTED' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.quizId = ret.quizId?.toString();
        ret.studentId = ret.studentId?.toString();
        ret.institutionId = ret.institutionId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

QuizAttemptSchema.index({ quizId: 1, studentId: 1 });
QuizAttemptSchema.index({ institutionId: 1, studentId: 1 });

export const QuizAttempt =
  mongoose.models.QuizAttempt ||
  mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema, 'quizAttempts');


// Server-side clock for a timed attempt: created when the student first opens the quiz.
const QuizSessionSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    attemptNumber: { type: Number, required: true },
    startedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
QuizSessionSchema.index({ quizId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });

export const QuizSession =
  mongoose.models.QuizSession || mongoose.model('QuizSession', QuizSessionSchema, 'quizSessions');
