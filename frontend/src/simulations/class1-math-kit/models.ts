import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { FONT_NP } from './nepali';

/** Procedural 3D toys and props shared by the Class 1 simulations. */

export const mat = (color: number | string, rough = 0.5, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
export const shadowed = <T extends THREE.Object3D>(o: T): T => {
  o.traverse((c: any) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  return o;
};
const mesh = (g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[]) => new THREE.Mesh(g, m);

/* ───────── text ───────── */
export interface TextOpts { px?: number; color?: string; bg?: string | null; w?: number; h?: number; radius?: number; font?: string; border?: string }
const textCanvas = (text: string, o: TextOpts) => {
  const w = o.w ?? 256, h = o.h ?? 128;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  if (o.bg) {
    g.fillStyle = o.bg;
    const r = o.radius ?? 28;
    g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, r); g.fill();
    if (o.border) { g.lineWidth = 8; g.strokeStyle = o.border; g.stroke(); }
  }
  g.fillStyle = o.color ?? '#0f172a';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `800 ${o.px ?? 72}px ${o.font ?? FONT_NP}`;
  const lines = text.split('\n');
  const lh = (o.px ?? 72) * 1.12;
  lines.forEach((ln, i) => g.fillText(ln, w / 2, h / 2 + (i - (lines.length - 1) / 2) * lh));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};
/** A label that always faces the camera. `scale` is its world width. */
export const textSprite = (text: string, scale = 2, o: TextOpts = {}) => {
  const w = o.w ?? 256, h = o.h ?? 128;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textCanvas(text, o), transparent: true, depthTest: false }));
  s.scale.set(scale, (scale * h) / w, 1);
  s.renderOrder = 10;
  return s;
};
/** A flat label lying on a surface or standing in the scene. */
export const textPlane = (text: string, width = 2, o: TextOpts = {}) => {
  const w = o.w ?? 256, h = o.h ?? 128;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, (width * h) / w), new THREE.MeshBasicMaterial({ map: textCanvas(text, o), transparent: true, side: THREE.DoubleSide }));
  return m;
};
export const retext = (obj: THREE.Sprite | THREE.Mesh, text: string, o: TextOpts = {}) => {
  const m: any = (obj as any).material;
  m.map?.dispose?.();
  m.map = textCanvas(text, o);
  m.needsUpdate = true;
};

/* ───────── blocks and counting things ───────── */
export const PALETTE = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6'];

export const cube = (color: number | string = '#facc15', size = 0.9) => {
  const m = mesh(new RoundedBoxGeometry(size, size, size, 4, size * 0.12), mat(color, 0.35));
  return shadowed(m);
};
/** A rod of ten linked cubes (one "ten"). Lying along +x, 10 units long. */
export const tenRod = (color: number | string = '#38bdf8') => {
  const g = new THREE.Group();
  for (let i = 0; i < 10; i++) { const c = cube(color, 0.9); c.position.x = i + 0.5; g.add(c); }
  g.position.x = 0;
  return g;
};
/** A standing tower of ten cubes (alternative "ten" that is easy to see in 3D). */
export const tenTower = (color: number | string = '#38bdf8', cubeSize = 0.5) => {
  const g = new THREE.Group();
  for (let i = 0; i < 10; i++) { const c = cube(color, cubeSize * 0.94); c.position.y = cubeSize * (i + 0.5); g.add(c); }
  return g;
};

export const ball = (color: number | string = '#ef4444', r = 0.45) => shadowed(mesh(new THREE.SphereGeometry(r, 32, 24), mat(color, 0.25)));

export const apple = (color: number | string = '#ef4444') => {
  const g = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(0.42, 28, 22), mat(color, 0.3));
  body.scale.set(1, 0.92, 1);
  g.add(body);
  const stem = mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.2, 8), mat('#78350f'));
  stem.position.y = 0.45; g.add(stem);
  const leaf = mesh(new THREE.SphereGeometry(0.12, 12, 8), mat('#22c55e'));
  leaf.scale.set(1.6, 0.35, 0.8); leaf.position.set(0.12, 0.5, 0); leaf.rotation.z = 0.4; g.add(leaf);
  return shadowed(g);
};

export const star = (color: number | string = '#facc15', r = 0.5) => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  const m = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }), mat(color, 0.3));
  m.geometry.center();
  return shadowed(m);
};

export const balloon = (color: number | string = '#ef4444') => {
  const g = new THREE.Group();
  const b = mesh(new THREE.SphereGeometry(0.5, 28, 22), mat(color, 0.15));
  b.scale.set(1, 1.2, 1); b.position.y = 0.6; g.add(b);
  const knot = mesh(new THREE.ConeGeometry(0.08, 0.14, 10), mat(color, 0.3));
  knot.rotation.x = Math.PI; knot.position.y = -0.04; g.add(knot);
  const str = mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.4, 6), mat('#e5e7eb'));
  str.position.y = -0.75; g.add(str);
  return shadowed(g);
};

export const bird = (color: number | string = '#38bdf8') => {
  const g = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(0.36, 22, 18), mat(color, 0.4)); body.scale.set(1.2, 1, 1); g.add(body);
  const head = mesh(new THREE.SphereGeometry(0.22, 18, 14), mat(color, 0.4)); head.position.set(0.34, 0.22, 0); g.add(head);
  const beak = mesh(new THREE.ConeGeometry(0.07, 0.2, 10), mat('#f59e0b')); beak.rotation.z = -Math.PI / 2; beak.position.set(0.58, 0.2, 0); g.add(beak);
  for (const z of [-0.09, 0.09]) { const e = mesh(new THREE.SphereGeometry(0.04, 8, 8), mat('#111827')); e.position.set(0.45, 0.28, z); g.add(e); }
  const tail = mesh(new THREE.ConeGeometry(0.14, 0.4, 3), mat(color, 0.5)); tail.rotation.z = Math.PI / 2; tail.position.set(-0.5, 0.05, 0); g.add(tail);
  const wing = mesh(new THREE.SphereGeometry(0.2, 12, 10), mat('#ffffff', 0.5)); wing.scale.set(1.2, 0.35, 0.9); wing.position.set(-0.02, 0.08, 0.26); g.add(wing);
  const wing2 = wing.clone(); wing2.position.z = -0.26; g.add(wing2);
  g.userData.wings = [wing, wing2];
  return shadowed(g);
};

export type CritterKind = 'bear' | 'rabbit' | 'cat' | 'dog' | 'mouse';
/** A cute standing animal. Faces +z. `userData.legs` lets you animate running. */
export const critter = (kind: CritterKind = 'bear', color: number | string = '#a16207') => {
  const g = new THREE.Group();
  const fur = mat(color, 0.7);
  const body = mesh(new THREE.SphereGeometry(0.42, 22, 18), fur); body.scale.set(1, 1.1, 0.9); body.position.y = 0.55; g.add(body);
  const head = mesh(new THREE.SphereGeometry(0.34, 22, 18), fur); head.position.y = 1.2; g.add(head);
  const snout = mesh(new THREE.SphereGeometry(0.15, 14, 12), mat('#fde68a', 0.8)); snout.scale.set(1, 0.8, 0.8); snout.position.set(0, 1.12, 0.3); g.add(snout);
  const nose = mesh(new THREE.SphereGeometry(0.05, 10, 8), mat('#111827')); nose.position.set(0, 1.17, 0.42); g.add(nose);
  for (const x of [-0.12, 0.12]) {
    const e = mesh(new THREE.SphereGeometry(0.05, 10, 8), mat('#111827')); e.position.set(x, 1.28, 0.3); g.add(e);
    const sh = mesh(new THREE.SphereGeometry(0.018, 6, 6), mat('#fff')); sh.position.set(x + 0.015, 1.3, 0.34); g.add(sh);
  }
  const earGeo = kind === 'rabbit' ? new THREE.CapsuleGeometry(0.07, 0.4, 6, 10) : kind === 'cat' ? new THREE.ConeGeometry(0.12, 0.26, 4) : new THREE.SphereGeometry(0.13, 12, 10);
  for (const x of [-0.22, 0.22]) {
    const ear = mesh(earGeo, fur);
    ear.position.set(x, kind === 'rabbit' ? 1.65 : 1.5, 0);
    if (kind === 'dog') { ear.scale.set(0.8, 1.4, 0.5); ear.position.y = 1.35; ear.position.x = x * 1.4; }
    g.add(ear);
  }
  const legs: THREE.Mesh[] = [];
  for (const x of [-0.2, 0.2]) {
    const l = mesh(new THREE.CapsuleGeometry(0.09, 0.2, 6, 10), fur); l.position.set(x, 0.14, 0.05); g.add(l); legs.push(l);
    const arm = mesh(new THREE.CapsuleGeometry(0.07, 0.22, 6, 10), fur); arm.position.set(x * 2, 0.62, 0.05); arm.rotation.z = x > 0 ? -0.5 : 0.5; g.add(arm);
  }
  g.userData.legs = legs;
  return shadowed(g);
};

export const tree = (fruitColor: number | string | null = null) => {
  const g = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.35, 0.5, 3, 12), mat('#92400e', 0.9)); trunk.position.y = 1.5; g.add(trunk);
  const leaf = mat('#16a34a', 0.8);
  [[0, 4, 0, 2.1], [-1.2, 3.4, 0.3, 1.5], [1.2, 3.5, -0.2, 1.5], [0.2, 5, 0.2, 1.4]].forEach(([x, y, z, r]) => {
    const l = mesh(new THREE.SphereGeometry(r, 20, 16), leaf); l.position.set(x, y, z); g.add(l);
  });
  void fruitColor;
  return shadowed(g);
};

export const basket = (color: number | string = '#c2410c', w = 2.2) => {
  const g = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(w / 2, w / 2.4, 0.9, 24, 1, true), new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide })); base.position.y = 0.45; g.add(base);
  const floor = mesh(new THREE.CircleGeometry(w / 2.4, 24), mat(color, 0.9)); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.02; g.add(floor);
  const rim = mesh(new THREE.TorusGeometry(w / 2, 0.06, 8, 32), mat('#7c2d12')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.9; g.add(rim);
  return shadowed(g);
};

export const pencil = (color: number | string = '#facc15', len = 3) => {
  const g = new THREE.Group();
  const body = mesh(new THREE.CylinderGeometry(0.12, 0.12, len, 6), mat(color, 0.5)); body.rotation.z = Math.PI / 2; g.add(body);
  const tip = mesh(new THREE.ConeGeometry(0.12, 0.35, 6), mat('#fde68a')); tip.rotation.z = Math.PI / 2; tip.position.x = len / 2 + 0.17; g.add(tip);
  const lead = mesh(new THREE.ConeGeometry(0.045, 0.12, 6), mat('#111827')); lead.rotation.z = Math.PI / 2; lead.position.x = len / 2 + 0.38; g.add(lead);
  const end = mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.18, 12), mat('#f472b6')); end.rotation.z = Math.PI / 2; end.position.x = -len / 2 - 0.09; g.add(end);
  return shadowed(g);
};

/* ───────── Nepali money ───────── */
const NOTE_STYLE: Record<number, { bg: string; fg: string; icon: string }> = {
  5: { bg: '#f9a8a8', fg: '#7f1d1d', icon: '🐃' },
  10: { bg: '#d8b4fe', fg: '#581c87', icon: '🦌' },
  20: { bg: '#fdba74', fg: '#7c2d12', icon: '🦌' },
  50: { bg: '#93c5fd', fg: '#1e3a8a', icon: '🐐' },
  100: { bg: '#bef264', fg: '#365314', icon: '🦏' },
  500: { bg: '#fde68a', fg: '#78350f', icon: '🐅' },
  1000: { bg: '#a7f3d0', fg: '#064e3b', icon: '🐘' },
};
export const NOTE_VALUES = [5, 10, 20, 50, 100];
export const noteTexture = (value: number, back = false) => {
  const st = NOTE_STYLE[value] || NOTE_STYLE[5];
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = st.bg; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = st.fg; g.lineWidth = 10; g.strokeRect(8, 8, 496, 240);
  g.fillStyle = st.fg;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (!back) {
    g.font = `800 40px ${FONT_NP}`; g.fillText('नेपाल राष्ट्र बैंक', 256, 46);
    g.font = '800 46px sans-serif'; g.fillText('🏔️', 100, 128);
    g.font = `900 110px sans-serif`; g.fillText(String(value), 330, 138);
    g.font = `800 34px ${FONT_NP}`; g.fillText('रुपैयाँ', 256, 214);
  } else {
    g.font = `800 28px sans-serif`; g.fillText('NEPAL RASTRA BANK', 256, 40);
    g.font = '110px sans-serif'; g.fillText(st.icon, 256, 128);
    g.font = '900 54px sans-serif'; g.fillText(`RUPEES ${value}`, 256, 210);
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
};
/** A Nepali rupee note lying flat (3.2 × 1.6). */
export const note = (value: number) => {
  const m = mesh(new THREE.BoxGeometry(3.2, 0.04, 1.6), [mat('#e5e7eb'), mat('#e5e7eb'), new THREE.MeshStandardMaterial({ map: noteTexture(value), roughness: 0.6 }), new THREE.MeshStandardMaterial({ map: noteTexture(value, true), roughness: 0.6 }), mat('#e5e7eb'), mat('#e5e7eb')]);
  m.userData.value = value;
  return shadowed(m);
};
const COIN_STYLE: Record<number, string> = { 1: '#d97706', 2: '#b45309', 5: '#cbd5e1', 10: '#fbbf24' };
export const COIN_VALUES = [1, 2, 5, 10];
/** A coin standing on its edge or lying flat. Face points +y when flat. */
export const coin = (value: number, r = 0.55) => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = COIN_STYLE[value] || '#fbbf24'; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 108, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#422006'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '900 110px sans-serif'; g.fillText(String(value), 128, 118);
  g.font = `800 36px ${FONT_NP}`; g.fillText('रुपैयाँ', 128, 196);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const side = mat(COIN_STYLE[value] || '#fbbf24', 0.35, 0.6);
  const m = mesh(new THREE.CylinderGeometry(r, r, 0.1, 40), [side, new THREE.MeshStandardMaterial({ map: tex, metalness: 0.4, roughness: 0.4 }), new THREE.MeshStandardMaterial({ map: tex, metalness: 0.4, roughness: 0.4 })]);
  m.userData.value = value;
  return shadowed(m);
};

/* ───────── clock ───────── */
export interface Clock3D { group: THREE.Group; setTime: (h: number, m: number) => void; hourHand: THREE.Group; minuteHand: THREE.Group }
export const clockModel = (radius = 2.4): Clock3D => {
  const group = new THREE.Group();
  const rim = mesh(new THREE.CylinderGeometry(radius + 0.18, radius + 0.18, 0.3, 48), mat('#f97316', 0.4)); rim.rotation.x = Math.PI / 2; group.add(rim);
  const face = mesh(new THREE.CylinderGeometry(radius, radius, 0.34, 48), mat('#fffbeb', 0.7)); face.rotation.x = Math.PI / 2; group.add(face);
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const t = textSprite(String(i), 0.8, { px: 110, w: 128, h: 128, color: '#0f172a' });
    t.position.set(Math.sin(a) * radius * 0.78, Math.cos(a) * radius * 0.78, 0.3);
    group.add(t);
  }
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const big = i % 5 === 0;
    const tk = mesh(new THREE.BoxGeometry(big ? 0.07 : 0.03, big ? 0.22 : 0.1, 0.04), mat('#475569'));
    tk.position.set(Math.sin(a) * radius * 0.94, Math.cos(a) * radius * 0.94, 0.18); tk.rotation.z = -a; group.add(tk);
  }
  const hand = (len: number, w: number, color: string, z: number) => {
    const h = new THREE.Group();
    const b = mesh(new THREE.BoxGeometry(w, len, 0.07), mat(color, 0.4)); b.position.y = len / 2 - 0.15; h.add(b);
    h.position.z = z; group.add(h);
    return h;
  };
  const hourHand = hand(radius * 0.52, 0.17, '#1d4ed8', 0.24);
  const minuteHand = hand(radius * 0.78, 0.11, '#dc2626', 0.3);
  const pin = mesh(new THREE.SphereGeometry(0.14, 16, 12), mat('#0f172a')); pin.position.z = 0.34; group.add(pin);
  const setTime = (h: number, m: number) => {
    minuteHand.rotation.z = -(m / 60) * Math.PI * 2;
    hourHand.rotation.z = -(((h % 12) + m / 60) / 12) * Math.PI * 2;
  };
  setTime(12, 0);
  return { group: shadowed(group), setTime, hourHand, minuteHand };
};

/* ───────── helpers ───────── */
export const place = <T extends THREE.Object3D>(o: T, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); return o; };
export const grid = (n: number, cols: number, gap = 1.3): [number, number][] =>
  Array.from({ length: n }, (_, i) => [((i % cols) - (cols - 1) / 2) * gap, Math.floor(i / cols) * gap]);
