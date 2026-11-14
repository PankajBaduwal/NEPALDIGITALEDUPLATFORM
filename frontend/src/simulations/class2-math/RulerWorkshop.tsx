/**
 * Lesson 9 · Length (लम्बाइ)
 * Ruler Workshop — read centimetres on a big 3D ruler; start from 0; compare two lengths.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, textPlane } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const THINGS = [
  { np: 'पेन्सिल', en: 'Pencil', emoji: '✏️', cm: 12, color: '#facc15' },
  { np: 'रबर', en: 'Eraser', emoji: '🧽', cm: 4, color: '#f472b6' },
  { np: 'साँचो', en: 'Key', emoji: '🔑', cm: 6, color: '#94a3b8' },
  { np: 'क्रेयोन', en: 'Crayon', emoji: '🖍️', cm: 8, color: '#ef4444' },
  { np: 'चम्चा', en: 'Spoon', emoji: '🥄', cm: 14, color: '#cbd5e1' },
  { np: 'कंगियो', en: 'Comb', emoji: '🪮', cm: 10, color: '#38bdf8' },
];
const U = 0.78; // world units per cm
const X0 = -7.4;

export const RulerWorkshop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L9-01', chapter: 9, titleNp: 'रुलर कार्यशाला (लम्बाइ)', titleEn: 'Ruler Workshop (Length in cm)' });
  const [a, setA] = useState(0);
  const [b, setB] = useState<number | null>(null);
  const [shift, setShift] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [li, setLi] = useState(0);
  const scene = useRef<{ show: (a: number, b: number | null, shift: number, reveal: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const desk = shadowed(new THREE.Mesh(new THREE.BoxGeometry(19, 0.3, 8), mat('#fde68a', 0.9))); desk.position.set(0, -0.15, 0.5); ctx.scene.add(desk);
    const ruler = shadowed(new THREE.Mesh(new THREE.BoxGeometry(20 * U + 0.8, 0.12, 1.5), mat('#fbbf24', 0.4))); ruler.position.set(X0 + (20 * U) / 2 - 0.1, 0.06, 0.6); ctx.scene.add(ruler);
    for (let i = 0; i <= 20; i++) {
      const tk = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, i % 5 === 0 ? 0.55 : 0.35), new THREE.MeshBasicMaterial({ color: 0x1f2937 })); tk.position.set(X0 + i * U, 0.13, 0.6 - 0.55); ctx.scene.add(tk);
      if (i % 1 === 0) { const n = textPlane(String(i), 0.5, { px: 120, w: 128, h: 128, color: '#1f2937' }); n.rotation.x = -Math.PI / 2; n.position.set(X0 + i * U, 0.14, 0.95); ctx.scene.add(n); }
    }
    const cm = textPlane('cm', 0.8, { px: 100, w: 128, h: 128, color: '#92400e' }); cm.rotation.x = -Math.PI / 2; cm.position.set(X0 + 20 * U + 0.55, 0.14, 0.95); ctx.scene.add(cm);
    const objs = new THREE.Group(); ctx.scene.add(objs);
    const mk = (i: number, z: number, sh: number, tint: string) => {
      const t = THINGS[i]; const g = new THREE.Group();
      const body = shadowed(new THREE.Mesh(new THREE.BoxGeometry(t.cm * U, 0.4, 0.8), mat(t.color, 0.45))); body.position.set((t.cm * U) / 2, 0.3, 0); g.add(body);
      const em = textSprite(t.emoji, 1.0, { px: 100, w: 128, h: 128 }); em.position.set((t.cm * U) / 2, 1.1, 0); g.add(em);
      g.position.set(X0 + sh * U, 0, z); void tint; return g;
    };
    const marker = (x: number, z: number, color: string, label: string) => { const m = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 12), mat(color, 0.4)); c.rotation.x = Math.PI; c.position.y = 1.9; m.add(c); const l = textSprite(label, 0.9, { px: 80, w: 128, h: 128, bg: '#ffffff', border: color }); l.position.y = 2.6; m.add(l); m.position.set(x, 0, z); return m; };
    const show = (ai: number, bi: number | null, sh: number, rev: boolean) => {
      [...objs.children].forEach((c) => objs.remove(c));
      objs.add(mk(ai, bi === null ? -0.6 : -1.5, bi === null ? sh : 0, '#fff'));
      if (bi !== null) objs.add(mk(bi, -3.3, 0, '#fff'));
      if (rev && bi === null) { objs.add(marker(X0 + sh * U, -0.6, '#16a34a', String(sh))); objs.add(marker(X0 + (sh + THINGS[ai].cm) * U, -0.6, '#dc2626', String(sh + THINGS[ai].cm))); }
      if (rev && bi !== null) { objs.add(marker(X0 + THINGS[ai].cm * U, -1.5, '#16a34a', String(THINGS[ai].cm))); objs.add(marker(X0 + THINGS[bi].cm * U, -3.3, '#dc2626', String(THINGS[bi].cm))); }
    };
    scene.current = { show };
    show(0, null, 0, false);
    return () => { scene.current = null; };
  }, [], { camera: [0, 9, 9.5], target: [0, 0, 0], minDistance: 6, maxDistance: 18, ground: null, sky: 0xe0f2fe });

  const apply = (ai: number, bi: number | null, sh = 0, rev = false) => { setA(ai); setB(bi); setShift(sh); setReveal(rev); scene.current?.show(ai, bi, sh, rev); };
  const doReveal = () => {
    setReveal(true); scene.current?.show(a, b, shift, true);
    if (b === null) { kit.say(`${shift === 0 ? '०' : shift} देखि ${shift + THINGS[a].cm} सम्म — ${THINGS[a].cm} सेमी`, `From ${shift} to ${shift + THINGS[a].cm}: ${THINGS[a].cm} cm`); if (shift === 0) { kit.star(); } }
    else { const d = Math.abs(THINGS[a].cm - THINGS[b].cm); kit.say(`${THINGS[a].cm} सेमी र ${THINGS[b].cm} सेमी — फरक ${d} सेमी`, `${THINGS[a].cm} cm and ${THINGS[b].cm} cm — ${d} cm longer`); }
  };
  useEffect(() => {
    if (kit.mode === 'LEARN') { apply(li % THINGS.length, null); kit.say('वस्तुको सुरु रुलरको ० मा राखौँ।', 'Put the start of the object at 0 on the ruler.'); }
    else if (kit.mode === 'PLAY') { apply(0, null); kit.say('वस्तु रोजौँ, सारौँ र नापौँ।', 'Pick an object, slide it and measure.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const x = rnd(0, 5);
    if (i % 2 === 0) return { kind: 'read', x };
    let y = rnd(0, 5); while (y === x) y = rnd(0, 5); return { kind: 'longer', x, y };
  }), []);
  const questions: (QuizQuestion & { d: any })[] = data.map((d: any, i) => d.kind === 'read'
    ? { np: `${THINGS[d.x].np} कति सेमी लामो छ?`, en: `How many cm long is the ${THINGS[d.x].en.toLowerCase()}?`, d, answer: String(THINGS[d.x].cm), options: numChoices(THINGS[d.x].cm, i * 9 + 1, [1, -1, 2, -2]).map((v) => ({ key: String(v), label: `${fmt(kit.lang, v)} cm` })) }
    : { np: 'कुन चाहिँ लामो छ?', en: 'Which one is longer?', d, answer: String(THINGS[d.x].cm > THINGS[d.y].cm ? d.x : d.y), options: [d.x, d.y].map((v) => ({ key: String(v), label: <span>{THINGS[v].emoji} {kit.t(THINGS[v].np, THINGS[v].en)}</span> })) });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{THINGS[a].emoji} {kit.t(THINGS[a].np, THINGS[a].en)}{b !== null && ` vs ${THINGS[b].emoji}`}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#0369a1' }}>{reveal ? (b === null ? `${fmt(kit.lang, THINGS[a].cm)} cm` : `${fmt(kit.lang, Math.abs(THINGS[a].cm - THINGS[b].cm))} cm ${kit.t('फरक', 'difference')}`) : '? cm'}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('अन्तिम छेउमा परेको अङ्क नै लम्बाइ हो (० बाट सुरु भए)।', 'The number at the end is the length (when it starts at 0).')}</div>
      <CBtn color="#8b5cf6" onClick={doReveal}>📏 {kit.t('नापौँ', 'Measure')}</CBtn>
      <CBtn color="#16a34a" onClick={() => setLi(li + 1)}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <div>
      <Controls>{THINGS.map((t, i) => <CBtn key={i} color={i === a ? '#0ea5e9' : '#94a3b8'} style={{ minHeight: 44, padding: '6px 10px', fontSize: 16 }} onClick={() => apply(i, b, 0, false)}>{t.emoji}</CBtn>)}</Controls>
      <div style={{ marginTop: 6 }}><Controls>
        {b === null && <><CBtn color="#f59e0b" onClick={() => apply(a, null, Math.max(0, shift - 1), false)}>◀ {kit.t('सारौँ', 'Slide')}</CBtn><CBtn color="#f59e0b" onClick={() => apply(a, null, Math.min(20 - THINGS[a].cm, shift + 1), false)}>{kit.t('सारौँ', 'Slide')} ▶</CBtn></>}
        <CBtn color="#8b5cf6" onClick={doReveal}>📏 {kit.t('नापौँ', 'Measure')}</CBtn>
        <CBtn color={b === null ? '#f97316' : '#94a3b8'} onClick={() => apply(a, b === null ? (a + 1) % THINGS.length : null, 0, false)}>{b === null ? `⚖ ${kit.t('दुई वस्तु', 'Compare two')}` : `✕ ${kit.t('एउटा', 'One')}`}</CBtn>
      </Controls></div>
    </div>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { const d = q.d; apply(d.x, d.kind === 'longer' ? d.y : null, 0, d.kind === 'longer' ? false : false); }} />
  );
  void shuffle; void ease;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
