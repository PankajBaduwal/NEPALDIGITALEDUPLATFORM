/**
 * PiyushDhara Eduverse — Concrete Technology (U25CE304)
 * Core Types & Engineering Interfaces
 * Complies with IS 10262:2019, IS 456:2000, IS 516:2021, and IS 1199:2018
 */

export type ConcreteSimId =
  | '01-batching'
  | '02-slump'
  | '03-curing'
  | '04-compressive-strength';

export type ConcreteGrade = 'M15' | 'M20' | 'M25' | 'M30' | 'M35' | 'M40';

export interface IMixProportion {
  grade: ConcreteGrade;
  targetStrength28DaysMpa: number;
  standardDeviationMpa: number;
  cementType: string;
  maxAggregateSizeMm: number;
  nominalRatio: { cement: number; fineAggregate: number; coarseAggregate: number };
  waterCementRatio: number;
  standardSlumpMm: number;
  densityKgM3: number;
  standardReference: string;
}

export interface IBatchingInputs {
  grade: ConcreteGrade;
  batchVolumeLiters: number; // e.g. 10 L to 100 L
  cementMassKg: number;
  fineAggregateMassKg: number;
  coarseAggregateMassKg: number;
  waterMassKg: number;
  fineAggregateMoisturePct: number; // 0% - 6%
  coarseAggregateMoisturePct: number; // 0% - 3%
}

export interface IBatchingResult {
  actualWaterCementRatio: number;
  effectiveWaterCementRatio: number;
  totalBatchMassKg: number;
  yieldVolumeLiters: number;
  designWaterCementRatio: number;
  moistureCorrectionKg: {
    fineAggregateAdjKg: number;
    coarseAggregateAdjKg: number;
    waterAdjKg: number;
  };
  deviations: {
    cementDevPct: number;
    faDevPct: number;
    caDevPct: number;
    waterDevPct: number;
  };
  mixHomogeneityScore: number; // 0 to 100%
  status: 'optimal' | 'lean' | 'wet' | 'harsh' | 'segregating';
  feedbackNotes: string;
}

export type SlumpType = 'true' | 'shear' | 'collapse' | 'zero';

export interface ISlumpTestParams {
  waterCementRatio: number;
  fineAggregateRatio: number;
  aggregateShape: 'rounded' | 'angular' | 'flaky';
  tampingRodsCountPerLayer: number; // Standard is 25 per IS 1199
  layersCount: number; // Standard is 4 layers (or 3 for modern EN)
  liftRate: 'smooth_vertical' | 'jerky' | 'tilted';
}

export interface ISlumpTestResult {
  slumpHeightMm: number;
  slumpType: SlumpType;
  workabilityDegree: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  compactionFactorEst: number;
  vebeTimeSecondsEst: number;
  proceduralErrors: string[];
  isProcedureStandard: boolean;
  civilApplicationRecommendation: string;
}

export type CuringRegime = 'water_submersion_27c' | 'accelerated_warm_55c' | 'ambient_air_dry' | 'steam_curing_65c';

export interface ICuringParams {
  grade: ConcreteGrade;
  curingRegime: CuringRegime;
  ageDays: number; // 1, 3, 7, 14, 28, 56, 90
  relativeHumidityPct: number;
  temperatureC: number;
}

export interface ICuringStrengthResult {
  ageDays: number;
  maturityDegreeHours: number;
  strengthMpa: number;
  pctOf28DayStrength: number;
  hydrationDegree: number; // 0 to 1.0
  curve: { day: number; strengthMpa: number }[];
  environmentalPenaltyPct: number;
}

export type SpecimenGeometry = 'cube_150mm' | 'cube_100mm' | 'cylinder_150x300';

export interface ICompressionTestParams {
  specimenGeometry: SpecimenGeometry;
  concreteGrade: ConcreteGrade;
  ageDays: number;
  curingRegime: CuringRegime;
  measuredWidthMm: number;
  measuredDepthMm: number;
  measuredHeightMm: number;
  centeringOffsetMm: number;
  loadingRateKnSec: number; // Standard: 0.2 to 0.4 MPa/s (5.2 kN/s to 9.0 kN/s for 150mm cube)
  appliedLoadKn: number;
}

export interface ICompressionTestResult {
  effectiveAreaMm2: number;
  failureLoadKn: number;
  compressiveStrengthMpa: number;
  characteristicTargetMpa: number;
  complianceStatus: 'compliant' | 'marginal' | 'non_compliant';
  failureMode: 'normal_pyramidal' | 'semi_pyramidal' | 'shear_cleavage' | 'eccentric_crush';
  conversionFactorTo150mmCube: number;
  fractureStressCurve: { strain: number; stressMpa: number }[];
}
