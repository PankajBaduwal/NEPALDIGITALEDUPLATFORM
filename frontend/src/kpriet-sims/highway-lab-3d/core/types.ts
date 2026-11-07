/**
 * PiyushDhara Eduverse — 3D Highway Engineering Simulation & Laboratory
 * Course: U25CE402 — Highway Engineering (Civil Engineering, Semester IV)
 * Types & Domain Interfaces
 */

export type HighwaySimId =
  | 'u25ce402-pavement-cross-section'
  | 'u25ce402-geometric-design'
  | 'u25ce402-superelevation-widening'
  | 'u25ce402-pavement-construction'
  | 'u25ce402-materials-testing'
  | 'u25ce402-pavement-evaluation';

export type HighwayViewMode =
  | 'visualizer'
  | 'theory'
  | 'curves'
  | 'derivations'
  | 'observations'
  | 'quiz'
  | 'procedures';

export type PavementType = 'flexible' | 'rigid';

export interface IPavementLayer {
  id: string;
  name: string;
  code?: string;
  thicknessMm: number;
  material?: string;
  materialDescription?: string;
  specification?: string;
  function?: string;
  color?: string;
  cbrPercent?: number;
  elasticModulusMpa?: number;
  poissonRatio?: number;
  visible?: boolean;
}

export interface IPavementCrossSectionState {
  pavementType: PavementType;
  carriagewayWidth: number;
  lanes: number;
  camberPercent: number;
  camberType: 'parabolic' | 'straight';
  shoulderWidth: number;
  length: number;
  layers: IPavementLayer[];
}

export interface IGeometricDesignState {
  speedKmph: number;
  radiusM: number;
  deflectionAngleDeg: number;
  reactionTimeSec: number;
  longitudinalSlopePercent: number;
  frictionCoeff: number;
  roadType: string;
}

export interface ISuperelevationState {
  speedKmph: number;
  radiusM: number;
  roadWidth: number;
  lanes: number;
  terrain: 'plain-rolling' | 'hilly';
  wheelbaseLengthM: number;
  maxSuperelevation: number;
}

export interface IConstructionSequenceState {
  currentStage: number;
  stageName: string;
  isCompacting: boolean;
  compactionEnergy: 'standard' | 'heavy';
  temperatureCelsius: number;
  rollerSpeedKmph: number;
}

export interface IMaterialsTestingState {
  testType: string;
  sampleWeightGrams: number;
  passingFractionGrams: number;
  dropCount: number;
  bathTemperatureC: number;
  needleLoadG: number;
  penetrationDurationS: number;
  ringBallBathTempC: number;
  heatingRateCPerMin: number;
}

export interface IPavementEvaluationState {
  rearAxleLoadKg: number;
  tyrePressureMpa: number;
  pavementTempC: number;
  subgradeSoilType: string;
  annualRainfallMm: number;
  designTrafficMsa: number;
  distressType: string;
  measuredDeflectionsMm: number[];
}

export interface ICrossSectionParams {
  pavementType: PavementType;
  numberOfLanes: number;
  laneWidthM: number;
  shoulderWidthM: number;
  camberPercent: number;
  roadLengthM: number;
  layers: IPavementLayer[];
}

export interface IGeometricDesignParams {
  designSpeedKph: number;
  reactionTimeSec: number;
  longitudinalFrictionF: number;
  lateralFrictionF: number;
  curveRadiusM: number;
  pavementWidthM: number;
  wheelBaseLengthM: number;
  gradientPercent: number;
}

export interface ISuperelevationParams {
  designSpeedKph: number;
  curveRadiusM: number;
  maxSuperelevation: number;
  pavementWidthM: number;
  camberRate: number;
  transitionLengthM: number;
}

export interface ISightDistanceResult {
  ssdM: number;
  ssdLagDistanceM: number;
  ssdBrakingDistanceM: number;
  isdM: number;
  osdM: number;
  osdD1M: number;
  osdD2M: number;
  osdD3M: number;
  rRulingM: number;
  rAbsoluteMinM: number;
}

export interface ISuperelevationResult {
  calcSuperelevationE: number;
  adoptedSuperelevationE: number;
  checkLateralFriction: number;
  isFrictionSafe: boolean;
  mechanicalWideningM: number;
  psychologicalWideningM: number;
  totalExtraWideningM: number;
  totalCurveWidthM: number;
  edgeRaiseMm: number;
  providedSuperelevation?: number;
  designSuperelevation?: number;
  designSummary?: string;
}

export interface IMaterialsTestParams {
  testType: 'aggregate-impact' | 'aggregate-crushing' | 'los-angeles-abrasion' | 'bitumen-penetration' | 'bitumen-softening-point';
  initialSampleMassG: number;
  passingFractionsMassG: number;
  penetrationDepth10thMm: number;
  softeningPointCelsius: number;
}

export interface IMaterialsTestResult {
  testType: string;
  testValue: number;
  unit: string;
  morthSpecificationLimit: string;
  complianceStatus: 'compliant' | 'marginal' | 'non-compliant';
  interpretation: string;
}

export interface IEvaluationParams {
  measuredDeflectionMm: number;
  testTemperatureCelsius: number;
  subgradeMoistureCorrection: number;
  trafficMsa: number;
}

export interface IEvaluationResult {
  characteristicDeflectionDcMm: number;
  temperatureCorrectionFactor: number;
  correctedDeflectionMm: number;
  allowableDeflectionDaMm: number;
  overlayThicknessMm: number;
  conditionRating: 'good' | 'fair' | 'poor' | 'critical';
}

export interface IHighwayObservationTrial {
  trialNumber?: number;
  trialId?: string;
  timestamp: string;
  module: string;
  parameters: Record<string, string | number>;
  results?: Record<string, string | number>;
  inputs?: Record<string, number | string>;
  readings?: Record<string, number | string>;
  calculated?: Record<string, number | string>;
  status?: 'valid' | 'warning';
}

export interface IHighwayComponentInfo {
  id: string;
  name: string;
  category?: string;
  description?: string;
  functionDesc?: string;
  specification?: string;
  specReference?: string;
  dimensions?: string;
  formula?: string;
  ircClause?: string;
  safetyCaution?: string;
}
