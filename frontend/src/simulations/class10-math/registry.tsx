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

  // ── UNIT 4: CURRENCY AND EXCHANGE RATE (मुद्रा र विनिमय दर) ───────────────
  {
    code: 'SIM-MATH-G10-U4-01',
    key: 'class10-math-u4-currency-exchange-lab',
    lesson: 1,
    unit: 4,
    grade: 10,
    titleEn: 'Currency Exchange and Conversion Laboratory',
    titleNp: 'मुद्रा विनिमय तथा रूपान्तरण प्रयोगशाला',
    Component: L(() => import('./CurrencyExchangeLab'), 'CurrencyExchangeLab'),
  },

  // ── UNIT 5: AREA AND VOLUME (क्षेत्रफल र आयतन) ────────────────────────────
  {
    code: 'SIM-MATH-G10-U5-01',
    key: 'class10-math-u5-3d-geometry-explorer',
    lesson: 1,
    unit: 5,
    grade: 10,
    titleEn: '3D Geometry: Area and Volume Explorer',
    titleNp: '३डी ज्यामिति: क्षेत्रफल तथा आयतन अन्वेषक',
    Component: L(() => import('./AreaVolume3DExplorer'), 'AreaVolume3DExplorer'),
  },

  // ── UNIT 6: SEQUENCE AND SERIES (अनुक्रम र श्रेणी) ─────────────────────────
  {
    code: 'SIM-MATH-G10-U6-01',
    key: 'class10-math-u6-sequence-series-lab',
    lesson: 1,
    unit: 6,
    grade: 10,
    titleEn: 'Sequence and Series Pattern Laboratory',
    titleNp: 'अनुक्रम र श्रेणी नमुना प्रयोगशाला',
    Component: L(() => import('./SequenceSeriesLab'), 'SequenceSeriesLab'),
  },

  // ── UNIT 7: QUADRATIC EQUATION (वर्ग समीकरण) ──────────────────────────────
  {
    code: 'SIM-MATH-G10-U7-01',
    key: 'class10-math-u7-quadratic-explorer',
    lesson: 1,
    unit: 7,
    grade: 10,
    titleEn: 'Quadratic Equation and Parabola Explorer',
    titleNp: 'वर्ग समीकरण तथा परबोला अन्वेषक',
    Component: L(() => import('./QuadraticEquationExplorer'), 'QuadraticEquationExplorer'),
  },

  // ── UNIT 8: ALGEBRAIC FRACTION (बीजीय भिन्न) ──────────────────────────────
  {
    code: 'SIM-MATH-G10-U8-01',
    key: 'class10-math-u8-algebraic-fraction-lab',
    lesson: 1,
    unit: 8,
    grade: 10,
    titleEn: 'Algebraic Fraction Visual Laboratory',
    titleNp: 'बीजीय भिन्न दृश्य प्रयोगशाला',
    Component: L(() => import('./AlgebraicFractionLab'), 'AlgebraicFractionLab'),
  },

  // ── UNIT 9: INDICES (घाताङ्क) ──────────────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U9-01',
    key: 'class10-math-u9-indices-explorer',
    lesson: 1,
    unit: 9,
    grade: 10,
    titleEn: 'Laws of Indices Interactive Explorer',
    titleNp: 'घाताङ्कका नियमहरू अन्तरक्रियात्मक अन्वेषक',
    Component: L(() => import('./IndicesExplorer'), 'IndicesExplorer'),
  },

  // ── UNIT 10: TRIANGLE AND QUADRILATERALS (त्रिभुज र चतुर्भुजहरू) ──────────
  {
    code: 'SIM-MATH-G10-U10-01',
    key: 'class10-math-u10-equal-area-geometry',
    lesson: 1,
    unit: 10,
    grade: 10,
    titleEn: 'Equal-Area Geometry Explorer',
    titleNp: 'समान क्षेत्रफल ज्यामिति अन्वेषक',
    Component: L(() => import('./EqualAreaGeometryExplorer'), 'EqualAreaGeometryExplorer'),
  },

  // ── UNIT 11: CONSTRUCTION (रचना) ──────────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U11-01',
    key: 'class10-math-u11-construction-studio',
    lesson: 1,
    unit: 11,
    grade: 10,
    titleEn: 'Interactive Geometric Construction Studio',
    titleNp: 'अन्तरक्रियात्मक ज्यामितीय रचना स्टुडियो',
    Component: L(() => import('./GeometricConstructionStudio'), 'GeometricConstructionStudio'),
  },

  // ── UNIT 12: CIRCLE (वृत्त) ────────────────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U12-01',
    key: 'class10-math-u12-circle-theorems',
    lesson: 1,
    unit: 12,
    grade: 10,
    titleEn: 'Circle Theorem Explorer',
    titleNp: 'वृत्तका साध्यहरू अन्तरक्रियात्मक अन्वेषक',
    Component: L(() => import('./CircleTheoremExplorer'), 'CircleTheoremExplorer'),
  },
];

export const findClass10Sim = (componentKey?: string, code?: string) =>
  CLASS10_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));
