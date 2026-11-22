/**
 * Class 5 lesson 1 · Lines and angles (AngleLab) and lesson 2 · Solid objects (SolidLab).
 * `solidCfg` is also used by Class 6 lesson 17.
 */
import { rnd } from '../class1-math-kit/nepali';
import { makeLab, LabCfg } from './Lab';
import { bi, choice, numChoice, Params } from './h5';
import { box, tag, rod, sector, disc, customDraw } from './vis';

/* ───────────── Angle lab ───────────── */
const kindOf = (a: number) => (a === 0 ? 0 : a < 90 ? 1 : a === 90 ? 2 : a < 180 ? 3 : a === 180 ? 4 : a < 360 ? 5 : 6);
export const KINDS = [
  { np: 'शून्य कोण', en: 'Zero angle' }, { np: 'न्यून कोण', en: 'Acute angle' }, { np: 'समकोण', en: 'Right angle' }, { np: 'अधिक कोण', en: 'Obtuse angle' },
  { np: 'सरल कोण', en: 'Straight angle' }, { np: 'प्रतिवर्ती कोण', en: 'Reflex angle' }, { np: 'पूर्ण कोण', en: 'Complete angle' },
];
const R = 6;
export const angleCfg: LabCfg = {
  code: 'SIM-MATH-G5-L1-01', chapter: 1, titleNp: 'कोण प्रयोगशाला', titleEn: 'Angle Lab', color: '#0ea5e9',
  params: [{ id: 'ang', np: 'कोण', en: 'Angle', min: 0, max: 360, step: 5, init: 45, show: (v) => `${v}°` }],
  stage: { camera: [0, 10, 11], target: [0, 0, -1.5], minDistance: 7, maxDistance: 24 },
  draw: (g, p, lang) => {
    const a = (p.ang * Math.PI) / 180; const ar = (x: number) => [R * 1.08 * Math.cos(x), 0.15, -R * 1.08 * Math.sin(x)] as [number, number, number];
    sector(g, 0, R * 1.05, 0, Math.PI, '#bae6fd', 0, 0.02, 0, 0.45);
    for (let d = 0; d <= 180; d += 10) { const x = (d * Math.PI) / 180; const in2 = d % 30 === 0 ? 0.82 : 0.92; rod(g, [R * in2 * Math.cos(x), 0.06, -R * in2 * Math.sin(x)], [R * 1.05 * Math.cos(x), 0.06, -R * 1.05 * Math.sin(x)], '#0369a1', 0.05); if (d % 30 === 0) tag(g, `${d}°`, 1.3 * R * 0.86 * Math.cos(x), 0.1, -1.3 * R * 0.86 * Math.sin(x), 1.1, { px: 40, w: 128, h: 64 }); }
    sector(g, 0, 2.6, 0, a || 0.001, '#facc15', 0, 0.09, 0, 0.9);
    rod(g, [0, 0.15, 0], ar(0), '#1e293b', 0.14); rod(g, [0, 0.15, 0], ar(a), '#ef4444', 0.16);
    box(g, 0.5, 0.5, 0.5, 0, 0.25, 0, '#1e293b');
    const k = KINDS[kindOf(p.ang)]; tag(g, `${p.ang}° · ${lang === 'ne' ? k.np : k.en}`, 0, 0.2, 8, 4, { px: 54, w: 480, h: 96, bg: '#ffffff', border: '#ef4444' });
  },
  info: (p) => { const k = KINDS[kindOf(p.ang)]; return bi(`${p.ang}° — ${k.np}`, `${p.ang}° — ${k.en}`); },
  tip: bi('कोण घटाइबढाइ गरी चाँदमा पढौँ र नाम भनौँ', 'Change the angle, read it on the protractor and name it'),
  goal: () => { const t = 15 * rnd(1, 23); return { p: { ang: t }, np: toN(`${t}° को कोण बनाऔँ`), en: `Make an angle of ${t}°` }; },
  quiz: (i) => {
    const pick = (lo: number, hi: number) => 5 * rnd(lo / 5, hi / 5);
    if (i === 0) { const a = pick(10, 85); return choice('यो कुन कोण हो?', 'What kind of angle is this?', 'न्यून कोण | Acute', ['अधिक कोण | Obtuse', 'समकोण | Right', 'सरल कोण | Straight'], i, { ang: a }); }
    if (i === 1) { const a = pick(100, 175); return choice('यो कुन कोण हो?', 'What kind of angle is this?', 'अधिक कोण | Obtuse', ['न्यून कोण | Acute', 'समकोण | Right', 'प्रतिवर्ती कोण | Reflex'], i, { ang: a }); }
    if (i === 2) { const a = 5 * rnd(2, 16); return numChoice(`${a}° को पूरक कोण कति हो?`, `What is the complement of ${a}°?`, 90 - a, i, [10, -10, 20, 5, 90], 1, '°'); }
    if (i === 3) { const a = 5 * rnd(4, 32); return numChoice(`${a}° को सम्पूरक कोण कति हो?`, `What is the supplement of ${a}°?`, 180 - a, i, [10, -10, 20, 90, -20], 1, '°'); }
    if (i === 4) { const a = pick(190, 350); return choice('यो कुन कोण हो?', 'What kind of angle is this?', 'प्रतिवर्ती कोण | Reflex', ['अधिक कोण | Obtuse', 'सरल कोण | Straight', 'न्यून कोण | Acute'], i, { ang: a }); }
    if (i === 5) return choice('समकोण कति डिग्रीको हुन्छ?', 'How many degrees is a right angle?', '90°', ['45°', '180°', '60°'], i, { ang: 90 });
    if (i === 6) return choice('सरल कोण कति डिग्रीको हुन्छ?', 'How many degrees is a straight angle?', '180°', ['90°', '360°', '120°'], i, { ang: 180 });
    const a = 5 * rnd(8, 30); return numChoice(`सरल रेखामा एउटा कोण ${a}° छ भने अर्को कोण कति?`, `On a straight line one angle is ${a}°. What is the other?`, 180 - a, i, [10, -10, 20, 90, -20], 1, '°');
  },
};
const toN = (s: string) => s;
export const AngleLab5 = makeLab(angleCfg);

/* ───────────── Solid lab ───────────── */
type Face = number[][];
const boxFaces = (a: number, b: number, c: number): Face[] => { const V = [[-a, -b, -c], [a, -b, -c], [a, b, -c], [-a, b, -c], [-a, -b, c], [a, -b, c], [a, b, c], [-a, b, c]]; return [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]].map((f) => f.map((i) => V[i])); };
const prism: Face[] = (() => { const V = [[-1.5, -1.1, -1.7], [1.5, -1.1, -1.7], [0, 1.3, -1.7], [-1.5, -1.1, 1.7], [1.5, -1.1, 1.7], [0, 1.3, 1.7]]; return [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]].map((f) => f.map((i) => V[i])); })();
const pyramid: Face[] = (() => { const V = [[-1.6, -1.3, -1.6], [1.6, -1.3, -1.6], [1.6, -1.3, 1.6], [-1.6, -1.3, 1.6], [0, 1.9, 0]]; return [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]].map((f) => f.map((i) => V[i])); })();
const tetra: Face[] = (() => { const V = [[-1.6, -1.2, -1], [1.6, -1.2, -1], [0, -1.2, 1.9], [0, 1.7, 0]]; return [[0, 1, 2], [0, 1, 3], [1, 2, 3], [2, 0, 3]].map((f) => f.map((i) => V[i])); })();
interface Solid { np: string; en: string; faces?: Face[]; curved?: 'cyl' | 'cone' | 'sphere'; F: number; E: number; V: number; fl: number }
export const SOLIDS: Solid[] = [
  { np: 'घन', en: 'Cube', faces: boxFaces(1.5, 1.5, 1.5), F: 6, E: 12, V: 8, fl: 6 },
  { np: 'घनाभ', en: 'Cuboid', faces: boxFaces(2.1, 1.2, 1.6), F: 6, E: 12, V: 8, fl: 6 },
  { np: 'त्रिकोणीय प्रिज्म', en: 'Triangular prism', faces: prism, F: 5, E: 9, V: 6, fl: 5 },
  { np: 'वर्गाधार पिरामिड', en: 'Square pyramid', faces: pyramid, F: 5, E: 8, V: 5, fl: 5 },
  { np: 'त्रिकोणीय पिरामिड', en: 'Triangular pyramid', faces: tetra, F: 4, E: 6, V: 4, fl: 4 },
  { np: 'बेलना', en: 'Cylinder', curved: 'cyl', F: 3, E: 2, V: 0, fl: 2 },
  { np: 'शङ्कु', en: 'Cone', curved: 'cone', F: 2, E: 1, V: 1, fl: 1 },
  { np: 'गोला', en: 'Sphere', curved: 'sphere', F: 1, E: 0, V: 0, fl: 0 },
];
const FC = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#0ea5e9', '#8b5cf6'];

const drawSolid = (g: any, s: Solid, spread: number) => {
  customDraw(g, (ctx, toScreen, scale) => {
    if (s.faces) {
      // 3D rotation angle
      const rotY = 0.6;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      // Project 3D vector with rotation and spread
      const proj = (vx: number, vy: number, vz: number, cx: number, cy: number, cz: number) => {
        const ox = vx + cx * spread * 0.7;
        const oy = vy + cy * spread * 0.7 + 3.0;
        const oz = vz + cz * spread * 0.7;
        // Rotate around Y
        const rx = ox * cosY - oz * sinY;
        const rz = ox * sinY + oz * cosY;
        return toScreen(rx, oy, rz);
      };

      // Compute faces with centroid for depth sorting
      const sortedFaces = s.faces.map((f, k) => {
        let cx = 0, cy = 0, cz = 0;
        f.forEach(([vx, vy, vz]) => { cx += vx; cy += vy; cz += vz; });
        cx /= f.length; cy /= f.length; cz /= f.length;
        const rz = cx * sinY + cz * cosY;
        return { f, k, cx, cy, cz, depth: rz };
      }).sort((a, b) => a.depth - b.depth);

      sortedFaces.forEach(({ f, k, cx, cy, cz }) => {
        ctx.fillStyle = FC[k % 6];
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        f.forEach(([vx, vy, vz], idx) => {
          const [sx, sy] = proj(vx, vy, vz, cx, cy, cz);
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    } else if (s.curved === 'cyl') {
      const [topX, topY] = toScreen(0, 4.4, 0);
      const [botX, botY] = toScreen(0, 1.6, 0);
      const rw = 1.4 * scale;
      const rh = 0.45 * scale;

      // Cylinder Body
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.moveTo(topX - rw, topY);
      ctx.lineTo(botX - rw, botY);
      ctx.ellipse(botX, botY, rw, rh, 0, Math.PI, 0, true);
      ctx.lineTo(topX + rw, topY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top Lid
      ctx.fillStyle = '#7DD3FC';
      ctx.beginPath();
      ctx.ellipse(topX, topY, rw, rh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (s.curved === 'cone') {
      const [apexX, apexY] = toScreen(0, 4.8, 0);
      const [botX, botY] = toScreen(0, 1.6, 0);
      const rw = 1.7 * scale;
      const rh = 0.45 * scale;

      // Cone Body
      ctx.fillStyle = '#FB923C';
      ctx.beginPath();
      ctx.moveTo(apexX, apexY);
      ctx.lineTo(botX - rw, botY);
      ctx.ellipse(botX, botY, rw, rh, 0, Math.PI, 0, true);
      ctx.lineTo(apexX, apexY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#EA580C';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bottom Base Outline
      ctx.fillStyle = '#FDBA74';
      ctx.beginPath();
      ctx.ellipse(botX, botY, rw, rh, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Sphere
      const [cx, cy] = toScreen(0, 3, 0);
      const rad = 1.9 * scale;
      const grad = ctx.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, rad * 0.1, cx, cy, rad);
      grad.addColorStop(0, '#86EFAC');
      grad.addColorStop(0.7, '#22C55E');
      grad.addColorStop(1, '#15803D');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, 1);
};

export const solidCfg = (o: { code: string; chapter: number; titleNp: string; titleEn: string; six?: boolean }): LabCfg => ({
  code: o.code, chapter: o.chapter, titleNp: o.titleNp, titleEn: o.titleEn, color: '#8b5cf6',
  params: [
    { id: 'solid', np: 'ठोस', en: 'Solid', min: 0, max: SOLIDS.length - 1, init: 0, names: SOLIDS.map((s) => ({ np: s.np, en: s.en })) },
    { id: 'spread', np: 'फैलाउने', en: 'Spread', min: 0, max: 3, init: 0, show: (v) => ['●', '◐', '◑', '○'][v] },
  ],
  stage: { camera: [0, 5, 12], target: [0, 2.8, 0], minDistance: 6, maxDistance: 22 },
  draw: (g, p, lang) => {
    const s = SOLIDS[p.solid]; drawSolid(g, s, p.spread);
    tag(g, lang === 'ne' ? s.np : s.en, 0, 6.6, 0, 3.4, { px: 58, w: 420, h: 96, bg: '#ffffff', border: '#8b5cf6' });
    tag(g, `${lang === 'ne' ? 'सतह' : 'Faces'} ${s.F} · ${lang === 'ne' ? 'किनारा' : 'Edges'} ${s.E} · ${lang === 'ne' ? 'शीर्ष' : 'Vertices'} ${s.V}`.replace(/\d+/g, (d) => (lang === 'ne' ? [...d].map((c) => '०१२३४५६७८९'[+c]).join('') : d)), 0, -2.2, 3.5, 6, { px: 44, w: 640, h: 80, bg: '#ffffff', border: '#cbd5e1' });
  },
  info: (p) => { const s = SOLIDS[p.solid]; return bi(`${s.np}\nसतह ${s.F} · किनारा ${s.E} · शीर्ष ${s.V}\nफैलाउने बटनले सतह छुट्याएर हेरौँ`, `${s.en}\nFaces ${s.F} · Edges ${s.E} · Vertices ${s.V}\nUse Spread to pull the faces apart`); },
  tip: bi('ठोस छानौँ, घुमाऔँ र सतह, किनारा, शीर्ष गनौँ', 'Pick a solid, turn it and count faces, edges and vertices'),
  goal: () => { const k = rnd(0, SOLIDS.length - 1); const s = SOLIDS[k]; return { p: { solid: k }, np: `${s.F} सतह र ${s.E} किनारा भएको ठोस बनाऔँ`, en: `Show the solid with ${s.F} faces and ${s.E} edges` }; },
  quiz: (i) => {
    const flat = SOLIDS.filter((s) => s.faces); const k = rnd(0, flat.length - 1); const s = flat[k]; const si = SOLIDS.indexOf(s);
    if (i === 0) return numChoice(`${s.np} मा कति सतह हुन्छन्?`, `How many faces does a ${s.en.toLowerCase()} have?`, s.F, i, [1, -1, 2, 3, -2], 1, '', { solid: si });
    if (i === 1) return numChoice(`${s.np} मा कति किनारा हुन्छन्?`, `How many edges does a ${s.en.toLowerCase()} have?`, s.E, i, [1, -1, 2, 3, -2], 1, '', { solid: si });
    if (i === 2) return numChoice(`${s.np} मा कति शीर्ष हुन्छन्?`, `How many vertices does a ${s.en.toLowerCase()} have?`, s.V, i, [1, -1, 2, 3, -2], 1, '', { solid: si });
    if (i === 3) return choice('कुन ठोसमा ६ वटै सतह वर्गाकार हुन्छन्?', 'Which solid has six square faces?', 'घन | Cube', ['घनाभ | Cuboid', 'बेलना | Cylinder', 'पिरामिड | Pyramid'], i, { solid: 0 });
    if (i === 4) return choice('कुन ठोसमा कुनै शीर्ष हुँदैन?', 'Which solid has no vertex at all?', 'गोला | Sphere', ['घन | Cube', 'शङ्कु | Cone', 'घनाभ | Cuboid'], i, { solid: 7 });
    if (i === 5) return choice('कुन ठोसमा समतल र वक्र दुवै सतह हुन्छन्?', 'Which solid has both flat and curved surfaces?', 'बेलना | Cylinder', ['घन | Cube', 'गोला | Sphere', 'घनाभ | Cuboid'], i, { solid: 5 });
    if (o.six) {
      if (i === 6) { const n = rnd(3, 8); return numChoice(`आधार ${n} भुजा भएको प्रिज्ममा कति सतह हुन्छन्?`, `How many faces has a prism whose base has ${n} sides?`, n + 2, i, [1, -1, 2, n, -2], 1); }
      return choice('घनको जाल बनाउँदा कति वर्ग चाहिन्छ?', 'How many squares are needed to make the net of a cube?', '6', ['4', '8', '12'], i, { solid: 0, spread: 3 });
    }
    if (i === 6) return numChoice(`घनमा किनारा कति?`, `How many edges does a cube have?`, 12, i, [2, -2, -4, 4, -6], 1, '', { solid: 0 });
    return numChoice('घनाभमा कति शीर्ष हुन्छन्?', 'How many vertices does a cuboid have?', 8, i, [2, -2, -4, 4, -6], 1, '', { solid: 1 });
  },
});
export const SolidLab5 = makeLab(solidCfg({ code: 'SIM-MATH-G5-L2-01', chapter: 2, titleNp: 'ठोस वस्तु प्रयोगशाला', titleEn: 'Solid Lab' }));
void disc; void (null as unknown as Params);
