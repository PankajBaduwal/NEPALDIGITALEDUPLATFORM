import fs from 'fs';
import crypto from 'crypto';
import { Textbook, TextbookChapter, ContentProcessingJob } from '../../models';
import { detectTextLayer, extractChapters } from './nepal-data/nepal-data-extractor';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require('pdf-parse');

export class PdfProcessorService {
  /**
   * Calculate SHA-256 hash of a file to detect duplicates.
   */
  static calculateFileHash(bufferOrPath: Buffer | string): string {
    const hash = crypto.createHash('sha256');
    hash.update(typeof bufferOrPath === 'string' ? fs.readFileSync(bufferOrPath) : bufferOrPath);
    return hash.digest('hex');
  }

  /**
   * Asynchronously read an uploaded textbook PDF: page count, text layer and chapters
   * from its printed contents page. When the book states no contents page, no chapters
   * are created; the Super Admin enters them in the chapter editor.
   */
  static async processTextbookPdf(params: { textbookId: string; filePath: string; fileName: string }) {
    const { textbookId, filePath, fileName } = params;
    const fileHash = this.calculateFileHash(filePath);
    const job = await ContentProcessingJob.create({
      textbookId,
      fileName,
      fileHash,
      status: 'PROCESSING',
      startedAt: new Date(),
    });

    setImmediate(async () => {
      try {
        const buffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        await parser.destroy();
        const pages: string[] = (result.pages || []).map((p: any) => p.text || '');
        const fullChars = pages.reduce((n, t) => n + t.trim().length, 0);
        const textLayer = detectTextLayer(pages.slice(0, 40).join('\n'), fullChars);
        const { chapters, note } =
          textLayer === 'ENGLISH' || textLayer === 'UNICODE_NEPALI' ? extractChapters(pages) : { chapters: [], note: `Text layer ${textLayer}: chapters must be entered manually` };

        const manual = await TextbookChapter.countDocuments({ textbookId, source: 'MANUAL' });
        if (!manual) {
          await TextbookChapter.deleteMany({ textbookId });
          if (chapters.length) {
            await TextbookChapter.insertMany(
              chapters.map((c) => ({
                textbookId,
                chapterNumber: c.chapterNumber,
                title: c.title,
                startPage: c.startPage,
                endPage: c.endPage,
                source: 'TABLE_OF_CONTENTS',
                verificationStatus: c.pageMatched ? 'VERIFIED' : 'NEEDS_REVIEW',
              }))
            );
          }
        }

        await Textbook.findByIdAndUpdate(textbookId, {
          $set: {
            pageCount: pages.length,
            fileHash,
            fileSize: buffer.length,
            textLayer,
            status: 'PUBLISHED',
            extractionStatus: chapters.length ? 'CHAPTERS_EXTRACTED' : 'CHAPTERS_NOT_EXTRACTED',
            chapters: chapters.map((c) => ({ chapterNumber: c.chapterNumber, name: c.title, startPage: c.startPage, endPage: c.endPage, topics: [] })),
          },
          ...(note ? { $addToSet: { issues: note } } : {}),
        });

        job.status = 'COMPLETED';
        job.totalPages = pages.length;
        job.processedPages = pages.length;
        job.extractedChaptersCount = chapters.length;
        job.completedAt = new Date();
        await job.save();
      } catch (err: any) {
        console.error(`[PDF Processor] Failed to process ${fileName}:`, err);
        job.status = 'FAILED';
        job.errorDetails = err.message;
        job.completedAt = new Date();
        await job.save();
        await Textbook.findByIdAndUpdate(textbookId, { $set: { status: 'DRAFT' }, $addToSet: { issues: `PDF could not be parsed: ${err.message}` } });
      }
    });

    return job;
  }
}
