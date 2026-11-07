import mongoose, { Schema } from 'mongoose';

/** One textbook PDF tracked by the RAG ingestion pipeline. */
const RagDocumentSchema = new Schema(
  {
    relativePath: { type: String, required: true, unique: true },
    fileName: String,
    sha256: { type: String, index: true },
    sizeBytes: Number,
    pageCount: Number,
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook', index: true },
    title: String,
    gradeNumber: { type: Number, index: true },
    gradeMin: Number,
    gradeMax: Number,
    audience: { type: String, enum: ['ALL', 'STAFF'], default: 'ALL' }, // STAFF = curriculum frameworks and teacher guides
    subjectKey: { type: String, index: true },
    subjectName: String,
    medium: { type: String, index: true }, // NEPALI | ENGLISH | BOTH
    documentType: String, // TEXTBOOK | SELF_STUDY | CURRICULUM | TEACHING_MATERIAL
    textLayer: String, // ENGLISH | UNICODE_NEPALI | LEGACY_NEPALI | NONE
    extractionMethod: String, // TEXT | OCR | MIXED
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'EXTRACTING', 'OCR_REQUIRED', 'CHUNKING', 'EMBEDDING', 'INDEXED', 'FAILED', 'NEEDS_REVIEW'],
      default: 'PENDING',
      index: true,
    },
    pagesExtracted: { type: Number, default: 0 },
    pagesOcr: { type: Number, default: 0 },
    pagesEmpty: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    chunksEmbedded: { type: Number, default: 0 },
    ingestionVersion: { type: Number, default: 1 },
    embeddingModel: String,
    error: String,
    attempts: { type: Number, default: 0 },
    lastIngestedAt: Date,
    chapters: { type: Schema.Types.Mixed },
    notes: [String],
  },
  { timestamps: true }
);

/** Page-level text cache. Lets a failed run resume without paying for OCR again. */
const RagPageSchema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'RagDocument', required: true, index: true },
    page: { type: Number, required: true },
    text: { type: String, default: '' },
    method: { type: String, enum: ['TEXT', 'OCR'], default: 'TEXT' },
  },
  { timestamps: true }
);
RagPageSchema.index({ documentId: 1, page: 1 }, { unique: true });

/** A retrievable passage of textbook text with its embedding and full source metadata. */
const RagChunkSchema = new Schema(
  {
    chunkId: { type: String, required: true, unique: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'RagDocument', required: true, index: true },
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook' },
    country: { type: String, default: 'Nepal' },
    curriculum: { type: String, default: 'Nepal CDC' },
    gradeNumber: { type: Number, index: true },
    gradeMin: Number,
    gradeMax: Number,
    audience: { type: String, enum: ['ALL', 'STAFF'], default: 'ALL', index: true },
    medium: { type: String, index: true },
    subjectKey: { type: String, index: true },
    subjectName: String,
    textbookTitle: String,
    unit: String,
    chapterNumber: Number,
    chapter: String,
    topic: String,
    pdfId: String,
    relativePath: String,
    pageStart: Number,
    pageEnd: Number,
    contentType: { type: String, enum: ['TEXT', 'EXERCISE', 'FORMULA', 'TABLE'], default: 'TEXT' },
    ingestionVersion: Number,
    text: { type: String, required: true },
    embedding: { type: Buffer }, // Float32 little-endian, L2-normalised
    embeddingModel: String,
  },
  { timestamps: true }
);
RagChunkSchema.index({ gradeNumber: 1, subjectKey: 1, medium: 1 });
RagChunkSchema.index({ text: 'text' }, { default_language: 'none' });

const RagConversationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: String,
    title: String,
    scope: { type: Schema.Types.Mixed },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'] },
        content: String,
        sources: { type: Schema.Types.Mixed },
        grounded: Boolean,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const RagUsageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, index: true },
    institutionId: { type: Schema.Types.ObjectId, index: true },
    role: String,
    feature: String,
    inputTokens: Number,
    outputTokens: Number,
    latencyMs: Number,
    grounded: Boolean,
    ok: Boolean,
  },
  { timestamps: true }
);

export const RagDocument = mongoose.models.RagDocument || mongoose.model('RagDocument', RagDocumentSchema);
export const RagPage = mongoose.models.RagPage || mongoose.model('RagPage', RagPageSchema);
export const RagChunk = mongoose.models.RagChunk || mongoose.model('RagChunk', RagChunkSchema);
export const RagConversation = mongoose.models.RagConversation || mongoose.model('RagConversation', RagConversationSchema);
export const RagUsage = mongoose.models.RagUsage || mongoose.model('RagUsage', RagUsageSchema);
