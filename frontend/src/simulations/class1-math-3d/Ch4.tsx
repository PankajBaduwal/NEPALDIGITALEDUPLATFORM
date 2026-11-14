/** Chapter 4 · Numbers up to 9 — Many and Few, Number Garden, Number Matching, Tracing, Sequence (all 3D). */
import React from 'react';
import * as THREE from 'three';
import { ease } from '../class1-math-kit/useStage';
import { CBtn, Controls, KitConfig } from '../class1-math-kit/SimKit';
import { critter, mat, shadowed, textSprite, retext } from '../class1-math-kit/models';
import { enName, npName, toNp } from '../class1-math-kit/nepali';
import { makeSim, Hud, NumPad, numOptions } from './makeSim';
import { Items, ItemKind } from './scenes';
import { TraceBoard, numberPath } from './trace';

const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(g, m);
const shuf = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);
const nameN = (n: number, lang: 'np' | 'en') => (lang === 'np' ? npName(n) : enName(n));

/* ───────── 1 · Many and Few ───────── */
interface MF { set: (a: number, b: number) => void; add: (side: 0 | 1, d: number) => void; counts: () => [number, number]; tag: (on: boolean) => void }
export const ManyFew3D = makeSim<MF, { a: number; b: number }>({
  cfg: { code: 'SIM-MATH-G1-CH4-01', chapter: 4, titleNp: 'धेरै र थोरै', titleEn: 'Many and Few' },
  stage: { camera: [0, 9, 13], target: [0, 0.5, 0], minDistance: 7 },
  ui0: { a: 8, b: 2 },
  build: (ctx, notify) => {
    const L = new Items(ctx, { kind: 'apple', x: -4.6, platform: 3.8, layout: 'grid' });
    const R = new Items(ctx, { kind: 'ball', x: 4.6, platform: 3.8, layout: 'grid' });
    const tags: THREE.Sprite[] = [];
    const tag = (on: boolean) => {
      tags.forEach((t) => t.parent?.remove(t)); tags.length = 0;
      if (!on) return;
      const mk = (it: Items, text: string, col: string) => { const t = textSprite(text, 2.6, { px: 70, w: 320, h: 128, bg: '#fff', border: col }); t.position.set(0, 3.6, 0); it.group.add(t); tags.push(t); };
      const a = L.n, b = R.n;
      if (a === b) { mk(L, 'बराबर =', '#0ea5e9'); mk(R, 'बराबर =', '#0ea5e9'); } else { mk(L, a > b ? 'धेरै (many)' : 'थोरै (few)', a > b ? '#16a34a' : '#f97316'); mk(R, b > a ? 'धेरै (many)' : 'थोरै (few)', b > a ? '#16a34a' : '#f97316'); }
    };
    L.onTapItem((i) => { L.hop(i); notify({ say: i + 1 }); });
    R.onTapItem((i) => { R.hop(i); notify({ say: i + 1 }); });
    const upd = () => notify({ a: L.n, b: R.n });
    return {
      set: (a, b) => { L.set(a); R.set(b); tag(false); upd(); },
      add: (side, d) => { const it = side ? R : L; if (d > 0 && it.n < 9) it.add(1); else if (d < 0 && it.n > 0) it.remove(1); window.setTimeout(upd, 500); },
      counts: () => [L.n, R.n], tag,
    };
  },
  onEvent: (ev, p) => { if (ev.a !== undefined) p.setUi({ a: ev.a, b: ev.b }); if (ev.say) p.kit.say(npName(ev.say), enName(ev.say)); },
  learn: [
    { np: 'बायाँमा स्याउ छन्, दायाँमा बल छन्।', en: 'Apples on the left, balls on the right.', run: (s) => s.set(8, 2) },
    { np: 'बायाँमा धेरै छन्। दायाँमा थोरै छन्।', en: 'The left has MANY. The right has FEW.', run: (s) => { s.set(8, 2); setTimeout(() => s.tag(true), 900); } },
    { np: 'अब दायाँमा धेरै छन्, बायाँमा थोरै।', en: 'Now the right has many, and the left has few.', run: (s) => { s.set(2, 7); setTimeout(() => s.tag(true), 900); } },
    { np: 'दुवैतिर बराबर भए बराबर भन्छौँ।', en: 'If both sides are the same, we say EQUAL.', run: (s) => { s.set(5, 5); setTimeout(() => s.tag(true), 900); } },
  ],
  playIntro: ['+ र − थिचेर धेरै र थोरै बनाऔँ। वस्तुमा छोएर गनौँ।', 'Press + and − to make many and few. Tap things to count them.'],
  onPlay: (s) => s.set(6, 3),
  play: ({ kit, scene, ui }) => (
    <Controls>
      <CBtn color="#ef4444" onClick={() => scene((s) => s.add(0, -1))}>🍎 −</CBtn><CBtn color="#16a34a" onClick={() => scene((s) => s.add(0, 1))}>🍎 +</CBtn>
      <CBtn color="#ef4444" onClick={() => scene((s) => s.add(1, -1))}>⚽ −</CBtn><CBtn color="#16a34a" onClick={() => scene((s) => s.add(1, 1))}>⚽ +</CBtn>
      <CBtn color="#8b5cf6" onClick={() => scene((s) => s.tag(true))}>👀 {kit.t('धेरै कि थोरै?', 'Many or few?')}</CBtn>
      <span style={{ fontWeight: 900, fontSize: 20 }}>{kit.lang === 'ne' ? toNp(ui.a) : ui.a} · {kit.lang === 'ne' ? toNp(ui.b) : ui.b}</span>
    </Controls>
  ),
  quiz: () => {
    const mk = (many: boolean): any => {
      let a = 1 + Math.floor(Math.random() * 9), b = 1 + Math.floor(Math.random() * 9); while (a === b) b = 1 + Math.floor(Math.random() * 9);
      const ans = (a > b) === many ? 'L' : 'R';
      return { np: many ? 'कता धेरै छन्?' : 'कता थोरै छन्?', en: many ? 'Which side has MANY?' : 'Which side has FEW?', answer: ans, options: [{ key: 'L', label: '⬅ 🍎' }, { key: 'R', label: '⚽ ➡' }], setup: (s: MF) => s.set(a, b) };
    };
    return [mk(true), mk(false), mk(true), mk(false), mk(true), mk(false)];
  },
});

/* ───────── 2 · Number Garden 1–9 ───────── */
interface NG { show: (n: number) => void; count: (cb?: (i: number) => void) => void; n: () => number }
export const NumberGarden3D = makeSim<NG, { n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH4-02', chapter: 4, titleNp: 'सङ्ख्या बगैँचा (१–९)', titleEn: 'Number Garden 1–9' },
  stage: { camera: [0, 9, 11], target: [0, 0.5, 0], minDistance: 6, ground: 0x86d98a } as any,
  ui0: { n: 3 },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'flower', platform: 7, platformColor: '#a7f3d0', layout: 'grid', numbered: true });
    it.onTapItem((i) => { it.hop(i); notify({ say: i + 1 }); });
    return { show: (n) => { it.set(n); notify({ n }); }, count: (cb) => it.count(cb), n: () => it.n };
  },
  onEvent: (ev, p) => { if (ev.n !== undefined) p.setUi({ n: ev.n }); if (ev.say) p.kit.say(npName(ev.say), enName(ev.say)); },
  learn: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
    np: `${npName(n)} वटा फूल। गनौँ!`, en: `${enName(n)} flower${n > 1 ? 's' : ''}. Let us count!`,
    run: (s: NG) => { s.show(n); setTimeout(() => s.count(), 700); },
  })),
  playIntro: ['सङ्ख्या रोजेर फूल रोपौँ। फूल छोएर गनौँ।', 'Pick a number to plant flowers. Tap flowers to count.'],
  onPlay: (s) => s.show(3),
  play: ({ kit, scene, ui, setUi }) => (
    <Controls>
      <NumPad kit={kit} from={1} to={9} value={ui.n} onPick={(n) => { setUi({ n }); scene((s) => s.show(n)); }} />
      <CBtn color="#16a34a" onClick={() => scene((s) => s.count((i) => kit.say(npName(i + 1), enName(i + 1))))}>🔢 {kit.t('गनौँ', 'Count')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.n)}</Hud>),
  quiz: () => shuf([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 7).map((n): any => ({
    np: 'कतिवटा फूल छन्?', en: 'How many flowers are there?', answer: String(n), options: numOptions(n, 1, 9), setup: (s: NG) => s.show(n),
  })),
});

/* ───────── 3 · Number Matching World ───────── */
interface NM { reset: (counts: number[]) => void; only: (n: number) => void; select: (i: number) => void; auto: () => void; left: () => number }
const GK: ItemKind[] = ['apple', 'bird', 'star'];
export const makeNumberMatch = (o: { cfg: KitConfig; pool: number[]; kinds: ItemKind[]; scale: number; sets: number[][] }) => makeSim<NM, { left: number }>({
  cfg: o.cfg,
  stage: { camera: [0, 9, 13], target: [0, 0.5, 0], minDistance: 7 },
  ui0: { left: 3 },
  build: (ctx, notify) => {
    const groups = [-5.5, 0, 5.5].map((x, i) => { const g = new Items(ctx, { kind: o.kinds[i], x, z: -1.5, platform: 2.4 / o.scale, layout: 'grid' }); g.group.scale.setScalar(o.scale); return g; });
    const cardsG = new THREE.Group(); ctx.scene.add(cardsG);
    let cards: THREE.Mesh[] = []; let counts: number[] = []; let sel = -1; const filled = new Set<number>(); let single = false;
    const drawCard = (c: THREE.Mesh, n: number, done = false) => {
      c.children.forEach((k) => c.remove(k));
      const t = textSprite(String(n), 1.5, { px: 130, w: 200, h: 200, color: done ? '#15803d' : '#0f172a' }); t.position.set(0, 0, 0.6); c.add(t);
    };
    const glow = () => cards.forEach((c, i) => c.scale.setScalar(i === sel ? 1.25 : 1));
    const reset = (cs: number[]) => {
      single = false; counts = cs; sel = -1; filled.clear();
      cards.forEach((c) => cardsG.remove(c)); cards = [];
      groups.forEach((g, i) => { g.group.visible = true; g.set(cs[i]); });
      shuf(cs.map((c, i) => i)).forEach((src, slot) => {
        const c = shadowed(mesh(new THREE.BoxGeometry(2.2, 2.2, 0.6), mat('#fde68a', 0.5)));
        c.position.set((slot - 1) * 5, 1.4, 4.2); c.userData.n = cs[src]; drawCard(c, cs[src]); cardsG.add(c); cards.push(c);
      });
      notify({ left: cs.length });
    };
    ctx.onTap(() => cards, (hit) => {
      if (!hit || single) return; let o: THREE.Object3D | null = hit.object; while (o && !cards.includes(o as THREE.Mesh)) o = o.parent;
      if (o) { const i = cards.indexOf(o as THREE.Mesh); if (!cards[i].userData.done) { sel = i; glow(); notify({ picked: cards[i].userData.n }); } }
    });
    groups.forEach((g, gi) => g.onTapItem(() => {
      if (single) return;
      if (sel < 0) { notify({ pickFirst: true }); return; }
      const card = cards[sel]; if (filled.has(gi)) return;
      if (card.userData.n === counts[gi]) {
        filled.add(gi); card.userData.done = true; drawCard(card, card.userData.n, true);
        const p0 = card.position.clone(); const p1 = new THREE.Vector3(groups[gi].group.position.x, 1.4, 1.6);
        ctx.tween(600, (k) => card.position.lerpVectors(p0, p1, k), undefined, ease.inOut); sel = -1; glow();
        notify({ left: counts.length - filled.size, matched: card.userData.n, all: filled.size === counts.length });
      } else notify({ wrong: true });
    }));
    ctx.onFrame((_d, t) => cards.forEach((c, i) => { if (!c.userData.done) c.rotation.y = Math.sin(t * 1.4 + i) * 0.15; }));
    reset(o.sets[0]);
    return {
      reset,
      only: (n) => { single = true; cards.forEach((c) => cardsG.remove(c)); cards = []; groups.forEach((g, i) => { g.group.visible = i === 1; if (i === 1) g.set(n); }); },
      select: (i) => { sel = i; glow(); },
      auto: () => cards.forEach((c, i) => window.setTimeout(() => { const gi = counts.indexOf(c.userData.n); if (gi >= 0 && !filled.has(gi) && !c.userData.done) { filled.add(gi); c.userData.done = true; drawCard(c, c.userData.n, true); const p0 = c.position.clone(); const p1 = new THREE.Vector3(groups[gi].group.position.x, 1.4, 1.6); ctx.tween(600, (k) => c.position.lerpVectors(p0, p1, k)); notify({ left: counts.length - filled.size }); } }, i * 700)),
      left: () => counts.length - filled.size,
    };
  },
  onEvent: (ev, p) => {
    if (ev.left !== undefined) p.setUi({ left: ev.left });
    if (ev.picked) p.kit.say(`${npName(ev.picked)}। कुन समूहमा ${npName(ev.picked)} वटा छन्?`, `${enName(ev.picked)}. Which group has ${enName(ev.picked)}?`, false);
    if (ev.pickFirst) p.kit.oops('पहिले तल सङ्ख्या छोऔँ', 'Tap a number card first');
    if (ev.wrong) p.kit.oops('मिलेन! गनेर हेरौँ।', 'Not that one. Count and try again!');
    if (ev.matched) p.kit.good();
    if (ev.all) { p.kit.star(); p.kit.say('सबै मिल्यो!', 'All matched!'); }
  },
  learn: [
    { np: 'समूहका वस्तु गनौँ। तल सङ्ख्या कार्ड छन्।', en: 'Count each group. The number cards are below.', run: (s) => s.reset(o.sets[0]) },
    { np: 'हेर, मिल्ने सङ्ख्या समूहको अगाडि जान्छ।', en: 'Look, the right number goes in front of its group.', run: (s) => { s.reset(o.sets[1]); setTimeout(() => s.auto(), 800); } },
    { np: 'तिम्रो पालो! कार्ड छोऔँ, अनि समूह छोऔँ।', en: 'Your turn! Tap a card, then tap its group.', run: (s) => s.reset(o.sets[2]) },
  ],
  playIntro: ['सङ्ख्या कार्ड छोऔँ, अनि मिल्ने समूह छोऔँ।', 'Tap a number card, then tap the matching group.'],
  onPlay: (s) => s.reset(o.sets[1]),
  play: ({ kit, scene }) => (
    <Controls>
      <CBtn color="#8b5cf6" onClick={() => scene((s) => { const set = shuf(o.pool).slice(0, 3); s.reset(set); })}>🔄 {kit.t('नयाँ', 'New')}</CBtn>
      <CBtn color="#16a34a" onClick={() => scene((s) => s.auto())}>✨ {kit.t('सहयोग', 'Help me')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.left)} 🧩</Hud>),
  quiz: () => shuf(o.pool).slice(0, 7).map((n): any => ({ np: 'यहाँ कतिवटा छन्? सही सङ्ख्या रोजौँ।', en: 'How many are here? Pick the right number.', answer: String(n), options: numOptions(n, Math.min(...o.pool), Math.max(...o.pool)), setup: (s: NM) => s.only(n) })),
});
export const NumberMatching3D = makeNumberMatch({ cfg: { code: 'SIM-MATH-G1-CH4-03', chapter: 4, titleNp: 'सङ्ख्या मिलाऔँ', titleEn: 'Number Matching World' }, pool: [1, 2, 3, 4, 5, 6, 7, 8, 9], kinds: GK, scale: 1, sets: [[3, 1, 4], [2, 5, 3], [4, 2, 6]] });


/* ───────── 4 · Number Tracing and Writing ───────── */
interface TR { show: (n: number) => void; demo: () => void; clear: () => void; color: (c: string) => void }
export const NumberTracing3D = makeSim<TR, { n: number; pct: number; color: string }>({
  cfg: { code: 'SIM-MATH-G1-CH4-04', chapter: 4, titleNp: 'सङ्ख्या लेखौँ', titleEn: 'Number Tracing and Writing' },
  stage: { camera: [0, 12, 3.5], target: [0, 0, 0], minDistance: 6, ground: null } as any,
  ui0: { n: 1, pct: 0, color: '#2563eb' },
  build: (ctx, notify) => {
    ctx.scene.background = new THREE.Color(0xecfeff);
    const tb = new TraceBoard(ctx);
    tb.onPct = (pct) => notify({ pct }); tb.onDone = () => notify({ done: true });
    const big = (n: number) => numberPath(n).map(([x, z]) => [x * 1.35, z * 1.35] as [number, number]);
    tb.setPath(big(1));
    return { show: (n) => { tb.setPath(big(n)); notify({ n }); }, demo: () => tb.demo(), clear: () => tb.clearInk(), color: (c) => tb.setColor(c) };
  },
  onEvent: (ev, p) => { if (ev.pct !== undefined) p.setUi({ pct: ev.pct }); if (ev.n !== undefined) p.setUi({ n: ev.n }); if (ev.done && p.kit.mode !== 'CHALLENGE') { p.kit.good('सङ्ख्या लेखियो!', 'You wrote it!'); p.kit.star(); } },
  learn: [1, 2, 3, 5, 8].map((n) => ({ np: `यो ${npName(n)}। थोप्लामा औँला तानेर लेखौँ।`, en: `This is ${enName(n)}. Drag your finger over the dots.`, run: (s: TR) => { s.show(n); setTimeout(() => s.demo(), 900); } })),
  playIntro: ['सङ्ख्या रोजौँ र थोप्लामा औँला तानेर लेखौँ।', 'Pick a number and trace the dots with your finger.'],
  onPlay: (s) => s.show(1),
  play: ({ kit, scene, ui, setUi }) => (
    <Controls>
      <NumPad kit={kit} from={1} to={9} value={ui.n} onPick={(n) => { scene((s) => s.show(n)); }} />
      <CBtn color="#16a34a" onClick={() => scene((s) => s.demo())}>✨ {kit.t('देखाऔँ', 'Show me')}</CBtn>
      <CBtn color="#ef4444" onClick={() => scene((s) => s.clear())}>🗑</CBtn>
      {['#2563eb', '#ef4444', '#16a34a'].map((c) => <CBtn key={c} color={c} style={{ minWidth: 48 }} onClick={() => { setUi({ color: c }); scene((s) => s.color(c)); }}>{ui.color === c ? '✔' : '●'}</CBtn>)}
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.ui.pct}%</Hud>),
  quiz: () => shuf([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6).map((n): any => ({ np: 'यो कुन सङ्ख्या हो? (औँलाले लेखेर हेर)', en: 'Which number is this? (Trace it to see)', answer: String(n), options: numOptions(n, 1, 9), setup: (s: TR) => s.show(n) })),
});

/* ───────── 5 · Number Sequence ───────── */
interface SQ { row: (nums: number[], hidden?: number[]) => void; hopAll: (cb: (n: number) => void) => void; reveal: () => void; scramble: () => void; glow: (i: number) => void }
export const NumberSequence3D = makeSim<SQ, { next: number; done: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH4-05', chapter: 4, titleNp: 'सङ्ख्याको क्रम', titleEn: 'Number Sequence Adventure' },
  stage: { camera: [0, 8, 12], target: [0, 0.5, 0], minDistance: 6 },
  ui0: { next: 1, done: false },
  build: (ctx, notify) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const water = mesh(new THREE.CircleGeometry(22, 48), mat('#7dd3fc', 0.3)); water.rotation.x = -Math.PI / 2; water.position.y = 0.01; ctx.scene.add(water);
    const bear = critter('bear', '#a16207'); bear.scale.setScalar(0.9); g.add(bear);
    let stones: THREE.Mesh[] = []; let nums: number[] = []; let hidden: number[] = []; let order = false; let next = 1;
    const paint = (s: THREE.Mesh, text: string, col: string) => { s.children.forEach((c) => s.remove(c)); const t = textSprite(text, 1.2, { px: 110, w: 160, h: 160, bg: null, color: col }); t.position.y = 0.8; s.add(t); };
    const xs = (i: number, n: number) => (i - (n - 1) / 2) * 1.65;
    const bearTo = (i: number, ms = 450) => { const s = stones[i]; if (!s) return; const p0 = bear.position.clone(); const p1 = new THREE.Vector3(s.position.x, 0.5, 0.2); ctx.tween(ms, (k) => { bear.position.lerpVectors(p0, p1, k); bear.position.y += Math.sin(k * Math.PI) * 1.2; }, undefined, ease.inOut); };
    const row = (ns: number[], hid: number[] = []) => {
      stones.forEach((s) => g.remove(s)); stones = []; nums = ns; hidden = hid; order = false;
      ns.forEach((n, i) => {
        const s = shadowed(mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.5, 20), mat(hid.includes(i) ? '#64748b' : '#d6d3d1', 0.9)));
        s.position.set(xs(i, ns.length), 0.25, 0); s.userData.i = i; paint(s, hid.includes(i) ? '?' : String(n), hid.includes(i) ? '#fff' : '#0f172a'); g.add(s); stones.push(s);
        s.scale.setScalar(0.01); ctx.tween(300 + i * 60, (k) => s.scale.setScalar(Math.max(0.01, k)), undefined, ease.back);
      });
      bear.position.set(stones[0].position.x, 0.5, 0.2);
    };
    ctx.onTap(() => stones, (hit) => {
      if (!hit || !order) return; const s = hit.object as THREE.Mesh; const i = s.userData.i; const n = nums[i];
      if (n === next) { (s.material as THREE.MeshStandardMaterial).color.set('#86efac'); bearTo(i); next++; notify({ next, ok: n }); if (next > nums.length) notify({ finished: true }); } else notify({ wrong: n });
    });
    return {
      row,
      hopAll: (cb) => stones.forEach((s, i) => window.setTimeout(() => { bearTo(i, 380); cb(nums[i]); }, i * 750)),
      reveal: () => { hidden.forEach((i) => { (stones[i].material as THREE.MeshStandardMaterial).color.set('#86efac'); paint(stones[i], String(nums[i]), '#15803d'); }); hidden = []; },
      scramble: () => { order = true; next = 1; const base = [1, 2, 3, 4, 5, 6, 7, 8, 9]; row(shuf(base)); order = true; notify({ next: 1 }); },
      glow: (i) => { stones.forEach((s, j) => s.scale.setScalar(j === i ? 1.3 : 1)); },
    };
  },
  onEvent: (ev, p) => {
    if (ev.next !== undefined) p.setUi({ next: ev.next });
    if (ev.ok) p.kit.say(npName(ev.ok), enName(ev.ok), true);
    if (ev.wrong) p.kit.oops('पहिले सानो सङ्ख्या खोजौँ!', 'Find the smaller number first!');
    if (ev.finished) { p.setUi({ done: true }); p.kit.good('१ देखि ९ सम्म पुग्यौँ!', 'You reached nine!'); p.kit.star(); }
  },
  learn: [
    { np: 'भालु ढुङ्गामा उफ्रिँदै १ देखि ९ सम्म गन्छ।', en: 'The bear hops on the stones and counts from 1 to 9.', run: (s, kit) => { s.row([1, 2, 3, 4, 5, 6, 7, 8, 9]); setTimeout(() => s.hopAll((n) => kit.say(npName(n), enName(n))), 1200); } },
    { np: 'सङ्ख्याहरू क्रमैसँग आउँछन्। ४ पछि ५ आउँछ।', en: 'Numbers come in order. After 4 comes 5.', run: (s) => { s.row([1, 2, 3, 4, 5, 6, 7, 8, 9]); setTimeout(() => s.glow(4), 600); } },
    { np: 'एउटा ढुङ्गाको सङ्ख्या हरायो! कुन होला?', en: 'One stone lost its number! Which is it?', run: (s) => { s.row([1, 2, 3, 4, 5, 6, 7, 8, 9], [5]); } },
    { np: 'छ! ५ पछि ६ आउँछ।', en: 'It is six! After five comes six.', run: (s) => { s.row([1, 2, 3, 4, 5, 6, 7, 8, 9], [5]); setTimeout(() => s.reveal(), 1200); } },
  ],
  playIntro: ['१ देखि क्रमैसँग ढुङ्गा छोऔँ।', 'Tap the stones in order, starting with 1.'],
  onPlay: (s) => s.scramble(),
  play: ({ kit, scene, ui }) => (
    <Controls>
      <div style={{ fontWeight: 900, fontSize: 20 }}>{ui.done ? '🎉' : `${kit.t('अब खोजौँ', 'Find')}: ${kit.lang === 'ne' ? toNp(ui.next) : ui.next}`}</div>
      <CBtn color="#8b5cf6" onClick={() => { scene((s) => s.scramble()); }}>🔄 {kit.t('फेरि मिसाऔँ', 'Shuffle again')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'PLAY' && !p.ui.done ? <Hud>{p.num(p.ui.next)}</Hud> : null),
  quiz: () => {
    const miss = (i: number): any => ({ np: 'कुन सङ्ख्या हरायो?', en: 'Which number is missing?', answer: String(i + 1), options: numOptions(i + 1, 1, 9), setup: (s: SQ) => s.row([1, 2, 3, 4, 5, 6, 7, 8, 9], [i]) });
    return shuf([1, 2, 3, 4, 5, 6, 7]).slice(0, 7).map((i) => miss(i));
  },
});
void retext;
