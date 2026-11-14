import React from 'react';
import { QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle } from '../class1-math-kit/nepali';
import { words, near } from '../class3-math/h3';

/** Class 4 Mathematics helpers shared by the lesson simulations. */
export { fmt, big, near, words, Pillars, digitsOf } from '../class3-math/h3';
export interface Props { onBackToLibrary: () => void; userRole?: string }

/** 1234567 → "12,34,567" (Nepali / Indian grouping). */
export const indian = (n: number): string => {
  const s = String(Math.abs(n)); const sign = n < 0 ? '-' : '';
  if (s.length <= 3) return sign + s;
  return sign + s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3);
};
/** 1234567 → "twelve lakh thirty-four thousand five hundred sixty-seven". */
export const lakhWords = (n: number): string => {
  const l = Math.floor(n / 100000), t = Math.floor((n % 100000) / 1000), r = n % 1000; const p: string[] = [];
  if (l) p.push(`${words(l)} lakh`); if (t) p.push(`${words(t)} thousand`); if (r) p.push(words(r));
  return p.join(' ') || 'zero';
};

/** Multiple-choice question with text options (right answer plus up to three wrong ones). */
export const mcq = (np: string, en: string, answer: string, wrongs: string[], seed = 0): QuizQuestion => {
  const ws = Array.from(new Set(wrongs)).filter((w) => w !== answer).slice(0, 3);
  while (ws.length < 1) ws.push(answer + '!');
  return { np, en, answer, options: shuffle([answer, ...ws], seed + 1).map((o) => ({ key: o, label: o })) };
};
/** Multiple-choice question with numeric options near the right answer. */
export const numQ = (np: string, en: string, ans: number, seed: number, deltas: number[], show: (n: number) => string, min = 0): QuizQuestion => ({
  np, en, answer: String(ans), options: near(ans, seed, deltas, min).map((x) => ({ key: String(x), label: show(x) })),
});

/** Seven places of the Nepali number system, from ten-lakhs down to ones. */
export const PL7 = [
  { np: 'दशलाख', en: 'Ten lakhs', color: '#ec4899' },
  { np: 'लाख', en: 'Lakhs', color: '#14b8a6' },
  { np: 'दशहजार', en: 'Ten-thousands', color: '#8b5cf6' },
  { np: 'हजार', en: 'Thousands', color: '#0ea5e9' },
  { np: 'सय', en: 'Hundreds', color: '#22c55e' },
  { np: 'दशक', en: 'Tens', color: '#f59e0b' },
  { np: 'एकाइ', en: 'Ones', color: '#ef4444' },
];

export const Hud: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = '#0ea5e9', children }) => (
  <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: `3px solid ${color}`, textAlign: 'center', maxWidth: 440 }}>{children}</div>
);
export const Tip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{children}</div>
);
