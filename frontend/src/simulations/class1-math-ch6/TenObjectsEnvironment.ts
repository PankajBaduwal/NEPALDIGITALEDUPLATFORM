/**
 * TenObjectsEnvironment.ts
 * 3D Three.js Scene for Simulation 01: Ten Object Adventure (दश वस्तुहरू गनौँ)
 * Class 1 Mathematics - Chapter 6: Ten (दश)
 * Nepal Digital Education Platform
 */

import * as THREE from 'three';

export interface ClickedObjectInfo {
  id: string;
  type: 'APPLE' | 'FLOWER' | 'BALLOON' | 'BASKET';
  index: number;
}

export class TenObjectsEnvironment {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationFrameId: number | null = null;

  // Scene Groups
  private treeGroup = new THREE.Group();
  private gardenBedGroup = new THREE.Group();
  private tableGroup = new THREE.Group();
  private balloonGroup = new THREE.Group();

  // Dynamic Countable Mesh Arrays (each holds up to 10 items)
  public apples: THREE.Group[] = [];
  public flowers: THREE.Group[] = [];
  public balloons: THREE.Group[] = [];
  public basketApples: THREE.Group[] = [];

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public onObjectClick?: (info: ClickedObjectInfo) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe0f2fe); // Sunny mountain sky
    this.scene.fog = new THREE.FogExp2(0xe0f2fe, 0.03);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4.2, 9.2);
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

    // 5. Environment
    this.buildTerrain();
    this.buildAppleTree();
    this.buildGardenBed();
    this.buildCollectionTable();

    // 6. Event listeners
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('resize', this.onWindowResize);

    // 7. Loop
    this.animate();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.15);
    sunLight.position.set(5, 12, 7);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x166534, 0.45);
    this.scene.add(hemiLight);
  }

  private buildTerrain() {
    // Lush Grass Plane
    const groundGeo = new THREE.PlaneGeometry(28, 28);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Stone pathway slab
    const slabGeo = new THREE.BoxGeometry(4.5, 0.05, 3.2);
    const slabMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.set(0, 0.02, 1.2);
    slab.receiveShadow = true;
    this.scene.add(slab);
  }

  private buildAppleTree() {
    this.treeGroup.position.set(-3.4, 0, -1.2);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.38, 0.55, 3.6, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.8;
    trunk.castShadow = true;
    this.treeGroup.add(trunk);

    // Branches
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
    const clusters = [
      [0, 3.8, 0, 1.6],
      [1.1, 3.5, 0.4, 1.2],
      [-1.1, 3.4, -0.3, 1.1],
      [0.3, 4.4, -0.2, 1.3],
      [-0.4, 4.2, 0.5, 1.0],
    ];

    clusters.forEach(([x, y, z, r]) => {
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), foliageMat);
      foliage.position.set(x, y, z);
      foliage.castShadow = true;
      this.treeGroup.add(foliage);
    });

    this.scene.add(this.treeGroup);
  }

  private buildGardenBed() {
    this.gardenBedGroup.position.set(3.2, 0, 0.2);

    // Raised Garden Wooden Box
    const boxGeo = new THREE.BoxGeometry(2.4, 0.35, 4.2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 0.17;
    box.castShadow = true;
    this.gardenBedGroup.add(box);

    // Soil
    const soilGeo = new THREE.BoxGeometry(2.2, 0.05, 4.0);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.35;
    this.gardenBedGroup.add(soil);

    this.scene.add(this.gardenBedGroup);
  }

  private buildCollectionTable() {
    this.tableGroup.position.set(0, 0, 1.2);

    // Table Top
    const tableGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.16, 24);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });
    const table = new THREE.Mesh(tableGeo, woodMat);
    table.position.y = 0.7;
    table.castShadow = true;
    table.receiveShadow = true;
    this.tableGroup.add(table);

    // Table Base
    const baseGeo = new THREE.CylinderGeometry(0.2, 0.32, 0.7, 16);
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.y = 0.35;
    base.castShadow = true;
    this.tableGroup.add(base);

    // Big Wicker Basket (Wide enough for 10 apples)
    const basketGeo = new THREE.CylinderGeometry(0.85, 0.65, 0.45, 24, 1, true);
    const basketMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const basket = new THREE.Mesh(basketGeo, basketMat);
    basket.position.y = 0.95;
    basket.castShadow = true;
    basket.name = 'BASKET_TARGET';
    this.tableGroup.add(basket);

    this.scene.add(this.tableGroup);
  }

  // ==========================================
  // DYNAMIC POPULATION (UP TO 10 OBJECTS)
  // ==========================================

  /**
   * Set up to 10 Countable Apples on the tree branches
   */
  public setTreeApples(count: number, countedIndices: number[] = []) {
    this.apples.forEach((a) => this.treeGroup.remove(a));
    this.apples = [];

    // 10 distinct, clearly visible branch coordinates
    const positions: [number, number, number][] = [
      [-0.6, 3.2, 0.8],
      [0.5, 3.4, 0.9],
      [1.1, 3.1, 0.3],
      [-1.0, 3.0, 0.2],
      [0.0, 3.9, 0.7],
      [-0.4, 4.3, 0.4],
      [0.7, 4.1, 0.2],
      [0.2, 2.9, 0.95],
      [-0.8, 3.7, 0.5],
      [1.0, 3.8, 0.5],
    ];

    for (let i = 0; i < count; i++) {
      const apple = new THREE.Group();
      const pos = positions[i] || [0, 3.5, 0.5];

      const isCounted = countedIndices.includes(i);

      // Apple Sphere
      const bodyGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: isCounted ? 0x22c55e : 0xdc2626, // Green when counted, red when uncounted
        roughness: 0.3,
        emissive: isCounted ? 0x15803d : 0x000000,
        emissiveIntensity: 0.4,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      apple.add(body);

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.15;
      apple.add(stem);

      apple.position.set(pos[0], pos[1], pos[2]);
      apple.name = `APPLE_${i}`;
      this.treeGroup.add(apple);
      this.apples.push(apple);
    }
  }

  /**
   * Set up to 10 Flowers in the garden bed
   */
  public setGardenFlowers(count: number, countedIndices: number[] = []) {
    this.flowers.forEach((f) => this.gardenBedGroup.remove(f));
    this.flowers = [];

    // 2 rows of 5 flowers along the bed
    for (let i = 0; i < count; i++) {
      const flower = new THREE.Group();
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = (col - 0.5) * 1.0;
      const z = (row - 2) * 0.75;

      const isCounted = countedIndices.includes(i);

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.52;
      flower.add(stem);

      // Petals
      const petalGeo = new THREE.CircleGeometry(0.13, 8);
      const petalMat = new THREE.MeshStandardMaterial({
        color: isCounted ? 0x38bdf8 : i % 2 === 0 ? 0xec4899 : 0xf59e0b,
        side: THREE.DoubleSide,
      });
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.y = 0.72;
      petal.rotation.x = -Math.PI / 4;
      flower.add(petal);

      // Center Eye
      const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfde047 });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0.73, 0.02);
      flower.add(eye);

      flower.position.set(x, 0, z);
      flower.name = `FLOWER_${i}`;
      this.gardenBedGroup.add(flower);
      this.flowers.push(flower);
    }
  }

  /**
   * Set up to 10 Apples placed inside the central Basket
   */
  public setBasketApples(count: number) {
    this.basketApples.forEach((a) => this.tableGroup.remove(a));
    this.basketApples = [];

    // Radial layout inside basket
    for (let i = 0; i < count; i++) {
      const apple = new THREE.Group();
      const radius = i === 0 ? 0 : i < 6 ? 0.32 : 0.52;
      const angle = i === 0 ? 0 : (i * Math.PI * 2) / (i < 6 ? 5 : 4);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.95 + (i > 5 ? 0.12 : 0);

      const bodyGeo = new THREE.SphereGeometry(0.12, 14, 14);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      apple.add(body);

      apple.position.set(x, y, z);
      apple.name = `BASKET_APPLE_${i}`;
      this.tableGroup.add(apple);
      this.basketApples.push(apple);
    }
  }

  // Camera Focus Director
  public focusOn(location: 'DEFAULT' | 'TREE' | 'GARDEN' | 'BASKET') {
    if (location === 'TREE') {
      this.camera.position.set(-2.2, 3.6, 3.2);
      this.camera.lookAt(-3.2, 3.4, -0.8);
    } else if (location === 'GARDEN') {
      this.camera.position.set(2.4, 2.5, 3.4);
      this.camera.lookAt(3.2, 0.6, 0.2);
    } else if (location === 'BASKET') {
      this.camera.position.set(0, 2.6, 3.6);
      this.camera.lookAt(0, 0.9, 1.2);
    } else {
      // DEFAULT
      this.camera.position.set(0, 4.2, 9.2);
      this.camera.lookAt(0, 1.4, 0);
    }
  }

  // Pointer Interaction
  private onPointerDown = (event: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && topObj.parent && topObj.parent !== this.scene) {
        if (topObj.name && topObj.name.length > 0) break;
        topObj = topObj.parent;
      }

      if (topObj && this.onObjectClick) {
        if (topObj.name.startsWith('APPLE_')) {
          const idx = parseInt(topObj.name.replace('APPLE_', ''), 10);
          this.onObjectClick({ id: topObj.name, type: 'APPLE', index: idx });
        } else if (topObj.name.startsWith('FLOWER_')) {
          const idx = parseInt(topObj.name.replace('FLOWER_', ''), 10);
          this.onObjectClick({ id: topObj.name, type: 'FLOWER', index: idx });
        } else if (topObj.name === 'BASKET_TARGET') {
          this.onObjectClick({ id: 'BASKET', type: 'BASKET', index: 0 });
        }
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
    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

