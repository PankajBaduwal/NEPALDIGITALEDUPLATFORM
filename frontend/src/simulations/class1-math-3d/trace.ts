import * as THREE from 'three';
import { StageCtx } from '../class1-math-kit/useStage';
import { mat, shadowed } from '../class1-math-kit/models';

/** resample a polyline into evenly spaced points */
export const resample = (pts: [number, number][], step = 0.28): [number, number][] => {
  const out: [number, number][] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, z0] = pts[i - 1], [x1, z1] = pts[i];
    const d = Math.hypot(x1 - x0, z1 - z0); const n = Math.max(1, Math.round(d / step));
    for (let j = 1; j <= n; j++) out.push([x0 + ((x1 - x0) * j) / n, z0 + ((z1 - z0) * j) / n]);
  }
  return out;
};

/** A paper sheet seen from above: dotted guide, finger drawing, % traced. Locks the camera rotation. */
export class TraceBoard {
  group = new THREE.Group();
  paper: THREE.Mesh;
  private guide: THREE.Mesh[] = [];
  private hit: boolean[] = [];
  private pts: [number, number][] = [];
  private trail: THREE.Mesh[] = [];
  private col = '#2563eb';
  private drawing = false;
  private last: THREE.Vector3 | null = null;
  private finished = false;
  onPct: ((pct: number) => void) | null = null;
  onDone: (() => void) | null = null;
  private cleanup: () => void;
  constructor(private ctx: StageCtx, paperColor = '#ffffff', w = 14, d = 8.5) {
    ctx.scene.add(this.group);
    ctx.controls.enableRotate = false;
    this.paper = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), mat(paperColor, 0.9))); this.paper.position.y = 0.1; this.group.add(this.paper);
    const ray = new THREE.Raycaster(); const nd = new THREE.Vector2(); const el = ctx.renderer.domElement;
    const at = (e: PointerEvent) => { const r = el.getBoundingClientRect(); nd.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(nd, ctx.camera); const h = ray.intersectObject(this.paper)[0]; return h ? h.point : null; };
    const down = (e: PointerEvent) => { const p = at(e); if (!p) return; this.drawing = true; this.last = p.clone(); this.dot(p); this.mark(p.x, p.z); el.setPointerCapture?.(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!this.drawing) return;
      const p = at(e); if (!p || !this.last) return;
      const d2 = this.last.distanceTo(p); const steps = Math.max(1, Math.floor(d2 / 0.12));
      for (let i = 1; i <= steps; i++) { const q = this.last.clone().lerp(p, i / steps); this.dot(q); this.mark(q.x, q.z); }
      this.last = p.clone();
    };
    const up = () => { this.drawing = false; this.last = null; };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up);
    this.cleanup = () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointerleave', up); };
  }
  setColor(c: string) { this.col = c; }
  setPath(pts: [number, number][] | null, dotColor = '#94a3b8') {
    this.guide.forEach((m) => this.group.remove(m)); this.guide = []; this.hit = []; this.finished = false;
    this.trail.forEach((m) => this.group.remove(m)); this.trail = [];
    this.pts = pts || [];
    this.pts.forEach((p) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), mat(dotColor, 0.8)); m.position.set(p[0], 0.28, p[1]); this.group.add(m); this.guide.push(m); this.hit.push(false); });
    this.onPct?.(0);
  }
  clearInk() {
    this.trail.forEach((m) => this.group.remove(m)); this.trail = [];
    this.guide.forEach((m) => (m.material as THREE.MeshStandardMaterial).color.set('#94a3b8'));
    this.hit = this.hit.map(() => false); this.finished = false; this.onPct?.(0);
  }
  progress() { return this.hit.length ? this.hit.filter(Boolean).length / this.hit.length : 0; }
  private dot(v: THREE.Vector3) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), mat(this.col, 0.4)); m.position.set(v.x, 0.32, v.z);
    this.group.add(m); this.trail.push(m); if (this.trail.length > 1200) this.group.remove(this.trail.shift()!);
  }
  private mark(x: number, z: number) {
    let ch = false;
    this.pts.forEach((p, i) => { if (!this.hit[i] && Math.hypot(p[0] - x, p[1] - z) < 0.65) { this.hit[i] = true; (this.guide[i].material as THREE.MeshStandardMaterial).color.set('#22c55e'); ch = true; } });
    if (ch) { const pc = Math.round(this.progress() * 100); this.onPct?.(pc); if (pc >= 85 && !this.finished) { this.finished = true; this.onDone?.(); } }
  }
  /** draw the path by itself */
  demo() { this.clearInk(); this.pts.forEach((p, i) => window.setTimeout(() => { this.dot(new THREE.Vector3(p[0], 0, p[1])); this.mark(p[0], p[1]); }, i * 45)); }
  dispose() { this.cleanup(); }
}

/** single-stroke outlines of the digits, in a box about 2 wide and 3.2 tall (x, z) */
export const DIGIT_PATHS: Record<string, [number, number][]> = {
  '0': Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI * 2 - Math.PI / 2; return [Math.cos(a) * 0.95, Math.sin(a) * 1.6] as [number, number]; }),
  '1': [[-0.6, -1.0], [0, -1.6], [0, 1.6]],
  '2': [[-0.95, -0.8], [-0.6, -1.4], [0, -1.6], [0.7, -1.3], [0.9, -0.6], [0.6, 0.1], [-0.95, 1.6], [1, 1.6]],
  '3': [[-0.9, -1.3], [0, -1.6], [0.8, -1.2], [0.8, -0.5], [0, -0.1], [0.9, 0.4], [0.9, 1.1], [0, 1.6], [-0.9, 1.3]],
  '4': [[0.5, 1.6], [0.5, -1.6], [-1, 0.6], [1.1, 0.6]],
  '5': [[0.9, -1.6], [-0.7, -1.6], [-0.8, -0.2], [0.2, -0.4], [0.9, 0.2], [0.9, 1.0], [0.2, 1.6], [-0.8, 1.3]],
  '6': [[0.7, -1.5], [-0.2, -1.6], [-0.9, -0.6], [-0.9, 0.8], [-0.3, 1.6], [0.6, 1.4], [0.9, 0.7], [0.5, 0], [-0.3, 0], [-0.9, 0.5]],
  '7': [[-1, -1.6], [1, -1.6], [0, 1.6]],
  '8': [[0, -1.6], [0.8, -1.1], [0, -0.1], [-0.9, 0.8], [0, 1.6], [0.9, 0.8], [0, -0.1], [-0.8, -1.1], [0, -1.6]],
  '9': [[0.8, -0.5], [0, -1.6], [-0.8, -0.9], [-0.7, -0.2], [0.2, 0], [0.9, -0.5], [0.9, 0.5], [0.4, 1.4], [-0.4, 1.6], [-0.9, 1.3]],
};
/** a number path (one or two digits) centred on the paper */
export const numberPath = (n: number): [number, number][] => {
  const s = String(n);
  const gap = 2.8;
  const out: [number, number][] = [];
  [...s].forEach((ch, i) => { const dx = (i - (s.length - 1) / 2) * gap; DIGIT_PATHS[ch].forEach(([x, z]) => out.push([x + dx, z])); });
  return resample(out);
};
