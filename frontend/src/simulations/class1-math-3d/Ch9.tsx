/** Chapter 9 · Numbers 11 to 20 — Number Garden, Group of Ten, Tens and Ones, Number Line, Ordering (all 3D). */
import React from 'react';
import * as THREE from 'three';
import { ease } from '../class1-math-kit/useStage';
import { CBtn, Controls } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { Blocks } from '../class1-math-kit/place';
import { enName, npName } from '../class1-math-kit/nepali';
import { makeSim, Hud, NumPad, numOptions } from './makeSim';
import { Items, NumLine } from './scenes';

const shuf = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);
const R = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const tensOnes = (n: number) => ({ t: Math.floor(n / 10), o: n % 10 });

/* ───────── 1 · Number Garden 11–20 ───────── */
interface NG { show: (n: number) => void; count: (cb?: (i: number) => void) => void }
export const NumberGarden11_3D = makeSim<NG, { n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH9-01', chapter: 9, titleNp: 'सङ्ख्या बगैँचा (११–२०)', titleEn: 'Number Garden 11–20' },
  stage: { camera: [0, 12, 12], target: [0, 0.5, 0], minDistance: 8, maxDistance: 26 },
  ui0: { n: 12 },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'flower', platform: 10, platformColor: '#a7f3d0', layout: 'frame' });
    it.frames(20); it.group.scale.setScalar(0.88);
    it.onTapItem((i) => { it.hop(i); notify({ say: i + 1 }); });
    return { show: (n) => { it.set(n, 'frame'); notify({ n }); }, count: (cb) => it.count(cb, undefined, 330) };
  },
  onEvent: (ev, p) => { if (ev.n !== undefined) p.setUi({ n: ev.n }); if (ev.say) p.kit.say(npName(ev.say), enName(ev.say)); },
  learn: [11, 12, 13, 15, 17, 20].map((n) => ({
    np: `${npName(n)} वटा फूल: दश र ${n === 20 ? 'दश' : npName(n - 10)}।`, en: `${enName(n)} flowers: ten and ${n === 20 ? 'ten' : enName(n - 10)}.`,
    run: (s: NG) => { s.show(n); setTimeout(() => s.count(), 600); },
  })),
  playIntro: ['सङ्ख्या रोजेर फूल रोपौँ। फूल छोएर गनौँ।', 'Pick a number to plant flowers. Tap flowers to count.'],
  onPlay: (s) => s.show(14),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      <NumPad kit={kit} from={11} to={20} value={ui.n} onPick={(n) => { setUi({ n }); scene((s) => s.show(n)); }} />
      <CBtn color="#16a34a" onClick={() => scene((s) => s.count((i) => kit.say(npName(i + 1), enName(i + 1))))}>🔢 {kit.t('गनौँ', 'Count')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.n)}</Hud>),
  quiz: () => shuf(R(11, 20)).slice(0, 7).map((n): any => ({ np: 'कतिवटा फूल छन्?', en: 'How many flowers are there?', answer: String(n), options: numOptions(n, 11, 20, 3), setup: (s: NG) => s.show(n) })),
});

/* ───────── 2 · Make a Group of Ten ───────── */
interface GT { show: (n: number) => void; group: () => void; n: () => number }
export const GroupOfTen3D = makeSim<GT, { n: number; grouped: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH9-02', chapter: 9, titleNp: 'दशको समूह बनाऔँ', titleEn: 'Make a Group of Ten' },
  stage: { camera: [0, 11, 12], target: [0, 0.5, 0], minDistance: 8 },
  ui0: { n: 14, grouped: false },
  build: (ctx, notify) => {
    const ALL = new Items(ctx, { kind: 'cube', platform: 6, layout: 'grid' });
    const TEN = new Items(ctx, { kind: 'cube', x: -3.8, platform: 4.2, layout: 'frame' }); TEN.frames(10); TEN.group.scale.setScalar(0.8); TEN.group.visible = false;
    const ONE = new Items(ctx, { kind: 'cube', x: 5.2, platform: 3, layout: 'grid' }); ONE.group.visible = false;
    let n = 14; let gen = 0;
    return {
      show: (m) => { gen++; n = m; ALL.group.visible = true; TEN.group.visible = ONE.group.visible = false; ALL.set(m, 'grid'); notify({ n: m, grouped: false }); },
      group: () => {
        const g0 = gen;
        ALL.items.forEach((o, i) => { if (i < 10) ctx.tween(500, (k) => { o.position.y = (o.userData.home?.y ?? 0.8) + Math.sin(k * Math.PI) * 1.2; o.scale.setScalar(1 + (i < 10 ? 0.2 * Math.sin(k * Math.PI) : 0)); }); });
        window.setTimeout(() => {
          if (g0 !== gen) return; ALL.group.visible = false; TEN.group.visible = ONE.group.visible = true;
          TEN.set(10, 'frame'); ONE.set(n - 10, 'grid'); notify({ grouped: true });
        }, 700);
      },
      n: () => n,
    };
  },
  onEvent: (ev, p) => { if (ev.n !== undefined) p.setUi({ n: ev.n, grouped: false }); if (ev.grouped) { p.setUi({ grouped: true }); const o = p.ui.n - 10; p.kit.say(`एउटा दशक र ${npName(o)} एकाइ।`, `One ten and ${enName(o)} ones.`); if (p.kit.mode === 'PLAY') p.kit.star(); } },
  learn: [
    { np: 'चौधवटा क्यूब छन्। दशको समूह बनाऔँ।', en: 'Fourteen cubes. Let us make a group of ten.', run: (s) => s.show(14) },
    { np: 'दशवटा एउटा फ्रेममा गयो। चारवटा छुट्टै छन्।', en: 'Ten go into one frame. Four stay loose.', run: (s) => { s.show(14); setTimeout(() => s.group(), 1000); } },
    { np: 'चौध = एक दशक र चार एकाइ।', en: 'Fourteen = one ten and four ones.', run: (s) => { s.show(14); setTimeout(() => s.group(), 600); } },
  ],
  playIntro: ['सङ्ख्या रोजौँ, अनि "दशको समूह" थिचौँ।', 'Pick a number, then press Make a ten.'],
  onPlay: (s) => s.show(13),
  play: ({ kit, ui, scene, setUi }) => (
    <Controls>
      <NumPad kit={kit} from={11} to={19} value={ui.n} onPick={(n) => { setUi({ n }); scene((s) => s.show(n)); }} />
      <CBtn color="#8b5cf6" disabled={ui.grouped} onClick={() => scene((s) => s.group())}>📦 {kit.t('दशको समूह', 'Make a ten')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.ui.grouped ? `1 ${p.kit.t('दशक', 'ten')} + ${p.num(p.ui.n - 10)}` : p.num(p.ui.n)}</Hud>),
  quiz: () => shuf(R(11, 19)).slice(0, 7).map((n): any => ({ np: `${npName(n)} मा एक दशक र कति एकाइ?`, en: `${n} is one ten and how many ones?`, answer: String(n - 10), options: numOptions(n - 10, 1, 9, 3), setup: (s: GT) => { s.show(n); setTimeout(() => s.group(), 800); } })),
});

/* ───────── 3 · Tens and Ones Explorer ───────── */
interface TO { set: (t: number, o: number) => void; label: (on: boolean) => void }
export const TensOnes3D = makeSim<TO, { t: number; o: number }>({
  cfg: { code: 'SIM-MATH-G1-CH9-03', chapter: 9, titleNp: 'दशक र एकाइ अन्वेषक', titleEn: 'Tens and Ones Explorer' },
  stage: { camera: [-2, 9, 12], target: [-2, 1.5, 0], minDistance: 7 },
  ui0: { t: 1, o: 4 },
  build: (ctx, notify) => {
    const b = new Blocks(ctx, { x: -6.5, z: 1, tensColor: '#38bdf8', onesColor: '#facc15', u: 0.55 });
    b.set(1, 4);
    const lab = (b as any).label as THREE.Sprite;
    return { set: (t, o) => { b.set(t, o); notify({ t, o }); }, label: (on) => { lab.visible = on; } };
  },
  onEvent: (ev, p) => { if (ev.t !== undefined) p.setUi({ t: ev.t, o: ev.o }); },
  learn: [
    { np: 'नीलो खम्बा दशक हुन्। पहेँला क्यूब एकाइ हुन्।', en: 'Blue towers are TENS. Yellow cubes are ONES.', run: (s) => s.set(1, 4) },
    { np: 'एक दशक र चार एकाइ मिलेर चौध।', en: 'One ten and four ones make fourteen.', run: (s) => s.set(1, 4) },
    { np: 'एक दशक र सात एकाइ = सत्र।', en: 'One ten and seven ones = seventeen.', run: (s) => s.set(1, 7) },
    { np: 'दुई दशक र शून्य एकाइ = बीस।', en: 'Two tens and zero ones = twenty.', run: (s) => s.set(2, 0) },
  ],
  playIntro: ['दशक र एकाइ थपेर सङ्ख्या बनाऔँ।', 'Add tens and ones to build a number.'],
  onPlay: (s) => { s.label(true); s.set(1, 2); },
  play: ({ kit, ui, scene, setUi }) => (
    <Controls>
      <CBtn color="#0ea5e9" onClick={() => { const t = Math.min(2, ui.t + 1); const o = t === 2 ? 0 : ui.o; setUi({ t, o }); scene((s) => s.set(t, o)); }}>🟦 ➕ {kit.t('दशक', 'Ten')}</CBtn>
      <CBtn color="#94a3b8" onClick={() => { const t = Math.max(0, ui.t - 1); setUi({ t }); scene((s) => s.set(t, ui.o)); }}>🟦 ➖</CBtn>
      <CBtn color="#eab308" style={{ color: '#422006' }} onClick={() => { const o = ui.t === 2 ? 0 : Math.min(9, ui.o + 1); setUi({ o }); scene((s) => s.set(ui.t, o)); }}>🟨 ➕ {kit.t('एकाइ', 'One')}</CBtn>
      <CBtn color="#94a3b8" onClick={() => { const o = Math.max(0, ui.o - 1); setUi({ o }); scene((s) => s.set(ui.t, o)); }}>🟨 ➖</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.t)} {p.kit.t('दशक', 'tens')} + {p.num(p.ui.o)} {p.kit.t('एकाइ', 'ones')} = {p.num(p.ui.t * 10 + p.ui.o)}</Hud>),
  quiz: () => shuf(R(11, 19).concat([20])).slice(0, 8).map((n, i): any => {
    const { t, o } = tensOnes(n);
    if (i % 2 === 0) return { np: 'यहाँ कतिवटा एकाइ छन्?', en: 'How many ones are here?', answer: String(o), options: numOptions(o, 0, 9, 3), setup: (s: TO) => { s.set(t, o); s.label(false); } };
    return { np: 'ब्लकले कुन सङ्ख्या देखाउँछ?', en: 'Which number do the blocks show?', answer: String(n), options: numOptions(n, 11, 20, 3), setup: (s: TO) => { s.set(t, o); s.label(false); } };
  }),
});

/* ───────── 4 · Number Line Adventure ───────── */
interface NL { start: (n: number) => void; to: (n: number, each?: (k: number) => void, done?: () => void) => void; at: () => number; glow: (n: number | null) => void }
export const NumberLine11_3D = makeSim<NL, { at: number }>({
  cfg: { code: 'SIM-MATH-G1-CH9-04', chapter: 9, titleNp: 'सङ्ख्या रेखा यात्रा', titleEn: 'Number Line Adventure' },
  stage: { camera: [0, 8, 13], target: [0, 0.5, 0], minDistance: 7 },
  ui0: { at: 10 },
  build: (ctx, notify) => {
    const line = new NumLine(ctx, 10, 20, 1.3);
    line.onTapStone((n) => { line.walk(n, (k) => { line.mark(k, '#86efac'); notify({ at: k, say: k }); }); });
    return {
      start: (n) => { line.clearMarks(); line.place(n); line.glow(null); notify({ at: n }); },
      to: (n, each, done) => line.walk(n, (k) => { line.mark(k, '#86efac'); notify({ at: k }); each?.(k); }, done),
      at: () => line.at, glow: (n) => line.glow(n),
    };
  },
  onEvent: (ev, p) => { if (ev.at !== undefined) p.setUi({ at: ev.at }); if (ev.say) p.kit.say(npName(ev.say), enName(ev.say)); },
  learn: [
    { np: 'सङ्ख्या रेखामा दशदेखि बीससम्म ढुङ्गा छन्।', en: 'The number line has stones from ten to twenty.', run: (s) => s.start(10) },
    { np: 'भालुसँग गनौँ: एघार, बाह्र, तेह्र...', en: 'Count with the bear: eleven, twelve, thirteen...', run: (s, kit) => { s.start(10); setTimeout(() => s.to(20, (k) => kit.say(npName(k), enName(k))), 900); } },
    { np: 'दायाँतिर जाँदा सङ्ख्या बढ्छ।', en: 'Going right, the numbers get bigger.', run: (s) => s.start(12) },
  ],
  playIntro: ['कुनै ढुङ्गा छोऔँ। भालु त्यहाँ उफ्रिन्छ।', 'Tap a stone. The bear hops there.'],
  onPlay: (s) => s.start(10),
  play: ({ kit, ui, scene }) => (
    <Controls>
      <NumPad kit={kit} from={11} to={20} value={ui.at} onPick={(n) => scene((s) => s.to(n, undefined))} />
      <CBtn color="#8b5cf6" onClick={() => scene((s) => s.start(10))}>🏁 {kit.t('सुरुमा', 'Start')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.at)}</Hud>),
  quiz: () => {
    const after = (n: number): any => ({ np: `${npName(n)} पछि कुन सङ्ख्या आउँछ?`, en: `What comes after ${n}?`, answer: String(n + 1), options: numOptions(n + 1, 11, 20, 3), setup: (s: NL) => { s.start(n); s.glow(n); } });
    const before = (n: number): any => ({ np: `${npName(n)} अघि कुन सङ्ख्या आउँछ?`, en: `What comes before ${n}?`, answer: String(n - 1), options: numOptions(n - 1, 10, 19, 3), setup: (s: NL) => { s.start(n); s.glow(n); } });
    const land = (a: number, b: number): any => ({ np: `भालु ${npName(a)} बाट ${npName(b)} फड्को मार्छ। कहाँ पुग्छ?`, en: `The bear starts at ${a} and hops ${b}. Where does it land?`, answer: String(a + b), options: numOptions(a + b, 11, 20, 3), setup: (s: NL) => { s.start(a); setTimeout(() => s.to(a + b), 800); } });
    return shuf([after(12), before(15), after(18), land(11, 4), before(19), land(13, 5), after(14)]);
  },
});

/* ───────── 5 · Number Ordering and Challenge World ───────── */
interface OR { deal: (nums: number[]) => void; sortAll: () => void; reset: () => void }
export const NumberOrdering3D = makeSim<OR, { next: number; total: number; done: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH9-05', chapter: 9, titleNp: 'सङ्ख्या क्रम र चुनौती', titleEn: 'Number Ordering and Challenge World' },
  stage: { camera: [0, 9, 12], target: [0, 1.5, 0], minDistance: 7 },
  ui0: { next: 0, total: 0, done: false },
  build: (ctx, notify) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const shelf = shadowed(new THREE.Mesh(new THREE.BoxGeometry(14, 0.2, 2.4), mat('#fcd34d', 0.8))); shelf.position.set(0, 3.4, -2); g.add(shelf);
    let cards: THREE.Mesh[] = []; let sorted: number[] = []; let placed = 0; let gen = 0;
    const slotX = (i: number, n: number) => (i - (n - 1) / 2) * 2.3;
    const card = (n: number, col: string) => {
      const c = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.9, 0.6), mat(col, 0.5)));
      const t = textSprite(String(n), 1.3, { px: 120, w: 180, h: 180, color: '#0f172a' }); t.position.z = 0.5; c.add(t); c.userData.n = n; return c;
    };
    const deal = (nums: number[]) => {
      gen++; cards.forEach((c) => g.remove(c)); cards = []; placed = 0; sorted = nums.slice().sort((a, b) => a - b);
      const cols = ['#fca5a5', '#fdba74', '#fde68a', '#bef264', '#7dd3fc', '#c4b5fd'];
      shuf(nums).forEach((n, i) => { const c = card(n, cols[i % cols.length]); c.position.set(slotX(i, nums.length), 1.1, 2.2); g.add(c); cards.push(c); c.scale.setScalar(0.01); ctx.tween(300 + i * 80, (k) => c.scale.setScalar(Math.max(0.01, k)), undefined, ease.back); });
      notify({ next: sorted[0], total: nums.length, done: false });
    };
    const put = (c: THREE.Mesh) => {
      const p0 = c.position.clone(); const p1 = new THREE.Vector3(slotX(placed, sorted.length), 3.4 + 1.1, -2); placed++; c.userData.done = true;
      ctx.tween(600, (k) => c.position.lerpVectors(p0, p1, k), undefined, ease.inOut);
    };
    ctx.onTap(() => cards, (hit) => {
      if (!hit) return; const c = hit.object as THREE.Mesh; if (c.userData.done) return;
      if (c.userData.n === sorted[placed]) { put(c); notify({ ok: c.userData.n, next: sorted[placed] ?? 0, done: placed >= sorted.length }); } else { const x0 = c.position.x; ctx.tween(400, (k) => { c.position.x = x0 + Math.sin(k * Math.PI * 6) * 0.25 * (1 - k); }); notify({ wrong: true }); }
    });
    deal([14, 11, 17, 12]);
    return {
      deal,
      sortAll: () => { const g0 = gen; sorted.forEach((n, i) => window.setTimeout(() => { const c = cards.find((x) => x.userData.n === n); if (g0 === gen && c && !c.userData.done) put(c); }, i * 650)); },
      reset: () => deal(shuf(R(11, 20)).slice(0, 5)),
    };
  },
  onEvent: (ev, p) => {
    if (ev.next !== undefined) p.setUi({ next: ev.next, total: ev.total ?? p.ui.total, done: !!ev.done });
    if (ev.ok) p.kit.say(npName(ev.ok), enName(ev.ok));
    if (ev.wrong) p.kit.oops('सबैभन्दा सानो सङ्ख्या खोजौँ!', 'Find the smallest number first!');
    if (ev.done) { p.kit.good('सबै क्रमैसँग मिल्यो!', 'All in order!'); if (p.kit.mode === 'PLAY') p.kit.star(); }
  },
  learn: [
    { np: 'यी सङ्ख्या कार्ड मिसिएका छन्।', en: 'These number cards are mixed up.', run: (s) => s.deal([14, 11, 17, 12]) },
    { np: 'सानोदेखि ठूलो क्रममा मिलाऔँ: ११, १२, १४, १७', en: 'Put them in order from smallest to biggest: 11, 12, 14, 17', run: (s) => { s.deal([14, 11, 17, 12]); setTimeout(() => s.sortAll(), 900); } },
    { np: 'अब तिम्रो पालो! सबैभन्दा सानो पहिले छोऔँ।', en: 'Your turn! Tap the smallest first.', run: (s) => s.deal([19, 13, 16, 11, 15]) },
  ],
  playIntro: ['सबैभन्दा सानो कार्ड पहिले छोऔँ।', 'Tap the smallest card first.'],
  onPlay: (s) => s.reset(),
  play: ({ kit, scene }) => (
    <Controls>
      <CBtn color="#8b5cf6" onClick={() => scene((s) => s.reset())}>🔄 {kit.t('नयाँ कार्ड', 'New cards')}</CBtn>
      <CBtn color="#16a34a" onClick={() => scene((s) => s.sortAll())}>✨ {kit.t('मिलाइदेऊ', 'Sort for me')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'PLAY' && !p.ui.done && p.ui.next ? <Hud>{p.num(p.ui.next)}?</Hud> : null),
  quiz: () => {
    const big = (xs: number[], big: boolean): any => ({ np: big ? 'कुन सङ्ख्या सबैभन्दा ठूलो छ?' : 'कुन सङ्ख्या सबैभन्दा सानो छ?', en: big ? 'Which number is the biggest?' : 'Which number is the smallest?', answer: String(big ? Math.max(...xs) : Math.min(...xs)), options: shuf(xs).map((x) => ({ key: String(x), label: String(x) })), setup: (s: OR) => s.deal(xs) });
    const pick = () => shuf(R(11, 20)).slice(0, 3);
    return [big(pick(), true), big(pick(), false), big(pick(), true), big(pick(), false), big(pick(), true), big(pick(), false), big(pick(), true)];
  },
});
