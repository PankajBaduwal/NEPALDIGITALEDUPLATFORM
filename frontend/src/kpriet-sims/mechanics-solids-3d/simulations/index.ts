/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Mechanics of Solids (U25ME303 / Theory with Laboratory - TwL)
 * Simulation Scene Factory & Exports
 */

import type { SolidMechanicsSimId } from '../core/types';
import { BaseSolidMechanicsSimulation } from '../core/BaseSolidMechanicsSimulation';
import { UtmMaterialTestScene } from './01-utm-testing/UtmMaterialTestScene';
import { AxialCompoundBarScene } from './02-axial-compound/AxialCompoundBarScene';
import { SfdBmdBeamScene } from './03-sfd-bmd/SfdBmdBeamScene';
import { BeamBendingDeflectionScene } from './04-beam-bending/BeamBendingDeflectionScene';
import { TorsionShaftScene } from './05-torsion-shafts/TorsionShaftScene';
import { ColumnsThinCylinderScene } from './06-columns-cylinders/ColumnsThinCylinderScene';

export function createSolidMechanicsScene(simId: SolidMechanicsSimId): BaseSolidMechanicsSimulation {
  switch (simId) {
    case 'u25me303-utm-testing':
      return new UtmMaterialTestScene();
    case 'u25me303-axial-compound':
      return new AxialCompoundBarScene();
    case 'u25me303-sfd-bmd':
      return new SfdBmdBeamScene();
    case 'u25me303-beam-bending':
      return new BeamBendingDeflectionScene();
    case 'u25me303-torsion-shafts':
      return new TorsionShaftScene();
    case 'u25me303-columns-cylinders':
      return new ColumnsThinCylinderScene();
    default:
      return new UtmMaterialTestScene();
  }
}

export {
  UtmMaterialTestScene,
  AxialCompoundBarScene,
  SfdBmdBeamScene,
  BeamBendingDeflectionScene,
  TorsionShaftScene,
  ColumnsThinCylinderScene,
};
