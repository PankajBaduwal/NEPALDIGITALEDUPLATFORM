import { RagChunk } from '../../models/Rag';
import { EmbeddingService } from './embedding.service';
import { VectorStore } from './vector.service';
import { RagScope, ScopeService } from './scope.service';

export interface RetrievedChunk {
  id: string;
  score: number;
  vectorScore?: number;
  keywordRank?: number;
  text: string;
  textbookTitle: string;
  subjectName?: string;
  subjectKey?: string;
  gradeNumber?: number;
  medium?: string;
  chapterNumber?: number;
  chapter?: string;
  topic?: string;
  pageStart: number;
  pageEnd: number;
  relativePath?: string;
  textbookId?: string;
  contentType?: string;
}

const queryCache = new Map<string, { at: number; vec: number[] }>();
const CACHE_TTL = 30 * 60_000;

async function embedQuery(q: string): Promise<number[]> {
  const key = q.trim().toLowerCase();
  const hit = queryCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.vec;
  const [vec] = await EmbeddingService.embed([q], 'RETRIEVAL_QUERY');
  if (queryCache.size > 500) queryCache.delete(queryCache.keys().next().value as string);
  queryCache.set(key, { at: Date.now(), vec });
  return vec;
}

/** Keyword retrieval with MongoDB's text index, restricted to the same scope. */
async function keywordSearch(query: string, scope: RagScope, chapterNumber: number | undefined, k: number): Promise<string[]> {
  const terms = query.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((t) => t.length > 2).slice(0, 12);
  if (!terms.length) return [];
  const filter: any = { $text: { $search: terms.join(' ') } };
  const staff = scope.includeStaffResources;
  filter.$or = [
    { audience: { $ne: 'STAFF' }, gradeNumber: { $in: scope.grades } },
    ...(staff ? [{ audience: 'STAFF' }] : []),
  ];
  if (scope.subjectKeys.length) filter.$and = [{ $or: [{ subjectKey: { $in: scope.subjectKeys } }, { audience: 'STAFF' }] }];
  if (chapterNumber != null) filter.chapterNumber = chapterNumber;
  const rows: any[] = await RagChunk.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).limit(k).select('_id').lean();
  return rows.map((r) => String(r._id));
}

export const RetrievalService = {
  /**
   * Hybrid retrieval: semantic (embeddings) + keyword, merged by reciprocal-rank fusion,
   * then re-validated against the caller's scope so nothing outside it can reach the model.
   */
  async retrieve(query: string, scope: RagScope, opts: { topK?: number; chapterNumber?: number } = {}): Promise<RetrievedChunk[]> {
    const topK = opts.topK ?? 6;
    const vec = await embedQuery(query);
    const filter = ScopeService.toFilter(scope, { chapterNumber: opts.chapterNumber });
    const [vecHits, kwIds] = await Promise.all([VectorStore.search(vec, filter, 30), keywordSearch(query, scope, opts.chapterNumber, 20).catch(() => [])]);

    const fused = new Map<string, { score: number; vectorScore?: number; keywordRank?: number }>();
    vecHits.forEach((h, i) => fused.set(h.id, { score: 1 / (60 + i), vectorScore: h.score }));
    kwIds.forEach((id, i) => {
      const cur = fused.get(id) || { score: 0 };
      cur.score += 0.8 / (60 + i);
      cur.keywordRank = i + 1;
      fused.set(id, cur);
    });
    const candidates = [...fused.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, topK * 3);
    if (!candidates.length) return [];
    const rows: any[] = await RagChunk.find({ _id: { $in: candidates.map(([id]) => id) } })
      .select('text textbookTitle subjectName subjectKey gradeNumber gradeMin gradeMax audience medium chapterNumber chapter topic pageStart pageEnd relativePath textbookId contentType')
      .lean();
    const byId = new Map(rows.map((r) => [String(r._id), r]));
    // Questions about a concept are best answered from explanation text, not from exercise pages:
    // exercise chunks are demoted unless the user is asking for practice questions
    const wantsPractice = /\b(exercise|exercises|practice|question|questions|quiz|mcq|solve|worksheet|problem|problems|test)\b|अभ्यास|प्रश्न|समस्या/i.test(query);
    const ranked = candidates
      .map(([id, f]) => [id, { ...f, score: f.score * (!wantsPractice && byId.get(id)?.contentType === 'EXERCISE' ? 0.6 : 1) }] as [string, typeof f])
      .sort((a, b) => b[1].score - a[1].score);
    const out: RetrievedChunk[] = [];
    for (const [id, f] of ranked) {
      const r = byId.get(id);
      if (!r || !ScopeService.allows(scope, r)) continue;
      out.push({
        id, score: f.score, vectorScore: f.vectorScore, keywordRank: f.keywordRank, text: r.text, textbookTitle: r.textbookTitle, subjectName: r.subjectName, subjectKey: r.subjectKey,
        gradeNumber: r.gradeNumber, medium: r.medium, chapterNumber: r.chapterNumber, chapter: r.chapter, topic: r.topic, pageStart: r.pageStart, pageEnd: r.pageEnd, relativePath: r.relativePath,
        textbookId: r.textbookId ? String(r.textbookId) : undefined, contentType: r.contentType,
      });
      if (out.length >= topK) break;
    }
    return out;
  },

  /** Number of indexed chunks visible to a scope (used to tell users when a book is not indexed yet). */
  async coverage(scope: RagScope): Promise<number> {
    return RagChunk.countDocuments({ audience: { $ne: 'STAFF' }, gradeNumber: { $in: scope.grades }, ...(scope.subjectKeys.length ? { subjectKey: { $in: scope.subjectKeys } } : {}), embedding: { $exists: true }, embeddingModel: EmbeddingService.modelName });
  },
};
