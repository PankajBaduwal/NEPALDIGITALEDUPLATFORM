import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ENV } from '../../config/env';
import { RagDocument, RagPage, RagChunk } from '../../models/Rag';
import { Textbook } from '../../models';
import { GeminiService } from './gemini.service';
import { extractTextLayer, ocrPages, countPages, PageText } from './extraction.service';
import { chunkDocument, cleanPages, chunkKey, ChapterInfo } from './chunker';
import { VectorStore } from './vector.service';
import { EmbeddingService } from './embedding.service';
import { preetiToUnicode } from './preeti';

const INGESTION_VERSION = 1;
const SNAPSHOT = path.resolve(__dirname, '../../../data/nepal-curriculum-extraction.json');

const sha256File = (file: string) =>
  new Promise<string>((resolve, reject) => {
    const h = crypto.createHash('sha256');
    fs.createReadStream(file).on('data', (d) => h.update(d)).on('end', () => resolve(h.digest('hex'))).on('error', reject);
  });

const toFloatBuffer = (v: number[]) => Buffer.from(new Float32Array(v).buffer);

const listPdfs = (dir: string, base = dir): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return listPdfs(full, base);
    return e.name.toLowerCase().endsWith('.pdf') ? [path.relative(base, full).split(path.sep).join('/')] : [];
  });

export const IngestionService = {
  /**
   * Registers every PDF found in the Nepal data folder. Classification comes from the content-based
   * inventory snapshot; a PDF that is not in the snapshot is registered as NEEDS_REVIEW rather than guessed.
   * Also detects modified files (size/hash changed) and removed files.
   */
  async syncInventory(): Promise<{ total: number; added: number; changed: number; removed: number; needsReview: number }> {
    const snapshot = fs.existsSync(SNAPSHOT) ? JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')) : { documents: [] };
    const byPath = new Map<string, any>(snapshot.documents.map((d: any) => [d.relativePath, d]));
    const files = listPdfs(ENV.NEPAL_DATA_PATH);
    let added = 0, changed = 0, needsReview = 0;
    for (const rel of files) {
      const full = path.join(ENV.NEPAL_DATA_PATH, rel);
      const stat = fs.statSync(full);
      const snap = byPath.get(rel);
      const existing: any = await RagDocument.findOne({ relativePath: rel });
      const isRef = /^(Curriculum|Teaching)/i.test(rel);
      const grade = snap?.gradeNumber ?? (/^class(\d+)\//i.test(rel) ? parseInt(rel.match(/^class(\d+)\//i)![1], 10) : undefined);
      const range = snap?.gradeRange as number[] | undefined;
      const tb: any = await Textbook.findOne({ sourceRelativePath: rel }).select('_id').lean();
      const base: any = {
        relativePath: rel,
        fileName: path.basename(rel),
        sizeBytes: stat.size,
        textbookId: tb?._id,
        title: snap?.title || path.basename(rel, '.pdf'),
        gradeNumber: grade,
        gradeMin: range?.[0] ?? grade,
        gradeMax: range?.[1] ?? grade,
        audience: isRef ? 'STAFF' : 'ALL',
        subjectKey: snap?.subjectKey || (isRef ? 'CURRICULUM_REFERENCE' : undefined),
        subjectName: snap?.subjectName || (isRef ? 'Curriculum & Teacher Resources' : undefined),
        medium: snap?.medium || (snap?.language === 'English' ? 'ENGLISH' : snap?.language ? 'NEPALI' : 'BOTH'),
        documentType: snap?.documentType || 'TEXTBOOK',
        textLayer: snap?.textLayer,
        pageCount: snap?.pageCount,
        chapters: snap?.chapters,
      };
      if (!existing) {
        await RagDocument.create({ ...base, sha256: snap?.sha256, status: snap ? 'PENDING' : 'NEEDS_REVIEW', notes: snap ? [] : ['Not in classification snapshot — verify class/subject before indexing.'] });
        added++;
        if (!snap) needsReview++;
      } else {
        const sizeChanged = existing.sizeBytes && existing.sizeBytes !== stat.size;
        await RagDocument.updateOne({ _id: existing._id }, { $set: { ...base, ...(sizeChanged ? { status: 'PENDING', notes: ['File changed on disk — re-ingestion required.'] } : {}) } });
        if (sizeChanged) changed++;
      }
    }
    // PDFs that were deleted from disk: drop their chunks so answers never cite missing books
    const known = new Set(files);
    const gone = await RagDocument.find({ relativePath: { $nin: [...known] } }).select('_id');
    for (const g of gone) {
      await RagChunk.deleteMany({ documentId: g._id });
      await RagPage.deleteMany({ documentId: g._id });
      await RagDocument.deleteOne({ _id: g._id });
    }
    if (gone.length) VectorStore.invalidate();
    return { total: files.length, added, changed, removed: gone.length, needsReview };
  },

  /** Full pipeline for one PDF: extract (text layer or Gemini OCR) → clean → chunk → embed → index. */
  async ingestDocument(documentId: string, opts: { force?: boolean; log?: (m: string) => void } = {}): Promise<void> {
    const log = opts.log || (() => {});
    const doc: any = await RagDocument.findById(documentId);
    if (!doc) throw new Error('Document not found');
    const full = path.join(ENV.NEPAL_DATA_PATH, doc.relativePath);
    const setStatus = (status: string, extra: any = {}) => RagDocument.updateOne({ _id: doc._id }, { $set: { status, ...extra } });
    try {
      if (!fs.existsSync(full)) throw new Error('PDF file is missing on disk');
      await setStatus('PROCESSING', { error: null });
      await RagDocument.updateOne({ _id: doc._id }, { $inc: { attempts: 1 } });
      const hash = await sha256File(full);
      const unchanged = doc.sha256 === hash && doc.embeddingModel === EmbeddingService.modelName && doc.ingestionVersion === INGESTION_VERSION;
      if (doc.status === 'INDEXED' && unchanged && !opts.force) {
        log(`skip (unchanged) ${doc.relativePath}`);
        return;
      }
      const needsVector = { $or: [{ embedding: { $exists: false } }, { embeddingModel: { $ne: EmbeddingService.modelName } }] };
      const pending = await RagChunk.countDocuments({ documentId: doc._id, ...needsVector });
      const total = await RagChunk.countDocuments({ documentId: doc._id });
      const resumeEmbedding = !opts.force && doc.sha256 === hash && doc.ingestionVersion === INGESTION_VERSION && total > 0 && total === doc.chunkCount && pending > 0;
      if (resumeEmbedding) {
        log(`resume embedding ${doc.relativePath}: ${pending}/${total} chunks left`);
        await this.embedPending(doc, log);
        return;
      }
      if (doc.sha256 && doc.sha256 !== hash) await RagPage.deleteMany({ documentId: doc._id }); // file changed → cached pages are stale
      const buffer = fs.readFileSync(full);
      const pageCount = await countPages(buffer);

      // ── 1. extraction (page text is cached so a failed run resumes without repeating OCR) ──
      await setStatus('EXTRACTING', { sha256: hash, pageCount });
      const cached = await RagPage.find({ documentId: doc._id }).select('page').lean();
      const have = new Set(cached.map((c: any) => c.page));
      const all = Array.from({ length: pageCount }, (_, i) => i + 1);
      let needOcr: number[] = [];
      const textPages: PageText[] = [];
      const hasTextLayer = doc.textLayer === 'ENGLISH' || doc.textLayer === 'UNICODE_NEPALI' || doc.textLayer === 'LEGACY_NEPALI';
      const convertPreeti = doc.textLayer === 'LEGACY_NEPALI' && process.env.RAG_PREETI_MODE !== 'OCR';
      if (hasTextLayer && (doc.textLayer !== 'LEGACY_NEPALI' || convertPreeti)) {
        const layer = await extractTextLayer(buffer);
        for (const p of layer) {
          if (have.has(p.page)) continue;
          if (p.text.replace(/\s/g, '').length >= 25) textPages.push(convertPreeti ? { ...p, text: preetiToUnicode(p.text) } : p);
          else needOcr.push(p.page); // figure-only / scanned page inside a text book
        }
        if (convertPreeti) await RagDocument.updateOne({ _id: doc._id }, { $addToSet: { notes: 'Legacy Preeti text converted to Unicode locally (approximate); reprocess with RAG_PREETI_MODE=OCR for higher fidelity.' } });
      } else {
        needOcr = all.filter((p) => !have.has(p));
      }
      if (textPages.length) await RagPage.insertMany(textPages.map((p) => ({ documentId: doc._id, page: p.page, text: p.text, method: 'TEXT' })), { ordered: false }).catch(() => {});
      // For text books only OCR pages if a sizeable share is missing; a few blank figure pages need no OCR
      const emptyShare = needOcr.length / pageCount;
      if (hasTextLayer && (doc.textLayer !== 'LEGACY_NEPALI' || convertPreeti) && emptyShare < 0.2) {
        await RagPage.insertMany(needOcr.map((p) => ({ documentId: doc._id, page: p, text: '', method: 'TEXT' })), { ordered: false }).catch(() => {});
        needOcr = [];
      }
      if (needOcr.length) {
        await setStatus('OCR_REQUIRED');
        log(`OCR ${needOcr.length} pages of ${doc.relativePath}`);
        // Process in windows so progress is saved to Mongo regularly
        const WINDOW = 40;
        for (let i = 0; i < needOcr.length; i += WINDOW) {
          const win = needOcr.slice(i, i + WINDOW);
          const res = await ocrPages(buffer, win);
          await RagPage.insertMany(res.map((p) => ({ documentId: doc._id, page: p.page, text: p.text, method: 'OCR' })), { ordered: false }).catch(() => {});
          await RagDocument.updateOne({ _id: doc._id }, { $set: { pagesOcr: await RagPage.countDocuments({ documentId: doc._id, method: 'OCR', text: { $ne: '' } }) } });
          log(`  OCR ${Math.min(i + WINDOW, needOcr.length)}/${needOcr.length}`);
        }
      }
      const pages: any[] = await RagPage.find({ documentId: doc._id }).sort({ page: 1 }).lean();
      const nonEmpty = pages.filter((p) => p.text && p.text.trim().length > 0);
      await RagDocument.updateOne({
        _id: doc._id }, { $set: { pagesExtracted: nonEmpty.length, pagesEmpty: pages.length - nonEmpty.length, pagesOcr: pages.filter((p) => p.method === 'OCR' && p.text).length, extractionMethod: needOcr.length ? (textPages.length ? 'MIXED' : 'OCR') : 'TEXT' } });
      if (nonEmpty.length === 0) throw new Error('No text could be extracted from any page');

      // ── 2. cleaning + chunking ──
      await setStatus('CHUNKING');
      const cleaned = cleanPages(nonEmpty.map((p) => ({ page: p.page, text: p.text })));
      const chapters: ChapterInfo[] = (doc.chapters || []).map((c: any) => ({ chapterNumber: c.chapterNumber, title: c.title, startPage: c.startPage, endPage: c.endPage }));
      const raw = chunkDocument(cleaned, chapters);
      if (raw.length === 0) throw new Error('Chunking produced no chunks');
      await RagChunk.deleteMany({ documentId: doc._id });
      const pdfId = String(doc._id);
      const meta = {
        documentId: doc._id, textbookId: doc.textbookId, country: 'Nepal', curriculum: 'Nepal CDC', gradeNumber: doc.gradeNumber, gradeMin: doc.gradeMin, gradeMax: doc.gradeMax,
        audience: doc.audience, medium: doc.medium, subjectKey: doc.subjectKey, subjectName: doc.subjectName, textbookTitle: doc.title, pdfId, relativePath: doc.relativePath, ingestionVersion: INGESTION_VERSION,
      };
      const docs = raw.map((c, i) => ({ ...meta, ...c, chunkId: chunkKey(pdfId, i, c.text) }));
      await RagChunk.insertMany(docs, { ordered: false });
      await setStatus('EMBEDDING', { chunkCount: docs.length, chunksEmbedded: 0 });

      await this.embedPending(doc, log);
    } catch (e: any) {
      await setStatus('FAILED', { error: String(e.message || e).slice(0, 500) });
      log(`FAILED ${doc.relativePath}: ${e.message}`);
      throw e;
    }
  },

  /** Embeds every chunk of a document that has no vector yet; safe to re-run after a crash or rate-limit stop. */
  async embedPending(doc: any, log: (m: string) => void = () => {}): Promise<void> {
    await RagDocument.updateOne({ _id: doc._id }, { $set: { status: 'EMBEDDING' } });
    const rows: any[] = await RagChunk.find({ documentId: doc._id, $or: [{ embedding: { $exists: false } }, { embeddingModel: { $ne: EmbeddingService.modelName } }] }).select('_id text chapter topic').lean();
    const label = `${doc.title}${doc.gradeNumber ? ` (Class ${doc.gradeNumber})` : ''}`;
    const BATCH = 96;
    let done = (await RagChunk.countDocuments({ documentId: doc._id })) - rows.length;
    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH);
      const vecs = await EmbeddingService.embed(slice.map((r) => `${label}${r.chapter ? ` — ${r.chapter}` : ''}${r.topic ? ` — ${r.topic}` : ''}
${r.text}`), 'RETRIEVAL_DOCUMENT');
      await RagChunk.bulkWrite(slice.map((r, k) => ({ updateOne: { filter: { _id: r._id }, update: { $set: { embedding: toFloatBuffer(vecs[k]), embeddingModel: EmbeddingService.modelName } } } })));
      done += slice.length;
      await RagDocument.updateOne({ _id: doc._id }, { $set: { chunksEmbedded: done } });
    }
    await RagDocument.updateOne({ _id: doc._id }, { $set: { status: 'INDEXED', chunksEmbedded: done, ingestionVersion: INGESTION_VERSION, embeddingModel: EmbeddingService.modelName, lastIngestedAt: new Date(), error: null } });
    VectorStore.invalidate();
    log(`indexed ${doc.relativePath}: ${done} chunks`);
  },

  async status() {
    const byStatus = await RagDocument.aggregate([{ $group: { _id: '$status', n: { $sum: 1 }, pages: { $sum: '$pageCount' }, chunks: { $sum: '$chunkCount' } } }]);
    const totals = await RagDocument.aggregate([{ $group: { _id: null, docs: { $sum: 1 }, pages: { $sum: '$pageCount' }, extracted: { $sum: '$pagesExtracted' }, ocr: { $sum: '$pagesOcr' }, chunks: { $sum: '$chunkCount' } } }]);
    return { byStatus, totals: totals[0] || {} };
  },
};
