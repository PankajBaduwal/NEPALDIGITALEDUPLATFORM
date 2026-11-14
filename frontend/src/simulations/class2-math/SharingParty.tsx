/**
 * Lesson 17 · Division (भाग)
 * Sharing Party — share sweets equally among friends: 12 ÷ 3 = 4.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { critter, CritterKind, ball, mat, shadowed, PALETTE } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const KINDS: CritterKind[] = ['bear', 'rabbit', 'cat', 'dog', 'mouse'];
const COLORS = ['#a16207', '#f9a8d4', '#fb923c', '#d6b88c', '#94a3b8'];
const LEARN: [number, number][] = [[12, 3], [10, 2], [15, 5], [8, 4], [18, 3]];

export const SharingParty: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L17-01', chapter: 17, titleNp: 'बराबर बाँडौँ (भाग)', titleEn: 'Sharing Party (Division)' });
  const [friends, setFriends] = useState(3);
  const [each, setEach] = useState(4);
  const [dealt, setDealt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [li, setLi] = useState(0);
  const scene = useRef<{ setup: (k: number, q: number) => void; deal: (k: number, q: number, onEach: (n: number) => void, done: () => void) => void } | null>(null);
  const total = friends * each;

  useStage(kit.stageRef, (ctx) => {
    const root = new THREE.Group(); ctx.scene.add(root);
    let sweets: THREE.Object3D[] = []; let plates: THREE.Vector3[] = [];
    const setup = (k: number, q: number) => {
      [...root.children].forEach((c) => root.remove(c)); sweets = []; plates = [];
      const n = k * q;
      for (let i = 0; i < k; i++) {
        const x = (i - (k - 1) / 2) * 3.4;
        const c = critter(KINDS[i % 5], COLORS[i % 5]); c.scale.setScalar(1.15); c.position.set(x, 0, -2.4); root.add(c);
        const plate = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.1, 0.12, 28), mat('#ffffff', 0.4))); plate.position.set(x, 0.06, 0.6); root.add(plate);
        plates.push(new THREE.Vector3(x, 0.12, 0.6));
      }
      for (let i = 0; i < n; i++) { const s = ball(PALETTE[i % PALETTE.length], 0.3); s.position.set(((i % 8) - 3.5) * 0.7, 0.35 + Math.floor(i / 8) * 0.55, 4.3); root.add(s); sweets.push(s); }
    };
    const deal = (k: number, q: number, onEach: (n: number) => void, done: () => void) => {
      const n = k * q; const per = Array(k).fill(0);
      for (let i = 0; i < n; i++) {
        const s = sweets[n - 1 - i]; const who = i % k; const slot = per[who]++;
        window.setTimeout(() => {
          const p0 = s.position.clone(); const p1 = plates[who].clone().add(new THREE.Vector3(((slot % 3) - 1) * 0.55, 0.3 + Math.floor(slot / 3) * 0.5, ((slot % 2) - 0.5) * 0.4));
          ctx.tween(520, (t) => { s.position.lerpVectors(p0, p1, t); s.position.y += Math.sin(t * Math.PI) * 1.6; }, () => { onEach(i + 1); if (i === n - 1) done(); }, ease.inOut);
        }, i * 420);
      }
    };
    scene.current = { setup, deal };
    setup(3, 4);
    return () => { scene.current = null; };
  }, [], { camera: [0, 7.5, 11.5], target: [0, 1, 0.8], minDistance: 7, maxDistance: 20 });

  const apply = (k: number, q: number) => { setFriends(k); setEach(q); setDealt(0); setBusy(false); scene.current?.setup(k, q); };
  const share = () => {
    if (busy || dealt > 0) return; setBusy(true); kit.say('एकएक गरेर सबैलाई बराबर बाँडौँ।', 'Give one to each friend, again and again.');
    scene.current?.deal(friends, each, (n) => setDealt(n), () => { setBusy(false); kit.good(`${total} ÷ ${friends} = ${each}`, `${total} ÷ ${friends} = ${each}`); kit.star(); });
  };
  useEffect(() => {
    if (kit.mode === 'LEARN') { const [n, k] = LEARN[li % LEARN.length]; apply(k, n / k); kit.say(`${n} वटा मिठाई ${k} जना साथीलाई बराबर बाँडौँ।`, `Share ${n} sweets equally among ${k} friends.`); }
    else if (kit.mode === 'PLAY') { apply(friends, each); kit.say('साथी र मिठाई रोजेर बाँडौँ।', 'Pick friends and sweets, then share.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const k = rnd(2, 5), q = rnd(2, 6); return { k, q, kind: i % 2 === 0 ? 'each' : 'sentence' }; }), []);
  const questions: (QuizQuestion & { k: number; q: number })[] = data.map((d, i) => d.kind === 'each'
    ? { np: `${fmt('ne', d.k * d.q)} मिठाई ${fmt('ne', d.k)} जनालाई बराबर बाँड्दा प्रत्येकले कति पाउँछ?`, en: `${d.k * d.q} sweets shared equally among ${d.k} friends. How many does each get?`, k: d.k, q: d.q, answer: String(d.q), options: numChoices(d.q, i * 3 + 1, [1, -1, 2, -2]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) }
    : { np: `${fmt('ne', d.k * d.q)} ÷ ${fmt('ne', d.k)} = ?`, en: `${d.k * d.q} ÷ ${d.k} = ?`, k: d.k, q: d.q, answer: String(d.q), options: numChoices(d.q, i * 7 + 2, [1, -1, 2, d.k]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 900 }}>{fmt(kit.lang, total)} ÷ {fmt(kit.lang, friends)} = <span style={{ color: dealt === total ? '#16a34a' : '#94a3b8' }}>{dealt === total ? fmt(kit.lang, each) : '?'}</span></div>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#64748b' }}>{kit.t('बाँडेको', 'Shared')}: {fmt(kit.lang, dealt)}/{fmt(kit.lang, total)}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>{dealt === total ? `✅ ${total} ÷ ${friends} = ${each}` : kit.t('बराबर बाँड्नु भनेको भाग गर्नु हो', 'Sharing equally is dividing')}</div>
      <CBtn color="#8b5cf6" disabled={busy || dealt > 0} onClick={share}>🍬 {kit.t('बाँडौँ', 'Share')}</CBtn>
      <CBtn color="#f59e0b" disabled={busy} onClick={() => apply(friends, each)}>↺</CBtn>
      <CBtn color="#16a34a" disabled={busy || dealt < total} onClick={() => setLi(li + 1)}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <div>
      <Controls><b>{kit.t('साथी', 'Friends')}:</b>{[2, 3, 4, 5].map((k) => <CBtn key={k} color={k === friends ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 48 }} disabled={busy} onClick={() => apply(k, each)}>{fmt(kit.lang, k)}</CBtn>)}
        <b>{kit.t('प्रत्येकलाई', 'Each gets')}:</b>{[1, 2, 3, 4, 5, 6].map((q) => <CBtn key={q} color={q === each ? '#8b5cf6' : '#cbd5e1'} style={{ minWidth: 48, color: q === each ? '#fff' : '#1f2937' }} disabled={busy} onClick={() => apply(friends, q)}>{fmt(kit.lang, q)}</CBtn>)}</Controls>
      <div style={{ marginTop: 6 }}><Controls><CBtn color="#16a34a" disabled={busy || dealt > 0} onClick={share}>🍬 {kit.t('बाँडौँ', 'Share')}</CBtn><CBtn color="#f59e0b" disabled={busy} onClick={() => apply(friends, each)}>↺</CBtn></Controls></div>
    </div>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.k, q.q)} />
  );
  void shuffle;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
