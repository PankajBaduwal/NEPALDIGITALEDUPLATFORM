/**
 * Lesson 2 · Time (समय) — week, months and the year
 * Calendar Town — twelve month houses in a ring: how many days, which month comes next, which season.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { shuffle, rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const MONTHS = [
  { en: 'January', np: 'जनवरी', days: 31, color: '#38bdf8' }, { en: 'February', np: 'फेब्रुअरी', days: 28, color: '#60a5fa' }, { en: 'March', np: 'मार्च', days: 31, color: '#4ade80' },
  { en: 'April', np: 'अप्रिल', days: 30, color: '#86efac' }, { en: 'May', np: 'मे', days: 31, color: '#facc15' }, { en: 'June', np: 'जुन', days: 30, color: '#fb923c' },
  { en: 'July', np: 'जुलाई', days: 31, color: '#f97316' }, { en: 'August', np: 'अगस्ट', days: 31, color: '#ef4444' }, { en: 'September', np: 'सेप्टेम्बर', days: 30, color: '#f472b6' },
  { en: 'October', np: 'अक्टोबर', days: 31, color: '#c084fc' }, { en: 'November', np: 'नोभेम्बर', days: 30, color: '#a78bfa' }, { en: 'December', np: 'डिसेम्बर', days: 31, color: '#818cf8' },
];

export const CalendarTown: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L2-02', chapter: 2, titleNp: 'पात्रो सहर (महिना)', titleEn: 'Calendar Town (Months of the Year)' });
  const [sel, setSel] = useState(0);
  const [tour, setTour] = useState(false);
  const scene = useRef<{ pick: (i: number) => void } | null>(null);
  const live = useRef({ mode: kit.mode, tap: (_i: number) => {} });
  live.current.mode = kit.mode;

  useStage(kit.stageRef, (ctx) => {
    const ring = new THREE.Group(); ctx.scene.add(ring);
    const houses: THREE.Group[] = [];
    MONTHS.forEach((mo, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2; const r = 6.2;
      const g = new THREE.Group(); g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); g.rotation.y = -a + Math.PI / 2 + Math.PI;
      const body = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6 + mo.days / 31, 2.2), mat(mo.color, 0.55))); body.position.y = (1.6 + mo.days / 31) / 2; g.add(body);
      const roof = shadowed(new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.1, 4), mat('#7c2d12', 0.7))); roof.rotation.y = Math.PI / 4; roof.position.y = 1.6 + mo.days / 31 + 0.55; g.add(roof);
      const lab = textSprite(`${i + 1}\n${mo.en.slice(0, 3)}`, 1.9, { px: 52, w: 256, h: 140, bg: '#ffffff', border: mo.color }); lab.position.set(0, 3.9, 0); g.add(lab);
      g.userData.m = i; ring.add(g); houses.push(g);
    });
    const centre = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.3, 40), mat('#fde68a', 0.7))); centre.position.y = 0.15; ctx.scene.add(centre);
    const sun = textSprite('🗓️', 3, { px: 220, w: 256, h: 256 }); sun.position.set(0, 2.3, 0); ctx.scene.add(sun);
    const pick = (i: number) => houses.forEach((h, k) => { h.userData.sel = k === i; });
    scene.current = { pick };
    ctx.onFrame((_d, t) => houses.forEach((h) => { h.position.y += ((h.userData.sel ? 0.7 : 0) + Math.sin(t * 2 + h.userData.m) * 0.02 - h.position.y) * 0.15; }));
    ctx.onTap(() => houses, (hit) => { if (!hit) return; let o: THREE.Object3D | null = hit.object; while (o && o.userData.m === undefined) o = o.parent; if (o) live.current.tap(o.userData.m); });
    return () => { scene.current = null; };
  }, [], { camera: [0, 9, 14], target: [0, 1.5, 0], minDistance: 9, maxDistance: 24, ground: 0xbbf7d0, sky: 0xe0f2fe });

  const choose = (i: number) => { setSel(i); scene.current?.pick(i); const mo = MONTHS[i]; kit.say(`${mo.np} — वर्षको ${i + 1} औँ महिना, ${mo.days} दिन`, `${mo.en} is month number ${i + 1} and has ${mo.days} days`); };
  live.current.tap = (i) => { if (kit.mode !== 'CHALLENGE') { kit.tap(); choose(i); } };
  const runTour = () => { if (tour) return; setTour(true); let i = 0; const step = () => { choose(i); i += 1; if (i < 12) window.setTimeout(step, 1700); else window.setTimeout(() => { setTour(false); kit.good('वर्षमा १२ महिना!', '12 months in a year!'); kit.star(); }, 1500); }; step(); };

  useEffect(() => {
    if (kit.mode === 'LEARN') { choose(0); kit.say('वर्षमा १२ महिना हुन्छन्। घर छोएर महिना जानौँ।', 'There are 12 months in a year. Tap a house to learn about its month.'); }
    else if (kit.mode === 'PLAY') { choose(sel); }
    else scene.current?.pick(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const data = useMemo(() => {
    const qs: { np: string; en: string; ans: string; opts: string[]; label: (v: string) => string }[] = [];
    const nm = (v: string) => v;
    qs.push({ np: 'वर्षमा कतिवटा महिना हुन्छन्?', en: 'How many months are there in a year?', ans: '12', opts: ['10', '12', '7'], label: nm });
    const a = rnd(0, 10); qs.push({ np: `${MONTHS[a].np} पछि कुन महिना आउँछ?`, en: `Which month comes after ${MONTHS[a].en}?`, ans: String(a + 1), opts: shuffle([a + 1, (a + 3) % 12, (a + 5) % 12].map(String), a + 2), label: (v) => v });
    const b = rnd(1, 11); qs.push({ np: `${MONTHS[b].np}भन्दा अगाडि कुन महिना आउँछ?`, en: `Which month comes before ${MONTHS[b].en}?`, ans: String(b - 1), opts: shuffle([b - 1, (b + 2) % 12, (b + 4) % 12].map(String), b + 7), label: (v) => v });
    const c = rnd(0, 11); qs.push({ np: `वर्षको ${c + 1} औँ महिना कुन हो?`, en: `Which is the ${c + 1}th month of the year?`, ans: String(c), opts: shuffle([c, (c + 3) % 12, (c + 7) % 12].map(String), c + 4), label: (v) => v });
    const long = [0, 2, 4, 6, 7, 9, 11]; const d = long[rnd(0, long.length - 1)]; qs.push({ np: `${MONTHS[d].np}मा कति दिन हुन्छन्?`, en: `How many days are there in ${MONTHS[d].en}?`, ans: '31', opts: ['28', '30', '31'], label: nm });
    qs.push({ np: 'कुन महिनामा सबैभन्दा कम दिन हुन्छन्?', en: 'Which month has the fewest days?', ans: '1', opts: ['1', '4', '9'], label: nm });
    return qs;
  }, []);
  const questions: QuizQuestion[] = data.map((q, i) => ({
    np: q.np, en: q.en, answer: q.ans,
    options: q.opts.map((v) => ({ key: v, label: i === 0 ? fmt(kit.lang, v) : i === 4 ? fmt(kit.lang, v) : kit.t(MONTHS[Number(v)].np, MONTHS[Number(v)].en) })),
  }));
  void numChoices; void ease;

  const mo = MONTHS[sel];
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: `3px solid ${mo.color}`, textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#64748b' }}>{kit.t('महिना', 'Month')} {fmt(kit.lang, sel + 1)}</div>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{kit.t(mo.np, mo.en)}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#0369a1' }}>{fmt(kit.lang, mo.days)} {kit.t('दिन', 'days')}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('१ वर्ष = १२ महिना · १ हप्ता = ७ दिन', '1 year = 12 months · 1 week = 7 days')}</div>
      <CBtn color="#8b5cf6" disabled={tour} onClick={runTour}>▶ {kit.t('सबै महिना घुमौँ', 'Tour all months')}</CBtn>
      <CBtn color="#f59e0b" disabled={tour} onClick={() => choose((sel + 11) % 12)}>◀</CBtn><CBtn color="#f59e0b" disabled={tour} onClick={() => choose((sel + 1) % 12)}>▶</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{MONTHS.map((m, i) => <CBtn key={m.en} color={i === sel ? '#0ea5e9' : '#cbd5e1'} style={{ minWidth: 56, minHeight: 44, padding: '4px 8px', fontSize: 14, color: i === sel ? '#fff' : '#1f2937' }} onClick={() => choose(i)}>{kit.t(m.np.slice(0, 4), m.en.slice(0, 3))}</CBtn>)}</Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} />
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
