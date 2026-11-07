import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  U25RPHU02_20_SIMULATIONS,
  type PhysicsSimulationMetadata,
} from './PhysicsDataStorageSimData';
import {
  Maximize2,
  Minimize2,
  Compass,
  BookOpen,
  Award,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Sliders,
  Eye,
} from 'lucide-react';

export interface PhysicsDataStorage3DViewProps {
  simId: string;
  onClose?: () => void;
  standalone?: boolean;
  showHeader?: boolean;
  showSidebar?: boolean;
  theme?: 'dark' | 'light';
  params?: Record<string, any>;
  onParamChange?: (key: string, value: any) => void;
}

export const PhysicsDataStorage3DView: React.FC<PhysicsDataStorage3DViewProps> = ({
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
  const meta: PhysicsSimulationMetadata = useMemo(() => {
    const found = U25RPHU02_20_SIMULATIONS.find((s) => s.id === simId);
    return found || U25RPHU02_20_SIMULATIONS[0]!;
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

  // Challenge tasks state
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});

  // Assessment Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // 3D Scene Controls
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [is2DMode, setIs2DMode] = useState(false);

  // DOM Mount references
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic mesh references for simulation animation
  const animMeshRef = useRef<Record<string, any>>({});

  // Reset Camera Helper
  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 8, 16);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // THREE.JS SCENE SETUP & ANIMATION LOOP
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const container = mountRef.current;
    if (!container || is2DMode) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 200),
      0.1,
      1000
    );
    camera.position.set(0, 8, 16);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.5, 30);
    pointLight.position.set(-10, 5, -5);
    scene.add(pointLight);

    // 6. Ground Grid & Pedestal
    const gridHelper = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 7. Build Specific 3D World for Simulation
    animMeshRef.current = {};
    buildSimulationScene(meta.id, scene, animMeshRef.current, params);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      if (autoRotate && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 1.5;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }
      controls.update();

      // Update custom simulation animations
      if (animMeshRef.current.update) {
        animMeshRef.current.update(dt, time, params);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / Math.max(h, 200);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [meta.id, is2DMode]);

  // Re-run param updates in active 3D scene
  useEffect(() => {
    if (animMeshRef.current.onParamsChange) {
      animMeshRef.current.onParamsChange(params);
    }
  }, [params]);

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full w-full select-none overflow-hidden bg-slate-950 text-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-[9999]' : 'rounded-2xl border border-slate-800 shadow-2xl'
      }`}
    >
      {/* ── TOP HEADER BAR ── */}
      {showHeader && (
        <header className="flex-shrink-0 z-20 flex items-center justify-between px-4 py-2.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
          {/* Left: Icon, Unit badge, Title */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-xl shadow-xs">
              {meta.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Unit {meta.unit} · {meta.unitTitle}
                </span>
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-100 truncate">
                  {meta.title}
                </h1>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 truncate hidden sm:block">
                Course Code: U25RPHU02 · {meta.topic}
              </p>
            </div>
          </div>

          {/* Right: Mode Toggles, Camera & Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 3D vs 2D Diagram Fallback Switcher */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setIs2DMode(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !is2DMode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎮 3D World
              </button>
              <button
                type="button"
                onClick={() => setIs2DMode(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  is2DMode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎨 2D Model
              </button>
            </div>

            {/* Reset Camera */}
            {!is2DMode && (
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
            {!is2DMode && (
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

      {/* ── MAIN WORKSPACE: 3D VIEWPORT (LEFT/CENTER) + CONTROL DOCK (RIGHT) ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: 3D Canvas / 2D Diagram Area */}
        <div className="flex-1 flex flex-col relative h-full min-h-[300px]">
          {is2DMode ? (
            <div className="flex-1 w-full h-full flex items-center justify-center bg-slate-900 p-6 text-center">
              <div className="max-w-md p-6 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-4">
                <div className="text-4xl">{meta.icon}</div>
                <h3 className="text-lg font-bold text-slate-100">{meta.title} (2D Conceptual Blueprint)</h3>
                <div className="p-4 rounded-xl bg-slate-950/80 font-mono text-xs text-indigo-300 border border-indigo-900/50 text-left overflow-x-auto">
                  {meta.formulaOverview}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed text-left">
                  {meta.shortDescription}
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIs2DMode(false)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>🎮 Launch Interactive 3D World</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div ref={mountRef} className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing touch-none" />
          )}

          {/* Floating Scientific HUD Overlay */}
          <div className="absolute top-3 left-3 pointer-events-none z-10 flex flex-wrap gap-2 max-w-[80%]">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-md text-xs font-mono text-slate-300 pointer-events-auto">
              <span className="text-indigo-400 font-bold mr-1.5">FORMULA:</span>
              <span>{meta.formulaOverview.split(',')[0]}</span>
            </div>
          </div>

          {/* Bottom Floating Viewport Controls (accessible in embedded mode) */}
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-center justify-between z-10">
            <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg">
              <Sparkles className="size-3.5 text-indigo-400" />
              <span>{!is2DMode ? '3D Interactive World · Drag to rotate, scroll to zoom' : '2D Scientific Blueprint'}</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-lg">
              <button
                type="button"
                onClick={() => setIs2DMode(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !is2DMode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎮 3D World
              </button>
              <button
                type="button"
                onClick={() => setIs2DMode(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  is2DMode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎨 2D Model
              </button>
              {!is2DMode && (
                <button
                  type="button"
                  onClick={resetCamera}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer"
                  title="Reset 3D Camera View"
                >
                  <Compass className="size-3.5" />
                </button>
              )}
              {!is2DMode && (
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

        {/* Right: Tabbed Learning & Parametric Control Sidebar */}
        {showSidebar && (
        <aside className="w-full lg:w-96 flex flex-col flex-shrink-0 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
            {/* ── TAB 1: EXPLORE (PARAMETERS & READOUTS) ── */}
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

                {/* Dynamic Parameter Sliders & Controls */}
                {renderParamControls(meta.id, params, updateParam)}

                {/* Live Real-World Readings */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Live System Measurements
                  </div>
                  {renderLiveMetrics(meta.id, params)}
                </div>
              </div>
            )}

            {/* ── TAB 2: GUIDED WALKTHROUGH ── */}
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
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentGuideStep === meta.guidedSteps.length - 1}
                    onClick={() => setCurrentGuideStep((s) => Math.min(meta.guidedSteps.length - 1, s + 1))}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 3: CHALLENGE TASKS ── */}
            {activeTab === 'challenges' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Curriculum Challenges
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {Object.values(completedChallenges).filter(Boolean).length} / {meta.challenges.length} Done
                  </span>
                </div>

                {meta.challenges.map((c, idx) => {
                  const isDone = Boolean(completedChallenges[c.id]);
                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-950/30 border-emerald-800/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                          <span>#{idx + 1}</span>
                          <span>{c.title}</span>
                        </h4>
                        {isDone && <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-slate-400 text-[11px] mb-2 leading-relaxed">{c.goal}</p>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[10px] text-amber-300 mb-2.5">
                        💡 <strong>Hint:</strong> {c.hint}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCompletedChallenges((prev) => ({
                            ...prev,
                            [c.id]: !prev[c.id],
                          }))
                        }
                        className={`w-full py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                          isDone
                            ? 'bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50'
                            : 'bg-indigo-600/80 hover:bg-indigo-600 text-white'
                        }`}
                      >
                        {isDone ? '✓ Completed (Tap to reset)' : 'Verify Challenge Completed'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── TAB 4: 5-ITEM ASSESSMENT QUIZ ── */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Concept Assessment (5 Items)
                  </span>
                  {showQuizResults && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAnswers({});
                        setShowQuizResults(false);
                      }}
                      className="text-[11px] text-indigo-400 font-semibold cursor-pointer"
                    >
                      Retry Quiz ↺
                    </button>
                  )}
                </div>

                {meta.assessments.map((q, qIdx) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correctIndex;

                  return (
                    <div key={q.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                        <span>Q{qIdx + 1}</span>
                        <span>·</span>
                        <span className="capitalize">{q.type}</span>
                      </div>
                      <p className="font-bold text-slate-200 text-xs leading-relaxed">{q.question}</p>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAns === optIdx;
                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                          if (showQuizResults) {
                            if (optIdx === q.correctIndex) {
                              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-indigo-900/60 border-indigo-500 text-white font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                if (!showQuizResults) {
                                  setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                }
                              }}
                              className={`w-full text-left p-2 rounded-lg border text-[11px] transition cursor-pointer ${btnStyle}`}
                            >
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
                      Great effort! Review the explanations above to solidify your quantum &amp; physical principles.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: THEORY & MODEL ASSUMPTIONS ── */}
            {activeTab === 'theory' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Scientific Model &amp; Theory
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400 text-xs">Governing Equations</h4>
                  <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-emerald-300 border border-slate-800 overflow-x-auto">
                    {meta.formulaOverview}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400 text-xs">Model Assumptions &amp; Scope</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px]">
                    {meta.modelAssumptions.map((asm, i) => (
                      <li key={i}>{asm}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400 text-xs">Learning Objectives</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px]">
                    {meta.learningObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                  <div><strong>Course Code:</strong> U25RPHU02 · R2025 CBCS</div>
                  <div><strong>Prerequisites:</strong> {meta.prerequisites.join(', ')}</div>
                  <div><strong>Estimated Time:</strong> {meta.estimatedTimeMinutes} minutes</div>
                </div>
              </div>
            )}
          </div>
        </aside>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   3D SCENE BUILDERS FOR ALL 20 SIMULATIONS (Three.js WebGL)
   ───────────────────────────────────────────────────────────────────────────── */

function buildSimulationScene(
  simId: string,
  scene: THREE.Scene,
  animRef: Record<string, any>,
  _initialParams: Record<string, any>
) {
  // Clear scene children except lights & ground
  const toRemove: THREE.Object3D[] = [];
  scene.traverse((obj) => {
    if (obj !== scene && !(obj as any).isLight && !(obj instanceof THREE.GridHelper)) {
      toRemove.push(obj);
    }
  });
  toRemove.forEach((obj) => scene.remove(obj));

  switch (simId) {
    // ═════════════════════════════════════════════════════════════════════════
    // UNIT I
    // ═════════════════════════════════════════════════════════════════════════
    case 'u25rphu02-optical-materials': {
      // 1. Optical Bench Base
      const benchGeo = new THREE.BoxGeometry(16, 0.4, 4);
      const benchMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(0, 0, 0);
      scene.add(bench);

      // Laser Source
      const laserBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      laserBox.position.set(-6, 0.8, 0);
      scene.add(laserBox);

      // Optical Material Slab
      const slabGeo = new THREE.BoxGeometry(1.2, 3, 2.5);
      const slabMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1,
        transmission: 0.8,
        ior: 1.5,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(0, 1.7, 0);
      scene.add(slab);

      // Detector Box
      const detBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 1.2), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      detBox.position.set(6, 1.0, 0);
      scene.add(detBox);

      // Laser Beam Line
      const beamPoints = [new THREE.Vector3(-5.2, 0.8, 0), new THREE.Vector3(-0.6, 0.8, 0), new THREE.Vector3(5.4, 0.8, 0)];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(beamPoints);
      const beamMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 3 });
      const beamLine = new THREE.Line(beamGeo, beamMat);
      scene.add(beamLine);

      animRef.update = (_dt: number, time: number, p: Record<string, any>) => {
        slab.rotation.y = Math.sin(time * 0.5) * 0.05;
        // Adjust beam color by wavelength
        const wl = p.wavelength || 550;
        const col = wavelengthToRGB(wl);
        beamMat.color.setRGB(col.r, col.g, col.b);
      };
      break;
    }

    case 'u25rphu02-photodiode': {
      // 2. Semiconductor Cutaway (p-type, depletion, n-type)
      const pRegion = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 }));
      pRegion.position.set(-2, 1, 0);
      scene.add(pRegion);

      const depletion = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 3), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 }));
      depletion.position.set(0, 1, 0);
      scene.add(depletion);

      const nRegion = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 }));
      nRegion.position.set(2, 1, 0);
      scene.add(nRegion);

      // Carriers (particles)
      const carrierGroup = new THREE.Group();
      for (let i = 0; i < 15; i++) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: 0x60a5fa }));
        e.position.set((Math.random() - 0.5) * 1.0, 0.5 + Math.random(), (Math.random() - 0.5) * 2.5);
        carrierGroup.add(e);
      }
      scene.add(carrierGroup);

      animRef.update = (_dt: number, _time: number) => {
        carrierGroup.children.forEach((c) => {
          c.position.x += 0.04;
          if (c.position.x > 2.5) c.position.x = -0.5;
        });
      };
      break;
    }

    case 'u25rphu02-solar-cell': {
      // 3. Layered Solar Cell Panel
      const baseSub = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      baseSub.position.y = 0.15;
      scene.add(baseSub);

      const pLayer = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.5, 5.8), new THREE.MeshStandardMaterial({ color: 0x0369a1 }));
      pLayer.position.y = 0.55;
      scene.add(pLayer);

      const arcGrid = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.05, 5.8), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 }));
      arcGrid.position.y = 0.85;
      scene.add(arcGrid);

      // Grid fingers
      for (let i = -2.5; i <= 2.5; i += 0.8) {
        const finger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 5.8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
        finger.position.set(i, 0.9, 0);
        scene.add(finger);
      }

      // Sun source
      const sun = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
      sun.position.set(0, 7, 0);
      scene.add(sun);

      animRef.update = (_dt: number, _time: number, p: Record<string, any>) => {
        const irr = p.irradiance || 1000;
        sun.scale.setScalar(0.7 + (irr / 1000) * 0.5);
      };
      break;
    }

    case 'u25rphu02-bluray': {
      // 4. Optical Disc (Blu-ray Platter with central hole)
      const discGeo = new THREE.CylinderGeometry(5, 5, 0.1, 48);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.15,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(0, 0.5, 0);
      scene.add(disc);

      // Laser pickup head
      const pickup = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 2.0), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      pickup.position.set(2.8, 1.2, 0);
      scene.add(pickup);

      // Blue laser beam
      const laserBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 0.8, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      laserBeam.position.set(2.8, 0.8, 0);
      scene.add(laserBeam);

      animRef.update = (_dt: number, _time: number) => {
        disc.rotation.y += 0.03;
      };
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // UNIT II
    // ═════════════════════════════════════════════════════════════════════════
    case 'u25rphu02-ferromagnetism': {
      // 5. Magnetic Domains & Spin Vectors
      const group = new THREE.Group();
      const domainSize = 1.2;
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(Math.cos(x + z), 0, Math.sin(x - z)).normalize(),
            new THREE.Vector3(x * domainSize, 1.0, z * domainSize),
            0.9,
            0xf59e0b,
            0.3,
            0.2
          );
          group.add(arrow);
        }
      }
      scene.add(group);

      animRef.update = (_dt: number, _time: number, p: Record<string, any>) => {
        const field = p.magneticField || 0;
        const alignRatio = Math.tanh(field / 500);
        group.children.forEach((arr: any, idx) => {
          const baseVec = new THREE.Vector3(0, 0, 1);
          const randVec = new THREE.Vector3(Math.cos(idx), 0, Math.sin(idx));
          const target = new THREE.Vector3().lerpVectors(randVec, baseVec, Math.abs(alignRatio)).normalize();
          if (field < 0) target.negate();
          arr.setDirection(target);
        });
      };
      break;
    }

    case 'u25rphu02-hysteresis': {
      // 6. Electromagnet core toroid with coils
      const toroid = new THREE.Mesh(new THREE.TorusGeometry(3, 0.8, 16, 36), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 }));
      toroid.rotation.x = Math.PI / 2;
      toroid.position.y = 1.5;
      scene.add(toroid);

      // Display screen
      const screen = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.2), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      screen.position.set(0, 4, -4);
      scene.add(screen);

      animRef.update = (_dt: number, _time: number) => {
        toroid.rotation.z += 0.005;
      };
      break;
    }

    case 'u25rphu02-magnetic-memory': {
      // 7. HDD Platter & Flying Read/Write Slider
      const platter = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.15, 48), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 }));
      platter.position.set(0, 0.4, 0);
      scene.add(platter);

      const slider = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.8), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
      slider.position.set(3, 1.0, 0);
      scene.add(slider);

      animRef.update = (_dt: number) => {
        platter.rotation.y += 0.04;
      };
      break;
    }

    case 'u25rphu02-gmr': {
      // 8. GMR Spin Valve Stack (Pinned Layer, Spacer, Free Layer)
      const pinned = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 3), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
      pinned.position.set(0, 0.5, 0);
      scene.add(pinned);

      const spacer = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 3), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
      spacer.position.set(0, 0.8, 0);
      scene.add(spacer);

      const freeLayer = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 3), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      freeLayer.position.set(0, 1.1, 0);
      scene.add(freeLayer);

      animRef.update = (_dt: number, _time: number, p: Record<string, any>) => {
        const ang = ((p.sensorAngle || 0) * Math.PI) / 180;
        freeLayer.rotation.y = ang;
      };
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // UNIT III
    // ═════════════════════════════════════════════════════════════════════════
    case 'u25rphu02-quantum-confinement': {
      // 9. Quantum Box / Well / Wire / Dot Builder
      const boxGeo = new THREE.BoxGeometry(4, 3, 2);
      const boxMat = new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.5, wireframe: false });
      const qbox = new THREE.Mesh(boxGeo, boxMat);
      qbox.position.set(0, 2, 0);
      scene.add(qbox);

      // Wireframe overlay
      const wire = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), new THREE.LineBasicMaterial({ color: 0xc4b5fd }));
      qbox.add(wire);

      animRef.update = (_dt: number, _time: number, p: Record<string, any>) => {
        const lx = (p.lx || 20) / 5;
        const ly = (p.ly || 20) / 5;
        const lz = (p.lz || 6) / 5;
        qbox.scale.set(lx / 4, ly / 3, lz / 2);
      };
      break;
    }

    case 'u25rphu02-nano-bandgap': {
      // 10. Quantum Dots with Luminescent Glow
      const dotsGroup = new THREE.Group();
      const dotSizes = [0.4, 0.7, 1.0, 1.3, 1.6];
      const colors = [0x3b82f6, 0x10b981, 0xfbbf24, 0xf97316, 0xef4444];

      dotSizes.forEach((sz, idx) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(sz, 24, 24), new THREE.MeshStandardMaterial({ color: colors[idx], roughness: 0.2, emissive: colors[idx], emissiveIntensity: 0.6 }));
        m.position.set((idx - 2) * 2.5, sz, 0);
        dotsGroup.add(m);
      });
      scene.add(dotsGroup);

      animRef.update = (_dt: number, time: number) => {
        dotsGroup.rotation.y = Math.sin(time * 0.3) * 0.2;
      };
      break;
    }

    case 'u25rphu02-tunnelling': {
      // 11. Potential Barrier with Wavepacket
      const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.5, 3), new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.7 }));
      barrier.position.set(0, 1.75, 0);
      scene.add(barrier);

      // Wavepacket spheres
      const packetGroup = new THREE.Group();
      for (let i = 0; i < 20; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        packetGroup.add(b);
      }
      scene.add(packetGroup);

      animRef.update = (_dt: number, time: number) => {
        const tCycle = (time * 2) % 6 - 3;
        packetGroup.children.forEach((c, idx) => {
          c.position.set(tCycle + (idx - 10) * 0.08, 1.5 + Math.sin(idx + time * 5) * 0.3, 0);
        });
      };
      break;
    }

    case 'u25rphu02-set-rtd': {
      // 12. SET Island & Tunnel Barriers
      const source = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), new THREE.MeshStandardMaterial({ color: 0x64748b }));
      source.position.set(-3, 1, 0);
      scene.add(source);

      const island = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 24), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
      island.position.set(0, 1, 0);
      scene.add(island);

      const drain = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), new THREE.MeshStandardMaterial({ color: 0x64748b }));
      drain.position.set(3, 1, 0);
      scene.add(drain);

      // Gate probe
      const gate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
      gate.position.set(0, 3, 0);
      scene.add(gate);

      animRef.update = (_dt: number, time: number) => {
        island.position.y = 1 + Math.sin(time * 3) * 0.05;
      };
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // UNIT IV
    // ═════════════════════════════════════════════════════════════════════════
    case 'u25rphu02-bloch-sphere': {
      // 13. High-resolution 3D Bloch Sphere with Vector Arrow
      const sphereGeo = new THREE.SphereGeometry(3.5, 32, 32);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(0, 4, 0);
      scene.add(sphere);

      // Coordinate axes (X, Y, Z)
      const axesHelper = new THREE.AxesHelper(4.5);
      axesHelper.position.set(0, 4, 0);
      scene.add(axesHelper);

      // State vector arrow
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 4, 0), 3.5, 0xfbbf24, 0.6, 0.3);
      scene.add(arrow);
      animRef.arrow = arrow;

      animRef.update = (_dt: number, _time: number, p: Record<string, any>) => {
        const theta = ((p.theta || 90) * Math.PI) / 180;
        const phi = ((p.phi || 0) * Math.PI) / 180;
        const dir = new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi),
          Math.cos(theta),
          Math.sin(theta) * Math.sin(phi)
        );
        arrow.setDirection(dir);
      };
      break;
    }

    case 'u25rphu02-superposition-measurement': {
      // 14. Superposition Stern-Gerlach Measurement Apparatus
      const apparatus = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 3, 24), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      apparatus.rotation.z = Math.PI / 2;
      apparatus.position.set(-2, 2, 0);
      scene.add(apparatus);

      // Detectors (0 on top, 1 on bottom)
      const det0 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
      det0.position.set(3, 3, 0);
      scene.add(det0);

      const det1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      det1.position.set(3, 1, 0);
      scene.add(det1);

      animRef.update = (_dt: number, time: number) => {
        det0.scale.setScalar(1 + Math.sin(time * 4) * 0.05);
      };
      break;
    }

    case 'u25rphu02-entanglement': {
      // 15. Linked Two-Qubit Nodes with Entanglement Beam
      const q1 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 24), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      q1.position.set(-3.5, 3, 0);
      scene.add(q1);

      const q2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 24), new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
      q2.position.set(3.5, 3, 0);
      scene.add(q2);

      // Entanglement link cylinder
      const link = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 7, 16), new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.8 }));
      link.rotation.z = Math.PI / 2;
      link.position.set(0, 3, 0);
      scene.add(link);

      animRef.update = (_dt: number, time: number) => {
        link.scale.set(1, 1 + Math.sin(time * 6) * 0.1, 1);
        q1.position.y = 3 + Math.sin(time * 2) * 0.2;
        q2.position.y = 3 - Math.sin(time * 2) * 0.2;
      };
      break;
    }

    case 'u25rphu02-classical-vs-quantum': {
      // 16. Architecture: CMOS Transistor array vs Cryogenic Stage
      const cmosBoard = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 5), new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
      cmosBoard.position.set(-4, 0.5, 0);
      scene.add(cmosBoard);

      const cryoStage = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 }));
      cryoStage.position.set(4, 0.5, 0);
      scene.add(cryoStage);

      animRef.update = (_dt: number, _time: number) => {
        cryoStage.rotation.y += 0.01;
      };
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // UNIT V
    // ═════════════════════════════════════════════════════════════════════════
    case 'u25rphu02-pauli-gates': {
      // 17. Quantum Gate Bloch Sphere
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(3.5, 24, 24), new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.4 }));
      sphere.position.set(0, 4, 0);
      scene.add(sphere);

      const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 4, 0), 3.5, 0x10b981, 0.5, 0.25);
      scene.add(arrow);

      animRef.update = (_dt: number, _time: number) => {
        // Continuous gentle rotation
        sphere.rotation.y += 0.005;
      };
      break;
    }

    case 'u25rphu02-circuit-builder': {
      // 18. Quantum Circuit Wires in 3D
      const wire1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 12, 16), new THREE.MeshBasicMaterial({ color: 0x64748b }));
      wire1.rotation.z = Math.PI / 2;
      wire1.position.set(0, 3.5, 0);
      scene.add(wire1);

      const wire2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 12, 16), new THREE.MeshBasicMaterial({ color: 0x64748b }));
      wire2.rotation.z = Math.PI / 2;
      wire2.position.set(0, 1.5, 0);
      scene.add(wire2);

      // Gate block on wire
      const gateTile = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.4), new THREE.MeshStandardMaterial({ color: 0x6366f1 }));
      gateTile.position.set(-1.5, 3.5, 0);
      scene.add(gateTile);

      animRef.update = (_dt: number, time: number) => {
        gateTile.rotation.y = Math.sin(time * 2) * 0.1;
      };
      break;
    }

    case 'u25rphu02-hadamard-interference': {
      // 19. Mach-Zehnder Interferometer Dual Path
      const beamSplitter1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 2), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 }));
      beamSplitter1.position.set(-4, 2, 0);
      beamSplitter1.rotation.y = Math.PI / 4;
      scene.add(beamSplitter1);

      const beamSplitter2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 2), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 }));
      beamSplitter2.position.set(4, 2, 0);
      beamSplitter2.rotation.y = Math.PI / 4;
      scene.add(beamSplitter2);

      animRef.update = (_dt: number, time: number) => {
        beamSplitter1.rotation.z = Math.sin(time) * 0.05;
      };
      break;
    }

    case 'u25rphu02-cnot-circuit': {
      // 20. CNOT Control dot and Target cross
      const ctrlDot = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
      ctrlDot.position.set(0, 3.5, 0);
      scene.add(ctrlDot);

      const vertLine = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 16), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      vertLine.position.set(0, 2.5, 0);
      scene.add(vertLine);

      const targetCircle = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 16, 32), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
      targetCircle.position.set(0, 1.5, 0);
      scene.add(targetCircle);

      animRef.update = (_dt: number, time: number) => {
        ctrlDot.scale.setScalar(1 + Math.sin(time * 4) * 0.08);
      };
      break;
    }

    default:
      break;
  }
}

// Wavelength to RGB helper
function wavelengthToRGB(wavelength: number): { r: number; g: number; b: number } {
  let r = 0, g = 0, b = 0;
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1.0;
  } else {
    r = 0.5;
  }
  return { r, g, b };
}

/* ─────────────────────────────────────────────────────────────────────────────
   PARAMETER CONTROL RENDERER PER SIMULATION
   ───────────────────────────────────────────────────────────────────────────── */

function renderParamControls(
  simId: string,
  params: Record<string, any>,
  updateParam: (k: string, v: any) => void
) {
  switch (simId) {
    case 'u25rphu02-optical-materials':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Material Class</label>
            <select
              value={params.material || 'semiconductor'}
              onChange={(e) => updateParam('material', e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold"
            >
              <option value="dielectric">Transparent Dielectric (SiO₂ Glass)</option>
              <option value="semiconductor">Direct Gap Semiconductor (GaAs)</option>
              <option value="metal">Reflective Conductor (Gold / Al)</option>
            </select>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Wavelength (λ)</span>
              <span className="text-indigo-400 font-mono">{params.wavelength || 550} nm</span>
            </div>
            <input
              type="range"
              min="380"
              max="900"
              step="10"
              value={params.wavelength || 550}
              onChange={(e) => updateParam('wavelength', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Sample Thickness (d)</span>
              <span className="text-indigo-400 font-mono">{params.thickness || 50} µm</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={params.thickness || 50}
              onChange={(e) => updateParam('thickness', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      );

    case 'u25rphu02-photodiode':
      return (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Reverse Bias (V_R)</span>
              <span className="text-indigo-400 font-mono">{params.bias || -3} V</span>
            </div>
            <input
              type="range"
              min="-10"
              max="0"
              step="0.5"
              value={params.bias || -3}
              onChange={(e) => updateParam('bias', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Optical Intensity (P_opt)</span>
              <span className="text-indigo-400 font-mono">{params.intensity || 40} mW</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.intensity || 40}
              onChange={(e) => updateParam('intensity', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      );

    case 'u25rphu02-solar-cell':
      return (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Solar Irradiance (G)</span>
              <span className="text-indigo-400 font-mono">{params.irradiance || 1000} W/m²</span>
            </div>
            <input
              type="range"
              min="200"
              max="1200"
              step="50"
              value={params.irradiance || 1000}
              onChange={(e) => updateParam('irradiance', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Load Resistance (R_L)</span>
              <span className="text-indigo-400 font-mono">{params.loadResistance || 8.5} Ω</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={params.loadResistance || 8.5}
              onChange={(e) => updateParam('loadResistance', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      );

    case 'u25rphu02-bluray':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Disc Format Preset</label>
            <select
              value={params.format || 'bluray'}
              onChange={(e) => updateParam('format', e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold"
            >
              <option value="cd">CD (780 nm · NA 0.45 · Pitch 1.6 µm)</option>
              <option value="dvd">DVD (650 nm · NA 0.60 · Pitch 0.74 µm)</option>
              <option value="bluray">Blu-ray (405 nm · NA 0.85 · Pitch 0.32 µm)</option>
            </select>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Rotation Speed</span>
              <span className="text-indigo-400 font-mono">{params.rotationSpeed || 1}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={params.rotationSpeed || 1}
              onChange={(e) => updateParam('rotationSpeed', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      );

    case 'u25rphu02-ferromagnetism':
      return (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>External Magnetic Field (H)</span>
              <span className="text-indigo-400 font-mono">{params.magneticField || 0} Oe</span>
            </div>
            <input
              type="range"
              min="-2000"
              max="2000"
              step="50"
              value={params.magneticField || 0}
              onChange={(e) => updateParam('magneticField', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Temperature (T)</span>
              <span className="text-indigo-400 font-mono">{params.temperature || 300} K</span>
            </div>
            <input
              type="range"
              min="100"
              max="1200"
              step="25"
              value={params.temperature || 300}
              onChange={(e) => updateParam('temperature', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      );

    case 'u25rphu02-bloch-sphere':
      return (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Polar Angle (θ)</span>
              <span className="text-indigo-400 font-mono">{params.theta || 90}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={params.theta || 90}
              onChange={(e) => updateParam('theta', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>Azimuthal Angle (φ)</span>
              <span className="text-indigo-400 font-mono">{params.phi || 0}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={params.phi || 0}
              onChange={(e) => updateParam('phi', Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div className="flex gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                updateParam('theta', 0);
                updateParam('phi', 0);
              }}
              className="flex-1 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-200 cursor-pointer"
            >
              |0⟩
            </button>
            <button
              type="button"
              onClick={() => {
                updateParam('theta', 180);
                updateParam('phi', 0);
              }}
              className="flex-1 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-200 cursor-pointer"
            >
              |1⟩
            </button>
            <button
              type="button"
              onClick={() => {
                updateParam('theta', 90);
                updateParam('phi', 0);
              }}
              className="flex-1 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-200 cursor-pointer"
            >
              |+⟩
            </button>
            <button
              type="button"
              onClick={() => {
                updateParam('theta', 90);
                updateParam('phi', 180);
              }}
              className="flex-1 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-200 cursor-pointer"
            >
              |-⟩
            </button>
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-3">
          <p className="text-slate-400 text-xs">
            Simulation parameters are active. Use interactive 3D rotation, zooming, and guided mode to explore.
          </p>
        </div>
      );
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   LIVE METRICS RENDERER PER SIMULATION
   ───────────────────────────────────────────────────────────────────────────── */

function renderLiveMetrics(simId: string, params: Record<string, any>) {
  switch (simId) {
    case 'u25rphu02-optical-materials': {
      const mat = params.material || 'semiconductor';
      const T = mat === 'dielectric' ? '92.4%' : mat === 'metal' ? '0.2%' : '48.6%';
      const R = mat === 'dielectric' ? '4.1%' : mat === 'metal' ? '94.8%' : '31.2%';
      const A = mat === 'dielectric' ? '3.5%' : mat === 'metal' ? '5.0%' : '20.2%';
      return (
        <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
          <div>
            <div className="text-slate-400 text-[9px]">Transmittance</div>
            <div className="font-bold text-emerald-400">{T}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[9px]">Reflectance</div>
            <div className="font-bold text-amber-400">{R}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[9px]">Absorptance</div>
            <div className="font-bold text-sky-400">{A}</div>
          </div>
        </div>
      );
    }

    case 'u25rphu02-photodiode': {
      const pOpt = params.intensity || 40;
      const iPh = (pOpt * 0.55).toFixed(1);
      const wDep = (Math.sqrt(Math.abs(params.bias || -3) + 0.8) * 0.45).toFixed(2);
      return (
        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div>
            <div className="text-slate-400 text-[9px]">Photocurrent (I_ph)</div>
            <div className="font-bold text-emerald-400">{iPh} mA</div>
          </div>
          <div>
            <div className="text-slate-400 text-[9px]">Depletion Width (W)</div>
            <div className="font-bold text-sky-400">{wDep} µm</div>
          </div>
        </div>
      );
    }

    case 'u25rphu02-solar-cell': {
      const g = params.irradiance || 1000;
      const r = params.loadResistance || 8.5;
      const v = (0.58 * (g / 1000) * (r / (r + 1.2))).toFixed(2);
      const i = ((Number(v) / r) * 1000).toFixed(0);
      const p = (Number(v) * (Number(i) / 1000)).toFixed(2);
      return (
        <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
          <div>
            <div className="text-slate-400 text-[9px]">Voltage (V)</div>
            <div className="font-bold text-sky-400">{v} V</div>
          </div>
          <div>
            <div className="text-slate-400 text-[9px]">Current (I)</div>
            <div className="font-bold text-emerald-400">{i} mA</div>
          </div>
          <div>
            <div className="text-slate-400 text-[9px]">Power (P)</div>
            <div className="font-bold text-amber-400">{p} W</div>
          </div>
        </div>
      );
    }

    case 'u25rphu02-bloch-sphere': {
      const theta = ((params.theta || 90) * Math.PI) / 180;
      const p0 = (Math.cos(theta / 2) ** 2 * 100).toFixed(1);
      const p1 = (Math.sin(theta / 2) ** 2 * 100).toFixed(1);
      return (
        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div>
            <div className="text-slate-400 text-[9px]">P(|0⟩) Probability</div>
            <div className="font-bold text-emerald-400">{p0}%</div>
          </div>
          <div>
            <div className="text-slate-400 text-[9px]">P(|1⟩) Probability</div>
            <div className="font-bold text-indigo-400">{p1}%</div>
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="font-mono text-[11px] text-slate-300">
          Status: Operational · Deterministic Model Active
        </div>
      );
  }
}
