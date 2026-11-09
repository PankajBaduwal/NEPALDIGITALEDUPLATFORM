/**
 * BigSmallWorld.tsx
 * Simulation 02: Big and Small World (ठूलो र सानो संसार)
 * Grade 1 • Mathematics • Chapter 1 (आकारप्रकार र स्थान - Shapes & Position)
 * CDC Nepal Curriculum Aligned
 * Master 3D Size Comparison Playground
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sun,
  Moon,
  Trophy,
  Maximize2,
  Minimize2,
  Eye,
  Sliders,
  Layers,
  Scale,
} from 'lucide-react';
import {
  createComparisonStudio,
  ComparisonStudio,
  createBigSmallObject,
} from './BigSmallModels';
import {
  MODE_1_PAIRS,
  MODE_2_SETS,
  MODE_3_TASKS,
  DISCOVERY_CATALOG,
  CHALLENGE_QUESTIONS,
  ComparisonItem,
  Mode1Pair,
  Mode2Set,
  Mode3OrderingTask,
} from './BigSmallLevels';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';

interface BigSmallWorldProps {
  onBackToLibrary: () => void;
  userRole?: string;
  initialLanguage?: 'ne' | 'en';
}

type SimulationMode = 'MODE_1' | 'MODE_2' | 'MODE_3' | 'MODE_4' | 'MODE_5';

export const BigSmallWorld: React.FC<BigSmallWorldProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // ── APP & SIMULATION STATE ────────────────────────────────────
  const [lang, setLang] = useState<'ne' | 'en'>(initialLanguage);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<SimulationMode>('MODE_1');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [stageLayout, setStageLayout] = useState<'split' | 'full'>('split');

  // Mode 1 State (Big or Small?)
  const [mode1Idx, setMode1Idx] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);

  // Mode 2 State (Biggest and Smallest)
  const [mode2Idx, setMode2Idx] = useState<number>(0);
  const [selectedMode2Idx, setSelectedMode2Idx] = useState<number | null>(null);

  // Mode 3 State (Arrange by Size)
  const [mode3Idx, setMode3Idx] = useState<number>(0);
  const [placedSlots, setPlacedSlots] = useState<[string | null, string | null, string | null]>([null, null, null]);
  const [isOrderComplete, setIsOrderComplete] = useState<boolean>(false);

  // Mode 4 State (Size Discovery Lab)
  const [labCategory, setLabCategory] = useState<'animals' | 'fruits' | 'traditional' | 'toys'>('animals');
  const [labLeftItem, setLabLeftItem] = useState<string>('elephant');
  const [labRightItem, setLabRightItem] = useState<string>('mouse');
  const [labScaleMultiplier, setLabScaleMultiplier] = useState<number>(1.0);

  // Mode 5 State (Challenge Quiz)
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  // Shared Feedback Alert
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // ── THREE.JS ENGINE REFS ──────────────────────────────────────
  const threeEngineRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    studio: ComparisonStudio;
    animFrameId: number;
    clock: THREE.Clock;
    activeMeshes: THREE.Group[];
    // Camera orbit controls
    spherical: { radius: number; theta: number; phi: number };
    target: THREE.Vector3;
    isOrbiting: boolean;
    orbitStart: { x: number; y: number };
  } | null>(null);

  // ── INITIALIZE THREE.JS 3D SCENE ─────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf5f7f2, 1.0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Scene & Perspective-Safe Comparison Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f7f2);
    scene.fog = new THREE.FogExp2(0xf5f7f2, 0.015);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const cameraTarget = new THREE.Vector3(0, 1.1, 0);
    const cameraRadius = 14.5;
    const cameraPhi = Math.PI / 2.6; // ~69 degrees (controlled eye-level perspective)
    const cameraTheta = 0;           // Directly facing podiums to eliminate false perspective!

    camera.position.set(
      cameraTarget.x + cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta),
      cameraTarget.y + cameraRadius * Math.cos(cameraPhi),
      cameraTarget.z + cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta)
    );
    camera.lookAt(cameraTarget);

    const studio = createComparisonStudio(scene);
    const clock = new THREE.Clock();

    threeEngineRef.current = {
      renderer,
      scene,
      camera,
      studio,
      animFrameId: 0,
      clock,
      activeMeshes: [],
      spherical: { radius: cameraRadius, theta: cameraTheta, phi: cameraPhi },
      target: cameraTarget,
      isOrbiting: false,
      orbitStart: { x: 0, y: 0 },
    };

    function renderLoop() {
      const delta = clock.getDelta();
      studio.update(delta);
      renderer.render(scene, camera);
      threeEngineRef.current!.animFrameId = requestAnimationFrame(renderLoop);
    }
    threeEngineRef.current.animFrameId = requestAnimationFrame(renderLoop);

    const resizeObserver = new ResizeObserver(() => {
      if (!container || !threeEngineRef.current) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (threeEngineRef.current) {
        cancelAnimationFrame(threeEngineRef.current.animFrameId);
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // ── UPDATE CAMERA SPHERICAL COORDINATES ────────────────────────
  const updateCameraTransform = useCallback(() => {
    if (!threeEngineRef.current) return;
    const { camera, spherical, target } = threeEngineRef.current;
    spherical.radius = Math.max(7, Math.min(spherical.radius, 28));
    spherical.phi = Math.max(0.2, Math.min(spherical.phi, Math.PI / 2 - 0.05));

    camera.position.set(
      target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
      target.y + spherical.radius * Math.cos(spherical.phi),
      target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
    );
    camera.lookAt(target);
  }, []);

  const resetComparisonCamera = () => {
    if (!threeEngineRef.current) return;
    const engine = threeEngineRef.current;
    engine.target.set(0, 1.1, 0);
    engine.spherical.radius = 14.5;
    engine.spherical.phi = Math.PI / 2.6;
    engine.spherical.theta = 0;
    updateCameraTransform();
    AudioController.playClick();
  };

  // ── CLEAR ACTIVE 3D OBJECTS FROM SCENE ────────────────────────
  const clearActiveObjects = useCallback(() => {
    if (!threeEngineRef.current) return;
    const { scene, activeMeshes } = threeEngineRef.current;
    activeMeshes.forEach((mesh) => {
      scene.remove(mesh);
    });
    threeEngineRef.current.activeMeshes = [];
  }, []);

  // ── SPAWN 3D OBJECTS FOR CURRENT MODE ─────────────────────────
  const refresh3DScene = useCallback(() => {
    if (!threeEngineRef.current) return;
    const { scene, studio } = threeEngineRef.current;
    clearActiveObjects();
    setFeedback({ type: null, message: '' });

    // Mode 1: Two-Object Comparison
    if (currentMode === 'MODE_1') {
      studio.podiumLeft.visible = true;
      studio.podiumRight.visible = true;
      studio.podiumCenter.visible = false;
      studio.slot1.visible = false;
      studio.slot2.visible = false;
      studio.slot3.visible = false;

      const pair = MODE_1_PAIRS[mode1Idx] || MODE_1_PAIRS[0];
      const modelA = createBigSmallObject(pair.itemA.id, pair.itemA.scaleFactor);
      modelA.position.set(-2.6, 0.55, 0);
      modelA.userData.choice = 'A';
      scene.add(modelA);

      const modelB = createBigSmallObject(pair.itemB.id, pair.itemB.scaleFactor);
      modelB.position.set(2.6, 0.55, 0);
      modelB.userData.choice = 'B';
      scene.add(modelB);

      threeEngineRef.current.activeMeshes = [modelA, modelB];
      setSelectedChoice(null);

      const qText = lang === 'ne' ? pair.questionNe : pair.questionEn;
      AudioController.speak(qText, lang);
    }
    // Mode 2: Biggest and Smallest (3 Objects)
    else if (currentMode === 'MODE_2') {
      studio.podiumLeft.visible = true;
      studio.podiumRight.visible = true;
      studio.podiumCenter.visible = true;
      studio.podiumCenter.position.set(0, 0, 0);
      studio.slot1.visible = false;
      studio.slot2.visible = false;
      studio.slot3.visible = false;

      const setObj = MODE_2_SETS[mode2Idx] || MODE_2_SETS[0];
      const positions = [-3.2, 0, 3.2];
      const meshes: THREE.Group[] = [];

      setObj.items.forEach((item, idx) => {
        const m = createBigSmallObject(item.id, item.scaleFactor);
        m.position.set(positions[idx], 0.55, 0);
        m.userData.itemIndex = idx;
        scene.add(m);
        meshes.push(m);
      });

      threeEngineRef.current.activeMeshes = meshes;
      setSelectedMode2Idx(null);

      const qText = lang === 'ne' ? setObj.questionNe : setObj.questionEn;
      AudioController.speak(qText, lang);
    }
    // Mode 3: Arrange by Size (3 Ordering Slots)
    else if (currentMode === 'MODE_3') {
      studio.podiumLeft.visible = false;
      studio.podiumRight.visible = false;
      studio.podiumCenter.visible = false;
      studio.slot1.visible = true;
      studio.slot2.visible = true;
      studio.slot3.visible = true;

      const task = MODE_3_TASKS[mode3Idx] || MODE_3_TASKS[0];
      const meshes: THREE.Group[] = [];

      // Place objects in waiting tray in front of slots
      const trayPositions = [-2.8, 0, 2.8];
      task.items.forEach((item, idx) => {
        const m = createBigSmallObject(item.id, item.scaleFactor);
        m.position.set(trayPositions[idx], 0.1, 2.8);
        m.userData.itemId = item.id;
        scene.add(m);
        meshes.push(m);
      });

      threeEngineRef.current.activeMeshes = meshes;
      setPlacedSlots([null, null, null]);
      setIsOrderComplete(false);

      const qText = lang === 'ne' ? task.instructionNe : task.instructionEn;
      AudioController.speak(qText, lang);
    }
    // Mode 4: Size Discovery Lab
    else if (currentMode === 'MODE_4') {
      studio.podiumLeft.visible = true;
      studio.podiumRight.visible = true;
      studio.podiumCenter.visible = false;
      studio.slot1.visible = false;
      studio.slot2.visible = false;
      studio.slot3.visible = false;

      const mLeft = createBigSmallObject(labLeftItem, 1.0);
      mLeft.position.set(-2.6, 0.55, 0);
      scene.add(mLeft);

      const mRight = createBigSmallObject(labRightItem, labScaleMultiplier);
      mRight.position.set(2.6, 0.55, 0);
      scene.add(mRight);

      threeEngineRef.current.activeMeshes = [mLeft, mRight];

      const prompt =
        lang === 'ne'
          ? 'कुनै पनि दुई वस्तु छानेर छेउछाउ राख्नुहोस्, र आकार तुलना गर्नुहोस्!'
          : 'Select any two objects to compare their sizes side by side!';
      AudioController.speak(prompt, lang);
    }
    // Mode 5: Big and Small Challenge
    else if (currentMode === 'MODE_5') {
      studio.podiumLeft.visible = true;
      studio.podiumRight.visible = true;
      studio.podiumCenter.visible = false;
      studio.slot1.visible = false;
      studio.slot2.visible = false;
      studio.slot3.visible = false;

      const m1 = createBigSmallObject('elephant', 1.0);
      m1.position.set(-2.6, 0.55, 0);
      scene.add(m1);

      const m2 = createBigSmallObject('mouse', 1.0);
      m2.position.set(2.6, 0.55, 0);
      scene.add(m2);

      threeEngineRef.current.activeMeshes = [m1, m2];

      const q = CHALLENGE_QUESTIONS[quizIdx];
      if (q) {
        AudioController.speak(lang === 'ne' ? q.questionNe : q.questionEn, lang);
      }
    }
  }, [currentMode, mode1Idx, mode2Idx, mode3Idx, labLeftItem, labRightItem, labScaleMultiplier, quizIdx, lang, clearActiveObjects]);

  // Trigger refresh on mode or index change
  useEffect(() => {
    refresh3DScene();
  }, [refresh3DScene]);

  // ── THEME SWITCHER ────────────────────────────────────────────
  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (threeEngineRef.current) {
      threeEngineRef.current.studio.setTheme(next);
    }
    AudioController.playClick();
  };

  // ── RAYCASTING CLICK / SELECTION HANDLER ───────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!threeEngineRef.current || !mountRef.current) return;
    const engine = threeEngineRef.current;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, engine.camera);

    const hits = raycaster.intersectObjects(engine.activeMeshes, true);
    if (hits.length > 0) {
      // Find top root group with userData
      let rootGroup: THREE.Group | null = null;
      let curr: THREE.Object3D | null = hits[0].object;
      while (curr) {
        if (curr.userData && (curr.userData.choice || curr.userData.itemIndex !== undefined || curr.userData.itemId)) {
          rootGroup = curr as THREE.Group;
          break;
        }
        curr = curr.parent;
      }

      if (rootGroup) {
        // Direct click interaction depending on mode!
        if (currentMode === 'MODE_1') {
          handleMode1Answer(rootGroup.userData.choice);
        } else if (currentMode === 'MODE_2') {
          handleMode2Answer(rootGroup.userData.itemIndex);
        }
        return;
      }
    }

    // Otherwise, start camera orbit
    engine.isOrbiting = true;
    engine.orbitStart = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!threeEngineRef.current) return;
    const engine = threeEngineRef.current;
    if (engine.isOrbiting) {
      const dx = e.clientX - engine.orbitStart.x;
      const dy = e.clientY - engine.orbitStart.y;
      engine.orbitStart = { x: e.clientX, y: e.clientY };

      const rotateSpeed = 0.007;
      engine.spherical.theta -= dx * rotateSpeed;
      engine.spherical.phi -= dy * rotateSpeed;
      updateCameraTransform();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!threeEngineRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    threeEngineRef.current.isOrbiting = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!threeEngineRef.current) return;
    const engine = threeEngineRef.current;
    engine.spherical.radius += e.deltaY * 0.015;
    updateCameraTransform();
  };

  // ── MODE 1 INTERACTION HANDLER ────────────────────────────────
  const handleMode1Answer = (choice: 'A' | 'B') => {
    const pair = MODE_1_PAIRS[mode1Idx];
    setSelectedChoice(choice);

    if (choice === pair.correctChoice) {
      AudioController.playSuccess();
      setFeedback({
        type: 'success',
        message: lang === 'ne' ? pair.explanationNe : pair.explanationEn,
      });

      // Animate jump on chosen 3D mesh
      const m = threeEngineRef.current?.activeMeshes.find((x) => x.userData.choice === choice);
      if (m) {
        m.position.y += 0.35;
        setTimeout(() => {
          m.position.y -= 0.35;
        }, 300);
      }

      setTimeout(() => {
        if (mode1Idx < MODE_1_PAIRS.length - 1) {
          setMode1Idx((prev) => prev + 1);
        } else {
          AudioController.playCelebration();
          setFeedback({
            type: 'success',
            message:
              lang === 'ne'
                ? 'बधाई छ! तपाईंले ठूलो र सानो पहिचान गर्ने सबै अभ्यास पूरा गर्नुभयो! 🌟'
                : 'Congratulations! You mastered all Big or Small comparisons! 🌟',
          });
        }
      }, 1800);
    } else {
      AudioController.playBoop();
      setFeedback({
        type: 'error',
        message:
          lang === 'ne'
            ? 'फेरि विचार गर्नुहोस्! दुवै वस्तुको समग्र आकार तुलना गर्नुहोस्।'
            : 'Think again! Compare their overall physical body size.',
      });
    }
  };

  // ── MODE 2 INTERACTION HANDLER ────────────────────────────────
  const handleMode2Answer = (idx: number) => {
    const setObj = MODE_2_SETS[mode2Idx];
    setSelectedMode2Idx(idx);

    if (idx === setObj.correctIndex) {
      AudioController.playSuccess();
      setFeedback({
        type: 'success',
        message: lang === 'ne' ? setObj.explanationNe : setObj.explanationEn,
      });

      const m = threeEngineRef.current?.activeMeshes[idx];
      if (m) {
        m.position.y += 0.35;
        setTimeout(() => {
          m.position.y -= 0.35;
        }, 300);
      }

      setTimeout(() => {
        if (mode2Idx < MODE_2_SETS.length - 1) {
          setMode2Idx((prev) => prev + 1);
        } else {
          AudioController.playCelebration();
          setFeedback({
            type: 'success',
            message:
              lang === 'ne'
                ? 'उत्कृष्ट! तपाईंले सबैभन्दा ठूलो र सबैभन्दा सानो सफलतापूर्वक सिक्नुभयो! 🌟'
                : 'Outstanding! You have mastered Biggest and Smallest comparisons! 🌟',
          });
        }
      }, 1800);
    } else {
      AudioController.playBoop();
      setFeedback({
        type: 'error',
        message:
          lang === 'ne'
            ? 'फेरि ध्यान दिएर हेर्नुहोस्! कुन वस्तुले सबैभन्दा धेरै वा थोरै ठाउँ ओगट्छ?'
            : 'Look closely! Which object occupies the most or least space?',
      });
    }
  };

  // ── MODE 3 ARRANGE BY SIZE HANDLER ────────────────────────────
  const placeItemInSlot = (slotIdx: number, itemId: string) => {
    if (placedSlots[slotIdx]) return;
    AudioController.playPop();

    const nextSlots: [string | null, string | null, string | null] = [...placedSlots];
    nextSlots[slotIdx] = itemId;
    setPlacedSlots(nextSlots);

    // Animate item to slot in 3D scene
    const slotXPositions = [-3.6, 0, 3.6];
    const m = threeEngineRef.current?.activeMeshes.find((x) => x.userData.itemId === itemId);
    if (m) {
      m.position.set(slotXPositions[slotIdx], 0.55, 0);
    }

    // Check if all 3 slots filled
    if (nextSlots[0] && nextSlots[1] && nextSlots[2]) {
      const task = MODE_3_TASKS[mode3Idx];
      const isCorrect =
        nextSlots[0] === task.expectedOrder[0] &&
        nextSlots[1] === task.expectedOrder[1] &&
        nextSlots[2] === task.expectedOrder[2];

      if (isCorrect) {
        AudioController.playSuccess();
        setIsOrderComplete(true);
        setFeedback({
          type: 'success',
          message: lang === 'ne' ? task.successMessageNe : task.successMessageEn,
        });

        setTimeout(() => {
          if (mode3Idx < MODE_3_TASKS.length - 1) {
            setMode3Idx((prev) => prev + 1);
          } else {
            AudioController.playCelebration();
          }
        }, 2000);
      } else {
        AudioController.playBoop();
        setFeedback({
          type: 'error',
          message:
            lang === 'ne'
              ? 'क्रम मिलेन! कृपया रिसेट थिचेर फेरि प्रयास गर्नुहोस्।'
              : 'Incorrect order! Tap Reset to try arranging again.',
        });
      }
    }
  };

  const resetMode3Order = () => {
    refresh3DScene();
    AudioController.playClick();
  };

  // ── MODE 5 CHALLENGE HANDLER ──────────────────────────────────
  const handleQuizAnswer = (isCorrect: boolean, expNe: string, expEn: string) => {
    const q = CHALLENGE_QUESTIONS[quizIdx];
    if (isCorrect) {
      AudioController.playSuccess();
      setQuizScore((prev) => prev + 1);
      setFeedback({ type: 'success', message: lang === 'ne' ? expNe : expEn });
    } else {
      AudioController.playBoop();
      setFeedback({ type: 'error', message: lang === 'ne' ? expNe : expEn });
    }

    setTimeout(() => {
      if (quizIdx < CHALLENGE_QUESTIONS.length - 1) {
        setQuizIdx((prev) => prev + 1);
      } else {
        setIsQuizFinished(true);
        AudioController.playCelebration();
        saveProgress(quizScore + (isCorrect ? 1 : 0));
      }
    }, 1800);
  };

  const saveProgress = async (finalScore: number) => {
    try {
      const total = CHALLENGE_QUESTIONS.length;
      const pct = Math.round((finalScore / total) * 100);
      await api.post('/simulation-activity/simulations/SIM-MATH-G1-CH1-02/progress', {
        gradeLevel: 1,
        subjectCode: 'MATH',
        chapterNumber: 1,
        simulationTitle: 'Big and Small World',
        completedLevels: [1, 2, 3, 4, 5],
        assessmentScore: finalScore,
        totalQuestions: total,
        percentage: pct,
        timeSpentSeconds: 280,
        conceptsUnderstood: ['Big and Small Identification', 'Biggest and Smallest', 'Size Ordering'],
        isCompleted: pct >= 60,
      });
    } catch (e) {
      console.warn('Progress save notice:', e);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER JSX
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isDarkMode ? '#202b38' : '#f5f7f2',
        color: isDarkMode ? '#f1f5f9' : '#263238',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* ── TOP NAV BAR ─────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          background: isDarkMode ? 'rgba(32, 43, 56, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isDarkMode ? '#293747' : '#e2e8f0',
              color: isDarkMode ? '#f1f5f9' : '#334155',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>{lang === 'ne' ? 'फर्कनुहोस्' : 'Back'}</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🐘🐭</span>
              <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                {lang === 'ne' ? 'ठूलो र सानो संसार (Big & Small World)' : 'Big and Small World – 3D Edition'}
              </h1>
              <span
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                CLASS 1 • CDC NEPAL
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: isDarkMode ? '#b7c4d2' : '#64748b' }}>
              {lang === 'ne'
                ? 'गणित • पाठ १: आकारप्रकार र स्थान (ठूलो र सानो)'
                : 'Mathematics • Chapter 1: Shapes & Position (Big & Small)'}
            </p>
          </div>
        </div>

        {/* Global Action Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Language Switch */}
          <button
            onClick={() => {
              setLang(lang === 'ne' ? 'en' : 'ne');
              AudioController.playClick();
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: '#059669',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {lang === 'ne' ? 'English' : 'नेपाली'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              background: isDarkMode ? '#293747' : '#ffffff',
              color: isDarkMode ? '#fde047' : '#059669',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: '700',
            }}
            title="Toggle Day / Night"
          >
            {isDarkMode ? <Moon size={15} /> : <Sun size={15} />}
            <span>{isDarkMode ? (lang === 'ne' ? 'रात' : 'Night') : (lang === 'ne' ? 'दिन' : 'Day')}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const m = !isMuted;
              setIsMuted(m);
              AudioController.setMuted(m);
            }}
            style={{
              padding: '7px',
              borderRadius: '8px',
              background: isDarkMode ? '#293747' : '#ffffff',
              color: isDarkMode ? '#f1f5f9' : '#475569',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              cursor: 'pointer',
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Reset Comparison Camera */}
          <button
            onClick={resetComparisonCamera}
            style={{
              padding: '7px',
              borderRadius: '8px',
              background: isDarkMode ? '#293747' : '#ffffff',
              color: isDarkMode ? '#f1f5f9' : '#475569',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              cursor: 'pointer',
            }}
            title="Reset Comparison View"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* ── 5 MODE SELECTOR TABS ─────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 18px',
          background: isDarkMode ? '#1a232f' : '#e5e9e2',
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #cbd5e1',
          overflowX: 'auto',
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: '800',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            textTransform: 'uppercase',
            marginRight: '6px',
          }}
        >
          {lang === 'ne' ? 'सिकाइ मोडहरू:' : 'Modes:'}
        </span>

        {[
          { key: 'MODE_1', labelNe: '१. ठूलो कि सानो?', labelEn: '1. Big or Small?', icon: '⚖️' },
          { key: 'MODE_2', labelNe: '२. सबैभन्दा ठूलो र सानो', labelEn: '2. Biggest & Smallest', icon: '🏆' },
          { key: 'MODE_3', labelNe: '३. आकारअनुसार मिलाउनुहोस्', labelEn: '3. Arrange by Size', icon: '🔢' },
          { key: 'MODE_4', labelNe: '४. आकार प्रयोगशाला', labelEn: '4. Size Discovery Lab', icon: '🔬' },
          { key: 'MODE_5', labelNe: '५. ठूलो र सानो चुनौती', labelEn: '5. Size Challenge', icon: '⭐' },
        ].map((m) => {
          const isActive = currentMode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => {
                setCurrentMode(m.key as SimulationMode);
                AudioController.playClick();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#059669' : isDarkMode ? '#293747' : '#ffffff',
                color: isActive ? '#ffffff' : isDarkMode ? '#cbd5e1' : '#334155',
                boxShadow: isActive ? '0 2px 8px rgba(5, 150, 105, 0.4)' : 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              <span>{m.icon}</span>
              <span>{lang === 'ne' ? m.labelNe : m.labelEn}</span>
            </button>
          );
        })}
      </nav>

      {/* ── 2-COLUMN MAIN WORKSPACE ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' }}>
        {/* LEFT COLUMN: 3D WEBGL STAGE */}
        <div
          style={{
            flex: stageLayout === 'full' ? 1 : 0.68,
            height: '100%',
            position: 'relative',
            background: isDarkMode ? '#202b38' : '#f5f7f2',
            overflow: 'hidden',
          }}
        >
          <div
            ref={mountRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            style={{ width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' }}
          />

          {/* Perspective-Safe Camera Badge */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: isDarkMode ? 'rgba(32, 43, 56, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: '700',
              zIndex: 10,
            }}
          >
            <Scale size={14} color="#059669" />
            <span>{lang === 'ne' ? 'समान दूरी तुलना दृश्य (Perspective-Safe)' : 'Accurate Scale Podiums'}</span>
          </div>

          {/* Fullscreen / Split Toggle */}
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
            <button
              onClick={() => setStageLayout(stageLayout === 'full' ? 'split' : 'full')}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                background: isDarkMode ? 'rgba(32, 43, 56, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                color: isDarkMode ? '#f1f5f9' : '#334155',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {stageLayout === 'full' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{stageLayout === 'full' ? 'Split View' : 'Full Stage'}</span>
            </button>
          </div>

          {/* Bottom Hint Bubble */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: isDarkMode ? 'rgba(32, 43, 56, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '8px 18px',
              borderRadius: '24px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10,
              maxWidth: '90%',
            }}
          >
            <span>🦜 मिट्ठु:</span>
            <span>
              {lang === 'ne'
                ? '३डी वस्तुलाई छुनुहोस् वा दायाँ प्यानलबाट उत्तर छान्नुहोस् • पृष्ठभूमिलाई ३६०° घुमाउन सक्नुहुन्छ!'
                : 'Tap 3D items directly or select answers in the right panel • Drag to orbit 360°!'}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROL PANEL */}
        {stageLayout !== 'full' && (
          <aside
            style={{
              flex: 0.32,
              minWidth: '320px',
              maxWidth: '460px',
              height: '100%',
              background: isDarkMode ? '#1a232f' : '#ffffff',
              borderLeft: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 18px',
              gap: '14px',
              overflowY: 'auto',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.04)',
              zIndex: 15,
            }}
          >
            {/* ── MODE 1: BIG OR SMALL? CARD ───────────────────────── */}
            {currentMode === 'MODE_1' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 10px',
                      borderRadius: '10px',
                    }}
                  >
                    {lang === 'ne' ? `जोडी ${mode1Idx + 1} / ${MODE_1_PAIRS.length}` : `Pair ${mode1Idx + 1} of ${MODE_1_PAIRS.length}`}
                  </span>
                  <button
                    onClick={() => {
                      const p = MODE_1_PAIRS[mode1Idx];
                      AudioController.speak(lang === 'ne' ? p.questionNe : p.questionEn, lang);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Volume2 size={13} />
                    <span>{lang === 'ne' ? 'सुन्नुहोस्' : 'Listen'}</span>
                  </button>
                </div>

                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', lineHeight: '1.4' }}>
                  {lang === 'ne' ? MODE_1_PAIRS[mode1Idx].questionNe : MODE_1_PAIRS[mode1Idx].questionEn}
                </h3>

                {/* 2 Choice Selection Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => handleMode1Answer('A')}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: selectedChoice === 'A' ? '#059669' : isDarkMode ? '#293747' : '#f8fafc',
                      color: selectedChoice === 'A' ? '#ffffff' : isDarkMode ? '#f1f5f9' : '#0f172a',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{MODE_1_PAIRS[mode1Idx].itemA.icon}</span>
                    <div>
                      <div>{lang === 'ne' ? MODE_1_PAIRS[mode1Idx].itemA.nameNe : MODE_1_PAIRS[mode1Idx].itemA.nameEn}</div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        {lang === 'ne' ? 'देब्रे पोडियम (Left Podium)' : 'Left Platform'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMode1Answer('B')}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: selectedChoice === 'B' ? '#059669' : isDarkMode ? '#293747' : '#f8fafc',
                      color: selectedChoice === 'B' ? '#ffffff' : isDarkMode ? '#f1f5f9' : '#0f172a',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{MODE_1_PAIRS[mode1Idx].itemB.icon}</span>
                    <div>
                      <div>{lang === 'ne' ? MODE_1_PAIRS[mode1Idx].itemB.nameNe : MODE_1_PAIRS[mode1Idx].itemB.nameEn}</div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        {lang === 'ne' ? 'दायाँ पोडियम (Right Podium)' : 'Right Platform'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ── MODE 2: BIGGEST AND SMALLEST CARD ────────────────── */}
            {currentMode === 'MODE_2' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 10px',
                      borderRadius: '10px',
                    }}
                  >
                    {lang === 'ne' ? `प्रश्न ${mode2Idx + 1} / ${MODE_2_SETS.length}` : `Question ${mode2Idx + 1} of ${MODE_2_SETS.length}`}
                  </span>
                  <button
                    onClick={() => {
                      const s = MODE_2_SETS[mode2Idx];
                      AudioController.speak(lang === 'ne' ? s.questionNe : s.questionEn, lang);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Volume2 size={13} />
                    <span>{lang === 'ne' ? 'सुन्नुहोस्' : 'Listen'}</span>
                  </button>
                </div>

                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', lineHeight: '1.4' }}>
                  {lang === 'ne' ? MODE_2_SETS[mode2Idx].questionNe : MODE_2_SETS[mode2Idx].questionEn}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {MODE_2_SETS[mode2Idx].items.map((it, idx) => (
                    <button
                      key={it.id}
                      onClick={() => handleMode2Answer(idx)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: selectedMode2Idx === idx ? '#059669' : isDarkMode ? '#293747' : '#f8fafc',
                        color: selectedMode2Idx === idx ? '#ffffff' : isDarkMode ? '#f1f5f9' : '#0f172a',
                        border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{it.icon}</span>
                      <span>{lang === 'ne' ? it.nameNe : it.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── MODE 3: ARRANGE BY SIZE CARD ─────────────────────── */}
            {currentMode === 'MODE_3' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '2px 10px',
                    borderRadius: '10px',
                    alignSelf: 'flex-start',
                  }}
                >
                  {lang === 'ne' ? `अभ्यास ${mode3Idx + 1} / ${MODE_3_TASKS.length}` : `Task ${mode3Idx + 1} of ${MODE_3_TASKS.length}`}
                </span>

                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', lineHeight: '1.4' }}>
                  {lang === 'ne' ? MODE_3_TASKS[mode3Idx].instructionNe : MODE_3_TASKS[mode3Idx].instructionEn}
                </h3>

                {/* 3 Size Target Slots */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
                  {[0, 1, 2].map((slot) => {
                    const filledId = placedSlots[slot];
                    const item = MODE_3_TASKS[mode3Idx].items.find((x) => x.id === filledId);
                    const slotLabel =
                      MODE_3_TASKS[mode3Idx].orderDirection === 'SMALLEST_TO_BIGGEST'
                        ? slot === 0 ? '१. सानो' : slot === 1 ? '२. मध्यम' : '३. ठूलो'
                        : slot === 0 ? '१. ठूलो' : slot === 1 ? '२. मध्यम' : '३. सानो';

                    return (
                      <div
                        key={slot}
                        style={{
                          border: isDarkMode ? '2px dashed #475569' : '2px dashed #94a3b8',
                          borderRadius: '10px',
                          padding: '10px 4px',
                          textAlign: 'center',
                          background: filledId ? (isDarkMode ? '#293747' : '#ecfdf5') : 'transparent',
                        }}
                      >
                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#059669' }}>{slotLabel}</div>
                        <div style={{ fontSize: '24px', minHeight: '36px', marginTop: '4px' }}>{item ? item.icon : '⬜'}</div>
                        <div style={{ fontSize: '10px', fontWeight: '700' }}>{item ? (lang === 'ne' ? item.nameNe : item.nameEn) : 'खाली'}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Unplaced Items to Pick */}
                <div style={{ marginTop: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                    {lang === 'ne' ? 'वस्तु छान्नुहोस् र स्थानमा राख्नुहोस्:' : 'Pick Item to Place:'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {MODE_3_TASKS[mode3Idx].items.map((it) => {
                      const isPlaced = placedSlots.includes(it.id);
                      return (
                        <button
                          key={it.id}
                          disabled={isPlaced}
                          onClick={() => {
                            // Find first empty slot
                            const emptyIdx = placedSlots.findIndex((x) => x === null);
                            if (emptyIdx !== -1) placeItemInSlot(emptyIdx, it.id);
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: '8px',
                            background: isPlaced ? (isDarkMode ? '#1e293b' : '#e2e8f0') : isDarkMode ? '#293747' : '#f1f5f9',
                            color: isPlaced ? '#94a3b8' : isDarkMode ? '#f1f5f9' : '#0f172a',
                            border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                            cursor: isPlaced ? 'not-allowed' : 'pointer',
                            opacity: isPlaced ? 0.4 : 1,
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: '20px' }}>{it.icon}</span>
                          <span>{lang === 'ne' ? it.nameNe : it.nameEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={resetMode3Order}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: isDarkMode ? '#293747' : '#e2e8f0',
                    color: isDarkMode ? '#f1f5f9' : '#334155',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  🔄 {lang === 'ne' ? 'फेरि मिलाउनुहोस् (Reset Slots)' : 'Reset Slots'}
                </button>
              </div>
            )}

            {/* ── MODE 4: SIZE DISCOVERY LAB CARD ──────────────────── */}
            {currentMode === 'MODE_4' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#059669' }}>
                  🔬 {lang === 'ne' ? 'आकार पत्ता लगाउने प्रयोगशाला' : 'Size Discovery Studio'}
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
                  {(['animals', 'fruits', 'traditional', 'toys'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setLabCategory(cat)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: labCategory === cat ? '#059669' : isDarkMode ? '#293747' : '#e2e8f0',
                        color: labCategory === cat ? '#ffffff' : isDarkMode ? '#f1f5f9' : '#334155',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Items in Active Category */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {DISCOVERY_CATALOG[labCategory].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        // Toggle left or right
                        if (labLeftItem !== item.id) setLabLeftItem(item.id);
                        else setLabRightItem(item.id);
                        AudioController.playPop();
                      }}
                      style={{
                        padding: '6px 2px',
                        borderRadius: '8px',
                        background: isDarkMode ? '#293747' : '#f8fafc',
                        border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: isDarkMode ? '#f1f5f9' : '#0f172a',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                      <span style={{ fontSize: '9px', fontWeight: '700', marginTop: '2px' }}>
                        {lang === 'ne' ? item.nameNe : item.nameEn}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Scale Multiplier Slider */}
                <div
                  style={{
                    background: isDarkMode ? '#293747' : '#f8fafc',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                    <span>{lang === 'ne' ? 'दृश्य आकार परिवर्तन (Visual Scale):' : 'Visual Size Demo:'}</span>
                    <span style={{ color: '#059669', fontWeight: '800' }}>{labScaleMultiplier.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.1"
                    value={labScaleMultiplier}
                    onChange={(e) => setLabScaleMultiplier(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#059669' }}
                  />
                </div>
              </div>
            )}

            {/* ── MODE 5: BIG AND SMALL CHALLENGE CARD ─────────────── */}
            {currentMode === 'MODE_5' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669' }}>
                    🏆 {lang === 'ne' ? 'ठूलो र सानो चुनौती' : 'Size Challenge Quiz'}
                  </span>
                  <span
                    style={{
                      background: '#f59e0b',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    ⭐ {quizScore} / {CHALLENGE_QUESTIONS.length}
                  </span>
                </div>

                {!isQuizFinished ? (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      {lang === 'ne' ? `प्रश्न ${quizIdx + 1} / ${CHALLENGE_QUESTIONS.length}` : `Question ${quizIdx + 1} of ${CHALLENGE_QUESTIONS.length}`}
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: '800', lineHeight: '1.4' }}>
                      {lang === 'ne' ? CHALLENGE_QUESTIONS[quizIdx].questionNe : CHALLENGE_QUESTIONS[quizIdx].questionEn}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      {CHALLENGE_QUESTIONS[quizIdx].options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleQuizAnswer(opt.isCorrect, opt.explanationNe, opt.explanationEn)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: isDarkMode ? '#293747' : '#ffffff',
                            color: isDarkMode ? '#ffffff' : '#0f172a',
                            border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                            fontSize: '13px',
                            fontWeight: '700',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          {lang === 'ne' ? opt.labelNe : opt.labelEn}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '14px 0' }}>
                    <div style={{ fontSize: '36px' }}>🎉</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px' }}>
                      {lang === 'ne' ? 'उत्कृष्ट नतिजा!' : 'Quiz Completed!'}
                    </div>
                    <p style={{ fontSize: '13px', color: isDarkMode ? '#b7c4d2' : '#475569', margin: '6px 0 14px 0' }}>
                      {lang === 'ne'
                        ? `तपाईंले ${CHALLENGE_QUESTIONS.length} मा ${quizScore} अंक प्राप्त गर्नुभयो!`
                        : `You scored ${quizScore} out of ${CHALLENGE_QUESTIONS.length}!`}
                    </p>
                    <button
                      onClick={() => {
                        setQuizIdx(0);
                        setQuizScore(0);
                        setIsQuizFinished(false);
                        AudioController.playClick();
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'फेरि प्रयास गर्नुहोस्' : 'Restart Challenge'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── SHARED FEEDBACK ALERT ────────────────────────────── */}
            {feedback.message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: feedback.type === 'success' ? '#166534' : '#991b1b',
                  border: feedback.type === 'success' ? '1px solid #86efac' : '1px solid #fca5a5',
                  marginTop: 'auto',
                }}
              >
                {feedback.message}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
