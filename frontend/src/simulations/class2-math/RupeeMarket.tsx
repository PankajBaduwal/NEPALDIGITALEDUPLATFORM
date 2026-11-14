/**
 * Lesson 15 · Currency (मुद्रा)
 * Rupee Market — buy things with Nepali notes and coins (up to Rs 1000): pay exactly, add prices, find the change.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, note, coin, NOTE_VALUES, COIN_VALUES } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const NOTE_BG: Record<number, string> = { 5: '#f9a8a8', 10: '#d8b4fe', 20: '#fdba74', 50: '#93c5fd', 100: '#bef264', 500: '#fde68a', 1000: '#a7f3d0' };
const NOTES2 = [5, 10, 20, 50, 100, 500, 1000];
const GOODS = [
  { np: 'कापी', en: 'Copy book', emoji: '📒', price: 35 }, { np: 'झोला', en: 'Bag', emoji: '🎒', price: 250 }, { np: 'जुत्ता', en: 'Shoes', emoji: '👟', price: 450 },
  { np: 'दूध', en: 'Milk', emoji: '🥛', price: 60 }, { np: 'स्याउ (१ के.जी.)', en: 'Apples (1 kg)', emoji: '🍎', price: 180 }, { np: 'पेन', en: 'Pen', emoji: '🖊️', price: 15 },
  { np: 'बिस्कुट', en: 'Biscuits', emoji: '🍪', price: 45 }, { np: 'बल', en: 'Ball', emoji: '⚽', price: 120 },
];

export const RupeeMarket: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L15-01', chapter: 15, titleNp: 'रुपैयाँ बजार (मुद्रा)', titleEn: 'Rupee Market (Currency)' });
  const [cart, setCart] = useState<number[]>([]);
  const [paid, setPaid] = useState<{ kind: 'coin' | 'note'; v: number }[]>([]);
  const [li, setLi] = useState(0);
  const scene = useRef<{ stock: (idx: number[]) => void; money: (list: { kind: 'coin' | 'note'; v: number }[]) => void; selectOnly: (idx: number[]) => void } | null>(null);
  const live = useRef({ mode: kit.mode, pick: (_i: number) => {} });
  live.current.mode = kit.mode;

  useStage(kit.stageRef, (ctx) => {
    const shelf = shadowed(new THREE.Mesh(new THREE.BoxGeometry(17, 0.4, 3), mat('#92400e', 0.85))); shelf.position.set(0, 1.5, -3); ctx.scene.add(shelf);
    const wall = shadowed(new THREE.Mesh(new THREE.BoxGeometry(17.6, 4.6, 0.3), mat('#fde68a', 0.9))); wall.position.set(0, 3.7, -4.6); ctx.scene.add(wall);
    const counter = shadowed(new THREE.Mesh(new THREE.BoxGeometry(17, 0.6, 4.4), mat('#b45309', 0.8))); counter.position.set(0, 0.3, 2.8); ctx.scene.add(counter);
    const shelfItems = new THREE.Group(); ctx.scene.add(shelfItems);
    const moneyG = new THREE.Group(); ctx.scene.add(moneyG);
    const items: THREE.Group[] = [];
    const stock = (idx: number[]) => {
      [...shelfItems.children].forEach((c) => shelfItems.remove(c)); items.length = 0;
      idx.forEach((gi, i) => {
        const g = new THREE.Group(); const gd = GOODS[gi];
        const box = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7), mat('#fff7ed', 0.6))); box.position.y = 1; g.add(box);
        const em = textSprite(gd.emoji, 1.5, { px: 120, w: 160, h: 160 }); em.position.set(0, 1.05, 1); g.add(em);
        const tag = textSprite(`Rs ${gd.price}`, 1.6, { px: 66, w: 256, h: 112, bg: '#ffffff', border: '#16a34a', color: '#14532d' }); tag.position.set(0, -0.15, 1.2); g.add(tag);
        g.position.set((i - (idx.length - 1) / 2) * 2.5, 1.7, -3); g.userData.good = gi; g.userData.i = i; shelfItems.add(g); items.push(g);
      });
    };
    const selectOnly = (idx: number[]) => items.forEach((g) => { g.userData.sel = idx.includes(g.userData.good); });
    const money = (list: { kind: 'coin' | 'note'; v: number }[]) => {
      [...moneyG.children].forEach((c) => moneyG.remove(c));
      list.forEach((m, i) => {
        const o = m.kind === 'note' ? note(m.v) : coin(m.v, 0.6); o.scale.setScalar(m.kind === 'note' ? 0.55 : 1);
        const to = new THREE.Vector3(-7 + (i % 8) * 2, 0.7 + Math.floor(i / 8) * 0.05, 2.2 + Math.floor(i / 8) * 1.1); o.position.set(to.x, 5, to.z); moneyG.add(o);
        if (i === list.length - 1) { const p0 = o.position.clone(); ctx.tween(480, (k) => o.position.lerpVectors(p0, to, k), undefined, ease.bounce); } else o.position.copy(to);
      });
    };
    scene.current = { stock, money, selectOnly };
    ctx.onFrame((_d, t) => items.forEach((g) => { g.position.y += ((g.userData.sel ? 2.4 : 1.7) + Math.sin(t * 2 + g.userData.i) * 0.04 - g.position.y) * 0.15; }));
    ctx.onTap(() => items, (hit) => { if (!hit || live.current.mode === 'CHALLENGE') return; let o: THREE.Object3D | null = hit.object; while (o && o.userData.good === undefined) o = o.parent; if (o) live.current.pick(o.userData.good); });
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 12.5], target: [0, 2, -0.2], minDistance: 8, maxDistance: 22, ground: 0xfde68a, sky: 0xfef3c7 });

  const shown = useRef<number[]>([0, 3, 5, 6, 7]);
  const total = cart.reduce((a, g) => a + GOODS[g].price, 0);
  const paidSum = paid.reduce((a, p) => a + p.v, 0);
  live.current.pick = (gi) => { if (kit.mode === 'CHALLENGE') return; const next = cart.includes(gi) ? cart.filter((x) => x !== gi) : [...cart, gi]; setCart(next); scene.current?.selectOnly(next); kit.tap(); kit.say(`${GOODS[gi].np} रु. ${GOODS[gi].price}`, `${GOODS[gi].en}: Rs ${GOODS[gi].price}`); };

  const setShelf = (idx: number[]) => { shown.current = idx; scene.current?.stock(idx); };
  useEffect(() => {
    setPaid([]); scene.current?.money([]);
    if (kit.mode === 'LEARN') { setShelf([0, 5, 6, 3, 7]); setCart([5]); scene.current?.selectOnly([5]); kit.say('पेन रु. १५ को छ। नोट र सिक्का थपेर ठीक रकम तिरौँ।', 'The pen costs Rs 15. Add notes and coins to pay exactly.'); }
    else if (kit.mode === 'PLAY') { setShelf([0, 3, 5, 6, 7]); setCart([]); scene.current?.selectOnly([]); kit.say('सामान छोएर किनौँ, अनि पैसा तिरौँ।', 'Tap goods to buy, then pay.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const addMoney = (kind: 'coin' | 'note', v: number) => { if (paidSum + v > 2000) return; const n = [...paid, { kind, v }]; setPaid(n); scene.current?.money(n); kit.tap(); };
  const pay = () => {
    if (!cart.length) { kit.oops('पहिले सामान रोजौँ', 'Choose goods first'); return; }
    if (paidSum === total) { kit.good(`रु. ${total} ठीक तिर्यौँ!`, `You paid exactly Rs ${total}!`); kit.star(); setPaid([]); scene.current?.money([]); if (kit.mode === 'LEARN') window.setTimeout(() => setLi((v) => v + 1), 900); }
    else if (paidSum < total) kit.oops(`रु. ${total - paidSum} अझै चाहिन्छ`, `You need Rs ${total - paidSum} more`);
    else kit.oops(`रु. ${paidSum - total} फिर्ता पाउँछौ (फिर्ता = ${paidSum - total})`, `That is Rs ${paidSum - total} too much — your change would be Rs ${paidSum - total}`);
  };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    if (i % 3 === 0) { const a = rnd(0, 7); let b = rnd(0, 7); while (b === a) b = rnd(0, 7); return { kind: 'total', a, b }; }
    if (i % 3 === 1) { const a = rnd(0, 7); const price = GOODS[a].price; const pay = NOTES2.find((n) => n > price) || 1000; return { kind: 'change', a, pay }; }
    const a = rnd(0, 7); return { kind: 'notes', a };
  }), []);
  const questions: (QuizQuestion & { d: any })[] = data.map((d: any, i) => {
    if (d.kind === 'total') { const s = GOODS[d.a].price + GOODS[d.b].price; return { np: `${GOODS[d.a].np} (रु. ${d.a >= 0 ? GOODS[d.a].price : ''}) र ${GOODS[d.b].np} (रु. ${GOODS[d.b].price}) को जम्मा कति?`, en: `${GOODS[d.a].en} (Rs ${GOODS[d.a].price}) and ${GOODS[d.b].en} (Rs ${GOODS[d.b].price}). What is the total?`, d, answer: String(s), options: numChoices(s, i * 7 + 3, [10, -10, 5, -5, 1]).map((v) => ({ key: String(v), label: `Rs ${fmt(kit.lang, v)}` })) }; }
    if (d.kind === 'change') { const ch = d.pay - GOODS[d.a].price; return { np: `${GOODS[d.a].np}को मूल्य रु. ${GOODS[d.a].price}। तिमीले रु. ${d.pay}को नोट दियौ। फिर्ता कति पाउँछौ?`, en: `The ${GOODS[d.a].en.toLowerCase()} costs Rs ${GOODS[d.a].price}. You pay with a Rs ${d.pay} note. How much change do you get?`, d, answer: String(ch), options: numChoices(ch, i * 11 + 2, [10, -10, 5, -5, 20]).map((v) => ({ key: String(v), label: `Rs ${fmt(kit.lang, v)}` })) }; }
    const price = GOODS[d.a].price; const best = NOTES2.filter((n) => n <= price).pop() || 5; return { np: `रु. ${price} को सामानको लागि सबैभन्दा ठूलो कुन नोट प्रयोग गर्न सकिन्छ (रु. ${price} भन्दा बढी नभएको)?`, en: `Which is the biggest note that is not more than Rs ${price}?`, d, answer: String(best), options: [5, 10, 20, 50, 100, 500, 1000].filter((n) => n === best || Math.abs(Math.log10(n) - Math.log10(best)) < 0.75).slice(0, 3).map((v) => ({ key: String(v), label: <span style={{ background: NOTE_BG[v], padding: '2px 10px', borderRadius: 6, color: '#1f2937' }}>Rs {v}</span> })) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #16a34a', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{kit.t('जम्मा मूल्य', 'Total price')}: <b style={{ fontSize: 24 }}>Rs {fmt(kit.lang, total)}</b></div>
      <div style={{ fontSize: 20, fontWeight: 900, color: paidSum === total && total ? '#16a34a' : paidSum > total ? '#dc2626' : '#0369a1' }}>{kit.t('तिरेको', 'Paid')}: Rs {fmt(kit.lang, paidSum)}</div>
    </div>
  );
  const chip = (kind: 'coin' | 'note', v: number) => (
    <CBtn key={`${kind}${v}`} onClick={() => addMoney(kind, v)} style={{ background: kind === 'note' ? NOTE_BG[v] : '#fbbf24', color: '#1f2937', minWidth: 60, padding: '6px 8px', minHeight: 48, fontSize: 16, boxShadow: '0 3px 0 rgba(0,0,0,.2)', borderRadius: kind === 'coin' ? 40 : 10 }}>{kind === 'note' ? '💵' : '🪙'}{fmt(kit.lang, v)}</CBtn>
  );
  const moneyBar = (<>{COIN_VALUES.map((v) => chip('coin', v))}{NOTES2.map((v) => chip('note', v))}<CBtn color="#f59e0b" onClick={() => { setPaid([]); scene.current?.money([]); }}>↺</CBtn><CBtn color="#16a34a" onClick={pay}>✓ {kit.t('तिरौँ', 'Pay')}</CBtn></>);
  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { const d = q.d; const idx = d.kind === 'total' ? [d.a, d.b] : [d.a]; setShelf([...new Set([...idx, 0, 3, 5, 6, 7])].slice(0, 5)); window.setTimeout(() => scene.current?.selectOnly(idx), 50); setPaid([]); scene.current?.money(d.kind === 'change' ? [{ kind: 'note', v: d.pay }] : []); }} />
  ) : (
    <div>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{kit.mode === 'LEARN' ? kit.t('पेनको मूल्य रु. १५ तिरौँ', 'Pay Rs 15 for the pen') : kit.t('सामान छानेर रकम तिरौँ', 'Choose goods, then pay')}</div>
      <Controls>{moneyBar}</Controls>
    </div>
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
