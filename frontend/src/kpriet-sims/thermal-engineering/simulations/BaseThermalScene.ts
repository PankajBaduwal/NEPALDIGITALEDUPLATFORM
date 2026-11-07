/**
 * Base 3D Three.js Scene for Thermal Engineering Simulations
 * Provides orbit camera, responsive canvas handling, thermal lighting, and resource disposal.
 */

import * as THREE from 'three';

export abstract class BaseThermalScene {
  protected container: HTMLElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected animationFrameId: number | null = null;
  protected resizeObserver: ResizeObserver | null = null;

  // Camera Orbit Controls
  protected isDragging = false;
  protected previousMousePosition = { x: 0, y: 0 };
  protected cameraRadius = 14;
  protected cameraTheta = Math.PI / 4; // Azimuth
  protected cameraPhi = Math.PI / 3;   // Elevation
  protected cameraTarget = new THREE.Vector3(0, 1.5, 0);

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0b0f19'); // Slate 950 industrial dark
    this.scene.fog = new THREE.FogExp2('#0b0f19', 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.updateCameraPosition();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.setupEnvironment();
    this.setupEventListeners();
    this.initScene();
    this.startAnimationLoop();
  }

  protected setupLighting(): void {
    const ambientLight = new THREE.AmbientLight('#94a3b8', 0.8);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.4);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Warm thermal fill light
    const thermalLight = new THREE.PointLight('#f97316', 1.2, 20);
    thermalLight.position.set(-6, 8, -4);
    this.scene.add(thermalLight);

    // Cool ambient rim light
    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.6);
    rimLight.position.set(-8, 5, -8);
    this.scene.add(rimLight);
  }

  protected setupEnvironment(): void {
    // Floor grid
    const grid = new THREE.GridHelper(30, 30, '#334155', '#1e293b');
    grid.position.y = 0;
    this.scene.add(grid);

    // Workshop floor plane
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.85,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  protected setupEventListeners(): void {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.cameraTheta -= deltaX * 0.008;
      this.cameraPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.cameraPhi - deltaY * 0.008));

      this.updateCameraPosition();
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraRadius = Math.max(4, Math.min(30, this.cameraRadius + e.deltaY * 0.015));
      this.updateCameraPosition();
    }, { passive: false });

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

  protected updateCameraPosition(): void {
    const x = this.cameraTarget.x + this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.cameraTarget.y + this.cameraRadius * Math.cos(this.cameraPhi);
    const z = this.cameraTarget.z + this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.cameraTarget);
  }

  public resetCamera(): void {
    this.cameraRadius = 14;
    this.cameraTheta = Math.PI / 4;
    this.cameraPhi = Math.PI / 3;
    this.cameraTarget.set(0, 1.5, 0);
    this.updateCameraPosition();
  }

  protected startAnimationLoop(): void {
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      this.update(delta);
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  public abstract initScene(): void;
  public abstract update(delta: number): void;
  public abstract setParameters(params: any): void;

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
