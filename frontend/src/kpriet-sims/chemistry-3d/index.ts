/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Master Module Entrypoint & Factory Exports
 */

import type { SimulationController, SimulationOptions } from './core/types';

// Export types
export * from './core/types';

// Export core classes
export { BaseSimulation } from './core/BaseSimulation';
export { MolecularBuilder } from './core/MolecularBuilder';
export { OrbitalsRenderer } from './core/OrbitalsRenderer';
export { AnnotationSystem } from './core/AnnotationSystem';
export { ParticleSystem } from './core/ParticleSystem';

// Simulation 1: Molecular Orbitals and Hybridization
import { MolecularOrbitalsScene } from './simulations/molecular-orbitals/MolecularOrbitalsScene';
export { MolecularOrbitalsScene };
export function mountMolecularOrbitalsSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new MolecularOrbitalsScene(container, options);
}

// Simulation 2: Organic Reaction Mechanisms (SN1, SN2, E1, E2)
import { OrganicMechanismsScene } from './simulations/organic-mechanisms/OrganicMechanismsScene';
export { OrganicMechanismsScene };
export function mountOrganicMechanismsSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new OrganicMechanismsScene(container, options);
}

// Simulation 3: Conformations and Stereochemistry
import { StereochemistryScene } from './simulations/stereochemistry/StereochemistryScene';
export { StereochemistryScene };
export function mountStereochemistrySimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new StereochemistryScene(container, options);
}

// Simulation 4: Aromaticity and Functional-Group Transformations
import { AromaticReactionsScene } from './simulations/aromatic-reactions/AromaticReactionsScene';
export { AromaticReactionsScene };
export function mountAromaticReactionsSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new AromaticReactionsScene(container, options);
}

// Simulation 5: Polymerization at the Molecular Scale
import { PolymerizationScene } from './simulations/polymerization/PolymerizationScene';
export { PolymerizationScene };
export function mountPolymerizationSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new PolymerizationScene(container, options);
}

// Simulation 6: Coordination Chemistry and Crystal Field Theory
import { CoordinationChemistryScene } from './simulations/coordination-chemistry/CoordinationChemistryScene';
export { CoordinationChemistryScene };
export function mountCoordinationChemistrySimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new CoordinationChemistryScene(container, options);
}

// Simulation 7: Phase Transitions and Water Phase Diagram
import { PhaseTransitionsScene } from './simulations/phase-transitions/PhaseTransitionsScene';
export { PhaseTransitionsScene };
export function mountPhaseTransitionsSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new PhaseTransitionsScene(container, options);
}

// Simulation 8: Surface Adsorption and Heterogeneous Catalysis
import { AdsorptionCatalysisScene } from './simulations/adsorption-catalysis/AdsorptionCatalysisScene';
export { AdsorptionCatalysisScene };
export function mountAdsorptionCatalysisSimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new AdsorptionCatalysisScene(container, options);
}

// Simulation 9: Chromatography (HPLC & Gas Chromatography)
import { ChromatographyScene } from './simulations/chromatography/ChromatographyScene';
export { ChromatographyScene };
export function mountChromatographySimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new ChromatographyScene(container, options);
}

// Simulation 10: Spectroscopy (UV-Vis, IR, NMR)
import { SpectroscopyScene } from './simulations/spectroscopy/SpectroscopyScene';
export { SpectroscopyScene };
export function mountSpectroscopySimulation(container: HTMLElement, options?: SimulationOptions): SimulationController {
  return new SpectroscopyScene(container, options);
}

// Energy Storage & Conversion (Simulations 11, 12, 13 from electrochem-3d)
export {
  mountLithiumIonSimulation,
  LithiumIonBatteryScene,
  mountLeadAcidSimulation,
  LeadAcidBatteryScene,
  mountPEMFuelCellSimulation,
  PEMFuelCellScene,
} from '../electrochem-3d';

// React Workspace Component
export { ChemistryVirtualLabWorkspace, type ChemSimId } from './react/ChemistryVirtualLabWorkspace';
