import React, { lazy, Suspense } from 'react';

const L = (fn: () => Promise<any>, exportName?: string) => {
  const Comp = lazy(async () => {
    const mod = await fn();
    return { default: exportName ? mod[exportName] : mod.default };
  });
  return (props: any) => (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center', color: '#187C68', fontWeight: 800 }}>
          लोड हुँदैछ... (Loading Grade 9 simulation...)
        </div>
      }
    >
      <Comp {...props} />
    </Suspense>
  );
};

export const CLASS9_MATH = [
  // ── UNIT 1: SETS (समूह) ──────────────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U1-01',
    key: 'class9-math-u1-set-explorer-venn-lab',
    lesson: 1,
    unit: 1,
    grade: 9,
    titleEn: 'Set Explorer and Venn Diagram Laboratory',
    titleNp: 'समूह अन्वेषक र भेन चित्र प्रयोगशाला',
    Component: L(() => import('./SetExplorerVennLab'), 'SetExplorerVennLab'),
  },
  {
    code: 'SIM-MATH-G9-U1-02',
    key: 'class9-math-u1-set-operations-challenge',
    lesson: 1,
    unit: 1,
    grade: 9,
    titleEn: 'Set Operations Challenge',
    titleNp: 'समूहका क्रियाहरू र छायाङ्कन चुनौती',
    Component: L(() => import('./SetOperationsChallenge'), 'SetOperationsChallenge'),
  },
  {
    code: 'SIM-MATH-G9-U1-03',
    key: 'class9-math-u1-cardinality-problem-solver',
    lesson: 1,
    unit: 1,
    grade: 9,
    titleEn: 'Cardinality and Venn Diagram Problem Solver',
    titleNp: 'समूहको गणनात्मकता र समस्या समाधानकर्ता',
    Component: L(() => import('./CardinalityVennProblemSolver'), 'CardinalityVennProblemSolver'),
  },
];

export const findClass9Sim = (componentKey?: string, code?: string) =>
  CLASS9_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));
