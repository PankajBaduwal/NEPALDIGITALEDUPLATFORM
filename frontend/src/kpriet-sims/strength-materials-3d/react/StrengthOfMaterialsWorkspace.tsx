import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Award,
  Cpu,
  Compass,
  CheckCircle2,
  FileText,
  Sliders,
} from 'lucide-react';
import type { SomSimId, MaterialId, IUtmParams, IBeamParams, IStressStrainParams } from '../core/types';
import { SOM_MATERIALS } from '../core/SomMaterials';
import { SomCalculator } from '../core/SomCalculator';
import { UtmTestingScene } from '../simulations/01-utm-testing/UtmTestingScene';
import { BeamDeflectionScene } from '../simulations/02-beam-deflection/BeamDeflectionScene';
import { StressStrainScene } from '../simulations/03-stress-strain/StressStrainScene';
import { SfdBmdScene } from '../simulations/04-sfd-bmd/SfdBmdScene';

interface StrengthOfMaterialsWorkspaceProps {
  simulationId: string;
  onBack?: () => void;
}

export const StrengthOfMaterialsWorkspace: React.FC<StrengthOfMaterialsWorkspaceProps> = ({
  simulationId,
  onBack,
}) => {
  // Normalize simulation ID
  const activeSimId: SomSimId = useMemo(() => {
    if (simulationId.includes('utm')) return '01-utm-testing';
    if (simulationId.includes('beam') || simulationId.includes('deflection')) return '02-beam-deflection';
    if (simulationId.includes('stress') || simulationId.includes('strain')) return '03-stress-strain';
    if (simulationId.includes('sfd') || simulationId.includes('bmd')) return '04-sfd-bmd';
    return '01-utm-testing';
  }, [simulationId]);

  // Viewport container ref
  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneInstanceRef = useRef<any>(null);

  // Simulation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'telemetry' | 'guided' | 'theory' | 'applications'>('controls');
  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);

  // 1. UTM Parameters
  const [utmParams, setUtmParams] = useState<IUtmParams>({
    testType: 'tension',
    materialId: 'fe415-tmt-steel',
    specimenShape: 'round',
    gaugeLengthMm: 50,
    diameterMm: 12.5,
    appliedDisplacementMm: 0,
    crossheadSpeedMmMin: 2.0,
  });

  // 2. Beam Deflection Parameters
  const [beamParams, setBeamParams] = useState<IBeamParams>({
    spanM: 4.0,
    materialId: 'fe250-mild-steel',
    sectionType: 'rectangular',
    dimensions: { width: 0.15, depth: 0.3 },
    supportType: 'simply-supported',
    loads: [
      { id: 'p1', type: 'point', magnitudeKn: 25, positionM: 2.0 },
    ],
    measurementPositionM: 2.0,
    visualAmplification: 25,
    showUndeformedGhost: true,
  });

  // 3. Stress-Strain Parameters
  const [stressStrainParams, setStressStrainParams] = useState<IStressStrainParams>({
    materialId: 'fe415-tmt-steel',
    lengthMm: 1000,
    crossSectionAreaMm2: 500,
    axialForceKn: 60,
    loadType: 'tension',
    temperatureDeltaC: 0,
  });

  // Calculations via SomCalculator
  const utmResult = useMemo(() => {
    const mat = SOM_MATERIALS[utmParams.materialId];
    return SomCalculator.calculateUtmState({
      material: mat,
      mode: utmParams.testType,
      initialGaugeLength: utmParams.gaugeLengthMm / 1000,
      initialDiameter: utmParams.diameterMm / 1000,
      appliedDisplacement: utmParams.appliedDisplacementMm / 1000,
    });
  }, [utmParams]);

  const beamResult = useMemo(() => {
    const mat = SOM_MATERIALS[beamParams.materialId];
    return SomCalculator.calculateBeamResponse({
      material: mat,
      section: {
        type: beamParams.sectionType,
        width: beamParams.dimensions.width,
        depth: beamParams.dimensions.depth,
      },
      span: beamParams.spanM,
      support: beamParams.supportType,
      loads: beamParams.loads.map((l) => ({
        id: l.id,
        type: l.type,
        magnitude: l.magnitudeKn * 1000,
        positionStart: l.positionM,
        positionEnd: l.lengthM ? l.positionM + l.lengthM : undefined,
      })),
      inspectionPosition: beamParams.measurementPositionM,
    });
  }, [beamParams]);

  const stressStrainResult = useMemo(() => {
    const mat = SOM_MATERIALS[stressStrainParams.materialId];
    const widthM = Math.sqrt(stressStrainParams.crossSectionAreaMm2) / 1000;
    return SomCalculator.calculateStressStrain({
      material: mat,
      axialForce: (stressStrainParams.loadType === 'tension' ? 1 : -1) * stressStrainParams.axialForceKn * 1000,
      length: stressStrainParams.lengthMm / 1000,
      crossSection: {
        type: 'rectangular',
        width: widthM,
        depth: widthM,
      },
      temperatureDelta: stressStrainParams.temperatureDeltaC,
    });
  }, [stressStrainParams]);

  // Mount Three.js Scene
  useEffect(() => {
    if (!viewportRef.current) return;

    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.dispose();
      sceneInstanceRef.current = null;
    }

    if (activeSimId === '01-utm-testing') {
      const scene = new UtmTestingScene(viewportRef.current);
      sceneInstanceRef.current = scene;
      scene.updateExperiment(utmParams, utmResult);
    } else if (activeSimId === '02-beam-deflection') {
      const scene = new BeamDeflectionScene(viewportRef.current);
      sceneInstanceRef.current = scene;
      scene.updateExperiment(beamParams, beamResult);
    } else if (activeSimId === '03-stress-strain') {
      const scene = new StressStrainScene(viewportRef.current);
      sceneInstanceRef.current = scene;
      scene.updateExperiment(stressStrainParams, stressStrainResult);
    } else if (activeSimId === '04-sfd-bmd') {
      const scene = new SfdBmdScene(viewportRef.current);
      sceneInstanceRef.current = scene;
      scene.updateExperiment(beamParams, beamResult);
    }

    return () => {
      if (sceneInstanceRef.current) {
        sceneInstanceRef.current.dispose();
        sceneInstanceRef.current = null;
      }
    };
  }, [activeSimId]);

  // Synchronize 3D Scene when calculation state updates
  useEffect(() => {
    if (!sceneInstanceRef.current) return;
    if (activeSimId === '01-utm-testing') {
      sceneInstanceRef.current.updateExperiment(utmParams, utmResult);
    } else if (activeSimId === '02-beam-deflection') {
      sceneInstanceRef.current.updateExperiment(beamParams, beamResult);
    } else if (activeSimId === '03-stress-strain') {
      sceneInstanceRef.current.updateExperiment(stressStrainParams, stressStrainResult);
    } else if (activeSimId === '04-sfd-bmd') {
      sceneInstanceRef.current.updateExperiment(beamParams, beamResult);
    }
  }, [activeSimId, utmParams, utmResult, beamParams, beamResult, stressStrainParams, stressStrainResult]);

  // Live Experiment Animation Loop (For UTM loading)
  useEffect(() => {
    let timer: number;
    if (isPlaying && activeSimId === '01-utm-testing') {
      timer = window.setInterval(() => {
        setUtmParams((prev) => {
          const mat = SOM_MATERIALS[prev.materialId];
          const maxDisplacement = prev.gaugeLengthMm * mat.fractureStrain * 1.15;
          if (prev.appliedDisplacementMm >= maxDisplacement) {
            setIsPlaying(false);
            return prev;
          }
          const delta = (prev.crossheadSpeedMmMin / 60) * 0.05; // 50ms interval
          return {
            ...prev,
            appliedDisplacementMm: prev.appliedDisplacementMm + delta,
          };
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeSimId]);

  // Camera preset handlers
  const handleResetCamera = () => {
    sceneInstanceRef.current?.resetCamera();
  };

  const handleSideView = () => {
    sceneInstanceRef.current?.setSideView();
  };

  const handleTopView = () => {
    sceneInstanceRef.current?.setTopView();
  };

  // Reset experiment
  const handleResetExperiment = () => {
    setIsPlaying(false);
    if (activeSimId === '01-utm-testing') {
      setUtmParams((p) => ({ ...p, appliedDisplacementMm: 0 }));
    } else if (activeSimId === '02-beam-deflection' || activeSimId === '04-sfd-bmd') {
      setBeamParams((p) => ({
        ...p,
        loads: [{ id: 'p1', type: 'point', magnitudeKn: 25, positionM: p.spanM / 2 }],
        measurementPositionM: p.spanM / 2,
      }));
    } else if (activeSimId === '03-stress-strain') {
      setStressStrainParams((p) => ({ ...p, axialForceKn: 60 }));
    }
    setGuidedStep(1);
    setPredictionFeedback(null);
  };

  // Guided prediction evaluation
  const handlePredict = (choice: string) => {
    if (activeSimId === '01-utm-testing') {
      if (choice === 'necking') {
        setPredictionFeedback('Correct! Ductile metals like Fe415/Fe250 undergo extensive localized plastic instability (necking) prior to cup-and-cone shear rupture.');
      } else {
        setPredictionFeedback('Incorrect. Under axial tension, ductile materials yield and then undergo necking before ultimate fracture.');
      }
    } else if (activeSimId === '02-beam-deflection') {
      if (choice === 'center') {
        setPredictionFeedback('Correct! For a symmetrical central point load on a simply supported beam, maximum deflection occurs exactly at mid-span (x = L/2).');
      } else {
        setPredictionFeedback('Review: Check the bending moment distribution; maximum curvature occurs where the bending moment is maximum.');
      }
    }
  };

  // Canvas 2D Chart Renderer
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 40; x < w - 20; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, h - 30);
      ctx.stroke();
    }
    for (let y = 20; y < h - 30; y += 30) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, h - 30);
    ctx.lineTo(w - 20, h - 30);
    ctx.stroke();

    if (activeSimId === '01-utm-testing') {
      const mat = SOM_MATERIALS[utmParams.materialId];
      const maxStrain = 0.25;
      const maxStressMpa = (mat.ultimateStrength / 1e6) * 1.25;

      // Draw ideal constitutive curve
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const numPts = 60;
      for (let i = 0; i <= numPts; i++) {
        const strainVal = (i / numPts) * mat.fractureStrain;
        const res = SomCalculator.calculateUtmState({
          material: mat,
          mode: utmParams.testType,
          initialGaugeLength: utmParams.gaugeLengthMm / 1000,
          initialDiameter: utmParams.diameterMm / 1000,
          appliedDisplacement: (strainVal * utmParams.gaugeLengthMm) / 1000,
        });
        const cx = 40 + (strainVal / maxStrain) * (w - 70);
        const cy = (h - 30) - (res.engineeringStress / 1e6 / maxStressMpa) * (h - 60);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Current operating point
      const curX = 40 + (utmResult.engineeringStrain / maxStrain) * (w - 70);
      const curY = (h - 30) - (utmResult.engineeringStress / 1e6 / maxStressMpa) * (h - 60);
      ctx.fillStyle = utmResult.isFractured ? '#ef4444' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Axis labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('Strain (ε)', w / 2, h - 8);
      ctx.save();
      ctx.translate(14, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Stress σ (MPa)', 0, 0);
      ctx.restore();
    } else if (activeSimId === '02-beam-deflection' || activeSimId === '04-sfd-bmd') {
      const pts = beamResult.points;
      const span = beamParams.spanM;
      const isSfd = activeSimId === '04-sfd-bmd';
      const vals = pts.map((p) => (isSfd ? p.moment : p.deflection * 1000));
      const maxVal = Math.max(1, ...vals.map(Math.abs)) * 1.25;

      ctx.strokeStyle = isSfd ? '#a855f7' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const cx = 40 + (pt.x / span) * (w - 70);
        const cy = isSfd
          ? (h / 2) - (pt.moment / maxVal) * (h / 2 - 25)
          : (h - 30) - ((pt.deflection * 1000) / maxVal) * (h - 60);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();

      if (isSfd) {
        ctx.strokeStyle = '#475569';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(40, h / 2);
        ctx.lineTo(w - 20, h / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('Position x (m)', w / 2, h - 8);
      ctx.save();
      ctx.translate(14, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(isSfd ? 'Bending Moment M (Nm)' : 'Deflection δ (mm)', 0, 0);
      ctx.restore();
    }
  }, [activeSimId, utmResult, beamResult, utmParams, beamParams]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Engineering Portal Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800/60 rounded">
                U25CE301
              </span>
              <h1 className="text-sm font-bold text-white tracking-wide">
                {activeSimId === '01-utm-testing' && 'Universal Testing Machine (UTM) — Tensile & Compressive Testing'}
                {activeSimId === '02-beam-deflection' && 'Flexural Loading & Elastic Deflection Laboratory'}
                {activeSimId === '03-stress-strain' && 'Interactive Stress-Strain & Mohr Circle Explorer'}
                {activeSimId === '04-sfd-bmd' && 'Shear Force & Bending Moment Internal Stress Visualizer'}
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Civil Engineering — Semester III | IS 1608 / IS 1786 / IS 456 Standards
            </p>
          </div>
        </div>

        {/* Global Controls & Camera Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            title="Reset 3D Camera"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
          <button
            onClick={handleSideView}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            Side
          </button>
          <button
            onClick={handleTopView}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            Top
          </button>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <button
            onClick={handleResetExperiment}
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

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: 3D Viewport with HUD Overlay */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-slate-950">
          <div ref={viewportRef} className="flex-1 w-full h-full relative" />

          {/* Floating Real-Time Telemetry HUD Overlay */}
          <div className="absolute top-4 left-4 p-3 bg-slate-900/85 border border-slate-700/80 rounded-xl backdrop-blur-md shadow-2xl pointer-events-none min-w-[240px]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2 border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                LIVE SENSORS
              </span>
              <span className="text-emerald-400">CALIBRATED</span>
            </div>

            {activeSimId === '01-utm-testing' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Load P:</span>
                  <span className="font-mono font-bold text-sky-400">{(utmResult.load / 1000).toFixed(2)} kN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stress σ:</span>
                  <span className="font-mono font-bold text-amber-400">{(utmResult.engineeringStress / 1e6).toFixed(1)} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Displacement δ:</span>
                  <span className="font-mono font-bold text-purple-400">{(utmResult.displacement * 1000).toFixed(3)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Strain ε:</span>
                  <span className="font-mono font-bold text-emerald-400">{utmResult.engineeringStrain.toFixed(5)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Stage:</span>
                  <span className="font-semibold text-white capitalize">{utmResult.stage}</span>
                </div>
              </div>
            )}

            {(activeSimId === '02-beam-deflection' || activeSimId === '04-sfd-bmd') && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reaction R_A:</span>
                  <span className="font-mono font-bold text-sky-400">{(beamResult.reactions.reactionA / 1000).toFixed(2)} kN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reaction R_B:</span>
                  <span className="font-mono font-bold text-sky-400">{(beamResult.reactions.reactionB / 1000).toFixed(2)} kN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Deflection:</span>
                  <span className="font-mono font-bold text-rose-400">{(beamResult.maxDeflection.value * 1000).toFixed(3)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Moment:</span>
                  <span className="font-mono font-bold text-amber-400">{(beamResult.maxBendingMoment.value / 1000).toFixed(2)} kNm</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">At x = {beamParams.measurementPositionM.toFixed(2)}m:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    δ = {(beamResult.deflectionAtInspection * 1000).toFixed(3)} mm
                  </span>
                </div>
              </div>
            )}

            {activeSimId === '03-stress-strain' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Axial Stress σ_x:</span>
                  <span className="font-mono font-bold text-amber-400">{(stressStrainResult.axialStress / 1e6).toFixed(1)} MPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Axial Strain ε_x:</span>
                  <span className="font-mono font-bold text-emerald-400">{stressStrainResult.axialStrain.toFixed(5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Extension ΔL:</span>
                  <span className="font-mono font-bold text-purple-400">{(stressStrainResult.deltaLength * 1000).toFixed(4)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Shear τ_max:</span>
                  <span className="font-mono font-bold text-sky-400">{(stressStrainResult.mohrCircle.maxShearStress / 1e6).toFixed(1)} MPa</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Real-time Synchronized Chart Strip */}
          <div className="h-44 bg-slate-900/90 border-t border-slate-800 p-2 flex items-center justify-between gap-4">
            <div className="flex-1 h-full flex flex-col">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1 px-2">
                <span>
                  {activeSimId === '01-utm-testing' && 'LIVE STRESS-STRAIN CURVE (σ vs ε)'}
                  {activeSimId === '02-beam-deflection' && 'ELASTIC DEFLECTION PROFILE δ(x)'}
                  {activeSimId === '04-sfd-bmd' && 'BENDING MOMENT DIAGRAM M(x)'}
                  {activeSimId === '03-stress-strain' && 'HOOKE’S ELASTIC CONSTITUTIVE RESPONSE'}
                </span>
                <span className="text-[10px] text-slate-500">Live Mathematical Synchrony</span>
              </div>
              <div className="flex-1 w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative">
                <canvas ref={chartCanvasRef} width={640} height={130} className="w-full h-full block" />
              </div>
            </div>

            {/* Quick Actuator Run / Pause Bar for UTM */}
            {activeSimId === '01-utm-testing' && (
              <div className="w-48 flex flex-col justify-center gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 text-center">HYDRAULIC ACTUATOR</div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={utmResult.isFractured}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition shadow-lg ${
                    utmResult.isFractured
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'PAUSE TEST' : 'APPLY LOAD'}</span>
                </button>
                <div className="text-[10px] text-slate-400 text-center">
                  Rate: {utmParams.crossheadSpeedMmMin} mm/min
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Controls & Educational Panels */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-10 shadow-2xl">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'controls' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Controls
            </button>
            <button
              onClick={() => setActiveTab('guided')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'guided' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Guided
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'theory' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Theory
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'applications' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Civil App
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. CONTROLS TAB */}
            {activeTab === 'controls' && (
              <div className="space-y-4 text-xs">
                {/* Material Selector */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Material Specification</label>
                  <select
                    value={
                      activeSimId === '01-utm-testing'
                        ? utmParams.materialId
                        : activeSimId === '02-beam-deflection' || activeSimId === '04-sfd-bmd'
                        ? beamParams.materialId
                        : stressStrainParams.materialId
                    }
                    onChange={(e) => {
                      const mat = e.target.value as MaterialId;
                      if (activeSimId === '01-utm-testing') setUtmParams((p) => ({ ...p, materialId: mat }));
                      else if (activeSimId === '02-beam-deflection' || activeSimId === '04-sfd-bmd') setBeamParams((p) => ({ ...p, materialId: mat }));
                      else setStressStrainParams((p) => ({ ...p, materialId: mat }));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:ring-1 focus:ring-sky-500"
                  >
                    {Object.values(SOM_MATERIALS).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — E = {(m.elasticModulus / 1e9).toFixed(0)} GPa
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific controls for UTM */}
                {activeSimId === '01-utm-testing' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Test Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setUtmParams((p) => ({ ...p, testType: 'tension', appliedDisplacementMm: 0 }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            utmParams.testType === 'tension'
                              ? 'bg-sky-600 border-sky-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Axial Tension (IS 1608)
                        </button>
                        <button
                          onClick={() => setUtmParams((p) => ({ ...p, testType: 'compression', appliedDisplacementMm: 0 }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            utmParams.testType === 'compression'
                              ? 'bg-sky-600 border-sky-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Compression (IS 516)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Gauge Length L₀</span>
                        <span className="text-sky-400 font-mono">{utmParams.gaugeLengthMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min={30}
                        max={100}
                        step={5}
                        value={utmParams.gaugeLengthMm}
                        onChange={(e) => setUtmParams((p) => ({ ...p, gaugeLengthMm: Number(e.target.value) }))}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Specimen Diameter d₀</span>
                        <span className="text-sky-400 font-mono">{utmParams.diameterMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={25}
                        step={0.5}
                        value={utmParams.diameterMm}
                        onChange={(e) => setUtmParams((p) => ({ ...p, diameterMm: Number(e.target.value) }))}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Manual Stroke Displacement</span>
                        <span className="text-purple-400 font-mono">{utmParams.appliedDisplacementMm.toFixed(3)} mm</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={utmParams.gaugeLengthMm * 0.3}
                        step={0.05}
                        value={utmParams.appliedDisplacementMm}
                        onChange={(e) => {
                          setIsPlaying(false);
                          setUtmParams((p) => ({ ...p, appliedDisplacementMm: Number(e.target.value) }));
                        }}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Specific controls for Beam Deflection & SFD/BMD */}
                {(activeSimId === '02-beam-deflection' || activeSimId === '04-sfd-bmd') && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Support Condition</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setBeamParams((p) => ({ ...p, supportType: 'simply-supported' }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            beamParams.supportType === 'simply-supported'
                              ? 'bg-sky-600 border-sky-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Simply Supported
                        </button>
                        <button
                          onClick={() => setBeamParams((p) => ({ ...p, supportType: 'cantilever' }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            beamParams.supportType === 'cantilever'
                              ? 'bg-sky-600 border-sky-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Cantilever
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Beam Span L</span>
                        <span className="text-sky-400 font-mono">{beamParams.spanM.toFixed(1)} m</span>
                      </div>
                      <input
                        type="range"
                        min={2.0}
                        max={8.0}
                        step={0.5}
                        value={beamParams.spanM}
                        onChange={(e) => setBeamParams((p) => ({ ...p, spanM: Number(e.target.value) }))}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Point Load W</span>
                        <span className="text-rose-400 font-mono">{beamParams.loads[0]?.magnitudeKn || 0} kN</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={beamParams.loads[0]?.magnitudeKn || 0}
                        onChange={(e) =>
                          setBeamParams((p) => ({
                            ...p,
                            loads: [{ id: p.loads[0]?.id || 'p1', type: 'point', magnitudeKn: Number(e.target.value), positionM: p.loads[0]?.positionM || 2.0 }],
                          }))
                        }
                        className="w-full accent-rose-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Load Location a</span>
                        <span className="text-amber-400 font-mono">{(beamParams.loads[0]?.positionM || 0).toFixed(2)} m</span>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={beamParams.spanM - 0.2}
                        step={0.1}
                        value={beamParams.loads[0]?.positionM || 0}
                        onChange={(e) =>
                          setBeamParams((p) => ({
                            ...p,
                            loads: [{ id: p.loads[0]?.id || 'p1', type: 'point', magnitudeKn: p.loads[0]?.magnitudeKn || 25, positionM: Number(e.target.value) }],
                          }))
                        }
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Inspection / Gauge Cursor x</span>
                        <span className="text-emerald-400 font-mono">{beamParams.measurementPositionM.toFixed(2)} m</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={beamParams.spanM}
                        step={0.05}
                        value={beamParams.measurementPositionM}
                        onChange={(e) => setBeamParams((p) => ({ ...p, measurementPositionM: Number(e.target.value) }))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    {activeSimId === '02-beam-deflection' && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300 font-semibold">Visual Deflection Amp</span>
                          <span className="text-purple-400 font-mono">{beamParams.visualAmplification}x</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={50}
                          step={1}
                          value={beamParams.visualAmplification}
                          onChange={(e) => setBeamParams((p) => ({ ...p, visualAmplification: Number(e.target.value) }))}
                          className="w-full accent-purple-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Specific controls for Stress-Strain Explorer */}
                {activeSimId === '03-stress-strain' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Load Sense</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setStressStrainParams((p) => ({ ...p, loadType: 'tension' }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            stressStrainParams.loadType === 'tension'
                              ? 'bg-sky-600 border-sky-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Tension (+σ)
                        </button>
                        <button
                          onClick={() => setStressStrainParams((p) => ({ ...p, loadType: 'compression' }))}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                            stressStrainParams.loadType === 'compression'
                              ? 'bg-sky-600 border-sky-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Compression (-σ)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Axial Force P</span>
                        <span className="text-sky-400 font-mono">{stressStrainParams.axialForceKn} kN</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={300}
                        step={5}
                        value={stressStrainParams.axialForceKn}
                        onChange={(e) => setStressStrainParams((p) => ({ ...p, axialForceKn: Number(e.target.value) }))}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 font-semibold">Cross-Sectional Area A</span>
                        <span className="text-amber-400 font-mono">{stressStrainParams.crossSectionAreaMm2} mm²</span>
                      </div>
                      <input
                        type="range"
                        min={100}
                        max={2000}
                        step={50}
                        value={stressStrainParams.crossSectionAreaMm2}
                        onChange={(e) => setStressStrainParams((p) => ({ ...p, crossSectionAreaMm2: Number(e.target.value) }))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. GUIDED WORKFLOW TAB */}
            {activeTab === 'guided' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-sky-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Step {guidedStep} of 10: Guided Engineering Lab</span>
                  </div>
                  <div className="text-slate-300">
                    {guidedStep === 1 && 'Objective: Inspect the 3D test equipment and verify initial specimen alignment and calibrated load cells.'}
                    {guidedStep === 2 && 'Examine Setup: Orbit around the machine to observe the reaction columns, hydraulic actuator, and electronic transducers.'}
                    {guidedStep === 3 && 'Hypothesis Formulation: Predict the mechanical response before initiating the loading cycle.'}
                    {guidedStep === 4 && 'Parameter Configuration: Select the structural steel grade (Fe415 / Fe500D) and set initial gauge dimensions.'}
                    {guidedStep === 5 && 'Run Experiment: Apply the axial stroke and observe the live deformation in the 3D specimen.'}
                    {guidedStep === 6 && 'Live Telemetry Analysis: Record stress, strain, and load cell telemetry values in real time.'}
                    {guidedStep === 7 && 'Constitutive Curve Review: Inspect the stress-strain diagram and identify the elastic limit and yield plateau.'}
                    {guidedStep === 8 && 'Check Concept Mastery: Evaluate the relationship between cross-sectional area and axial stress.'}
                    {guidedStep === 9 && 'Parametric Comparison: Modify the material grade to Al 6061-T6 and compare modulus of elasticity.'}
                    {guidedStep === 10 && 'Final Conclusion: Formulate the laboratory finding report conforming to civil structural codes.'}
                  </div>
                </div>

                {/* Interactive Question on Step 3 */}
                {guidedStep === 3 && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="font-semibold text-white">Prediction Challenge:</div>
                    <p className="text-slate-400">
                      {activeSimId === '01-utm-testing'
                        ? 'What phenomenon occurs in mild steel after passing ultimate tensile strength (UTS)?'
                        : 'For a simply supported beam with a central point load, where will the maximum bending moment occur?'}
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {activeSimId === '01-utm-testing' ? (
                        <>
                          <button
                            onClick={() => handlePredict('necking')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
                          >
                            A. Localized cross-sectional necking and shear cup-and-cone rupture
                          </button>
                          <button
                            onClick={() => handlePredict('elastic')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
                          >
                            B. Instantaneous brittle cleavage without plastic deformation
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handlePredict('center')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
                          >
                            A. At mid-span (x = L/2), where shear force crosses zero
                          </button>
                          <button
                            onClick={() => handlePredict('support')}
                            className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
                          >
                            B. Directly at the end supports (x = 0 and x = L)
                          </button>
                        </>
                      )}
                    </div>
                    {predictionFeedback && (
                      <div className="mt-2 p-2 bg-slate-900 border border-sky-800/80 rounded text-sky-300 font-medium text-[11px]">
                        {predictionFeedback}
                      </div>
                    )}
                  </div>
                )}

                {/* Step Navigation Controls */}
                <div className="flex justify-between pt-2">
                  <button
                    disabled={guidedStep === 1}
                    onClick={() => setGuidedStep((s) => Math.max(1, s - 1))}
                    className="px-3 py-1.5 bg-slate-800 disabled:opacity-50 text-slate-300 rounded-lg hover:bg-slate-700 transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={guidedStep === 10}
                    onClick={() => setGuidedStep((s) => Math.min(10, s + 1))}
                    className="px-4 py-1.5 bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-lg hover:bg-sky-500 transition"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* 3. THEORY & GOVERNING EQUATIONS TAB */}
            {activeTab === 'theory' && (
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-bold text-sky-400">Governing Mathematical Models</div>
                  {activeSimId === '01-utm-testing' && (
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div>σ = P / A₀ (Engineering Stress)</div>
                        <div className="text-slate-500 text-[10px]">P = Applied Axial Load, A₀ = Initial Cross-Section</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div>ε = ΔL / L₀ (Engineering Strain)</div>
                        <div className="text-slate-500 text-[10px]">ΔL = Elongation, L₀ = Gauge Length</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div>E = σ / ε (Hooke’s Law, valid for σ ≤ σ_y)</div>
                      </div>
                    </div>
                  )}

                  {(activeSimId === '02-beam-deflection' || activeSimId === '04-sfd-bmd') && (
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div>d²v/dx² = M(x) / (E · I_xx)</div>
                        <div className="text-slate-500 text-[10px]">Euler-Bernoulli Beam Governing Differential Equation</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div>δ_max = (W · L³) / (48 · E · I_xx)</div>
                        <div className="text-slate-500 text-[10px]">Simply Supported Central Point Load</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div>V(x) = dM/dx; q(x) = -dV/dx</div>
                        <div className="text-slate-500 text-[10px]">Static Equilibrium Differential Relations</div>
                      </div>
                    </div>
                  )}

                  {activeSimId === '03-stress-strain' && (
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div>ΔL = (P · L) / (A · E)</div>
                        <div className="text-slate-500 text-[10px]">Axial Elastic Deformation</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div>ε_lat = -ν · ε_axial</div>
                        <div className="text-slate-500 text-[10px]">Poisson's Lateral Strain Contraction</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div>σ_1,2 = (σ_x / 2) ± √( (σ_x/2)² + τ_xy² )</div>
                        <div className="text-slate-500 text-[10px]">Principal Stresses via Mohr's Circle</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="font-bold text-amber-400">Sign Conventions & Assumptions</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    <li>Sagging bending moment is taken as POSITIVE (Tension at bottom flange).</li>
                    <li>Upward shear force on the left face of a cut section is POSITIVE.</li>
                    <li>Material is homogeneous, isotropic, and obeys Hooke's law in the elastic range.</li>
                    <li>Plane sections remain plane after bending (Euler-Bernoulli hypothesis).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 4. CIVIL ENGINEERING APPLICATIONS TAB */}
            {activeTab === 'applications' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Real-World Civil Infrastructure Applications</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {activeSimId === '01-utm-testing' &&
                      'Quality assurance testing of TMT rebar lots (IS 1786) and concrete test cubes (IS 516) prior to structural casting of bridge decks, high-rise shear walls, and deep foundations.'}
                    {activeSimId === '02-beam-deflection' &&
                      'Deflection serviceability limit state checks (IS 456 Table 23) to prevent excessive floor vibration, cracking of unreinforced masonry partitions, and ponding on flat roof slabs.'}
                    {activeSimId === '04-sfd-bmd' &&
                      'Critical bending moment envelope analysis for longitudinal steel bar curtailment and shear reinforcement (stirrup spacing) design in RCC beams and steel plate girders.'}
                    {activeSimId === '03-stress-strain' &&
                      'Design of pre-stressing tendons, structural steel bracing members, and thermal expansion joints for highway viaducts and long-span truss bridges.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-slate-200">Relevant Standard Codes:</div>
                  <div className="space-y-1 text-slate-400 text-[11px]">
                    <div>• <strong className="text-sky-400">IS 1786:2008</strong> - High strength deformed steel bars and wires for concrete reinforcement.</div>
                    <div>• <strong className="text-sky-400">IS 456:2000</strong> - Code of practice for plain and reinforced concrete.</div>
                    <div>• <strong className="text-sky-400">IS 800:2007</strong> - General construction in steel — Code of practice.</div>
                    <div>• <strong className="text-sky-400">ASTM E8/E8M</strong> - Standard Test Methods for Tension Testing of Metallic Materials.</div>
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
