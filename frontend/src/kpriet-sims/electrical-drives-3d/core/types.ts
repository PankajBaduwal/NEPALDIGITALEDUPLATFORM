/**
 * Domain Type Definitions for Electrical Drives and Control Simulation Suite
 * Course Code: U25EE305 / ME3393 / EE8353
 * Department of Mechanical Engineering | Semester III | Regulation R2025
 */

export type ElectricalDrivesSimId =
  | 'u25ee305-sim-01' // DC Motor & Speed Control
  | 'u25ee305-sim-02' // 3-Phase Induction Motor & Slip Mechanics
  | 'u25ee305-sim-03' // Motor Starting Methods (DOL, Star-Delta, Autotransformer, Soft Starter)
  | 'u25ee305-sim-04' // Motor Braking Methods (Regenerative, Dynamic, Plugging)
  | 'u25ee305-sim-05' // Variable Frequency Drive (VFD / V/f Control & PWM)
  | 'u25ee305-sim-06' // Torque-Speed Characteristics & Load Matching
  | 'u25ee305-sim-07' // Industrial Control Circuits & Ladder Logic
  | 'u25ee305-sim-08'; // 3D Virtual Electrical Drives Laboratory

export type DCMotorType = 'dc-shunt' | 'dc-series' | 'dc-compound-cumulative' | 'dc-compound-differential';

export type InductionMotorType = 'squirrel-cage' | 'slip-ring';

export type MotorCategory = 'dc' | 'induction' | 'special';

export type StartingMethod =
  | 'dol'
  | 'star-delta'
  | 'auto-transformer'
  | 'soft-starter'
  | 'stator-resistance'
  | 'dc-3-point'
  | 'dc-4-point';

export type BrakingMethod =
  | 'regenerative'
  | 'dynamic-rheostatic'
  | 'plugging-counter-current';

export type LoadTorqueProfile =
  | 'constant'       // Hoist, conveyor, positive displacement pump: T_L = const
  | 'linear'         // Calendar, calender roll, viscous friction: T_L ∝ ω
  | 'fan-pump'       // Centrifugal pump, blower, fan: T_L ∝ ω²
  | 'constant-power';// Machine tool spindle, lathe turning: T_L ∝ 1/ω

export type ControlCircuitState =
  | 'idle-stopped'
  | 'starting'
  | 'running'
  | 'tripped-overload'
  | 'emergency-stopped'
  | 'jogging';

export interface MotorCatalogueSpec {
  id: string;
  name: string;
  category: MotorCategory;
  ratedPowerKW: number;
  ratedVoltageV: number;
  ratedCurrentA: number;
  ratedSpeedRPM: number;
  ratedTorqueNm: number;
  poles: number;
  frequencyHz?: number;
  statorResistanceOhm?: number;
  statorReactanceOhm?: number;
  rotorResistanceOhm?: number;
  rotorReactanceOhm?: number;
  magnetizingReactanceOhm?: number;
  armatureResistanceOhm?: number;
  fieldResistanceOhm?: number;
  momentOfInertiaKgM2: number;
  efficiencyPercent: number;
  powerFactor?: number;
  description: string;
  applications: string[];
}

export interface DCMotorState {
  terminalVoltageV: number;
  armatureCurrentA: number;
  fieldCurrentA: number;
  backEmfV: number;
  speedRPM: number;
  speedRadPerSec: number;
  developedTorqueNm: number;
  loadTorqueNm: number;
  inputPowerW: number;
  outputPowerW: number;
  efficiencyPercent: number;
  fluxPercent: number;
  externalArmatureResistanceOhm: number;
  externalFieldResistanceOhm: number;
}

export interface InductionMotorState {
  lineVoltageV: number;
  frequencyHz: number;
  poles: number;
  synchronousSpeedRPM: number;
  rotorSpeedRPM: number;
  slip: number;
  slipPercent: number;
  statorCurrentA: number;
  rotorCurrentReferredA: number;
  developedTorqueNm: number;
  loadTorqueNm: number;
  pullOutTorqueNm: number;
  slipAtPullOut: number;
  startingTorqueNm: number;
  powerFactor: number;
  inputPowerW: number;
  mechanicalPowerW: number;
  rotorCopperLossW: number;
  efficiencyPercent: number;
  operatingMode: 'motoring' | 'generating' | 'plugging';
}

export interface StartingMethodResult {
  method: StartingMethod;
  startingCurrentRatio: number; // I_start / I_rated
  startingTorqueRatio: number;  // T_start / T_rated
  accelerationTimeSec: number;
  voltageAppliedRatio: number;
  advantages: string[];
  disadvantages: string[];
  currentVsTime: Array<{ timeSec: number; currentA: number; speedRPM: number }>;
}

export interface BrakingMethodResult {
  method: BrakingMethod;
  stoppingTimeSec: number;
  initialSpeedRPM: number;
  energyRecoveredJoules?: number;
  energyDissipatedJoules: number;
  peakBrakingTorqueNm: number;
  thermalRiseC: number;
  reverseRotationPrevented: boolean;
  speedVsTime: Array<{ timeSec: number; speedRPM: number; torqueNm: number }>;
}

export interface VFDOperatingState {
  inputVoltageRMS: number;
  inputFrequencyHz: number;
  outputFrequencyHz: number;
  outputVoltageRMS: number;
  vPerFRatio: number;
  isFieldWeakening: boolean;
  modulationIndex: number;
  carrierFrequencyKhz: number;
  synchronousSpeedRPM: number;
  rotorSpeedRPM: number;
  developedTorqueNm: number;
  motorCurrentA: number;
  dcBusVoltageV: number;
  pwmWaveformPoints: Array<{ timeMs: number; phaseA: number; phaseB: number; phaseC: number }>;
}

export interface ControlCircuitComponent {
  id: string;
  name: string;
  type: 'pushbutton-no' | 'pushbutton-nc' | 'contactor-coil' | 'aux-contact-no' | 'aux-contact-nc' | 'overload-relay' | 'indicator-lamp' | 'timer-relay';
  isEnergized: boolean;
  isOpen: boolean;
  tag: string;
  description: string;
}

export interface ControlCircuitSimulationResult {
  state: ControlCircuitState;
  mainContactorClosed: boolean;
  auxiliaryLatchClosed: boolean;
  timerActive: boolean;
  timerElapsedSec: number;
  thermalOverloadTripped: boolean;
  pilotLampGreen: boolean;
  pilotLampRed: boolean;
  pilotLampAmber: boolean;
  motorRunning: boolean;
  currentAmps: number;
  eventLog: string[];
}

export interface DrivesLabTrial {
  trialNumber: number;
  timestamp: string;
  motorName: string;
  controlMode: string;
  measuredVoltageV: number;
  measuredCurrentA: number;
  measuredSpeedRPM: number;
  measuredTorqueNm: number;
  calculatedPowerW: number;
  calculatedEfficiencyPct: number;
  status: 'COMPLETED' | 'VERIFIED';
}
