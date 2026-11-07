import React, { useState } from 'react';
import type { IPhysicsCivilSimulationMetadata } from '../types';

interface ModuleViewProps {
  simulation: IPhysicsCivilSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  theme: 'light' | 'dark';
}

export const BuildingAcousticsView: React.FC<ModuleViewProps> = ({
  simulation,
  params,
  onParamChange,
  theme,
}) => {
  const isDark = theme === 'dark';
  const simId = simulation.id;

  // ─── 16. Decibel Scale & Multi-Source (u25rph06-sim16-sound-decibel-scale) ───
  if (simId === 'u25rph06-sim16-sound-decibel-scale') {
    const s1 = Number(params.source1dB ?? 88);
    const s2 = Number(params.source2dB ?? 85);
    const s3 = Number(params.source3dB ?? 82);
    const dist = Number(params.distanceM ?? 15);

    const totalCombined = 10 * Math.log10(Math.pow(10, s1 / 10) + Math.pow(10, s2 / 10) + Math.pow(10, s3 / 10));
    // Attenuation at distance d compared to 1 meter reference: -20*log10(d)
    const atPerimeter = Math.max(0, totalCombined - 20 * Math.log10(dist / 1.0));
    const limit = 75; // CPCB commercial day limit
    const isExceeded = atPerimeter > limit;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Logarithmic Acoustic Power Summation & Boundary Decay</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${!isExceeded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {atPerimeter.toFixed(1)} dB at {dist}m ({isExceeded ? 'Exceeds CPCB Limit' : 'Within Statutory Limits'})
              </span>
            </h4>

            {/* Visual Acoustic Noise Gauge */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-[11px] text-slate-400">Jackhammer:</span>
                  <div className="text-base font-bold text-amber-400 font-mono">{s1} dB</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-[11px] text-slate-400">Concrete Mixer:</span>
                  <div className="text-base font-bold text-cyan-400 font-mono">{s2} dB</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-[11px] text-slate-400">Diesel Generator:</span>
                  <div className="text-base font-bold text-emerald-400 font-mono">{s3} dB</div>
                </div>
              </div>

              <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden relative border border-slate-700 flex items-center">
                <div
                  className={`h-full transition-all duration-300 ${isExceeded ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (atPerimeter / 100) * 100)}%` }}
                />
                <span className="absolute left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-white drop-shadow">
                  Total Combined Source: {totalCombined.toFixed(1)} dB → Boundary: {atPerimeter.toFixed(1)} dB
                </span>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-mono">
                Log Rule: 88 dB + 85 dB + 82 dB = <span className="text-cyan-300 font-bold">{totalCombined.toFixed(1)} dB</span> (NOT 255 dB!)
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Combined SPL:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{totalCombined.toFixed(1)} dB</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Boundary Distance:</span>
                <div className="text-xl font-bold font-mono text-amber-300">{dist} Meters</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">CPCB Day Limit:</span>
                <div className="text-xl font-bold font-mono text-emerald-400">&le; 75.0 dB</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Site Noise Inputs</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Jackhammer Noise</span>
                <span className="text-amber-400 font-mono font-bold">{s1} dB</span>
              </div>
              <input
                type="range"
                min="70"
                max="105"
                step="1"
                value={s1}
                onChange={(e) => onParamChange('source1dB', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Distance to Resident Perimeter</span>
                <span className="text-cyan-400 font-mono font-bold">{dist} m</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={dist}
                onChange={(e) => onParamChange('distanceM', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 17. Weber-Fechner Sensation (u25rph06-sim17-weber-fechner-loudness) ───
  if (simId === 'u25rph06-sim17-weber-fechner-loudness') {
    const spl = Number(params.stimulusIntensityDB ?? 70);
    const sones = Math.pow(2, (spl - 40) / 10);
    const sensationS = 0.3 * spl; // Weber-Fechner linear sensation index

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Weber-Fechner Logarithmic Sensation & Sone Scaling</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                {sones.toFixed(1)} Sones (Subjective Loudness)
              </span>
            </h4>

            {/* Sone Doubling Visualization */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between">
              <div className="text-xs text-slate-300">
                Rule of Thumb: Every <span className="text-amber-400 font-bold">+10 dB</span> doubles human perceived loudness in Sones.
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl">👂</div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-cyan-400">Physical SPL: {spl} dB</span>
                    <span className="text-amber-400">Sensation: {sones.toFixed(2)} Sones</span>
                  </div>
                  <div className="w-full h-4 rounded bg-slate-800 overflow-hidden">
                    <div style={{ width: `${Math.min(100, (sones / 16) * 100)}%` }} className="h-full bg-cyan-400 transition-all" />
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono text-center">
                40 dB = 1 Sone | 50 dB = 2 Sones | 60 dB = 4 Sones | 70 dB = 8 Sones | 80 dB = 16 Sones
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Physical Decibels:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{spl} dB</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Perceived Loudness:</span>
                <div className="text-xl font-bold font-mono text-amber-300">{sones.toFixed(1)} Sones</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Half-Loudness Target:</span>
                <div className="text-xl font-bold font-mono text-emerald-400">{spl - 10} dB (-10 dB)</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Physical Level</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Sound Pressure Level (SPL)</span>
                <span className="text-cyan-400 font-mono font-bold">{spl} dB</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                step="1"
                value={spl}
                onChange={(e) => onParamChange('stimulusIntensityDB', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 18. Sabine’s Reverberation Time (u25rph06-sim18-sabine-reverberation-time) ───
  if (simId === 'u25rph06-sim18-sabine-reverberation-time') {
    const vol = Number(params.roomVolumeM3 ?? 1200);
    const addedPanels = Number(params.panelAreaAddedM2 ?? 80);
    const panelAlpha = Number(params.panelAbsorptionCoeff ?? 0.75);

    const baseAbsorption = 85; // sabins from bare masonry & concrete
    const addedAbsorption = addedPanels * panelAlpha;
    const totalA = baseAbsorption + addedAbsorption;
    const rt60 = (0.161 * vol) / totalA;
    const isSpeechOptimal = rt60 >= 0.85 && rt60 <= 1.15;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Auditorium Acoustic Decay & Sabine's Formula</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${isSpeechOptimal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                RT60 = {rt60.toFixed(2)} s ({isSpeechOptimal ? 'Optimal for Lectures' : rt60 > 1.2 ? 'Excessive Echo' : 'Too Dead'})
              </span>
            </h4>

            {/* Sound Decay Curve */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-3 relative flex flex-col justify-between">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                {/* 60 dB Decay Line */}
                <path d={`M 0,2 Q ${rt60 * 20},30 100,38`} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="0" y1="38" x2="100" y2="38" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" />
              </svg>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400">Source Cut-Off (0 dB drop)</span>
                <span className="text-amber-400">-60 dB Decay Point: {rt60.toFixed(2)} seconds</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Reverberation RT60:</span>
                <div className={`text-xl font-bold font-mono ${isSpeechOptimal ? 'text-emerald-400' : 'text-amber-300'}`}>{rt60.toFixed(2)} s</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Total Absorption:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{totalA.toFixed(0)} Metric Sabins</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Target Range (Speech):</span>
                <div className="text-xl font-bold font-mono text-emerald-400">0.85 – 1.10 s</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Room & Panel Treatment</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Acoustic Panels Area Added</span>
                <span className="text-cyan-400 font-mono font-bold">{addedPanels} m²</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="10"
                value={addedPanels}
                onChange={(e) => onParamChange('panelAreaAddedM2', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Panel Absorption Coefficient (α)</span>
                <span className="text-amber-400 font-mono font-bold">{panelAlpha}</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.95"
                step="0.05"
                value={panelAlpha}
                onChange={(e) => onParamChange('panelAbsorptionCoeff', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 19. Absorption Coefficient & Remedies (u25rph06-sim19-absorption-coefficient-remedies) ───
  if (simId === 'u25rph06-sim19-absorption-coefficient-remedies') {
    const mat = params.materialType ?? 'Perforated Acoustic Gypsum';
    const defect = params.roomDefect ?? 'Flutter Echo';
    const alpha = mat.includes('Gypsum') ? 0.72 : mat.includes('Fiberglass') ? 0.88 : 0.08;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Architectural Acoustic Defect Diagnostics & Remedies</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">{defect} Solution</span>
            </h4>

            {/* Room Defect Schematic */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-4 flex flex-col items-center justify-center">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded border-2 border-dashed border-rose-500 flex flex-col items-center justify-center p-2 text-center text-rose-300 text-xs">
                  <span className="font-bold">Defect:</span>
                  <span>{defect}</span>
                </div>
                <span className="text-2xl text-slate-500">➔</span>
                <div className="w-28 h-24 rounded border-2 border-emerald-500 bg-slate-900 flex flex-col items-center justify-center p-2 text-center text-emerald-300 text-xs">
                  <span className="font-bold">Remedy:</span>
                  <span>{defect === 'Flutter Echo' ? 'Convex Diffuser Splays' : 'Helmholtz Resonator'}</span>
                  <span className="text-[10px] text-slate-400 mt-1">α = {alpha}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Material Alpha:</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{alpha.toFixed(2)}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Defect Resolution:</span>
                <div className="text-xl font-bold font-mono text-emerald-400">100% Cured</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Testing Standard:</span>
                <div className="text-xl font-bold font-mono text-amber-300">ISO 354 Chamber</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Acoustic Diagnostics</h4>
            <div>
              <span className="text-xs text-slate-300 mb-1 block">Acoustic Material</span>
              <select
                value={mat}
                onChange={(e) => onParamChange('materialType', e.target.value)}
                className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="Perforated Acoustic Gypsum">Perforated Gypsum (α = 0.72)</option>
                <option value="Fiberglass Fabric Panel">Fiberglass Panel (α = 0.88)</option>
                <option value="Bare Concrete Wall">Bare Concrete Wall (α = 0.08)</option>
              </select>
            </div>
            <div>
              <span className="text-xs text-slate-300 mb-1 block">Diagnosed Room Defect</span>
              <select
                value={defect}
                onChange={(e) => onParamChange('roomDefect', e.target.value)}
                className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="Flutter Echo">Flutter Echo (Parallel bare walls)</option>
                <option value="Domed Ceiling Focal Point">Domed Ceiling Focal Point</option>
                <option value="Acoustic Shadow">Acoustic Shadow (Deep balcony)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 20. Sound Insulation & STC (u25rph06-sim20-sound-transmission-loss-stc) ───
  const partType = params.partitionType ?? 'Cavity Double Wall with Rockwool';
  const mass = Number(params.surfaceMassKgM2 ?? 45);
  const freq = Number(params.frequencyHz ?? 500);

  const massLawTL = 20 * Math.log10(mass * freq) - 47.2;
  const isCavity = partType.includes('Cavity');
  const actualTL = isCavity ? massLawTL + 14 : massLawTL; // cavity decoupling bonus
  const stc = isCavity ? 54 : 36;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm flex justify-between">
            <span>Acoustic Mass Law & Sound Transmission Class (STC)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              Rating: STC {stc} ({stc >= 50 ? 'Hotel Luxury Partition' : 'Standard Drywall'})
            </span>
          </h4>

          {/* Wall Transmission Loss Graphic */}
          <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-4 flex items-center justify-between">
            <div className="flex flex-col items-center">
              <span className="text-xs text-rose-400 font-bold font-mono">Source Room</span>
              <span className="text-2xl font-bold text-slate-100 font-mono">90 dB</span>
            </div>
            <div className="h-32 w-12 rounded bg-slate-700 border-2 border-slate-500 flex flex-col items-center justify-center text-center p-1 text-[10px] text-cyan-300 font-mono">
              <span>{isCavity ? 'Cavity Wall' : 'Solid Wall'}</span>
              <span className="mt-1 font-bold">TL = {actualTL.toFixed(0)} dB</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-emerald-400 font-bold font-mono">Receiving Room</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">{(90 - actualTL).toFixed(0)} dB</span>
              <span className="text-[10px] text-slate-400">Whisper Quiet</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Transmission Loss at {freq} Hz:</span>
              <div className="text-xl font-bold font-mono text-cyan-400">{actualTL.toFixed(1)} dB</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Overall STC Rating:</span>
              <div className="text-xl font-bold font-mono text-emerald-400">STC {stc}</div>
            </div>
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400">Mass Law Base TL:</span>
              <div className="text-xl font-bold font-mono text-amber-300">{massLawTL.toFixed(1)} dB</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm">Partition Specs</h4>
          <div>
            <span className="text-xs text-slate-300 mb-1 block">Wall Construction</span>
            <select
              value={partType}
              onChange={(e) => onParamChange('partitionType', e.target.value)}
              className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
            >
              <option value="Cavity Double Wall with Rockwool">Staggered Double Stud with Rockwool (STC 54)</option>
              <option value="Single Solid Drywall">Single Solid Drywall (STC 36)</option>
            </select>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Test Frequency</span>
              <span className="text-cyan-400 font-mono font-bold">{freq} Hz</span>
            </div>
            <input
              type="range"
              min="125"
              max="4000"
              step="125"
              value={freq}
              onChange={(e) => onParamChange('frequencyHz', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
