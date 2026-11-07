/**
 * Factory and Scene Exporter for Engineering Materials and Metallurgy 3D Simulations
 */

import { BaseMetallurgySimulation } from './BaseMetallurgySimulation';
import { CrystalStructuresScene } from './01-crystal-structures/CrystalStructuresScene';
import { StressStrainScene } from './02-stress-strain/StressStrainScene';
import { IronCarbonDiagramScene } from './03-phase-diagram/IronCarbonDiagramScene';
import { HeatTreatmentScene } from './04-heat-treatment/HeatTreatmentScene';
import { MicrostructureViewerScene } from './05-microstructure/MicrostructureViewerScene';
import { MaterialTestingLabScene } from './06-material-testing/MaterialTestingLabScene';
import type { MetallurgySimId } from '../core/types';

function createMetallurgySceneRaw(simId: MetallurgySimId, container: HTMLElement): BaseMetallurgySimulation {
  switch (simId) {
    case 'u25me302-crystal-structures':
      return new CrystalStructuresScene(container);

    case 'u25me302-stress-strain':
      return new StressStrainScene(container);

    case 'u25me302-phase-diagram':
      return new IronCarbonDiagramScene(container);

    case 'u25me302-heat-treatment':
      return new HeatTreatmentScene(container);

    case 'u25me302-microstructure':
      return new MicrostructureViewerScene(container);

    case 'u25me302-material-testing':
    case 'u25me302-virtual-lab':
    default:
      return new MaterialTestingLabScene(container);
  }
}

export {
  BaseMetallurgySimulation,
  CrystalStructuresScene,
  StressStrainScene,
  IronCarbonDiagramScene,
  HeatTreatmentScene,
  MicrostructureViewerScene,
  MaterialTestingLabScene,
};

/** Builds the scene and starts it once fully constructed (see the PORT NOTE in the base class). */
export function createMetallurgyScene(simId: MetallurgySimId, container: HTMLElement): BaseMetallurgySimulation {
  const scene = createMetallurgySceneRaw(simId, container);
  scene.boot();
  return scene;
}
