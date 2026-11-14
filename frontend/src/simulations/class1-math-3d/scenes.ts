import * as THREE from 'three';
import { StageCtx, ease } from '../class1-math-kit/useStage';
import { apple, ball, bird, balloon, cube, star, critter, basket, mat, shadowed, textSprite, retext, PALETTE } from '../class1-math-kit/models';

export type ItemKind = 'flower' | 'fish' | 'apple' | 'ball' | 'bird' | 'balloon' | 'cube' | 'star' | 'bear' | 'rabbit' | 'cat' | 'dog' | 'mouse';
const COLORS: Record<string, string> = { apple: '#ef4444', ball: '#0ea5e9', bird: '#38bdf8', balloon: '#ef4444', cube: '#facc15', star: '#facc15', bear: '#a16207', rabbit: '#e5e7eb', cat: '#f59e0b', dog: '#92400e', mouse: '#94a3b8' };

const m3 = (g: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(g, m);
export const flower = (color: string) => {
  const g = new THREE.Group();
  const stem = m3(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 8), mat('#16a34a')); stem.position.y = 0.45; g.add(stem);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const pt = m3(new THREE.SphereGeometry(0.2, 12, 10), mat(color, 0.4)); pt.scale.set(1, 0.5, 1); pt.position.set(Math.cos(a) * 0.28, 0.95, Math.sin(a) * 0.28); g.add(pt); }
  const c = m3(new THREE.SphereGeometry(0.17, 12, 10), mat('#facc15')); c.position.y = 0.98; g.add(c);
  const leaf = m3(new THREE.SphereGeometry(0.16, 8, 6), mat('#22c55e')); leaf.scale.set(1.6, 0.3, 0.8); leaf.position.set(0.18, 0.4, 0); g.add(leaf);
  return shadowed(g);
};
export const fish = (color: string) => {
  const g = new THREE.Group();
  const b = m3(new THREE.SphereGeometry(0.4, 16, 12), mat(color, 0.3)); b.scale.set(1.3, 0.8, 0.6); g.add(b);
  const t = m3(new THREE.ConeGeometry(0.25, 0.4, 3), mat(color, 0.4)); t.rotation.z = Math.PI / 2; t.position.x = -0.6; g.add(t);
  const e = m3(new THREE.SphereGeometry(0.06, 8, 8), mat('#111827')); e.position.set(0.35, 0.1, 0.22); g.add(e);
  return shadowed(g);
};
export const makeItem = (kind: ItemKind, i = 0, color?: string): THREE.Object3D => {
  const c = color || (i % 2 === 0 || kind === 'apple' || kind === 'star' ? COLORS[kind] : PALETTE[(i + 3) % PALETTE.length]);
  switch (kind) {
    case 'flower': return flower(color || PALETTE[i % PALETTE.length]);
    case 'fish': return fish(color || PALETTE[(i + 4) % PALETTE.length]);
    case 'apple': return apple(color || '#ef4444');
    case 'ball': return ball(color || PALETTE[i % PALETTE.length], 0.42);
    case 'bird': return bird(color || PALETTE[(i * 2 + 4) % PALETTE.length]);
    case 'balloon': return balloon(color || PALETTE[i % PALETTE.length]);
    case 'cube': return cube(color || PALETTE[i % PALETTE.length], 0.8);
    case 'star': return star(color || '#facc15', 0.5);
    default: return critter(kind as any, c);
  }
};

/** the y offset so an item sits on the floor */
const lift = (kind: ItemKind) => (kind === 'flower' ? 0 : kind === 'fish' ? 0.5 : kind === 'ball' ? 0.45 : kind === 'cube' ? 0.4 : kind === 'apple' ? 0.4 : kind === 'bird' ? 0.4 : kind === 'star' ? 0.7 : kind === 'balloon' ? 1.2 : 0);

export type Layout = 'grid' | 'line' | 'frame' | 'pair' | 'free';
export const slotPos = (i: number, n: number, layout: Layout, gap = 1.35, frames = 1): [number, number] => {
  if (layout === 'line') return [(i - (Math.min(n, 10) - 1) / 2) * gap, 0];
  if (layout === 'frame') {
    // two ten-frames (5 x 2 each) side by side
    const f = Math.floor(i / 10), j = i % 10;
    void n; return [(j % 5) * gap - 2 * gap + (frames > 1 ? (f ? 4.2 : -4.2) : 0), (j < 5 ? -0.5 : 0.5) * gap];
  }
  if (layout === 'pair') return [i % 2 === 0 ? -1.4 : 1.4, (Math.floor(i / 2) - (Math.ceil(n / 2) - 1) / 2) * gap];
  const cols = n <= 4 ? n : n <= 9 ? 5 : 5;
  return [((i % cols) - (Math.min(n, cols) - 1) / 2) * gap, (Math.floor(i / cols) - (Math.ceil(n / cols) - 1) / 2) * gap];
};

/** A round table with a row/grid of countable things. Used by the numbers, zero, ten, addition and subtraction chapters. */
export class Items {
  group = new THREE.Group();
  items: THREE.Object3D[] = [];
  extras: THREE.Object3D[] = [];
  kind: ItemKind = 'apple';
  layout: Layout = 'grid';
  numbered = false;
  frameCount = 1;
  private fixed: THREE.Object3D[] = [];
  private tapCb: ((i: number) => void) | null = null;
  constructor(public ctx: StageCtx, o: { kind?: ItemKind; layout?: Layout; x?: number; z?: number; platform?: number | null; platformColor?: string; numbered?: boolean } = {}) {
    this.kind = o.kind ?? 'apple';
    this.layout = o.layout ?? 'grid';
    this.numbered = !!o.numbered;
    this.group.position.set(o.x ?? 0, 0, o.z ?? 0);
    ctx.scene.add(this.group);
    if (o.platform !== null) {
      const plat = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(o.platform ?? 6, (o.platform ?? 6) + 0.3, 0.36, 48), mat(o.platformColor ?? '#fde68a', 0.85)));
      plat.position.y = 0.18; this.group.add(plat);
    }
    ctx.onTap(() => this.items, (hit) => {
      if (!hit || !this.tapCb) return;
      let o3: THREE.Object3D | null = hit.object;
      while (o3 && !this.items.includes(o3)) o3 = o3.parent;
      if (o3) this.tapCb(this.items.indexOf(o3));
    });
  }
  get n() { return this.items.length; }
  onTapItem(cb: ((i: number) => void) | null) { this.tapCb = cb; }
  clear() { [...this.items, ...this.extras].forEach((o) => this.group.remove(o)); this.items = []; this.extras = []; }
  private spawn(i: number, n: number, kind = this.kind, color?: string) {
    const it = makeItem(kind, i, color);
    const [x, z] = slotPos(i, n, this.layout, 1.35, this.frameCount);
    it.position.set(x, 0.36 + lift(kind), z);
    it.userData.home = it.position.clone();
    this.group.add(it);
    if (this.numbered) {
      const t = textSprite(String(i + 1), 0.8, { px: 100, w: 128, h: 128, bg: 'rgba(255,255,255,.9)', border: '#0ea5e9' });
      t.position.set(0, 1.2, 0); it.add(t); it.userData.num = t;
    }
    return it;
  }
  private pop(o: THREE.Object3D, delay = 0) {
    o.scale.setScalar(0.01);
    window.setTimeout(() => this.ctx.tween(320, (k) => o.scale.setScalar(Math.max(0.01, k)), undefined, ease.back), delay);
  }
  /** replace everything with n things */
  set(n: number, layout: Layout = this.layout, kind: ItemKind = this.kind) {
    this.clear(); this.layout = layout; this.kind = kind;
    for (let i = 0; i < n; i++) { const it = this.spawn(i, n); this.items.push(it); this.pop(it, i * 60); }
  }
  /** show items in two colours (for addition): a of one colour then b of another */
  setTwo(a: number, b: number, kindA: ItemKind = this.kind, kindB: ItemKind = kindA, colA = '#ef4444', colB = '#0ea5e9') {
    this.clear();
    const n = a + b;
    for (let i = 0; i < n; i++) { const it = this.spawn(i, n, i < a ? kindA : kindB, i < a ? colA : colB); this.items.push(it); this.pop(it, i * 50); }
  }
  add(k: number, color?: string) {
    const n0 = this.n;
    for (let j = 0; j < k; j++) {
      const it = this.spawn(n0 + j, n0 + k, this.kind, color); this.items.push(it); this.pop(it, j * 120);
    }
    this.relayout(n0 + k);
  }
  /** fly the last k away */
  remove(k: number, done?: () => void) {
    const gone = this.items.splice(Math.max(0, this.n - k), k);
    gone.forEach((o, j) => {
      const y0 = o.position.y;
      window.setTimeout(() => this.ctx.tween(650, (t) => { o.position.y = y0 + t * 5; o.scale.setScalar(Math.max(0.001, 1 - t)); }, () => this.group.remove(o), ease.out), j * 140);
    });
    window.setTimeout(() => { this.relayout(this.n); done?.(); }, gone.length * 140 + 300);
  }
  /** remove one item by index (tap-to-take-away) */
  take(i: number) {
    const o = this.items[i]; if (!o) return;
    this.items.splice(i, 1);
    const y0 = o.position.y;
    this.ctx.tween(600, (t) => { o.position.y = y0 + t * 4; o.scale.setScalar(Math.max(0.001, 1 - t)); }, () => this.group.remove(o), ease.out);
  }
  relayout(n = this.n) {
    this.items.forEach((o, i) => {
      const [x, z] = slotPos(i, n, this.layout, 1.35, this.frameCount);
      const y = 0.36 + lift(this.kind);
      const p0 = o.position.clone();
      this.ctx.tween(350, (t) => o.position.set(p0.x + (x - p0.x) * t, p0.y + (y - p0.y) * t, p0.z + (z - p0.z) * t), undefined, ease.inOut);
      o.userData.home = new THREE.Vector3(x, y, z);
    });
  }
  /** hop each item in turn, calling `each(i)` as it hops (count aloud) */
  count(each?: (i: number) => void, done?: () => void, ms = 420) {
    this.items.forEach((o, i) => {
      window.setTimeout(() => {
        each?.(i);
        const y0 = o.userData.home?.y ?? o.position.y;
        this.ctx.tween(ms * 0.8, (t) => { o.position.y = y0 + Math.sin(t * Math.PI) * 0.8; o.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.25); });
      }, i * ms);
    });
    if (done) window.setTimeout(done, this.n * ms + 200);
  }
  hop(i: number) {
    const o = this.items[i]; if (!o) return;
    const y0 = o.userData.home?.y ?? o.position.y;
    this.ctx.tween(400, (t) => { o.position.y = y0 + Math.sin(t * Math.PI) * 0.8; o.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.25); });
  }
  glow(on: (i: number) => boolean) {
    this.items.forEach((o, i) => o.scale.setScalar(on(i) ? 1.25 : 1));
  }
  /** a floating label above the group */
  label(text: string, y = 3.2, color = '#0ea5e9') {
    const t = textSprite(text, 2.2, { px: 90, w: 256, h: 128, bg: 'rgba(255,255,255,.95)', border: color });
    t.position.set(0, y, 0); this.group.add(t); this.extras.push(t); return t;
  }
  /** draw ten-frame boards (flat rectangles) so children see five and five. They stay when the items change. */
  frames(n: number) {
    this.fixed.forEach((o) => this.group.remove(o)); this.fixed = [];
    const frs = Math.max(1, Math.ceil(n / 10)); this.frameCount = frs;
    for (let f = 0; f < frs; f++) {
      const g = new THREE.Group();
      const board = shadowed(new THREE.Mesh(new THREE.BoxGeometry(5 * 1.35 + 0.3, 0.1, 2 * 1.35 + 0.3), mat('#bae6fd', 0.8)));
      g.add(board);
      for (let j = 0; j < 10; j++) {
        const cell = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 1.15), mat('#e0f2fe', 0.9));
        cell.position.set((j % 5) * 1.35 - 2.7, 0.06, (j < 5 ? -0.5 : 0.5) * 1.35); g.add(cell);
      }
      g.position.set(frs > 1 ? (f ? 4.2 : -4.2) : 0, 0.4, 0);
      this.group.add(g); this.fixed.push(g);
    }
  }
}

/** A basket on the table. Items "inside" are drawn by the caller. */
export const addBasket = (ctx: StageCtx, x = 0, z = 0, color = '#c2410c', w = 3) => {
  const b = basket(color, w); b.position.set(x, 0.36, z); ctx.scene.add(b); return b;
};

/** A big floating numeral that can change. */
export class BigNumber {
  sprite: THREE.Sprite;
  constructor(private ctx: StageCtx, text = '0', y = 4.4, x = 0, z = 0, scale = 2.4, private color = '#0ea5e9') {
    this.sprite = textSprite(text, scale, { px: 110, w: 256, h: 160, bg: 'rgba(255,255,255,.95)', border: color });
    this.sprite.position.set(x, y, z); ctx.scene.add(this.sprite);
  }
  set(text: string) {
    retext(this.sprite, text, { px: 110, w: 256, h: 160, bg: 'rgba(255,255,255,.95)', border: this.color });
    const s0 = this.sprite.scale.clone();
    this.ctx.tween(300, (k) => this.sprite.scale.set(s0.x * (1 + Math.sin(k * Math.PI) * 0.2), s0.y * (1 + Math.sin(k * Math.PI) * 0.2), 1));
  }
}

/** A row of numbered stones with a bear that hops along it (number line). */
export class NumLine {
  group = new THREE.Group();
  stones: THREE.Mesh[] = [];
  bear: THREE.Object3D;
  at = 0;
  private marks: THREE.Object3D[] = [];
  private gen = 0;
  constructor(private ctx: StageCtx, public from = 0, public to = 10, private gap = 1.35, private z = 0, private sc = 1) {
    ctx.scene.add(this.group);
    this.group.position.z = z;
    const water = new THREE.Mesh(new THREE.CircleGeometry(22, 48), mat('#7dd3fc', 0.3)); water.rotation.x = -Math.PI / 2; water.position.y = 0.01; this.group.add(water);
    for (let n = from; n <= to; n++) {
      const s = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.55 * sc, 0.62 * sc, 0.45, 18), mat('#d6d3d1', 0.9)));
      s.position.set(this.x(n), 0.22, 0); s.userData.n = n;
      const t = textSprite(String(n), 1.0 * sc, { px: 110, w: 160, h: 160, color: '#0f172a' }); t.position.y = 0.75 * sc; s.add(t);
      this.group.add(s); this.stones.push(s);
    }
    this.bear = critter('bear', '#a16207'); this.bear.scale.setScalar(0.8 * sc); this.group.add(this.bear);
    this.place(from);
  }
  x(n: number) { return (n - (this.from + this.to) / 2) * this.gap; }
  place(n: number) { this.at = n; this.bear.position.set(this.x(n), 0.45, 0.1); this.gen++; }
  /** hop to n, calling each(step) on the way for every stone landed on */
  walk(n: number, each?: (k: number) => void, done?: () => void, ms = 520) {
    const g0 = ++this.gen; const dir = n >= this.at ? 1 : -1; const cells: number[] = [];
    for (let k = this.at + dir; dir > 0 ? k <= n : k >= n; k += dir) cells.push(k);
    cells.forEach((k, i) => window.setTimeout(() => {
      if (g0 !== this.gen) return;
      const p0 = this.bear.position.clone(); const p1 = new THREE.Vector3(this.x(k), 0.45, 0.1);
      this.ctx.tween(ms * 0.85, (q) => { this.bear.position.lerpVectors(p0, p1, q); this.bear.position.y += Math.sin(q * Math.PI) * 1.1; }, undefined, ease.inOut);
      this.at = k; each?.(k);
    }, i * ms));
    if (done) window.setTimeout(() => { if (g0 === this.gen) done(); }, cells.length * ms + 150);
  }
  mark(n: number, color = '#86efac') { const s = this.stones[n - this.from]; if (s) (s.material as THREE.MeshStandardMaterial).color.set(color); }
  clearMarks() { this.stones.forEach((s) => (s.material as THREE.MeshStandardMaterial).color.set('#d6d3d1')); this.marks.forEach((m) => this.group.remove(m)); this.marks = []; }
  glow(n: number | null) { this.stones.forEach((s) => s.scale.setScalar(s.userData.n === n ? 1.3 : 1)); }
  onTapStone(cb: (n: number) => void) { this.ctx.onTap(() => this.stones, (hit) => { if (hit) cb((hit.object as any).userData.n); }); }
}

/** A row of big boxes that spell an equation such as 3 + 4 = 7, floating above the scene. */
export class EqBoard {
  group = new THREE.Group();
  private sprites: THREE.Sprite[] = [];
  constructor(private ctx: StageCtx, private y = 4.6, private x = 0, private scale = 1.5) { ctx.scene.add(this.group); this.group.position.set(x, y, 0); }
  set(texts: string[], hot: number[] = []) {
    this.sprites.forEach((s) => this.group.remove(s)); this.sprites = [];
    const gap = this.scale * 1.15;
    texts.forEach((t, i) => {
      const op = t === '+' || t === '−' || t === '=';
      const s = textSprite(t, this.scale * (op ? 0.8 : 1), { px: 110, w: 160, h: 160, bg: op ? 'rgba(255,255,255,.0)' : hot.includes(i) ? '#fef08a' : 'rgba(255,255,255,.96)', border: hot.includes(i) ? '#f59e0b' : '#0ea5e9', color: op ? '#0f172a' : '#0f172a' });
      s.position.set((i - (texts.length - 1) / 2) * gap, 0, 0); this.group.add(s); this.sprites.push(s);
      s.scale.multiplyScalar(0.01); const s1 = this.scale * (op ? 0.8 : 1);
      this.ctx.tween(250 + i * 60, (k) => s.scale.set(Math.max(0.01, s1 * k), Math.max(0.01, s1 * k), 1), undefined, ease.back);
    });
  }
}

const SPOT10: [number, number, number][] = [[-0.7, 0.5, -0.5], [0.7, 0.5, -0.5], [-0.7, 0.5, 0.5], [0.7, 0.5, 0.5], [0, 0.5, 0], [-0.4, 1.2, 0], [0.4, 1.2, 0], [0, 1.2, -0.5], [0, 1.2, 0.5], [0, 1.9, 0]];
/** A big basket with up to ten balls inside; tap a ball (or call out()) to lift it out. */
export class BasketBalls {
  balls: THREE.Object3D[] = [];
  outside: THREE.Object3D[] = [];
  private colors = ['#ef4444', '#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1'];
  constructor(private ctx: StageCtx, private notify: (ev: any) => void) {
    const b = basket('#c2410c', 3.4); b.position.set(0, 0.06, 0); b.scale.set(1.3, 1.3, 1.3); ctx.scene.add(b);
    ctx.onTap(() => this.balls, (hit) => { if (hit) { let o: THREE.Object3D | null = hit.object; while (o && !this.balls.includes(o)) o = o.parent; if (o) this.take(o); } });
  }
  get n() { return this.balls.length; }
  fill(n: number) {
    [...this.balls, ...this.outside].forEach((o) => this.ctx.scene.remove(o)); this.balls = []; this.outside = [];
    for (let i = 0; i < n; i++) { const o = ball(this.colors[i], 0.42); const [x, y, z] = SPOT10[i]; o.position.set(x, y, z); this.ctx.scene.add(o); this.balls.push(o); o.scale.setScalar(0.01); this.ctx.tween(300 + i * 70, (k) => o.scale.setScalar(Math.max(0.01, k)), undefined, ease.back); }
    this.notify({ left: n, taken: 0 });
  }
  take(o: THREE.Object3D) {
    const i = this.balls.indexOf(o); if (i < 0) return; this.balls.splice(i, 1); this.outside.push(o);
    const k0 = this.outside.length - 1; const p0 = o.position.clone(); const p1 = new THREE.Vector3(-4.2 + (k0 % 5) * 1.1 - (k0 > 4 ? 0 : 0), 0.45, 3.4 + Math.floor(k0 / 5) * 1.1);
    this.ctx.tween(700, (k) => { o.position.lerpVectors(p0, p1, k); o.position.y += Math.sin(k * Math.PI) * 2.4; }, undefined, ease.inOut);
    this.notify({ left: this.balls.length, taken: this.outside.length, took: true });
  }
  out() { if (this.balls.length) this.take(this.balls[this.balls.length - 1]); }
}
