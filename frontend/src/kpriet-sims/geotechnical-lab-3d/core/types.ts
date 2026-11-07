/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Course: U25CE404 — Geotechnical Engineering I (Civil Engineering, Semester IV)
 * Types & Core Interfaces
 */

export type GeotechnicalSimId =
  | 'u25ce404-soil-stratigraphy'
  | 'u25ce404-soil-classification'
  | 'u25ce404-proctor-compaction'
  | 'u25ce404-permeability-lab'
  | 'u25ce404-consolidation-lab'
  | 'u25ce404-shear-strength-lab';

export type GeotechnicalViewMode = 'ground' | 'lab';

export interface ISoilLayer {
  id: string;
  name: string;
  soilType: 'topsoil' | 'clay' | 'silt' | 'sand' | 'gravel';
  depthTop: number; // m below ground surface
  depthBottom: number; // m below ground surface
  thickness: number; // m
  color: string;
  moistureContent: number; // decimal (e.g. 0.15 = 15%)
  specificGravity: number; // Gs (e.g. 2.65 - 2.70)
  voidRatio: number; // e
  porosity: number; // n
  degreeOfSaturation: number; // Sr (0 to 1)
  bulkDensity: number; // kN/m³
  dryDensity: number; // kN/m³
  saturatedDensity: number; // kN/m³
  submergedDensity: number; // kN/m³
  permeabilityK: number; // m/s
  cohesion: number; // kPa
  frictionAngle: number; // degrees
  visible: boolean;
}

export interface IStratigraphyParams {
  waterTableDepth: number; // m below ground surface
  selectedDepth: number; // m for probe inspection
  layers: ISoilLayer[];
}

export interface IStressProfilePoint {
  depth: number; // m
  totalStress: number; // kPa
  poreWaterPressure: number; // kPa
  effectiveStress: number; // kPa
  layerName: string;
}

export interface ISieveData {
  sieveSizeMm: number;
  sieveName: string;
  massRetainedG: number;
  percentRetained: number;
  cumulativeRetained: number;
  percentPassing: number;
}

export interface IClassificationResult {
  totalMassG: number;
  sieves: ISieveData[];
  d10: number; // mm
  d30: number; // mm
  d60: number; // mm
  cu: number; // Uniformity coefficient
  cc: number; // Curvature coefficient
  liquidLimit: number; // %
  plasticLimit: number; // %
  plasticityIndex: number; // %
  aLineIp: number; // %
  isClassification: string; // e.g. "SW-SM", "CH", "CL"
  description: string;
}

export interface ICompactionTrial {
  trialNumber: number;
  waterContentPercent: number; // %
  mouldMassG: number; // g
  mouldPlusWetSoilG: number; // g
  wetSoilMassG: number; // g
  mouldVolumeCm3: number; // cm³
  wetDensityGcm3: number; // g/cm³
  dryDensityGcm3: number; // g/cm³
  zavDensityGcm3: number; // Zero Air Voids density g/cm³
}

export interface ICompactionResult {
  trials: ICompactionTrial[];
  omcPercent: number; // %
  mddGcm3: number; // g/cm³
  specificGravity: number;
  compactionEnergyJoulesPerM3: number;
}

export interface IPermeabilityParams {
  testType: 'constant-head' | 'falling-head';
  soilType: 'sand' | 'silt-clay';
  diameterMm: number; // mm
  lengthMm: number; // mm
  waterTempCelsius: number; // °C
  // Constant head params
  headDifferenceMm: number; // mm
  collectedVolumeMl: number; // mL = cm³
  durationSeconds: number; // s
  // Falling head params
  standpipeDiameterMm: number; // mm
  initialHeadH1Mm: number; // mm
  finalHeadH2Mm: number; // mm
  fallingDurationSeconds: number; // s
}

export interface IPermeabilityResult {
  hydraulicConductivityK: number; // cm/s
  hydraulicConductivityMps: number; // m/s
  k27Celsius: number; // cm/s at standard 27°C (IS 2720)
  hydraulicGradient: number;
  dischargeRateCm3PerSec: number;
  flowVelocityCmPerSec: number;
  seepageVelocityCmPerSec: number;
  soilVoidRatio: number;
}

export interface IConsolidationParams {
  specimenDiameterMm: number; // 60 mm standard
  initialHeightMm: number; // 20 mm standard
  initialMoisturePercent: number; // %
  specificGravity: number;
  loadIncrementKPa: number; // 25, 50, 100, 200, 400, 800 kPa
  elapsedTimeSeconds: number;
}

export interface IConsolidationStageResult {
  appliedStressKPa: number;
  dialGaugeReadingMm: number; // settlement mm
  cumulativeSettlementMm: number;
  finalHeightMm: number;
  voidRatio: number;
  t50Seconds: number;
  cvCm2PerSec: number; // coefficient of consolidation
  mvPerKPa: number; // coefficient of volume compressibility
}

export interface IShearStrengthParams {
  testType: 'direct-shear' | 'ucc';
  soilType: 'cohesionless-sand' | 'cohesive-clay';
  specimenSizeMm: number; // 60x60 mm for direct shear, or 38 mm diam x 76 mm height for UCC
  normalStressKPa: number; // 50, 100, 150, 200 kPa
  displacementRateMmPerMin: number; // e.g. 1.25 mm/min
  cohesionC: number; // kPa
  frictionAngleDeg: number; // degrees
  // UCC specific
  initialLengthMm: number; // 76 mm
  initialDiameterMm: number; // 38 mm
  currentStrain: number; // strain decimal (0 to 0.20)
}

export interface IShearStrengthResult {
  testType: 'direct-shear' | 'ucc';
  normalStressKPa: number;
  shearStressKPa: number;
  peakShearStressKPa: number;
  horizontalDisplacementMm: number;
  verticalDisplacementMm: number;
  cohesionKPa: number;
  frictionAngleDeg: number;
  // UCC outputs
  axialLoadN: number;
  axialStrain: number;
  correctedAreaCm2: number;
  compressiveStressKPa: number;
  quKPa: number; // unconfined compressive strength
  cuKPa: number; // undrained shear strength qu / 2
}

export interface IGeotechnicalObservationTrial {
  trialId: string;
  timestamp: string;
  module: GeotechnicalSimId;
  inputs: Record<string, number | string>;
  readings: Record<string, number | string>;
  calculated: Record<string, number | string>;
  status: 'valid' | 'warning';
}

export interface IGeotechnicalComponentInfo {
  id: string;
  name: string;
  functionDesc: string;
  specification: string;
  safetyCaution?: string;
}
