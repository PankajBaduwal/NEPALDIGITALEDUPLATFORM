/**
 * Mounting entrypoint for Lead-Acid Battery Simulation
 */

import { LeadAcidBatteryScene } from './LeadAcidBatteryScene';
import type { SimulationController, SimulationOptions } from '../../types';

export function mountLeadAcidSimulation(
  container: HTMLElement,
  options?: SimulationOptions
): SimulationController {
  return new LeadAcidBatteryScene(container, options);
}

export { LeadAcidBatteryScene };
