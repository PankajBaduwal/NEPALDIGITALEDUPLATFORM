/**
 * Pure Engineering Thermodynamics Calculation Engine
 * Formulated according to:
 * - P. K. Nag, Engineering Thermodynamics (7th Ed.)
 * - Çengel & Boles, Thermodynamics: An Engineering Approach (10th Ed.)
 * - Anna University / Autonomous R2025 Syllabus (U25MEG04)
 */

import type {
  GasProperties,
  GasType,
  ThermodynamicProcessType,
  StatePoint,
  ProcessCalculationResult,
  SteadyFlowDeviceType,
  SfeeResult,
  ThermalDeviceType,
  ThermalDeviceResult,
  GasPowerCycleType,
  GasCycleResult,
  SteamPropertiesResult,
  RankineCycleResult,
  PsychrometricProcessType,
  PsychrometricResult,
} from './types';

export class ThermodynamicsCalculator {
  // Standard Ideal Gas Constants (SI units: J/(kg·K))
  public static readonly GAS_DATABASE: Record<GasType, GasProperties> = {
    air: {
      name: 'Air',
      chemicalFormula: 'N2+O2 blend',
      molecularWeight: 28.97,
      specificGasConstantR: 287.05,
      cp: 1005,
      cv: 718,
      gamma: 1.4,
    },
    nitrogen: {
      name: 'Nitrogen',
      chemicalFormula: 'N2',
      molecularWeight: 28.013,
      specificGasConstantR: 296.8,
      cp: 1040,
      cv: 743,
      gamma: 1.4,
    },
    oxygen: {
      name: 'Oxygen',
      chemicalFormula: 'O2',
      molecularWeight: 31.999,
      specificGasConstantR: 259.8,
      cp: 918,
      cv: 658,
      gamma: 1.395,
    },
    'carbon-dioxide': {
      name: 'Carbon Dioxide',
      chemicalFormula: 'CO2',
      molecularWeight: 44.01,
      specificGasConstantR: 188.9,
      cp: 846,
      cv: 657,
      gamma: 1.288,
    },
    helium: {
      name: 'Helium',
      chemicalFormula: 'He',
      molecularWeight: 4.003,
      specificGasConstantR: 2077,
      cp: 5193,
      cv: 3116,
      gamma: 1.667,
    },
  };

  /**
   * 1. Ideal Gas State Equation: P·V = m·R·T
   */
  public static calculateIdealGasState(
    massKg: number,
    gas: GasType,
    params: { pressureKPa?: number; volumeM3?: number; temperatureK?: number }
  ): StatePoint {
    const props = this.GAS_DATABASE[gas];
    const R = props.specificGasConstantR;

    let p = params.pressureKPa;
    let v = params.volumeM3;
    let t = params.temperatureK;

    if (p !== undefined && v !== undefined && t === undefined) {
      // T = (P*1000 * V) / (m * R)
      t = (p * 1000 * v) / (massKg * R);
    } else if (p !== undefined && t !== undefined && v === undefined) {
      // V = (m * R * T) / (P * 1000)
      v = (massKg * R * t) / (p * 1000);
    } else if (v !== undefined && t !== undefined && p === undefined) {
      // P = (m * R * T) / (V * 1000) in kPa
      p = (massKg * R * t) / (v * 1000);
    } else if (p === undefined || v === undefined || t === undefined) {
      throw new Error('Provide at least two state variables (P, V, or T).');
    }

    const u = (props.cv * t) / 1000; // kJ/kg
    const h = (props.cp * t) / 1000; // kJ/kg

    return {
      index: 1,
      label: 'State 1',
      pressureKPa: Math.max(0.1, p),
      volumeM3: Math.max(0.0001, v),
      temperatureK: Math.max(1, t),
      internalEnergyKJperKg: u,
      enthalpyKJperKg: h,
    };
  }

  /**
   * System Energy & First Law Closed Systems
   */
  public static calculateSystemEnergy(params: {
    systemType: string;
    qIn: number;
    wShaft: number;
    wBoundary: number;
    initialInternalEnergy: number;
  }): { deltaU: number; finalInternalEnergy: number; boundaryWorkInteraction: string } {
    const deltaU = params.qIn - (params.wShaft + params.wBoundary);
    const finalU = params.initialInternalEnergy + deltaU;
    const mode =
      params.wBoundary > 0
        ? 'Expansion (+W)'
        : params.wBoundary < 0
        ? 'Compression (-W)'
        : 'Rigid Boundary (W=0)';
    return {
      deltaU,
      finalInternalEnergy: finalU,
      boundaryWorkInteraction: mode,
    };
  }

  /**
   * 2. Thermodynamic Processes Explorer
   * Computes state 2, Work W, Heat Q, Delta U, Delta H, Delta S, and discrete curve points
   */
  public static calculateProcess(
    gasOrParams: any,
    massKg?: number,
    processType?: ThermodynamicProcessType,
    initialState?: { pressureKPa: number; volumeM3: number; temperatureK?: number },
    targetValue?: { pressureKPa?: number; volumeM3?: number; temperatureK?: number; polytropicIndex?: number }
  ): ProcessCalculationResult {
    if (typeof gasOrParams === 'object' && gasOrParams.processType) {
      const pType = gasOrParams.processType as ThermodynamicProcessType;
      const p1 = gasOrParams.p1KPa ?? 101.325;
      const v1 = gasOrParams.v1M3 ?? 0.1;
      const v2 = gasOrParams.v2M3 ?? 0.2;
      const t1 = gasOrParams.t1K ?? 300;
      const n = gasOrParams.polytropicN ?? 1.25;
      return this.calculateProcess(
        'air',
        1.0,
        pType,
        { pressureKPa: p1, volumeM3: v1, temperatureK: t1 },
        { volumeM3: v2, polytropicIndex: n }
      );
    }

    const gas = gasOrParams as GasType;
    const m = massKg ?? 1.0;
    const pType = processType ?? 'isothermal';
    const initSt = initialState ?? { pressureKPa: 101.325, volumeM3: 0.1, temperatureK: 300 };
    const tgtVal = targetValue ?? { volumeM3: 0.2 };

    const props = this.GAS_DATABASE[gas];
    const R = props.specificGasConstantR;
    const cp = props.cp;
    const cv = props.cv;
    const gamma = props.gamma;

    const p1 = initSt.pressureKPa;
    const v1 = initSt.volumeM3;
    const t1 = initSt.temperatureK ?? (p1 * 1000 * v1) / (m * R);

    let p2 = p1;
    let v2 = v1;
    let t2 = t1;
    let n = 1.0;

    switch (pType) {
      case 'isobaric': {
        // P = C, n = 0
        n = 0;
        p2 = p1;
        if (tgtVal.volumeM3 !== undefined) {
          v2 = tgtVal.volumeM3;
          t2 = t1 * (v2 / v1);
        } else if (tgtVal.temperatureK !== undefined) {
          t2 = tgtVal.temperatureK;
          v2 = v1 * (t2 / t1);
        } else {
          v2 = v1 * 1.5;
          t2 = t1 * 1.5;
        }
        break;
      }
      case 'isochoric': {
        // V = C, n = infinity
        n = Infinity;
        v2 = v1;
        if (tgtVal.pressureKPa !== undefined) {
          p2 = tgtVal.pressureKPa;
          t2 = t1 * (p2 / p1);
        } else if (tgtVal.temperatureK !== undefined) {
          t2 = tgtVal.temperatureK;
          p2 = p1 * (t2 / t1);
        } else {
          p2 = p1 * 1.5;
          t2 = t1 * 1.5;
        }
        break;
      }
      case 'isothermal': {
        // T = C, n = 1 (P1*V1 = P2*V2)
        n = 1.0;
        t2 = t1;
        if (tgtVal.volumeM3 !== undefined) {
          v2 = tgtVal.volumeM3;
          p2 = p1 * (v1 / v2);
        } else if (tgtVal.pressureKPa !== undefined) {
          p2 = tgtVal.pressureKPa;
          v2 = v1 * (p1 / p2);
        } else {
          v2 = v1 * 2.0;
          p2 = p1 * 0.5;
        }
        break;
      }
      case 'isentropic': {
        // P * V^gamma = C
        n = gamma;
        if (tgtVal.volumeM3 !== undefined) {
          v2 = tgtVal.volumeM3;
          p2 = p1 * Math.pow(v1 / v2, gamma);
          t2 = t1 * Math.pow(v1 / v2, gamma - 1);
        } else if (tgtVal.pressureKPa !== undefined) {
          p2 = tgtVal.pressureKPa;
          v2 = v1 * Math.pow(p1 / p2, 1 / gamma);
          t2 = t1 * Math.pow(p2 / p1, (gamma - 1) / gamma);
        } else {
          v2 = v1 * 2.0;
          p2 = p1 * Math.pow(0.5, gamma);
          t2 = t1 * Math.pow(0.5, gamma - 1);
        }
        break;
      }
      case 'polytropic': {
        // P * V^n = C
        n = tgtVal.polytropicIndex ?? 1.25;
        if (Math.abs(n - 1.0) < 0.001) n = 1.001; // Avoid divide-by-zero
        if (tgtVal.volumeM3 !== undefined) {
          v2 = tgtVal.volumeM3;
          p2 = p1 * Math.pow(v1 / v2, n);
          t2 = t1 * Math.pow(v1 / v2, n - 1);
        } else if (tgtVal.pressureKPa !== undefined) {
          p2 = tgtVal.pressureKPa;
          v2 = v1 * Math.pow(p1 / p2, 1 / n);
          t2 = t1 * Math.pow(p2 / p1, (n - 1) / n);
        } else {
          v2 = v1 * 1.8;
          p2 = p1 * Math.pow(v1 / v2, n);
          t2 = t1 * Math.pow(v1 / v2, n - 1);
        }
        break;
      }
    }

    // Work Transfer W (kJ)
    let workDoneKJ = 0;
    if (pType === 'isobaric') {
      workDoneKJ = p1 * (v2 - v1); // kPa * m3 = kJ
    } else if (pType === 'isochoric') {
      workDoneKJ = 0;
    } else if (pType === 'isothermal') {
      workDoneKJ = p1 * v1 * Math.log(v2 / v1); // kJ
    } else {
      // Polytropic or Isentropic: W = (P1*V1 - P2*V2) / (n - 1)
      workDoneKJ = (p1 * v1 - p2 * v2) / (n - 1);
    }

    // Change in Internal Energy: Delta U = m * cv * (T2 - T1) in kJ
    const deltaInternalEnergyKJ = (m * cv * (t2 - t1)) / 1000;

    // Change in Enthalpy: Delta H = m * cp * (T2 - T1) in kJ
    const deltaEnthalpyKJ = (m * cp * (t2 - t1)) / 1000;

    // Heat Transfer: First Law Q = Delta U + W (kJ)
    let heatTransferKJ = deltaInternalEnergyKJ + workDoneKJ;
    if (pType === 'isentropic') {
      heatTransferKJ = 0; // Strictly adiabatic reversible
    }

    // Entropy Change: Delta S = m * [cv * ln(T2/T1) + R * ln(V2/V1)] in kJ/K
    let entropyChangeKJperK = 0;
    if (pType === 'isentropic') {
      entropyChangeKJperK = 0;
    } else {
      entropyChangeKJperK =
        (m * (cv * Math.log(t2 / t1) + R * Math.log(v2 / v1))) / 1000;
    }

    // Generate Path points for live P-V and T-S diagram curves (25 steps)
    const steps = 30;
    const pathPV: { v: number; p: number }[] = [];
    const pathTS: { s: number; t: number }[] = [];

    const vMin = Math.min(v1, v2);
    const vMax = Math.max(v1, v2);

    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      let curV = v1 + (v2 - v1) * frac;
      let curP = p1;
      let curT = t1;

      if (pType === 'isobaric') {
        curP = p1;
        curT = t1 * (curV / v1);
      } else if (pType === 'isochoric') {
        curV = v1;
        curP = p1 + (p2 - p1) * frac;
        curT = t1 * (curP / p1);
      } else if (pType === 'isothermal') {
        curP = (p1 * v1) / curV;
        curT = t1;
      } else {
        curP = p1 * Math.pow(v1 / curV, n);
        curT = t1 * Math.pow(v1 / curV, n - 1);
      }

      const curS =
        pType === 'isentropic'
          ? 0
          : (m * (cv * Math.log(Math.max(1, curT) / t1) + R * Math.log(Math.max(0.0001, curV) / v1))) / 1000;

      pathPV.push({ v: curV, p: curP });
      pathTS.push({ s: curS, t: curT });
    }

    const state1: StatePoint = {
      index: 1,
      label: 'State 1 (Initial)',
      pressureKPa: p1,
      volumeM3: v1,
      temperatureK: t1,
      internalEnergyKJperKg: (cv * t1) / 1000,
      enthalpyKJperKg: (cp * t1) / 1000,
    };

    const state2: StatePoint = {
      index: 2,
      label: 'State 2 (Final)',
      pressureKPa: p2,
      volumeM3: v2,
      temperatureK: t2,
      internalEnergyKJperKg: (cv * t2) / 1000,
      enthalpyKJperKg: (cp * t2) / 1000,
    };

    return {
      processName: pType.toUpperCase(),
      polytropicIndex: n,
      state1,
      state2,
      workDoneKJ,
      heatTransferKJ,
      deltaInternalEnergyKJ,
      deltaEnthalpyKJ,
      entropyChangeKJperK,
      pathPointsPV: pathPV,
      pathPointsTS: pathTS,
      workKJ: workDoneKJ,
      heatKJ: heatTransferKJ,
      p2KPa: p2,
      t2K: t2,
    };
  }

  /**
   * 3. First Law & Steady Flow Energy Equation (SFEE)
   * m_dot * (h1 + V1^2/2000 + g*z1/1000) + Q_dot = m_dot * (h2 + V2^2/2000 + g*z2/1000) + W_dot
   */
  public static calculateSFEE(
    deviceOrParams: any,
    paramsInput?: {
      massFlowRateKgS: number;
      inletEnthalpyKJperKg: number;
      exitEnthalpyKJperKg?: number;
      inletVelocityMS: number;
      exitVelocityMS?: number;
      inletElevationM?: number;
      exitElevationM?: number;
      heatTransferRateKW?: number;
      workOutputRateKW?: number;
      isentropicEfficiencyPct?: number;
    }
  ): SfeeResult {
    let device: SteadyFlowDeviceType = 'turbine';
    let params: any = paramsInput;

    if (typeof deviceOrParams === 'object' && deviceOrParams.deviceType) {
      device = deviceOrParams.deviceType;
      params = {
        massFlowRateKgS: deviceOrParams.massFlowRateKgS ?? 1.0,
        inletEnthalpyKJperKg: deviceOrParams.h1KJkg ?? 3000,
        exitEnthalpyKJperKg: deviceOrParams.h2KJkg ?? 2200,
        inletVelocityMS: deviceOrParams.c1MS ?? 50,
        exitVelocityMS: deviceOrParams.c2MS ?? 150,
        inletElevationM: deviceOrParams.z1M ?? 0,
        exitElevationM: deviceOrParams.z2M ?? 0,
        heatTransferRateKW: deviceOrParams.qDotKW ?? 0,
      };
    } else {
      device = deviceOrParams as SteadyFlowDeviceType;
    }

    const m = params.massFlowRateKgS;
    const h1 = params.inletEnthalpyKJperKg;
    const v1 = params.inletVelocityMS;
    const z1 = params.inletElevationM ?? 0;
    const z2 = params.exitElevationM ?? 0;
    const g = 9.81;
    const deltaPE = (m * g * (z2 - z1)) / 1000; // kW

    let h2 = params.exitEnthalpyKJperKg ?? h1 * 0.75;
    let v2 = params.exitVelocityMS ?? v1;
    let q = params.heatTransferRateKW ?? 0;
    let w = params.workOutputRateKW ?? 0;
    const eta_isen = (params.isentropicEfficiencyPct ?? 85) / 100;

    switch (device) {
      case 'turbine': {
        // Turbines produce shaft work, negligible delta KE & delta PE, heat loss q <= 0
        // W = m * (h1 - h2) + Q
        q = params.heatTransferRateKW ?? -10.0; // small heat loss to surroundings
        const idealDeltaH = h1 - (params.exitEnthalpyKJperKg ?? h1 * 0.7);
        const actualDeltaH = idealDeltaH * eta_isen;
        h2 = h1 - actualDeltaH;
        const deltaKE = (m * (Math.pow(v2, 2) - Math.pow(v1, 2))) / 2000;
        w = m * (h1 - h2) + q - deltaKE - deltaPE;
        break;
      }
      case 'compressor': {
        // Compressors consume work (W < 0), requires cooling (Q < 0)
        q = params.heatTransferRateKW ?? -25.0; // cooling jacket
        const idealDeltaH = (params.exitEnthalpyKJperKg ?? h1 * 1.45) - h1;
        const actualDeltaH = idealDeltaH / eta_isen;
        h2 = h1 + actualDeltaH;
        const deltaKE = (m * (Math.pow(v2, 2) - Math.pow(v1, 2))) / 2000;
        w = m * (h1 - h2) + q - deltaKE - deltaPE; // negative (work input)
        break;
      }
      case 'nozzle': {
        // Nozzles convert enthalpy into kinetic energy: W = 0, Q ~ 0
        w = 0;
        q = 0;
        h2 = params.exitEnthalpyKJperKg ?? h1 * 0.88;
        // V2^2/2000 = V1^2/2000 + (h1 - h2)
        const kineticExit = Math.pow(v1, 2) / 2000 + (h1 - h2) * eta_isen;
        v2 = Math.sqrt(Math.max(0, kineticExit * 2000));
        break;
      }
      case 'diffuser': {
        // Diffusers decelerate flow to increase pressure/enthalpy: W = 0, Q ~ 0
        w = 0;
        q = 0;
        v2 = params.exitVelocityMS ?? v1 * 0.2;
        const deltaKE = (Math.pow(v1, 2) - Math.pow(v2, 2)) / 2000;
        h2 = h1 + deltaKE * eta_isen;
        break;
      }
      case 'boiler': {
        // Heat addition device: W = 0, delta KE ~ 0
        w = 0;
        h2 = params.exitEnthalpyKJperKg ?? h1 * 3.5;
        q = m * (h2 - h1) + deltaPE; // Positive heat supply
        break;
      }
      case 'condenser': {
        // Heat rejection device: W = 0, delta KE ~ 0
        w = 0;
        h2 = params.exitEnthalpyKJperKg ?? h1 * 0.25;
        q = m * (h2 - h1); // Negative heat rejection
        break;
      }
      case 'throttling-valve': {
        // Isenthalpic process: h1 = h2, W = 0, Q = 0
        w = 0;
        q = 0;
        h2 = h1;
        break;
      }
    }

    return {
      deviceType: device,
      massFlowRateKgS: m,
      inletEnthalpyKJperKg: h1,
      exitEnthalpyKJperKg: h2,
      inletVelocityMS: v1,
      exitVelocityMS: v2,
      inletElevationM: z1,
      exitElevationM: z2,
      heatTransferRateKW: q,
      workOutputRateKW: w,
      isentropicEfficiencyPct: eta_isen * 100,
      workTransferKW: w,
      specificWorkKJkg: m > 0 ? w / m : 0,
      deltaKineticEnergy: (m * (v2 * v2 - v1 * v1)) / 2,
      engineeringSummary: `SFEE Device: ${device.toUpperCase()} - Work Output: ${w.toFixed(1)} kW`,
    };
  }

  /**
   * 4. Second Law of Thermodynamics: Heat Engines, Refrigerators & Heat Pumps
   */
  public static calculateThermalDevice(
    type: ThermalDeviceType,
    params: {
      hotReservoirTempK: number;
      coldReservoirTempK: number;
      heatInputOrOutputKJ: number;
      secondLawEfficiencyPct?: number; // 0 to 100%
      ambientTempK?: number;
    }
  ): ThermalDeviceResult {
    const Th = Math.max(1, params.hotReservoirTempK);
    const Tl = Math.max(0.5, params.coldReservoirTempK);

    if (Th <= Tl) {
      throw new Error('Hot reservoir temperature (Th) must be strictly greater than cold reservoir temperature (Tl).');
    }

    const eta_II = Math.min(1.0, Math.max(0.1, (params.secondLawEfficiencyPct ?? 70) / 100));
    const T0 = params.ambientTempK ?? Tl;

    let qh = 0;
    let ql = 0;
    let w = 0;
    let actualMetric = 0;
    let carnotMetric = 0;

    switch (type) {
      case 'heat-engine': {
        // Carnot efficiency: eta_carnot = 1 - Tl/Th
        carnotMetric = 1 - Tl / Th;
        actualMetric = carnotMetric * eta_II;
        qh = params.heatInputOrOutputKJ; // Heat supplied from hot reservoir
        w = qh * actualMetric; // Work output
        ql = qh - w; // Heat rejected to cold reservoir
        break;
      }
      case 'refrigerator': {
        // Carnot COP: COP_R_carnot = Tl / (Th - Tl)
        carnotMetric = Tl / (Th - Tl);
        actualMetric = carnotMetric * eta_II;
        ql = params.heatInputOrOutputKJ; // Cooling effect extracted from cold space
        w = ql / actualMetric; // Work input required
        qh = ql + w; // Heat discharged to ambient
        break;
      }
      case 'heat-pump': {
        // Carnot COP: COP_HP_carnot = Th / (Th - Tl)
        carnotMetric = Th / (Th - Tl);
        actualMetric = carnotMetric * eta_II;
        qh = params.heatInputOrOutputKJ; // Heating effect supplied to warm space
        w = qh / actualMetric; // Work input required
        ql = qh - w; // Heat absorbed from cold outdoor environment
        break;
      }
    }

    // Entropy Generation: S_gen = QL/TL - QH/TH >= 0 (Clausius Inequality)
    // For cycle: Delta S_universe = S_gen = (QL/TL) - (QH/TH)
    const entropyGen = type === 'heat-engine' ? ql / Tl - qh / Th : qh / Th - ql / Tl;

    // Gouy-Stodola Exergy Destruction: I = T0 * S_gen
    const exergyDestruction = T0 * Math.max(0, entropyGen);
    const isCarnotViolated = actualMetric > carnotMetric + 1e-6;

    return {
      deviceType: type,
      hotReservoirTempK: Th,
      coldReservoirTempK: Tl,
      heatInputKJ: qh,
      heatRejectedKJ: ql,
      workNetKJ: w,
      actualCOPOrEfficiency: actualMetric,
      carnotCOPOrEfficiency: carnotMetric,
      secondLawEfficiencyPct: eta_II * 100,
      entropyGenKJperK: Math.max(0, entropyGen),
      exergyDestructionKJ: exergyDestruction,
      isCarnotViolated,
      carnotEfficiency: carnotMetric,
      actualEfficiency: actualMetric,
      entropyGeneratedKJ_K: Math.max(0, entropyGen),
      isPossible: !isCarnotViolated,
    };
  }

  /**
   * Helper for ThermoLabWorkspace Second Law calculations
   */
  public static calculateSecondLaw(params: {
    deviceType: ThermalDeviceType;
    thSourceK: number;
    tlSinkK: number;
    qhKJ: number;
    wActualKJ: number;
  }): ThermalDeviceResult {
    return this.calculateThermalDevice(params.deviceType, {
      hotReservoirTempK: params.thSourceK,
      coldReservoirTempK: params.tlSinkK,
      heatInputOrOutputKJ: params.qhKJ,
    });
  }

  /**
   * 5. Gas Power Cycles (Otto, Diesel, Dual, Brayton, Carnot)
   */
  public static calculateGasCycle(
    cycleOrParams: any,
    paramsInput?: {
      gas?: GasType;
      compressionRatio: number; // r = V1/V2 (e.g., 6 to 12 for Otto, 14 to 22 for Diesel)
      initialPressureKPa?: number;
      initialTempK?: number;
      maxTempK?: number;
      cutoffRatio?: number; // rc = V3/V2 for Diesel
      pressureRatioBrayton?: number; // rp for Brayton
      explosionRatioDual?: number; // rp = P3/P2 for Dual
    }
  ): GasCycleResult {
    let cycle: GasPowerCycleType = 'otto';
    let params: any = paramsInput;

    if (typeof cycleOrParams === 'object' && cycleOrParams.cycleType) {
      cycle = cycleOrParams.cycleType;
      params = {
        gas: 'air',
        compressionRatio: cycleOrParams.compressionRatio ?? 8.5,
        cutoffRatio: cycleOrParams.cutOffRatio ?? cycleOrParams.cutoffRatio,
        pressureRatioBrayton: cycleOrParams.pressureRatio,
        initialPressureKPa: cycleOrParams.p1KPa,
        initialTempK: cycleOrParams.t1K,
        maxTempK: cycleOrParams.t3K,
      };
    } else {
      cycle = cycleOrParams as GasPowerCycleType;
    }
    const gas = (params.gas ?? 'air') as GasType;
    const props = this.GAS_DATABASE[gas] || this.GAS_DATABASE['air'];
    const gamma = props.gamma;
    const cp = props.cp / 1000; // kJ/(kg·K)
    const cv = props.cv / 1000; // kJ/(kg·K)
    const R = props.specificGasConstantR / 1000; // kJ/(kg·K)

    const r = Math.max(1.5, params.compressionRatio);
    const p1 = params.initialPressureKPa ?? 101.325;
    const t1 = params.initialTempK ?? 300;
    const v1 = (R * t1) / p1; // m3/kg

    const states: StatePoint[] = [];
    let qIn = 0;
    let qOut = 0;
    let wNet = 0;
    let etaTh = 0;
    let mepKPa = 0;

    switch (cycle) {
      case 'otto': {
        // State 1: BDC
        states.push({ index: 1, label: 'State 1 (BDC)', pressureKPa: p1, volumeM3: v1, temperatureK: t1 });

        // 1 -> 2: Isentropic Compression: P2 = P1*r^gamma, T2 = T1*r^(gamma-1), V2 = V1/r
        const v2 = v1 / r;
        const p2 = p1 * Math.pow(r, gamma);
        const t2 = t1 * Math.pow(r, gamma - 1);
        states.push({ index: 2, label: 'State 2 (TDC Comp)', pressureKPa: p2, volumeM3: v2, temperatureK: t2 });

        // 2 -> 3: Constant Volume Heat Addition: T3 = maxTemp, V3 = V2, P3 = P2 * (T3/T2)
        const t3 = params.maxTempK ?? t2 * 2.2;
        const v3 = v2;
        const p3 = p2 * (t3 / t2);
        states.push({ index: 3, label: 'State 3 (Peak P, T)', pressureKPa: p3, volumeM3: v3, temperatureK: t3 });

        // 3 -> 4: Isentropic Expansion: V4 = V1, P4 = P3 / r^gamma, T4 = T3 / r^(gamma-1)
        const v4 = v1;
        const p4 = p3 / Math.pow(r, gamma);
        const t4 = t3 / Math.pow(r, gamma - 1);
        states.push({ index: 4, label: 'State 4 (Exhaust)', pressureKPa: p4, volumeM3: v4, temperatureK: t4 });

        qIn = cv * (t3 - t2);
        qOut = cv * (t4 - t1);
        wNet = qIn - qOut;
        etaTh = (1 - 1 / Math.pow(r, gamma - 1)) * 100;
        mepKPa = wNet / (v1 - v2);
        break;
      }

      case 'diesel': {
        const rc = Math.max(1.1, params.cutoffRatio ?? 2.0); // Cutoff ratio rc = V3/V2
        states.push({ index: 1, label: 'State 1 (BDC)', pressureKPa: p1, volumeM3: v1, temperatureK: t1 });

        // 1 -> 2: Isentropic Compression
        const v2 = v1 / r;
        const p2 = p1 * Math.pow(r, gamma);
        const t2 = t1 * Math.pow(r, gamma - 1);
        states.push({ index: 2, label: 'State 2 (TDC)', pressureKPa: p2, volumeM3: v2, temperatureK: t2 });

        // 2 -> 3: Constant Pressure Heat Addition: P3 = P2, V3 = rc * V2, T3 = T2 * rc
        const p3 = p2;
        const v3 = rc * v2;
        const t3 = t2 * rc;
        states.push({ index: 3, label: 'State 3 (Cutoff)', pressureKPa: p3, volumeM3: v3, temperatureK: t3 });

        // 3 -> 4: Isentropic Expansion: expansion ratio = V4/V3 = (V1/V2) / (V3/V2) = r / rc
        const v4 = v1;
        const expRatio = r / rc;
        const p4 = p3 / Math.pow(expRatio, gamma);
        const t4 = t3 / Math.pow(expRatio, gamma - 1);
        states.push({ index: 4, label: 'State 4 (Exhaust)', pressureKPa: p4, volumeM3: v4, temperatureK: t4 });

        qIn = cp * (t3 - t2);
        qOut = cv * (t4 - t1);
        wNet = qIn - qOut;
        const bracket = (Math.pow(rc, gamma) - 1) / (gamma * (rc - 1));
        etaTh = (1 - (1 / Math.pow(r, gamma - 1)) * bracket) * 100;
        mepKPa = wNet / (v1 - v2);
        break;
      }

      case 'brayton': {
        // Gas turbine cycle: P1, P2 from pressure ratio rp = P2/P1
        const rp = Math.max(2.0, params.pressureRatioBrayton ?? 8.0);
        states.push({ index: 1, label: 'State 1 (Compressor In)', pressureKPa: p1, volumeM3: v1, temperatureK: t1 });

        // 1 -> 2: Isentropic Compression: P2 = P1*rp, T2 = T1 * rp^((gamma-1)/gamma)
        const p2 = p1 * rp;
        const t2 = t1 * Math.pow(rp, (gamma - 1) / gamma);
        const v2 = (R * t2) / p2;
        states.push({ index: 2, label: 'State 2 (Compressor Out)', pressureKPa: p2, volumeM3: v2, temperatureK: t2 });

        // 2 -> 3: Constant Pressure Combustion: P3 = P2, T3 = maxTemp
        const t3 = params.maxTempK ?? t2 * 1.8;
        const p3 = p2;
        const v3 = (R * t3) / p3;
        states.push({ index: 3, label: 'State 3 (Turbine In)', pressureKPa: p3, volumeM3: v3, temperatureK: t3 });

        // 3 -> 4: Isentropic Expansion: P4 = P1, T4 = T3 / rp^((gamma-1)/gamma)
        const p4 = p1;
        const t4 = t3 / Math.pow(rp, (gamma - 1) / gamma);
        const v4 = (R * t4) / p4;
        states.push({ index: 4, label: 'State 4 (Turbine Out)', pressureKPa: p4, volumeM3: v4, temperatureK: t4 });

        qIn = cp * (t3 - t2);
        qOut = cp * (t4 - t1);
        wNet = qIn - qOut;
        etaTh = (1 - 1 / Math.pow(rp, (gamma - 1) / gamma)) * 100;
        mepKPa = wNet / (v4 - v2);
        break;
      }

      default: {
        // Carnot Cycle
        states.push({ index: 1, label: 'State 1', pressureKPa: p1, volumeM3: v1, temperatureK: t1 });
        const v2 = v1 / r;
        const t2 = t1 * Math.pow(r, gamma - 1);
        const p2 = p1 * Math.pow(r, gamma);
        states.push({ index: 2, label: 'State 2', pressureKPa: p2, volumeM3: v2, temperatureK: t2 });

        const v3 = v2 * 1.5;
        const p3 = (p2 * v2) / v3;
        const t3 = t2;
        states.push({ index: 3, label: 'State 3', pressureKPa: p3, volumeM3: v3, temperatureK: t3 });

        const v4 = v1 * 1.5;
        const p4 = (p1 * v1) / v4;
        const t4 = t1;
        states.push({ index: 4, label: 'State 4', pressureKPa: p4, volumeM3: v4, temperatureK: t4 });

        qIn = R * t2 * Math.log(v3 / v2);
        qOut = R * t1 * Math.log(v4 / v1);
        wNet = qIn - qOut;
        etaTh = (1 - t1 / t2) * 100;
        mepKPa = wNet / (v1 - v2);
        break;
      }
    }

    const maxT = Math.max(...states.map((s) => s.temperatureK));
    const minT = Math.min(...states.map((s) => s.temperatureK));
    const carnotEta = (1 - minT / maxT) * 100;

    // Build diagram points for SVG P-V & T-S curves
    const pathPV: { v: number; p: number; stage: string }[] = [];
    const pathTS: { s: number; t: number; stage: string }[] = [];

    for (let st = 0; st < states.length; st++) {
      const sA = states[st];
      const sB = states[(st + 1) % states.length];
      if (!sA || !sB) continue;
      for (let step = 0; step <= 10; step++) {
        const frac = step / 10;
        const vInterp = sA.volumeM3 + (sB.volumeM3 - sA.volumeM3) * frac;
        const pInterp = sA.pressureKPa + (sB.pressureKPa - sA.pressureKPa) * frac;
        const tInterp = sA.temperatureK + (sB.temperatureK - sA.temperatureK) * frac;
        const sInterp = (cv * Math.log(tInterp / t1) + R * Math.log(vInterp / v1));

        pathPV.push({ v: vInterp, p: pInterp, stage: `${sA.label} -> ${sB.label}` });
        pathTS.push({ s: sInterp, t: tInterp, stage: `${sA.label} -> ${sB.label}` });
      }
    }

    return {
      cycleType: cycle,
      compressionRatio: r,
      cutoffRatio: params.cutoffRatio,
      pressureRatio: params.pressureRatioBrayton,
      states,
      heatSuppliedKJperKg: qIn,
      heatRejectedKJperKg: qOut,
      netWorkKJperKg: wNet,
      thermalEfficiencyPct: etaTh,
      carnotEfficiencyPct: carnotEta,
      meanEffectivePressureKPa: mepKPa,
      diagramPathPV: pathPV,
      diagramPathTS: pathTS,
      airStandardEfficiency: etaTh / 100,
      carnotEfficiencyLimit: carnotEta / 100,
      netWorkKJkg: wNet,
    };
  }

  /**
   * 6. Pure Substance (Steam) Property Formulation
   * Evaluates Tsat, hf, hfg, hg, sf, sfg, sg, vf, vg across pressures 0.05 to 200 bar
   */
  public static calculateSteamProperties(
    pressureBarOrParams: any,
    temperatureOrQualityInput?: { temperatureC?: number; drynessFractionX?: number }
  ): SteamPropertiesResult {
    let pressureBar = 1.0;
    let temperatureOrQuality: { temperatureC?: number; drynessFractionX?: number } = temperatureOrQualityInput ?? {};

    if (typeof pressureBarOrParams === 'object' && pressureBarOrParams.pressureBar !== undefined) {
      pressureBar = pressureBarOrParams.pressureBar;
      temperatureOrQuality = {
        temperatureC: pressureBarOrParams.temperatureC,
        drynessFractionX: pressureBarOrParams.drynessFraction ?? pressureBarOrParams.drynessFractionX,
      };
    } else {
      pressureBar = pressureBarOrParams;
    }
    const P = Math.min(220, Math.max(0.04, pressureBar)); // bar

    const pKPa = P * 100;
    // Saturation Temperature (°C)
    let tSat = 100.0;
    if (pKPa <= 101.325) {
      // Inverted Tetens equation for sub-atmospheric to atmospheric
      const Y = Math.log(Math.max(0.611, pKPa) / 0.61078);
      tSat = (237.3 * Y) / (17.27 - Y);
    } else {
      // Antoine equation for high pressure steam (1 to 220 bar)
      // log10(P_bar) = 5.11564 - 1687.537 / (T + 230.17)
      const logP = Math.log10(P);
      tSat = (1687.537 / (5.11564 - logP)) - 230.17;
    }

    // Saturation Enthalpies (kJ/kg)
    const hf = 4.184 * tSat; // Saturated liquid enthalpy
    // Latent heat hfg (kJ/kg) ~ 2257 at 1 bar, decreases to 0 at critical pressure (220.6 bar)
    const hfg = Math.max(0, 2257 * Math.pow(Math.max(0, 1 - P / 220.6), 0.38));
    const hg = hf + hfg;

    // Saturation Entropies (kJ/(kg·K))
    const tSatK = tSat + 273.15;
    const sf = 4.184 * Math.log(tSatK / 273.15);
    const sfg = hfg / tSatK;
    const sg = sf + sfg;

    // Specific Volumes (m3/kg)
    const vf = 0.001 + 0.0001 * (tSat / 300);
    const vg = (0.4615 * tSatK) / pKPa; // Ideal steam vapor approx

    let phase: 'subcooled' | 'saturated-mixture' | 'superheated' = 'saturated-mixture';
    let h = 0;
    let s = 0;
    let v = 0;
    let x = temperatureOrQuality.drynessFractionX;
    let t = temperatureOrQuality.temperatureC ?? tSat;

    if (temperatureOrQuality.temperatureC !== undefined) {
      t = temperatureOrQuality.temperatureC;
      if (t < tSat - 0.1) {
        phase = 'subcooled';
        h = 4.184 * t;
        s = 4.184 * Math.log((t + 273.15) / 273.15);
        v = vf;
        x = 0;
      } else if (t > tSat + 0.1) {
        phase = 'superheated';
        const cp_steam = 2.1; // kJ/(kg·K)
        h = hg + cp_steam * (t - tSat);
        s = sg + cp_steam * Math.log((t + 273.15) / tSatK);
        v = (0.4615 * (t + 273.15)) / pKPa;
        x = 1.0;
      } else {
        phase = 'saturated-mixture';
        x = x ?? 1.0;
        h = hf + x * hfg;
        s = sf + x * sfg;
        v = vf + x * (vg - vf);
      }
    } else {
      phase = 'saturated-mixture';
      x = Math.max(0, Math.min(1.0, x ?? 0.9));
      h = hf + x * hfg;
      s = sf + x * sfg;
      v = vf + x * (vg - vf);
      t = tSat;
    }

    const u = h - (P * 100 * v); // u = h - P*v

    return {
      pressureBar: P,
      temperatureC: t,
      phase,
      drynessFractionX: x,
      specificVolumeM3perKg: v,
      enthalpyKJperKg: h,
      entropyKJperKgK: s,
      internalEnergyKJperKg: u,
      saturationTempC: tSat,
      hf,
      hfg,
      hg,
      sf,
      sfg,
      sg,
      vf,
      vg,
      h,
      s,
      phaseState: phase.toUpperCase(),
    };
  }

  /**
   * 7. Vapor Power Cycle: Rankine Cycle with Reheat & Regeneration
   */
  public static calculateRankineCycle(params: {
    boilerPressureBar: number;
    condenserPressureBar: number;
    turbineInletTempC?: number;
    maxTurbineInletTempC?: number;
    isReheat?: boolean;
    isReheatEnabled?: boolean;
    reheatPressureBar?: number;
    reheatTempC?: number;
    turbineEfficiencyPct?: number;
    pumpEfficiencyPct?: number;
  }): RankineCycleResult {
    const P_boiler = Math.max(5, params.boilerPressureBar);
    const P_cond = Math.max(0.04, Math.min(1.0, params.condenserPressureBar));
    const T1 = params.turbineInletTempC ?? params.maxTurbineInletTempC ?? 450;
    const eta_turb = (params.turbineEfficiencyPct ?? 88) / 100;
    const eta_pump = (params.pumpEfficiencyPct ?? 85) / 100;

    // State 1: Turbine inlet (High pressure, Superheated steam)
    const st1 = this.calculateSteamProperties(P_boiler, { temperatureC: T1 });
    const h1 = st1.enthalpyKJperKg;
    const s1 = st1.entropyKJperKgK;

    // State 2s: Isentropic expansion to condenser pressure: s2s = s1
    const st2_sat = this.calculateSteamProperties(P_cond, { drynessFractionX: 1.0 });
    const x2s = Math.max(0, Math.min(1.0, (s1 - st2_sat.sf) / st2_sat.sfg));
    const h2s = st2_sat.hf + x2s * st2_sat.hfg;
    const h2 = h1 - eta_turb * (h1 - h2s);
    const x2 = Math.max(0, Math.min(1.0, (h2 - st2_sat.hf) / st2_sat.sfg));

    // State 3: Condenser exit (Saturated liquid at P_cond)
    const h3 = st2_sat.hf;
    const s3 = st2_sat.sf;
    const v3 = st2_sat.vf;

    // State 4: Boiler Feed Pump exit: w_pump = v3 * (P_boiler - P_cond)*100 / eta_pump
    const w_pump_ideal = v3 * (P_boiler - P_cond) * 100; // kJ/kg
    const w_pump = w_pump_ideal / eta_pump;
    const h4 = h3 + w_pump;
    const s4 = s3;

    let w_turb = h1 - h2;
    let q_in = h1 - h4;
    const q_out = h2 - h3;

    // Reheat calculation if enabled
    let statesList = [
      { state: 1, description: 'Turbine Inlet (Superheated)', pBar: P_boiler, tC: T1, hKJperKg: h1, sKJperKgK: s1, x: 1.0 },
      { state: 2, description: 'Turbine Exhaust / Condenser In', pBar: P_cond, tC: st2_sat.saturationTempC, hKJperKg: h2, sKJperKgK: s1, x: x2 },
      { state: 3, description: 'Condenser Exit (Sat. Liquid)', pBar: P_cond, tC: st2_sat.saturationTempC, hKJperKg: h3, sKJperKgK: s3, x: 0.0 },
      { state: 4, description: 'Boiler Feed Pump Exit (Compressed Liq.)', pBar: P_boiler, tC: st2_sat.saturationTempC + 1.5, hKJperKg: h4, sKJperKgK: s4 },
    ];

    if (params.isReheatEnabled) {
      const P_reheat = params.reheatPressureBar ?? P_boiler * 0.25;
      const T_reheat = params.reheatTempC ?? T1;
      // HP turbine expansion 1 -> 2rh
      const st_rh_sat = this.calculateSteamProperties(P_reheat, { drynessFractionX: 1.0 });
      const x_rh_s = Math.max(0, Math.min(1.0, (s1 - st_rh_sat.sf) / st_rh_sat.sfg));
      const h_rh_s = st_rh_sat.hf + x_rh_s * st_rh_sat.hfg;
      const h2_hp = h1 - eta_turb * (h1 - h_rh_s);
      const w_hp = h1 - h2_hp;

      // Reheat to T_reheat
      const st3_rh = this.calculateSteamProperties(P_reheat, { temperatureC: T_reheat });
      const h3_rh = st3_rh.enthalpyKJperKg;
      const s3_rh = st3_rh.entropyKJperKgK;
      const q_reheat = h3_rh - h2_hp;

      // LP turbine expansion 3rh -> 4lp
      const x_lp_s = Math.max(0, Math.min(1.0, (s3_rh - st2_sat.sf) / st2_sat.sfg));
      const h_lp_s = st2_sat.hf + x_lp_s * st2_sat.hfg;
      const h4_lp = h3_rh - eta_turb * (h3_rh - h_lp_s);
      const w_lp = h3_rh - h4_lp;

      w_turb = w_hp + w_lp;
      q_in = (h1 - h4) + q_reheat;
    }

    const w_net = w_turb - w_pump;
    const eta_th = (w_net / q_in) * 100;
    const bwr = (w_pump / w_turb) * 100;
    const ssc = 3600 / w_net; // kg/(kW·h)

    // Carnot limit between T1 and Condenser Tsat
    const tMaxK = T1 + 273.15;
    const tMinK = st2_sat.saturationTempC + 273.15;
    const carnotEta = (1 - tMinK / tMaxK) * 100;

    return {
      boilerPressureBar: P_boiler,
      condenserPressureBar: P_cond,
      turbineInletTempC: T1,
      isReheatEnabled: !!params.isReheatEnabled,
      reheatPressureBar: params.reheatPressureBar,
      reheatTempC: params.reheatTempC,
      turbineWorkKJperKg: w_turb,
      pumpWorkKJperKg: w_pump,
      netWorkOutputKJperKg: w_net,
      heatSuppliedKJperKg: q_in,
      heatRejectedKJperKg: q_out,
      thermalEfficiencyPct: eta_th,
      carnotEfficiencyPct: carnotEta,
      backWorkRatioPct: bwr,
      specificSteamConsumptionKgPerKWh: ssc,
      thermalEfficiency: eta_th / 100,
      specificSteamConsumptionKgKWh: ssc,
      netWorkKJkg: w_net,
      turbineWorkKJkg: w_turb,
      heatSuppliedKJkg: q_in,
      states: statesList,
    };
  }

  /**
   * 8. Psychrometry & Environmental Thermal Management (Unit V)
   */
  public static calculatePsychrometricState(
    dryBulbTempC: number,
    relativeHumidityPct: number,
    process: PsychrometricProcessType = 'sensible-heating',
    options?: {
      targetExitTempC?: number;
      airMassFlowRateKgS?: number;
      coolingLoadKW?: number;
      atmosphericPressureKPa?: number;
    }
  ): PsychrometricResult {
    const P_atm = options?.atmosphericPressureKPa ?? 101.325; // kPa
    const t_db = dryBulbTempC;
    const rh = Math.max(1, Math.min(100, relativeHumidityPct)) / 100;

    // Saturation vapor pressure (Tetens formula): P_vs in kPa
    const P_vs = 0.61078 * Math.exp((17.27 * t_db) / (t_db + 237.3));
    const P_v = rh * P_vs; // Actual partial pressure of water vapor

    // Humidity Ratio (Specific Humidity): omega = 0.622 * Pv / (Patm - Pv) [kg w / kg dry air]
    const omega = (0.622 * P_v) / (P_atm - P_v);
    const omegaGrams = omega * 1000;

    // Dew Point Temperature: T_dp = (237.3 * ln(Pv/0.61078)) / (17.27 - ln(Pv/0.61078))
    const lnPv = Math.log(Math.max(0.001, P_v) / 0.61078);
    const t_dp = (237.3 * lnPv) / (17.27 - lnPv);

    // Wet Bulb Temperature (Stull empirical approximation):
    const t_wb =
      t_db * Math.atan(0.151977 * Math.pow(rh * 100 + 8.313659, 0.5)) +
      Math.atan(t_db + rh * 100) -
      Math.atan(rh * 100 - 1.676331) +
      0.00391838 * Math.pow(rh * 100, 1.5) * Math.atan(0.023101 * rh * 100) -
      4.686035;

    // Specific Enthalpy: h = 1.006*Tdb + omega*(2501 + 1.86*Tdb) [kJ/kg dry air]
    const h = 1.006 * t_db + omega * (2501 + 1.86 * t_db);

    // Specific Volume: v = Ra * T / (Patm - Pv) = 0.287 * (T+273.15) / (Patm - Pv)
    const v = (0.28705 * (t_db + 273.15)) / (P_atm - P_v);

    // Process Analysis
    let exitTdb = t_db;
    let exitRH = rh * 100;
    let coolingCapacity = options?.coolingLoadKW ?? 5.0; // kW
    const m_air = options?.airMassFlowRateKgS ?? 0.5; // kg/s

    switch (process) {
      case 'sensible-heating': {
        exitTdb = options?.targetExitTempC ?? t_db + 10;
        // omega constant, exit Pv constant, higher Tdb -> lower RH
        const exitPvs = 0.61078 * Math.exp((17.27 * exitTdb) / (exitTdb + 237.3));
        exitRH = Math.min(100, (P_v / exitPvs) * 100);
        break;
      }
      case 'sensible-cooling': {
        exitTdb = Math.max(t_dp + 1, options?.targetExitTempC ?? t_db - 8);
        const exitPvs = 0.61078 * Math.exp((17.27 * exitTdb) / (exitTdb + 237.3));
        exitRH = Math.min(100, (P_v / exitPvs) * 100);
        break;
      }
      case 'cooling-dehumidification': {
        // Air cooled below dew point: moisture condenses
        exitTdb = options?.targetExitTempC ?? Math.min(t_db - 12, 14);
        exitRH = 90; // Near saturation at cooling coil exit
        break;
      }
      case 'evaporative-cooling': {
        // Enthalpy / Wet bulb temperature constant
        exitTdb = t_wb + (t_db - t_wb) * 0.2; // 80% saturation effectiveness
        exitRH = 85;
        break;
      }
      case 'ev-cabin-comfort': {
        // Target 22°C, 50% RH for EV Cabin / Data Center thermal comfort
        exitTdb = 22.0;
        exitRH = 50.0;
        coolingCapacity = m_air * (h - (1.006 * 22 + 0.008 * 2540));
        break;
      }
    }

    return {
      dryBulbTempC: t_db,
      relativeHumidityPct: rh * 100,
      atmosphericPressureKPa: P_atm,
      saturationVaporPressureKPa: P_vs,
      actualVaporPressureKPa: P_v,
      humidityRatioGramsPerKgDryAir: omegaGrams,
      dewPointTempC: t_dp,
      wetBulbTempC: t_wb,
      enthalpyKJperKgDryAir: h,
      specificVolumeM3perKgDryAir: v,
      coolingCapacityKW: Math.max(0, coolingCapacity),
      airMassFlowRateKgS: m_air,
      processName: process,
      exitDryBulbTempC: exitTdb,
      exitRelativeHumidityPct: exitRH,
      sensibleHeatRatio: 0.75,
      humidityRatioKgKg: omega,
      enthalpyKJkg: h,
      vaporPressureKPa: P_v,
    };
  }

  /**
   * Helper for ThermoLabWorkspace Psychrometry calculations
   */
  public static calculatePsychrometry(params: {
    dryBulbTempC: number;
    relativeHumidityPct: number;
    processType: PsychrometricProcessType;
  }): PsychrometricResult {
    return this.calculatePsychrometricState(params.dryBulbTempC, params.relativeHumidityPct, params.processType);
  }
}
