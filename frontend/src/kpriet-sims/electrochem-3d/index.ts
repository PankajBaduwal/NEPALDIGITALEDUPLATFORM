/**
 * KPRIET Advanced Electrochemical Cells & Energy Storage Virtual Laboratory
 * Main Module Export
 */

// Types & Interfaces
export * from './types';

// Core Framework Classes
export { BaseSimulation } from './core/BaseSimulation';
export { AnnotationSystem } from './core/AnnotationSystem';
export { ParticleSystem } from './core/ParticleSystem';

// Simulation 1: Lithium-Ion Battery (LFP / Graphite)
export {
  mountLithiumIonSimulation,
  LithiumIonBatteryScene,
} from './simulations/lithium-ion';
export { LithiumIonModel } from './simulations/lithium-ion/LithiumIonModel';

// Simulation 2: Lead-Acid Battery (Automotive 6-Cell 12V)
export {
  mountLeadAcidSimulation,
  LeadAcidBatteryScene,
} from './simulations/lead-acid';
export { LeadAcidModel } from './simulations/lead-acid/LeadAcidModel';

// Simulation 3: PEM Hydrogen Fuel Cell
export {
  mountPEMFuelCellSimulation,
  PEMFuelCellScene,
} from './simulations/pem-fuel-cell';
export { PEMFuelCellModel } from './simulations/pem-fuel-cell/PEMFuelCellModel';

// React Components & Virtual Lab Workspace
export { ElectrochemLabWorkspace, type SimType } from './react/ElectrochemLabWorkspace';
export { LithiumIonBatteryView } from './react/LithiumIonBatteryView';
export { LeadAcidBatteryView } from './react/LeadAcidBatteryView';
export { PEMFuelCellView } from './react/PEMFuelCellView';
