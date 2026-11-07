/**
 * Types & Domain Interfaces for U25MEG04 Engineering Thermodynamics
 * Anna University / Autonomous R2025 Syllabus (Semester III Mechanical Engineering)
 */

export type ThermoSimId =
  | 'u25meg04-system-energy-transfer'
  | 'u25meg04-processes-explorer'
  | 'u25meg04-first-law-sfee'
  | 'u25meg04-second-law-heat-engine'
  | 'u25meg04-carnot-gas-cycles'
  | 'u25meg04-pure-substance-steam'
  | 'u25meg04-vapor-rankine-cycle'
  | 'u25meg04-psychrometric-processes';

export type GasType = 'air' | 'nitrogen' | 'oxygen' | 'carbon-dioxide' | 'helium';

export type ThermodynamicProcessType =
  | 'isobaric'
  | 'isochoric'
  | 'isothermal'
  | 'isentropic'
  | 'polytropic';

export type SteadyFlowDeviceType =
  | 'turbine'
  | 'compressor'
  | 'nozzle'
  | 'diffuser'
  | 'boiler'
  | 'condenser'
  | 'throttling-valve';

export type ThermalDeviceType = 'heat-engine' | 'refrigerator' | 'heat-pump';

export type GasPowerCycleType = 'carnot' | 'otto' | 'diesel' | 'dual' | 'brayton';
export type GasCycleType = GasPowerCycleType;

export type PsychrometricProcessType =
  | 'sensible-heating'
  | 'sensible-cooling'
  | 'cooling-dehumidification'
  | 'heating-humidification'
  | 'evaporative-cooling'
  | 'ev-cabin-comfort';

export interface GasProperties {
  name: string;
  chemicalFormula: string;
  molecularWeight: number; // kg/kmol
  specificGasConstantR: number; // J/(kg·K)
  cp: number; // J/(kg·K)
  cv: number; // J/(kg·K)
  gamma: number; // cp/cv
}

export interface StatePoint {
  index: number;
  label: string;
  pressureKPa: number;
  volumeM3: number;
  temperatureK: number;
  entropyKJperKgK?: number;
  enthalpyKJperKg?: number;
  internalEnergyKJperKg?: number;
}
export type ThermodynamicStatePoint = StatePoint;

export interface ProcessCalculationResult {
  processName: string;
  polytropicIndex: number;
  state1: StatePoint;
  state2: StatePoint;
  workDoneKJ: number;
  heatTransferKJ: number;
  deltaInternalEnergyKJ: number;
  deltaEnthalpyKJ: number;
  entropyChangeKJperK: number;
  pathPointsPV: { v: number; p: number }[];
  pathPointsTS: { s: number; t: number }[];
  workKJ: number;
  heatKJ: number;
  p2KPa: number;
  t2K: number;
}

export interface SfeeResult {
  deviceType: SteadyFlowDeviceType;
  massFlowRateKgS: number;
  inletEnthalpyKJperKg: number;
  exitEnthalpyKJperKg: number;
  inletVelocityMS: number;
  exitVelocityMS: number;
  inletElevationM: number;
  exitElevationM: number;
  heatTransferRateKW: number;
  workOutputRateKW: number;
  thermalEfficiencyPct?: number;
  isentropicEfficiencyPct?: number;
  workTransferKW: number;
  specificWorkKJkg: number;
  deltaKineticEnergy: number;
  engineeringSummary: string;
}

export interface ThermalDeviceResult {
  deviceType: ThermalDeviceType;
  hotReservoirTempK: number;
  coldReservoirTempK: number;
  heatInputKJ: number;
  heatRejectedKJ: number;
  workNetKJ: number;
  actualCOPOrEfficiency: number;
  carnotCOPOrEfficiency: number;
  secondLawEfficiencyPct: number;
  entropyGenKJperK: number;
  exergyDestructionKJ: number;
  isCarnotViolated: boolean;
  carnotEfficiency: number;
  actualEfficiency: number;
  entropyGeneratedKJ_K: number;
  isPossible: boolean;
}

export interface GasCycleResult {
  cycleType: GasPowerCycleType;
  compressionRatio: number;
  cutoffRatio?: number;
  pressureRatio?: number;
  states: StatePoint[];
  heatSuppliedKJperKg: number;
  heatRejectedKJperKg: number;
  netWorkKJperKg: number;
  thermalEfficiencyPct: number;
  carnotEfficiencyPct: number;
  meanEffectivePressureKPa: number;
  diagramPathPV: { v: number; p: number; stage: string }[];
  diagramPathTS: { s: number; t: number; stage: string }[];
  airStandardEfficiency: number;
  carnotEfficiencyLimit: number;
  netWorkKJkg: number;
}

export interface SteamPropertiesResult {
  pressureBar: number;
  temperatureC: number;
  phase: 'subcooled' | 'saturated-mixture' | 'superheated';
  drynessFractionX?: number; // 0 to 1
  specificVolumeM3perKg: number;
  enthalpyKJperKg: number;
  entropyKJperKgK: number;
  internalEnergyKJperKg: number;
  saturationTempC: number;
  hf: number;
  hfg: number;
  hg: number;
  sf: number;
  sfg: number;
  sg: number;
  vf: number;
  vg: number;
  h: number;
  s: number;
  phaseState: string;
}

export interface RankineCycleResult {
  boilerPressureBar: number;
  condenserPressureBar: number;
  turbineInletTempC: number;
  isReheatEnabled: boolean;
  reheatPressureBar?: number;
  reheatTempC?: number;
  turbineWorkKJperKg: number;
  pumpWorkKJperKg: number;
  netWorkOutputKJperKg: number;
  heatSuppliedKJperKg: number;
  heatRejectedKJperKg: number;
  thermalEfficiencyPct: number;
  carnotEfficiencyPct: number;
  backWorkRatioPct: number;
  specificSteamConsumptionKgPerKWh: number;
  thermalEfficiency: number;
  specificSteamConsumptionKgKWh: number;
  netWorkKJkg: number;
  turbineWorkKJkg: number;
  heatSuppliedKJkg: number;
  states: {
    state: number;
    description: string;
    pBar: number;
    tC: number;
    hKJperKg: number;
    sKJperKgK: number;
    x?: number;
  }[];
}

export interface PsychrometricResult {
  dryBulbTempC: number;
  relativeHumidityPct: number;
  atmosphericPressureKPa: number;
  saturationVaporPressureKPa: number;
  actualVaporPressureKPa: number;
  humidityRatioGramsPerKgDryAir: number;
  dewPointTempC: number;
  wetBulbTempC: number;
  enthalpyKJperKgDryAir: number;
  specificVolumeM3perKgDryAir: number;
  coolingCapacityKW?: number;
  airMassFlowRateKgS?: number;
  processName: PsychrometricProcessType;
  exitDryBulbTempC: number;
  exitRelativeHumidityPct: number;
  sensibleHeatRatio?: number;
  humidityRatioKgKg: number;
  enthalpyKJkg: number;
  vaporPressureKPa: number;
}

export interface ObservationRecord {
  id: string;
  timestamp: string;
  moduleTitle?: string;
  primaryParameter?: string;
  secondaryParameter?: string;
  derivedMetric1?: string;
  derivedMetric2?: string;
  status?: 'OPTIMAL' | 'REVERSIBLE' | 'IRREVERSIBLE' | 'SAFE';
  module?: string;
  param1?: string;
  param2?: string;
  param3?: string;
  output1?: string;
  output2?: string;
  output3?: string;
  efficiencyOrCOP?: string;
}

export interface ConceptQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  syllabusUnit: string;
}
