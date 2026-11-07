/**
 * PiyushDhara Eduverse — 3D Water Supply & Wastewater Engineering Laboratory
 * Course: U25CE403 — Water Supply and Wastewater Engineering (Civil Engineering, Semester IV)
 * Core Environmental Engineering Mathematics & Scientific Calculations Engine
 * 
 * Complies with BIS 10500:2012, CPHEEO Water Supply & Sewerage Manuals,
 * CPCB Effluent Discharge Standards, and Metcalf & Eddy Wastewater Engineering.
 */

import type {
  IWtpState,
  IWtpProcessUnit,
  ISedimentationState,
  ISedimentationResult,
  IFiltrationState,
  IFiltrationResult,
  IWastewaterState,
  IWastewaterResult,
  IDistributionState,
  IDistributionResult,
  IWaterQualityLabState,
  IWaterQualityLabResult,
} from './types';

export class EnvironmentalCalculator {
  public static readonly G = 9.81; // m/s²
  public static readonly WATER_DENSITY = 1000.0; // kg/m³

  // ─────────────────────────────────────────────────────────────
  // 1. CONVENTIONAL WATER TREATMENT PLANT SIZING & PERFORMANCE
  // ─────────────────────────────────────────────────────────────

  public static calculateWtpUnits(state: IWtpState): {
    flowRateM3Hr: number;
    flowRateLps: number;
    dailyAlumUsageKg: number;
    dailyChlorineUsageKg: number;
    predictedEffluentTurbidityNtu: number;
    predictedColiformRemovalPercent: number;
    units: IWtpProcessUnit[];
    effluentTurbidityNtu: number;
    dailyAlumMassKg: number;
    dailyChlorineMassKg: number;
    totalPlantVolumeM3: number;
    meetsBis10500: boolean;
  } {
    const Q_mld = state.plantCapacityMld;
    const Q_m3_day = Q_mld * 1000.0;
    const Q_m3_hr = Q_m3_day / 24.0;
    const Q_lps = (Q_mld * 1e6) / 86400.0;

    // Daily chemical masses
    const dailyAlumKg = (Q_m3_day * state.coagulantAlumDoseMgL) / 1000.0;
    const dailyChlorineKg = (Q_m3_day * state.chlorineDoseMgL) / 1000.0;

    // Turbidity removal through coagulation + settling + filtration
    // Model: Turbidity drops exponentially with effective alum dosage, then 90% in sand filter
    const settledTurbidity = Math.max(1.5, state.rawTurbidityNtu * Math.exp(-0.065 * state.coagulantAlumDoseMgL));
    const filterFactor = state.filterMedia === 'dual-anthracite-sand' ? 0.08 : 0.15;
    const predictedTurbidity = Number(Math.max(0.4, settledTurbidity * filterFactor).toFixed(2));

    // Coliform removal: 99.99% with pre-settling, sand filtration, and post-chlorination
    const predictedColiformRemoval = state.chlorineDoseMgL >= 1.5 ? 99.99 : 98.5;

    // Unit process volumes based on CPHEEO design retention times:
    const units: IWtpProcessUnit[] = [
      {
        id: 'cascade-aerator',
        name: 'Cascade Aerator',
        unitType: 'aeration',
        volumeM3: Number((Q_m3_hr * 0.05).toFixed(1)),
        retentionTimeMinutes: 3.0,
        description: 'Multi-tray circular weir aerating water to strip H₂S and CO₂, oxidize iron and manganese, and elevate DO to saturation.',
        chemicalAdded: 'Atmospheric O₂',
      },
      {
        id: 'flash-mixer',
        name: 'Rapid Flash Mixer',
        unitType: 'coagulation',
        volumeM3: Number((Q_m3_hr * (1.0 / 60.0)).toFixed(1)), // 60 seconds
        retentionTimeMinutes: 1.0,
        description: 'High-speed impeller mixer creating strong velocity gradient (G ≈ 700 s⁻¹) for instantaneous dispersion of alum coagulant.',
        chemicalAdded: `Alum (Al₂(SO₄)₃·18H₂O): ${state.coagulantAlumDoseMgL} mg/L`,
        removalEfficiencyPercent: 10,
      },
      {
        id: 'flocculator',
        name: 'Baffled / Paddle Flocculator',
        unitType: 'flocculation',
        volumeM3: Number((Q_m3_hr * 0.5).toFixed(1)), // 30 minutes
        retentionTimeMinutes: 30.0,
        description: 'Slow-revolving paddle flocculator promoting micro-floc collision, sweep coagulation, and bridge growth without shear breakdown.',
        removalEfficiencyPercent: 25,
      },
      {
        id: 'clarifier',
        name: 'Primary Clariflocculator / Sedimentation Tank',
        unitType: 'sedimentation',
        volumeM3: Number((Q_m3_hr * 2.5).toFixed(1)), // 2.5 hours
        retentionTimeMinutes: 150.0,
        description: 'Continuous radial flow clarification settling coagulated chemical flocs with surface overflow rate 30 m³/(m²·day).',
        removalEfficiencyPercent: 75,
      },
      {
        id: 'sand-filter',
        name: `Rapid Gravity Sand Filter (${state.filterMedia})`,
        unitType: 'filtration',
        volumeM3: Number((Q_m3_hr * 0.35).toFixed(1)),
        retentionTimeMinutes: 21.0,
        description: 'Granular bed depth 0.6m catching residual turbidity, colloidal pin-point flocs, and bacteria. Filtration rate: 5000 L/m²/hr.',
        removalEfficiencyPercent: 95,
      },
      {
        id: 'chlorine-contact',
        name: 'Chlorine Contact Chamber & Clear Water Reservoir',
        unitType: 'disinfection',
        volumeM3: Number((Q_m3_hr * 0.5).toFixed(1)), // 30 min contact + storage
        retentionTimeMinutes: 30.0,
        description: `Disinfection contact basin ensuring minimum 30-min contact time for complete pathogen inactivation with ${state.chlorineDoseMgL} mg/L chlorine.`,
        chemicalAdded: `Sodium Hypochlorite / Gas Cl₂: ${state.chlorineDoseMgL} mg/L`,
        removalEfficiencyPercent: 99.99,
      },
    ];

    const totalVol = units.reduce((acc, u) => acc + u.volumeM3, 0);

    return {
      flowRateM3Hr: Number(Q_m3_hr.toFixed(1)),
      flowRateLps: Number(Q_lps.toFixed(1)),
      dailyAlumUsageKg: Number(dailyAlumKg.toFixed(1)),
      dailyChlorineUsageKg: Number(dailyChlorineKg.toFixed(1)),
      predictedEffluentTurbidityNtu: predictedTurbidity,
      predictedColiformRemovalPercent: predictedColiformRemoval,
      units,
      effluentTurbidityNtu: predictedTurbidity,
      dailyAlumMassKg: Number(dailyAlumKg.toFixed(1)),
      dailyChlorineMassKg: Number(dailyChlorineKg.toFixed(1)),
      totalPlantVolumeM3: Number(totalVol.toFixed(1)),
      meetsBis10500: predictedTurbidity <= 1.0,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SEDIMENTATION & CLARIFIER DYNAMICS (STOKES' LAW)
  // ─────────────────────────────────────────────────────────────

  public static calculateSedimentation(state: ISedimentationState): ISedimentationResult {
    const Q = state.flowRateM3Hr;
    const H = state.liquidDepthM;
    let surfaceArea = 0;

    if (state.tankType === 'rectangular') {
      surfaceArea = state.lengthOrDiameterM * state.widthM;
    } else {
      // Circular tank area = pi * D² / 4
      surfaceArea = (Math.PI * Math.pow(state.lengthOrDiameterM, 2)) / 4.0;
    }

    const volume = surfaceArea * H;
    const t_hr = volume / Math.max(Q, 0.001);

    // Surface Overflow Rate (SOR) in m³/(m²·day)
    const sor_m3_m2_day = (Q * 24.0) / Math.max(surfaceArea, 0.001);
    const sor_m_s = Q / (3600.0 * Math.max(surfaceArea, 0.001));

    // Horizontal Flow Velocity Vh = Q / (B * H)
    const crossSectionArea = state.tankType === 'rectangular' ? state.widthM * H : state.lengthOrDiameterM * H;
    const Vh_m_min = (Q / (Math.max(crossSectionArea, 0.001) * 60.0));

    // Dynamic Viscosity of water mu (N·s/m²) at temperature T (°C)
    // Poiseuille / Bingham formula
    const T = state.waterTemperatureCelsius;
    const mu = 0.00179 / (1.0 + 0.03368 * T + 0.000221 * T * T);
    const rho = EnvironmentalCalculator.WATER_DENSITY;
    const rho_s = state.particleSpecificGravity * rho;
    const d_m = state.particleDiameterMm / 1000.0;

    // Stokes' Settling Velocity Vs:
    // Vs = g * (rho_s - rho) * d² / (18 * mu)
    const Vs_m_s = (EnvironmentalCalculator.G * (rho_s - rho) * d_m * d_m) / (18.0 * mu);
    const Vs_mm_s = Vs_m_s * 1000.0;

    // Reynolds number check for Stokes' Law validity (Re = rho * Vs * d / mu < 1.0)
    const Re = (rho * Vs_m_s * d_m) / mu;
    const isStokesValid = Re < 1.0;

    // Removal Efficiency eta = (Vs / SOR) * 100%
    const efficiency = Math.min(100.0, Math.max(0.0, (Vs_m_s / Math.max(sor_m_s, 1e-6)) * 100.0));

    // Weir loading rate (Weir Overflow Rate)
    // For rectangular: weir length ≈ width; For circular: weir length = pi * D
    const weirLength = state.tankType === 'rectangular' ? state.widthM : Math.PI * state.lengthOrDiameterM;
    const weirLoading = (Q * 24.0) / Math.max(weirLength, 0.001);

    return {
      tankVolumeM3: Number(volume.toFixed(1)),
      surfaceAreaM2: Number(surfaceArea.toFixed(1)),
      retentionTimeHours: Number(t_hr.toFixed(2)),
      surfaceOverflowRateM3M2Day: Number(sor_m3_m2_day.toFixed(1)),
      horizontalVelocityMMin: Number(Vh_m_min.toFixed(3)),
      settlingVelocityMmS: Number(Vs_mm_s.toFixed(3)),
      removalEfficiencyPercent: Number(efficiency.toFixed(1)),
      weirLoadingRateM3MDay: Number(weirLoading.toFixed(1)),
      isStokesValid,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. RAPID SAND FILTRATION & BACKWASH FLUIDIZATION
  // ─────────────────────────────────────────────────────────────

  public static calculateFiltration(state: IFiltrationState): IFiltrationResult {
    // Flow capacity Q = Filtration Rate * Bed Area
    const flowCapacity = state.filtrationRateM3M2Hr * state.bedAreaM2;

    // Clean bed head loss: Carmen-Kozeny equation
    // hf = f' * ((1 - e) / e³) * (L / d) * (v² / g)
    // where f' = 150 * (1 - e)/Re + 1.75
    const v_m_s = state.filtrationRateM3M2Hr / 3600.0;
    const e = state.sandPorosity;
    const L = state.sandDepthM;
    const d = state.effectiveSizeD10Mm / 1000.0;
    const nu = 1.0e-6; // kinematic viscosity m²/s
    const Re = (v_m_s * d) / nu;
    const f_prime = (150.0 * (1.0 - e)) / Math.max(Re, 0.01) + 1.75;

    const cleanHeadLoss = f_prime * ((1.0 - e) / Math.pow(e, 3)) * (L / d) * ((v_m_s * v_m_s) / EnvironmentalCalculator.G);

    // Dynamic clogged head loss over run time (increases progressively due to interstitial pore blinding)
    // h(t) = hf_clean + k * t^1.5
    const cloggingIncrease = 0.035 * Math.pow(state.operatingHours, 1.4);
    const cloggedHeadLoss = cleanHeadLoss + cloggingIncrease;
    const isTerminalHeadLossReached = cloggedHeadLoss >= 2.5; // CPHEEO terminal head loss limit = 2.5m to 3.0m

    // Backwash fluidized bed expansion (Fair-Geyer / CPHEEO formulation)
    const vb = state.backwashRiseRateMMin / 60.0; // backwash velocity m/s
    const vt = 0.15; // Terminal settling velocity of filter sand grains m/s
    const ee = Math.min(0.70, Math.max(e + 0.05, Math.pow(vb / vt, 0.22)));
    const bedExpansionPct = Math.max(0.0, ((ee - e) / (1.0 - ee)) * 100.0);

    // Washwater requirement for a standard 10-minute backwash
    const washwaterM3 = (state.backwashRiseRateMMin * 10.0) * state.bedAreaM2;

    return {
      flowCapacityM3Hr: Number(flowCapacity.toFixed(1)),
      cleanBedHeadLossM: Number(cleanHeadLoss.toFixed(2)),
      cloggedHeadLossM: Number(cloggedHeadLoss.toFixed(2)),
      isTerminalHeadLossReached,
      bedExpansionPercent: Number(bedExpansionPct.toFixed(1)),
      backwashWashwaterRequiredM3: Number(washwaterM3.toFixed(1)),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ACTIVATED SLUDGE PROCESS (ASP) BIOLOGICAL DESIGN
  // ─────────────────────────────────────────────────────────────

  public static calculateActivatedSludge(state: IWastewaterState): IWastewaterResult {
    const Q = state.influentFlowM3Day;
    const S0 = state.influentBod5MgL;
    const V = state.aerationTankVolumeM3;
    const X = state.mlssMgL;
    const theta_c = state.sludgeRetentionTimeDays;

    // Hydraulic Retention Time HRT (hours)
    const hrtHours = (V / Math.max(Q, 1.0)) * 24.0;

    // F/M ratio (kg BOD5 / kg MLSS · day)
    // F/M = (Q * S0) / (V * X)
    const fmRatio = (Q * S0) / (V * X);

    // Volumetric organic loading rate (kg BOD5 / m³ · day)
    const vlr = (Q * S0) / (V * 1000.0);

    // Kinetic parameters (Metcalf & Eddy standard municipal sewage at 20°C):
    // Y = 0.6 mg VSS/mg BOD, kd = 0.06 day⁻¹, Ks = 60 mg/L, mu_m = 3.0 day⁻¹
    const Y = 0.6;
    const kd = 0.06;
    const Ks = 60.0;

    // Effluent soluble BOD5 (S):
    // S = Ks * (1 + kd * theta_c) / (theta_c * (Y * k - kd) - 1)
    // Simplified standard Monod steady-state:
    const S_eff = (Ks * (1.0 + kd * theta_c)) / Math.max(0.1, theta_c * (3.0 * Y - kd) - 1.0);
    const effluentBod = Math.max(5.0, Number(S_eff.toFixed(1)));
    const removalEfficiency = ((S0 - effluentBod) / S0) * 100.0;

    // Excess biological sludge production Px (kg VSS/day)
    // Px = (Y_obs * Q * (S0 - S)) where Y_obs = Y / (1 + kd * theta_c)
    const Y_obs = Y / (1.0 + kd * theta_c);
    const Px_kg_day = (Y_obs * Q * (S0 - effluentBod)) / 1000.0;

    // Oxygen requirements (kg O₂/day):
    // O2 = Q * (S0 - S) * 10⁻³ - 1.42 * Px + 4.57 * (nitrification demand)
    const carbonaceousO2 = (Q * (S0 - effluentBod) * 1e-3) - 1.42 * Px_kg_day;
    const totalO2Required = Math.max(carbonaceousO2, (Q * S0 * 1e-3) * 0.9);

    // CPCB General Standards for Discharge of Environmental Pollutants:
    // Inland Surface Water: BOD ≤ 30 mg/L
    const meetsCpcb = effluentBod <= 30.0;

    return {
      hydraulicRetentionTimeHours: Number(hrtHours.toFixed(2)),
      fmRatioKgBodKgMlssDay: Number(fmRatio.toFixed(3)),
      volumetricLoadingKgBodM3Day: Number(vlr.toFixed(3)),
      bodRemovalEfficiencyPercent: Number(removalEfficiency.toFixed(1)),
      effluentBodMgL: effluentBod,
      excessSludgeProductionKgDay: Number(Px_kg_day.toFixed(1)),
      oxygenRequiredKgO2Day: Number(totalO2Required.toFixed(1)),
      meetsCpcbStandards: meetsCpcb,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. WATER DISTRIBUTION & SEWER HYDRAULICS
  // ─────────────────────────────────────────────────────────────

  public static calculateDistributionHydraulics(state: IDistributionState): IDistributionResult {
    const L = state.pipeLengthM;
    const D_m = state.pipeDiameterMm / 1000.0;
    const C = state.pipeRoughnessC;
    const Q_m3_s = state.nodeDemandLps / 1000.0;

    // Pipe velocity
    const area = (Math.PI * D_m * D_m) / 4.0;
    const velocity = Q_m3_s / Math.max(area, 1e-6);

    // Hazen-Williams frictional head loss:
    // hf = 10.67 * (L * Q^1.852) / (C^1.852 * D^4.87)
    const hf = (10.67 * L * Math.pow(Q_m3_s, 1.852)) / (Math.pow(C, 1.852) * Math.pow(D_m, 4.87));
    const residualHead = Math.max(0.0, state.reservoirHeadM - hf);

    // Sewer Hydraulics (Manning's Equation for gravity sewer running full):
    // V_full = (1/n) * R^(2/3) * S^(1/2)
    // where R = D/4 for circular pipe running full, S = 1/sewerSlopeRatio
    const D_sewer_m = state.sewerDiameterMm / 1000.0;
    const S = 1.0 / Math.max(1.0, state.sewerSlopeRatio);
    const R_full = D_sewer_m / 4.0;
    const V_full = (1.0 / state.manningN) * Math.pow(R_full, 2.0 / 3.0) * Math.sqrt(S);
    const Q_full_m3_s = V_full * ((Math.PI * D_sewer_m * D_sewer_m) / 4.0);

    // Partial flow ratio based on d/D:
    // Using standard hydraulic elements diagram regression:
    const d_D = Math.min(0.95, Math.max(0.1, state.sewerDepthRatio));
    // Velocity ratio v/V ≈ (d/D)^0.65
    const v_partial = V_full * Math.pow(d_D, 0.65);

    // CPHEEO Sewerage Manual: self-cleansing velocity to prevent solids deposition ≥ 0.6 m/s
    const isSelfCleansing = v_partial >= 0.6;

    return {
      flowVelocityMS: Number(velocity.toFixed(2)),
      frictionalHeadLossM: Number(hf.toFixed(2)),
      residualPressureHeadM: Number(residualHead.toFixed(2)),
      sewerFullCapacityLps: Number((Q_full_m3_s * 1000.0).toFixed(1)),
      sewerActualVelocityMS: Number(v_partial.toFixed(2)),
      isSelfCleansing,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. WATER & WASTEWATER QUALITY LABORATORY CALCULATIONS
  // ─────────────────────────────────────────────────────────────

  public static calculateWaterQualityLab(state: IWaterQualityLabState): IWaterQualityLabResult {
    switch (state.selectedTest) {
      case 'jar-test': {
        // Find dosage that yields lowest turbidity
        let minTurbidity = Infinity;
        let optDose = state.coagulantDosesMgL[0] || 30;
        const table: Record<string, number | string>[] = [];

        state.coagulantDosesMgL.forEach((dose, idx) => {
          const turb = state.measuredTurbiditiesNtu[idx] ?? Math.max(1.5, 45 * Math.exp(-0.06 * dose) + 0.02 * Math.pow(dose - 35, 2));
          table.push({
            Jar_No: idx + 1,
            Alum_Dose_mg_L: dose,
            Residual_Turbidity_NTU: Number(turb.toFixed(1)),
          });
          if (turb < minTurbidity) {
            minTurbidity = turb;
            optDose = dose;
          }
        });

        return {
          testName: 'Jar Test for Optimum Coagulant Dosage (IS: 3025 Part 50)',
          primaryValue: optDose,
          unit: 'mg/L Alum',
          standardLimit: 'IS 10500: ≤ 1.0 NTU Desirable, ≤ 5.0 NTU Permissible',
          complianceRating: minTurbidity <= 1.0 ? 'desirable' : minTurbidity <= 5.0 ? 'permissible' : 'exceeded-cpcb',
          interpretation: `Optimum coagulant dose is ${optDose} mg/L, achieving minimum residual turbidity of ${minTurbidity.toFixed(1)} NTU with rapid floc settling.`,
          calculatedTable: table,
        };
      }

      case 'do-winkler': {
        // DO = (V_titrant * N * 8 * 1000) / V_sample
        // For standard 0.025N Na2S2O3 titrating 200 ml sample, 1 mL = 1 mg/L DO
        const doValue = Number((state.initialDoMgL).toFixed(2));
        const rating = doValue >= 6.0 ? 'desirable' : doValue >= 4.0 ? 'permissible' : 'exceeded-cpcb';
        return {
          testName: 'Dissolved Oxygen by Azide Modification of Winkler Method',
          primaryValue: doValue,
          unit: 'mg/L O₂',
          standardLimit: 'CPCB Class C: ≥ 4.0 mg/L for propagation of wildlife and fisheries',
          complianceRating: rating,
          interpretation: `Measured DO is ${doValue} mg/L. Healthy aquatic ecosystem requires minimum 4.0 mg/L DO to prevent fish mortality.`,
        };
      }

      case 'bod5': {
        // BOD5 = (D1 - D2) / P
        const D1 = state.initialDoMgL;
        const D2 = state.incubatedDoMgL;
        const P = state.dilutionFactorP;
        const bodValue = Number(((D1 - D2) / Math.max(P, 0.001)).toFixed(1));
        const rating = bodValue <= 3.0 ? 'desirable' : bodValue <= 30.0 ? 'permissible' : 'exceeded-cpcb';

        return {
          testName: 'Biochemical Oxygen Demand (5-Day 20°C Incubation per IS: 3025 Part 44)',
          primaryValue: bodValue,
          unit: 'mg/L BOD₅',
          standardLimit: 'CPCB Effluent Discharge: ≤ 30 mg/L; Drinking water: ≤ 2.0 mg/L',
          complianceRating: rating,
          interpretation: `Sample 5-day BOD is ${bodValue} mg/L. Indicates biodegradable organic load requiring microbial stabilization.`,
        };
      }

      case 'cod-reflux': {
        // COD = ((V1 - V2) * N_FAS * 8000) / V_sample
        const V1 = state.fasTiterBlankMl;
        const V2 = state.fasTiterSampleMl;
        const N = state.fasNormality;
        const V_s = state.sampleVolumeMl;
        const codValue = Number((((V1 - V2) * N * 8000.0) / Math.max(V_s, 1.0)).toFixed(1));
        const rating = codValue <= 250.0 ? 'permissible' : 'exceeded-cpcb';

        return {
          testName: 'Chemical Oxygen Demand by Closed Reflux Titrimetric Method (IS: 3025 Part 58)',
          primaryValue: codValue,
          unit: 'mg/L COD',
          standardLimit: 'CPCB Effluent Discharge: ≤ 250 mg/L',
          complianceRating: rating,
          interpretation: `Total chemical oxidizable organic matter is ${codValue} mg/L (COD/BOD ratio ≈ ${(codValue / 200).toFixed(1)}).`,
        };
      }

      default: {
        return {
          testName: 'Routine Water Quality Parameter',
          primaryValue: 7.2,
          unit: 'pH Units',
          standardLimit: '6.5 to 8.5 (BIS 10500:2012)',
          complianceRating: 'desirable',
          interpretation: 'Within acceptable neutral potable water limits.',
        };
      }
    }
  }

  public static calculateDistribution(state: IDistributionState): IDistributionResult {
    return this.calculateDistributionHydraulics(state);
  }

  public static calculateQualityTest(state: IWaterQualityLabState): IWaterQualityLabResult {
    return this.calculateWaterQualityLab(state);
  }
}
