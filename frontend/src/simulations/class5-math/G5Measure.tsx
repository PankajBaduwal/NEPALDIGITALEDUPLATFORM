/**
 * Class 5 lesson 8 · Time, lesson 12 · Perimeter, area and volume. (Class 6 lesson 10 reuses the volume lab.)
 */
import { rnd } from '../class1-math-kit/nepali';
import { makeLab, LabCfg } from './Lab';
import { bi, choice, numChoice } from './h5';
import { box, tag, tiles, outline, cubeBlock, rod, customDraw } from './vis';

/* ───────────── time ───────────── */
const t12 = (h: number, m: number) => `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
const t24 = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
const addT = (h: number, m: number, dh: number, dm: number): [number, number] => { const t = (h * 60 + m + dh * 60 + dm) % 1440; return [Math.floor(t / 60), t % 60]; };
export const timeCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#f59e0b',
  params: [
    { id: 'h', np: 'सुरु घण्टा', en: 'Start hour', min: 0, max: 23, init: 9, color: '#0ea5e9' }, { id: 'm', np: 'सुरु मिनेट', en: 'Start min', min: 0, max: 55, step: 5, init: 15, color: '#0ea5e9' },
    { id: 'dh', np: 'अवधि घण्टा', en: 'Hours later', min: 0, max: 12, init: 3, color: '#22c55e' }, { id: 'dm', np: 'अवधि मिनेट', en: 'Min later', min: 0, max: 55, step: 5, init: 30, color: '#22c55e' },
  ],
  stage: { camera: [0, 4, 13], target: [0, 3, 0], minDistance: 7, maxDistance: 22 },
  draw: (g, p, lang) => {
    const [eh, em] = addT(p.h, p.m, p.dh, p.dm);
    customDraw(g, (ctx, toScreen, scale) => {
      [[p.h, p.m, -4.2, '#0ea5e9'], [eh, em, 4.2, '#22c55e']].forEach(([h, m, x, c]) => {
        const [cx, cy] = toScreen(Number(x), 3.4, 0);
        const cr = 2.7 * scale;

        // Outer Rim
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 4, 0, Math.PI * 2);
        ctx.fill();

        // Clock Face
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 12 Numbers & Ticks
        for (let num = 1; num <= 12; num++) {
          const ang = (num / 12) * Math.PI * 2 - Math.PI / 2;
          const tx = cx + Math.cos(ang) * (cr * 0.78);
          const ty = cy + Math.sin(ang) * (cr * 0.78);
          ctx.fillStyle = '#1e293b';
          ctx.font = `bold ${Math.max(10, cr * 0.18)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(num), tx, ty);
        }

        // Hour Hand
        const hrVal = (Number(h) % 12) + Number(m) / 60;
        const hrAng = (hrVal / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = Math.max(3, cr * 0.08);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(hrAng) * (cr * 0.5), cy + Math.sin(hrAng) * (cr * 0.5));
        ctx.stroke();

        // Minute Hand
        const minAng = (Number(m) / 60) * Math.PI * 2 - Math.PI / 2;
        ctx.strokeStyle = String(c);
        ctx.lineWidth = Math.max(2, cr * 0.05);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(minAng) * (cr * 0.75), cy + Math.sin(minAng) * (cr * 0.75));
        ctx.stroke();

        // Center Cap
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Day/Night Orb above clock
        const day = Number(h) >= 6 && Number(h) < 18;
        const [ox, oy] = toScreen(Number(x), 7.1, 0);
        ctx.fillStyle = day ? '#facc15' : '#94a3b8';
        ctx.beginPath();
        ctx.arc(ox, oy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = day ? '#eab308' : '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }, 1);

    [[p.h, p.m, -4.2, '#0ea5e9'], [eh, em, 4.2, '#22c55e']].forEach(([h, m, x, c], i) => {
      tag(g, `${t24(Number(h), Number(m))}  (${t12(Number(h), Number(m))})`, Number(x), 0.2, 1.5, 4.4, { px: 46, w: 440, h: 80, bg: '#ffffff', border: String(c) });
      tag(g, i === 0 ? (lang === 'ne' ? 'सुरु' : 'Start') : lang === 'ne' ? 'अन्त्य' : 'End', Number(x), 8.1, 0, 2.2, { px: 50, w: 256, h: 80 });
    });
    rod(g, [-1.2, 3.4, 0.5], [1.2, 3.4, 0.5], '#f59e0b', 0.14);
  },
  info: (p) => { const [eh, em] = addT(p.h, p.m, p.dh, p.dm); return bi(`${t24(p.h, p.m)} + ${p.dh} घण्टा ${p.dm} मिनेट = ${t24(eh, em)}\n${t12(p.h, p.m)} → ${t12(eh, em)}`, `${t24(p.h, p.m)} + ${p.dh} h ${p.dm} min = ${t24(eh, em)}\n${t12(p.h, p.m)} → ${t12(eh, em)}`); },
  tip: bi('सुरु समय र अवधि थपेर अन्त्य समय हेरौँ (२४ घण्टे र १२ घण्टे)', 'Set a start time and a length of time, and read the end time in 24-hour and 12-hour form'),
  goal: () => { const h = rnd(0, 23), m = 5 * rnd(0, 11); return { p: { h, m }, np: `${t24(h, m)} (${t12(h, m)}) देखाऔँ`, en: `Show ${t24(h, m)} (${t12(h, m)})`, start: { h: 12, m: 0, dh: 0, dm: 0 } }; },
  quiz: (i) => {
    const h = rnd(1, 23), m = 5 * rnd(0, 11), dh = rnd(1, 5), dm = 5 * rnd(1, 11); const [eh, em] = addT(h, m, dh, dm);
    if (i === 0) { const hh = rnd(13, 23); return choice(`${t24(hh, m)} लाई १२ घण्टे समयमा लेख्दा?`, `Write ${t24(hh, m)} in 12-hour time`, t12(hh, m), [t12(hh - 12 + 1, m), t12(hh - 12, m + 5 > 55 ? 0 : m + 5).replace('AM', 'PM'), t12((hh + 6) % 24, m)], i, { h: hh, m, dh: 0, dm: 0 }); }
    if (i === 1) { const hh = rnd(1, 11); return choice(`${t12(hh + 12, m)} लाई २४ घण्टे समयमा लेख्दा?`, `Write ${t12(hh + 12, m)} in 24-hour time`, t24(hh + 12, m), [t24(hh, m), t24(hh + 12 === 23 ? 22 : hh + 13, m), t24((hh + 11) % 24, m)], i, { h: hh + 12, m, dh: 0, dm: 0 }); }
    if (i === 2 || i === 3) return choice(`${t24(h, m)} बाट ${dh} घण्टा ${dm} मिनेटपछि कति बज्छ?`, `What is the time ${dh} h ${dm} min after ${t24(h, m)}?`, t24(eh, em), [t24(eh, (em + 5) % 60), t24((eh + 1) % 24, em), t24((eh + 23) % 24, em)], i, { h, m, dh, dm });
    if (i === 4) { const a = 5 * rnd(0, 11); const d = rnd(30, 170); return numChoice(`${t24(rnd(6, 10), a)} देखि ${d} मिनेट कति घण्टा कति मिनेट हुन्छ? (मिनेट मात्र)`, `${d} minutes: how many minutes are left after taking out whole hours?`, d % 60, i, [5, -5, 10, 30, 15], 0); }
    if (i === 5) return numChoice('१ घण्टा = कति मिनेट?', 'How many minutes in 1 hour?', 60, i, [30, 40, 100, -20, 20], 1);
    if (i === 6) return numChoice('१ मिनेट = कति सेकेन्ड?', 'How many seconds in 1 minute?', 60, i, [30, 100, 10, -20, 20], 1);
    return numChoice('एक दिनमा कति घण्टा हुन्छन्?', 'How many hours are in one day?', 24, i, [12, 48, 10, -12, 6], 1);
  },
});
export const TimeLab5 = makeLab(timeCfg({ code: 'SIM-MATH-G5-L8-01', chapter: 8, titleNp: 'समय प्रयोगशाला', titleEn: 'Time Lab' }));

/* ───────────── perimeter and area ───────────── */
export const perimeterCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#22c55e',
  params: [{ id: 'l', np: 'लम्बाइ', en: 'Length', min: 1, max: 12, init: 7, color: '#ef4444' }, { id: 'b', np: 'चौडाइ', en: 'Breadth', min: 1, max: 8, init: 4, color: '#0ea5e9' }],
  stage: { camera: [0, 13, 9], target: [0, 0, 0], minDistance: 7, maxDistance: 24 },
  draw: (g, p, lang) => {
    tiles(g, p.l, p.b, '#86efac', 1, 0, 0, '#bbf7d0');
    const x = p.l / 2, z = p.b / 2; outline(g, [[-x, -z], [x, -z], [x, z], [-x, z]], '#dc2626', 0.18, 0.16);
    tag(g, `${p.l}`, 0, 0.3, z + 0.9, 2, { px: 60, w: 128, h: 96, bg: '#fff', border: '#ef4444' }); tag(g, `${p.b}`, x + 1, 0.3, 0, 2, { px: 60, w: 128, h: 96, bg: '#fff', border: '#0ea5e9' });
    tag(g, lang === 'ne' ? (p.l === p.b ? 'वर्ग' : 'आयत') : p.l === p.b ? 'Square' : 'Rectangle', 0, 0.5, -z - 1.2, 3, { px: 54, w: 320, h: 96, bg: '#fff', border: '#22c55e' });
  },
  info: (p) => bi(`${p.l === p.b ? 'वर्ग' : 'आयत'} · परिमिति = 2 × (${p.l} + ${p.b}) = ${2 * (p.l + p.b)}\nक्षेत्रफल = ${p.l} × ${p.b} = ${p.l * p.b} वर्ग एकाइ`, `${p.l === p.b ? 'Square' : 'Rectangle'} · Perimeter = 2 × (${p.l} + ${p.b}) = ${2 * (p.l + p.b)}\nArea = ${p.l} × ${p.b} = ${p.l * p.b} square units`),
  tip: bi('लम्बाइ र चौडाइ बदलेर परिमिति (किनारा) र क्षेत्रफल (टाइल) हेरौँ', 'Change length and breadth: the red edge is the perimeter, the tiles are the area'),
  goal: () => { const l = rnd(2, 12), b = rnd(2, 8); return { p: { l, b }, np: `क्षेत्रफल ${l * b} र परिमिति ${2 * (l + b)} हुने आयत बनाऔँ`, en: `Make a rectangle with area ${l * b} and perimeter ${2 * (l + b)}`, start: { l: 1, b: 1 } }; },
  quiz: (i) => {
    const l = rnd(3, 12), b = rnd(2, 8), s = rnd(2, 9);
    if (i === 0) return numChoice(`लम्बाइ ${l} र चौडाइ ${b} भएको आयतको परिमिति कति?`, `Perimeter of a rectangle ${l} by ${b}?`, 2 * (l + b), i, [2, -2, 4, l * b, b], 1, '', { l, b });
    if (i === 1) return numChoice(`लम्बाइ ${l} र चौडाइ ${b} भएको आयतको क्षेत्रफल कति?`, `Area of a rectangle ${l} by ${b}?`, l * b, i, [l, -b, 2 * (l + b), 4, b], 1, '', { l, b });
    if (i === 2) return numChoice(`भुजा ${s} भएको वर्गको परिमिति कति?`, `Perimeter of a square of side ${s}?`, 4 * s, i, [s, -s, s * s, 2, 2 * s], 1, '', { l: s, b: s });
    if (i === 3) return numChoice(`भुजा ${s} भएको वर्गको क्षेत्रफल कति?`, `Area of a square of side ${s}?`, s * s, i, [s, -s, 4 * s, 2, 2 * s], 1, '', { l: s, b: s });
    if (i === 4) return numChoice(`आयतको क्षेत्रफल ${l * b} र लम्बाइ ${l} भए चौडाइ कति?`, `The area is ${l * b} and the length is ${l}. What is the breadth?`, b, i, [1, -1, 2, l, 3], 1, '', { l, b });
    if (i === 5) return numChoice(`आयतको परिमिति ${2 * (l + b)} र लम्बाइ ${l} भए चौडाइ कति?`, `The perimeter is ${2 * (l + b)} and the length is ${l}. What is the breadth?`, b, i, [1, -1, 2, l, 3], 1, '', { l, b });
    if (i === 6) return numChoice(`${l} मि लम्बाइ र ${b} मि चौडाइको कोठामा १ वर्ग मिको टाइल कति चाहिन्छ?`, `A room is ${l} m by ${b} m. How many 1 m² tiles cover it?`, l * b, i, [l, 2 * (l + b), -b, 4, b], 1, '', { l, b });
    return numChoice(`${l} मि लम्बाइ र ${b} मि चौडाइको खेतको वरिपरि तार लगाउन कति मिटर चाहिन्छ?`, `How much fence goes round a ${l} m by ${b} m field?`, 2 * (l + b), i, [l * b, 2, 4, l + b, -b], 1, '', { l, b });
  },
});
export const PerimeterAreaLab5 = makeLab(perimeterCfg({ code: 'SIM-MATH-G5-L12-01', chapter: 12, titleNp: 'परिमिति र क्षेत्रफल', titleEn: 'Perimeter and Area Lab' }));

/* ───────────── volume ───────────── */
export const volumeCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string; six?: boolean }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#f97316',
  params: [{ id: 'l', np: 'लम्बाइ', en: 'Length', min: 1, max: 8, init: 4, color: '#ef4444' }, { id: 'b', np: 'चौडाइ', en: 'Breadth', min: 1, max: 8, init: 3, color: '#0ea5e9' }, { id: 'h', np: 'उचाइ', en: 'Height', min: 1, max: 8, init: 2, color: '#22c55e' }],
  stage: { camera: [8, 9, 12], target: [0, 2, 0], minDistance: 7, maxDistance: 26 },
  draw: (g, p, lang) => {
    cubeBlock(g, p.l, p.b, p.h, '#fb923c', 0.9);
    tag(g, `${p.l} × ${p.b} × ${p.h} = ${p.l * p.b * p.h}`, 0, p.h * 0.9 + 1.2, 0, 4.4, { px: 54, w: 520, h: 96, bg: '#fff', border: '#f97316' }); void lang;
  },
  info: (p) => bi(`आयतन = ${p.l} × ${p.b} × ${p.h} = ${p.l * p.b * p.h} घन एकाइ\n${p.l === p.b && p.b === p.h ? 'यो घन हो: आयतन = भुजा³' : 'घनाभ: आयतन = लम्बाइ × चौडाइ × उचाइ'}`, `Volume = ${p.l} × ${p.b} × ${p.h} = ${p.l * p.b * p.h} cubic units\n${p.l === p.b && p.b === p.h ? 'This is a cube: volume = side³' : 'Cuboid: volume = length × breadth × height'}`),
  tip: bi('इकाइ घन गनेर आयतन हेरौँ: लम्बाइ × चौडाइ × उचाइ', 'Count the unit cubes: volume = length × breadth × height'),
  goal: () => { const l = rnd(2, 6), b = rnd(2, 5), h = rnd(2, 4); return { p: { l, b, h }, np: `आयतन ${l * b * h} हुने ${l} × ${b} × ${h} घनाभ बनाऔँ`, en: `Build the ${l} × ${b} × ${h} cuboid (volume ${l * b * h})`, start: { l: 1, b: 1, h: 1 } }; },
  quiz: (i) => {
    const l = rnd(2, 8), b = rnd(2, 6), h = rnd(2, 5), s = rnd(2, 8);
    if (i === 0 || i === 1) return numChoice(`${l} सेमी × ${b} सेमी × ${h} सेमी घनाभको आयतन कति?`, `Volume of a ${l} × ${b} × ${h} cm cuboid?`, l * b * h, i, [l, -b, 2 * (l + b), l * b, h], 1, '', { l, b, h });
    if (i === 2) return numChoice(`भुजा ${s} सेमी भएको घनको आयतन कति?`, `Volume of a cube of side ${s} cm?`, s * s * s, i, [s, 3 * s, s * s, 6 * s, -s], 1, '', { l: s, b: s, h: s });
    if (i === 3) return numChoice(`घनाभको आयतन ${l * b * h}, लम्बाइ ${l}, चौडाइ ${b} भए उचाइ कति?`, `Volume ${l * b * h}, length ${l}, breadth ${b}. What is the height?`, h, i, [1, -1, 2, 3, b], 1, '', { l, b, h });
    if (i === 4) return choice('१ लिटर = कति घन सेमी?', '1 litre = how many cm³?', '1000', ['100', '10', '10000'], i);
    if (i === 5) return numChoice(`${l * b * h} घन सेमी आयतनको ठोस वस्तुमा ${l * b} वर्ग सेमी आधार भए उचाइ कति?`, `Base area is ${l * b} cm² and volume ${l * b * h} cm³. Height?`, h, i, [1, -1, 2, 3, b], 1);
    if (o.six) { if (i === 6) return numChoice(`${l} मि × ${b} मि × ${h} मि को ट्याङ्कीको आयतन कति घन मि?`, `A tank ${l} m × ${b} m × ${h} m holds how many m³?`, l * b * h, i, [l, b, 2 * (l + b), l * b, h], 1); return numChoice(`१० सेमी × १० सेमी × १० सेमीको भाँडामा कति लिटर पानी अट्छ?`, 'A 10 cm × 10 cm × 10 cm box holds how many litres?', 1, i, [10, 100, 2, 1000, 5], 1); }
    if (i === 6) return numChoice(`१० सेमी × १० सेमी × १० सेमीको भाँडामा कति लिटर पानी अट्छ?`, 'A 10 cm × 10 cm × 10 cm box holds how many litres?', 1, i, [10, 100, 2, 1000, 5], 1);
    return numChoice(`दुई घन (भुजा ${s} सेमी) जोड्दा आयतन कति हुन्छ?`, `Two cubes of side ${s} cm are joined. Total volume?`, 2 * s * s * s, i, [s * s * s, 6 * s, 3 * s, s * s, -s], 1);
  },
});
export const VolumeLab5 = makeLab(volumeCfg({ code: 'SIM-MATH-G5-L12-02', chapter: 12, titleNp: 'आयतन ब्लक', titleEn: 'Volume Blocks' }));
void box;
