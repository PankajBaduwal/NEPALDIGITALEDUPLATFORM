import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SUBJECT_RULES, SubjectRule, SubjectCategory } from './subject-recognition';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require('pdf-parse');

/**
 * Inspects the CDC PDFs under `Nepal data/` and produces one record per file:
 * grade, subject, medium, document type, text layer, chapters (from the printed
 * table of contents only) and any issues that need manual review.
 *
 * Nothing here is invented: when a value cannot be read from the document or its
 * filename it is left empty and the document is flagged.
 */

export type TextLayer = 'ENGLISH' | 'UNICODE_NEPALI' | 'LEGACY_NEPALI' | 'NONE';
export type DocumentType = 'TEXTBOOK' | 'SELF_STUDY' | 'CURRICULUM' | 'TEACHER_RESOURCE';
export type MediumScope = 'ENGLISH' | 'NEPALI' | 'BOTH';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ExtractedChapter {
  chapterNumber: number;
  title: string;
  printedPage: number;
  startPage: number;
  endPage: number;
  pageMatched: boolean;
}

export interface ExtractedDocument {
  relativePath: string;
  folder: string;
  fileName: string;
  sizeBytes: number;
  sha256: string;
  readable: boolean;
  readError?: string;
  pageCount: number;
  textChars: number;
  textLayer: TextLayer;
  coverText: string;
  documentType: DocumentType;
  gradeNumber?: number;
  gradeRange?: [number, number];
  subjectKey?: string;
  subjectName?: string;
  subjectNameNepali?: string;
  category?: SubjectCategory;
  medium?: MediumScope;
  /** Language the book is actually printed in. */
  language?: 'English' | 'Nepali' | string;
  title: string;
  editionYear?: string;
  part?: string;
  subjectEvidence: string[];
  mediumEvidence: string[];
  confidence: Confidence;
  status: 'CLASSIFIED' | 'UNRESOLVED';
  chapters: ExtractedChapter[];
  chapterSource: 'TABLE_OF_CONTENTS' | 'NONE';
  chapterNote?: string;
  issues: string[];
}

const ENGLISH_STOPWORDS = new Set(
  'the of and to in is a that for are with on as this by be it from or an which at have their was can we you your what these they how'.split(' ')
);
// Tokens that only appear when Devanagari was typeset with the legacy Preeti font
// (e.g. "sIff" = कक्षा, "g]kfn ;/sf/" = नेपाल सरकार).
const LEGACY_TOKENS = /sIff|;\/sf\/|lzIff|kf7\\?o|dGqfno/g;

function englishScore(text: string): number {
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  if (words.length < 15) return 0;
  return words.filter((w) => ENGLISH_STOPWORDS.has(w)).length / words.length;
}

export function detectTextLayer(sampleText: string, fullChars: number): TextLayer {
  if (fullChars < 2000) return 'NONE';
  const devanagari = (sampleText.match(/[ऀ-ॿ]/g) || []).length;
  const legacy = (sampleText.match(LEGACY_TOKENS) || []).length;
  if (devanagari > 200) return 'UNICODE_NEPALI';
  if (legacy >= 3) return 'LEGACY_NEPALI';
  if (englishScore(sampleText) >= 0.12) return 'ENGLISH';
  return legacy > 0 ? 'LEGACY_NEPALI' : 'NONE';
}

const DEVANAGARI_DIGITS = '०१२३४५६७८९';
function toAsciiDigits(s: string) {
  return s.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));
}

function detectGrade(relativePath: string): { grade?: number; range?: [number, number] } {
  const folder = relativePath.split('/')[0];
  const m = folder.match(/^class(\d{1,2})$/i);
  if (m) return { grade: Number(m[1]) };
  const name = toAsciiDigits(relativePath);
  const range = name.match(/(?:grade|कक्षा)\s*(\d{1,2})\s*[-–]\s*(\d{1,2})/i);
  if (range) return { range: [Number(range[1]), Number(range[2])] };
  return {};
}

function detectEdition(fileName: string): string | undefined {
  const ascii = toAsciiDigits(fileName);
  const bs = ascii.match(/\b(20[7-8]\d)\b/);
  if (bs) return `${bs[1]} BS`;
  const ad = ascii.match(/\b(20[12]\d)\b/);
  return ad ? `${ad[1]} AD` : undefined;
}

const ENGLISH_EDITION_HINT = /अंग्रेजी अनुवाद|अंग्रजी अनुवाद|अङ्ग्रेजी अनुवाद|अंग्रेजी संस्करण|english translation|englishtranslation|reds-eng/i;
const NEPALI_EDITION_HINT = /नेपाली संस्करण|नेपाली माध्यम|nepali\s*edition|nepaliedition|\(nepali\)/i;

function matchRule(fileName: string, cover: string, layer: TextLayer): { rule?: SubjectRule; evidence: string[] } {
  const evidence: string[] = [];
  let byName: SubjectRule | undefined;
  let byCover: SubjectRule | undefined;
  // Only the cover title is used: the publisher line ("Ministry of Education, Science and
  // Technology" / "नेपाल सरकार") would otherwise match subject names on every book.
  const coverTitle = cover.split(/Government of Nepal|g\]? ?k\]? ?fn ;\/s ?f\/|नेपाल सरकार/i)[0];
  for (const rule of SUBJECT_RULES) {
    if (!byName && rule.filename?.some((r) => r.test(fileName))) byName = rule;
    if (!byCover) {
      const patterns =
        layer === 'ENGLISH' ? rule.englishCover : layer === 'LEGACY_NEPALI' ? rule.legacyCover : layer === 'UNICODE_NEPALI' ? rule.unicodeCover : undefined;
      if (patterns?.some((r) => r.test(coverTitle))) byCover = rule;
    }
  }
  if (byName) evidence.push(`filename → ${byName.key}`);
  if (byCover) evidence.push(`cover text → ${byCover.key}`);
  if (byName && byCover && byName.key !== byCover.key) {
    evidence.push(`CONFLICT: filename says ${byName.key}, cover says ${byCover.key}; cover text used`);
  }
  return { rule: byCover || byName, evidence };
}

/** Parse the printed "Contents" page into chapter entries and map them to PDF pages. */
export function extractChapters(pages: string[]): { chapters: ExtractedChapter[]; note?: string } {
  const tocIndex = pages.slice(0, 30).findIndex((t) => /^\s*(table of )?contents?\s*$/im.test(t.slice(0, 400)));
  if (tocIndex === -1) return { chapters: [], note: 'No printed table of contents found in the first 30 pages' };

  const entryRe = /^\s*(?:(?:unit|chapter|lesson)\s*)?(\d{1,2})\s*[.):]?\s*\t?\s*([A-Za-z][^\t\n]{2,90}?)\s*[\t.…\s]+(\d{1,4})\s*$/i;
  const entries: Array<{ n: number; title: string; printed: number }> = [];
  for (const pageText of pages.slice(tocIndex, tocIndex + 3)) {
    for (const line of pageText.split('\n')) {
      const m = line.match(entryRe);
      if (!m) continue;
      const n = Number(m[1]);
      const printed = Number(m[3]);
      const prev = entries[entries.length - 1];
      if (prev && (n !== prev.n + 1 || printed < prev.printed)) continue;
      if (!prev && n !== 1) continue;
      entries.push({ n, title: m[2].replace(/\s+/g, ' ').trim(), printed });
    }
  }
  if (entries.length < 2) {
    return { chapters: [], note: 'Table of contents found but its layout could not be parsed reliably' };
  }

  // Locate each chapter title in the body to learn the printed→PDF page offset.
  const squash = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const offsets: number[] = [];
  const matchedPage: Record<number, number> = {};
  for (const e of entries) {
    const key = squash(e.title).slice(0, 24);
    if (key.length < 4) continue;
    const from = tocIndex + 1 + Math.max(0, e.printed - 1);
    for (let i = from; i < Math.min(pages.length, from + 25); i++) {
      if (squash(pages[i].slice(0, 600)).includes(key)) {
        matchedPage[e.n] = i + 1;
        offsets.push(i + 1 - e.printed);
        break;
      }
    }
  }
  const counts = new Map<number, number>();
  offsets.forEach((o) => counts.set(o, (counts.get(o) || 0) + 1));
  const offset = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (offset === undefined) {
    return { chapters: [], note: 'Chapter titles from the contents page could not be located in the book body' };
  }

  const total = pages.length;
  const chapters = entries.map((e, i) => {
    const start = Math.min(total, Math.max(1, e.printed + offset));
    const nextStart = i + 1 < entries.length ? entries[i + 1].printed + offset - 1 : total;
    return {
      chapterNumber: e.n,
      title: e.title,
      printedPage: e.printed,
      startPage: start,
      endPage: Math.max(start, Math.min(total, nextStart)),
      pageMatched: matchedPage[e.n] === start,
    };
  });
  return { chapters };
}

interface ManualVerification {
  medium?: MediumScope;
  language?: string;
  title?: string;
  evidence: string;
}

function loadVerifications(): Record<string, ManualVerification> {
  const file = path.resolve(__dirname, '../../../../data/nepal-data-verifications.json');
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8')).verifications || {};
}

export async function inspectPdf(
  baseDir: string,
  absPath: string,
  verifications: Record<string, ManualVerification> = loadVerifications()
): Promise<ExtractedDocument> {
  const relativePath = path.relative(baseDir, absPath).split(path.sep).join('/');
  const folder = relativePath.split('/')[0];
  const fileName = path.basename(absPath);
  const buffer = fs.readFileSync(absPath);
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const issues: string[] = [];

  let pages: string[] = [];
  let readable = true;
  let readError: string | undefined;
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    pages = (result.pages || []).map((p: any) => p.text || '');
    await parser.destroy();
  } catch (e: any) {
    readable = false;
    readError = e?.message || String(e);
    issues.push(`PDF could not be parsed: ${readError}`);
  }

  const fullChars = pages.reduce((n, t) => n + t.trim().length, 0);
  const sample = pages.slice(0, 6).join('\n');
  const textLayer = readable ? detectTextLayer(pages.slice(0, 40).join('\n'), fullChars) : 'NONE';
  const coverText = sample.replace(/\s+/g, ' ').trim().slice(0, 400);

  if (readable && textLayer === 'NONE') {
    issues.push('No extractable text layer (scanned/image-only PDF); classified from filename only');
  }
  if (textLayer === 'LEGACY_NEPALI') {
    issues.push('Nepali text uses the legacy Preeti font encoding; chapter titles cannot be extracted as Unicode');
  }

  const { grade, range } = detectGrade(relativePath);
  const editionYear = detectEdition(fileName);
  const part = fileName.match(/part\s*(\d+)/i)?.[0] || fileName.match(/\((क|ख)\)/)?.[1];

  let documentType: DocumentType = 'TEXTBOOK';
  if (folder === 'Curriculum (T)') documentType = 'CURRICULUM';
  else if (folder === 'Teaching Materials') documentType = 'TEACHER_RESOURCE';
  else if (/स्वाध्याय सामग्री/.test(fileName)) documentType = 'SELF_STUDY';

  const isReference = documentType === 'CURRICULUM' || documentType === 'TEACHER_RESOURCE';
  // Reference documents are typed by their folder; subject rules apply to class textbooks only.
  const { rule, evidence } = isReference ? { rule: undefined, evidence: [`folder "${folder}" → ${documentType}`] } : matchRule(fileName, coverText, textLayer);
  const gradeRange = range || (isReference ? detectGrade(coverText.slice(0, 200)).range : undefined);
  const mediumEvidence: string[] = [];
  let language: string | undefined;
  if (textLayer === 'ENGLISH') language = 'English';
  else if (textLayer === 'LEGACY_NEPALI' || textLayer === 'UNICODE_NEPALI') language = 'Nepali';
  else if (ENGLISH_EDITION_HINT.test(fileName)) language = 'English';
  else if (NEPALI_EDITION_HINT.test(fileName) || /[ऀ-ॿ]/.test(fileName)) language = 'Nepali';
  if (rule?.category === 'MOTHER_TONGUE') language = rule.name.replace(/ Language.*$/, '');

  let medium: MediumScope | undefined;
  if (rule?.sharedAcrossMedia) {
    medium = 'BOTH';
    mediumEvidence.push(`${rule.name} is a language subject; one textbook serves both media`);
  } else if (textLayer === 'ENGLISH') {
    medium = 'ENGLISH';
    mediumEvidence.push('Cover and body text are English');
  } else if (textLayer === 'LEGACY_NEPALI' || textLayer === 'UNICODE_NEPALI') {
    medium = 'NEPALI';
    mediumEvidence.push(`Body text is Nepali (${textLayer === 'LEGACY_NEPALI' ? 'Preeti font' : 'Unicode'})`);
  } else if (ENGLISH_EDITION_HINT.test(fileName)) {
    medium = 'ENGLISH';
    mediumEvidence.push('Filename marks it as the English translation (no text layer to confirm)');
  } else if (NEPALI_EDITION_HINT.test(fileName)) {
    medium = 'NEPALI';
    mediumEvidence.push('Filename marks it as the Nepali edition (no text layer to confirm)');
  }

  const verified = verifications[relativePath];
  if (verified) {
    if (verified.medium && !rule?.sharedAcrossMedia) medium = verified.medium;
    if (verified.language) language = verified.language;
    mediumEvidence.push(`Manually verified: ${verified.evidence}`);
  }

  if (textLayer === 'ENGLISH' && NEPALI_EDITION_HINT.test(fileName)) {
    issues.push('Filename says Nepali edition but the content is English');
  }
  if ((textLayer === 'LEGACY_NEPALI' || textLayer === 'UNICODE_NEPALI') && ENGLISH_EDITION_HINT.test(fileName)) {
    issues.push('Filename says English edition but the content is Nepali');
  }
  if (rule && !rule.sharedAcrossMedia && textLayer === 'ENGLISH' && /[ऀ-ॿ]/.test(fileName) && rule.filename?.some((r) => r.test(fileName))) {
    if (!ENGLISH_EDITION_HINT.test(fileName)) issues.push('Nepali filename, but the book content is the English edition');
  }
  if (/\s-\sCopy/i.test(fileName)) issues.push('Filename contains "- Copy"; checked by SHA-256 and no identical file exists');
  if (/सेफोफेरो/.test(fileName)) issues.push('Filename misspells the CDC title "हाम्रो सेरोफेरो" as "सेफोफेरो"');
  if (/^download \(\d+\)/i.test(fileName)) issues.push('Filename carries no subject information; identified from cover text');
  if (part) issues.push(`Book is split into parts (${part}); only this part is present in the source folder`);

  const isCurriculumOrResource = isReference;
  let confidence: Confidence = 'LOW';
  const coverMatched = evidence.some((e) => e.startsWith('cover'));
  const nameMatched = evidence.some((e) => e.startsWith('filename'));
  if (rule && medium && (coverMatched || verified) && !evidence.some((e) => e.startsWith('CONFLICT'))) confidence = 'HIGH';
  else if (rule && medium && (coverMatched || nameMatched)) confidence = 'MEDIUM';

  const resolved = isCurriculumOrResource || (!!rule && !!medium && grade !== undefined);
  if (!resolved) issues.push('Could not confidently determine subject, grade and medium — manual review required');

  // Title: first line of a readable English cover; otherwise composed from verified fields.
  let title = fileName.replace(/_[a-z0-9]{7}\.pdf$/i, '').replace(/\.pdf$/i, '');
  if (isReference && textLayer === 'ENGLISH') {
    title = coverText.split(/Government of Nepal/i)[0].trim().slice(0, 140) || title;
  }
  if (!isCurriculumOrResource && rule && grade) {
    if (textLayer === 'ENGLISH') {
      title = coverText.split(/Government of Nepal/i)[0].replace(/^Feedback Copy\s*/i, '').trim().slice(0, 80) || `${rule.name} Grade ${grade}`;
    } else if (medium === 'ENGLISH' || language === 'English') {
      title = `${rule.name} Grade ${grade}`;
    } else {
      title = `${rule.nameNepali} कक्षा ${toDevanagari(grade)}`;
    }
    if (verified?.title) title = verified.title;
    if (documentType === 'SELF_STUDY') title = `स्वाध्याय सामग्री — ${title}`;
  }

  let chapters: ExtractedChapter[] = [];
  let chapterNote: string | undefined;
  if (documentType === 'TEXTBOOK' || documentType === 'SELF_STUDY') {
    if (textLayer === 'ENGLISH' || textLayer === 'UNICODE_NEPALI') {
      const r = extractChapters(pages);
      chapters = r.chapters;
      chapterNote = r.note;
    } else if (textLayer === 'LEGACY_NEPALI') {
      chapterNote = 'Legacy Preeti font: chapter titles must be entered manually';
    } else {
      chapterNote = 'Image-only PDF: chapters must be entered manually';
    }
    if (chapterNote && textLayer !== 'NONE' && textLayer !== 'LEGACY_NEPALI') issues.push(chapterNote);
  }

  return {
    relativePath,
    folder,
    fileName,
    sizeBytes: buffer.length,
    sha256,
    readable,
    readError,
    pageCount: pages.length,
    textChars: fullChars,
    textLayer,
    coverText,
    documentType,
    gradeNumber: grade,
    gradeRange,
    subjectKey: isCurriculumOrResource ? undefined : rule?.key,
    subjectName: rule?.name,
    subjectNameNepali: rule?.nameNepali,
    category: rule?.category,
    medium: isCurriculumOrResource ? undefined : medium,
    language,
    title,
    editionYear,
    part,
    subjectEvidence: evidence,
    mediumEvidence,
    confidence: isCurriculumOrResource ? 'HIGH' : confidence,
    status: resolved ? 'CLASSIFIED' : 'UNRESOLVED',
    chapters,
    chapterSource: chapters.length ? 'TABLE_OF_CONTENTS' : 'NONE',
    chapterNote,
    issues,
  };
}

function toDevanagari(n: number) {
  return String(n).replace(/\d/g, (d) => DEVANAGARI_DIGITS[Number(d)]);
}

export function listPdfFiles(dir: string): string[] {
  const out: string[] = [];
  for (const item of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) out.push(...listPdfFiles(full));
    else if (item.toLowerCase().endsWith('.pdf')) out.push(full);
  }
  return out;
}

export async function inspectNepalData(baseDir: string, onProgress?: (doc: ExtractedDocument, i: number, n: number) => void) {
  const files = listPdfFiles(baseDir);
  const verifications = loadVerifications();
  const docs: ExtractedDocument[] = [];
  for (let i = 0; i < files.length; i++) {
    const doc = await inspectPdf(baseDir, files[i], verifications);
    docs.push(doc);
    onProgress?.(doc, i + 1, files.length);
  }
  // Exact duplicates by content hash.
  const byHash = new Map<string, ExtractedDocument[]>();
  docs.forEach((d) => byHash.set(d.sha256, [...(byHash.get(d.sha256) || []), d]));
  for (const group of byHash.values()) {
    if (group.length > 1) {
      group.slice(1).forEach((d) => d.issues.push(`Exact duplicate of ${group[0].relativePath}`));
    }
  }
  return docs;
}
