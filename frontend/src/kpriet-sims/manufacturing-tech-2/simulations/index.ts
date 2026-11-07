/**
 * Factory & Exports for Manufacturing Technology – II 3D Simulation Scenes
 */

export { BaseManufacturing2Scene } from './BaseManufacturing2Scene';
export { CNCMachiningScene } from './CNCMachiningScene';
export { NonTraditionalScene } from './NonTraditionalScene';
export { WeldingScene } from './WeldingScene';
export { CastingScene } from './CastingScene';
export { FormingScene } from './FormingScene';
export { WorkshopScene } from './WorkshopScene';

import { CNCMachiningScene } from './CNCMachiningScene';
import { NonTraditionalScene } from './NonTraditionalScene';
import { WeldingScene } from './WeldingScene';
import { CastingScene } from './CastingScene';
import { FormingScene } from './FormingScene';
import { WorkshopScene } from './WorkshopScene';
import type { Manufacturing2SimId } from '../core/types';

export function createManufacturing2Scene(simId: Manufacturing2SimId, container: HTMLElement) {
  switch (simId) {
    case 'cnc-machining':
      return new CNCMachiningScene(container);
    case 'non-traditional':
      return new NonTraditionalScene(container);
    case 'welding-processes':
      return new WeldingScene(container);
    case 'casting-processes':
      return new CastingScene(container);
    case 'metal-forming':
      return new FormingScene(container);
    case 'virtual-workshop':
    case 'manufacturing-calculations':
    case 'process-selection':
    default:
      return new WorkshopScene(container);
  }
}
