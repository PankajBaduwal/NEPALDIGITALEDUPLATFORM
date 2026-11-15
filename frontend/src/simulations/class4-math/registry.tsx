import React, { lazy } from 'react';
import { findClass5Sim } from '../class5-math/registry';

/** Class 4 Mathematics · lessons 1–15 of "Mathematics, Grade 4". Loaded only when a child opens one. Looked up by `componentKey` or `code`. */
type Comp = React.ComponentType<{ onBackToLibrary: () => void; userRole?: string }>;
const L = (loader: () => Promise<any>, name: string): Comp => lazy(() => loader().then((m) => ({ default: m[name] })));

export const CLASS4_MATH: { code: string; key: string; titleEn: string; titleNp: string; lesson: number; Component: Comp }[] = [
  { code: 'SIM-MATH-G4-L1-01', key: 'class4-math-l1-protractor', lesson: 1, titleEn: 'Protractor Lab', titleNp: 'चाँद प्रयोगशाला', Component: L(() => import('./G4Geometry'), 'ProtractorLab') },
  { code: 'SIM-MATH-G4-L2-01', key: 'class4-math-l2-shape-builder', lesson: 2, titleEn: 'Shape Builder', titleNp: 'आकृति निर्माता', Component: L(() => import('./G4Geometry'), 'ShapeBuilder') },
  { code: 'SIM-MATH-G4-L3-01', key: 'class4-math-l3-solid-explorer', lesson: 3, titleEn: 'Solid Explorer', titleNp: 'ठोस वस्तु अन्वेषक', Component: L(() => import('./G4Geometry'), 'SolidExplorer') },
  { code: 'SIM-MATH-G4-L4-01', key: 'class4-math-l4-lakh-towers', lesson: 4, titleEn: 'Lakh Towers', titleNp: 'लाख टावर', Component: L(() => import('./G4Number'), 'LakhTowers') },
  { code: 'SIM-MATH-G4-L4-02', key: 'class4-math-l4-round-off', lesson: 4, titleEn: 'Round-Off Line', titleNp: 'अनुमान रेखा (नजिकको मान)', Component: L(() => import('./G4Number'), 'RoundingLine') },
  { code: 'SIM-MATH-G4-L5-01', key: 'class4-math-l5-add-towers', lesson: 5, titleEn: 'Addition Towers (7 digits)', titleNp: 'जोडको टावर (७ अङ्क)', Component: L(() => import('./G4Ops'), 'AddTowers4') },
  { code: 'SIM-MATH-G4-L5-02', key: 'class4-math-l5-sub-towers', lesson: 5, titleEn: 'Subtraction Towers (7 digits)', titleNp: 'घटाउको टावर (७ अङ्क)', Component: L(() => import('./G4Ops'), 'SubTowers4') },
  { code: 'SIM-MATH-G4-L5-03', key: 'class4-math-l5-multiply-grid', lesson: 5, titleEn: 'Multiplication Grid', titleNp: 'गुणन ग्रिड', Component: L(() => import('./G4Ops'), 'MultiplyGrid') },
  { code: 'SIM-MATH-G4-L5-04', key: 'class4-math-l5-long-division', lesson: 5, titleEn: 'Long Division Lab', titleNp: 'भाग प्रयोगशाला', Component: L(() => import('./G4Ops'), 'LongDivision') },
  { code: 'SIM-MATH-G4-L6-01', key: 'class4-math-l6-fraction-pies', lesson: 6, titleEn: 'Fraction Pies', titleNp: 'भिन्नको पाई', Component: L(() => import('./G4Frac'), 'FractionPies') },
  { code: 'SIM-MATH-G4-L6-02', key: 'class4-math-l6-decimal-grid', lesson: 6, titleEn: 'Decimal Grid', titleNp: 'दशमलव ग्रिड', Component: L(() => import('./G4Frac'), 'DecimalGrid') },
  { code: 'SIM-MATH-G4-L7-01', key: 'class4-math-l7-clock-24', lesson: 7, titleEn: '24-Hour Clock', titleNp: '२४ घण्टे घडी', Component: L(() => import('./G4Time'), 'Clock24') },
  { code: 'SIM-MATH-G4-L8-01', key: 'class4-math-l8-note-counter', lesson: 8, titleEn: 'Note Counter', titleNp: 'नोट गणक', Component: L(() => import('./G4Money'), 'NoteCounter') },
  { code: 'SIM-MATH-G4-L9-01', key: 'class4-math-l9-distance', lesson: 9, titleEn: 'Distance: km, m, cm, mm', titleNp: 'दुरी: किमी, मिटर, सेमी, मिमी', Component: L(() => import('./UnitSims4'), 'DistanceLab') },
  { code: 'SIM-MATH-G4-L10-01', key: 'class4-math-l10-capacity', lesson: 10, titleEn: 'Capacity: litre and millilitre', titleNp: 'क्षमता: लिटर र मिलिलिटर', Component: L(() => import('./UnitSims4'), 'CapacityLab') },
  { code: 'SIM-MATH-G4-L11-01', key: 'class4-math-l11-weight', lesson: 11, titleEn: 'Weight: kilogram and gram', titleNp: 'तौल: किलोग्राम र ग्राम', Component: L(() => import('./UnitSims4'), 'WeightLab') },
  { code: 'SIM-MATH-G4-L12-01', key: 'class4-math-l12-garden-lab', lesson: 12, titleEn: 'Garden Lab (Perimeter & Area)', titleNp: 'बगैँचा प्रयोगशाला (परिमिति र क्षेत्रफल)', Component: L(() => import('./G4Area'), 'GardenLab') },
  { code: 'SIM-MATH-G4-L13-01', key: 'class4-math-l13-bill-shop', lesson: 13, titleEn: 'Bill Shop', titleNp: 'बिल पसल', Component: L(() => import('./G4Money'), 'BillShop') },
  { code: 'SIM-MATH-G4-L13-02', key: 'class4-math-l13-budget-towers', lesson: 13, titleEn: 'Budget Towers', titleNp: 'बजेट टावर', Component: L(() => import('./G4Money'), 'BudgetTowers') },
  { code: 'SIM-MATH-G4-L14-01', key: 'class4-math-l14-bar-graph', lesson: 14, titleEn: 'Bar Graph Lab', titleNp: 'स्तम्भ चित्र प्रयोगशाला', Component: L(() => import('./G4Graph'), 'BarGraphLab') },
  { code: 'SIM-MATH-G4-L15-01', key: 'class4-math-l15-balance-algebra', lesson: 15, titleEn: 'Balance Algebra', titleNp: 'तराजु बीजगणित', Component: L(() => import('./G4Algebra'), 'BalanceAlgebra') },
];

export const findClass4Sim = (componentKey?: string, code?: string) =>
  CLASS4_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code)) || findClass5Sim(componentKey, code);
