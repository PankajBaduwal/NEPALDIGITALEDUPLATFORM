import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { RagChunk } from '../models/Rag';
import { looksLikeExercise } from '../modules/rag/chunker';
import { VectorStore } from '../modules/rag/vector.service';

/** Re-labels existing chunks as EXERCISE / TEXT with the current heuristic (no re-embedding). npm run rag:retag */
async function main() {
  await connectDB();
  const cur = RagChunk.find({ contentType: { $in: ['TEXT', 'EXERCISE'] } }).select('text contentType').lean().cursor();
  const toEx: any[] = [], toText: any[] = [];
  let n = 0;
  for await (const c of cur as any) {
    n++;
    const ex = /^(exercise|review questions|practice|अभ्यास|प्रश्नहरू|प्रश्न)\b/i.test(c.text.slice(0, 200)) || looksLikeExercise(c.text);
    if (ex && c.contentType !== 'EXERCISE') toEx.push(c._id);
    if (!ex && c.contentType === 'EXERCISE') toText.push(c._id);
  }
  if (toEx.length) await RagChunk.updateMany({ _id: { $in: toEx } }, { $set: { contentType: 'EXERCISE' } });
  if (toText.length) await RagChunk.updateMany({ _id: { $in: toText } }, { $set: { contentType: 'TEXT' } });
  console.log(`chunks scanned ${n}; now exercise +${toEx.length}, back to text ${toText.length}`);
  VectorStore.invalidate();
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
