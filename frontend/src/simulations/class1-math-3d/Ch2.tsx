/** Chapter 2 · Lines — Colour the Lines, Connect the Dots, Draw with Real Objects, Line Drawing Playground (all 3D). */
import React from 'react';
import * as THREE from 'three';
import { StageCtx, ease } from '../class1-math-kit/useStage';
import { CBtn, Controls } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, pencil, ball } from '../class1-math-kit/models';
import { makeSim, Hud } from './makeSim';

const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(g, m);
const V = (x: number, z: number, y = 0.4) => new THREE.Vector3(x, y, z);

const board = (ctx: StageCtx, color = '#fef9c3') => {
  const b = shadowed(mesh(new THREE.BoxGeometry(15, 0.3, 9.5), mat(color, 0.9))); b.position.y = 0.15; ctx.scene.add(b); return b;
};
const tube = (curve: THREE.Curve<THREE.Vector3>, color: string, r = 0.16) => shadowed(mesh(new THREE.TubeGeometry(curve, 48, r, 12, false), mat(color, 0.4)));
const bez = (a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3) => new THREE.QuadraticBezierCurve3(a, c, b);
const lin = (a: THREE.Vector3, b: THREE.Vector3) => new THREE.LineCurve3(a, b);
const spline = (pts: THREE.Vector3[]) => new THREE.CatmullRomCurve3(pts);

/* ───────── shared line catalogue ───────── */
interface LineDef { np: string; en: string; curved: boolean; make: (dx: number, dz: number) => THREE.Curve<THREE.Vector3> }
const LD: LineDef[] = [
  { np: 'तेर्सो सीधा रेखा', en: 'flat straight line', curved: false, make: (x, z) => lin(V(x - 2, z), V(x + 2, z)) },
  { np: 'बाङ्गो छाल रेखा', en: 'curved wave', curved: true, make: (x, z) => spline([V(x - 2, z), V(x - 1, z - 0.8), V(x, z), V(x + 1, z + 0.8), V(x + 2, z)]) },
  { np: 'ठाडो सीधा रेखा', en: 'standing straight line', curved: false, make: (x, z) => lin(V(x, z - 1.5), V(x, z + 1.5)) },
  { np: 'बाङ्गो अर्धवृत्त रेखा', en: 'curved arc', curved: true, make: (x, z) => bez(V(x - 2, z + 1), V(x, z - 2), V(x + 2, z + 1)) },
  { np: 'छड्के सीधा रेखा', en: 'slanted straight line', curved: false, make: (x, z) => lin(V(x - 1.8, z + 1.2), V(x + 1.8, z - 1.2)) },
  { np: 'बाङ्गो S रेखा', en: 'curved S line', curved: true, make: (x, z) => spline([V(x - 1.5, z - 1.4), V(x + 1, z - 0.8), V(x - 1, z + 0.8), V(x + 1.5, z + 1.4)]) },
];
const SLOTS: [number, number][] = [[-4.6, -2.3], [0, -2.3], [4.6, -2.3], [-3, 2], [3, 2]];

/* ───────── 1 · Colour the Lines ───────── */
interface CL { show: (set: number) => void; paint: (i: number, c: string | null) => void; select: (i: number) => void; paintRight: (i?: number) => void; n: () => number; curved: (i: number) => boolean; colored: () => number; right: () => number; reset: () => void }
export const ColourTheLines3D = makeSim<CL, { sel: number; ok: number; total: number }>({
  cfg: { code: 'SIM-MATH-G1-CH2-02', chapter: 2, titleNp: 'रेखामा रङ भरौँ', titleEn: 'Colour the Lines' },
  stage: { camera: [0, 12, 8], target: [0, 0, 0], minDistance: 6 },
  ui0: { sel: -1, ok: 0, total: 0 },
  build: (ctx, notify) => {
    ctx.scene.background = new THREE.Color(0xdbeafe); board(ctx);
    const g = new THREE.Group(); ctx.scene.add(g);
    let lines: THREE.Mesh[] = []; let defs: LineDef[] = []; let colors: (string | null)[] = []; let sel = -1;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 24), mat('#f43f5e')); ring.rotation.x = Math.PI / 2; ring.visible = false; g.add(ring);
    const status = () => notify({ ok: colors.filter((c, i) => c && (defs[i].curved ? c === '#ef4444' : c === '#2563eb')).length, total: lines.length });
    const show = (set: number) => {
      lines.forEach((l) => g.remove(l)); lines = []; colors = []; sel = -1; ring.visible = false;
      const pick = [[0, 1, 2, 3, 4], [4, 5, 0, 3, 2], [1, 2, 5, 0, 3], [5, 4, 3, 2, 1]][set % 4];
      defs = pick.map((i) => LD[i]);
      defs.forEach((d, i) => {
        const l = tube(d.make(SLOTS[i][0], SLOTS[i][1]), '#9ca3af', 0.18); l.userData.i = i; g.add(l); lines.push(l); colors.push(null);
        l.scale.set(1, 0.01, 1); ctx.tween(400 + i * 80, (k) => l.scale.set(1, Math.max(0.01, k), 1), undefined, ease.back);
      });
      status();
    };
    const paint = (i: number, c: string | null) => {
      const l = lines[i]; if (!l) return; colors[i] = c; (l.material as THREE.MeshStandardMaterial).color.set(c || '#9ca3af');
      ctx.tween(350, (k) => l.scale.set(1, 1 + Math.sin(k * Math.PI) * 0.5, 1)); status();
    };
    const select = (i: number) => {
      sel = i; const l = lines[i]; if (!l) { ring.visible = false; return; }
      const box = new THREE.Box3().setFromObject(l); const c = box.getCenter(new THREE.Vector3());
      ring.position.set(c.x, 1, c.z); ring.visible = true; ring.scale.setScalar(Math.max(1, (box.max.x - box.min.x) / 1.6));
    };
    ctx.onTap(() => lines, (hit) => { if (hit) { const i = (hit.object as any).userData.i; select(i); notify({ tap: i }); } });
    ctx.onFrame((_d, t) => { ring.rotation.z = t; });
    show(0);
    return {
      show, paint, select,
      paintRight: (i) => { (i === undefined ? lines.map((_, k) => k) : [i]).forEach((k) => paint(k, defs[k].curved ? '#ef4444' : '#2563eb')); },
      n: () => lines.length, curved: (i) => defs[i]?.curved, colored: () => colors.filter(Boolean).length,
      right: () => colors.filter((c, i) => c && (defs[i].curved ? c === '#ef4444' : c === '#2563eb')).length,
      reset: () => { lines.forEach((_, i) => paint(i, null)); select(-1); },
    };
  },
  onEvent: (ev, p) => {
    if (ev.tap !== undefined) { p.setUi({ sel: ev.tap }); p.kit.tap(); }
    if (ev.ok !== undefined) {
      p.setUi({ ok: ev.ok, total: ev.total });
      if (ev.total && ev.ok === ev.total && p.kit.mode !== 'CHALLENGE') { p.kit.good('सबै रेखा ठीक रङ्गमा!', 'Every line has the right colour!'); p.kit.star(); }
    }
  },
  learn: [
    { np: 'यहाँ धेरै रेखा छन्। केही सीधा, केही बाङ्गा।', en: 'Here are many lines. Some are straight, some are curved.', run: (s) => s.show(0) },
    { np: 'सीधा रेखालाई निलो रङ दिऔँ।', en: 'Straight lines get BLUE.', run: (s) => { s.show(0); setTimeout(() => [0, 2, 4].forEach((i) => s.paint(i, '#2563eb')), 700); } },
    { np: 'बाङ्गो रेखालाई रातो रङ दिऔँ।', en: 'Curved lines get RED.', run: (s) => { s.show(0); setTimeout(() => s.paintRight(), 500); } },
    { np: 'अर्को रेखाहरू पनि हेरौँ। निलो = सीधा, रातो = बाङ्गो।', en: 'More lines! Blue = straight, red = curved.', run: (s) => { s.show(1); setTimeout(() => s.paintRight(), 900); } },
  ],
  playIntro: ['रेखा छोएर रङ रोजौँ। सीधा निलो, बाङ्गो रातो।', 'Tap a line, then pick a colour. Straight blue, curved red.'],
  onPlay: (s) => s.show(0),
  play: ({ kit, ui, scene, setUi }) => (
    <Controls>
      {[['#2563eb', '🔵', 'निलो', 'Blue'], ['#ef4444', '🔴', 'रातो', 'Red'], ['#facc15', '🟡', 'पहेँलो', 'Yellow'], ['#22c55e', '🟢', 'हरियो', 'Green']].map(([c, e, np, en]) => (
        <CBtn key={c} color={c} onClick={() => { if (ui.sel < 0) { kit.oops('पहिले रेखा छोऔँ', 'Tap a line first'); return; } scene((s) => s.paint(ui.sel, c)); const curved = false; void curved; kit.tap(); }}>{e} {kit.t(np, en)}</CBtn>
      ))}
      <CBtn color="#16a34a" onClick={() => scene((s) => s.paintRight())}>✨ {kit.t('सही रङ', 'Show answer')}</CBtn>
      <CBtn color="#8b5cf6" onClick={() => scene((s) => { s.show(Math.floor(Math.random() * 4)); setUi({ sel: -1 }); })}>🔄 {kit.t('नयाँ', 'New')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.ok)} / {p.num(p.ui.total)} ✅</Hud>,
  quiz: () => {
    const mk = (i: number, set: number): any => ({
      np: 'यो रेखा सीधा हो कि बाङ्गो?', en: 'Is this line straight or curved?', answer: LD[[[0, 1, 2, 3, 4], [4, 5, 0, 3, 2], [1, 2, 5, 0, 3], [5, 4, 3, 2, 1]][set][i]].curved ? 'c' : 's',
      options: [{ key: 's', label: '➖' }, { key: 'c', label: '〰️' }], setup: (s: CL) => { s.show(set); s.select(i); },
    });
    const col = (i: number, set: number): any => {
      const curved = LD[[[0, 1, 2, 3, 4], [4, 5, 0, 3, 2], [1, 2, 5, 0, 3], [5, 4, 3, 2, 1]][set][i]].curved;
      return { np: 'यो रेखामा कुन रङ भर्ने?', en: 'Which colour for this line?', answer: curved ? 'r' : 'b', options: [{ key: 'b', label: '🔵' }, { key: 'r', label: '🔴' }], setup: (s: CL) => { s.show(set); s.select(i); } };
    };
    return [mk(0, 0), col(1, 0), mk(3, 0), col(2, 1), mk(1, 1), col(0, 2), mk(2, 3), col(4, 3)];
  },
});

/* ───────── 2 · Connect the Dots ───────── */
interface PuzzleDef { np: string; en: string; curved: boolean; pts: [number, number][]; path?: 'arc' }
const PUZ: PuzzleDef[] = [
  { np: 'दुई थोप्ला जोडौँ — तेर्सो रेखा', en: 'Join 2 dots — a flat line', curved: false, pts: [[-3.5, 0], [3.5, 0]] },
  { np: 'दुई थोप्ला जोडौँ — ठाडो रेखा', en: 'Join 2 dots — a standing line', curved: false, pts: [[0, -2.8], [0, 2.8]] },
  { np: 'तीन थोप्ला जोडौँ — सीधा रेखा', en: 'Join 3 dots — straight line', curved: false, pts: [[-4, 1.5], [0, 0], [4, -1.5]] },
  { np: 'जिगज्याग रेखा', en: 'Zigzag line', curved: false, pts: [[-4.5, 1.5], [-2.2, -1.5], [0, 1.5], [2.2, -1.5], [4.5, 1.5]] },
  { np: 'बाङ्गो अर्धवृत्त जोडौँ', en: 'Join the dots in a curve', curved: true, pts: [[-4, 2], [-2.2, -0.6], [0, -1.8], [2.2, -0.6], [4, 2]] },
  { np: 'चङ्गा बनाऔँ', en: 'Make a kite', curved: false, pts: [[0, -3], [-2.2, -0.2], [0, 2.4], [2.2, -0.2], [0, -3]] },
];
interface CD { puzzle: (i: number) => void; tapNext: () => void; autoSolve: () => void; connected: () => number; total: () => number }
export const ConnectTheDots3D = makeSim<CD, { pi: number; got: number; total: number }>({
  cfg: { code: 'SIM-MATH-G1-CH2-03', chapter: 2, titleNp: 'थोप्ला जोडौँ', titleEn: 'Connect the Dots' },
  stage: { camera: [0, 11, 8], target: [0, 0, 0], minDistance: 6 },
  ui0: { pi: 0, got: 0, total: 2 },
  build: (ctx, notify) => {
    ctx.scene.background = new THREE.Color(0xe0e7ff); board(ctx, '#f8fafc');
    const g = new THREE.Group(); ctx.scene.add(g);
    let dots: THREE.Group[] = []; let segs: THREE.Object3D[] = []; let next = 0; let def = PUZ[0]; let order: number[] = [];
    const clear = () => { [...dots, ...segs].forEach((o) => g.remove(o)); dots = []; segs = []; next = 0; };
    const pos = (i: number) => V(def.pts[order[i]][0], def.pts[order[i]][1], 0.5);
    const link = (a: THREE.Vector3, b: THREE.Vector3, ia: number) => {
      let curve: THREE.Curve<THREE.Vector3> = lin(a, b);
      if (def.curved) { const mid = a.clone().lerp(b, 0.5); mid.z += 0.0; curve = lin(a, b); void mid; }
      const t = tube(curve, def.curved ? '#ef4444' : '#2563eb', 0.14); t.scale.set(1, 1, 1); g.add(t); segs.push(t); void ia;
    };
    const puzzle = (pi: number) => {
      clear(); def = PUZ[pi]; order = def.pts.map((_, i) => i);
      const n = def.pts.length;
      def.pts.forEach((p, i) => {
        const d = new THREE.Group();
        d.add(shadowed(mesh(new THREE.SphereGeometry(0.34, 20, 16), mat(i === 0 ? '#f97316' : '#facc15', 0.3))));
        const num = textSprite(String(i + 1), 0.9, { px: 100, w: 128, h: 128, bg: '#fff', border: '#0ea5e9' }); num.position.y = 0.9; d.add(num);
        d.position.set(p[0], 0.55, p[1]); d.userData.i = i; g.add(d); dots.push(d);
        d.scale.setScalar(0.01); ctx.tween(300 + i * 100, (k) => d.scale.setScalar(Math.max(0.01, k)), undefined, ease.back);
      });
      next = 1; notify({ got: 1, total: n, pi }); // first dot is the start
    };
    const tapDot = (i: number) => {
      if (i !== next) { notify({ wrong: i }); return; }
      const a = dots[next - 1].position.clone(), b = dots[next].position.clone();
      let curve: THREE.Curve<THREE.Vector3>;
      if (def.curved) { const mid = a.clone().lerp(b, 0.5); mid.z += 0; curve = lin(a, b); void mid; } else curve = lin(a, b);
      // curved puzzles are drawn as one smooth spline from all dots when finished
      const t = tube(curve, def.curved ? '#ef4444' : '#2563eb', 0.14); g.add(t); segs.push(t);
      t.scale.set(1, 1, 0.01); ctx.tween(350, (k) => t.scale.set(1, 1, 1), undefined, ease.out);
      ctx.tween(300, (k) => dots[i].scale.setScalar(1 + Math.sin(k * Math.PI) * 0.4));
      next++;
      notify({ got: next, total: dots.length });
      if (next >= dots.length) {
        if (def.curved) { segs.forEach((s) => g.remove(s)); segs = []; const sp = tube(spline(dots.map((d) => d.position)), '#ef4444', 0.14); g.add(sp); segs.push(sp); }
        notify({ done: true, curved: def.curved });
      }
    };
    ctx.onTap(() => dots, (hit) => { if (hit) { let o: THREE.Object3D | null = hit.object; while (o && o.userData.i === undefined) o = o.parent; if (o) tapDot(o.userData.i); } });
    ctx.onFrame((_d, t) => { if (dots[next]) dots[next].position.y = 0.55 + Math.abs(Math.sin(t * 4)) * 0.3; });
    puzzle(0);
    void pos; void link;
    return {
      puzzle, tapNext: () => tapDot(next), autoSolve: () => { let k = 0; const step = () => { if (next < dots.length) { tapDot(next); k++; if (k < 12) window.setTimeout(step, 450); } }; step(); },
      connected: () => next, total: () => dots.length,
    };
  },
  onEvent: (ev, p) => {
    if (ev.pi !== undefined) p.setUi({ pi: ev.pi });
    if (ev.got !== undefined) p.setUi({ got: ev.got, total: ev.total });
    if (ev.wrong !== undefined) p.kit.oops('क्रम अनुसार जोडौँ!', 'Follow the numbers!');
    if (ev.done) {
      p.kit.say(ev.curved ? 'वाह! यो बाङ्गो रेखा हो।' : 'वाह! यी सीधा रेखा हुन्।', ev.curved ? 'Wow! A curved line.' : 'Wow! Straight lines.');
      if (p.kit.mode !== 'CHALLENGE') p.kit.star();
    }
  },
  learn: [
    { np: 'थोप्ला १ बाट सुरु गरौँ। १ पछि २ छोऔँ।', en: 'Start at dot 1. Then tap dot 2.', run: (s) => s.puzzle(0) },
    { np: 'हेर! दुई थोप्ला जोड्दा सीधा रेखा बन्यो।', en: 'Look! Two dots make a straight line.', run: (s) => { s.puzzle(0); setTimeout(() => s.autoSolve(), 900); } },
    { np: 'तीन थोप्ला जोडौँ। अझै सीधा रेखा!', en: 'Three dots. Still a straight line!', run: (s) => { s.puzzle(2); setTimeout(() => s.autoSolve(), 900); } },
    { np: 'यो बाङ्गो अर्धवृत्त हो। बाङ्गो रेखा रातो हुन्छ।', en: 'Dots in a curve make a curved line. Curved lines are red.', run: (s) => { s.puzzle(4); setTimeout(() => s.autoSolve(), 900); } },
  ],
  playIntro: ['चित्र रोजौँ र थोप्ला क्रम अनुसार छोऔँ।', 'Pick a picture and tap the dots in order.'],
  onPlay: (s) => s.puzzle(0),
  play: ({ kit, ui, scene }) => (
    <Controls>
      {PUZ.map((d, i) => <CBtn key={i} color={ui.pi === i ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 52 }} onClick={() => scene((s) => s.puzzle(i))}>{['➖', '➕', '📈', '⚡', '🌈', '🪁'][i]}</CBtn>)}
      <CBtn color="#16a34a" onClick={() => scene((s) => s.autoSolve())}>✨ {kit.t('हेरौँ', 'Show me')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => mode === 'CHALLENGE' ? null : <Hud>{p.ui.got} / {p.ui.total}</Hud>,
  quiz: () => [4, 0, 2, 5, 1, 3].map((i): any => ({
    np: `यो ${PUZ[i].curved ? '' : ''}रेखा सीधा कि बाङ्गो? (पहिले थोप्ला जोडौँ)`, en: 'Join the dots, then say: straight or curved?', answer: PUZ[i].curved ? 'c' : 's',
    options: [{ key: 's', label: '➖' }, { key: 'c', label: '〰️' }], setup: (s: CD) => { s.puzzle(i); window.setTimeout(() => s.autoSolve(), 600); },
  })),
});

/* ───────── 3 · Draw with Real Objects ───────── */
type Obj = 'stick' | 'rope' | 'ruler' | 'bangle' | 'string' | 'pencil';
const OBJ: Record<Obj, { np: string; en: string; emoji: string; curved: boolean }> = {
  stick: { np: 'लौरो', en: 'stick', emoji: '🥢', curved: false }, ruler: { np: 'रुलर', en: 'ruler', emoji: '📏', curved: false }, pencil: { np: 'सिसाकलम', en: 'pencil', emoji: '✏️', curved: false },
  rope: { np: 'खुकुलो डोरी', en: 'loose rope', emoji: '🪢', curved: true }, bangle: { np: 'चुरा', en: 'bangle', emoji: '💍', curved: true }, string: { np: 'तानेको धागो', en: 'tight string', emoji: '🧵', curved: false },
};
const objModel = (k: Obj) => {
  const g = new THREE.Group();
  if (k === 'stick') g.add(mesh(new THREE.CylinderGeometry(0.14, 0.14, 4, 10), mat('#92400e', 0.8)).rotateZ(Math.PI / 2));
  else if (k === 'ruler') { g.add(mesh(new THREE.BoxGeometry(4.4, 0.1, 0.8), mat('#fde047', 0.5))); for (let i = 0; i < 12; i++) { const t = mesh(new THREE.BoxGeometry(0.04, 0.02, i % 2 ? 0.25 : 0.4), mat('#111827')); t.position.set(-2 + i * 0.36, 0.07, -0.15); g.add(t); } }
  else if (k === 'pencil') { const p = pencil('#facc15', 3.4); p.scale.set(1, 1.8, 1.8); g.add(p); }
  else if (k === 'rope') g.add(tube(spline([V(-2, 0, 0), V(-1, 0.9, 0), V(0, -0.9, 0), V(1, 0.9, 0), V(2, 0, 0)].map((v) => new THREE.Vector3(v.x, 0.1, v.z))), '#ea580c', 0.14));
  else if (k === 'bangle') g.add(mesh(new THREE.TorusGeometry(1, 0.17, 12, 40), mat('#ec4899', 0.3, 0.3)).rotateX(Math.PI / 2));
  else g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 8), mat('#7c3aed', 0.6)).rotateZ(Math.PI / 2));
  return shadowed(g);
};
interface DO { show: (k: Obj, clear?: boolean) => void; place: (k: Obj, x: number, z: number) => void; clear: () => void; count: () => number; setSel: (k: Obj) => void; sel: () => Obj }
export const DrawWithObjects3D = makeSim<DO, { sel: Obj; n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH2-04', chapter: 2, titleNp: 'वस्तुले रेखा बनाऔँ', titleEn: 'Draw with Real Objects' },
  stage: { camera: [0, 10, 8], target: [0, 0, 0], minDistance: 6 },
  ui0: { sel: 'stick', n: 0 },
  build: (ctx, notify) => {
    ctx.scene.background = new THREE.Color(0xfef3c7);
    const paper = shadowed(mesh(new THREE.BoxGeometry(14, 0.2, 8.5), mat('#ffffff', 0.9))); paper.position.y = 0.1; ctx.scene.add(paper);
    const g = new THREE.Group(); ctx.scene.add(g);
    let sel: Obj = 'stick'; const placed: THREE.Object3D[] = [];
    const add = (k: Obj, x: number, z: number) => {
      const o = objModel(k); o.position.set(x, 0.4, z); g.add(o); placed.push(o);
      o.scale.setScalar(0.01); ctx.tween(350, (t) => o.scale.setScalar(Math.max(0.01, t)), undefined, ease.back);
      const lab = textSprite(OBJ[k].curved ? '〰️' : '➖', 1, { px: 80, w: 128, h: 128, bg: 'rgba(255,255,255,.9)', border: OBJ[k].curved ? '#ef4444' : '#2563eb' }); lab.position.set(0, 1.2, 0); o.add(lab);
      notify({ n: placed.length, added: k });
    };
    const clear = () => { placed.forEach((o) => g.remove(o)); placed.length = 0; notify({ n: 0 }); };
    ctx.onTap(() => [paper], (hit) => { if (hit) add(sel, Math.max(-5, Math.min(5, hit.point.x)), Math.max(-3, Math.min(3, hit.point.z))); });
    return { show: (k, c = true) => { if (c) clear(); sel = k; add(k, 0, 0); }, place: (k, x, z) => add(k, x, z), clear, count: () => placed.length, setSel: (k) => { sel = k; }, sel: () => sel };
  },
  onEvent: (ev, p) => {
    if (ev.n !== undefined) p.setUi({ n: ev.n });
    if (ev.added && p.kit.mode === 'PLAY') { p.kit.tap(); const o = OBJ[ev.added as Obj]; p.kit.say(o.curved ? `${o.np} बाङ्गो रेखा बनाउँछ।` : `${o.np} सीधा रेखा बनाउँछ।`, o.curved ? `A ${o.en} makes a curved line.` : `A ${o.en} makes a straight line.`); }
  },
  learn: [
    { np: 'वास्तविक वस्तुले पनि रेखा बनाउँछन्। लौरो हेर!', en: 'Real things make lines too. Look at the stick!', run: (s) => s.show('stick') },
    { np: 'लौरोले सीधा रेखा बनाउँछ।', en: 'A stick makes a STRAIGHT line.', run: (s) => { s.show('stick'); s.place('ruler', 0, 2.2); } },
    { np: 'खुकुलो डोरीले बाङ्गो रेखा बनाउँछ।', en: 'A loose rope makes a CURVED line.', run: (s) => s.show('rope') },
    { np: 'डोरी तान्यो भने सीधा हुन्छ! चुराले पनि बाङ्गो रेखा बनाउँछ।', en: 'Pull the string tight and it is straight! A bangle makes a curved line.', run: (s) => { s.show('string'); s.place('bangle', 0, 2.2); } },
  ],
  playIntro: ['वस्तु रोजौँ, अनि कागजमा छोऔँ।', 'Pick an object, then tap the paper to put it down.'],
  onPlay: (s) => s.clear(),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      {(Object.keys(OBJ) as Obj[]).map((k) => <CBtn key={k} color={ui.sel === k ? '#0ea5e9' : '#94a3b8'} onClick={() => { setUi({ sel: k }); scene((s) => s.setSel(k)); }}>{OBJ[k].emoji} {kit.t(OBJ[k].np, OBJ[k].en)}</CBtn>)}
      <CBtn color="#ef4444" onClick={() => scene((s) => s.clear())}>🗑 {kit.t('मेटौँ', 'Clear')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => mode === 'CHALLENGE' ? null : <Hud>{p.ui.n} 🧩</Hud>,
  quiz: () => {
    const straight: Obj[] = ['stick', 'ruler', 'pencil', 'string'], curved: Obj[] = ['rope', 'bangle'];
    const o = (k: Obj) => ({ key: k, label: OBJ[k].emoji });
    const shuf = (a: Obj[]) => a.sort(() => Math.random() - 0.5);
    return [
      ...[0, 1, 2].map((i): any => { const a = straight[Math.floor(Math.random() * 4)], b = curved[i % 2]; return { np: 'कुन वस्तुले सीधा रेखा बनाउँछ?', en: 'Which makes a STRAIGHT line?', answer: a, options: shuf([a, b]).map(o), setup: (s: DO) => { s.show(a); s.place(b, 0, 2.4); } }; }),
      ...[0, 1, 2].map((i): any => { const a = curved[i % 2], b = straight[Math.floor(Math.random() * 4)]; return { np: 'कुन वस्तुले बाङ्गो रेखा बनाउँछ?', en: 'Which makes a CURVED line?', answer: a, options: shuf([a, b]).map(o), setup: (s: DO) => { s.show(a); s.place(b, 0, 2.4); } }; }),
    ];
  },
});

/* ───────── 4 · Line Drawing Playground ───────── */
interface Tpl { np: string; en: string; curved: boolean; pts: [number, number][] }
const mkPath = (c: THREE.Curve<THREE.Vector3>, n = 40): [number, number][] => c.getPoints(n).map((p) => [p.x, p.z]);
const TPL: Tpl[] = [
  { np: 'तेर्सो सीधा रेखा', en: 'Flat straight line', curved: false, pts: mkPath(lin(V(-5, 0), V(5, 0))) },
  { np: 'ठाडो सीधा रेखा', en: 'Standing straight line', curved: false, pts: mkPath(lin(V(0, -3), V(0, 3))) },
  { np: 'छड्के सीधा रेखा', en: 'Slanted straight line', curved: false, pts: mkPath(lin(V(-4.5, 2.6), V(4.5, -2.6))) },
  { np: 'बाङ्गो छाल रेखा', en: 'Curved wave', curved: true, pts: mkPath(spline([V(-5, 0), V(-2.5, -1.6), V(0, 0), V(2.5, 1.6), V(5, 0)]), 60) },
  { np: 'बाङ्गो अर्धवृत्त', en: 'Curved arc', curved: true, pts: mkPath(bez(V(-4.5, 2), V(0, -3), V(4.5, 2)), 60) },
];
interface LD2 { tpl: (i: number) => void; clear: () => void; color: (c: string) => void; demo: () => void; progress: () => number; free: () => void }
export const LineDrawingPlayground3D = makeSim<LD2, { ti: number; pct: number; color: string }>({
  cfg: { code: 'SIM-MATH-G1-CH2-05', chapter: 2, titleNp: 'मेरो रेखा चित्र खेलमैदान', titleEn: 'My Line Drawing Playground' },
  stage: { camera: [0, 11, 3.5], target: [0, 0, 0], minDistance: 6 },
  ui0: { ti: 0, pct: 0, color: '#2563eb' },
  build: (ctx, notify) => {
    ctx.scene.background = new THREE.Color(0xecfeff);
    const paper = shadowed(mesh(new THREE.BoxGeometry(14, 0.2, 8.5), mat('#ffffff', 0.9))); paper.position.y = 0.1; ctx.scene.add(paper);
    ctx.controls.enableRotate = false;
    const g = new THREE.Group(); ctx.scene.add(g);
    const guide: THREE.Mesh[] = []; const hit: boolean[] = []; let pts: [number, number][] = []; const trail: THREE.Mesh[] = [];
    let col = '#2563eb'; let drawing = false; let last: THREE.Vector3 | null = null; let ti = -1;
    const dotGeo = new THREE.SphereGeometry(0.16, 8, 6);
    const clear = () => { trail.forEach((m) => g.remove(m)); trail.length = 0; guide.forEach((m) => (m.material as THREE.MeshStandardMaterial).color.set('#94a3b8')); hit.fill(false); notify({ pct: 0 }); };
    const tpl = (i: number) => {
      guide.forEach((m) => g.remove(m)); guide.length = 0; hit.length = 0; pts = []; ti = i;
      if (i >= 0) { pts = TPL[i].pts; pts.forEach((p) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mat('#94a3b8', 0.8)); m.position.set(p[0], 0.28, p[1]); g.add(m); guide.push(m); hit.push(false); }); }
      trail.forEach((m) => g.remove(m)); trail.length = 0; notify({ pct: 0, ti: i });
    };
    const progress = () => (hit.length ? hit.filter(Boolean).length / hit.length : 0);
    const mark = (x: number, z: number) => {
      let changed = false;
      pts.forEach((p, i) => { if (!hit[i] && Math.hypot(p[0] - x, p[1] - z) < 0.6) { hit[i] = true; (guide[i].material as THREE.MeshStandardMaterial).color.set('#22c55e'); changed = true; } });
      if (changed) { const pc = Math.round(progress() * 100); notify({ pct: pc }); if (pc >= 85 && !(g.userData.done)) { g.userData.done = true; notify({ traced: true }); } }
    };
    const dot = (v: THREE.Vector3) => { const m = new THREE.Mesh(dotGeo, mat(col, 0.4)); m.position.set(v.x, 0.3, v.z); g.add(m); trail.push(m); if (trail.length > 900) g.remove(trail.shift()!); };
    const ray = new THREE.Raycaster(); const nd = new THREE.Vector2();
    const pointAt = (e: PointerEvent) => { const r = ctx.renderer.domElement.getBoundingClientRect(); nd.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(nd, ctx.camera); const h = ray.intersectObject(paper)[0]; return h ? h.point : null; };
    const el = ctx.renderer.domElement;
    const down = (e: PointerEvent) => { const p = pointAt(e); if (!p) return; drawing = true; last = p.clone(); dot(p); mark(p.x, p.z); g.userData.done = false; el.setPointerCapture?.(e.pointerId); };
    const move = (e: PointerEvent) => { if (!drawing) return; const p = pointAt(e); if (!p || !last) return; const d = last.distanceTo(p); const steps = Math.max(1, Math.floor(d / 0.12)); for (let i = 1; i <= steps; i++) { const q = last.clone().lerp(p, i / steps); dot(q); mark(q.x, q.z); } last = p.clone(); };
    const up = () => { drawing = false; last = null; };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up);
    tpl(0);
    return {
      tpl, clear, color: (c) => { col = c; }, free: () => { tpl(-1); },
      demo: () => { clear(); pts.forEach((p, i) => window.setTimeout(() => { dot(V(p[0], p[1])); mark(p[0], p[1]); }, i * 40)); },
      progress,
    };
  },
  onEvent: (ev, p) => {
    if (ev.pct !== undefined) p.setUi({ pct: ev.pct });
    if (ev.ti !== undefined) p.setUi({ ti: ev.ti });
    if (ev.traced) { p.kit.good('रेखा पूरा भयो!', 'You traced it!'); if (p.kit.mode !== 'CHALLENGE') p.kit.star(); }
  },
  learn: [
    { np: 'हरेक थोप्लामाथि औँला तानेर रेखा खिचौँ।', en: 'Drag your finger over the dots to draw.', run: (s) => s.tpl(0) },
    { np: 'हेर, सीधा रेखा यसरी बन्छ!', en: 'See, a straight line looks like this!', run: (s) => { s.tpl(0); setTimeout(() => s.demo(), 700); } },
    { np: 'अब बाङ्गो छाल रेखा हेरौँ।', en: 'Now a curved wave line.', run: (s) => { s.tpl(3); setTimeout(() => s.demo(), 700); } },
    { np: 'तिमी आफैँ कोर्न सक्छौ! कागजमा औँला तान।', en: 'Now you try! Drag on the paper.', run: (s) => s.tpl(4) },
  ],
  playIntro: ['रङ रोजेर कागजमा औँलाले कोरौँ।', 'Pick a colour and draw on the paper with your finger.'],
  onPlay: (s) => s.tpl(0),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      {TPL.map((t, i) => <CBtn key={i} color={ui.ti === i ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 52 }} onClick={() => { setUi({ ti: i }); scene((s) => s.tpl(i)); }}>{['➖', '➕', '↗️', '🌊', '🌈'][i]}</CBtn>)}
      <CBtn color="#8b5cf6" onClick={() => { setUi({ ti: -1 }); scene((s) => s.free()); }}>✏️ {kit.t('खाली', 'Free')}</CBtn>
      {['#2563eb', '#ef4444', '#16a34a', '#f59e0b'].map((c) => <CBtn key={c} color={c} style={{ minWidth: 48 }} onClick={() => { setUi({ color: c }); scene((s) => s.color(c)); }}>{ui.color === c ? '✔' : '●'}</CBtn>)}
      <CBtn color="#ef4444" onClick={() => scene((s) => s.clear())}>🗑</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' || p.ui.ti < 0 ? null : <Hud>{p.ui.pct}%</Hud>),
  quiz: () => [0, 3, 1, 4, 2, 3].map((i): any => ({
    np: 'यो रेखा सीधा कि बाङ्गो? थोप्लामा औँला तानेर हेर।', en: 'Is this line straight or curved? Trace it to find out.', answer: TPL[i].curved ? 'c' : 's',
    options: [{ key: 's', label: '➖' }, { key: 'c', label: '〰️' }], setup: (s: LD2) => s.tpl(i),
  })),
});
void ball;
