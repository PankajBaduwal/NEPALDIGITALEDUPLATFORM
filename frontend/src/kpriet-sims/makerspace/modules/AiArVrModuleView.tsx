import React, { useState } from 'react';
import type { IMakerspaceSimulationMetadata } from '../types';
import { Eye, Brain, CheckCircle, AlertTriangle, Box, Compass, Sparkles } from 'lucide-react';

interface Props {
  meta: IMakerspaceSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  isDark: boolean;
}

export const AiArVrModuleView: React.FC<Props> = ({ meta, params, onParamChange, isDark }) => {
  const simId = meta.id;

  // ─────────────────────────────────────────────────────────────
  // 1. AI TECHNOLOGY DEMONSTRATION
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim18-ai-demonstrations') {
    const aiApplication = params.aiApplication ?? 'visual-quality-inspector';
    const samplePartImage = params.samplePartImage ?? 'bracket-clean';
    const confidenceThresholdPercent = params.confidenceThresholdPercent ?? 85;

    const hasDefect = samplePartImage === 'bracket-crack' || samplePartImage === 'bracket-warped';
    const modelConfidence = hasDefect ? 94.2 : 98.6;
    const isAccepted = !hasDefect;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Task Switcher */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onParamChange('aiApplication', 'visual-quality-inspector')}
            className={`p-2.5 rounded-xl border text-left font-bold text-xs uppercase tracking-wider transition-all ${
              aiApplication === 'visual-quality-inspector'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            Computer Vision Surface Defect Classifier
          </button>
          <button
            onClick={() => onParamChange('aiApplication', 'predictive-maintenance')}
            className={`p-2.5 rounded-xl border text-left font-bold text-xs uppercase tracking-wider transition-all ${
              aiApplication === 'predictive-maintenance'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            Predictive Maintenance Vibration FFT Anomaly
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Input Test Specimen
              </span>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'bracket-clean', label: 'Sample A: Flawless 3D Printed Bracket' },
                  { id: 'bracket-crack', label: 'Sample B: Layer Separation Crack Defect' },
                  { id: 'bracket-warped', label: 'Sample C: Thermal Bed Warpage Defect' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onParamChange('samplePartImage', s.id)}
                    className={`w-full p-2.5 rounded-lg border text-left font-bold text-xs ${
                      samplePartImage === s.id
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                Decision Threshold & Metrics
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Confidence Threshold:</span>
                    <span className="font-bold text-indigo-500">{confidenceThresholdPercent} %</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={98}
                    value={confidenceThresholdPercent}
                    onChange={(e) => onParamChange('confidenceThresholdPercent', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-slate-800/40">
                    <span className="text-slate-500 block">Inference Speed:</span>
                    <span className="font-bold text-emerald-400">18 ms (Edge AI)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/40">
                    <span className="text-slate-500 block">Test Accuracy:</span>
                    <span className="font-bold text-indigo-400">96.4% F1-Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Inference Visualizer */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Neural Network Feature Map & Bounding Box
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${isAccepted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {isAccepted ? `PASS (${modelConfidence}% Confidence)` : `REJECT DEFECT (${modelConfidence}% Confidence)`}
              </span>
            </div>

            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
                {/* Visual Camera Feed */}
                <rect x="50" y="30" width="360" height="160" fill="#1e293b" rx="4" />

                {/* Inspected 3D Bracket Shape */}
                <polygon points="120,60 240,60 240,160 120,160" fill="#3b82f6" opacity="0.8" />
                <polygon points="240,120 340,120 340,160 240,160" fill="#3b82f6" opacity="0.8" />

                {/* Bounding box and defect indication */}
                {hasDefect ? (
                  <g>
                    {/* Red Detection Bounding Box */}
                    <rect x="180" y="80" width="100" height="60" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 2" />
                    <text x="180" y="75" fill="#ef4444" fontSize="10" fontWeight="bold">
                      DELAMINATION CRACK (94%)
                    </text>
                  </g>
                ) : (
                  <g>
                    {/* Green Verification Bounding Box */}
                    <rect x="110" y="50" width="240" height="120" fill="none" stroke="#22c55e" strokeWidth="2" />
                    <text x="110" y="44" fill="#22c55e" fontSize="10" fontWeight="bold">
                      GEOMETRY WITHIN TOLERANCE (98.6%)
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AR/VR LEARNING DEMO
  // ─────────────────────────────────────────────────────────────
  const activeZone = params.activeZone ?? 'welding-bay';
  const arOverlayActive = params.arOverlayActive ?? true;

  const ZONES = [
    { id: 'welding-bay', name: 'Arc & Gas Welding Bay', icon: '⚡' },
    { id: 'laser-cell', name: 'CNC Laser Cutting Cell', icon: '🔬' },
    { id: '3d-printing-farm', name: 'Additive 3D Printing Farm', icon: '🖨️' },
    { id: 'robotics-cell', name: 'Articulated Industrial Robotics Cell', icon: '🤖' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      {/* Zone Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ZONES.map((z) => (
          <button
            key={z.id}
            onClick={() => onParamChange('activeZone', z.id)}
            className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all ${
              activeZone === z.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <div className="text-sm mb-1">{z.icon}</div>
            <div className="truncate">{z.name}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
              Spatial Augmented Reality (AR) Overlay
            </span>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Enable Holographic Digital Twin HUD:</span>
                <input
                  type="checkbox"
                  checked={arOverlayActive}
                  onChange={(e) => onParamChange('arOverlayActive', e.target.checked)}
                  className="rounded text-indigo-600"
                />
              </label>

              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] leading-relaxed">
                <span className="font-bold text-indigo-400 block mb-1">AR Telemetry Anchor:</span>
                Spatial mapping anchors live temperature sensors, motor RPM, and safety perimeters onto physical machine fixtures in the user’s camera view.
              </div>
            </div>
          </div>
        </div>

        {/* 3D Workshop Tour & AR HUD Canvas */}
        <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-500" /> Virtual Workshop Tour • {activeZone.toUpperCase()}
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {arOverlayActive ? '✨ AR Hologram Active' : 'Standard 3D Tour'}
            </span>
          </div>

          <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
            <svg viewBox="0 0 460 220" className="w-full h-full max-h-[260px]">
              {/* Floor grid */}
              <polygon points="50,180 410,180 340,90 120,90" fill={isDark ? '#0f172a' : '#e2e8f0'} stroke="#475569" strokeWidth="1" />

              {/* Machine Outline */}
              <rect x="180" y="80" width="100" height="70" fill="#334155" stroke="#64748b" strokeWidth="2" rx="3" />
              <text x="230" y="120" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">
                {activeZone === 'welding-bay'
                  ? 'SMAW / GMAW Bay'
                  : activeZone === 'laser-cell'
                  ? 'CO₂ Laser Cutter'
                  : activeZone === '3d-printing-farm'
                  ? 'FDM 3D Printer'
                  : 'Articulated Robot'}
              </text>

              {/* Safety Perimeter Zone Line */}
              <ellipse cx="230" cy="150" rx="140" ry="35" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="5 3" />
              <text x="230" y="195" fill="#eab308" fontSize="9" textAnchor="middle" fontWeight="bold">
                SAFETY EXCLUSION PERIMETER (1.5 m)
              </text>

              {/* Floating Hologram HUD if AR active */}
              {arOverlayActive && (
                <g transform="translate(200, 20)">
                  <rect x="0" y="0" width="160" height="50" rx="4" fill="#0284c7" opacity="0.85" />
                  <text x="10" y="18" fill="#ffffff" fontSize="9" fontWeight="bold">DIGITAL TWIN TELEMETRY</text>
                  <text x="10" y="32" fill="#e0f2fe" fontSize="8">• Operating Temp: 42.8°C (Normal)</text>
                  <text x="10" y="44" fill="#e0f2fe" fontSize="8">• Load Factor: 68% • Safe Status: OK</text>
                  {/* Dotted anchor line */}
                  <line x1="10" y1="50" x2="30" y2="65" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
