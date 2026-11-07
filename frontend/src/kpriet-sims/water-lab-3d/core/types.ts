/**
 * PiyushDhara Eduverse — 3D Water Supply & Wastewater Engineering Laboratory
 * Course: U25CE403 — Water Supply and Wastewater Engineering (Civil Engineering, Semester IV)
 * Types & Domain Interfaces
 */

export type WaterSimId =
  | 'u25ce403-water-treatment-plant'
  | 'u25ce403-sedimentation-clarifier'
  | 'u25ce403-filtration-backwash'
  | 'u25ce403-wastewater-treatment'
  | 'u25ce403-distribution-network'
  | 'u25ce403-water-quality-lab';

export type WaterViewMode =
  | 'visualizer'
  | 'theory'
  | 'curves'
  | 'derivations'
  | 'observations'
  | 'quiz'
  | 'procedures';

// ─── 1. Conventional Water Treatment Plant Types ─────────────────────────
export interface IWtpProcessUnit {
  id: string;
  name: string;
  unitType: 'intake' | 'aeration' | 'coagulation' | 'flocculation' | 'sedimentation' | 'filtration' | 'disinfection' | 'storage';
  volumeM3: number;
  retentionTimeMinutes: number;
  description: string;
  chemicalAdded?: string;
  removalEfficiencyPercent?: number;
}

export interface IWtpState {
  plantCapacityMld: number; // Million Litres per Day (e.g. 10 to 100 MLD)
  rawTurbidityNtu: number; // Raw water turbidity in NTU (e.g. 50 NTU)
  rawColiformMpn: number; // MPN per 100 ml
  coagulantAlumDoseMgL: number; // Alum dosage in mg/L (e.g. 20 mg/L)
  filterMedia: 'mono-sand' | 'dual-anthracite-sand';
  chlorineDoseMgL: number; // Disinfection chlorine dose in mg/L
  operatingStatus: 'running' | 'paused' | 'backwashing';
}

// ─── 2. Sedimentation & Clarifier Types ───────────────────────────────────
export interface ISedimentationState {
  flowRateM3Hr: number; // Flow rate Q in m³/hr
  tankType: 'rectangular' | 'circular-radial';
  lengthOrDiameterM: number; // Length (rectangular) or Diameter (circular)
  widthM: number; // Width (for rectangular)
  liquidDepthM: number; // Water depth H in meters
  particleDiameterMm: number; // Particle diameter d in mm (e.g. 0.02 mm)
  particleSpecificGravity: number; // Specific gravity Gs (e.g. 2.65 for sand)
  waterTemperatureCelsius: number; // Water temp for dynamic viscosity calculation
}

export interface ISedimentationResult {
  tankVolumeM3: number;
  surfaceAreaM2: number;
  retentionTimeHours: number;
  surfaceOverflowRateM3M2Day: number; // SOR in m³/(m²·day)
  horizontalVelocityMMin: number; // Vh in m/min
  settlingVelocityMmS: number; // Vs in mm/s from Stokes' law
  removalEfficiencyPercent: number; // % removal of specified particle
  weirLoadingRateM3MDay: number; // Weir overflow rate in m³/(m·day)
  isStokesValid: boolean;
}

// ─── 3. Filtration & Backwash Types ──────────────────────────────────────
export interface IFiltrationState {
  filtrationRateM3M2Hr: number; // e.g. 5.0 m³/(m²·hr) = 5000 L/m²/hr (IRC / CPHEEO)
  bedAreaM2: number; // Surface area of single filter bed
  sandDepthM: number; // e.g. 0.60 m sand
  effectiveSizeD10Mm: number; // Effective size D10 (e.g. 0.50 mm)
  uniformityCoeffCu: number; // Uniformity coefficient Cu (e.g. 1.5)
  sandPorosity: number; // Clean bed porosity e.g. 0.42
  operatingHours: number; // Filter run time (0 to 36 hours)
  isBackwashing: boolean;
  backwashRiseRateMMin: number; // Backwash water upward velocity e.g. 0.6 m/min
}

export interface IFiltrationResult {
  flowCapacityM3Hr: number;
  cleanBedHeadLossM: number; // Carmen-Kozeny clean bed head loss
  cloggedHeadLossM: number; // Dynamic head loss with clogging
  isTerminalHeadLossReached: boolean; // Terminal head loss 2.5m reached?
  bedExpansionPercent: number; // Fluidized bed expansion % during backwash
  backwashWashwaterRequiredM3: number;
}

// ─── 4. Wastewater Treatment (Activated Sludge Process) Types ────────────
export interface IWastewaterState {
  influentFlowM3Day: number; // Sewage flow Q in m³/day (e.g. 10,000 m³/day)
  influentBod5MgL: number; // Raw wastewater BOD5 in mg/L (e.g. 250 mg/L)
  effluentBod5TargetMgL: number; // Target effluent BOD (e.g. 20 mg/L per CPCB)
  aerationTankVolumeM3: number; // Aeration basin volume V
  mlssMgL: number; // Mixed Liquor Suspended Solids in mg/L (e.g. 3000 mg/L)
  sludgeRetentionTimeDays: number; // SRT / Mean cell residence time θc (e.g. 8 days)
  recycleRatioR: number; // Underflow return sludge ratio
  aerationType: 'diffused-air' | 'mechanical-surface';
}

export interface IWastewaterResult {
  hydraulicRetentionTimeHours: number; // HRT = V / Q
  fmRatioKgBodKgMlssDay: number; // Food to Microorganism ratio F/M
  volumetricLoadingKgBodM3Day: number; // VLR
  bodRemovalEfficiencyPercent: number; // Overall BOD removal %
  effluentBodMgL: number; // Actual predicted effluent BOD
  excessSludgeProductionKgDay: number; // Waste activated sludge Px
  oxygenRequiredKgO2Day: number; // Aeration oxygen demand
  meetsCpcbStandards: boolean; // Effluent BOD ≤ 30 mg/L, TSS ≤ 50 mg/L
}

// ─── 5. Water Distribution & Sewer Hydraulics Types ──────────────────────
export interface IDistributionState {
  reservoirHeadM: number; // Water elevation in service reservoir
  pipeLengthM: number; // Supply pipe length
  pipeDiameterMm: number; // Internal diameter D
  pipeRoughnessC: number; // Hazen-Williams coefficient C (e.g. 120 for DI pipe)
  nodeDemandLps: number; // Consumer withdrawal rate in litres/second
  sewerDiameterMm: number; // Gravity sewer diameter
  sewerSlopeRatio: number; // 1 in N gradient (e.g. 1 in 200)
  manningN: number; // Manning roughness (e.g. 0.013 for concrete)
  sewerDepthRatio: number; // d/D partial flow depth ratio (e.g. 0.5 to 0.8)
}

export interface IDistributionResult {
  flowVelocityMS: number; // Pipe velocity in m/s
  frictionalHeadLossM: number; // Head loss hf
  residualPressureHeadM: number; // Pressure head at delivery point
  sewerFullCapacityLps: number; // Sewer flow capacity running full
  sewerActualVelocityMS: number; // Actual partial-flow velocity
  isSelfCleansing: boolean; // Velocity ≥ 0.6 m/s (CPHEEO self-cleansing limit)
}

// ─── 6. Water Quality Laboratory Types ───────────────────────────────────
export interface IWaterQualityLabState {
  selectedTest: 'jar-test' | 'do-winkler' | 'bod5' | 'cod-reflux' | 'turbidity-ph' | 'solids-gravimetric';
  waterSampleType: 'river-raw' | 'clarified-water' | 'treated-tap' | 'domestic-sewage' | 'industrial-effluent';
  // Jar test parameters
  coagulantDosesMgL: number[]; // e.g. [10, 20, 30, 40, 50, 60]
  measuredTurbiditiesNtu: number[]; // residual turbidities
  // DO & BOD parameters
  initialDoMgL: number; // D1 at Day 0
  dilutionFactorP: number; // Sample fraction e.g. 0.02 (2% dilution)
  incubatedDoMgL: number; // D2 after 5 days at 20°C
  // COD parameters
  fasTiterBlankMl: number; // V1
  fasTiterSampleMl: number; // V2
  fasNormality: number; // N
  sampleVolumeMl: number; // V
}

export interface IWaterQualityLabResult {
  testName: string;
  primaryValue: number;
  unit: string;
  standardLimit: string;
  complianceRating: 'desirable' | 'permissible' | 'exceeded-cpcb';
  interpretation: string;
  calculatedTable?: Record<string, number | string>[];
}

// ─── Shared Components & Observations ────────────────────────────────────
export interface IWaterComponentInfo {
  id: string;
  name: string;
  category?: string;
  description?: string;
  specReference?: string;
  dimensions?: string;
  formula?: string;
  retentionTime?: string;
  safetyCaution?: string;
}

export interface IWaterObservationTrial {
  trialNumber: number;
  timestamp: string;
  module: string;
  parameters: Record<string, string | number>;
  results: Record<string, string | number>;
}
