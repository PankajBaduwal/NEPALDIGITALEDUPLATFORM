/**
 * Chapter 20 · Coins and Notes (सिक्का र नोट)
 * Coins & Notes Explorer — Nepali coins and notes on a 3D table: flip them, hear their value, make an amount.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { coin, note, mat, shadowed, NOTE_VALUES, COIN_VALUES } from '../class1-math-kit/models';
import { npName, enName, toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const NOTE_BG: Record<number, string> = { 5: '#f9a8a8', 10: '#d8b4fe', 20: '#fdba74', 50: '#93c5fd', 100: '#bef264' };

export const CoinsAndNotes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH20-01', chapter: 20, titleNp: 'सिक्का र नोट चिनौँ', titleEn: 'Coins and Notes Explorer' });
  const [picked, setPicked] = useState<{ kind: 'coin' | 'note'; v: number } | null>(null);
  const [target, setTarget] = useState(35);
  const [table, setTable] = useState<{ kind: 'coin' | 'note'; v: number }[]>([]);
  const scene = useRef<{ flip: (o: THREE.Object3D) => void; showOne: (kind: 'coin' | 'note', v: number) => void; showAll: () => void; addToTable: (kind: 'coin' | 'note', v: number) => void; clearTable: () => void } | null>(null);
  const live = useRef({ mode: kit.mode, onPick: (_k: 'coin' | 'note', _v: number) => {} });
  live.current.mode = kit.mode;
  live.current.onPick = (k, v) => {
    setPicked({ kind: k, v });
    kit.say(`${npName(v)} रुपैयाँको ${k === 'coin' ? 'सिक्का' : 'नोट'}`, `${enName(v)} rupee ${k}`);
  };

  useStage(kit.stageRef, (ctx) => {
    const tableTop = shadowed(new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 10), mat('#a16207', 0.85))); tableTop.position.y = -0.05; ctx.scene.add(tableTop);
    const things = new THREE.Group(); ctx.scene.add(things);
    const stack = new THREE.Group(); ctx.scene.add(stack);
    const clear = () => [...things.children].forEach((c) => things.remove(c));
    const showAll = () => {
      clear(); stack.visible = false; things.visible = true;
      NOTE_VALUES.forEach((v, i) => { const n = note(v); n.position.set(-5.2 + (i % 3) * 3.6 + (i >= 3 ? 1.8 : 0), 0.3, -2 + Math.floor(i / 3) * 2.1); n.rotation.y = (i % 2 ? 1 : -1) * 0.08; n.userData.kind = 'note'; things.add(n); });
      COIN_VALUES.forEach((v, i) => { const c = coin(v, 0.8); c.position.set(-3.6 + i * 2.4, 0.4, 2.8); c.userData.kind = 'coin'; things.add(c); });
    };
    const showOne = (kind: 'coin' | 'note', v: number) => {
      clear(); stack.visible = false; things.visible = true;
      const o = kind === 'note' ? note(v) : coin(v, 1.8); o.scale.setScalar(kind === 'note' ? 1.5 : 1); o.position.set(0, kind === 'note' ? 0.5 : 0.5, 0); o.userData.kind = kind; things.add(o);
    };
    const flip = (o: THREE.Object3D) => {
      const from = o.rotation.x; const to = from + Math.PI; const y0 = o.position.y;
      ctx.tween(600, (k) => { o.rotation.x = from + (to - from) * k; o.position.y = y0 + Math.sin(k * Math.PI) * 1.4; }, undefined, ease.inOut);
    };
    const addToTable = (kind: 'coin' | 'note', v: number) => {
      things.visible = false; stack.visible = true;
      const o = kind === 'note' ? note(v) : coin(v, 0.75);
      const i = stack.children.length;
      o.position.set(-6 + (i % 5) * (kind === 'note' ? 3.3 : 1.7) * 0.8, 6, -1.5 + Math.floor(i / 5) * 2.2);
      o.userData.target = new THREE.Vector3(-5.5 + (i % 5) * 2.7, 0.35 + Math.floor(i / 25) * 0.05, -2 + Math.floor(i / 5) * 2.1);
      stack.add(o);
      const p0 = o.position.clone(); const p1 = o.userData.target;
      ctx.tween(520, (k) => o.position.lerpVectors(p0, p1, k), undefined, ease.bounce);
    };
    const clearTable = () => [...stack.children].forEach((c) => stack.remove(c));
    scene.current = { flip, showOne, showAll, addToTable, clearTable };
    showAll();
    ctx.onTap(() => [...things.children], (hit) => {
      if (!hit || live.current.mode === 'CHALLENGE') return;
      let o: THREE.Object3D | null = hit.object;
      while (o && o.userData.value === undefined) o = o.parent;
      if (!o) return;
      flip(o); kit.tap(); live.current.onPick(o.userData.kind, o.userData.value);
    });
    return () => { scene.current = null; };
  }, [], { camera: [0, 11, 10], target: [0, 0, 0.5], minDistance: 6, maxDistance: 20, ground: null, sky: 0xe0f2fe });

  const total = table.reduce((a, t) => a + t.v, 0);
  const num = (v: number) => (kit.lang === 'ne' ? toNp(v) : String(v));
  useEffect(() => {
    const s = scene.current; if (!s) return;
    if (kit.mode === 'LEARN') { s.showAll(); setPicked(null); kit.say('नोट र सिक्का छोएर पल्टाऔँ।', 'Tap a note or coin to flip it.'); }
    else if (kit.mode === 'PLAY') { s.clearTable(); setTable([]); const t = 5 * rnd(2, 14); setTarget(t); kit.say(`रु. ${toNp(t)} बनाऔँ।`, `Make Rs ${t}.`); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const addMoney = (kind: 'coin' | 'note', v: number) => {
    if (total + v > 200) { kit.oops(); return; }
    scene.current?.addToTable(kind, v); setTable((t) => [...t, { kind, v }]); kit.tap();
    const nt = total + v;
    if (nt === target) { kit.good(`रु. ${toNp(nt)} भयो!`, `That makes Rs ${nt}!`); kit.star(); }
  };
  const newTarget = () => { scene.current?.clearTable(); setTable([]); const t = 5 * rnd(2, 14); setTarget(t); kit.say(`रु. ${toNp(t)} बनाऔँ।`, `Make Rs ${t}.`); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const kind: 'coin' | 'note' = i % 3 === 2 ? 'coin' : 'note';
    const pool = kind === 'note' ? NOTE_VALUES : COIN_VALUES;
    const v = pool[rnd(0, pool.length - 1)];
    const opts = shuffle([v, ...shuffle(pool.filter((x) => x !== v)).slice(0, 2)]);
    return { kind, v, opts };
  }), []);
  const questions: (QuizQuestion & { kind: 'coin' | 'note'; v: number })[] = data.map((d) => ({
    np: d.kind === 'note' ? 'यो नोट कति रुपैयाँको हो?' : 'यो सिक्का कति रुपैयाँको हो?', en: d.kind === 'note' ? 'How many rupees is this note?' : 'How many rupees is this coin?',
    kind: d.kind, v: d.v, answer: String(d.v),
    options: d.opts.map((o) => ({ key: String(o), label: <span>{kit.t('रु.', 'Rs')} {num(o)}</span> })),
  }));

  const hud = kit.mode === 'PLAY' ? (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{kit.t('बनाउनु पर्ने', 'Make')}: <b style={{ fontSize: 26 }}>{kit.t('रु.', 'Rs')} {num(target)}</b></div>
      <div style={{ fontSize: 22, fontWeight: 900, color: total === target ? '#16a34a' : total > target ? '#dc2626' : '#0369a1' }}>{kit.t('जम्मा', 'Total')}: {kit.t('रु.', 'Rs')} {num(total)}</div>
    </div>
  ) : kit.mode === 'LEARN' && picked ? (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', fontSize: 24, fontWeight: 900 }}>
      {picked.kind === 'note' ? '💵' : '🪙'} {kit.t('रु.', 'Rs')} {num(picked.v)}
    </div>
  ) : null;

  const chip = (kind: 'coin' | 'note', v: number) => (
    <CBtn key={`${kind}${v}`} onClick={() => addMoney(kind, v)} style={{ background: kind === 'note' ? NOTE_BG[v] : '#fbbf24', color: '#1f2937', minWidth: 72, padding: '8px 10px', boxShadow: '0 3px 0 rgba(0,0,0,.2)', borderRadius: kind === 'coin' ? 40 : 10 }}>
      {kind === 'note' ? '💵' : '🪙'} {num(v)}
    </CBtn>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('नेपाली नोटहरू: ५, १०, २०, ५०, १००। सिक्का: १, २, ५, १०।', 'Nepali notes: 5, 10, 20, 50, 100. Coins: 1, 2, 5, 10.')}</div>
      <CBtn color="#8b5cf6" onClick={() => scene.current?.showAll()}>↺</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <div>
      <Controls>
        {COIN_VALUES.map((v) => chip('coin', v))}
        {NOTE_VALUES.map((v) => chip('note', v))}
        <CBtn color="#f59e0b" onClick={() => { scene.current?.clearTable(); setTable([]); }}>↺</CBtn>
        <CBtn color="#8b5cf6" onClick={newTarget}>🎲 {kit.t('नयाँ रकम', 'New amount')}</CBtn>
      </Controls>
    </div>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => scene.current?.showOne(q.kind, q.v)} />
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
