import React from 'react';
import {
  Power,
  RotateCcw,
  Zap,
  Gauge,
} from 'lucide-react';
import type {
  OhmsLawBenchCircuitState,
  CircuitSimulationReadings,
  TerminalRef,
} from '../../../../../school/physics/circuit-solver';

export interface PhysicsLab2DBenchProps {
  circuitState: OhmsLawBenchCircuitState;
  readings: CircuitSimulationReadings;
  onTogglePower: () => void;
  onTogglePlugKey: () => void;
  onVoltageChange: (voltage: number) => void;
  onRheostatChange: (resistance: number) => void;
  onConnectTerminals: (source: TerminalRef, target: TerminalRef, color: 'red' | 'black') => void;
  onRemoveWire: (wireId: string) => void;
  onResetBench: () => void;
  isDarkMode?: boolean;
}

export const PhysicsLab2DBench: React.FC<PhysicsLab2DBenchProps> = ({
  circuitState,
  readings,
  onTogglePower,
  onTogglePlugKey,
  onVoltageChange,
  onRheostatChange,
  onConnectTerminals,
  onRemoveWire,
  onResetBench,
  isDarkMode: _isDarkMode = true,
}) => {
  const [selectedTerm, setSelectedTerm] = React.useState<TerminalRef | null>(null);

  const handleTerminalClick = (apparatusId: string, terminalId: string, defaultColor: 'red' | 'black') => {
    if (!selectedTerm) {
      setSelectedTerm({ apparatusId, terminalId });
    } else {
      if (selectedTerm.apparatusId !== apparatusId || selectedTerm.terminalId !== terminalId) {
        onConnectTerminals(selectedTerm, { apparatusId, terminalId }, defaultColor);
      }
      setSelectedTerm(null);
    }
  };

  const isConnected = (appId: string, termId: string) => {
    return circuitState.connections.some(
      (c) =>
        (c.source.apparatusId === appId && c.source.terminalId === termId) ||
        (c.target.apparatusId === appId && c.target.terminalId === termId)
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col p-4 overflow-y-auto bg-slate-50 dark:bg-[#070e17] text-slate-900 dark:text-slate-100 font-sans">
      {/* 2D Accessible Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2 py-1 text-xs font-bold">
            2D Accessible High-Contrast Bench
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click matching terminals to establish electrical connections.
          </span>
        </div>

        <button
          type="button"
          onClick={onResetBench}
          className="flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-slate-100 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Wiring</span>
        </button>
      </div>

      {/* Screen Reader ARIA Live Status */}
      <div className="sr-only" aria-live="polite">
        Current circuit state: {readings.circuitClosed ? 'Closed and Energized' : 'Open or Incomplete'}.
        Ammeter reading is {readings.ammeterObservedA} Amperes.
        Voltmeter reading is {readings.voltmeterObservedV} Volts.
      </div>

      {/* Interactive 2D Circuit Schematic Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 flex-1">
        {/* 1. DC Battery Eliminator */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1524] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Battery Eliminator</h3>
              <span className={`px-2 py-0.5 rounded text-[0.6875rem] font-bold ${circuitState.isBatteryOn ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                {circuitState.isBatteryOn ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">DC Power Source (2V - 8V)</p>

            <div className="flex gap-1.5 mb-4">
              {[2, 4, 6, 8].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onVoltageChange(v)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                    circuitState.sourceVoltage === v
                      ? 'border-cyan-500 bg-cyan-500 text-white'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {v}V
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onTogglePower}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer ${
                circuitState.isBatteryOn ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-600 hover:bg-slate-500'
              }`}
            >
              <Power className="h-3.5 w-3.5" />
              <span>Toggle Power</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTerminalClick('battery', 'pos', 'red')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  selectedTerm?.apparatusId === 'battery' && selectedTerm.terminalId === 'pos'
                    ? 'ring-2 ring-amber-400 bg-rose-600 text-white'
                    : isConnected('battery', 'pos')
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-rose-600 border-rose-300 dark:border-rose-900'
                }`}
              >
                (+) Red
              </button>
              <button
                type="button"
                onClick={() => handleTerminalClick('battery', 'neg', 'black')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  selectedTerm?.apparatusId === 'battery' && selectedTerm.terminalId === 'neg'
                    ? 'ring-2 ring-amber-400 bg-slate-900 text-white'
                    : isConnected('battery', 'neg')
                    ? 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                (-) Black
              </button>
            </div>
          </div>
        </div>

        {/* 2. One-Way Plug Key */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1524] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">One-Way Plug Key</h3>
              <span className={`px-2 py-0.5 rounded text-[0.6875rem] font-bold ${circuitState.isPlugKeyInserted ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                {circuitState.isPlugKeyInserted ? 'PLUG INSERTED' : 'CIRCUIT OPEN'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Series Safety Switch</p>

            <button
              type="button"
              onClick={onTogglePlugKey}
              className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                circuitState.isPlugKeyInserted
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {circuitState.isPlugKeyInserted ? '✓ Brass Plug In (Closed Loop)' : '✕ Insert Brass Plug'}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Terminals:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTerminalClick('key', 't1', 'black')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  isConnected('key', 't1') ? 'bg-teal-500/20 text-teal-600 border-teal-500/40' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                }`}
              >
                Key T1
              </button>
              <button
                type="button"
                onClick={() => handleTerminalClick('key', 't2', 'black')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  isConnected('key', 't2') ? 'bg-teal-500/20 text-teal-600 border-teal-500/40' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                }`}
              >
                Key T2
              </button>
            </div>
          </div>
        </div>

        {/* 3. Sliding Rheostat */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1524] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Wire-Wound Rheostat</h3>
              <span className="font-mono text-xs font-bold text-amber-500">
                {circuitState.rheostatResistance.toFixed(1)} Ω
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Series Variable Resistor (0 - 50 Ω)</p>

            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={circuitState.rheostatResistance}
              onChange={(e) => onRheostatChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-2"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Terminals:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleTerminalClick('rheostat', 't_lower1', 'black')}
                className="px-2 py-1 rounded text-[0.6875rem] font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              >
                Lower 1
              </button>
              <button
                type="button"
                onClick={() => handleTerminalClick('rheostat', 't_slider', 'black')}
                className="px-2 py-1 rounded text-[0.6875rem] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                Slider (Wiper)
              </button>
            </div>
          </div>
        </div>

        {/* 4. DC Ammeter Meter Display */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1524] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">DC Ammeter (0 - 1.5 A)</h3>
              <Gauge className="h-4 w-4 text-cyan-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Connected in Series (Least Count: 0.05 A)</p>

            {/* Simulated Dial Face */}
            <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 p-3 text-center my-2">
              <div className="text-2xl font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {readings.ammeterObservedA.toFixed(2)} A
              </div>
              <div className="text-[0.6875rem] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                Scale: {readings.ammeterScaleDivisions} / 30 divisions
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Terminals:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTerminalClick('ammeter', 'pos', 'red')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-600 cursor-pointer"
              >
                (+) Red
              </button>
              <button
                type="button"
                onClick={() => handleTerminalClick('ammeter', 'neg', 'black')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                (-) Black
              </button>
            </div>
          </div>
        </div>

        {/* 5. DC Voltmeter Meter Display */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1524] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">DC Voltmeter (0 - 3.0 V)</h3>
              <Gauge className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Connected in Parallel (Least Count: 0.1 V)</p>

            <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 p-3 text-center my-2">
              <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {readings.voltmeterObservedV.toFixed(2)} V
              </div>
              <div className="text-[0.6875rem] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                Scale: {readings.voltmeterScaleDivisions} / 30 divisions
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Terminals:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTerminalClick('voltmeter', 'pos', 'red')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-600 cursor-pointer"
              >
                (+) Red
              </button>
              <button
                type="button"
                onClick={() => handleTerminalClick('voltmeter', 'neg', 'black')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                (-) Black
              </button>
            </div>
          </div>
        </div>

        {/* 6. Unknown Resistor (5.0 Ohms Specimen) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1524] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unknown Resistor Wire</h3>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Mounted Nichrome Wire Specimen</p>

            <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/80 p-3 text-center my-2">
              <span className="text-xs font-semibold text-slate-500">Calculated R = V / I</span>
              <div className="text-xl font-mono font-bold text-amber-500">
                {readings.apparentResistanceOhms > 0 ? `${readings.apparentResistanceOhms.toFixed(2)} Ω` : '—'}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Terminals:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTerminalClick('resistor', 't1', 'black')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Terminal 1
              </button>
              <button
                type="button"
                onClick={() => handleTerminalClick('resistor', 't2', 'black')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Terminal 2
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Wires List & Deletion */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1524] p-3">
        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
          Connected Circuit Leads ({circuitState.connections.length})
        </h4>
        {circuitState.connections.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No leads connected. Click two terminals above to add a wire.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {circuitState.connections.map((wire) => (
              <div
                key={wire.id}
                className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 text-xs"
              >
                <span className={`w-2 h-2 rounded-full ${wire.color === 'red' ? 'bg-rose-500' : 'bg-slate-900 dark:bg-slate-200'}`} />
                <span className="font-mono text-[0.6875rem] text-slate-700 dark:text-slate-300">
                  {wire.source.apparatusId}.{wire.source.terminalId} ↔ {wire.target.apparatusId}.{wire.target.terminalId}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveWire(wire.id)}
                  className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                  title="Remove lead"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
