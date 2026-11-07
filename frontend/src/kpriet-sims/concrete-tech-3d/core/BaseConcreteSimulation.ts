import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export abstract class BaseConcreteSimulation {
  protected container: HTMLElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected animId: number | null = null;
  protected isDisposed = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d); // Deep concrete lab slate
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);

    // 2. Camera
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(2.4, 2.0, 3.2);

    // 3. Renderer
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
    this.renderer.toneMappingExposure = 1.2;

    container.replaceChildren(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 15;
    this.controls.target.set(0, 0.75, 0);

    // 5. Studio Lighting
    this.setupLighting();

    // 6. Concrete Laboratory Floor
    this.setupLabFloor();

    // 7. Event listeners
    window.addEventListener('resize', this.onWindowResize);

    // 8. Start loop
    this.startLoop();
  }

  private setupLighting(): void {
    const amb = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(amb);

    // Warm overhead industrial pendant light
    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.5);
    keyLight.position.set(3, 7, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Cool blueish side fill
    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.6);
    fillLight.position.set(-4, 4, -2);
    this.scene.add(fillLight);

    // Subtle yellow rim
    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.4);
    rimLight.position.set(0, 5, -4);
    this.scene.add(rimLight);
  }

  private setupLabFloor(): void {
    // Durable industrial screed floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Lab safety guide grid
    const grid = new THREE.GridHelper(20, 40, 0x0284c7, 0x334155);
    grid.position.y = 0.001;
    this.scene.add(grid);
  }

  private onWindowResize = (): void => {
    if (!this.container || this.isDisposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight || 1;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private startLoop(): void {
    const loop = (time: number) => {
      if (this.isDisposed) return;
      this.controls.update();
      this.onUpdate(time);
      this.renderer.render(this.scene, this.camera);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public resetCamera(pos = new THREE.Vector3(2.4, 2.0, 3.2), target = new THREE.Vector3(0, 0.75, 0)): void {
    this.camera.position.copy(pos);
    this.controls.target.copy(target);
    this.controls.update();
  }

  public setTopView(): void {
    this.camera.position.set(0, 4.5, 0.01);
    this.controls.target.set(0, 0.75, 0);
    this.controls.update();
  }

  public setFrontView(): void {
    this.camera.position.set(0, 1.2, 3.5);
    this.controls.target.set(0, 0.75, 0);
    this.controls.update();
  }

  protected abstract onUpdate(time: number): void;

  public dispose(): void {
    this.isDisposed = true;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.controls.dispose();

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

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
