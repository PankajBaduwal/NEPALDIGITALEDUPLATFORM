import type {
  BernoulliCalculationResult,
  BernoulliPointData,
  PipeFrictionCalculationResult,
  FlowMeterResult,
  CentrifugalPumpResult,
  ReciprocatingPumpResult,
  PeltonTurbineResult,
  FrancisTurbineResult,
} from './types';

/**
 * Pure numerical physics calculation engine for Fluid Mechanics and Machinery Virtual Laboratory.
 * Follows ISO 5167, IS:5120, IS:9137, and standard mechanical engineering textbook standards (Modi & Seth, Bansal).
 */
export class FluidMachineryCalculator {
  public static readonly GRAVITY = 9.81; // m/s^2
  public static readonly WATER_DENSITY = 998.2; // kg/m^3 at 20 deg C
  public static readonly DYNAMIC_VISCOSITY_WATER = 1.002e-3; // Pa*s
  public static readonly KINEMATIC_VISCOSITY_WATER = 1.004e-6; // m^2/s
  public static readonly MERCURY_SG = 13.6;

  /**
   * 1. Verification of Bernoulli's Theorem
   * Models steady incompressible flow through a converging-diverging horizontal or inclined duct.
   */
  public static calculateBernoulliTheorem(
    dischargeLps: number,
    inletDiameterMm: number = 50,
    throatDiameterMm: number = 25,
    datumInletM: number = 0.5,
    datumOutletM: number = 0.5,
    fluidDensityKgM3: number = 998.2
  ): BernoulliCalculationResult {
    const Q = Math.max(0.0001, dischargeLps) / 1000; // m^3/s
    const g = this.GRAVITY;

    // Standard 9-section converging-diverging venturi conduit (Section 1: inlet, Section 5: throat, Section 9: outlet)
    const numSections = 9;
    const totalLength = 1.2; // meters
    const sections: BernoulliPointData[] = [];

    // Base inlet total head (piezometric head supplied by overhead constant-head tank)
    const totalInletHeadSupplied = 1.8; // meters of water

    for (let i = 0; i < numSections; i++) {
      const frac = i / (numSections - 1);
      const x = frac * totalLength;
      const datum = datumInletM + frac * (datumOutletM - datumInletM);

      // Symmetrical smooth converging-diverging radius profile
      // At frac = 0.5 (throat), diameter = throatDiameterMm
      const dProfile =
        frac <= 0.5
          ? inletDiameterMm - (inletDiameterMm - throatDiameterMm) * (frac / 0.5)
          : throatDiameterMm + (inletDiameterMm - throatDiameterMm) * ((frac - 0.5) / 0.5);

      const diameter = dProfile / 1000; // m
      const area = (Math.PI * Math.pow(diameter, 2)) / 4; // m^2
      const velocity = Q / area; // m/s
      const velocityHead = Math.pow(velocity, 2) / (2 * g); // m

      // Minor frictional head loss accumulating along the transparent acrylic duct
      const cumulativeLoss = 0.05 * velocityHead * frac;
      const totalHead = Math.max(0.2, totalInletHeadSupplied - cumulativeLoss);
      const pressureHead = Math.max(0.01, totalHead - velocityHead - datum);

      sections.push({
        sectionIndex: i + 1,
        distance: Number(x.toFixed(3)),
        diameter: Number((diameter * 1000).toFixed(1)),
        area: Number(area.toFixed(6)),
        velocity: Number(velocity.toFixed(3)),
        velocityHead: Number(velocityHead.toFixed(4)),
        pressureHead: Number(pressureHead.toFixed(4)),
        datumHead: Number(datum.toFixed(4)),
        totalHead: Number((pressureHead + velocityHead + datum).toFixed(4)),
      });
    }

    const inletSec = sections[0]!;
    const throatSec = sections[4]!;
    const outletSec = sections[sections.length - 1]!;
    const totalLoss = inletSec.totalHead - outletSec.totalHead;
    const energyConservationError = (Math.abs(totalLoss) / (inletSec.totalHead || 1)) * 100;

    return {
      discharge: Q,
      dischargeLps,
      sections,
      inletVelocity: inletSec.velocity,
      throatVelocity: throatSec.velocity,
      inletPressureHead: inletSec.pressureHead,
      throatPressureHead: throatSec.pressureHead,
      headLossTotal: Number(totalLoss.toFixed(4)),
      energyConservationErrorPercent: Number(energyConservationError.toFixed(2)),
    };
  }

  /**
   * 2. Determination of Friction Factor and Minor Losses in Pipe Flow
   * Implements Darcy-Weisbach head loss: h_f = (4 * f' * L * v^2) / (2 * g * D) or (f * L * v^2) / (2 * g * D)
   * Using standard civil/mech engineering Darcy friction factor f = 64/Re (laminar) or Blasius/Swamee-Jain (turbulent).
   */
  public static calculatePipeFriction(
    flowRateLps: number,
    pipeDiameterMm: number = 25,
    pipeLengthM: number = 2.0,
    pipeRoughnessMm: number = 0.015, // commercial galvanized iron / drawn brass
    fluidTempC: number = 25,
    manometerFluid: 'mercury' | 'carbon-tetrachloride' = 'mercury'
  ): PipeFrictionCalculationResult {
    const Q = Math.max(0.001, flowRateLps) / 1000; // m^3/s
    const D = pipeDiameterMm / 1000; // m
    const g = this.GRAVITY;
    const A = (Math.PI * Math.pow(D, 2)) / 4;
    const v = Q / A;

    // Kinematic viscosity variation with temperature (water)
    const nu = 1.004e-6 * Math.exp(-0.02 * (fluidTempC - 20)); // m^2/s
    const Re = (v * D) / nu;

    let flowRegime: 'Laminar' | 'Transition' | 'Turbulent' = 'Turbulent';
    let fDarcy: number;

    if (Re <= 2000) {
      flowRegime = 'Laminar';
      fDarcy = 64 / Re;
    } else if (Re > 2000 && Re < 4000) {
      flowRegime = 'Transition';
      const fLam = 64 / 2000;
      const fTurb = 0.3164 * Math.pow(4000, -0.25);
      fDarcy = fLam + ((Re - 2000) / 2000) * (fTurb - fLam);
    } else {
      flowRegime = 'Turbulent';
      const epsRel = (pipeRoughnessMm / 1000) / D;
      // Swamee-Jain explicit approximation to Colebrook-White
      fDarcy =
        0.25 /
        Math.pow(
          Math.log10(epsRel / 3.7 + 5.74 / Math.pow(Re, 0.9)),
          2
        );
    }

    // Darcy-Weisbach frictional major head loss
    const majorHeadLoss = (fDarcy * pipeLengthM * Math.pow(v, 2)) / (2 * g * D);

    // Minor losses for entrance, exit, and two union couplings
    const kMinor = 0.5 + 1.0 + 0.3; // Entrance + Exit + Fittings
    const minorLosses = (kMinor * Math.pow(v, 2)) / (2 * g);
    const totalHeadLoss = majorHeadLoss + minorLosses;

    // Differential manometer deflection in meters of manometric fluid
    // h_f = y * (S_m / S_f - 1) => y = h_f / (S_m - 1)
    const Sm = manometerFluid === 'mercury' ? this.MERCURY_SG : 1.6;
    const manometerDeflectionM = majorHeadLoss / (Sm - 1.0);

    return {
      discharge: Q,
      velocity: Number(v.toFixed(3)),
      reynoldsNumber: Math.round(Re),
      flowRegime,
      frictionFactor: Number(fDarcy.toFixed(5)),
      majorHeadLoss: Number(majorHeadLoss.toFixed(4)),
      minorLosses: Number(minorLosses.toFixed(4)),
      totalHeadLoss: Number(totalHeadLoss.toFixed(4)),
      manometerDeflection: Number((manometerDeflectionM * 100).toFixed(2)), // in cm of Hg
      hydraulicGradient: Number((majorHeadLoss / pipeLengthM).toFixed(5)),
      frictionFactorTheoretical: Number((0.3164 * Math.pow(Math.max(Re, 100), -0.25)).toFixed(5)),
    };
  }

  /**
   * 3. Calibration of Flow Meters (Venturimeter, Orifice Meter, Rotameter)
   * Calculates theoretical discharge: Q_th = (a1 * a2 / sqrt(a1^2 - a2^2)) * sqrt(2 * g * h)
   * where h = y * (S_m - 1)
   */
  public static calculateFlowMeter(
    meterType: 'venturimeter' | 'orificemeter' | 'rotameter',
    inletDiameterMm: number = 50,
    throatDiameterMm: number = 25,
    manometerDeflectionCm: number = 15,
    fluidTempC: number = 25
  ): FlowMeterResult {
    const d1 = inletDiameterMm / 1000;
    const d2 = throatDiameterMm / 1000;
    const a1 = (Math.PI * Math.pow(d1, 2)) / 4;
    const a2 = (Math.PI * Math.pow(d2, 2)) / 4;
    const g = this.GRAVITY;

    // Manometer differential head: h = y * (S_Hg / S_w - 1)
    const yM = manometerDeflectionCm / 100;
    const differentialHeadM = yM * (this.MERCURY_SG - 1.0); // meters of water

    // Theoretical discharge Q_th
    const m = a1 / a2; // area ratio
    const qTheoretical = ((a1 * a2) / Math.sqrt(Math.pow(a1, 2) - Math.pow(a2, 2))) * Math.sqrt(2 * g * differentialHeadM);

    // Realistic laboratory coefficient of discharge (Cd)
    // Venturi: 0.96 to 0.98; Orifice: 0.60 to 0.64; Rotameter: 0.88 to 0.92
    let cdNominal: number;
    if (meterType === 'venturimeter') {
      cdNominal = 0.972 - 0.015 / Math.sqrt(Math.max(0.5, yM * 10));
    } else if (meterType === 'orificemeter') {
      cdNominal = 0.615 - 0.01 / Math.sqrt(Math.max(0.5, yM * 10));
    } else {
      // Rotameter
      cdNominal = 0.91;
    }
    const cd = Math.min(0.99, Math.max(0.55, cdNominal));
    const qActual = cd * qTheoretical;

    const velocityThroat = qActual / a2;
    const pressureDropKPa = (this.WATER_DENSITY * g * differentialHeadM) / 1000;

    return {
      meterType,
      inletDiameter: d1,
      throatDiameter: d2,
      manometerDeflection: manometerDeflectionCm,
      differentialHeadWater: Number(differentialHeadM.toFixed(4)),
      theoreticalDischarge: Number((qTheoretical * 1000).toFixed(3)), // in L/s
      actualDischarge: Number((qActual * 1000).toFixed(3)), // in L/s
      dischargeCoefficient: Number(cd.toFixed(4)),
      velocityThroat: Number(velocityThroat.toFixed(3)),
      pressureDropKPa: Number(pressureDropKPa.toFixed(2)),
    };
  }

  /**
   * 4. Performance Characteristics of a Centrifugal Pump
   * Calculates manometric head H_m = H_d + H_s + z, water power, shaft input power, and overall efficiency.
   * Generates realistic non-linear pump characteristic curves: H vs Q, eta vs Q, P vs Q.
   */
  public static calculateCentrifugalPump(
    flowRateLps: number,
    speedRpm: number = 2800,
    deliveryValveOpeningPercent: number = 75,
    ratedSpeedRpm: number = 2800,
    impellerDiameterMm: number = 180
  ): CentrifugalPumpResult {
    const g = this.GRAVITY;
    const rho = this.WATER_DENSITY;

    // Affinity laws scaling factor
    const speedRatio = speedRpm / ratedSpeedRpm;

    // Maximum shut-off head at zero discharge (Euler head minus slip)
    const H0 = 36 * Math.pow(speedRatio, 2); // meters

    // Quadratic head falloff with discharge: H = H0 - k * Q^2
    const Q = Math.max(0, flowRateLps) / 1000; // m^3/s
    const Qrated = 0.008 * speedRatio; // 8 L/s rated at 2800 rpm

    // Throttling resistance from delivery valve: lower valve opening decreases Q and increases delivery pressure
    const valveFactor = Math.max(0.05, deliveryValveOpeningPercent / 100);
    const actualQ = Math.min(Q, Qrated * Math.sqrt(valveFactor));

    // Manometric head generated by pump
    const headLossInternal = 120000 * Math.pow(actualQ, 2) / Math.pow(speedRatio, 2);
    const manometricHead = Math.max(2.0, H0 - headLossInternal);

    // Suction vacuum gauge reading (meters of water column vacuum)
    const suctionHeadM = 1.2 + 8000 * Math.pow(actualQ, 2);
    const deliveryHeadM = manometricHead - suctionHeadM;

    // Water (Hydraulic) Power: P_hyd = rho * g * Q * H_m
    const hydraulicPowerWatts = rho * g * actualQ * manometricHead;
    const hydraulicPowerKW = hydraulicPowerWatts / 1000;

    // Motor shaft input power (P_in): includes mechanical friction, disc friction, and leakage
    // No-load idle power + hydraulic work / peak internal hydraulic efficiency
    const idlePowerWatts = 450 * Math.pow(speedRatio, 3);
    const peakEff = 0.68;
    const loadPowerWatts = hydraulicPowerWatts / peakEff;
    const inputPowerKW = (idlePowerWatts + loadPowerWatts) / 1000;

    // Overall efficiency eta = (Hydraulic Power / Input Power) * 100
    const overallEfficiency = inputPowerKW > 0 ? (hydraulicPowerKW / inputPowerKW) * 100 : 0;

    // Specific Speed N_s = N * sqrt(Q) / H_m^(3/4) (Metric: rpm, m^3/s, m)
    const Ns = manometricHead > 0 ? (speedRpm * Math.sqrt(actualQ)) / Math.pow(manometricHead, 0.75) : 0;

    let status: 'Normal' | 'Impending Cavitation' | 'High Friction Throttle' = 'Normal';
    if (suctionHeadM > 6.5) {
      status = 'Impending Cavitation';
    } else if (deliveryValveOpeningPercent < 20) {
      status = 'High Friction Throttle';
    }

    return {
      flowRateLps: Number((actualQ * 1000).toFixed(2)),
      flowRateM3s: Number(actualQ.toFixed(5)),
      speedRpm,
      suctionHead: Number(suctionHeadM.toFixed(2)),
      deliveryHead: Number(deliveryHeadM.toFixed(2)),
      totalManometricHead: Number(manometricHead.toFixed(2)),
      hydraulicPowerWatts: Number(hydraulicPowerWatts.toFixed(1)),
      hydraulicPowerKW: Number(hydraulicPowerKW.toFixed(3)),
      inputPowerKW: Number(inputPowerKW.toFixed(3)),
      overallEfficiencyPercent: Number(overallEfficiency.toFixed(2)),
      specificSpeed: Number(Ns.toFixed(1)),
      operatingPointStatus: status,
    };
  }

  /**
   * 5. Performance Characteristics of a Reciprocating Pump
   * Calculates theoretical discharge Q_th = (A * L * N) / 60 (for single acting) or 2 * A * L * N / 60 (double acting)
   * Slip % = ((Q_th - Q_act) / Q_th) * 100, indicator diagram work, and mechanical efficiency.
   */
  public static calculateReciprocatingPump(
    cylinderDiameterMm: number = 75,
    strokeLengthMm: number = 150,
    speedRpm: number = 180,
    suctionHeadM: number = 3.0,
    deliveryHeadM: number = 15.0,
    withAirVessel: boolean = true,
    isDoubleActing: boolean = false
  ): ReciprocatingPumpResult {
    const D = cylinderDiameterMm / 1000;
    const L = strokeLengthMm / 1000;
    const A = (Math.PI * Math.pow(D, 2)) / 4;
    const N = speedRpm;
    const g = this.GRAVITY;
    const rho = this.WATER_DENSITY;

    // Theoretical discharge Q_th
    const multiplier = isDoubleActing ? 2.0 : 1.0;
    const qTheoreticalM3s = (multiplier * A * L * N) / 60;
    const qTheoreticalLps = qTheoreticalM3s * 1000;

    // Slip percentage: typically 2% to 6% in properly primed positive displacement pump
    // Negative slip occurs occasionally at high speed with long delivery pipe without air vessel
    const slipNominal = withAirVessel ? 3.5 : 8.2;
    const actualQ_Lps = qTheoreticalLps * (1 - slipNominal / 100);
    const actualQ_M3s = actualQ_Lps / 1000;
    const slipPercent = ((qTheoreticalLps - actualQ_Lps) / qTheoreticalLps) * 100;
    const cd = actualQ_Lps / qTheoreticalLps;

    // Total static head H_s + H_d
    const totalStaticHead = suctionHeadM + deliveryHeadM;

    // Indicator Diagram Area (Work done per second / stroke)
    // In an ideal pump with air vessel, acceleration head is eliminated in long pipes
    const accelerationHeadSuction = withAirVessel ? 0.2 : 1.8;
    const accelerationHeadDelivery = withAirVessel ? 0.4 : 3.6;
    const effectiveMeanPressureHead = totalStaticHead + (accelerationHeadSuction + accelerationHeadDelivery) * 0.35;

    const indicatedWorkPerCycle = rho * g * (A * L) * effectiveMeanPressureHead; // Joules/cycle
    const indicatedPowerWatts = (indicatedWorkPerCycle * N * multiplier) / 60; // Watts
    const hydraulicPowerWatts = rho * g * actualQ_M3s * totalStaticHead;

    // Mechanical losses in packing gland, piston rings, and crank mechanism
    const mechanicalLossWatts = 180 + 0.12 * indicatedPowerWatts;
    const brakePowerWatts = indicatedPowerWatts + mechanicalLossWatts;
    const mechanicalEfficiency = (indicatedPowerWatts / brakePowerWatts) * 100;

    return {
      cylinderDiameter: D,
      strokeLength: L,
      speedRpm: N,
      theoreticalDischargeLps: Number(qTheoreticalLps.toFixed(3)),
      actualDischargeLps: Number(actualQ_Lps.toFixed(3)),
      slipPercent: Number(slipPercent.toFixed(2)),
      coefficientOfDischarge: Number(cd.toFixed(4)),
      indicatorDiagramArea: Number(indicatedWorkPerCycle.toFixed(1)),
      indicatedPowerWatts: Number(indicatedPowerWatts.toFixed(1)),
      brakePowerWatts: Number(brakePowerWatts.toFixed(1)),
      mechanicalEfficiencyPercent: Number(mechanicalEfficiency.toFixed(2)),
      hasAirVessel: withAirVessel,
    };
  }

  /**
   * 6. Performance Characteristics of a Pelton Wheel Turbine
   * Tangential flow impulse turbine:
   * Net head H, jet velocity v = Cv * sqrt(2 * g * H), hydraulic power P_hyd = rho * g * Q * H,
   * Brake power P_s = (2 * pi * N * (W1 - W2) * R * g) / 60000, overall efficiency eta_o = P_s / P_hyd.
   */
  public static calculatePeltonTurbine(
    netHeadM: number = 30.0,
    spearOpeningPercent: number = 70,
    speedRpm: number = 750,
    brakeDeadWeightKg: number = 18.0,
    springBalanceKg: number = 3.5,
    brakeDrumRadiusM: number = 0.15
  ): PeltonTurbineResult {
    const g = this.GRAVITY;
    const rho = this.WATER_DENSITY;
    const Cv = 0.98; // Coefficient of velocity for spear nozzle

    // Jet velocity leaving spear nozzle: v1 = Cv * sqrt(2 * g * H)
    const jetVelocity = Cv * Math.sqrt(2 * g * netHeadM);

    // Nozzle diameter and discharge controlled by spear needle position
    const maxNozzleDiaMm = 28;
    const nozzleDiaM = (maxNozzleDiaMm * (spearOpeningPercent / 100)) / 1000;
    const nozzleArea = (Math.PI * Math.pow(nozzleDiaM, 2)) / 4;
    const dischargeM3s = nozzleArea * jetVelocity;
    const dischargeLps = dischargeM3s * 1000;

    // Hydraulic input power supplied by water jet: P_hyd = rho * g * Q * H
    const hydraulicPowerWatts = rho * g * dischargeM3s * netHeadM;
    const hydraulicInputPowerKW = hydraulicPowerWatts / 1000;

    // Brake dynamometer mechanical shaft output power
    // Net tangential braking force F = (W_dead - W_spring) * g
    const netBrakeKg = Math.max(0, brakeDeadWeightKg - springBalanceKg);
    const netBrakeLoadN = netBrakeKg * g;
    const brakeShaftTorqueNm = netBrakeLoadN * brakeDrumRadiusM;

    // Brake shaft power P_s = (2 * pi * N * T) / 60000 in kW
    const brakeShaftPowerKW = (2 * Math.PI * speedRpm * brakeShaftTorqueNm) / 60000;

    // Overall efficiency: eta_o = (P_s / P_hyd) * 100
    const overallEfficiency = hydraulicInputPowerKW > 0 ? (brakeShaftPowerKW / hydraulicInputPowerKW) * 100 : 0;

    // Unit Quantities:
    // Q_u = Q / sqrt(H), N_u = N / sqrt(H), P_u = P / H^(3/2)
    const sqrtH = Math.sqrt(netHeadM);
    const unitSpeed = speedRpm / sqrtH;
    const unitDischarge = dischargeLps / sqrtH;
    const unitPower = brakeShaftPowerKW / Math.pow(netHeadM, 1.5);

    // Specific speed N_s = (N * sqrt(P_s)) / H^(5/4) (Metric: P in kW)
    const Ns = (speedRpm * Math.sqrt(Math.max(0, brakeShaftPowerKW))) / Math.pow(netHeadM, 1.25);

    return {
      netHead: netHeadM,
      dischargeLps: Number(dischargeLps.toFixed(2)),
      speedRpm,
      jetDiameter: Number((nozzleDiaM * 1000).toFixed(1)),
      jetVelocity: Number(jetVelocity.toFixed(2)),
      hydraulicInputPowerKW: Number(hydraulicInputPowerKW.toFixed(3)),
      brakeDeadWeightKg,
      springBalanceKg,
      netBrakeLoadN: Number(netBrakeLoadN.toFixed(2)),
      brakeDrumRadius: brakeDrumRadiusM,
      brakeShaftTorqueNm: Number(brakeShaftTorqueNm.toFixed(2)),
      brakeShaftPowerKW: Number(brakeShaftPowerKW.toFixed(3)),
      overallEfficiencyPercent: Number(Math.min(92, Math.max(0, overallEfficiency)).toFixed(2)),
      specificSpeed: Number(Ns.toFixed(2)),
      unitSpeed: Number(unitSpeed.toFixed(2)),
      unitDischarge: Number(unitDischarge.toFixed(3)),
      unitPower: Number(unitPower.toFixed(4)),
    };
  }

  /**
   * 7. Performance Characteristics of a Francis Turbine
   * Mixed / Inward reaction turbine:
   * Spiral casing, adjustable guide vanes, runner, draft tube with tailrace pressure recovery.
   */
  public static calculateFrancisTurbine(
    netHeadM: number = 18.0,
    guideVaneAngleDeg: number = 32.0, // guide vane opening angle
    speedRpm: number = 1100,
    brakeDeadWeightKg: number = 24.0,
    springBalanceKg: number = 4.0,
    brakeDrumRadiusM: number = 0.18
  ): FrancisTurbineResult {
    const g = this.GRAVITY;
    const rho = this.WATER_DENSITY;

    // Runner geometry for standard laboratory Francis test rig
    const runnerInletDiameterM = 0.18;
    const runnerWidthM = 0.022;

    // Flow rate through guide vanes: function of guide vane angle and net head
    const vaneFactor = Math.sin((guideVaneAngleDeg * Math.PI) / 180);
    const flowVelocityInlet = 0.25 * Math.sqrt(2 * g * netHeadM) * vaneFactor;
    const flowArea = Math.PI * runnerInletDiameterM * runnerWidthM;
    const dischargeM3s = flowArea * flowVelocityInlet;
    const dischargeLps = dischargeM3s * 1000;

    // Hydraulic input power supplied to spiral casing
    const hydraulicPowerWatts = rho * g * dischargeM3s * netHeadM;
    const hydraulicInputPowerKW = hydraulicPowerWatts / 1000;

    // Brake shaft power from rope brake dynamometer
    const netBrakeKg = Math.max(0, brakeDeadWeightKg - springBalanceKg);
    const netBrakeLoadN = netBrakeKg * g;
    const brakeTorqueNm = netBrakeLoadN * brakeDrumRadiusM;
    const brakeShaftPowerKW = (2 * Math.PI * speedRpm * brakeTorqueNm) / 60000;

    // Overall efficiency
    const overallEfficiency = hydraulicInputPowerKW > 0 ? (brakeShaftPowerKW / hydraulicInputPowerKW) * 100 : 0;

    // Draft tube vacuum pressure: converts kinetic energy of exit fluid into pressure head
    const exitVelocity = 0.35 * Math.sqrt(2 * g * netHeadM);
    const draftTubeRecoveryHead = 0.75 * (Math.pow(exitVelocity, 2) / (2 * g));
    const draftTubePressureKPa = (rho * g * -draftTubeRecoveryHead) / 1000; // gauge vacuum

    // Unit Quantities & Specific Speed
    const sqrtH = Math.sqrt(netHeadM);
    const unitSpeed = speedRpm / sqrtH;
    const unitDischarge = dischargeLps / sqrtH;
    const unitPower = brakeShaftPowerKW / Math.pow(netHeadM, 1.5);
    const Ns = (speedRpm * Math.sqrt(Math.max(0, brakeShaftPowerKW))) / Math.pow(netHeadM, 1.25);

    return {
      netHead: netHeadM,
      dischargeLps: Number(dischargeLps.toFixed(2)),
      speedRpm,
      guideVaneAngleDeg,
      hydraulicInputPowerKW: Number(hydraulicInputPowerKW.toFixed(3)),
      brakeTorqueNm: Number(brakeTorqueNm.toFixed(2)),
      brakeShaftPowerKW: Number(brakeShaftPowerKW.toFixed(3)),
      overallEfficiencyPercent: Number(Math.min(94, Math.max(0, overallEfficiency)).toFixed(2)),
      runnerInletDiameter: runnerInletDiameterM,
      runnerWidth: runnerWidthM,
      draftTubePressureKPa: Number(draftTubePressureKPa.toFixed(2)),
      specificSpeed: Number(Ns.toFixed(2)),
      unitSpeed: Number(unitSpeed.toFixed(2)),
      unitDischarge: Number(unitDischarge.toFixed(3)),
      unitPower: Number(unitPower.toFixed(4)),
    };
  }
}
