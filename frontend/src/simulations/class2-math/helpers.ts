import * as THREE from 'three';
import { StageCtx, ease } from '../class1-math-kit/useStage';
import { cube, textSprite, retext } from '../class1-math-kit/models';
import { shuffle, toNp } from '../class1-math-kit/nepali';

/** Class 2 Mathematics helpers shared by the lesson simulations. */

export const fmt = (lang: 'ne' | 'en', n: number | string) => (lang === 'ne' ? toNp(n) : String(n));

/** Answer choices around the right answer; stable for a given seed so re-renders never reshuffle them. */
export const numChoices = (ans: number, seed: number, near: number[] = [1, -1, 10, -10, 2]): number[] => {
  const pool = near.map((d) => ans + d).filter((v) => v >= 0 && v !== ans);
  const wrong = shuffle(Array.from(new Set(pool)), seed).slice(0, 2);
  while (wrong.length < 2) wrong.push(ans + wrong.length + 3);
  return shuffle([ans, ...wrong], seed + 5);
};

export const flatTexture = (n = 10) => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fb7185'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3;
  for (let i = 0; i <= n; i++) { const p = (i / n) * 256; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 256); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(256, p); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/**
 * Hundreds flats, tens towers and one cubes for three-digit numbers (up to 999).
 * Flats pile up like sheets of paper; ten towers make a flat; ten flats would make a thousand (not needed under 1000).
 */
export class Blocks3 {
  group = new THREE.Group();
  hundreds: THREE.Object3D[] = [];
  tens: THREE.Object3D[] = [];
  ones: THREE.Object3D[] = [];
  private label: THREE.Sprite;
  private flatMat: THREE.MeshStandardMaterial;
  readonly u: number;
  constructor(private ctx: StageCtx, private o: { x?: number; z?: number; u?: number; labelColor?: string } = {}) {
    this.u = o.u ?? 0.3;
    this.group.position.set(o.x ?? 0, 0, o.z ?? 0);
    ctx.scene.add(this.group);
    this.flatMat = new THREE.MeshStandardMaterial({ map: flatTexture(), roughness: 0.5 });
    this.label = textSprite('0', 2, { px: 96, w: 256, h: 128, bg: 'rgba(255,255,255,0.94)', border: o.labelColor ?? '#0ea5e9' });
    this.group.add(this.label);
    this.updateLabel();
  }
  get value() { return this.hundreds.length * 100 + this.tens.length * 10 + this.ones.length; }
  private flatY = (i: number) => i * this.u * 0.55 + this.u * 0.27;
  private tenX = (i: number) => this.u * 12 + i * this.u * 1.4;
  private oneX = (i: number) => this.u * 12 + 10 * this.u * 1.4 + 0.5 + (i % 5) * this.u * 1.15;
  private oneZ = (i: number) => Math.floor(i / 5) * this.u * 1.15;
  private updateLabel() {
    retext(this.label, String(this.value), { px: 96, w: 256, h: 128, bg: 'rgba(255,255,255,0.94)', border: this.o.labelColor ?? '#0ea5e9' });
    this.label.position.set(this.u * 12, this.u * 11 + 1, 0);
  }
  private newFlat() { const m = new THREE.Mesh(new THREE.BoxGeometry(this.u * 10, this.u * 0.5, this.u * 10), this.flatMat); m.castShadow = m.receiveShadow = true; return m; }
  private newTen() { const g = new THREE.Group(); for (let i = 0; i < 10; i++) { const c = cube('#38bdf8', this.u * 0.94); c.position.y = this.u * (i + 0.5); g.add(c); } return g; }
  private newOne() { return cube('#facc15', this.u * 0.94); }
  private pop(obj: THREE.Object3D, ms = 320) { obj.scale.set(0.01, 0.01, 0.01); this.ctx.tween(ms, (k) => obj.scale.setScalar(Math.max(0.01, k)), undefined, ease.back); }
  private fly(obj: THREE.Object3D, ms = 380) { const y0 = obj.position.y; this.ctx.tween(ms, (k) => { obj.position.y = y0 + k * 2.5; obj.scale.setScalar(Math.max(0.001, 1 - k)); }, () => this.group.remove(obj), ease.out); }
  private move(o: THREE.Object3D, x: number, y: number, z: number, ms: number) { const p = o.position.clone(); this.ctx.tween(ms, (k) => o.position.set(p.x + (x - p.x) * k, p.y + (y - p.y) * k, p.z + (z - p.z) * k), undefined, ease.out); }
  layout(ms = 300) {
    this.hundreds.forEach((h, i) => this.move(h, this.u * 5, this.flatY(i), this.u * 5, ms));
    this.tens.forEach((t, i) => this.move(t, this.tenX(i), 0, 0, ms));
    this.ones.forEach((c, i) => this.move(c, this.oneX(i), this.u * 0.47, this.oneZ(i), ms));
    this.updateLabel();
  }
  set(h: number, t: number, o: number) {
    [...this.hundreds, ...this.tens, ...this.ones].forEach((x) => this.group.remove(x));
    this.hundreds = []; this.tens = []; this.ones = [];
    for (let i = 0; i < h; i++) { const f = this.newFlat(); f.position.set(this.u * 5, this.flatY(i), this.u * 5); this.group.add(f); this.hundreds.push(f); }
    for (let i = 0; i < t; i++) { const x = this.newTen(); x.position.set(this.tenX(i), 0, 0); this.group.add(x); this.tens.push(x); }
    for (let i = 0; i < o; i++) { const c = this.newOne(); c.position.set(this.oneX(i), this.u * 0.47, this.oneZ(i)); this.group.add(c); this.ones.push(c); }
    this.updateLabel();
  }
  setNumber(n: number) { this.set(Math.floor(n / 100), Math.floor((n % 100) / 10), n % 10); }
  addHundred() { if (this.hundreds.length >= 9) return false; const f = this.newFlat(); f.position.set(this.u * 5, this.flatY(this.hundreds.length), this.u * 5); this.group.add(f); this.hundreds.push(f); this.pop(f); this.updateLabel(); return true; }
  addTen() { if (this.tens.length >= 19) return false; const x = this.newTen(); x.position.set(this.tenX(this.tens.length), 0, 0); this.group.add(x); this.tens.push(x); this.pop(x); this.updateLabel(); return true; }
  addOne() { if (this.ones.length >= 24) return false; const i = this.ones.length; const c = this.newOne(); c.position.set(this.oneX(i), this.u * 0.47, this.oneZ(i)); this.group.add(c); this.ones.push(c); this.pop(c); this.updateLabel(); return true; }
  removeHundred() { const o = this.hundreds.pop(); if (!o) return false; this.fly(o); this.updateLabel(); return true; }
  removeTen() { const o = this.tens.pop(); if (!o) return false; this.fly(o); this.updateLabel(); return true; }
  removeOne() { const o = this.ones.pop(); if (!o) return false; this.fly(o); this.updateLabel(); return true; }
  /** ten ones → one ten */
  bundleOnes(done?: () => void) {
    if (this.ones.length < 10) return false;
    const gone = this.ones.splice(0, 10);
    const target = new THREE.Vector3(this.tenX(this.tens.length), this.u * 5, 0);
    gone.forEach((c) => { const p0 = c.position.clone(); this.ctx.tween(520, (k) => { c.position.lerpVectors(p0, target, k); c.scale.setScalar(Math.max(0.05, 1 - 0.8 * k)); }, () => this.group.remove(c), ease.inOut); });
    window.setTimeout(() => { const t = this.newTen(); t.position.set(this.tenX(this.tens.length), 0, 0); this.group.add(t); this.tens.push(t); this.pop(t, 380); this.layout(300); done?.(); }, 560);
    this.updateLabel(); return true;
  }
  /** ten tens → one hundred flat */
  bundleTens(done?: () => void) {
    if (this.tens.length < 10) return false;
    const gone = this.tens.splice(0, 10);
    const target = new THREE.Vector3(this.u * 5, this.flatY(this.hundreds.length) + this.u * 2, this.u * 5);
    gone.forEach((c) => { const p0 = c.position.clone(); this.ctx.tween(560, (k) => { c.position.lerpVectors(p0, target, k); c.scale.setScalar(Math.max(0.05, 1 - 0.9 * k)); }, () => this.group.remove(c), ease.inOut); });
    window.setTimeout(() => { const f = this.newFlat(); f.position.set(this.u * 5, this.flatY(this.hundreds.length), this.u * 5); this.group.add(f); this.hundreds.push(f); this.pop(f, 420); this.layout(300); done?.(); }, 600);
    this.updateLabel(); return true;
  }
  /** one ten → ten ones */
  breakTen(done?: () => void) {
    const t = this.tens.pop(); if (!t) return false;
    const base = t.position.clone(); this.fly(t, 300);
    window.setTimeout(() => { for (let i = 0; i < 10; i++) { const c = this.newOne(); c.position.copy(base).add(new THREE.Vector3(0, this.u * 5, 0)); this.group.add(c); this.ones.push(c); this.pop(c, 280); } this.layout(520); done?.(); }, 320);
    this.updateLabel(); return true;
  }
  /** one hundred flat → ten tens */
  breakHundred(done?: () => void) {
    const f = this.hundreds.pop(); if (!f) return false;
    const base = f.position.clone(); this.fly(f, 320);
    window.setTimeout(() => { for (let i = 0; i < 10; i++) { const x = this.newTen(); x.position.set(base.x, base.y, base.z); this.group.add(x); this.tens.push(x); this.pop(x, 300); } this.layout(560); done?.(); }, 340);
    this.updateLabel(); return true;
  }
  /** take everything from another board (the numbers are joined) */
  absorb(other: Blocks3, done?: () => void) {
    const movers = [...other.hundreds.map((o) => ({ o, k: 'h' })), ...other.tens.map((o) => ({ o, k: 't' })), ...other.ones.map((o) => ({ o, k: 'o' }))];
    other.hundreds = []; other.tens = []; other.ones = []; other.updateLabel();
    movers.forEach(({ o, k }) => { this.group.attach(o); (k === 'h' ? this.hundreds : k === 't' ? this.tens : this.ones).push(o); });
    this.layout(700);
    window.setTimeout(() => done?.(), 760);
  }
  dispose() { this.ctx.scene.remove(this.group); }
}

import { enName } from '../class1-math-kit/nepali';
/** English words for 0–999, e.g. 345 → "three hundred forty-five" */
export const enName1000 = (n: number): string => {
  if (n < 100) return enName(n);
  const h = Math.floor(n / 100), r = n % 100;
  return `${enName(h)} hundred${r ? ' ' + enName(r) : ''}`;
};
/** Nepali hundred words: 345 → "तीन सय ४५" (the last two digits are read as numerals) */
export const npBig = (n: number): string => {
  const NP = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ'];
  if (n < 100) return toNp(n);
  const h = Math.floor(n / 100), r = n % 100;
  return `${NP[h]} सय${r ? ' ' + toNp(r) : ''}`;
};
