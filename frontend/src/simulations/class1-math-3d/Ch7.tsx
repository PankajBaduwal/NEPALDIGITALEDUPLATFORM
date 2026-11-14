/** Chapter 7 · Addition up to 10 — Playground, Make the Total, Number Bond Houses, Count On, Equation Studio (all 3D). */
import React from 'react';
import * as THREE from 'three';
import { ease } from '../class1-math-kit/useStage';
import { CBtn, Controls } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, retext } from '../class1-math-kit/models';
import { enName, npName } from '../class1-math-kit/nepali';
import { makeSim, Hud, NumPad, numOptions } from './makeSim';
import { Items, NumLine, EqBoard } from './scenes';

const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(g, m);
const shuf = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);
const sayAdd = (kit: any, a: number, b: number) => kit.say(`${npName(a)} र ${npName(b)} जोड्दा ${npName(a + b)} हुन्छ।`, `${enName(a)} and ${enName(b)} make ${enName(a + b)}.`);
const pairs = (maxSum: number) => { const out: [number, number][] = []; for (let a = 1; a < maxSum; a++) for (let b = 1; a + b <= maxSum; b++) out.push([a, b]); return out; };

/* ───────── 1 · Addition Playground ───────── */
interface AP { set: (a: number, b: number) => void; join: (cb?: () => void) => void }
export const AdditionPlayground3D = makeSim<AP, { a: number; b: number; joined: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH7-01', chapter: 7, titleNp: 'जोड्ने खेलमैदान', titleEn: 'Addition Playground' },
  stage: { camera: [0, 9, 13], target: [0, 0.5, 0], minDistance: 7 },
  ui0: { a: 3, b: 2, joined: false },
  build: (ctx, notify) => {
    const L = new Items(ctx, { kind: 'apple', x: -4.6, platform: 3.8, layout: 'grid' });
    const R = new Items(ctx, { kind: 'ball', x: 4.6, platform: 3.8, layout: 'grid' });
    const T = new Items(ctx, { kind: 'apple', x: 0, platform: 5.6, layout: 'frame' }); T.group.visible = false; T.frames(10);
    let a = 3, b = 2; let gen = 0;
    return {
      set: (na, nb) => { gen++; a = na; b = nb; L.group.visible = R.group.visible = true; T.group.visible = false; L.set(a); R.set(b); notify({ a, b, joined: false }); },
      join: (cb) => {
        const g0 = gen;
        [L, R].forEach((it) => it.items.forEach((o, i) => window.setTimeout(() => ctx.tween(350, (k) => o.position.y = (o.userData.home?.y ?? 0.7) + Math.sin(k * Math.PI) * 1.4), i * 80)));
        window.setTimeout(() => {
          if (g0 !== gen) return;
          L.group.visible = R.group.visible = false; T.group.visible = true; T.setTwo(a, b, 'apple', 'ball', '#ef4444', '#0ea5e9'); T.layout = 'frame';
          T.count(undefined, () => { notify({ joined: true }); cb?.(); }, 350);
        }, 900 + Math.max(a, b) * 80);
      },
    };
  },
  onEvent: (ev, p) => { if (ev.a !== undefined) p.setUi({ a: ev.a, b: ev.b, joined: false }); if (ev.joined) { p.setUi({ joined: true }); p.scene(() => undefined); } },
  learn: [
    { np: 'बायाँमा स्याउ छन्, दायाँमा बल छन्।', en: 'Apples on the left, balls on the right.', run: (s) => s.set(3, 2) },
    { np: 'दुवै समूह जोडौँ! सबै गनौँ।', en: 'Let us join both groups and count them all.', run: (s, kit) => { s.set(3, 2); setTimeout(() => s.join(() => sayAdd(kit, 3, 2)), 900); } },
    { np: 'जोड्नु भनेको मिलाएर कति भयो भनेर गन्नु हो।', en: 'Adding means putting together and finding how many in all.', run: (s, kit) => { s.set(4, 3); setTimeout(() => s.join(() => sayAdd(kit, 4, 3)), 900); } },
  ],
  playIntro: ['दुई सङ्ख्या रोजौँ र "जोडौँ" थिचौँ।', 'Pick two numbers and press Join.'],
  onPlay: (s) => s.set(2, 3),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      <span style={{ fontWeight: 900 }}>🍎</span><NumPad kit={kit} from={1} to={9} value={ui.a} onPick={(n) => { const b = Math.min(ui.b, 10 - n); setUi({ a: n, b }); scene((s) => s.set(n, b)); }} />
      <span style={{ fontWeight: 900 }}>⚽</span><NumPad kit={kit} from={1} to={9} value={ui.b} onPick={(n) => { const a = Math.min(ui.a, 10 - n); setUi({ a, b: n }); scene((s) => s.set(a, n)); }} />
      <CBtn color="#16a34a" onClick={() => scene((s) => s.join(() => sayAdd(kit, ui.a, ui.b)))}>🤝 {kit.t('जोडौँ', 'Join')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} + {p.num(p.ui.b)} = {p.ui.joined ? p.num(p.ui.a + p.ui.b) : '?'}</Hud>),
  quiz: () => shuf(pairs(10)).slice(0, 7).map(([a, b]): any => ({ np: `${npName(a)} र ${npName(b)} जोड्दा कति हुन्छ?`, en: `What is ${a} + ${b}?`, answer: String(a + b), options: numOptions(a + b, 2, 10, 3), setup: (s: AP) => { s.set(a, b); setTimeout(() => s.join(), 800); } })),
});

/* ───────── 2 · Make the Total ───────── */
interface MT { start: (a: number, target: number) => void; add: () => void; fill: () => void; n: () => number }
export const MakeTheTotal3D = makeSim<MT, { a: number; target: number; n: number }>({
  cfg: { code: 'SIM-MATH-G1-CH7-02', chapter: 7, titleNp: 'जोडफल बनाऔँ', titleEn: 'Make the Total' },
  stage: { camera: [0, 9, 9], target: [0, 0.5, 0], minDistance: 6 },
  ui0: { a: 4, target: 7, n: 4 },
  build: (ctx, notify) => {
    const it = new Items(ctx, { kind: 'ball', platform: 6.4, layout: 'frame' }); it.frames(10);
    let target = 7, a = 4;
    const flag = textSprite('7', 1.6, { px: 100, w: 160, h: 160, bg: '#fef08a', border: '#f59e0b' }); flag.position.set(0, 3.4, -1.8); ctx.scene.add(flag);
    const upd = () => notify({ n: it.n, a, target });
    const addOne = () => { if (it.n < 10) { it.add(1, '#0ea5e9'); upd(); if (it.n === target) notify({ full: true }); } };
    return {
      start: (na, t) => { a = na; target = t; it.set(na, 'frame'); retext(flag, String(t), { px: 100, w: 160, h: 160, bg: '#fef08a', border: '#f59e0b' }); upd(); },
      add: addOne,
      fill: () => { const miss = target - it.n; for (let i = 0; i < miss; i++) window.setTimeout(addOne, i * 500); },
      n: () => it.n,
    };
  },
  onEvent: (ev, p) => { if (ev.n !== undefined) p.setUi({ n: ev.n, a: ev.a, target: ev.target }); if (ev.full && p.kit.mode !== 'CHALLENGE') { p.kit.good('सही जोडफल!', 'You made the total!'); if (p.kit.mode === 'PLAY') p.kit.star(); } },
  learn: [
    { np: 'हामीलाई सात चाहियो। चारवटा छन्।', en: 'We need seven. We have four.', run: (s) => s.start(4, 7) },
    { np: 'निलो बल थपौँ: एक, दुई, तीन!', en: 'Add blue balls: one, two, three!', run: (s) => { s.start(4, 7); setTimeout(() => s.fill(), 900); } },
    { np: 'चार र तीन मिलेर सात हुन्छ।', en: 'Four and three make seven.', run: (s, kit) => { s.start(4, 7); setTimeout(() => s.fill(), 600); setTimeout(() => sayAdd(kit, 4, 3), 2600); } },
  ],
  playIntro: ['फ्ल्यागको सङ्ख्या पुग्ने गरी बल थपौँ।', 'Add balls until you reach the number on the flag.'],
  onPlay: (s) => s.start(3, 8),
  play: ({ kit, ui, scene }) => (
    <Controls>
      <CBtn color="#0ea5e9" onClick={() => scene((s) => s.add())}>🔵 {kit.t('एउटा थपौँ', 'Add one')}</CBtn>
      <CBtn color="#8b5cf6" onClick={() => scene((s) => { const t = 5 + Math.floor(Math.random() * 6); s.start(1 + Math.floor(Math.random() * (t - 2)), t); })}>🔄 {kit.t('नयाँ', 'New')}</CBtn>
      <span style={{ fontWeight: 900, fontSize: 20 }}>{kit.t('चाहिन्छ', 'Need')}: {kit.lang === 'ne' ? ui.target : ui.target} · {kit.t('बाँकी', 'Left')}: {Math.max(0, ui.target - ui.n)}</span>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} + {p.num(Math.max(0, p.ui.n - p.ui.a))} = {p.num(p.ui.target)}</Hud>),
  quiz: () => shuf(pairs(10).filter(([a, b]) => a + b >= 5)).slice(0, 7).map(([a, b]): any => ({ np: `${npName(a)} मा कति थपे ${npName(a + b)} हुन्छ?`, en: `${a} and how many more make ${a + b}?`, answer: String(b), options: numOptions(b, 1, 9, 3), setup: (s: MT) => s.start(a, a + b) })),
  quizExtra: ({ kit, scene }) => <CBtn color="#16a34a" style={{ minHeight: 44, padding: '6px 14px', fontSize: 15 }} onClick={() => scene((s) => s.fill())}>👀 {kit.t('सहयोग', 'Hint')}</CBtn>,
});

/* ───────── 3 · Number Bond Houses ───────── */
interface NB { house: (total: number, a: number) => void }
export const NumberBondHouses3D = makeSim<NB, { total: number; a: number }>({
  cfg: { code: 'SIM-MATH-G1-CH7-03', chapter: 7, titleNp: 'सङ्ख्या घर', titleEn: 'Number Bond Houses' },
  stage: { camera: [0, 8, 13], target: [0, 2, 0], minDistance: 7 },
  ui0: { total: 5, a: 2 },
  build: (ctx, notify) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const wall = shadowed(mesh(new THREE.BoxGeometry(10, 3.2, 1.2), mat('#fde68a', 0.8))); wall.position.set(0, 3.7, -2.6); g.add(wall);
    const roof = shadowed(mesh(new THREE.ConeGeometry(7.6, 2.4, 4), mat('#b91c1c', 0.7))); roof.rotation.y = Math.PI / 4; roof.position.set(0, 6.5, -2.6); roof.scale.set(1, 1, 0.55); g.add(roof);
    const door = shadowed(mesh(new THREE.BoxGeometry(1.2, 2, 0.1), mat('#92400e', 0.8))); door.position.set(0, 2.1, -1.95); g.add(door);
    let num = textSprite('5', 2, { px: 110, w: 200, h: 160, bg: '#fff', border: '#f59e0b' }); num.position.set(0, 6.4, -1.6); g.add(num);
    const L = new Items(ctx, { kind: 'apple', x: -3, z: 0.3, platform: 2.6, layout: 'grid' }); L.group.scale.setScalar(0.8);
    const R = new Items(ctx, { kind: 'apple', x: 3, z: 0.3, platform: 2.6, layout: 'grid' }); R.group.scale.setScalar(0.8);
    const labL = textSprite('?', 1.4, { px: 100, w: 160, h: 160, bg: '#fecaca', border: '#ef4444' }); labL.position.set(-3, 4.2, 0); g.add(labL);
    const labR = textSprite('?', 1.4, { px: 100, w: 160, h: 160, bg: '#bfdbfe', border: '#2563eb' }); labR.position.set(3, 4.2, 0); g.add(labR);
    return {
      house: (total, a) => {
        retext(num, String(total), { px: 110, w: 200, h: 160, bg: '#fff', border: '#f59e0b' });
        L.set(a, 'grid', 'apple'); R.set(total - a, 'grid', 'ball');
        retext(labL, String(a), { px: 100, w: 160, h: 160, bg: '#fecaca', border: '#ef4444' }); retext(labR, String(total - a), { px: 100, w: 160, h: 160, bg: '#bfdbfe', border: '#2563eb' });
        notify({ total, a });
      },
    };
  },
  onEvent: (ev, p) => { if (ev.total !== undefined) p.setUi({ total: ev.total, a: ev.a }); },
  learn: [
    { np: 'यो पाँचको घर हो। यसमा दुई कोठा छन्।', en: 'This is the house of five. It has two rooms.', run: (s) => s.house(5, 2) },
    { np: 'एक र चार मिलेर पाँच।', en: 'One and four make five.', run: (s) => s.house(5, 1) },
    { np: 'दुई र तीन मिलेर पनि पाँच।', en: 'Two and three also make five.', run: (s) => s.house(5, 2) },
    { np: 'सात को घर: तीन र चार!', en: 'The house of seven: three and four!', run: (s) => s.house(7, 3) },
  ],
  playIntro: ['घरको सङ्ख्या र बायाँ कोठाको सङ्ख्या रोजौँ।', 'Pick the house number and the left room.'],
  onPlay: (s) => s.house(6, 2),
  play: ({ kit, ui, scene, setUi }) => (
    <Controls>
      <span style={{ fontWeight: 900 }}>🏠</span><NumPad kit={kit} from={2} to={10} value={ui.total} onPick={(n) => { const a = Math.min(ui.a, n - 1); setUi({ total: n, a }); scene((s) => s.house(n, a)); }} />
      <span style={{ fontWeight: 900 }}>🍎</span><NumPad kit={kit} from={1} to={Math.max(1, ui.total - 1)} value={ui.a} onPick={(n) => { setUi({ a: n }); scene((s) => s.house(ui.total, n)); }} />
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} + {p.num(p.ui.total - p.ui.a)} = {p.num(p.ui.total)}</Hud>),
  quiz: () => shuf([[5, 2], [5, 1], [6, 4], [7, 3], [8, 5], [9, 4], [10, 6], [4, 3]]).slice(0, 7).map(([t, a]): any => ({
    np: `${npName(t)} को घरमा ${npName(a)} र कति?`, en: `In the house of ${enName(t)}: ${a} and how many?`, answer: String(t - a), options: numOptions(t - a, 1, 9, 3),
    setup: (s: NB) => { s.house(t, a); },
  })),
});

/* ───────── 4 · Count On Adventure ───────── */
interface CO { start: (a: number) => void; hop: (b: number, each?: (n: number) => void, done?: () => void) => void; at: () => number }
export const CountOn3D = makeSim<CO, { a: number; b: number; at: number }>({
  cfg: { code: 'SIM-MATH-G1-CH7-04', chapter: 7, titleNp: 'अगाडि गनौँ', titleEn: 'Count On Adventure' },
  stage: { camera: [0, 8, 13], target: [0, 0.5, 0], minDistance: 7 },
  ui0: { a: 4, b: 3, at: 4 },
  build: (ctx, notify) => {
    const line = new NumLine(ctx, 0, 10, 1.4);
    line.place(4);
    return {
      start: (a) => { line.clearMarks(); line.place(a); line.mark(a, '#fca5a5'); notify({ at: a }); },
      hop: (b, each, done) => { const from = line.at; line.walk(from + b, (k) => { line.mark(k, '#86efac'); notify({ at: k }); each?.(k); }, done); },
      at: () => line.at,
    };
  },
  onEvent: (ev, p) => { if (ev.at !== undefined) p.setUi({ at: ev.at }); },
  learn: [
    { np: 'चारबाट सुरु गरौँ। भालु चारमा छ।', en: 'Start at four. The bear is on four.', run: (s) => s.start(4) },
    { np: 'तीन फड्को मारौँ: पाँच, छ, सात!', en: 'Hop three times: five, six, seven!', run: (s, kit) => { s.start(4); setTimeout(() => s.hop(3, (k) => kit.say(npName(k), enName(k))), 900); } },
    { np: 'चारबाट तीन अगाडि गन्दा सात हुन्छ। ४ + ३ = ७', en: 'Counting on 3 from 4 lands on 7. 4 + 3 = 7', run: (s, kit) => { s.start(4); setTimeout(() => s.hop(3, undefined, () => sayAdd(kit, 4, 3)), 700); } },
  ],
  playIntro: ['सुरु सङ्ख्या र फड्को सङ्ख्या रोजौँ।', 'Pick where to start and how many hops.'],
  onPlay: (s) => s.start(3),
  play: ({ kit, ui, setUi, scene }) => (
    <Controls>
      <span style={{ fontWeight: 900 }}>🏁</span><NumPad kit={kit} from={0} to={9} value={ui.a} onPick={(n) => { const b = Math.min(ui.b, 10 - n); setUi({ a: n, b, at: n }); scene((s) => s.start(n)); }} />
      <span style={{ fontWeight: 900 }}>🦘</span><NumPad kit={kit} from={1} to={Math.max(1, 10 - ui.a)} value={ui.b} onPick={(n) => setUi({ b: n })} />
      <CBtn color="#16a34a" onClick={() => { scene((s) => { s.start(ui.a); setTimeout(() => s.hop(ui.b, (k) => kit.say(npName(k), enName(k), true), () => sayAdd(kit, ui.a, ui.b)), 500); }); }}>🦘 {kit.t('फड्को!', 'Hop!')}</CBtn>
    </Controls>
  ),
  hud: (p, mode) => (mode === 'CHALLENGE' ? null : <Hud>{p.num(p.ui.a)} + {p.num(p.ui.b)} = {p.ui.at === p.ui.a + p.ui.b ? p.num(p.ui.at) : '?'}</Hud>),
  quiz: () => shuf(pairs(10).filter(([a, b]) => b <= 4)).slice(0, 7).map(([a, b]): any => ({ np: `${npName(a)} बाट ${npName(b)} अगाडि गन्दा कहाँ पुगिन्छ?`, en: `Start at ${a} and count on ${b}. Where do you land?`, answer: String(a + b), options: numOptions(a + b, 2, 10, 3), setup: (s: CO) => { s.start(a); setTimeout(() => s.hop(b), 800); } })),
});

/* ───────── 5 · Addition Equation Studio ───────── */
interface ES { eq: (a: number, b: number, hide: 'c' | 'b' | 'a' | null) => void; reveal: () => void }
export const AdditionEquationStudio3D = makeSim<ES, { a: number; b: number; shown: boolean }>({
  cfg: { code: 'SIM-MATH-G1-CH7-05', chapter: 7, titleNp: 'जोड्ने समीकरण स्टुडियो', titleEn: 'Addition Equation Studio' },
  stage: { camera: [0, 8, 12], target: [0, 1.6, 0], minDistance: 7 },
  ui0: { a: 3, b: 4, shown: true },
  build: (ctx, notify) => {
    const board = new EqBoard(ctx, 4.8, 0, 1.7);
    const it = new Items(ctx, { kind: 'apple', platform: 5.2, layout: 'frame' }); it.frames(10);
    let cur = { a: 3, b: 4 };
    const texts = (a: number, b: number, hide: string | null) => [hide === 'a' ? '?' : String(a), '+', hide === 'b' ? '?' : String(b), '=', hide === 'c' ? '?' : String(a + b)];
    return {
      eq: (a, b, hide) => { cur = { a, b }; board.set(texts(a, b, hide), hide ? [hide === 'a' ? 0 : hide === 'b' ? 2 : 4] : []); it.setTwo(a, b, 'apple', 'ball', '#ef4444', '#0ea5e9'); it.layout = 'frame'; notify({ a, b, shown: !hide }); },
      reveal: () => { board.set(texts(cur.a, cur.b, null), []); notify({ shown: true }); },
    };
  },
  onEvent: (ev, p) => { if (ev.a !== undefined) p.setUi({ a: ev.a, b: ev.b, shown: ev.shown }); if (ev.a === undefined && ev.shown) p.setUi({ shown: true }); },
  learn: [
    { np: 'समीकरण वस्तुको कथा हो। ३ + ४ = ७', en: 'An equation tells the story of the objects. 3 + 4 = 7', run: (s, kit) => { s.eq(3, 4, null); sayAdd(kit, 3, 4); } },
    { np: '+ को अर्थ जोड्नु हो। = को अर्थ बराबर हो।', en: '+ means add. = means is the same as.', run: (s) => s.eq(2, 5, null) },
    { np: 'अब एउटा सङ्ख्या लुकेको छ। खोजौँ: ५ + ३ = ?', en: 'Now one number is hiding. Find it: 5 + 3 = ?', run: (s) => { s.eq(5, 3, 'c'); } },
    { np: 'वस्तु गनेर थाहा पाउँछौँ: आठ!', en: 'Count the objects to find it: eight!', run: (s) => { s.eq(5, 3, 'c'); setTimeout(() => s.reveal(), 1500); } },
  ],
  playIntro: ['दुई सङ्ख्या रोजेर समीकरण बनाऔँ।', 'Pick two numbers to build an equation.'],
  onPlay: (s) => s.eq(3, 4, null),
  play: ({ kit, ui, scene, setUi }) => (
    <Controls>
      <NumPad kit={kit} from={1} to={9} value={ui.a} onPick={(n) => { const b = Math.min(ui.b, 10 - n); setUi({ a: n, b }); scene((s) => s.eq(n, b, null)); }} />
      <span style={{ fontWeight: 900, fontSize: 24 }}>+</span>
      <NumPad kit={kit} from={1} to={9} value={ui.b} onPick={(n) => { const a = Math.min(ui.a, 10 - n); setUi({ a, b: n }); scene((s) => s.eq(a, n, null)); }} />
      <CBtn color="#16a34a" onClick={() => sayAdd(kit, ui.a, ui.b)}>🔊</CBtn>
    </Controls>
  ),
  quiz: () => shuf(pairs(10)).slice(0, 8).map(([a, b], i): any => {
    const hide = (['c', 'c', 'b', 'a'] as const)[i % 4];
    const ans = hide === 'c' ? a + b : hide === 'b' ? b : a;
    return { np: 'लुकेको सङ्ख्या कुन हो?', en: 'Which number is hiding?', answer: String(ans), options: numOptions(ans, 1, 10, 3), setup: (s: ES) => s.eq(a, b, hide) };
  }),
  quizExtra: ({ kit, scene }) => <CBtn color="#16a34a" style={{ minHeight: 44, padding: '6px 14px', fontSize: 15 }} onClick={() => scene((s) => s.reveal())}>👀 {kit.t('सहयोग', 'Hint')}</CBtn>,
});
void ease;
