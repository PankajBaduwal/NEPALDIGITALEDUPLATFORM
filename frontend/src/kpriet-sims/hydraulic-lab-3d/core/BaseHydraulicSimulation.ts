import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface IApparatusComponent {
  id: string;
  name: string;
  mesh: THREE.Object3D;
  description: string;
  specifications?: string;
  formula?: string;
}

export abstract class BaseHydraulicSimulation {
  protected container: HTMLElement;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected animId: number | null = null;
  protected isDisposed = false;
  protected components: Map<string, IApparatusComponent> = new Map();
  protected raycaster: THREE.Raycaster = new THREE.Raycaster();
  protected mouse: THREE.Vector2 = new THREE.Vector2();
  protected onComponentSelected?: (comp: IApparatusComponent | null) => void;

  constructor(
    container: HTMLElement,
    onComponentSelected?: (comp: IApparatusComponent | null) => void
  ) {
    this.container = container;
    this.onComponentSelected = onComponentSelected;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1120); // Dark engineering slate navy
    this.scene.fog = new THREE.FogExp2(0x0b1120, 0.035);

    // 2. Camera
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(2.8, 2.2, 3.4);

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
    this.renderer.toneMappingExposure = 1.15;

    container.replaceChildren(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 0.4;
    this.controls.maxDistance = 18;
    this.controls.target.set(0, 0.65, 0);

    // 5. Lighting
    this.setupLighting();

    // 6. Hydraulic Laboratory Bench & Environment
    this.setupLabEnvironment();

    // 7. Event listeners
    window.addEventListener('resize', this.onWindowResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);

    // 8. Animation loop
    this.lastTime = performance.now();
    this.startLoop();
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambient);

    // Key studio overhead light
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 1.4);
    keyLight.position.set(3, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Blueish fluid fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-4, 3, -2);
    this.scene.add(fillLight);

    // Cyan accent rim light
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.4);
    rimLight.position.set(0, 4, -4);
    this.scene.add(rimLight);
  }

  private setupLabEnvironment(): void {
    // Durable industrial lab floor
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Floor grid
    const grid = new THREE.GridHelper(20, 20, 0x0284c7, 0x1e293b);
    grid.position.y = 0.001;
    this.scene.add(grid);

    // Heavy-duty stainless steel hydraulic test bench
    const benchGroup = new THREE.Group();

    // Bench Top
    const topGeo = new THREE.BoxGeometry(2.4, 0.08, 1.2);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.3,
    });
    const benchTop = new THREE.Mesh(topGeo, topMat);
    benchTop.position.set(0, 0.5, 0);
    benchTop.castShadow = true;
    benchTop.receiveShadow = true;
    benchGroup.add(benchTop);

    // Bench Legs (4 structural square tubes)
    const legGeo = new THREE.BoxGeometry(0.06, 0.5, 0.06);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.4,
    });
    const legPositions: [number, number, number][] = [
      [-1.12, 0.25, -0.52],
      [1.12, 0.25, -0.52],
      [-1.12, 0.25, 0.52],
      [1.12, 0.25, 0.52],
    ];
    legPositions.forEach((pos) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      leg.receiveShadow = true;
      benchGroup.add(leg);
    });

    // Lower drainage sump tank
    const sumpGeo = new THREE.BoxGeometry(1.6, 0.22, 0.8);
    const sumpMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.65,
    });
    const sump = new THREE.Mesh(sumpGeo, sumpMat);
    sump.position.set(0, 0.12, 0);
    benchGroup.add(sump);

    this.scene.add(benchGroup);
  }

  protected registerComponent(
    id: string,
    name: string,
    mesh: THREE.Object3D,
    description: string,
    specifications?: string,
    formula?: string
  ): void {
    mesh.userData = { componentId: id };
    this.components.set(id, {
      id,
      name,
      mesh,
      description,
      specifications,
      formula,
    });
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.onComponentSelected) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let selected: IApparatusComponent | null = null;
    for (const hit of intersects) {
      let cur: THREE.Object3D | null = hit.object;
      while (cur && cur !== this.scene) {
        if (cur.userData && cur.userData.componentId) {
          const comp = this.components.get(cur.userData.componentId);
          if (comp) {
            selected = comp;
            break;
          }
        }
        cur = cur.parent;
      }
      if (selected) break;
    }
    this.onComponentSelected(selected);
  };

  private lastTime = 0;

  private startLoop(): void {
    const animate = (now: number) => {
      if (this.isDisposed) return;
      this.animId = requestAnimationFrame(animate);

      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      this.controls.update();
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
    };
    this.animId = requestAnimationFrame(animate);
  }

  protected abstract update(dt: number): void;

  private onWindowResize = (): void => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public resetCamera(): void {
    this.camera.position.set(2.8, 2.2, 3.4);
    this.controls.target.set(0, 0.65, 0);
    this.controls.update();
  }

  public dispose(): void {
    this.isDisposed = true;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.controls.dispose();

    // Traverse and clean up resources
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

    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
