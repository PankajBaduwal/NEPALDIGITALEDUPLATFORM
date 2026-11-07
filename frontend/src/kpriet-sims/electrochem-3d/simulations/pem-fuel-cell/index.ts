/**
 * Mounting entrypoint for PEM Hydrogen Fuel Cell Simulation
 */

import { PEMFuelCellScene } from './PEMFuelCellScene';
import type { SimulationController, SimulationOptions } from '../../types';

export function mountPEMFuelCellSimulation(
  container: HTMLElement,
  options?: SimulationOptions
): SimulationController {
  return new PEMFuelCellScene(container, options);
}

export { PEMFuelCellScene };
