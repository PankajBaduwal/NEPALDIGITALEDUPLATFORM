/**
 * Class 6 lessons 4–8 · Fraction, Decimal, Percentage, Profit and Loss, Unitary method.
 */
import { rnd } from '../class1-math-kit/nepali';
import { makeLab, LabCfg } from '../class5-math/Lab';
import { bi, choice, numChoice, lcm, fracS, simp } from '../class5-math/h5';
import { fractionCfg, percentCfg } from '../class5-math/G5Frac';
import { box, tag, tiles, outline } from '../class5-math/vis';

export const FractionLab6 = makeLab(fractionCfg({ code: 'SIM-MATH-G6-L4-01', chapter: 4, titleNp: 'भिन्नको जोडघटाउ', titleEn: 'Fraction Add and Subtract', six: true }));

/* ───────────── multiply and divide fractions ───────────── */
export const fracMulCfg: LabCfg = {
  code: 'SIM-MATH-G6-L4-02', chapter: 4, titleNp: 'भिन्नको गुणन र भाग', titleEn: 'Fraction Multiply and Divide', color: '#ec4899',
  params: [
    { id: 'n1', np: 'अंश 1', en: 'Top 1', min: 1, max: 8, init: 2, color: '#0ea5e9' }, { id: 'd1', np: 'हर 1', en: 'Bottom 1', min: 2, max: 8, init: 3, color: '#0ea5e9' },
    { id: 'n2', np: 'अंश 2', en: 'Top 2', min: 1, max: 8, init: 3, color: '#ef4444' }, { id: 'd2', np: 'हर 2', en: 'Bottom 2', min: 2, max: 8, init: 4, color: '#ef4444' },
    { id: 'op', np: 'क्रिया', en: 'Operation', min: 0, max: 1, init: 0, names: [{ np: 'गुणन ×', en: 'Multiply ×' }, { np: 'भाग ÷', en: 'Divide ÷' }] },
  ],
  stage: { camera: [0, 12, 9], target: [0, 0, 0], minDistance: 7, maxDistance: 24 },
  fix: (p) => ({ ...p, n1: Math.min(p.n1, p.d1), n2: Math.min(p.n2, p.d2) }),
  draw: (g, p, lang) => {
    if (p.op === 0) {
      const u = 8 / Math.max(p.d1, p.d2);
      for (let c = 0; c < p.d1; c++) for (let r = 0; r < p.d2; r++) { const a = c < p.n1, b = r < p.n2; box(g, u * 0.94, 0.25, u * 0.94, (c - (p.d1 - 1) / 2) * u, 0.15, (r - (p.d2 - 1) / 2) * u, a && b ? '#facc15' : a ? '#7dd3fc' : b ? '#fda4af' : '#e2e8f0', 0.6); }
      tag(g, `${p.n1}/${p.d1}`, 0, 0.5, -(p.d2 * u) / 2 - 1, 2.4, { px: 56, color: '#0369a1' }); tag(g, `${p.n2}/${p.d2}`, (p.d1 * u) / 2 + 1.4, 0.5, 0, 2.4, { px: 56, color: '#be123c' });
      tag(g, lang === 'ne' ? 'सुनौलो भाग = गुणनफल' : 'Gold part = the product', 0, 0.5, (p.d2 * u) / 2 + 1.2, 4.4, { px: 46, w: 440, h: 80 });
    } else {
      const L = lcm(p.d1, p.d2); const a = (p.n1 * L) / p.d1, b = (p.n2 * L) / p.d2; const u = Math.min(0.5, 14 / L);
      for (let k = 0; k < a; k++) box(g, u * 0.9, 0.9, 0.9, -7 + u * (k + 0.5), 0.5, 0, Math.floor(k / b) % 2 ? '#f59e0b' : '#22c55e', 0.45);
      tag(g, `${p.n1}/${p.d1} = ${a}/${L}`, 0, 2.2, 0, 3.4, { px: 50, w: 400, h: 80, bg: '#fff', border: '#22c55e' }); tag(g, `${lang === 'ne' ? 'टुक्रा' : 'group'} = ${p.n2}/${p.d2} = ${b}/${L}`, 0, 3.6, 0, 4.2, { px: 46, w: 460, h: 80, bg: '#fff', border: '#f59e0b' });
      tag(g, `${(a / b).toFixed(a % b ? 2 : 0)} ${lang === 'ne' ? 'समूह' : 'groups'}`, 0, 0.4, 2.8, 3.4, { px: 54, w: 400, h: 96, bg: '#fff', border: '#ec4899' });
    }
  },
  info: (p) => {
    const [a, b] = p.op === 0 ? simp(p.n1 * p.n2, p.d1 * p.d2) : simp(p.n1 * p.d2, p.d1 * p.n2); const s = b === 1 ? String(a) : `${a}/${b}`;
    return p.op === 0 ? bi(`${p.n1}/${p.d1} × ${p.n2}/${p.d2} = ${p.n1 * p.n2}/${p.d1 * p.d2} = ${s}\nअंश × अंश, हर × हर`, `${p.n1}/${p.d1} × ${p.n2}/${p.d2} = ${p.n1 * p.n2}/${p.d1 * p.d2} = ${s}\nTop × top, bottom × bottom`) : bi(`${p.n1}/${p.d1} ÷ ${p.n2}/${p.d2} = ${p.n1}/${p.d1} × ${p.d2}/${p.n2} = ${s}\nभाग = उल्टो भिन्नले गुणन`, `${p.n1}/${p.d1} ÷ ${p.n2}/${p.d2} = ${p.n1}/${p.d1} × ${p.d2}/${p.n2} = ${s}\nDivide = multiply by the reciprocal`);
  },
  tip: bi('गुणन: दुई भिन्नको क्षेत्र ओभरल्याप हुने सुनौलो भाग; भाग: कतिवटा समूह बन्छ', 'Multiply: the gold overlap is the product. Divide: how many groups fit?'),
  goal: () => { const k = [[1, 2, 2, 3], [3, 4, 2, 5], [2, 3, 3, 4], [1, 2, 1, 2]][rnd(0, 3)]; return { p: { n1: k[0], d1: k[1], n2: k[2], d2: k[3], op: 0 }, np: `${k[0]}/${k[1]} × ${k[2]}/${k[3]} बनाऔँ`, en: `Set up ${k[0]}/${k[1]} × ${k[2]}/${k[3]}`, start: { n1: 1, d1: 2, n2: 1, d2: 2, op: 1 } }; },
  quiz: (i) => {
    const d1 = rnd(2, 8), d2 = rnd(2, 8), n1 = rnd(1, d1), n2 = rnd(1, d2); const mul = i % 2 === 0; const [a, b] = mul ? simp(n1 * n2, d1 * d2) : simp(n1 * d2, d1 * n2); const ans = b === 1 ? String(a) : `${a}/${b}`;
    const wr = [fracS(n1 + n2, d1 + d2), fracS(n1 * d2, d1 * n2) === ans ? fracS(n1 * n2, d1 * d2 * 2) : mul ? fracS(n1 * d2, d1 * n2) : fracS(n1 * n2, d1 * d2), fracS(n1 * n2 + 1, d1 * d2), fracS(n2 * d1, d2 * n1)];
    return choice(`${n1}/${d1} ${mul ? '×' : '÷'} ${n2}/${d2} = ?`, `${n1}/${d1} ${mul ? '×' : '÷'} ${n2}/${d2} = ?`, ans, wr, i, { n1, d1, n2, d2, op: mul ? 0 : 1 });
  },
};
export const FracMulLab6 = makeLab(fracMulCfg);

/* ───────────── decimals ───────────── */
const trim = (x: number) => String(Number(x.toFixed(5)));
export const decShiftCfg: LabCfg = {
  code: 'SIM-MATH-G6-L5-01', chapter: 5, titleNp: 'दशमलव बिन्दु सार्ने', titleEn: 'Decimal Point Mover', color: '#f59e0b',
  params: [{ id: 'd', np: 'सङ्ख्या', en: 'Number', min: 1, max: 9999, step: 25, init: 345, show: (v) => (v / 100).toFixed(2), color: '#0ea5e9' }, { id: 'sh', np: '10 को घात', en: 'Power of 10', min: -3, max: 3, init: 1, show: (v) => (v >= 0 ? `× ${10 ** v}` : `÷ ${10 ** -v}`), color: '#f59e0b' }],
  stage: { camera: [0, 8, 12], target: [0, 1, 0], minDistance: 7, maxDistance: 22 },
  draw: (g, p) => {
    const row = (s: string, z: number, c: string) => [...s].forEach((ch, i) => { const x = (i - (s.length - 1) / 2) * 1.3; tag(g, ch === '.' ? '•' : ch, x, 0.9, z, 1.25, { px: 64, w: 128, h: 128, bg: ch === '.' ? '#fde68a' : '#fff', border: ch === '.' ? '#f59e0b' : c }); box(g, 1.05, 0.12, 1.05, x, 0.06, z, ch === '.' ? '#facc15' : '#e0f2fe', 0.7); });
    const v = p.d / 100; const r = v * 10 ** p.sh; row((v).toFixed(2), -2.4, '#0ea5e9'); row(trim(r), 2.4, '#22c55e');
    tag(g, p.sh >= 0 ? `→ ${p.sh}` : `← ${-p.sh}`, 0, 1.4, 0, 3, { px: 60, w: 256, h: 96, bg: '#fff', border: '#f59e0b' });
  },
  info: (p) => { const v = p.d / 100; const r = trim(v * 10 ** p.sh); return bi(`${v.toFixed(2)} ${p.sh >= 0 ? '×' : '÷'} ${10 ** Math.abs(p.sh)} = ${r}\nदशमलव बिन्दु ${Math.abs(p.sh)} स्थान ${p.sh >= 0 ? 'दायाँ' : 'बायाँ'} सर्छ`, `${v.toFixed(2)} ${p.sh >= 0 ? '×' : '÷'} ${10 ** Math.abs(p.sh)} = ${r}\nThe decimal point moves ${Math.abs(p.sh)} place${Math.abs(p.sh) > 1 ? 's' : ''} to the ${p.sh >= 0 ? 'right' : 'left'}`); },
  tip: bi('10, 100, 1000 ले गुणा वा भाग गर्दा बिन्दु कतातिर सर्छ हेरौँ', 'See where the point goes when you multiply or divide by 10, 100, 1000'),
  goal: () => { const d = 25 * rnd(2, 200), sh = rnd(-3, 3); return { p: { d, sh }, np: `${(d / 100).toFixed(2)} ${sh >= 0 ? '×' : '÷'} ${10 ** Math.abs(sh)} बनाऔँ (= ${trim((d / 100) * 10 ** sh)})`, en: `Set ${(d / 100).toFixed(2)} ${sh >= 0 ? '×' : '÷'} ${10 ** Math.abs(sh)} (= ${trim((d / 100) * 10 ** sh)})`, start: { d: 100, sh: 0 } }; },
  quiz: (i) => {
    const v = rnd(11, 999) / 100; const sh = [1, 2, 3, -1, -2, -3, 1, -1][i]; const r = trim(v * 10 ** sh); const d = Math.round(v * 100);
    const wr = [trim(v * 10 ** (sh + 1)), trim(v * 10 ** (sh - 1)), trim(v * 10 ** (-sh)), trim(v * 10 ** (sh + 2))];
    return choice(`${v} ${sh > 0 ? '×' : '÷'} ${10 ** Math.abs(sh)} = ?`, `${v} ${sh > 0 ? '×' : '÷'} ${10 ** Math.abs(sh)} = ?`, r, wr, i, { d: Math.min(9999, Math.max(1, d)), sh });
  },
};
export const DecimalShift6 = makeLab(decShiftCfg);

export const decMulCfg: LabCfg = {
  code: 'SIM-MATH-G6-L5-02', chapter: 5, titleNp: 'दशमलव गुणन ग्रिड', titleEn: 'Decimal Multiplication Grid', color: '#8b5cf6',
  params: [{ id: 'a', np: 'लम्बाइ (दशांश)', en: 'Length (tenths)', min: 1, max: 30, init: 12, show: (v) => (v / 10).toFixed(1), color: '#0ea5e9' }, { id: 'b', np: 'चौडाइ (दशांश)', en: 'Width (tenths)', min: 1, max: 30, init: 5, show: (v) => (v / 10).toFixed(1), color: '#ef4444' }],
  stage: { camera: [0, 13, 10], target: [0, 0, 0], minDistance: 7, maxDistance: 26 },
  draw: (g, p) => {
    const u = 0.32; tiles(g, p.a, p.b, '#a78bfa', u, 0, 0, '#c4b5fd'); const w = p.a * u / 2, h = p.b * u / 2; outline(g, [[-w, -h], [w, -h], [w, h], [-w, h]], '#5b21b6', 0.2, 0.1);
    for (let k = 10; k < p.a; k += 10) box(g, 0.05, 0.3, p.b * u, (k - p.a / 2) * u, 0.2, 0, '#facc15'); for (let k = 10; k < p.b; k += 10) box(g, p.a * u, 0.3, 0.05, 0, 0.2, (k - p.b / 2) * u, '#facc15');
    tag(g, (p.a / 10).toFixed(1), 0, 0.4, h + 0.8, 2, { px: 56, color: '#0369a1' }); tag(g, (p.b / 10).toFixed(1), w + 1, 0.4, 0, 2, { px: 56, color: '#be123c' });
    tag(g, `${(p.a / 10).toFixed(1)} × ${(p.b / 10).toFixed(1)} = ${((p.a * p.b) / 100).toFixed(2)}`, 0, 0.5, -h - 1.2, 5, { px: 56, w: 560, h: 96, bg: '#fff', border: '#8b5cf6' });
  },
  info: (p) => bi(`${(p.a / 10).toFixed(1)} × ${(p.b / 10).toFixed(1)} = ${p.a} × ${p.b} ÷ 100 = ${p.a * p.b} ÷ 100 = ${((p.a * p.b) / 100).toFixed(2)}\nप्रत्येक सानो खाना = 0.01`, `${(p.a / 10).toFixed(1)} × ${(p.b / 10).toFixed(1)} = ${p.a} × ${p.b} ÷ 100 = ${p.a * p.b} ÷ 100 = ${((p.a * p.b) / 100).toFixed(2)}\nEach small square is 0.01`),
  tip: bi('क्षेत्रफलका सानासाना खाना गनेर दशमलव गुणन गरौँ', 'Count the small squares of the rectangle to multiply decimals'),
  goal: () => { const a = rnd(2, 25), b = rnd(2, 15); return { p: { a, b }, np: `${(a / 10).toFixed(1)} × ${(b / 10).toFixed(1)} बनाऔँ`, en: `Set ${(a / 10).toFixed(1)} × ${(b / 10).toFixed(1)}`, start: { a: 10, b: 10 } }; },
  quiz: (i) => {
    const a = rnd(2, 30), b = rnd(2, 12); const pr = (a * b) / 100;
    if (i < 5) return choice(`${(a / 10).toFixed(1)} × ${(b / 10).toFixed(1)} = ?`, `${(a / 10).toFixed(1)} × ${(b / 10).toFixed(1)} = ?`, pr.toFixed(2), [(pr * 10).toFixed(2), (pr / 10).toFixed(3), (pr + 0.1).toFixed(2), (pr * 100).toFixed(2)], i, { a, b });
    if (i === 5) { const q = rnd(2, 9), x = rnd(11, 99); return choice(`${(x * q) / 10} ÷ ${q} = ?`, `${(x * q) / 10} ÷ ${q} = ?`, (x / 10).toFixed(1), [(x / 100).toFixed(2), String(x), ((x + 1) / 10).toFixed(1)], i); }
    if (i === 6) return choice('0.4 × 0.3 = ?', '0.4 × 0.3 = ?', '0.12', ['1.2', '0.012', '0.7'], i, { a: 4, b: 3 });
    return choice('1.5 × 10 = ?', '1.5 × 10 = ?', '15', ['1.50', '150', '0.15'], i);
  },
};
export const DecimalMul6 = makeLab(decMulCfg);

export const Percent6 = makeLab(percentCfg({ code: 'SIM-MATH-G6-L6-01', chapter: 6, titleNp: 'प्रतिशत प्रयोगशाला', titleEn: 'Percentage Lab', six: true }));

/* ───────────── profit and loss ───────────── */
export const profitCfg: LabCfg = {
  code: 'SIM-MATH-G6-L7-01', chapter: 7, titleNp: 'नाफा र नोक्सान', titleEn: 'Profit and Loss', color: '#22c55e',
  params: [{ id: 'cp', np: 'लागत मूल्य', en: 'Cost price', min: 50, max: 500, step: 10, init: 200, color: '#0ea5e9' }, { id: 'sp', np: 'बिक्री मूल्य', en: 'Selling price', min: 50, max: 600, step: 10, init: 250, color: '#22c55e' }],
  stage: { camera: [0, 8, 15], target: [0, 3.6, 0], minDistance: 8, maxDistance: 28 },
  draw: (g, p, lang) => {
    for (let k = 0; k < p.cp / 10; k++) box(g, 2.4, 0.28, 2.4, -3.5, 0.2 + k * 0.3, 0, '#38bdf8', 0.4);
    const lo = Math.min(p.cp, p.sp) / 10; for (let k = 0; k < p.sp / 10; k++) box(g, 2.4, 0.28, 2.4, 3.5, 0.2 + k * 0.3, 0, k < lo ? '#4ade80' : p.sp > p.cp ? '#facc15' : '#f87171', 0.4);
    tag(g, `${lang === 'ne' ? 'लागत' : 'CP'} ${p.cp}`, -3.5, -0.6, 2, 3, { px: 50, w: 320, h: 80 }); tag(g, `${lang === 'ne' ? 'बिक्री' : 'SP'} ${p.sp}`, 3.5, -0.6, 2, 3, { px: 50, w: 320, h: 80 });
    const d = p.sp - p.cp; tag(g, d === 0 ? (lang === 'ne' ? 'न नाफा न नोक्सान' : 'No profit, no loss') : `${d > 0 ? (lang === 'ne' ? 'नाफा' : 'Profit') : lang === 'ne' ? 'नोक्सान' : 'Loss'} Rs ${Math.abs(d)}`, 0, 9.2, 0, 4.4, { px: 54, w: 480, h: 96, bg: '#fff', border: d > 0 ? '#facc15' : d < 0 ? '#ef4444' : '#94a3b8' });
  },
  info: (p) => { const d = p.sp - p.cp; const pc = ((Math.abs(d) / p.cp) * 100).toFixed(1).replace('.0', ''); return bi(d === 0 ? 'लागत = बिक्री: न नाफा न नोक्सान' : `${d > 0 ? 'नाफा' : 'नोक्सान'} = ${d > 0 ? 'ब.मू.' : 'ला.मू.'} − ${d > 0 ? 'ला.मू.' : 'ब.मू.'} = ${Math.abs(d)}\n${d > 0 ? 'नाफा' : 'नोक्सान'} % = ${Math.abs(d)}/${p.cp} × 100 = ${pc}%`, d === 0 ? 'CP = SP: no profit, no loss' : `${d > 0 ? 'Profit' : 'Loss'} = ${d > 0 ? 'SP − CP' : 'CP − SP'} = ${Math.abs(d)}\n${d > 0 ? 'Profit' : 'Loss'} % = ${Math.abs(d)}/${p.cp} × 100 = ${pc}%`); },
  tip: bi('लागत र बिक्री मूल्य बदलेर नाफा वा नोक्सान हेरौँ', 'Change the cost and selling price to see profit or loss'),
  goal: () => { const cp = 10 * rnd(10, 40), pc = [10, 20, 25, 50][rnd(0, 3)]; const sp = (cp * (100 + pc)) / 100; return { p: { cp, sp: Math.min(600, Math.round(sp / 10) * 10) }, np: `ला.मू. ${cp} मा लगभग ${pc}% नाफा हुने बिक्री मूल्य राखौँ (${sp})`, en: `Set the selling price for about ${pc}% profit on CP ${cp} (${sp})`, start: { cp, sp: cp } }; },
  quiz: (i) => {
    const cp = 100 * rnd(1, 5), pr = [10, 20, 25, 50][rnd(0, 3)]; const sp = (cp * (100 + pr)) / 100; const ls = (cp * (100 - pr)) / 100;
    if (i === 0) return numChoice(`ला.मू. रु ${cp}, ब.मू. रु ${sp} भए नाफा कति?`, `CP Rs ${cp}, SP Rs ${sp}. What is the profit?`, sp - cp, i, [10, -10, 5, 20, cp], 1, '', { cp, sp: Math.min(600, sp) });
    if (i === 1) return numChoice(`ला.मू. रु ${cp}, ब.मू. रु ${ls} भए नोक्सान कति?`, `CP Rs ${cp}, SP Rs ${ls}. What is the loss?`, cp - ls, i, [10, -10, 5, 20, cp], 1, '', { cp, sp: Math.max(50, ls) });
    if (i === 2) return numChoice(`ला.मू. रु ${cp} मा रु ${sp - cp} नाफा भए नाफा % कति?`, `A profit of Rs ${sp - cp} on CP Rs ${cp}. Profit %?`, pr, i, [5, -5, 10, 20, 15], 1, '%');
    if (i === 3) return numChoice(`ला.मू. रु ${cp} मा ${pr}% नाफा भए ब.मू. कति?`, `CP Rs ${cp} with ${pr}% profit. SP?`, sp, i, [10, -10, 20, pr, -20], 1, '');
    if (i === 4) return numChoice(`ला.मू. रु ${cp} मा ${pr}% नोक्सान भए ब.मू. कति?`, `CP Rs ${cp} with ${pr}% loss. SP?`, ls, i, [10, -10, 20, pr, -20], 1, '');
    if (i === 5) return choice(`ब.मू. ला.मू. भन्दा बढी भए के हुन्छ?`, 'If SP is more than CP, there is a…', 'profit', ['loss', 'nothing'], i);
    if (i === 6) return numChoice(`सामान रु ${cp} मा किनी रु ${cp + 50} मा बेच्दा नाफा कति?`, `Bought for Rs ${cp}, sold for Rs ${cp + 50}. Profit?`, 50, i, [5, -5, 10, 100, 25], 1);
    return numChoice(`नाफा % = (नाफा ÷ ला.मू.) × 100। नाफा रु ${cp / 4}, ला.मू. रु ${cp} भए नाफा %?`, `Profit % = (profit ÷ CP) × 100. Profit Rs ${cp / 4}, CP Rs ${cp}. Profit %?`, 25, i, [5, -5, 10, 20, 15], 1, '%');
  },
};
export const ProfitLoss6 = makeLab(profitCfg);

/* ───────────── unitary method ───────────── */
export const unitaryCfg: LabCfg = {
  code: 'SIM-MATH-G6-L8-01', chapter: 8, titleNp: 'ऐकिक नियम', titleEn: 'Unitary Method', color: '#0ea5e9',
  params: [{ id: 'q1', np: 'दिइएको सङ्ख्या', en: 'Given items', min: 2, max: 10, init: 4, color: '#0ea5e9' }, { id: 'u', np: 'एकको मूल्य', en: 'Price of one', min: 5, max: 50, step: 5, init: 15, color: '#f59e0b' }, { id: 'q2', np: 'चाहिएको सङ्ख्या', en: 'Items wanted', min: 1, max: 15, init: 7, color: '#22c55e' }],
  stage: { camera: [0, 8, 15], target: [0, 2, 0], minDistance: 8, maxDistance: 26 },
  draw: (g, p, lang) => {
    for (let k = 0; k < p.q1; k++) box(g, 1.1, 1.1, 1.1, -9 + (k % 5) * 1.3, 0.6 + Math.floor(k / 5) * 1.25, 0, '#38bdf8', 0.4);
    for (let k = 0; k < p.q2; k++) box(g, 1.1, 1.1, 1.1, 3 + (k % 5) * 1.3, 0.6 + Math.floor(k / 5) * 1.25, 0, '#4ade80', 0.4);
    tag(g, `${p.q1} → Rs ${p.q1 * p.u}`, -6, 4.4, 0, 4, { px: 52, w: 400, h: 96, bg: '#fff', border: '#0ea5e9' }); tag(g, `${p.q2} → Rs ${p.q2 * p.u}`, 6, 4.4, 0, 4, { px: 52, w: 400, h: 96, bg: '#fff', border: '#22c55e' });
    tag(g, `1 → Rs ${p.u}`, 0, 0.5, 3.2, 3.6, { px: 54, w: 400, h: 96, bg: '#fef9c3', border: '#f59e0b' }); tag(g, lang === 'ne' ? 'पहिले एकको मूल्य निकालौँ' : 'First find the price of one', 0, 6.4, 0, 5, { px: 44, w: 520, h: 80 });
  },
  info: (p) => bi(`${p.q1} वटाको मूल्य रु ${p.q1 * p.u}\n1 वटाको मूल्य = ${p.q1 * p.u} ÷ ${p.q1} = रु ${p.u} → ${p.q2} वटाको = ${p.u} × ${p.q2} = रु ${p.q2 * p.u}`, `${p.q1} items cost Rs ${p.q1 * p.u}\nOne item = ${p.q1 * p.u} ÷ ${p.q1} = Rs ${p.u} → ${p.q2} items = ${p.u} × ${p.q2} = Rs ${p.q2 * p.u}`),
  tip: bi('पहिले एकको मूल्य निकालेर चाहिएको सङ्ख्याको मूल्य हिसाब गरौँ', 'Find the price of one, then the price of what you want'),
  goal: () => { const q1 = rnd(2, 9), u = 5 * rnd(1, 10), q2 = rnd(1, 15); return { p: { q1, u, q2 }, np: `${q1} वटाको रु ${q1 * u} भए ${q2} वटाको रु ${q2 * u} हुने बनाऔँ`, en: `Show ${q1} items for Rs ${q1 * u}, so ${q2} items cost Rs ${q2 * u}`, start: { q1: 2, u: 5, q2: 1 } }; },
  quiz: (i) => {
    const q1 = rnd(2, 9), u = 5 * rnd(1, 10), q2 = rnd(2, 15); const set = { q1, u, q2 };
    if (i < 2) return numChoice(`${q1} कलमको मूल्य रु ${q1 * u} भए 1 कलमको मूल्य कति?`, `${q1} pens cost Rs ${q1 * u}. Price of 1 pen?`, u, i, [5, -5, 10, q1, 15], 1, '', set);
    if (i < 5) return numChoice(`${q1} कपीको मूल्य रु ${q1 * u} भए ${q2} कपीको मूल्य कति?`, `${q1} copies cost Rs ${q1 * u}. Cost of ${q2} copies?`, q2 * u, i, [u, -u, 2 * u, 10, 5 * u], 1, '', set);
    if (i === 5) return numChoice(`6 किलो चामलको रु ${6 * u} भए 10 किलोको मूल्य?`, `6 kg of rice costs Rs ${6 * u}. Cost of 10 kg?`, 10 * u, i, [u, -u, 2 * u, 10, 5 * u], 1);
    if (i === 6) return numChoice(`${q1} पेन्सिल रु ${q1 * u} मा किनिन्छ; रु ${q2 * u} मा कति पेन्सिल आउँछ?`, `${q1} pencils cost Rs ${q1 * u}. How many for Rs ${q2 * u}?`, q2, i, [1, -1, 2, 3, q1], 1, '', set);
    return numChoice(`4 घण्टामा ${4 * (u / 5) * 12} किमी जाने सवारी 1 घण्टामा कति किमी जान्छ?`, `A vehicle goes ${4 * (u / 5) * 12} km in 4 hours. How far in 1 hour?`, (u / 5) * 12, i, [1, -1, 2, 12, 6], 1);
  },
};
export const UnitaryLab6 = makeLab(unitaryCfg);
