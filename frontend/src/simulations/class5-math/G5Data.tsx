/**
 * Class 5 lessons 13 · Bill and budget, 14 · Presentation of data, 15 · Algebraic expressions.
 * (Class 6 reuses the algebra and bar-graph labs.)
 */
import { rnd } from '../class1-math-kit/nepali';
import { makeLab, LabCfg } from './Lab';
import { bi, choice, numChoice } from './h5';
import { box, tag, rod } from './vis';

/* ───────────── bill ───────────── */
const ITEMS = [{ np: 'कपी', en: 'Copy', price: 35, c: '#0ea5e9' }, { np: 'कलम', en: 'Pen', price: 15, c: '#ef4444' }, { np: 'ज्यामिति बाकस', en: 'Geometry box', price: 120, c: '#22c55e' }];
export const billCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#0ea5e9',
  params: [
    ...ITEMS.map((it, i) => ({ id: `q${i}`, np: `${it.np} (रु ${it.price})`, en: `${it.en} (Rs ${it.price})`, min: 0, max: 10, init: [3, 2, 1][i], color: it.c })),
    { id: 'disc', np: 'छुट', en: 'Discount', min: 0, max: 20, step: 5, init: 10, show: (v) => `${v}%`, color: '#f59e0b' },
    { id: 'vat', np: 'भ्याट', en: 'VAT', min: 0, max: 1, init: 1, names: [{ np: 'भ्याट छैन', en: 'No VAT' }, { np: 'भ्याट 13%', en: 'VAT 13%' }], color: '#8b5cf6' },
  ],
  stage: { camera: [0, 7, 15], target: [0, 3, 0], minDistance: 8, maxDistance: 26 },
  draw: (g, p, lang) => {
    ITEMS.forEach((it, i) => { for (let k = 0; k < p[`q${i}`]; k++) box(g, 1.3, 0.55, 1.3, -8 + i * 3, 0.3 + k * 0.6, 0, it.c, 0.5); tag(g, `${lang === 'ne' ? it.np : it.en} × ${p[`q${i}`]}`, -8 + i * 3, -0.6, 1.6, 2.8, { px: 40, w: 320, h: 80 }); tag(g, `${p[`q${i}`] * it.price}`, -8 + i * 3, 7.2, 0, 1.8, { px: 50, w: 192, h: 80, bg: '#fff', border: it.c }); });
    const sub = ITEMS.reduce((s, it, i) => s + p[`q${i}`] * it.price, 0); const d = (sub * p.disc) / 100; const v = ((sub - d) * 13 * p.vat) / 100;
    box(g, 6.6, 6.6, 0.15, 7, 3.6, -0.4, '#fffbeb'); tag(g, lang === 'ne' ? 'बिल' : 'BILL', 7, 6.4, -0.2, 2.4, { px: 56, w: 256, h: 80 });
    [[lang === 'ne' ? 'जम्मा' : 'Subtotal', sub], [lang === 'ne' ? 'छुट' : 'Discount', -d], [lang === 'ne' ? 'भ्याट' : 'VAT', v], [lang === 'ne' ? 'कुल' : 'TOTAL', sub - d + v]].forEach(([n, a], k) => tag(g, `${n}: Rs ${Number(a).toFixed(Number.isInteger(Number(a)) ? 0 : 2)}`, 7, 5.2 - k * 1.1, 0, 4.6, { px: 42, w: 400, h: 72, color: k === 3 ? '#b45309' : '#0f172a' }));
  },
  info: (p) => { const sub = ITEMS.reduce((s, it, i) => s + p[`q${i}`] * it.price, 0); const d = (sub * p.disc) / 100; const v = ((sub - d) * 13 * p.vat) / 100; return bi(`जम्मा रु ${sub} − छुट ${d} + भ्याट ${v.toFixed(2)} = रु ${(sub - d + v).toFixed(2)}\nबिल = परिमाण × दर, छुट पछि भ्याट`, `Subtotal Rs ${sub} − discount ${d} + VAT ${v.toFixed(2)} = Rs ${(sub - d + v).toFixed(2)}\nBill = quantity × rate; VAT is added after the discount`); },
  tip: bi('सामान र छुट बदलेर बिल बनाऔँ', 'Change the items and discount to make a bill'),
  goal: () => { const q = [rnd(1, 6), rnd(1, 6), rnd(1, 3)]; const sub = q[0] * 35 + q[1] * 15 + q[2] * 120; return { p: { q0: q[0], q1: q[1], q2: q[2], disc: 0, vat: 0 }, np: `कुल रु ${sub} हुने बिल बनाऔँ (छुट र भ्याट नहुने)`, en: `Make a bill of exactly Rs ${sub} (no discount, no VAT)`, start: { q0: 0, q1: 0, q2: 0, disc: 0, vat: 0 } }; },
  quiz: (i) => {
    const q = [rnd(2, 8), rnd(2, 8), rnd(1, 4)]; const sub = q[0] * 35 + q[1] * 15 + q[2] * 120; const dp = 5 * rnd(1, 4); const d = (sub * dp) / 100;
    if (i === 0) return numChoice(`${q[0]} कपी (रु 35) को जम्मा कति?`, `${q[0]} copies at Rs 35 cost…`, q[0] * 35, i, [5, -5, 35, 10, 70], 1, '', { q0: q[0], q1: 0, q2: 0 });
    if (i === 1) return numChoice(`${q[1]} कलम (रु 15) र ${q[2]} ज्यामिति बाकस (रु 120) को जम्मा कति?`, `${q[1]} pens (Rs 15) and ${q[2]} geometry boxes (Rs 120) cost…`, q[1] * 15 + q[2] * 120, i, [15, -15, 10, 120, 30], 1, '', { q0: 0, q1: q[1], q2: q[2] });
    if (i === 2) return numChoice(`जम्मा रु ${sub}, ग्राहकले रु ${Math.ceil(sub / 100) * 100} दिए। फिर्ता कति?`, `Bill Rs ${sub}; the customer pays Rs ${Math.ceil(sub / 100) * 100}. Change?`, Math.ceil(sub / 100) * 100 - sub, i, [5, -5, 10, 20, 50], 0);
    if (i === 3) return numChoice(`रु ${sub} मा ${dp}% छुट भए छुट रकम कति?`, `A ${dp}% discount on Rs ${sub} is…`, d, i, [5, -5, 10, 20, 50], 0, '', { q0: q[0], q1: q[1], q2: q[2], disc: dp, vat: 0 });
    if (i === 4) return numChoice(`रु ${sub} मा ${dp}% छुट पछि तिर्नुपर्ने रकम?`, `Rs ${sub} after a ${dp}% discount is…`, sub - d, i, [5, -5, 10, d, 50], 1);
    if (i === 5) { const a = 100 * rnd(2, 9); return numChoice(`रु ${a} मा 13% भ्याट कति हुन्छ?`, `13% VAT on Rs ${a} is…`, (a * 13) / 100, i, [1, -1, 3, 10, 13], 1); }
    if (i === 6) { const a = 100 * rnd(2, 9); return numChoice(`रु ${a} को सामानमा 13% भ्याटसहित कुल कति?`, `Rs ${a} plus 13% VAT is…`, a + (a * 13) / 100, i, [1, -1, 13, 10, 3], 1); }
    return numChoice(`एउटा पुस्तक रु ${sub} मा किनेर रु ${sub + 50} मा बेच्दा के हुन्छ?`, `A book bought for Rs ${sub} is sold for Rs ${sub + 50}. Profit in rupees?`, 50, i, [5, -5, 10, 100, 25], 1);
  },
});
export const BillLab5 = makeLab(billCfg({ code: 'SIM-MATH-G5-L13-01', chapter: 13, titleNp: 'बिल पसल', titleEn: 'Bill Shop' }));

/* ───────────── budget ───────────── */
const EX = [{ np: 'खाना', en: 'Food', c: '#22c55e' }, { np: 'भाडा', en: 'Rent', c: '#0ea5e9' }, { np: 'शिक्षा', en: 'Education', c: '#8b5cf6' }, { np: 'अन्य', en: 'Other', c: '#f97316' }];
export const budgetCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#22c55e',
  params: [
    { id: 'inc', np: 'आम्दानी (हजार)', en: 'Income (thousand)', min: 10, max: 80, step: 5, init: 40, color: '#16a34a' },
    ...EX.map((e, i) => ({ id: `e${i}`, np: `${e.np} (हजार)`, en: `${e.en} (thousand)`, min: 0, max: 30, init: [10, 8, 6, 4][i], color: e.c })),
  ],
  stage: { camera: [0, 9, 17], target: [0, 5, 0], minDistance: 9, maxDistance: 30 },
  draw: (g, p, lang) => {
    for (let k = 0; k < p.inc; k++) box(g, 2, 0.34, 2, -4, 0.2 + k * 0.36, 0, '#4ade80', 0.4);
    let y = 0; EX.forEach((e, i) => { for (let k = 0; k < p[`e${i}`]; k++) { box(g, 2, 0.34, 2, 1, 0.2 + y * 0.36, 0, e.c, 0.4); y++; } });
    const sav = p.inc - y; if (sav > 0) for (let k = 0; k < sav; k++) box(g, 2, 0.34, 2, 5.5, 0.2 + k * 0.36, 0, '#facc15', 0.3); else for (let k = 0; k < -sav; k++) box(g, 2, 0.34, 2, 5.5, 0.2 + k * 0.36, 0, '#ef4444', 0.3);
    tag(g, lang === 'ne' ? 'आम्दानी' : 'Income', -4, -0.6, 1.8, 2.4, { px: 44, w: 256, h: 80 }); tag(g, lang === 'ne' ? 'खर्च' : 'Spending', 1, -0.6, 1.8, 2.4, { px: 44, w: 256, h: 80 }); tag(g, sav >= 0 ? (lang === 'ne' ? 'बचत' : 'Saving') : lang === 'ne' ? 'घाटा' : 'Deficit', 5.5, -0.6, 1.8, 2.4, { px: 44, w: 256, h: 80 });
  },
  info: (p) => { const sp = EX.reduce((s, _e, i) => s + p[`e${i}`], 0); const sv = p.inc - sp; return bi(`आम्दानी ${p.inc} − खर्च ${sp} = ${sv >= 0 ? `बचत ${sv}` : `घाटा ${-sv}`} (हजार रु)`, `Income ${p.inc} − spending ${sp} = ${sv >= 0 ? `saving ${sv}` : `deficit ${-sv}`} (Rs thousand)`); },
  tip: bi('आम्दानी र खर्चका बजेट मिलाऔँ; आम्दानी − खर्च = बचत', 'Balance a family budget: income − spending = saving'),
  goal: () => { const inc = 5 * rnd(6, 14); const e = [rnd(5, 12), rnd(4, 10), rnd(3, 8), rnd(2, 6)]; const s = e.reduce((a, b) => a + b, 0); return { p: { inc, e0: e[0], e1: e[1], e2: e[2], e3: e[3] }, np: `आम्दानी ${inc}, खर्च ${s} बनाऔँ (बचत ${inc - s})`, en: `Set income ${inc} and spending ${s} (saving ${inc - s})`, start: { inc: 10, e0: 0, e1: 0, e2: 0, e3: 0 } }; },
  quiz: (i) => {
    const inc = 5 * rnd(8, 16), e = [rnd(5, 12), rnd(4, 10), rnd(3, 8), rnd(2, 6)]; const s = e.reduce((a, b) => a + b, 0); const set = { inc, e0: e[0], e1: e[1], e2: e[2], e3: e[3] };
    if (i % 3 === 0) return numChoice(`आम्दानी रु ${inc} हजार, खर्च रु ${s} हजार भए बचत कति?`, `Income Rs ${inc} thousand, spending Rs ${s} thousand. Saving?`, inc - s, i, [1, -1, 5, 10, 2], 0, 'thousand'.slice(0, 0), set);
    if (i % 3 === 1) return numChoice(`खाना ${e[0]}, भाडा ${e[1]}, शिक्षा ${e[2]}, अन्य ${e[3]} (हजार) भए जम्मा खर्च कति?`, `Food ${e[0]}, rent ${e[1]}, education ${e[2]}, other ${e[3]} (thousand). Total spending?`, s, i, [1, -1, 5, 10, 2], 1, '', set);
    return choice(`आम्दानी ${s - 5} र खर्च ${s} भए के हुन्छ?`, `Income ${s - 5}, spending ${s}: what is it?`, 'Deficit', ['Saving', 'Balanced'], i);
  },
});
export const BudgetLab5 = makeLab(budgetCfg({ code: 'SIM-MATH-G5-L13-02', chapter: 13, titleNp: 'बजेट टावर', titleEn: 'Budget Towers' }));

/* ───────────── tally and frequency ───────────── */
const CAT = [{ np: 'स्याउ', en: 'Apple', c: '#ef4444' }, { np: 'आँप', en: 'Mango', c: '#f59e0b' }, { np: 'केरा', en: 'Banana', c: '#eab308' }, { np: 'suntala', en: 'Orange', c: '#f97316' }, { np: 'अङ्गुर', en: 'Grapes', c: '#8b5cf6' }];
CAT[3].np = 'सुन्तला';
export const tallyCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#f97316',
  params: CAT.map((c, i) => ({ id: `c${i}`, np: c.np, en: c.en, min: 0, max: 15, init: [6, 9, 4, 7, 3][i], color: c.c })),
  stage: { camera: [0, 9, 12], target: [0, 0, 0], minDistance: 7, maxDistance: 24 },
  draw: (g, p, lang) => {
    CAT.forEach((c, i) => {
      const z = -4 + i * 2; tag(g, lang === 'ne' ? c.np : c.en, -8, 0.5, z, 2.6, { px: 44, w: 320, h: 80, color: c.c }); const n = p[`c${i}`];
      for (let k = 0; k < n; k++) { const grp = Math.floor(k / 5), r = k % 5; const x0 = -5.5 + grp * 2.2; if (r < 4) box(g, 0.12, 1.2, 0.12, x0 + r * 0.38, 0.7, z, '#0f172a', 0.5); else rod(g, [x0 - 0.1, 0.35, z], [x0 + 1.6, 1.05, z], '#dc2626', 0.1); }
      tag(g, String(n), 7.3, 0.6, z, 1.6, { px: 60, w: 128, h: 96, bg: '#fff', border: c.c });
    });
    tag(g, lang === 'ne' ? 'आवृत्ति' : 'Frequency', 7.3, 0.3, -5.6, 2.2, { px: 40, w: 256, h: 64 });
  },
  info: (p) => { const t = CAT.reduce((s, _c, i) => s + p[`c${i}`], 0); const mx = Math.max(...CAT.map((_c, i) => p[`c${i}`])); const best = CAT.filter((_c, i) => p[`c${i}`] === mx).map((c) => c.np).join(', '); const bestE = CAT.filter((_c, i) => p[`c${i}`] === mx).map((c) => c.en).join(', '); return bi(`जम्मा = ${t}\nसबैभन्दा धेरै: ${best} (${mx})\nचार ठाडा रेखा र पाँचौँ तेर्सो = 5`, `Total = ${t}\nMost: ${bestE} (${mx})\nFour straight strokes and a slash make 5`); },
  tip: bi('प्रत्येक फलको गणना चिह्न (tally) र आवृत्ति हेरौँ', 'Read the tally marks and the frequency of each fruit'),
  goal: () => { const c = [rnd(1, 12), rnd(1, 12), rnd(1, 12), rnd(1, 12), rnd(1, 12)]; return { p: { c0: c[0], c1: c[1], c2: c[2], c3: c[3], c4: c[4] }, np: `तालिका बनाऔँ: स्याउ ${c[0]}, आँप ${c[1]}, केरा ${c[2]}, सुन्तला ${c[3]}, अङ्गुर ${c[4]}`, en: `Make the table: apple ${c[0]}, mango ${c[1]}, banana ${c[2]}, orange ${c[3]}, grapes ${c[4]}`, start: { c0: 0, c1: 0, c2: 0, c3: 0, c4: 0 } }; },
  quiz: (i) => {
    const c = [rnd(2, 14), rnd(2, 14), rnd(2, 14), rnd(2, 14), rnd(2, 14)]; const set = { c0: c[0], c1: c[1], c2: c[2], c3: c[3], c4: c[4] }; const a = rnd(0, 2), b = rnd(3, 4);
    if (i === 0) return numChoice(`${CAT[a].np} कतिजनाले मन पराए?`, `How many chose ${CAT[a].en}?`, c[a], i, [1, -1, 2, 5, 3], 0, '', set);
    if (i === 1) return numChoice('जम्मा कतिजनाले भोट दिए?', 'How many votes in total?', c.reduce((s, x) => s + x, 0), i, [1, -1, 5, 10, 2], 1, '', set);
    if (i === 2) { const mx = c.indexOf(Math.max(...c)); if (c.filter((x) => x === c[mx]).length > 1) return numChoice(`${CAT[a].np} र ${CAT[b].np} को फरक कति?`, `Difference between ${CAT[a].en} and ${CAT[b].en}?`, Math.abs(c[a] - c[b]), i, [1, -1, 2, 5, 3], 0, '', set); return choice('सबैभन्दा लोकप्रिय फल कुन हो?', 'Which fruit is the most popular?', `${CAT[mx].en}`, CAT.filter((_x, k) => k !== mx).map((x) => `${x.en}`), i, set); }
    if (i === 3) return numChoice(`${CAT[a].np} र ${CAT[b].np} को फरक कति?`, `Difference between ${CAT[a].en} and ${CAT[b].en}?`, Math.abs(c[a] - c[b]), i, [1, -1, 2, 5, 3], 0, '', set);
    if (i === 4) { const n = rnd(6, 14); return choice(`${n} को गणना चिह्न कसरी देखाइन्छ?`, `How is ${n} shown in tally marks?`, `${Math.floor(n / 5)} | ${n % 5}`, [`${Math.floor(n / 5) + 1} | ${n % 5}`, `${Math.floor(n / 5)} | ${(n % 5) + 1}`, `${n % 5} | ${Math.floor(n / 5)}`], i); }
    if (i === 5) { const mn = c.indexOf(Math.min(...c)); return numChoice('सबैभन्दा कम भोट पाएको फलको भोट कति?', 'How many votes did the least popular fruit get?', c[mn], i, [1, -1, 2, 3, 5], 0, '', set); }
    return numChoice(`${CAT[a].np}, ${CAT[b].np} र ${CAT[2].np} को जम्मा कति?`, `Total for ${CAT[a].en}, ${CAT[b].en} and ${CAT[2].en} (the first, fourth and third picks)?`, c[a] + c[b] + (a === 2 ? 0 : c[2]), i, [1, -1, 5, 2, 10], 1, '', set);
  },
});
export const TallyLab5 = makeLab(tallyCfg({ code: 'SIM-MATH-G5-L14-01', chapter: 14, titleNp: 'गणना चिह्न र तालिका', titleEn: 'Tally Table' }));

/* ───────────── bar graph ───────────── */
const SC = [1, 2, 5, 10];
export const barCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#22c55e',
  params: [
    { id: 'sc', np: 'मापन', en: 'Scale', min: 0, max: 3, init: 2, show: (v) => `1 खण्ड = ${SC[v]}`.replace('1 खण्ड', '1 block') },
    ...CAT.map((c, i) => ({ id: `v${i}`, np: c.np, en: c.en, min: 0, max: 10, init: [4, 7, 3, 6, 5][i], color: c.c })),
  ],
  stage: { camera: [0, 7, 16], target: [0, 3.2, 0], minDistance: 8, maxDistance: 28 },
  draw: (g, p, lang) => {
    const s = SC[p.sc]; box(g, 16, 0.2, 3, 0, 0.1, 0, '#e2e8f0');
    for (let k = 2; k <= 10; k += 2) { tag(g, String(k * s), -8.8, 0.2 + k * 0.62, 0, 1.2, { px: 40, w: 128, h: 64 }); box(g, 15, 0.03, 0.03, 0, 0.2 + k * 0.62 - 0.31, -1.2, '#cbd5e1'); }
    CAT.forEach((c, i) => { for (let k = 0; k < p[`v${i}`]; k++) box(g, 1.9, 0.58, 1.4, -6 + i * 3, 0.5 + k * 0.62, 0, c.c, 0.5); tag(g, lang === 'ne' ? c.np : c.en, -6 + i * 3, -0.5, 1.6, 2.2, { px: 44, w: 256, h: 80 }); tag(g, String(p[`v${i}`] * s), -6 + i * 3, 0.9 + p[`v${i}`] * 0.62 + 0.3, 0, 1.6, { px: 50, w: 160, h: 72, bg: '#fff', border: c.c }); });
  },
  info: (p) => { const s = SC[p.sc]; const t = CAT.reduce((a, _c, i) => a + p[`v${i}`] * s, 0); return bi(`1 खण्ड = ${s} · जम्मा = ${t}\nस्तम्भको खण्ड गन्ती × मापन = मान`, `1 block = ${s} · total = ${t}\nValue = number of blocks × scale`); },
  tip: bi('मापन छानेर स्तम्भको मान पढौँ: खण्ड × मापन', 'Pick a scale and read each bar: blocks × scale'),
  goal: () => { const sc = rnd(1, 3), v = CAT.map(() => rnd(1, 9)); return { p: { sc, v0: v[0], v1: v[1], v2: v[2], v3: v[3], v4: v[4] }, np: `मापन 1 खण्ड = ${SC[sc]} राखी स्तम्भ बनाऔँ: ${v.map((x) => x * SC[sc]).join(', ')}`, en: `With 1 block = ${SC[sc]}, build bars for ${v.map((x) => x * SC[sc]).join(', ')}`, start: { sc: 0, v0: 0, v1: 0, v2: 0, v3: 0, v4: 0 } }; },
  quiz: (i) => {
    const sc = rnd(1, 3), s = SC[sc], v = CAT.map(() => rnd(2, 9)); const set = { sc, v0: v[0], v1: v[1], v2: v[2], v3: v[3], v4: v[4] }; const a = rnd(0, 1), b = rnd(2, 4);
    if (i === 0 || i === 1) return numChoice(`${CAT[a + i].np} को स्तम्भले कति देखाउँछ?`, `What value does the ${CAT[a + i].en} bar show?`, v[a + i] * s, i, [s, -s, 2 * s, 5, 10], 1, '', set);
    if (i === 2) return numChoice(`${CAT[a].np} र ${CAT[b].np} को फरक कति?`, `Difference between ${CAT[a].en} and ${CAT[b].en}?`, Math.abs(v[a] - v[b]) * s, i, [s, -s, 2 * s, 5, 10], 0, '', set);
    if (i === 3) return numChoice('सबै स्तम्भको जम्मा कति?', 'What is the total of all the bars?', v.reduce((x, y) => x + y, 0) * s, i, [10, -10, 5, 2 * s, 20], 1, '', set);
    if (i === 4) { const mx = v.indexOf(Math.max(...v)); if (v.filter((x) => x === v[mx]).length === 1) return choice('सबैभन्दा अग्लो स्तम्भ कुन हो?', 'Which bar is the tallest?', `${CAT[mx].en}`, CAT.filter((_c, k) => k !== mx).map((x) => `${x.en}`), i, set); }
    if (i === 5) return numChoice(`मापन 1 खण्ड = ${s} भए ${v[a]} खण्डको मान कति?`, `If 1 block = ${s}, what do ${v[a]} blocks show?`, v[a] * s, i, [s, -s, 2 * s, 5, 10], 1, '', set);
    if (i === 6) return numChoice(`एउटा स्तम्भ ${v[b] * s} देखाउँछ र मापन 1 खण्ड = ${s} भए कति खण्ड हुन्छन्?`, `A bar shows ${v[b] * s} with 1 block = ${s}. How many blocks?`, v[b], i, [1, -1, 2, 3, 5], 1, '', set);
    return numChoice(`${CAT[a].np} को भन्दा ${CAT[b].np} को स्तम्भ कति थोरै वा धेरै छ?`, `By how much do ${CAT[a].en} and ${CAT[b].en} differ?`, Math.abs(v[a] - v[b]) * s, i, [s, -s, 2 * s, 5, 10], 0, '', set);
  },
});
export const BarLab5 = makeLab(barCfg({ code: 'SIM-MATH-G5-L14-02', chapter: 14, titleNp: 'स्तम्भ चित्र', titleEn: 'Bar Graph Lab' }));

/* ───────────── algebraic expressions ───────────── */
export const algebraCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#8b5cf6',
  params: [{ id: 'a', np: 'गुणाङ्क a', en: 'Coefficient a', min: 1, max: 5, init: 3, color: '#8b5cf6' }, { id: 'x', np: 'x को मान', en: 'Value of x', min: 0, max: 9, init: 4, color: '#0ea5e9' }, { id: 'b', np: 'स्थिर पद b', en: 'Constant b', min: 0, max: 9, init: 2, color: '#f59e0b' }],
  stage: { camera: [0, 10, 14], target: [0, 1, 0], minDistance: 8, maxDistance: 26 },
  draw: (g, p, lang) => {
    for (let r = 0; r < p.a; r++) { for (let k = 0; k < p.x; k++) box(g, 0.8, 0.8, 0.8, -7 + k * 0.9, 0.45, -3 + r * 1.2, '#a78bfa', 0.4); tag(g, 'x', -7.9, 0.5, -3 + r * 1.2, 1.1, { px: 60, w: 96, h: 96 }); }
    for (let k = 0; k < p.b; k++) box(g, 0.8, 0.8, 0.8, 4 + (k % 5) * 0.9, 0.45 + Math.floor(k / 5) * 0.9, -3, '#facc15', 0.4);
    tag(g, `${p.a}x + ${p.b}`, 0, 5.4, 0, 5, { px: 70, w: 480, h: 112, bg: '#fff', border: '#8b5cf6' }); tag(g, `x = ${p.x}  →  ${p.a * p.x + p.b}`, 0, 3.8, 0, 4.6, { px: 54, w: 480, h: 96, bg: '#fff', border: '#0ea5e9' });
    tag(g, lang === 'ne' ? `${p.a} समूह x` : `${p.a} groups of x`, -3.5, 0.3, 2.8, 3, { px: 44, w: 320, h: 80 }); tag(g, lang === 'ne' ? `${p.b} स्थिर` : `${p.b} ones`, 5.6, 0.3, 2.8, 2.6, { px: 44, w: 320, h: 80 });
  },
  info: (p) => bi(`${p.a}x + ${p.b}, x = ${p.x} हुँदा = ${p.a} × ${p.x} + ${p.b} = ${p.a * p.x + p.b}\nचल (variable) = x · गुणाङ्क = ${p.a} · स्थिर पद = ${p.b}`, `${p.a}x + ${p.b} when x = ${p.x}: ${p.a} × ${p.x} + ${p.b} = ${p.a * p.x + p.b}\nVariable = x · coefficient = ${p.a} · constant = ${p.b}`),
  tip: bi('x को मान बदलेर बीजीय अभिव्यक्तिको मान निकालौँ', 'Change x and find the value of the expression'),
  goal: () => { const a = rnd(1, 5), x = rnd(1, 9), b = rnd(0, 9); return { p: { a, x, b }, np: `${a}x + ${b} मा x = ${x} राखेर मान ${a * x + b} देखाऔँ`, en: `Show ${a}x + ${b} with x = ${x} (value ${a * x + b})`, start: { a: 1, x: 0, b: 0 } }; },
  quiz: (i) => {
    const a = rnd(2, 6), x = rnd(2, 9), b = rnd(1, 9);
    if (i < 3) return numChoice(`${a}x + ${b} मा x = ${x} हुँदा मान कति?`, `Value of ${a}x + ${b} when x = ${x}?`, a * x + b, i, [1, -1, a, b, x], 0, '', { a: Math.min(a, 5), x, b: Math.min(b, 9) });
    if (i === 3) return choice(`x को ${a} गुणा भन्दा ${b} बढी भन्नाले?`, `"${b} more than ${a} times x" is…`, `${a}x + ${b}`, [`${a + b}x`, `${b}x + ${a}`, `${a}x − ${b}`], i);
    if (i === 4) return choice(`${a}x + ${b} मा गुणाङ्क कुन हो?`, `In ${a}x + ${b} the coefficient of x is…`, String(a), [String(b), 'x', String(a + b)], i, { a: Math.min(a, 5), b: Math.min(b, 9) });
    if (i === 5) return choice(`${a}x + ${b} मा स्थिर पद कुन हो?`, `In ${a}x + ${b} the constant term is…`, String(b), [String(a), 'x', String(a + b)], i, { a: Math.min(a, 5), b: Math.min(b, 9) });
    if (i === 6) return choice(`x को ${a} अर्थात् सङ्ख्यालाई ${a} ले गुणा गरेर ${b} घटाउँदा?`, `"x multiplied by ${a}, then ${b} subtracted" is…`, `${a}x − ${b}`, [`${a}x + ${b}`, `${a - b}x`, `${b}x − ${a}`], i);
    return numChoice(`वर्गको भुजा x भए परिमिति कति x?`, `A square has side x. Its perimeter is how many times x?`, 4, i, [2, 3, 8, 1, 6], 1);
  },
});
export const AlgebraLab5 = makeLab(algebraCfg({ code: 'SIM-MATH-G5-L15-01', chapter: 15, titleNp: 'बीजीय अभिव्यक्ति', titleEn: 'Algebra Blocks' }));

export const likeTermsCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#ec4899',
  params: [{ id: 'c1', np: 'पहिलो x', en: 'First x', min: 1, max: 6, init: 3, color: '#ef4444' }, { id: 'c2', np: 'दोस्रो x', en: 'Second x', min: 1, max: 6, init: 2, color: '#0ea5e9' }, { id: 'k1', np: 'पहिलो स्थिर', en: 'First ones', min: 0, max: 9, init: 4, color: '#f59e0b' }, { id: 'k2', np: 'दोस्रो स्थिर', en: 'Second ones', min: 0, max: 9, init: 5, color: '#22c55e' }],
  stage: { camera: [0, 8, 13], target: [0, 1, 0], minDistance: 8, maxDistance: 24 },
  draw: (g, p, lang) => {
    for (let k = 0; k < p.c1; k++) { box(g, 1.6, 0.6, 1.6, -6 + k * 1.8, 0.35, -3.5, '#ef4444', 0.4); tag(g, 'x', -6 + k * 1.8, 0.8, -3.5, 1, { px: 60, w: 96, h: 96, color: '#fff' }); }
    for (let k = 0; k < p.c2; k++) { box(g, 1.6, 0.6, 1.6, -6 + k * 1.8, 0.35, -1.2, '#0ea5e9', 0.4); tag(g, 'x', -6 + k * 1.8, 0.8, -1.2, 1, { px: 60, w: 96, h: 96, color: '#fff' }); }
    for (let k = 0; k < p.k1; k++) box(g, 0.7, 0.7, 0.7, 5 + (k % 5) * 0.85, 0.4 + Math.floor(k / 5) * 0.85, -3.5, '#f59e0b', 0.4);
    for (let k = 0; k < p.k2; k++) box(g, 0.7, 0.7, 0.7, 5 + (k % 5) * 0.85, 0.4 + Math.floor(k / 5) * 0.85, -1.2, '#22c55e', 0.4);
    for (let k = 0; k < p.c1 + p.c2; k++) box(g, 1.6, 0.6, 1.6, -6 + k * 1.8, 0.35, 3.2, '#a855f7', 0.4);
    for (let k = 0; k < p.k1 + p.k2; k++) box(g, 0.7, 0.7, 0.7, 5 + (k % 5) * 0.85, 0.4 + Math.floor(k / 5) * 0.85, 3.2, '#facc15', 0.4);
    tag(g, `${p.c1 + p.c2}x + ${p.k1 + p.k2}`, 0, 4.4, 3.2, 5, { px: 66, w: 480, h: 112, bg: '#fff', border: '#ec4899' }); tag(g, lang === 'ne' ? 'समान पद जोडौँ' : 'Combine like terms', -7, 0.3, 5, 3.4, { px: 44, w: 360, h: 80 });
  },
  info: (p) => bi(`(${p.c1}x + ${p.k1}) + (${p.c2}x + ${p.k2}) = ${p.c1 + p.c2}x + ${p.k1 + p.k2}\nx भएका पद र सङ्ख्यामात्रका पद छुट्टाछुट्टै जोडिन्छन्`, `(${p.c1}x + ${p.k1}) + (${p.c2}x + ${p.k2}) = ${p.c1 + p.c2}x + ${p.k1 + p.k2}\nAdd the x terms together and the plain numbers together`),
  tip: bi('समान पद (x भएका र सङ्ख्यामात्रका) जोडेर सरल गरौँ', 'Add like terms: the x blocks together and the number cubes together'),
  goal: () => { const a = rnd(1, 6), b = rnd(1, 6), c = rnd(0, 9), d = rnd(0, 9); return { p: { c1: a, c2: b, k1: c, k2: d }, np: `(${a}x + ${c}) + (${b}x + ${d}) बनाऔँ`, en: `Set up (${a}x + ${c}) + (${b}x + ${d})`, start: { c1: 1, c2: 1, k1: 0, k2: 0 } }; },
  quiz: (i) => {
    const a = rnd(2, 6), b = rnd(1, 6), c = rnd(1, 9), d = rnd(1, 9);
    if (i < 3) return choice(`(${a}x + ${c}) + (${b}x + ${d}) = ?`, `(${a}x + ${c}) + (${b}x + ${d}) = ?`, `${a + b}x + ${c + d}`, [`${a * b}x + ${c + d}`, `${a + b}x + ${c * d}`, `${a + b + c + d}x`], i, { c1: a, c2: b, k1: c, k2: d });
    if (i === 3) return choice(`${a}x + ${b}x = ?`, `${a}x + ${b}x = ?`, `${a + b}x`, [`${a * b}x`, `${a + b}x²`, `${a + b}`], i);
    if (i === 4) return choice(`कुन दुई पद समान हुन्?`, 'Which two terms are like terms?', `${a}x and ${b}x`, [`${a}x and ${b}`, `${a} and x`], i);
    if (i === 5) { const big = a + b + 2; return choice(`${big}x − ${a}x = ?`, `${big}x − ${a}x = ?`, `${big - a}x`, [`${big + a}x`, `${big * a}x`, `${big - a}`], i); }
    if (i === 6) return choice(`${a}x + ${c} मा कतिवटा पद छन्?`, `How many terms are in ${a}x + ${c}?`, '2', ['1', '3', '4'], i);
    return choice(`${c} + ${d} + ${a}x + ${b}x = ?`, `${c} + ${d} + ${a}x + ${b}x = ?`, `${a + b}x + ${c + d}`, [`${a + b}x + ${c * d}`, `${a + b + c + d}x`, `${a * b}x + ${c + d}`], i);
  },
});
export const LikeTermsLab5 = makeLab(likeTermsCfg({ code: 'SIM-MATH-G5-L15-02', chapter: 15, titleNp: 'समान पद', titleEn: 'Like Terms' }));
