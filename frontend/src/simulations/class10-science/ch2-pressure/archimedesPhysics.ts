/**
 * archimedesPhysics.ts
 * Physical & Mathematical Engine for Archimedes' Principle & Law of Floatation
 * Grade 10 Science & Technology • Pressure
 * Nepal CDC Aligned
 */

export const GRAVITY = 9.8; // m/s^2 (Standard Earth acceleration due to gravity)

export interface ArchimedesCalculation {
  volumeM3: number;
  volumeCm3: number;
  massKg: number;
  weightAirN: number;
  submergedVolumeM3: number;
  submergedVolumeCm3: number;
  displacedMassKg: number;
  displacedWeightN: number;
  upthrustN: number;
  apparentWeightN: number;
  lossInWeightN: number;
  densityRatio: number; // rho_body / rho_liquid
  floatingSubmersionFraction: number; // Equilibrium submersion fraction if free-floating
  willFloat: boolean;
  equilibriumStatus: 'sinks' | 'floats_partially' | 'floats_submerged';
}

/**
 * Computes exact physical metrics for an object partially or fully submerged in a fluid
 * @param volumeCm3 Object total volume in cubic centimeters (cm^3)
 * @param bodyDensityKgM3 Density of the object material (kg/m^3)
 * @param liquidDensityKgM3 Density of the liquid medium (kg/m^3)
 * @param submersionFraction Manually forced submersion fraction (0.0 to 1.0) or -1 for natural floating equilibrium
 */
export function calculateArchimedesMetrics(
  volumeCm3: number,
  bodyDensityKgM3: number,
  liquidDensityKgM3: number,
  submersionFraction: number = 1.0
): ArchimedesCalculation {
  const volumeM3 = volumeCm3 / 1000000; // 1 m^3 = 1,000,000 cm^3
  const massKg = bodyDensityKgM3 * volumeM3;
  const weightAirN = massKg * GRAVITY;

  const densityRatio = bodyDensityKgM3 / liquidDensityKgM3;
  const willFloat = bodyDensityKgM3 < liquidDensityKgM3;
  const floatingSubmersionFraction = Math.min(1.0, densityRatio);

  let effectiveSubmersion = submersionFraction;
  if (submersionFraction < 0) {
    // Natural free floating equilibrium
    effectiveSubmersion = floatingSubmersionFraction;
  } else {
    effectiveSubmersion = Math.max(0, Math.min(1.0, submersionFraction));
  }

  const submergedVolumeM3 = volumeM3 * effectiveSubmersion;
  const submergedVolumeCm3 = volumeCm3 * effectiveSubmersion;

  const displacedMassKg = liquidDensityKgM3 * submergedVolumeM3;
  const displacedWeightN = displacedMassKg * GRAVITY;

  // By Archimedes' Principle: Upthrust = Weight of fluid displaced = V_sub * rho_liq * g
  const upthrustN = displacedWeightN;

  // Apparent weight registered on the spring balance
  const apparentWeightN = Math.max(0, weightAirN - upthrustN);
  const lossInWeightN = weightAirN - apparentWeightN;

  let equilibriumStatus: 'sinks' | 'floats_partially' | 'floats_submerged';
  if (densityRatio > 1.002) {
    equilibriumStatus = 'sinks';
  } else if (Math.abs(densityRatio - 1.0) <= 0.002) {
    equilibriumStatus = 'floats_submerged';
  } else {
    equilibriumStatus = 'floats_partially';
  }

  return {
    volumeM3,
    volumeCm3,
    massKg,
    weightAirN,
    submergedVolumeM3,
    submergedVolumeCm3,
    displacedMassKg,
    displacedWeightN,
    upthrustN,
    apparentWeightN,
    lossInWeightN,
    densityRatio,
    floatingSubmersionFraction,
    willFloat,
    equilibriumStatus,
  };
}

/**
 * Format numbers cleanly for physical UI display
 */
export function formatPhysicalVal(val: number, decimals: number = 2): string {
  return val.toFixed(decimals);
}
