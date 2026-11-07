/**
 * PiyushDhara Eduverse — Thermal Engineering (U25ME402)
 * Pure Deterministic Engineering Calculation Engine
 * Free of UI dependencies and safe from eval() / Function()
 */

import type {
  ConductionParams,
  ConvectionParams,
  RadiationParams,
  HeatTransferResult,
  CompositeWallParams,
  CompositeWallResult,
  LayerCalculation,
  HeatExchangerParams,
  HeatExchangerResult,
  BoilerParams,
  BoilerResult,
  RefrigerationParams,
  RefrigerationResult,
  RefrigerationStatePoint,
  EnergyBalanceInput,
  EnergyBalanceResult,
  ThermalQuizQuestion,
} from './types';

export class ThermalEngineeringCalculator {
  public static readonly STEFAN_BOLTZMANN = 5.670374419e-8; // W/(m²·K⁴)

  public static readonly MATERIAL_CONDUCTIVITIES: Record<string, number> = {
    copper: 386.0,
    aluminum: 205.0,
    'mild-steel': 54.0,
    'stainless-steel': 16.0,
    'common-brick': 0.72,
    'insulating-brick': 0.15,
    'refractory-brick': 1.25,
    'glass-wool': 0.038,
    fiberglass: 0.035,
    'air-gap': 0.026,
  };

  public static readonly FLUID_CONVECTION_H: Record<string, number> = {
    'air-free': 8.5,       // Free convection in air (5 - 25 W/m²K)
    'air-forced': 45.0,    // Forced air cooling (25 - 250 W/m²K)
    'water-forced': 1200.0,// Forced water flow (500 - 10000 W/m²K)
    'engine-oil': 180.0,   // Forced lubrication oil (50 - 500 W/m²K)
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 1: Heat Transfer Explorer (Conduction, Convection, Radiation)
  // ═══════════════════════════════════════════════════════════════════════════

  public static computeConduction(params: ConductionParams): HeatTransferResult {
    const k = this.MATERIAL_CONDUCTIVITIES[params.material] || 50.0;
    const { thicknessM, areaM2, tempHotC, tempColdC } = params;

    const safeThickness = Math.max(0.001, thicknessM);
    const safeArea = Math.max(0.001, areaM2);
    const deltaT = tempHotC - tempColdC;

    // Fourier's Law of Heat Conduction: Q = (k * A * ΔT) / L
    const heatRateWatts = (k * safeArea * deltaT) / safeThickness;
    const heatFluxWPerM2 = heatRateWatts / safeArea;
    const thermalResistanceKPerW = safeThickness / (k * safeArea);
    const temperatureGradientKPerM = -deltaT / safeThickness;

    const summaryExplanation = `Steady 1D conduction through ${params.material} (k = ${k} W/m·K) across thickness ${safeThickness * 1000} mm. Temperature drops linearly from ${tempHotC}°C to ${tempColdC}°C at ${Math.abs(temperatureGradientKPerM).toFixed(1)} K/m.`;

    return {
      mode: 'conduction',
      heatRateWatts,
      heatFluxWPerM2,
      thermalResistanceKPerW,
      temperatureGradientKPerM,
      summaryExplanation,
      governingEquation: 'Q_dot = (k * A * (T_1 - T_2)) / L',
    };
  }

  public static computeConvection(params: ConvectionParams): HeatTransferResult {
    const h = params.convectionCoeffWM2K || this.FLUID_CONVECTION_H[params.fluid] || 25.0;
    const { surfaceAreaM2, surfaceTempC, ambientTempC } = params;

    const safeArea = Math.max(0.001, surfaceAreaM2);
    const deltaT = surfaceTempC - ambientTempC;

    // Newton's Law of Cooling: Q = h * A * (Ts - T_inf)
    const heatRateWatts = h * safeArea * deltaT;
    const heatFluxWPerM2 = h * deltaT;
    const thermalResistanceKPerW = 1 / (h * safeArea);

    const summaryExplanation = `Convective heat dissipation to ${params.fluid} (h = ${h} W/m²·K) across ${safeArea} m² surface. Heat transfers from the surface (${surfaceTempC}°C) to ambient fluid (${ambientTempC}°C).`;

    return {
      mode: 'convection',
      heatRateWatts,
      heatFluxWPerM2,
      thermalResistanceKPerW,
      summaryExplanation,
      governingEquation: 'Q_dot = h * A * (T_s - T_infinity)',
    };
  }

  public static computeRadiation(params: RadiationParams): HeatTransferResult {
    const { surfaceEmissivity, surfaceAreaM2, surfaceTempC, surroundingTempC } = params;
    const eps = Math.min(1.0, Math.max(0.01, surfaceEmissivity));
    const safeArea = Math.max(0.001, surfaceAreaM2);

    // Absolute temperatures in Kelvin (T_K = T_C + 273.15)
    const tSurfaceK = surfaceTempC + 273.15;
    const tSurroundingK = surroundingTempC + 273.15;

    // Stefan-Boltzmann Law: Q = eps * sigma * A * (Ts^4 - Tsur^4)
    const heatRateWatts = eps * this.STEFAN_BOLTZMANN * safeArea * (Math.pow(tSurfaceK, 4) - Math.pow(tSurroundingK, 4));
    const heatFluxWPerM2 = heatRateWatts / safeArea;

    // Equivalent linearized radiation resistance: R_rad = (Ts - Tsur) / Q
    const deltaT = surfaceTempC - surroundingTempC;
    const thermalResistanceKPerW = Math.abs(heatRateWatts) > 1e-4 ? Math.abs(deltaT / heatRateWatts) : 0;

    const summaryExplanation = `Diffuse gray-surface radiation exchange (ε = ${eps}) with large black surrounding enclosure at ${surroundingTempC}°C (${tSurroundingK.toFixed(1)} K). Governed by the fourth-power Stefan-Boltzmann formulation.`;

    return {
      mode: 'radiation',
      heatRateWatts,
      heatFluxWPerM2,
      thermalResistanceKPerW,
      summaryExplanation,
      governingEquation: 'Q_dot = epsilon * sigma * A * (T_s^4 - T_sur^4) [Kelvin]',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 2: Thermal Resistance and Composite Walls
  // ═══════════════════════════════════════════════════════════════════════════

  public static computeCompositeWall(params: CompositeWallParams): CompositeWallResult {
    const { layers, surfaceAreaM2, insideTempC, outsideTempC, innerConvectionH, outerConvectionH } = params;
    const safeArea = Math.max(0.001, surfaceAreaM2);
    const deltaTTotal = insideTempC - outsideTempC;

    let rTotal = 0;

    // Inner film resistance: R_in = 1 / (h_in * A)
    const rInner = innerConvectionH && innerConvectionH > 0 ? 1 / (innerConvectionH * safeArea) : 0;
    rTotal += rInner;

    // Conduction resistances for each solid layer: R_i = L_i / (k_i * A)
    const layerResistances: number[] = [];
    for (const l of layers) {
      const thickM = Math.max(0.0005, l.thicknessMM / 1000);
      const k = Math.max(0.001, l.thermalConductivityWMK || this.MATERIAL_CONDUCTIVITIES[l.material] || 1.0);
      const r = thickM / (k * safeArea);
      layerResistances.push(r);
      rTotal += r;
    }

    // Outer film resistance: R_out = 1 / (h_out * A)
    const rOuter = outerConvectionH && outerConvectionH > 0 ? 1 / (outerConvectionH * safeArea) : 0;
    rTotal += rOuter;

    // Heat transfer rate: Q = ΔT_total / R_total
    const heatRateWatts = rTotal > 0 ? deltaTTotal / rTotal : 0;
    const heatFluxWPerM2 = heatRateWatts / safeArea;
    const overallHeatTransferCoeffWM2K = rTotal > 0 ? 1 / (rTotal * safeArea) : 0;

    // Interface temperatures layer-by-layer
    let currentTemp = insideTempC - heatRateWatts * rInner;
    const layerCalculations: LayerCalculation[] = [];

    for (let i = 0; i < layers.length; i++) {
      const l = layers[i]!;
      const r = layerResistances[i]!;
      const tempDrop = heatRateWatts * r;
      const leftTemp = currentTemp;
      const rightTemp = currentTemp - tempDrop;
      currentTemp = rightTemp;

      layerCalculations.push({
        layerId: l.id,
        name: l.name,
        thicknessM: l.thicknessMM / 1000,
        resistanceKPerW: r,
        tempDropC: tempDrop,
        interfaceTempLeftC: leftTemp,
        interfaceTempRightC: rightTemp,
        percentResistance: rTotal > 0 ? (r / rTotal) * 100 : 0,
      });
    }

    // Critical radius of insulation for cylindrical walls (rc = k / h_out)
    let criticalInsulationThicknessMM: number | undefined;
    if (layers.length > 0 && outerConvectionH && outerConvectionH > 0) {
      const outerLayerK = layers[layers.length - 1]!.thermalConductivityWMK;
      criticalInsulationThicknessMM = (outerLayerK / outerConvectionH) * 1000;
    }

    return {
      totalThermalResistanceKPerW: rTotal,
      overallHeatTransferCoeffWM2K,
      heatRateWatts,
      heatFluxWPerM2,
      layerCalculations,
      criticalInsulationThicknessMM,
    };
  }

  public static computeCriticalRadius(k: number, hOut: number): { criticalRadiusM: number; criticalRadiusMM: number } {
    const safeH = Math.max(0.001, hOut);
    const rCritM = k / safeH;
    return {
      criticalRadiusM: rCritM,
      criticalRadiusMM: rCritM * 1000,
    };
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 3: Heat Exchanger Simulation (LMTD & Effectiveness-NTU)
  // ═══════════════════════════════════════════════════════════════════════════

  public static computeHeatExchanger(params: HeatExchangerParams): HeatExchangerResult {
    const {
      flowType,
      hotFluidMassFlowKgS,
      hotFluidInletTempC,
      hotFluidSpecificHeatJPerKgK,
      coldFluidMassFlowKgS,
      coldFluidInletTempC,
      coldFluidSpecificHeatJPerKgK,
      overallHeatTransferCoeffWM2K,
      surfaceAreaM2,
    } = params;

    // Heat capacity rates in W/K and kW/K: C = m_dot * cp
    const cHotW = hotFluidMassFlowKgS * hotFluidSpecificHeatJPerKgK;
    const cColdW = coldFluidMassFlowKgS * coldFluidSpecificHeatJPerKgK;

    const cHotKWPerK = cHotW / 1000;
    const cColdKWPerK = cColdW / 1000;

    const cMinW = Math.min(cHotW, cColdW);
    const cMaxW = Math.max(cHotW, cColdW);
    const cMinKWPerK = cMinW / 1000;
    const cMaxKWPerK = cMaxW / 1000;
    const capacityRatioC = cMaxW > 0 ? cMinW / cMaxW : 0;

    // Number of Transfer Units: NTU = U * A / C_min
    const uaWPerK = overallHeatTransferCoeffWM2K * surfaceAreaM2;
    const ntu = cMinW > 0 ? uaWPerK / cMinW : 0;

    // Effectiveness ε calculation based on flow configuration
    let effectiveness = 0;
    if (flowType === 'parallel') {
      // Parallel Flow: ε = (1 - exp(-NTU * (1 + Cr))) / (1 + Cr)
      effectiveness = (1 - Math.exp(-ntu * (1 + capacityRatioC))) / (1 + capacityRatioC);
    } else {
      // Counter Flow:
      if (Math.abs(capacityRatioC - 1.0) < 1e-4) {
        // Special case: Cr = 1
        effectiveness = ntu / (1 + ntu);
      } else {
        const expTerm = Math.exp(-ntu * (1 - capacityRatioC));
        effectiveness = (1 - expTerm) / (1 - capacityRatioC * expTerm);
      }
    }
    effectiveness = Math.min(0.999, Math.max(0.001, effectiveness));

    // Maximum possible heat transfer rate: Q_max = C_min * (Th_in - Tc_in)
    const maxTempDiff = hotFluidInletTempC - coldFluidInletTempC;
    const qMaxW = cMinW * maxTempDiff;

    // Actual heat transfer rate: Q = ε * Q_max
    const heatTransferRateW = effectiveness * qMaxW;
    const heatTransferRateKW = heatTransferRateW / 1000;

    // Fluid outlet temperatures:
    // Q = Ch * (Th_in - Th_out) => Th_out = Th_in - Q / Ch
    // Q = Cc * (Tc_out - Tc_in) => Tc_out = Tc_in + Q / Cc
    const hotFluidOutletTempC = hotFluidInletTempC - heatTransferRateW / cHotW;
    const coldFluidOutletTempC = coldFluidInletTempC + heatTransferRateW / cColdW;

    // LMTD calculation:
    let deltaT1 = 0;
    let deltaT2 = 0;
    if (flowType === 'parallel') {
      deltaT1 = hotFluidInletTempC - coldFluidInletTempC;
      deltaT2 = hotFluidOutletTempC - coldFluidOutletTempC;
    } else {
      deltaT1 = hotFluidInletTempC - coldFluidOutletTempC;
      deltaT2 = hotFluidOutletTempC - coldFluidInletTempC;
    }

    let lmtdC = 0;
    if (deltaT1 > 0 && deltaT2 > 0) {
      if (Math.abs(deltaT1 - deltaT2) < 0.05) {
        lmtdC = (deltaT1 + deltaT2) / 2;
      } else {
        lmtdC = (deltaT1 - deltaT2) / Math.log(deltaT1 / deltaT2);
      }
    }

    // Energy balance check
    const qHotW = cHotW * (hotFluidInletTempC - hotFluidOutletTempC);
    const qColdW = cColdW * (coldFluidOutletTempC - coldFluidInletTempC);
    const energyBalanceDiscrepancyWatts = Math.abs(qHotW - qColdW);

    // Temperature profile along the length of exchanger (11 nodes: 0% to 100%)
    const temperatureProfile: HeatExchangerResult['temperatureProfile'] = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const x = i / steps; // 0 to 1
      let th = 0;
      let tc = 0;

      if (flowType === 'parallel') {
        th = hotFluidInletTempC - (hotFluidInletTempC - hotFluidOutletTempC) * (1 - Math.exp(-2.5 * x));
        tc = coldFluidInletTempC + (coldFluidOutletTempC - coldFluidInletTempC) * (1 - Math.exp(-2.5 * x));
      } else {
        // Counter flow: hot flows 0 -> 1, cold flows 1 -> 0
        th = hotFluidInletTempC - (hotFluidInletTempC - hotFluidOutletTempC) * x;
        tc = coldFluidOutletTempC - (coldFluidOutletTempC - coldFluidInletTempC) * x;
      }

      temperatureProfile.push({
        relativePosition: x,
        hotTempC: th,
        coldTempC: tc,
      });
    }

    return {
      flowType,
      hotFluidOutletTempC,
      coldFluidOutletTempC,
      heatTransferRateKW,
      lmtdC,
      ntu,
      effectiveness,
      capacityRatioC,
      cHotKWPerK,
      cColdKWPerK,
      cMinKWPerK,
      cMaxKWPerK,
      energyBalanceDiscrepancyWatts,
      temperatureProfile,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 4: Boilers and Steam-Generation Systems
  // ═══════════════════════════════════════════════════════════════════════════

  public static computeBoilerPerformance(params: BoilerParams): BoilerResult {
    const {
      boilerType,
      steamGenerationRateKgH,
      operatingPressureBar,
      feedwaterTempC,
      steamCondition,
      superheatTempC,
      fuelConsumptionRateKgH,
      fuelCalorificValueKJPerKg,
    } = params;

    // Water saturation temperature at pressure P (approximate Antoine/IAPWS formulation):
    // Tsat ≈ 100 * P^0.24 (°C) for P between 1 and 40 bar
    const satTempC = 99.6 * Math.pow(Math.max(1, operatingPressureBar), 0.235);

    // Saturated water and steam enthalpies (kJ/kg)
    const hf = 4.186 * satTempC;
    const hfg = 2257.0 - 2.1 * (satTempC - 100);
    const hg = hf + hfg;

    // Feedwater enthalpy: h_f1 ≈ cp_water * T_fw
    const feedwaterEnthalpyKJPerKg = 4.186 * feedwaterTempC;

    // Steam enthalpy calculation
    let steamEnthalpyKJPerKg = hg;
    if (steamCondition === 'superheated' && superheatTempC && superheatTempC > satTempC) {
      const cSuperheat = 2.1; // kJ/kg·K for superheated steam
      steamEnthalpyKJPerKg = hg + cSuperheat * (superheatTempC - satTempC);
    }

    // Actual evaporation rate: m_a (kg/h)
    const actualEvaporationKgH = steamGenerationRateKgH;

    // Equivalent Evaporation from and at 100°C:
    // m_e = [m_a * (h - h_f1)] / 2257 (kg/h)
    const latentHeatAt100C = 2257.0; // kJ/kg
    const heatAbsorbedPerKg = steamEnthalpyKJPerKg - feedwaterEnthalpyKJPerKg;
    const factorOfEvaporation = heatAbsorbedPerKg / latentHeatAt100C;
    const equivalentEvaporationFromAt100C = actualEvaporationKgH * factorOfEvaporation;

    // Thermal energy rates:
    // Useful heat absorbed by steam: Q_absorbed = m_a * (h - h_f1) / 3600 (kW)
    const usefulHeatAbsorbedKW = (actualEvaporationKgH * heatAbsorbedPerKg) / 3600;

    // Heat supplied by fuel: Q_supplied = m_f * CV / 3600 (kW)
    const totalHeatSuppliedKW = (fuelConsumptionRateKgH * fuelCalorificValueKJPerKg) / 3600;

    // Boiler thermal efficiency: η_b = (Useful Heat / Total Heat Supplied) * 100%
    const boilerEfficiencyPercent = totalHeatSuppliedKW > 0 ? (usefulHeatAbsorbedKW / totalHeatSuppliedKW) * 100 : 0;

    // Heat balance sheet breakdown (First Law of Thermodynamics):
    const flueGasHeatLossKW = totalHeatSuppliedKW * 0.12; // ~12% stack loss
    const moistureHeatLossKW = totalHeatSuppliedKW * 0.04; // ~4% hydrogen/moisture loss
    const radiationHeatLossKW = Math.max(0, totalHeatSuppliedKW - usefulHeatAbsorbedKW - flueGasHeatLossKW - moistureHeatLossKW);

    const heatBalanceSheet = [
      {
        category: 'Useful heat absorbed in steam generation',
        heatKW: usefulHeatAbsorbedKW,
        percentage: boilerEfficiencyPercent,
      },
      {
        category: 'Heat carried away by dry flue gases (chimney stack)',
        heatKW: flueGasHeatLossKW,
        percentage: (flueGasHeatLossKW / totalHeatSuppliedKW) * 100,
      },
      {
        category: 'Heat loss due to fuel moisture & hydrogen combustion',
        heatKW: moistureHeatLossKW,
        percentage: (moistureHeatLossKW / totalHeatSuppliedKW) * 100,
      },
      {
        category: 'Surface convection, radiation & unaccounted losses',
        heatKW: radiationHeatLossKW,
        percentage: (radiationHeatLossKW / totalHeatSuppliedKW) * 100,
      },
    ];

    const criticalMountings: BoilerResult['criticalMountings'] = [
      { name: 'Dead-weight / Spring-loaded Safety Valve', role: 'Prevents internal over-pressurization above MAWP', status: 'operational' },
      { name: 'Bourdon Tube Pressure Gauge', role: 'Continuous monitoring of steam drum pressure', status: 'operational' },
      { name: 'Water Level Indicator (Gauge Glass)', role: 'Visual confirmation of safe water level in the boiler drum', status: 'operational' },
      { name: 'Fusible Plug', role: 'Extinguishes furnace fire if water drops to dangerously low level', status: 'inspected' },
      { name: 'Feed Check Valve', role: 'Non-return valve permitting unidirectional water inlet into drum', status: 'operational' },
      { name: 'Blow-off Cock', role: 'Periodically evacuates sediment, mud, and precipitate scale from drum base', status: 'operational' },
    ];

    return {
      boilerType,
      actualEvaporationKgH,
      equivalentEvaporationFromAt100C,
      factorOfEvaporation,
      boilerEfficiencyPercent,
      steamEnthalpyKJPerKg,
      feedwaterEnthalpyKJPerKg,
      usefulHeatAbsorbedKW,
      totalHeatSuppliedKW,
      heatBalanceSheet,
      criticalMountings,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 5: Refrigeration and Air-Conditioning (VCR Cycle)
  // ═══════════════════════════════════════════════════════════════════════════

  public static computeRefrigerationCycle(params: RefrigerationParams): RefrigerationResult {
    const {
      refrigerant,
      evaporatorTempC,
      condenserTempC,
      subcoolingDeltaC,
      superheatingDeltaC,
      coolingCapacityKW,
      compressorIsentropicEfficiency,
    } = params;

    // Saturation pressures and enthalpy approximations (calibrated to R134a / standard thermodynamic tables)
    // Evaporator Saturation Pressure (bar)
    const pEvapBar = Math.max(0.5, 0.05 * Math.exp(0.045 * (evaporatorTempC + 40)));
    // Condenser Saturation Pressure (bar)
    const pCondBar = Math.max(pEvapBar + 1.0, 0.15 * Math.exp(0.038 * (condenserTempC + 40)));
    const pressureRatio = pCondBar / pEvapBar;

    // State 1: Compressor Inlet (Evaporator saturation + superheat)
    const t1 = evaporatorTempC + superheatingDeltaC;
    const h1SatVapor = 390.0 + 0.6 * evaporatorTempC; // kJ/kg
    const h1 = h1SatVapor + 1.02 * superheatingDeltaC;

    // State 2s: Isentropic Compressor Discharge
    // Delta_h_isen = w_isen ≈ 0.287 * T1_K * (rp^((k-1)/k) - 1) * factor
    const t1K = t1 + 273.15;
    const kFactor = 1.14; // adiabatic exponent for refrigerant vapor
    const isentropicWorkKJPerKg = 0.45 * t1K * (Math.pow(pressureRatio, (kFactor - 1) / kFactor) - 1);
    const h2s = h1 + isentropicWorkKJPerKg;

    // State 2: Actual Compressor Discharge
    const etaIsen = Math.min(0.95, Math.max(0.5, compressorIsentropicEfficiency));
    const actualWorkKJPerKg = isentropicWorkKJPerKg / etaIsen;
    const h2 = h1 + actualWorkKJPerKg;
    const t2 = condenserTempC + (h2 - (415 + 0.5 * condenserTempC)) / 1.1;

    // State 3: Condenser Exit (Condenser saturation - subcooling)
    const t3 = condenserTempC - subcoolingDeltaC;
    const h3SatLiquid = 200.0 + 1.4 * condenserTempC; // kJ/kg
    const h3 = h3SatLiquid - 1.45 * subcoolingDeltaC;

    // State 4: Evaporator Inlet (Throttling valve is isenthalpic: h4 = h3)
    const h4 = h3;
    const t4 = evaporatorTempC;

    // Refrigerating effect: q_L = h1 - h4 (kJ/kg)
    const refrigeratingEffectKJPerKg = Math.max(10, h1 - h4);

    // Heat rejected in condenser: q_H = h2 - h3 (kJ/kg)
    const heatRejectedKJPerKg = h2 - h3;

    // Mass flow rate of refrigerant: m_dot = Cooling Capacity / q_L (kg/s)
    const refrigerantMassFlowKgS = coolingCapacityKW / refrigeratingEffectKJPerKg;

    // Compressor power: W_dot = m_dot * w_actual (kW)
    const compressorPowerKW = refrigerantMassFlowKgS * actualWorkKJPerKg;

    // Coefficients of Performance (COP)
    // COP_R = Q_L / W_in = q_L / w_actual
    const copCooling = refrigeratingEffectKJPerKg / actualWorkKJPerKg;
    // COP_HP = Q_H / W_in = COP_R + 1
    const copHeatPump = copCooling + 1.0;

    // Carnot Ideal COP: T_evap / (T_cond - T_evap) in Kelvin
    const tEvapK = evaporatorTempC + 273.15;
    const tCondK = condenserTempC + 273.15;
    const carnotCOP = tEvapK / Math.max(1.0, tCondK - tEvapK);

    // Second Law Efficiency: COP_actual / COP_Carnot
    const secondLawEfficiencyPercent = carnotCOP > 0 ? (copCooling / carnotCOP) * 100 : 0;

    const statePoints: RefrigerationStatePoint[] = [
      {
        point: 1,
        description: 'Compressor Suction (Superheated Vapor)',
        pressureBar: pEvapBar,
        tempC: t1,
        enthalpyKJPerKg: h1,
      },
      {
        point: 2,
        description: 'Compressor Discharge (Superheated High-Pressure Gas)',
        pressureBar: pCondBar,
        tempC: t2,
        enthalpyKJPerKg: h2,
      },
      {
        point: 3,
        description: 'Condenser Exit (Subcooled Liquid)',
        pressureBar: pCondBar,
        tempC: t3,
        enthalpyKJPerKg: h3,
      },
      {
        point: 4,
        description: 'Expansion Valve Exit (Low-Pressure Liquid-Vapor Mixture)',
        pressureBar: pEvapBar,
        tempC: t4,
        enthalpyKJPerKg: h4,
      },
    ];

    return {
      refrigerant,
      statePoints,
      refrigeratingEffectKJPerKg,
      compressorWorkKJPerKg: actualWorkKJPerKg,
      heatRejectedKJPerKg,
      refrigerantMassFlowKgS,
      compressorPowerKW,
      copCooling,
      copHeatPump,
      carnotCOP,
      secondLawEfficiencyPercent,
      pEvapBar,
      pCondBar,
      pressureRatio,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 6: Thermal Energy Balance Calculator (SFEE)
  // ═══════════════════════════════════════════════════════════════════════════

  public static computeEnergyBalance(input: EnergyBalanceInput): EnergyBalanceResult {
    const {
      systemType,
      massFlowRateKgS,
      inletVelocityMS = 10,
      outletVelocityMS = 10,
      inletElevationM = 0,
      outletElevationM = 0,
    } = input;

    const g = 9.81;
    const keInKW = (massFlowRateKgS * Math.pow(inletVelocityMS, 2)) / 2000;
    const keOutKW = (massFlowRateKgS * Math.pow(outletVelocityMS, 2)) / 2000;
    const peInKW = (massFlowRateKgS * g * inletElevationM) / 1000;
    const peOutKW = (massFlowRateKgS * g * outletElevationM) / 1000;

    let hInKJPerKg = input.inletEnthalpyKJPerKg || 4.186 * input.inletTempC;
    let hOutKJPerKg = input.outletEnthalpyKJPerKg || 4.186 * input.outletTempC;

    let calculatedQuantityName = '';
    let calculatedQuantityValue = 0;
    let calculatedQuantityUnit = '';
    let energyInflowKW = 0;
    let energyOutflowKW = 0;
    const stepByStepDerivations: string[] = [];

    if (systemType === 'steam-turbine') {
      // Steam Turbine: Q ≈ 0, ΔPE ≈ 0 => W_shaft = m_dot * (h1 - h2 + (V1² - V2²)/2000)
      hInKJPerKg = input.inletEnthalpyKJPerKg || 3200;
      hOutKJPerKg = input.outletEnthalpyKJPerKg || 2350;
      const enthalpyDropKW = massFlowRateKgS * (hInKJPerKg - hOutKJPerKg);
      const deltaKE = keInKW - keOutKW;
      const workOutKW = enthalpyDropKW + deltaKE;

      calculatedQuantityName = 'Turbine Shaft Power Output';
      calculatedQuantityValue = workOutKW;
      calculatedQuantityUnit = 'kW';

      energyInflowKW = massFlowRateKgS * hInKJPerKg + keInKW + peInKW;
      energyOutflowKW = massFlowRateKgS * hOutKJPerKg + keOutKW + peOutKW + workOutKW;

      stepByStepDerivations.push('1. System Boundary: Adiabatic Steam Turbine (Q_dot ≈ 0, ΔZ ≈ 0)');
      stepByStepDerivations.push(`2. Inflow Enthalpy: h_1 = ${hInKJPerKg.toFixed(1)} kJ/kg, Outflow Enthalpy: h_2 = ${hOutKJPerKg.toFixed(1)} kJ/kg`);
      stepByStepDerivations.push(`3. Specific Enthalpy Drop: Δh = ${(hInKJPerKg - hOutKJPerKg).toFixed(1)} kJ/kg`);
      stepByStepDerivations.push(`4. SFEE: W_dot = m_dot * [(h_1 - h_2) + (V_1² - V_2²)/2000]`);
      stepByStepDerivations.push(`5. Shaft Power: ${workOutKW.toFixed(2)} kW (${(workOutKW / 1000).toFixed(2)} MW)`);
    } else if (systemType === 'compressor') {
      // Compressor: Q ≈ 0 => W_in = m_dot * (h2 - h1)
      hInKJPerKg = 1.005 * (input.inletTempC + 273.15);
      hOutKJPerKg = 1.005 * (input.outletTempC + 273.15);
      const powerInKW = massFlowRateKgS * (hOutKJPerKg - hInKJPerKg);

      calculatedQuantityName = 'Compressor Drive Power Input';
      calculatedQuantityValue = powerInKW;
      calculatedQuantityUnit = 'kW';

      energyInflowKW = massFlowRateKgS * hInKJPerKg + powerInKW;
      energyOutflowKW = massFlowRateKgS * hOutKJPerKg;

      stepByStepDerivations.push('1. System Boundary: Adiabatic Air Compressor (Q_dot ≈ 0)');
      stepByStepDerivations.push(`2. Inflow Temp: ${input.inletTempC}°C, Discharge Temp: ${input.outletTempC}°C`);
      stepByStepDerivations.push(`3. SFEE: W_dot_in = m_dot * c_p * (T_2 - T_1)`);
      stepByStepDerivations.push(`4. Drive Power: ${powerInKW.toFixed(2)} kW`);
    } else if (systemType === 'nozzle') {
      // Nozzle: W = 0, Q ≈ 0 => V2 = sqrt(V1² + 2000 * (h1 - h2))
      hInKJPerKg = input.inletEnthalpyKJPerKg || 3000;
      hOutKJPerKg = input.outletEnthalpyKJPerKg || 2800;
      const deltaH = hInKJPerKg - hOutKJPerKg;
      const exitVelocityMS = Math.sqrt(Math.pow(inletVelocityMS, 2) + 2000 * deltaH);

      calculatedQuantityName = 'Nozzle Exit Jet Velocity';
      calculatedQuantityValue = exitVelocityMS;
      calculatedQuantityUnit = 'm/s';

      energyInflowKW = massFlowRateKgS * (hInKJPerKg + Math.pow(inletVelocityMS, 2) / 2000);
      energyOutflowKW = massFlowRateKgS * (hOutKJPerKg + Math.pow(exitVelocityMS, 2) / 2000);

      stepByStepDerivations.push('1. System Boundary: Adiabatic Flow Nozzle (W_dot = 0, Q_dot = 0)');
      stepByStepDerivations.push(`2. Enthalpy Drop: Δh = ${(deltaH).toFixed(1)} kJ/kg converted into kinetic energy`);
      stepByStepDerivations.push(`3. SFEE: V_2 = sqrt[V_1² + 2000 * (h_1 - h_2)]`);
      stepByStepDerivations.push(`4. Exit Jet Velocity: ${exitVelocityMS.toFixed(1)} m/s (Mach ${(exitVelocityMS / 340).toFixed(2)})`);
    } else {
      // Heat Exchanger / General Sensible Flow
      const deltaT = input.outletTempC - input.inletTempC;
      const cp = 4.186; // kJ/kg·K (water)
      const qKW = massFlowRateKgS * cp * deltaT;

      calculatedQuantityName = 'Heat Transfer Rate (Q_dot)';
      calculatedQuantityValue = qKW;
      calculatedQuantityUnit = 'kW';

      energyInflowKW = massFlowRateKgS * hInKJPerKg + (qKW > 0 ? qKW : 0);
      energyOutflowKW = massFlowRateKgS * hOutKJPerKg + (qKW < 0 ? Math.abs(qKW) : 0);

      stepByStepDerivations.push('1. System Boundary: Steady Flow Heat Exchanger (W_dot = 0, ΔKE ≈ 0)');
      stepByStepDerivations.push(`2. Flow: ${massFlowRateKgS} kg/s, ΔT = ${deltaT.toFixed(1)} K`);
      stepByStepDerivations.push(`3. Equation: Q_dot = m_dot * c_p * (T_out - T_in)`);
      stepByStepDerivations.push(`4. Heat Exchange: ${qKW.toFixed(2)} kW`);
    }

    const balanceSatisfied = Math.abs(energyInflowKW - energyOutflowKW) < 0.1;

    return {
      systemType,
      sfeeEquation: 'm_dot * [h_1 + V_1²/2000 + g*Z_1/1000] + Q_dot = m_dot * [h_2 + V_2²/2000 + g*Z_2/1000] + W_dot',
      calculatedQuantityName,
      calculatedQuantityValue,
      calculatedQuantityUnit,
      energyInflowKW,
      energyOutflowKW,
      balanceSatisfied,
      stepByStepDerivations,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Conceptual Quiz Bank (Curriculum Grounded)
  // ═══════════════════════════════════════════════════════════════════════════

  public static getQuizQuestions(): ThermalQuizQuestion[] {
    return [
      {
        id: 1,
        question: 'Why is a counter-flow heat exchanger thermodynamically superior to a parallel-flow heat exchanger of identical surface area?',
        options: [
          'Counter-flow produces lower fluid pressure drops across both streams',
          'Counter-flow yields a higher Log Mean Temperature Difference (LMTD) and permits the cold fluid outlet temperature to exceed the hot fluid outlet temperature',
          'Counter-flow operates with zero fouling factor resistance',
          'Counter-flow requires no shell baffling',
        ],
        correctAnswer: 1,
        explanation:
          'In counter-flow, the temperature difference between hot and cold streams remains relatively uniform along the length, yielding a higher LMTD. Crucially, Tc,out can exceed Th,out, achieving higher thermal effectiveness than parallel flow.',
        syllabusTopic: 'Unit V: Heat Exchangers and Heat Transfer',
      },
      {
        id: 2,
        question: 'What is the physical definition and standard reference basis for "Equivalent Evaporation" of an industrial steam boiler?',
        options: [
          'The maximum mass of fuel burned per hour in the furnace',
          'The mass of dry saturated steam generated per hour from feedwater at 100°C and at standard atmospheric pressure (1.01325 bar), absorbing 2257 kJ/kg',
          'The volumetric flow rate of flue gases through the chimney economizer',
          'The ratio of boiler volume to grate area',
        ],
        correctAnswer: 1,
        explanation:
          'Equivalent evaporation standardizes boiler performance across varying feedwater temperatures and operating pressures by referencing steam generated from and at 100°C (h_fg = 2257 kJ/kg): m_e = m_a(h - h_f1) / 2257.',
        syllabusTopic: 'Unit II: Boilers and Steam Power Systems',
      },
      {
        id: 3,
        question: 'In a Vapor Compression Refrigeration (VCR) cycle, what thermodynamic process occurs across the thermostatic expansion valve?',
        options: [
          'Reversible isentropic expansion with external shaft work',
          'Isothermal heat addition at constant evaporator pressure',
          'Irreversible isenthalpic throttling at constant enthalpy (h_4 = h_3)',
          'Isochoric depressurization at constant specific volume',
        ],
        correctAnswer: 2,
        explanation:
          'Throttling across an expansion orifice or capillary tube is an unresisted, highly irreversible fluid expansion with zero external work and negligible heat transfer, rendering it strictly isenthalpic: h_exit = h_inlet.',
        syllabusTopic: 'Unit V: Refrigeration and Air Conditioning',
      },
      {
        id: 4,
        question: 'According to Fourier\'s Law of Conduction, if the thickness of a solid plane wall is doubled while keeping boundary temperatures and material constant, what happens to the conductive heat flux?',
        options: [
          'The heat flux doubles',
          'The heat flux is halved',
          'The heat flux quadruples due to area expansion',
          'The heat flux remains unchanged',
        ],
        correctAnswer: 1,
        explanation:
          'Fourier\'s Law states q" = k * ΔT / L. Because conductive heat flux is inversely proportional to thickness L, doubling thickness doubles thermal resistance (R = L/kA) and halves the heat flux.',
        syllabusTopic: 'Unit V: Conduction and Thermal Resistance',
      },
      {
        id: 5,
        question: 'In the Stefan-Boltzmann law for thermal radiation (Q = ε·σ·A·T⁴), what critical temperature unit convention must strictly be obeyed?',
        options: [
          'Degrees Celsius (°C), because standard zero is the freezing point of water',
          'Absolute temperature in Kelvin (K), because radiant energy emissions vanish only at absolute thermodynamic zero',
          'Degrees Fahrenheit (°F)',
          'Degrees Rankine without atmospheric correction',
        ],
        correctAnswer: 1,
        explanation:
          'Radiation emission originates from thermal oscillations of atomic dipoles governed by quantum electrodynamics, vanishing exclusively at 0 K. Using Celsius in T⁴ calculations produces catastrophic numerical errors.',
        syllabusTopic: 'Unit V: Thermal Radiation and Emissivity',
      },
    ];
  }
}
