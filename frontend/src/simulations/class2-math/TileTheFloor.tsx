/**
 * Lesson 10 · Area (क्षेत्रफल)
 * Tile the Floor — cover a shape with square tiles and count them; compare two shapes.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, cube } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const COLS = 7, ROWS = 5, CELL = 0.95;
type Shape = number[]; // cell indices
const rect = (w: number, h: number, ox = 0, oy = 0): Shape => { const r: number[] = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) r.push((y + oy) * COLS + x + ox); return r; };
const SHAPES: { np: string; en: string; cells: Shape }[] = [
  { np: 'आयत ३×४', en: 'Rectangle 3×4', cells: rect(4, 3) },
  { np: 'वर्ग ३×३', en: 'Square 3×3', cells: rect(3, 3) },
  { np: 'L आकार', en: 'L shape', cells: [...rect(2, 4), ...rect(2, 1, 2, 3)] },
  { np: 'सिँढी', en: 'Stairs', cells: [0, 1, 2, 3, 4, COLS, COLS + 1, COLS + 2, COLS + 3, COLS * 2, COLS * 2 + 1, COLS * 2 + 2, COLS * 3, COLS * 3 + 1, COLS * 4] },
  { np: 'T आकार', en: 'T shape', cells: [...rect(5, 1), ...rect(1, 3, 2, 1)] },
];
const randShape = (n: number): Shape => { const set = new Set<number>([rnd(0, COLS * ROWS - 1)]); while (set.size < n) { const arr = Array.from(set); const p = arr[rnd(0, arr.length - 1)]; const d = [1, -1, COLS, -COLS][rnd(0, 3)]; const q = p + d; if (q < 0 || q >= COLS * ROWS) continue; if (Math.abs(d) === 1 && Math.floor(q / COLS) !== Math.floor(p / COLS)) continue; set.add(q); } return Array.from(set); };

export const TileTheFloor: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L10-01', chapter: 10, titleNp: 'टाइल बिछ्याऔँ (क्षेत्रफल)', titleEn: 'Tile the Floor (Area)' });
  const [tiled, setTiled] = useState<Set<number>>(new Set());
  const [target, setTarget] = useState<Shape>([]);
  const [shapeName, setShapeName] = useState('');
  const [second, setSecond] = useState<Shape | null>(null);
  const [li, setLi] = useState(0);
  const [busy, setBusy] = useState(false);
  const scene = useRef<{ drawA: (outline: Shape, tiles: Set<number>, animate?: number[]) => void; drawB: (tiles: Shape | null) => void } | null>(null);
  const live = useRef({ mode: kit.mode, toggle: (_i: number) => {} });
  live.current.mode = kit.mode;

  useStage(kit.stageRef, (ctx) => {
    const mkBoard = (x: number) => {
      const g = new THREE.Group(); g.position.set(x, 0, 0); ctx.scene.add(g);
      const floor = shadowed(new THREE.Mesh(new THREE.BoxGeometry(COLS * CELL + 0.3, 0.2, ROWS * CELL + 0.3), mat('#e2e8f0', 0.9))); floor.position.set(0, -0.1, 0); g.add(floor);
      const cells: THREE.Mesh[] = []; const tiles: (THREE.Object3D | null)[] = Array(COLS * ROWS).fill(null);
      for (let i = 0; i < COLS * ROWS; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.94, 0.04, CELL * 0.94), new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.9 })); c.position.set(((i % COLS) - (COLS - 1) / 2) * CELL, 0.02, (Math.floor(i / COLS) - (ROWS - 1) / 2) * CELL); c.userData.cell = i; g.add(c); cells.push(c); }
      return { g, cells, tiles };
    };
    const A = mkBoard(-4.2), B = mkBoard(4.6); B.g.visible = false;
    const cellPos = (i: number) => new THREE.Vector3(((i % COLS) - (COLS - 1) / 2) * CELL, 0.45, (Math.floor(i / COLS) - (ROWS - 1) / 2) * CELL);
    const colorFor = (i: number) => ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'][(i % COLS + Math.floor(i / COLS)) % 5];
    const put = (b: typeof A, i: number, animate: boolean) => {
      if (b.tiles[i]) return; const t = cube(colorFor(i), CELL * 0.88); t.scale.y = 0.55; const p = cellPos(i); t.position.copy(p); b.g.add(t); b.tiles[i] = t;
      if (animate) { t.scale.set(0.01, 0.01, 0.01); ctx.tween(300, (k) => t.scale.set(k, 0.55 * k, k), undefined, ease.back); }
    };
    const draw = (b: typeof A, outline: Shape | null, tiles: Set<number>, animateOrder?: number[]) => {
      b.tiles.forEach((t, i) => { if (t) { b.g.remove(t); b.tiles[i] = null; } });
      b.cells.forEach((c, i) => { (c.material as THREE.MeshStandardMaterial).color.set(outline && outline.includes(i) ? '#fde68a' : '#cbd5e1'); });
      if (animateOrder) animateOrder.forEach((i, k) => window.setTimeout(() => put(b, i, true), k * 160)); else tiles.forEach((i) => put(b, i, false));
    };
    scene.current = {
      drawA: (outline, tiles, animate) => { draw(A, outline, tiles, animate); },
      drawB: (tiles) => { B.g.visible = !!tiles; if (tiles) draw(B, tiles, new Set(tiles)); },
    };
    ctx.onTap(() => A.cells, (hit) => { if (hit && live.current.mode === 'PLAY') live.current.toggle(hit.object.userData.cell); });
    draw(A, null, new Set());
    return () => { scene.current = null; };
  }, [], { camera: [0, 11, 9.5], target: [0, 0, 0.2], minDistance: 7, maxDistance: 20, ground: 0xd9f99d });

  live.current.toggle = (i) => {
    const next = new Set(tiled); if (next.has(i)) next.delete(i); else next.add(i);
    setTiled(next); scene.current?.drawA([], next); kit.tap();
    kit.say(`${next.size}`, `${next.size}`, true);
  };

  const loadShape = (cells: Shape, name: string, auto = true) => {
    setTarget(cells); setShapeName(name); setSecond(null); scene.current?.drawB(null);
    if (auto) { setBusy(true); setTiled(new Set()); scene.current?.drawA(cells, new Set(), cells); let k = 0; const tick = () => { k += 1; kit.say(`${k}`, `${k}`, true); if (k < cells.length) window.setTimeout(tick, 160); else { setTiled(new Set(cells)); setBusy(false); kit.good(`${cells.length} टाइल = ${cells.length} वर्ग एकाइ`, `${cells.length} tiles = ${cells.length} square units`); kit.star(); } }; window.setTimeout(tick, 200); }
    else { setTiled(new Set(cells)); scene.current?.drawA(cells, new Set(cells)); }
  };
  useEffect(() => {
    setBusy(false);
    if (kit.mode === 'LEARN') { const s = SHAPES[li % SHAPES.length]; loadShape(s.cells, kit.lang === 'ne' ? s.np : s.en); kit.say('प्रत्येक वर्ग टाइल गनेर क्षेत्रफल पत्ता लगाऔँ।', 'Count the square tiles to find the area.'); }
    else if (kit.mode === 'PLAY') { setTiled(new Set()); setTarget([]); setSecond(null); scene.current?.drawB(null); scene.current?.drawA([], new Set()); kit.say('वर्गहरू छोएर टाइल बिछ्याऔँ।', 'Tap squares to lay tiles.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    if (i % 2 === 0) { const s = randShape(rnd(5, 16)); return { kind: 'count', a: s }; }
    const n1 = rnd(6, 15); let n2 = rnd(6, 15); while (n2 === n1) n2 = rnd(6, 15);
    return { kind: 'bigger', a: randShape(n1), b: randShape(n2) };
  }), []);
  const questions: (QuizQuestion & { d: any })[] = data.map((d: any, i) => d.kind === 'count'
    ? { np: 'आकारमा कतिवटा वर्ग टाइल छन्?', en: 'How many square tiles are in the shape?', d, answer: String(d.a.length), options: numChoices(d.a.length, i * 3 + 1, [1, -1, 2, -2]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) }
    : { np: 'कुनको क्षेत्रफल बढी छ?', en: 'Which shape has the bigger area?', d, answer: d.a.length > d.b.length ? 'left' : 'right', options: [{ key: 'left', label: kit.t('बायाँ', 'Left') }, { key: 'right', label: kit.t('दायाँ', 'Right') }] });

  const area = tiled.size;
  const hud = (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      {kit.mode === 'CHALLENGE' ? <div style={{ fontSize: 18, fontWeight: 900 }}>{kit.t('टाइल गनौँ!', 'Count the tiles!')}</div> : <>
        {shapeName && <div style={{ fontSize: 15, fontWeight: 800 }}>{shapeName}</div>}
        <div style={{ fontSize: 15, fontWeight: 800 }}>{kit.t('क्षेत्रफल', 'Area')}</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#0369a1' }}>{fmt(kit.lang, area)} {kit.t('वर्ग एकाइ', 'sq. units')}</div></>}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('सतहले ढाकेको ठाउँ नै क्षेत्रफल हो।', 'Area is how much flat space a shape covers.')}</div>
      <CBtn color="#8b5cf6" disabled={busy} onClick={() => loadShape(target, shapeName)}>↺ {kit.t('फेरि', 'Again')}</CBtn>
      <CBtn color="#16a34a" disabled={busy} onClick={() => setLi(li + 1)}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>{kit.t('वर्ग छोएर टाइल राखौँ / हटाऔँ', 'Tap a square to add or remove a tile')}</div>
      <CBtn color="#f59e0b" onClick={() => { setTiled(new Set()); scene.current?.drawA([], new Set()); }}>↺ {kit.t('सबै हटाऔँ', 'Clear')}</CBtn>
      <CBtn color="#8b5cf6" onClick={() => { const s = randShape(rnd(6, 14)); setTiled(new Set(s)); scene.current?.drawA([], new Set(s)); }}>🎲</CBtn>
    </Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { const d = q.d; setShapeName(''); setTiled(new Set(d.a)); scene.current?.drawA([], new Set(d.a)); setSecond(d.b || null); scene.current?.drawB(d.b || null); }} />
  );
  void second;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
