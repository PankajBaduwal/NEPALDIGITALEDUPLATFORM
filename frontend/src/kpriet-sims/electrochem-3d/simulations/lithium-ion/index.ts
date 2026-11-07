/**
 * Mounting entrypoint for Lithium-Ion Battery Simulation
 */

import { LithiumIonBatteryScene } from './LithiumIonBatteryScene';
import type { SimulationController, SimulationOptions } from '../../types';

export function mountLithiumIonSimulation(
  container: HTMLElement,
  options?: SimulationOptions
): SimulationController {
  return new LithiumIonBatteryScene(container, options);
}

export { LithiumIonBatteryScene };
