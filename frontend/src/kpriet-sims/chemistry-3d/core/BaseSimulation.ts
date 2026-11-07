/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * BaseSimulation Class
 *
 * Provides shared 3D scene initialization, OrbitControls, 5-point studio lighting,
 * delta-time simulation loop, camera animation, component raycasting, and resource cleanup.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  SimulationController,
  SimulationOptions,
  SimulationState,
  StageDefinition,
  ComponentInspectionData,
  ParameterDefinition,
} from './types';
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

  protected get annotations(): AnnotationSystem {
    return this.annotationSystem;
  }

  protected get playbackSpeed(): number {
    return this.speed;
  }

  // Stages and Components
  protected stages: StageDefinition[] = [];
  protected currentStageIndex: number = 0;
  protected components: Map<string, ComponentInspectionData> = new Map();
  protected selectedComponent: ComponentInspectionData | null = null;

  // Operating and View Modes
  protected mode: string = 'default';
  protected viewMode: string = 'standard';
  protected labelsVisible: boolean = true;

  // Dynamic parameters & metrics
  protected parameters: Record<string, number | string | boolean> = {};
  protected metrics: Record<string, number | string> = {};

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

  // Raycaster for 3D interactions
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private onPointerDownHandler: (e: MouseEvent) => void;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    this.container = container;
    this.options = options;

    this.isPlaying = true;
    this.speed = options.playbackSpeed || 1.0;
    this.labelsVisible = options.showLabels !== false;
    this.currentStageIndex = options.initialStage || 0;
    if (options.initialMode) this.mode = options.initialMode;
    if (options.initialViewMode) this.viewMode = options.initialViewMode;

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.theme === 'dark' ? 0x0b131e : 0xffffff); // Clean white laboratory background by default

    // 2. Camera Setup
    const width = container.clientWidth || options.width || 960;
    const height = container.clientHeight || options.height || 600;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 3.5, 9);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = options.enableShadows !== false;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 25.0;
    this.controls.target.set(0, 0, 0);

    // 5. Studio Lighting
    this.setupLighting();

    // 6. Annotation & Particle Systems
    this.annotationSystem = new AnnotationSystem(container, this.camera, (comp) => {
      this.inspectComponent(comp ? comp.id : null);
    });
    this.particleSystem = new ParticleSystem(this.scene);

    // 7. Raycaster interaction
    this.onPointerDownHandler = this.handlePointerDown.bind(this);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDownHandler);

    // 8. Auto-resize observer
    this.setupResizeObserver();

    if (options.onStateChange) {
      this.stateChangeListeners.add(options.onStateChange);
    }

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

    // Subclass Scene Construction
    this.initScene();
    this.initStages();
    this.initComponents();

    if (this.options.initialStage !== undefined && this.options.initialStage < this.stages.length) {
      this.currentStageIndex = this.options.initialStage;
    }

    // Register initial labels
    this.syncAnnotations();

    // Start Animation Loop
    this.lastTimestamp = performance.now();
    this.animate(this.lastTimestamp);

    // Initial state notification
    this.notifyState();
  }

  protected setupLighting() {
    // 1. Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // 2. Uniform ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // 3. Primary Key directional light
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(8, 12, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    // 4. Front Fill Light
    const frontFill = new THREE.DirectionalLight(0xf8fafc, 1.4);
    frontFill.position.set(0, 4, 12);
    this.scene.add(frontFill);

    // 5. Left Fill Light
    const leftFill = new THREE.DirectionalLight(0xe2e8f0, 1.0);
    leftFill.position.set(-10, 6, 6);
    this.scene.add(leftFill);

    // 6. Back Rim Light
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 10, -10);
    this.scene.add(rimLight);
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.isDisposed || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    });
    this.resizeObserver.observe(this.container);
  }

  // Pointer Click Selection
  private handlePointerDown(event: MouseEvent) {
    if (event.button !== 0) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const inspectableMeshes: THREE.Object3D[] = [];
    this.components.forEach((comp) => {
      if (comp.meshRef && comp.meshRef.visible) {
        inspectableMeshes.push(comp.meshRef);
      }
    });

    const intersects = this.raycaster.intersectObjects(inspectableMeshes, true);
    if (intersects.length > 0 && intersects[0]) {
      let hitObj: THREE.Object3D | null = intersects[0].object;
      let matchedComp: ComponentInspectionData | null = null;
      while (hitObj && !matchedComp) {
        for (const comp of this.components.values()) {
          if (comp.meshRef === hitObj) {
            matchedComp = comp;
            break;
          }
        }
        hitObj = hitObj.parent;
      }
      if (matchedComp) {
        this.inspectComponent(matchedComp.id);
        return;
      }
    }
  }

  // Main Render Loop
  private animate(timestamp: number) {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame((t) => this.animate(t));

    const deltaSec = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    if (this.isPlaying) {
      this.currentTime += deltaSec * this.speed;
      this.updateSimulation(deltaSec * this.speed, this.currentTime);
      this.particleSystem.update(deltaSec * this.speed);
    }

    // Smooth Camera Transitions
    if (this.isCameraTransitioning) {
      this.cameraTransitionProgress += deltaSec / this.cameraTransitionDuration;
      const t = Math.min(this.cameraTransitionProgress, 1.0);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      this.camera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, ease);
      this.controls.target.lerpVectors(this.cameraStartTarget, this.cameraEndTarget, ease);
      if (t >= 1.0) {
        this.isCameraTransitioning = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (this.labelsVisible) {
      this.annotationSystem.update();
    }
  }

  public animateCameraTo(
    endPos: [number, number, number],
    endTarget: [number, number, number] = [0, 0, 0],
    durationSeconds: number = 1.0
  ) {
    this.cameraStartPos.copy(this.camera.position);
    this.cameraEndPos.set(...endPos);
    this.cameraStartTarget.copy(this.controls.target);
    this.cameraEndTarget.set(...endTarget);
    this.cameraTransitionDuration = durationSeconds;
    this.cameraTransitionProgress = 0;
    this.isCameraTransitioning = true;
  }

  // Annotation Registration
  protected syncAnnotations() {
    this.annotationSystem.clear();
    const stage = this.stages[this.currentStageIndex];
    const highlightIds = stage?.highlightComponentIds;

    this.components.forEach((comp) => {
      if (!highlightIds || highlightIds.length === 0 || highlightIds.includes(comp.id)) {
        this.annotationSystem.register(comp);
      }
    });
  }

  public setTheme(theme: 'light' | 'dark') {
    if (this.scene) {
      this.scene.background = new THREE.Color(theme === 'dark' ? 0x0b131e : 0xffffff);
    }
    if (this.annotationSystem) {
      this.annotationSystem.setTheme(theme);
    }
  }

  // Abstract Methods for Subclasses
  protected abstract initScene(): void;
  protected abstract initStages(): void;
  protected abstract initComponents(): void;
  protected abstract updateSimulation(delta: number, time: number): void;

  // Controller API Implementations
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
    this.setStage(0);
    this.resetCamera();
    this.inspectComponent(null);
    this.play();
  }

  public setSpeed(speed: number) {
    this.speed = Math.max(0.1, Math.min(speed, 5.0));
    this.notifyState();
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setStage(stageIndex: number) {
    if (!this.isInitialized) this.init();
    if (stageIndex >= 0 && stageIndex < this.stages.length) {
      this.currentStageIndex = stageIndex;
      const stage = this.stages[stageIndex];
      if (stage && stage.recommendedCamera) {
        this.animateCameraTo(
          stage.recommendedCamera.position,
          stage.recommendedCamera.target,
          1.2
        );
      }
      this.onStageChanged(stageIndex);
      this.syncAnnotations();
      this.notifyState();
    }
  }

  protected onStageChanged(_stageIndex: number): void {}

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
    if (!this.isInitialized) this.init();
    return [...this.stages];
  }

  public setMode(mode: string) {
    this.mode = mode;
    this.onModeChanged(mode);
    this.notifyState();
  }

  protected onModeChanged(_mode: string): void {}

  public getMode(): string {
    return this.mode;
  }

  public setViewMode(viewMode: string) {
    this.viewMode = viewMode;
    this.onViewModeChanged(viewMode);
    this.notifyState();
  }

  protected onViewModeChanged(_viewMode: string): void {}

  public getViewMode(): string {
    return this.viewMode;
  }

  public resetCamera() {
    this.animateCameraTo([0, 3.5, 9], [0, 0, 0], 0.8);
  }

  public setCameraPreset(name: string) {
    switch (name.toLowerCase()) {
      case 'front':
        this.animateCameraTo([0, 0, 9.5], [0, 0, 0], 0.8);
        break;
      case 'top':
        this.animateCameraTo([0, 11, 0.01], [0, 0, 0], 0.8);
        break;
      case 'side':
        this.animateCameraTo([9.5, 0.5, 0], [0, 0, 0], 0.8);
        break;
      case 'isometric':
      default:
        this.animateCameraTo([5.5, 4.5, 6.5], [0, 0, 0], 0.8);
        break;
    }
  }

  public inspectComponent(componentId: string | null) {
    if (!componentId) {
      this.selectedComponent = null;
      this.annotationSystem.selectItem(null);
    } else {
      const comp = this.components.get(componentId) || null;
      this.selectedComponent = comp;
      this.annotationSystem.selectItem(componentId);
    }
    if (this.options.onComponentSelect) {
      this.options.onComponentSelect(this.selectedComponent);
    }
    this.notifyState();
  }

  public toggleLabels(visible?: boolean) {
    this.labelsVisible = visible !== undefined ? visible : !this.labelsVisible;
    this.annotationSystem.setVisible(this.labelsVisible);
    this.notifyState();
  }

  public getComponents(): ComponentInspectionData[] {
    if (!this.isInitialized) this.init();
    return Array.from(this.components.values());
  }

  public setParameter(key: string, value: number | string | boolean) {
    this.parameters[key] = value;
    this.onParameterChanged(key, value);
    this.notifyState();
  }

  public getParameter(key: string): number | string | boolean | undefined {
    return this.parameters[key];
  }

  public getParameterDefinitions?(): ParameterDefinition[];

  protected onParameterChanged(_key: string, _value: number | string | boolean): void {}

  public getState(): SimulationState {
    if (!this.isInitialized) this.init();
    return {
      isPlaying: this.isPlaying,
      speed: this.speed,
      currentTime: this.currentTime,
      currentStageIndex: this.currentStageIndex,
      mode: this.mode,
      viewMode: this.viewMode,
      selectedComponent: this.selectedComponent,
      labelsVisible: this.labelsVisible,
      metrics: { ...this.metrics },
      parameters: { ...this.parameters },
    };
  }

  public onStateChange(callback: (state: SimulationState) => void): () => void {
    this.stateChangeListeners.add(callback);
    if (this.isInitialized) {
      callback(this.getState());
    }
    return () => this.stateChangeListeners.delete(callback);
  }

  protected notifyState() {
    const st = this.getState();
    this.stateChangeListeners.forEach((cb) => cb(st));
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDownHandler);

    this.particleSystem.dispose();
    this.annotationSystem.dispose();
    this.controls.dispose();

    // Traverse and dispose materials and geometries
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
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.stateChangeListeners.clear();
  }
}
