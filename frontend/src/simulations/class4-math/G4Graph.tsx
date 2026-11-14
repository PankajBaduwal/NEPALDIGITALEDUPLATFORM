/**
 * Class 4 lesson 14 · Bar diagram (स्तम्भ चित्र)
 * Bar Graph Lab — 3D bars; one block stands for 1, 2, 5 or 10; read, build and compare.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Hud, Tip, Props, numQ, mcq } from './h4';

const CATS = [['क्रिकेट', 'Cricket', '#ef4444'], ['फुटबल', 'Football', '#0ea5e9'], ['भलिबल', 'Volleyball', '#eab308'], ['खो-खो', 'Kho-kho', '#22c55e'], ['बास्केटबल', 'Basketball', '#8b5cf6']] as const;
const SCALES = [1, 2, 5, 10];
const mk = (sc: number, n: number) => Array.from({ length: n }, () => sc * rnd(1, 10));
type Api = { set: (vals: number[], sc: number, hi: number) => void };

export const BarGraphLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L14-01', chapter: 14, titleNp: 'स्तम्भ चित्र प्रयोगशाला', titleEn: 'Bar Graph Lab' });
  const [sc, setSc] = useState(5);
  const [vals, setVals] = useState<number[]>([30, 45, 20, 35]);
  const [goal, setGoal] = useState<number[]>([25, 40, 15, 35]);
  const [hi, setHi] = useState(-1);
  const scene = useRef<Api | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const set = (vs: number[], s: number, h: number) => {
      g.clear(); const n = vs.length; const x0 = -((n - 1) * 3) / 2;
      const back = shadowed(new THREE.Mesh(new THREE.BoxGeometry(n * 3 + 3, 0.2, 2.6), mat('#e2e8f0', 0.8))); back.position.set(0, 0.1, 0); g.add(back);
      for (let k = 2; k <= 10; k += 2) { const t = textSprite(String(k * s), 1.1, { px: 40, w: 128, h: 64, bg: null, color: '#334155' }); t.position.set(x0 - 2.2, 0.2 + k * 0.62, 0); g.add(t); const ln = new THREE.Mesh(new THREE.BoxGeometry(n * 3 + 1.5, 0.02, 0.02), mat('#cbd5e1')); ln.position.set(0, 0.2 + k * 0.62 - 0.31, -1.1); g.add(ln); }
      vs.forEach((v, i) => {
        const b = Math.round(v / s); const col = CATS[i][2];
        for (let k = 0; k < b; k++) { const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.58, 1.4), mat(col, 0.5))); m.position.set(x0 + i * 3, 0.5 + k * 0.62, 0); m.userData.bar = i; (m.material as THREE.MeshStandardMaterial).emissive.setHex(h === i ? 0x555555 : 0); g.add(m); }
        const lab = textSprite(kit.lang === 'ne' ? CATS[i][0] : CATS[i][1], 1.9, { px: 44, w: 256, h: 80, bg: null, color: '#0f172a' }); lab.position.set(x0 + i * 3, -0.4, 1.5); g.add(lab);
      });
    };
    ctx.onTap(() => g.children.filter((o) => o.userData.bar !== undefined), (hit) => { if (hit) tapRef.current?.(hit.object.userData.bar); });
    scene.current = { set }; set([30, 45, 20, 35], 5, -1);
    return () => { scene.current = null; };
  }, [], { camera: [0, 7, 15], target: [0, 3.2, 0], minDistance: 8, maxDistance: 26, ground: 0xecfccb });
  const tapRef = useRef<((i: number) => void) | null>(null);

  const put = (vs: number[], s: number, h = -1) => { setVals(vs); setSc(s); setHi(h); scene.current?.set(vs, s, h); };
  tapRef.current = (i: number) => { if (kit.mode === 'LEARN') { put(vals, sc, i); kit.say(`${CATS[i][0]}: ${fmt('ne', vals[i])}`, `${CATS[i][1]}: ${vals[i]}`); } };
  const freshLearn = () => { const s = SCALES[rnd(0, 3)]; put(mk(s, 4), s); kit.say(`१ खण्ड = ${fmt('ne', s)}। स्तम्भ ट्याप गरी मान पढौँ`, `1 block = ${s}. Tap a bar to read its value`); };
  const newGoal = () => { const s = SCALES[rnd(1, 3)]; const gv = mk(s, 4); setGoal(gv); put(gv.map(() => 0), s); kit.say('तालिकाअनुसार स्तम्भ बनाऔँ', 'Build the bars to match the table'); };
  useEffect(() => { if (kit.mode === 'LEARN') freshLearn(); else if (kit.mode === 'PLAY') newGoal(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const bump = (i: number, d: number) => { const v = vals.slice(); v[i] = Math.max(0, Math.min(sc * 10, v[i] + d * sc)); put(v, sc); };
  const check = () => { if (vals.every((v, i) => v === goal[i])) { kit.good(); kit.star(); window.setTimeout(newGoal, 1300); } else kit.oops('केही स्तम्भ मिलेनन्', 'Some bars do not match yet'); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const s = SCALES[i % 4]; return { s, v: mk(s, 4), i }; }), []);
  const questions: (QuizQuestion & { d: { s: number; v: number[] } })[] = data.map((d, i) => {
    const mx = d.v.indexOf(Math.max(...d.v)), mn = d.v.indexOf(Math.min(...d.v)); const a = rnd(0, 1), b = rnd(2, 3);
    if (i % 4 === 0) return { d, ...numQ(`${CATS[a][0]} को स्तम्भ कति देखाउँछ?`, `What value does the ${CATS[a][1]} bar show?`, d.v[a], i, [d.s, -d.s, 2 * d.s, 5, 10], (x) => fmt(kit.lang, x), 1) };
    if (i % 4 === 1) { const q = mcq('सबैभन्दा अग्लो स्तम्भ कुन हो?', 'Which bar is the tallest?', String(mx), [0, 1, 2, 3].filter((x) => x !== mx).map(String), i); return { d, ...q, options: q.options.map((o) => ({ key: o.key, label: kit.lang === 'ne' ? CATS[Number(o.key)][0] : CATS[Number(o.key)][1] })) }; }
    if (i % 4 === 2) return { d, ...numQ(`${CATS[a][0]} र ${CATS[b][0]} को फरक कति?`, `What is the difference between ${CATS[a][1]} and ${CATS[b][1]}?`, Math.abs(d.v[a] - d.v[b]), i + 5, [d.s, -d.s, 2 * d.s, 5, 10], (x) => fmt(kit.lang, x), 0) };
    void mn;
    return { d, ...numQ('सबै स्तम्भको जम्मा कति?', 'What is the total of all the bars?', d.v.reduce((s2, x) => s2 + x, 0), i + 2, [10, -10, 5, -5, 20], (x) => fmt(kit.lang, x), 1) };
  });

  const hud = kit.mode === 'CHALLENGE' ? <Hud color="#22c55e"><div style={{ fontSize: 15, fontWeight: 900 }}>{kit.t(`१ खण्ड = ${fmt('ne', sc)}`, `1 block = ${sc}`)}</div></Hud> : (
    <Hud color="#22c55e">
      <div style={{ fontSize: 15, fontWeight: 900 }}>{kit.t(`१ खण्ड = ${fmt('ne', sc)}`, `1 block = ${sc}`)}</div>
      {kit.mode === 'PLAY' ? <div style={{ fontSize: 13, fontWeight: 800 }}>🎯 {CATS.slice(0, 4).map((c, i) => `${kit.t(c[0], c[1])} ${fmt(kit.lang, goal[i])}`).join(' · ')}</div>
        : <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{hi >= 0 ? `${kit.t(CATS[hi][0], CATS[hi][1])} = ${fmt(kit.lang, vals[hi])}` : kit.t('स्तम्भ ट्याप गर', 'Tap a bar')}</div>}
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('स्तम्भका खण्ड गनेर × मापन', 'Count the blocks and multiply by the scale')}</Tip><CBtn color="#16a34a" onClick={freshLearn}>🎲 {kit.t('नयाँ', 'New')}</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{CATS.slice(0, 4).map((c, i) => <span key={i} style={{ display: 'inline-flex', gap: 4 }}><CBtn color={c[2]} style={{ minWidth: 44 }} onClick={() => bump(i, -1)}>−</CBtn><CBtn color={c[2]} onClick={() => bump(i, 1)}>+ {kit.t(c[0], c[1])}</CBtn></span>)}<CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => put(q.d.v, q.d.s)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
