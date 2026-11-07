import mongoose, { Schema, Document } from 'mongoose';

// ══════════════════════════════════════════════════════════════════
// 1. AI DOCUMENT CHUNK (RAG Vector Store)
// ══════════════════════════════════════════════════════════════════
export interface IAIDocumentChunk extends Document {
  id: string;
  textbookId?: mongoose.Types.ObjectId | string;
  textbookTitle: string;
  grade: number; // 1 to 12
  subjectCode: string; // e.g. "SCI", "MTH", "ENG", "NEP", "SOC", "COM"
  medium: 'NEPALI' | 'ENGLISH' | 'BOTH';
  chapterNumber: number;
  chapterTitle: string;
  topic?: string;
  pageNumber: number;
  chunkIndex: number;
  content: string;
  embedding: number[]; // Dense vector (e.g. 128-dim)
  tokenCount: number;
  createdAt: Date;
}

const AIDocumentChunkSchema = new Schema(
  {
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook', index: true },
    textbookTitle: { type: String, required: true, index: true },
    grade: { type: Number, required: true, index: true },
    subjectCode: { type: String, required: true, index: true },
    medium: { type: String, enum: ['NEPALI', 'ENGLISH', 'BOTH'], default: 'BOTH', index: true },
    chapterNumber: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    topic: { type: String },
    pageNumber: { type: Number, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    tokenCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.textbookId) ret.textbookId = ret.textbookId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
AIDocumentChunkSchema.index({ grade: 1, subjectCode: 1 });
AIDocumentChunkSchema.index({ textbookId: 1, chapterNumber: 1 });

// ══════════════════════════════════════════════════════════════════
// 2. AI CONVERSATION (Chat Session)
// ══════════════════════════════════════════════════════════════════
export type AIMode =
  | 'STUDENT_TUTOR'
  | 'STEP_BY_STEP'
  | 'PRACTICE_GEN'
  | 'TEACHER_LESSON_PLAN'
  | 'TEACHER_WORKSHEET'
  | 'MCQ_GENERATOR'
  | 'SMARTBOARD_EXPLAIN';

export interface IAIConversation extends Document {
  id: string;
  userId: mongoose.Types.ObjectId | string;
  institutionId?: mongoose.Types.ObjectId | string;
  userRole: 'STUDENT' | 'TEACHER' | 'SCHOOL_ADMIN' | 'SUPER_ADMIN';
  title: string;
  mode: AIMode;
  grade?: number;
  subjectCode?: string;
  textbookId?: mongoose.Types.ObjectId | string;
  chapterNumber?: number;
  chapterTitle?: string;
  language: 'ne' | 'en' | 'auto';
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    userRole: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'],
      required: true,
    },
    title: { type: String, required: true, default: 'New Learning Conversation' },
    mode: {
      type: String,
      enum: [
        'STUDENT_TUTOR',
        'STEP_BY_STEP',
        'PRACTICE_GEN',
        'TEACHER_LESSON_PLAN',
        'TEACHER_WORKSHEET',
        'MCQ_GENERATOR',
        'SMARTBOARD_EXPLAIN',
      ],
      default: 'STUDENT_TUTOR',
      index: true,
    },
    grade: { type: Number },
    subjectCode: { type: String },
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook' },
    chapterNumber: { type: Number },
    chapterTitle: { type: String },
    language: { type: String, enum: ['ne', 'en', 'auto'], default: 'auto' },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId?.toString();
        if (ret.institutionId) ret.institutionId = ret.institutionId.toString();
        if (ret.textbookId) ret.textbookId = ret.textbookId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
AIConversationSchema.index({ userId: 1, updatedAt: -1 });

// ══════════════════════════════════════════════════════════════════
// 3. AI MESSAGE (Chat History & Citations)
// ══════════════════════════════════════════════════════════════════
export interface IAICitation {
  textbookTitle: string;
  grade: number;
  chapterNumber: number;
  chapterTitle: string;
  pageNumber: number;
  pageEnd?: number;
  excerpt: string;
  relevanceScore: number;
  textbookId?: string;
  relativePath?: string;
  subjectName?: string;
}

export interface IAIMessage extends Document {
  id: string;
  conversationId: mongoose.Types.ObjectId | string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  citations: IAICitation[];
  suggestedQuestions: string[];
  feedback?: {
    rating: 'POSITIVE' | 'NEGATIVE';
    comment?: string;
  };
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  createdAt: Date;
}

const AIMessageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'AIConversation', required: true, index: true },
    sender: { type: String, enum: ['USER', 'ASSISTANT', 'SYSTEM'], required: true },
    content: { type: String, required: true },
    citations: [
      {
        textbookTitle: { type: String, required: true },
        grade: { type: Number, required: true },
        chapterNumber: { type: Number, default: 0 },
        chapterTitle: { type: String, default: '' },
        pageNumber: { type: Number, required: true },
        pageEnd: { type: Number },
        excerpt: { type: String, required: true },
        relevanceScore: { type: Number, default: 1.0 },
        textbookId: { type: String },
        relativePath: { type: String },
        subjectName: { type: String },
      },
    ],
    suggestedQuestions: { type: [String], default: [] },
    feedback: {
      rating: { type: String, enum: ['POSITIVE', 'NEGATIVE'] },
      comment: { type: String },
    },
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.conversationId = ret.conversationId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
AIMessageSchema.index({ conversationId: 1, createdAt: 1 });

// ══════════════════════════════════════════════════════════════════
// 4. AI USAGE (Token quotas & institutional cost monitoring)
// ══════════════════════════════════════════════════════════════════
export interface IAIUsage extends Document {
  id: string;
  institutionId?: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  userRole: string;
  dateKey: string; // e.g. "2081-08-01" or "2026-11-02"
  queryCount: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  updatedAt: Date;
}

const AIUsageSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userRole: { type: String, required: true },
    dateKey: { type: String, required: true, index: true },
    queryCount: { type: Number, default: 0 },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId?.toString();
        if (ret.institutionId) ret.institutionId = ret.institutionId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
AIUsageSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
AIUsageSchema.index({ institutionId: 1, dateKey: 1 });

// ══════════════════════════════════════════════════════════════════
// 5. AI FEEDBACK (Quality monitoring & evaluation)
// ══════════════════════════════════════════════════════════════════
export interface IAIFeedback extends Document {
  id: string;
  messageId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  institutionId?: mongoose.Types.ObjectId | string;
  rating: 'POSITIVE' | 'NEGATIVE';
  comment?: string;
  category?: 'INACCURATE_FACT' | 'WRONG_CITATION' | 'UNHELPFUL' | 'EXCELLENT' | 'CLEAR_EXPLANATION';
  createdAt: Date;
}

const AIFeedbackSchema = new Schema(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'AIMessage', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    rating: { type: String, enum: ['POSITIVE', 'NEGATIVE'], required: true },
    comment: { type: String },
    category: {
      type: String,
      enum: ['INACCURATE_FACT', 'WRONG_CITATION', 'UNHELPFUL', 'EXCELLENT', 'CLEAR_EXPLANATION'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.messageId = ret.messageId?.toString();
        ret.userId = ret.userId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// MODEL EXPORTS
// ══════════════════════════════════════════════════════════════════
export const AIDocumentChunk = mongoose.model<IAIDocumentChunk>('AIDocumentChunk', AIDocumentChunkSchema);
export const AIConversation = mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);
export const AIMessage = mongoose.model<IAIMessage>('AIMessage', AIMessageSchema);
export const AIUsage = mongoose.model<IAIUsage>('AIUsage', AIUsageSchema);
export const AIFeedback = mongoose.model<IAIFeedback>('AIFeedback', AIFeedbackSchema);

