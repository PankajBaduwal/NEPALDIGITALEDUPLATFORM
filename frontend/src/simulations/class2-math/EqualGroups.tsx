/**
 * Lesson 11 · Multiplication 1 (गुणन १) — equal groups
 * Equal Groups Garden — baskets with the same number of apples: 3 + 3 + 3 = 3 × 3.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { apple, basket } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const LEARN = [[3, 2], [2, 4], [5, 3], [4, 5], [10, 3]]; // [apples per basket, baskets]

export const EqualGroups: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L11-01', chapter: 11, titleNp: 'बराबर समूह बगैँचा (गुणन)', titleEn: 'Equal Groups Garden (Multiplication)' });
  const [per, setPer] = useState(3);
  const [groups, setGroups] = useState(0);
  const [li, setLi] = useState(0);
  const [busy, setBusy] = useState(false);
  const scene = useRef<{ set: (per: number, groups: number, animateLast?: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const root = new THREE.Group(); ctx.scene.add(root);
    const slot = (g: number) => new THREE.Vector3(((g % 5) - 2) * 3.1, 0, Math.floor(g / 5) * 3.2 - 1.2);
    const set = (p: number, n: number, animateLast = false) => {
      [...root.children].forEach((c) => root.remove(c));
      for (let g = 0; g < n; g++) {
        const grp = new THREE.Group(); grp.position.copy(slot(g));
        const b = basket('#c2410c', 2.3); b.scale.setScalar(1); grp.add(b);
        const ring = Math.min(p, 10);
        for (let i = 0; i < ring; i++) { const a = apple(['#ef4444', '#f97316', '#22c55e', '#eab308', '#ec4899'][g % 5]); a.scale.setScalar(p > 6 ? 0.55 : 0.7); const col = i % 4, row = Math.floor(i / 4); a.position.set((col - 1.5) * 0.5, 0.95 + row * 0.38, (row % 2) * 0.1); grp.add(a); }
        root.add(grp);
        if (animateLast && g === n - 1) { grp.position.y = 4; grp.scale.setScalar(0.1); const y0 = 0; ctx.tween(650, (k) => { grp.position.y = 4 * (1 - k) + y0 * k; grp.scale.setScalar(Math.max(0.1, k)); }, undefined, ease.bounce); }
      }
    };
    scene.current = { set };
    set(3, 0);
    return () => { scene.current = null; };
  }, [], { camera: [0, 8.5, 11], target: [0, 0.8, 0.5], minDistance: 7, maxDistance: 20 });

  const apply = (p: number, g: number, animate = false) => { setPer(p); setGroups(g); scene.current?.set(p, g, animate); };
  const addGroup = () => { if (groups >= 10) { kit.oops('१० टोकरीसम्म', 'Up to 10 baskets'); return; } apply(per, groups + 1, true); kit.tap(); const g = groups + 1; kit.say(`${g} × ${per} = ${g * per}`, `${g} × ${per} = ${g * per}`); };
  const delGroup = () => { if (!groups) return; apply(per, groups - 1); };
  const learnShow = () => { const [p, g] = LEARN[li % LEARN.length]; setBusy(true); apply(p, 0); let n = 0; const tick = () => { n += 1; apply(p, n, true); kit.say(`${p}`, `${p}`); if (n < g) window.setTimeout(tick, 900); else window.setTimeout(() => { setBusy(false); kit.good(`${g} × ${p} = ${g * p}`, `${g} × ${p} = ${g * p}`); kit.star(); }, 800); }; window.setTimeout(tick, 400); };

  useEffect(() => {
    if (kit.mode === 'LEARN') { const [p] = LEARN[li % LEARN.length]; apply(p, 0); kit.say('बराबर समूह बनाऔँ। प्रत्येक टोकरीमा बराबर स्याउ।', 'Make equal groups. Every basket has the same number of apples.'); }
    else if (kit.mode === 'PLAY') { apply(per, 2); kit.say('टोकरी थपेर गुणन देखौँ।', 'Add baskets and see the multiplication.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const p = [2, 3, 4, 5, 10][rnd(0, 4)], g = rnd(2, 6);
    return { p, g, kind: i % 2 === 0 ? 'total' : 'sentence' };
  }), []);
  const questions: (QuizQuestion & { p: number; g: number })[] = data.map((d, i) => d.kind === 'total'
    ? { np: `${fmt('ne', d.g)} टोकरी, प्रत्येकमा ${fmt('ne', d.p)} स्याउ। जम्मा कति स्याउ?`, en: `${d.g} baskets with ${d.p} apples each. How many apples in all?`, p: d.p, g: d.g, answer: String(d.p * d.g), options: numChoices(d.p * d.g, i * 5 + 1, [d.p, -d.p, 1, -1]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) }
    : { np: 'यो चित्रको गुणन वाक्य कुन हो?', en: 'Which multiplication sentence matches the picture?', p: d.p, g: d.g, answer: `${d.g}x${d.p}`, options: shuffle([`${d.g}x${d.p}`, `${d.p}x${d.g === d.p ? d.g + 1 : d.g}`, `${d.g + 1}x${d.p}`].filter((v, k, a) => a.indexOf(v) === k), i + 9).map((v) => ({ key: v, label: v.replace('x', ' × ') + ` = ${v.split('x').map(Number).reduce((a, b) => a * b, 1)}` })) });

  const repeated = groups ? Array.from({ length: groups }, () => per).join(' + ') : '';
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center', maxWidth: 360 }}>
      {repeated && <div style={{ fontSize: 17, fontWeight: 800, color: '#64748b' }}>{repeated} = {groups * per}</div>}
      <div style={{ fontSize: 32, fontWeight: 900 }}>{fmt(kit.lang, groups)} × {fmt(kit.lang, per)} = <span style={{ color: '#16a34a' }}>{fmt(kit.lang, groups * per)}</span></div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>{kit.t(`प्रत्येक टोकरीमा ${fmt('ne', per)} स्याउ`, `${per} apples in each basket`)}</div>
      <CBtn color="#8b5cf6" disabled={busy} onClick={learnShow}>▶ {kit.t('देखाऔँ', 'Show me')}</CBtn>
      <CBtn color="#16a34a" disabled={busy} onClick={() => setLi(li + 1)}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      <b>{kit.t('प्रत्येकमा', 'Each')}:</b>{[2, 3, 4, 5, 10].map((p) => <CBtn key={p} color={p === per ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 52 }} onClick={() => apply(p, groups)}>{fmt(kit.lang, p)}</CBtn>)}
      <CBtn color="#16a34a" onClick={addGroup}>+ 🧺 {kit.t('टोकरी', 'basket')}</CBtn><CBtn color="#94a3b8" onClick={delGroup}>−</CBtn><CBtn color="#f59e0b" onClick={() => apply(per, 0)}>↺</CBtn>
    </Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.p, q.g)} />
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
