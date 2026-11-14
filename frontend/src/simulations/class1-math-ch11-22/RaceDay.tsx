/**
 * Chapter 14 · Ordinal numbers (क्रमसूचक सङ्ख्या)
 * Race Day — ten animal friends race; the finishing order teaches 1st, 2nd, 3rd … 10th.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, QuizPanel, Controls, CBtn, useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { critter, CritterKind, mat, shadowed, textSprite, retext, star } from '../class1-math-kit/models';
import { ORD_EN, ORD_NP, ORD_SHORT, shuffle } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const KINDS: CritterKind[] = ['bear', 'rabbit', 'cat', 'dog', 'mouse'];
const COLORS = ['#a16207', '#f9a8d4', '#fb923c', '#d6b88c', '#94a3b8', '#60a5fa', '#34d399', '#c084fc', '#f87171', '#facc15'];
const NAMES_EN = ['Brown bear', 'Pink rabbit', 'Orange cat', 'Sandy dog', 'Grey mouse', 'Blue rabbit', 'Green cat', 'Purple dog', 'Red bear', 'Yellow mouse'];
const NAMES_NP = ['खैरो भालु', 'गुलाबी खरायो', 'सुन्तला बिरालो', 'बालुवा कुकुर', 'खरानी मुसा', 'निलो खरायो', 'हरियो बिरालो', 'बैजनी कुकुर', 'रातो भालु', 'पहेँलो मुसा'];
const EMOJI = ['🐻', '🐰', '🐱', '🐶', '🐭', '🐰', '🐱', '🐶', '🐻', '🐭'];
const START_X = -8, FINISH_X = 8;

export const RaceDay: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH14-01', chapter: 14, titleNp: 'दौड प्रतियोगिता (क्रमसूचक सङ्ख्या)', titleEn: 'Race Day (Ordinal Numbers)' });
  /** order[i] = which racer finished in place i+1 */
  const [order, setOrder] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const scene = useRef<{ race: (order: number[], animate: boolean, done?: () => void) => void; reset: () => void } | null>(null);
  const live = useRef({ mode: kit.mode, lang: kit.lang, order: [] as number[] });
  live.current.mode = kit.mode; live.current.lang = kit.lang; live.current.order = order;

  useStage(kit.stageRef, (ctx) => {
    const lanes = 10, laneW = 1.25;
    const track = shadowed(new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, lanes * laneW + 0.8), mat('#c2410c', 0.95)));
    track.position.set(0, 0.1, 0); ctx.scene.add(track);
    for (let i = 0; i <= lanes; i++) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(20, 0.02, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      l.position.set(0, 0.21, (i - lanes / 2) * laneW); ctx.scene.add(l);
    }
    const finish = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, lanes * laneW), new THREE.MeshBasicMaterial({ color: 0x111827 }));
    finish.position.set(FINISH_X + 0.8, 0.22, 0); ctx.scene.add(finish);
    const flag = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.2, lanes * laneW + 0.8), mat('#f8fafc', 0.5)));
    flag.position.set(FINISH_X + 1.5, 1.6, 0); flag.scale.set(1, 0.18, 1); flag.position.y = 3.3; ctx.scene.add(flag);
    const racers: THREE.Group[] = [];
    const labels: THREE.Sprite[] = [];
    const medals: THREE.Object3D[] = [];
    for (let i = 0; i < 10; i++) {
      const r = critter(KINDS[i % 5], COLORS[i]); r.scale.setScalar(0.85);
      r.rotation.y = Math.PI / 2; r.position.set(START_X, 0.2, (i - 4.5) * laneW);
      r.userData.racer = i; r.userData.lane = (i - 4.5) * laneW; ctx.scene.add(r); racers.push(r);
      const lb = textSprite('', 1.5, { px: 70, w: 256, h: 128, bg: '#ffffff', border: '#0ea5e9' }); lb.position.set(0, 2.4, 0); lb.visible = false; r.add(lb); labels.push(lb);
    }
    const showLabels = (ord: number[]) => {
      ord.forEach((who, place) => { retext(labels[who], `${ORD_SHORT[place + 1]}`, { px: 78, w: 256, h: 128, bg: place < 3 ? '#fde047' : '#ffffff', border: '#0ea5e9' }); labels[who].visible = true; });
      medals.forEach((m) => m.parent?.remove(m)); medals.length = 0;
      ord.slice(0, 3).forEach((who, place) => { const s = star(['#facc15', '#cbd5e1', '#d97706'][place], 0.35); s.position.set(0, 3.2, 0); racers[who].add(s); medals.push(s); });
    };
    const reset = () => {
      racers.forEach((r) => { r.position.x = START_X; r.rotation.y = Math.PI / 2; });
      labels.forEach((l) => { l.visible = false; });
      medals.forEach((m) => m.parent?.remove(m)); medals.length = 0;
    };
    const race = (ord: number[], animate: boolean, done?: () => void) => {
      reset();
      const finishX = (who: number) => FINISH_X - ord.indexOf(who) * 0.55; // rank spread so 1st is furthest
      if (!animate) { racers.forEach((r, i) => { r.position.x = finishX(i); r.rotation.y = Math.PI / 2; }); showLabels(ord); done?.(); return; }
      const dur = 5600;
      ctx.tween(dur, (k) => {
        racers.forEach((r, i) => {
          const rank = ord.indexOf(i);
          const prog = Math.min(1, k / (0.78 + rank * 0.022));
          r.position.x = START_X + (finishX(i) - START_X) * prog;
          const running = prog < 1;
          r.position.y = 0.2 + (running ? Math.abs(Math.sin(k * 60 + i)) * 0.12 : 0);
          (r.userData.legs || []).forEach((l: THREE.Object3D, j: number) => { l.position.z = 0.05 + (running ? Math.sin(k * 60 + i + j * Math.PI) * 0.12 : 0); });
        });
      }, () => { showLabels(ord); done?.(); }, (k) => k);
    };
    scene.current = { race, reset };
    ctx.onTap(() => racers, (hit) => {
      if (!hit || live.current.mode === 'CHALLENGE') return;
      let o: THREE.Object3D | null = hit.object;
      while (o && o.userData.racer === undefined) o = o.parent;
      if (!o || !live.current.order.length) return;
      const who = o.userData.racer as number;
      const place = live.current.order.indexOf(who) + 1;
      kit.tap();
      kit.say(`${NAMES_NP[who]} ${ORD_NP[place]} भयो।`, `The ${NAMES_EN[who].toLowerCase()} came ${ORD_EN[place]}.`);
    });
    return () => { scene.current = null; };
  }, [], { camera: [-1, 9, 12.5], target: [0.5, 0.8, 0], minDistance: 7, maxDistance: 26, ground: 0x86efac });

  const startRace = () => {
    if (running) return;
    const ord = shuffle(Array.from({ length: 10 }, (_, i) => i));
    setOrder(ord); setRunning(true);
    kit.say('तयार… एक, दुई, तीन… दौडौँ!', 'Ready… 1, 2, 3… Go!');
    scene.current?.race(ord, true, () => { setRunning(false); kit.good(`${NAMES_NP[ord[0]]} पहिलो भयो!`, `The ${NAMES_EN[ord[0]].toLowerCase()} won!`); kit.star(); });
  };
  useEffect(() => { if (kit.mode !== 'CHALLENGE') { scene.current?.reset(); setOrder([]); kit.say('दौड सुरु गरौँ! बटन थिचौँ।', 'Press the button to start the race!'); } /* eslint-disable-next-line */ }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const ord = shuffle(Array.from({ length: 10 }, (_, j) => j));
    const place = 1 + Math.floor(Math.random() * 10);
    const who = ord[place - 1];
    if (i % 2 === 0) {
      const others = shuffle(ord.filter((x) => x !== who)).slice(0, 2);
      return { kind: 0, ord, place, who, opts: shuffle([who, ...others]) };
    }
    const others = shuffle(Array.from({ length: 10 }, (_, p) => p + 1).filter((p) => p !== place)).slice(0, 2);
    return { kind: 1, ord, place, who, opts: shuffle([place, ...others]) };
  }), []);
  const questions: (QuizQuestion & { ord: number[] })[] = data.map((d) => d.kind === 0
    ? { np: `${ORD_NP[d.place]} को भयो? (${ORD_SHORT[d.place]})`, en: `Who came ${ORD_EN[d.place]}? (${ORD_SHORT[d.place]})`, ord: d.ord, answer: String(d.who), options: d.opts.map((w) => ({ key: String(w), label: <span title={NAMES_EN[w]}>{EMOJI[w]}<span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 7, background: COLORS[w], marginLeft: 6, border: '2px solid #fff' }} /></span> })) }
    : { np: `${NAMES_NP[d.who]} कति औँ भयो?`, en: `What place did the ${NAMES_EN[d.who].toLowerCase()} get?`, ord: d.ord, answer: String(d.place), options: d.opts.map((p) => ({ key: String(p), label: ORD_SHORT[p] })) });

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { setOrder(q.ord); scene.current?.race(q.ord, false); }} />
  ) : (
    <div>
      <Controls>
        <CBtn color="#16a34a" disabled={running} onClick={startRace}>🏁 {order.length ? kit.t('फेरि दौडौँ', 'Race again') : kit.t('दौड सुरु', 'Start race')}</CBtn>
        <div style={{ fontWeight: 800, fontSize: 15, flex: 1, minWidth: 180 }}>{order.length ? kit.t('कुनै जनावरलाई छोएर उसको स्थान सुनौँ', 'Tap an animal to hear its place') : kit.t('दौड सकिएपछि जनावर छोऔँ', 'After the race, tap an animal')}</div>
      </Controls>
      {order.length > 0 && !running && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {order.map((w, p) => (
            <div key={p} style={{ background: p < 3 ? '#fef9c3' : '#f1f5f9', border: '2px solid #cbd5e1', borderRadius: 12, padding: '4px 10px', fontWeight: 800, fontSize: 14 }}>
              {ORD_SHORT[p + 1]} {EMOJI[w]} <span style={{ color: '#64748b', fontSize: 12 }}>{kit.t(ORD_NP[p + 1], ORD_EN[p + 1])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} panel={panel} />;
};
