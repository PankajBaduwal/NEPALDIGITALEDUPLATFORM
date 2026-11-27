import React from 'react';
import { QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle } from '../class1-math-kit/nepali';
import { words, near, digitsOf, fmt, big } from '../class3-math/h3';

/** Class 4 Mathematics helpers shared by the lesson simulations. */
export { fmt, big, near, words, digitsOf } from '../class3-math/h3';
export interface Props { onBackToLibrary: () => void; userRole?: string }

/** 1234567 → "12,34,567" (Nepali / Indian grouping). */
export const indian = (n: number): string => {
  const s = String(Math.abs(n));
  const sign = n < 0 ? '-' : '';
  if (s.length <= 3) return sign + s;
  return sign + s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3);
};

/** 1234567 → "twelve lakh thirty-four thousand five hundred sixty-seven". */
export const lakhWords = (n: number): string => {
  const l = Math.floor(n / 100000);
  const t = Math.floor((n % 100000) / 1000);
  const r = n % 1000;
  const p: string[] = [];
  if (l) p.push(`${words(l)} lakh`);
  if (t) p.push(`${words(t)} thousand`);
  if (r) p.push(words(r));
  return p.join(' ') || 'zero';
};

/** Multiple-choice question with text options. */
export const mcq = (np: string, en: string, answer: string, wrongs: string[], seed = 0): QuizQuestion => {
  const ws = Array.from(new Set(wrongs)).filter((w) => w !== answer).slice(0, 3);
  while (ws.length < 1) ws.push(answer + '!');
  return { np, en, answer, options: shuffle([answer, ...ws], seed + 1).map((o) => ({ key: o, label: o })) };
};

/** Multiple-choice question with numeric options near the right answer. */
export const numQ = (
  np: string,
  en: string,
  ans: number,
  seed: number,
  deltas: number[],
  show: (n: number) => string,
  min = 0
): QuizQuestion => ({
  np,
  en,
  answer: String(ans),
  options: near(ans, seed, deltas, min).map((x) => ({ key: String(x), label: show(x) })),
});

/** Seven places of the Nepali number system, from ten-lakhs down to ones. */
export const PL7 = [
  { k: 'tl', np: 'दशलाख', en: 'Ten Lakhs', color: '#EC4899', val: 1000000 },
  { k: 'l', np: 'लाख', en: 'Lakhs', color: '#14B8A6', val: 100000 },
  { k: 'tth', np: 'दशहजार', en: 'Ten-Thousands', color: '#8B5CF6', val: 10000 },
  { k: 'th', np: 'हजार', en: 'Thousands', color: '#0EA5E9', val: 1000 },
  { k: 'h', np: 'सय', en: 'Hundreds', color: '#22C55E', val: 100 },
  { k: 't', np: 'दशक', en: 'Tens', color: '#F59E0B', val: 10 },
  { k: 'o', np: 'एकाइ', en: 'Ones', color: '#EF4444', val: 1 },
];

export const Hud: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = '#0ea5e9', children }) => (
  <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: `3px solid ${color}`, textAlign: 'center', maxWidth: 440 }}>{children}</div>
);

export const Tip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{children}</div>
);
