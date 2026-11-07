/**
 * Scientific Electrochemical Model for PEM Hydrogen Fuel Cell
 * Simulates standard polarization curve (Activation, Ohmic, and Mass-Transport losses),
 * Faraday water generation stoichiometry, and load regulation.
 */

export class PEMFuelCellModel {
  // Thermodynamic Constants
  public readonly E_rev: number = 1.229; // Reversible cell potential at 25 °C (V)
  public readonly F: number = 96485;     // Faraday constant (C/mol)

  // Operating Parameters
  public h2FlowMlMin: number = 120.0;    // Hydrogen fuel flow (mL/min)
  public airFlowMlMin: number = 300.0;   // Cathode air flow (mL/min)
  public loadResistanceOhm: number = 1.5; // External load resistance (Ohms)
  public cellAreaCm2: number = 25.0;     // Active cell area (cm²)
  public temperatureC: number = 65.0;    // Standard operating PEM temperature (°C)

  // Polarization Curve Empirical Coefficients
  public readonly vOpenCircuit: number = 0.985; // OCV taking into account crossover (V)
  public readonly tafelSlope: number = 0.055;   // Activation slope A (V)
  public readonly rMemOhm: number = 0.08;       // Membrane + contact resistance (Ohms)
  public readonly iLimiting: number = 25.0;      // Mass-transport limiting current (A)

  /**
   * Calculates operating current (A) and cell terminal voltage (V)
   * by finding the operating point intersection: V_cell(I) = I * R_load
   */
  public getOperatingPoint(): { currentA: number; voltageV: number; powerW: number } {
    // Binary search / iterative convergence for current I such that V_cell(I) = I * R_load
    let iLow = 0.001;
    let iHigh = Math.min(this.iLimiting * 0.95, (this.h2FlowMlMin / 60) * 0.15 * this.F / 1000);
    if (iHigh < 0.1) iHigh = 0.1;

    let bestI = 0.5;
    let bestV = 0.8;

    for (let iter = 0; iter < 24; iter++) {
      const iMid = (iLow + iHigh) / 2;
      const vCell = this.calculateCellVoltage(iMid);
      const vLoad = iMid * this.loadResistanceOhm;

      if (vCell > vLoad) {
        // Can supply more current
        iLow = iMid;
        bestI = iMid;
        bestV = vCell;
      } else {
        // Exceeds cell output
        iHigh = iMid;
      }
    }

    const currentA = Math.max(0, bestI);
    const voltageV = Math.max(0, Math.min(this.vOpenCircuit, bestV));
    const powerW = currentA * voltageV;

    return { currentA, voltageV, powerW };
  }

  // Polarization equation: V_cell = OCV - eta_act - eta_ohm - eta_conc
  public calculateCellVoltage(currentA: number): number {
    if (currentA <= 0.0001) return this.vOpenCircuit;

    // 1. Activation overpotential: Tafel equation eta_act = A * ln(I / I_0)
    const i0 = 0.002; // Exchange current
    const etaAct = this.tafelSlope * Math.log(Math.max(1.0, currentA / i0));

    // 2. Ohmic loss: eta_ohm = I * R_int
    const etaOhm = currentA * this.rMemOhm;

    // 3. Concentration loss: eta_conc = - B * ln(1 - I / I_lim)
    const B = 0.06;
    const ratio = Math.min(0.99, currentA / this.iLimiting);
    const etaConc = -B * Math.log(1 - ratio);

    const v = this.vOpenCircuit - etaAct - etaOhm - etaConc;
    return Math.max(0.1, v);
  }

  // Water production rate: 1 mol H2O per 2 moles of electrons (Faraday's Law)
  // m_dot = (I / 2F) * M_H2O * 3600 (g/hr or mL/hr, since density ≈ 1 g/mL)
  public getWaterProductionRateMlHr(currentA: number): number {
    const molH2OPerSec = currentA / (2 * this.F);
    const gPerSec = molH2OPerSec * 18.015; // 18.015 g/mol H2O
    return gPerSec * 3600; // mL/hr
  }

  // Hydrogen consumption rate (mL/min at STP)
  // V_H2 = (I / 2F) * 24.45 L/mol * 60000 mL/L
  public getHydrogenConsumptionMlMin(currentA: number): number {
    const molH2PerSec = currentA / (2 * this.F);
    return molH2PerSec * 24450 * 60; // mL/min
  }
}
