/**
 * Engineering Motor Catalogue & Electrical Drives Parameters Database
 * Course Code: U25EE305 / ME3393 / EE8353
 * Formulated from IEEE/NEMA & IEC 60034 standards
 */

import type { MotorCatalogueSpec, LoadTorqueProfile } from './types';

export const DRIVES_MOTOR_CATALOGUE: Record<string, MotorCatalogueSpec> = {
  'dc-shunt-5hp': {
    id: 'dc-shunt-5hp',
    name: 'Industrial DC Shunt Motor (5 HP / 3.7 kW)',
    category: 'dc',
    ratedPowerKW: 3.7,
    ratedVoltageV: 220,
    ratedCurrentA: 19.5,
    ratedSpeedRPM: 1500,
    ratedTorqueNm: 23.55, // P / omega = 3700 / (1500 * 2pi / 60)
    poles: 4,
    armatureResistanceOhm: 0.5,
    fieldResistanceOhm: 220,
    momentOfInertiaKgM2: 0.085,
    efficiencyPercent: 86.2,
    description: 'Constant speed motor with self-excited shunt field winding. Speed drops very slightly with load (~3-5%).',
    applications: ['Lathe machine spindles', 'Centrifugal pumps', 'Printing presses', 'Reciprocating compressors'],
  },
  'dc-series-7.5hp': {
    id: 'dc-series-7.5hp',
    name: 'Heavy Traction DC Series Motor (7.5 HP / 5.5 kW)',
    category: 'dc',
    ratedPowerKW: 5.5,
    ratedVoltageV: 220,
    ratedCurrentA: 28.5,
    ratedSpeedRPM: 1000,
    ratedTorqueNm: 52.52,
    poles: 4,
    armatureResistanceOhm: 0.35,
    fieldResistanceOhm: 0.15, // series field resistance
    momentOfInertiaKgM2: 0.12,
    efficiencyPercent: 87.5,
    description: 'Extremely high starting torque motor (T ∝ Ia²). Dangerous dangerously high no-load run-away speed.',
    applications: ['Electric railway locomotives', 'Cranes and hoists', 'Elevators', 'Trolley buses'],
  },
  'dc-compound-5hp': {
    id: 'dc-compound-5hp',
    name: 'Cumulative Compound DC Motor (5 HP / 3.7 kW)',
    category: 'dc',
    ratedPowerKW: 3.7,
    ratedVoltageV: 220,
    ratedCurrentA: 20.0,
    ratedSpeedRPM: 1450,
    ratedTorqueNm: 24.37,
    poles: 4,
    armatureResistanceOhm: 0.5,
    fieldResistanceOhm: 200,
    momentOfInertiaKgM2: 0.09,
    efficiencyPercent: 85.5,
    description: 'Combines series field high starting torque with shunt field safe finite no-load speed limiting.',
    applications: ['Punch presses', 'Shearing machines', 'Heavy conveyors', 'Rolling mills'],
  },
  'induction-cage-7.5hp': {
    id: 'induction-cage-7.5hp',
    name: '3-Phase Squirrel Cage Induction Motor (7.5 HP / 5.5 kW)',
    category: 'induction',
    ratedPowerKW: 5.5,
    ratedVoltageV: 415,
    ratedCurrentA: 10.8,
    ratedSpeedRPM: 1440,
    ratedTorqueNm: 36.48, // 5500 / (1440 * 2pi / 60)
    poles: 4,
    frequencyHz: 50,
    statorResistanceOhm: 0.65,
    statorReactanceOhm: 1.15,
    rotorResistanceOhm: 0.42, // referred to stator
    rotorReactanceOhm: 1.25,
    magnetizingReactanceOhm: 36.0,
    momentOfInertiaKgM2: 0.065,
    efficiencyPercent: 88.5,
    powerFactor: 0.84,
    description: 'Rugged, brushless, explosion-proof workhorse of modern industry with die-cast aluminum rotor cage.',
    applications: ['Industrial centrifugal pumps', 'Cooling fans', 'Belt conveyors', 'Air blowers', 'Machine tools'],
  },
  'induction-slipring-10hp': {
    id: 'induction-slipring-10hp',
    name: '3-Phase Wound Rotor / Slip Ring Motor (10 HP / 7.5 kW)',
    category: 'induction',
    ratedPowerKW: 7.5,
    ratedVoltageV: 415,
    ratedCurrentA: 14.5,
    ratedSpeedRPM: 960,
    ratedTorqueNm: 74.60,
    poles: 6,
    frequencyHz: 50,
    statorResistanceOhm: 0.52,
    statorReactanceOhm: 1.05,
    rotorResistanceOhm: 0.35,
    rotorReactanceOhm: 0.95,
    magnetizingReactanceOhm: 30.0,
    momentOfInertiaKgM2: 0.15,
    efficiencyPercent: 87.0,
    powerFactor: 0.82,
    description: 'Permits connection of external rotor resistance rheostat for high starting torque with low starting current.',
    applications: ['Mine winders', 'Ball mills', 'Harbor cranes', 'Heavy crushers', 'Compressors'],
  },
};

export const LOAD_PROFILES_DATABASE: Record<LoadTorqueProfile, {
  name: string;
  formula: string;
  description: string;
  examples: string[];
}> = {
  constant: {
    name: 'Constant Torque Load (T_L = const)',
    formula: 'T_L = T_rated',
    description: 'Torque remains invariant with respect to rotational speed. Power increases linearly with speed (P = T · ω).',
    examples: ['Cranes & hoists', 'Conveyor belts', 'Positive displacement reciprocating pumps', 'Extruders'],
  },
  linear: {
    name: 'Linear Viscous Load (T_L ∝ ω)',
    formula: 'T_L = k · ω',
    description: 'Load torque is directly proportional to rotational speed. Typical of viscous friction and eddy current retarders.',
    examples: ['Calenders & rolls', 'Piston pumps at low speeds', 'Motor-generator dynamometers'],
  },
  'fan-pump': {
    name: 'Centrifugal Fan / Pump Load (T_L ∝ ω²)',
    formula: 'T_L = k · ω² (P ∝ ω³)',
    description: 'Aerodynamic and hydraulic quadratic torque law. Operating power scales with the cube of speed (affinity laws).',
    examples: ['Centrifugal water pumps', 'Cooling tower fans', 'Industrial ventilation blowers', 'Ship propellers'],
  },
  'constant-power': {
    name: 'Constant Power Load (T_L ∝ 1/ω)',
    formula: 'T_L = P_rated / ω',
    description: 'Torque decreases inversely as speed increases, maintaining a constant mechanical shaft power output.',
    examples: ['Lathe machine tools during facing', 'Coilers and winders', 'Core drills', 'Milling spindles'],
  },
};

export const STARTING_METHODS_SUMMARY = [
  {
    method: 'dol',
    name: 'Direct-On-Line (DOL) Starter',
    voltageRatio: 1.0,
    startingCurrentRatio: 6.0,
    startingTorqueRatio: 1.5,
    description: 'Applies full line voltage directly to motor terminals using a contactor. Simple and low cost, but causes severe voltage dip.',
    typicalRangeKW: '< 5 kW (low power motors)',
  },
  {
    method: 'star-delta',
    name: 'Star–Delta (Y–Δ) Starter',
    voltageRatio: 0.577, // 1 / sqrt(3)
    startingCurrentRatio: 2.0, // 1/3 of DOL
    startingTorqueRatio: 0.5, // 1/3 of DOL
    description: 'Starts in Star (stator phase voltage = V_line / √3), then transitions via timer to Delta. Starting current and torque are reduced to 1/3.',
    typicalRangeKW: '5 kW – 25 kW',
  },
  {
    method: 'auto-transformer',
    name: 'Auto-Transformer Starter (Tap = 70%)',
    voltageRatio: 0.7,
    startingCurrentRatio: 2.94, // x^2 * 6
    startingTorqueRatio: 0.735, // x^2 * 1.5
    description: 'Uses tapped autotransformer coils (50%, 65%, 80%) to step down starting voltage. Line current is reduced by tap factor squared (x²).',
    typicalRangeKW: '> 25 kW (large industrial motors)',
  },
  {
    method: 'soft-starter',
    name: 'Thyristor Solid-State Soft Starter',
    voltageRatio: 0.4, // ramp up from 40% to 100%
    startingCurrentRatio: 2.5,
    startingTorqueRatio: 0.65,
    description: 'Uses back-to-back SCR thyristors with phase-angle gating control for smooth, stepless voltage and current acceleration without shock.',
    typicalRangeKW: 'All power ranges (smooth pump acceleration)',
  },
];
