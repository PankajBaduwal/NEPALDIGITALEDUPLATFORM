/**
 * rayPhysics.ts
 * Mathematical simulation engines for optical phenomena:
 * Snell's Law, Glass Slab Lateral Shift, Cauchy Dispersion,
 * Single-Slit Diffraction, Double-Slit Interference, Malus's Law,
 * Total Internal Reflection, Photoelectric Energy, and Compton Shift.
 */

export const SPEED_OF_LIGHT = 299792458; // m/s
export const PLANCK_H = 6.62607015e-34; // J·s
export const ELECTRON_MASS = 9.1093837e-31; // kg
export const ELEMENTARY_CHARGE = 1.60217663e-19; // C
export const COMPTON_WAVELENGTH_PM = 2.4263102; // in picometers (pm)

/**
 * Degrees to radians
 */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Radians to degrees
 */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Snell's Law: n1 * sin(theta1) = n2 * sin(theta2)
 * Returns { refractedRad, isTIR }
 */
export function calculateSnellRefraction(
  theta1Rad: number,
  n1: number,
  n2: number
): { refractedRad: number; isTIR: boolean } {
  const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
  if (Math.abs(sinTheta2) > 1.0) {
    return { refractedRad: 0, isTIR: true };
  }
  return { refractedRad: Math.asin(sinTheta2), isTIR: false };
}

/**
 * Glass Slab Geometry & Lateral Displacement
 * t = thickness in mm, iDeg = angle of incidence
 */
export function calculateGlassSlabDisplacement(
  iDeg: number,
  thicknessMm: number,
  refractiveIndex: number
): {
  iRad: number;
  rRad: number;
  rDeg: number;
  eDeg: number;
  lateralShiftMm: number;
  internalPathLengthMm: number;
  criticalAngleDeg: number;
} {
  const iRad = degToRad(iDeg);
  const sinR = Math.sin(iRad) / refractiveIndex;
  const rRad = Math.asin(Math.max(-1, Math.min(1, sinR)));
  const rDeg = radToDeg(rRad);
  const eDeg = iDeg; // In parallel slab, emergent angle = incident angle

  // Lateral shift d = (t * sin(i - r)) / cos(r)
  const lateralShiftMm =
    Math.cos(rRad) !== 0 ? (thicknessMm * Math.sin(iRad - rRad)) / Math.cos(rRad) : 0;
  const internalPathLengthMm = Math.cos(rRad) !== 0 ? thicknessMm / Math.cos(rRad) : thicknessMm;

  const criticalAngleDeg = radToDeg(Math.asin(1 / refractiveIndex));

  return {
    iRad,
    rRad,
    rDeg,
    eDeg,
    lateralShiftMm: Math.max(0, lateralShiftMm),
    internalPathLengthMm,
    criticalAngleDeg,
  };
}

/**
 * VIBGYOR Spectral Wavelengths and Cauchy Dispersion in Crown Glass
 */
export interface SpectrumColorData {
  name: string;
  nameNe: string;
  wavelengthNm: number;
  hex: string;
  nCrown: number;
  deviationDeg: number;
}

export function getCauchyDispersion(prismApexDeg: number = 60): SpectrumColorData[] {
  // A = 1.505, B = 4.2e3 nm^2 for typical crown glass
  const A = 1.505;
  const B = 4200;

  const colors = [
    { name: 'Red', nameNe: 'रातो', wl: 700, hex: '#ef4444' },
    { name: 'Orange', nameNe: 'सुन्तला', wl: 620, hex: '#f97316' },
    { name: 'Yellow', nameNe: 'पहेँलो', wl: 580, hex: '#eab308' },
    { name: 'Green', nameNe: 'हरियो', wl: 530, hex: '#22c55e' },
    { name: 'Blue', nameNe: 'नीलो', wl: 470, hex: '#0ea5e9' },
    { name: 'Indigo', nameNe: 'गाढा नीलो', wl: 430, hex: '#6366f1' },
    { name: 'Violet', nameNe: 'बैजनी', wl: 400, hex: '#a855f7' },
  ];

  return colors.map((c) => {
    const n = A + B / (c.wl * c.wl);
    // Approximation for thin prism deviation: delta = (n - 1) * A
    const deviation = (n - 1) * prismApexDeg;
    return {
      name: c.name,
      nameNe: c.nameNe,
      wavelengthNm: c.wl,
      hex: c.hex,
      nCrown: Number(n.toFixed(4)),
      deviationDeg: Number(deviation.toFixed(2)),
    };
  });
}

/**
 * Malus's Law for Polarization: I = I0 * cos^2(theta)
 */
export function calculateMalusIntensity(
  initialIntensity: number,
  analyzerAngleDeg: number
): {
  transmittedIntensity: number;
  percentage: number;
  isExtinction: boolean;
} {
  const thetaRad = degToRad(analyzerAngleDeg);
  const cosVal = Math.cos(thetaRad);
  const transmitted = initialIntensity * cosVal * cosVal;
  const pct = Math.round((transmitted / initialIntensity) * 100);
  const isExtinction = Math.abs(cosVal) < 0.05;

  return {
    transmittedIntensity: Math.max(0, transmitted),
    percentage: pct,
    isExtinction,
  };
}

/**
 * Photoelectric Effect calculations
 */
export interface PhotoelectricMetal {
  nameEn: string;
  nameNe: string;
  symbol: string;
  workFunctionEv: number; // Phi in eV
}

export const PHOTOELECTRIC_METALS: Record<string, PhotoelectricMetal> = {
  cesium: {
    nameEn: 'Cesium',
    nameNe: 'सिजियम (Cs)',
    symbol: 'Cs',
    workFunctionEv: 2.14,
  },
  potassium: {
    nameEn: 'Potassium',
    nameNe: 'पोटासियम (K)',
    symbol: 'K',
    workFunctionEv: 2.30,
  },
  sodium: {
    nameEn: 'Sodium',
    nameNe: 'सोडियम (Na)',
    symbol: 'Na',
    workFunctionEv: 2.36,
  },
  zinc: {
    nameEn: 'Zinc',
    nameNe: 'जस्ता (Zn)',
    symbol: 'Zn',
    workFunctionEv: 4.31,
  },
};

export function calculatePhotoelectricEffect(
  wavelengthNm: number,
  workFunctionEv: number,
  retardingVoltage: number = 0
): {
  photonEnergyEv: number;
  thresholdWavelengthNm: number;
  thresholdFreqHz: number;
  isEmitted: boolean;
  maxKineticEnergyEv: number;
  stoppingPotentialV: number;
  electronVelocityKmS: number;
} {
  // E (eV) = 1239.84 / lambda(nm)
  const photonEnergyEv = 1239.84193 / wavelengthNm;
  const thresholdWavelengthNm = 1239.84193 / workFunctionEv;
  const thresholdFreqHz = (workFunctionEv * ELEMENTARY_CHARGE) / PLANCK_H;

  const excessEnergyEv = photonEnergyEv - workFunctionEv;
  const isEmitted = excessEnergyEv > 0;
  const maxKineticEnergyEv = isEmitted ? Math.max(0, excessEnergyEv - retardingVoltage) : 0;
  const stoppingPotentialV = isEmitted ? excessEnergyEv : 0;

  // v = sqrt(2 * KE / m)
  let electronVelocityKmS = 0;
  if (isEmitted && maxKineticEnergyEv > 0) {
    const keJoules = maxKineticEnergyEv * ELEMENTARY_CHARGE;
    const vMeters = Math.sqrt((2 * keJoules) / ELECTRON_MASS);
    electronVelocityKmS = vMeters / 1000;
  }

  return {
    photonEnergyEv: Number(photonEnergyEv.toFixed(3)),
    thresholdWavelengthNm: Math.round(thresholdWavelengthNm),
    thresholdFreqHz,
    isEmitted,
    maxKineticEnergyEv: Number(maxKineticEnergyEv.toFixed(3)),
    stoppingPotentialV: Number(stoppingPotentialV.toFixed(2)),
    electronVelocityKmS: Math.round(electronVelocityKmS),
  };
}

/**
 * Compton Effect calculations:
 * Delta Lambda = (h / (m_e * c)) * (1 - cos(theta)) = lambda_c * (1 - cos(theta))
 */
export function calculateComptonScattering(
  incidentWlPm: number, // in picometers
  scatteringAngleDeg: number
): {
  scatteredWlPm: number;
  shiftDeltaPm: number;
  incidentEnergyKev: number;
  scatteredEnergyKev: number;
  electronKineticEnergyKev: number;
  recoilAngleDeg: number;
} {
  const thetaRad = degToRad(scatteringAngleDeg);
  const shiftDeltaPm = COMPTON_WAVELENGTH_PM * (1 - Math.cos(thetaRad));
  const scatteredWlPm = incidentWlPm + shiftDeltaPm;

  // E (keV) = 1.23984193 / lambda(pm) * 1000
  const incidentEnergyKev = 1239.84193 / incidentWlPm;
  const scatteredEnergyKev = 1239.84193 / scatteredWlPm;
  const electronKineticEnergyKev = Math.max(0, incidentEnergyKev - scatteredEnergyKev);

  // Recoil angle phi: cot(phi) = (1 + alpha) * tan(theta / 2)
  const alpha = incidentEnergyKev / 511.0; // alpha = h*nu / (m_e * c^2) where m_e*c^2 = 511 keV
  const tanHalfTheta = Math.tan(thetaRad / 2);
  const cotPhi = (1 + alpha) * tanHalfTheta;
  const phiRad = cotPhi > 0 ? Math.atan(1 / cotPhi) : degToRad(90);
  const recoilAngleDeg = radToDeg(phiRad);

  return {
    scatteredWlPm: Number(scatteredWlPm.toFixed(4)),
    shiftDeltaPm: Number(shiftDeltaPm.toFixed(4)),
    incidentEnergyKev: Number(incidentEnergyKev.toFixed(2)),
    scatteredEnergyKev: Number(scatteredEnergyKev.toFixed(2)),
    electronKineticEnergyKev: Number(electronKineticEnergyKev.toFixed(2)),
    recoilAngleDeg: Number(recoilAngleDeg.toFixed(1)),
  };
}
