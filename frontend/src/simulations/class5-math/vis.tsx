import * as THREE from 'three';
import { mat, shadowed, textSprite, TextOpts } from '../class1-math-kit/models';

/** Small drawing helpers for the Class 5 and Class 6 labs. Everything is added to the group `g`. */
export const box = (g: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, color: string, rough = 0.5, opacity = 1) => {
  const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, rough)));
  if (opacity < 1) { (m.material as THREE.MeshStandardMaterial).transparent = true; (m.material as THREE.MeshStandardMaterial).opacity = opacity; }
  m.position.set(x, y, z); g.add(m); return m;
};
export const tag = (g: THREE.Object3D, text: string, x: number, y: number, z: number, scale = 2.2, o: TextOpts = {}) => {
  const t = textSprite(text, scale, { px: 48, w: 320, h: 96, bg: null, color: '#0f172a', ...o }); t.position.set(x, y, z); g.add(t); return t;
};
/** A solid rod between two points. */
export const rod = (g: THREE.Object3D, a: [number, number, number], b: [number, number, number], color: string, th = 0.07) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b); const len = va.distanceTo(vb) || 0.001;
  const m = new THREE.Mesh(new THREE.BoxGeometry(th, th, len), mat(color, 0.4)); m.position.copy(va.clone().add(vb).multiplyScalar(0.5)); m.lookAt(vb); g.add(m); return m;
};
/** A flat disc lying on the ground (XZ plane). */
export const disc = (g: THREE.Object3D, r: number, color: string, x = 0, y = 0.03, z = 0, opacity = 1) => {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, transparent: opacity < 1, opacity, roughness: 0.6 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; g.add(m); return m;
};
/** A ring or a pie slice lying flat: radii r0..r1, angles a0..a1 in radians (counter-clockwise from +x, seen from above). */
export const sector = (g: THREE.Object3D, r0: number, r1: number, a0: number, a1: number, color: string, x = 0, y = 0.05, z = 0, opacity = 0.9) => {
  const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 48, 1, a0, Math.max(0.001, a1 - a0)), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); g.add(m); return m;
};
/** A flat polygon on the ground. `pts` are (x, z) pairs. */
export const poly = (g: THREE.Object3D, pts: [number, number][], color: string, y = 0.04, opacity = 1, thick = 0) => {
  const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geo = thick ? new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false }) : new THREE.ShapeGeometry(s);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, transparent: opacity < 1, opacity, roughness: 0.55 }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
};
export const outline = (g: THREE.Object3D, pts: [number, number][], color: string, y = 0.12, th = 0.08) => {
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; rod(g, [p[0], y, p[1]], [q[0], y, q[1]], color, th); });
};
/** A block of unit cubes l × b × h drawn as one instanced mesh (centred on x, z; sitting on y = 0). */
export const cubeBlock = (g: THREE.Object3D, l: number, b: number, h: number, color: string, u = 1, x = 0, z = 0, gap = 0.06) => {
  const n = l * b * h; if (n <= 0) return null;
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(u - gap, u - gap, u - gap), mat(color, 0.45), n); const m4 = new THREE.Matrix4(); let k = 0;
  for (let i = 0; i < l; i++) for (let j = 0; j < b; j++) for (let t = 0; t < h; t++) { m4.makeTranslation(x + (i - (l - 1) / 2) * u, (t + 0.5) * u, z + (j - (b - 1) / 2) * u); im.setMatrixAt(k++, m4); }
  im.castShadow = true; im.receiveShadow = true; g.add(im); return im;
};
/** Tiles on the ground: cols × rows of flat squares. */
export const tiles = (g: THREE.Object3D, cols: number, rows: number, color: string, u = 1, x = 0, z = 0, alt?: string) => {
  const n = cols * rows; if (n <= 0) return;
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(u * 0.94, 0.12, u * 0.94), mat(color, 0.6), n); const m4 = new THREE.Matrix4(); let k = 0;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { m4.makeTranslation(x + (i - (cols - 1) / 2) * u, 0.07, z + (j - (rows - 1) / 2) * u); im.setMatrixAt(k, m4); if (alt) im.setColorAt(k, new THREE.Color((i + j) % 2 ? color : alt)); k++; }
  im.receiveShadow = true; g.add(im);
};
/** Digit towers: one column of cubes per place (value 0–9) — used for the place-value labs. */
export const towers = (g: THREE.Object3D, digits: number[], colors: string[], names: string[], u = 0.5) => {
  const n = digits.length; const gap = u * 2.1;
  digits.forEach((d, c) => {
    const x = (c - (n - 1) / 2) * gap;
    box(g, u * 1.7, 0.16, u * 1.7, x, 0.08, 0, colors[c % colors.length], 0.7);
    for (let k = 0; k < d; k++) box(g, u * 0.94, u * 0.94, u * 0.94, x, 0.16 + u * (k + 0.5), 0, colors[c % colors.length], 0.4);
    tag(g, String(d), x, u * 9.8 + 0.6, 0, 1.15, { px: 90, w: 128, h: 128, bg: 'rgba(255,255,255,.94)', border: colors[c % colors.length] });
    tag(g, names[c], x, -0.55, 1.1, 1.6, { px: 40, w: 256, h: 96 });
  });
};
export const PL9 = ['#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#64748b'];
