import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  U25CS102_20_SIMULATIONS,
  type ComputingSimulationMetadata,
} from './EssentialsComputingSimData';
import {
  Maximize2,
  Minimize2,
  Compass,
  BookOpen,
  Award,
  HelpCircle,
  Sparkles,
  Sliders,
  Eye,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export interface EssentialsComputingViewProps {
  simId: string;
  onClose?: () => void;
  standalone?: boolean;
  showHeader?: boolean;
  showSidebar?: boolean;
  theme?: 'dark' | 'light';
  params?: Record<string, any>;
  onParamChange?: (key: string, value: any) => void;
}

export const EssentialsComputingView: React.FC<EssentialsComputingViewProps> = ({
  simId,
  onClose,
  standalone: _standalone = false,
  showHeader = true,
  showSidebar = true,
  theme: _theme = 'dark',
  params: externalParams,
  onParamChange,
}) => {
  // Find metadata for current simulation
  const meta: ComputingSimulationMetadata = useMemo(() => {
    const found = U25CS102_20_SIMULATIONS.find((s) => s.id === simId);
    return found || U25CS102_20_SIMULATIONS[0]!;
  }, [simId]);

  // Tabbed view state
  const [activeTab, setActiveTab] = useState<'explore' | 'guided' | 'challenges' | 'quiz' | 'theory'>('explore');

  // Parameters state
  const [internalParams, setInternalParams] = useState<Record<string, any>>(meta.defaultParams);
  useEffect(() => {
    setInternalParams(meta.defaultParams);
  }, [meta]);

  const params = externalParams || internalParams;

  const updateParam = (key: string, value: any) => {
    if (onParamChange) {
      onParamChange(key, value);
    }
    setInternalParams((prev) => ({ ...prev, [key]: value }));
  };

  // Guided Walkthrough state
  const [currentGuideStep, setCurrentGuideStep] = useState(0);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Fullscreen State
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // 3D vs 2D Mode Toggle
  const [is3DMode, setIs3DMode] = useState<boolean>(meta.is3DPreferred ?? false);
  useEffect(() => {
    setIs3DMode(meta.is3DPreferred ?? false);
  }, [meta]);

  // 3D Canvas and Scene References
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const animStateRef = useRef<Record<string, any>>({});
  const [autoRotate, setAutoRotate] = useState(false);

  // Reset 3D camera
  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 8, 16);
      controlsRef.current.target.set(0, 1, 0);
      controlsRef.current.update();
    }
  }, []);

  // Initialize and update Three.js scene
  useEffect(() => {
    if (!is3DMode || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060b14);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 16);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    mountRef.current.replaceChildren(renderer.domElement);

    // 4. Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 60;
    controls.minDistance = 2;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 1.0, 50);
    pointLight.position.set(-10, 8, -5);
    scene.add(pointLight);

    // Grid floor
    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -0.01;
    scene.add(grid);

    // 6. Build simulation specific 3D model
    buildComputingScene(meta.id, scene, animStateRef.current, params);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.update();
      }

      if (animStateRef.current.update) {
        animStateRef.current.update(dt, time, params);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize listener
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [meta.id, is3DMode]);

  // Update 3D animation parameters live
  useEffect(() => {
    if (animStateRef.current && animStateRef.current.setParams) {
      animStateRef.current.setParams(params);
    }
  }, [params]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full w-full select-none bg-slate-950 text-slate-100 font-sans overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-[9999]' : 'relative'
      }`}
    >
      {/* ── TOP NAV / BANNER ── */}
      {showHeader && (
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-2xl border border-indigo-500/30 shadow-xs">
              {meta.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  U25CS102 · Unit {meta.unit}
                </span>
                <span className="text-xs font-bold text-slate-400 truncate hidden sm:inline">
                  {meta.unitTitle}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-100 tracking-tight truncate">
                {meta.title}
              </h1>
            </div>
          </div>

          {/* Global Controls & Mode Switch */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 3D vs 2D Mode Switch */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setIs3DMode(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !is3DMode
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2D Studio
              </button>
              <button
                type="button"
                onClick={() => setIs3DMode(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  is3DMode
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3D View
              </button>
            </div>

            {/* Camera Reset (in 3D mode) */}
            {is3DMode && (
              <button
                type="button"
                onClick={resetCamera}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer"
                title="Reset 3D Camera View"
              >
                <Compass className="size-4" />
              </button>
            )}

            {/* Auto Rotate Toggle */}
            {is3DMode && (
              <button
                type="button"
                onClick={() => setAutoRotate((r) => !r)}
                className={`px-2 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  autoRotate
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Toggle Auto-Rotation"
              >
                {autoRotate ? 'Rotating' : 'Orbit'}
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer"
              title="Fullscreen Mode"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            {/* Close Action */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 text-xs font-bold cursor-pointer"
              >
                ✕ Exit
              </button>
            )}
          </div>
        </header>
      )}

      {/* ── MAIN WORKSPACE: CANVAS (LEFT) + TABBED CONTROL PANEL (RIGHT) ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: Interactive Canvas (3D WebGL or 2D Interactive Studio) */}
        <div className="flex-1 flex flex-col relative h-full min-h-[320px] bg-slate-950 overflow-hidden">
          {is3DMode ? (
            <div ref={mountRef} className="w-full h-full block cursor-grab active:cursor-grabbing select-none" />
          ) : (
            <div className="w-full h-full overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-900/60">
              <Interactive2DStudio simId={meta.id} params={params} setParams={setInternalParams} />
            </div>
          )}

          {/* Interactive Legend / Prompt Overlay at Bottom of Viewport */}
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-center justify-between z-10">
            <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
              <Sparkles className="size-3.5 text-indigo-400" />
              <span>{is3DMode ? '3D Interactive Model · Drag to orbit, scroll to zoom' : '2D Interactive Studio · Click elements to manipulate state'}</span>
            </div>

            {/* Viewport Floating Mode Switcher (always accessible, especially in embedded shell) */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-lg">
              <button
                type="button"
                onClick={() => setIs3DMode(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !is3DMode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2D Studio
              </button>
              <button
                type="button"
                onClick={() => setIs3DMode(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  is3DMode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3D View
              </button>
              {is3DMode && (
                <button
                  type="button"
                  onClick={resetCamera}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer"
                  title="Reset Camera View"
                >
                  <Compass className="size-3.5" />
                </button>
              )}
              {is3DMode && (
                <button
                  type="button"
                  onClick={() => setAutoRotate((r) => !r)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    autoRotate ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle Auto-Rotation"
                >
                  {autoRotate ? 'Rotating' : 'Orbit'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Tabbed Pedagogical Control Dock */}
        {showSidebar && (
        <div className="w-full lg:w-96 flex-shrink-0 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-auto lg:h-full overflow-hidden">
          {/* Tab Selector Bar */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="size-3.5" />
              <span>Explore</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guided')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'guided'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Eye className="size-3.5" />
              <span>Guided</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'challenges'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Award className="size-3.5" />
              <span>Tasks</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <HelpCircle className="size-3.5" />
              <span>Quiz</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('theory')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'theory'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="size-3.5" />
              <span>Theory</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {/* ── TAB 1: EXPLORE (PARAMETERS & LIVE CONTROLS) ── */}
            {activeTab === 'explore' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Interactive Parameters
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setInternalParams(meta.defaultParams);
                      if (onParamChange) {
                        Object.entries(meta.defaultParams).forEach(([k, v]) => onParamChange(k, v));
                      }
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Reset Defaults ↺
                  </button>
                </div>

                <div className="space-y-3">
                  {Object.entries(params).map(([key, val]) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between text-slate-300">
                        <span className="capitalize font-semibold">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-mono text-indigo-400 font-bold">{String(val)}</span>
                      </div>
                      {typeof val === 'number' ? (
                        <input
                          type="range"
                          min={key === 'clockSpeed' || key === 'speed' ? 0.5 : key === 'arraySize' ? 4 : 0}
                          max={key === 'clockSpeed' || key === 'speed' ? 5 : key === 'arraySize' ? 32 : key === 'quantum' ? 10 : 255}
                          step={key === 'clockSpeed' || key === 'speed' ? 0.5 : 1}
                          value={val}
                          onChange={(e) => updateParam(key, parseFloat(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      ) : typeof val === 'boolean' ? (
                        <button
                          type="button"
                          onClick={() => updateParam(key, !val)}
                          className={`w-full py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                            val
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {val ? 'Enabled / True' : 'Disabled / False'}
                        </button>
                      ) : (
                        <input
                          type="text"
                          value={String(val)}
                          onChange={(e) => updateParam(key, e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Readout Summary */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live Analytical Summary
                  </div>
                  <div className="text-slate-300 text-xs leading-relaxed">
                    {meta.shortDescription}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: GUIDED STEPS ── */}
            {activeTab === 'guided' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Step-by-Step Walkthrough
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Step {currentGuideStep + 1} of {meta.guidedSteps.length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Sparkles className="size-4" />
                    <span>{meta.guidedSteps[currentGuideStep]?.title}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {meta.guidedSteps[currentGuideStep]?.description}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    disabled={currentGuideStep === 0}
                    onClick={() => setCurrentGuideStep((s) => Math.max(0, s - 1))}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="size-4" /> Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentGuideStep === meta.guidedSteps.length - 1}
                    onClick={() => setCurrentGuideStep((s) => Math.min(meta.guidedSteps.length - 1, s + 1))}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Next <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 3: CHALLENGE TASKS ── */}
            {activeTab === 'challenges' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Hands-On Challenge Missions
                  </span>
                </div>

                <div className="space-y-3">
                  {meta.challenges.map((ch, idx) => (
                    <div key={ch.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <span className="size-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{ch.title}</span>
                      </div>
                      <p className="text-slate-400 text-xs">{ch.goal}</p>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300">
                        <strong className="text-amber-400">Hint:</strong> {ch.hint}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Target: {ch.successCondition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 4: 5-ITEM ASSESSMENT QUIZ ── */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Concept Assessment Bank
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnswers({});
                      setShowQuizResults(false);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Reset Quiz ↺
                  </button>
                </div>

                {meta.assessments.map((q, qIdx) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correctIndex;

                  return (
                    <div key={q.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-indigo-400 text-xs">Q{qIdx + 1}.</span>
                        <p className="text-slate-200 font-semibold text-xs leading-snug">{q.question}</p>
                      </div>

                      <div className="space-y-1.5 pl-4">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAns === optIdx;
                          let btnStyle = 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800';

                          if (showQuizResults) {
                            if (optIdx === q.correctIndex) {
                              btnStyle = 'bg-emerald-950/50 border-emerald-600 text-emerald-200 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-rose-950/50 border-rose-600 text-rose-300';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => !showQuizResults && setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              className={`w-full text-left p-2 rounded-lg border text-xs transition cursor-pointer ${btnStyle}`}
                            >
                              <span className="font-mono text-slate-400 mr-2">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {showQuizResults && (
                        <div
                          className={`p-2.5 rounded-lg text-[10px] leading-relaxed border ${
                            isCorrect
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                              : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                          }`}
                        >
                          <strong>{isCorrect ? '✓ Correct!' : '✕ Incorrect.'}</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!showQuizResults ? (
                  <button
                    type="button"
                    onClick={() => setShowQuizResults(true)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md cursor-pointer"
                  >
                    Submit Answers &amp; Check Results
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                    <div className="text-base font-black text-indigo-300">
                      Score:{' '}
                      {
                        meta.assessments.filter((q) => selectedAnswers[q.id] === q.correctIndex).length
                      }{' '}
                      / {meta.assessments.length}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Great job! Review the explanations above to solidify your computing fundamentals.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: THEORY & ENGINEERING CONTEXT ── */}
            {activeTab === 'theory' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Scientific Model &amp; Theory
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400 text-xs">Governing Equations &amp; Relations</h4>
                  <div className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-indigo-200 border border-slate-800 overflow-x-auto">
                    {meta.formulaOverview}
                  </div>
                </div>

                {/* Real-World & Engineering Context */}
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-3">
                  <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Real-World &amp; Engineering Context
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-slate-300">What is happening?</strong>
                      <p className="text-slate-400 mt-0.5">{meta.engineeringContext.what}</p>
                    </div>
                    <div>
                      <strong className="text-slate-300">Where is it used?</strong>
                      <p className="text-slate-400 mt-0.5">{meta.engineeringContext.where}</p>
                    </div>
                    <div>
                      <strong className="text-slate-300">When is it used?</strong>
                      <p className="text-slate-400 mt-0.5">{meta.engineeringContext.when}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400 text-xs">Model Assumptions</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    {meta.modelAssumptions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400 text-xs">Learning Objectives</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    {meta.learningObjectives.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   2D INTERACTIVE STUDIO COMPONENT DISPATCHER (ALL 20 SIMULATIONS)
   ───────────────────────────────────────────────────────────────────────────── */

import {
  NumberConverterStudio,
  BinaryArithmeticStudio,
  DataSizeStudio,
  MultimediaEncodingStudio,
} from './ComputingStudiosA';
import {
  HardwareExplorerStudio,
  IPOJourneyStudio,
  CPUExecutionStudio,
  CPUPipelineStudio,
} from './ComputingStudiosB';
import {
  MemoryHierarchyStudio,
  CacheLocalityStudio,
  StorageFilesystemStudio,
  LogicGatesStudio,
} from './ComputingStudiosC';
import {
  AlgorithmBuilderStudio,
  ScratchBlocksStudio,
  TraceTableStudio,
  SearchRaceStudio,
} from './ComputingStudiosD';
import {
  SortingVisualizerStudio,
  DecompositionStudio,
  OSSchedulerStudio,
  SoftwareDebuggingStudio,
} from './ComputingStudiosE';

interface Interactive2DStudioProps {
  simId: string;
  params: Record<string, any>;
  setParams: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const Interactive2DStudio: React.FC<Interactive2DStudioProps> = ({ simId, params, setParams }) => {
  switch (simId) {
    // Unit 1: Digital Representation & Data Encoding
    case 'u25cs102-number-converter':
      return <NumberConverterStudio params={params} setParams={setParams} />;
    case 'u25cs102-binary-arithmetic':
      return <BinaryArithmeticStudio params={params} setParams={setParams} />;
    case 'u25cs102-data-size':
      return <DataSizeStudio params={params} setParams={setParams} />;
    case 'u25cs102-multimedia-encoding':
      return <MultimediaEncodingStudio params={params} setParams={setParams} />;

    // Unit 2: Computer Architecture & CPU Execution
    case 'u25cs102-hardware-explorer-3d':
      return <HardwareExplorerStudio params={params} setParams={setParams} />;
    case 'u25cs102-ipo-journey':
      return <IPOJourneyStudio params={params} setParams={setParams} />;
    case 'u25cs102-cpu-execution':
      return <CPUExecutionStudio params={params} setParams={setParams} />;
    case 'u25cs102-cpu-pipeline':
      return <CPUPipelineStudio params={params} setParams={setParams} />;

    // Unit 3: Memory Hierarchy, Storage & Logic
    case 'u25cs102-memory-hierarchy-3d':
      return <MemoryHierarchyStudio params={params} setParams={setParams} />;
    case 'u25cs102-cache-locality':
      return <CacheLocalityStudio params={params} setParams={setParams} />;
    case 'u25cs102-storage-filesystem':
      return <StorageFilesystemStudio params={params} setParams={setParams} />;
    case 'u25cs102-logic-gates':
      return <LogicGatesStudio params={params} setParams={setParams} />;

    // Unit 4: Computational Thinking & Algorithms
    case 'u25cs102-algorithm-builder':
      return <AlgorithmBuilderStudio params={params} setParams={setParams} />;
    case 'u25cs102-scratch-blocks-world':
      return <ScratchBlocksStudio params={params} setParams={setParams} />;
    case 'u25cs102-trace-table-simulator':
      return <TraceTableStudio params={params} setParams={setParams} />;
    case 'u25cs102-search-race':
      return <SearchRaceStudio params={params} setParams={setParams} />;

    // Unit 5: Algorithm Complexity, OS & Debugging
    case 'u25cs102-sorting-visualizer':
      return <SortingVisualizerStudio params={params} setParams={setParams} />;
    case 'u25cs102-computational-decomposition':
      return <DecompositionStudio params={params} setParams={setParams} />;
    case 'u25cs102-os-scheduler':
      return <OSSchedulerStudio params={params} setParams={setParams} />;
    case 'u25cs102-software-debugging':
      return <SoftwareDebuggingStudio params={params} setParams={setParams} />;

    default:
      return <NumberConverterStudio params={params} setParams={setParams} />;
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   3D THREE.JS SCENE BUILDER FOR ESSENTIALS OF COMPUTING
   ───────────────────────────────────────────────────────────────────────────── */

function buildComputingScene(
  simId: string,
  scene: THREE.Scene,
  animRef: Record<string, any>,
  _params: Record<string, any>
) {
  // Clear existing items except lights and grid
  const toRemove: THREE.Object3D[] = [];
  scene.traverse((obj) => {
    if (obj !== scene && !(obj as any).isLight && !(obj instanceof THREE.GridHelper)) {
      toRemove.push(obj);
    }
  });
  toRemove.forEach((obj) => scene.remove(obj));

  switch (simId) {
    // 5. Inside a Computer — 3D Hardware Explorer
    case 'u25cs102-hardware-explorer-3d': {
      // Desktop PC Chassis Case
      const caseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0.35 });
      const pcCase = new THREE.Mesh(new THREE.BoxGeometry(10, 12, 6), caseMat);
      pcCase.position.set(0, 6, 0);
      scene.add(pcCase);

      // Motherboard PCB
      const mobo = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 0.2), new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.5 }));
      mobo.position.set(0, 6, -2.5);
      scene.add(mobo);

      // CPU Socket + Cooler Fan
      const cpuSocket = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 0.4), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 }));
      cpuSocket.position.set(0, 7.5, -2.2);
      scene.add(cpuSocket);

      const fanBlade = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      fanBlade.rotation.x = Math.PI / 2;
      fanBlade.position.set(0, 7.5, -1.8);
      scene.add(fanBlade);

      // RAM DIMMs (Dual Channel)
      for (let i = 0; i < 2; i++) {
        const ram = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 0.8), new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.8 }));
        ram.position.set(2.0 + i * 0.6, 7.5, -2.0);
        scene.add(ram);
      }

      // GPU Expansion Board
      const gpu = new THREE.Mesh(new THREE.BoxGeometry(7.0, 2.5, 1.2), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7 }));
      gpu.position.set(0, 3.8, -1.5);
      scene.add(gpu);

      // Power Supply Unit (PSU)
      const psu = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.0, 4.0), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 }));
      psu.position.set(-2.5, 2.0, 0);
      scene.add(psu);

      animRef.update = (_dt: number, _time: number) => {
        fanBlade.rotation.z += 0.08;
      };
      break;
    }

    // 6. Input–Process–Output Data Journey
    case 'u25cs102-ipo-journey': {
      // 3 Stations: Input, Processing (CPU/RAM), Output
      const inStation = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 3), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
      inStation.position.set(-8, 1, 0);
      scene.add(inStation);

      const procStation = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 4), new THREE.MeshStandardMaterial({ color: 0x8b5cf6 }));
      procStation.position.set(0, 1.5, 0);
      scene.add(procStation);

      const outStation = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 3), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
      outStation.position.set(8, 1, 0);
      scene.add(outStation);

      // Connecting bus lines
      const busGeo = new THREE.CylinderGeometry(0.08, 0.08, 18, 16);
      const busMesh = new THREE.Mesh(busGeo, new THREE.MeshBasicMaterial({ color: 0x475569 }));
      busMesh.rotation.z = Math.PI / 2;
      busMesh.position.set(0, 0.5, 0);
      scene.add(busMesh);

      // Moving Data Packets
      const packetGroup = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const pkt = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        pkt.position.set(-8 + i * 3.2, 0.8, 0);
        packetGroup.add(pkt);
      }
      scene.add(packetGroup);

      animRef.update = (_dt: number, _time: number) => {
        packetGroup.children.forEach((p) => {
          p.position.x += 0.06;
          if (p.position.x > 8) p.position.x = -8;
        });
      };
      break;
    }

    // 9. Memory Hierarchy — 3D Data Retrieval Lab
    case 'u25cs102-memory-hierarchy-3d': {
      // Layered Hierarchy Pyramid Tiers
      const tiers = [
        { name: 'Registers (<1ns)', y: 8.5, radius: 1.0, color: 0xef4444 },
        { name: 'L1/L2 Cache (1-5ns)', y: 6.5, radius: 2.2, color: 0xf59e0b },
        { name: 'L3 Cache (10-20ns)', y: 4.5, radius: 3.6, color: 0x10b981 },
        { name: 'Main RAM (50-100ns)', y: 2.5, radius: 5.2, color: 0x3b82f6 },
        { name: 'NVMe / SSD (10-100µs)', y: 0.5, radius: 7.0, color: 0x6366f1 },
      ];

      tiers.forEach((t) => {
        const geo = new THREE.CylinderGeometry(t.radius * 0.7, t.radius, 1.6, 24);
        const mat = new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.4, transparent: true, opacity: 0.85 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, t.y, 0);
        scene.add(mesh);
      });

      // Central Data Probe Beam
      const probeGeo = new THREE.CylinderGeometry(0.12, 0.12, 11, 16);
      const probeMesh = new THREE.Mesh(probeGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      probeMesh.position.set(0, 5, 0);
      scene.add(probeMesh);

      animRef.update = (_dt: number, time: number) => {
        scene.rotation.y = Math.sin(time * 0.2) * 0.1;
      };
      break;
    }

    // 14. Scratch-Style Drag-and-Drop Programming World
    case 'u25cs102-scratch-blocks-world': {
      // 3D Grid Maze World
      const mazeBase = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      mazeBase.position.y = 0;
      scene.add(mazeBase);

      // Maze Boundary Walls
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      for (let i = -5; i <= 5; i += 2) {
        if (i !== 1) {
          const w = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), wallMat);
          w.position.set(i, 0.8, -1);
          scene.add(w);
        }
      }

      // 3D Robot Character
      const botBody = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
      botBody.position.set(-3, 0.8, 2);
      scene.add(botBody);

      const botHead = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      botHead.position.set(-3, 1.6, 2);
      scene.add(botHead);

      // Target Goal Flag
      const goalFlag = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.5, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
      goalFlag.position.set(3, 1.25, -3);
      scene.add(goalFlag);

      animRef.update = (_dt: number, time: number) => {
        botHead.rotation.y = Math.sin(time * 2) * 0.4;
      };
      break;
    }

    // Default conceptual model for other simulations
    default: {
      const coreGeo = new THREE.DodecahedronGeometry(3.5, 0);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, wireframe: true });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 5, 0);
      scene.add(core);

      const inner = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 16), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      inner.position.set(0, 5, 0);
      scene.add(inner);

      animRef.update = (_dt: number, _time: number) => {
        core.rotation.x += 0.005;
        core.rotation.y += 0.008;
      };
      break;
    }
  }
}
