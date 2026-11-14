/**
 * Chapter 20 · Coins and Notes (सिक्का र नोट)
 * Toy Shop — choose a toy, read its price, pay the exact amount with Nepali coins and notes.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit } from '../class1-math-kit/SimKit';
import { coin, note, mat, shadowed, NOTE_VALUES, COIN_VALUES, apple, balloon, ball, pencil, critter, star, basket, textSprite } from '../class1-math-kit/models';
import { toNp, shuffle } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const NOTE_BG: Record<number, string> = { 5: '#f9a8a8', 10: '#d8b4fe', 20: '#fdba74', 50: '#93c5fd', 100: '#bef264' };
const TOYS = [
  { id: 'pencil', price: 5, np: 'पेन्सिल', en: 'Pencil', make: () => { const p = pencil('#facc15', 2); p.rotation.z = Math.PI / 2.6; p.scale.setScalar(0.9); return p; } },
  { id: 'balloon', price: 10, np: 'बेलुन', en: 'Balloon', make: () => balloon('#ef4444') },
  { id: 'apple', price: 15, np: 'स्याउ', en: 'Apple', make: () => { const a = apple('#dc2626'); a.scale.setScalar(1.5); return a; } },
  { id: 'ball', price: 20, np: 'बल', en: 'Ball', make: () => ball('#0ea5e9', 0.7) },
  { id: 'bear', price: 35, np: 'भालु', en: 'Teddy bear', make: () => { const b = critter('bear', '#a16207'); b.scale.setScalar(1.1); return b; } },
  { id: 'star', price: 50, np: 'तारा', en: 'Golden star', make: () => { const s = star('#facc15', 0.8); s.rotation.x = 0; return s; } },
];

export const ToyShop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH20-02', chapter: 20, titleNp: 'खेलौना पसल (रुपैयाँ तिरौँ)', titleEn: 'Toy Shop (Pay with Rupees)' });
  const [sel, setSel] = useState<number | null>(null);
  const [paid, setPaid] = useState<{ kind: 'coin' | 'note'; v: number }[]>([]);
  const [bought, setBought] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [learnStep, setLearnStep] = useState(0);
  const scene = useRef<{ select: (i: number | null) => void; addMoney: (k: 'coin' | 'note', v: number) => void; clearMoney: () => void; buy: (i: number) => void; reset: () => void } | null>(null);
  const live = useRef({ mode: kit.mode, onSelect: (_i: number) => {} });
  live.current.mode = kit.mode;
  const total = paid.reduce((a, p) => a + p.v, 0);
  const num = (v: number) => (kit.lang === 'ne' ? toNp(v) : String(v));
  const price = sel !== null ? TOYS[sel].price : 0;

  useStage(kit.stageRef, (ctx) => {
    const shelf = shadowed(new THREE.Mesh(new THREE.BoxGeometry(15, 0.4, 3), mat('#92400e', 0.85))); shelf.position.set(0, 1.6, -3); ctx.scene.add(shelf);
    const back = shadowed(new THREE.Mesh(new THREE.BoxGeometry(15.6, 4, 0.3), mat('#fcd34d', 0.9))); back.position.set(0, 3.3, -4.6); ctx.scene.add(back);
    const counter = shadowed(new THREE.Mesh(new THREE.BoxGeometry(15, 0.6, 4), mat('#b45309', 0.8))); counter.position.set(0, 0.3, 3); ctx.scene.add(counter);
    const bask = basket('#c2410c', 2.6); bask.position.set(7.4, 0.6, 3); ctx.scene.add(bask);
    const toys: THREE.Group[] = [];
    TOYS.forEach((t, i) => {
      const g = new THREE.Group();
      const m = t.make(); m.position.y = 0; m.scale.multiplyScalar(1.5); g.add(m);
      const tag = textSprite(`Rs ${t.price}`, 1.4, { px: 70, w: 256, h: 128, bg: '#ffffff', border: '#16a34a', color: '#14532d' }); tag.position.set(0, -0.35, 1.5); g.add(tag);
      g.position.set(-6 + i * 2.4, 2.4, -3); g.userData.toy = i; g.userData.home = g.position.clone();
      ctx.scene.add(g); toys.push(g);
    });
    const money = new THREE.Group(); ctx.scene.add(money);
    const select = (i: number | null) => toys.forEach((g, j) => { g.userData.sel = i === j; });
    const addMoney = (kind: 'coin' | 'note', v: number) => {
      const o = kind === 'note' ? note(v) : coin(v, 0.7);
      const idx = money.children.length;
      const to = new THREE.Vector3(-6.5 + (idx % 6) * 2.4, 0.7 + Math.floor(idx / 6) * 0.06, 2.2 + Math.floor(idx / 6) * 1.2);
      o.position.set(to.x, 6, to.z); o.scale.setScalar(kind === 'note' ? 0.65 : 1); money.add(o);
      const p0 = o.position.clone();
      ctx.tween(520, (k) => o.position.lerpVectors(p0, to, k), undefined, ease.bounce);
    };
    const clearMoney = () => [...money.children].forEach((c) => money.remove(c));
    const buy = (i: number) => {
      const g = toys[i]; const p0 = g.position.clone(); const p1 = new THREE.Vector3(7.4, 1.6, 3);
      ctx.tween(900, (k) => { g.position.lerpVectors(p0, p1, k); g.position.y += Math.sin(k * Math.PI) * 3; g.scale.setScalar(1 - 0.3 * k); }, () => { g.visible = false; }, ease.inOut);
      g.userData.sold = true;
    };
    const reset = () => toys.forEach((g) => { g.visible = true; g.userData.sold = false; g.userData.sel = false; g.position.copy(g.userData.home); g.scale.setScalar(1); });
    scene.current = { select, addMoney, clearMoney, buy, reset };
    ctx.onFrame((_d, t) => toys.forEach((g, i) => { if (g.userData.sold) return; const up = g.userData.sel ? 0.9 : 0; g.position.y += (g.userData.home.y + up + Math.sin(t * 2 + i) * 0.05 - g.position.y) * 0.15; g.rotation.y = g.userData.sel ? t : 0; }));
    ctx.onTap(() => toys.filter((g) => !g.userData.sold), (hit) => {
      if (!hit || live.current.mode === 'CHALLENGE') return;
      let o: THREE.Object3D | null = hit.object;
      while (o && o.userData.toy === undefined) o = o.parent;
      if (o) live.current.onSelect(o.userData.toy);
    });
    return () => { scene.current = null; };
  }, [], { camera: [0, 5.4, 11], target: [0, 2.2, -0.6], minDistance: 7, maxDistance: 22, ground: 0xfde68a, sky: 0xfef3c7 });

  const choose = (i: number) => {
    if (bought.includes(i)) return;
    setSel(i); setPaid([]); scene.current?.clearMoney(); scene.current?.select(i); kit.tap();
    kit.say(`${TOYS[i].np} — रु. ${toNp(TOYS[i].price)}। ठीक रकम तिरौँ।`, `${TOYS[i].en} costs Rs ${TOYS[i].price}. Pay the exact amount.`);
  };
  live.current.onSelect = choose;

  const pay = () => {
    if (sel === null) { kit.oops('पहिले खेलौना रोजौँ', 'Choose a toy first'); return; }
    if (total === price) {
      kit.good(`${TOYS[sel].np} किन्यौँ!`, `You bought the ${TOYS[sel].en.toLowerCase()}!`); kit.star();
      scene.current?.buy(sel); setBought((b) => [...b, sel]); setSel(null); setPaid([]);
      window.setTimeout(() => scene.current?.clearMoney(), 700);
      if (kit.mode === 'CHALLENGE') {
        const ns = score + 1; setScore(ns);
        window.setTimeout(() => { if (round + 1 >= 5) { setFinished(true); kit.finish(ns, 5); } else nextTask(round + 1); }, 1200);
      } else if (kit.mode === 'LEARN') setLearnStep((s) => s + 1);
    } else if (total < price) kit.oops(`रु. ${toNp(price - total)} अझै चाहिन्छ`, `You need Rs ${price - total} more`);
    else kit.oops(`रु. ${toNp(total - price)} धेरै भयो`, `That is Rs ${total - price} too much`);
  };
  const addMoney = (kind: 'coin' | 'note', v: number) => {
    if (sel === null) { kit.oops('पहिले खेलौना रोजौँ', 'Choose a toy first'); return; }
    scene.current?.addMoney(kind, v); setPaid((p) => [...p, { kind, v }]); kit.tap();
  };

  const tasks = useRef<number[]>([]);
  const nextTask = (r: number) => {
    setRound(r);
    const i = tasks.current[r];
    setPaid([]); scene.current?.clearMoney(); setSel(i); scene.current?.select(i);
    kit.say(`${TOYS[i].np} किन्नुहोस्। मूल्य रु. ${toNp(TOYS[i].price)}। ठीक रकम तिरौँ।`, `Buy the ${TOYS[i].en.toLowerCase()}. It costs Rs ${TOYS[i].price}. Pay exactly.`);
  };
  useEffect(() => {
    scene.current?.reset(); scene.current?.clearMoney(); setBought([]); setPaid([]); setSel(null); setRound(0); setScore(0); setFinished(false); setLearnStep(0);
    if (kit.mode === 'LEARN') { choose(0); kit.say('पेन्सिल रु. ५ को छ। रु. ५ को नोट थपौँ।', 'The pencil costs Rs 5. Add a Rs 5 note.'); }
    else if (kit.mode === 'PLAY') kit.say('मन परेको खेलौना छोऔँ र पैसा तिरौँ।', 'Tap a toy and pay for it.');
    else { tasks.current = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 5); window.setTimeout(() => nextTask(0), 100); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);
  useEffect(() => { if (kit.mode === 'LEARN' && learnStep > 0 && learnStep < TOYS.length) { const i = learnStep; window.setTimeout(() => choose(i), 900); } /* eslint-disable-next-line */ }, [learnStep]);

  const hud = (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #16a34a', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{kit.t('मूल्य', 'Price')}: <b style={{ fontSize: 24 }}>{sel === null ? '—' : `${kit.t('रु.', 'Rs')} ${num(price)}`}</b></div>
      <div style={{ fontSize: 20, fontWeight: 900, color: total === price && sel !== null ? '#16a34a' : total > price ? '#dc2626' : '#0369a1' }}>{kit.t('तिरेको', 'Paid')}: {kit.t('रु.', 'Rs')} {num(total)}</div>
    </div>
  );
  const chip = (kind: 'coin' | 'note', v: number) => (
    <CBtn key={`${kind}${v}`} onClick={() => addMoney(kind, v)} style={{ background: kind === 'note' ? NOTE_BG[v] : '#fbbf24', color: '#1f2937', minWidth: 64, padding: '8px 8px', boxShadow: '0 3px 0 rgba(0,0,0,.2)', borderRadius: kind === 'coin' ? 40 : 10 }}>
      {kind === 'note' ? '💵' : '🪙'} {num(v)}
    </CBtn>
  );
  const money = (
    <>
      {COIN_VALUES.map((v) => chip('coin', v))}{NOTE_VALUES.map((v) => chip('note', v))}
      <CBtn color="#f59e0b" onClick={() => { setPaid([]); scene.current?.clearMoney(); }}>↺</CBtn>
      <CBtn color="#16a34a" onClick={pay}>✓ {kit.t('तिरौँ', 'Pay')}</CBtn>
    </>
  );
  const panel = finished ? (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>🏆 {kit.t(`५ मध्ये ${toNp(score)} सही!`, `${score} of 5 correct!`)}</div>
      <CBtn color="#0ea5e9" onClick={() => { kit.setMode('PLAY'); window.setTimeout(() => kit.setMode('CHALLENGE'), 0); }}>↺ {kit.t('फेरि खेलौँ', 'Play again')}</CBtn>
    </div>
  ) : (
    <div>
      {kit.mode === 'CHALLENGE' && <div style={{ fontWeight: 800, marginBottom: 6 }}>{kit.t('कार्य', 'Task')} {num(round + 1)}/{num(5)}{sel !== null && ` · ${kit.t(TOYS[sel].np, TOYS[sel].en)} ${kit.t('रु.', 'Rs')} ${num(price)}`}</div>}
      {kit.mode === 'LEARN' && <div style={{ fontWeight: 800, marginBottom: 6 }}>{learnStep >= TOYS.length ? kit.t('🎉 सबै खेलौना किनियो!', '🎉 You bought everything!') : kit.t('नोट वा सिक्का थपेर ठीक रकम बनाऔँ।', 'Add notes or coins to make the exact price.')}</div>}
      <Controls>{money}</Controls>
    </div>
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
