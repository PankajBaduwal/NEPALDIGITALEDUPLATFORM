import React, { useState } from 'react';
import type { IPhysicsCivilSimulationMetadata } from '../types';

interface ModuleViewProps {
  simulation: IPhysicsCivilSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  theme: 'light' | 'dark';
}

export const LightingDesignView: React.FC<ModuleViewProps> = ({
  simulation,
  params,
  onParamChange,
  theme,
}) => {
  const isDark = theme === 'dark';
  const simId = simulation.id;

  // ─── 11. Photometry Laws (u25rph06-sim11-photometry-laws) ───
  if (simId === 'u25rph06-sim11-photometry-laws') {
    const intensity = Number(params.luminousIntensityCd ?? 2400); // cd
    const dist = Number(params.distanceM ?? 4.0); // m
    const angle = Number(params.angleDeg ?? 30); // deg

    const rad = (angle * Math.PI) / 180;
    const cosTheta = Math.cos(rad);
    const lux = (intensity * cosTheta) / (dist * dist);

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Photometer Bench: Inverse Square & Lambert's Cosine Law</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">E = (I·cosθ) / d²</span>
            </h4>

            {/* Visual Optical Ray Diagram */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-3 relative flex items-center justify-between overflow-hidden">
              {/* Point light source */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-10 h-10 rounded-full bg-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.8)] flex items-center justify-center font-bold text-slate-950 text-xs">
                  💡
                </div>
                <span className="text-[11px] font-mono text-amber-300">{intensity} cd</span>
              </div>

              {/* Light beam ray */}
              <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-400 via-amber-400/50 to-amber-400/20 mx-4 relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-mono">
                  Distance d = {dist} m
                </span>
              </div>

              {/* Tilted target detector */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div
                  className="w-4 h-16 bg-cyan-500 rounded border border-cyan-300 shadow-md transition-transform"
                  style={{ transform: `rotate(${angle}deg)` }}
                />
                <span className="text-[11px] font-mono text-cyan-300">θ = {angle}°</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Surface Illuminance:</span>
                <div className="text-xl font-bold font-mono text-amber-400">{lux.toFixed(1)} Lux</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Cosine Factor cos(θ):</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{cosTheta.toFixed(3)}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Inverse Square Factor:</span>
                <div className="text-xl font-bold font-mono text-emerald-400">1/d² = {(1 / (dist * dist)).toFixed(4)}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Photometric Controls</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Luminous Intensity (I)</span>
                <span className="text-amber-400 font-mono font-bold">{intensity} cd</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={intensity}
                onChange={(e) => onParamChange('luminousIntensityCd', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Distance to Surface (d)</span>
                <span className="text-cyan-400 font-mono font-bold">{dist} m</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={dist}
                onChange={(e) => onParamChange('distanceM', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Incidence Angle (θ)</span>
                <span className="text-emerald-400 font-mono font-bold">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="75"
                step="5"
                value={angle}
                onChange={(e) => onParamChange('angleDeg', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 12. Vision & Luminous Efficiency (u25rph06-sim12-vision-luminous-efficiency) ───
  if (simId === 'u25rph06-sim12-vision-luminous-efficiency') {
    const regime = params.visionRegime ?? 'Photopic (Daylight > 3 cd/m²)';
    const wavelength = Number(params.wavelengthNM ?? 555);
    const isPhotopic = regime.includes('Photopic');

    // Approximate CIE V(lambda) bell curve centered at 555 nm vs 507 nm
    const peak = isPhotopic ? 555 : 507;
    const width = isPhotopic ? 45 : 42;
    const vLambda = Math.max(0, Math.exp(-Math.pow((wavelength - peak) / width, 2)));
    const maxLumens = isPhotopic ? 683 : 1700;
    const luminousFlux = vLambda * maxLumens;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>CIE Spectral Luminous Efficiency Function V(λ)</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${isPhotopic ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                {isPhotopic ? 'Cone Vision Peak: 555 nm (Green-Yellow)' : 'Rod Vision Peak: 507 nm (Cyan Purkinje Shift)'}
              </span>
            </h4>

            {/* CIE Curves Plot */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-3 relative flex flex-col justify-between">
              <svg className="w-full h-32 overflow-visible" viewBox="380 0 400 1" preserveAspectRatio="none">
                {/* Photopic Curve */}
                <path
                  d="M 380,1 Q 480,0.9 555,0 T 780,1"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2.5"
                />
                {/* Scotopic Curve */}
                <path
                  d="M 380,1 Q 450,0.85 507,0 T 780,1"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="3,2"
                />
              </svg>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400">Scotopic V'(λ) 507 nm</span>
                <span className="text-amber-400">Photopic V(λ) 555 nm</span>
                <span className="text-slate-400">Current λ: {wavelength} nm (V = {vLambda.toFixed(3)})</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">CIE Efficiency V(λ):</span>
                <div className="text-lg font-bold font-mono text-cyan-400">{vLambda.toFixed(3)}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Luminous Efficacy:</span>
                <div className="text-lg font-bold font-mono text-emerald-400">{luminousFlux.toFixed(0)} lm/W</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Visual Perception:</span>
                <div className="text-lg font-bold font-mono text-amber-300">{vLambda > 0.7 ? 'High Acuity' : vLambda > 0.2 ? 'Moderate' : 'Low Sensitivity'}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Vision & Spectral Input</h4>
            <div>
              <span className="text-xs text-slate-300 mb-1 block">Lighting Regime</span>
              <select
                value={regime}
                onChange={(e) => onParamChange('visionRegime', e.target.value)}
                className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="Photopic (Daylight > 3 cd/m²)">Photopic (Daylight Cones)</option>
                <option value="Scotopic (Night < 0.01 cd/m²)">Scotopic (Night Rods)</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Light Wavelength (λ)</span>
                <span className="text-amber-400 font-mono font-bold">{wavelength} nm</span>
              </div>
              <input
                type="range"
                min="380"
                max="750"
                step="5"
                value={wavelength}
                onChange={(e) => onParamChange('wavelengthNM', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 13. Glare & UGR (u25rph06-sim13-glare-ugr-color) ───
  if (simId === 'u25rph06-sim13-glare-ugr-color') {
    const lumLuminance = Number(params.luminaireLuminanceCdM2 ?? 4500);
    const bgLuminance = Number(params.backgroundLuminanceCdM2 ?? 80);
    const solidAngle = 0.05; // steradians
    const posIndex = 1.2;

    const ugr = 8 * Math.log10((0.25 / bgLuminance) * ((Math.pow(lumLuminance, 2) * solidAngle) / Math.pow(posIndex, 2)));
    const comfortGrade = ugr <= 16 ? 'Excellent (CAD Drawing)' : ugr <= 19 ? 'Compliant (Office / Class)' : ugr <= 22 ? 'Moderate Glare' : 'Severe Glare Violation';

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Unified Glare Rating (UGR) Analysis for Visual Comfort</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${ugr <= 19 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                UGR = {ugr.toFixed(1)} ({comfortGrade})
              </span>
            </h4>

            {/* Visual Glare Field */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div
                className="rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-2xl"
                style={{
                  width: `${Math.min(180, 50 + lumLuminance / 40)}px`,
                  height: `${Math.min(180, 50 + lumLuminance / 40)}px`,
                  background: `radial-gradient(circle, #ffffff 0%, rgba(253, 224, 71, 0.8) 40%, transparent 80%)`,
                }}
              >
                <span className="text-slate-900 font-mono text-[11px] px-2 py-0.5 rounded bg-white/80">{lumLuminance} cd/m²</span>
              </div>
              <span className="absolute bottom-2 text-xs text-slate-400 font-mono">
                Background Luminance L_b = {bgLuminance} cd/m²
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">UGR Glare Score:</span>
                <div className={`text-xl font-bold font-mono ${ugr <= 19 ? 'text-emerald-400' : 'text-rose-400'}`}>{ugr.toFixed(1)}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">IS 3646 Max Limit:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">&le; 19.0 (Classrooms)</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Luminance Contrast:</span>
                <div className="text-xl font-bold font-mono text-amber-300">{(lumLuminance / bgLuminance).toFixed(0)} : 1</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Luminance Controls</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Luminaire Surface Luminance</span>
                <span className="text-amber-400 font-mono font-bold">{lumLuminance} cd/m²</span>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="200"
                value={lumLuminance}
                onChange={(e) => onParamChange('luminaireLuminanceCdM2', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Background Wall Luminance</span>
                <span className="text-cyan-400 font-mono font-bold">{bgLuminance} cd/m²</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="10"
                value={bgLuminance}
                onChange={(e) => onParamChange('backgroundLuminanceCdM2', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 14. Daylight Factor (u25rph06-sim14-daylight-factor-windows) ───
  if (simId === 'u25rph06-sim14-daylight-factor-windows') {
    const winH = Number(params.windowHeightM ?? 1.8);
    const winW = Number(params.windowWidthM ?? 3.5);
    const roomDepth = Number(params.roomDepthM ?? 7.0);
    const obstructionAngle = Number(params.obstructionAngleDeg ?? 18);

    const winArea = winH * winW;
    const sc = Math.max(0.5, (winArea / (roomDepth * 4.0)) * 6.5 * Math.cos((obstructionAngle * Math.PI) / 180));
    const irc = 0.85; // internal reflected component
    const totalDF = sc + irc;
    const isLeedCompliant = totalDF >= 2.0;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Daylight Factor Penetration across Room Depth</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${isLeedCompliant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isLeedCompliant ? 'LEED / IGBC Compliant (DF >= 2.0%)' : 'Insufficient Daylight (< 2.0%)'}
              </span>
            </h4>

            {/* Room cross-section daylight ray */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Window Glazing: {winW}m x {winH}m</span>
                <span>Room Depth: {roomDepth}m</span>
              </div>
              <div className="w-full h-24 relative flex items-center border-b border-slate-700">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Sky Component Ray Polygon */}
                  <polygon points="0,5 0,35 100,40 100,20" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.5" />
                </svg>
                <span className="absolute left-2 top-2 text-xs text-cyan-300 font-mono">Near Window: {(totalDF * 2.2).toFixed(1)}%</span>
                <span className="absolute right-4 bottom-2 text-xs text-amber-300 font-mono">Rear Desk: {totalDF.toFixed(2)}%</span>
              </div>
              <div className="text-[11px] text-slate-400 text-center font-mono">
                Sky Component: <span className="text-cyan-400">{sc.toFixed(2)}%</span> | Internal Reflected: <span className="text-emerald-400">{irc.toFixed(2)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Total Daylight Factor:</span>
                <div className={`text-xl font-bold font-mono ${isLeedCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>{totalDF.toFixed(2)}%</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Window Area:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{winArea.toFixed(1)} m²</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Working Plane Lux (5000 ext):</span>
                <div className="text-xl font-bold font-mono text-amber-300">{(totalDF * 50).toFixed(0)} Lux</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Window Geometry</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Window Height</span>
                <span className="text-cyan-400 font-mono font-bold">{winH} m</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.8"
                step="0.1"
                value={winH}
                onChange={(e) => onParamChange('windowHeightM', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Adjacent Obstruction Angle</span>
                <span className="text-amber-400 font-mono font-bold">{obstructionAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={obstructionAngle}
                onChange={(e) => onParamChange('obstructionAngleDeg', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 15. Lumen Method (u25rph06-sim15-artificial-lighting-lumen-method) ───
  const roomL = Number(params.roomLengthM ?? 16);
  const roomW = Number(params.roomWidthM ?? 10);
  const targetLux = Number(params.targetLux ?? 500);
  const lumens = Number(params.luminaireLumens ?? 4200);
  const mf = Number(params.maintenanceFactor ?? 0.80);

  const roomArea = roomL * roomW;
  const hrc = 4.0 - 0.85; // 3.15 m cavity
  const rcr = (5 * hrc * (roomL + roomW)) / (roomL * roomW);
  const uf = 0.58; // Utilization factor
  const totalLumensNeeded = (targetLux * roomArea) / (uf * mf);
  const numFittings = Math.ceil(totalLumensNeeded / lumens);
  const powerDensity = ((numFittings * 45) / roomArea).toFixed(1);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm flex justify-between">
            <span>Lumen Method Luminaire Layout & Lux Grid</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              N = {numFittings} Fittings (6 x 4 Grid)
            </span>
          </h4>

          {/* Grid Layout Plan */}
          <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-4 flex flex-col items-center justify-center">
            <div className="grid grid-cols-6 gap-3 p-3 bg-slate-900 rounded border border-slate-700">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-7 h-5 rounded bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.6)] flex items-center justify-center text-[9px] font-bold text-slate-950">
                  LED
                </div>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Spacing SHR = 1.05 &le; 1.25 (Uniform Illumination Compliant)
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Total Fittings Needed:</span>
              <div className="text-xl font-bold font-mono text-emerald-400">{numFittings} Luminaires</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Lighting Power Density:</span>
              <div className="text-xl font-bold font-mono text-cyan-400">{powerDensity} W/m² (ECBC OK)</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Room Cavity Ratio (RCR):</span>
              <div className="text-xl font-bold font-mono text-amber-300">{rcr.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm">Design Target Inputs</h4>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Required Task Lux</span>
              <span className="text-amber-400 font-mono font-bold">{targetLux} Lux</span>
            </div>
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={targetLux}
              onChange={(e) => onParamChange('targetLux', parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Maintenance Factor (MF)</span>
              <span className="text-cyan-400 font-mono font-bold">{mf}</span>
            </div>
            <input
              type="range"
              min="0.70"
              max="0.90"
              step="0.05"
              value={mf}
              onChange={(e) => onParamChange('maintenanceFactor', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
