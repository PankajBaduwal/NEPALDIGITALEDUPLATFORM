/**
 * PiyushDhara Eduverse — Manufacturing Technology – II (U25ME401 / ME3491)
 * Interactive 3D Simulation Suite & Virtual Manufacturing Workshop
 * Department: Mechanical Engineering · Semester IV
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  BookOpen,
  Award,
  Layers,
  Zap,
  Flame,
  Box,
  Compass,
  Calculator,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  createManufacturing2Scene,
  CNCMachiningScene,
  NonTraditionalScene,
  WeldingScene,
  CastingScene,
  FormingScene,
  WorkshopScene,
} from '../simulations';
import { Manufacturing2Calculator } from '../core/Manufacturing2Calculator';
import type {
  Manufacturing2SimId,
  CNCOperation,
  CNCMachiningParams,
  NonTraditionalProcess,
  EDMParams,
  ECMParams,
  LaserParams,
  WaterJetParams,
  WeldingProcess,
  WeldJointType,
  WeldingParams,
  CastingProcess,
  MouldDesignParams,
  FormingProcess,
  FormingParams,
  MachiningCalculationsInput,
  SelectionCriteria,
  Manufacturing2LabTrial,
  Manufacturing2QuizQuestion,
} from '../core/types';

interface ManufacturingTech2WorkspaceProps {
  simulationId?: string;
  onBack?: () => void;
}

export const ManufacturingTech2Workspace: React.FC<ManufacturingTech2WorkspaceProps> = ({
  simulationId = 'cnc-machining',
  onBack,
}) => {
  // Tab Navigation Mapping
  const initialTab = useMemo<Manufacturing2SimId>(() => {
    if (simulationId.includes('cnc')) return 'cnc-machining';
    if (simulationId.includes('non-traditional') || simulationId.includes('unconventional')) return 'non-traditional';
    if (simulationId.includes('welding')) return 'welding-processes';
    if (simulationId.includes('casting')) return 'casting-processes';
    if (simulationId.includes('forming')) return 'metal-forming';
    if (simulationId.includes('calculation')) return 'manufacturing-calculations';
    if (simulationId.includes('selection')) return 'process-selection';
    if (simulationId.includes('workshop')) return 'virtual-workshop';
    return 'cnc-machining';
  }, [simulationId]);

  const [activeTab, setActiveTab] = useState<Manufacturing2SimId>(initialTab);
  const [use3D, setUse3D] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // 3D Canvas Mounting Ref & Controller
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  // ─── Module 1: CNC Parameters ───
  const [cncParams, setCncParams] = useState<CNCMachiningParams>({
    operation: 'contouring',
    spindleSpeedRPM: 2400,
    feedRateMMPM: 350,
    depthOfCutMM: 2.0,
    toolDiameterMM: 10,
    workpieceWidthMM: 80,
    workpieceLengthMM: 120,
    workpieceHeightMM: 30,
    coolingActive: true,
  });

  // ─── Module 2: Non-Traditional Parameters ───
  const [ntProcess, setNtProcess] = useState<NonTraditionalProcess>('edm');
  const [edmParams, setEdmParams] = useState<EDMParams>({
    dischargeCurrentA: 18,
    pulseOnTimeMicroSec: 65,
    pulseOffTimeMicroSec: 25,
    sparkGapMM: 0.035,
    dielectricType: 'hydrocarbon-oil',
    workpieceConductive: true,
    electrodeMaterial: 'copper',
  });
  const [ecmParams, setEcmParams] = useState<ECMParams>({
    voltageV: 15,
    currentDensityACm2: 80,
    electrolyteFlowSpeedMS: 25,
    electrolyteType: 'sodium-chloride',
    valencyOfDissolution: 2,
    atomicWeightG: 55.85,
  });
  const [laserParams, setLaserParams] = useState<LaserParams>({
    laserPowerW: 2500,
    focalSpotDiameterMM: 0.2,
    cuttingSpeedMMPM: 1800,
    assistGas: 'oxygen',
    materialThicknessMM: 6,
  });
  const [wjParams, setWjParams] = useState<WaterJetParams>({
    pumpPressureBar: 3800,
    orificeDiameterMM: 0.3,
    abrasiveMassFlowGMin: 400,
    abrasiveType: 'garnet-80',
    standoffDistanceMM: 2.0,
    cuttingSpeedMMPM: 250,
  });

  // ─── Module 3: Welding Parameters ───
  const [weldParams, setWeldParams] = useState<WeldingParams>({
    process: 'gmaw',
    jointType: 'butt',
    voltageV: 22,
    currentA: 180,
    travelSpeedMMS: 6.0,
    arcEfficiency: 0.85,
    plateThicknessMM: 8.0,
    rootGapMM: 2.0,
    grooveAngleDeg: 60,
  });

  // ─── Module 4: Casting Parameters ───
  const [mouldParams, setMouldParams] = useState<MouldDesignParams>({
    process: 'sand-casting',
    castingShape: 'cylinder',
    castingVolumeCM3: 850,
    castingSurfaceAreaCM2: 450,
    pourTemperatureC: 1550,
    sprueHeightMM: 180,
    chvorinovConstantMinCm2: 2.2,
    riserShape: 'top-cylindrical',
  });

  // ─── Module 5: Forming Parameters ───
  const [formingParams, setFormingParams] = useState<FormingParams>({
    process: 'forging',
    materialYieldStressMPa: 240,
    frictionCoefficient: 0.25,
    initialDimensionMM: 60,
    finalDimensionMM: 35,
    workpieceLengthMM: 80,
    rollRadiusMM: 160,
    dieAngleDeg: 12,
  });

  // ─── Module 6: Calculations Parameters ───
  const [calcInput, setCalcInput] = useState<MachiningCalculationsInput>({
    operation: 'turning',
    workpieceDiameterMM: 65,
    cuttingSpeedMPM: 120,
    spindleSpeedRPM: 588,
    feedMMRev: 0.25,
    feedToothMM: 0.12,
    numberOfTeeth: 4,
    depthOfCutMM: 2.5,
    cutLengthMM: 150,
    initialDiameterMM: 70,
    finalDiameterMM: 65,
    taylorConstantC: 180,
    taylorExponentN: 0.22,
  });

  // ─── Module 7: Process Selection Parameters ───
  const [criteria, setCriteria] = useState<SelectionCriteria>({
    materialCategory: 'steels',
    partGeometry: 'complex-cavity',
    batchQuantity: 'medium-100-5000',
    toleranceGradeIT: 7,
    surfaceRoughnessRaMicron: 1.6,
    wallThicknessMM: 5.0,
    budgetPriority: 'balanced',
  });

  // ─── Laboratory Trials State ───
  const [trials, setTrials] = useState<Manufacturing2LabTrial[]>([]);
  const [quizOpen, setQuizOpen] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Dynamic Calculated Results
  const cncResult = useMemo(() => Manufacturing2Calculator.computeCNCToolPath(cncParams), [cncParams]);
  const ntResult = useMemo(() => {
    switch (ntProcess) {
      case 'edm':
        return Manufacturing2Calculator.computeEDM(edmParams);
      case 'ecm':
        return Manufacturing2Calculator.computeECM(ecmParams);
      case 'laser':
        return Manufacturing2Calculator.computeLaser(laserParams);
      case 'waterjet':
      default:
        return Manufacturing2Calculator.computeWaterJet(wjParams);
    }
  }, [ntProcess, edmParams, ecmParams, laserParams, wjParams]);

  const weldResult = useMemo(() => Manufacturing2Calculator.computeWelding(weldParams), [weldParams]);
  const castResult = useMemo(() => Manufacturing2Calculator.computeCastingMould(mouldParams), [mouldParams]);
  const formResult = useMemo(() => Manufacturing2Calculator.computeMetalForming(formingParams), [formingParams]);
  const calcResult = useMemo(() => Manufacturing2Calculator.computeMachiningParameters(calcInput), [calcInput]);
  const selectResult = useMemo(() => Manufacturing2Calculator.selectManufacturingProcess(criteria), [criteria]);
  const quizQuestions = useMemo(() => Manufacturing2Calculator.getQuizQuestions(), []);

  // Initialize & Switch 3D Scene
  useEffect(() => {
    if (!use3D || !canvasContainerRef.current) return;

    if (sceneRef.current) {
      sceneRef.current.dispose();
      sceneRef.current = null;
    }

    try {
      const scene = createManufacturing2Scene(activeTab, canvasContainerRef.current);
      sceneRef.current = scene;

      if (activeTab === 'cnc-machining') {
        (scene as CNCMachiningScene).setToolPath(cncResult.toolPath);
        (scene as CNCMachiningScene).updateWorkpieceDimensions(cncParams);
      } else if (activeTab === 'non-traditional') {
        (scene as NonTraditionalScene).switchProcess(ntProcess);
      } else if (activeTab === 'welding-processes') {
        (scene as WeldingScene).buildJoint(weldParams.jointType);
      } else if (activeTab === 'metal-forming') {
        (scene as FormingScene).switchProcess(formingParams.process);
      }
    } catch (err) {
      console.warn('3D initialization failed, falling back to 2D schematic mode:', err);
      setUse3D(false);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [activeTab, use3D]);

  // Update Scene when parameters change
  useEffect(() => {
    if (!sceneRef.current || !use3D) return;

    if (activeTab === 'cnc-machining') {
      (sceneRef.current as CNCMachiningScene).setToolPath(cncResult.toolPath);
      (sceneRef.current as CNCMachiningScene).updateWorkpieceDimensions(cncParams);
    } else if (activeTab === 'non-traditional') {
      (sceneRef.current as NonTraditionalScene).switchProcess(ntProcess);
      (sceneRef.current as NonTraditionalScene).setSimulating(isPlaying);
    } else if (activeTab === 'welding-processes') {
      (sceneRef.current as WeldingScene).buildJoint(weldParams.jointType);
    } else if (activeTab === 'metal-forming') {
      (sceneRef.current as FormingScene).switchProcess(formingParams.process);
    }
  }, [cncResult, ntProcess, weldParams.jointType, formingParams.process, isPlaying, activeTab, use3D]);

  const handlePlayToggle = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (sceneRef.current) {
      if (activeTab === 'cnc-machining') {
        if (nextState) sceneRef.current.startMachining();
        else sceneRef.current.pauseMachining();
      } else if (activeTab === 'non-traditional') {
        sceneRef.current.setSimulating(nextState);
      } else if (activeTab === 'welding-processes') {
        if (nextState) sceneRef.current.startWelding();
      } else if (activeTab === 'casting-processes') {
        if (nextState) sceneRef.current.startPouring();
      } else if (activeTab === 'metal-forming') {
        if (nextState) sceneRef.current.startForming();
      } else if (activeTab === 'virtual-workshop') {
        sceneRef.current.setAutoRotate(nextState);
      }
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (sceneRef.current) {
      if (activeTab === 'cnc-machining') sceneRef.current.resetMachining();
      else if (activeTab === 'non-traditional') sceneRef.current.setSimulating(false);
      else if (activeTab === 'welding-processes') sceneRef.current.resetWelding();
      else if (activeTab === 'casting-processes') sceneRef.current.resetCasting();
      else if (activeTab === 'metal-forming') sceneRef.current.resetForming();
    }
  };

  const handleRecordTrial = () => {
    let processName = activeTab.toUpperCase();
    let keyParameters: Record<string, any> = {};
    let outputMetrics: Record<string, any> = {};

    if (activeTab === 'cnc-machining') {
      processName = `CNC ${cncParams.operation.toUpperCase()}`;
      keyParameters = {
        operation: cncParams.operation,
        spindleSpeedRPM: cncParams.spindleSpeedRPM,
        feedRateMMPM: cncParams.feedRateMMPM,
        depthOfCutMM: cncParams.depthOfCutMM,
      };
      outputMetrics = {
        cycleTimeSec: cncResult.estimatedCycleTimeSec.toFixed(1),
        mrrCM3Min: cncResult.materialRemovalRateCM3Min.toFixed(2),
        cuttingSpeedMPM: cncResult.cuttingSpeedMPM.toFixed(1),
        powerKW: cncResult.powerRequiredKW.toFixed(2),
      };
    } else if (activeTab === 'welding-processes') {
      processName = `${weldParams.process.toUpperCase()} ${weldParams.jointType.toUpperCase()}`;
      keyParameters = {
        currentA: weldParams.currentA,
        voltageV: weldParams.voltageV,
        travelSpeedMMS: weldParams.travelSpeedMMS,
      };
      outputMetrics = {
        heatInputKJMM: weldResult.heatInputKJMM.toFixed(2),
        beadWidthMM: weldResult.beadWidthMM.toFixed(1),
        penetrationMM: weldResult.penetrationDepthMM.toFixed(1),
      };
    } else if (activeTab === 'casting-processes') {
      processName = `CASTING (${mouldParams.process})`;
      keyParameters = { volumeCM3: mouldParams.castingVolumeCM3, areaCM2: mouldParams.castingSurfaceAreaCM2 };
      outputMetrics = {
        modulusCM: castResult.modulusCM.toFixed(3),
        solidificationMin: castResult.solidificationTimeMin.toFixed(2),
        riserAdequate: castResult.riserAdequate ? 'YES' : 'NO',
      };
    } else if (activeTab === 'metal-forming') {
      processName = `FORMING (${formingParams.process.toUpperCase()})`;
      keyParameters = { initialMM: formingParams.initialDimensionMM, finalMM: formingParams.finalDimensionMM };
      outputMetrics = {
        forceKN: formResult.deformationForceKN.toFixed(1),
        reductionPercent: formResult.reductionRatioPercent.toFixed(1),
      };
    } else {
      processName = 'MANUFACTURING CALCULATION';
      keyParameters = { cuttingSpeedMPM: calcInput.cuttingSpeedMPM, feedMMRev: calcInput.feedMMRev };
      outputMetrics = {
        timeMin: calcResult.machiningTimeMin.toFixed(2),
        mrrCM3Min: calcResult.materialRemovalRateCM3Min.toFixed(2),
      };
    }

    const newTrial: Manufacturing2LabTrial = {
      trialId: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      module: activeTab,
      processName,
      keyParameters,
      outputMetrics,
      notes: 'Verified against Anna University U25ME401 experimental standards.',
    };

    setTrials((prev) => [newTrial, ...prev]);
  };

  const handleExportCSV = () => {
    if (trials.length === 0) return;
    const headers = ['Trial ID', 'Timestamp', 'Module', 'Process', 'Parameters', 'Metrics', 'Notes'];
    const rows = trials.map((t) => [
      t.trialId,
      t.timestamp,
      t.module,
      t.processName,
      JSON.stringify(t.keyParameters).replace(/"/g, '""'),
      JSON.stringify(t.outputMetrics).replace(/"/g, '""'),
      `"${t.notes}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `U25ME401_Lab_Trials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnswerSelect = (qId: number, optIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleQuizSubmit = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) score++;
    });
    setQuizScore(score);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* ─── Top Brand Header ─── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Return to Subject Hub"
            >
              ←
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                U25ME401 · SEMESTER IV
              </span>
              <span className="text-xs text-slate-400 font-medium">Mechanical Engineering</span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Manufacturing Technology – II</span>
              <span className="text-slate-500 text-xs font-normal">| Virtual Machine Tools &amp; Production Lab</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUse3D(!use3D)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
              use3D
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{use3D ? '3D Render Mode' : '2D Schematic Mode'}</span>
          </button>
          <button
            onClick={() => {
              setQuizOpen(true);
              setQuizScore(null);
              setUserAnswers({});
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 transition flex items-center gap-1.5 shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Evaluate Concept (Quiz)</span>
          </button>
        </div>
      </header>

      {/* ─── 8-Module Navigation Tabs ─── */}
      <nav className="flex items-center gap-1 px-4 py-2 border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-thin">
        {[
          { id: 'cnc-machining', label: '1. CNC Tool Path', icon: Compass },
          { id: 'non-traditional', label: '2. Non-Traditional', icon: Zap },
          { id: 'welding-processes', label: '3. Welding & Joints', icon: Flame },
          { id: 'casting-processes', label: '4. Casting & Moulds', icon: Box },
          { id: 'metal-forming', label: '5. Metal Forming', icon: Layers },
          { id: 'manufacturing-calculations', label: '6. Calculations', icon: Calculator },
          { id: 'process-selection', label: '7. Process Selection', icon: Filter },
          { id: 'virtual-workshop', label: '8. 3D Workshop Bay', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Manufacturing2SimId);
                setIsPlaying(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ─── Main Content Split Workspace ─── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center Viewport (3D or 2D) */}
        <div className="flex-1 flex flex-col relative bg-slate-950 border-r border-slate-800">
          {/* Top Canvas Action Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-md">
              <button
                onClick={handlePlayToggle}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Reset Operation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-px bg-slate-700 mx-1" />
              <button
                onClick={handleRecordTrial}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40 transition flex items-center gap-1"
              >
                <span>Record Trial</span>
              </button>
            </div>

            <div className="pointer-events-auto bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 font-mono flex items-center gap-3">
              {activeTab === 'cnc-machining' && (
                <>
                  <span>Spindle: <strong className="text-amber-400">{cncParams.spindleSpeedRPM} RPM</strong></span>
                  <span>Feed: <strong className="text-cyan-400">{cncParams.feedRateMMPM} mm/min</strong></span>
                  <span>MRR: <strong className="text-emerald-400">{cncResult.materialRemovalRateCM3Min.toFixed(1)} cm³/min</strong></span>
                </>
              )}
              {activeTab === 'welding-processes' && (
                <>
                  <span>Heat Input: <strong className="text-amber-400">{weldResult.heatInputKJMM.toFixed(2)} kJ/mm</strong></span>
                  <span>Bead: <strong className="text-cyan-400">{weldResult.beadWidthMM.toFixed(1)} mm</strong></span>
                </>
              )}
              {activeTab === 'casting-processes' && (
                <>
                  <span>Modulus: <strong className="text-amber-400">{castResult.modulusCM.toFixed(3)} cm</strong></span>
                  <span>Solidification: <strong className="text-emerald-400">{castResult.solidificationTimeMin.toFixed(2)} min</strong></span>
                </>
              )}
              {activeTab === 'metal-forming' && (
                <>
                  <span>Force: <strong className="text-amber-400">{formResult.deformationForceKN.toFixed(1)} kN</strong></span>
                  <span>Reduction: <strong className="text-cyan-400">{formResult.reductionRatioPercent.toFixed(1)}%</strong></span>
                </>
              )}
            </div>
          </div>

          {/* 3D WebGL Canvas or 2D Schematic Fallback */}
          <div className="flex-1 w-full h-full relative">
            {use3D ? (
              <div ref={canvasContainerRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900/50">
                <Box className="w-16 h-16 text-cyan-400 mb-3 opacity-80" />
                <h3 className="text-base font-bold text-white mb-1">2D Schematic Manufacturing Mode</h3>
                <p className="text-xs text-slate-400 max-w-md mb-4">
                  Full mathematical equations, parameter matrices, and defect diagnostic models remain 100% active.
                </p>
                <button
                  onClick={() => setUse3D(true)}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                >
                  Switch Back to 3D Viewport
                </button>
              </div>
            )}
          </div>

          {/* Bottom Diagnostics / G-Code Terminal Bar */}
          {activeTab === 'cnc-machining' && (
            <div className="h-32 border-t border-slate-800 bg-slate-900/90 p-3 overflow-y-auto font-mono text-[11px]">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
                <span>CNC G-Code Program Buffer (ISO / Fanuc 0i Compatible)</span>
                <span className="text-amber-400">{cncResult.gCodeListing.length} Lines Generated</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                {cncResult.gCodeListing.slice(0, 16).map((cmd) => (
                  <div key={cmd.line} className={`px-2 py-0.5 rounded ${cmd.isCutting ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/50' : 'bg-slate-800 text-slate-400'}`}>
                    N{cmd.line} {cmd.code}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Parameter & Theory Control Sidebar */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 border-slate-800 bg-slate-900/95 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>Process Parameters &amp; Theory</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Anna Univ R2025</span>
          </div>

          <div className="p-4 space-y-5 flex-1 text-xs">
            {/* ─── TAB 1: CNC Parameters ─── */}
            {activeTab === 'cnc-machining' && (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Machining Operation</label>
                  <select
                    value={cncParams.operation}
                    onChange={(e) => setCncParams({ ...cncParams, operation: e.target.value as CNCOperation })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="contouring">Perimeter Contouring (G01)</option>
                    <option value="facing">Face Milling (Zig-Zag)</option>
                    <option value="pocketing">Rectangular Spiral Pocket</option>
                    <option value="drilling">4-Hole Bolt Pattern (G81)</option>
                    <option value="linear-milling">Linear Slot Pass</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Spindle Speed (N)</span>
                    <span className="font-mono text-amber-400">{cncParams.spindleSpeedRPM} RPM</span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="4500"
                    step="100"
                    value={cncParams.spindleSpeedRPM}
                    onChange={(e) => setCncParams({ ...cncParams, spindleSpeedRPM: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Feed Rate (F)</span>
                    <span className="font-mono text-cyan-400">{cncParams.feedRateMMPM} mm/min</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1200"
                    step="50"
                    value={cncParams.feedRateMMPM}
                    onChange={(e) => setCncParams({ ...cncParams, feedRateMMPM: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Depth of Cut (d)</span>
                    <span className="font-mono text-emerald-400">{cncParams.depthOfCutMM.toFixed(1)} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.5"
                    value={cncParams.depthOfCutMM}
                    onChange={(e) => setCncParams({ ...cncParams, depthOfCutMM: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Computed Machining Metrics</div>
                  <div className="flex justify-between">
                    <span>Cutting Speed (V):</span>
                    <span className="text-white font-bold">{cncResult.cuttingSpeedMPM.toFixed(1)} m/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cycle Time:</span>
                    <span className="text-white font-bold">{cncResult.estimatedCycleTimeSec.toFixed(1)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Motor Power (P):</span>
                    <span className="text-white font-bold">{cncResult.powerRequiredKW.toFixed(2)} kW</span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 2: Non-Traditional ─── */}
            {activeTab === 'non-traditional' && (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Unconventional Process</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'edm', label: 'EDM (Spark)' },
                      { id: 'ecm', label: 'ECM (Faraday)' },
                      { id: 'laser', label: 'Laser Beam' },
                      { id: 'waterjet', label: 'Abrasive Jet' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setNtProcess(p.id as NonTraditionalProcess)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                          ntProcess === p.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {ntProcess === 'edm' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Discharge Current (I)</span>
                        <span className="font-mono text-amber-400">{edmParams.dischargeCurrentA} A</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="40"
                        value={edmParams.dischargeCurrentA}
                        onChange={(e) => setEdmParams({ ...edmParams, dischargeCurrentA: Number(e.target.value) })}
                        className="w-full accent-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Electrode Material</label>
                      <select
                        value={edmParams.electrodeMaterial}
                        onChange={(e) => setEdmParams({ ...edmParams, electrodeMaterial: e.target.value as any })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      >
                        <option value="copper">Electrolytic Copper (OFHC)</option>
                        <option value="graphite">Isostatic Fine Graphite</option>
                        <option value="copper-tungsten">Copper-Tungsten (Elkonite)</option>
                      </select>
                    </div>
                  </div>
                )}

                {ntProcess === 'ecm' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Current Density (J)</span>
                        <span className="font-mono text-cyan-400">{ecmParams.currentDensityACm2} A/cm²</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        step="10"
                        value={ecmParams.currentDensityACm2}
                        onChange={(e) => setEcmParams({ ...ecmParams, currentDensityACm2: Number(e.target.value) })}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1.5 text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Process Performance</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MRR:</span>
                    <span className="text-white font-bold">{ntResult.materialRemovalRateMM3Min.toFixed(1)} mm³/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surface Finish (Ra):</span>
                    <span className="text-cyan-300 font-bold">{ntResult.surfaceRoughnessRaMicron.toFixed(2)} μm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Heat-Affected Zone:</span>
                    <span className={ntResult.heatAffectedZoneMM === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {ntResult.heatAffectedZoneMM === 0 ? '0.0 mm (Cold Process)' : `${ntResult.heatAffectedZoneMM.toFixed(2)} mm`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 3: Welding ─── */}
            {activeTab === 'welding-processes' && (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Welding Joint Type</label>
                  <select
                    value={weldParams.jointType}
                    onChange={(e) => setWeldParams({ ...weldParams, jointType: e.target.value as WeldJointType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="butt">Square / Single-V Butt Joint</option>
                    <option value="lap">Fillet Lap Joint</option>
                    <option value="tee">Fillet T-Joint</option>
                    <option value="corner">Open Corner Joint</option>
                    <option value="edge">Edge Joint</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Welding Current (I)</span>
                    <span className="font-mono text-amber-400">{weldParams.currentA} A</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="300"
                    step="10"
                    value={weldParams.currentA}
                    onChange={(e) => setWeldParams({ ...weldParams, currentA: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Travel Speed (v)</span>
                    <span className="font-mono text-cyan-400">{weldParams.travelSpeedMMS} mm/s</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    value={weldParams.travelSpeedMMS}
                    onChange={(e) => setWeldParams({ ...weldParams, travelSpeedMMS: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1.5 text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Weld Diagnostics &amp; HAZ</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Heat Input (H):</span>
                    <span className="text-white font-bold">{weldResult.heatInputKJMM.toFixed(2)} kJ/mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Penetration:</span>
                    <span className="text-white font-bold">{weldResult.penetrationDepthMM.toFixed(1)} mm</span>
                  </div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold mt-2">Defect Analysis:</div>
                  <div className="text-slate-300 text-[11px] bg-slate-900/60 p-2 rounded border border-slate-700/50">
                    <strong className="text-amber-400">{weldResult.potentialDefects[0]?.defect}</strong>: {weldResult.potentialDefects[0]?.cause}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 4: Casting ─── */}
            {activeTab === 'casting-processes' && (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Casting Process</label>
                  <select
                    value={mouldParams.process}
                    onChange={(e) => setMouldParams({ ...mouldParams, process: e.target.value as CastingProcess })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="sand-casting">Green Sand Mould Casting</option>
                    <option value="die-casting">High Pressure Die Casting</option>
                    <option value="investment-casting">Investment (Lost-Wax) Casting</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Casting Volume (V)</span>
                    <span className="font-mono text-amber-400">{mouldParams.castingVolumeCM3} cm³</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="2500"
                    step="50"
                    value={mouldParams.castingVolumeCM3}
                    onChange={(e) => setMouldParams({ ...mouldParams, castingVolumeCM3: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Surface Area (A)</span>
                    <span className="font-mono text-cyan-400">{mouldParams.castingSurfaceAreaCM2} cm²</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1000"
                    step="25"
                    value={mouldParams.castingSurfaceAreaCM2}
                    onChange={(e) => setMouldParams({ ...mouldParams, castingSurfaceAreaCM2: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1.5 text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Chvorinov's Rule &amp; Riser Design</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Casting Modulus (M_c):</span>
                    <span className="text-white font-bold">{castResult.modulusCM.toFixed(3)} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Solidification Time:</span>
                    <span className="text-white font-bold">{castResult.solidificationTimeMin.toFixed(2)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Riser Diameter (D_r):</span>
                    <span className="text-amber-300 font-bold">{castResult.riserDiameterMM.toFixed(1)} mm</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-700">
                    <span className="text-slate-400">Riser Adequacy:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      ADEQUATE (Freezes Last)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 5: Forming ─── */}
            {activeTab === 'metal-forming' && (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Forming Process</label>
                  <select
                    value={formingParams.process}
                    onChange={(e) => setFormingParams({ ...formingParams, process: e.target.value as FormingProcess })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="forging">Upset Open-Die Forging</option>
                    <option value="extrusion">Direct Forward Extrusion</option>
                    <option value="rolling">Flat Strip Rolling (2-High Mill)</option>
                    <option value="drawing">Wire / Rod Drawing</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Initial Dimension (h0 / D0)</span>
                    <span className="font-mono text-amber-400">{formingParams.initialDimensionMM} mm</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    value={formingParams.initialDimensionMM}
                    onChange={(e) => setFormingParams({ ...formingParams, initialDimensionMM: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Final Dimension (hf / Df)</span>
                    <span className="font-mono text-cyan-400">{formingParams.finalDimensionMM} mm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max={formingParams.initialDimensionMM - 5}
                    value={formingParams.finalDimensionMM}
                    onChange={(e) => setFormingParams({ ...formingParams, finalDimensionMM: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1.5 text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Plastic Deformation Metrics</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Engineering Reduction:</span>
                    <span className="text-white font-bold">{formResult.reductionRatioPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deformation Force:</span>
                    <span className="text-amber-400 font-bold">{formResult.deformationForceKN.toFixed(1)} kN</span>
                  </div>
                  <div className="text-slate-300 text-[10px] pt-1 border-t border-slate-700">
                    {formResult.notes[0]}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 6: Calculations ─── */}
            {activeTab === 'manufacturing-calculations' && (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Machining Mode</label>
                  <select
                    value={calcInput.operation}
                    onChange={(e) => setCalcInput({ ...calcInput, operation: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="turning">Straight Turning (Cylindrical)</option>
                    <option value="milling">Face Milling (Multi-tooth)</option>
                    <option value="drilling">Twist Drilling</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Diameter (D, mm)</label>
                    <input
                      type="number"
                      value={calcInput.workpieceDiameterMM}
                      onChange={(e) => setCalcInput({ ...calcInput, workpieceDiameterMM: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Spindle (N, RPM)</label>
                    <input
                      type="number"
                      value={calcInput.spindleSpeedRPM}
                      onChange={(e) => setCalcInput({ ...calcInput, spindleSpeedRPM: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-2 font-mono text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Standard Formula Derivations</div>
                  <div>
                    <span className="text-slate-400">V = (π·D·N) / 1000 = </span>
                    <strong className="text-amber-400">{calcResult.cuttingSpeedCalculatedMPM.toFixed(1)} m/min</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">T_m = L / (f·N) = </span>
                    <strong className="text-cyan-400">{calcResult.machiningTimeMin.toFixed(2)} min</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">MRR = 1000·V·f·d = </span>
                    <strong className="text-emerald-400">{calcResult.materialRemovalRateCM3Min.toFixed(2)} cm³/min</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Taylor Tool Life T = (C/V)^(1/n) = </span>
                    <strong className="text-purple-400">{calcResult.toolLifeMin.toFixed(1)} min</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 7: Process Selection ─── */}
            {activeTab === 'process-selection' && (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1">Batch Production Quantity</label>
                  <select
                    value={criteria.batchQuantity}
                    onChange={(e) => setCriteria({ ...criteria, batchQuantity: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="prototype-1-10">Prototype / Tooling (1 – 10 pcs)</option>
                    <option value="small-10-100">Small Batch (10 – 100 pcs)</option>
                    <option value="medium-100-5000">Medium Batch (100 – 5,000 pcs)</option>
                    <option value="mass-5000-plus">Mass Production (&gt;5,000 pcs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Required Tolerance Grade (ISO IT)</label>
                  <select
                    value={criteria.toleranceGradeIT}
                    onChange={(e) => setCriteria({ ...criteria, toleranceGradeIT: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="6">IT6 (Precision Ground / Lapped)</option>
                    <option value="7">IT7 (CNC Precision Machined)</option>
                    <option value="9">IT9 (Die Cast / Cold Extruded)</option>
                    <option value="12">IT12 (Investment / Hot Forged)</option>
                    <option value="14">IT14 (Sand Cast / Rough)</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-2 text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Top Recommended Processes</div>
                  {selectResult.rankedCandidates.slice(0, 3).map((c) => (
                    <div key={c.processName} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <div>
                        <strong className="text-white text-xs">{c.recommendationRank}. {c.processName}</strong>
                        <div className="text-[10px] text-slate-400">Tol: {c.typicalToleranceMM} | Ra: {c.achievableRaMicron}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        {c.suitabilityScore}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 8: Workshop ─── */}
            {activeTab === 'virtual-workshop' && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Manufacturing Tech II Workshop Station</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    This integrated shop floor bay simulates workpiece handling, process inspection,
                    and metrological evaluation for advanced manufacturing techniques.
                  </p>
                  <div className="pt-2 border-t border-slate-700 flex justify-between text-[11px]">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-white font-medium">Mechanical Engineering</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Curriculum:</span>
                    <span className="text-white font-medium">U25ME401 (Semester IV)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recorded Trials Summary */}
          {trials.length > 0 && (
            <div className="p-3 border-t border-slate-800 bg-slate-950/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Recorded Trials ({trials.length})
                </span>
                <button
                  onClick={handleExportCSV}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px]">
                {trials.slice(0, 3).map((t) => (
                  <div key={t.trialId} className="flex justify-between text-slate-400 bg-slate-900 px-2 py-1 rounded">
                    <span>{t.trialId}: {t.processName}</span>
                    <span className="text-slate-500">{t.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Conceptual Quiz Modal ─── */}
      {quizOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  U25ME401 Evaluation
                </span>
                <h3 className="text-base font-bold text-white">Manufacturing Technology – II Conceptual Quiz</h3>
              </div>
              <button
                onClick={() => setQuizOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                  <div className="font-semibold text-slate-200">
                    {idx + 1}. {q.question}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition text-[11px] ${
                          userAnswers[q.id] === oIdx
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-q-${q.id}`}
                          checked={userAnswers[q.id] === oIdx}
                          onChange={() => handleAnswerSelect(q.id, oIdx)}
                          className="mt-0.5 accent-amber-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  {quizScore !== null && (
                    <div className="mt-2 text-[10px] p-2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      <strong>Correct Answer:</strong> {q.options[q.correctAnswer]}
                      <div className="text-slate-400 mt-1">{q.explanation}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900">
              {quizScore !== null ? (
                <div className="text-xs font-bold text-emerald-400">
                  Score: {quizScore} / {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                </div>
              ) : (
                <div className="text-[11px] text-slate-400">Select answers for all 5 questions.</div>
              )}
              <button
                onClick={handleQuizSubmit}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                Submit Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
