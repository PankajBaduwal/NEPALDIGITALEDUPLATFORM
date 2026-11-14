/**
 * Lesson 14 · Pictograph and table (चित्रचार्ट र तालिका)
 * Tally & Pictograph — children vote for a pet; tally marks (bundles of five), a table and a pictograph grow together.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, critter, CritterKind } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const PETS: { np: string; en: string; emoji: string; color: string; kind: CritterKind; fur: string }[] = [
  { np: 'कुकुर', en: 'Dog', emoji: '🐶', color: '#f59e0b', kind: 'dog', fur: '#d6b88c' },
  { np: 'बिरालो', en: 'Cat', emoji: '🐱', color: '#8b5cf6', kind: 'cat', fur: '#fb923c' },
  { np: 'खरायो', en: 'Rabbit', emoji: '🐰', color: '#ec4899', kind: 'rabbit', fur: '#f9a8d4' },
  { np: 'चरा', en: 'Bird', emoji: '🐦', color: '#0ea5e9', kind: 'mouse', fur: '#94a3b8' },
];
const MAXV = 15;

export const TallyChart: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L14-01', chapter: 14, titleNp: 'ट्याली र चित्रचार्ट', titleEn: 'Tally and Pictograph' });
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const [busy, setBusy] = useState(false);
  const scene = useRef<{ set: (c: number[], animateIdx?: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const board = shadowed(new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 7), mat('#fef3c7', 0.9))); board.position.y = -0.05; ctx.scene.add(board);
    const back = shadowed(new THREE.Mesh(new THREE.BoxGeometry(14, 6.2, 0.3), mat('#ecfeff', 0.9))); back.position.set(0, 3.1, -3.4); ctx.scene.add(back);
    const rows: THREE.Group[] = [];
    PETS.forEach((p, i) => {
      const g = new THREE.Group(); g.position.set(0, 0.2, -2.4 + i * 1.7); ctx.scene.add(g); rows.push(g);
      const lab = textSprite(`${p.emoji} ${p.en}`, 2.3, { px: 54, w: 256, h: 96, bg: '#ffffff', border: p.color }); lab.position.set(-5.6, 0.7, 0); g.add(lab);
    });
    const tally = (n: number, color: string) => {
      const g = new THREE.Group(); const bundles = Math.floor(n / 5), rest = n % 5;
      const stick = () => shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.9, 0.09), mat(color, 0.5)));
      let x = 0;
      for (let b = 0; b < bundles; b++) { for (let k = 0; k < 4; k++) { const s = stick(); s.position.set(x + k * 0.2, 0.45, 0); g.add(s); } const d = stick(); d.scale.y = 1.25; d.rotation.z = 1.15; d.position.set(x + 0.3, 0.45, 0.07); g.add(d); x += 1.25; }
      for (let k = 0; k < rest; k++) { const s = stick(); s.position.set(x + k * 0.2, 0.45, 0); g.add(s); }
      return g;
    };
    const set = (c: number[], animIdx = -1) => {
      rows.forEach((row, i) => {
        [...row.children].forEach((ch, k) => { if (k > 0) row.remove(ch); });
        const t = tally(c[i], '#1e293b'); t.position.set(-4, 0, 0); row.add(t);
        for (let k = 0; k < c[i]; k++) {
          const m = critter(PETS[i].kind, PETS[i].fur); m.scale.setScalar(0.32); m.position.set(0.4 + k * 0.6, 0, 0.1); m.rotation.y = 0; row.add(m);
          if (i === animIdx && k === c[i] - 1) { m.scale.setScalar(0.01); ctx.tween(420, (t2) => m.scale.setScalar(Math.max(0.01, t2) * 0.32), undefined, ease.back); }
        }
      });
    };
    scene.current = { set };
    set([0, 0, 0, 0]);
    return () => { scene.current = null; };
  }, [], { camera: [0, 7.5, 9.5], target: [0, 1.1, -0.6], minDistance: 6, maxDistance: 18, ground: 0xbbf7d0 });

  const vote = (i: number) => { if (counts[i] >= MAXV) { kit.oops('खाना भरियो', 'This row is full'); return; } const c = counts.map((v, j) => (j === i ? v + 1 : v)); setCounts(c); scene.current?.set(c, i); kit.tap(); kit.say(PETS[i].np, PETS[i].en); };
  const reset = () => { setCounts([0, 0, 0, 0]); scene.current?.set([0, 0, 0, 0]); };
  const survey = () => {
    if (busy) return; reset(); setBusy(true); const picks = Array.from({ length: 14 }, () => rnd(0, 3)); const local = [0, 0, 0, 0]; let k = 0;
    kit.say('बच्चाहरूले मनपर्ने घरपालुवा जनावर रोज्दैछन्।', 'The children are choosing their favourite pets.');
    const step = () => { const f = picks[k]; local[f] += 1; setCounts([...local]); scene.current?.set([...local], f); kit.tap(); k += 1; if (k < picks.length) window.setTimeout(step, 600); else { setBusy(false); kit.say('ट्याली, तालिका र चित्रचार्ट तयार!', 'The tally, table and pictograph are ready!'); kit.star(); } };
    window.setTimeout(step, 500);
  };

  const quiz = useMemo(() => {
    let c: number[]; let guard = 0;
    do { c = Array.from({ length: 4 }, () => rnd(2, 12)); guard++; } while (guard < 200 && !(c.filter((v) => v === Math.max(...c)).length === 1 && c.filter((v) => v === Math.min(...c)).length === 1));
    const qs = [{ k: 'count', i: rnd(0, 3) }, { k: 'most' }, { k: 'least' }, { k: 'count', i: rnd(0, 3) }, { k: 'more', i: c.indexOf(Math.max(...c)), j: c.indexOf(Math.min(...c)) }, { k: 'total' }];
    return { c, qs };
  }, []);
  const questions: QuizQuestion[] = quiz.qs.map((q: any, qi) => {
    const c = quiz.c; const mx = c.indexOf(Math.max(...c)), mn = c.indexOf(Math.min(...c));
    const petOpts = (ans: number) => shuffle([ans, ...shuffle([0, 1, 2, 3].filter((x) => x !== ans), qi + 5).slice(0, 2)], ans + qi).map((v) => ({ key: String(v), label: <span>{PETS[v].emoji} {kit.t(PETS[v].np, PETS[v].en)}</span> }));
    const numOpts = (ans: number) => numChoices(ans, qi * 7 + 3, [1, -1, 2, 5]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) }));
    if (q.k === 'count') return { np: `${PETS[q.i].np}लाई कतिजनाले मत दिए? (ट्याली गनौँ)`, en: `How many children chose the ${PETS[q.i].en.toLowerCase()}? (count the tally)`, answer: String(c[q.i]), options: numOpts(c[q.i]) };
    if (q.k === 'most') return { np: 'सबैभन्दा धेरै मन परेको घरपालुवा जनावर कुन हो?', en: 'Which pet is liked by the most children?', answer: String(mx), options: petOpts(mx) };
    if (q.k === 'least') return { np: 'सबैभन्दा कम मन परेको घरपालुवा जनावर कुन हो?', en: 'Which pet is liked by the fewest children?', answer: String(mn), options: petOpts(mn) };
    if (q.k === 'more') { const d = c[q.i] - c[q.j]; return { np: `${PETS[q.i].np}ले ${PETS[q.j].np}भन्दा कति धेरै मत पायो?`, en: `How many more votes did the ${PETS[q.i].en.toLowerCase()} get than the ${PETS[q.j].en.toLowerCase()}?`, answer: String(d), options: numOpts(d) }; }
    const t = c.reduce((a, b) => a + b, 0); return { np: 'जम्मा कतिजना बच्चाले मत दिए?', en: 'How many children voted in all?', answer: String(t), options: numOpts(t) };
  });

  useEffect(() => {
    if (kit.mode === 'LEARN') { reset(); kit.say('"सर्वेक्षण" थिचौँ। प्रत्येक मतले ट्याली र चित्र थप्छ।', 'Press Survey. Each vote adds a tally mark and a picture.'); }
    else if (kit.mode === 'PLAY') { reset(); kit.say('जनावर थिचेर मत थपौँ।', 'Tap a pet to add a vote.'); }
    else { scene.current?.set(quiz.c); setCounts(quiz.c); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const hud = (
    <div style={{ background: 'rgba(255,255,255,.95)', borderRadius: 14, padding: '6px 10px', border: '3px solid #0ea5e9', fontSize: 14, fontWeight: 800 }}>
      <table style={{ borderCollapse: 'collapse' }}><tbody>
        <tr><td style={{ padding: '2px 8px', color: '#64748b' }}>{kit.t('जनावर', 'Pet')}</td><td style={{ padding: '2px 8px', color: '#64748b' }}>{kit.t('सङ्ख्या', 'Number')}</td></tr>
        {PETS.map((p, i) => <tr key={p.en}><td style={{ padding: '2px 8px' }}>{p.emoji}</td><td style={{ padding: '2px 8px', textAlign: 'center', fontSize: 18 }}>{fmt(kit.lang, counts[i])}</td></tr>)}
      </tbody></table>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('५ वटा ट्याली = ||||/ (एक बन्डल)', 'Five tally marks make a bundle: ||||/')}</div>
      <CBtn color="#8b5cf6" disabled={busy} onClick={survey}>🗳 {kit.t('सर्वेक्षण', 'Survey')}</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{PETS.map((p, i) => <CBtn key={p.en} color={p.color} onClick={() => vote(i)}>{p.emoji} {kit.t(p.np, p.en)}</CBtn>)}<CBtn color="#f59e0b" onClick={reset}>↺</CBtn></Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} />
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
