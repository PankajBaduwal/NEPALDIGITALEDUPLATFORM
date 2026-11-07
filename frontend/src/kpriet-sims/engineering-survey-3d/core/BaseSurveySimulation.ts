/**
 * Engineering Survey (U25CE303) — Base 3D Field Simulation
 * B.E. Civil Engineering — Semester III
 * PiyushDhara Eduverse Academic Portal
 *
 * Provides outdoor terrain, directional sunlight, camera controls,
 * reticle sight view, and full Three.js memory lifecycle management.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export abstract class BaseSurveySimulation {
  protected container: HTMLElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected animId: number | null = null;
  protected isDisposed = false;

  // View mode: 'free' orbit view or 'reticle' (looking directly through the telescope eyepiece)
  protected isReticleMode = false;
  protected reticleCamera: THREE.PerspectiveCamera | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Daylight sky blue
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.008);

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
    this.camera.position.set(0, 4.5, 9.0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    container.replaceChildren(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.01; // Keep above terrain horizon
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 120;
    this.controls.target.set(0, 1.4, 0);

    // 5. Environmental Lighting
    this.setupOutdoorEnvironment();

    // 6. Base Field Terrain
    this.setupFieldTerrain();

    // 7. Event listeners
    window.addEventListener('resize', this.onWindowResize);

    // 8. Start loop
    this.startLoop();
  }

  private setupOutdoorEnvironment(): void {
    // Ambient natural daylight
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x3f6212, 0.65); // Sky light to grass bounce
    this.scene.add(hemi);

    // Primary Solar Directional Light
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
    sunLight.position.set(30, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    const d = 35;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    this.scene.add(sunLight);

    // Distant soft warm fill
    const fill = new THREE.DirectionalLight(0xfef3c7, 0.4);
    fill.position.set(-25, 20, -30);
    this.scene.add(fill);
  }

  protected setupFieldTerrain(): void {
    // Procedural terrain plane with subtle undulations
    const width = 120;
    const depth = 120;
    const segs = 64;
    const terrainGeo = new THREE.PlaneGeometry(width, depth, segs, segs);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vz = pos.getZ(i);
        // Gentle slope and rolling ground
        const vy =
          0.35 * Math.sin(vx * 0.08) * Math.cos(vz * 0.08) +
          0.15 * Math.sin(vz * 0.15) -
          (vz * 0.015); // subtle natural gradient
        pos.setY(i, vy);
      }
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f, // Olive-grass green
      roughness: 0.9,
      metalness: 0.05,
      flatShading: false,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    this.scene.add(terrainMesh);

    // North Arrow indicator in world coordinates (+Z is South, -Z is North, +X is East)
    this.createNorthIndicator();
  }

  private createNorthIndicator(): void {
    const northGroup = new THREE.Group();
    northGroup.position.set(-15, 0.2, -15);

    // Base circle
    const circGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32);
    const circMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const circle = new THREE.Mesh(circGeo, circMat);
    circle.receiveShadow = true;
    northGroup.add(circle);

    // North arrow cone pointing along -Z
    const arrowGeo = new THREE.ConeGeometry(0.35, 1.5, 16);
    arrowGeo.rotateX(-Math.PI / 2);
    const arrowMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.set(0, 0.1, -0.6);
    northGroup.add(arrow);

    this.scene.add(northGroup);
  }

  public setReticleMode(enabled: boolean): void {
    this.isReticleMode = enabled;
  }

  public getIsReticleMode(): boolean {
    return this.isReticleMode;
  }

  public resetCamera(): void {
    this.camera.position.set(0, 4.5, 9.0);
    this.controls.target.set(0, 1.4, 0);
    this.controls.update();
  }

  private onWindowResize = (): void => {
    if (!this.container || this.isDisposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight || 1;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    if (this.reticleCamera) {
      this.reticleCamera.aspect = w / h;
      this.reticleCamera.updateProjectionMatrix();
    }

    this.renderer.setSize(w, h);
  };

  private startLoop(): void {
    const animate = (): void => {
      if (this.isDisposed) return;
      this.animId = requestAnimationFrame(animate);

      this.updateSimulation();

      if (!this.isReticleMode) {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      } else if (this.reticleCamera) {
        this.renderer.render(this.scene, this.reticleCamera);
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  protected abstract updateSimulation(): void;

  public dispose(): void {
    this.isDisposed = true;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    window.removeEventListener('resize', this.onWindowResize);
    this.controls.dispose();

    // Traverse and dispose all materials, geometries, and textures
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
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
