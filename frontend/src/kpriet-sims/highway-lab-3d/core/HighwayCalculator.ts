/**
 * PiyushDhara Eduverse — 3D Highway Engineering Simulation & Laboratory
 * Course: U25CE402 — Highway Engineering (Civil Engineering, Semester IV)
 * Core Engineering Mathematics & Scientific Calculations Engine
 * 
 * Complies with IRC: 73-1980, IRC: 86-1983, IRC: 37-2018, IRC: 81-1997, IS 2386, and IS 1201-1220.
 */

import type {
  ICrossSectionParams,
  IGeometricDesignParams,
  ISuperelevationParams,
  ISightDistanceResult,
  ISuperelevationResult,
  IMaterialsTestParams,
  IMaterialsTestResult,
  IEvaluationParams,
  IEvaluationResult,
  IPavementLayer,
} from './types';

export class HighwayCalculator {
  public static readonly G = 9.81;

  // ─────────────────────────────────────────────────────────────
  // 1. GEOMETRIC DESIGN: SIGHT DISTANCES & RULING RADII (IRC: 73)
  // ─────────────────────────────────────────────────────────────

  public static calculateSightDistances(params: IGeometricDesignParams): ISightDistanceResult {
    const V = params.designSpeedKph;
    const t = params.reactionTimeSec;
    const f = params.longitudinalFrictionF;
    const grade = params.gradientPercent / 100;

    const lagDistance = 0.278 * V * t;
    const denominator = 254 * (f + grade);
    const brakingDistance = denominator > 0 ? (V * V) / denominator : (V * V) / (254 * f);
    const ssd = lagDistance + brakingDistance;
    const isd = 2 * ssd;

    const vb = Math.max(20, V - 16);
    const tOsd = 2.0;
    const d1 = 0.278 * vb * tOsd;
    const s = 0.2 * vb + 6;
    const a = 0.85;
    const T = Math.sqrt((4 * s) / a);
    const d2 = 0.278 * vb * T + 2 * s;
    const d3 = 0.278 * V * T;
    const osd = d1 + d2 + d3;

    const rRuling = (V * V) / (127 * (0.07 + 0.15));
    const rAbsoluteMin = (V * V) / (127 * (0.10 + 0.15));

    return {
      ssdM: Number(ssd.toFixed(2)),
      ssdLagDistanceM: Number(lagDistance.toFixed(2)),
      ssdBrakingDistanceM: Number(brakingDistance.toFixed(2)),
      isdM: Number(isd.toFixed(2)),
      osdM: Number(osd.toFixed(2)),
      osdD1M: Number(d1.toFixed(2)),
      osdD2M: Number(d2.toFixed(2)),
      osdD3M: Number(d3.toFixed(2)),
      rRulingM: Number(rRuling.toFixed(1)),
      rAbsoluteMinM: Number(rAbsoluteMin.toFixed(1)),
    };
  }

  public static calculateGeometricDesign(
    speedKmph: number,
    radiusM: number,
    longitudinalSlopePercent = 0,
    reactionTimeSec = 2.5,
    frictionCoeff = 0.35
  ): {
    ssdM: number;
    lagDistanceM: number;
    brakingDistanceM: number;
    isdM: number;
    osdM: number;
    rulingRadiusM: number;
    setbackDistanceM: number;
  } {
    const res = HighwayCalculator.calculateSightDistances({
      designSpeedKph: speedKmph,
      reactionTimeSec,
      longitudinalFrictionF: frictionCoeff,
      lateralFrictionF: 0.15,
      curveRadiusM: radiusM,
      pavementWidthM: 7.0,
      wheelBaseLengthM: 6.0,
      gradientPercent: longitudinalSlopePercent,
    });

    // Lateral setback distance m = R - (R - d) * cos(alpha / 2)
    // where alpha/2 = (180 * SSD) / (2 * pi * R)
    const R = Math.max(radiusM, 20);
    const ssd = res.ssdM;
    const alphaHalfRad = ssd / (2 * R);
    const setback = Number((R - (R - 1.75) * Math.cos(alphaHalfRad)).toFixed(2));

    return {
      ssdM: res.ssdM,
      lagDistanceM: res.ssdLagDistanceM,
      brakingDistanceM: res.ssdBrakingDistanceM,
      isdM: res.isdM,
      osdM: res.osdM,
      rulingRadiusM: res.rRulingM,
      setbackDistanceM: Math.max(0, setback),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SUPERELEVATION & EXTRA WIDENING (IRC: 73)
  // ─────────────────────────────────────────────────────────────

  public static calculateSuperelevation(
    paramOrSpeed: ISuperelevationParams | number,
    radiusOrNLanes?: number,
    widthOrWheelbase?: number,
    terrain?: 'plain-rolling' | 'hilly'
  ): ISuperelevationResult & {
    providedSuperelevation: number;
    designSuperelevation: number;
    designSummary: string;
  } {
    let V = 80;
    let R = 250;
    let roadWidth = 7.0;
    let nLanes = 2;
    let wheelbase = 6.0;
    let eMax = 0.07;
    let camberRate = 0.025;

    if (typeof paramOrSpeed === 'object') {
      V = paramOrSpeed.designSpeedKph;
      R = paramOrSpeed.curveRadiusM;
      roadWidth = paramOrSpeed.pavementWidthM;
      eMax = paramOrSpeed.maxSuperelevation;
      camberRate = paramOrSpeed.camberRate;
      nLanes = radiusOrNLanes ?? 2;
      wheelbase = widthOrWheelbase ?? 6.0;
    } else {
      V = paramOrSpeed;
      R = radiusOrNLanes ?? 250;
      roadWidth = widthOrWheelbase ?? 7.0;
      eMax = terrain === 'hilly' ? 0.10 : 0.07;
    }

    const calcE = R > 0 ? (V * V) / (225 * R) : 0;
    let adoptedE = calcE;
    let checkF = 0;
    let isFrictionSafe = true;

    if (calcE <= eMax) {
      adoptedE = Math.max(camberRate, calcE);
    } else {
      adoptedE = eMax;
      checkF = (V * V) / (127 * R) - eMax;
      if (checkF > 0.15) {
        isFrictionSafe = false;
      }
    }

    const Wm = R > 0 ? (nLanes * (wheelbase * wheelbase)) / (2 * R) : 0;
    const Wps = R > 0 ? V / (9.5 * Math.sqrt(R)) : 0;
    const We = Wm + Wps;
    const totalCurveWidth = roadWidth + We;
    const edgeRaiseMm = adoptedE * roadWidth * 1000;

    const summary = isFrictionSafe
      ? calcE <= eMax
        ? `Adopt e = ${(adoptedE * 100).toFixed(2)}% (within e_max = ${(eMax * 100).toFixed(0)}%)`
        : `Adopt e_max = ${(eMax * 100).toFixed(0)}%; lateral friction f = ${checkF.toFixed(3)} ≤ 0.15 (SAFE)`
      : `UNSAFE: f = ${checkF.toFixed(3)} > 0.15. Speed must be restricted or radius increased.`;

    return {
      calcSuperelevationE: Number(calcE.toFixed(4)),
      adoptedSuperelevationE: Number(adoptedE.toFixed(4)),
      checkLateralFriction: Number(Math.max(0, checkF).toFixed(4)),
      isFrictionSafe,
      mechanicalWideningM: Number(Wm.toFixed(3)),
      psychologicalWideningM: Number(Wps.toFixed(3)),
      totalExtraWideningM: Number(We.toFixed(3)),
      totalCurveWidthM: Number(totalCurveWidth.toFixed(2)),
      edgeRaiseMm: Number(edgeRaiseMm.toFixed(1)),
      providedSuperelevation: Number(adoptedE.toFixed(4)),
      designSuperelevation: Number(calcE.toFixed(4)),
      designSummary: summary,
    };
  }

  public static calculateExtraWidening(
    speedKmph: number,
    radiusM: number,
    lanes = 2,
    wheelbaseLengthM = 6.1
  ): {
    mechanicalWideningM: number;
    psychologicalWideningM: number;
    totalWideningM: number;
    totalRoadWidthM: number;
  } {
    const R = Math.max(radiusM, 20);
    const Wm = (lanes * wheelbaseLengthM * wheelbaseLengthM) / (2 * R);
    const Wps = speedKmph / (9.5 * Math.sqrt(R));
    const We = Wm + Wps;
    const baseWidth = lanes * 3.5;

    return {
      mechanicalWideningM: Number(Wm.toFixed(3)),
      psychologicalWideningM: Number(Wps.toFixed(3)),
      totalWideningM: Number(We.toFixed(3)),
      totalRoadWidthM: Number((baseWidth + We).toFixed(3)),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PAVEMENT CROSS-SECTION & VOLUMETRIC TAKEOFF
  // ─────────────────────────────────────────────────────────────

  public static calculateCrossSectionQuantities(params: ICrossSectionParams): {
    carriagewayWidthM: number;
    totalRoadWidthM: number;
    crownHeightMm: number;
    totalThicknessMm: number;
    layerQuantitiesM3: { id: string; name: string; volumeM3: number; thicknessMm: number }[];
  } {
    const carriagewayWidthM = params.numberOfLanes * params.laneWidthM;
    const totalRoadWidthM = carriagewayWidthM + 2 * params.shoulderWidthM;
    const crownHeightMm = (carriagewayWidthM / 2) * (params.camberPercent / 100) * 1000;

    let totalThicknessMm = 0;
    const layerQuantitiesM3 = params.layers.map((lyr) => {
      totalThicknessMm += lyr.thicknessMm;
      const widthForLayer =
        lyr.code === 'Subgrade' || lyr.code === 'GSB' || lyr.code === 'DLC' ? totalRoadWidthM : carriagewayWidthM;
      const volumeM3 = params.roadLengthM * widthForLayer * (lyr.thicknessMm / 1000);

      return {
        id: lyr.id,
        name: lyr.name,
        thicknessMm: lyr.thicknessMm,
        volumeM3: Number(volumeM3.toFixed(1)),
      };
    });

    return {
      carriagewayWidthM: Number(carriagewayWidthM.toFixed(2)),
      totalRoadWidthM: Number(totalRoadWidthM.toFixed(2)),
      crownHeightMm: Number(crownHeightMm.toFixed(1)),
      totalThicknessMm,
      layerQuantitiesM3,
    };
  }

  public static calculateCrossSection(
    carriagewayWidth: number,
    camberPercent: number,
    camberType: 'parabolic' | 'straight',
    shoulderWidth: number,
    layers: IPavementLayer[],
    length: number
  ): {
    crownHeightM: number;
    totalPavementThicknessMm: number;
    totalVolumeM3: number;
    layerQuantities: { id: string; name: string; volumeM3: number; thicknessMm: number }[];
  } {
    const crownHeightM = (carriagewayWidth / 2) * (camberPercent / 100);
    let totalPavementThicknessMm = 0;
    let totalVolumeM3 = 0;

    const layerQuantities = layers.map((layer) => {
      totalPavementThicknessMm += layer.thicknessMm;
      const vol = length * carriagewayWidth * (layer.thicknessMm / 1000);
      totalVolumeM3 += vol;
      return {
        id: layer.id,
        name: layer.name,
        thicknessMm: layer.thicknessMm,
        volumeM3: Number(vol.toFixed(2)),
      };
    });

    return {
      crownHeightM: Number(crownHeightM.toFixed(4)),
      totalPavementThicknessMm,
      totalVolumeM3: Number(totalVolumeM3.toFixed(2)),
      layerQuantities,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. MATERIALS TESTING (IS 2386 / IS 73)
  // ─────────────────────────────────────────────────────────────

  public static evaluateMaterialTest(params: IMaterialsTestParams): IMaterialsTestResult {
    let testValue = 0;
    let unit = '%';
    let morthSpecificationLimit = '≤ 30%';
    let complianceStatus: 'compliant' | 'marginal' | 'non-compliant' = 'compliant';
    let interpretation = '';

    if (params.testType === 'aggregate-impact') {
      testValue = Number(((params.passingFractionsMassG / params.initialSampleMassG) * 100).toFixed(2));
      morthSpecificationLimit = '≤ 24% for Surface Course, ≤ 30% for Base Course';
      if (testValue <= 24) {
        complianceStatus = 'compliant';
        interpretation = 'Strong aggregate with excellent resistance to mechanical impact shocks; suitable for Bituminous Concrete.';
      } else if (testValue <= 30) {
        complianceStatus = 'marginal';
        interpretation = 'Acceptable for base course (WMM/DBM), but exceeds premium wearing course limit.';
      } else {
        complianceStatus = 'non-compliant';
        interpretation = 'Excessive crushing under impact. Unsuitable for heavy traffic highway wearing courses.';
      }
    } else if (params.testType === 'aggregate-crushing') {
      testValue = Number(((params.passingFractionsMassG / params.initialSampleMassG) * 100).toFixed(2));
      morthSpecificationLimit = '≤ 30% for Surface Dressing, ≤ 45% for Base Course';
      if (testValue <= 30) {
        complianceStatus = 'compliant';
        interpretation = 'High compressive strength and adequate resistance to static vehicle wheel crushing.';
      } else {
        complianceStatus = 'non-compliant';
        interpretation = 'Crushing value exceeds 30%. Potential aggregate degradation under heavy wheel loads.';
      }
    } else if (params.testType === 'los-angeles-abrasion') {
      testValue = Number(((params.passingFractionsMassG / params.initialSampleMassG) * 100).toFixed(2));
      morthSpecificationLimit = '≤ 30% for Wearing Course, ≤ 40% for Bituminous Base';
      if (testValue <= 30) {
        complianceStatus = 'compliant';
        interpretation = 'Superb hardness and resistance to tyre friction and surface attrition.';
      } else {
        complianceStatus = 'non-compliant';
        interpretation = 'Excessive abrasive wear. Rapid aggregate polishing and loss of skid resistance likely.';
      }
    } else if (params.testType === 'bitumen-penetration') {
      testValue = params.penetrationDepth10thMm;
      unit = '0.1 mm';
      morthSpecificationLimit = '45 - 60 (0.1 mm) for VG-30 Bitumen per IS 73';
      if (testValue >= 45 && testValue <= 60) {
        complianceStatus = 'compliant';
        interpretation = 'Standard grade VG-30 bitumen suitable for moderate and warm climatic zones across India.';
      } else if (testValue < 45) {
        complianceStatus = 'marginal';
        interpretation = 'Hard bitumen (VG-40 grade or aged). Suitable for high-stress intersections but prone to thermal cracking.';
      } else {
        complianceStatus = 'non-compliant';
        interpretation = 'Overly soft bitumen. Risk of rutting and bleeding under hot summer pavement temperatures.';
      }
    } else {
      testValue = params.softeningPointCelsius;
      unit = '°C';
      morthSpecificationLimit = '≥ 47°C for VG-30 per IS 73';
      if (testValue >= 47) {
        complianceStatus = 'compliant';
        interpretation = 'Sufficient resistance to thermal softening and viscous deformation under peak summer pavement temperatures.';
      } else {
        complianceStatus = 'non-compliant';
        interpretation = 'Low softening point. Pavement will experience bleeding, shoving, and instability in warm weather.';
      }
    }

    return {
      testType: params.testType,
      testValue,
      unit,
      morthSpecificationLimit,
      complianceStatus,
      interpretation,
    };
  }

  public static calculateAggregateImpact(
    initialSampleMassG: number,
    passingFractionsMassG: number
  ): {
    impactValuePercent: number;
    suitability: string;
    specificationLimit: string;
  } {
    const val = (passingFractionsMassG / initialSampleMassG) * 100;
    const aiv = Number(val.toFixed(2));
    let suitability = 'Exceptionally Strong (Wearing Course)';
    if (aiv > 30) suitability = 'Unsatisfactory for Road Pavements';
    else if (aiv > 24) suitability = 'Satisfactory for Base Course (WMM / DBM)';

    return {
      impactValuePercent: aiv,
      suitability,
      specificationLimit: '≤ 24% for Wearing Course, ≤ 30% for Base Course per MORTH 500',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. BENKELMAN BEAM OVERLAY DESIGN (IRC: 81-1997)
  // ─────────────────────────────────────────────────────────────

  public static calculateOverlayDesign(params: IEvaluationParams): IEvaluationResult {
    const dMean = params.measuredDeflectionMm;
    const s = 0.15 * dMean;
    const rawDc = dMean + 2 * s;

    const tempDiff = params.testTemperatureCelsius - 35;
    const tempCorrection = -tempDiff * 0.0065;
    const correctedDc = Math.max(0.2, (rawDc + tempCorrection) * params.subgradeMoistureCorrection);

    const msa = Math.max(1, params.trafficMsa);
    const allowableDa = 0.55 * Math.pow(msa / 10, -0.245);

    let overlayThicknessMm = 0;
    if (correctedDc > allowableDa) {
      overlayThicknessMm = 550 * Math.log10(correctedDc / allowableDa);
    }

    let conditionRating: 'good' | 'fair' | 'poor' | 'critical' = 'good';
    if (correctedDc < allowableDa) {
      conditionRating = 'good';
    } else if (overlayThicknessMm < 50) {
      conditionRating = 'fair';
    } else if (overlayThicknessMm < 100) {
      conditionRating = 'poor';
    } else {
      conditionRating = 'critical';
    }

    return {
      characteristicDeflectionDcMm: Number(rawDc.toFixed(3)),
      temperatureCorrectionFactor: Number(tempCorrection.toFixed(3)),
      correctedDeflectionMm: Number(correctedDc.toFixed(3)),
      allowableDeflectionDaMm: Number(allowableDa.toFixed(3)),
      overlayThicknessMm: Number(Math.max(0, overlayThicknessMm).toFixed(1)),
      conditionRating,
    };
  }

  public static calculateBenkelmanBeamOverlay(
    measuredDeflectionsMm: number[],
    pavementTempC: number,
    subgradeSoilType: string,
    annualRainfallMm: number,
    designTrafficMsa: number
  ): {
    meanDeflectionMm: number;
    standardDeviationMm: number;
    characteristicDeflectionMm: number;
    allowableDeflectionMm: number;
    overlayThicknessBmMm: number;
    overlayThicknessDbmMm: number;
  } {
    const n = measuredDeflectionsMm.length || 1;
    const sum = measuredDeflectionsMm.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const variance = measuredDeflectionsMm.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const sd = Math.sqrt(variance);

    // Characteristic deflection Dc = mean + 2 * sd
    const rawDc = mean + 2 * sd;

    // Temperature correction: 0.01 mm per °C difference from 35°C
    const tempCorrection = (35 - pavementTempC) * 0.01;
    const correctedDc = Math.max(0.1, rawDc + tempCorrection);

    // Allowable deflection Da = 0.55 * (MSA / 10)^(-0.245)
    const msa = Math.max(1, designTrafficMsa);
    const allowableDa = 0.55 * Math.pow(msa / 10, -0.245);

    let bmOverlay = 0;
    if (correctedDc > allowableDa) {
      bmOverlay = 550 * Math.log10(correctedDc / allowableDa);
    }
    const dbmOverlay = bmOverlay * 0.7; // 1 cm DBM is equivalent to 1.4 cm BM per IRC: 81

    return {
      meanDeflectionMm: Number(mean.toFixed(3)),
      standardDeviationMm: Number(sd.toFixed(3)),
      characteristicDeflectionMm: Number(correctedDc.toFixed(3)),
      allowableDeflectionMm: Number(allowableDa.toFixed(3)),
      overlayThicknessBmMm: Number(Math.max(0, bmOverlay).toFixed(1)),
      overlayThicknessDbmMm: Number(Math.max(0, dbmOverlay).toFixed(1)),
    };
  }
}
