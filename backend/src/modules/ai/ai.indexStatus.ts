import { RagDocument } from '../../models/Rag';
import { EmbeddingService } from '../rag/embedding.service';
import { GeminiService } from '../rag/gemini.service';

/** Super Admin: how much of the textbook library is searchable. */
export const indexStatus = async (req: any, res: any, next: any) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only the platform administrator can view the AI index status.' });
    }
    const docs: any[] = await RagDocument.find({})
      .select('title gradeNumber subjectName medium status pageCount pagesExtracted pagesOcr pagesEmpty chunkCount error textLayer')
      .sort({ gradeNumber: 1, title: 1 })
      .lean();
    const byGrade: Record<string, any> = {};
    for (const d of docs) {
      const k = d.gradeNumber ? `Class ${d.gradeNumber}` : 'Reference';
      const g = (byGrade[k] = byGrade[k] || { label: k, grade: d.gradeNumber || 0, books: 0, indexed: 0, pages: 0, chunks: 0 });
      g.books++;
      g.pages += d.pageCount || 0;
      g.chunks += d.chunkCount || 0;
      if (d.status === 'INDEXED') g.indexed++;
    }
    const sum = (f: (d: any) => number) => docs.reduce((n, d) => n + (f(d) || 0), 0);
    const counts: Record<string, number> = {};
    docs.forEach((d) => (counts[d.status] = (counts[d.status] || 0) + 1));
    return res.json({
      success: true,
      data: {
        totals: {
          books: docs.length,
          indexed: counts.INDEXED || 0,
          pages: sum((d) => d.pageCount),
          pagesWithText: sum((d) => d.pagesExtracted),
          pagesEmpty: sum((d) => d.pagesEmpty),
          chunks: sum((d) => d.chunkCount),
        },
        statusCounts: counts,
        byGrade: Object.values(byGrade).sort((a: any, b: any) => a.grade - b.grade),
        needsAttention: docs
          .filter((d) => d.status !== 'INDEXED')
          .map((d) => ({ title: d.title, grade: d.gradeNumber, status: d.status, error: d.error ? String(d.error).slice(0, 160) : undefined, scanned: d.textLayer === 'NONE' }))
          .slice(0, 60),
        embeddingModel: EmbeddingService.modelName,
        geminiConfigured: GeminiService.isConfigured(),
      },
    });
  } catch (e) {
    next(e);
  }
};
