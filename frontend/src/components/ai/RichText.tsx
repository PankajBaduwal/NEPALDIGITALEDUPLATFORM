import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderMath(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: false, trust: false, strict: 'ignore' });
  } catch {
    return `<code>${esc(tex)}</code>`;
  }
}

/** Minimal, safe Markdown (+ KaTeX maths) renderer for AI answers. Input is escaped before any HTML is produced. */
export function renderRich(src: string): string {
  const maths: string[] = [];
  let text = src.replace(/\r/g, '');
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_m, t) => {
    maths.push(renderMath(t.trim(), true));
    return `\u0000${maths.length - 1}\u0000`;
  });
  text = text.replace(/(?<![\\$])\$([^$\n]{1,200}?)\$(?!\d)/g, (_m, t) => {
    maths.push(renderMath(t.trim(), false));
    return `\u0000${maths.length - 1}\u0000`;
  });

  const inline = (s: string) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<![*\w])\*([^*\n]+)\*(?!\w)/g, '<em>$1</em>');

  const lines = text.split('\n');
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let table: string[][] | null = null;
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  const closeTable = () => {
    if (!table) return;
    const [head, ...rows] = table;
    out.push(
      `<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    );
    table = null;
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*\|.*\|\s*$/.test(line)) {
      closeList();
      if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) continue; // separator row
      (table ||= []).push(line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      continue;
    }
    closeTable();
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      closeList();
      const lvl = Math.min(4, m[1].length + 1);
      out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`);
    } else if ((m = line.match(/^\s*[-*•]\s+(.*)$/))) {
      if (list !== 'ul') {
        closeList();
        out.push('<ul>');
        list = 'ul';
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
      if (list !== 'ol') {
        closeList();
        out.push('<ol>');
        list = 'ol';
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if (!line.trim()) {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  closeTable();
  return out.join('').replace(/\u0000(\d+)\u0000/g, (_m, i) => maths[parseInt(i, 10)] || '');
}

export const RichText: React.FC<{ text: string }> = ({ text }) => {
  const html = useMemo(() => renderRich(text || ''), [text]);
  return <div className="ai-rich" dangerouslySetInnerHTML={{ __html: html }} />;
};
