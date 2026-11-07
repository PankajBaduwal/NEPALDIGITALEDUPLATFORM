/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Master Module Entrypoint & Factory Exports
 * Anna University Engineering Mechanics Syllabus (Units I - V)
 */

import type { SimulationController, SimulationOptions } from './core/types';

// Export types
export * from './core/types';

// Export core classes
export { BaseMechanicsSimulation } from './core/BaseMechanicsSimulation';
export { MechanicalBuilder } from './core/MechanicalBuilder';
export { VectorRenderer } from './core/VectorRenderer';
export { MechanicsAnnotationSystem } from './core/MechanicsAnnotationSystem';

// ==========================================
// UNIT I: STATICS OF PARTICLES (SIMS 01 - 03)
// ==========================================

import { ForceSystemsScene } from './simulations/01-force-systems/ForceSystemsScene';
export { ForceSystemsScene };
export function mountForceSystemsSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new ForceSystemsScene(container, options);
}

import { CableTensionsScene } from './simulations/02-cable-tensions/CableTensionsScene';
export { CableTensionsScene };
export function mountCableTensionsSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new CableTensionsScene(container, options);
}

import { FreeBodyDiagramScene } from './simulations/03-fbd-lab/FreeBodyDiagramScene';
export { FreeBodyDiagramScene };
export function mountFreeBodyDiagramSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new FreeBodyDiagramScene(container, options);
}

// ===============================================
// UNIT II: EQUILIBRIUM OF RIGID BODIES (SIMS 04 - 06)
// ===============================================

import { MomentsCouplesScene } from './simulations/04-moments-couples/MomentsCouplesScene';
export { MomentsCouplesScene };
export function mountMomentsCouplesSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new MomentsCouplesScene(container, options);
}

import { SupportReactionsScene } from './simulations/05-support-reactions/SupportReactionsScene';
export { SupportReactionsScene };
export function mountSupportReactionsSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new SupportReactionsScene(container, options);
}

import { TrussAnalysisScene } from './simulations/06-truss-analysis/TrussAnalysisScene';
export { TrussAnalysisScene };
export function mountTrussAnalysisSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new TrussAnalysisScene(container, options);
}

// ========================================================
// UNIT III: PROPERTIES OF SURFACES AND SOLIDS (SIMS 07 - 09)
// ========================================================

import { CompositeCentroidsScene } from './simulations/07-composite-centroids/CompositeCentroidsScene';
export { CompositeCentroidsScene };
export function mountCompositeCentroidsSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new CompositeCentroidsScene(container, options);
}

import { AreaMomentsInertiaScene } from './simulations/08-area-moments-inertia/AreaMomentsInertiaScene';
export { AreaMomentsInertiaScene };
export function mountAreaMomentsInertiaSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new AreaMomentsInertiaScene(container, options);
}

import { CenterOfGravityScene } from './simulations/09-center-of-gravity/CenterOfGravityScene';
export { CenterOfGravityScene };
export function mountCenterOfGravitySimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new CenterOfGravityScene(container, options);
}

// ==========================================
// UNIT IV: FRICTION (SIMS 10 - 13)
// ==========================================

import { InclinedPlaneFrictionScene } from './simulations/10-inclined-plane/InclinedPlaneFrictionScene';
export { InclinedPlaneFrictionScene };
export function mountInclinedPlaneSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new InclinedPlaneFrictionScene(container, options);
}

import { LadderFrictionScene } from './simulations/11-ladder-friction/LadderFrictionScene';
export { LadderFrictionScene };
export function mountLadderFrictionSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new LadderFrictionScene(container, options);
}

import { WedgeFrictionScene } from './simulations/12-wedge-friction/WedgeFrictionScene';
export { WedgeFrictionScene };
export function mountWedgeFrictionSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new WedgeFrictionScene(container, options);
}

import { RollingResistanceScene } from './simulations/13-rolling-resistance/RollingResistanceScene';
export { RollingResistanceScene };
export function mountRollingResistanceSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new RollingResistanceScene(container, options);
}

// ==================================================================
// UNIT V: DYNAMICS OF PARTICLES AND RIGID BODIES (SIMS 14 - 20)
// ==================================================================

import { RectilinearMotionScene } from './simulations/14-rectilinear-motion/RectilinearMotionScene';
export { RectilinearMotionScene };
export function mountRectilinearMotionSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new RectilinearMotionScene(container, options);
}

import { ProjectileMotionScene } from './simulations/15-projectile-motion/ProjectileMotionScene';
export { ProjectileMotionScene };
export function mountProjectileMotionSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new ProjectileMotionScene(container, options);
}

import { NewtonsSecondLawScene } from './simulations/16-newtons-second-law/NewtonsSecondLawScene';
export { NewtonsSecondLawScene };
export function mountNewtonsSecondLawSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new NewtonsSecondLawScene(container, options);
}

import { WorkEnergyScene } from './simulations/17-work-energy/WorkEnergyScene';
export { WorkEnergyScene };
export function mountWorkEnergySimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new WorkEnergyScene(container, options);
}

import { ImpulseMomentumScene } from './simulations/18-impulse-momentum/ImpulseMomentumScene';
export { ImpulseMomentumScene };
export function mountImpulseMomentumSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new ImpulseMomentumScene(container, options);
}

import { RotationalDynamicsScene } from './simulations/19-rotational-dynamics/RotationalDynamicsScene';
export { RotationalDynamicsScene };
export function mountRotationalDynamicsSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new RotationalDynamicsScene(container, options);
}

import { ImpactConservationScene } from './simulations/20-impact-conservation/ImpactConservationScene';
export { ImpactConservationScene };
export function mountImpactConservationSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new ImpactConservationScene(container, options);
}

// ==========================================
// MASTER FACTORY FUNCTION
// ==========================================

import type { MechanicsSimId } from './core/types';

export function createMechanicsSimulation(
  id: MechanicsSimId,
  container: HTMLElement,
  options?: SimulationOptions
): SimulationController {
  switch (id) {
    case '01-force-systems':
      return mountForceSystemsSimulation(container, options);
    case '02-cable-tensions':
      return mountCableTensionsSimulation(container, options);
    case '03-fbd-lab':
      return mountFreeBodyDiagramSimulation(container, options);
    case '04-moments-couples':
      return mountMomentsCouplesSimulation(container, options);
    case '05-support-reactions':
      return mountSupportReactionsSimulation(container, options);
    case '06-truss-analysis':
      return mountTrussAnalysisSimulation(container, options);
    case '07-composite-centroids':
      return mountCompositeCentroidsSimulation(container, options);
    case '08-area-moments-inertia':
      return mountAreaMomentsInertiaSimulation(container, options);
    case '09-center-of-gravity':
      return mountCenterOfGravitySimulation(container, options);
    case '10-inclined-plane':
      return mountInclinedPlaneSimulation(container, options);
    case '11-ladder-friction':
      return mountLadderFrictionSimulation(container, options);
    case '12-wedge-friction':
      return mountWedgeFrictionSimulation(container, options);
    case '13-rolling-resistance':
      return mountRollingResistanceSimulation(container, options);
    case '14-rectilinear-motion':
      return mountRectilinearMotionSimulation(container, options);
    case '15-projectile-motion':
      return mountProjectileMotionSimulation(container, options);
    case '16-newtons-second-law':
      return mountNewtonsSecondLawSimulation(container, options);
    case '17-work-energy':
      return mountWorkEnergySimulation(container, options);
    case '18-impulse-momentum':
      return mountImpulseMomentumSimulation(container, options);
    case '19-rotational-dynamics':
      return mountRotationalDynamicsSimulation(container, options);
    case '20-impact-conservation':
      return mountImpactConservationSimulation(container, options);
    default:
      throw new Error(`Unknown mechanics simulation id: ${id}`);
  }
}

// React Workspace Component
export { MechanicsVirtualLabWorkspace, MECHANICS_SIMULATIONS } from './react/MechanicsVirtualLabWorkspace';
export type { MechanicsSimMeta } from './react/MechanicsVirtualLabWorkspace';
