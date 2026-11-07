import crypto from 'crypto';

export interface ChapterInfo {
  chapterNumber: number;
  title: string;
  startPage: number;
  endPage?: number;
}

export interface RawChunk {
  text: string;
  pageStart: number;
  pageEnd: number;
  chapterNumber?: number;
  chapter?: string;
  topic?: string;
  contentType: 'TEXT' | 'EXERCISE' | 'FORMULA' | 'TABLE';
}

const TARGET = parseInt(process.env.RAG_CHUNK_CHARS || '1300', 10);
const MAX = Math.round(TARGET * 1.45);
const OVERLAP = 220;

/** Removes running headers/footers (lines repeated on many pages) and bare page numbers. */
export function cleanPages(pages: Array<{ page: number; text: string }>): Array<{ page: number; text: string }> {
  const freq = new Map<string, number>();
  const norm = (l: string) => l.trim().replace(/[0-9०-९]+/g, '#').toLowerCase();
  for (const p of pages) {
    const seen = new Set<string>();
    for (const l of p.text.split('\n')) {
      const n = norm(l);
      if (n.length >= 4 && n.length <= 80 && !seen.has(n)) {
        seen.add(n);
        freq.set(n, (freq.get(n) || 0) + 1);
      }
    }
  }
  const threshold = Math.max(6, Math.floor(pages.length * 0.25));
  return pages.map((p) => {
    const lines = p.text
      .replace(/\r/g, '')
      .split('\n')
      .filter((l) => {
        const t = l.trim();
        if (!t) return true;
        if (/^[0-9०-९]{1,4}$/.test(t)) return false; // lone page number
        const n = norm(l);
        if (n.length <= 80 && (freq.get(n) || 0) >= threshold && !/[.?।:]\s*$/.test(t)) return false; // running header/footer
        return true;
      });
    const text = lines.join('\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    return { page: p.page, text };
  });
}

const isHeading = (line: string) => {
  const t = line.trim();
  if (!t || t.length > 90) return false;
  if (/^#{1,6}\s/.test(t)) return true;
  if (/^(unit|chapter|lesson|इकाई|पाठ|परिच्छेद)\b/i.test(t)) return true;
  if (/^[0-9०-९]+(\.[0-9०-९]+)*[.)]?\s+\S/.test(t) && t.length < 70 && !/[.?।]$/.test(t)) return true;
  return false;
};

/** A passage made mostly of questions / lettered sub-questions / instructions is an exercise, not an explanation. */
export const looksLikeExercise = (text: string): boolean => {
  const len = Math.max(1, text.length);
  const questions = (text.match(/\?/g) || []).length;
  const lettered = (text.match(/(^|\s)\(?[a-fA-F][.)]\s+[A-Z]/g) || []).length + (text.match(/\([कखगघअआइईa-e]\)/g) || []).length;
  const imperative = (text.match(/\b(write|answer the following|fill in the blanks?|match the following|choose the correct|tick the correct|discuss|explain why|find the value|calculate|prove that)\b|लेख्नुहोस्|गर्नुहोस्|उत्तर दिनुहोस्|खाली ठाउँ|जोडा मिलाउनुहोस्|सही उत्तर|पत्ता लगाउनुहोस्|प्रमाणित गर्नुहोस्/gi) || []).length;
  const score = (questions * 1000) / len / 4 + lettered * 0.5 + imperative * 0.6;
  return score >= 3;
};

const classify = (text: string): RawChunk['contentType'] => {
  if (/(exercise|review questions|practice|अभ्यास|प्रश्नहरू|प्रश्न)/i.test(text.slice(0, 200)) || looksLikeExercise(text)) return 'EXERCISE';
  if ((text.match(/\|/g) || []).length > 12 && /\|\s*-{2,}/.test(text)) return 'TABLE';
  if ((text.match(/\$/g) || []).length >= 6) return 'FORMULA';
  return 'TEXT';
};

function chapterFor(page: number, chapters: ChapterInfo[]): ChapterInfo | undefined {
  let found: ChapterInfo | undefined;
  for (const c of chapters) if (c.startPage <= page && (!found || c.startPage >= found.startPage)) found = c;
  return found;
}

/**
 * Structure-aware chunking: paragraphs and headings are kept whole, chunks never cross a chapter
 * boundary, and consecutive chunks overlap so definitions are not cut off from their explanation.
 */
export function chunkDocument(pages: Array<{ page: number; text: string }>, chapters: ChapterInfo[]): RawChunk[] {
  type Para = { text: string; page: number; chapter?: ChapterInfo; heading: boolean };
  const paras: Para[] = [];
  const sorted = [...chapters].sort((a, b) => a.startPage - b.startPage);
  for (const p of pages) {
    if (!p.text) continue;
    const ch = chapterFor(p.page, sorted);
    for (const block of p.text.split(/\n{2,}/)) {
      const t = block.trim();
      if (!t) continue;
      // very long blocks (e.g. OCR without blank lines) are split on sentence ends
      if (t.length > MAX) {
        let rest = t;
        while (rest.length > MAX) {
          const cut = Math.max(rest.lastIndexOf('\n', TARGET), rest.lastIndexOf('। ', TARGET), rest.lastIndexOf('. ', TARGET));
          const at = cut > TARGET * 0.5 ? cut + 1 : TARGET;
          paras.push({ text: rest.slice(0, at).trim(), page: p.page, chapter: ch, heading: false });
          rest = rest.slice(at).trim();
        }
        if (rest) paras.push({ text: rest, page: p.page, chapter: ch, heading: false });
      } else {
        paras.push({ text: t, page: p.page, chapter: ch, heading: isHeading(t.split('\n')[0]) && t.split('\n').length <= 2 });
      }
    }
  }

  const chunks: RawChunk[] = [];
  let buf: Para[] = [];
  let topic: string | undefined;
  const size = () => buf.reduce((n, p) => n + p.text.length + 2, 0);
  const flush = (keepOverlap: boolean) => {
    if (!buf.length) return;
    const text = buf.map((p) => p.text).join('\n\n').trim();
    if (text.length >= 40) {
      const ch = buf[0].chapter;
      chunks.push({
        text,
        pageStart: buf[0].page,
        pageEnd: buf[buf.length - 1].page,
        chapterNumber: ch?.chapterNumber,
        chapter: ch?.title,
        topic,
        contentType: classify(text),
      });
    }
    if (keepOverlap) {
      const tail: Para[] = [];
      let n = 0;
      for (let i = buf.length - 1; i >= 0 && n < OVERLAP; i--) {
        tail.unshift(buf[i]);
        n += buf[i].text.length;
      }
      buf = tail.length === buf.length ? [] : tail;
    } else buf = [];
  };

  for (const para of paras) {
    if (buf.length && buf[0].chapter?.chapterNumber !== para.chapter?.chapterNumber) flush(false); // chapter boundary
    if (para.heading) {
      if (size() > TARGET * 0.35) flush(false); // start a new chunk at a real heading
      topic = para.text.replace(/^#+\s*/, '').split('\n')[0].slice(0, 120);
    }
    if (buf.length && size() + para.text.length > TARGET) flush(true);
    buf.push(para);
  }
  flush(false);
  return chunks;
}

export const chunkKey = (pdfId: string, i: number, text: string) =>
  `${pdfId}:${i}:${crypto.createHash('sha1').update(text).digest('hex').slice(0, 10)}`;
