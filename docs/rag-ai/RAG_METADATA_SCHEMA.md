# RAG Metadata Schema

`RagDocument` (one per PDF): relativePath (unique), sha256, sizeBytes, pageCount, textbookId, title, gradeNumber, gradeMin/gradeMax, audience (ALL|STAFF), subjectKey/subjectName, medium, documentType, textLayer, extractionMethod, status (PENDING, PROCESSING, EXTRACTING, OCR_REQUIRED, CHUNKING, EMBEDDING, INDEXED, FAILED, NEEDS_REVIEW), pagesExtracted/pagesOcr/pagesEmpty, chunkCount, chunksEmbedded, ingestionVersion, embeddingModel, error, attempts, lastIngestedAt, notes.

`RagChunk`: chunkId, documentId, textbookId, country (Nepal), curriculum (Nepal CDC), gradeNumber, medium, subjectKey, subjectName, textbookTitle, chapterNumber, chapter, topic, pdfId, relativePath, pageStart, pageEnd, contentType (TEXT|EXERCISE|FORMULA|TABLE), ingestionVersion, text, embedding (Float32 buffer), embeddingModel.

`RagPage`: per-page text cache so a failed run resumes without repeating OCR.
`unit` is not stored separately: CDC textbooks are organised by chapter/unit and the chapter field holds it.
