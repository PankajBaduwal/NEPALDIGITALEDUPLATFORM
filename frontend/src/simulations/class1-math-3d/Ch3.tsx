/** Chapter 3 · Geometrical shapes — Shape Explorer, Match, Colour, Detective, Builder (all 3D). */
import React from 'react';
import * as THREE from 'three';
import { ease } from '../class1-math-kit/useStage';
import { CBtn, Controls } from '../class1-math-kit/SimKit';
import { mat, shadowed } from '../class1-math-kit/models';
import { makeSim, Hud, numOptions } from './makeSim';
import { SHAPES, SC, SN, SPROP, SSIDES, ShapeIcon, ShapeKind, shapeToken, ShapeBoard, PICTURES } from './shapes';

const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(g, m);
const shapeOpts = (kinds: ShapeKind[]) => kinds.map((k) => ({ key: k, label: <ShapeIcon kind={k} /> }));
const shuf = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);
const pickOther = (k: ShapeKind, n = 1) => shuf(SHAPES.filter((s) => s !== k)).slice(0, n);

/* ───────── 1 · Shape Explorer ───────── */
interface EX { focus: (i: number) => void; only: (i: number) => void; all: () => void }
export const ShapeExplorer3DNew = makeSim<EX, { sel: number }>({
  cfg: { code: 'SIM-MATH-G1-CH3-01', chapter: 3, titleNp: 'आकार अन्वेषक', titleEn: 'Shape Explorer' },
  stage: { camera: [0, 4.5, 13], target: [0, 2.4, 0], minDistance: 7 },
  ui0: { sel: -1 },
  build: (ctx, notify) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const toks: THREE.Mesh[] = []; const homes: THREE.Vector3[] = []; let focus = -1; let alone = -1;
    SHAPES.forEach((k, i) => {
      const x = (i - 1.5) * 3.6;
      const ped = shadowed(mesh(new THREE.CylinderGeometry(1.3, 1.5, 1, 32), mat('#fde68a', 0.8))); ped.position.set(x, 0.5, 0); g.add(ped);
      const t = shapeToken(k, SC[k], 1.15); t.position.set(x, 2.6, 0); t.userData.i = i; g.add(t); toks.push(t); homes.push(t.position.clone());
    });
    const apply = () => toks.forEach((t, i) => {
      const want = alone >= 0 ? (i === alone ? 1.7 : 0.001) : focus === i ? 1.45 : 1.15;
      const s0 = t.scale.x; ctx.tween(300, (k) => { const s = s0 + (want - s0) * k; t.scale.set(s, s, t.scale.z); }, undefined, ease.out);
      const target = alone >= 0 && i === alone ? new THREE.Vector3(0, 2.8, 2) : homes[i];
      t.position.copy(target);
    });
    ctx.onTap(() => toks, (hit) => { if (hit) { const i = (hit.object as any).userData.i; focus = i; apply(); notify({ tap: i }); } });
    ctx.onFrame((_d, time) => toks.forEach((t, i) => { t.rotation.y = alone >= 0 && alone !== i ? 0 : Math.sin(time * 1.2 + i) * 0.25; }));
    return { focus: (i) => { alone = -1; focus = i; apply(); }, only: (i) => { alone = i; focus = i; apply(); }, all: () => { alone = -1; focus = -1; apply(); } };
  },
  onEvent: (ev, p) => {
    if (ev.tap !== undefined) { const k = SHAPES[ev.tap]; p.setUi({ sel: ev.tap }); p.kit.say(`यो ${SN[k][0]} हो। ${SPROP[k][0]}`, `This is a ${SN[k][1]}. ${SPROP[k][1]}`); }
  },
  learn: SHAPES.map((k, i) => ({ np: `यो ${SN[k][0]} हो। ${SPROP[k][0]}`, en: `This is a ${SN[k][1]}. ${SPROP[k][1]}`, run: (s: EX) => s.focus(i) })),
  playIntro: ['कुनै आकारलाई छोऔँ।', 'Tap any shape.'],
  onPlay: (s) => s.all(),
  play: ({ kit, ui, scene, setUi }) => (
    <Controls>
      {SHAPES.map((k, i) => <CBtn key={k} color={ui.sel === i ? '#0ea5e9' : '#e0f2fe'} style={{ color: '#075985' }} onClick={() => { setUi({ sel: i }); scene((s) => s.focus(i)); kit.say(`यो ${SN[k][0]} हो। ${SPROP[k][0]}`, `This is a ${SN[k][1]}. ${SPROP[k][1]}`); }}><ShapeIcon kind={k} size={32} /> {kit.t(SN[k][0], SN[k][1])}</CBtn>)}
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' || p.ui.sel < 0 ? null : <Hud color={SC[SHAPES[p.ui.sel]]}>{SSIDES[SHAPES[p.ui.sel]]} {p.kit.t('भुजा', 'sides')}</Hud>),
  quiz: () => {
    const q = (k: ShapeKind): any => ({ np: 'यो कुन आकार हो?', en: 'Which shape is this?', answer: k, options: shapeOpts(shuf([k, ...pickOther(k, 2)])), setup: (s: EX) => s.only(SHAPES.indexOf(k)) });
    const sides = (k: ShapeKind): any => ({ np: 'यो आकारका कति भुजा छन्?', en: 'How many sides does this shape have?', answer: String(SSIDES[k]), options: numOptions(SSIDES[k], 0, 4, 3), setup: (s: EX) => s.only(SHAPES.indexOf(k)) });
    return shuf([q('circle'), q('triangle'), q('square'), q('rectangle'), sides('triangle'), sides('circle'), sides('square')]);
  },
});

/* ───────── 2 · Match the Shape ───────── */
interface MT { reset: (kinds: ShapeKind[]) => void; select: (i: number) => void; auto: () => void; shadow: (k: ShapeKind | null) => void; reveal: () => void; left: () => number }
export const MatchTheShape3D = makeSim<MT, { left: number; sel: number }>({
  cfg: { code: 'SIM-MATH-G1-CH3-02', chapter: 3, titleNp: 'आकार मिलाऔँ', titleEn: 'Match the Shape' },
  stage: { camera: [0, 4.2, 12], target: [0, 2.6, 0], minDistance: 7 },
  ui0: { left: 4, sel: -1 },
  build: (ctx, notify) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const wall = shadowed(mesh(new THREE.BoxGeometry(14, 3.6, 0.3), mat('#bfdbfe', 0.95))); wall.position.set(0, 4.6, -1.2); g.add(wall);
    let holes: THREE.Mesh[] = []; let toks: THREE.Mesh[] = []; let sel = -1; let done = 0; let kinds: ShapeKind[] = []; let gen = 0;
    const clear = () => { gen++; [...holes, ...toks].forEach((o) => g.remove(o)); holes = []; toks = []; sel = -1; done = 0; };
    const glow = () => toks.forEach((t, i) => { const b = t.userData.base as number; t.scale.setScalar(b * (i === sel ? 1.25 : 1)); });
    const reset = (ks: ShapeKind[]) => {
      clear(); kinds = ks; const n = ks.length; const xs = (i: number) => (i - (n - 1) / 2) * 3.3;
      ks.forEach((k, i) => { const h = shapeToken(k, '#475569', 1.05, 0.2); h.position.set(xs(i), 4.6, -0.95); h.userData.k = k; holes.push(h); g.add(h); });
      shuf(ks.map((k, i) => i)).forEach((src, slot) => {
        const k = ks[src]; const t = shapeToken(k, SC[k], 0.9); t.position.set(xs(slot), 1.1, 1.8); t.userData.base = 0.9; t.userData.k = k; t.userData.slot = slot; toks.push(t); g.add(t);
        t.scale.setScalar(0.01); ctx.tween(400, (q) => t.scale.setScalar(Math.max(0.01, 0.9 * q)), undefined, ease.back);
      });
      notify({ left: n, sel: -1 });
    };
    const place = (ti: number, hi: number) => {
      const t = toks[ti], h = holes[hi]; if (!t || !h) return; const p0 = t.position.clone(); const p1 = h.position.clone().add(new THREE.Vector3(0, 0, 0.35));
      ctx.tween(650, (q) => { t.position.lerpVectors(p0, p1, q); t.position.y += Math.sin(q * Math.PI) * 1.2; t.scale.setScalar(1.05 * 0.9 / 0.9 * (0.9 + 0.15 * q)); }, undefined, ease.inOut);
      (h.material as THREE.MeshStandardMaterial).color.set('#e2e8f0');
    };
    const select = (i: number) => {
      const t = toks[i]; if (!t || t.userData.done) return;
      if (sel >= 0 && sel !== i) { sel = i; } else sel = i;
      glow(); notify({ sel: i, picked: t.userData.k });
    };
    const tryHole = (hi: number) => {
      if (sel < 0) { notify({ pickFirst: true }); return; }
      const t = toks[sel]; const h = holes[hi]; if (!t || !h) return;
      if (t.userData.k === h.userData.k && !h.userData.filled) {
        h.userData.filled = true; t.userData.done = true; const ti = sel; sel = -1; place(ti, hi); glow(); done++; notify({ left: holes.length - done, matched: t.userData.k, all: done === holes.length });
      } else { const x0 = t.position.x; ctx.tween(400, (q) => { t.position.x = x0 + Math.sin(q * Math.PI * 6) * 0.3 * (1 - q); }); notify({ wrong: true }); }
    };
    ctx.onTap(() => [...toks, ...holes], (hit) => {
      if (!hit) return; const o = hit.object as THREE.Mesh;
      if (toks.includes(o)) select(toks.indexOf(o)); else if (holes.includes(o)) tryHole(holes.indexOf(o));
    });
    ctx.onFrame((_d, t) => toks.forEach((o, i) => { if (!o.userData.done) o.rotation.y = Math.sin(t * 1.5 + i) * 0.25; }));
    reset(SHAPES);
    return {
      reset, select,
      auto: () => { const g0 = gen; toks.forEach((t, i) => { if (t.userData.done) return; const hi = holes.findIndex((h) => h.userData.k === t.userData.k && !h.userData.filled); window.setTimeout(() => { if (g0 === gen && hi >= 0 && holes[hi] && !holes[hi].userData.filled) { holes[hi].userData.filled = true; t.userData.done = true; place(i, hi); done++; notify({ left: holes.length - done }); } }, i * 700); }); },
      shadow: (k) => { reset(k ? [k, ...pickOther(k, 2)] : kinds); if (k) { holes.forEach((h) => { h.visible = h.userData.k === k; h.position.x = 0; }); toks.forEach((t) => { t.visible = false; }); } },
      reveal: () => { const h = holes.find((x) => x.visible); const k = h?.userData.k as ShapeKind | undefined; if (h && k) { const t = shapeToken(k, SC[k], 1.05); t.position.set(0, 4.6, 1.2); g.add(t); toks.push(t); t.scale.setScalar(0.01); ctx.tween(500, (q) => t.scale.setScalar(Math.max(0.01, 1.05 * q)), undefined, ease.back); } },
      left: () => holes.length - done,
    };
  },
  onEvent: (ev, p) => {
    if (ev.left !== undefined) p.setUi({ left: ev.left });
    if (ev.sel !== undefined) p.setUi({ sel: ev.sel });
    if (ev.picked) p.kit.say(`${SN[ev.picked as ShapeKind][0]} — कुन छायाँमा मिल्छ?`, `${SN[ev.picked as ShapeKind][1]} — which shadow fits?`, false);
    if (ev.pickFirst) p.kit.oops('पहिले तल आकार छोऔँ', 'Tap a shape below first');
    if (ev.wrong) p.kit.oops('मिलेन! फेरि हेरौँ।', "That doesn't fit. Look again!");
    if (ev.matched) { p.kit.good(`ठीक! ${SN[ev.matched as ShapeKind][0]}`, `Yes! ${SN[ev.matched as ShapeKind][1]}`); }
    if (ev.all) { p.kit.star(); p.kit.say('सबै मिल्यो! शाबास!', 'All matched! Great!'); }
  },
  learn: [
    { np: 'माथि कालो छायाँ छन्। तलका आकार तिनमा मिलाऔँ।', en: 'The dark shadows are above. Match the shapes below to them.', run: (s) => s.reset(SHAPES) },
    { np: 'हेर, वृत्त वृत्तको छायाँमा मिल्छ।', en: 'See, the circle fits the circle shadow.', run: (s) => { s.reset(SHAPES); setTimeout(() => s.auto(), 900); } },
    { np: 'अब तिम्रो पालो! आकार छोऔँ, अनि छायाँ छोऔँ।', en: 'Now you! Tap a shape, then tap its shadow.', run: (s) => s.reset(['circle', 'square']) },
  ],
  playIntro: ['तलको आकार छोऔँ, अनि माथिको मिल्ने छायाँ छोऔँ।', 'Tap a shape below, then tap its shadow above.'],
  onPlay: (s) => s.reset(SHAPES),
  play: ({ kit, scene }) => (
    <Controls>
      <CBtn color="#8b5cf6" onClick={() => scene((s) => s.reset(shuf(SHAPES)))}>🔄 {kit.t('फेरि खेलौँ', 'Again')}</CBtn>
      <CBtn color="#16a34a" onClick={() => scene((s) => s.auto())}>✨ {kit.t('सहयोग', 'Help me')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.left)} 🧩</Hud>),
  quiz: () => shuf(SHAPES).concat(shuf(SHAPES).slice(0, 2)).map((k): any => ({
    np: 'यो छायाँमा कुन आकार मिल्छ?', en: 'Which shape fits this shadow?', answer: k, options: shapeOpts(shuf([k, ...pickOther(k, 2)])), setup: (s: MT) => s.shadow(k),
  })),
  quizExtra: ({ kit, scene }) => <CBtn color="#16a34a" style={{ minHeight: 44, padding: '6px 14px', fontSize: 15 }} onClick={() => scene((s) => s.reveal())}>👀 {kit.t('सहयोग', 'Hint')}</CBtn>,
});

/* ───────── 3 · Colour the Shapes ───────── */
const RULE: Record<ShapeKind, [string, string, string]> = { circle: ['#ef4444', 'रातो', 'red'], triangle: ['#facc15', 'पहेँलो', 'yellow'], square: ['#2563eb', 'निलो', 'blue'], rectangle: ['#22c55e', 'हरियो', 'green'] };
interface CS { pic: (i: number) => void; paint: (i: number, c: string) => void; rule: () => void; glow: (i: number) => void; kind: (i: number) => ShapeKind; n: () => number; painted: () => number }
export const ColourTheShapes3D = makeSim<CS, { sel: number; pi: number; right: number }>({
  cfg: { code: 'SIM-MATH-G1-CH3-03', chapter: 3, titleNp: 'आकारमा रङ भरौँ', titleEn: 'Colour the Shapes' },
  stage: { camera: [0, 4.2, 14], target: [0, 3, 0], minDistance: 8 },
  ui0: { sel: -1, pi: 0, right: 0 },
  build: (ctx, notify) => {
    const b = new ShapeBoard(ctx);
    let pi = 0; const done: Record<number, string> = {};
    let gen = 0;
    const stat = () => notify({ right: Object.entries(done).filter(([i, c]) => b.parts[+i] && RULE[b.parts[+i].userData.k as ShapeKind][0] === c).length, n: b.parts.length });
    const pic = (i: number) => { gen++; pi = i; Object.keys(done).forEach((k) => delete done[+k]); b.loadNow(PICTURES[i], true); notify({ pi: i, sel: -1 }); stat(); };
    b.onTapPart((i) => { if (i >= 0) { b.pulse(i); notify({ tap: i }); } });
    pic(0);
    return {
      pic, glow: (i) => b.glow(i),
      paint: (i, c) => { if (!b.parts[i]) return; b.paint(i, c); done[i] = c; stat(); },
      rule: () => { const g0 = gen; b.parts.forEach((m, i) => window.setTimeout(() => { if (g0 !== gen) return; const c = RULE[m.userData.k as ShapeKind][0]; b.paint(i, c); done[i] = c; stat(); }, i * 160)); },
      kind: (i) => b.parts[i]?.userData.k, n: () => b.parts.length, painted: () => Object.keys(done).length,
    };
    void pi;
  },
  onEvent: (ev, p) => {
    if (ev.tap !== undefined) p.setUi({ sel: ev.tap });
    if (ev.right !== undefined) { p.setUi({ right: ev.right }); if (p.kit.mode === 'PLAY' && ev.n && ev.right === ev.n) { p.kit.star(); p.kit.good('सबै आकारमा सही रङ!', 'Every shape has the right colour!'); } }
    if (ev.pi !== undefined) p.setUi({ pi: ev.pi });
  },
  learn: [
    { np: 'हेर, आकारहरू मिलेर चित्र बनेको छ।', en: 'Look, a picture made of shapes.', run: (s) => s.pic(0) },
    { np: 'वृत्त रातो हुन्छ।', en: 'Circles are RED.', run: (s) => { s.pic(0); setTimeout(() => s.paint(4, '#ef4444'), 600); } },
    { np: 'त्रिभुज पहेँलो, वर्ग निलो, आयत हरियो।', en: 'Triangles YELLOW, squares BLUE, rectangles GREEN.', run: (s) => { s.pic(0); setTimeout(() => s.rule(), 500); } },
    { np: 'रोबोटमा पनि यही नियम लगाऔँ।', en: 'Use the same rule on the robot.', run: (s) => { s.pic(1); setTimeout(() => s.rule(), 800); } },
  ],
  playIntro: ['आकार छोऔँ, अनि रङ रोजौँ।', 'Tap a shape, then pick a colour.'],
  onPlay: (s) => s.pic(0),
  play: ({ kit, ui, scene, setUi }) => (
    <Controls>
      {SHAPES.map((k) => <CBtn key={k} color={RULE[k][0]} style={{ color: k === 'triangle' ? '#422006' : '#fff' }} onClick={() => { if (ui.sel < 0) { kit.oops('पहिले आकार छोऔँ', 'Tap a shape first'); return; } scene((s) => s.paint(ui.sel, RULE[k][0])); }}><ShapeIcon kind={k} size={26} color="#fff" /> {kit.t(RULE[k][1], RULE[k][2])}</CBtn>)}
      <CBtn color="#8b5cf6" onClick={() => { setUi({ sel: -1 }); scene((s) => s.pic((ui.pi + 1) % PICTURES.length)); }}>🖼 {kit.t('अर्को चित्र', 'Next picture')}</CBtn>
      <CBtn color="#16a34a" onClick={() => scene((s) => s.rule())}>✨ {kit.t('सही रङ', 'Show rule')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.right)} ✅</Hud>),
  quiz: () => {
    const picks: [number, number][] = [[0, 0], [0, 1], [0, 2], [0, 4], [1, 0], [1, 2], [1, 6], [2, 1]];
    return picks.map(([pi, idx]): any => {
      const k = PICTURES[pi].parts[idx].k;
      const colorOpts = shuf(SHAPES).map((s) => ({ key: s, label: <span style={{ display: 'inline-block', width: 34, height: 34, borderRadius: 17, background: RULE[s][0], verticalAlign: 'middle' }} /> }));
      return { np: 'चम्किरहेको आकारमा कुन रङ भर्ने?', en: 'Which colour for the glowing shape?', answer: k, options: colorOpts, setup: (s: CS) => { s.pic(pi); setTimeout(() => s.glow(idx), 500); } };
    });
  },
});

/* ───────── 4 · Shape Detective ───────── */
interface SD { pic: (i: number) => void; glow: (i: number) => void; find: (k: ShapeKind) => number; name: (i: number) => [string, string]; kind: (i: number) => ShapeKind }
export const ShapeDetective3D = makeSim<SD, { pi: number }>({
  cfg: { code: 'SIM-MATH-G1-CH3-04', chapter: 3, titleNp: 'आकार जासुस', titleEn: 'Shape Detective' },
  stage: { camera: [0, 4.2, 14], target: [0, 3, 0], minDistance: 8 },
  ui0: { pi: 0 },
  build: (ctx, notify) => {
    const b = new ShapeBoard(ctx, '#dcfce7');
    let pi = 0;
    const pic = (i: number) => { pi = i; b.loadNow(PICTURES[i]); b.parts.forEach((m) => (m.scale.set(0.01, 0.01, 0.01))); b.parts.forEach((m, j) => window.setTimeout(() => { const bb = m.userData.base as THREE.Vector3; ctx.tween(300, (k) => m.scale.set(bb.x * Math.max(0.01, k), bb.y * Math.max(0.01, k), bb.z * Math.max(0.01, k)), undefined, ease.back); }, j * 90)); notify({ pi: i }); };
    b.onTapPart((i) => { if (i >= 0) { b.pulse(i); notify({ tap: i }); } });
    pic(0);
    return { pic, glow: (i) => b.glow(i), find: (k) => b.parts.findIndex((m) => m.userData.k === k), name: (i) => PICTURES[pi].parts[i]?.name || ['', ''], kind: (i) => b.parts[i]?.userData.k };
  },
  onEvent: (ev, p) => {
    if (ev.tap !== undefined) p.scene((s) => { const k = s.kind(ev.tap); const nm = s.name(ev.tap); p.kit.say(`${nm[0]} ${SN[k][0]} आकारको छ।`, `${nm[1][0].toUpperCase()}${nm[1].slice(1)} is a ${SN[k][1]}.`); });
    if (ev.pi !== undefined) p.setUi({ pi: ev.pi });
  },
  learn: [
    { np: 'म जासुस हुँ! चित्रमा लुकेका आकार खोजौँ।', en: 'I am a detective! Find the shapes hiding in the picture.', run: (s) => s.pic(0) },
    { np: 'छाना त्रिभुज हो।', en: 'The roof is a triangle.', run: (s) => { s.pic(0); setTimeout(() => s.glow(1), 900); } },
    { np: 'घरको भित्ता वर्ग हो। ढोका आयत हो।', en: 'The wall is a square. The door is a rectangle.', run: (s) => { s.pic(0); setTimeout(() => s.glow(0), 900); } },
    { np: 'घाम वृत्त हो। वृत्त जताततै हुन्छ!', en: 'The sun is a circle. Circles are everywhere!', run: (s) => { s.pic(0); setTimeout(() => s.glow(4), 900); } },
  ],
  playIntro: ['कुनै भाग छोऔँ र आकार सुनौँ।', 'Tap any part to hear its shape.'],
  onPlay: (s) => s.pic(0),
  play: ({ kit, ui, scene }) => (
    <Controls>
      {PICTURES.map((pc, i) => <CBtn key={i} color={ui.pi === i ? '#0ea5e9' : '#94a3b8'} onClick={() => scene((s) => s.pic(i))}>{['🏠', '🤖', '⛵'][i]} {kit.t(pc.np, pc.en)}</CBtn>)}
    </Controls>
  ),
  quiz: () => {
    const picks: [number, number][] = [[0, 1], [0, 0], [0, 2], [0, 4], [1, 0], [1, 2], [2, 1], [2, 3]];
    return picks.map(([pi, idx]): any => {
      const k = PICTURES[pi].parts[idx].k;
      return { np: 'चम्किरहेको भाग कुन आकारको हो?', en: 'What shape is the glowing part?', answer: k, options: shapeOpts(shuf([k, ...pickOther(k, 2)])), setup: (s: SD) => { s.pic(pi); setTimeout(() => s.glow(idx), 700); } };
    });
  },
});

/* ───────── 5 · Build with Shapes ───────── */
interface BB { clear: () => void; load: (i: number) => void; addAt: (k: ShapeKind, x: number, y: number) => void; undo: () => void; autoKind: (k: ShapeKind) => void; setSel: (k: ShapeKind) => void; count: (k: ShapeKind) => number; total: () => number }
export const BuildWithShapes3D = makeSim<BB, { sel: ShapeKind; n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH3-05', chapter: 3, titleNp: 'आकारले बनाऔँ', titleEn: 'Build with Shapes' },
  stage: { camera: [0, 4.2, 14], target: [0, 3, 0], minDistance: 8 },
  ui0: { sel: 'square', n: 0 },
  build: (ctx, notify) => {
    const b = new ShapeBoard(ctx, '#fef3c7');
    let sel: ShapeKind = 'square'; let pic = 0;
    const upd = () => notify({ n: b.parts.length });
    ctx.onTap(() => [b.wall], (hit) => { if (hit) { b.add({ k: sel, x: Math.max(-6, Math.min(6, hit.point.x)), y: Math.max(0.6, Math.min(6.4, hit.point.y)), s: 0.7, col: SC[sel] }); upd(); } });
    return {
      clear: () => { b.clear(); upd(); },
      load: (i) => { pic = i; b.loadNow(PICTURES[i]); upd(); },
      addAt: (k, x, y) => { b.add({ k, x, y, s: 0.7, col: SC[k] }); upd(); },
      undo: () => { const m = b.parts.pop(); if (m) b.group.remove(m); upd(); },
      autoKind: (k) => { PICTURES[pic].parts.filter((p) => p.k === k).forEach((p, j) => window.setTimeout(() => { b.add(p); upd(); }, j * 450)); },
      setSel: (k) => { sel = k; }, count: (k) => b.count(k), total: () => b.parts.length,
    };
  },
  onEvent: (ev, p) => { if (ev.n !== undefined) p.setUi({ n: ev.n }); },
  learn: [
    { np: 'आकारले घर बनाऔँ! पहिले वर्ग भित्ता।', en: 'Let us build a house from shapes! First, a square for the wall.', run: (s) => { s.clear(); s.load(0); s.clear(); setTimeout(() => s.autoKind('square'), 400); } },
    { np: 'अब त्रिभुज छाना।', en: 'Now a triangle roof.', run: (s) => { s.autoKind('triangle'); } },
    { np: 'आयतले ढोका बनाऔँ।', en: 'A rectangle makes the door.', run: (s) => { s.autoKind('rectangle'); } },
    { np: 'वृत्तले घाम बनाऔँ। घर तयार!', en: 'A circle makes the sun. The house is done!', run: (s) => { s.autoKind('circle'); } },
  ],
  playIntro: ['आकार रोजौँ, अनि पर्दामा छोएर राखौँ।', 'Pick a shape, then tap the board to put it down.'],
  onPlay: (s) => s.clear(),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      {SHAPES.map((k) => <CBtn key={k} color={ui.sel === k ? '#0ea5e9' : '#e0f2fe'} style={{ color: '#075985' }} onClick={() => { setUi({ sel: k }); scene((s) => s.setSel(k)); }}><ShapeIcon kind={k} size={30} /> {kit.t(SN[k][0], SN[k][1])}</CBtn>)}
      <CBtn color="#f59e0b" onClick={() => scene((s) => s.undo())}>↩</CBtn>
      <CBtn color="#ef4444" onClick={() => scene((s) => s.clear())}>🗑</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.n)} 🧱</Hud>),
  quiz: () => {
    const cnt = (pi: number, k: ShapeKind): any => {
      const a = PICTURES[pi].parts.filter((p) => p.k === k).length;
      return { np: `यहाँ कतिवटा ${SN[k][0]} छन्?`, en: `How many ${SN[k][1]}s can you see?`, answer: String(a), options: numOptions(a, 0, 5, 3), setup: (s: BB) => s.load(pi) };
    };
    const which = (pi: number, idx: number): any => {
      const p = PICTURES[pi].parts[idx];
      return { np: `${p.name![0]} कुन आकारले बनेको छ?`, en: `Which shape makes ${p.name![1]}?`, answer: p.k, options: shapeOpts(shuf([p.k, ...pickOther(p.k, 2)])), setup: (s: BB) => s.load(pi) };
    };
    return [cnt(0, 'square'), which(0, 1), cnt(0, 'circle'), which(0, 2), cnt(1, 'circle'), which(1, 0), cnt(1, 'rectangle'), cnt(2, 'triangle')];
  },
});
void ShapeIcon; void shapeToken;
