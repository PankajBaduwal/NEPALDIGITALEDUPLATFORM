/**
 * Engineering Survey (U25CE303) — Interactive 3D Virtual Field Surveying Laboratory
 * B.E. Civil Engineering — Semester III
 * PiyushDhara Eduverse Academic Portal
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Compass,
  Eye,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  CheckCircle2,
  FileText,
  Sliders,
  ChevronRight,
  TrendingUp,
  MapPin,
  Crosshair,
  Maximize2,
  Table,
} from 'lucide-react';
import type {
  SurveySimId,
  LevellingObservation,
  LevellingReductionMethod,
  TraverseObservation,
  DistanceTool,
} from '../core/types';
import { SurveyCalculator } from '../core/SurveyCalculator';
import { LevellingScene } from '../simulations/01-levelling/LevellingScene';
import { TraverseScene } from '../simulations/02-traverse/TraverseScene';
import { DistanceScene } from '../simulations/03-distance/DistanceScene';
import { ContourScene } from '../simulations/04-contouring/ContourScene';

interface SurveyLabWorkspaceProps {
  simulationId: string;
  onBack?: () => void;
}

export const SurveyLabWorkspace: React.FC<SurveyLabWorkspaceProps> = ({
  simulationId,
  onBack,
}) => {
  // Normalize simulation ID
  const activeSimId: SurveySimId = useMemo(() => {
    const s = simulationId.toLowerCase();
    if (s.includes('theodolite') || s.includes('traverse') || s.includes('bearing')) return '02-traverse';
    if (s.includes('distance') || s.includes('measurement') || s.includes('edm')) return '03-distance';
    if (s.includes('contour') || s.includes('terrain') || s.includes('mapping')) return '04-contouring';
    return '01-levelling';
  }, [simulationId]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState<'controls' | 'fieldbook' | 'guided' | 'theory'>('controls');
  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [isReticleView, setIsReticleView] = useState<boolean>(false);

  // 1. Differential Levelling State
  const [levellingStationIndex, setLevellingStationIndex] = useState<number>(0);
  const [levellingMethod, setLevellingMethod] = useState<LevellingReductionMethod>('hi');
  const [isBubbleCentered, setIsBubbleCentered] = useState<boolean>(true);
  const [recordedLevellingObs, setRecordedLevellingObs] = useState<LevellingObservation[]>([]);

  // 2. Traverse State
  const [traverseTargetIndex, setTraverseTargetIndex] = useState<number>(1);
  const [isPlummetCentered, setIsPlummetCentered] = useState<boolean>(true);
  const [traverseObservations, setTraverseObservations] = useState<TraverseObservation[]>([
    { fromStation: 'Station A', toStation: 'Station B', horizontalAngleDeg: 59.04, slopeDistanceM: 29.15, verticalAngleDeg: 1.18, observedBearingDeg: 59.04 },
    { fromStation: 'Station B', toStation: 'Station C', horizontalAngleDeg: 106.93, slopeDistanceM: 24.02, verticalAngleDeg: 1.43, observedBearingDeg: 292.11 },
    { fromStation: 'Station C', toStation: 'Station D', horizontalAngleDeg: 81.87, slopeDistanceM: 34.00, verticalAngleDeg: -2.36, observedBearingDeg: 194.04 },
    { fromStation: 'Station D', toStation: 'Station A', horizontalAngleDeg: 112.16, slopeDistanceM: 25.06, verticalAngleDeg: 0.46, observedBearingDeg: 306.87 },
  ]);

  // 3. Distance Measurement State
  const [distanceTool, setDistanceTool] = useState<DistanceTool>('total-station-edm');
  const [slopeDist, setSlopeDist] = useState<number>(30.0);
  const [slopeAngleDeg, setSlopeAngleDeg] = useState<number>(4.5);
  const [tapeTempC, setTapeTempC] = useState<number>(32.0);
  const [tapeTensionKg, setTapeTensionKg] = useState<number>(7.5);

  // 4. Contouring State
  const [contourInterval, setContourInterval] = useState<number>(0.5);
  const [isTopDownView, setIsTopDownView] = useState<boolean>(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(0);

  // Calculations
  const levellingResults = useMemo(() => {
    // If user has not recorded any, show default preset run
    const defaultObs: LevellingObservation[] = [
      { id: 'obs-bm', stationName: 'BM (Benchmark)', sightType: 'BS', staffReading: 1.250, groundElevation: 100.0, instrumentElevation: 99.8, staffDistance: 12.0, remark: 'GTS Benchmark' },
      { id: 'obs-st1', stationName: 'Station 1 (Peg A)', sightType: 'IS', staffReading: 1.830, groundElevation: 99.42, instrumentElevation: 99.8, staffDistance: 8.94, remark: 'Culvert center line' },
      { id: 'obs-st2', stationName: 'Station 2 (Peg B)', sightType: 'IS', staffReading: 2.400, groundElevation: 98.85, instrumentElevation: 99.8, staffDistance: 7.62, remark: 'Drainage depression' },
      { id: 'obs-cp1', stationName: 'Change Point 1 (CP 1)', sightType: 'FS', staffReading: 3.040, groundElevation: 98.21, instrumentElevation: 99.8, staffDistance: 10.77, remark: 'Steel footplate CP' },
    ];
    const source = recordedLevellingObs.length > 0 ? recordedLevellingObs : defaultObs;
    return SurveyCalculator.reduceLevelling(source, 100.0, levellingMethod);
  }, [recordedLevellingObs, levellingMethod]);

  const traverseResults = useMemo(() => {
    return SurveyCalculator.computeTraverseClosure(traverseObservations, 1000.0, 1000.0);
  }, [traverseObservations]);

  const distanceResults = useMemo(() => {
    return SurveyCalculator.computeDistance({
      tool: distanceTool,
      slopeDistanceM: slopeDist,
      verticalAngleDeg: slopeAngleDeg,
      instrumentHeightM: 1.50,
      targetReflectorHeightM: 1.50,
      stationGroundElevationM: 100.0,
      tapeTemperatureC: tapeTempC,
      standardTemperatureC: 20.0,
      tapeTensionKg: tapeTensionKg,
      standardTensionKg: 5.0,
    });
  }, [distanceTool, slopeDist, slopeAngleDeg, tapeTempC, tapeTensionKg]);

  const contourModel = useMemo(() => {
    return SurveyCalculator.generateContourModel(7, 8.0, contourInterval);
  }, [contourInterval]);

  // Mount 3D Scene
  useEffect(() => {
    if (!viewportRef.current) return;

    if (sceneRef.current) {
      sceneRef.current.dispose();
      sceneRef.current = null;
    }

    if (activeSimId === '01-levelling') {
      const scene = new LevellingScene(viewportRef.current);
      sceneRef.current = scene;
      scene.occupyStation(levellingStationIndex);
      scene.setLevelBubbleCentered(isBubbleCentered);
      scene.setReticleMode(isReticleView);
    } else if (activeSimId === '02-traverse') {
      const scene = new TraverseScene(viewportRef.current);
      sceneRef.current = scene;
      scene.aimAtTarget(traverseTargetIndex);
      scene.setPlummetCentered(isPlummetCentered);
      scene.setReticleMode(isReticleView);
    } else if (activeSimId === '03-distance') {
      const scene = new DistanceScene(viewportRef.current);
      sceneRef.current = scene;
      scene.setMeasurementMode(distanceTool);
      scene.setSlopeDistance(slopeDist);
      scene.setSlopeAngle(slopeAngleDeg);
      scene.setTapeParameters(tapeTempC, tapeTensionKg);
    } else if (activeSimId === '04-contouring') {
      const scene = new ContourScene(viewportRef.current);
      sceneRef.current = scene;
      scene.setContourInterval(contourInterval);
      scene.toggleViewMode(isTopDownView);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [activeSimId]);

  // Handle Levelling Station Change
  const handleLevellingStationChange = (idx: number) => {
    setLevellingStationIndex(idx);
    if (sceneRef.current && activeSimId === '01-levelling') {
      sceneRef.current.occupyStation(idx);
    }
  };

  // Record Current Reading in Field Book
  const handleRecordLevellingReading = () => {
    if (sceneRef.current && activeSimId === '01-levelling') {
      const obs: LevellingObservation = sceneRef.current.getObservation();
      setRecordedLevellingObs((prev) => [...prev, obs]);
    }
  };

  // Toggle Reticle View Mode
  const toggleReticleView = () => {
    const next = !isReticleView;
    setIsReticleView(next);
    if (sceneRef.current) {
      sceneRef.current.setReticleMode(next);
    }
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera();
      setIsReticleView(false);
      sceneRef.current.setReticleMode(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-amber-400 tracking-wide flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            ENGINEERING SURVEY (U25CE303)
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px]">
            Civil Engineering · Semester III
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[11px] hidden sm:inline">
            Field Simulation
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reticle Sight View Toggle */}
          {(activeSimId === '01-levelling' || activeSimId === '02-traverse') && (
            <button
              onClick={toggleReticleView}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                isReticleView
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Toggle telescope reticle eyepiece sight view"
            >
              <Crosshair className="w-3.5 h-3.5" />
              {isReticleView ? 'Exit Telescope View' : 'Sight Through Reticle'}
            </button>
          )}

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reset 3D Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Back to Catalog
            </button>
          )}
        </div>
      </div>

      {/* ── Main Workspace Body ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: 3D Field Viewport */}
        <div className="flex-1 relative bg-slate-950 flex flex-col overflow-hidden min-h-[360px]">
          <div ref={viewportRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Viewport Overlay Badge */}
          <div className="absolute top-3 left-3 pointer-events-none bg-slate-900/85 backdrop-blur-sm border border-slate-800 rounded-lg p-2.5 text-xs flex flex-col gap-1 shadow-lg">
            <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px]">
              {activeSimId === '01-levelling' && 'Differential Levelling Field Practical'}
              {activeSimId === '02-traverse' && 'Theodolite / Total Station Traversing'}
              {activeSimId === '03-distance' && 'Distance Measurement & Taping Corrections'}
              {activeSimId === '04-contouring' && 'Topographic Contour Survey & Terrain Mapping'}
            </span>
            <span className="text-slate-300 text-[11px]">
              {activeSimId === '01-levelling' && `Occupied Station: BM tablet (RL = 100.000 m)`}
              {activeSimId === '02-traverse' && `Occupied Station: Station A (0.000E, 0.000N)`}
              {activeSimId === '03-distance' && `Mode: ${distanceTool === 'total-station-edm' ? 'Infrared EDM Laser' : 'Steel Tape with Tension Spring'}`}
              {activeSimId === '04-contouring' && `Terrain Grid: 7×7 Topo Pegs · Interval: ${contourInterval} m`}
            </span>
          </div>

          {/* Reticle View Crosshair Indicator Overlay */}
          {isReticleView && (
            <div className="absolute bottom-3 left-3 pointer-events-none bg-rose-950/80 border border-rose-700/60 rounded px-2.5 py-1 text-[11px] text-rose-200">
              🔭 Telescope Reticle View: Crosshairs aligned with optical stadia hairs
            </div>
          )}

          {/* Live Field Telemetry Banner */}
          <div className="h-10 bg-slate-900/90 border-t border-slate-800 px-4 flex items-center justify-between text-xs font-mono">
            {activeSimId === '01-levelling' && (
              <>
                <span className="text-slate-300">
                  Target Station: <span className="text-amber-400 font-semibold">{sceneRef.current?.stations[levellingStationIndex]?.name || 'BM'}</span>
                </span>
                <span className="text-slate-300">
                  Ground RL: <span className="text-emerald-400 font-semibold">{sceneRef.current?.stations[levellingStationIndex]?.groundElevation.toFixed(3) || '100.000'} m</span>
                </span>
                <span className="text-slate-300">
                  Staff Intercept: <span className="text-cyan-400 font-semibold">{sceneRef.current?.getSimulatedStaffReading().toFixed(3) || '1.250'} m</span>
                </span>
              </>
            )}

            {activeSimId === '02-traverse' && (
              <>
                <span className="text-slate-300">
                  Sighted Target: <span className="text-amber-400 font-semibold">{sceneRef.current?.traverseStations[traverseTargetIndex]?.code || 'Station B'}</span>
                </span>
                <span className="text-slate-300">
                  Whole Circle Bearing (WCB): <span className="text-cyan-400 font-semibold">{traverseResults.legs[0]?.wcbDeg.toFixed(2) || '59.04'}°</span>
                </span>
                <span className="text-slate-300">
                  Closing Error: <span className="text-rose-400 font-semibold">{traverseResults.closingErrorLinear.toFixed(3)} m (1 in {traverseResults.relativePrecisionRatio})</span>
                </span>
              </>
            )}

            {activeSimId === '03-distance' && (
              <>
                <span className="text-slate-300">
                  Slope Distance (S): <span className="text-amber-400 font-semibold">{slopeDist.toFixed(3)} m</span>
                </span>
                <span className="text-slate-300">
                  True Horiz Distance (H): <span className="text-emerald-400 font-semibold">{distanceResults.horizontalDistance.toFixed(3)} m</span>
                </span>
                <span className="text-slate-300">
                  Elev Difference (Δh): <span className="text-cyan-400 font-semibold">{distanceResults.verticalDifference.toFixed(3)} m</span>
                </span>
              </>
            )}

            {activeSimId === '04-contouring' && (
              <>
                <span className="text-slate-300">
                  Contour Interval: <span className="text-amber-400 font-semibold">{contourInterval.toFixed(2)} m</span>
                </span>
                <span className="text-slate-300">
                  Min Elev: <span className="text-emerald-400 font-semibold">{contourModel.minElevation.toFixed(2)} m</span>
                </span>
                <span className="text-slate-300">
                  Max Elev: <span className="text-cyan-400 font-semibold">{contourModel.maxElevation.toFixed(2)} m</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Survey Panel & Field Book */}
        <div className="w-full lg:w-[480px] bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
          {/* Panel Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-medium">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'controls'
                  ? 'border-amber-400 text-amber-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Controls
            </button>
            <button
              onClick={() => setActiveTab('fieldbook')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'fieldbook'
                  ? 'border-amber-400 text-amber-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Field Book
            </button>
            <button
              onClick={() => setActiveTab('guided')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'guided'
                  ? 'border-amber-400 text-amber-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Practical
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'theory'
                  ? 'border-amber-400 text-amber-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Theory
            </button>
          </div>

          {/* Panel Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* ── TAB 1: CONTROLS ── */}
            {activeTab === 'controls' && (
              <div className="space-y-4">
                {/* 1. Levelling Controls */}
                {activeSimId === '01-levelling' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2.5">
                      <label className="font-semibold text-slate-200 block">Levelling Staff Position</label>
                      <div className="grid grid-cols-2 gap-2">
                        {sceneRef.current?.stations.map((st: any, idx: number) => (
                          <button
                            key={st.id}
                            onClick={() => handleLevellingStationChange(idx)}
                            className={`p-2 rounded text-left border transition ${
                              levellingStationIndex === idx
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="text-[11px] font-mono">{st.name}</div>
                            <div className="text-[10px] text-slate-400">Sight: {st.sightType}</div>
                          </button>
                        )) || [0, 1, 2, 3].map((idx) => (
                          <button
                            key={idx}
                            onClick={() => handleLevellingStationChange(idx)}
                            className={`p-2 rounded text-left border ${
                              levellingStationIndex === idx
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : 'bg-slate-900 border-slate-700 text-slate-300'
                            }`}
                          >
                            Station {idx + 1}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="text-slate-300">Level Spirit Bubble Centered</label>
                        <input
                          type="checkbox"
                          checked={isBubbleCentered}
                          onChange={(e) => {
                            setIsBubbleCentered(e.target.checked);
                            sceneRef.current?.setLevelBubbleCentered(e.target.checked);
                          }}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                      </div>

                      <button
                        onClick={handleRecordLevellingReading}
                        className="w-full py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Record Sighted Reading in Field Book
                      </button>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2">
                      <label className="font-semibold text-slate-200 block">Reduction Method</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLevellingMethod('hi')}
                          className={`flex-1 py-1.5 rounded border transition ${
                            levellingMethod === 'hi'
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Height of Instrument (HI)
                        </button>
                        <button
                          onClick={() => setLevellingMethod('rise-and-fall')}
                          className={`flex-1 py-1.5 rounded border transition ${
                            levellingMethod === 'rise-and-fall'
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Rise & Fall Method
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Traverse Controls */}
                {activeSimId === '02-traverse' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2.5">
                      <label className="font-semibold text-slate-200 block">Target Prism Station</label>
                      <div className="grid grid-cols-2 gap-2">
                        {sceneRef.current?.traverseStations.slice(1).map((st: any, idx: number) => (
                          <button
                            key={st.id}
                            onClick={() => {
                              const targetIdx = idx + 1;
                              setTraverseTargetIndex(targetIdx);
                              sceneRef.current?.aimAtTarget(targetIdx);
                            }}
                            className={`p-2 rounded text-left border transition ${
                              traverseTargetIndex === idx + 1
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="font-mono text-[11px]">{st.code}</div>
                            <div className="text-[10px] text-slate-400">({st.x}E, {st.y}N)</div>
                          </button>
                        )) || [1, 2, 3].map((targetIdx) => (
                          <button
                            key={targetIdx}
                            onClick={() => {
                              setTraverseTargetIndex(targetIdx);
                              sceneRef.current?.aimAtTarget(targetIdx);
                            }}
                            className={`p-2 rounded text-left border ${
                              traverseTargetIndex === targetIdx
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : 'bg-slate-900 border-slate-700 text-slate-300'
                            }`}
                          >
                            Station {targetIdx}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="text-slate-300">Optical Plummet Centered over Peg</label>
                        <input
                          type="checkbox"
                          checked={isPlummetCentered}
                          onChange={(e) => {
                            setIsPlummetCentered(e.target.checked);
                            sceneRef.current?.setPlummetCentered(e.target.checked);
                          }}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2">
                      <div className="flex justify-between text-slate-300">
                        <span>Total Polygon Perimeter:</span>
                        <span className="font-mono font-bold text-amber-400">{traverseResults.totalPerimeter.toFixed(3)} m</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Closing Linear Misclosure (e):</span>
                        <span className="font-mono font-bold text-rose-400">{traverseResults.closingErrorLinear.toFixed(3)} m</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Relative Precision Ratio:</span>
                        <span className="font-mono font-bold text-emerald-400">1 in {traverseResults.relativePrecisionRatio}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Distance Controls */}
                {activeSimId === '03-distance' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2.5">
                      <label className="font-semibold text-slate-200 block">Measurement Technology</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setDistanceTool('total-station-edm');
                            sceneRef.current?.setMeasurementMode('total-station-edm');
                          }}
                          className={`flex-1 py-1.5 rounded border transition ${
                            distanceTool === 'total-station-edm'
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Electronic Total Station (EDM)
                        </button>
                        <button
                          onClick={() => {
                            setDistanceTool('steel-tape');
                            sceneRef.current?.setMeasurementMode('steel-tape');
                          }}
                          className={`flex-1 py-1.5 rounded border transition ${
                            distanceTool === 'steel-tape'
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          Precision Steel Tape
                        </button>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Slope Distance (S):</span>
                          <span className="font-mono text-amber-400">{slopeDist} m</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          step="1"
                          value={slopeDist}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setSlopeDist(val);
                            sceneRef.current?.setSlopeDistance(val);
                          }}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Ground Slope Angle (θ):</span>
                          <span className="font-mono text-amber-400">{slopeAngleDeg}°</span>
                        </div>
                        <input
                          type="range"
                          min="-5"
                          max="15"
                          step="0.5"
                          value={slopeAngleDeg}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setSlopeAngleDeg(val);
                            sceneRef.current?.setSlopeAngle(val);
                          }}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      {distanceTool === 'steel-tape' && (
                        <div className="pt-2 border-t border-slate-700/60 space-y-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-slate-300">
                              <span>Field Temperature:</span>
                              <span className="font-mono text-amber-400">{tapeTempC} °C</span>
                            </div>
                            <input
                              type="range"
                              min="15"
                              max="45"
                              step="1"
                              value={tapeTempC}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setTapeTempC(val);
                                sceneRef.current?.setTapeParameters(val, tapeTensionKg);
                              }}
                              className="w-full accent-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-slate-300">
                              <span>Applied Tension Pull:</span>
                              <span className="font-mono text-amber-400">{tapeTensionKg} kg</span>
                            </div>
                            <input
                              type="range"
                              min="3"
                              max="12"
                              step="0.5"
                              value={tapeTensionKg}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setTapeTensionKg(val);
                                sceneRef.current?.setTapeParameters(tapeTempC, val);
                              }}
                              className="w-full accent-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Contouring Controls */}
                {activeSimId === '04-contouring' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2.5">
                      <label className="font-semibold text-slate-200 block">Contour Interval (CI)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[0.25, 0.5, 1.0].map((int) => (
                          <button
                            key={int}
                            onClick={() => {
                              setContourInterval(int);
                              sceneRef.current?.setContourInterval(int);
                            }}
                            className={`py-1.5 rounded border transition ${
                              contourInterval === int
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {int} m
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            const next = !isTopDownView;
                            setIsTopDownView(next);
                            sceneRef.current?.toggleViewMode(next);
                          }}
                          className={`w-full py-2 rounded border font-semibold flex items-center justify-center gap-1.5 transition ${
                            isTopDownView
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          }`}
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          {isTopDownView ? 'Switch to 3D Oblique View' : 'Switch to 2D Plan View'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: FIELD BOOK & REDUCTIONS ── */}
            {activeTab === 'fieldbook' && (
              <div className="space-y-3">
                {activeSimId === '01-levelling' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Standard Levelling Field Book</span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        Method: {levellingMethod.toUpperCase()}
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-800 rounded-lg">
                      <table className="w-full text-left border-collapse text-[11px] font-mono">
                        <thead>
                          <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700">
                            <th className="p-1.5">Station</th>
                            <th className="p-1.5">BS</th>
                            <th className="p-1.5">IS</th>
                            <th className="p-1.5">FS</th>
                            {levellingMethod === 'hi' ? (
                              <th className="p-1.5 text-amber-300">HI</th>
                            ) : (
                              <>
                                <th className="p-1.5 text-emerald-300">Rise</th>
                                <th className="p-1.5 text-rose-300">Fall</th>
                              </>
                            )}
                            <th className="p-1.5 text-cyan-300">RL (m)</th>
                            <th className="p-1.5">Remark</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                          {levellingResults.rows.map((row) => (
                            <tr key={row.rowId} className="hover:bg-slate-800/40">
                              <td className="p-1.5 font-sans font-medium text-slate-200">{row.stationName}</td>
                              <td className="p-1.5 text-slate-300">{row.bs !== null ? row.bs.toFixed(3) : '-'}</td>
                              <td className="p-1.5 text-slate-300">{row.is !== null ? row.is.toFixed(3) : '-'}</td>
                              <td className="p-1.5 text-slate-300">{row.fs !== null ? row.fs.toFixed(3) : '-'}</td>
                              {levellingMethod === 'hi' ? (
                                <td className="p-1.5 text-amber-400">{row.hi !== null ? row.hi.toFixed(3) : '-'}</td>
                              ) : (
                                <>
                                  <td className="p-1.5 text-emerald-400">{row.rise !== null && row.rise > 0 ? row.rise.toFixed(3) : '-'}</td>
                                  <td className="p-1.5 text-rose-400">{row.fall !== null && row.fall > 0 ? row.fall.toFixed(3) : '-'}</td>
                                </>
                              )}
                              <td className="p-1.5 text-cyan-400 font-bold">{row.rl.toFixed(3)}</td>
                              <td className="p-1.5 font-sans text-slate-400 text-[10px]">{row.remark}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Arithmetic Check Card */}
                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5 text-[11px] font-mono">
                      <div className="font-semibold text-slate-200 font-sans text-xs flex items-center justify-between">
                        <span>Arithmetic Verification Check:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          levellingResults.check.isCheck1Passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {levellingResults.check.isCheck1Passed ? '✓ CHECKS PASSED' : 'MISMATCH'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>ΣBS - ΣFS:</span>
                        <span className="text-slate-200">{levellingResults.check.sumBS.toFixed(3)} - {levellingResults.check.sumFS.toFixed(3)} = {levellingResults.check.diffBS_FS.toFixed(3)} m</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Last RL - First RL:</span>
                        <span className="text-slate-200">{levellingResults.check.lastRL.toFixed(3)} - {levellingResults.check.firstRL.toFixed(3)} = {levellingResults.check.diffRL.toFixed(3)} m</span>
                      </div>
                      {levellingMethod === 'rise-and-fall' && (
                        <div className="flex justify-between text-slate-400">
                          <span>ΣRise - ΣFall:</span>
                          <span className="text-slate-200">{levellingResults.check.sumRise.toFixed(3)} - {levellingResults.check.sumFall.toFixed(3)} = {levellingResults.check.diffRise_Fall.toFixed(3)} m</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSimId === '02-traverse' && (
                  <div className="space-y-2.5">
                    <span className="font-semibold text-slate-200 block">Bowditch Rule Traverse Reduction Table</span>
                    <div className="overflow-x-auto border border-slate-800 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10px] font-mono">
                        <thead>
                          <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700">
                            <th className="p-1">Leg</th>
                            <th className="p-1">Dist (m)</th>
                            <th className="p-1">WCB</th>
                            <th className="p-1">Raw Lat</th>
                            <th className="p-1">Raw Dep</th>
                            <th className="p-1 text-emerald-300">Corr Lat</th>
                            <th className="p-1 text-emerald-300">Corr Dep</th>
                            <th className="p-1 text-cyan-300">Northing</th>
                            <th className="p-1 text-cyan-300">Easting</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                          {traverseResults.legs.map((leg, i) => (
                            <tr key={i} className="hover:bg-slate-800/40">
                              <td className="p-1 text-amber-300">{leg.fromStation.slice(-1)} → {leg.toStation.slice(-1)}</td>
                              <td className="p-1 text-slate-300">{leg.horizontalDistance.toFixed(2)}</td>
                              <td className="p-1 text-slate-300">{leg.wcbDeg.toFixed(1)}°</td>
                              <td className="p-1 text-slate-300">{leg.latitude.toFixed(2)}</td>
                              <td className="p-1 text-slate-300">{leg.departure.toFixed(2)}</td>
                              <td className="p-1 text-emerald-400">{leg.adjustedLatitude.toFixed(2)}</td>
                              <td className="p-1 text-emerald-400">{leg.adjustedDeparture.toFixed(2)}</td>
                              <td className="p-1 text-cyan-300 font-bold">{leg.northing.toFixed(2)}</td>
                              <td className="p-1 text-cyan-300 font-bold">{leg.easting.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSimId === '03-distance' && (
                  <div className="space-y-2.5">
                    <span className="font-semibold text-slate-200 block">Trigonometric & Taping Correction Breakdown</span>
                    <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span>Observed Slope Distance (S):</span>
                        <span className="text-amber-400 font-bold">{distanceResults.horizontalDistance.toFixed(3)} m</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Horizontal Reduction H = S · cos(θ):</span>
                        <span className="text-emerald-400 font-bold">{distanceResults.horizontalDistance.toFixed(3)} m</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Vertical Difference V = S · sin(θ):</span>
                        <span className="text-cyan-400 font-bold">{distanceResults.verticalDifference.toFixed(3)} m</span>
                      </div>
                      <div className="flex justify-between text-slate-300 border-t border-slate-700/60 pt-1.5">
                        <span>Computed Target Ground RL:</span>
                        <span className="text-amber-400 font-bold">{distanceResults.targetGroundElevation.toFixed(3)} m</span>
                      </div>

                      {distanceResults.tapeCorrections && (
                        <div className="pt-2 border-t border-slate-700/60 space-y-1 text-slate-400 text-[10px]">
                          <div className="flex justify-between">
                            <span>Temperature Correction (Ct):</span>
                            <span className="text-slate-200">{distanceResults.tapeCorrections.temperatureCorrection.toFixed(4)} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pull/Tension Correction (Cp):</span>
                            <span className="text-slate-200">{distanceResults.tapeCorrections.pullCorrection.toFixed(4)} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Catenary Sag Correction (Cs):</span>
                            <span className="text-rose-300">{distanceResults.tapeCorrections.sagCorrection.toFixed(4)} m</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-700">
                            <span>Fully Corrected Length:</span>
                            <span className="text-emerald-400">{distanceResults.tapeCorrections.correctedDistance.toFixed(3)} m</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSimId === '04-contouring' && (
                  <div className="space-y-2.5">
                    <span className="font-semibold text-slate-200 block">Sampled Elevation Topographic Matrix</span>
                    <div className="grid grid-cols-7 gap-1 font-mono text-[9px] text-center">
                      {contourModel.points.map((pt) => (
                        <div
                          key={pt.id}
                          className={`p-1 rounded border ${
                            pt.isBenchmark
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          <div>{pt.reducedLevel.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400 italic">
                      Total interpolated contour segment lines: {contourModel.segments.length}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: GUIDED 10-STEP PRACTICAL ── */}
            {activeTab === 'guided' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-semibold text-slate-200">10-Step Survey Practical Workflow</span>
                  <span className="text-amber-400 font-mono text-[11px]">Step {guidedStep} of 10</span>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-2">
                  <div className="font-semibold text-amber-300 text-xs">
                    {guidedStep === 1 && 'Step 1: Benchmark (BM) Siting & Datum Verification'}
                    {guidedStep === 2 && 'Step 2: Tripod Leg Splaying & Rigid Ground Contact'}
                    {guidedStep === 3 && 'Step 3: Instrument Tribrach Mounting & Leveling'}
                    {guidedStep === 4 && 'Step 4: Centering via Laser/Optical Plummet'}
                    {guidedStep === 5 && 'Step 5: Parallax Elimination & Eyepiece Focusing'}
                    {guidedStep === 6 && 'Step 6: Backsight (BS) Staff Observation'}
                    {guidedStep === 7 && 'Step 7: Intermediate Sight (IS) Topographic Stations'}
                    {guidedStep === 8 && 'Step 8: Foresight (FS) on Change Point Footplate'}
                    {guidedStep === 9 && 'Step 9: Arithmetic Reduction & Check Application'}
                    {guidedStep === 10 && 'Step 10: Closing Error Tolerance & Bowditch Adjustment'}
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {guidedStep === 1 && 'Establish or locate the permanent GTS or local benchmark of known Reduced Level (RL = 100.000 m). Document the datum reference tablet.'}
                    {guidedStep === 2 && 'Spread the telescopic tripod legs uniformly at approximately 60° angles. Firmly press the steel shoes into firm unyielding ground.'}
                    {guidedStep === 3 && 'Use the three footscrews in pairs to center the circular spirit bubble within the inner ring. Check bubble stays centered on full 360° rotation.'}
                    {guidedStep === 4 && 'Align the optical plummet or laser dot exactly over the station peg center nail to guarantee zero centering eccentricity error.'}
                    {guidedStep === 5 && 'Aim at a white surface and turn the eyepiece ring until reticle crosshairs are sharply defined. Adjust focusing knob to eliminate parallax.'}
                    {guidedStep === 6 && 'Position the levelling staff vertically on the benchmark. Sight through telescope and record the Backsight (BS) intercept.'}
                    {guidedStep === 7 && 'Sight subsequent intermediate topography pegs along the proposed engineering alignment without moving the instrument station.'}
                    {guidedStep === 8 && 'Before moving the instrument to Station 2, take a Foresight (FS) on the firm turning plate at Change Point 1 (CP1).'}
                    {guidedStep === 9 && 'Compute Height of Instrument (HI = RL + BS) and subsequent RLs. Verify that ΣBS - ΣFS equals Last RL - First RL.'}
                    {guidedStep === 10 && 'Verify linear misclosure against IRC/Survey of India allowable tolerance: e_allow = ±0.012√K meters.'}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      disabled={guidedStep === 1}
                      onClick={() => setGuidedStep((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-700"
                    >
                      Previous
                    </button>
                    <button
                      disabled={guidedStep === 10}
                      onClick={() => setGuidedStep((p) => Math.min(10, p + 1))}
                      className="px-3 py-1 rounded bg-amber-600 disabled:opacity-40 hover:bg-amber-500 text-white font-medium"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: THEORY & CODES ── */}
            {activeTab === 'theory' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5">
                  <div className="font-semibold text-amber-400 text-xs">Standard Codal References & Survey Principles</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    <li><strong className="text-white">Survey of India GTS:</strong> Great Trigonometrical Survey datum references and primary benchmark networks.</li>
                    <li><strong className="text-white">IRC:SP:19:</strong> Manual for Survey, Investigation, and Preparation of Road Projects.</li>
                    <li><strong className="text-white">IS 1492:</strong> Specifications for metric surveying steel and invar tapes.</li>
                    <li><strong className="text-white">IS 3972:</strong> Code of practice for testing accuracy of survey instruments.</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 space-y-1.5 font-mono text-[10px]">
                  <div className="font-semibold text-slate-200 font-sans text-xs">Core Mathematical Equations</div>
                  <div className="text-amber-300">HI Method: HI = RL_BM + BS;  RL_i = HI - Staff_i</div>
                  <div className="text-emerald-300">Rise & Fall: Δ = Staff_prev - Staff_curr;  RL_curr = RL_prev ± Δ</div>
                  <div className="text-cyan-300">Traverse: Lat = L · cos(θ);  Dep = L · sin(θ)</div>
                  <div className="text-rose-300">Bowditch Corr: c_L = -(d_i / Σd) · ΣLat;  c_D = -(d_i / Σd) · ΣDep</div>
                  <div className="text-slate-300">EDM Reductions: H = S · cos(α);  V = S · sin(α)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
