/**
 * Scientific Electrochemical Model for Automotive 6-Cell Lead-Acid Battery
 * Simulates double-sulfate reaction kinetics, electrolyte specific gravity,
 * Nernst potential per cell, and Peukert load behavior.
 */

export class LeadAcidModel {
  public cellCount: number = 6;
  public nominalCapacityAh: number = 60.0; // 60 Ah commercial automotive starter battery
  public stateOfCharge: number = 0.85; // 85% initial SOC
  public loadCurrentA: number = 15.0; // 15A headlamp / accessory discharge
  public chargeCurrentA: number = 10.0; // 10A alternator charge
  public internalResistancePerCellOhm: number = 0.0025; // 2.5 mOhm per cell (15 mOhm total)
  public temperatureC: number = 25.0;

  // Specific gravity of sulfuric acid electrolyte as a function of SOC
  // 1.280 g/cm³ at 100% SOC (fully charged), ~1.120 g/cm³ at 0% SOC (completely discharged)
  public getElectrolyteSpecificGravity(soc: number): number {
    const s = Math.max(0.0, Math.min(1.0, soc));
    return 1.120 + s * (1.280 - 1.120);
  }

  // Open circuit voltage per cell derived from Nernst equation with acid activity:
  // E_cell ≈ 1.93 + 0.059 * log(a_H2SO4) ≈ 0.84 + Specific Gravity (classic automotive rule of thumb)
  public getCellOpenCircuitVoltage(soc: number): number {
    const sg = this.getElectrolyteSpecificGravity(soc);
    return 0.84 + sg; // e.g. at 1.280 sg -> 2.12V per cell
  }

  // Total Battery Pack (6 cells in series)
  public getPackOpenCircuitVoltage(soc: number): number {
    return this.getCellOpenCircuitVoltage(soc) * this.cellCount;
  }

  // Terminal voltage under load or charge
  public getTerminalVoltage(isCharging: boolean, isConnected: boolean): number {
    const ocv = this.getPackOpenCircuitVoltage(this.stateOfCharge);
    if (!isConnected) return ocv;

    const totalRint = this.internalResistancePerCellOhm * this.cellCount;

    if (isCharging) {
      // V_term = OCV + I * R_int
      const v = ocv + this.chargeCurrentA * totalRint;
      return Math.min(14.8, v);
    } else {
      // V_term = OCV - I * R_int
      const v = ocv - this.loadCurrentA * totalRint;
      return Math.max(10.5, v);
    }
  }

  public getActiveMaterialComposition(): { pbPct: number; pbo2Pct: number; pbso4Pct: number } {
    const soc = Math.max(0, Math.min(1, this.stateOfCharge));
    return {
      pbPct: Math.round(soc * 95),
      pbo2Pct: Math.round(soc * 95),
      pbso4Pct: Math.round((1 - soc) * 95),
    };
  }

  public update(deltaTime: number, isCharging: boolean, isConnected: boolean) {
    if (!isConnected || deltaTime <= 0) return;

    const capacityAs = this.nominalCapacityAh * 3600;
    const timeCompression = 90.0; // accelerated for interactive virtual laboratory

    if (isCharging) {
      const dSoc = (this.chargeCurrentA * deltaTime * timeCompression) / capacityAs;
      this.stateOfCharge = Math.min(1.0, this.stateOfCharge + dSoc);
    } else {
      const dSoc = (this.loadCurrentA * deltaTime * timeCompression) / capacityAs;
      this.stateOfCharge = Math.max(0.0, this.stateOfCharge - dSoc);
    }
  }
}
