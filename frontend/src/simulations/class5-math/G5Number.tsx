/**
 * Class 5 lesson 3 · Number sense (towers up to crores; also Class 6 whole numbers) and lesson 4 · Simplification (BODMAS).
 */
import { rnd, toNp } from '../class1-math-kit/nepali';
import { makeLab, LabCfg } from './Lab';
import { bi, choice, numChoice, indian, croreWords, Params } from './h5';
import { tag, box, towers, PL9 } from './vis';

/* ───────────── Place-value towers ───────────── */
const PL = [
  { np: 'अर्ब', en: 'Arab (100 crore)' }, { np: 'दशकरोड', en: 'Ten crore' }, { np: 'करोड', en: 'Crore' }, { np: 'दशलाख', en: 'Ten lakh' }, { np: 'लाख', en: 'Lakh' },
  { np: 'दशहजार', en: 'Ten thousand' }, { np: 'हजार', en: 'Thousand' }, { np: 'सय', en: 'Hundred' }, { np: 'दशक', en: 'Ten' }, { np: 'एकाइ', en: 'One' },
];
const dig = (p: Params, n: number) => Array.from({ length: n }, (_, i) => p[`d${i}`]);
const val = (p: Params, n: number) => Number(dig(p, n).join(''));
const setNum = (v: number, n: number): Params => { const s = String(v).padStart(n, '0'); const r: Params = {}; for (let i = 0; i < n; i++) r[`d${i}`] = Number(s[i]); return r; };

export const towerCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string; n: 9 | 10 }): LabCfg => {
  const n = o.n; const names = PL.slice(10 - n);
  return {
    code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#14b8a6',
    params: names.map((nm, i) => ({ id: `d${i}`, np: nm.np, en: nm.en.replace(' (100 crore)', ''), min: 0, max: 9, init: [3, 4, 0, 5, 6, 0, 7, 8, 9, 1][i + 10 - n] ?? 0, color: PL9[i % 9] })),
    stage: { camera: [0, 5.2, n === 9 ? 12.5 : 14], target: [0, 2.6, 0], minDistance: 7, maxDistance: 28 },
    draw: (g, p, lang) => {
      const d = dig(p, n); towers(g, d, PL9, names.map((x) => (lang === 'ne' ? x.np : x.en.replace(' (100 crore)', ''))), 0.44);
      tag(g, indian(val(p, n)), 0, -1.7, 3, 6.5, { px: 58, w: 560, h: 96, bg: '#ffffff', border: '#14b8a6' });
    },
    info: (p) => { const v = val(p, n); return bi(`${indian(v)}\n${croreWords(v)}`, `${indian(v)}\n${croreWords(v)}`); },
    tip: bi('स्तम्भ बढाइघटाइ गरी सङ्ख्या बनाऔँ र पढौँ', 'Add and remove cubes to build a number and read it'),
    goal: () => { const k = 3; const d: number[] = Array(n).fill(0); for (let j = 0; j < k; j++) d[rnd(0, n - 1)] = rnd(1, 9); const v = Number(d.join('')) || 1; return { p: setNum(v, n), np: `${indian(v)} बनाऔँ`, en: `Build ${indian(v)}`, start: setNum(0, n) }; },
    quiz: (i) => {
      const v = rnd(Math.pow(10, n - 2), Math.pow(10, n) - 1); const s = String(v).padStart(n, '0'); const pos = rnd(0, n - 1); const dgt = Number(s[pos]) || 5;
      const t = s.slice(0, pos) + dgt + s.slice(pos + 1); const num = Number(t); const set = setNum(num, n); const place = names[pos]; const digitPlace = PL.slice(10 - n);
      void digitPlace;
      if (i === 0) return choice(`${indian(num)} मा ${dgt} कुन स्थानमा छ?`, `In ${indian(num)}, which place is the digit ${dgt} in?`, `${place.np} | ${place.en.replace(' (100 crore)', '')}`, names.filter((x) => x !== place).map((x) => `${x.np} | ${x.en.replace(' (100 crore)', '')}`), i, set);
      if (i === 1) return numChoice(`${indian(num)} मा ${dgt} को स्थानीय मान कति हो?`, `What is the place value of ${dgt} in ${indian(num)}?`, dgt * Math.pow(10, n - 1 - pos), i, [dgt * 10, dgt * 100, -dgt, dgt * 1000, dgt], 0, '', set);
      if (i === 2) return numChoice(`${indian(num)} मा ${dgt} को अङ्कमान (face value) कति हो?`, `What is the face value of ${dgt} in ${indian(num)}?`, dgt, i, [1, -1, 10, dgt * 10, 2], 0, '', set);
      if (i === 3) { const a = rnd(1, 99); return choice(`${a} करोड ५ लाख कुन रूपमा लेखिन्छ?`, `Write ${a} crore 5 lakh in figures`, indian(a * 10000000 + 500000), [indian(a * 10000000 + 50000), indian(a * 1000000 + 500000), indian(a * 100000 + 500000)], i); }
      if (i === 4) { const a = rnd(10, 99) * 100000 + rnd(1, 9) * 1000; return numChoice(`${indian(a)} मा कति लाख छन्?`, `How many lakhs are there in ${indian(a)}?`, Math.floor(a / 100000), i, [1, -1, 10, 100, -10], 1); }
      if (i === 5) { const a = rnd(10000000, 99999990); const b = a + rnd(1, 9) * 100000; return choice('कुन सङ्ख्या ठूलो छ?', 'Which number is greater?', indian(b), [indian(a)], i); }
      if (i === 6) { const a = rnd(10000, 99999) * 1000 + 999; return choice(`${indian(a)} को अर्को सङ्ख्या कुन हो?`, `What is the number just after ${indian(a)}?`, indian(a + 1), [indian(a - 1), indian(a + 10), indian(a + 100)], i); }
      const a = rnd(2, 98); return numChoice(`${indian(a * 10000000)} मा कति करोड छन्?`, `How many crores are there in ${indian(a * 10000000)}?`, a, i, [1, -1, 10, 100, -10], 1);
    },
  };
};
export const CroreTowers5 = makeLab(towerCfg({ code: 'SIM-MATH-G5-L3-01', chapter: 3, titleNp: 'करोड टावर', titleEn: 'Crore Towers', n: 9 }));

/* ───────────── BODMAS ───────────── */
export type Tok = number | string;
const isNum = (t: Tok): t is number => typeof t === 'number';
const apply = (a: number, op: string, b: number) => (op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b);
export const stepOnce = (t: Tok[]): { tokens: Tok[]; hl: [number, number] } | null => {
  if (t.length === 1) return null;
  const close = t.indexOf(')');
  if (close >= 0) {
    const open = t.lastIndexOf('(', close);
    const inner = t.slice(open + 1, close);
    if (inner.length === 1) return { tokens: [...t.slice(0, open), inner[0], ...t.slice(close + 1)], hl: [open, close] };
    const r = stepOnce(inner)!; const off = open + 1;
    return { tokens: [...t.slice(0, off), ...r.tokens, ...t.slice(close)], hl: [r.hl[0] + off, r.hl[1] + off] };
  }
  let i = t.findIndex((x) => x === '×' || x === '÷'); if (i < 0) i = t.findIndex((x) => x === '+' || x === '−');
  const v = apply(t[i - 1] as number, t[i] as string, t[i + 1] as number);
  return { tokens: [...t.slice(0, i - 1), v, ...t.slice(i + 2)], hl: [i - 1, i + 1] };
};
export const stepsOf = (t: Tok[]) => { const rows: { tokens: Tok[]; hl: [number, number] | null }[] = []; let cur: Tok[] = t; for (;;) { const r = stepOnce(cur); rows.push({ tokens: cur, hl: r ? r.hl : null }); if (!r) break; cur = r.tokens; } return rows; };
const EXPR: Tok[][] = [
  [10, '×', 7, '−', 37], [55, '÷', 11, '+', 2, '×', 5], [35, '−', 15, '+', 18], [20, '+', 15, '−', 13],
  [12, '+', '(', 8, '−', 5, ')', '×', 3], ['(', 12, '+', 8, ')', '÷', 4, '×', 3], [6, '×', '(', 5, '+', 4, ')', '−', 10], [100, '−', '(', 20, '+', 30, ')', '÷', 5],
];
const show = (t: Tok[]) => t.join(' ');
export const bodmasCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string; hard?: boolean }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#f59e0b',
  params: [
    { id: 'e', np: 'प्रश्न', en: 'Problem', min: 1, max: EXPR.length, init: 1 },
    { id: 's', np: 'चरण', en: 'Step', min: 0, max: 6, init: 0 },
  ],
  stage: { camera: [0, 4.5, 12], target: [0, 3.4, 0], minDistance: 6, maxDistance: 22 },
  fix: (p) => ({ ...p, s: Math.min(p.s, stepsOf(EXPR[p.e - 1]).length - 1) }),
  draw: (g, p) => {
    const rows = stepsOf(EXPR[p.e - 1]); rows.slice(0, p.s + 1).forEach((r, k) => {
      const y = 7 - k * 1.5; const cur = k === p.s; const w = 1.3;
      r.tokens.forEach((t, j) => {
        const x = (j - (r.tokens.length - 1) / 2) * w; const hl = cur && r.hl && j >= r.hl[0] && j <= r.hl[1];
        tag(g, String(t), x, y, 0, cur ? 1.25 : 0.95, { px: 54, w: 128, h: 96, bg: hl ? '#fde68a' : isNum(t) ? '#e0f2fe' : null, border: hl ? '#f59e0b' : cur && isNum(t) ? '#0ea5e9' : undefined, color: cur ? '#0f172a' : '#94a3b8' });
      });
    });
    box(g, 16, 0.1, 3, 0, 0.05, 0, '#fef3c7');
  },
  info: (p) => { const rows = stepsOf(EXPR[p.e - 1]); const fin = rows[rows.length - 1].tokens[0]; return bi(`${show(EXPR[p.e - 1])} = ${fin}\nक्रम: कोष्ठक → भाग → गुणन → जोड → घटाउ`, `${show(EXPR[p.e - 1])} = ${fin}\nOrder: Brackets → Division → Multiplication → Addition → Subtraction`); },
  tip: bi('चरण बढाउँदै BODMAS अनुसार एक एक क्रिया गरौँ', 'Press + on Step to do one operation at a time in BODMAS order'),
  goal: () => { const e = rnd(1, EXPR.length); const last = stepsOf(EXPR[e - 1]).length - 1; return { p: { e, s: last }, np: `${show(EXPR[e - 1])} लाई एउटै सङ्ख्या नबन्दासम्म चरणबद्ध हल गरौँ`, en: `Simplify ${show(EXPR[e - 1])} step by step until one number is left`, start: { e, s: 0 } }; },
  quiz: (i) => {
    const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9), d = rnd(2, 9) * c;
    const forms: { t: Tok[] }[] = [
      { t: [a * b, '+', c, '×', d] }, { t: ['(', a, '+', b, ')', '×', c] }, { t: [d, '÷', c, '+', a, '×', b] }, { t: [50 + a, '−', '(', b, '+', c, ')', '×', 2] },
      { t: [a, '×', b, '−', c, '+', d] }, { t: [d, '−', 6, '÷', 3, '+', b] }, { t: ['(', d, '−', c, ')', '÷', c, '+', a] }, { t: [a + 10, '−', b, '×', 2, '+', c] },
    ];
    const t = forms[i].t; const rows = stepsOf(t); const ans = rows[rows.length - 1].tokens[0] as number;
    return numChoice(`${toNp(show(t))} को मान कति हो?`, `What is the value of ${show(t)}?`, ans, i, [1, -1, 2, 10, -10, 5], 0);
  },
});
export const BodmasLab5 = makeLab(bodmasCfg({ code: 'SIM-MATH-G5-L4-01', chapter: 4, titleNp: 'सरलीकरण प्रयोगशाला', titleEn: 'Simplification Lab' }));
