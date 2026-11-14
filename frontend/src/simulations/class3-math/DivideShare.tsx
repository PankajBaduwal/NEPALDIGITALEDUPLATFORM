/**
 * Lesson 15 · Division (भाग)
 * Sharing Plates — share sweets equally among plates; what is left over is the remainder.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, ball } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
const COL = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6', '#a16207'];

export const DivideShare: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L15-01', chapter: 15, titleNp: 'थालमा बराबर बाँडौँ (भाग)', titleEn: 'Sharing Plates (Division)' });
  const [n, setN] = useState(14);
  const [k, setK] = useState(4);
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);
  const scene = useRef<{ set: (n: number, k: number) => void; share: (done: () => void) => void } | null>(null);
  const q = Math.floor(n / k), r = n % k;

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g); let sweets: THREE.Object3D[] = []; let plates: THREE.Vector3[] = []; let N = 0, K = 0;
    const slot = (p: THREE.Vector3, idx: number) => new THREE.Vector3(p.x + ((idx % 3) - 1) * 0.55, 0.55 + Math.floor(idx / 3) * 0.55, p.z + (Math.floor(idx / 3) % 2 ? 0.25 : -0.25));
    const set = (nn: number, kk: number) => {
      g.clear(); sweets = []; plates = []; N = nn; K = kk;
      for (let i = 0; i < kk; i++) { const x = (i - (kk - 1) / 2) * 2.3; const p = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(1, 0.8, 0.18, 28), mat(COL[i], 0.4))); p.position.set(x, 0.09, -1.2); g.add(p); plates.push(new THREE.Vector3(x, 0, -1.2)); }
      for (let i = 0; i < nn; i++) { const s = ball(COL[(i * 3) % 9], 0.26); s.position.set(-5 + (i % 8) * 0.6, 0.3 + Math.floor(i / 8) * 0.56, 3.2); g.add(s); sweets.push(s); }
      const tray = shadowed(new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 2.4), mat('#fde68a', 0.7))); tray.position.set(-2.8, 0.06, 3.5); g.add(tray);
    };
    const share = (done: () => void) => {
      const per = new Array(K).fill(0); const rounds = Math.floor(N / K); const total = rounds * K; let i = 0;
      const next = () => {
        if (i >= total) { done(); return; }
        const s = sweets[i]; const pi = i % K; const to = slot(plates[pi], per[pi]++); const from = s.position.clone(); i += 1;
        ctx.tween(260, (t) => { s.position.set(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t + Math.sin(t * Math.PI) * 1.3, from.z + (to.z - from.z) * t); }, next, ease.inOut);
      };
      next();
    };
    scene.current = { set, share }; set(14, 4);
    return () => { scene.current = null; };
  }, [], { camera: [0, 8.5, 11], target: [0, 0.5, 0.8], minDistance: 7, maxDistance: 22, ground: 0xfef9c3 });

  const apply = (nn: number, kk: number) => { setN(nn); setK(kk); setShared(false); scene.current?.set(nn, kk); };
  const go = () => { if (busy) return; if (shared) { apply(n, k); return; } setBusy(true); kit.say(`${n} ÷ ${k}: एक एक गर्दै बराबर बाँडौँ`, `${n} ÷ ${k}: deal them out one by one`); scene.current?.share(() => { setBusy(false); setShared(true); kit.say(`हरेक थालमा ${q}, बाँकी ${r}`, `${q} on each plate, ${r} left over`); kit.star(); }); };
  const fresh = () => apply(rnd(7, 35), rnd(2, 6));
  useEffect(() => { if (kit.mode !== 'CHALLENGE') fresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const kk = rnd(2, 6); return { n: rnd(2, 8) * kk + (i % 2 ? rnd(1, kk - 1) : 0), k: kk, kind: i % 3 }; }), []);
  const questions: (QuizQuestion & { d: { n: number; k: number } })[] = data.map((d, i) => {
    const qq = Math.floor(d.n / d.k), rr = d.n % d.k;
    if (d.kind === 0) return { d, np: `${d.n} ÷ ${d.k} = ? (हरेक थालमा कति?)`, en: `${d.n} sweets shared among ${d.k} plates — how many on each?`, answer: String(qq), options: near(qq, i + 1, [1, -1, 2, -2], 1).map((x) => ({ key: String(x), label: fmt(kit.lang, x) })) };
    if (d.kind === 1) return { d, np: `${d.n} ÷ ${d.k} मा कति बाँकी रहन्छ?`, en: `${d.n} ÷ ${d.k}: how many are left over?`, answer: String(rr), options: near(rr, i + 5, [1, -1, 2, d.k - 1], 0).filter((x) => x < d.k).map((x) => ({ key: String(x), label: fmt(kit.lang, x) })) };
    return { d, np: `${d.k} × ${qq} + ${rr} = ?`, en: `${d.k} × ${qq} + ${rr} = ?`, answer: String(d.n), options: near(d.n, i + 8, [d.k, -d.k, 1, -1]).map((x) => ({ key: String(x), label: fmt(kit.lang, x) })) };
  });
  questions.forEach((qq) => { if (!qq.options.some((o) => o.key === qq.answer)) qq.options.unshift({ key: qq.answer, label: fmt(kit.lang, qq.answer) }); if (qq.options.length < 2) qq.options.push({ key: '99', label: fmt(kit.lang, 99) }); });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #22c55e', textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{fmt(kit.lang, n)} ÷ {fmt(kit.lang, k)} = {shared ? <>{fmt(kit.lang, q)} <span style={{ fontSize: 14, color: '#ea580c' }}>{kit.t('बाँकी', 'rem')} {fmt(kit.lang, r)}</span></> : '?'}</div>
      {shared && <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(kit.lang, k)} × {fmt(kit.lang, q)} + {fmt(kit.lang, r)} = {fmt(kit.lang, n)}</div>}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('बराबर बाँड्दा नपुगेको बाँकी हुन सक्छ', 'Sharing equally can leave a few over — the remainder')}</div><CBtn color="#16a34a" disabled={busy} onClick={go}>{shared ? '↺' : '▶'} {shared ? kit.t('फेरि', 'Again') : kit.t('बाँडौँ', 'Share')}</CBtn><CBtn color="#8b5cf6" disabled={busy} onClick={fresh}>🎲</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><CBtn color="#f59e0b" disabled={busy} onClick={() => n > 2 && apply(n - 1, k)}>{kit.t('मिठाई', 'Sweets')} −</CBtn><CBtn color="#f59e0b" disabled={busy} onClick={() => n < 40 && apply(n + 1, k)}>{kit.t('मिठाई', 'Sweets')} +</CBtn><CBtn color="#0ea5e9" disabled={busy} onClick={() => k > 2 && apply(n, k - 1)}>{kit.t('थाल', 'Plates')} −</CBtn><CBtn color="#0ea5e9" disabled={busy} onClick={() => k < 9 && apply(n, k + 1)}>{kit.t('थाल', 'Plates')} +</CBtn><CBtn color="#16a34a" disabled={busy} onClick={go}>{shared ? '↺' : '▶'} {kit.t('बाँडौँ', 'Share')}</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q2: any) => apply(q2.d.n, q2.d.k)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
