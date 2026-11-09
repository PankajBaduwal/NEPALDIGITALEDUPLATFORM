# RAG Test Report

## Passed (this session)
- Backend and frontend TypeScript compile cleanly.
- Pipeline on a real book: text extraction, chunking, embedding, indexing, retrieval (Class 5 English: 210/211 pages, 209 chunks).
- Gemini OCR of PDF slices returned clean Unicode Nepali for a Preeti-font book and English with LaTeX for a scanned book (2 pages each).
- Preeti-to-Unicode converter: ~87% character-level agreement with Gemini OCR on one page, lower on pages with mixed English; known limitation.
- Gemini grounded answer: one live test produced an answer from the Class 5 book with textbook-based steps (before the citation-renumbering change).
- Scope and role security checks (see AI_SECURITY_REPORT.md).
- Student and Teacher AI screens render with no console errors (screenshots reviewed).

## Not tested / not verified
- Citation renumbering and groundedness labels after the final change (Gemini daily quota was exhausted).
- Quiz generation, assignment generation and Smart Board vision with live Gemini calls.
- Nepali answers, mathematics/physics/chemistry question sets, handwriting, graphs.
- Regression of existing Quiz Studio, Assignment Studio, PDF reader beyond compilation and page load.
- Full ingestion: 141 PDFs are registered; indexing of the 120 text-based PDFs is running in the background; the 21 scanned PDFs (4,762 pages) are not processed (need Gemini OCR quota).

## Status update — 2026-11-05
- Indexed: 117 of 141 books (about 31,000 chunks). 24 books FAILED, all with "AI daily limit reached" from Gemini page reading (21 scanned books plus 3 books with OCR-needed pages). They resume with `cd backend && npm run rag:ingest -- retry` once quota is available.
- Gemini declined to transcribe at least 73 pages in 3 books (finish reason RECITATION); those pages are empty in the index.
- Retrieval self-test: see RAG_RETRIEVAL_TEST_REPORT.md (99.5% on 419 queries, 0 cross-class results).
- Not run: live Gemini answers, Nepali answers, quiz/assignment generation and Smart Board image reading, because the free daily generation quota was exhausted. These remain unverified.
