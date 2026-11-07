import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { RagDocument, RagChunk } from '../models/Rag';
import { EmbeddingService } from '../modules/rag/embedding.service';
import { IngestionService } from '../modules/rag/ingestion.service';
import { VectorStore } from '../modules/rag/vector.service';

/** Re-embeds INDEXED books whose chunks were embedded with a different model than the current one. */
async function main() {
  await connectDB();
  const docs: any[] = await RagDocument.find({ status: 'INDEXED' });
  for (const d of docs) {
    const stale = await RagChunk.countDocuments({ documentId: d._id, embeddingModel: { $ne: EmbeddingService.modelName } });
    if (!stale) continue;
    console.log(`re-embedding ${d.title} (${stale} chunks)`);
    await IngestionService.embedPending(d, (m) => console.log(m));
    await RagDocument.updateOne({ _id: d._id }, { $set: { status: 'INDEXED' } });
  }
  VectorStore.invalidate();
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
