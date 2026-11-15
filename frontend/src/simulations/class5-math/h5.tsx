import { QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle, toNp } from '../class1-math-kit/nepali';
import { words, near } from '../class3-math/h3';

/** Helpers shared by the Class 5 and Class 6 mathematics labs. */
export { fmt, big, indian, lakhWords, Hud, Tip } from '../class4-math/h4';
export type { Props } from '../class4-math/h4';
export interface Bi { np: string; en: string }
export type Params = Record<string, number>;
export type LQ = QuizQuestion & { set?: Params };

/** A bilingual line: digits in the Nepali text are turned into Nepali digits automatically. */
export const bi = (np: string, en: string): Bi => ({ np: toNp(np), en });

export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
export const frac = (n: number, d: number) => `${n}/${d}`;
export const simp = (n: number, d: number): [number, number] => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
export const fracS = (n: number, d: number) => { const [a, b] = simp(n, d); return b === 1 ? String(a) : `${a}/${b}`; };

/** 123456789 → "twelve crore ..." (crore / lakh / thousand system). */
export const croreWords = (n: number): string => {
  const cr = Math.floor(n / 10000000), lk = Math.floor((n % 10000000) / 100000), th = Math.floor((n % 100000) / 1000), r = n % 1000; const p: string[] = [];
  if (cr) p.push(`${words(cr)} crore`); if (lk) p.push(`${words(lk)} lakh`); if (th) p.push(`${words(th)} thousand`); if (r) p.push(words(r));
  return p.join(' ') || 'zero';
};

/** Text multiple choice: the right answer plus up to three wrong ones. */
export const choice = (np: string, en: string, answer: string | number, wrongs: (string | number)[], i: number, set?: Params): LQ => {
  const a = String(answer); const ws = Array.from(new Set(wrongs.map(String))).filter((w) => w !== a).slice(0, 3);
  let k = 1; while (ws.length < 2) { const w = `${a}${'!'.repeat(k++)}`; ws.push(w); }
  return { np, en, answer: a, options: shuffle([a, ...ws], i + 1).map((o) => ({ key: o, label: o })), set };
};
/** Number multiple choice with options near the right answer. */
export const numChoice = (np: string, en: string, ans: number, i: number, deltas: number[], min = 0, unit = '', set?: Params): LQ => ({
  np, en, answer: String(ans), options: near(ans, i, deltas, min).map((x) => ({ key: String(x), label: `${x}${unit}` })), set,
});
/** Pick one from a list. */
export const pick = <T,>(a: T[], i = 0): T => a[(i + Math.floor(Math.random() * a.length)) % a.length];
