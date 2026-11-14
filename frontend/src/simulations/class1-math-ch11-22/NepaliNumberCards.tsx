/**
 * Chapter 18 · Devanagari numerals up to 100 (देवनागरी अङ्कहरू — १ देखि १०० सम्म)
 * Nepali Number Cards — flip a 3D card to see 37 become ३७, then play the memory-match game.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, retext } from '../class1-math-kit/models';
import { FONT_NP, NP_DIGITS, npName, enName, toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }

const faceTex = (text: string, bg: string, fg: string, px: number) => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 340;
  const g = c.getContext('2d')!;
  g.fillStyle = bg; g.fillRect(0, 0, 256, 340);
  g.strokeStyle = fg; g.lineWidth = 12; g.strokeRect(10, 10, 236, 320);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${px}px ${FONT_NP}`;
  g.fillText(text, 128, 175);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const makeCard = (arabic: number, w = 2) => {
  const h = w * 1.33;
  const px = arabic >= 100 ? 90 : arabic >= 10 ? 130 : 190;
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.16, 3, 0.08), [mat('#e2e8f0'), mat('#e2e8f0'), mat('#e2e8f0'), mat('#e2e8f0'),
    new THREE.MeshStandardMaterial({ map: faceTex(String(arabic), '#ffffff', '#0369a1', px), roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ map: faceTex(toNp(arabic), '#fff7ed', '#c2410c', px), roughness: 0.5 })]);
  shadowed(body);
  const g = new THREE.Group(); g.add(body); g.userData.n = arabic; g.userData.flipped = false;
  return g;
};
const flipTo = (ctx: any, g: THREE.Object3D, show: 'arabic' | 'nepali') => {
  const from = g.rotation.y, to = show === 'nepali' ? Math.PI : 0;
  g.userData.flipped = show === 'nepali';
  ctx.tween(520, (k: number) => { g.rotation.y = from + (to - from) * k; g.position.y = g.userData.baseY + Math.sin(k * Math.PI) * 0.6; }, undefined, ease.inOut);
};

export const NepaliNumberCards: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH18-01', chapter: 18, titleNp: 'नेपाली अङ्क कार्ड (०–१००)', titleEn: 'Nepali Number Cards (0–100)' });
  const [n, setN] = useState(37);
  const [range, setRange] = useState<'1-9' | '10-50' | '51-100'>('1-9');
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [game, setGame] = useState(0);
  const scene = useRef<{ show: (n: number, nepali?: boolean) => void; flip: () => void; memory: (nums: number[]) => void; clearMemory: () => void; bigVisible: (v: boolean) => void } | null>(null);
  const live = useRef({ mode: kit.mode, onMatch: (_m: number, _mv: number) => {}, onNext: () => {} });
  live.current.mode = kit.mode;
  live.current.onMatch = (m, mv) => { setMatched(m); setMoves(mv); };

  useStage(kit.stageRef, (ctx) => {
    const big = new THREE.Group(); ctx.scene.add(big);
    const mem = new THREE.Group(); ctx.scene.add(mem);
    let bigCard: THREE.Group | null = null;
    let cards: THREE.Group[] = [];
    let first: THREE.Group | null = null; let lock = false; let matches = 0; let mv = 0;
    const show = (num: number, nepali = false) => {
      [...big.children].forEach((c) => big.remove(c));
      bigCard = makeCard(num, 4.2); bigCard.userData.baseY = 3.2; bigCard.position.set(0, 3.2, 0); bigCard.rotation.y = nepali ? Math.PI : 0; bigCard.userData.flipped = nepali; big.add(bigCard);
    };
    const flip = () => { if (bigCard) flipTo(ctx, bigCard, bigCard.userData.flipped ? 'arabic' : 'nepali'); };
    const memory = (nums: number[]) => {
      [...mem.children].forEach((c) => mem.remove(c)); cards = []; first = null; lock = false; matches = 0; mv = 0;
      const items = shuffle([...nums.map((x) => ({ n: x, side: 'arabic' })), ...nums.map((x) => ({ n: x, side: 'nepali' }))]);
      items.forEach((it, i) => {
        const g = makeCard(it.n, 1.7);
        g.userData.side = it.side; g.userData.baseY = 1.2; g.userData.matched = false;
        g.position.set(((i % 4) - 1.5) * 2.3, 1.2, (Math.floor(i / 4) - (Math.ceil(items.length / 4) - 1) / 2) * 2.5);
        // face-down: show the plain back colour by rotating so we see the card's edge-less back (use side-specific face hidden)
        g.rotation.y = it.side === 'arabic' ? Math.PI * 2 : Math.PI; // placeholder, replaced by cover below
        const cover = shadowed(new THREE.Mesh(new RoundedBoxGeometry(1.74, 2.3, 0.2, 3, 0.08), mat('#8b5cf6', 0.4)));
        const q = textSprite('?', 1.1, { px: 150, w: 128, h: 128, color: '#ffffff' }); q.position.set(0, 0, 0.18); cover.add(q);
        cover.userData.cover = true; g.add(cover); g.userData.cover = cover;
        g.rotation.y = 0;
        mem.add(g); cards.push(g);
      });
      live.current.onMatch(0, 0);
    };
    const clearMemory = () => { [...mem.children].forEach((c) => mem.remove(c)); cards = []; };
    ctx.onTap(() => [...(live.current.mode === 'PLAY' ? cards : [])], (hit) => {
      if (!hit || lock) return;
      let o: THREE.Object3D | null = hit.object;
      while (o && o.userData.n === undefined) o = o.parent;
      const g = o as THREE.Group | null;
      if (!g || g.userData.matched || g === first || !g.userData.cover?.visible) return;
      kit.tap();
      // reveal: hide cover, show requested side
      g.userData.cover.visible = false;
      g.rotation.y = g.userData.side === 'nepali' ? Math.PI : 0;
      ctx.tween(320, (k) => { g.position.y = 1.2 + Math.sin(k * Math.PI) * 0.7; });
      kit.say(g.userData.side === 'nepali' ? npName(g.userData.n) : enName(g.userData.n), enName(g.userData.n), true);
      if (!first) { first = g; return; }
      mv += 1; lock = true;
      const a = first, b = g; first = null;
      if (a.userData.n === b.userData.n && a.userData.side !== b.userData.side) {
        a.userData.matched = b.userData.matched = true; matches += 1; lock = false;
        [a, b].forEach((x) => ctx.tween(500, (k) => x.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.25)));
        kit.good(); kit.star();
        live.current.onMatch(matches, mv);
      } else {
        window.setTimeout(() => { a.userData.cover.visible = true; b.userData.cover.visible = true; a.rotation.y = 0; b.rotation.y = 0; lock = false; kit.oops(); live.current.onMatch(matches, mv); }, 1100);
      }
    });
    ctx.onTap(() => (live.current.mode === 'LEARN' && bigCard ? [bigCard] : []), (hit) => { if (hit) { flip(); kit.tap(); } });
    scene.current = { show, flip, memory, clearMemory, bigVisible: (v) => { big.visible = v; } };
    show(37);
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 12], target: [0, 2, 0], minDistance: 6, maxDistance: 20, ground: 0xfde68a });

  const nums = useMemo(() => {
    const [lo, hi] = range.split('-').map(Number);
    return shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, 6);
  }, [range, game]);

  useEffect(() => {
    const s = scene.current; if (!s) return;
    if (kit.mode === 'LEARN') { s.bigVisible(true); s.clearMemory(); s.show(n); kit.say('कार्ड छोएर पल्टाऔँ।', 'Tap the card to flip it.'); }
    else if (kit.mode === 'PLAY') { s.bigVisible(false); s.memory(nums); kit.say('उस्तै अङ्कको जोडी भेटाऔँ — अङ्ग्रेजी र नेपाली!', 'Find the matching pairs — English digits and Nepali digits!'); }
    else { s.bigVisible(true); s.clearMemory(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, nums]);

  const goto = (v: number) => { const x = Math.max(0, Math.min(100, v)); setN(x); scene.current?.show(x); kit.say(`${x} = ${toNp(x)} (${npName(x)})`, `${x} is ${toNp(x)} in Nepali`); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const v = rnd(11, 99);
    const opts = shuffle([v, Number(String(v).split('').reverse().join('')) === v ? v + 11 : Number(String(v).split('').reverse().join('')), v + (v < 90 ? 10 : -10)]);
    return { v, kind: i % 2, opts };
  }), []);
  const questions: (QuizQuestion & { v: number; kind: number })[] = data.map((d) => d.kind === 0
    ? { np: `अङ्ग्रेजीको ${d.v} नेपालीमा कुन हो?`, en: `Which one is ${d.v} in Nepali digits?`, v: d.v, kind: 0, answer: String(d.v), options: d.opts.map((o) => ({ key: String(o), label: toNp(o) })) }
    : { np: `${toNp(d.v)} कुन अङ्ग्रेजी अङ्क हो?`, en: `${toNp(d.v)} is which English number?`, v: d.v, kind: 1, answer: String(d.v), options: d.opts.map((o) => ({ key: String(o), label: String(o) })) });

  const hud = kit.mode === 'PLAY' ? (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #8b5cf6', fontSize: 18, fontWeight: 900 }}>
      {kit.t('जोडी', 'Pairs')}: {matched}/6 · {kit.t('चाल', 'Moves')}: {moves}
    </div>
  ) : null;

  const digitStrip = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
      {NP_DIGITS.map((d, i) => <span key={d} style={{ background: '#fff7ed', border: '2px solid #fdba74', borderRadius: 10, padding: '2px 10px', fontWeight: 900, fontSize: 16 }}>{i} = {d}</span>)}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <div>
      <Controls>
        <CBtn color="#f59e0b" onClick={() => goto(n - 1)}>◀</CBtn>
        <div style={{ fontWeight: 900, fontSize: 24, minWidth: 110, textAlign: 'center' }}>{n} = {toNp(n)}</div>
        <CBtn color="#f59e0b" onClick={() => goto(n + 1)}>▶</CBtn>
        <input type="range" min={0} max={100} value={n} onChange={(e) => goto(Number(e.target.value))} style={{ flex: 1, minWidth: 140 }} />
        <CBtn color="#8b5cf6" onClick={() => scene.current?.flip()}>🔄 {kit.t('पल्टाऔँ', 'Flip')}</CBtn>
      </Controls>
      {digitStrip}
    </div>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      {(['1-9', '10-50', '51-100'] as const).map((r) => <CBtn key={r} color={r === range ? '#8b5cf6' : '#94a3b8'} onClick={() => { setRange(r); setGame((g) => g + 1); }}>{kit.lang === 'ne' ? toNp(r) : r}</CBtn>)}
      <CBtn color="#f59e0b" onClick={() => { setGame((g) => g + 1); }}>🔀 {kit.t('नयाँ खेल', 'New game')}</CBtn>
      {matched === 6 && <b style={{ color: '#16a34a', fontSize: 18 }}>🎉 {kit.t('सबै जोडी भेटियो!', 'All pairs found!')}</b>}
    </Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => scene.current?.show(q.v, q.kind === 1)} />
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
