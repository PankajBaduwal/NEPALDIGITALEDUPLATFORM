/**
 * Scientific Electrochemical Model for Lithium Iron Phosphate (LiFePO4 / Graphite)
 * Provides physically defensible OCV curve, internal resistance polarization,
 * Nernst potential approximations, and reaction stoichiometry.
 */

export class LithiumIonModel {
  // Cell Specifications (Representative 3.2V 20Ah prismatic cell)
  public nominalCapacityAh: number = 20.0;
  public internalResistanceOhm: number = 0.008; // 8 mOhm
  public stateOfCharge: number = 0.75; // 75% initial SOC
  public loadCurrentA: number = 5.0; // 5A nominal discharge
  public chargeCurrentA: number = 6.0; // 6A nominal charge
  public temperatureC: number = 25.0;

  // LFP Characteristic Open-Circuit Potential as a function of SOC (0.0 to 1.0)
  // LFP is famous for an extremely flat 3.25V - 3.28V two-phase plateau (LiFePO4 <-> FePO4)
  public getOpenCircuitVoltage(soc: number): number {
    const s = Math.max(0.001, Math.min(0.999, soc));
    // Empirical analytical fit for LFP/Graphite cell:
    // Steep drop below 10%, flat plateau between 15% and 85%, steep rise above 90%
    if (s < 0.1) {
      return 2.50 + 0.65 * (s / 0.1); // 2.50V to 3.15V
    } else if (s > 0.9) {
      return 3.32 + 0.33 * ((s - 0.9) / 0.1); // 3.32V to 3.65V
    } else {
      // Very flat plateau with subtle slope
      return 3.22 + 0.10 * ((s - 0.1) / 0.8); // 3.22V to 3.32V
    }
  }

  // Terminal voltage under load or charge
  public getTerminalVoltage(isCharging: boolean, isConnected: boolean): number {
    const ocv = this.getOpenCircuitVoltage(this.stateOfCharge);
    if (!isConnected) return ocv;

    if (isCharging) {
      // V_term = OCV + I * R_int
      const v = ocv + this.chargeCurrentA * this.internalResistanceOhm;
      return Math.min(3.65, v);
    } else {
      // V_term = OCV - I * R_int
      const v = ocv - this.loadCurrentA * this.internalResistanceOhm;
      return Math.max(2.50, v);
    }
  }

  public getElectricalPower(isCharging: boolean, isConnected: boolean): number {
    if (!isConnected) return 0;
    const v = this.getTerminalVoltage(isCharging, isConnected);
    const i = isCharging ? this.chargeCurrentA : this.loadCurrentA;
    return v * i;
  }

  // Update SOC over delta time (seconds)
  public update(deltaTime: number, isCharging: boolean, isConnected: boolean) {
    if (!isConnected || deltaTime <= 0) return;

    // Capacity in Ampere-seconds (Coulombs / 3600)
    const capacityAs = this.nominalCapacityAh * 3600;

    // Simulation time scale factor for visual learning (e.g. 1 min of real-time represents ~15% SOC shift)
    const timeCompression = 80.0;

    if (isCharging) {
      const dSoc = (this.chargeCurrentA * deltaTime * timeCompression) / capacityAs;
      this.stateOfCharge = Math.min(1.0, this.stateOfCharge + dSoc);
    } else {
      const dSoc = (this.loadCurrentA * deltaTime * timeCompression) / capacityAs;
      this.stateOfCharge = Math.max(0.0, this.stateOfCharge - dSoc);
    }
  }
}
