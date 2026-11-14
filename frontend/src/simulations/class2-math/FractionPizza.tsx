/**
 * Lesson 12 · Fraction (भिन्न)
 * Fraction Pizza — cut a pizza into equal slices, shade some, read the fraction (½, ⅓, ¼, ¾ …).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const NAMES: Record<string, [string, string]> = { '1/2': ['आधा', 'one half'], '1/3': ['एक तिहाइ', 'one third'], '1/4': ['एक चौथाइ', 'one quarter'], '2/4': ['आधा', 'two quarters = one half'], '3/4': ['तीन चौथाइ', 'three quarters'], '2/3': ['दुई तिहाइ', 'two thirds'], '4/4': ['पूरा', 'whole'] };
const Frac: React.FC<{ n: number; d: number; size?: number }> = ({ n, d, size = 34 }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, fontWeight: 900, fontSize: size, verticalAlign: 'middle' }}>
    <span style={{ borderBottom: '3px solid currentColor', padding: '0 6px 2px' }}>{n}</span><span style={{ paddingTop: 2 }}>{d}</span>
  </span>
);

export const FractionPizza: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L12-01', chapter: 12, titleNp: 'भिन्न पिज्जा', titleEn: 'Fraction Pizza' });
  const [parts, setParts] = useState(4);
  const [shaded, setShaded] = useState<number[]>([]);
  const [li, setLi] = useState(0);
  const scene = useRef<{ build: (parts: number, shaded: number[]) => void } | null>(null);
  const live = useRef({ mode: kit.mode, toggle: (_i: number) => {} });
  live.current.mode = kit.mode;

  useStage(kit.stageRef, (ctx) => {
    const root = new THREE.Group(); root.position.y = 0.2; ctx.scene.add(root);
    const plate = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.25, 48), mat('#f8fafc', 0.3))); plate.position.y = -0.1; ctx.scene.add(plate);
    let slices: THREE.Mesh[] = [];
    const build = (n: number, sh: number[]) => {
      [...root.children].forEach((c) => root.remove(c)); slices = [];
      const gapA = n === 1 ? 0 : 0.035;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2 + gapA, len = (1 / n) * Math.PI * 2 - gapA * 2;
        const isShaded = sh.includes(i);
        const m = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.5, 40, 1, false, a0, len), mat(isShaded ? '#ef4444' : '#fcd34d', 0.55)));
        m.position.y = 0.25; m.userData.slice = i;
        const top = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.05, 36, 1, false, a0 + 0.04, len - 0.08), mat(isShaded ? '#dc2626' : '#fbbf24', 0.5)); top.position.y = 0.52; m.add(top); top.position.y = 0.27;
        for (let k = 0; k < 4; k++) { const ang = a0 + len * (0.2 + 0.2 * k); const topping = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), mat(isShaded ? '#fecaca' : '#b91c1c', 0.6)); topping.scale.y = 0.35; topping.position.set(Math.sin(ang) * (1.4 + k * 0.7), 0.3, Math.cos(ang) * (1.4 + k * 0.7)); m.add(topping); }
        root.add(m); slices.push(m);
        if (isShaded) { ctx.tween(300, (t) => { m.position.y = 0.25 + Math.sin(t * Math.PI) * 0.4; }); }
      }
    };
    scene.current = { build };
    ctx.onTap(() => slices, (hit) => { if (hit && live.current.mode !== 'LEARN') live.current.toggle(hit.object.userData.slice ?? hit.object.parent?.userData.slice); });
    build(4, []);
    return () => { scene.current = null; };
  }, [], { camera: [0, 10, 8], target: [0, 0, 0], minDistance: 6, maxDistance: 18, ground: null, sky: 0xfff7ed });

  const apply = (p: number, s: number[]) => { setParts(p); setShaded(s); scene.current?.build(p, s); };
  live.current.toggle = (i) => {
    if (i === undefined) return; const s = shaded.includes(i) ? shaded.filter((x) => x !== i) : [...shaded, i];
    apply(parts, s); kit.tap(); const key = `${s.length}/${parts}`; const nm = NAMES[key]; if (nm && s.length) kit.say(`${nm[0]}`, `${nm[1]}`);
  };
  const LEARN_STEPS: [number, number[]][] = [[1, [0]], [2, []], [2, [0]], [4, [0]], [4, [0, 1]], [4, [0, 1, 2]], [3, [0]], [3, [0, 1]]];
  useEffect(() => {
    if (kit.mode === 'LEARN') { const [p, s] = LEARN_STEPS[li % LEARN_STEPS.length]; apply(p, s); const key = `${s.length}/${p}`; const nm = s.length === p && p === 1 ? ['पूरा पिज्जा', 'the whole pizza'] : NAMES[key] || ['', '']; kit.say(s.length ? `${s.length}/${p} — ${nm[0]}` : `पिज्जालाई ${p} बराबर भागमा काटियो`, s.length ? `${s.length}/${p} — ${nm[1]}` : `The pizza is cut into ${p} equal parts`); }
    else if (kit.mode === 'PLAY') { apply(4, []); kit.say('टुक्रा छोएर रङ्ग लगाऔँ।', 'Tap slices to shade them.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const p = [2, 3, 4][rnd(0, 2)]; const s = rnd(1, p - (p === 2 ? 1 : 1)); const idx = shuffle(Array.from({ length: p }, (_, k) => k), i + 3).slice(0, s); return { p, s, idx }; }), []);
  const questions: (QuizQuestion & { p: number; idx: number[] })[] = data.map((d) => {
    const ans = `${d.s}/${d.p}`;
    const wrong = shuffle([`${d.p - d.s || 1}/${d.p}`, `${d.s}/${d.p + 1}`, `${d.p}/${d.s + 1}`, `${d.s + 1}/${d.p}`].filter((v) => v !== ans).filter((v) => { const [n, m] = v.split('/').map(Number); return n < m; }), d.p * 7 + d.s).slice(0, 2);
    const opts = shuffle([ans, ...wrong], d.p + d.s * 5);
    return { np: 'कति भाग रङ्ग लगाइएको छ?', en: 'What fraction is shaded?', p: d.p, idx: d.idx, answer: ans, options: opts.map((v) => { const [n, m] = v.split('/').map(Number); return { key: v, label: <Frac n={n} d={m} size={30} /> }; }) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 18px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <Frac n={shaded.length} d={parts} size={42} />
      {NAMES[`${shaded.length}/${parts}`] && <div style={{ fontSize: 15, fontWeight: 800, color: '#64748b' }}>{kit.t(NAMES[`${shaded.length}/${parts}`][0], NAMES[`${shaded.length}/${parts}`][1])}</div>}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('भिन्न = बराबर भागमध्ये केही भाग', 'A fraction is some of the equal parts')}</div>
      <CBtn color="#16a34a" onClick={() => { kit.star(); setLi(li + 1); }}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      <b>{kit.t('बराबर भाग', 'Equal parts')}:</b>{[2, 3, 4, 6].map((p) => <CBtn key={p} color={p === parts ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 52 }} onClick={() => apply(p, [])}>{fmt(kit.lang, p)}</CBtn>)}
      <CBtn color="#f59e0b" onClick={() => apply(parts, [])}>↺</CBtn>
    </Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.p, q.idx)} />
  );
  void ease;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
