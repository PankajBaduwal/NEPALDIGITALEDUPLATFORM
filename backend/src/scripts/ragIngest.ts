import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { RagDocument } from '../models/Rag';
import { IngestionService } from '../modules/rag/ingestion.service';
import { GeminiService } from '../modules/rag/gemini.service';
import { EmbeddingService } from '../modules/rag/embedding.service';

/**
 * RAG ingestion operations.
 *   npm run rag:ingest -- sync                      register/refresh the PDF inventory
 *   npm run rag:ingest -- status                    progress by status
 *   npm run rag:ingest -- run [--class 5] [--file text] [--limit N] [--concurrency N]
 *   npm run rag:ingest -- retry                     re-run FAILED / NEEDS_REVIEW documents
 *   npm run rag:ingest -- reprocess --file text     force-rebuild one book
 */
const args = process.argv.slice(2);
const cmd = args[0] || 'status';
const flag = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};

async function main() {
  await connectDB();
  // The Gemini key is only needed for OCR of scanned pages and for answers; local embeddings need no key
  const check = await GeminiService.validate();
  if (!check.ok && cmd !== 'status' && cmd !== 'sync' && cmd !== 'report') console.warn('[RAG] Gemini unavailable:', check.message);

  if (cmd === 'sync') {
    console.log(await IngestionService.syncInventory());
  } else if (cmd === 'report') {
    const docs: any[] = await RagDocument.find().sort({ gradeNumber: 1, subjectKey: 1, relativePath: 1 }).lean();
    const root = path.resolve(__dirname, '../../../docs/rag-ai'); fs.mkdirSync(root, { recursive: true });
    const now = new Date().toISOString();
    const by = (f: (d: any) => string) => docs.reduce((m: Record<string, number>, d) => ((m[f(d)] = (m[f(d)] || 0) + 1), m), {});
    const sum = (f: (d: any) => number) => docs.reduce((n, d) => n + (f(d) || 0), 0);
    const inv = ['# RAG Textbook Inventory', '', `Generated ${now} from the ingestion database (\`npm run rag:ingest -- report\`).`, '', `Documents: **${docs.length}** · Pages: **${sum((d) => d.pageCount)}**`, '', '| # | File | Class | Subject | Medium | Text layer | Pages | Status | Chunks |', '| ---: | --- | :-: | --- | --- | --- | ---: | --- | ---: |', ...docs.map((d, i) => `| ${i + 1} | ${d.relativePath} | ${d.gradeNumber ?? (d.gradeMin ? `${d.gradeMin}-${d.gradeMax}` : '—')} | ${d.subjectKey || '—'} | ${d.medium || '—'} | ${d.textLayer || '—'} | ${d.pageCount ?? '—'} | ${d.status} | ${d.chunkCount} |`)];
    fs.writeFileSync(path.join(root, 'RAG_TEXTBOOK_INVENTORY.md'), inv.join('\n') + '\n');
    const st = by((d) => d.status);
    const prog = ['# RAG Ingestion Progress', '', `Generated ${now}.`, '', '| Status | Documents |', '| --- | ---: |', ...Object.entries(st).map(([k, v]) => `| ${k} | ${v} |`), '', `- Pages in all documents: ${sum((d) => d.pageCount)}`, `- Pages with extracted text: ${sum((d) => d.pagesExtracted)}`, `- Pages read by Gemini OCR: ${sum((d) => d.pagesOcr)}`, `- Chunks created: ${sum((d) => d.chunkCount)} · embedded: ${sum((d) => d.chunksEmbedded)}`, `- Embedding model: ${EmbeddingService.modelName} (${EmbeddingService.dimensions} dimensions)`, '', '## Failed or needing review', '', ...docs.filter((d) => ['FAILED', 'NEEDS_REVIEW'].includes(d.status)).map((d) => `- ${d.relativePath}: ${d.error || (d.notes || []).join(' ')}`), '', '## Not yet indexed', '', ...docs.filter((d) => !['INDEXED', 'FAILED', 'NEEDS_REVIEW'].includes(d.status)).map((d) => `- ${d.relativePath} (${d.status})`).slice(0, 200)];
    fs.writeFileSync(path.join(root, 'RAG_INGESTION_PROGRESS.md'), prog.join('\n') + '\n');
    const layer = by((d) => d.textLayer || 'UNKNOWN');
    const proc = ['# RAG PDF Processing Report', '', `Generated ${now}.`, '', '## How each text layer is processed', '', '| Text layer | PDFs | Method |', '| --- | ---: | --- |', `| ENGLISH | ${layer.ENGLISH || 0} | Embedded text extracted directly (pdf-parse); pages with no text go to Gemini OCR if more than 20% are empty |`, `| UNICODE_NEPALI | ${layer.UNICODE_NEPALI || 0} | Embedded Unicode text extracted directly |`, `| LEGACY_NEPALI (Preeti font) | ${layer.LEGACY_NEPALI || 0} | Converted to Unicode locally (approximate, ~85-90% character accuracy in testing). Re-run with RAG_PREETI_MODE=OCR for Gemini page reading when quota allows |`, `| NONE (scanned) | ${layer.NONE || 0} | Gemini reads page images (needs paid quota for 4,762 pages) |`, '', '## Documents with notes', '', ...docs.filter((d) => (d.notes || []).length).map((d) => `- ${d.relativePath}: ${(d.notes || []).join(' ')}`).slice(0, 150)];
    fs.writeFileSync(path.join(root, 'RAG_PDF_PROCESSING_REPORT.md'), proc.join('\n') + '\n');
    console.log('Reports written:', docs.length, 'documents');
  } else if (cmd === 'status') {
    console.log(JSON.stringify(await IngestionService.status(), null, 1));
  } else if (cmd === 'run' || cmd === 'retry' || cmd === 'reprocess') {
    await IngestionService.syncInventory();
    const q: any = {};
    if (cmd === 'run') q.status = { $in: ['PENDING', 'PROCESSING', 'EXTRACTING', 'OCR_REQUIRED', 'CHUNKING', 'EMBEDDING'] };
    if (cmd === 'retry') q.status = { $in: ['FAILED', 'NEEDS_REVIEW'] };
    if (flag('class')) q.gradeNumber = parseInt(flag('class')!, 10);
    if (flag('file')) q.relativePath = { $regex: flag('file')!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    let docs: any[] = await RagDocument.find(q).lean();
    // text-layer books first (no OCR quota needed); scanned books last; then by class, smaller books first
    docs.sort((a, b) => Number(a.textLayer === 'NONE') - Number(b.textLayer === 'NONE') || (a.gradeNumber ?? 99) - (b.gradeNumber ?? 99) || (a.pageCount ?? 0) - (b.pageCount ?? 0));
    // Scanned books need Gemini OCR (costly on a free key): only with --include-scanned
    if (!args.includes('--include-scanned') && cmd !== 'reprocess') docs = docs.filter((d) => d.textLayer !== 'NONE');
    if (flag('limit')) docs = docs.slice(0, parseInt(flag('limit')!, 10));
    console.log(`[RAG] ${docs.length} document(s) to process`);
    const conc = parseInt(flag('concurrency') || '2', 10);
    let next = 0, ok = 0, failed = 0;
    const started = Date.now();
    const worker = async () => {
      while (next < docs.length) {
        const d = docs[next++];
        try {
          await IngestionService.ingestDocument(String(d._id), { force: cmd === 'reprocess', log: (m) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`) });
          ok++;
        } catch {
          failed++;
        }
        console.log(`[RAG] progress ${ok + failed}/${docs.length} (ok ${ok}, failed ${failed}) — ${Math.round((Date.now() - started) / 60000)} min, usage ${JSON.stringify(GeminiService.getUsage())}`);
      }
    };
    await Promise.all(Array.from({ length: conc }, worker));
    console.log(JSON.stringify(await IngestionService.status(), null, 1));
  } else {
    console.log('Unknown command');
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('[RAG] FAILED:', e.message);
  process.exit(1);
});
