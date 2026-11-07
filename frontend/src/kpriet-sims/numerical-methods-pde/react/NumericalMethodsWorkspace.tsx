/**
 * Master React Workspace for Numerical Methods and Partial Differential Equations
 * Course Code: U25MA402 / Anna University MA3351 / MA8452
 * Department of Mechanical Engineering | Semester IV | Regulation R2025 Revised CBCS
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type {
  NumericalSimId,
  RootFindingMethod,
  LinearSolverMethod,
  InterpolationMethod,
  DiffMethod,
  IntegrationMethod,
  ODEMethod,
  DataPoint,
  NumericalLabTrial,
} from '../core/types';
import { NumericalCalculator } from '../core/NumericalCalculator';
import {
  createNumericalScene,
  BaseNumericalSimulation,
  RootFindingScene,
  LinearSystemsScene,
  InterpolationScene,
  CalculusScene,
  ODEScene,
  PDEScene,
  ComparisonLabScene,
} from '../simulations';

interface Props {
  simulationId?: string;
  onBack?: () => void;
}

export const NumericalMethodsWorkspace: React.FC<Props> = ({
  simulationId = 'u25ma402-sim-01',
  onBack,
}) => {
  // Active simulation module tab
  const [activeSimId, setActiveSimId] = useState<NumericalSimId>(() => {
    if (simulationId.startsWith('u25ma402-sim-')) {
      return simulationId as NumericalSimId;
    }
    return 'u25ma402-sim-01';
  });

  // Canvas container & instance ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<BaseNumericalSimulation | null>(null);

  // Play / Pause state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Modals & Records
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [trials, setTrials] = useState<NumericalLabTrial[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // ─── Module 1: Root-Finding State ───
  const [rootMethod, setRootMethod] = useState<RootFindingMethod>('bisection');
  const [rootExpr, setRootExpr] = useState<string>('x^3 - x - 2');
  const [rootA, setRootA] = useState<number>(1.0);
  const [rootB, setRootB] = useState<number>(2.0);
  const [rootTol, setRootTol] = useState<number>(0.001);

  // ─── Module 2: Simultaneous Linear Equations State ───
  const [linearMethod, setLinearMethod] = useState<LinearSolverMethod>('gauss-elimination');
  const [matrixA, setMatrixA] = useState<number[][]>([
    [10, 1, 2],
    [2, 10, 1],
    [1, 2, 10],
  ]);
  const [vectorB, setVectorB] = useState<number[]>([13, 13, 13]);
  const [activeMatrixStep, setActiveMatrixStep] = useState<number>(0);

  // ─── Module 3: Interpolation & Curve Fitting State ───
  const [interpMethod, setInterpMethod] = useState<InterpolationMethod>('lagrange');
  const [interpPoints, setInterpPoints] = useState<DataPoint[]>([
    { x: 100, y: 0.101 },
    { x: 120, y: 0.198 },
    { x: 140, y: 0.361 },
    { x: 160, y: 0.618 },
  ]);
  const [targetInterpX, setTargetInterpX] = useState<number>(130);

  // ─── Module 4: Numerical Calculus State ───
  const [calculusMode, setCalculusMode] = useState<'integration' | 'differentiation'>('integration');
  const [calcExpr, setCalcExpr] = useState<string>('1 / (1 + x^2)');
  const [calcLowerA, setCalcLowerA] = useState<number>(0);
  const [calcUpperB, setCalcUpperB] = useState<number>(1);
  const [calcN, setCalcN] = useState<number>(6);
  const [calcIntMethod, setCalcIntMethod] = useState<IntegrationMethod>('simpson-13');
  const [calcDiffMethod, setCalcDiffMethod] = useState<DiffMethod>('central');
  const [calcDiffX, setCalcDiffX] = useState<number>(0.5);
  const [calcDiffH, setCalcDiffH] = useState<number>(0.05);

  // ─── Module 5: Ordinary Differential Equations State ───
  const [odeMethod, setOdeMethod] = useState<ODEMethod>('rk4');
  const [odeExprFxy, setOdeExprFxy] = useState<string>('x + y');
  const [odeX0, setOdeX0] = useState<number>(0);
  const [odeY0, setOdeY0] = useState<number>(1);
  const [odeXEnd, setOdeXEnd] = useState<number>(1.0);
  const [odeStepH, setOdeStepH] = useState<number>(0.1);
  const [odeExactFormula, setOdeExactFormula] = useState<string>('2 * exp(x) - x - 1');

  // ─── Module 6: Partial Differential Equations State ───
  const [pdeScheme, setPdeScheme] = useState<'1d-heat-ftcs' | '1d-wave-hyperbolic' | '2d-laplace-elliptic'>('1d-heat-ftcs');
  const [pdeAlpha, setPdeAlpha] = useState<number>(0.05);
  const [pdeNx, setPdeNx] = useState<number>(21);
  const [pdeNt, setPdeNt] = useState<number>(50);
  const [pdeLengthL, setPdeLengthL] = useState<number>(1.0);
  const [pdeTotalTimeT, setPdeTotalTimeT] = useState<number>(0.2);
  const [pdeWaveSpeed, setPdeWaveSpeed] = useState<number>(1.0);

  // ─── Module 7: Comparison Laboratory Category ───
  const [benchCategory, setBenchCategory] = useState<'root-finding' | 'linear-systems' | 'integration' | 'ode'>('root-finding');

  // ═══════════════════════════════════════════════════════════════════════════
  // Compute Results Deterministically via NumericalCalculator
  // ═══════════════════════════════════════════════════════════════════════════
  const rootResult = useMemo(() => {
    return NumericalCalculator.solveRoot(rootMethod, rootExpr, rootA, rootB, rootTol);
  }, [rootMethod, rootExpr, rootA, rootB, rootTol]);

  const linearResult = useMemo(() => {
    return NumericalCalculator.solveLinearSystem(linearMethod, matrixA, vectorB);
  }, [linearMethod, matrixA, vectorB]);

  const interpResult = useMemo(() => {
    return NumericalCalculator.interpolate(interpMethod, interpPoints, targetInterpX);
  }, [interpMethod, interpPoints, targetInterpX]);

  const intResult = useMemo(() => {
    const exact = calcExpr === '1 / (1 + x^2)' && calcLowerA === 0 && calcUpperB === 1 ? Math.PI / 4 : undefined;
    return NumericalCalculator.computeNumericalIntegration(calcIntMethod, calcExpr, calcLowerA, calcUpperB, calcN, exact);
  }, [calcIntMethod, calcExpr, calcLowerA, calcUpperB, calcN]);

  const diffResult = useMemo(() => {
    return NumericalCalculator.computeNumericalDifferentiation(calcDiffMethod, calcExpr, calcDiffX, calcDiffH);
  }, [calcDiffMethod, calcExpr, calcDiffX, calcDiffH]);

  const odeResult = useMemo(() => {
    return NumericalCalculator.solveODE(odeMethod, odeExprFxy, odeX0, odeY0, odeXEnd, odeStepH, odeExactFormula);
  }, [odeMethod, odeExprFxy, odeX0, odeY0, odeXEnd, odeStepH, odeExactFormula]);

  const pdeResult = useMemo(() => {
    if (pdeScheme === '1d-heat-ftcs') {
      return NumericalCalculator.solve1DHeatEquation(pdeLengthL, pdeTotalTimeT, pdeAlpha, pdeNx, pdeNt);
    } else if (pdeScheme === '1d-wave-hyperbolic') {
      return NumericalCalculator.solve1DWaveEquation(pdeLengthL, 1.0, pdeWaveSpeed, pdeNx, 60);
    } else {
      return NumericalCalculator.solve2DLaplace(11, 11, 100, 0, 0, 0);
    }
  }, [pdeScheme, pdeLengthL, pdeTotalTimeT, pdeAlpha, pdeNx, pdeNt, pdeWaveSpeed]);

  const benchResult = useMemo(() => {
    return NumericalCalculator.runComparisonBench(benchCategory);
  }, [benchCategory]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Canvas Lifecycle & Scene Synchronization
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!canvasRef.current) return;
    if (sceneRef.current) {
      sceneRef.current.destroy();
      sceneRef.current = null;
    }

    const scene = createNumericalScene(activeSimId, canvasRef.current);
    sceneRef.current = scene;

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, [activeSimId]);

  // Synchronize active scene with latest computed state
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setPlaying(isPlaying);

    if (activeSimId === 'u25ma402-sim-01' && sceneRef.current instanceof RootFindingScene) {
      sceneRef.current.setData(rootExpr, rootResult);
    } else if (activeSimId === 'u25ma402-sim-02' && sceneRef.current instanceof LinearSystemsScene) {
      sceneRef.current.setData(matrixA, vectorB, linearResult);
      sceneRef.current.setStep(activeMatrixStep);
    } else if (activeSimId === 'u25ma402-sim-03' && sceneRef.current instanceof InterpolationScene) {
      sceneRef.current.setData(interpPoints, targetInterpX, interpResult);
    } else if (activeSimId === 'u25ma402-sim-04' && sceneRef.current instanceof CalculusScene) {
      if (calculusMode === 'integration') {
        sceneRef.current.setIntegrationData(calcExpr, calcLowerA, calcUpperB, intResult);
      } else {
        sceneRef.current.setDifferentiationData(calcExpr, diffResult);
      }
    } else if (activeSimId === 'u25ma402-sim-05' && sceneRef.current instanceof ODEScene) {
      sceneRef.current.setData(odeResult, odeExactFormula);
    } else if (activeSimId === 'u25ma402-sim-06' && sceneRef.current instanceof PDEScene) {
      sceneRef.current.setData(pdeResult);
    } else if (activeSimId === 'u25ma402-sim-07' && sceneRef.current instanceof ComparisonLabScene) {
      sceneRef.current.setData(benchResult);
    }
  }, [
    activeSimId,
    isPlaying,
    rootExpr,
    rootResult,
    matrixA,
    vectorB,
    linearResult,
    activeMatrixStep,
    interpPoints,
    targetInterpX,
    interpResult,
    calculusMode,
    calcExpr,
    calcLowerA,
    calcUpperB,
    intResult,
    diffResult,
    odeResult,
    odeExactFormula,
    pdeResult,
    benchResult,
  ]);

  // Record an observation trial in lab log
  const handleRecordTrial = useCallback(() => {
    let method = '';
    let problem = '';
    let summary = '';
    let errorMetric = '';

    if (activeSimId === 'u25ma402-sim-01') {
      method = rootMethod.toUpperCase();
      problem = `f(x) = ${rootExpr} on [${rootA}, ${rootB}]`;
      summary = `Root ≈ ${rootResult.root.toFixed(6)} (${rootResult.iterationsCount} iters)`;
      errorMetric = `ε ≈ ${rootResult.finalError.toExponential(4)}`;
    } else if (activeSimId === 'u25ma402-sim-02') {
      method = linearMethod.toUpperCase();
      problem = `${matrixA.length}×${matrixA.length} system`;
      summary = `x = [${linearResult.solution.map((v) => v.toFixed(3)).join(', ')}]`;
      errorMetric = `‖r‖_∞ = ${linearResult.residualNormInf.toExponential(3)}`;
    } else if (activeSimId === 'u25ma402-sim-03') {
      method = interpMethod.toUpperCase();
      problem = `${interpPoints.length} points, eval at x = ${targetInterpX}`;
      summary = `P(${targetInterpX}) = ${interpResult.interpolatedY.toFixed(4)}`;
      errorMetric = interpResult.isExtrapolation ? 'Extrapolated' : 'Interpolated';
    } else if (activeSimId === 'u25ma402-sim-04') {
      method = calculusMode === 'integration' ? calcIntMethod.toUpperCase() : calcDiffMethod.toUpperCase();
      problem = `${calculusMode} of ${calcExpr}`;
      summary =
        calculusMode === 'integration'
          ? `I ≈ ${intResult.approxIntegral.toFixed(5)}`
          : `f'(${calcDiffX}) ≈ ${diffResult.approxValue.toFixed(5)}`;
      errorMetric =
        calculusMode === 'integration' && intResult.absError
          ? `Abs err = ${intResult.absError.toExponential(3)}`
          : 'O(h²)';
    } else if (activeSimId === 'u25ma402-sim-05') {
      method = odeMethod.toUpperCase();
      problem = `dy/dx = ${odeExprFxy}, y(${odeX0})=${odeY0}`;
      summary = `y(${odeXEnd}) = ${odeResult.finalY.toFixed(5)}`;
      errorMetric = odeResult.maxGlobalError ? `Max err = ${odeResult.maxGlobalError.toExponential(3)}` : 'O(h⁴)';
    } else if (activeSimId === 'u25ma402-sim-06') {
      method = pdeScheme.toUpperCase();
      problem = `PDE Diffusion L=${pdeLengthL}, α=${pdeAlpha}`;
      summary = `Mesh r = ${(pdeResult as any).rParameter?.toFixed(4) || 0.25}`;
      errorMetric = (pdeResult as any).isStable ? 'STABLE' : 'UNSTABLE';
    } else {
      method = 'BENCHMARK';
      problem = benchCategory.toUpperCase();
      summary = `${benchResult.entries.length} methods evaluated`;
      errorMetric = 'Side-by-side';
    }

    const newTrial: NumericalLabTrial = {
      id: `trial-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      simId: activeSimId,
      method,
      problem,
      parameters: { activeSimId },
      resultSummary: summary,
      errorMetric,
    };

    setTrials((prev) => [newTrial, ...prev]);
  }, [
    activeSimId,
    rootMethod,
    rootExpr,
    rootA,
    rootB,
    rootResult,
    linearMethod,
    matrixA,
    linearResult,
    interpMethod,
    interpPoints,
    targetInterpX,
    interpResult,
    calculusMode,
    calcIntMethod,
    calcDiffMethod,
    calcExpr,
    intResult,
    calcDiffX,
    diffResult,
    odeMethod,
    odeExprFxy,
    odeX0,
    odeY0,
    odeXEnd,
    odeResult,
    pdeScheme,
    pdeLengthL,
    pdeAlpha,
    pdeResult,
    benchCategory,
    benchResult,
  ]);

  const quizQuestions = useMemo(() => NumericalCalculator.getQuizQuestions(), []);

  // ═══════════════════════════════════════════════════════════════════════════
  // JSX Render
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* ── HEADER NAVIGATION BAR ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-semibold cursor-pointer"
              title="Return to Course Catalogue"
            >
              ← Back
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                U25MA402 · Sem IV
              </span>
              <h1 className="text-sm font-bold tracking-tight text-white">
                Numerical Methods &amp; Partial Differential Equations
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              Department of Mechanical Engineering · Anna University R2025 Revised CBCS
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRecordTrial}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <span>📝</span>
            <span>Record Trial</span>
          </button>
          <button
            type="button"
            onClick={() => setIsLogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700 cursor-pointer"
          >
            <span>📋</span>
            <span>Log ({trials.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setIsQuizOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <span>🧠</span>
            <span>Syllabus Quiz</span>
          </button>
        </div>
      </header>

      {/* ── MODULE SELECTOR TABS (7 Units) ── */}
      <div className="flex-shrink-0 flex items-center gap-1 px-4 py-1.5 bg-slate-900/60 border-b border-slate-800 overflow-x-auto text-xs font-medium">
        {[
          { id: 'u25ma402-sim-01', label: '1. Root-Finding', icon: '🎯' },
          { id: 'u25ma402-sim-02', label: '2. Linear Equations', icon: '🔢' },
          { id: 'u25ma402-sim-03', label: '3. Interpolation', icon: '📈' },
          { id: 'u25ma402-sim-04', label: '4. Calculus & Quadrature', icon: '∫' },
          { id: 'u25ma402-sim-05', label: '5. Initial Value ODEs', icon: '⚡' },
          { id: 'u25ma402-sim-06', label: '6. Partial Diff Equations', icon: '🌊' },
          { id: 'u25ma402-sim-07', label: '7. Comparison Bench', icon: '⚖️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSimId(tab.id as NumericalSimId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer font-bold ${
              activeSimId === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── MAIN WORKSPACE: Parameter Configuration Panel + Interactive Canvas Viewport ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Parameters, Configuration & Engineering Presets */}
        <div className="w-full lg:w-84 xl:w-96 flex-shrink-0 bg-slate-900/80 border-r border-slate-800 overflow-y-auto p-4 space-y-4">
          {/* Module 1: Root-Finding Controls */}
          {activeSimId === 'u25ma402-sim-01' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Unit I · Root-Finding Configuration
                </span>
                <span className="text-[10px] text-slate-400 font-mono">f(x) = 0</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Numerical Method</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['bisection', 'regula-falsi', 'newton-raphson', 'secant'] as RootFindingMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setRootMethod(m)}
                      className={`px-2 py-1.5 rounded text-xs font-bold transition capitalize cursor-pointer ${
                        rootMethod === m ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {m.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Function Expression f(x)</label>
                <input
                  type="text"
                  value={rootExpr}
                  onChange={(e) => setRootExpr(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-sky-400 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {[
                    { label: 'x³ - x - 2', val: 'x^3 - x - 2', a: 1, b: 2 },
                    { label: 'cos(x) - x', val: 'cos(x) - x', a: 0, b: 1 },
                    { label: 'x³ - 4x - 9', val: 'x^3 - 4*x - 9', a: 2, b: 3 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setRootExpr(p.val);
                        setRootA(p.a);
                        setRootB(p.b);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {rootMethod === 'newton-raphson' ? 'Initial Guess x₀' : 'Bracket Left [a]'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rootA}
                    onChange={(e) => setRootA(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                  />
                </div>
                {rootMethod !== 'newton-raphson' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Bracket Right [b]</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rootB}
                      onChange={(e) => setRootB(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Convergence Tolerance: {rootTol}
                </label>
                <input
                  type="range"
                  min="0.0001"
                  max="0.01"
                  step="0.0005"
                  value={rootTol}
                  onChange={(e) => setRootTol(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Root Calculation Summary Card */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">Execution Result:</div>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  x ≈ {rootResult.root.toFixed(6)}
                </div>
                <div className="text-[11px] text-slate-400">
                  Iterations: <span className="text-white font-mono">{rootResult.iterationsCount}</span> | Error:{' '}
                  <span className="text-white font-mono">{rootResult.finalError.toExponential(3)}</span>
                </div>
                <div className="text-[11px] text-slate-400">{rootResult.statusMessage}</div>
              </div>
            </div>
          )}

          {/* Module 2: Simultaneous Linear Equations Controls */}
          {activeSimId === 'u25ma402-sim-02' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Unit I · Linear Solvers &amp; Residuals
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Ax = b</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Solver Method</label>
                <select
                  value={linearMethod}
                  onChange={(e) => setLinearMethod(e.target.value as LinearSolverMethod)}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                >
                  <option value="gauss-elimination">Gaussian Elimination (Partial Pivoting)</option>
                  <option value="gauss-jordan">Gauss-Jordan Elimination</option>
                  <option value="lu-decomposition">LU Decomposition (Doolittle)</option>
                  <option value="gauss-seidel">Gauss-Seidel Iteration</option>
                  <option value="jacobi">Jacobi Iteration</option>
                </select>
              </div>

              {/* Engineering Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Engineering Problem Presets</label>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => {
                      setMatrixA([
                        [10, 1, 2],
                        [2, 10, 1],
                        [1, 2, 10],
                      ]);
                      setVectorB([13, 13, 13]);
                    }}
                    className="px-2 py-1 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Diagonally Dominant (3×3)
                  </button>
                  <button
                    onClick={() => {
                      setMatrixA([
                        [4, -1, 0],
                        [-1, 4, -1],
                        [0, -1, 4],
                      ]);
                      setVectorB([100, 0, 100]);
                    }}
                    className="px-2 py-1 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    1D Heat Conduction Bar (3-Node)
                  </button>
                  <button
                    onClick={() => {
                      setMatrixA([
                        [1, 2, -1],
                        [2, 3, 1],
                        [3, 1, 2],
                      ]);
                      setVectorB([2, 9, 11]);
                    }}
                    className="px-2 py-1 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    3-Loop Electric Circuit
                  </button>
                </div>
              </div>

              {/* Row Step Stepper for Direct Methods */}
              {linearResult.steps.length > 0 && (
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-300">Transformation Step</span>
                    <span className="font-mono text-indigo-400">
                      {activeMatrixStep + 1} / {linearResult.steps.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={linearResult.steps.length - 1}
                    value={activeMatrixStep}
                    onChange={(e) => setActiveMatrixStep(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {linearResult.steps[activeMatrixStep]?.description}
                  </p>
                </div>
              )}

              {/* Solution Summary */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-slate-200">Solution Vector x:</div>
                <div className="text-xs font-mono text-emerald-400 space-y-0.5">
                  {linearResult.solution.map((v, i) => (
                    <div key={i}>
                      x_{i + 1} = {v.toFixed(6)}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  Residual Norm ‖r‖_∞ ={' '}
                  <span className="text-white font-mono">{linearResult.residualNormInf.toExponential(3)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Module 3: Interpolation Controls */}
          {activeSimId === 'u25ma402-sim-03' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Unit II · Interpolation &amp; Approximation
                </span>
                <span className="text-[10px] text-slate-400 font-mono">P_n(x)</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Interpolation Method</label>
                <select
                  value={interpMethod}
                  onChange={(e) => setInterpMethod(e.target.value as InterpolationMethod)}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                >
                  <option value="lagrange">Lagrange's Interpolation (Unequally Spaced)</option>
                  <option value="newton-divided">Newton's Divided Difference</option>
                  <option value="newton-forward">Newton's Forward Difference (Equally Spaced)</option>
                  <option value="newton-backward">Newton's Backward Difference (Equally Spaced)</option>
                  <option value="least-squares-linear">Least-Squares Linear Regression (Curve Fitting)</option>
                </select>
              </div>

              {/* Observation Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mechanical Presets</label>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => {
                      setInterpPoints([
                        { x: 100, y: 0.101 },
                        { x: 120, y: 0.198 },
                        { x: 140, y: 0.361 },
                        { x: 160, y: 0.618 },
                      ]);
                      setTargetInterpX(130);
                    }}
                    className="px-2 py-1 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Steam Pressure vs Temp
                  </button>
                  <button
                    onClick={() => {
                      setInterpPoints([
                        { x: 10, y: 175 },
                        { x: 20, y: 280 },
                        { x: 30, y: 350 },
                        { x: 40, y: 400 },
                      ]);
                      setTargetInterpX(25);
                    }}
                    className="px-2 py-1 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Tensile Stress vs Strain
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Evaluation Point x* = {targetInterpX}
                </label>
                <input
                  type="number"
                  step="1"
                  value={targetInterpX}
                  onChange={(e) => setTargetInterpX(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">Interpolated Output:</div>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  P({targetInterpX}) ≈ {interpResult.interpolatedY.toFixed(5)}
                </div>
                {interpResult.isExtrapolation && (
                  <div className="text-[11px] font-bold text-amber-400">
                    ⚠️ Point lies outside data range (Extrapolation hazard)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module 4: Numerical Calculus Controls */}
          {activeSimId === 'u25ma402-sim-04' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Unit III · Differentiation &amp; Integration
                </span>
                <span className="text-[10px] text-slate-400 font-mono">f'(x) &amp; ∫ f(x)dx</span>
              </div>

              <div className="flex rounded-lg border border-slate-800 p-0.5 bg-slate-950">
                <button
                  onClick={() => setCalculusMode('integration')}
                  className={`flex-1 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    calculusMode === 'integration' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Integration (Quadrature)
                </button>
                <button
                  onClick={() => setCalculusMode('differentiation')}
                  className={`flex-1 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    calculusMode === 'differentiation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Differentiation
                </button>
              </div>

              {calculusMode === 'integration' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Integration Rule</label>
                    <select
                      value={calcIntMethod}
                      onChange={(e) => setCalcIntMethod(e.target.value as IntegrationMethod)}
                      className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                    >
                      <option value="trapezoidal">Composite Trapezoidal Rule [O(h²)]</option>
                      <option value="simpson-13">Simpson's 1/3 Rule [O(h⁴)] (n even)</option>
                      <option value="simpson-38">Simpson's 3/8 Rule [O(h⁴)] (n multiple of 3)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Lower Limit [a]</label>
                      <input
                        type="number"
                        step="0.5"
                        value={calcLowerA}
                        onChange={(e) => setCalcLowerA(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Upper Limit [b]</label>
                      <input
                        type="number"
                        step="0.5"
                        value={calcUpperB}
                        onChange={(e) => setCalcUpperB(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Subintervals n: {calcN} (h = {((calcUpperB - calcLowerA) / calcN).toFixed(4)})
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="24"
                      step="2"
                      value={calcN}
                      onChange={(e) => setCalcN(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Difference Scheme</label>
                    <select
                      value={calcDiffMethod}
                      onChange={(e) => setCalcDiffMethod(e.target.value as DiffMethod)}
                      className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                    >
                      <option value="forward">Forward Difference [O(h)]</option>
                      <option value="backward">Backward Difference [O(h)]</option>
                      <option value="central">Central Difference [O(h²)]</option>
                      <option value="second-derivative">Second Derivative Central [O(h²)]</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Target x</label>
                      <input
                        type="number"
                        step="0.1"
                        value={calcDiffX}
                        onChange={(e) => setCalcDiffX(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Step Size h</label>
                      <input
                        type="number"
                        step="0.01"
                        value={calcDiffH}
                        onChange={(e) => setCalcDiffH(parseFloat(e.target.value) || 0.05)}
                        className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Module 5: ODE Controls */}
          {activeSimId === 'u25ma402-sim-05' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Unit IV · Initial Value Problems
                </span>
                <span className="text-[10px] text-slate-400 font-mono">dy/dx = f(x, y)</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">ODE Method</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['euler', 'modified-euler', 'rk4'] as ODEMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setOdeMethod(m)}
                      className={`px-2 py-1.5 rounded text-xs font-bold transition capitalize cursor-pointer ${
                        odeMethod === m ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {m === 'rk4' ? 'RK-4' : m.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Derivative f(x, y)</label>
                <input
                  type="text"
                  value={odeExprFxy}
                  onChange={(e) => setOdeExprFxy(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-sky-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">x₀</label>
                  <input
                    type="number"
                    value={odeX0}
                    onChange={(e) => setOdeX0(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">y₀</label>
                  <input
                    type="number"
                    value={odeY0}
                    onChange={(e) => setOdeY0(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">x_end</label>
                  <input
                    type="number"
                    value={odeXEnd}
                    onChange={(e) => setOdeXEnd(parseFloat(e.target.value) || 1)}
                    className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Step Size h: {odeStepH} ({odeResult.steps.length - 1} steps)
                </label>
                <input
                  type="range"
                  min="0.02"
                  max="0.25"
                  step="0.02"
                  value={odeStepH}
                  onChange={(e) => setOdeStepH(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-slate-200">Final Numerical Solution:</div>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  y({odeXEnd}) ≈ {odeResult.finalY.toFixed(6)}
                </div>
                {odeResult.finalExactY !== undefined && (
                  <div className="text-[11px] text-slate-400">
                    Exact: <span className="font-mono text-sky-400">{odeResult.finalExactY.toFixed(6)}</span> | Error:{' '}
                    <span className="font-mono text-amber-400">
                      {Math.abs(odeResult.finalY - odeResult.finalExactY).toExponential(3)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module 6: PDE Controls */}
          {activeSimId === 'u25ma402-sim-06' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Unit V · Partial Differential Equations
                </span>
                <span className="text-[10px] text-slate-400 font-mono">∂u/∂t = α·∂²u/∂x²</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">PDE Physical System</label>
                <select
                  value={pdeScheme}
                  onChange={(e) => setPdeScheme(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                >
                  <option value="1d-heat-ftcs">1D Heat Conduction (Bender-Schmidt FTCS)</option>
                  <option value="1d-wave-hyperbolic">1D Wave Equation (Vibrating String)</option>
                  <option value="2d-laplace-elliptic">2D Steady-State Laplace (Liebmann)</option>
                </select>
              </div>

              {pdeScheme === '1d-heat-ftcs' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Thermal Diffusivity α: {pdeAlpha} m²/s
                    </label>
                    <input
                      type="range"
                      min="0.01"
                      max="0.15"
                      step="0.01"
                      value={pdeAlpha}
                      onChange={(e) => setPdeAlpha(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Time Steps nt: {pdeNt} (Total Time: {pdeTotalTimeT}s)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={pdeNt}
                      onChange={(e) => setPdeNt(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* Stability Card */}
                  <div
                    className={`p-3 rounded-xl border ${
                      (pdeResult as any).isStable
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{(pdeResult as any).isStable ? '✓' : '⚠️'}</span>
                      <span>
                        CFL Stability Condition: r = {(pdeResult as any).rParameter?.toFixed(4) || 0.25}
                      </span>
                    </div>
                    <div className="text-[11px] mt-1 opacity-90">
                      {(pdeResult as any).isStable
                        ? 'Scheme is STABLE (r ≤ 0.50). Heat decays physically.'
                        : 'UNSTABLE (r > 0.50)! Unbounded oscillations occur.'}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Module 7: Comparison Laboratory Controls */}
          {activeSimId === 'u25ma402-sim-07' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Module 7 · Method Benchmark Suite
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Fair Comparison</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Problem Category</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['root-finding', 'linear-systems', 'integration', 'ode'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setBenchCategory(cat)}
                      className={`px-2 py-1.5 rounded text-xs font-bold transition capitalize cursor-pointer ${
                        benchCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cat.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                <p className="font-semibold text-white mb-1">Standardized Benchmark Protocol:</p>
                All numerical algorithms are evaluated on identical mathematical problem inputs under fixed termination
                tolerances to isolate algorithm efficiency, order of convergence, and engineering suitability.
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive High-Performance Canvas Viewport */}
        <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
          {/* Top Bar inside Viewport for Play / Pause & Time-Step */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 backdrop-blur-xs z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                type="button"
                onClick={() => sceneRef.current?.resetTime()}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer"
              >
                ↺ Reset
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Status: <span className="text-emerald-400 font-bold">Deterministic Engine Active</span>
            </div>
          </div>

          {/* Canvas Element */}
          <div className="flex-1 w-full h-full relative overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>
      </div>

      {/* ── MODAL: Syllabus Quiz (5 Questions) ── */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <h3 className="font-bold text-sm text-white">
                  U25MA402 Numerical Methods &amp; PDEs — Concept Assessment
                </h3>
              </div>
              <button
                onClick={() => setIsQuizOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold">
                    <span>Question {idx + 1} of 5</span>
                    <span className="text-slate-500">{q.syllabusTopic}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100">{q.question}</p>
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-xs ${
                          quizAnswers[q.id] === oIdx
                            ? 'bg-indigo-900/30 border-indigo-500 text-white'
                            : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-${q.id}`}
                          checked={quizAnswers[q.id] === oIdx}
                          onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                          disabled={quizSubmitted}
                          className="accent-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {quizSubmitted && (
                    <div
                      className={`p-2.5 rounded-lg text-[11px] mt-2 ${
                        quizAnswers[q.id] === q.correctAnswer
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                          : 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                      }`}
                    >
                      <div className="font-bold">
                        {quizAnswers[q.id] === q.correctAnswer ? '✓ Correct!' : `✗ Correct Answer: ${q.options[q.correctAnswer]}`}
                      </div>
                      <p className="mt-1 opacity-90">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/60">
              <div className="text-xs text-slate-400">
                {quizSubmitted ? (
                  <span className="font-bold text-emerald-400">
                    Score: {Object.keys(quizAnswers).filter((k) => quizAnswers[Number(k)] === quizQuestions.find((q) => q.id === Number(k))?.correctAnswer).length} / 5
                  </span>
                ) : (
                  <span>Answer all questions and submit</span>
                )}
              </div>
              <div className="flex gap-2">
                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Retake
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Observation Lab Log ── */}
      {isLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h3 className="font-bold text-sm text-white">Numerical Laboratory Observation Record</h3>
              </div>
              <button onClick={() => setIsLogOpen(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {trials.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No observation trials recorded yet. Use the "Record Trial" button in any module to log numerical experiments.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="p-2">Time</th>
                        <th className="p-2">Method</th>
                        <th className="p-2">Problem</th>
                        <th className="p-2">Calculated Result</th>
                        <th className="p-2">Error / Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {trials.map((tr) => (
                        <tr key={tr.id} className="hover:bg-slate-800/20">
                          <td className="p-2 font-mono text-slate-400">{tr.timestamp}</td>
                          <td className="p-2 font-bold text-sky-400">{tr.method}</td>
                          <td className="p-2 text-slate-300">{tr.problem}</td>
                          <td className="p-2 font-mono text-emerald-400">{tr.resultSummary}</td>
                          <td className="p-2 font-mono text-slate-400">{tr.errorMetric}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/60">
              <span className="text-xs text-slate-400">Total Trials: {trials.length}</span>
              <button
                onClick={() => setTrials([])}
                disabled={trials.length === 0}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs transition disabled:opacity-50 cursor-pointer"
              >
                Clear Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
