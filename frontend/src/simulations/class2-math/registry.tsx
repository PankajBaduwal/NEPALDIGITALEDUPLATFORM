import React, { lazy } from 'react';

/** Class 2 Mathematics · lessons 1–17. Loaded only when a child opens one. Looked up by `componentKey` or `code`. */
type Comp = React.ComponentType<{ onBackToLibrary: () => void; userRole?: string }>;
const L = (loader: () => Promise<any>, name: string): Comp => lazy(() => loader().then((m) => ({ default: m[name] })));

export const CLASS2_MATH: { code: string; key: string; Component: Comp }[] = [
  { code: 'SIM-MATH-G2-L1-01', key: 'class2-math-l1-pour', Component: L(() => import('./PourAndCount'), 'PourAndCount') },
  { code: 'SIM-MATH-G2-L2-01', key: 'class2-math-l2-clock', Component: L(() => import('./ClockWorkshop'), 'ClockWorkshop') },
  { code: 'SIM-MATH-G2-L2-02', key: 'class2-math-l2-calendar', Component: L(() => import('./CalendarTown'), 'CalendarTown') },
  { code: 'SIM-MATH-G2-L3-01', key: 'class2-math-l3-thousand-town', Component: L(() => import('./ThousandTown'), 'ThousandTown') },
  { code: 'SIM-MATH-G2-L3-02', key: 'class2-math-l3-hop-1000', Component: L(() => import('./SkipHop'), 'HopTo1000') },
  { code: 'SIM-MATH-G2-L4-01', key: 'class2-math-l4-seesaw', Component: L(() => import('./NumberSeesaw'), 'NumberSeesaw') },
  { code: 'SIM-MATH-G2-L4-02', key: 'class2-math-l4-order-balloons', Component: L(() => import('./OrderBalloons'), 'OrderBalloons') },
  { code: 'SIM-MATH-G2-L5-01', key: 'class2-math-l5-odd-even-machine', Component: L(() => import('./OddEvenMachine'), 'OddEvenMachine') },
  { code: 'SIM-MATH-G2-L6-01', key: 'class2-math-l6-weigh-it', Component: L(() => import('./WeighIt'), 'WeighIt') },
  { code: 'SIM-MATH-G2-L7-01', key: 'class2-math-l7-add-town', Component: L(() => import('./AddTown'), 'AddTown') },
  { code: 'SIM-MATH-G2-L8-01', key: 'class2-math-l8-take-away-town', Component: L(() => import('./TakeAwayTown'), 'TakeAwayTown') },
  { code: 'SIM-MATH-G2-L9-01', key: 'class2-math-l9-ruler', Component: L(() => import('./RulerWorkshop'), 'RulerWorkshop') },
  { code: 'SIM-MATH-G2-L10-01', key: 'class2-math-l10-tiles', Component: L(() => import('./TileTheFloor'), 'TileTheFloor') },
  { code: 'SIM-MATH-G2-L11-01', key: 'class2-math-l11-equal-groups', Component: L(() => import('./EqualGroups'), 'EqualGroups') },
  { code: 'SIM-MATH-G2-L11-02', key: 'class2-math-l11-tables-frog', Component: L(() => import('./SkipHop'), 'TablesHop') },
  { code: 'SIM-MATH-G2-L12-01', key: 'class2-math-l12-fraction-pizza', Component: L(() => import('./FractionPizza'), 'FractionPizza') },
  { code: 'SIM-MATH-G2-L13-01', key: 'class2-math-l13-solids', Component: L(() => import('./SolidShapes'), 'SolidShapes') },
  { code: 'SIM-MATH-G2-L13-02', key: 'class2-math-l13-flat-shapes', Component: L(() => import('./FlatShapes'), 'FlatShapes') },
  { code: 'SIM-MATH-G2-L14-01', key: 'class2-math-l14-tally', Component: L(() => import('./TallyChart'), 'TallyChart') },
  { code: 'SIM-MATH-G2-L15-01', key: 'class2-math-l15-rupee-market', Component: L(() => import('./RupeeMarket'), 'RupeeMarket') },
  { code: 'SIM-MATH-G2-L16-01', key: 'class2-math-l16-arrays', Component: L(() => import('./ArrayBuilder'), 'ArrayBuilder') },
  { code: 'SIM-MATH-G2-L17-01', key: 'class2-math-l17-sharing', Component: L(() => import('./SharingParty'), 'SharingParty') },
];

export const findClass2Sim = (componentKey?: string, code?: string) =>
  CLASS2_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));
