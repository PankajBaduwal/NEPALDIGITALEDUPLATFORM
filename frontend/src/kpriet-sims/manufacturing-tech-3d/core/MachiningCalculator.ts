/**
 * Deterministic Engineering Machining Calculation Engine
 * Formulated according to:
 * - Kalpakjian & Schmid, Manufacturing Engineering and Technology (8th Ed.)
 * - Mikell P. Groover, Fundamentals of Modern Manufacturing (7th Ed.)
 * - Anna University / Autonomous R2025 Syllabus (U25ME304 / ME3391)
 */

import type {
  MachiningCalculationsResult,
  MerchantCircleForcesResult,
  ShapingCalculationsResult,
  DrillingCalculationsResult,
  MillingCalculationsResult,
  WorkpieceMaterialId,
  AsaToolSignature,
  OrsToolSignature,
} from './types';
import { WORKPIECE_MATERIALS } from './MachiningMaterials';

export class MachiningCalculator {
  /**
   * 1. Lathe Cutting Speed: V = (π · D · N) / 1000 [m/min]
   */
  public static calculateCuttingSpeed(diameterMm: number, spindleSpeedRpm: number): number {
    if (diameterMm <= 0 || spindleSpeedRpm <= 0) return 0;
    return (Math.PI * diameterMm * spindleSpeedRpm) / 1000;
  }

  /**
   * 2. Spindle Speed: N = (1000 · V) / (π · D) [RPM]
   */
  public static calculateSpindleSpeed(diameterMm: number, cuttingSpeedMMin: number): number {
    if (diameterMm <= 0 || cuttingSpeedMMin <= 0) return 0;
    return (1000 * cuttingSpeedMMin) / (Math.PI * diameterMm);
  }

  /**
   * 3. Depth of Cut for Turning: d = (D0 - Df) / 2 [mm]
   */
  public static calculateDepthOfCut(initialDiameterMm: number, finalDiameterMm: number): number {
    if (initialDiameterMm < finalDiameterMm) {
      throw new Error('Initial diameter must be greater than or equal to final diameter for external turning.');
    }
    return (initialDiameterMm - finalDiameterMm) / 2;
  }

  /**
   * 4. Machining Time for Straight Turning: Tm = L / (f · N) [minutes]
   * Allows optional approach and overtravel allowance (mm).
   */
  public static calculateTurningMachiningTime(
    lengthMm: number,
    feedMmRev: number,
    spindleSpeedRpm: number,
    passes: number = 1,
    approachMm: number = 2,
    overtravelMm: number = 2
  ): { minutes: number; seconds: number } {
    if (feedMmRev <= 0 || spindleSpeedRpm <= 0 || lengthMm <= 0) {
      return { minutes: 0, seconds: 0 };
    }
    const effectiveLength = lengthMm + approachMm + overtravelMm;
    const timePerPass = effectiveLength / (feedMmRev * spindleSpeedRpm);
    const totalMinutes = timePerPass * Math.max(1, passes);
    return {
      minutes: totalMinutes,
      seconds: totalMinutes * 60,
    };
  }

  /**
   * 5. Material Removal Rate (MRR):
   * Approximated: MRR ≈ 1000 · V · f · d [mm³/min]
   * Exact: MRR = (π/4 · (D0² - Df²) · L) / Tm [mm³/min]
   */
  public static calculateMRR(
    cuttingSpeedMMin: number,
    feedMmRev: number,
    depthOfCutMm: number,
    initialDiameterMm?: number
  ): { mrrMm3Min: number; mrrCm3Min: number } {
    if (cuttingSpeedMMin <= 0 || feedMmRev <= 0 || depthOfCutMm <= 0) {
      return { mrrMm3Min: 0, mrrCm3Min: 0 };
    }

    let mrrMm3Min = 0;
    if (initialDiameterMm && initialDiameterMm > 2 * depthOfCutMm) {
      // Exact cylindrical ring removal rate: π · d · (D0 - d) · f · N
      const d = depthOfCutMm;
      const D0 = initialDiameterMm;
      // Using average diameter D_avg = D0 - d
      const V_avg = (cuttingSpeedMMin * (D0 - d)) / D0;
      mrrMm3Min = 1000 * V_avg * feedMmRev * d;
    } else {
      // Standard small depth-of-cut approximation
      mrrMm3Min = 1000 * cuttingSpeedMMin * feedMmRev * depthOfCutMm;
    }

    return {
      mrrMm3Min,
      mrrCm3Min: mrrMm3Min / 1000,
    };
  }

  /**
   * 6. Taylor's Tool Life Equation: V · T^n = C => T = (C / V)^(1 / n) [minutes]
   */
  public static calculateTaylorToolLife(cuttingSpeedMMin: number, n: number, C: number): number {
    if (cuttingSpeedMMin <= 0 || n <= 0 || C <= 0) return 0;
    const ratio = C / cuttingSpeedMMin;
    if (ratio <= 0) return 0;
    return Math.pow(ratio, 1 / n);
  }

  /**
   * 7. Theoretical Surface Roughness (Arithmetic Average Ra):
   * Ra ≈ f² / (32 · R) [mm] => converted to µm
   */
  public static calculateTheoreticalRoughness(feedMmRev: number, noseRadiusMm: number): number {
    if (feedMmRev <= 0 || noseRadiusMm <= 0) return 0;
    const raMm = Math.pow(feedMmRev, 2) / (32 * noseRadiusMm);
    return raMm * 1000; // Convert to micrometres (µm)
  }

  /**
   * 8. Comprehensive Turning Machining Calculator
   */
  public static calculateTurningProcess(params: {
    workpieceDiameterMm: number;
    cutDepthMm: number;
    cutLengthMm: number;
    spindleSpeedRpm?: number;
    cuttingSpeedMMin?: number;
    feedMmRev: number;
    materialId: WorkpieceMaterialId;
    noseRadiusMm?: number;
    passes?: number;
  }): MachiningCalculationsResult {
    const D = Math.max(5, params.workpieceDiameterMm);
    const d = Math.max(0.1, Math.min(D * 0.45, params.cutDepthMm));
    const L = Math.max(1, params.cutLengthMm);
    const f = Math.max(0.02, Math.min(2.0, params.feedMmRev));
    const noseR = params.noseRadiusMm ?? 0.8;
    const passes = params.passes ?? 1;

    let V = 0;
    let N = 0;

    if (params.cuttingSpeedMMin && params.cuttingSpeedMMin > 0) {
      V = params.cuttingSpeedMMin;
      N = this.calculateSpindleSpeed(D, V);
    } else if (params.spindleSpeedRpm && params.spindleSpeedRpm > 0) {
      N = params.spindleSpeedRpm;
      V = this.calculateCuttingSpeed(D, N);
    } else {
      N = 650;
      V = this.calculateCuttingSpeed(D, N);
    }

    const { minutes: Tm, seconds: TmSec } = this.calculateTurningMachiningTime(L, f, N, passes);
    const { mrrMm3Min, mrrCm3Min } = this.calculateMRR(V, f, d, D);

    const mat = WORKPIECE_MATERIALS[params.materialId] || WORKPIECE_MATERIALS['mild-steel'];
    const toolLife = this.calculateTaylorToolLife(V, mat.taylorN, mat.taylorC);
    const ra = this.calculateTheoreticalRoughness(f, noseR);

    // Cutting Power: Pc = (Fc · V) / (60 · 1000) = (kc · MRR) / (60 · 10^6) [kW]
    const cuttingPowerKW = (mat.specificCuttingEnergyKc * mrrMm3Min) / (60 * 1e6);
    const motorEfficiency = 0.82;
    const motorPowerKW = cuttingPowerKW / motorEfficiency;

    return {
      cuttingSpeedMMin: Math.round(V * 100) / 100,
      spindleSpeedRpm: Math.round(N),
      feedMmRev: f,
      depthOfCutMm: d,
      machiningTimeMin: Math.round(Tm * 1000) / 1000,
      machiningTimeSec: Math.round(TmSec * 10) / 10,
      materialRemovalRateMm3Min: Math.round(mrrMm3Min),
      materialRemovalRateCm3Min: Math.round(mrrCm3Min * 10) / 10,
      cuttingPowerKW: Math.round(cuttingPowerKW * 100) / 100,
      motorPowerKW: Math.round(motorPowerKW * 100) / 100,
      estimatedToolLifeMin: Math.round(toolLife * 10) / 10,
      theoreticalRoughnessRaUm: Math.round(ra * 100) / 100,
    };
  }

  /**
   * 9. Merchant's Circle Force & Orthogonal Cutting Mechanics
   * Computes shear plane angle φ, forces Fc, Ft, Fs, Fn, F, N, velocities Vs, Vc, and strain γ.
   */
  public static calculateMerchantForces(params: {
    rakeAngleDeg: number;          // α (-10° to 30°)
    uncutChipThicknessMm: number;  // t1 (0.05 to 1.0 mm)
    widthOfCutMm: number;          // w (1.0 to 10.0 mm)
    cuttingSpeedMMin: number;      // V (m/min)
    chipThicknessMm?: number;      // t2 (if measured)
    frictionCoefficient?: number;  // µ = tan(β) (0.2 to 1.2)
    materialId: WorkpieceMaterialId;
  }): MerchantCircleForcesResult {
    const alphaDeg = params.rakeAngleDeg;
    const alphaRad = (alphaDeg * Math.PI) / 180;
    const t1 = Math.max(0.02, params.uncutChipThicknessMm);
    const w = Math.max(0.5, params.widthOfCutMm);
    const V = Math.max(1, params.cuttingSpeedMMin);

    const mat = WORKPIECE_MATERIALS[params.materialId] || WORKPIECE_MATERIALS['mild-steel'];

    // Friction angle β
    const mu = params.frictionCoefficient ?? 0.55;
    const betaRad = Math.atan(mu);
    const betaDeg = (betaRad * 180) / Math.PI;

    // Merchant's Shear Angle formula: φ = 45° + α/2 - β/2
    let phiRad = (Math.PI / 4) + (alphaRad / 2) - (betaRad / 2);
    // Clamp to realistic physical range (10° to 45°)
    phiRad = Math.max((10 * Math.PI) / 180, Math.min((45 * Math.PI) / 180, phiRad));
    const phiDeg = (phiRad * 180) / Math.PI;

    // Chip thickness ratio: r = t1 / t2 = sin(φ) / cos(φ - α)
    const r = Math.sin(phiRad) / Math.cos(phiRad - alphaRad);
    const t2 = params.chipThicknessMm ?? t1 / r;

    // Shear area: As = (w · t1) / sin(φ) [mm²]
    const As = (w * t1) / Math.sin(phiRad);

    // Shear yield strength of workpiece: τs ≈ 0.577 · σ_uts ≈ 0.55 · kc / 3
    const tauS = mat.specificCuttingEnergyKc * 0.28; // N/mm²

    // Shear Force: Fs = τs · As [N]
    const Fs = tauS * As;

    // Resultant cutting force from shear force: R = Fs / cos(φ + β - α)
    const denom = Math.cos(phiRad + betaRad - alphaRad);
    const R = Math.abs(denom) > 0.05 ? Fs / denom : Fs / 0.5;

    // Main Cutting Force: Fc = R · cos(β - α) [N]
    const Fc = Math.abs(R * Math.cos(betaRad - alphaRad));

    // Thrust Force: Ft = R · sin(β - α) [N]
    const Ft = R * Math.sin(betaRad - alphaRad);

    // Normal to shear plane: Fn = Fs · tan(φ + β - α)
    const Fn = Math.abs(Fs * Math.tan(phiRad + betaRad - alphaRad));

    // Friction force on tool face: F = Fc · sin(α) + Ft · cos(α)
    const F = Fc * Math.sin(alphaRad) + Ft * Math.cos(alphaRad);

    // Normal force on tool face: N = Fc · cos(α) - Ft · sin(α)
    const N = Fc * Math.cos(alphaRad) - Ft * Math.sin(alphaRad);

    // Shear strain: γ = cot(φ) + tan(φ - α)
    const shearStrain = (1 / Math.tan(phiRad)) + Math.tan(phiRad - alphaRad);

    // Kinematic Velocities:
    // Shear velocity: Vs = V · cos(α) / cos(φ - α)
    const Vs = (V * Math.cos(alphaRad)) / Math.cos(phiRad - alphaRad);
    // Chip flow velocity: Vc = V · sin(φ) / cos(φ - α) = V · r
    const Vc = (V * Math.sin(phiRad)) / Math.cos(phiRad - alphaRad);

    return {
      rakeAngleDeg: alphaDeg,
      rakeAngleRad: alphaRad,
      shearAngleDeg: Math.round(phiDeg * 10) / 10,
      shearAngleRad: phiRad,
      frictionAngleDeg: Math.round(betaDeg * 10) / 10,
      frictionAngleRad: betaRad,
      frictionCoefficient: Math.round(mu * 100) / 100,
      chipThicknessRatio: Math.round(r * 1000) / 1000,
      uncutChipThicknessMm: t1,
      chipThicknessMm: Math.round(t2 * 1000) / 1000,
      cuttingForceFc: Math.round(Fc),
      thrustForceFt: Math.round(Ft),
      resultantForceR: Math.round(R),
      shearForceFs: Math.round(Fs),
      normalShearForceFn: Math.round(Fn),
      frictionForceF: Math.round(F),
      normalFrictionForceN: Math.round(N),
      shearStrain: Math.round(shearStrain * 100) / 100,
      shearStrainRate: Math.round((Vs * 1000) / (60 * 0.025)), // approx in s^-1
      cuttingVelocityV: Math.round(V * 10) / 10,
      shearVelocityVs: Math.round(Vs * 10) / 10,
      chipVelocityVc: Math.round(Vc * 10) / 10,
    };
  }

  /**
   * 10. Drilling Machine Calculations
   */
  public static calculateDrillingProcess(params: {
    drillDiameterMm: number;
    holeDepthMm: number;
    cuttingSpeedMMin?: number;
    spindleSpeedRpm?: number;
    feedMmRev: number;
    pointAngleDeg?: number;
    isThroughHole?: boolean;
  }): DrillingCalculationsResult {
    const D = Math.max(1, params.drillDiameterMm);
    const H = Math.max(1, params.holeDepthMm);
    const f = Math.max(0.02, params.feedMmRev);
    const theta = params.pointAngleDeg ?? 118; // standard twist drill

    let N = 0;
    let V = 0;
    if (params.spindleSpeedRpm && params.spindleSpeedRpm > 0) {
      N = params.spindleSpeedRpm;
      V = (Math.PI * D * N) / 1000;
    } else if (params.cuttingSpeedMMin && params.cuttingSpeedMMin > 0) {
      V = params.cuttingSpeedMMin;
      N = (1000 * V) / (Math.PI * D);
    } else {
      V = 30;
      N = (1000 * V) / (Math.PI * D);
    }

    // Approach allowance: A = (D/2) / tan(theta / 2) ≈ 0.3 · D for 118°
    const thetaRad = ((theta / 2) * Math.PI) / 180;
    const approachMm = (D / 2) / Math.tan(thetaRad);
    const overtravelMm = params.isThroughHole ? 2.5 : 0;
    const effectiveTravel = H + approachMm + overtravelMm;

    const machiningTimeMin = effectiveTravel / (f * N);
    const mrrMm3Min = (Math.PI * Math.pow(D, 2) / 4) * f * N;

    return {
      drillDiameterMm: D,
      holeDepthMm: H,
      spindleSpeedRpm: Math.round(N),
      cuttingSpeedMMin: Math.round(V * 10) / 10,
      feedMmRev: f,
      approachAllowanceMm: Math.round(approachMm * 10) / 10,
      overtravelMm,
      effectiveTravelMm: Math.round(effectiveTravel * 10) / 10,
      machiningTimeMin: Math.round(machiningTimeMin * 1000) / 1000,
      mrrMm3Min: Math.round(mrrMm3Min),
    };
  }

  /**
   * 11. Shaping Machine Calculations (Quick Return Motion)
   * Cutting ratio m = cutting stroke time / return stroke time (usually 3:2 = 1.5)
   */
  public static calculateShapingProcess(params: {
    strokeLengthMm: number;
    workpieceWidthMm: number;
    cuttingRatioM?: number; // e.g. 1.5 (cutting time / return time)
    strokesPerMinuteN: number;
    feedMmStroke: number;
    depthOfCutMm: number;
  }): ShapingCalculationsResult {
    const L = Math.max(20, params.strokeLengthMm);
    const W = Math.max(10, params.workpieceWidthMm);
    const m = params.cuttingRatioM ?? 1.5; // ratio = 1.5
    const N = Math.max(5, params.strokesPerMinuteN);
    const f = Math.max(0.05, params.feedMmStroke);
    const d = Math.max(0.1, params.depthOfCutMm);

    // Cutting Speed in Shaper: V = (L · N · (1 + m)) / (1000 · m) [m/min]
    const V = (L * N * (1 + m)) / (1000 * m);

    // Total strokes needed to cover width W: strokes = W / f
    const totalStrokes = Math.ceil(W / f);
    const machiningTimeMin = totalStrokes / N;

    // Material Removal Rate: MRR = L · W · d / Tm
    const mrrMm3Min = (L * W * d) / Math.max(0.01, machiningTimeMin);

    return {
      strokeLengthMm: L,
      cuttingRatioM: m,
      crankRpmN: N,
      cuttingSpeedMMin: Math.round(V * 10) / 10,
      tableFeedMmStroke: f,
      totalWidthMm: W,
      depthOfCutMm: d,
      machiningTimeMin: Math.round(machiningTimeMin * 100) / 100,
      mrrMm3Min: Math.round(mrrMm3Min),
    };
  }

  /**
   * 12. Milling Machine Calculations
   */
  public static calculateMillingProcess(params: {
    cutterDiameterMm: number;
    numberOfTeethZ: number;
    cuttingSpeedMMin?: number;
    spindleSpeedRpm?: number;
    feedPerToothFzMm: number;
    depthOfCutMm: number;
    widthOfCutMm: number;
    workpieceLengthMm: number;
    approachMm?: number;
  }): MillingCalculationsResult {
    const D = Math.max(10, params.cutterDiameterMm);
    const z = Math.max(1, params.numberOfTeethZ);
    const fz = Math.max(0.01, params.feedPerToothFzMm);
    const d = Math.max(0.1, params.depthOfCutMm);
    const w = Math.max(1, params.widthOfCutMm);
    const L = Math.max(5, params.workpieceLengthMm);

    let N = 0;
    let V = 0;
    if (params.spindleSpeedRpm && params.spindleSpeedRpm > 0) {
      N = params.spindleSpeedRpm;
      V = (Math.PI * D * N) / 1000;
    } else if (params.cuttingSpeedMMin && params.cuttingSpeedMMin > 0) {
      V = params.cuttingSpeedMMin;
      N = (1000 * V) / (Math.PI * D);
    } else {
      V = 60;
      N = (1000 * V) / (Math.PI * D);
    }

    // Table Feed Rate: vf = fz · z · N [mm/min]
    const vf = fz * z * N;

    // Face milling approach allowance: A = √(d · (D - d)) for peripheral, or D/2 for face milling
    const approach = params.approachMm ?? D / 2;
    const machiningTimeMin = (L + approach + 2) / vf;
    const mrrMm3Min = w * d * vf;

    return {
      cutterDiameterMm: D,
      numberOfTeethZ: z,
      cutterRpmN: Math.round(N),
      cuttingSpeedMMin: Math.round(V * 10) / 10,
      feedPerToothFzMm: fz,
      tableFeedVfMmMin: Math.round(vf * 10) / 10,
      depthOfCutMm: d,
      widthOfCutMm: w,
      workpieceLengthMm: L,
      approachDistanceMm: Math.round(approach * 10) / 10,
      machiningTimeMin: Math.round(machiningTimeMin * 100) / 100,
      mrrMm3Min: Math.round(mrrMm3Min),
    };
  }

  /**
   * 13. Taper Turning Calculation:
   * Half taper angle: tan(θ) = (D - d) / (2 · L)
   * Swivel angle: θ = atan((D - d) / (2 · L)) [degrees]
   */
  public static calculateTaperAngle(
    largeDiameterMm: number,
    smallDiameterMm: number,
    taperLengthMm: number
  ): { angleDeg: number; angleRad: number; conicityK: number } {
    if (taperLengthMm <= 0 || largeDiameterMm <= smallDiameterMm) {
      return { angleDeg: 0, angleRad: 0, conicityK: 0 };
    }
    const tanTheta = (largeDiameterMm - smallDiameterMm) / (2 * taperLengthMm);
    const thetaRad = Math.atan(tanTheta);
    const thetaDeg = (thetaRad * 180) / Math.PI;
    const conicity = (largeDiameterMm - smallDiameterMm) / taperLengthMm; // 1:K conicity
    return {
      angleDeg: Math.round(thetaDeg * 100) / 100,
      angleRad: thetaRad,
      conicityK: conicity,
    };
  }

  /**
   * 14. Convert ASA Tool Signature to ORS (Orthogonal Rake System)
   */
  public static convertAsaToOrs(asa: AsaToolSignature): OrsToolSignature {
    const alphaB = (asa.backRakeAngleDeg * Math.PI) / 180;
    const alphaS = (asa.sideRakeAngleDeg * Math.PI) / 180;
    const Cs = (asa.sideCuttingEdgeAngleDeg * Math.PI) / 180;

    // Principal cutting edge angle φ = 90° - Cs
    const phiRad = Math.PI / 2 - Cs;
    const phiDeg = 90 - asa.sideCuttingEdgeAngleDeg;

    // Auxiliary cutting edge angle φ1 = Ce
    const phi1Deg = asa.endCuttingEdgeAngleDeg;

    // Orthogonal rake angle γ: tan(γ) = tan(αs)·sin(φ) + tan(αb)·cos(φ)
    const tanGamma = Math.tan(alphaS) * Math.sin(phiRad) + Math.tan(alphaB) * Math.cos(phiRad);
    const gammaDeg = (Math.atan(tanGamma) * 180) / Math.PI;

    // Inclination angle λ: tan(λ) = -tan(αs)·cos(φ) + tan(αb)·sin(φ)
    const tanLambda = -Math.tan(alphaS) * Math.cos(phiRad) + Math.tan(alphaB) * Math.sin(phiRad);
    const lambdaDeg = (Math.atan(tanLambda) * 180) / Math.PI;

    return {
      inclinationAngleDeg: Math.round(lambdaDeg * 10) / 10,
      orthogonalRakeAngleDeg: Math.round(gammaDeg * 10) / 10,
      orthogonalClearanceDeg: asa.sideReliefAngleDeg,
      auxiliaryClearanceDeg: asa.endReliefAngleDeg,
      principalCuttingEdgeDeg: Math.round(phiDeg * 10) / 10,
      auxiliaryCuttingEdgeDeg: Math.round(phi1Deg * 10) / 10,
      noseRadiusMm: asa.noseRadiusMm,
    };
  }
}
