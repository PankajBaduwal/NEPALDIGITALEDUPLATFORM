/**
 * PiyushDhara Eduverse — Manufacturing Technology – I (U25ME304 / ME3391)
 * Master Interactive 3D Virtual Engineering Machining Suite & Virtual Laboratory Workspace
 * Formulated according to Anna University / Autonomous R2025 Syllabus (Semester III B.E. Mechanical Engineering)
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import type {
  ManufacturingSimId,
  TurningOperation,
  MachineToolType,
  WorkpieceMaterialId,
  ChipType,
  AsaToolSignature,
  LabTrialRecord,
  AssessmentQuestion,
} from '../core/types';
import {
  LatheTurningScene,
  MachineToolsComparisonScene,
  CuttingToolGeometryScene,
  ChipFormationMechanicsScene,
  VirtualWorkshopScene,
} from '../simulations';
import { MachiningCalculator } from '../core/MachiningCalculator';
import { WORKPIECE_MATERIALS, STANDARD_ASA_TOOL_SIGNATURES } from '../core/MachiningMaterials';
import {
  RotateCcw,
  Play,
  Pause,
  Layers,
  FileSpreadsheet,
  HelpCircle,
  FileText,
  Sliders,
  Activity,
  CheckCircle2,
  XCircle,
  Download,
  Printer,
  ChevronRight,
  Info,
  Maximize2,
  ShieldAlert,
  ArrowRight,
  Compass,
  Cog,
  Wrench,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface ManufacturingTechWorkspaceProps {
  initialSimId?: ManufacturingSimId;
  simulationId?: ManufacturingSimId;
  onBackToCourse?: () => void;
  onBack?: () => void;
}

const MODULES: { id: ManufacturingSimId; label: string; unit: string; icon: string }[] = [
  { id: 'u25me304-lathe-operations', label: 'Lathe & Turning Operations', unit: 'Unit II / Exp 1 & 2', icon: '⚙️' },
  { id: 'u25me304-machine-tools', label: 'Drilling, Milling & Shaping', unit: 'Unit III / Exp 3 & 4', icon: '🔩' },
  { id: 'u25me304-machining-calculations', label: 'Speed, Feed & Machining Time', unit: 'Unit I & II Core', icon: '📐' },
  { id: 'u25me304-tool-geometry', label: 'Tool Geometry & Signatures', unit: 'Unit I Core', icon: '🔪' },
  { id: 'u25me304-cutting-mechanics', label: 'Chip Mechanics & Forces', unit: 'Unit I / Exp 5', icon: '⚡' },
  { id: 'u25me304-virtual-workshop', label: '3D Virtual Workshop', unit: 'Workshop Floor', icon: '🏭' },
  { id: 'u25me304-virtual-laboratory', label: 'Virtual Manufacturing Lab', unit: 'Lab Experiments', icon: '🧪' },
];

export const ManufacturingTechWorkspace: React.FC<ManufacturingTechWorkspaceProps> = ({
  initialSimId,
  simulationId,
  onBackToCourse,
  onBack,
}) => {
  const exitHandler = onBack || onBackToCourse;
  const [activeSimId, setActiveSimId] = useState<ManufacturingSimId>(
    simulationId || initialSimId || 'u25me304-lathe-operations'
  );

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const activeSceneRef = useRef<any>(null);

  // Common Machining State
  const [isRunning, setIsRunning] = useState(true);
  const [materialKey, setMaterialKey] = useState<WorkpieceMaterialId>('mild-steel');
  const [operation, setOperation] = useState<TurningOperation>('plain-turning');
  const [machineType, setMachineType] = useState<MachineToolType>('lathe');
  const [rawDiameterMm, setRawDiameterMm] = useState<number>(50);
  const [depthOfCutMm, setDepthOfCutMm] = useState<number>(2.0);
  const [cutLengthMm, setCutLengthMm] = useState<number>(80);
  const [feedMmRev, setFeedMmRev] = useState<number>(0.25);
  const [spindleSpeedRpm, setSpindleSpeedRpm] = useState<number>(650);
  const [taperAngleDeg, setTaperAngleDeg] = useState<number>(8);
  const [rakeAngleDeg, setRakeAngleDeg] = useState<number>(14);
  const [chipType, setChipType] = useState<ChipType>('continuous');
  const [hasBue, setHasBue] = useState<boolean>(false);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showPlanes, setShowPlanes] = useState<boolean>(true);
  const [showCaliper, setShowCaliper] = useState<boolean>(false);

  // Tool Signature (ASA)
  const [toolSignature, setToolSignature] = useState<AsaToolSignature>({
    ...STANDARD_ASA_TOOL_SIGNATURES.hssGeneralPurpose,
  });

  // UI Panels
  const [activeTab, setActiveTab] = useState<'controls' | 'calculations' | 'comparison' | 'theory'>('controls');
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Observation Trials
  const [trialLogs, setTrialLogs] = useState<LabTrialRecord[]>([]);

  // Student Report Info
  const [studentName, setStudentName] = useState('Piyush Dhara');
  const [studentRoll, setStudentRoll] = useState('711525ME108');

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // CALCULATIONS ENGINE SYNC
  // ─────────────────────────────────────────────────────────────
  const turningResults = useMemo(() => {
    return MachiningCalculator.calculateTurningProcess({
      workpieceDiameterMm: rawDiameterMm,
      cutDepthMm: depthOfCutMm,
      cutLengthMm,
      spindleSpeedRpm,
      feedMmRev,
      materialId: materialKey,
      noseRadiusMm: toolSignature.noseRadiusMm,
    });
  }, [rawDiameterMm, depthOfCutMm, cutLengthMm, spindleSpeedRpm, feedMmRev, materialKey, toolSignature]);

  const merchantForces = useMemo(() => {
    return MachiningCalculator.calculateMerchantForces({
      rakeAngleDeg,
      uncutChipThicknessMm: feedMmRev,
      widthOfCutMm: depthOfCutMm,
      cuttingSpeedMMin: turningResults.cuttingSpeedMMin,
      materialId: materialKey,
    });
  }, [rakeAngleDeg, feedMmRev, depthOfCutMm, turningResults.cuttingSpeedMMin, materialKey]);

  const drillingResults = useMemo(() => {
    return MachiningCalculator.calculateDrillingProcess({
      drillDiameterMm: 20,
      holeDepthMm: 45,
      feedMmRev: 0.2,
      spindleSpeedRpm: 480,
    });
  }, []);

  const shapingResults = useMemo(() => {
    return MachiningCalculator.calculateShapingProcess({
      strokeLengthMm: 200,
      workpieceWidthMm: 100,
      strokesPerMinuteN: 40,
      feedMmStroke: 0.5,
      depthOfCutMm: 2.0,
    });
  }, []);

  const millingResults = useMemo(() => {
    return MachiningCalculator.calculateMillingProcess({
      cutterDiameterMm: 80,
      numberOfTeethZ: 8,
      spindleSpeedRpm: 350,
      feedPerToothFzMm: 0.15,
      depthOfCutMm: 3.0,
      widthOfCutMm: 50,
      workpieceLengthMm: 120,
    });
  }, []);

  const orsSignature = useMemo(() => {
    return MachiningCalculator.convertAsaToOrs(toolSignature);
  }, [toolSignature]);

  // Safety Speed Warning
  const currentMaterial = WORKPIECE_MATERIALS[materialKey] || WORKPIECE_MATERIALS['mild-steel'];
  const isSpeedSafe =
    turningResults.cuttingSpeedMMin >= currentMaterial.recommendedSpeedRange.min &&
    turningResults.cuttingSpeedMMin <= currentMaterial.recommendedSpeedRange.max;

  // ─────────────────────────────────────────────────────────────
  // THREE.JS SCENE LIFECYCLE
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    if (activeSceneRef.current) {
      activeSceneRef.current.dispose();
      activeSceneRef.current = null;
    }

    const container = canvasContainerRef.current;
    container.innerHTML = '';

    let scene: any = null;
    if (activeSimId === 'u25me304-lathe-operations') {
      scene = new LatheTurningScene(container);
    } else if (activeSimId === 'u25me304-machine-tools') {
      scene = new MachineToolsComparisonScene(container);
    } else if (activeSimId === 'u25me304-tool-geometry') {
      scene = new CuttingToolGeometryScene(container);
    } else if (activeSimId === 'u25me304-cutting-mechanics') {
      scene = new ChipFormationMechanicsScene(container);
    } else if (activeSimId === 'u25me304-virtual-workshop') {
      scene = new VirtualWorkshopScene(container);
    } else {
      // Machining calculations / Virtual laboratory default to LatheTurningScene for 3D background
      scene = new LatheTurningScene(container);
    }

    activeSceneRef.current = scene;

    return () => {
      if (activeSceneRef.current) {
        activeSceneRef.current.dispose();
        activeSceneRef.current = null;
      }
    };
  }, [activeSimId]);

  // Sync parameter changes to active Three.js scene
  useEffect(() => {
    if (!activeSceneRef.current) return;

    if (activeSimId === 'u25me304-lathe-operations') {
      activeSceneRef.current.updateParameters({
        operation,
        materialId: materialKey,
        rawDiameterMm,
        depthOfCutMm,
        cutLengthMm,
        feedMmRev,
        spindleSpeedRpm,
        taperAngleDeg,
        isRunning,
      });
    } else if (activeSimId === 'u25me304-machine-tools') {
      activeSceneRef.current.updateParameters({
        machine: machineType,
        isRunning,
      });
    } else if (activeSimId === 'u25me304-tool-geometry') {
      activeSceneRef.current.updateParameters({
        signature: toolSignature,
        showPlanes,
      });
    } else if (activeSimId === 'u25me304-cutting-mechanics') {
      activeSceneRef.current.updateParameters({
        rakeAngleDeg,
        uncutChipThicknessMm: feedMmRev,
        cuttingSpeedMMin: turningResults.cuttingSpeedMMin,
        chipType,
        materialId: materialKey,
        isBUEEnabled: hasBue,
        showVectors,
      });
    } else if (activeSimId === 'u25me304-virtual-workshop') {
      activeSceneRef.current.updateParameters({
        machine: machineType,
        operation,
        materialId: materialKey,
        initialDiameterMm: rawDiameterMm,
        finalDiameterMm: rawDiameterMm - 2 * depthOfCutMm,
        cutLengthMm,
        isActive: isRunning,
        showCaliper,
      });
    }
  }, [
    activeSimId,
    operation,
    machineType,
    materialKey,
    rawDiameterMm,
    depthOfCutMm,
    cutLengthMm,
    feedMmRev,
    spindleSpeedRpm,
    taperAngleDeg,
    rakeAngleDeg,
    chipType,
    hasBue,
    showVectors,
    showPlanes,
    showCaliper,
    isRunning,
    toolSignature,
    turningResults.cuttingSpeedMMin,
  ]);

  // Log trial handler
  const handleLogTrial = () => {
    const newRecord: LabTrialRecord = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      experimentTitle:
        activeSimId === 'u25me304-lathe-operations'
          ? `Lathe Turning (${operation.replace('-', ' ').toUpperCase()})`
          : activeSimId === 'u25me304-machine-tools'
          ? `${machineType.toUpperCase()} Machining Study`
          : activeSimId === 'u25me304-cutting-mechanics'
          ? `Merchant Circle Forces (α = ${rakeAngleDeg}°)`
          : `Machining Parameters Study`,
      operation: operation.replace('-', ' '),
      material: currentMaterial.name,
      parameter1: `Speed V: ${turningResults.cuttingSpeedMMin} m/min (N=${spindleSpeedRpm} RPM)`,
      parameter2: `Feed f: ${feedMmRev} mm/rev`,
      parameter3: `Depth d: ${depthOfCutMm} mm (D0=${rawDiameterMm} mm)`,
      metric1: `Time Tm: ${turningResults.machiningTimeSec} s (${turningResults.machiningTimeMin} min)`,
      metric2: `MRR: ${turningResults.materialRemovalRateCm3Min} cm³/min`,
      metric3: `Power Pc: ${turningResults.cuttingPowerKW} kW (Ra=${turningResults.theoreticalRoughnessRaUm} µm)`,
      status: isSpeedSafe ? 'COMPLETED' : 'WARNING',
    };
    setTrialLogs((prev) => [newRecord, ...prev.slice(0, 19)]);
    setShowTrialModal(true);
  };

  // Assessment Questions
  const QUIZ_QUESTIONS: AssessmentQuestion[] = [
    {
      id: 1,
      question:
        'In straight cylindrical turning on a lathe, if the workpiece diameter is D = 50 mm and spindle speed is N = 650 RPM, what is the cutting speed V in metres per minute?',
      options: ['102.1 m/min', '65.2 m/min', '45.0 m/min', '150.8 m/min'],
      correctAnswer: 0,
      explanation: 'V = (π · D · N) / 1000 = (3.14159 · 50 · 650) / 1000 = 102.1 m/min.',
      syllabusUnit: 'Unit I & II',
      topic: 'Cutting Speed Calculation',
    },
    {
      id: 2,
      question:
        'According to Merchant’s circle analysis, what is the relationship between shear angle φ, tool rake angle α, and friction angle β?',
      options: ['2φ + β - α = 90°', 'φ + β + α = 180°', '2φ - β + α = 45°', 'φ = α + β'],
      correctAnswer: 0,
      explanation:
        'Merchant’s optimum shear angle equation states 2φ + β - α = π/2 (or 90°), meaning φ = 45° + α/2 - β/2.',
      syllabusUnit: 'Unit I',
      topic: 'Merchant’s Force Mechanics',
    },
    {
      id: 3,
      question:
        'In an ASA single-point tool signature 8-14-6-6-10-15-0.8, what does the second number (14) represent?',
      options: ['Side rake angle (αs)', 'Back rake angle (αb)', 'Side relief angle', 'End cutting edge angle'],
      correctAnswer: 0,
      explanation:
        'ASA sequence is: Back Rake (8°) - Side Rake (14°) - End Relief (6°) - Side Relief (6°) - End Cutting Edge (10°) - Side Cutting Edge (15°) - Nose Radius (0.8 mm).',
      syllabusUnit: 'Unit I',
      topic: 'Cutting Tool Geometry',
    },
    {
      id: 4,
      question:
        'Why does a shaping machine employ a Quick Return Mechanism (such as the crank and slotted lever)?',
      options: [
        'To reduce non-productive return stroke time while maintaining stable uniform forward cutting speed',
        'To double the cutting speed during the forward stroke',
        'To reverse the direction of spindle rotation',
        'To provide continuous material removal',
      ],
      correctAnswer: 0,
      explanation:
        'Metal is only removed during the forward stroke; the return stroke is idle. The quick return mechanism accelerates the return stroke to minimize cycle time.',
      syllabusUnit: 'Unit III',
      topic: 'Shaper Kinematics',
    },
    {
      id: 5,
      question:
        'For taper turning by the compound rest swivelling method, if the large diameter is D = 60 mm, small diameter is d = 40 mm, and taper length is L = 50 mm, what is the half taper angle θ?',
      options: ['11.31°', '5.71°', '20.00°', '15.45°'],
      correctAnswer: 0,
      explanation:
        'tan(θ) = (D - d) / (2 · L) = (60 - 40) / (2 · 50) = 20 / 100 = 0.20 => θ = atan(0.20) = 11.31°.',
      syllabusUnit: 'Unit II',
      topic: 'Taper Turning Calculation',
    },
  ];

  const quizScore = useMemo(() => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  }, [quizAnswers]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP APP BAR / SUITE NAVIGATION
          ───────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          {exitHandler && (
            <button
              onClick={exitHandler}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              ← Back
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold font-mono">
              U25ME304 · ME3391
            </span>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">
              Manufacturing Technology – I
            </h1>
            <span className="text-xs text-slate-400 hidden md:inline">
              · Semester III Mechanical Engineering · 3D Interactive Machining Suite
            </span>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => activeSceneRef.current?.resetCamera()}
            title="Reset Camera View"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Reset View</span>
          </button>

          <button
            onClick={handleLogTrial}
            title="Record Trial into Observation Table"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>+ Log Trial</span>
          </button>

          <button
            onClick={() => setShowQuizModal(true)}
            title="Syllabus Concept Quiz"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Quiz</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            title="Print Official Laboratory Practical Report"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Lab Report</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. SEVEN SYLLABUS MODULE TABS
          ───────────────────────────────────────────────────────────── */}
      <nav className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {MODULES.map((m) => {
          const isActive = activeSimId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveSimId(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${isActive ? 'bg-emerald-950 text-emerald-300' : 'text-slate-500'}`}>
                {m.unit}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN VIEWPORT & SPLIT INTERACTION PANELS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden">
        {/* 3A. 3D Machining Viewport Canvas Area */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-slate-950">
          {/* Top Viewport HUD Telemetry Strip */}
          <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-800 pointer-events-auto flex items-center gap-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Cutting Speed (V):</span>
                <span className="text-sm font-mono font-bold text-sky-400">
                  {turningResults.cuttingSpeedMMin} <span className="text-[10px]">m/min</span>
                </span>
                {!isSpeedSafe && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Range: {currentMaterial.recommendedSpeedRange.min}-{currentMaterial.recommendedSpeedRange.max}
                  </span>
                )}
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-800 pointer-events-auto flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Spindle (N):</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {spindleSpeedRpm} <span className="text-[10px]">RPM</span>
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-800 pointer-events-auto flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">MRR:</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {turningResults.materialRemovalRateCm3Min} <span className="text-[10px]">cm³/min</span>
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-800 pointer-events-auto flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Machining Time (Tm):</span>
                <span className="text-sm font-mono font-bold text-indigo-400">
                  {turningResults.machiningTimeSec} <span className="text-[10px]">s</span>
                </span>
              </div>
            </div>

            {/* Quick Play/Pause & Reset Bar */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  isRunning
                    ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                    : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                }`}
                title={isRunning ? 'Pause Machining' : 'Resume Machining'}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3D WebGL Canvas */}
          <div ref={canvasContainerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Bottom Viewport Information Pill */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Left-click + drag to rotate camera · Wheel to zoom · Right-click + drag to pan</span>
            </div>
            <div className="font-mono text-slate-400">
              Material: <span className="text-slate-200 font-semibold">{currentMaterial.name}</span>
            </div>
          </div>
        </div>

        {/* 3B. SIDEBAR INTERACTION PANELS (Controls / Math / Comparison / Theory) */}
        <div className="w-full lg:w-96 flex flex-col bg-slate-900 border-l border-slate-800 overflow-hidden flex-shrink-0">
          {/* Sub-tab navigation */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-2 py-1 gap-1">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                activeTab === 'controls' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Controls
            </button>
            <button
              onClick={() => setActiveTab('calculations')}
              className={`flex-1 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                activeTab === 'calculations' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Formulas &amp; Math
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex-1 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                activeTab === 'comparison' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Machines
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex-1 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                activeTab === 'theory' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Theory
            </button>
          </div>

          {/* Panel Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'controls' && (
              <>
                {/* 1. Workpiece Material Selection */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Workpiece Material
                  </label>
                  <select
                    value={materialKey}
                    onChange={(e) => setMaterialKey(e.target.value as WorkpieceMaterialId)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.values(WORKPIECE_MATERIALS).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (HB {m.brinellHardnessHB})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Machine & Operation Selection */}
                {activeSimId === 'u25me304-lathe-operations' && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Lathe Machining Operation
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'plain-turning', label: 'Plain Turning' },
                        { id: 'facing', label: 'Facing' },
                        { id: 'step-turning', label: 'Step Turning' },
                        { id: 'taper-turning', label: 'Taper Turning' },
                        { id: 'grooving', label: 'Grooving' },
                        { id: 'knurling', label: 'Knurling' },
                      ].map((op) => (
                        <button
                          key={op.id}
                          onClick={() => setOperation(op.id as TurningOperation)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border text-left transition cursor-pointer ${
                            operation === op.id
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          {op.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSimId === 'u25me304-machine-tools' && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Active Machine Tool
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'drilling', label: 'Drilling Press' },
                        { id: 'milling', label: 'Milling Machine' },
                        { id: 'shaping', label: 'Shaper Machine' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMachineType(m.id as MachineToolType)}
                          className={`px-2 py-1.5 text-xs font-semibold rounded-lg border text-center transition cursor-pointer ${
                            machineType === m.id
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Parameter Sliders */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  {/* Spindle Speed */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Spindle Speed (N):</span>
                      <span className="font-mono font-bold text-emerald-400">{spindleSpeedRpm} RPM</span>
                    </div>
                    <input
                      type="range"
                      min="120"
                      max="1800"
                      step="20"
                      value={spindleSpeedRpm}
                      onChange={(e) => setSpindleSpeedRpm(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Feed */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Feed Rate (f):</span>
                      <span className="font-mono font-bold text-sky-400">{feedMmRev} mm/rev</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.80"
                      step="0.05"
                      value={feedMmRev}
                      onChange={(e) => setFeedMmRev(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  {/* Depth of cut */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Depth of Cut (d):</span>
                      <span className="font-mono font-bold text-amber-400">{depthOfCutMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.25"
                      value={depthOfCutMm}
                      onChange={(e) => setDepthOfCutMm(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Workpiece Diameter */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Workpiece Diameter (D):</span>
                      <span className="font-mono font-bold text-slate-200">{rawDiameterMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="90"
                      step="5"
                      value={rawDiameterMm}
                      onChange={(e) => setRawDiameterMm(Number(e.target.value))}
                      className="w-full accent-slate-400 cursor-pointer"
                    />
                  </div>

                  {/* Taper Angle (if Taper Turning) */}
                  {operation === 'taper-turning' && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 font-medium">Half Taper Angle (θ):</span>
                        <span className="font-mono font-bold text-purple-400">{taperAngleDeg}°</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="25"
                        step="1"
                        value={taperAngleDeg}
                        onChange={(e) => setTaperAngleDeg(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Rake Angle (if Mechanics or Tool Geometry) */}
                  {(activeSimId === 'u25me304-tool-geometry' || activeSimId === 'u25me304-cutting-mechanics') && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 font-medium">Side Rake Angle (αs):</span>
                        <span className="font-mono font-bold text-rose-400">{rakeAngleDeg}°</span>
                      </div>
                      <input
                        type="range"
                        min="-5"
                        max="30"
                        step="1"
                        value={rakeAngleDeg}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRakeAngleDeg(val);
                          setToolSignature((prev) => ({ ...prev, sideRakeAngleDeg: val }));
                        }}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Toggles */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  {activeSimId === 'u25me304-cutting-mechanics' && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Built-Up Edge (BUE):</span>
                      <button
                        onClick={() => setHasBue(!hasBue)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                          hasBue ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {hasBue ? 'Active' : 'Off'}
                      </button>
                    </div>
                  )}

                  {activeSimId === 'u25me304-virtual-workshop' && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Virtual Caliper Metrology:</span>
                      <button
                        onClick={() => setShowCaliper(!showCaliper)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                          showCaliper ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {showCaliper ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: STEP-BY-STEP MATHEMATICAL CALCULATIONS */}
            {activeTab === 'calculations' && (
              <div className="space-y-4 text-xs">
                {/* 1. Cutting Speed Equation */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    1. Cutting Speed Formulation
                  </div>
                  <div className="font-mono text-slate-200 text-xs">
                    V = (π · D · N) / 1000
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    V = (π · {rawDiameterMm} · {spindleSpeedRpm}) / 1000 = <span className="text-emerald-400 font-bold">{turningResults.cuttingSpeedMMin} m/min</span>
                  </div>
                </div>

                {/* 2. Depth of Cut */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    2. Depth of Cut Formulation
                  </div>
                  <div className="font-mono text-slate-200 text-xs">
                    d = (D₀ - D_f) / 2
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    d = ({rawDiameterMm} - {rawDiameterMm - 2 * depthOfCutMm}) / 2 = <span className="text-sky-400 font-bold">{depthOfCutMm} mm</span>
                  </div>
                </div>

                {/* 3. Machining Time */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    3. Machining Time Formulation
                  </div>
                  <div className="font-mono text-slate-200 text-xs">
                    T_m = L / (f · N)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    T_m = {cutLengthMm} / ({feedMmRev} · {spindleSpeedRpm}) = <span className="text-amber-400 font-bold">{turningResults.machiningTimeMin} min ({turningResults.machiningTimeSec} s)</span>
                  </div>
                </div>

                {/* 4. Material Removal Rate */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    4. Material Removal Rate (MRR)
                  </div>
                  <div className="font-mono text-slate-200 text-xs">
                    MRR ≈ 1000 · V · f · d
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    MRR = 1000 · {turningResults.cuttingSpeedMMin} · {feedMmRev} · {depthOfCutMm} = <span className="text-indigo-400 font-bold">{turningResults.materialRemovalRateMm3Min} mm³/min</span>
                  </div>
                </div>

                {/* 5. Cutting Power */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    5. Cutting Power &amp; Specific Energy
                  </div>
                  <div className="font-mono text-slate-200 text-xs">
                    P_c = (k_c · MRR) / (60 · 10⁶)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    P_c = ({currentMaterial.specificCuttingEnergyKc} · {turningResults.materialRemovalRateMm3Min}) / 60,000,000 = <span className="text-rose-400 font-bold">{turningResults.cuttingPowerKW} kW</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MACHINE COMPARISON MATRIX */}
            {activeTab === 'comparison' && (
              <div className="space-y-3 text-xs">
                <div className="text-[11px] font-bold text-slate-300">
                  Machine Tools Kinematic Comparison
                </div>

                {[
                  {
                    name: 'Centre Lathe',
                    motion: 'Workpiece rotates (cutting motion); tool travels linearly (feed motion).',
                    tool: 'Single-point cutting tool (HSS or Carbide insert).',
                    work: 'Rotational, cylindrical, tapered, or facing workpieces.',
                    advantages: 'High concentricity, versatile operations (turning, facing, threading).',
                  },
                  {
                    name: 'Drill Press',
                    motion: 'Tool rotates (cutting motion); tool feeds axially into work (feed motion).',
                    tool: 'Multi-flute twist drill, reamer, or counterbore.',
                    work: 'Flat plates, prismatic blocks, round bars requiring holes.',
                    advantages: 'Rapid cylindrical hole generation, high axial rigidity.',
                  },
                  {
                    name: 'Milling Machine',
                    motion: 'Multi-tooth cutter rotates (cutting motion); workpiece feeds linearly on table.',
                    tool: 'End mill, face mill, slab mill with helical teeth.',
                    work: 'Prismatic, flat surfaces, slots, keyways, 3D contoured profiles.',
                    advantages: 'High material removal rate, flat and complex geometric capability.',
                  },
                  {
                    name: 'Shaping Machine',
                    motion: 'Tool reciprocates linearly (cutting stroke); workpiece cross-feeds intermittently.',
                    tool: 'Single-point shaper tool bit mounted in clapper box.',
                    work: 'Flat horizontal, vertical, inclined planes, and keyways.',
                    advantages: 'Low tooling cost, simple setup, excellent for one-off prototyping.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-emerald-400 text-xs">{item.name}</div>
                    <div className="text-slate-400 text-[11px]"><span className="text-slate-300 font-semibold">Motion:</span> {item.motion}</div>
                    <div className="text-slate-400 text-[11px]"><span className="text-slate-300 font-semibold">Tool:</span> {item.tool}</div>
                    <div className="text-slate-400 text-[11px]"><span className="text-slate-300 font-semibold">Work:</span> {item.work}</div>
                    <div className="text-slate-400 text-[11px]"><span className="text-slate-300 font-semibold">Pro:</span> {item.advantages}</div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: PEDAGOGICAL THEORY & SYLLABUS MAPPING */}
            {activeTab === 'theory' && (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400 text-xs">
                    Anna University / R2025 Syllabus Overview
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Course: <span className="text-slate-200 font-semibold">Manufacturing Technology – I (U25ME304)</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Department of Mechanical Engineering, Semester III.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-sky-400 text-xs">
                    Tool Signature Systems (ASA vs ORS)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">ASA System:</strong> αb - αs - θe - θs - Ce - Cs - R
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 bg-slate-900 p-2 rounded">
                    {toolSignature.backRakeAngleDeg}° - {toolSignature.sideRakeAngleDeg}° - {toolSignature.endReliefAngleDeg}° - {toolSignature.sideReliefAngleDeg}° - {toolSignature.endCuttingEdgeAngleDeg}° - {toolSignature.sideCuttingEdgeAngleDeg}° - {toolSignature.noseRadiusMm} mm
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong className="text-slate-300">ORS System:</strong> λ - γ - α - α' - φ - φ1 - r
                  </div>
                  <div className="text-[11px] font-mono text-sky-400 bg-slate-900 p-2 rounded">
                    {orsSignature.inclinationAngleDeg}° - {orsSignature.orthogonalRakeAngleDeg}° - {orsSignature.orthogonalClearanceDeg}° - {orsSignature.auxiliaryClearanceDeg}° - {orsSignature.principalCuttingEdgeDeg}° - {orsSignature.auxiliaryCuttingEdgeDeg}° - {orsSignature.noseRadiusMm} mm
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 text-xs">
                    Merchant’s Circle Diagram Forces
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-slate-900">Fc: <span className="text-emerald-400 font-bold">{merchantForces.cuttingForceFc} N</span></div>
                    <div className="p-2 rounded bg-slate-900">Ft: <span className="text-sky-400 font-bold">{merchantForces.thrustForceFt} N</span></div>
                    <div className="p-2 rounded bg-slate-900">Fs: <span className="text-rose-400 font-bold">{merchantForces.shearForceFs} N</span></div>
                    <div className="p-2 rounded bg-slate-900">Fn: <span className="text-amber-400 font-bold">{merchantForces.normalShearForceFn} N</span></div>
                    <div className="p-2 rounded bg-slate-900">F: <span className="text-orange-400 font-bold">{merchantForces.frictionForceF} N</span></div>
                    <div className="p-2 rounded bg-slate-900">N: <span className="text-purple-400 font-bold">{merchantForces.normalFrictionForceN} N</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. OBSERVATION LOG MODAL
          ───────────────────────────────────────────────────────────── */}
      {showTrialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Virtual Manufacturing Laboratory — Observation Table
                </h2>
              </div>
              <button
                onClick={() => setShowTrialModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {trialLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No trial observations recorded yet. Click "+ Log Trial" to record simulated measurements.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Trial ID</th>
                        <th className="p-3">Experiment</th>
                        <th className="p-3">Material</th>
                        <th className="p-3">Speed (V, N)</th>
                        <th className="p-3">Feed (f)</th>
                        <th className="p-3">Depth (d)</th>
                        <th className="p-3">Machining Time (Tm)</th>
                        <th className="p-3">MRR</th>
                        <th className="p-3">Power</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {trialLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40">
                          <td className="p-3 text-slate-400">{log.id}</td>
                          <td className="p-3 text-slate-200 font-sans font-medium">{log.experimentTitle}</td>
                          <td className="p-3 text-emerald-400">{log.material}</td>
                          <td className="p-3 text-sky-400">{log.parameter1}</td>
                          <td className="p-3 text-slate-300">{log.parameter2}</td>
                          <td className="p-3 text-amber-400">{log.parameter3}</td>
                          <td className="p-3 text-indigo-400 font-bold">{log.metric1}</td>
                          <td className="p-3 text-rose-400">{log.metric2}</td>
                          <td className="p-3 text-emerald-300">{log.metric3}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
              <span className="text-xs text-slate-400">
                {trialLogs.length} simulated observation trials recorded.
              </span>
              <button
                onClick={() => setShowTrialModal(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                Close Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. CONCEPT QUIZ MODAL
          ───────────────────────────────────────────────────────────── */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Manufacturing Technology – I · Concept Evaluation
                </h2>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {QUIZ_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-200">
                      Q{idx + 1}. {q.question}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex-shrink-0">
                      {q.syllabusUnit}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[idx] === oIdx;
                      const isCorrect = oIdx === q.correctAnswer;
                      let btnStyle = 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-emerald-600/30 text-emerald-300 border-emerald-500';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [idx]: oIdx }))}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="text-[11px] text-slate-400 p-2.5 rounded bg-slate-900 border border-slate-800 mt-2">
                      <strong className="text-emerald-400">Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
              <div className="text-xs font-mono">
                {quizSubmitted ? (
                  <span className="text-emerald-400 font-bold">
                    Score: {quizScore} / {QUIZ_QUESTIONS.length} (
                    {Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)}%)
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {Object.keys(quizAnswers).length} of {QUIZ_QUESTIONS.length} answered
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length === 0}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                  >
                    Retry Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. PRINT-READY LABORATORY REPORT MODAL
          ───────────────────────────────────────────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Official Virtual Laboratory Practical Report
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Report Document */}
            <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900 print:p-0 font-serif space-y-6">
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h1 className="text-xl font-bold uppercase tracking-wide">
                  PiyushDhara Eduverse — Engineering Virtual Laboratory
                </h1>
                <p className="text-xs font-sans text-slate-600">
                  Affiliated to Anna University · Autonomous Curriculum R2025 Revised CBCS
                </p>
                <p className="text-sm font-sans font-semibold text-slate-800 mt-1">
                  Department of Mechanical Engineering · Semester III
                </p>
                <p className="text-xs font-mono font-bold text-slate-700">
                  Course: U25ME304 / ME3391 — Manufacturing Technology – I Laboratory
                </p>
              </div>

              {/* Student Metadata Card */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-slate-100 p-4 rounded-lg border border-slate-300">
                <div>
                  <span className="font-bold">Student Name: </span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="border-b border-slate-400 font-semibold bg-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <span className="font-bold">Register Number: </span>
                  <input
                    type="text"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    className="border-b border-slate-400 font-semibold bg-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <span className="font-bold">Date of Experiment: </span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-bold">Experiment Title: </span>
                  <span className="font-semibold">Turning Parameters &amp; Metal Cutting Mechanics</span>
                </div>
              </div>

              {/* Aim & Apparatus */}
              <div className="space-y-2">
                <h3 className="text-sm font-sans font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                  1. Aim of the Experiment
                </h3>
                <p className="text-xs leading-relaxed text-slate-800">
                  To study the constructional anatomy and kinematics of the centre lathe machine, perform plain and stepped cylindrical turning operations on mild steel specimen, compute cutting speed (V), machining time (Tm), material removal rate (MRR), and analyze orthogonal cutting forces using Merchant’s circle formulation.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-sans font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                  2. Apparatus &amp; Simulation Software
                </h3>
                <p className="text-xs text-slate-800">
                  Interactive 3D Centre Lathe Virtual Rig, HSS/Carbide single-point cutting tool (ASA: 8-14-6-6-10-15-0.8), Mild steel cylindrical workpiece (D₀ = {rawDiameterMm} mm), Virtual digital Vernier Caliper.
                </p>
              </div>

              {/* Governing Equations */}
              <div className="space-y-2">
                <h3 className="text-sm font-sans font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                  3. Governing Formulae &amp; Calculations
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-50 p-3 rounded border border-slate-200">
                  <div>• Cutting Speed: V = (π · D · N) / 1000 = {turningResults.cuttingSpeedMMin} m/min</div>
                  <div>• Depth of Cut: d = (D₀ - D_f) / 2 = {depthOfCutMm} mm</div>
                  <div>• Machining Time: T_m = L / (f · N) = {turningResults.machiningTimeMin} min</div>
                  <div>• Material Removal Rate: MRR ≈ 1000·V·f·d = {turningResults.materialRemovalRateMm3Min} mm³/min</div>
                  <div>• Cutting Force: Fc = {merchantForces.cuttingForceFc} N</div>
                  <div>• Thrust Force: Ft = {merchantForces.thrustForceFt} N</div>
                </div>
              </div>

              {/* Observation Table */}
              <div className="space-y-2">
                <h3 className="text-sm font-sans font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                  4. Observation Table (Simulated Experimental Readings)
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-400 text-center font-sans">
                  <thead className="bg-slate-200 font-bold">
                    <tr>
                      <th className="border border-slate-400 p-1.5">Trial</th>
                      <th className="border border-slate-400 p-1.5">Material</th>
                      <th className="border border-slate-400 p-1.5">Diameter D (mm)</th>
                      <th className="border border-slate-400 p-1.5">RPM N</th>
                      <th className="border border-slate-400 p-1.5">Speed V (m/min)</th>
                      <th className="border border-slate-400 p-1.5">Feed f (mm/rev)</th>
                      <th className="border border-slate-400 p-1.5">Time Tm (s)</th>
                      <th className="border border-slate-400 p-1.5">MRR (cm³/min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-slate-400 p-1.5">1 (Active)</td>
                      <td className="border border-slate-400 p-1.5">{currentMaterial.name}</td>
                      <td className="border border-slate-400 p-1.5">{rawDiameterMm}</td>
                      <td className="border border-slate-400 p-1.5">{spindleSpeedRpm}</td>
                      <td className="border border-slate-400 p-1.5">{turningResults.cuttingSpeedMMin}</td>
                      <td className="border border-slate-400 p-1.5">{feedMmRev}</td>
                      <td className="border border-slate-400 p-1.5">{turningResults.machiningTimeSec}</td>
                      <td className="border border-slate-400 p-1.5">{turningResults.materialRemovalRateCm3Min}</td>
                    </tr>
                    {trialLogs.slice(0, 4).map((log, i) => (
                      <tr key={log.id} className="bg-slate-50">
                        <td className="border border-slate-400 p-1.5">{i + 2}</td>
                        <td className="border border-slate-400 p-1.5">{log.material}</td>
                        <td className="border border-slate-400 p-1.5">{rawDiameterMm}</td>
                        <td className="border border-slate-400 p-1.5">{spindleSpeedRpm}</td>
                        <td className="border border-slate-400 p-1.5">{turningResults.cuttingSpeedMMin}</td>
                        <td className="border border-slate-400 p-1.5">{feedMmRev}</td>
                        <td className="border border-slate-400 p-1.5">{log.metric1}</td>
                        <td className="border border-slate-400 p-1.5">{log.metric2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Conclusions */}
              <div className="space-y-2">
                <h3 className="text-sm font-sans font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                  5. Conclusion &amp; Inference
                </h3>
                <p className="text-xs leading-relaxed text-slate-800">
                  The cylindrical turning simulation was successfully executed on the virtual lathe rig. The cutting speed was determined to be {turningResults.cuttingSpeedMMin} m/min with an effective machining time of {turningResults.machiningTimeSec} seconds for {cutLengthMm} mm cut length. Merchant’s circle force analysis demonstrated that higher positive rake angles reduce both cutting force and power consumption by increasing the shear plane angle (φ = {merchantForces.shearAngleDeg}°).
                </p>
              </div>

              {/* Signature block */}
              <div className="flex justify-between items-end pt-12 text-xs font-sans">
                <div className="text-center">
                  <div className="w-40 border-b border-slate-800 mb-1" />
                  <span>Student Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-800 mb-1" />
                  <span>Faculty In-Charge Evaluation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
