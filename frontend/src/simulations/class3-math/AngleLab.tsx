/**
 * Lesson 10 · Angles (कोण)
 * Angle Lab — open and close two arms around a corner; compare with a set-square right angle: smaller, right or larger.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
const kindOf = (a: number) => (a === 90 ? 'right' : a < 90 ? 'small' : 'large');
const NAME = { right: ['समकोण', 'Right angle', '#16a34a'], small: ['समकोणभन्दा सानो कोण', 'Smaller than a right angle', '#0ea5e9'], large: ['समकोणभन्दा ठूलो कोण', 'Larger than a right angle', '#f97316'] } as const;

export const AngleLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L10-01', chapter: 10, titleNp: 'कोण प्रयोगशाला', titleEn: 'Angle Lab' });
  const [a, setA] = useState(90);
  const [target, setTarget] = useState<string | null>(null);
  const scene = useRef<{ set: (deg: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const fixed = shadowed(new THREE.Mesh(new THREE.BoxGeometry(7, 0.3, 0.45), mat('#475569', 0.5))); fixed.geometry.translate(3.5, 0, 0); fixed.position.y = 0.3; ctx.scene.add(fixed);
    const arm = shadowed(new THREE.Mesh(new THREE.BoxGeometry(7, 0.3, 0.45), mat('#ef4444', 0.5))); arm.geometry.translate(3.5, 0, 0); arm.position.y = 0.45; ctx.scene.add(arm);
    const knob = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 24), mat('#facc15', 0.4))); knob.position.y = 0.4; ctx.scene.add(knob);
    const sq = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ color: '#22c55e', transparent: true, opacity: 0.28, side: THREE.DoubleSide })); sq.rotation.x = -Math.PI / 2; sq.position.set(1.5, 0.05, -1.5); ctx.scene.add(sq);
    const mk = (col: string) => new THREE.Mesh(new THREE.CircleGeometry(2.2, 48, 0, 0.01), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75, side: THREE.DoubleSide })); let sec = mk('#0ea5e9'); sec.rotation.x = -Math.PI / 2; sec.position.y = 0.08; ctx.scene.add(sec);
    const set = (deg: number) => {
      const th = (deg * Math.PI) / 180; arm.rotation.y = th;
      ctx.scene.remove(sec); sec.geometry.dispose(); sec = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48, 0, Math.max(0.01, th)), new THREE.MeshBasicMaterial({ color: deg === 90 ? '#22c55e' : deg < 90 ? '#38bdf8' : '#fb923c', transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
      sec.rotation.x = -Math.PI / 2; sec.position.y = 0.08; ctx.scene.add(sec);
    };
    scene.current = { set }; set(90);
    return () => { scene.current = null; };
  }, [], { camera: [3, 11, 8], target: [2.5, 0, -2], minDistance: 7, maxDistance: 22, ground: 0xfef9c3 });

  const update = (deg: number, speak = false) => { const d = Math.max(15, Math.min(165, deg)); setA(d); scene.current?.set(d); if (speak) { const k = kindOf(d); kit.say(NAME[k][0], NAME[k][1]); } };
  const newTarget = () => { const t = ['right', 'small', 'large'][rnd(0, 2)]; setTarget(t); update(rnd(0, 1) ? 30 : 150); kit.say(`यस्तो कोण बनाऔँ: ${NAME[t as 'right'][0]}`, `Make: ${NAME[t as 'right'][1]}`); };
  useEffect(() => { if (kit.mode === 'LEARN') update(90, true); else if (kit.mode === 'PLAY') newTarget(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const check = () => { if (kindOf(a) === target) { kit.good(); kit.star(); window.setTimeout(newTarget, 1200); } else kit.oops('हरियो वर्गसँग तुलना गरौँ', 'Compare with the green set-square corner'); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const k = (['right', 'small', 'large'] as const)[i % 3]; const deg = k === 'right' ? 90 : k === 'small' ? [30, 45, 60, 75][rnd(0, 3)] : [105, 120, 135, 150][rnd(0, 3)]; return { deg, k }; }), []);
  const questions: (QuizQuestion & { deg: number })[] = data.map((d) => ({ deg: d.deg, np: 'यो कस्तो कोण हो?', en: 'What kind of angle is this?', answer: d.k, options: (['right', 'small', 'large'] as const).map((k) => ({ key: k, label: kit.t(NAME[k][0], NAME[k][1]) })) }));

  const k = kindOf(a);
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: `3px solid ${NAME[k][2]}`, textAlign: 'center', maxWidth: 340 }}>
      {kit.mode === 'PLAY' && target && <div style={{ fontSize: 15, fontWeight: 900 }}>🎯 {kit.t(NAME[target as 'right'][0], NAME[target as 'right'][1])}</div>}
      <div style={{ fontSize: 30, fontWeight: 900 }}>{fmt(kit.lang, a)}°</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: NAME[k][2] }}>{kit.t(NAME[k][0], NAME[k][1])}</div>
    </div>
  );
  const panel = kit.mode === 'CHALLENGE' ? <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => update(q.deg)} /> : (
    <Controls>
      <CBtn color="#ef4444" onClick={() => update(a - 15, kit.mode === 'LEARN')}>◀ {kit.t('बन्द', 'Close')}</CBtn><CBtn color="#ef4444" onClick={() => update(a + 15, kit.mode === 'LEARN')}>{kit.t('खोल', 'Open')} ▶</CBtn>
      {kit.mode === 'LEARN' && [[45, 'सानो', 'Small'], [90, 'समकोण', 'Right'], [135, 'ठूलो', 'Large']].map(([v, np, en]) => <CBtn key={v as number} color="#8b5cf6" onClick={() => update(v as number, true)}>{kit.t(np as string, en as string)}</CBtn>)}
      {kit.mode === 'PLAY' && <><CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn><CBtn color="#8b5cf6" onClick={newTarget}>🎲</CBtn></>}
    </Controls>
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
