/**
 * Types & Domain Interfaces for Engineering Materials and Metallurgy (U25ME302 / ME3392)
 * Anna University / Autonomous R2025 Syllabus (Semester III B.E. Mechanical Engineering)
 */

export type MetallurgySimId =
  | 'u25me302-crystal-structures'
  | 'u25me302-stress-strain'
  | 'u25me302-phase-diagram'
  | 'u25me302-heat-treatment'
  | 'u25me302-microstructure'
  | 'u25me302-material-testing'
  | 'u25me302-virtual-lab';

export type CrystalStructureType = 'bcc' | 'fcc' | 'hcp';

export interface CrystalLatticeProperties {
  structure: CrystalStructureType;
  name: string;
  atomsPerUnitCell: number;
  coordinationNumber: number;
  atomicPackingFactor: number;
  latticeParameterRelation: string; // e.g. "a = 4r / √3"
  exampleMetals: string[];
  closePackedPlanes: string;
  closePackedDirections: string;
  slipSystemsCount: number;
}

export type AlloyCategoryId =
  | 'mild-steel-1020'
  | 'carbon-steel-1045'
  | 'alloy-steel-4140'
  | 'stainless-steel-304'
  | 'grey-cast-iron'
  | 'ductile-iron'
  | 'aluminium-6061'
  | 'brass-c360'
  | 'titanium-ti6al4v';

export interface EngineeringAlloy {
  id: AlloyCategoryId;
  name: string;
  category: 'Ferrous Steel' | 'Cast Iron' | 'Non-Ferrous' | 'Superalloy';
  compositionSummary: string;
  carbonContentPercent?: number;
  densityKgM3: number;
  youngsModulusGPa: number;
  yieldStrengthMPa: number;
  ultimateTensileStrengthMPa: number;
  percentElongation: number;
  brinellHardnessHBW: number;
  rockwellHardnessHRC?: number;
  charpyImpactEnergyJoules: number;
  applications: string[];
}

export type FeFe3CPhaseId =
  | 'liquid'
  | 'delta-ferrite'
  | 'austenite-gamma'
  | 'alpha-ferrite'
  | 'cementite-fe3c'
  | 'liquid-plus-austenite'
  | 'liquid-plus-cementite'
  | 'austenite-plus-cementite'
  | 'austenite-plus-ferrite'
  | 'ferrite-plus-cementite'
  | 'pearlite-plus-ferrite'
  | 'pearlite-plus-cementite';

export interface PhaseDiagramPointInfo {
  temperatureC: number;
  carbonWeightPercent: number;
  primaryPhase: string;
  secondaryPhase?: string;
  microconstituents: string;
  leverRuleApplicable: boolean;
  phase1FractionPercent?: number;
  phase2FractionPercent?: number;
  phase1Name?: string;
  phase2Name?: string;
  proeutectoidFractionPercent?: number;
  pearliteFractionPercent?: number;
  isHypoeutectoid: boolean;
  isEutectoid: boolean;
  isHypereutectoid: boolean;
  isCastIron: boolean;
}

export type HeatTreatmentProcessType =
  | 'full-annealing'
  | 'normalizing'
  | 'hardening-quench'
  | 'tempering'
  | 'stress-relief';

export type QuenchMedium = 'water' | 'oil' | 'brine' | 'air' | 'furnace';

export interface HeatTreatmentCycleResult {
  process: HeatTreatmentProcessType;
  austenitizingTempC: number;
  holdingTimeMin: number;
  coolingMedium: QuenchMedium;
  coolingRateCPerSec: number;
  initialHardnessHRC: number;
  finalHardnessHRC: number;
  resultingMicrostructure: string;
  toughnessQualitative: 'Very Low' | 'Moderate' | 'High' | 'Very High';
  residualStressQualitative: 'Low' | 'Moderate' | 'High' | 'Relieved';
  practicalApplications: string;
}

export type MetallographicSpecimenId =
  | 'low-carbon-steel-annealed'
  | 'medium-carbon-steel-normalized'
  | 'high-carbon-steel-eutectoid'
  | 'quenched-martensite-steel'
  | 'tempered-martensite-steel'
  | 'grey-cast-iron-flakes'
  | 'spheroidal-ductile-iron'
  | 'white-cast-iron-cementite'
  | 'alpha-beta-brass';

export interface MetallographicSpecimenInfo {
  id: MetallographicSpecimenId;
  title: string;
  materialClass: string;
  carbonPercent?: number;
  heatTreatmentHistory: string;
  etchantUsed: string; // e.g. "2% Nital"
  visiblePhases: string[];
  characteristicAppearance: string;
  astmGrainSizeEstimate: number;
  typicalHardness: string;
}

export type HardnessTestType = 'brinell' | 'rockwell-c' | 'rockwell-b' | 'vickers';

export interface HardnessTestResult {
  testType: HardnessTestType;
  appliedLoadKgf: number;
  indenterType: string;
  indentationSizeMm: number; // diameter or diagonal
  calculatedHardness: number;
  hardnessString: string; // e.g. "210 HBW 10/3000"
  validityNote: string;
}

export interface TensileTestResult {
  loadKN: number;
  gaugeLengthMm: number;
  diameterMm: number;
  originalAreaMm2: number;
  currentAreaMm2: number;
  elongationMm: number;
  engineeringStressMPa: number;
  engineeringStrain: number;
  trueStressMPa: number;
  trueStrain: number;
  isElastic: boolean;
  isYielded: boolean;
  isNecking: boolean;
  isFractured: boolean;
  energyAbsorbedJ: number;
}

export interface ImpactTestResult {
  testMethod: 'Charpy' | 'Izod';
  initialAngleDeg: number;
  finalAngleDeg: number;
  pendulumMassKg: number;
  pendulumArmLengthM: number;
  temperatureC: number;
  absorbedEnergyJoules: number;
  isDuctileFailure: boolean;
  fractureAppearance: 'Fibrous / Dull (Ductile)' | 'Cleavage / Granular (Brittle)' | 'Mixed Mode';
}

export interface MetallurgyLabTrial {
  trialNumber: number;
  timestamp: string;
  experimentName: string;
  sampleName: string;
  testedParameter: string;
  calculatedResult: string;
  status: 'COMPLETED' | 'VERIFIED';
}
