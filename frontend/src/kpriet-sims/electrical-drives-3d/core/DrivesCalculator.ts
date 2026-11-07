/**
 * Deterministic Electrical Drives Engineering Calculation Engine
 * Formulated according to:
 * - G.K. Dubey, Fundamentals of Electrical Drives (2nd Ed.)
 * - B.L. Theraja & A.K. Theraja, A Textbook of Electrical Technology, Vol. II (AC & DC Machines)
 * - P.S. Bimbhra, Generalized Theory of Electrical Machines / Electrical Machinery
 * - Anna University / Autonomous R2025 Syllabus (U25EE305 / ME3393 / EE8353)
 */

import type {
  DCMotorType,
  DCMotorState,
  InductionMotorState,
  StartingMethod,
  StartingMethodResult,
  BrakingMethod,
  BrakingMethodResult,
  VFDOperatingState,
  ControlCircuitState,
  ControlCircuitSimulationResult,
} from './types';
import { DRIVES_MOTOR_CATALOGUE } from './DrivesMotorDatabase';

export class DrivesCalculator {
  /**
   * 1. DC Motor Steady-State & Speed Control Calculations
   * Terminal voltage V, external armature resistance R_ext, external field resistance R_f_ext, load torque T_L
   */
  public static calculateDCMotorState(params: {
    motorType: DCMotorType;
    terminalVoltageV: number;
    loadTorqueNm: number;
    externalArmatureResistanceOhm?: number;
    externalFieldResistanceOhm?: number;
    fieldWeakeningRatio?: number; // 0.5 to 1.0
  }): DCMotorState {
    const V = Math.max(10, Math.min(300, params.terminalVoltageV));
    const TL = Math.max(0, params.loadTorqueNm);
    const R_ext = Math.max(0, params.externalArmatureResistanceOhm ?? 0);
    const Rf_ext = Math.max(0, params.externalFieldResistanceOhm ?? 0);
    const fieldRatio = Math.max(0.3, Math.min(1.2, params.fieldWeakeningRatio ?? 1.0));

    // Reference machine: 5 HP DC Shunt 220V, Ra = 0.5 ohm, Rf = 220 ohm, rated N = 1500 RPM, Ia_fl = 19.5 A
    const Ra_base = 0.5;
    const Ra_total = Ra_base + R_ext;
    const Rf_base = 220;
    const Rf_total = Rf_base + Rf_ext;

    // Field flux factor k_phi: At rated, Eb_rated = 220 - 19.5 * 0.5 = 210.25 V
    // omega_rated = 1500 * 2pi / 60 = 157.08 rad/s => ke_phi_rated = 210.25 / 157.08 = 1.3385 V/(rad/s)
    let ke_phi = 1.3385;
    let If = V / Rf_total;

    if (params.motorType === 'dc-shunt') {
      // Flux proportional to field current If
      ke_phi = 1.3385 * (If / (V / Rf_base)) * fieldRatio;
    } else if (params.motorType === 'dc-series') {
      // Series motor: Field winding is in series with armature. Ra_total includes series field (0.35 + 0.15 = 0.5 ohm)
      // Torque T = k_t * C_f * Ia^2 => Ia = sqrt(TL / kt_cf)
      const k_series = 0.065; // N*m / A^2
      const Ia = Math.max(1.0, Math.sqrt(TL / k_series));
      ke_phi = k_series * Ia;
      const Eb = Math.max(5, V - Ia * Ra_total);
      const omega = Math.max(5, Eb / Math.max(0.01, ke_phi));
      const speedRPM = (omega * 60) / (2 * Math.PI);
      const Te = k_series * Math.pow(Ia, 2);
      const P_in = V * Ia;
      const P_out = Te * omega;
      const eff = Math.min(95, Math.max(10, (P_out / Math.max(1, P_in)) * 100));

      return {
        terminalVoltageV: V,
        armatureCurrentA: Math.round(Ia * 10) / 10,
        fieldCurrentA: Math.round(Ia * 10) / 10,
        backEmfV: Math.round(Eb * 10) / 10,
        speedRPM: Math.round(speedRPM),
        speedRadPerSec: Math.round(omega * 10) / 10,
        developedTorqueNm: Math.round(Te * 10) / 10,
        loadTorqueNm: TL,
        inputPowerW: Math.round(P_in),
        outputPowerW: Math.round(P_out),
        efficiencyPercent: Math.round(eff * 10) / 10,
        fluxPercent: Math.round((ke_phi / 1.3385) * 100),
        externalArmatureResistanceOhm: R_ext,
        externalFieldResistanceOhm: Rf_ext,
      };
    }

    // For Shunt and Compound: Te = ke_phi * Ia => Ia = TL / ke_phi
    const noLoadIa = 1.5; // friction & windage current
    const Ia = Math.max(noLoadIa, TL / Math.max(0.05, ke_phi));
    const Eb = Math.max(0, V - Ia * Ra_total);
    const omega = Math.max(0, Eb / Math.max(0.05, ke_phi));
    const speedRPM = (omega * 60) / (2 * Math.PI);
    const Te = ke_phi * Ia;
    const P_in = V * (Ia + If);
    const P_out = Te * omega;
    const eff = Math.min(92, Math.max(15, (P_out / Math.max(1, P_in)) * 100));

    return {
      terminalVoltageV: V,
      armatureCurrentA: Math.round(Ia * 10) / 10,
      fieldCurrentA: Math.round(If * 100) / 100,
      backEmfV: Math.round(Eb * 10) / 10,
      speedRPM: Math.round(speedRPM),
      speedRadPerSec: Math.round(omega * 10) / 10,
      developedTorqueNm: Math.round(Te * 10) / 10,
      loadTorqueNm: TL,
      inputPowerW: Math.round(P_in),
      outputPowerW: Math.round(P_out),
      efficiencyPercent: Math.round(eff * 10) / 10,
      fluxPercent: Math.round((ke_phi / 1.3385) * 100),
      externalArmatureResistanceOhm: R_ext,
      externalFieldResistanceOhm: Rf_ext,
    };
  }

  /**
   * 2. Three-Phase Induction Motor & Thevenin Equivalent Circuit
   */
  public static calculateInductionMotorState(params: {
    lineVoltageV: number;
    frequencyHz: number;
    poles: number;
    slip?: number;
    rotorSpeedRPM?: number;
    addedRotorResistanceOhm?: number;
  }): InductionMotorState {
    const V_line = Math.max(50, Math.min(500, params.lineVoltageV));
    const f = Math.max(5, Math.min(100, params.frequencyHz));
    const P = Math.max(2, Math.min(12, Math.floor(params.poles / 2) * 2));
    const R_ext = Math.max(0, params.addedRotorResistanceOhm ?? 0);

    // Synchronous speed: Ns = 120 * f / P [RPM]
    const Ns = (120 * f) / P;
    const omega_s = (4 * Math.PI * f) / P; // synchronous angular speed in rad/s

    // Phase voltage (Star connection): V1 = V_line / √3
    const V1 = V_line / Math.sqrt(3);

    // Motor standard equivalent parameters (7.5 HP motor scaled to frequency)
    const freqRatio = f / 50;
    const R1 = 0.65;
    const X1 = 1.15 * freqRatio;
    const R2 = 0.42 + R_ext;
    const X2 = 1.25 * freqRatio;
    const Xm = 36.0 * freqRatio;

    // Thevenin equivalent parameters
    const Zm = Math.sqrt(Math.pow(R1, 2) + Math.pow(X1 + Xm, 2));
    const Vth = (V1 * Xm) / Zm;
    const Rth = (R1 * Math.pow(Xm, 2)) / Math.pow(Zm, 2);
    const Xth = X1;

    // Determine operating slip
    let s = 0.04;
    if (params.slip !== undefined) {
      s = Math.max(-0.5, Math.min(2.0, params.slip));
    } else if (params.rotorSpeedRPM !== undefined) {
      s = (Ns - params.rotorSpeedRPM) / Ns;
    }

    const Nr = Ns * (1 - s);

    // Breakdown / Pull-Out slip and maximum torque:
    // sm = R2 / √(Rth² + (Xth + X2)²)
    const denominatorReactance = Math.sqrt(Math.pow(Rth, 2) + Math.pow(Xth + X2, 2));
    const sm = R2 / Math.max(0.01, denominatorReactance);
    const T_max = (3 / (2 * omega_s)) * (Math.pow(Vth, 2) / (Rth + denominatorReactance));

    // Starting torque at s = 1.0:
    const T_start = (3 / omega_s) * ((Math.pow(Vth, 2) * R2) / (Math.pow(Rth + R2, 2) + Math.pow(Xth + X2, 2)));

    // Torque at operating slip s:
    let Te = 0;
    if (Math.abs(s) > 0.0001) {
      Te = (3 / omega_s) * ((Math.pow(Vth, 2) * (R2 / s)) / (Math.pow(Rth + R2 / s, 2) + Math.pow(Xth + X2, 2)));
    }

    // Referred rotor current: I2' = Vth / √((Rth + R2/s)² + (Xth + X2)²)
    let I2_prime = 0;
    if (Math.abs(s) > 0.0001) {
      I2_prime = Vth / Math.sqrt(Math.pow(Rth + R2 / s, 2) + Math.pow(Xth + X2, 2));
    }
    const I_stator = Math.sqrt(Math.pow(I2_prime, 2) + Math.pow(V1 / Xm, 2));

    const powerFactor = Math.min(0.92, Math.max(0.15, (Rth + (Math.abs(s) > 0.0001 ? R2 / s : 100)) / Math.sqrt(Math.pow(Rth + (Math.abs(s) > 0.0001 ? R2 / s : 100), 2) + Math.pow(Xth + X2, 2))));
    const P_in = Math.sqrt(3) * V_line * I_stator * powerFactor;
    const P_mech = Te * ((Nr * 2 * Math.PI) / 60);
    const P_cu_rotor = 3 * Math.pow(I2_prime, 2) * R2;
    const eff = Math.min(94, Math.max(0, (P_mech / Math.max(1, P_in)) * 100));

    let mode: 'motoring' | 'generating' | 'plugging' = 'motoring';
    if (s < 0) mode = 'generating';
    else if (s > 1) mode = 'plugging';

    return {
      lineVoltageV: V_line,
      frequencyHz: f,
      poles: P,
      synchronousSpeedRPM: Math.round(Ns),
      rotorSpeedRPM: Math.round(Nr),
      slip: Math.round(s * 10000) / 10000,
      slipPercent: Math.round(s * 1000) / 10,
      statorCurrentA: Math.round(I_stator * 10) / 10,
      rotorCurrentReferredA: Math.round(I2_prime * 10) / 10,
      developedTorqueNm: Math.round(Te * 10) / 10,
      loadTorqueNm: Math.round(Te * 10) / 10,
      pullOutTorqueNm: Math.round(T_max * 10) / 10,
      slipAtPullOut: Math.round(sm * 1000) / 1000,
      startingTorqueNm: Math.round(T_start * 10) / 10,
      powerFactor: Math.round(powerFactor * 100) / 100,
      inputPowerW: Math.round(P_in),
      mechanicalPowerW: Math.round(P_mech),
      rotorCopperLossW: Math.round(P_cu_rotor),
      efficiencyPercent: Math.round(eff * 10) / 10,
      operatingMode: mode,
    };
  }

  /**
   * 3. Motor Starting Performance Comparison (DOL, Star-Delta, Autotransformer, Soft Starter)
   */
  public static calculateStartingPerformance(method: StartingMethod, motorPowerKW: number = 5.5): StartingMethodResult {
    const P_kw = Math.max(1, motorPowerKW);
    const I_rated = (P_kw * 1000) / (Math.sqrt(3) * 415 * 0.85 * 0.88); // ~ 10.8 A for 5.5 kW
    let vRatio = 1.0;
    let iRatio = 6.0;
    let tRatio = 1.5;
    let t_acc = 3.5; // seconds
    let advantages: string[] = [];
    let disadvantages: string[] = [];

    switch (method) {
      case 'dol':
        vRatio = 1.0;
        iRatio = 6.0;
        tRatio = 1.5;
        t_acc = 2.2;
        advantages = ['Lowest installation cost', 'Simple single-contactor circuitry', 'Maximum available starting torque'];
        disadvantages = ['Massive starting current inrush (6× rated)', 'Severe supply voltage dip on shared feeders', 'Mechanical shock to gears and couplings'];
        break;
      case 'star-delta':
        vRatio = 1 / Math.sqrt(3); // 0.577
        iRatio = 2.0; // exactly 1/3 of DOL
        tRatio = 0.5; // exactly 1/3 of DOL
        t_acc = 5.0;
        advantages = ['Reduces line starting current to 1/3 of DOL', 'Economical standard dual-contactor scheme', 'No autotransformer tap losses'];
        disadvantages = ['Starting torque reduced to 1/3 (not suitable for heavy loads)', 'Requires 6 brought-out stator terminals (U1-U2, V1-V2, W1-W2)', 'Current spike during Star-to-Delta transition'];
        break;
      case 'auto-transformer':
        const tap = 0.70; // 70% tap
        vRatio = tap;
        iRatio = Math.pow(tap, 2) * 6.0; // 2.94x
        tRatio = Math.pow(tap, 2) * 1.5; // 0.735x
        t_acc = 4.2;
        advantages = ['Adjustable tappings (50%, 65%, 80%)', 'Line current is reduced by tap factor squared (x²)', 'Higher torque per ampere than star-delta'];
        disadvantages = ['Bulky and expensive transformer coils', 'Closed-transition Korndorfer scheme needed to prevent transient peaks', 'Higher thermal dissipation'];
        break;
      case 'soft-starter':
        vRatio = 0.45;
        iRatio = 2.5;
        tRatio = 0.65;
        t_acc = 6.0;
        advantages = ['Smooth stepless acceleration without mechanical jerk', 'Adjustable current limit and ramp time', 'Eliminates water hammer in pumping systems'];
        disadvantages = ['Generates harmonic distortion during gating', 'Higher initial investment than electromechanical starters', 'Requires bypass contactor for continuous running'];
        break;
      default:
        vRatio = 1.0;
        iRatio = 6.0;
        tRatio = 1.5;
        t_acc = 2.5;
    }

    // Generate current and speed versus time curve points
    const currentVsTime: Array<{ timeSec: number; currentA: number; speedRPM: number }> = [];
    const dt = 0.2;
    const totalTime = t_acc + 1.5;
    const targetRPM = 1440;

    for (let t = 0; t <= totalTime; t += dt) {
      let speedFrac = 0;
      if (t <= t_acc) {
        speedFrac = Math.pow(t / t_acc, 1.4);
      } else {
        speedFrac = 1.0;
      }

      // Current drops from starting peak to rated as speed approaches rated
      let cur = 0;
      if (t <= t_acc) {
        if (method === 'star-delta' && t > t_acc * 0.7 && t < t_acc * 0.8) {
          // Transition current spike
          cur = I_rated * (iRatio * (1 - speedFrac) + 1.8);
        } else {
          cur = I_rated * (iRatio * (1 - 0.7 * speedFrac) + 1.0);
        }
      } else {
        cur = I_rated;
      }

      currentVsTime.push({
        timeSec: Math.round(t * 10) / 10,
        currentA: Math.round(cur * 10) / 10,
        speedRPM: Math.round(speedFrac * targetRPM),
      });
    }

    return {
      method,
      startingCurrentRatio: Math.round(iRatio * 10) / 10,
      startingTorqueRatio: Math.round(tRatio * 100) / 100,
      accelerationTimeSec: t_acc,
      voltageAppliedRatio: Math.round(vRatio * 100) / 100,
      advantages,
      disadvantages,
      currentVsTime,
    };
  }

  /**
   * 4. Motor Electric Braking Kinetics (Regenerative, Dynamic, Plugging)
   */
  public static calculateBrakingPerformance(params: {
    method: BrakingMethod;
    initialSpeedRPM: number;
    momentOfInertiaKgM2: number;
    brakingResistanceOhm?: number;
    hasReverseCutoffRelay?: boolean;
  }): BrakingMethodResult {
    const N0 = Math.max(100, params.initialSpeedRPM);
    const J = Math.max(0.01, params.momentOfInertiaKgM2);
    const omega0 = (N0 * 2 * Math.PI) / 60;
    const totalKineticEnergy = 0.5 * J * Math.pow(omega0, 2);

    let stopTime = 2.0;
    let peakTorque = 40.0;
    let energyRec = 0;
    let energyDiss = totalKineticEnergy;

    if (params.method === 'regenerative') {
      // Regenerative: Energy returned to source. Speed can only be brought down to near synchronous speed in induction,
      // or to low speed in 4-quadrant chopper DC drives.
      energyRec = totalKineticEnergy * 0.75;
      energyDiss = totalKineticEnergy * 0.25; // winding copper losses
      stopTime = 3.8;
      peakTorque = 32.0;
    } else if (params.method === 'dynamic-rheostatic') {
      // Dynamic braking: kinetic energy entirely dissipated in external resistor RB
      const Rb = Math.max(2.0, params.brakingResistanceOhm ?? 5.0);
      stopTime = Math.max(0.8, (J * 1500) / (peakTorque * 2.5));
      peakTorque = 48.0 / (Rb / 5.0);
      energyRec = 0;
      energyDiss = totalKineticEnergy;
    } else if (params.method === 'plugging-counter-current') {
      // Plugging: Slip s ≈ 2.0, reverse torque applied with series limiting resistor
      // Fastest stopping method, but draws high current and requires zero-speed switch
      stopTime = 0.9;
      peakTorque = 75.0;
      energyRec = 0;
      // In plugging, energy supplied by source is also dissipated in rotor, so total loss > kinetic energy
      energyDiss = totalKineticEnergy * 2.2;
    }

    const thermalRise = Math.round((energyDiss / (45 * 460)) * 10) / 10; // C rise in active motor iron/copper mass

    // Generate speed and torque vs time curve
    const speedVsTime: Array<{ timeSec: number; speedRPM: number; torqueNm: number }> = [];
    const dt = 0.05;
    const numPoints = Math.ceil(stopTime / dt);

    for (let i = 0; i <= numPoints; i++) {
      const t = Math.min(stopTime, i * dt);
      const frac = Math.max(0, 1 - (t / stopTime));
      // Non-linear deceleration: steep initial torque, easing near standstill
      const curSpeed = Math.round(N0 * Math.pow(frac, 1.2));
      const curTorque = -Math.round(peakTorque * frac * 10) / 10;

      speedVsTime.push({
        timeSec: Math.round(t * 100) / 100,
        speedRPM: curSpeed,
        torqueNm: curTorque,
      });
    }

    return {
      method: params.method,
      stoppingTimeSec: Math.round(stopTime * 10) / 10,
      initialSpeedRPM: N0,
      energyRecoveredJoules: Math.round(energyRec),
      energyDissipatedJoules: Math.round(energyDiss),
      peakBrakingTorqueNm: Math.round(peakTorque * 10) / 10,
      thermalRiseC: thermalRise,
      reverseRotationPrevented: params.hasReverseCutoffRelay ?? true,
      speedVsTime,
    };
  }

  /**
   * 5. Variable Frequency Drive (VFD) V/f Control & SPWM Waveform Engine
   */
  public static calculateVFDState(params: {
    inputFrequencyHz: number;
    outputFrequencyHz: number;
    ratedVoltageV?: number;
    baseFrequencyHz?: number;
    poles?: number;
    loadTorqueNm?: number;
  }): VFDOperatingState {
    const f_in = Math.max(45, Math.min(65, params.inputFrequencyHz));
    const f_out = Math.max(2, Math.min(100, params.outputFrequencyHz));
    const V_rated = params.ratedVoltageV ?? 415;
    const f_base = params.baseFrequencyHz ?? 50;
    const P = params.poles ?? 4;
    const TL = params.loadTorqueNm ?? 25;

    // Standard V/f ratio at base: 415 V / 50 Hz = 8.3 V/Hz
    const ratedVPerF = V_rated / f_base;
    let V_out = 0;
    let isFieldWeakening = false;

    if (f_out <= f_base) {
      // Constant V/f region: Linear increase with low-frequency voltage boost for stator IR drop
      const irBoost = 15 * (1 - f_out / f_base); // IR compensation boost at low frequencies
      V_out = Math.min(V_rated, ratedVPerF * f_out + irBoost);
      isFieldWeakening = false;
    } else {
      // Field weakening region: Voltage is clamped at V_rated, flux decreases inversely with frequency (Phi ∝ 1/f)
      V_out = V_rated;
      isFieldWeakening = true;
    }

    const actualVPerF = V_out / f_out;
    const modulationIndex = Math.min(1.0, V_out / V_rated);
    const dcBusV = V_rated * Math.SQRT2; // ~ 587 V DC for 415V RMS AC

    // Synchronous speed
    const Ns = (120 * f_out) / P;
    // Slip under load (approximately 3-4% of synchronous speed)
    const slip = Math.min(0.12, 0.03 * (TL / 25));
    const Nr = Math.max(0, Ns * (1 - slip));

    // Developed torque: Maximum torque is constant below base, decreases as (1/f)² in field weakening
    let maxTe = 75; // Nm
    if (isFieldWeakening) {
      maxTe = 75 * Math.pow(f_base / f_out, 2);
    }
    const developedTorque = Math.min(maxTe, TL);
    const motorCurrent = (TL * 2.5) / Math.max(0.2, actualVPerF / ratedVPerF);

    // Generate SPWM 3-Phase synthesized waveform points (1 fundamental cycle)
    const pwmPoints: Array<{ timeMs: number; phaseA: number; phaseB: number; phaseC: number }> = [];
    const periodMs = 1000 / f_out;
    const carrierKhz = 2.5; // 2.5 kHz carrier
    const numPoints = 80;

    for (let i = 0; i <= numPoints; i++) {
      const tMs = (i / numPoints) * periodMs;
      const angle = (2 * Math.PI * tMs) / periodMs;

      // 3-Phase sinusoidal reference waves (120 deg apart)
      const refA = modulationIndex * Math.sin(angle);
      const refB = modulationIndex * Math.sin(angle - (2 * Math.PI) / 3);
      const refC = modulationIndex * Math.sin(angle + (2 * Math.PI) / 3);

      // Triangular carrier wave
      const carrierAngle = 2 * Math.PI * (tMs / (1 / carrierKhz));
      const triCarrier = (2 / Math.PI) * Math.asin(Math.sin(carrierAngle));

      // PWM 2-level switching state (+Vdc/2 or -Vdc/2)
      const pwmA = refA >= triCarrier ? dcBusV / 2 : -dcBusV / 2;
      const pwmB = refB >= triCarrier ? dcBusV / 2 : -dcBusV / 2;
      const pwmC = refC >= triCarrier ? dcBusV / 2 : -dcBusV / 2;

      pwmPoints.push({
        timeMs: Math.round(tMs * 100) / 100,
        phaseA: Math.round(pwmA),
        phaseB: Math.round(pwmB),
        phaseC: Math.round(pwmC),
      });
    }

    return {
      inputVoltageRMS: V_rated,
      inputFrequencyHz: f_in,
      outputFrequencyHz: f_out,
      outputVoltageRMS: Math.round(V_out * 10) / 10,
      vPerFRatio: Math.round(actualVPerF * 100) / 100,
      isFieldWeakening,
      modulationIndex: Math.round(modulationIndex * 100) / 100,
      carrierFrequencyKhz: carrierKhz,
      synchronousSpeedRPM: Math.round(Ns),
      rotorSpeedRPM: Math.round(Nr),
      developedTorqueNm: Math.round(developedTorque * 10) / 10,
      motorCurrentA: Math.round(motorCurrent * 10) / 10,
      dcBusVoltageV: Math.round(dcBusV),
      pwmWaveformPoints: pwmPoints,
    };
  }

  /**
   * 6. Motor Control Circuit Finite State Machine
   */
  public static evaluateControlCircuit(params: {
    startButtonPressed: boolean;
    stopButtonPressed: boolean;
    overloadTripped: boolean;
    emergencyStopPressed: boolean;
    previousState: ControlCircuitState;
    timerSecondsElapsed?: number;
  }): ControlCircuitSimulationResult {
    const logs: string[] = [];
    let state: ControlCircuitState = params.previousState;
    let mainClosed = false;
    let auxLatch = false;
    let green = false;
    let red = true;
    let amber = false;
    let motorRun = false;
    let curAmps = 0;
    const tElapsed = params.timerSecondsElapsed ?? 0;

    if (params.emergencyStopPressed) {
      state = 'emergency-stopped';
      logs.push('EMERGENCY STOP pushbutton triggered: Complete power isolation.');
      red = true;
      green = false;
      amber = false;
    } else if (params.overloadTripped) {
      state = 'tripped-overload';
      logs.push('Thermal Overload Relay (95-96 NC contact opened) due to sustained overcurrent.');
      amber = true;
      red = true;
      green = false;
    } else if (params.stopButtonPressed) {
      state = 'idle-stopped';
      logs.push('Stop pushbutton pressed (NC contact opened): Latching coil de-energized.');
      red = true;
      green = false;
    } else if (params.startButtonPressed) {
      state = 'running';
      logs.push('Start pushbutton pressed (NO contact closed): Contactor coil M energized, aux contact 13-14 latched.');
      mainClosed = true;
      auxLatch = true;
      green = true;
      red = false;
      motorRun = true;
      curAmps = 10.8;
    } else if (params.previousState === 'running') {
      // Maintained running state through 13-14 latch contact
      mainClosed = true;
      auxLatch = true;
      green = true;
      red = false;
      motorRun = true;
      curAmps = 10.8;
    }

    return {
      state,
      mainContactorClosed: mainClosed,
      auxiliaryLatchClosed: auxLatch,
      timerActive: state === 'starting',
      timerElapsedSec: tElapsed,
      thermalOverloadTripped: params.overloadTripped,
      pilotLampGreen: green,
      pilotLampRed: red,
      pilotLampAmber: amber,
      motorRunning: motorRun,
      currentAmps: curAmps,
      eventLog: logs,
    };
  }
}
