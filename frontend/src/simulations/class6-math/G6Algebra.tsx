/**
 * Class 6 lessons 11 · Indices, 12 · Algebraic expression, 13 · Equation, inequality and graph.
 */
import { rnd } from '../class1-math-kit/nepali';
import { makeLab, LabCfg } from '../class5-math/Lab';
import { bi, choice, numChoice } from '../class5-math/h5';
import { algebraCfg, likeTermsCfg } from '../class5-math/G5Data';
import { box, tag, rod, cubeBlock, disc } from '../class5-math/vis';

/* ───────────── indices ───────────── */
const dims = (b: number, e: number): [number, number, number] => [[1, 1, 1], [b, 1, 1], [b, b, 1], [b, b, b], [b * b, b, b], [b * b, b * b, b]][e] as [number, number, number];
export const indicesCfg: LabCfg = {
  code: 'SIM-MATH-G6-L11-01', chapter: 11, titleNp: 'घाताङ्क ब्लक', titleEn: 'Power Blocks', color: '#f97316',
  params: [{ id: 'b', np: 'आधार', en: 'Base', min: 2, max: 6, init: 3, color: '#f97316' }, { id: 'e', np: 'घाताङ्क', en: 'Index', min: 0, max: 5, init: 3, color: '#8b5cf6' }],
  stage: { camera: [10, 9, 14], target: [0, 2.5, 0], minDistance: 7, maxDistance: 28 },
  fix: (p) => { let e = p.e; while (p.b ** e > 400 && e > 0) e--; return { ...p, e }; },
  draw: (g, p, lang) => {
    const [l, b, h] = dims(p.b, p.e); const u = Math.min(0.9, 9 / Math.max(l, b, h)); cubeBlock(g, l, b, h, ['#fb923c', '#a78bfa', '#4ade80', '#38bdf8', '#f472b6', '#facc15'][p.e], u);
    tag(g, `${p.b}^${p.e} = ${p.b ** p.e}`, 0, h * u + 1.6, 0, 5, { px: 60, w: 560, h: 96, bg: '#fff', border: '#f97316' }); void lang;
  },
  info: (p) => bi(`${p.b}^${p.e} = ${p.e === 0 ? '1' : Array(p.e).fill(p.b).join(' × ')} = ${p.b ** p.e}\n${p.b} आधार, ${p.e} घाताङ्क · a⁰ = 1 · aᵐ × aⁿ = aᵐ⁺ⁿ`, `${p.b}^${p.e} = ${p.e === 0 ? '1' : Array(p.e).fill(p.b).join(' × ')} = ${p.b ** p.e}\nBase ${p.b}, index ${p.e} · a⁰ = 1 · aᵐ × aⁿ = aᵐ⁺ⁿ`),
  tip: bi('घाताङ्क बढाउँदा ब्लक कसरी ठूलो हुन्छ हेरौँ: ², ³ ...', 'Raise the index and watch the blocks grow: squares, cubes …'),
  goal: () => { const b = rnd(2, 5), e = rnd(2, 4); const v = b ** e; return { p: { b, e: v > 400 ? 3 : e }, np: `${b}^${e} बनाऔँ (= ${v})`, en: `Build ${b}^${e} (= ${v})`, start: { b: 2, e: 1 } }; },
  quiz: (i) => {
    const b = rnd(2, 5), e = rnd(2, 4); const m = rnd(2, 4), n = rnd(2, 4);
    if (i < 2) return numChoice(`${b}^${e} = ?`, `${b}^${e} = ?`, b ** e, i, [b, -b, e * b, b + e, b ** (e - 1)], 1, '', { b, e: b ** e > 400 ? 3 : e });
    if (i === 2) return choice(`${b}^${m} × ${b}^${n} = ?`, `${b}^${m} × ${b}^${n} = ?`, `${b}^${m + n}`, [`${b}^${m * n}`, `${b * b}^${m + n}`, `${b}^${Math.abs(m - n) || 1}`], i);
    if (i === 3) return choice(`${b}^${m + n} ÷ ${b}^${n} = ?`, `${b}^${m + n} ÷ ${b}^${n} = ?`, `${b}^${m}`, [`${b}^${m + 2 * n}`, `${b}^${m * n}`, `1^${m}`], i);
    if (i === 4) return choice(`(${b}^${m})^${n} = ?`, `(${b}^${m})^${n} = ?`, `${b}^${m * n}`, [`${b}^${m + n}`, `${b}^${m ** n}`, `${b * n}^${m}`], i);
    if (i === 5) return choice(`${b}⁰ = ?`, `${b}⁰ = ?`, '1', ['0', String(b), 'परिभाषित छैन | undefined'], i);
    if (i === 6) return numChoice(`१०^${n} मा कतिवटा शून्य हुन्छन्?`, `How many zeros are in 10^${n}?`, n, i, [1, -1, 2, 10, -2], 1);
    return choice(`${b}×${b}×${b}×${b} लाई घाताङ्कमा लेख्दा?`, `Write ${b}×${b}×${b}×${b} using an index`, `${b}^4`, [`${b}^3`, `4^${b}`, `${b}×4`], i);
  },
};
export const IndicesLab6 = makeLab(indicesCfg);

/* ───────────── algebraic expressions ───────────── */
export const exprMulCfg: LabCfg = {
  code: 'SIM-MATH-G6-L12-01', chapter: 12, titleNp: 'क्षेत्रफल मोडल: (x+a)(x+b)', titleEn: 'Area Model: (x+a)(x+b)', color: '#8b5cf6',
  params: [{ id: 'a', np: 'a', en: 'a', min: 1, max: 6, init: 2, color: '#f59e0b' }, { id: 'b', np: 'b', en: 'b', min: 1, max: 6, init: 3, color: '#ef4444' }],
  stage: { camera: [0, 13, 9], target: [0, 0, 0], minDistance: 7, maxDistance: 24 },
  draw: (g, p, lang) => {
    const X = 4, u = 1; box(g, X, 0.3, X, -(p.a * u) / 2, 0.15, -(p.b * u) / 2, '#a78bfa'); tag(g, 'x²', -(p.a * u) / 2, 0.7, -(p.b * u) / 2, 1.8, { px: 70, w: 128, h: 96 });
    for (let k = 0; k < p.b; k++) box(g, X * 0.96, 0.3, 0.92, -(p.a * u) / 2, 0.15, X / 2 + (p.b * 0 + k + 0.5) * u - (p.b * u) / 2, '#fb923c');
    for (let k = 0; k < p.a; k++) box(g, 0.92, 0.3, X * 0.96, X / 2 + (k + 0.5) * u - (p.a * u) / 2, 0.15, -(p.b * u) / 2, '#fb923c');
    for (let i = 0; i < p.a; i++) for (let j = 0; j < p.b; j++) box(g, 0.92, 0.3, 0.92, X / 2 + (i + 0.5) * u - (p.a * u) / 2, 0.15, X / 2 + (j + 0.5) * u - (p.b * u) / 2, '#facc15');
    tag(g, `${p.b}x`, -(p.a * u) / 2, 0.6, X / 2 + (p.b * u) / 2 + 0.8 - (p.b * u) / 2 + 0.2, 1.6, { px: 54, w: 160, h: 80, color: '#c2410c' }); tag(g, `${p.a}x`, X / 2 + (p.a * u) / 2 + 1 - (p.a * u) / 2, 0.6, -(p.b * u) / 2, 1.6, { px: 54, w: 160, h: 80, color: '#c2410c' });
    tag(g, `(x + ${p.a})(x + ${p.b}) = x² + ${p.a + p.b}x + ${p.a * p.b}`, 0, 0.6, X / 2 + p.b * u + 1.6 - (p.b * u) / 2, 7, { px: 50, w: 760, h: 96, bg: '#fff', border: '#8b5cf6' }); void lang;
  },
  info: (p) => bi(`(x + ${p.a})(x + ${p.b}) = x² + ${p.b}x + ${p.a}x + ${p.a * p.b} = x² + ${p.a + p.b}x + ${p.a * p.b}\nचार भाग: x², ${p.b}x, ${p.a}x र ${p.a}×${p.b}`, `(x + ${p.a})(x + ${p.b}) = x² + ${p.b}x + ${p.a}x + ${p.a * p.b} = x² + ${p.a + p.b}x + ${p.a * p.b}\nFour parts: x², ${p.b}x, ${p.a}x and ${p.a}×${p.b}`),
  tip: bi('आयतका चार टुक्राबाट (x+a)(x+b) को गुणन देखौँ', 'The four parts of the rectangle give the product (x+a)(x+b)'),
  goal: () => { const a = rnd(1, 6), b = rnd(1, 6); return { p: { a, b }, np: `x² + ${a + b}x + ${a * b} बन्ने (x + ${a})(x + ${b}) राखौँ (a ≤ b होइन; दुवै मिल्नुपर्छ)`, en: `Set a = ${a} and b = ${b} to make x² + ${a + b}x + ${a * b}`, start: { a: 1, b: 1 } }; },
  quiz: (i) => {
    const a = rnd(1, 6), b = rnd(1, 6);
    if (i < 4) return choice(`(x + ${a})(x + ${b}) = ?`, `(x + ${a})(x + ${b}) = ?`, `x² + ${a + b}x + ${a * b}`, [`x² + ${a * b}x + ${a + b}`, `x² + ${a + b}x + ${a + b}`, `2x + ${a + b}`], i, { a, b });
    if (i === 4) return choice(`(x + ${a})² = ?`, `(x + ${a})² = ?`, `x² + ${2 * a}x + ${a * a}`, [`x² + ${a * a}`, `x² + ${a}x + ${a * a}`, `x² + ${2 * a}x + ${2 * a}`], i, { a, b: a });
    if (i === 5) return choice(`${a}(x + ${b}) = ?`, `${a}(x + ${b}) = ?`, `${a}x + ${a * b}`, [`${a}x + ${b}`, `x + ${a * b}`, `${a + b}x`], i);
    if (i === 6) return numChoice(`x = 2 हुँदा (x + ${a})(x + ${b}) को मान?`, `Value of (x + ${a})(x + ${b}) when x = 2?`, (2 + a) * (2 + b), i, [1, -1, a, b, 4], 1);
    return choice(`${a}x × ${b}x = ?`, `${a}x × ${b}x = ?`, `${a * b}x²`, [`${a * b}x`, `${a + b}x²`, `${a * b}x³`], i);
  },
};
export const ExprMulLab6 = makeLab(exprMulCfg);
export const AlgebraLab6 = makeLab(algebraCfg({ code: 'SIM-MATH-G6-L12-02', chapter: 12, titleNp: 'बीजीय पदको मान', titleEn: 'Algebra Blocks' }));
export const LikeTermsLab6 = makeLab(likeTermsCfg({ code: 'SIM-MATH-G6-L12-03', chapter: 12, titleNp: 'बीजीय अभिव्यक्तिको जोड', titleEn: 'Adding Expressions' }));

/* ───────────── equation balance ───────────── */
export const equationCfg: LabCfg = {
  code: 'SIM-MATH-G6-L13-01', chapter: 13, titleNp: 'समीकरण तराजु', titleEn: 'Equation Balance', color: '#22c55e',
  params: [
    { id: 'f', np: 'प्रकार', en: 'Kind', min: 0, max: 1, init: 0, names: [{ np: 'x + a = c', en: 'x + a = c' }, { np: 'a x = c', en: 'a x = c' }] },
    { id: 'a', np: 'a', en: 'a', min: 1, max: 6, init: 3, color: '#f59e0b' }, { id: 'x', np: 'x को उत्तर', en: 'Answer x', min: 1, max: 8, init: 4, color: '#8b5cf6' },
    { id: 'st', np: 'चरण', en: 'Step', min: 0, max: 1, init: 0, names: [{ np: 'समीकरण', en: 'Equation' }, { np: 'हल', en: 'Solved' }] },
  ],
  stage: { camera: [0, 6, 15], target: [0, 3, 0], minDistance: 8, maxDistance: 26 },
  fix: (p) => (p.f === 1 ? { ...p, a: Math.max(2, p.a), x: Math.min(p.x, 6) } : p),
  draw: (g, p, lang) => {
    box(g, 0.5, 4, 0.5, 0, 2, 0, '#64748b'); box(g, 15, 0.3, 0.5, 0, 4.1, 0, '#334155'); box(g, 5.6, 0.2, 2.2, -5.4, 3.1, 0, '#cbd5e1'); box(g, 5.6, 0.2, 2.2, 5.4, 3.1, 0, '#cbd5e1');
    const xb = (x: number, y: number) => { box(g, 1.3, 1.1, 1.3, x, y, 0, '#a78bfa', 0.4); tag(g, 'x', x, y, 0.8, 0.9, { px: 60, w: 96, h: 96, color: '#fff' }); };
    const cu = (x: number, y: number, c = '#facc15') => box(g, 0.7, 0.7, 0.7, x, y, 0, c, 0.4);
    if (p.f === 0) {
      const c = p.x + p.a; if (p.st === 0) { xb(-6.5, 3.8); for (let k = 0; k < p.a; k++) cu(-4.9 + (k % 4) * 0.8, 3.55 + Math.floor(k / 4) * 0.8); for (let k = 0; k < c; k++) cu(3 + (k % 6) * 0.8, 3.55 + Math.floor(k / 6) * 0.8, '#fbbf24'); }
      else { xb(-5.4, 3.8); for (let k = 0; k < p.x; k++) cu(3 + (k % 6) * 0.8, 3.55 + Math.floor(k / 6) * 0.8, '#fbbf24'); }
      tag(g, p.st === 0 ? `x + ${p.a} = ${c}` : `x = ${c} − ${p.a} = ${p.x}`, 0, 7.4, 0, 5.6, { px: 60, w: 600, h: 96, bg: '#fff', border: '#22c55e' });
    } else {
      const c = p.a * p.x; if (p.st === 0) { for (let k = 0; k < p.a; k++) xb(-7.6 + k * 1.5, 3.8); for (let k = 0; k < c; k++) cu(3 + (k % 8) * 0.7, 3.55 + Math.floor(k / 8) * 0.8, '#fbbf24'); }
      else { xb(-5.4, 3.8); for (let k = 0; k < p.x; k++) cu(3 + (k % 6) * 0.8, 3.55 + Math.floor(k / 6) * 0.8, '#fbbf24'); }
      tag(g, p.st === 0 ? `${p.a}x = ${c}` : `x = ${c} ÷ ${p.a} = ${p.x}`, 0, 7.4, 0, 5.6, { px: 60, w: 600, h: 96, bg: '#fff', border: '#22c55e' });
    }
    void lang;
  },
  info: (p) => { const c = p.f === 0 ? p.x + p.a : p.a * p.x; return bi(p.f === 0 ? `x + ${p.a} = ${c} → दुवैतिर ${p.a} घटाउँदा x = ${p.x}\nतराजु सन्तुलित राख्न दुवैतिर बराबर गर्ने` : `${p.a}x = ${c} → दुवैतिर ${p.a} ले भाग गर्दा x = ${p.x}\nतराजु सन्तुलित राख्न दुवैतिर बराबर गर्ने`, p.f === 0 ? `x + ${p.a} = ${c} → take ${p.a} from both sides: x = ${p.x}\nDo the same to both sides to keep the balance` : `${p.a}x = ${c} → divide both sides by ${p.a}: x = ${p.x}\nDo the same to both sides to keep the balance`); },
  tip: bi('दुवैतिरबाट बराबर हटाएर x एक्लो पारौँ', 'Do the same to both pans until x is alone'),
  goal: () => { const f = rnd(0, 1), a = rnd(2, 6), x = rnd(1, 6); const c = f === 0 ? x + a : a * x; return { p: { f, a, x, st: 1 }, np: `${f === 0 ? `x + ${a}` : `${a}x`} = ${c} हल गरी "हल" चरणमा पुगौँ`, en: `Solve ${f === 0 ? `x + ${a}` : `${a}x`} = ${c} and show the Solved step`, start: { f, a, x, st: 0 } }; },
  quiz: (i) => {
    const a = rnd(2, 9), x = rnd(2, 9); const c1 = x + a, c2 = a * x;
    if (i < 3) return numChoice(`x + ${a} = ${c1} भए x = ?`, `If x + ${a} = ${c1}, x = ?`, x, i, [1, -1, a, 2, -a], 0, '', { f: 0, a: Math.min(a, 6), x: Math.min(x, 8), st: 0 });
    if (i < 6) return numChoice(`${a}x = ${c2} भए x = ?`, `If ${a}x = ${c2}, x = ?`, x, i, [1, -1, a, 2, c2 - a], 0, '', { f: 1, a: Math.min(a, 6), x: Math.min(x, 6), st: 0 });
    if (i === 6) return numChoice(`x − ${a} = ${x} भए x = ?`, `If x − ${a} = ${x}, x = ?`, x + a, i, [1, -1, a, 2, -a], 0);
    return numChoice(`एउटा सङ्ख्याको ${a} गुणा ${c2} छ भने सङ्ख्या कति?`, `${a} times a number is ${c2}. What is the number?`, x, i, [1, -1, a, 2, 3], 0);
  },
};
export const EquationLab6 = makeLab(equationCfg);

/* ───────────── inequality ───────────── */
const INEQ = [{ np: 'x > k', en: 'x > k', s: '>' }, { np: 'x ≥ k', en: 'x ≥ k', s: '≥' }, { np: 'x < k', en: 'x < k', s: '<' }, { np: 'x ≤ k', en: 'x ≤ k', s: '≤' }];
const holds = (t: number, k: number, ty: number) => [t > k, t >= k, t < k, t <= k][ty];
export const inequalityCfg: LabCfg = {
  code: 'SIM-MATH-G6-L13-02', chapter: 13, titleNp: 'असमानता सङ्ख्यारेखा', titleEn: 'Inequality Number Line', color: '#0ea5e9',
  params: [{ id: 'ty', np: 'चिह्न', en: 'Sign', min: 0, max: 3, init: 0, names: INEQ }, { id: 'k', np: 'k', en: 'k', min: -5, max: 10, init: 3, color: '#0ea5e9' }, { id: 't', np: 'जाँच सङ्ख्या', en: 'Test number', min: -8, max: 14, init: 5, color: '#f59e0b' }],
  stage: { camera: [0, 7, 14], target: [0, 0, 0], minDistance: 7, maxDistance: 26 },
  draw: (g, p) => {
    const X = (v: number) => (v - 3) * 0.95; box(g, 22 * 0.95, 0.15, 0.3, 0, 0.08, 0, '#334155');
    for (let v = -8; v <= 14; v++) { box(g, 0.05, 0.5, 0.05, X(v), 0.3, 0, '#334155'); if (v % 2 === 0) tag(g, String(v), X(v), -0.8, 1.2, 1.3, { px: 52, w: 128, h: 64 }); }
    const right = p.ty < 2; const end = right ? 14.6 : -8.6; rod(g, [X(p.k), 0.7, 0], [X(end), 0.7, 0], '#22c55e', 0.22); const closed = p.ty === 1 || p.ty === 3;
    disc(g, 0.42, closed ? '#16a34a' : '#ffffff', X(p.k), 0.7, 0);
    if (!closed) disc(g, 0.46, '#16a34a', X(p.k), 0.7, 0, 0.5);
    const ok = holds(p.t, p.k, p.ty); box(g, 0.7, 0.7, 0.7, X(p.t), 1.7, 0, ok ? '#22c55e' : '#ef4444', 0.3); tag(g, `${p.t} ${ok ? '✓' : '✗'}`, X(p.t), 3, 0, 1.8, { px: 56, w: 192, h: 80, bg: '#fff', border: ok ? '#22c55e' : '#ef4444' });
    tag(g, `x ${INEQ[p.ty].s} ${p.k}`, 0, 5.2, 0, 4, { px: 64, w: 400, h: 96, bg: '#fff', border: '#0ea5e9' });
  },
  info: (p) => { const ok = holds(p.t, p.k, p.ty); return bi(`x ${INEQ[p.ty].s} ${p.k}\n${p.t} ${ok ? 'हल हो ✓' : 'हल होइन ✗'} · ${p.ty === 1 || p.ty === 3 ? 'भरिएको बिन्दु = k समेत' : 'खाली बिन्दु = k समावेश छैन'}`, `x ${INEQ[p.ty].s} ${p.k}\n${p.t} ${ok ? 'is a solution ✓' : 'is not a solution ✗'} · ${p.ty === 1 || p.ty === 3 ? 'filled dot = k is included' : 'open dot = k is not included'}`); },
  tip: bi('चिह्न र k बदलेर हल हुने भाग हेरौँ र सङ्ख्या जाँचौँ', 'Change the sign and k, then test numbers on the line'),
  goal: () => { const ty = rnd(0, 3), k = rnd(-4, 8); const t = ty < 2 ? k + 2 : k - 2; return { p: { ty, k, t }, np: `x ${INEQ[ty].s} ${k} बनाई ${t} हल हुने बनाऔँ`, en: `Set x ${INEQ[ty].s} ${k} so that ${t} is a solution`, start: { ty: (ty + 1) % 4, k: 0, t: 0 } }; },
  quiz: (i) => {
    const ty = rnd(0, 3), k = rnd(-3, 8); const t = rnd(k - 3, k + 3); const ok = holds(t, k, ty);
    if (i < 3) return choice(`x ${INEQ[ty].s} ${k} मा ${t} हल हो?`, `Is ${t} a solution of x ${INEQ[ty].s} ${k}?`, ok ? 'हो | Yes' : 'होइन | No', [ok ? 'होइन | No' : 'हो | Yes'], i, { ty, k, t });
    if (i === 3) return choice('रेखामा भरिएको बिन्दुले के जनाउँछ?', 'What does a filled dot on the line mean?', 'k समावेश | k is included', ['k समावेश छैन | k is not included', 'सङ्ख्या ऋणात्मक | the number is negative'], i, { ty: 1, k, t: k });
    if (i === 4) return choice(`तल देखाइएको असमानता कुन हो?`, 'Which inequality is shown on the line?', `x ${INEQ[ty].s} ${k}`, INEQ.filter((_x, j) => j !== ty).map((x) => `x ${x.s} ${k}`), i, { ty, k, t });
    if (i === 5) return numChoice(`x > ${k} मा सबैभन्दा सानो पूर्ण सङ्ख्या कति?`, `Smallest whole-number solution of x > ${k}?`, k + 1, i, [1, -1, 2, -2, 0], -20, '', { ty: 0, k, t: k + 1 });
    if (i === 6) return numChoice(`x ≤ ${k} मा सबैभन्दा ठूलो पूर्ण सङ्ख्या कति?`, `Largest whole-number solution of x ≤ ${k}?`, k, i, [1, -1, 2, -2, 0], -20, '', { ty: 3, k, t: k });
    return choice('x < 5 को हलमा कुन सङ्ख्या पर्छ?', 'Which number is a solution of x < 5?', '4', ['5', '6', '7'], i, { ty: 2, k: 5, t: 4 });
  },
};
export const InequalityLab6 = makeLab(inequalityCfg);

/* ───────────── linear graph ───────────── */
export const graphCfg: LabCfg = {
  code: 'SIM-MATH-G6-L13-03', chapter: 13, titleNp: 'रेखाचित्र प्रयोगशाला', titleEn: 'Line Graph Lab', color: '#ec4899',
  params: [{ id: 'm', np: 'x को गुणाङ्क', en: 'Times x', min: 1, max: 3, init: 2, color: '#ec4899' }, { id: 'c', np: 'जोडिने सङ्ख्या', en: 'Plus', min: 0, max: 4, init: 1, color: '#f59e0b' }],
  stage: { camera: [0, 6, 15], target: [0, 4, 0], minDistance: 8, maxDistance: 26 },
  draw: (g, p, lang) => {
    const X = (x: number) => -5 + x * 1.5, Y = (y: number) => 0.2 + y * 0.5; rod(g, [X(0), 0.2, 0], [X(6.4), 0.2, 0], '#334155', 0.12); rod(g, [X(0), 0.2, 0], [X(0), Y(17), 0], '#334155', 0.12);
    for (let x = 0; x <= 6; x++) { tag(g, String(x), X(x), -0.5, 0, 1.1, { px: 52, w: 96, h: 64 }); rod(g, [X(x), 0.2, -0.3], [X(x), Y(16), -0.3], '#e2e8f0', 0.03); }
    for (let y = 0; y <= 16; y += 4) { tag(g, String(y), X(0) - 0.9, Y(y), 0, 1.1, { px: 52, w: 96, h: 64 }); rod(g, [X(0), Y(y), -0.3], [X(6.4), Y(y), -0.3], '#e2e8f0', 0.03); }
    for (let x = 0; x <= 5; x++) { const y = p.m * x + p.c; rod(g, [X(x), Y(y), 0], [X(x + 1), Y(p.m * (x + 1) + p.c), 0], '#ec4899', 0.1); disc(g, 0.28, '#f59e0b', X(x), Y(y), 0); tag(g, `(${x}, ${y})`, X(x) + 0.2, Y(y) + 0.6, 0, 1.7, { px: 40, w: 192, h: 64 }); }
    tag(g, `y = ${p.m}x + ${p.c}`, 3.5, 9, 0, 4.4, { px: 62, w: 460, h: 96, bg: '#fff', border: '#ec4899' }); void lang;
  },
  info: (p) => bi(`y = ${p.m}x + ${p.c}\nx = 0,1,2,3 हुँदा y = ${[0, 1, 2, 3].map((x) => p.m * x + p.c).join(', ')}\nx १ ले बढ्दा y ${p.m} ले बढ्छ`, `y = ${p.m}x + ${p.c}\nWhen x = 0,1,2,3, y = ${[0, 1, 2, 3].map((x) => p.m * x + p.c).join(', ')}\nEvery time x goes up by 1, y goes up by ${p.m}`),
  tip: bi('समीकरणका बिन्दु ग्राफमा राखेर सिधा रेखा बन्छ हेरौँ', 'Plot the points of the equation: they make a straight line'),
  goal: () => { const m = rnd(1, 3), c = rnd(0, 4); return { p: { m, c }, np: `(0, ${c}) र (1, ${m + c}) हुने रेखा बनाऔँ`, en: `Make the line through (0, ${c}) and (1, ${m + c})`, start: { m: 1, c: 0 } }; },
  quiz: (i) => {
    const m = rnd(1, 3), c = rnd(0, 4), x = rnd(1, 5);
    if (i < 3) return numChoice(`y = ${m}x + ${c} मा x = ${x} हुँदा y = ?`, `In y = ${m}x + ${c}, y = ? when x = ${x}`, m * x + c, i, [1, -1, m, c, 2], 0, '', { m, c });
    if (i < 5) return numChoice(`y = ${m}x + ${c} मा y = ${m * x + c} हुँदा x = ?`, `In y = ${m}x + ${c}, x = ? when y = ${m * x + c}`, x, i, [1, -1, 2, m, 3], 0, '', { m, c });
    if (i === 5) return choice(`x = 0 हुँदा y = ${c} भए रेखाले y-अक्षलाई कहाँ काट्छ?`, `At x = 0, y = ${c}. Where does the line cut the y-axis?`, `(0, ${c})`, [`(${c}, 0)`, `(0, ${c + 1})`, `(${c + 1}, ${c})`], i, { m, c });
    if (i === 6) return choice(`x १ ले बढ्दा y ${m} ले बढ्छ भने समीकरण?`, `y goes up by ${m} each time x goes up by 1. Which equation?`, `y = ${m}x + ${c}`, [`y = x + ${m}`, `y = ${m + c}x`, `y = ${c}x + ${m}`], i, { m, c });
    return choice('y = 2x + 1 को ग्राफ कस्तो हुन्छ?', 'The graph of y = 2x + 1 is…', 'सिधा रेखा | a straight line', ['वक्र रेखा | a curve', 'वृत्त | a circle'], i, { m: 2, c: 1 });
  },
};
export const GraphLab6 = makeLab(graphCfg);
