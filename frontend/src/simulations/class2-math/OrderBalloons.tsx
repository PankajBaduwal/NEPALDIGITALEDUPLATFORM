/**
 * Lesson 4 · Comparison of numbers (सङ्ख्याको तुलना) — ascending and descending order
 * Order the Balloons — tap the balloons from the smallest to the biggest (or biggest to smallest).
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit } from '../class1-math-kit/SimKit';
import { balloon, textSprite, PALETTE } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
type Dir = 'UP' | 'DOWN';

export const OrderBalloons: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L4-02', chapter: 4, titleNp: 'बेलुन मिलाऔँ (क्रम)', titleEn: 'Order the Balloons (Ascending / Descending)' });
  const [dir, setDir] = useState<Dir>('UP');
  const [nums, setNums] = useState<number[]>([]);
  const [next, setNext] = useState(0);
  const [round, setRound] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const scene = useRef<{ show: (n: number[]) => void; mark: (i: number) => void; demo: (order: number[]) => void } | null>(null);
  const live = useRef({ tap: (_i: number) => {} });

  useStage(kit.stageRef, (ctx) => {
    const items: THREE.Group[] = [];
    const group = new THREE.Group(); ctx.scene.add(group);
    const slots = [-6.4, -3.2, 0, 3.2, 6.4];
    const show = (n: number[]) => {
      [...group.children].forEach((c) => group.remove(c)); items.length = 0;
      n.forEach((v, i) => {
        const g = new THREE.Group(); const b = balloon(PALETTE[i % PALETTE.length]); b.scale.setScalar(1.7); g.add(b);
        const lab = textSprite(String(v), 2.1, { px: 92, w: 256, h: 128, bg: '#ffffff', border: PALETTE[i % PALETTE.length] }); lab.position.set(0, 2.5, 0.8); g.add(lab);
        g.userData.i = i; g.userData.home = new THREE.Vector3(slots[i], 1.6, 0); g.position.copy(g.userData.home); g.userData.target = g.userData.home.clone(); group.add(g); items.push(g);
      });
    };
    const mark = (i: number) => { const g = items[i]; g.userData.done = true; ctx.tween(520, (k) => g.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.3), undefined, ease.out); };
    const demo = (order: number[]) => order.forEach((idx, rank) => { const g = items[idx]; g.userData.target = new THREE.Vector3(slots[rank], 1.6, 0); ctx.tween(800, () => undefined); });
    scene.current = { show, mark, demo };
    ctx.onFrame((_d, t) => items.forEach((g, i) => { g.position.x += (g.userData.target.x - g.position.x) * 0.1; g.position.y = 1.6 + Math.sin(t * 1.5 + i) * 0.2 + (g.userData.done ? 1.8 : 0); }));
    ctx.onTap(() => items, (hit) => { if (!hit) return; let o: THREE.Object3D | null = hit.object; while (o && o.userData.i === undefined) o = o.parent; if (o) live.current.tap(o.userData.i); });
    return () => { scene.current = null; };
  }, [], { camera: [0, 4.5, 14], target: [0, 3, 0], minDistance: 8, maxDistance: 22, sky: 0xc4e8ff });

  const sortedIdx = (n: number[], d: Dir) => n.map((_, i) => i).sort((p, q) => (d === 'UP' ? n[p] - n[q] : n[q] - n[p]));
  const fresh = (d: Dir) => {
    const set = new Set<number>(); while (set.size < 5) set.add(rnd(100, 999));
    const n = shuffle(Array.from(set)); setNums(n); setNext(0); setMistakes(0); scene.current?.show(n);
    kit.say(d === 'UP' ? 'सबैभन्दा सानोदेखि ठूलोसम्म छोऔँ।' : 'सबैभन्दा ठूलोदेखि सानोसम्म छोऔँ।', d === 'UP' ? 'Tap from the smallest to the biggest.' : 'Tap from the biggest to the smallest.');
    return n;
  };
  const order = sortedIdx(nums, dir);

  live.current.tap = (i) => {
    if (kit.mode === 'LEARN' || finished || !nums.length) return;
    if (order.slice(0, next).includes(i)) return;
    if (i === order[next]) {
      scene.current?.mark(i); kit.tap(); kit.say(`${nums[i]}`, `${nums[i]}`);
      if (next + 1 === 5) {
        kit.good(); kit.star();
        if (kit.mode === 'CHALLENGE') {
          const ns = score + (mistakes === 0 ? 1 : 0); setScore(ns);
          window.setTimeout(() => { if (round + 1 >= 5) { setFinished(true); kit.finish(ns, 5); } else { setRound(round + 1); const d: Dir = (round + 1) % 2 ? 'DOWN' : 'UP'; setDir(d); fresh(d); } }, 1200);
        }
      }
      setNext(next + 1);
    } else { setMistakes((m) => m + 1); kit.oops(dir === 'UP' ? 'अझै सानो सङ्ख्या छ' : 'अझै ठूलो सङ्ख्या छ', dir === 'UP' ? 'There is a smaller number' : 'There is a bigger number'); }
  };

  useEffect(() => {
    setRound(0); setScore(0); setFinished(false); setNext(0);
    if (kit.mode === 'LEARN') {
      const n = fresh('UP'); setDir('UP');
      kit.say('साना सङ्ख्यादेखि ठूलासम्म मिलाउनुलाई बढ्दो क्रम भनिन्छ।', 'Small to big is called ascending order.');
      window.setTimeout(() => scene.current?.demo(sortedIdx(n, 'UP')), 1500);
    } else { const d: Dir = 'UP'; setDir(d); fresh(d); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const demoDir = (d: Dir) => { setDir(d); scene.current?.demo(sortedIdx(nums, d)); kit.say(d === 'UP' ? 'बढ्दो क्रम: सानोदेखि ठूलो' : 'घट्दो क्रम: ठूलोदेखि सानो', d === 'UP' ? 'Ascending: small to big' : 'Descending: big to small'); };
  const hud = kit.mode === 'CHALLENGE' ? (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', fontWeight: 900, fontSize: 20 }}>{kit.t('चरण', 'Round')} {fmt(kit.lang, round + 1)}/{fmt(kit.lang, 5)} · {dir === 'UP' ? kit.t('बढ्दो ↑', 'Ascending ↑') : kit.t('घट्दो ↓', 'Descending ↓')}</div>
  ) : null;
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>{dir === 'UP' ? kit.t('बढ्दो क्रम ↑ (सानोदेखि ठूलो)', 'Ascending ↑ (small to big)') : kit.t('घट्दो क्रम ↓ (ठूलोदेखि सानो)', 'Descending ↓ (big to small)')}</div>
      <CBtn color="#0ea5e9" onClick={() => demoDir('UP')}>↑ {kit.t('बढ्दो', 'Ascending')}</CBtn>
      <CBtn color="#f97316" onClick={() => demoDir('DOWN')}>↓ {kit.t('घट्दो', 'Descending')}</CBtn>
      <CBtn color="#8b5cf6" onClick={() => { const n = fresh('UP'); setDir('UP'); window.setTimeout(() => scene.current?.demo(sortedIdx(n, 'UP')), 800); }}>🎲</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      <CBtn color={dir === 'UP' ? '#0ea5e9' : '#94a3b8'} onClick={() => { setDir('UP'); fresh('UP'); }}>↑ {kit.t('बढ्दो', 'Ascending')}</CBtn>
      <CBtn color={dir === 'DOWN' ? '#f97316' : '#94a3b8'} onClick={() => { setDir('DOWN'); fresh('DOWN'); }}>↓ {kit.t('घट्दो', 'Descending')}</CBtn>
      <div style={{ fontWeight: 800 }}>{next === 5 ? '🎉' : `${fmt(kit.lang, next)}/${fmt(kit.lang, 5)}`}</div>
      <CBtn color="#8b5cf6" onClick={() => fresh(dir)}>🎲 {kit.t('नयाँ', 'New')}</CBtn>
    </Controls>
  ) : finished ? (
    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 900 }}>🏆 {kit.t(`५ मध्ये ${fmt('ne', score)} एकै पटकमा सही!`, `${score} of 5 perfect!`)}</div><CBtn color="#0ea5e9" onClick={() => { setRound(0); setScore(0); setFinished(false); setDir('UP'); fresh('UP'); }}>↺ {kit.t('फेरि', 'Again')}</CBtn></div>
  ) : (
    <div style={{ fontWeight: 800, fontSize: 18 }}>{dir === 'UP' ? kit.t('सानोदेखि ठूलो क्रममा बेलुन छोऔँ ↑', 'Tap the balloons from smallest to biggest ↑') : kit.t('ठूलोदेखि सानो क्रममा बेलुन छोऔँ ↓', 'Tap the balloons from biggest to smallest ↓')}</div>
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
