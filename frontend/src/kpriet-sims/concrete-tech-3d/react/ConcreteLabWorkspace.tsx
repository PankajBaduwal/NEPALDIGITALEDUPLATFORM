import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  Cpu,
  Compass,
  CheckCircle2,
  FileText,
  Sliders,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import type {
  ConcreteSimId,
  ConcreteGrade,
  IBatchingInputs,
  ISlumpTestParams,
  ICuringParams,
  ICompressionTestParams,
  CuringRegime,
  SpecimenGeometry,
} from '../core/types';
import { CONCRETE_MIX_PROPORTIONS } from '../core/ConcreteMixData';
import { ConcreteCalculator } from '../core/ConcreteCalculator';
import { ConcreteBatchingScene } from '../simulations/01-batching/ConcreteBatchingScene';
import { SlumpTestScene } from '../simulations/02-slump/SlumpTestScene';
import { CuringLabScene } from '../simulations/03-curing/CuringLabScene';
import { CompressiveStrengthScene } from '../simulations/04-compressive-strength/CompressiveStrengthScene';

interface ConcreteLabWorkspaceProps {
  simulationId: string;
  onBack?: () => void;
}

export const ConcreteLabWorkspace: React.FC<ConcreteLabWorkspaceProps> = ({
  simulationId,
  onBack,
}) => {
  // Normalize simulation ID
  const activeSimId: ConcreteSimId = useMemo(() => {
    if (simulationId.includes('batching') || simulationId.includes('mix')) return '01-batching';
    if (simulationId.includes('slump') || simulationId.includes('workability')) return '02-slump';
    if (simulationId.includes('curing') || simulationId.includes('hydration')) return '03-curing';
    if (simulationId.includes('compressive') || simulationId.includes('strength')) return '04-compressive-strength';
    return '01-batching';
  }, [simulationId]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneInstanceRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'guided' | 'theory' | 'applications'>('controls');
  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);

  // 1. Batching State
  const [batchInputs, setBatchInputs] = useState<IBatchingInputs>({
    grade: 'M25',
    batchVolumeLiters: 25,
    cementMassKg: 10.2,
    fineAggregateMassKg: 17.5,
    coarseAggregateMassKg: 35.0,
    waterMassKg: 4.6,
    fineAggregateMoisturePct: 1.5,
    coarseAggregateMoisturePct: 0.5,
  });

  // 2. Slump Test State
  const [slumpParams, setSlumpParams] = useState<ISlumpTestParams>({
    waterCementRatio: 0.45,
    fineAggregateRatio: 1.0,
    aggregateShape: 'angular',
    tampingRodsCountPerLayer: 25,
    layersCount: 4,
    liftRate: 'smooth_vertical',
  });
  const [isConeLifted, setIsConeLifted] = useState<boolean>(false);

  // 3. Curing State
  const [curingParams, setCuringParams] = useState<ICuringParams>({
    grade: 'M25',
    curingRegime: 'water_submersion_27c',
    ageDays: 28,
    relativeHumidityPct: 90,
    temperatureC: 27,
  });

  // 4. Compressive Strength State
  const [compressionParams, setCompressionParams] = useState<ICompressionTestParams>({
    specimenGeometry: 'cube_150mm',
    concreteGrade: 'M25',
    ageDays: 28,
    curingRegime: 'water_submersion_27c',
    measuredWidthMm: 150,
    measuredDepthMm: 150,
    measuredHeightMm: 150,
    centeringOffsetMm: 0,
    loadingRateKnSec: 7.0, // ~0.31 MPa/s
    appliedLoadKn: 0,
  });

  // Calculations
  const batchResult = useMemo(() => ConcreteCalculator.calculateBatching(batchInputs), [batchInputs]);
  const slumpResult = useMemo(() => ConcreteCalculator.calculateSlump(slumpParams), [slumpParams]);
  const curingResult = useMemo(() => ConcreteCalculator.calculateCuringProgress(curingParams), [curingParams]);
  const compressionResult = useMemo(() => ConcreteCalculator.calculateCompressiveStrength(compressionParams), [compressionParams]);

  // Mount Three.js Scene
  useEffect(() => {
    if (!viewportRef.current) return;

    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.dispose();
      sceneInstanceRef.current = null;
    }

    if (activeSimId === '01-batching') {
      const scene = new ConcreteBatchingScene(viewportRef.current);
      sceneInstanceRef.current = scene;
      scene.updateExperiment(batchInputs, batchResult);
    } else if (activeSimId === '02-slump') {
      const scene = new SlumpTestScene(viewportRef.current);
      sceneInstanceRef.current = scene;
      scene.setConeLifted(isConeLifted);
      scene.updateExperiment(slumpParams, slumpResult);
    } else if (activeSimId === '03-curing') {
      const scene = new CuringLabScene(viewportRef.current);
      sceneInstanceRef.current = scene;
      scene.updateExperiment(curingParams, curingResult);
    } else if (activeSimId === '04-compressive-strength') {
      const scene = new CompressiveStrengthScene(viewportRef.current);
      sceneInstanceRef.current = scene;
      scene.updateExperiment(compressionParams, compressionResult);
    }

    return () => {
      if (sceneInstanceRef.current) {
        sceneInstanceRef.current.dispose();
        sceneInstanceRef.current = null;
      }
    };
  }, [activeSimId]);

  // Sync 3D Scene when state changes
  useEffect(() => {
    if (!sceneInstanceRef.current) return;
    if (activeSimId === '01-batching') {
      sceneInstanceRef.current.setMixing(isPlaying);
      sceneInstanceRef.current.updateExperiment(batchInputs, batchResult);
    } else if (activeSimId === '02-slump') {
      sceneInstanceRef.current.setConeLifted(isConeLifted);
      sceneInstanceRef.current.updateExperiment(slumpParams, slumpResult);
    } else if (activeSimId === '03-curing') {
      sceneInstanceRef.current.updateExperiment(curingParams, curingResult);
    } else if (activeSimId === '04-compressive-strength') {
      sceneInstanceRef.current.updateExperiment(compressionParams, compressionResult);
    }
  }, [activeSimId, batchInputs, batchResult, slumpParams, slumpResult, isConeLifted, curingParams, curingResult, compressionParams, compressionResult, isPlaying]);

  // Live simulation tick for CTM loading
  useEffect(() => {
    let timer: number;
    if (isPlaying && activeSimId === '04-compressive-strength') {
      timer = window.setInterval(() => {
        setCompressionParams((prev) => {
          const maxFailureKn = compressionResult.failureLoadKn;
          if (prev.appliedLoadKn >= maxFailureKn) {
            setIsPlaying(false);
            return { ...prev, appliedLoadKn: maxFailureKn };
          }
          const stepKn = prev.loadingRateKnSec * 0.1;
          return {
            ...prev,
            appliedLoadKn: Math.min(maxFailureKn, prev.appliedLoadKn + stepKn),
          };
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeSimId, compressionResult]);

  // 2D Canvas Chart Renderer
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark terminal grid
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 40; x < w - 20; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 15);
      ctx.lineTo(x, h - 25);
      ctx.stroke();
    }
    for (let y = 15; y < h - 25; y += 25) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 15);
    ctx.lineTo(40, h - 25);
    ctx.lineTo(w - 20, h - 25);
    ctx.stroke();

    if (activeSimId === '03-curing' || activeSimId === '01-batching') {
      // 90-day Curing Strength Development Curve
      const pts = curingResult.curve;
      const maxStrength = 55;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const cx = 40 + (pt.day / 90) * (w - 70);
        const cy = (h - 25) - (pt.strengthMpa / maxStrength) * (h - 45);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();

      // Current age indicator point
      const curX = 40 + (curingParams.ageDays / 90) * (w - 70);
      const curY = (h - 25) - (curingResult.strengthMpa / maxStrength) * (h - 45);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('Curing Age (Days)', w / 2, h - 6);
      ctx.save();
      ctx.translate(14, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Strength (MPa)', 0, 0);
      ctx.restore();
    } else if (activeSimId === '04-compressive-strength') {
      // Stress-Strain Hognestad curve for concrete compression
      const pts = compressionResult.fractureStressCurve;
      const maxStress = compressionResult.characteristicTargetMpa * 1.5;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const cx = 40 + (pt.strain / 0.0035) * (w - 70);
        const cy = (h - 25) - (pt.stressMpa / maxStress) * (h - 45);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('Compressive Strain (ε)', w / 2, h - 6);
      ctx.save();
      ctx.translate(14, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Stress σ (MPa)', 0, 0);
      ctx.restore();
    } else if (activeSimId === '02-slump') {
      // Slump subsidence spectrum
      ctx.fillStyle = '#0284c7';
      const slumpW = Math.min(w - 70, (slumpResult.slumpHeightMm / 300) * (w - 70));
      ctx.fillRect(40, h / 2 - 15, slumpW, 30);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`Measured Slump: ${slumpResult.slumpHeightMm} mm (${slumpResult.slumpType.toUpperCase()} SLUMP)`, 50, h / 2 + 5);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('Slump Subsidence Range (0 mm to 300 mm)', w / 2 - 50, h - 6);
    }
  }, [activeSimId, curingResult, compressionResult, slumpResult, curingParams]);

  // Guided prediction evaluation
  const handlePredict = (choice: string) => {
    if (activeSimId === '01-batching') {
      if (choice === 'w/c') {
        setPredictionFeedback('Correct! Abram’s Law states compressive strength is inversely proportional to water-cement ratio by mass.');
      } else {
        setPredictionFeedback('Incorrect. Increasing water increases fluidity but drastically reduces 28-day compressive strength.');
      }
    } else if (activeSimId === '02-slump') {
      if (choice === 'true') {
        setPredictionFeedback('Correct! A true slump subsides uniformly without shearing off or collapsing to the side.');
      } else {
        setPredictionFeedback('Review: A shear slump shears along a diagonal plane indicating harshness or lack of cohesion.');
      }
    } else if (activeSimId === '04-compressive-strength') {
      if (choice === 'pyramid') {
        setPredictionFeedback('Correct! Uniaxial compression produces standard hourglass / semi-pyramidal shear fracture due to platen friction confinement.');
      } else {
        setPredictionFeedback('Review: Platen restraint suppresses lateral expansion at top/bottom faces, forcing failure along 45° internal shear planes.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded">
                U25CE304
              </span>
              <h1 className="text-sm font-bold text-white tracking-wide">
                {activeSimId === '01-batching' && 'Concrete Mix Proportioning & Batching Laboratory (IS 10262)'}
                {activeSimId === '02-slump' && 'Standard Slump Test & Fresh Rheology Laboratory (IS 1199)'}
                {activeSimId === '03-curing' && 'Concrete Hydration & Accelerated Curing Laboratory (IS 516)'}
                {activeSimId === '04-compressive-strength' && 'Concrete Compressive Strength Testing Laboratory (IS 516)'}
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Civil Engineering — Semester III | Autonomous R2025 Revised CBCS
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => sceneInstanceRef.current?.resetCamera()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
          <button
            onClick={() => sceneInstanceRef.current?.setFrontView()}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            Front
          </button>
          <button
            onClick={() => sceneInstanceRef.current?.setTopView()}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            Top
          </button>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <button
            onClick={() => {
              setIsPlaying(false);
              setIsConeLifted(false);
              setCompressionParams((p) => ({ ...p, appliedLoadKn: 0 }));
              setGuidedStep(1);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/80 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Rig</span>
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
            >
              Back
            </button>
          )}
        </div>
      </header>

      {/* Main Viewport + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: 3D Viewport with Live Sensor HUD Overlay */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-slate-950">
          <div ref={viewportRef} className="flex-1 w-full h-full relative" />

          {/* Floating Sensor Telemetry */}
          <div className="absolute top-4 left-4 p-3 bg-slate-900/85 border border-slate-700/80 rounded-xl backdrop-blur-md shadow-2xl pointer-events-none min-w-[240px]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2 border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                CONCRETE METRICS
              </span>
              <span className="text-emerald-400">CALIBRATED</span>
            </div>

            {activeSimId === '01-batching' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Grade:</span>
                  <span className="font-mono font-bold text-sky-400">{batchInputs.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Mass:</span>
                  <span className="font-mono font-bold text-emerald-400">{batchResult.totalBatchMassKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Effective w/c:</span>
                  <span className="font-mono font-bold text-amber-400">{batchResult.effectiveWaterCementRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mix Quality:</span>
                  <span className="font-semibold text-white capitalize">{batchResult.status}</span>
                </div>
              </div>
            )}

            {activeSimId === '02-slump' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Slump Height:</span>
                  <span className="font-mono font-bold text-sky-400">{slumpResult.slumpHeightMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Slump Profile:</span>
                  <span className="font-mono font-bold text-amber-400 uppercase">{slumpResult.slumpType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Workability:</span>
                  <span className="font-semibold text-emerald-400 capitalize">{slumpResult.workabilityDegree.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Compaction Factor:</span>
                  <span className="font-mono font-bold text-purple-400">{slumpResult.compactionFactorEst}</span>
                </div>
              </div>
            )}

            {activeSimId === '03-curing' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Age:</span>
                  <span className="font-mono font-bold text-sky-400">{curingResult.ageDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Strength:</span>
                  <span className="font-mono font-bold text-emerald-400">{curingResult.strengthMpa} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">28-Day Ratio:</span>
                  <span className="font-mono font-bold text-amber-400">{curingResult.pctOf28DayStrength}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hydration Degree:</span>
                  <span className="font-mono font-bold text-purple-400">{curingResult.hydrationDegree}</span>
                </div>
              </div>
            )}

            {activeSimId === '04-compressive-strength' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Applied Load:</span>
                  <span className="font-mono font-bold text-sky-400">{compressionParams.appliedLoadKn.toFixed(1)} kN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Failure Load:</span>
                  <span className="font-mono font-bold text-rose-400">{compressionResult.failureLoadKn.toFixed(1)} kN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Strength (f_c):</span>
                  <span className="font-mono font-bold text-amber-400">{compressionResult.compressiveStrengthMpa} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Compliance:</span>
                  <span className="font-semibold text-emerald-400 uppercase">{compressionResult.complianceStatus}</span>
                </div>
              </div>
            )}
          </div>

          {/* Synchronized Live Graphs Strip */}
          <div className="h-44 bg-slate-900/90 border-t border-slate-800 p-2 flex items-center justify-between gap-4">
            <div className="flex-1 h-full flex flex-col">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1 px-2">
                <span>
                  {activeSimId === '01-batching' && 'BATCH STRENGTH PREDICTION CURVE (IS 10262)'}
                  {activeSimId === '02-slump' && 'SLUMP SUBSIDENCE RANGE (IS 1199)'}
                  {activeSimId === '03-curing' && '90-DAY CONCRETE STRENGTH MATURITY CURVE'}
                  {activeSimId === '04-compressive-strength' && 'NON-LINEAR COMPRESSIVE CONSTITUTIVE CURVE (IS 456)'}
                </span>
                <span className="text-[10px] text-slate-500">Live Mathematical Synchrony</span>
              </div>
              <div className="flex-1 w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative">
                <canvas ref={chartCanvasRef} width={640} height={130} className="w-full h-full block" />
              </div>
            </div>

            {/* Quick Action Button for Mixer or Slump Cone or CTM */}
            {activeSimId === '01-batching' && (
              <div className="w-48 flex flex-col justify-center gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 text-center">CONCRETE MIXER</div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition shadow-lg ${
                    isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'STOP MIXER' : 'OPERATE MIXER'}</span>
                </button>
              </div>
            )}

            {activeSimId === '02-slump' && (
              <div className="w-48 flex flex-col justify-center gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 text-center">CONE ACTION</div>
                <button
                  onClick={() => setIsConeLifted(!isConeLifted)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition shadow-lg"
                >
                  <span>{isConeLifted ? 'LOWER CONE' : 'LIFT CONE VERTICALLY'}</span>
                </button>
              </div>
            )}

            {activeSimId === '04-compressive-strength' && (
              <div className="w-48 flex flex-col justify-center gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 text-center">HYDRAULIC RAM</div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={compressionParams.appliedLoadKn >= compressionResult.failureLoadKn}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition shadow-lg ${
                    compressionParams.appliedLoadKn >= compressionResult.failureLoadKn
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'PAUSE TEST' : 'APPLY LOAD (CTM)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Controls & Educational Panels */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-10 shadow-2xl">
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'controls' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Controls
            </button>
            <button
              onClick={() => setActiveTab('guided')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'guided' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Guided
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'theory' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Theory
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'applications' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Civil App
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. CONTROLS TAB */}
            {activeTab === 'controls' && (
              <div className="space-y-4 text-xs">
                {activeSimId === '01-batching' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Target Concrete Grade</label>
                      <select
                        value={batchInputs.grade}
                        onChange={(e) => setBatchInputs((p) => ({ ...p, grade: e.target.value as ConcreteGrade }))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium"
                      >
                        {Object.keys(CONCRETE_MIX_PROPORTIONS).map((g) => (
                          <option key={g} value={g}>{g} Grade Concrete (f'ck = {CONCRETE_MIX_PROPORTIONS[g as ConcreteGrade].targetStrength28DaysMpa} MPa)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Water Added</span>
                        <span className="text-sky-400 font-mono">{batchInputs.waterMassKg.toFixed(1)} kg</span>
                      </div>
                      <input
                        type="range"
                        min={2.0}
                        max={10.0}
                        step={0.1}
                        value={batchInputs.waterMassKg}
                        onChange={(e) => setBatchInputs((p) => ({ ...p, waterMassKg: Number(e.target.value) }))}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Cement Batch Mass</span>
                        <span className="text-amber-400 font-mono">{batchInputs.cementMassKg.toFixed(1)} kg</span>
                      </div>
                      <input
                        type="range"
                        min={5.0}
                        max={20.0}
                        step={0.2}
                        value={batchInputs.cementMassKg}
                        onChange={(e) => setBatchInputs((p) => ({ ...p, cementMassKg: Number(e.target.value) }))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Fine Aggregate Moisture</span>
                        <span className="text-purple-400 font-mono">{batchInputs.fineAggregateMoisturePct}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={6.0}
                        step={0.5}
                        value={batchInputs.fineAggregateMoisturePct}
                        onChange={(e) => setBatchInputs((p) => ({ ...p, fineAggregateMoisturePct: Number(e.target.value) }))}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] space-y-1">
                      <div className="text-slate-400 font-semibold">Moisture Correction Required:</div>
                      <div>• Reduce water by: <strong className="text-sky-400">{batchResult.moistureCorrectionKg.fineAggregateAdjKg + batchResult.moistureCorrectionKg.coarseAggregateAdjKg} kg</strong></div>
                      <div>• Total batch yield: <strong className="text-emerald-400">{batchResult.yieldVolumeLiters} L</strong></div>
                    </div>
                  </div>
                )}

                {activeSimId === '02-slump' && (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Water-Cement Ratio (w/c)</span>
                        <span className="text-sky-400 font-mono">{slumpParams.waterCementRatio.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.32}
                        max={0.75}
                        step={0.02}
                        value={slumpParams.waterCementRatio}
                        onChange={(e) => setSlumpParams((p) => ({ ...p, waterCementRatio: Number(e.target.value) }))}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Aggregate Morphology</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['rounded', 'angular', 'flaky'] as const).map((shape) => (
                          <button
                            key={shape}
                            onClick={() => setSlumpParams((p) => ({ ...p, aggregateShape: shape }))}
                            className={`py-1.5 text-xs font-semibold rounded-lg border capitalize transition ${
                              slumpParams.aggregateShape === shape
                                ? 'bg-emerald-600 border-emerald-400 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            {shape}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Tamping Strokes / Layer</span>
                        <span className="text-amber-400 font-mono">{slumpParams.tampingRodsCountPerLayer} (IS 1199: 25)</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={35}
                        step={1}
                        value={slumpParams.tampingRodsCountPerLayer}
                        onChange={(e) => setSlumpParams((p) => ({ ...p, tampingRodsCountPerLayer: Number(e.target.value) }))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Cone Lift Technique</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSlumpParams((p) => ({ ...p, liftRate: 'smooth_vertical' }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            slumpParams.liftRate === 'smooth_vertical'
                              ? 'bg-emerald-600 border-emerald-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          Smooth Vertical
                        </button>
                        <button
                          onClick={() => setSlumpParams((p) => ({ ...p, liftRate: 'tilted' }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            slumpParams.liftRate === 'tilted'
                              ? 'bg-emerald-600 border-emerald-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          Tilted / Jerky
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSimId === '03-curing' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Curing Environment</label>
                      <select
                        value={curingParams.curingRegime}
                        onChange={(e) => setCuringParams((p) => ({ ...p, curingRegime: e.target.value as CuringRegime }))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium"
                      >
                        <option value="water_submersion_27c">Water Submersion 27°C (Standard IS 516)</option>
                        <option value="accelerated_warm_55c">Accelerated Warm Water Bath 55°C (IS 9013)</option>
                        <option value="steam_curing_65c">Precast Steam Curing 65°C</option>
                        <option value="ambient_air_dry">Unprotected Dry Air Exposure (Poor site curing)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Testing Age Timeline</span>
                        <span className="text-sky-400 font-mono">{curingParams.ageDays} Days</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={90}
                        step={1}
                        value={curingParams.ageDays}
                        onChange={(e) => setCuringParams((p) => ({ ...p, ageDays: Number(e.target.value) }))}
                        className="w-full accent-sky-500"
                      />
                    </div>
                  </div>
                )}

                {activeSimId === '04-compressive-strength' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Specimen Shape & Standard</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setCompressionParams((p) => ({ ...p, specimenGeometry: 'cube_150mm', measuredWidthMm: 150, measuredDepthMm: 150, measuredHeightMm: 150 }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            compressionParams.specimenGeometry === 'cube_150mm'
                              ? 'bg-emerald-600 border-emerald-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          150mm Cube (IS 516)
                        </button>
                        <button
                          onClick={() => setCompressionParams((p) => ({ ...p, specimenGeometry: 'cylinder_150x300', measuredWidthMm: 150, measuredDepthMm: 150, measuredHeightMm: 300 }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            compressionParams.specimenGeometry === 'cylinder_150x300'
                              ? 'bg-emerald-600 border-emerald-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          150×300 Cylinder (ASTM)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Centering Offset (Eccentricity)</span>
                        <span className="text-rose-400 font-mono">{compressionParams.centeringOffsetMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={25}
                        step={1}
                        value={compressionParams.centeringOffsetMm}
                        onChange={(e) => setCompressionParams((p) => ({ ...p, centeringOffsetMm: Number(e.target.value) }))}
                        className="w-full accent-rose-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Manual Load Pacer</span>
                        <span className="text-sky-400 font-mono">{compressionParams.appliedLoadKn.toFixed(1)} kN</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={compressionResult.failureLoadKn}
                        step={10}
                        value={compressionParams.appliedLoadKn}
                        onChange={(e) => {
                          setIsPlaying(false);
                          setCompressionParams((p) => ({ ...p, appliedLoadKn: Number(e.target.value) }));
                        }}
                        className="w-full accent-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. GUIDED TAB */}
            {activeTab === 'guided' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Step {guidedStep} of 10: Guided Standard Experiment</span>
                  </div>
                  <div className="text-slate-300">
                    {guidedStep === 1 && 'Objective: Inspect apparatus dimensions and verify compliance with standard testing codes.'}
                    {guidedStep === 2 && 'Equipment Check: Orbit in 3D around the equipment to observe calibration markers.'}
                    {guidedStep === 3 && 'Formulate Hypothesis: Predict material response prior to initiating the mechanical testing sequence.'}
                    {guidedStep === 4 && 'Parameter Selection: Configure the specified concrete grade and proportions.'}
                    {guidedStep === 5 && 'Perform Laboratory Procedure: Execute batching, filling, or hydraulic compression loading.'}
                    {guidedStep === 6 && 'Read Telemetry: Note the exact sensor readouts and calculate effective parameters.'}
                    {guidedStep === 7 && 'Analyze Results: Compare measured experimental values against IS 456 target criteria.'}
                    {guidedStep === 8 && 'Check Concept Mastery: Validate knowledge of underlying civil materials principles.'}
                    {guidedStep === 9 && 'Parametric Sensitivity: Modify a single parameter and observe the impact.'}
                    {guidedStep === 10 && 'Final Laboratory Conclusion: Synthesize findings into the digital lab notebook.'}
                  </div>
                </div>

                {guidedStep === 3 && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="font-semibold text-white">Prediction Challenge:</div>
                    <p className="text-slate-400">
                      {activeSimId === '01-batching' && 'How does increasing water content affect 28-day concrete strength?'}
                      {activeSimId === '02-slump' && 'What type of slump indicates a well-proportioned cohesive concrete mix?'}
                      {activeSimId === '04-compressive-strength' && 'What fracture pattern is expected in a standard 150mm concrete cube tested under platen restraint?'}
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {activeSimId === '01-batching' && (
                        <>
                          <button
                            onClick={() => handlePredict('w/c')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            A. It increases capillary porosity, significantly reducing compressive strength
                          </button>
                          <button
                            onClick={() => handlePredict('cement')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            B. It accelerates hydration and increases compressive strength
                          </button>
                        </>
                      )}
                      {activeSimId === '02-slump' && (
                        <>
                          <button
                            onClick={() => handlePredict('true')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            A. True Slump (uniform subsidence without collapse)
                          </button>
                          <button
                            onClick={() => handlePredict('shear')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            B. Shear Slump (one half sliding off along an inclined plane)
                          </button>
                        </>
                      )}
                      {activeSimId === '04-compressive-strength' && (
                        <>
                          <button
                            onClick={() => handlePredict('pyramid')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            A. Hourglass / Semi-pyramidal shear fracture due to platen friction
                          </button>
                          <button
                            onClick={() => handlePredict('cleavage')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
                          >
                            B. Horizontal laminar splitting parallel to loading platens
                          </button>
                        </>
                      )}
                    </div>
                    {predictionFeedback && (
                      <div className="mt-2 p-2 bg-slate-900 border border-emerald-800/80 rounded text-emerald-300 font-medium text-[11px]">
                        {predictionFeedback}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    disabled={guidedStep === 1}
                    onClick={() => setGuidedStep((s) => Math.max(1, s - 1))}
                    className="px-3 py-1.5 bg-slate-800 disabled:opacity-50 text-slate-300 rounded-lg hover:bg-slate-700"
                  >
                    Previous
                  </button>
                  <button
                    disabled={guidedStep === 10}
                    onClick={() => setGuidedStep((s) => Math.min(10, s + 1))}
                    className="px-4 py-1.5 bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-lg hover:bg-emerald-500"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* 3. THEORY TAB */}
            {activeTab === 'theory' && (
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-400">Codal Governing Formulations</div>
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div>f'ck = fck + 1.65 · s (IS 10262 Target Strength)</div>
                      <div className="text-slate-500 text-[10px]">s = Standard deviation (Table 1, IS 10262:2019)</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div>f_c = P / A (Compressive Stress, IS 516:2021)</div>
                      <div className="text-slate-500 text-[10px]">P = Failure load (N), A = Cross-sectional area (mm²)</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div>Maturity M = Σ (T - T₀) · Δt (Nurse-Saul Equation)</div>
                      <div className="text-slate-500 text-[10px]">T₀ = -10°C (Datum temperature)</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="font-bold text-amber-400">Assumptions & Laboratory Constraints</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    <li>Aggregates conform to IS 383:2016 Zone II grading standards.</li>
                    <li>Platen loading pace rate maintained within 0.2 MPa/s to 0.4 MPa/s.</li>
                    <li>Cylinder strength is converted using standard ratio: f_cyl ≈ 0.80 · f_cube.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 4. APPLICATIONS TAB */}
            {activeTab === 'applications' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Civil Infrastructure Deployment</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {activeSimId === '01-batching' &&
                      'Automated Ready-Mix Concrete (RMC) batching plants require moisture sensor probes in aggregate bins to dynamically offset batching water and guarantee target slump.'}
                    {activeSimId === '02-slump' &&
                      'On-site quality acceptance criteria for transit mixers before discharge into concrete pumps, high-rise shear wall formwork, and pile shafts.'}
                    {activeSimId === '03-curing' &&
                      'Steam curing in precast box-girder yards for metro rail viaducts to enable early 24-hour prestressing and rapid cycle times.'}
                    {activeSimId === '04-compressive-strength' &&
                      '28-day characteristic strength compliance verification under IS 456 Clause 16 for structural clearance of columns, bridge abutments, and foundation rafts.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-slate-200">Applicable Indian Standards:</div>
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <div>• <strong className="text-emerald-400">IS 10262:2019</strong> — Concrete Mix Proportioning — Guidelines.</div>
                    <div>• <strong className="text-emerald-400">IS 516:2021</strong> — Hardened Concrete — Methods of Test.</div>
                    <div>• <strong className="text-emerald-400">IS 1199:2018</strong> — Fresh Concrete — Methods of Sampling, Testing and Analysis.</div>
                    <div>• <strong className="text-emerald-400">IS 456:2000</strong> — Plain and Reinforced Concrete — Code of Practice.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
