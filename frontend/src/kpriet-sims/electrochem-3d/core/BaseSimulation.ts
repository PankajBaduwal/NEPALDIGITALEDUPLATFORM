/**
 * BaseSimulation Class
 * Manages Three.js renderer lifecycle, camera animation, input raycasting,
 * delta-time simulation loop, and resource teardown.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  SimulationController,
  SimulationOptions,
  SimulationState,
  StageDefinition,
  ComponentInspectionData,
  SimulationMode,
} from '../types';
import { AnnotationSystem } from './AnnotationSystem';
import { ParticleSystem } from './ParticleSystem';

export abstract class BaseSimulation implements SimulationController {
  protected container: HTMLElement;
  protected options: SimulationOptions;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected annotationSystem: AnnotationSystem;
  protected particleSystem: ParticleSystem;

  // Animation Loop State
  protected animationFrameId: number | null = null;
  protected lastTimestamp: number = 0;
  protected isPlaying: boolean = true;
  protected speed: number = 1.0;
  protected currentTime: number = 0;
  protected isDisposed: boolean = false;

  // Stages and Components
  protected stages: StageDefinition[] = [];
  protected currentStageIndex: number = 0;
  protected components: Map<string, ComponentInspectionData> = new Map();
  protected selectedComponent: ComponentInspectionData | null = null;

  // Operating and Inspection Mode
  protected mode: SimulationMode = 'discharge';
  protected inspectionMode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic' = 'assembled';
  protected labelsVisible: boolean = true;

  // Observers & Listeners
  private resizeObserver: ResizeObserver | null = null;
  private stateChangeListeners: Set<(state: SimulationState) => void> = new Set();

  // Camera Animation Transition State
  private isCameraTransitioning: boolean = false;
  private cameraStartPos = new THREE.Vector3();
  private cameraEndPos = new THREE.Vector3();
  private cameraStartTarget = new THREE.Vector3();
  private cameraEndTarget = new THREE.Vector3();
  private cameraTransitionProgress: number = 0;
  private cameraTransitionDuration: number = 1.0;

  // Default camera home
  protected defaultCameraPosition = new THREE.Vector3(6, 4, 7);
  protected defaultCameraTarget = new THREE.Vector3(0, 0, 0);

  // Common Materials Store for disposal
  protected allocatedMaterials: THREE.Material[] = [];
  protected allocatedGeometries: THREE.BufferGeometry[] = [];

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    this.container = container;
    this.options = options;

    if (options.initialMode) this.mode = options.initialMode;
    if (options.initialInspectionMode) this.inspectionMode = options.initialInspectionMode;
    if (options.playbackSpeed !== undefined) this.speed = options.playbackSpeed;
    if (options.showLabels !== undefined) this.labelsVisible = options.showLabels;

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b131e); // Clean neutral dark studio slate

    // 2. Camera Setup
    const width = container.clientWidth || options.width || 960;
    const height = container.clientHeight || options.height || 540;
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.copy(this.defaultCameraPosition);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    if (options.enableShadows !== false) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
    }

    // Attach canvas to container with styling
    const canvas = this.renderer.domElement;
    Object.assign(canvas.style, {
      display: 'block',
      width: '100%',
      height: '100%',
      outline: 'none',
      userSelect: 'none',
    });
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.appendChild(canvas);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 30;
    this.controls.minDistance = 1.0;
    this.controls.target.copy(this.defaultCameraTarget);

    // 5. Annotation & Particle Systems
    this.annotationSystem = new AnnotationSystem(container, this.camera, (comp) => {
      this.selectedComponent = comp;
      if (this.options.onComponentSelect) {
        this.options.onComponentSelect(comp);
      }
      this.notifyState();
    });
    this.annotationSystem.setVisible(this.labelsVisible);

    this.particleSystem = new ParticleSystem(this.scene);

    // 6. Setup Lighting
    this.setupLighting();

    // 7. Setup Event Listeners
    this.setupEventListeners();

    // Safety fallback: auto-initialize on next microtask if child doesn't call init()
    queueMicrotask(() => {
      if (!this.isInitialized && !this.isDisposed) {
        this.init();
      }
    });
  }

  private isInitialized = false;

  /**
   * Initializes child stages, 3D scene geometry, annotations, and starts the render loop.
   * Called by the child class constructor immediately after super() to ensure all child
   * class field initializers (THREE.Groups, Models, arrays) are fully instantiated.
   */
  public init(): void {
    if (this.isInitialized || this.isDisposed) return;
    this.isInitialized = true;

    // Child Implementation Calls
    this.buildStages();
    this.buildScene();
    this.registerAllComponents();

    if (this.options.initialStage !== undefined && this.options.initialStage < this.stages.length) {
      this.currentStageIndex = this.options.initialStage;
    }

    // Start Animation Loop
    this.lastTimestamp = performance.now();
    this.tick(this.lastTimestamp);

    this.notifyState();
  }

  protected setupLighting() {
    // 1. Hemisphere Light (Soft sky light from above, subtle floor bounce from below)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // 2. Uniform ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // 3. Primary Key directional light (Upper Front Right)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(8, 12, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.0005;
    const d = 8;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    this.scene.add(keyLight);

    // 4. Front Fill Light (Directly illuminates front face so metallic casing and plates are never in dark shadow)
    const frontFill = new THREE.DirectionalLight(0xf8fafc, 1.4);
    frontFill.position.set(0, 4, 12);
    this.scene.add(frontFill);

    // 5. Left Soft Fill Light
    const leftFill = new THREE.DirectionalLight(0xe2e8f0, 1.0);
    leftFill.position.set(-10, 6, 6);
    this.scene.add(leftFill);

    // 6. Back Rim Light (Clean rim highlights on top lid and terminals)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 10, -10);
    this.scene.add(rimLight);
  }

  private setupEventListeners() {
    // Resize Observer
    this.resizeObserver = new ResizeObserver(() => {
      if (this.isDisposed) return;
      this.handleResize();
    });
    this.resizeObserver.observe(this.container);

    // Raycast canvas click
    const canvas = this.renderer.domElement;
    canvas.addEventListener('click', this.onCanvasClick.bind(this));
  }

  private handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width <= 0 || height <= 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onCanvasClick(event: MouseEvent) {
    if (this.isDisposed) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

    // Collect all component meshes
    const meshMap = new Map<THREE.Object3D, ComponentInspectionData>();
    this.components.forEach((comp) => {
      if (comp.meshRef) {
        comp.meshRef.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            meshMap.set(child, comp);
          }
        });
      }
    });

    const intersects = raycaster.intersectObjects(Array.from(meshMap.keys()), true);
    if (intersects.length > 0 && intersects[0]) {
      const hit = intersects[0].object;
      const comp = meshMap.get(hit);
      if (comp) {
        this.inspectComponent(comp.id);
        return;
      }
    }

    // If clicked empty space, unselect
    this.inspectComponent(null);
  }

  // ── Abstract Methods for Specific Simulations ─────────────────────────
  protected abstract buildStages(): void;
  protected abstract buildScene(): void;
  protected abstract registerAllComponents(): void;
  protected abstract updateModel(deltaTime: number): void;
  protected abstract onStageChanged(stage: StageDefinition): void;
  protected abstract onModeChanged(mode: SimulationMode): void;
  protected abstract onInspectionModeChanged(mode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic'): void;
  public abstract getModelMetrics(): Record<string, number | string>;

  // ── Animation Loop ───────────────────────────────────────────────────
  private tick = (timestamp: number) => {
    if (this.isDisposed) return;

    const rawDelta = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    const delta = this.isPlaying ? rawDelta * this.speed : 0;
    if (this.isPlaying) {
      this.currentTime += delta;
    }

    // 1. Update Camera Tween
    if (this.isCameraTransitioning) {
      this.cameraTransitionProgress += rawDelta / this.cameraTransitionDuration;
      const t = Math.min(1.0, this.cameraTransitionProgress);
      // Smooth cubic easeInOut
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, ease);
      this.controls.target.lerpVectors(this.cameraStartTarget, this.cameraEndTarget, ease);

      if (t >= 1.0) {
        this.isCameraTransitioning = false;
      }
    }

    // 2. Update Controls
    this.controls.update();

    // 3. Update Model
    this.updateModel(delta);

    // 4. Update Particles
    this.particleSystem.update(delta, this.speed);

    // 5. Render Three.js Scene
    this.renderer.render(this.scene, this.camera);

    // 6. Update 2D Screen Annotations
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.annotationSystem.update(w, h);

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  // ── Controller Interface Implementation ──────────────────────────────
  public play() {
    this.isPlaying = true;
    this.notifyState();
  }

  public pause() {
    this.isPlaying = false;
    this.notifyState();
  }

  public reset() {
    this.currentTime = 0;
    this.currentStageIndex = 0;
    this.resetCamera();
    if (this.stages[0]) {
      this.onStageChanged(this.stages[0]);
    }
    this.notifyState();
  }

  public setSpeed(speed: number) {
    this.speed = Math.max(0.1, Math.min(4.0, speed));
    this.notifyState();
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setStage(stageIndex: number) {
    if (stageIndex >= 0 && stageIndex < this.stages.length) {
      this.currentStageIndex = stageIndex;
      const stage = this.stages[stageIndex];
      if (stage) {
        this.onStageChanged(stage);

        if (stage.recommendedCamera) {
          this.transitionCamera(
            new THREE.Vector3(...stage.recommendedCamera.position),
            new THREE.Vector3(...stage.recommendedCamera.target)
          );
        }
      }

      this.notifyState();
    }
  }

  public getStage(): number {
    return this.currentStageIndex;
  }

  public nextStage() {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.setStage(this.currentStageIndex + 1);
    }
  }

  public prevStage() {
    if (this.currentStageIndex > 0) {
      this.setStage(this.currentStageIndex - 1);
    }
  }

  public getStages(): StageDefinition[] {
    return this.stages;
  }

  public setMode(mode: SimulationMode) {
    this.mode = mode;
    this.onModeChanged(mode);
    this.notifyState();
  }

  public getMode(): SimulationMode {
    return this.mode;
  }

  public setInspectionMode(mode: 'assembled' | 'cutaway' | 'exploded' | 'microscopic') {
    this.inspectionMode = mode;
    this.onInspectionModeChanged(mode);
    this.notifyState();
  }

  public getInspectionMode(): 'assembled' | 'cutaway' | 'exploded' | 'microscopic' {
    return this.inspectionMode;
  }

  public resetCamera() {
    this.transitionCamera(this.defaultCameraPosition, this.defaultCameraTarget, 0.8);
  }

  public transitionCamera(
    targetPosition: THREE.Vector3,
    targetLookAt: THREE.Vector3,
    duration: number = 1.0
  ) {
    this.cameraStartPos.copy(this.camera.position);
    this.cameraEndPos.copy(targetPosition);
    this.cameraStartTarget.copy(this.controls.target);
    this.cameraEndTarget.copy(targetLookAt);
    this.cameraTransitionProgress = 0;
    this.cameraTransitionDuration = duration;
    this.isCameraTransitioning = true;
  }

  public setCameraPreset(name: string) {
    if (name === 'front') {
      this.transitionCamera(new THREE.Vector3(0, 2, 8), new THREE.Vector3(0, 0, 0));
    } else if (name === 'top') {
      this.transitionCamera(new THREE.Vector3(0, 10, 0.1), new THREE.Vector3(0, 0, 0));
    } else if (name === 'side') {
      this.transitionCamera(new THREE.Vector3(8, 2, 0), new THREE.Vector3(0, 0, 0));
    } else if (name === 'iso') {
      this.resetCamera();
    }
  }

  public inspectComponent(componentId: string | null) {
    if (componentId && this.components.has(componentId)) {
      this.selectedComponent = this.components.get(componentId)!;
      this.annotationSystem.selectComponent(componentId);
    } else {
      this.selectedComponent = null;
      this.annotationSystem.selectComponent(null);
    }
    this.notifyState();
  }

  public toggleLabels(visible?: boolean) {
    this.labelsVisible = visible !== undefined ? visible : !this.labelsVisible;
    this.annotationSystem.setVisible(this.labelsVisible);
    this.notifyState();
  }

  public getComponents(): ComponentInspectionData[] {
    return Array.from(this.components.values());
  }

  public setParameter(_key: string, _value: number | string | boolean) {
    // Override in subclass
    this.notifyState();
  }

  public getParameter(_key: string): number | string | boolean | undefined {
    return undefined;
  }

  public getState(): SimulationState {
    return {
      isPlaying: this.isPlaying,
      speed: this.speed,
      currentTime: this.currentTime,
      currentStageIndex: this.currentStageIndex,
      mode: this.mode,
      inspectionMode: this.inspectionMode,
      selectedComponent: this.selectedComponent,
      labelsVisible: this.labelsVisible,
      metrics: this.getModelMetrics(),
    };
  }

  public onStateChange(callback: (state: SimulationState) => void): () => void {
    this.stateChangeListeners.add(callback);
    callback(this.getState());
    return () => {
      this.stateChangeListeners.delete(callback);
    };
  }

  protected notifyState() {
    if (this.isDisposed) return;
    const state = this.getState();
    if (this.options.onStateChange) {
      this.options.onStateChange(state);
    }
    this.stateChangeListeners.forEach((cb) => cb(state));
  }

  // ── Disposal and Teardown ─────────────────────────────────────────────
  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.stateChangeListeners.clear();
    this.annotationSystem.dispose();
    this.particleSystem.dispose();
    this.controls.dispose();

    // Dispose all tracked geometries & materials
    this.allocatedGeometries.forEach((g) => g.dispose());
    this.allocatedGeometries = [];
    this.allocatedMaterials.forEach((m) => m.dispose());
    this.allocatedMaterials = [];

    // Traverse scene and dispose meshes
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });

    this.renderer.dispose();
    this.renderer.forceContextLoss();

    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
