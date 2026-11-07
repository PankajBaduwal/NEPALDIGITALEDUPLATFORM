import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  ComponentInspectionData,
  ParameterControlDefinition,
  SimulationController,
  SimulationState,
  StageDefinition,
} from './types';

export abstract class BaseFluidMachinerySimulation implements SimulationController {
  protected container: HTMLElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected state: SimulationState;
  protected stages: StageDefinition[] = [];
  protected availableParameters: ParameterControlDefinition[] = [];
  protected listeners: Set<(state: SimulationState) => void> = new Set();
  protected animationFrameId: number | null = null;
  protected raycaster: THREE.Raycaster;
  protected mouse: THREE.Vector2;
  protected isDisposed: boolean = false;
  protected initialCameraPosition: THREE.Vector3 = new THREE.Vector3(3.5, 2.5, 4.0);
  protected initialCameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0.8, 0);

  // Reusable materials
  protected steelMaterial: THREE.MeshStandardMaterial;
  protected castIronMaterial: THREE.MeshStandardMaterial;
  protected brassMaterial: THREE.MeshStandardMaterial;
  protected acrylicMaterial: THREE.MeshPhysicalMaterial;
  protected waterMaterial: THREE.MeshPhysicalMaterial;
  protected mercuryMaterial: THREE.MeshStandardMaterial;
  protected floorMaterial: THREE.MeshStandardMaterial;

  constructor(container: HTMLElement) {
    this.container = container;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.state = {
      currentStageIndex: 0,
      isPlaying: true,
      speed: 1.0,
      playbackSpeed: 1.0,
      currentTime: 0,
      timeElapsed: 0,
      mode: 'normal',
      viewMode: 'standard',
      selectedComponent: null,
      activeComponentId: null,
      labelsVisible: true,
      metrics: {},
      parameters: {},
      selectedParameterValues: {},
    };

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Deep slate
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.04);

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.copy(this.initialCameraPosition);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.copy(this.initialCameraTarget);
    this.controls.maxDistance = 25;
    this.controls.minDistance = 0.5;

    // 5. Materials
    this.steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
    });

    this.castIronMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.6,
    });

    this.brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.3,
    });

    this.acrylicMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.38,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.05,
      ior: 1.49,
    });

    this.waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7, // Vibrant azure blue
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      transmission: 0.85,
      ior: 1.333,
    });

    this.mercuryMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.98,
      roughness: 0.05,
    });

    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });

    // 6. Lighting
    this.setupLighting();

    // 7. Base Environment
    this.buildLaboratoryFloor();

    // 8. Event listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('click', this.onClick);

    // 9. Start render loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  protected setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-6, 4, -4);
    this.scene.add(fillLight);

    const floorLight = new THREE.DirectionalLight(0xffffff, 0.2);
    floorLight.position.set(0, -5, 0);
    this.scene.add(floorLight);
  }

  protected buildLaboratoryFloor(): void {
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(20, 20, 0x0284c7, 0x334155);
    grid.position.y = 0.005;
    this.scene.add(grid);
  }

  private onResize = (): void => {
    if (this.isDisposed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onClick = (event: MouseEvent): void => {
    if (this.isDisposed) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      let cur: THREE.Object3D | null = hit.object;
      while (cur && cur !== this.scene) {
        if (cur.userData && cur.userData.inspection) {
          const comp = cur.userData.inspection as ComponentInspectionData;
          this.state.selectedComponent = comp;
          this.state.activeComponentId = comp.id;
          this.notify();
          return;
        }
        cur = cur.parent;
      }
    }
  };

  protected animate(): void {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = 0.016 * this.state.playbackSpeed;
    if (this.state.isPlaying) {
      this.state.currentTime += delta;
      this.state.timeElapsed += delta;
      this.updatePhysics(delta);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  protected abstract updatePhysics(delta: number): void;

  public resetCamera(): void {
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.target.copy(this.initialCameraTarget);
    this.controls.update();
  }

  public play(): void {
    this.state.isPlaying = true;
    this.notify();
  }

  public pause(): void {
    this.state.isPlaying = false;
    this.notify();
  }

  public setSpeed(speed: number): void {
    this.state.playbackSpeed = speed;
    this.state.speed = speed;
    this.notify();
  }

  public nextStage(): void {
    if (this.state.currentStageIndex < this.stages.length - 1) {
      this.setStage(this.state.currentStageIndex + 1);
    }
  }

  public prevStage(): void {
    if (this.state.currentStageIndex > 0) {
      this.setStage(this.state.currentStageIndex - 1);
    }
  }

  public setStage(index: number): void {
    if (index >= 0 && index < this.stages.length) {
      this.state.currentStageIndex = index;
      const stage = this.stages[index];
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

  public getState(): SimulationState {
    return { ...this.state };
  }

  public setParameter(key: string, value: number | string | boolean): void {
    this.state.parameters[key] = value;
    this.state.selectedParameterValues[key] = value;
    this.onParameterChanged(key, value);
    this.notify();
  }

  protected abstract onParameterChanged(key: string, value: number | string | boolean): void;

  public getStages(): StageDefinition[] {
    return this.stages;
  }

  public getAvailableParameters(): ParameterControlDefinition[] {
    return this.availableParameters;
  }

  public getInspectedComponent(): ComponentInspectionData | null {
    return this.state.selectedComponent;
  }

  public setViewMode(mode: 'standard' | 'cutaway' | 'streamlines' | 'energy-line'): void {
    this.state.viewMode = mode;
    this.notify();
  }

  public toggleLabels(visible: boolean): void {
    this.state.labelsVisible = visible;
    this.notify();
  }

  public onStateChange(listener: (state: SimulationState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  protected notify(): void {
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }

  public dispose(): void {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    if (this.renderer?.domElement) {
      this.renderer.domElement.removeEventListener('click', this.onClick);
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
    this.controls.dispose();
    this.renderer.dispose();
    this.listeners.clear();
  }
}
