/**
 * PiyushDhara public-catalogue content that is not part of the academic dashboard registry:
 * Grades 1–8 sample simulations and Virtual Labs for every band.
 *
 * The catalogue build (backend/scripts/build-simulation-catalogue.ts) reads this list, so a new entry
 * appears in the public catalogue automatically. Kept separate from SIMULATION_REGISTRY on purpose,
 * so dashboard subject pages are unchanged.
 */
import { MATH_PRIMARY } from './math-primary';
import { MATH_MIDDLE, SCIENCE_JUNIOR } from './math-middle';
import { VIRTUAL_LABS } from './virtual-labs';
import { spatialFurryCat } from './foundational-chapter1';
import { spatialRampAdventure } from './foundational-ramp';
import { countingGardenZero } from './foundational-garden-zero';
import { measurementBalance } from './foundational-measurement';
import { additionSubtractionStories } from './foundational-operations';
import { patternTrainSimulation } from './foundational-patterns';
import { chintuDayTimeSimulation } from './foundational-time';
import { villageToyShopSimulation } from './foundational-currency';
import { CLASS2_MATH_SIMULATIONS } from './class2-math';
import { CLASS2_SCIENCE_SIMULATIONS } from './class2-science';
import { CLASS_9_12_PHYSICS_SIMULATIONS } from './physics-simulations';
import { CLASS_9_12_MATH_SIMULATIONS } from './math-simulations-class912';
import type { SchoolSimulationDefinition } from './kit';

export type { SchoolSimulationDefinition } from './kit';
export * from './foundational-kit';
export * from './foundational-chapter1';
export * from './foundational-ramp';
export * from './foundational-garden-zero';
export * from './foundational-measurement';
export * from './foundational-operations';
export * from './foundational-patterns';
export * from './foundational-time';
export * from './foundational-currency';
export * from './class2-math';
export * from './class2-science';
export * from './physics-simulations';
export * from './math-simulations-class912';

export const SCHOOL_AND_LAB_SIMULATIONS: SchoolSimulationDefinition[] = [
  spatialFurryCat,
  spatialRampAdventure,
  countingGardenZero,
  measurementBalance,
  additionSubtractionStories,
  patternTrainSimulation,
  chintuDayTimeSimulation,
  villageToyShopSimulation,
  ...CLASS2_MATH_SIMULATIONS,
  ...CLASS2_SCIENCE_SIMULATIONS,
  ...CLASS_9_12_PHYSICS_SIMULATIONS,
  ...CLASS_9_12_MATH_SIMULATIONS,
  ...MATH_PRIMARY,
  ...MATH_MIDDLE,
  ...SCIENCE_JUNIOR,
  ...VIRTUAL_LABS,
];

export const SIMULATION_ALIASES: Record<string, string> = {
  'g18-class1-counting': 'g18-class1-counting-garden-zero',
  'g18-class1-addition-objects': 'g18-class1-addition-subtraction-stories',
  'g18-class2-place-value': 'g18-class2-tens-and-ones',
};

export function getSchoolSimulation(id: string): SchoolSimulationDefinition | undefined {
  const targetId = SIMULATION_ALIASES[id] || id;
  const target = targetId.toLowerCase();
  return SCHOOL_AND_LAB_SIMULATIONS.find((s) => s.id === targetId || s.id.toLowerCase() === target);
}
