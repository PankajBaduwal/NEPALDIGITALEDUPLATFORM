import { PDFDocument } from 'pdf-lib';
import { GeminiService } from './gemini.service';

const { PDFParse } = require('pdf-parse');

export interface PageText {
  page: number; // 1-based
  text: string;
  method: 'TEXT' | 'OCR';
}

const OCR_BATCH_PAGES = parseInt(process.env.RAG_OCR_BATCH_PAGES || '5', 10);

const OCR_SYSTEM = `You transcribe pages of Nepal school textbooks (Government of Nepal, Curriculum Development Centre).
Rules:
- Copy ALL printed text exactly as it appears. Do not summarise, translate, correct or add anything.
- Nepali text must be written in proper Unicode Devanagari (never legacy Preeti/Latin-letter encodings).
- Write mathematics in LaTeX between $...$ (inline) or $$...$$ (display). Keep fractions, powers, roots, units and symbols exact.
- Tables: keep them as simple Markdown tables.
- Diagrams/figures: write one line "[Figure: short description of what is drawn, including any labels]".
- Keep headings, numbered exercises and bullet lists.
- Do not output page numbers printed in the margin as part of the text, and omit repeated running headers/footers.
- If a page has no readable content, output nothing for that page.`;

/** Embedded text layer, one entry per page. Only meaningful for English / Unicode text layers. */
export async function extractTextLayer(buffer: Buffer): Promise<PageText[]> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const res = await parser.getText();
    return (res.pages || []).map((p: any) => ({ page: p.num, text: (p.text || '').trim(), method: 'TEXT' as const }));
  } finally {
    await parser.destroy?.();
  }
}

export async function countPages(buffer: Buffer): Promise<number> {
  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, updateMetadata: false });
    return doc.getPageCount();
  } catch {
    // pdf-lib is strict about some producers' page trees; pdf-parse (pdf.js) reads them fine
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const info = await parser.getInfo();
      return info.total;
    } finally {
      await parser.destroy?.();
    }
  }
}

/** Extracts pages [from, to] (1-based, inclusive) into a standalone small PDF. */
export async function slicePdf(src: PDFDocument, from: number, to: number): Promise<Buffer> {
  const out = await PDFDocument.create();
  const idx = Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
  const pages = await out.copyPages(src, idx);
  pages.forEach((p) => out.addPage(p));
  return Buffer.from(await out.save());
}

/** Splits a transcript by its page markers, assigning pages in order (the model may echo printed page numbers). */
function splitTranscript(raw: string, from: number, to: number): Map<number, string> {
  const result = new Map<number, string>();
  const re = /^[ 	>*#=_-]*PAGE[ 	]+\d+[ 	>*#=_-]*$/gim;
  const marks: Array<{ index: number; end: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) marks.push({ index: m.index, end: m.index + m[0].length });
  if (marks.length !== to - from + 1) return result; // ambiguous: caller falls back to page-by-page
  marks.forEach((mk, i) => {
    result.set(from + i, raw.slice(mk.end, i + 1 < marks.length ? marks[i + 1].index : raw.length).trim());
  });
  return result;
}

/**
 * Reads page images with Gemini (used for scanned pages and legacy Preeti-font pages, whose
 * embedded text is unusable). Pages are sent as small PDF slices; no rasteriser is required.
 */
export async function ocrPages(srcBuffer: Buffer, pages: number[], onBatch?: (done: number) => void): Promise<PageText[]> {
  const src = await PDFDocument.load(srcBuffer, { ignoreEncryption: true, updateMetadata: false });
  const sorted = [...pages].sort((a, b) => a - b);
  const results: PageText[] = [];
  // group consecutive pages into batches
  const batches: number[][] = [];
  for (const p of sorted) {
    const last = batches[batches.length - 1];
    if (last && last.length < OCR_BATCH_PAGES && p === last[last.length - 1] + 1) last.push(p);
    else batches.push([p]);
  }
  const worker = async (batch: number[]) => {
    const slice = await slicePdf(src, batch[0], batch[batch.length - 1]);
    const prompt = `This PDF has ${batch.length} page(s). They are textbook pages ${batch[0]} to ${batch[batch.length - 1]} of the book.
For each page output a line exactly like "=====PAGE N=====" (N is the textbook page number ${batch[0]}..${batch[batch.length - 1]}, in order) followed by the transcription of that page.`;
    let transcript = '';
    try {
      transcript = await GeminiService.generateWithMedia({ system: OCR_SYSTEM, prompt, media: [{ mimeType: 'application/pdf', data: slice }], temperature: 0, maxOutputTokens: 16384 });
    } catch (e: any) {
      // A single bad batch (e.g. safety block) is retried page by page so one page cannot fail the whole book
      if (batch.length === 1) {
        // Gemini refuses to transcribe a page it flags as recitation/safety: keep the book going with an empty page
        if (/RECITATION|SAFETY|PROHIBITED|BLOCKLIST/i.test(String(e?.message))) {
          console.warn(`[RAG] page ${batch[0]} skipped by Gemini (${String(e.message).slice(0, 60)})`);
          return [{ page: batch[0], text: '', method: 'OCR' as const }];
        }
        throw e;
      }
      const parts: PageText[] = [];
      for (const p of batch) parts.push(...(await ocrPages(srcBuffer, [p])));
      return parts;
    }
    const map = splitTranscript(transcript, batch[0], batch[batch.length - 1]);
    if (map.size === 0 && transcript.trim()) {
      // No page markers came back: a single page is the whole transcript; several pages are re-read one by one.
      if (batch.length === 1) return [{ page: batch[0], text: transcript.replace(/^```\w*\n?|```$/g, '').trim(), method: 'OCR' as const }];
      const parts: PageText[] = [];
      for (const p of batch) parts.push(...(await ocrPages(srcBuffer, [p])));
      return parts;
    }
    return batch.map((p) => ({ page: p, text: (map.get(p) || '').trim(), method: 'OCR' as const }));
  };
  // The Gemini gate limits real concurrency; here we simply fan out.
  const settled = await Promise.all(
    batches.map(async (b) => {
      const r = await worker(b);
      onBatch?.(b.length);
      return r;
    })
  );
  settled.forEach((r) => results.push(...r));
  return results.sort((a, b) => a.page - b.page);
}
