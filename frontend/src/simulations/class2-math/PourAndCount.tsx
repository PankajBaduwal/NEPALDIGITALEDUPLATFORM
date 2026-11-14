/**
 * Lesson 1 · Capacity (धारिता)
 * Pour and Count — fill a big jar with a small pitcher and count the pours; compare glasses by pouring into equal cups.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
interface Glass { group: THREE.Group; setLevel: (frac: number) => void; vol: number; r: number; h: number }
const glassMat = new THREE.MeshPhysicalMaterial({ color: '#dbeafe', transparent: true, opacity: 0.28, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false });
const makeGlass = (r: number, h: number, water = '#38bdf8'): Glass => {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, h, 36, 1, true), glassMat); body.position.y = h / 2; group.add(body);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 36), glassMat); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; group.add(floor);
  const w = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.97, r * 0.9, h, 36), new THREE.MeshStandardMaterial({ color: water, transparent: true, opacity: 0.85, roughness: 0.2 })));
  group.add(w);
  const setLevel = (f: number) => { const k = Math.max(0.001, Math.min(1, f)); w.scale.y = k; w.position.y = (h * k) / 2; w.visible = f > 0.002; };
  setLevel(0);
  return { group, setLevel, vol: Math.PI * r * r * h, r, h };
};

export const PourAndCount: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L1-01', chapter: 1, titleNp: 'खन्याऔँ र गनौँ (धारिता)', titleEn: 'Pour and Count (Capacity)' });
  const [k, setK] = useState(5);
  const [pours, setPours] = useState(0);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'FILL' | 'COMPARE'>('FILL');
  const [cmp, setCmp] = useState<{ a: number; b: number; equalized: boolean } | null>(null);
  const [li, setLi] = useState(0);
  const scene = useRef<{ fill: (k: number) => void; pour: (n: number, k: number, done: () => void) => void; compare: (spec: { ra: number; ha: number; rb: number; hb: number }) => number[]; equalize: (done: () => void) => void; mode: (m: 'FILL' | 'COMPARE') => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const table = shadowed(new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 7), mat('#d6a870', 0.85))); table.position.y = -0.2; ctx.scene.add(table);
    // fill view
    const fillG = new THREE.Group(); ctx.scene.add(fillG);
    const small = makeGlass(0.9, 2.1, '#38bdf8'); small.group.position.set(-3.6, 0, 0); fillG.add(small.group);
    let big = makeGlass(1.7, 4.2, '#38bdf8'); big.group.position.set(2.8, 0, 0); fillG.add(big.group);
    const marks: THREE.Object3D[] = [];
    const fill = (kk: number) => {
      fillG.remove(big.group); big = makeGlass(1.2 + kk * 0.14, 3 + kk * 0.35, '#38bdf8'); big.group.position.set(2.8, 0, 0); fillG.add(big.group);
      marks.forEach((m) => fillG.remove(m)); marks.length = 0;
      for (let i = 1; i < kk; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25 + kk * 0.14, 0.02, 6, 40), new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })); ring.rotation.x = Math.PI / 2; ring.position.set(2.8, ((3 + kk * 0.35) * i) / kk, 0); fillG.add(ring); marks.push(ring); }
      small.setLevel(1);
    };
    const pour = (n: number, kk: number, done: () => void) => {
      const home = small.group.position.clone();
      const target = new THREE.Vector3(2.8 - (1.2 + kk * 0.14) - 0.2, 3 + kk * 0.35 + 0.9, 0);
      ctx.tween(500, (t) => { small.group.position.lerpVectors(home, target, t); small.group.rotation.z = t * 1.0; }, () => {
        const from = (n - 1) / kk, to = n / kk;
        ctx.tween(650, (t) => { big.setLevel(from + (to - from) * t); small.setLevel(1 - t); }, () => {
          ctx.tween(450, (t) => { small.group.position.lerpVectors(target, home, t); small.group.rotation.z = (1 - t) * 1.0; }, () => { small.setLevel(1); done(); }, ease.inOut);
        }, (t) => t);
      }, ease.inOut);
    };
    // compare view
    const cmpG = new THREE.Group(); ctx.scene.add(cmpG);
    let A: Glass, B: Glass, cupA: Glass, cupB: Glass;
    const compare = (s: { ra: number; ha: number; rb: number; hb: number }) => {
      [...cmpG.children].forEach((c) => cmpG.remove(c));
      A = makeGlass(s.ra, s.ha, '#fb923c'); B = makeGlass(s.rb, s.hb, '#fb923c');
      A.group.position.set(-4.4, 0, 0); B.group.position.set(-1.2, 0, 0); A.setLevel(1); B.setLevel(1);
      cupA = makeGlass(1.5, 2.2, '#fb923c'); cupB = makeGlass(1.5, 2.2, '#fb923c'); cupA.group.position.set(2.6, 0, 0); cupB.group.position.set(5.4, 0, 0);
      cmpG.add(A.group, B.group, cupA.group, cupB.group);
      return [A.vol, B.vol];
    };
    const equalize = (done: () => void) => {
      const lA = A.vol / (Math.PI * 1.5 * 1.5 * 0.92), lB = B.vol / (Math.PI * 1.5 * 1.5 * 0.92);
      ctx.tween(1600, (t) => { A.setLevel(1 - t); B.setLevel(1 - t); cupA.setLevel((lA * t) / 2.2); cupB.setLevel((lB * t) / 2.2); }, done, (t) => t);
    };
    const mode = (m: 'FILL' | 'COMPARE') => { fillG.visible = m === 'FILL'; cmpG.visible = m === 'COMPARE'; };
    scene.current = { fill, pour, compare, equalize, mode };
    fill(5); mode('FILL'); cmpG.visible = false;
    return () => { scene.current = null; };
  }, [], { camera: [0, 5.5, 11], target: [0.5, 1.8, 0], minDistance: 6, maxDistance: 20, ground: 0xfef3c7, sky: 0xe0f2fe });

  const startFill = (kk: number) => { setView('FILL'); setK(kk); setPours(0); setCmp(null); scene.current?.mode('FILL'); scene.current?.fill(kk); };
  const pourOnce = () => {
    if (busy || pours >= k) return; setBusy(true); const n = pours + 1; setPours(n); kit.tap();
    scene.current?.pour(n, k, () => { setBusy(false); kit.say(`${n}`, `${n}`, true); if (n === k) { kit.good(`${k} सानो ज्यागले ठूलो भाँडो भर्‍यो!`, `${k} small pitchers fill the big jar!`); kit.star(); } });
  };
  const autoFill = () => {
    if (busy) return; startFill(k); setBusy(true); let n = 0;
    const next = () => { n += 1; setPours(n); scene.current?.pour(n, k, () => { kit.say(`${n}`, `${n}`); if (n < k) window.setTimeout(next, 250); else { setBusy(false); kit.good(`${k} पटक खन्याउँदा भरियो!`, `${k} pours filled the jar!`); kit.star(); } }); };
    window.setTimeout(next, 400);
  };
  const newCompare = (equal: boolean) => {
    setView('COMPARE'); setPours(0); scene.current?.mode('COMPARE');
    const ra = 0.7 + Math.random() * 0.3, ha = 2.4 + Math.random() * 1.0;
    let rb: number, hb: number;
    if (equal) { const s = 1.5 + Math.random() * 0.4; rb = ra * s; hb = ha / (s * s); } else { rb = ra * (1.2 + Math.random() * 0.8); hb = ha * (0.55 + Math.random() * 0.45); }
    const v = scene.current!.compare({ ra, ha, rb, hb });
    setCmp({ a: v[0], b: v[1], equalized: false });
    return v;
  };
  const doEqualize = () => { if (!cmp || cmp.equalized || busy) return; setBusy(true); kit.say('बराबर कपमा खन्याऔँ।', 'Pour into equal cups.'); scene.current?.equalize(() => { setBusy(false); setCmp({ ...cmp, equalized: true }); kit.say('कुन कपमा बढी पानी छ?', 'Which cup has more juice?'); }); };

  useEffect(() => {
    if (kit.mode === 'LEARN') { startFill(5); kit.say('सानो ज्यागले ठूलो भाँडो भर्न कति पटक लाग्छ? खन्याएर गनौँ।', 'How many small pitchers fill the big jar? Pour and count.'); }
    else if (kit.mode === 'PLAY') { startFill(4); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    if (i % 2 === 0) { const kk = rnd(3, 6), two = rnd(2, 3); return { kind: 'count', k: kk, m: two }; }
    const equal = i === 5; let ra = 0, ha = 0, rb = 0, hb = 0;
    for (let g = 0; g < 50; g++) {
      ra = 0.7 + Math.random() * 0.3; ha = 2.4 + Math.random() * 1.0;
      if (equal) { const s = 1.5 + Math.random() * 0.4; rb = ra * s; hb = ha / (s * s); break; }
      rb = ra * (1.2 + Math.random() * 0.8); hb = ha * (0.55 + Math.random() * 0.45);
      const va = ra * ra * ha, vb = rb * rb * hb; if (Math.abs(va - vb) / Math.max(va, vb) > 0.15) break;
    }
    return { kind: 'compare', ra, ha, rb, hb, ans: equal ? 'same' : ra * ra * ha > rb * rb * hb ? 'first' : 'second' };
  }), []);
  const questions: (QuizQuestion & { d: any })[] = data.map((d: any, i) => d.kind === 'count'
    ? { np: `सानो ज्यागले ${fmt('ne', d.k)} पटकमा एउटा ठूलो भाँडो भर्छ। ${fmt('ne', d.m)} वटा ठूला भाँडो भर्न कति पटक चाहिन्छ?`, en: `${d.k} small pitchers fill 1 big jar. How many pitchers fill ${d.m} big jars?`, d, answer: String(d.k * d.m), options: numChoices(d.k * d.m, i * 7 + 1, [d.k, -d.k, 1, -1, 2]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) }
    : { np: 'बराबर कपमा खन्याएपछि कुन गिलासमा बढी जुस छ?', en: 'After pouring into equal cups, which glass had more juice?', d, answer: d.ans, options: [{ key: 'first', label: kit.t('पहिलो', 'First') }, { key: 'second', label: kit.t('दोस्रो', 'Second') }, { key: 'same', label: kit.t('बराबर', 'Same') }] });

  const hud = kit.mode === 'CHALLENGE' ? null : view === 'FILL' ? (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{kit.t('खन्याएको', 'Pours')}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: pours === k ? '#16a34a' : '#0369a1' }}>{fmt(kit.lang, pours)} / {fmt(kit.lang, k)}</div>
    </div>
  ) : cmp?.equalized ? (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', fontSize: 18, fontWeight: 900 }}>{Math.abs(cmp.a - cmp.b) / Math.max(cmp.a, cmp.b) < 0.03 ? kit.t('दुवै बराबर!', 'Both equal!') : cmp.a > cmp.b ? kit.t('पहिलोमा बढी', 'First holds more') : kit.t('दोस्रोमा बढी', 'Second holds more')}</div>
  ) : null;
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>{pours === k ? `✅ ${k} ${kit.t('पटक', 'pours')}` : kit.t('सानो ज्याग भरेर ठूलो भाँडोमा खन्याऔँ', 'Pour the small pitcher into the big jar')}</div>
      <CBtn color="#0ea5e9" disabled={busy || pours >= k} onClick={pourOnce}>💧 {kit.t('खन्याऔँ', 'Pour')}</CBtn>
      <CBtn color="#8b5cf6" disabled={busy} onClick={autoFill}>▶ {kit.t('देखाऔँ', 'Show me')}</CBtn>
      <CBtn color="#f59e0b" onClick={() => startFill(k)}>↺</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <div>
      <Controls>
        <b>{kit.t('ठूलो भाँडो', 'Big jar')}:</b>{[3, 4, 5, 6].map((kk) => <CBtn key={kk} color={view === 'FILL' && kk === k ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 52 }} disabled={busy} onClick={() => startFill(kk)}>{fmt(kit.lang, kk)}</CBtn>)}
        <CBtn color="#0ea5e9" disabled={busy || view !== 'FILL' || pours >= k} onClick={pourOnce}>💧 {kit.t('खन्याऔँ', 'Pour')}</CBtn>
      </Controls>
      <div style={{ marginTop: 6 }}><Controls><b>{kit.t('गिलास तुलना', 'Compare glasses')}:</b>
        <CBtn color="#f97316" disabled={busy} onClick={() => newCompare(Math.random() < 0.25)}>🥤 {kit.t('नयाँ गिलास', 'New glasses')}</CBtn>
        <CBtn color="#16a34a" disabled={busy || view !== 'COMPARE' || !cmp || cmp.equalized} onClick={doEqualize}>🥛 {kit.t('बराबर कपमा खन्याऔँ', 'Pour into equal cups')}</CBtn></Controls></div>
    </div>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => {
      const d = q.d; setPours(0);
      if (d.kind === 'count') { setView('FILL'); scene.current?.mode('FILL'); setK(d.k); scene.current?.fill(d.k); }
      else { setView('COMPARE'); scene.current?.mode('COMPARE'); const v = scene.current!.compare(d); setCmp({ a: v[0], b: v[1], equalized: false }); window.setTimeout(() => scene.current?.equalize(() => undefined), 500); }
    }} />
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
