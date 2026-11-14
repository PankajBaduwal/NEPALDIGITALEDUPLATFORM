/**
 * Chapter 22 · Pictograph (चित्रचार्ट)
 * Fruit Basket Pictograph — children vote for a favourite fruit; each vote is one fruit picture in the chart.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { apple, ball, mat, shadowed, textSprite } from '../class1-math-kit/models';
import { toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const FRUITS = [
  { id: 'apple', np: 'स्याउ', en: 'Apple', emoji: '🍎', color: '#ef4444' },
  { id: 'mango', np: 'आँप', en: 'Mango', emoji: '🥭', color: '#f59e0b' },
  { id: 'banana', np: 'केरा', en: 'Banana', emoji: '🍌', color: '#facc15' },
  { id: 'orange', np: 'सुन्तला', en: 'Orange', emoji: '🍊', color: '#fb923c' },
];
const fruitModel = (i: number) => {
  if (i === 0) { const a = apple('#ef4444'); a.scale.setScalar(0.95); return a; }
  if (i === 1) { const g = new THREE.Group(); const m = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.4, 22, 16), mat('#f59e0b', 0.35))); m.scale.set(1.15, 0.9, 0.85); m.rotation.z = 0.4; g.add(m); const l = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mat('#16a34a'))); l.scale.set(1.6, 0.3, 0.8); l.position.set(0.05, 0.38, 0); g.add(l); return g; }
  if (i === 2) { const g = new THREE.Group(); const m = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.13, 10, 24, Math.PI * 0.85), mat('#facc15', 0.4))); m.rotation.z = Math.PI * 0.08; m.position.y = 0.1; g.add(m); return g; }
  const o = ball('#fb923c', 0.4); return o;
};

export const FruitPictograph: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH22-01', chapter: 22, titleNp: 'फलफूलको चित्रचार्ट', titleEn: 'Fruit Basket Pictograph' });
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const [voting, setVoting] = useState(false);
  const scene = useRef<{ set: (c: number[], animate?: boolean) => void; add: (i: number, n: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const board = shadowed(new THREE.Mesh(new THREE.BoxGeometry(13, 0.4, 5), mat('#fde68a', 0.9))); board.position.y = -0.05; ctx.scene.add(board);
    const wall = shadowed(new THREE.Mesh(new THREE.BoxGeometry(13, 8.6, 0.3), mat('#fff7ed', 0.9))); wall.position.set(0, 4.1, -2.3); ctx.scene.add(wall);
    const cols: THREE.Group[] = [];
    FRUITS.forEach((f, i) => {
      const g = new THREE.Group(); g.position.set(-4.5 + i * 3, 0.15, 0); ctx.scene.add(g); cols.push(g);
      const base = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 2.4), mat(f.color, 0.6))); base.position.y = 0.1; g.add(base);
      const lab = textSprite(`${f.emoji}\n${f.en}`, 2.3, { px: 52, w: 256, h: 160, bg: '#ffffff', border: f.color, radius: 24 }); lab.position.set(0, -0.05, 1.8); g.add(lab);
    });
    for (let r = 1; r <= 10; r++) { const line = new THREE.Mesh(new THREE.BoxGeometry(12, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: r % 5 === 0 ? 0x94a3b8 : 0xe2e8f0 })); line.position.set(0, 0.35 + r * 0.72, -2.1); ctx.scene.add(line); }
    const items: THREE.Object3D[][] = [[], [], [], []];
    const put = (i: number, k: number, animate: boolean) => {
      const m = fruitModel(i);
      m.position.set(0, 0.8 + k * 0.72, 0); cols[i].add(m); items[i].push(m);
      if (animate) { const y = m.position.y; m.position.y = y + 5; m.scale.setScalar(0.01); ctx.tween(520, (t) => { m.position.y = y + 5 * (1 - t); m.scale.setScalar(Math.max(0.01, t)); }, undefined, ease.bounce); }
    };
    const set = (c: number[], animate = false) => {
      items.forEach((arr, i) => { arr.forEach((m) => cols[i].remove(m)); arr.length = 0; });
      c.forEach((n, i) => { for (let k = 0; k < n; k++) put(i, k, animate); });
    };
    const add = (i: number, n: number) => put(i, n, true);
    scene.current = { set, add };
    return () => { scene.current = null; };
  }, [], { camera: [0, 7.5, 13.5], target: [0, 3.9, 0], minDistance: 8, maxDistance: 22, ground: 0xbbf7d0 });

  const vote = (i: number) => {
    if (counts[i] >= 10) { kit.oops('खाना भरियो (१० सम्म)', 'This column is full (up to 10)'); return; }
    scene.current?.add(i, counts[i]);
    setCounts((c) => c.map((v, j) => (j === i ? v + 1 : v))); kit.tap();
    kit.say(`${FRUITS[i].np}`, `${FRUITS[i].en}`, true);
  };
  const reset = () => { setCounts([0, 0, 0, 0]); scene.current?.set([0, 0, 0, 0]); };
  const survey = () => {
    if (voting) return;
    reset(); setVoting(true);
    const picks = shuffle(Array.from({ length: 12 }, (_, i) => i % 4).concat([]), Date.now() % 9973).map((x) => (Math.random() < 0.5 ? x : rnd(0, 3)));
    const local = [0, 0, 0, 0];
    let k = 0;
    const step = () => {
      const f = picks[k]; if (local[f] >= 10) { k += 1; if (k < picks.length) step(); return; }
      scene.current?.add(f, local[f]); local[f] += 1; setCounts([...local]); kit.tap();
      k += 1;
      if (k < picks.length) window.setTimeout(step, 650); else { setVoting(false); kit.say('सबै बच्चाले मत दिए। चार्ट हेरौँ!', 'All the children voted. Look at the chart!'); kit.star(); }
    };
    kit.say('बच्चाहरूले मनपर्ने फल रोज्दैछन्।', 'The children are choosing their favourite fruits.');
    step();
  };

  const quiz = useMemo(() => {
    const c = Array.from({ length: 4 }, () => rnd(1, 8));
    // make most and least unique
    const uniq = (arr: number[]) => { const a = arr.slice(); const mx = Math.max(...a), mn = Math.min(...a); return a.filter((v) => v === mx).length === 1 && a.filter((v) => v === mn).length === 1; };
    let cc = c; let guard = 0; while (!uniq(cc) && guard++ < 200) cc = Array.from({ length: 4 }, () => rnd(1, 8));
    const mx = cc.indexOf(Math.max(...cc)), mn = cc.indexOf(Math.min(...cc));
    const qs = [
      { kind: 'count', i: rnd(0, 3) }, { kind: 'most' }, { kind: 'least' }, { kind: 'count', i: rnd(0, 3) }, { kind: 'more', i: mx, j: mn }, { kind: 'total' },
    ];
    return { counts: cc, mx, mn, qs };
  }, []);
  const questions: QuizQuestion[] = quiz.qs.map((q: any) => {
    const num = (v: number) => (kit.lang === 'ne' ? toNp(v) : String(v));
    const fruitOpts = (ans: number) => shuffle([ans, ...shuffle([0, 1, 2, 3].filter((x) => x !== ans), ans + 7).slice(0, 2)], ans + 3).map((v) => ({ key: String(v), label: <span>{FRUITS[v].emoji} {kit.t(FRUITS[v].np, FRUITS[v].en)}</span> }));
    const numOpts = (ans: number) => shuffle(Array.from(new Set([ans, ans + 1, Math.max(0, ans - 1), ans + 2])).slice(0, 3), ans + 11).map((v) => ({ key: String(v), label: num(v) }));
    if (q.kind === 'count') return { np: `${FRUITS[q.i].np} कतिवटा छन्?`, en: `How many ${FRUITS[q.i].en.toLowerCase()}s are there?`, answer: String(quiz.counts[q.i]), options: numOpts(quiz.counts[q.i]) };
    if (q.kind === 'most') return { np: 'सबैभन्दा धेरै कुन फल मन पर्यो?', en: 'Which fruit do the children like the most?', answer: String(quiz.mx), options: fruitOpts(quiz.mx) };
    if (q.kind === 'least') return { np: 'सबैभन्दा कम कुन फल मन पर्यो?', en: 'Which fruit do the children like the least?', answer: String(quiz.mn), options: fruitOpts(quiz.mn) };
    if (q.kind === 'more') { const d = quiz.counts[q.i] - quiz.counts[q.j]; return { np: `${FRUITS[q.i].np}ले ${FRUITS[q.j].np}भन्दा कति धेरै?`, en: `How many more ${FRUITS[q.i].en.toLowerCase()}s than ${FRUITS[q.j].en.toLowerCase()}s?`, answer: String(d), options: numOpts(d) }; }
    const tot = quiz.counts.reduce((a, b) => a + b, 0);
    return { np: 'जम्मा कति बच्चाले मत दिए?', en: 'How many children voted in all?', answer: String(tot), options: numOpts(tot) };
  });

  useEffect(() => {
    if (kit.mode === 'LEARN') { reset(); kit.say('"सर्वेक्षण सुरु" थिचौँ र बच्चाको मत हेरौँ। १ फल = १ बच्चा।', 'Press "Start survey" and watch the votes. 1 fruit = 1 child.'); }
    else if (kit.mode === 'PLAY') { reset(); kit.say('फल थिचेर आफ्नै चार्ट बनाऔँ।', 'Tap a fruit to make your own chart.'); }
    else { scene.current?.set(quiz.counts, true); setCounts(quiz.counts); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const num = (v: number) => (kit.lang === 'ne' ? toNp(v) : String(v));
  const hud = (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 14px', border: '3px solid #0ea5e9' }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>🍎 = 1 {kit.t('बच्चा', 'child')}</div>
      <div style={{ display: 'flex', gap: 10, fontSize: 18, fontWeight: 900 }}>{FRUITS.map((f, i) => <span key={f.id}>{f.emoji} {num(counts[i])}</span>)}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>{kit.t('एउटा चित्र = एक बच्चा', 'One picture = one child')}</div>
      <CBtn color="#8b5cf6" disabled={voting} onClick={survey}>🗳 {kit.t('सर्वेक्षण सुरु', 'Start survey')}</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      {FRUITS.map((f, i) => <CBtn key={f.id} color={f.color} style={{ color: '#1f2937' }} onClick={() => vote(i)}>{f.emoji} {kit.t(f.np, f.en)}</CBtn>)}
      <CBtn color="#f59e0b" onClick={reset}>↺</CBtn>
    </Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} />
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
