import fs from 'fs';
import path from 'path';
import type { ExtractedDocument } from './nepal-data-extractor';
import { RULES_BY_KEY } from './subject-recognition';

interface Snapshot {
  generatedAt: string;
  sourceFolder: string;
  documents: ExtractedDocument[];
}

const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
const esc = (s: string) => String(s ?? '').replace(/\|/g, '\\|');
const LAYER_LABEL: Record<string, string> = {
  ENGLISH: 'English text',
  UNICODE_NEPALI: 'Nepali (Unicode)',
  LEGACY_NEPALI: 'Nepali (Preeti font)',
  NONE: 'Image only',
};

function countBy<T>(items: T[], key: (t: T) => string) {
  const m = new Map<string, number>();
  items.forEach((i) => m.set(key(i), (m.get(key(i)) || 0) + 1));
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
}

function gradeSort(a: ExtractedDocument, b: ExtractedDocument) {
  return (a.gradeNumber ?? 99) - (b.gradeNumber ?? 99) || a.relativePath.localeCompare(b.relativePath);
}

export function buildMappingMatrix(docs: ExtractedDocument[]) {
  const textbooks = docs.filter((d) => d.status === 'CLASSIFIED' && (d.documentType === 'TEXTBOOK' || d.documentType === 'SELF_STUDY') && d.gradeNumber);
  const rows: Array<{ grade: number; key: string; english: ExtractedDocument[]; nepali: ExtractedDocument[]; both: ExtractedDocument[] }> = [];
  for (const d of textbooks) {
    let row = rows.find((r) => r.grade === d.gradeNumber && r.key === d.subjectKey);
    if (!row) {
      row = { grade: d.gradeNumber!, key: d.subjectKey!, english: [], nepali: [], both: [] };
      rows.push(row);
    }
    (d.medium === 'ENGLISH' ? row.english : d.medium === 'NEPALI' ? row.nepali : row.both).push(d);
  }
  rows.sort((a, b) => a.grade - b.grade || a.key.localeCompare(b.key));
  return rows;
}

export function writeNepalDataReports(snapshot: Snapshot, outDir: string) {
  const docs = [...snapshot.documents].sort(gradeSort);
  const generated = snapshot.generatedAt.replace('T', ' ').slice(0, 19) + ' UTC';
  const classified = docs.filter((d) => d.status === 'CLASSIFIED');
  const unresolved = docs.filter((d) => d.status === 'UNRESOLVED');
  const textbookDocs = docs.filter((d) => d.documentType === 'TEXTBOOK' || d.documentType === 'SELF_STUDY');
  const grades = [...new Set(textbookDocs.map((d) => d.gradeNumber).filter(Boolean))].sort((a, b) => a! - b!);
  const subjectKeys = [...new Set(textbookDocs.filter((d) => d.status === 'CLASSIFIED').map((d) => d.subjectKey!))];
  const totalPages = docs.reduce((n, d) => n + d.pageCount, 0);
  const totalBytes = docs.reduce((n, d) => n + d.sizeBytes, 0);
  const hashGroups = countBy(docs, (d) => d.sha256).filter(([, n]) => n > 1);

  // ── 1. Inventory ───────────────────────────────────────────────────────────
  const inv: string[] = [];
  inv.push('# Nepal Data — PDF Inventory', '');
  inv.push(`Generated: ${generated} by \`npm run curriculum:extract\` (backend/src/scripts/extractNepalData.ts).`, '');
  inv.push('Every file below was opened and hashed. Nothing in this list is inferred from an expected folder layout.', '');
  inv.push('## Summary', '');
  inv.push('| Measure | Value |', '| --- | --- |');
  inv.push(`| PDF files discovered | ${docs.length} |`);
  inv.push(`| Total size | ${mb(totalBytes)} MB |`);
  inv.push(`| Total pages | ${totalPages.toLocaleString()} |`);
  inv.push(`| Files that opened successfully | ${docs.filter((d) => d.readable).length} |`);
  inv.push(`| Unreadable / corrupted files | ${docs.filter((d) => !d.readable).length} |`);
  inv.push(`| Exact duplicates (same SHA-256) | ${hashGroups.length} |`);
  inv.push(`| Classes covered by textbooks | ${grades.map((g) => g).join(', ')} |`);
  inv.push(`| Distinct subjects identified | ${subjectKeys.length} |`);
  inv.push(`| Documents classified | ${classified.length} |`);
  inv.push(`| Documents needing manual classification | ${unresolved.length} |`, '');
  inv.push('## Files per folder', '', '| Folder | PDFs | Pages | Size (MB) |', '| --- | ---: | ---: | ---: |');
  for (const [folder, n] of countBy(docs, (d) => d.folder)) {
    const f = docs.filter((d) => d.folder === folder);
    inv.push(`| ${esc(folder)} | ${n} | ${f.reduce((s, d) => s + d.pageCount, 0)} | ${mb(f.reduce((s, d) => s + d.sizeBytes, 0))} |`);
  }
  inv.push('', '## Text layer', '', '| Text layer | PDFs | Meaning |', '| --- | ---: | --- |');
  const layerMeaning: Record<string, string> = {
    ENGLISH: 'Searchable English text',
    UNICODE_NEPALI: 'Searchable Unicode Devanagari',
    LEGACY_NEPALI: 'Devanagari set in the legacy Preeti font; extracts as Latin characters',
    NONE: 'Scanned pages with no text layer',
  };
  for (const [layer, n] of countBy(docs, (d) => d.textLayer)) inv.push(`| ${LAYER_LABEL[layer]} | ${n} | ${layerMeaning[layer]} |`);
  inv.push('', '## All files', '', '| # | File | Pages | MB | Text layer | Type | SHA-256 (first 12) | Status |', '| ---: | --- | ---: | ---: | --- | --- | --- | --- |');
  docs.forEach((d, i) => {
    inv.push(`| ${i + 1} | ${esc(d.relativePath)} | ${d.pageCount} | ${mb(d.sizeBytes)} | ${LAYER_LABEL[d.textLayer]} | ${d.documentType} | \`${d.sha256.slice(0, 12)}\` | ${d.status} |`);
  });
  fs.writeFileSync(path.join(outDir, 'NEPAL_DATA_INVENTORY.md'), inv.join('\n') + '\n', 'utf8');

  // ── 2. Extraction report ───────────────────────────────────────────────────
  const ex: string[] = [];
  ex.push('# Nepal Curriculum — Extraction Report', '');
  ex.push(`Generated: ${generated}.`, '');
  ex.push('## Method', '');
  ex.push('1. **Class** comes from the `classN` folder. Files in `Curriculum (T)` and `Teaching Materials` are reference documents, not class textbooks.');
  ex.push('2. **Text layer**: each PDF is parsed with pdf-parse. Text is classed as English, Unicode Nepali, legacy Preeti-font Nepali, or none (scanned).');
  ex.push('3. **Subject**: matched from the cover text (first pages) and from the filename. When the two disagree, the cover wins and the conflict is logged.');
  ex.push('4. **Medium**: taken from the language the book is printed in. Language subjects (English, Nepali, mother tongues) use one book for both media and are marked `BOTH`. Scanned books are classed from filename words such as "अंग्रेजी अनुवाद" (English translation) and flagged for review.');
  ex.push('5. **Chapters** come only from a printed *Contents* page, mapped to PDF pages by finding each title in the body. No chapter, topic or learning objective is generated when the book does not state it.', '');
  ex.push('## Results', '');
  ex.push('| Measure | Value |', '| --- | --- |');
  ex.push(`| Class textbooks | ${docs.filter((d) => d.documentType === 'TEXTBOOK').length} |`);
  ex.push(`| Self-study (स्वाध्याय) workbooks | ${docs.filter((d) => d.documentType === 'SELF_STUDY').length} |`);
  ex.push(`| TVET curriculum documents | ${docs.filter((d) => d.documentType === 'CURRICULUM').length} |`);
  ex.push(`| Teacher resource documents | ${docs.filter((d) => d.documentType === 'TEACHER_RESOURCE').length} |`);
  ex.push(`| Confidence HIGH (cover text confirms subject and medium) | ${docs.filter((d) => d.confidence === 'HIGH').length} |`);
  ex.push(`| Confidence MEDIUM (one source of evidence) | ${docs.filter((d) => d.confidence === 'MEDIUM').length} |`);
  ex.push(`| Confidence LOW | ${docs.filter((d) => d.confidence === 'LOW').length} |`);
  ex.push(`| Books with chapters read from the contents page | ${docs.filter((d) => d.chapters.length).length} |`);
  ex.push(`| Chapters extracted | ${docs.reduce((n, d) => n + d.chapters.length, 0)} |`, '');
  ex.push('## Subjects identified', '', '| Subject | नेपाली | Category | Classes | Media |', '| --- | --- | --- | --- | --- |');
  for (const key of subjectKeys.sort()) {
    const rule = RULES_BY_KEY[key];
    const ds = textbookDocs.filter((d) => d.subjectKey === key && d.status === 'CLASSIFIED');
    const gs = [...new Set(ds.map((d) => d.gradeNumber))].sort((a, b) => a! - b!).join(', ');
    const media = [...new Set(ds.map((d) => d.medium))].sort().join(', ');
    ex.push(`| ${rule.name} | ${rule.nameNepali} | ${rule.category} | ${gs} | ${media} |`);
  }
  ex.push('', '## Per-document classification', '', '| File | Class | Subject | Medium | Printed in | Type | Confidence | Evidence |', '| --- | ---: | --- | --- | --- | --- | --- | --- |');
  for (const d of docs) {
    ex.push(
      `| ${esc(d.relativePath)} | ${d.gradeNumber ?? (d.gradeRange ? d.gradeRange.join('–') : '—')} | ${esc(d.subjectName || '—')} | ${d.medium || '—'} | ${esc(d.language || '—')} | ${d.documentType} | ${d.confidence} | ${esc([...d.subjectEvidence, ...d.mediumEvidence].join('; '))} |`
    );
  }
  ex.push('', '## Chapters extracted from contents pages', '');
  for (const d of docs.filter((x) => x.chapters.length)) {
    ex.push(`### Class ${d.gradeNumber} · ${d.subjectName} · ${d.medium} — ${esc(d.title)}`, '');
    ex.push('| # | Chapter | Printed page | PDF pages | Located in body |', '| ---: | --- | ---: | --- | --- |');
    d.chapters.forEach((c) => ex.push(`| ${c.chapterNumber} | ${esc(c.title)} | ${c.printedPage} | ${c.startPage}–${c.endPage} | ${c.pageMatched ? 'yes' : 'by offset'} |`));
    ex.push('');
  }
  fs.writeFileSync(path.join(outDir, 'NEPAL_CURRICULUM_EXTRACTION_REPORT.md'), ex.join('\n') + '\n', 'utf8');

  // ── 3. Mapping report ──────────────────────────────────────────────────────
  const rows = buildMappingMatrix(docs);
  const mp: string[] = [];
  mp.push('# Nepal Textbook Mapping Report', '');
  mp.push(`Generated: ${generated}.`, '');
  mp.push('Each row is one **logical subject** in one class. English-medium and Nepali-medium editions hang off the same subject record and are never two separate subjects. `Both media` is a language textbook used by every section regardless of medium.', '');
  mp.push('A dash (—) means no PDF for that medium exists in `Nepal data/`. The library shows "textbook not available" for it and never substitutes another book.', '');
  for (const g of grades) {
    mp.push(`## Class ${g}`, '', '| Subject | English medium | Nepali medium | Both media |', '| --- | --- | --- | --- |');
    for (const r of rows.filter((x) => x.grade === g)) {
      const cell = (list: ExtractedDocument[]) =>
        list.length ? list.map((d) => `${esc(d.fileName)}${d.documentType === 'SELF_STUDY' ? ' *(self-study)*' : ''}${d.textLayer === 'NONE' ? ' *(scanned)*' : ''}`).join('<br>') : '—';
      mp.push(`| ${RULES_BY_KEY[r.key].name} | ${cell(r.english)} | ${cell(r.nepali)} | ${cell(r.both)} |`);
    }
    mp.push('');
  }
  mp.push('## Medium coverage summary', '', '| Class | Subjects | Both editions | English only | Nepali only | Shared language books |', '| ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const g of grades) {
    const rs = rows.filter((r) => r.grade === g);
    const tb = (r: (typeof rs)[number]) => ({ e: r.english.some((d) => d.documentType === 'TEXTBOOK'), n: r.nepali.some((d) => d.documentType === 'TEXTBOOK') });
    mp.push(
      `| ${g} | ${rs.length} | ${rs.filter((r) => tb(r).e && tb(r).n).length} | ${rs.filter((r) => tb(r).e && !tb(r).n && !r.both.length).length} | ${rs.filter((r) => !tb(r).e && tb(r).n && !r.both.length).length} | ${rs.filter((r) => r.both.length).length} |`
    );
  }
  mp.push('', '## Reference documents (not linked to a class subject)', '', '| File | Type | Classes | Notes |', '| --- | --- | --- | --- |');
  for (const d of docs.filter((x) => x.documentType === 'CURRICULUM' || x.documentType === 'TEACHER_RESOURCE')) {
    mp.push(`| ${esc(d.relativePath)} | ${d.documentType} | ${d.gradeRange ? d.gradeRange.join('–') : '—'} | ${esc(d.title)} |`);
  }
  fs.writeFileSync(path.join(outDir, 'NEPAL_TEXTBOOK_MAPPING_REPORT.md'), mp.join('\n') + '\n', 'utf8');

  // ── 4. Issues ──────────────────────────────────────────────────────────────
  const is: string[] = [];
  is.push('# Nepal Data — Issues Requiring Attention', '');
  is.push(`Generated: ${generated}.`, '');
  const section = (titleText: string, list: ExtractedDocument[], detail: (d: ExtractedDocument) => string) => {
    is.push(`## ${titleText} (${list.length})`, '');
    if (!list.length) is.push('None.', '');
    else {
      list.forEach((d) => is.push(`- \`${d.relativePath}\` — ${detail(d)}`));
      is.push('');
    }
  };
  section('Unresolved documents (manual classification required)', unresolved, (d) => d.issues.join('; '));
  section('Unreadable or corrupted PDFs', docs.filter((d) => !d.readable), (d) => d.readError || 'parse error');
  section('Exact duplicates', docs.filter((d) => d.issues.some((i) => i.startsWith('Exact duplicate'))), (d) => d.issues.find((i) => i.startsWith('Exact duplicate'))!);
  section('Filename does not match content', docs.filter((d) => d.issues.some((i) => /Filename says|Nepali filename|no subject information|misspells/.test(i)) || d.subjectEvidence.some((e) => e.startsWith('CONFLICT'))), (d) => [...d.issues.filter((i) => /Filename|filename/.test(i)), ...d.subjectEvidence.filter((e) => e.startsWith('CONFLICT'))].join('; '));
  section('Scanned PDFs with no text layer (classified from filename only — verify visually)', docs.filter((d) => d.readable && d.textLayer === 'NONE'), (d) => `${d.subjectName || '?'} · Class ${d.gradeNumber ?? '?'} · ${d.medium || '?'}`);
  section('Legacy Preeti-font PDFs (chapters must be entered manually)', docs.filter((d) => d.textLayer === 'LEGACY_NEPALI' && d.documentType !== 'CURRICULUM' && d.documentType !== 'TEACHER_RESOURCE'), (d) => `${d.subjectName || '?'} · Class ${d.gradeNumber ?? '?'}`);
  section('Text PDFs whose contents page could not be parsed', docs.filter((d) => (d.textLayer === 'ENGLISH' || d.textLayer === 'UNICODE_NEPALI') && (d.documentType === 'TEXTBOOK' || d.documentType === 'SELF_STUDY') && !d.chapters.length), (d) => d.chapterNote || '');
  section('Incomplete books (split into parts)', docs.filter((d) => d.part), (d) => d.issues.find((i) => i.startsWith('Book is split')) || '');
  section('Suspicious filenames ("- Copy")', docs.filter((d) => /\s-\sCopy/i.test(d.fileName)), (d) => d.issues.find((i) => i.includes('Copy')) || '');
  is.push('## Missing medium editions', '');
  is.push('Subjects where only one medium has a textbook PDF. Sections taught in the other medium will show "textbook not available" for these subjects.', '');
  is.push('| Class | Subject | Available | Missing |', '| ---: | --- | --- | --- |');
  for (const r of rows.filter((x) => !x.both.length)) {
    const e = r.english.some((d) => d.documentType === 'TEXTBOOK');
    const n = r.nepali.some((d) => d.documentType === 'TEXTBOOK');
    if (e && !n) is.push(`| ${r.grade} | ${RULES_BY_KEY[r.key].name} | English | Nepali |`);
    if (n && !e) is.push(`| ${r.grade} | ${RULES_BY_KEY[r.key].name} | Nepali | English |`);
  }
  is.push('');
  fs.writeFileSync(path.join(outDir, 'NEPAL_DATA_ISSUES.md'), is.join('\n') + '\n', 'utf8');
}
