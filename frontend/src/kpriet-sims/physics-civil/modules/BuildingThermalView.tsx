import React, { useState } from 'react';
import type { IPhysicsCivilSimulationMetadata } from '../types';

interface ModuleViewProps {
  simulation: IPhysicsCivilSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  theme: 'light' | 'dark';
}

export const BuildingThermalView: React.FC<ModuleViewProps> = ({
  simulation,
  params,
  onParamChange,
  theme,
}) => {
  const isDark = theme === 'dark';
  const simId = simulation.id;

  // ─── 6. Multi-Layer Wall U-Value (u25rph06-sim06-thermal-insulation-u-value) ───
  if (simId === 'u25rph06-sim06-thermal-insulation-u-value') {
    const brickThickness = Number(params.brickThicknessMM ?? 230); // mm
    const insulThickness = Number(params.insulationThicknessMM ?? 50); // mm
    const plasterThickness = Number(params.plasterThicknessMM ?? 15); // mm
    const insulType = params.insulationType ?? 'Glass Wool';
    const indoorTemp = Number(params.indoorTemp ?? 24);
    const outdoorTemp = Number(params.outdoorTemp ?? 42);

    const kBrick = 0.81; // W/mK
    const kPlaster = 0.72; // W/mK
    const kInsul = insulType === 'Polyurethane Foam (PUF)' ? 0.024 : insulType === 'Aerogel' ? 0.015 : 0.038; // Glass Wool

    const rSi = 0.13;
    const rSe = 0.04;
    const rBrick = (brickThickness * 1e-3) / kBrick;
    const rPlaster = (plasterThickness * 1e-3 * 2) / kPlaster; // inside + outside plaster
    const rInsul = (insulThickness * 1e-3) / kInsul;

    const rTotal = rSi + rBrick + rPlaster + rInsul + rSe;
    const uValue = 1 / rTotal;
    const heatFlux = uValue * (outdoorTemp - indoorTemp); // W/m²
    const isEcbcCompliant = uValue <= 0.40;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Multi-Layer Wall Cross-Section & Temperature Gradient</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${isEcbcCompliant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isEcbcCompliant ? 'ECBC Compliant (U <= 0.40 W/m²K)' : 'Non-Compliant (High Heat Ingress)'}
              </span>
            </h4>

            {/* Interactive Wall Layer Schematic */}
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Exterior: {outdoorTemp}°C</span>
                <span>Interior: {indoorTemp}°C</span>
              </div>
              <div className="w-full h-24 rounded border border-slate-700 flex overflow-hidden">
                <div style={{ width: '10%' }} className="bg-amber-900/60 border-r border-slate-600 flex items-center justify-center text-[10px] text-amber-200">
                  Plaster
                </div>
                <div style={{ width: '45%' }} className="bg-red-950/80 border-r border-slate-600 flex items-center justify-center text-xs text-red-200 font-mono">
                  Brick ({brickThickness}mm)
                </div>
                <div style={{ width: '35%' }} className="bg-yellow-500/30 border-r border-slate-600 flex items-center justify-center text-xs text-yellow-300 font-mono">
                  {insulType} ({insulThickness}mm)
                </div>
                <div style={{ width: '10%' }} className="bg-amber-900/60 flex items-center justify-center text-[10px] text-amber-200">
                  Plaster
                </div>
              </div>
              <div className="text-[11px] text-slate-400 text-center">
                Total R-Value: <span className="text-cyan-400 font-bold font-mono">{rTotal.toFixed(2)} m²·K/W</span> | U-Value: <span className="text-emerald-400 font-bold font-mono">{uValue.toFixed(3)} W/m²·K</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Overall U-Value:</span>
                <div className={`text-lg font-bold font-mono ${isEcbcCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>{uValue.toFixed(3)} W/m²K</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Heat Ingress Flux:</span>
                <div className="text-lg font-bold font-mono text-cyan-400">{heatFlux.toFixed(1)} W/m²</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">HVAC Reduction:</span>
                <div className="text-lg font-bold font-mono text-emerald-400">{((1 - uValue / 2.15) * 100).toFixed(0)}% Saved</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Insulation Specification</h4>
            <div>
              <span className="text-xs text-slate-300 mb-1 block">Insulation Material</span>
              <select
                value={insulType}
                onChange={(e) => onParamChange('insulationType', e.target.value)}
                className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="Glass Wool">Glass Wool (k = 0.038 W/m·K)</option>
                <option value="Polyurethane Foam (PUF)">Polyurethane Foam (k = 0.024 W/m·K)</option>
                <option value="Aerogel">Aerogel Superinsulation (k = 0.015 W/m·K)</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Insulation Thickness</span>
                <span className="text-cyan-400 font-mono font-bold">{insulThickness} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={insulThickness}
                onChange={(e) => onParamChange('insulationThicknessMM', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Outdoor Ambient Temp</span>
                <span className="text-amber-400 font-mono font-bold">{outdoorTemp}°C</span>
              </div>
              <input
                type="range"
                min="30"
                max="48"
                step="1"
                value={outdoorTemp}
                onChange={(e) => onParamChange('outdoorTemp', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 7. Building Heat Gain and Loss (u25rph06-sim07-building-heat-gain-loss) ───
  if (simId === 'u25rph06-sim07-building-heat-gain-loss') {
    const floorArea = Number(params.floorAreaM2 ?? 80);
    const windowArea = Number(params.windowAreaM2 ?? 15);
    const shgc = Number(params.windowSHGC ?? 0.35);
    const occupants = Number(params.occupants ?? 30);
    const outdoorT = Number(params.outdoorTemp ?? 40);
    const indoorT = Number(params.indoorTemp ?? 24);

    const deltaT = outdoorT - indoorT;
    const qWall = 126 * 0.45 * deltaT; // Conduction Watts
    const qWindowCond = windowArea * 2.8 * deltaT;
    const qWindowSolar = windowArea * 650 * shgc; // 650 W/m² peak solar irradiance
    const qOccupants = occupants * 115; // 115 W sensible heat per person
    const qLightsAndEq = floorArea * 18; // 18 W/m² equipment
    const totalWatts = qWall + qWindowCond + qWindowSolar + qOccupants + qLightsAndEq;
    const tonnage = totalWatts / 3517;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Cooling Load Breakdown by Thermal Component</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">Total: {(totalWatts / 1000).toFixed(2)} kW ({tonnage.toFixed(1)} TR)</span>
            </h4>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2.5">
              <div className="text-xs flex justify-between">
                <span>Window Solar Radiation (SHGC = {shgc})</span>
                <span className="text-amber-400 font-mono font-bold">{(qWindowSolar / 1000).toFixed(2)} kW ({((qWindowSolar / totalWatts) * 100).toFixed(0)}%)</span>
              </div>
              <div className="w-full h-3 rounded bg-slate-800 overflow-hidden">
                <div style={{ width: `${(qWindowSolar / totalWatts) * 100}%` }} className="h-full bg-amber-500" />
              </div>

              <div className="text-xs flex justify-between mt-1">
                <span>Occupant Internal Sensible Heat ({occupants} people)</span>
                <span className="text-emerald-400 font-mono font-bold">{(qOccupants / 1000).toFixed(2)} kW ({((qOccupants / totalWatts) * 100).toFixed(0)}%)</span>
              </div>
              <div className="w-full h-3 rounded bg-slate-800 overflow-hidden">
                <div style={{ width: `${(qOccupants / totalWatts) * 100}%` }} className="h-full bg-emerald-500" />
              </div>

              <div className="text-xs flex justify-between mt-1">
                <span>Envelope Conduction (Walls + Glazing)</span>
                <span className="text-cyan-400 font-mono font-bold">{((qWall + qWindowCond) / 1000).toFixed(2)} kW</span>
              </div>
              <div className="w-full h-3 rounded bg-slate-800 overflow-hidden">
                <div style={{ width: `${((qWall + qWindowCond) / totalWatts) * 100}%` }} className="h-full bg-cyan-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Total Sensible Cooling Load:</span>
                <div className="text-xl font-bold font-mono text-cyan-300">{(totalWatts / 1000).toFixed(2)} kW</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Required AC Chiller Sizing:</span>
                <div className="text-xl font-bold font-mono text-amber-400">{tonnage.toFixed(1)} Tons of Refrigeration (TR)</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Room & Glazing Inputs</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Window SHGC (Solar Control)</span>
                <span className="text-cyan-400 font-mono font-bold">{shgc.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.85"
                step="0.05"
                value={shgc}
                onChange={(e) => onParamChange('windowSHGC', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">0.25 (Double Low-E) vs 0.82 (Single Clear)</span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Number of Occupants</span>
                <span className="text-emerald-400 font-mono font-bold">{occupants}</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={occupants}
                onChange={(e) => onParamChange('occupants', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 8. Thermal Mass & Sol-Air Temp (u25rph06-sim08-building-thermal-performance) ───
  if (simId === 'u25rph06-sim08-building-thermal-performance') {
    const orientation = params.orientation ?? 'North-South';
    const surfaceColor = params.surfaceColor ?? 'White High SRI (alpha=0.25)';
    const alpha = surfaceColor.includes('alpha=0.25') ? 0.25 : 0.85;
    const maxSolar = orientation === 'North-South' ? 420 : 780; // W/m² peak
    const peakSolAir = 42 + (alpha * maxSolar) / 20; // 42°C ambient + solar elevation
    const timeLag = 8.0; // hours
    const decrement = 0.24;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>24-Hour Diurnal Sol-Air Thermal Wave Dampening</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Time Lag phi = 8.0 hrs | Decrement mu = 0.24</span>
            </h4>
            <div className="h-44 w-full rounded-lg bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                {/* Outdoor Sol-Air Temperature Wave (high swing) */}
                <path d="M 0,35 Q 25,5 50,25 T 100,25" fill="none" stroke="#f59e0b" strokeWidth="2" />
                {/* Indoor Damped Wave (shifted right by 8 hrs and flattened) */}
                <path d="M 0,30 Q 35,28 70,22 T 100,28" fill="none" stroke="#22d3ee" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400">Outdoor Peak ({peakSolAir.toFixed(1)}°C at 14:00)</span>
                <span className="text-cyan-400">Indoor Peak (28.4°C at 22:00 — Delayed 8 hrs)</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Peak Sol-Air:</span>
                <div className="text-lg font-bold font-mono text-amber-400">{peakSolAir.toFixed(1)}°C</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Thermal Time Lag:</span>
                <div className="text-lg font-bold font-mono text-cyan-400">{timeLag} Hours</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <span className="text-slate-400">Decrement Factor:</span>
                <div className="text-lg font-bold font-mono text-emerald-400">{decrement} (76% Damped)</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Envelope Parameters</h4>
            <div>
              <span className="text-xs text-slate-300 mb-1 block">Building Orientation</span>
              <select
                value={orientation}
                onChange={(e) => onParamChange('orientation', e.target.value)}
                className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="North-South">North-South (Optimal - Minimal Sun)</option>
                <option value="East-West">East-West (High Morning/Evening Sun)</option>
              </select>
            </div>
            <div>
              <span className="text-xs text-slate-300 mb-1 block">Exterior Roof/Wall Coating</span>
              <select
                value={surfaceColor}
                onChange={(e) => onParamChange('surfaceColor', e.target.value)}
                className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="White High SRI (alpha=0.25)">White Cool-Roof Coating (alpha = 0.25)</option>
                <option value="Terracotta Dark (alpha=0.85)">Dark Terracotta Paint (alpha = 0.85)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 9. Central Heating HVAC (u25rph06-sim09-central-heating-hvac) ───
  if (simId === 'u25rph06-sim09-central-heating-hvac') {
    const supplyT = Number(params.boilerSupplyTemp ?? 75);
    const returnT = Number(params.returnTemp ?? 65);
    const roomT = Number(params.roomTemp ?? 21);
    const heatKW = Number(params.requiredHeatKW ?? 12.0);

    const deltaT = Math.max(2, supplyT - returnT);
    const waterFlowKgS = (heatKW * 1000) / (4186 * deltaT);
    const lmtd = ((supplyT - roomT) - (returnT - roomT)) / Math.log((supplyT - roomT) / (returnT - roomT));
    const pipeVel = (waterFlowKgS * 1e-3) / (Math.PI * Math.pow(0.028 / 2, 2));

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm flex justify-between">
              <span>Hydronic Boiler Loop & Radiator Log Mean Delta T</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">Q = ṁ·Cp·ΔT = {heatKW} kW</span>
            </h4>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-red-400 font-bold font-mono">Boiler Supply: {supplyT}°C</span>
                <span className="text-cyan-400 font-mono">Room Setpoint: {roomT}°C (LMTD = {lmtd.toFixed(1)}°C)</span>
                <span className="text-blue-400 font-bold font-mono">Return: {returnT}°C</span>
              </div>
              <div className="w-full h-8 rounded bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 border border-slate-600 flex items-center justify-center text-xs font-mono font-bold text-white shadow">
                Water Mass Flow Rate: {waterFlowKgS.toFixed(3)} kg/s ({((waterFlowKgS / 1000) * 3600).toFixed(2)} m³/hr)
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-slate-400">Radiator LMTD:</span>
                  <div className="text-base font-bold text-amber-400">{lmtd.toFixed(1)} °C</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-slate-400">Pipe Flow Velocity:</span>
                  <div className={`text-base font-bold ${pipeVel <= 1.2 ? 'text-emerald-400' : 'text-rose-400'}`}>{pipeVel.toFixed(2)} m/s</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700">
                  <span className="text-slate-400">Acoustic Status:</span>
                  <div className="text-base font-bold text-slate-200">{pipeVel <= 1.2 ? 'Quiet (<1.2 m/s)' : 'Turbulent Noise'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Boiler Circuit Controls</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Supply Temperature</span>
                <span className="text-red-400 font-mono font-bold">{supplyT}°C</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                step="1"
                value={supplyT}
                onChange={(e) => onParamChange('boilerSupplyTemp', parseFloat(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Required Room Heating</span>
                <span className="text-amber-400 font-mono font-bold">{heatKW} kW</span>
              </div>
              <input
                type="range"
                min="4"
                max="30"
                step="1"
                value={heatKW}
                onChange={(e) => onParamChange('requiredHeatKW', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 10. Natural Ventilation Smoke Tube (u25rph06-sim10-natural-ventilation-smoke-tube) ───
  const h = Number(params.atriumHeightM ?? 15);
  const ventArea = Number(params.ventAreaM2 ?? 3.5);
  const outT = Number(params.outdoorTempC ?? 26);
  const inT = Number(params.indoorTempC ?? 34);

  const deltaTemp = Math.max(1, inT - outT);
  const stackPress = 1.2 * 9.81 * h * (deltaTemp / (inT + 273.15)); // Pa
  const flowRate = 0.62 * ventArea * Math.sqrt((2 * stackPress) / 1.2); // m³/s
  const airVelocity = flowRate / ventArea; // m/s
  const smokeTravelTime = 2.0 / airVelocity; // s for 2m

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm flex justify-between">
            <span>Atrium Thermal Stack Buoyancy & Smoke Tube Test</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">Stack Draft: {stackPress.toFixed(1)} Pa</span>
          </h4>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-3">
            {/* Visual Atrium Stack Simulation */}
            <div className="h-44 w-full rounded border border-slate-800 relative bg-slate-900 flex flex-col justify-between p-3 overflow-hidden">
              <div className="w-full flex justify-between items-center text-xs">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Top Exhaust Vent (H = {h}m)</span>
                <span className="text-amber-400 font-mono">Indoor Warm Air {inT}°C</span>
              </div>
              <div className="w-full h-16 relative flex items-center justify-center border-y border-dashed border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Tracer Smoke Tube Test (2.0 m distance):</span>
                  <div className="px-3 py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold text-xs flex items-center gap-1.5 shadow">
                    <span>💨 Smoke Velocity:</span>
                    <span>{airVelocity.toFixed(2)} m/s (Travel Time: {smokeTravelTime.toFixed(2)} s)</span>
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-between items-center text-xs">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">Low Inlet Vent (Cool Outdoor {outT}°C)</span>
                <span className="text-emerald-400 font-mono font-bold">Total Flow Q = {flowRate.toFixed(2)} m³/s ({Math.round(flowRate * 3600)} m³/h)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400">Thermal Stack Draft:</span>
                <div className="text-base font-bold text-cyan-400">{stackPress.toFixed(1)} Pa</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400">Airflow Velocity:</span>
                <div className="text-base font-bold text-emerald-400">{airVelocity.toFixed(2)} m/s</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400">Smoke Test Time:</span>
                <div className="text-base font-bold text-amber-400">{smokeTravelTime.toFixed(2)} seconds</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-3">
          <h4 className="font-semibold text-sm">Stack & Thermal Inputs</h4>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Atrium Stack Height</span>
              <span className="text-cyan-400 font-mono font-bold">{h} meters</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={h}
              onChange={(e) => onParamChange('atriumHeightM', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Indoor - Outdoor Delta T</span>
              <span className="text-amber-400 font-mono font-bold">{deltaTemp}°C</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={deltaTemp}
              onChange={(e) => onParamChange('indoorTempC', outT + parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
