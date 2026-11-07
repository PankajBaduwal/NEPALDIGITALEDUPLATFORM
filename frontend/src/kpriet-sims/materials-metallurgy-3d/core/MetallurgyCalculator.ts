/**
 * Deterministic Metallurgy & Materials Engineering Calculation Engine
 * Formulated according to:
 * - William D. Callister, Materials Science and Engineering (10th Ed.)
 * - Donald R. Askeland, The Science and Engineering of Materials (7th Ed.)
 * - ASM Handbook, Volume 1: Properties and Selection: Irons, Steels, and High-Performance Alloys
 * - Anna University / Autonomous R2025 Syllabus (U25ME302 / ME3392)
 */

import type {
  CrystalStructureType,
  PhaseDiagramPointInfo,
  HeatTreatmentProcessType,
  QuenchMedium,
  HeatTreatmentCycleResult,
  HardnessTestType,
  HardnessTestResult,
  TensileTestResult,
  ImpactTestResult,
} from './types';
import { CRYSTAL_STRUCTURES_DATA, ENGINEERING_ALLOYS_DATABASE } from './MetallurgyMaterials';

export class MetallurgyCalculator {
  /**
   * 1. Crystal Lattice Calculations
   */
  public static calculateLatticeParameter(structure: CrystalStructureType, atomicRadiusNm: number): {
    aNm: number;
    cNm?: number;
    cellVolumeNm3: number;
    atomsPerCell: number;
    coordinationNumber: number;
    atomicPackingFactor: number;
  } {
    const r = Math.max(0.01, atomicRadiusNm);
    let a = 0;
    let c: number | undefined = undefined;
    let vol = 0;
    const info = CRYSTAL_STRUCTURES_DATA[structure];

    if (structure === 'bcc') {
      a = (4 * r) / Math.sqrt(3);
      vol = Math.pow(a, 3);
    } else if (structure === 'fcc') {
      a = 2 * Math.sqrt(2) * r;
      vol = Math.pow(a, 3);
    } else {
      // HCP: a = 2r, c/a = √(8/3) ≈ 1.63299
      a = 2 * r;
      c = a * Math.sqrt(8 / 3);
      // Hexagonal unit cell volume: 6 prisms = (3√3 / 2) · a² · c
      vol = ((3 * Math.sqrt(3)) / 2) * Math.pow(a, 2) * c;
    }

    const sphereVol = (4 / 3) * Math.PI * Math.pow(r, 3);
    const apf = (info.atomsPerUnitCell * sphereVol) / vol;

    return {
      aNm: Math.round(a * 10000) / 10000,
      cNm: c ? Math.round(c * 10000) / 10000 : undefined,
      cellVolumeNm3: Math.round(vol * 100000) / 100000,
      atomsPerCell: info.atomsPerUnitCell,
      coordinationNumber: info.coordinationNumber,
      atomicPackingFactor: Math.round(apf * 1000) / 1000,
    };
  }

  /**
   * Interplanar Spacing for cubic systems: d_hkl = a / √(h² + k² + l²)
   */
  public static calculateInterplanarSpacing(aNm: number, h: number, k: number, l: number): number {
    if (aNm <= 0) return 0;
    const sumSquares = Math.pow(h, 2) + Math.pow(k, 2) + Math.pow(l, 2);
    if (sumSquares === 0) return 0;
    return aNm / Math.sqrt(sumSquares);
  }

  /**
   * Bragg's Law: 2d · sin(θ) = n · λ => θ = asin((n · λ) / (2d)) [degrees]
   */
  public static calculateBraggAngle(dNm: number, wavelengthNm: number, order: number = 1): number {
    if (dNm <= 0 || wavelengthNm <= 0 || order <= 0) return 0;
    const sinTheta = (order * wavelengthNm) / (2 * dNm);
    if (sinTheta > 1) return 90;
    return (Math.asin(sinTheta) * 180) / Math.PI;
  }

  /**
   * 2. Mechanical Stress-Strain & Elastic Mechanics
   */
  public static calculateTensileState(params: {
    appliedLoadKN: number;
    originalDiameterMm: number;
    gaugeLengthMm: number;
    youngsModulusGPa: number;
    yieldStrengthMPa: number;
    ultimateTensileStrengthMPa: number;
    fractureStrain: number;
  }): TensileTestResult {
    const F_N = Math.max(0, params.appliedLoadKN * 1000);
    const d0 = Math.max(1, params.originalDiameterMm);
    const L0 = Math.max(10, params.gaugeLengthMm);
    const A0 = (Math.PI * Math.pow(d0, 2)) / 4;
    const E_MPa = Math.max(1000, params.youngsModulusGPa * 1000);
    const Sy = Math.max(10, params.yieldStrengthMPa);
    const Su = Math.max(Sy * 1.05, params.ultimateTensileStrengthMPa);
    const ef = Math.max(0.01, params.fractureStrain);

    const engStress = F_N / A0;
    let engStrain = 0;
    let isElastic = true;
    let isYielded = false;
    let isNecking = false;
    let isFractured = false;
    let currentArea = A0;

    const elasticLimitStrain = Sy / E_MPa;

    if (engStress <= Sy) {
      engStrain = engStress / E_MPa;
      isElastic = true;
      // Lateral contraction via Poisson's ratio ν ≈ 0.3
      const lateralStrain = -0.3 * engStrain;
      const currentDiameter = d0 * (1 + lateralStrain);
      currentArea = (Math.PI * Math.pow(currentDiameter, 2)) / 4;
    } else if (engStress <= Su) {
      isElastic = false;
      isYielded = true;
      // Ramberg-Osgood / power hardening: ε = σ/E + 0.002 · (σ/Sy)^(1/n)
      const strainHardeningExponent = 0.18;
      const plasticStrain = 0.002 * Math.pow(engStress / Sy, 1 / strainHardeningExponent);
      engStrain = (engStress / E_MPa) + plasticStrain;
      // Volume constancy in plastic deformation: A · L = A0 · L0
      currentArea = A0 / (1 + engStrain);
      if (engStress >= Su * 0.98) {
        isNecking = true;
      }
    } else {
      isElastic = false;
      isYielded = true;
      isNecking = true;
      engStrain = ef;
      currentArea = A0 * 0.55; // 45% reduction of area at necking
      if (engStrain >= ef) {
        isFractured = true;
      }
    }

    const elongationMm = engStrain * L0;
    const trueStrain = Math.log(1 + Math.max(0, engStrain));
    const trueStress = engStress * (1 + Math.max(0, engStrain));

    // Strain energy absorbed (approx integral)
    const energyAbsorbedJ = 0.5 * (F_N / 1000) * elongationMm;

    return {
      loadKN: params.appliedLoadKN,
      gaugeLengthMm: L0,
      diameterMm: d0,
      originalAreaMm2: Math.round(A0 * 100) / 100,
      currentAreaMm2: Math.round(currentArea * 100) / 100,
      elongationMm: Math.round(elongationMm * 1000) / 1000,
      engineeringStressMPa: Math.round(engStress * 10) / 10,
      engineeringStrain: Math.round(engStrain * 10000) / 10000,
      trueStressMPa: Math.round(trueStress * 10) / 10,
      trueStrain: Math.round(trueStrain * 10000) / 10000,
      isElastic,
      isYielded,
      isNecking,
      isFractured,
      energyAbsorbedJ: Math.round(energyAbsorbedJ * 10) / 10,
    };
  }

  /**
   * Modulus of Resilience: Ur = σ_y² / (2E) [MJ/m³ or N·mm/mm³]
   */
  public static calculateModulusOfResilience(yieldStrengthMPa: number, youngsModulusGPa: number): number {
    if (yieldStrengthMPa <= 0 || youngsModulusGPa <= 0) return 0;
    const E_MPa = youngsModulusGPa * 1000;
    return (Math.pow(yieldStrengthMPa, 2) / (2 * E_MPa));
  }

  /**
   * 3. Iron-Carbon Phase Diagram Analytical Engine & Lever Rule
   */
  public static evaluateIronCarbonPoint(carbonWeightPercent: number, temperatureC: number): PhaseDiagramPointInfo {
    const C = Math.max(0, Math.min(6.67, carbonWeightPercent));
    const T = Math.max(300, Math.min(1600, temperatureC));

    const isHypoeutectoid = C < 0.76;
    const isEutectoid = Math.abs(C - 0.76) <= 0.02;
    const isHypereutectoid = C > 0.76 && C <= 2.11;
    const isCastIron = C > 2.11;

    // Liquidus temperature approximation T_liq (°C)
    let T_liq = 1538;
    if (C <= 4.3) {
      T_liq = 1538 - 88.37 * C; // drops to 1147°C at 4.3%
    } else {
      T_liq = 1147 + 106.7 * (C - 4.3); // rises to 1400°C at 6.67%
    }

    // A1 eutectoid temperature: 727°C
    const T_A1 = 727;

    // A3 temperature line: 912°C at 0% C down to 727°C at 0.76% C
    const T_A3 = C <= 0.76 ? 912 - ((912 - 727) / 0.76) * C : 727;

    // Acm temperature line: 727°C at 0.76% C up to 1147°C at 2.11% C
    const T_Acm = C > 0.76 && C <= 2.11 ? 727 + ((1147 - 727) / (2.11 - 0.76)) * (C - 0.76) : 1147;

    let primaryPhase = '';
    let secondaryPhase: string | undefined = undefined;
    let microconstituents = '';
    let leverRule = false;
    let p1Fraction: number | undefined = undefined;
    let p2Fraction: number | undefined = undefined;
    let p1Name: string | undefined = undefined;
    let p2Name: string | undefined = undefined;
    let proeutectoidPct: number | undefined = undefined;
    let pearlitePct: number | undefined = undefined;

    if (T >= T_liq) {
      primaryPhase = 'Liquid (L)';
      microconstituents = 'Completely molten iron-carbon liquid solution';
    } else if (T > 1147 && C > 2.11) {
      primaryPhase = 'Liquid + Fe3C Cementite';
      secondaryPhase = 'Primary Cementite';
      microconstituents = 'Liquid plus primary cementite needles';
      leverRule = true;
      p1Name = 'Liquid';
      p2Name = 'Fe3C (Cementite)';
      p2Fraction = ((C - 2.11) / (6.67 - 2.11)) * 100;
      p1Fraction = 100 - p2Fraction;
    } else if (T > 1147 && C <= 2.11 && T > T_A3) {
      primaryPhase = 'γ-Austenite (FCC)';
      microconstituents = 'Solid solution of carbon in FCC iron (Austenite grains)';
    } else if (T <= T_A1) {
      // Room temperature / below 727°C equilibrium steel/cast iron
      leverRule = true;
      p1Name = 'α-Ferrite (0.022% C)';
      p2Name = 'Fe3C Cementite (6.67% C)';

      // Overall phase equilibrium tie-line: α (0.022% C) and Fe3C (6.67% C)
      const f_fe3c = ((C - 0.022) / (6.67 - 0.022)) * 100;
      const f_alpha = 100 - f_fe3c;
      p1Fraction = Math.max(0, Math.min(100, Math.round(f_alpha * 10) / 10));
      p2Fraction = Math.max(0, Math.min(100, Math.round(f_fe3c * 10) / 10));

      if (isHypoeutectoid) {
        primaryPhase = 'α-Ferrite + Fe3C (Cementite)';
        // Proeutectoid ferrite fraction: (0.76 - C) / (0.76 - 0.022)
        const f_pro = ((0.76 - C) / (0.76 - 0.022)) * 100;
        const f_pear = 100 - f_pro;
        proeutectoidPct = Math.round(f_pro * 10) / 10;
        pearlitePct = Math.round(f_pear * 10) / 10;
        microconstituents = `${proeutectoidPct}% Proeutectoid Ferrite (light grains) + ${pearlitePct}% Pearlite colonies`;
      } else if (isEutectoid) {
        primaryPhase = '100% Pearlite (Eutectoid α + Fe3C)';
        proeutectoidPct = 0;
        pearlitePct = 100;
        microconstituents = '100% Lamellar Pearlite (alternating thin plates of ferrite and cementite)';
      } else if (isHypereutectoid) {
        primaryPhase = 'Fe3C (Cementite) + Pearlite';
        // Proeutectoid cementite fraction: (C - 0.76) / (6.67 - 0.76)
        const f_pro = ((C - 0.76) / (6.67 - 0.76)) * 100;
        const f_pear = 100 - f_pro;
        proeutectoidPct = Math.round(f_pro * 10) / 10;
        pearlitePct = Math.round(f_pear * 10) / 10;
        microconstituents = `${proeutectoidPct}% Proeutectoid Cementite (boundary network) + ${pearlitePct}% Pearlite`;
      } else {
        primaryPhase = 'Pearlite + Transformed Ledeburite + Free Cementite';
        microconstituents = 'White Cast Iron microstructure: Ledeburite eutectic matrix + primary cementite';
      }
    } else if (T > T_A1 && T < T_A3 && C <= 0.76) {
      // Two-phase region: α-ferrite + γ-austenite
      primaryPhase = 'α-Ferrite + γ-Austenite';
      leverRule = true;
      p1Name = 'α-Ferrite';
      p2Name = 'γ-Austenite';
      // Tie line: C_alpha = 0.022, C_gamma from A3 curve
      const c_gamma = 0.76 * ((912 - T) / (912 - 727));
      const f_gamma = ((C - 0.022) / Math.max(0.01, c_gamma - 0.022)) * 100;
      p2Fraction = Math.max(0, Math.min(100, Math.round(f_gamma * 10) / 10));
      p1Fraction = 100 - p2Fraction;
      microconstituents = `Intercritical zone: ${p1Fraction}% Ferrite + ${p2Fraction}% Austenite`;
    } else if (T > T_A1 && T < T_Acm && C > 0.76 && C <= 2.11) {
      primaryPhase = 'γ-Austenite + Fe3C Cementite';
      leverRule = true;
      p1Name = 'γ-Austenite';
      p2Name = 'Fe3C Cementite';
      microconstituents = 'Austenite matrix with grain-boundary proeutectoid cementite precipitation';
      p2Fraction = Math.round(((C - 0.76) / (6.67 - 0.76)) * 1000) / 10;
      p1Fraction = 100 - p2Fraction;
    } else {
      primaryPhase = 'γ-Austenite (FCC Solid Solution)';
      microconstituents = 'Homogeneous austenitic solid solution';
    }

    return {
      temperatureC: T,
      carbonWeightPercent: C,
      primaryPhase,
      secondaryPhase,
      microconstituents,
      leverRuleApplicable: leverRule,
      phase1FractionPercent: p1Fraction,
      phase2FractionPercent: p2Fraction,
      phase1Name: p1Name,
      phase2Name: p2Name,
      proeutectoidFractionPercent: proeutectoidPct,
      pearliteFractionPercent: pearlitePct,
      isHypoeutectoid,
      isEutectoid,
      isHypereutectoid,
      isCastIron,
    };
  }

  /**
   * 4. Heat Treatment Thermal Cycle & Kinetics
   */
  public static calculateHeatTreatment(params: {
    process: HeatTreatmentProcessType;
    carbonPercent: number;
    coolingMedium: QuenchMedium;
    holdingTimeMin?: number;
    temperTempC?: number;
    furnaceTempC?: number;
  }): HeatTreatmentCycleResult {
    const C = Math.max(0.05, Math.min(1.5, params.carbonPercent));
    const holdTime = params.holdingTimeMin ?? 45;

    // Austenitizing Temperature: A3 + 50°C for hypoeutectoid, A1 + 50°C for hypereutectoid
    let austenitizingTemp = 0;
    if (C < 0.76) {
      const A3 = 912 - ((912 - 727) / 0.76) * C;
      austenitizingTemp = Math.round(A3 + 50);
    } else {
      austenitizingTemp = 727 + 50; // 777°C
    }

    let coolingRate = 0;
    switch (params.coolingMedium) {
      case 'brine':
        coolingRate = 140; // °C/s
        break;
      case 'water':
        coolingRate = 90; // °C/s
        break;
      case 'oil':
        coolingRate = 35; // °C/s
        break;
      case 'air':
        coolingRate = 2.5; // °C/s (normalizing)
        break;
      case 'furnace':
        coolingRate = 0.04; // °C/s ~ 2.5°C/min (full annealing)
        break;
    }

    let initialHRC = 18;
    let finalHRC = 20;
    let microstructure = '';
    let toughness: 'Very Low' | 'Moderate' | 'High' | 'Very High' = 'Moderate';
    let residualStress: 'Low' | 'Moderate' | 'High' | 'Relieved' = 'Low';
    let applications = '';

    if (params.process === 'full-annealing') {
      finalHRC = Math.round(10 + C * 20); // soft
      microstructure = 'Coarse Lamellar Pearlite + Proeutectoid Ferrite (Equiaxed stress-free grains)';
      toughness = 'High';
      residualStress = 'Relieved';
      applications = 'Softening steel for severe cold working, deep drawing, and optimum machinability.';
    } else if (params.process === 'normalizing') {
      finalHRC = Math.round(16 + C * 25);
      microstructure = 'Fine Lamellar Pearlite with thin uniform Ferrite boundary network';
      toughness = 'Moderate';
      residualStress = 'Low';
      applications = 'Grain refinement after hot rolling/forging, improving yield strength and uniformity.';
    } else if (params.process === 'hardening-quench') {
      // Critical cooling rate for carbon steel ~ 50-100 °C/s
      if (coolingRate >= 30) {
        // Martensitic transformation: HRC depends strictly on carbon in solution: HRC ≈ 30 + 50·C
        finalHRC = Math.min(65, Math.round(32 + 55 * C));
        microstructure = 'Acicular Lath/Plate Martensite + <4% Retained Austenite (Severe BCT lattice distortion)';
        toughness = 'Very Low';
        residualStress = 'High';
        applications = 'Cutting tools, dies, wear plates, and shafts requiring high surface abrasion resistance.';
      } else {
        finalHRC = 28;
        microstructure = 'Very Fine Pearlite / Bainite (Incomplete quench hardening)';
        toughness = 'Moderate';
        residualStress = 'Moderate';
        applications = 'Tough medium-strength structural axles.';
      }
    } else if (params.process === 'tempering') {
      const T_temper = params.temperTempC ?? 400;
      // Hardness drops smoothly with tempering temperature: HRC = HRC_asquenched - (T_temper / 20)
      const asQuenched = Math.min(65, Math.round(32 + 55 * C));
      finalHRC = Math.max(22, Math.round(asQuenched - ((T_temper - 150) / 12)));
      microstructure = 'Tempered Martensite (Submicroscopic cementite spheroids in an α-ferrite matrix)';
      toughness = T_temper >= 350 ? 'Very High' : 'High';
      residualStress = 'Low';
      applications = 'Automotive connecting rods, high-tensile bolts, transmission gears, coil springs.';
    } else {
      finalHRC = 18;
      microstructure = 'Subcritical Annealed / Recrystallized Ferrite (Sub-A1 650°C)';
      toughness = 'Very High';
      residualStress = 'Relieved';
      applications = 'Relieving residual stresses after welding, casting, or heavy machining.';
    }

    return {
      process: params.process,
      austenitizingTempC: austenitizingTemp,
      holdingTimeMin: holdTime,
      coolingMedium: params.coolingMedium,
      coolingRateCPerSec: coolingRate,
      initialHardnessHRC: initialHRC,
      finalHardnessHRC: finalHRC,
      resultingMicrostructure: microstructure,
      toughnessQualitative: toughness,
      residualStressQualitative: residualStress,
      practicalApplications: applications,
    };
  }

  /**
   * 5. Hardness Testing Calculations
   */
  public static calculateHardness(params: {
    testType: HardnessTestType;
    appliedLoadKgf: number;
    indentationDimensionMm: number; // diameter d for Brinell, indentation depth e or diagonal d for Vickers
    ballDiameterMm?: number; // 10 mm standard for Brinell
  }): HardnessTestResult {
    const F = Math.max(1, params.appliedLoadKgf);
    const d = Math.max(0.01, params.indentationDimensionMm);
    let val = 0;
    let indenter = '';
    let str = '';
    let note = '';

    if (params.testType === 'brinell') {
      const D = params.ballDiameterMm ?? 10;
      indenter = `${D} mm Tungsten Carbide Ball (HBW)`;
      // HBW = 2F / (π · D · (D - √(D² - d²)))
      if (d >= D) {
        val = 0;
        note = 'Indentation diameter cannot equal or exceed indenter ball diameter.';
      } else {
        const denom = Math.PI * D * (D - Math.sqrt(Math.pow(D, 2) - Math.pow(d, 2)));
        val = (2 * F) / denom;
        str = `${Math.round(val)} HBW ${D}/${F}`;
        note = 'Valid standard Brinell indentation (0.24D < d < 0.60D).';
      }
    } else if (params.testType === 'rockwell-c') {
      indenter = '120° Spheroconical Diamond Brale Indenter (150 kgf total load)';
      // HRC = 100 - (e / 0.002 mm) where e is permanent indentation depth in mm
      const e_mm = d; // using input dimension as e
      val = Math.max(0, 100 - (e_mm / 0.002));
      str = `${Math.round(val * 10) / 10} HRC`;
      note = 'Standard Rockwell C scale (applicable for hardened steels above 20 HRC).';
    } else if (params.testType === 'rockwell-b') {
      indenter = '1/16" (1.588 mm) Hardened Steel Ball (100 kgf load)';
      // HRB = 130 - (e / 0.002 mm)
      const e_mm = d;
      val = Math.max(0, 130 - (e_mm / 0.002));
      str = `${Math.round(val * 10) / 10} HRB`;
      note = 'Standard Rockwell B scale (for soft/medium steels, brass, and aluminium alloys).';
    } else {
      // Vickers Hardness HV: HV = 1.8544 · F / d² (where d is average diagonal in mm)
      indenter = '136° Square-base Diamond Pyramid';
      val = (1.8544 * F) / Math.pow(d, 2);
      str = `${Math.round(val)} HV ${F}`;
      note = 'Standard Vickers micro/macro hardness testing.';
    }

    return {
      testType: params.testType,
      appliedLoadKgf: F,
      indenterType: indenter,
      indentationSizeMm: d,
      calculatedHardness: Math.round(val * 10) / 10,
      hardnessString: str,
      validityNote: note,
    };
  }

  /**
   * 6. Impact Pendulum Testing Calculations
   */
  public static calculateImpactEnergy(params: {
    testMethod: 'Charpy' | 'Izod';
    pendulumMassKg?: number;
    armLengthM?: number;
    initialAngleDeg?: number;
    finalAngleDeg: number;
    temperatureC?: number;
  }): ImpactTestResult {
    const m = params.pendulumMassKg ?? 20.4; // standard 300J Charpy hammer
    const R = params.armLengthM ?? 0.8;
    const g = 9.81;
    const alphaDeg = params.initialAngleDeg ?? 140; // initial release angle
    const betaDeg = Math.max(0, Math.min(alphaDeg, params.finalAngleDeg)); // swing through angle
    const tempC = params.temperatureC ?? 20;

    const alphaRad = (alphaDeg * Math.PI) / 180;
    const betaRad = (betaDeg * Math.PI) / 180;

    // Energy absorbed = m · g · R · (cos(β) - cos(α))
    const absorbedJ = m * g * R * (Math.cos(betaRad) - Math.cos(alphaRad));

    // Ductile vs Brittle transition for low-carbon steel (DBTT ~ -10°C to +15°C)
    const isDuctile = tempC > 0 && absorbedJ >= 35;
    let fractureAppearance: 'Fibrous / Dull (Ductile)' | 'Cleavage / Granular (Brittle)' | 'Mixed Mode' = 'Mixed Mode';
    if (tempC < -20 || absorbedJ < 15) {
      fractureAppearance = 'Cleavage / Granular (Brittle)';
    } else if (tempC > 25 && absorbedJ > 50) {
      fractureAppearance = 'Fibrous / Dull (Ductile)';
    }

    return {
      testMethod: params.testMethod,
      initialAngleDeg: alphaDeg,
      finalAngleDeg: betaDeg,
      pendulumMassKg: m,
      pendulumArmLengthM: R,
      temperatureC: tempC,
      absorbedEnergyJoules: Math.max(0, Math.round(absorbedJ * 10) / 10),
      isDuctileFailure: isDuctile,
      fractureAppearance,
    };
  }
}
