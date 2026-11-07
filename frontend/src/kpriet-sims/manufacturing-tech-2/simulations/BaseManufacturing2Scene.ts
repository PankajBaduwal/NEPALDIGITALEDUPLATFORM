/**
 * Base Three.js Simulation Environment for Manufacturing Technology – II (U25ME401)
 * Provides camera orbit controls, industrial lighting, workshop floor, and memory cleanup.
 */

import * as THREE from 'three';

export abstract class BaseManufacturing2Scene {
  protected container: HTMLElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected animationFrameId: number | null = null;
  protected isDisposed = false;

  // Pointer drag orbit interaction
  protected isPointerDown = false;
  protected previousPointerPosition = { x: 0, y: 0 };
  protected cameraRadius = 14;
  protected cameraTheta = Math.PI / 4;
  protected cameraPhi = Math.PI / 4;
  protected cameraTarget = new THREE.Vector3(0, 1.5, 0);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(12, 20, 15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-15, 10, -10);
    this.scene.add(rimLight);

    const accentLight = new THREE.DirectionalLight(0x10b981, 0.4);
    accentLight.position.set(0, -5, 10);
    this.scene.add(accentLight);
  }

  protected setupFloorGrid(): void {
    const gridHelper = new THREE.GridHelper(30, 30, 0x1e3a5f, 0x0f2238);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);

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

  protected updateCameraPosition(): void {
    this.cameraPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.cameraPhi));
    const x = this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.cameraRadius * Math.cos(this.cameraPhi);
    const z = this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);

    this.camera.position.set(
      x + this.cameraTarget.x,
      y + this.cameraTarget.y,
      z + this.cameraTarget.z
    );
    this.camera.lookAt(this.cameraTarget);
  }

  protected setupEventListeners(): void {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      const deltaX = e.clientX - this.previousPointerPosition.x;
      const deltaY = e.clientY - this.previousPointerPosition.y;

      this.cameraTheta -= deltaX * 0.007;
      this.cameraPhi -= deltaY * 0.007;
      this.updateCameraPosition();

      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraRadius += e.deltaY * 0.01;
      this.cameraRadius = Math.max(3, Math.min(35, this.cameraRadius));
      this.updateCameraPosition();
    }, { passive: false });

    window.addEventListener('resize', this.handleResize);
  }

  protected handleResize = (): void => {
    if (this.isDisposed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public resetCamera(): void {
    this.cameraRadius = 14;
    this.cameraTheta = Math.PI / 4;
    this.cameraPhi = Math.PI / 4;
    this.cameraTarget.set(0, 1.5, 0);
    this.updateCameraPosition();
  }

  protected startLoop(): void {
    const loop = () => {
      if (this.isDisposed) return;
      this.animationFrameId = requestAnimationFrame(loop);
      const delta = this.clock.getDelta();
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  public abstract update(delta: number): void;

  public dispose(): void {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
