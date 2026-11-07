/**
 * Types & Domain Interfaces for Manufacturing Technology – I (U25ME304 / ME3391)
 * Anna University / Autonomous R2025 Syllabus (Semester III B.E. Mechanical Engineering)
 */

export type ManufacturingSimId =
  | 'u25me304-lathe-operations'
  | 'u25me304-lathe-turning'
  | 'u25me304-machine-tools'
  | 'u25me304-machining-calculations'
  | 'u25me304-cutting-speed-time'
  | 'u25me304-tool-geometry'
  | 'u25me304-cutting-mechanics'
  | 'u25me304-chip-mechanics'
  | 'u25me304-virtual-workshop'
  | 'u25me304-virtual-laboratory'
  | 'u25me304-virtual-lab';

export type TurningOperation =
  | 'plain-turning'
  | 'facing'
  | 'step-turning'
  | 'taper-turning'
  | 'grooving'
  | 'parting-off'
  | 'knurling'
  | 'thread-cutting';

export type MachineToolType = 'lathe' | 'drilling' | 'milling' | 'shaping';

export type MillingOperationType = 'face-milling' | 'slab-milling' | 'end-milling';
export type MillingFeedMode = 'up-milling' | 'down-milling';

export type DrillingOperationType = 'through-hole' | 'blind-hole' | 'reaming';

export type ChipType = 'continuous' | 'continuous-bue' | 'discontinuous';

export type ToolMaterialType = 'HSS' | 'Carbide' | 'Coated-Carbide' | 'Ceramic';

export type WorkpieceMaterialId =
  | 'mild-steel'
  | 'medium-carbon-steel'
  | 'aluminium-6061'
  | 'brass-c360'
  | 'cast-iron-g25'
  | 'titanium-grade5';

export interface WorkpieceMaterial {
  id: WorkpieceMaterialId;
  name: string;
  grade: string;
  densityKgM3: number;
  brinellHardnessHB: number;
  specificCuttingEnergyKc: number; // N/mm² (or J/mm³)
  recommendedSpeedRange: { min: number; max: number }; // m/min for HSS/Carbide
  taylorN: number; // Taylor tool life exponent n
  taylorC: number; // Taylor tool life constant C
  colorHex: number;
  specularHex: number;
  roughness: number;
  metalness: number;
}

export interface AsaToolSignature {
  backRakeAngleDeg: number;       // αb
  sideRakeAngleDeg: number;       // αs
  endReliefAngleDeg: number;      // θe
  sideReliefAngleDeg: number;     // θs
  endCuttingEdgeAngleDeg: number; // Ce
  sideCuttingEdgeAngleDeg: number;// Cs
  noseRadiusMm: number;           // R
}

export interface OrsToolSignature {
  inclinationAngleDeg: number;    // λ
  orthogonalRakeAngleDeg: number; // γ
  orthogonalClearanceDeg: number; // α
  auxiliaryClearanceDeg: number;  // α'
  principalCuttingEdgeDeg: number;// φ
  auxiliaryCuttingEdgeDeg: number;// φ1
  noseRadiusMm: number;           // r
}

export interface MachiningCalculationsResult {
  cuttingSpeedMMin: number;       // V (m/min)
  spindleSpeedRpm: number;        // N (RPM)
  feedMmRev: number;              // f (mm/rev)
  depthOfCutMm: number;           // d (mm)
  machiningTimeMin: number;       // Tm (minutes)
  machiningTimeSec: number;       // Tm (seconds)
  materialRemovalRateMm3Min: number; // MRR (mm³/min)
  materialRemovalRateCm3Min: number; // MRR (cm³/min)
  cuttingPowerKW: number;         // Pc (kW)
  motorPowerKW: number;           // Pm (kW) assuming efficiency
  estimatedToolLifeMin: number;   // T (min) via Taylor's equation
  theoreticalRoughnessRaUm: number; // Ra = f² / (32·R) in µm
}

export interface MerchantCircleForcesResult {
  rakeAngleDeg: number;           // α (degrees)
  rakeAngleRad: number;
  shearAngleDeg: number;          // φ (degrees)
  shearAngleRad: number;
  frictionAngleDeg: number;       // β (degrees)
  frictionAngleRad: number;
  frictionCoefficient: number;    // µ = tan(β)
  chipThicknessRatio: number;     // r = t1 / t2
  uncutChipThicknessMm: number;   // t1 (mm)
  chipThicknessMm: number;        // t2 (mm)
  cuttingForceFc: number;         // Fc (N) - in direction of cutting velocity
  thrustForceFt: number;          // Ft (N) - perpendicular to cutting velocity
  resultantForceR: number;        // R (N)
  shearForceFs: number;           // Fs (N) - along shear plane
  normalShearForceFn: number;     // Fn (N) - normal to shear plane
  frictionForceF: number;         // F (N) - along tool face
  normalFrictionForceN: number;   // N (N) - normal to tool face
  shearStrain: number;            // γ = cot(φ) + tan(φ - α)
  shearStrainRate: number;        // approx
  cuttingVelocityV: number;       // V (m/min)
  shearVelocityVs: number;        // Vs = V·cos(α)/cos(φ-α) (m/min)
  chipVelocityVc: number;         // Vc = V·sin(φ)/cos(φ-α) (m/min)
}

export interface ShapingCalculationsResult {
  strokeLengthMm: number;         // L (mm)
  cuttingRatioM: number;          // m = cutting time / return time (approx 1.5 ~ 2:1)
  crankRpmN: number;              // N (strokes/min)
  cuttingSpeedMMin: number;       // V = L·N·(1 + m) / 1000
  tableFeedMmStroke: number;      // f (mm/stroke)
  totalWidthMm: number;           // W (mm)
  depthOfCutMm: number;           // d (mm)
  machiningTimeMin: number;       // Tm = (W · (1 + m)) / (f · N)
  mrrMm3Min: number;              // MRR
}

export interface DrillingCalculationsResult {
  drillDiameterMm: number;        // D (mm)
  holeDepthMm: number;            // H (mm)
  spindleSpeedRpm: number;        // N (RPM)
  cuttingSpeedMMin: number;       // V = π·D·N / 1000
  feedMmRev: number;              // f (mm/rev)
  approachAllowanceMm: number;    // A = 0.3 · D
  overtravelMm: number;           // O (mm)
  effectiveTravelMm: number;      // L = H + A + O
  machiningTimeMin: number;       // Tm = L / (f · N)
  mrrMm3Min: number;              // MRR = (π·D² / 4) · f · N
}

export interface MillingCalculationsResult {
  cutterDiameterMm: number;       // D (mm)
  numberOfTeethZ: number;         // z
  cutterRpmN: number;             // N (RPM)
  cuttingSpeedMMin: number;       // V = π·D·N / 1000
  feedPerToothFzMm: number;       // fz (mm/tooth)
  tableFeedVfMmMin: number;       // vf = fz · z · N (mm/min)
  depthOfCutMm: number;           // d (mm)
  widthOfCutMm: number;           // w (mm)
  workpieceLengthMm: number;      // L (mm)
  approachDistanceMm: number;     // A (mm)
  machiningTimeMin: number;       // Tm = (L + A) / vf
  mrrMm3Min: number;              // MRR = w · d · vf
}

export interface MachineComparisonItem {
  machineName: string;
  primaryCuttingMotion: string;
  feedMotion: string;
  typicalCuttingTool: string;
  workpieceGeometry: string;
  commonOperations: string[];
  mainAdvantages: string[];
  limitations: string[];
  industrialApplications: string[];
}

export interface LabTrialRecord {
  id: string;
  timestamp: string;
  experimentTitle: string;
  operation: string;
  material: string;
  parameter1: string;
  parameter2: string;
  parameter3: string;
  metric1: string;
  metric2: string;
  metric3: string;
  status: 'COMPLETED' | 'SAFE' | 'WARNING';
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  syllabusUnit: string;
  topic: string;
}
