/**
 * Comprehensive Verification & Test Suite
 * KPRIET Advanced Electrochemical Cells & Energy Storage Virtual Laboratory
 */

import { LithiumIonModel } from './simulations/lithium-ion/LithiumIonModel';
import { LeadAcidModel } from './simulations/lead-acid/LeadAcidModel';
import { PEMFuelCellModel } from './simulations/pem-fuel-cell/PEMFuelCellModel';
import {
  mountLithiumIonSimulation,
  mountLeadAcidSimulation,
  mountPEMFuelCellSimulation,
} from './index';

declare const process: { exit: (code?: number) => void };

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('═══════════════════════════════════════════════════════════════════');
console.log('KPRIET ELECTROCHEMISTRY VIRTUAL LABORATORY - VERIFICATION TEST RUN');
console.log('═══════════════════════════════════════════════════════════════════\n');

// ── TEST SUITE 1: Lithium-Ion Battery (LFP / Graphite) ──────────────────
console.log('── TEST 1: Lithium-Ion Battery Scientific Model ──');
const liModel = new LithiumIonModel();

assert(liModel.nominalCapacityAh === 20.0, 'Nominal capacity initialized to 20 Ah');
assert(liModel.internalResistanceOhm === 0.008, 'Internal resistance initialized to 8 mΩ');

// Test LFP OCV curve
const ocvMid = liModel.getOpenCircuitVoltage(0.5);
assert(ocvMid >= 3.20 && ocvMid <= 3.30, `Mid-SOC LFP voltage is on flat plateau (~3.25V): got ${ocvMid.toFixed(3)}V`);

const ocvLow = liModel.getOpenCircuitVoltage(0.05);
assert(ocvLow < 3.0, `Low-SOC voltage drops steeply: got ${ocvLow.toFixed(3)}V`);

const ocvHigh = liModel.getOpenCircuitVoltage(0.95);
assert(ocvHigh > 3.40, `High-SOC voltage rises steeply towards end of charge: got ${ocvHigh.toFixed(3)}V`);

// Test Galvanic Discharge vs Electrolytic Charge Terminal Voltage
const vDischarge = liModel.getTerminalVoltage(false, true);
const vCharge = liModel.getTerminalVoltage(true, true);
assert(vDischarge < ocvMid, `Terminal voltage drops under discharge current: ${vDischarge.toFixed(3)}V < ${ocvMid.toFixed(3)}V`);
assert(vCharge > ocvMid, `Terminal voltage rises under charging current: ${vCharge.toFixed(3)}V > ${ocvMid.toFixed(3)}V`);

// Test Dynamic SOC Integration
const initialSoc = liModel.stateOfCharge;
liModel.update(1.0, false, true); // Discharge for 1s
assert(liModel.stateOfCharge < initialSoc, `Discharge decreases SOC: ${initialSoc.toFixed(4)} -> ${liModel.stateOfCharge.toFixed(4)}`);

liModel.update(2.0, true, true); // Charge for 2s
assert(liModel.stateOfCharge > initialSoc, `Charge increases SOC: ${liModel.stateOfCharge.toFixed(4)}`);

// ── TEST SUITE 2: Lead-Acid Automotive Battery (6-Cell 12V) ─────────────
console.log('\n── TEST 2: Lead-Acid Battery Scientific Model ──');
const pbModel = new LeadAcidModel();

assert(pbModel.cellCount === 6, 'Contains 6 series-connected cells');
assert(pbModel.nominalCapacityAh === 60.0, 'Nominal automotive capacity is 60 Ah');

// Test Specific Gravity correlation with SOC
const sgFull = pbModel.getElectrolyteSpecificGravity(1.0);
const sgEmpty = pbModel.getElectrolyteSpecificGravity(0.0);
assert(Math.abs(sgFull - 1.280) < 0.001, `Full charge electrolyte specific gravity is 1.280 g/cm³: got ${sgFull.toFixed(3)}`);
assert(Math.abs(sgEmpty - 1.120) < 0.001, `Discharged electrolyte specific gravity is 1.120 g/cm³: got ${sgEmpty.toFixed(3)}`);

// Test Cell Voltage and Pack Voltage
const cellVFull = pbModel.getCellOpenCircuitVoltage(1.0);
const packVFull = pbModel.getPackOpenCircuitVoltage(1.0);
assert(Math.abs(cellVFull - 2.120) < 0.01, `Full charge per-cell OCV is ~2.12V: got ${cellVFull.toFixed(3)}V`);
assert(Math.abs(packVFull - 12.72) < 0.05, `Full charge 6-cell bank OCV is ~12.72V: got ${packVFull.toFixed(2)}V`);

// Test Double-Sulfate Active Material Conversion
const compFull = pbModel.getActiveMaterialComposition();
assert(compFull.pbso4Pct < 20, `Charged battery has low PbSO4: ${compFull.pbso4Pct}%`);
pbModel.stateOfCharge = 0.1;
const compDischarged = pbModel.getActiveMaterialComposition();
assert(compDischarged.pbso4Pct > 70, `Discharged battery converts active species to PbSO4: ${compDischarged.pbso4Pct}%`);

// ── TEST SUITE 3: PEM Hydrogen Fuel Cell ────────────────────────────────
console.log('\n── TEST 3: PEM Hydrogen Fuel Cell Scientific Model ──');
const pemModel = new PEMFuelCellModel();

assert(pemModel.E_rev === 1.229, 'Reversible thermodynamic cell potential is 1.229 V');
assert(pemModel.vOpenCircuit === 0.985, 'Open-circuit potential with crossover is 0.985 V');

// Test Operating Point under Load
pemModel.loadResistanceOhm = 1.5;
const op1 = pemModel.getOperatingPoint();
assert(op1.voltageV > 0.5 && op1.voltageV < 0.95, `Fuel cell operates on polarization curve: ${op1.voltageV.toFixed(3)} V`);
assert(op1.currentA > 0.1 && op1.currentA < 10.0, `Operating current drawn is plausible: ${op1.currentA.toFixed(2)} A`);
assert(op1.powerW > 0.1, `Electrical power generated: ${op1.powerW.toFixed(2)} W`);

// Higher Load Resistance -> Less Current, Higher Voltage
pemModel.loadResistanceOhm = 5.0;
const op2 = pemModel.getOperatingPoint();
assert(op2.currentA < op1.currentA, `Higher resistance decreases current: ${op2.currentA.toFixed(2)} A < ${op1.currentA.toFixed(2)} A`);
assert(op2.voltageV > op1.voltageV, `Lower current increases cell voltage (lower Ohmic/activation drop): ${op2.voltageV.toFixed(3)} V > ${op1.voltageV.toFixed(3)} V`);

// Test Water Production Rate (Faraday's Law)
const waterRate = pemModel.getWaterProductionRateMlHr(op1.currentA);
assert(waterRate > 0, `Water production rate calculated from Faraday's law: ${waterRate.toFixed(2)} mL/hr`);

const h2Rate = pemModel.getHydrogenConsumptionMlMin(op1.currentA);
assert(h2Rate > 0, `Hydrogen fuel consumption rate: ${h2Rate.toFixed(1)} mL/min`);

// ── TEST SUITE 4: Mounting API Functions ────────────────────────────────
console.log('\n── TEST 4: Mounting API Functions & Interface ──');
assert(typeof mountLithiumIonSimulation === 'function', 'mountLithiumIonSimulation is exported as a function');
assert(typeof mountLeadAcidSimulation === 'function', 'mountLeadAcidSimulation is exported as a function');
assert(typeof mountPEMFuelCellSimulation === 'function', 'mountPEMFuelCellSimulation is exported as a function');

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('ALL TESTS PASSED SUCCESSFULLY! Virtual Laboratory is verified.');
console.log('═══════════════════════════════════════════════════════════════════');
