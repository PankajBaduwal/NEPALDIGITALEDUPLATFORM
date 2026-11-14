/** Chapter 8 · Subtraction up to 10 — Playground, Empty the Basket, Equation Studio, Difference Explorer, Challenge World (all 3D). */
import React from 'react';
import * as THREE from 'three';
import { CBtn, Controls } from '../class1-math-kit/SimKit';
import { mat, shadowed } from '../class1-math-kit/models';
import { enName, npName } from '../class1-math-kit/nepali';
import { makeSim, Hud, NumPad, numOptions } from './makeSim';
import { Items, ItemKind, BasketBalls, EqBoard } from './scenes';

const shuf = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);
const saySub = (kit: any, a: number, b: number) => kit.say(`${npName(a)} बाट ${npName(b)} घटाउँदा ${npName(a - b)} बाँकी रहन्छ।`, `${enName(a)} take away ${enName(b)} leaves ${enName(a - b)}.`);
const subs = (maxA = 10) => { const out: [number, number][] = []; for (let a = 2; a <= maxA; a++) for (let b = 1; b < a; b++) out.push([a, b]); return out; };

/* ───────── 1 · Subtraction Playground ───────── */
interface SP { set: (a: number) => void; take: (b: number, cb?: () => void) => void; left: () => number }
export const SubtractionPlayground3D = makeSim<SP, { a: number; b: number; left: number }>({
  cfg: { code: 'SIM-MATH-G1-CH8-01', chapter: 8, titleNp: 'घटाउने खेलमैदान', titleEn: 'Subtraction Playground' },
  stage: { camera: [0, 9, 12], target: [0, 0.6, 0], minDistance: 7 },
  ui0: { a: 7, b: 3, left: 7 },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'apple', platform: 6.2, layout: 'frame' }); it.frames(10);
    it.onTapItem((i) => { it.take(i); window.setTimeout(() => { it.relayout(); notify({ left: it.n, tapped: true }); }, 650); });
    return {
      set: (a) => { it.set(a, 'frame'); notify({ left: a }); },
      take: (b, cb) => { it.remove(Math.min(b, it.n), () => { notify({ left: it.n }); cb?.(); }); },
      left: () => it.n,
    };
  },
  onEvent: (ev, p) => { if (ev.left !== undefined) p.setUi({ left: ev.left }); },
  learn: [
    { np: 'सातवटा स्याउ छन्।', en: 'There are seven apples.', run: (s) => s.set(7) },
    { np: 'तीनवटा स्याउ हटाऔँ। घटाउनु भनेको हटाउनु हो।', en: 'Take away three apples. Subtracting means taking away.', run: (s) => { s.set(7); setTimeout(() => s.take(3), 900); } },
    { np: 'सात घटाउ तीन बराबर चार। ४ वटा बाँकी छन्।', en: '7 take away 3 leaves 4.', run: (s, kit) => { s.set(7); setTimeout(() => s.take(3, () => saySub(kit, 7, 3)), 800); } },
  ],
  playIntro: ['कति थियो, कति हटाउने रोजौँ। अनि "हटाऔँ" थिचौँ।', 'Pick how many, and how many to take away. Then press Take away.'],
  onPlay: (s) => s.set(6),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      <span>🍎</span><NumPad kit={kit} from={2} to={10} value={ui.a} onPick={(n) => { setUi({ a: n, b: Math.min(ui.b, n - 1), left: n }); scene((s) => s.set(n)); }} />
      <span>➖</span><NumPad kit={kit} from={1} to={Math.max(1, ui.a - 1)} value={ui.b} onPick={(n) => { setUi({ b: n }); }} />
      <CBtn color="#ef4444" onClick={() => { scene((s) => { s.set(ui.a); setTimeout(() => s.take(ui.b, () => saySub(kit, ui.a, ui.b)), 700); }); }}>💨 {kit.t('हटाऔँ', 'Take away')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} − {p.num(p.ui.b)} = {p.ui.left === p.ui.a - p.ui.b ? p.num(p.ui.left) : '?'}</Hud>),
  quiz: () => shuf(subs()).slice(0, 7).map(([a, b]): any => ({ np: `${npName(a)} बाट ${npName(b)} घटाउँदा कति बाँकी?`, en: `${a} − ${b} = ?`, answer: String(a - b), options: numOptions(a - b, 0, 9, 3), setup: (s: SP) => { s.set(a); setTimeout(() => s.take(b), 900); } })),
});

/* ───────── 2 · Empty the Basket Adventure ───────── */
interface EB { fill: (n: number) => void; out: () => void; n: () => number }
export const EmptyTheBasket3D = makeSim<EB, { a: number; left: number; taken: number }>({
  cfg: { code: 'SIM-MATH-G1-CH8-02', chapter: 8, titleNp: 'टोकरी खाली गरौँ', titleEn: 'Empty the Basket Adventure' },
  stage: { camera: [0, 7.5, 11], target: [0, 1.2, 1], minDistance: 6 },
  ui0: { a: 6, left: 6, taken: 0 },
  build: (ctx, notify) => {
    const bb = new BasketBalls(ctx, notify);
    bb.fill(6);
    return { fill: (n) => bb.fill(n), out: () => bb.out(), n: () => bb.n };
  },
  onEvent: (ev, p) => {
    if (ev.left !== undefined) p.setUi({ left: ev.left, taken: ev.taken ?? 0 });
    if (ev.took) { p.kit.say(`${npName(ev.left)} बाँकी`, `${enName(ev.left)} left`); if (ev.left === 0 && p.kit.mode === 'PLAY') { p.kit.star(); p.kit.good('टोकरी खाली भयो!', 'The basket is empty!'); } }
  },
  learn: [
    { np: 'टोकरीमा छवटा बल छन्।', en: 'Six balls are in the basket.', run: (s) => s.fill(6) },
    { np: 'एउटा-एउटा गरेर निकालौँ। पाँच बाँकी!', en: 'Take them out one by one. Five left!', run: (s) => { s.fill(6); setTimeout(() => s.out(), 900); } },
    { np: 'अझै निकालौँ: चार, तीन, दुई...', en: 'Keep going: four, three, two...', run: (s) => { s.fill(6); [800, 1700, 2600, 3500].forEach((t) => setTimeout(() => s.out(), t)); } },
    { np: 'सबै निकाल्दा शून्य बाँकी रहन्छ।', en: 'Take them all out and zero are left.', run: (s) => { s.fill(6); [700, 1400, 2100, 2800, 3500, 4200].forEach((t) => setTimeout(() => s.out(), t)); } },
  ],
  playIntro: ['बलमा छोएर टोकरीबाट निकालौँ।', 'Tap the balls to take them out of the basket.'],
  onPlay: (s) => s.fill(6),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      <NumPad kit={kit} from={2} to={10} value={ui.a} onPick={(n) => { setUi({ a: n }); scene((s) => s.fill(n)); }} />
      <CBtn color="#ef4444" onClick={() => scene((s) => s.out())}>⚽ {kit.t('एउटा निकालौँ', 'Take one out')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} − {p.num(p.ui.taken)} = {p.num(p.ui.left)}</Hud>),
  quiz: () => shuf(subs()).slice(0, 7).map(([a, b]): any => ({
    np: `टोकरीमा ${npName(a)} बल थिए। ${npName(b)} निकाले। कति बाँकी?`, en: `There were ${a} balls. ${b} came out. How many are left?`, answer: String(a - b), options: numOptions(a - b, 0, 9, 3),
    setup: (s: EB) => { s.fill(a); for (let i = 0; i < b; i++) setTimeout(() => s.out(), 900 + i * 500); },
  })),
});

/* ───────── 3 · Subtraction Equation Studio ───────── */
interface SE { eq: (a: number, b: number, hide: 'c' | 'b' | null) => void; reveal: () => void; strike: () => void }
export const SubtractionEquationStudio3D = makeSim<SE, { a: number; b: number }>({
  cfg: { code: 'SIM-MATH-G1-CH8-03', chapter: 8, titleNp: 'घटाउने समीकरण स्टुडियो', titleEn: 'Subtraction Equation Studio' },
  stage: { camera: [0, 8, 12], target: [0, 1.6, 0], minDistance: 7 },
  ui0: { a: 7, b: 3 },
  build: (ctx, notify) => {
    const board = new EqBoard(ctx, 4.8, 0, 1.7);
    const it = new Items(ctx, { kind: 'apple', platform: 5.2, layout: 'frame' }); it.frames(10);
    let cur = { a: 7, b: 3 };
    const texts = (a: number, b: number, hide: string | null) => [String(a), '−', hide === 'b' ? '?' : String(b), '=', hide === 'c' ? '?' : String(a - b)];
    const grey = (from: number) => it.items.forEach((o, i) => { if (i >= from) o.traverse((c: any) => { if (c.isMesh && c.material?.color) c.material.color.set('#cbd5e1'); }); });
    return {
      eq: (a, b, hide) => { cur = { a, b }; board.set(texts(a, b, hide), hide ? [hide === 'b' ? 2 : 4] : []); it.set(a, 'frame'); window.setTimeout(() => grey(a - b), 500); notify({ a, b }); },
      reveal: () => board.set(texts(cur.a, cur.b, null), []),
      strike: () => { it.remove(cur.b); },
    };
  },
  onEvent: (ev, p) => { if (ev.a !== undefined) p.setUi({ a: ev.a, b: ev.b }); },
  learn: [
    { np: 'समीकरणले कथा भन्छ। ७ − ३ = ४', en: 'An equation tells a story. 7 − 3 = 4', run: (s, kit) => { s.eq(7, 3, null); saySub(kit, 7, 3); } },
    { np: '− को अर्थ घटाउनु हो। खैरा स्याउ हट्छन्।', en: '− means take away. The grey apples go away.', run: (s) => { s.eq(7, 3, null); setTimeout(() => s.strike(), 1200); } },
    { np: 'एउटा सङ्ख्या लुकेको छ: ८ − ५ = ?', en: 'A number is hiding: 8 − 5 = ?', run: (s) => s.eq(8, 5, 'c') },
    { np: 'खैरा स्याउ गन्दा तीन। ८ − ५ = ३', en: 'Count what is left: three. 8 − 5 = 3', run: (s) => { s.eq(8, 5, 'c'); setTimeout(() => s.reveal(), 1400); } },
  ],
  playIntro: ['दुई सङ्ख्या रोजेर समीकरण बनाऔँ।', 'Pick two numbers to build an equation.'],
  onPlay: (s) => s.eq(7, 3, null),
  play: ({ kit, ui, scene, setUi }) => (
    <Controls>
      <NumPad kit={kit} from={2} to={10} value={ui.a} onPick={(n) => { const b = Math.min(ui.b, n - 1); setUi({ a: n, b }); scene((s) => s.eq(n, b, null)); }} />
      <span style={{ fontWeight: 900, fontSize: 24 }}>−</span>
      <NumPad kit={kit} from={1} to={Math.max(1, ui.a - 1)} value={ui.b} onPick={(n) => { setUi({ b: n }); scene((s) => s.eq(ui.a, n, null)); }} />
      <CBtn color="#16a34a" onClick={() => saySub(kit, ui.a, ui.b)}>🔊</CBtn>
    </Controls>
  ),
  quiz: () => shuf(subs()).slice(0, 8).map(([a, b], i): any => {
    const hide = (['c', 'c', 'b'] as const)[i % 3]; const ans = hide === 'c' ? a - b : b;
    return { np: 'लुकेको सङ्ख्या कुन हो?', en: 'Which number is hiding?', answer: String(ans), options: numOptions(ans, 0, 9, 3), setup: (s: SE) => s.eq(a, b, hide) };
  }),
  quizExtra: ({ kit, scene }) => <CBtn color="#16a34a" style={{ minHeight: 44, padding: '6px 14px', fontSize: 15 }} onClick={() => scene((s) => s.reveal())}>👀 {kit.t('सहयोग', 'Hint')}</CBtn>,
});

/* ───────── 4 · More or Less — Difference Explorer ───────── */
interface DE { set: (a: number, b: number) => void; pair: () => void }
export const DifferenceExplorer3D = makeSim<DE, { a: number; b: number; paired: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH8-04', chapter: 8, titleNp: 'धेरै कि थोरै: फरक', titleEn: 'More or Less — Difference Explorer' },
  stage: { camera: [0, 10, 11], target: [0, 0.6, 0], minDistance: 7 },
  ui0: { a: 7, b: 4, paired: false },
  build: (ctx, notify) => {
    const plat = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(7.4, 7.7, 0.36, 48), mat('#fde68a', 0.85))); plat.position.y = 0.18; ctx.scene.add(plat);
    const A = new Items(ctx, { kind: 'apple', z: -2.2, platform: null, layout: 'line' });
    const B = new Items(ctx, { kind: 'ball', z: 2.2, platform: null, layout: 'line' });
    let ribbons: THREE.Object3D[] = []; let gen = 0;
    return {
      set: (a, b) => { gen++; ribbons.forEach((r) => ctx.scene.remove(r)); ribbons = []; A.set(a, 'line'); B.set(b, 'line'); notify({ a, b, paired: false }); },
      pair: () => {
        const g0 = gen; const n = Math.min(A.n, B.n);
        for (let i = 0; i < n; i++) window.setTimeout(() => {
          if (g0 !== gen) return; const a = A.items[i], b = B.items[i]; if (!a || !b) return;
          const r = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.4, 8), mat('#ec4899', 0.4))); r.rotation.x = Math.PI / 2; r.position.set(a.position.x, 0.8, 0); ctx.scene.add(r); ribbons.push(r);
        }, i * 280);
        window.setTimeout(() => {
          if (g0 !== gen) return; const longer = A.n >= B.n ? A : B;
          for (let i = n; i < longer.n; i++) { const o = longer.items[i]; ctx.tween(500, (k) => o.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.5)); o.position.y += 0.6; }
          notify({ paired: true });
        }, n * 280 + 400);
      },
    };
  },
  onEvent: (ev, p) => {
    if (ev.a !== undefined && ev.paired === false) p.setUi({ a: ev.a, b: ev.b, paired: false });
    if (ev.paired) { p.setUi({ paired: true }); p.scene(() => undefined); const d = Math.abs(p.ui.a - p.ui.b); p.kit.say(d === 0 ? 'दुवै बराबर छन्।' : `${npName(p.ui.a > p.ui.b ? p.ui.a : p.ui.b)} मा ${npName(d)} वटा बढी छन्।`, d === 0 ? 'Both are equal.' : `There are ${d} more on the ${p.ui.a > p.ui.b ? 'apple' : 'ball'} side.`); }
  },
  learn: [
    { np: 'स्याउ सातवटा, बल चारवटा।', en: 'Seven apples and four balls.', run: (s) => s.set(7, 4) },
    { np: 'एक-एक जोडा मिलाऔँ। रिबन लगाऔँ।', en: 'Match them one to one with ribbons.', run: (s) => { s.set(7, 4); setTimeout(() => s.pair(), 900); } },
    { np: 'जोडा नपरेका तीनवटा स्याउ बढी छन्। फरक तीन हो।', en: 'Three apples have no partner. The difference is three.', run: (s) => { s.set(7, 4); setTimeout(() => s.pair(), 500); } },
  ],
  playIntro: ['दुई सङ्ख्या रोजेर जोडा मिलाऔँ।', 'Pick two numbers and match them up.'],
  onPlay: (s) => s.set(6, 3),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      <span>🍎</span><NumPad kit={kit} from={1} to={10} value={ui.a} onPick={(n) => { setUi({ a: n, paired: false }); scene((s) => s.set(n, ui.b)); }} />
      <span>⚽</span><NumPad kit={kit} from={1} to={10} value={ui.b} onPick={(n) => { setUi({ b: n, paired: false }); scene((s) => s.set(ui.a, n)); }} />
      <CBtn color="#ec4899" onClick={() => scene((s) => s.pair())}>🎀 {kit.t('जोडा मिलाऔँ', 'Match up')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.ui.paired ? `${p.kit.t('फरक', 'Difference')}: ${p.num(Math.abs(p.ui.a - p.ui.b))}` : `${p.num(p.ui.a)} · ${p.num(p.ui.b)}`}</Hud>),
  quiz: () => shuf(subs()).slice(0, 7).map(([a, b], i): any => {
    const flip = i % 2 === 0;
    return { np: `स्याउ ${npName(flip ? a : b)}, बल ${npName(flip ? b : a)}। फरक कति?`, en: `${flip ? a : b} apples and ${flip ? b : a} balls. What is the difference?`, answer: String(a - b), options: numOptions(a - b, 0, 9, 3), setup: (s: DE) => { s.set(flip ? a : b, flip ? b : a); setTimeout(() => s.pair(), 900); } };
  }),
});

/* ───────── 5 · Subtraction Challenge World ───────── */
interface CW { story: (kind: ItemKind, a: number) => void; go: (b: number, cb?: () => void) => void }
const STORIES: { k: ItemKind; e: string; np: string; en: string; verbNp: string; verbEn: string }[] = [
  { k: 'bird', e: '🐦', np: 'चरा', en: 'birds', verbNp: 'उडे', verbEn: 'flew away' },
  { k: 'balloon', e: '🎈', np: 'बेलुन', en: 'balloons', verbNp: 'फुटे', verbEn: 'popped' },
  { k: 'apple', e: '🍎', np: 'स्याउ', en: 'apples', verbNp: 'खाइए', verbEn: 'were eaten' },
  { k: 'fish', e: '🐟', np: 'माछा', en: 'fish', verbNp: 'पौडिए', verbEn: 'swam away' },
];
export const SubtractionChallengeWorld3D = makeSim<CW, { si: number; a: number; b: number }>({
  cfg: { code: 'SIM-MATH-G1-CH8-05', chapter: 8, titleNp: 'घटाउने चुनौती संसार', titleEn: 'Subtraction Challenge World' },
  stage: { camera: [0, 9, 12], target: [0, 1.2, 0], minDistance: 7 },
  ui0: { si: 0, a: 6, b: 2 },
  build: (ctx) => {
    const it = new Items(ctx, { kind: 'bird', platform: 6.2, layout: 'frame', platformColor: '#bbf7d0' }); it.frames(10);
    return { story: (k, a) => { it.set(a, 'frame', k); }, go: (b, cb) => { it.remove(Math.min(b, it.n), cb); } };
  },
  learn: [
    { np: 'छवटा चरा छन्।', en: 'There are six birds.', run: (s) => s.story('bird', 6) },
    { np: 'दुईवटा चरा उडे। चारवटा बाँकी छन्।', en: 'Two birds flew away. Four are left.', run: (s, kit) => { s.story('bird', 6); setTimeout(() => s.go(2, () => saySub(kit, 6, 2)), 900); } },
    { np: 'आठवटा बेलुनमध्ये तीनवटा फुटे। पाँच बाँकी!', en: 'Of eight balloons, three popped. Five are left!', run: (s, kit) => { s.story('balloon', 8); setTimeout(() => s.go(3, () => saySub(kit, 8, 3)), 900); } },
  ],
  playIntro: ['कथा रोजौँ र सङ्ख्या रोजौँ।', 'Pick a story and numbers.'],
  onPlay: (s) => s.story('bird', 6),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      {STORIES.map((st, i) => <CBtn key={st.k} color={ui.si === i ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 52 }} onClick={() => { setUi({ si: i }); scene((s) => s.story(st.k, ui.a)); }}>{st.e}</CBtn>)}
      <NumPad kit={kit} from={3} to={10} value={ui.a} onPick={(n) => { setUi({ a: n, b: Math.min(ui.b, n - 1) }); scene((s) => s.story(STORIES[ui.si].k, n)); }} />
      <span>➖</span><NumPad kit={kit} from={1} to={Math.max(1, ui.a - 1)} value={ui.b} onPick={(n) => setUi({ b: n })} />
      <CBtn color="#ef4444" onClick={() => scene((s) => { s.story(STORIES[ui.si].k, ui.a); setTimeout(() => s.go(ui.b, () => saySub(kit, ui.a, ui.b)), 700); })}>💨 {kit.t('जाऔँ', 'Go')}</CBtn>
    </Controls>
  ),
  quiz: () => shuf(subs()).slice(0, 8).map(([a, b], i): any => {
    const st = STORIES[i % STORIES.length];
    return { np: `${npName(a)} ${st.np} थिए। ${npName(b)} ${st.verbNp}। कति बाँकी?`, en: `There were ${a} ${st.en}. ${b} ${st.verbEn}. How many are left?`, answer: String(a - b), options: numOptions(a - b, 0, 9, 3), setup: (s: CW) => { s.story(st.k, a); setTimeout(() => s.go(b), 1000); } };
  }),
});
