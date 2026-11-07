/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Course: U25CE404 — Geotechnical Engineering I (Civil Engineering, Semester IV)
 * Base Three.js Simulation Infrastructure with Lighting, OrbitControls, and Raycasting
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { IGeotechnicalComponentInfo } from './types';

export interface IBaseGeotechnicalSimulationOptions {
  canvas: HTMLCanvasElement;
  onComponentSelected?: (info: IGeotechnicalComponentInfo) => void;
  onStatusChange?: (status: string) => void;
}

export abstract class BaseGeotechnicalSimulation {
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
  protected interactiveObjects: Map<THREE.Object3D, IGeotechnicalComponentInfo> = new Map();
  protected onComponentSelected?: (info: IGeotechnicalComponentInfo) => void;
  protected onStatusChange?: (status: string) => void;

  protected labGroup: THREE.Group;
  protected defaultCameraPos = new THREE.Vector3(4, 3, 5);
  protected defaultTarget = new THREE.Vector3(0, 1.0, 0);

  constructor(options: IBaseGeotechnicalSimulationOptions) {
    this.canvas = options.canvas;
    this.onComponentSelected = options.onComponentSelected;
    this.onStatusChange = options.onStatusChange;

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Slate 900
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.05);

    // 2. Camera
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
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
    this.renderer.toneMappingExposure = 1.1;

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.copy(this.defaultTarget);
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Prevent going underneath floor
    this.controls.minDistance = 1.0;
    this.controls.maxDistance = 25.0;

    // 5. Studio Environment
    this.labGroup = new THREE.Group();
    this.scene.add(this.labGroup);
    this.setupStudioEnvironment();

    // 6. Raycasting Events
    this.canvas.addEventListener('click', this.onCanvasClick);
    this.canvas.addEventListener('pointermove', this.onCanvasPointerMove);
    window.addEventListener('resize', this.onWindowResize);

    // 7. Start Render Loop
    this.startRenderLoop();
  }

  private setupStudioEnvironment(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    keyLight.position.set(6, 10, 7);
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

    // Fill Rim Light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.5);
    fillLight.position.set(-6, 5, -5);
    this.scene.add(fillLight);

    // Floor Grid
    const grid = new THREE.GridHelper(16, 32, 0x10b981, 0x1e293b);
    grid.position.y = 0;
    this.scene.add(grid);

    // Studio Base Plate
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  protected createLaboratoryBench(width = 4.0, depth = 2.0, height = 0.85): THREE.Group {
    const benchGroup = new THREE.Group();

    // Worktop (anti-corrosive epoxy granite top)
    const topGeo = new THREE.BoxGeometry(width, 0.08, depth);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.4,
    });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = height;
    top.castShadow = true;
    top.receiveShadow = true;
    benchGroup.add(top);

    // Frame (Powder coated structural steel)
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, height, 16);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2,
    });

    const halfW = width / 2 - 0.1;
    const halfD = depth / 2 - 0.1;
    const legY = height / 2;

    const corners: [number, number, number][] = [
      [-halfW, legY, -halfD],
      [halfW, legY, -halfD],
      [-halfW, legY, halfD],
      [halfW, legY, halfD],
    ];

    corners.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      benchGroup.add(leg);
    });

    // Lower storage shelf
    const shelfGeo = new THREE.BoxGeometry(width - 0.2, 0.03, depth - 0.2);
    const shelf = new THREE.Mesh(shelfGeo, topMat);
    shelf.position.y = 0.2;
    shelf.receiveShadow = true;
    benchGroup.add(shelf);

    return benchGroup;
  }

  protected registerInteractive(obj: THREE.Object3D, info: IGeotechnicalComponentInfo): void {
    obj.traverse((child) => {
      this.interactiveObjects.set(child, info);
    });
  }

  private onCanvasClick = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.interactiveObjects.keys()), false);

    if (intersects.length > 0 && intersects[0]?.object) {
      const info = this.interactiveObjects.get(intersects[0].object);
      if (info && this.onComponentSelected) {
        this.onComponentSelected(info);
      }
    }
  };

  private onCanvasPointerMove = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.interactiveObjects.keys()), false);
    this.canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
  };

  private onWindowResize = (): void => {
    if (!this.canvas || this.isDisposed) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  public resetCamera(): void {
    this.camera.position.copy(this.defaultCameraPos);
    this.controls.target.copy(this.defaultTarget);
    this.controls.update();
  }

  private startRenderLoop(): void {
    const animate = (): void => {
      if (this.isDisposed) return;
      this.animationFrameId = requestAnimationFrame(animate);

      const delta = this.clock.getDelta();
      this.controls.update();
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  public abstract update(delta: number): void;

  public dispose(): void {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.canvas.removeEventListener('click', this.onCanvasClick);
    this.canvas.removeEventListener('pointermove', this.onCanvasPointerMove);
    window.removeEventListener('resize', this.onWindowResize);

    this.controls.dispose();

    // Dispose scene objects
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}
