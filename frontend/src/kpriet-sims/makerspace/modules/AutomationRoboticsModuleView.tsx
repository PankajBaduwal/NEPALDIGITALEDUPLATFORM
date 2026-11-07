import React, { useState } from 'react';
import type { IMakerspaceSimulationMetadata } from '../types';
import { Cpu, Zap, Activity, AlertTriangle, Play, RefreshCw, CheckCircle, Navigation } from 'lucide-react';

interface Props {
  meta: IMakerspaceSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  isDark: boolean;
}

export const AutomationRoboticsModuleView: React.FC<Props> = ({ meta, params, onParamChange, isDark }) => {
  const simId = meta.id;

  // ─────────────────────────────────────────────────────────────
  // 1. MECHATRONICS SYSTEM EXPLORER
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim07-mechatronics-explorer') {
    const setpointValue = params.setpointValue ?? 65;
    const kpGain = params.kpGain ?? 2.4;
    const kiGain = params.kiGain ?? 0.8;
    const disturbanceLoad = params.disturbanceLoad ?? 0;

    // Dynamic response calculation
    const calculatedProcessValue = Math.min(
      100,
      Math.max(0, setpointValue * (1 - 0.05 / Math.max(0.5, kpGain)) - disturbanceLoad * 1.5)
    );
    const calculatedError = Math.round((setpointValue - calculatedProcessValue) * 10) / 10;
    const controlEffortPercent = Math.min(100, Math.round(calculatedError * kpGain * 4 + 40));

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Header */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">Mechatronics Feedback Loop</span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Closed-Loop PID Control: Sensor Feedback → Error Calculation → Actuator Correction
            </span>
          </div>
          <button
            onClick={() => onParamChange('disturbanceLoad', disturbanceLoad > 0 ? 0 : 15)}
            className={`px-3 py-1 rounded-lg border font-bold text-xs cursor-pointer ${
              disturbanceLoad > 0 ? 'bg-amber-600 text-white border-amber-500' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {disturbanceLoad > 0 ? 'Clear Disturbance' : 'Inject Load Disturbance'}
          </button>
        </div>

        {/* 5-Stage Architecture Flow Banner */}
        <div className={`p-3 rounded-xl border grid grid-cols-5 gap-2 text-center text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="font-bold text-blue-500 block text-[10px] uppercase">1. Sensor</span>
            <span className="text-[11px]">Ultrasonic Transducer</span>
          </div>
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <span className="font-bold text-indigo-500 block text-[10px] uppercase">2. Controller</span>
            <span className="text-[11px]">Microcontroller PID</span>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span className="font-bold text-purple-500 block text-[10px] uppercase">3. Driver</span>
            <span className="text-[11px]">H-Bridge MOSFET</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="font-bold text-amber-500 block text-[10px] uppercase">4. Actuator</span>
            <span className="text-[11px]">Solenoid / Valve</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="font-bold text-emerald-500 block text-[10px] uppercase">5. Process Plant</span>
            <span className="text-[11px]">Liquid Reservoir</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Controller Setpoint & PID Tuning
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Target Setpoint ($r(t)$):</span>
                    <span className="font-bold text-indigo-500">{setpointValue}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={90}
                    value={setpointValue}
                    onChange={(e) => onParamChange('setpointValue', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Proportional Gain ($K_p$):</span>
                    <span className="font-bold text-indigo-500">{kpGain}</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={5.0}
                    step={0.1}
                    value={kpGain}
                    onChange={(e) => onParamChange('kpGain', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Integral Gain ($K_i$):</span>
                    <span className="font-bold text-indigo-500">{kiGain}</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.0}
                    step={0.1}
                    value={kiGain}
                    onChange={(e) => onParamChange('kiGain', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Readout Card */}
            <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Process Value ($y(t)$)</span>
                <span className="text-base font-bold text-emerald-400">{Math.round(calculatedProcessValue)}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Error ($e(t)$)</span>
                <span className={`text-base font-bold ${Math.abs(calculatedError) > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {calculatedError}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Actuator Output Effort</span>
                <span className="text-sm font-bold text-indigo-400">{controlEffortPercent}% PWM</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Disturbance Level</span>
                <span className="text-sm font-bold text-amber-400">{disturbanceLoad}% Load</span>
              </div>
            </div>
          </div>

          {/* Plant Response Visualizer */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Liquid Level Plant Response & Feedback Waveform
            </span>

            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
                {/* Tank Outline */}
                <rect x="80" y="30" width="120" height="150" fill="none" stroke="#475569" strokeWidth="3" rx="4" />

                {/* Liquid Level */}
                <rect
                  x="83"
                  y={180 - calculatedProcessValue * 1.45}
                  width="114"
                  height={calculatedProcessValue * 1.45}
                  fill="#38bdf8"
                  opacity="0.65"
                  rx="2"
                />

                {/* Setpoint Dashed Line */}
                <line
                  x1="70"
                  y1={180 - setpointValue * 1.45}
                  x2="210"
                  y2={180 - setpointValue * 1.45}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <text x="65" y={184 - setpointValue * 1.45} fill="#f59e0b" fontSize="10" textAnchor="end" fontWeight="bold">
                  SP {setpointValue}%
                </text>

                {/* Step response chart on right */}
                <g transform="translate(250, 40)">
                  <rect x="0" y="0" width="180" height="130" fill={isDark ? '#090d16' : '#ffffff'} stroke="#334155" strokeWidth="1" />
                  {/* Grid */}
                  <line x1="0" y1="65" x2="180" y2="65" stroke="#1e293b" strokeDasharray="2 2" />
                  {/* Response curve */}
                  <path
                    d={`M 10 120 Q 40 ${120 - setpointValue * 1.25 * (kpGain > 3 ? 1.2 : 0.95)} 80 ${120 - calculatedProcessValue} T 170 ${120 - calculatedProcessValue}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                  <line x1="0" y1={120 - setpointValue} x2="180" y2={120 - setpointValue} stroke="#f59e0b" strokeDasharray="3 3" />
                  <text x="10" y="15" fill="#94a3b8" fontSize="9">Step Response (t)</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. INDUSTRIAL ROBOT WORKSPACE
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim08-industrial-robotics') {
    const thetaBaseDeg = params.thetaBaseDeg ?? 45;
    const thetaShoulderDeg = params.thetaShoulderDeg ?? -30;
    const thetaElbowDeg = params.thetaElbowDeg ?? 60;
    const gripperState = params.gripperState ?? 'open';
    const _payloadKg = params.payloadKg ?? 2.5;

    // Forward Kinematics approximations
    const endEffectorX = Math.round(200 * Math.cos((thetaBaseDeg * Math.PI) / 180) + 120 * Math.cos(((thetaBaseDeg + thetaElbowDeg) * Math.PI) / 180));
    const endEffectorY = Math.round(200 * Math.sin((thetaBaseDeg * Math.PI) / 180) + 120 * Math.sin(((thetaBaseDeg + thetaElbowDeg) * Math.PI) / 180));
    const endEffectorZ = Math.round(180 + 150 * Math.sin((-thetaShoulderDeg * Math.PI) / 180) - 100 * Math.cos((thetaElbowDeg * Math.PI) / 180));

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Safety Warning */}
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-500 block mb-0.5 uppercase tracking-wide">
              Robot Cell Safety Envelope (ISO 10218)
            </span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              Industrial articulated robots operate with powerful high-speed servomotors. Real robot cells require physical perimeter interlocked light curtains and emergency stop pushbuttons.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Kinematic Joint Angle Controls
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Base Yaw ($\theta_1$):</span>
                    <span className="font-bold text-indigo-500">{thetaBaseDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={-90}
                    max={90}
                    value={thetaBaseDeg}
                    onChange={(e) => onParamChange('thetaBaseDeg', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Shoulder Pitch ($\theta_2$):</span>
                    <span className="font-bold text-indigo-500">{thetaShoulderDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={60}
                    value={thetaShoulderDeg}
                    onChange={(e) => onParamChange('thetaShoulderDeg', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Elbow Pitch ($\theta_3$):</span>
                    <span className="font-bold text-indigo-500">{thetaElbowDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    value={thetaElbowDeg}
                    onChange={(e) => onParamChange('thetaElbowDeg', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span>Gripper End-Effector:</span>
                  <button
                    onClick={() => onParamChange('gripperState', gripperState === 'open' ? 'clamped' : 'open')}
                    className={`px-3 py-1 rounded-lg border font-bold text-xs ${
                      gripperState === 'clamped' ? 'bg-emerald-600 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {gripperState === 'clamped' ? 'Clamped (Holding Billet)' : 'Open (Released)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Cartesian Forward Kinematics Readout */}
            <div className={`p-4 rounded-xl border grid grid-cols-3 gap-2 text-xs text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">X Coordinate</span>
                <span className="text-base font-bold text-indigo-400">{endEffectorX} mm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Y Coordinate</span>
                <span className="text-base font-bold text-indigo-400">{endEffectorY} mm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Z Height</span>
                <span className="text-base font-bold text-indigo-400">{endEffectorZ} mm</span>
              </div>
            </div>
          </div>

          {/* Robot Arm Visualizer */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2D Planar Kinematic Linkage Diagram
              </span>
              <span className="text-xs font-bold text-emerald-500">Working Envelope: Normal</span>
            </div>

            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 460 240" className="w-full h-full max-h-[280px]">
                {/* Robot Pedestal */}
                <rect x="200" y="190" width="60" height="25" fill="#334155" rx="3" />
                <circle cx="230" cy="190" r="14" fill="#64748b" />

                {/* Link 1 (Shoulder) */}
                <line
                  x1="230"
                  y1="190"
                  x2={230 + 90 * Math.sin((thetaShoulderDeg * Math.PI) / 180)}
                  y2={190 - 90 * Math.cos((thetaShoulderDeg * Math.PI) / 180)}
                  stroke="#3b82f6"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                {/* Elbow Joint */}
                <circle
                  cx={230 + 90 * Math.sin((thetaShoulderDeg * Math.PI) / 180)}
                  cy={190 - 90 * Math.cos((thetaShoulderDeg * Math.PI) / 180)}
                  r="10"
                  fill="#f59e0b"
                />

                {/* Link 2 (Forearm) */}
                <line
                  x1={230 + 90 * Math.sin((thetaShoulderDeg * Math.PI) / 180)}
                  y1={190 - 90 * Math.cos((thetaShoulderDeg * Math.PI) / 180)}
                  x2={
                    230 +
                    90 * Math.sin((thetaShoulderDeg * Math.PI) / 180) +
                    75 * Math.sin(((thetaShoulderDeg + thetaElbowDeg) * Math.PI) / 180)
                  }
                  y2={
                    190 -
                    90 * Math.cos((thetaShoulderDeg * Math.PI) / 180) -
                    75 * Math.cos(((thetaShoulderDeg + thetaElbowDeg) * Math.PI) / 180)
                  }
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeLinecap="round"
                />

                {/* End-Effector Gripper */}
                <circle
                  cx={
                    230 +
                    90 * Math.sin((thetaShoulderDeg * Math.PI) / 180) +
                    75 * Math.sin(((thetaShoulderDeg + thetaElbowDeg) * Math.PI) / 180)
                  }
                  y2={
                    190 -
                    90 * Math.cos((thetaShoulderDeg * Math.PI) / 180) -
                    75 * Math.cos(((thetaShoulderDeg + thetaElbowDeg) * Math.PI) / 180)
                  }
                  r="7"
                  fill={gripperState === 'clamped' ? '#ef4444' : '#94a3b8'}
                />

                {/* Safety Boundary Arc */}
                <path d="M 50 190 A 180 180 0 0 1 410 190" fill="none" stroke="#eab308" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="230" y="25" fill="#eab308" fontSize="10" textAnchor="middle" fontWeight="bold">
                  MAX WORKSPACE ENVELOPE (R = 750 mm)
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. AUTOMOBILE PERFORMANCE MEASURES
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim09-automobile-performance') {
    const vehicleMassKg = params.vehicleMassKg ?? 1450;
    const enginePowerKw = params.enginePowerKw ?? 110;
    const dragCoefficientCd = params.dragCoefficientCd ?? 0.31;
    const roadGradePercent = params.roadGradePercent ?? 0;

    // Physical calculations
    const rollingResistanceForce = Math.round(vehicleMassKg * 9.81 * 0.012);
    const gradeForce = Math.round(vehicleMassKg * 9.81 * (roadGradePercent / 100));
    const topSpeedKmh = Math.round(Math.pow((2 * enginePowerKw * 1000 * 0.88) / (1.225 * dragCoefficientCd * 2.2), 1 / 3) * 3.6);
    const zeroToHundredSec = Math.round(((vehicleMassKg * 27.78 * 27.78) / (2 * enginePowerKw * 1000 * 0.85) + 3.2) * 10) / 10;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Header */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">Automotive Dynamics</span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              {'Tractive Force vs Road Resistance ($F_{total} = F_{roll} + F_{aero} + F_{grade}$)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Vehicle Physical Specifications
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Vehicle Curb Mass ($m$):</span>
                    <span className="font-bold text-indigo-500">{vehicleMassKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min={900}
                    max={2500}
                    step={50}
                    value={vehicleMassKg}
                    onChange={(e) => onParamChange('vehicleMassKg', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Engine Power ($P$):</span>
                    <span className="font-bold text-indigo-500">{enginePowerKw} kW ({Math.round(enginePowerKw * 1.341)} HP)</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={220}
                    step={5}
                    value={enginePowerKw}
                    onChange={(e) => onParamChange('enginePowerKw', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Aerodynamic Drag ($C_d$):</span>
                    <span className="font-bold text-indigo-500">{dragCoefficientCd}</span>
                  </div>
                  <input
                    type="range"
                    min={0.24}
                    max={0.48}
                    step={0.01}
                    value={dragCoefficientCd}
                    onChange={(e) => onParamChange('dragCoefficientCd', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Road Incline Grade:</span>
                    <span className="font-bold text-indigo-500">{roadGradePercent} % Slope</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={1}
                    value={roadGradePercent}
                    onChange={(e) => onParamChange('roadGradePercent', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Performance Readout */}
            <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Top Speed</span>
                <span className="text-base font-bold text-emerald-400">{topSpeedKmh} km/h</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">0–100 km/h Time</span>
                <span className="text-base font-bold text-indigo-400">{zeroToHundredSec} s</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{'Rolling Resistance ($F_{roll}$)'}</span>
                <span className="text-sm font-bold text-slate-300">{rollingResistanceForce} N</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">{'Grade Resistance ($F_{grade}$)'}</span>
                <span className="text-sm font-bold text-amber-400">{gradeForce} N</span>
              </div>
            </div>
          </div>

          {/* Curves & Formula Visualizer */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {'Power Available vs Power Required Equilibrium ($P = F_{resist} \\cdot v$)'}
            </span>

            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
                {/* Axes */}
                <line x1="50" y1="180" x2="420" y2="180" stroke="#475569" strokeWidth="2" />
                <line x1="50" y1="20" x2="50" y2="180" stroke="#475569" strokeWidth="2" />
                <text x="235" y="205" fill="#94a3b8" fontSize="10" textAnchor="middle">Vehicle Speed (km/h)</text>
                <text x="25" y="100" fill="#94a3b8" fontSize="10" transform="rotate(-90 25 100)" textAnchor="middle">Power (kW)</text>

                {/* Power Available curve (Flat/slight hump) */}
                <path d={`M 50 120 Q 200 ${180 - enginePowerKw * 0.8} 400 ${180 - enginePowerKw * 0.7}`} fill="none" stroke="#22c55e" strokeWidth="3" />
                <text x="360" y={170 - enginePowerKw * 0.7} fill="#22c55e" fontSize="9" fontWeight="bold">Power Available</text>

                {/* Power Required curve (Cubic curve: P ~ v^3) */}
                <path
                  d="M 50 170 Q 220 160 410 40"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                />
                <text x="360" y="35" fill="#ef4444" fontSize="9" fontWeight="bold">Power Required (v³)</text>

                {/* Intersection point */}
                <circle cx="340" cy="90" r="5" fill="#f59e0b" />
                <line x1="340" y1="90" x2="340" y2="180" stroke="#f59e0b" strokeDasharray="3 3" />
                <text x="340" y="80" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">Top Speed</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. PLC LADDER LOGIC SIMULATOR
  // ─────────────────────────────────────────────────────────────
  const inputStartPB = params.inputStartPB ?? false;
  const inputStopPB = params.inputStopPB ?? true; // NC contact
  const outputMotorCoil = params.outputMotorCoil ?? false;

  const isCoilEnergized = (inputStartPB || outputMotorCoil) && inputStopPB;

  const handleStartPress = () => {
    onParamChange('inputStartPB', true);
    if (inputStopPB) {
      onParamChange('outputMotorCoil', true);
    }
    setTimeout(() => {
      onParamChange('inputStartPB', false);
    }, 400);
  };

  const handleStopPress = () => {
    onParamChange('inputStopPB', false);
    onParamChange('outputMotorCoil', false);
    setTimeout(() => {
      onParamChange('inputStopPB', true);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      {/* Header */}
      <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">IEC 61131-3 PLC Ladder Logic</span>
          <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
            Industrial Motor 3-Wire Seal-in Latch Circuit with Animated Power Rails
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Physical Inputs Panel */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
              Operator Push-Button Station
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onMouseDown={handleStartPress}
                className="py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5" />
                <span>START PB (NO)</span>
                <span className="text-[10px] opacity-80">Input I:0/1</span>
              </button>

              <button
                onMouseDown={handleStopPress}
                className="py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-red-600/20 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
                <span>STOP PB (NC)</span>
                <span className="text-[10px] opacity-80">Input I:0/2</span>
              </button>
            </div>
          </div>

          {/* Plant Output Status */}
          <div className={`p-4 rounded-xl border text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
              Field Actuator Output Status
            </span>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700/60 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${outputMotorCoil ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                <div>
                  <span className="font-bold text-xs block">Main Motor Contactor (O:0/1)</span>
                  <span className="text-[11px] text-slate-500">{outputMotorCoil ? 'Running at 1440 RPM' : 'Stopped / Standby'}</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${outputMotorCoil ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {outputMotorCoil ? 'ENERGIZED' : 'DE-ENERGIZED'}
              </span>
            </div>
          </div>
        </div>

        {/* Ladder Diagram Workspace */}
        <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rung 000: Motor Start / Stop Latch
            </span>
            <span className={`text-xs font-bold ${outputMotorCoil ? 'text-emerald-500' : 'text-slate-500'}`}>
              Scan Cycle: 2.4 ms
            </span>
          </div>

          <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
            <svg viewBox="0 0 500 200" className="w-full h-full max-h-[220px]">
              {/* Power Rails */}
              <line x1="30" y1="20" x2="30" y2="180" stroke="#3b82f6" strokeWidth="4" />
              <line x1="470" y1="20" x2="470" y2="180" stroke="#64748b" strokeWidth="4" />
              <text x="30" y="15" fill="#3b82f6" fontSize="10" textAnchor="middle" fontWeight="bold">+24V</text>
              <text x="470" y="15" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">0V</text>

              {/* Rung line from left rail */}
              <line x1="30" y1="80" x2="110" y2="80" stroke={outputMotorCoil || inputStartPB ? '#22c55e' : '#64748b'} strokeWidth="2.5" />

              {/* Start PB NO contact -| |- */}
              <g transform="translate(110, 70)">
                <line x1="0" y1="10" x2="15" y2="10" stroke={inputStartPB ? '#22c55e' : '#64748b'} strokeWidth="2" />
                <line x1="15" y1="0" x2="15" y2="20" stroke={inputStartPB ? '#22c55e' : '#64748b'} strokeWidth="2.5" />
                <line x1="25" y1="0" x2="25" y2="20" stroke={inputStartPB ? '#22c55e' : '#64748b'} strokeWidth="2.5" />
                <line x1="25" y1="10" x2="40" y2="10" stroke={inputStartPB ? '#22c55e' : '#64748b'} strokeWidth="2" />
                <text x="20" y="-4" fill="#94a3b8" fontSize="9" textAnchor="middle">I:0/1 (Start)</text>
              </g>

              {/* Seal-in parallel branch O:0/1 */}
              <line x1="90" y1="80" x2="90" y2="130" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2" />
              <line x1="90" y1="130" x2="110" y2="130" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2" />
              <g transform="translate(110, 120)">
                <line x1="0" y1="10" x2="15" y2="10" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2" />
                <line x1="15" y1="0" x2="15" y2="20" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2.5" />
                <line x1="25" y1="0" x2="25" y2="20" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2.5" />
                <line x1="25" y1="10" x2="40" y2="10" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2" />
                <text x="20" y="32" fill="#94a3b8" fontSize="9" textAnchor="middle">O:0/1 (Latch)</text>
              </g>
              <line x1="150" y1="130" x2="170" y2="130" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2" />
              <line x1="170" y1="130" x2="170" y2="80" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2" />

              <line x1="150" y1="80" x2="210" y2="80" stroke={outputMotorCoil || inputStartPB ? '#22c55e' : '#64748b'} strokeWidth="2.5" />

              {/* Stop PB NC contact -|/|- */}
              <g transform="translate(210, 70)">
                <line x1="0" y1="10" x2="15" y2="10" stroke={isCoilEnergized ? '#22c55e' : '#64748b'} strokeWidth="2" />
                <line x1="15" y1="0" x2="15" y2="20" stroke={isCoilEnergized ? '#22c55e' : '#64748b'} strokeWidth="2.5" />
                <line x1="25" y1="0" x2="25" y2="20" stroke={isCoilEnergized ? '#22c55e' : '#64748b'} strokeWidth="2.5" />
                {/* Diagonal slash for NC */}
                <line x1="12" y1="22" x2="28" y2="-2" stroke={inputStopPB ? '#22c55e' : '#ef4444'} strokeWidth="2" />
                <line x1="25" y1="10" x2="40" y2="10" stroke={isCoilEnergized ? '#22c55e' : '#64748b'} strokeWidth="2" />
                <text x="20" y="-4" fill="#94a3b8" fontSize="9" textAnchor="middle">I:0/2 (Stop)</text>
              </g>

              <line x1="250" y1="80" x2="350" y2="80" stroke={isCoilEnergized ? '#22c55e' : '#64748b'} strokeWidth="2.5" />

              {/* Output Coil -( )- */}
              <g transform="translate(350, 70)">
                <path d="M 10 0 C 0 5 0 15 10 20" fill="none" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2.5" />
                <path d="M 30 0 C 40 5 40 15 30 20" fill="none" stroke={outputMotorCoil ? '#22c55e' : '#64748b'} strokeWidth="2.5" />
                <text x="20" y="14" fill={outputMotorCoil ? '#22c55e' : '#94a3b8'} fontSize="11" textAnchor="middle" fontWeight="bold">M</text>
                <text x="20" y="-4" fill="#94a3b8" fontSize="9" textAnchor="middle">O:0/1 (Motor)</text>
              </g>

              {/* Connection to right rail */}
              <line x1="390" y1="80" x2="470" y2="80" stroke="#64748b" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
