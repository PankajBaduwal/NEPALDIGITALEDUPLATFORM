import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw,
  Move,
  Eye,
  Volume2,
  VolumeX,
  Sparkles,
  Lightbulb,
  X,
} from 'lucide-react';

export interface VirtualLab3DCanvasProps {
  currentStage: 'weigh' | 'sublime' | 'filter' | 'evaporate';
  isTared: boolean;
  isWeighed: boolean;
  isBurnerOn: boolean;
  isSublimationDone: boolean;
  isFiltrationDone: boolean;
  isEvaporating: boolean;
  isEvaporationDone: boolean;
  onTare: () => void;
  onWeigh: () => void;
  onSublime: () => void;
  onFilter: () => void;
  onEvaporate: () => void;
  isDarkMode?: boolean;
}

export const VirtualLab3DCanvas: React.FC<VirtualLab3DCanvasProps> = ({
  currentStage,
  isTared,
  isWeighed,
  isBurnerOn,
  isSublimationDone,
  isFiltrationDone,
  isEvaporating,
  isEvaporationDone,
  onTare,
  onWeigh,
  onSublime,
  onFilter,
  onEvaporate,
  isDarkMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlMode, setControlMode] = useState<'drag' | 'orbit'>('drag');
  const [selectedObjectName, setSelectedObjectName] = useState<string | null>(null);
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // References to keep Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Object group references for movement & animation
  const objectsRef = useRef<{ [key: string]: THREE.Group | THREE.Mesh }>({});
  const flameLightRef = useRef<THREE.PointLight | null>(null);
  const vaporParticlesRef = useRef<THREE.Points | null>(null);

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const draggedObjectRef = useRef<THREE.Object3D | null>(null);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const dragOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // ─────────────────────────────────────────────────────────────────────────────
  // TEXT-TO-SPEECH (EASY UNDERSTANDABLE INSTRUCTIONS)
  // ─────────────────────────────────────────────────────────────────────────────
  const speakInstruction = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Get current step instructions in simple English
  const getStepGuide = () => {
    switch (currentStage) {
      case 'weigh':
        if (!isTared) {
          return {
            title: 'Step 1A: Place & Tare Weighing Boat',
            instruction: 'Click and drag the plastic weighing boat onto the electronic balance pan, then press "Tare Balance" to zero out its weight.',
            tip: 'Taring cancels the container mass so we measure only our chemical mixture.',
            actionLabel: isTared ? 'Balance Tared (0.00 g)' : 'Tare Balance (0.00 g)',
            onAction: onTare,
            actionDisabled: isTared,
          };
        }
        return {
          title: 'Step 1B: Weigh Exactly 10.00 g Mixture',
          instruction: 'Click "Add 10.00 g Mixture" to load the ternary mixture of sand, salt, and ammonium chloride into the weighing boat.',
          tip: 'An accurate starting mass is essential to calculate individual percentage recovery.',
          actionLabel: isWeighed ? 'Sample Weighed (10.00 g)' : 'Add 10.00 g Mixture',
          onAction: onWeigh,
          actionDisabled: isWeighed,
        };
      case 'sublime':
        return {
          title: 'Step 2: Sublimation of Ammonium Chloride',
          instruction: 'Drag the china dish with mixture onto the tripod stand. Cover it with the inverted funnel plugged with cotton, then ignite the burner.',
          tip: 'Ammonium chloride sublimes directly from solid to gas, condensing as a white crust on the cool funnel.',
          actionLabel: isBurnerOn ? 'Subliming NH₄Cl...' : isSublimationDone ? 'Sublimation Complete (2.50 g)' : 'Ignite Burner & Sublime NH₄Cl',
          onAction: onSublime,
          actionDisabled: isBurnerOn || isSublimationDone,
        };
      case 'filter':
        return {
          title: 'Step 3: Dissolution & Gravity Filtration',
          instruction: 'Add 30 mL distilled water to dissolve the salt. Drag the beaker to pour the slurry through the folded filter paper.',
          tip: 'Insoluble sand stays on filter paper as residue; soluble salt passes through as clear liquid filtrate.',
          actionLabel: isFiltrationDone ? 'Filtration Complete (4.50 g Sand)' : 'Add Water & Filter Sand',
          onAction: onFilter,
          actionDisabled: isFiltrationDone,
        };
      case 'evaporate':
        return {
          title: 'Step 4: Evaporate Filtrate to Recover Pure Salt',
          instruction: 'Transfer clear salt solution into the clean evaporating dish and heat over the burner until water boils away completely.',
          tip: 'Water evaporates into steam, leaving behind sparkling white sodium chloride crystals.',
          actionLabel: isEvaporating ? 'Boiling & Evaporating Water...' : isEvaporationDone ? 'Salt Crystals Recovered (3.00 g)' : 'Evaporate & Crystallize NaCl',
          onAction: onEvaporate,
          actionDisabled: isEvaporating || isEvaporationDone,
        };
    }
  };

  const guide = getStepGuide();

  // ─────────────────────────────────────────────────────────────────────────────
  // THREE.JS SCENE SETUP & RENDER LOOP
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDarkMode ? 0x070e17 : 0xe2e8f0);

    // 2. Camera (Framed dynamically to show full 3D bench prominently)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5.6, 9.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.35, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below table
    controls.minDistance = 3.5;
    controls.maxDistance = 22;
    controls.enabled = controlMode === 'orbit';
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(isDarkMode ? 0x88aacc : 0xffffff, isDarkMode ? 0.9 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDarkMode ? 1.4 : 1.6);
    dirLight.position.set(5, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(isDarkMode ? 0x38bdf8 : 0x93c5fd, 0.6);
    fillLight.position.set(-6, 6, -4);
    scene.add(fillLight);

    // Bunsen Flame Point Light
    const flameLight = new THREE.PointLight(0x38bdf8, 0, 8);
    flameLight.position.set(0, 1.8, 0);
    scene.add(flameLight);
    flameLightRef.current = flameLight;

    // 6. Laboratory Bench Surface
    const benchGroup = new THREE.Group();
    // Bench top
    const benchMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x111c2a : 0xf1f5f9,
      roughness: 0.35,
      metalness: 0.1,
    });
    const benchGeo = new THREE.BoxGeometry(16, 0.4, 8);
    const benchMesh = new THREE.Mesh(benchGeo, benchMat);
    benchMesh.position.y = -0.2;
    benchMesh.receiveShadow = true;
    benchGroup.add(benchMesh);

    // Bench bevel trim
    const trimMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x0284c7 : 0x94a3b8,
      metalness: 0.6,
      roughness: 0.2,
    });
    const trimMesh = new THREE.Mesh(new THREE.BoxGeometry(16.1, 0.1, 8.1), trimMat);
    trimMesh.position.y = -0.05;
    benchGroup.add(trimMesh);

    // Laboratory grid on bench surface
    const gridHelper = new THREE.GridHelper(15, 30, isDarkMode ? 0x38bdf8 : 0x64748b, isDarkMode ? 0x1e293b : 0xcbd5e1);
    gridHelper.position.y = 0.005;
    benchGroup.add(gridHelper);

    scene.add(benchGroup);

    // ───────────────────────────────────────────────────────────────────────────
    // 3D APPARATUS MODELS BUILDER
    // ───────────────────────────────────────────────────────────────────────────
    const objects: { [key: string]: THREE.Group | THREE.Mesh } = {};

    // 1. Electronic Analytical Balance Group
    const balanceGroup = new THREE.Group();
    balanceGroup.name = 'Electronic Balance';
    (balanceGroup as any).isInteractive = true;

    // Balance Base
    const balBaseMat = new THREE.MeshStandardMaterial({ color: isDarkMode ? 0x1e293b : 0xe2e8f0, roughness: 0.5 });
    const balBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 2.6), balBaseMat);
    balBase.position.y = 0.3;
    balBase.castShadow = true;
    balBase.receiveShadow = true;
    balanceGroup.add(balBase);

    // Balance LCD Screen
    const balScreenMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const balScreen = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.05), balScreenMat);
    balScreen.position.set(0, 0.35, 1.31);
    balanceGroup.add(balScreen);

    // Glass Draft Shield
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
    });
    const shieldGeo = new THREE.BoxGeometry(2.2, 1.8, 2.2);
    const shield = new THREE.Mesh(shieldGeo, glassMat);
    shield.position.y = 1.5;
    balanceGroup.add(shield);

    // Stainless Steel Pan
    const panMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.2 });
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.05, 32), panMat);
    pan.position.y = 0.65;
    balanceGroup.add(pan);

    balanceGroup.position.set(-4.5, 0, 0);
    scene.add(balanceGroup);
    objects['balance'] = balanceGroup;

    // 2. Weighing Boat (Draggable)
    const boatGroup = new THREE.Group();
    boatGroup.name = 'Weighing Boat';
    (boatGroup as any).isInteractive = true;

    const boatMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const boatGeo = new THREE.CylinderGeometry(0.55, 0.4, 0.25, 24, 1, true);
    const boatMesh = new THREE.Mesh(boatGeo, boatMat);
    boatMesh.castShadow = true;
    boatGroup.add(boatMesh);

    // Sample Mixture Powder inside boat
    const powderMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
    const powderMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.15, 24), powderMat);
    powderMesh.position.y = 0.05;
    powderMesh.name = 'Sample Powder';
    boatGroup.add(powderMesh);

    // Position boat initially on table or on balance
    boatGroup.position.set(-4.5, 0.8, 0);
    scene.add(boatGroup);
    objects['boat'] = boatGroup;

    // 3. Tripod Stand & Wire Gauze Group
    const tripodGroup = new THREE.Group();
    tripodGroup.name = 'Tripod Stand';
    (tripodGroup as any).isInteractive = true;

    const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });
    // Ring Top
    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 16, 32), ironMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 2.4;
    tripodGroup.add(ringMesh);

    // 3 Legs
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 16), ironMat);
      leg.position.set(Math.cos(angle) * 1.1, 1.2, Math.sin(angle) * 1.1);
      leg.castShadow = true;
      tripodGroup.add(leg);
    }

    // Wire Gauze with Ceramic Center
    const gauzeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, wireframe: false, roughness: 0.7 });
    const gauze = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.04, 2.3), gauzeMat);
    gauze.position.y = 2.45;
    tripodGroup.add(gauze);

    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const ceramic = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.05, 32), ceramicMat);
    ceramic.position.y = 2.48;
    tripodGroup.add(ceramic);

    tripodGroup.position.set(0, 0, 0);
    scene.add(tripodGroup);
    objects['tripod'] = tripodGroup;

    // 4. Bunsen Burner (Draggable under tripod)
    const burnerGroup = new THREE.Group();
    burnerGroup.name = 'Bunsen Burner';
    (burnerGroup as any).isInteractive = true;

    const burnerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.2, 32), ironMat);
    burnerBase.position.y = 0.1;
    burnerGroup.add(burnerBase);

    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.3, 24), barrelMat);
    barrel.position.y = 0.85;
    burnerGroup.add(barrel);

    // 3D Animated Flame Mesh
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const flameGeo = new THREE.ConeGeometry(0.18, 0.65, 16);
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = 1.8;
    flameMesh.visible = isBurnerOn;
    flameMesh.name = 'Flame';
    burnerGroup.add(flameMesh);

    burnerGroup.position.set(0, 0, 0);
    scene.add(burnerGroup);
    objects['burner'] = burnerGroup;

    // 5. Porcelain China Dish (Draggable)
    const dishGroup = new THREE.Group();
    dishGroup.name = 'Porcelain Dish';
    (dishGroup as any).isInteractive = true;

    const dishMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
    const dishGeo = new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = Math.PI;
    dishMesh.position.y = 0.4;
    dishMesh.castShadow = true;
    dishGroup.add(dishMesh);

    // Contents inside dish
    const dishContentsMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const dishContents = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.5, 0.12, 24), dishContentsMat);
    dishContents.position.y = 0.15;
    dishContents.name = 'Dish Contents';
    dishGroup.add(dishContents);

    dishGroup.position.set(0, 2.5, 0);
    scene.add(dishGroup);
    objects['dish'] = dishGroup;

    // 6. Inverted Glass Funnel with Cotton Plug (Draggable)
    const funnelGroup = new THREE.Group();
    funnelGroup.name = 'Inverted Funnel';
    (funnelGroup as any).isInteractive = true;

    // Conical glass flare
    const funnelBody = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.2, 32, 1, true), glassMat);
    funnelBody.rotation.x = Math.PI;
    funnelBody.position.y = 0.6;
    funnelGroup.add(funnelBody);

    // Funnel Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 16), glassMat);
    stem.position.y = 1.7;
    funnelGroup.add(stem);

    // White Cotton Plug at Stem Top
    const cottonMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
    const cotton = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), cottonMat);
    cotton.position.y = 2.25;
    funnelGroup.add(cotton);

    // Sublimate crystalline crust inside funnel
    const crustMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      transparent: true,
      opacity: 0.9,
    });
    const crust = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.8, 24, 1, true), crustMat);
    crust.rotation.x = Math.PI;
    crust.position.y = 0.7;
    crust.visible = isSublimationDone;
    crust.name = 'Sublimate Crust';
    funnelGroup.add(crust);

    funnelGroup.position.set(0, 2.9, 0);
    scene.add(funnelGroup);
    objects['funnel'] = funnelGroup;

    // 7. Gravity Filtration Setup (Stand + Funnel + Beaker)
    const filterStandGroup = new THREE.Group();
    filterStandGroup.name = 'Filtration Assembly';
    (filterStandGroup as any).isInteractive = true;

    // Retort Base
    const fBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 1.4), ironMat);
    fBase.position.y = 0.1;
    filterStandGroup.add(fBase);

    // Vertical Rod
    const fRod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.5, 16), barrelMat);
    fRod.position.set(-0.7, 2.3, 0);
    filterStandGroup.add(fRod);

    // Ring clamp holding funnel
    const fRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.04, 16, 32), ironMat);
    fRing.rotation.x = Math.PI / 2;
    fRing.position.set(0, 2.6, 0);
    filterStandGroup.add(fRing);

    // Glass Funnel for filtration
    const filtrFunnel = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.9, 24, 1, true), glassMat);
    filtrFunnel.position.set(0, 2.5, 0);
    filterStandGroup.add(filtrFunnel);

    // Filter paper cone
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.95 });
    const paperCone = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 24, 1, true), paperMat);
    paperCone.position.set(0, 2.55, 0);
    filterStandGroup.add(paperCone);

    // Sand residue on paper
    const sandResidueMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    const sandResidue = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.1, 0.2, 16), sandResidueMat);
    sandResidue.position.set(0, 2.3, 0);
    sandResidue.visible = isFiltrationDone;
    filterStandGroup.add(sandResidue);

    // Receiver Beaker below funnel
    const beakerMat = glassMat.clone();
    const beaker = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.4, 24, 1, true), beakerMat);
    beaker.position.set(0, 0.8, 0);
    filterStandGroup.add(beaker);

    // Clear Filtrate Liquid in Beaker
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
    });
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.8, 24), liquidMat);
    liquid.position.set(0, 0.5, 0);
    liquid.visible = isFiltrationDone;
    filterStandGroup.add(liquid);

    filterStandGroup.position.set(4.5, 0, 0);
    scene.add(filterStandGroup);
    objects['filterStand'] = filterStandGroup;

    objectsRef.current = objects;

    // ───────────────────────────────────────────────────────────────────────────
    // 3D VAPOR PARTICLES (SUBLIMATION / EVAPORATION STEAM)
    // ───────────────────────────────────────────────────────────────────────────
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = 2.6 + Math.random() * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const vaporParticles = new THREE.Points(particleGeo, particleMat);
    vaporParticles.visible = isBurnerOn || isEvaporating;
    scene.add(vaporParticles);
    vaporParticlesRef.current = vaporParticles;

    // ───────────────────────────────────────────────────────────────────────────
    // ANIMATION RENDER LOOP
    // ───────────────────────────────────────────────────────────────────────────
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Controls update
      if (controls.enabled) controls.update();

      // Animate Flame flicker
      if (isBurnerOn && objects['burner']) {
        const flame = objects['burner'].getObjectByName('Flame');
        if (flame) {
          const scaleNoise = 1.0 + Math.sin(elapsedTime * 20) * 0.12;
          flame.scale.set(scaleNoise, scaleNoise * (1 + Math.cos(elapsedTime * 15) * 0.1), scaleNoise);
        }
        if (flameLightRef.current) {
          flameLightRef.current.intensity = 2.5 + Math.sin(elapsedTime * 30) * 0.8;
        }
      }

      // Animate Vapor Smoke Particles
      if (vaporParticlesRef.current && (isBurnerOn || isEvaporating)) {
        const posAttr = vaporParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const idxY = i * 3 + 1;
          const idxX = i * 3;
          const idxZ = i * 3 + 2;
          const currentY = array[idxY] ?? 2.6;
          const currentX = array[idxX] ?? 0;
          array[idxY] = currentY + 0.015;
          array[idxX] = currentX + Math.sin(elapsedTime * 2 + i) * 0.003;
          if ((array[idxY] ?? 0) > 4.5) {
            array[idxY] = 2.6;
            array[idxX] = (Math.random() - 0.5) * 0.6;
            array[idxZ] = (Math.random() - 0.5) * 0.6;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Dynamic Resize handling (Window resize & Container sidebar toggle)
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [isDarkMode]);

  // Update dynamic visibilities whenever state changes
  useEffect(() => {
    if (!objectsRef.current) return;
    const burner = objectsRef.current['burner'];
    if (burner) {
      const flame = burner.getObjectByName('Flame');
      if (flame) flame.visible = isBurnerOn || isEvaporating;
    }
    if (flameLightRef.current) {
      flameLightRef.current.intensity = isBurnerOn || isEvaporating ? 2.8 : 0;
    }
    const funnel = objectsRef.current['funnel'];
    if (funnel) {
      const crust = funnel.getObjectByName('Sublimate Crust');
      if (crust) crust.visible = isSublimationDone;
    }
    const filterStand = objectsRef.current['filterStand'];
    if (filterStand) {
      const sandResidue = filterStand.getObjectByName('Sand Residue');
      if (sandResidue) sandResidue.visible = isFiltrationDone;
    }
    if (vaporParticlesRef.current) {
      vaporParticlesRef.current.visible = isBurnerOn || isEvaporating;
    }
  }, [isBurnerOn, isSublimationDone, isFiltrationDone, isEvaporating]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3D OBJECT DRAGGING VIA RAYCASTER
  // ─────────────────────────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (controlMode !== 'drag' || !rendererRef.current || !cameraRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Collect interactive objects
    const interactives: THREE.Object3D[] = [];
    Object.values(objectsRef.current).forEach((obj) => {
      interactives.push(obj);
    });

    const intersects = raycasterRef.current.intersectObjects(interactives, true);
    const firstHit = intersects[0];
    if (firstHit) {
      // Find top-level interactive root
      let target: THREE.Object3D | null = firstHit.object;
      while (target && target.parent && target.parent !== sceneRef.current) {
        if ((target as any).isInteractive) break;
        target = target.parent;
      }

      if (target && target.name) {
        isDraggingRef.current = true;
        draggedObjectRef.current = target;
        setSelectedObjectName(target.name);
        setTooltipText(`Moving ${target.name}. Drag anywhere on the bench!`);

        // Compute offset on the bench plane
        dragPlaneRef.current.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 1, 0),
          target.position
        );
        const planeIntersect = new THREE.Vector3();
        raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, planeIntersect);
        dragOffsetRef.current.subVectors(target.position, planeIntersect);
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!rendererRef.current || !cameraRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (isDraggingRef.current && draggedObjectRef.current) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const planeIntersect = new THREE.Vector3();
      if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, planeIntersect)) {
        const newPos = planeIntersect.add(dragOffsetRef.current);
        // Constrain to bench boundaries
        newPos.x = Math.max(-7.2, Math.min(7.2, newPos.x));
        newPos.z = Math.max(-3.4, Math.min(3.4, newPos.z));
        draggedObjectRef.current.position.x = newPos.x;
        draggedObjectRef.current.position.z = newPos.z;
      }
    } else {
      // Hover detection
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const interactives = Object.values(objectsRef.current);
      const intersects = raycasterRef.current.intersectObjects(interactives, true);
      const firstHover = intersects[0];
      if (firstHover) {
        let hoverObj: THREE.Object3D | null = firstHover.object;
        while (hoverObj && hoverObj.parent && hoverObj.parent !== sceneRef.current) {
          if ((hoverObj as any).isInteractive) break;
          hoverObj = hoverObj.parent;
        }
        if (hoverObj && hoverObj.name) {
          setTooltipText(`Interactive: ${hoverObj.name} (Click & drag to move)`);
          return;
        }
      }
      setTooltipText(null);
    }
  };

  const onPointerUp = () => {
    if (isDraggingRef.current && draggedObjectRef.current) {
      isDraggingRef.current = false;
      const target = draggedObjectRef.current;
      setTooltipText(`${target.name} positioned on bench.`);
      draggedObjectRef.current = null;
    }
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 5.6, 9.8);
    controlsRef.current.target.set(0, 1.35, 0);
    controlsRef.current.update();
  };

  // Camera View Angle Presets
  const setCameraView = (type: 'default' | 'front' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (type === 'default') {
      cameraRef.current.position.set(0, 5.6, 9.8);
      controlsRef.current.target.set(0, 1.35, 0);
    } else if (type === 'front') {
      cameraRef.current.position.set(0, 2.5, 9.0);
      controlsRef.current.target.set(0, 1.35, 0);
    } else if (type === 'top') {
      cameraRef.current.position.set(0, 12.0, 0.5);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div className="relative flex flex-col h-full w-full select-none overflow-hidden">
      {/* ─── SLEEK GLASS FLOATING MISSION HUD ─── */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-auto flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-400/30 bg-white/95 dark:bg-[#08121e]/95 backdrop-blur-md px-3.5 py-2 shadow-xl transition-all">
          {/* Left: Step Tag & Immediate Action Prompt */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500 animate-pulse" />
            <span className="rounded-md bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 px-2 py-0.5 text-[0.6875rem] font-mono font-bold shrink-0 uppercase tracking-wide">
              {guide.title.split(':')[0]}
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-xs sm:max-w-md lg:max-w-xl">
              👉 {guide.instruction}
            </p>
          </div>

          {/* Right: Actions (Tip, Listen, Primary Action Button) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Pedagogical Hint / Theory Toggle */}
            <button
              type="button"
              onClick={() => setShowTip((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                showTip
                  ? 'border-amber-400 bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300'
              }`}
              title="Show Pedagogical Tip & Science Concept"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Hint</span>
            </button>

            {/* Read Aloud */}
            <button
              type="button"
              onClick={() => speakInstruction(`${guide.title}. ${guide.instruction}. Hint: ${guide.tip}`)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isSpeaking
                  ? 'border-cyan-500 bg-cyan-500 text-white animate-pulse'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-cyan-600'
              }`}
              title="Read Step Instructions Aloud"
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Mute' : 'Listen'}</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={guide.onAction}
              disabled={guide.actionDisabled}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer ${
                !guide.actionDisabled
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-500 hover:to-teal-500 active:scale-95 shadow-cyan-500/20'
                  : 'bg-slate-200 dark:bg-slate-800/80 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{guide.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Expandable Pedagogical Tip Popover */}
        {showTip && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50/95 dark:bg-[#1A180E]/95 backdrop-blur-md px-3.5 py-2 text-xs text-amber-900 dark:text-amber-200 shadow-xl animate-fade-in">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <p>
                <strong className="font-semibold text-amber-800 dark:text-amber-300">Science Concept:</strong>{' '}
                {guide.tip}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTip(false)}
              className="p-1 rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-200/50 dark:hover:bg-amber-900/40 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ─── 3D VIEWPORT CANVAS CONTAINER ─── */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="w-full h-full relative cursor-grab active:cursor-grabbing"
      />

      {/* ─── BOTTOM 3D CONTROLS OVERLAY ─── */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Mode Toggles & Camera Angle Presets */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white/95 dark:bg-[#08121e]/95 p-1 shadow-xl backdrop-blur-md pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              setControlMode('drag');
              if (controlsRef.current) controlsRef.current.enabled = false;
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              controlMode === 'drag'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Grab and move glassware freely on bench"
          >
            <Move className="h-3.5 w-3.5" />
            <span>Move 3D Objects</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setControlMode('orbit');
              if (controlsRef.current) controlsRef.current.enabled = true;
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              controlMode === 'orbit'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Rotate camera 360 degrees around table"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Orbit Camera</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Camera View Angle Presets */}
          <button
            type="button"
            onClick={() => setCameraView('default')}
            className="px-2 py-1 rounded-lg text-[0.6875rem] font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Standard Perspective View"
          >
            Perspective
          </button>
          <button
            type="button"
            onClick={() => setCameraView('front')}
            className="px-2 py-1 rounded-lg text-[0.6875rem] font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Front Eye-Level View"
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setCameraView('top')}
            className="px-2 py-1 rounded-lg text-[0.6875rem] font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Top-Down Plan View"
          >
            Top
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Reset Camera View"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Center: Live Hover Tooltip */}
        {tooltipText && (
          <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-slate-950/95 px-3 py-1.5 text-xs font-mono text-cyan-300 shadow-xl backdrop-blur-md pointer-events-auto animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{tooltipText}</span>
          </div>
        )}

        {/* Right: Quick Stage Snap Indicator */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white/95 dark:bg-[#08121e]/95 px-2.5 py-1.5 shadow-xl backdrop-blur-md pointer-events-auto text-xs font-medium">
          <span className="text-slate-500 dark:text-slate-400 text-[0.6875rem]">3D Bench:</span>
          <span className="font-bold text-cyan-700 dark:text-cyan-300 font-mono text-[0.6875rem]">
            {selectedObjectName ? `Grabbed: ${selectedObjectName}` : controlMode === 'drag' ? 'Drag Any Apparatus' : 'Rotate to Inspect'}
          </span>
        </div>
      </div>
    </div>
  );
};
