/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Standardized Eduverse Presentation Workspace
 *
 * Implements 20 High-Fidelity 3D Engineering Mechanics Simulations
 * mapped to Anna University Syllabus (Units I through V):
 * - Unit I: Statics of Particles (Sims 01 - 03)
 * - Unit II: Equilibrium of Rigid Bodies (Sims 04 - 06)
 * - Unit III: Properties of Surfaces & Solids (Sims 07 - 09)
 * - Unit IV: Friction (Sims 10 - 13)
 * - Unit V: Dynamics of Particles & Rigid Bodies (Sims 14 - 20)
 *
 * Aesthetics:
 * - Crisp white theme default (bg-white, bg-slate-50, border-slate-200)
 * - Pure black / dark slate high-contrast typography (#0f172a, text-slate-900)
 * - Engineering blue / slate metallic accents (#0284c7, #2563eb, #334155)
 * - Integrated Theme Switcher (Light / Dark mode)
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  Compass,
  Info,
  Layers,
  Sliders,
  HelpCircle,
  Eye,
  Sun,
  Moon,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Award,
  BarChart2,
  FileText,
  Download,
  ListChecks,
  Printer,
  Calculator,
} from 'lucide-react';

import type {
  MechanicsSimId,
  SimulationController,
  SimulationState,
  ComponentInspectionData,
  StageDefinition,
} from '../core/types';
import { createMechanicsSimulation } from '../index';
import { MechanicsCalculator } from '../core/MechanicsCalculator';

export interface MechanicsSimMeta {
  id: MechanicsSimId;
  title: string;
  unit: string;
  unitNum: 'I' | 'II' | 'III' | 'IV' | 'V';
  shortDesc: string;
  icon: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  estMinutes: number;
}

export const MECHANICS_SIMULATIONS: MechanicsSimMeta[] = [
  // UNIT I: STATICS OF PARTICLES
  {
    id: '01-force-systems',
    title: '2D and 3D Force Systems',
    unit: 'Unit I: Statics of Particles',
    unitNum: 'I',
    shortDesc: 'Resolution of concurrent forces into Cartesian components, vector resultant, and particle equilibrium.',
    icon: '🧭',
    difficulty: 'Foundation',
    estMinutes: 20,
  },
  {
    id: '02-cable-tensions',
    title: 'Particle Equilibrium and Cable Tensions',
    unit: 'Unit I: Statics of Particles',
    unitNum: 'I',
    shortDesc: 'Suspended load on multi-cable boom, Lami\'s theorem, and spatial equilibrium equations (ΣF = 0).',
    icon: '⛓️',
    difficulty: 'Foundation',
    estMinutes: 20,
  },
  {
    id: '03-fbd-lab',
    title: 'Free-Body Diagram Laboratory',
    unit: 'Unit I: Statics of Particles',
    unitNum: 'I',
    shortDesc: 'Isolation of physical bodies, contact reaction palette, and validation of Newtonian force balances.',
    icon: '📐',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },

  // UNIT II: EQUILIBRIUM OF RIGID BODIES
  {
    id: '04-moments-couples',
    title: 'Moments, Couples and Varignon\'s Theorem',
    unit: 'Unit II: Equilibrium of Rigid Bodies',
    unitNum: 'II',
    shortDesc: 'Vector cross product M = r × F, couple moments as free vectors, and moment principle proof.',
    icon: '🔄',
    difficulty: 'Foundation',
    estMinutes: 20,
  },
  {
    id: '05-support-reactions',
    title: 'Rigid-Body Equilibrium and Support Reactions',
    unit: 'Unit II: Equilibrium of Rigid Bodies',
    unitNum: 'II',
    shortDesc: 'Simply supported, cantilever, and overhanging beams under point and distributed loads (UDL).',
    icon: '🏗️',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: '06-truss-analysis',
    title: 'Truss Analysis by Method of Joints',
    unit: 'Unit II: Equilibrium of Rigid Bodies',
    unitNum: 'II',
    shortDesc: 'Planar pin-jointed bridge truss, axial force solution, zero-force members, tension and compression.',
    icon: '🌉',
    difficulty: 'Intermediate',
    estMinutes: 30,
  },

  // UNIT III: PROPERTIES OF SURFACES AND SOLIDS
  {
    id: '07-composite-centroids',
    title: 'Centroid of Composite Areas',
    unit: 'Unit III: Properties of Surfaces & Solids',
    unitNum: 'III',
    shortDesc: 'First moment of area, composite planar shapes, negative area holes, and coordinates (X̄, Ȳ).',
    icon: '🎯',
    difficulty: 'Foundation',
    estMinutes: 20,
  },
  {
    id: '08-area-moments-inertia',
    title: 'Area Moment of Inertia and Radius of Gyration',
    unit: 'Unit III: Properties of Surfaces & Solids',
    unitNum: 'III',
    shortDesc: 'Second moment of area, Steiner\'s parallel axis theorem, and radius of gyration k = √(I/A).',
    icon: '📊',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: '09-center-of-gravity',
    title: 'Centre of Gravity of 3D Bodies',
    unit: 'Unit III: Properties of Surfaces & Solids',
    unitNum: 'III',
    shortDesc: 'Spatial mass integration, composite solids, support footprint polygon, and tipping stability.',
    icon: '⚖️',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },

  // UNIT IV: FRICTION
  {
    id: '10-inclined-plane',
    title: 'Dry Friction and Inclined Plane',
    unit: 'Unit IV: Friction',
    unitNum: 'IV',
    shortDesc: 'Coulomb static & kinetic friction, angle of repose θ_c = arctan(μ_s), and slip threshold.',
    icon: '📐',
    difficulty: 'Foundation',
    estMinutes: 20,
  },
  {
    id: '11-ladder-friction',
    title: 'Ladder Friction & Limiting Equilibrium',
    unit: 'Unit IV: Friction',
    unitNum: 'IV',
    shortDesc: 'Wall and floor reactions, climber ascent, moment balance, and factor of safety against slide-out.',
    icon: '🪜',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: '12-wedge-friction',
    title: 'Wedge Friction and Load Lifting',
    unit: 'Unit IV: Friction',
    unitNum: 'IV',
    shortDesc: 'Mechanical advantage, multi-contact friction angles, lifting effort, and self-locking criteria (α < 2Φ).',
    icon: '🪓',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: '13-rolling-resistance',
    title: 'Wheel Friction and Rolling Resistance',
    unit: 'Unit IV: Friction',
    unitNum: 'IV',
    shortDesc: 'Deformation footprint, forward normal offset b, resisting moment M_r = W·b, and skidding comparison.',
    icon: '🛞',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },

  // UNIT V: DYNAMICS OF PARTICLES AND RIGID BODIES
  {
    id: '14-rectilinear-motion',
    title: 'Rectilinear Motion & Kinematic Scrubbing',
    unit: 'Unit V: Dynamics of Particles & Rigid Bodies',
    unitNum: 'V',
    shortDesc: 'Galilean kinematics s(t), v(t), a(t), calibrated track, velocity/acceleration vector alignment.',
    icon: '🏎️',
    difficulty: 'Foundation',
    estMinutes: 20,
  },
  {
    id: '15-projectile-motion',
    title: 'Curvilinear and Projectile Motion',
    unit: 'Unit V: Dynamics of Particles & Rigid Bodies',
    unitNum: 'V',
    shortDesc: 'Parabolic trajectories, orthogonal independence, apex altitude, range, tangential & normal acceleration.',
    icon: '🚀',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: '16-newtons-second-law',
    title: 'Newton\'s Second Law & Connected Bodies',
    unit: 'Unit V: Dynamics of Particles & Rigid Bodies',
    unitNum: 'V',
    shortDesc: 'Atwood apparatus, string constraint, coupled acceleration a, and internal cable tension T.',
    icon: '⚙️',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: '17-work-energy',
    title: 'Work–Energy Principle & Buffer Spring',
    unit: 'Unit V: Dynamics of Particles & Rigid Bodies',
    unitNum: 'V',
    shortDesc: 'Kinetic, gravitational, and elastic potential energy exchange, with non-conservative friction dissipation.',
    icon: '⚡',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: '18-impulse-momentum',
    title: 'Impulse, Momentum and Impact',
    unit: 'Unit V: Dynamics of Particles & Rigid Bodies',
    unitNum: 'V',
    shortDesc: 'Conservation of linear momentum, coefficient of restitution e, impact impulse J, and energy dissipation.',
    icon: '💥',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: '19-rotational-dynamics',
    title: 'Rotational Motion of Rigid Bodies',
    unit: 'Unit V: Dynamics of Particles & Rigid Bodies',
    unitNum: 'V',
    shortDesc: 'Fixed-axis torque equation Στ = I·α, solid disc vs hollow ring inertia, angular velocity, and RPM.',
    icon: '🔄',
    difficulty: 'Intermediate',
    estMinutes: 25,
  },
  {
    id: '20-impact-conservation',
    title: 'Impact Comparison & Conservation Laws',
    unit: 'Unit V: Dynamics of Particles & Rigid Bodies',
    unitNum: 'V',
    shortDesc: 'Direct side-by-side benchmark of elastic (e=1), inelastic (e=0.6), and perfectly plastic (e=0) collisions.',
    icon: '🛡️',
    difficulty: 'Advanced',
    estMinutes: 30,
  },
];

export interface MechanicsObservationRecord {
  trialNumber: number;
  timestamp: string;
  simId: string;
  simTitle: string;
  parameters: Record<string, any>;
  metrics: Record<string, any>;
}

interface Props {
  initialSimId?: MechanicsSimId;
  onBackToCourse?: () => void;
}

export const MechanicsVirtualLabWorkspace: React.FC<Props> = ({
  initialSimId = '01-force-systems',
  onBackToCourse,
}) => {
  const [currentSimId, setCurrentSimId] = useState<MechanicsSimId>(initialSimId);
  const [activeTab, setActiveTab] = useState<'guide' | 'inspect' | 'params' | 'analytics' | 'observations' | 'quiz' | 'legend'>('guide');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [catalogOpen, setCatalogOpen] = useState<boolean>(false);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Defaults to pristine white

  // Student Learning Workflow States
  const [observations, setObservations] = useState<MechanicsObservationRecord[]>([]);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('Piyush Sharma');
  const [studentRoll, setStudentRoll] = useState<string>('711124104001');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Controller & State
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SimulationController | null>(null);

  const [simState, setSimState] = useState<SimulationState>({
    currentStageIndex: 0,
    isPlaying: false,
    speed: 1.0,
    playbackSpeed: 1.0,
    currentTime: 0,
    timeElapsed: 0,
    mode: 'default',
    viewMode: 'standard',
    selectedComponent: null,
    activeComponentId: null,
    labelsVisible: true,
    metrics: {},
    parameters: {},
    selectedParameterValues: {},
  });

  const [stages, setStages] = useState<StageDefinition[]>([]);
  const [inspectedComponent, setInspectedComponent] = useState<ComponentInspectionData | null>(null);

  const currentMeta = MECHANICS_SIMULATIONS.find((s) => s.id === currentSimId) || MECHANICS_SIMULATIONS[0]!;
  const currentStage = stages[simState.currentStageIndex];

  // Mount/Unmount simulation when currentSimId changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Dispose old controller
    if (controllerRef.current) {
      controllerRef.current.dispose();
      controllerRef.current = null;
    }

    try {
      const controller = createMechanicsSimulation(currentSimId, containerRef.current, {
        theme: isDarkMode ? 'dark' : 'light',
      });
      controllerRef.current = controller;

      setStages(controller.getStages());
      setSimState(controller.getState());
      setInspectedComponent(controller.getInspectedComponent ? controller.getInspectedComponent() : null);

      controller.onStateChange((newState) => {
        setSimState({ ...newState });
      });

      if (controller.onComponentInspect) {
        controller.onComponentInspect((comp: ComponentInspectionData | null) => {
          setInspectedComponent(comp);
          if (comp) setActiveTab('inspect');
        });
      }
    } catch (err) {
      console.error('Failed to mount mechanics simulation:', err);
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.dispose();
        controllerRef.current = null;
      }
    };
  }, [currentSimId]);

  // Update theme when toggled
  useEffect(() => {
    if (controllerRef.current && controllerRef.current.setTheme) {
      controllerRef.current.setTheme(isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!controllerRef.current) return;
    if (simState.isPlaying) {
      controllerRef.current.pause();
    } else {
      controllerRef.current.play();
    }
  };

  const handleReset = () => {
    if (controllerRef.current?.resetExperiment) {
      controllerRef.current.resetExperiment();
    } else {
      controllerRef.current?.reset();
    }
  };

  const handleNextStage = () => {
    controllerRef.current?.nextStage();
  };

  const handlePrevStage = () => {
    if (controllerRef.current?.previousStage) {
      controllerRef.current.previousStage();
    } else {
      controllerRef.current?.prevStage();
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (controllerRef.current?.setPlaybackSpeed) {
      controllerRef.current.setPlaybackSpeed(speed);
    } else {
      controllerRef.current?.setSpeed(speed);
    }
  };

  const handleStageSelect = (idx: number) => {
    controllerRef.current?.setStage(idx);
  };

  const handleResetCamera = () => {
    controllerRef.current?.resetCamera();
  };

  const handleParameterChange = (key: string, value: number | string | boolean) => {
    controllerRef.current?.setParameter(key, value);
    setInspectedComponent(controllerRef.current?.getInspectedComponent ? controllerRef.current.getInspectedComponent() : null);
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

  // Observation Recording
  const handleRecordObservation = () => {
    const newRecord: MechanicsObservationRecord = {
      trialNumber: observations.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      simId: currentSimId,
      simTitle: currentMeta.title,
      parameters: { ...simState.selectedParameterValues },
      metrics: { ...simState.metrics },
    };
    setObservations((prev) => [newRecord, ...prev]);
  };

  const handleExportCSV = () => {
    if (observations.length === 0) return;
    const headers = ['Trial', 'Timestamp', 'Simulation', 'Parameters', 'Metrics'];
    const rows = observations.map((o) => [
      o.trialNumber,
      `"${o.timestamp}"`,
      `"${o.simTitle}"`,
      `"${Object.entries(o.parameters).map(([k, v]) => `${k}:${v}`).join('; ')}"`,
      `"${Object.entries(o.metrics).map(([k, v]) => `${k}:${v}`).join('; ')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mechanics_lab_observations_${currentSimId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearObservations = () => {
    setObservations([]);
  };

  return (
    <div
      className={`w-full h-screen flex flex-col font-sans select-none overflow-hidden ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* ============================================================ */}
      {/* 1. TOP APPLICATION NAVIGATION & LAB BAR                      */}
      {/* ============================================================ */}
      <header
        className={`h-14 px-4 flex items-center justify-between border-b shrink-0 z-30 transition-colors ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCatalogOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-semibold text-xs transition"
          >
            <Compass className="w-4 h-4 text-sky-600" />
            <span>Simulations Catalogue</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-600 text-white text-[10px]">20</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {currentMeta.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Unit {currentMeta.unitNum}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                U25RME201 · PCC
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 font-medium truncate max-w-md hidden md:block">
              {currentMeta.unit}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Lab Report Generator Button */}
          <button
            onClick={() => setIsReportOpen(true)}
            title="Generate Official Laboratory Practical Report"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lab Report</span>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            title="Reset 3D Camera"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Tour / Help */}
          <button
            onClick={() => setHelpOpen(true)}
            title="Simulation Tour & Guide"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onBackToCourse && (
            <button
              onClick={onBackToCourse}
              className="ml-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
            >
              Exit Lab
            </button>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN 3D LAB WORKSPACE (VIEWPORT + SIDEBAR)               */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 3D WebGL Canvas Viewport */}
        <div className="flex-1 relative overflow-hidden bg-white dark:bg-slate-950">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating Stage Indicator Pill (Top Left of 3D Viewport) */}
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Stage {simState.currentStageIndex + 1} of {stages.length || 4}:
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
              {currentStage?.title.replace(/^Stage \d+:\s*/, '') || 'Physical Analysis'}
            </span>
          </div>

          {/* Floating Live Telemetry HUD (Top Right of 3D Viewport) */}
          {simState.metrics && Object.keys(simState.metrics).length > 0 && (
            <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md max-w-xs space-y-1.5 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <Compass className="w-3 h-3" /> Live Telemetry
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                {Object.entries(simState.metrics).map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[9px] text-slate-700 dark:text-slate-300 truncate">{key}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. FLOATING INTERACTIVE TIMELINE CONTROLLER                  */}
          {/* ============================================================ */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            {/* Previous Stage */}
            <button
              onClick={handlePrevStage}
              disabled={simState.currentStageIndex === 0}
              title="Previous Stage"
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              title={simState.isPlaying ? 'Pause Simulation' : 'Play / Animate Stage'}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-sky-600/20 transition active:scale-95"
            >
              {simState.isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{simState.isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {/* Replay / Reset */}
            <button
              onClick={handleReset}
              title="Reset Stage Simulation"
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Next Stage */}
            <button
              onClick={handleNextStage}
              disabled={simState.currentStageIndex >= stages.length - 1}
              title="Next Stage"
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Stage Timeline Dots */}
            <div className="flex items-center space-x-1.5 px-1">
              {stages.map((stg, i) => (
                <button
                  key={stg.id || i}
                  onClick={() => handleStageSelect(i)}
                  title={stg.title}
                  className={`h-2.5 rounded-full transition-all ${
                    i === simState.currentStageIndex
                      ? 'w-6 bg-sky-600 dark:bg-sky-400'
                      : i < simState.currentStageIndex
                      ? 'w-2.5 bg-slate-400 dark:bg-slate-600'
                      : 'w-2.5 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* Speed Control Selector */}
            <select
              value={simState.playbackSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              aria-label="Playback Speed"
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 border-0 focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              <option value="0.5">0.5x</option>
              <option value="1.0">1.0x</option>
              <option value="1.5">1.5x</option>
              <option value="2.0">2.0x</option>
            </select>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. MULTI-TAB SCIENTIFIC & INTERACTION SIDEBAR               */}
        {/* ============================================================ */}
        <aside
          className={`w-96 border-l flex flex-col shrink-0 z-20 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Sidebar Tab Header */}
          <div
            className={`flex items-center border-b px-2 pt-2 gap-1 ${
              isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-white'
            }`}
          >
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-2.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center justify-center space-x-1 ${
                activeTab === 'guide'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('inspect')}
              className={`px-2.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center justify-center space-x-1 ${
                activeTab === 'inspect'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>

            <button
              onClick={() => setActiveTab('params')}
              className={`px-2.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center justify-center space-x-1 ${
                activeTab === 'params'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Controls</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-2.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center justify-center space-x-1 ${
                activeTab === 'analytics'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('observations')}
              className={`px-2.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center justify-center space-x-1 ${
                activeTab === 'observations'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-2.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center justify-center space-x-1 ${
                activeTab === 'quiz'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('legend')}
              className={`px-2 py-2 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center justify-center space-x-1 ${
                activeTab === 'legend'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Legend</span>
            </button>
          </div>

          {/* Sidebar Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-900 dark:text-slate-100">
            {/* TAB 1: LEARNING GUIDE */}
            {activeTab === 'guide' && (
              <div className="space-y-4">
                {currentStage ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                        Current Objective
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {currentStage.title}
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {currentStage.shortDescription}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
                        <span>Scientific Explanation</span>
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-normal">
                        {currentStage.detailedExplanation}
                      </p>
                    </div>

                    {currentStage.principles && currentStage.principles.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Governing Physical Principles</span>
                        </span>
                        <ul className="space-y-1.5">
                          {currentStage.principles.map((p, i) => (
                            <li key={i} className="text-xs text-slate-800 dark:text-slate-300 flex items-start space-x-2">
                              <span className="text-sky-500 font-bold">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentStage.equations && currentStage.equations.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>Mathematical Equations</span>
                        </span>
                        <div className="space-y-1.5 font-mono text-xs bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                          {currentStage.equations.map((eq, i) => (
                            <div key={i} className="py-0.5">
                              {eq}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentStage.keyTerminology && currentStage.keyTerminology.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                          <Info className="w-3.5 h-3.5 text-sky-600" />
                          <span>Key Terminology</span>
                        </span>
                        <div className="space-y-2">
                          {currentStage.keyTerminology.map((term, i) => (
                            <div key={i} className="text-xs space-y-0.5">
                              <span className="font-bold text-slate-900 dark:text-slate-100">{term.term}:</span>
                              <p className="text-slate-700 dark:text-slate-300 font-normal">{term.definition}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-700">Loading learning stage instructions...</p>
                )}
              </div>
            )}

            {/* TAB 2: COMPONENT INSPECTION */}
            {activeTab === 'inspect' && (
              <div className="space-y-4">
                {inspectedComponent ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                        Inspected Element
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {inspectedComponent.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Type: {inspectedComponent.type}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                      <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-normal">
                        {inspectedComponent.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Mechanical & Physical Properties
                      </span>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                        <table className="w-full text-xs">
                          <tbody>
                            {Object.entries(inspectedComponent.properties || {}).map(([k, v], i) => (
                              <tr
                                key={k}
                                className={`border-b last:border-b-0 border-slate-100 dark:border-slate-700/60 ${
                                  i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/40' : ''
                                }`}
                              >
                                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300 w-1/2">
                                  {k}
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white text-right">
                                  {v}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center space-y-2 text-slate-700 dark:text-slate-400">
                    <Eye className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="text-xs font-medium">Click on any 3D object in the viewport to inspect its mechanical properties.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PARAMETERS & CONTROLS */}
            {activeTab === 'params' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                    Live Variables
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Interactive Physical Controls
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Adjust geometry, applied forces, and material properties to inspect real-time response.
                  </p>
                </div>

                {/* Dynamically Render Controls based on current simulation */}
                <div className="space-y-3">
                  {currentSimId === '01-force-systems' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Force F1 Magnitude</span>
                          <span className="text-sky-600">{simState.selectedParameterValues['force1Mag'] ?? 50} N</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="120"
                          step="5"
                          value={simState.selectedParameterValues['force1Mag'] ?? 50}
                          onChange={(e) => handleParameterChange('force1Mag', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Force F1 Direction Angle</span>
                          <span className="text-sky-600">{simState.selectedParameterValues['force1Angle'] ?? 30}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="5"
                          value={simState.selectedParameterValues['force1Angle'] ?? 30}
                          onChange={(e) => handleParameterChange('force1Angle', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>3D Space Configuration</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['is3D'] ?? 0) ? 'Spatial 3D' : 'Planar 2D'}</span>
                        </div>
                        <button
                          onClick={() => handleParameterChange('is3D', (simState.selectedParameterValues['is3D'] ?? 0) ? 0 : 1)}
                          className="w-full py-1.5 rounded-lg bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200"
                        >
                          Toggle 2D / 3D Space
                        </button>
                      </div>
                    </>
                  )}

                  {currentSimId === '02-cable-tensions' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Suspended Load Mass</span>
                          <span className="text-sky-600">{simState.selectedParameterValues['loadMass'] ?? 100} kg</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="300"
                          step="10"
                          value={simState.selectedParameterValues['loadMass'] ?? 100}
                          onChange={(e) => handleParameterChange('loadMass', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Left Anchor Width</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['leftAnchorX'] ?? 2.0).toFixed(1)} m</span>
                        </div>
                        <input
                          type="range"
                          min="0.8"
                          max="3.5"
                          step="0.1"
                          value={simState.selectedParameterValues['leftAnchorX'] ?? 2.0}
                          onChange={(e) => handleParameterChange('leftAnchorX', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '03-fbd-lab' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Physical Isolation Mode</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['isolatedView'] ?? false) ? 'Isolated FBD' : 'Complete Assembly'}</span>
                        </div>
                        <button
                          onClick={() => handleParameterChange('isolatedView', !(simState.selectedParameterValues['isolatedView'] ?? false))}
                          className="w-full py-1.5 rounded-lg bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200"
                        >
                          Toggle Isolated Body / Environment
                        </button>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <span className="text-xs font-bold">Physical Scenario</span>
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          {[
                            { id: 'block-incline', label: 'Incline' },
                            { id: 'sphere-bowl', label: 'Sphere' },
                            { id: 'pulley-bracket', label: 'Pulley' },
                          ].map((sc) => (
                            <button
                              key={sc.id}
                              onClick={() => handleParameterChange('scenario', sc.id)}
                              className={`py-1 text-xs font-semibold rounded-lg border ${
                                (simState.selectedParameterValues['scenario'] ?? 'block-incline') === sc.id
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              {sc.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {currentSimId === '04-moments-couples' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Lever Arm Length</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['armLength'] ?? 2.0).toFixed(1)} m</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="4.0"
                          step="0.2"
                          value={simState.selectedParameterValues['armLength'] ?? 2.0}
                          onChange={(e) => handleParameterChange('armLength', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Applied Force Magnitude</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['forceMag'] ?? 50).toFixed(0)} N</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          step="5"
                          value={simState.selectedParameterValues['forceMag'] ?? 50}
                          onChange={(e) => handleParameterChange('forceMag', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Force Inclination Angle</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['forceAngle'] ?? 65).toFixed(0)}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="180"
                          step="5"
                          value={simState.selectedParameterValues['forceAngle'] ?? 65}
                          onChange={(e) => handleParameterChange('forceAngle', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '05-support-reactions' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Beam Span Length</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['spanLength'] ?? 6.0).toFixed(1)} m</span>
                        </div>
                        <input
                          type="range"
                          min="3.0"
                          max="8.0"
                          step="0.5"
                          value={simState.selectedParameterValues['spanLength'] ?? 6.0}
                          onChange={(e) => handleParameterChange('spanLength', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Point Load P1</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['pointLoadP1'] ?? 20).toFixed(0)} kN</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          step="5"
                          value={simState.selectedParameterValues['pointLoadP1'] ?? 20}
                          onChange={(e) => handleParameterChange('pointLoadP1', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Uniformly Distributed Load (UDL)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['udlIntensity'] ?? 8).toFixed(1)} kN/m</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          step="1"
                          value={simState.selectedParameterValues['udlIntensity'] ?? 8}
                          onChange={(e) => handleParameterChange('udlIntensity', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '06-truss-analysis' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Applied Joint Load (P)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['appliedLoad'] ?? 50).toFixed(0)} kN</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          step="5"
                          value={simState.selectedParameterValues['appliedLoad'] ?? 50}
                          onChange={(e) => handleParameterChange('appliedLoad', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '07-composite-centroids' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <span className="text-xs font-bold">Composite Section Profile</span>
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          {[
                            { id: 't-section', label: 'T-Beam' },
                            { id: 'i-section', label: 'I-Beam' },
                            { id: 'plate-with-hole', label: 'With Hole' },
                          ].map((sec) => (
                            <button
                              key={sec.id}
                              onClick={() => handleParameterChange('preset', sec.id)}
                              className={`py-1 text-xs font-semibold rounded-lg border ${
                                (simState.selectedParameterValues['preset'] ?? 't-section') === sec.id
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              {sec.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Negative Hole Area</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['includeHole'] ?? false) ? 'Subtracted Hole' : 'Solid Section'}</span>
                        </div>
                        <button
                          onClick={() => handleParameterChange('includeHole', !(simState.selectedParameterValues['includeHole'] ?? false))}
                          className="w-full py-1.5 rounded-lg bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200"
                        >
                          Toggle Negative Circular Cutout
                        </button>
                      </div>
                    </>
                  )}

                  {currentSimId === '08-area-moments-inertia' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <span className="text-xs font-bold">Cross-Section Geometry</span>
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          {[
                            { id: 'rectangle', label: 'Rectangle' },
                            { id: 'circle', label: 'Solid Circle' },
                            { id: 'hollow-circle', label: 'Hollow Tube' },
                            { id: 'i-beam', label: 'I-Beam' },
                          ].map((st) => (
                            <button
                              key={st.id}
                              onClick={() => handleParameterChange('sectionType', st.id)}
                              className={`py-1 text-xs font-semibold rounded-lg border ${
                                (simState.selectedParameterValues['sectionType'] ?? 'rectangle') === st.id
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Parallel Axis Offset (d)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['offsetDistance'] ?? 1.2).toFixed(1)} m</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="2.5"
                          step="0.1"
                          value={simState.selectedParameterValues['offsetDistance'] ?? 1.2}
                          onChange={(e) => handleParameterChange('offsetDistance', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '09-center-of-gravity' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Base Footprint Width (B)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['baseWidth'] ?? 2.0).toFixed(1)} m</span>
                        </div>
                        <input
                          type="range"
                          min="1.2"
                          max="3.5"
                          step="0.1"
                          value={simState.selectedParameterValues['baseWidth'] ?? 2.0}
                          onChange={(e) => handleParameterChange('baseWidth', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Payload Position along Boom</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['payloadPosition'] ?? 2.0).toFixed(1)} m</span>
                        </div>
                        <input
                          type="range"
                          min="0.8"
                          max="2.8"
                          step="0.1"
                          value={simState.selectedParameterValues['payloadPosition'] ?? 2.0}
                          onChange={(e) => handleParameterChange('payloadPosition', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Payload Mass</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['payloadMass'] ?? 150).toFixed(0)} kg</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="350"
                          step="10"
                          value={simState.selectedParameterValues['payloadMass'] ?? 150}
                          onChange={(e) => handleParameterChange('payloadMass', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '10-inclined-plane' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Incline Angle (θ)</span>
                          <span className="text-sky-600">{simState.selectedParameterValues['inclineAngle'] ?? 25}°</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="1"
                          value={simState.selectedParameterValues['inclineAngle'] ?? 25}
                          onChange={(e) => handleParameterChange('inclineAngle', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Static Friction (μ_s)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['muStatic'] ?? 0.45).toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.8"
                          step="0.05"
                          value={simState.selectedParameterValues['muStatic'] ?? 0.45}
                          onChange={(e) => handleParameterChange('muStatic', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '11-ladder-friction' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Ladder Inclination Angle (θ)</span>
                          <span className="text-sky-600">{simState.selectedParameterValues['ladderAngle'] ?? 60}°</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="80"
                          step="1"
                          value={simState.selectedParameterValues['ladderAngle'] ?? 60}
                          onChange={(e) => handleParameterChange('ladderAngle', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Climber Position along Ladder</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['climberPosition'] ?? 3.0).toFixed(1)} m</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="5.0"
                          step="0.2"
                          value={simState.selectedParameterValues['climberPosition'] ?? 3.0}
                          onChange={(e) => handleParameterChange('climberPosition', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '12-wedge-friction' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Wedge Angle (α)</span>
                          <span className="text-sky-600">{simState.selectedParameterValues['wedgeAngle'] ?? 15}°</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          step="1"
                          value={simState.selectedParameterValues['wedgeAngle'] ?? 15}
                          onChange={(e) => handleParameterChange('wedgeAngle', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Normal Load Mass</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['loadMass'] ?? 500).toFixed(0)} kg</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="1000"
                          step="50"
                          value={simState.selectedParameterValues['loadMass'] ?? 500}
                          onChange={(e) => handleParameterChange('loadMass', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '13-rolling-resistance' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Rolling Offset b</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['rollingCoeffB'] ?? 15).toFixed(1)} mm</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          step="1"
                          value={simState.selectedParameterValues['rollingCoeffB'] ?? 15}
                          onChange={(e) => handleParameterChange('rollingCoeffB', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Braking Mode</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['isLocked'] ?? 0) ? 'Locked Skid' : 'Free Rolling'}</span>
                        </div>
                        <button
                          onClick={() => handleParameterChange('isLocked', (simState.selectedParameterValues['isLocked'] ?? 0) ? 0 : 1)}
                          className="w-full py-1.5 rounded-lg bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200"
                        >
                          Toggle Free Rolling / Locked Skid
                        </button>
                      </div>
                    </>
                  )}

                  {currentSimId === '14-rectilinear-motion' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Initial Velocity (v0)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['initialVelocity'] ?? 0.5).toFixed(2)} m/s</span>
                        </div>
                        <input
                          type="range"
                          min="-1.5"
                          max="3.0"
                          step="0.25"
                          value={simState.selectedParameterValues['initialVelocity'] ?? 0.5}
                          onChange={(e) => handleParameterChange('initialVelocity', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Constant Acceleration (a)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['acceleration'] ?? 0.8).toFixed(2)} m/s²</span>
                        </div>
                        <input
                          type="range"
                          min="-1.5"
                          max="2.0"
                          step="0.2"
                          value={simState.selectedParameterValues['acceleration'] ?? 0.8}
                          onChange={(e) => handleParameterChange('acceleration', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '15-projectile-motion' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Launch Velocity (v0)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['initialVelocity'] ?? 12).toFixed(1)} m/s</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="22"
                          step="1"
                          value={simState.selectedParameterValues['initialVelocity'] ?? 12}
                          onChange={(e) => handleParameterChange('initialVelocity', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Launch Angle (θ)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['launchAngle'] ?? 45).toFixed(0)}°</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="75"
                          step="2"
                          value={simState.selectedParameterValues['launchAngle'] ?? 45}
                          onChange={(e) => handleParameterChange('launchAngle', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '16-newtons-second-law' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Cart Mass (m1)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['cartMass'] ?? 4.0).toFixed(1)} kg</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="8.0"
                          step="0.5"
                          value={simState.selectedParameterValues['cartMass'] ?? 4.0}
                          onChange={(e) => handleParameterChange('cartMass', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Hanging Mass (m2)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['hangingMass'] ?? 2.0).toFixed(1)} kg</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="6.0"
                          step="0.5"
                          value={simState.selectedParameterValues['hangingMass'] ?? 2.0}
                          onChange={(e) => handleParameterChange('hangingMass', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '17-work-energy' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Release Elevation (h0)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['initialHeight'] ?? 2.4).toFixed(1)} m</span>
                        </div>
                        <input
                          type="range"
                          min="0.8"
                          max="3.0"
                          step="0.2"
                          value={simState.selectedParameterValues['initialHeight'] ?? 2.4}
                          onChange={(e) => handleParameterChange('initialHeight', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Buffer Spring Stiffness (k)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['springStiffness'] ?? 800).toFixed(0)} N/m</span>
                        </div>
                        <input
                          type="range"
                          min="200"
                          max="1500"
                          step="50"
                          value={simState.selectedParameterValues['springStiffness'] ?? 800}
                          onChange={(e) => handleParameterChange('springStiffness', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '18-impulse-momentum' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Restitution Coefficient (e)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['restitutionE'] ?? 0.75).toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={simState.selectedParameterValues['restitutionE'] ?? 0.75}
                          onChange={(e) => handleParameterChange('restitutionE', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {currentSimId === '19-rotational-dynamics' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Applied Driving Torque (τ)</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['appliedTorque'] ?? 12).toFixed(1)} N·m</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="30"
                          step="1"
                          value={simState.selectedParameterValues['appliedTorque'] ?? 12}
                          onChange={(e) => handleParameterChange('appliedTorque', parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Rotor Mass Distribution</span>
                          <span className="text-sky-600">{(simState.selectedParameterValues['rotorGeometry'] ?? 0) ? 'Thin Ring (I = MR²)' : 'Solid Disc (I = 0.5 MR²)'}</span>
                        </div>
                        <button
                          onClick={() => handleParameterChange('rotorGeometry', (simState.selectedParameterValues['rotorGeometry'] ?? 0) ? 0 : 1)}
                          className="w-full py-1.5 rounded-lg bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200"
                        >
                          Toggle Solid Disc / Hollow Ring
                        </button>
                      </div>
                    </>
                  )}

                  {currentSimId === '20-impact-conservation' && (
                    <>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <span className="text-xs font-bold">Collision Regime</span>
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          {[
                            { id: 0, label: 'Elastic' },
                            { id: 1, label: 'Inelastic' },
                            { id: 2, label: 'Plastic' },
                          ].map((rm) => (
                            <button
                              key={rm.id}
                              onClick={() => handleParameterChange('collisionModel', rm.id)}
                              className={`py-1 text-xs font-semibold rounded-lg border ${
                                (simState.selectedParameterValues['collisionModel'] ?? 1) === rm.id
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              {rm.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Fallback generic control info */}
                  <div className="p-3 bg-sky-50/70 dark:bg-slate-800/60 rounded-xl border border-sky-100 dark:border-slate-700 text-xs text-sky-900 dark:text-sky-200 leading-relaxed font-medium">
                    Parameters dynamically update governing equations and 3D vector arrows without restarting the scene.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LEGEND & VECTORS */}
            {activeTab === 'legend' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                    Visual Language
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Vector Colors & Conventions
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Strict engineering color coding adhering to academic mechanics standards:
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center space-x-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-4 h-4 rounded-full bg-blue-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">Blue Vector</span>
                      <p className="text-slate-700 dark:text-slate-300">Gravitational Weight (W = mg) or Velocity (v)</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-4 h-4 rounded-full bg-green-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">Green Vector</span>
                      <p className="text-slate-700 dark:text-slate-300">Normal Reactions (N), Cable Tension, or Stable Equilibrium</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-4 h-4 rounded-full bg-amber-500 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">Amber Vector</span>
                      <p className="text-slate-700 dark:text-slate-300">Dry Friction (f_s, f_k), Rolling Drag, or Impending Slip</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-4 h-4 rounded-full bg-red-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">Red Vector</span>
                      <p className="text-slate-700 dark:text-slate-300">Applied External Force (P), Compression, or Overturning State</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-4 h-4 rounded-full bg-purple-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">Purple Vector</span>
                      <p className="text-slate-700 dark:text-slate-300">Bending Moments (M = r × F) or Rotational Torque (τ)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ANALYTICS & MATHEMATICAL CURVES */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                    Analytical Charts & Models
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Dynamic Mechanics Plots
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Continuous evaluation of theoretical models vs. applied boundary parameters.
                  </p>
                </div>

                {/* Analytical Curve per Module */}
                {currentSimId === '01-force-systems' && (
                  <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-sky-600" />
                      Vector Resolution in Cartesian Plane
                    </span>
                    <div className="h-44 w-full bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center">
                      <svg viewBox="0 0 200 140" className="w-full h-full">
                        {/* Axes */}
                        <line x1="20" y1="120" x2="185" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
                        <line x1="100" y1="130" x2="100" y2="10" stroke="#94a3b8" strokeWidth="1.5" />
                        <text x="185" y="115" fontSize="8" fill="#64748b" fontWeight="bold">X</text>
                        <text x="105" y="15" fontSize="8" fill="#64748b" fontWeight="bold">Y</text>

                        {/* Force 1 Vector (Blue) */}
                        <line x1="100" y1="120" x2="155" y2="70" stroke="#2563eb" strokeWidth="2.5" />
                        <text x="158" y="68" fontSize="8" fill="#2563eb" fontWeight="bold">F1</text>

                        {/* Force 2 Vector (Amber) */}
                        <line x1="100" y1="120" x2="60" y2="55" stroke="#d97706" strokeWidth="2.5" />
                        <text x="45" y="55" fontSize="8" fill="#d97706" fontWeight="bold">F2</text>

                        {/* Resultant Vector (Emerald dashed) */}
                        <line x1="100" y1="120" x2="125" y2="35" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3,2" />
                        <text x="130" y="35" fontSize="9" fill="#10b981" fontWeight="bold">R (Resultant)</text>

                        {/* Particle center */}
                        <circle cx="100" cy="120" r="3.5" fill="#334155" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[9px]">Sum Fx (ΣFx)</span>
                        <span className="font-bold text-sky-600">{(simState.metrics['Resultant Rx'] as string) || '46.6 kN'}</span>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 block text-[9px]">Sum Fy (ΣFy)</span>
                        <span className="font-bold text-sky-600">{(simState.metrics['Resultant Ry'] as string) || '119.3 kN'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentSimId === '04-moments-couples' && (
                  <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                      Torque vs Angle Sinusoid: M(θ) = F · r · sin(θ)
                    </span>
                    <div className="h-44 w-full bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center">
                      <svg viewBox="0 0 200 120" className="w-full h-full">
                        {/* Axes */}
                        <line x1="20" y1="100" x2="190" y2="100" stroke="#94a3b8" strokeWidth="1.5" />
                        <line x1="25" y1="105" x2="25" y2="15" stroke="#94a3b8" strokeWidth="1.5" />
                        <text x="175" y="112" fontSize="7" fill="#64748b">θ (°)</text>
                        <text x="5" y="18" fontSize="7" fill="#64748b">M (N·m)</text>

                        {/* Sine Wave */}
                        <path
                          d="M 25 100 Q 65 20 105 20 T 185 100"
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="2.5"
                        />
                        {/* Peak marker at 90 deg */}
                        <circle cx="105" cy="20" r="3" fill="#9333ea" />
                        <text x="110" y="24" fontSize="7" fill="#9333ea" fontWeight="bold">Max at 90° (d = r)</text>

                        {/* Zero markers */}
                        <text x="22" y="112" fontSize="7" fill="#64748b">0°</text>
                        <text x="100" y="112" fontSize="7" fill="#64748b">90°</text>
                        <text x="178" y="112" fontSize="7" fill="#64748b">180°</text>
                      </svg>
                    </div>
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800/40 text-[11px] text-purple-900 dark:text-purple-200">
                      Perpendicular moment arm peaks when force is perpendicular to lever (θ = 90°). Pure axial force produces zero moment.
                    </div>
                  </div>
                )}

                {currentSimId === '10-inclined-plane' && (
                  <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-500" />
                      Coulomb Friction vs Incline Slope (θ)
                    </span>
                    <div className="h-44 w-full bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center">
                      <svg viewBox="0 0 200 120" className="w-full h-full">
                        {/* Axes */}
                        <line x1="20" y1="100" x2="190" y2="100" stroke="#94a3b8" strokeWidth="1.5" />
                        <line x1="25" y1="105" x2="25" y2="15" stroke="#94a3b8" strokeWidth="1.5" />
                        <text x="175" y="112" fontSize="7" fill="#64748b">Slope θ (°)</text>
                        <text x="5" y="18" fontSize="7" fill="#64748b">Force (N)</text>

                        {/* Downslope Gravity Curve W_parallel = mg sin theta (Blue) */}
                        <path d="M 25 100 Q 100 70 180 25" fill="none" stroke="#2563eb" strokeWidth="2" />
                        <text x="135" y="35" fontSize="7" fill="#2563eb" fontWeight="bold">W∥ = mg sin θ</text>

                        {/* Limiting Static Friction Curve Fs_max = mu_s mg cos theta (Amber) */}
                        <path d="M 25 45 Q 100 55 180 100" fill="none" stroke="#d97706" strokeWidth="2" />
                        <text x="30" y="40" fontSize="7" fill="#d97706" fontWeight="bold">Fs,max = μs mg cos θ</text>

                        {/* Critical Angle of Repose Intersection */}
                        <line x1="95" y1="20" x2="95" y2="100" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
                        <circle cx="95" cy="68" r="3.5" fill="#ef4444" />
                        <text x="100" y="70" fontSize="7" fill="#ef4444" fontWeight="bold">θc = arctan(μs)</text>
                        <text x="90" y="112" fontSize="7" fill="#ef4444" fontWeight="bold">Repose</text>
                      </svg>
                    </div>
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200">
                      When slope θ &lt; θc, static friction holds the block at rest. When θ &gt; θc, downslope gravity exceeds limiting friction, triggering accelerated sliding.
                    </div>
                  </div>
                )}

                {currentSimId === '07-composite-centroids' && (
                  <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      Composite Cross-Section Centroid Allocation
                    </span>
                    <div className="h-44 w-full bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center">
                      <svg viewBox="0 0 200 130" className="w-full h-full">
                        {/* Axes */}
                        <line x1="20" y1="110" x2="185" y2="110" stroke="#94a3b8" strokeWidth="1.5" />
                        <line x1="30" y1="120" x2="30" y2="15" stroke="#94a3b8" strokeWidth="1.5" />

                        {/* T-Section Web (Slate) */}
                        <rect x="85" y="45" width="30" height="65" fill="#64748b" opacity="0.8" rx="1" />
                        {/* Web Centroid */}
                        <circle cx="100" cy="77" r="2.5" fill="#38bdf8" />
                        <text x="105" y="80" fontSize="7" fill="#0284c7">C_web</text>

                        {/* T-Section Flange (Dark Steel) */}
                        <rect x="55" y="25" width="90" height="20" fill="#475569" opacity="0.9" rx="1" />
                        {/* Flange Centroid */}
                        <circle cx="100" cy="35" r="2.5" fill="#38bdf8" />
                        <text x="105" y="38" fontSize="7" fill="#0284c7">C_flange</text>

                        {/* Composite Global Centroid (Red Target) */}
                        <circle cx="100" cy="55" r="4.5" fill="#ef4444" />
                        <circle cx="100" cy="55" r="7" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,1" />
                        <text x="112" y="58" fontSize="8" fill="#dc2626" fontWeight="bold">Global Centroid (x̄, ȳ)</text>
                      </svg>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">x̄ = Σ(Ai · xi) / ΣAi:</span>
                        <span className="font-bold text-sky-600">Symmetric about Y-axis</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ȳ = Σ(Ai · yi) / ΣAi:</span>
                        <span className="font-bold text-emerald-600">Calculated Dynamically</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentSimId === '06-truss-analysis' && (
                  <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                      Truss Member Axial Force Distribution (Method of Joints)
                    </span>
                    <div className="h-44 w-full bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center">
                      <svg viewBox="0 0 200 120" className="w-full h-full">
                        {/* Member bar chart */}
                        {/* Zero baseline */}
                        <line x1="20" y1="60" x2="190" y2="60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                        <text x="175" y="58" fontSize="6" fill="#64748b">0 kN</text>

                        {/* Bars for members: AB, BC (Tension up), AD, EC (Compression down), DE (Compression down), DB, EB (Tension up) */}
                        {/* AB (Tension +17.3 kN) */}
                        <rect x="30" y="35" width="16" height="25" fill="#10b981" rx="1" />
                        <text x="32" y="70" fontSize="7" fill="#64748b">AB</text>
                        <text x="32" y="30" fontSize="6" fill="#059669" fontWeight="bold">+T</text>

                        {/* BC (Tension +17.3 kN) */}
                        <rect x="52" y="35" width="16" height="25" fill="#10b981" rx="1" />
                        <text x="54" y="70" fontSize="7" fill="#64748b">BC</text>
                        <text x="54" y="30" fontSize="6" fill="#059669" fontWeight="bold">+T</text>

                        {/* AD (Compression -34.6 kN) */}
                        <rect x="74" y="60" width="16" height="38" fill="#ef4444" rx="1" />
                        <text x="76" y="54" fontSize="7" fill="#64748b">AD</text>
                        <text x="76" y="106" fontSize="6" fill="#dc2626" fontWeight="bold">-C</text>

                        {/* DE (Compression -34.6 kN) */}
                        <rect x="96" y="60" width="16" height="38" fill="#ef4444" rx="1" />
                        <text x="98" y="54" fontSize="7" fill="#64748b">DE</text>
                        <text x="98" y="106" fontSize="6" fill="#dc2626" fontWeight="bold">-C</text>

                        {/* EC (Compression -34.6 kN) */}
                        <rect x="118" y="60" width="16" height="38" fill="#ef4444" rx="1" />
                        <text x="120" y="54" fontSize="7" fill="#64748b">EC</text>
                        <text x="120" y="106" fontSize="6" fill="#dc2626" fontWeight="bold">-C</text>

                        {/* DB (Tension +34.6 kN) */}
                        <rect x="140" y="22" width="16" height="38" fill="#10b981" rx="1" />
                        <text x="142" y="70" fontSize="7" fill="#64748b">DB</text>
                        <text x="142" y="18" fontSize="6" fill="#059669" fontWeight="bold">+T</text>

                        {/* EB (Tension +34.6 kN) */}
                        <rect x="162" y="22" width="16" height="38" fill="#10b981" rx="1" />
                        <text x="164" y="70" fontSize="7" fill="#64748b">EB</text>
                        <text x="164" y="18" fontSize="6" fill="#059669" fontWeight="bold">+T</text>
                      </svg>
                    </div>
                    <div className="flex items-center justify-between text-xs px-2">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> Tension (+)
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-rose-600">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded" /> Compression (-)
                      </span>
                    </div>
                  </div>
                )}

                {/* Live Engineering Metrics Grid */}
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-sky-600" />
                    Numerical Substitutions
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {Object.entries(simState.metrics).map(([k, v]) => (
                      <div key={k} className="flex justify-between p-1.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">{k}:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: OBSERVATION RECORDER & CSV EXPORT */}
            {activeTab === 'observations' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                    Experimental Log
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Observation Table & Data Export
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Record parameter runs, compare equilibrium results, and download CSV data.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRecordObservation}
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>Record Current State</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    disabled={observations.length === 0}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={handleClearObservations}
                    disabled={observations.length === 0}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {observations.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No observations recorded yet.</p>
                    <p>Adjust variables and click "Record Current State" to log trial data.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                    {observations.map((rec) => (
                      <div
                        key={rec.trialNumber}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 shadow-sm"
                      >
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-1 font-bold">
                          <span className="text-sky-600">Trial #{rec.trialNumber}</span>
                          <span className="text-[10px] text-slate-500">{rec.timestamp}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Parameters:</span>
                          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                            {Object.entries(rec.parameters).map(([k, v]) => (
                              <div key={k} className="truncate">
                                <span className="text-slate-600 dark:text-slate-400">{k}: </span>
                                <span className="font-semibold text-slate-900 dark:text-white">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Results:</span>
                          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                            {Object.entries(rec.metrics).map(([k, v]) => (
                              <div key={k} className="truncate">
                                <span className="text-slate-600 dark:text-slate-400">{k}: </span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: CONCEPT ASSESSMENT QUIZ */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                    Knowledge Assessment
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Engineering Mechanics Concepts
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Test your understanding of forces, moments, friction, centroids, and trusses.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: 0,
                      question: '1. What fundamental mathematical identity must the direction cosines (cos α, cos β, cos γ) of a 3D force vector satisfy?',
                      options: [
                        'cos α + cos β + cos γ = 1',
                        'cos²α + cos²β + cos²γ = 1',
                        'tan²α + tan²β + tan²γ = 1',
                        'cos(α + β + γ) = 0',
                      ],
                      correct: 1,
                      explanation: 'The unit vector along the line of action has magnitude unity: λ = cos α î + cos β ĵ + cos γ k̂, so ||λ||² = cos²α + cos²β + cos²γ = 1.',
                    },
                    {
                      id: 1,
                      question: '2. According to Varignon’s Theorem of Moments, the moment of the resultant force about any point is equal to:',
                      options: [
                        'Zero under all non-equilibrium conditions',
                        'The vector algebraic sum of the moments of individual component forces about that same point',
                        'The product of total mass and gravitational acceleration',
                        'The couple moment divided by perpendicular lever arm',
                      ],
                      correct: 1,
                      explanation: 'Varignon’s principle states M_O(R) = r × R = r × (Σ Fi) = Σ (r × Fi) = Σ M_O(Fi).',
                    },
                    {
                      id: 2,
                      question: '3. A block of mass m rests on an incline with static friction coefficient μs. The critical angle of repose θc at which motion impends is:',
                      options: [
                        'θc = arcsin(μs)',
                        'θc = arctan(μs)',
                        'θc = arccos(μs)',
                        'θc = μs · 90°',
                      ],
                      correct: 1,
                      explanation: 'At impending motion, downslope gravity mg sin θc = limiting friction μs mg cos θc => tan θc = μs => θc = arctan(μs).',
                    },
                    {
                      id: 3,
                      question: '4. When computing the centroid of a composite structural section with a circular cutout / hole, how is the hole accounted for?',
                      options: [
                        'By multiplying the coordinates by negative infinity',
                        'By treating its area as negative in the first moment of area summation: x̄ = (Σ A_solid x - A_hole x_hole) / (Σ A_solid - A_hole)',
                        'By ignoring the hole because centroids depend only on boundary perimeters',
                        'By shifting the coordinate origin to the center of the cutout',
                      ],
                      correct: 1,
                      explanation: 'Voids and cutouts represent absence of mass/area and must be assigned negative signed areas in the moment of area formulation.',
                    },
                    {
                      id: 4,
                      question: '5. In an ideal pin-jointed planar truss, why are all structural members categorized as two-force members carrying only axial tension or compression?',
                      options: [
                        'Loads and reactions are applied exclusively at frictionless pin joints, producing no transverse bending moments',
                        'Members are made of flexible cables that buckle under self-weight',
                        'Internal friction at joints converts bending into thermal heat',
                        'Method of Joints is only an approximation that ignores bending',
                      ],
                      correct: 0,
                      explanation: 'Ideal trusses assume straight members connected by frictionless pins with loads applied strictly at joints, creating pure axial forces.',
                    },
                  ].map((q) => {
                    const selected = quizAnswers[q.id];
                    const isCorrect = selected === q.correct;
                    return (
                      <div
                        key={q.id}
                        className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-sm"
                      >
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {q.question}
                        </p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-start space-x-2 p-2 rounded-lg text-xs cursor-pointer border transition ${
                                selected === optIdx
                                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 font-semibold text-sky-900 dark:text-sky-200'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`quiz-q-${q.id}`}
                                checked={selected === optIdx}
                                onChange={() => {
                                  setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                  setQuizSubmitted(false);
                                }}
                                className="mt-0.5 accent-sky-600"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                        {quizSubmitted && (
                          <div
                            className={`p-2 rounded-lg text-[11px] leading-relaxed ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            <span className="font-bold">{isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-2">
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                    >
                      Check All Answers
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ============================================================ */}
      {/* 5. MODAL: 20-SIMULATION FULL CURRICULUM CATALOGUE           */}
      {/* ============================================================ */}
      {catalogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  KPRIET Engineering Mechanics Virtual Lab
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Anna University Syllabus Mapping — 20 Interactive 3D Simulations
                </p>
              </div>
              <button
                onClick={() => setCatalogOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(['I', 'II', 'III', 'IV', 'V'] as const).map((unitNum) => {
                const unitSims = MECHANICS_SIMULATIONS.filter((s) => s.unitNum === unitNum);
                const unitTitles: Record<string, string> = {
                  I: 'Unit I: Statics of Particles (Concurrent Force Systems & Equilibrium)',
                  II: 'Unit II: Equilibrium of Rigid Bodies (Moments, Support Reactions & Trusses)',
                  III: 'Unit III: Properties of Surfaces and Solids (Centroids, Area & Mass Moments of Inertia)',
                  IV: 'Unit IV: Friction (Dry Friction, Inclines, Ladders, Wedges & Rolling Resistance)',
                  V: 'Unit V: Dynamics of Particles and Rigid Bodies (Kinematics, Work-Energy, Impulse & Rotation)',
                };

                return (
                  <div key={unitNum} className="space-y-3">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400 flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        Unit {unitNum}
                      </span>
                      <span>{unitTitles[unitNum]}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {unitSims.map((sim) => (
                        <div
                          key={sim.id}
                          onClick={() => {
                            setCurrentSimId(sim.id);
                            setCatalogOpen(false);
                          }}
                          className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                            currentSimId === sim.id
                              ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 shadow-sm'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between">
                              <span className="text-xl">{sim.icon}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  sim.difficulty === 'Foundation'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : sim.difficulty === 'Intermediate'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                              >
                                {sim.difficulty}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                              {sim.title}
                            </h4>
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                              {sim.shortDesc}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-700 dark:text-slate-400 font-semibold">
                            <span>⏱ {sim.estMinutes} mins</span>
                            <span className="text-sky-600 dark:text-sky-400 flex items-center">
                              Open Lab <ChevronRight className="w-3 h-3 ml-0.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: HELP & GUIDED TOUR                                 */}
      {/* ============================================================ */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-sky-600" />
                <span>How to Use the Virtual Laboratory</span>
              </h3>
              <button
                onClick={() => setHelpOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">🖱️ 3D Camera Controls:</span>
                <p>• Left-click & drag: Orbit and rotate camera view around center</p>
                <p>• Right-click & drag: Pan camera position horizontally and vertically</p>
                <p>• Mouse wheel / Pinch: Zoom in and out smoothly</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">🔍 Component Inspection:</span>
                <p>Click directly on any beam, cable, wedge, ladder, wheel, or vector arrow in the 3D scene to open its live engineering property table.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">⏯️ Timeline Playback:</span>
                <p>Use the bottom floating player to step through educational stages, play dynamic animations, scrub velocities, or adjust playback speed.</p>
              </div>
            </div>

            <button
              onClick={() => setHelpOpen(false)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
            >
              Got it, let me experiment!
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. MODAL: OFFICIAL PRACTICAL LABORATORY REPORT               */}
      {/* ============================================================ */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Laboratory Practical Examination Report — U25RME201
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
                  Course: U25RME201 — Engineering Mechanics (Semester II)
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
                  <span className="font-bold">{currentMeta.title}</span>
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
                <p>{currentMeta.shortDesc}</p>
                <p>To verify the laws of equilibrium, resolve orthogonal vectors, and record system response using the interactive 3D mechanics simulator.</p>
              </div>

              {/* Governing Physical Principles */}
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

              {/* Current Active Parameters */}
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

              {/* Conclusions and Signatures */}
              <div className="space-y-1 pt-2">
                <h3 className="font-bold font-sans text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  5. Conclusion
                </h3>
                <p>
                  The interactive simulation of <strong>{currentMeta.title}</strong> was successfully performed. The analytical force, moment, friction, and centroid equilibrium models match the calculated 3D numerical metrics within theoretical tolerances.
                </p>
              </div>

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
