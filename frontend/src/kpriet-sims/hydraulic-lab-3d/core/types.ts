// Type definitions for Fluid Mechanics & Hydraulic Engineering Virtual Laboratory (U25CE401 / U25CE406)

export type HydraulicSimId =
  | '01-hydrostatic'
  | '02-bernoulli-venturi'
  | '03-pipe-friction'
  | '04-open-channel'
  | '05-discharge-structures';

// ─── 1. HYDROSTATIC PRESSURE & CENTRE OF PRESSURE ────────────────────────────
export interface IHydrostaticInputs {
  fluidDensity: number; // kg/m³ (e.g. 1000 for water, 850 for oil, 1260 for glycerin)
  gravity: number; // m/s² (default 9.81)
  waterDepth: number; // m (0.2 to 2.0)
  probeDepth: number; // m (0 to waterDepth)
  plateAngleDeg: number; // degrees (0 = horizontal, 90 = vertical, 30-80 = inclined)
  plateWidth: number; // m (e.g. 0.3)
  plateHeight: number; // m (e.g. 0.4)
  hingeDepth: number; // m from water surface to top of plate
}

export interface IHydrostaticOutputs {
  gaugePressureAtProbe: number; // Pa
  absolutePressureAtProbe: number; // Pa
  atmosphericPressure: number; // Pa (101325)
  totalResultantForce: number; // N
  centroidDepthHBar: number; // m
  centreOfPressureDepthHStar: number; // m
  centreOfPressureDistanceAlongPlate: number; // m from surface along inclined axis
  momentOfInertiaIG: number; // m⁴
  overturningMoment: number; // N·m about top hinge
}

// ─── 2. BERNOULLI'S THEOREM & VENTURIMETER ──────────────────────────────────
export interface IBernoulliInputs {
  flowRateLps: number; // liters per second (0.1 to 10.0)
  inletDiameterMm: number; // mm (e.g. 50)
  throatDiameterMm: number; // mm (e.g. 25)
  outletDiameterMm: number; // mm (e.g. 50)
  inletElevationM: number; // m datum z1
  throatElevationM: number; // m datum z2
  dischargeCoefficientCd: number; // e.g. 0.98
  fluidDensity: number; // kg/m³
}

export interface IPiezometerStation {
  stationIndex: number;
  label: string;
  xPositionM: number; // distance along pipe
  diameterMm: number;
  elevationM: number; // z
  areaM2: number;
  velocityMps: number;
  velocityHeadM: number; // v²/(2g)
  pressureHeadM: number; // p/(ρg)
  datumHeadM: number; // z
  totalHeadM: number; // p/(ρg) + v²/(2g) + z
  piezometricHeadM: number; // p/(ρg) + z
}

export interface IBernoulliOutputs {
  flowRateM3s: number;
  inletVelocityMps: number;
  throatVelocityMps: number;
  differentialHeadM: number; // h1 - h2
  theoreticalDischargeLps: number;
  actualDischargeLps: number;
  dischargeErrorPct: number;
  stations: IPiezometerStation[];
}

// ─── 3. PIPE FLOW, FRICTION FACTOR & LOSSES ─────────────────────────────────
export type PipeMaterial = 'commercial_steel' | 'smooth_brass' | 'cast_iron' | 'pvc';

export interface IPipeFrictionInputs {
  flowRateLps: number; // 0.1 to 8.0 L/s
  pipeDiameterMm: number; // 15 to 50 mm
  pipeLengthM: number; // 1.0 to 10.0 m
  pipeMaterial: PipeMaterial;
  waterTemperatureC: number; // 10 to 50 °C (determines kinematic viscosity)
  minorLossFittings: {
    suddenContraction: boolean;
    suddenEnlargement: boolean;
    standard90Elbows: number; // count
    gateValveTurnsOpen: number; // 0 = closed, 4 = full open
  };
}

export interface IPipeFrictionOutputs {
  velocityMps: number;
  kinematicViscosityM2s: number;
  densityKgM3: number;
  reynoldsNumber: number;
  flowRegime: 'laminar' | 'transitional' | 'turbulent';
  relativeRoughness: number; // ε / D
  darcyFrictionFactor: number; // f
  majorFrictionHeadLossM: number; // h_f
  minorLossHeadLossM: number; // h_m
  totalHeadLossM: number;
  hydraulicGradientSlope: number; // h_f / L
  p1GaugeKPa: number;
  p2GaugeKPa: number;
}

// ─── 4. OPEN-CHANNEL FLOW & HYDRAULIC JUMP ──────────────────────────────────
export interface IOpenChannelInputs {
  dischargeM3s: number; // 0.005 to 0.100 m³/s
  channelWidthM: number; // 0.20 to 0.80 m (rectangular flume)
  bedSlopePct: number; // 0.05% to 3.0%
  manningsN: number; // 0.009 (glass/perspex) to 0.025
  sluiceGateOpeningM: number; // 0.02 to 0.15 m
}

export interface IOpenChannelOutputs {
  flowAreaM2: number;
  wettedPerimeterM: number;
  hydraulicRadiusM: number;
  normalDepthM: number; // y_0 from Manning's
  criticalDepthM: number; // y_c = (q²/g)^(1/3)
  initialDepthY1M: number; // vena contracta depth below gate
  initialVelocityV1Mps: number;
  initialFroudeNumberFr1: number;
  flowClassification: 'subcritical' | 'critical' | 'supercritical';
  conjugateDepthY2M: number; // Belanger equation for hydraulic jump
  hydraulicJumpOccurs: boolean;
  jumpHeightM: number; // y2 - y1
  jumpLengthM: number; // ~ 6.1 * (y2 - y1)
  energyDissipatedM: number; // ΔE = (y2 - y1)³ / (4 y1 y2)
  efficiencyPct: number; // E2 / E1 * 100
}

// ─── 5. DISCHARGE MEASURING STRUCTURES (ORIFICE & V-NOTCH) ──────────────────
export type DischargeStructureType = 'v_notch_90' | 'rectangular_notch' | 'circular_orifice';

export interface IDischargeStructureInputs {
  structureType: DischargeStructureType;
  headOverCrestOrificeM: number; // 0.03 to 0.35 m
  notchAngleDeg: number; // for V-notch (usually 90, 60, or 45)
  weirWidthM: number; // for rectangular notch (e.g. 0.20 m)
  orificeDiameterMm: number; // for circular orifice (e.g. 20 mm)
  empiricalCd: number; // calibration coefficient
}

export interface IDischargeStructureOutputs {
  theoreticalDischargeLps: number;
  actualDischargeLps: number;
  jetVelocityMps: number; // for orifice v = Cv * sqrt(2gH)
  jetTrajectoryPoints: { x: number; y: number }[]; // trajectory curve
  coeffDischargeCd: number;
  coeffVelocityCv: number;
  coeffContractionCc: number;
}

// ─── OBSERVATION RECORD FOR LAB REPORT ───────────────────────────────────────
export interface IObservationRecord {
  trialNumber: number;
  timestamp: string;
  simId: HydraulicSimId;
  parameters: Record<string, number | string>;
  measurements: Record<string, number | string>;
  calculatedValues: Record<string, number | string>;
  notes?: string;
}

// ─── QUIZ ASSESSMENT QUESTION ────────────────────────────────────────────────
export interface IQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
