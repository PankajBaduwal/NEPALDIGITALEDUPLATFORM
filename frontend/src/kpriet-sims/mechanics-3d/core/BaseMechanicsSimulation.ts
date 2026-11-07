/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * BaseMechanicsSimulation — Shared 3D Simulation Controller Base Class
 *
 * Provides shared Three.js scene management, OrbitControls, studio lighting,
 * high-framerate rendering loop, deterministic physics time stepping,
 * stage transitions, annotation leader lines, and full resource disposal.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  SimulationController,
  SimulationOptions,
  SimulationState,
  StageDefinition,
  ComponentInspectionData,
} from './types';
import { MechanicsAnnotationSystem } from './MechanicsAnnotationSystem';

export abstract class BaseMechanicsSimulation implements SimulationController {
  // DOM & Rendering
  protected container: HTMLElement;
  protected renderer: THREE.WebGLRenderer;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected controls: OrbitControls;
  protected resizeObserver: ResizeObserver | null = null;

  // Framework Subsystems
  protected annotationSystem: MechanicsAnnotationSystem;

  // State Management
  protected isPlaying: boolean = false;
  protected speed: number = 1.0;
  protected currentTime: number = 0;
  protected currentStageIndex: number = 0;
  protected mode: string = 'default';
  protected viewMode: string = 'default';
  protected theme: 'light' | 'dark' = 'light';
  protected parameters: Record<string, number | string | boolean> = {};
  protected metrics: Record<string, number | string> = {};
  protected stages: StageDefinition[] = [];
  protected components: Map<string, ComponentInspectionData> = new Map();
  protected selectedComponentId: string | null = null;
  protected labelsVisible: boolean = true;

  // Animation Loop
  private animationFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Callbacks
  private onStateChangeCallback?: (state: SimulationState) => void;
  private onComponentSelectCallback?: (component: ComponentInspectionData | null) => void;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    this.container = container;
    this.speed = options.playbackSpeed ?? 1.0;
    this.currentStageIndex = options.initialStage ?? 0;
    this.mode = options.initialMode ?? 'default';
    this.viewMode = options.initialViewMode ?? 'default';
    this.theme = options.theme ?? 'light';
    this.labelsVisible = options.showLabels ?? true;
    this.onStateChangeCallback = options.onStateChange;
    this.onComponentSelectCallback = options.onComponentSelect;

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.theme === 'dark' ? 0x0f172a : 0xffffff);

    // 2. Camera Setup
    const width = container.clientWidth || options.width || 960;
    const height = container.clientHeight || options.height || 600;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 3, 7);
    this.camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.48; // keep above ground
    this.controls.minDistance = 1.0;
    this.controls.maxDistance = 25.0;

    // 5. Studio Lighting
    this.setupLighting();

    // 6. Annotation System
    this.annotationSystem = new MechanicsAnnotationSystem(
      container,
      (id) => this.inspectComponent(id),
      this.theme
    );

    // 7. Auto-Resize Observer
    this.setupResizeObserver();

    // 8. Raycaster for 3D component selection
    this.setupRaycasting();
  }

  protected init(): void {
    this.initStages();
    this.initComponents();
    this.initScene();
    this.syncAnnotations();
    this.applyStageCamera(this.currentStageIndex, true);
    this.startLoop();
    this.notifyState();
  }

  private setupLighting(): void {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, this.theme === 'dark' ? 0.7 : 0.85);
    this.scene.add(ambientLight);

    // Key Directional Light (with soft shadows)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(6, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
    fillLight.position.set(-6, 4, -4);
    this.scene.add(fillLight);

    // Back / Rim Light
    const rimLight = new THREE.DirectionalLight(0xffedd5, 0.35);
    rimLight.position.set(0, 5, -8);
    this.scene.add(rimLight);
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
          this.annotationSystem.update(this.camera);
        }
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private setupRaycasting(): void {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.renderer.domElement.addEventListener('click', (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const meshes: THREE.Object3D[] = [];
      this.components.forEach((c) => {
        if (c.meshRef) meshes.push(c.meshRef);
      });

      const intersects = raycaster.intersectObjects(meshes, true);
      if (intersects.length > 0) {
        const hit = intersects[0]!.object;
        let matchedId: string | null = null;
        this.components.forEach((c, id) => {
          if (c.meshRef && (c.meshRef === hit || c.meshRef.getObjectById(hit.id))) {
            matchedId = id;
          }
        });
        if (matchedId) {
          this.inspectComponent(matchedId);
        }
      }
    });
  }

  // Animation Loop
  private startLoop(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);

      if (this.isPlaying) {
        this.currentTime += delta * this.speed;
        this.updatePhysics(delta * this.speed);
      }

      this.update(delta);
      this.updateVisuals(delta);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.annotationSystem.update(this.camera);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  // Playback Control
  public play(): void {
    this.isPlaying = true;
    this.notifyState();
  }

  public pause(): void {
    this.isPlaying = false;
    this.notifyState();
  }

  public reset(): void {
    this.currentTime = 0;
    this.isPlaying = false;
    this.onReset();
    this.resetCamera();
    this.notifyState();
  }

  public setSpeed(speed: number): void {
    this.speed = Math.max(0.1, Math.min(speed, 5.0));
    this.notifyState();
  }

  public getSpeed(): number {
    return this.speed;
  }

  // Stage Navigation
  public setStage(stageIndex: number): void {
    if (stageIndex >= 0 && stageIndex < this.stages.length) {
      this.currentStageIndex = stageIndex;
      this.applyStageCamera(stageIndex);
      this.onStageChanged(stageIndex);
      this.syncAnnotations();
      this.notifyState();
    }
  }

  public getStage(): number {
    return this.currentStageIndex;
  }

  public nextStage(): void {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.setStage(this.currentStageIndex + 1);
    }
  }

  public prevStage(): void {
    if (this.currentStageIndex > 0) {
      this.setStage(this.currentStageIndex - 1);
    }
  }

  public previousStage(): void {
    this.prevStage();
  }

  public resetExperiment(): void {
    this.reset();
  }

  public setPlaybackSpeed(speed: number): void {
    this.setSpeed(speed);
  }

  public get playbackSpeed(): number {
    return this.speed;
  }

  public getInspectedComponent(): ComponentInspectionData | null {
    if (this.selectedComponentId) {
      return this.components.get(this.selectedComponentId) || null;
    }
    const first = this.components.values().next();
    return first.done ? null : first.value;
  }

  public onComponentInspect(callback: (component: ComponentInspectionData | null) => void): void {
    this.onComponentSelectCallback = callback;
  }

  protected get annotations(): MechanicsAnnotationSystem {
    return this.annotationSystem;
  }

  protected get inspectedComponent(): ComponentInspectionData | null {
    return this.getInspectedComponent();
  }

  protected set inspectedComponent(val: ComponentInspectionData | null) {
    if (val) {
      this.components.set(val.id, val);
      this.selectedComponentId = val.id;
      if (this.onComponentSelectCallback) {
        this.onComponentSelectCallback(val);
      }
    }
  }

  protected update(_deltaSeconds: number): void {}

  public getStages(): StageDefinition[] {
    return this.stages;
  }

  // Parameter & Mode Control
  public setMode(mode: string): void {
    this.mode = mode;
    this.onModeChanged(mode);
    this.notifyState();
  }

  public getMode(): string {
    return this.mode;
  }

  public setViewMode(viewMode: string): void {
    this.viewMode = viewMode;
    this.notifyState();
  }

  public getViewMode(): string {
    return this.viewMode;
  }

  public setParameter(key: string, value: number | string | boolean): void {
    this.parameters[key] = value;
    this.onParameterChanged(key, value);
    this.notifyState();
  }

  public getParameter(key: string): number | string | boolean | undefined {
    return this.parameters[key];
  }

  public setTheme(theme: 'light' | 'dark'): void {
    this.theme = theme;
    if (this.scene) {
      this.scene.background = new THREE.Color(theme === 'dark' ? 0x0f172a : 0xffffff);
    }
    if (this.annotationSystem) {
      this.annotationSystem.setTheme(theme);
    }
  }

  // Camera Controls
  public resetCamera(): void {
    this.applyStageCamera(this.currentStageIndex, true);
  }

  public setCameraPreset(name: string): void {
    if (name === 'front') {
      this.animateCamera(new THREE.Vector3(0, 1.5, 6), new THREE.Vector3(0, 0.5, 0));
    } else if (name === 'top') {
      this.animateCamera(new THREE.Vector3(0, 8, 0.1), new THREE.Vector3(0, 0, 0));
    } else if (name === 'side') {
      this.animateCamera(new THREE.Vector3(6, 1.5, 0), new THREE.Vector3(0, 0.5, 0));
    } else if (name === 'iso') {
      this.animateCamera(new THREE.Vector3(4, 3.5, 5), new THREE.Vector3(0, 0.5, 0));
    }
  }

  protected applyStageCamera(stageIndex: number, immediate: boolean = false): void {
    const stage = this.stages[stageIndex];
    if (stage?.recommendedCamera) {
      const pos = new THREE.Vector3(...stage.recommendedCamera.position);
      const target = new THREE.Vector3(...stage.recommendedCamera.target);
      if (immediate) {
        this.camera.position.copy(pos);
        this.controls.target.copy(target);
        this.controls.update();
      } else {
        this.animateCamera(pos, target);
      }
    }
  }

  private animateCamera(targetPos: THREE.Vector3, targetLookAt: THREE.Vector3): void {
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    let progress = 0;

    const step = () => {
      progress += 0.05;
      const smooth = THREE.MathUtils.smoothstep(progress, 0, 1);
      this.camera.position.lerpVectors(startPos, targetPos, smooth);
      this.controls.target.lerpVectors(startTarget, targetLookAt, smooth);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    step();
  }

  // Component Inspection & Annotation
  public inspectComponent(componentId: string | null): void {
    this.selectedComponentId = componentId;
    this.annotationSystem.selectComponent(componentId);
    const comp = componentId ? this.components.get(componentId) || null : null;
    if (this.onComponentSelectCallback) {
      this.onComponentSelectCallback(comp);
    }
    this.notifyState();
  }

  public toggleLabels(visible?: boolean): void {
    this.labelsVisible = visible !== undefined ? visible : !this.labelsVisible;
    this.annotationSystem.toggle(this.labelsVisible);
    this.notifyState();
  }

  protected syncAnnotations(): void {
    this.annotationSystem.clear();
    const stage = this.stages[this.currentStageIndex];
    const highlightIds = stage?.highlightComponentIds;

    this.components.forEach((comp) => {
      if (!highlightIds || highlightIds.length === 0 || highlightIds.includes(comp.id)) {
        this.annotationSystem.register(comp);
      }
    });
  }

  // State Updates & Listeners
  public getState(): SimulationState {
    return {
      isPlaying: this.isPlaying,
      speed: this.speed,
      playbackSpeed: this.speed,
      currentTime: this.currentTime,
      timeElapsed: this.currentTime,
      currentStageIndex: this.currentStageIndex,
      mode: this.mode,
      viewMode: this.viewMode,
      selectedComponent: this.selectedComponentId ? this.components.get(this.selectedComponentId) || null : null,
      activeComponentId: this.selectedComponentId,
      labelsVisible: this.labelsVisible,
      metrics: { ...this.metrics },
      parameters: { ...this.parameters },
      selectedParameterValues: { ...this.parameters },
    };
  }

  public onStateChange(callback: (state: SimulationState) => void): void {
    this.onStateChangeCallback = callback;
  }

  protected notifyState(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.getState());
    }
  }

  // Abstract Methods for Subclasses to Implement
  protected abstract initScene(): void;
  protected abstract initStages(): void;
  protected initComponents(): void {}
  protected updatePhysics(_deltaTime: number): void {}
  protected updateVisuals(_deltaTime: number): void {}
  protected onStageChanged(_stageIndex: number): void {}
  protected onParameterChanged(_key: string, _value: number | string | boolean): void {}
  protected onModeChanged(_mode: string): void {}
  protected onReset(): void {}

  // Cleanup
  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.annotationSystem.dispose();
    this.controls.dispose();

    // Scene disposal
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
