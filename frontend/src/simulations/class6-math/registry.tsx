import React, { lazy } from 'react';
import { findClass7Sim } from '../class7-math/registry';

/** Class 6 Mathematics · lessons 1–20 of "Mathematics, Grade 6". Loaded only when a child opens one. Looked up by `componentKey` or `code`. */
type Comp = React.ComponentType<{ onBackToLibrary: () => void; userRole?: string }>;
const L = (loader: () => Promise<any>, name: string): Comp => lazy(() => loader().then((m) => ({ default: m[name] })));

export const CLASS6_MATH: { code: string; key: string; titleEn: string; titleNp: string; lesson: number; Component: Comp }[] = [
  { code: 'SIM-MATH-G6-L1-01', key: 'class6-math-l1-venn', lesson: 1, titleEn: 'Venn Diagram Lab', titleNp: 'भेन चित्र प्रयोगशाला', Component: L(() => import('./G6Number'), 'VennLab6') },
  { code: 'SIM-MATH-G6-L2-01', key: 'class6-math-l2-big-towers', lesson: 2, titleEn: 'Big Number Towers', titleNp: 'ठूला सङ्ख्याका टावर', Component: L(() => import('./G6Number'), 'BigTowers6') },
  { code: 'SIM-MATH-G6-L2-02', key: 'class6-math-l2-factor-lab', lesson: 2, titleEn: 'Factor Lab', titleNp: 'गुणनखण्ड प्रयोगशाला', Component: L(() => import('./G6Number'), 'FactorLab6') },
  { code: 'SIM-MATH-G6-L2-03', key: 'class6-math-l2-hcf-lcm', lesson: 2, titleEn: 'HCF and LCM Lab', titleNp: 'म.स. र ल.स. प्रयोगशाला', Component: L(() => import('./G6Number'), 'HcfLcmLab6') },
  { code: 'SIM-MATH-G6-L3-01', key: 'class6-math-l3-integer-line', lesson: 3, titleEn: 'Integer Number Line', titleNp: 'पूर्णाङ्क सङ्ख्यारेखा', Component: L(() => import('./G6Number'), 'IntegerLab6') },
  { code: 'SIM-MATH-G6-L4-01', key: 'class6-math-l4-fraction-add', lesson: 4, titleEn: 'Fraction Add and Subtract', titleNp: 'भिन्नको जोडघटाउ', Component: L(() => import('./G6Arith'), 'FractionLab6') },
  { code: 'SIM-MATH-G6-L4-02', key: 'class6-math-l4-fraction-mul', lesson: 4, titleEn: 'Fraction Multiply and Divide', titleNp: 'भिन्नको गुणन र भाग', Component: L(() => import('./G6Arith'), 'FracMulLab6') },
  { code: 'SIM-MATH-G6-L5-01', key: 'class6-math-l5-decimal-shift', lesson: 5, titleEn: 'Decimal Point Mover', titleNp: 'दशमलव बिन्दु सार्ने', Component: L(() => import('./G6Arith'), 'DecimalShift6') },
  { code: 'SIM-MATH-G6-L5-02', key: 'class6-math-l5-decimal-mul', lesson: 5, titleEn: 'Decimal Multiplication Grid', titleNp: 'दशमलव गुणन ग्रिड', Component: L(() => import('./G6Arith'), 'DecimalMul6') },
  { code: 'SIM-MATH-G6-L6-01', key: 'class6-math-l6-percentage', lesson: 6, titleEn: 'Percentage Lab', titleNp: 'प्रतिशत प्रयोगशाला', Component: L(() => import('./G6Arith'), 'Percent6') },
  { code: 'SIM-MATH-G6-L7-01', key: 'class6-math-l7-profit-loss', lesson: 7, titleEn: 'Profit and Loss', titleNp: 'नाफा र नोक्सान', Component: L(() => import('./G6Arith'), 'ProfitLoss6') },
  { code: 'SIM-MATH-G6-L8-01', key: 'class6-math-l8-unitary', lesson: 8, titleEn: 'Unitary Method', titleNp: 'ऐकिक नियम', Component: L(() => import('./G6Arith'), 'UnitaryLab6') },
  { code: 'SIM-MATH-G6-L9-01', key: 'class6-math-l9-distance', lesson: 9, titleEn: 'Distance: km to mm', titleNp: 'दुरी: किमीदेखि मिमीसम्म', Component: L(() => import('../class5-math/UnitSims5'), 'DistanceLab6') },
  { code: 'SIM-MATH-G6-L10-01', key: 'class6-math-l10-area-lab', lesson: 10, titleEn: 'Area Lab', titleNp: 'क्षेत्रफल प्रयोगशाला', Component: L(() => import('./G6Measure'), 'AreaLab6') },
  { code: 'SIM-MATH-G6-L10-02', key: 'class6-math-l10-volume', lesson: 10, titleEn: 'Volume and Capacity', titleNp: 'आयतन र क्षमता', Component: L(() => import('./G6Measure'), 'VolumeLab6') },
  { code: 'SIM-MATH-G6-L11-01', key: 'class6-math-l11-indices', lesson: 11, titleEn: 'Power Blocks', titleNp: 'घाताङ्क ब्लक', Component: L(() => import('./G6Algebra'), 'IndicesLab6') },
  { code: 'SIM-MATH-G6-L12-01', key: 'class6-math-l12-area-model', lesson: 12, titleEn: 'Area Model: (x+a)(x+b)', titleNp: 'क्षेत्रफल मोडल: (x+a)(x+b)', Component: L(() => import('./G6Algebra'), 'ExprMulLab6') },
  { code: 'SIM-MATH-G6-L12-02', key: 'class6-math-l12-algebra-blocks', lesson: 12, titleEn: 'Algebra Blocks', titleNp: 'बीजीय पदको मान', Component: L(() => import('./G6Algebra'), 'AlgebraLab6') },
  { code: 'SIM-MATH-G6-L12-03', key: 'class6-math-l12-adding-expressions', lesson: 12, titleEn: 'Adding Expressions', titleNp: 'बीजीय अभिव्यक्तिको जोड', Component: L(() => import('./G6Algebra'), 'LikeTermsLab6') },
  { code: 'SIM-MATH-G6-L13-01', key: 'class6-math-l13-equation', lesson: 13, titleEn: 'Equation Balance', titleNp: 'समीकरण तराजु', Component: L(() => import('./G6Algebra'), 'EquationLab6') },
  { code: 'SIM-MATH-G6-L13-02', key: 'class6-math-l13-inequality', lesson: 13, titleEn: 'Inequality Number Line', titleNp: 'असमानता सङ्ख्यारेखा', Component: L(() => import('./G6Algebra'), 'InequalityLab6') },
  { code: 'SIM-MATH-G6-L13-03', key: 'class6-math-l13-line-graph', lesson: 13, titleEn: 'Line Graph Lab', titleNp: 'रेखाचित्र प्रयोगशाला', Component: L(() => import('./G6Algebra'), 'GraphLab6') },
  { code: 'SIM-MATH-G6-L14-01', key: 'class6-math-l14-parallel-lines', lesson: 14, titleEn: 'Parallel Lines and Angles', titleNp: 'समानान्तर रेखा र कोण', Component: L(() => import('./G6Geometry'), 'TransversalLab6') },
  { code: 'SIM-MATH-G6-L15-01', key: 'class6-math-l15-triangle', lesson: 15, titleEn: 'Triangle Lab', titleNp: 'त्रिभुज प्रयोगशाला', Component: L(() => import('./G6Geometry'), 'TriangleLab6') },
  { code: 'SIM-MATH-G6-L15-02', key: 'class6-math-l15-quadrilateral', lesson: 15, titleEn: 'Quadrilateral Lab', titleNp: 'चतुर्भुज प्रयोगशाला', Component: L(() => import('./G6Geometry'), 'QuadLab6') },
  { code: 'SIM-MATH-G6-L16-01', key: 'class6-math-l16-circle', lesson: 16, titleEn: 'Circle Lab', titleNp: 'वृत्त प्रयोगशाला', Component: L(() => import('./G6Geometry'), 'CircleLab6') },
  { code: 'SIM-MATH-G6-L17-01', key: 'class6-math-l17-solids-nets', lesson: 17, titleEn: 'Solids and Nets', titleNp: 'ठोस वस्तु र जाल', Component: L(() => import('./G6Geometry'), 'SolidLab6') },
  { code: 'SIM-MATH-G6-L18-01', key: 'class6-math-l18-coordinates', lesson: 18, titleEn: 'Coordinate Plane', titleNp: 'निर्देशाङ्क समतल', Component: L(() => import('./G6Geometry'), 'CoordLab6') },
  { code: 'SIM-MATH-G6-L19-01', key: 'class6-math-l19-symmetry', lesson: 19, titleEn: 'Symmetry Lab', titleNp: 'सममिति प्रयोगशाला', Component: L(() => import('./G6Geometry'), 'SymmetryLab6') },
  { code: 'SIM-MATH-G6-L19-02', key: 'class6-math-l19-tessellation', lesson: 19, titleEn: 'Tessellation Lab', titleNp: 'टेस्सेलेसन', Component: L(() => import('./G6Geometry'), 'TessLab6') },
  { code: 'SIM-MATH-G6-L20-01', key: 'class6-math-l20-statistics', lesson: 20, titleEn: 'Statistics Lab', titleNp: 'तथ्याङ्क प्रयोगशाला', Component: L(() => import('./G6Measure'), 'StatsLab6') },
];

export const findClass6Sim = (componentKey?: string, code?: string) =>
  CLASS6_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code)) || findClass7Sim(componentKey, code);
