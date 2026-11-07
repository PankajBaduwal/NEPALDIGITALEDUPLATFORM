/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Mechanics of Solids (U25ME303 / Theory with Laboratory - TwL)
 * Deterministic Solid Mechanics Calculator Engine
 * Conforming to: IS 1608 / ASTM E8, IS 800:2007, IS 456:2000, and Timoshenko & Gere
 */

import type {
  MaterialType,
  MaterialProperties,
  BeamSupportType,
  BeamCrossSectionType,
  ColumnEndCondition,
  PointLoad,
  UniformlyDistributedLoad,
  UtmTestResult,
  AxialCompoundResult,
  SfdBmdResult,
  BeamBendingResult,
  TorsionShaftResult,
  ColumnCylinderResult,
} from './types';

export const STANDARD_MATERIALS: Record<MaterialType, MaterialProperties> = {
  'mild-steel': {
    name: 'Mild Steel (IS 2062 Grade E250)',
    youngsModulusGPa: 200,
    shearModulusGPa: 78,
    bulkModulusGPa: 160,
    poissonsRatio: 0.28,
    yieldStrengthMPa: 250,
    ultimateTensileStrengthMPa: 410,
    densityKgM3: 7850,
    thermalExpansionCoeff: 12.0e-6,
    colorHex: '#94a3b8',
  },
  'structural-steel': {
    name: 'Structural Alloy Steel (4140 Annealed)',
    youngsModulusGPa: 205,
    shearModulusGPa: 80,
    bulkModulusGPa: 165,
    poissonsRatio: 0.30,
    yieldStrengthMPa: 350,
    ultimateTensileStrengthMPa: 490,
    densityKgM3: 7850,
    thermalExpansionCoeff: 11.5e-6,
    colorHex: '#64748b',
  },
  'aluminum-6061': {
    name: 'Aluminium Alloy (6061-T6)',
    youngsModulusGPa: 70,
    shearModulusGPa: 26,
    bulkModulusGPa: 70,
    poissonsRatio: 0.33,
    yieldStrengthMPa: 276,
    ultimateTensileStrengthMPa: 310,
    densityKgM3: 2700,
    thermalExpansionCoeff: 23.2e-6,
    colorHex: '#cbd5e1',
  },
  copper: {
    name: 'Commercial Pure Copper (C11000)',
    youngsModulusGPa: 115,
    shearModulusGPa: 44,
    bulkModulusGPa: 135,
    poissonsRatio: 0.34,
    yieldStrengthMPa: 120,
    ultimateTensileStrengthMPa: 220,
    densityKgM3: 8940,
    thermalExpansionCoeff: 16.5e-6,
    colorHex: '#b45309',
  },
  brass: {
    name: 'High Tensile Cartridge Brass (C26000)',
    youngsModulusGPa: 100,
    shearModulusGPa: 37,
    bulkModulusGPa: 110,
    poissonsRatio: 0.35,
    yieldStrengthMPa: 150,
    ultimateTensileStrengthMPa: 380,
    densityKgM3: 8530,
    thermalExpansionCoeff: 19.9e-6,
    colorHex: '#d97706',
  },
};

export class SolidMechanicsCalculator {
  // ─── 1. UTM Tensile & Compression Material Testing ──────────────────────────
  public static calculateUtmTest(
    appliedForceKN: number,
    gaugeDiameterMm: number,
    gaugeLengthMm: number,
    materialKey: MaterialType = 'mild-steel'
  ): UtmTestResult {
    const mat = STANDARD_MATERIALS[materialKey] || STANDARD_MATERIALS['mild-steel'];
    const A0 = (Math.PI * Math.pow(gaugeDiameterMm, 2)) / 4; // mm^2
    const F_N = appliedForceKN * 1000;
    const engineeringStressMPa = F_N / A0;

    const E_MPa = mat.youngsModulusGPa * 1000;
    const sigma_y = mat.yieldStrengthMPa;
    const uts = mat.ultimateTensileStrengthMPa;

    let engineeringStrain: number;
    const isYielded = engineeringStressMPa >= sigma_y;
    const isFractured = engineeringStressMPa >= uts * 1.05;

    if (engineeringStressMPa <= sigma_y) {
      // Linear Hookean Elastic Region
      engineeringStrain = engineeringStressMPa / E_MPa;
    } else if (engineeringStressMPa <= uts) {
      // Plastic Flow & Strain Hardening
      const elasticStrain = sigma_y / E_MPa;
      const plasticRatio = (engineeringStressMPa - sigma_y) / (uts - sigma_y);
      const plasticStrain = Math.pow(plasticRatio, 1.8) * 0.18; // ~18% uniform elongation
      engineeringStrain = elasticStrain + plasticStrain;
    } else {
      // Post-UTS Necking Phase
      engineeringStrain = 0.22 + Math.min(0.08, (engineeringStressMPa - uts) * 0.002);
    }

    const elongationMm = engineeringStrain * gaugeLengthMm;
    const trueStrain = Math.log(1 + Math.max(0, engineeringStrain));
    const trueStressMPa = engineeringStressMPa * (1 + Math.max(0, engineeringStrain));

    // Modulus of Resilience = sigma_y^2 / (2 * E) [J/m^3 or kPa]
    const resilienceJouleM3 = (Math.pow(sigma_y * 1e6, 2) / (2 * mat.youngsModulusGPa * 1e9));
    // Approximate Modulus of Toughness = (sigma_y + uts) / 2 * total_elongation
    const toughnessEstMJouleM3 = ((sigma_y + uts) / 2) * 0.22;

    // Build standard 20-point constitutive stress-strain curve for visualization
    const constitutiveCurve: { strain: number; stressMPa: number }[] = [];
    const strainSteps = 25;
    const maxStrain = 0.25;

    for (let i = 0; i <= strainSteps; i++) {
      const e = (i / strainSteps) * maxStrain;
      let s: number;
      const elasticLimitStrain = sigma_y / E_MPa;

      if (e <= elasticLimitStrain) {
        s = e * E_MPa;
      } else if (e <= 0.18) {
        const pFrac = (e - elasticLimitStrain) / (0.18 - elasticLimitStrain);
        s = sigma_y + (uts - sigma_y) * Math.sin((pFrac * Math.PI) / 2);
      } else {
        const nFrac = (e - 0.18) / (maxStrain - 0.18);
        s = uts - (uts - sigma_y * 0.8) * Math.pow(nFrac, 1.4);
      }
      constitutiveCurve.push({ strain: Number(e.toFixed(4)), stressMPa: Number(s.toFixed(2)) });
    }

    return {
      appliedForceKN,
      crossSectionAreaMm2: Number(A0.toFixed(2)),
      gaugeLengthMm,
      elongationMm: Number(elongationMm.toFixed(4)),
      engineeringStressMPa: Number(engineeringStressMPa.toFixed(2)),
      engineeringStrain: Number(engineeringStrain.toFixed(6)),
      trueStressMPa: Number(trueStressMPa.toFixed(2)),
      trueStrain: Number(trueStrain.toFixed(6)),
      isYielded,
      isFractured,
      resilienceJouleM3: Number(resilienceJouleM3.toFixed(2)),
      toughnessEstMJouleM3: Number(toughnessEstMJouleM3.toFixed(2)),
      constitutiveCurve,
    };
  }

  // ─── 2. Axial Deformation & Compound Bars ───────────────────────────────────
  public static calculateAxialCompoundBar(
    totalForceKN: number,
    lengthM: number,
    material1Key: MaterialType,
    diameter1Mm: number,
    isCompound: boolean,
    material2Key: MaterialType = 'copper',
    diameter2Mm: number = 30, // outer sleeve diameter
    deltaTempC: number = 0
  ): AxialCompoundResult {
    const mat1 = STANDARD_MATERIALS[material1Key] || STANDARD_MATERIALS['mild-steel'];
    const L_mm = lengthM * 1000;
    const A1 = (Math.PI * Math.pow(diameter1Mm, 2)) / 4; // mm^2
    const E1 = mat1.youngsModulusGPa * 1000; // MPa

    if (!isCompound) {
      // Single Prismatic Member: Delta L = (P * L) / (A * E)
      const P1_N = totalForceKN * 1000;
      const elongationMm = (P1_N * L_mm) / (A1 * E1);
      const stressMPa = P1_N / A1;
      const strain = elongationMm / L_mm;
      const safetyFactor = mat1.yieldStrengthMPa / (Math.abs(stressMPa) || 0.001);

      // Thermal elongation = L * alpha * deltaT
      const thermalElongationMm = L_mm * mat1.thermalExpansionCoeff * deltaTempC;
      const thermalStressMPa = mat1.youngsModulusGPa * 1000 * mat1.thermalExpansionCoeff * deltaTempC;

      return {
        totalForceKN,
        elongationMm: Number(elongationMm.toFixed(4)),
        isCompound: false,
        bar1: {
          material: mat1.name,
          areaMm2: Number(A1.toFixed(2)),
          forceShareKN: totalForceKN,
          stressMPa: Number(stressMPa.toFixed(2)),
          strain: Number(strain.toFixed(6)),
          safetyFactor: Number(safetyFactor.toFixed(2)),
        },
        thermalStressMPa: Number(thermalStressMPa.toFixed(2)),
        thermalElongationMm: Number(thermalElongationMm.toFixed(4)),
      };
    }

    // Compound Concentric Bar (e.g. Steel core inside Copper / Brass sleeve)
    const mat2 = STANDARD_MATERIALS[material2Key] || STANDARD_MATERIALS['copper'];
    const A2 = Math.max(10, (Math.PI * (Math.pow(diameter2Mm, 2) - Math.pow(diameter1Mm, 2))) / 4);
    const E2 = mat2.youngsModulusGPa * 1000; // MPa

    // Compatibility: delta_L1 = delta_L2 = delta_L
    // P = P1 + P2 = (A1*E1 + A2*E2) * (delta_L / L)
    const equivalentAE = A1 * E1 + A2 * E2;
    const P_total_N = totalForceKN * 1000;
    const elongationMm = (P_total_N * L_mm) / equivalentAE;

    const P1_N = (A1 * E1 / equivalentAE) * P_total_N;
    const P2_N = (A2 * E2 / equivalentAE) * P_total_N;

    const stress1 = P1_N / A1;
    const stress2 = P2_N / A2;

    const sf1 = mat1.yieldStrengthMPa / (Math.abs(stress1) || 0.001);
    const sf2 = mat2.yieldStrengthMPa / (Math.abs(stress2) || 0.001);

    // Thermal differential stress in restrained compound bar:
    // delta_thermal = (alpha2 - alpha1) * deltaT * L
    // sigma_th1 = [(alpha2 - alpha1) * deltaT * E1 * E2 * A2] / (A1*E1 + A2*E2)
    const thermalStress1 =
      ((mat2.thermalExpansionCoeff - mat1.thermalExpansionCoeff) * deltaTempC * E1 * E2 * A2) / equivalentAE;
    const thermalElongationMm = (A1 * E1 * mat1.thermalExpansionCoeff + A2 * E2 * mat2.thermalExpansionCoeff) /
      equivalentAE * deltaTempC * L_mm;

    return {
      totalForceKN,
      elongationMm: Number(elongationMm.toFixed(4)),
      isCompound: true,
      bar1: {
        material: mat1.name,
        areaMm2: Number(A1.toFixed(2)),
        forceShareKN: Number((P1_N / 1000).toFixed(3)),
        stressMPa: Number(stress1.toFixed(2)),
        strain: Number((elongationMm / L_mm).toFixed(6)),
        safetyFactor: Number(sf1.toFixed(2)),
      },
      bar2: {
        material: mat2.name,
        areaMm2: Number(A2.toFixed(2)),
        forceShareKN: Number((P2_N / 1000).toFixed(3)),
        stressMPa: Number(stress2.toFixed(2)),
        strain: Number((elongationMm / L_mm).toFixed(6)),
        safetyFactor: Number(sf2.toFixed(2)),
      },
      thermalStressMPa: Number(thermalStress1.toFixed(2)),
      thermalElongationMm: Number(thermalElongationMm.toFixed(4)),
    };
  }

  // ─── 3. Shear Force & Bending Moment Diagrams (SFD & BMD) ───────────────────
  public static calculateSfdBmd(
    beamLengthM: number,
    supportType: BeamSupportType,
    pointLoads: PointLoad[],
    udls: UniformlyDistributedLoad[]
  ): SfdBmdResult {
    let R_left = 0;
    let R_right = 0;
    let M_left_fixed = 0;

    // Calculate Support Reactions via Equilibrium
    if (supportType === 'simply-supported') {
      // Sum moments about Left support (x = 0) = 0
      let sumM0 = 0;
      let sumFy = 0;

      pointLoads.forEach((p) => {
        const x = Math.min(beamLengthM, Math.max(0, p.positionM));
        sumM0 += p.magnitudeKN * x;
        sumFy += p.magnitudeKN;
      });

      udls.forEach((u) => {
        const x1 = Math.max(0, u.startM);
        const x2 = Math.min(beamLengthM, u.endM);
        if (x2 > x1) {
          const totalLoad = u.intensityKNm * (x2 - x1);
          const centroid = (x1 + x2) / 2;
          sumM0 += totalLoad * centroid;
          sumFy += totalLoad;
        }
      });

      R_right = sumM0 / beamLengthM;
      R_left = sumFy - R_right;
    } else if (supportType === 'cantilever') {
      // Fixed at Left (x = 0), free at right (x = L)
      let sumFy = 0;
      let sumM0 = 0;

      pointLoads.forEach((p) => {
        const x = Math.min(beamLengthM, Math.max(0, p.positionM));
        sumFy += p.magnitudeKN;
        sumM0 += p.magnitudeKN * x;
      });

      udls.forEach((u) => {
        const x1 = Math.max(0, u.startM);
        const x2 = Math.min(beamLengthM, u.endM);
        if (x2 > x1) {
          const totalLoad = u.intensityKNm * (x2 - x1);
          sumFy += totalLoad;
          sumM0 += totalLoad * ((x1 + x2) / 2);
        }
      });

      R_left = sumFy;
      M_left_fixed = -sumM0; // Hogging moment at fixed support
      R_right = 0;
    } else {
      // Overhanging Beam (Left support at x = 0, Right support at x = 0.75 * L)
      const supportRightX = beamLengthM * 0.75;
      let sumM0 = 0;
      let sumFy = 0;

      pointLoads.forEach((p) => {
        const x = Math.min(beamLengthM, Math.max(0, p.positionM));
        sumM0 += p.magnitudeKN * x;
        sumFy += p.magnitudeKN;
      });

      udls.forEach((u) => {
        const x1 = Math.max(0, u.startM);
        const x2 = Math.min(beamLengthM, u.endM);
        if (x2 > x1) {
          const totalLoad = u.intensityKNm * (x2 - x1);
          sumM0 += totalLoad * ((x1 + x2) / 2);
          sumFy += totalLoad;
        }
      });

      R_right = sumM0 / supportRightX;
      R_left = sumFy - R_right;
    }

    // Evaluate piecewise V(x) and M(x) along 100 stations
    const steps = 100;
    const points: { xM: number; shearForceKN: number; bendingMomentKNm: number }[] = [];
    let maxPositiveMoment = -Infinity;
    let maxPositiveMomentX = 0;
    let maxNegativeMoment = Infinity;
    let maxNegativeMomentX = 0;
    let maxShear = 0;
    const zeroShearPositions: number[] = [];

    const rightSupportX = supportType === 'overhanging' ? beamLengthM * 0.75 : beamLengthM;

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * beamLengthM;
      let Vx = 0;
      let Mx = 0;

      // Contribution of left reaction
      if (x > 0.0001) {
        Vx += R_left;
        Mx += R_left * x;
        if (supportType === 'cantilever') {
          Mx += M_left_fixed;
        }
      }

      // Contribution of right reaction
      if (supportType !== 'cantilever' && x >= rightSupportX) {
        Vx += R_right;
        Mx += R_right * (x - rightSupportX);
      }

      // Contribution of point loads
      pointLoads.forEach((p) => {
        if (x >= p.positionM) {
          Vx -= p.magnitudeKN;
          Mx -= p.magnitudeKN * (x - p.positionM);
        }
      });

      // Contribution of UDLs
      udls.forEach((u) => {
        if (x > u.startM) {
          const loadedLength = Math.min(x, u.endM) - u.startM;
          if (loadedLength > 0) {
            const load = u.intensityKNm * loadedLength;
            Vx -= load;
            Mx -= load * (x - (u.startM + loadedLength / 2));
          }
        }
      });

      const shearClean = Number(Vx.toFixed(3));
      const momentClean = Number(Mx.toFixed(3));

      if (momentClean > maxPositiveMoment) {
        maxPositiveMoment = momentClean;
        maxPositiveMomentX = Number(x.toFixed(2));
      }
      if (momentClean < maxNegativeMoment) {
        maxNegativeMoment = momentClean;
        maxNegativeMomentX = Number(x.toFixed(2));
      }
      if (Math.abs(shearClean) > maxShear) {
        maxShear = Math.abs(shearClean);
      }

      points.push({ xM: Number(x.toFixed(3)), shearForceKN: shearClean, bendingMomentKNm: momentClean });
    }

    // Identify Zero Shear crossings
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]!;
      const p2 = points[i + 1]!;
      if ((p1.shearForceKN >= 0 && p2.shearForceKN < 0) || (p1.shearForceKN <= 0 && p2.shearForceKN > 0)) {
        const zeroX = p1.xM + (p2.xM - p1.xM) * (Math.abs(p1.shearForceKN) / (Math.abs(p1.shearForceKN) + Math.abs(p2.shearForceKN) || 1));
        zeroShearPositions.push(Number(zeroX.toFixed(2)));
      }
    }

    // Points of contraflexure (M = 0)
    const pointsOfContraflexure: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]!;
      const p2 = points[i + 1]!;
      if ((p1.bendingMomentKNm > 0 && p2.bendingMomentKNm < 0) || (p1.bendingMomentKNm < 0 && p2.bendingMomentKNm > 0)) {
        const contraX = p1.xM + (p2.xM - p1.xM) * (Math.abs(p1.bendingMomentKNm) / (Math.abs(p1.bendingMomentKNm) + Math.abs(p2.bendingMomentKNm) || 1));
        pointsOfContraflexure.push(Number(contraX.toFixed(2)));
      }
    }

    return {
      beamLengthM,
      supportType,
      reactionLeftKN: Number(R_left.toFixed(2)),
      reactionRightKN: Number(R_right.toFixed(2)),
      reactionMomentLeftKNm: supportType === 'cantilever' ? Number(M_left_fixed.toFixed(2)) : undefined,
      points,
      maxPositiveMomentKNm: Number(maxPositiveMoment.toFixed(2)),
      maxPositiveMomentXM: maxPositiveMomentX,
      maxNegativeMomentKNm: Number(maxNegativeMoment.toFixed(2)),
      maxNegativeMomentXM: maxNegativeMomentX,
      maxShearForceKN: Number(maxShear.toFixed(2)),
      zeroShearPositionsM: zeroShearPositions,
      pointsOfContraflexureM: pointsOfContraflexure,
    };
  }

  // ─── 4. Beam Bending Stress & Elastic Deflection ─────────────────────────────
  public static calculateBeamBending(
    beamLengthM: number,
    supportType: BeamSupportType,
    crossSectionType: BeamCrossSectionType,
    bMm: number,
    hMm: number,
    loadKN: number,
    isUDL: boolean = false,
    materialKey: MaterialType = 'structural-steel'
  ): BeamBendingResult {
    const mat = STANDARD_MATERIALS[materialKey] || STANDARD_MATERIALS['structural-steel'];
    const E_MPa = mat.youngsModulusGPa * 1000;

    let areaMm2: number;
    let I_xx: number; // mm^4
    let sectionModulusZ: number; // mm^3
    let y_max: number;

    if (crossSectionType === 'circular') {
      const D = bMm;
      areaMm2 = (Math.PI * Math.pow(D, 2)) / 4;
      I_xx = (Math.PI * Math.pow(D, 4)) / 64;
      y_max = D / 2;
      sectionModulusZ = I_xx / y_max;
    } else {
      // Rectangular cross section b x h
      areaMm2 = bMm * hMm;
      I_xx = (bMm * Math.pow(hMm, 3)) / 12;
      y_max = hMm / 2;
      sectionModulusZ = (bMm * Math.pow(hMm, 2)) / 6;
    }

    const L_mm = beamLengthM * 1000;
    const P_N = loadKN * 1000;
    let maxMomentKNm = 0;
    let maxDeflectionMm = 0;
    let maxDeflectionXM = beamLengthM / 2;

    // Deflection curve along 50 stations
    const stations = 50;
    const deflectionCurve: { xM: number; deflectionMm: number }[] = [];

    if (supportType === 'simply-supported') {
      if (!isUDL) {
        // Center point load: M_max = P*L/4, delta_max = P*L^3 / (48*E*I)
        maxMomentKNm = (loadKN * beamLengthM) / 4;
        maxDeflectionMm = (P_N * Math.pow(L_mm, 3)) / (48 * E_MPa * I_xx);
        maxDeflectionXM = beamLengthM / 2;

        for (let i = 0; i <= stations; i++) {
          const x = (i / stations) * beamLengthM;
          const x_mm = x * 1000;
          let d: number;
          if (x <= beamLengthM / 2) {
            d = (P_N * x_mm * (3 * Math.pow(L_mm, 2) - 4 * Math.pow(x_mm, 2))) / (48 * E_MPa * I_xx);
          } else {
            const x_sym = L_mm - x_mm;
            d = (P_N * x_sym * (3 * Math.pow(L_mm, 2) - 4 * Math.pow(x_sym, 2))) / (48 * E_MPa * I_xx);
          }
          deflectionCurve.push({ xM: Number(x.toFixed(2)), deflectionMm: Number(d.toFixed(4)) });
        }
      } else {
        // Uniformly Distributed Load w = loadKN (total load) / L
        const w_N_per_mm = P_N / L_mm;
        maxMomentKNm = (loadKN * beamLengthM) / 8;
        maxDeflectionMm = (5 * w_N_per_mm * Math.pow(L_mm, 4)) / (384 * E_MPa * I_xx);
        maxDeflectionXM = beamLengthM / 2;

        for (let i = 0; i <= stations; i++) {
          const x = (i / stations) * beamLengthM;
          const x_mm = x * 1000;
          const d =
            (w_N_per_mm * x_mm * (Math.pow(L_mm, 3) - 2 * L_mm * Math.pow(x_mm, 2) + Math.pow(x_mm, 3))) /
            (24 * E_MPa * I_xx);
          deflectionCurve.push({ xM: Number(x.toFixed(2)), deflectionMm: Number(d.toFixed(4)) });
        }
      }
    } else {
      // Cantilever beam
      if (!isUDL) {
        // Tip Point Load: M_max = P*L, delta_max = P*L^3 / (3*E*I)
        maxMomentKNm = loadKN * beamLengthM;
        maxDeflectionMm = (P_N * Math.pow(L_mm, 3)) / (3 * E_MPa * I_xx);
        maxDeflectionXM = beamLengthM;

        for (let i = 0; i <= stations; i++) {
          const x = (i / stations) * beamLengthM;
          const x_mm = x * 1000;
          const d = (P_N * Math.pow(x_mm, 2) * (3 * L_mm - x_mm)) / (6 * E_MPa * I_xx);
          deflectionCurve.push({ xM: Number(x.toFixed(2)), deflectionMm: Number(d.toFixed(4)) });
        }
      } else {
        // Cantilever with UDL: M_max = w*L^2 / 2, delta_max = w*L^4 / (8*E*I)
        const w_N_per_mm = P_N / L_mm;
        maxMomentKNm = (loadKN * beamLengthM) / 2;
        maxDeflectionMm = (w_N_per_mm * Math.pow(L_mm, 4)) / (8 * E_MPa * I_xx);
        maxDeflectionXM = beamLengthM;

        for (let i = 0; i <= stations; i++) {
          const x = (i / stations) * beamLengthM;
          const x_mm = x * 1000;
          const d =
            (w_N_per_mm * Math.pow(x_mm, 2) * (6 * Math.pow(L_mm, 2) - 4 * L_mm * x_mm + Math.pow(x_mm, 2))) /
            (24 * E_MPa * I_xx);
          deflectionCurve.push({ xM: Number(x.toFixed(2)), deflectionMm: Number(d.toFixed(4)) });
        }
      }
    }

    // Bending Stress: sigma_b = M * y / I = M / Z
    const maxBendingStressMPa = (maxMomentKNm * 1e6) / sectionModulusZ;

    // Transverse Shear Stress: tau_max = 1.5 * V / A (rectangular) or 4/3 * V / A (circular)
    const shearForceN = supportType === 'simply-supported' ? P_N / 2 : P_N;
    const maxTransverseShearStressMPa =
      crossSectionType === 'circular'
        ? (4 / 3) * (shearForceN / areaMm2)
        : 1.5 * (shearForceN / areaMm2);

    // Cross section stress distributions from -y_max to +y_max
    const bendingStressDistribution: { yMm: number; stressMPa: number }[] = [];
    const shearStressDistribution: { yMm: number; shearStressMPa: number }[] = [];
    const ySteps = 10;

    for (let i = -ySteps; i <= ySteps; i++) {
      const y = (i / ySteps) * y_max;
      // Bending stress linear: -sigma_max at top (compression), +sigma_max at bottom (tension)
      const sigma = (y / y_max) * maxBendingStressMPa;
      bendingStressDistribution.push({ yMm: Number(y.toFixed(2)), stressMPa: Number(sigma.toFixed(2)) });

      // Transverse shear stress parabolic: peaks at neutral axis (y = 0)
      const tau = maxTransverseShearStressMPa * (1 - Math.pow(y / y_max, 2));
      shearStressDistribution.push({ yMm: Number(y.toFixed(2)), shearStressMPa: Number(tau.toFixed(2)) });
    }

    // Serviceability limit per IS 456 / IS 800: L / 250
    const allowableDeflectionLimitMm = L_mm / 250;
    const isDeflectionServiceable = maxDeflectionMm <= allowableDeflectionLimitMm;

    return {
      beamLengthM,
      crossSectionType,
      bMm,
      hMm,
      areaMm2: Number(areaMm2.toFixed(2)),
      secondMomentOfAreaMm4: Number(I_xx.toFixed(2)),
      sectionModulusMm3: Number(sectionModulusZ.toFixed(2)),
      maxBendingMomentKNm: Number(maxMomentKNm.toFixed(2)),
      maxBendingStressMPa: Number(maxBendingStressMPa.toFixed(2)),
      maxTransverseShearStressMPa: Number(maxTransverseShearStressMPa.toFixed(2)),
      bendingStressDistribution,
      shearStressDistribution,
      maxDeflectionMm: Number(maxDeflectionMm.toFixed(4)),
      maxDeflectionXM: Number(maxDeflectionXM.toFixed(2)),
      deflectionCurve,
      allowableDeflectionLimitMm: Number(allowableDeflectionLimitMm.toFixed(2)),
      isDeflectionServiceable,
    };
  }

  // ─── 5. Torsion of Circular Shafts (Solid & Hollow) ─────────────────────────
  public static calculateTorsionShaft(
    appliedTorqueNm: number,
    shaftLengthM: number,
    outerDiameterMm: number,
    isHollow: boolean,
    innerDiameterMm: number = 0,
    materialKey: MaterialType = 'mild-steel'
  ): TorsionShaftResult {
    const mat = STANDARD_MATERIALS[materialKey] || STANDARD_MATERIALS['mild-steel'];
    const G_MPa = mat.shearModulusGPa * 1000;
    const D = outerDiameterMm;
    const d = isHollow ? Math.min(D - 2, Math.max(1, innerDiameterMm)) : 0;

    // Polar second moment of area J:
    // Solid: J = pi * D^4 / 32
    // Hollow: J = pi * (D^4 - d^4) / 32
    const J_mm4 = isHollow
      ? (Math.PI * (Math.pow(D, 4) - Math.pow(d, 4))) / 32
      : (Math.PI * Math.pow(D, 4)) / 32;

    const R_max = D / 2;
    const Z_p = J_mm4 / R_max; // Polar section modulus

    // Torsion formula: T / J = tau / r = G * theta / L
    // tau_max = (T * R_max) / J
    const T_Nmm = appliedTorqueNm * 1000;
    const maxShearStressMPa = (T_Nmm * R_max) / J_mm4;

    const L_mm = shaftLengthM * 1000;
    const angleOfTwistRad = (T_Nmm * L_mm) / (G_MPa * J_mm4);
    const angleOfTwistDeg = (angleOfTwistRad * 180) / Math.PI;

    // Torsional stiffness k_t = T / theta = (G * J) / L  [N*m / rad]
    const torsionalStiffnessNmPerRad = (G_MPa * 1e6 * (J_mm4 * 1e-12)) / shaftLengthM;

    // Weight savings percentage compared to solid shaft of same outer diameter
    let weightSavingsPercentage: number | undefined;
    if (isHollow && d > 0) {
      weightSavingsPercentage = (Math.pow(d, 2) / Math.pow(D, 2)) * 100;
    }

    // Radial stress profile
    const radialStressProfile: { radiusMm: number; shearStressMPa: number }[] = [];
    const steps = 10;
    const rStart = isHollow ? d / 2 : 0;

    for (let i = 0; i <= steps; i++) {
      const r = rStart + (i / steps) * (R_max - rStart);
      const tau = (r / R_max) * maxShearStressMPa;
      radialStressProfile.push({ radiusMm: Number(r.toFixed(2)), shearStressMPa: Number(tau.toFixed(2)) });
    }

    return {
      appliedTorqueNm,
      shaftLengthM,
      isHollow,
      outerDiameterMm: D,
      innerDiameterMm: d,
      polarSecondMomentMm4: Number(J_mm4.toFixed(2)),
      polarSectionModulusMm3: Number(Z_p.toFixed(2)),
      maxShearStressMPa: Number(maxShearStressMPa.toFixed(2)),
      angleOfTwistRad: Number(angleOfTwistRad.toFixed(6)),
      angleOfTwistDeg: Number(angleOfTwistDeg.toFixed(4)),
      torsionalStiffnessNmPerRad: Number(torsionalStiffnessNmPerRad.toFixed(2)),
      weightSavingsPercentage: weightSavingsPercentage ? Number(weightSavingsPercentage.toFixed(2)) : undefined,
      radialStressProfile,
    };
  }

  // ─── 6. Columns Buckling & Thin Cylinders ───────────────────────────────────
  public static calculateColumnCylinder(
    columnLengthM: number,
    columnDiameterMm: number,
    endCondition: ColumnEndCondition,
    internalPressureMPa: number,
    cylinderDiameterMm: number,
    wallThicknessMm: number,
    materialKey: MaterialType = 'mild-steel'
  ): ColumnCylinderResult {
    const mat = STANDARD_MATERIALS[materialKey] || STANDARD_MATERIALS['mild-steel'];
    const E_MPa = mat.youngsModulusGPa * 1000;
    const sigma_y = mat.yieldStrengthMPa;

    // Column Cross-Section Properties (Solid circular column)
    const D_col = columnDiameterMm;
    const A_col = (Math.PI * Math.pow(D_col, 2)) / 4; // mm^2
    const I_col = (Math.PI * Math.pow(D_col, 4)) / 64; // mm^4
    const radiusOfGyration = Math.sqrt(I_col / A_col); // k = D / 4

    // Effective length Le per IS 800:
    let effectiveLengthRatio: number;
    switch (endCondition) {
      case 'both-fixed':
        effectiveLengthRatio = 0.5;
        break;
      case 'one-fixed-one-pinned':
        effectiveLengthRatio = 0.707;
        break;
      case 'one-fixed-one-free':
        effectiveLengthRatio = 2.0;
        break;
      case 'both-pinned':
      default:
        effectiveLengthRatio = 1.0;
        break;
    }

    const effectiveLengthM = columnLengthM * effectiveLengthRatio;
    const Le_mm = effectiveLengthM * 1000;
    const slendernessRatio = Le_mm / radiusOfGyration;

    // Euler's Critical Buckling Load: P_cr = (pi^2 * E * I) / Le^2 [N]
    const P_cr_N = (Math.pow(Math.PI, 2) * E_MPa * I_col) / Math.pow(Le_mm, 2);
    const eulerBucklingLoadKN = P_cr_N / 1000;
    const eulerBucklingStressMPa = P_cr_N / A_col;

    // Rankine-Gordon Load: P_R = (sigma_c * A) / [1 + a * (Le/k)^2]
    // Rankine constant a for steel ~ 1 / 7500
    const rankineConstant_a = 1 / 7500;
    const P_R_N = (sigma_y * A_col) / (1 + rankineConstant_a * Math.pow(slendernessRatio, 2));
    const rankineBucklingLoadKN = P_R_N / 1000;
    const safeWorkingLoadKN = rankineBucklingLoadKN / 2.5; // Factor of Safety = 2.5

    // Buckling mode shape (half sine wave or fixed boundary)
    const bucklingModeShape: { xM: number; relativeAmplitude: number }[] = [];
    const modeSteps = 20;
    for (let i = 0; i <= modeSteps; i++) {
      const x = (i / modeSteps) * columnLengthM;
      let amp: number;
      if (endCondition === 'both-pinned') {
        amp = Math.sin((Math.PI * x) / columnLengthM);
      } else if (endCondition === 'both-fixed') {
        amp = 0.5 * (1 - Math.cos((2 * Math.PI * x) / columnLengthM));
      } else if (endCondition === 'one-fixed-one-free') {
        amp = 1 - Math.cos((Math.PI * x) / (2 * columnLengthM));
      } else {
        amp = Math.sin((Math.PI * x) / columnLengthM) * (x / columnLengthM);
      }
      bucklingModeShape.push({ xM: Number(x.toFixed(2)), relativeAmplitude: Number(amp.toFixed(4)) });
    }

    // ── Thin Cylindrical Shell Analysis ──
    const D_cyl = cylinderDiameterMm;
    const t = wallThicknessMm;
    const isThinShell = D_cyl / t >= 20;

    // Circumferential / Hoop Stress: sigma_h = (p * D) / (2 * t)
    const hoopStressMPa = (internalPressureMPa * D_cyl) / (2 * t);

    // Longitudinal Stress: sigma_L = (p * D) / (4 * t)
    const longitudinalStressMPa = (internalPressureMPa * D_cyl) / (4 * t);

    // Maximum In-Plane Shear Stress: tau_max = (sigma_h - sigma_L) / 2 = (p * D) / (8 * t)
    const maxInPlaneShearStressMPa = (hoopStressMPa - longitudinalStressMPa) / 2;

    // Volumetric Strain: epsilon_v = (p * D) / (4 * t * E) * (5 - 4*nu)
    const nu = mat.poissonsRatio;
    const volumetricStrain = ((internalPressureMPa * D_cyl) / (4 * t * E_MPa)) * (5 - 4 * nu);
    const circumferentialStrain = (1 / E_MPa) * (hoopStressMPa - nu * longitudinalStressMPa);
    const longitudinalStrain = (1 / E_MPa) * (longitudinalStressMPa - nu * hoopStressMPa);

    return {
      columnLengthM,
      effectiveLengthM: Number(effectiveLengthM.toFixed(3)),
      endCondition,
      radiusOfGyrationMm: Number(radiusOfGyration.toFixed(2)),
      slendernessRatio: Number(slendernessRatio.toFixed(2)),
      eulerBucklingLoadKN: Number(eulerBucklingLoadKN.toFixed(2)),
      eulerBucklingStressMPa: Number(eulerBucklingStressMPa.toFixed(2)),
      rankineBucklingLoadKN: Number(rankineBucklingLoadKN.toFixed(2)),
      safeWorkingLoadKN: Number(safeWorkingLoadKN.toFixed(2)),
      bucklingModeShape,

      internalPressureMPa,
      cylinderDiameterMm: D_cyl,
      wallThicknessMm: t,
      isThinShell,
      hoopStressMPa: Number(hoopStressMPa.toFixed(2)),
      longitudinalStressMPa: Number(longitudinalStressMPa.toFixed(2)),
      maxInPlaneShearStressMPa: Number(maxInPlaneShearStressMPa.toFixed(2)),
      volumetricStrainMicro: Number((volumetricStrain * 1e6).toFixed(2)),
      circumferentialStrainMicro: Number((circumferentialStrain * 1e6).toFixed(2)),
      longitudinalStrainMicro: Number((longitudinalStrain * 1e6).toFixed(2)),
    };
  }
}
