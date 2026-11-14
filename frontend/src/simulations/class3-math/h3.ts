import * as THREE from 'three';
import { StageCtx, ease } from '../class1-math-kit/useStage';
import { cube, textSprite, mat, shadowed } from '../class1-math-kit/models';
import { toNp, shuffle } from '../class1-math-kit/nepali';

/** Class 3 Mathematics helpers shared by the lesson simulations. */
export { numChoices } from '../class2-math/helpers';
export const fmt = (lang: 'ne' | 'en', n: number | string) => (lang === 'ne' ? toNp(n) : String(n));
/** 12345 → "12,345" (Nepali digits when lang is ne). */
export const big = (lang: 'ne' | 'en', n: number) => fmt(lang, n.toLocaleString('en-US'));

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const below1000 = (n: number): string => (n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '') : ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + below1000(n % 100) : ''));
/** English words up to 99,999. */
export const words = (n: number): string => (n === 0 ? 'zero' : n < 1000 ? below1000(n) : below1000(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + below1000(n % 1000) : ''));

/** Stable list of unique wrong answers near the right one. */
export const near = (ans: number, seed: number, deltas: number[], min = 0): number[] => {
  const pool = Array.from(new Set(deltas.map((d) => ans + d))).filter((v) => v >= min && v !== ans);
  const wrong = shuffle(pool, seed).slice(0, 2);
  let k = 1; while (wrong.length < 2) { const w = ans + 7 * k++; if (!wrong.includes(w)) wrong.push(w); }
  return shuffle([ans, ...wrong], seed + 3);
};

export const PLACES = [
  { np: 'दशहजार', en: 'Ten-thousands', color: '#8b5cf6' },
  { np: 'हजार', en: 'Thousands', color: '#0ea5e9' },
  { np: 'सय', en: 'Hundreds', color: '#22c55e' },
  { np: 'दशक', en: 'Tens', color: '#f59e0b' },
  { np: 'एकाइ', en: 'Ones', color: '#ef4444' },
];

/** Columns of stacked cubes — one column per place value; digits animate in and out. */
export class Pillars {
  group = new THREE.Group();
  private cols: THREE.Mesh[][] = [];
  private digits: number[] = [];
  private tops: THREE.Sprite[] = [];
  readonly gap: number;
  constructor(private ctx: StageCtx, private n: number, private o: { x?: number; z?: number; u?: number; colors?: string[]; names?: { np: string; en: string }[]; lang?: () => 'ne' | 'en' } = {}) {
    const u = (this.u = o.u ?? 0.8); this.gap = u * 2.1;
    this.group.position.set(o.x ?? 0, 0, o.z ?? 0); ctx.scene.add(this.group);
    for (let c = 0; c < n; c++) {
      this.cols.push([]); this.digits.push(0);
      const base = shadowed(new THREE.Mesh(new THREE.BoxGeometry(u * 1.6, 0.18, u * 1.6), mat(o.colors?.[c] ?? '#94a3b8', 0.7))); base.position.set(this.x(c), 0.09, 0); this.group.add(base);
      const t = textSprite('0', 1.2, { px: 90, w: 128, h: 128, bg: 'rgba(255,255,255,.94)', border: o.colors?.[c] ?? '#0ea5e9' }); t.position.set(this.x(c), u * 9.7 + 0.9, 0); this.group.add(t); this.tops.push(t);
      if (o.names) { const nm = textSprite(o.names[c].np, 1.5, { px: 46, w: 256, h: 96, bg: null, color: '#334155' }); nm.position.set(this.x(c), -0.5, 1.2); this.group.add(nm); }
    }
  }
  readonly u: number;
  x = (c: number) => (c - (this.n - 1) / 2) * this.gap;
  set(d: number[], animate = true) {
    d.forEach((v, c) => {
      const cur = this.cols[c];
      while (cur.length > v) { const m = cur.pop()!; this.group.remove(m); }
      while (cur.length < v) {
        const m = cube(this.o.colors?.[c] ?? '#38bdf8', this.u * 0.94) as unknown as THREE.Mesh;
        m.position.set(this.x(c), 0.18 + this.u * (cur.length + 0.5), 0); this.group.add(m); cur.push(m);
        if (animate) { m.scale.setScalar(0.01); this.ctx.tween(260, (k) => m.scale.setScalar(Math.max(0.01, k)), undefined, ease.back); }
      }
      if (this.digits[c] !== v || !animate) { this.digits[c] = v; const old = this.tops[c]; const fresh = textSprite(String(v), 1.2, { px: 90, w: 128, h: 128, bg: 'rgba(255,255,255,.94)', border: this.o.colors?.[c] ?? '#0ea5e9' }); fresh.position.copy(old.position); this.group.remove(old); this.group.add(fresh); this.tops[c] = fresh; }
    });
  }
  highlight(c: number) { this.cols.forEach((col, i) => col.forEach((m) => { (m.material as THREE.MeshStandardMaterial).emissive?.setHex(i === c ? 0x333333 : 0); })); }
  dispose() { this.ctx.scene.remove(this.group); }
}

/** Number → digit array of fixed width. */
export const digitsOf = (n: number, w = 5) => String(n).padStart(w, '0').split('').map(Number);
