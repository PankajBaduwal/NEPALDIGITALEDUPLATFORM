import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  Table,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calculator,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  Lightbulb,
  FileCheck,
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

/** Render KaTeX expressions safely */
function renderMath(text: string): string {
  if (!text) return '';

  // 1. Display Math $$ ... $$
  let res = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, expr) => {
    try {
      const rendered = katex.renderToString(expr.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="katex-display-box my-3.5 p-3.5 rounded-xl bg-white border-2 border-black shadow-xs text-center font-mono overflow-x-auto text-black font-black text-sm">${rendered}</div>`;
    } catch {
      return `<pre class="p-2.5 rounded-lg bg-slate-100 text-black text-xs font-mono font-bold border border-black/30">${escapeHtml(expr)}</pre>`;
    }
  });

  // 2. Inline Math $ ... $
  res = res.replace(/\$([^\$\n]+?)\$/g, (_match, expr) => {
    try {
      const rendered = katex.renderToString(expr.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      return `<span class="katex-inline-box px-1.5 py-0.5 rounded bg-slate-100 text-black font-mono font-black border border-black/20">${rendered}</span>`;
    } catch {
      return `<code class="px-1 py-0.5 rounded bg-slate-100 text-black text-xs font-bold">${escapeHtml(expr)}</code>`;
    }
  });

  return res;
}

/** Format inline markdown: bold, italics, code, citations */
function formatInlineMarkdown(text: string): string {
  if (!text) return '';
  let str = text;

  // Bold text: pure black extra bold
  str = str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-black bg-yellow-100/80 px-1 py-0.5 rounded border-b border-black/20">$1</strong>');
  // Italics: pure black font-bold
  str = str.replace(/\*([^*]+)\*/g, '<em class="italic text-black font-bold">$1</em>');
  // Inline code
  str = str.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-black font-mono text-[11px] font-black border border-black/40">$1</code>');
  // Citations [p. 16] or [पेज १६]
  str = str.replace(/\[(p\.\s*\d+|पेज\s*[\d०-९]+|Page\s*\d+)\]/gi, '<span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-200 text-black font-black text-[11px] border border-black tracking-tight">$1</span>');

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
      <div key={`table-${index}`} className="my-5 rounded-2xl border-2 border-black bg-white overflow-hidden shadow-sm">
        <div className="bg-slate-100 px-4 py-3 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table size={16} className="text-black" />
            <span className="text-xs font-black text-black tracking-wide uppercase">
              {isComparison ? 'Concept Comparison (तुलना / भिन्नता)' : 'Structured Data Table'}
            </span>
          </div>
          <span className="text-[11px] font-black text-black bg-white px-2.5 py-0.5 rounded-full border border-black shadow-xs">
            {rawHeader.length} Columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-200 border-b-2 border-black">
                {rawHeader.map((h, i) => (
                  <th
                    key={i}
                    className="p-3 font-black text-black border-r-2 last:border-r-0 border-black tracking-tight"
                  >
                    <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(h)) }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y border-black">
              {dataRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`transition-colors ${
                    rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="p-3 text-black font-bold border-r last:border-r-0 border-slate-300 leading-relaxed align-top"
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
      className={`structured-response-body text-black font-bold leading-relaxed transition-all ${
        showToClass ? 'text-[15px] md:text-[16px]' : 'text-[13px] md:text-[14px]'
      }`}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'H1':
            return (
              <h1
                key={idx}
                className="text-lg md:text-xl font-black text-black mt-6 mb-3 pb-2 border-b-2 border-black flex items-center gap-2"
              >
                <Sparkles size={20} className="text-black flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.title)) }} />
              </h1>
            );

          case 'H2':
            return (
              <h2
                key={idx}
                className="text-base md:text-lg font-black text-black mt-5 mb-2.5 pb-1.5 border-b-2 border-black/40 flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0"></span>
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

            return (
              <div
                key={idx}
                className={`mt-4 mb-2 p-2.5 rounded-xl flex items-center gap-2 font-black tracking-tight text-xs uppercase border-2 ${
                  isNumericalStep
                    ? 'bg-emerald-50 text-black border-emerald-700'
                    : isAdvantage
                    ? 'bg-emerald-100 text-black border-emerald-800'
                    : isDisadvantage
                    ? 'bg-rose-100 text-black border-rose-800'
                    : 'bg-slate-100 text-black border-black'
                }`}
              >
                {isNumericalStep ? (
                  <Calculator size={15} className="text-black" />
                ) : isAdvantage ? (
                  <CheckCircle2 size={15} className="text-emerald-900" />
                ) : isDisadvantage ? (
                  <XCircle size={15} className="text-rose-900" />
                ) : (
                  <BookOpen size={15} className="text-black" />
                )}
                <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.title)) }} />
              </div>
            );
          }

          case 'CALLOUT':
            return (
              <div
                key={idx}
                className="my-4 p-4 rounded-2xl bg-amber-50/80 border-l-4 border-black text-black shadow-xs flex items-start gap-3 border border-amber-200"
              >
                <Lightbulb size={20} className="text-black flex-shrink-0 mt-0.5" />
                <div
                  className="font-bold text-xs md:text-sm leading-relaxed text-black"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'BULLET':
            return (
              <div key={idx} className="flex items-start gap-2.5 my-2 ml-1">
                <span className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0" />
                <div
                  className="leading-relaxed text-black font-bold"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'NUMBERED_STEP':
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 my-3 p-3 rounded-2xl bg-white border-2 border-black shadow-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  {block.number}
                </div>
                <div
                  className="leading-relaxed text-black font-bold flex-1"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'TABLE':
            return renderTableBlock(block.lines, idx);

          case 'DIVIDER':
            return <hr key={idx} className="my-5 border-black/40" />;

          case 'PARAGRAPH':
          default:
            return (
              <div
                key={idx}
                className="my-2.5 leading-relaxed text-black font-bold"
                dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
              />
            );
        }
      })}
    </div>
  );
};
