import { shuffle, toNp, enName } from '../class1-math-kit/nepali';

/** Class 2 Mathematics 2D helpers shared by the lesson simulations. */

export const fmt = (lang: 'ne' | 'en', n: number | string) => (lang === 'ne' ? toNp(n) : String(n));

/** Answer choices around the right answer; stable for a given seed so re-renders never reshuffle them. */
export const numChoices = (ans: number, seed: number, near: number[] = [1, -1, 10, -10, 2]): number[] => {
  const pool = near.map((d) => ans + d).filter((v) => v >= 0 && v !== ans);
  const wrong = shuffle(Array.from(new Set(pool)), seed).slice(0, 2);
  while (wrong.length < 2) wrong.push(ans + wrong.length + 3);
  return shuffle([ans, ...wrong], seed + 5);
};

/** English words for 0–999, e.g. 345 → "three hundred forty-five" */
export const enName1000 = (n: number): string => {
  if (n < 100) return enName(n);
  const h = Math.floor(n / 100), r = n % 100;
  return `${enName(h)} hundred${r ? ' ' + enName(r) : ''}`;
};

/** Nepali hundred words: 345 → "तीन सय 45" (the last two digits are read as numerals) */
export const npBig = (n: number): string => {
  const NP = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ'];
  if (n < 100) return toNp(n);
  const h = Math.floor(n / 100), r = n % 100;
  return `${NP[h]} सय${r ? ' ' + toNp(r) : ''}`;
};
