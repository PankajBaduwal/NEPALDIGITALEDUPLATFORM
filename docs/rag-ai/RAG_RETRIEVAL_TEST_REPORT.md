# RAG Retrieval Test Report

Status: **pilot only.** Full retrieval accuracy testing across all classes has not been run because indexing is still in progress.

Pilot (Class 5 English textbook, 209 chunks, Gemini embeddings, class-5/English filter): three queries returned pages from the correct book within 1–25 ms. Relevance was plausible but not graded against an answer key (for example "simple present tense examples" returned exercise pages on present-tense sentences; "write a letter to an elder sister" returned the letter-writing unit).

Local embedding model check (multilingual-e5-small): relevant passage similarity 0.896 vs unrelated 0.789 on a short English example; ranking correct. Not yet measured on a labelled Nepali question set.

To do when indexing finishes: a labelled question set per class (1, 5, 8, 10, 11, 12 at minimum) measuring correct book/chapter/page in the top 3 and cross-class contamination (expected 0 by construction because the class filter is applied before ranking).

## Automated retrieval self-test (all indexed books) — 2026-11-05

Command: `cd backend && npm run rag:eval -- --per-doc 4` (no Gemini calls, local embeddings `Xenova/multilingual-e5-small`, results in `backend/data/rag-eval.json`).

Method: for each indexed class book, 4 passages are sampled, a query is built from a sentence of the passage, and retrieval runs with a scope limited to that book's class and subject. A hit means the source book is in the top 6.

| Class | Queries | Hits | Other-class results |
| --- | ---: | ---: | ---: |
| 1 | 20 | 19 | 0 |
| 2 | 20 | 20 | 0 |
| 3 | 20 | 19 | 0 |
| 4 | 20 | 20 | 0 |
| 5 | 36 | 36 | 0 |
| 6 | 32 | 32 | 0 |
| 7 | 44 | 44 | 0 |
| 8 | 36 | 36 | 0 |
| 9 | 76 | 76 | 0 |
| 10 | 76 | 76 | 0 |
| 11 | 24 | 24 | 0 |
| 12 | 15 | 15 | 0 |
| **All** | **419** | **417 (99.5%)** | **0** |

105 books, 0 empty results, 0 cross-class results.

Limits of this test: queries are sentences copied from the book, so it measures that indexing and scoping work, not how well it handles real student questions phrased differently. A labelled set of real questions (especially Nepali) is still to do. Staff reference documents (no class) are not covered. The 24 books not indexed (21 scanned plus 3 failed) are not covered.

## Hand-written question test — 2026-11-05

Command: `cd backend && npm run rag:qa` (30 differently-phrased questions, English and Nepali, Classes 1–12; results in `backend/data/rag-qa.json`). A question passes when an expected keyword appears in the top 3 passages.

- Result: 26 of 30 passed (86.7%), 0 passages from another class, 0 empty results. A Class 5 science query about quantum physics returned only Class 5 content.
- The 4 misses: the Class 5 Social Studies flag question, and Class 10 Science (Ohm's law), Mathematics (Pythagoras theorem) and History (end of Rana rule). Some of these topics may not be in those exact books.
- **Finding — Preeti text quality:** the Class 10 Science, Mathematics and History passages above show garbled characters in the stored text (numbers and English words in the old Preeti font come out as wrong Devanagari letters, for example "द्दघ" where a page number should be, and unreadable English terms in maths). The local converter is approximate, so retrieval and the quoted text are weaker for the roughly 82 Preeti-font books. Re-reading those books with Gemini (`RAG_PREETI_MODE=OCR`, then `reprocess`) would fix this but needs far more Gemini quota than the free tier.

## Behaviour when Gemini is unavailable
If Gemini's daily limit is reached, the Student and Teacher assistants now show the best-matching textbook passages with page citations and a notice, instead of an error (tested with a teacher Class 10 Science question and a student English question; HTTP 200). If no passage matches the student's class, subject and medium, the user still gets the "busy" message.
