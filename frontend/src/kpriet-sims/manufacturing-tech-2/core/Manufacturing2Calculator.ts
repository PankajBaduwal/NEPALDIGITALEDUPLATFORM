/**
 * Deterministic Manufacturing Technology – II Calculation Engine
 * Covers CNC tool paths, non-traditional machining, welding, casting, forming,
 * turning/milling parameter conversions, and process selection.
 * Free of UI dependencies and safe from eval() / Function().
 */

import type {
  CNCMachiningParams,
  CNCExecutionResult,
  GCodeCommand,
  ToolPathPoint,
  NonTraditionalProcess,
  NonTraditionalResult,
  EDMParams,
  ECMParams,
  LaserParams,
  WaterJetParams,
  WeldingParams,
  WeldingResult,
  MouldDesignParams,
  CastingResult,
  FormingParams,
  FormingResult,
  MachiningCalculationsInput,
  MachiningCalculationsResult,
  SelectionCriteria,
  ProcessSelectionResult,
  ProcessCandidate,
  Manufacturing2QuizQuestion,
} from './types';

export class Manufacturing2Calculator {
  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 1: CNC Machining & Tool Path Generation
  // ═══════════════════════════════════════════════════════════════════════════
  public static computeCNCToolPath(params: CNCMachiningParams): CNCExecutionResult {
    const {
      operation,
      spindleSpeedRPM,
      feedRateMMPM,
      depthOfCutMM,
      toolDiameterMM,
      workpieceWidthMM,
      workpieceLengthMM,
      workpieceHeightMM,
    } = params;

    const warnings: string[] = [];
    const toolPath: ToolPathPoint[] = [];
    const gCodeListing: GCodeCommand[] = [];

    // Validation
    if (depthOfCutMM > toolDiameterMM * 0.75) {
      warnings.push(`Depth of cut (${depthOfCutMM} mm) exceeds 75% of tool diameter (${toolDiameterMM} mm). Risk of chatter and tool breakage.`);
    }
    if (spindleSpeedRPM > 6000) {
      warnings.push(`Spindle speed (${spindleSpeedRPM} RPM) is high for conventional workshop setups. High-speed machining tooling required.`);
    }

    let lineNum = 10;
    const addGCode = (code: string, opts: Partial<GCodeCommand> = {}, isCutting = false) => {
      gCodeListing.push({
        line: lineNum,
        code,
        isCutting,
        ...opts,
      });
      lineNum += 10;
    };

    // Header G-codes
    addGCode('G21 (Metric Units mm)');
    addGCode('G90 (Absolute Positioning)');
    addGCode('G17 (XY Plane Selection)');
    addGCode(`M03 S${Math.round(spindleSpeedRPM)} (Spindle CW)`);
    if (params.coolingActive) addGCode('M08 (Flood Coolant ON)');

    // Safe clearance Z
    const zClearance = 5.0;
    const zCut = -depthOfCutMM;
    addGCode(`G00 Z${zClearance.toFixed(2)} (Rapid to Clearance)`);

    let totalCuttingDist = 0;
    let totalRapidDist = 0;

    let prevX = 0;
    let prevY = 0;
    let prevZ = zClearance;

    const addMove = (x: number, y: number, z: number, isCutting: boolean, opName: string) => {
      const dist = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2) + Math.pow(z - prevZ, 2));
      if (isCutting) totalCuttingDist += dist;
      else totalRapidDist += dist;

      toolPath.push({
        x,
        y,
        z,
        feedRate: isCutting ? feedRateMMPM : 5000,
        isCutting,
        operation: opName,
      });

      const cmd = isCutting ? 'G01' : 'G00';
      const fStr = isCutting ? ` F${Math.round(feedRateMMPM)}` : '';
      addGCode(`${cmd} X${x.toFixed(2)} Y${y.toFixed(2)} Z${z.toFixed(2)}${fStr}`, { x, y, z }, isCutting);

      prevX = x;
      prevY = y;
      prevZ = z;
    };

    const halfW = workpieceWidthMM / 2;
    const halfL = workpieceLengthMM / 2;
    const stepOver = toolDiameterMM * 0.65;

    if (operation === 'facing') {
      // Zig-zag face milling pass
      const yStart = -halfW + toolDiameterMM / 2;
      const yEnd = halfW - toolDiameterMM / 2;
      let curY = yStart;
      let leftToRight = true;

      addMove(-halfL - toolDiameterMM, curY, zClearance, false, 'Rapid Approach');
      addMove(-halfL - toolDiameterMM, curY, zCut, true, 'Plunge');

      while (curY <= yEnd + stepOver * 0.5) {
        if (leftToRight) {
          addMove(halfL + toolDiameterMM, curY, zCut, true, 'Face Cut L->R');
        } else {
          addMove(-halfL - toolDiameterMM, curY, zCut, true, 'Face Cut R->L');
        }
        curY += stepOver;
        if (curY <= yEnd + stepOver * 0.5) {
          addMove(leftToRight ? halfL + toolDiameterMM : -halfL - toolDiameterMM, curY, zCut, true, 'Step Over');
        }
        leftToRight = !leftToRight;
      }
      addMove(prevX, prevY, zClearance, false, 'Retract');
    } else if (operation === 'contouring') {
      // Outer profile perimeter milling with lead-in
      const offset = toolDiameterMM / 2;
      const pX1 = -halfL - offset;
      const pX2 = halfL + offset;
      const pY1 = -halfW - offset;
      const pY2 = halfW + offset;

      addMove(pX1 - 10, pY1, zClearance, false, 'Rapid Approach');
      addMove(pX1, pY1, zCut, true, 'Plunge & Lead-in');
      addMove(pX2, pY1, zCut, true, 'Contour Edge 1');
      addMove(pX2, pY2, zCut, true, 'Contour Edge 2');
      addMove(pX1, pY2, zCut, true, 'Contour Edge 3');
      addMove(pX1, pY1, zCut, true, 'Contour Edge 4 (Closed)');
      addMove(pX1 - 10, pY1, zCut, true, 'Lead-out');
      addMove(pX1 - 10, pY1, zClearance, false, 'Retract');
    } else if (operation === 'pocketing') {
      // Rectangular pocket spiral
      const pockW = workpieceWidthMM * 0.6;
      const pockL = workpieceLengthMM * 0.6;
      const numRings = Math.max(1, Math.floor(Math.min(pockW, pockL) / (2 * stepOver)));

      addMove(0, 0, zClearance, false, 'Center Approach');
      addMove(0, 0, zCut, true, 'Center Plunge');

      for (let r = 1; r <= numRings; r++) {
        const curRx = (pockL / 2) * (r / numRings);
        const curRy = (pockW / 2) * (r / numRings);
        addMove(curRx, -curRy, zCut, true, `Pocket Ring ${r}`);
        addMove(curRx, curRy, zCut, true, `Pocket Ring ${r}`);
        addMove(-curRx, curRy, zCut, true, `Pocket Ring ${r}`);
        addMove(-curRx, -curRy, zCut, true, `Pocket Ring ${r}`);
        addMove(curRx, -curRy, zCut, true, `Pocket Ring ${r}`);
      }
      addMove(0, 0, zClearance, false, 'Retract');
    } else if (operation === 'drilling') {
      // 4-Hole Bolt Circle Drilling (Canned cycle concept G81)
      const boltRadius = Math.min(halfW, halfL) * 0.65;
      const holeAngles = [0, 90, 180, 270];

      for (const ang of holeAngles) {
        const rad = (ang * Math.PI) / 180;
        const hx = boltRadius * Math.cos(rad);
        const hy = boltRadius * Math.sin(rad);

        addMove(hx, hy, zClearance, false, `Rapid to Hole (${ang}°)`);
        addMove(hx, hy, -workpieceHeightMM * 0.5, true, `Drill Hole (${ang}°)`);
        addMove(hx, hy, zClearance, false, `Retract Hole (${ang}°)`);
      }
    } else {
      // Linear Slot Milling (G01 Slot Pass)
      addMove(-halfL + 5, 0, zClearance, false, 'Rapid to Slot Start');
      addMove(-halfL + 5, 0, zCut, true, 'Plunge Slot');
      addMove(halfL - 5, 0, zCut, true, 'Mill Slot Pass');
      addMove(halfL - 5, 0, zClearance, false, 'Retract');
    }

    // Program Footer
    if (params.coolingActive) addGCode('M09 (Coolant OFF)');
    addGCode('M05 (Spindle Stop)');
    addGCode('G28 G91 Z0.0 (Return to Machine Home)');
    addGCode('M30 (End of Program)');

    // Machining Metrics
    const cuttingSpeedMPM = (Math.PI * toolDiameterMM * spindleSpeedRPM) / 1000;
    const cutTimeMin = totalCuttingDist / feedRateMMPM;
    const rapidTimeMin = totalRapidDist / 5000;
    const estimatedCycleTimeSec = (cutTimeMin + rapidTimeMin) * 60;

    // Material Removal Rate: MRR = Width of cut * Depth of cut * Feed rate
    const widthOfCut = operation === 'facing' ? workpieceWidthMM : toolDiameterMM;
    const mrrMM3Min = widthOfCut * depthOfCutMM * feedRateMMPM;
    const materialRemovalRateCM3Min = mrrMM3Min / 1000;

    // Specific cutting energy for medium steel ~ 2.0 W·s/mm³ = 2.0 J/mm³ = 0.033 kW/(cm³/min)
    const powerRequiredKW = materialRemovalRateCM3Min * 0.033;

    return {
      toolPath,
      gCodeListing,
      totalPathLengthMM: totalCuttingDist + totalRapidDist,
      cuttingPathLengthMM: totalCuttingDist,
      rapidPathLengthMM: totalRapidDist,
      estimatedCycleTimeSec,
      materialRemovalRateCM3Min,
      cuttingSpeedMPM,
      powerRequiredKW,
      warnings,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 2: Non-Traditional Machining Processes
  // ═══════════════════════════════════════════════════════════════════════════
  public static computeEDM(params: EDMParams): NonTraditionalResult {
    const { dischargeCurrentA, pulseOnTimeMicroSec, pulseOffTimeMicroSec, workpieceConductive, electrodeMaterial } = params;

    if (!workpieceConductive) {
      return {
        process: 'edm',
        materialRemovalRateMM3Min: 0,
        surfaceRoughnessRaMicron: 0,
        heatAffectedZoneMM: 0,
        energyConsumptionKWh: 0,
        mechanism: 'Electro-discharge erosion through dielectric ionization breakdown',
        toolWearRatioPercent: 0,
        environmentalNotes: 'EDM cannot machine non-conductive materials.',
        advantages: ['No cutting forces', 'Intricate 3D cavities possible'],
        limitations: ['Workpiece must be electrically conductive (σ > 0.01 S/cm)'],
        industrialApplications: ['Die and mould cavity sinking', 'Aerospace turbine cooling holes'],
      };
    }

    const dutyCycle = pulseOnTimeMicroSec / (pulseOnTimeMicroSec + pulseOffTimeMicroSec);
    // Empirical MRR model for EDM: MRR ≈ C * I * dutyCycle
    const electrodeFactor = electrodeMaterial === 'copper' ? 1.0 : electrodeMaterial === 'graphite' ? 1.4 : 0.8;
    const mrr = 4.2 * Math.pow(dischargeCurrentA, 1.1) * dutyCycle * electrodeFactor;
    // Surface roughness increases with pulse energy (I * T_on)
    const pulseEnergyMilliJ = dischargeCurrentA * 25 * pulseOnTimeMicroSec * 1e-3;
    const ra = 0.045 * Math.pow(pulseEnergyMilliJ, 0.38) + 0.3;
    const haz = 0.015 * Math.sqrt(dischargeCurrentA);
    const powerKW = (25 * dischargeCurrentA * dutyCycle) / 1000;

    return {
      process: 'edm',
      materialRemovalRateMM3Min: Math.max(0.1, mrr),
      surfaceRoughnessRaMicron: Math.min(12, Math.max(0.2, ra)),
      heatAffectedZoneMM: haz,
      energyConsumptionKWh: powerKW,
      mechanism: 'Thermoelectric erosion by repetitive pulsed electrical sparks creating localized plasma temperatures (8,000–12,000°C) across a controlled spark gap.',
      toolWearRatioPercent: electrodeMaterial === 'graphite' ? 0.5 : 1.8,
      environmentalNotes: 'Requires dielectric fluid filtration and exhaust ventilation for hydrocarbon vapors.',
      advantages: [
        'Can machine ultra-hard conductive materials (hardened tool steels, tungsten carbide, Inconel) irrespective of hardness',
        'Zero mechanical cutting force; permits delicate, thin-walled workpieces',
        'High dimensional repeatability with fine spark erosion',
      ],
      limitations: [
        'Workpiece must be electrically conductive',
        'Relatively slow material removal rate compared to conventional milling',
        'Electrode wear requires redressing or multi-electrode roughing/finishing cycles',
        'Creates a thin recast layer (white layer) with residual tensile stresses',
      ],
      industrialApplications: [
        'Plastic injection mould cavities and progressive stamping dies',
        'Turbine blade cooling film holes and shroud seal slots',
        'Broken tap and drill extraction',
        'Wire EDM of extrusion dies and aerospace fir-tree roots',
      ],
    };
  }

  public static computeECM(params: ECMParams): NonTraditionalResult {
    const { voltageV, currentDensityACm2, valencyOfDissolution, atomicWeightG } = params;

    // Faraday's Law of Electrolysis: m = (A * I * t) / (z * F)
    // MRR (volume) = m / rho = (A * I) / (rho * z * F)
    // For typical alloy steel: rho ≈ 7.8 g/cm³, F = 96485 C/mol
    const faradayConst = 96485;
    const densitySteel = 7.85; // g/cm³
    const currentDensityPerMM2 = currentDensityACm2 / 100; // A/mm²
    // mm³/min per unit area of 100 mm²
    const mrrMM3Min = ((atomicWeightG * (currentDensityPerMM2 * 100) * 60) / (densitySteel * valencyOfDissolution * faradayConst)) * 1000;
    const ra = 0.2 + (0.5 / Math.sqrt(currentDensityPerMM2 + 0.1));
    const powerKW = (voltageV * currentDensityACm2 * 2.0) / 1000;

    return {
      process: 'ecm',
      materialRemovalRateMM3Min: Math.max(5, mrrMM3Min),
      surfaceRoughnessRaMicron: Math.min(3.2, Math.max(0.1, ra)),
      heatAffectedZoneMM: 0.0, // ECM is a cold, stress-free process!
      energyConsumptionKWh: powerKW,
      mechanism: 'Anodic electrochemical dissolution based on Faraday\'s Law of Electrolysis. High-velocity electrolyte sweeps reaction products away.',
      toolWearRatioPercent: 0.0, // Zero tool wear! Cathode tool is not consumed
      environmentalNotes: 'Generates metal hydroxide sludge that requires specialized industrial wastewater treatment.',
      advantages: [
        'Zero tool wear (the cathode tool does not dissolve or erode)',
        'Zero heat-affected zone (cold process; no metallurgical alterations or thermal micro-cracking)',
        'Zero residual stress or burr formation on complex contours',
        'Material removal rate is independent of workpiece hardness',
      ],
      limitations: [
        'High electrical power consumption and high initial capital investment',
        'Corrosive electrolyte environment requires stainless steel and non-metallic plumbing',
        'Workpiece must be electrically conductive',
        'Intricate tool design compensation required for electrolyte flow dynamics',
      ],
      industrialApplications: [
        'Turbine blisk (integrally bladed disk) electrochemical contouring',
        'Rifling of gun barrels and deep internal non-circular splines',
        'Automotive fuel injection nozzle deburring and valve profiling',
      ],
    };
  }

  public static computeLaser(params: LaserParams): NonTraditionalResult {
    const { laserPowerW, focalSpotDiameterMM, cuttingSpeedMMPM, materialThicknessMM } = params;

    const areaMM2 = (Math.PI * Math.pow(focalSpotDiameterMM, 2)) / 4;
    const powerDensityWPerMM2 = laserPowerW / areaMM2;
    const kerfWidthMM = focalSpotDiameterMM * 1.25;
    const mrrMM3Min = kerfWidthMM * materialThicknessMM * cuttingSpeedMMPM;
    const haz = 0.08 + (0.00015 * laserPowerW) / Math.sqrt(cuttingSpeedMMPM + 10);
    const ra = 0.8 + (1.2 * materialThicknessMM) / Math.sqrt(cuttingSpeedMMPM + 50);

    return {
      process: 'laser',
      materialRemovalRateMM3Min: Math.max(10, mrrMM3Min),
      surfaceRoughnessRaMicron: Math.min(6.3, Math.max(0.4, ra)),
      heatAffectedZoneMM: haz,
      energyConsumptionKWh: laserPowerW / 1000,
      mechanism: 'Highly coherent, monochromatic focused photons generate intense optical power density (>10⁶ W/cm²), causing rapid melting and vaporization accompanied by high-pressure assist gas blowout.',
      toolWearRatioPercent: 0.0,
      environmentalNotes: 'Produces airborne metal fumes and vaporization particulates; requires HEPA filtration and optical safety interlocks.',
      advantages: [
        'High cutting speed and narrow kerf width (minimal material wastage)',
        'Extremely versatile: cuts metals, ceramics, polymers, textiles, and composites',
        'Non-contact cutting tool eliminates tool deflection and mechanical clamping distortion',
        'Easily automated with CNC gantry and robotic 6-axis arms',
      ],
      limitations: [
        'High reflective losses when cutting bare copper, brass, and polished gold',
        'Thermal heat-affected zone and micro-striations along cut edges',
        'High equipment and laser resonator replacement cost',
      ],
      industrialApplications: [
        'Automotive chassis sheet metal blanking and hydroformed tube trimming',
        'Medical cardiovascular stent micromachining',
        'Aerospace combustor heat-shield drilling',
      ],
    };
  }

  public static computeWaterJet(params: WaterJetParams): NonTraditionalResult {
    const { pumpPressureBar, orificeDiameterMM, abrasiveMassFlowGMin, abrasiveType, cuttingSpeedMMPM } = params;

    // Bernoulli velocity: v = sqrt(2 * P / rho)
    // At 4000 bar (400 MPa), jet velocity ≈ 900 m/s (Mach ~2.7)
    const jetVelocityMS = Math.sqrt((2 * pumpPressureBar * 1e5) / 1000);
    const isAbrasive = abrasiveType !== 'pure-water';
    const kerfWidthMM = orificeDiameterMM * (isAbrasive ? 3.0 : 1.2);
    const mrrMM3Min = kerfWidthMM * 10 * cuttingSpeedMMPM * (isAbrasive ? 1.5 : 0.4);
    const ra = isAbrasive ? (abrasiveType === 'garnet-80' ? 2.5 : 1.6) : 0.8;

    return {
      process: 'waterjet',
      materialRemovalRateMM3Min: Math.max(5, mrrMM3Min),
      surfaceRoughnessRaMicron: ra,
      heatAffectedZoneMM: 0.0, // Cold supersonic hydrodynamic erosion!
      energyConsumptionKWh: (pumpPressureBar * 0.0075),
      mechanism: 'Supersonic hydrodynamic erosion: water pressurized up to 4,000–6,000 bar is discharged through a jewel orifice into a mixing chamber, entraining abrasive garnet particles to micro-shear the workpiece.',
      toolWearRatioPercent: isAbrasive ? 0.3 : 0.05, // Focus tube wear
      environmentalNotes: 'Environmentally clean; uses inert garnet and potable water with no toxic chemical fumes.',
      advantages: [
        'Completely cold cutting process (Zero heat-affected zone, zero thermal warping, zero fire hazard)',
        'Capable of cutting thick cross-sections (up to 150–200 mm in titanium, granite, and armor steel)',
        'Can cut heat-sensitive materials (composites, rubbers, sandwiches, and explosive ordnance)',
        'Green manufacturing process with fully recyclable abrasive garnet',
      ],
      limitations: [
        'Slower linear cutting speed than plasma or laser for thin sheet metal',
        'Kerf taper angle occurs on thick stock if 5-axis taper compensation is not active',
        'Noisy operation requiring acoustic water-tank submersed cutting',
      ],
      industrialApplications: [
        'Carbon-fiber composite aircraft wing skin trimming',
        'Architectural stone, granite, marble, and bulletproof glass profiling',
        'Food processing (pure water jet portioning of baked goods and meats without cross-contamination)',
      ],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 3: Welding Processes and Joint Design
  // ═══════════════════════════════════════════════════════════════════════════
  public static computeWelding(params: WeldingParams): WeldingResult {
    const { process, jointType, voltageV, currentA, travelSpeedMMS, arcEfficiency, plateThicknessMM } = params;

    // Heat Input: H = (η * V * I) / (v * 1000) in kJ/mm
    const heatInputKJMM = (arcEfficiency * voltageV * currentA) / (travelSpeedMMS * 1000);

    // Approximate bead geometry
    const beadWidthMM = Math.max(3, 0.8 * Math.sqrt(currentA) * (voltageV / 20));
    const penetrationDepthMM = Math.max(1, (0.025 * currentA * Math.sqrt(arcEfficiency)) / Math.sqrt(travelSpeedMMS / 5));
    const hazWidthMM = Math.max(0.8, 1.2 * heatInputKJMM);
    const crossSectionalAreaMM2 = 0.65 * beadWidthMM * (penetrationDepthMM + 2.0);

    // Joint efficiency baseline
    let jointEfficiencyPercent = 85;
    if (jointType === 'butt') jointEfficiencyPercent = 95;
    if (jointType === 'lap') jointEfficiencyPercent = 80;
    if (jointType === 'tee') jointEfficiencyPercent = 85;
    if (jointType === 'edge') jointEfficiencyPercent = 75;

    // Recommended filler diameter based on thickness
    let recommendedFillerDiameterMM = 2.5;
    if (plateThicknessMM <= 3) recommendedFillerDiameterMM = 1.6;
    else if (plateThicknessMM <= 6) recommendedFillerDiameterMM = 2.5;
    else if (plateThicknessMM <= 12) recommendedFillerDiameterMM = 3.2;
    else recommendedFillerDiameterMM = 4.0;

    // Defect Diagnosis
    const potentialDefects: WeldingResult['potentialDefects'] = [];

    if (heatInputKJMM > 2.2) {
      potentialDefects.push({
        defect: 'Burn-through & Coarse Grain HAZ',
        probability: 'high',
        cause: `Excessive heat input (${heatInputKJMM.toFixed(2)} kJ/mm) caused by high current or slow travel speed.`,
        remedy: 'Increase torch travel speed or reduce amperage.',
      });
    }

    if (travelSpeedMMS > 12) {
      potentialDefects.push({
        defect: 'Undercutting & Incomplete Fusion',
        probability: 'high',
        cause: `Excessive travel speed (${travelSpeedMMS} mm/s) prevents molten puddle from wetting joint sidewalls.`,
        remedy: 'Reduce travel speed and maintain proper electrode lead angle (10–15°).',
      });
    }

    if (process === 'smaw' && params.voltageV > 28) {
      potentialDefects.push({
        defect: 'Arc Blow & Spatter',
        probability: 'moderate',
        cause: 'Long arc length from excessive arc voltage.',
        remedy: 'Hold a tight arc length (arc length ≈ core wire diameter).',
      });
    }

    if (potentialDefects.length === 0) {
      potentialDefects.push({
        defect: 'None Detected',
        probability: 'low',
        cause: 'Welding parameters are well within standard AWS D1.1 structural welding envelopes.',
        remedy: 'Maintain uniform torch angle and consistent travel speed.',
      });
    }

    return {
      heatInputKJMM,
      beadWidthMM,
      penetrationDepthMM,
      hazWidthMM,
      crossSectionalAreaMM2,
      jointEfficiencyPercent,
      recommendedFillerDiameterMM,
      potentialDefects,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 4: Casting Processes and Mould Design
  // ═══════════════════════════════════════════════════════════════════════════
  public static computeCastingMould(params: MouldDesignParams): CastingResult {
    const { castingVolumeCM3, castingSurfaceAreaCM2, chvorinovConstantMinCm2, sprueHeightMM } = params;

    // Casting modulus M_c = V / A
    const modulusCM = castingVolumeCM3 / castingSurfaceAreaCM2;

    // Chvorinov's Rule: t = B * (V / A)^2
    const solidificationTimeMin = chvorinovConstantMinCm2 * Math.pow(modulusCM, 2);

    // Optimal Riser Design (Modulus method: M_riser >= 1.2 * M_casting)
    // For cylindrical riser with H = D:
    // V_r = (pi/4)*D^2*D = (pi/4)*D^3
    // A_r = (pi/4)*D^2 (top) + pi*D*D (sides) = 5/4 * pi * D^2 (insulated bottom)
    // M_r = V_r / A_r = D / 5 => D = 5 * M_r
    const targetRiserModulus = 1.2 * modulusCM;
    const riserDiameterCM = 5.0 * targetRiserModulus;
    const riserDiameterMM = riserDiameterCM * 10;
    const riserHeightMM = riserDiameterMM;

    // Riser solidification time
    const riserSolidificationTimeMin = chvorinovConstantMinCm2 * Math.pow(targetRiserModulus, 2);
    const riserAdequate = riserSolidificationTimeMin > solidificationTimeMin;

    // Sprue choke area via Torricelli's Law: v = sqrt(2 * g * h)
    const gravity = 9810; // mm/s^2
    const fillingVelocityMS = Math.sqrt(2 * (gravity / 1000) * (sprueHeightMM / 1000));
    // Pouring time empirical formula (for steel/iron): t_p = 0.95 * sqrt(mass in kg)
    const massKG = (castingVolumeCM3 * 7.85) / 1000;
    const pourTimeSec = Math.max(3, 1.8 * Math.sqrt(massKG));
    // Choke Area A_c = Volume / (t_p * v * efficiency)
    const volumeMM3 = castingVolumeCM3 * 1000;
    const sprueChokeAreaMM2 = volumeMM3 / (pourTimeSec * (fillingVelocityMS * 1000) * 0.85);

    const riserVolumeCM3 = (Math.PI / 4) * Math.pow(riserDiameterCM, 2) * (riserHeightMM / 10);
    const yieldPercent = (castingVolumeCM3 / (castingVolumeCM3 + riserVolumeCM3 + 25)) * 100;

    const defectRisks = [
      {
        defect: 'Shrinkage Cavity / Pipe',
        risk: riserAdequate ? 'Low' : 'High',
        prevention: 'Ensure riser solidifies last by maintaining M_riser >= 1.2 M_casting and proper neck sizing.',
      },
      {
        defect: 'Sand Inclusions & Gas Porosity',
        risk: fillingVelocityMS > 1.2 ? 'High (Turbulent Flow)' : 'Low (Laminar Gating)',
        prevention: 'Maintain unpressurized gating ratio (1 : 4 : 4) and provide sufficient permeable venting in the cope.',
      },
      {
        defect: 'Cold Shut & Misrun',
        risk: pourTimeSec > 25 ? 'High (Premature Freezing)' : 'Low',
        prevention: 'Increase pouring temperature by 50–75°C above liquidus and optimize gating channel length.',
      },
    ];

    return {
      modulusCM,
      solidificationTimeMin,
      riserDiameterMM,
      riserHeightMM,
      riserSolidificationTimeMin,
      riserAdequate,
      sprueChokeAreaMM2,
      pourTimeSec,
      yieldPercent: Math.min(95, Math.max(35, yieldPercent)),
      fillingVelocityMS,
      defectRisks,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 5: Metal Forming Processes
  // ═══════════════════════════════════════════════════════════════════════════
  public static computeMetalForming(params: FormingParams): FormingResult {
    const { process, materialYieldStressMPa, frictionCoefficient, initialDimensionMM, finalDimensionMM, workpieceLengthMM } = params;

    const notes: string[] = [];

    if (process === 'forging') {
      // Open die upset forging of a cylindrical billet: h0 -> hf
      const h0 = initialDimensionMM;
      const hf = Math.min(h0, finalDimensionMM);
      const reductionRatioPercent = ((h0 - hf) / h0) * 100;
      const strain = Math.log(h0 / hf);

      // Conservation of volume: pi * r0^2 * h0 = pi * rf^2 * hf
      const r0 = workpieceLengthMM / 2;
      const rf = r0 * Math.sqrt(h0 / hf);
      const contactAreaMM2 = Math.PI * Math.pow(rf, 2);

      // Average forging pressure with friction hill: p_avg = sigma_y * (1 + (2 * mu * r) / (3 * h))
      const frictionMultiplier = 1 + (2 * frictionCoefficient * rf) / (3 * hf);
      const forgingPressureMPa = materialYieldStressMPa * (1 + strain * 0.3) * frictionMultiplier;
      const deformationForceKN = (forgingPressureMPa * contactAreaMM2) / 1000;
      const powerRequiredKW = (deformationForceKN * 0.05); // press speed 50 mm/s

      notes.push(`Frictional barreling factor: ${(frictionMultiplier).toFixed(2)}x baseline yield stress.`);
      notes.push(`True compressive plastic strain ε = ${strain.toFixed(3)}.`);

      return {
        process,
        strain,
        reductionRatioPercent,
        deformationForceKN,
        powerRequiredKW,
        processFeasible: reductionRatioPercent < 70,
        notes,
      };
    }

    if (process === 'rolling') {
      // Flat sheet rolling: h0 -> hf
      const h0 = initialDimensionMM;
      const hf = Math.min(h0, finalDimensionMM);
      const draft = h0 - hf;
      const reductionRatioPercent = (draft / h0) * 100;
      const strain = Math.log(h0 / hf);
      const rollRadius = params.rollRadiusMM || 150;

      // Maximum possible draft without roll slip: Delta_h_max = mu^2 * R
      const maximumDraftMM = Math.pow(frictionCoefficient, 2) * rollRadius;
      const processFeasible = draft <= maximumDraftMM;

      if (!processFeasible) {
        notes.push(`Roll bite failure: required draft (${draft.toFixed(2)} mm) exceeds maximum draft (${maximumDraftMM.toFixed(2)} mm = μ²·R). Rolls will slip!`);
      }

      // Projected length of contact arc: L_p = sqrt(R * draft)
      const contactLengthMM = Math.sqrt(rollRadius * draft);
      const widthMM = workpieceLengthMM;
      const contactAreaMM2 = widthMM * contactLengthMM;

      // Roll separating force: F = sigma_avg * L_p * w * (1 + mu * L_p / (2 * h_avg))
      const hAvg = (h0 + hf) / 2;
      const rollForceKN = (materialYieldStressMPa * contactAreaMM2 * (1 + (frictionCoefficient * contactLengthMM) / (2 * hAvg))) / 1000;
      const rollPowerKW = (2 * rollForceKN * 0.001 * (contactLengthMM / 1000) * (2 * Math.PI * (100 / 60))) * 1000;

      notes.push(`Contact arc length: ${contactLengthMM.toFixed(2)} mm. Maximum allowable draft: ${maximumDraftMM.toFixed(2)} mm.`);

      return {
        process,
        strain,
        reductionRatioPercent,
        deformationForceKN: rollForceKN,
        powerRequiredKW: rollPowerKW,
        maximumDraftMM,
        processFeasible,
        notes,
      };
    }

    if (process === 'extrusion') {
      // Direct forward extrusion: D0 -> Df
      const d0 = initialDimensionMM;
      const df = Math.min(d0, finalDimensionMM);
      const a0 = (Math.PI / 4) * Math.pow(d0, 2);
      const af = (Math.PI / 4) * Math.pow(df, 2);
      const extrusionRatio = a0 / af;
      const strain = Math.log(extrusionRatio);
      const reductionRatioPercent = ((a0 - af) / a0) * 100;

      // Johnson's empirical extrusion formula: p = sigma_y * (a + b * ln(R))
      // For steel/aluminum: a ≈ 0.8, b ≈ 1.5
      const extrusionPressureMPa = materialYieldStressMPa * (0.8 + 1.5 * strain);
      const ramForceKN = (extrusionPressureMPa * a0) / 1000;
      const powerRequiredKW = (ramForceKN * 0.02);

      notes.push(`Extrusion ratio R = ${extrusionRatio.toFixed(2)}:1. Ram pressure = ${extrusionPressureMPa.toFixed(1)} MPa.`);

      return {
        process,
        strain,
        reductionRatioPercent,
        deformationForceKN: ramForceKN,
        powerRequiredKW,
        extrusionPressureMPa,
        processFeasible: extrusionRatio < 40,
        notes,
      };
    }

    // Wire / Rod Drawing
    const d0 = initialDimensionMM;
    const df = Math.min(d0, finalDimensionMM);
    const a0 = (Math.PI / 4) * Math.pow(d0, 2);
    const af = (Math.PI / 4) * Math.pow(df, 2);
    const strain = Math.log(a0 / af);
    const reductionRatioPercent = ((a0 - af) / a0) * 100;

    // Drawing stress: sigma_d = sigma_y * ln(A0 / Af) * (1 + mu / alpha)
    const semiDieAngleRad = ((params.dieAngleDeg || 12) * Math.PI) / 360;
    const drawStressFactor = (1 + frictionCoefficient / Math.tan(semiDieAngleRad));
    const drawingStressMPa = materialYieldStressMPa * strain * drawStressFactor;
    const drawingForceKN = (drawingStressMPa * af) / 1000;
    const processFeasible = drawingStressMPa < materialYieldStressMPa;

    if (!processFeasible) {
      notes.push(`Wire break warning: drawing stress (${drawingStressMPa.toFixed(1)} MPa) exceeds material yield stress. Wire will neck and snap at die exit!`);
    } else {
      notes.push(`Drawing stress safety margin: ${(100 - (drawingStressMPa / materialYieldStressMPa) * 100).toFixed(1)}% below yield limit.`);
    }

    return {
      process,
      strain,
      reductionRatioPercent,
      deformationForceKN: drawingForceKN,
      powerRequiredKW: drawingForceKN * 1.5,
      drawingStressMPa,
      processFeasible,
      notes,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 6: Machining Parameters and Manufacturing Calculations
  // ═══════════════════════════════════════════════════════════════════════════
  public static computeMachiningParameters(params: MachiningCalculationsInput): MachiningCalculationsResult {
    const {
      operation,
      workpieceDiameterMM,
      spindleSpeedRPM,
      feedMMRev,
      feedToothMM,
      numberOfTeeth,
      depthOfCutMM,
      cutLengthMM,
      initialDiameterMM,
      finalDiameterMM,
      taylorConstantC,
      taylorExponentN,
    } = params;

    // Cutting Speed V = (pi * D * N) / 1000 (m/min)
    const effectiveDia = operation === 'turning' ? (initialDiameterMM + finalDiameterMM) / 2 : workpieceDiameterMM;
    const cuttingSpeedCalculatedMPM = (Math.PI * effectiveDia * spindleSpeedRPM) / 1000;

    // Spindle Speed N = (1000 * V) / (pi * D)
    const spindleSpeedCalculatedRPM = spindleSpeedRPM;

    // Depth of cut d = (D0 - Df) / 2 for turning
    const depthOfCutCalculatedMM = operation === 'turning' ? Math.max(0.1, (initialDiameterMM - finalDiameterMM) / 2) : depthOfCutMM;

    // Machining Time Tm = L / (f * N) (min)
    let feedRateMMPM = feedMMRev * spindleSpeedRPM;
    if (operation === 'milling' && feedToothMM && numberOfTeeth) {
      feedRateMMPM = feedToothMM * numberOfTeeth * spindleSpeedRPM;
    }
    const machiningTimeMin = feedRateMMPM > 0 ? cutLengthMM / feedRateMMPM : 0;

    // Material Removal Rate:
    // Turning MRR = 1000 * V * f * d (in mm³/min) => / 1000 for cm³/min
    let mrrMM3Min = 1000 * cuttingSpeedCalculatedMPM * feedMMRev * depthOfCutCalculatedMM;
    if (operation === 'milling') {
      mrrMM3Min = workpieceDiameterMM * depthOfCutCalculatedMM * feedRateMMPM;
    } else if (operation === 'drilling') {
      mrrMM3Min = (Math.PI / 4) * Math.pow(workpieceDiameterMM, 2) * feedMMRev * spindleSpeedRPM;
    }
    const materialRemovalRateCM3Min = mrrMM3Min / 1000;

    // Taylor's Tool Life Equation: V * T^n = C => T = (C / V)^(1 / n)
    const n = Math.max(0.05, taylorExponentN);
    const toolLifeMin = cuttingSpeedCalculatedMPM > 0 ? Math.pow(taylorConstantC / cuttingSpeedCalculatedMPM, 1 / n) : 60;

    // Specific cutting energy for mild steel ~ 2.2 J/mm³ = 2.2 W·s/mm³
    const unitPowerSpecificEnergyJMM3 = 2.2;
    const cuttingPowerKW = (mrrMM3Min * unitPowerSpecificEnergyJMM3) / 60000;

    return {
      cuttingSpeedCalculatedMPM,
      spindleSpeedCalculatedRPM,
      machiningTimeMin,
      depthOfCutCalculatedMM,
      materialRemovalRateCM3Min,
      toolLifeMin,
      cuttingPowerKW,
      unitPowerSpecificEnergyJMM3,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 7: Manufacturing Process Selection
  // ═══════════════════════════════════════════════════════════════════════════
  public static selectManufacturingProcess(criteria: SelectionCriteria): ProcessSelectionResult {
    const candidates: ProcessCandidate[] = [
      {
        processName: 'CNC Milling & Turning',
        suitabilityScore: 85,
        pros: ['Exceptional dimensional precision (IT6–IT8)', 'Complete design flexibility with zero tooling lead time', 'Superb surface finish without post-processing'],
        cons: ['High material wastage (subtractive machining)', 'Relatively slow for massive batches (>10,000 pcs)'],
        typicalToleranceMM: '±0.01 to ±0.05 mm',
        achievableRaMicron: '0.8 to 1.6 μm',
        economicBatchRange: '1 to 5,000 units',
        recommendationRank: 1,
      },
      {
        processName: 'Investment (Lost-Wax) Casting',
        suitabilityScore: 80,
        pros: ['Near-net-shape complex internal passages and thin walls', 'Suitable for high-melting-point superalloys and stainless steels', 'Minimal machining allowance required'],
        cons: ['Moderate per-part tooling cost (wax injection dies)', 'Longer cycle times than pressure die casting'],
        typicalToleranceMM: '±0.10 to ±0.25 mm',
        achievableRaMicron: '1.6 to 3.2 μm',
        economicBatchRange: '50 to 10,000 units',
        recommendationRank: 2,
      },
      {
        processName: 'Closed-Die Forging',
        suitabilityScore: 75,
        pros: ['Superior directional grain flow and fatigue/impact resistance', 'Zero internal shrinkage porosity or casting voids', 'High strength-to-weight ratio for safety-critical parts'],
        cons: ['Expensive hardened die sets (economical only for high volume)', 'Cannot produce complex internal undercuts or hollow re-entrants'],
        typicalToleranceMM: '±0.5 to ±1.2 mm',
        achievableRaMicron: '3.2 to 6.3 μm',
        economicBatchRange: '1,000 to 500,000 units',
        recommendationRank: 3,
      },
      {
        processName: 'Electrical Discharge Machining (EDM)',
        suitabilityScore: 70,
        pros: ['Machines hardened tool steels and tungsten carbide without force', 'Produces deep, square internal corners and narrow slots', 'Zero mechanical cutting deflection'],
        cons: ['Workpiece must be electrically conductive', 'Low material removal rate compared to chip-making milling'],
        typicalToleranceMM: '±0.005 to ±0.02 mm',
        achievableRaMicron: '0.4 to 1.2 μm',
        economicBatchRange: '1 to 250 units (tooling/moulds)',
        recommendationRank: 4,
      },
      {
        processName: 'High-Pressure Die Casting (HPDC)',
        suitabilityScore: 65,
        pros: ['Ultra-fast cycle times (seconds per shot)', 'Excellent thin-wall capability for aluminum, zinc, and magnesium', 'Low labor cost per unit at mass scale'],
        cons: ['Prohibitive die tooling cost ($25k–$150k)', 'Limited to non-ferrous low-melting alloys'],
        typicalToleranceMM: '±0.05 to ±0.15 mm',
        achievableRaMicron: '1.2 to 2.5 μm',
        economicBatchRange: '5,000 to 1,000,000 units',
        recommendationRank: 5,
      },
    ];

    // Dynamic scoring adjustments based on user criteria
    for (const c of candidates) {
      if (criteria.batchQuantity === 'prototype-1-10' || criteria.batchQuantity === 'small-10-100') {
        if (c.processName.includes('CNC')) c.suitabilityScore += 12;
        if (c.processName.includes('Die Casting') || c.processName.includes('Forging')) c.suitabilityScore -= 25;
      } else if (criteria.batchQuantity === 'mass-5000-plus') {
        if (c.processName.includes('Die Casting') || c.processName.includes('Forging')) c.suitabilityScore += 20;
        if (c.processName.includes('EDM')) c.suitabilityScore -= 30;
      }

      if (criteria.materialCategory === 'cast-iron') {
        if (c.processName.includes('Die Casting')) c.suitabilityScore -= 50; // HPDC cannot cast iron!
      }

      if (criteria.toleranceGradeIT <= 7) {
        if (c.processName.includes('CNC') || c.processName.includes('EDM')) c.suitabilityScore += 10;
        else c.suitabilityScore -= 15;
      }
    }

    // Sort descending by suitability score
    candidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    candidates.forEach((c, idx) => {
      c.recommendationRank = idx + 1;
    });

    const topProcess = candidates[0]!;
    const topRecommendationReason = `Selected ${topProcess.processName} as the primary candidate because it balances the ${criteria.batchQuantity} production envelope with the required IT${criteria.toleranceGradeIT} tolerance and ${criteria.materialCategory} metallurgy without incurring disproportionate tooling amortizations.`;

    const criticalTradeoffs = [
      'Dimensional precision vs. cycle time: Precision machining incurs higher machine-hour rates than bulk net-shape forming.',
      'Initial tooling investment vs. piece-part cost: Hardened forging and die-casting dies require volume amortization to break even against direct 5-axis CNC routing.',
      'Surface integrity vs. process speed: High-energy thermal non-traditional processes (EDM, Laser) require post-machining chemical or mechanical deburring to remove recast layers.',
    ];

    return {
      criteria,
      rankedCandidates: candidates,
      topRecommendationReason,
      criticalTradeoffs,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Conceptual Quiz Bank (Grounding in Anna University / KPRIET Syllabus)
  // ═══════════════════════════════════════════════════════════════════════════
  public static getQuizQuestions(): Manufacturing2QuizQuestion[] {
    return [
      {
        id: 1,
        question: 'In CNC part programming, what is the functional difference between G01 and G00 commands?',
        options: [
          'G00 is linear feed cutting motion, while G01 is rapid traverse positioning',
          'G00 is rapid non-cutting traverse at maximum machine speed, while G01 is linear interpolation at a programmed feed rate (F)',
          'G00 is circular clockwise motion, while G01 is counter-clockwise motion',
          'G00 is incremental mode, while G01 is absolute positioning mode',
        ],
        correctAnswer: 1,
        explanation:
          'G00 initiates rapid coordinate positioning with the tool in clearance without cutting material, while G01 controls linear cutting feed at the specified feed rate F (mm/min or mm/rev).',
        syllabusTopic: 'Unit III: CNC Machine Tools and Part Programming',
      },
      {
        id: 2,
        question: 'What is the fundamental material removal mechanism in Electrical Discharge Machining (EDM)?',
        options: [
          'Mechanical micro-shearing by abrasive diamond grains',
          'Thermoelectric spark erosion producing localized micro-melting and vaporization in a dielectric fluid',
          'Anodic dissolution governed by Faraday\'s Law of electrolysis',
          'Chemical etching by acidic reagents',
        ],
        correctAnswer: 1,
        explanation:
          'EDM removes electrically conductive material through rapid, pulsed electrical spark discharges across a microscopic gap bathed in a dielectric medium, generating localized plasma temperatures of 8,000–12,000°C.',
        syllabusTopic: 'Unit IV: Non-Traditional Machining Processes',
      },
      {
        id: 3,
        question: 'According to Chvorinov\'s Rule (t_s = B·(V/A)²), how does a foundry engineer guarantee that the riser feeds the casting cavity effectively?',
        options: [
          'The riser modulus (V/A) must be at least 1.2 times greater than the casting modulus to ensure it freezes after the casting',
          'The riser must have a smaller volume than the sprue',
          'The riser surface area must be maximized to promote rapid chilling',
          'The riser must freeze before the casting cavity to seal the molten metal',
        ],
        correctAnswer: 0,
        explanation:
          'Chvorinov\'s Rule states that solidification time is proportional to (V/A)². To prevent shrinkage porosity in the casting, the riser must remain liquid longest; thus its geometric modulus M = V/A must satisfy M_riser ≥ 1.2 · M_casting.',
        syllabusTopic: 'Unit V: Casting Processes and Mould Design',
      },
      {
        id: 4,
        question: 'In flat rolling of metal strips, what governs the maximum possible reduction (draft Δh_max = h_0 - h_f) in a single pass without roll slip?',
        options: [
          'Δh_max = μ² · R, where μ is the coefficient of friction and R is the roll radius',
          'Δh_max = μ / R',
          'Δh_max is independent of friction and depends only on yield stress',
          'Δh_max = 2 · π · R · N',
        ],
        correctAnswer: 0,
        explanation:
          'From the equilibrium of forces in the rolling bite angle, tan(α) ≤ μ. For small bite angles, draft Δh = R·(1 - cos α) ≈ R·α²/2 ≤ μ²·R.',
        syllabusTopic: 'Unit V: Metal Forming Processes',
      },
      {
        id: 5,
        question: 'How is welding heat input (H) calculated for arc welding processes?',
        options: [
          'H = (V · I) / (1000 · v) · η, where V is voltage, I is current, v is travel speed, and η is arc thermal efficiency',
          'H = V · I · t',
          'H = (I² · R) / v',
          'H = (v · I) / (η · V)',
        ],
        correctAnswer: 0,
        explanation:
          'Net welding heat input per unit length (kJ/mm) is calculated as H = (η · V · I) / (1000 · v). High heat input broadens the heat-affected zone (HAZ) and promotes grain coarsening.',
        syllabusTopic: 'Unit V: Welding Processes and Joint Design',
      },
    ];
  }
}
