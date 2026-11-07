/**
 * Factory & Exports for Thermal Engineering 3D Three.js Scenes
 */

import { BaseThermalScene } from './BaseThermalScene';
import { HeatTransferScene } from './HeatTransferScene';
import { CompositeWallScene } from './CompositeWallScene';
import { HeatExchangerScene } from './HeatExchangerScene';
import { BoilerScene } from './BoilerScene';
import { RefrigerationScene } from './RefrigerationScene';
import { ThermalWorkshopScene } from './ThermalWorkshopScene';
import type { ThermalSimId } from '../core/types';

export {
  BaseThermalScene,
  HeatTransferScene,
  CompositeWallScene,
  HeatExchangerScene,
  BoilerScene,
  RefrigerationScene,
  ThermalWorkshopScene,
};

export function createThermalScene(simId: ThermalSimId, container: HTMLElement): BaseThermalScene {
  switch (simId) {
    case 'heat-transfer':
      return new HeatTransferScene(container);
    case 'composite-wall':
      return new CompositeWallScene(container);
    case 'heat-exchanger':
      return new HeatExchangerScene(container);
    case 'steam-boiler':
      return new BoilerScene(container);
    case 'refrigeration-cycle':
      return new RefrigerationScene(container);
    case 'energy-calculator':
    case 'thermal-lab':
    case 'virtual-bay':
    default:
      return new ThermalWorkshopScene(container);
  }
}
