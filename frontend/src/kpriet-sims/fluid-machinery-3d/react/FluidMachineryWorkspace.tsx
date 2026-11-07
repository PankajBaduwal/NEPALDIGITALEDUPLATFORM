import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  BookOpen,
  Info,
  Activity,
  FileText,
  Download,
  HelpCircle,
  CheckCircle,
  XCircle,
  Printer,
  X,
  Gauge,
  Layers,
} from 'lucide-react';
import type {
  FluidMachinerySimId,
  SimulationController,
  SimulationState,
} from '../core/types';
import { createFluidMachinerySimulation } from '../simulations';

interface FluidMachineryWorkspaceProps {
  simulationId: string;
  onBack?: () => void;
}

interface ObservationRecord {
  trialNumber: number;
  timestamp: string;
  parameters: Record<string, string | number | boolean>;
  metrics: Record<string, string | number>;
}

export const FluidMachineryWorkspace: React.FC<FluidMachineryWorkspaceProps> = ({
  simulationId,
  onBack,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SimulationController | null>(null);

  // Normalize simulation ID
  const validSimId: FluidMachinerySimId = useMemo(() => {
    const s = simulationId.toLowerCase();
    if (s.includes('bernoulli')) return 'u25me-bernoulli-theorem';
    if (s.includes('friction') || s.includes('pipe')) return 'u25me-pipe-friction';
    if (s.includes('flow-meter') || s.includes('venturi') || s.includes('orifice') || s.includes('rotameter'))
      return 'u25me-flow-meters';
    if (s.includes('pump') || s.includes('centrifugal') || s.includes('reciprocating'))
      return 'u25me-centrifugal-reciprocating-pumps';
    if (s.includes('turbine') || s.includes('pelton') || s.includes('francis'))
      return 'u25me-hydraulic-turbines';
    return 'u25me-machinery-performance-lab';
  }, [simulationId]);

  const [simState, setSimState] = useState<SimulationState>({
    currentStageIndex: 0,
    isPlaying: true,
    speed: 1.0,
    playbackSpeed: 1.0,
    currentTime: 0,
    timeElapsed: 0,
    mode: 'normal',
    viewMode: 'standard',
    selectedComponent: null,
    activeComponentId: null,
    labelsVisible: true,
    metrics: {},
    parameters: {},
    selectedParameterValues: {},
  });

  const [activeTab, setActiveTab] = useState<'guide' | 'params' | 'inspect' | 'analytics' | 'observations' | 'quiz'>('guide');
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [studentName, setStudentName] = useState('Piyush Dhara');
  const [studentRoll, setStudentRoll] = useState('711525ME101');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const ctrl = createFluidMachinerySimulation(validSimId, containerRef.current);
    controllerRef.current = ctrl;

    const unsubscribe = ctrl.onStateChange((newState) => {
      setSimState(newState);
    });

    return () => {
      unsubscribe();
      ctrl.dispose();
      controllerRef.current = null;
    };
  }, [validSimId]);

  const stages = controllerRef.current?.getStages() || [];
  const parameters = controllerRef.current?.getAvailableParameters() || [];
  const currentStage = stages[simState.currentStageIndex];

  // Simulation Metadata
  const simMetadata = useMemo(() => {
    switch (validSimId) {
      case 'u25me-bernoulli-theorem':
        return {
          title: "Verification of Bernoulli's Theorem Rig",
          code: 'U25ME304 · Experiment 1',
          desc: 'Energy conservation in converging-diverging conduit with static and velocity head measurements.',
        };
      case 'u25me-pipe-friction':
        return {
          title: 'Pipe Friction & Minor Losses Apparatus',
          code: 'U25ME304 · Experiment 5',
          desc: 'Darcy-Weisbach friction coefficient evaluation with U-tube differential mercury manometer.',
        };
      case 'u25me-flow-meters':
        return {
          title: 'Flow Meters Calibration Bench (Venturi, Orifice, Rotameter)',
          code: 'U25ME304 · Experiments 2, 3, 4',
          desc: 'Calibration of Venturimeter, thin plate Orifice meter, and vertical variable-area Rotameter.',
        };
      case 'u25me-centrifugal-reciprocating-pumps':
        return {
          title: 'Hydraulic Pumps Performance Test Rig',
          code: 'U25ME304 · Experiments 6, 7',
          desc: 'Operating characteristics of single-stage Centrifugal pump & double-acting Reciprocating pump.',
        };
      case 'u25me-hydraulic-turbines':
        return {
          title: 'Hydraulic Turbines Dynamics Suite (Pelton & Francis)',
          code: 'U25ME304 · Experiments 8, 9',
          desc: 'Impulse Pelton wheel and reaction Francis turbine characteristics, velocity triangles, and unit quantities.',
        };
      case 'u25me-machinery-performance-lab':
      default:
        return {
          title: 'Fluid Mechanics & Machinery Plant',
          code: 'U25MEG05 / U25ME304',
          desc: 'Integrated Mechanical Engineering hydraulic testing plant with closed-loop circulation.',
        };
    }
  }, [validSimId]);

  // Record an observation trial
  const recordObservation = () => {
    const record: ObservationRecord = {
      trialNumber: observations.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      parameters: { ...simState.selectedParameterValues },
      metrics: { ...simState.metrics },
    };
    setObservations((prev) => [...prev, record]);
  };

  // Export observations to CSV
  const exportToCSV = () => {
    const firstObs = observations[0];
    if (!firstObs) return;
    const paramKeys = Object.keys(firstObs.parameters);
    const metricKeys = Object.keys(firstObs.metrics);
    const headers = ['Trial #', 'Timestamp', ...paramKeys, ...metricKeys];

    const rows = observations.map((o) => [
      o.trialNumber,
      `"${o.timestamp}"`,
      ...paramKeys.map((k) => `"${o.parameters[k] ?? ''}"`),
      ...metricKeys.map((k) => `"${o.metrics[k] ?? ''}"`),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${validSimId}-observation-records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Conceptual Assessment Quiz Questions
  const quizQuestions = useMemo(() => {
    switch (validSimId) {
      case 'u25me-bernoulli-theorem':
        return [
          {
            q: 'At the narrow throat section of a horizontal venturi conduit, what happens to velocity and pressure?',
            options: ['Velocity drops, pressure rises', 'Velocity rises, pressure drops', 'Both velocity and pressure rise', 'Both remain unchanged'],
            correct: 1,
            expl: 'By continuity Q = A·v, smaller area increases velocity. By Bernoulli (p/ρg + v²/2g = const), higher velocity head causes static pressure to decrease.',
          },
          {
            q: "Why is the diverging angle (5°-7°) of a venturimeter much smaller than the converging angle (21°)?",
            options: ['To minimize overall pipe length', 'To prevent boundary layer separation and eddy head loss', 'To increase throat pressure', 'To reduce structural weight'],
            correct: 1,
            expl: 'In the diverging section, fluid faces an adverse pressure gradient (dp/dx > 0). A gradual taper prevents boundary layer separation and turbulence.',
          },
          {
            q: 'What is piezometric head in fluid dynamics?',
            options: ['Total head + datum', 'Sum of pressure head and datum head (p/ρg + z)', 'Velocity head only', 'Frictional loss head'],
            correct: 1,
            expl: 'Piezometric head equals (p/ρg + z), representing the level to which liquid rises in a vertical tube open to atmosphere.',
          },
        ];
      case 'u25me-pipe-friction':
        return [
          {
            q: 'In fully developed laminar flow through a pipe (Re < 2000), how does the Darcy friction factor f depend on Reynolds number?',
            options: ['f = 16 / Re', 'f = 64 / Re', 'f = 0.3164 / Re^0.25', 'f is independent of Re'],
            correct: 1,
            expl: 'From the Hagen-Poiseuille equation, Darcy friction factor for laminar pipe flow is strictly f = 64 / Re.',
          },
          {
            q: 'How does frictional head loss h_f vary with internal pipe diameter D according to Darcy-Weisbach equation?',
            options: ['h_f ∝ D', 'h_f ∝ 1/D', 'h_f ∝ 1/D⁵ (for constant discharge)', 'h_f ∝ D²'],
            correct: 2,
            expl: 'Since v = 4Q/(πD²), h_f = (f·L·v²)/(2gD) = (8·f·L·Q²)/(π²·g·D⁵). Thus for constant discharge Q, h_f is inversely proportional to D⁵.',
          },
          {
            q: 'A differential mercury manometer gives deflection y. The equivalent water head loss h_f is:',
            options: ['h_f = y · 13.6', 'h_f = y · (13.6 - 1) = 12.6 · y', 'h_f = y / 13.6', 'h_f = y'],
            correct: 1,
            expl: 'For an inverted or U-tube manometer with manometric fluid (SG=13.6) and flowing water (SG=1), h_f = y · (S_m/S_w - 1) = 12.6 · y.',
          },
        ];
      case 'u25me-flow-meters':
        return [
          {
            q: 'Why is the coefficient of discharge (Cd) of an orifice meter (~0.62) significantly lower than a venturimeter (~0.98)?',
            options: ['Orifice meters use heavier fluid', 'Vena contracta formation causes sudden expansion and eddy turbulence loss', 'Orifice plate produces laminar flow', 'Venturi conduits lack pressure taps'],
            correct: 1,
            expl: 'Fluid jet contracts downstream of the orifice to form a vena contracta, followed by uncontrolled turbulent mixing and substantial kinetic dissipation.',
          },
          {
            q: 'In a variable-area rotameter, what force keeps the suspended float in dynamic equilibrium?',
            options: ['Upward hydrodynamic drag + buoyancy = downward gravity weight', 'Surface tension alone', 'Centrifugal force', 'Electrostatic attraction'],
            correct: 0,
            expl: 'At equilibrium, upward fluid drag plus buoyant force exactly balances the downward gravitational weight of the float.',
          },
          {
            q: 'What is the relationship between theoretical discharge and differential head h across a venturi meter?',
            options: ['Q_th ∝ h', 'Q_th ∝ √h', 'Q_th ∝ h²', 'Q_th is independent of h'],
            correct: 1,
            expl: 'From Bernoulli theorem, velocity is proportional to √(2gh), so discharge Q_th is directly proportional to √h.',
          },
        ];
      case 'u25me-centrifugal-reciprocating-pumps':
        return [
          {
            q: 'What is the primary function of air vessels fitted on suction and delivery pipes of a reciprocating pump?',
            options: ['To cool the cylinder barrel', 'To reduce acceleration head and ensure nearly uniform discharge', 'To act as a flow meter', 'To prevent electrical short circuits'],
            correct: 1,
            expl: 'Air vessels act as hydraulic accumulators, absorbing fluid during acceleration and releasing it during retardation, eliminating friction and inertia head spikes.',
          },
          {
            q: 'When the delivery valve of a centrifugal pump is completely closed (shut-off condition), what is the discharge and power?',
            options: ['Maximum discharge, maximum power', 'Zero discharge, minimum motor load (shut-off head only)', 'Zero discharge, maximum power', 'Pump explodes instantly'],
            correct: 1,
            expl: 'At zero discharge (shut-off), water power is zero and the motor consumes only idle and churning disc-friction power. Shut-off head is maximum.',
          },
          {
            q: 'What causes cavitation in a centrifugal pump?',
            options: ['High discharge pressure', 'Local static pressure falling below fluid vapor pressure, forming vapor bubbles that collapse violently', 'Excessive lubrication in bearings', 'Air vessel over-pressurization'],
            correct: 1,
            expl: 'If suction pressure drops below water vapor pressure (e.g. excessive suction lift), vapor cavities form and collapse on impeller vanes, pitting the metal.',
          },
        ];
      case 'u25me-hydraulic-turbines':
      default:
        return [
          {
            q: 'Why are Pelton wheel runner buckets shaped as double-hemispherical cups with a central splitter ridge?',
            options: ['To look aerodynamic', 'To split the incoming jet into two equal halves and deflect water 165° without side thrust', 'To increase friction against air', 'To store excess water'],
            correct: 1,
            expl: 'The splitter ridge divides the high-speed jet symmetrically, deflecting each half backwards by ~165° to maximize momentum transfer without axial thrust.',
          },
          {
            q: 'What is the primary role of a divergent draft tube at the exit of a Francis reaction turbine runner?',
            options: ['To filter suspended sand', 'To recover exit kinetic energy by creating suction vacuum head and elevating overall efficiency', 'To compress outgoing air', 'To drive the brake drum'],
            correct: 1,
            expl: 'The gradually expanding draft tube decelerates exit water, converting exit kinetic head into suction pressure head, thereby increasing net available head.',
          },
          {
            q: 'Unit speed (Nu), Unit discharge (Qu), and Unit power (Pu) are defined for an effective working head of:',
            options: ['10 meters', '1 meter', '100 meters', 'Atmospheric pressure'],
            correct: 1,
            expl: 'Unit quantities scale hydraulic turbine behavior to an idealized operating head of exactly 1 meter (Nu = N/√H, Qu = Q/√H, Pu = P/H^1.5).',
          },
        ];
    }
  }, [validSimId]);

  const handleSelectQuiz = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const score = useMemo(() => {
    let s = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) s++;
    });
    return s;
  }, [quizAnswers, quizQuestions]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* ============================================================ */}
      {/* 1. TOP APPLICATION NAVIGATION TOOLBAR                        */}
      {/* ============================================================ */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Return to subjects"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {simMetadata.code}
              </span>
              <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-[280px] sm:max-w-md">
                {simMetadata.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Play/Pause */}
          <button
            onClick={() => (simState.isPlaying ? controllerRef.current?.pause() : controllerRef.current?.play())}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            title={simState.isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {simState.isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Camera Reset */}
          <button
            onClick={() => controllerRef.current?.resetCamera()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            title="Reset 3D Camera View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Record Trial Button */}
          <button
            onClick={recordObservation}
            className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow transition cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Record Trial</span>
          </button>

          {/* Official Report Modal */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lab Report</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN WORKSPACE (VIEWPORT + INTERACTIVE SIDEBAR)           */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {/* 3D WebGL Canvas Viewport */}
        <div className="flex-1 h-full min-h-[300px] relative bg-slate-950 overflow-hidden">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating Stage Progress Overlay */}
          {currentStage && (
            <div className="absolute top-3 left-3 max-w-sm bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-3 rounded-xl shadow-lg z-10 pointer-events-none">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>{currentStage.title}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {currentStage.description}
              </p>
            </div>
          )}

          {/* Floating Quick Telemetry Badge */}
          <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl shadow-lg z-10 hidden sm:flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-xs">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-slate-200">
                {simState.metrics['Pump Type'] || simState.metrics['Turbine Type'] || simState.metrics['Apparatus'] || 'Operational'}
              </span>
            </div>
            {simState.metrics['Discharge (Q)'] && (
              <div className="text-xs">
                <span className="text-slate-400">Q: </span>
                <span className="font-mono font-bold text-sky-400">{String(simState.metrics['Discharge (Q)'])}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Tabbed Engineering Panel */}
        <div className="w-full md:w-96 lg:w-[420px] bg-slate-900/95 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shrink-0 z-10 max-h-[50vh] md:max-h-full">
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/90 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('params')}
              className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'params'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Params</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('observations')}
              className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'observations'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Trials ({observations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inspect')}
              className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'inspect'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Quiz</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300">
            {/* ──────────────────────────────────────────────────────── */}
            {/* TAB: GUIDE                                              */}
            {/* ──────────────────────────────────────────────────────── */}
            {activeTab === 'guide' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
                  <h3 className="font-bold text-slate-100 flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Experiment Objectives</span>
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {simMetadata.desc}
                  </p>
                </div>

                {currentStage?.equations && (
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
                    <h3 className="font-bold text-slate-100 flex items-center space-x-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Governing Equations</span>
                    </h3>
                    <div className="space-y-1 font-mono text-[11px] text-emerald-300 bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/20">
                      {currentStage.equations.map((eq, i) => (
                        <div key={i}>{eq}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
                  <h3 className="font-bold text-slate-100">Live Calculated Metrics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(simState.metrics).map(([key, val]) => (
                      <div key={key} className="bg-slate-950/50 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400 truncate">{key}</div>
                        <div className="text-xs font-mono font-bold text-sky-300 truncate">{String(val)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────── */}
            {/* TAB: PARAMETERS                                         */}
            {/* ──────────────────────────────────────────────────────── */}
            {activeTab === 'params' && (
              <div className="space-y-4">
                <p className="text-slate-400 text-[11px]">
                  Adjust parameters in real time. The 3D equipment geometry, velocities, water heads, and numerical metrics will update dynamically.
                </p>

                {parameters.map((param) => {
                  const val = Number(simState.selectedParameterValues[param.id] ?? param.defaultValue);
                  return (
                    <div key={param.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{param.label}</span>
                        <span className="font-mono text-sky-400 font-bold">
                          {val} {param.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={val}
                        onChange={(e) => controllerRef.current?.setParameter(param.id, parseFloat(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">{param.description}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ──────────────────────────────────────────────────────── */}
            {/* TAB: ANALYTICS (DYNAMIC SVG PLOTS)                      */}
            {/* ──────────────────────────────────────────────────────── */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
                  <h3 className="font-bold text-slate-100 flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span>Dynamic Engineering Plot</span>
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Real-time analytical characteristic curves derived from the governing equations.
                  </p>

                  {/* SVG Plot based on active simulation */}
                  <div className="w-full h-44 bg-slate-950 rounded-lg border border-slate-800 p-2 relative flex items-center justify-center">
                    <svg viewBox="0 0 320 150" className="w-full h-full">
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="40" y2="120" stroke="#334155" strokeWidth="1" />
                      <line x1="40" y1="120" x2="300" y2="120" stroke="#334155" strokeWidth="1" />

                      {validSimId === 'u25me-bernoulli-theorem' && (
                        <>
                          {/* Venturi pressure drop and recovery curve */}
                          <path
                            d="M 40 40 Q 150 115 170 115 T 300 60"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                          />
                          {/* Total energy line (nearly flat, slight drop) */}
                          <line x1="40" y1="35" x2="300" y2="45" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                          <circle cx="170" cy="115" r="4" fill="#f43f5e" />
                          <text x="175" y="115" fill="#f43f5e" fontSize="9">Throat (Min P)</text>
                          <text x="50" y="30" fill="#10b981" fontSize="9">Total Energy (TEL)</text>
                          <text x="50" y="55" fill="#38bdf8" fontSize="9">Hydraulic Grade (HGL)</text>
                        </>
                      )}

                      {validSimId === 'u25me-pipe-friction' && (
                        <>
                          {/* Moody Friction curve */}
                          <path
                            d="M 40 40 L 100 110 M 130 95 Q 220 85 300 82"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                          />
                          <text x="55" y="60" fill="#f59e0b" fontSize="9">Laminar (64/Re)</text>
                          <text x="180" y="75" fill="#f59e0b" fontSize="9">Turbulent (Blasius)</text>
                          <text x="105" y="105" fill="#94a3b8" fontSize="8">Re=2000-4000</text>
                        </>
                      )}

                      {(validSimId === 'u25me-flow-meters') && (
                        <>
                          {/* Differential Head vs Q curve */}
                          <path
                            d="M 40 120 Q 180 80 300 25"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                          />
                          <path
                            d="M 40 120 Q 180 100 300 60"
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2.0"
                            strokeDasharray="2 2"
                          />
                          <text x="180" y="40" fill="#38bdf8" fontSize="9">Venturimeter (Cd≈0.97)</text>
                          <text x="180" y="85" fill="#f43f5e" fontSize="9">Orifice (Cd≈0.62)</text>
                        </>
                      )}

                      {(validSimId === 'u25me-centrifugal-reciprocating-pumps') && (
                        <>
                          {/* Pump H-Q and Efficiency curves */}
                          <path
                            d="M 40 35 Q 160 45 300 115"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                          />
                          <path
                            d="M 40 120 Q 180 30 300 110"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                          />
                          <text x="50" y="45" fill="#38bdf8" fontSize="9">Head-Discharge (H-Q)</text>
                          <text x="170" y="40" fill="#10b981" fontSize="9">Efficiency (η-Q)</text>
                        </>
                      )}

                      {(validSimId === 'u25me-hydraulic-turbines' || validSimId === 'u25me-machinery-performance-lab') && (
                        <>
                          {/* Turbine Efficiency vs Unit Speed */}
                          <path
                            d="M 40 115 Q 170 30 300 115"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                          />
                          <circle cx="170" cy="40" r="4" fill="#38bdf8" />
                          <text x="130" y="30" fill="#38bdf8" fontSize="9">Optimal Operating Point</text>
                          <text x="50" y="100" fill="#94a3b8" fontSize="9">Efficiency vs Unit Speed Nu</text>
                        </>
                      )}

                      {/* Axes Labels */}
                      <text x="270" y="135" fill="#94a3b8" fontSize="9">Flow / Speed</text>
                      <text x="10" y="25" fill="#94a3b8" fontSize="9">Head / Eff</text>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────────────── */}
            {/* TAB: OBSERVATION LOG TABLE                              */}
            {/* ──────────────────────────────────────────────────────── */}
            {activeTab === 'observations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-[11px]">
                    Recorded laboratory experimental trials ({observations.length}).
                  </p>
                  {observations.length > 0 && (
                    <button
                      onClick={exportToCSV}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>

                {observations.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    No observations recorded yet. Click "Record Trial" in the top bar to log current experimental readings.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400">
                          <th className="p-1">#</th>
                          <th className="p-1">Time</th>
                          <th className="p-1">Discharge</th>
                          <th className="p-1">Head / Reading</th>
                          <th className="p-1">Efficiency / Coeff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {observations.map((o) => (
                          <tr key={o.trialNumber} className="border-b border-slate-800 text-slate-300">
                            <td className="p-1 font-bold text-sky-400">{o.trialNumber}</td>
                            <td className="p-1 text-slate-400">{o.timestamp}</td>
                            <td className="p-1 font-mono">{String(o.metrics['Discharge (Q)'] || o.metrics['Theoretical Flow (Qth)'] || '-')}</td>
                            <td className="p-1 font-mono">{String(o.metrics['Throat Pressure Head (h2)'] || o.metrics['Total Manometric Head (Hm)'] || o.metrics['Manometer Deflection (y)'] || '-')}</td>
                            <td className="p-1 font-mono text-emerald-400">{String(o.metrics['Overall Efficiency (ηo)'] || o.metrics['Discharge Coeff (Cd)'] || o.metrics['Darcy Friction Factor (f)'] || '-')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ──────────────────────────────────────────────────────── */}
            {/* TAB: COMPONENT INSPECTION                               */}
            {/* ──────────────────────────────────────────────────────── */}
            {activeTab === 'inspect' && (
              <div className="space-y-4">
                {simState.selectedComponent ? (
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        {simState.selectedComponent.category}
                      </span>
                      <h3 className="font-bold text-slate-100">{simState.selectedComponent.name}</h3>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {simState.selectedComponent.description}
                    </p>

                    <div className="pt-2 border-t border-slate-700/50 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Technical Specifications
                      </span>
                      {Object.entries(simState.selectedComponent.specifications).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-slate-400">{k}:</span>
                          <span className="font-mono font-semibold text-slate-200">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    Click directly on any pipe, valve, pump casing, turbine bucket, or manometer in the 3D scene to inspect its engineering properties.
                  </div>
                )}
              </div>
            )}

            {/* ──────────────────────────────────────────────────────── */}
            {/* TAB: CONCEPT ASSESSMENT QUIZ                            */}
            {/* ──────────────────────────────────────────────────────── */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Conceptual Evaluation</span>
                  {quizSubmitted && (
                    <span className="font-bold text-emerald-400">
                      Score: {score} / {quizQuestions.length}
                    </span>
                  )}
                </div>

                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
                    <p className="font-semibold text-slate-200 text-xs">
                      {qIdx + 1}. {q.q}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === oIdx;
                        const isCorrect = q.correct === oIdx;
                        let btnStyle = 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600';
                        if (quizSubmitted) {
                          if (isCorrect) btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300';
                          else if (isSelected) btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                        } else if (isSelected) {
                          btnStyle = 'bg-sky-950/60 border-sky-500 text-sky-300';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectQuiz(qIdx, oIdx)}
                            className={`w-full text-left p-2 rounded-lg border text-[11px] transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-[10px] text-emerald-400/90 bg-emerald-950/30 p-2 rounded border border-emerald-900/40">
                        {q.expl}
                      </p>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={quizSubmitted || Object.keys(quizAnswers).length < quizQuestions.length}
                  className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shadow transition cursor-pointer"
                >
                  {quizSubmitted ? 'Quiz Evaluated' : 'Submit Answers'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MODAL: OFFICIAL PRACTICAL LABORATORY REPORT               */}
      {/* ============================================================ */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Practical Examination Laboratory Report — {simMetadata.code}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-xs text-slate-800 font-serif leading-relaxed">
              {/* Institution Title */}
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                <h1 className="text-base font-bold tracking-wider uppercase font-sans text-slate-900">
                  KPR Institute of Engineering and Technology
                </h1>
                <p className="text-[11px] font-sans text-slate-600">
                  (Autonomous Institution · Affiliated to Anna University Chennai · Accredited by NAAC A+)
                </p>
                <p className="text-xs font-bold font-sans text-slate-900">
                  DEPARTMENT OF MECHANICAL ENGINEERING
                </p>
                <p className="text-[11px] font-sans font-semibold text-emerald-700">
                  Course: U25MEG05 / U25ME304 — Fluid Mechanics and Machinery Laboratory (Semester III)
                </p>
              </div>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded font-sans text-xs">
                <div>
                  <span className="font-bold text-slate-600">Student Name: </span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="border-b border-slate-400 font-bold px-1 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-600">Register No: </span>
                  <input
                    type="text"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    className="border-b border-slate-400 font-bold px-1 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-600">Experiment: </span>
                  <span className="font-bold">{simMetadata.title}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Date of Conduct: </span>
                  <span className="font-bold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Aim & Objectives */}
              <div className="space-y-1">
                <h3 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  1. Aim & Objective
                </h3>
                <p>{simMetadata.desc}</p>
              </div>

              {/* Governing Equations */}
              <div className="space-y-1">
                <h3 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  2. Governing Equations & Theoretical Formulation
                </h3>
                {currentStage?.equations && (
                  <div className="font-mono text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                    {currentStage.equations.map((eq, i) => (
                      <div key={i}>{eq}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Operating Parameters */}
              <div className="space-y-1">
                <h3 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  3. Experimental Boundary Configuration
                </h3>
                <table className="w-full border-collapse border border-slate-300 font-sans text-[11px]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-1.5 text-left">Parameter Name</th>
                      <th className="border border-slate-300 p-1.5 text-left">Applied Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(simState.selectedParameterValues).map(([k, v]) => (
                      <tr key={k}>
                        <td className="border border-slate-300 p-1.5 text-slate-700">{k}</td>
                        <td className="border border-slate-300 p-1.5 font-bold">{String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Observations Table */}
              <div className="space-y-1">
                <h3 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  4. Observation Table
                </h3>
                {observations.length > 0 ? (
                  <table className="w-full border-collapse border border-slate-300 font-sans text-[10px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-1">Trial #</th>
                        <th className="border border-slate-300 p-1">Timestamp</th>
                        <th className="border border-slate-300 p-1">Parameters</th>
                        <th className="border border-slate-300 p-1">Measured Results</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map((o) => (
                        <tr key={o.trialNumber}>
                          <td className="border border-slate-300 p-1 text-center font-bold">{o.trialNumber}</td>
                          <td className="border border-slate-300 p-1 text-center">{o.timestamp}</td>
                          <td className="border border-slate-300 p-1 font-mono">
                            {Object.entries(o.parameters).map(([k, v]) => `${k}=${v}`).join(', ')}
                          </td>
                          <td className="border border-slate-300 p-1 font-mono font-bold text-emerald-800">
                            {Object.entries(o.metrics).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="italic text-slate-500">Live observation recorded: {Object.entries(simState.metrics).map(([k, v]) => `${k} = ${v}`).join(', ')}</p>
                )}
              </div>

              {/* Conclusion */}
              <div className="space-y-1 pt-2">
                <h3 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  5. Conclusion
                </h3>
                <p>
                  The interactive simulation of <strong>{simMetadata.title}</strong> was successfully executed. The experimental fluid velocity, pressure distribution, head loss, and operating efficiencies conform accurately with theoretical fluid mechanics predictions.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between font-sans text-xs">
                <div className="border-t border-slate-400 pt-1 w-44 text-center">
                  <span className="font-bold">Student Signature</span>
                </div>
                <div className="border-t border-slate-400 pt-1 w-44 text-center">
                  <span className="font-bold">Faculty In-Charge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
