/**
 * AdditionEnvironment.ts
 * 3D Three.js Scene for Simulation 01: Addition Playground (जोड्ने खेलमैदान)
 * Class 1 Mathematics - Chapter 7: Addition up to 10 (योगफल १० सम्म आउने जोड)
 * Nepal Digital Education Platform
 */

import * as THREE from 'three';

export type ObjectType = 'APPLES' | 'MANGOES' | 'FLOWERS' | 'BALLS';

export interface ClickedObjectInfo {
  group: 'A' | 'B' | 'COMBINED';
  index: number;
}

export class AdditionEnvironment {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationFrameId: number | null = null;

  // Scene Root Groups
  private playgroundGroup = new THREE.Group();
  private leftStation = new THREE.Group();     // Group A
  private rightStation = new THREE.Group();    // Group B
  private centerStation = new THREE.Group();   // Combined Group

  // Countable Meshes in groups
  public groupAObjects: THREE.Group[] = [];
  public groupBObjects: THREE.Group[] = [];
  public combinedObjects: THREE.Group[] = [];

  // Current State
  private currentObjectType: ObjectType = 'APPLES';
  private currentCountA: number = 2;
  private currentCountB: number = 1;
  public isCombined: boolean = false;

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public onObjectClick?: (info: ClickedObjectInfo) => void;

  // Camera targets for smooth panning
  private targetCameraPos = new THREE.Vector3(0, 4.6, 9.5);
  private targetCameraLookAt = new THREE.Vector3(0, 1.4, 0);
  private currentCameraLookAt = new THREE.Vector3(0, 1.4, 0);

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe); // Sunny bright blue sky
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.025);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4.6, 9.5);
    this.camera.lookAt(0, 1.4, 0);

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
    this.buildVillagePlaygroundElements();
    this.buildStations();

    // 6. Initial Objects
    this.updateObjects('APPLES', 2, 1, false);

    // 7. Event listeners
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('resize', this.onWindowResize);

    // 8. Animation Loop
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
    // Lush green ground plane
    const groundGeo = new THREE.PlaneGeometry(36, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Soft decorative circular stones under each station
    const createStoneCircle = (x: number, z: number, radius: number, color: number) => {
      const stoneGeo = new THREE.CylinderGeometry(radius, radius + 0.1, 0.08, 32);
      const stoneMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(x, 0.04, z);
      stone.receiveShadow = true;
      this.scene.add(stone);
    };

    // Left base (Group A: Amber/Yellowish stone)
    createStoneCircle(-3.2, 0, 1.6, 0xfde68a);
    // Right base (Group B: Sky/Blueish stone)
    createStoneCircle(3.2, 0, 1.6, 0xbae6fd);
    // Center base (Combined: Golden/Emerald stone)
    createStoneCircle(0, 1.0, 2.2, 0xbbf7d0);
  }

  private buildVillagePlaygroundElements() {
    // Background boundary fence
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

    // Background Shaded Tree
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-6.5, 0, -3.5);
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

    const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2), foliageMat);
    c2.position.set(0.9, 4.4, 0.4);
    c2.castShadow = true;
    treeGroup.add(c2);

    const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1), foliageMat);
    c3.position.set(-0.8, 4.1, -0.3);
    c3.castShadow = true;
    treeGroup.add(c3);
    this.scene.add(treeGroup);

    // Right Background Village Cottage
    const cottageGroup = new THREE.Group();
    cottageGroup.position.set(7.0, 0, -4.0);
    const wallsGeo = new THREE.BoxGeometry(3.6, 2.4, 3.2);
    const wallsMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 });
    const walls = new THREE.Mesh(wallsGeo, wallsMat);
    walls.position.y = 1.2;
    walls.castShadow = true;
    cottageGroup.add(walls);

    const roofGeo = new THREE.ConeGeometry(2.8, 1.4, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.1;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    cottageGroup.add(roof);
    this.scene.add(cottageGroup);
  }

  private buildStations() {
    // 1. Group A Pedestal & Basket (Left)
    this.leftStation.position.set(-3.2, 0, 0);
    const pedestalGeo = new THREE.CylinderGeometry(0.9, 1.1, 0.9, 24);
    const cedarMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
    const leftPedestal = new THREE.Mesh(pedestalGeo, cedarMat);
    leftPedestal.position.y = 0.45;
    leftPedestal.receiveShadow = true;
    leftPedestal.castShadow = true;
    this.leftStation.add(leftPedestal);

    // Left Wicker Basket (Group A: Warm Amber Tint)
    const basketGeo = new THREE.CylinderGeometry(0.75, 0.55, 0.4, 20);
    const basketMatA = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
    const leftBasket = new THREE.Mesh(basketGeo, basketMatA);
    leftBasket.position.y = 0.95;
    leftBasket.castShadow = true;
    this.leftStation.add(leftBasket);

    // 2. Group B Pedestal & Basket (Right)
    this.rightStation.position.set(3.2, 0, 0);
    const rightPedestal = new THREE.Mesh(pedestalGeo, cedarMat);
    rightPedestal.position.y = 0.45;
    rightPedestal.receiveShadow = true;
    rightPedestal.castShadow = true;
    this.rightStation.add(rightPedestal);

    // Right Wicker Basket (Group B: Teal / Cyan Accent Tint)
    const basketMatB = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.85 });
    const rightBasket = new THREE.Mesh(basketGeo, basketMatB);
    rightBasket.position.y = 0.95;
    rightBasket.castShadow = true;
    this.rightStation.add(rightBasket);

    // 3. Center Combined Table & Large Golden Basket
    this.centerStation.position.set(0, 0, 1.0);
    const centerTableGeo = new THREE.BoxGeometry(2.4, 0.7, 1.6);
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
    const centerTable = new THREE.Mesh(centerTableGeo, darkWoodMat);
    centerTable.position.y = 0.35;
    centerTable.castShadow = true;
    centerTable.receiveShadow = true;
    this.centerStation.add(centerTable);

    // Large Center Basket for Combined Items
    const combinedBasketGeo = new THREE.CylinderGeometry(1.15, 0.85, 0.45, 24);
    const basketMatC = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
    const combinedBasket = new THREE.Mesh(combinedBasketGeo, basketMatC);
    combinedBasket.position.y = 0.85;
    combinedBasket.castShadow = true;
    this.centerStation.add(combinedBasket);

    this.scene.add(this.leftStation);
    this.scene.add(this.rightStation);
    this.scene.add(this.centerStation);
  }

  // ── Procedural Object Creators ───────────────────────────────────

  private create3DObject(type: ObjectType, scale: number = 1.0): THREE.Group {
    const objGroup = new THREE.Group();

    if (type === 'APPLES') {
      const appleBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.16 * scale, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 })
      );
      appleBody.castShadow = true;
      objGroup.add(appleBody);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015 * scale, 0.015 * scale, 0.08 * scale),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      stem.position.y = 0.17 * scale;
      objGroup.add(stem);
    } else if (type === 'MANGOES') {
      const mangoBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.18 * scale, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
      );
      mangoBody.scale.set(0.85, 1.25, 0.8);
      mangoBody.castShadow = true;
      objGroup.add(mangoBody);

      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(0.04 * scale, 0.12 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0x15803d })
      );
      leaf.position.set(0.08 * scale, 0.18 * scale, 0);
      leaf.rotation.z = -Math.PI / 4;
      objGroup.add(leaf);
    } else if (type === 'FLOWERS') {
      const petals = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.16 * scale),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 })
      );
      petals.castShadow = true;
      objGroup.add(petals);

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.07 * scale, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfacc15 })
      );
      center.position.y = 0.04 * scale;
      objGroup.add(center);
    } else if (type === 'BALLS') {
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.16 * scale, 18, 18),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 })
      );
      ball.castShadow = true;
      objGroup.add(ball);

      const stripe = new THREE.Mesh(
        new THREE.TorusGeometry(0.162 * scale, 0.02 * scale, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0xfef08a })
      );
      stripe.rotation.x = Math.PI / 2;
      objGroup.add(stripe);
    }

    return objGroup;
  }

  // ── Update Objects Display in Group A, B, and Combined ───────────

  public updateObjects(
    type: ObjectType,
    countA: number,
    countB: number,
    isCombined: boolean
  ) {
    this.currentObjectType = type;
    this.currentCountA = countA;
    this.currentCountB = countB;
    this.isCombined = isCombined;

    // Clear existing object meshes
    this.groupAObjects.forEach((m) => this.leftStation.remove(m));
    this.groupBObjects.forEach((m) => this.rightStation.remove(m));
    this.combinedObjects.forEach((m) => this.centerStation.remove(m));

    this.groupAObjects = [];
    this.groupBObjects = [];
    this.combinedObjects = [];

    if (!isCombined) {
      // Populate Group A in Left Basket
      for (let i = 0; i < countA; i++) {
        const obj = this.create3DObject(type);
        const angle = (i / Math.max(1, countA)) * Math.PI * 2;
        const radius = countA === 1 ? 0 : 0.32;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        obj.position.set(x, 1.25, z);
        obj.userData = { group: 'A', index: i, interactive: true };
        this.leftStation.add(obj);
        this.groupAObjects.push(obj);
      }

      // Populate Group B in Right Basket
      for (let i = 0; i < countB; i++) {
        const obj = this.create3DObject(type);
        const angle = (i / Math.max(1, countB)) * Math.PI * 2;
        const radius = countB === 1 ? 0 : 0.32;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        obj.position.set(x, 1.25, z);
        obj.userData = { group: 'B', index: i, interactive: true };
        this.rightStation.add(obj);
        this.groupBObjects.push(obj);
      }
    } else {
      // Combined: populate all (countA + countB) in Center Basket
      const total = countA + countB;
      for (let i = 0; i < total; i++) {
        const obj = this.create3DObject(type, 1.05);
        // Distribute nicely in center basket
        let x = 0;
        let z = 0;
        if (total > 1) {
          if (i < 5) {
            const angle = (i / Math.min(5, total)) * Math.PI * 2;
            x = Math.cos(angle) * 0.45;
            z = Math.sin(angle) * 0.45;
          } else {
            const angle = ((i - 5) / (total - 5)) * Math.PI * 2;
            x = Math.cos(angle) * 0.22;
            z = Math.sin(angle) * 0.22;
          }
        }
        obj.position.set(x, 1.22, z);
        obj.userData = { group: 'COMBINED', index: i, interactive: true };
        this.centerStation.add(obj);
        this.combinedObjects.push(obj);
      }
    }
  }

  // ── Interactive Smooth Combining Animation ───────────────────────

  public animateCombine(onComplete?: () => void) {
    this.isCombined = true;
    const duration = 900; // ms
    const startTime = performance.now();

    // Store starting world positions of Group A and Group B
    const startPositionsA = this.groupAObjects.map((obj) => obj.position.clone());
    const startPositionsB = this.groupBObjects.map((obj) => obj.position.clone());

    // Camera zooms smoothly toward combined table
    this.setCameraPreset('COMBINED');

    const updateFrame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Smooth ease-in-out curve
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      // Animate Group A objects inward to center
      this.groupAObjects.forEach((obj, idx) => {
        const s = startPositionsA[idx];
        // Move towards origin of centerStation relative to leftStation
        obj.position.x = s.x + ease * (3.2 - s.x);
        obj.position.y = s.y + Math.sin(progress * Math.PI) * 0.8;
        obj.position.z = s.z + ease * (1.0 - s.z);
        obj.rotation.y += 0.08;
      });

      // Animate Group B objects inward to center
      this.groupBObjects.forEach((obj, idx) => {
        const s = startPositionsB[idx];
        obj.position.x = s.x + ease * (-3.2 - s.x);
        obj.position.y = s.y + Math.sin(progress * Math.PI) * 0.8;
        obj.position.z = s.z + ease * (1.0 - s.z);
        obj.rotation.y -= 0.08;
      });

      if (progress < 1.0) {
        requestAnimationFrame(updateFrame);
      } else {
        // Swap directly to combined array layout
        this.updateObjects(this.currentObjectType, this.currentCountA, this.currentCountB, true);
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(updateFrame);
  }

  // ── Highlight / Flash Selected Object ───────────────────────────

  public highlightObject(group: 'A' | 'B' | 'COMBINED', index: number) {
    const list =
      group === 'A'
        ? this.groupAObjects
        : group === 'B'
        ? this.groupBObjects
        : this.combinedObjects;

    const target = list[index];
    if (!target) return;

    // Pulse jump up and down
    const origY = target.position.y;
    target.position.y += 0.25;
    setTimeout(() => {
      if (target) target.position.y = origY;
    }, 250);
  }

  // ── Camera Focus Presets ─────────────────────────────────────────

  public setCameraPreset(preset: 'PANORAMA' | 'GROUP_A' | 'GROUP_B' | 'COMBINED') {
    switch (preset) {
      case 'PANORAMA':
        this.targetCameraPos.set(0, 4.6, 9.5);
        this.targetCameraLookAt.set(0, 1.4, 0);
        break;
      case 'GROUP_A':
        this.targetCameraPos.set(-2.8, 3.2, 4.2);
        this.targetCameraLookAt.set(-3.2, 1.0, 0);
        break;
      case 'GROUP_B':
        this.targetCameraPos.set(2.8, 3.2, 4.2);
        this.targetCameraLookAt.set(3.2, 1.0, 0);
        break;
      case 'COMBINED':
        this.targetCameraPos.set(0, 3.4, 4.8);
        this.targetCameraLookAt.set(0, 0.9, 1.0);
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
              group: curr.userData.group,
              index: curr.userData.index,
            });
          }
          this.highlightObject(curr.userData.group, curr.userData.index);
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

  // ── Render Loop ─────────────────────────────────────────────────

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Smooth camera interpolation
    this.camera.position.lerp(this.targetCameraPos, 0.06);
    this.currentCameraLookAt.lerp(this.targetCameraLookAt, 0.06);
    this.camera.lookAt(this.currentCameraLookAt);

    // Subtle breathing animation for uncollected objects
    const time = performance.now() * 0.002;
    this.groupAObjects.forEach((obj, i) => {
      obj.rotation.y = Math.sin(time + i) * 0.1;
    });
    this.groupBObjects.forEach((obj, i) => {
      obj.rotation.y = -Math.sin(time + i) * 0.1;
    });
    this.combinedObjects.forEach((obj, i) => {
      obj.rotation.y = Math.sin(time * 0.8 + i) * 0.12;
    });

    this.renderer.render(this.scene, this.camera);
  };

  // ── Cleanup ──────────────────────────────────────────────────────

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

