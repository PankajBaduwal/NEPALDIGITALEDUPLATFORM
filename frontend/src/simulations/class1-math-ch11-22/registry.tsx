import React, { lazy } from 'react';
import { findClass2Sim } from '../class2-math/registry';

/**
 * Class 1 Mathematics · chapters 11–22. Each entry is loaded only when a child opens it.
 * Looked up by `componentKey` (or by `code`) from the Simulation Player.
 */
type Comp = React.ComponentType<{ onBackToLibrary: () => void; userRole?: string }>;
const L = (loader: () => Promise<any>, name: string): Comp => lazy(() => loader().then((m) => ({ default: m[name] })));

export const CLASS1_CH11_22: { code: string; key: string; Component: Comp }[] = [
  { code: 'SIM-MATH-G1-CH11-01', key: 'class1-math-ch11-birds', Component: L(() => import('./FlyAwayBirds'), 'FlyAwayBirds') },
  { code: 'SIM-MATH-G1-CH12-01', key: 'class1-math-ch12-pairs', Component: L(() => import('./PairingParty'), 'PairingParty') },
  { code: 'SIM-MATH-G1-CH13-01', key: 'class1-math-ch13-names', Component: L(() => import('./NumberNameBlocks'), 'NumberNameBlocks') },
  { code: 'SIM-MATH-G1-CH14-01', key: 'class1-math-ch14-race', Component: L(() => import('./RaceDay'), 'RaceDay') },
  { code: 'SIM-MATH-G1-CH15-01', key: 'class1-math-ch15-hundred', Component: L(() => import('./HundredVillage'), 'HundredVillage') },
  { code: 'SIM-MATH-G1-CH16-01', key: 'class1-math-ch16-add-bundle', Component: L(() => import('./AddAndBundle'), 'AddAndBundle') },
  { code: 'SIM-MATH-G1-CH17-01', key: 'class1-math-ch17-take-away', Component: L(() => import('./BreakAndTakeAway'), 'BreakAndTakeAway') },
  { code: 'SIM-MATH-G1-CH18-01', key: 'class1-math-ch18-cards', Component: L(() => import('./NepaliNumberCards'), 'NepaliNumberCards') },
  { code: 'SIM-MATH-G1-CH19-01', key: 'class1-math-ch19-week', Component: L(() => import('./WeekBalloons'), 'WeekBalloons') },
  { code: 'SIM-MATH-G1-CH19-02', key: 'class1-math-ch19-clock', Component: L(() => import('./ClockTower'), 'ClockTower') },
  { code: 'SIM-MATH-G1-CH20-01', key: 'class1-math-ch20-coins-notes', Component: L(() => import('./CoinsAndNotes'), 'CoinsAndNotes') },
  { code: 'SIM-MATH-G1-CH20-02', key: 'class1-math-ch20-toy-shop', Component: L(() => import('./ToyShop'), 'ToyShop') },
  { code: 'SIM-MATH-G1-CH21-01', key: 'class1-math-ch21-measure', Component: L(() => import('./MeasureWithCubes'), 'MeasureWithCubes') },
  { code: 'SIM-MATH-G1-CH22-01', key: 'class1-math-ch22-pictograph', Component: L(() => import('./FruitPictograph'), 'FruitPictograph') },
];

export const findClass1Sim = (componentKey?: string, code?: string) =>
  CLASS1_CH11_22.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code)) || findClass2Sim(componentKey, code);
