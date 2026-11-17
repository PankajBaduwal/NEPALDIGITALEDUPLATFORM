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
} from 'lucide-react';

interface StructuredResponseRendererProps {
  content: string;
  showToClass?: boolean;
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
      return `<div class="katex-display-box my-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center font-mono overflow-x-auto text-[#0f172a] font-bold text-sm shadow-2xs">${rendered}</div>`;
    } catch {
      return `<pre class="p-2.5 rounded-lg bg-slate-100 text-[#0f172a] text-xs font-mono font-semibold border border-slate-200">${escapeHtml(expr)}</pre>`;
    }
  });

  // 2. Inline Math $ ... $
  res = res.replace(/\$([^\$\n]+?)\$/g, (_match, expr) => {
    try {
      const rendered = katex.renderToString(expr.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      // Render clean, natural mathematical typography with subtle padding, not a clunky button box
      return `<span class="katex-inline-box px-1 py-0.5 mx-0.5 rounded bg-slate-100 text-[#0f172a] font-mono font-semibold text-[13px] border border-slate-200/70 inline-flex items-center align-baseline">${rendered}</span>`;
    } catch {
      return `<code class="px-1 py-0.5 rounded bg-slate-100 text-[#0f172a] text-xs font-semibold">${escapeHtml(expr)}</code>`;
    }
  });

  return res;
}

/** Format inline markdown: bold, italics, code, citations */
function formatInlineMarkdown(text: string): string {
  if (!text) return '';
  let str = text;

  // Clean bold text: pure dark black extra bold without heavy distracting background
  str = str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-[#0f172a]">$1</strong>');
  // Italics
  str = str.replace(/\*([^*]+)\*/g, '<em class="italic text-[#1e293b] font-medium">$1</em>');
  // Inline code
  str = str.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-[#0f172a] font-mono text-[11px] font-bold border border-slate-200">$1</code>');
  // Citations [p. 16] or [पेज १६]
  str = str.replace(/\[(p\.\s*[\d,\s\-]+|पेज\s*[\d०-९,\s\-]+|Page\s*[\d,\s\-]+)\]/gi, '<span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-950 font-bold text-[10px] border border-emerald-300 shadow-2xs">$1</span>');

  return str;
}

export const StructuredResponseRenderer: React.FC<StructuredResponseRendererProps> = ({
  content,
  showToClass = false,
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
      <div key={`table-${index}`} className="my-4 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table size={15} className="text-emerald-700" />
            <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">
              {isComparison ? 'Concept Comparison (तुलना / भिन्नता)' : 'Structured Table'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
            {rawHeader.length} Columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200">
                {rawHeader.map((h, i) => (
                  <th
                    key={i}
                    className="p-3 font-extrabold text-[#0f172a] border-r last:border-r-0 border-slate-200 tracking-tight"
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
                      className="p-3 text-[#0f172a] font-medium border-r last:border-r-0 border-slate-100 leading-relaxed align-top"
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
      className={`structured-response-body text-[#0f172a] leading-relaxed transition-all ${
        showToClass ? 'text-[14px] md:text-[15px]' : 'text-[12.5px] md:text-[13px]'
      }`}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'H1':
            return (
              <h1
                key={idx}
                className="text-base md:text-lg font-extrabold text-[#0f172a] mt-4 mb-2 pb-1.5 border-b border-slate-200 flex items-center gap-2"
              >
                <Sparkles size={17} className="text-emerald-700 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.title)) }} />
              </h1>
            );

          case 'H2':
            return (
              <h2
                key={idx}
                className="text-sm md:text-base font-extrabold text-[#0f172a] mt-4 mb-2 pb-1 border-b border-slate-100 flex items-center gap-2"
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

            return (
              <div
                key={idx}
                className={`mt-4 mb-2 flex items-center gap-2 font-bold text-xs md:text-sm ${
                  isNumericalStep
                    ? 'p-2.5 rounded-xl bg-emerald-50/80 text-emerald-950 border border-emerald-200 shadow-2xs'
                    : isAdvantage
                    ? 'p-2.5 rounded-xl bg-emerald-50/80 text-emerald-950 border border-emerald-200 shadow-2xs'
                    : isDisadvantage
                    ? 'p-2.5 rounded-xl bg-rose-50/80 text-rose-950 border border-rose-200 shadow-2xs'
                    : 'text-[#0f172a] uppercase tracking-wide border-b border-slate-200 pb-1 pt-1.5'
                }`}
              >
                {isNumericalStep ? (
                  <Calculator size={15} className="text-emerald-700" />
                ) : isAdvantage ? (
                  <CheckCircle2 size={15} className="text-emerald-700" />
                ) : isDisadvantage ? (
                  <XCircle size={15} className="text-rose-700" />
                ) : isClassroomEx ? (
                  <Lightbulb size={15} className="text-amber-600" />
                ) : isKeyChar ? (
                  <Sparkles size={15} className="text-blue-600" />
                ) : (
                  <BookOpen size={15} className="text-emerald-700" />
                )}
                <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.title)) }} />
              </div>
            );
          }

          case 'CALLOUT':
            return (
              <div
                key={idx}
                className="my-3 p-3.5 rounded-xl bg-emerald-50/60 border-l-4 border-emerald-600 text-[#0f172a] shadow-2xs flex items-start gap-3 border border-emerald-200/70"
              >
                <Lightbulb size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                <div
                  className="font-medium text-xs md:text-sm leading-relaxed text-[#0f172a]"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'BULLET':
            return (
              <div key={idx} className="flex items-start gap-2.5 my-1.5 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-2 flex-shrink-0" />
                <div
                  className="leading-relaxed text-[#0f172a] font-normal text-xs md:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'NUMBERED_STEP':
            return (
              <div
                key={idx}
                className="flex items-start gap-3 my-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  {block.number}
                </div>
                <div
                  className="leading-relaxed text-[#0f172a] font-medium flex-1 text-xs md:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'TABLE':
            return renderTableBlock(block.lines, idx);

          case 'DIVIDER':
            return <hr key={idx} className="my-4 border-slate-200" />;

          case 'PARAGRAPH':
          default:
            return (
              <div
                key={idx}
                className="my-2 leading-relaxed text-[#0f172a] font-normal text-xs md:text-sm"
                dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
              />
            );
        }
      })}
    </div>
  );
};
