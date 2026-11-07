import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { RagDocument, RagChunk } from '../models/Rag';
import { RetrievalService } from '../modules/rag/retrieval.service';
import { EmbeddingService } from '../modules/rag/embedding.service';
import { RagScope } from '../modules/rag/scope.service';

/**
 * Retrieval self-test over every indexed book (no Gemini calls).
 * For each book, sample chunks, build a query from the chunk's own heading/first sentence, and check that
 *  (a) the source book/page is retrieved in the top 6 (recall@6), and
 *  (b) nothing from another class is ever returned (leakage = 0).
 * Usage: npm run rag:eval [-- --per-doc 3]
 */
const args = process.argv.slice(2);
const perDoc = Number(args[args.indexOf('--per-doc') + 1]) || 3;

const scopeFor = (grade: number, subjectKey?: string, medium?: string): RagScope => ({
  role: 'TEACHER', grades: [grade], subjectKeys: subjectKey ? [subjectKey] : [], mediums: medium ? [medium] : [], includeStaffResources: false,
  label: `Class ${grade}`, allowedSubjects: [],
});

function queryFrom(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/(?<=[.?!।])\s+/).filter((s) => s.length > 40 && s.length < 260);
  return (sentences[Math.floor(sentences.length / 2)] || clean.slice(0, 200)).slice(0, 220);
}

async function main() {
  await connectDB();
  const docs: any[] = await RagDocument.find({ status: 'INDEXED', gradeNumber: { $gte: 1 } }).select('title gradeNumber subjectKey medium relativePath').lean();
  const rows: any[] = [];
  let tot = 0, hit = 0, leak = 0, empty = 0;
  const byGrade: Record<number, { n: number; hit: number; leak: number }> = {};
  for (const d of docs) {
    const total = await RagChunk.countDocuments({ documentId: d._id, embeddingModel: EmbeddingService.modelName });
    if (!total) { rows.push({ title: d.title, grade: d.gradeNumber, note: 'no chunks for current model' }); continue; }
    const skip = Math.max(0, Math.floor(total / (perDoc + 1)));
    let dHit = 0, dN = 0;
    for (let i = 1; i <= perDoc; i++) {
      const c: any = await RagChunk.findOne({ documentId: d._id, embeddingModel: EmbeddingService.modelName }).skip(Math.min(total - 1, i * skip)).select('text pageStart').lean();
      if (!c || c.text.length < 200) continue;
      const q = queryFrom(c.text);
      const res = await RetrievalService.retrieve(q, scopeFor(d.gradeNumber, d.subjectKey), { topK: 6 });
      dN++; tot++;
      const ok = res.some((r) => r.relativePath === d.relativePath && Math.abs(r.pageStart - c.pageStart) <= 2);
      const okBook = res.some((r) => r.relativePath === d.relativePath);
      if (ok || okBook) { dHit++; hit++; }
      const bad = res.filter((r) => r.gradeNumber !== d.gradeNumber).length;
      if (bad) leak += bad;
      byGrade[d.gradeNumber] = byGrade[d.gradeNumber] || { n: 0, hit: 0, leak: 0 };
      byGrade[d.gradeNumber].n++; if (ok || okBook) byGrade[d.gradeNumber].hit++; byGrade[d.gradeNumber].leak += bad;
      if (!res.length) empty++;
    }
    rows.push({ title: d.title, grade: d.gradeNumber, queries: dN, hits: dHit });
  }
  const out = { model: EmbeddingService.modelName, books: docs.length, queries: tot, recallAt6: tot ? +(hit / tot).toFixed(3) : 0, crossClassLeakage: leak, emptyResults: empty, byGrade, weakBooks: rows.filter((r) => r.queries && r.hits / r.queries < 0.67) };
  fs.writeFileSync(path.resolve(__dirname, '../../data/rag-eval.json'), JSON.stringify({ ...out, rows }, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
