/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Mechanics of Solids (U25ME303 / Theory with Laboratory - TwL)
 * Core Domain Types & Simulation Interfaces
 */

export type SolidMechanicsSimId =
  | 'u25me303-utm-testing'
  | 'u25me303-axial-compound'
  | 'u25me303-sfd-bmd'
  | 'u25me303-beam-bending'
  | 'u25me303-torsion-shafts'
  | 'u25me303-columns-cylinders';

export type MaterialType = 'mild-steel' | 'structural-steel' | 'aluminum-6061' | 'copper' | 'brass';

export interface MaterialProperties {
  name: string;
  youngsModulusGPa: number; // E in GPa
  shearModulusGPa: number;  // G in GPa
  bulkModulusGPa: number;   // K in GPa
  poissonsRatio: number;    // nu
  yieldStrengthMPa: number; // sigma_y in MPa
  ultimateTensileStrengthMPa: number; // UTS in MPa
  densityKgM3: number;
  thermalExpansionCoeff: number; // alpha (1/K)
  colorHex: string;
}

export type BeamSupportType = 'simply-supported' | 'cantilever' | 'overhanging';
export type BeamCrossSectionType = 'rectangular' | 'circular' | 'i-section';
export type ColumnEndCondition = 'both-pinned' | 'both-fixed' | 'one-fixed-one-free' | 'one-fixed-one-pinned';

export interface PointLoad {
  id: string;
  positionM: number;
  magnitudeKN: number; // Positive downward
}

export interface UniformlyDistributedLoad {
  id: string;
  startM: number;
  endM: number;
  intensityKNm: number; // Positive downward
}

// ─── Calculation Results ──────────────────────────────────────────────────────

export interface UtmTestResult {
  appliedForceKN: number;
  crossSectionAreaMm2: number;
  gaugeLengthMm: number;
  elongationMm: number;
  engineeringStressMPa: number;
  engineeringStrain: number;
  trueStressMPa: number;
  trueStrain: number;
  isYielded: boolean;
  isFractured: boolean;
  resilienceJouleM3: number;
  toughnessEstMJouleM3: number;
  constitutiveCurve: { strain: number; stressMPa: number }[];
}

export interface AxialCompoundResult {
  totalForceKN: number;
  elongationMm: number;
  isCompound: boolean;
  // Core Bar 1
  bar1: {
    material: string;
    areaMm2: number;
    forceShareKN: number;
    stressMPa: number;
    strain: number;
    safetyFactor: number;
  };
  // Sleeve Bar 2 (if compound)
  bar2?: {
    material: string;
    areaMm2: number;
    forceShareKN: number;
    stressMPa: number;
    strain: number;
    safetyFactor: number;
  };
  thermalStressMPa: number;
  thermalElongationMm: number;
}

export interface SfdBmdResult {
  beamLengthM: number;
  supportType: BeamSupportType;
  reactionLeftKN: number;
  reactionRightKN: number;
  reactionMomentLeftKNm?: number;
  points: {
    xM: number;
    shearForceKN: number;
    bendingMomentKNm: number;
  }[];
  maxPositiveMomentKNm: number;
  maxPositiveMomentXM: number;
  maxNegativeMomentKNm: number;
  maxNegativeMomentXM: number;
  maxShearForceKN: number;
  zeroShearPositionsM: number[];
  pointsOfContraflexureM: number[];
}

export interface BeamBendingResult {
  beamLengthM: number;
  crossSectionType: BeamCrossSectionType;
  bMm: number;
  hMm: number;
  dMm?: number;
  areaMm2: number;
  secondMomentOfAreaMm4: number; // I_xx
  sectionModulusMm3: number;    // Z
  maxBendingMomentKNm: number;
  maxBendingStressMPa: number;
  maxTransverseShearStressMPa: number;
  bendingStressDistribution: { yMm: number; stressMPa: number }[];
  shearStressDistribution: { yMm: number; shearStressMPa: number }[];
  maxDeflectionMm: number;
  maxDeflectionXM: number;
  deflectionCurve: { xM: number; deflectionMm: number }[];
  allowableDeflectionLimitMm: number; // L / 250 or L / 350
  isDeflectionServiceable: boolean;
}

export interface TorsionShaftResult {
  appliedTorqueNm: number;
  shaftLengthM: number;
  isHollow: boolean;
  outerDiameterMm: number;
  innerDiameterMm: number;
  polarSecondMomentMm4: number; // J
  polarSectionModulusMm3: number; // Z_p
  maxShearStressMPa: number;
  angleOfTwistRad: number;
  angleOfTwistDeg: number;
  torsionalStiffnessNmPerRad: number;
  weightSavingsPercentage?: number;
  radialStressProfile: { radiusMm: number; shearStressMPa: number }[];
}

export interface ColumnCylinderResult {
  // Column Buckling
  columnLengthM: number;
  effectiveLengthM: number;
  endCondition: ColumnEndCondition;
  radiusOfGyrationMm: number;
  slendernessRatio: number;
  eulerBucklingLoadKN: number;
  eulerBucklingStressMPa: number;
  rankineBucklingLoadKN: number;
  safeWorkingLoadKN: number;
  bucklingModeShape: { xM: number; relativeAmplitude: number }[];

  // Thin Cylindrical Shell
  internalPressureMPa: number;
  cylinderDiameterMm: number;
  wallThicknessMm: number;
  isThinShell: boolean; // D / t >= 20
  hoopStressMPa: number;
  longitudinalStressMPa: number;
  maxInPlaneShearStressMPa: number;
  volumetricStrainMicro: number;
  circumferentialStrainMicro: number;
  longitudinalStrainMicro: number;
}

// ─── 3D Scene Interactive Inspection ──────────────────────────────────────────

export interface SolidMechanicsInspectionItem {
  id: string;
  name: string;
  category: 'structural' | 'instrumentation' | 'loading' | 'fixture';
  description: string;
  specifications: Record<string, string>;
}

export interface SimulationState {
  currentStageIndex: number;
  selectedParameterValues: Record<string, number | string | boolean>;
  parameters: Record<string, number | string | boolean>;
  metrics: Record<string, number | string>;
  inspectedItem: SolidMechanicsInspectionItem | null;
  deformationScale: number;
}

export interface SimulationController {
  init(container: HTMLElement): Promise<void>;
  start(): void;
  pause(): void;
  reset(): void;
  destroy(): void;
  setParameter(key: string, value: number | string | boolean): void;
  getState(): SimulationState;
  subscribe(listener: (state: SimulationState) => void): () => void;
  setStage(stageIndex: number): void;
  resetCamera(): void;
}
