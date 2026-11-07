import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Calculator,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Beaker,
  FlaskConical,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import {
  VirtualLabApi,
  type VirtualLabExperimentData,
  type VirtualLabSessionData,
  type VirtualLabReportData,
} from '../../services/virtual-lab.service';
import { ThemeToggle } from '../ui/ThemeToggle';
import { SafetyBriefingModal } from './SafetyBriefingModal';
import { ApparatusCabinet } from './ApparatusCabinet';
import { ReagentRack } from './ReagentRack';
import { ApparatusBench } from './ApparatusBench';
import { PhysicsApparatusBench } from './physics/PhysicsApparatusBench';
import { ObservationNotebookModal } from './ObservationNotebookModal';
import { CalculationModal } from './CalculationModal';
import { LabReportModal } from './LabReportModal';
import { ProcedureGuidePanel } from './ProcedureGuidePanel';

interface VirtualLabWorkspaceProps {
  experimentId: string;
  onExit?: () => void;
}

export const VirtualLabWorkspace: React.FC<VirtualLabWorkspaceProps> = ({
  experimentId,
  onExit,
}) => {
  // The standalone host has no router; leaving the lab is always handled by `onExit`.
  const navigate = (_to: string) => window.history.back();

  // State
  const [session, setSession] = useState<VirtualLabSessionData | null>(null);
  const [experiment, setExperiment] = useState<VirtualLabExperimentData | null>(null);
  const [report, setReport] = useState<VirtualLabReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals & Tabs
  const isPhysicsExp = experimentId.startsWith('EXP-P') || experimentId === 'vl-g10-ohms-law';
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);
  const [isCalculationOpen, setIsCalculationOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [leftTab, setLeftTab] = useState<'APPARATUS' | 'REAGENTS'>(() => isPhysicsExp ? 'APPARATUS' : 'REAGENTS');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLeftOpen, setIsLeftOpen] = useState<boolean>(() => !isPhysicsExp && window.innerWidth >= 1440);
  const [isRightOpen, setIsRightOpen] = useState<boolean>(() => !isPhysicsExp && window.innerWidth >= 1440);

  // Load experiment & create or resume session
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        setLoading(true);
        setErrorMsg(null);

        // Fetch experiment definition
        const expData = await VirtualLabApi.getExperiment(experimentId);
        if (!mounted) return;
        setExperiment(expData);

        // Start session
        const sessionData = await VirtualLabApi.startSession(experimentId);
        if (!mounted) return;
        setSession(sessionData);

        // If safety not yet acknowledged, display briefing dialog
        if (!sessionData.safetyAcknowledged) {
          setIsSafetyModalOpen(true);
        }
      } catch (err: any) {
        if (!mounted) return;
        setErrorMsg(
          err.message || 'Unable to initialize Virtual Laboratory session. Please verify active subscription.'
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [experimentId]);

  // Acknowledge safety protocol
  const handleAcknowledgeSafety = async () => {
    if (!session) return;
    try {
      setActionLoading(true);
      const updated = await VirtualLabApi.acknowledgeSafety(session._id);
      setSession(updated);
      setIsSafetyModalOpen(false);
    } catch (err: any) {
      console.warn('Backend safety acknowledgement fallback:', err);
      setSession((prev) => (prev ? { ...prev, safetyAcknowledged: true } : prev));
      setIsSafetyModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Perform bench action
  const handleBenchAction = async (action: {
    actionType: string;
    sourceVesselId?: string;
    targetVesselId?: string;
    volumeMl?: number;
    reagentId?: string;
  }) => {
    if (!session) return;
    try {
      setActionLoading(true);
      const result = await VirtualLabApi.performAction(session._id, action);
      setSession(result.session);
    } catch (err: any) {
      setErrorMsg(err.message || 'Action rejected by laboratory supervisor.');
    } finally {
      setActionLoading(false);
    }
  };

  // Record observation trial in notebook
  const handleRecordTrial = async (trial: {
    trialNumber: number;
    initialReadingMl: number;
    finalReadingMl: number;
    volumeUsedMl: number;
    notes?: string;
  }) => {
    if (!session) return;
    try {
      setActionLoading(true);
      const result = await VirtualLabApi.recordObservation(session._id, trial);
      setSession(result.session);
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Submit calculation worksheet
  const handleSubmitCalculation = async (calc: {
    reportedMolarityNaOH: number;
    reportedStrengthGL: number;
    concordantVolumeMl: number;
  }) => {
    if (!session) return;
    try {
      setActionLoading(true);
      const res = await VirtualLabApi.submitCalculation(session._id, calc);
      setSession(res.session);
      return res;
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Generate / View formal certified report
  const handleGenerateReport = async () => {
    if (!session) return;
    try {
      setActionLoading(true);
      const rep = await VirtualLabApi.finalizeReport(session._id, {
        precautionsTaken: [
          'Rinsed burette with NaOH solution before taking initial reading.',
          'Removed air bubble from burette nozzle tip before titration.',
          'Read lower meniscus at eye level against white ceramic background.',
        ],
      });
      setReport(rep);
      setIsReportOpen(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate formal certified laboratory report.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-[#070E17] text-slate-800 dark:text-slate-100 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Setting up NCERT Analytical Bench & Reagents...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-[#070E17] p-4 text-slate-800 dark:text-slate-100 transition-colors">
        <div className="max-w-md rounded-2xl border border-red-300 dark:border-red-500/30 bg-white dark:bg-[#0B1522] p-6 text-center shadow-2xl">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Laboratory Session Error</h2>
          <p className="mt-2 text-xs text-red-600 dark:text-red-200">{errorMsg}</p>
          <button
            type="button"
            onClick={onExit || (() => navigate('/simulations'))}
            className="mt-5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Return to Catalogue
          </button>
        </div>
      </div>
    );
  }

  if (!session || !experiment) return null;

  const trialsCount = session.observationNotebook?.trials?.length || 0;
  const isConcordanceAchieved = session.observationNotebook?.isConcordanceAchieved;
  const isCalculationsDone = session.calculationsAttempted?.serverVerified;

  const totalInventory = (experiment?.reagents?.length || 0) + (experiment?.apparatus?.length || 0);
  const totalSteps = experiment?.procedureSteps?.length || (experiment as any)?.steps?.length || 4;

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-900 dark:bg-[#050B13] dark:text-slate-100 overflow-hidden font-sans select-none transition-colors duration-150">
      {/* ─── MASTER TOP NAVIGATION BAR ─── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#08111D] px-3 sm:px-4 shadow-xs z-20 transition-colors">
        {/* Left: Experiment Context & Exit */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onExit || (() => navigate('/simulations'))}
            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-200 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 transition-all cursor-pointer shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Catalogue</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="rounded bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-500/40 px-1.5 py-0.2 text-[0.6875rem] font-mono font-bold shrink-0">
                {experiment.experimentId}
              </span>
              <span className="text-[0.6875rem] font-semibold text-slate-600 dark:text-slate-300 truncate">
                {experiment.subject} · {experiment.classLevel.toUpperCase().replace('-', ' ')}
              </span>
            </div>
            <h1 className="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white max-w-[200px] sm:max-w-sm md:max-w-lg lg:max-w-xl">
              {experiment.title}
            </h1>
          </div>
        </div>

        {/* Right: Panel Toggles, Actions, Notebook, Calculations, Report & Mode Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Panel Toggle: Inventory (Reagents & Apparatus) */}
          <button
            type="button"
            onClick={() => setIsLeftOpen((prev) => !prev)}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isLeftOpen
                ? 'border-teal-500 bg-teal-50 text-teal-800 dark:border-teal-500/60 dark:bg-teal-500/10 dark:text-teal-300 shadow-xs ring-1 ring-teal-500/30'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isLeftOpen ? 'Collapse Reagents & Apparatus' : 'Show Reagents & Apparatus'}
          >
            <FlaskConical className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden md:inline">Inventory</span>
            <span className="rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-teal-300 px-1.5 py-0.2 text-[0.6875rem] font-mono">
              {totalInventory}
            </span>
          </button>

          {/* Quick Panel Toggle: Procedure Guide */}
          <button
            type="button"
            onClick={() => setIsRightOpen((prev) => !prev)}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isRightOpen
                ? 'border-cyan-500 bg-cyan-50 text-cyan-800 dark:border-cyan-500/60 dark:bg-cyan-500/10 dark:text-cyan-300 shadow-xs ring-1 ring-cyan-500/30'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isRightOpen ? 'Collapse Step Guide' : 'Show Step Guide'}
          >
            <BookOpen className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden md:inline">Guide</span>
            <span className="rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-cyan-300 px-1.5 py-0.2 text-[0.6875rem] font-mono">
              {Math.min(totalSteps, (session.currentStepIndex || 0) + 1)}/{totalSteps}
            </span>
          </button>

          <div className="hidden lg:block h-5 w-[1px] bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* Safety Status Pill */}
          <button
            type="button"
            onClick={() => setIsSafetyModalOpen(true)}
            className="hidden xl:flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60 px-2.5 py-1 text-[0.6875rem] font-semibold transition-colors cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>PPE Verified</span>
          </button>

          {/* Observation Notebook Button */}
          <button
            type="button"
            onClick={() => setIsNotebookOpen(true)}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isConcordanceAchieved
                ? 'border-teal-500 bg-teal-50 text-teal-800 dark:border-teal-500/60 dark:bg-teal-500/10 dark:text-teal-300 shadow-xs'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Notebook</span>
            <span className="ml-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-cyan-300 px-1.5 py-0.2 text-[0.6875rem] font-mono">
              {trialsCount}
            </span>
          </button>

          {/* Calculations Worksheet Button */}
          <button
            type="button"
            onClick={() => setIsCalculationOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isCalculationsDone
                ? 'border-cyan-500 bg-cyan-50 text-cyan-800 dark:border-cyan-500/60 dark:bg-cyan-500/10 dark:text-cyan-300 shadow-xs'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Calculations</span>
            {isCalculationsDone && (
              <span className="ml-0.5 text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            )}
          </button>

          {/* Generate / View Certified Report Button */}
          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white dark:text-slate-950 hover:brightness-110 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <FileCheck2 className="h-4 w-4" />
            <span className="hidden sm:inline">Certified Report</span>
          </button>

          {/* Theme Mode Toggle (Dark / Light) */}
          <ThemeToggle variant="pill" size="sm" />

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:flex rounded-lg border border-slate-300 bg-slate-100 p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ─── DYNAMIC EXPANDABLE LAB WORKSPACE BODY ─── */}
      <div className="flex-1 flex overflow-hidden p-2 sm:p-2.5 gap-2 sm:gap-2.5 relative">
        {/* LEFT COLLAPSED EDGE HANDLE */}
        {!isLeftOpen && (
          <button
            type="button"
            onClick={() => setIsLeftOpen(true)}
            className="hidden md:flex absolute left-2.5 top-6 z-30 items-center gap-1.5 rounded-r-xl border border-l-0 border-teal-500/40 bg-white/95 dark:bg-[#08121E]/95 backdrop-blur-md px-2 py-3 text-[0.6875rem] font-bold text-teal-700 dark:text-teal-300 shadow-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all cursor-pointer [writing-mode:vertical-rl] rotate-180"
            title="Expand Inventory (Reagents & Apparatus)"
          >
            <FlaskConical className="h-3.5 w-3.5 rotate-90" />
            <span>Inventory ({totalInventory})</span>
          </button>
        )}

        {/* LEFT PANEL: Apparatus Cabinet & Reagent Rack (Collapsible) */}
        {isLeftOpen && (
          <div className="w-72 lg:w-80 h-full flex flex-col shrink-0 rounded-2xl border border-slate-200 bg-white text-slate-900 dark:border-slate-800/80 dark:bg-[#08121E] dark:text-slate-100 overflow-hidden shadow-md animate-fade-in transition-all">
            {/* Subtabs Header with Close Button */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0B1522] p-1.5 gap-1">
              <button
                type="button"
                onClick={() => setLeftTab('REAGENTS')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  leftTab === 'REAGENTS'
                    ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Reagents</span>
              </button>
              <button
                type="button"
                onClick={() => setLeftTab('APPARATUS')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  leftTab === 'APPARATUS'
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Beaker className="h-3.5 w-3.5" />
                <span>Apparatus</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLeftOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Collapse Panel"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-2">
              {leftTab === 'REAGENTS' ? (
                <ReagentRack reagents={experiment.reagents || []} />
              ) : (
                <ApparatusCabinet apparatus={experiment.apparatus || []} />
              )}
            </div>
          </div>
        )}

        {/* CENTER COLUMN: Hero Interactive Bench Stage (Expands to 100% when sidebars collapse) */}
        <div className="flex-1 h-full min-w-0 flex flex-col overflow-hidden">
          {isPhysicsExp ? (
            <PhysicsApparatusBench
              session={session}
              experiment={experiment}
              onRecordTrial={handleRecordTrial}
              isLoading={actionLoading}
            />
          ) : (
            <ApparatusBench
              session={session}
              experiment={experiment}
              onAction={handleBenchAction}
              onRecordTrial={handleRecordTrial}
              isLoading={actionLoading}
            />
          )}
        </div>

        {/* RIGHT COLLAPSED EDGE HANDLE */}
        {!isRightOpen && (
          <button
            type="button"
            onClick={() => setIsRightOpen(true)}
            className="hidden md:flex absolute right-2.5 top-6 z-30 items-center gap-1.5 rounded-l-xl border border-r-0 border-cyan-500/40 bg-white/95 dark:bg-[#08121E]/95 backdrop-blur-md px-2 py-3 text-[0.6875rem] font-bold text-cyan-700 dark:text-cyan-300 shadow-xl hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-all cursor-pointer [writing-mode:vertical-rl]"
            title="Expand Step Guide"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Guide ({Math.min(totalSteps, (session.currentStepIndex || 0) + 1)}/{totalSteps})</span>
          </button>
        )}

        {/* RIGHT PANEL: NCERT Procedure Checklist (Collapsible) */}
        {isRightOpen && (
          <div className="w-72 lg:w-80 h-full flex flex-col shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800/80 dark:bg-[#08121E] shadow-md animate-fade-in relative transition-all">
            <ProcedureGuidePanel
              steps={experiment.procedureSteps || (experiment as any).steps || []}
              currentStepIndex={session.currentStepIndex || 0}
              onClose={() => setIsRightOpen(false)}
            />
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}
      <SafetyBriefingModal
        isOpen={isSafetyModalOpen}
        experiment={experiment}
        onAcknowledge={handleAcknowledgeSafety}
        isLoading={actionLoading}
      />

      <ObservationNotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        session={session}
        experiment={experiment}
        onRecordTrial={handleRecordTrial}
        isLoading={actionLoading}
      />

      <CalculationModal
        isOpen={isCalculationOpen}
        onClose={() => setIsCalculationOpen(false)}
        session={session}
        experiment={experiment}
        onSubmitCalculation={handleSubmitCalculation}
        isLoading={actionLoading}
      />

      <LabReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={report}
      />
    </div>
  );
};
