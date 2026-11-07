/**
 * Engineering Survey (U25CE303) — Core 3D Surveying Types
 * B.E. Civil Engineering — Semester III
 * PiyushDhara Eduverse Academic Portal
 */

export type SurveySimId =
  | '01-levelling'
  | '02-traverse'
  | '03-distance'
  | '04-contouring';

/* =========================================================================
 * 1. Differential Levelling Types
 * ========================================================================= */

export type SightType = 'BS' | 'IS' | 'FS';
export type LevellingReductionMethod = 'hi' | 'rise-and-fall';

export interface LevellingObservation {
  id: string;
  stationName: string;
  sightType: SightType;
  staffReading: number; // in meters (e.g. 1.435 m)
  groundElevation: number; // modeled true RL (m)
  instrumentElevation: number; // instrument station ground elevation
  staffDistance: number; // distance from instrument to staff (m)
  remark: string;
}

export interface FieldBookRow {
  rowId: string;
  stationName: string;
  bs: number | null;
  is: number | null;
  fs: number | null;
  rise: number | null;
  fall: number | null;
  hi: number | null;
  rl: number;
  remark: string;
}

export interface LevellingArithmeticCheck {
  sumBS: number;
  sumFS: number;
  diffBS_FS: number;
  sumRise: number;
  sumFall: number;
  diffRise_Fall: number;
  firstRL: number;
  lastRL: number;
  diffRL: number;
  isCheck1Passed: boolean; // sumBS - sumFS === lastRL - firstRL
  isCheck2Passed: boolean; // sumRise - sumFall === lastRL - firstRL
  misclosure: number; // in meters (if closed back to BM)
  allowableMisclosure: number; // ±c * sqrt(K) per survey standard
}

export interface LevellingRunResult {
  rows: FieldBookRow[];
  check: LevellingArithmeticCheck;
  method: LevellingReductionMethod;
}

/* =========================================================================
 * 2. Theodolite / Total Station Traversing Types
 * ========================================================================= */

export interface TraverseStation {
  id: string;
  code: string; // e.g. 'A', 'B', 'C', 'D'
  x: number; // Easting (m)
  y: number; // Northing (m)
  z: number; // Ground RL (m)
  description: string;
}

export interface TraverseObservation {
  fromStation: string;
  toStation: string;
  horizontalAngleDeg: number; // 0 - 360° (included or deflection angle)
  slopeDistanceM: number;
  verticalAngleDeg: number;
  observedBearingDeg?: number; // Whole circle bearing (0 - 360°)
}

export interface TraverseLegComputed {
  fromStation: string;
  toStation: string;
  horizontalDistance: number; // H = S * cos(theta)
  wcbDeg: number; // Whole Circle Bearing (0 - 360°)
  quadrantBearing: string; // e.g. "N 45° 30' E"
  latitude: number; // L = dist * cos(wcb)
  departure: number; // D = dist * sin(wcb)
  correctionLat: number; // Bowditch adjustment
  correctionDep: number; // Bowditch adjustment
  adjustedLatitude: number;
  adjustedDeparture: number;
  northing: number; // computed coordinate
  easting: number; // computed coordinate
}

export interface TraverseClosureResult {
  legs: TraverseLegComputed[];
  totalPerimeter: number;
  sumLatitude: number;
  sumDeparture: number;
  closingErrorLinear: number; // e = sqrt(sumLat^2 + sumDep^2)
  closingBearingDeg: number;
  relativePrecisionRatio: number; // 1 in N (e.g. 1 in 5000)
  isAcceptableForEngineering: boolean;
}

/* =========================================================================
 * 3. Distance Measurement & Instrument Operation Types
 * ========================================================================= */

export type DistanceTool = 'steel-tape' | 'total-station-edm';

export interface DistanceExperimentInput {
  tool: DistanceTool;
  slopeDistanceM: number;
  verticalAngleDeg: number;
  instrumentHeightM: number;
  targetReflectorHeightM: number;
  stationGroundElevationM: number;
  tapeTemperatureC?: number;
  standardTemperatureC?: number;
  tapeTensionKg?: number;
  standardTensionKg?: number;
}

export interface DistanceComputationResult {
  horizontalDistance: number; // H = S * cos(alpha)
  verticalDifference: number; // V = S * sin(alpha)
  targetGroundElevation: number; // RL_target = RL_inst + hi + V - ht
  tapeCorrections?: {
    temperatureCorrection: number; // Ct = alpha * L * (T - T0)
    pullCorrection: number; // Cp = (P - P0) * L / (A * E)
    sagCorrection: number; // Cs = (W^2 * L) / (24 * P^2)
    correctedDistance: number;
  };
}

/* =========================================================================
 * 4. Contour Survey and Terrain Mapping Types
 * ========================================================================= */

export interface TerrainSamplePoint {
  id: string;
  gridX: number; // column index
  gridY: number; // row index
  worldX: number; // meter
  worldZ: number; // meter
  reducedLevel: number; // elevation in meters
  isBenchmark?: boolean;
}

export interface ContourSegment {
  elevation: number;
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}

export interface ContourMapModel {
  gridSize: number; // e.g. 7x7 grid
  gridSpacingM: number; // distance between grid lines (m)
  points: TerrainSamplePoint[];
  minElevation: number;
  maxElevation: number;
  contourInterval: number; // e.g. 0.5m or 1.0m
  segments: ContourSegment[];
}
