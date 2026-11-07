/**
 * KPRIET Advanced Electrochemical Cells & Energy Storage Virtual Laboratory
 * Standardized Eduverse / KPRIET Presentation Workspace
 *
 * Adheres strictly to the platform's default UI design system:
 * - Emerald green brand accent (#10b981 / #059669 / emerald-400/500)
 * - Deep forest green outer shell (bg-[#0F2419])
 * - Clean slate surfaces (bg-slate-950, bg-slate-900, border-slate-800)
 * - Authentic 3D studio lighting and neutral laboratory palette
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  Activity,
  Atom,
  Zap,
  Info,
  Flame,
  Compass,
  X,
} from 'lucide-react';
import type { SimulationController, SimulationState, ComponentInspectionData } from '../types';
import { mountLithiumIonSimulation } from '../simulations/lithium-ion';
import { mountLeadAcidSimulation } from '../simulations/lead-acid';
import { mountPEMFuelCellSimulation } from '../simulations/pem-fuel-cell';

export type SimType = 'lithium-ion' | 'lead-acid' | 'pem-fuel-cell';

interface ElectrochemLabWorkspaceProps {
  initialSim?: SimType;
  onExit?: () => void;
}

const SIM_METADATA: Record<SimType, { title: string; subtitle: string; icon: string }> = {
  'lithium-ion': {
    title: 'Lithium-Ion Battery — Internal Structure & Cycling',
    subtitle: 'Unit II: Electrochemistry and Energy Storage Systems · Prismatic LiFePO₄ / Graphite',
    icon: '⚡',
  },
  'lead-acid': {
    title: 'Lead-Acid Automotive Battery — 6-Cell Architecture',
    subtitle: 'Unit II: Electrochemistry and Energy Storage Systems · 12V Flooded Double-Sulfate Assembly',
    icon: '🚗',
  },
  'pem-fuel-cell': {
    title: 'PEM Hydrogen Fuel Cell — MEA & Electricity Generation',
    subtitle: 'Unit II: Electrochemistry and Energy Storage Systems · Nafion PFSA / HOR & ORR Stack',
    icon: '💧',
  },
};

export const ElectrochemLabWorkspace: React.FC<ElectrochemLabWorkspaceProps> = ({
  initialSim = 'lithium-ion',
  onExit,
}) => {
  const [activeSim, setActiveSim] = useState<SimType>(initialSim);
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SimulationController | null>(null);

  // Controller State synced to React
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [selectedComp, setSelectedComp] = useState<ComponentInspectionData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'telemetry' | 'controls'>('guide');

  // Mount/Unmount simulation when activeSim changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dispose previous controller
    if (controllerRef.current) {
      if (typeof controllerRef.current.dispose === 'function') {
        controllerRef.current.dispose();
      }
      controllerRef.current = null;
    }

    // Mount new simulation
    let controller: SimulationController;
    if (activeSim === 'lithium-ion') {
      controller = mountLithiumIonSimulation(container, {
        onStateChange: (st) => setSimState({ ...st }),
        onComponentSelect: (comp) => setSelectedComp(comp),
      });
    } else if (activeSim === 'lead-acid') {
      controller = mountLeadAcidSimulation(container, {
        onStateChange: (st) => setSimState({ ...st }),
        onComponentSelect: (comp) => setSelectedComp(comp),
      });
    } else {
      controller = mountPEMFuelCellSimulation(container, {
        onStateChange: (st) => setSimState({ ...st }),
        onComponentSelect: (comp) => setSelectedComp(comp),
      });
    }

    controllerRef.current = controller;
    setSimState(controller.getState());
    setSelectedComp(null);

    return () => {
      if (controllerRef.current) {
        if (typeof controllerRef.current.dispose === 'function') {
          controllerRef.current.dispose();
        }
        controllerRef.current = null;
      }
    };
  }, [activeSim]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const stages = controllerRef.current?.getStages() || [];
  const currentStage = stages[simState?.currentStageIndex || 0] || null;
  const currentMeta = SIM_METADATA[activeSim];

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300 bg-slate-950 text-slate-100 border border-slate-800 ${
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : 'h-full w-full'
      }`}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER BAND (Identical to KPRIET SimulationShell)
          ═══════════════════════════════════════════════════════════════════ */}
      <header className="flex-shrink-0 backdrop-blur-md border-b px-5 py-3.5 bg-slate-900/90 border-slate-800">
        <div className="flex items-start justify-between gap-4">
          {/* Left: icon + breadcrumbs + title */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner border bg-slate-800 border-slate-700">
              {currentMeta.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  EDUVERSE
                </span>
                <span className="text-[10px] text-slate-500">·</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 truncate max-w-[18rem]">
                  ENGINEERING CHEMISTRY LABORATORY
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold leading-tight mt-0.5 truncate max-w-[34rem] text-slate-100">
                {currentMeta.title}
              </h2>
              <p className="text-[11px] mt-0.5 truncate max-w-[38rem] text-slate-400">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right: 3-Way Sim Tabs, Fullscreen & Close Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Simulation switcher pills */}
            <div className="hidden lg:flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setActiveSim('lithium-ion')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeSim === 'lithium-ion'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Atom className="h-3.5 w-3.5" />
                <span>Lithium-Ion</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSim('lead-acid')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeSim === 'lead-acid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Lead-Acid</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSim('pem-fuel-cell')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeSim === 'pem-fuel-cell'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>PEM Fuel Cell</span>
              </button>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Exit Laboratory"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTROL BAR (Standard KPRIET Tool Strip)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-2.5 border-b bg-slate-900/60 border-slate-800/80 flex-wrap">
        {/* Left: View / Inspection Mode Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            View:
          </span>
          <button
            type="button"
            onClick={() => controllerRef.current?.setInspectionMode('assembled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              simState?.inspectionMode === 'assembled'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Assembled
          </button>
          <button
            type="button"
            onClick={() => controllerRef.current?.setInspectionMode('cutaway')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              simState?.inspectionMode === 'cutaway'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Cutaway
          </button>
          <button
            type="button"
            onClick={() => controllerRef.current?.setInspectionMode('exploded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              simState?.inspectionMode === 'exploded'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Exploded Layers
          </button>
          {activeSim === 'lithium-ion' && (
            <button
              type="button"
              onClick={() => controllerRef.current?.setInspectionMode('microscopic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                simState?.inspectionMode === 'microscopic'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Micro Lattice
            </button>
          )}
        </div>

        {/* Center: Playback, Step, Reset, Speed Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => controllerRef.current?.prevStage()}
            disabled={!simState || simState.currentStageIndex === 0}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            title="Previous Stage"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (simState?.isPlaying) {
                controllerRef.current?.pause();
              } else {
                controllerRef.current?.play();
              }
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {simState?.isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => controllerRef.current?.nextStage()}
            disabled={!simState || simState.currentStageIndex >= stages.length - 1}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            title="Next Stage"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => controllerRef.current?.reset()}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Speed Pills */}
          <div className="hidden sm:flex items-center gap-1 ml-1 pl-2 border-l border-slate-800">
            {[0.5, 1.0, 1.5, 2.0].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => controllerRef.current?.setSpeed(spd)}
                className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                  simState?.speed === spd
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Camera Presets & Labels Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => controllerRef.current?.resetCamera()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Reset Camera View"
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">Reset</span>
          </button>
          <button
            type="button"
            onClick={() => controllerRef.current?.setCameraPreset('front')}
            className="px-2 py-1 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => controllerRef.current?.setCameraPreset('top')}
            className="px-2 py-1 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => controllerRef.current?.setCameraPreset('side')}
            className="px-2 py-1 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Side
          </button>
          <button
            type="button"
            onClick={() => controllerRef.current?.toggleLabels()}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              simState?.labelsVisible
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {simState?.labelsVisible ? 'Labels ON' : 'Labels OFF'}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN STAGE & SIDEBAR
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Center: 3D Canvas Area */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden">
          {/* Canvas Mount Container */}
          <div ref={containerRef} className="absolute inset-0 h-full w-full" />

          {/* Floating Stage Banner (Top-Left) */}
          {currentStage && (
            <div className="absolute top-4 left-4 z-10 max-w-md rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                  Step {currentStage.index + 1} of {stages.length}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                  Active Stage
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 leading-snug">
                {currentStage.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {currentStage.shortDescription}
              </p>
            </div>
          )}

          {/* Floating Species Legend (Bottom-Left) */}
          <div className="absolute bottom-4 left-4 z-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 shadow-xl text-xs">
            <div className="font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Transport Species Legend</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400 text-[11px]">
              {activeSim === 'lithium-ion' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                    <span>Li⁺ (Lithium Ion)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                    <span>e⁻ (External Circuit)</span>
                  </div>
                </>
              )}
              {activeSim === 'lead-acid' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500" />
                    <span>SO₄²⁻ (Sulfate Ion)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                    <span>e⁻ (External Circuit)</span>
                  </div>
                </>
              )}
              {activeSim === 'pem-fuel-cell' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                    <span>H₂ (Hydrogen Gas)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400" />
                    <span>H⁺ (Nafion Proton)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span>O₂ (Oxygen Gas)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                    <span>H₂O (Water Exhaust)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Selected Component Inspection Overlay (Top-Right) */}
          {selectedComp && (
            <div className="absolute top-4 right-4 z-10 w-80 rounded-xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 p-3.5 shadow-2xl animate-in fade-in">
              <div className="flex items-start justify-between border-b border-slate-700/60 pb-2 mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    {selectedComp.category}
                  </span>
                  <h4 className="text-sm font-bold text-white leading-tight">{selectedComp.name}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => controllerRef.current?.inspectComponent(null)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {selectedComp.chemicalFormula && (
                <div className="mb-2 rounded bg-slate-950/80 px-2 py-1 font-mono text-xs text-emerald-300 border border-slate-800">
                  Formula: {selectedComp.chemicalFormula}
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="font-semibold text-slate-400">Material: </span>
                  <span className="text-slate-200">{selectedComp.material}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Scientific Role: </span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{selectedComp.scientificRole}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Specifications: </span>
                  <span className="text-slate-400">{selectedComp.specifications}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Tabbed Sidebar */}
        <aside className="w-80 xl:w-96 flex flex-col border-l border-slate-800 bg-slate-900/95 flex-shrink-0 overflow-hidden">
          {/* Tab Headers */}
          <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-center flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`py-3 transition-colors cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-b-2 border-emerald-500 text-emerald-400 bg-slate-900/50'
                  : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent'
              }`}
            >
              Step Guide
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`py-3 transition-colors cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'border-b-2 border-emerald-500 text-emerald-400 bg-slate-900/50'
                  : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent'
              }`}
            >
              Live Telemetry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('controls')}
              className={`py-3 transition-colors cursor-pointer ${
                activeTab === 'controls'
                  ? 'border-b-2 border-emerald-500 text-emerald-400 bg-slate-900/50'
                  : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent'
              }`}
            >
              Controls
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {/* ── TAB 1: GUIDE & REACTIONS ── */}
            {activeTab === 'guide' && currentStage && (
              <div className="space-y-3.5">
                <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    Stage {currentStage.index + 1} of {stages.length}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{currentStage.title}</h3>
                  <p className="mt-2 text-slate-300 leading-relaxed">{currentStage.detailedExplanation}</p>
                </div>

                {/* Electrochemical Reactions */}
                {currentStage.chemicalReactions.length > 0 && (
                  <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/80">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-2">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Electrochemical Reactions & Principles</span>
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px] text-slate-200">
                      {currentStage.chemicalReactions.map((rxn, i) => (
                        <div key={i} className="rounded bg-slate-950/80 px-2.5 py-1.5 border border-slate-700/60">
                          {rxn}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Terminology */}
                {currentStage.keyTerminology.length > 0 && (
                  <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/80">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-2">
                      <Info className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Key Engineering Terminology</span>
                    </div>
                    <div className="space-y-2">
                      {currentStage.keyTerminology.map((term, i) => (
                        <div key={i} className="text-slate-300">
                          <span className="font-semibold text-emerald-400">{term.term}: </span>
                          <span className="text-slate-400">{term.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: LIVE TELEMETRY ── */}
            {activeTab === 'telemetry' && simState && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-300">Electrochemical Readouts</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(simState.metrics).map(([key, val]) => (
                    <div key={key} className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/80">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                        {key}
                      </div>
                      <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-700/60 text-slate-400 space-y-1 text-[11px]">
                  <div className="font-semibold text-slate-300 mb-1">Scientific Model Principles:</div>
                  <p>• Thermodynamic calculations assume 25 °C standard state.</p>
                  <p>• Ohmic drops calculated from active material conductivity & electrolyte mobility.</p>
                  <p>• Faraday's law of electrochemical equivalence governs all mass flux.</p>
                </div>
              </div>
            )}

            {/* ── TAB 3: CONTROLS & MODEL ── */}
            {activeTab === 'controls' && (
              <div className="space-y-3.5">
                {/* Mode Selector for Batteries */}
                {activeSim !== 'pem-fuel-cell' && (
                  <div className="rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/80">
                    <label className="block text-xs font-bold text-slate-300 mb-2">Operating Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => controllerRef.current?.setMode('discharge')}
                        className={`rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                          simState?.mode === 'discharge'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        ⚡ Galvanic Discharge
                      </button>
                      <button
                        type="button"
                        onClick={() => controllerRef.current?.setMode('charge')}
                        className={`rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                          simState?.mode === 'charge'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        🔌 Electrolytic Charge
                      </button>
                    </div>
                  </div>
                )}

                {/* Specific Sliders for Lithium-Ion */}
                {activeSim === 'lithium-ion' && (
                  <div className="space-y-3 rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/80">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">State of Charge (SOC)</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {controllerRef.current?.getParameter('soc') || 75} %
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="98"
                        defaultValue="75"
                        onChange={(e) => controllerRef.current?.setParameter('soc', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Discharge Current (Load)</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {controllerRef.current?.getParameter('loadCurrent') || 5} A
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        defaultValue="5"
                        onChange={(e) => controllerRef.current?.setParameter('loadCurrent', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Specific Sliders for Lead-Acid */}
                {activeSim === 'lead-acid' && (
                  <div className="space-y-3 rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/80">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">State of Charge (SOC)</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {controllerRef.current?.getParameter('soc') || 80} %
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        defaultValue="80"
                        onChange={(e) => controllerRef.current?.setParameter('soc', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Starter Motor Load Current</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {controllerRef.current?.getParameter('dischargeCurrent') || 15} A
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="60"
                        defaultValue="15"
                        onChange={(e) => controllerRef.current?.setParameter('dischargeCurrent', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Specific Sliders for PEM Fuel Cell */}
                {activeSim === 'pem-fuel-cell' && (
                  <div className="space-y-3 rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/80">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">External Load Resistance</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {controllerRef.current?.getParameter('loadResistance') || 1.5} Ω
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="10"
                        step="0.1"
                        defaultValue="1.5"
                        onChange={(e) => controllerRef.current?.setParameter('loadResistance', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Stack Operating Temperature</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {controllerRef.current?.getParameter('temperatureC') || 65} °C
                        </span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="90"
                        defaultValue="65"
                        onChange={(e) => controllerRef.current?.setParameter('temperatureC', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
