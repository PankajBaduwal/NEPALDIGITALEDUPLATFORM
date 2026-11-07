/**
 * Factory & exports for Manufacturing Technology - I 3D Simulation Scenes
 */

import { LatheTurningScene } from './01-lathe/LatheTurningScene';
import { MachineToolsComparisonScene } from './02-machine-tools/MachineToolsComparisonScene';
import { CuttingToolGeometryScene } from './03-tool-geometry/CuttingToolGeometryScene';
import { ChipFormationMechanicsScene } from './04-cutting-mechanics/ChipFormationMechanicsScene';
import { VirtualWorkshopScene } from './05-virtual-workshop/VirtualWorkshopScene';
import type { ManufacturingSimId } from '../core/types';

export {
  LatheTurningScene,
  MachineToolsComparisonScene,
  CuttingToolGeometryScene,
  ChipFormationMechanicsScene,
  VirtualWorkshopScene,
};

export function createManufacturingTechScene(
  simId: ManufacturingSimId,
  container: HTMLElement
) {
  switch (simId) {
    case 'u25me304-lathe-operations':
      return new LatheTurningScene(container);

    case 'u25me304-machine-tools':
      return new MachineToolsComparisonScene(container);

    case 'u25me304-tool-geometry':
      return new CuttingToolGeometryScene(container);

    case 'u25me304-cutting-mechanics':
      return new ChipFormationMechanicsScene(container);

    case 'u25me304-virtual-workshop':
    case 'u25me304-virtual-laboratory':
    case 'u25me304-machining-calculations':
    default:
      return new LatheTurningScene(container);
  }
}
