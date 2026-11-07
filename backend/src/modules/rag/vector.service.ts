import { RagChunk } from '../../models/Rag';
import { EmbeddingService } from './embedding.service';

/**
 * Vector search for a self-hosted MongoDB (no Atlas $vectorSearch available).
 * Embeddings are L2-normalised Float32 buffers stored with each chunk. Per-class matrices are
 * loaded lazily into memory, so a query only scans the vectors of the classes it is allowed to see.
 */
interface Shard {
  ids: string[]; // chunk _id strings
  meta: Array<{ subjectKey?: string; medium?: string; chapterNumber?: number; audience?: string; documentId: string; gradeNumber?: number }>;
  matrix: Float32Array;
  dim: number;
}

export interface VectorFilter {
  grades?: number[];
  subjectKeys?: string[];
  mediums?: string[];
  chapterNumber?: number;
  documentIds?: string[];
  includeStaffResources?: boolean;
}

const shards = new Map<number, Promise<Shard>>(); // key: grade (0 = no grade / reference documents)

async function loadShard(grade: number): Promise<Shard> {
  const dim = EmbeddingService.dimensions;
  const q: any = grade === 0 ? { gradeNumber: { $exists: false } } : { gradeNumber: grade };
  q.embedding = { $exists: true };
  q.embeddingModel = EmbeddingService.modelName; // never mix vectors from different models
  const rows: any[] = await RagChunk.find(q).select('embedding subjectKey medium chapterNumber audience documentId gradeNumber').lean();
  const matrix = new Float32Array(rows.length * dim);
  const ids: string[] = [];
  const meta: Shard['meta'] = [];
  rows.forEach((r, i) => {
    const b: Buffer = r.embedding.buffer ? Buffer.from(r.embedding.buffer) : Buffer.from(r.embedding);
    const f = new Float32Array(b.buffer, b.byteOffset, Math.min(dim, Math.floor(b.byteLength / 4)));
    matrix.set(f, i * dim);
    ids.push(String(r._id));
    meta.push({ subjectKey: r.subjectKey, medium: r.medium, chapterNumber: r.chapterNumber, audience: r.audience, documentId: String(r.documentId), gradeNumber: r.gradeNumber });
  });
  return { ids, meta, matrix, dim };
}

const getShard = (grade: number) => {
  let s = shards.get(grade);
  if (!s) {
    s = loadShard(grade).catch((e) => {
      shards.delete(grade);
      throw e;
    });
    shards.set(grade, s);
  }
  return s;
};

export const VectorStore = {
  invalidate() {
    shards.clear();
  },

  /** Top-k chunks by cosine similarity within the allowed scope. */
  async search(queryVec: number[], filter: VectorFilter, k = 30): Promise<Array<{ id: string; score: number }>> {
    const grades = filter.grades?.length ? filter.grades : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const shardKeys = [...new Set([...grades, ...(filter.includeStaffResources ? [0] : [])])];
    const q = Float32Array.from(queryVec);
    const hits: Array<{ id: string; score: number }> = [];
    for (const g of shardKeys) {
      const s = await getShard(g);
      const dim = s.dim;
      for (let i = 0; i < s.ids.length; i++) {
        const m = s.meta[i];
        if (m.audience === 'STAFF' && !filter.includeStaffResources) continue;
        if (filter.subjectKeys?.length && (!m.subjectKey || !filter.subjectKeys.includes(m.subjectKey))) continue;
        if (filter.mediums?.length && m.medium && !filter.mediums.includes(m.medium) && m.medium !== 'BOTH') continue;
        if (filter.chapterNumber != null && m.chapterNumber !== filter.chapterNumber) continue;
        if (filter.documentIds?.length && !filter.documentIds.includes(m.documentId)) continue;
        let dot = 0;
        const off = i * dim;
        for (let d = 0; d < dim; d++) dot += s.matrix[off + d] * q[d];
        hits.push({ id: s.ids[i], score: dot });
      }
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, k);
  },

  async stats() {
    return [...shards.keys()].sort();
  },
};
