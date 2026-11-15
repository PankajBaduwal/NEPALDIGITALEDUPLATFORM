/**
 * Class 6 lessons 14–19 · Lines and angles, Plane shapes, Circle, Solid objects, Co-ordinate geometry, Symmetry and tessellation.
 */
import * as THREE from 'three';
import { rnd } from '../class1-math-kit/nepali';
import { mat } from '../class1-math-kit/models';
import { makeLab, LabCfg } from '../class5-math/Lab';
import { bi, choice, numChoice } from '../class5-math/h5';
import { solidCfg } from '../class5-math/G5Geometry';
import { box, tag, rod, disc, sector, poly, outline } from '../class5-math/vis';

const rad = (d: number) => (d * Math.PI) / 180;

/* ───────────── parallel lines and a transversal ───────────── */
const PAIRS = [
  { np: 'संगत कोण', en: 'Corresponding', note: ['बराबर', 'equal'] }, { np: 'एकान्तर कोण', en: 'Alternate interior', note: ['बराबर', 'equal'] },
  { np: 'सहभित्री कोण', en: 'Co-interior', note: ['योगफल १८०°', 'sum is 180°'] }, { np: 'शीर्षाभिमुख कोण', en: 'Vertically opposite', note: ['बराबर', 'equal'] }, { np: 'रेखीय जोडा', en: 'Linear pair', note: ['योगफल १८०°', 'sum is 180°'] },
];
// the two highlighted arcs for each pair: [line (0 top,1 bottom), quadrant 0..3]
const HI: [number, number][][] = [[[0, 0], [1, 0]], [[0, 2], [1, 0]], [[0, 3], [1, 0]], [[0, 0], [0, 2]], [[0, 0], [0, 1]]];
export const transversalCfg: LabCfg = {
  code: 'SIM-MATH-G6-L14-01', chapter: 14, titleNp: 'समानान्तर रेखा र कोण', titleEn: 'Parallel Lines and Angles', color: '#0ea5e9',
  params: [{ id: 'th', np: 'कोण θ', en: 'Angle θ', min: 30, max: 150, step: 10, init: 60, show: (v) => `${v}°`, color: '#0ea5e9' }, { id: 'pr', np: 'कोणको जोडा', en: 'Angle pair', min: 0, max: 4, init: 0, names: PAIRS, color: '#ec4899' }],
  stage: { camera: [0, 12, 8], target: [0, 0, 0], minDistance: 7, maxDistance: 22 },
  draw: (g, p, lang) => {
    const t = p.th, cot = 1 / Math.tan(rad(t)); const Q = [[2 * cot, -2], [-2 * cot, 2]];
    box(g, 20, 0.08, 0.14, 0, 0.05, -2, '#334155'); box(g, 20, 0.08, 0.14, 0, 0.05, 2, '#334155');
    const dv = [Math.cos(rad(t)), -Math.sin(rad(t))]; rod(g, [Q[0][0] + 3.6 * dv[0], 0.08, Q[0][1] + 3.6 * dv[1]], [Q[1][0] - 3.6 * dv[0], 0.08, Q[1][1] - 3.6 * dv[1]], '#334155', 0.14);
    const angs: [number, number][] = [[0, t], [t, 180], [180, 180 + t], [180 + t, 360]];
    Q.forEach((q, li) => angs.forEach((a, qi) => {
      const hi = HI[p.pr].findIndex((h) => h[0] === li && h[1] === qi); const on = hi >= 0; const mid = rad((a[0] + a[1]) / 2);
      sector(g, 0, on ? 1.5 : 0.9, rad(a[0]), rad(a[1]), on ? ['#facc15', '#ec4899'][hi] : '#bae6fd', q[0], 0.06 + (on ? 0.02 : 0), q[1], on ? 0.95 : 0.55);
      if (on) tag(g, `${a[1] - a[0]}°`, q[0] + 2.4 * Math.cos(mid), 0.4, q[1] - 2.4 * Math.sin(mid), 1.5, { px: 56, w: 160, h: 80, bg: '#fff', border: '#f59e0b' });
    }));
    tag(g, 'l ∥ m', -8.4, 0.4, -2, 1.8, { px: 54, w: 192, h: 80 }); tag(g, `${lang === 'ne' ? PAIRS[p.pr].np : PAIRS[p.pr].en}`, 0, 0.5, 5.2, 5, { px: 54, w: 560, h: 96, bg: '#fff', border: '#ec4899' });
  },
  info: (p) => { const [a, b] = HI[p.pr].map((h) => (h[1] % 2 === 0 ? p.th : 180 - p.th)); return bi(`${PAIRS[p.pr].np}: ${a}° र ${b}° — ${PAIRS[p.pr].note[0]}\nसमानान्तर रेखामा संगत र एकान्तर कोण बराबर हुन्छन्`, `${PAIRS[p.pr].en}: ${a}° and ${b}° — ${PAIRS[p.pr].note[1]}\nWith parallel lines, corresponding and alternate angles are equal`); },
  tip: bi('कोणको जोडा छानेर दुई रङ्गीन कोणको सम्बन्ध हेरौँ', 'Pick a pair of angles and compare the two coloured angles'),
  goal: () => { const pr = rnd(0, 4), th = 10 * rnd(3, 15); return { p: { th, pr }, np: `θ = ${th}° मा ${PAIRS[pr].np} देखाऔँ`, en: `Show ${PAIRS[pr].en.toLowerCase()} angles with θ = ${th}°`, start: { th: 90, pr: (pr + 1) % 5 } }; },
  quiz: (i) => {
    const th = 10 * rnd(3, 8); const pr = i % 5; const set = { th, pr };
    if (i === 0) return numChoice(`समानान्तर रेखामा संगत कोण ${th}° भए अर्को संगत कोण कति?`, `Corresponding angles: one is ${th}°. The other is…`, th, i, [10, -10, 180 - th, 90, 20], 1, '°', { th, pr: 0 });
    if (i === 1) return numChoice(`एकान्तर कोण ${th}° भए अर्को एकान्तर कोण कति?`, `Alternate angles: one is ${th}°. The other is…`, th, i, [10, -10, 180 - th, 90, 20], 1, '°', { th, pr: 1 });
    if (i === 2) return numChoice(`सहभित्री कोण ${th}° भए अर्को कोण कति?`, `Co-interior angles: one is ${th}°. The other is…`, 180 - th, i, [10, -10, th, 90, 20], 1, '°', { th, pr: 2 });
    if (i === 3) return numChoice(`शीर्षाभिमुख कोण ${th}° भए त्यसको सम्मुखको कोण कति?`, `Vertically opposite angle of ${th}° is…`, th, i, [10, -10, 180 - th, 90, 20], 1, '°', { th, pr: 3 });
    if (i === 4) return numChoice(`रेखीय जोडाको एक कोण ${th}° भए अर्को कति?`, `One angle of a linear pair is ${th}°. The other is…`, 180 - th, i, [10, -10, th, 90, 20], 1, '°', { th, pr: 4 });
    if (i === 5) return choice('समानान्तर रेखामा दुईवटा भित्री कोण एकैतर्फ भए ती…', 'Two interior angles on the same side of the transversal are…', 'सहभित्री (योगफल १८०°) | co-interior (sum 180°)', ['एकान्तर | alternate', 'संगत | corresponding'], i, { th, pr: 2 });
    return choice('कुन जोडा सधैँ बराबर हुन्छ?', 'Which pair is always equal?', 'शीर्षाभिमुख कोण | vertically opposite', ['रेखीय जोडा | linear pair', 'सहभित्री | co-interior'], i, set);
  },
};
export const TransversalLab6 = makeLab(transversalCfg);

/* ───────────── triangle ───────────── */
export const triangleCfg: LabCfg = {
  code: 'SIM-MATH-G6-L15-01', chapter: 15, titleNp: 'त्रिभुज प्रयोगशाला', titleEn: 'Triangle Lab', color: '#f59e0b',
  params: [{ id: 'a', np: 'कोण A', en: 'Angle A', min: 20, max: 120, step: 5, init: 60, show: (v) => `${v}°`, color: '#ef4444' }, { id: 'b', np: 'कोण B', en: 'Angle B', min: 20, max: 120, step: 5, init: 60, show: (v) => `${v}°`, color: '#0ea5e9' }],
  stage: { camera: [0, 12, 7], target: [0, 0, -0.5], minDistance: 7, maxDistance: 22 },
  fix: (p) => (p.a + p.b > 165 ? { ...p, b: Math.max(20, 165 - p.a) } : p),
  draw: (g, p, lang) => {
    const c = 180 - p.a - p.b; const AB = 6; const AC = (AB * Math.sin(rad(p.b))) / Math.sin(rad(p.a + p.b)); const A: [number, number] = [-3, 2.5], B: [number, number] = [3, 2.5]; const C: [number, number] = [A[0] + AC * Math.cos(rad(p.a)), A[1] - AC * Math.sin(rad(p.a))];
    poly(g, [A, B, C], '#fde68a', 0.04, 0.9); outline(g, [A, B, C], '#b45309', 0.12, 0.12);
    const lab = (pt: [number, number], v: number, a0: number, a1: number, col: string, name: string) => { sector(g, 0, 0.9, rad(a0), rad(a1), col, pt[0], 0.09, pt[1], 0.9); const m = rad((a0 + a1) / 2); tag(g, `${name} ${v}°`, pt[0] + 1.9 * Math.cos(m), 0.5, pt[1] - 1.9 * Math.sin(m), 1.8, { px: 52, w: 224, h: 80, bg: '#fff', border: col }); };
    lab(A, p.a, 0, p.a, '#ef4444', 'A'); lab(B, p.b, 180 - p.b, 180, '#0ea5e9', 'B'); lab(C, c, 180 + p.a, 360 - p.b, '#22c55e', 'C');
    const kind = c === 90 || p.a === 90 || p.b === 90 ? 0 : Math.max(p.a, p.b, c) > 90 ? 1 : 2; const eq = [p.a === p.b, p.a === c, p.b === c].filter(Boolean).length;
    tag(g, `${[lang === 'ne' ? 'समकोणी' : 'Right', lang === 'ne' ? 'अधिककोणी' : 'Obtuse', lang === 'ne' ? 'न्यूनकोणी' : 'Acute'][kind]} · ${eq === 3 ? (lang === 'ne' ? 'समबाहु' : 'Equilateral') : eq === 1 ? (lang === 'ne' ? 'समद्विबाहु' : 'Isosceles') : lang === 'ne' ? 'विषमबाहु' : 'Scalene'}`, 0, 0.5, 5.2, 5.4, { px: 52, w: 640, h: 96, bg: '#fff', border: '#f59e0b' });
  },
  info: (p) => { const c = 180 - p.a - p.b; return bi(`∠A + ∠B + ∠C = ${p.a}° + ${p.b}° + ${c}° = १८०°\nतेस्रो कोण = १८० − (${p.a} + ${p.b}) = ${c}°`, `∠A + ∠B + ∠C = ${p.a}° + ${p.b}° + ${c}° = 180°\nThird angle = 180 − (${p.a} + ${p.b}) = ${c}°`); },
  tip: bi('दुई कोण बदल्दा तेस्रो कोण र त्रिभुजको प्रकार कसरी बदलिन्छ हेरौँ', 'Change two angles; the third angle and the kind of triangle follow'),
  goal: () => { const kinds = [[60, 60], [90, 45], [50, 50], [100, 40], [30, 60]]; const k = kinds[rnd(0, 4)]; return { p: { a: k[0], b: k[1] }, np: `कोण ${k[0]}° र ${k[1]}° भएको त्रिभुज बनाऔँ (तेस्रो ${180 - k[0] - k[1]}°)`, en: `Make a triangle with angles ${k[0]}° and ${k[1]}° (third is ${180 - k[0] - k[1]}°)`, start: { a: 30, b: 30 } }; },
  quiz: (i) => {
    const a = 5 * rnd(6, 18), b = 5 * rnd(4, 14); const c = 180 - a - b; if (c <= 0) return numChoice('त्रिभुजका तीन कोणको योगफल कति?', 'The three angles of a triangle add up to…', 180, i, [90, 360, 100, 120], 1, '°');
    if (i < 3) return numChoice(`त्रिभुजका दुई कोण ${a}° र ${b}° भए तेस्रो कोण कति?`, `Two angles of a triangle are ${a}° and ${b}°. The third is…`, c, i, [10, -10, 5, 180 - a, 20], 1, '°', { a, b });
    if (i === 3) return choice('एउटा कोण ९०° भएको त्रिभुजलाई के भनिन्छ?', 'A triangle with one angle of 90° is…', 'समकोणी | right-angled', ['न्यूनकोणी | acute', 'अधिककोणी | obtuse'], i, { a: 90, b: 45 });
    if (i === 4) return choice('तीनवटै भुजा बराबर भएको त्रिभुज?', 'A triangle with all three sides equal is…', 'समबाहु | equilateral', ['समद्विबाहु | isosceles', 'विषमबाहु | scalene'], i, { a: 60, b: 60 });
    if (i === 5) return numChoice('समबाहु त्रिभुजको प्रत्येक कोण कति?', 'Each angle of an equilateral triangle is…', 60, i, [30, 90, 45, 120], 1, '°', { a: 60, b: 60 });
    if (i === 6) return numChoice(`समद्विबाहु त्रिभुजको शीर्षकोण ${a}° भए आधार कोण कति?`, `The apex of an isosceles triangle is ${a}°. Each base angle is…`, (180 - a) / 2, i, [5, -5, 10, 20, a], 1, '°');
    return choice('अधिककोणी त्रिभुजमा कतिवटा अधिक कोण हुन्छन्?', 'How many obtuse angles can a triangle have?', '1', ['2', '3', '0 मात्र | only 0'], i, { a: 100, b: 40 });
  },
};
export const TriangleLab6 = makeLab(triangleCfg);

/* ───────────── quadrilaterals ───────────── */
const QUADS: { np: string; en: string; pts: [number, number][]; props: [string, string][] }[] = [
  { np: 'वर्ग', en: 'Square', pts: [[-2.2, -2.2], [2.2, -2.2], [2.2, 2.2], [-2.2, 2.2]], props: [['चारै भुजा बराबर, चारै कोण ९०°', 'All sides equal, all angles 90°'], ['विकर्ण बराबर र समकोणमा काट्छन्', 'Diagonals are equal and cross at 90°']] },
  { np: 'आयत', en: 'Rectangle', pts: [[-3.2, -1.8], [3.2, -1.8], [3.2, 1.8], [-3.2, 1.8]], props: [['सम्मुख भुजा बराबर, चारै कोण ९०°', 'Opposite sides equal, all angles 90°'], ['विकर्ण बराबर हुन्छन्', 'Diagonals are equal']] },
  { np: 'समानान्तर चतुर्भुज', en: 'Parallelogram', pts: [[-3.4, -1.8], [1.8, -1.8], [3.4, 1.8], [-1.8, 1.8]], props: [['सम्मुख भुजा समानान्तर र बराबर', 'Opposite sides parallel and equal'], ['सम्मुख कोण बराबर; विकर्णले एकअर्कालाई आधा गर्छन्', 'Opposite angles equal; diagonals bisect each other']] },
  { np: 'समचतुर्भुज', en: 'Rhombus', pts: [[0, -2.8], [2.6, 0], [0, 2.8], [-2.6, 0]], props: [['चारै भुजा बराबर', 'All four sides equal'], ['विकर्ण समकोणमा आधा गरी काट्छन्', 'Diagonals bisect each other at 90°']] },
  { np: 'समलम्ब चतुर्भुज', en: 'Trapezium', pts: [[-3.2, -1.8], [3.2, -1.8], [1.8, 1.8], [-1.8, 1.8]], props: [['एक जोडा भुजा समानान्तर', 'One pair of parallel sides'], ['अरू दुई भुजा समानान्तर हुँदैनन्', 'The other two sides are not parallel']] },
  { np: 'पतङ्ग (काइट)', en: 'Kite', pts: [[0, -3.2], [2.2, -0.6], [0, 2.4], [-2.2, -0.6]], props: [['आसन्न भुजाका दुई जोडा बराबर', 'Two pairs of equal adjacent sides'], ['एउटा विकर्णले अर्कोलाई समकोणमा काट्छ', 'One diagonal cuts the other at 90°']] },
];
export const quadCfg: LabCfg = {
  code: 'SIM-MATH-G6-L15-02', chapter: 15, titleNp: 'चतुर्भुज प्रयोगशाला', titleEn: 'Quadrilateral Lab', color: '#8b5cf6',
  params: [{ id: 's', np: 'आकृति', en: 'Shape', min: 0, max: QUADS.length - 1, init: 0, names: QUADS.map((q) => ({ np: q.np, en: q.en })) }],
  stage: { camera: [0, 12, 8], target: [0, 0, 0], minDistance: 7, maxDistance: 22 },
  draw: (g, p, lang) => {
    const q = QUADS[p.s]; poly(g, q.pts, ['#fca5a5', '#93c5fd', '#fde68a', '#86efac', '#c4b5fd', '#f9a8d4'][p.s], 0.04, 0.95); outline(g, q.pts, '#1e293b', 0.12, 0.12);
    rod(g, [q.pts[0][0], 0.16, q.pts[0][1]], [q.pts[2][0], 0.16, q.pts[2][1]], '#dc2626', 0.08); rod(g, [q.pts[1][0], 0.16, q.pts[1][1]], [q.pts[3][0], 0.16, q.pts[3][1]], '#2563eb', 0.08);
    ['A', 'B', 'C', 'D'].forEach((l, i) => tag(g, l, q.pts[i][0] * 1.2, 0.4, q.pts[i][1] * 1.25, 1.4, { px: 60, w: 96, h: 96, color: '#0f172a' })); tag(g, lang === 'ne' ? q.np : q.en, 0, 0.5, 4.6, 4.4, { px: 56, w: 480, h: 96, bg: '#fff', border: '#8b5cf6' });
  },
  info: (p) => { const q = QUADS[p.s]; return bi(`${q.np}\n${q.props[0][0]}\n${q.props[1][0]}`, `${q.en}\n${q.props[0][1]}\n${q.props[1][1]}`); },
  tip: bi('आकृति छानेर भुजा, कोण र विकर्णका गुण पढौँ', 'Pick a shape and read its sides, angles and diagonals'),
  goal: () => { const s = rnd(0, QUADS.length - 1); return { p: { s }, np: `यो गुण भएको आकृति देखाऔँ: ${QUADS[s].props[0][0]}`, en: `Show the shape: ${QUADS[s].props[0][1]}`, start: { s: (s + 1) % QUADS.length } }; },
  quiz: (i) => {
    const s = rnd(0, QUADS.length - 1); const q = QUADS[s]; const names = QUADS.map((x) => `${x.np} | ${x.en}`);
    if (i < 3) return choice(`${q.props[0][0]} — कुन आकृति हो?`, `${q.props[0][1]} — which shape?`, `${q.np} | ${q.en}`, names.filter((_x, k) => k !== s), i, { s });
    if (i === 3) return numChoice('चतुर्भुजका चार कोणको योगफल कति?', 'The four angles of a quadrilateral add up to…', 360, i, [180, 90, 270, 720], 1, '°');
    if (i === 4) return choice('कुन चतुर्भुजका चारै भुजा बराबर र कोण ९०° हुन्छन्?', 'Which quadrilateral has equal sides and four right angles?', 'वर्ग | Square', ['आयत | Rectangle', 'समचतुर्भुज | Rhombus', 'समलम्ब | Trapezium'], i, { s: 0 });
    if (i === 5) return choice('कुन चतुर्भुजमा एक जोडा मात्र समानान्तर भुजा हुन्छ?', 'Which quadrilateral has exactly one pair of parallel sides?', 'समलम्ब | Trapezium', ['आयत | Rectangle', 'वर्ग | Square', 'समचतुर्भुज | Rhombus'], i, { s: 4 });
    if (i === 6) return numChoice('चतुर्भुजमा ३ कोण ९०°, ८०° र १००° भए चौथो कोण कति?', 'Three angles of a quadrilateral are 90°, 80° and 100°. The fourth is…', 90, i, [10, -10, 80, 100, 20], 1, '°');
    return choice('आयत र वर्ग बीच के फरक छ?', 'How is a square different from a rectangle?', 'वर्गमा चारै भुजा बराबर | a square has four equal sides', ['वर्गमा कोण ९० होइन | angles are not 90°', 'वर्गका विकर्ण छैनन् | no diagonals'], i, { s: 0 });
  },
};
export const QuadLab6 = makeLab(quadCfg);

/* ───────────── circle ───────────── */
const CPART = [{ np: 'अर्धव्यास', en: 'Radius' }, { np: 'व्यास', en: 'Diameter' }, { np: 'जीवा', en: 'Chord' }, { np: 'चाप', en: 'Arc' }, { np: 'वृत्तखण्ड (सेक्टर)', en: 'Sector' }, { np: 'परिधि', en: 'Circumference' }];
export const circleCfg: LabCfg = {
  code: 'SIM-MATH-G6-L16-01', chapter: 16, titleNp: 'वृत्त प्रयोगशाला', titleEn: 'Circle Lab', color: '#ef4444',
  params: [{ id: 'r', np: 'अर्धव्यास r', en: 'Radius r', min: 1, max: 7, init: 4, color: '#ef4444' }, { id: 'pt', np: 'भाग', en: 'Part', min: 0, max: 5, init: 0, names: CPART, color: '#8b5cf6' }],
  stage: { camera: [0, 17, 11], target: [0, 0, 1], minDistance: 8, maxDistance: 30 },
  draw: (g, p, lang) => {
    const R = 0.5 * p.r; disc(g, R, '#fecaca', 0, 0.04, -1.5); const cz = -1.5; const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.07, 10, 80), mat(p.pt === 5 ? '#dc2626' : '#7f1d1d')); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.1, cz); g.add(ring);
    box(g, 0.3, 0.3, 0.3, 0, 0.2, cz, '#111827');
    const at = (a: number) => [R * Math.cos(rad(a)), 0.2, cz - R * Math.sin(rad(a))] as [number, number, number];
    if (p.pt === 0) rod(g, [0, 0.2, cz], at(30), '#2563eb', 0.14);
    if (p.pt === 1) rod(g, at(150), at(330), '#7c3aed', 0.14);
    if (p.pt === 2) rod(g, at(40), at(150), '#16a34a', 0.14);
    if (p.pt === 3) sector(g, R - 0.2, R + 0.2, rad(20), rad(120), '#f59e0b', 0, 0.12, cz, 1);
    if (p.pt === 4) sector(g, 0, R, rad(20), rad(120), '#fb923c', 0, 0.1, cz, 0.95);
    if (p.pt === 5) for (let k = 0; k < 3; k++) box(g, 2 * R, 0.14, 0.4, -R * 1.57 + R + k * 2 * R - 0.0, 0.1, cz + R + 1.6, ['#38bdf8', '#34d399', '#fbbf24'][k], 0.5);
    if (p.pt === 5) box(g, 2 * R * 0.1428, 0.14, 0.4, -R * 1.57 + R + 6 * R - R + R * 0.1428, 0.1, cz + R + 1.6, '#f43f5e', 0.5);
    tag(g, lang === 'ne' ? CPART[p.pt].np : CPART[p.pt].en, 0, 0.5, cz + R + 3.4, 4.4, { px: 56, w: 480, h: 96, bg: '#fff', border: '#ef4444' });
  },
  info: (p) => bi(`r = ${p.r} · d = 2r = ${2 * p.r} · परिधि = 2πr = ${((2 * 22 * p.r) / 7).toFixed(2)} · क्षेत्रफल = πr² = ${((22 * p.r * p.r) / 7).toFixed(2)} (π = 22/7)\nपरिधि ≈ ३ व्यास र केही बढी`, `r = ${p.r} · d = 2r = ${2 * p.r} · circumference = 2πr = ${((2 * 22 * p.r) / 7).toFixed(2)} · area = πr² = ${((22 * p.r * p.r) / 7).toFixed(2)} (π = 22/7)\nCircumference ≈ 3 diameters and a bit`),
  tip: bi('वृत्तका भाग छानौँ; परिधि = व्यासको ३ पटकभन्दा अलि बढी', 'Pick a part of the circle; the circumference is a little more than 3 diameters'),
  goal: () => { const pt = rnd(0, 5); return { p: { pt }, np: `${CPART[pt].np} देखाऔँ`, en: `Show the ${CPART[pt].en.toLowerCase()}`, start: { pt: (pt + 1) % 6 } }; },
  quiz: (i) => {
    const r = rnd(2, 9), r7 = 7 * rnd(1, 3);
    if (i === 0) return numChoice(`अर्धव्यास ${r} सेमी भए व्यास कति?`, `The radius is ${r} cm. The diameter is…`, 2 * r, i, [r, 4 * r, 1, -r, 2], 1, '', { r: Math.min(7, r), pt: 1 });
    if (i === 1) return numChoice(`व्यास ${2 * r} सेमी भए अर्धव्यास कति?`, `The diameter is ${2 * r} cm. The radius is…`, r, i, [r, 2 * r, 1, 4 * r, 2], 1, '', { r: Math.min(7, r), pt: 0 });
    if (i === 2) return numChoice(`अर्धव्यास ${r7} सेमी (π = 22/७) भए परिधि कति?`, `Radius ${r7} cm (π = 22/7). Circumference?`, 44 * (r7 / 7), i, [22, -22, 44, 7, r7], 1, '', { r: 7, pt: 5 });
    if (i === 3) return numChoice(`व्यास ${r7} सेमी (π = 22/७) भए परिधि कति?`, `Diameter ${r7} cm (π = 22/7). Circumference?`, 22 * (r7 / 7), i, [22, -22, 44, 7, r7], 1, '', { r: 4, pt: 5 });
    if (i === 4) return choice('वृत्तको केन्द्रबाट परिधिसम्म जोड्ने रेखा?', 'A line from the centre to the circle is…', 'अर्धव्यास | radius', ['जीवा | chord', 'व्यास | diameter', 'चाप | arc'], i, { pt: 0 });
    if (i === 5) return choice('केन्द्रबाट नजाने दुई बिन्दु जोड्ने रेखा?', 'A line joining two points on the circle but not through the centre is…', 'जीवा | chord', ['व्यास | diameter', 'अर्धव्यास | radius', 'चाप | arc'], i, { pt: 2 });
    if (i === 6) return choice('सबैभन्दा लामो जीवा?', 'The longest chord of a circle is the…', 'व्यास | diameter', ['अर्धव्यास | radius', 'चाप | arc', 'सेक्टर | sector'], i, { pt: 1 });
    return choice('परिधि ÷ व्यास = ?', 'Circumference ÷ diameter = ?', 'π (≈ 22/7)', ['2', '1', '4'], i, { pt: 5 });
  },
};
export const CircleLab6 = makeLab(circleCfg);

export const SolidLab6 = makeLab(solidCfg({ code: 'SIM-MATH-G6-L17-01', chapter: 17, titleNp: 'ठोस वस्तु र जाल', titleEn: 'Solids and Nets', six: true }));

/* ───────────── coordinate plane ───────────── */
const quad = (x: number, y: number) => (x === 0 || y === 0 ? 0 : x > 0 && y > 0 ? 1 : x < 0 && y > 0 ? 2 : x < 0 ? 3 : 4);
const QN = ['अक्षमा', 'पहिलो चतुर्थांश', 'दोस्रो चतुर्थांश', 'तेस्रो चतुर्थांश', 'चौथो चतुर्थांश'], QE = ['on an axis', 'Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'];
export const coordCfg: LabCfg = {
  code: 'SIM-MATH-G6-L18-01', chapter: 18, titleNp: 'निर्देशाङ्क समतल', titleEn: 'Coordinate Plane', color: '#22c55e',
  params: [{ id: 'x', np: 'x', en: 'x', min: -6, max: 6, init: 3, color: '#0ea5e9' }, { id: 'y', np: 'y', en: 'y', min: -6, max: 6, init: 2, color: '#ef4444' }, { id: 'rf', np: 'परावर्तन', en: 'Reflect', min: 0, max: 2, init: 0, names: [{ np: 'छैन', en: 'None' }, { np: 'x-अक्षमा', en: 'In x-axis' }, { np: 'y-अक्षमा', en: 'In y-axis' }] }],
  stage: { camera: [0, 14, 9], target: [0, 0, 0], minDistance: 8, maxDistance: 24 },
  draw: (g, p) => {
    const U = 0.95, X = (v: number) => v * U, Z = (v: number) => -v * U; [[1, 1, '#bbf7d0'], [-1, 1, '#fde68a'], [-1, -1, '#bfdbfe'], [1, -1, '#fbcfe8']].forEach(([sx, sy, c]) => box(g, 6.6 * U, 0.06, 6.6 * U, Number(sx) * 3.3 * U, 0.03, -Number(sy) * 3.3 * U, String(c), 0.9));
    for (let v = -6; v <= 6; v++) { if (v === 0) continue; rod(g, [X(v), 0.07, Z(-6.5)], [X(v), 0.07, Z(6.5)], '#e2e8f0', 0.025); rod(g, [X(-6.5), 0.07, Z(v)], [X(6.5), 0.07, Z(v)], '#e2e8f0', 0.025); tag(g, String(v), X(v), 0.2, Z(0) + 0.7, 0.9, { px: 48, w: 96, h: 64 }); tag(g, String(v), X(0) - 0.7, 0.2, Z(v), 0.9, { px: 48, w: 96, h: 64 }); }
    rod(g, [X(-6.8), 0.14, 0], [X(6.8), 0.14, 0], '#111827', 0.1); rod(g, [0, 0.14, Z(-6.8)], [0, 0.14, Z(6.8)], '#111827', 0.1); tag(g, 'x', X(7.3), 0.3, 0, 1.2, { px: 64, w: 96, h: 96 }); tag(g, 'y', 0, 0.3, Z(7.3), 1.2, { px: 64, w: 96, h: 96 });
    const pin = (x: number, y: number, c: string, label: string) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 14), mat(c, 0.3)); b.position.set(X(x), 0.5, Z(y)); g.add(b); rod(g, [X(x), 0.14, Z(0)], [X(x), 0.14, Z(y)], c, 0.05); rod(g, [X(0), 0.14, Z(y)], [X(x), 0.14, Z(y)], c, 0.05); tag(g, label, X(x) + 0.5, 1.4, Z(y), 1.9, { px: 52, w: 224, h: 80, bg: '#fff', border: c }); };
    pin(p.x, p.y, '#2563eb', `(${p.x}, ${p.y})`); if (p.rf === 1) pin(p.x, -p.y, '#dc2626', `(${p.x}, ${-p.y})`); if (p.rf === 2) pin(-p.x, p.y, '#dc2626', `(${-p.x}, ${p.y})`);
  },
  info: (p) => { const q = quad(p.x, p.y); return bi(`बिन्दु (${p.x}, ${p.y}) · ${QN[q]}${p.rf === 1 ? `\nx-अक्षमा परावर्तन: (${p.x}, ${-p.y})` : p.rf === 2 ? `\ny-अक्षमा परावर्तन: (${-p.x}, ${p.y})` : `\nx-अक्षबाट ${Math.abs(p.y)}, y-अक्षबाट ${Math.abs(p.x)} एकाइ टाढा`}`, `Point (${p.x}, ${p.y}) · ${QE[q]}${p.rf === 1 ? `\nReflected in the x-axis: (${p.x}, ${-p.y})` : p.rf === 2 ? `\nReflected in the y-axis: (${-p.x}, ${p.y})` : `\n${Math.abs(p.y)} units from the x-axis, ${Math.abs(p.x)} from the y-axis`}`); },
  tip: bi('x र y बदलेर बिन्दु चतुर्थांशमा कहाँ पर्छ हेरौँ', 'Change x and y and see which quadrant the point falls in'),
  goal: () => { const x = rnd(-6, 6), y = rnd(-6, 6); return { p: { x, y }, np: `बिन्दु (${x}, ${y}) राखौँ`, en: `Plot the point (${x}, ${y})`, start: { x: 0, y: 0, rf: 0 } }; },
  quiz: (i) => {
    const x = rnd(-6, 6) || 2, y = rnd(-6, 6) || -3; const q = quad(x, y); const set = { x, y, rf: 0 };
    if (i < 3) return choice(`(${x}, ${y}) कुन चतुर्थांशमा पर्छ?`, `Which quadrant is (${x}, ${y}) in?`, `${QN[q]} | ${QE[q]}`, [1, 2, 3, 4].filter((k) => k !== q).map((k) => `${QN[k]} | ${QE[k]}`), i, set);
    if (i === 3) return choice(`(${x}, ${y}) लाई x-अक्षमा परावर्तन गर्दा?`, `Reflect (${x}, ${y}) in the x-axis`, `(${x}, ${-y})`, [`(${-x}, ${y})`, `(${-x}, ${-y})`, `(${y}, ${x})`], i, { x, y, rf: 1 });
    if (i === 4) return choice(`(${x}, ${y}) लाई y-अक्षमा परावर्तन गर्दा?`, `Reflect (${x}, ${y}) in the y-axis`, `(${-x}, ${y})`, [`(${x}, ${-y})`, `(${-x}, ${-y})`, `(${y}, ${x})`], i, { x, y, rf: 2 });
    if (i === 5) return numChoice(`(${x}, ${y}) बाट x-अक्षसम्मको दुरी कति?`, `How far is (${x}, ${y}) from the x-axis?`, Math.abs(y), i, [1, -1, 2, Math.abs(x), 3], 0, '', set);
    if (i === 6) return choice('मूलबिन्दुको निर्देशाङ्क?', 'The coordinates of the origin are…', '(0, 0)', ['(1, 1)', '(0, 1)', '(1, 0)'], i, { x: 0, y: 0, rf: 0 });
    return choice(`बिन्दु (${Math.abs(x)}, ${-Math.abs(y)}) कुन चतुर्थांशमा?`, `Which quadrant holds (${Math.abs(x)}, ${-Math.abs(y)})?`, `${QN[4]} | ${QE[4]}`, [1, 2, 3].map((k) => `${QN[k]} | ${QE[k]}`), i, { x: Math.abs(x), y: -Math.abs(y), rf: 0 });
  },
};
export const CoordLab6 = makeLab(coordCfg);

/* ───────────── symmetry ───────────── */
const SYM: { np: string; en: string; n: number; lines: number; rot: number; pts: [number, number][]; ang: number[] }[] = (() => {
  const reg = (n: number, R = 2.8, ph = 90) => Array.from({ length: n }, (_, k) => [R * Math.cos(rad(ph + (360 * k) / n)), -R * Math.sin(rad(ph + (360 * k) / n))] as [number, number]);
  return [
    { np: 'वर्ग', en: 'Square', n: 4, lines: 4, rot: 4, pts: [[-2.2, -2.2], [2.2, -2.2], [2.2, 2.2], [-2.2, 2.2]], ang: [0, 45, 90, 135] },
    { np: 'आयत', en: 'Rectangle', n: 4, lines: 2, rot: 2, pts: [[-3.2, -1.8], [3.2, -1.8], [3.2, 1.8], [-3.2, 1.8]], ang: [0, 90] },
    { np: 'समबाहु त्रिभुज', en: 'Equilateral triangle', n: 3, lines: 3, rot: 3, pts: reg(3), ang: [90, 30, 150] },
    { np: 'समद्विबाहु त्रिभुज', en: 'Isosceles triangle', n: 3, lines: 1, rot: 1, pts: [[-2.4, 2], [2.4, 2], [0, -2.6]], ang: [90] },
    { np: 'नियमित पञ्चभुज', en: 'Regular pentagon', n: 5, lines: 5, rot: 5, pts: reg(5), ang: [90, 18, 162, 54, 126] },
    { np: 'नियमित षट्भुज', en: 'Regular hexagon', n: 6, lines: 6, rot: 6, pts: reg(6, 2.8, 0), ang: [0, 30, 60, 90, 120, 150] },
    { np: 'वृत्त', en: 'Circle', n: 0, lines: 99, rot: 99, pts: Array.from({ length: 48 }, (_, k) => [2.8 * Math.cos(rad(k * 7.5)), -2.8 * Math.sin(rad(k * 7.5))] as [number, number]), ang: [0, 30, 60, 90, 120, 150] },
  ];
})();
export const symmetryCfg: LabCfg = {
  code: 'SIM-MATH-G6-L19-01', chapter: 19, titleNp: 'सममिति प्रयोगशाला', titleEn: 'Symmetry Lab', color: '#ec4899',
  params: [{ id: 's', np: 'आकृति', en: 'Shape', min: 0, max: SYM.length - 1, init: 0, names: SYM.map((s) => ({ np: s.np, en: s.en })) }, { id: 'ln', np: 'सममिति रेखा', en: 'Line', min: 0, max: 5, init: 0, show: (v) => String(v + 1) }],
  stage: { camera: [0, 12, 8], target: [0, 0, 0], minDistance: 7, maxDistance: 22 },
  draw: (g, p, lang) => {
    const s = SYM[p.s]; poly(g, s.pts, '#fbcfe8', 0.04, 0.95); outline(g, s.pts, '#9d174d', 0.1, 0.1);
    s.ang.forEach((a, k) => { const hi = k === p.ln % s.ang.length; rod(g, [-4.2 * Math.cos(rad(a)), 0.2, 4.2 * Math.sin(rad(a))], [4.2 * Math.cos(rad(a)), 0.2, -4.2 * Math.sin(rad(a))], hi ? '#2563eb' : '#93c5fd', hi ? 0.14 : 0.06); });
    tag(g, `${lang === 'ne' ? s.np : s.en} — ${s.lines === 99 ? '∞' : s.lines} ${lang === 'ne' ? 'सममिति रेखा' : 'lines of symmetry'}`, 0, 0.5, 5.2, 6, { px: 50, w: 680, h: 96, bg: '#fff', border: '#ec4899' });
  },
  info: (p) => { const s = SYM[p.s]; return bi(`${s.np}: सममिति रेखा ${s.lines === 99 ? 'अनगिन्ती' : s.lines} · घूर्णन क्रम ${s.rot === 99 ? 'अनन्त' : s.rot}\nसममिति रेखाले आकृतिलाई दुई बराबर ऐना-जस्ता भागमा बाँड्छ`, `${s.en}: ${s.lines === 99 ? 'infinitely many' : s.lines} lines of symmetry · rotational order ${s.rot === 99 ? 'infinite' : s.rot}\nA line of symmetry splits a shape into two mirror halves`); },
  tip: bi('आकृति छानेर सममिति रेखाहरू गनौँ; नीलो रेखा एक एक गरी हेरौँ', 'Pick a shape and count its lines of symmetry; step through the blue lines'),
  goal: () => { const s = rnd(0, 5); return { p: { s }, np: `${SYM[s].lines} सममिति रेखा भएको आकृति देखाऔँ`, en: `Show a shape with ${SYM[s].lines} lines of symmetry`, start: { s: (s + 1) % 6 } }; },
  quiz: (i) => {
    const s = rnd(0, 5); const sh = SYM[s];
    if (i < 3) return numChoice(`${sh.np} मा कति सममिति रेखा हुन्छन्?`, `How many lines of symmetry does a ${sh.en.toLowerCase()} have?`, sh.lines, i, [1, -1, 2, 3, -2], 0, '', { s });
    if (i === 3) return choice('कुन आकृतिमा अनगिन्ती सममिति रेखा हुन्छन्?', 'Which shape has infinitely many lines of symmetry?', 'वृत्त | circle', ['वर्ग | square', 'आयत | rectangle', 'त्रिभुज | triangle'], i, { s: 6 });
    if (i === 4) return numChoice('नियमित षट्भुजमा कति सममिति रेखा हुन्छन्?', 'How many lines of symmetry has a regular hexagon?', 6, i, [4, 3, 8, 12, 5], 1, '', { s: 5 });
    if (i === 5) return choice('A, B, C, D मध्ये कुन अक्षर ठाडो सममिति भएको हो?', 'Which letter has a vertical line of symmetry?', 'A', ['F', 'G', 'R'], i);
    if (i === 6) return numChoice('आयतमा कति सममिति रेखा हुन्छन्?', 'How many lines of symmetry does a rectangle have?', 2, i, [1, 3, 4, 0], 0, '', { s: 1 });
    return choice('समद्विबाहु त्रिभुजमा कति सममिति रेखा?', 'Lines of symmetry in an isosceles triangle?', '1', ['2', '3', '0'], i, { s: 3 });
  },
};
export const SymmetryLab6 = makeLab(symmetryCfg);

/* ───────────── tessellation ───────────── */
const TES = [
  { np: 'समबाहु त्रिभुज', en: 'Triangle', ang: 60, ok: true }, { np: 'वर्ग', en: 'Square', ang: 90, ok: true }, { np: 'नियमित षट्भुज', en: 'Hexagon', ang: 120, ok: true },
  { np: 'नियमित पञ्चभुज', en: 'Pentagon', ang: 108, ok: false }, { np: 'नियमित अष्टभुज', en: 'Octagon', ang: 135, ok: false }, { np: 'वृत्त', en: 'Circle', ang: 0, ok: false },
];
const ngon = (cx: number, cz: number, R: number, n: number, ph = 90) => Array.from({ length: n }, (_, k) => [cx + R * Math.cos(rad(ph + (360 * k) / n)), cz - R * Math.sin(rad(ph + (360 * k) / n))] as [number, number]);
export const tessCfg: LabCfg = {
  code: 'SIM-MATH-G6-L19-02', chapter: 19, titleNp: 'टेस्सेलेसन', titleEn: 'Tessellation Lab', color: '#14b8a6',
  params: [{ id: 's', np: 'आकृति', en: 'Shape', min: 0, max: TES.length - 1, init: 2, names: TES.map((t) => ({ np: t.np, en: t.en })) }],
  stage: { camera: [0, 16, 7], target: [0, 0, 0], minDistance: 8, maxDistance: 26 },
  draw: (g, p, lang) => {
    const COL = ['#5eead4', '#a5b4fc', '#fcd34d', '#fda4af']; const put = (pts: [number, number][], k: number) => { poly(g, pts, COL[k % 4], 0.05, 0.95); outline(g, pts, '#0f172a', 0.09, 0.05); };
    if (p.s === 0) { const sd = 1.7, h = sd * 0.866; for (let r = -3; r <= 3; r++) for (let c = -6; c <= 6; c++) { const x = c * sd / 2 + (r % 2 ? sd / 4 : 0), z = r * h; const up = (c + r) % 2 === 0; put(up ? [[x - sd / 2, z + h / 2], [x + sd / 2, z + h / 2], [x, z - h / 2]] : [[x - sd / 2, z - h / 2], [x + sd / 2, z - h / 2], [x, z + h / 2]], (c + r + 4) % 4); } }
    if (p.s === 1) for (let r = -3; r <= 3; r++) for (let c = -6; c <= 6; c++) { const s = 1.5; put([[c * s - s / 2, r * s - s / 2], [c * s + s / 2, r * s - s / 2], [c * s + s / 2, r * s + s / 2], [c * s - s / 2, r * s + s / 2]], (c + r + 8) % 2); }
    if (p.s === 2) for (let r = -3; r <= 3; r++) for (let c = -5; c <= 5; c++) put(ngon(1.732 * (c + (r % 2 ? 0.5 : 0)), 1.5 * r, 1, 6, 30), (c + r + 8) % 3);
    if (p.s === 3) for (let r = -2; r <= 2; r++) for (let c = -4; c <= 4; c++) put(ngon(c * 2.4, r * 2.4, 1.15, 5), 0);
    if (p.s === 4) for (let r = -2; r <= 2; r++) for (let c = -4; c <= 4; c++) put(ngon(c * 2.2, r * 2.2, 1.2, 8, 22.5), 1);
    if (p.s === 5) for (let r = -2; r <= 2; r++) for (let c = -4; c <= 4; c++) disc(g, 1.05, '#fda4af', c * 2.1, 0.05, r * 2.1);
    const t = TES[p.s]; tag(g, `${lang === 'ne' ? t.np : t.en} — ${t.ok ? (lang === 'ne' ? 'खाली ठाउँ बिना भरिन्छ ✓' : 'fills the plane ✓') : lang === 'ne' ? 'खाली ठाउँ बाँकी रहन्छ ✗' : 'leaves gaps ✗'}`, 0, 0.6, -5.9, 7, { px: 50, w: 760, h: 96, bg: '#fff', border: t.ok ? '#22c55e' : '#ef4444' });
  },
  info: (p) => { const t = TES[p.s]; return bi(t.ang ? `${t.np}: भित्री कोण ${t.ang}° · ३६० ÷ ${t.ang} = ${(360 / t.ang).toFixed(t.ok ? 0 : 2)} ${t.ok ? '(पूर्ण सङ्ख्या ✓)' : '(पूर्ण सङ्ख्या होइन ✗)'}` : 'वृत्त: बीचमा खाली ठाउँ बाँकी रहन्छ', t.ang ? `${t.en}: interior angle ${t.ang}° · 360 ÷ ${t.ang} = ${(360 / t.ang).toFixed(t.ok ? 0 : 2)} ${t.ok ? '(whole number ✓)' : '(not a whole number ✗)'}` : 'Circle: gaps are left between the circles'); },
  tip: bi('कुन आकृतिले खाली ठाउँ नछाडी सतह भर्छ? ३६० ले भाग जाने कोण हुनुपर्छ', 'Which shapes tile the floor without gaps? The angles at a point must make 360°'),
  goal: () => { const s = [0, 1, 2][rnd(0, 2)]; return { p: { s }, np: `खाली ठाउँ नछाडी भर्ने ${TES[s].np} देखाऔँ`, en: `Show a shape that tiles with no gaps: ${TES[s].en.toLowerCase()}`, start: { s: 3 } }; },
  quiz: (i) => {
    const s = rnd(0, 5); const t = TES[s];
    if (i < 3) return choice(`${t.np} ले टेस्सेलेसन बनाउँछ?`, `Does a regular ${t.en.toLowerCase()} tessellate?`, t.ok ? 'बनाउँछ | Yes' : 'बनाउँदैन | No', [t.ok ? 'बनाउँदैन | No' : 'बनाउँछ | Yes'], i, { s });
    if (i === 3) return numChoice('समबाहु त्रिभुजको भित्री कोण कति?', 'The interior angle of an equilateral triangle is…', 60, i, [30, 90, 120, 45], 1, '°', { s: 0 });
    if (i === 4) return numChoice('बिन्दुमा ६ वटा समबाहु त्रिभुज जोडिँदा जम्मा कोण कति?', 'Six equilateral triangles meet at a point. The angles add up to…', 360, i, [180, 270, 720, 540], 1, '°', { s: 0 });
    if (i === 5) return choice('कुन तीन नियमित आकृतिले मात्र टेस्सेलेसन बनाउँछन्?', 'Which three regular shapes tessellate on their own?', 'त्रिभुज, वर्ग, षट्भुज | triangle, square, hexagon', ['वर्ग, पञ्चभुज, अष्टभुज | square, pentagon, octagon', 'त्रिभुज, पञ्चभुज, षट्भुज | triangle, pentagon, hexagon'], i);
    if (i === 6) return numChoice('षट्भुजको भित्री कोण कति?', 'The interior angle of a regular hexagon is…', 120, i, [60, 90, 108, 135], 1, '°', { s: 2 });
    return choice('टेस्सेलेसनमा आकृति बीच के हुनु हुँदैन?', 'In a tessellation there must be no…', 'खाली ठाउँ र ओभरल्याप | gaps or overlaps', ['रङ्ग | colours', 'सममिति | symmetry'], i);
  },
};
export const TessLab6 = makeLab(tessCfg);
void numChoice;
