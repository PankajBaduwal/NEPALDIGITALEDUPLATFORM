/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * Master Entrypoint & Factory Exports for all 25 Authoritative 3D Simulations
 */

import type { PhysicsSimulationController, SimulationOptions } from './core/types';

export * from './core/types';
export { BaseSimulation } from './core/BaseSimulation';
export { AnnotationSystem } from './core/AnnotationSystem';
export { ParticleSystem } from './core/ParticleSystem';

// Unit I: Mechanical Properties of Solids
import {
  MaterialTestingScene,
  PoissonRatioScene,
  MaterialComparisonScene,
  CantileverBeamScene,
  GirdersMEMSScene,
} from './simulations/unit1-mechanical';

export {
  MaterialTestingScene,
  PoissonRatioScene,
  MaterialComparisonScene,
  CantileverBeamScene,
  GirdersMEMSScene,
};

export function mountMaterialTestingSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new MaterialTestingScene(c, o);
}
export function mountPoissonRatioSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new PoissonRatioScene(c, o);
}
export function mountMaterialComparisonSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new MaterialComparisonScene(c, o);
}
export function mountCantileverBeamSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new CantileverBeamScene(c, o);
}
export function mountGirdersMEMSSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new GirdersMEMSScene(c, o);
}

// Unit II: Fundamentals of Heat Transfer and Fluids
import {
  HeatTransferScene,
  ThermalExpansionLeesDiscScene,
  SurfaceTensionScene,
  PoiseuilleViscosityScene,
  ThermalSystemsScene,
} from './simulations/unit2-thermal-fluids';

export {
  HeatTransferScene,
  ThermalExpansionLeesDiscScene,
  SurfaceTensionScene,
  PoiseuilleViscosityScene,
  ThermalSystemsScene,
};

export function mountHeatTransferSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new HeatTransferScene(c, o);
}
export function mountThermalExpansionLeesDiscSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new ThermalExpansionLeesDiscScene(c, o);
}
export function mountSurfaceTensionSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new SurfaceTensionScene(c, o);
}
export function mountPoiseuilleViscositySimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new PoiseuilleViscosityScene(c, o);
}
export function mountThermalSystemsSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new ThermalSystemsScene(c, o);
}

// Unit III: Ultrasonics and Its Applications
import {
  UltrasonicWavesScene,
  PiezoMagnetoScene,
  UltrasonicVelocityScene,
  SonarRangingScene,
  NDTScanningScene,
} from './simulations/unit3-ultrasonics';

export {
  UltrasonicWavesScene,
  PiezoMagnetoScene,
  UltrasonicVelocityScene,
  SonarRangingScene,
  NDTScanningScene,
};

export function mountUltrasonicWavesSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new UltrasonicWavesScene(c, o);
}
export function mountPiezoMagnetoSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new PiezoMagnetoScene(c, o);
}
export function mountUltrasonicVelocitySimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new UltrasonicVelocityScene(c, o);
}
export function mountSonarRangingSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new SonarRangingScene(c, o);
}
export function mountNDTScanningSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new NDTScanningScene(c, o);
}

// Unit IV: Semiconductor Physics
import {
  BandStructureScene,
  CarrierConcentrationScene,
  CarrierTransportPNScene,
  ZenerDiodeScene,
  SemiconductorDevicesScene,
} from './simulations/unit4-semiconductors';

export {
  BandStructureScene,
  CarrierConcentrationScene,
  CarrierTransportPNScene,
  ZenerDiodeScene,
  SemiconductorDevicesScene,
};

export function mountBandStructureSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new BandStructureScene(c, o);
}
export function mountCarrierConcentrationSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new CarrierConcentrationScene(c, o);
}
export function mountCarrierTransportPNSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new CarrierTransportPNScene(c, o);
}
export function mountZenerDiodeSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new ZenerDiodeScene(c, o);
}
export function mountSemiconductorDevicesSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new SemiconductorDevicesScene(c, o);
}

// Unit V: Photonics
import {
  RadiationMatterScene,
  LaserPrinciplesScene,
  CO2DiodeLaserScene,
  TotalInternalReflectionScene,
  FibreEndoscopySensorsScene,
} from './simulations/unit5-photonics';

export {
  RadiationMatterScene,
  LaserPrinciplesScene,
  CO2DiodeLaserScene,
  TotalInternalReflectionScene,
  FibreEndoscopySensorsScene,
};

export function mountRadiationMatterSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new RadiationMatterScene(c, o);
}
export function mountLaserPrinciplesSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new LaserPrinciplesScene(c, o);
}
export function mountCO2DiodeLaserSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new CO2DiodeLaserScene(c, o);
}
export function mountTotalInternalReflectionSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new TotalInternalReflectionScene(c, o);
}
export function mountFibreEndoscopySensorsSimulation(c: HTMLElement, o?: SimulationOptions): PhysicsSimulationController {
  return new FibreEndoscopySensorsScene(c, o);
}

/**
 * Universal Factory for Engineering Physics 3D Simulation Controllers
 */
export function createPhysicsSimulation(
  id: import('./core/types').PhysicsSimId,
  container?: HTMLElement,
  options?: SimulationOptions
): PhysicsSimulationController {
  const c = container || (typeof document !== 'undefined' ? document.createElement('div') : ({} as any));
  switch (id) {
    case 'material-testing': return mountMaterialTestingSimulation(c, options);
    case 'poisson-ratio': return mountPoissonRatioSimulation(c, options);
    case 'material-comparison': return mountMaterialComparisonSimulation(c, options);
    case 'cantilever-beam': return mountCantileverBeamSimulation(c, options);
    case 'girders-mems': return mountGirdersMEMSSimulation(c, options);
    case 'heat-transfer': return mountHeatTransferSimulation(c, options);
    case 'thermal-expansion-lees-disc': return mountThermalExpansionLeesDiscSimulation(c, options);
    case 'surface-tension': return mountSurfaceTensionSimulation(c, options);
    case 'poiseuille-viscosity': return mountPoiseuilleViscositySimulation(c, options);
    case 'thermal-systems': return mountThermalSystemsSimulation(c, options);
    case 'ultrasonic-waves': return mountUltrasonicWavesSimulation(c, options);
    case 'piezo-magnetostriction': return mountPiezoMagnetoSimulation(c, options);
    case 'ultrasonic-velocity': return mountUltrasonicVelocitySimulation(c, options);
    case 'sonar-ranging': return mountSonarRangingSimulation(c, options);
    case 'ndt-imaging': return mountNDTScanningSimulation(c, options);
    case 'band-structure': return mountBandStructureSimulation(c, options);
    case 'carrier-concentration': return mountCarrierConcentrationSimulation(c, options);
    case 'carrier-transport-pn': return mountCarrierTransportPNSimulation(c, options);
    case 'zener-diode': return mountZenerDiodeSimulation(c, options);
    case 'semiconductor-devices': return mountSemiconductorDevicesSimulation(c, options);
    case 'radiation-matter': return mountRadiationMatterSimulation(c, options);
    case 'laser-principles': return mountLaserPrinciplesSimulation(c, options);
    case 'co2-diode-lasers': return mountCO2DiodeLaserSimulation(c, options);
    case 'total-internal-reflection': return mountTotalInternalReflectionSimulation(c, options);
    case 'fibre-endoscopy-sensors': return mountFibreEndoscopySensorsSimulation(c, options);
    default: return mountMaterialTestingSimulation(c, options);
  }
}

// Master Workspace Component
export { PhysicsVirtualLabWorkspace } from './react/PhysicsVirtualLabWorkspace';
