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
  { np: 'दशहजार', en: 'Ten-thousands', color: '#8B5CF6' },
  { np: 'हजार', en: 'Thousands', color: '#0284C7' },
  { np: 'सय', en: 'Hundreds', color: '#10B981' },
  { np: 'दशक', en: 'Tens', color: '#F59E0B' },
  { np: 'एकाइ', en: 'Ones', color: '#EF4444' },
];

export const digitsOf = (n: number, places = 5): number[] => {
  const s = String(n).padStart(places, '0').slice(-places);
  return s.split('').map(Number);
};
