/**
 * Numerical Methods and Partial Differential Equations Simulation Scenes
 * Factory and exports
 */

import type { NumericalSimId } from '../core/types';
import { BaseNumericalSimulation } from './BaseNumericalSimulation';
import { RootFindingScene } from './RootFindingScene';
import { LinearSystemsScene } from './LinearSystemsScene';
import { InterpolationScene } from './InterpolationScene';
import { CalculusScene } from './CalculusScene';
import { ODEScene } from './ODEScene';
import { PDEScene } from './PDEScene';
import { ComparisonLabScene } from './ComparisonLabScene';

export {
  BaseNumericalSimulation,
  RootFindingScene,
  LinearSystemsScene,
  InterpolationScene,
  CalculusScene,
  ODEScene,
  PDEScene,
  ComparisonLabScene,
};

function createNumericalSceneRaw(
  simId: NumericalSimId,
  canvas: HTMLCanvasElement
): BaseNumericalSimulation {
  switch (simId) {
    case 'u25ma402-sim-01':
      return new RootFindingScene(canvas);
    case 'u25ma402-sim-02':
      return new LinearSystemsScene(canvas);
    case 'u25ma402-sim-03':
      return new InterpolationScene(canvas);
    case 'u25ma402-sim-04':
      return new CalculusScene(canvas);
    case 'u25ma402-sim-05':
      return new ODEScene(canvas);
    case 'u25ma402-sim-06':
      return new PDEScene(canvas);
    case 'u25ma402-sim-07':
    default:
      return new ComparisonLabScene(canvas);
  }
}

/** Builds the scene and starts it once fully constructed (see the PORT NOTE in the base class). */
export function createNumericalScene(simId: NumericalSimId, canvas: HTMLCanvasElement): BaseNumericalSimulation {
  const scene = createNumericalSceneRaw(simId, canvas);
  scene.boot();
  return scene;
}
