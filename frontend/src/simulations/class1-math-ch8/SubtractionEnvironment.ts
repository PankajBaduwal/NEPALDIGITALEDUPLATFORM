/**
 * SubtractionEnvironment.ts
 * 3D Three.js Scene for Simulation 01: Subtraction Playground (घटाउ खेलमैदान)
 * Class 1 Mathematics - Chapter 8: Subtraction up to 10 (१० सम्मका सङ्ख्याहरूको घटाउ)
 * Nepal Digital Education Platform
 */

import * as THREE from 'three';

export type SubtractionObjectType = 'APPLES' | 'BANANAS' | 'FLOWERS' | 'BALLS' | 'BIRDS';

export interface ClickedObjectInfo {
  id: number;
  isRemoved: boolean;
}

export class SubtractionEnvironment {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationFrameId: number | null = null;

  // Root Groups
  private playgroundGroup = new THREE.Group();
  private mainStation = new THREE.Group();    // Starting group (table + basket)
  private removalStation = new THREE.Group(); // Removal basket

  // Countable Meshes
  public activeObjects: THREE.Group[] = [];
  public removedObjectIndices: Set<number> = new Set();

  // State
  private currentType: SubtractionObjectType = 'APPLES';
  private totalCount: number = 6;
  public onObjectClick?: (info: ClickedObjectInfo) => void;

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Camera targets
  private targetCameraPos = new THREE.Vector3(0, 4.4, 9.2);
  private targetCameraLookAt = new THREE.Vector3(0, 1.2, 0);
  private currentCameraLookAt = new THREE.Vector3(0, 1.2, 0);

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe);
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.025);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4.4, 9.2);
    this.camera.lookAt(0, 1.2, 0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Environment & Stations
    this.buildTerrain();
    this.buildPlaygroundDecorations();
    this.buildStations();

    // 6. Initial Objects
    this.setObjects('APPLES', 6, []);

    // 7. Event listeners
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('resize', this.onWindowResize);

    // 8. Render loop
    this.animate();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    sunLight.position.set(6, 14, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -9;
    sunLight.shadow.camera.right = 9;
    sunLight.shadow.camera.top = 9;
    sunLight.shadow.camera.bottom = -9;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xbfdbfe, 0x166534, 0.45);
    this.scene.add(hemiLight);
  }

  private buildTerrain() {
    const groundGeo = new THREE.PlaneGeometry(36, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Stone rings
    const stoneGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.08, 32);
    const stoneMatMain = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
    const stoneMain = new THREE.Mesh(stoneGeo, stoneMatMain);
    stoneMain.position.set(-1.8, 0.04, 0);
    stoneMain.receiveShadow = true;
    this.scene.add(stoneMain);

    const stoneMatRem = new THREE.MeshStandardMaterial({ color: 0xfecaca, roughness: 0.9 });
    const stoneRem = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.08, 32), stoneMatRem);
    stoneRem.position.set(2.6, 0.04, 0.5);
    stoneRem.receiveShadow = true;
    this.scene.add(stoneRem);
  }

  private buildPlaygroundDecorations() {
    // Boundary Fence
    const fenceGroup = new THREE.Group();
    const picketGeo = new THREE.BoxGeometry(0.12, 1.1, 0.06);
    const picketMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 });
    for (let i = -14; i <= 14; i += 0.8) {
      const picket = new THREE.Mesh(picketGeo, picketMat);
      picket.position.set(i, 0.55, -5.5);
      picket.castShadow = true;
      fenceGroup.add(picket);
    }
    const railGeo = new THREE.BoxGeometry(29, 0.08, 0.05);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    const topRail = new THREE.Mesh(railGeo, railMat);
    topRail.position.set(0, 0.85, -5.5);
    fenceGroup.add(topRail);
    this.scene.add(fenceGroup);

    // Shaded Village Tree
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-6.2, 0, -3.2);
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.8, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.9;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), foliageMat);
    c1.position.set(0, 3.8, 0);
    c1.castShadow = true;
    treeGroup.add(c1);
    this.scene.add(treeGroup);
  }

  private buildStations() {
    // 1. Main Station: Cedar Table & Main Basket (Left Center)
    this.mainStation.position.set(-1.8, 0, 0);
    const tableGeo = new THREE.BoxGeometry(2.4, 0.7, 1.8);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
    const table = new THREE.Mesh(tableGeo, woodMat);
    table.position.y = 0.35;
    table.castShadow = true;
    table.receiveShadow = true;
    this.mainStation.add(table);

    // Main Holding Basket (Large Wicker Basket)
    const basketGeo = new THREE.CylinderGeometry(1.0, 0.75, 0.42, 24);
    const basketMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
    const mainBasket = new THREE.Mesh(basketGeo, basketMat);
    mainBasket.position.y = 0.85;
    mainBasket.castShadow = true;
    this.mainStation.add(mainBasket);

    // 2. Removal Station: Smaller Pedestal & Removal Basket (Right)
    this.removalStation.position.set(2.6, 0, 0.5);
    const remPedestalGeo = new THREE.CylinderGeometry(0.7, 0.85, 0.6, 20);
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const remPedestal = new THREE.Mesh(remPedestalGeo, darkWoodMat);
    remPedestal.position.y = 0.3;
    remPedestal.castShadow = true;
    remPedestal.receiveShadow = true;
    this.removalStation.add(remPedestal);

    // Removal Basket (Red Accent / Rose Wicker Basket)
    const remBasketGeo = new THREE.CylinderGeometry(0.75, 0.55, 0.38, 20);
    const remBasketMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.85 });
    const remBasket = new THREE.Mesh(remBasketGeo, remBasketMat);
    remBasket.position.y = 0.75;
    remBasket.castShadow = true;
    this.removalStation.add(remBasket);

    this.scene.add(this.mainStation);
    this.scene.add(this.removalStation);
  }

  // ── Procedural Object Creators ───────────────────────────────────

  private create3DObject(type: SubtractionObjectType): THREE.Group {
    const objGroup = new THREE.Group();

    if (type === 'APPLES') {
      const apple = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 })
      );
      apple.castShadow = true;
      objGroup.add(apple);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      stem.position.y = 0.17;
      objGroup.add(stem);
    } else if (type === 'BANANAS') {
      // Banana curved shape
      const bananaGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.36, 8);
      const bananaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
      const banana = new THREE.Mesh(bananaGeo, bananaMat);
      banana.rotation.z = Math.PI / 4;
      banana.castShadow = true;
      objGroup.add(banana);

      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.06, 6),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      tip.position.set(0.13, 0.13, 0);
      objGroup.add(tip);
    } else if (type === 'FLOWERS') {
      const petals = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.15),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 })
      );
      petals.castShadow = true;
      objGroup.add(petals);

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfacc15 })
      );
      center.position.y = 0.04;
      objGroup.add(center);
    } else if (type === 'BALLS') {
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 18, 18),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 })
      );
      ball.castShadow = true;
      objGroup.add(ball);

      const stripe = new THREE.Mesh(
        new THREE.TorusGeometry(0.162, 0.02, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0xfef08a })
      );
      stripe.rotation.x = Math.PI / 2;
      objGroup.add(stripe);
    } else if (type === 'BIRDS') {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0x0284c7 })
      );
      body.castShadow = true;
      objGroup.add(body);

      const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      beak.position.set(0.12, 0, 0);
      beak.rotation.z = -Math.PI / 2;
      objGroup.add(beak);
    }

    return objGroup;
  }

  // ── Set Objects in Scene ─────────────────────────────────────────

  public setObjects(
    type: SubtractionObjectType,
    total: number,
    removedIndices: number[]
  ) {
    this.currentType = type;
    this.totalCount = total;
    this.removedObjectIndices = new Set(removedIndices);

    // Remove old meshes
    this.activeObjects.forEach((m) => {
      if (m.parent) m.parent.remove(m);
    });
    this.activeObjects = [];

    // Create total objects
    for (let i = 0; i < total; i++) {
      const obj = this.create3DObject(type);
      const isRemoved = this.removedObjectIndices.has(i);

      if (!isRemoved) {
        // Place in main basket
        const angle = (i / Math.max(1, total)) * Math.PI * 2;
        const radius = total === 1 ? 0 : total <= 5 ? 0.32 : 0.45;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        obj.position.set(x, 1.15, z);
        obj.userData = { id: i, isRemoved: false, interactive: true };
        this.mainStation.add(obj);
      } else {
        // Place in removal basket
        const remArr = Array.from(this.removedObjectIndices);
        const remIdx = remArr.indexOf(i);
        const angle = (remIdx / Math.max(1, remArr.length)) * Math.PI * 2;
        const radius = remArr.length === 1 ? 0 : 0.28;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        obj.position.set(x, 1.05, z);
        obj.userData = { id: i, isRemoved: true, interactive: true };
        this.removalStation.add(obj);
      }

      this.activeObjects.push(obj);
    }
  }

  // ── Animate Object Removal ───────────────────────────────────────

  public animateRemove(index: number, onComplete?: () => void) {
    const target = this.activeObjects[index];
    if (!target || this.removedObjectIndices.has(index)) return;

    this.removedObjectIndices.add(index);
    target.userData.isRemoved = true;

    // Detach from mainStation and attach to removalStation
    const startWorldPos = new THREE.Vector3();
    target.getWorldPosition(startWorldPos);

    // Move along arc
    const duration = 600;
    const startTime = performance.now();
    const destLocalPos = new THREE.Vector3(
      (Math.random() - 0.5) * 0.4,
      1.05,
      (Math.random() - 0.5) * 0.4
    );

    const updateFrame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      // Arc interpolation between stations
      target.position.x = THREE.MathUtils.lerp(target.position.x, destLocalPos.x + 4.4, ease * 0.1);
      target.position.y += Math.sin(progress * Math.PI) * 0.04;
      target.rotation.y += 0.08;

      if (progress < 1.0) {
        requestAnimationFrame(updateFrame);
      } else {
        // Refresh full layout neatly
        this.setObjects(this.currentType, this.totalCount, Array.from(this.removedObjectIndices));
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(updateFrame);
  }

  // ── Camera Focus Presets ─────────────────────────────────────────

  public setCameraPreset(preset: 'PLAYGROUND' | 'MAIN_BASKET' | 'REMOVAL_BASKET') {
    switch (preset) {
      case 'PLAYGROUND':
        this.targetCameraPos.set(0, 4.4, 9.2);
        this.targetCameraLookAt.set(0, 1.2, 0);
        break;
      case 'MAIN_BASKET':
        this.targetCameraPos.set(-1.8, 3.2, 3.8);
        this.targetCameraLookAt.set(-1.8, 1.0, 0);
        break;
      case 'REMOVAL_BASKET':
        this.targetCameraPos.set(2.6, 2.8, 3.4);
        this.targetCameraLookAt.set(2.6, 0.9, 0.5);
        break;
    }
  }

  // ── Raycasting Pointer Handler ───────────────────────────────────

  private onPointerDown = (event: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr && curr !== this.scene) {
        if (curr.userData && curr.userData.interactive) {
          if (this.onObjectClick) {
            this.onObjectClick({
              id: curr.userData.id,
              isRemoved: curr.userData.isRemoved,
            });
          }
          return;
        }
        curr = curr.parent;
      }
    }
  };

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    this.camera.position.lerp(this.targetCameraPos, 0.06);
    this.currentCameraLookAt.lerp(this.targetCameraLookAt, 0.06);
    this.camera.lookAt(this.currentCameraLookAt);

    // Subtle idle floating
    const time = performance.now() * 0.002;
    this.activeObjects.forEach((obj, i) => {
      if (!obj.userData.isRemoved) {
        obj.rotation.y = Math.sin(time + i) * 0.08;
      }
    });

    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('resize', this.onWindowResize);

    this.scene.traverse((obj: any) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

