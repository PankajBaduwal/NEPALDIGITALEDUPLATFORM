/**
 * Base Three.js Controller for Materials & Metallurgy 3D Simulations
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export abstract class BaseMetallurgySimulation {
  protected container: HTMLElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected animationFrameId: number | null = null;
  protected clock: THREE.Clock;
  protected isDisposed: boolean = false;
  protected resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Deep slate background

    const width = Math.max(10, container.clientWidth || 800);
    const height = Math.max(10, container.clientHeight || 500);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(5, 5, 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // allow slight under-look

    this.clock = new THREE.Clock();
    this.setupCommonLighting();
    this.setupResizeObserver();
  }

  /**
   * PORT NOTE: the original base constructor called initScene() itself, but a subclass's field initialisers run only
   * after the base constructor returns, so initScene() read fields that were still undefined and the scene never
   * started. The factory now calls boot() once the whole object is built.
   */
  public boot(): void {
    this.initScene();
    this.startAnimationLoop();
  }

  private setupCommonLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(10, 20, 15);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.5); // Cool cyan fill
    dirLight2.position.set(-10, 10, -10);
    this.scene.add(dirLight2);

    const groundGrid = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
    groundGrid.position.y = -0.01;
    this.scene.add(groundGrid);
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
        }
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private startAnimationLoop = (): void => {
    if (this.isDisposed) return;
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    this.controls.update();
    this.updateAnimation(delta, elapsed);
    this.renderer.render(this.scene, this.camera);

    this.animationFrameId = requestAnimationFrame(this.startAnimationLoop);
  };

  public resetCamera(pos = { x: 5, y: 5, z: 8 }, target = { x: 0, y: 1, z: 0 }): void {
    this.camera.position.set(pos.x, pos.y, pos.z);
    this.controls.target.set(target.x, target.y, target.z);
    this.controls.update();
  }

  public dispose(): void {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.controls.dispose();

    // Recursive dispose geometries and materials
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }

  protected abstract initScene(): void;
  public abstract updateAnimation(delta: number, elapsed: number): void;
  public abstract updateParameters(params: Record<string, any>): void;
}
