import React, { useState, useMemo } from 'react';
import {
  Layers,
  Box,
  HelpCircle,
  Zap,
  Gauge,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import type {
  VirtualLabSessionData,
  VirtualLabExperimentData,
} from '../../../services/virtual-lab.service';
import { useTheme } from '../../../context/ThemeContext';
import {
  CircuitMeshSolver,
  type OhmsLawBenchCircuitState,
  type CircuitSimulationReadings,
  type WireConnection,
  type TerminalRef,
} from '../../../../../school/physics/circuit-solver';
import { PhysicsLab3DCanvas } from './PhysicsLab3DCanvas';
import { PhysicsLab2DBench } from './PhysicsLab2DBench';

export interface PhysicsApparatusBenchProps {
  session: VirtualLabSessionData;
  experiment?: VirtualLabExperimentData | null;
  onRecordTrial?: (trial: {
    trialNumber: number;
    initialReadingMl: number;
    finalReadingMl: number;
    volumeUsedMl: number;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const PhysicsApparatusBench: React.FC<PhysicsApparatusBenchProps> = ({
  session,
  experiment: _experiment,
  onRecordTrial,
  isLoading = false,
}) => {
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [recordSuccess, setRecordSuccess] = useState(false);

  // Bench Circuit State
  const [circuitState, setCircuitState] = useState<OhmsLawBenchCircuitState>({
    sourceVoltage: 4, // 4V DC
    isBatteryOn: true,
    isPlugKeyInserted: true,
    rheostatResistance: 15, // 15 Ohms initial
    resistorTrueResistance: 5.0, // 5.0 Ohms
    batteryInternalResistance: 0.2,
    ammeterCoilResistance: 0.05,
    voltmeterCoilResistance: 10000,
    ammeterZeroError: 0.0,
    voltmeterZeroError: 0.0,
    // Default NCERT standard closed loop
    connections: [
      { id: 'w1', source: { apparatusId: 'battery', terminalId: 'pos' }, target: { apparatusId: 'key', terminalId: 't1' }, color: 'red' },
      { id: 'w2', source: { apparatusId: 'key', terminalId: 't2' }, target: { apparatusId: 'rheostat', terminalId: 't_lower1' }, color: 'black' },
      { id: 'w3', source: { apparatusId: 'rheostat', terminalId: 't_slider' }, target: { apparatusId: 'ammeter', terminalId: 'pos' }, color: 'red' },
      { id: 'w4', source: { apparatusId: 'ammeter', terminalId: 'neg' }, target: { apparatusId: 'resistor', terminalId: 't1' }, color: 'black' },
      { id: 'w5', source: { apparatusId: 'resistor', terminalId: 't2' }, target: { apparatusId: 'battery', terminalId: 'neg' }, color: 'black' },
      // Voltmeter in parallel across resistor
      { id: 'w6', source: { apparatusId: 'voltmeter', terminalId: 'pos' }, target: { apparatusId: 'resistor', terminalId: 't1' }, color: 'red' },
      { id: 'w7', source: { apparatusId: 'voltmeter', terminalId: 'neg' }, target: { apparatusId: 'resistor', terminalId: 't2' }, color: 'black' },
    ],
  });

  // Calculate live readings via physical mesh solver
  const readings = useMemo<CircuitSimulationReadings>(() => {
    return CircuitMeshSolver.solveReadings(circuitState);
  }, [circuitState]);

  // Validation details
  const validation = useMemo(() => {
    return CircuitMeshSolver.validateOhmsLawCircuit(circuitState);
  }, [circuitState]);

  // Handlers
  const handleTogglePower = () => {
    setCircuitState((prev) => ({ ...prev, isBatteryOn: !prev.isBatteryOn }));
  };

  const handleTogglePlugKey = () => {
    setCircuitState((prev) => ({ ...prev, isPlugKeyInserted: !prev.isPlugKeyInserted }));
  };

  const handleVoltageChange = (voltage: number) => {
    setCircuitState((prev) => ({ ...prev, sourceVoltage: voltage }));
  };

  const handleRheostatChange = (resistance: number) => {
    setCircuitState((prev) => ({ ...prev, rheostatResistance: resistance }));
  };

  const handleConnectTerminals = (source: TerminalRef, target: TerminalRef, color: 'red' | 'black') => {
    // Avoid connecting to self
    if (source.apparatusId === target.apparatusId && source.terminalId === target.terminalId) return;

    // Check if duplicate wire exists
    const exists = circuitState.connections.some(
      (c) =>
        (c.source.apparatusId === source.apparatusId &&
          c.source.terminalId === source.terminalId &&
          c.target.apparatusId === target.apparatusId &&
          c.target.terminalId === target.terminalId) ||
        (c.target.apparatusId === source.apparatusId &&
          c.target.terminalId === source.terminalId &&
          c.source.apparatusId === target.apparatusId &&
          c.source.terminalId === target.terminalId)
    );
    if (exists) return;

    const newWire: WireConnection = {
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      source,
      target,
      color,
      resistanceOhms: 0.02,
    };

    setCircuitState((prev) => ({ ...prev, connections: [...prev.connections, newWire] }));
  };

  const handleRemoveWire = (wireId: string) => {
    setCircuitState((prev) => ({
      ...prev,
      connections: prev.connections.filter((w) => w.id !== wireId),
    }));
  };

  const handleResetBench = () => {
    setCircuitState((prev) => ({
      ...prev,
      connections: [],
      isPlugKeyInserted: false,
      isBatteryOn: false,
    }));
  };

  const handleAutoWirePreset = () => {
    setCircuitState((prev) => ({
      ...prev,
      isBatteryOn: true,
      isPlugKeyInserted: true,
      connections: [
        { id: 'w1', source: { apparatusId: 'battery', terminalId: 'pos' }, target: { apparatusId: 'key', terminalId: 't1' }, color: 'red' },
        { id: 'w2', source: { apparatusId: 'key', terminalId: 't2' }, target: { apparatusId: 'rheostat', terminalId: 't_lower1' }, color: 'black' },
        { id: 'w3', source: { apparatusId: 'rheostat', terminalId: 't_slider' }, target: { apparatusId: 'ammeter', terminalId: 'pos' }, color: 'red' },
        { id: 'w4', source: { apparatusId: 'ammeter', terminalId: 'neg' }, target: { apparatusId: 'resistor', terminalId: 't1' }, color: 'black' },
        { id: 'w5', source: { apparatusId: 'resistor', terminalId: 't2' }, target: { apparatusId: 'battery', terminalId: 'neg' }, color: 'black' },
        { id: 'w6', source: { apparatusId: 'voltmeter', terminalId: 'pos' }, target: { apparatusId: 'resistor', terminalId: 't1' }, color: 'red' },
        { id: 'w7', source: { apparatusId: 'voltmeter', terminalId: 'neg' }, target: { apparatusId: 'resistor', terminalId: 't2' }, color: 'black' },
      ],
    }));
  };

  const handleRecordCurrentReading = async () => {
    if (!onRecordTrial) return;
    try {
      const trialNum = (session?.observationNotebook?.trials?.length || 0) + 1;
      // Map V to initialReadingMl, I to finalReadingMl, V/I to volumeUsedMl for unified schema
      await onRecordTrial({
        trialNumber: trialNum,
        initialReadingMl: readings.voltmeterObservedV,
        finalReadingMl: readings.ammeterObservedA,
        volumeUsedMl: readings.apparentResistanceOhms,
        notes: `Rheostat: ${circuitState.rheostatResistance}Ω, V=${readings.voltmeterObservedV}V, I=${readings.ammeterObservedA}A`,
      });
      setRecordSuccess(true);
      setTimeout(() => setRecordSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to record trial:', err);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-900 font-sans">
      {/* ─── SECONDARY TOP STATUS STRIP: CIRCUIT TOPOLOGY & READINGS HUD ─── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070e17]/95 px-4 py-2 shrink-0 z-20 transition-colors">
        {/* Left: Circuit Continuity Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                readings.circuitClosed
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {readings.circuitClosed
                ? 'Circuit Energized & Closed'
                : !circuitState.isBatteryOn
                ? 'Power Supply OFF'
                : !circuitState.isPlugKeyInserted
                ? 'Plug Key OPEN'
                : 'Incomplete Circuit Loop'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowDiagnostics((p) => !p)}
            className="flex items-center gap-1 text-[0.6875rem] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            <HelpCircle className="h-3 w-3" />
            <span>Diagnostics ({validation.errors.length} issues)</span>
          </button>
        </div>

        {/* Center: Live Meter Digits HUD */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <Gauge className="h-3.5 w-3.5 text-cyan-500" />
            <div className="flex flex-col">
              <span className="text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">Ammeter (I)</span>
              <span className="text-xs font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
                {readings.ammeterObservedA.toFixed(2)} A
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <Gauge className="h-3.5 w-3.5 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">Voltmeter (V)</span>
              <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                {readings.voltmeterObservedV.toFixed(2)} V
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[0.6875rem] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Ratio V / I</span>
              <span className="text-xs font-mono font-extrabold text-amber-600 dark:text-amber-400">
                {readings.apparentResistanceOhms > 0 ? `${readings.apparentResistanceOhms.toFixed(2)} Ω` : '—'}
              </span>
            </div>
          </div>

          {/* Record Live Reading Button */}
          <button
            type="button"
            onClick={handleRecordCurrentReading}
            disabled={!readings.circuitClosed || readings.ammeterObservedA === 0 || isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
              recordSuccess
                ? 'bg-emerald-600'
                : !readings.circuitClosed || readings.ammeterObservedA === 0
                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 active:scale-95'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>{recordSuccess ? 'Recorded ✓' : 'Record Observation'}</span>
          </button>
        </div>

        {/* Right: Viewport Mode Switcher & Auto-Wire */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoWirePreset}
            className="flex items-center gap-1 text-[0.6875rem] font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-500 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 cursor-pointer"
            title="Auto-wire standard NCERT circuit for guided demonstration"
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Auto-Wire</span>
          </button>

          <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/90 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>2D Diagram</span>
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics Drawer (Collapsible) */}
      {showDiagnostics && (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs z-20">
          <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200 mb-1">
            <span>NCERT Circuit Diagnostics</span>
            <button type="button" onClick={() => setShowDiagnostics(false)} className="text-amber-900 dark:text-amber-200">
              ✕
            </button>
          </div>
          {validation.errors.length === 0 ? (
            <p className="text-emerald-700 dark:text-emerald-300">✓ All circuit connections follow official NCERT specifications.</p>
          ) : (
            <ul className="list-disc pl-5 text-amber-800 dark:text-amber-300 space-y-0.5">
              {validation.errors.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ─── MAIN STAGE: 3D THREE.JS WORKBENCH OR ACCESSIBLE 2D BENCH ─── */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {viewMode === '3d' ? (
          <PhysicsLab3DCanvas
            circuitState={circuitState}
            readings={readings}
            onTogglePower={handleTogglePower}
            onTogglePlugKey={handleTogglePlugKey}
            onVoltageChange={handleVoltageChange}
            onRheostatChange={handleRheostatChange}
            onConnectTerminals={handleConnectTerminals}
            onRemoveWire={handleRemoveWire}
            onResetBench={handleResetBench}
            isDarkMode={isDark}
          />
        ) : (
          <PhysicsLab2DBench
            circuitState={circuitState}
            readings={readings}
            onTogglePower={handleTogglePower}
            onTogglePlugKey={handleTogglePlugKey}
            onVoltageChange={handleVoltageChange}
            onRheostatChange={handleRheostatChange}
            onConnectTerminals={handleConnectTerminals}
            onRemoveWire={handleRemoveWire}
            onResetBench={handleResetBench}
            isDarkMode={isDark}
          />
        )}
      </div>
    </div>
  );
};
