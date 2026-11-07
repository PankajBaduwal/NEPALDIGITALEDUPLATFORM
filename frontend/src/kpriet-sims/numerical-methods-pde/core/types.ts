/**
 * Type definitions for Numerical Methods and Partial Differential Equations Simulation Suite
 * Course Code: U25MA402 (R2025 Revised CBCS / Anna University MA3351 / MA8452)
 * Department of Mechanical Engineering | Semester IV
 */

export type NumericalSimId =
  | 'u25ma402-sim-01' // Root-Finding Methods (Bisection, Regula Falsi, Newton-Raphson, Secant)
  | 'u25ma402-sim-02' // Simultaneous Linear Equations (Gauss Elimination, Gauss-Jordan, LU, Jacobi, Gauss-Seidel)
  | 'u25ma402-sim-03' // Interpolation & Curve Fitting (Newton Forward/Backward, Divided Differences, Lagrange, Regression)
  | 'u25ma402-sim-04' // Numerical Differentiation & Integration (Differences, Trapezoidal, Simpson 1/3 & 3/8)
  | 'u25ma402-sim-05' // Ordinary Differential Equations (Euler, Modified Euler, RK4)
  | 'u25ma402-sim-06' // Partial Differential Equations (1D Heat FTCS, 1D Wave Equation, 2D Laplace Elliptic)
  | 'u25ma402-sim-07'; // Numerical Methods Comparison Laboratory & Error Bench

// ─── Module 1: Root-Finding ───
export type RootFindingMethod = 'bisection' | 'regula-falsi' | 'newton-raphson' | 'secant';

export interface RootIterationStep {
  iteration: number;
  a?: number;
  b?: number;
  xCurr: number;
  fCurr: number;
  dfCurr?: number;
  approxError: number;
  remarks?: string;
}

export interface RootFindingResult {
  method: RootFindingMethod;
  converged: boolean;
  root: number;
  iterationsCount: number;
  steps: RootIterationStep[];
  finalError: number;
  statusMessage: string;
  isBracketValid?: boolean;
}

// ─── Module 2: Simultaneous Linear Equations ───
export type LinearSolverMethod =
  | 'gauss-elimination'
  | 'gauss-jordan'
  | 'lu-decomposition'
  | 'jacobi'
  | 'gauss-seidel';

export interface MatrixRowOpStep {
  stepIndex: number;
  description: string;
  matrixA: number[][];
  vectorB: number[];
  pivotRow?: number;
  pivotCol?: number;
}

export interface LinearIterStep {
  iteration: number;
  xVector: number[];
  errorNorm: number;
  residualNorm: number;
}

export interface LinearSolverResult {
  method: LinearSolverMethod;
  solution: number[];
  steps: MatrixRowOpStep[];
  iterSteps?: LinearIterStep[];
  residualVector: number[];
  residualNorm2: number;
  residualNormInf: number;
  isSingular: boolean;
  isDiagonallyDominant?: boolean;
  determinant?: number;
  converged: boolean;
  message: string;
}

// ─── Module 3: Interpolation & Curve Fitting ───
export type InterpolationMethod =
  | 'newton-forward'
  | 'newton-backward'
  | 'newton-divided'
  | 'lagrange'
  | 'least-squares-linear';

export interface DataPoint {
  x: number;
  y: number;
}

export interface DifferenceTable {
  xValues: number[];
  yValues: number[];
  diffs: number[][]; // [order][index]
  h?: number;
}

export interface InterpolationResult {
  method: InterpolationMethod;
  targetX: number;
  interpolatedY: number;
  isExtrapolation: boolean;
  extrapolationWarning?: string;
  diffTable?: DifferenceTable;
  polynomialExpression: string;
  stepByStepDetails: string[];
  regressionR2?: number;
}

// ─── Module 4: Numerical Differentiation & Integration ───
export type DiffMethod = 'forward' | 'backward' | 'central' | 'second-derivative';
export type IntegrationMethod = 'trapezoidal' | 'simpson-13' | 'simpson-38';

export interface DifferentiationResult {
  method: DiffMethod;
  targetX: number;
  stepH: number;
  approxValue: number;
  analyticalValue?: number;
  absError?: number;
  relErrorPercent?: number;
  truncationOrder: string;
  formulaUsed: string;
}

export interface IntegrationStepInfo {
  x: number;
  fx: number;
  weight: number;
  contribution: number;
}

export interface IntegrationResult {
  method: IntegrationMethod;
  lowerA: number;
  upperB: number;
  subintervalsN: number;
  stepH: number;
  approxIntegral: number;
  analyticalValue?: number;
  absError?: number;
  relErrorPercent?: number;
  isValidIntervalCount: boolean;
  validationWarning?: string;
  steps: IntegrationStepInfo[];
  formulaUsed: string;
}

// ─── Module 5: Ordinary Differential Equations ───
export type ODEMethod = 'euler' | 'modified-euler' | 'rk4';

export interface ODEStep {
  step: number;
  x: number;
  yApprox: number;
  yExact?: number;
  error?: number;
  k1?: number;
  k2?: number;
  k3?: number;
  k4?: number;
  slopeUsed?: number;
}

export interface ODEResult {
  method: ODEMethod;
  x0: number;
  y0: number;
  xEnd: number;
  stepH: number;
  steps: ODEStep[];
  finalY: number;
  finalExactY?: number;
  maxGlobalError?: number;
}

// ─── Module 6: Partial Differential Equations ───
export type PDEScheme = '1d-heat-ftcs' | '1d-wave-hyperbolic' | '2d-laplace-elliptic';

export interface PDE1DHeatResult {
  scheme: '1d-heat-ftcs';
  lengthL: number;
  totalTimeT: number;
  thermalDiffusivityAlpha: number;
  dx: number;
  dt: number;
  nx: number;
  nt: number;
  rParameter: number; // r = alpha * dt / dx^2
  isStable: boolean; // r <= 0.5
  stabilityWarning?: string;
  xNodes: number[];
  timeGrid: number[][]; // [timeStepIndex][xNodeIndex]
}

export interface PDE1DWaveResult {
  scheme: '1d-wave-hyperbolic';
  lengthL: number;
  totalTimeT: number;
  waveSpeedC: number;
  dx: number;
  dt: number;
  nx: number;
  nt: number;
  courantNumber: number; // C = c * dt / dx <= 1
  isStable: boolean;
  stabilityWarning?: string;
  xNodes: number[];
  timeGrid: number[][]; // [timeStepIndex][xNodeIndex]
}

export interface PDE2DLaplaceResult {
  scheme: '2d-laplace-elliptic';
  nx: number;
  ny: number;
  iterationsCount: number;
  converged: boolean;
  maxResidual: number;
  gridU: number[][]; // [ny][nx]
}

export type PDEResult = PDE1DHeatResult | PDE1DWaveResult | PDE2DLaplaceResult;

// ─── Module 7: Comparison Laboratory ───
export interface MethodComparisonEntry {
  methodName: string;
  resultSummary: string;
  iterationOrSteps: number;
  errorOrResidual: number;
  convergenceRate: string;
  suitabilityForEng: string;
}

export interface ComparisonLaboratoryResult {
  problemCategory: 'root-finding' | 'linear-systems' | 'integration' | 'ode';
  problemDescription: string;
  entries: MethodComparisonEntry[];
}

// ─── Quiz & Observation Trial Logging ───
export interface NumericalLabTrial {
  id: string;
  timestamp: string;
  simId: NumericalSimId;
  method: string;
  problem: string;
  parameters: Record<string, any>;
  resultSummary: string;
  errorMetric: string;
}

export interface NumericalQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  syllabusTopic: string;
}
