import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  Table,
  CheckCircle2,
  XCircle,
  Calculator,
  BookOpen,
  Sparkles,
  Lightbulb,
  Award,
  Bookmark,
  Target,
  FileQuestion,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface StructuredResponseRendererProps {
  content: string;
  showToClass?: boolean;
  onJumpToPage?: (page: number) => void;
}

/** Sanitize raw text to prevent XSS while allowing KaTeX */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Render KaTeX expressions cleanly without clunky button boxes */
function renderMath(text: string): string {
  if (!text) return '';

  // 1. Display Math $$ ... $$
  let res = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, expr) => {
    try {
      const rendered = katex.renderToString(expr.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="katex-display-box my-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center font-mono overflow-x-auto text-slate-900 font-bold text-sm shadow-2xs">${rendered}</div>`;
    } catch {
      return `<pre class="p-2.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-mono font-semibold border border-slate-200">${escapeHtml(expr)}</pre>`;
    }
  });

  // 2. Inline Math $ ... $
  res = res.replace(/\$([^\$\n]+?)\$/g, (_match, expr) => {
    try {
      const rendered = katex.renderToString(expr.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      // Render clean, natural mathematical typography with subtle padding
      return `<span class="katex-inline-box px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 text-slate-900 font-mono font-semibold text-[13px] border border-slate-200/80 inline-flex items-center align-baseline">${rendered}</span>`;
    } catch {
      return `<code class="px-1 py-0.5 rounded bg-slate-100 text-slate-900 text-xs font-semibold">${escapeHtml(expr)}</code>`;
    }
  });

  return res;
}

/** Format inline markdown: bold, italics, code, citations */
function formatInlineMarkdown(text: string): string {
  if (!text) return '';
  let str = text;

  // Clean bold text
  str = str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
  // Italics
  str = str.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-700 font-medium">$1</em>');
  // Inline code
  str = str.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-mono text-[11px] font-bold border border-slate-200">$1</code>');
  // Citations [p. 16] or [पेज १६] or [p. 6, 8] or p. 6
  str = str.replace(/\[?(p\.\s*([\d]+(?:,\s*[\d]+|-[\d]+)*)|पेज\s*([\d०-९]+)|Page\s*([\d]+))\]?/gi, (match, fullMatch, pNum1, pNum2, pNum3) => {
    const pageTarget = pNum1 || pNum2 || pNum3 || '';
    const numericOnly = pageTarget.match(/\d+/)?.[0] || '';
    return `<span class="inline-flex items-center gap-0.5 px-2 py-0.5 mx-0.5 rounded-md bg-emerald-50 text-emerald-900 font-bold text-[10px] border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 cursor-pointer transition shadow-2xs" data-page="${numericOnly}" title="Click to view textbook page">${fullMatch}</span>`;
  });

  return str;
}

export const StructuredResponseRenderer: React.FC<StructuredResponseRendererProps> = ({
  content,
  showToClass = false,
  onJumpToPage,
}) => {
  // Parse markdown content into semantic blocks
  const blocks = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const parsedBlocks: any[] = [];
    let currentTable: string[] = [];
    let inTable = false;
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join('\n').trim();
        if (text) {
          parsedBlocks.push({ type: 'PARAGRAPH', content: text });
        }
        currentParagraph = [];
      }
    };

    const flushTable = () => {
      if (currentTable.length > 0) {
        parsedBlocks.push({ type: 'TABLE', lines: [...currentTable] });
        currentTable = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Table Row Detection (| col1 | col2 |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
        flushParagraph();
        inTable = true;
        currentTable.push(trimmed);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        flushParagraph();
        parsedBlocks.push({ type: 'H3', title: trimmed.replace(/^###\s+/, '') });
      } else if (trimmed.startsWith('## ')) {
        flushParagraph();
        parsedBlocks.push({ type: 'H2', title: trimmed.replace(/^##\s+/, '') });
      } else if (trimmed.startsWith('# ')) {
        flushParagraph();
        parsedBlocks.push({ type: 'H1', title: trimmed.replace(/^#\s+/, '') });
      } else if (trimmed === '---') {
        flushParagraph();
        parsedBlocks.push({ type: 'DIVIDER' });
      } else if (trimmed.startsWith('> ')) {
        flushParagraph();
        parsedBlocks.push({ type: 'CALLOUT', content: trimmed.replace(/^>\s+/, '') });
      } else if (/^[-*]\s+/.test(trimmed)) {
        flushParagraph();
        parsedBlocks.push({ type: 'BULLET', content: trimmed.replace(/^[-*]\s+/, '') });
      } else if (/^\d+\.\s+/.test(trimmed)) {
        flushParagraph();
        const m = trimmed.match(/^(\d+)\.\s+(.*)$/);
        parsedBlocks.push({
          type: 'NUMBERED_STEP',
          number: m ? m[1] : '1',
          content: m ? m[2] : trimmed,
        });
      } else if (trimmed === '') {
        flushParagraph();
      } else {
        currentParagraph.push(line);
      }
    }

    flushParagraph();
    flushTable();

    return parsedBlocks;
  }, [content]);

  // Click delegate for jump-to-page links
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onJumpToPage) return;
    const target = (e.target as HTMLElement).closest('[data-page]');
    if (target) {
      const pageStr = target.getAttribute('data-page');
      if (pageStr) {
        const pageNum = parseInt(pageStr, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          onJumpToPage(pageNum);
        }
      }
    }
  };

  // Render Table Component (Comparison Tables or Multi-column Differences)
  const renderTableBlock = (tableLines: string[], index: number) => {
    if (tableLines.length < 2) return null;

    // Parse header
    const rawHeader = tableLines[0].split('|').map((s) => s.trim()).filter((s) => s.length > 0);
    // Ignore separator line (tableLines[1] e.g. |---|---|)
    const dataRows = tableLines.slice(2).map((row) =>
      row
        .split('|')
        .map((s) => s.trim())
        .filter((_s, idx, arr) => idx > 0 && idx < arr.length - 1)
    );

    const isComparison = rawHeader.length >= 2;

    return (
      <div key={`table-${index}`} className="my-3.5 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table size={14} className="text-emerald-700" />
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {isComparison ? 'Concept Comparison (तुलना / भिन्नता)' : 'Structured Table'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
            {rawHeader.length} Columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200">
                {rawHeader.map((h, i) => (
                  <th
                    key={i}
                    className="p-2.5 font-extrabold text-slate-900 border-r last:border-r-0 border-slate-200 tracking-tight"
                  >
                    <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(h)) }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`transition-colors ${
                    rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="p-2.5 text-slate-800 font-medium border-r last:border-r-0 border-slate-100 leading-relaxed align-top"
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderMath(formatInlineMarkdown(cell)),
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`structured-response-body text-slate-900 leading-relaxed transition-all ${
        showToClass ? 'text-[13.5px] md:text-[14.5px]' : 'text-[12.5px] md:text-[13px]'
      }`}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'H1':
            return (
              <div
                key={idx}
                className="mt-3.5 mb-2.5 pb-2 border-b border-slate-200 flex items-start gap-2.5 bg-gradient-to-r from-emerald-50/60 to-transparent p-2.5 rounded-xl border border-emerald-100/80"
              >
                <div className="p-1 rounded-lg bg-emerald-600 text-white flex-shrink-0 mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h1 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.title)) }} />
                  </h1>
                </div>
              </div>
            );

          case 'H2':
            return (
              <h2
                key={idx}
                className="text-xs md:text-sm font-extrabold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200/90 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0"></span>
                <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.title)) }} />
              </h2>
            );

          case 'H3': {
            const titleLower = block.title.toLowerCase();
            const isNumericalStep =
              titleLower.includes('given data') ||
              titleLower.includes('to find') ||
              titleLower.includes('formula') ||
              titleLower.includes('calculation') ||
              titleLower.includes('final answer');

            const isAdvantage = titleLower.includes('advantage') || titleLower.includes('फाइदा');
            const isDisadvantage = titleLower.includes('disadvantage') || titleLower.includes('बेफाइदा');
            const isSimpleExpl = titleLower.includes('simple explanation') || titleLower.includes('सरल व्याख्या');
            const isKeyChar = titleLower.includes('key characteristics') || titleLower.includes('विशेषता');
            const isClassroomEx = titleLower.includes('classroom example') || titleLower.includes('उदाहरण');
            const isLearningObj = titleLower.includes('learning objective') || titleLower.includes('सिकाइ उपलब्धि');

            return (
              <div
                key={idx}
                className={`mt-3.5 mb-2 flex items-center gap-2 text-xs md:text-sm font-bold ${
                  isSimpleExpl
                    ? 'p-2 rounded-lg bg-emerald-50/80 text-emerald-950 border-l-4 border-emerald-600'
                    : isKeyChar
                    ? 'p-2 rounded-lg bg-indigo-50/80 text-indigo-950 border-l-4 border-indigo-600'
                    : isClassroomEx
                    ? 'p-2 rounded-lg bg-amber-50/80 text-amber-950 border-l-4 border-amber-500'
                    : isLearningObj
                    ? 'p-2 rounded-lg bg-teal-50/80 text-teal-950 border-l-4 border-teal-600'
                    : isNumericalStep
                    ? 'p-2 rounded-lg bg-slate-100 text-slate-900 border-l-4 border-slate-600'
                    : isAdvantage
                    ? 'p-2 rounded-lg bg-emerald-50/80 text-emerald-950 border-l-4 border-emerald-500'
                    : isDisadvantage
                    ? 'p-2 rounded-lg bg-rose-50/80 text-rose-950 border-l-4 border-rose-500'
                    : 'text-slate-900 border-b border-slate-200 pb-1 pt-1 font-extrabold uppercase tracking-wide'
                }`}
              >
                {isSimpleExpl ? (
                  <BookOpen size={14} className="text-emerald-700 flex-shrink-0" />
                ) : isKeyChar ? (
                  <Sparkles size={14} className="text-indigo-700 flex-shrink-0" />
                ) : isClassroomEx ? (
                  <Lightbulb size={14} className="text-amber-600 flex-shrink-0" />
                ) : isLearningObj ? (
                  <Target size={14} className="text-teal-700 flex-shrink-0" />
                ) : isNumericalStep ? (
                  <Calculator size={14} className="text-slate-700 flex-shrink-0" />
                ) : isAdvantage ? (
                  <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                ) : isDisadvantage ? (
                  <XCircle size={14} className="text-rose-600 flex-shrink-0" />
                ) : (
                  <Bookmark size={14} className="text-emerald-700 flex-shrink-0" />
                )}
                <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.title)) }} />
              </div>
            );
          }

          case 'CALLOUT': {
            const contentLower = block.content.toLowerCase();
            const isDefinition = contentLower.includes('definition') || contentLower.includes('परिभाषा');
            const isFormula = contentLower.includes('formula') || contentLower.includes('सूत्र');
            const isNote = contentLower.includes('note') || contentLower.includes('टिपोट');

            return (
              <div
                key={idx}
                className={`my-2.5 p-3 rounded-xl border text-slate-900 shadow-2xs flex items-start gap-2.5 ${
                  isDefinition
                    ? 'bg-emerald-50/70 border-emerald-200/90 border-l-4 border-l-emerald-600'
                    : isFormula
                    ? 'bg-amber-50/70 border-amber-200/90 border-l-4 border-l-amber-500'
                    : isNote
                    ? 'bg-blue-50/70 border-blue-200/90 border-l-4 border-l-blue-600'
                    : 'bg-slate-50/80 border-slate-200/90 border-l-4 border-l-emerald-600'
                }`}
              >
                {isDefinition ? (
                  <Bookmark size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                ) : isFormula ? (
                  <Calculator size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                )}
                <div
                  className="font-medium text-xs md:text-sm leading-relaxed text-slate-900 flex-1"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );
          }

          case 'BULLET':
            return (
              <div key={idx} className="flex items-start gap-2.5 my-1.5 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                <div
                  className="leading-relaxed text-slate-800 font-normal text-xs md:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'NUMBERED_STEP':
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 my-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 shadow-2xs"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  {block.number}
                </div>
                <div
                  className="leading-relaxed text-slate-900 font-medium flex-1 text-xs md:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'TABLE':
            return renderTableBlock(block.lines, idx);

          case 'DIVIDER':
            return <hr key={idx} className="my-3.5 border-slate-200" />;

          case 'PARAGRAPH':
          default:
            return (
              <div
                key={idx}
                className="my-1.5 leading-relaxed text-slate-800 font-normal text-xs md:text-sm"
                dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
              />
            );
        }
      })}
    </div>
  );
};
