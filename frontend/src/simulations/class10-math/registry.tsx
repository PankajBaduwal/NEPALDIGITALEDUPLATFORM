import React from 'react';

const L = (loader: () => Promise<any>, exportName?: string) =>
  React.lazy(async () => {
    const mod = await loader();
    return { default: exportName ? mod[exportName] : mod.default || mod };
  });

export interface Class10MathSimDef {
  code: string;
  key: string;
  lesson: number;
  unit: number;
  grade: number;
  titleEn: string;
  titleNp: string;
  Component: React.ComponentType<any>;
}

export const CLASS10_MATH: Class10MathSimDef[] = [
  // ── UNIT 1: SETS (समूह) ───────────────────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U1-01',
    key: 'class10-math-u1-venn-diagram-lab',
    lesson: 1,
    unit: 1,
    grade: 10,
    titleEn: 'Interactive Venn Diagram Laboratory',
    titleNp: 'अन्तरक्रियात्मक भेन चित्र प्रयोगशाला',
    Component: L(() => import('./VennDiagramLab'), 'VennDiagramLab'),
  },

  // ── UNIT 2: COMPOUND INTEREST (चक्रीय ब्याज) ──────────────────────────────
  {
    code: 'SIM-MATH-G10-U2-01',
    key: 'class10-math-u2-compound-interest-lab',
    lesson: 1,
    unit: 2,
    grade: 10,
    titleEn: 'Compound Interest Visual Laboratory',
    titleNp: 'चक्रीय ब्याज दृश्य प्रयोगशाला',
    Component: L(() => import('./CompoundInterestLab'), 'CompoundInterestLab'),
  },

  // ── UNIT 3: GROWTH AND DEPRECIATION (जनसङ्ख्या वृद्धि तथा ह्रास) ──────────
  {
    code: 'SIM-MATH-G10-U3-01',
    key: 'class10-math-u3-growth-depreciation-explorer',
    lesson: 1,
    unit: 3,
    grade: 10,
    titleEn: 'Growth and Depreciation Explorer',
    titleNp: 'जनसङ्ख्या वृद्धि तथा ह्रास अन्वेषक',
    Component: L(() => import('./GrowthDepreciationExplorer'), 'GrowthDepreciationExplorer'),
  },
];

export const findClass10Sim = (componentKey?: string, code?: string) =>
  CLASS10_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));
