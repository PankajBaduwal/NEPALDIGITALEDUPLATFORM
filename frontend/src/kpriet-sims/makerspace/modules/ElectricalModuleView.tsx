import React, { useState } from 'react';
import type { IMakerspaceSimulationMetadata } from '../types';
import { ShieldAlert, Zap, Power, AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react';

interface Props {
  meta: IMakerspaceSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  isDark: boolean;
}

export const ElectricalModuleView: React.FC<Props> = ({ meta, params, onParamChange, isDark }) => {
  const simId = meta.id;

  // ─────────────────────────────────────────────────────────────
  // 1. ELECTRICAL INSTALLATION & SAFETY CHECKER
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim11-electrical-safety') {
    const incomingIsolatorClosed = params.incomingIsolatorClosed ?? true;
    const rccbHealthy = params.rccbHealthy ?? true;
    const mcbRatingAmps = params.mcbRatingAmps ?? 16;
    const connectedLoadAmps = params.connectedLoadAmps ?? 12;
    const earthResistanceOhms = params.earthResistanceOhms ?? 3.2;
    const detectedFault = params.detectedFault ?? 'none';
    const lotoApplied = params.lotoApplied ?? false;

    const isOverloaded = connectedLoadAmps > mcbRatingAmps;
    const isEarthSafe = earthResistanceOhms <= 5.0;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Safety Notice */}
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-red-500 block mb-0.5 uppercase tracking-wide">
              Mains Voltage Life Safety Warning (230V / 415V AC)
            </span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              Electric currents above 30 mA cause cardiac ventricular fibrillation. This simulation demonstrates electrical safety coordination and fault diagnostic principles. Never attempt live work unsupervised.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                1. Distribution Panel Equipment
              </span>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span>Main Isolator Switch (63A):</span>
                  <button
                    onClick={() => onParamChange('incomingIsolatorClosed', !incomingIsolatorClosed)}
                    className={`px-3 py-1 rounded-lg border font-bold text-xs ${
                      incomingIsolatorClosed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {incomingIsolatorClosed ? 'CLOSED (ON)' : 'OPEN (OFF)'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span>30 mA RCCB / ELCB Test Trip:</span>
                  <button
                    onClick={() => onParamChange('rccbHealthy', !rccbHealthy)}
                    className={`px-3 py-1 rounded-lg border font-bold text-xs ${
                      rccbHealthy ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {rccbHealthy ? 'NORMAL (ARMED)' : 'TRIPPED'}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Circuit MCB Rating:</span>
                    <span className="font-bold text-indigo-500">{mcbRatingAmps} A (Type C)</span>
                  </div>
                  <select
                    value={mcbRatingAmps}
                    onChange={(e) => onParamChange('mcbRatingAmps', Number(e.target.value))}
                    className={`w-full text-xs px-2 py-1.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                  >
                    <option value={6}>6A (Lighting Circuit)</option>
                    <option value={16}>16A (Power Outlets)</option>
                    <option value={25}>25A (Geyser / AC)</option>
                    <option value={32}>32A (Sub-Feeder)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Connected Electrical Load:</span>
                    <span className={`font-bold ${isOverloaded ? 'text-red-500' : 'text-indigo-500'}`}>
                      {connectedLoadAmps} A {isOverloaded && '(OVERLOAD TRIP)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={30}
                    value={connectedLoadAmps}
                    onChange={(e) => onParamChange('connectedLoadAmps', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>{'Earth Pit Resistance ($R_{earth}$):'}</span>
                    <span className={`font-bold ${isEarthSafe ? 'text-emerald-500' : 'text-red-500'}`}>
                      {earthResistanceOhms} $\Omega$ ({isEarthSafe ? 'Safe < 5Ω' : 'Hazardous > 5Ω'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={12.0}
                    step={0.5}
                    value={earthResistanceOhms}
                    onChange={(e) => onParamChange('earthResistanceOhms', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Lock-Out Tag-Out Procedure */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-2">
                2. Lock-Out / Tag-Out (LOTO) Procedure
              </span>
              <button
                onClick={() => {
                  onParamChange('incomingIsolatorClosed', false);
                  onParamChange('lotoApplied', !lotoApplied);
                }}
                className={`w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer ${
                  lotoApplied ? 'bg-red-600 text-white border-red-500' : isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                {lotoApplied ? '🔒 LOTO Padlock & Danger Tag Applied (Safe)' : 'Apply LOTO Padlock to Isolator'}
              </button>
            </div>
          </div>

          {/* Visual Distribution Panel Board */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Single-Line Domestic / Workshop Sub-Distribution Board
            </span>

            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 480 240" className="w-full h-full max-h-[280px]">
                {/* Panel Enclosure */}
                <rect x="20" y="20" width="440" height="200" fill={isDark ? '#0f172a' : '#f8fafc'} stroke="#475569" strokeWidth="2" rx="6" />

                {/* Energy Meter */}
                <rect x="40" y="40" width="70" height="60" fill="#334155" rx="3" />
                <rect x="48" y="48" width="54" height="24" fill="#0284c7" />
                <text x="75" y="64" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">0248 kWh</text>
                <text x="75" y="90" fill="#94a3b8" fontSize="8" textAnchor="middle">Energy Meter</text>

                {/* Main DP Isolator */}
                <rect x="130" y="40" width="60" height="80" fill={incomingIsolatorClosed ? '#059669' : '#dc2626'} rx="3" />
                <text x="160" y="75" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
                  {incomingIsolatorClosed ? 'ON' : 'OFF'}
                </text>
                <text x="160" y="105" fill="#ffffff" fontSize="8" textAnchor="middle">63A Isolator</text>

                {/* 30mA RCCB */}
                <rect x="210" y="40" width="75" height="80" fill={rccbHealthy ? '#0284c7' : '#d97706'} rx="3" />
                <circle cx="265" cy="55" r="5" fill="#fef08a" />
                <text x="247" y="75" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
                  {rccbHealthy ? 'RCCB 30mA' : 'TRIPPED'}
                </text>
                <text x="247" y="105" fill="#ffffff" fontSize="8" textAnchor="middle">Life Protection</text>

                {/* Branch MCBs */}
                <g transform="translate(305, 40)">
                  <rect x="0" y="0" width="35" height="80" fill={isOverloaded ? '#ef4444' : '#475569'} rx="2" />
                  <text x="17" y="45" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">{mcbRatingAmps}A</text>
                  <text x="17" y="70" fill="#94a3b8" fontSize="8" textAnchor="middle">MCB 1</text>
                </g>

                <g transform="translate(350, 40)">
                  <rect x="0" y="0" width="35" height="80" fill="#475569" rx="2" />
                  <text x="17" y="45" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">16A</text>
                  <text x="17" y="70" fill="#94a3b8" fontSize="8" textAnchor="middle">MCB 2</text>
                </g>

                <g transform="translate(395, 40)">
                  <rect x="0" y="0" width="35" height="80" fill="#475569" rx="2" />
                  <text x="17" y="45" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">6A</text>
                  <text x="17" y="70" fill="#94a3b8" fontSize="8" textAnchor="middle">MCB 3</text>
                </g>

                {/* Earth Busbar and Ground Pit */}
                <rect x="40" y="170" width="220" height="12" fill="#22c55e" rx="2" />
                <text x="150" y="162" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">
                  PROTECTIVE EARTH BUSBAR (PE)
                </text>
                {/* Line to Earth Pit */}
                <line x1="260" y1="176" x2="350" y2="176" stroke="#22c55e" strokeWidth="3" />
                <line x1="350" y1="176" x2="350" y2="195" stroke="#22c55e" strokeWidth="3" />
                <line x1="330" y1="195" x2="370" y2="195" stroke="#22c55e" strokeWidth="3" />
                <line x1="338" y1="200" x2="362" y2="200" stroke="#22c55e" strokeWidth="2" />
                <line x1="344" y1="205" x2="356" y2="205" stroke="#22c55e" strokeWidth="1.5" />
                <text x="395" y="202" fill={isEarthSafe ? '#22c55e' : '#ef4444'} fontSize="9" fontWeight="bold">
                  Earth Pit ({earthResistanceOhms}Ω)
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. BASIC WIRING LAYOUT BUILDER
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim12-wiring-layout') {
    const wiringCircuit = params.wiringCircuit ?? 'staircase-2way';
    const switch1State = params.switch1State ?? false;
    const switch2State = params.switch2State ?? false;
    const fanSpeedStep = params.fanSpeedStep ?? 3;

    // Circuit logic
    const staircaseLampOn = switch1State !== switch2State;
    const oneLampOn = switch1State;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Circuit Selector */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '1way-lamp', label: '1-Way Switch & Lamp', desc: 'Simple on/off lighting' },
            { id: 'staircase-2way', label: 'Staircase 2-Way Control', desc: '2 switches for 1 lamp' },
            { id: 'fan-regulator', label: 'Ceiling Fan & Step Regulator', desc: 'Speed control' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => onParamChange('wiringCircuit', c.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                wiringCircuit === c.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="font-bold text-xs">{c.label}</div>
              <div className="text-[10px] opacity-75">{c.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Switch Actuation Controls
              </span>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span>Switch 1 (Position A):</span>
                  <button
                    onClick={() => onParamChange('switch1State', !switch1State)}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-xs cursor-pointer ${
                      switch1State ? 'bg-emerald-600 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {switch1State ? 'POSITION 1 (UP)' : 'POSITION 2 (DOWN)'}
                  </button>
                </div>

                {wiringCircuit === 'staircase-2way' && (
                  <div className="flex items-center justify-between">
                    <span>Switch 2 (Position B - Upstairs):</span>
                    <button
                      onClick={() => onParamChange('switch2State', !switch2State)}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-xs cursor-pointer ${
                        switch2State ? 'bg-emerald-600 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {switch2State ? 'POSITION 1 (UP)' : 'POSITION 2 (DOWN)'}
                    </button>
                  </div>
                )}

                {wiringCircuit === 'fan-regulator' && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Fan Regulator Speed Step:</span>
                      <span className="font-bold text-indigo-500">Step {fanSpeedStep} ({fanSpeedStep * 75} RPM)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      value={fanSpeedStep}
                      onChange={(e) => onParamChange('fanSpeedStep', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* National Color Code Legend */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-2">
                Standard Wire Color Coding (IS 732)
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Phase (Live)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600" />
                  <span>Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Earth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schematic Diagram Canvas */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Schematic Circuit Diagram & Output State
              </span>
              <span className={`text-xs font-bold ${staircaseLampOn ? 'text-amber-400' : 'text-slate-500'}`}>
                {staircaseLampOn ? '💡 Lamp Glowing (Circuit Closed)' : 'Lamp De-Energized (Open Loop)'}
              </span>
            </div>

            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
                {/* Phase line (Red) */}
                <line x1="40" y1="60" x2="110" y2="60" stroke="#ef4444" strokeWidth="3" />
                <text x="40" y="50" fill="#ef4444" fontSize="10" fontWeight="bold">Phase 230V</text>

                {/* Neutral line (Black) */}
                <line x1="40" y1="160" x2="380" y2="160" stroke="#64748b" strokeWidth="3" />
                <text x="40" y="175" fill="#64748b" fontSize="10" fontWeight="bold">Neutral</text>

                {/* Switch 1 */}
                <g transform="translate(110, 45)">
                  <rect x="0" y="0" width="40" height="30" fill="#334155" rx="3" />
                  <circle cx="10" cy="15" r="3" fill="#cbd5e1" />
                  <circle cx="30" cy="8" r="3" fill="#cbd5e1" />
                  <circle cx="30" cy="22" r="3" fill="#cbd5e1" />
                  <line x1="10" y1="15" x2="30" y2={switch1State ? 8 : 22} stroke="#f59e0b" strokeWidth="2.5" />
                  <text x="20" y="-4" fill="#94a3b8" fontSize="8" textAnchor="middle">S1 (Downstairs)</text>
                </g>

                {/* Travelers */}
                <line x1="150" y1="53" x2="230" y2="53" stroke="#eab308" strokeWidth="2" strokeDasharray="3 2" />
                <line x1="150" y1="67" x2="230" y2="67" stroke="#eab308" strokeWidth="2" strokeDasharray="3 2" />

                {/* Switch 2 */}
                <g transform="translate(230, 45)">
                  <rect x="0" y="0" width="40" height="30" fill="#334155" rx="3" />
                  <circle cx="30" cy="15" r="3" fill="#cbd5e1" />
                  <circle cx="10" cy="8" r="3" fill="#cbd5e1" />
                  <circle cx="10" cy="22" r="3" fill="#cbd5e1" />
                  <line x1="30" y1="15" x2="10" y2={switch2State ? 8 : 22} stroke="#f59e0b" strokeWidth="2.5" />
                  <text x="20" y="-4" fill="#94a3b8" fontSize="8" textAnchor="middle">S2 (Upstairs)</text>
                </g>

                {/* Line to Lamp */}
                <line x1="270" y1="60" x2="350" y2="60" stroke="#ef4444" strokeWidth="3" />
                <line x1="350" y1="60" x2="350" y2="90" stroke="#ef4444" strokeWidth="3" />

                {/* Lamp Fixture */}
                <g transform="translate(350, 110)">
                  <circle cx="0" cy="0" r="18" fill={staircaseLampOn ? '#fef08a' : '#334155'} stroke="#eab308" strokeWidth="2" />
                  {staircaseLampOn && (
                    <g>
                      <circle cx="0" cy="0" r="28" fill="#fef08a" opacity="0.3" />
                      <line x1="-10" y1="-10" x2="10" y2="10" stroke="#eab308" strokeWidth="2" />
                      <line x1="-10" y1="10" x2="10" y2="-10" stroke="#eab308" strokeWidth="2" />
                    </g>
                  )}
                  <text x="28" y="4" fill="#94a3b8" fontSize="10">Corridor Lamp</text>
                </g>

                {/* Return from lamp to neutral */}
                <line x1="350" y1="128" x2="350" y2="160" stroke="#64748b" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. MOTOR & PORTABLE POWER SUPPLY CONCEPTS
  // ─────────────────────────────────────────────────────────────
  const operationMode = params.operationMode ?? 'motor';
  const phaseSequence = params.phaseSequence ?? 'R-Y-B';
  const motorRpm = params.motorRpm ?? 1440;
  const motorLoadPercent = params.motorLoadPercent ?? 70;
  const batteryVoltageV = params.batteryVoltageV ?? 48;
  const batteryCapacityAh = params.batteryCapacityAh ?? 100;
  const upsLoadWatts = params.upsLoadWatts ?? 1200;

  const backupTimeHours = Math.round(((batteryVoltageV * batteryCapacityAh * 0.88) / Math.max(100, upsLoadWatts)) * 10) / 10;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      {/* Mode Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => onParamChange('operationMode', 'motor')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
            operationMode === 'motor'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
              : isDark
              ? 'bg-slate-900 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          3-Phase Induction Motor Reversing
        </button>
        <button
          onClick={() => onParamChange('operationMode', 'ups')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
            operationMode === 'ups'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
              : isDark
              ? 'bg-slate-900 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          Uninterruptible Power Supply (UPS)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {operationMode === 'motor' ? (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Phase Sequence & Reversal
              </span>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span>Phase Sequence:</span>
                  <button
                    onClick={() => onParamChange('phaseSequence', phaseSequence === 'R-Y-B' ? 'R-B-Y' : 'R-Y-B')}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-xs cursor-pointer ${
                      phaseSequence === 'R-Y-B' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {phaseSequence === 'R-Y-B' ? 'FORWARD (R-Y-B)' : 'REVERSE (R-B-Y)'}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Motor Shaft Speed:</span>
                    <span className="font-bold text-indigo-500">
                      {phaseSequence === 'R-Y-B' ? `+${motorRpm} RPM (CW)` : `-${motorRpm} RPM (CCW)`}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Shaft Mechanical Load:</span>
                    <span className="font-bold text-indigo-500">{motorLoadPercent} % Rated</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={140}
                    value={motorLoadPercent}
                    onChange={(e) => onParamChange('motorLoadPercent', Number(e.target.value))}
                    className="w-full"
                  />
                  {motorLoadPercent > 115 && (
                    <span className="text-red-500 block text-[10px] font-bold mt-1">
                      ⚠️ OVERLOAD WARNING: Thermal relay will trip in 45s
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                UPS & Battery Backup Sizing
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Battery Bank Capacity:</span>
                    <span className="font-bold text-indigo-500">{batteryCapacityAh} Ah (48V DC)</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={200}
                    step={10}
                    value={batteryCapacityAh}
                    onChange={(e) => onParamChange('batteryCapacityAh', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Critical Load:</span>
                    <span className="font-bold text-indigo-500">{upsLoadWatts} W</span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={3000}
                    step={100}
                    value={upsLoadWatts}
                    onChange={(e) => onParamChange('upsLoadWatts', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-500 block text-[10px] uppercase font-bold">Estimated Runtime</span>
                  <span className="text-base font-bold text-emerald-400">{backupTimeHours} Hours</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visualizer */}
        <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {operationMode === 'motor' ? 'Stator Rotating Magnetic Field (RMF)' : 'Online UPS Power Conversion Flow'}
          </span>

          <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
            {operationMode === 'motor' ? (
              <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
                {/* Motor Stator */}
                <circle cx="230" cy="110" r="85" fill={isDark ? '#0f172a' : '#f1f5f9'} stroke="#3b82f6" strokeWidth="8" />
                {/* Rotor */}
                <circle cx="230" cy="110" r="50" fill="#334155" stroke="#475569" strokeWidth="3" />
                <circle cx="230" cy="110" r="14" fill="#94a3b8" />

                {/* Rotating direction arrow */}
                <path
                  d={
                    phaseSequence === 'R-Y-B'
                      ? 'M 230 40 A 70 70 0 0 1 290 85'
                      : 'M 230 40 A 70 70 0 0 0 170 85'
                  }
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text x="230" y="115" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {phaseSequence === 'R-Y-B' ? 'CW' : 'CCW'}
                </text>
                <text x="230" y="210" fill="#94a3b8" fontSize="10" textAnchor="middle">
                  Sequence: {phaseSequence} ({phaseSequence === 'R-Y-B' ? 'Forward' : 'Reversed'})
                </text>
              </svg>
            ) : (
              <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
                {/* AC Mains */}
                <rect x="20" y="80" width="70" height="50" fill="#334155" rx="3" />
                <text x="55" y="105" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">AC Mains</text>
                <text x="55" y="120" fill="#38bdf8" fontSize="8" textAnchor="middle">230V 50Hz</text>

                {/* Rectifier */}
                <line x1="90" y1="105" x2="130" y2="105" stroke="#38bdf8" strokeWidth="2.5" />
                <rect x="130" y="80" width="70" height="50" fill="#0284c7" rx="3" />
                <text x="165" y="105" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Rectifier</text>
                <text x="165" y="120" fill="#e0f2fe" fontSize="8" textAnchor="middle">AC → DC</text>

                {/* Battery Bank */}
                <line x1="165" y1="130" x2="165" y2="165" stroke="#f59e0b" strokeWidth="2.5" />
                <rect x="130" y="165" width="70" height="40" fill="#b45309" rx="3" />
                <text x="165" y="185" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">48V Battery</text>
                <text x="165" y="198" fill="#fef3c7" fontSize="8" textAnchor="middle">{batteryCapacityAh} Ah</text>

                {/* Inverter */}
                <line x1="200" y1="105" x2="250" y2="105" stroke="#f59e0b" strokeWidth="2.5" />
                <rect x="250" y="80" width="70" height="50" fill="#7c3aed" rx="3" />
                <text x="285" y="105" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Inverter</text>
                <text x="285" y="120" fill="#ede9fe" fontSize="8" textAnchor="middle">DC → AC</text>

                {/* Load */}
                <line x1="320" y1="105" x2="370" y2="105" stroke="#22c55e" strokeWidth="2.5" />
                <rect x="370" y="80" width="70" height="50" fill="#059669" rx="3" />
                <text x="405" y="105" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Critical Load</text>
                <text x="405" y="120" fill="#d1fae5" fontSize="8" textAnchor="middle">{upsLoadWatts} W</text>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
