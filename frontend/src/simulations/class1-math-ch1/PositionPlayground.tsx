/**
 * PositionPlayground.tsx
 * Grade 1 Mathematics • Chapter 1: आकारप्रकार र स्थान (Shapes & Position)
 * Master 3D Simulation: My 3D Position Playground – Inside, Outside, Above and Below
 * मेरो ३डी स्थिति खेलमैदान – भित्र, बाहिर, माथि र तल
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
  Home,
  Layers,
  Eye,
  Trophy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Compass,
  Play,
  RotateCw,
  Info,
} from 'lucide-react';
import { createVillageEnvironment, VillageElements } from './VillageEnvironment';
import { createCharactersAndAnimals, VillageCharacters } from './CharactersAndAnimals';
import { evaluateSpatialPosition, SpatialResult, PLAYGROUND_ZONES } from './SpatialDetector';
import {
  MODE_1_INSIDE_OUTSIDE_TASKS,
  MODE_2_ABOVE_BELOW_TASKS,
  MODE_4_FOLLOW_INSTRUCTION_TASKS,
  DISCOVERY_OBJECT_ITEMS,
  ASSESSMENT_QUESTIONS,
  SpatialPlaygroundTask,
} from './PlaygroundLevels';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';

interface PositionPlaygroundProps {
  onBackToLibrary: () => void;
  userRole?: string;
  initialLanguage?: 'ne' | 'en';
}

type LearningMode = 'MODE_1' | 'MODE_2' | 'MODE_3' | 'MODE_4' | 'MODE_5';

export const PositionPlayground: React.FC<PositionPlaygroundProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // ── APP & SIMULATION STATE ────────────────────────────────────
  const [lang, setLang] = useState<'ne' | 'en'>(initialLanguage);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<LearningMode>('MODE_1');
  const [taskIndex, setTaskIndex] = useState<number>(0);
  const [selectedObjectId, setSelectedObjectId] = useState<string>('cat');
  const [currentDetection, setCurrentDetection] = useState<SpatialResult | null>(null);

  // Visual & Controls State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRoofCutaway, setIsRoofCutaway] = useState<boolean>(true);
  const [isDoorOpen, setIsDoorOpen] = useState<boolean>(true);
  const [isBoxOpen, setIsBoxOpen] = useState<boolean>(true);
  const [hintTier, setHintTier] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Stage Layout Split (70/30 or Full)
  const [stageLayout, setStageLayout] = useState<'split' | 'wide' | 'full'>('split');

  // Assessment Challenge (Mode 5) State
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({});
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [isSavingProgress, setIsSavingProgress] = useState<boolean>(false);

  // ── THREE.JS ENGINE REFS ──────────────────────────────────────
  const threeEngineRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    environment: VillageElements;
    characters: VillageCharacters;
    animFrameId: number;
    clock: THREE.Clock;
    draggableList: THREE.Group[];
    // Orbit camera controls state
    spherical: { radius: number; theta: number; phi: number };
    target: THREE.Vector3;
    isOrbiting: boolean;
    orbitStart: { x: number; y: number };
    // Drag state
    draggedGroup: THREE.Group | null;
    dragPlane: THREE.Plane;
    dragPlaneOffset: THREE.Vector3;
  } | null>(null);

  // Active task list according to mode
  const activeTaskList: SpatialPlaygroundTask[] =
    currentMode === 'MODE_1'
      ? MODE_1_INSIDE_OUTSIDE_TASKS
      : currentMode === 'MODE_2'
      ? MODE_2_ABOVE_BELOW_TASKS
      : currentMode === 'MODE_4'
      ? MODE_4_FOLLOW_INSTRUCTION_TASKS
      : [];

  const currentTask: SpatialPlaygroundTask | null =
    activeTaskList.length > 0 ? activeTaskList[taskIndex] || activeTaskList[0] : null;

  // ── INITIALIZE THREE.JS WEBGL ENGINE ─────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const initialWidth = container.clientWidth || 800;
    const initialHeight = container.clientHeight || 560;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xe0f2fe, 1.0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // Remove any leftover canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0f2fe);
    scene.fog = new THREE.FogExp2(0xe0f2fe, 0.015);

    const camera = new THREE.PerspectiveCamera(45, initialWidth / initialHeight, 0.1, 150);

    // Camera Spherical Coordinates for 360 Orbit
    const cameraTarget = new THREE.Vector3(0, 1.2, 0);
    const cameraRadius = 24;
    const cameraPhi = Math.PI / 3.4; // ~52 degrees elevation
    const cameraTheta = Math.PI / 4.2; // ~42 degrees azimuth

    camera.position.set(
      cameraTarget.x + cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta),
      cameraTarget.y + cameraRadius * Math.cos(cameraPhi),
      cameraTarget.z + cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta)
    );
    camera.lookAt(cameraTarget);

    // Build Procedural Environment & Animated Characters
    const environment = createVillageEnvironment(scene);
    const characters = createCharactersAndAnimals(scene);
    const clock = new THREE.Clock();

    // Default: Open door and cutaway roof so interior is visible
    environment.openDoor(true);
    environment.setRoofCutaway(true);
    environment.openToyBox(true);

    // Tag Draggable Objects with Metadata
    const draggables: THREE.Group[] = [
      characters.cat,
      characters.dog,
      characters.bird,
      characters.rabbit,
      characters.butterfly,
      environment.ball,
      environment.teddy,
      environment.toyCar,
      environment.waterPot,
      environment.bag,
    ];

    characters.cat.userData = { id: 'cat', nameEn: 'Cat', nameNe: 'बिरालो', isDraggable: true, defaultY: 0 };
    characters.dog.userData = { id: 'dog', nameEn: 'Dog', nameNe: 'कुकुर', isDraggable: true, defaultY: 0 };
    characters.bird.userData = { id: 'bird', nameEn: 'Bird', nameNe: 'चरा', isDraggable: true, defaultY: 3.5 };
    characters.rabbit.userData = { id: 'rabbit', nameEn: 'Rabbit', nameNe: 'खरायो', isDraggable: true, defaultY: 0 };
    characters.butterfly.userData = { id: 'butterfly', nameEn: 'Butterfly', nameNe: 'पुतली', isDraggable: true, defaultY: 1.5 };
    environment.ball.userData = { id: 'ball', nameEn: 'Ball', nameNe: 'बल', isDraggable: true, defaultY: 0.28 };
    environment.teddy.userData = { id: 'teddy', nameEn: 'Teddy Bear', nameNe: 'गुडिया', isDraggable: true, defaultY: 0.28 };
    environment.toyCar.userData = { id: 'toyCar', nameEn: 'Toy Car', nameNe: 'गाडी', isDraggable: true, defaultY: 0.16 };
    environment.waterPot.userData = { id: 'waterPot', nameEn: 'Water Pot', nameNe: 'गाग्री', isDraggable: true, defaultY: 0.4 };
    environment.bag.userData = { id: 'bag', nameEn: 'School Bag', nameNe: 'झोला', isDraggable: true, defaultY: 0.3 };

    // Initial placement of items in logical starting spots
    characters.cat.position.set(-3.8, 0, 1.8);
    characters.dog.position.set(-2.0, 0, 3.2);
    characters.bird.position.set(4.0, 3.2, -1.0);
    characters.rabbit.position.set(2.5, 0, 3.5);
    characters.butterfly.position.set(-1.0, 1.8, 1.0);
    environment.ball.position.set(1.5, 0.28, 3.0);
    environment.teddy.position.set(-1.2, 0.28, 0.5);
    environment.toyCar.position.set(-3.2, 0.16, 2.5);
    environment.waterPot.position.set(3.5, 0.4, 1.5);
    environment.bag.position.set(4.0, 0.3, -1.5);

    // Save Engine State
    threeEngineRef.current = {
      renderer,
      scene,
      camera,
      environment,
      characters,
      animFrameId: 0,
      clock,
      draggableList: draggables,
      spherical: { radius: cameraRadius, theta: cameraTheta, phi: cameraPhi },
      target: cameraTarget,
      isOrbiting: false,
      orbitStart: { x: 0, y: 0 },
      draggedGroup: null,
      dragPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      dragPlaneOffset: new THREE.Vector3(),
    };

    // Animation Loop
    function renderLoop() {
      const delta = clock.getDelta();
      environment.update(delta);
      characters.update(delta);
      renderer.render(scene, camera);
      threeEngineRef.current!.animFrameId = requestAnimationFrame(renderLoop);
    }
    threeEngineRef.current.animFrameId = requestAnimationFrame(renderLoop);

    // Resize Handler via ResizeObserver
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
    // Clamp radius, phi
    spherical.radius = Math.max(8, Math.min(spherical.radius, 45));
    spherical.phi = Math.max(0.15, Math.min(spherical.phi, Math.PI / 2 - 0.05)); // prevent below ground

    camera.position.set(
      target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
      target.y + spherical.radius * Math.cos(spherical.phi),
      target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
    );
    camera.lookAt(target);
  }, []);

  // ── CAMERA VIEW PRESETS ────────────────────────────────────────
  const setCameraView = (view: 'overview' | 'house' | 'garden' | 'tree' | 'top') => {
    if (!threeEngineRef.current) return;
    const { spherical, target } = threeEngineRef.current;
    AudioController.playClick();

    if (view === 'overview') {
      target.set(0, 1.2, 0);
      spherical.radius = 24;
      spherical.theta = Math.PI / 4.2;
      spherical.phi = Math.PI / 3.4;
    } else if (view === 'house') {
      target.set(-7.5, 1.5, -2.0);
      spherical.radius = 14;
      spherical.theta = Math.PI / 5;
      spherical.phi = Math.PI / 3.6;
    } else if (view === 'garden') {
      target.set(2.0, 1.0, 2.0);
      spherical.radius = 12;
      spherical.theta = Math.PI / 3.5;
      spherical.phi = Math.PI / 3.2;
    } else if (view === 'tree') {
      target.set(7.5, 3.0, -3.5);
      spherical.radius = 13;
      spherical.theta = Math.PI / 3;
      spherical.phi = Math.PI / 3.2;
    } else if (view === 'top') {
      target.set(0, 0, 0);
      spherical.radius = 26;
      spherical.theta = 0;
      spherical.phi = 0.18;
    }
    updateCameraTransform();
  };

  // ── THEME & VISUAL TOGGLES ────────────────────────────────────
  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (!threeEngineRef.current) return;
    threeEngineRef.current.environment.setTheme(next);
    if (next) {
      threeEngineRef.current.scene.background = new THREE.Color(0x0f172a);
      threeEngineRef.current.scene.fog = new THREE.FogExp2(0x0f172a, 0.018);
    } else {
      threeEngineRef.current.scene.background = new THREE.Color(0xe0f2fe);
      threeEngineRef.current.scene.fog = new THREE.FogExp2(0xe0f2fe, 0.015);
    }
    AudioController.playClick();
  };

  const toggleRoofCutaway = () => {
    const next = !isRoofCutaway;
    setIsRoofCutaway(next);
    if (threeEngineRef.current) {
      threeEngineRef.current.environment.setRoofCutaway(next);
    }
    AudioController.playPop();
  };

  const toggleDoor = () => {
    const next = !isDoorOpen;
    setIsDoorOpen(next);
    if (threeEngineRef.current) {
      threeEngineRef.current.environment.openDoor(next);
    }
    AudioController.playPop();
  };

  const toggleBox = () => {
    const next = !isBoxOpen;
    setIsBoxOpen(next);
    if (threeEngineRef.current) {
      threeEngineRef.current.environment.openToyBox(next);
    }
    AudioController.playPop();
  };

  // ── SOUND & SPEECH ON TASK / MODE CHANGE ──────────────────────
  useEffect(() => {
    setHintTier(0);
    setFeedback({ type: null, message: '' });

    if (currentMode === 'MODE_1' || currentMode === 'MODE_2' || currentMode === 'MODE_4') {
      if (currentTask) {
        setSelectedObjectId(currentTask.targetObject);
        // Highlight corresponding drop zone
        if (threeEngineRef.current) {
          threeEngineRef.current.environment.highlightZone(currentTask.targetZoneKey);
        }
        const text = lang === 'ne' ? currentTask.instructionNe : currentTask.instructionEn;
        AudioController.speak(text, lang);
      }
    } else if (currentMode === 'MODE_3') {
      // Discovery mode
      if (threeEngineRef.current) {
        threeEngineRef.current.environment.highlightZone(null);
      }
      const intro =
        lang === 'ne'
          ? 'कुनै पनि जनावर वा खेलौना तानेर जहाँसुकै राख्नुहोस्, र स्थान सिक्नुहोस्!'
          : 'Drag any animal or toy anywhere, and discover its 3D position!';
      AudioController.speak(intro, lang);
    } else if (currentMode === 'MODE_5') {
      // Assessment Challenge mode
      const q = ASSESSMENT_QUESTIONS[quizIndex];
      if (q) {
        const text = lang === 'ne' ? q.questionNe : q.questionEn;
        AudioController.speak(text, lang);
      }
    }
  }, [currentMode, taskIndex, quizIndex, lang]);

  // ── LIVE POSITION EVALUATOR HELPER ────────────────────────────
  const runEvaluation = useCallback(
    (group: THREE.Group) => {
      const u = group.userData;
      const res = evaluateSpatialPosition(
        group.position,
        u.id || 'object',
        u.nameEn || 'Object',
        u.nameNe || 'वस्तु'
      );
      setCurrentDetection(res);
      return res;
    },
    []
  );

  // ── RAYCASTING 3D POINTER DRAG & DROP LOGIC ───────────────────
  const getPointerNormalized = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = mountRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    return new THREE.Vector2(x, y);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!threeEngineRef.current || !mountRef.current) return;
    const engine = threeEngineRef.current;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const mouse = getPointerNormalized(e);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, engine.camera);

    // Raycast against all draggable groups
    const hits = raycaster.intersectObjects(engine.draggableList, true);

    if (hits.length > 0) {
      // Find root draggable group
      let rootGroup: THREE.Group | null = null;
      let curr: THREE.Object3D | null = hits[0].object;
      while (curr) {
        if (curr.userData && curr.userData.isDraggable) {
          rootGroup = curr as THREE.Group;
          break;
        }
        curr = curr.parent;
      }

      if (rootGroup) {
        engine.draggedGroup = rootGroup;
        setSelectedObjectId(rootGroup.userData.id);

        // Position the horizontal dragging math plane at object's current Y
        const currentY = rootGroup.position.y;
        engine.dragPlane.set(new THREE.Vector3(0, 1, 0), -currentY);

        const planeIntersect = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(engine.dragPlane, planeIntersect)) {
          engine.dragPlaneOffset.copy(planeIntersect).sub(rootGroup.position);
        }

        AudioController.playPop();
        runEvaluation(rootGroup);
        return;
      }
    }

    // If no draggable object hit, start camera orbit!
    engine.isOrbiting = true;
    engine.orbitStart = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!threeEngineRef.current || !mountRef.current) return;
    const engine = threeEngineRef.current;

    // 1. OBJECT DRAGGING
    if (engine.draggedGroup) {
      const mouse = getPointerNormalized(e);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, engine.camera);

      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(engine.dragPlane, intersection)) {
        const nextPos = intersection.sub(engine.dragPlaneOffset);

        // Snapping / Elevation logic for special zones
        const z = PLAYGROUND_ZONES;
        const dBasket = Math.hypot(nextPos.x - z.basketCenter.x, nextPos.z - z.basketCenter.z);
        const dTable = Math.hypot(nextPos.x - z.tableCenter.x, nextPos.z - z.tableCenter.z);
        const dTree = Math.hypot(nextPos.x - z.treeCenter.x, nextPos.z - z.treeCenter.z);
        const dFlower = Math.hypot(nextPos.x - z.flowerCenter.x, nextPos.z - z.flowerCenter.z);
        const dToyBox = Math.hypot(nextPos.x - (-2.2), nextPos.z - (-0.8));

        // Basket snap
        if (dBasket < z.basketRadius * 0.95) {
          nextPos.y = THREE.MathUtils.lerp(nextPos.y, 0.42, 0.2);
        }
        // Toy box snap
        else if (dToyBox < 1.0) {
          nextPos.y = THREE.MathUtils.lerp(nextPos.y, 0.35, 0.2);
          if (!isBoxOpen) toggleBox();
        }
        // Table above/below snap
        else if (dTable < z.tableRadius * 0.9) {
          if (nextPos.y >= 0.8) {
            nextPos.y = THREE.MathUtils.lerp(nextPos.y, 1.38, 0.25);
          } else {
            nextPos.y = THREE.MathUtils.lerp(nextPos.y, 0.28, 0.25);
          }
        }
        // Tree above/below snap
        else if (dTree < z.treeRadius) {
          const id = engine.draggedGroup.userData.id;
          if (id === 'bird' || id === 'butterfly') {
            nextPos.y = THREE.MathUtils.lerp(nextPos.y, 4.6, 0.2);
          } else {
            nextPos.y = THREE.MathUtils.lerp(nextPos.y, 0, 0.2);
          }
        }
        // Flower above snap
        else if (dFlower < z.flowerRadius) {
          const id = engine.draggedGroup.userData.id;
          if (id === 'bird' || id === 'butterfly') {
            nextPos.y = THREE.MathUtils.lerp(nextPos.y, 1.6, 0.2);
          }
        } else {
          // Normal ground or base height
          const baseY = engine.draggedGroup.userData.defaultY || 0;
          nextPos.y = THREE.MathUtils.lerp(nextPos.y, baseY, 0.15);
        }

        // Clamp boundaries so objects don't fly off world
        nextPos.x = Math.max(-13, Math.min(nextPos.x, 13));
        nextPos.z = Math.max(-13, Math.min(nextPos.z, 13));

        engine.draggedGroup.position.copy(nextPos);
        runEvaluation(engine.draggedGroup);
      }
      return;
    }

    // 2. CAMERA ORBITING
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
    const engine = threeEngineRef.current;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if pointer wasn't captured
    }

    if (engine.draggedGroup) {
      const group = engine.draggedGroup;
      engine.draggedGroup = null;
      const evaluation = runEvaluation(group);

      // Verify Task Success in Mode 1, Mode 2, or Mode 4
      if (currentMode === 'MODE_1' || currentMode === 'MODE_2' || currentMode === 'MODE_4') {
        if (currentTask && currentTask.targetObject === group.userData.id) {
          const isMatch = checkTaskSatisfaction(evaluation, currentTask.targetPosition);
          if (isMatch) {
            handleTaskSuccess(currentTask);
          } else {
            AudioController.playBoop();
            setFeedback({
              type: 'error',
              message:
                lang === 'ne'
                  ? `अझै पुगेन! ${hintTier === 0 ? currentTask.hint1Ne : currentTask.hint2Ne}`
                  : `Not quite there! ${hintTier === 0 ? currentTask.hint1En : currentTask.hint2En}`,
            });
          }
        }
      } else if (currentMode === 'MODE_3') {
        // Discovery sandbox mode: speak out loud what position was achieved!
        AudioController.playSuccess();
        const speech = lang === 'ne' ? evaluation.descriptionNe : evaluation.descriptionEn;
        AudioController.speak(speech, lang);
      }
    }

    engine.isOrbiting = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!threeEngineRef.current) return;
    const engine = threeEngineRef.current;
    const zoomFactor = e.deltaY * 0.02;
    engine.spherical.radius += zoomFactor;
    updateCameraTransform();
  };

  // ── CHECK TASK SATISFACTION ───────────────────────────────────
  const checkTaskSatisfaction = (res: SpatialResult, targetPos: string): boolean => {
    switch (targetPos) {
      case 'inside_house':
        return res.relation === 'inside' && res.target === 'house';
      case 'outside_house':
        return (res.relation === 'outside' && res.target === 'house') || res.target === 'none';
      case 'inside_basket':
        return res.relation === 'inside' && res.target === 'basket';
      case 'outside_basket':
        return res.relation === 'outside' && res.target === 'basket';
      case 'inside_box':
        return res.relation === 'inside' && res.target === 'box';
      case 'outside_box':
        return res.relation === 'outside' && res.target === 'box';
      case 'above_tree':
        return res.relation === 'above' && res.target === 'tree';
      case 'below_tree':
        return res.relation === 'below' && res.target === 'tree';
      case 'above_flower':
        return res.relation === 'above' && res.target === 'flower';
      case 'below_flower':
        return res.relation === 'below' && res.target === 'flower';
      case 'above_table':
        return res.relation === 'above' && res.target === 'table';
      case 'below_table':
        return res.relation === 'below' && res.target === 'table';
      default:
        return false;
    }
  };

  // ── TASK SUCCESS HANDLER ──────────────────────────────────────
  const handleTaskSuccess = (task: SpatialPlaygroundTask) => {
    AudioController.playSuccess();
    setFeedback({
      type: 'success',
      message: lang === 'ne' ? task.successMessageNe : task.successMessageEn,
    });

    const msg = lang === 'ne' ? task.successMessageNe : task.successMessageEn;
    AudioController.speak(msg, lang);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (taskIndex < activeTaskList.length - 1) {
        setTaskIndex((prev) => prev + 1);
      } else {
        AudioController.playCelebration();
        setFeedback({
          type: 'success',
          message:
            lang === 'ne'
              ? 'बधाई छ! तपाईंले यो मोडका सबै अभ्यास सफलतापूर्वक पूरा गर्नुभयो! 🌟'
              : 'Congratulations! You have successfully mastered all tasks in this mode! 🌟',
        });
      }
    }, 2200);
  };

  // ── QUICK PLACEMENT TELEPORT BUTTON (SMART BOARD / ACCESSIBILITY) ─
  const quickPlaceObject = (preset: string) => {
    if (!threeEngineRef.current) return;
    const engine = threeEngineRef.current;
    const targetGroup = engine.draggableList.find((g) => g.userData.id === selectedObjectId);
    if (!targetGroup) return;

    AudioController.playPop();

    switch (preset) {
      case 'inside_house':
        engine.environment.openDoor(true);
        setIsDoorOpen(true);
        targetGroup.position.set(-7.5, 0.4, -2.5);
        break;
      case 'outside_house':
        targetGroup.position.set(-5.0, 0, 1.8);
        break;
      case 'inside_basket':
        targetGroup.position.set(0.5, 0.42, 3.2);
        break;
      case 'outside_basket':
        targetGroup.position.set(2.0, 0, 3.2);
        break;
      case 'inside_box':
        engine.environment.openToyBox(true);
        setIsBoxOpen(true);
        targetGroup.position.set(-2.2, 0.35, -0.8);
        break;
      case 'outside_box':
        targetGroup.position.set(-0.8, 0, -0.5);
        break;
      case 'above_tree':
        targetGroup.position.set(7.5, 4.6, -3.5);
        break;
      case 'below_tree':
        targetGroup.position.set(7.5, 0, -3.0);
        break;
      case 'above_table':
        targetGroup.position.set(4.5, 1.38, 0.5);
        break;
      case 'below_table':
        targetGroup.position.set(4.5, 0.28, 0.5);
        break;
      case 'above_flower':
        targetGroup.position.set(-1.5, 1.6, 2.2);
        break;
      default:
        break;
    }

    const evaluation = runEvaluation(targetGroup);
    if (currentMode === 'MODE_1' || currentMode === 'MODE_2' || currentMode === 'MODE_4') {
      if (currentTask && currentTask.targetObject === targetGroup.userData.id) {
        if (checkTaskSatisfaction(evaluation, currentTask.targetPosition)) {
          handleTaskSuccess(currentTask);
        }
      }
    } else if (currentMode === 'MODE_3') {
      const speech = lang === 'ne' ? evaluation.descriptionNe : evaluation.descriptionEn;
      AudioController.speak(speech, lang);
    }
  };

  // ── ADVANCE / REPLAY AUDIO ────────────────────────────────────
  const replayCurrentSpeech = () => {
    if (currentMode === 'MODE_5') {
      const q = ASSESSMENT_QUESTIONS[quizIndex];
      if (q) AudioController.speak(lang === 'ne' ? q.questionNe : q.questionEn, lang);
    } else if (currentTask) {
      AudioController.speak(lang === 'ne' ? currentTask.instructionNe : currentTask.instructionEn, lang);
    }
  };

  // ── ASSESSMENT MODE 5 LOGIC ───────────────────────────────────
  const handleQuizAnswer = (isCorrect: boolean, explanationNe: string, explanationEn: string) => {
    const q = ASSESSMENT_QUESTIONS[quizIndex];
    if (isCorrect) {
      AudioController.playSuccess();
      setQuizScore((prev) => prev + 1);
      setQuizAnswers((prev) => ({ ...prev, [q.id]: true }));
      setFeedback({ type: 'success', message: lang === 'ne' ? explanationNe : explanationEn });
    } else {
      AudioController.playBoop();
      setQuizAnswers((prev) => ({ ...prev, [q.id]: false }));
      setFeedback({ type: 'error', message: lang === 'ne' ? explanationNe : explanationEn });
    }

    setTimeout(() => {
      if (quizIndex < ASSESSMENT_QUESTIONS.length - 1) {
        setQuizIndex((prev) => prev + 1);
      } else {
        setIsQuizFinished(true);
        AudioController.playCelebration();
        saveQuizProgress();
      }
    }, 1800);
  };

  const saveQuizProgress = async () => {
    setIsSavingProgress(true);
    try {
      const totalQ = ASSESSMENT_QUESTIONS.length;
      const finalScore = quizScore;
      const pct = Math.round((finalScore / totalQ) * 100);

      const understood: string[] = [];
      const toReview: string[] = [];

      ASSESSMENT_QUESTIONS.forEach((q) => {
        if (quizAnswers[q.id]) understood.push(q.concept);
        else toReview.push(q.concept);
      });

      await api.post('/simulation-activity/simulations/SIM-MATH-G1-CH1-01/progress', {
        gradeLevel: 1,
        subjectCode: 'MATH',
        chapterNumber: 1,
        simulationTitle: 'My 3D Position Playground',
        completedLevels: [1, 2, 3, 4, 5],
        assessmentScore: finalScore,
        totalQuestions: totalQ,
        percentage: pct,
        timeSpentSeconds: 320,
        conceptsUnderstood: Array.from(new Set(understood)),
        conceptsToReview: Array.from(new Set(toReview)),
        isCompleted: pct >= 60,
      });
    } catch (e) {
      console.warn('Simulation progress saving note:', e);
    } finally {
      setIsSavingProgress(false);
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
        background: isDarkMode ? '#090d16' : '#f1f5f9',
        color: isDarkMode ? '#f8fafc' : '#0f172a',
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
          background: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
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
              background: isDarkMode ? '#1e293b' : '#e2e8f0',
              color: isDarkMode ? '#f8fafc' : '#334155',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <ArrowLeft size={16} />
            <span>{lang === 'ne' ? 'फर्कनुहोस्' : 'Back'}</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🏡</span>
              <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0, letterSpacing: '-0.2px' }}>
                {lang === 'ne'
                  ? 'मेरो ३डी स्थिति खेलमैदान – भित्र, बाहिर, माथि र तल'
                  : 'My 3D Position Playground – Inside, Outside, Above and Below'}
              </h1>
              <span
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  letterSpacing: '0.4px',
                }}
              >
                CLASS 1 • CDC NEPAL
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              {lang === 'ne'
                ? 'गणित • पाठ १: आकारप्रकार र स्थान (भित्र, बाहिर, माथि, तल)'
                : 'Mathematics • Chapter 1: Shapes & Position (Inside, Outside, Above, Below)'}
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
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {lang === 'ne' ? 'English' : 'नेपाली'}
          </button>

          {/* Dark / Light Mode */}
          <button
            onClick={toggleDarkMode}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              background: isDarkMode ? '#1e293b' : '#f1f5f9',
              color: isDarkMode ? '#fde047' : '#0284c7',
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

          {/* Roof Cutaway */}
          <button
            onClick={toggleRoofCutaway}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              background: isRoofCutaway ? '#059669' : isDarkMode ? '#1e293b' : '#f1f5f9',
              color: isRoofCutaway ? '#ffffff' : isDarkMode ? '#e2e8f0' : '#334155',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: '700',
            }}
            title="Roof Cutaway (Inside View)"
          >
            <Eye size={15} />
            <span>{lang === 'ne' ? 'कोठाभित्र हेर्नुहोस्' : 'View Inside'}</span>
          </button>

          {/* Audio Mute */}
          <button
            onClick={() => {
              const m = !isMuted;
              setIsMuted(m);
              AudioController.setMuted(m);
            }}
            style={{
              padding: '7px',
              borderRadius: '8px',
              background: isDarkMode ? '#1e293b' : '#f1f5f9',
              color: isDarkMode ? '#e2e8f0' : '#475569',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              cursor: 'pointer',
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => setCameraView('overview')}
            style={{
              padding: '7px',
              borderRadius: '8px',
              background: isDarkMode ? '#1e293b' : '#f1f5f9',
              color: isDarkMode ? '#e2e8f0' : '#475569',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              cursor: 'pointer',
            }}
            title="Reset 3D View"
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
          background: isDarkMode ? '#131b2e' : '#e2e8f0',
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
          { key: 'MODE_1', labelNe: '१. भित्र र बाहिर', labelEn: '1. Inside & Outside', icon: '🚪' },
          { key: 'MODE_2', labelNe: '२. माथि र तल', labelEn: '2. Above & Below', icon: '↕️' },
          { key: 'MODE_3', labelNe: '३. स्थान पत्ता लगाऔँ', labelEn: '3. Position Discovery', icon: '🔍' },
          { key: 'MODE_4', labelNe: '४. निर्देशन अनुसार', labelEn: '4. Follow Instruction', icon: '🎯' },
          { key: 'MODE_5', labelNe: '५. स्थान चुनौती', labelEn: '5. Spatial Challenge', icon: '🏆' },
        ].map((m) => {
          const isActive = currentMode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => {
                setCurrentMode(m.key as LearningMode);
                setTaskIndex(0);
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
                background: isActive ? '#0284c7' : isDarkMode ? '#1e293b' : '#ffffff',
                color: isActive ? '#ffffff' : isDarkMode ? '#cbd5e1' : '#334155',
                boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none',
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

      {/* ── MAIN 2-COLUMN WORKSPACE: 3D STAGE (LEFT) + RIGHT PANEL ─ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── LEFT COLUMN: 3D STAGE VIEWPORT ────────────────────── */}
        <div
          style={{
            flex: stageLayout === 'full' ? 1 : stageLayout === 'wide' ? 0.78 : 0.68,
            height: '100%',
            position: 'relative',
            background: isDarkMode ? '#0f172a' : '#e0f2fe',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* THREE.JS WebGL Canvas Container */}
          <div
            ref={mountRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            style={{
              width: '100%',
              height: '100%',
              cursor: 'grab',
              touchAction: 'none',
            }}
          />

          {/* Floating Camera & View Overlay Toolbar (Top Left of 3D Scene) */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              background: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '6px 10px',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: '800',
                color: isDarkMode ? '#94a3b8' : '#64748b',
                alignSelf: 'center',
                marginRight: '2px',
              }}
            >
              🎥 VIEW:
            </span>
            <button
              onClick={() => setCameraView('overview')}
              style={toolBtnStyle(isDarkMode)}
              title="Overview"
            >
              Overview
            </button>
            <button onClick={() => setCameraView('house')} style={toolBtnStyle(isDarkMode)} title="House">
              🏠 House
            </button>
            <button onClick={() => setCameraView('garden')} style={toolBtnStyle(isDarkMode)} title="Garden">
              🧺 Garden
            </button>
            <button onClick={() => setCameraView('tree')} style={toolBtnStyle(isDarkMode)} title="Tree">
              🌲 Tree
            </button>
            <button onClick={() => setCameraView('top')} style={toolBtnStyle(isDarkMode)} title="Top View">
              📐 Top
            </button>

            <div style={{ width: '1px', background: isDarkMode ? '#334155' : '#cbd5e1', margin: '0 4px' }} />

            {/* Door & Box manual controls */}
            <button onClick={toggleDoor} style={toolBtnStyle(isDarkMode)}>
              🚪 {isDoorOpen ? 'Close Door' : 'Open Door'}
            </button>
            <button onClick={toggleBox} style={toolBtnStyle(isDarkMode)}>
              📦 {isBoxOpen ? 'Close Box' : 'Open Box'}
            </button>
          </div>

          {/* Floating Stage Width Toggle (Top Right of 3D Scene) */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              gap: '4px',
              background: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '4px 8px',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setStageLayout(stageLayout === 'full' ? 'split' : 'full')}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                background: stageLayout === 'full' ? '#0284c7' : 'transparent',
                color: stageLayout === 'full' ? '#ffffff' : isDarkMode ? '#cbd5e1' : '#475569',
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

          {/* Floating Live 3D Hint Banner at Bottom of Canvas */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: isDarkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '8px 18px',
              borderRadius: '24px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 10,
              maxWidth: '90%',
            }}
          >
            <span style={{ fontSize: '15px' }}>💡</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>
              {lang === 'ne'
                ? '३डी वस्तुलाई माउस वा औँलाले तानेर (Drag) राख्नुहोस् • पृष्ठभूमिलाई तानेर ३६०° घुमाउनुहोस् • पाङ्ग्रा घुमाएर जुम गर्नुहोस्'
                : 'Drag 3D items with mouse/touch • Drag background to orbit 360° • Mouse wheel to zoom in/out'}
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: ORGANIZED CONTROLS & DASHBOARD ──────── */}
        {stageLayout !== 'full' && (
          <aside
            style={{
              flex: stageLayout === 'wide' ? 0.22 : 0.32,
              minWidth: '320px',
              maxWidth: '460px',
              height: '100%',
              background: isDarkMode ? '#0d1322' : '#ffffff',
              borderLeft: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: '16px 18px',
              gap: '14px',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.04)',
              zIndex: 15,
            }}
          >
            {/* ── SECTION 1: LIVE POSITION DETECTOR CARD ──────────── */}
            <div
              style={{
                background: isDarkMode ? '#172033' : '#f8fafc',
                border: isDarkMode ? '1px solid #283548' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase' }}>
                  {lang === 'ne' ? 'स्थान पहिचान (Live Detection)' : 'Live 3D Position'}
                </span>
                <span
                  style={{
                    background: currentDetection?.relation === 'inside' ? '#059669' : '#0284c7',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentDetection?.relation || 'placed'}
                </span>
              </div>

              <div style={{ fontSize: '14px', fontWeight: '800', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                {lang === 'ne'
                  ? currentDetection?.titleNe || 'वस्तु तानेर राख्नुहोस्'
                  : currentDetection?.titleEn || 'Drag object to detect position'}
              </div>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                {lang === 'ne'
                  ? currentDetection?.descriptionNe || 'वस्तुको स्थिति यहाँ स्वतः देखिनेछ।'
                  : currentDetection?.descriptionEn || 'Real-time spatial relation is detected automatically.'}
              </div>
            </div>

            {/* ── SECTION 2: ACTIVE TASK / QUESTION CARD ──────────── */}
            {currentMode !== 'MODE_5' && currentTask && (
              <div
                style={{
                  background: isDarkMode ? '#1e293b' : '#f0fdf4',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #bbf7d0',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* Task index indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 10px',
                      borderRadius: '10px',
                    }}
                  >
                    {lang === 'ne'
                      ? `अभ्यास ${taskIndex + 1} / ${activeTaskList.length}`
                      : `Task ${taskIndex + 1} of ${activeTaskList.length}`}
                  </span>

                  <button
                    onClick={replayCurrentSpeech}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      background: '#0284c7',
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

                {/* Instruction Text */}
                <div style={{ fontSize: '15px', fontWeight: '800', lineHeight: '1.4', color: isDarkMode ? '#ffffff' : '#065f46' }}>
                  {lang === 'ne' ? currentTask.instructionNe : currentTask.instructionEn}
                </div>

                {/* Feedback Alert if any */}
                {feedback.message && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                      color: feedback.type === 'success' ? '#166534' : '#991b1b',
                      border: feedback.type === 'success' ? '1px solid #86efac' : '1px solid #fca5a5',
                    }}
                  >
                    {feedback.message}
                  </div>
                )}

                {/* Hint System */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      setHintTier(1);
                      AudioController.playClick();
                      const h = lang === 'ne' ? currentTask.hint1Ne : currentTask.hint1En;
                      AudioController.speak(h, lang);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: hintTier >= 1 ? '#fef08a' : isDarkMode ? '#334155' : '#e2e8f0',
                      color: hintTier >= 1 ? '#854d0e' : isDarkMode ? '#e2e8f0' : '#475569',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    💡 {lang === 'ne' ? 'इशारा १' : 'Hint 1'}
                  </button>

                  <button
                    onClick={() => {
                      setHintTier(2);
                      AudioController.playClick();
                      const h = lang === 'ne' ? currentTask.hint2Ne : currentTask.hint2En;
                      AudioController.speak(h, lang);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: hintTier >= 2 ? '#fef08a' : isDarkMode ? '#334155' : '#e2e8f0',
                      color: hintTier >= 2 ? '#854d0e' : isDarkMode ? '#e2e8f0' : '#475569',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    💡 {lang === 'ne' ? 'इशारा २' : 'Hint 2'}
                  </button>

                  <button
                    onClick={() => quickPlaceObject(currentTask.targetPosition)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    ✨ {lang === 'ne' ? 'सिकाउनुहोस्' : 'Solve'}
                  </button>
                </div>

                {hintTier > 0 && (
                  <div style={{ fontSize: '12px', color: isDarkMode ? '#fde047' : '#854d0e', fontStyle: 'italic' }}>
                    {hintTier === 1
                      ? lang === 'ne' ? currentTask.hint1Ne : currentTask.hint1En
                      : lang === 'ne' ? currentTask.hint2Ne : currentTask.hint2En}
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION 3: 3D OBJECT SELECTOR TRAY ───────────────── */}
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {lang === 'ne' ? 'वस्तु वा जनावर छान्नुहोस् (Pick to Place):' : 'Select Object or Animal:'}
              </span>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '6px',
                }}
              >
                {DISCOVERY_OBJECT_ITEMS.map((item) => {
                  const isSel = selectedObjectId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedObjectId(item.id);
                        AudioController.playPop();
                        if (threeEngineRef.current) {
                          const grp = threeEngineRef.current.draggableList.find((g) => g.userData.id === item.id);
                          if (grp) runEvaluation(grp);
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 4px',
                        borderRadius: '10px',
                        background: isSel ? '#0284c7' : isDarkMode ? '#1e293b' : '#f1f5f9',
                        color: isSel ? '#ffffff' : isDarkMode ? '#e2e8f0' : '#1e293b',
                        border: isSel ? '2px solid #38bdf8' : isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{item.icon}</span>
                      <span style={{ fontSize: '10px', fontWeight: '800', marginTop: '3px' }}>
                        {lang === 'ne' ? item.nameNe : item.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── SECTION 4: SMART BOARD ONE-TAP PLACEMENT BUTTONS ─ */}
            <div
              style={{
                background: isDarkMode ? '#131c2d' : '#f8fafc',
                border: isDarkMode ? '1px solid #233148' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>⚡</span>
                <span>{lang === 'ne' ? 'द्रुत स्थान बटनहरू (Quick Placement):' : 'Quick Teleport to Zone:'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button onClick={() => quickPlaceObject('inside_house')} style={quickActionBtnStyle(isDarkMode)}>
                  🏠 {lang === 'ne' ? 'घरभित्र (Inside)' : 'Inside House'}
                </button>
                <button onClick={() => quickPlaceObject('outside_house')} style={quickActionBtnStyle(isDarkMode)}>
                  🏡 {lang === 'ne' ? 'घरबाहिर (Outside)' : 'Outside House'}
                </button>
                <button onClick={() => quickPlaceObject('inside_basket')} style={quickActionBtnStyle(isDarkMode)}>
                  🧺 {lang === 'ne' ? 'टोकरीभित्र (Inside)' : 'Inside Basket'}
                </button>
                <button onClick={() => quickPlaceObject('outside_basket')} style={quickActionBtnStyle(isDarkMode)}>
                  🌿 {lang === 'ne' ? 'टोकरीबाहिर (Outside)' : 'Outside Basket'}
                </button>
                <button onClick={() => quickPlaceObject('inside_box')} style={quickActionBtnStyle(isDarkMode)}>
                  📦 {lang === 'ne' ? 'बाकसभित्र (Inside)' : 'Inside Box'}
                </button>
                <button onClick={() => quickPlaceObject('outside_box')} style={quickActionBtnStyle(isDarkMode)}>
                  🌱 {lang === 'ne' ? 'बाकसबाहिर (Outside)' : 'Outside Box'}
                </button>
                <button onClick={() => quickPlaceObject('above_table')} style={quickActionBtnStyle(isDarkMode)}>
                  🪵 {lang === 'ne' ? 'टेबलमाथि (Above)' : 'Above Table'}
                </button>
                <button onClick={() => quickPlaceObject('below_table')} style={quickActionBtnStyle(isDarkMode)}>
                  🪑 {lang === 'ne' ? 'टेबलमुनि (Below)' : 'Below Table'}
                </button>
                <button onClick={() => quickPlaceObject('above_tree')} style={quickActionBtnStyle(isDarkMode)}>
                  🌲 {lang === 'ne' ? 'रूखमाथि (Above)' : 'Above Tree'}
                </button>
                <button onClick={() => quickPlaceObject('below_tree')} style={quickActionBtnStyle(isDarkMode)}>
                  🍂 {lang === 'ne' ? 'रूखमुनि (Below)' : 'Below Tree'}
                </button>
              </div>
            </div>

            {/* ── SECTION 5: MODE 5 SPATIAL POSITION CHALLENGE ──────── */}
            {currentMode === 'MODE_5' && (
              <div
                style={{
                  background: isDarkMode ? '#1e293b' : '#eff6ff',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #bfdbfe',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>
                    🏆 {lang === 'ne' ? 'स्थान पहिचान चुनौती' : 'Spatial Quiz Challenge'}
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
                    ⭐ {quizScore} / {ASSESSMENT_QUESTIONS.length}
                  </span>
                </div>

                {!isQuizFinished ? (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      {lang === 'ne'
                        ? `प्रश्न ${quizIndex + 1} / ${ASSESSMENT_QUESTIONS.length}`
                        : `Question ${quizIndex + 1} of ${ASSESSMENT_QUESTIONS.length}`}
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: '800', lineHeight: '1.4' }}>
                      {lang === 'ne'
                        ? ASSESSMENT_QUESTIONS[quizIndex].questionNe
                        : ASSESSMENT_QUESTIONS[quizIndex].questionEn}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                      {ASSESSMENT_QUESTIONS[quizIndex].options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleQuizAnswer(opt.isCorrect, opt.explanationNe, opt.explanationEn)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: isDarkMode ? '#334155' : '#ffffff',
                            color: isDarkMode ? '#ffffff' : '#0f172a',
                            border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
                            fontSize: '13px',
                            fontWeight: '700',
                            textAlign: 'left',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }}
                        >
                          {lang === 'ne' ? opt.labelNe : opt.labelEn}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: '32px' }}>🎉</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px' }}>
                      {lang === 'ne' ? 'उत्कृष्ट नतिजा!' : 'Quiz Completed!'}
                    </div>
                    <p style={{ fontSize: '13px', color: isDarkMode ? '#cbd5e1' : '#475569', margin: '6px 0 14px 0' }}>
                      {lang === 'ne'
                        ? `तपाईंले ${ASSESSMENT_QUESTIONS.length} मा ${quizScore} अंक प्राप्त गर्नुभयो!`
                        : `You scored ${quizScore} out of ${ASSESSMENT_QUESTIONS.length}!`}
                    </p>
                    <button
                      onClick={() => {
                        setQuizIndex(0);
                        setQuizScore(0);
                        setIsQuizFinished(false);
                        AudioController.playClick();
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'फेरि अभ्यास गर्नुहोस्' : 'Restart Quiz'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Task Next / Prev Controls */}
            {currentMode !== 'MODE_5' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  disabled={taskIndex === 0}
                  onClick={() => {
                    setTaskIndex((prev) => Math.max(0, prev - 1));
                    AudioController.playClick();
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isDarkMode ? '#1e293b' : '#e2e8f0',
                    color: isDarkMode ? '#e2e8f0' : '#475569',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: taskIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: taskIndex === 0 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>{lang === 'ne' ? 'अघिल्लो' : 'Previous'}</span>
                </button>

                <button
                  disabled={taskIndex >= activeTaskList.length - 1}
                  onClick={() => {
                    setTaskIndex((prev) => Math.min(activeTaskList.length - 1, prev + 1));
                    AudioController.playClick();
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: taskIndex >= activeTaskList.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: taskIndex >= activeTaskList.length - 1 ? 0.5 : 1,
                  }}
                >
                  <span>{lang === 'ne' ? 'अर्को अभ्यास' : 'Next Task'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

// ── INLINE STYLING HELPERS ──────────────────────────────────────
function toolBtnStyle(isDark: boolean): React.CSSProperties {
  return {
    padding: '4px 8px',
    borderRadius: '6px',
    background: isDark ? '#1e293b' : '#f1f5f9',
    color: isDark ? '#e2e8f0' : '#334155',
    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
    fontSize: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}

function quickActionBtnStyle(isDark: boolean): React.CSSProperties {
  return {
    padding: '8px 10px',
    borderRadius: '8px',
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'background 0.12s',
  };
}
