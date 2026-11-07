import React, { useState, useMemo } from 'react';
import type { IPhysicsCivilSimulationMetadata } from '../types';

interface ModuleViewProps {
  simulation: IPhysicsCivilSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  theme: 'light' | 'dark';
}

export const SmartMaterialsView: React.FC<ModuleViewProps> = ({
  simulation,
  params,
  onParamChange,
  theme,
}) => {
  const isDark = theme === 'dark';
  const simId = simulation.id;

  // ─── 1. FRP Composites (u25rph06-sim01-frp-composites) ───
  if (simId === 'u25rph06-sim01-frp-composites') {
    const vf = Number(params.volumeFraction ?? 0.55);
    const ef = Number(params.fiberModulus ?? 230); // Carbon GPa
    const em = Number(params.matrixModulus ?? 3.5); // Epoxy GPa
    const appliedStress = Number(params.appliedStress ?? 600); // MPa

    const ecl = ef * vf + em * (1 - vf);
    const ect = (ef * em) / (em * vf + ef * (1 - vf));
    const tensileCapacity = (2800 * vf + 75 * (1 - vf)).toFixed(0);
    const strainLongitudinal = (appliedStress / (ecl * 1000)) * 100; // in %
    const strainTransverse = (appliedStress / (ect * 1000)) * 100;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
              <h4 className="font-semibold text-sm mb-2 flex items-center justify-between">
                <span>Fiber-Matrix Microstructure & Stress-Strain Response</span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">Voigt vs Reuss Models</span>
              </h4>

              {/* Visual composite cross-section */}
              <div className="relative h-44 rounded-lg overflow-hidden border border-slate-700/50 flex flex-col items-center justify-center p-3"
                   style={{ background: isDark ? '#0b1329' : '#f8fafc' }}>
                <div className="w-full flex justify-between text-xs text-slate-400 mb-1">
                  <span>Reinforcing Fibers (Vf = {(vf * 100).toFixed(0)}%)</span>
                  <span>Polymer Resin Matrix (Vm = {((1 - vf) * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full h-12 rounded bg-slate-800 border border-slate-600 relative overflow-hidden flex items-center">
                  {Array.from({ length: Math.round(vf * 28) }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full bg-cyan-400/80 mx-1 rounded-sm shadow-sm"
                      style={{ width: `${Math.max(4, Math.round(vf * 12))}px` }}
                      title="Continuous Unidirectional Carbon Fiber"
                    />
                  ))}
                </div>
                <div className="w-full grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className={`p-2 rounded ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'} border border-cyan-500/30`}>
                    <span className="text-cyan-400 font-mono font-bold">Longitudinal (Isostrain):</span>
                    <div className="text-lg font-bold text-slate-100 mt-0.5">{ecl.toFixed(1)} <span className="text-xs font-normal text-slate-400">GPa</span></div>
                    <div className="text-[11px] text-slate-400">Strain under {appliedStress} MPa: {strainLongitudinal.toFixed(3)}%</div>
                  </div>
                  <div className={`p-2 rounded ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'} border border-amber-500/30`}>
                    <span className="text-amber-400 font-mono font-bold">Transverse (Isostress):</span>
                    <div className="text-lg font-bold text-slate-100 mt-0.5">{ect.toFixed(2)} <span className="text-xs font-normal text-slate-400">GPa</span></div>
                    <div className="text-[11px] text-slate-400">Strain under {appliedStress} MPa: {strainTransverse.toFixed(2)}% (High deformation)</div>
                  </div>
                </div>
              </div>

              {/* Live Rule of Mixtures graph */}
              <div className="mt-3 p-3 rounded-lg border border-slate-700/60 bg-slate-950/60 flex flex-col gap-2">
                <span className="text-xs text-slate-400">Rule of Mixtures Curve: Modulus vs Fiber Volume Fraction (0 to 1.0)</span>
                <div className="h-28 w-full relative flex items-end border-b border-l border-slate-600 pt-2 pb-1 px-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                    {/* Voigt linear upper bound */}
                    <line x1="0" y1="48" x2="100" y2="2" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3,2" />
                    {/* Reuss lower curve */}
                    <path d="M 0,48 Q 50,47 100,2" fill="none" stroke="#f59e0b" strokeWidth="2" />
                    {/* Current operating point */}
                    <circle cx={vf * 100} cy={50 - (ecl / ef) * 48} r="3" fill="#38bdf8" />
                  </svg>
                  <span className="absolute left-1 top-0 text-[10px] text-cyan-400">Voigt (Isostrain)</span>
                  <span className="absolute right-2 bottom-1 text-[10px] text-amber-400">Reuss (Isostress)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive parameter controls */}
          <div className="flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm flex flex-col gap-3`}>
              <h4 className="font-semibold text-sm">FRP Laminate Controls</h4>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Fiber Volume Fraction (Vf)</span>
                  <span className="font-mono text-cyan-400 font-bold">{vf.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={vf}
                  onChange={(e) => onParamChange('volumeFraction', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Fiber Elastic Modulus (Ef)</span>
                  <span className="font-mono text-cyan-400 font-bold">{ef} GPa</span>
                </div>
                <select
                  value={ef}
                  onChange={(e) => onParamChange('fiberModulus', parseFloat(e.target.value))}
                  className={`w-full text-xs p-2 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300'}`}
                >
                  <option value={230}>Carbon Fiber Standard (230 GPa)</option>
                  <option value={380}>Carbon Fiber High Modulus (380 GPa)</option>
                  <option value={72}>E-Glass Fiber (72 GPa)</option>
                  <option value={130}>Aramid / Kevlar 49 (130 GPa)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Applied Structural Stress</span>
                  <span className="font-mono text-cyan-400 font-bold">{appliedStress} MPa</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1500"
                  step="50"
                  value={appliedStress}
                  onChange={(e) => onParamChange('appliedStress', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="mt-2 pt-2 border-t border-slate-700/60 text-xs flex flex-col gap-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>Tensile Capacity:</span>
                  <span className="font-bold text-emerald-400 font-mono">{tensileCapacity} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span>Strength-to-Weight Ratio:</span>
                  <span className="font-bold text-cyan-400 font-mono">{(parseInt(tensileCapacity) / 1.6).toFixed(0)} kN·m/kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Steel Equivalent (Fe 500D):</span>
                  <span className="text-amber-300 font-mono">{(parseInt(tensileCapacity) / 500).toFixed(1)}x Stronger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. FRM Metal Matrix (u25rph06-sim02-frm-metal-matrix) ───
  if (simId === 'u25rph06-sim02-frm-metal-matrix') {
    const fiberD = Number(params.fiberDiameter ?? 140); // um
    const fiberStrength = Number(params.fiberTensileStrength ?? 3400); // MPa
    const tauYield = Number(params.matrixShearYield ?? 85); // MPa
    const temp = Number(params.operatingTemp ?? 250); // °C

    // Temperature degradation on matrix shear yield
    const tempFactor = Math.max(0.2, 1 - (temp - 20) / 500);
    const effTauYield = tauYield * tempFactor;
    const lc = (fiberStrength * (fiberD * 1e-3)) / (2 * effTauYield); // in mm
    const embedmentLength = 15; // mm
    const loadTransferEff = Math.min(100, Math.round((embedmentLength / (embedmentLength + lc)) * 100));

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Interfacial Shear Lag Model & Load Transfer</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">Kelly-Tyson Equation</span>
            </h4>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span>SiC Monofilament Embedment in Al 6061 Matrix</span>
                <span className="text-amber-400 font-mono">Operating Temp: {temp}°C</span>
              </div>
              <div className="h-16 w-full rounded border border-slate-700 relative bg-slate-900 flex items-center px-4">
                <div className="w-full h-6 bg-slate-700 rounded relative overflow-hidden flex items-center">
                  <div
                    className="h-3 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 rounded"
                    style={{ width: `${Math.min(100, (lc / 15) * 100)}%` }}
                  />
                </div>
                <span className="absolute right-6 text-xs font-mono text-cyan-300">
                  Critical Length lc = {lc.toFixed(2)} mm
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700">
                  <span className="text-slate-400">Effective Matrix Shear:</span>
                  <div className="text-base font-bold text-emerald-400">{effTauYield.toFixed(1)} MPa</div>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700">
                  <span className="text-slate-400">Required Critical lc:</span>
                  <div className="text-base font-bold text-cyan-400">{lc.toFixed(2)} mm</div>
                </div>
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700">
                  <span className="text-slate-400">Transfer Efficiency:</span>
                  <div className="text-base font-bold text-amber-400">{loadTransferEff}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">FRM Operating Variables</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Service Temperature</span>
                <span className="text-amber-400 font-mono font-bold">{temp}°C</span>
              </div>
              <input
                type="range"
                min="20"
                max="450"
                step="10"
                value={temp}
                onChange={(e) => onParamChange('operatingTemp', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Fiber Diameter</span>
                <span className="text-cyan-400 font-mono font-bold">{fiberD} µm</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="10"
                value={fiberD}
                onChange={(e) => onParamChange('fiberDiameter', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 3. Metallic Glasses (u25rph06-sim03-metallic-glasses) ───
  if (simId === 'u25rph06-sim03-metallic-glasses') {
    const coolingRateLog = Number(params.coolingRateLog ?? 6.0); // 10^6 K/s
    const isAmorphous = coolingRateLog >= 5.0;
    const yieldStrength = isAmorphous ? 2400 : 500;
    const elasticLimit = isAmorphous ? 2.0 : 0.2; // % strain
    const corrosionRate = isAmorphous ? 0.002 : 0.18; // mm/year in marine spray

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Atomic Lattice vs Amorphous Liquid-Like Structure</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${isAmorphous ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {isAmorphous ? 'Bulk Metallic Glass (Amorphous)' : 'Crystalline Steel (Polycrystalline)'}
              </span>
            </h4>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center">
              <div className="grid grid-cols-8 gap-2 p-4 bg-slate-900 rounded-lg border border-slate-800">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isAmorphous ? 'bg-cyan-400 text-slate-950 shadow-cyan-500/40' : 'bg-slate-400 text-slate-950'
                    }`}
                    style={{
                      transform: isAmorphous ? `translate(${(i % 3) * 2 - 2}px, ${(i % 2) * 3 - 2}px)` : 'none',
                    }}
                  >
                    Fe
                  </div>
                ))}
              </div>
              <div className="w-full grid grid-cols-3 gap-3 mt-4 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-slate-400">Yield Strength:</span>
                  <div className="text-lg font-bold text-cyan-400">{yieldStrength} MPa</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-slate-400">Elastic Strain Limit:</span>
                  <div className="text-lg font-bold text-emerald-400">{elasticLimit}% (10x Steel)</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-slate-400">Marine Corrosion:</span>
                  <div className="text-lg font-bold text-amber-400">{corrosionRate} mm/yr</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Melt-Spinning Controls</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Quenching Cooling Rate</span>
                <span className="font-mono text-cyan-400 font-bold">10^{coolingRateLog.toFixed(1)} K/s</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="7.0"
                step="0.5"
                value={coolingRateLog}
                onChange={(e) => onParamChange('coolingRateLog', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Critical threshold for glass formation: &gt;= 10^5 K/s</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 4. Nitinol SMA (u25rph06-sim04-shape-memory-alloys) ───
  if (simId === 'u25rph06-sim04-shape-memory-alloys') {
    const temp = Number(params.temperature ?? 25);
    const af = Number(params.austeniteFinish ?? 15);
    const maxStrain = Number(params.maxStrainPct ?? 6.0);
    const isSuperelastic = temp > af;
    const forwardStress = 420 + (temp - af) * 6.5; // Clausius-Clapeyron slope ~ 6.5 MPa/K
    const reverseStress = 180 + (temp - af) * 6.5;
    const energyDissipated = Math.round((forwardStress - reverseStress) * (maxStrain / 100) * 1000); // kJ/m³

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Superelastic Flag-Shaped Hysteresis & Seismic Dissipation</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${isSuperelastic ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {isSuperelastic ? 'Superelastic Regime (T > Af)' : 'Shape Memory Effect (T < Mf)'}
              </span>
            </h4>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center">
              <div className="h-44 w-full relative flex items-end border-b border-l border-slate-700 p-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                  {/* Flag-shaped superelastic loop */}
                  <polygon
                    points="0,48 15,30 85,15 95,12 85,25 20,40"
                    fill="rgba(56, 189, 248, 0.25)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                </svg>
                <span className="absolute top-2 left-3 text-xs text-cyan-400 font-mono">Loading Plateau: {forwardStress.toFixed(0)} MPa</span>
                <span className="absolute bottom-6 right-3 text-xs text-amber-400 font-mono">Unloading: {reverseStress.toFixed(0)} MPa</span>
              </div>
              <div className="w-full grid grid-cols-3 gap-3 mt-3 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-slate-400">Energy Dissipated:</span>
                  <div className="text-base font-bold text-cyan-400">{energyDissipated} kJ/m³</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-slate-400">Residual Strain Offset:</span>
                  <div className="text-base font-bold text-emerald-400">0.00% (Self-Centering)</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-slate-400">Post-Quake Drift:</span>
                  <div className="text-base font-bold text-emerald-400">Zero Permanent Offset</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Nitinol Damper Controls</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Ambient Temperature</span>
                <span className="text-cyan-400 font-mono font-bold">{temp}°C</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={temp}
                onChange={(e) => onParamChange('temperature', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Austenite Finish Af = {af}°C</span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Max Seismic Strain Target</span>
                <span className="text-emerald-400 font-mono font-bold">{maxStrain}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={maxStrain}
                onChange={(e) => onParamChange('maxStrainPct', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 5. High Alumina Ceramics (u25rph06-sim05-high-alumina-ceramics) ───
  const alumina = Number(params.aluminaPct ?? 85);
  const compStrength = 1500 + (alumina - 70) * 45; // MPa
  const meltingPoint = 1750 + (alumina - 70) * 10; // °C
  const rFactor = 120 + (alumina - 70) * 3.5; // °C thermal shock tolerance

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm flex justify-between">
            <span>Refractory Ceramic Microstructure & Thermal Shock</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Al2O3 = {alumina}%</span>
          </h4>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center">
            <div className="w-36 h-28 bg-gradient-to-b from-amber-700 via-amber-600 to-amber-900 rounded-lg border-2 border-amber-500 flex flex-col items-center justify-center shadow-lg text-white font-mono text-center">
              <span className="text-sm font-bold">Alumina Brick</span>
              <span className="text-xs text-amber-200">{alumina}% Al₂O₃</span>
              <span className="text-[10px] text-amber-300 mt-1">T_max = {meltingPoint}°C</span>
            </div>
            <div className="w-full grid grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400">Compressive Strength:</span>
                <div className="text-base font-bold text-amber-400">{compStrength.toFixed(0)} MPa</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400">Refractory Softening:</span>
                <div className="text-base font-bold text-cyan-400">{meltingPoint}°C</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400">Thermal Shock R:</span>
                <div className="text-base font-bold text-emerald-400">ΔT &le; {rFactor.toFixed(0)}°C</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm">Ceramic Composition</h4>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Alumina Content (Al2O3)</span>
              <span className="text-amber-400 font-mono font-bold">{alumina}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="99"
              step="1"
              value={alumina}
              onChange={(e) => onParamChange('aluminaPct', parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
