/**
 * NumberLineFrog3D.tsx
 * Interactive Number Line & Counting Frog – 3D Edition (सङ्ख्या रेखा र भ्यागुताको उफ्राइ)
 * Class 1–5 Primary Mathematics · Nepal CDC Curriculum
 * 
 * Layout Architecture:
 * - 2-Column Professional Layout:
 *   - Left: Immersive 3D Simulation Stage (Canvas, camera tracking, river diorama, frog)
 *   - Right: Dedicated Activity & Control Sidebar (Position card, 6 learning modes, challenge HUD, controls, pedagogy rules)
 * - Upright high-contrast numerals on stepping stones
 * - Full touch, mouse, keyboard & Smart Board integration
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Monitor,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trophy,
  Plus,
  Minus,
  Footprints,
  Compass,
  ZoomIn,
  ZoomOut,
  ChevronsRight,
  ChevronsLeft,
} from 'lucide-react';
import { FrogAudio } from './FrogAudio';
import { launchOnSmartBoard } from '../../components/simulations/smartBoardLaunch';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
  embedded?: boolean;
}

// ── NUMERAL & WORD TABLES ──────────────────────────────────────────
const NEP_NUMS = ['०','१','२','३','४','५','६','७','८','९','१०','११','१२','१३','१४','१५','१६','१७','१८','१९','२०'];
const NEP_WORDS = [
  'शून्य','एक','दुई','तीन','चार','पाँच','छ','सात','आठ','नौ','दश',
  'एघार','बाह्र','तेह्र','चौध','पन्ध्र','सोह्र','सत्र','अठार','उन्नाइस','बीस'
];
const EN_WORDS = [
  'Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty'
];

type LearningMode = 'EXPLORE' | 'COUNTING' | 'ADDITION' | 'SUBTRACTION' | 'MISSING' | 'RECOGNIZE';

interface ChallengeState {
  promptEn: string;
  promptNp: string;
  targetNum: number;
  equationEn?: string;
  equationNp?: string;
  sequenceDisplay?: string;
  solved: boolean;
}

export const NumberLineFrog3D: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
  embedded = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 3D Objects refs
  const frogGroupRef = useRef<THREE.Group | null>(null);
  const stoneMeshesRef = useRef<THREE.Mesh[]>([]);
  const stoneTexturesRef = useRef<THREE.CanvasTexture[]>([]);
  const stoneGlowRingsRef = useRef<THREE.Mesh[]>([]);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // State
  const [currentPos, setCurrentPos] = useState<number>(5);
  const currentPosRef = useRef<number>(5);
  currentPosRef.current = currentPos;

  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      return localStorage.getItem('edu_frog_theme') === 'dark';
    } catch {
      return false;
    }
  });
  const isDarkRef = useRef<boolean>(isDarkTheme);
  isDarkRef.current = isDarkTheme;

  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<LearningMode>('EXPLORE');
  const [stars, setStars] = useState<number>(0);
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulation Area & Stage Resizing
  const [sidebarWidth, setSidebarWidth] = useState<number>(360);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const isResizingSplitterRef = useRef<boolean>(false);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // 3D Camera Orbit & Zoom State
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.8, 0));
  const cameraSphericalRef = useRef({ radius: 16.0, theta: 0, phi: 1.01 });
  const isOrbitingRef = useRef<boolean>(false);
  const orbitStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTopView, setIsTopView] = useState<boolean>(false);

  // Dragging & Interaction State
  const isDraggingRef = useRef<boolean>(false);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Jump Animation State
  const isJumpingRef = useRef<boolean>(false);
  const jumpStartPosRef = useRef<number>(5);
  const jumpTargetPosRef = useRef<number>(5);
  const jumpDurationRef = useRef<number>(0.45);
  const jumpStartTimeRef = useRef<number>(0);
  const isDoubleJumpRef = useRef<boolean>(false);

  const STEP = 2.4;
  const FROG_REST_Y = 0.44;

  const getXForNumber = useCallback((num: number) => {
    return (num - 10) * STEP;
  }, []);

  const triggerResize = useCallback(() => {
    if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
    const w = mountRef.current.clientWidth || 800;
    const h = mountRef.current.clientHeight || 500;
    cameraRef.current.aspect = w / h;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(w, h);
  }, []);

  const handleZoom = (delta: number) => {
    cameraSphericalRef.current.radius = Math.max(5.5, Math.min(38, cameraSphericalRef.current.radius + delta));
  };

  const handleRotateY = (delta: number) => {
    cameraSphericalRef.current.theta += delta;
  };

  const handleToggleView = () => {
    setIsTopView((prev) => {
      const next = !prev;
      if (next) {
        cameraSphericalRef.current.phi = 0.12;
        cameraSphericalRef.current.radius = 21;
        cameraSphericalRef.current.theta = 0;
      } else {
        cameraSphericalRef.current.phi = 1.01;
        cameraSphericalRef.current.radius = 16.0;
        cameraSphericalRef.current.theta = 0;
      }
      return next;
    });
  };

  const handleResetCamera = () => {
    setIsTopView(false);
    cameraSphericalRef.current.phi = 1.01;
    cameraSphericalRef.current.radius = 16.0;
    cameraSphericalRef.current.theta = 0;
    if (frogGroupRef.current) {
      cameraTargetRef.current.set(frogGroupRef.current.position.x * 0.85, 0.8, 0);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
    setTimeout(triggerResize, 230);
  };

  const setStagePreset = (preset: '70/30' | 'full') => {
    if (preset === 'full') {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
      setSidebarWidth(360);
    }
    setTimeout(triggerResize, 230);
  };

  const handleSplitterPointerDown = (e: React.PointerEvent) => {
    isResizingSplitterRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleSplitterPointerMove = (e: React.PointerEvent) => {
    if (!isResizingSplitterRef.current || !workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const newW = rect.right - e.clientX;
    if (newW >= 240 && newW <= Math.min(650, rect.width - 280)) {
      setIsSidebarCollapsed(false);
      setSidebarWidth(newW);
      triggerResize();
    }
  };

  const handleSplitterPointerUp = (e: React.PointerEvent) => {
    if (isResizingSplitterRef.current) {
      isResizingSplitterRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      triggerResize();
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    FrogAudio.setSoundEnabled(next);
  };

  const toggleTheme = () => {
    const next = !isDarkTheme;
    setIsDarkTheme(next);
    try {
      localStorage.setItem('edu_frog_theme', next ? 'dark' : 'light');
    } catch {}
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ── STEPPING STONE TEXTURE (UPRIGHT VIA 180 ROTATION) ──────────────
  const createStoneCanvasTexture = (num: number, isDark: boolean, isSelected: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Rotate -90 degrees so top of cylinder faces viewer upright
    ctx.translate(128, 128);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-128, -128);

    const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 122);
    if (isSelected) {
      grad.addColorStop(0, '#fef9c3');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, '#b45309');
    } else if (isDark) {
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.4, '#1e3a8a');
      grad.addColorStop(1, '#0f172a');
    } else {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#e2e8f0');
      grad.addColorStop(1, '#94a3b8');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = isSelected ? 12 : 7;
    ctx.strokeStyle = isSelected ? '#ffffff' : (isDark ? '#38bdf8' : '#cbd5e1');
    ctx.stroke();

    // Nepali Numeral (top)
    ctx.fillStyle = isSelected ? '#78350f' : (isDark ? '#f8fafc' : '#0f172a');
    ctx.font = 'bold 84px Mukta, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(NEP_NUMS[num], 128, 88);

    // Divider
    ctx.beginPath();
    ctx.moveTo(64, 140);
    ctx.lineTo(192, 140);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = isSelected ? 'rgba(120, 53, 15, 0.4)' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.18)');
    ctx.stroke();

    // English Numeral (bottom)
    ctx.font = 'bold 68px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(num.toString(), 128, 186);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  const updateStoneVisuals = useCallback(() => {
    const isDark = isDarkRef.current;
    const active = currentPosRef.current;

    stoneMeshesRef.current.forEach((mesh, idx) => {
      const isSelected = idx === active;
      const oldTex = stoneTexturesRef.current[idx];
      if (oldTex) oldTex.dispose();

      const newTex = createStoneCanvasTexture(idx, isDark, isSelected);
      stoneTexturesRef.current[idx] = newTex;

      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.map = newTex;
      mat.needsUpdate = true;

      mesh.position.y = isSelected ? 0.28 : 0.15;
      if (stoneGlowRingsRef.current[idx]) {
        stoneGlowRingsRef.current[idx].visible = isSelected;
      }
    });
  }, []);

  const jumpTo = useCallback((target: number, isDouble: boolean = false) => {
    const clamped = Math.max(0, Math.min(20, target));
    const start = currentPosRef.current;
    if (clamped === start && !isJumpingRef.current) return;

    FrogAudio.playHop(clamped);

    jumpStartPosRef.current = start;
    jumpTargetPosRef.current = clamped;
    jumpStartTimeRef.current = performance.now();
    isDoubleJumpRef.current = isDouble;

    const dist = Math.abs(clamped - start);
    jumpDurationRef.current = Math.min(0.85, Math.max(0.38, 0.32 + dist * 0.08));
    isJumpingRef.current = true;

    if (frogGroupRef.current) {
      frogGroupRef.current.rotation.y = clamped >= start ? 0 : Math.PI;
    }

    setCurrentPos(clamped);
    FrogAudio.speak(`${EN_WORDS[clamped]}`, 'en-US');
  }, []);

  const triggerToast = useCallback((msg: string) => {
    FrogAudio.playCelebration();
    setStars((s) => s + 1);
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // ── CHALLENGE GENERATION ──────────────────────────────────────────
  const generateChallenge = useCallback((mode: LearningMode) => {
    if (mode === 'EXPLORE') {
      setChallenge(null);
      return;
    }

    if (mode === 'COUNTING') {
      const target = Math.floor(Math.random() * 14) + 6;
      jumpTo(0);
      setChallenge({
        promptEn: `Goal: Reach number ${target}! Hop step-by-step to reach it.`,
        promptNp: `भ्यागुतालाई एक-एक पाइला उफ्रिएर ${NEP_NUMS[target]} (${NEP_WORDS[target]}) सम्म पुर्‍याउनुहोस् ।`,
        targetNum: target,
        solved: false,
      });
    } else if (mode === 'ADDITION') {
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 6) + 2;
      const sum = a + b;
      jumpTo(a);
      setChallenge({
        promptEn: `Question: ${a} + ${b} = ? Start at ${a} and jump forward ${b} steps!`,
        promptNp: `जोड खेल: ${NEP_NUMS[a]} + ${NEP_NUMS[b]} = ? भ्यागुतालाई ${NEP_NUMS[b]} पाइला अगाडि लैजानुहोस् ।`,
        targetNum: sum,
        equationEn: `${a} + ${b} = ${sum}`,
        equationNp: `${NEP_NUMS[a]} + ${NEP_NUMS[b]} = ${NEP_NUMS[sum]}`,
        solved: false,
      });
    } else if (mode === 'SUBTRACTION') {
      const a = Math.floor(Math.random() * 10) + 8;
      const b = Math.floor(Math.random() * 6) + 2;
      const diff = a - b;
      jumpTo(a);
      setChallenge({
        promptEn: `Question: ${a} − ${b} = ? Start at ${a} and jump backward ${b} steps!`,
        promptNp: `घटाउ खेल: ${NEP_NUMS[a]} − ${NEP_NUMS[b]} = ? भ्यागुतालाई ${NEP_NUMS[b]} पाइला पछाडि लैजानुहोस् ।`,
        targetNum: diff,
        equationEn: `${a} − ${b} = ${diff}`,
        equationNp: `${NEP_NUMS[a]} − ${NEP_NUMS[b]} = ${NEP_NUMS[diff]}`,
        solved: false,
      });
    } else if (mode === 'MISSING') {
      const start = Math.floor(Math.random() * 15) + 1;
      const missing = start + 2;
      jumpTo(start);
      setChallenge({
        promptEn: `Sequence: ${start}, ${start + 1}, [ ? ], ${start + 3}`,
        promptNp: `क्रममा हराएको सङ्ख्या पत्ता लगाउनुहोस्: ${NEP_NUMS[start]}, ${NEP_NUMS[start + 1]}, [ ? ], ${NEP_NUMS[start + 3]}`,
        targetNum: missing,
        sequenceDisplay: `${start}, ${start + 1}, __, ${start + 3}`,
        solved: false,
      });
    } else if (mode === 'RECOGNIZE') {
      const target = Math.floor(Math.random() * 21);
      setChallenge({
        promptEn: `Find number ${target} (${NEP_NUMS[target]} - ${NEP_WORDS[target]})!`,
        promptNp: `सङ्ख्या रेखामा ${NEP_NUMS[target]} (${NEP_WORDS[target]}) पत्ता लगाउनुहोस् ।`,
        targetNum: target,
        solved: false,
      });
    }
  }, [jumpTo]);

  const handleSelectMode = (mode: LearningMode) => {
    setActiveMode(mode);
    generateChallenge(mode);
  };

  useEffect(() => {
    if (!challenge || challenge.solved || activeMode === 'EXPLORE') return;
    if (currentPos === challenge.targetNum) {
      setChallenge((c) => (c ? { ...c, solved: true } : null));
      const msg = challenge.equationEn
        ? `⭐ Syabas! ${challenge.equationEn} (${challenge.equationNp})`
        : `⭐ Syabas! Landed on ${currentPos} (${NEP_NUMS[currentPos]} - ${NEP_WORDS[currentPos]})!`;
      triggerToast(msg);
    }
  }, [currentPos, challenge, activeMode, triggerToast]);

  // ── THREE.JS SCENE SETUP ──────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 9.2, 13.5);
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    scene.background = new THREE.Color(isDarkRef.current ? 0x0f172a : 0xdbeafe);
    scene.fog = new THREE.FogExp2(isDarkRef.current ? 0x0f172a : 0xdbeafe, 0.016);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdcfce7, 0.85);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.35);
    dirLight.position.set(14, 24, 16);
    dirLight.castShadow = true;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Ground
    const groundGeo = new THREE.PlaneGeometry(84, 44, 32, 16);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x48bb78, roughness: 0.85 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.22;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Meandering Stream
    const streamGeo = new THREE.BoxGeometry(STEP * 21 + 6, 0.2, 5.2);
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    const stream = new THREE.Mesh(streamGeo, streamMat);
    stream.position.set(0, -0.05, 0);
    stream.receiveShadow = true;
    scene.add(stream);

    const bankEdgeMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.9 });
    const bankNorth = new THREE.Mesh(new THREE.BoxGeometry(STEP * 21 + 8, 0.22, 0.6), bankEdgeMat);
    bankNorth.position.set(0, 0.02, -2.6); scene.add(bankNorth);
    const bankSouth = new THREE.Mesh(new THREE.BoxGeometry(STEP * 21 + 8, 0.22, 0.6), bankEdgeMat);
    bankSouth.position.set(0, 0.02, 2.6); scene.add(bankSouth);

    // 21 Stepping Stones
    stoneMeshesRef.current = [];
    stoneTexturesRef.current = [];
    stoneGlowRingsRef.current = [];

    const stoneGeo = new THREE.CylinderGeometry(0.92, 1.02, 0.26, 32);
    const ringGeo = new THREE.RingGeometry(1.05, 1.25, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });

    for (let i = 0; i <= 20; i++) {
      const isSelected = i === currentPosRef.current;
      const tex = createStoneCanvasTexture(i, isDarkRef.current, isSelected);
      stoneTexturesRef.current.push(tex);

      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.45,
        metalness: 0.05,
      });

      const mesh = new THREE.Mesh(stoneGeo, mat);
      mesh.position.set(getXForNumber(i), isSelected ? 0.28 : 0.15, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { stoneIndex: i };
      scene.add(mesh);
      stoneMeshesRef.current.push(mesh);

      const glowRing = new THREE.Mesh(ringGeo, ringMat);
      glowRing.rotation.x = -Math.PI / 2;
      glowRing.position.set(getXForNumber(i), 0.16, 0);
      glowRing.visible = isSelected;
      scene.add(glowRing);
      stoneGlowRingsRef.current.push(glowRing);
    }

    // 3D Frog Character
    const frogGroup = new THREE.Group();
    frogGroupRef.current = frogGroup;
    scene.add(frogGroup);
    frogGroup.position.set(getXForNumber(currentPosRef.current), FROG_REST_Y, 0);

    const frogMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.32 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.45 });

    const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.72, 28, 24), frogMat);
    bodyMesh.scale.set(1.15, 0.94, 1.05); bodyMesh.position.y = 0.52; bodyMesh.castShadow = true;
    frogGroup.add(bodyMesh);

    const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 18), bellyMat);
    bellyMesh.scale.set(0.95, 0.82, 0.38); bellyMesh.position.set(0, 0.44, 0.52);
    frogGroup.add(bellyMesh);

    const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const specMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), eyeWhite);
    leftEye.position.set(-0.38, 1.12, 0.24); leftEye.castShadow = true; frogGroup.add(leftEye);
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), pupilMat);
    leftPupil.position.set(-0.38, 1.12, 0.45); frogGroup.add(leftPupil);
    const leftSpec = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), specMat);
    leftSpec.position.set(-0.34, 1.20, 0.55); frogGroup.add(leftSpec);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), eyeWhite);
    rightEye.position.set(0.38, 1.12, 0.24); rightEye.castShadow = true; frogGroup.add(rightEye);
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), pupilMat);
    rightPupil.position.set(0.38, 1.12, 0.45); frogGroup.add(rightPupil);
    const rightSpec = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), specMat);
    rightSpec.position.set(0.42, 1.20, 0.55); frogGroup.add(rightSpec);

    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.65 });
    const leftCheek = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), cheekMat);
    leftCheek.position.set(-0.46, 0.65, 0.64); leftCheek.rotation.y = -0.3; frogGroup.add(leftCheek);
    const rightCheek = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), cheekMat);
    rightCheek.position.set(0.46, 0.65, 0.64); rightCheek.rotation.y = 0.3; frogGroup.add(rightCheek);

    const smileMesh = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 24, Math.PI * 0.8), new THREE.MeshBasicMaterial({ color: 0x064e3b }));
    smileMesh.position.set(0, 0.62, 0.68); smileMesh.rotation.z = Math.PI * 1.1;
    frogGroup.add(smileMesh);

    const handGeo = new THREE.SphereGeometry(0.16, 14, 12); handGeo.scale(1.2, 0.45, 1.4);
    const leftHand = new THREE.Mesh(handGeo, frogMat);
    leftHand.position.set(-0.52, 0.12, 0.52); leftHand.castShadow = true; frogGroup.add(leftHand);
    const rightHand = new THREE.Mesh(handGeo, frogMat);
    rightHand.position.set(0.52, 0.12, 0.52); rightHand.castShadow = true; frogGroup.add(rightHand);

    const thighGeo = new THREE.SphereGeometry(0.38, 16, 14); thighGeo.scale(0.8, 1.1, 1.2);
    const leftThigh = new THREE.Mesh(thighGeo, frogMat);
    leftThigh.position.set(-0.72, 0.38, -0.12); leftThigh.rotation.z = 0.35; leftThigh.castShadow = true; frogGroup.add(leftThigh);
    const rightThigh = new THREE.Mesh(thighGeo, frogMat);
    rightThigh.position.set(0.72, 0.38, -0.12); rightThigh.rotation.z = -0.35; rightThigh.castShadow = true; frogGroup.add(rightThigh);

    // Background Trees
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const leafMats = [
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.65 }),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65 }),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 }),
    ];

    [-24, -18, -11, -4, 4, 11, 18, 24].forEach((tx, i) => {
      const tree = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 2.8, 10), trunkMat);
      tr.position.y = 1.3; tr.castShadow = true; tree.add(tr);

      const mat = leafMats[i % leafMats.length];
      const mainCanopy = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 14), mat);
      mainCanopy.position.y = 3.6; mainCanopy.castShadow = true; tree.add(mainCanopy);

      const sub1 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 10), mat);
      sub1.position.set(-0.8, 3.2, 0.3); sub1.castShadow = true; tree.add(sub1);
      const sub2 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 10), mat);
      sub2.position.set(0.8, 3.1, -0.2); sub2.castShadow = true; tree.add(sub2);

      tree.position.set(tx, 0, -8 - (i % 2) * 2.5); scene.add(tree);
    });

    // ── ANIMATION LOOP WITH 3D ORBIT, ZOOM & TRACKING ──────────────
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Horizontal camera tracking & spherical orbit positioning
      if (cameraRef.current && frogGroupRef.current) {
        const targetCamX = frogGroupRef.current.position.x * 0.85;
        cameraTargetRef.current.x += (targetCamX - cameraTargetRef.current.x) * 0.08;

        const sp = cameraSphericalRef.current;
        const sinPhi = Math.sin(sp.phi);
        const cosPhi = Math.cos(sp.phi);
        const sinTheta = Math.sin(sp.theta);
        const cosTheta = Math.cos(sp.theta);

        const targetX = cameraTargetRef.current.x + sp.radius * sinPhi * sinTheta;
        const targetY = cameraTargetRef.current.y + sp.radius * cosPhi;
        const targetZ = cameraTargetRef.current.z + sp.radius * sinPhi * cosTheta;

        cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.16;
        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.16;
        cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.16;
        cameraRef.current.lookAt(cameraTargetRef.current.x, cameraTargetRef.current.y, cameraTargetRef.current.z);
      }

      if (frogGroupRef.current) {
        const frog = frogGroupRef.current;

        if (isJumpingRef.current) {
          const now = performance.now();
          const elapsedSec = (now - jumpStartTimeRef.current) / 1000;
          let progress = elapsedSec / jumpDurationRef.current;

          if (progress >= 1) {
            progress = 1;
            isJumpingRef.current = false;
            frog.scale.set(1.22, 0.72, 1.22);
          }

          const startX = getXForNumber(jumpStartPosRef.current);
          const targetX = getXForNumber(jumpTargetPosRef.current);
          const dist = Math.abs(jumpTargetPosRef.current - jumpStartPosRef.current);
          const peakHeight = isDoubleJumpRef.current ? 2.5 : Math.min(2.8, 1.2 + Math.sqrt(dist) * 0.55);

          frog.position.x = startX + (targetX - startX) * progress;
          frog.position.y = FROG_REST_Y + 4 * peakHeight * progress * (1 - progress);
          frog.rotation.z = Math.sin(progress * Math.PI) * (targetX >= startX ? -0.22 : 0.22);

          const stretch = 1 + Math.sin(progress * Math.PI) * 0.25;
          frog.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
        } else if (!isDraggingRef.current) {
          frog.position.y = FROG_REST_Y + Math.sin(elapsedTime * 2.8) * 0.04;
          frog.scale.x += (1 - frog.scale.x) * 0.12;
          frog.scale.y += (1 - frog.scale.y) * 0.12;
          frog.scale.z += (1 - frog.scale.z) * 0.12;
          frog.rotation.z += (0 - frog.rotation.z) * 0.12;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const ro = new ResizeObserver(() => {
      handleResize();
    });
    ro.observe(container);

    return () => {
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      container.replaceChildren();
    };
  }, [getXForNumber]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const isDark = isDarkTheme;
    const scene = sceneRef.current;

    scene.background = new THREE.Color(isDark ? 0x0f172a : 0xdbeafe);
    if (scene.fog) scene.fog.color.setHex(isDark ? 0x0f172a : 0xdbeafe);
    if (dirLightRef.current) {
      dirLightRef.current.color.setHex(isDark ? 0x7dd3fc : 0xfffaed);
      dirLightRef.current.intensity = isDark ? 0.8 : 1.35;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(isDark ? 0x334155 : 0xffffff);
      hemiLightRef.current.groundColor.setHex(isDark ? 0x0f172a : 0xdcfce7);
    }
    updateStoneVisuals();
  }, [isDarkTheme, updateStoneVisuals]);

  useEffect(() => {
    updateStoneVisuals();
  }, [currentPos, updateStoneVisuals]);

  // Click, Drag, 360 Orbit & Zoom Pointer Listeners
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!container || !cameraRef.current || isJumpingRef.current) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      if (frogGroupRef.current) {
        const frogHits = raycasterRef.current.intersectObjects(frogGroupRef.current.children, true);
        if (frogHits.length > 0) {
          isDraggingRef.current = true;
          FrogAudio.playClick();
          return;
        }
      }

      const stoneHits = raycasterRef.current.intersectObjects(stoneMeshesRef.current);
      if (stoneHits.length > 0) {
        const clickedIndex = stoneHits[0].object.userData.stoneIndex;
        if (typeof clickedIndex === 'number' && clickedIndex !== currentPosRef.current) {
          jumpTo(clickedIndex);
          return;
        }
      }

      // Dragging on background/river freely orbits camera in 3D
      isOrbitingRef.current = true;
      orbitStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current && frogGroupRef.current && container && cameraRef.current) {
        const rect = container.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

        const intersectionPoint = new THREE.Vector3();
        if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectionPoint)) {
          const minX = getXForNumber(0);
          const maxX = getXForNumber(20);
          const clampedX = Math.max(minX, Math.min(maxX, intersectionPoint.x));
          frogGroupRef.current.position.x = clampedX;
          frogGroupRef.current.position.y = FROG_REST_Y + 0.35;
        }
      } else if (isOrbitingRef.current) {
        const dx = e.clientX - orbitStartRef.current.x;
        const dy = e.clientY - orbitStartRef.current.y;
        orbitStartRef.current = { x: e.clientX, y: e.clientY };

        cameraSphericalRef.current.theta -= dx * 0.007;
        cameraSphericalRef.current.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi - dy * 0.007));
      }
    };

    const onPointerUp = () => {
      if (isDraggingRef.current && frogGroupRef.current) {
        isDraggingRef.current = false;
        const nearestNum = Math.round((frogGroupRef.current.position.x / STEP) + 10);
        const clamped = Math.max(0, Math.min(20, nearestNum));
        jumpTo(clamped);
      }
      isOrbitingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(5.5, Math.min(38, cameraSphericalRef.current.radius + e.deltaY * 0.015));
    };

    let touchPinchDist: number | null = null;
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (touchPinchDist !== null) {
          const diff = touchPinchDist - dist;
          cameraSphericalRef.current.radius = Math.max(5.5, Math.min(38, cameraSphericalRef.current.radius + diff * 0.04));
        }
        touchPinchDist = dist;
      }
    };
    const onTouchEnd = () => { touchPinchDist = null; };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [getXForNumber, jumpTo]);

  const handleStep = (delta: number) => {
    if (isJumpingRef.current) return;
    const next = Math.max(0, Math.min(20, currentPos + delta));
    jumpTo(next, delta === 2);
  };

  const handleReset = () => {
    if (isJumpingRef.current) return;
    FrogAudio.playClick();
    jumpTo(0);
  };

  const handleLaunchSmartBoard = () => {
    launchOnSmartBoard('SIM-MATH-G1-NUMBERLINE', 'Number Line & Counting Frog');
  };

  const themeColors = useMemo(() => {
    if (isDarkTheme) {
      return {
        bg: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        text: '#f8fafc',
        subtext: '#94a3b8',
        primary: '#10b981',
        primaryLight: 'rgba(16, 185, 129, 0.15)',
        secondary: '#38bdf8',
        orange: '#f97316',
        shadowSm: '0 2px 8px rgba(0, 0, 0, 0.4)',
      };
    }
    return {
      bg: '#f1f5f9',
      surface: '#ffffff',
      border: '#e2e8f0',
      text: '#0f172a',
      subtext: '#475569',
      primary: '#059669',
      primaryLight: '#ecfdf5',
      secondary: '#0284c7',
      orange: '#ea580c',
      shadowSm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    };
  }, [isDarkTheme]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        background: themeColors.bg,
        color: themeColors.text,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header
        style={{
          height: '52px',
          padding: '0 18px',
          background: themeColors.surface,
          borderBottom: `1px solid ${themeColors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!embedded && (
            <button
              onClick={onBackToLibrary}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                background: isDarkTheme ? '#334155' : '#f1f5f9',
                color: themeColors.text,
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              <span>Library</span>
            </button>
          )}

          <span
            style={{
              background: themeColors.primaryLight,
              color: themeColors.primary,
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            Class 1–5 • CDC Nepal
          </span>

          <div style={{ fontSize: '14.5px', fontWeight: '800' }}>
            Number Line 3D
            <span style={{ fontSize: '13px', color: themeColors.primary, marginLeft: '6px' }}>
              (सङ्ख्या रेखा र भ्यागुताको उफ्राइ 🐸)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Stars */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '8px',
              background: isDarkTheme ? '#334155' : '#fef3c7',
              color: isDarkTheme ? '#fde047' : '#b45309',
              fontWeight: '800',
              fontSize: '12px',
            }}
          >
            <Trophy size={14} />
            <span>{stars} Stars</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: `1px solid ${themeColors.border}`,
              background: themeColors.surface,
              color: themeColors.text,
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {isDarkTheme ? <Moon size={14} color="#38bdf8" /> : <Sun size={14} color="#f59e0b" />}
            <span>{isDarkTheme ? '☾ Dark' : '☀ Light'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: `1px solid ${themeColors.border}`,
              background: themeColors.surface,
              color: themeColors.text,
              cursor: 'pointer',
            }}
            title={soundOn ? 'Sound On' : 'Muted'}
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Smart Board */}
          {!embedded && (
            <button
              onClick={handleLaunchSmartBoard}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              <Monitor size={14} />
              <span>Smart Board</span>
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '5px 8px',
              borderRadius: '8px',
              border: `1px solid ${themeColors.border}`,
              background: themeColors.surface,
              color: themeColors.text,
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* ── 2-COLUMN MAIN WORKSPACE WITH RESIZABLE SPLITTER ─── */}
      <div
        ref={workspaceRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          gap: 0,
          padding: '12px',
          overflow: 'hidden',
          height: 'calc(100% - 52px)',
          position: 'relative',
        }}
      >
        {/* LEFT COLUMN: 3D SIMULATION STAGE */}
        <div
          style={{
            flex: '1 1 0%',
            minWidth: '300px',
            background: themeColors.surface,
            border: `1px solid ${themeColors.border}`,
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' }} />

          {/* Simulation Stage HUD: Unobtrusive View & Stage Controls */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 20,
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: isDarkTheme ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '8px',
                padding: '3px 6px',
                boxShadow: themeColors.shadowSm,
              }}
            >
              <button
                onClick={toggleSidebar}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: themeColors.text,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Toggle Full Stage Width"
              >
                {isSidebarCollapsed ? <ChevronsLeft size={13} /> : <Maximize2 size={13} />}
                <span>{isSidebarCollapsed ? 'Show Sidebar' : 'Expand Stage'}</span>
              </button>
              <div style={{ width: '1px', height: '14px', background: themeColors.border, margin: '0 2px' }} />
              <button
                onClick={handleToggleView}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  background: isTopView ? themeColors.primaryLight : 'transparent',
                  color: isTopView ? themeColors.primary : themeColors.text,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                title="Toggle Top / 3D Perspective"
              >
                <Compass size={13} />
                <span>{isTopView ? '3D' : 'Top View'}</span>
              </button>
              <button
                onClick={handleResetCamera}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: themeColors.text,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                title="Reset Camera View"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Success Toast */}
          {toastMessage && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: '999px',
                fontSize: '13.5px',
                fontWeight: '800',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                zIndex: 50,
              }}
            >
              {toastMessage}
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: isDarkTheme ? 'rgba(30, 41, 59, 0.88)' : 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              color: isDarkTheme ? '#cbd5e1' : '#334155',
              border: `1px solid ${themeColors.border}`,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            💡 Mouse: Scroll wheel to Zoom · Drag ground to Rotate 360° · Tap stones to hop
          </div>
        </div>

        {/* Draggable Splitter Divider */}
        <div
          onPointerDown={handleSplitterPointerDown}
          onPointerMove={handleSplitterPointerMove}
          onPointerUp={handleSplitterPointerUp}
          style={{
            width: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'col-resize',
            userSelect: 'none',
            position: 'relative',
            zIndex: 15,
            padding: '0 2px',
            flexShrink: 0,
          }}
          title="Drag left/right to increase/decrease simulation area width"
        >
          <div
            style={{
              width: '4px',
              height: '48px',
              background: themeColors.border,
              borderRadius: '4px',
            }}
          />
        </div>

        {/* RIGHT COLUMN: DEDICATED ACTIVITY & CONTROL SIDEBAR */}
        <aside
          style={{
            width: isSidebarCollapsed ? 0 : `${sidebarWidth}px`,
            minWidth: isSidebarCollapsed ? 0 : '260px',
            maxWidth: '650px',
            flexShrink: 0,
            background: themeColors.surface,
            border: isSidebarCollapsed ? 'none' : `1px solid ${themeColors.border}`,
            borderRadius: '16px',
            padding: isSidebarCollapsed ? 0 : '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
            overflowX: 'hidden',
            opacity: isSidebarCollapsed ? 0 : 1,
            pointerEvents: isSidebarCollapsed ? 'none' : 'auto',
            transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, padding 0.2s ease',
          }}
        >
          {/* 1. Current Position Card */}
          <div
            style={{
              background: themeColors.bg,
              border: `1.5px solid ${themeColors.border}`,
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                background: themeColors.primaryLight,
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '22px', fontWeight: '900', color: themeColors.primary, lineHeight: 1 }}>{currentPos}</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#f59e0b', lineHeight: 1 }}>{NEP_NUMS[currentPos]}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: themeColors.subtext, textTransform: 'uppercase' }}>
                Current Position (हालको स्थान)
              </span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: themeColors.text }}>{EN_WORDS[currentPos]}</span>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: themeColors.primary }}>{NEP_WORDS[currentPos]}</span>
            </div>
          </div>

          {/* 2. Learning Modes Grid */}
          <div style={{ fontSize: '11px', fontWeight: '800', color: themeColors.subtext, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Learning Modes (सिक्ने मोडहरू)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[
              { id: 'EXPLORE', label: '🐸 1. Free Play' },
              { id: 'COUNTING', label: '🎯 2. Counting' },
              { id: 'ADDITION', label: '➕ 3. Addition' },
              { id: 'SUBTRACTION', label: '➖ 4. Subtraction' },
              { id: 'MISSING', label: '🧩 5. Missing' },
              { id: 'RECOGNIZE', label: '🔍 6. Recognize' },
            ].map((tab) => {
              const isActive = activeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectMode(tab.id as LearningMode)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? themeColors.primary : themeColors.border}`,
                    background: isActive ? themeColors.primary : themeColors.surface,
                    color: isActive ? '#ffffff' : themeColors.text,
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 3. Challenge / Activity Card */}
          <div
            style={{
              background: themeColors.bg,
              border: `1.5px solid ${themeColors.border}`,
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: themeColors.primary,
                  background: themeColors.primaryLight,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {activeMode === 'EXPLORE' ? 'FREE EXPLORATION' : activeMode}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#f59e0b' }}>⭐ {stars}</span>
            </div>

            <div style={{ fontSize: '13.5px', fontWeight: '800', color: themeColors.text, lineHeight: 1.35 }}>
              {challenge ? challenge.promptEn : 'Hop anywhere from ० to २०!'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: themeColors.primary, lineHeight: 1.3 }}>
              {challenge ? challenge.promptNp : 'अगाडि वा पछाडि उफ्रिएर सङ्ख्याहरू सिक्नुहोस् ।'}
            </div>

            {challenge?.sequenceDisplay && (
              <div style={{ fontSize: '15px', fontWeight: '900', color: '#f59e0b', marginTop: '2px' }}>
                {challenge.sequenceDisplay}
              </div>
            )}

            {activeMode !== 'EXPLORE' && (
              <button
                onClick={() => generateChallenge(activeMode)}
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  height: '36px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '4px',
                }}
              >
                <Sparkles size={14} />
                <span>अर्को प्रश्न (Next Question)</span>
              </button>
            )}
          </div>

          {/* 4. Movement Action Buttons */}
          <div style={{ fontSize: '11px', fontWeight: '800', color: themeColors.subtext, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Controls (चाल नियन्त्रण)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleStep(-1)}
              style={{
                height: '44px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '800',
                color: '#ffffff',
                background: themeColors.orange,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(234, 88, 12, 0.25)',
              }}
            >
              <Minus size={15} />
              <span>पछाडि (-1)</span>
            </button>

            <button
              onClick={() => handleStep(1)}
              style={{
                height: '44px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '800',
                color: '#ffffff',
                background: themeColors.primary,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(16, 185, 129, 0.25)',
              }}
            >
              <Plus size={15} />
              <span>अगाडि (+1)</span>
            </button>

            <button
              onClick={() => handleStep(2)}
              style={{
                height: '44px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '800',
                color: '#ffffff',
                background: themeColors.secondary,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(2, 132, 199, 0.25)',
              }}
            >
              <Footprints size={15} />
              <span>Jump +2</span>
            </button>

            <button
              onClick={handleReset}
              style={{
                height: '44px',
                borderRadius: '10px',
                border: `1px solid ${themeColors.border}`,
                fontSize: '12px',
                fontWeight: '700',
                color: themeColors.subtext,
                background: themeColors.surface,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              <span>0 (सुरु)</span>
            </button>
          </div>

          {/* 5. Pedagogical Rule Card */}
          <div
            style={{
              background: themeColors.surface,
              border: `1px dashed ${themeColors.border}`,
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '11.5px',
              lineHeight: 1.45,
              color: themeColors.subtext,
              marginTop: 'auto',
            }}
          >
            <strong style={{ color: themeColors.text }}>💡 सङ्ख्या रेखाको नियम:</strong><br />
            दायाँ जाँदा सङ्ख्या बढ्छ <strong>(जोड +)</strong>, बायाँ जाँदा सङ्ख्या घट्छ <strong>(घटाउ -)</strong> ।
          </div>
        </aside>
      </div>
    </div>
  );
};
