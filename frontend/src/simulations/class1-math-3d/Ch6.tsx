/** Chapter 6 · The number ten — Ten Objects, Discovery, Make Ten, Count and Match, Writing Studio (all 3D). */
import React from 'react';
import * as THREE from 'three';
import { ease } from '../class1-math-kit/useStage';
import { CBtn, Controls } from '../class1-math-kit/SimKit';
import { tenTower } from '../class1-math-kit/models';
import { enName, npName, toNp } from '../class1-math-kit/nepali';
import { makeSim, Hud, NumPad, numOptions } from './makeSim';
import { Items, ItemKind, BigNumber } from './scenes';
import { makeNumberMatch } from './Ch4';
import { TraceBoard, numberPath } from './trace';

const shuf = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);
const KINDS: { k: ItemKind; e: string; np: string; en: string }[] = [
  { k: 'apple', e: '🍎', np: 'स्याउ', en: 'apples' }, { k: 'ball', e: '⚽', np: 'बल', en: 'balls' }, { k: 'star', e: '⭐', np: 'तारा', en: 'stars' }, { k: 'fish', e: '🐟', np: 'माछा', en: 'fish' },
];

/* ───────── 1 · Ten Object Adventure ───────── */
interface T1 { fill: (to: number, cb?: (n: number) => void, ms?: number) => void; set: (n: number) => void; add: () => void; sub: () => void; kind: (k: ItemKind) => void; n: () => number }
export const TenObjects3D = makeSim<T1, { n: number; kind: ItemKind }>({
  cfg: { code: 'SIM-MATH-G1-CH6-01', chapter: 6, titleNp: 'दश वटा वस्तु', titleEn: 'Ten Object Adventure' },
  stage: { camera: [0, 9, 9], target: [0, 0.5, 0], minDistance: 6 },
  ui0: { n: 5, kind: 'apple' },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'apple', platform: 6.4, layout: 'frame' });
    it.frames(10);
    let gen = 0;
    const upd = () => notify({ n: it.n });
    it.onTapItem((i) => { it.hop(i); notify({ say: i + 1 }); });
    return {
      fill: (to, cb, ms = 800) => { gen++; const g0 = gen; it.set(0, 'frame'); for (let i = 1; i <= to; i++) window.setTimeout(() => { if (g0 !== gen) return; it.add(1); upd(); cb?.(i); }, i * ms); },
      set: (n) => { gen++; it.set(n, 'frame'); upd(); },
      add: () => { if (it.n < 10) { it.add(1); upd(); } }, sub: () => { if (it.n > 0) { it.remove(1); window.setTimeout(upd, 600); } },
      kind: (k) => { const n = it.n; it.kind = k; it.set(n, 'frame', k); }, n: () => it.n,
    };
  },
  onEvent: (ev, p) => {
    if (ev.n !== undefined) { p.setUi({ n: ev.n }); if (ev.n === 10 && p.kit.mode === 'PLAY') { p.kit.good('दश! पूरा फ्रेम!', 'Ten! The frame is full!'); p.kit.star(); } }
    if (ev.say) p.kit.say(npName(ev.say), enName(ev.say));
  },
  learn: [
    { np: 'दश खानाको फ्रेममा वस्तु राखेर १ देखि १० सम्म गनौँ।', en: 'Let us count to ten in the ten-frame.', run: (s, kit) => s.fill(10, (n) => kit.say(npName(n), enName(n), true), 900) },
    { np: 'नौ वटा छन्। अब एउटा थपौँ।', en: 'Nine are here. Add one more.', run: (s) => s.set(9) },
    { np: 'नौ र एक मिलेर दश हुन्छ। फ्रेम भरियो!', en: 'Nine and one make ten. The frame is full!', run: (s) => { s.set(9); setTimeout(() => s.add(), 900); } },
    { np: 'दश लेखिन्छ १०। एक दशक र शून्य एकाइ।', en: 'Ten is written 10: one ten and zero ones.', run: (s) => s.set(10) },
  ],
  playIntro: ['+ थिचेर एक-एक गर्दै दश बनाऔँ।', 'Press + to add one at a time until you reach ten.'],
  onPlay: (s) => s.set(3),
  play: ({ kit, scene, ui, setUi }) => (
    <Controls>
      <CBtn color="#16a34a" onClick={() => scene((s) => s.add())}>➕ {kit.t('एउटा थपौँ', 'Add one')}</CBtn>
      <CBtn color="#ef4444" onClick={() => scene((s) => s.sub())}>➖</CBtn>
      <NumPad kit={kit} from={1} to={10} value={ui.n} onPick={(n) => scene((s) => s.set(n))} />
      {KINDS.map((k) => <CBtn key={k.k} color={ui.kind === k.k ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 48 }} onClick={() => { setUi({ kind: k.k }); scene((s) => s.kind(k.k)); }}>{k.e}</CBtn>)}
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud color={p.ui.n === 10 ? '#16a34a' : '#0ea5e9'}>{p.num(p.ui.n)}</Hud>),
  quiz: () => shuf([6, 7, 8, 9, 10, 10, 8]).map((n): any => ({ np: 'कतिवटा छन्?', en: 'How many are there?', answer: String(n), options: numOptions(n, 5, 10, 3), setup: (s: T1) => s.set(n) })),
});

/* ───────── 2 · Number Ten Discovery World ───────── */
interface T2 { nine: () => void; plusOne: () => void; bundle: () => void; show: (n: number) => void }
export const TenDiscovery3D = makeSim<T2, { n: number; bundled: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH6-02', chapter: 6, titleNp: 'दश खोजौँ', titleEn: 'Number Ten Discovery World' },
  stage: { camera: [0, 9, 10], target: [0, 1, 0], minDistance: 6 },
  ui0: { n: 9, bundled: false },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'cube', platform: 7, layout: 'frame', x: -2 });
    it.frames(10);
    let tower: THREE.Object3D | null = null; let big: BigNumber | null = null;
    const upd = () => notify({ n: it.n });
    const clearTower = () => { if (tower) { ctx.scene.remove(tower); tower = null; } };
    const show = (n: number) => { clearTower(); it.group.visible = true; it.set(n, 'frame'); upd(); notify({ bundled: false }); };
    void big; big = null;
    return {
      nine: () => show(9), show,
      plusOne: () => { if (it.n < 10) { it.add(1, '#38bdf8'); upd(); } },
      bundle: () => {
        if (it.n < 10) return;
        it.items.forEach((o, i) => window.setTimeout(() => ctx.tween(500, (k) => { o.position.x += (6 - 2 - o.position.x) * 0.0; o.scale.setScalar(Math.max(0.01, 1 - k)); }), i * 60));
        window.setTimeout(() => {
          it.group.visible = false; clearTower();
          tower = tenTower('#38bdf8', 0.6); tower.position.set(4, 0.36, 0); ctx.scene.add(tower);
          tower.scale.setScalar(0.01); ctx.tween(600, (k) => tower!.scale.setScalar(Math.max(0.01, k)), undefined, ease.back);
          notify({ bundled: true });
        }, 900);
      },
    };
  },
  onEvent: (ev, p) => {
    if (ev.n !== undefined) p.setUi({ n: ev.n });
    if (ev.bundled !== undefined) { p.setUi({ bundled: ev.bundled }); if (ev.bundled) { p.kit.say('दशवटा क्यूब मिलेर एक दशक बन्यो!', 'Ten cubes make one ten!'); if (p.kit.mode === 'PLAY') p.kit.star(); } }
  },
  learn: [
    { np: 'यहाँ नौवटा क्यूब छन्।', en: 'There are nine cubes here.', run: (s) => s.nine() },
    { np: 'एउटा क्यूब थपौँ। नौ भन्दा एक बढी दश हो!', en: 'Add one cube. One more than nine is ten!', run: (s) => { s.nine(); setTimeout(() => s.plusOne(), 900); } },
    { np: 'दशवटा क्यूबलाई एउटा लामो खम्बामा बाँधौँ। यो एक दशक हो।', en: 'Bundle the ten cubes into one tall tower. This is one ten.', run: (s) => { s.nine(); setTimeout(() => s.plusOne(), 700); setTimeout(() => s.bundle(), 2000); } },
  ],
  playIntro: ['क्यूब थपेर दश बनाऔँ, अनि बाँधौँ।', 'Add cubes to make ten, then bundle them.'],
  onPlay: (s) => s.show(7),
  play: ({ kit, scene, ui }) => (
    <Controls>
      <CBtn color="#16a34a" onClick={() => scene((s) => s.plusOne())}>➕ {kit.t('एउटा थपौँ', 'Add one')}</CBtn>
      <CBtn color="#8b5cf6" disabled={ui.n < 10 || ui.bundled} onClick={() => scene((s) => s.bundle())}>📦 {kit.t('बाँधौँ', 'Bundle')}</CBtn>
      <CBtn color="#94a3b8" onClick={() => scene((s) => s.show(Math.floor(Math.random() * 8) + 1))}>🔄 {kit.t('फेरि', 'Again')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud color={p.ui.n === 10 ? '#16a34a' : '#0ea5e9'}>{p.ui.bundled ? '10 = 1 ' + p.kit.t('दशक', 'ten') : p.num(p.ui.n)}</Hud>),
  quiz: () => {
    const more = (n: number): any => ({ np: `${npName(n)} भन्दा एक बढी कति हुन्छ?`, en: `What is one more than ${enName(n)}?`, answer: String(n + 1), options: numOptions(n + 1, 5, 10, 3), setup: (s: T2) => s.show(n) });
    const many = (n: number): any => ({ np: 'कतिवटा क्यूब छन्?', en: 'How many cubes?', answer: String(n), options: numOptions(n, 5, 10, 3), setup: (s: T2) => s.show(n) });
    return shuf([more(9), more(8), many(10), many(9), more(7), many(8), more(5)]);
  },
});

/* ───────── 3 · Make Ten ───────── */
interface T3 { start: (a: number) => void; add: () => void; fill: () => void; n: () => number }
export const MakeTen3D = makeSim<T3, { a: number; n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH6-03', chapter: 6, titleNp: 'दश बनाऔँ', titleEn: 'Make Ten Challenge' },
  stage: { camera: [0, 9, 9], target: [0, 0.5, 0], minDistance: 6 },
  ui0: { a: 6, n: 6 },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'ball', platform: 6.4, layout: 'frame' });
    it.frames(10);
    let a = 6;
    const upd = () => notify({ n: it.n, a });
    it.onTapItem(() => undefined);
    const addOne = () => { if (it.n < 10) { it.add(1, '#0ea5e9'); upd(); if (it.n === 10) notify({ full: true }); } };
    ctx.onTap(() => [it.group.children[1] || it.group], () => { /* tapping the board adds a ball */ });
    return {
      start: (n) => { a = n; it.set(n, 'frame'); (it.items as THREE.Object3D[]).forEach((o) => ((o as any).children?.[0]?.material?.color?.set?.('#ef4444'))); upd(); },
      add: addOne,
      fill: () => { const miss = 10 - it.n; for (let i = 0; i < miss; i++) window.setTimeout(addOne, i * 500); },
      n: () => it.n,
    };
  },
  onEvent: (ev, p) => {
    if (ev.n !== undefined) p.setUi({ n: ev.n, a: ev.a });
    if (ev.full && p.kit.mode !== 'CHALLENGE') { p.scene((s) => void s); p.kit.good('दश पुग्यो!', 'You made ten!'); if (p.kit.mode === 'PLAY') p.kit.star(); }
  },
  learn: [
    { np: 'छवटा रातो बल छन्। दश बनाउन कति चाहिन्छ?', en: 'Six red balls. How many more do we need for ten?', run: (s) => s.start(6) },
    { np: 'निलो बल थपौँ: एक, दुई, तीन, चार!', en: 'Add blue balls: one, two, three, four!', run: (s) => { s.start(6); setTimeout(() => s.fill(), 1000); } },
    { np: 'छ र चार मिलेर दश हुन्छ।', en: 'Six and four make ten.', run: (s) => { s.start(6); setTimeout(() => s.fill(), 600); } },
    { np: 'सात र तीन मिलेर पनि दश हुन्छ।', en: 'Seven and three also make ten.', run: (s) => { s.start(7); setTimeout(() => s.fill(), 600); } },
  ],
  playIntro: ['सङ्ख्या रोजौँ, अनि निलो बल थपेर दश बनाऔँ।', 'Pick a number, then add blue balls to make ten.'],
  onPlay: (s) => s.start(5),
  play: ({ kit, scene, ui }) => (
    <Controls>
      <NumPad kit={kit} from={1} to={9} value={ui.a} onPick={(n) => scene((s) => s.start(n))} />
      <CBtn color="#0ea5e9" onClick={() => scene((s) => s.add())}>🔵 {kit.t('एउटा थपौँ', 'Add one')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} + {p.num(p.ui.n - p.ui.a)} = {p.ui.n === 10 ? p.num(10) : '?'}</Hud>),
  quiz: () => shuf([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 7).map((a): any => ({ np: `${npName(a)} र कति मिलेर दश हुन्छ?`, en: `${enName(a)} and how many make ten?`, answer: String(10 - a), options: numOptions(10 - a, 1, 9, 3), setup: (s: T3) => s.start(a) })),
  quizExtra: ({ kit, scene }) => <CBtn color="#16a34a" style={{ minHeight: 44, padding: '6px 14px', fontSize: 15 }} onClick={() => scene((s) => s.fill())}>👀 {kit.t('सहयोग', 'Hint')}</CBtn>,
});

/* ───────── 4 · Count and Match Ten ───────── */
export const CountMatchTen3D = makeNumberMatch({
  cfg: { code: 'SIM-MATH-G1-CH6-04', chapter: 6, titleNp: 'गनौँ र मिलाऔँ', titleEn: 'Count and Match Ten' },
  pool: [6, 7, 8, 9, 10], kinds: ['apple', 'ball', 'star'], scale: 0.62, sets: [[7, 10, 8], [9, 6, 10], [8, 7, 9]],
});

/* ───────── 5 · Number Ten Writing Studio ───────── */
interface T5 { show: (n: number) => void; demo: () => void; clear: () => void; color: (c: string) => void }
export const TenWriting3D = makeSim<T5, { n: number; pct: number; color: string }>({
  cfg: { code: 'SIM-MATH-G1-CH6-05', chapter: 6, titleNp: 'दश लेखौँ', titleEn: 'Number Ten Writing Studio' },
  stage: { camera: [0, 12, 3.5], target: [0, 0, 0], minDistance: 6 },
  ui0: { n: 10, pct: 0, color: '#2563eb' },
  build: (ctx, notify) => {
    ctx.scene.background = new THREE.Color(0xfef9c3);
    const tb = new TraceBoard(ctx);
    tb.onPct = (pct) => notify({ pct }); tb.onDone = () => notify({ done: true });
    const big = (n: number) => numberPath(n).map(([x, z]) => [x * 1.3, z * 1.3] as [number, number]);
    tb.setPath(big(10));
    return { show: (n) => { tb.setPath(big(n)); notify({ n }); }, demo: () => tb.demo(), clear: () => tb.clearInk(), color: (c) => tb.setColor(c) };
  },
  onEvent: (ev, p) => { if (ev.pct !== undefined) p.setUi({ pct: ev.pct }); if (ev.n !== undefined) p.setUi({ n: ev.n }); if (ev.done && p.kit.mode !== 'CHALLENGE') { p.kit.good('दश लेखियो!', 'You wrote it!'); p.kit.star(); } },
  learn: [
    { np: 'दश लेख्न पहिले १ लेख्छौँ।', en: 'To write ten we first write 1.', run: (s) => { s.show(1); setTimeout(() => s.demo(), 700); } },
    { np: 'त्यसपछि ० लेख्छौँ।', en: 'Then we write 0.', run: (s) => { s.show(0); setTimeout(() => s.demo(), 700); } },
    { np: 'दुई सङ्ख्या मिलेर १० बन्छ। दश!', en: 'Together they make 10. Ten!', run: (s) => { s.show(10); setTimeout(() => s.demo(), 700); } },
  ],
  playIntro: ['सङ्ख्या रोजेर थोप्लामा औँला तानेर लेखौँ।', 'Pick a number and trace the dots with your finger.'],
  onPlay: (s) => s.show(10),
  play: ({ kit, scene, ui, setUi }) => (
    <Controls>
      <NumPad kit={kit} from={6} to={10} value={ui.n} onPick={(n) => scene((s) => s.show(n))} />
      <CBtn color="#16a34a" onClick={() => scene((s) => s.demo())}>✨ {kit.t('देखाऔँ', 'Show me')}</CBtn>
      <CBtn color="#ef4444" onClick={() => scene((s) => s.clear())}>🗑</CBtn>
      {['#2563eb', '#ef4444', '#16a34a'].map((c) => <CBtn key={c} color={c} style={{ minWidth: 48 }} onClick={() => { setUi({ color: c }); scene((s) => s.color(c)); }}>{ui.color === c ? '✔' : '●'}</CBtn>)}
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.ui.pct}%</Hud>),
  quiz: () => shuf([6, 7, 8, 9, 10, 10, 9]).map((n): any => ({ np: 'यो कुन सङ्ख्या हो? (औँलाले लेखेर हेर)', en: 'Which number is this? (Trace it to see)', answer: String(n), options: numOptions(n, 6, 10, 3), setup: (s: T5) => s.show(n) })),
});
void toNp;
