/**
 * Lesson 9 · Lines (रेखा)
 * Line Lab — horizontal, vertical, slanting, curved, parallel and intersecting lines, built from ropes, poles, ladders, tracks and roads.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const KINDS = [
  { id: 'horizontal', np: 'तेर्सो रेखा', en: 'Horizontal line', note: ['सुतेको रेखा — जमिनजस्तै सुतेको', 'Lies flat, like the ground or a sleeping line'], what: '🪢', color: '#0ea5e9' },
  { id: 'vertical', np: 'ठाडो रेखा', en: 'Vertical line', note: ['उभिएको रेखा — खम्बाजस्तै सीधा', 'Stands straight up, like a pole'], what: '🏮', color: '#22c55e' },
  { id: 'slanting', np: 'ढल्केको रेखा', en: 'Slanting line', note: ['नसुतेको न उभिएको — भर्‍याङजस्तै ढल्केको', 'Neither flat nor upright — like a leaning ladder'], what: '🪜', color: '#f97316' },
  { id: 'curved', np: 'बाङ्गो रेखा', en: 'Curved line', note: ['सीधा छैन — पुल वा इन्द्रेणीजस्तै बाङ्गो', 'Not straight — bends like a bridge or a rainbow'], what: '🌈', color: '#8b5cf6' },
  { id: 'parallel', np: 'समानान्तर रेखा', en: 'Parallel lines', note: ['रेलको पटरीजस्तै — कहिल्यै भेट्दैनन्', 'Like railway tracks — they never meet'], what: '🛤️', color: '#ec4899' },
  { id: 'intersecting', np: 'काटिने रेखा', en: 'Intersecting lines', note: ['चोकको बाटोजस्तै — एक ठाउँमा काटिन्छन्', 'Like a crossroad — they cross at one point'], what: '✖️', color: '#ef4444' },
];

export const LineLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L9-01', chapter: 9, titleNp: 'रेखा प्रयोगशाला', titleEn: 'Line Lab' });
  const [sel, setSel] = useState(0);
  const [asked, setAsked] = useState(0);
  const [done, setDone] = useState(false);
  const scene = useRef<{ show: (i: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const bar = (len: number, thick: number, color: string, from: THREE.Vector3, rotZ: number, rotY = 0) => { const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(len, thick, thick), mat(color, 0.5))); m.position.copy(from); m.rotation.z = rotZ; m.rotation.y = rotY; g.add(m); return m; };
    const show = (i: number) => {
      g.clear(); const k = KINDS[i].id; const col = KINDS[i].color;
      if (k === 'horizontal') { bar(9, 0.28, col, new THREE.Vector3(0, 1.3, 0), 0); [-4.5, 4.5].forEach((x) => bar(2.6, 0.3, '#78716c', new THREE.Vector3(x, 1.3 - 1.3, 0), Math.PI / 2)); }
      if (k === 'vertical') { bar(6, 0.3, col, new THREE.Vector3(0, 3, 0), Math.PI / 2); const lamp = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 16), mat('#fde047', 0.3))); lamp.position.set(0, 6.3, 0); g.add(lamp); }
      if (k === 'slanting') { bar(6.8, 0.22, col, new THREE.Vector3(-0.8, 3, 0), 1.15); bar(6.8, 0.22, col, new THREE.Vector3(0.8, 3, 0), 1.15); for (let r = 0; r < 6; r++) bar(1.6, 0.14, '#fcd34d', new THREE.Vector3(-1.6 + r * 0.55 + 0.6, 0.8 + r * 1.0, 0), 0); }
      if (k === 'curved') { const pts: THREE.Vector3[] = []; for (let a = 0; a <= 20; a++) { const t = a / 20; pts.push(new THREE.Vector3(-5 + 10 * t, Math.sin(t * Math.PI) * 4 + 0.4, 0)); } const m = shadowed(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.22, 10), mat(col, 0.4))); g.add(m); }
      if (k === 'parallel') { [-1.4, 1.4].forEach((z) => bar(11, 0.22, col, new THREE.Vector3(0, 0.5, z), 0)); for (let s = 0; s < 12; s++) { const t = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 3.6), mat('#92400e', 0.8))); t.position.set(-5.2 + s * 0.95, 0.3, 0); g.add(t); } }
      if (k === 'intersecting') { bar(11, 0.22, col, new THREE.Vector3(0, 0.5, 0), 0, 0.45); bar(11, 0.22, '#0ea5e9', new THREE.Vector3(0, 0.5, 0), 0, -0.45); const dot = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 14), mat('#fde047', 0.3))); dot.position.set(0, 0.8, 0); g.add(dot); }
      g.scale.setScalar(0.01); ctx.tween(450, (t) => g.scale.setScalar(Math.max(0.01, t)), undefined, ease.back);
    };
    scene.current = { show }; show(0);
    return () => { scene.current = null; };
  }, [], { camera: [0, 6.5, 12.5], target: [0, 2.2, 0], minDistance: 7, maxDistance: 22, ground: 0xdcfce7 });

  const choose = (i: number, speak = true) => { setSel(i); scene.current?.show(i); if (speak) kit.say(`${KINDS[i].np} — ${KINDS[i].note[0]}`, `${KINDS[i].en}: ${KINDS[i].note[1]}`); };
  useEffect(() => { if (kit.mode === 'LEARN') choose(0); else if (kit.mode === 'PLAY') { const r = rnd(0, 5); choose(r, false); setDone(false); kit.say('यो कुन प्रकारको रेखा हो?', 'What kind of line is this?'); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode, asked]);
  const guess = (i: number) => { if (done) return; if (i === sel) { setDone(true); kit.good(); kit.star(); window.setTimeout(() => setAsked((a) => a + 1), 1300); } else kit.oops(`यो ${KINDS[sel].np} होइन ${KINDS[i].np}`, 'Look again at how the line sits'); };

  const data = useMemo(() => shuffle([0, 1, 2, 3, 4, 5, 0, 3], 4).slice(0, 8), []);
  const questions: (QuizQuestion & { s: number })[] = data.map((s, i) => ({ s, np: 'यो कुन प्रकारको रेखा हो?', en: 'What kind of line is this?', answer: String(s), options: shuffle(Array.from(new Set([s, (s + 2) % 6, (s + 4) % 6])), i + 5).map((x) => ({ key: String(x), label: kit.t(KINDS[x].np, KINDS[x].en) })) }));

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: `3px solid ${KINDS[sel].color}`, textAlign: 'center', maxWidth: 360 }}>
      {kit.mode === 'PLAY' && !done ? <div style={{ fontSize: 22, fontWeight: 900 }}>❓ {kit.t('कुन रेखा?', 'Which line?')}</div> : <><div style={{ fontSize: 24, fontWeight: 900 }}>{KINDS[sel].what} {kit.t(KINDS[sel].np, KINDS[sel].en)}</div><div style={{ fontSize: 14, fontWeight: 700 }}>{kit.t(KINDS[sel].note[0], KINDS[sel].note[1])}</div></>}
    </div>
  );
  const picker = KINDS.map((k, i) => <CBtn key={k.id} color={i === sel && kit.mode === 'LEARN' ? k.color : '#94a3b8'} style={{ minHeight: 44, padding: '6px 10px', fontSize: 15 }} onClick={() => (kit.mode === 'LEARN' ? choose(i) : guess(i))}>{k.what} {kit.t(k.np, k.en)}</CBtn>);
  const panel = kit.mode === 'CHALLENGE' ? <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => choose(q.s, false)} /> : <Controls>{picker}</Controls>;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
