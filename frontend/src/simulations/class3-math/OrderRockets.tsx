/**
 * Lesson 5 · Ascending and descending order (बढ्दो र घट्दो क्रम)
 * Order the Rockets — tap rockets from the smallest to the biggest (ascending) or biggest to smallest (descending).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { big } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
const COL = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9'];
const nums = (n = 5) => { const s = new Set<number>(); while (s.size < n) s.add(rnd(1200, 98000)); return Array.from(s); };

export const OrderRockets: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L5-01', chapter: 5, titleNp: 'रकेट मिलाऔँ', titleEn: 'Order the Rockets' });
  const [vals, setVals] = useState<number[]>(() => nums());
  const [asc, setAsc] = useState(true);
  const [picked, setPicked] = useState<number[]>([]);
  const [seed, setSeed] = useState(0);
  const scene = useRef<{ set: (v: number[]) => void; place: (i: number, k: number) => void } | null>(null);
  const live = useRef({ tap: (_i: number) => {} });

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    let rk: THREE.Group[] = [];
    const set = (v: number[]) => {
      g.clear(); rk = [];
      v.forEach((n, i) => {
        const r = new THREE.Group(); r.position.set((i - 2) * 3.3, 0, -2.2); r.userData.i = i;
        const body = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.6, 24), mat(COL[i], 0.4))); body.position.y = 1.9; r.add(body);
        const nose = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.1, 24), mat('#f8fafc', 0.4))); nose.position.y = 3.75; r.add(nose);
        [0, 1, 2].forEach((k) => { const f = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.7), mat('#1f2937', 0.5))); const a = (k / 3) * Math.PI * 2; f.position.set(Math.cos(a) * 0.85, 1, Math.sin(a) * 0.85); f.rotation.y = -a; r.add(f); });
        const t = textSprite(n.toLocaleString('en-US'), 2.1, { px: 64, w: 256, h: 112, bg: '#ffffff', border: COL[i] }); t.position.y = 5.1; r.add(t);
        g.add(r); rk.push(r); r.scale.setScalar(0.01); ctx.tween(300 + i * 80, (k) => r.scale.setScalar(Math.max(0.01, k)), undefined, ease.back);
      });
      const base = shadowed(new THREE.Mesh(new THREE.BoxGeometry(18, 0.12, 2.4), mat('#cbd5e1', 0.8))); base.position.set(0, 0.06, 3.4); g.add(base);
    };
    const place = (i: number, k: number) => { const r = rk[i]; if (!r) return; const p0 = r.position.clone(); ctx.tween(700, (t) => { r.position.set(p0.x + ((k - 2) * 3.3 - p0.x) * t, p0.y + Math.sin(t * Math.PI) * 2.5, p0.z + (3.4 - p0.z) * t); }, undefined, ease.inOut); r.scale.setScalar(0.8); };
    ctx.onTap(() => rk, (hit) => { if (!hit) return; let o: THREE.Object3D | null = hit.object; while (o && o.userData.i === undefined) o = o.parent; if (o) live.current.tap(o.userData.i); });
    scene.current = { set, place }; set(vals);
    return () => { scene.current = null; };
  }, [], { camera: [0, 7, 15], target: [0, 2.4, 0.5], minDistance: 9, maxDistance: 24, ground: 0xe0f2fe });

  const fresh = (a: boolean) => { const v = nums(); setVals(v); setPicked([]); setAsc(a); scene.current?.set(v); kit.say(a ? 'सबैभन्दा सानो रकेटबाट सुरु गरौँ' : 'सबैभन्दा ठूलो रकेटबाट सुरु गरौँ', a ? 'Start with the smallest rocket' : 'Start with the biggest rocket'); };
  useEffect(() => { if (kit.mode === 'PLAY') fresh(rnd(0, 1) === 0); else if (kit.mode === 'LEARN') fresh(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode, seed]);

  live.current.tap = (i) => {
    if (kit.mode !== 'PLAY' || picked.includes(i)) return;
    const left = vals.map((v, j) => ({ v, j })).filter((x) => !picked.includes(x.j)).sort((a, b) => (asc ? a.v - b.v : b.v - a.v));
    if (left[0].j === i) { scene.current?.place(i, picked.length); const np = [...picked, i]; setPicked(np); kit.tap(); if (np.length === vals.length) { kit.good(); kit.star(); window.setTimeout(() => setSeed((s) => s + 1), 1800); } }
    else kit.oops(asc ? 'पहिले सबैभन्दा सानो छोऔँ' : 'पहिले सबैभन्दा ठूलो छोऔँ', asc ? 'Pick the smallest one left' : 'Pick the biggest one left');
  };
  const demo = () => { const order = vals.map((v, j) => ({ v, j })).sort((a, b) => (asc ? a.v - b.v : b.v - a.v)); setPicked([]); scene.current?.set(vals); order.forEach((x, k) => window.setTimeout(() => { scene.current?.place(x.j, k); setPicked((p) => [...p, x.j]); kit.tap(); }, 700 + k * 900)); kit.say(asc ? 'सानोदेखि ठूलो — बढ्दो क्रम' : 'ठूलोदेखि सानो — घट्दो क्रम', asc ? 'Smallest to biggest — ascending order' : 'Biggest to smallest — descending order'); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const v = nums(); const asc2 = i % 3 === 0; const s = [...v].sort((a, b) => a - b); const k = i % 4;
    if (k === 0) return { kind: 'list', v, asc: asc2, right: asc2 ? s : [...s].reverse() };
    if (k === 1) return { kind: 'min', v }; if (k === 2) return { kind: 'max', v }; return { kind: 'list', v, asc: !asc2, right: !asc2 ? s : [...s].reverse() };
  }), []);
  const questions: QuizQuestion[] = data.map((d: any, i) => {
    const fmtL = (a: number[]) => a.map((x) => big(kit.lang, x)).join(', ');
    const three = (target: number): number[] => shuffle(Array.from(new Set<number>([target, ...(d.v as number[]).filter((x) => x !== target).slice(0, 2)])), i);
    if (d.kind === 'min') { const t = Math.min(...(d.v as number[])); return { np: 'सबैभन्दा सानो सङ्ख्या कुन हो?', en: 'Which is the smallest number?', answer: String(t), options: three(t).map((x) => ({ key: String(x), label: big(kit.lang, x) })) }; }
    if (d.kind === 'max') { const t = Math.max(...(d.v as number[])); return { np: 'सबैभन्दा ठूलो सङ्ख्या कुन हो?', en: 'Which is the greatest number?', answer: String(t), options: three(t).map((x) => ({ key: String(x), label: big(kit.lang, x) })) }; }
    const r: number[] = d.right;
    const lists = shuffle([r, [r[1], r[0], ...r.slice(2)], [...r.slice(0, 3), r[4], r[3]]], i + 11);
    return { np: d.asc ? 'कुन सूची बढ्दो क्रममा छ?' : 'कुन सूची घट्दो क्रममा छ?', en: d.asc ? 'Which list is in ascending order?' : 'Which list is in descending order?', answer: String(lists.findIndex((l) => l.join() === r.join())), options: lists.map((l, j) => ({ key: String(j), label: fmtL(l) })) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 900 }}>{asc ? kit.t('⬆ बढ्दो क्रम (सानो → ठूलो)', '⬆ Ascending (small → big)') : kit.t('⬇ घट्दो क्रम (ठूलो → सानो)', '⬇ Descending (big → small)')}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><CBtn color={asc ? '#0ea5e9' : '#94a3b8'} onClick={() => { setAsc(true); setPicked([]); scene.current?.set(vals); }}>⬆ {kit.t('बढ्दो', 'Ascending')}</CBtn><CBtn color={!asc ? '#0ea5e9' : '#94a3b8'} onClick={() => { setAsc(false); setPicked([]); scene.current?.set(vals); }}>⬇ {kit.t('घट्दो', 'Descending')}</CBtn><CBtn color="#16a34a" onClick={demo}>▶ {kit.t('मिलाएर देखाऊ', 'Show me')}</CBtn><CBtn color="#8b5cf6" onClick={() => { kit.star(); setSeed(seed + 1); }}>🎲</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('रकेट छोएर मिलाऔँ', 'Tap the rockets in order')} · {picked.length}/{vals.length}</div><CBtn color="#8b5cf6" onClick={() => setSeed(seed + 1)}>🎲</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
