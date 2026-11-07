/**
 * Types & Domain Interfaces for Manufacturing Technology – II (U25ME401 / ME3491 / ME8451)
 * Department: Mechanical Engineering · Semester IV
 */

export type Manufacturing2SimId =
  | 'cnc-machining'
  | 'non-traditional'
  | 'welding-processes'
  | 'casting-processes'
  | 'metal-forming'
  | 'manufacturing-calculations'
  | 'process-selection'
  | 'virtual-workshop';

// ─── Module 1: CNC Machining & Tool Path ───
export type CNCOperation = 'facing' | 'contouring' | 'pocketing' | 'drilling' | 'linear-milling';

export interface GCodeCommand {
  line: number;
  code: string;
  x?: number;
  y?: number;
  z?: number;
  f?: number;
  s?: number;
  comment?: string;
  isCutting: boolean;
}

export interface ToolPathPoint {
  x: number;
  y: number;
  z: number;
  feedRate: number;
  isCutting: boolean;
  operation: string;
}

export interface CNCMachiningParams {
  operation: CNCOperation;
  spindleSpeedRPM: number;
  feedRateMMPM: number;
  depthOfCutMM: number;
  toolDiameterMM: number;
  workpieceWidthMM: number;
  workpieceLengthMM: number;
  workpieceHeightMM: number;
  coolingActive: boolean;
}

export interface CNCExecutionResult {
  toolPath: ToolPathPoint[];
  gCodeListing: GCodeCommand[];
  totalPathLengthMM: number;
  cuttingPathLengthMM: number;
  rapidPathLengthMM: number;
  estimatedCycleTimeSec: number;
  materialRemovalRateCM3Min: number;
  cuttingSpeedMPM: number;
  powerRequiredKW: number;
  warnings: string[];
}

// ─── Module 2: Non-Traditional Machining Processes ───
export type NonTraditionalProcess = 'edm' | 'ecm' | 'laser' | 'waterjet';

export interface EDMParams {
  dischargeCurrentA: number;
  pulseOnTimeMicroSec: number;
  pulseOffTimeMicroSec: number;
  sparkGapMM: number;
  dielectricType: 'hydrocarbon-oil' | 'deionized-water';
  workpieceConductive: boolean;
  electrodeMaterial: 'copper' | 'graphite' | 'copper-tungsten';
}

export interface ECMParams {
  voltageV: number;
  currentDensityACm2: number;
  electrolyteFlowSpeedMS: number;
  electrolyteType: 'sodium-chloride' | 'sodium-nitrate';
  valencyOfDissolution: number;
  atomicWeightG: number;
}

export interface LaserParams {
  laserPowerW: number;
  focalSpotDiameterMM: number;
  cuttingSpeedMMPM: number;
  assistGas: 'oxygen' | 'nitrogen' | 'air';
  materialThicknessMM: number;
}

export interface WaterJetParams {
  pumpPressureBar: number;
  orificeDiameterMM: number;
  abrasiveMassFlowGMin: number;
  abrasiveType: 'garnet-80' | 'garnet-120' | 'pure-water';
  standoffDistanceMM: number;
  cuttingSpeedMMPM: number;
}

export interface NonTraditionalResult {
  process: NonTraditionalProcess;
  materialRemovalRateMM3Min: number;
  surfaceRoughnessRaMicron: number;
  heatAffectedZoneMM: number;
  energyConsumptionKWh: number;
  mechanism: string;
  toolWearRatioPercent: number;
  environmentalNotes: string;
  advantages: string[];
  limitations: string[];
  industrialApplications: string[];
}

// ─── Module 3: Welding Processes & Joints ───
export type WeldingProcess = 'smaw' | 'gmaw' | 'gtaw';
export type WeldJointType = 'butt' | 'lap' | 'tee' | 'corner' | 'edge';

export interface WeldingParams {
  process: WeldingProcess;
  jointType: WeldJointType;
  voltageV: number;
  currentA: number;
  travelSpeedMMS: number;
  arcEfficiency: number;
  plateThicknessMM: number;
  rootGapMM: number;
  grooveAngleDeg: number;
}

export interface WeldingResult {
  heatInputKJMM: number;
  beadWidthMM: number;
  penetrationDepthMM: number;
  hazWidthMM: number;
  crossSectionalAreaMM2: number;
  jointEfficiencyPercent: number;
  recommendedFillerDiameterMM: number;
  potentialDefects: {
    defect: string;
    probability: 'low' | 'moderate' | 'high';
    cause: string;
    remedy: string;
  }[];
}

// ─── Module 4: Casting Processes & Mould Design ───
export type CastingProcess = 'sand-casting' | 'die-casting' | 'investment-casting';

export interface MouldDesignParams {
  process: CastingProcess;
  castingShape: 'cylinder' | 'cube' | 'sphere' | 'flanged-pipe';
  castingVolumeCM3: number;
  castingSurfaceAreaCM2: number;
  pourTemperatureC: number;
  sprueHeightMM: number;
  chvorinovConstantMinCm2: number;
  riserShape: 'top-cylindrical' | 'side-cylindrical';
}

export interface CastingResult {
  modulusCM: number;
  solidificationTimeMin: number;
  riserDiameterMM: number;
  riserHeightMM: number;
  riserSolidificationTimeMin: number;
  riserAdequate: boolean;
  sprueChokeAreaMM2: number;
  pourTimeSec: number;
  yieldPercent: number;
  fillingVelocityMS: number;
  defectRisks: { defect: string; risk: string; prevention: string }[];
}

// ─── Module 5: Metal Forming Processes ───
export type FormingProcess = 'forging' | 'extrusion' | 'rolling' | 'drawing';

export interface FormingParams {
  process: FormingProcess;
  materialYieldStressMPa: number;
  frictionCoefficient: number;
  initialDimensionMM: number;
  finalDimensionMM: number;
  workpieceLengthMM: number;
  dieAngleDeg?: number;
  rollRadiusMM?: number;
}

export interface FormingResult {
  process: FormingProcess;
  strain: number;
  reductionRatioPercent: number;
  deformationForceKN: number;
  powerRequiredKW: number;
  maximumDraftMM?: number;
  extrusionPressureMPa?: number;
  drawingStressMPa?: number;
  processFeasible: boolean;
  notes: string[];
}

// ─── Module 6: Manufacturing Calculations ───
export interface MachiningCalculationsInput {
  operation: 'turning' | 'milling' | 'drilling';
  workpieceDiameterMM: number;
  cuttingSpeedMPM: number;
  spindleSpeedRPM: number;
  feedMMRev: number;
  feedToothMM?: number;
  numberOfTeeth?: number;
  depthOfCutMM: number;
  cutLengthMM: number;
  initialDiameterMM: number;
  finalDiameterMM: number;
  taylorConstantC: number;
  taylorExponentN: number;
}

export interface MachiningCalculationsResult {
  cuttingSpeedCalculatedMPM: number;
  spindleSpeedCalculatedRPM: number;
  machiningTimeMin: number;
  depthOfCutCalculatedMM: number;
  materialRemovalRateCM3Min: number;
  toolLifeMin: number;
  cuttingPowerKW: number;
  unitPowerSpecificEnergyJMM3: number;
}

// ─── Module 7: Manufacturing Process Selection ───
export interface SelectionCriteria {
  materialCategory: 'steels' | 'aluminum-alloys' | 'copper-brass' | 'titanium-superalloys' | 'cast-iron' | 'plastics';
  partGeometry: 'axisymmetric-rotational' | 'prismatic-flat' | 'complex-cavity' | 'thin-walled-sheet' | 'structural-frame';
  batchQuantity: 'prototype-1-10' | 'small-10-100' | 'medium-100-5000' | 'mass-5000-plus';
  toleranceGradeIT: number; // IT5 (ultra precision) to IT14 (rough casting)
  surfaceRoughnessRaMicron: number;
  wallThicknessMM: number;
  budgetPriority: 'low-cost' | 'balanced' | 'high-precision';
}

export interface ProcessCandidate {
  processName: string;
  suitabilityScore: number; // 0 to 100
  pros: string[];
  cons: string[];
  typicalToleranceMM: string;
  achievableRaMicron: string;
  economicBatchRange: string;
  recommendationRank: number;
}

export interface ProcessSelectionResult {
  criteria: SelectionCriteria;
  rankedCandidates: ProcessCandidate[];
  topRecommendationReason: string;
  criticalTradeoffs: string[];
}

// ─── Workshop Laboratory Trial & Quiz ───
export interface Manufacturing2LabTrial {
  trialId: string;
  timestamp: string;
  module: Manufacturing2SimId;
  processName: string;
  keyParameters: Record<string, number | string>;
  outputMetrics: Record<string, number | string>;
  notes: string;
}

export interface Manufacturing2QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  syllabusTopic: string;
}
