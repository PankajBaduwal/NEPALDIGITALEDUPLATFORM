import path from 'path';
import { ENV } from '../../config/env';
import { GeminiService } from './gemini.service';

/**
 * Embedding provider switch.
 *  - local  : multilingual-e5-small (ONNX, runs inside this backend; no API quota, supports Nepali) — default
 *  - gemini : Gemini embedding API (needs a billing-enabled key for bulk indexing; the free tier allows 1,000 requests/day)
 * Chunks remember which model embedded them, so switching provider triggers a clean re-embed instead of mixing vectors.
 */
const PROVIDER = (process.env.RAG_EMBEDDING_PROVIDER || 'local').toLowerCase() === 'gemini' ? 'gemini' : 'local';
const LOCAL_MODEL = process.env.RAG_LOCAL_EMBEDDING_MODEL || 'Xenova/multilingual-e5-small';
const LOCAL_DIM = 384;

let extractor: Promise<any> | null = null;
let chain: Promise<unknown> = Promise.resolve(); // the local model is CPU-bound: run one batch at a time

async function getExtractor() {
  if (!extractor) {
    extractor = (async () => {
      const { pipeline, env } = await import('@huggingface/transformers');
      env.cacheDir = path.resolve(__dirname, '../../../data/models');
      return pipeline('feature-extraction', LOCAL_MODEL, { dtype: 'q8' } as any);
    })().catch((e) => {
      extractor = null;
      throw e;
    });
  }
  return extractor;
}

export const EmbeddingService = {
  provider: PROVIDER,
  modelName: PROVIDER === 'gemini' ? ENV.GEMINI_EMBEDDING_MODEL : LOCAL_MODEL,
  dimensions: PROVIDER === 'gemini' ? ENV.GEMINI_EMBEDDING_DIMENSIONS : LOCAL_DIM,

  async embed(texts: string[], taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'): Promise<number[][]> {
    if (PROVIDER === 'gemini') return GeminiService.embed(texts, taskType);
    const prefix = taskType === 'RETRIEVAL_QUERY' ? 'query: ' : 'passage: ';
    const run = async () => {
      const ext = await getExtractor();
      const out: number[][] = [];
      for (let i = 0; i < texts.length; i += 16) {
        const res = await ext(texts.slice(i, i + 16).map((t) => prefix + t.slice(0, 2500)), { pooling: 'mean', normalize: true });
        out.push(...(res.tolist() as number[][]));
      }
      return out;
    };
    const next = chain.then(run, run);
    chain = next.catch(() => undefined);
    return next;
  },
};
