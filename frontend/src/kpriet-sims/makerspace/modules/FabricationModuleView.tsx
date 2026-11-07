import React, { useState } from 'react';
import type { IMakerspaceSimulationMetadata } from '../types';
import { AlertTriangle, CheckCircle, Shield, Wrench, RefreshCw, Layers, Zap } from 'lucide-react';

interface Props {
  meta: IMakerspaceSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  isDark: boolean;
}

export const FabricationModuleView: React.FC<Props> = ({ meta, params, onParamChange, isDark }) => {
  const simId = meta.id;

  // ─────────────────────────────────────────────────────────────
  // 1. ARC-WELDING PREPARATION & SAFETY SIMULATOR
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim01-arc-welding') {
    const helmetShade = params.helmetShade ?? 11;
    const leatherGauntlets = params.leatherGauntlets ?? true;
    const fireApron = params.fireApron ?? true;
    const safetyBoots = params.safetyBoots ?? true;
    const workAreaClean = params.workAreaClean ?? true;
    const groundClampSecure = params.groundClampSecure ?? true;
    const bevelAngleDeg = params.bevelAngleDeg ?? 30;
    const rootGapMm = params.rootGapMm ?? 2;
    const currentAmperes = params.currentAmperes ?? 110;
    const electrodeType = params.electrodeType ?? 'E6013';

    const [isWelding, setIsWelding] = useState(false);
    const [weldCompleted, setWeldCompleted] = useState(false);

    const allPpeEquipped = helmetShade >= 10 && leatherGauntlets && fireApron && safetyBoots;
    const workAreaSafe = workAreaClean && groundClampSecure;
    const edgePrepGood = bevelAngleDeg >= 25 && bevelAngleDeg <= 35 && rootGapMm >= 1.5 && rootGapMm <= 2.5;

    // Penetration & quality calculation
    let weldQuality = 'Good Penetration & Uniform Bead';
    let weldStatus = 'Optimal';
    let qualityColor = 'text-emerald-500';

    if (!allPpeEquipped || !workAreaSafe) {
      weldQuality = 'HAZARD INTERLOCK: Safety violation prevents arc strike';
      weldStatus = 'Unsafe';
      qualityColor = 'text-red-500';
    } else if (currentAmperes < 90) {
      weldQuality = 'Lack of Penetration & Arc Instability (Too Cold)';
      weldStatus = 'Defect';
      qualityColor = 'text-amber-500';
    } else if (currentAmperes > 135) {
      weldQuality = 'Burn-Through, Excessive Spatter & Undercut (Too Hot)';
      weldStatus = 'Defect';
      qualityColor = 'text-red-500';
    } else if (!edgePrepGood) {
      weldQuality = 'Incomplete Root Fusion due to Poor Bevel/Gap Prep';
      weldStatus = 'Suboptimal';
      qualityColor = 'text-amber-500';
    }

    const handleStrikeArc = () => {
      if (!allPpeEquipped || !workAreaSafe) return;
      setIsWelding(true);
      setTimeout(() => {
        setIsWelding(false);
        setWeldCompleted(true);
      }, 1800);
    };

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Safety Warning Header */}
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-red-500 block mb-0.5 uppercase tracking-wide">
              Workshop Safety Notice — Arc Welding (SMAW / MMAW)
            </span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              Electric arc temperatures reach 3500°C–4000°C. UV/IR emissions cause corneal photokeratitis ("arc eye") and skin burns. This simulation models preparatory decision-making and defect analysis only.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls Column */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* 1. PPE Checklist Card */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> 1. Virtual PPE Checklist
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${allPpeEquipped ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  {allPpeEquipped ? 'PPE Complete' : 'PPE Incomplete'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leatherGauntlets}
                    onChange={(e) => onParamChange('leatherGauntlets', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Leather Gauntlets</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fireApron}
                    onChange={(e) => onParamChange('fireApron', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Leather Apron</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyBoots}
                    onChange={(e) => onParamChange('safetyBoots', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Steel-Toe Boots</span>
                </label>
                <div className="flex items-center justify-between">
                  <span>Helmet Shade:</span>
                  <select
                    value={helmetShade}
                    onChange={(e) => onParamChange('helmetShade', Number(e.target.value))}
                    className={`text-xs px-2 py-1 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                  >
                    <option value={9}>Shade 9 (Too Light)</option>
                    <option value={10}>Shade 10 (Safe)</option>
                    <option value={11}>Shade 11 (Optimal)</option>
                    <option value={12}>Shade 12 (Heavy)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Work Area Inspection Card */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 flex items-center gap-1.5 mb-3">
                <Wrench className="w-4 h-4" /> 2. Work Area Hazard Check
              </span>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Flammable Solvents Removed:</span>
                  <input
                    type="checkbox"
                    checked={workAreaClean}
                    onChange={(e) => onParamChange('workAreaClean', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Ground Work Clamp Firmly Bolted:</span>
                  <input
                    type="checkbox"
                    checked={groundClampSecure}
                    onChange={(e) => onParamChange('groundClampSecure', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>
              </div>
            </div>

            {/* 3. Base Metal Prep & Current */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 flex items-center gap-1.5 mb-3">
                <Layers className="w-4 h-4" /> 3. Joint Prep & Power Settings
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Edge Bevel Angle:</span>
                    <span className="font-bold text-indigo-500">{bevelAngleDeg}° (Target: 30°–35°)</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={50}
                    value={bevelAngleDeg}
                    onChange={(e) => onParamChange('bevelAngleDeg', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Root Gap:</span>
                    <span className="font-bold text-indigo-500">{rootGapMm} mm (Target: 2 mm)</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={5}
                    step={0.5}
                    value={rootGapMm}
                    onChange={(e) => onParamChange('rootGapMm', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Electrode Type:</span>
                  <select
                    value={electrodeType}
                    onChange={(e) => onParamChange('electrodeType', e.target.value)}
                    className={`text-xs px-2 py-1 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                  >
                    <option value="E6013">E6013 (Rutile - Easy striking, low spatter)</option>
                    <option value="E7018">E7018 (Basic Low-Hydrogen - High tensile)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Welding Current:</span>
                    <span className="font-bold text-indigo-500">{currentAmperes} A (Recommended: 100–120A)</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={170}
                    step={5}
                    value={currentAmperes}
                    onChange={(e) => onParamChange('currentAmperes', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleStrikeArc}
              disabled={isWelding || !allPpeEquipped || !workAreaSafe}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                allPpeEquipped && workAreaSafe
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Zap className={`w-4 h-4 ${isWelding ? 'animate-bounce text-yellow-300' : ''}`} />
              {isWelding ? 'Striking Arc & Depositing Bead...' : 'Strike Electric Arc (Simulate)'}
            </button>
          </div>

          {/* Visual Workspace Column */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cross-Sectional Joint Diagram & Bead Formation
              </span>
              <span className={`text-xs font-bold ${qualityColor}`}>
                {weldStatus}: {weldQuality}
              </span>
            </div>

            {/* SVG Visualizer */}
            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center relative overflow-hidden ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 500 240" className="w-full h-full max-h-[300px]">
                {/* Background bench */}
                <rect x="20" y="170" width="460" height="15" fill="#334155" rx="3" />
                <line x1="20" y1="185" x2="480" y2="185" stroke="#475569" strokeWidth="2" />

                {/* Ground Clamp Indicator */}
                <path d="M 440 170 L 460 170 L 450 155 Z" fill={groundClampSecure ? '#10b981' : '#ef4444'} />
                <text x="430" y="150" fill={groundClampSecure ? '#10b981' : '#ef4444'} fontSize="9" fontWeight="bold">
                  {groundClampSecure ? 'GND OK' : 'NO GND'}
                </text>

                {/* Left Steel Plate */}
                <polygon
                  points={`70,90 220,90 ${220 - bevelAngleDeg * 0.7},160 70,160`}
                  fill="#64748b"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <text x="110" y="130" fill="#cbd5e1" fontSize="12" fontWeight="bold">Steel Plate A (6 mm)</text>

                {/* Right Steel Plate */}
                <polygon
                  points={`430,90 ${220 + rootGapMm * 10},90 ${220 + rootGapMm * 10 + bevelAngleDeg * 0.7},160 430,160`}
                  fill="#64748b"
                  stroke="#475569"
                  strokeWidth="2"
                />
                <text x="290" y="130" fill="#cbd5e1" fontSize="12" fontWeight="bold">Steel Plate B (6 mm)</text>

                {/* Bevel & Gap Annotation */}
                <line x1="220" y1="80" x2={220 + rootGapMm * 10} y2="80" stroke="#f59e0b" strokeWidth="1.5" />
                <text x={215 + rootGapMm * 5} y="74" fill="#f59e0b" fontSize="10" textAnchor="middle" fontWeight="bold">
                  Gap {rootGapMm}mm
                </text>

                {/* Arc Simulation when active */}
                {isWelding && (
                  <g>
                    <circle cx={220 + rootGapMm * 5} cy="130" r="24" fill="url(#arcGlow)" opacity="0.9" />
                    <line x1={220 + rootGapMm * 5} y1="30" x2={220 + rootGapMm * 5} y2="125" stroke="#fef08a" strokeWidth="6" strokeLinecap="round" />
                    <circle cx={220 + rootGapMm * 5} cy="125" r="9" fill="#ffffff" />
                    {/* Spatter sparks */}
                    <line x1={220} y1="125" x2="190" y2="105" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1={235} y1="125" x2="265" y2="110" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1={225} y1="125" x2="240" y2="90" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
                  </g>
                )}

                {/* Weld Bead when completed or preview */}
                {(weldCompleted || isWelding) && (
                  <path
                    d={`M ${220 - bevelAngleDeg * 0.4} 100 Q ${220 + rootGapMm * 5} ${currentAmperes > 135 ? 175 : currentAmperes < 90 ? 120 : 160} ${220 + rootGapMm * 10 + bevelAngleDeg * 0.4} 100 Z`}
                    fill={currentAmperes > 135 ? '#b91c1c' : currentAmperes < 90 ? '#d97706' : '#22c55e'}
                    opacity="0.85"
                  />
                )}

                <defs>
                  <radialGradient id="arcGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="35%" stopColor="#67e8f9" stopOpacity="0.8" />
                    <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Quality Analysis Strip */}
            <div className={`mt-3 p-3 rounded-lg border text-xs grid grid-cols-2 md:grid-cols-4 gap-2 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Safety Interlock</span>
                <span className={`font-bold ${allPpeEquipped && workAreaSafe ? 'text-emerald-500' : 'text-red-500'}`}>
                  {allPpeEquipped && workAreaSafe ? 'ARMED & SAFE' : 'INTERLOCKED'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Root Penetration</span>
                <span className="font-bold">
                  {currentAmperes < 90 ? '45% (Lack of Fusion)' : currentAmperes > 135 ? '100% (Burn-through)' : '98% (Optimal)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Spatter Level</span>
                <span className="font-bold">
                  {currentAmperes > 135 ? 'Excessive (Severe)' : currentAmperes < 90 ? 'Low (Cold Splatter)' : 'Minimal / Clean'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Slag Removal</span>
                <span className="font-bold text-indigo-400">
                  {electrodeType === 'E6013' ? 'Self-Peeling Rutile' : 'Dense Basic Crust'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PIPE CONNECTION EXPLORER
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim02-pipe-connections') {
    const pipeMaterial = params.pipeMaterial ?? 'GI';
    const activeFitting = params.activeFitting ?? 'elbow-90';
    const ptfeTapeWraps = params.ptfeTapeWraps ?? 4;
    const testPressureBar = params.testPressureBar ?? 3.5;
    const explodedView = params.explodedView ?? false;

    const [pressureTested, setPressureTested] = useState(false);
    const isLeakFree = ptfeTapeWraps >= 3 && ptfeTapeWraps <= 6 && testPressureBar <= 6.0;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Info Header */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">Plumbing Joint Explorer</span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Standard Civil Building Plumbing Components (IS 1239 / IS 4985)
            </span>
          </div>
          <button
            onClick={() => onParamChange('explodedView', !explodedView)}
            className={`px-3 py-1 rounded-lg border font-bold text-xs ${explodedView ? 'bg-indigo-600 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
          >
            {explodedView ? 'Collapse Assembly' : 'Exploded View'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                1. Pipe Material & Standard
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'GI', label: 'Galvanized Iron', spec: 'IS 1239 Threaded' },
                  { id: 'PVC', label: 'uPVC / CPVC', spec: 'Solvent Cement' },
                  { id: 'Copper', label: 'Copper / Brass', spec: 'Compression Joint' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onParamChange('pipeMaterial', item.id)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      pipeMaterial === item.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                        : isDark
                        ? 'border-slate-800 hover:bg-slate-800/50 text-slate-400'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.id}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.spec}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                2. Select Active Fitting Component
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'elbow-90', label: '90° Elbow', role: 'Directs flow perpendicular' },
                  { id: 'tee', label: 'Equal Tee', role: 'Branches into 2 runs' },
                  { id: 'union', label: 'Pipe Union', role: 'Allows easy servicing' },
                  { id: 'ball-valve', label: 'Ball Valve', role: 'Flow isolation on/off' },
                  { id: 'reducer', label: 'Reducer Coupling', role: 'Changes pipe diameter' },
                  { id: 'nipple', label: 'Hex Nipple', role: 'Short threaded male joint' },
                ].map((fitting) => (
                  <button
                    key={fitting.id}
                    onClick={() => onParamChange('activeFitting', fitting.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      activeFitting === fitting.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                        : isDark
                        ? 'border-slate-800 hover:bg-slate-800/50 text-slate-300'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{fitting.label}</div>
                    <div className="text-[10px] text-slate-500">{fitting.role}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                3. Joint Sealant & Hydrostatic Test
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>PTFE Thread Seal Tape Wraps:</span>
                    <span className="font-bold text-indigo-500">{ptfeTapeWraps} Wraps (Target: 3–5)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={ptfeTapeWraps}
                    onChange={(e) => onParamChange('ptfeTapeWraps', Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {ptfeTapeWraps < 3 ? '⚠️ Too few wraps — joint will leak at threads' : ptfeTapeWraps > 6 ? '⚠️ Too thick — risks cracking the fitting collar' : '✓ Ideal thread seal coverage'}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Hydrostatic Test Pressure:</span>
                    <span className="font-bold text-indigo-500">{testPressureBar} Bar</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={testPressureBar}
                    onChange={(e) => onParamChange('testPressureBar', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={() => setPressureTested(true)}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Run Pressure Leak Test
                </button>
              </div>
            </div>
          </div>

          {/* Visual Canvas */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Plumbing Assembly Visualization
              </span>
              {pressureTested && (
                <span className={`text-xs font-bold flex items-center gap-1 ${isLeakFree ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isLeakFree ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {isLeakFree ? 'Zero Leaks at Pressure — Passed' : 'Thread Leakage Detected — Failed'}
                </span>
              )}
            </div>

            <div className={`flex-1 min-h-[280px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 520 280" className="w-full h-full max-h-[320px]">
                {/* Pipe Riser */}
                <rect
                  x="80"
                  y={explodedView ? '130' : '100'}
                  width="120"
                  height="34"
                  fill={pipeMaterial === 'GI' ? '#94a3b8' : pipeMaterial === 'Copper' ? '#d97706' : '#f8fafc'}
                  stroke="#475569"
                  strokeWidth="2"
                  rx="2"
                />
                <text x="140" y={explodedView ? '152' : '122'} fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Inlet Pipe (1")
                </text>

                {/* PTFE Tape wrap indication */}
                {ptfeTapeWraps > 0 && (
                  <rect
                    x={explodedView ? '190' : '185'}
                    y={explodedView ? '132' : '102'}
                    width="15"
                    height="30"
                    fill="#e2e8f0"
                    stroke="#cbd5e1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Central Active Fitting */}
                <g transform={explodedView ? 'translate(230, 80)' : 'translate(200, 75)'}>
                  {activeFitting === 'elbow-90' && (
                    <path
                      d="M 0 25 L 50 25 C 65 25 75 35 75 50 L 75 110 L 45 110 L 45 55 L 0 55 Z"
                      fill="#64748b"
                      stroke="#334155"
                      strokeWidth="2"
                    />
                  )}
                  {activeFitting === 'tee' && (
                    <path
                      d="M 0 25 L 80 25 L 80 55 L 55 55 L 55 110 L 25 110 L 25 55 L 0 55 Z"
                      fill="#64748b"
                      stroke="#334155"
                      strokeWidth="2"
                    />
                  )}
                  {activeFitting === 'union' && (
                    <g>
                      <rect x="0" y="20" width="30" height="42" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                      <rect x="25" y="15" width="25" height="52" fill="#f59e0b" stroke="#78350f" strokeWidth="2" rx="3" />
                      <rect x="45" y="20" width="30" height="42" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                      <text x="37" y="45" fill="#78350f" fontSize="9" fontWeight="bold" textAnchor="middle">UNION</text>
                    </g>
                  )}
                  {activeFitting === 'ball-valve' && (
                    <g>
                      <rect x="0" y="22" width="70" height="38" fill="#475569" stroke="#1e293b" strokeWidth="2" rx="4" />
                      {/* Lever */}
                      <rect x="25" y="-5" width="45" height="12" fill="#ef4444" rx="2" />
                      <circle cx="30" cy="18" r="6" fill="#cbd5e1" />
                      <text x="35" y="45" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">VALVE</text>
                    </g>
                  )}
                  {activeFitting === 'reducer' && (
                    <polygon points="0,20 70,28 70,54 0,62" fill="#64748b" stroke="#334155" strokeWidth="2" />
                  )}
                  {activeFitting === 'nipple' && (
                    <g>
                      <rect x="0" y="25" width="60" height="32" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                      <rect x="22" y="20" width="16" height="42" fill="#475569" rx="2" />
                    </g>
                  )}
                </g>

                {/* Outlet Pipe */}
                <rect
                  x={explodedView ? '340' : '280'}
                  y={explodedView ? '70' : '100'}
                  width="120"
                  height="34"
                  fill={pipeMaterial === 'GI' ? '#94a3b8' : pipeMaterial === 'Copper' ? '#d97706' : '#f8fafc'}
                  stroke="#475569"
                  strokeWidth="2"
                  rx="2"
                />
                <text x={explodedView ? '400' : '340'} y={explodedView ? '92' : '122'} fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Outlet Run
                </text>

                {/* Water droplet animation if leaking */}
                {pressureTested && !isLeakFree && (
                  <g>
                    <circle cx="210" cy="140" r="4" fill="#38bdf8" />
                    <circle cx="210" cy="155" r="5" fill="#38bdf8" />
                    <text x="210" y="180" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">LEAK</text>
                  </g>
                )}
              </svg>
            </div>

            {/* Component Engineering Role Card */}
            <div className={`mt-3 p-3 rounded-lg border text-xs ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="font-bold text-indigo-400 mb-1">Civil Engineering Plumbing Notes:</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                A <strong>Pipe Union</strong> enables scheduled replacement of inline water meters, pumps, and backflow preventers without cutting piping. Proper PTFE wrapping (clockwise on male threads) prevents thread galling and eliminates capillary leak pathways under internal mains pressure.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. LASER CUTTING & WIRE-WELDING DEMONSTRATION
  // ─────────────────────────────────────────────────────────────
  const mode = params.mode ?? 'laser';
  const laserPowerPercent = params.laserPowerPercent ?? 75;
  const cuttingSpeedMmPerSec = params.cuttingSpeedMmPerSec ?? 18;
  const airAssist = params.airAssist ?? true;
  const exhaustFanOn = params.exhaustFanOn ?? true;
  const materialThicknessMm = params.materialThicknessMm ?? 3;
  const wireFeedSpeedMpm = params.wireFeedSpeedMpm ?? 5.5;

  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  const startDemo = () => {
    setIsRunningDemo(true);
    setDemoProgress(0);
    const interval = setInterval(() => {
      setDemoProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningDemo(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      {/* Mode Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => onParamChange('mode', 'laser')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
            mode === 'laser'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
              : isDark
              ? 'bg-slate-900 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          CO₂ Laser Cutting (Acrylic Sheets)
        </button>
        <button
          onClick={() => onParamChange('mode', 'wire-weld')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
            mode === 'wire-weld'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
              : isDark
              ? 'bg-slate-900 border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          Wire-Arc Welding (GMAW / MIG Concept)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {mode === 'laser' ? (
            <>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                  Laser Path Parameters
                </span>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Sheet Thickness:</span>
                      <span className="font-bold text-indigo-500">{materialThicknessMm} mm Acrylic</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={10}
                      step={1}
                      value={materialThicknessMm}
                      onChange={(e) => onParamChange('materialThicknessMm', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Laser Tube Power:</span>
                      <span className="font-bold text-indigo-500">{laserPowerPercent} % (80W Tube)</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={laserPowerPercent}
                      onChange={(e) => onParamChange('laserPowerPercent', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Vector Travel Speed:</span>
                      <span className="font-bold text-indigo-500">{cuttingSpeedMmPerSec} mm/s</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      value={cuttingSpeedMmPerSec}
                      onChange={(e) => onParamChange('cuttingSpeedMmPerSec', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                  Safety & Air Filtration
                </span>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Compressed Air Assist:</span>
                    <input
                      type="checkbox"
                      checked={airAssist}
                      onChange={(e) => onParamChange('airAssist', e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Active Fume Exhaust Fan:</span>
                    <input
                      type="checkbox"
                      checked={exhaustFanOn}
                      onChange={(e) => onParamChange('exhaustFanOn', e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Wire-Arc Welding (GMAW / MIG) Parameters
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Wire Feed Rate:</span>
                    <span className="font-bold text-indigo-500">{wireFeedSpeedMpm} m/min</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={0.5}
                    value={wireFeedSpeedMpm}
                    onChange={(e) => onParamChange('wireFeedSpeedMpm', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Shielding Gas:</span>
                  <span className="font-bold text-emerald-500">80% Ar / 20% CO₂ (15 LPM)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Wire Diameter:</span>
                  <span className="font-bold">0.8 mm Copper-Coated Solid Wire</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={startDemo}
            disabled={isRunningDemo}
            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Zap className="w-4 h-4" /> {isRunningDemo ? `Executing Toolpath (${demoProgress}%)...` : 'Execute Machine Demonstration'}
          </button>
        </div>

        {/* Visualizer Canvas */}
        <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {mode === 'laser' ? 'Laser Focal Head & Sheet Interaction' : 'Wire Feeder Gun & Shielding Gas Envelope'}
            </span>
            <span className="text-xs font-bold text-indigo-400">
              {mode === 'laser' ? `Kerf: ~0.18 mm | Speed: ${cuttingSpeedMmPerSec} mm/s` : `Wire: ${wireFeedSpeedMpm} m/min`}
            </span>
          </div>

          <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center relative overflow-hidden ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
            {mode === 'laser' ? (
              <svg viewBox="0 0 480 240" className="w-full h-full max-h-[300px]">
                {/* Honeycomb bed */}
                <rect x="30" y="150" width="420" height="20" fill="#334155" rx="3" />
                {/* Acrylic sheet */}
                <rect x="50" y={150 - materialThicknessMm * 4} width="380" height={materialThicknessMm * 4} fill="#38bdf8" opacity="0.5" stroke="#0284c7" strokeWidth="1.5" />
                <text x="70" y={145 - materialThicknessMm * 4} fill="#0284c7" fontSize="10" fontWeight="bold">
                  Acrylic Sheet ({materialThicknessMm} mm)
                </text>

                {/* Laser Head Moving */}
                <g transform={`translate(${100 + demoProgress * 2.6}, 30)`}>
                  {/* Nozzle */}
                  <polygon points="15,0 35,0 30,50 20,50" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
                  {/* Laser Beam */}
                  <line x1="25" y1="50" x2="25" y2={120} stroke="#ef4444" strokeWidth="2.5" />
                  {/* Focal point glow */}
                  <circle cx="25" cy={120} r="7" fill="#f87171" opacity="0.9" />
                  {/* Air assist cone */}
                  {airAssist && (
                    <path d="M 20 50 L 5 120 L 45 120 Z" fill="#67e8f9" opacity="0.15" />
                  )}
                </g>

                {/* Cut line */}
                <line x1="125" y1="150" x2={125 + demoProgress * 2.6} y2="150" stroke="#0f172a" strokeWidth="3" />
              </svg>
            ) : (
              <svg viewBox="0 0 480 240" className="w-full h-full max-h-[300px]">
                {/* Workpiece */}
                <rect x="50" y="150" width="380" height="20" fill="#64748b" rx="2" />
                {/* MIG Gun */}
                <g transform={`translate(${100 + demoProgress * 2.6}, 40)`}>
                  {/* Contact tube & nozzle */}
                  <rect x="15" y="0" width="20" height="50" fill="#ca8a04" rx="2" />
                  {/* Continuous Wire Electrode */}
                  <line x1="25" y1="50" x2="25" y2="110" stroke="#f59e0b" strokeWidth="2" />
                  {/* Shielding gas shroud */}
                  <path d="M 12 50 L 0 110 L 50 110 L 38 50 Z" fill="#a5f3fc" opacity="0.2" />
                  {/* Arc & Weld Pool */}
                  {isRunningDemo && (
                    <g>
                      <circle cx="25" cy="110" r="14" fill="#fef08a" opacity="0.9" />
                      <circle cx="25" cy="110" r="6" fill="#ffffff" />
                    </g>
                  )}
                </g>
                {/* Deposited Bead */}
                <path d={`M 125 150 Q 180 142 ${125 + demoProgress * 2.6} 150`} stroke="#22c55e" strokeWidth="6" strokeLinecap="round" fill="none" />
              </svg>
            )}
          </div>

          <div className={`mt-3 p-3 rounded-lg border text-xs ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="font-bold text-indigo-400 block mb-1">Pedagogical Summary:</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {mode === 'laser'
                ? 'CO₂ laser cutting utilizes thermal energy vaporization. Air assist is mandatory to extinguish flare-ups and evacuate vaporized methyl methacrylate fumes out of the exhaust.'
                : 'Gas Metal Arc Welding (GMAW / MIG) continuously feeds solid wire while an argon/CO₂ mix shields the molten puddle, enabling rapid, automated joining of structural assemblies.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
