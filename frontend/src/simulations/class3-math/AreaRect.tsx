/**
 * Lesson 22 · Area (क्षेत्रफल)
 * Tile the Rectangle — cover a rectangle with 1 cm² square tiles row by row; area = length × width.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const AreaRect: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L22-01', chapter: 22, titleNp: 'आयत टाइल (क्षेत्रफल)', titleEn: 'Tile the Rectangle (Area)' });
  const [L, setL] = useState(5);
  const [W, setW] = useState(3);
  const [rows, setRows] = useState(3);
  const scene = useRef<{ set: (l: number, w: number, rows: number, animate?: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const set = (l: number, w: number, rws: number, animate = false) => {
      g.clear(); const u = 1.25;
      const frame = shadowed(new THREE.Mesh(new THREE.BoxGeometry(l * u + 0.3, 0.12, w * u + 0.3), mat('#334155', 0.6))); frame.position.set(0, 0.02, 0); g.add(frame);
      for (let r = 0; r < rws; r++) for (let c = 0; c < l; c++) {
        const t = shadowed(new THREE.Mesh(new THREE.BoxGeometry(u * 0.94, 0.18, u * 0.94), mat((r + c) % 2 ? '#fb7185' : '#fda4af', 0.5))); t.position.set((c - (l - 1) / 2) * u, 0.15, (r - (w - 1) / 2) * u); g.add(t);
        if (animate && r === rws - 1) { t.scale.y = 0.01; ctx.tween(250 + c * 50, (k) => { t.scale.y = Math.max(0.01, k); }, undefined, ease.back); }
      }
      const a = textSprite(`${l} cm`, 2, { px: 56, w: 256, h: 96, bg: '#fff', border: '#0ea5e9' }); a.position.set(0, 0.6, (w * u) / 2 + 1); g.add(a);
      const b = textSprite(`${w} cm`, 2, { px: 56, w: 256, h: 96, bg: '#fff', border: '#22c55e' }); b.position.set((l * u) / 2 + 1.5, 0.6, 0); g.add(b);
    };
    scene.current = { set }; set(5, 3, 3);
    return () => { scene.current = null; };
  }, [], { camera: [0, 10, 9], target: [0, 0, 0], minDistance: 7, maxDistance: 22, ground: 0xfef9c3 });

  const apply = (l: number, w: number, r = w, animate = false) => { setL(l); setW(w); setRows(r); scene.current?.set(l, w, r, animate); };
  const addRow = () => { if (rows >= W) { kit.star(); const l = rnd(3, 8), w = rnd(2, 6); apply(l, w, 0); return; } const r = rows + 1; setRows(r); scene.current?.set(L, W, r, true); kit.tap(); kit.say(`${r} पङ्क्ति × ${L} = ${r * L} वर्ग`, `${r} rows × ${L} = ${r * L} squares`); };
  useEffect(() => { if (kit.mode === 'LEARN') { apply(5, 3, 0); kit.say('वर्ग टाइल एक एक पङ्क्ति राखौँ', 'Lay square tiles one row at a time'); } else if (kit.mode === 'PLAY') apply(L, W, W); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, () => ({ l: rnd(2, 9), w: rnd(2, 7) })), []);
  const questions: (QuizQuestion & { d: { l: number; w: number } })[] = data.map((d, i) => ({ d, np: `लम्बाइ ${d.l} सेमी र चौडाइ ${d.w} सेमी भएको आयतको क्षेत्रफल कति?`, en: `A rectangle is ${d.l} cm long and ${d.w} cm wide. What is its area?`, answer: String(d.l * d.w), options: near(d.l * d.w, i + 2, [d.l, -d.l, d.w, -d.w, 2 * (d.l + d.w)], 1).map((x) => ({ key: String(x), label: `${fmt(kit.lang, x)} ${kit.t('वर्ग सेमी', 'cm²')}` })) }));

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #f43f5e', textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 900 }}>{fmt(kit.lang, L)} × {fmt(kit.lang, W)} = {rows >= W ? fmt(kit.lang, L * W) : '?'}</div>
      <div style={{ fontSize: 14, fontWeight: 800 }}>{fmt(kit.lang, rows * L)} {kit.t('वर्ग टाइल', 'square tiles')}</div>
      {rows >= W && <div style={{ fontSize: 13, fontWeight: 800, color: '#16a34a' }}>{kit.t('क्षेत्रफल', 'Area')} = {fmt(kit.lang, L * W)} {kit.t('वर्ग सेमी', 'cm²')}</div>}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('क्षेत्रफल = लम्बाइ × चौडाइ (१ सेमी वर्गका टाइल)', 'Area = length × width (1 cm² tiles)')}</div><CBtn color="#16a34a" onClick={addRow}>{rows >= W ? '🎲' : '＋'} {rows >= W ? kit.t('नयाँ', 'New') : kit.t('पङ्क्ति', 'Add a row')}</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><CBtn color="#0ea5e9" onClick={() => L > 1 && apply(L - 1, W)}>{kit.t('लम्बाइ', 'Length')} −</CBtn><CBtn color="#0ea5e9" onClick={() => L < 10 && apply(L + 1, W)}>{kit.t('लम्बाइ', 'Length')} +</CBtn><CBtn color="#22c55e" onClick={() => W > 1 && apply(L, W - 1)}>{kit.t('चौडाइ', 'Width')} −</CBtn><CBtn color="#22c55e" onClick={() => W < 7 && apply(L, W + 1)}>{kit.t('चौडाइ', 'Width')} +</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.d.l, q.d.w)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
