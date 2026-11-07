# RAG Architecture

One central RAG service inside the existing Express/Mongoose backend (`backend/src/modules/rag/`) powers the Student AI Learning Assistant, the Teacher AI Teaching Assistant, AI quiz generation, AI assignment generation and Smart Board AI. There is no separate AI application and no Principal AI dashboard.

```
Nepal data PDFs → ingestion.service (hash, status, resume)
   → extraction.service  (text layer | Preeti→Unicode | Gemini page OCR)
   → chunker             (clean headers/footers, heading-aware chunks, overlap, page+chapter metadata)
   → embedding.service   (local multilingual-e5-small, or Gemini embeddings)
   → RagChunk (MongoDB)  (text + metadata + Float32 vector)
Question → scope.service (class/subject/medium from the DB) → retrieval.service (vector + keyword, RRF)
   → answer.service / generation.service / smartboard-vision.service → Gemini → answer + page sources
```

| Module | Responsibility |
| --- | --- |
| `gemini.service.ts` | Server-side Gemini REST client: key only in a header, redacted from logs/errors, concurrency gate, retry/backoff, model fallback chain on daily quota, usage counters |
| `embedding.service.ts` | Provider switch (`RAG_EMBEDDING_PROVIDER=local|gemini`); chunks store the model that embedded them |
| `extraction.service.ts`, `preeti.ts` | Text layer extraction, legacy Preeti conversion, Gemini OCR of PDF slices |
| `chunker.ts` | Cleaning and structure-aware chunking |
| `ingestion.service.ts` | Inventory sync, per-PDF pipeline, resumable embedding, deleted/changed file handling |
| `vector.service.ts` | In-process cosine search per class shard (self-hosted MongoDB has no `$vectorSearch`) |
| `scope.service.ts` | Decides what a user may search; re-checks every retrieved chunk |
| `retrieval.service.ts` | Hybrid retrieval (semantic + MongoDB text index, reciprocal-rank fusion) |
| `answer.service.ts` | Grounded answers with groundedness label and renumbered source citations |
| `generation.service.ts` | Quiz and assignment drafts (validated, de-duplicated, never published) |
| `smartboard-vision.service.ts` | Board image + text + RAG → Gemini multimodal |

Vector storage: MongoDB collection `ragchunks` (no extra infrastructure). Self-hosted MongoDB 8.0 has no Atlas Vector Search, so vectors are scanned in memory per class (about 384 floats per chunk).

Existing endpoints reused: `POST /api/v1/ai/chat` (Student/Teacher panels), `POST /api/v1/ai/query` (Smart Board), `POST /api/v1/quizzes/generate-ai`, `POST /api/v1/assignments/generate-ai`. New: `GET /api/v1/ai/scope`, `DELETE /api/v1/ai/conversations/:id`.

Operations: `npm run rag:ingest -- sync | status | run | retry | reprocess --file <text> | report`.
