import React, { useState } from 'react';
import type { IPhysicsCivilSimulationMetadata } from '../types';

interface ModuleViewProps {
  simulation: IPhysicsCivilSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  theme: 'light' | 'dark';
}

export const HazardsProtectionView: React.FC<ModuleViewProps> = ({
  simulation,
  params,
  onParamChange,
  theme,
}) => {
  const isDark = theme === 'dark';
  const simId = simulation.id;

  // ─── 21. Seismology Wave Propagation (u25rph06-sim21-seismology-wave-propagation) ───
  if (simId === 'u25rph06-sim21-seismology-wave-propagation') {
    const k = Number(params.bulkModulusGPa ?? 45) * 1e9;
    const g = Number(params.shearModulusGPa ?? 28) * 1e9;
    const rho = Number(params.densityKgM3 ?? 2650);
    const distKM = Number(params.epicentralDistanceKM ?? 180);

    const vp = Math.sqrt((k + (4 / 3) * g) / rho) / 1000; // km/s
    const vs = Math.sqrt(g / rho) / 1000; // km/s
    const tp = distKM / vp;
    const ts = distKM / vs;
    const spDelay = ts - tp;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Seismic Wave Propagation: P-Waves vs S-Waves in Bedrock</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                S - P Delay: {spDelay.toFixed(1)} s at {distKM} km
              </span>
            </h4>

            {/* Geological Seismogram Display */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
              <div className="w-full flex justify-between text-xs font-mono">
                <span className="text-emerald-400">P-Wave Arrival: {tp.toFixed(1)} s (Vp = {vp.toFixed(2)} km/s)</span>
                <span className="text-amber-400">S-Wave Arrival: {ts.toFixed(1)} s (Vs = {vs.toFixed(2)} km/s)</span>
              </div>
              <svg className="w-full h-24 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                {/* Baseline flatline */}
                <line x1="0" y1="15" x2="20" y2="15" stroke="#94a3b8" strokeWidth="1.5" />
                {/* P-wave gentle oscillation */}
                <path d="M 20,15 Q 25,5 30,15 T 40,15" fill="none" stroke="#10b981" strokeWidth="2" />
                <line x1="40" y1="15" x2="55" y2="15" stroke="#10b981" strokeWidth="1" />
                {/* Violent S-wave & surface wave oscillation */}
                <path d="M 55,15 Q 60,0 65,30 T 75,0 T 85,28 T 95,15 L 100,15" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
              </svg>
              <div className="text-[11px] text-slate-400 text-center font-mono">
                Vp / Vs Ratio = <span className="text-cyan-300 font-bold">{(vp / vs).toFixed(2)}</span> (P-waves arrive first, giving crucial warning seconds)
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Primary P-Wave Speed:</span>
                <div className="text-xl font-bold font-mono text-emerald-400">{vp.toFixed(2)} km/s</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Secondary S-Wave Speed:</span>
                <div className="text-xl font-bold font-mono text-amber-300">{vs.toFixed(2)} km/s</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Early Warning Window:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{spDelay.toFixed(1)} Seconds</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Geological Strata & Distance</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Epicentral Distance</span>
                <span className="text-cyan-400 font-mono font-bold">{distKM} km</span>
              </div>
              <input
                type="range"
                min="20"
                max="400"
                step="10"
                value={distKM}
                onChange={(e) => onParamChange('epicentralDistanceKM', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Shear Modulus (G)</span>
                <span className="text-amber-400 font-mono font-bold">{params.shearModulusGPa ?? 28} GPa</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="2"
                value={params.shearModulusGPa ?? 28}
                onChange={(e) => onParamChange('shearModulusGPa', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 22. Building Resonance & Base Isolation (u25rph06-sim22-earthquake-response-spectrum) ───
  if (simId === 'u25rph06-sim22-earthquake-response-spectrum') {
    const stories = Number(params.buildingStories ?? 5);
    const isIsolated = Boolean(params.baseIsolationActive);
    const fixedTn = stories * 0.10; // 0.50s for 5 stories
    const tn = isIsolated ? 2.4 : fixedTn; // Base isolation shifts Tn to 2.4s
    const roofDrift = isIsolated ? 18 : 145; // mm drift
    const baseShear = isIsolated ? 240 : 960; // kN

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Seismic Resonance vs Elastomeric Base Isolation</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${isIsolated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isIsolated ? 'Base Isolated (Period Shifted to 2.4s)' : 'Fixed Base (Resonance Risk at Tn = 0.50s)'}
              </span>
            </h4>

            {/* Building Sway Visualization */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-4 flex items-end justify-center relative overflow-hidden">
              <div
                className="w-28 rounded-t border-2 flex flex-col justify-between p-2 transition-all duration-500"
                style={{
                  height: `${stories * 26}px`,
                  background: isIsolated ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.25)',
                  borderColor: isIsolated ? '#10b981' : '#ef4444',
                  transform: isIsolated ? 'none' : 'skewX(-8deg)',
                }}
              >
                <span className="text-[10px] font-mono text-center font-bold text-white">Roof: {roofDrift} mm Drift</span>
                <span className="text-[10px] font-mono text-center text-slate-300">{stories} Stories RC Frame</span>
                <span className="text-[10px] font-mono text-center font-bold text-cyan-300">Tn = {tn.toFixed(2)} s</span>
              </div>
              {/* Foundation / Base isolators */}
              <div className="w-36 h-4 bg-slate-700 border border-slate-500 rounded flex items-center justify-around absolute bottom-1">
                {isIsolated && (
                  <>
                    <div className="w-5 h-3 bg-amber-400 rounded-sm" title="Lead-Rubber Bearing" />
                    <div className="w-5 h-3 bg-amber-400 rounded-sm" title="Lead-Rubber Bearing" />
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Fundamental Period Tn:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{tn.toFixed(2)} s</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Max Interstory Drift:</span>
                <div className={`text-xl font-bold font-mono ${isIsolated ? 'text-emerald-400' : 'text-rose-400'}`}>{roofDrift} mm</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Transmitted Base Shear:</span>
                <div className={`text-xl font-bold font-mono ${isIsolated ? 'text-emerald-400' : 'text-rose-400'}`}>{baseShear} kN (-75%)</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Structural Parameters</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Building Stories</span>
                <span className="text-cyan-400 font-mono font-bold">{stories} Floors</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={stories}
                onChange={(e) => onParamChange('buildingStories', parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
            <div className="pt-2">
              <button
                onClick={() => onParamChange('baseIsolationActive', !isIsolated)}
                className={`w-full py-2.5 px-3 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 ${
                  isIsolated ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                }`}
              >
                <span>{isIsolated ? '🛡️ Base Isolation: ACTIVE' : 'Enable Base Isolation (LRB)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 23. Magnitude & Intensity (u25rph06-sim23-magnitude-intensity-damage) ───
  if (simId === 'u25rph06-sim23-magnitude-intensity-damage') {
    const mw = Number(params.magnitudeMw ?? 7.0);
    const dist = Number(params.epicentralDistanceKM ?? 25);
    const struct = params.structuralSystem ?? 'Unreinforced Masonry (URM)';

    // Gutenberg-Richter energy E = 10^(4.8 + 1.5*M) Joules
    const energyJoules = Math.pow(10, 4.8 + 1.5 * mw);
    const tntEquivalent = (energyJoules / 4.184e9).toExponential(2); // Tons of TNT
    // Approximate PGA attenuation
    const pga = Math.max(0.02, (0.45 * Math.pow(10, 0.25 * mw)) / Math.pow(dist + 15, 0.85)); // in g
    const mmi = pga > 0.6 ? 'X (Disastrous)' : pga > 0.35 ? 'IX (Violent)' : pga > 0.2 ? 'VIII (Severe)' : pga > 0.1 ? 'VII (Very Strong)' : 'V (Moderate)';

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Earthquake Energy Release vs Localized MMI Structural Damage</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                PGA = {pga.toFixed(2)}g (Intensity {mmi})
              </span>
            </h4>

            {/* MMI Damage Scale Bar */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Fault Energy: Mw {mw.toFixed(1)}</span>
                <span className="text-amber-400">{tntEquivalent} Tons TNT Equivalent</span>
              </div>
              <div className="p-3 rounded bg-slate-900 border border-slate-700 flex flex-col gap-1">
                <span className="text-xs text-slate-300 font-semibold">Localized Damage to {struct}:</span>
                <span className="text-xs text-rose-300">
                  {pga > 0.3 && struct.includes('Masonry')
                    ? '⚠️ Severe wall cracking, partial roof collapse, out-of-plane gable wall failure (High casualty risk)'
                    : pga > 0.3
                    ? '🛡️ Ductile RC beam-column plastic hinges active; building remains standing safely with zero collapse'
                    : 'Minor plaster cracking; no structural distress'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 text-center font-mono">
                Gutenberg-Richter Law: Every +1.0 Magnitude increases energy release by <span className="text-amber-400 font-bold">31.6x</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Peak Ground Accel (PGA):</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{pga.toFixed(2)} g</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">MMI Intensity:</span>
                <div className="text-xl font-bold font-mono text-amber-300">{mmi}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Epicentral Distance:</span>
                <div className="text-xl font-bold font-mono text-emerald-400">{dist} km</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Earthquake Parameters</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Moment Magnitude (Mw)</span>
                <span className="text-amber-400 font-mono font-bold">Mw {mw.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="8.5"
                step="0.1"
                value={mw}
                onChange={(e) => onParamChange('magnitudeMw', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Distance from Fault</span>
                <span className="text-cyan-400 font-mono font-bold">{dist} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={dist}
                onChange={(e) => onParamChange('epicentralDistanceKM', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
            <div>
              <span className="text-xs text-slate-300 mb-1 block">Structural Framing</span>
              <select
                value={struct}
                onChange={(e) => onParamChange('structuralSystem', e.target.value)}
                className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="Unreinforced Masonry (URM)">Unreinforced Brick Masonry</option>
                <option value="Ductile Reinforced Concrete (IS 13920)">Ductile RC Frame (IS 13920)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 24. Cyclone Wind & Flood (u25rph06-sim24-cyclone-wind-flood-forces) ───
  if (simId === 'u25rph06-sim24-cyclone-wind-flood-forces') {
    const windKmh = Number(params.windSpeedKmh ?? 180);
    const floodH = Number(params.floodDepthM ?? 2.0);
    const floodVel = Number(params.floodVelocityMs ?? 2.5);

    const windMs = windKmh / 3.6;
    const windPressure = 0.6 * Math.pow(windMs, 2); // N/m² (IS 875)
    const roofUpliftKN = (windPressure * 1.2 * 72) / 1000; // 72 m² roof area with -1.2 Cp
    const hydrostaticKN = (0.5 * 1025 * 9.81 * Math.pow(floodH, 2)) / 1000; // kN/m wall
    const hydrodynamicKN = (0.5 * 1.2 * 1025 * Math.pow(floodVel, 2) * floodH) / 1000; // kN/m wall
    const totalFloodKN = hydrostaticKN + hydrodynamicKN;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Cyclone Aerodynamic Pressure & Storm Surge Hydrodynamics</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                Wind p_z = {windPressure.toFixed(0)} N/m²
              </span>
            </h4>

            {/* Coastal Hazard Diagram */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400">🌪️ Wind Speed: {windKmh} km/h ({windMs.toFixed(1)} m/s)</span>
                <span className="text-amber-400">🌊 Flood Surge: {floodH}m Depth at {floodVel} m/s</span>
              </div>
              <div className="flex items-center justify-between px-6">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-rose-400 font-bold font-mono">Roof Suction Uplift:</span>
                  <span className="text-xl font-bold font-mono text-rose-400">{roofUpliftKN.toFixed(1)} kN</span>
                  <span className="text-[10px] text-slate-400">Tends to rip roof off</span>
                </div>
                <div className="w-px h-16 bg-slate-700" />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-cyan-400 font-bold font-mono">Flood Lateral Force:</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">{totalFloodKN.toFixed(1)} kN/m</span>
                  <span className="text-[10px] text-slate-400">Hydrostatic + Drag</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 text-center font-mono">
                Formula: p_z = 0.6·V² (IS 875-3) | F_flood = ½ρgh² + ½Cd·ρv²A
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Design Wind Pressure:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{windPressure.toFixed(0)} N/m²</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Roof Uplift Force:</span>
                <div className="text-xl font-bold font-mono text-rose-400">{roofUpliftKN.toFixed(1)} kN</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Hydrodynamic Thrust:</span>
                <div className="text-xl font-bold font-mono text-amber-300">{totalFloodKN.toFixed(1)} kN/m</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Hazard Severity Inputs</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Cyclone Wind Speed</span>
                <span className="text-cyan-400 font-mono font-bold">{windKmh} km/h</span>
              </div>
              <input
                type="range"
                min="100"
                max="250"
                step="10"
                value={windKmh}
                onChange={(e) => onParamChange('windSpeedKmh', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Storm Surge Flood Depth</span>
                <span className="text-amber-400 font-mono font-bold">{floodH} meters</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.5"
                value={floodH}
                onChange={(e) => onParamChange('floodDepthM', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 25. Fire Hazards & Thermal Barrier (u25rph06-sim25-fire-hazard-thermal-barrier) ───
  const fireMin = Number(params.fireDurationMin ?? 60);
  const protType = params.fireProtectionType ?? 'Intumescent Coating (2.5mm)';
  // ISO 834 Curve: T = 20 + 345 * log10(8*t + 1)
  const furnaceTemp = 20 + 345 * Math.log10(8 * fireMin + 1);
  const isProtected = !protType.includes('Unprotected');
  const steelTemp = isProtected ? 20 + (furnaceTemp - 20) * 0.32 : furnaceTemp;
  const yieldRetention = steelTemp > 700 ? 15 : steelTemp > 550 ? 45 : steelTemp > 400 ? 75 : 98;
  const isCollapsed = yieldRetention < 50;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm flex justify-between">
            <span>ISO 834 Standard Fire Curve & Structural Steel Degradation</span>
            <span className={`text-xs px-2 py-0.5 rounded font-mono ${!isCollapsed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {isCollapsed ? 'Structural Steel Buckling Collapse!' : 'Structural Integrity Intact (> 50% Yield)'}
            </span>
          </h4>

          {/* Fire Curve Graphic */}
          <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-3 relative flex flex-col justify-between">
            <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
              {/* ISO 834 Furnace Curve */}
              <path d="M 0,38 Q 20,15 100,5" fill="none" stroke="#ef4444" strokeWidth="2.5" />
              {/* Critical Steel Temperature line (550°C ~ line 22) */}
              <line x1="0" y1="22" x2="100" y2="22" stroke="#eab308" strokeWidth="1" strokeDasharray="3,2" />
            </svg>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-rose-400">Furnace Gas: {furnaceTemp.toFixed(0)}°C</span>
              <span className="text-amber-400 font-bold">Steel Temp: {steelTemp.toFixed(0)}°C (Critical = 550°C)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Furnace Fire Temp:</span>
              <div className="text-xl font-bold font-mono text-rose-400">{furnaceTemp.toFixed(0)}°C</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Steel Temperature:</span>
              <div className={`text-xl font-bold font-mono ${steelTemp > 550 ? 'text-rose-400' : 'text-emerald-400'}`}>{steelTemp.toFixed(0)}°C</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Yield Strength Left:</span>
              <div className={`text-xl font-bold font-mono ${yieldRetention < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{yieldRetention}%</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm">Fire Simulation Settings</h4>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Fire Exposure Duration</span>
              <span className="text-rose-400 font-mono font-bold">{fireMin} Minutes</span>
            </div>
            <input
              type="range"
              min="10"
              max="180"
              step="5"
              value={fireMin}
              onChange={(e) => onParamChange('fireDurationMin', parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
          <div>
            <span className="text-xs text-slate-300 mb-1 block">Fire Protection Barrier</span>
            <select
              value={protType}
              onChange={(e) => onParamChange('fireProtectionType', e.target.value)}
              className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
            >
              <option value="Intumescent Coating (2.5mm)">Intumescent Coating 2.5mm (Swelling Char)</option>
              <option value="Calcium Silicate Board (25mm)">Calcium Silicate Board 25mm Encasement</option>
              <option value="Unprotected Structural Steel">Unprotected Steel (Direct Flame Contact)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
