/** Chapter 5 · Zero — Discovery Playground, Empty Basket, Where Did Everything Go, Count the Village, Zero Challenge (all 3D). */
import React from 'react';
import * as THREE from 'three';
import { ease } from '../class1-math-kit/useStage';
import { CBtn, Controls } from '../class1-math-kit/SimKit';
import { basket, ball, apple, textSprite, mat, shadowed } from '../class1-math-kit/models';
import { enName, npName, toNp } from '../class1-math-kit/nepali';
import { makeSim, Hud, NumPad, numOptions } from './makeSim';
import { Items, ItemKind, BigNumber } from './scenes';

const shuf = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);
const say0 = (kit: any, n: number) => kit.say(n === 0 ? 'शून्य! केही छैन।' : npName(n), n === 0 ? 'Zero! None left.' : enName(n));

/* ───────── 1 · Zero Discovery Playground ───────── */
interface ZD { show: (n: number) => void; take: () => void; eatAll: (cb: (left: number) => void) => void; n: () => number }
export const ZeroDiscovery3D = makeSim<ZD, { n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH5-01', chapter: 5, titleNp: 'शून्य आविष्कार खेलमैदान', titleEn: 'Zero Discovery Playground' },
  stage: { camera: [0, 8, 11], target: [0, 0.8, 0], minDistance: 6 },
  ui0: { n: 3 },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'apple', platform: 5.5, layout: 'line' });
    const big = new BigNumber(ctx, '3', 3.6, 0, -1.5, 2);
    const upd = () => { big.set(String(it.n)); notify({ n: it.n, took: true }); };
    it.onTapItem((i) => { it.take(i); window.setTimeout(() => { it.relayout(); upd(); }, 650); });
    return {
      show: (n) => { it.set(n, 'line'); big.set(String(n)); notify({ n }); },
      take: () => { if (it.n > 0) { it.take(it.n - 1); window.setTimeout(upd, 650); } },
      eatAll: (cb) => { const go = () => { if (it.n > 0) { it.take(it.n - 1); window.setTimeout(() => { upd(); cb(it.n); go(); }, 1000); } }; go(); },
      n: () => it.n,
    };
  },
  onEvent: (ev, p) => { if (ev.n !== undefined) { p.setUi({ n: ev.n }); if (ev.took) { say0(p.kit, ev.n); if (ev.n === 0 && p.kit.mode === 'PLAY') p.kit.star(); } } },
  learn: [
    { np: 'मेजमा तीनवटा स्याउ छन्।', en: 'There are three apples on the table.', run: (s) => s.show(3) },
    { np: 'एउटा खाऔँ। दुईवटा बाँकी छन्।', en: 'Eat one. Two are left.', run: (s) => { s.show(3); setTimeout(() => s.take(), 900); } },
    { np: 'सबै खाऔँ! अब कुनै स्याउ छैन।', en: 'Eat them all! Now there are no apples.', run: (s, kit) => { s.show(3); setTimeout(() => s.eatAll((l) => say0(kit, l)), 900); } },
    { np: 'केही नहुनुलाई शून्य भनिन्छ। यसरी लेखिन्छ: ०', en: 'When there is nothing, we say ZERO. We write it like this: 0', run: (s) => s.show(0) },
  ],
  playIntro: ['स्याउ छोएर खाऔँ। सबै सकिँदा के हुन्छ?', 'Tap apples to eat them. What happens when they are all gone?'],
  onPlay: (s) => s.show(4),
  play: ({ kit, scene }) => (
    <Controls>
      <NumPad kit={kit} from={0} to={6} onPick={(n) => scene((s) => s.show(n))} />
      <CBtn color="#ef4444" onClick={() => scene((s) => s.take())}>🍎 {kit.t('एउटा खाऔँ', 'Eat one')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud color={p.ui.n === 0 ? '#16a34a' : '#0ea5e9'}>{p.num(p.ui.n)}</Hud>),
  quiz: () => shuf([0, 1, 2, 3, 0, 4, 5]).map((n): any => ({ np: 'मेजमा कतिवटा स्याउ छन्?', en: 'How many apples are on the table?', answer: String(n), options: numOptions(n, 0, 5, 3), setup: (s: ZD) => s.show(n) })),
});

/* ───────── 2 · Empty Basket Adventure ───────── */
interface EB { fill: (n: number) => void; out: () => void; n: () => number }
const SPOTS: [number, number, number][] = [[-0.45, 0.5, -0.3], [0.45, 0.5, -0.3], [0, 0.5, 0.45], [-0.5, 1.2, 0.3], [0.5, 1.2, 0.3], [0, 1.2, -0.45], [0, 1.9, 0]];
export const EmptyBasket3D = makeSim<EB, { n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH5-02', chapter: 5, titleNp: 'खाली टोकरी साहसिक', titleEn: 'Empty Basket Adventure' },
  stage: { camera: [0, 6.5, 9], target: [0, 1.4, 0], minDistance: 5 },
  ui0: { n: 3 },
  build: (ctx, notify) => {
    const b = basket('#c2410c', 3.4); b.position.set(0, 0.06, 0); b.scale.set(1.3, 1.3, 1.3); ctx.scene.add(b);
    const balls: THREE.Object3D[] = [];
    const colors = ['#ef4444', '#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
    const clear = () => { balls.forEach((o) => ctx.scene.remove(o)); balls.length = 0; };
    const out = (o: THREE.Object3D) => {
      const i = balls.indexOf(o); if (i < 0) return; balls.splice(i, 1);
      const p0 = o.position.clone(); const side = i % 2 ? 1 : -1; const p1 = new THREE.Vector3(side * (3.4 + (i % 3) * 0.8), 0.45, 1.6 + (i % 2));
      ctx.tween(700, (k) => { o.position.lerpVectors(p0, p1, k); o.position.y += Math.sin(k * Math.PI) * 2.4; }, undefined, ease.inOut);
      notify({ n: balls.length, took: true });
    };
    ctx.onTap(() => balls, (hit) => { if (hit) { let o: THREE.Object3D | null = hit.object; while (o && !balls.includes(o)) o = o.parent; if (o) out(o); } });
    return {
      fill: (n) => { clear(); for (let i = 0; i < n; i++) { const o = ball(colors[i % colors.length], 0.42); const [x, y, z] = SPOTS[i % SPOTS.length]; o.position.set(x, y, z); ctx.scene.add(o); balls.push(o); o.scale.setScalar(0.01); ctx.tween(300 + i * 80, (k) => o.scale.setScalar(Math.max(0.01, k)), undefined, ease.back); } notify({ n }); },
      out: () => { if (balls.length) out(balls[balls.length - 1]); }, n: () => balls.length,
    };
  },
  onEvent: (ev, p) => { if (ev.n !== undefined) { p.setUi({ n: ev.n }); if (ev.took) { say0(p.kit, ev.n); if (ev.n === 0 && p.kit.mode === 'PLAY') p.kit.star(); } } },
  learn: [
    { np: 'टोकरीमा तीनवटा बल छन्।', en: 'There are three balls in the basket.', run: (s) => s.fill(3) },
    { np: 'एउटा बल बाहिर निकालौँ।', en: 'Take one ball out.', run: (s) => { s.fill(3); setTimeout(() => s.out(), 900); } },
    { np: 'सबै निकालौँ। टोकरी खाली भयो!', en: 'Take them all out. The basket is empty!', run: (s) => { s.fill(3); [800, 1700, 2600].forEach((t) => setTimeout(() => s.out(), t)); } },
    { np: 'खाली टोकरीमा बल छैनन्। शून्य!', en: 'No balls in the empty basket. ZERO!', run: (s) => s.fill(0) },
  ],
  playIntro: ['बलमा छोएर टोकरीबाट निकालौँ।', 'Tap a ball to take it out of the basket.'],
  onPlay: (s) => s.fill(5),
  play: ({ kit, scene }) => (
    <Controls>
      <NumPad kit={kit} from={0} to={7} onPick={(n) => scene((s) => s.fill(n))} />
      <CBtn color="#ef4444" onClick={() => scene((s) => s.out())}>⚽ {kit.t('एउटा निकालौँ', 'Take one out')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud color={p.ui.n === 0 ? '#16a34a' : '#0ea5e9'}>{p.num(p.ui.n)}</Hud>),
  quiz: () => shuf([0, 1, 2, 0, 3, 4, 0]).map((n): any => ({ np: 'टोकरीमा कतिवटा बल छन्?', en: 'How many balls are in the basket?', answer: String(n), options: numOptions(n, 0, 5, 3), setup: (s: EB) => s.fill(n) })),
});

/* ───────── 3 · Where Did Everything Go? ───────── */
interface WG { show: (n: number) => void; fly: (k: number) => void; left: () => number }
export const WhereDidItGo3D = makeSim<WG, { n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH5-03', chapter: 5, titleNp: 'सबै कहाँ गए?', titleEn: 'Where Did Everything Go?' },
  stage: { camera: [0, 7, 12], target: [0, 1.4, 0], minDistance: 6 },
  ui0: { n: 3 },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'bird', platform: 6, platformColor: '#bbf7d0', layout: 'line' });
    const log = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 12, 10), mat('#92400e', 0.9))); log.rotation.z = Math.PI / 2; log.position.set(0, 0.9, 0); ctx.scene.add(log);
    const arrange = () => it.items.forEach((o) => { o.position.y = 1.4; });
    it.onTapItem((i) => { it.take(i); window.setTimeout(() => { it.relayout(); window.setTimeout(arrange, 400); notify({ n: it.n, took: true }); }, 650); });
    return {
      show: (n) => { it.set(n, 'line'); window.setTimeout(arrange, 600); notify({ n }); },
      fly: (k) => it.remove(Math.min(k, it.n), () => { notify({ n: it.n, took: true }); }),
      left: () => it.n,
    };
  },
  onEvent: (ev, p) => { if (ev.n !== undefined) { p.setUi({ n: ev.n }); if (ev.took) { say0(p.kit, ev.n); if (ev.n === 0 && p.kit.mode === 'PLAY') p.kit.star(); } } },
  learn: [
    { np: 'डालामा तीनवटा चरा बसेका छन्।', en: 'Three birds sit on the branch.', run: (s) => s.show(3) },
    { np: 'दुईवटा चरा उड्छन्। एउटा बाँकी छ।', en: 'Two birds fly away. One is left.', run: (s) => { s.show(3); setTimeout(() => s.fly(2), 900); } },
    { np: 'अब बाँकी चरा पनि उड्यो! सबै कहाँ गए? कोही छैनन् — शून्य!', en: 'The last bird flies away! Where did they go? None are left — ZERO!', run: (s) => { s.show(3); setTimeout(() => s.fly(3), 900); } },
  ],
  playIntro: ['चरामा छोऔँ। चरा उड्छ!', 'Tap a bird. It flies away!'],
  onPlay: (s) => s.show(5),
  play: ({ kit, scene }) => (
    <Controls>
      <NumPad kit={kit} from={1} to={7} onPick={(n) => scene((s) => s.show(n))} />
      <CBtn color="#ef4444" onClick={() => scene((s) => s.fly(1))}>🐦 {kit.t('एउटा उडाऔँ', 'Fly one')}</CBtn>
      <CBtn color="#8b5cf6" onClick={() => scene((s) => s.fly(99))}>💨 {kit.t('सबै उडाऔँ', 'Fly all')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud color={p.ui.n === 0 ? '#16a34a' : '#0ea5e9'}>{p.num(p.ui.n)}</Hud>),
  quiz: () => [[3, 3], [2, 1], [4, 4], [3, 2], [1, 1], [5, 5], [2, 2]].map(([a, k]): any => ({
    np: `${npName(a)} चरा थिए। ${npName(k)} उडे। अहिले कतिवटा छन्?`, en: `There were ${a} birds. ${k} flew away. How many now?`, answer: String(a - k), options: numOptions(a - k, 0, 5, 3),
    setup: (s: WG) => { s.show(a); setTimeout(() => s.fly(k), 1600); },
  })),
});

/* ───────── 4 · Count the Village ───────── */
interface CV { set: (counts: number[]) => void; focus: (i: number) => void }
const VK: { kind: ItemKind; np: string; en: string; emoji: string }[] = [
  { kind: 'flower', np: 'फूल', en: 'flowers', emoji: '🌸' }, { kind: 'bird', np: 'चरा', en: 'birds', emoji: '🐦' }, { kind: 'bear', np: 'गाउँलेहरू', en: 'villagers', emoji: '🧸' },
];
export const CountTheVillage3D = makeSim<CV, { c: number[] }>({
  cfg: { code: 'SIM-MATH-G1-CH5-04', chapter: 5, titleNp: 'गाउँ गनौँ', titleEn: 'Count the Village' },
  stage: { camera: [0, 9, 14], target: [0, 0.8, 0], minDistance: 7 },
  ui0: { c: [3, 0, 2] },
  build: (ctx, notify) => {
    const st = [-5.6, 0, 5.6].map((x, i) => new Items(ctx, { kind: VK[i].kind, x, platform: 2.6, layout: 'grid', platformColor: ['#fbcfe8', '#bae6fd', '#fde68a'][i] }));
    const labels: THREE.Sprite[] = [];
    VK.forEach((v, i) => { const t = textSprite(v.emoji, 1.4, { px: 90, w: 128, h: 128, bg: '#fff', border: '#0ea5e9' }); t.position.set(st[i].group.position.x, 3.2, 0); ctx.scene.add(t); labels.push(t); });
    st.forEach((s, i) => s.onTapItem((j) => { s.hop(j); notify({ say: j + 1 }); void i; }));
    return {
      set: (cs) => { st.forEach((s, i) => { s.set(cs[i]); s.group.visible = true; labels[i].visible = true; }); notify({ c: cs }); },
      focus: (i) => { st.forEach((s, j) => { s.group.visible = j === i; labels[j].visible = j === i; }); },
    };
  },
  onEvent: (ev, p) => { if (ev.c) p.setUi({ c: ev.c }); if (ev.say) p.kit.say(npName(ev.say), enName(ev.say)); },
  learn: [
    { np: 'गाउँमा फूल, चरा र गाउँले छन्। गनौँ!', en: 'The village has flowers, birds and villagers. Count!', run: (s) => s.set([3, 0, 2]) },
    { np: 'तीनवटा फूल छन्।', en: 'Three flowers.', run: (s) => s.set([3, 0, 2]) },
    { np: 'चरा कतिवटा छन्? कुनै छैन! शून्य।', en: 'How many birds? None! Zero.', run: (s) => s.set([3, 0, 2]) },
    { np: 'दुईजना गाउँले छन्।', en: 'Two villagers.', run: (s) => s.set([3, 0, 2]) },
  ],
  playIntro: ['सङ्ख्या फेरेर गाउँमा के कति छ गनौँ।', 'Make a new village and count what is there.'],
  onPlay: (s) => s.set([4, 0, 3]),
  play: ({ kit, scene }) => (
    <Controls>
      <CBtn color="#8b5cf6" onClick={() => scene((s) => s.set([0, 1, 2].map(() => Math.floor(Math.random() * 6) * (Math.random() > 0.3 ? 1 : 0))))}>🔄 {kit.t('नयाँ गाउँ', 'New village')}</CBtn>
      <CBtn color="#16a34a" onClick={() => kit.say('हरेक समूह छोएर गनौँ। केही नभए शून्य!', 'Tap the things to count. If none, say zero!')}>🔊</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.ui.c.map((x) => p.num(x)).join('  ')}</Hud>),
  quiz: () => shuf([[3, 0, 2, 1], [0, 4, 1, 0], [2, 2, 0, 2], [5, 1, 0, 0], [0, 0, 3, 2], [1, 3, 0, 1], [4, 0, 2, 0]]).map(([a, b, c, f]): any => ({
    np: `${VK[f].np} कतिवटा छन्?`, en: `How many ${VK[f].en}?`, answer: String([a, b, c][f]), options: numOptions([a, b, c][f], 0, 5, 3), setup: (s: CV) => { s.set([a, b, c]); s.focus(f); },
  })),
});

/* ───────── 5 · Zero Challenge ───────── */
interface ZC { show: (n: number, kind?: ItemKind) => void; basket: (n: number) => void }
export const ZeroChallenge3D = makeSim<ZC, { n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH5-05', chapter: 5, titleNp: 'शून्य चुनौती', titleEn: 'Zero Challenge' },
  stage: { camera: [0, 8, 11], target: [0, 0.8, 0], minDistance: 6 },
  ui0: { n: 0 },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'apple', platform: 5.5, layout: 'grid' });
    it.onTapItem((i) => { it.hop(i); notify({ say: i + 1 }); });
    return { show: (n, kind) => { it.set(n, 'grid', kind || 'apple'); notify({ n }); }, basket: (n) => { it.set(n, 'grid', 'ball'); notify({ n }); } };
  },
  onEvent: (ev, p) => { if (ev.n !== undefined) p.setUi({ n: ev.n }); if (ev.say) p.kit.say(npName(ev.say), enName(ev.say)); },
  learn: [
    { np: 'शून्यको मतलब केही पनि छैन।', en: 'Zero means nothing at all.', run: (s) => s.show(0) },
    { np: 'एउटा स्याउ भनेको १, केही नभए ०।', en: 'One apple is 1. No apple is 0.', run: (s) => s.show(1) },
    { np: 'शून्य सबैभन्दा सानो सङ्ख्या हो।', en: 'Zero is the smallest number.', run: (s) => s.show(0) },
  ],
  playIntro: ['सङ्ख्या रोज। ० रोजेर के देखिन्छ हेर।', 'Pick a number. Try zero and see what happens.'],
  onPlay: (s) => s.show(2),
  play: ({ kit, scene }) => (<Controls><NumPad kit={kit} from={0} to={9} onPick={(n) => scene((s) => s.show(n))} /></Controls>),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.n)}</Hud>),
  quiz: () => {
    const kinds: ItemKind[] = ['apple', 'ball', 'star', 'bird', 'cube'];
    const how = (n: number, k: ItemKind): any => ({ np: 'कतिवटा छन्?', en: 'How many are there?', answer: String(n), options: numOptions(n, 0, 6, 3), setup: (s: ZC) => s.show(n, k) });
    const zero = (n: number): any => ({ np: 'कुन चित्रमा शून्य छ? — यहाँ कतिवटा छन्?', en: 'Is this zero? How many are there?', answer: String(n), options: numOptions(n, 0, 3, 3), setup: (s: ZC) => s.show(n, 'apple') });
    return shuf([how(0, kinds[0]), how(3, kinds[1]), how(0, kinds[2]), how(5, kinds[3]), how(1, kinds[4]), zero(0), zero(2)]);
  },
});
void apple; void toNp;
