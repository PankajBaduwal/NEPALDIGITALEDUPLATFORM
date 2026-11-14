import React from 'react';
import * as THREE from 'three';
import { StageCtx, ease } from '../class1-math-kit/useStage';
import { mat, shadowed } from '../class1-math-kit/models';

export type ShapeKind = 'circle' | 'triangle' | 'square' | 'rectangle';
export const SHAPES: ShapeKind[] = ['circle', 'triangle', 'square', 'rectangle'];
export const SC: Record<ShapeKind, string> = { circle: '#ef4444', triangle: '#facc15', square: '#2563eb', rectangle: '#22c55e' };
export const SN: Record<ShapeKind, [string, string]> = { circle: ['वृत्त', 'circle'], triangle: ['त्रिभुज', 'triangle'], square: ['वर्ग', 'square'], rectangle: ['आयत', 'rectangle'] };
export const SPROP: Record<ShapeKind, [string, string]> = {
  circle: ['गोलो छ। कुनै कुना छैन।', 'It is round. No corners.'],
  triangle: ['तीन भुजा र तीन कुना छन्।', 'It has 3 sides and 3 corners.'],
  square: ['चार बराबर भुजा र चार कुना छन्।', 'It has 4 equal sides and 4 corners.'],
  rectangle: ['चार भुजा छन्: दुई लामा, दुई छोटा।', 'It has 4 sides: two long, two short.'],
};
export const SSIDES: Record<ShapeKind, number> = { circle: 0, triangle: 3, square: 4, rectangle: 4 };

/** a small SVG picture of a shape, for answer buttons */
export const ShapeIcon: React.FC<{ kind: ShapeKind; size?: number; color?: string }> = ({ kind, size = 44, color }) => {
  const c = color || SC[kind];
  return (
    <svg width={size * (kind === 'rectangle' ? 1.4 : 1)} height={size} viewBox={kind === 'rectangle' ? '0 0 70 50' : '0 0 50 50'} style={{ verticalAlign: 'middle' }}>
      {kind === 'circle' && <circle cx="25" cy="25" r="22" fill={c} />}
      {kind === 'triangle' && <polygon points="25,4 47,45 3,45" fill={c} />}
      {kind === 'square' && <rect x="5" y="5" width="40" height="40" rx="4" fill={c} />}
      {kind === 'rectangle' && <rect x="3" y="9" width="64" height="32" rx="4" fill={c} />}
    </svg>
  );
};

const shapeOf = (kind: ShapeKind): THREE.Shape => {
  const s = new THREE.Shape();
  if (kind === 'circle') s.absarc(0, 0, 0.8, 0, Math.PI * 2, false);
  else if (kind === 'triangle') { s.moveTo(-1, -0.9); s.lineTo(1, -0.9); s.lineTo(0, 0.9); s.closePath(); }
  else if (kind === 'square') { s.moveTo(-0.8, -0.8); s.lineTo(0.8, -0.8); s.lineTo(0.8, 0.8); s.lineTo(-0.8, 0.8); s.closePath(); }
  else { s.moveTo(-1.2, -0.7); s.lineTo(1.2, -0.7); s.lineTo(1.2, 0.7); s.lineTo(-1.2, 0.7); s.closePath(); }
  return s;
};
const geoCache: Partial<Record<ShapeKind, THREE.ExtrudeGeometry>> = {};
/** a thick standing token of a shape; faces +z. `s` scales it. */
export const shapeToken = (kind: ShapeKind, color: string = SC[kind], s = 1, depth = 0.35) => {
  let geo = geoCache[kind];
  if (!geo) { geo = new THREE.ExtrudeGeometry(shapeOf(kind), { depth: 0.3, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2, curveSegments: 40 }); geo.center(); geoCache[kind] = geo; }
  const m = new THREE.Mesh(geo, mat(color, 0.35));
  m.scale.set(s, s, depth / 0.4 + 0.15);
  m.userData.k = kind;
  return shadowed(m);
};

/* ───────── pictures built from shapes ───────── */
export interface Part { k: ShapeKind; x: number; y: number; s?: number; sx?: number; sy?: number; rot?: number; col: string; name?: [string, string] }
export interface Picture { np: string; en: string; parts: Part[] }
export const PICTURES: Picture[] = [
  {
    np: 'घर', en: 'House', parts: [
      { k: 'square', x: 0, y: 1.6, s: 2, col: '#fcd34d', name: ['घरको भित्ता', 'the wall'] },
      { k: 'triangle', x: 0, y: 4.1, s: 1.75, sy: 0.62, col: '#b91c1c', name: ['छाना', 'the roof'] },
      { k: 'rectangle', x: 0.7, y: 1.0, s: 0.8, rot: Math.PI / 2, col: '#92400e', name: ['ढोका', 'the door'] },
      { k: 'square', x: -0.95, y: 2.1, s: 0.45, col: '#7dd3fc', name: ['झ्याल', 'the window'] },
      { k: 'circle', x: 5, y: 5, s: 1, col: '#fb923c', name: ['घाम', 'the sun'] },
      { k: 'rectangle', x: -5, y: 1.2, s: 0.9, sy: 0.5, rot: 0, col: '#a16207', name: ['सूचना पाटी', 'the signboard'] },
      { k: 'triangle', x: -5, y: 2.3, s: 0.45, col: '#16a34a', name: ['झण्डा', 'the flag'] },
    ],
  },
  {
    np: 'रोबोट', en: 'Robot', parts: [
      { k: 'square', x: 0, y: 4.4, s: 0.95, col: '#94a3b8', name: ['टाउको', 'the head'] },
      { k: 'rectangle', x: 0, y: 2.4, s: 1.15, rot: Math.PI / 2, col: '#64748b', name: ['जीउ', 'the body'] },
      { k: 'circle', x: -0.4, y: 4.6, s: 0.18, col: '#38bdf8', name: ['आँखा', 'an eye'] },
      { k: 'circle', x: 0.4, y: 4.6, s: 0.18, col: '#38bdf8', name: ['आँखा', 'an eye'] },
      { k: 'rectangle', x: 0, y: 4.1, s: 0.22, col: '#ef4444', name: ['मुख', 'the mouth'] },
      { k: 'triangle', x: 0, y: 5.6, s: 0.35, col: '#facc15', name: ['टोपी', 'the hat'] },
      { k: 'rectangle', x: -1.6, y: 2.6, s: 0.55, rot: Math.PI / 2, col: '#475569', name: ['हात', 'an arm'] },
      { k: 'rectangle', x: 1.6, y: 2.6, s: 0.55, rot: Math.PI / 2, col: '#475569', name: ['हात', 'an arm'] },
      { k: 'rectangle', x: -0.5, y: 0.7, s: 0.5, rot: Math.PI / 2, col: '#475569', name: ['खुट्टा', 'a leg'] },
      { k: 'rectangle', x: 0.5, y: 0.7, s: 0.5, rot: Math.PI / 2, col: '#475569', name: ['खुट्टा', 'a leg'] },
      { k: 'circle', x: 0, y: 2.9, s: 0.25, col: '#f43f5e', name: ['बटन', 'a button'] },
    ],
  },
  {
    np: 'डुङ्गा', en: 'Boat', parts: [
      { k: 'rectangle', x: 0, y: 0.9, s: 1.6, sy: 0.5, col: '#92400e', name: ['डुङ्गाको तल्लो भाग', 'the hull'] },
      { k: 'triangle', x: 0.4, y: 3.2, s: 1.4, col: '#f8fafc', name: ['पाल', 'the sail'] },
      { k: 'rectangle', x: -1.1, y: 3.0, s: 0.9, sx: 0.25, rot: Math.PI / 2, col: '#78350f', name: ['खम्बा', 'the mast'] },
      { k: 'circle', x: -4.5, y: 5, s: 1, col: '#fb923c', name: ['घाम', 'the sun'] },
      { k: 'triangle', x: -1.1, y: 4.9, s: 0.3, col: '#ef4444', name: ['झण्डा', 'the flag'] },
      { k: 'square', x: 4.5, y: 1.1, s: 0.5, col: '#38bdf8', name: ['खोक्सा', 'a box'] },
    ],
  },
];

/** a vertical board that holds shape parts (used by Colour, Detective and Builder) */
export class ShapeBoard {
  group = new THREE.Group();
  parts: THREE.Mesh[] = [];
  wall: THREE.Mesh;
  private tapCb: ((i: number) => void) | null = null;
  constructor(public ctx: StageCtx, wallColor = '#e0f2fe') {
    ctx.scene.add(this.group);
    this.wall = shadowed(new THREE.Mesh(new THREE.BoxGeometry(14, 7.4, 0.3), mat(wallColor, 0.95)));
    this.wall.position.set(0, 3.7, -0.4); this.group.add(this.wall);
    ctx.onTap(() => this.parts, (hit) => { if (hit && this.tapCb) this.tapCb(this.parts.indexOf(hit.object as THREE.Mesh)); });
  }
  onTapPart(cb: ((i: number) => void) | null) { this.tapCb = cb; }
  clear() { this.parts.forEach((p) => this.group.remove(p)); this.parts = []; }
  add(p: Part, colour?: string, animate = true) {
    const m = shapeToken(p.k, colour || p.col, p.s ?? 1);
    m.scale.x *= p.sx ?? 1; m.scale.y *= p.sy ?? 1;
    m.rotation.z = p.rot ?? 0;
    m.position.set(p.x, p.y, 0.2 + this.parts.length * 0.002);
    m.userData.part = p; m.userData.base = m.scale.clone();
    this.group.add(m); this.parts.push(m);
    if (animate) { const b = m.userData.base as THREE.Vector3; m.scale.set(0.01, 0.01, 0.01); this.ctx.tween(380, (k) => m.scale.set(b.x * Math.max(0.01, k), b.y * Math.max(0.01, k), b.z * Math.max(0.01, k)), undefined, ease.back); }
    return m;
  }
  load(pic: Picture, grey = false) { this.clear(); pic.parts.forEach((p, i) => window.setTimeout(() => { if (this.parts.length === i) this.add(p, grey ? '#cbd5e1' : undefined); }, i * 90)); }
  loadNow(pic: Picture, grey = false) { this.clear(); pic.parts.forEach((p) => this.add(p, grey ? '#cbd5e1' : undefined, false)); }
  paint(i: number, c: string) {
    const m = this.parts[i]; if (!m) return; (m.material as THREE.MeshStandardMaterial).color.set(c);
    const b = m.userData.base as THREE.Vector3; this.ctx.tween(350, (k) => { const f = 1 + Math.sin(k * Math.PI) * 0.25; m.scale.set(b.x * f, b.y * f, b.z); });
  }
  pulse(i: number) { const m = this.parts[i]; if (!m) return; const b = m.userData.base as THREE.Vector3; this.ctx.tween(500, (k) => { const f = 1 + Math.sin(k * Math.PI) * 0.3; m.scale.set(b.x * f, b.y * f, b.z); }); }
  glow(i: number) { this.parts.forEach((m, j) => { const b = m.userData.base as THREE.Vector3; m.scale.set(b.x * (j === i ? 1.2 : 1), b.y * (j === i ? 1.2 : 1), b.z * (j === i ? 1.5 : 1)); }); }
  count(k: ShapeKind) { return this.parts.filter((m) => m.userData.k === k).length; }
}
