/** Chapter 10 · Addition up to 20 — Playground, Make Ten, Equation Studio, Block Builder, Challenge World (all 3D). */
import React from 'react';
import * as THREE from 'three';
import { ease } from '../class1-math-kit/useStage';
import { CBtn, Controls } from '../class1-math-kit/SimKit';
import { Blocks } from '../class1-math-kit/place';
import { enName, npName } from '../class1-math-kit/nepali';
import { makeSim, Hud, NumPad, numOptions } from './makeSim';
import { Items, ItemKind, EqBoard, slotPos, makeItem } from './scenes';

const shuf = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);
const sayAdd = (kit: any, a: number, b: number) => kit.say(`${npName(a)} र ${npName(b)} जोड्दा ${npName(a + b)} हुन्छ।`, `${enName(a)} and ${enName(b)} make ${enName(a + b)}.`);
/** sums from 11 to 20 with both addends 2..10 */
const bigPairs = () => { const out: [number, number][] = []; for (let a = 2; a <= 10; a++) for (let b = 2; b <= 10; b++) if (a + b >= 11 && a + b <= 20) out.push([a, b]); return out; };
const anyPairs = () => { const out: [number, number][] = []; for (let a = 2; a <= 10; a++) for (let b = 2; b <= 10; b++) if (a + b <= 20) out.push([a, b]); return out; };

/* ───────── 1 · Addition Playground (up to 20) ───────── */
interface AP { set: (a: number, b: number) => void; join: (cb?: () => void) => void }
export const AdditionPlayground20_3D = makeSim<AP, { a: number; b: number; joined: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH10-01', chapter: 10, titleNp: 'जोड्ने खेलमैदान (२० सम्म)', titleEn: 'Addition Playground to 20' },
  stage: { camera: [0, 12, 13], target: [0, 0.5, 0], minDistance: 8, maxDistance: 26 },
  ui0: { a: 8, b: 5, joined: false },
  build: (ctx, notify) => {
    const L = new Items(ctx, { kind: 'apple', x: -5.2, platform: 4.2, layout: 'grid' }); L.group.scale.setScalar(0.85);
    const R = new Items(ctx, { kind: 'ball', x: 5.2, platform: 4.2, layout: 'grid' }); R.group.scale.setScalar(0.85);
    const T = new Items(ctx, { kind: 'apple', x: 0, platform: 10, layout: 'frame' }); T.frames(20); T.group.scale.setScalar(0.88); T.group.visible = false;
    let a = 8, b = 5; let gen = 0;
    return {
      set: (na, nb) => { gen++; a = na; b = nb; L.group.visible = R.group.visible = true; T.group.visible = false; L.set(a); R.set(b); notify({ a, b, joined: false }); },
      join: (cb) => {
        const g0 = gen;
        [L, R].forEach((it) => it.items.forEach((o, i) => window.setTimeout(() => ctx.tween(350, (k) => { o.position.y = (o.userData.home?.y ?? 0.7) + Math.sin(k * Math.PI) * 1.4; }), i * 70)));
        window.setTimeout(() => {
          if (g0 !== gen) return;
          L.group.visible = R.group.visible = false; T.group.visible = true; T.setTwo(a, b, 'apple', 'ball', '#ef4444', '#0ea5e9');
          T.count(undefined, () => { notify({ joined: true }); cb?.(); }, 260);
        }, 900 + Math.max(a, b) * 70);
      },
    };
  },
  onEvent: (ev, p) => { if (ev.a !== undefined) p.setUi({ a: ev.a, b: ev.b, joined: false }); if (ev.joined) p.setUi({ joined: true }); },
  learn: [
    { np: 'बायाँमा आठ स्याउ, दायाँमा पाँच बल।', en: 'Eight apples on the left, five balls on the right.', run: (s) => s.set(8, 5) },
    { np: 'दुवै समूह जोडौँ। दश खानाको फ्रेम भरिएपछि अर्को फ्रेममा जान्छ।', en: 'Join both groups. When one frame is full, we use the next.', run: (s, kit) => { s.set(8, 5); setTimeout(() => s.join(() => sayAdd(kit, 8, 5)), 900); } },
    { np: 'नौ र सात जोड्दा सोह्र।', en: 'Nine and seven make sixteen.', run: (s, kit) => { s.set(9, 7); setTimeout(() => s.join(() => sayAdd(kit, 9, 7)), 900); } },
  ],
  playIntro: ['दुई सङ्ख्या रोजौँ र "जोडौँ" थिचौँ।', 'Pick two numbers and press Join.'],
  onPlay: (s) => s.set(7, 6),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      <span>🍎</span><NumPad kit={kit} from={2} to={10} value={ui.a} onPick={(n) => { setUi({ a: n }); scene((s) => s.set(n, ui.b)); }} />
      <span>⚽</span><NumPad kit={kit} from={2} to={10} value={ui.b} onPick={(n) => { setUi({ b: n }); scene((s) => s.set(ui.a, n)); }} />
      <CBtn color="#16a34a" onClick={() => scene((s) => s.join(() => sayAdd(kit, ui.a, ui.b)))}>🤝 {kit.t('जोडौँ', 'Join')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} + {p.num(p.ui.b)} = {p.ui.joined ? p.num(p.ui.a + p.ui.b) : '?'}</Hud>),
  quiz: () => shuf(bigPairs()).slice(0, 7).map(([a, b]): any => ({ np: `${npName(a)} र ${npName(b)} जोड्दा कति हुन्छ?`, en: `What is ${a} + ${b}?`, answer: String(a + b), options: numOptions(a + b, 11, 20, 3), setup: (s: AP) => { s.set(a, b); setTimeout(() => s.join(), 800); } })),
});

/* ───────── 2 · Make Ten Adventure ───────── */
interface MT { start: (a: number, b: number) => void; makeTen: (cb?: () => void) => void; shown: () => boolean }
export const MakeTenAdventure3D = makeSim<MT, { a: number; b: number; made: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH10-02', chapter: 10, titleNp: 'दश बनाउने साहसिक', titleEn: 'Make Ten Adventure' },
  stage: { camera: [0, 10, 9], target: [0, 0.5, 0], minDistance: 7, maxDistance: 26 },
  ui0: { a: 8, b: 5, made: false },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'ball', platform: 10, layout: 'frame' }); it.frames(20); it.group.scale.setScalar(0.88);
    let a = 8, b = 5; let made = false; let gen = 0;
    const put = (o: THREE.Object3D, idx: number, ms = 600, lift = 0) => {
      const [x, z] = slotPos(idx, 20, 'frame', 1.35, 2); const p0 = o.position.clone(); const y = p0.y;
      ctx.tween(ms, (k) => { o.position.set(p0.x + (x - p0.x) * k, y + Math.sin(k * Math.PI) * lift, p0.z + (z - p0.z) * k); }, undefined, ease.inOut);
    };
    return {
      start: (na, nb) => {
        gen++; a = na; b = nb; made = false; it.clear();
        for (let i = 0; i < a + b; i++) {
          const o = makeItem('ball', i, i < a ? '#ef4444' : '#0ea5e9'); const idx = i < a ? i : 10 + (i - a); const [x, z] = slotPos(idx, 20, 'frame', 1.35, 2);
          o.position.set(x, 0.81, z); it.group.add(o); it.items.push(o); o.scale.setScalar(0.01); ctx.tween(300 + i * 40, (k) => o.scale.setScalar(Math.max(0.01, k)), undefined, ease.back);
        }
        notify({ a, b, made: false });
      },
      makeTen: (cb) => {
        if (made) return; made = true; const g0 = gen; const need = 10 - a;
        const blues = it.items.slice(a);
        blues.forEach((o, j) => window.setTimeout(() => { if (g0 === gen) put(o, j < need ? a + j : 10 + (j - need), 700, 1.6); }, j * 350));
        window.setTimeout(() => { if (g0 === gen) { notify({ made: true }); cb?.(); } }, blues.length * 350 + 800);
      },
      shown: () => made,
    };
  },
  onEvent: (ev, p) => { if (ev.a !== undefined && ev.made === false) p.setUi({ a: ev.a, b: ev.b, made: false }); if (ev.made) { p.setUi({ made: true }); p.scene(() => undefined); } },
  learn: [
    { np: 'आठ रातो बल र पाँच निलो बल छन्।', en: 'Eight red balls and five blue balls.', run: (s) => s.start(8, 5) },
    { np: 'पहिले दश बनाऔँ! दुईवटा निलो बल पहिलो फ्रेममा जान्छ।', en: 'First, make ten! Two blue balls move into the first frame.', run: (s) => { s.start(8, 5); setTimeout(() => s.makeTen(), 900); } },
    { np: 'अब दश र तीन बाँकी। दश र तीन = तेह्र!', en: 'Now ten and three left. Ten and three make thirteen!', run: (s, kit) => { s.start(8, 5); setTimeout(() => s.makeTen(() => kit.say('८ + ५ = १०, अनि ३ थप = १३', '8 + 5: make 10, then 3 more is 13')), 600); } },
    { np: 'नौ र चार: एउटा सार्छौँ, दश र तीन = तेह्र।', en: 'Nine and four: move one, ten and three more is thirteen.', run: (s) => { s.start(9, 4); setTimeout(() => s.makeTen(), 700); } },
  ],
  playIntro: ['दुई सङ्ख्या रोजौँ, अनि "दश बनाऔँ" थिचौँ।', 'Pick two numbers, then press Make ten.'],
  onPlay: (s) => s.start(7, 6),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      <span>🔴</span><NumPad kit={kit} from={6} to={9} value={ui.a} onPick={(n) => { setUi({ a: n, made: false }); scene((s) => s.start(n, ui.b)); }} />
      <span>🔵</span><NumPad kit={kit} from={2} to={9} value={ui.b} onPick={(n) => { setUi({ b: n, made: false }); scene((s) => s.start(ui.a, n)); }} />
      <CBtn color="#16a34a" disabled={ui.made} onClick={() => scene((s) => s.makeTen(() => kit.say(`${npName(ui.a)} र ${npName(ui.b)} = ${npName(ui.a + ui.b)}`, `${ui.a} + ${ui.b} = ${ui.a + ui.b}`)))}>🔟 {kit.t('दश बनाऔँ', 'Make ten')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} + {p.num(p.ui.b)} = {p.ui.made ? `10 + ${p.num(p.ui.a + p.ui.b - 10)} = ${p.num(p.ui.a + p.ui.b)}` : '?'}</Hud>),
  quiz: () => shuf(bigPairs().filter(([a, b]) => a >= 6 && b <= 9)).slice(0, 7).map(([a, b]): any => ({ np: `${npName(a)} र ${npName(b)} जोड्दा कति हुन्छ? (दश बनाएर हेर)`, en: `${a} + ${b} = ? (make ten first)`, answer: String(a + b), options: numOptions(a + b, 11, 20, 3), setup: (s: MT) => { s.start(a, b); setTimeout(() => s.makeTen(), 900); } })),
});

/* ───────── 3 · Addition Equation Studio (up to 20) ───────── */
interface ES { eq: (a: number, b: number, hide: 'c' | 'b' | 'a' | null) => void; reveal: () => void }
export const AdditionEquationStudio20_3D = makeSim<ES, { a: number; b: number }>({
  cfg: { code: 'SIM-MATH-G1-CH10-03', chapter: 10, titleNp: 'जोड्ने समीकरण स्टुडियो (२०)', titleEn: 'Addition Equation Studio to 20' },
  stage: { camera: [0, 11, 12], target: [0, 1.6, 0], minDistance: 8, maxDistance: 26 },
  ui0: { a: 9, b: 6 },
  build: (ctx, notify) => {
    const board = new EqBoard(ctx, 5.4, 0, 1.7);
    const it = new Items(ctx, { kind: 'apple', platform: 10, layout: 'frame' }); it.frames(20); it.group.scale.setScalar(0.88);
    let cur = { a: 9, b: 6 };
    const texts = (a: number, b: number, hide: string | null) => [hide === 'a' ? '?' : String(a), '+', hide === 'b' ? '?' : String(b), '=', hide === 'c' ? '?' : String(a + b)];
    return {
      eq: (a, b, hide) => { cur = { a, b }; board.set(texts(a, b, hide), hide ? [hide === 'a' ? 0 : hide === 'b' ? 2 : 4] : []); it.setTwo(a, b, 'apple', 'ball', '#ef4444', '#0ea5e9'); notify({ a, b }); },
      reveal: () => board.set(texts(cur.a, cur.b, null), []),
    };
  },
  onEvent: (ev, p) => { if (ev.a !== undefined) p.setUi({ a: ev.a, b: ev.b }); },
  learn: [
    { np: '९ + ६ = १५। वस्तु र समीकरण मिल्छन्।', en: '9 + 6 = 15. The objects and the equation match.', run: (s, kit) => { s.eq(9, 6, null); sayAdd(kit, 9, 6); } },
    { np: 'बायाँको सङ्ख्या र दायाँको सङ्ख्या जोडेर उत्तर बन्छ।', en: 'The left number and the right number join to make the answer.', run: (s) => s.eq(7, 8, null) },
    { np: 'एउटा सङ्ख्या लुकेको छ: ८ + ७ = ?', en: 'A number is hiding: 8 + 7 = ?', run: (s) => s.eq(8, 7, 'c') },
    { np: 'वस्तु गन्दा पन्ध्र! ८ + ७ = १५', en: 'Count the objects: fifteen! 8 + 7 = 15', run: (s) => { s.eq(8, 7, 'c'); setTimeout(() => s.reveal(), 1500); } },
  ],
  playIntro: ['दुई सङ्ख्या रोजेर समीकरण बनाऔँ।', 'Pick two numbers to build an equation.'],
  onPlay: (s) => s.eq(9, 6, null),
  play: ({ kit, ui, scene, setUi }) => (
    <Controls>
      <NumPad kit={kit} from={2} to={10} value={ui.a} onPick={(n) => { const b = Math.min(ui.b, 20 - n); setUi({ a: n, b }); scene((s) => s.eq(n, b, null)); }} />
      <span style={{ fontWeight: 900, fontSize: 24 }}>+</span>
      <NumPad kit={kit} from={2} to={10} value={ui.b} onPick={(n) => { setUi({ b: n }); scene((s) => s.eq(ui.a, n, null)); }} />
      <CBtn color="#16a34a" onClick={() => sayAdd(kit, ui.a, ui.b)}>🔊</CBtn>
    </Controls>
  ),
  quiz: () => shuf(anyPairs().filter(([a, b]) => a + b >= 11)).slice(0, 8).map(([a, b], i): any => {
    const hide = (['c', 'c', 'b', 'a'] as const)[i % 4]; const ans = hide === 'c' ? a + b : hide === 'b' ? b : a;
    return { np: 'लुकेको सङ्ख्या कुन हो?', en: 'Which number is hiding?', answer: String(ans), options: numOptions(ans, 2, 20, 3), setup: (s: ES) => s.eq(a, b, hide) };
  }),
  quizExtra: ({ kit, scene }) => <CBtn color="#16a34a" style={{ minHeight: 44, padding: '6px 14px', fontSize: 15 }} onClick={() => scene((s) => s.reveal())}>👀 {kit.t('सहयोग', 'Hint')}</CBtn>,
});

/* ───────── 4 · Addition Block Builder ───────── */
interface BB { build: (a: number, b: number, cb?: () => void) => void; show: (a: number) => void; hideLabel: (h: boolean) => void }
export const AdditionBlockBuilder3D = makeSim<BB, { a: number; b: number; done: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH10-04', chapter: 10, titleNp: 'जोड्ने ब्लक निर्माता', titleEn: 'Addition Block Builder' },
  stage: { camera: [-3, 9, 12], target: [-3, 1.8, 0], minDistance: 7 },
  ui0: { a: 8, b: 5, done: false },
  build: (ctx, notify) => {
    const bl = new Blocks(ctx, { x: -7, z: 1, tensColor: '#38bdf8', onesColor: '#facc15', u: 0.55 });
    const lab = (bl as any).label as THREE.Sprite;
    let gen = 0;
    return {
      show: (a) => { gen++; bl.set(0, a); lab.visible = true; notify({ a, done: false }); },
      hideLabel: (h) => { lab.visible = !h; },
      build: (a, b, cb) => {
        gen++; const g0 = gen; bl.set(0, a); lab.visible = true; notify({ a, b, done: false });
        for (let i = 0; i < b; i++) window.setTimeout(() => {
          if (g0 !== gen) return; bl.addOne(); if (bl.ones.length >= 10) window.setTimeout(() => { if (g0 === gen) bl.bundle(); }, 350);
        }, 900 + i * 600);
        window.setTimeout(() => { if (g0 === gen) { notify({ done: true }); cb?.(); } }, 900 + b * 600 + 1200);
      },
    };
  },
  onEvent: (ev, p) => { if (ev.a !== undefined) p.setUi({ a: ev.a, ...(ev.b !== undefined ? { b: ev.b } : {}), done: false }); if (ev.done) p.setUi({ done: true }); },
  learn: [
    { np: 'आठवटा पहेँला क्यूब छन्।', en: 'Eight yellow cubes.', run: (s) => s.show(8) },
    { np: 'अब पाँचवटा थपौँ। दशवटा पुगेपछि क्यूब नीलो खम्बा बन्छ!', en: 'Add five more. At ten, the cubes become a blue tower!', run: (s) => { s.build(8, 5); } },
    { np: 'एक दशक र तीन एकाइ = तेह्र।', en: 'One ten and three ones = thirteen.', run: (s, kit) => { s.build(8, 5, () => kit.say('८ + ५ = १३', '8 + 5 = 13')); } },
  ],
  playIntro: ['दुई सङ्ख्या रोजेर ब्लक बनाऔँ।', 'Pick two numbers and watch the blocks.'],
  onPlay: (s) => s.show(8),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      <NumPad kit={kit} from={2} to={10} value={ui.a} onPick={(n) => { setUi({ a: n }); scene((s) => s.show(n)); }} />
      <span style={{ fontWeight: 900, fontSize: 24 }}>+</span>
      <NumPad kit={kit} from={2} to={10} value={ui.b} onPick={(n) => setUi({ b: n })} />
      <CBtn color="#16a34a" onClick={() => scene((s) => s.build(ui.a, ui.b, () => sayAdd(kit, ui.a, ui.b)))}>🧱 {kit.t('बनाऔँ', 'Build')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} + {p.num(p.ui.b)} = {p.ui.done ? p.num(p.ui.a + p.ui.b) : '?'}</Hud>),
  quiz: () => shuf(bigPairs()).slice(0, 7).map(([a, b]): any => ({ np: `${npName(a)} + ${npName(b)} = ?`, en: `${a} + ${b} = ?`, answer: String(a + b), options: numOptions(a + b, 11, 20, 3), setup: (s: BB) => { s.build(a, b); s.hideLabel(true); } })),
});

/* ───────── 5 · Addition Challenge World ───────── */
interface CW { story: (k: ItemKind, a: number) => void; join: (b: number) => void }
const STORIES: { k: ItemKind; e: string; np: string; en: string; verbNp: string; verbEn: string }[] = [
  { k: 'bird', e: '🐦', np: 'चरा', en: 'birds', verbNp: 'आए', verbEn: 'flew in' }, { k: 'balloon', e: '🎈', np: 'बेलुन', en: 'balloons', verbNp: 'थपिए', verbEn: 'were added' },
  { k: 'apple', e: '🍎', np: 'स्याउ', en: 'apples', verbNp: 'टिपिए', verbEn: 'were picked' }, { k: 'fish', e: '🐟', np: 'माछा', en: 'fish', verbNp: 'आए', verbEn: 'swam in' },
];
export const AdditionChallengeWorld3D = makeSim<CW, { si: number; a: number; b: number }>({
  cfg: { code: 'SIM-MATH-G1-CH10-05', chapter: 10, titleNp: 'जोड्ने चुनौती संसार', titleEn: 'Addition Challenge World' },
  stage: { camera: [0, 12, 12], target: [0, 1, 0], minDistance: 8, maxDistance: 26 },
  ui0: { si: 0, a: 8, b: 5 },
  build: (ctx) => {
    const it = new Items(ctx, { kind: 'bird', platform: 10, layout: 'frame', platformColor: '#bbf7d0' }); it.frames(20); it.group.scale.setScalar(0.88);
    return { story: (k, a) => { it.set(a, 'frame', k); }, join: (b) => { if (it.n + b <= 20) it.add(b); } };
  },
  learn: [
    { np: 'आठवटा चरा छन्।', en: 'Eight birds are here.', run: (s) => s.story('bird', 8) },
    { np: 'पाँचवटा अरू चरा आए!', en: 'Five more birds flew in!', run: (s) => { s.story('bird', 8); setTimeout(() => s.join(5), 900); } },
    { np: 'अब कति भए? ८ + ५ = १३', en: 'How many now? 8 + 5 = 13', run: (s, kit) => { s.story('bird', 8); setTimeout(() => { s.join(5); sayAdd(kit, 8, 5); }, 700); } },
  ],
  playIntro: ['कथा र सङ्ख्या रोजौँ।', 'Pick a story and numbers.'],
  onPlay: (s) => s.story('bird', 8),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      {STORIES.map((st, i) => <CBtn key={st.k} color={ui.si === i ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 52 }} onClick={() => { setUi({ si: i }); scene((s) => s.story(st.k, ui.a)); }}>{st.e}</CBtn>)}
      <NumPad kit={kit} from={2} to={10} value={ui.a} onPick={(n) => { setUi({ a: n }); scene((s) => s.story(STORIES[ui.si].k, n)); }} />
      <span style={{ fontWeight: 900 }}>＋</span><NumPad kit={kit} from={2} to={10} value={ui.b} onPick={(n) => setUi({ b: n })} />
      <CBtn color="#16a34a" onClick={() => scene((s) => { s.story(STORIES[ui.si].k, ui.a); setTimeout(() => { s.join(ui.b); sayAdd(kit, ui.a, ui.b); }, 700); })}>➕ {kit.t('थपौँ', 'Add')}</CBtn>
    </Controls>
  ),
  quiz: () => shuf(bigPairs()).slice(0, 8).map(([a, b], i): any => {
    const st = STORIES[i % STORIES.length];
    return { np: `${npName(a)} ${st.np} थिए। ${npName(b)} ${st.verbNp}। जम्मा कति?`, en: `There were ${a} ${st.en}. ${b} more ${st.verbEn}. How many in all?`, answer: String(a + b), options: numOptions(a + b, 11, 20, 3), setup: (s: CW) => { s.story(st.k, a); setTimeout(() => s.join(b), 1000); } };
  }),
});
