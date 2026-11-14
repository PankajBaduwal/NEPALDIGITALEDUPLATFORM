/**
 * Lesson 17 · Money (मुद्रा)
 * Bill & Change Shop — add prices to make a bill, pay with a note, and subtract to find the change.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, note } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
const NOTES = [10, 20, 50, 100, 500, 1000];
const NOTE_BG: Record<number, string> = { 10: '#d8b4fe', 20: '#fdba74', 50: '#93c5fd', 100: '#bef264', 500: '#fde68a', 1000: '#a7f3d0' };
const GOODS = [
  { np: 'चामल (५ केजी)', en: 'Rice (5 kg)', emoji: '🍚', price: 625 }, { np: 'तेल (१ लि.)', en: 'Oil (1 L)', emoji: '🛢️', price: 235 }, { np: 'चिया', en: 'Tea', emoji: '🍵', price: 120 },
  { np: 'कापी', en: 'Copy', emoji: '📒', price: 45 }, { np: 'चप्पल', en: 'Slippers', emoji: '🩴', price: 340 }, { np: 'दूध', en: 'Milk', emoji: '🥛', price: 85 },
  { np: 'फुटबल', en: 'Football', emoji: '⚽', price: 450 }, { np: 'किताब', en: 'Book', emoji: '📗', price: 160 },
];
const nxtNote = (t: number) => NOTES.find((n) => n >= t) || 1000;

export const MoneyShop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L17-01', chapter: 17, titleNp: 'बिल र फिर्ता पसल (मुद्रा)', titleEn: 'Bill & Change Shop (Money)' });
  const [cart, setCart] = useState<number[]>([]);
  const [pay, setPay] = useState<number>(0);
  const [li, setLi] = useState(0);
  const scene = useRef<{ sel: (c: number[]) => void; note: (v: number) => void } | null>(null);
  const live = useRef({ mode: kit.mode, tap: (_g: number) => {} });
  live.current.mode = kit.mode;

  useStage(kit.stageRef, (ctx) => {
    const counter = shadowed(new THREE.Mesh(new THREE.BoxGeometry(18, 0.6, 5), mat('#b45309', 0.8))); counter.position.set(0, 0.3, 1.5); ctx.scene.add(counter);
    const wall = shadowed(new THREE.Mesh(new THREE.BoxGeometry(18.6, 5.6, 0.3), mat('#fde68a', 0.9))); wall.position.set(0, 3.4, -3.2); ctx.scene.add(wall);
    const items: THREE.Group[] = [];
    GOODS.forEach((gd, i) => {
      const g = new THREE.Group(); g.position.set((i - 3.5) * 2.3, 1.5, 0.2); g.userData.good = i; g.userData.base = 1.5;
      const box = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.6), mat('#fff7ed', 0.6))); box.position.y = 0.9; g.add(box);
      const em = textSprite(gd.emoji, 1.5, { px: 120, w: 160, h: 160 }); em.position.set(0, 0.95, 0.85); g.add(em);
      const tag = textSprite(`Rs ${gd.price}`, 1.7, { px: 62, w: 256, h: 112, bg: '#ffffff', border: '#16a34a', color: '#14532d' }); tag.position.set(0, 2.3, 0.2); g.add(tag);
      ctx.scene.add(g); items.push(g);
    });
    const moneyG = new THREE.Group(); ctx.scene.add(moneyG);
    ctx.onFrame((_d, t) => items.forEach((g) => { g.position.y += ((g.userData.sel ? 2.4 : 1.5) + Math.sin(t * 2 + g.userData.good) * 0.03 - g.position.y) * 0.15; }));
    ctx.onTap(() => items, (hit) => { if (!hit || live.current.mode === 'CHALLENGE') return; let o: THREE.Object3D | null = hit.object; while (o && o.userData.good === undefined) o = o.parent; if (o) live.current.tap(o.userData.good); });
    scene.current = {
      sel: (c) => items.forEach((g) => { g.userData.sel = c.includes(g.userData.good); }),
      note: (v) => { moneyG.clear(); if (!v) return; const n = note(v); n.scale.setScalar(0.9); n.rotation.x = -Math.PI / 2; const to = new THREE.Vector3(0, 0.75, 2.8); n.position.set(0, 5, 2.8); moneyG.add(n); const p0 = n.position.clone(); ctx.tween(500, (k) => n.position.lerpVectors(p0, to, k), undefined, ease.out); },
    };
    return () => { scene.current = null; };
  }, [], { camera: [0, 6.5, 13.5], target: [0, 1.8, 0], minDistance: 8, maxDistance: 24, ground: 0xfde68a, sky: 0xfef3c7 });

  const total = cart.reduce((a, g) => a + GOODS[g].price, 0);
  const change = pay - total;
  live.current.tap = (gi) => { const next = cart.includes(gi) ? cart.filter((x) => x !== gi) : cart.length >= 3 ? cart : [...cart, gi]; setCart(next); setPay(0); scene.current?.note(0); scene.current?.sel(next); kit.tap(); kit.say(`${GOODS[gi].np} रु. ${GOODS[gi].price}`, `${GOODS[gi].en}: Rs ${GOODS[gi].price}`); };

  const payWith = (v: number) => { if (!cart.length) { kit.oops('पहिले सामान रोजौँ', 'Choose goods first'); return; } setPay(v); scene.current?.note(v); if (v < total) kit.oops(`रु. ${total - v} कम छ`, `Rs ${total - v} short — pay with a bigger note`); else { kit.say(`रु. ${v} − रु. ${total} = रु. ${v - total} फिर्ता`, `Rs ${v} − Rs ${total} = Rs ${v - total} change`); if (v - total >= 0) kit.star(); } };
  const random = () => { const c = [rnd(0, 7)]; let b = rnd(0, 7); while (b === c[0]) b = rnd(0, 7); c.push(b); setCart(c); setPay(0); scene.current?.note(0); scene.current?.sel(c); };
  useEffect(() => { if (kit.mode === 'LEARN') { const c = [3, 5]; setCart(c); setPay(0); scene.current?.sel(c); scene.current?.note(0); kit.say('कापी र दूधको बिल: मूल्य जोडौँ, अनि नोट दिएर फिर्ता निकालौँ', 'Copy and milk: add the prices, pay with a note, subtract to get the change'); } else if (kit.mode === 'PLAY') { setCart([]); setPay(0); scene.current?.sel([]); scene.current?.note(0); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const a = rnd(0, 7); let b = rnd(0, 7); while (b === a) b = rnd(0, 7); return { a, b, kind: i % 3 }; }), []);
  const questions: (QuizQuestion & { d: any })[] = data.map((d, i) => {
    const t = GOODS[d.a].price + GOODS[d.b].price; const n = nxtNote(t + 1); const L = (v: number) => ({ key: String(v), label: `Rs ${fmt(kit.lang, v)}` });
    if (d.kind === 0) return { d, np: `${GOODS[d.a].np} (रु. ${GOODS[d.a].price}) र ${GOODS[d.b].np} (रु. ${GOODS[d.b].price}) को जम्मा बिल कति?`, en: `${GOODS[d.a].en} (Rs ${GOODS[d.a].price}) and ${GOODS[d.b].en} (Rs ${GOODS[d.b].price}) — what is the bill?`, answer: String(t), options: near(t, i + 2, [10, -10, 100, -100, 5, -5]).map(L) };
    if (d.kind === 1) return { d, np: `बिल रु. ${t}। रु. ${n}को नोट दिए फिर्ता कति आउँछ?`, en: `The bill is Rs ${t}. You pay a Rs ${n} note. What is the change?`, answer: String(n - t), options: near(n - t, i + 5, [10, -10, 100, -100, 5], 1).map(L) };
    return { d, np: `रु. ${GOODS[d.a].price} को सामान किनेर रु. ${nxtNote(GOODS[d.a].price + 1)}को नोट दिँदा फिर्ता कति?`, en: `You buy the ${GOODS[d.a].en.toLowerCase()} (Rs ${GOODS[d.a].price}) with a Rs ${nxtNote(GOODS[d.a].price + 1)} note. Change?`, answer: String(nxtNote(GOODS[d.a].price + 1) - GOODS[d.a].price), options: near(nxtNote(GOODS[d.a].price + 1) - GOODS[d.a].price, i + 7, [10, -10, 100, -100, 5], 1).map(L) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #16a34a', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{kit.t('बिल', 'Bill')}: {cart.map((g) => GOODS[g].price).join(' + ') || '0'} = <b style={{ fontSize: 22 }}>Rs {fmt(kit.lang, total)}</b></div>
      {pay > 0 && <div style={{ fontSize: 17, fontWeight: 900, color: change >= 0 ? '#16a34a' : '#dc2626' }}>{kit.t('दिएको', 'Paid')} Rs {fmt(kit.lang, pay)} → {change >= 0 ? `${kit.t('फिर्ता', 'Change')} Rs ${fmt(kit.lang, change)}` : kit.t('पुगेन', 'Not enough')}</div>}
    </div>
  );
  const noteBtns = NOTES.map((v) => <CBtn key={v} onClick={() => payWith(v)} style={{ background: NOTE_BG[v], color: '#1f2937', minWidth: 70, minHeight: 48, boxShadow: '0 3px 0 rgba(0,0,0,.2)' }}>💵 {fmt(kit.lang, v)}</CBtn>);
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 16, flex: 1, minWidth: 180 }}>{kit.t('नोट रोजेर फिर्ता हेरौँ', 'Pick a note to pay with')}</div>{noteBtns}<CBtn color="#8b5cf6" onClick={() => { random(); kit.star(); }}>🎲</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <div><div style={{ fontWeight: 800, marginBottom: 6 }}>{kit.t('२–३ सामान छोएर किनौँ, अनि नोट दिऔँ', 'Tap up to 3 goods, then pay with a note')}</div><Controls>{noteBtns}<CBtn color="#f59e0b" onClick={() => { setCart([]); setPay(0); scene.current?.sel([]); scene.current?.note(0); }}>↺</CBtn></Controls></div>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { const c = [q.d.a, q.d.b]; scene.current?.sel(q.d.kind === 2 ? [q.d.a] : c); scene.current?.note(0); }} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
