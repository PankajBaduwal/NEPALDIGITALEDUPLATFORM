/**
 * PiyushDhara Eduverse — 3D Highway Engineering Simulation Laboratory
 * Course: U25CE402 — Highway Engineering (Civil Engineering, Semester IV)
 * Base Three.js Simulation Infrastructure with Lighting, OrbitControls, and Raycasting
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { IHighwayComponentInfo } from './types';

export interface IBaseHighwaySimulationOptions {
  canvas: HTMLCanvasElement;
  onComponentSelected?: (info: IHighwayComponentInfo) => void;
  onStatusChange?: (status: string) => void;
}

export abstract class BaseHighwaySimulation {
  protected canvas: HTMLCanvasElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected animationFrameId: number | null = null;
  protected isDisposed = false;
  protected clock: THREE.Clock;

  protected raycaster: THREE.Raycaster;
  protected mouse: THREE.Vector2;
  protected interactiveObjects: Map<THREE.Object3D, IHighwayComponentInfo> = new Map();
  protected onComponentSelected?: (info: IHighwayComponentInfo) => void;
  protected onStatusChange?: (status: string) => void;

  protected highwayGroup: THREE.Group;
  protected defaultCameraPos = new THREE.Vector3(12, 8, 16);
  protected defaultTarget = new THREE.Vector3(0, 1.0, 0);

  constructor(options: IBaseHighwaySimulationOptions) {
    this.canvas = options.canvas;
    this.onComponentSelected = options.onComponentSelected;
    this.onStatusChange = options.onStatusChange;

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 1. Scene setup with sky atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Slate-900 engineering dark theme
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.025);

    // 2. Camera setup
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    this.camera.position.copy(this.defaultCameraPos);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.copy(this.defaultTarget);
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 120.0;

    // 5. Highway Group & Environment
    this.highwayGroup = new THREE.Group();
    this.scene.add(this.highwayGroup);
    this.setupEnvironment();

    // 6. Listeners
    this.canvas.addEventListener('click', this.onCanvasClick);
    this.canvas.addEventListener('pointermove', this.onCanvasPointerMove);
    window.addEventListener('resize', this.onWindowResize);

    // 7. Start Loop
    this.startRenderLoop();
  }

  private setupEnvironment(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    // Key sunlight
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sunLight.position.set(25, 35, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Secondary fill light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-20, 15, -15);
    this.scene.add(fillLight);

    // Ground Grid & Subgrade terrain plane
    const gridHelper = new THREE.GridHelper(80, 40, 0x059669, 0x334155);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);

    const terrainGeo = new THREE.PlaneGeometry(120, 120);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.05;
    terrain.receiveShadow = true;
    this.scene.add(terrain);
  }

  private startRenderLoop(): void {
    const animate = () => {
      if (this.isDisposed) return;
      this.animationFrameId = requestAnimationFrame(animate);

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      this.controls.update();
      this.update(delta, elapsed);
      this.renderer.render(this.scene, this.camera);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  protected registerInteractive(obj: THREE.Object3D, info: IHighwayComponentInfo): void {
    obj.userData = { interactiveInfo: info };
    this.interactiveObjects.set(obj, info);
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData = { interactiveInfo: info, parentInteractive: obj };
      }
    });
  }

  private onCanvasClick = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.interactiveObjects.keys()), true);

    if (intersects.length > 0 && intersects[0]) {
      let hit: THREE.Object3D | null = intersects[0].object;
      while (hit && !hit.userData.interactiveInfo && hit.parent) {
        hit = hit.parent;
      }
      const info = hit?.userData?.interactiveInfo as IHighwayComponentInfo | undefined;
      if (info && this.onComponentSelected) {
        this.onComponentSelected(info);
      }
    }
  };

  private onCanvasPointerMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.interactiveObjects.keys()), true);
    this.canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
  };

  private onWindowResize = (): void => {
    if (this.isDisposed) return;
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 600;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  public resetCamera(): void {
    this.camera.position.copy(this.defaultCameraPos);
    this.controls.target.copy(this.defaultTarget);
    this.controls.update();
  }

  public resize(): void {
    this.onWindowResize();
  }

  public abstract update(delta: number, elapsed: number): void;

  public dispose(): void {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.canvas.removeEventListener('click', this.onCanvasClick);
    this.canvas.removeEventListener('pointermove', this.onCanvasPointerMove);
    window.removeEventListener('resize', this.onWindowResize);

    this.controls.dispose();

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}
