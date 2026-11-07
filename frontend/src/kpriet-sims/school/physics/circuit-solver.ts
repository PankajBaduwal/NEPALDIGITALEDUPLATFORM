/**
 * Physics Lab: Circuit Mesh Solver & Metrology Engine for Ohm's Law and DC Circuits.
 * Aligned with NCERT Science Class X (Unit 12) & Class XII Physics Practical Code 042.
 */

export interface TerminalRef {
  apparatusId: string;
  terminalId: string;
}

export interface WireConnection {
  id: string;
  source: TerminalRef;
  target: TerminalRef;
  color: 'red' | 'black';
  resistanceOhms?: number;
}

export interface InstrumentSpecs {
  type: 'ammeter' | 'voltmeter';
  rangeMin: number;
  rangeMax: number;
  leastCount: number;
  totalDivisions: number;
  unit: string;
  zeroError: number; // in display units (e.g. +0.05 A)
}

export interface OhmsLawBenchCircuitState {
  sourceVoltage: number; // Battery eliminator (2V, 4V, 6V, 8V)
  isBatteryOn: boolean;
  isPlugKeyInserted: boolean;
  rheostatResistance: number; // 0 to 50 Ohms
  resistorTrueResistance: number; // Default 5.0 Ohms
  batteryInternalResistance: number; // Default 0.2 Ohms
  ammeterCoilResistance: number; // Default 0.05 Ohms
  voltmeterCoilResistance: number; // Default 10000 Ohms
  ammeterZeroError: number; // in A (-0.1 to +0.1)
  voltmeterZeroError: number; // in V (-0.2 to +0.2)
  connections: WireConnection[];
}

export interface CircuitValidationResult {
  isCompleteLoop: boolean;
  isAmmeterInSeries: boolean;
  isVoltmeterInParallel: boolean;
  isPolarityCorrect: boolean;
  isSwitchClosed: boolean;
  errors: string[];
  warnings: string[];
  details: {
    loopConnected: boolean;
    voltmeterConnected: boolean;
    hasReversePolarity: boolean;
  };
}

export interface CircuitSimulationReadings {
  circuitValid: boolean;
  circuitClosed: boolean;
  trueCurrentA: number;
  trueVoltageV: number;
  // Raw instrument pointer readings including zero error & quantized by least count
  ammeterObservedA: number;
  voltmeterObservedV: number;
  ammeterScaleDivisions: number;
  voltmeterScaleDivisions: number;
  // Corrected values (Observed - Zero Error)
  ammeterCorrectedA: number;
  voltmeterCorrectedV: number;
  apparentResistanceOhms: number;
}

export class CircuitMeshSolver {
  // Instrument Specifications for NCERT Class 10 Ohm's Law
  public static readonly AMMETER_SPECS: InstrumentSpecs = {
    type: 'ammeter',
    rangeMin: 0,
    rangeMax: 1.5,
    leastCount: 0.05,
    totalDivisions: 30,
    unit: 'A',
    zeroError: 0.0,
  };

  public static readonly VOLTMETER_SPECS: InstrumentSpecs = {
    type: 'voltmeter',
    rangeMin: 0,
    rangeMax: 3.0,
    leastCount: 0.1,
    totalDivisions: 30,
    unit: 'V',
    zeroError: 0.0,
  };

  /**
   * Helper to check if two terminal references are connected via wires
   */
  public static areConnected(
    connList: WireConnection[],
    termA: TerminalRef,
    termB: TerminalRef
  ): boolean {
    return connList.some(
      (c) =>
        (c.source.apparatusId === termA.apparatusId &&
          c.source.terminalId === termA.terminalId &&
          c.target.apparatusId === termB.apparatusId &&
          c.target.terminalId === termB.terminalId) ||
        (c.target.apparatusId === termA.apparatusId &&
          c.target.terminalId === termA.terminalId &&
          c.source.apparatusId === termB.apparatusId &&
          c.source.terminalId === termB.terminalId)
    );
  }

  /**
   * Finds all terminals connected to a given terminal (direct or through multi-wire nodes)
   */
  /**
   * Finds equipotential terminals directly connected by wires (same node).
   */
  public static getNodeEquipotential(
    connList: WireConnection[],
    start: TerminalRef
  ): TerminalRef[] {
    const visited = new Set<string>();
    const result: TerminalRef[] = [];
    const queue: TerminalRef[] = [start];

    const key = (t: TerminalRef) => `${t.apparatusId}:${t.terminalId}`;
    visited.add(key(start));

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const c of connList) {
        let neighbor: TerminalRef | null = null;
        if (
          c.source.apparatusId === current.apparatusId &&
          c.source.terminalId === current.terminalId
        ) {
          neighbor = c.target;
        } else if (
          c.target.apparatusId === current.apparatusId &&
          c.target.terminalId === current.terminalId
        ) {
          neighbor = c.source;
        }

        if (neighbor && !visited.has(key(neighbor))) {
          visited.add(key(neighbor));
          queue.push(neighbor);
          result.push(neighbor);
        }
      }
    }

    return result;
  }

  /**
   * Internal conduction neighbors inside each apparatus
   */
  private static getInternalNeighbors(term: TerminalRef, allowSwitchConduction: boolean): TerminalRef[] {
    const neighbors: TerminalRef[] = [];
    if (term.apparatusId === 'key' && allowSwitchConduction) {
      if (term.terminalId === 't1') neighbors.push({ apparatusId: 'key', terminalId: 't2' });
      if (term.terminalId === 't2') neighbors.push({ apparatusId: 'key', terminalId: 't1' });
    } else if (term.apparatusId === 'rheostat') {
      if (term.terminalId === 't_slider') {
        neighbors.push({ apparatusId: 'rheostat', terminalId: 't_lower1' });
        neighbors.push({ apparatusId: 'rheostat', terminalId: 't_lower2' });
      } else {
        neighbors.push({ apparatusId: 'rheostat', terminalId: 't_slider' });
      }
    } else if (term.apparatusId === 'ammeter') {
      if (term.terminalId === 'pos') neighbors.push({ apparatusId: 'ammeter', terminalId: 'neg' });
      if (term.terminalId === 'neg') neighbors.push({ apparatusId: 'ammeter', terminalId: 'pos' });
    } else if (term.apparatusId === 'resistor') {
      if (term.terminalId === 't1') neighbors.push({ apparatusId: 'resistor', terminalId: 't2' });
      if (term.terminalId === 't2') neighbors.push({ apparatusId: 'resistor', terminalId: 't1' });
    }
    return neighbors;
  }

  /**
   * Finds all terminals reachable through wires and internal apparatus conduction paths.
   */
  public static getCircuitLoopPath(
    connList: WireConnection[],
    start: TerminalRef,
    allowSwitchConduction: boolean = true
  ): TerminalRef[] {
    const visited = new Set<string>();
    const result: TerminalRef[] = [];
    const queue: TerminalRef[] = [start];

    const key = (t: TerminalRef) => `${t.apparatusId}:${t.terminalId}`;
    visited.add(key(start));

    while (queue.length > 0) {
      const current = queue.shift()!;
      // 1. External wire connections
      for (const c of connList) {
        let neighbor: TerminalRef | null = null;
        if (
          c.source.apparatusId === current.apparatusId &&
          c.source.terminalId === current.terminalId
        ) {
          neighbor = c.target;
        } else if (
          c.target.apparatusId === current.apparatusId &&
          c.target.terminalId === current.terminalId
        ) {
          neighbor = c.source;
        }

        if (neighbor && !visited.has(key(neighbor))) {
          visited.add(key(neighbor));
          queue.push(neighbor);
          result.push(neighbor);
        }
      }

      // 2. Internal apparatus conduction bridges
      const internals = this.getInternalNeighbors(current, allowSwitchConduction);
      for (const inNeighbor of internals) {
        if (!visited.has(key(inNeighbor))) {
          visited.add(key(inNeighbor));
          queue.push(inNeighbor);
          result.push(inNeighbor);
        }
      }
    }

    return result;
  }

  public static getConnectedNodes(
    connList: WireConnection[],
    start: TerminalRef
  ): TerminalRef[] {
    return this.getNodeEquipotential(connList, start);
  }

  /**
   * Validates topology of the Ohm's Law circuit.
   * Standard NCERT Circuit:
   * Battery(+) -> Key(T1) -> Key(T2) -> Rheostat(Lower/Slider) -> Ammeter(+) -> Ammeter(-) -> Resistor(T1) -> Resistor(T2) -> Battery(-)
   * Voltmeter: Voltmeter(+) -> Resistor(T1), Voltmeter(-) -> Resistor(T2)
   */
  public static validateOhmsLawCircuit(state: OhmsLawBenchCircuitState): CircuitValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conns = state.connections;

    if (conns.length === 0) {
      return {
        isCompleteLoop: false,
        isAmmeterInSeries: false,
        isVoltmeterInParallel: false,
        isPolarityCorrect: false,
        isSwitchClosed: state.isPlugKeyInserted,
        errors: ['No apparatus terminals are connected. Use connecting leads to wire the circuit.'],
        warnings: [],
        details: { loopConnected: false, voltmeterConnected: false, hasReversePolarity: false },
      };
    }

    // Check battery positive connection path through loop
    const batPosPath = this.getCircuitLoopPath(conns, { apparatusId: 'battery', terminalId: 'pos' });
    const batNegPath = this.getCircuitLoopPath(conns, { apparatusId: 'battery', terminalId: 'neg' });

    // Key check
    const isKeyInCircuit =
      batPosPath.some((t) => t.apparatusId === 'key') ||
      batNegPath.some((t) => t.apparatusId === 'key');

    if (!isKeyInCircuit) {
      errors.push('Plug key is missing from the circuit series loop.');
    }

    // Ammeter check
    const isAmmeterInCircuit =
      batPosPath.some((t) => t.apparatusId === 'ammeter') ||
      batNegPath.some((t) => t.apparatusId === 'ammeter');

    if (!isAmmeterInCircuit) {
      errors.push('Ammeter is not connected to measure current.');
    }

    // Resistor check
    const isResistorInCircuit =
      batPosPath.some((t) => t.apparatusId === 'resistor') ||
      batNegPath.some((t) => t.apparatusId === 'resistor');

    if (!isResistorInCircuit) {
      errors.push('Unknown resistor is not connected in the circuit.');
    }

    // Rheostat check
    const isRheostatInCircuit =
      batPosPath.some((t) => t.apparatusId === 'rheostat') ||
      batNegPath.some((t) => t.apparatusId === 'rheostat');

    if (!isRheostatInCircuit) {
      warnings.push('Rheostat is recommended in series to vary potential difference across trials.');
    }

    // Voltmeter parallel check (must be connected directly via wires to resistor terminals)
    const vmPosNodes = this.getNodeEquipotential(conns, { apparatusId: 'voltmeter', terminalId: 'pos' });
    const vmNegNodes = this.getNodeEquipotential(conns, { apparatusId: 'voltmeter', terminalId: 'neg' });

    const vmParallelToResistor =
      (vmPosNodes.some((t) => t.apparatusId === 'resistor' && t.terminalId === 't1') &&
        vmNegNodes.some((t) => t.apparatusId === 'resistor' && t.terminalId === 't2')) ||
      (vmPosNodes.some((t) => t.apparatusId === 'resistor' && t.terminalId === 't2') &&
        vmNegNodes.some((t) => t.apparatusId === 'resistor' && t.terminalId === 't1'));

    if (!vmParallelToResistor) {
      if (vmPosNodes.length > 0 || vmNegNodes.length > 0) {
        errors.push('Voltmeter must be connected in parallel across the unknown resistor terminals.');
      } else {
        warnings.push('Voltmeter is not yet connected across the resistor.');
      }
    }

    // Polarity check:
    let hasReversePolarity = false;
    const connToAmNeg = conns.find(
      (c) =>
        (c.target.apparatusId === 'ammeter' && c.target.terminalId === 'neg' && (c.source.apparatusId === 'rheostat' || c.source.apparatusId === 'key' || c.source.apparatusId === 'battery')) ||
        (c.source.apparatusId === 'ammeter' && c.source.terminalId === 'neg' && (c.target.apparatusId === 'rheostat' || c.target.apparatusId === 'key' || c.target.apparatusId === 'battery'))
    );
    if (connToAmNeg) {
      hasReversePolarity = true;
      errors.push('Ammeter polarity is reversed. Connect positive (red) terminal toward battery positive.');
    }

    // Check complete closed loop:
    // Battery(+) must reach Battery(-) through apparatus loop
    const isCompleteLoop = batPosPath.some(
      (t) => t.apparatusId === 'battery' && t.terminalId === 'neg'
    );

    if (!isCompleteLoop && conns.length >= 4) {
      errors.push('Circuit loop is open or broken. Verify all connections form a single closed loop.');
    }

    const isPolarityCorrect = !hasReversePolarity;
    const isAmmeterInSeries = isAmmeterInCircuit && isCompleteLoop;
    const isVoltmeterInParallel = vmParallelToResistor;
    const isSwitchClosed = state.isPlugKeyInserted && state.isBatteryOn;

    return {
      isCompleteLoop,
      isAmmeterInSeries,
      isVoltmeterInParallel,
      isPolarityCorrect,
      isSwitchClosed,
      errors,
      warnings,
      details: {
        loopConnected: isCompleteLoop,
        voltmeterConnected: vmParallelToResistor,
        hasReversePolarity,
      },
    };
  }

  /**
   * Solves circuit physical quantities and determines instrument readings
   */
  public static solveReadings(state: OhmsLawBenchCircuitState): CircuitSimulationReadings {
    const validation = this.validateOhmsLawCircuit(state);

    // If circuit is invalid, or switch is open, or battery is off: current is zero
    if (
      !validation.isCompleteLoop ||
      !state.isBatteryOn ||
      !state.isPlugKeyInserted ||
      validation.details.hasReversePolarity
    ) {
      // Meters stay at their zero error marks when disconnected/off
      const rawAmDivs = Math.round(state.ammeterZeroError / this.AMMETER_SPECS.leastCount);
      const rawVmDivs = Math.round(state.voltmeterZeroError / this.VOLTMETER_SPECS.leastCount);

      return {
        circuitValid: validation.errors.length === 0,
        circuitClosed: state.isBatteryOn && state.isPlugKeyInserted && validation.isCompleteLoop,
        trueCurrentA: 0.0,
        trueVoltageV: 0.0,
        ammeterObservedA: Math.max(0, rawAmDivs * this.AMMETER_SPECS.leastCount),
        voltmeterObservedV: Math.max(0, rawVmDivs * this.VOLTMETER_SPECS.leastCount),
        ammeterScaleDivisions: Math.max(0, rawAmDivs),
        voltmeterScaleDivisions: Math.max(0, rawVmDivs),
        ammeterCorrectedA: 0.0,
        voltmeterCorrectedV: 0.0,
        apparentResistanceOhms: 0.0,
      };
    }

    // Compute total circuit resistance
    // R_total = R_resistor + R_rheostat + r_battery + r_ammeter + wire_resistance
    const wireResistance = state.connections.reduce((acc, c) => acc + (c.resistanceOhms ?? 0.02), 0);
    const R_total =
      state.resistorTrueResistance +
      state.rheostatResistance +
      state.batteryInternalResistance +
      state.ammeterCoilResistance +
      wireResistance;

    // True physical current and potential drop
    const trueCurrentA = state.sourceVoltage / R_total;
    const trueVoltageV = trueCurrentA * state.resistorTrueResistance;

    // Quantize readings to instrument least count and incorporate zero error
    // Observed = round((True + ZeroError) / LeastCount) * LeastCount
    const ammeterTarget = trueCurrentA + state.ammeterZeroError;
    const ammeterDivisions = Math.max(
      0,
      Math.min(
        this.AMMETER_SPECS.totalDivisions,
        Math.round(ammeterTarget / this.AMMETER_SPECS.leastCount)
      )
    );
    const ammeterObservedA = Number(
      (ammeterDivisions * this.AMMETER_SPECS.leastCount).toFixed(3)
    );

    const voltmeterTarget = trueVoltageV + state.voltmeterZeroError;
    const voltmeterDivisions = Math.max(
      0,
      Math.min(
        this.VOLTMETER_SPECS.totalDivisions,
        Math.round(voltmeterTarget / this.VOLTMETER_SPECS.leastCount)
      )
    );
    const voltmeterObservedV = Number(
      (voltmeterDivisions * this.VOLTMETER_SPECS.leastCount).toFixed(2)
    );

    // Corrected readings (Student measurement step: Corrected = Observed - ZeroError)
    const ammeterCorrectedA = Number(
      Math.max(0, ammeterObservedA - state.ammeterZeroError).toFixed(3)
    );
    const voltmeterCorrectedV = Number(
      Math.max(0, voltmeterObservedV - state.voltmeterZeroError).toFixed(2)
    );

    // Apparent specimen resistance R = V / I
    const apparentResistanceOhms =
      ammeterCorrectedA > 0.001
        ? Number((voltmeterCorrectedV / ammeterCorrectedA).toFixed(2))
        : 0.0;

    return {
      circuitValid: true,
      circuitClosed: true,
      trueCurrentA: Number(trueCurrentA.toFixed(4)),
      trueVoltageV: Number(trueVoltageV.toFixed(3)),
      ammeterObservedA,
      voltmeterObservedV,
      ammeterScaleDivisions: ammeterDivisions,
      voltmeterScaleDivisions: voltmeterDivisions,
      ammeterCorrectedA,
      voltmeterCorrectedV,
      apparentResistanceOhms,
    };
  }

  /**
   * Statistical linear regression calculation over student recorded trials.
   * V = R * I  => Slope of V vs I graph gives Resistance R.
   */
  public static calculateLinearRegression(trials: Array<{ V: number; I: number }>): {
    slopeR: number; // Experimental Resistance in Ohms
    intercept: number;
    rSquared: number;
    meanR: number;
    percentageError: number; // Against true value 5.0 Ohms
  } {
    if (trials.length < 2) {
      return { slopeR: 0, intercept: 0, rSquared: 0, meanR: 0, percentageError: 0 };
    }

    const n = trials.length;
    const sumI = trials.reduce((acc, t) => acc + t.I, 0);
    const sumV = trials.reduce((acc, t) => acc + t.V, 0);
    const meanI = sumI / n;
    const meanV = sumV / n;

    let numerator = 0;
    let denomI = 0;
    let denomV = 0;

    for (const t of trials) {
      const diffI = t.I - meanI;
      const diffV = t.V - meanV;
      numerator += diffI * diffV;
      denomI += diffI * diffI;
      denomV += diffV * diffV;
    }

    const slopeR = denomI > 0 ? Number((numerator / denomI).toFixed(3)) : 0;
    const intercept = Number((meanV - slopeR * meanI).toFixed(3));

    const rSquared =
      denomI > 0 && denomV > 0
        ? Number((Math.pow(numerator, 2) / (denomI * denomV)).toFixed(4))
        : 1.0;

    const rValues = trials
      .filter((t) => t.I > 0)
      .map((t) => t.V / t.I);
    const meanR =
      rValues.length > 0
        ? Number((rValues.reduce((a, b) => a + b, 0) / rValues.length).toFixed(3))
        : slopeR;

    const nominalR = 5.0;
    const percentageError = Number(
      (Math.abs((slopeR - nominalR) / nominalR) * 100).toFixed(2)
    );

    return {
      slopeR,
      intercept,
      rSquared,
      meanR,
      percentageError,
    };
  }
}
