/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Mechanics of Solids (U25ME303 / Theory with Laboratory - TwL)
 * Master Interactive 3D Solid Mechanics Virtual Laboratory Workspace
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { SolidMechanicsSimId, SimulationState, MaterialType, BeamSupportType, BeamCrossSectionType, ColumnEndCondition } from '../core/types';
import { createSolidMechanicsScene } from '../simulations';
import { SolidMechanicsCalculator, STANDARD_MATERIALS } from '../core/SolidMechanicsCalculator';
import {
  RotateCcw,
  Camera,
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
} from 'lucide-react';

interface MechanicsSolidsWorkspaceProps {
  initialSimId?: SolidMechanicsSimId;
  simulationId?: SolidMechanicsSimId;
  onBackToCourse?: () => void;
  onBack?: () => void;
}

const MODULES: { id: SolidMechanicsSimId; label: string; unit: string; icon: string }[] = [
  { id: 'u25me303-utm-testing', label: 'UTM Material Testing', unit: 'Unit I / Exp 1', icon: '🏗️' },
  { id: 'u25me303-axial-compound', label: 'Axial & Compound Bars', unit: 'Unit I (Core)', icon: '🔩' },
  { id: 'u25me303-sfd-bmd', label: 'SFD & BMD Diagrams', unit: 'Unit II (Core)', icon: '📊' },
  { id: 'u25me303-beam-bending', label: 'Beam Bending & Deflection', unit: 'Unit II & III / Exp 5', icon: '📏' },
  { id: 'u25me303-torsion-shafts', label: 'Torsion of Shafts', unit: 'Unit IV / Exp 3', icon: '🔄' },
  { id: 'u25me303-columns-cylinders', label: 'Columns & Thin Cylinders', unit: 'Unit V / Exp 9', icon: '🛡️' },
];

export const MechanicsSolidsWorkspace: React.FC<MechanicsSolidsWorkspaceProps> = ({
  initialSimId,
  simulationId,
  onBackToCourse,
  onBack,
}) => {
  const exitHandler = onBack || onBackToCourse;
  const [activeSimId, setActiveSimId] = useState<SolidMechanicsSimId>(simulationId || initialSimId || 'u25me303-utm-testing');
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ReturnType<typeof createSolidMechanicsScene> | null>(null);

  const [simState, setSimState] = useState<SimulationState>({
    currentStageIndex: 0,
    selectedParameterValues: {},
    parameters: {},
    metrics: {},
    inspectedItem: null,
    deformationScale: 50,
  });

  // Parameter Controls State
  const [materialKey, setMaterialKey] = useState<MaterialType>('mild-steel');
  const [appliedForceKN, setAppliedForceKN] = useState<number>(20);
  const [gaugeDiameterMm, setGaugeDiameterMm] = useState<number>(12);
  const [beamLengthM, setBeamLengthM] = useState<number>(4.0);
  const [beamSupportType, setBeamSupportType] = useState<BeamSupportType>('simply-supported');
  const [crossSectionType, setCrossSectionType] = useState<BeamCrossSectionType>('rectangular');
  const [beamLoadKN, setBeamLoadKN] = useState<number>(20);
  const [hasUDL, setHasUDL] = useState<boolean>(false);
  const [appliedTorqueNm, setAppliedTorqueNm] = useState<number>(800);
  const [isHollowShaft, setIsHollowShaft] = useState<boolean>(false);
  const [columnEndCondition, setColumnEndCondition] = useState<ColumnEndCondition>('both-pinned');
  const [internalPressureMPa, setInternalPressureMPa] = useState<number>(2.5);
  const [deformationScale, setDeformationScale] = useState<number>(100);

  // Modals & Panels
  const [activeTab, setActiveTab] = useState<'controls' | 'telemetry' | 'theory' | 'plots'>('controls');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Trial Logs
  const [loggedTrials, setLoggedTrials] = useState<Array<{ id: number; timestamp: string; sim: string; metrics: Record<string, string> }>>([]);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    if (sceneRef.current) {
      sceneRef.current.destroy();
      sceneRef.current = null;
    }

    const scene = createSolidMechanicsScene(activeSimId);
    sceneRef.current = scene;

    scene.init(containerRef.current).then(() => {
      scene.subscribe((state) => {
        setSimState(state);
      });
    });

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, [activeSimId]);

  // Sync parameter updates to Three.js scene
  const handleParamChange = (key: string, value: number | string | boolean) => {
    if (sceneRef.current) {
      sceneRef.current.setParameter(key, value);
    }
  };

  // Record Current Trial Observation
  const handleLogTrial = () => {
    const trial = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      sim: MODULES.find((m) => m.id === activeSimId)?.label || activeSimId,
      metrics: Object.entries(simState.metrics).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
    };
    setLoggedTrials((prev) => [trial, ...prev]);
    setShowLogModal(true);
  };

  // Export Logged Trials to CSV
  const handleExportCSV = () => {
    if (loggedTrials.length === 0) return;
    const headers = ['Trial ID', 'Timestamp', 'Simulation Module', 'Metrics Log'];
    const rows = loggedTrials.map((t) => [
      t.id,
      t.timestamp,
      `"${t.sim}"`,
      `"${Object.entries(t.metrics).map(([k, v]) => `${k}: ${v}`).join('; ')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kpriet_mechanics_solids_trials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5 Syllabus-Tied Conceptual Questions
  const QUIZ_QUESTIONS = [
    {
      q: '1. What is the fundamental relation between Young’s Modulus (E), Shear Modulus (G), and Poisson’s Ratio (ν)?',
      options: ['E = 2G(1 + ν)', 'E = 3G(1 - 2ν)', 'E = G / (2(1 + ν))', 'G = 2E(1 + ν)'],
      correct: 0,
      expl: 'In isotropic linear elasticity, the exact relation is E = 2G(1 + ν) and E = 3K(1 - 2ν).',
    },
    {
      q: '2. Under elementary Euler-Bernoulli beam theory, at what location along a transversely loaded beam does the maximum bending moment occur?',
      options: ['At the fixed support always', 'Where the internal shear force V(x) changes sign or equals zero', 'At the center always', 'At the point of minimum deflection'],
      correct: 1,
      expl: 'Since dM/dx = V(x), the first derivative of moment is shear. Thus, bending moment extrema occur where V(x) = 0.',
    },
    {
      q: '3. In the elastic torsion formula T/J = τ/r = Gθ/L, what is the shear stress at the neutral central axis of a circular shaft (r = 0)?',
      options: ['Maximum', 'Half of maximum', 'Zero', 'Infinite'],
      correct: 2,
      expl: 'Shear stress varies linearly with radius: τ(r) = (T·r)/J. At r = 0, shear stress is strictly zero.',
    },
    {
      q: '4. How does the circumferential (hoop) stress compare to the longitudinal stress in a thin pressurized cylindrical shell?',
      options: ['Hoop stress is half the longitudinal stress', 'Hoop stress is twice the longitudinal stress', 'Both stresses are equal', 'Hoop stress is four times the longitudinal stress'],
      correct: 1,
      expl: 'Hoop stress σ_h = pd/(2t) and longitudinal stress σ_L = pd/(4t). Therefore, σ_h = 2·σ_L.',
    },
    {
      q: '5. What is the effective length (Le) of a slender column of length L having both ends fixed against rotation and translation?',
      options: ['Le = L', 'Le = 2L', 'Le = 0.5L', 'Le = 0.707L'],
      correct: 2,
      expl: 'For a column with both ends fixed, the distance between inflection points is Le = 0.5L, quadrupling Euler buckling capacity.',
    },
  ];

  // Real-time Constitutive or Plot Data
  const plotData = useMemo(() => {
    if (activeSimId === 'u25me303-utm-testing') {
      return SolidMechanicsCalculator.calculateUtmTest(appliedForceKN, gaugeDiameterMm, 50, materialKey).constitutiveCurve;
    }
    if (activeSimId === 'u25me303-sfd-bmd') {
      return SolidMechanicsCalculator.calculateSfdBmd(beamLengthM, beamSupportType, [{ id: 'p1', positionM: beamLengthM / 2, magnitudeKN: beamLoadKN }], []).points;
    }
    if (activeSimId === 'u25me303-beam-bending') {
      return SolidMechanicsCalculator.calculateBeamBending(beamLengthM, beamSupportType, crossSectionType, 100, 200, beamLoadKN, hasUDL, materialKey).deflectionCurve;
    }
    if (activeSimId === 'u25me303-torsion-shafts') {
      return SolidMechanicsCalculator.calculateTorsionShaft(appliedTorqueNm, 1.2, 50, isHollowShaft, 30, materialKey).radialStressProfile;
    }
    return [];
  }, [activeSimId, appliedForceKN, gaugeDiameterMm, materialKey, beamLengthM, beamSupportType, crossSectionType, beamLoadKN, hasUDL, appliedTorqueNm, isHollowShaft]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* ─── Top Global Navigation Bar ────────────────────────────────────────── */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/10">
            ⚙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-wide">PiyushDhara Eduverse</span>
              <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Autonomous R2025
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Department of Mechanical Engineering · Semester III · <span className="text-slate-200 font-mono font-semibold">U25ME303 Mechanics of Solids (TwL)</span>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => sceneRef.current?.resetCamera()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
            title="Reset 3D Camera"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reset View</span>
          </button>

          <button
            onClick={handleLogTrial}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
            title="Record Laboratory Trial"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Record Trial ({loggedTrials.length})</span>
          </button>

          <button
            onClick={() => setShowQuizModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
            title="Conceptual Assessment Quiz"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Quiz</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition"
            title="Print Official Practical Laboratory Report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lab Report</span>
          </button>

          {exitHandler && (
            <button
              onClick={exitHandler}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-rose-900/30 text-xs text-slate-300 border border-slate-700 hover:border-rose-500/40 transition"
            >
              Exit Lab
            </button>
          )}
        </div>
      </header>

      {/* ─── Module Switcher Sub-Header ──────────────────────────────────────── */}
      <nav className="h-12 border-b border-slate-800/80 bg-slate-900/50 px-4 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 z-10">
        {MODULES.map((mod) => {
          const isActive = activeSimId === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveSimId(mod.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{mod.icon}</span>
              <span>{mod.label}</span>
              <span className="text-[10px] text-slate-500 px-1 py-0.2 rounded bg-slate-800/80">{mod.unit}</span>
            </button>
          );
        })}
      </nav>

      {/* ─── Main Content Grid: 3D Viewport (Left) + Engineering Workbench (Right) ─ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 3D WebGL Canvas Viewport */}
        <div className="flex-1 h-full relative bg-slate-950">
          <div ref={containerRef} className="w-full h-full" />

          {/* Camera Stage Selector Floating Overlay */}
          <div className="absolute top-4 left-4 z-10 flex gap-1.5 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-800 shadow-lg">
            {['Overall Rig', 'Specimen Close-up', 'Instrument Section'].map((stageName, idx) => (
              <button
                key={stageName}
                onClick={() => sceneRef.current?.setStage(idx)}
                className={`px-2.5 py-1 text-xs rounded transition ${
                  simState.currentStageIndex === idx
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {stageName}
              </button>
            ))}
          </div>

          {/* Interactive Inspection Card Floating Card (When Clicked) */}
          {simState.inspectedItem && (
            <div className="absolute bottom-4 left-4 max-w-sm z-10 bg-slate-900/95 backdrop-blur border border-emerald-500/40 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {simState.inspectedItem.category}
                  </div>
                  <h4 className="text-sm font-semibold text-white">{simState.inspectedItem.name}</h4>
                </div>
                <button
                  onClick={() => {
                    if (sceneRef.current) {
                      sceneRef.current.getState().inspectedItem = null;
                      setSimState((s) => ({ ...s, inspectedItem: null }));
                    }
                  }}
                  className="text-slate-400 hover:text-slate-200 text-xs px-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{simState.inspectedItem.description}</p>
              <div className="space-y-1 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                {Object.entries(simState.inspectedItem.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{k}:</span>
                    <span className="text-slate-200 font-mono font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Right Sidebar: Engineering Dashboard & Calculation Studio ───────── */}
        <div className="w-96 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0 z-10 shadow-2xl">
          {/* Panel Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'controls' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Controls
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'telemetry' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Telemetry
            </button>
            <button
              onClick={() => setActiveTab('plots')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'plots' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SVG Curves
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === 'theory' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Formulas
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
            {/* 1. Parameter Controls Tab */}
            {activeTab === 'controls' && (
              <div className="space-y-4">
                <div className="border border-slate-800 bg-slate-950/50 p-3 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Material Properties</span>
                  </h4>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Standard Material Selection</label>
                    <select
                      value={materialKey}
                      onChange={(e) => {
                        const val = e.target.value as MaterialType;
                        setMaterialKey(val);
                        handleParamChange('materialKey', val);
                      }}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {Object.entries(STANDARD_MATERIALS).map(([key, mat]) => (
                        <option key={key} value={key}>
                          {mat.name} (E={mat.youngsModulusGPa} GPa, σ_y={mat.yieldStrengthMPa} MPa)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Module-Specific Controls */}
                {activeSimId === 'u25me303-utm-testing' && (
                  <div className="border border-slate-800 bg-slate-950/50 p-3 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">UTM Loading Controls</h4>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Tensile Pull Force (P)</span>
                        <span className="text-emerald-400 font-mono font-semibold">{appliedForceKN} kN</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={appliedForceKN}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setAppliedForceKN(v);
                          handleParamChange('appliedForceKN', v);
                        }}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Gauge Diameter (d₀)</span>
                        <span className="text-slate-200 font-mono">{gaugeDiameterMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="20"
                        step="1"
                        value={gaugeDiameterMm}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setGaugeDiameterMm(v);
                          handleParamChange('gaugeDiameterMm', v);
                        }}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {activeSimId === 'u25me303-sfd-bmd' && (
                  <div className="border border-slate-800 bg-slate-950/50 p-3 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Beam Boundary & Loading</h4>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Support Condition</label>
                      <select
                        value={beamSupportType}
                        onChange={(e) => {
                          const val = e.target.value as BeamSupportType;
                          setBeamSupportType(val);
                          handleParamChange('supportType', val);
                        }}
                        className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-1.5 text-slate-200"
                      >
                        <option value="simply-supported">Simply Supported Beam</option>
                        <option value="cantilever">Cantilever Beam (Fixed Left)</option>
                        <option value="overhanging">Overhanging Beam (Overhang Right)</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Transverse Point Load (W)</span>
                        <span className="text-emerald-400 font-mono">{beamLoadKN} kN</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="2"
                        value={beamLoadKN}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setBeamLoadKN(v);
                          handleParamChange('pointLoadMagnitudeKN', v);
                        }}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {activeSimId === 'u25me303-torsion-shafts' && (
                  <div className="border border-slate-800 bg-slate-950/50 p-3 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Torsion Rig Controls</h4>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Applied Twisting Torque (T)</span>
                        <span className="text-emerald-400 font-mono">{appliedTorqueNm} N·m</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        step="50"
                        value={appliedTorqueNm}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setAppliedTorqueNm(v);
                          handleParamChange('appliedTorqueNm', v);
                        }}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-300">Hollow Shaft Section</span>
                      <input
                        type="checkbox"
                        checked={isHollowShaft}
                        onChange={(e) => {
                          setIsHollowShaft(e.target.checked);
                          handleParamChange('isHollow', e.target.checked);
                        }}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {activeSimId === 'u25me303-columns-cylinders' && (
                  <div className="border border-slate-800 bg-slate-950/50 p-3 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Columns & Cylinders Parameters</h4>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Column End Condition</label>
                      <select
                        value={columnEndCondition}
                        onChange={(e) => {
                          const val = e.target.value as ColumnEndCondition;
                          setColumnEndCondition(val);
                          handleParamChange('endCondition', val);
                        }}
                        className="w-full text-xs bg-slate-900 border border-slate-700 rounded-md p-1.5 text-slate-200"
                      >
                        <option value="both-pinned">Both Ends Pinned (Le = L)</option>
                        <option value="both-fixed">Both Ends Fixed (Le = 0.5L)</option>
                        <option value="one-fixed-one-free">One Fixed, One Free (Le = 2.0L)</option>
                        <option value="one-fixed-one-pinned">One Fixed, One Pinned (Le = 0.707L)</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Internal Pressure (p)</span>
                        <span className="text-emerald-400 font-mono">{internalPressureMPa} MPa</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.25"
                        value={internalPressureMPa}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setInternalPressureMPa(v);
                          handleParamChange('internalPressureMPa', v);
                        }}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Visual Magnification Factor */}
                <div className="border border-slate-800 bg-slate-950/30 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Deformation Visual Scale</span>
                    <span className="text-slate-300 font-mono font-medium">{deformationScale}x Magnified</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="250"
                    step="10"
                    value={deformationScale}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDeformationScale(v);
                      handleParamChange('deformationScale', v);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 italic">
                    Note: Sub-millimeter elastic deformation is magnified in 3D for educational clarity. Actual engineering strains are shown in the telemetry panel.
                  </div>
                </div>
              </div>
            )}

            {/* 2. Live Telemetry HUD Tab */}
            {activeTab === 'telemetry' && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Real-Time Sensor Readouts</span>
                </h4>
                {Object.entries(simState.metrics).map(([key, val]) => (
                  <div key={key} className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-slate-400">{key}</span>
                    <span className="text-xs font-mono font-semibold text-emerald-300">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Dynamic SVG Plotting Tab */}
            {activeTab === 'plots' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Constitutive & Structural Curves</h4>
                <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl">
                  <div className="text-[11px] text-slate-400 mb-1 text-center font-medium">
                    {activeSimId === 'u25me303-utm-testing' && 'Engineering Stress-Strain Constitutive Curve'}
                    {activeSimId === 'u25me303-sfd-bmd' && 'Piecewise Shear Force & Bending Moment'}
                    {activeSimId === 'u25me303-beam-bending' && 'Elastic Beam Deflection Profile'}
                    {activeSimId === 'u25me303-torsion-shafts' && 'Radial Torsional Shear Stress Distribution'}
                    {activeSimId === 'u25me303-columns-cylinders' && 'Euler Column Buckling Mode Shape'}
                  </div>

                  <svg viewBox="0 0 300 160" className="w-full h-40 bg-slate-900/60 rounded-lg">
                    {/* Gridlines */}
                    <line x1="30" y1="20" x2="30" y2="135" stroke="#334155" strokeWidth="1" />
                    <line x1="30" y1="135" x2="285" y2="135" stroke="#334155" strokeWidth="1" />

                    {/* Polyline Data */}
                    {plotData.length > 0 && (
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        points={plotData
                          .map((pt: any, idx) => {
                            const x = 30 + (idx / (plotData.length - 1)) * 245;
                            const yVal = pt.stressMPa ?? pt.deflectionMm ?? pt.shearStressMPa ?? pt.bendingMomentKNm ?? 0;
                            const y = 135 - Math.min(110, Math.max(0, (Math.abs(yVal) / 350) * 110));
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    )}

                    {/* Axis Labels */}
                    <text x="160" y="152" fill="#94a3b8" fontSize="9" textAnchor="middle">
                      {activeSimId === 'u25me303-utm-testing' ? 'Strain (ε)' : 'Beam Station x (m)'}
                    </text>
                    <text x="12" y="75" fill="#94a3b8" fontSize="9" transform="rotate(-90 12,75)" textAnchor="middle">
                      {activeSimId === 'u25me303-utm-testing' ? 'Stress (MPa)' : 'Response Magnitude'}
                    </text>
                  </svg>
                </div>
                <div className="text-[10px] text-slate-500">
                  Data rendered strictly via deterministic constitutive models conforming to IS 1608 / IS 800 standards.
                </div>
              </div>
            )}

            {/* 4. Formulas & Theory Tab */}
            {activeTab === 'theory' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="border border-slate-800 bg-slate-950/60 p-3 rounded-lg space-y-2">
                  <div className="font-semibold text-emerald-400">Hooke’s Law & Normal Stress:</div>
                  <div className="font-mono bg-slate-900 p-1.5 rounded text-[11px] text-slate-200">
                    σ = F / A₀ ; ε = ΔL / L₀ ; E = σ / ε
                  </div>
                  <div className="text-[11px] text-slate-400">Within the linear elastic limit, normal stress is directly proportional to longitudinal strain.</div>
                </div>

                <div className="border border-slate-800 bg-slate-950/60 p-3 rounded-lg space-y-2">
                  <div className="font-semibold text-emerald-400">Euler-Bernoulli Beam Theory:</div>
                  <div className="font-mono bg-slate-900 p-1.5 rounded text-[11px] text-slate-200">
                    M / I = σ / y = E / R ; EI · d²v/dx² = M(x)
                  </div>
                  <div className="text-[11px] text-slate-400">Predicts bending stress and deflection under the assumption that plane cross-sections remain plane after bending.</div>
                </div>

                <div className="border border-slate-800 bg-slate-950/60 p-3 rounded-lg space-y-2">
                  <div className="font-semibold text-emerald-400">Torsion of Circular Shafts:</div>
                  <div className="font-mono bg-slate-900 p-1.5 rounded text-[11px] text-slate-200">
                    T / J = τ / r = G · θ / L
                  </div>
                  <div className="text-[11px] text-slate-400">Polar second moment of area J = π(D⁴ - d⁴)/32 dictates torsional stiffness and maximum surface shear stress.</div>
                </div>

                <div className="border border-slate-800 bg-slate-950/60 p-3 rounded-lg space-y-2">
                  <div className="font-semibold text-emerald-400">Euler Buckling & Thin Cylinders:</div>
                  <div className="font-mono bg-slate-900 p-1.5 rounded text-[11px] text-slate-200">
                    P_cr = (π² · E · I) / Le² ; σ_h = p·D / (2t)
                  </div>
                  <div className="text-[11px] text-slate-400">Critical buckling load governs slender columns, while thin cylinder membrane theory dictates hoop and axial burst stresses.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modal 1: Observation Table & CSV Logger ────────────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Laboratory Observation Recorder</h3>
              </div>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2">Time</th>
                    <th className="p-2">Module</th>
                    <th className="p-2">Key Readouts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loggedTrials.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="p-2 font-mono text-slate-400">{t.timestamp}</td>
                      <td className="p-2 text-slate-200">{t.sim}</td>
                      <td className="p-2 font-mono text-emerald-400">
                        {Object.entries(t.metrics).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">Total Recorded Trials: {loggedTrials.length}</span>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Conceptual Assessment Quiz ────────────────────────────── */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Mechanics of Solids Conceptual Assessment</h3>
              </div>
              <button onClick={() => setShowQuizModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-4">
              {QUIZ_QUESTIONS.map((q, qIdx) => (
                <div key={qIdx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-xs font-semibold text-slate-200">{q.q}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[qIdx] === oIdx;
                      const isCorrect = q.correct === oIdx;
                      return (
                        <button
                          key={oIdx}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition border ${
                            quizSubmitted
                              ? isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-semibold'
                                : isSelected
                                ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                                : 'bg-slate-900/40 border-slate-800 text-slate-400'
                              : isSelected
                              ? 'bg-emerald-600/20 border-emerald-500/50 text-white font-medium'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className="text-[11px] text-emerald-400/90 pt-1 italic">{q.expl}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">
                {quizSubmitted
                  ? `Your Score: ${Object.entries(quizAnswers).filter(([idx, ans]) => QUIZ_QUESTIONS[Number(idx)]?.correct === ans).length} / ${QUIZ_QUESTIONS.length}`
                  : 'Answer all 5 questions to test your theoretical foundation.'}
              </span>
              <div className="flex gap-2">
                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 3: Printable Formal Practical Laboratory Report ──────────── */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Official Laboratory Practical Report</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div id="printable-report" className="bg-white text-slate-900 p-6 rounded-xl space-y-4 font-serif">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h2 className="text-base font-bold tracking-wider uppercase">KPR Institute of Engineering and Technology</h2>
                <h3 className="text-xs font-semibold uppercase text-slate-700">Department of Mechanical Engineering</h3>
                <p className="text-[11px] text-slate-600 italic">Course: U25ME303 Mechanics of Solids (Theory with Laboratory - TwL) · Regulation 2025</p>
              </div>

              <div className="grid grid-cols-2 text-xs border border-slate-300 p-3 bg-slate-50">
                <div><span className="font-bold">Student Name:</span> Autonomous Virtual Scholar</div>
                <div><span className="font-bold">Register Number:</span> 25ME040</div>
                <div><span className="font-bold">Module:</span> {MODULES.find((m) => m.id === activeSimId)?.label}</div>
                <div><span className="font-bold">Date of Experiment:</span> {new Date().toLocaleDateString()}</div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-1">1. Aim of the Experiment</h4>
                <p className="text-xs text-slate-700">
                  To experimentally determine the mechanical properties, stress-strain behavior, deformation characteristics, and internal force distributions conforming to IS 1608 / IS 800 / ASTM standards.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-1">2. Apparatus & Specimen Details</h4>
                <p className="text-xs text-slate-700">
                  Universal Testing Machine (UTM Grade 0.5), Electronic Extensometer (0.1 µm resolution), Precision Dial Indicator (0.01 mm / div), Torsion Testing Bench with Angular Protractor, Column Buckling Load Frame, and Pressure Vessel Manometer.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-1">3. Recorded Observations</h4>
                <div className="border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                      <tr>
                        <th className="p-2">Parameter Description</th>
                        <th className="p-2">Experimental Value</th>
                        <th className="p-2">Engineering Units</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(simState.metrics).map(([k, v]) => (
                        <tr key={k}>
                          <td className="p-2 text-slate-700">{k}</td>
                          <td className="p-2 font-mono font-semibold text-slate-900">{v}</td>
                          <td className="p-2 text-slate-500">SI Standard</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-1">4. Conclusion & Inferences</h4>
                <p className="text-xs text-slate-700">
                  The observed elastic and plastic behaviors corroborate standard closed-form analytical solutions with zero divergence. All deformation limits satisfy serviceability criteria under IS 456 / IS 800 standards.
                </p>
              </div>

              <div className="flex justify-between pt-6 text-xs text-slate-600">
                <span>Student Signature</span>
                <span>Staff In-Charge Signature</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
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
