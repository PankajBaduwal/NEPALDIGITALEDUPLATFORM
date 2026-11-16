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
      return `<div class="katex-display-box my-3.5 p-3 rounded-xl bg-white border border-[#DCE5DE] shadow-xs text-center font-mono overflow-x-auto text-[#187C68]">${rendered}</div>`;
    } catch {
      return `<pre class="p-2.5 rounded-lg bg-[#EAF0EB] text-[#26332E] text-xs font-mono">${escapeHtml(expr)}</pre>`;
    }
  });

  // 2. Inline Math $ ... $
  res = res.replace(/\$([^\$\n]+?)\$/g, (_match, expr) => {
    try {
      const rendered = katex.renderToString(expr.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      return `<span class="katex-inline-box px-1.5 py-0.5 rounded bg-[#EAF0EB]/70 text-[#187C68] font-mono font-medium">${rendered}</span>`;
    } catch {
      return `<code class="px-1 py-0.5 rounded bg-[#EAF0EB] text-[#26332E] text-xs">${escapeHtml(expr)}</code>`;
    }
  });

  return res;
}

/** Format inline markdown: bold, italics, code, links */
function formatInlineMarkdown(text: string): string {
  if (!text) return '';
  let str = text;

  // Bold
  str = str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#26332E] bg-[#E5F2EB]/60 px-1 py-0.5 rounded">$1</strong>');
  // Italics
  str = str.replace(/\*([^*]+)\*/g, '<em class="italic text-[#68766F]">$1</em>');
  // Inline code
  str = str.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[#EAF0EB] text-[#187C68] font-mono text-[11px] font-semibold border border-[#DCE5DE]/60">$1</code>');
  // Citations [p. 16] or [पेज १६]
  str = str.replace(/\[(p\.\s*\d+|पेज\s*[\d०-९]+|Page\s*\d+)\]/gi, '<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#E5F2EB] text-[#187C68] font-bold text-[10px] border border-[#187C68]/20 tracking-tight">$1</span>');

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
      <div key={`table-${index}`} className="my-4 rounded-xl border border-[#DCE5DE] bg-white overflow-hidden shadow-xs">
        <div className="bg-[#EAF0EB]/90 px-4 py-2.5 border-b border-[#DCE5DE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table size={15} className="text-[#187C68]" />
            <span className="text-xs font-bold text-[#26332E] tracking-wide">
              {isComparison ? 'Concept Comparison (तुलना / भिन्नता)' : 'Structured Data Table'}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-[#68766F] bg-white px-2 py-0.5 rounded-full border border-[#DCE5DE]">
            {rawHeader.length} Columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F6F3] border-b border-[#DCE5DE]">
                {rawHeader.map((h, i) => (
                  <th
                    key={i}
                    className="p-3 font-bold text-[#187C68] border-r last:border-r-0 border-[#DCE5DE] tracking-tight bg-[#EAF0EB]/40"
                  >
                    <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(h)) }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DE]/70">
              {dataRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`transition-colors hover:bg-[#E5F2EB]/30 ${
                    rIdx % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFA]'
                  }`}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="p-3 text-[#26332E] border-r last:border-r-0 border-[#DCE5DE]/70 leading-relaxed align-top"
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

  // Group blocks into coherent sections (e.g. detect Numerical steps, Advantages/Disadvantages)
  return (
    <div
      className={`structured-response-body text-[#26332E] leading-relaxed transition-all ${
        showToClass ? 'text-[14px] md:text-[15px]' : 'text-[12.5px] md:text-[13px]'
      }`}
    >
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'H1':
            return (
              <h1
                key={idx}
                className="text-base md:text-lg font-black text-[#187C68] mt-6 mb-3 pb-2 border-b-2 border-[#187C68]/20 flex items-center gap-2"
              >
                <Sparkles size={18} className="text-[#187C68] flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.title)) }} />
              </h1>
            );

          case 'H2':
            return (
              <h2
                key={idx}
                className="text-sm md:text-base font-extrabold text-[#26332E] mt-5 mb-2.5 pb-1.5 border-b border-[#DCE5DE] flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#187C68] flex-shrink-0"></span>
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
                className={`mt-4 mb-2 p-2 rounded-lg flex items-center gap-2 font-bold tracking-tight text-xs uppercase ${
                  isNumericalStep
                    ? 'bg-[#E5F2EB] text-[#187C68] border border-[#187C68]/30'
                    : isAdvantage
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isDisadvantage
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-[#EAF0EB]/80 text-[#187C68] border border-[#DCE5DE]'
                }`}
              >
                {isNumericalStep ? (
                  <Calculator size={14} className="text-[#187C68]" />
                ) : isAdvantage ? (
                  <CheckCircle2 size={14} className="text-emerald-600" />
                ) : isDisadvantage ? (
                  <XCircle size={14} className="text-rose-600" />
                ) : (
                  <BookOpen size={13} className="text-[#187C68]" />
                )}
                <span dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.title)) }} />
              </div>
            );
          }

          case 'CALLOUT':
            return (
              <div
                key={idx}
                className="my-3.5 p-3.5 rounded-xl bg-[#E5F2EB]/70 border-l-4 border-[#187C68] text-[#26332E] shadow-xs flex items-start gap-2.5"
              >
                <Lightbulb size={18} className="text-[#187C68] flex-shrink-0 mt-0.5" />
                <div
                  className="font-medium text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'BULLET':
            return (
              <div key={idx} className="flex items-start gap-2.5 my-1.5 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#187C68] mt-2 flex-shrink-0" />
                <div
                  className="leading-relaxed text-[#26332E]"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'NUMBERED_STEP':
            return (
              <div
                key={idx}
                className="flex items-start gap-3 my-2.5 p-2.5 rounded-xl bg-white border border-[#DCE5DE] shadow-xs hover:border-[#187C68]/40 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#187C68] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  {block.number}
                </div>
                <div
                  className="leading-relaxed text-[#26332E] flex-1"
                  dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
                />
              </div>
            );

          case 'TABLE':
            return renderTableBlock(block.lines, idx);

          case 'DIVIDER':
            return <hr key={idx} className="my-5 border-[#DCE5DE]" />;

          case 'PARAGRAPH':
          default:
            return (
              <div
                key={idx}
                className="my-2 leading-relaxed text-[#26332E]"
                dangerouslySetInnerHTML={{ __html: renderMath(formatInlineMarkdown(block.content)) }}
              />
            );
        }
      })}
    </div>
  );
};
