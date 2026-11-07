import React, { useState, useMemo, useEffect } from 'react';
import {
  MAKERSPACE_SIMULATIONS,
  COURSE_METADATA,
} from './MakerspaceSimData';
import type { IMakerspaceSimulationMetadata } from './types';
import { resolveU25RGE01SimId } from '../u25rge01';
import { FabricationModuleView } from './modules/FabricationModuleView';
import { DigitalDesignModuleView } from './modules/DigitalDesignModuleView';
import { AutomationRoboticsModuleView } from './modules/AutomationRoboticsModuleView';
import { ElectricalModuleView } from './modules/ElectricalModuleView';
import { ElectronicsModuleView } from './modules/ElectronicsModuleView';
import { AiArVrModuleView } from './modules/AiArVrModuleView';
import { PrototypeChallengeView } from './modules/PrototypeChallengeView';
import {
  Wrench,
  BookOpen,
  Shield,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Layers,
  Award,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';

export interface MakerspaceWorkshopViewProps {
  simId: string;
  onClose?: () => void;
  standalone?: boolean;
  showHeader?: boolean;
  showSidebar?: boolean;
  theme?: 'dark' | 'light';
  params?: Record<string, any>;
  onParamChange?: (key: string, value: any) => void;
}

export const MakerspaceWorkshopView: React.FC<MakerspaceWorkshopViewProps> = ({
  simId: rawSimId,
  onClose,
  standalone = false,
  showHeader = true,
  theme = 'dark',
  params: externalParams,
  onParamChange,
}) => {
  const isDark = theme === 'dark';

  // Resolved simulation ID
  const activeSimId = resolveU25RGE01SimId(rawSimId);

  // Active simulation metadata
  const currentMeta: IMakerspaceSimulationMetadata = useMemo(() => {
    const found = MAKERSPACE_SIMULATIONS.find((s) => s.id === activeSimId);
    return found || MAKERSPACE_SIMULATIONS[0]!;
  }, [activeSimId]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'workspace' | 'guided' | 'safety' | 'observe' | 'syllabus'>('workspace');

  // Internal Parameters State
  const [internalParams, setInternalParams] = useState<Record<string, any>>(currentMeta.defaultParams);

  useEffect(() => {
    setInternalParams(currentMeta.defaultParams);
  }, [currentMeta]);

  const effectiveParams = externalParams || internalParams;

  const handleParamChange = (key: string, value: any) => {
    if (onParamChange) {
      onParamChange(key, value);
    }
    setInternalParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (onParamChange) {
      Object.entries(currentMeta.defaultParams).forEach(([k, v]) => onParamChange(k, v));
    }
    setInternalParams({ ...currentMeta.defaultParams });
  };

  // Reflection Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setShowAnswer(false);
  }, [currentMeta]);

  // Render the specific module simulator
  const renderModuleWorkspace = () => {
    switch (currentMeta.moduleNumber) {
      case 1:
        return (
          <FabricationModuleView
            meta={currentMeta}
            params={effectiveParams}
            onParamChange={handleParamChange}
            isDark={isDark}
          />
        );
      case 2:
        return (
          <DigitalDesignModuleView
            meta={currentMeta}
            params={effectiveParams}
            onParamChange={handleParamChange}
            isDark={isDark}
          />
        );
      case 3:
        return (
          <AutomationRoboticsModuleView
            meta={currentMeta}
            params={effectiveParams}
            onParamChange={handleParamChange}
            isDark={isDark}
          />
        );
      case 4:
        return (
          <ElectricalModuleView
            meta={currentMeta}
            params={effectiveParams}
            onParamChange={handleParamChange}
            isDark={isDark}
          />
        );
      case 5:
        return (
          <ElectronicsModuleView
            meta={currentMeta}
            params={effectiveParams}
            onParamChange={handleParamChange}
            isDark={isDark}
          />
        );
      case 6:
        return (
          <AiArVrModuleView
            meta={currentMeta}
            params={effectiveParams}
            onParamChange={handleParamChange}
            isDark={isDark}
          />
        );
      case 7:
        return (
          <PrototypeChallengeView
            meta={currentMeta}
            params={effectiveParams}
            onParamChange={handleParamChange}
            isDark={isDark}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col w-full h-full select-none ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* ═══════════════════════════════════════════════════════════════
          COURSE HEADER & MODULE NAVIGATION
          ═══════════════════════════════════════════════════════════════ */}
      {showHeader && (
        <div className={`flex-shrink-0 border-b px-5 py-3 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-600/20">
                🛠️
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base tracking-tight">{COURSE_METADATA.courseTitle}</h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {COURSE_METADATA.courseCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {COURSE_METADATA.category} • {COURSE_METADATA.credits} Credits ({COURSE_METADATA.practicalHours}h)
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{COURSE_METADATA.department}</span>
                  <span>•</span>
                  <span>{COURSE_METADATA.semester}</span>
                  <span>•</span>
                  <span>{COURSE_METADATA.regulation}</span>
                  <span>•</span>
                  <span className="text-slate-500">{COURSE_METADATA.officialSyllabusSource}</span>
                </div>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ACTIVE SIMULATION TITLE & TOP BAR
          ═══════════════════════════════════════════════════════════════ */}
      <div className={`flex-shrink-0 px-5 py-2.5 border-b flex items-center justify-between gap-4 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/70 border-slate-200'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">{currentMeta.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Module {currentMeta.moduleNumber}: {currentMeta.moduleTitle} (Exp {currentMeta.experimentNumber})
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                currentMeta.safetyLevel === 'CRITICAL'
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : currentMeta.safetyLevel === 'HIGH'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {currentMeta.safetyLevel}
              </span>
            </div>
            <h2 className="font-bold text-sm truncate">{currentMeta.title}</h2>
          </div>
        </div>

        {/* Tab Controls & Reset */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`p-1 rounded-xl border flex items-center gap-1 text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'workspace'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Workspace
            </button>
            <button
              onClick={() => setActiveTab('guided')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'guided'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Guided Steps
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'safety'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Safety & Standards
            </button>
            <button
              onClick={() => setActiveTab('observe')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'observe'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Reflection Check
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'syllabus'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Syllabus Reference
            </button>
          </div>

          <button
            onClick={handleReset}
            className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
              isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Reset to default initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN VIEW CONTAINER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-hidden relative">
        {/* TAB 1: WORKSPACE */}
        {activeTab === 'workspace' && renderModuleWorkspace()}

        {/* TAB 2: GUIDED WALKTHROUGH */}
        {activeTab === 'guided' && (
          <div className="p-6 max-w-4xl mx-auto h-full overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base">Step-by-Step Guided Walkthrough</h3>
            </div>
            <p className="text-xs text-slate-400">
              Follow these sequential engineering steps to predict, manipulate, observe, and explain the system response.
            </p>

            <div className="space-y-3 pt-2">
              {currentMeta.guidedSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs uppercase tracking-wider text-indigo-400">
                      {step.title}
                    </span>
                    {step.recommendedSetting && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Target: {step.recommendedSetting}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">{step.instruction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SAFETY & STANDARDS */}
        {activeTab === 'safety' && (
          <div className="p-6 max-w-4xl mx-auto h-full overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base">Workshop Safety & Real vs Simulation Boundaries</h3>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-amber-400 block uppercase tracking-wide">
                  Official Safety Notice — {currentMeta.title}
                </span>
                <p className="text-slate-300 leading-relaxed">{currentMeta.safetyNotice}</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border space-y-3 text-xs leading-relaxed ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[11px]">
                Pedagogical Boundary Notice
              </span>
              <p className="text-slate-300">
                {currentMeta.disclaimer} This simulation is strictly an educational tool to develop conceptual understanding, safety decision-making, and diagnostic reasoning. It does not certify workshop competence, authorize unsupervised tool operation, or replace supervised physical laboratory training.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: WHAT DID YOU OBSERVE? (REFLECTION CHECK) */}
        {activeTab === 'observe' && (
          <div className="p-6 max-w-3xl mx-auto h-full overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base">"What Did You Observe?" — Knowledge & Reflection Check</h3>
            </div>
            <p className="text-xs text-slate-400">
              Apply what you observed during the simulation to answer this conceptual question.
            </p>

            <div className={`p-5 rounded-xl border space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h4 className="font-bold text-sm leading-snug">{currentMeta.reflectionCheck.question}</h4>

              <div className="space-y-2">
                {currentMeta.reflectionCheck.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedOption(idx);
                      setShowAnswer(true);
                    }}
                    className={`w-full p-3 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer flex items-start gap-3 ${
                      showAnswer && idx === currentMeta.reflectionCheck.correctIndex
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                        : showAnswer && selectedOption === idx && idx !== currentMeta.reflectionCheck.correctIndex
                        ? 'border-red-500 bg-red-500/10 text-red-300'
                        : selectedOption === idx
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : isDark
                        ? 'border-slate-800 hover:bg-slate-800/50 text-slate-300'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              {showAnswer && (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  selectedOption === currentMeta.reflectionCheck.correctIndex
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                }`}>
                  <span className="font-bold block mb-1">
                    {selectedOption === currentMeta.reflectionCheck.correctIndex ? '✓ Correct Explanation:' : '💡 Engineering Explanation:'}
                  </span>
                  <p>{currentMeta.reflectionCheck.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SYLLABUS REFERENCE */}
        {activeTab === 'syllabus' && (
          <div className="p-6 max-w-4xl mx-auto h-full overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base">Official Syllabus Mapping & Engineering Applications</h3>
            </div>

            <div className={`p-4 rounded-xl border grid grid-cols-2 md:grid-cols-4 gap-3 text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Course Code</span>
                <span className="text-sm font-bold text-indigo-400">{COURSE_METADATA.courseCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Regulation</span>
                <span className="text-sm font-bold">{COURSE_METADATA.regulation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Contact Allocation</span>
                <span className="text-sm font-bold text-emerald-400">{COURSE_METADATA.ltpjc} (60h Total)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Source Document</span>
                <span className="text-sm font-bold truncate">Printed Page {currentMeta.syllabusReference.printedPage}</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 text-xs leading-relaxed ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[11px]">
                Exact Syllabus Mapping:
              </span>
              <p className="font-semibold text-slate-200">
                {currentMeta.syllabusReference.module} ({currentMeta.syllabusReference.moduleHours} Hours)
              </p>
              <p className="text-slate-400 italic">
                Experiment {currentMeta.syllabusReference.experimentNumber}: "{currentMeta.syllabusReference.officialExperimentTitle}"
              </p>
              <div className="pt-2">
                <span className="font-bold text-emerald-400">
                  Course Outcome {currentMeta.syllabusReference.courseOutcome}:
                </span>{' '}
                <span className="text-slate-300">{currentMeta.syllabusReference.courseOutcomeDescription}</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 text-xs leading-relaxed ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[11px]">
                Underlying Engineering Idea:
              </span>
              <p className="text-slate-300">{currentMeta.engineeringIdea}</p>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 text-xs leading-relaxed ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[11px]">
                Civil & Interdisciplinary Applications:
              </span>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {currentMeta.realWorldApplications.map((app, idx) => (
                  <li key={idx}>{app}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
