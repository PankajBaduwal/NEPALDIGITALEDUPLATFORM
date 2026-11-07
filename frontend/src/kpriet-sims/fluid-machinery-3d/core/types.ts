// Type definitions for Fluid Mechanics and Machinery Virtual Laboratory (U25MEG05 / U25ME304)
// Semester III, Mechanical Engineering, Autonomous Regulations 2025 (R2025 CBCS)

export type FluidMachinerySimId =
  | 'u25me-bernoulli-theorem'
  | 'u25me-pipe-friction'
  | 'u25me-flow-meters'
  | 'u25me-centrifugal-reciprocating-pumps'
  | 'u25me-hydraulic-turbines'
  | 'u25me-machinery-performance-lab';

export interface StageDefinition {
  id: string;
  title: string;
  description: string;
  educationalFocus: string;
  theoryNotes?: string;
  equations?: string[];
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  suggestedAction?: string;
}

export interface ComponentInspectionData {
  id: string;
  name: string;
  category: 'hydraulic' | 'mechanical' | 'measurement' | 'flow-control' | 'structural';
  description: string;
  specifications: Record<string, string | number>;
  operationalStatus?: string;
  maintenanceNotes?: string;
}

export interface SimulationState {
  currentStageIndex: number;
  isPlaying: boolean;
  speed: number;
  playbackSpeed: number;
  currentTime: number;
  timeElapsed: number;
  mode: string;
  viewMode: 'standard' | 'cutaway' | 'streamlines' | 'energy-line';
  selectedComponent: ComponentInspectionData | null;
  activeComponentId: string | null;
  labelsVisible: boolean;
  metrics: Record<string, string | number>;
  parameters: Record<string, number | string | boolean>;
  selectedParameterValues: Record<string, number | string | boolean>;
}

export interface ParameterControlDefinition {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description: string;
  category: 'flow' | 'geometry' | 'fluid' | 'machine';
}

export interface SimulationController {
  dispose(): void;
  resetCamera(): void;
  play(): void;
  pause(): void;
  setSpeed(speed: number): void;
  nextStage(): void;
  prevStage(): void;
  setStage(index: number): void;
  getState(): SimulationState;
  setParameter(key: string, value: number | string | boolean): void;
  getStages(): StageDefinition[];
  getAvailableParameters(): ParameterControlDefinition[];
  getInspectedComponent(): ComponentInspectionData | null;
  setViewMode?(mode: 'standard' | 'cutaway' | 'streamlines' | 'energy-line'): void;
  toggleLabels?(visible: boolean): void;
  onStateChange(listener: (state: SimulationState) => void): () => void;
}

export interface BernoulliPointData {
  sectionIndex: number;
  distance: number; // m
  diameter: number; // m
  area: number; // m^2
  velocity: number; // m/s
  velocityHead: number; // m
  pressureHead: number; // m
  datumHead: number; // m
  totalHead: number; // m
}

export interface BernoulliCalculationResult {
  discharge: number; // m^3/s
  dischargeLps: number; // L/s
  sections: BernoulliPointData[];
  inletVelocity: number;
  throatVelocity: number;
  inletPressureHead: number;
  throatPressureHead: number;
  headLossTotal: number;
  energyConservationErrorPercent: number;
}

export interface PipeFrictionCalculationResult {
  discharge: number; // m^3/s
  velocity: number; // m/s
  reynoldsNumber: number;
  flowRegime: 'Laminar' | 'Transition' | 'Turbulent';
  frictionFactor: number;
  majorHeadLoss: number; // m
  minorLosses: number; // m
  totalHeadLoss: number; // m
  manometerDeflection: number; // m of Hg
  hydraulicGradient: number; // m/m
  frictionFactorTheoretical: number;
}

export interface FlowMeterResult {
  meterType: 'venturimeter' | 'orificemeter' | 'rotameter';
  inletDiameter: number; // m
  throatDiameter: number; // m
  manometerDeflection: number; // m of Hg
  differentialHeadWater: number; // m of water
  theoreticalDischarge: number; // m^3/s
  actualDischarge: number; // m^3/s
  dischargeCoefficient: number; // Cd
  velocityThroat: number; // m/s
  pressureDropKPa: number; // kPa
}

export interface CentrifugalPumpResult {
  flowRateLps: number; // L/s
  flowRateM3s: number; // m^3/s
  speedRpm: number; // rpm
  suctionHead: number; // m (vacuum)
  deliveryHead: number; // m
  totalManometricHead: number; // m
  hydraulicPowerWatts: number; // W
  hydraulicPowerKW: number; // kW
  inputPowerKW: number; // kW
  overallEfficiencyPercent: number; // %
  specificSpeed: number; // rpm (m, m^3/s)
  operatingPointStatus: 'Normal' | 'Impending Cavitation' | 'High Friction Throttle';
}

export interface ReciprocatingPumpResult {
  cylinderDiameter: number; // m
  strokeLength: number; // m
  speedRpm: number; // rpm
  theoreticalDischargeLps: number; // L/s
  actualDischargeLps: number; // L/s
  slipPercent: number; // %
  coefficientOfDischarge: number;
  indicatorDiagramArea: number; // Joules/stroke
  indicatedPowerWatts: number; // W
  brakePowerWatts: number; // W
  mechanicalEfficiencyPercent: number; // %
  hasAirVessel: boolean;
}

export interface PeltonTurbineResult {
  netHead: number; // m
  dischargeLps: number; // L/s
  speedRpm: number; // rpm
  jetDiameter: number; // m
  jetVelocity: number; // m/s
  hydraulicInputPowerKW: number; // kW
  brakeDeadWeightKg: number; // kg
  springBalanceKg: number; // kg
  netBrakeLoadN: number; // N
  brakeDrumRadius: number; // m
  brakeShaftTorqueNm: number; // N*m
  brakeShaftPowerKW: number; // kW
  overallEfficiencyPercent: number; // %
  specificSpeed: number; // metric
  unitSpeed: number;
  unitDischarge: number;
  unitPower: number;
}

export interface FrancisTurbineResult {
  netHead: number; // m
  dischargeLps: number; // L/s
  speedRpm: number; // rpm
  guideVaneAngleDeg: number; // deg
  hydraulicInputPowerKW: number; // kW
  brakeTorqueNm: number; // N*m
  brakeShaftPowerKW: number; // kW
  overallEfficiencyPercent: number; // %
  runnerInletDiameter: number; // m
  runnerWidth: number; // m
  draftTubePressureKPa: number; // kPa (vacuum)
  specificSpeed: number; // metric
  unitSpeed: number;
  unitDischarge: number;
  unitPower: number;
}
