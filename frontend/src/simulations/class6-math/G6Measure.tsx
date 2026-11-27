/**
 * Class 6 lesson 10 · Perimeter, area and volume (triangle, parallelogram, trapezium; volume blocks) and lesson 20 · Statistics.
 */
import { rnd } from '../class1-math-kit/nepali';
import { makeLab, LabCfg } from '../class5-math/Lab';
import { bi, choice, numChoice } from '../class5-math/h5';
import { volumeCfg } from '../class5-math/G5Measure';
import { box, tag, rod, poly, outline } from '../class5-math/vis';

const SH = [{ np: 'त्रिभुज', en: 'Triangle' }, { np: 'समानान्तर चतुर्भुज', en: 'Parallelogram' }, { np: 'समलम्ब चतुर्भुज', en: 'Trapezium' }];
const areaOf = (p: Record<string, number>) => (p.s === 0 ? (p.b * p.h) / 2 : p.s === 1 ? p.b * p.h : ((p.b + p.c) * p.h) / 2);
export const areaCfg: LabCfg = {
  code: 'SIM-MATH-G6-L10-01', chapter: 10, titleNp: 'क्षेत्रफल प्रयोगशाला', titleEn: 'Area Lab', color: '#22c55e',
  params: [
    { id: 's', np: 'आकृति', en: 'Shape', min: 0, max: 2, init: 0, names: SH, color: '#8b5cf6' }, { id: 'b', np: 'आधार b', en: 'Base b', min: 2, max: 12, init: 8, color: '#ef4444' },
    { id: 'h', np: 'उचाइ h', en: 'Height h', min: 1, max: 8, init: 5, color: '#0ea5e9' }, { id: 'c', np: 'माथिल्लो भुजा', en: 'Top side', min: 1, max: 12, init: 4, color: '#f59e0b' },
  ],
  stage: { camera: [0, 13, 9], target: [0, 0, 0], minDistance: 8, maxDistance: 24 },
  draw: (g, p, lang) => {
    const u = Math.min(0.8, 9 / Math.max(p.b, p.c, p.h * 1.5)); const b = p.b * u, h = p.h * u, c = p.c * u; let pts: [number, number][]; let hx: number;
    if (p.s === 0) { hx = -b / 2 + 0.35 * b; pts = [[-b / 2, h / 2], [b / 2, h / 2], [hx, -h / 2]]; }
    else if (p.s === 1) { const sl = 0.25 * b; hx = b / 2 + sl * 0; pts = [[-b / 2, h / 2], [b / 2, h / 2], [b / 2 + sl, -h / 2], [-b / 2 + sl, -h / 2]]; hx = -b / 2 + sl; }
    else { hx = -c / 2; pts = [[-b / 2, h / 2], [b / 2, h / 2], [c / 2, -h / 2], [-c / 2, -h / 2]]; }
    poly(g, pts, ['#bbf7d0', '#fde68a', '#bfdbfe'][p.s], 0.04, 0.95); outline(g, pts, '#14532d', 0.12, 0.1); rod(g, [hx, 0.2, -h / 2], [hx, 0.2, h / 2], '#dc2626', 0.07);
    tag(g, `b = ${p.b}`, 0, 0.4, h / 2 + 0.9, 2.2, { px: 52, w: 224, h: 80, color: '#b91c1c' }); tag(g, `h = ${p.h}`, hx - 0.9, 0.4, 0, 2.2, { px: 52, w: 224, h: 80, color: '#1d4ed8' }); if (p.s === 2) tag(g, `a = ${p.c}`, 0, 0.4, -h / 2 - 0.9, 2.2, { px: 52, w: 224, h: 80, color: '#b45309' });
    tag(g, `${lang === 'ne' ? 'क्षेत्रफल' : 'Area'} = ${areaOf(p)}`, 0, 0.6, h / 2 + 2.6, 4.6, { px: 58, w: 520, h: 96, bg: '#fff', border: '#22c55e' });
  },
  info: (p) => bi([`त्रिभुज · क्षेत्रफल = ½ × आधार × उचाइ = ½ × ${p.b} × ${p.h} = ${areaOf(p)}\nदुई त्रिभुजले एउटा समानान्तर चतुर्भुज बनाउँछन्`, `समानान्तर चतुर्भुज · क्षेत्रफल = आधार × उचाइ = ${p.b} × ${p.h} = ${areaOf(p)}\nतिरछो भुजा होइन, लम्ब उचाइ प्रयोग गर्ने`, `समलम्ब चतुर्भुज · क्षेत्रफल = ½ × (a + b) × h = ½ × (${p.c} + ${p.b}) × ${p.h} = ${areaOf(p)}\nसमानान्तर भुजाहरूको औसत × उचाइ`][p.s], [`Triangle · area = ½ × base × height = ½ × ${p.b} × ${p.h} = ${areaOf(p)}\nTwo triangles make one parallelogram`, `Parallelogram · area = base × height = ${p.b} × ${p.h} = ${areaOf(p)}\nUse the straight-up height, not the slanting side`, `Trapezium · area = ½ × (a + b) × h = ½ × (${p.c} + ${p.b}) × ${p.h} = ${areaOf(p)}\nAverage of the parallel sides × height`][p.s]),
  tip: bi('आकृति छानेर आधार र उचाइ बदली क्षेत्रफल हेरौँ', 'Pick a shape and change the base and height to see the area'),
  goal: () => { const s = rnd(0, 2), b = 2 * rnd(2, 6), h = 2 * rnd(1, 4), c = 2 * rnd(1, 5); return { p: { s, b, h, c }, np: `${SH[s].np} बनाऔँ — क्षेत्रफल ${areaOf({ s, b, h, c })}`, en: `Build a ${SH[s].en.toLowerCase()} with area ${areaOf({ s, b, h, c })}`, start: { s, b: 2, h: 1, c: 2 } }; },
  quiz: (i) => {
    const b = 2 * rnd(2, 6), h = 2 * rnd(1, 4), c = 2 * rnd(1, 5);
    if (i < 2) return numChoice(`आधार ${b} सेमी र उचाइ ${h} सेमी भएको त्रिभुजको क्षेत्रफल कति?`, `Area of a triangle with base ${b} cm and height ${h} cm?`, (b * h) / 2, i, [b, -h, b * h, 2, h], 1, '', { s: 0, b, h, c });
    if (i < 4) return numChoice(`आधार ${b} सेमी र उचाइ ${h} सेमी भएको समानान्तर चतुर्भुजको क्षेत्रफल कति?`, `Area of a parallelogram with base ${b} cm and height ${h} cm?`, b * h, i, [b, -h, (b * h) / 2, 2, h], 1, '', { s: 1, b, h, c });
    if (i < 6) return numChoice(`समानान्तर भुजा ${b} र ${c} सेमी, उचाइ ${h} सेमी भएको समलम्बको क्षेत्रफल कति?`, `A trapezium has parallel sides ${b} cm and ${c} cm and height ${h} cm. Area?`, ((b + c) * h) / 2, i, [b, -h, b * h, 2, h], 1, '', { s: 2, b, h, c });
    if (i === 6) return numChoice(`त्रिभुजको क्षेत्रफल ${(b * h) / 2} र आधार ${b} भए उचाइ कति?`, `A triangle has area ${(b * h) / 2} and base ${b}. Height?`, h, i, [1, -1, 2, b, 3], 1, '', { s: 0, b, h, c });
    return numChoice(`आधार ${b} र उचाइ ${h} भएको आयत र समानान्तर चतुर्भुजको क्षेत्रफलको फरक कति?`, `A rectangle and a parallelogram both have base ${b} and height ${h}. Difference of areas?`, 0, i, [1, 2, b, h, -1], 0, '', { s: 1, b, h, c });
  },
};
export const AreaLab6 = makeLab(areaCfg);
export const VolumeLab6 = makeLab(volumeCfg({ code: 'SIM-MATH-G6-L10-02', chapter: 10, titleNp: 'आयतन र क्षमता', titleEn: 'Volume and Capacity', six: true }));

/* ───────────── statistics ───────────── */
const sorted = (v: number[]) => [...v].sort((a, b) => a - b);
const stats = (p: Record<string, number>) => { const v = Array.from({ length: 7 }, (_, i) => p[`v${i}`]); const s = sorted(v); const sum = v.reduce((a, b) => a + b, 0); const cnt: Record<number, number> = {}; v.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); const mx = Math.max(...Object.values(cnt)); const modes = Object.keys(cnt).filter((k) => cnt[+k] === mx).map(Number); return { v, s, sum, mean: sum / 7, median: s[3], modes: mx === 1 ? [] : modes, range: s[6] - s[0] }; };
export const statsCfg: LabCfg = {
  code: 'SIM-MATH-G6-L20-01', chapter: 20, titleNp: 'तथ्याङ्क प्रयोगशाला', titleEn: 'Statistics Lab', color: '#f97316',
  params: Array.from({ length: 7 }, (_, i) => ({ id: `v${i}`, np: `मान ${i + 1}`, en: `Value ${i + 1}`, min: 1, max: 9, init: [4, 7, 3, 7, 5, 2, 7][i], color: '#f97316' })),
  stage: { camera: [0, 7, 15], target: [0, 3, 0], minDistance: 8, maxDistance: 26 },
  draw: (g, p, lang) => {
    const st = stats(p); box(g, 15, 0.2, 2.6, 0, 0.1, 0, '#e2e8f0');
    st.v.forEach((x, i) => { const isMode = st.modes.includes(x); for (let k = 0; k < x; k++) box(g, 1.5, 0.58, 1.3, -6.3 + i * 2.1, 0.5 + k * 0.62, 0, isMode ? '#ec4899' : '#fb923c', 0.5); tag(g, String(x), -6.3 + i * 2.1, 0.9 + x * 0.62 + 0.2, 0, 1.4, { px: 54, w: 128, h: 72, bg: '#fff', border: '#f97316' }); });
    box(g, 15, 0.06, 0.06, 0, 0.2 + st.mean * 0.62, 1.1, '#2563eb', 0.4); tag(g, `${lang === 'ne' ? 'औसत' : 'mean'} ${st.mean.toFixed(2).replace(/\.?0+$/, '')}`, 8.4, 0.2 + st.mean * 0.62, 1.1, 3, { px: 44, w: 320, h: 72, color: '#1d4ed8' });
  },
  info: (p) => { const st = stats(p); const m = st.mean.toFixed(2).replace(/\.?0+$/, ''); return bi(`औसत = ${st.sum} ÷ 7 = ${m} · मध्यिका = ${st.median} · रहुल (बहुलक) = ${st.modes.length ? st.modes.join(', ') : 'छैन'} · दायरा = ${st.range}\nक्रमबद्ध: ${st.s.join(', ')}`, `Mean = ${st.sum} ÷ 7 = ${m} · median = ${st.median} · mode = ${st.modes.length ? st.modes.join(', ') : 'none'} · range = ${st.range}\nIn order: ${st.s.join(', ')}`); },
  tip: bi('मान बदलेर औसत, मध्यिका र बहुलक कसरी बदलिन्छन् हेरौँ', 'Change the values and see how the mean, median and mode move'),
  goal: () => { const v = Array.from({ length: 7 }, () => rnd(1, 9)); const st = stats(Object.fromEntries(v.map((x, i) => [`v${i}`, x]))); return { p: Object.fromEntries(v.map((x, i) => [`v${i}`, x])), np: `औसत ${st.sum}/7, मध्यिका ${st.median} हुने सङ्ख्याहरू: ${v.join(', ')} बनाऔँ`, en: `Set the values ${v.join(', ')} (median ${st.median})`, start: Object.fromEntries(v.map((_x, i) => [`v${i}`, 1])) }; },
  quiz: (i) => {
    const mode = rnd(1, 9); const v = [mode, mode, ...Array.from({ length: 5 }, () => rnd(1, 9))].sort(() => Math.random() - 0.5); const set = Object.fromEntries(v.map((x, k) => [`v${k}`, x])); const st = stats(set);
    const list = v.join(', '); const meanInt = st.sum % 7 === 0;
    if (i === 0 || i === 1) return numChoice(`${list} को मध्यिका कति?`, `Median of ${list}?`, st.median, i, [1, -1, 2, st.range, -2], 1, '', set);
    if (i === 2) return numChoice(`${list} को दायरा (अधिकतम − न्यूनतम) कति?`, `Range of ${list}?`, st.range, i, [1, -1, 2, st.median, -2], 0, '', set);
    if (i === 3) return numChoice(`${list} को जम्मा कति?`, `Sum of ${list}?`, st.sum, i, [1, -1, 7, 2, -2], 1, '', set);
    if (i === 4) { const n = 7 * rnd(2, 8); return numChoice(`7 सङ्ख्याको जम्मा ${n} भए औसत कति?`, `The sum of 7 numbers is ${n}. Their mean is…`, n / 7, i, [1, -1, 7, 2, n], 1); }
    if (i === 5) return choice(`${list} को बहुलक (धेरै पटक आउने) कुन हो?`, `Mode (most frequent) of ${list}?`, String(st.modes.length ? st.modes[0] : mode), [String(st.median + 1), String(st.range + 1), String((st.median + 4) % 9 + 1)], i, set);
    if (i === 6) return numChoice('1, 2, 3, 4, 5 को औसत कति?', 'Mean of 1, 2, 3, 4, 5?', 3, i, [1, -1, 2, 15, 5], 1);
    return meanInt ? numChoice(`${list} को औसत कति?`, `Mean of ${list}?`, st.sum / 7, i, [1, -1, 2, 7, 3], 1, '', set) : choice('औसतको सूत्र?', 'The formula for the mean is…', 'sum ÷ number of values', ['sum × number', 'largest − smallest'], i);
  },
};
export const StatsLab6 = makeLab(statsCfg);
