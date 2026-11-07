/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Course: U25CE404 — Geotechnical Engineering I (Civil Engineering, Semester IV)
 * Core Engineering Mathematics & Scientific Calculations Engine
 * 
 * Complies with IS 2720, IS 1498, and Terzaghi/Darcy soil mechanics standards.
 */

import type {
  ISoilLayer,
  IStressProfilePoint,
  ISieveData,
  IClassificationResult,
  ICompactionTrial,
  ICompactionResult,
  IPermeabilityParams,
  IPermeabilityResult,
  IConsolidationParams,
  IConsolidationStageResult,
  IShearStrengthParams,
  IShearStrengthResult,
} from './types';

export class GeotechnicalCalculator {
  // Density of water: 9.81 kN/m³, 1.00 g/cm³, 1000 kg/m³
  public static readonly GAMMA_W = 9.81; // kN/m³
  public static readonly RHO_W_G_CM3 = 1.0; // g/cm³

  // ─────────────────────────────────────────────────────────────
  // 1. PHASE RELATIONSHIPS & STRATIGRAPHY
  // ─────────────────────────────────────────────────────────────

  /**
   * Calculates void ratio from porosity: e = n / (1 - n)
   */
  public static voidRatioFromPorosity(n: number): number {
    if (n >= 1 || n < 0) throw new Error('Porosity must be between 0 and 1');
    return n / (1 - n);
  }

  /**
   * Calculates porosity from void ratio: n = e / (1 + e)
   */
  public static porosityFromVoidRatio(e: number): number {
    if (e < 0) throw new Error('Void ratio cannot be negative');
    return e / (1 + e);
  }

  /**
   * Degree of saturation: Sr = (w * Gs) / e
   */
  public static degreeOfSaturation(w: number, Gs: number, e: number): number {
    if (e <= 0) return 0;
    const Sr = (w * Gs) / e;
    return Math.min(1.0, Math.max(0.0, Sr));
  }

  /**
   * Bulk unit weight: γ = [(Gs + Sr * e) / (1 + e)] * γw
   */
  public static bulkUnitWeight(Gs: number, e: number, w: number, gammaW = GeotechnicalCalculator.GAMMA_W): number {
    const Sr = GeotechnicalCalculator.degreeOfSaturation(w, Gs, e);
    return ((Gs + Sr * e) / (1 + e)) * gammaW;
  }

  /**
   * Dry unit weight: γd = [Gs / (1 + e)] * γw = γ / (1 + w)
   */
  public static dryUnitWeight(Gs: number, e: number, gammaW = GeotechnicalCalculator.GAMMA_W): number {
    return (Gs / (1 + e)) * gammaW;
  }

  /**
   * Saturated unit weight: γsat = [(Gs + e) / (1 + e)] * γw
   */
  public static saturatedUnitWeight(Gs: number, e: number, gammaW = GeotechnicalCalculator.GAMMA_W): number {
    return ((Gs + e) / (1 + e)) * gammaW;
  }

  /**
   * Submerged (buoyant) unit weight: γ' = γsat - γw = [(Gs - 1) / (1 + e)] * γw
   */
  public static submergedUnitWeight(Gs: number, e: number, gammaW = GeotechnicalCalculator.GAMMA_W): number {
    return ((Gs - 1) / (1 + e)) * gammaW;
  }

  /**
   * Calculates total vertical stress, pore water pressure, and effective stress profile
   * σ(z) = Σ γ_i * Δz_i
   * u(z) = γw * max(0, z - z_wt)
   * σ'(z) = σ(z) - u(z)
   */
  public static calculateStressProfile(
    layers: ISoilLayer[],
    waterTableDepth: number,
    targetDepth: number
  ): { totalStress: number; poreWaterPressure: number; effectiveStress: number; points: IStressProfilePoint[] } {
    let accumulatedTotalStress = 0;
    const points: IStressProfilePoint[] = [];

    // Sort layers by depthTop
    const sortedLayers = [...layers].sort((a, b) => a.depthTop - b.depthTop);

    // Initial point at ground surface
    points.push({
      depth: 0,
      totalStress: 0,
      poreWaterPressure: 0,
      effectiveStress: 0,
      layerName: sortedLayers[0]?.name || 'Ground Surface',
    });

    const depthsToEvaluate = new Set<number>([0, waterTableDepth, targetDepth]);
    for (const lyr of sortedLayers) {
      depthsToEvaluate.add(lyr.depthTop);
      depthsToEvaluate.add(lyr.depthBottom);
    }
    const evalDepths = Array.from(depthsToEvaluate)
      .filter((d) => d <= targetDepth)
      .sort((a, b) => a - b);

    let prevD = 0;
    for (const d of evalDepths) {
      if (d > prevD) {
        const segLen = d - prevD;
        const midD = (d + prevD) / 2;
        const activeLayer = sortedLayers.find((l) => midD >= l.depthTop && midD <= l.depthBottom) || sortedLayers[sortedLayers.length - 1];

        // Is this segment below the water table?
        const isBelowWt = midD > waterTableDepth;
        const unitWeight = isBelowWt ? (activeLayer?.saturatedDensity || 20) : (activeLayer?.bulkDensity || 18);
        accumulatedTotalStress += unitWeight * segLen;

        const u = d > waterTableDepth ? (d - waterTableDepth) * GeotechnicalCalculator.GAMMA_W : 0;
        const sigmaPrime = Math.max(0, accumulatedTotalStress - u);

        points.push({
          depth: Number(d.toFixed(2)),
          totalStress: Number(accumulatedTotalStress.toFixed(2)),
          poreWaterPressure: Number(u.toFixed(2)),
          effectiveStress: Number(sigmaPrime.toFixed(2)),
          layerName: activeLayer?.name || 'Soil Layer',
        });
        prevD = d;
      }
    }

    const last = points[points.length - 1] || { totalStress: 0, poreWaterPressure: 0, effectiveStress: 0 };
    return {
      totalStress: last.totalStress,
      poreWaterPressure: last.poreWaterPressure,
      effectiveStress: last.effectiveStress,
      points,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SOIL CLASSIFICATION & GRAIN SIZE (IS 1498 / IS 2720 Part 4)
  // ─────────────────────────────────────────────────────────────

  /**
   * Computes cumulative percentage passing and gradation parameters
   */
  public static calculateSieveAnalysis(
    rawSieves: { sieveSizeMm: number; sieveName: string; massRetainedG: number }[],
    liquidLimit = 0,
    plasticLimit = 0
  ): IClassificationResult {
    const totalMass = rawSieves.reduce((sum, s) => sum + s.massRetainedG, 0);
    if (totalMass <= 0) throw new Error('Total sample mass must be greater than zero');

    let cumulativeRetained = 0;
    const computedSieves: ISieveData[] = rawSieves.map((s) => {
      const percentRetained = (s.massRetainedG / totalMass) * 100;
      cumulativeRetained += percentRetained;
      const percentPassing = Math.max(0, 100 - cumulativeRetained);
      return {
        sieveSizeMm: s.sieveSizeMm,
        sieveName: s.sieveName,
        massRetainedG: Number(s.massRetainedG.toFixed(2)),
        percentRetained: Number(percentRetained.toFixed(2)),
        cumulativeRetained: Number(cumulativeRetained.toFixed(2)),
        percentPassing: Number(percentPassing.toFixed(2)),
      };
    });

    // Interpolation for D10, D30, D60 on semi-log scale
    const sorted = [...computedSieves].sort((a, b) => b.sieveSizeMm - a.sieveSizeMm);
    const interpolateDiameter = (targetPercent: number): number => {
      for (let i = 0; i < sorted.length - 1; i++) {
        const curr = sorted[i]!;
        const next = sorted[i + 1]!;
        if (curr.percentPassing >= targetPercent && next.percentPassing <= targetPercent) {
          if (curr.percentPassing === next.percentPassing) return curr.sieveSizeMm;
          const logD1 = Math.log10(Math.max(0.001, curr.sieveSizeMm));
          const logD2 = Math.log10(Math.max(0.001, next.sieveSizeMm));
          const fraction = (targetPercent - next.percentPassing) / (curr.percentPassing - next.percentPassing);
          const targetLogD = logD2 + fraction * (logD1 - logD2);
          return Math.pow(10, targetLogD);
        }
      }
      return sorted[sorted.length - 1]?.sieveSizeMm || 0.075;
    };

    const d10 = Number(interpolateDiameter(10).toFixed(4));
    const d30 = Number(interpolateDiameter(30).toFixed(4));
    const d60 = Number(interpolateDiameter(60).toFixed(4));

    const cu = d10 > 0 ? Number((d60 / d10).toFixed(2)) : 1.0;
    const cc = d10 > 0 && d60 > 0 ? Number(((d30 * d30) / (d10 * d60)).toFixed(2)) : 1.0;

    const plasticityIndex = Math.max(0, liquidLimit - plasticLimit);
    const aLineIp = Number((0.73 * (liquidLimit - 20)).toFixed(2));

    // IS 1498 Classification Logic
    // Find passing 75 micron (0.075 mm)
    const sieve75u = computedSieves.find((s) => s.sieveSizeMm <= 0.075);
    const finesFraction = sieve75u ? sieve75u.percentPassing : 0;
    const sieve475 = computedSieves.find((s) => s.sieveSizeMm === 4.75);
    const gravelFraction = sieve475 ? 100 - sieve475.percentPassing : 0;
    const sandFraction = Math.max(0, 100 - finesFraction - gravelFraction);

    let isClassification = 'SP';
    let description = 'Poorly graded sand';

    if (finesFraction >= 50) {
      // Fine-grained soil
      let plasticityCode = 'L';
      if (liquidLimit > 50) plasticityCode = 'H';
      else if (liquidLimit >= 35) plasticityCode = 'I';

      if (plasticityIndex > aLineIp && plasticityIndex > 4) {
        isClassification = `C${plasticityCode}`;
        description = `Inorganic Clay of ${plasticityCode === 'H' ? 'High' : plasticityCode === 'I' ? 'Intermediate' : 'Low'} Plasticity`;
      } else {
        isClassification = `M${plasticityCode}`;
        description = `Inorganic Silt of ${plasticityCode === 'H' ? 'High' : plasticityCode === 'I' ? 'Intermediate' : 'Low'} Plasticity`;
      }
    } else {
      // Coarse-grained soil
      if (gravelFraction > sandFraction) {
        // Gravel
        if (finesFraction < 5) {
          isClassification = cu >= 4 && cc >= 1 && cc <= 3 ? 'GW' : 'GP';
          description = isClassification === 'GW' ? 'Well-graded gravel' : 'Poorly graded gravel';
        } else if (finesFraction > 12) {
          isClassification = plasticityIndex > aLineIp ? 'GC' : 'GM';
          description = isClassification === 'GC' ? 'Clayey gravel' : 'Silty gravel';
        } else {
          isClassification = 'GW-GC';
          description = 'Well-graded gravel with clay';
        }
      } else {
        // Sand
        if (finesFraction < 5) {
          isClassification = cu >= 6 && cc >= 1 && cc <= 3 ? 'SW' : 'SP';
          description = isClassification === 'SW' ? 'Well-graded sand' : 'Poorly graded sand';
        } else if (finesFraction > 12) {
          isClassification = plasticityIndex > aLineIp ? 'SC' : 'SM';
          description = isClassification === 'SC' ? 'Clayey sand' : 'Silty sand';
        } else {
          isClassification = 'SW-SM';
          description = 'Well-graded sand with silt';
        }
      }
    }

    return {
      totalMassG: Number(totalMass.toFixed(2)),
      sieves: computedSieves,
      d10,
      d30,
      d60,
      cu,
      cc,
      liquidLimit,
      plasticLimit,
      plasticityIndex,
      aLineIp,
      isClassification,
      description,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PROCTOR COMPACTION (IS 2720 Part 7)
  // ─────────────────────────────────────────────────────────────

  /**
   * Computes wet density, dry density, Zero Air Voids line, and parabolic fit for OMC / MDD
   */
  public static calculateCompaction(
    trials: { waterContentPercent: number; mouldMassG: number; mouldPlusWetSoilG: number; mouldVolumeCm3: number }[],
    specificGravity = 2.65
  ): ICompactionResult {
    const computedTrials: ICompactionTrial[] = trials.map((t, idx) => {
      const wetSoilMassG = t.mouldPlusWetSoilG - t.mouldMassG;
      const wetDensity = wetSoilMassG / t.mouldVolumeCm3;
      const wDec = t.waterContentPercent / 100;
      const dryDensity = wetDensity / (1 + wDec);
      // Zero Air Voids density: ρzav = (Gs * ρw) / (1 + w * Gs)
      const zavDensity = (specificGravity * GeotechnicalCalculator.RHO_W_G_CM3) / (1 + wDec * specificGravity);

      return {
        trialNumber: idx + 1,
        waterContentPercent: Number(t.waterContentPercent.toFixed(2)),
        mouldMassG: t.mouldMassG,
        mouldPlusWetSoilG: t.mouldPlusWetSoilG,
        wetSoilMassG: Number(wetSoilMassG.toFixed(1)),
        mouldVolumeCm3: t.mouldVolumeCm3,
        wetDensityGcm3: Number(wetDensity.toFixed(3)),
        dryDensityGcm3: Number(dryDensity.toFixed(3)),
        zavDensityGcm3: Number(zavDensity.toFixed(3)),
      };
    });

    // Parabolic regression fitting ρd = a * w² + b * w + c
    let omcPercent = 14.0;
    let mddGcm3 = 1.85;

    if (computedTrials.length >= 3) {
      const n = computedTrials.length;
      let sumW = 0, sumW2 = 0, sumW3 = 0, sumW4 = 0;
      let sumY = 0, sumWY = 0, sumW2Y = 0;

      for (const t of computedTrials) {
        const w = t.waterContentPercent;
        const y = t.dryDensityGcm3;
        sumW += w;
        sumW2 += w * w;
        sumW3 += w * w * w;
        sumW4 += w * w * w * w;
        sumY += y;
        sumWY += w * y;
        sumW2Y += w * w * y;
      }

      // 3x3 linear system solve via Cramer's rule for [sumW4 sumW3 sumW2; sumW3 sumW2 sumW; sumW2 sumW n] * [a; b; c] = [sumW2Y; sumWY; sumY]
      const det =
        sumW4 * (sumW2 * n - sumW * sumW) -
        sumW3 * (sumW3 * n - sumW * sumW2) +
        sumW2 * (sumW3 * sumW - sumW2 * sumW2);

      if (Math.abs(det) > 1e-6) {
        const detA =
          sumW2Y * (sumW2 * n - sumW * sumW) -
          sumW3 * (sumWY * n - sumW * sumY) +
          sumW2 * (sumWY * sumW - sumW2 * sumY);

        const detB =
          sumW4 * (sumWY * n - sumW * sumY) -
          sumW2Y * (sumW3 * n - sumW * sumW2) +
          sumW2 * (sumW3 * sumY - sumWY * sumW2);

        const a = detA / det;
        const b = detB / det;

        if (a < 0) {
          // Downward opening parabola
          const calculatedOmc = -b / (2 * a);
          if (calculatedOmc > 4 && calculatedOmc < 35) {
            omcPercent = calculatedOmc;
            const detC =
              sumW4 * (sumW2 * sumY - sumWY * sumW) -
              sumW3 * (sumW3 * sumY - sumWY * sumW2) +
              sumW2Y * (sumW3 * sumW - sumW2 * sumW2);
            const c = detC / det;
            mddGcm3 = a * omcPercent * omcPercent + b * omcPercent + c;
          }
        }
      }
    }

    // Standard Proctor compaction energy: 2.6 kg rammer, 310 mm drop, 25 blows * 3 layers, 1000 cm³ mould
    // E = (25 * 3 * 2.6 kg * 9.81 m/s² * 0.310 m) / (1000 * 10^-6 m³) = 593 kJ/m³
    const compactionEnergy = 593000;

    return {
      trials: computedTrials,
      omcPercent: Number(omcPercent.toFixed(2)),
      mddGcm3: Number(mddGcm3.toFixed(3)),
      specificGravity,
      compactionEnergyJoulesPerM3: compactionEnergy,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. PERMEABILITY (IS 2720 Part 17 / Part 36)
  // ─────────────────────────────────────────────────────────────

  /**
   * Computes coefficient of permeability k for constant head or falling head
   * Constant head: k = (Q * L) / (A * h * t)
   * Falling head: k = (a * L) / (A * t) * ln(h1 / h2)
   */
  public static calculatePermeability(params: IPermeabilityParams): IPermeabilityResult {
    const areaA = (Math.PI / 4) * Math.pow(params.diameterMm / 10, 2); // cm²
    const lengthL = params.lengthMm / 10; // cm

    let kCmPerSec = 0;
    let hydraulicGradient = 0;
    let dischargeRate = 0;

    if (params.testType === 'constant-head') {
      const headH = params.headDifferenceMm / 10; // cm
      if (headH <= 0 || params.durationSeconds <= 0 || areaA <= 0 || lengthL <= 0) {
        throw new Error('Invalid geometry or parameters for constant head test');
      }
      hydraulicGradient = headH / lengthL;
      dischargeRate = params.collectedVolumeMl / params.durationSeconds; // cm³/s
      kCmPerSec = (params.collectedVolumeMl * lengthL) / (areaA * headH * params.durationSeconds);
    } else {
      // Falling head
      const standpipeA = (Math.PI / 4) * Math.pow(params.standpipeDiameterMm / 10, 2); // cm²
      const h1 = params.initialHeadH1Mm / 10; // cm
      const h2 = params.finalHeadH2Mm / 10; // cm
      if (h1 <= h2 || h2 <= 0 || params.fallingDurationSeconds <= 0) {
        throw new Error('Initial head must exceed final head, and duration must be positive');
      }
      hydraulicGradient = ((h1 + h2) / 2) / lengthL;
      kCmPerSec = ((standpipeA * lengthL) / (areaA * params.fallingDurationSeconds)) * Math.log(h1 / h2);
      dischargeRate = standpipeA * (h1 - h2) / params.fallingDurationSeconds;
    }

    // Temperature correction to standard 27°C per IS 2720
    // Dynamic viscosity ratio μT / μ27
    const tempT = params.waterTempCelsius;
    const muRatio = 1.0 / (0.0214 * (tempT - 27) + 1.0); // empirical ratio
    const k27 = kCmPerSec * muRatio;

    const flowVelocity = dischargeRate / areaA; // cm/s (discharge velocity v = k * i)
    const voidRatioEstimate = params.soilType === 'sand' ? 0.65 : 0.85;
    const porosityN = voidRatioEstimate / (1 + voidRatioEstimate);
    const seepageVelocity = flowVelocity / porosityN; // vs = v / n

    return {
      hydraulicConductivityK: Number(kCmPerSec.toExponential(4)),
      hydraulicConductivityMps: Number((kCmPerSec * 0.01).toExponential(4)),
      k27Celsius: Number(k27.toExponential(4)),
      hydraulicGradient: Number(hydraulicGradient.toFixed(3)),
      dischargeRateCm3PerSec: Number(dischargeRate.toFixed(4)),
      flowVelocityCmPerSec: Number(flowVelocity.toExponential(3)),
      seepageVelocityCmPerSec: Number(seepageVelocity.toExponential(3)),
      soilVoidRatio: voidRatioEstimate,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. ONE-DIMENSIONAL CONSOLIDATION (IS 2720 Part 15 / Terzaghi)
  // ─────────────────────────────────────────────────────────────

  /**
   * Computes oedometer stage settlement, void ratio reduction, and consolidation coefficients
   */
  public static calculateConsolidationStage(
    params: IConsolidationParams,
    previousCumulativeSettlementMm: number
  ): IConsolidationStageResult {
    const areaA = (Math.PI / 4) * Math.pow(params.specimenDiameterMm / 10, 2); // cm²
    const initialH = params.initialHeightMm / 10; // cm

    // Initial void ratio from Gs and moisture content assuming Sr = 100%
    const wDec = params.initialMoisturePercent / 100;
    const e0 = wDec * params.specificGravity;
    const heightOfSolids = initialH / (1 + e0); // Hs = H0 / (1 + e0)

    // Semi-logarithmic settlement model: ΔH = H0 * [Cc / (1 + e0)] * log10(σ' / σ0')
    const Cc = 0.28; // typical clay compression index
    const referenceStress = 25; // kPa initial seat load
    const stressRatio = Math.max(1.0, params.loadIncrementKPa / referenceStress);
    const deltaE = Cc * Math.log10(stressRatio);
    const settlementCm = heightOfSolids * deltaE;
    const settlementMm = settlementCm * 10;

    const cumulativeSettlementMm = previousCumulativeSettlementMm + settlementMm;
    const currentHeightMm = Math.max(1.0, params.initialHeightMm - cumulativeSettlementMm);
    const currentVoidRatio = Math.max(0.1, e0 - (cumulativeSettlementMm / 10) / heightOfSolids);

    // Drainage path length for double drainage d = H / 2
    const dDrainageCm = (currentHeightMm / 10) / 2;
    const t50Sec = 45; // typical laboratory t50 for 20mm specimen
    // cv = (T50 * d²) / t50 where T50 = 0.197
    const cv = (0.197 * dDrainageCm * dDrainageCm) / t50Sec;

    // mv = (1 / (1 + e0)) * (Δe / Δσ')
    const deltaSigma = Math.max(1, params.loadIncrementKPa - referenceStress);
    const av = deltaE / deltaSigma; // coefficient of compressibility
    const mv = av / (1 + e0); // per kPa

    return {
      appliedStressKPa: params.loadIncrementKPa,
      dialGaugeReadingMm: Number(settlementMm.toFixed(3)),
      cumulativeSettlementMm: Number(cumulativeSettlementMm.toFixed(3)),
      finalHeightMm: Number(currentHeightMm.toFixed(2)),
      voidRatio: Number(currentVoidRatio.toFixed(3)),
      t50Seconds: t50Sec,
      cvCm2PerSec: Number(cv.toExponential(4)),
      mvPerKPa: Number(mv.toExponential(4)),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. SHEAR STRENGTH (IS 2720 Part 10 UCC / Part 13 Direct Shear)
  // ─────────────────────────────────────────────────────────────

  /**
   * Computes shear stress, peak strength, and Mohr-Coulomb failure criteria
   * Direct Shear: τ = c + σ * tan(φ)
   * UCC: Ac = A0 / (1 - ε), σ1 = P / Ac, qu = peak σ1, cu = qu / 2
   */
  public static calculateShearStrength(params: IShearStrengthParams): IShearStrengthResult {
    if (params.testType === 'direct-shear') {
      const areaCm2 = Math.pow(params.specimenSizeMm / 10, 2); // 36 cm² for 60x60 mm
      const phiRad = (params.frictionAngleDeg * Math.PI) / 180;
      const peakShearStress = params.cohesionC + params.normalStressKPa * Math.tan(phiRad);

      // Progressive shear curve simulating shear displacement vs stress
      const currentDispMm = 2.5; // typical displacement at peak
      const currentShearStress = peakShearStress * 0.98;

      return {
        testType: 'direct-shear',
        normalStressKPa: params.normalStressKPa,
        shearStressKPa: Number(currentShearStress.toFixed(2)),
        peakShearStressKPa: Number(peakShearStress.toFixed(2)),
        horizontalDisplacementMm: currentDispMm,
        verticalDisplacementMm: 0.15,
        cohesionKPa: params.cohesionC,
        frictionAngleDeg: params.frictionAngleDeg,
        axialLoadN: 0,
        axialStrain: 0,
        correctedAreaCm2: areaCm2,
        compressiveStressKPa: 0,
        quKPa: 0,
        cuKPa: 0,
      };
    } else {
      // UCC (Unconfined Compression Test)
      const initialAreaCm2 = (Math.PI / 4) * Math.pow(params.initialDiameterMm / 10, 2); // cm² (11.34 cm² for 38 mm)
      const strain = Math.min(0.20, Math.max(0.001, params.currentStrain));
      // Corrected area Ac = A0 / (1 - ε)
      const correctedArea = initialAreaCm2 / (1 - strain);

      // Stress-strain hyperbolic model
      const quEstimated = 2 * params.cohesionC; // for pure cohesive clay (φ = 0), qu = 2 * cu
      const compressiveStress = (quEstimated * strain) / (0.02 + strain); // peak near strain ~ 0.05-0.08
      const axialLoadN = compressiveStress * correctedArea * 0.1; // kPa * cm² * 0.1 = N

      const peakQu = quEstimated;
      const cu = peakQu / 2;

      return {
        testType: 'ucc',
        normalStressKPa: 0,
        shearStressKPa: Number((compressiveStress / 2).toFixed(2)),
        peakShearStressKPa: Number(cu.toFixed(2)),
        horizontalDisplacementMm: 0,
        verticalDisplacementMm: Number((strain * params.initialLengthMm).toFixed(2)),
        cohesionKPa: cu,
        frictionAngleDeg: 0,
        axialLoadN: Number(axialLoadN.toFixed(1)),
        axialStrain: Number(strain.toFixed(4)),
        correctedAreaCm2: Number(correctedArea.toFixed(2)),
        compressiveStressKPa: Number(compressiveStress.toFixed(2)),
        quKPa: Number(peakQu.toFixed(2)),
        cuKPa: Number(cu.toFixed(2)),
      };
    }
  }
}
