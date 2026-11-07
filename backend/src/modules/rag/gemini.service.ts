import { ENV } from '../../config/env';

/**
 * Server-side Gemini client (REST). The API key never leaves the backend:
 * it is sent only in the x-goog-api-key header and is redacted from every log/error.
 */
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

export interface GeminiUsage {
  generateCalls: number;
  embedCalls: number;
  visionCalls: number;
  inputTokens: number;
  outputTokens: number;
  embeddedChars: number;
  errors: number;
  retries: number;
}

const usage: GeminiUsage = { generateCalls: 0, embedCalls: 0, visionCalls: 0, inputTokens: 0, outputTokens: 0, embeddedChars: 0, errors: 0, retries: 0 };

export class GeminiError extends Error {
  public daily = false;
  public retryAfterMs = 0;
  constructor(message: string, public status = 0, public retryable = false) {
    super(message);
  }
}

const redact = (text: string) => {
  const key = ENV.GEMINI_API_KEY;
  let out = text;
  if (key) out = out.split(key).join('[redacted-key]');
  return out.replace(/AIza[0-9A-Za-z_-]{20,}|AQ\.[0-9A-Za-z_-]{20,}/g, '[redacted-key]');
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Simple concurrency + spacing gate so bulk jobs never exceed the project's rate limit. */
class Gate {
  private active = 0;
  private queue: Array<() => void> = [];
  constructor(public max: number) {}
  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.max) await new Promise<void>((r) => this.queue.push(r));
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      this.queue.shift()?.();
    }
  }
}
const gate = new Gate(parseInt(process.env.GEMINI_CONCURRENCY || '4', 10));

/** Sliding one-minute token budget so a free-tier key (30k embed tokens/min) never trips its quota. */
const EMBED_TPM = parseInt(process.env.RAG_EMBED_TPM || '22000', 10);
const embedWindow: Array<{ at: number; tokens: number }> = [];
const estTokens = (t: string) => Math.ceil(Math.min(t.length, 8000) / 3.2);
async function waitForEmbedBudget(tokens: number) {
  for (;;) {
    const now = Date.now();
    while (embedWindow.length && now - embedWindow[0].at > 60_000) embedWindow.shift();
    const used = embedWindow.reduce((n, e) => n + e.tokens, 0);
    if (used + tokens <= EMBED_TPM || embedWindow.length === 0) {
      embedWindow.push({ at: now, tokens });
      return;
    }
    await sleep(Math.max(500, 60_000 - (now - embedWindow[0].at) + 100));
  }
}

/** Models are tried in order; one that hit its daily quota is skipped until it resets. */
const exhausted = new Map<string, number>();
const textChain = () => [...new Set([ENV.GEMINI_TEXT_MODEL, ...(process.env.GEMINI_TEXT_FALLBACK_MODELS || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3-flash-preview').split(',').map((m) => m.trim()).filter(Boolean)])];
const visionChain = () => [...new Set([ENV.GEMINI_MULTIMODAL_MODEL, ...(process.env.GEMINI_MULTIMODAL_FALLBACK_MODELS || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3-flash-preview').split(',').map((m) => m.trim()).filter(Boolean)])];
async function withModels<T>(chain: string[], fn: (model: string) => Promise<T>): Promise<T> {
  let last: any;
  for (const m of chain) {
    if ((exhausted.get(m) || 0) > Date.now()) continue;
    try {
      return await fn(m);
    } catch (e: any) {
      if (e instanceof GeminiError && e.daily) {
        exhausted.set(m, Date.now() + Math.min(e.retryAfterMs || 6 * 3600_000, 24 * 3600_000));
        last = e;
        continue;
      }
      if (e instanceof GeminiError && e.retryable) {
        // Overloaded model (503/429 burst): rest it for a minute and try the next one
        exhausted.set(m, Date.now() + 60_000);
        last = e;
        continue;
      }
      throw e;
    }
  }
  throw last || new GeminiError('The AI daily limit has been reached. Please try again later.', 429, false);
}

export const GeminiService = {
  isConfigured: () => !!ENV.GEMINI_API_KEY,

  /** Startup/initialisation check: clear error if the key is missing or rejected. */
  async validate(): Promise<{ ok: boolean; message: string }> {
    if (!ENV.GEMINI_API_KEY) return { ok: false, message: 'GEMINI_API_KEY is not set in the backend environment.' };
    try {
      const r = await fetch(`${BASE}/models/${ENV.GEMINI_EMBEDDING_MODEL}`, { headers: { 'x-goog-api-key': ENV.GEMINI_API_KEY } });
      if (r.status === 400 || r.status === 401 || r.status === 403) return { ok: false, message: `Gemini rejected the configured API key (HTTP ${r.status}). Rotate the key in the backend .env.` };
      if (!r.ok) return { ok: false, message: `Gemini check failed (HTTP ${r.status}).` };
      return { ok: true, message: 'Gemini API key accepted.' };
    } catch (e: any) {
      return { ok: false, message: redact(`Gemini unreachable: ${e.message}`) };
    }
  },

  getUsage: (): GeminiUsage => ({ ...usage }),

  async call<T = any>(path: string, body: any, timeoutMs = 120_000, attempts = 6): Promise<T> {
    if (!ENV.GEMINI_API_KEY) throw new GeminiError('AI service is not configured (GEMINI_API_KEY missing).', 503);
    let lastErr: any;
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await gate.run(async () => {
          const ctl = new AbortController();
          const timer = setTimeout(() => ctl.abort(), timeoutMs);
          try {
            return await fetch(`${BASE}/${path}`, {
              method: 'POST',
              headers: { 'x-goog-api-key': ENV.GEMINI_API_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
              signal: ctl.signal,
            });
          } finally {
            clearTimeout(timer);
          }
        });
        if (res.ok) return (await res.json()) as T;
        const text = redact(await res.text());
        if (res.status === 429 && /per day|PerDay/i.test(text)) {
          // Daily quota (free tier): retrying is pointless; let the caller switch model
          const m = text.match(/retry in (?:(\d+)h)?(?:(\d+)m)?/i);
          const ge = new GeminiError('Gemini daily quota reached for this model', 429, false);
          ge.daily = true;
          ge.retryAfterMs = ((parseInt(m?.[1] || '0', 10) * 60 + parseInt(m?.[2] || '0', 10)) * 60 || 6 * 3600) * 1000;
          throw ge;
        }
        const retryable = res.status === 429 || res.status >= 500;
        if (!retryable) {
          usage.errors++;
          throw new GeminiError(`Gemini request failed (HTTP ${res.status}): ${text.slice(0, 300)}`, res.status, false);
        }
        lastErr = new GeminiError(`Gemini busy (HTTP ${res.status}): ${text.replace(/\s+/g, ' ').slice(0, 220)}`, res.status, true);
        // Honour the server's suggested delay when present
        const m = text.match(/retry in ([\d.]+)s/i);
        const wait = m ? Math.ceil(parseFloat(m[1]) * 1000) + 500 : Math.min(60_000, 1500 * 2 ** i + Math.random() * 800);
        usage.retries++;
        await sleep(wait);
      } catch (e: any) {
        if (e instanceof GeminiError && !e.retryable) throw e;
        lastErr = e instanceof GeminiError ? e : new GeminiError(redact(e.name === 'AbortError' ? 'Gemini request timed out' : e.message), 0, true);
        usage.retries++;
        await sleep(Math.min(30_000, 1500 * 2 ** i));
      }
    }
    usage.errors++;
    throw lastErr instanceof GeminiError ? lastErr : new GeminiError(redact(String(lastErr?.message || lastErr)));
  },

  /** Text generation. `json` asks Gemini for a JSON response body. */
  async generate(opts: { system?: string; prompt: string; json?: boolean; temperature?: number; maxOutputTokens?: number; model?: string }): Promise<string> {
    const body: any = {
      contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.3,
        maxOutputTokens: opts.maxOutputTokens ?? 4096,
        ...(opts.json ? { responseMimeType: 'application/json' } : {}),
      },
    };
    if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
    const j: any = await withModels(opts.model ? [opts.model] : textChain(), (m) => this.call(`models/${m}:generateContent`, body));
    usage.generateCalls++;
    usage.inputTokens += j.usageMetadata?.promptTokenCount || 0;
    usage.outputTokens += j.usageMetadata?.candidatesTokenCount || 0;
    const parts = j.candidates?.[0]?.content?.parts || [];
    const text = parts.filter((p: any) => p.text && !p.thought).map((p: any) => p.text).join('');
    if (!text) throw new GeminiError(`Gemini returned no text (${j.candidates?.[0]?.finishReason || j.promptFeedback?.blockReason || 'empty'})`, 0, false);
    return text;
  },

  /** Multimodal call: images or PDFs passed inline as base64. */
  async generateWithMedia(opts: { system?: string; prompt: string; media: Array<{ mimeType: string; data: Buffer }>; json?: boolean; temperature?: number; maxOutputTokens?: number }): Promise<string> {
    const parts: any[] = opts.media.map((m) => ({ inline_data: { mime_type: m.mimeType, data: m.data.toString('base64') } }));
    parts.push({ text: opts.prompt });
    const body: any = {
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: opts.temperature ?? 0.2,
        maxOutputTokens: opts.maxOutputTokens ?? 8192,
        ...(opts.json ? { responseMimeType: 'application/json' } : {}),
      },
    };
    if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
    const j: any = await withModels(visionChain(), (m) => this.call(`models/${m}:generateContent`, body, 180_000));
    usage.visionCalls++;
    usage.inputTokens += j.usageMetadata?.promptTokenCount || 0;
    usage.outputTokens += j.usageMetadata?.candidatesTokenCount || 0;
    const out = (j.candidates?.[0]?.content?.parts || []).filter((p: any) => p.text && !p.thought).map((p: any) => p.text).join('');
    if (!out) throw new GeminiError(`Gemini returned no text (${j.candidates?.[0]?.finishReason || j.promptFeedback?.blockReason || 'empty'})`, 0, false);
    return out;
  },

  /** Embeds many texts. taskType RETRIEVAL_DOCUMENT for chunks, RETRIEVAL_QUERY for questions. */
  async embed(texts: string[], taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'): Promise<number[][]> {
    const dim = ENV.GEMINI_EMBEDDING_DIMENSIONS;
    const out: number[][] = [];
    const EMBED_BATCH = parseInt(process.env.RAG_EMBED_BATCH || '24', 10);
    for (let i = 0; i < texts.length; i += EMBED_BATCH) {
      const batch = texts.slice(i, i + EMBED_BATCH);
      await waitForEmbedBudget(batch.reduce((n, t) => n + estTokens(t), 0));
      const j: any = await this.call(`models/${ENV.GEMINI_EMBEDDING_MODEL}:batchEmbedContents`, {
        requests: batch.map((t) => ({
          model: `models/${ENV.GEMINI_EMBEDDING_MODEL}`,
          content: { parts: [{ text: t.slice(0, 8000) }] },
          taskType,
          outputDimensionality: dim,
        })),
      });
      usage.embedCalls++;
      usage.embeddedChars += batch.reduce((n, t) => n + Math.min(t.length, 8000), 0);
      const vecs: number[][] = (j.embeddings || []).map((e: any) => e.values);
      if (vecs.length !== batch.length) throw new GeminiError('Embedding response size mismatch');
      for (const v of vecs) out.push(normalize(v));
    }
    return out;
  },
};

/** Truncated-dimension embeddings are not unit length; normalise so cosine == dot product. */
export function normalize(v: number[]): number[] {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  return v.map((x) => x / n);
}
