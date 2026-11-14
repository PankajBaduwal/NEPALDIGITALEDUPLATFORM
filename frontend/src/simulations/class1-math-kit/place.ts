import * as THREE from 'three';
import { StageCtx, ease } from './useStage';
import { cube, tenTower, textSprite, retext } from './models';

/**
 * Place-value blocks: standing towers are "tens" and single cubes are "ones".
 * Used by the 21–100, two-digit addition and two-digit subtraction simulations.
 */
export class Blocks {
  group = new THREE.Group();
  tens: THREE.Object3D[] = [];
  ones: THREE.Object3D[] = [];
  private label: THREE.Sprite;
  readonly u: number;
  constructor(private ctx: StageCtx, private o: { x?: number; z?: number; tensColor?: string; onesColor?: string; u?: number; labelColor?: string } = {}) {
    this.u = o.u ?? 0.42;
    this.group.position.set(o.x ?? 0, 0, o.z ?? 0);
    ctx.scene.add(this.group);
    this.label = textSprite('0', 2, { px: 96, w: 256, h: 128, bg: 'rgba(255,255,255,0.92)', border: o.labelColor ?? '#0ea5e9', color: '#0f172a' });
    this.group.add(this.label);
    this.updateLabel();
  }
  get value() { return this.tens.length * 10 + this.ones.length; }
  private tenX = (i: number) => i * (this.u * 1.45);
  private oneX = (i: number) => this.u * 1.45 * 10 + 0.7 + (i % 5) * (this.u * 1.15);
  private oneZ = (i: number) => Math.floor(i / 5) * (this.u * 1.15);
  private updateLabel() {
    retext(this.label, String(this.value), { px: 96, w: 256, h: 128, bg: 'rgba(255,255,255,0.92)', border: this.o.labelColor ?? '#0ea5e9', color: '#0f172a' });
    this.label.position.set(this.tenX(4.5), this.u * 10 + 1.1, 0);
  }
  private newTen() { return tenTower(this.o.tensColor ?? '#38bdf8', this.u); }
  private newOne() { return cube(this.o.onesColor ?? '#facc15', this.u * 0.94); }
  private pop(obj: THREE.Object3D, ms = 320) {
    const s = obj.scale.clone().set(1, 1, 1);
    obj.scale.set(0.01, 0.01, 0.01);
    this.ctx.tween(ms, (k) => obj.scale.set(s.x * k, s.y * k, s.z * k), undefined, ease.back);
  }
  private remove(obj: THREE.Object3D, ms = 350, done?: () => void) {
    const y0 = obj.position.y;
    this.ctx.tween(ms, (k) => { obj.position.y = y0 + k * 2.5; obj.scale.setScalar(Math.max(0.001, 1 - k)); }, () => { this.group.remove(obj); done?.(); }, ease.out);
  }
  /** Re-position everything (animated) */
  layout(ms = 300) {
    this.tens.forEach((t, i) => this.moveTo(t, this.tenX(i), 0, 0, ms));
    this.ones.forEach((c, i) => this.moveTo(c, this.oneX(i), this.u * 0.47, this.oneZ(i), ms));
    this.updateLabel();
  }
  private moveTo(o: THREE.Object3D, x: number, y: number, z: number, ms: number) {
    const p0 = o.position.clone();
    this.ctx.tween(ms, (k) => o.position.set(p0.x + (x - p0.x) * k, p0.y + (y - p0.y) * k, p0.z + (z - p0.z) * k), undefined, ease.out);
  }
  set(tens: number, ones: number) {
    [...this.tens, ...this.ones].forEach((o) => this.group.remove(o));
    this.tens = []; this.ones = [];
    for (let i = 0; i < tens; i++) { const t = this.newTen(); t.position.set(this.tenX(i), 0, 0); this.group.add(t); this.tens.push(t); }
    for (let i = 0; i < ones; i++) { const c = this.newOne(); c.position.set(this.oneX(i), this.u * 0.47, this.oneZ(i)); this.group.add(c); this.ones.push(c); }
    this.updateLabel();
  }
  setNumber(n: number) { this.set(Math.floor(n / 10), n % 10); }
  addTen() { if (this.tens.length >= 10) return false; const t = this.newTen(); t.position.set(this.tenX(this.tens.length), 0, 0); this.group.add(t); this.tens.push(t); this.pop(t); this.updateLabel(); return true; }
  addOne() { if (this.ones.length >= 19) return false; const i = this.ones.length; const c = this.newOne(); c.position.set(this.oneX(i), this.u * 0.47, this.oneZ(i)); this.group.add(c); this.ones.push(c); this.pop(c); this.updateLabel(); return true; }
  removeTen() { const t = this.tens.pop(); if (!t) return false; this.remove(t); this.updateLabel(); return true; }
  removeOne() { const c = this.ones.pop(); if (!c) return false; this.remove(c); this.updateLabel(); return true; }
  /** Ten loose cubes become one tower. */
  bundle(done?: () => void) {
    if (this.ones.length < 10) return false;
    const gone = this.ones.splice(0, 10);
    const target = new THREE.Vector3(this.tenX(this.tens.length), this.u * 5, 0);
    gone.forEach((c) => { const p0 = c.position.clone(); this.ctx.tween(520, (k) => { c.position.lerpVectors(p0, target, k); c.scale.setScalar(Math.max(0.05, 1 - 0.8 * k)); }, () => this.group.remove(c), ease.inOut); });
    window.setTimeout(() => {
      const t = this.newTen(); t.position.set(this.tenX(this.tens.length), 0, 0); this.group.add(t); this.tens.push(t); this.pop(t, 380);
      this.layout(300); done?.();
    }, 560);
    this.updateLabel();
    return true;
  }
  /** One tower is broken into ten loose cubes. */
  breakTen(done?: () => void) {
    const t = this.tens.pop();
    if (!t) return false;
    const base = t.position.clone();
    this.remove(t, 300);
    window.setTimeout(() => {
      for (let i = 0; i < 10; i++) {
        const c = this.newOne(); c.position.copy(base).add(new THREE.Vector3(0, this.u * 5, 0)); this.group.add(c); this.ones.push(c); this.pop(c, 280);
      }
      this.layout(520); done?.();
    }, 320);
    this.updateLabel();
    return true;
  }
  /** Take everything from another board and put it in this one (the two numbers are joined). */
  absorb(other: Blocks, done?: () => void) {
    const movers = [...other.tens.map((o) => ({ o, ten: true })), ...other.ones.map((o) => ({ o, ten: false }))];
    other.tens = []; other.ones = [];
    other.updateLabel();
    movers.forEach(({ o, ten }) => {
      this.group.attach(o);
      if (ten) this.tens.push(o); else this.ones.push(o);
    });
    this.layout(700);
    window.setTimeout(() => done?.(), 760);
  }
  dispose() { this.ctx.scene.remove(this.group); }
}
