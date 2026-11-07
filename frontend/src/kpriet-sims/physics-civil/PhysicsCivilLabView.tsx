import React, { useState, useMemo } from 'react';
import {
  PHYSICS_CIVIL_COURSE_METADATA,
  PHYSICS_CIVIL_SIMULATIONS,
} from './PhysicsCivilSimData';
import type { IPhysicsCivilSimulationMetadata } from './types';
import { SmartMaterialsView } from './modules/SmartMaterialsView';
import { BuildingThermalView } from './modules/BuildingThermalView';
import { LightingDesignView } from './modules/LightingDesignView';
import { BuildingAcousticsView } from './modules/BuildingAcousticsView';
import { HazardsProtectionView } from './modules/HazardsProtectionView';

export interface PhysicsCivilLabViewProps {
  simId?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  standalone?: boolean;
  theme?: 'light' | 'dark';
  params?: Record<string, any>;
  onParamChange?: (key: string, value: any) => void;
  onClose?: () => void;
}

export const PhysicsCivilLabView: React.FC<PhysicsCivilLabViewProps> = ({
  simId = 'u25rph06-sim01-frp-composites',
  showHeader = true,
  showSidebar = true,
  standalone = false,
  theme = 'dark',
  params: externalParams,
  onParamChange: externalOnParamChange,
  onClose,
}) => {
  const isDark = theme === 'dark';

  // Active simulation
  const [activeSimId, setActiveSimId] = useState<string>(simId);
  const currentSim = useMemo<IPhysicsCivilSimulationMetadata>(() => {
    return (
      PHYSICS_CIVIL_SIMULATIONS.find((s) => s.id === activeSimId) ||
      PHYSICS_CIVIL_SIMULATIONS[0]!
    );
  }, [activeSimId]);

  // Selected Unit Filter (1 to 5)
  const [selectedUnit, setSelectedUnit] = useState<number>(currentSim.unitNumber);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'studio' | 'math' | 'civil' | 'procedure' | 'reflection' | 'syllabus'
  >('studio');

  // Internal parameter state if not externally managed
  const [internalParams, setInternalParams] = useState<Record<string, any>>(
    currentSim.defaultParams
  );
  const params = externalParams || internalParams;
  const handleParamChange = (key: string, value: any) => {
    if (externalOnParamChange) {
      externalOnParamChange(key, value);
    } else {
      setInternalParams((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Switch simulation handler
  const handleSelectSim = (newSimId: string) => {
    setActiveSimId(newSimId);
    const target = PHYSICS_CIVIL_SIMULATIONS.find((s) => s.id === newSimId);
    if (target) {
      setSelectedUnit(target.unitNumber);
      setInternalParams(target.defaultParams);
    }
  };

  // Observation trials log
  const [observations, setObservations] = useState<Record<string, any>[]>([]);
  const handleRecordObservation = () => {
    const row: Record<string, any> = { trial: observations.length + 1, timestamp: new Date().toLocaleTimeString() };
    for (const col of currentSim.observationColumns) {
      row[col.key] = params[col.key] !== undefined ? params[col.key] : '-';
    }
    setObservations((prev) => [...prev, row]);
  };
  const handleClearObservations = () => setObservations([]);

  // Reflection Check State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className={`w-full h-full flex flex-col font-sans ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} overflow-hidden select-none`}>
      {/* ─── Top Course & Simulation Navigation Bar ─── */}
      {showHeader && (
        <header className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} backdrop-blur-sm shadow-sm`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="physics-logo">🏛️</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide uppercase text-indigo-400">
                  {PHYSICS_CIVIL_COURSE_METADATA.courseCode}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-300">
                  {PHYSICS_CIVIL_COURSE_METADATA.category} | {PHYSICS_CIVIL_COURSE_METADATA.credits} Credits | {PHYSICS_CIVIL_COURSE_METADATA.totalHours}h
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  R2025 Revised CBCS
                </span>
              </div>
              <h1 className="text-base font-bold leading-tight">
                {PHYSICS_CIVIL_COURSE_METADATA.courseTitle} — B.E. Civil Engineering (Sem II)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Close Lab
              </button>
            )}
          </div>
        </header>
      )}

      {/* ─── Unit Selector Tabs ─── */}
      <div className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Units:</span>
        {PHYSICS_CIVIL_COURSE_METADATA.units.map((u) => {
          const isSelected = selectedUnit === u.number;
          return (
            <button
              key={u.number}
              onClick={() => {
                setSelectedUnit(u.number);
                const firstSimInUnit = PHYSICS_CIVIL_SIMULATIONS.find((s) => s.unitNumber === u.number);
                if (firstSimInUnit) handleSelectSim(firstSimInUnit.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md font-semibold'
                  : isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              <span>Unit {u.number}:</span>
              <span>{u.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-indigo-200 font-mono">
                {u.outcome}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Main Workshop Area ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Simulator Navigation Sidebar */}
        {showSidebar && (
          <aside className={`w-80 border-r flex flex-col ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'} overflow-y-auto`}>
            <div className="p-3 border-b border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Unit {selectedUnit} Simulations (5 Experiments)
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {PHYSICS_CIVIL_SIMULATIONS.filter((s) => s.unitNumber === selectedUnit).length} Loaded
              </span>
            </div>

            <div className="flex-1 p-2 flex flex-col gap-1.5">
              {PHYSICS_CIVIL_SIMULATIONS.filter((s) => s.unitNumber === selectedUnit).map((sim) => {
                const isCurrent = sim.id === activeSimId;
                return (
                  <button
                    key={sim.id}
                    onClick={() => handleSelectSim(sim.id)}
                    className={`p-2.5 rounded-xl text-left transition flex items-start gap-2.5 border ${
                      isCurrent
                        ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm'
                        : isDark
                        ? 'bg-slate-800/30 hover:bg-slate-800/70 border-transparent text-slate-300'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="text-lg p-1.5 rounded-lg bg-slate-800/60 flex-shrink-0">
                      {sim.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                          Sim #{sim.simNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {sim.syllabusReference.courseOutcome}
                        </span>
                      </div>
                      <div className="text-xs font-semibold truncate leading-tight">
                        {sim.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {sim.shortDescription}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Right Active Simulation Container */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Simulation Header Banner */}
          <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                {currentSim.icon}
              </span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-indigo-400 font-mono">
                    Unit {currentSim.unitNumber}: {currentSim.unitTitle}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">
                    Outcome: {currentSim.syllabusReference.courseOutcome}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-100">
                  {currentSim.title}
                </h2>
              </div>
            </div>

            {/* Navigation view tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('studio')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'studio' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                🔬 Interactive Studio
              </button>
              <button
                onClick={() => setActiveTab('math')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'math' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                📐 Governing Math
              </button>
              <button
                onClick={() => setActiveTab('civil')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'civil' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                🏗️ Civil Practice
              </button>
              <button
                onClick={() => setActiveTab('procedure')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'procedure' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                📋 Observations
              </button>
              <button
                onClick={() => setActiveTab('reflection')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'reflection' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                💡 Concept Check
              </button>
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'syllabus' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                📜 Syllabus Trace
              </button>
            </div>
          </div>

          {/* Simulation Content Body */}
          <div className="flex-1 p-4">
            {/* 1. Interactive Studio Tab */}
            {activeTab === 'studio' && (
              <div className="flex flex-col gap-4">
                {currentSim.unitNumber === 1 && (
                  <SmartMaterialsView
                    simulation={currentSim}
                    params={params}
                    onParamChange={handleParamChange}
                    theme={theme}
                  />
                )}
                {currentSim.unitNumber === 2 && (
                  <BuildingThermalView
                    simulation={currentSim}
                    params={params}
                    onParamChange={handleParamChange}
                    theme={theme}
                  />
                )}
                {currentSim.unitNumber === 3 && (
                  <LightingDesignView
                    simulation={currentSim}
                    params={params}
                    onParamChange={handleParamChange}
                    theme={theme}
                  />
                )}
                {currentSim.unitNumber === 4 && (
                  <BuildingAcousticsView
                    simulation={currentSim}
                    params={params}
                    onParamChange={handleParamChange}
                    theme={theme}
                  />
                )}
                {currentSim.unitNumber === 5 && (
                  <HazardsProtectionView
                    simulation={currentSim}
                    params={params}
                    onParamChange={handleParamChange}
                    theme={theme}
                  />
                )}
              </div>
            )}

            {/* 2. Governing Equations & Math Tab */}
            {activeTab === 'math' && (
              <div className="max-w-4xl flex flex-col gap-4 p-2">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-sm text-cyan-400 mb-3 flex items-center gap-2">
                    <span>📐 Mathematical Formulation & Governing Equations</span>
                  </h3>
                  <div className="flex flex-col gap-4">
                    {currentSim.governingFormulas.map((f, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2">
                        <div className="text-base font-mono font-bold text-amber-300 bg-slate-900 px-3 py-2 rounded border border-slate-800">
                          {f.expression}
                        </div>
                        <p className="text-xs text-slate-300">{f.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1 text-[11px] text-slate-400">
                          {Object.entries(f.variables).map(([sym, desc]) => (
                            <div key={sym} className="flex gap-2 font-mono">
                              <span className="text-cyan-400 font-bold">{sym}:</span>
                              <span>{desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-sm text-indigo-400 mb-2">Model Assumptions & Scientific Validity</h3>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {currentSim.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-500 mt-3 italic">{currentSim.disclaimer}</p>
                </div>
              </div>
            )}

            {/* 3. Civil Practice Tab */}
            {activeTab === 'civil' && (
              <div className="max-w-4xl flex flex-col gap-4 p-2">
                <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-sm text-amber-400 mb-3 flex items-center gap-2">
                    <span>🏗️ {currentSim.civilRelevanceTitle}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {currentSim.civilEngineeringUse.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        <span className="font-bold text-cyan-400 block mb-1">Application #{idx + 1}:</span>
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-700/50">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-1">
                      Civil Practical Scenario Challenge:
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {currentSim.civilPracticalScenario}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Observations & Guided Procedure Tab */}
            {activeTab === 'procedure' && (
              <div className="max-w-4xl flex flex-col gap-4 p-2">
                {/* Guided Steps */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-sm text-emerald-400 mb-3">Guided Step-by-Step Instructions</h3>
                  <div className="flex flex-col gap-2.5">
                    {currentSim.guidedSteps.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{step.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{step.instruction}</p>
                          {step.hint && (
                            <span className="text-[11px] text-amber-300 mt-1 block font-mono">
                              💡 Hint: {step.hint}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observation Table Recorder */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-cyan-400">Measurement & Observation Table</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRecordObservation}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow"
                      >
                        + Record Current Trial
                      </button>
                      {observations.length > 0 && (
                        <button
                          onClick={handleClearObservations}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {observations.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                      No trial measurements recorded yet. Adjust simulator parameters and click "+ Record Current Trial".
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-800">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="p-2 border-b border-slate-800">Trial #</th>
                            <th className="p-2 border-b border-slate-800">Time</th>
                            {currentSim.observationColumns.map((col) => (
                              <th key={col.key} className="p-2 border-b border-slate-800">
                                {col.label} {col.unit ? `(${col.unit})` : ''}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {observations.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 font-mono">
                              <td className="p-2 font-bold text-cyan-400">{row.trial}</td>
                              <td className="p-2 text-slate-400">{row.timestamp}</td>
                              {currentSim.observationColumns.map((col) => (
                                <td key={col.key} className="p-2 text-slate-200">
                                  {String(row[col.key] ?? '-')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Concept & Reflection Check Tab */}
            {activeTab === 'reflection' && (
              <div className="max-w-3xl flex flex-col gap-4 p-2">
                <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase mb-2 font-mono">
                    <span>💡 Concept Check & Pedagogical Reflection</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mb-4 leading-relaxed">
                    {currentSim.reflectionCheck.question}
                  </h3>

                  <div className="flex flex-col gap-2.5 mb-4">
                    {currentSim.reflectionCheck.options.map((option, idx) => {
                      const isChosen = selectedOption === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedOption(idx);
                            setShowExplanation(true);
                          }}
                          className={`p-3 rounded-lg text-xs text-left transition border flex items-start gap-3 ${
                            isChosen
                              ? idx === currentSim.reflectionCheck.correctIndex
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                                : 'bg-rose-950/60 border-rose-500 text-rose-200'
                              : isDark
                              ? 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <div
                      className={`p-4 rounded-lg text-xs leading-relaxed border ${
                        selectedOption === currentSim.reflectionCheck.correctIndex
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-500/60 text-amber-300'
                      }`}
                    >
                      <span className="font-bold block mb-1">
                        {selectedOption === currentSim.reflectionCheck.correctIndex
                          ? '✓ Correct Concept Application!'
                          : 'ℹ️ Review the Physics & Engineering Principles:'}
                      </span>
                      {currentSim.reflectionCheck.explanation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Syllabus Traceability Tab */}
            {activeTab === 'syllabus' && (
              <div className="max-w-3xl flex flex-col gap-4 p-2">
                <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-sm text-cyan-400 mb-3">Official Syllabus Reference & Alignment</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">COURSE CODE:</span>
                      <span className="text-indigo-400 font-bold">{PHYSICS_CIVIL_COURSE_METADATA.courseCode}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">SYLLABUS SOURCE:</span>
                      <span className="text-slate-300">Printed Pages 34–35</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">UNIT & CONTACT HOURS:</span>
                      <span className="text-slate-300">Unit {currentSim.unitNumber} ({currentSim.syllabusReference.unitHours} Hours)</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">COURSE OUTCOME:</span>
                      <span className="text-emerald-400 font-bold">{currentSim.syllabusReference.courseOutcome}</span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Prescribed Topic:</span>
                    <span className="font-semibold text-slate-200">{currentSim.syllabusReference.officialTopicTitle}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
