/** Chapter 1 · Shape, size and space — the two simulations that used to be flat 2D pages, now in 3D. */
import React from 'react';
import * as THREE from 'three';
import { ease } from '../class1-math-kit/useStage';
import { CBtn, Controls } from '../class1-math-kit/SimKit';
import { critter, mat, shadowed, textSprite, pencil, CritterKind } from '../class1-math-kit/models';
import { makeSim, Hud } from './makeSim';

const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(g, m);

/* ───────── Long and Short ───────── */
type Bar = 'pencil' | 'rope' | 'bridge';
const barModel = (kind: Bar, len: number, color: string) => {
  const g = new THREE.Group();
  if (kind === 'pencil') { const p = pencil(color, len - 0.9); p.position.x = -0.2; p.scale.set(1, 2.4, 2.4); g.add(p); }
  else if (kind === 'rope') {
    const r = mesh(new THREE.CylinderGeometry(0.16, 0.16, len, 14), mat(color, 0.9)); r.rotation.z = Math.PI / 2; g.add(r);
    for (let i = 0; i < len * 2; i++) { const k = mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 12), mat('#78350f')); k.rotation.y = Math.PI / 2; k.position.x = -len / 2 + i * 0.5 + 0.25; g.add(k); }
  } else {
    const d = mesh(new THREE.BoxGeometry(len, 0.18, 1.1), mat(color, 0.8)); g.add(d);
    for (const z of [-0.5, 0.5]) { const rail = mesh(new THREE.BoxGeometry(len, 0.08, 0.08), mat('#78350f')); rail.position.set(0, 0.6, z); g.add(rail); for (let i = 0; i <= len; i += 1) { const post = mesh(new THREE.BoxGeometry(0.08, 0.6, 0.08), mat('#78350f')); post.position.set(-len / 2 + i, 0.3, z); g.add(post); } }
  }
  return shadowed(g);
};
const NAMES: Record<Bar, [string, string, string, string]> = { pencil: ['सिसाकलम', 'pencil', 'लामो', 'long'], rope: ['डोरी', 'rope', 'लामो', 'long'], bridge: ['पुल', 'bridge', 'लामो', 'long'] };

interface LS { show: (k: Bar, a: number, b: number) => void; align: (on: boolean) => void; slide: () => void }
export const LongShortExplorer3D = makeSim<LS, { kind: Bar; a: number; b: number; aligned: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH1-04', chapter: 1, titleNp: 'लामो र छोटो अन्वेषक', titleEn: 'Long and Short Explorer' },
  stage: { camera: [0, 7.5, 10], target: [0, 0.5, 0], minDistance: 4 },
  ui0: { kind: 'pencil', a: 8, b: 4, aligned: false },
  build: (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const wall = mesh(new THREE.BoxGeometry(0.15, 3, 6), mat('#fb7185', 0.5)); wall.position.set(-5.6, 1.5, 0); g.add(wall);
    const flag = textSprite('0', 1, { px: 90, w: 128, h: 128 });
    let A: THREE.Object3D | null = null, B: THREE.Object3D | null = null, la = 8, lb = 4, aligned = false;
    const tags: THREE.Object3D[] = [];
    const place = (animate = true) => {
      const set = (o: THREE.Object3D | null, len: number, z: number) => {
        if (!o) return;
        const x1 = aligned ? -5.2 + len / 2 : -len / 2 + (z < 0 ? -0.5 : 0.7);
        const x0 = o.position.x;
        ctx.tween(animate ? 600 : 1, (t) => { o.position.x = x0 + (x1 - x0) * t; }, undefined, ease.inOut);
        o.position.z = z; o.position.y = 0.35;
      };
      set(A, la, -1.8); set(B, lb, 1.8);
    };
    return {
      show: (k, a, b) => {
        [A, B, ...tags].forEach((o) => o && g.remove(o)); tags.length = 0;
        la = a; lb = b; aligned = false;
        A = barModel(k, a, k === 'pencil' ? '#ef4444' : '#ef4444'); B = barModel(k, b, '#2563eb');
        A.position.x = -a / 2 - 0.5; B.position.x = -b / 2 + 0.7;
        g.add(A, B);
        const ta = textSprite('🟥', 1.2, { px: 90, w: 128, h: 128 }), tb = textSprite('🟦', 1.2, { px: 90, w: 128, h: 128 });
        ta.position.set(-6.2, 1, -1.8); tb.position.set(-6.2, 1, 1.8); g.add(ta, tb); tags.push(ta, tb);
        place(false);
        A.scale.setScalar(0.01); B.scale.setScalar(0.01);
        ctx.tween(500, (t) => { A!.scale.setScalar(Math.max(0.01, t)); B!.scale.setScalar(Math.max(0.01, t)); }, undefined, ease.back);
      },
      align: (on) => { aligned = on; place(); },
      slide: () => { aligned = !aligned; place(); },
    };
  },
  learn: [
    { np: 'हेर, दुइवटा सिसाकलम! रातो र निलो।', en: 'Look, two pencils! Red and blue.', run: (s) => s.show('pencil', 8, 4) },
    { np: 'सुरु मिलाऔँ। रातो सिसाकलम लामो छ!', en: 'Line up the starts. The red pencil is LONG!', run: (s) => { s.show('pencil', 8, 4); setTimeout(() => s.align(true), 900); } },
    { np: 'निलो सिसाकलम छोटो छ।', en: 'The blue pencil is SHORT.', run: (s) => { s.show('pencil', 8, 4); setTimeout(() => s.align(true), 400); } },
    { np: 'अब डोरीहरू हेरौँ। निलो डोरी लामो छ!', en: 'Now two ropes. The blue rope is LONG!', run: (s) => { s.show('rope', 4, 9); setTimeout(() => s.align(true), 700); } },
    { np: 'पुल पनि लामो र छोटो हुन्छ। रातो पुल छोटो!', en: 'Bridges can be long or short too. The red bridge is SHORT!', run: (s) => { s.show('bridge', 4, 8); setTimeout(() => s.align(true), 700); } },
  ],
  playIntro: ['वस्तु रोजौँ। सुरु मिलाउने बटन थिचौँ।', 'Pick a thing. Press the button to line up the starts.'],
  onPlay: (s) => s.show('pencil', 8, 4),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      {(['pencil', 'rope', 'bridge'] as Bar[]).map((k, i) => <CBtn key={k} color={ui.kind === k ? '#0ea5e9' : '#94a3b8'} onClick={() => { setUi({ kind: k }); scene((s) => s.show(k, 4 + i * 2, 9 - i)); }}>{['✏️', '🪢', '🌉'][i]} {kit.t(NAMES[k][0], NAMES[k][1])}</CBtn>)}
      <CBtn color="#16a34a" onClick={() => scene((s) => s.slide())}>↔ {kit.t('सुरु मिलाऔँ', 'Line up')}</CBtn>
    </Controls>
  ),
  hud: () => null,
  quiz: () => {
    const kinds: Bar[] = ['pencil', 'rope', 'bridge', 'pencil', 'rope', 'bridge'];
    return kinds.map((k, i) => {
      const redLong = Math.random() > 0.5; const askLong = i % 2 === 0;
      const a = redLong ? 9 : 4, b = redLong ? 4 : 9;
      const ans = askLong ? (redLong ? 'red' : 'blue') : (redLong ? 'blue' : 'red');
      return {
        np: `कुन ${NAMES[k][0]} ${askLong ? 'लामो' : 'छोटो'} छ?`, en: `Which ${NAMES[k][1]} is ${askLong ? 'LONG' : 'SHORT'}?`, answer: ans,
        options: [{ key: 'red', label: '🟥' }, { key: 'blue', label: '🟦' }],
        setup: (s: LS) => { s.show(k, a, b); setTimeout(() => s.align(true), 800); },
      };
    });
  },
});

/* ───────── Direction and Distance ───────── */
interface DS { setup: (mode: 'lr' | 'fmb' | 'nf', flip?: boolean) => void; tag: (text: string, x: number, z: number, y?: number) => void; clearTags: () => void }
const ANIMALS: [CritterKind, string, string, string, string][] = [['dog', '#92400e', '🐶', 'कुकुर', 'dog'], ['cat', '#f59e0b', '🐱', 'बिरालो', 'cat'], ['rabbit', '#e5e7eb', '🐰', 'खरायो', 'rabbit']];

export const DirectionDistance3D = makeSim<DS, {}>({
  cfg: { code: 'SIM-MATH-G1-CH1-05', chapter: 1, titleNp: 'दिशा र दूरी साहसिक यात्रा', titleEn: 'Direction and Distance Adventure' },
  stage: { camera: [0, 8, 13], target: [0, 1, -1] },
  build: (ctx) => {
    const road = mesh(new THREE.BoxGeometry(3, 0.06, 20), mat('#64748b', 0.9)); road.position.set(0, 0.03, -2); road.receiveShadow = true; ctx.scene.add(road);
    for (let i = 0; i < 8; i++) { const d = mesh(new THREE.BoxGeometry(0.15, 0.02, 1), mat('#fff')); d.position.set(0, 0.07, -10 + i * 2.4); ctx.scene.add(d); }
    const g = new THREE.Group(); ctx.scene.add(g);
    const tags: THREE.Object3D[] = [];
    const tag = (text: string, x: number, z: number, y = 3) => { const t = textSprite(text, 2.4, { px: 70, w: 320, h: 128, bg: 'rgba(255,255,255,.95)', border: '#0ea5e9' }); t.position.set(x, y, z); g.add(t); tags.push(t); };
    const clearTags = () => { tags.forEach((t) => g.remove(t)); tags.length = 0; };
    const add = (o: THREE.Object3D, x: number, z: number, face = 0) => { o.position.set(x, 0, z); o.rotation.y = face; g.add(o); o.scale.setScalar(0.01); ctx.tween(500, (k) => o.scale.setScalar(Math.max(0.01, k * 1.5)), undefined, ease.back); };
    const kid = () => critter('bear', '#a16207');
    const setup = (mode: 'lr' | 'fmb' | 'nf', flip = false) => {
      [...g.children].forEach((c) => g.remove(c)); tags.length = 0;
      if (mode === 'lr') {
        add(kid(), 0, 2.5); add(critter(ANIMALS[0][0], ANIMALS[0][1]), flip ? -3.2 : 3.2, -1); add(critter(ANIMALS[1][0], ANIMALS[1][1]), flip ? 3.2 : -3.2, -1);
      } else if (mode === 'fmb') {
        ANIMALS.forEach((a, i) => add(critter(a[0], a[1]), 0, -5 + i * 3.5, Math.PI));
      } else {
        const roof = mesh(new THREE.ConeGeometry(1.7, 1, 4), mat('#b91c1c')); roof.position.y = 1.3; roof.rotation.y = Math.PI / 4;
        const house = shadowed(new THREE.Group()); house.add(mesh(new THREE.BoxGeometry(2, 1.6, 2), mat('#fca5a5')), roof);
        const house2 = house.clone(); house.position.set(-4, 0.8, flip ? -8 : 2.5); house2.position.set(4, 0.8, flip ? 2.5 : -8); house2.scale.setScalar(1); g.add(house, house2);
        add(kid(), 0, 4);
      }
    };
    return { setup, tag, clearTags };
  },
  learn: [
    { np: 'यो हामी हौँ। बाटोको दायाँ हात तिर हेर।', en: 'Look at the path. Find the RIGHT side.', run: (s) => { s.setup('lr'); setTimeout(() => s.tag('दायाँ ➜ कुकुर', 3.2, -1), 500); } },
    { np: 'अर्को छेउ बायाँ हो। बिरालो बायाँतिर छ।', en: 'The other side is LEFT. The cat is on the left.', run: (s) => { s.setup('lr'); setTimeout(() => { s.tag('दायाँ ➜ कुकुर', 3.2, -1); s.tag('⬅ बायाँ: बिरालो', -3.2, -1); }, 500); } },
    { np: 'तीन साथी लाइनमा छन्। अगाडि, बिच, पछाडि।', en: 'Three friends in a line: front, middle, back.', run: (s) => { s.setup('fmb'); setTimeout(() => { s.tag('अगाडि 🐶', 0, -5, 3.6); s.tag('बिच 🐱', 0, -1.5, 3.6); s.tag('पछाडि 🐰', 0, 2, 3.6); }, 500); } },
    { np: 'यो घर नजिक छ, त्यो घर टाढा छ।', en: 'This house is NEAR. That house is FAR.', run: (s) => { s.setup('nf'); setTimeout(() => { s.tag('नजिक', -4, 2.5, 3.2); s.tag('टाढा', 4, -8, 3.2); }, 500); } },
  ],
  playIntro: ['दृश्य रोजौँ। जनावरलाई टेक्नुहोस्।', 'Pick a scene and look around.'],
  onPlay: (s) => s.setup('lr'),
  play: ({ kit, scene }) => (
    <Controls>
      <CBtn onClick={() => scene((s) => s.setup('lr'))}>↔ {kit.t('दायाँ-बायाँ', 'Right-Left')}</CBtn>
      <CBtn color="#8b5cf6" onClick={() => scene((s) => s.setup('fmb'))}>↕ {kit.t('अगाडि-बिच-पछाडि', 'Front-Middle-Back')}</CBtn>
      <CBtn color="#16a34a" onClick={() => scene((s) => s.setup('nf'))}>🏠 {kit.t('नजिक-टाढा', 'Near-Far')}</CBtn>
    </Controls>
  ),
  quiz: () => {
    const A = ANIMALS;
    const opt = (idx: number[]) => idx.map((i) => ({ key: String(i), label: A[i][2] }));
    return [
      { np: 'बाटोको दायाँतिर को छ?', en: 'Who is on the RIGHT of the path?', answer: '0', options: opt([0, 1]), setup: (s: DS) => s.setup('lr') },
      { np: 'बाटोको बायाँतिर को छ?', en: 'Who is on the LEFT of the path?', answer: '1', options: opt([0, 1]), setup: (s: DS) => s.setup('lr') },
      { np: 'दायाँतिर को छ?', en: 'Who is on the RIGHT?', answer: '1', options: opt([0, 1]), setup: (s: DS) => s.setup('lr', true) },
      { np: 'लाइनमा बिचमा को छ?', en: 'Who is in the MIDDLE?', answer: '1', options: opt([0, 1, 2]), setup: (s: DS) => s.setup('fmb') },
      { np: 'लाइनमा अगाडि को छ?', en: 'Who is in FRONT?', answer: '0', options: opt([0, 1, 2]), setup: (s: DS) => s.setup('fmb') },
      { np: 'लाइनमा पछाडि को छ?', en: 'Who is BEHIND?', answer: '2', options: opt([0, 1, 2]), setup: (s: DS) => s.setup('fmb') },
      { np: 'कुन घर नजिक छ? बायाँ कि दायाँ?', en: 'Which house is NEAR? Left or right?', answer: 'L', options: [{ key: 'L', label: '⬅' }, { key: 'R', label: '➡' }], setup: (s: DS) => s.setup('nf') },
      { np: 'कुन घर टाढा छ? बायाँ कि दायाँ?', en: 'Which house is FAR? Left or right?', answer: 'R', options: [{ key: 'L', label: '⬅' }, { key: 'R', label: '➡' }], setup: (s: DS) => s.setup('nf') },
    ];
  },
});
void Hud;
