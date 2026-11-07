import type {
  IHydrostaticInputs,
  IHydrostaticOutputs,
  IBernoulliInputs,
  IBernoulliOutputs,
  IPiezometerStation,
  IPipeFrictionInputs,
  IPipeFrictionOutputs,
  IOpenChannelInputs,
  IOpenChannelOutputs,
  IDischargeStructureInputs,
  IDischargeStructureOutputs,
  PipeMaterial,
} from './types';

export class HydraulicCalculator {
  // ─── 1. HYDROSTATIC PRESSURE & CENTRE OF PRESSURE ──────────────────────────
  public static calculateHydrostatics(inputs: IHydrostaticInputs): IHydrostaticOutputs {
    const {
      fluidDensity,
      gravity,
      waterDepth,
      probeDepth,
      plateAngleDeg,
      plateWidth,
      plateHeight,
      hingeDepth,
    } = inputs;

    const clampedProbeDepth = Math.max(0, Math.min(waterDepth, probeDepth));
    const pAtm = 101325; // Pa
    const gaugePressureAtProbe = fluidDensity * gravity * clampedProbeDepth;
    const absolutePressureAtProbe = pAtm + gaugePressureAtProbe;

    // Submerged plane surface calculations
    const thetaRad = (plateAngleDeg * Math.PI) / 180;
    const plateArea = plateWidth * plateHeight;

    // Centroid depth (h_bar)
    // Plate top starts at hingeDepth below water surface
    const halfHeightProj = (plateHeight / 2) * Math.sin(thetaRad);
    const centroidDepthHBar = Math.max(0.01, hingeDepth + halfHeightProj);

    // Total resultant force F = rho * g * h_bar * A
    const totalResultantForce = fluidDensity * gravity * centroidDepthHBar * plateArea;

    // Second moment of area about centroidal axis: IG = b * d³ / 12
    const momentOfInertiaIG = (plateWidth * Math.pow(plateHeight, 3)) / 12;

    // Centre of pressure depth h* = h_bar + (IG * sin²(theta)) / (A * h_bar)
    const sinTheta2 = Math.pow(Math.sin(thetaRad), 2);
    const centreOfPressureDepthHStar =
      centroidDepthHBar + (momentOfInertiaIG * sinTheta2) / (plateArea * centroidDepthHBar);

    // Distance along inclined plane from water surface intersection
    const centreOfPressureDistanceAlongPlate =
      Math.sin(thetaRad) > 1e-6 ? centreOfPressureDepthHStar / Math.sin(thetaRad) : centreOfPressureDepthHStar;

    // Overturning moment about the top hinge
    // Lever arm = distance from hinge to centre of pressure along the plate
    const distanceAlongPlateFromHinge =
      Math.sin(thetaRad) > 1e-6
        ? (centreOfPressureDepthHStar - hingeDepth) / Math.sin(thetaRad)
        : centreOfPressureDepthHStar - hingeDepth;
    const overturningMoment = totalResultantForce * Math.max(0, distanceAlongPlateFromHinge);

    return {
      gaugePressureAtProbe,
      absolutePressureAtProbe,
      atmosphericPressure: pAtm,
      totalResultantForce,
      centroidDepthHBar,
      centreOfPressureDepthHStar,
      centreOfPressureDistanceAlongPlate,
      momentOfInertiaIG,
      overturningMoment,
    };
  }

  // ─── 2. BERNOULLI'S PRINCIPLE & VENTURIMETER ───────────────────────────────
  public static calculateBernoulli(inputs: IBernoulliInputs): IBernoulliOutputs {
    const {
      flowRateLps,
      inletDiameterMm,
      throatDiameterMm,
      outletDiameterMm,
      inletElevationM,
      throatElevationM,
      dischargeCoefficientCd,
      fluidDensity,
    } = inputs;

    const g = 9.81;
    const Q = Math.max(1e-5, flowRateLps / 1000); // m³/s

    const d1 = inletDiameterMm / 1000;
    const d2 = throatDiameterMm / 1000;
    const d3 = outletDiameterMm / 1000;

    const a1 = (Math.PI * Math.pow(d1, 2)) / 4;
    const a2 = (Math.PI * Math.pow(d2, 2)) / 4;

    const v1 = Q / a1;
    const v2 = Q / a2;

    // Inlet static pressure head benchmark (arbitrary baseline ~1.5m to keep positive piezometer columns)
    const p1OverGamma = 1.45; // m of water at inlet
    const z1 = inletElevationM;
    const z2 = throatElevationM;

    // Total energy head at inlet (assuming small entrance loss)
    const H_total_inlet = p1OverGamma + (v1 * v1) / (2 * g) + z1;

    // Theoretical Venturimeter differential head:
    // h = (p1/γ + z1) - (p2/γ + z2) = (v2² - v1²) / (2g)
    const theoreticalDiffHeadM = Math.max(0, (v2 * v2 - v1 * v1) / (2 * g));

    // Throat static pressure head
    const p2OverGamma = Math.max(0.05, p1OverGamma + z1 - z2 - theoreticalDiffHeadM);

    // Theoretical discharge Q_th = (a1 * a2 / sqrt(a1² - a2²)) * sqrt(2g * h)
    const areaFactor = (a1 * a2) / Math.sqrt(Math.max(1e-8, Math.pow(a1, 2) - Math.pow(a2, 2)));
    const theoreticalQ_m3s = areaFactor * Math.sqrt(2 * g * Math.max(1e-6, theoreticalDiffHeadM));
    const actualQ_m3s = dischargeCoefficientCd * theoreticalQ_m3s;

    const theoreticalDischargeLps = theoreticalQ_m3s * 1000;
    const actualDischargeLps = actualQ_m3s * 1000;
    const dischargeErrorPct = Math.abs(actualDischargeLps - flowRateLps) / Math.max(1e-4, flowRateLps) * 100;

    // 8 Piezometer stations along the conduit:
    // Stn 1: Inlet straight pipe (d1)
    // Stn 2: Converging entry (interm)
    // Stn 3: Converging middle (interm)
    // Stn 4: Venturi Throat (d2)
    // Stn 5: Diverging diffuser start
    // Stn 6: Diverging diffuser middle
    // Stn 7: Diverging diffuser end
    // Stn 8: Outlet straight pipe (d3)
    const stationsDef = [
      { idx: 1, label: 'Inlet (Pipe 1)', x: 0.05, d: d1, z: z1 },
      { idx: 2, label: 'Convergence 1', x: 0.15, d: d1 * 0.85 + d2 * 0.15, z: z1 * 0.8 + z2 * 0.2 },
      { idx: 3, label: 'Convergence 2', x: 0.25, d: d1 * 0.40 + d2 * 0.60, z: z1 * 0.4 + z2 * 0.6 },
      { idx: 4, label: 'Venturi Throat', x: 0.35, d: d2, z: z2 },
      { idx: 5, label: 'Diffuser 1', x: 0.50, d: d2 * 0.75 + d3 * 0.25, z: z2 * 0.7 + z1 * 0.3 },
      { idx: 6, label: 'Diffuser 2', x: 0.65, d: d2 * 0.45 + d3 * 0.55, z: z2 * 0.4 + z1 * 0.6 },
      { idx: 7, label: 'Diffuser 3', x: 0.80, d: d2 * 0.15 + d3 * 0.85, z: z2 * 0.1 + z1 * 0.9 },
      { idx: 8, label: 'Outlet (Pipe 2)', x: 0.95, d: d3, z: z1 },
    ];

    const stations: IPiezometerStation[] = stationsDef.map((stn) => {
      const area = (Math.PI * Math.pow(stn.d, 2)) / 4;
      const v = Q / area;
      const vHead = (v * v) / (2 * g);

      // Frictional/diffuser eddy loss accumulates slightly along the length
      const lossAlong = 0.04 * (stn.x / 0.95);
      const totalHead = H_total_inlet - lossAlong;
      const piezometricHead = totalHead - vHead;
      const pressureHead = Math.max(0.02, piezometricHead - stn.z);

      return {
        stationIndex: stn.idx,
        label: stn.label,
        xPositionM: stn.x,
        diameterMm: stn.d * 1000,
        elevationM: stn.z,
        areaM2: area,
        velocityMps: v,
        velocityHeadM: vHead,
        pressureHeadM: pressureHead,
        datumHeadM: stn.z,
        totalHeadM: totalHead,
        piezometricHeadM: piezometricHead,
      };
    });

    return {
      flowRateM3s: Q,
      inletVelocityMps: v1,
      throatVelocityMps: v2,
      differentialHeadM: theoreticalDiffHeadM,
      theoreticalDischargeLps,
      actualDischargeLps,
      dischargeErrorPct,
      stations,
    };
  }

  // ─── 3. PIPE FLOW, FRICTION FACTOR & LOSSES ─────────────────────────────────
  public static calculatePipeLosses(inputs: IPipeFrictionInputs): IPipeFrictionOutputs {
    const {
      flowRateLps,
      pipeDiameterMm,
      pipeLengthM,
      pipeMaterial,
      waterTemperatureC,
      minorLossFittings,
    } = inputs;

    const g = 9.81;
    const Q = Math.max(1e-6, flowRateLps / 1000); // m³/s
    const D = pipeDiameterMm / 1000; // m
    const area = (Math.PI * Math.pow(D, 2)) / 4;
    const v = Q / area;

    // Density of water ~ 1000 kg/m³
    const density = 1000 - 0.02 * Math.pow(waterTemperatureC - 4, 2);

    // Kinematic viscosity approximation for water (Poiseuille formula)
    // At 20°C ν ≈ 1.004e-6 m²/s
    const T = Math.max(5, Math.min(60, waterTemperatureC));
    const kinematicViscosity = (1.787e-6) / (1 + 0.0337 * T + 0.000221 * T * T);

    // Reynolds Number
    const Re = (v * D) / kinematicViscosity;

    let flowRegime: 'laminar' | 'transitional' | 'turbulent' = 'turbulent';
    if (Re < 2000) {
      flowRegime = 'laminar';
    } else if (Re <= 4000) {
      flowRegime = 'transitional';
    }

    // Roughness height ε (meters) per material
    const roughnessMap: Record<PipeMaterial, number> = {
      smooth_brass: 0.0015e-3, // 0.0015 mm
      pvc: 0.002e-3, // 0.002 mm
      commercial_steel: 0.045e-3, // 0.045 mm
      cast_iron: 0.26e-3, // 0.26 mm
    };
    const epsilon = roughnessMap[pipeMaterial] ?? 0.045e-3;
    const relativeRoughness = epsilon / D;

    // Darcy friction factor f
    let f: number;
    if (Re <= 2000) {
      // Hagen-Poiseuille laminar law
      f = 64 / Math.max(1, Re);
    } else if (Re > 4000) {
      // Swamee-Jain formula for full turbulent flow
      const term1 = relativeRoughness / 3.7;
      const term2 = 5.74 / Math.pow(Re, 0.9);
      f = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
    } else {
      // Transitional regime cubic Hermite smooth blend
      const fLam = 64 / 2000;
      const term1 = relativeRoughness / 3.7;
      const term2 = 5.74 / Math.pow(4000, 0.9);
      const fTurb = 0.25 / Math.pow(Math.log10(term1 + term2), 2);
      const t = (Re - 2000) / 2000;
      f = fLam * (1 - t) + fTurb * t;
    }

    // Darcy-Weisbach major friction head loss: h_f = f * (L/D) * (v² / 2g)
    const majorFrictionHeadLossM = f * (pipeLengthM / D) * ((v * v) / (2 * g));

    // Minor loss coefficients
    let totalK = 0;
    if (minorLossFittings.suddenContraction) totalK += 0.38;
    if (minorLossFittings.suddenEnlargement) totalK += 0.50;
    totalK += minorLossFittings.standard90Elbows * 0.75;

    // Gate valve: fully open = 0.15, half = 2.1, mostly closed = 10.0
    const turns = Math.max(0, Math.min(4, minorLossFittings.gateValveTurnsOpen));
    const valveK = turns === 4 ? 0.15 : turns === 3 ? 0.6 : turns === 2 ? 2.1 : turns === 1 ? 5.6 : 18.0;
    totalK += valveK;

    const minorLossHeadLossM = totalK * ((v * v) / (2 * g));
    const totalHeadLossM = majorFrictionHeadLossM + minorLossHeadLossM;
    const hydraulicGradientSlope = totalHeadLossM / Math.max(0.1, pipeLengthM);

    // Pressure at inlet & outlet assuming base pressure 150 kPa
    const p1GaugeKPa = 150.0;
    const p2GaugeKPa = Math.max(0, p1GaugeKPa - (density * g * totalHeadLossM) / 1000);

    return {
      velocityMps: v,
      kinematicViscosityM2s: kinematicViscosity,
      densityKgM3: density,
      reynoldsNumber: Re,
      flowRegime,
      relativeRoughness,
      darcyFrictionFactor: f,
      majorFrictionHeadLossM,
      minorLossHeadLossM,
      totalHeadLossM,
      hydraulicGradientSlope,
      p1GaugeKPa,
      p2GaugeKPa,
    };
  }

  // ─── 4. OPEN-CHANNEL FLOW & HYDRAULIC JUMP ──────────────────────────────────
  public static calculateOpenChannel(inputs: IOpenChannelInputs): IOpenChannelOutputs {
    const { dischargeM3s, channelWidthM, bedSlopePct, manningsN, sluiceGateOpeningM } = inputs;
    const g = 9.81;

    const Q = Math.max(0.001, dischargeM3s);
    const b = Math.max(0.1, channelWidthM);
    const S0 = Math.max(0.0001, bedSlopePct / 100);
    const n = Math.max(0.008, manningsN);

    // Discharge per unit width q = Q / b
    const q = Q / b;

    // Critical depth y_c = (q² / g)^(1/3)
    const criticalDepthM = Math.pow((q * q) / g, 1 / 3);

    // Initial super-critical depth y1 directly below sluice gate (vena contracta depth)
    // Typically y1 = Cc * gateOpening where Cc ≈ 0.61
    const Cc = 0.61;
    const initialDepthY1M = Math.max(0.01, Math.min(criticalDepthM * 0.95, sluiceGateOpeningM * Cc));
    const initialVelocityV1Mps = q / initialDepthY1M;
    const initialFroudeNumberFr1 = initialVelocityV1Mps / Math.sqrt(g * initialDepthY1M);

    let flowClassification: 'subcritical' | 'critical' | 'supercritical' = 'supercritical';
    if (Math.abs(initialFroudeNumberFr1 - 1.0) < 0.05) {
      flowClassification = 'critical';
    } else if (initialFroudeNumberFr1 < 1.0) {
      flowClassification = 'subcritical';
    }

    // Normal depth y0 from Manning's equation Q = (1/n) * A * R^(2/3) * S0^(1/2)
    // Solved via Newton-Raphson
    let y0 = criticalDepthM;
    for (let iter = 0; iter < 15; iter++) {
      const A = b * y0;
      const P = b + 2 * y0;
      const R = A / P;
      const fVal = (1 / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S0) - Q;
      // Numerical derivative
      const dy = 0.0001;
      const A2 = b * (y0 + dy);
      const P2 = b + 2 * (y0 + dy);
      const R2 = A2 / P2;
      const fVal2 = (1 / n) * A2 * Math.pow(R2, 2 / 3) * Math.sqrt(S0) - Q;
      const df = (fVal2 - fVal) / dy;
      const step = fVal / df;
      y0 = Math.max(0.01, y0 - step);
      if (Math.abs(step) < 1e-5) break;
    }

    // Belanger equation for hydraulic jump conjugate depth y2:
    // y2 / y1 = 0.5 * (sqrt(1 + 8 * Fr1²) - 1)
    let conjugateDepthY2M = initialDepthY1M;
    let hydraulicJumpOccurs = false;
    let jumpHeightM = 0;
    let jumpLengthM = 0;
    let energyDissipatedM = 0;
    let efficiencyPct = 100;

    if (initialFroudeNumberFr1 > 1.0) {
      hydraulicJumpOccurs = true;
      conjugateDepthY2M = (initialDepthY1M / 2) * (Math.sqrt(1 + 8 * Math.pow(initialFroudeNumberFr1, 2)) - 1);
      jumpHeightM = conjugateDepthY2M - initialDepthY1M;
      // Empirical jump length ~ 6.1 * (y2 - y1) for rectangular channels
      jumpLengthM = 6.1 * jumpHeightM;

      // Energy loss: ΔE = (y2 - y1)³ / (4 * y1 * y2)
      energyDissipatedM =
        Math.pow(conjugateDepthY2M - initialDepthY1M, 3) / (4 * initialDepthY1M * conjugateDepthY2M);

      // Specific energy before and after
      const E1 = initialDepthY1M + Math.pow(initialVelocityV1Mps, 2) / (2 * g);
      const v2 = q / conjugateDepthY2M;
      const E2 = conjugateDepthY2M + Math.pow(v2, 2) / (2 * g);
      efficiencyPct = (E2 / Math.max(1e-4, E1)) * 100;
    }

    const flowAreaM2 = b * y0;
    const wettedPerimeterM = b + 2 * y0;
    const hydraulicRadiusM = flowAreaM2 / wettedPerimeterM;

    return {
      flowAreaM2,
      wettedPerimeterM,
      hydraulicRadiusM,
      normalDepthM: y0,
      criticalDepthM,
      initialDepthY1M,
      initialVelocityV1Mps,
      initialFroudeNumberFr1,
      flowClassification,
      conjugateDepthY2M,
      hydraulicJumpOccurs,
      jumpHeightM,
      jumpLengthM,
      energyDissipatedM,
      efficiencyPct,
    };
  }

  // ─── 5. DISCHARGE MEASURING STRUCTURES ──────────────────────────────────────
  public static calculateDischargeStructure(inputs: IDischargeStructureInputs): IDischargeStructureOutputs {
    const { structureType, headOverCrestOrificeM, notchAngleDeg, weirWidthM, orificeDiameterMm, empiricalCd } =
      inputs;
    const g = 9.81;
    const H = Math.max(0.01, headOverCrestOrificeM);

    let theoreticalDischargeLps = 0;
    let actualDischargeLps = 0;
    let jetVelocityMps = 0;
    let coeffDischargeCd = empiricalCd;
    let coeffVelocityCv = 0.97;
    let coeffContractionCc = 0.62;
    const jetTrajectoryPoints: { x: number; y: number }[] = [];

    if (structureType === 'v_notch_90') {
      const thetaRad = ((notchAngleDeg || 90) * Math.PI) / 180;
      // Thomson's formula for V-notch: Q_th = (8/15) * sqrt(2g) * tan(theta/2) * H^(5/2)
      const qThM3s = (8 / 15) * Math.sqrt(2 * g) * Math.tan(thetaRad / 2) * Math.pow(H, 2.5);
      theoreticalDischargeLps = qThM3s * 1000;
      actualDischargeLps = coeffDischargeCd * theoreticalDischargeLps;
    } else if (structureType === 'rectangular_notch') {
      const L = Math.max(0.05, weirWidthM);
      // Francis formula for rectangular weir: Q_th = (2/3) * sqrt(2g) * L * H^(3/2)
      const qThM3s = (2 / 3) * Math.sqrt(2 * g) * L * Math.pow(H, 1.5);
      theoreticalDischargeLps = qThM3s * 1000;
      actualDischargeLps = coeffDischargeCd * theoreticalDischargeLps;
    } else {
      // Circular sharp-edged orifice
      const d = (orificeDiameterMm || 20) / 1000;
      const a0 = (Math.PI * Math.pow(d, 2)) / 4;
      const vTh = Math.sqrt(2 * g * H);
      const qThM3s = a0 * vTh;

      coeffContractionCc = coeffDischargeCd / coeffVelocityCv;
      jetVelocityMps = coeffVelocityCv * vTh;
      theoreticalDischargeLps = qThM3s * 1000;
      actualDischargeLps = coeffDischargeCd * theoreticalDischargeLps;

      // Calculate parabolic free-jet trajectory y = (g * x²) / (4 * Cv² * H)
      for (let step = 0; step <= 20; step++) {
        const x = (step / 20) * 1.0; // 0 to 1 meter forward
        const y = (g * Math.pow(x, 2)) / (4 * Math.pow(coeffVelocityCv, 2) * H);
        jetTrajectoryPoints.push({ x, y });
      }
    }

    return {
      theoreticalDischargeLps,
      actualDischargeLps,
      jetVelocityMps,
      jetTrajectoryPoints,
      coeffDischargeCd,
      coeffVelocityCv,
      coeffContractionCc,
    };
  }
}
