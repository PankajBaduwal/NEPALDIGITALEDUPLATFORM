/**
 * Class 5 lessons 5, 6, 7 · Fraction, Decimal, Percentage — configs are also reused by Class 6 lessons 4, 5, 6.
 */
import { rnd } from '../class1-math-kit/nepali';
import { makeLab, LabCfg } from './Lab';
import { bi, choice, numChoice, gcd, lcm, fracS, simp, Params } from './h5';
import { box, tag } from './vis';

const COL = ['#ef4444', '#0ea5e9', '#22c55e'];
/** a bar cut into `d` slices with the first `n` coloured */
const bar = (g: any, n: number, d: number, z: number, color: string, w = 12, x0 = -6) => {
  const cap = Math.min(d, 72); const sw = w / cap;
  for (let i = 0; i < cap; i++) box(g, sw * 0.94, 0.7, 1.5, x0 + sw * (i + 0.5), 0.4, z, i < Math.round((n / d) * cap) ? color : '#e2e8f0', 0.5);
};

/* ───────────── add / subtract fractions ───────────── */
export const fractionCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string; six?: boolean }): LabCfg => {
  const dmax = o.six ? 12 : 10;
  return {
    code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#ef4444',
    params: [
      { id: 'n1', np: 'अंश १', en: 'Top 1', min: 1, max: dmax, init: 1, color: COL[0] }, { id: 'd1', np: 'हर १', en: 'Bottom 1', min: 2, max: dmax, init: 2, color: COL[0] },
      { id: 'n2', np: 'अंश २', en: 'Top 2', min: 1, max: dmax, init: 1, color: COL[1] }, { id: 'd2', np: 'हर २', en: 'Bottom 2', min: 2, max: dmax, init: 4, color: COL[1] },
      { id: 'op', np: 'क्रिया', en: 'Operation', min: 0, max: 1, init: 0, names: [{ np: 'जोड +', en: 'Add +' }, { np: 'घटाउ −', en: 'Subtract −' }] },
    ],
    stage: { camera: [0, 11, 12], target: [0, 0, 0], minDistance: 7, maxDistance: 26 },
    fix: (p) => { let { n1, d1, n2, d2 } = p; n1 = Math.min(n1, d1); n2 = Math.min(n2, d2); if (p.op === 1 && n1 * d2 < n2 * d1) { [n1, d1, n2, d2] = [n2, d2, n1, d1]; } return { ...p, n1, d1, n2, d2 }; },
    draw: (g, p, lang) => {
      const L = lcm(p.d1, p.d2); const a = (p.n1 * L) / p.d1, b = (p.n2 * L) / p.d2; const r = p.op === 0 ? a + b : a - b;
      bar(g, p.n1, p.d1, -4, COL[0]); bar(g, p.n2, p.d2, -0.5, COL[1]);
      const w = 12, sw = w / Math.min(L, 72);
      for (let i = 0; i < Math.min(L, 72); i++) box(g, sw * 0.94, 0.7, 1.5, -6 + sw * (i + 0.5), 0.4, 3, i < Math.round((r / L) * Math.min(L, 72)) ? COL[2] : '#e2e8f0', 0.5);
      tag(g, `${p.n1}/${p.d1}`, -8, 0.6, -4, 2, { px: 56, color: COL[0] }); tag(g, `${p.n2}/${p.d2}`, -8, 0.6, -0.5, 2, { px: 56, color: COL[1] });
      tag(g, `${fracS(r, L)}`, -8, 0.6, 3, 2, { px: 56, color: COL[2] }); tag(g, lang === 'ne' ? `समान हर ${L}` : `Common denominator ${L}`, 0, 0.5, 5.2, 4, { px: 44, w: 420, h: 80 });
    },
    info: (p) => {
      const L = lcm(p.d1, p.d2); const a = (p.n1 * L) / p.d1, b = (p.n2 * L) / p.d2; const r = p.op === 0 ? a + b : a - b; const s = p.op === 0 ? '+' : '−';
      const mixed = r > L ? ` = ${Math.floor(r / L)} ${fracS(r % L, L)}` : '';
      return bi(`${p.n1}/${p.d1} ${s} ${p.n2}/${p.d2} = ${a}/${L} ${s} ${b}/${L} = ${r}/${L} = ${fracS(r, L)}${mixed}\nसमान हर = ${L} (ल.स.)`, `${p.n1}/${p.d1} ${s} ${p.n2}/${p.d2} = ${a}/${L} ${s} ${b}/${L} = ${r}/${L} = ${fracS(r, L)}${mixed}\nCommon denominator = ${L} (LCM)`);
    },
    tip: bi('हर फरक भए समान हर बनाएर जोडघटाउ गरौँ', 'When the bottoms differ, make a common denominator, then add or subtract'),
    goal: () => { const k = [[1, 2, 1, 4], [1, 3, 1, 6], [2, 3, 1, 6], [3, 4, 1, 8], [1, 2, 1, 3], [2, 5, 1, 10]][rnd(0, 5)]; return { p: { n1: k[0], d1: k[1], n2: k[2], d2: k[3], op: 0 }, np: `${k[0]}/${k[1]} + ${k[2]}/${k[3]} बनाऔँ`, en: `Set up ${k[0]}/${k[1]} + ${k[2]}/${k[3]}`, start: { n1: 1, d1: 2, n2: 1, d2: 4, op: 1 } }; },
    quiz: (i) => {
      const pairs = o.six ? [[1, 2, 1, 3], [2, 3, 1, 4], [3, 4, 2, 5], [5, 6, 1, 4], [2, 3, 3, 4], [1, 6, 3, 8], [4, 5, 1, 2], [7, 8, 1, 6]] : [[1, 4, 2, 4], [1, 2, 1, 4], [2, 3, 1, 6], [3, 5, 1, 10], [1, 2, 1, 3], [3, 4, 1, 8], [4, 5, 1, 10], [5, 6, 1, 3]];
      const [n1, d1, n2, d2] = pairs[i]; const L = lcm(d1, d2); const sub = i % 2 === 1; const a = (n1 * L) / d1, b = (n2 * L) / d2; const r = sub ? Math.abs(a - b) : a + b; const hi = sub ? (a >= b ? [n1, d1, n2, d2] : [n2, d2, n1, d1]) : [n1, d1, n2, d2];
      const ans = fracS(r, L); const wr = [fracS(r + 1, L), fracS(Math.max(1, r - 1), L), `${n1 + n2}/${d1 + d2}`, fracS(r + L, L * 2)];
      return choice(`${hi[0]}/${hi[1]} ${sub ? '−' : '+'} ${hi[2]}/${hi[3]} = ?`, `${hi[0]}/${hi[1]} ${sub ? '−' : '+'} ${hi[2]}/${hi[3]} = ?`, ans, wr, i, { n1: hi[0], d1: hi[1], n2: hi[2], d2: hi[3], op: sub ? 1 : 0 });
    },
  };
};
export const FractionLab5 = makeLab(fractionCfg({ code: 'SIM-MATH-G5-L5-01', chapter: 5, titleNp: 'भिन्न जोडघटाउ', titleEn: 'Fraction Bars' }));

/* ───────────── mixed numbers and improper fractions ───────────── */
export const mixedCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#8b5cf6',
  params: [{ id: 'w', np: 'पूर्ण', en: 'Whole', min: 0, max: 5, init: 2 }, { id: 'n', np: 'अंश', en: 'Top', min: 1, max: 8, init: 1 }, { id: 'd', np: 'हर', en: 'Bottom', min: 2, max: 9, init: 3 }],
  stage: { camera: [0, 10, 11], target: [0, 0, 0], minDistance: 7, maxDistance: 24 },
  fix: (p) => ({ ...p, n: Math.min(p.n, p.d - 1) }),
  draw: (g, p, lang) => {
    for (let k = 0; k <= p.w; k++) { const z = -4 + k * 1.9; if (k < p.w) bar(g, p.d, p.d, z, '#8b5cf6', 10, -5); else bar(g, p.n, p.d, z, '#f97316', 10, -5); }
    const imp = p.w * p.d + p.n; tag(g, `${p.w} ${p.n}/${p.d} = ${imp}/${p.d}`, 0, 1.5, -5.5, 6, { px: 54, w: 560, h: 96, bg: '#fff', border: '#8b5cf6' });
    void lang;
  },
  info: (p) => { const imp = p.w * p.d + p.n; return bi(`${p.w} ${p.n}/${p.d} = (${p.w}×${p.d}+${p.n})/${p.d} = ${imp}/${p.d}\n${imp}/${p.d} = ${p.w} पूर्ण र ${p.n}/${p.d}`, `${p.w} ${p.n}/${p.d} = (${p.w}×${p.d}+${p.n})/${p.d} = ${imp}/${p.d}\n${imp}/${p.d} = ${p.w} whole and ${p.n}/${p.d}`); },
  tip: bi('पूर्ण पट्टी र अंशको पट्टी गनेर मिश्रित र अशुद्ध भिन्न मिलाऔँ', 'Count the whole bars and the part bar to match a mixed and an improper fraction'),
  goal: () => { const d = rnd(2, 9), n = rnd(1, d - 1), w = rnd(1, 5); return { p: { w, n, d }, np: `${w * d + n}/${d} लाई मिश्रित भिन्नमा बनाऔँ`, en: `Show ${w * d + n}/${d} as a mixed number`, start: { w: 0, n: 1, d } }; },
  quiz: (i) => {
    const d = rnd(2, 9), n = rnd(1, d - 1), w = rnd(1, 5); const imp = w * d + n;
    if (i % 2 === 0) return choice(`${w} ${n}/${d} लाई अशुद्ध भिन्नमा बदल्दा?`, `Change ${w} ${n}/${d} to an improper fraction`, `${imp}/${d}`, [`${imp + 1}/${d}`, `${imp - 1}/${d}`, `${w + n}/${d}`], i, { w, n, d });
    return choice(`${imp}/${d} लाई मिश्रित भिन्नमा बदल्दा?`, `Change ${imp}/${d} to a mixed number`, `${w} ${n}/${d}`, [`${w + 1} ${n}/${d}`, `${w} ${Math.max(1, n - 1)}/${d}`, `${n} ${w}/${d}`], i, { w, n, d });
  },
});
export const MixedLab5 = makeLab(mixedCfg({ code: 'SIM-MATH-G5-L5-02', chapter: 5, titleNp: 'मिश्रित भिन्न', titleEn: 'Mixed Fractions' }));

/* ───────────── decimals ───────────── */
const decBlocks = (g: any, v: number, z: number, color: string) => {
  const ones = Math.floor(v / 100), tenths = Math.floor((v % 100) / 10), hund = v % 10;
  for (let i = 0; i < ones; i++) box(g, 0.9, 0.9, 0.9, -8 + i * 1.05, 0.5, z, color, 0.4);
  for (let i = 0; i < tenths; i++) box(g, 0.28, 0.9, 0.28, 2.6 + i * 0.5, 0.5, z, '#f59e0b', 0.4);
  for (let i = 0; i < hund; i++) box(g, 0.28, 0.28, 0.28, 8 + i * 0.5, 0.2, z, '#ec4899', 0.4);
};
const dec = (v: number) => (v / 100).toFixed(2);
export const decimalCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#f59e0b',
  params: [
    { id: 'a', np: 'पहिलो', en: 'First', min: 0, max: 999, step: 5, init: 145, show: dec, color: '#0ea5e9' },
    { id: 'b', np: 'दोस्रो', en: 'Second', min: 0, max: 999, step: 5, init: 230, show: dec, color: '#22c55e' },
    { id: 'op', np: 'क्रिया', en: 'Operation', min: 0, max: 1, init: 0, names: [{ np: 'जोड +', en: 'Add +' }, { np: 'घटाउ −', en: 'Subtract −' }] },
  ],
  stage: { camera: [0, 12, 14], target: [0, 0, 0], minDistance: 8, maxDistance: 28 },
  fix: (p) => (p.op === 1 && p.a < p.b ? { ...p, a: p.b, b: p.a } : p),
  draw: (g, p, lang) => {
    const r = p.op === 0 ? p.a + p.b : p.a - p.b;
    decBlocks(g, p.a, -4, '#0ea5e9'); decBlocks(g, p.b, 0, '#22c55e'); decBlocks(g, Math.min(r, 1999), 4, '#8b5cf6');
    [['एकाइ', 'Ones', -4.5], ['दशांश', 'Tenths', 4.2], ['सयांश', 'Hundredths', 9.6]].forEach(([np, en, x]) => tag(g, lang === 'ne' ? String(np) : String(en), Number(x), 0.2, 6.2, 2.2, { px: 44, w: 320, h: 80 }));
    tag(g, dec(p.a), -10, 0.8, -4, 2, { px: 52, color: '#0369a1' }); tag(g, dec(p.b), -10, 0.8, 0, 2, { px: 52, color: '#15803d' }); tag(g, dec(r), -10, 0.8, 4, 2, { px: 52, color: '#6d28d9' });
  },
  info: (p) => { const r = p.op === 0 ? p.a + p.b : p.a - p.b; return bi(`${dec(p.a)} ${p.op ? '−' : '+'} ${dec(p.b)} = ${dec(r)}\nदशमलव बिन्दु मिलाएर एकाइबाट जोडघटाउ गरौँ`, `${dec(p.a)} ${p.op ? '−' : '+'} ${dec(p.b)} = ${dec(r)}\nLine up the decimal points and work from the right`); },
  tip: bi('ब्लकले दशमलव देखाउँछ: घन = १, छड = ०.१, सानो घन = ०.०१', 'Blocks show decimals: cube = 1, rod = 0.1, small cube = 0.01'),
  goal: () => { const a = 5 * rnd(10, 150), b = 5 * rnd(10, 100); return { p: { a, b, op: 0 }, np: `${dec(a)} + ${dec(b)} बनाऔँ`, en: `Set up ${dec(a)} + ${dec(b)}`, start: { a: 0, b: 0, op: 0 } }; },
  quiz: (i) => {
    const a = 5 * rnd(20, 150), b = 5 * rnd(10, 90); const sub = i % 2 === 1; const hi = sub ? Math.max(a, b) : a, lo = sub ? Math.min(a, b) : b; const r = sub ? hi - lo : a + b;
    if (i === 6) { const x = rnd(11, 99) / 10; return choice(`${x} को दशांश स्थानको अङ्क?`, `Which digit is in the tenths place of ${x}?`, String(Math.round(x * 10) % 10), ['0', '5', '9'].filter((v) => v !== String(Math.round(x * 10) % 10)), i); }
    if (i === 7) { const x = rnd(1, 9), y = rnd(1, 9); return choice(`${x}.${y} र ${x}.${y}0 मध्ये के सत्य?`, `${x}.${y} and ${x}.${y}0 are…`, 'बराबर | equal', ['पहिलो ठूलो | first is greater', 'दोस्रो ठूलो | second is greater'], i); }
    return choice(`${dec(hi)} ${sub ? '−' : '+'} ${dec(lo)} = ?`, `${dec(hi)} ${sub ? '−' : '+'} ${dec(lo)} = ?`, dec(r), [dec(r + 10), dec(Math.max(0, r - 10)), dec(r + 100), dec(r + 1)], i, { a: hi, b: lo, op: sub ? 1 : 0 });
  },
});
export const DecimalLab5 = makeLab(decimalCfg({ code: 'SIM-MATH-G5-L6-01', chapter: 6, titleNp: 'दशमलव ब्लक', titleEn: 'Decimal Blocks' }));

/* ───────────── percentage ───────────── */
export const percentCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string; six?: boolean }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#14b8a6',
  params: [
    { id: 'pct', np: 'प्रतिशत', en: 'Percent', min: 0, max: 100, step: 5, init: 25, show: (v) => `${v}%`, color: '#14b8a6' },
    { id: 'amt', np: 'जम्मा', en: 'Amount', min: 20, max: 200, step: 20, init: 80, color: '#f59e0b' },
  ],
  stage: { camera: [0, 13, 12], target: [0, 0, 0], minDistance: 8, maxDistance: 26 },
  draw: (g, p, lang) => {
    for (let k = 0; k < 100; k++) box(g, 0.34, 0.2, 0.34, -9 + (k % 10) * 0.4, 0.1, 3 - Math.floor(k / 10) * 0.4, k < p.pct ? '#14b8a6' : '#e2e8f0', 0.6);
    const hi = Math.round((p.amt * p.pct) / 100);
    for (let k = 0; k < p.amt; k++) box(g, 0.34, 0.34, 0.34, 0.8 + (k % 20) * 0.4, 0.2 + Math.floor(k / 20) * 0.38, 2.8 - 0 * k, k < hi ? '#f59e0b' : '#cbd5e1', 0.5);
    tag(g, `${p.pct}%`, -7, 0.7, 4.8, 3, { px: 60, w: 320, h: 96, bg: '#fff', border: '#14b8a6' }); tag(g, `${hi} / ${p.amt}`, 5, 3.6, 2.8, 3, { px: 60, w: 400, h: 96, bg: '#fff', border: '#f59e0b' });
    tag(g, lang === 'ne' ? '१०० मध्ये' : 'out of 100', -7, 0.4, -2, 2.2, { px: 40, w: 320, h: 80 });
  },
  info: (p) => { const hi = (p.amt * p.pct) / 100; const [n, d] = simp(p.pct, 100); return bi(`${p.pct}% = ${p.pct}/100 = ${n}/${d} = ${(p.pct / 100).toFixed(2)}\n${p.amt} को ${p.pct}% = ${hi}`, `${p.pct}% = ${p.pct}/100 = ${n}/${d} = ${(p.pct / 100).toFixed(2)}\n${p.pct}% of ${p.amt} = ${hi}`); },
  tip: bi('१०० खानामा प्रतिशत रङ्ग्याऔँ र जम्माको कति भाग हुन्छ हेरौँ', 'Colour a percent of 100 squares and see what part of the total it is'),
  goal: () => { const t = 5 * rnd(1, 19); return { p: { pct: t }, np: `${t}% रङ्ग्याऔँ`, en: `Colour ${t}%`, start: { pct: 0 } }; },
  quiz: (i) => {
    const fr = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 10], [7, 20], [9, 25]][i]; const pc = (fr[0] * 100) / fr[1]; const amt = 20 * rnd(2, 10); const t = 5 * rnd(1, 19);
    if (i < 3) return numChoice(`${fr[0]}/${fr[1]} लाई प्रतिशतमा बदल्दा कति?`, `${fr[0]}/${fr[1]} as a percent is…`, pc, i, [10, -10, 5, 20, -5], 1, '%', { pct: pc });
    if (i === 3) { const x = rnd(1, 9); const v = x * 10 + 5; return numChoice(`0.${x}5 लाई प्रतिशतमा बदल्दा?`, `Change 0.${x}5 to a percent`, v, i, [5, -5, 10, 1, 20], 1, '%', { pct: v }); }
    if (i === 4 || i === 5) return numChoice(`${amt} को ${t}% कति हो?`, `What is ${t}% of ${amt}?`, (amt * t) / 100, i, [1, -1, 2, 5, 10], 0, '', { pct: t, amt });
    if (o.six) return numChoice(`${amt} मा ${t}% बढ्दा कति हुन्छ?`, `${amt} increased by ${t}% is…`, amt + (amt * t) / 100, i, [1, -1, 2, 5, 10], 0);
    return numChoice(`एउटा कक्षामा ४० विद्यार्थीमध्ये ${t}% केटा छन् भने केटा कति?`, `In a class of 40, ${t}% are boys. How many boys?`, (40 * t) / 100, i, [1, -1, 2, 4, 5], 0);
  },
});
export const PercentLab5 = makeLab(percentCfg({ code: 'SIM-MATH-G5-L7-01', chapter: 7, titleNp: 'प्रतिशत ग्रिड', titleEn: 'Percent Grid' }));
void gcd; void (null as unknown as Params);
