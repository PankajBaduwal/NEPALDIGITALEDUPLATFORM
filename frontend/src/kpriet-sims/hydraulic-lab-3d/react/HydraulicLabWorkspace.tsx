import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  BookOpen,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  Sliders,
  ChevronRight,
  Info,
  CheckCircle2,
  Table,
  Camera,
  Maximize2,
  Award,
  TrendingUp,
} from 'lucide-react';
import type {
  HydraulicSimId,
  IHydrostaticInputs,
  IBernoulliInputs,
  IPipeFrictionInputs,
  IOpenChannelInputs,
  IDischargeStructureInputs,
  IObservationRecord,
  IQuizQuestion,
} from '../core/types';
import { HydraulicCalculator } from '../core/HydraulicCalculator';
import type { IApparatusComponent } from '../core/BaseHydraulicSimulation';
import { HydrostaticScene } from '../simulations/01-hydrostatic/HydrostaticScene';
import { BernoulliVenturiScene } from '../simulations/02-bernoulli/BernoulliVenturiScene';
import { PipeFrictionScene } from '../simulations/03-pipe-friction/PipeFrictionScene';
import { OpenChannelScene } from '../simulations/04-open-channel/OpenChannelScene';
import { DischargeStructuresScene } from '../simulations/05-discharge/DischargeStructuresScene';

interface HydraulicLabWorkspaceProps {
  simulationId: string;
  onBack?: () => void;
}

export const HydraulicLabWorkspace: React.FC<HydraulicLabWorkspaceProps> = ({
  simulationId,
  onBack,
}) => {
  // Normalize initial active simulation ID
  const initialSimId: HydraulicSimId = useMemo(() => {
    const s = simulationId.toLowerCase();
    if (s.includes('hydrostatic') || s.includes('pressure')) return '01-hydrostatic';
    if (s.includes('bernoulli') || s.includes('venturi')) return '02-bernoulli-venturi';
    if (s.includes('friction') || s.includes('pipe') || s.includes('loss')) return '03-pipe-friction';
    if (s.includes('channel') || s.includes('flume') || s.includes('jump')) return '04-open-channel';
    if (s.includes('discharge') || s.includes('notch') || s.includes('orifice')) return '05-discharge-structures';
    return '02-bernoulli-venturi';
  }, [simulationId]);

  const [activeSimId, setActiveSimId] = useState<HydraulicSimId>(initialSimId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneInstanceRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState<'controls' | 'analysis' | 'procedure' | 'observations' | 'quiz'>('controls');
  const [selectedComponent, setSelectedComponent] = useState<IApparatusComponent | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [observations, setObservations] = useState<IObservationRecord[]>([]);

  // ─── EXPERIMENT 1: HYDROSTATICS STATE ──────────────────────────────────────
  const [hydroInputs, setHydroInputs] = useState<IHydrostaticInputs>({
    fluidDensity: 1000,
    gravity: 9.81,
    waterDepth: 1.6,
    probeDepth: 1.0,
    plateAngleDeg: 90,
    plateWidth: 0.3,
    plateHeight: 0.4,
    hingeDepth: 0.5,
  });

  // ─── EXPERIMENT 2: BERNOULLI STATE ─────────────────────────────────────────
  const [bernoulliInputs, setBernoulliInputs] = useState<IBernoulliInputs>({
    flowRateLps: 2.5,
    inletDiameterMm: 50,
    throatDiameterMm: 25,
    outletDiameterMm: 50,
    inletElevationM: 0.5,
    throatElevationM: 0.5,
    dischargeCoefficientCd: 0.98,
    fluidDensity: 1000,
  });

  // ─── EXPERIMENT 3: PIPE FRICTION STATE ─────────────────────────────────────
  const [pipeInputs, setPipeInputs] = useState<IPipeFrictionInputs>({
    flowRateLps: 2.8,
    pipeDiameterMm: 25,
    pipeLengthM: 4.0,
    pipeMaterial: 'smooth_brass',
    waterTemperatureC: 20,
    minorLossFittings: {
      suddenContraction: true,
      suddenEnlargement: false,
      standard90Elbows: 2,
      gateValveTurnsOpen: 4,
    },
  });

  // ─── EXPERIMENT 4: OPEN CHANNEL STATE ──────────────────────────────────────
  const [channelInputs, setChannelInputs] = useState<IOpenChannelInputs>({
    dischargeM3s: 0.025,
    channelWidthM: 0.35,
    bedSlopePct: 0.5,
    manningsN: 0.010,
    sluiceGateOpeningM: 0.045,
  });

  // ─── EXPERIMENT 5: DISCHARGE STRUCTURES STATE ──────────────────────────────
  const [dischargeInputs, setDischargeInputs] = useState<IDischargeStructureInputs>({
    structureType: 'v_notch_90',
    headOverCrestOrificeM: 0.12,
    notchAngleDeg: 90,
    weirWidthM: 0.25,
    orificeDiameterMm: 20,
    empiricalCd: 0.60,
  });

  // ─── QUIZ DATA ─────────────────────────────────────────────────────────────
  const quizzes: Record<HydraulicSimId, IQuizQuestion[]> = {
    '01-hydrostatic': [
      {
        id: 'q1',
        question: 'Why does the Centre of Pressure (h*) always lie below the Centroid (h_bar) for a submerged vertical surface?',
        options: [
          'Because fluid density decreases with depth',
          'Because hydrostatic pressure increases linearly with depth, weighting the pressure prism toward the lower portion',
          'Because gravitational acceleration acts downward',
          'Due to the atmospheric pressure head',
        ],
        correctIndex: 1,
        explanation: 'Hydrostatic pressure is p = ρgh. Since depth increases, the lower half of any submerged plane experiences higher pressure intensity, shifting the centroid of the pressure prism below the geometric centroid by IG/(A·h_bar).',
      },
    ],
    '02-bernoulli-venturi': [
      {
        id: 'q2',
        question: 'What occurs to fluid pressure at the Venturi throat as the cross-sectional area contracts?',
        options: [
          'Pressure increases due to fluid compression',
          'Pressure remains identical while velocity drops',
          'Velocity increases by continuity (A1v1 = A2v2) and static pressure drops per Bernoulli energy conservation',
          'Frictional head loss cancels all pressure variations',
        ],
        correctIndex: 2,
        explanation: 'By the continuity equation, reducing area increases velocity (v2 > v1). By Bernoulli’s equation, the increase in kinetic energy v²/(2g) requires a corresponding drop in piezometric pressure head p/(ρg).',
      },
    ],
    '03-pipe-friction': [
      {
        id: 'q3',
        question: 'In fully laminar pipe flow (Re < 2000), how does the Darcy friction factor f depend on pipe roughness ε?',
        options: [
          'It is directly proportional to roughness ε/D',
          'It is completely independent of pipe roughness (f = 64/Re)',
          'It follows the Colebrook-White equation',
          'It varies as the square root of roughness',
        ],
        correctIndex: 1,
        explanation: 'In laminar flow, the viscous boundary sublayer completely covers the wall asperities. Fluid slides in concentric cylindrical streamlines governed solely by Poiseuille’s viscous shear law f = 64/Re.',
      },
    ],
    '04-open-channel': [
      {
        id: 'q4',
        question: 'What is the physical condition for a Hydraulic Jump to occur in an open channel?',
        options: [
          'Flow must be subcritical (Fr < 1) upstream',
          'Flow must transition from supercritical (Fr > 1) to subcritical (Fr < 1)',
          'Channel bed slope must be completely horizontal',
          'Discharge must be exactly equal to critical discharge',
        ],
        correctIndex: 1,
        explanation: 'A hydraulic jump is a standing shock wave dissipating excessive kinetic energy. It can only form when rapid supercritical flow (Fr1 > 1) abruptly decelerates to tranquil subcritical flow (Fr2 < 1), satisfying the momentum equation.',
      },
    ],
    '05-discharge-structures': [
      {
        id: 'q5',
        question: 'Why is a 90° V-Notch weir preferred over a rectangular weir for measuring small discharge rates?',
        options: [
          'Because the V-notch has a constant discharge coefficient for all heads',
          'Because at low discharge, the head H over the vertex remains relatively large and easy to read accurately with a hook gauge (Q ∝ H^(5/2))',
          'Because it eliminates end contractions',
          'Because it requires no downstream crest aeration',
        ],
        correctIndex: 1,
        explanation: 'In a triangular V-notch, the cross-sectional flow area contracts naturally as head drops. For small flows, H remains substantial (proportional to Q^(2/5)), preventing percentage measurement errors caused by surface tension clinging.',
      },
    ],
  };

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);

  // ─── INITIALIZE 3D SCENE ───────────────────────────────────────────────────
  useEffect(() => {
    if (!viewportRef.current) return;

    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.dispose();
      sceneInstanceRef.current = null;
    }

    const container = viewportRef.current;
    let scene: any = null;

    if (activeSimId === '01-hydrostatic') {
      scene = new HydrostaticScene(container, hydroInputs, setSelectedComponent);
    } else if (activeSimId === '02-bernoulli-venturi') {
      scene = new BernoulliVenturiScene(container, bernoulliInputs, setSelectedComponent);
    } else if (activeSimId === '03-pipe-friction') {
      scene = new PipeFrictionScene(container, pipeInputs, setSelectedComponent);
    } else if (activeSimId === '04-open-channel') {
      scene = new OpenChannelScene(container, channelInputs, setSelectedComponent);
    } else if (activeSimId === '05-discharge-structures') {
      scene = new DischargeStructuresScene(container, dischargeInputs, setSelectedComponent);
    }

    sceneInstanceRef.current = scene;

    return () => {
      if (sceneInstanceRef.current) {
        sceneInstanceRef.current.dispose();
        sceneInstanceRef.current = null;
      }
    };
  }, [activeSimId]);

  // Update active scene state when parameters change
  useEffect(() => {
    if (!sceneInstanceRef.current) return;
    if (activeSimId === '01-hydrostatic') {
      sceneInstanceRef.current.applyState(hydroInputs);
    } else if (activeSimId === '02-bernoulli-venturi') {
      sceneInstanceRef.current.applyState(bernoulliInputs);
    } else if (activeSimId === '03-pipe-friction') {
      sceneInstanceRef.current.applyState(pipeInputs);
    } else if (activeSimId === '04-open-channel') {
      sceneInstanceRef.current.applyState(channelInputs);
    } else if (activeSimId === '05-discharge-structures') {
      sceneInstanceRef.current.applyState(dischargeInputs);
    }
  }, [activeSimId, hydroInputs, bernoulliInputs, pipeInputs, channelInputs, dischargeInputs]);

  // Record a trial observation
  const handleRecordObservation = () => {
    const timestamp = new Date().toLocaleTimeString();
    const trialNumber = observations.length + 1;

    let params: Record<string, any> = {};
    let measurements: Record<string, any> = {};
    let calculated: Record<string, any> = {};

    if (activeSimId === '01-hydrostatic') {
      const out = HydraulicCalculator.calculateHydrostatics(hydroInputs);
      params = { 'Water Depth (m)': hydroInputs.waterDepth, 'Probe Depth (m)': hydroInputs.probeDepth, 'Angle (deg)': hydroInputs.plateAngleDeg };
      measurements = { 'Gauge Pressure (kPa)': (out.gaugePressureAtProbe / 1000).toFixed(2), 'Total Force (N)': out.totalResultantForce.toFixed(1) };
      calculated = { 'h_bar (m)': out.centroidDepthHBar.toFixed(3), 'h* (m)': out.centreOfPressureDepthHStar.toFixed(3), 'Moment (N·m)': out.overturningMoment.toFixed(1) };
    } else if (activeSimId === '02-bernoulli-venturi') {
      const out = HydraulicCalculator.calculateBernoulli(bernoulliInputs);
      params = { 'Flow Rate (L/s)': bernoulliInputs.flowRateLps, 'Throat Dia (mm)': bernoulliInputs.throatDiameterMm };
      measurements = { 'Diff Head (m)': out.differentialHeadM.toFixed(3), 'Inlet Vel (m/s)': out.inletVelocityMps.toFixed(2), 'Throat Vel (m/s)': out.throatVelocityMps.toFixed(2) };
      calculated = { 'Theoretical Q (L/s)': out.theoreticalDischargeLps.toFixed(2), 'Actual Q (L/s)': out.actualDischargeLps.toFixed(2), 'Cd': bernoulliInputs.dischargeCoefficientCd };
    } else if (activeSimId === '03-pipe-friction') {
      const out = HydraulicCalculator.calculatePipeLosses(pipeInputs);
      params = { 'Flow (L/s)': pipeInputs.flowRateLps, 'Material': pipeInputs.pipeMaterial, 'Diameter (mm)': pipeInputs.pipeDiameterMm };
      measurements = { 'Reynolds Re': Math.round(out.reynoldsNumber), 'Regime': out.flowRegime };
      calculated = { 'Darcy f': out.darcyFrictionFactor.toFixed(4), 'Major Loss hf (m)': out.majorFrictionHeadLossM.toFixed(3), 'Minor Loss hm (m)': out.minorLossHeadLossM.toFixed(3) };
    } else if (activeSimId === '04-open-channel') {
      const out = HydraulicCalculator.calculateOpenChannel(channelInputs);
      params = { 'Discharge (m³/s)': channelInputs.dischargeM3s, 'Gate Open (m)': channelInputs.sluiceGateOpeningM, 'Slope (%)': channelInputs.bedSlopePct };
      measurements = { 'Supercrit y1 (m)': out.initialDepthY1M.toFixed(3), 'Froude Fr1': out.initialFroudeNumberFr1.toFixed(2) };
      calculated = { 'Subcrit y2 (m)': out.conjugateDepthY2M.toFixed(3), 'Jump H (m)': out.jumpHeightM.toFixed(3), 'Energy Loss (m)': out.energyDissipatedM.toFixed(3) };
    } else if (activeSimId === '05-discharge-structures') {
      const out = HydraulicCalculator.calculateDischargeStructure(dischargeInputs);
      params = { 'Structure': dischargeInputs.structureType, 'Head H (m)': dischargeInputs.headOverCrestOrificeM };
      measurements = { 'Theoretical Q (L/s)': out.theoreticalDischargeLps.toFixed(2), 'Actual Q (L/s)': out.actualDischargeLps.toFixed(2) };
      calculated = { 'Cd': out.coeffDischargeCd, 'Jet Vel (m/s)': out.jetVelocityMps.toFixed(2) };
    }

    setObservations((prev) => [
      ...prev,
      {
        trialNumber,
        timestamp,
        simId: activeSimId,
        parameters: params,
        measurements,
        calculatedValues: calculated,
      },
    ]);
  };

  const handleResetCamera = () => {
    if (sceneInstanceRef.current && sceneInstanceRef.current.resetCamera) {
      sceneInstanceRef.current.resetCamera();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* ─── TOP HEADER BAR ─── */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-semibold text-slate-100 text-sm tracking-wide">
                Virtual Hydraulic Laboratory (3D)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-950 text-sky-400 border border-sky-800">
                U25CE401 / U25CE406
              </span>
            </div>
            <p className="text-xs text-slate-400">Civil Engineering • Semester IV</p>
          </div>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 space-x-1">
          <button
            onClick={() => setActiveSimId('01-hydrostatic')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeSimId === '01-hydrostatic'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            1. Hydrostatics & COP
          </button>
          <button
            onClick={() => setActiveSimId('02-bernoulli-venturi')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeSimId === '02-bernoulli-venturi'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            2. Bernoulli & Venturi
          </button>
          <button
            onClick={() => setActiveSimId('03-pipe-friction')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeSimId === '03-pipe-friction'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            3. Pipe Friction & Losses
          </button>
          <button
            onClick={() => setActiveSimId('04-open-channel')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeSimId === '04-open-channel'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            4. Open Channel & Jump
          </button>
          <button
            onClick={() => setActiveSimId('05-discharge-structures')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeSimId === '05-discharge-structures'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            5. Orifice & V-Notch
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRecordObservation}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium shadow transition-colors"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Record Trial ({observations.length})</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded text-xs font-medium shadow transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lab Report</span>
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* ─── MAIN WORKSPACE (VIEWPORT & SIDEBAR) ─── */}
      <div className="flex flex-1 min-h-0 relative">
        {/* 3D WebGL Viewport */}
        <div className="flex-1 h-full relative bg-slate-950 overflow-hidden">
          <div ref={viewportRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating Viewport Overlay Tools */}
          <div className="absolute top-3 left-3 flex items-center space-x-2 z-10">
            <button
              onClick={handleResetCamera}
              className="p-1.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 shadow backdrop-blur transition-all"
              title="Reset Camera View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700 text-xs text-slate-300 shadow backdrop-blur flex items-center space-x-1.5">
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span>Orbit Controls: Left-Click Rotate | Right-Click Pan | Scroll Zoom</span>
            </div>
          </div>

          {/* Component Inspection Drawer (when apparatus item is clicked) */}
          {selectedComponent && (
            <div className="absolute bottom-4 left-4 max-w-sm p-4 rounded-xl bg-slate-900/90 border border-sky-500/40 text-slate-200 shadow-xl backdrop-blur-md z-10 transition-all animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  <h4 className="font-semibold text-xs text-sky-300">{selectedComponent.name}</h4>
                </div>
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                {selectedComponent.description}
              </p>
              {selectedComponent.specifications && (
                <div className="text-[11px] font-mono text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-800 mb-1">
                  {selectedComponent.specifications}
                </div>
              )}
              {selectedComponent.formula && (
                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-900/50">
                  {selectedComponent.formula}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar Control & Telemetry Panel */}
        <aside className="w-96 h-full flex flex-col bg-slate-900 border-l border-slate-800 shrink-0 z-20 overflow-hidden">
          {/* Sub-tab navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/50 p-1">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded transition-colors ${
                activeTab === 'controls' ? 'bg-slate-800 text-sky-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Controls
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded transition-colors ${
                activeTab === 'analysis' ? 'bg-slate-800 text-sky-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('procedure')}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded transition-colors ${
                activeTab === 'procedure' ? 'bg-slate-800 text-sky-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Procedure
            </button>
            <button
              onClick={() => setActiveTab('observations')}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded transition-colors ${
                activeTab === 'observations' ? 'bg-slate-800 text-sky-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Data ({observations.length})
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded transition-colors ${
                activeTab === 'quiz' ? 'bg-slate-800 text-sky-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quiz
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'controls' && (
              <>
                {/* ─── MODULE 1 CONTROLS ─── */}
                {activeSimId === '01-hydrostatic' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <h3 className="text-xs font-semibold text-sky-400 mb-3 flex items-center space-x-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Fluid Statics Parameters</span>
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Water Depth (m):</span>
                            <span className="font-mono text-slate-200">{hydroInputs.waterDepth.toFixed(2)} m</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.05"
                            value={hydroInputs.waterDepth}
                            onChange={(e) =>
                              setHydroInputs((prev) => ({
                                ...prev,
                                waterDepth: parseFloat(e.target.value),
                                probeDepth: Math.min(prev.probeDepth, parseFloat(e.target.value)),
                              }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Sensor Probe Depth (m):</span>
                            <span className="font-mono text-slate-200">{hydroInputs.probeDepth.toFixed(2)} m</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max={hydroInputs.waterDepth}
                            step="0.05"
                            value={hydroInputs.probeDepth}
                            onChange={(e) =>
                              setHydroInputs((prev) => ({ ...prev, probeDepth: parseFloat(e.target.value) }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Submerged Plate Angle:</span>
                            <span className="font-mono text-slate-200">{hydroInputs.plateAngleDeg}° ({hydroInputs.plateAngleDeg === 90 ? 'Vertical' : 'Inclined'})</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="90"
                            step="5"
                            value={hydroInputs.plateAngleDeg}
                            onChange={(e) =>
                              setHydroInputs((prev) => ({ ...prev, plateAngleDeg: parseInt(e.target.value) }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Output */}
                    {(() => {
                      const out = HydraulicCalculator.calculateHydrostatics(hydroInputs);
                      return (
                        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="text-xs font-semibold text-emerald-400 mb-2">Live Hydraulic Telemetry</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Gauge Pressure</span>
                              <span className="text-sm font-bold font-mono text-sky-400">
                                {(out.gaugePressureAtProbe / 1000).toFixed(2)} kPa
                              </span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Resultant Force (F)</span>
                              <span className="text-sm font-bold font-mono text-emerald-400">
                                {out.totalResultantForce.toFixed(1)} N
                              </span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Centroid Depth (h_bar)</span>
                              <span className="text-sm font-bold font-mono text-cyan-400">
                                {out.centroidDepthHBar.toFixed(3)} m
                              </span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Centre of Pressure (h*)</span>
                              <span className="text-sm font-bold font-mono text-fuchsia-400">
                                {out.centreOfPressureDepthHStar.toFixed(3)} m
                              </span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                            Note: h* &gt; h_bar confirms that the resultant force acts below the centroid due to the trapezoidal pressure prism.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ─── MODULE 2 CONTROLS ─── */}
                {activeSimId === '02-bernoulli-venturi' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <h3 className="text-xs font-semibold text-sky-400 mb-3 flex items-center space-x-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Venturimeter Flow Controls</span>
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Discharge Flow Rate (L/s):</span>
                            <span className="font-mono text-slate-200">{bernoulliInputs.flowRateLps.toFixed(2)} L/s</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="6.0"
                            step="0.1"
                            value={bernoulliInputs.flowRateLps}
                            onChange={(e) =>
                              setBernoulliInputs((prev) => ({ ...prev, flowRateLps: parseFloat(e.target.value) }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Throat Diameter (d₂):</span>
                            <span className="font-mono text-slate-200">{bernoulliInputs.throatDiameterMm} mm</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="35"
                            step="1"
                            value={bernoulliInputs.throatDiameterMm}
                            onChange={(e) =>
                              setBernoulliInputs((prev) => ({
                                ...prev,
                                throatDiameterMm: parseInt(e.target.value),
                              }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Discharge Coefficient (Cd):</span>
                            <span className="font-mono text-slate-200">{bernoulliInputs.dischargeCoefficientCd.toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min="0.92"
                            max="0.99"
                            step="0.01"
                            value={bernoulliInputs.dischargeCoefficientCd}
                            onChange={(e) =>
                              setBernoulliInputs((prev) => ({
                                ...prev,
                                dischargeCoefficientCd: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Output */}
                    {(() => {
                      const out = HydraulicCalculator.calculateBernoulli(bernoulliInputs);
                      return (
                        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="text-xs font-semibold text-emerald-400 mb-2">Bernoulli Theorem Verification</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Inlet Velocity (v₁)</span>
                              <span className="text-sm font-bold font-mono text-sky-400">{out.inletVelocityMps.toFixed(2)} m/s</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Throat Velocity (v₂)</span>
                              <span className="text-sm font-bold font-mono text-amber-400">{out.throatVelocityMps.toFixed(2)} m/s</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Differential Head (h)</span>
                              <span className="text-sm font-bold font-mono text-cyan-400">{out.differentialHeadM.toFixed(3)} m</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Actual Q_act</span>
                              <span className="text-sm font-bold font-mono text-emerald-400">{out.actualDischargeLps.toFixed(2)} L/s</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ─── MODULE 3 CONTROLS ─── */}
                {activeSimId === '03-pipe-friction' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <h3 className="text-xs font-semibold text-sky-400 mb-3 flex items-center space-x-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Pipe Friction & Darcy Parameters</span>
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Flow Rate (L/s):</span>
                            <span className="font-mono text-slate-200">{pipeInputs.flowRateLps.toFixed(2)} L/s</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="6.0"
                            step="0.1"
                            value={pipeInputs.flowRateLps}
                            onChange={(e) =>
                              setPipeInputs((prev) => ({ ...prev, flowRateLps: parseFloat(e.target.value) }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Pipe Material:</span>
                          </div>
                          <select
                            value={pipeInputs.pipeMaterial}
                            onChange={(e) =>
                              setPipeInputs((prev) => ({ ...prev, pipeMaterial: e.target.value as any }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                          >
                            <option value="smooth_brass">Smooth Drawn Brass (ε = 0.0015 mm)</option>
                            <option value="pvc">Commercial PVC (ε = 0.0020 mm)</option>
                            <option value="commercial_steel">Commercial Steel (ε = 0.0450 mm)</option>
                            <option value="cast_iron">Rough Cast Iron (ε = 0.2600 mm)</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Gate Valve Opening:</span>
                            <span className="font-mono text-slate-200">{pipeInputs.minorLossFittings.gateValveTurnsOpen} / 4 turns</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="4"
                            step="1"
                            value={pipeInputs.minorLossFittings.gateValveTurnsOpen}
                            onChange={(e) =>
                              setPipeInputs((prev) => ({
                                ...prev,
                                minorLossFittings: { ...prev.minorLossFittings, gateValveTurnsOpen: parseInt(e.target.value) },
                              }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Output */}
                    {(() => {
                      const out = HydraulicCalculator.calculatePipeLosses(pipeInputs);
                      return (
                        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="text-xs font-semibold text-emerald-400 mb-2">Darcy-Weisbach Energy Analysis</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Reynolds Number</span>
                              <span className="text-sm font-bold font-mono text-sky-400">{Math.round(out.reynoldsNumber)}</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Flow Regime</span>
                              <span className={`text-xs font-bold uppercase ${
                                out.flowRegime === 'laminar' ? 'text-emerald-400' : out.flowRegime === 'transitional' ? 'text-amber-400' : 'text-fuchsia-400'
                              }`}>
                                {out.flowRegime}
                              </span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Darcy Friction (f)</span>
                              <span className="text-sm font-bold font-mono text-cyan-400">{out.darcyFrictionFactor.toFixed(4)}</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Major Friction Loss (h_f)</span>
                              <span className="text-sm font-bold font-mono text-amber-400">{out.majorFrictionHeadLossM.toFixed(3)} m</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ─── MODULE 4 CONTROLS ─── */}
                {activeSimId === '04-open-channel' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <h3 className="text-xs font-semibold text-sky-400 mb-3 flex items-center space-x-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Flume & Sluice Gate Controls</span>
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Inlet Discharge (m³/s):</span>
                            <span className="font-mono text-slate-200">{channelInputs.dischargeM3s.toFixed(3)} m³/s</span>
                          </div>
                          <input
                            type="range"
                            min="0.005"
                            max="0.060"
                            step="0.005"
                            value={channelInputs.dischargeM3s}
                            onChange={(e) =>
                              setChannelInputs((prev) => ({ ...prev, dischargeM3s: parseFloat(e.target.value) }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Sluice Gate Opening (m):</span>
                            <span className="font-mono text-slate-200">{(channelInputs.sluiceGateOpeningM * 1000).toFixed(0)} mm</span>
                          </div>
                          <input
                            type="range"
                            min="0.02"
                            max="0.10"
                            step="0.005"
                            value={channelInputs.sluiceGateOpeningM}
                            onChange={(e) =>
                              setChannelInputs((prev) => ({ ...prev, sluiceGateOpeningM: parseFloat(e.target.value) }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Channel Bed Slope (%):</span>
                            <span className="font-mono text-slate-200">{channelInputs.bedSlopePct.toFixed(2)} %</span>
                          </div>
                          <input
                            type="range"
                            min="0.05"
                            max="2.0"
                            step="0.05"
                            value={channelInputs.bedSlopePct}
                            onChange={(e) =>
                              setChannelInputs((prev) => ({ ...prev, bedSlopePct: parseFloat(e.target.value) }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Output */}
                    {(() => {
                      const out = HydraulicCalculator.calculateOpenChannel(channelInputs);
                      return (
                        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="text-xs font-semibold text-emerald-400 mb-2">Hydraulic Jump Telemetry</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Initial Froude (Fr₁)</span>
                              <span className="text-sm font-bold font-mono text-amber-400">{out.initialFroudeNumberFr1.toFixed(2)}</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Critical Depth (y_c)</span>
                              <span className="text-sm font-bold font-mono text-sky-400">{out.criticalDepthM.toFixed(3)} m</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Conjugate Depth (y₂)</span>
                              <span className="text-sm font-bold font-mono text-emerald-400">{out.conjugateDepthY2M.toFixed(3)} m</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Energy Dissipation (ΔE)</span>
                              <span className="text-sm font-bold font-mono text-fuchsia-400">{out.energyDissipatedM.toFixed(3)} m</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ─── MODULE 5 CONTROLS ─── */}
                {activeSimId === '05-discharge-structures' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <h3 className="text-xs font-semibold text-sky-400 mb-3 flex items-center space-x-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Discharge Apparatus Controls</span>
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Device Type:</span>
                          </div>
                          <select
                            value={dischargeInputs.structureType}
                            onChange={(e) =>
                              setDischargeInputs((prev) => ({
                                ...prev,
                                structureType: e.target.value as any,
                              }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                          >
                            <option value="v_notch_90">90° Triangular V-Notch (Thomson Weir)</option>
                            <option value="rectangular_notch">Rectangular Suppressed Weir (Francis)</option>
                            <option value="circular_orifice">Circular Sharp-Edged Orifice (20 mm)</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Head over Crest/Orifice (m):</span>
                            <span className="font-mono text-slate-200">{(dischargeInputs.headOverCrestOrificeM * 1000).toFixed(0)} mm</span>
                          </div>
                          <input
                            type="range"
                            min="0.04"
                            max="0.25"
                            step="0.01"
                            value={dischargeInputs.headOverCrestOrificeM}
                            onChange={(e) =>
                              setDischargeInputs((prev) => ({
                                ...prev,
                                headOverCrestOrificeM: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full accent-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Output */}
                    {(() => {
                      const out = HydraulicCalculator.calculateDischargeStructure(dischargeInputs);
                      return (
                        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="text-xs font-semibold text-emerald-400 mb-2">Discharge Calibration Results</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Theoretical Q</span>
                              <span className="text-sm font-bold font-mono text-sky-400">{out.theoreticalDischargeLps.toFixed(2)} L/s</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Actual Q_act</span>
                              <span className="text-sm font-bold font-mono text-emerald-400">{out.actualDischargeLps.toFixed(2)} L/s</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Discharge Coeff (Cd)</span>
                              <span className="text-sm font-bold font-mono text-cyan-400">{out.coeffDischargeCd.toFixed(2)}</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded">
                              <span className="text-[11px] text-slate-400 block">Jet / Crest Velocity</span>
                              <span className="text-sm font-bold font-mono text-amber-400">{out.jetVelocityMps.toFixed(2)} m/s</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {/* ─── ANALYSIS & CHARTS TAB ─── */}
            {activeTab === 'analysis' && (
              <div className="space-y-4">
                {activeSimId === '01-hydrostatic' && (() => {
                  const out = HydraulicCalculator.calculateHydrostatics(hydroInputs);
                  const pMaxKPa = (hydroInputs.fluidDensity * hydroInputs.gravity * hydroInputs.waterDepth) / 1000;
                  const pProbeKPa = out.gaugePressureAtProbe / 1000;
                  const probeX = 30 + (pProbeKPa / (pMaxKPa || 1)) * 180;
                  const probeY = 20 + (hydroInputs.probeDepth / (hydroInputs.waterDepth || 1)) * 100;
                  return (
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                        <h4 className="text-xs font-semibold text-sky-400 mb-2 flex items-center space-x-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Hydrostatic Pressure vs. Depth Graph</span>
                        </h4>
                        <svg viewBox="0 0 240 140" className="w-full bg-slate-900 rounded border border-slate-800 text-[9px] text-slate-400">
                          <line x1="30" y1="20" x2="220" y2="20" stroke="#334155" strokeDasharray="2,2" />
                          <line x1="30" y1="70" x2="220" y2="70" stroke="#334155" strokeDasharray="2,2" />
                          <line x1="30" y1="120" x2="220" y2="120" stroke="#334155" strokeDasharray="2,2" />
                          <line x1="30" y1="20" x2="30" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
                          <line x1="30" y1="20" x2="220" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
                          <line x1="30" y1="20" x2="210" y2="120" stroke="#38bdf8" strokeWidth="2" />
                          <polygon points="30,20 210,120 30,120" fill="rgba(56,189,248,0.15)" />
                          <circle cx={probeX} cy={probeY} r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                          <text x="35" y="15" fill="#94a3b8">Free Surface (h=0)</text>
                          <text x="140" y="15" fill="#38bdf8">Pressure p (kPa) →</text>
                          <text x="5" y="120" fill="#94a3b8" transform="rotate(-90 20,80)">Depth h (m) ↓</text>
                        </svg>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5 text-xs">
                        <h4 className="font-semibold text-emerald-400 border-b border-slate-800 pb-1">
                          Detailed Mathematical Derivation
                        </h4>
                        <div className="space-y-2 font-mono text-[11px] text-slate-300">
                          <div>
                            <span className="text-sky-400 font-bold block">1. Gauge Pressure at Sensor:</span>
                            <span>p = ρ · g · h</span><br />
                            <span className="text-slate-400">= ({hydroInputs.fluidDensity}) · ({hydroInputs.gravity}) · ({hydroInputs.probeDepth.toFixed(2)})</span><br />
                            <span className="text-emerald-400 font-bold">= {out.gaugePressureAtProbe.toFixed(1)} Pa ({(out.gaugePressureAtProbe / 1000).toFixed(2)} kPa)</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">2. Centroid Depth (h_bar):</span>
                            <span>h_bar = h_hinge + (d / 2) · sin(θ)</span><br />
                            <span className="text-slate-400">= {hydroInputs.hingeDepth.toFixed(2)} + ({(hydroInputs.plateHeight / 2).toFixed(2)}) · sin({hydroInputs.plateAngleDeg}°)</span><br />
                            <span className="text-cyan-400 font-bold">= {out.centroidDepthHBar.toFixed(3)} m</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">3. Total Resultant Hydrostatic Force:</span>
                            <span>F = ρ · g · h_bar · A</span><br />
                            <span className="text-slate-400">= ({hydroInputs.fluidDensity}) · ({hydroInputs.gravity}) · ({out.centroidDepthHBar.toFixed(3)}) · ({(hydroInputs.plateWidth * hydroInputs.plateHeight).toFixed(3)})</span><br />
                            <span className="text-emerald-400 font-bold">= {out.totalResultantForce.toFixed(1)} N</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">4. Centre of Pressure (h*):</span>
                            <span>h* = h_bar + (IG · sin²θ) / (A · h_bar)</span><br />
                            <span className="text-slate-400">IG = b·d³/12 = {out.momentOfInertiaIG.toExponential(3)} m⁴</span><br />
                            <span className="text-fuchsia-400 font-bold">= {out.centreOfPressureDepthHStar.toFixed(3)} m (h* &gt; h_bar)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {activeSimId === '02-bernoulli-venturi' && (() => {
                  const out = HydraulicCalculator.calculateBernoulli(bernoulliInputs);
                  const stns = out.stations;
                  const telPoints = stns.map((s, i) => `${30 + i * 25},${120 - s.totalHeadM * 50}`).join(' ');
                  const hglPoints = stns.map((s, i) => `${30 + i * 25},${120 - s.piezometricHeadM * 50}`).join(' ');
                  return (
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                        <h4 className="text-xs font-semibold text-sky-400 mb-2 flex items-center space-x-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Hydraulic Grade Line (HGL) &amp; Total Energy Line (TEL)</span>
                        </h4>
                        <svg viewBox="0 0 240 140" className="w-full bg-slate-900 rounded border border-slate-800 text-[8px] text-slate-400">
                          <polygon points="30,125 70,125 105,132 120,132 155,125 205,125" fill="none" stroke="#475569" strokeWidth="1" />
                          <polygon points="30,135 205,135" fill="none" stroke="#334155" strokeWidth="1" />
                          <polyline points={telPoints} fill="none" stroke="#f59e0b" strokeWidth="2" />
                          <polyline points={hglPoints} fill="none" stroke="#38bdf8" strokeWidth="2" />
                          {stns.map((s, i) => (
                            <g key={i}>
                              <circle cx={30 + i * 25} cy={120 - s.totalHeadM * 50} r="2.5" fill="#f59e0b" />
                              <circle cx={30 + i * 25} cy={120 - s.piezometricHeadM * 50} r="2.5" fill="#38bdf8" />
                              <text x={26 + i * 25} y="138" fill="#64748b">{i + 1}</text>
                            </g>
                          ))}
                          <line x1="35" y1="12" x2="55" y2="12" stroke="#f59e0b" strokeWidth="2" />
                          <text x="60" y="14" fill="#f59e0b">TEL (Total Energy)</text>
                          <line x1="140" y1="12" x2="160" y2="12" stroke="#38bdf8" strokeWidth="2" />
                          <text x="165" y="14" fill="#38bdf8">HGL (Piezometric)</text>
                        </svg>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5 text-xs">
                        <h4 className="font-semibold text-emerald-400 border-b border-slate-800 pb-1">
                          Bernoulli Continuity &amp; Discharge Derivation
                        </h4>
                        <div className="space-y-2 font-mono text-[11px] text-slate-300">
                          <div>
                            <span className="text-sky-400 font-bold block">1. Conduit Cross-Sectional Areas:</span>
                            <span>a₁ = π·d₁²/4 = {((Math.PI * Math.pow(bernoulliInputs.inletDiameterMm/1000, 2))/4).toExponential(3)} m²</span><br />
                            <span>a₂ = π·d₂²/4 = {((Math.PI * Math.pow(bernoulliInputs.throatDiameterMm/1000, 2))/4).toExponential(3)} m²</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">2. Cross-Sectional Velocities (v = Q / A):</span>
                            <span>v₁ = Q/a₁ = {out.inletVelocityMps.toFixed(2)} m/s (Kinetic head: {(Math.pow(out.inletVelocityMps, 2)/19.62).toFixed(3)} m)</span><br />
                            <span className="text-amber-400 font-bold">v₂ = Q/a₂ = {out.throatVelocityMps.toFixed(2)} m/s (Kinetic head: {(Math.pow(out.throatVelocityMps, 2)/19.62).toFixed(3)} m)</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">3. Differential Piezometric Head (h):</span>
                            <span>h = (v₂² - v₁²) / (2g) = {out.differentialHeadM.toFixed(3)} m of water column</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">4. Theoretical &amp; Actual Discharge:</span>
                            <span>Q_th = [a₁a₂/√(a₁² - a₂²)] · √(2gh) = {out.theoreticalDischargeLps.toFixed(2)} L/s</span><br />
                            <span className="text-emerald-400 font-bold">Q_act = Cd · Q_th = {out.actualDischargeLps.toFixed(2)} L/s (Cd = {bernoulliInputs.dischargeCoefficientCd})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {activeSimId === '03-pipe-friction' && (() => {
                  const out = HydraulicCalculator.calculatePipeLosses(pipeInputs);
                  const logRe = Math.log10(Math.max(100, out.reynoldsNumber));
                  const ptX = 35 + ((logRe - 2.5) / 3.5) * 175;
                  const ptY = 120 - (out.darcyFrictionFactor / 0.08) * 100;
                  return (
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                        <h4 className="text-xs font-semibold text-sky-400 mb-2 flex items-center space-x-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Moody Diagram Friction Factor Operating Point</span>
                        </h4>
                        <svg viewBox="0 0 240 140" className="w-full bg-slate-900 rounded border border-slate-800 text-[8px] text-slate-400">
                          <path d="M 40,20 Q 55,60 70,85" fill="none" stroke="#10b981" strokeWidth="2" />
                          <text x="35" y="45" fill="#10b981">Laminar (64/Re)</text>
                          <line x1="70" y1="20" x2="70" y2="120" stroke="#f59e0b" strokeDasharray="2,2" />
                          <text x="72" y="30" fill="#f59e0b">Re=2000</text>
                          <path d="M 70,85 Q 120,95 210,100" fill="none" stroke="#38bdf8" strokeWidth="2" />
                          <text x="140" y="90" fill="#38bdf8">Turbulent Regime</text>
                          <circle cx={Math.max(35, Math.min(215, ptX))} cy={Math.max(20, Math.min(120, ptY))} r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                          <line x1="30" y1="20" x2="30" y2="120" stroke="#94a3b8" />
                          <line x1="30" y1="120" x2="220" y2="120" stroke="#94a3b8" />
                          <text x="100" y="134" fill="#94a3b8">log₁₀(Reynolds Number Re) →</text>
                          <text x="5" y="70" fill="#94a3b8" transform="rotate(-90 20,70)">Darcy f ↑</text>
                        </svg>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5 text-xs">
                        <h4 className="font-semibold text-emerald-400 border-b border-slate-800 pb-1">
                          Darcy-Weisbach &amp; Minor Loss Derivation
                        </h4>
                        <div className="space-y-2 font-mono text-[11px] text-slate-300">
                          <div>
                            <span className="text-sky-400 font-bold block">1. Mean Velocity &amp; Reynolds Number:</span>
                            <span>v = 4Q / (π·D²) = {out.velocityMps.toFixed(2)} m/s</span><br />
                            <span>Re = (v · D) / ν = {Math.round(out.reynoldsNumber)}</span><br />
                            <span className="text-amber-400 font-bold">Regime: {out.flowRegime.toUpperCase()}</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">2. Friction Factor (f):</span>
                            <span>f = {out.darcyFrictionFactor.toFixed(4)} (Relative roughness: {out.relativeRoughness.toExponential(2)})</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">3. Major Darcy Frictional Loss:</span>
                            <span>h_f = f · (L / D) · (v² / 2g)</span><br />
                            <span className="text-slate-400">= ({out.darcyFrictionFactor.toFixed(4)}) · ({pipeInputs.pipeLengthM} / {(pipeInputs.pipeDiameterMm/1000).toFixed(3)}) · ({(Math.pow(out.velocityMps, 2)/19.62).toFixed(3)})</span><br />
                            <span className="text-emerald-400 font-bold">= {out.majorFrictionHeadLossM.toFixed(3)} m</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">4. Total Energy Loss (Major + Minor):</span>
                            <span>h_total = h_f + h_m = {out.majorFrictionHeadLossM.toFixed(3)} + {out.minorLossHeadLossM.toFixed(3)}</span><br />
                            <span className="text-cyan-400 font-bold">= {out.totalHeadLossM.toFixed(3)} m (Pressure Drop: {(out.p1GaugeKPa - out.p2GaugeKPa).toFixed(2)} kPa)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {activeSimId === '04-open-channel' && (() => {
                  const out = HydraulicCalculator.calculateOpenChannel(channelInputs);
                  const q = channelInputs.dischargeM3s / channelInputs.channelWidthM;
                  const curvePts: string[] = [];
                  for (let step = 1; step <= 25; step++) {
                    const y = step * 0.015;
                    const E = y + Math.pow(q, 2) / (19.62 * Math.pow(y, 2));
                    const cx = 30 + (E / 0.4) * 170;
                    const cy = 120 - (y / 0.3) * 100;
                    curvePts.push(`${cx},${cy}`);
                  }
                  const e1 = out.initialDepthY1M + Math.pow(out.initialVelocityV1Mps, 2) / 19.62;
                  const ptY1X = 30 + (e1 / 0.4) * 170;
                  const ptY1Y = 120 - (out.initialDepthY1M / 0.3) * 100;

                  const v2 = q / out.conjugateDepthY2M;
                  const e2 = out.conjugateDepthY2M + Math.pow(v2, 2) / 19.62;
                  const ptY2X = 30 + (e2 / 0.4) * 170;
                  const ptY2Y = 120 - (out.conjugateDepthY2M / 0.3) * 100;

                  return (
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                        <h4 className="text-xs font-semibold text-sky-400 mb-2 flex items-center space-x-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Specific Energy Diagram (E vs. y)</span>
                        </h4>
                        <svg viewBox="0 0 240 140" className="w-full bg-slate-900 rounded border border-slate-800 text-[8px] text-slate-400">
                          <line x1="30" y1="120" x2="200" y2="20" stroke="#334155" strokeDasharray="2,2" />
                          <text x="175" y="40" fill="#475569">E = y</text>
                          <polyline points={curvePts.join(' ')} fill="none" stroke="#38bdf8" strokeWidth="2" />
                          <line x1="30" y1={120 - (out.criticalDepthM / 0.3) * 100} x2="210" y2={120 - (out.criticalDepthM / 0.3) * 100} stroke="#f59e0b" strokeDasharray="2,2" />
                          <text x="160" y={116 - (out.criticalDepthM / 0.3) * 100} fill="#f59e0b">yc (Critical)</text>
                          <circle cx={Math.max(30, Math.min(210, ptY1X))} cy={Math.max(20, Math.min(120, ptY1Y))} r="4" fill="#ef4444" />
                          <text x={Math.max(30, ptY1X + 6)} y={ptY1Y + 3} fill="#ef4444">y₁ (Fr={out.initialFroudeNumberFr1.toFixed(1)})</text>
                          <circle cx={Math.max(30, Math.min(210, ptY2X))} cy={Math.max(20, Math.min(120, ptY2Y))} r="4" fill="#10b981" />
                          <text x={Math.max(30, ptY2X + 6)} y={ptY2Y - 2} fill="#10b981">y₂ (Jump Tail)</text>
                          <line x1="30" y1="20" x2="30" y2="120" stroke="#94a3b8" />
                          <line x1="30" y1="120" x2="220" y2="120" stroke="#94a3b8" />
                          <text x="110" y="134" fill="#94a3b8">Specific Energy E (m) →</text>
                          <text x="5" y="70" fill="#94a3b8" transform="rotate(-90 20,70)">Depth y (m) ↑</text>
                        </svg>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5 text-xs">
                        <h4 className="font-semibold text-emerald-400 border-b border-slate-800 pb-1">
                          Open-Channel Hydraulics &amp; Jump Derivation
                        </h4>
                        <div className="space-y-2 font-mono text-[11px] text-slate-300">
                          <div>
                            <span className="text-sky-400 font-bold block">1. Unit Discharge &amp; Critical Depth:</span>
                            <span>q = Q / b = {q.toFixed(3)} m²/s</span><br />
                            <span>yc = (q² / g)^(1/3) = {out.criticalDepthM.toFixed(3)} m</span><br />
                            <span>E_min = 1.5 · yc = {(1.5 * out.criticalDepthM).toFixed(3)} m</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">2. Initial Sluice Froude Number:</span>
                            <span>v₁ = q / y₁ = {out.initialVelocityV1Mps.toFixed(2)} m/s</span><br />
                            <span className="text-amber-400 font-bold">Fr₁ = v₁ / √(g·y₁) = {out.initialFroudeNumberFr1.toFixed(2)} ({out.flowClassification.toUpperCase()})</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">3. Belanger Conjugate Subcritical Depth (y₂):</span>
                            <span>y₂ = (y₁ / 2) · [√(1 + 8·Fr₁²) - 1]</span><br />
                            <span className="text-emerald-400 font-bold">= {out.conjugateDepthY2M.toFixed(3)} m (Jump Height: {out.jumpHeightM.toFixed(3)} m)</span>
                          </div>

                          <div>
                            <span className="text-sky-400 font-bold block">4. Energy Dissipated in Jump:</span>
                            <span>ΔE = (y₂ - y₁)³ / (4 · y₁ · y₂) = {out.energyDissipatedM.toFixed(3)} m</span><br />
                            <span className="text-fuchsia-400 font-bold">Jump Efficiency: {out.efficiencyPct.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {activeSimId === '05-discharge-structures' && (() => {
                  const out = HydraulicCalculator.calculateDischargeStructure(dischargeInputs);
                  const pts: string[] = [];
                  for (let s = 1; s <= 20; s++) {
                    const hVal = s * 0.015;
                    const qVal = dischargeInputs.structureType === 'v_notch_90'
                      ? (8/15) * Math.sqrt(19.62) * 1 * Math.pow(hVal, 2.5) * 1000
                      : (2/3) * Math.sqrt(19.62) * dischargeInputs.weirWidthM * Math.pow(hVal, 1.5) * 1000;
                    const cx = 30 + (hVal / 0.3) * 175;
                    const cy = 120 - (qVal / 30) * 100;
                    pts.push(`${cx},${Math.max(20, cy)}`);
                  }
                  const curX = 30 + (dischargeInputs.headOverCrestOrificeM / 0.3) * 175;
                  const curY = 120 - (out.actualDischargeLps / 30) * 100;

                  return (
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                        <h4 className="text-xs font-semibold text-sky-400 mb-2 flex items-center space-x-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Discharge Calibration Rating Curve (Q vs. H)</span>
                        </h4>
                        <svg viewBox="0 0 240 140" className="w-full bg-slate-900 rounded border border-slate-800 text-[8px] text-slate-400">
                          <polyline points={pts.join(' ')} fill="none" stroke="#38bdf8" strokeWidth="2" />
                          <circle cx={Math.max(30, Math.min(210, curX))} cy={Math.max(20, Math.min(120, curY))} r="4" fill="#10b981" />
                          <line x1="30" y1="20" x2="30" y2="120" stroke="#94a3b8" />
                          <line x1="30" y1="120" x2="220" y2="120" stroke="#94a3b8" />
                          <text x="120" y="134" fill="#94a3b8">Head H (m) →</text>
                          <text x="5" y="70" fill="#94a3b8" transform="rotate(-90 20,70)">Discharge Q (L/s) ↑</text>
                        </svg>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5 text-xs">
                        <h4 className="font-semibold text-emerald-400 border-b border-slate-800 pb-1">
                          Discharge Formula &amp; Calibration Derivation
                        </h4>
                        <div className="space-y-2 font-mono text-[11px] text-slate-300">
                          {dischargeInputs.structureType === 'v_notch_90' ? (
                            <>
                              <div>
                                <span className="text-sky-400 font-bold block">1. Thomson V-Notch Formula:</span>
                                <span>Q_th = (8/15) · √(2g) · tan(θ/2) · H^(5/2)</span><br />
                                <span className="text-slate-400">= (8/15) · (4.429) · tan(45°) · ({dischargeInputs.headOverCrestOrificeM})^(2.5)</span><br />
                                <span className="text-cyan-400 font-bold">= {out.theoreticalDischargeLps.toFixed(2)} L/s</span>
                              </div>
                              <div>
                                <span className="text-sky-400 font-bold block">2. Calibrated Actual Discharge:</span>
                                <span>Q_act = Cd · Q_th = ({dischargeInputs.empiricalCd}) · ({out.theoreticalDischargeLps.toFixed(2)})</span><br />
                                <span className="text-emerald-400 font-bold">= {out.actualDischargeLps.toFixed(2)} L/s</span>
                              </div>
                            </>
                          ) : dischargeInputs.structureType === 'circular_orifice' ? (
                            <>
                              <div>
                                <span className="text-sky-400 font-bold block">1. Torricelli Velocity:</span>
                                <span>v_th = √(2·g·H) = {Math.sqrt(19.62 * dischargeInputs.headOverCrestOrificeM).toFixed(2)} m/s</span><br />
                                <span className="text-amber-400 font-bold">v_act = Cv · v_th = {out.jetVelocityMps.toFixed(2)} m/s</span>
                              </div>
                              <div>
                                <span className="text-sky-400 font-bold block">2. Orifice Discharge:</span>
                                <span>Q_act = Cd · a₀ · √(2·g·H)</span><br />
                                <span className="text-emerald-400 font-bold">= {out.actualDischargeLps.toFixed(2)} L/s (Cd = {out.coeffDischargeCd})</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-sky-400 font-bold block">1. Francis Rectangular Weir Formula:</span>
                                <span>Q_th = (2/3) · √(2g) · L · H^(3/2)</span><br />
                                <span className="text-cyan-400 font-bold">= {out.theoreticalDischargeLps.toFixed(2)} L/s</span>
                              </div>
                              <div>
                                <span className="text-sky-400 font-bold block">2. Calibrated Actual Discharge:</span>
                                <span className="text-emerald-400 font-bold">Q_act = Cd · Q_th = {out.actualDischargeLps.toFixed(2)} L/s</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ─── PROCEDURE TAB ─── */}
            {activeTab === 'procedure' && (
              <div className="space-y-3 text-xs text-slate-300">
                <h3 className="font-semibold text-sky-400 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Standard Laboratory Procedure</span>
                </h3>
                <div className="space-y-2 text-slate-300">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-bold text-sky-400 block mb-1">Step 1 — Apparatus Preparation:</span>
                    Inspect the hydraulic test bench, prime the supply pump, and verify zero datum levels on all piezometers and hook gauges.
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-bold text-sky-400 block mb-1">Step 2 — Configure Test Conditions:</span>
                    Use the parameter sliders to adjust the discharge, water depth, or gate opening. Observe how water levels and flow streamlines adapt in real time.
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-bold text-sky-400 block mb-1">Step 3 — Observe &amp; Record Data:</span>
                    Click the <strong>Record Trial</strong> button to append the exact piezometric heights, discharge rates, and computed loss factors into the observation notebook.
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-bold text-sky-400 block mb-1">Step 4 — Generate Laboratory Report:</span>
                    Review your trials in the observation table and click <strong>Lab Report</strong> to generate your final technical submission.
                  </div>
                </div>
              </div>
            )}

            {/* ─── OBSERVATIONS TAB ─── */}
            {activeTab === 'observations' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-200">Trial Records ({observations.length})</h3>
                  {observations.length > 0 && (
                    <button
                      onClick={() => setObservations([])}
                      className="text-red-400 hover:text-red-300 text-[11px]"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {observations.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No observations recorded yet. Adjust parameters and click "Record Trial".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {observations.map((obs) => (
                      <div key={obs.trialNumber} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px]">
                        <div className="flex justify-between font-bold text-sky-400 mb-1 border-b border-slate-800 pb-1">
                          <span>Trial #{obs.trialNumber}</span>
                          <span className="text-slate-500">{obs.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-slate-300">
                          {Object.entries(obs.measurements).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-slate-500">{k}:</span> <span className="font-mono">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── QUIZ TAB ─── */}
            {activeTab === 'quiz' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-semibold text-sky-400 flex items-center space-x-1.5">
                  <Award className="w-4 h-4" />
                  <span>Concept Assessment</span>
                </h3>
                {quizzes[activeSimId]?.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                    <p className="font-medium text-slate-200">{q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[q.id] === oIdx;
                        const isCorrect = q.correctIndex === oIdx;
                        let optionClass = 'bg-slate-900 border-slate-700 text-slate-300';
                        if (showQuizResults) {
                          if (isCorrect) optionClass = 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-semibold';
                          else if (isSelected) optionClass = 'bg-red-950/60 border-red-600 text-red-200';
                        } else if (isSelected) {
                          optionClass = 'bg-sky-950 border-sky-500 text-sky-200';
                        }
                        return (
                          <button
                            key={oIdx}
                            onClick={() => !showQuizResults && setQuizAnswers((p) => ({ ...p, [q.id]: oIdx }))}
                            className={`w-full text-left p-2 rounded border text-xs transition-colors ${optionClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {showQuizResults && (
                      <p className="text-[11px] text-sky-400 mt-2 bg-slate-900 p-2 rounded">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setShowQuizResults((prev) => !prev)}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium text-xs shadow transition-colors"
                >
                  {showQuizResults ? 'Hide Results' : 'Submit & Check Answers'}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ─── LAB REPORT MODAL ─── */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h2 className="font-semibold text-slate-100 text-sm">
                  Hydraulic Engineering Laboratory Report (U25CE406)
                </h2>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                  Experiment Title: {activeSimId.replace(/^\d+-/, '').replace(/-/g, ' ').toUpperCase()}
                </h3>
                <p className="text-slate-400 mt-1">Course: U25CE401 / U25CE406 — Hydraulic Engineering Lab</p>
              </div>

              <div>
                <h4 className="font-bold text-sky-400 mb-1">1. Aim &amp; Learning Objectives:</h4>
                <p className="text-slate-300 leading-relaxed">
                  To experimentally evaluate and verify fluid dynamics principles, determine equipment calibration coefficients ($C_d$, $f$, $Fr$), and compare experimental data with theoretical formulations.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sky-400 mb-1">2. Apparatus &amp; Experimental Setup:</h4>
                <p className="text-slate-300 leading-relaxed">
                  Laboratory hydraulic test bench, transparent acrylic conduit/tank, multi-tube piezometric battery, differential U-tube mercury manometer, vernier hook gauge, and circulating variable-speed centrifugal water pump.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sky-400 mb-1">3. Recorded Experimental Observations:</h4>
                {observations.length === 0 ? (
                  <p className="text-amber-400 italic">
                    No trials recorded yet. Close this modal, adjust parameters, and click "Record Trial".
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-800 rounded">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2">Trial #</th>
                          <th className="p-2">Time</th>
                          <th className="p-2">Key Parameters</th>
                          <th className="p-2">Measured Values</th>
                          <th className="p-2">Calculated Results</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {observations.map((obs) => (
                          <tr key={obs.trialNumber} className="hover:bg-slate-800/40">
                            <td className="p-2 font-bold text-sky-400">#{obs.trialNumber}</td>
                            <td className="p-2 text-slate-400">{obs.timestamp}</td>
                            <td className="p-2 font-mono">
                              {Object.entries(obs.parameters).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </td>
                            <td className="p-2 font-mono text-emerald-400">
                              {Object.entries(obs.measurements).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </td>
                            <td className="p-2 font-mono text-cyan-400">
                              {Object.entries(obs.calculatedValues).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sky-400 mb-1">4. Conclusions &amp; Engineering Discussion:</h4>
                <p className="text-slate-300 leading-relaxed">
                  Experimental measurements align with theoretical hydrodynamic expectations. Pressure drops across contractions substantiate Bernoulli's energy theorem, and friction factors follow standard Darcy-Weisbach / Moody formulations without numerical divergence.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold shadow"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
