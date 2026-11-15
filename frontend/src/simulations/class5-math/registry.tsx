import React, { lazy } from 'react';
import { findClass6Sim } from '../class6-math/registry';

/** Class 5 Mathematics · lessons 1–15 of "Mathematics, Grade 5". Loaded only when a child opens one. Looked up by `componentKey` or `code`. */
type Comp = React.ComponentType<{ onBackToLibrary: () => void; userRole?: string }>;
const L = (loader: () => Promise<any>, name: string): Comp => lazy(() => loader().then((m) => ({ default: m[name] })));

export const CLASS5_MATH: { code: string; key: string; titleEn: string; titleNp: string; lesson: number; Component: Comp }[] = [
  { code: 'SIM-MATH-G5-L1-01', key: 'class5-math-l1-angle-lab', lesson: 1, titleEn: 'Angle Lab', titleNp: 'कोण प्रयोगशाला', Component: L(() => import('./G5Geometry'), 'AngleLab5') },
  { code: 'SIM-MATH-G5-L2-01', key: 'class5-math-l2-solid-lab', lesson: 2, titleEn: 'Solid Lab', titleNp: 'ठोस वस्तु प्रयोगशाला', Component: L(() => import('./G5Geometry'), 'SolidLab5') },
  { code: 'SIM-MATH-G5-L3-01', key: 'class5-math-l3-crore-towers', lesson: 3, titleEn: 'Crore Towers', titleNp: 'करोड टावर', Component: L(() => import('./G5Number'), 'CroreTowers5') },
  { code: 'SIM-MATH-G5-L4-01', key: 'class5-math-l4-simplification', lesson: 4, titleEn: 'Simplification Lab', titleNp: 'सरलीकरण प्रयोगशाला', Component: L(() => import('./G5Number'), 'BodmasLab5') },
  { code: 'SIM-MATH-G5-L5-01', key: 'class5-math-l5-fraction-bars', lesson: 5, titleEn: 'Fraction Bars', titleNp: 'भिन्न जोडघटाउ', Component: L(() => import('./G5Frac'), 'FractionLab5') },
  { code: 'SIM-MATH-G5-L5-02', key: 'class5-math-l5-mixed-fractions', lesson: 5, titleEn: 'Mixed Fractions', titleNp: 'मिश्रित भिन्न', Component: L(() => import('./G5Frac'), 'MixedLab5') },
  { code: 'SIM-MATH-G5-L6-01', key: 'class5-math-l6-decimal-blocks', lesson: 6, titleEn: 'Decimal Blocks', titleNp: 'दशमलव ब्लक', Component: L(() => import('./G5Frac'), 'DecimalLab5') },
  { code: 'SIM-MATH-G5-L7-01', key: 'class5-math-l7-percent-grid', lesson: 7, titleEn: 'Percent Grid', titleNp: 'प्रतिशत ग्रिड', Component: L(() => import('./G5Frac'), 'PercentLab5') },
  { code: 'SIM-MATH-G5-L8-01', key: 'class5-math-l8-time-lab', lesson: 8, titleEn: 'Time Lab', titleNp: 'समय प्रयोगशाला', Component: L(() => import('./G5Measure'), 'TimeLab5') },
  { code: 'SIM-MATH-G5-L8-02', key: 'class5-math-l8-time-units', lesson: 8, titleEn: 'Units of Time', titleNp: 'समयका एकाइ', Component: L(() => import('./UnitSims5'), 'TimeUnits5') },
  { code: 'SIM-MATH-G5-L9-01', key: 'class5-math-l9-distance', lesson: 9, titleEn: 'Distance: measure and convert', titleNp: 'दुरी: नाप र रूपान्तरण', Component: L(() => import('./UnitSims5'), 'DistanceLab5') },
  { code: 'SIM-MATH-G5-L10-01', key: 'class5-math-l10-capacity', lesson: 10, titleEn: 'Capacity: litre and millilitre', titleNp: 'क्षमता: लिटर र मिलिलिटर', Component: L(() => import('./UnitSims5'), 'CapacityLab5') },
  { code: 'SIM-MATH-G5-L11-01', key: 'class5-math-l11-weight', lesson: 11, titleEn: 'Weight: kilogram and gram', titleNp: 'तौल: केजी, ग्राम', Component: L(() => import('./UnitSims5'), 'WeightLab5') },
  { code: 'SIM-MATH-G5-L12-01', key: 'class5-math-l12-perimeter-area', lesson: 12, titleEn: 'Perimeter and Area Lab', titleNp: 'परिमिति र क्षेत्रफल', Component: L(() => import('./G5Measure'), 'PerimeterAreaLab5') },
  { code: 'SIM-MATH-G5-L12-02', key: 'class5-math-l12-volume-blocks', lesson: 12, titleEn: 'Volume Blocks', titleNp: 'आयतन ब्लक', Component: L(() => import('./G5Measure'), 'VolumeLab5') },
  { code: 'SIM-MATH-G5-L13-01', key: 'class5-math-l13-bill-shop', lesson: 13, titleEn: 'Bill Shop', titleNp: 'बिल पसल', Component: L(() => import('./G5Data'), 'BillLab5') },
  { code: 'SIM-MATH-G5-L13-02', key: 'class5-math-l13-budget-towers', lesson: 13, titleEn: 'Budget Towers', titleNp: 'बजेट टावर', Component: L(() => import('./G5Data'), 'BudgetLab5') },
  { code: 'SIM-MATH-G5-L14-01', key: 'class5-math-l14-tally-table', lesson: 14, titleEn: 'Tally Table', titleNp: 'गणना चिह्न र तालिका', Component: L(() => import('./G5Data'), 'TallyLab5') },
  { code: 'SIM-MATH-G5-L14-02', key: 'class5-math-l14-bar-graph', lesson: 14, titleEn: 'Bar Graph Lab', titleNp: 'स्तम्भ चित्र', Component: L(() => import('./G5Data'), 'BarLab5') },
  { code: 'SIM-MATH-G5-L15-01', key: 'class5-math-l15-algebra-blocks', lesson: 15, titleEn: 'Algebra Blocks', titleNp: 'बीजीय अभिव्यक्ति', Component: L(() => import('./G5Data'), 'AlgebraLab5') },
  { code: 'SIM-MATH-G5-L15-02', key: 'class5-math-l15-like-terms', lesson: 15, titleEn: 'Like Terms', titleNp: 'समान पद', Component: L(() => import('./G5Data'), 'LikeTermsLab5') },
];

export const findClass5Sim = (componentKey?: string, code?: string) =>
  CLASS5_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code)) || findClass6Sim(componentKey, code);
