/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Course: U25CE404 — Geotechnical Engineering I (Civil Engineering, Semester IV)
 * Master Interactive React Laboratory Workspace
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers,
  FlaskConical,
  RotateCcw,
  Maximize2,
  Table,
  BookOpen,
  HelpCircle,
  FileText,
  LineChart,
  Play,
  Square,
  Compass,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Printer,
  X,
} from 'lucide-react';

import type {
  GeotechnicalSimId,
  GeotechnicalViewMode,
  ISoilLayer,
  IStratigraphyParams,
  ISieveData,
  ICompactionTrial,
  IPermeabilityParams,
  IConsolidationParams,
  IShearStrengthParams,
  IGeotechnicalObservationTrial,
  IGeotechnicalComponentInfo,
} from '../core/types';
import { GeotechnicalCalculator } from '../core/GeotechnicalCalculator';

import { SoilStratigraphyScene } from '../simulations/01-stratigraphy/SoilStratigraphyScene';
import { SieveClassificationScene } from '../simulations/02-classification/SieveClassificationScene';
import { ProctorCompactionScene } from '../simulations/03-compaction/ProctorCompactionScene';
import { PermeabilityScene } from '../simulations/04-permeability/PermeabilityScene';
import { ConsolidationScene } from '../simulations/05-consolidation/ConsolidationScene';
import { ShearStrengthScene } from '../simulations/06-shear-strength/ShearStrengthScene';
import { BaseGeotechnicalSimulation } from '../core/BaseGeotechnicalSimulation';

interface IGeotechnicalLabWorkspaceProps {
  initialSimId?: GeotechnicalSimId;
  onExit?: () => void;
}

const DEFAULT_LAYERS: ISoilLayer[] = [
  {
    id: 'layer-topsoil',
    name: 'Topsoil & Organic Loam',
    soilType: 'topsoil',
    depthTop: 0,
    depthBottom: 1.0,
    thickness: 1.0,
    color: '#3f2e18',
    moistureContent: 0.12,
    specificGravity: 2.60,
    voidRatio: 0.75,
    porosity: 0.43,
    degreeOfSaturation: 0.42,
    bulkDensity: 17.0,
    dryDensity: 14.8,
    saturatedDensity: 18.9,
    submergedDensity: 9.09,
    permeabilityK: 5e-5,
    cohesion: 10,
    frictionAngle: 25,
    visible: true,
  },
  {
    id: 'layer-clay',
    name: 'Medium Stiff Silty Clay (CL)',
    soilType: 'clay',
    depthTop: 1.0,
    depthBottom: 3.5,
    thickness: 2.5,
    color: '#6e4726',
    moistureContent: 0.28,
    specificGravity: 2.70,
    voidRatio: 0.88,
    porosity: 0.47,
    degreeOfSaturation: 0.86,
    bulkDensity: 18.5,
    dryDensity: 14.2,
    saturatedDensity: 18.8,
    submergedDensity: 8.99,
    permeabilityK: 2e-8,
    cohesion: 35,
    frictionAngle: 12,
    visible: true,
  },
  {
    id: 'layer-sand',
    name: 'Medium Dense River Sand (SW)',
    soilType: 'sand',
    depthTop: 3.5,
    depthBottom: 6.0,
    thickness: 2.5,
    color: '#d4b16a',
    moistureContent: 0.16,
    specificGravity: 2.65,
    voidRatio: 0.62,
    porosity: 0.38,
    degreeOfSaturation: 0.68,
    bulkDensity: 19.5,
    dryDensity: 16.4,
    saturatedDensity: 20.1,
    submergedDensity: 10.29,
    permeabilityK: 1.5e-4,
    cohesion: 0,
    frictionAngle: 34,
    visible: true,
  },
  {
    id: 'layer-gravel',
    name: 'Dense Sandy Gravel (GW)',
    soilType: 'gravel',
    depthTop: 6.0,
    depthBottom: 8.0,
    thickness: 2.0,
    color: '#5a5f66',
    moistureContent: 0.08,
    specificGravity: 2.68,
    voidRatio: 0.45,
    porosity: 0.31,
    degreeOfSaturation: 0.48,
    bulkDensity: 21.0,
    dryDensity: 18.5,
    saturatedDensity: 21.4,
    submergedDensity: 11.59,
    permeabilityK: 8e-3,
    cohesion: 0,
    frictionAngle: 40,
    visible: true,
  },
];

const DEFAULT_SIEVES: ISieveData[] = [
  { sieveSizeMm: 4.75, sieveName: '4.75 mm', massRetainedG: 22, percentRetained: 4.4, cumulativeRetained: 4.4, percentPassing: 95.6 },
  { sieveSizeMm: 2.0, sieveName: '2.00 mm', massRetainedG: 58, percentRetained: 11.6, cumulativeRetained: 16.0, percentPassing: 84.0 },
  { sieveSizeMm: 1.0, sieveName: '1.00 mm', massRetainedG: 95, percentRetained: 19.0, cumulativeRetained: 35.0, percentPassing: 65.0 },
  { sieveSizeMm: 0.425, sieveName: '425 µm', massRetainedG: 142, percentRetained: 28.4, cumulativeRetained: 63.4, percentPassing: 36.6 },
  { sieveSizeMm: 0.25, sieveName: '250 µm', massRetainedG: 105, percentRetained: 21.0, cumulativeRetained: 84.4, percentPassing: 15.6 },
  { sieveSizeMm: 0.15, sieveName: '150 µm', massRetainedG: 48, percentRetained: 9.6, cumulativeRetained: 94.0, percentPassing: 6.0 },
  { sieveSizeMm: 0.075, sieveName: '75 µm', massRetainedG: 20, percentRetained: 4.0, cumulativeRetained: 98.0, percentPassing: 2.0 },
  { sieveSizeMm: 0.01, sieveName: 'Pan', massRetainedG: 10, percentRetained: 2.0, cumulativeRetained: 100.0, percentPassing: 0.0 },
];

export const GeotechnicalLabWorkspace: React.FC<IGeotechnicalLabWorkspaceProps> = ({
  initialSimId = 'u25ce404-soil-stratigraphy',
  onExit,
}) => {
  // Navigation & View Mode
  const [activeSimId, setActiveSimId] = useState<GeotechnicalSimId>(initialSimId);
  const [viewMode, setViewMode] = useState<GeotechnicalViewMode>('ground');
  const [activeTab, setActiveTab] = useState<'controls' | 'analysis' | 'observations' | 'procedure' | 'quiz'>('controls');
  const [selectedComponent, setSelectedComponent] = useState<IGeotechnicalComponentInfo | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [trials, setTrials] = useState<IGeotechnicalObservationTrial[]>([]);

  // 3D Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simInstanceRef = useRef<BaseGeotechnicalSimulation | null>(null);

  // Module 1 Parameters: Stratigraphy
  const [waterTableDepth, setWaterTableDepth] = useState<number>(2.5);
  const [probeDepth, setProbeDepth] = useState<number>(4.0);
  const [layers, setLayers] = useState<ISoilLayer[]>(DEFAULT_LAYERS);

  // Module 2 Parameters: Sieve Analysis
  const [rawSieves, setRawSieves] = useState(DEFAULT_SIEVES);
  const [liquidLimit, setLiquidLimit] = useState<number>(32);
  const [plasticLimit, setPlasticLimit] = useState<number>(18);
  const [isShakingActive, setIsShakingActive] = useState<boolean>(false);

  // Module 3 Parameters: Proctor Compaction
  const [compactionWaterPercent, setCompactionWaterPercent] = useState<number>(14);
  const [compactionSoilSpecificGravity, setCompactionSoilSpecificGravity] = useState<number>(2.65);
  const [compactionTrialsList, setCompactionTrialsList] = useState([
    { waterContentPercent: 8, mouldMassG: 2000, mouldPlusWetSoilG: 3820, mouldVolumeCm3: 1000 },
    { waterContentPercent: 11, mouldMassG: 2000, mouldPlusWetSoilG: 3980, mouldVolumeCm3: 1000 },
    { waterContentPercent: 14, mouldMassG: 2000, mouldPlusWetSoilG: 4090, mouldVolumeCm3: 1000 },
    { waterContentPercent: 17, mouldMassG: 2000, mouldPlusWetSoilG: 4060, mouldVolumeCm3: 1000 },
    { waterContentPercent: 20, mouldMassG: 2000, mouldPlusWetSoilG: 3950, mouldVolumeCm3: 1000 },
  ]);

  // Module 4 Parameters: Permeability
  const [permTestType, setPermTestType] = useState<'constant-head' | 'falling-head'>('constant-head');
  const [permSoilType, setPermSoilType] = useState<'sand' | 'silt-clay'>('sand');
  const [headDiffMm, setHeadDiffMm] = useState<number>(300);
  const [collectedVolMl, setCollectedVolMl] = useState<number>(450);
  const [permDurationSec, setPermDurationSec] = useState<number>(60);
  const [standpipeH1Mm, setStandpipeH1Mm] = useState<number>(800);
  const [standpipeH2Mm, setStandpipeH2Mm] = useState<number>(400);
  const [standpipeDurationSec, setStandpipeDurationSec] = useState<number>(120);

  // Module 5 Parameters: Consolidation
  const [consolidationLoadKPa, setConsolidationLoadKPa] = useState<number>(100);
  const [consolidationInitialMoisture, setConsolidationInitialMoisture] = useState<number>(30);
  const [cumulativeSettlementMm, setCumulativeSettlementMm] = useState<number>(0.42);

  // Module 6 Parameters: Shear Strength
  const [shearTestType, setShearTestType] = useState<'direct-shear' | 'ucc'>('direct-shear');
  const [shearNormalStressKPa, setShearNormalStressKPa] = useState<number>(100);
  const [shearCohesionKPa, setShearCohesionKPa] = useState<number>(15);
  const [shearFrictionAngleDeg, setShearFrictionAngleDeg] = useState<number>(32);
  const [uccCurrentStrain, setUccCurrentStrain] = useState<number>(0.06);
  const [isShearTestingActive, setIsShearTestingActive] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // CALCULATIONS
  // ─────────────────────────────────────────────────────────────

  // Stratigraphy Stress Profile
  const stratigraphyStress = useMemo(() => {
    return GeotechnicalCalculator.calculateStressProfile(layers, waterTableDepth, probeDepth);
  }, [layers, waterTableDepth, probeDepth]);

  // Sieve Classification
  const classificationResult = useMemo(() => {
    return GeotechnicalCalculator.calculateSieveAnalysis(rawSieves, liquidLimit, plasticLimit);
  }, [rawSieves, liquidLimit, plasticLimit]);

  // Proctor Compaction
  const compactionResult = useMemo(() => {
    return GeotechnicalCalculator.calculateCompaction(compactionTrialsList, compactionSoilSpecificGravity);
  }, [compactionTrialsList, compactionSoilSpecificGravity]);

  // Permeability
  const permeabilityResult = useMemo(() => {
    const params: IPermeabilityParams = {
      testType: permTestType,
      soilType: permSoilType,
      diameterMm: 100,
      lengthMm: 127,
      waterTempCelsius: 27,
      headDifferenceMm: headDiffMm,
      collectedVolumeMl: collectedVolMl,
      durationSeconds: permDurationSec,
      standpipeDiameterMm: 5,
      initialHeadH1Mm: standpipeH1Mm,
      finalHeadH2Mm: standpipeH2Mm,
      fallingDurationSeconds: standpipeDurationSec,
    };
    return GeotechnicalCalculator.calculatePermeability(params);
  }, [
    permTestType,
    permSoilType,
    headDiffMm,
    collectedVolMl,
    permDurationSec,
    standpipeH1Mm,
    standpipeH2Mm,
    standpipeDurationSec,
  ]);

  // Consolidation
  const consolidationResult = useMemo(() => {
    const params: IConsolidationParams = {
      specimenDiameterMm: 60,
      initialHeightMm: 20,
      initialMoisturePercent: consolidationInitialMoisture,
      specificGravity: 2.7,
      loadIncrementKPa: consolidationLoadKPa,
      elapsedTimeSeconds: 86400,
    };
    return GeotechnicalCalculator.calculateConsolidationStage(params, cumulativeSettlementMm);
  }, [consolidationLoadKPa, consolidationInitialMoisture, cumulativeSettlementMm]);

  // Shear Strength
  const shearStrengthResult = useMemo(() => {
    const params: IShearStrengthParams = {
      testType: shearTestType,
      soilType: shearCohesionKPa > 0 ? 'cohesive-clay' : 'cohesionless-sand',
      specimenSizeMm: 60,
      normalStressKPa: shearNormalStressKPa,
      displacementRateMmPerMin: 1.25,
      cohesionC: shearCohesionKPa,
      frictionAngleDeg: shearFrictionAngleDeg,
      initialLengthMm: 76,
      initialDiameterMm: 38,
      currentStrain: uccCurrentStrain,
    };
    return GeotechnicalCalculator.calculateShearStrength(params);
  }, [
    shearTestType,
    shearNormalStressKPa,
    shearCohesionKPa,
    shearFrictionAngleDeg,
    uccCurrentStrain,
  ]);

  // ─────────────────────────────────────────────────────────────
  // 3D SCENE LIFECYCLE
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!canvasRef.current) return;

    if (simInstanceRef.current) {
      simInstanceRef.current.dispose();
      simInstanceRef.current = null;
    }

    const options = {
      canvas: canvasRef.current,
      onComponentSelected: (info: IGeotechnicalComponentInfo) => setSelectedComponent(info),
    };

    if (activeSimId === 'u25ce404-soil-stratigraphy') {
      const stratParams: IStratigraphyParams = {
        waterTableDepth,
        selectedDepth: probeDepth,
        layers,
      };
      simInstanceRef.current = new SoilStratigraphyScene(options, stratParams);
    } else if (activeSimId === 'u25ce404-soil-classification') {
      simInstanceRef.current = new SieveClassificationScene(options, rawSieves);
    } else if (activeSimId === 'u25ce404-proctor-compaction') {
      simInstanceRef.current = new ProctorCompactionScene(options);
    } else if (activeSimId === 'u25ce404-permeability-lab') {
      const permParams: IPermeabilityParams = {
        testType: permTestType,
        soilType: permSoilType,
        diameterMm: 100,
        lengthMm: 127,
        waterTempCelsius: 27,
        headDifferenceMm: headDiffMm,
        collectedVolumeMl: collectedVolMl,
        durationSeconds: permDurationSec,
        standpipeDiameterMm: 5,
        initialHeadH1Mm: standpipeH1Mm,
        finalHeadH2Mm: standpipeH2Mm,
        fallingDurationSeconds: standpipeDurationSec,
      };
      simInstanceRef.current = new PermeabilityScene(options, permParams);
    } else if (activeSimId === 'u25ce404-consolidation-lab') {
      const consolParams: IConsolidationParams = {
        specimenDiameterMm: 60,
        initialHeightMm: 20,
        initialMoisturePercent: consolidationInitialMoisture,
        specificGravity: 2.7,
        loadIncrementKPa: consolidationLoadKPa,
        elapsedTimeSeconds: 86400,
      };
      simInstanceRef.current = new ConsolidationScene(options, consolParams);
    } else if (activeSimId === 'u25ce404-shear-strength-lab') {
      const shearParams: IShearStrengthParams = {
        testType: shearTestType,
        soilType: shearCohesionKPa > 0 ? 'cohesive-clay' : 'cohesionless-sand',
        specimenSizeMm: 60,
        normalStressKPa: shearNormalStressKPa,
        displacementRateMmPerMin: 1.25,
        cohesionC: shearCohesionKPa,
        frictionAngleDeg: shearFrictionAngleDeg,
        initialLengthMm: 76,
        initialDiameterMm: 38,
        currentStrain: uccCurrentStrain,
      };
      simInstanceRef.current = new ShearStrengthScene(options, shearParams);
    }

    return () => {
      if (simInstanceRef.current) {
        simInstanceRef.current.dispose();
        simInstanceRef.current = null;
      }
    };
  }, [activeSimId]);

  // Update dynamic scene properties
  useEffect(() => {
    if (simInstanceRef.current instanceof SoilStratigraphyScene) {
      simInstanceRef.current.updateParameters({
        waterTableDepth,
        selectedDepth: probeDepth,
        layers,
      });
    }
  }, [waterTableDepth, probeDepth, layers]);

  useEffect(() => {
    if (simInstanceRef.current instanceof SieveClassificationScene) {
      simInstanceRef.current.setShaking(isShakingActive);
    }
  }, [isShakingActive]);

  useEffect(() => {
    if (simInstanceRef.current instanceof PermeabilityScene) {
      simInstanceRef.current.updateParameters({
        testType: permTestType,
        soilType: permSoilType,
        diameterMm: 100,
        lengthMm: 127,
        waterTempCelsius: 27,
        headDifferenceMm: headDiffMm,
        collectedVolumeMl: collectedVolMl,
        durationSeconds: permDurationSec,
        standpipeDiameterMm: 5,
        initialHeadH1Mm: standpipeH1Mm,
        finalHeadH2Mm: standpipeH2Mm,
        fallingDurationSeconds: standpipeDurationSec,
      });
    }
  }, [permTestType, permSoilType, headDiffMm, collectedVolMl, permDurationSec, standpipeH1Mm, standpipeH2Mm, standpipeDurationSec]);

  useEffect(() => {
    if (simInstanceRef.current instanceof ConsolidationScene) {
      simInstanceRef.current.updateParameters(
        {
          specimenDiameterMm: 60,
          initialHeightMm: 20,
          initialMoisturePercent: consolidationInitialMoisture,
          specificGravity: 2.7,
          loadIncrementKPa: consolidationLoadKPa,
          elapsedTimeSeconds: 86400,
        },
        cumulativeSettlementMm
      );
    }
  }, [consolidationLoadKPa, consolidationInitialMoisture, cumulativeSettlementMm]);

  useEffect(() => {
    if (simInstanceRef.current instanceof ShearStrengthScene) {
      simInstanceRef.current.updateParameters({
        testType: shearTestType,
        soilType: shearCohesionKPa > 0 ? 'cohesive-clay' : 'cohesionless-sand',
        specimenSizeMm: 60,
        normalStressKPa: shearNormalStressKPa,
        displacementRateMmPerMin: 1.25,
        cohesionC: shearCohesionKPa,
        frictionAngleDeg: shearFrictionAngleDeg,
        initialLengthMm: 76,
        initialDiameterMm: 38,
        currentStrain: uccCurrentStrain,
      });
      simInstanceRef.current.setTesting(isShearTestingActive);
    }
  }, [shearTestType, shearNormalStressKPa, shearCohesionKPa, shearFrictionAngleDeg, uccCurrentStrain, isShearTestingActive]);

  // Record Trial
  const handleRecordTrial = () => {
    const timestamp = new Date().toLocaleTimeString();
    let inputs: Record<string, number | string> = {};
    let readings: Record<string, number | string> = {};
    let calculated: Record<string, number | string> = {};

    if (activeSimId === 'u25ce404-soil-stratigraphy') {
      inputs = { 'Water Table (m)': waterTableDepth, 'Inspection Depth (m)': probeDepth };
      readings = { 'Total Stress σ (kPa)': stratigraphyStress.totalStress };
      calculated = {
        'Pore Pressure u (kPa)': stratigraphyStress.poreWaterPressure,
        'Effective Stress σ′ (kPa)': stratigraphyStress.effectiveStress,
      };
    } else if (activeSimId === 'u25ce404-soil-classification') {
      inputs = { 'Liquid Limit (%)': liquidLimit, 'Plastic Limit (%)': plasticLimit };
      readings = { 'D10 (mm)': classificationResult.d10, 'D60 (mm)': classificationResult.d60 };
      calculated = {
        Cu: classificationResult.cu,
        Cc: classificationResult.cc,
        'IS Classification': classificationResult.isClassification,
      };
    } else if (activeSimId === 'u25ce404-proctor-compaction') {
      inputs = { 'Water Content (%)': compactionWaterPercent, 'Specific Gravity Gs': compactionSoilSpecificGravity };
      readings = { 'Optimum Moisture (%)': compactionResult.omcPercent };
      calculated = {
        'Max Dry Density (g/cm³)': compactionResult.mddGcm3,
        'Compaction Energy (kJ/m³)': compactionResult.compactionEnergyJoulesPerM3 / 1000,
      };
    } else if (activeSimId === 'u25ce404-permeability-lab') {
      inputs = { 'Test Method': permTestType, 'Head (mm)': headDiffMm };
      readings = { 'Flow (mL)': collectedVolMl, 'Duration (s)': permDurationSec };
      calculated = {
        'k (cm/s)': permeabilityResult.hydraulicConductivityK,
        'k27 (cm/s)': permeabilityResult.k27Celsius,
        'Hydraulic Gradient i': permeabilityResult.hydraulicGradient,
      };
    } else if (activeSimId === 'u25ce404-consolidation-lab') {
      inputs = { 'Applied Stress (kPa)': consolidationLoadKPa, 'Initial w (%)': consolidationInitialMoisture };
      readings = { 'Settlement ΔH (mm)': consolidationResult.dialGaugeReadingMm };
      calculated = {
        'Final Void Ratio e': consolidationResult.voidRatio,
        'cv (cm²/s)': consolidationResult.cvCm2PerSec,
      };
    } else if (activeSimId === 'u25ce404-shear-strength-lab') {
      inputs = { 'Test Type': shearTestType, 'Normal Stress σ (kPa)': shearNormalStressKPa };
      readings = { 'Friction Angle φ (°)': shearFrictionAngleDeg, 'Cohesion c (kPa)': shearCohesionKPa };
      calculated = {
        'Peak Shear Strength τf (kPa)': shearStrengthResult.peakShearStressKPa,
        'qu (kPa)': shearStrengthResult.quKPa,
      };
    }

    const newTrial: IGeotechnicalObservationTrial = {
      trialId: `trial-${Date.now()}`,
      timestamp,
      module: activeSimId,
      inputs,
      readings,
      calculated,
      status: 'valid',
    };

    setTrials((prev) => [newTrial, ...prev]);
  };

  const handleExportCSV = () => {
    if (trials.length === 0) return;
    const headers = ['Trial ID', 'Timestamp', 'Module', 'Inputs', 'Readings', 'Calculated'];
    const rows = trials.map((t) => [
      t.trialId,
      t.timestamp,
      t.module,
      `"${JSON.stringify(t.inputs).replace(/"/g, '""')}"`,
      `"${JSON.stringify(t.readings).replace(/"/g, '""')}"`,
      `"${JSON.stringify(t.calculated).replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `geotechnical_observations_${activeSimId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* ─── Top Navigation Bar ─── */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-sm">PiyushDhara Eduverse</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                U25CE404
              </span>
              <span className="text-xs text-slate-400 hidden md:inline">· Geotechnical Engineering I</span>
            </div>
            <p className="text-[11px] text-slate-400">Anna University / KPRIET Autonomous R2025 · Civil Engineering (Sem IV)</p>
          </div>
        </div>

        {/* Experiment Navigation Dropdown / Buttons */}
        <div className="flex items-center gap-2">
          <select
            value={activeSimId}
            onChange={(e) => setActiveSimId(e.target.value as GeotechnicalSimId)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="u25ce404-soil-stratigraphy">1. Soil Stratigraphy & Effective Stress</option>
            <option value="u25ce404-soil-classification">2. Sieve Analysis & IS Classification</option>
            <option value="u25ce404-proctor-compaction">3. Standard Proctor Compaction</option>
            <option value="u25ce404-permeability-lab">4. Permeability (Constant & Falling Head)</option>
            <option value="u25ce404-consolidation-lab">5. 1D Oedometer Consolidation</option>
            <option value="u25ce404-shear-strength-lab">6. Shear Strength (Direct Shear & UCC)</option>
          </select>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium transition shadow-sm shadow-emerald-900/40"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lab Report</span>
          </button>
        </div>
      </header>

      {/* ─── Main Workspace ─── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: 3D Viewport */}
        <div className="flex-1 flex flex-col relative bg-slate-900 overflow-hidden">
          {/* Viewport Toolbar Overlay */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <button
              onClick={() => simInstanceRef.current?.resetCamera()}
              className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs flex items-center gap-1 backdrop-blur shadow-sm"
              title="Reset OrbitControls Camera"
            >
              <RotateCcw className="w-3 h-3" />
              Reset View
            </button>

            {activeSimId === 'u25ce404-soil-stratigraphy' && (
              <span className="text-[11px] px-2 py-1 rounded bg-sky-950/80 border border-sky-800 text-sky-300 backdrop-blur">
                💧 Phreatic Water Table: {waterTableDepth} m
              </span>
            )}
          </div>

          {/* 3D Canvas */}
          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* Bottom Live Telemetry Strip */}
          <div className="h-16 bg-slate-900/95 border-t border-slate-800 px-4 flex items-center gap-4 overflow-x-auto shrink-0 z-10 text-xs">
            {activeSimId === 'u25ce404-soil-stratigraphy' && (
              <>
                <div className="min-w-[120px]">
                  <div className="text-[10px] text-slate-400">Total Stress σ</div>
                  <div className="font-mono text-emerald-400 font-bold text-sm">{stratigraphyStress.totalStress} kPa</div>
                </div>
                <div className="min-w-[120px]">
                  <div className="text-[10px] text-slate-400">Pore Pressure u</div>
                  <div className="font-mono text-sky-400 font-bold text-sm">{stratigraphyStress.poreWaterPressure} kPa</div>
                </div>
                <div className="min-w-[120px]">
                  <div className="text-[10px] text-slate-400">Effective Stress σ′</div>
                  <div className="font-mono text-amber-400 font-bold text-sm">{stratigraphyStress.effectiveStress} kPa</div>
                </div>
                <div className="min-w-[140px]">
                  <div className="text-[10px] text-slate-400">Terzaghi Equation</div>
                  <div className="font-mono text-slate-300 text-xs">σ′ = σ - u</div>
                </div>
              </>
            )}

            {activeSimId === 'u25ce404-soil-classification' && (
              <>
                <div className="min-w-[100px]">
                  <div className="text-[10px] text-slate-400">Uniformity Cu</div>
                  <div className="font-mono text-emerald-400 font-bold text-sm">{classificationResult.cu}</div>
                </div>
                <div className="min-w-[100px]">
                  <div className="text-[10px] text-slate-400">Curvature Cc</div>
                  <div className="font-mono text-sky-400 font-bold text-sm">{classificationResult.cc}</div>
                </div>
                <div className="min-w-[120px]">
                  <div className="text-[10px] text-slate-400">Plasticity Index Ip</div>
                  <div className="font-mono text-amber-400 font-bold text-sm">{classificationResult.plasticityIndex} %</div>
                </div>
                <div className="min-w-[140px]">
                  <div className="text-[10px] text-slate-400">IS 1498 Group</div>
                  <div className="font-mono text-emerald-300 font-bold text-sm">{classificationResult.isClassification}</div>
                </div>
              </>
            )}

            {activeSimId === 'u25ce404-proctor-compaction' && (
              <>
                <div className="min-w-[110px]">
                  <div className="text-[10px] text-slate-400">Optimum Moisture (OMC)</div>
                  <div className="font-mono text-emerald-400 font-bold text-sm">{compactionResult.omcPercent} %</div>
                </div>
                <div className="min-w-[110px]">
                  <div className="text-[10px] text-slate-400">Max Dry Density (MDD)</div>
                  <div className="font-mono text-sky-400 font-bold text-sm">{compactionResult.mddGcm3} g/cm³</div>
                </div>
                <div className="min-w-[120px]">
                  <div className="text-[10px] text-slate-400">Compaction Energy</div>
                  <div className="font-mono text-amber-400 font-bold text-sm">593 kJ/m³</div>
                </div>
              </>
            )}

            {activeSimId === 'u25ce404-permeability-lab' && (
              <>
                <div className="min-w-[130px]">
                  <div className="text-[10px] text-slate-400">Hydraulic Conductivity k</div>
                  <div className="font-mono text-emerald-400 font-bold text-sm">{permeabilityResult.hydraulicConductivityK} cm/s</div>
                </div>
                <div className="min-w-[130px]">
                  <div className="text-[10px] text-slate-400">k (standard 27°C)</div>
                  <div className="font-mono text-sky-400 font-bold text-sm">{permeabilityResult.k27Celsius} cm/s</div>
                </div>
                <div className="min-w-[110px]">
                  <div className="text-[10px] text-slate-400">Hydraulic Gradient i</div>
                  <div className="font-mono text-amber-400 font-bold text-sm">{permeabilityResult.hydraulicGradient}</div>
                </div>
              </>
            )}

            {activeSimId === 'u25ce404-consolidation-lab' && (
              <>
                <div className="min-w-[110px]">
                  <div className="text-[10px] text-slate-400">Applied Pressure σ′</div>
                  <div className="font-mono text-emerald-400 font-bold text-sm">{consolidationResult.appliedStressKPa} kPa</div>
                </div>
                <div className="min-w-[110px]">
                  <div className="text-[10px] text-slate-400">Settlement ΔH</div>
                  <div className="font-mono text-sky-400 font-bold text-sm">{consolidationResult.dialGaugeReadingMm} mm</div>
                </div>
                <div className="min-w-[110px]">
                  <div className="text-[10px] text-slate-400">Current Void Ratio e</div>
                  <div className="font-mono text-amber-400 font-bold text-sm">{consolidationResult.voidRatio}</div>
                </div>
              </>
            )}

            {activeSimId === 'u25ce404-shear-strength-lab' && (
              <>
                <div className="min-w-[120px]">
                  <div className="text-[10px] text-slate-400">Normal Stress σ</div>
                  <div className="font-mono text-emerald-400 font-bold text-sm">{shearStrengthResult.normalStressKPa} kPa</div>
                </div>
                <div className="min-w-[120px]">
                  <div className="text-[10px] text-slate-400">Peak Shear Strength τf</div>
                  <div className="font-mono text-sky-400 font-bold text-sm">{shearStrengthResult.peakShearStressKPa} kPa</div>
                </div>
                {shearTestType === 'ucc' && (
                  <div className="min-w-[120px]">
                    <div className="text-[10px] text-slate-400">UCS qu</div>
                    <div className="font-mono text-amber-400 font-bold text-sm">{shearStrengthResult.quKPa} kPa</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel: Controls & Analysis */}
        <div className="w-full lg:w-[440px] xl:w-[480px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          {/* Tab Bar */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition ${
                activeTab === 'controls' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Controls
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition ${
                activeTab === 'analysis' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('observations')}
              className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition ${
                activeTab === 'observations' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Trials ({trials.length})
            </button>
            <button
              onClick={() => setActiveTab('procedure')}
              className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition ${
                activeTab === 'procedure' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Guide
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition ${
                activeTab === 'quiz' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Quiz
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* ─── CONTROLS TAB ─── */}
            {activeTab === 'controls' && (
              <div className="space-y-4">
                {/* Raycast Component Inspection Drawer */}
                {selectedComponent && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg space-y-1 relative">
                    <button
                      onClick={() => setSelectedComponent(null)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      {selectedComponent.name}
                    </div>
                    <p className="text-slate-300">{selectedComponent.functionDesc}</p>
                    <p className="text-slate-400 text-[11px] font-mono">{selectedComponent.specification}</p>
                    {selectedComponent.safetyCaution && (
                      <div className="flex items-center gap-1 text-amber-400 text-[11px] mt-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        {selectedComponent.safetyCaution}
                      </div>
                    )}
                  </div>
                )}

                {/* Module 1 Controls: Stratigraphy */}
                {activeSimId === 'u25ce404-soil-stratigraphy' && (
                  <div className="space-y-3">
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>Borehole & Ground Stratigraphy</span>
                      <span className="text-[11px] text-slate-400">Total Depth: 8.0 m</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>Phreatic Water Table Depth:</span>
                        <span className="font-mono text-sky-400">{waterTableDepth.toFixed(1)} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="7.5"
                        step="0.5"
                        value={waterTableDepth}
                        onChange={(e) => setWaterTableDepth(parseFloat(e.target.value))}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>Inspection Probe Depth:</span>
                        <span className="font-mono text-emerald-400">{probeDepth.toFixed(1)} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="8.0"
                        step="0.5"
                        value={probeDepth}
                        onChange={(e) => setProbeDepth(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    {/* Stratum Layers Toggles */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="text-slate-300 font-medium text-[11px]">Stratigraphic Strata:</div>
                      {layers.map((lyr, idx) => (
                        <div
                          key={lyr.id}
                          className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/60"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: lyr.color }} />
                            <span className="font-medium text-slate-200">{lyr.name}</span>
                          </div>
                          <span className="font-mono text-slate-400 text-[11px]">
                            {lyr.depthTop} - {lyr.depthBottom}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Module 2 Controls: Classification */}
                {activeSimId === 'u25ce404-soil-classification' && (
                  <div className="space-y-3">
                    <div className="font-semibold text-slate-200">Mechanical Sieve Shaker & Atterberg Limits</div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsShakingActive(!isShakingActive)}
                        className={`flex-1 py-2 rounded font-medium flex items-center justify-center gap-1.5 transition ${
                          isShakingActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isShakingActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isShakingActive ? 'Stop Shaker' : 'Start Sieve Shaker (10 min)'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="space-y-1">
                        <label className="text-slate-300 text-[11px]">Liquid Limit wL (%):</label>
                        <input
                          type="number"
                          value={liquidLimit}
                          onChange={(e) => setLiquidLimit(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-300 text-[11px]">Plastic Limit wP (%):</label>
                        <input
                          type="number"
                          value={plasticLimit}
                          onChange={(e) => setPlasticLimit(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Module 3 Controls: Proctor Compaction */}
                {activeSimId === 'u25ce404-proctor-compaction' && (
                  <div className="space-y-3">
                    <div className="font-semibold text-slate-200">Standard Proctor Dynamic Compaction</div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>Soil Moisture Content w:</span>
                        <span className="font-mono text-emerald-400">{compactionWaterPercent} %</span>
                      </div>
                      <input
                        type="range"
                        min="6"
                        max="24"
                        step="1"
                        value={compactionWaterPercent}
                        onChange={(e) => setCompactionWaterPercent(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (simInstanceRef.current instanceof ProctorCompactionScene) {
                          simInstanceRef.current.triggerCompactionBlow();
                        }
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Trigger Rammer Blow (2.6 kg @ 310 mm)
                    </button>
                  </div>
                )}

                {/* Module 4 Controls: Permeability */}
                {activeSimId === 'u25ce404-permeability-lab' && (
                  <div className="space-y-3">
                    <div className="font-semibold text-slate-200">Permeameter Apparatus Controls</div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPermTestType('constant-head')}
                        className={`py-1.5 text-xs rounded font-medium border ${
                          permTestType === 'constant-head'
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Constant-Head (Sand)
                      </button>
                      <button
                        onClick={() => setPermTestType('falling-head')}
                        className={`py-1.5 text-xs rounded font-medium border ${
                          permTestType === 'falling-head'
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Falling-Head (Silt/Clay)
                      </button>
                    </div>

                    {permTestType === 'constant-head' ? (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-300 text-[11px]">
                            <span>Head Difference h:</span>
                            <span className="font-mono text-sky-400">{headDiffMm} mm</span>
                          </div>
                          <input
                            type="range"
                            min="100"
                            max="600"
                            step="20"
                            value={headDiffMm}
                            onChange={(e) => setHeadDiffMm(parseFloat(e.target.value))}
                            className="w-full accent-sky-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-300 text-[11px]">
                            <span>Duration t:</span>
                            <span className="font-mono text-emerald-400">{permDurationSec} s</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="300"
                            step="10"
                            value={permDurationSec}
                            onChange={(e) => setPermDurationSec(parseFloat(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-300 text-[11px]">
                            <span>Initial Standpipe Head h1:</span>
                            <span className="font-mono text-sky-400">{standpipeH1Mm} mm</span>
                          </div>
                          <input
                            type="range"
                            min="500"
                            max="1000"
                            step="50"
                            value={standpipeH1Mm}
                            onChange={(e) => setStandpipeH1Mm(parseFloat(e.target.value))}
                            className="w-full accent-sky-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-300 text-[11px]">
                            <span>Final Standpipe Head h2:</span>
                            <span className="font-mono text-amber-400">{standpipeH2Mm} mm</span>
                          </div>
                          <input
                            type="range"
                            min="100"
                            max="450"
                            step="25"
                            value={standpipeH2Mm}
                            onChange={(e) => setStandpipeH2Mm(parseFloat(e.target.value))}
                            className="w-full accent-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Module 5 Controls: Consolidation */}
                {activeSimId === 'u25ce404-consolidation-lab' && (
                  <div className="space-y-3">
                    <div className="font-semibold text-slate-200">1D Oedometer Stage Loading (10:1 Lever)</div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 text-[11px]">Standard Pressure Increment σ′ (kPa):</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[25, 50, 100, 200, 400, 800].map((load) => (
                          <button
                            key={load}
                            onClick={() => {
                              setConsolidationLoadKPa(load);
                              setCumulativeSettlementMm((prev) => prev + 0.15);
                            }}
                            className={`py-1.5 rounded font-mono text-xs border ${
                              consolidationLoadKPa === load
                                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {load} kPa
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Module 6 Controls: Shear Strength */}
                {activeSimId === 'u25ce404-shear-strength-lab' && (
                  <div className="space-y-3">
                    <div className="font-semibold text-slate-200">Shear Strength Test Configuration</div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShearTestType('direct-shear')}
                        className={`py-1.5 text-xs rounded font-medium border ${
                          shearTestType === 'direct-shear'
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Direct Shear Test
                      </button>
                      <button
                        onClick={() => setShearTestType('ucc')}
                        className={`py-1.5 text-xs rounded font-medium border ${
                          shearTestType === 'ucc'
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        UCC Test (Cohesive)
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>Normal Stress σ:</span>
                        <span className="font-mono text-emerald-400">{shearNormalStressKPa} kPa</span>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="200"
                        step="25"
                        value={shearNormalStressKPa}
                        onChange={(e) => setShearNormalStressKPa(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <button
                      onClick={() => setIsShearTestingActive(!isShearTestingActive)}
                      className={`w-full py-2 rounded font-medium flex items-center justify-center gap-1.5 transition ${
                        isShearTestingActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isShearTestingActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isShearTestingActive ? 'Pause Shear Test' : 'Run Motorized Shear Drive'}
                    </button>
                  </div>
                )}

                {/* Trial Recording Button */}
                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={handleRecordTrial}
                    className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <Table className="w-3.5 h-3.5" />
                    Record Current Experimental Trial
                  </button>
                </div>
              </div>
            )}

            {/* ─── ANALYSIS & CHARTS TAB ─── */}
            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <div className="font-semibold text-slate-200">Analytical Curves & Mathematical Derivations</div>

                {/* SVG Graph for Active Experiment */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-[11px] font-medium text-slate-400">
                    {activeSimId === 'u25ce404-soil-stratigraphy' && 'Vertical Stress Distribution (Total, Pore Water & Effective)'}
                    {activeSimId === 'u25ce404-soil-classification' && 'Semi-Log Particle-Size Distribution Curve'}
                    {activeSimId === 'u25ce404-proctor-compaction' && 'Dry Density vs Moisture Content (Compaction & ZAV)'}
                    {activeSimId === 'u25ce404-permeability-lab' && 'Discharge Velocity vs Hydraulic Gradient'}
                    {activeSimId === 'u25ce404-consolidation-lab' && 'Void Ratio vs Log Effective Pressure (e - log σ′)'}
                    {activeSimId === 'u25ce404-shear-strength-lab' && 'Mohr-Coulomb Shear Failure Envelope (τ vs σ)'}
                  </div>

                  {/* SVG Canvas Chart */}
                  <svg viewBox="0 0 320 180" className="w-full h-44 bg-slate-900 rounded border border-slate-800">
                    {activeSimId === 'u25ce404-soil-stratigraphy' && (
                      <>
                        <line x1="40" y1="20" x2="40" y2="150" stroke="#475569" strokeWidth="1" />
                        <line x1="40" y1="150" x2="300" y2="150" stroke="#475569" strokeWidth="1" />
                        {/* Total Stress line */}
                        <path d="M 40 20 L 140 70 L 280 150" fill="none" stroke="#10b981" strokeWidth="2" />
                        {/* Effective Stress line */}
                        <path d="M 40 20 L 140 70 L 220 150" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
                        {/* Pore pressure line */}
                        <path d="M 40 70 L 100 150" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                        <text x="50" y="15" fill="#94a3b8" fontSize="8">
                          σ (Green), σ′ (Amber), u (Blue)
                        </text>
                      </>
                    )}

                    {activeSimId === 'u25ce404-soil-classification' && (
                      <>
                        <line x1="40" y1="20" x2="40" y2="150" stroke="#475569" strokeWidth="1" />
                        <line x1="40" y1="150" x2="300" y2="150" stroke="#475569" strokeWidth="1" />
                        {/* S-curve for gradation */}
                        <path
                          d="M 50 145 C 100 140, 140 100, 200 60 S 280 25, 290 20"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                        />
                        <circle cx="120" cy="110" r="3" fill="#f59e0b" />
                        <text x="125" y="115" fill="#f59e0b" fontSize="8">
                          D10
                        </text>
                        <circle cx="180" cy="75" r="3" fill="#f59e0b" />
                        <text x="185" y="80" fill="#f59e0b" fontSize="8">
                          D30
                        </text>
                        <circle cx="230" cy="45" r="3" fill="#f59e0b" />
                        <text x="235" y="50" fill="#f59e0b" fontSize="8">
                          D60
                        </text>
                      </>
                    )}

                    {activeSimId === 'u25ce404-proctor-compaction' && (
                      <>
                        <line x1="40" y1="20" x2="40" y2="150" stroke="#475569" strokeWidth="1" />
                        <line x1="40" y1="150" x2="300" y2="150" stroke="#475569" strokeWidth="1" />
                        {/* Parabolic Compaction Curve */}
                        <path
                          d="M 50 130 Q 150 40 270 140"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                        />
                        {/* Zero Air Voids ZAV line */}
                        <path d="M 60 70 Q 180 50 280 90" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3" />
                        <circle cx="150" cy="55" r="4" fill="#f59e0b" />
                        <text x="155" y="50" fill="#f59e0b" fontSize="8">
                          OMC ({compactionResult.omcPercent}%), MDD ({compactionResult.mddGcm3})
                        </text>
                      </>
                    )}

                    {activeSimId === 'u25ce404-shear-strength-lab' && (
                      <>
                        <line x1="40" y1="20" x2="40" y2="150" stroke="#475569" strokeWidth="1" />
                        <line x1="40" y1="150" x2="300" y2="150" stroke="#475569" strokeWidth="1" />
                        {/* Mohr Coulomb line */}
                        <line x1="40" y1="120" x2="280" y2="40" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx="40" cy="120" r="3" fill="#38bdf8" />
                        <text x="45" y="118" fill="#38bdf8" fontSize="8">
                          c = {shearCohesionKPa} kPa
                        </text>
                        <text x="200" y="55" fill="#f59e0b" fontSize="8">
                          φ = {shearFrictionAngleDeg}°
                        </text>
                      </>
                    )}

                    {activeSimId === 'u25ce404-consolidation-lab' && (
                      <>
                        <line x1="40" y1="20" x2="40" y2="150" stroke="#475569" strokeWidth="1" />
                        <line x1="40" y1="150" x2="300" y2="150" stroke="#475569" strokeWidth="1" />
                        {/* e - log p curve */}
                        <path d="M 50 30 Q 120 40 270 140" fill="none" stroke="#10b981" strokeWidth="2.5" />
                        <text x="140" y="100" fill="#f59e0b" fontSize="8">
                          Cc = 0.28 (Slope)
                        </text>
                      </>
                    )}

                    {activeSimId === 'u25ce404-permeability-lab' && (
                      <>
                        <line x1="40" y1="20" x2="40" y2="150" stroke="#475569" strokeWidth="1" />
                        <line x1="40" y1="150" x2="300" y2="150" stroke="#475569" strokeWidth="1" />
                        {/* v = k * i line */}
                        <line x1="40" y1="150" x2="270" y2="30" stroke="#38bdf8" strokeWidth="2.5" />
                        <text x="120" y="80" fill="#38bdf8" fontSize="8">
                          v = k · i (Darcy's Law)
                        </text>
                      </>
                    )}
                  </svg>
                </div>

                {/* Mathematical Derivation Steps */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-semibold text-emerald-400 text-xs">Mathematical Substitution & Derivations</div>
                  {activeSimId === 'u25ce404-soil-stratigraphy' && (
                    <div className="space-y-1 font-mono text-[11px] text-slate-300">
                      <div>1. σ = Σ (γ_i · Δz_i) = {stratigraphyStress.totalStress} kPa</div>
                      <div>2. u = γw · max(0, z - zw) = 9.81 · ({probeDepth} - {waterTableDepth}) = {stratigraphyStress.poreWaterPressure} kPa</div>
                      <div>3. σ′ = σ - u = {stratigraphyStress.totalStress} - {stratigraphyStress.poreWaterPressure} = {stratigraphyStress.effectiveStress} kPa</div>
                    </div>
                  )}

                  {activeSimId === 'u25ce404-soil-classification' && (
                    <div className="space-y-1 font-mono text-[11px] text-slate-300">
                      <div>1. Cu = D60 / D10 = {classificationResult.d60} / {classificationResult.d10} = {classificationResult.cu}</div>
                      <div>2. Cc = (D30)² / (D10 · D60) = ({classificationResult.d30})² / ({classificationResult.d10} · {classificationResult.d60}) = {classificationResult.cc}</div>
                      <div>3. A-Line: Ip = 0.73 · (wL - 20) = 0.73 · ({liquidLimit} - 20) = {classificationResult.aLineIp}%</div>
                    </div>
                  )}

                  {activeSimId === 'u25ce404-proctor-compaction' && (
                    <div className="space-y-1 font-mono text-[11px] text-slate-300">
                      <div>1. ρ = M_soil / V = M / 1000 cm³</div>
                      <div>2. ρd = ρ / (1 + w)</div>
                      <div>3. ρzav = (Gs · ρw) / (1 + w · Gs) = ({compactionSoilSpecificGravity} · 1.0) / (1 + w · {compactionSoilSpecificGravity})</div>
                    </div>
                  )}

                  {activeSimId === 'u25ce404-permeability-lab' && (
                    <div className="space-y-1 font-mono text-[11px] text-slate-300">
                      <div>1. Constant Head: k = (Q · L) / (A · h · t)</div>
                      <div>2. Falling Head: k = (a · L) / (A · t) · ln(h1 / h2)</div>
                      <div>3. k27 = k · (μT / μ27) = {permeabilityResult.k27Celsius} cm/s</div>
                    </div>
                  )}

                  {activeSimId === 'u25ce404-consolidation-lab' && (
                    <div className="space-y-1 font-mono text-[11px] text-slate-300">
                      <div>1. Hs = H0 / (1 + e0)</div>
                      <div>2. Δe = (ΔH / Hs)</div>
                      <div>3. cv = (0.197 · d²) / t50 = {consolidationResult.cvCm2PerSec} cm²/s</div>
                    </div>
                  )}

                  {activeSimId === 'u25ce404-shear-strength-lab' && (
                    <div className="space-y-1 font-mono text-[11px] text-slate-300">
                      <div>1. Mohr-Coulomb: τf = c + σ · tan(φ)</div>
                      <div>2. UCC: Ac = A0 / (1 - ε), qu = P / Ac</div>
                      <div>3. Undrained Shear Strength: cu = qu / 2 = {shearStrengthResult.cuKPa} kPa</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── OBSERVATIONS TAB ─── */}
            {activeTab === 'observations' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Recorded Observations ({trials.length})</span>
                  {trials.length > 0 && (
                    <button
                      onClick={handleExportCSV}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 border border-slate-700"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                  )}
                </div>

                {trials.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
                    No trials recorded yet. Click "Record Current Experimental Trial" in the Controls tab to add readings.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trials.map((t) => (
                      <div key={t.trialId} className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-emerald-400">
                          <span>{t.module}</span>
                          <span className="text-slate-500">{t.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                          {Object.entries(t.calculated).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-slate-500">{k}: </span>
                              <span className="font-mono text-slate-200">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── PROCEDURE GUIDE TAB ─── */}
            {activeTab === 'procedure' && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-200">Laboratory Standard Operating Procedure</div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-slate-300">
                  <div className="font-medium text-emerald-400">IS Code References & Methodology:</div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                    <li>IS 1498: Classification and identification of soils for general engineering purposes.</li>
                    <li>IS 2720 (Part 4): Determination of grain size analysis (dry and wet sieving).</li>
                    <li>IS 2720 (Part 5): Determination of liquid and plastic limit.</li>
                    <li>IS 2720 (Part 7): Determination of moisture-density relation (Proctor compaction).</li>
                    <li>IS 2720 (Part 15): Determination of consolidation properties (Oedometer).</li>
                    <li>IS 2720 (Part 17): Determination of permeability (Constant & falling head).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ─── QUIZ TAB ─── */}
            {activeTab === 'quiz' && (
              <div className="space-y-3">
                <div className="font-semibold text-slate-200">Interactive Concept Check (Viva Voce)</div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <p className="font-medium text-slate-200">
                    Q1: For a submerged soil layer, what is the relationship between total stress, effective stress, and pore pressure?
                  </p>
                  <div className="space-y-1 text-[11px]">
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Correct: σ′ = σ - u (Terzaghi’s Effective Stress Principle).
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <p className="font-medium text-slate-200">
                    Q2: In standard Proctor compaction, what is the weight and free fall drop of the rammer per IS 2720 Part 7?
                  </p>
                  <div className="space-y-1 text-[11px]">
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Correct: 2.6 kg hammer with a 310 mm free drop height.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Laboratory Report Modal ─── */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Virtual Laboratory Engineering Report</h3>
              </div>
              <button onClick={() => setIsReportOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">KPR Institute of Engineering and Technology</h2>
                <p className="text-emerald-400 font-medium">Department of Civil Engineering · Semester IV</p>
                <p className="text-slate-400">Course: U25CE404 Geotechnical Engineering I</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200">1. Experiment Title:</h4>
                <p className="text-slate-300">
                  Virtual Simulation & Telemetry Analysis of {activeSimId.replace('u25ce404-', '').replace(/-/g, ' ').toUpperCase()}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200">2. Apparatus & Specifications:</h4>
                <p className="text-slate-400">
                  Standard 3D interactive virtual laboratory testing apparatus compliant with Indian Standards (IS 2720 / IS 1498).
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200">3. Recorded Experimental Trials:</h4>
                {trials.length === 0 ? (
                  <p className="text-slate-500 italic">No trials recorded yet.</p>
                ) : (
                  <table className="w-full border border-slate-800 text-[11px] mt-2">
                    <thead>
                      <tr className="bg-slate-800 text-slate-300">
                        <th className="p-1 border border-slate-700">Trial</th>
                        <th className="p-1 border border-slate-700">Inputs</th>
                        <th className="p-1 border border-slate-700">Key Calculated Results</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trials.map((t, idx) => (
                        <tr key={t.trialId} className="border-b border-slate-800">
                          <td className="p-1 text-center font-mono">#{idx + 1}</td>
                          <td className="p-1 font-mono text-[10px]">{JSON.stringify(t.inputs)}</td>
                          <td className="p-1 font-mono text-[10px] text-emerald-400">{JSON.stringify(t.calculated)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-slate-200">4. Engineering Discussion & Conclusion:</h4>
                <p className="text-slate-400">
                  Experimental calculations strictly conform to Terzaghi effective stress theory, Darcy flow regimes, and IS 2720 standard geotechnical laboratory procedures.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium flex items-center gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
              <button
                onClick={() => setIsReportOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
