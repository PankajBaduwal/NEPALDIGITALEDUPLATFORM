/**
 * PiyushDhara Eduverse — Concrete Technology (U25CE304)
 * Scientific Calculation and Rheology Validation Engine
 * Implements IS 10262:2019, IS 456:2000, IS 1199:2018, and IS 516:2021
 */

import { CONCRETE_MIX_PROPORTIONS } from './ConcreteMixData';
import type {
  IBatchingInputs,
  IBatchingResult,
  ISlumpTestParams,
  ISlumpTestResult,
  ICuringParams,
  ICuringStrengthResult,
  ICompressionTestParams,
  ICompressionTestResult,
  SlumpType,
} from './types';

export class ConcreteCalculator {
  /**
   * 1. Batching & Mix Proportioning Calculation
   * Validates masses, water-cement ratio, and aggregates surface moisture corrections.
   */
  public static calculateBatching(inputs: IBatchingInputs): IBatchingResult {
    const {
      grade,
      batchVolumeLiters,
      cementMassKg,
      fineAggregateMassKg,
      coarseAggregateMassKg,
      waterMassKg,
      fineAggregateMoisturePct,
      coarseAggregateMoisturePct,
    } = inputs;

    const ref = CONCRETE_MIX_PROPORTIONS[grade] || CONCRETE_MIX_PROPORTIONS.M25;

    // Moisture absorbed / carried by aggregates
    // Additional moisture carried by surface = Mass * (moisturePct / 100)
    const faMoistureKg = fineAggregateMassKg * (Math.max(0, fineAggregateMoisturePct) / 100);
    const caMoistureKg = coarseAggregateMassKg * (Math.max(0, coarseAggregateMoisturePct) / 100);
    const totalExtraWaterFromAggregatesKg = faMoistureKg + caMoistureKg;

    // Total actual water = direct water added + moisture contributed by wet aggregates
    const effectiveTotalWaterKg = waterMassKg + totalExtraWaterFromAggregatesKg;

    const actualWc = cementMassKg > 0 ? waterMassKg / cementMassKg : 0;
    const effectiveWc = cementMassKg > 0 ? effectiveTotalWaterKg / cementMassKg : 0;
    const totalBatchMass = cementMassKg + fineAggregateMassKg + coarseAggregateMassKg + waterMassKg;

    // Yield volume calculation based on approximate density
    const yieldVolumeLiters = (totalBatchMass / ref.densityKgM3) * 1000;

    // Proportional target requirements for this batch volume
    // ref: 1 m^3 has ref.densityKgM3 mass
    const batchScaleFactor = Math.max(0.001, batchVolumeLiters / 1000);
    const targetCementKg = (ref.densityKgM3 / (1 + ref.nominalRatio.fineAggregate + ref.nominalRatio.coarseAggregate + ref.waterCementRatio)) * batchScaleFactor;
    const targetFaKg = targetCementKg * ref.nominalRatio.fineAggregate;
    const targetCaKg = targetCementKg * ref.nominalRatio.coarseAggregate;
    const targetWaterKg = targetCementKg * ref.waterCementRatio;

    // Deviations
    const cementDevPct = targetCementKg > 0 ? ((cementMassKg - targetCementKg) / targetCementKg) * 100 : 0;
    const faDevPct = targetFaKg > 0 ? ((fineAggregateMassKg - targetFaKg) / targetFaKg) * 100 : 0;
    const caDevPct = targetCaKg > 0 ? ((coarseAggregateMassKg - targetCaKg) / targetCaKg) * 100 : 0;
    const waterDevPct = targetWaterKg > 0 ? ((waterMassKg - targetWaterKg) / targetWaterKg) * 100 : 0;

    // Corrected batch weights accounting for aggregate moisture
    const correctedFaKg = fineAggregateMassKg + faMoistureKg;
    const correctedCaKg = coarseAggregateMassKg + caMoistureKg;
    const correctedWaterKg = Math.max(0, targetWaterKg - totalExtraWaterFromAggregatesKg);

    // Homogeneity and mix status
    let status: IBatchingResult['status'] = 'optimal';
    let feedback = 'Proportions conform accurately to standard design mix.';

    if (effectiveWc > ref.waterCementRatio * 1.25) {
      status = 'segregating';
      feedback = 'Excessive water content. High risk of bleeding, segregation, and reduced 28-day compressive strength.';
    } else if (effectiveWc > ref.waterCementRatio * 1.1) {
      status = 'wet';
      feedback = 'Slightly wet mix. Workability will be high, but check compliance with maximum permissible w/c per IS 456 Table 5.';
    } else if (effectiveWc < ref.waterCementRatio * 0.85) {
      status = 'harsh';
      feedback = 'Insufficient water. Mix will be harsh, unworkable, and prone to severe honeycombing without high mechanical vibration.';
    } else if (cementDevPct < -15) {
      status = 'lean';
      feedback = 'Cement content is lower than design threshold. Cohesion and durability will be compromised.';
    }

    const avgAbsDev = (Math.abs(cementDevPct) + Math.abs(faDevPct) + Math.abs(caDevPct) + Math.abs(waterDevPct)) / 4;
    const mixHomogeneityScore = Math.max(0, Math.min(100, Math.round(100 - avgAbsDev * 1.5)));

    return {
      actualWaterCementRatio: parseFloat(actualWc.toFixed(3)),
      effectiveWaterCementRatio: parseFloat(effectiveWc.toFixed(3)),
      totalBatchMassKg: parseFloat(totalBatchMass.toFixed(2)),
      yieldVolumeLiters: parseFloat(yieldVolumeLiters.toFixed(2)),
      designWaterCementRatio: ref.waterCementRatio,
      moistureCorrectionKg: {
        fineAggregateAdjKg: parseFloat(faMoistureKg.toFixed(2)),
        coarseAggregateAdjKg: parseFloat(caMoistureKg.toFixed(2)),
        waterAdjKg: parseFloat(correctedWaterKg.toFixed(2)),
      },
      deviations: {
        cementDevPct: parseFloat(cementDevPct.toFixed(1)),
        faDevPct: parseFloat(faDevPct.toFixed(1)),
        caDevPct: parseFloat(caDevPct.toFixed(1)),
        waterDevPct: parseFloat(waterDevPct.toFixed(1)),
      },
      mixHomogeneityScore,
      status,
      feedbackNotes: feedback,
    };
  }

  /**
   * 2. Slump Test & Rheology Engine (IS 1199: Part 2: 2018)
   * Predicts slump subsidence, slump profile, and workability rating based on w/c, compaction, and lift technique.
   */
  public static calculateSlump(params: ISlumpTestParams): ISlumpTestResult {
    const { waterCementRatio, fineAggregateRatio, aggregateShape, tampingRodsCountPerLayer, layersCount, liftRate } = params;
    const proceduralErrors: string[] = [];

    // Procedure Checks per IS 1199
    if (layersCount !== 4 && layersCount !== 3) {
      proceduralErrors.push(`Non-standard filling: ${layersCount} layers used (IS 1199 specifies exactly 4 equal layers for 300mm mould).`);
    }
    if (tampingRodsCountPerLayer < 20 || tampingRodsCountPerLayer > 30) {
      proceduralErrors.push(`Inadequate compaction: ${tampingRodsCountPerLayer} strokes per layer (standard is exactly 25 strokes with 16mm bullet rod).`);
    }
    if (liftRate !== 'smooth_vertical') {
      proceduralErrors.push('Non-vertical/jerky cone withdrawal causing premature shear disturbance.');
    }

    // Baseline slump from w/c ratio
    // Under w/c < 0.35 -> zero/dry slump
    // w/c = 0.40 -> 25-50mm
    // w/c = 0.50 -> 80-100mm
    // w/c = 0.65 -> 150-180mm
    // w/c > 0.75 -> Collapse slump
    let baseSlump = (waterCementRatio - 0.30) * 380;
    if (aggregateShape === 'rounded') baseSlump += 20; // lower friction
    if (aggregateShape === 'flaky') baseSlump -= 25; // high inter-particle interlock

    // Compaction modifier
    if (tampingRodsCountPerLayer < 15) baseSlump -= 20; // poorly compacted entrapments

    let slumpHeight = Math.max(0, Math.min(270, Math.round(baseSlump)));
    let slumpType: SlumpType = 'true';

    if (waterCementRatio >= 0.72 || baseSlump >= 210) {
      slumpType = 'collapse';
      slumpHeight = Math.min(260, Math.max(190, slumpHeight));
    } else if (liftRate === 'tilted' || (fineAggregateRatio < 0.8 && waterCementRatio > 0.55)) {
      slumpType = 'shear';
      slumpHeight = Math.min(180, Math.max(75, slumpHeight));
    } else if (slumpHeight < 15) {
      slumpType = 'zero';
      slumpHeight = 0;
    }

    // Workability categorization per IS 456 Clause 7.1
    let workability: ISlumpTestResult['workabilityDegree'] = 'medium';
    let applicationRec = 'Reinforced concrete with moderate reinforcement (beams, slabs, columns).';

    if (slumpHeight < 25) {
      workability = 'very_low';
      applicationRec = 'Pavement quality concrete (PQC), roller compacted concrete, heavily vibrated mass concrete.';
    } else if (slumpHeight < 50) {
      workability = 'low';
      applicationRec = 'Mass concrete, lightly reinforced footings, shallow foundation strips.';
    } else if (slumpHeight <= 100) {
      workability = 'medium';
      applicationRec = 'Normal reinforced concrete work manually compacted or lightly vibrated (IS 456 standard beams/slabs).';
    } else if (slumpHeight <= 175) {
      workability = 'high';
      applicationRec = 'Heavily congested reinforcement, trench fill, pumping concrete.';
    } else {
      workability = 'very_high';
      applicationRec = 'Tremie underwater concreting, drilled shaft piles (requires slump retaining plasticizers).';
    }

    // Compaction Factor and Vebe correlations
    const compactionFactorEst = parseFloat(Math.min(0.98, Math.max(0.70, 0.70 + (slumpHeight / 300) * 0.30)).toFixed(2));
    const vebeTimeSecondsEst = Math.max(1, Math.round(30 - (slumpHeight / 200) * 28));

    return {
      slumpHeightMm: slumpHeight,
      slumpType,
      workabilityDegree: workability,
      compactionFactorEst,
      vebeTimeSecondsEst,
      proceduralErrors,
      isProcedureStandard: proceduralErrors.length === 0,
      civilApplicationRecommendation: applicationRec,
    };
  }

  /**
   * 3. Hydration & Curing Strength Development Engine (Plowman maturity formulation)
   */
  public static calculateCuringProgress(params: ICuringParams): ICuringStrengthResult {
    const { grade, curingRegime, ageDays, relativeHumidityPct, temperatureC } = params;
    const ref = CONCRETE_MIX_PROPORTIONS[grade] || CONCRETE_MIX_PROPORTIONS.M25;
    const fck28 = ref.targetStrength28DaysMpa;

    // Environmental penalty if cured dry in air without moisture
    let penalty = 0;
    if (curingRegime === 'ambient_air_dry') {
      penalty = Math.max(0.15, (100 - relativeHumidityPct) / 100 * 0.40); // Up to 40% loss of ultimate strength
    }

    // Temperature acceleration / deceleration factor (Arrhenius / Nurse-Saul rule)
    // Datum temperature = -10 deg C
    const effectiveTemp = curingRegime === 'accelerated_warm_55c' ? 55 : curingRegime === 'steam_curing_65c' ? 65 : temperatureC;
    const maturityHours = ageDays * 24 * (effectiveTemp + 10);

    // Standard percentage development per IS 456 / Neville:
    // 1 day: ~16%, 3 days: ~40%, 7 days: ~65%, 14 days: ~90%, 28 days: 100%, 90 days: ~115%
    const standardFraction = (tDays: number): number => {
      if (tDays <= 0) return 0;
      // Logarithmic Plowman formula: Strength % = A + B * log10(Maturity)
      const frac = Math.log10(tDays + 1) / Math.log10(29);
      return Math.min(1.22, Math.pow(frac, 0.75));
    };

    let currentFraction = standardFraction(ageDays);
    if (curingRegime === 'accelerated_warm_55c') {
      // Reaches 70% in 1 day, but slightly lower 90-day potential
      currentFraction = ageDays === 1 ? 0.65 : Math.min(1.05, currentFraction * 1.25);
    } else if (curingRegime === 'steam_curing_65c') {
      currentFraction = ageDays === 1 ? 0.75 : Math.min(1.02, currentFraction * 1.30);
    }

    currentFraction *= (1 - penalty);
    const strengthMpa = parseFloat((fck28 * currentFraction).toFixed(2));
    const pctOf28 = parseFloat((currentFraction * 100).toFixed(1));

    // Generate complete 90-day curve
    const curveDays = [1, 3, 7, 14, 21, 28, 56, 90];
    const curve = curveDays.map((d) => {
      let f = standardFraction(d);
      if (curingRegime === 'ambient_air_dry') f *= (1 - penalty);
      return {
        day: d,
        strengthMpa: parseFloat((fck28 * f).toFixed(2)),
      };
    });

    return {
      ageDays,
      maturityDegreeHours: Math.round(maturityHours),
      strengthMpa,
      pctOf28DayStrength: pctOf28,
      hydrationDegree: parseFloat(Math.min(1.0, currentFraction * 0.95).toFixed(3)),
      curve,
      environmentalPenaltyPct: parseFloat((penalty * 100).toFixed(1)),
    };
  }

  /**
   * 4. Concrete Compressive Strength Testing (IS 516:2021)
   */
  public static calculateCompressiveStrength(params: ICompressionTestParams): ICompressionTestResult {
    const {
      specimenGeometry,
      concreteGrade,
      ageDays,
      curingRegime,
      measuredWidthMm,
      measuredDepthMm,
      centeringOffsetMm,
      appliedLoadKn,
    } = params;

    // Standard cross-sectional area
    let nominalAreaMm2 = 150 * 150; // 22,500 mm2
    let conversionFactor = 1.0;

    if (specimenGeometry === 'cube_150mm') {
      nominalAreaMm2 = measuredWidthMm * measuredDepthMm;
      conversionFactor = 1.0;
    } else if (specimenGeometry === 'cube_100mm') {
      nominalAreaMm2 = measuredWidthMm * measuredDepthMm;
      // 100mm cube exhibits ~5% higher apparent strength due to platen restraint (factor 0.95 to 150mm equivalent)
      conversionFactor = 0.95;
    } else if (specimenGeometry === 'cylinder_150x300') {
      nominalAreaMm2 = (Math.PI * Math.pow(measuredWidthMm, 2)) / 4;
      // Cylinder strength is ~0.80 times cube strength per IS 456 Clause 6.2.2
      conversionFactor = 1.25;
    }

    // Expected failure strength from curing state
    const curingState = this.calculateCuringProgress({
      grade: concreteGrade,
      curingRegime,
      ageDays,
      relativeHumidityPct: 90,
      temperatureC: 27,
    });

    const expectedStrengthMpa = curingState.strengthMpa / conversionFactor;
    // Centering eccentricity penalty: e/b offset introduces bending stress
    const eccentricityPenalty = Math.max(0, 1 - (centeringOffsetMm / 50) * 0.35);

    const actualFailureStrengthMpa = expectedStrengthMpa * eccentricityPenalty;
    const failureLoadKn = (actualFailureStrengthMpa * nominalAreaMm2) / 1000;

    // Current tested load and current stress
    const currentStressMpa = (appliedLoadKn * 1000) / nominalAreaMm2;
    const ref = CONCRETE_MIX_PROPORTIONS[concreteGrade] || CONCRETE_MIX_PROPORTIONS.M25;
    const targetFck = parseInt(concreteGrade.replace('M', ''), 10);

    let compliance: ICompressionTestResult['complianceStatus'] = 'compliant';
    if (ageDays >= 28) {
      if (actualFailureStrengthMpa >= targetFck) compliance = 'compliant';
      else if (actualFailureStrengthMpa >= targetFck * 0.85) compliance = 'marginal';
      else compliance = 'non_compliant';
    }

    let failureMode: ICompressionTestResult['failureMode'] = 'normal_pyramidal';
    if (centeringOffsetMm > 15) {
      failureMode = 'eccentric_crush';
    } else if (specimenGeometry === 'cylinder_150x300') {
      failureMode = 'shear_cleavage';
    } else if (appliedLoadKn >= failureLoadKn * 0.95) {
      failureMode = 'normal_pyramidal';
    }

    // Non-linear compressive stress-strain constitutive response (Hognestad parabola)
    const fractureCurve: { strain: number; stressMpa: number }[] = [];
    const peakStrain = 0.002;
    const maxStrain = 0.0035;
    const numPoints = 25;
    for (let i = 0; i <= numPoints; i++) {
      const eps = (i / numPoints) * maxStrain;
      let s = 0;
      if (eps <= peakStrain) {
        s = actualFailureStrengthMpa * (2 * (eps / peakStrain) - Math.pow(eps / peakStrain, 2));
      } else {
        s = actualFailureStrengthMpa * (1 - 0.15 * ((eps - peakStrain) / (maxStrain - peakStrain)));
      }
      fractureCurve.push({ strain: parseFloat(eps.toFixed(5)), stressMpa: parseFloat(Math.max(0, s).toFixed(2)) });
    }

    return {
      effectiveAreaMm2: Math.round(nominalAreaMm2),
      failureLoadKn: parseFloat(failureLoadKn.toFixed(2)),
      compressiveStrengthMpa: parseFloat(actualFailureStrengthMpa.toFixed(2)),
      characteristicTargetMpa: targetFck,
      complianceStatus: compliance,
      failureMode,
      conversionFactorTo150mmCube: conversionFactor,
      fractureStressCurve: fractureCurve,
    };
  }
}
