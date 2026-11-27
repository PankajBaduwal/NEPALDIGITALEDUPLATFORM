/**
 * pascalPhysics.ts
 * Mathematical & Physical Engine for Pascal's Law Simulation (पास्कलको नियम)
 * Grade 10 Science & Technology • Pressure
 * Nepal CDC Aligned
 */

export const GRAVITY = 9.8; // m/s^2

/**
 * Pressure P = F / A
 * @param forceN Force in Newtons
 * @param areaCm2 Cross-sectional area in cm^2 (1 m^2 = 10,000 cm^2)
 * @returns Pressure in Pascals (N/m^2)
 */
export function calculatePressurePa(forceN: number, areaCm2: number): number {
  if (areaCm2 <= 0) return 0;
  const areaM2 = areaCm2 / 10000;
  return forceN / areaM2;
}

/**
 * Pressure P in kiloPascals (kPa)
 */
export function calculatePressureKpa(forceN: number, areaCm2: number): number {
  return calculatePressurePa(forceN, areaCm2) / 1000;
}

/**
 * Multi-Piston Equilibrium (पास्कलको भाँडो)
 * When P1 is pushed with F1:
 * Pressure P = F1 / A1 is transmitted equally to all other pistons.
 * For any other piston i: F_i = P × A_i
 */
export function calculateMultiPistonForces(
  p1ForceN: number,
  p1AreaCm2: number,
  otherAreasCm2: number[]
): { pressurePa: number; pressureKpa: number; forcesN: number[] } {
  const pressurePa = calculatePressurePa(p1ForceN, p1AreaCm2);
  const pressureKpa = pressurePa / 1000;

  const forcesN = otherAreasCm2.map((area) => {
    const areaM2 = area / 10000;
    return pressurePa * areaM2;
  });

  return { pressurePa, pressureKpa, forcesN };
}

/**
 * Hydraulic Lift & Press Mechanics
 * F1 / A1 = F2 / A2  =>  F2 = F1 * (A2 / A1)
 * A1 * d1 = A2 * d2  =>  d2 = d1 * (A1 / A2)
 * W1 = F1 * d1 = W2 = F2 * d2 (Neglecting friction)
 */
export interface HydraulicLiftMetrics {
  pressurePa: number;
  pressureKpa: number;
  f2OutputN: number;
  liftCapacityKg: number;
  mechanicalAdvantage: number;
  d2LiftDistanceCm: number;
  workInputJoules: number;
  workOutputJoules: number;
  isWorkConserved: boolean;
  canLiftSelectedMass: boolean;
}

export function computeHydraulicLift(
  f1InputN: number,
  a1SmallCm2: number,
  a2LargeCm2: number,
  d1InputStrokeCm: number,
  targetMassKg: number
): HydraulicLiftMetrics {
  const pressurePa = calculatePressurePa(f1InputN, a1SmallCm2);
  const pressureKpa = pressurePa / 1000;

  const mechanicalAdvantage = a2LargeCm2 / a1SmallCm2;
  const f2OutputN = f1InputN * mechanicalAdvantage;
  const liftCapacityKg = f2OutputN / GRAVITY;

  // Incompressible fluid volume conservation: V1 = V2 => A1 * d1 = A2 * d2
  const d2LiftDistanceCm = d1InputStrokeCm * (a1SmallCm2 / a2LargeCm2);

  // Work in Joules (N * m)
  const d1Meters = d1InputStrokeCm / 100;
  const d2Meters = d2LiftDistanceCm / 100;
  const workInputJoules = f1InputN * d1Meters;
  const workOutputJoules = f2OutputN * d2Meters;

  const targetWeightN = targetMassKg * GRAVITY;
  const canLiftSelectedMass = f2OutputN >= targetWeightN;

  return {
    pressurePa,
    pressureKpa,
    f2OutputN,
    liftCapacityKg,
    mechanicalAdvantage,
    d2LiftDistanceCm,
    workInputJoules,
    workOutputJoules,
    isWorkConserved: Math.abs(workInputJoules - workOutputJoules) < 0.05,
    canLiftSelectedMass,
  };
}

/**
 * Hydraulic Brake Calculations
 */
export interface BrakeMetrics {
  linePressureKpa: number;
  clampingForcePerPistonN: number;
  totalFrictionTorqueNm: number;
  brakingDecelerationRpm: number;
}

export function computeHydraulicBrakes(
  pedalEffortN: number,
  pedalLeverRatio: number = 4.0, // Standard brake pedal mechanical leverage
  masterCylinderAreaCm2: number = 3.5,
  slaveCylinderAreaCm2: number = 14.0, // Slave piston is larger than master
  brakeDrumRadiusM: number = 0.14,
  frictionCoefficient: number = 0.42
): BrakeMetrics {
  const effectiveMasterForceN = pedalEffortN * pedalLeverRatio;
  const linePressurePa = calculatePressurePa(effectiveMasterForceN, masterCylinderAreaCm2);
  const linePressureKpa = linePressurePa / 1000;

  // Force on each slave caliper piston
  const slaveAreaM2 = slaveCylinderAreaCm2 / 10000;
  const clampingForcePerPistonN = linePressurePa * slaveAreaM2;

  // Friction torque from dual opposing pads
  const normalForcePerBrake = clampingForcePerPistonN * 2;
  const totalFrictionTorqueNm = frictionCoefficient * normalForcePerBrake * brakeDrumRadiusM;

  // Angular deceleration proxy (RPM reduction rate per second)
  const brakingDecelerationRpm = Math.min(2400, totalFrictionTorqueNm * 4.5);

  return {
    linePressureKpa,
    clampingForcePerPistonN,
    totalFrictionTorqueNm,
    brakingDecelerationRpm,
  };
}

/**
 * Clean Number Formatting with SI units
 */
export function formatNumberSI(val: number, decimals: number = 1): string {
  if (Math.abs(val) >= 1000000) {
    return (val / 1000000).toFixed(decimals) + ' M';
  }
  if (Math.abs(val) >= 1000) {
    return (val / 1000).toFixed(decimals) + ' k';
  }
  return val.toFixed(decimals);
}
