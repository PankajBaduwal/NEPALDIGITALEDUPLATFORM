# Gemini Integration

- Key: `GEMINI_API_KEY` in `backend/.env` only. Never in frontend env files, never `VITE_`-prefixed, never returned by an API or written to logs (errors are redacted). `.gitignore` ignores `.env`; `backend/.env.example` has placeholders.
- Models are configuration: `GEMINI_TEXT_MODEL`, `GEMINI_MULTIMODAL_MODEL` (default `gemini-3.5-flash`), `GEMINI_EMBEDDING_MODEL` (`gemini-embedding-001`). `gemini-2.5-flash` is no longer available to new keys.
- Fallback chain on a daily-quota or overload error: `GEMINI_TEXT_FALLBACK_MODELS` (default `gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3-flash-preview`).
- `GeminiService.validate()` checks the key at CLI start and reports a clear message if it is missing or rejected. Rotate by editing `.env` and restarting; no frontend change.
- Embeddings: default is a local multilingual model (no quota). `RAG_EMBEDDING_PROVIDER=gemini` switches to the Gemini embedding API.

## Free-tier limits measured on this key
| Limit | Value |
| --- | --- |
| Generate content | 20 requests/day per model |
| Embed content | 1,000 requests/day, 30,000 tokens/minute |
These limits make bulk embedding and bulk OCR through Gemini impractical on a free key, which is why local embeddings are the default.
