/**
 * PiyushDhara Eduverse — Strength of Materials (U25CE301)
 * Core Types & Engineering Interfaces
 */

export type SomSimId =
  | '01-utm-testing'
  | '02-beam-deflection'
  | '03-stress-strain'
  | '04-sfd-bmd';

export type MaterialId =
  | 'fe250-mild-steel'
  | 'fe415-tmt-steel'
  | 'fe500-high-strength-steel'
  | 'al-6061-t6'
  | 'cast-iron-fg200'
  | 'concrete-m25'
  | 'concrete-m30'
  | 'copper-alloy'
  | 'structural-timber';

export interface IMaterialProperties {
  id: MaterialId;
  name: string;
  category: 'ferrous-metal' | 'non-ferrous' | 'concrete' | 'timber';
  elasticModulus: number; // in Pa (e.g. 200e9 for steel)
  poissonsRatio: number; // dimensionless (0.15 - 0.35)
  yieldStrength: number; // in Pa (tension)
  ultimateStrength: number; // in Pa (tension)
  compressiveYieldStrength?: number; // in Pa (compression)
  compressiveUltimateStrength?: number; // in Pa
  fractureStrain: number; // engineering strain at rupture (e.g. 0.22)
  density: number; // in kg/m^3
  thermalExpansionCoeff: number; // 1/K (e.g. 12e-6)
  colorHex: number;
  roughness: number;
  metalness: number;
  isDuctile: boolean;
  standardReference: string;
}

export type CrossSectionType = 'rectangular' | 'i-beam' | 'circular-tube' | 'solid-circular' | 't-section';

export interface ICrossSectionDimensions {
  type: CrossSectionType;
  width?: number; // m
  depth?: number; // m
  diameter?: number; // m
  wallThickness?: number; // m
  flangeWidth?: number; // m
  flangeThickness?: number; // m
  webThickness?: number; // m
}

export interface ISectionProperties {
  area: number; // m^2
  momentOfInertiaX: number; // m^4 (Ixx)
  momentOfInertiaY: number; // m^4 (Iyy)
  sectionModulusX: number; // m^3 (Zxx = Ixx / ymax)
  radiusOfGyrationX: number; // m (rx = sqrt(Ixx / A))
  centroidY: number; // m from base
  outerDimensions: { width: number; height: number };
}

export type SupportCondition = 'simply-supported' | 'cantilever' | 'overhanging' | 'fixed-fixed';

export type LoadType = 'point' | 'udl' | 'combined';

export interface IBeamLoad {
  id: string;
  type: 'point' | 'udl';
  magnitude: number; // N for point, N/m for udl
  positionStart: number; // m from left support A
  positionEnd?: number; // m from left for UDL
}

export interface IBeamCalculationResult {
  reactions: {
    reactionA: number; // N
    reactionB: number; // N
    momentA: number; // N*m (for cantilever / fixed)
    momentB: number; // N*m
  };
  span: number; // m
  sectionProps: ISectionProperties;
  maxBendingMoment: { value: number; position: number }; // N*m, m
  maxShearForce: { value: number; position: number }; // N, m
  maxDeflection: { value: number; position: number }; // m, m
  deflectionAtInspection: number; // m
  shearAtInspection: number; // N
  bendingMomentAtInspection: number; // N*m
  bendingStressMax: number; // Pa
  shearStressMax: number; // Pa
  points: {
    x: number;
    shear: number;
    moment: number;
    deflection: number;
  }[];
}

export interface IUtmCalculationResult {
  load: number; // N
  displacement: number; // m
  engineeringStress: number; // Pa
  engineeringStrain: number; // dimensionless
  trueStress: number; // Pa
  trueStrain: number; // dimensionless
  instantaneousDiameter: number; // m
  stage: 'elastic' | 'yielding' | 'strain-hardening' | 'necking' | 'fractured';
  isYielded: boolean;
  isFractured: boolean;
  elasticEnergyDensity: number; // J/m^3 (Resilience)
  totalEnergyDensity: number; // J/m^3 (Toughness)
  percentElongation: number; // %
  percentReductionInArea: number; // %
}

export interface IStressStrainResult {
  axialLoad: number; // N
  initialLength: number; // m
  initialArea: number; // m^2
  deltaLength: number; // m
  lateralStrain: number;
  deltaDiameter: number; // m
  axialStress: number; // Pa
  axialStrain: number;
  volumetricStrain: number;
  volumetricChange: number; // m^3
  shearModulus: number; // Pa
  bulkModulus: number; // Pa
  strainEnergy: number; // J
  thermalStress: number; // Pa (if constrained)
  mohrCircle: {
    center: number; // Pa
    radius: number; // Pa
    principalStress1: number; // Pa
    principalStress2: number; // Pa
    maxShearStress: number; // Pa
  };
}

export interface ISomSimulationController {
  mount: (container: HTMLElement) => void;
  dispose: () => void;
  reset: () => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  updateParameters: (params: Record<string, any>) => void;
  getCalculations: () => Record<string, any>;
  resetCamera: () => void;
  setCameraPreset: (preset: 'perspective' | 'front' | 'top' | 'side' | 'specimen') => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Workspace Parameter Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface IUtmParams {
  testType: 'tension' | 'compression';
  materialId: MaterialId;
  specimenShape: 'round' | 'rectangular';
  gaugeLengthMm: number;
  diameterMm: number;
  widthMm?: number;
  thicknessMm?: number;
  appliedDisplacementMm: number;
  crossheadSpeedMmMin: number;
}

export interface IBeamParams {
  spanM: number;
  materialId: MaterialId;
  sectionType: CrossSectionType;
  dimensions: {
    width?: number;
    depth?: number;
    diameter?: number;
    wallThickness?: number;
    flangeWidth?: number;
    flangeThickness?: number;
    webThickness?: number;
  };
  supportType: SupportCondition;
  loads: {
    id: string;
    type: 'point' | 'udl';
    magnitudeKn: number;
    positionM: number;
    lengthM?: number;
  }[];
  measurementPositionM: number;
  visualAmplification: number;
  showUndeformedGhost: boolean;
}

export interface IStressStrainParams {
  materialId: MaterialId;
  lengthMm: number;
  crossSectionAreaMm2: number;
  axialForceKn: number;
  loadType: 'tension' | 'compression';
  temperatureDeltaC?: number;
}
