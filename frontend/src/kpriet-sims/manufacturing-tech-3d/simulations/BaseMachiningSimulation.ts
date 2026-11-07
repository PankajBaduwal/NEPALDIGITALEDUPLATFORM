/**
 * Base Three.js Simulation Environment for Manufacturing Technology - I
 * Provides scene management, responsive camera controls, lighting, and resource disposal.
 */

import * as THREE from 'three';

export abstract class BaseMachiningSimulation {
  protected container: HTMLElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected animationFrameId: number | null = null;
  protected isDisposed = false;

  // Interaction State (Pointer drag camera orbit)
  protected isPointerDown = false;
  protected previousPointerPosition = { x: 0, y: 0 };
  protected cameraRadius = 14;
  protected cameraTheta = Math.PI / 4; // azimuth
  protected cameraPhi = Math.PI / 4;   // polar
  protected cameraTarget = new THREE.Vector3(0, 2, 0);

  // Time tracking
  protected clock = new THREE.Clock();

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1120);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.updateCameraPosition();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.setupFloorGrid();
    this.setupEventListeners();
    this.startLoop();
  }

  protected setupLighting(): void {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Main Studio Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(12, 20, 15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Rim / Fill Light for metal specular highlights
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-15, 10, -10);
    this.scene.add(rimLight);

    const accentLight = new THREE.DirectionalLight(0x10b981, 0.4);
    accentLight.position.set(0, -5, 10);
    this.scene.add(accentLight);
  }

  protected setupFloorGrid(): void {
    // Industrial Workshop Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x1e3a5f, 0x0f2238);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);

    // Subtle dark circular platform
    const platformGeo = new THREE.CylinderGeometry(14, 14, 0.2, 48);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x071120,
      roughness: 0.8,
      metalness: 0.2,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.1;
    platform.receiveShadow = true;
    this.scene.add(platform);
  }

  protected setupEventListeners(): void {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('resize', this.onWindowResize);
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.isPointerDown = true;
    this.previousPointerPosition = { x: e.clientX, y: e.clientY };
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isPointerDown) return;

    const deltaX = e.clientX - this.previousPointerPosition.x;
    const deltaY = e.clientY - this.previousPointerPosition.y;

    this.cameraTheta -= deltaX * 0.008;
    this.cameraPhi -= deltaY * 0.008;

    // Limit polar angle to avoid flip
    const eps = 0.05;
    this.cameraPhi = Math.max(eps, Math.min(Math.PI / 2 - 0.02, this.cameraPhi));

    this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    this.updateCameraPosition();
  };

  private onPointerUp = (): void => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.cameraRadius += e.deltaY * 0.012;
    this.cameraRadius = Math.max(4, Math.min(40, this.cameraRadius));
    this.updateCameraPosition();
  };

  protected updateCameraPosition(): void {
    const x = this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.cameraRadius * Math.cos(this.cameraPhi);
    const z = this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);

    this.camera.position.set(x + this.cameraTarget.x, y + this.cameraTarget.y, z + this.cameraTarget.z);
    this.camera.lookAt(this.cameraTarget);
  }

  public resetCamera(radius = 14, targetY = 2, theta = Math.PI / 4, phi = Math.PI / 4): void {
    this.cameraRadius = radius;
    this.cameraTarget.set(0, targetY, 0);
    this.cameraTheta = theta;
    this.cameraPhi = phi;
    this.updateCameraPosition();
  }

  private onWindowResize = (): void => {
    if (this.isDisposed || !this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private startLoop(): void {
    const loop = () => {
      if (this.isDisposed) return;
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      this.updateAnimation(delta, elapsed);
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public abstract updateAnimation(delta: number, elapsed: number): void;
  public abstract updateParameters(params: Record<string, any>): void;

  public dispose(): void {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    el.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onWindowResize);

    // Traverse scene and dispose geometries and materials
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
    if (el.parentElement) {
      el.parentElement.removeChild(el);
    }
  }
}
