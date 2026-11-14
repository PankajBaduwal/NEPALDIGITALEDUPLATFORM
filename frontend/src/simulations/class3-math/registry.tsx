import React, { lazy } from 'react';

/** Class 3 Mathematics · lessons 1–22 of "My Mathematics, Grade 3". Loaded only when a child opens one. Looked up by `componentKey` or `code`. */
type Comp = React.ComponentType<{ onBackToLibrary: () => void; userRole?: string }>;
const L = (loader: () => Promise<any>, name: string): Comp => lazy(() => loader().then((m) => ({ default: m[name] })));

export const CLASS3_MATH: { code: string; key: string; Component: Comp }[] = [
  { code: 'SIM-MATH-G3-L1-01', key: 'class3-math-l1-minute-clock', Component: L(() => import('./ClockMinutes'), 'ClockMinutes') },
  { code: 'SIM-MATH-G3-L2-01', key: 'class3-math-l2-five-digit', Component: L(() => import('./FiveDigit'), 'FiveDigit') },
  { code: 'SIM-MATH-G3-L3-01', key: 'class3-math-l3-digit-duel', Component: L(() => import('./DigitDuel'), 'DigitDuel') },
  { code: 'SIM-MATH-G3-L4-01', key: 'class3-math-l4-pattern-train', Component: L(() => import('./PatternTrain'), 'PatternTrain') },
  { code: 'SIM-MATH-G3-L5-01', key: 'class3-math-l5-order-rockets', Component: L(() => import('./OrderRockets'), 'OrderRockets') },
  { code: 'SIM-MATH-G3-L6-01', key: 'class3-math-l6-numeral-street', Component: L(() => import('./NumeralSigns'), 'NumeralSigns') },
  { code: 'SIM-MATH-G3-L7-01', key: 'class3-math-l7-chocolate-fractions', Component: L(() => import('./FractionBars'), 'FractionBars') },
  { code: 'SIM-MATH-G3-L8-01', key: 'class3-math-l8-metre-cm', Component: L(() => import('./UnitSims'), 'MetreStick') },
  { code: 'SIM-MATH-G3-L9-01', key: 'class3-math-l9-line-lab', Component: L(() => import('./LineLab'), 'LineLab') },
  { code: 'SIM-MATH-G3-L10-01', key: 'class3-math-l10-angle-lab', Component: L(() => import('./AngleLab'), 'AngleLab') },
  { code: 'SIM-MATH-G3-L11-01', key: 'class3-math-l11-face-explorer', Component: L(() => import('./FaceExplorer'), 'FaceExplorer') },
  { code: 'SIM-MATH-G3-L12-01', key: 'class3-math-l12-add-columns', Component: L(() => import('./ColumnArith'), 'AddColumns') },
  { code: 'SIM-MATH-G3-L13-01', key: 'class3-math-l13-subtract-columns', Component: L(() => import('./ColumnArith'), 'SubColumns') },
  { code: 'SIM-MATH-G3-L14-01', key: 'class3-math-l14-trays', Component: L(() => import('./MultBlocks'), 'MultTrays') },
  { code: 'SIM-MATH-G3-L14-02', key: 'class3-math-l14-times-wall', Component: L(() => import('./MultBlocks'), 'TimesWall') },
  { code: 'SIM-MATH-G3-L15-01', key: 'class3-math-l15-sharing-plates', Component: L(() => import('./DivideShare'), 'DivideShare') },
  { code: 'SIM-MATH-G3-L16-01', key: 'class3-math-l16-time-units', Component: L(() => import('./UnitSims'), 'TimeUnits') },
  { code: 'SIM-MATH-G3-L17-01', key: 'class3-math-l17-bill-change', Component: L(() => import('./MoneyShop'), 'MoneyShop') },
  { code: 'SIM-MATH-G3-L18-01', key: 'class3-math-l18-litre-ml', Component: L(() => import('./UnitSims'), 'LitreJug') },
  { code: 'SIM-MATH-G3-L19-01', key: 'class3-math-l19-road-trip', Component: L(() => import('./UnitSims'), 'RoadTrip') },
  { code: 'SIM-MATH-G3-L20-01', key: 'class3-math-l20-kg-g', Component: L(() => import('./UnitSims'), 'WeighKgG') },
  { code: 'SIM-MATH-G3-L21-01', key: 'class3-math-l21-picture-graph', Component: L(() => import('./PictoScale'), 'PictoScale') },
  { code: 'SIM-MATH-G3-L22-01', key: 'class3-math-l22-area-tiles', Component: L(() => import('./AreaRect'), 'AreaRect') },
];

export const findClass3Sim = (componentKey?: string, code?: string) =>
  CLASS3_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));
