/**
 * Chapter 11 · Subtraction of numbers up to 20 (२० सम्मका सङ्ख्याको घटाउ)
 * Sim 1: Fly-Away Birds — birds sit on a garden wall; tap a bird and it flies away, so the child SEES taking away.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, QuizPanel, Controls, CBtn, useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { bird, tree, mat, shadowed, PALETTE } from '../class1-math-kit/models';
import { enName, npName, toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const MISSIONS = [{ s: 12, k: 3 }, { s: 15, k: 5 }, { s: 18, k: 6 }, { s: 20, k: 8 }, { s: 14, k: 4 }];

export const FlyAwayBirds: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH11-01', chapter: 11, titleNp: 'चरा उडे! (२० सम्मको घटाउ)', titleEn: 'Fly-Away Birds (Take away up to 20)' });
  const [start, setStart] = useState(15);
  const [taken, setTaken] = useState(0);
  const [mi, setMi] = useState(0);
  const [done, setDone] = useState(false);
  const scene = useRef<{ set: (n: number) => void; flyMany: (k: number) => void } | null>(null);
  const live = useRef({ mode: kit.mode, onFly: () => {} });
  live.current.mode = kit.mode;
  live.current.onFly = () => setTaken((t) => t + 1);

  useStage(kit.stageRef, (ctx) => {
    const wall = shadowed(new THREE.Mesh(new THREE.BoxGeometry(11, 0.7, 8), mat('#d6b98c', 0.9)));
    wall.position.y = 0.35; ctx.scene.add(wall);
    const t = tree(); t.position.set(-8.5, 0, -4); ctx.scene.add(t);
    const t2 = tree(); t2.position.set(8.5, 0, -5); t2.scale.setScalar(0.85); ctx.scene.add(t2);
    const flock = new THREE.Group(); ctx.scene.add(flock);
    const slot = (i: number) => new THREE.Vector3(((i % 5) - 2) * 2, 0.7, Math.floor(i / 5) * 1.7 - 2.6);
    const set = (n: number) => {
      [...flock.children].forEach((c) => flock.remove(c));
      for (let i = 0; i < n; i++) {
        const b = bird(PALETTE[i % PALETTE.length]);
        b.position.copy(slot(i)); b.rotation.y = -0.5; b.scale.setScalar(1.5); b.userData.isBird = true; b.userData.i = i;
        flock.add(b);
      }
    };
    const fly = (b: THREE.Object3D) => {
      if (b.userData.flying) return;
      b.userData.flying = true;
      const p0 = b.position.clone();
      const dir = (Math.random() - 0.5) * 8;
      ctx.tween(1500, (k) => {
        b.position.set(p0.x + dir * k, p0.y + 7 * k + Math.sin(k * 14) * 0.2, p0.z - 5 * k);
        b.rotation.y = -0.5 - k * 0.6;
        (b.userData.wings || []).forEach((w: THREE.Object3D, j: number) => { w.rotation.x = Math.sin(k * 60 + j) * 0.9; });
        b.scale.setScalar(1.5 * (1 - 0.6 * k));
      }, () => flock.remove(b), ease.inOut);
    };
    const flyMany = (k: number) => {
      const sitting = flock.children.filter((c) => !c.userData.flying).slice(-k);
      sitting.forEach((b, i) => window.setTimeout(() => { fly(b); live.current.onFly(); }, 350 * (i + 1)));
    };
    scene.current = { set, flyMany };
    set(15);
    ctx.onFrame((_dt, time) => flock.children.forEach((b) => { if (!b.userData.flying) b.position.y = 0.7 + Math.abs(Math.sin(time * 2 + b.userData.i)) * 0.04; }));
    ctx.onTap(() => flock.children, (hit) => {
      if (!hit || live.current.mode === 'CHALLENGE') return;
      let o: THREE.Object3D | null = hit.object;
      while (o && !o.userData.isBird) o = o.parent;
      if (!o || o.userData.flying) return;
      fly(o); live.current.onFly();
    });
    return () => { scene.current = null; };
  }, [], { camera: [0, 9.5, 11.5], target: [0, 0.6, -0.6], minDistance: 6, maxDistance: 22 });

  const mission = MISSIONS[mi];
  // Learn: set up the mission. Play: set up the chosen number.
  useEffect(() => {
    if (kit.mode === 'LEARN') {
      setStart(mission.s); setTaken(0); setDone(false); scene.current?.set(mission.s);
      kit.say(`${npName(mission.s)} वटा चरा पर्खालमा बसे। ${npName(mission.k)} वटा चरालाई छोएर उडाऔँ।`, `${mission.s} birds sat on the wall. Tap ${mission.k} birds to make them fly away.`);
    } else if (kit.mode === 'PLAY') {
      setTaken(0); scene.current?.set(start);
      kit.say('कुनै पनि चरालाई छोऔँ र उडेको हेरौँ।', 'Tap any bird and watch it fly away.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, mi]);
  useEffect(() => { if (kit.mode === 'PLAY') { setTaken(0); scene.current?.set(start); } /* eslint-disable-next-line */ }, [start]);
  useEffect(() => {
    if (kit.mode === 'LEARN' && !done && taken >= mission.k) {
      setDone(true); kit.good(`${mission.s} − ${mission.k} = ${mission.s - mission.k}`, `${mission.s} − ${mission.k} = ${mission.s - mission.k}`); kit.star();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taken]);

  const data = useMemo(() => Array.from({ length: 6 }, () => {
    const s = rnd(11, 20), k = rnd(2, Math.min(9, s - 1)), a = s - k;
    const opts = shuffle([a, a + 1, a - 1 < 0 ? a + 2 : a - 1].filter((v, i, arr) => arr.indexOf(v) === i));
    return { s, k, a, opts };
  }), []);
  const questions: (QuizQuestion & { s: number; k: number })[] = data.map((d) => ({
    np: `${npName(d.s)} वटा चरा थिए। ${npName(d.k)} वटा उडे। कति बाँकी रहे?`,
    en: `There were ${d.s} birds. ${d.k} flew away. How many are left?`,
    answer: String(d.a), s: d.s, k: d.k,
    options: d.opts.map((v) => ({ key: String(v), label: kit.lang === 'ne' ? toNp(v) : String(v) })),
  }));

  const left = start - taken;
  const num = (n: number) => (kit.lang === 'ne' ? toNp(n) : String(n));
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.92)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', fontSize: 34, fontWeight: 900 }}>
      {num(start)} − {num(taken)} = <span style={{ color: '#16a34a' }}>{num(left)}</span>
    </div>
  );

  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontSize: 18, fontWeight: 800, flex: 1, minWidth: 220 }}>
        {kit.t(`${npName(mission.s)} वटा चरा। ${npName(mission.k)} वटा उडाऔँ।`, `${mission.s} birds. Make ${mission.k} fly away.`)} {done && '✅'}
      </div>
      <CBtn color="#f59e0b" onClick={() => { setTaken(0); setDone(false); scene.current?.set(mission.s); }}>↺ {kit.t('फेरि', 'Again')}</CBtn>
      <CBtn color="#16a34a" disabled={!done} onClick={() => setMi((mi + 1) % MISSIONS.length)}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      <span style={{ fontWeight: 800 }}>{kit.t('सुरुमा कति चरा?', 'How many birds to start?')}</span>
      {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((n) => (
        <CBtn key={n} color={n === start ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 48, padding: '8px 10px' }} onClick={() => setStart(n)}>{num(n)}</CBtn>
      ))}
      <CBtn color="#f59e0b" onClick={() => { setTaken(0); scene.current?.set(start); }}>↺</CBtn>
    </Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { setStart(q.s); setTaken(0); scene.current?.set(q.s); window.setTimeout(() => scene.current?.flyMany(q.k), 600); }} />
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
