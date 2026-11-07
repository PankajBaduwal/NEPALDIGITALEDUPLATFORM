import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw,
  Zap,
  Power,
  Sliders,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type {
  OhmsLawBenchCircuitState,
  CircuitSimulationReadings,
  TerminalRef,
} from '../../../../../school/physics/circuit-solver';

export interface PhysicsLab3DCanvasProps {
  circuitState: OhmsLawBenchCircuitState;
  readings: CircuitSimulationReadings;
  onTogglePower: () => void;
  onTogglePlugKey: () => void;
  onVoltageChange: (voltage: number) => void;
  onRheostatChange: (resistance: number) => void;
  onConnectTerminals: (source: TerminalRef, target: TerminalRef, color: 'red' | 'black') => void;
  onRemoveWire: (wireId: string) => void;
  onResetBench: () => void;
  isDarkMode?: boolean;
}

// 3D Terminal Definition on Apparatus
interface PhysicalTerminal {
  apparatusId: string;
  terminalId: string;
  label: string;
  color: 'red' | 'black';
  worldPos: THREE.Vector3;
}

export const PhysicsLab3DCanvas: React.FC<PhysicsLab3DCanvasProps> = ({
  circuitState,
  readings,
  onTogglePower,
  onTogglePlugKey,
  onVoltageChange,
  onRheostatChange,
  onConnectTerminals,
  onRemoveWire,
  onResetBench,
  isDarkMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<PhysicalTerminal | null>(null);
  const [isMuted] = useState(false);
  const [cameraView, setCameraView] = useState<'bench' | 'ammeter' | 'voltmeter' | 'top'>('bench');

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Object & Mesh Refs
  const terminalsRef = useRef<PhysicalTerminal[]>([]);
  const wireMeshesRef = useRef<{ [wireId: string]: THREE.Mesh }>({});
  const ammeterNeedleRef = useRef<THREE.Group | null>(null);
  const voltmeterNeedleRef = useRef<THREE.Group | null>(null);
  const rheostatWiperMeshRef = useRef<THREE.Group | null>(null);
  const plugKeyMeshRef = useRef<THREE.Mesh | null>(null);
  const batteryKnobMeshRef = useRef<THREE.Mesh | null>(null);
  const pilotLightRef = useRef<THREE.PointLight | null>(null);

  // Audio effect helper (synthesized audio clicks)
  const playAudioClick = useCallback((freq = 440, type: OscillatorType = 'sine') => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }, [isMuted]);

  // ─────────────────────────────────────────────────────────────────────────────
  // THREE.JS SCENE INITIALIZATION & APPARATUS GEOMETRY GENERATION
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDarkMode ? 0x070e17 : 0xf1f5f9);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5.2, 5.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera from dropping below workbench
    controls.minDistance = 2.0;
    controls.maxDistance = 12.0;
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, isDarkMode ? 0x111c2e : 0xdde6ed, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -5;
    dirLight.shadow.camera.right = 5;
    dirLight.shadow.camera.top = 5;
    dirLight.shadow.camera.bottom = -5;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x90caf9, 0.4);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);

    // 6. Laboratory Workbench Table
    const tableTopGeo = new THREE.BoxGeometry(7.2, 0.18, 4.2);
    const tableMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x0f1c2b : 0xe2e8f0,
      roughness: 0.6,
      metalness: 0.15,
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.set(0, -0.09, 0);
    tableTop.receiveShadow = true;
    scene.add(tableTop);

    // Grid on table top for precise metric alignment
    const gridHelper = new THREE.GridHelper(6.8, 34, isDarkMode ? 0x1e3a5f : 0x94a3b8, isDarkMode ? 0x112233 : 0xcfd8dc);
    gridHelper.position.set(0, 0.005, 0);
    scene.add(gridHelper);

    // Reset physical terminals cache
    terminalsRef.current = [];

    // Helper: Add Terminal Post with metadata
    const addTerminal = (
      apparatusId: string,
      terminalId: string,
      label: string,
      color: 'red' | 'black',
      pos: THREE.Vector3,
      parentGroup: THREE.Group
    ) => {
      const termGroup = new THREE.Group();
      termGroup.position.copy(pos);

      // Base ring
      const baseGeo = new THREE.CylinderGeometry(0.042, 0.048, 0.03, 16);
      const baseMat = new THREE.MeshStandardMaterial({
        color: color === 'red' ? 0xd32f2f : 0x212121,
        roughness: 0.3,
        metalness: 0.7,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.castShadow = true;
      termGroup.add(baseMesh);

      // Brass threaded screw post
      const screwGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.07, 16);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.85 });
      const screwMesh = new THREE.Mesh(screwGeo, brassMat);
      screwMesh.position.y = 0.035;
      screwMesh.castShadow = true;
      termGroup.add(screwMesh);

      // Top knurled nut
      const nutGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.035, 12);
      const nutMesh = new THREE.Mesh(nutGeo, baseMat);
      nutMesh.position.y = 0.06;
      nutMesh.castShadow = true;
      termGroup.add(nutMesh);

      parentGroup.add(termGroup);

      // Calculate absolute world position for raycasting
      const worldPos = new THREE.Vector3();
      termGroup.getWorldPosition(worldPos);
      termGroup.userData = { isTerminal: true, apparatusId, terminalId, label, color };

      terminalsRef.current.push({
        apparatusId,
        terminalId,
        label,
        color,
        worldPos,
      });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 1. DC BATTERY ELIMINATOR (Position: Rear Left: -2.2, 0, -1.1)
    // ─────────────────────────────────────────────────────────────────────────
    const batGroup = new THREE.Group();
    batGroup.position.set(-2.2, 0, -1.1);
    batGroup.name = 'Battery Eliminator';

    // Metal housing
    const batBoxGeo = new THREE.BoxGeometry(0.9, 0.52, 0.65);
    const batBoxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.4 });
    const batBox = new THREE.Mesh(batBoxGeo, batBoxMat);
    batBox.position.y = 0.26;
    batBox.castShadow = true;
    batBox.receiveShadow = true;
    batGroup.add(batBox);

    // Front sloped face
    const panelGeo = new THREE.PlaneGeometry(0.82, 0.44);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 0.26, 0.326);
    batGroup.add(panel);

    // Voltage selector knob
    const knobGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 18);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-0.16, 0.3, 0.35);
    knob.userData = { isKnob: true };
    batGroup.add(knob);
    batteryKnobMeshRef.current = knob;

    // Pilot light (LED indicator)
    const ledGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const ledMat = new THREE.MeshStandardMaterial({
      color: circuitState.isBatteryOn ? 0x22c55e : 0x475569,
      emissive: circuitState.isBatteryOn ? 0x22c55e : 0x000000,
      emissiveIntensity: 0.8,
    });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-0.16, 0.42, 0.34);
    batGroup.add(led);

    const pilotLight = new THREE.PointLight(0x22c55e, circuitState.isBatteryOn ? 0.6 : 0, 1.2);
    pilotLight.position.set(-0.16, 0.42, 0.4);
    batGroup.add(pilotLight);
    pilotLightRef.current = pilotLight;

    // Terminals on battery
    addTerminal('battery', 'pos', 'Battery (+) 2V-8V DC', 'red', new THREE.Vector3(0.18, 0.22, 0.35), batGroup);
    addTerminal('battery', 'neg', 'Battery (-) Common Ground', 'black', new THREE.Vector3(0.32, 0.22, 0.35), batGroup);

    scene.add(batGroup);

    // ─────────────────────────────────────────────────────────────────────────
    // 2. ONE-WAY PLUG KEY (Position: Center Left: -1.0, 0, -1.0)
    // ─────────────────────────────────────────────────────────────────────────
    const keyGroup = new THREE.Group();
    keyGroup.position.set(-1.0, 0, -1.0);
    keyGroup.name = 'Plug Key';

    // Wooden/Bakelite base
    const keyBaseGeo = new THREE.BoxGeometry(0.55, 0.08, 0.38);
    const keyBaseMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.6 });
    const keyBase = new THREE.Mesh(keyBaseGeo, keyBaseMat);
    keyBase.position.y = 0.04;
    keyBase.castShadow = true;
    keyGroup.add(keyBase);

    // Two brass contact blocks with conical gap
    const b1Geo = new THREE.BoxGeometry(0.18, 0.12, 0.22);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 });
    const b1 = new THREE.Mesh(b1Geo, brassMat);
    b1.position.set(-0.12, 0.14, 0);
    b1.castShadow = true;
    keyGroup.add(b1);

    const b2 = new THREE.Mesh(b1Geo, brassMat);
    b2.position.set(0.12, 0.14, 0);
    b2.castShadow = true;
    keyGroup.add(b2);

    // Removable brass tapered plug with black insulated handle
    const plugGroup = new THREE.Group();
    const plugPinGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.14, 16);
    const plugPin = new THREE.Mesh(plugPinGeo, brassMat);
    plugPin.position.y = 0.07;
    plugGroup.add(plugPin);

    const plugHandleGeo = new THREE.CylinderGeometry(0.065, 0.05, 0.12, 16);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 });
    const plugHandle = new THREE.Mesh(plugHandleGeo, handleMat);
    plugHandle.position.y = 0.18;
    plugGroup.add(plugHandle);

    plugGroup.position.set(0, circuitState.isPlugKeyInserted ? 0.09 : 0.32, 0);
    plugGroup.userData = { isPlugKey: true };
    keyGroup.add(plugGroup);
    plugKeyMeshRef.current = plugGroup as any;

    // Terminals on plug key
    addTerminal('key', 't1', 'Plug Key Terminal 1', 'black', new THREE.Vector3(-0.18, 0.12, 0), keyGroup);
    addTerminal('key', 't2', 'Plug Key Terminal 2', 'black', new THREE.Vector3(0.18, 0.12, 0), keyGroup);

    scene.add(keyGroup);

    // ─────────────────────────────────────────────────────────────────────────
    // 3. SLIDING RHEOSTAT (Position: Center Right: 0.8, 0, -1.0)
    // ─────────────────────────────────────────────────────────────────────────
    const rheoGroup = new THREE.Group();
    rheoGroup.position.set(0.8, 0, -1.0);
    rheoGroup.name = 'Rheostat';

    // Metal end supports
    const endGeo = new THREE.BoxGeometry(0.08, 0.34, 0.38);
    const endMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.5 });
    const end1 = new THREE.Mesh(endGeo, endMat);
    end1.position.set(-0.7, 0.17, 0);
    end1.castShadow = true;
    rheoGroup.add(end1);

    const end2 = new THREE.Mesh(endGeo, endMat);
    end2.position.set(0.7, 0.17, 0);
    end2.castShadow = true;
    rheoGroup.add(end2);

    // Porcelain tube wound with constantan wire
    const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.34, 24);
    const woundMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7, metalness: 0.3 });
    const tube = new THREE.Mesh(tubeGeo, woundMat);
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0, 0.15, 0);
    tube.castShadow = true;
    rheoGroup.add(tube);

    // Top brass slide bar
    const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 16);
    const bar = new THREE.Mesh(barGeo, brassMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 0.31, 0);
    rheoGroup.add(bar);

    // Sliding contact wiper with black handle
    const wiperGroup = new THREE.Group();
    const wiperCollarGeo = new THREE.BoxGeometry(0.09, 0.12, 0.16);
    const wiperCollar = new THREE.Mesh(wiperCollarGeo, brassMat);
    wiperGroup.add(wiperCollar);

    const wiperKnobGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.08, 16);
    const wiperKnob = new THREE.Mesh(wiperKnobGeo, handleMat);
    wiperKnob.position.y = 0.09;
    wiperGroup.add(wiperKnob);

    // Wiper position derived from resistance (0 to 50 Ohms mapped to -0.55 to +0.55)
    const wiperX = -0.55 + (circuitState.rheostatResistance / 50.0) * 1.1;
    wiperGroup.position.set(wiperX, 0.31, 0);
    wiperGroup.userData = { isRheostatWiper: true };
    rheoGroup.add(wiperGroup);
    rheostatWiperMeshRef.current = wiperGroup;

    // Terminals on rheostat: 2 bottom ends + 1 top wiper end
    addTerminal('rheostat', 't_lower1', 'Rheostat Lower Terminal 1', 'black', new THREE.Vector3(-0.7, 0.08, 0.18), rheoGroup);
    addTerminal('rheostat', 't_lower2', 'Rheostat Lower Terminal 2', 'black', new THREE.Vector3(0.7, 0.08, 0.18), rheoGroup);
    addTerminal('rheostat', 't_slider', 'Rheostat Slider (Upper) Terminal', 'black', new THREE.Vector3(-0.7, 0.32, 0), rheoGroup);

    scene.add(rheoGroup);

    // ─────────────────────────────────────────────────────────────────────────
    // 4. DC AMMETER (Position: Center Forward: -0.9, 0, 0.5)
    // ─────────────────────────────────────────────────────────────────────────
    const amGroup = new THREE.Group();
    amGroup.position.set(-0.9, 0, 0.5);
    amGroup.name = 'DC Ammeter (0 - 1.5 A)';

    // Angled casing (inclined face for student viewing)
    const amCasingGeo = new THREE.BoxGeometry(0.68, 0.44, 0.62);
    const meterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.2 });
    const amCasing = new THREE.Mesh(amCasingGeo, meterMat);
    amCasing.position.y = 0.22;
    amCasing.castShadow = true;
    amGroup.add(amCasing);

    // Dial face canvas
    const amDialCanvas = document.createElement('canvas');
    amDialCanvas.width = 512;
    amDialCanvas.height = 512;
    const amCtx = amDialCanvas.getContext('2d')!;
    amCtx.fillStyle = '#ffffff';
    amCtx.fillRect(0, 0, 512, 512);

    // Draw dial markings
    amCtx.strokeStyle = '#000000';
    amCtx.fillStyle = '#000000';
    amCtx.lineWidth = 3;
    amCtx.beginPath();
    amCtx.arc(256, 380, 200, Math.PI * 1.2, Math.PI * 1.8);
    amCtx.stroke();

    amCtx.font = 'bold 36px sans-serif';
    amCtx.textAlign = 'center';
    amCtx.fillText('A', 256, 260);
    amCtx.font = '22px sans-serif';
    amCtx.fillText('AMMETER (0 - 1.5 A)', 256, 300);
    amCtx.fillText('Least Count: 0.05 A', 256, 335);

    // Ticks & division numbers
    for (let i = 0; i <= 30; i++) {
      const angle = Math.PI * 1.2 + (i / 30) * (Math.PI * 0.6);
      const isMajor = i % 5 === 0;
      const len = isMajor ? 26 : 14;
      const rOuter = 200;
      const rInner = rOuter - len;

      const x1 = 256 + Math.cos(angle) * rOuter;
      const y1 = 380 + Math.sin(angle) * rOuter;
      const x2 = 256 + Math.cos(angle) * rInner;
      const y2 = 380 + Math.sin(angle) * rInner;

      amCtx.lineWidth = isMajor ? 4 : 2;
      amCtx.beginPath();
      amCtx.moveTo(x1, y1);
      amCtx.lineTo(x2, y2);
      amCtx.stroke();

      if (isMajor) {
        const val = (i * 0.05).toFixed(1);
        const xt = 256 + Math.cos(angle) * (rInner - 22);
        const yt = 380 + Math.sin(angle) * (rInner - 22);
        amCtx.font = 'bold 20px monospace';
        amCtx.fillText(val, xt, yt + 7);
      }
    }

    const amTex = new THREE.CanvasTexture(amDialCanvas);
    const dialPlateGeo = new THREE.PlaneGeometry(0.56, 0.44);
    const dialPlateMat = new THREE.MeshStandardMaterial({ map: amTex, roughness: 0.4 });
    const amDialPlate = new THREE.Mesh(dialPlateGeo, dialPlateMat);
    amDialPlate.rotation.x = -Math.PI / 4;
    amDialPlate.position.set(0, 0.32, 0.05);
    amGroup.add(amDialPlate);

    // Transparent glass cover
    const glassGeo = new THREE.PlaneGeometry(0.58, 0.46);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      transmission: 0.9,
    });
    const amGlass = new THREE.Mesh(glassGeo, glassMat);
    amGlass.rotation.x = -Math.PI / 4;
    amGlass.position.set(0, 0.33, 0.06);
    amGroup.add(amGlass);

    // Rotating pointer needle
    const amNeedleGroup = new THREE.Group();
    amNeedleGroup.position.set(0, 0.22, 0.15);
    amNeedleGroup.rotation.x = -Math.PI / 4;

    const needleStickGeo = new THREE.CylinderGeometry(0.003, 0.006, 0.28, 8);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f });
    const needleStick = new THREE.Mesh(needleStickGeo, needleMat);
    needleStick.position.y = 0.14;
    amNeedleGroup.add(needleStick);

    const pivotCapGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    const cap = new THREE.Mesh(pivotCapGeo, capMat);
    amNeedleGroup.add(cap);

    amGroup.add(amNeedleGroup);
    ammeterNeedleRef.current = amNeedleGroup;

    // Terminals on ammeter (Red + and Black -)
    addTerminal('ammeter', 'pos', 'Ammeter (+) Terminal', 'red', new THREE.Vector3(-0.16, 0.38, -0.16), amGroup);
    addTerminal('ammeter', 'neg', 'Ammeter (-) Terminal', 'black', new THREE.Vector3(0.16, 0.38, -0.16), amGroup);

    scene.add(amGroup);

    // ─────────────────────────────────────────────────────────────────────────
    // 5. DC VOLTMETER (Position: Center Forward Right: 0.9, 0, 0.5)
    // ─────────────────────────────────────────────────────────────────────────
    const vmGroup = new THREE.Group();
    vmGroup.position.set(0.9, 0, 0.5);
    vmGroup.name = 'DC Voltmeter (0 - 3.0 V)';

    const vmCasing = new THREE.Mesh(amCasingGeo, meterMat);
    vmCasing.position.y = 0.22;
    vmCasing.castShadow = true;
    vmGroup.add(vmCasing);

    // Dial face canvas for voltmeter
    const vmDialCanvas = document.createElement('canvas');
    vmDialCanvas.width = 512;
    vmDialCanvas.height = 512;
    const vmCtx = vmDialCanvas.getContext('2d')!;
    vmCtx.fillStyle = '#ffffff';
    vmCtx.fillRect(0, 0, 512, 512);

    vmCtx.strokeStyle = '#000000';
    vmCtx.fillStyle = '#000000';
    vmCtx.lineWidth = 3;
    vmCtx.beginPath();
    vmCtx.arc(256, 380, 200, Math.PI * 1.2, Math.PI * 1.8);
    vmCtx.stroke();

    amCtx.font = 'bold 36px sans-serif';
    vmCtx.textAlign = 'center';
    vmCtx.fillText('V', 256, 260);
    vmCtx.font = '22px sans-serif';
    vmCtx.fillText('VOLTMETER (0 - 3.0 V)', 256, 300);
    vmCtx.fillText('Least Count: 0.1 V', 256, 335);

    for (let i = 0; i <= 30; i++) {
      const angle = Math.PI * 1.2 + (i / 30) * (Math.PI * 0.6);
      const isMajor = i % 5 === 0;
      const len = isMajor ? 26 : 14;
      const rOuter = 200;
      const rInner = rOuter - len;

      const x1 = 256 + Math.cos(angle) * rOuter;
      const y1 = 380 + Math.sin(angle) * rOuter;
      const x2 = 256 + Math.cos(angle) * rInner;
      const y2 = 380 + Math.sin(angle) * rInner;

      vmCtx.lineWidth = isMajor ? 4 : 2;
      vmCtx.beginPath();
      vmCtx.moveTo(x1, y1);
      vmCtx.lineTo(x2, y2);
      vmCtx.stroke();

      if (isMajor) {
        const val = (i * 0.1).toFixed(1);
        const xt = 256 + Math.cos(angle) * (rInner - 22);
        const yt = 380 + Math.sin(angle) * (rInner - 22);
        vmCtx.font = 'bold 20px monospace';
        vmCtx.fillText(val, xt, yt + 7);
      }
    }

    const vmTex = new THREE.CanvasTexture(vmDialCanvas);
    const vmDialPlate = new THREE.Mesh(dialPlateGeo, new THREE.MeshStandardMaterial({ map: vmTex, roughness: 0.4 }));
    vmDialPlate.rotation.x = -Math.PI / 4;
    vmDialPlate.position.set(0, 0.32, 0.05);
    vmGroup.add(vmDialPlate);

    const vmGlass = new THREE.Mesh(glassGeo, glassMat);
    vmGlass.rotation.x = -Math.PI / 4;
    vmGlass.position.set(0, 0.33, 0.06);
    vmGroup.add(vmGlass);

    const vmNeedleGroup = new THREE.Group();
    vmNeedleGroup.position.set(0, 0.22, 0.15);
    vmNeedleGroup.rotation.x = -Math.PI / 4;

    const vmNeedleStick = new THREE.Mesh(needleStickGeo, needleMat);
    vmNeedleStick.position.y = 0.14;
    vmNeedleGroup.add(vmNeedleStick);
    vmNeedleGroup.add(cap.clone());

    vmGroup.add(vmNeedleGroup);
    voltmeterNeedleRef.current = vmNeedleGroup;

    addTerminal('voltmeter', 'pos', 'Voltmeter (+) Terminal', 'red', new THREE.Vector3(-0.16, 0.38, -0.16), vmGroup);
    addTerminal('voltmeter', 'neg', 'Voltmeter (-) Terminal', 'black', new THREE.Vector3(0.16, 0.38, -0.16), vmGroup);

    scene.add(vmGroup);

    // ─────────────────────────────────────────────────────────────────────────
    // 6. UNKNOWN RESISTOR (NICHROME COIL ON BLOCK) (Position: Front Center: 0, 0, 0.8)
    // ─────────────────────────────────────────────────────────────────────────
    const resGroup = new THREE.Group();
    resGroup.position.set(0, 0, 0.8);
    resGroup.name = 'Unknown Resistor (5.0 Ω)';

    const resBaseGeo = new THREE.BoxGeometry(0.56, 0.07, 0.36);
    const resBase = new THREE.Mesh(resBaseGeo, keyBaseMat);
    resBase.position.y = 0.035;
    resBase.castShadow = true;
    resGroup.add(resBase);

    // Acrylic transparent plate with wound resistance coil
    const coilGeo = new THREE.TorusGeometry(0.08, 0.015, 12, 32);
    const coilMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const coil = new THREE.Mesh(coilGeo, coilMat);
    coil.rotation.x = Math.PI / 2;
    coil.position.set(0, 0.08, 0);
    resGroup.add(coil);

    addTerminal('resistor', 't1', 'Resistor Terminal 1', 'black', new THREE.Vector3(-0.18, 0.08, 0), resGroup);
    addTerminal('resistor', 't2', 'Resistor Terminal 2', 'black', new THREE.Vector3(0.18, 0.08, 0), resGroup);

    scene.add(resGroup);

    // ─────────────────────────────────────────────────────────────────────────
    // 7. ANIMATION RENDER LOOP
    // ─────────────────────────────────────────────────────────────────────────
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }
      controls.dispose();
    };
  }, [isDarkMode]);

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE NEEDLE DEFLECTIONS & WIRES ON STATE CHANGES
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Ammeter needle rotation
    // Total angle span is 54 degrees (-27 deg to +27 deg from center)
    if (ammeterNeedleRef.current) {
      const maxAm = 1.5;
      const currentVal = readings.ammeterObservedA;
      const normalized = Math.max(0, Math.min(1.0, currentVal / maxAm));
      const targetAngle = 0.47 - normalized * 0.94; // Rotates around Z axis in local space
      ammeterNeedleRef.current.rotation.z = targetAngle;
    }

    // 2. Voltmeter needle rotation
    if (voltmeterNeedleRef.current) {
      const maxVm = 3.0;
      const currentVal = readings.voltmeterObservedV;
      const normalized = Math.max(0, Math.min(1.0, currentVal / maxVm));
      const targetAngle = 0.47 - normalized * 0.94;
      voltmeterNeedleRef.current.rotation.z = targetAngle;
    }

    // 3. Update Rheostat Wiper Position
    if (rheostatWiperMeshRef.current) {
      const wiperX = -0.55 + (circuitState.rheostatResistance / 50.0) * 1.1;
      rheostatWiperMeshRef.current.position.x = wiperX;
    }

    // 4. Update Plug Key Position
    if (plugKeyMeshRef.current) {
      plugKeyMeshRef.current.position.y = circuitState.isPlugKeyInserted ? 0.09 : 0.32;
    }

    // 5. Update Pilot Light
    if (pilotLightRef.current) {
      pilotLightRef.current.intensity = circuitState.isBatteryOn ? 0.6 : 0;
    }
  }, [readings, circuitState]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER WIRES AS CURVED THREE.JS TUBES (CATENARY SAG)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old wire meshes
    Object.values(wireMeshesRef.current).forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    wireMeshesRef.current = {};

    // Rebuild active wires
    circuitState.connections.forEach((wire) => {
      const srcTerm = terminalsRef.current.find(
        (t) => t.apparatusId === wire.source.apparatusId && t.terminalId === wire.source.terminalId
      );
      const tgtTerm = terminalsRef.current.find(
        (t) => t.apparatusId === wire.target.apparatusId && t.terminalId === wire.target.terminalId
      );

      if (!srcTerm || !tgtTerm) return;

      const p1 = srcTerm.worldPos.clone().add(new THREE.Vector3(0, 0.05, 0));
      const p2 = tgtTerm.worldPos.clone().add(new THREE.Vector3(0, 0.05, 0));
      const mid = p1.clone().add(p2).multiplyScalar(0.5);

      // Catenary gravitational droop proportional to distance
      const dist = p1.distanceTo(p2);
      mid.y = Math.max(0.08, mid.y - Math.min(0.35, dist * 0.18));

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.016, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: wire.color === 'red' ? 0xd32f2f : 0x1f2937,
        roughness: 0.35,
        metalness: 0.3,
      });

      const wireMesh = new THREE.Mesh(tubeGeo, tubeMat);
      wireMesh.castShadow = true;
      wireMesh.userData = { isWire: true, wireId: wire.id };

      scene.add(wireMesh);
      wireMeshesRef.current[wire.id] = wireMesh;
    });
  }, [circuitState.connections]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RAYCASTING CLICK & INTERACTION HANDLER
  // ─────────────────────────────────────────────────────────────────────────────
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

    if (intersects.length === 0) return;

    // Check hit target
    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;

      // Check if wire was clicked for deletion
      if (obj.userData?.isWire) {
        onRemoveWire(obj.userData.wireId);
        playAudioClick(350, 'triangle');
        return;
      }

      // Traverse up to find custom component metadata
      while (obj && obj !== sceneRef.current) {
        // 1. Terminal clicked
        if (obj.userData?.isTerminal) {
          const termData: PhysicalTerminal = {
            apparatusId: obj.userData.apparatusId,
            terminalId: obj.userData.terminalId,
            label: obj.userData.label,
            color: obj.userData.color,
            worldPos: new THREE.Vector3(),
          };
          obj.getWorldPosition(termData.worldPos);

          if (!selectedTerminal) {
            setSelectedTerminal(termData);
            playAudioClick(600, 'sine');
          } else {
            // If clicked different terminal, complete wire connection
            if (
              selectedTerminal.apparatusId !== termData.apparatusId ||
              selectedTerminal.terminalId !== termData.terminalId
            ) {
              const wireColor = selectedTerminal.color === 'red' || termData.color === 'red' ? 'red' : 'black';
              onConnectTerminals(
                { apparatusId: selectedTerminal.apparatusId, terminalId: selectedTerminal.terminalId },
                { apparatusId: termData.apparatusId, terminalId: termData.terminalId },
                wireColor
              );
              playAudioClick(800, 'sine');
            }
            setSelectedTerminal(null);
          }
          return;
        }

        // 2. Plug Key clicked
        if (obj.userData?.isPlugKey) {
          onTogglePlugKey();
          playAudioClick(circuitState.isPlugKeyInserted ? 300 : 700, 'square');
          return;
        }

        // 3. Battery Knob clicked
        if (obj.userData?.isKnob) {
          const nextV = circuitState.sourceVoltage >= 8 ? 2 : circuitState.sourceVoltage + 2;
          onVoltageChange(nextV);
          playAudioClick(520, 'sine');
          return;
        }

        obj = obj.parent;
      }
    }
  };

  // Change Camera Angles for Dial Inspection
  const setCameraPreset = (preset: 'bench' | 'ammeter' | 'voltmeter' | 'top') => {
    setCameraView(preset);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (preset === 'bench') {
      camera.position.set(0, 5.2, 5.8);
      controls.target.set(0, 0.4, 0);
    } else if (preset === 'ammeter') {
      camera.position.set(-0.9, 1.8, 1.6);
      controls.target.set(-0.9, 0.35, 0.5);
    } else if (preset === 'voltmeter') {
      camera.position.set(0.9, 1.8, 1.6);
      controls.target.set(0.9, 0.35, 0.5);
    } else if (preset === 'top') {
      camera.position.set(0, 7.5, 0.1);
      controls.target.set(0, 0, 0);
    }
    controls.update();
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-100 dark:bg-[#070e17]">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* ─── TOP WORKBENCH HUD & TOOLBAR ─── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {/* Left: Selected Terminal Alert or Wire Instruction */}
        <div className="pointer-events-auto flex items-center gap-2">
          {selectedTerminal ? (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/90 text-slate-950 px-3 py-1.5 text-xs font-bold shadow-lg animate-pulse">
              <Zap className="h-4 w-4" />
              <span>Connecting from: {selectedTerminal.label}</span>
              <span className="text-[0.6875rem] bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded">
                Click target terminal
              </span>
              <button
                type="button"
                onClick={() => setSelectedTerminal(null)}
                className="ml-1 text-slate-950 hover:text-white font-extrabold cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-md">
              <Info className="h-3.5 w-3.5 text-cyan-500" />
              <span>Tap terminal posts to connect wires · Click wire to delete</span>
            </div>
          )}
        </div>

        {/* Right: Camera Inspector Presets & Bench Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 shadow-md gap-1">
            <button
              type="button"
              onClick={() => setCameraPreset('bench')}
              className={`rounded-lg px-2.5 py-1 text-[0.6875rem] font-bold transition-all cursor-pointer ${
                cameraView === 'bench'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Workbench View
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset('ammeter')}
              className={`rounded-lg px-2.5 py-1 text-[0.6875rem] font-bold transition-all cursor-pointer ${
                cameraView === 'ammeter'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Inspect Ammeter
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset('voltmeter')}
              className={`rounded-lg px-2.5 py-1 text-[0.6875rem] font-bold transition-all cursor-pointer ${
                cameraView === 'voltmeter'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Inspect Voltmeter
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset('top')}
              className={`rounded-lg px-2.5 py-1 text-[0.6875rem] font-bold transition-all cursor-pointer ${
                cameraView === 'top'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Top Plan
            </button>
          </div>

          <button
            type="button"
            onClick={onResetBench}
            className="flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-md cursor-pointer"
            title="Reset Circuit Wiring"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ─── BOTTOM INTERACTION DOCK: APPARATUS CONTROLS ─── */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 pointer-events-none z-10">
        {/* Left: Power & Switch Toggles */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 shadow-xl">
          {/* Battery Power Switch */}
          <button
            type="button"
            onClick={() => {
              onTogglePower();
              playAudioClick(circuitState.isBatteryOn ? 350 : 650, 'square');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
              circuitState.isBatteryOn
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Power className="h-4 w-4" />
            <span>Power: {circuitState.isBatteryOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* Voltage Selector Knob */}
          <div className="flex items-center gap-1 px-2">
            <span className="text-[0.6875rem] font-semibold text-slate-500 dark:text-slate-400">Voltage:</span>
            {[2, 4, 6, 8].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  onVoltageChange(v);
                  playAudioClick(500 + v * 30, 'sine');
                }}
                className={`rounded-lg px-2 py-1 text-xs font-mono font-bold transition-all cursor-pointer ${
                  circuitState.sourceVoltage === v
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {v}V
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-800" />

          {/* One-Way Plug Key Toggle */}
          <button
            type="button"
            onClick={() => {
              onTogglePlugKey();
              playAudioClick(circuitState.isPlugKeyInserted ? 300 : 700, 'square');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
              circuitState.isPlugKeyInserted
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Key: {circuitState.isPlugKeyInserted ? 'INSERTED (CLOSED)' : 'REMOVED (OPEN)'}</span>
          </button>
        </div>

        {/* Right: Rheostat Resistance Slider */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 shadow-xl">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[0.6875rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Rheostat Contact
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {circuitState.rheostatResistance.toFixed(1)} Ω
              </span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={circuitState.rheostatResistance}
            onChange={(e) => {
              onRheostatChange(parseFloat(e.target.value));
              playAudioClick(400 + parseFloat(e.target.value) * 5, 'sine');
            }}
            className="w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
