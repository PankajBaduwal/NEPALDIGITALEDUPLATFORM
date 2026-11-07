/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * Master BaseSimulation Abstract Class
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  PhysicsSimulationController,
  SimulationOptions,
  SimulationState,
  StageDefinition,
  ComponentInspectionData,
  ParameterDefinition,
} from './types';
import { AnnotationSystem } from './AnnotationSystem';
import { ParticleSystem } from './ParticleSystem';

export abstract class BaseSimulation implements PhysicsSimulationController {
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

  // Stages & Components
  protected stages: StageDefinition[] = [];
  protected currentStageIndex: number = 0;
  protected components: Map<string, ComponentInspectionData> = new Map();
  protected selectedComponent: ComponentInspectionData | null = null;

  // Operating & View Modes
  protected mode: string = 'default';
  protected viewMode: string = 'standard';
  protected labelsVisible: boolean = true;

  // Dynamic parameters & physics metrics
  protected parameters: Record<string, number | string | boolean> = {};
  protected metrics: Record<string, number | string> = {};

  // Listeners & Observers
  private resizeObserver: ResizeObserver | null = null;
  private stateChangeListeners: Set<(state: SimulationState) => void> = new Set();

  // Camera Animation Transition State
  private isCameraTransitioning: boolean = false;
  private cameraStartPos = new THREE.Vector3();
  private cameraEndPos = new THREE.Vector3();
  private cameraStartTarget = new THREE.Vector3();
  private cameraEndTarget = new THREE.Vector3();
  private cameraTransitionProgress: number = 0;
  private cameraTransitionDuration: number = 0.8;

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
    this.scene.background = new THREE.Color(options.theme === 'dark' ? 0x07111e : 0xffffff);

    // 2. Camera Setup
    const width = container.clientWidth || options.width || 960;
    const height = container.clientHeight || options.height || 600;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 3.5, 9);

    // 3. WebGL Renderer with Headless / Fallback Support
    let rendererInstance: THREE.WebGLRenderer | null = null;
    let canvasEl: HTMLCanvasElement | null = null;
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        rendererInstance = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        });
        rendererInstance.setSize(width, height);
        rendererInstance.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        rendererInstance.shadowMap.enabled = options.enableShadows !== false;
        rendererInstance.shadowMap.type = THREE.PCFShadowMap;
        rendererInstance.toneMapping = THREE.ACESFilmicToneMapping;
        rendererInstance.toneMappingExposure = 1.15;
        if (this.container && typeof this.container.appendChild === 'function') {
          this.container.appendChild(rendererInstance.domElement);
        }
        canvasEl = rendererInstance.domElement;
      }
    } catch {
      // Headless test environment or WebGL unsupported
    }

    if (!rendererInstance) {
      canvasEl = (typeof document !== 'undefined'
        ? document.createElement('canvas')
        : ({
            addEventListener: () => {},
            removeEventListener: () => {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 600 }),
          } as any));
      rendererInstance = {
        setSize: () => {},
        setPixelRatio: () => {},
        render: () => {},
        dispose: () => {},
        domElement: canvasEl,
        shadowMap: {},
      } as any;
    }
    this.renderer = rendererInstance as THREE.WebGLRenderer;

    // 4. OrbitControls
    try {
      if (typeof window !== 'undefined' && canvasEl) {
        this.controls = new OrbitControls(this.camera, canvasEl);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
        this.controls.minDistance = 1.0;
        this.controls.maxDistance = 30.0;
        this.controls.target.set(0, 0, 0);
      } else {
        this.controls = { update: () => {}, dispose: () => {}, target: new THREE.Vector3() } as any;
      }
    } catch {
      this.controls = { update: () => {}, dispose: () => {}, target: new THREE.Vector3() } as any;
    }

    // 5. Studio Lighting
    this.setupLighting();

    // 6. Annotation & Particle Systems
    this.annotationSystem = new AnnotationSystem(container, this.camera, (comp) => {
      this.inspectComponent(comp ? comp.id : null);
    });
    this.particleSystem = new ParticleSystem(this.scene);

    // 7. Raycaster interaction
    this.onPointerDownHandler = this.handlePointerDown.bind(this);
    if (this.renderer?.domElement?.addEventListener) {
      this.renderer.domElement.addEventListener('pointerdown', this.onPointerDownHandler);
    }

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

  protected abstract initScene(): void;
  protected abstract initStages(): void;
  protected abstract initComponents(): void;
  protected abstract updatePhysics(deltaTime: number): void;

  public getParameterDefinitions(): ParameterDefinition[] {
    return [];
  }

  protected setupLighting() {
    // Ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    // Key directional light with soft shadow
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 40;
    this.scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    fillLight.position.set(-8, 6, -6);
    this.scene.add(fillLight);

    // Back / Rim Light
    const rimLight = new THREE.DirectionalLight(0x34d399, 0.5);
    rimLight.position.set(0, -6, -8);
    this.scene.add(rimLight);
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined' || !this.container || typeof (this.container as any).nodeType !== 'number') return;
    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.isDisposed || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.annotationSystem.update();
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private handlePointerDown(e: MouseEvent) {
    if (this.isDisposed) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj && obj !== this.scene) {
        if (obj.userData && obj.userData.componentId) {
          this.inspectComponent(obj.userData.componentId);
          return;
        }
        obj = obj.parent;
      }
    }
  }

  private animate = (timestamp: number) => {
    if (this.isDisposed) return;

    if (typeof requestAnimationFrame === 'function') {
      this.animationFrameId = requestAnimationFrame(this.animate);
    }

    const rawDelta = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    const delta = Math.min(rawDelta, 0.1); // clamp delta to prevent teleporting

    if (this.isPlaying) {
      this.currentTime += delta * this.speed;
      this.updatePhysics(delta * this.speed);
      this.particleSystem.update(delta * this.speed);
    }

    if (this.isCameraTransitioning) {
      this.cameraTransitionProgress += delta / this.cameraTransitionDuration;
      if (this.cameraTransitionProgress >= 1.0) {
        this.cameraTransitionProgress = 1.0;
        this.isCameraTransitioning = false;
        this.camera.position.copy(this.cameraEndPos);
        this.controls.target.copy(this.cameraEndTarget);
      } else {
        const t = this.easeInOutCubic(this.cameraTransitionProgress);
        this.camera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, t);
        this.controls.target.lerpVectors(this.cameraStartTarget, this.cameraEndTarget, t);
      }
    }

    this.controls.update();
    this.annotationSystem.update();
    this.renderer.render(this.scene, this.camera);
  };

  private easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  public animateCameraTo(targetPos: THREE.Vector3, lookTarget: THREE.Vector3, duration: number = 0.8) {
    this.cameraStartPos.copy(this.camera.position);
    this.cameraEndPos.copy(targetPos);
    this.cameraStartTarget.copy(this.controls.target);
    this.cameraEndTarget.copy(lookTarget);
    this.cameraTransitionDuration = Math.max(duration, 0.1);
    this.cameraTransitionProgress = 0;
    this.isCameraTransitioning = true;
  }

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
    this.syncAnnotations();
    this.notifyState();
  }

  public setSpeed(speed: number) {
    this.speed = Math.max(0.1, Math.min(speed, 5.0));
    this.notifyState();
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

  public setStage(index: number) {
    if (index >= 0 && index < this.stages.length) {
      this.currentStageIndex = index;
      const stage = this.stages[index];
      if (stage && stage.recommendedCamera) {
        this.animateCameraTo(
          new THREE.Vector3(...stage.recommendedCamera.position),
          new THREE.Vector3(...stage.recommendedCamera.target)
        );
      }
      this.syncAnnotations();
      this.notifyState();
    }
  }

  public getStages(): StageDefinition[] {
    return this.stages;
  }

  public getMode(): string {
    return this.mode;
  }

  public setMode(mode: string) {
    this.mode = mode;
    this.notifyState();
  }

  public getViewMode(): string {
    return this.viewMode;
  }

  public setViewMode(viewMode: string) {
    this.viewMode = viewMode;
    this.notifyState();
  }

  public setTheme(theme: 'light' | 'dark') {
    this.options.theme = theme;
    if (this.scene) {
      this.scene.background = new THREE.Color(theme === 'dark' ? 0x07111e : 0xffffff);
    }
    this.notifyState();
  }

  public resetCamera() {
    this.animateCameraTo(new THREE.Vector3(0, 3.5, 9), new THREE.Vector3(0, 0, 0), 0.6);
  }

  public setCameraPreset(name: string) {
    switch (name) {
      case 'front':
        this.animateCameraTo(new THREE.Vector3(0, 1.5, 9), new THREE.Vector3(0, 0, 0));
        break;
      case 'top':
        this.animateCameraTo(new THREE.Vector3(0, 12, 0.001), new THREE.Vector3(0, 0, 0));
        break;
      case 'side':
        this.animateCameraTo(new THREE.Vector3(9, 1.5, 0), new THREE.Vector3(0, 0, 0));
        break;
      case 'isometric':
        this.animateCameraTo(new THREE.Vector3(7, 7, 7), new THREE.Vector3(0, 0, 0));
        break;
      case 'detail':
        this.animateCameraTo(new THREE.Vector3(0, 1.0, 3.5), new THREE.Vector3(0, 0, 0));
        break;
      default:
        this.resetCamera();
        break;
    }
  }

  public inspectComponent(componentId: string | null) {
    if (!componentId) {
      this.selectedComponent = null;
    } else {
      this.selectedComponent = this.components.get(componentId) || null;
    }
    if (this.options.onComponentSelect) {
      this.options.onComponentSelect(this.selectedComponent);
    }
    this.notifyState();
  }

  public toggleLabels(visible?: boolean) {
    this.labelsVisible = visible !== undefined ? visible : !this.labelsVisible;
    this.annotationSystem.setVisibility(this.labelsVisible);
    this.notifyState();
  }

  public getComponents(): ComponentInspectionData[] {
    return Array.from(this.components.values());
  }

  public setParameter(key: string, value: number | string | boolean) {
    this.parameters[key] = value;
    this.onParameterChanged(key, value);
    this.notifyState();
  }

  protected onParameterChanged(_key: string, _value: number | string | boolean) {
    // Override in subclass
  }

  public getParameter(key: string): number | string | boolean | undefined {
    return this.parameters[key];
  }

  protected syncAnnotations() {
    this.annotationSystem.clear();
    const stage = this.stages[this.currentStageIndex];
    const highlighted = new Set(stage?.highlightComponentIds || []);

    this.components.forEach((comp) => {
      if (highlighted.size === 0 || highlighted.has(comp.id)) {
        const obj = this.scene.getObjectByName(comp.id);
        if (obj) {
          const worldPos = new THREE.Vector3();
          obj.getWorldPosition(worldPos);
          worldPos.y += 0.4;
          this.annotationSystem.register(comp.id, comp.name, worldPos, comp);
        }
      }
    });
  }

  public getState(): SimulationState {
    return {
      currentStageIndex: this.currentStageIndex,
      totalStages: this.stages.length,
      isPlaying: this.isPlaying,
      playbackSpeed: this.speed,
      simulatedTimeSeconds: this.currentTime,
      mode: this.mode,
      viewMode: this.viewMode,
      labelsVisible: this.labelsVisible,
      theme: this.options.theme || 'light',
      selectedComponentId: this.selectedComponent ? this.selectedComponent.id : null,
      parameters: { ...this.parameters },
      metrics: { ...this.metrics },
      isDisposed: this.isDisposed,
    };
  }

  public onStateChange(callback: (state: SimulationState) => void): () => void {
    this.stateChangeListeners.add(callback);
    return () => {
      this.stateChangeListeners.delete(callback);
    };
  }

  protected notifyState() {
    if (this.isDisposed) return;
    const st = this.getState();
    this.stateChangeListeners.forEach((cb) => {
      try {
        cb(st);
      } catch (e) {
        console.error('State callback error:', e);
      }
    });
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationFrameId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.renderer?.domElement?.removeEventListener) {
      this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDownHandler);
    }

    this.annotationSystem.dispose();
    this.particleSystem.dispose();
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
