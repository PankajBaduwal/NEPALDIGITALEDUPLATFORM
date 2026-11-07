/**
 * PiyushDhara Eduverse — Thermal Engineering (U25ME402 / ME3451 / ME8493)
 * Core Type Definitions & Domain Interfaces
 * Department of Mechanical Engineering | Semester IV | Regulation R2025 Revised CBCS
 */

export type ThermalSimId =
  | 'heat-transfer'
  | 'composite-wall'
  | 'heat-exchanger'
  | 'steam-boiler'
  | 'refrigeration-cycle'
  | 'energy-calculator'
  | 'thermal-lab'
  | 'virtual-bay';

// ─── Module 1: Heat Transfer Explorer ───
export type HeatTransferMode = 'conduction' | 'convection' | 'radiation';

export interface ConductionParams {
  material: 'copper' | 'aluminum' | 'mild-steel' | 'stainless-steel' | 'glass-wool' | 'refractory-brick';
  thicknessM: number;
  areaM2: number;
  tempHotC: number;
  tempColdC: number;
}

export interface ConvectionParams {
  fluid: 'air-free' | 'air-forced' | 'water-forced' | 'engine-oil';
  surfaceAreaM2: number;
  surfaceTempC: number;
  ambientTempC: number;
  convectionCoeffWM2K?: number;
}

export interface RadiationParams {
  surfaceEmissivity: number; // 0.05 (polished Al) to 0.95 (blackbody/matte)
  surfaceAreaM2: number;
  surfaceTempC: number;
  surroundingTempC: number;
}

export interface HeatTransferResult {
  mode: HeatTransferMode;
  heatRateWatts: number;
  heatFluxWPerM2: number;
  thermalResistanceKPerW: number;
  temperatureGradientKPerM?: number;
  summaryExplanation: string;
  governingEquation: string;
}

// ─── Module 2: Thermal Resistance & Composite Walls ───
export interface WallLayer {
  id: string;
  name: string;
  material: 'copper' | 'aluminum' | 'mild-steel' | 'stainless-steel' | 'common-brick' | 'insulating-brick' | 'refractory-brick' | 'glass-wool' | 'fiberglass' | 'air-gap';
  thicknessMM: number;
  thermalConductivityWMK: number;
}

export interface CompositeWallParams {
  layers: WallLayer[];
  surfaceAreaM2: number;
  insideTempC: number;
  outsideTempC: number;
  innerConvectionH?: number; // W/m²K
  outerConvectionH?: number; // W/m²K
}

export interface LayerCalculation {
  layerId: string;
  name: string;
  thicknessM: number;
  resistanceKPerW: number;
  tempDropC: number;
  interfaceTempLeftC: number;
  interfaceTempRightC: number;
  percentResistance: number;
}

export interface CompositeWallResult {
  totalThermalResistanceKPerW: number;
  overallHeatTransferCoeffWM2K: number;
  heatRateWatts: number;
  heatFluxWPerM2: number;
  layerCalculations: LayerCalculation[];
  criticalInsulationThicknessMM?: number;
}

// ─── Module 3: Heat Exchanger Simulation ───
export type HeatExchangerFlowType = 'parallel' | 'counter';
export type HeatExchangerType = 'double-pipe' | 'shell-and-tube' | 'cross-flow';

export interface HeatExchangerParams {
  flowType: HeatExchangerFlowType;
  exchangerType: HeatExchangerType;
  hotFluidMassFlowKgS: number;
  hotFluidInletTempC: number;
  hotFluidSpecificHeatJPerKgK: number; // water: 4186, engine oil: 2100, air: 1005
  coldFluidMassFlowKgS: number;
  coldFluidInletTempC: number;
  coldFluidSpecificHeatJPerKgK: number;
  overallHeatTransferCoeffWM2K: number;
  surfaceAreaM2: number;
}

export interface HeatExchangerResult {
  flowType: HeatExchangerFlowType;
  hotFluidOutletTempC: number;
  coldFluidOutletTempC: number;
  heatTransferRateKW: number;
  lmtdC: number;
  ntu: number;
  effectiveness: number;
  capacityRatioC: number;
  cHotKWPerK: number;
  cColdKWPerK: number;
  cMinKWPerK: number;
  cMaxKWPerK: number;
  energyBalanceDiscrepancyWatts: number;
  temperatureProfile: {
    relativePosition: number; // 0 to 1
    hotTempC: number;
    coldTempC: number;
  }[];
}

// ─── Module 4: Boilers & Steam Systems ───
export type BoilerType = 'babcock-wilcox' | 'cochran' | 'lancashire' | 'benson';

export interface BoilerParams {
  boilerType: BoilerType;
  steamGenerationRateKgH: number;
  operatingPressureBar: number;
  feedwaterTempC: number;
  steamCondition: 'dry-saturated' | 'superheated';
  superheatTempC?: number;
  fuelConsumptionRateKgH: number;
  fuelCalorificValueKJPerKg: number;
}

export interface BoilerResult {
  boilerType: BoilerType;
  actualEvaporationKgH: number;
  equivalentEvaporationFromAt100C: number; // kg/h
  factorOfEvaporation: number;
  boilerEfficiencyPercent: number;
  steamEnthalpyKJPerKg: number;
  feedwaterEnthalpyKJPerKg: number;
  usefulHeatAbsorbedKW: number;
  totalHeatSuppliedKW: number;
  heatBalanceSheet: {
    category: string;
    heatKW: number;
    percentage: number;
  }[];
  criticalMountings: {
    name: string;
    role: string;
    status: 'operational' | 'inspected';
  }[];
}

// ─── Module 5: Refrigeration & Air Conditioning ───
export type RefrigerantType = 'R134a' | 'R410A' | 'R717-ammonia' | 'R290-propane';

export interface RefrigerationParams {
  refrigerant: RefrigerantType;
  evaporatorTempC: number; // e.g. -10°C
  condenserTempC: number;  // e.g. 45°C
  subcoolingDeltaC: number;
  superheatingDeltaC: number;
  coolingCapacityKW: number;
  compressorIsentropicEfficiency: number; // e.g. 0.82
}

export interface RefrigerationStatePoint {
  point: 1 | 2 | 3 | 4;
  description: string;
  pressureBar: number;
  tempC: number;
  enthalpyKJPerKg: number;
  entropyKJPerKgK?: number;
}

export interface RefrigerationResult {
  refrigerant: RefrigerantType;
  statePoints: RefrigerationStatePoint[];
  refrigeratingEffectKJPerKg: number;
  compressorWorkKJPerKg: number;
  heatRejectedKJPerKg: number;
  refrigerantMassFlowKgS: number;
  compressorPowerKW: number;
  copCooling: number;
  copHeatPump: number;
  carnotCOP: number;
  secondLawEfficiencyPercent: number;
  pEvapBar: number;
  pCondBar: number;
  pressureRatio: number;
}

// ─── Module 6: Thermal Energy Balance Calculator ───
export type ThermalSystemType = 'heat-exchanger' | 'steam-turbine' | 'compressor' | 'nozzle' | 'throttling-valve';

export interface EnergyBalanceInput {
  systemType: ThermalSystemType;
  massFlowRateKgS: number;
  inletPressureKPa: number;
  inletTempC: number;
  inletVelocityMS?: number;
  inletElevationM?: number;
  inletEnthalpyKJPerKg?: number;
  outletPressureKPa: number;
  outletTempC: number;
  outletVelocityMS?: number;
  outletElevationM?: number;
  outletEnthalpyKJPerKg?: number;
  heatTransferRateKW?: number; // Q (+ in, - out)
  shaftPowerKW?: number;       // W (+ out, - in)
}

export interface EnergyBalanceResult {
  systemType: ThermalSystemType;
  sfeeEquation: string;
  calculatedQuantityName: string;
  calculatedQuantityValue: number;
  calculatedQuantityUnit: string;
  energyInflowKW: number;
  energyOutflowKW: number;
  balanceSatisfied: boolean;
  stepByStepDerivations: string[];
}

// ─── Module 7: Virtual Laboratory Trials ───
export interface ThermalLabTrial {
  id: string;
  timestamp: string;
  experimentName: string;
  parameters: Record<string, number | string>;
  results: Record<string, number | string>;
  notes: string;
}

// ─── Conceptual Quiz Bank ───
export interface ThermalQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  syllabusTopic: string;
}
