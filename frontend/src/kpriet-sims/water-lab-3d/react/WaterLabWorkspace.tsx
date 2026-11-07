/**
 * PiyushDhara Eduverse — 3D Water Supply & Wastewater Engineering Laboratory
 * Course: U25CE403 — Water Supply and Wastewater Engineering (Civil Engineering, Semester IV)
 * Master Interactive React Laboratory Workspace
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Droplets,
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
  Award,
  Layers,
  Compass,
  Filter,
  Activity,
  Beaker,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';

import type {
  WaterSimId,
  WaterViewMode,
  IWtpState,
  ISedimentationState,
  IFiltrationState,
  IWastewaterState,
  IDistributionState,
  IWaterQualityLabState,
  IWaterComponentInfo,
  IWaterObservationTrial,
} from '../core/types';
import { EnvironmentalCalculator } from '../core/EnvironmentalCalculator';

import { WaterTreatmentPlantScene } from '../simulations/01-wtp/WaterTreatmentPlantScene';
import { SedimentationClarifierScene } from '../simulations/02-sedimentation/SedimentationClarifierScene';
import { FiltrationBackwashScene } from '../simulations/03-filtration/FiltrationBackwashScene';
import { WastewaterTreatmentScene } from '../simulations/04-wwtp/WastewaterTreatmentScene';
import { DistributionNetworkScene } from '../simulations/05-distribution/DistributionNetworkScene';
import { WaterQualityLabScene } from '../simulations/06-quality-lab/WaterQualityLabScene';
import { BaseWaterSimulation } from '../core/BaseWaterSimulation';

interface IWaterLabWorkspaceProps {
  initialSimId?: WaterSimId;
  onExit?: () => void;
}

const DEFAULT_WTP: IWtpState = {
  plantCapacityMld: 25.0,
  rawTurbidityNtu: 45.0,
  rawColiformMpn: 1500,
  coagulantAlumDoseMgL: 25.0,
  filterMedia: 'dual-anthracite-sand',
  chlorineDoseMgL: 3.0,
  operatingStatus: 'running',
};

const DEFAULT_SEDIMENTATION: ISedimentationState = {
  flowRateM3Hr: 500.0,
  tankType: 'rectangular',
  lengthOrDiameterM: 30.0,
  widthM: 8.0,
  liquidDepthM: 3.5,
  particleDiameterMm: 0.025,
  particleSpecificGravity: 2.65,
  waterTemperatureCelsius: 25,
};

const DEFAULT_FILTRATION: IFiltrationState = {
  filtrationRateM3M2Hr: 5.0,
  bedAreaM2: 45.0,
  sandDepthM: 0.65,
  effectiveSizeD10Mm: 0.55,
  uniformityCoeffCu: 1.5,
  sandPorosity: 0.42,
  operatingHours: 14,
  isBackwashing: false,
  backwashRiseRateMMin: 0.65,
};

const DEFAULT_WASTEWATER: IWastewaterState = {
  influentFlowM3Day: 12000,
  influentBod5MgL: 220,
  effluentBod5TargetMgL: 20,
  aerationTankVolumeM3: 3500,
  mlssMgL: 3200,
  sludgeRetentionTimeDays: 8.0,
  recycleRatioR: 0.35,
  aerationType: 'diffused-air',
};

const DEFAULT_DISTRIBUTION: IDistributionState = {
  reservoirHeadM: 45.0,
  pipeLengthM: 1200,
  pipeDiameterMm: 250,
  pipeRoughnessC: 120,
  nodeDemandLps: 42.0,
  sewerDiameterMm: 350,
  sewerSlopeRatio: 250,
  manningN: 0.013,
  sewerDepthRatio: 0.6,
};

const DEFAULT_QUALITY_LAB: IWaterQualityLabState = {
  selectedTest: 'jar-test',
  waterSampleType: 'river-raw',
  coagulantDosesMgL: [10, 20, 30, 40, 50, 60],
  measuredTurbiditiesNtu: [28, 14, 4.2, 1.8, 1.2, 2.5],
  initialDoMgL: 8.4,
  dilutionFactorP: 0.03,
  incubatedDoMgL: 3.2,
  fasTiterBlankMl: 24.5,
  fasTiterSampleMl: 14.8,
  fasNormality: 0.1,
  sampleVolumeMl: 50.0,
};

export const WaterLabWorkspace: React.FC<IWaterLabWorkspaceProps> = ({
  initialSimId = 'u25ce403-water-treatment-plant',
  onExit,
}) => {
  const [activeSimId, setActiveSimId] = useState<WaterSimId>(initialSimId);
  const [viewMode, setViewMode] = useState<WaterViewMode>('visualizer');

  // Module States
  const [wtpState, setWtpState] = useState<IWtpState>(DEFAULT_WTP);
  const [sedimentationState, setSedimentationState] = useState<ISedimentationState>(DEFAULT_SEDIMENTATION);
  const [filtrationState, setFiltrationState] = useState<IFiltrationState>(DEFAULT_FILTRATION);
  const [wastewaterState, setWastewaterState] = useState<IWastewaterState>(DEFAULT_WASTEWATER);
  const [distributionState, setDistributionState] = useState<IDistributionState>(DEFAULT_DISTRIBUTION);
  const [qualityLabState, setQualityLabState] = useState<IWaterQualityLabState>(DEFAULT_QUALITY_LAB);

  // UI States
  const [selectedComponent, setSelectedComponent] = useState<IWaterComponentInfo | null>(null);
  const [isCutaway, setIsCutaway] = useState<boolean>(false);
  const [trials, setTrials] = useState<IWaterObservationTrial[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Ready');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simInstanceRef = useRef<BaseWaterSimulation | null>(null);

  // Initialize and mount 3D Scene
  useEffect(() => {
    if (!canvasRef.current) return;

    if (simInstanceRef.current) {
      simInstanceRef.current.dispose();
      simInstanceRef.current = null;
    }

    const options = {
      canvas: canvasRef.current,
      onComponentSelected: (info: IWaterComponentInfo) => setSelectedComponent(info),
      onStatusChange: (status: string) => setStatusMessage(status),
    };

    switch (activeSimId) {
      case 'u25ce403-water-treatment-plant': {
        const scene = new WaterTreatmentPlantScene(options);
        scene.updateFlowRate(wtpState.plantCapacityMld);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce403-sedimentation-clarifier': {
        const scene = new SedimentationClarifierScene(options);
        scene.rebuildTank(sedimentationState);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce403-filtration-backwash': {
        const scene = new FiltrationBackwashScene(options);
        scene.rebuildFilter(filtrationState);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce403-wastewater-treatment': {
        const scene = new WastewaterTreatmentScene(options);
        scene.rebuildPlant(wastewaterState);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce403-distribution-network': {
        const scene = new DistributionNetworkScene(options);
        scene.rebuildNetwork(distributionState);
        simInstanceRef.current = scene;
        break;
      }
      case 'u25ce403-water-quality-lab': {
        const scene = new WaterQualityLabScene(options);
        scene.setTest(qualityLabState.selectedTest);
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

  // Handle Cutaway / Exploded View
  useEffect(() => {
    if (simInstanceRef.current) {
      simInstanceRef.current.setCutawayView(isCutaway);
    }
  }, [isCutaway]);

  // Live Calculations via EnvironmentalCalculator
  const wtpCalc = useMemo(() => EnvironmentalCalculator.calculateWtpUnits(wtpState), [wtpState]);
  const sedCalc = useMemo(() => EnvironmentalCalculator.calculateSedimentation(sedimentationState), [sedimentationState]);
  const filtCalc = useMemo(() => EnvironmentalCalculator.calculateFiltration(filtrationState), [filtrationState]);
  const wwtpCalc = useMemo(() => EnvironmentalCalculator.calculateActivatedSludge(wastewaterState), [wastewaterState]);
  const distCalc = useMemo(() => EnvironmentalCalculator.calculateDistribution(distributionState), [distributionState]);
  const labCalc = useMemo(() => EnvironmentalCalculator.calculateQualityTest(qualityLabState), [qualityLabState]);

  // Reset Camera
  const handleResetCamera = () => {
    if (simInstanceRef.current) {
      simInstanceRef.current.resetCamera();
    }
  };

  // Add trial to observation table
  const handleRecordTrial = () => {
    const trialNum = trials.length + 1;
    const now = new Date().toLocaleTimeString();

    let newTrial: IWaterObservationTrial;

    if (activeSimId === 'u25ce403-water-treatment-plant') {
      newTrial = {
        trialNumber: trialNum,
        timestamp: now,
        module: 'Conventional WTP',
        parameters: {
          'Capacity (MLD)': wtpState.plantCapacityMld,
          'Raw Turbidity (NTU)': wtpState.rawTurbidityNtu,
          'Alum Dose (mg/L)': wtpState.coagulantAlumDoseMgL,
          'Chlorine (mg/L)': wtpState.chlorineDoseMgL,
        },
        results: {
          'Effluent Turbidity': `${wtpCalc.effluentTurbidityNtu.toFixed(2)} NTU`,
          'Daily Alum': `${wtpCalc.dailyAlumMassKg.toFixed(1)} kg/day`,
          'Clear Sump Vol': `${wtpCalc.totalPlantVolumeM3.toFixed(0)} m³`,
          Compliance: wtpCalc.meetsBis10500 ? 'BIS 10500 PASSED' : 'NON-COMPLIANT',
        },
      };
    } else if (activeSimId === 'u25ce403-sedimentation-clarifier') {
      newTrial = {
        trialNumber: trialNum,
        timestamp: now,
        module: 'Sedimentation & Clarifier',
        parameters: {
          'Flow Rate (m³/h)': sedimentationState.flowRateM3Hr,
          'Length (m)': sedimentationState.lengthOrDiameterM,
          'Width (m)': sedimentationState.widthM,
          'Particle d (mm)': sedimentationState.particleDiameterMm,
        },
        results: {
          'HRT (hrs)': `${sedCalc.retentionTimeHours.toFixed(2)} hr`,
          'SOR (m³/m²·d)': `${sedCalc.surfaceOverflowRateM3M2Day.toFixed(1)} m³/m²·d`,
          'Settling Vs': `${sedCalc.settlingVelocityMmS.toFixed(3)} mm/s`,
          'Removal %': `${sedCalc.removalEfficiencyPercent.toFixed(1)} %`,
        },
      };
    } else if (activeSimId === 'u25ce403-filtration-backwash') {
      newTrial = {
        trialNumber: trialNum,
        timestamp: now,
        module: 'Rapid Sand Filter & Backwash',
        parameters: {
          'Filtration Rate (m/h)': filtrationState.filtrationRateM3M2Hr,
          'Bed Area (m²)': filtrationState.bedAreaM2,
          'Run Time (hr)': filtrationState.operatingHours,
          'Backwash Rise (m/min)': filtrationState.backwashRiseRateMMin,
        },
        results: {
          'Clean Head Loss': `${filtCalc.cleanBedHeadLossM.toFixed(2)} m`,
          'Clogged Head Loss': `${filtCalc.cloggedHeadLossM.toFixed(2)} m`,
          'Bed Expansion': `${filtCalc.bedExpansionPercent.toFixed(1)} %`,
          Status: filtCalc.isTerminalHeadLossReached ? 'TERMINAL LOSS REACHED' : 'NORMAL OPERATION',
        },
      };
    } else if (activeSimId === 'u25ce403-wastewater-treatment') {
      newTrial = {
        trialNumber: trialNum,
        timestamp: now,
        module: 'Activated Sludge WWTP',
        parameters: {
          'Flow (m³/d)': wastewaterState.influentFlowM3Day,
          'Raw BOD (mg/L)': wastewaterState.influentBod5MgL,
          'MLSS (mg/L)': wastewaterState.mlssMgL,
          'SRT (days)': wastewaterState.sludgeRetentionTimeDays,
        },
        results: {
          'HRT (hrs)': `${wwtpCalc.hydraulicRetentionTimeHours.toFixed(2)} hr`,
          'F/M Ratio': `${wwtpCalc.fmRatioKgBodKgMlssDay.toFixed(3)} kg/kg·d`,
          'Effluent BOD': `${wwtpCalc.effluentBodMgL.toFixed(1)} mg/L`,
          'BOD Removal': `${wwtpCalc.bodRemovalEfficiencyPercent.toFixed(1)} %`,
        },
      };
    } else if (activeSimId === 'u25ce403-distribution-network') {
      newTrial = {
        trialNumber: trialNum,
        timestamp: now,
        module: 'Water Distribution & Sewer',
        parameters: {
          'Res. Head (m)': distributionState.reservoirHeadM,
          'Pipe Dia (mm)': distributionState.pipeDiameterMm,
          'Sewer Slope (1:N)': distributionState.sewerSlopeRatio,
          'd/D Ratio': distributionState.sewerDepthRatio,
        },
        results: {
          'Pipe Velocity': `${distCalc.flowVelocityMS.toFixed(2)} m/s`,
          'Residual Head': `${distCalc.residualPressureHeadM.toFixed(2)} m`,
          'Sewer Velocity': `${distCalc.sewerActualVelocityMS.toFixed(2)} m/s`,
          'Self-Cleansing': distCalc.isSelfCleansing ? 'YES (≥0.6 m/s)' : 'NO (<0.6 m/s)',
        },
      };
    } else {
      newTrial = {
        trialNumber: trialNum,
        timestamp: now,
        module: `Lab: ${qualityLabState.selectedTest}`,
        parameters: {
          'Sample Type': qualityLabState.waterSampleType,
          Test: qualityLabState.selectedTest,
        },
        results: {
          'Measured Value': `${labCalc.primaryValue.toFixed(2)} ${labCalc.unit}`,
          Limit: labCalc.standardLimit,
          Rating: labCalc.complianceRating.toUpperCase(),
        },
      };
    }

    setTrials((prev) => [newTrial, ...prev]);
  };

  // Export Trials as CSV
  const handleExportCSV = () => {
    if (trials.length === 0) return;
    const headers = ['Trial #', 'Timestamp', 'Module', 'Parameters', 'Results'];
    const rows = trials.map((t) => [
      t.trialNumber,
      `"${t.timestamp}"`,
      `"${t.module}"`,
      `"${Object.entries(t.parameters)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}"`,
      `"${Object.entries(t.results)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PiyushDhara_U25CE403_WaterLab_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quiz Questions per syllabus
  const quizQuestions = useMemo(() => {
    return [
      {
        id: 1,
        question:
          'According to BIS 10500:2012 Drinking Water Specification, what is the maximum acceptable limit for turbidity in treated potable water?',
        options: [
          '1.0 NTU (acceptable) and 5.0 NTU (permissible in absence of alternate source)',
          '10.0 NTU (acceptable) and 25.0 NTU (permissible)',
          '0.1 NTU (acceptable) and 1.0 NTU (permissible)',
          '15.0 NTU (acceptable) and 50.0 NTU (permissible)',
        ],
        correct: 0,
        explanation:
          'Per BIS 10500:2012 Clause 4.1 Table 1, the acceptable limit for turbidity is 1.0 NTU, and in the absence of an alternate water source, it may be relaxed up to 5.0 NTU.',
      },
      {
        id: 2,
        question:
          "In a rectangular sedimentation tank, if the particle settling velocity Vs is equal to the Surface Overflow Rate (SOR = Q/As), what percentage of such particles will be removed under ideal Stokes' settling?",
        options: ['100%', '50%', '75%', '25%'],
        correct: 0,
        explanation:
          "Under ideal settling assumptions (Camp's theory), all particles having a settling velocity Vs >= SOR will achieve 100% theoretical removal regardless of their entry height at the inlet.",
      },
      {
        id: 3,
        question:
          'During rapid sand filter backwashing, what upward fluidization rise rate is recommended by CPHEEO to achieve 25% to 30% sand bed expansion?',
        options: ['0.45 to 0.75 m/min (45 to 75 cm/min)', '0.05 to 0.10 m/min', '1.50 to 2.50 m/min', '3.0 to 5.0 m/min'],
        correct: 0,
        explanation:
          'CPHEEO Water Supply Manual specifies a backwash rise rate of 45 to 75 cm/min (0.45 to 0.75 m/min) to achieve 20% to 30% fluidized expansion of clean quartz filter sand.',
      },
      {
        id: 4,
        question:
          'What is the typical Food-to-Microorganism (F/M) ratio in a conventional completely mixed Activated Sludge Process (ASP)?',
        options: [
          '0.20 to 0.40 kg BOD5 / (kg MLSS · day)',
          '1.20 to 2.50 kg BOD5 / (kg MLSS · day)',
          '0.01 to 0.05 kg BOD5 / (kg MLSS · day)',
          '5.0 to 10.0 kg BOD5 / (kg MLSS · day)',
        ],
        correct: 0,
        explanation:
          'A conventional completely mixed aeration basin is operated at an F/M ratio of 0.2 to 0.4 kg BOD5/(kg MLSS·day) with a hydraulic retention time of 4 to 8 hours and MLSS of 2500–4000 mg/L.',
      },
      {
        id: 5,
        question:
          'Why must sanitary gravity sewers be designed to achieve a minimum self-cleansing velocity of 0.6 m/s at least once daily (CPHEEO Sewerage Manual)?',
        options: [
          'To prevent the deposition and settlement of heavy mineral grit, sand, and organic solids',
          'To minimize structural friction loss in PVC pipes',
          'To prevent hydraulic water hammer during peak hours',
          'To maintain laminar flow throughout the sewer network',
        ],
        correct: 0,
        explanation:
          'CPHEEO Sewerage Manual requires a minimum self-cleansing velocity of 0.60 m/s for partial flow (and 0.80 m/s for full flow) to scour out deposited grit and keep solids in suspension.',
      },
    ];
  }, []);

  const handleQuizAnswer = (qIndex: number, optIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleEvaluateQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    setQuizScore(score);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* ─── Top Header Bar ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-emerald-900/40 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400">
            <Droplets className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-wide text-white uppercase">
                PiyushDhara Eduverse — Water & Wastewater Engineering
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                U25CE403 · Sem IV
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 3D Virtual Treatment Plant, Hydraulic Networks & Water Analysis Laboratory
            </p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('visualizer')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'visualizer'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Visualizer</span>
          </button>
          <button
            onClick={() => setViewMode('curves')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'curves'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Process Curves</span>
          </button>
          <button
            onClick={() => setViewMode('derivations')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'derivations'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Formulas & Math</span>
          </button>
          <button
            onClick={() => setViewMode('observations')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'observations'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Trials ({trials.length})</span>
          </button>
          <button
            onClick={() => setViewMode('theory')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'theory'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory & Specs</span>
          </button>
          <button
            onClick={() => setViewMode('quiz')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'quiz'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Quiz</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
            title="Generate Formal Engineering Laboratory Practical Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Lab Report</span>
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="p-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 rounded-lg transition-all"
              title="Close Laboratory"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ─── Simulation Module Selector Ribbon ─────────────────────────── */}
      <nav className="flex items-center space-x-1.5 px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto text-xs shrink-0 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Modules:</span>
        <button
          onClick={() => setActiveSimId('u25ce403-water-treatment-plant')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
            activeSimId === 'u25ce403-water-treatment-plant'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          1. Water Treatment Plant (WTP)
        </button>
        <button
          onClick={() => setActiveSimId('u25ce403-sedimentation-clarifier')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
            activeSimId === 'u25ce403-sedimentation-clarifier'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          2. Sedimentation & Clarifier
        </button>
        <button
          onClick={() => setActiveSimId('u25ce403-filtration-backwash')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
            activeSimId === 'u25ce403-filtration-backwash'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          3. Filtration & Backwashing
        </button>
        <button
          onClick={() => setActiveSimId('u25ce403-wastewater-treatment')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
            activeSimId === 'u25ce403-wastewater-treatment'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          4. Activated Sludge WWTP
        </button>
        <button
          onClick={() => setActiveSimId('u25ce403-distribution-network')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
            activeSimId === 'u25ce403-distribution-network'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          5. Distribution & Sewer Network
        </button>
        <button
          onClick={() => setActiveSimId('u25ce403-water-quality-lab')}
          className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
            activeSimId === 'u25ce403-water-quality-lab'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          6. Water Quality Virtual Lab
        </button>
      </nav>

      {/* ─── Main Content Body ─────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* VIEW MODE: 3D Visualizer */}
        {viewMode === 'visualizer' && (
          <div className="flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden">
            {/* 3D WebGL Canvas Viewport */}
            <div className="flex-1 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col min-h-[300px]">
              <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing outline-none" />

              {/* Viewport Overlay Controls */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10">
                <button
                  onClick={handleResetCamera}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg text-xs font-medium backdrop-blur-md transition-all shadow-md active:scale-95"
                  title="Reset 3D Camera"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reset Camera</span>
                </button>
                <button
                  onClick={() => setIsCutaway((prev) => !prev)}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 border rounded-lg text-xs font-medium backdrop-blur-md transition-all shadow-md active:scale-95 ${
                    isCutaway
                      ? 'bg-emerald-600/90 text-white border-emerald-400'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/60'
                  }`}
                  title="Toggle Cutaway Internal Cross-Section"
                >
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>{isCutaway ? 'Solid View' : 'Cutaway Section'}</span>
                </button>
                <button
                  onClick={handleRecordTrial}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-teal-600/90 hover:bg-teal-500 text-white border border-teal-400 rounded-lg text-xs font-medium backdrop-blur-md transition-all shadow-md active:scale-95"
                  title="Log Current Operating Parameters & Computed Results"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Record Trial</span>
                </button>
              </div>

              {/* Active Component Inspection Card */}
              {selectedComponent && (
                <div className="absolute bottom-4 left-4 max-w-sm p-3.5 bg-slate-900/90 border border-emerald-500/40 rounded-xl backdrop-blur-md text-xs shadow-2xl z-20 transition-all animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                    <span className="font-bold text-emerald-300">{selectedComponent.name}</span>
                    <button
                      onClick={() => setSelectedComponent(null)}
                      className="text-slate-400 hover:text-white p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-2">{selectedComponent.description}</p>
                  {selectedComponent.specReference && (
                    <div className="text-[11px] text-emerald-400 font-mono mb-1">
                      <span className="text-slate-500">Spec: </span>
                      {selectedComponent.specReference}
                    </div>
                  )}
                  {selectedComponent.formula && (
                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-amber-300">
                      {selectedComponent.formula}
                    </div>
                  )}
                </div>
              )}

              {/* Status Bar */}
              <div className="absolute bottom-2 right-3 text-[11px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-sm">
                Status: <span className="text-emerald-400 font-medium">{statusMessage}</span>
              </div>
            </div>

            {/* Right Side Control & Telemetry Panel */}
            <aside className="w-full md:w-96 bg-slate-900/80 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col h-full overflow-y-auto">
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Engineering Controls & Telemetry
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-5">
                {/* ─── MODULE 1: WTP CONTROLS ─── */}
                {activeSimId === 'u25ce403-water-treatment-plant' && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Plant Flow Capacity: <span className="text-emerald-400 font-bold">{wtpState.plantCapacityMld} MLD</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="5.0"
                        max="100.0"
                        step="5.0"
                        value={wtpState.plantCapacityMld}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setWtpState((prev) => ({ ...prev, plantCapacityMld: val }));
                          if (simInstanceRef.current instanceof WaterTreatmentPlantScene) {
                            simInstanceRef.current.updateFlowRate(val);
                          }
                        }}
                        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>5 MLD (Small Town)</span>
                        <span>100 MLD (Metro Zone)</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Raw Turbidity: <span className="text-amber-400 font-bold">{wtpState.rawTurbidityNtu} NTU</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="10.0"
                        max="200.0"
                        step="5.0"
                        value={wtpState.rawTurbidityNtu}
                        onChange={(e) => setWtpState((prev) => ({ ...prev, rawTurbidityNtu: parseFloat(e.target.value) }))}
                        className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Alum Coagulant Dose: <span className="text-teal-400 font-bold">{wtpState.coagulantAlumDoseMgL} mg/L</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="5.0"
                        max="50.0"
                        step="2.5"
                        value={wtpState.coagulantAlumDoseMgL}
                        onChange={(e) => setWtpState((prev) => ({ ...prev, coagulantAlumDoseMgL: parseFloat(e.target.value) }))}
                        className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Disinfection Chlorine: <span className="text-blue-400 font-bold">{wtpState.chlorineDoseMgL} mg/L</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="8.0"
                        step="0.5"
                        value={wtpState.chlorineDoseMgL}
                        onChange={(e) => setWtpState((prev) => ({ ...prev, chlorineDoseMgL: parseFloat(e.target.value) }))}
                        className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Live Engineering Telemetry Cards */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        BIS 10500 Performance Telemetry
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Clarified Turbidity</div>
                          <div className="text-base font-bold text-emerald-400">
                            {wtpCalc.effluentTurbidityNtu.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">NTU</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Limit: ≤ 1.0 NTU</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Daily Alum Mass</div>
                          <div className="text-base font-bold text-teal-400">
                            {wtpCalc.dailyAlumMassKg.toFixed(0)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">kg/d</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Al2(SO4)3 · 18H2O</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Daily Chlorine Mass</div>
                          <div className="text-base font-bold text-blue-400">
                            {wtpCalc.dailyChlorineMassKg.toFixed(1)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">kg/d</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Gas Chlorination</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Clear Water Sump</div>
                          <div className="text-base font-bold text-cyan-400">
                            {wtpCalc.totalPlantVolumeM3.toFixed(0)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">m³</span>
                          </div>
                          <div className="text-[10px] text-slate-400">2.0 hr Bal. Storage</div>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-700/50 flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-emerald-300">
                          <strong>BIS 10500:2012 Certified:</strong> Treated water satisfies potable standard with residual free chlorine ≥ 0.2 mg/L at clear water sump outlet.
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── MODULE 2: SEDIMENTATION CONTROLS ─── */}
                {activeSimId === 'u25ce403-sedimentation-clarifier' && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Inflow Rate (Q): <span className="text-emerald-400 font-bold">{sedimentationState.flowRateM3Hr} m³/hr</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="1500"
                        step="50"
                        value={sedimentationState.flowRateM3Hr}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSedimentationState((prev) => ({ ...prev, flowRateM3Hr: val }));
                          if (simInstanceRef.current instanceof SedimentationClarifierScene) {
                            simInstanceRef.current.rebuildTank({ ...sedimentationState, flowRateM3Hr: val });
                          }
                        }}
                        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Tank Length (L): <span className="text-cyan-400 font-bold">{sedimentationState.lengthOrDiameterM} m</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="50"
                        step="1"
                        value={sedimentationState.lengthOrDiameterM}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSedimentationState((prev) => ({ ...prev, lengthOrDiameterM: val }));
                          if (simInstanceRef.current instanceof SedimentationClarifierScene) {
                            simInstanceRef.current.rebuildTank({ ...sedimentationState, lengthOrDiameterM: val });
                          }
                        }}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Particle Diameter (d): <span className="text-amber-400 font-bold">{sedimentationState.particleDiameterMm} mm</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="0.010"
                        max="0.060"
                        step="0.005"
                        value={sedimentationState.particleDiameterMm}
                        onChange={(e) =>
                          setSedimentationState((prev) => ({ ...prev, particleDiameterMm: parseFloat(e.target.value) }))
                        }
                        className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-slate-500">Fine silt (0.01mm) to medium sand (0.06mm)</div>
                    </div>

                    {/* Settling Telemetry */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Stokes' Settling Telemetry
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Settling Velocity (Vs)</div>
                          <div className="text-base font-bold text-amber-400">
                            {sedCalc.settlingVelocityMmS.toFixed(3)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">mm/s</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Stokes' Law (Re &lt; 1)</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Surface Overflow Rate</div>
                          <div className="text-base font-bold text-emerald-400">
                            {sedCalc.surfaceOverflowRateM3M2Day.toFixed(1)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">m³/m²·d</span>
                          </div>
                          <div className="text-[10px] text-slate-400">CPHEEO: 30-40 m³/m²·d</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Retention Time (t0)</div>
                          <div className="text-base font-bold text-cyan-400">
                            {sedCalc.retentionTimeHours.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">hours</span>
                          </div>
                          <div className="text-[10px] text-slate-400">t0 = V / Q</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Removal Efficiency</div>
                          <div className="text-base font-bold text-teal-300">
                            {sedCalc.removalEfficiencyPercent.toFixed(1)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">%</span>
                          </div>
                          <div className="text-[10px] text-slate-400">η = (Vs / SOR) × 100</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── MODULE 3: FILTRATION CONTROLS ─── */}
                {activeSimId === 'u25ce403-filtration-backwash' && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Filtration Rate: <span className="text-emerald-400 font-bold">{filtrationState.filtrationRateM3M2Hr} m/h</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="3.0"
                        max="8.0"
                        step="0.5"
                        value={filtrationState.filtrationRateM3M2Hr}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setFiltrationState((prev) => ({ ...prev, filtrationRateM3M2Hr: val }));
                          if (simInstanceRef.current instanceof FiltrationBackwashScene) {
                            simInstanceRef.current.rebuildFilter({ ...filtrationState, filtrationRateM3M2Hr: val });
                          }
                        }}
                        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-slate-500">CPHEEO Rapid Sand Filter: 4.8 – 6.0 m/h</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Filter Run Time: <span className="text-cyan-400 font-bold">{filtrationState.operatingHours} hours</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="36"
                        step="1"
                        value={filtrationState.operatingHours}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFiltrationState((prev) => ({ ...prev, operatingHours: val }));
                          if (simInstanceRef.current instanceof FiltrationBackwashScene) {
                            simInstanceRef.current.rebuildFilter({ ...filtrationState, operatingHours: val });
                          }
                        }}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Backwash Rise Rate: <span className="text-blue-400 font-bold">{filtrationState.backwashRiseRateMMin} m/min</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="0.30"
                        max="0.90"
                        step="0.05"
                        value={filtrationState.backwashRiseRateMMin}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setFiltrationState((prev) => ({ ...prev, backwashRiseRateMMin: val }));
                          if (simInstanceRef.current instanceof FiltrationBackwashScene) {
                            simInstanceRef.current.rebuildFilter({ ...filtrationState, backwashRiseRateMMin: val });
                          }
                        }}
                        className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-slate-500">Standard rise velocity: 45 to 75 cm/min</div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          const nextState = !filtrationState.isBackwashing;
                          setFiltrationState((prev) => ({ ...prev, isBackwashing: nextState }));
                          if (simInstanceRef.current instanceof FiltrationBackwashScene) {
                            simInstanceRef.current.setBackwashMode(nextState);
                          }
                        }}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 ${
                          filtrationState.isBackwashing
                            ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                            : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white'
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>{filtrationState.isBackwashing ? 'Stop Backwashing (Restore Filtering)' : 'Initiate Backwash Cycle'}</span>
                      </button>
                    </div>

                    {/* Filter Telemetry */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Carman-Kozeny & Fair-Geyer Telemetry
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Clean Bed Head Loss</div>
                          <div className="text-base font-bold text-emerald-400">
                            {filtCalc.cleanBedHeadLossM.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">m</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Carman-Kozeny eq.</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Current Head Loss</div>
                          <div
                            className={`text-base font-bold ${
                              filtCalc.isTerminalHeadLossReached ? 'text-rose-400' : 'text-cyan-400'
                            }`}
                          >
                            {filtCalc.cloggedHeadLossM.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">m</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Terminal Max: 2.50 m</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Bed Expansion</div>
                          <div className="text-base font-bold text-blue-400">
                            {filtCalc.bedExpansionPercent.toFixed(1)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">%</span>
                          </div>
                          <div className="text-[10px] text-slate-400">CPHEEO Target: 25-30%</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Washwater Volume</div>
                          <div className="text-base font-bold text-teal-400">
                            {filtCalc.backwashWashwaterRequiredM3.toFixed(0)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">m³</span>
                          </div>
                          <div className="text-[10px] text-slate-400">10 min Wash Cycle</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── MODULE 4: WASTEWATER CONTROLS ─── */}
                {activeSimId === 'u25ce403-wastewater-treatment' && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Sewage Flow (Q): <span className="text-emerald-400 font-bold">{wastewaterState.influentFlowM3Day} m³/d</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="3000"
                        max="30000"
                        step="1000"
                        value={wastewaterState.influentFlowM3Day}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setWastewaterState((prev) => ({ ...prev, influentFlowM3Day: val }));
                          if (simInstanceRef.current instanceof WastewaterTreatmentScene) {
                            simInstanceRef.current.rebuildPlant({ ...wastewaterState, influentFlowM3Day: val });
                          }
                        }}
                        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Raw BOD5: <span className="text-amber-400 font-bold">{wastewaterState.influentBod5MgL} mg/L</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="500"
                        step="10"
                        value={wastewaterState.influentBod5MgL}
                        onChange={(e) =>
                          setWastewaterState((prev) => ({ ...prev, influentBod5MgL: parseFloat(e.target.value) }))
                        }
                        className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          MLSS Concentration: <span className="text-cyan-400 font-bold">{wastewaterState.mlssMgL} mg/L</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="1500"
                        max="5000"
                        step="100"
                        value={wastewaterState.mlssMgL}
                        onChange={(e) =>
                          setWastewaterState((prev) => ({ ...prev, mlssMgL: parseFloat(e.target.value) }))
                        }
                        className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-slate-500">Standard Activated Sludge: 2500 – 4000 mg/L</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Sludge Age (SRT θc): <span className="text-purple-400 font-bold">{wastewaterState.sludgeRetentionTimeDays} days</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="15"
                        step="0.5"
                        value={wastewaterState.sludgeRetentionTimeDays}
                        onChange={(e) =>
                          setWastewaterState((prev) => ({
                            ...prev,
                            sludgeRetentionTimeDays: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Activated Sludge Telemetry */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Biological Kinetics & CPCB Telemetry
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">F/M Ratio</div>
                          <div className="text-base font-bold text-emerald-400">
                            {wwtpCalc.fmRatioKgBodKgMlssDay.toFixed(3)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">kg/kg·d</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Range: 0.2 – 0.4</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Effluent BOD5</div>
                          <div className="text-base font-bold text-cyan-400">
                            {wwtpCalc.effluentBodMgL.toFixed(1)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">mg/L</span>
                          </div>
                          <div className="text-[10px] text-slate-400">CPCB Limit: ≤ 30 mg/L</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">BOD Removal Eff.</div>
                          <div className="text-base font-bold text-teal-300">
                            {wwtpCalc.bodRemovalEfficiencyPercent.toFixed(1)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">%</span>
                          </div>
                          <div className="text-[10px] text-slate-400">High rate biological</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Excess Sludge (Px)</div>
                          <div className="text-base font-bold text-purple-400">
                            {wwtpCalc.excessSludgeProductionKgDay.toFixed(0)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">kg/d</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Dry solids wasted</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── MODULE 5: DISTRIBUTION CONTROLS ─── */}
                {activeSimId === 'u25ce403-distribution-network' && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Reservoir Head: <span className="text-emerald-400 font-bold">{distributionState.reservoirHeadM} m</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="60"
                        step="1"
                        value={distributionState.reservoirHeadM}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setDistributionState((prev) => ({ ...prev, reservoirHeadM: val }));
                          if (simInstanceRef.current instanceof DistributionNetworkScene) {
                            simInstanceRef.current.rebuildNetwork({ ...distributionState, reservoirHeadM: val });
                          }
                        }}
                        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Pipe Diameter: <span className="text-cyan-400 font-bold">{distributionState.pipeDiameterMm} mm</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="150"
                        max="500"
                        step="25"
                        value={distributionState.pipeDiameterMm}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setDistributionState((prev) => ({ ...prev, pipeDiameterMm: val }));
                          if (simInstanceRef.current instanceof DistributionNetworkScene) {
                            simInstanceRef.current.rebuildNetwork({ ...distributionState, pipeDiameterMm: val });
                          }
                        }}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Sewer Gradient: <span className="text-amber-400 font-bold">1 in {distributionState.sewerSlopeRatio}</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="600"
                        step="25"
                        value={distributionState.sewerSlopeRatio}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setDistributionState((prev) => ({ ...prev, sewerSlopeRatio: val }));
                          if (simInstanceRef.current instanceof DistributionNetworkScene) {
                            simInstanceRef.current.rebuildNetwork({ ...distributionState, sewerSlopeRatio: val });
                          }
                        }}
                        className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">
                          Sewer Flow Depth (d/D): <span className="text-blue-400 font-bold">{distributionState.sewerDepthRatio.toFixed(2)}</span>
                        </label>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="0.9"
                        step="0.05"
                        value={distributionState.sewerDepthRatio}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setDistributionState((prev) => ({ ...prev, sewerDepthRatio: val }));
                          if (simInstanceRef.current instanceof DistributionNetworkScene) {
                            simInstanceRef.current.rebuildNetwork({ ...distributionState, sewerDepthRatio: val });
                          }
                        }}
                        className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="text-[10px] text-slate-500">Max design depth ratio: 0.8 (for ventilation)</div>
                    </div>

                    {/* Network & Sewer Telemetry */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Hydraulics & Self-Cleansing Telemetry
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Water Pipe Velocity</div>
                          <div className="text-base font-bold text-emerald-400">
                            {distCalc.flowVelocityMS.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">m/s</span>
                          </div>
                          <div className="text-[10px] text-slate-400">CPHEEO: 0.9 – 1.8 m/s</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Residual Pressure</div>
                          <div className="text-base font-bold text-cyan-400">
                            {distCalc.residualPressureHeadM.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">m</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Min. required: 12 m</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Sewer Flow Velocity</div>
                          <div
                            className={`text-base font-bold ${
                              distCalc.isSelfCleansing ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {distCalc.sewerActualVelocityMS.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">m/s</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Self-Cleansing: ≥ 0.6 m/s</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[10px] text-slate-500">Full Sewer Capacity</div>
                          <div className="text-base font-bold text-amber-400">
                            {distCalc.sewerFullCapacityLps.toFixed(1)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">L/s</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Manning's formula</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── MODULE 6: WATER QUALITY LAB CONTROLS ─── */}
                {activeSimId === 'u25ce403-water-quality-lab' && (
                  <>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-300">Select Prescribed Experiment:</label>
                      <select
                        value={qualityLabState.selectedTest}
                        onChange={(e) => {
                          const val = e.target.value as IWaterQualityLabState['selectedTest'];
                          setQualityLabState((prev) => ({ ...prev, selectedTest: val }));
                          if (simInstanceRef.current instanceof WaterQualityLabScene) {
                            simInstanceRef.current.setTest(val);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="jar-test">Ex 1: Coagulation Jar Test (Alum Optimization)</option>
                        <option value="do-winkler">Ex 2: Dissolved Oxygen (Azide Winkler Method)</option>
                        <option value="bod5">Ex 3: 5-Day Biochemical Oxygen Demand (BOD5)</option>
                        <option value="cod-reflux">Ex 4: Chemical Oxygen Demand (COD Closed Reflux)</option>
                        <option value="turbidity-ph">Ex 5: Nephelometric Turbidity & Digital pH</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-300">Water Sample Source:</label>
                      <select
                        value={qualityLabState.waterSampleType}
                        onChange={(e) => {
                          const val = e.target.value as IWaterQualityLabState['waterSampleType'];
                          setQualityLabState((prev) => ({ ...prev, waterSampleType: val }));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="river-raw">Bhavani River Raw Intake</option>
                        <option value="clarified-water">Clariflocculator Settled Water</option>
                        <option value="treated-tap">Campus Potable Distribution Tap</option>
                        <option value="domestic-sewage">Hostel Domestic Sewage</option>
                        <option value="industrial-effluent">Textile SIPCOT Industrial Effluent</option>
                      </select>
                    </div>

                    {qualityLabState.selectedTest === 'jar-test' && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-300">6-Paddle Jar Test Readings:</div>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                          {qualityLabState.coagulantDosesMgL.map((dose, i) => (
                            <div key={i} className="p-1.5 bg-slate-950 rounded border border-slate-800 text-center">
                              <div className="text-slate-400 font-mono">{dose} mg/L</div>
                              <div className="text-emerald-400 font-bold">
                                {qualityLabState.measuredTurbiditiesNtu[i]} NTU
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {qualityLabState.selectedTest === 'bod5' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-slate-300">
                            Day 0 DO (D1): <span className="text-emerald-400 font-bold">{qualityLabState.initialDoMgL} mg/L</span>
                          </label>
                        </div>
                        <input
                          type="range"
                          min="6.0"
                          max="9.0"
                          step="0.1"
                          value={qualityLabState.initialDoMgL}
                          onChange={(e) =>
                            setQualityLabState((prev) => ({ ...prev, initialDoMgL: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />

                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-slate-300">
                            Day 5 DO (D2): <span className="text-amber-400 font-bold">{qualityLabState.incubatedDoMgL} mg/L</span>
                          </label>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="5.0"
                          step="0.1"
                          value={qualityLabState.incubatedDoMgL}
                          onChange={(e) =>
                            setQualityLabState((prev) => ({ ...prev, incubatedDoMgL: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Lab Telemetry */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Analytical Result & Regulatory Compliance
                      </span>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-slate-400">{labCalc.testName}</span>
                          <span className="text-lg font-bold text-emerald-400 font-mono">
                            {labCalc.primaryValue.toFixed(2)} {labCalc.unit}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>Standard Limit:</span>
                          <span className="text-slate-200 font-medium">{labCalc.standardLimit}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>CPCB Rating:</span>
                          <span
                            className={`font-bold ${
                              labCalc.complianceRating === 'desirable'
                                ? 'text-emerald-400'
                                : labCalc.complianceRating === 'permissible'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {labCalc.complianceRating.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800 leading-normal">
                          {labCalc.interpretation}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* VIEW MODE: Process Curves (Dynamic SVG Plots) */}
        {viewMode === 'curves' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <LineChart className="w-5 h-5 text-emerald-400" />
                    <span>Dynamic Engineering Curves & Environmental Analytics</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live plots generated from current experimental inputs and governing physical laws
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Curve 1: Jar Test Optimum Coagulant Curve */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-300">
                      Coagulant Dosage vs. Residual Turbidity (Jar Test)
                    </span>
                    <span className="text-[10px] text-slate-400">IS: 3025 (Part 10)</span>
                  </div>
                  <div className="w-full h-48 bg-slate-950 rounded-lg border border-slate-800/80 p-2 flex items-center justify-center">
                    <svg viewBox="0 0 300 150" className="w-full h-full">
                      {/* Grid lines */}
                      <line x1="30" y1="20" x2="280" y2="20" stroke="#1e293b" strokeDasharray="2,2" />
                      <line x1="30" y1="60" x2="280" y2="60" stroke="#1e293b" strokeDasharray="2,2" />
                      <line x1="30" y1="100" x2="280" y2="100" stroke="#1e293b" strokeDasharray="2,2" />
                      {/* Axes */}
                      <line x1="30" y1="130" x2="280" y2="130" stroke="#475569" strokeWidth="1.5" />
                      <line x1="30" y1="10" x2="30" y2="130" stroke="#475569" strokeWidth="1.5" />
                      {/* Curve */}
                      <path
                        d="M 35,25 Q 90,120 170,122 T 275,85"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                      {/* Optimum Point */}
                      <circle cx="170" cy="122" r="4.5" fill="#34d399" />
                      <text x="175" y="115" fill="#34d399" fontSize="8" fontWeight="bold">
                        Optimum (30-40 mg/L)
                      </text>
                      {/* BIS Limit Line */}
                      <line x1="30" y1="125" x2="280" y2="125" stroke="#f43f5e" strokeDasharray="3,3" />
                      <text x="210" y="123" fill="#f43f5e" fontSize="7">
                        BIS Limit 1.0 NTU
                      </text>
                      {/* Axis Labels */}
                      <text x="140" y="145" fill="#94a3b8" fontSize="8" textAnchor="middle">
                        Alum Coagulant Dose (mg/L)
                      </text>
                      <text x="12" y="70" fill="#94a3b8" fontSize="8" transform="rotate(-90 12,70)" textAnchor="middle">
                        Turbidity (NTU)
                      </text>
                    </svg>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Demonstrates classic coagulant sweep flocculation. Insufficient alum results in poor destabilization; excessive dose causes charge reversal and restabilization of colloidal particles.
                  </p>
                </div>

                {/* Curve 2: Parabolic Particle Settling Trajectory */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-cyan-300">
                      Stokes' Settling Trajectories in Clarifier
                    </span>
                    <span className="text-[10px] text-slate-400">SOR = {sedCalc.surfaceOverflowRateM3M2Day.toFixed(1)} m³/m²·d</span>
                  </div>
                  <div className="w-full h-48 bg-slate-950 rounded-lg border border-slate-800/80 p-2 flex items-center justify-center">
                    <svg viewBox="0 0 300 150" className="w-full h-full">
                      {/* Tank Outline */}
                      <rect x="30" y="20" width="250" height="110" fill="#0f172a" stroke="#334155" />
                      <line x1="30" y1="35" x2="280" y2="35" stroke="#0ea5e9" strokeDasharray="4,2" />
                      {/* Trajectory 1: Complete Removal */}
                      <path d="M 30,35 L 230,130" fill="none" stroke="#10b981" strokeWidth="2" />
                      <text x="170" y="90" fill="#10b981" fontSize="7">
                        d = 0.035 mm (100% Settled)
                      </text>
                      {/* Trajectory 2: Partial Removal */}
                      <path d="M 30,35 L 280,105" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,2" />
                      <text x="210" y="70" fill="#f59e0b" fontSize="7">
                        d = 0.015 mm (Escapes)
                      </text>
                      {/* Labels */}
                      <text x="35" y="30" fill="#0ea5e9" fontSize="8">Inlet Zone</text>
                      <text x="245" y="30" fill="#0ea5e9" fontSize="8">Effluent Weir</text>
                      <text x="140" y="145" fill="#94a3b8" fontSize="8" textAnchor="middle">
                        Tank Length L ({sedimentationState.lengthOrDiameterM} m)
                      </text>
                    </svg>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Shows particle settling vector resultant from forward horizontal velocity $v_h$ and gravitational settling velocity $v_s$. Particles reaching the sludge hopper floor prior to outlet are trapped.
                  </p>
                </div>

                {/* Curve 3: Rapid Sand Head Loss vs Run Time */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-teal-300">
                      Rapid Sand Filter Head Loss vs. Run Time
                    </span>
                    <span className="text-[10px] text-slate-400">CPHEEO Max Head = 2.5 m</span>
                  </div>
                  <div className="w-full h-48 bg-slate-950 rounded-lg border border-slate-800/80 p-2 flex items-center justify-center">
                    <svg viewBox="0 0 300 150" className="w-full h-full">
                      <line x1="30" y1="130" x2="280" y2="130" stroke="#475569" strokeWidth="1.5" />
                      <line x1="30" y1="10" x2="30" y2="130" stroke="#475569" strokeWidth="1.5" />
                      {/* Terminal Head loss line */}
                      <line x1="30" y1="30" x2="280" y2="30" stroke="#f43f5e" strokeDasharray="3,3" />
                      <text x="210" y="25" fill="#f43f5e" fontSize="7">Terminal Limit 2.5 m</text>
                      {/* Head loss curve */}
                      <path
                        d="M 30,115 Q 150,105 260,30"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                      />
                      {/* Current operating point */}
                      <circle cx="160" cy="95" r="4.5" fill="#22d3ee" />
                      <text x="168" y="92" fill="#22d3ee" fontSize="8" fontWeight="bold">
                        {filtrationState.operatingHours} hr ({filtCalc.cloggedHeadLossM.toFixed(2)} m)
                      </text>
                      <text x="155" y="145" fill="#94a3b8" fontSize="8" textAnchor="middle">
                        Filter Operating Hours (t)
                      </text>
                      <text x="12" y="70" fill="#94a3b8" fontSize="8" transform="rotate(-90 12,70)" textAnchor="middle">
                        Head Loss h_f (m)
                      </text>
                    </svg>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Clean bed head loss starts at {filtCalc.cleanBedHeadLossM.toFixed(2)} m. As suspended solids deposit inside sand pores, permeability decreases exponentially until 2.5 m terminal head loss triggers backwashing.
                  </p>
                </div>

                {/* Curve 4: Sewer Hydraulic Velocity vs Depth Ratio */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-300">
                      Sewer Velocity Ratio (v/V) vs. Depth Ratio (d/D)
                    </span>
                    <span className="text-[10px] text-slate-400">Manning's n = 0.013</span>
                  </div>
                  <div className="w-full h-48 bg-slate-950 rounded-lg border border-slate-800/80 p-2 flex items-center justify-center">
                    <svg viewBox="0 0 300 150" className="w-full h-full">
                      <line x1="30" y1="130" x2="280" y2="130" stroke="#475569" strokeWidth="1.5" />
                      <line x1="30" y1="10" x2="30" y2="130" stroke="#475569" strokeWidth="1.5" />
                      {/* Self-cleansing threshold line */}
                      <line x1="120" y1="10" x2="120" y2="130" stroke="#f59e0b" strokeDasharray="3,3" />
                      <text x="125" y="40" fill="#f59e0b" fontSize="7">
                        v &gt;= 0.6 m/s (Scouring Limit)
                      </text>
                      {/* Hydraulic velocity curve */}
                      <path
                        d="M 30,130 C 50,110 110,80 220,40 C 255,20 270,30 250,10"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                      />
                      {/* Current operating depth */}
                      <circle cx="160" cy="55" r="4.5" fill="#fbbf24" />
                      <text x="168" y="58" fill="#fbbf24" fontSize="8" fontWeight="bold">
                        d/D = {distributionState.sewerDepthRatio} ({distCalc.sewerActualVelocityMS.toFixed(2)} m/s)
                      </text>
                      <text x="155" y="145" fill="#94a3b8" fontSize="8" textAnchor="middle">
                        Velocity v (m/s)
                      </text>
                      <text x="12" y="70" fill="#94a3b8" fontSize="8" transform="rotate(-90 12,70)" textAnchor="middle">
                        Partial Depth Ratio d/D
                      </text>
                    </svg>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Demonstrates sewer hydraulics. Maximum velocity occurs at d/D ≈ 0.81 due to reduced relative wetted perimeter friction compared to flowing completely full (d/D = 1.0).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE: Mathematical Derivations & Live Substitutions */}
        {viewMode === 'derivations' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Governing Environmental Engineering Equations & Substitutions</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Step-by-step rigorous formulations verified against BIS 10500, CPHEEO, and Metcalf & Eddy
                </p>
              </div>

              {/* Derivation 1: Stokes' Law & Surface Overflow Rate */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  1. Sedimentation Tank Dynamics & Stokes' Settling Velocity
                </h3>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
                  v_s = [g · (ρ_s - ρ_w) · d²] / [18 · μ]
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div><strong>Live Substitution for d = {sedimentationState.particleDiameterMm} mm:</strong></div>
                  <div className="font-mono text-slate-400 pl-3">
                    g = 9.81 m/s², ρ_s = {(sedimentationState.particleSpecificGravity * 1000).toFixed(0)} kg/m³, ρ_w = 1000 kg/m³, μ = 0.00089 N·s/m² (at 25°C)
                  </div>
                  <div className="font-mono text-emerald-300 pl-3">
                    v_s = [9.81 × (2650 - 1000) × ({sedimentationState.particleDiameterMm * 1e-3} m)²] / [18 × 0.00089] ={' '}
                    <strong>{sedCalc.settlingVelocityMmS.toFixed(3)} mm/s</strong>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs">
                  <span className="text-cyan-400 font-bold">Surface Overflow Rate (SOR): </span>
                  <span className="font-mono text-slate-300">
                    SOR = Q / A_s = {(sedimentationState.flowRateM3Hr * 24).toFixed(0)} m³/d / {(sedimentationState.lengthOrDiameterM * sedimentationState.widthM).toFixed(0)} m² ={' '}
                    <strong>{sedCalc.surfaceOverflowRateM3M2Day.toFixed(1)} m³/(m²·day)</strong>
                  </span>
                </div>
              </div>

              {/* Derivation 2: Carman-Kozeny Filter Head Loss */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  2. Rapid Sand Filtration — Carman-Kozeny Head Loss
                </h3>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-teal-400">
                  h_f = [f' · L / (φ · d_10 · g)] · [(1 - ε) / ε³] · v²
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div><strong>Clean Bed Head Loss Live Substitution:</strong></div>
                  <div className="font-mono text-slate-400 pl-3">
                    Bed Depth L = {filtrationState.sandDepthM} m, Porosity ε = {filtrationState.sandPorosity}, Filtration Rate v = {(filtrationState.filtrationRateM3M2Hr / 3600).toFixed(4)} m/s
                  </div>
                  <div className="font-mono text-teal-300 pl-3">
                    h_clean = <strong>{filtCalc.cleanBedHeadLossM.toFixed(3)} m</strong>; Dynamic clogged head loss after {filtrationState.operatingHours} hrs ={' '}
                    <strong>{filtCalc.cloggedHeadLossM.toFixed(2)} m</strong> (Max limit = 2.50 m)
                  </div>
                </div>
              </div>

              {/* Derivation 3: Activated Sludge Process Kinetics */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  3. Activated Sludge Biological Process — F/M Ratio & Monod Kinetics
                </h3>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-purple-400">
                  F/M = [Q · S_0] / [V · X]
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div><strong>Live Kinetics Substitution:</strong></div>
                  <div className="font-mono text-slate-400 pl-3">
                    Q = {wastewaterState.influentFlowM3Day} m³/d, S_0 = {wastewaterState.influentBod5MgL} mg/L, V = {wastewaterState.aerationTankVolumeM3} m³, MLSS X = {wastewaterState.mlssMgL} mg/L
                  </div>
                  <div className="font-mono text-purple-300 pl-3">
                    F/M = [{(wastewaterState.influentFlowM3Day * wastewaterState.influentBod5MgL * 1e-3).toFixed(0)} kg BOD/d] / [{(wastewaterState.aerationTankVolumeM3 * wastewaterState.mlssMgL * 1e-3).toFixed(0)} kg MLSS] ={' '}
                    <strong>{wwtpCalc.fmRatioKgBodKgMlssDay.toFixed(3)} kg BOD / (kg MLSS·day)</strong>
                  </div>
                </div>
              </div>

              {/* Derivation 4: Hazen-Williams Pipe Network Friction */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  4. Water Distribution — Hazen-Williams Head Loss
                </h3>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-amber-400">
                  h_f = 10.67 · L · Q^1.852 / (C^1.852 · D^4.87)
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div><strong>Hydraulic Live Substitution:</strong></div>
                  <div className="font-mono text-slate-400 pl-3">
                    L = {distributionState.pipeLengthM} m, D = {distributionState.pipeDiameterMm * 1e-3} m, C = {distributionState.pipeRoughnessC}, Q = {distributionState.nodeDemandLps * 1e-3} m³/s
                  </div>
                  <div className="font-mono text-amber-300 pl-3">
                    h_f = <strong>{distCalc.frictionalHeadLossM.toFixed(2)} m</strong>; Residual Pressure Head at tap ={' '}
                    <strong>{distCalc.residualPressureHeadM.toFixed(2)} m</strong> (Design Requirement &ge; 12.0 m)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE: Observation Trials & CSV Export */}
        {viewMode === 'observations' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Table className="w-5 h-5 text-emerald-400" />
                    <span>Laboratory Observation Table ({trials.length} Recorded Runs)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive log of all virtual trial parameter adjustments and analytical results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportCSV}
                    disabled={trials.length === 0}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setTrials([])}
                    disabled={trials.length === 0}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 disabled:opacity-50 text-slate-300 rounded-lg text-xs transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {trials.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  <Droplets className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
                  <p className="text-sm font-medium">No simulation trials recorded yet.</p>
                  <p className="text-xs mt-1">
                    Click the <strong>"Record Trial"</strong> button on the 3D visualizer to log dynamic test conditions.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">Trial #</th>
                        <th className="px-3 py-2.5">Time</th>
                        <th className="px-3 py-2.5">Module</th>
                        <th className="px-4 py-2.5">Operating Parameters</th>
                        <th className="px-4 py-2.5">Calculated Results</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-950 font-mono">
                      {trials.map((trial) => (
                        <tr key={trial.trialNumber} className="hover:bg-slate-900/60 transition-colors">
                          <td className="px-3 py-2.5 text-emerald-400 font-bold">#{trial.trialNumber}</td>
                          <td className="px-3 py-2.5 text-slate-400 text-[11px]">{trial.timestamp}</td>
                          <td className="px-3 py-2.5 font-sans font-semibold text-white">{trial.module}</td>
                          <td className="px-4 py-2.5 text-[11px] text-slate-300">
                            {Object.entries(trial.parameters).map(([k, v]) => (
                              <div key={k}>
                                <span className="text-slate-500">{k}:</span> {v}
                              </div>
                            ))}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-emerald-300">
                            {Object.entries(trial.results).map(([k, v]) => (
                              <div key={k}>
                                <span className="text-slate-500">{k}:</span> <strong>{v}</strong>
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE: Official Syllabus Theory & Specifications */}
        {viewMode === 'theory' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>Syllabus Topics & Indian Environmental Standards</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Anna University Autonomous Regulation 2025 · U25CE403 Water Supply and Wastewater Engineering
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-emerald-400">Unit I: Water Supply & Transmission</h3>
                  <p>
                    Covers public water supply schemes, per capita water consumption demands per CPHEEO (135 LPCD for piped residential supply), population forecasting methods (arithmetic, geometric, incremental increase, and logistics curve), surface water intake structures, and conveyance through pumping and gravity conduits.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-emerald-400">Unit II: Water Treatment Unit Operations</h3>
                  <p>
                    Rigorous theory and design of conventional water purification trains: aeration (iron and manganese removal, VOC volatilization), rapid flash mixing (velocity gradient G = 300 to 900 s⁻¹), paddle flocculation (G · t = 10⁴ to 10⁵), sedimentation and tube settlers (SOR = 30 to 40 m³/m²·d), gravity rapid sand filters, and chlorination break-point dynamics with residual chlorine verification per BIS 10500:2012.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-emerald-400">Unit III & IV: Wastewater Collection & Biological Treatment</h3>
                  <p>
                    Estimation of domestic sewage dry weather flow (DWF) and storm runoff using the Rational formula. Sewer hydraulic design via Manning's equation ensuring self-cleansing velocity (≥ 0.6 m/s). Activated Sludge Process (ASP) design based on bacterial kinetics, microbial growth yield, mean cell residence time (SRT), F/M ratio (0.2–0.4), and secondary clarifier design per CPCB standards.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold text-emerald-400">Prescribed Reference Standards</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong>BIS 10500:2012:</strong> Indian Standard Drinking Water Specification (Second Revision).</li>
                    <li><strong>CPHEEO Manual:</strong> Water Supply and Treatment (3rd Edition, Ministry of Urban Development).</li>
                    <li><strong>CPHEEO Manual:</strong> Sewerage and Sewage Treatment Systems (Part A: Engineering, 2013).</li>
                    <li><strong>CPCB Standards:</strong> General Standards for Discharge of Environmental Pollutants (Schedule VI).</li>
                    <li><strong>IS: 3025:</strong> Methods of Sampling and Test (Physical and Chemical) for Water and Wastewater.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE: Concept Mastery Quiz */}
        {viewMode === 'quiz' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5 text-emerald-400" />
                    <span>Conceptual Assessment Quiz</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Test your understanding of water treatment unit processes, hydraulic limits, and standards
                  </p>
                </div>
                {quizScore !== null && (
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    Score: {quizScore} / {quizQuestions.length}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {quizQuestions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-white leading-relaxed">
                      <span className="text-emerald-400 mr-2">Q{qIdx + 1}.</span>
                      {q.question}
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === oIdx;
                        const isSubmitted = quizScore !== null;
                        const isCorrect = q.correct === oIdx;

                        let btnStyle = 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800';
                        if (isSubmitted) {
                          if (isCorrect) btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                          else if (isSelected) btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                        } else if (isSelected) {
                          btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleQuizAnswer(qIdx, oIdx)}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start space-x-2 ${btnStyle}`}
                          >
                            <span className="font-mono text-slate-500 text-[11px] mt-0.5">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span className="flex-1 leading-normal">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    {quizScore !== null && (
                      <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 leading-normal">
                        <strong className="text-emerald-400">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-2">
                  <button
                    onClick={handleEvaluateQuiz}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95"
                  >
                    Submit Answers & Check Score
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Printable Laboratory Practical Report Modal ─────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden">
              <div className="flex items-center space-x-2 text-slate-700">
                <Printer className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Formal Practical Report Preview</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 font-serif text-slate-900 leading-relaxed text-sm">
              {/* Institution Header */}
              <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                <h1 className="text-lg font-black tracking-wide uppercase">
                  PiyushDhara Eduverse — Department of Civil Engineering
                </h1>
                <h2 className="text-sm font-bold text-slate-700">
                  U25CE403 / U25CE405: Water Supply & Wastewater Analysis Laboratory
                </h2>
                <div className="text-xs text-slate-600 font-sans">
                  Autonomous Academic Regulation R2025 · Semester IV · Laboratory Practical Record
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <strong>Student Name:</strong> Undergrad Environmental Scholar
                </div>
                <div>
                  <strong>Date of Simulation:</strong> {new Date().toLocaleDateString()}
                </div>
                <div>
                  <strong>Active Simulation:</strong> {activeSimId}
                </div>
                <div>
                  <strong>BIS Standards Applied:</strong> BIS 10500:2012 & CPHEEO Manuals
                </div>
              </div>

              {/* Experiment Title & Objectives */}
              <div className="space-y-2">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
                  I. Experiment Objectives & Scope
                </h3>
                <p className="text-xs text-slate-700">
                  To analyze the hydraulic performance, unit sizing, water quality transformation, and kinetic removal efficiencies of water treatment plants, sedimentation clarifiers, rapid sand filters, activated sludge wastewater systems, and distribution networks under standardized engineering criteria.
                </p>
              </div>

              {/* Apparatus & Simulation Inputs */}
              <div className="space-y-2">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
                  II. Apparatus & Experimental Boundary Conditions
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-2.5 bg-slate-50 rounded border">
                    <div className="font-bold text-slate-800 mb-1">Water Treatment Plant Inputs:</div>
                    <div>Capacity: {wtpState.plantCapacityMld} MLD</div>
                    <div>Raw Turbidity: {wtpState.rawTurbidityNtu} NTU</div>
                    <div>Alum Dose: {wtpState.coagulantAlumDoseMgL} mg/L</div>
                    <div>Chlorine Dose: {wtpState.chlorineDoseMgL} mg/L</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border">
                    <div className="font-bold text-slate-800 mb-1">Clarifier & Filter Parameters:</div>
                    <div>Clarifier SOR: {sedCalc.surfaceOverflowRateM3M2Day.toFixed(1)} m³/m²·d</div>
                    <div>Filter Head Loss: {filtCalc.cloggedHeadLossM.toFixed(2)} m (Max 2.50 m)</div>
                    <div>Fluidized Expansion: {filtCalc.bedExpansionPercent.toFixed(1)} %</div>
                    <div>ASP F/M Ratio: {wwtpCalc.fmRatioKgBodKgMlssDay.toFixed(3)} kg/kg·d</div>
                  </div>
                </div>
              </div>

              {/* Governing Formulas */}
              <div className="space-y-2">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
                  III. Governing Mathematical Formulations
                </h3>
                <div className="p-3 bg-slate-50 rounded border font-mono text-xs space-y-1">
                  <div>• Stokes' Settling: vs = [g · (ρs - ρw) · d²] / [18 · μ]</div>
                  <div>• Carmen-Kozeny Head Loss: hf = [f' · L / (φ · d10 · g)] · [(1 - ε) / ε³] · v²</div>
                  <div>• Activated Sludge F/M Ratio: F/M = [Q · S0] / [V · X]</div>
                  <div>• Hazen-Williams Head Loss: hf = 10.67 · L · Q^1.852 / [C^1.852 · D^4.87]</div>
                  <div>• Manning's Gravity Flow: v = (1/n) · R^(2/3) · S^(1/2)</div>
                </div>
              </div>

              {/* Recorded Observations Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 border-b pb-1">
                  IV. Simulation Observations & Results Table
                </h3>
                {trials.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No formal trials recorded in this session.</p>
                ) : (
                  <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300 font-sans">
                    <thead className="bg-slate-100 font-bold">
                      <tr>
                        <th className="p-1.5">#</th>
                        <th className="p-1.5">Module</th>
                        <th className="p-1.5">Operational Parameters</th>
                        <th className="p-1.5">Measured Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {trials.slice(0, 5).map((t) => (
                        <tr key={t.trialNumber}>
                          <td className="p-1.5 font-bold">#{t.trialNumber}</td>
                          <td className="p-1.5 font-semibold">{t.module}</td>
                          <td className="p-1.5 text-[11px]">
                            {Object.entries(t.parameters)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </td>
                          <td className="p-1.5 text-[11px] font-bold text-emerald-800">
                            {Object.entries(t.results)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Discussion & Signatures */}
              <div className="space-y-4 pt-4 border-t border-slate-300 text-xs">
                <div>
                  <strong>Discussion & Conclusion:</strong> The simulated unit operations successfully satisfy the potable drinking water limits specified by BIS 10500:2012 (clarified turbidity &lt; 1.0 NTU and residual chlorine &ge; 0.2 mg/L) and environmental wastewater discharge limits set by CPCB (effluent BOD5 &le; 30 mg/L).
                </div>
                <div className="flex justify-between items-end pt-12 text-center text-xs font-sans">
                  <div>
                    <div className="border-t border-slate-400 w-40 pt-1">Student Signature</div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 w-48 pt-1">
                      Faculty In-Charge Signature
                      <div className="text-[10px] text-slate-500">Department of Civil Engineering</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
