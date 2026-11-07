/**
 * KPRIET B.E. Mechanical Engineering · R2025 Revised CBCS · Semester III
 * Course: Mechanics of Solids (U25ME303 / Theory with Laboratory - TwL)
 * Base Three.js Simulation Studio with OrbitControls, Raycasting, and Lifecycle Management
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  SimulationController,
  SimulationState,
  SolidMechanicsInspectionItem,
} from './types';

export interface CameraStage {
  name: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  description: string;
}

export abstract class BaseSolidMechanicsSimulation implements SimulationController {
  protected container: HTMLElement | null = null;
  protected scene!: THREE.Scene;
  protected camera!: THREE.PerspectiveCamera;
  protected renderer!: THREE.WebGLRenderer;
  protected controls!: OrbitControls;

  protected state: SimulationState = {
    currentStageIndex: 0,
    selectedParameterValues: {},
    parameters: {},
    metrics: {},
    inspectedItem: null,
    deformationScale: 50,
  };

  protected listeners: Array<(state: SimulationState) => void> = [];
  protected animationFrameId: number | null = null;
  protected clock = new THREE.Clock();
  protected isRunning = true;
  protected stages: CameraStage[] = [];

  protected raycaster = new THREE.Raycaster();
  protected mouse = new THREE.Vector2();
  protected inspectableObjects: THREE.Object3D[] = [];
  private resizeObserver: ResizeObserver | null = null;

  // Standard PBR Materials
  protected steelMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.25,
  });

  protected darkSteelMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.9,
    roughness: 0.35,
  });

  protected copperMaterial = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.8,
    roughness: 0.3,
  });

  protected brassMaterial = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.75,
    roughness: 0.28,
  });

  protected aluminumMaterial = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.6,
    roughness: 0.4,
  });

  protected accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x10b981, // KPRIET Emerald Green
    metalness: 0.5,
    roughness: 0.4,
  });

  protected redMarkerMaterial = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.4,
    roughness: 0.5,
  });

  public async init(container: HTMLElement): Promise<void> {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d); // Deep dark engineering navy

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(2.5, 2.0, 3.2);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 25;
    this.controls.minDistance = 0.5;
    this.controls.target.set(0, 0.8, 0);
    this.controls.update();

    // Lighting
    this.setupLighting();

    // Environment & Grid
    this.setupEnvironment();

    // Specialized Simulation Content
    await this.setupSimulationObjects();

    // Event Listeners
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // Start Loop
    this.clock.start();
    this.animate();
  }

  protected setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6); // Soft blue rim
    dirLight2.position.set(-5, 4, -4);
    this.scene.add(dirLight2);
  }

  protected setupEnvironment(): void {
    // Laboratory Floor Grid
    const grid = new THREE.GridHelper(10, 20, 0x10b981, 0x1e293b);
    grid.position.y = 0;
    this.scene.add(grid);

    // Pedestal Plate
    const plateGeo = new THREE.CylinderGeometry(2.4, 2.5, 0.08, 32);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.5,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = 0.04;
    plate.receiveShadow = true;
    this.scene.add(plate);
  }

  protected abstract setupSimulationObjects(): Promise<void>;

  protected animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    if (this.isRunning) {
      this.updatePhysics(delta);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  protected abstract updatePhysics(delta: number): void;

  protected handleResize(): void {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onPointerDown(event: PointerEvent): void {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.inspectableObjects, true);

    if (intersects.length > 0) {
      let current: THREE.Object3D | null = intersects[0]!.object;
      while (current && !current.userData?.inspection) {
        current = current.parent;
      }
      if (current && current.userData?.inspection) {
        this.state.inspectedItem = current.userData.inspection as SolidMechanicsInspectionItem;
        this.notify();
      }
    }
  }

  public registerInspectable(obj: THREE.Object3D): void {
    this.inspectableObjects.push(obj);
  }

  public setParameter(key: string, value: number | string | boolean): void {
    this.state.parameters[key] = value;
    this.state.selectedParameterValues[key] = value;
    this.onParameterChanged(key, value);
    this.notify();
  }

  protected abstract onParameterChanged(key: string, value: number | string | boolean): void;

  public setStage(stageIndex: number): void {
    if (stageIndex >= 0 && stageIndex < this.stages.length) {
      this.state.currentStageIndex = stageIndex;
      const stage = this.stages[stageIndex];
      if (stage && stage.cameraPosition) {
        this.camera.position.set(...stage.cameraPosition);
      }
      if (stage && stage.cameraTarget) {
        this.controls.target.set(...stage.cameraTarget);
      }
      this.controls.update();
      this.notify();
    }
  }

  public resetCamera(): void {
    if (this.stages.length > 0 && this.stages[0]) {
      this.setStage(0);
    } else {
      this.camera.position.set(2.5, 2.0, 3.2);
      this.controls.target.set(0, 0.8, 0);
      this.controls.update();
    }
  }

  public start(): void {
    this.isRunning = true;
  }

  public pause(): void {
    this.isRunning = false;
  }

  public reset(): void {
    this.resetCamera();
    this.state.inspectedItem = null;
    this.notify();
  }

  public getState(): SimulationState {
    return { ...this.state };
  }

  public subscribe(listener: (state: SimulationState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  protected notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer?.domElement && this.container) {
      this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown.bind(this));
      if (this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
    this.renderer?.dispose();
    this.inspectableObjects = [];
    this.listeners = [];
  }
}
