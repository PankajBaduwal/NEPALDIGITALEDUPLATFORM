/**
 * AdditionPlaygroundEnvironment.ts
 * 3D WebGL Three.js Environment for Simulation 01: Addition Playground (जोड खेलमैदान)
 * Class 1 Mathematics - Chapter 10: Addition up to 20 (योगफल २० सम्म आउने जोड)
 * Nepal Digital Education Platform
 */

import * as THREE from 'three';

export type PlaygroundObjectType = 'APPLES' | 'BANANAS' | 'FLOWERS' | 'BALLOONS' | 'TOY_BLOCKS';

export interface ClickedPlaygroundObject {
  id: number;
  basket: 'A' | 'B' | 'COMBINED';
  mesh: THREE.Object3D;
  point: THREE.Vector3;
}

export class AdditionPlaygroundEnvironment {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  // Object group references
  private basketAGroup: THREE.Group = new THREE.Group();
  private basketBGroup: THREE.Group = new THREE.Group();
  private combinedGroup: THREE.Group = new THREE.Group();
  private decorGroup: THREE.Group = new THREE.Group();
  private particleGroup: THREE.Group = new THREE.Group();

  // Raycaster & interaction
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private objectMeshes: THREE.Object3D[] = [];
  public onObjectClick?: (info: ClickedPlaygroundObject) => void;

  // Animation states
  private isCombining: boolean = false;
  private combineProgress: number = 0;
  private countA: number = 6;
  private countB: number = 4;
  private currentType: PlaygroundObjectType = 'APPLES';

  constructor(container: HTMLDivElement) {
    this.container = container;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Slate-900 sky
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.035);

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 9, 13);
    this.camera.lookAt(0, 0.5, 0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Playground Environment Props
    this.buildEnvironment();

    // 6. Setup Groups
    this.scene.add(this.basketAGroup);
    this.scene.add(this.basketBGroup);
    this.scene.add(this.combinedGroup);
    this.scene.add(this.decorGroup);
    this.scene.add(this.particleGroup);

    // 7. Initial population
    this.spawnObjects(6, 4, 'APPLES');

    // 8. Event listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);

    // 9. Start render loop
    this.animate();
  }

  private setupLighting() {
    const ambient = new THREE.AmbientLight(0xfff5ea, 0.7);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffaed, 0.95);
    sun.position.set(6, 14, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 40;
    const d = 10;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    this.scene.add(sun);

    const fillLight = new THREE.PointLight(0x38bdf8, 0.4, 20);
    fillLight.position.set(-6, 4, 3);
    this.scene.add(fillLight);
  }

  private buildEnvironment() {
    // Playground Lawn Ground
    const groundGeo = new THREE.CylinderGeometry(14, 14, 0.6, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Emerald green grass
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    this.decorGroup.add(ground);

    // Central Gathering Mat (Golden/amber ring where objects combine)
    const matGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.08, 32);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber rug
      roughness: 0.5,
      metalness: 0.2,
    });
    const centralMat = new THREE.Mesh(matGeo, matMat);
    centralMat.position.set(0, 0.04, 0.2);
    centralMat.receiveShadow = true;
    this.decorGroup.add(centralMat);

    // Plus Symbol (+) in 3D floating between baskets
    const plusGroup = new THREE.Group();
    const plusBarH = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.18, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    const plusBarV = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.8, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    plusGroup.add(plusBarH);
    plusGroup.add(plusBarV);
    plusGroup.position.set(0, 1.8, 0.2);
    this.decorGroup.add(plusGroup);

    // Left Basket (Basket A)
    this.buildBasket(-3.8, 0.2, 0.2, 0x0284c7, 'पहिलो समूह (A)');
    // Right Basket (Basket B)
    this.buildBasket(3.8, 0.2, 0.2, 0x10b981, 'दोस्रो समूह (B)');

    // Playful background trees & hills
    this.buildFoliage();
  }

  private buildBasket(x: number, y: number, z: number, colorHex: number, label: string) {
    const basket = new THREE.Group();
    basket.position.set(x, y, z);

    // Wooden ring basket bottom
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.4, 0.2, 24);
    const woodMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 });
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.receiveShadow = true;
    basket.add(base);

    // Woven ring rim
    const rimGeo = new THREE.TorusGeometry(1.55, 0.12, 12, 32);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 }));
    rim.position.y = 0.4;
    basket.add(rim);

    this.decorGroup.add(basket);
  }

  private buildFoliage() {
    // Background trees around perimeter
    const treePositions = [
      [-7, 0, -5],
      [7, 0, -5],
      [-9, 0, 0],
      [9, 0, 0],
      [-5, 0, -8],
      [5, 0, -8],
      [0, 0, -9],
    ];

    treePositions.forEach(([tx, ty, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, ty, tz);

      // Trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 2.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
      );
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      tree.add(trunk);

      // Foliage Cone / Sphere
      const foliage = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.6, 1),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 })
      );
      foliage.position.y = 2.8;
      foliage.castShadow = true;
      tree.add(foliage);

      this.decorGroup.add(tree);
    });
  }

  /**
   * Spawns objects into Basket A and Basket B
   */
  public spawnObjects(countA: number, countB: number, type: PlaygroundObjectType = 'APPLES') {
    this.countA = Math.min(15, Math.max(1, countA));
    this.countB = Math.min(15, Math.max(1, countB));
    this.currentType = type;
    this.isCombining = false;
    this.combineProgress = 0;

    // Clear existing
    this.clearGroup(this.basketAGroup);
    this.clearGroup(this.basketBGroup);
    this.clearGroup(this.combinedGroup);
    this.objectMeshes = [];

    // Populate Basket A
    for (let i = 0; i < this.countA; i++) {
      const mesh = this.createItemMesh(type, i + 1, 'A');
      const angle = (i / this.countA) * Math.PI * 2;
      const radius = 0.4 + (i % 2) * 0.45;
      mesh.position.set(-3.8 + Math.cos(angle) * radius, 0.45 + Math.floor(i / 6) * 0.35, 0.2 + Math.sin(angle) * radius);
      mesh.userData = { id: i + 1, basket: 'A', origX: mesh.position.x, origZ: mesh.position.z };
      this.basketAGroup.add(mesh);
      this.objectMeshes.push(mesh);
    }

    // Populate Basket B
    for (let i = 0; i < this.countB; i++) {
      const mesh = this.createItemMesh(type, i + 1, 'B');
      const angle = (i / this.countB) * Math.PI * 2;
      const radius = 0.4 + (i % 2) * 0.45;
      mesh.position.set(3.8 + Math.cos(angle) * radius, 0.45 + Math.floor(i / 6) * 0.35, 0.2 + Math.sin(angle) * radius);
      mesh.userData = { id: i + 1, basket: 'B', origX: mesh.position.x, origZ: mesh.position.z };
      this.basketBGroup.add(mesh);
      this.objectMeshes.push(mesh);
    }
  }

  private createItemMesh(type: PlaygroundObjectType, id: number, basket: 'A' | 'B'): THREE.Group {
    const group = new THREE.Group();

    if (type === 'APPLES') {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16),
        new THREE.MeshStandardMaterial({ color: basket === 'A' ? 0xef4444 : 0xf97316, roughness: 0.25 })
      );
      body.castShadow = true;
      group.add(body);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      stem.position.y = 0.24;
      group.add(stem);
    } else if (type === 'BANANAS') {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.25, 0.08, 0),
        new THREE.Vector3(-0.1, -0.05, 0),
        new THREE.Vector3(0.1, -0.05, 0),
        new THREE.Vector3(0.25, 0.12, 0)
      );
      const geom = new THREE.TubeGeometry(curve, 12, 0.09, 8, false);
      const mat = new THREE.MeshStandardMaterial({
        color: basket === 'A' ? 0xfacc15 : 0x84cc16,
        roughness: 0.35,
      });
      const banana = new THREE.Mesh(geom, mat);
      banana.castShadow = true;
      group.add(banana);
    } else if (type === 'BALLOONS') {
      const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 16, 16),
        new THREE.MeshStandardMaterial({ color: basket === 'A' ? 0xec4899 : 0x06b6d4, roughness: 0.2 })
      );
      balloon.scale.set(1, 1.25, 1);
      balloon.castShadow = true;
      group.add(balloon);
    } else if (type === 'FLOWERS') {
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
      );
      group.add(core);
      for (let p = 0; p < 5; p++) {
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 10, 10),
          new THREE.MeshStandardMaterial({ color: basket === 'A' ? 0xa855f7 : 0xec4899 })
        );
        const ang = (p / 5) * Math.PI * 2;
        petal.position.set(Math.cos(ang) * 0.18, 0, Math.sin(ang) * 0.18);
        petal.scale.set(1.2, 0.4, 1.2);
        group.add(petal);
      }
    } else {
      // TOY_BLOCKS
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.38, 0.38),
        new THREE.MeshStandardMaterial({ color: basket === 'A' ? 0x3b82f6 : 0x10b981, roughness: 0.3 })
      );
      cube.castShadow = true;
      group.add(cube);
    }

    return group;
  }

  /**
   * Triggers physical animation combining both baskets into the central amber mat
   */
  public triggerCombine() {
    this.isCombining = true;
    this.combineProgress = 0;
  }

  /**
   * Resets positions back to separate baskets
   */
  public resetPositions() {
    this.isCombining = false;
    this.combineProgress = 0;
    this.spawnObjects(this.countA, this.countB, this.currentType);
  }

  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    }
  }

  private onPointerDown = (event: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.objectMeshes, true);

    if (intersects.length > 0) {
      let hit: THREE.Object3D | null = intersects[0].object;
      while (hit && !hit.userData?.id && hit.parent && hit.parent !== this.scene) {
        hit = hit.parent;
      }
      if (hit && hit.userData?.id && this.onObjectClick) {
        this.onObjectClick({
          id: hit.userData.id,
          basket: hit.userData.basket,
          mesh: hit,
          point: intersects[0].point,
        });

        // Click bounce animation
        const initialY = hit.position.y;
        hit.position.y += 0.35;
        setTimeout(() => {
          if (hit) hit.position.y = initialY;
        }, 180);
      }
    }
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // If combining animation is active, smoothly move objects from baskets into center
    if (this.isCombining && this.combineProgress < 1) {
      this.combineProgress += 0.025;
      const t = Math.min(1, this.combineProgress);

      // Move basket A objects toward center
      this.basketAGroup.children.forEach((child, idx) => {
        const targetX = -1.2 + (idx % 4) * 0.6;
        const targetZ = 0.2 + (Math.floor(idx / 4) - 1) * 0.6;
        child.position.x = THREE.MathUtils.lerp(child.userData.origX, targetX, t);
        child.position.z = THREE.MathUtils.lerp(child.userData.origZ, targetZ, t);
        child.position.y = 0.35 + Math.sin(t * Math.PI) * 0.8;
      });

      // Move basket B objects toward center
      this.basketBGroup.children.forEach((child, idx) => {
        const offsetIdx = this.countA + idx;
        const targetX = -1.2 + (offsetIdx % 4) * 0.6;
        const targetZ = 0.2 + (Math.floor(offsetIdx / 4) - 1) * 0.6;
        child.position.x = THREE.MathUtils.lerp(child.userData.origX, targetX, t);
        child.position.z = THREE.MathUtils.lerp(child.userData.origZ, targetZ, t);
        child.position.y = 0.35 + Math.sin(t * Math.PI) * 0.8;
      });
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    if (this.renderer?.domElement) {
      this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.renderer?.dispose();
  }
}

