/**
 * Class 6 lesson 1 · Set, lesson 2 · Whole numbers (big numbers, factors, HCF and LCM), lesson 3 · Integers.
 */
import { rnd } from '../class1-math-kit/nepali';
import { makeLab, LabCfg } from '../class5-math/Lab';
import { bi, choice, numChoice, gcd, lcm } from '../class5-math/h5';
import { towerCfg } from '../class5-math/G5Number';
import { box, tag, rod, disc, cubeBlock } from '../class5-math/vis';

/* ───────────── sets: Venn diagram ───────────── */
const PRESETS: [number[], number[]][] = [
  [[1, 2, 3, 4, 5, 6], [4, 5, 6, 7, 8, 9]], [[2, 4, 6, 8, 10, 12], [3, 6, 9, 12]], [[1, 3, 5, 7, 9, 11], [2, 3, 5, 7, 11]], [[1, 2, 3, 4], [3, 4, 5, 6, 7, 8]], [[3, 6, 9, 12], [2, 4, 6, 8, 10, 12]],
];
const OPS = [{ np: 'A', en: 'A' }, { np: 'B', en: 'B' }, { np: 'A ∪ B', en: 'A ∪ B' }, { np: 'A ∩ B', en: 'A ∩ B' }, { np: 'A − B', en: 'A − B' }, { np: 'B − A', en: 'B − A' }, { np: "A′", en: "A′" }];
const inSet = (op: number, a: number[], b: number[], x: number) => { const A = a.includes(x), B = b.includes(x); return [A, B, A || B, A && B, A && !B, B && !A, !A][op]; };
const result = (p: Record<string, number>) => { const [a, b] = PRESETS[p.s - 1]; return Array.from({ length: 12 }, (_, i) => i + 1).filter((x) => inSet(p.op, a, b, x)); };
export const vennCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#8b5cf6',
  params: [{ id: 's', np: 'उदाहरण', en: 'Example', min: 1, max: PRESETS.length, init: 1 }, { id: 'op', np: 'समूह', en: 'Set', min: 0, max: 6, init: 2, names: OPS }],
  stage: { camera: [0, 13, 10], target: [0, 0, 0], minDistance: 8, maxDistance: 24 },
  draw: (g, p, lang) => {
    const [a, b] = PRESETS[p.s - 1]; box(g, 17, 0.1, 11, 0, 0.05, 0, '#f1f5f9'); disc(g, 4.3, '#93c5fd', -2.4, 0.1, -0.4, 0.55); disc(g, 4.3, '#fca5a5', 2.4, 0.12, -0.4, 0.55);
    tag(g, 'A', -5.6, 0.3, -4.2, 2.2, { px: 70, w: 128, h: 96, color: '#1d4ed8' }); tag(g, 'B', 5.6, 0.3, -4.2, 2.2, { px: 70, w: 128, h: 96, color: '#b91c1c' });
    const regions: number[][] = [[], [], [], []]; for (let x = 1; x <= 12; x++) regions[a.includes(x) && b.includes(x) ? 1 : a.includes(x) ? 0 : b.includes(x) ? 2 : 3].push(x);
    const cx = [-4.3, 0, 4.3, 0]; const cz = [-0.4, -0.4, -0.4, 4.2];
    regions.forEach((r, k) => r.forEach((x, i) => { const cols = k === 3 ? 6 : 2; const px = k === 3 ? (i - (r.length - 1) / 2) * 1.5 : cx[k] + ((i % cols) - 0.5) * 1.4; const pz = k === 3 ? cz[k] : cz[k] + (Math.floor(i / cols) - (Math.ceil(r.length / cols) - 1) / 2) * 1.3; const on = inSet(p.op, a, b, x); tag(g, String(x), px, 0.5, pz, on ? 1.45 : 1.1, { px: 58, w: 128, h: 128, bg: on ? '#fde68a' : '#e2e8f0', border: on ? '#f59e0b' : '#94a3b8', color: on ? '#0f172a' : '#64748b' }); }));
    void lang;
  },
  info: (p) => { const r = result(p); return bi(`${OPS[p.op].np} = { ${r.join(', ') || ' '} }  ·  n = ${r.length}\nA = {${PRESETS[p.s - 1][0].join(', ')}} · B = {${PRESETS[p.s - 1][1].join(', ')}}`, `${OPS[p.op].en} = { ${r.join(', ') || ' '} }  ·  n = ${r.length}\nA = {${PRESETS[p.s - 1][0].join(', ')}} · B = {${PRESETS[p.s - 1][1].join(', ')}}`); },
  tip: bi('उदाहरण र समूहको क्रिया छानेर सुनौलो सङ्ख्या हेरौँ', 'Pick an example and a set operation; the golden numbers are the answer'),
  goal: () => { const s = rnd(1, PRESETS.length), op = rnd(2, 6); const r = result({ s, op }); return { p: { s, op }, np: `{${r.join(', ')}} देखाउने क्रिया छानौँ`, en: `Pick the operation that gives {${r.join(', ')}}`, start: { s, op: 0 } }; },
  quiz: (i) => {
    const s = rnd(1, PRESETS.length); const [a, b] = PRESETS[s - 1]; const both = a.filter((x) => b.includes(x)); const set = { s };
    const str = (arr: number[]) => `{${arr.join(', ')}}`; const uni = Array.from(new Set([...a, ...b])).sort((x, y) => x - y);
    if (i === 0) return choice('A ∪ B = ?', 'A ∪ B = ?', str(uni), [str(both), str(a), str(b)], i, { ...set, op: 2 });
    if (i === 1) return choice('A ∩ B = ?', 'A ∩ B = ?', str(both), [str(uni), str(a), str(b)], i, { ...set, op: 3 });
    if (i === 2) return numChoice('n(A ∪ B) = ?', 'n(A ∪ B) = ?', uni.length, i, [1, -1, 2, a.length, both.length], 0, '', { ...set, op: 2 });
    if (i === 3) return numChoice('n(A ∩ B) = ?', 'n(A ∩ B) = ?', both.length, i, [1, -1, 2, a.length, 3], 0, '', { ...set, op: 3 });
    if (i === 4) return choice('A − B = ?', 'A − B = ?', str(a.filter((x) => !b.includes(x))), [str(both), str(b.filter((x) => !a.includes(x))), str(uni)], i, { ...set, op: 4 });
    if (i === 5) return numChoice(`n(A) = ${a.length}, n(B) = ${b.length}, n(A ∩ B) = ${both.length} भए n(A ∪ B) कति?`, `n(A) = ${a.length}, n(B) = ${b.length}, n(A ∩ B) = ${both.length}. Find n(A ∪ B)`, a.length + b.length - both.length, i, [1, -1, both.length, 2, a.length + b.length], 0);
    if (i === 6) { const x = rnd(1, 12); return choice(`${x} ∈ A हो?`, `Is ${x} ∈ A?`, a.includes(x) ? 'Yes' : 'No', [a.includes(x) ? 'No' : 'Yes'], i, { ...set, op: 0 }); }
    return choice("A′ मा के पर्छ?", "What is in A′? (U = 1 to 12)", str(Array.from({ length: 12 }, (_, k) => k + 1).filter((x) => !a.includes(x))), [str(a), str(b), str(uni)], i, { ...set, op: 6 });
  },
});
export const VennLab6 = makeLab(vennCfg({ code: 'SIM-MATH-G6-L1-01', chapter: 1, titleNp: 'भेन चित्र प्रयोगशाला', titleEn: 'Venn Diagram Lab' }));

/* ───────────── whole numbers ───────────── */
export const BigTowers6 = makeLab(towerCfg({ code: 'SIM-MATH-G6-L2-01', chapter: 2, titleNp: 'ठूला सङ्ख्याका टावर', titleEn: 'Big Number Towers', n: 10 }));

const factors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const isPrime = (n: number) => n > 1 && factors(n).length === 2;
export const factorCfg: LabCfg = {
  code: 'SIM-MATH-G6-L2-02', chapter: 2, titleNp: 'गुणनखण्ड प्रयोगशाला', titleEn: 'Factor Lab', color: '#f59e0b',
  params: [{ id: 'n', np: 'सङ्ख्या', en: 'Number', min: 2, max: 60, init: 12 }],
  stage: { camera: [0, 12, 10], target: [0, 0, 0], minDistance: 7, maxDistance: 24 },
  draw: (g, p, lang) => {
    const f = factors(p.n).filter((d) => d * d <= p.n); const u = Math.min(0.5, 11 / p.n);
    f.forEach((d, k) => { const z = -4.2 + k * 1.7; cubeBlock(g, p.n / d, d, 1, ['#ef4444', '#f59e0b', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899'][k % 6], u, 0.5, z - 0.5 * (d - 1) * u, 0.04); tag(g, `${d} × ${p.n / d}`, -7.6, 0.4, z, 2.2, { px: 48, w: 256, h: 80 }); });
    tag(g, isPrime(p.n) ? (lang === 'ne' ? 'रुढ सङ्ख्या' : 'Prime number') : lang === 'ne' ? 'संयुक्त सङ्ख्या' : 'Composite number', 0, 0.5, 5.2, 4, { px: 54, w: 420, h: 96, bg: '#fff', border: isPrime(p.n) ? '#22c55e' : '#f59e0b' });
  },
  info: (p) => { const f = factors(p.n); return bi(`${p.n} का गुणनखण्ड: ${f.join(', ')}\n${f.length} वटा गुणनखण्ड · ${isPrime(p.n) ? 'रुढ सङ्ख्या (2 मात्र)' : p.n === 1 ? '' : 'संयुक्त सङ्ख्या'}`, `Factors of ${p.n}: ${f.join(', ')}\n${f.length} factors · ${isPrime(p.n) ? 'prime (exactly 2 factors)' : 'composite'}`); },
  tip: bi('सङ्ख्या बदलेर कति तरिकाले आयत बन्छ हेरौँ; एक मात्र तरिका भए रुढ', 'Change the number: if only one rectangle fits (1 × n) it is prime'),
  goal: () => { const pr = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]; const n = pr[rnd(0, pr.length - 1)]; return { p: { n }, np: 'एउटा रुढ सङ्ख्या देखाऔँ (पहिले ' + n + ' मिल्ने)', en: `Show the prime number ${n}`, start: { n: 12 } }; },
  quiz: (i) => {
    const n = [12, 18, 24, 30, 36, 20, 28, 45][i]; const pr = [7, 11, 13, 17, 19, 23][rnd(0, 5)]; const f = factors(n);
    if (i === 0 || i === 1) return choice(`${n} का सबै गुणनखण्ड कुन हुन्?`, `Which lists all the factors of ${n}?`, f.join(', '), [f.slice(0, -1).join(', '), [...f.slice(1)].join(', '), f.filter((x) => x % 2 === 0).join(', ')], i, { n });
    if (i === 2) return numChoice(`${n} मा कतिवटा गुणनखण्ड छन्?`, `How many factors does ${n} have?`, f.length, i, [1, -1, 2, 3, -2], 1, '', { n });
    if (i === 3) return choice(`${pr} कस्तो सङ्ख्या हो?`, `Is ${pr} prime or composite?`, 'Prime', ['Composite'], i, { n: pr });
    if (i === 4) return choice(`${n} कस्तो सङ्ख्या हो?`, `Is ${n} prime or composite?`, 'Composite', ['Prime'], i, { n });
    if (i === 5) return choice('1 देखि 20 सम्मका रुढ सङ्ख्याको सूची कुन हो?', 'Which lists the primes from 1 to 20?', '2, 3, 5, 7, 11, 13, 17, 19', ['1, 2, 3, 5, 7, 11, 13, 17, 19', '2, 3, 5, 7, 9, 11, 13, 17', '2, 4, 6, 8, 10, 12, 14, 16, 18'], i);
    if (i === 6) return numChoice('सबैभन्दा सानो रुढ सङ्ख्या कुन हो?', 'What is the smallest prime number?', 2, i, [1, 3, 4, 5, 0], 0);
    return choice(`${rnd(2, 9) * 10 + 5} कुन सङ्ख्याले पूर्ण भाग जान्छ?`, 'Which number divides 45 exactly?', '5', ['2', '4', '7'], i, { n: 45 });
  },
};
export const FactorLab6 = makeLab(factorCfg);

export const hcfCfg: LabCfg = {
  code: 'SIM-MATH-G6-L2-03', chapter: 2, titleNp: 'म.स. र ल.स. प्रयोगशाला', titleEn: 'HCF and LCM Lab', color: '#0ea5e9',
  params: [{ id: 'a', np: 'पहिलो सङ्ख्या', en: 'First number', min: 2, max: 12, init: 4, color: '#0ea5e9' }, { id: 'b', np: 'दोस्रो सङ्ख्या', en: 'Second number', min: 2, max: 12, init: 6, color: '#22c55e' }],
  stage: { camera: [0, 11, 12], target: [0, 0, 0], minDistance: 7, maxDistance: 24 },
  draw: (g, p, lang) => {
    const L = lcm(p.a, p.b), H = gcd(p.a, p.b); const X = (v: number) => -9 + (18 * v) / L; box(g, 18.4, 0.1, 0.18, 0, 0.05, 0, '#475569');
    for (let v = p.a; v <= L; v += p.a) { const c = v === L; box(g, c ? 0.5 : 0.36, c ? 1.6 : 0.9, 0.36, X(v), c ? 0.8 : 0.45, -1.4, c ? '#facc15' : '#0ea5e9', 0.4); if (L <= 36 || c) tag(g, String(v), X(v), 1.2 + (c ? 0.9 : 0.1), -1.4, 1.3, { px: 44, w: 128, h: 64 }); }
    for (let v = p.b; v <= L; v += p.b) { const c = v === L; box(g, c ? 0.5 : 0.36, c ? 1.6 : 0.9, 0.36, X(v), c ? 0.8 : 0.45, 1.4, c ? '#facc15' : '#22c55e', 0.4); if (L <= 36 || c) tag(g, String(v), X(v), 1.2 + (c ? 0.9 : 0.1), 1.4, 1.3, { px: 44, w: 128, h: 64 }); }
    rod(g, [X(L), 0.1, -1.4], [X(L), 0.1, 1.4], '#f59e0b', 0.1);
    tag(g, `${lang === 'ne' ? 'ल.स.' : 'LCM'} = ${L}`, 0, 0.4, 4.2, 4, { px: 54, w: 420, h: 96, bg: '#fff', border: '#f59e0b' }); tag(g, `${lang === 'ne' ? 'म.स.' : 'HCF'} = ${H}`, 0, 0.4, 5.8, 4, { px: 54, w: 420, h: 96, bg: '#fff', border: '#0ea5e9' });
    tag(g, `${p.a}`, -10.6, 0.8, -1.4, 1.8, { px: 70, w: 128, h: 96, color: '#0369a1' }); tag(g, `${p.b}`, -10.6, 0.8, 1.4, 1.8, { px: 70, w: 128, h: 96, color: '#15803d' });
  },
  info: (p) => { const L = lcm(p.a, p.b), H = gcd(p.a, p.b); return bi(`${p.a} र ${p.b}: म.स. = ${H} · ल.स. = ${L}\n${p.a} × ${p.b} = ${p.a * p.b} = म.स. × ल.स. = ${H} × ${L}`, `${p.a} and ${p.b}: HCF = ${H} · LCM = ${L}\n${p.a} × ${p.b} = ${p.a * p.b} = HCF × LCM = ${H} × ${L}`); },
  tip: bi('गुणजका चिह्न पहिलोपटक मिल्ने ठाउँ नै ल.स. हो', 'The first place where the two rows of multiples meet is the LCM'),
  goal: () => { const a = rnd(2, 12), b = rnd(2, 12); return { p: { a, b }, np: `म.स. ${gcd(a, b)} र ल.स. ${lcm(a, b)} हुने जोडा बनाऔँ`, en: `Find the pair with HCF ${gcd(a, b)} and LCM ${lcm(a, b)}`, start: { a: 2, b: 2 } }; },
  quiz: (i) => {
    const a = rnd(2, 12), b = rnd(2, 12); const H = gcd(a, b), L = lcm(a, b); const set = { a, b };
    if (i < 2) return numChoice(`${a} र ${b} को म.स. कति?`, `HCF of ${a} and ${b}?`, H, i, [1, -1, 2, 3, a], 1, '', set);
    if (i < 4) return numChoice(`${a} र ${b} को ल.स. कति?`, `LCM of ${a} and ${b}?`, L, i, [a, b, a * b, L / 2 || 1, 12], 1, '', set);
    if (i === 4) return numChoice(`म.स. ${H} र ल.स. ${L} भए, ${a} × ${b} कति?`, `HCF is ${H}, LCM is ${L}. What is ${a} × ${b}?`, H * L, i, [1, -1, H + L, 10, a + b], 1, '', set);
    if (i === 5) return choice(`दुईवटा रुढ सङ्ख्याको म.स. कति हुन्छ?`, 'The HCF of two different primes is…', '1', ['2', 'their product', 'the smaller prime'], i);
    if (i === 6) return numChoice(`घण्टी ${a} र ${b} मिनेटमा बज्छ; एकसाथ बजेपछि फेरि कति मिनेटपछि एकसाथ बज्छ?`, `Bells ring every ${a} and ${b} minutes. After how many minutes do they ring together again?`, L, i, [a, b, a * b, 12, -a], 1, '', set);
    return numChoice(`${a * b} र ${a * (b + 1)} को म.स. कति?`, `HCF of ${a * b} and ${a * (b + 1)}?`, a, i, [1, -1, 2, b, a * b], 1);
  },
};
export const HcfLcmLab6 = makeLab(hcfCfg);

/* ───────────── integers ───────────── */
const sg = (n: number) => (n < 0 ? `(${n})` : String(n));
const intRes = (p: Record<string, number>) => (p.op === 0 ? p.st + p.mv : p.st - p.mv);
export const integerCfg: LabCfg = {
  code: 'SIM-MATH-G6-L3-01', chapter: 3, titleNp: 'पूर्णाङ्क सङ्ख्यारेखा', titleEn: 'Integer Number Line', color: '#ef4444',
  params: [{ id: 'st', np: 'सुरु', en: 'Start', min: -10, max: 10, init: 3, color: '#0ea5e9' }, { id: 'mv', np: 'सङ्ख्या', en: 'Number', min: -10, max: 10, init: -5, color: '#f59e0b' }, { id: 'op', np: 'क्रिया', en: 'Operation', min: 0, max: 1, init: 0, names: [{ np: 'जोड +', en: 'Add +' }, { np: 'घटाउ −', en: 'Subtract −' }] }],
  stage: { camera: [0, 8, 13], target: [0, 0, 0], minDistance: 7, maxDistance: 26 },
  draw: (g, p) => {
    const X = (v: number) => v * 0.68; const r = intRes(p); box(g, 28, 0.15, 0.4, 0, 0.08, 0, '#334155');
    for (let v = -20; v <= 20; v++) { box(g, 0.06, v % 5 === 0 ? 0.8 : 0.4, 0.06, X(v), 0.4, 0, v === 0 ? '#dc2626' : '#334155'); if (v % 5 === 0) tag(g, String(v), X(v), -0.8, 1.2, 1.4, { px: 52, w: 128, h: 64, color: v < 0 ? '#b91c1c' : v > 0 ? '#1d4ed8' : '#0f172a' }); }
    const dir = intRes(p) >= p.st ? 1 : -1; rod(g, [X(p.st), 1.6, 0], [X(r), 1.6, 0], dir > 0 ? '#22c55e' : '#ef4444', 0.18);
    const ball = (v: number, c: string) => { box(g, 0.8, 0.8, 0.8, X(v), 0.6, 0, c, 0.3); };
    ball(p.st, '#0ea5e9'); ball(r, '#facc15'); tag(g, String(p.st), X(p.st), 2.8, 0, 1.4, { px: 52, w: 128, h: 80, bg: '#fff', border: '#0ea5e9' }); tag(g, String(r), X(r), 3.8, 0, 1.6, { px: 56, w: 128, h: 80, bg: '#fff', border: '#f59e0b' });
  },
  info: (p) => { const r = intRes(p); return bi(`${sg(p.st)} ${p.op ? '−' : '+'} ${sg(p.mv)} = ${r}\n${p.op ? 'घटाउनु = विपरीत सङ्ख्या जोड्नु: ' + sg(p.st) + ' + ' + sg(-p.mv) : 'धनात्मक दायाँ, ऋणात्मक बायाँ हिँड्छ'}`, `${sg(p.st)} ${p.op ? '−' : '+'} ${sg(p.mv)} = ${r}\n${p.op ? 'Subtracting = adding the opposite: ' + sg(p.st) + ' + ' + sg(-p.mv) : 'Positive moves right, negative moves left'}`); },
  tip: bi('सुरुबाट सङ्ख्या जोड्दा दायाँ वा बायाँ कति सर्छ हेरौँ', 'See how far the answer moves left or right of the start'),
  goal: () => { const st = rnd(-8, 8), mv = rnd(-8, 8), op = rnd(0, 1); return { p: { st, mv, op }, np: `${sg(st)} ${op ? '−' : '+'} ${sg(mv)} बनाऔँ (उत्तर ${intRes({ st, mv, op })})`, en: `Set up ${sg(st)} ${op ? '−' : '+'} ${sg(mv)} (answer ${intRes({ st, mv, op })})`, start: { st: 0, mv: 0, op: 0 } }; },
  quiz: (i) => {
    const st = rnd(-9, 9), mv = rnd(-9, 9); const op = i % 2; const r = intRes({ st, mv, op });
    if (i < 5) return numChoice(`${sg(st)} ${op ? '−' : '+'} ${sg(mv)} = ?`, `${sg(st)} ${op ? '−' : '+'} ${sg(mv)} = ?`, r, i, [1, -1, 2, -2, 10, -10, 2 * st], -40, '', { st, mv, op });
    if (i === 5) { const a = rnd(2, 9); return numChoice(`${-a} को विपरीत सङ्ख्या?`, `What is the opposite of ${-a}?`, a, i, [-a, 2 * a, 0, -2 * a], -40); }
    if (i === 6) { const a = rnd(-9, -2), b = rnd(1, 9); return choice('कुन सङ्ख्या ठूलो छ?', 'Which number is greater?', String(b), [String(a), String(a - 1)], i); }
    const a = rnd(-9, -2); return numChoice(`|${a}| (निरपेक्ष मान) = ?`, `|${a}| (absolute value) = ?`, -a, i, [a, 1, 2, -2 * a], -40);
  },
};
export const IntegerLab6 = makeLab(integerCfg);
