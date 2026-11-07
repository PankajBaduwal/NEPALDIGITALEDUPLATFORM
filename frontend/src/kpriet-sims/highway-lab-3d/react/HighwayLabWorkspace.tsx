/**
 * PiyushDhara Eduverse — 3D Highway Engineering Simulation Laboratory
 * Course: U25CE402 — Highway Engineering (Civil Engineering, Semester IV)
 * Master Interactive React Laboratory Workspace
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers,
  Compass,
  RotateCcw,
  Maximize2,
  Table,
  BookOpen,
  HelpCircle,
  FileText,
  LineChart,
  Play,
  Square,
  Sliders,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  Printer,
  X,
  Truck,
  Flame,
  Award,
} from 'lucide-react';

import type {
  HighwaySimId,
  HighwayViewMode,
  IPavementCrossSectionState,
  IGeometricDesignState,
  ISuperelevationState,
  IConstructionSequenceState,
  IMaterialsTestingState,
  IPavementEvaluationState,
  IHighwayComponentInfo,
  IHighwayObservationTrial,
} from '../core/types';
import { HighwayCalculator } from '../core/HighwayCalculator';

import { PavementCrossSectionScene } from '../simulations/01-cross-section/PavementCrossSectionScene';
import { GeometricDesignScene } from '../simulations/02-geometric/GeometricDesignScene';
import { SuperelevationScene } from '../simulations/03-superelevation/SuperelevationScene';
import { ConstructionSequenceScene } from '../simulations/04-construction/ConstructionSequenceScene';
import { MaterialsTestingScene } from '../simulations/05-materials/MaterialsTestingScene';
import { PavementEvaluationScene } from '../simulations/06-evaluation/PavementEvaluationScene';
import { BaseHighwaySimulation } from '../core/BaseHighwaySimulation';

interface IHighwayLabWorkspaceProps {
  initialSimId?: HighwaySimId;
  onExit?: () => void;
}

const DEFAULT_CROSS_SECTION: IPavementCrossSectionState = {
  pavementType: 'flexible',
  carriagewayWidth: 7.0,
  lanes: 2,
  camberPercent: 2.5,
  camberType: 'parabolic',
  shoulderWidth: 2.5,
  length: 30.0,
  layers: [
    {
      id: 'subgrade',
      name: 'Prepared Subgrade',
      thicknessMm: 500,
      material: 'Compacted Selected Soil (CBR ≥ 8%)',
      specification: 'MORTH Section 300 / IRC: 37-2018',
      function: 'Foundation layer supporting pavement, compacted to 97% MDD',
      cbrPercent: 8,
    },
    {
      id: 'gsb',
      name: 'Granular Sub-Base (GSB)',
      thicknessMm: 200,
      material: 'Graded Crushed Stone Aggregate (Grading-I)',
      specification: 'MORTH Clause 401 / IRC: 37-2018',
      function: 'Drainage layer, capillary cut-off, and load distribution',
      cbrPercent: 30,
    },
    {
      id: 'wmm',
      name: 'Wet Mix Macadam (WMM) Base',
      thicknessMm: 250,
      material: 'Dense Graded Crushed Stone with Controlled Moisture',
      specification: 'MORTH Clause 406 / IRC: 37-2018',
      function: 'Principal structural base carrying compressive stress',
    },
    {
      id: 'dbm',
      name: 'Dense Bituminous Macadam (DBM)',
      thicknessMm: 100,
      material: 'Coarse Aggregate with VG-30 Bitumen Binder (4.5%)',
      specification: 'MORTH Clause 505 / IRC: 37-2018',
      function: 'Binder course resisting horizontal tensile fatigue strain',
    },
    {
      id: 'bc',
      name: 'Bituminous Concrete (BC) Wearing Course',
      thicknessMm: 50,
      material: 'High Quality Hard Aggregates with VG-30 Bitumen (5.4%)',
      specification: 'MORTH Clause 507 / IRC: 37-2018',
      function: 'Impervious, skid-resistant, smooth riding surface',
    },
  ],
};

const DEFAULT_GEOMETRIC: IGeometricDesignState = {
  speedKmph: 80,
  radiusM: 250,
  deflectionAngleDeg: 60,
  reactionTimeSec: 2.5,
  longitudinalSlopePercent: 0,
  frictionCoeff: 0.35,
  roadType: 'nh-plain',
};

const DEFAULT_SUPERELEVATION: ISuperelevationState = {
  speedKmph: 80,
  radiusM: 250,
  roadWidth: 7.0,
  lanes: 2,
  terrain: 'plain-rolling',
  wheelbaseLengthM: 6.1,
  maxSuperelevation: 0.07,
};

const DEFAULT_CONSTRUCTION: IConstructionSequenceState = {
  currentStage: 3,
  stageName: 'Wet Mix Macadam (WMM) Base Layer',
  isCompacting: false,
  compactionEnergy: 'heavy',
  temperatureCelsius: 155,
  rollerSpeedKmph: 3.5,
};

const DEFAULT_MATERIALS: IMaterialsTestingState = {
  testType: 'impact',
  sampleWeightGrams: 350,
  passingFractionGrams: 45.5,
  dropCount: 15,
  bathTemperatureC: 25.0,
  needleLoadG: 100,
  penetrationDurationS: 5.0,
  ringBallBathTempC: 5.0,
  heatingRateCPerMin: 5.0,
};

const DEFAULT_EVALUATION: IPavementEvaluationState = {
  rearAxleLoadKg: 8170,
  tyrePressureMpa: 0.56,
  pavementTempC: 35,
  subgradeSoilType: 'clay-low-plasticity',
  annualRainfallMm: 1200,
  designTrafficMsa: 30,
  distressType: 'cracking',
  measuredDeflectionsMm: [1.25, 1.40, 1.18, 1.35, 1.50, 1.28, 1.45, 1.32, 1.38, 1.42],
};

export const HighwayLabWorkspace: React.FC<IHighwayLabWorkspaceProps> = ({
  initialSimId = 'u25ce402-pavement-cross-section',
  onExit,
}) => {
  const [activeSimId, setActiveSimId] = useState<HighwaySimId>(initialSimId);
  const [viewMode, setViewMode] = useState<HighwayViewMode>('visualizer');

  // Module states
  const [crossSectionState, setCrossSectionState] = useState<IPavementCrossSectionState>(DEFAULT_CROSS_SECTION);
  const [geometricState, setGeometricState] = useState<IGeometricDesignState>(DEFAULT_GEOMETRIC);
  const [superelevationState, setSuperelevationState] = useState<ISuperelevationState>(DEFAULT_SUPERELEVATION);
  const [constructionState, setConstructionState] = useState<IConstructionSequenceState>(DEFAULT_CONSTRUCTION);
  const [materialsState, setMaterialsState] = useState<IMaterialsTestingState>(DEFAULT_MATERIALS);
  const [evaluationState, setEvaluationState] = useState<IPavementEvaluationState>(DEFAULT_EVALUATION);

  // UI state
  const [selectedComponent, setSelectedComponent] = useState<IHighwayComponentInfo | null>(null);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [trials, setTrials] = useState<IHighwayObservationTrial[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Ready');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simInstanceRef = useRef<BaseHighwaySimulation | null>(null);

  // Initialize 3D Simulation Instance
  useEffect(() => {
    if (!canvasRef.current) return;

    if (simInstanceRef.current) {
      simInstanceRef.current.dispose();
      simInstanceRef.current = null;
    }

    const options = {
      canvas: canvasRef.current,
      onComponentSelected: (info: IHighwayComponentInfo) => setSelectedComponent(info),
      onStatusChange: (status: string) => setStatusMessage(status),
    };

    switch (activeSimId) {
      case 'u25ce402-pavement-cross-section': {
        const scene = new PavementCrossSectionScene(options);
        scene.rebuildRoadCrossSection(crossSectionState);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce402-geometric-design': {
        const scene = new GeometricDesignScene(options);
        scene.rebuildCurve(geometricState);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce402-superelevation-widening': {
        const scene = new SuperelevationScene(options);
        scene.rebuildSuperelevation(superelevationState);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce402-pavement-construction': {
        const scene = new ConstructionSequenceScene(options);
        scene.setStage(constructionState.currentStage, constructionState);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce402-materials-testing': {
        const scene = new MaterialsTestingScene(options);
        scene.setTestType(materialsState.testType);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce402-pavement-evaluation': {
        const scene = new PavementEvaluationScene(options);
        scene.rebuildDistress(evaluationState);
        simInstanceRef.current = scene;
        break;
      }
    }

    return () => {
      if (simInstanceRef.current) {
        simInstanceRef.current.dispose();
        simInstanceRef.current = null;
      }
    };
  }, [activeSimId]);

  // Sync state changes with current active 3D scene
  useEffect(() => {
    if (!simInstanceRef.current) return;
    if (activeSimId === 'u25ce402-pavement-cross-section' && simInstanceRef.current instanceof PavementCrossSectionScene) {
      simInstanceRef.current.rebuildRoadCrossSection(crossSectionState);
    } else if (activeSimId === 'u25ce402-geometric-design' && simInstanceRef.current instanceof GeometricDesignScene) {
      simInstanceRef.current.rebuildCurve(geometricState);
    } else if (activeSimId === 'u25ce402-superelevation-widening' && simInstanceRef.current instanceof SuperelevationScene) {
      simInstanceRef.current.rebuildSuperelevation(superelevationState);
    } else if (activeSimId === 'u25ce402-pavement-construction' && simInstanceRef.current instanceof ConstructionSequenceScene) {
      simInstanceRef.current.setStage(constructionState.currentStage, constructionState);
    } else if (activeSimId === 'u25ce402-materials-testing' && simInstanceRef.current instanceof MaterialsTestingScene) {
      simInstanceRef.current.setTestType(materialsState.testType);
    } else if (activeSimId === 'u25ce402-pavement-evaluation' && simInstanceRef.current instanceof PavementEvaluationScene) {
      simInstanceRef.current.rebuildDistress(evaluationState);
    }
  }, [
    activeSimId,
    crossSectionState,
    geometricState,
    superelevationState,
    constructionState,
    materialsState,
    evaluationState,
  ]);

  // Derived Calculations
  const geometricCalc = useMemo(() => {
    return HighwayCalculator.calculateGeometricDesign(
      geometricState.speedKmph,
      geometricState.radiusM,
      geometricState.longitudinalSlopePercent,
      geometricState.reactionTimeSec,
      geometricState.frictionCoeff
    );
  }, [geometricState]);

  const superelevationCalc = useMemo(() => {
    return HighwayCalculator.calculateSuperelevation(
      superelevationState.speedKmph,
      superelevationState.radiusM,
      superelevationState.roadWidth,
      superelevationState.terrain
    );
  }, [superelevationState]);

  const wideningCalc = useMemo(() => {
    return HighwayCalculator.calculateExtraWidening(
      superelevationState.speedKmph,
      superelevationState.radiusM,
      superelevationState.lanes,
      superelevationState.wheelbaseLengthM
    );
  }, [superelevationState]);

  const crossSectionCalc = useMemo(() => {
    return HighwayCalculator.calculateCrossSection(
      crossSectionState.carriagewayWidth,
      crossSectionState.camberPercent,
      crossSectionState.camberType,
      crossSectionState.shoulderWidth,
      crossSectionState.layers,
      crossSectionState.length
    );
  }, [crossSectionState]);

  const evaluationCalc = useMemo(() => {
    return HighwayCalculator.calculateBenkelmanBeamOverlay(
      evaluationState.measuredDeflectionsMm,
      evaluationState.pavementTempC,
      evaluationState.subgradeSoilType,
      evaluationState.annualRainfallMm,
      evaluationState.designTrafficMsa
    );
  }, [evaluationState]);

  const materialImpactCalc = useMemo(() => {
    return HighwayCalculator.calculateAggregateImpact(
      materialsState.sampleWeightGrams,
      materialsState.passingFractionGrams
    );
  }, [materialsState]);

  // Record trial
  const recordObservation = () => {
    const timestamp = new Date().toLocaleTimeString();
    let dataRecord: Record<string, string | number> = {};

    switch (activeSimId) {
      case 'u25ce402-pavement-cross-section':
        dataRecord = {
          Width_m: crossSectionState.carriagewayWidth,
          Camber_pct: crossSectionState.camberPercent,
          Crown_Height_mm: (crossSectionCalc.crownHeightM * 1000).toFixed(1),
          Total_Thickness_mm: crossSectionCalc.totalPavementThicknessMm,
          Total_Volume_m3: crossSectionCalc.totalVolumeM3,
        };
        break;
      case 'u25ce402-geometric-design':
        dataRecord = {
          Speed_kmph: geometricState.speedKmph,
          Radius_m: geometricState.radiusM,
          SSD_m: geometricCalc.ssdM,
          OSD_m: geometricCalc.osdM,
          Ruling_Radius_m: geometricCalc.rulingRadiusM,
          Setback_m: geometricCalc.setbackDistanceM,
        };
        break;
      case 'u25ce402-superelevation-widening':
        dataRecord = {
          Speed_kmph: superelevationState.speedKmph,
          Radius_m: superelevationState.radiusM,
          Design_e_pct: (superelevationCalc.designSuperelevation * 100).toFixed(2),
          Provided_e_pct: (superelevationCalc.providedSuperelevation * 100).toFixed(2),
          Extra_Widening_m: wideningCalc.totalWideningM,
          Total_Width_m: wideningCalc.totalRoadWidthM,
        };
        break;
      case 'u25ce402-pavement-construction':
        dataRecord = {
          Stage: constructionState.currentStage + 1,
          Stage_Name: constructionState.stageName,
          Temperature_C: constructionState.temperatureCelsius,
          Roller_Speed_kmph: constructionState.rollerSpeedKmph,
        };
        break;
      case 'u25ce402-materials-testing':
        dataRecord = {
          Test_Type: materialsState.testType.toUpperCase(),
          Total_Sample_g: materialsState.sampleWeightGrams,
          Passing_2_36mm_g: materialsState.passingFractionGrams,
          AIV_percent: materialImpactCalc.impactValuePercent,
          Suitability: materialImpactCalc.suitability,
        };
        break;
      case 'u25ce402-pavement-evaluation':
        dataRecord = {
          Mean_Deflection_mm: evaluationCalc.meanDeflectionMm,
          Char_Deflection_Dc_mm: evaluationCalc.characteristicDeflectionMm,
          Allowable_Da_mm: evaluationCalc.allowableDeflectionMm,
          Overlay_BM_mm: evaluationCalc.overlayThicknessBmMm,
          Traffic_MSA: evaluationState.designTrafficMsa,
        };
        break;
    }

    const newTrial: IHighwayObservationTrial = {
      trialNumber: trials.length + 1,
      timestamp,
      module: activeSimId,
      parameters: dataRecord,
      results: dataRecord,
    };

    setTrials([...trials, newTrial]);
    setStatusMessage(`Trial #${newTrial.trialNumber} recorded at ${timestamp}`);
  };

  const exportCSV = () => {
    if (trials.length === 0) return;
    const allKeys = Array.from(new Set(trials.flatMap((t) => Object.keys(t.parameters))));
    const headers = ['Trial', 'Timestamp', 'Module', ...allKeys];
    const rows = trials.map((t) => [
      t.trialNumber,
      t.timestamp,
      t.module,
      ...allKeys.map((k) => t.parameters[k] ?? ''),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `highway_engineering_observations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* 1. Header Bar with Institutional Brand */}
      <header className="h-14 px-4 bg-slate-900 border-b border-emerald-900/40 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                U25CE402
              </span>
              <h1 className="text-sm font-bold text-slate-100 tracking-wide">
                Highway Engineering Virtual Laboratory
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              Department of Civil Engineering • Semester IV • IRC Standards 73 / 37 / 81
            </p>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          {(
            [
              { id: 'visualizer', label: '3D Simulation', icon: Compass },
              { id: 'theory', label: 'Theory & IRC Codes', icon: BookOpen },
              { id: 'curves', label: 'Analytical Curves', icon: LineChart },
              { id: 'derivations', label: 'Calculations', icon: FileText },
              { id: 'observations', label: 'Observations', icon: Table },
              { id: 'quiz', label: 'Concept Quiz', icon: HelpCircle },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition"
              title="Exit Simulation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sub-Sidebar: Syllabus Module Selector */}
        <div className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Syllabus Modules (R2025)</span>
            <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded">6 Units</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {[
              {
                id: 'u25ce402-pavement-cross-section' as HighwaySimId,
                title: '1. Pavement Layers & Cross-Section',
                sub: 'Flexible / Rigid Cutaways, Camber & Takeoff',
                irc: 'IRC: 73 & IRC: 37',
              },
              {
                id: 'u25ce402-geometric-design' as HighwaySimId,
                title: '2. Alignment & Geometric Design',
                sub: 'Horizontal Curve, SSD, OSD & Sight Triangle',
                irc: 'IRC: 73-1980',
              },
              {
                id: 'u25ce402-superelevation-widening' as HighwaySimId,
                title: '3. Superelevation & Widening',
                sub: 'Banking e = V²/225R & Off-Tracking Wm+Wps',
                irc: 'IRC: 73 Table 7',
              },
              {
                id: 'u25ce402-pavement-construction' as HighwaySimId,
                title: '4. Construction Sequence & Machinery',
                sub: 'Subgrade, GSB, WMM, DBM, BC & Compaction',
                irc: 'MORTH Section 500',
              },
              {
                id: 'u25ce402-materials-testing' as HighwaySimId,
                title: '5. Highway Materials Laboratory',
                sub: 'Aggregate Impact, LA Abrasion, Penetration & Softening',
                irc: 'IS 2386 & IS 73',
              },
              {
                id: 'u25ce402-pavement-evaluation' as HighwaySimId,
                title: '6. Pavement Evaluation & Overlay',
                sub: 'Benkelman Beam Deflection (BBD) & Overlay IRC: 81',
                irc: 'IRC: 81-1997',
              },
            ].map((mod) => {
              const isSelected = activeSimId === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setActiveSimId(mod.id);
                    setSelectedComponent(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold leading-tight">{mod.title}</span>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{mod.sub}</span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">{mod.irc}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Status Pill */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate">{statusMessage}</span>
          </div>
        </div>

        {/* Center/Right Dynamic Body */}
        {viewMode === 'visualizer' && (
          <div className="flex-1 flex overflow-hidden">
            {/* 3D WebGL Canvas Area */}
            <div className="flex-1 relative bg-slate-950">
              <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

              {/* Viewport Overlay Controls */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                <button
                  onClick={() => simInstanceRef.current?.resetCamera()}
                  className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur border border-slate-700/60 text-slate-200 text-xs rounded-md shadow flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Camera</span>
                </button>

                {activeSimId === 'u25ce402-pavement-cross-section' && (
                  <button
                    onClick={() => {
                      const next = !isExploded;
                      setIsExploded(next);
                      if (simInstanceRef.current instanceof PavementCrossSectionScene) {
                        simInstanceRef.current.setExplodedView(next);
                      }
                    }}
                    className={`px-2.5 py-1.5 backdrop-blur border text-xs rounded-md shadow flex items-center gap-1.5 transition ${
                      isExploded
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isExploded ? 'Collapse Layers' : 'Explode Layer View'}</span>
                  </button>
                )}

                {activeSimId === 'u25ce402-materials-testing' && (
                  <button
                    onClick={() => {
                      if (simInstanceRef.current instanceof MaterialsTestingScene) {
                        simInstanceRef.current.triggerTestRun();
                        setStatusMessage('Running test sequence in 3D apparatus...');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Trigger Test Action</span>
                  </button>
                )}

                {activeSimId === 'u25ce402-pavement-evaluation' && (
                  <button
                    onClick={() => {
                      if (simInstanceRef.current instanceof PavementEvaluationScene) {
                        simInstanceRef.current.triggerDeflectionTest();
                        setStatusMessage('8170 kg test truck driving forward; recording rebound deflection bowl...');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-md shadow flex items-center gap-1.5 transition"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Run Deflection Test</span>
                  </button>
                )}
              </div>

              {/* Bottom Quick Telemetry Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg text-xs text-slate-300 shadow">
                    <span className="text-slate-400">Design Code: </span>
                    <span className="font-semibold text-emerald-400">
                      {activeSimId === 'u25ce402-geometric-design'
                        ? 'IRC: 73-1980 (Ruling V = ' + geometricState.speedKmph + ' km/h)'
                        : activeSimId === 'u25ce402-superelevation-widening'
                        ? 'IRC: 73-1980 (e_max = 7%)'
                        : activeSimId === 'u25ce402-pavement-cross-section'
                        ? 'IRC: 37-2018 / MORTH 500'
                        : activeSimId === 'u25ce402-materials-testing'
                        ? 'IS: 2386 / IS: 73-2013'
                        : activeSimId === 'u25ce402-pavement-evaluation'
                        ? 'IRC: 81-1997 Overlay Code'
                        : 'MORTH Specifications'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={recordObservation}
                  className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-emerald-950/60 transition"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Record Observation</span>
                </button>
              </div>
            </div>

            {/* Right Control & Telemetry Panel */}
            <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Engineering Parameters
                  </span>
                </div>
              </div>

              {/* Module-Specific Controls */}
              <div className="p-4 space-y-4">
                {activeSimId === 'u25ce402-pavement-cross-section' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Pavement Type</span>
                        <span className="font-mono text-emerald-400 uppercase">{crossSectionState.pavementType}</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        <button
                          onClick={() => setCrossSectionState({ ...crossSectionState, pavementType: 'flexible' })}
                          className={`py-1.5 text-xs font-medium rounded border ${
                            crossSectionState.pavementType === 'flexible'
                              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          Flexible (IRC: 37)
                        </button>
                        <button
                          onClick={() => setCrossSectionState({ ...crossSectionState, pavementType: 'rigid' })}
                          className={`py-1.5 text-xs font-medium rounded border ${
                            crossSectionState.pavementType === 'rigid'
                              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          Rigid PQC (IRC: 58)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Carriageway Width</span>
                        <span className="font-mono text-emerald-400">{crossSectionState.carriagewayWidth} m</span>
                      </label>
                      <input
                        type="range"
                        min="3.75"
                        max="14.0"
                        step="0.25"
                        value={crossSectionState.carriagewayWidth}
                        onChange={(e) =>
                          setCrossSectionState({
                            ...crossSectionState,
                            carriagewayWidth: parseFloat(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Camber Cross-Slope</span>
                        <span className="font-mono text-emerald-400">{crossSectionState.camberPercent}%</span>
                      </label>
                      <input
                        type="range"
                        min="1.5"
                        max="4.0"
                        step="0.1"
                        value={crossSectionState.camberPercent}
                        onChange={(e) =>
                          setCrossSectionState({
                            ...crossSectionState,
                            camberPercent: parseFloat(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        IRC: 73 recommends 2.0% (low rainfall) to 2.5% (heavy rainfall) for bituminous surface.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Shoulder Width (IRC: 73)</span>
                        <span className="font-mono text-emerald-400">{crossSectionState.shoulderWidth} m</span>
                      </label>
                      <input
                        type="range"
                        min="1.0"
                        max="3.5"
                        step="0.25"
                        value={crossSectionState.shoulderWidth}
                        onChange={(e) =>
                          setCrossSectionState({
                            ...crossSectionState,
                            shoulderWidth: parseFloat(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                    </div>

                    {/* Output Cards */}
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 mt-3">
                      <div className="text-xs font-semibold text-slate-300">Layer Quantities (L = {crossSectionState.length} m)</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Thickness:</span>
                        <span className="font-mono text-emerald-400">{crossSectionCalc.totalPavementThicknessMm} mm</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Crown Height y_max:</span>
                        <span className="font-mono text-emerald-400">{(crossSectionCalc.crownHeightM * 1000).toFixed(1)} mm</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Material Volume:</span>
                        <span className="font-mono text-emerald-400">{crossSectionCalc.totalVolumeM3.toFixed(2)} m³</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSimId === 'u25ce402-geometric-design' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Design Speed (V)</span>
                        <span className="font-mono text-emerald-400">{geometricState.speedKmph} km/h</span>
                      </label>
                      <input
                        type="range"
                        min="40"
                        max="120"
                        step="5"
                        value={geometricState.speedKmph}
                        onChange={(e) =>
                          setGeometricState({
                            ...geometricState,
                            speedKmph: parseInt(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Curve Radius (R)</span>
                        <span className="font-mono text-emerald-400">{geometricState.radiusM} m</span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="800"
                        step="10"
                        value={geometricState.radiusM}
                        onChange={(e) =>
                          setGeometricState({
                            ...geometricState,
                            radiusM: parseInt(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Longitudinal Gradient (G)</span>
                        <span className="font-mono text-emerald-400">{geometricState.longitudinalSlopePercent}%</span>
                      </label>
                      <input
                        type="range"
                        min="-6"
                        max="6"
                        step="0.5"
                        value={geometricState.longitudinalSlopePercent}
                        onChange={(e) =>
                          setGeometricState({
                            ...geometricState,
                            longitudinalSlopePercent: parseFloat(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                    </div>

                    {/* Output Cards */}
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 mt-3">
                      <div className="text-xs font-semibold text-slate-300">Sight Distance Checks (IRC: 73)</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Lag Distance (0.278 V t):</span>
                        <span className="font-mono text-emerald-400">{geometricCalc.lagDistanceM} m</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Braking Distance:</span>
                        <span className="font-mono text-emerald-400">{geometricCalc.brakingDistanceM} m</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Stopping Sight Distance (SSD):</span>
                        <span className="font-mono text-emerald-400">{geometricCalc.ssdM} m</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Overtaking Sight Distance (OSD):</span>
                        <span className="font-mono text-emerald-400">{geometricCalc.osdM} m</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Setback Distance (m):</span>
                        <span className="font-mono text-emerald-400">{geometricCalc.setbackDistanceM} m</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSimId === 'u25ce402-superelevation-widening' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Design Speed (V)</span>
                        <span className="font-mono text-emerald-400">{superelevationState.speedKmph} km/h</span>
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="120"
                        step="5"
                        value={superelevationState.speedKmph}
                        onChange={(e) =>
                          setSuperelevationState({
                            ...superelevationState,
                            speedKmph: parseInt(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Curve Radius (R)</span>
                        <span className="font-mono text-emerald-400">{superelevationState.radiusM} m</span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="600"
                        step="10"
                        value={superelevationState.radiusM}
                        onChange={(e) =>
                          setSuperelevationState({
                            ...superelevationState,
                            radiusM: parseInt(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                    </div>

                    {/* Output Cards */}
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 mt-3">
                      <div className="text-xs font-semibold text-slate-300">Superelevation & Widening (IRC: 73)</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">e (75% Speed):</span>
                        <span className="font-mono text-emerald-400">
                          {(superelevationCalc.designSuperelevation * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Provided Superelevation:</span>
                        <span className="font-mono text-emerald-400">
                          {(superelevationCalc.providedSuperelevation * 100).toFixed(2)}% (1 in{' '}
                          {(1 / superelevationCalc.providedSuperelevation).toFixed(1)})
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Mechanical Widening Wm:</span>
                        <span className="font-mono text-emerald-400">{wideningCalc.mechanicalWideningM} m</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Psychological Widening Wps:</span>
                        <span className="font-mono text-emerald-400">{wideningCalc.psychologicalWideningM} m</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Total Curve Width:</span>
                        <span className="font-mono text-emerald-400">{wideningCalc.totalRoadWidthM} m</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSimId === 'u25ce402-pavement-construction' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400">Construction Sequence Stage</label>
                      <div className="space-y-1.5 mt-2">
                        {[
                          '1. Compacted Subgrade (500 mm)',
                          '2. Granular Sub-base GSB (200 mm)',
                          '3. Wet Mix Macadam WMM (250 mm)',
                          '4. Dense Bituminous Macadam DBM (100 mm)',
                          '5. Bituminous Concrete BC (50 mm)',
                        ].map((name, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              setConstructionState({
                                ...constructionState,
                                currentStage: idx,
                                stageName: name,
                              })
                            }
                            className={`w-full text-left p-2 rounded text-xs transition border ${
                              constructionState.currentStage === idx
                                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-semibold'
                                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Paving Temperature</span>
                        <span className="font-mono text-emerald-400">{constructionState.temperatureCelsius}°C</span>
                      </label>
                      <input
                        type="range"
                        min="120"
                        max="175"
                        step="5"
                        value={constructionState.temperatureCelsius}
                        onChange={(e) =>
                          setConstructionState({
                            ...constructionState,
                            temperatureCelsius: parseInt(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        MORTH Clause 501 mandates minimum 150°C for VG-30 bitumen at breakdown rolling.
                      </span>
                    </div>
                  </div>
                )}

                {activeSimId === 'u25ce402-materials-testing' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400">Select Laboratory Test</label>
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        {[
                          { id: 'impact', label: 'Aggregate Impact' },
                          { id: 'abrasion', label: 'Los Angeles Abrasion' },
                          { id: 'penetration', label: 'Bitumen Penetration' },
                          { id: 'softening', label: 'Ring & Ball Softening' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setMaterialsState({ ...materialsState, testType: t.id })}
                            className={`p-2 rounded text-xs border text-left transition ${
                              materialsState.testType === t.id
                                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-semibold'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {materialsState.testType === 'impact' && (
                      <div className="space-y-2 mt-2">
                        <label className="text-xs text-slate-400 flex justify-between">
                          <span>Fraction Passing 2.36 mm Sieve (W2)</span>
                          <span className="font-mono text-emerald-400">{materialsState.passingFractionGrams} g</span>
                        </label>
                        <input
                          type="range"
                          min="15"
                          max="120"
                          step="1"
                          value={materialsState.passingFractionGrams}
                          onChange={(e) =>
                            setMaterialsState({
                              ...materialsState,
                              passingFractionGrams: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-emerald-500"
                        />

                        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5 mt-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Aggregate Impact Value:</span>
                            <span className="font-mono font-bold text-emerald-400">
                              {materialImpactCalc.impactValuePercent}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            Status: <span className="text-emerald-400 font-semibold">{materialImpactCalc.suitability}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSimId === 'u25ce402-pavement-evaluation' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Design Traffic (MSA)</span>
                        <span className="font-mono text-emerald-400">{evaluationState.designTrafficMsa} MSA</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="150"
                        step="5"
                        value={evaluationState.designTrafficMsa}
                        onChange={(e) =>
                          setEvaluationState({
                            ...evaluationState,
                            designTrafficMsa: parseInt(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Pavement Temperature</span>
                        <span className="font-mono text-emerald-400">{evaluationState.pavementTempC}°C</span>
                      </label>
                      <input
                        type="range"
                        min="25"
                        max="50"
                        step="1"
                        value={evaluationState.pavementTempC}
                        onChange={(e) =>
                          setEvaluationState({
                            ...evaluationState,
                            pavementTempC: parseInt(e.target.value),
                          })
                        }
                        className="w-full mt-1 accent-emerald-500"
                      />
                    </div>

                    {/* Output Cards */}
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 mt-3">
                      <div className="text-xs font-semibold text-slate-300">BBD Overlay Design (IRC: 81)</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Characteristic Deflection (Dc):</span>
                        <span className="font-mono text-emerald-400">{evaluationCalc.characteristicDeflectionMm} mm</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Allowable Deflection (Da):</span>
                        <span className="font-mono text-emerald-400">{evaluationCalc.allowableDeflectionMm} mm</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Required BM Overlay (h0):</span>
                        <span className="font-mono text-emerald-400">{evaluationCalc.overlayThicknessBmMm} mm</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Equivalent DBM Overlay:</span>
                        <span className="font-mono text-emerald-400">{evaluationCalc.overlayThicknessDbmMm} mm</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Selected Component Detail */}
                {selectedComponent && (
                  <div className="mt-4 p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-lg space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                        {selectedComponent.category}
                      </span>
                      <button
                        onClick={() => setSelectedComponent(null)}
                        className="text-slate-500 hover:text-slate-300 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100">{selectedComponent.name}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{selectedComponent.description}</p>
                    {selectedComponent.specReference && (
                      <div className="text-[10px] text-emerald-400/90 font-mono">
                        Spec: {selectedComponent.specReference}
                      </div>
                    )}
                    {selectedComponent.dimensions && (
                      <div className="text-[10px] text-slate-400 font-mono">{selectedComponent.dimensions}</div>
                    )}
                    {selectedComponent.formula && (
                      <div className="text-[10px] bg-slate-900 p-1.5 rounded text-emerald-300 font-mono border border-slate-800">
                        {selectedComponent.formula}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Theory */}
        {viewMode === 'theory' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-300 space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-emerald-400 uppercase">U25CE402 Theory</span>
              <h2 className="text-xl font-bold text-slate-100 mt-1">
                Highway Engineering Design Standards & Principles
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Indian Roads Congress (IRC) Codes & Ministry of Road Transport and Highways (MORTH) Specifications
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-emerald-400">1. Road Cross-Section Elements & Camber (IRC: 73)</h3>
              <p className="text-xs leading-relaxed">
                Camber or cross-slope is the transverse slope provided to the road surface to drain off rainwater safely
                from the carriageway. Proper drainage prevents hydroplaning and prevents water entering the subgrade.
                IRC: 73 recommends 2.0% for thin bituminous surfaces in low rainfall areas and 2.5% in heavy rainfall areas.
                For concrete pavements, 1.7% to 2.0% is specified.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-emerald-400">2. Superelevation & Extra Widening (IRC: 73)</h3>
              <p className="text-xs leading-relaxed">
                Superelevation (e) is the transverse inward tilt provided along horizontal curves to counteract centrifugal
                force. In India, IRC: 73 specifies designing for 75% of design speed assuming zero lateral friction:
              </p>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-emerald-300">
                e = V² / (225 R) ≤ 0.07 (Plain/Rolling terrain)
              </div>
              <p className="text-xs leading-relaxed">
                On curves, extra widening is mandated to account for the off-tracking of the rigid rear wheels of vehicles
                (mechanical widening Wm) and psychological difficulties in steering close to the road edge (Wps):
              </p>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-emerald-300">
                We = Wm + Wps = (n · l²) / (2 R) + V / (9.5 · √R)
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-emerald-400">3. Benkelman Beam Overlay Design (IRC: 81-1997)</h3>
              <p className="text-xs leading-relaxed">
                The Benkelman Beam measures the transient rebound deflection of flexible pavement under a standard 8170 kg
                dual-wheel axle load. Characteristic deflection (Dc) incorporates the statistical mean deflection and standard
                deviation, corrected for pavement temperature and subgrade seasonal moisture variation:
              </p>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-emerald-300">
                h₀ = 550 · log₁₀(Dc / Da) mm of Bituminous Macadam (BM)
              </div>
            </section>
          </div>
        )}

        {/* View Mode: Analytical Curves */}
        {viewMode === 'curves' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-300 space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100">Engineering Analytical Curves</h2>
              <p className="text-xs text-slate-400">Real-time dynamic plots generated from simulation inputs</p>
            </div>

            {/* SVG Plot 1: Camber Profile */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400">
                Road Cross-Section Camber Profile (Carriageway = {crossSectionState.carriagewayWidth} m, Slope = {crossSectionState.camberPercent}%)
              </h3>
              <svg viewBox="0 0 600 200" className="w-full h-48 bg-slate-950 rounded-lg p-2 border border-slate-800/80">
                {/* Axes */}
                <line x1="50" y1="160" x2="550" y2="160" stroke="#475569" strokeWidth="1.5" />
                <line x1="300" y1="160" x2="300" y2="40" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
                <text x="305" y="55" fill="#10b981" fontSize="10">Crown</text>

                {/* Parabolic Crown Curve */}
                <path
                  d={`M 100 140 Q 300 ${140 - crossSectionState.camberPercent * 16} 500 140`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                />

                {/* Labels */}
                <text x="70" y="155" fill="#94a3b8" fontSize="10">-W/2</text>
                <text x="490" y="155" fill="#94a3b8" fontSize="10">+W/2</text>
                <text x="300" y="180" fill="#94a3b8" fontSize="11" textAnchor="middle">Transverse Road Distance x (m)</text>
              </svg>
            </div>

            {/* SVG Plot 2: Sight Distance vs Speed */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400">
                Stopping Sight Distance (SSD) vs Design Speed (V) per IRC: 73
              </h3>
              <svg viewBox="0 0 600 200" className="w-full h-48 bg-slate-950 rounded-lg p-2 border border-slate-800/80">
                <line x1="50" y1="160" x2="550" y2="160" stroke="#475569" strokeWidth="1.5" />
                <line x1="50" y1="160" x2="50" y2="30" stroke="#475569" strokeWidth="1.5" />

                {/* SSD Quadratic Curve */}
                <path
                  d="M 50 150 Q 300 120 550 40"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />

                {/* Point for current speed */}
                <circle cx={50 + (geometricState.speedKmph / 120) * 500} cy={160 - (geometricCalc.ssdM / 300) * 130} r="5" fill="#facc15" />

                <text x="50" y="20" fill="#ef4444" fontSize="10">SSD (m)</text>
                <text x="530" y="175" fill="#94a3b8" fontSize="10">Speed (km/h)</text>
              </svg>
            </div>
          </div>
        )}

        {/* View Mode: Derivations */}
        {viewMode === 'derivations' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-300 space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100">Step-by-Step Mathematical Derivations</h2>
              <p className="text-xs text-slate-400">Actual numerical substitutions from current parameters</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-emerald-400 font-bold uppercase">1. Stopping Sight Distance (SSD) — IRC: 73</div>
              <div className="text-slate-400">General Formula: SSD = 0.278 · V · t + V² / [254 · (f ± G)]</div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-200 space-y-1">
                <div>Lag distance = 0.278 × {geometricState.speedKmph} × {geometricState.reactionTimeSec} = {geometricCalc.lagDistanceM} m</div>
                <div>Braking distance = {geometricState.speedKmph}² / [254 × ({geometricState.frictionCoeff} + {geometricState.longitudinalSlopePercent / 100})] = {geometricCalc.brakingDistanceM} m</div>
                <div className="text-emerald-400 font-bold">Total SSD = {geometricCalc.ssdM} m</div>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-emerald-400 font-bold uppercase">2. Superelevation & Extra Widening — IRC: 73</div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-200 space-y-1">
                <div>Design e (75% speed) = {superelevationState.speedKmph}² / (225 × {superelevationState.radiusM}) = {(superelevationCalc.designSuperelevation * 100).toFixed(2)}%</div>
                <div>Mechanical Widening Wm = ({superelevationState.lanes} × {superelevationState.wheelbaseLengthM}²) / (2 × {superelevationState.radiusM}) = {wideningCalc.mechanicalWideningM} m</div>
                <div>Psychological Widening Wps = {superelevationState.speedKmph} / (9.5 × √{superelevationState.radiusM}) = {wideningCalc.psychologicalWideningM} m</div>
                <div className="text-emerald-400 font-bold">Total Extra Widening We = {wideningCalc.totalWideningM} m</div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Observations */}
        {viewMode === 'observations' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-300 space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Laboratory Observation Records</h2>
                <p className="text-xs text-slate-400">Total recorded trials: {trials.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={recordObservation}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow flex items-center gap-1.5 transition"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Record Current State</span>
                </button>
                <button
                  onClick={exportCSV}
                  disabled={trials.length === 0}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-md shadow flex items-center gap-1.5 transition border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {trials.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                No observation trials recorded yet. Adjust parameters and click "Record Current State" or the bottom button in the 3D visualizer.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Module</th>
                      <th className="p-3">Logged Engineering Parameters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono">
                    {trials.map((t) => (
                      <tr key={t.trialNumber} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-emerald-400">{t.trialNumber}</td>
                        <td className="p-3 text-slate-400">{t.timestamp}</td>
                        <td className="p-3 text-slate-300">{t.module}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(t.parameters).map(([k, v]) => (
                              <span key={k} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                                <span className="text-slate-400">{k}:</span> {v}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* View Mode: Concept Quiz */}
        {viewMode === 'quiz' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-300 space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100">Highway Engineering Conceptual Assessment</h2>
              <p className="text-xs text-slate-400">Test your mastery of IRC: 73, IRC: 37, and IRC: 81 design principles</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 1,
                  q: 'Per IRC: 73, what design speed percentage is used to design superelevation counteracting 100% centrifugal force without lateral friction?',
                  options: ['50%', '75%', '90%', '100%'],
                  correct: 1,
                },
                {
                  id: 2,
                  q: 'What is the maximum allowable superelevation (e_max) on plain and rolling terrain according to IRC: 73?',
                  options: ['4.0% (1 in 25)', '7.0% (1 in 14.3)', '10.0% (1 in 10)', '12.0% (1 in 8.3)'],
                  correct: 1,
                },
                {
                  id: 3,
                  q: 'Which component of extra widening on horizontal curves accounts for the rigid rear axle off-tracking?',
                  options: ['Psychological widening', 'Mechanical widening', 'Camber widening', 'Transition widening'],
                  correct: 1,
                },
                {
                  id: 4,
                  q: 'In the Aggregate Impact Test (IS: 2386 Part IV), what is the weight of the hammer and the height of fall?',
                  options: ['13.5-14.0 kg falling 380 mm', '10.0 kg falling 300 mm', '15.0 kg falling 450 mm', '8.17 kg falling 250 mm'],
                  correct: 0,
                },
                {
                  id: 5,
                  q: 'The Benkelman Beam Deflection test (IRC: 81) uses an axle load of:',
                  options: ['4085 kg', '8170 kg (80 kN)', '10200 kg', '6000 kg'],
                  correct: 1,
                },
              ].map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-200">
                    {idx + 1}. {item.q}
                  </div>
                  <div className="space-y-1.5">
                    {item.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[item.id] === optIdx;
                      const isSubmitted = quizScore !== null;
                      const isCorrect = item.correct === optIdx;
                      return (
                        <button
                          key={optIdx}
                          disabled={isSubmitted}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [item.id]: optIdx })}
                          className={`w-full text-left p-2 rounded text-xs transition border flex items-center justify-between ${
                            isSelected
                              ? isSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                                  : 'bg-rose-600/30 border-rose-500 text-rose-300'
                                : 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                              : isSubmitted && isCorrect
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    let score = 0;
                    [1, 1, 1, 0, 1].forEach((ans, i) => {
                      if (quizAnswers[i + 1] === ans) score++;
                    });
                    setQuizScore(score);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow transition"
                >
                  Submit Assessment
                </button>
                {quizScore !== null && (
                  <div className="text-sm font-bold text-emerald-400">
                    Your Score: {quizScore} / 5 ({((quizScore / 5) * 100).toFixed(0)}%)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Printable Laboratory Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-slate-100">Official Laboratory Practical Report</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200 text-xs font-sans">
              {/* Institution Header */}
              <div className="text-center border-b border-slate-800 pb-4 space-y-1">
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                  PiyushDhara — Eduverse Academic Portal
                </h3>
                <p className="text-xs text-slate-400">Department of Civil Engineering • Semester IV</p>
                <p className="text-xs text-emerald-400 font-semibold">
                  Course: U25CE402 — Highway Engineering Practical Report
                </p>
              </div>

              {/* Experiment Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500">Student Name: </span>
                  <span className="font-semibold text-slate-200">Civil Engineering Scholar</span>
                </div>
                <div>
                  <span className="text-slate-500">Date of Experiment: </span>
                  <span className="font-semibold text-slate-200">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Simulation Module: </span>
                  <span className="font-semibold text-emerald-400">{activeSimId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Design Code: </span>
                  <span className="font-semibold text-slate-200">IRC: 73-1980 / IRC: 37-2018</span>
                </div>
              </div>

              {/* Results Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                  Experimental Calculations & Results
                </h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                  <div>Design Speed V = {geometricState.speedKmph} km/h | Radius R = {geometricState.radiusM} m</div>
                  <div>Stopping Sight Distance (SSD) = {geometricCalc.ssdM} m</div>
                  <div>Provided Superelevation e = {(superelevationCalc.providedSuperelevation * 100).toFixed(2)}%</div>
                  <div>Total Extra Widening We = {wideningCalc.totalWideningM} m</div>
                  <div>Total Pavement Thickness = {crossSectionCalc.totalPavementThicknessMm} mm</div>
                </div>
              </div>

              {/* Observation Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                  Logged Observations ({trials.length} Trials)
                </h4>
                {trials.length === 0 ? (
                  <p className="text-slate-500 italic">No trials logged.</p>
                ) : (
                  <div className="border border-slate-800 rounded overflow-hidden">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2">Trial</th>
                          <th className="p-2">Time</th>
                          <th className="p-2">Summary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {trials.map((t) => (
                          <tr key={t.trialNumber}>
                            <td className="p-2 font-bold text-emerald-400">#{t.trialNumber}</td>
                            <td className="p-2 text-slate-400">{t.timestamp}</td>
                            <td className="p-2 font-mono">{JSON.stringify(t.parameters)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Academic Sign-off */}
              <div className="pt-6 border-t border-slate-800 flex justify-between text-slate-400 text-[11px]">
                <div>Verified by Laboratory Instructor: ____________________</div>
                <div>Grade / Evaluation: [ A+ / Satisfactory ]</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
