/**
 * ZeroPlaygroundEnvironment.ts
 * 3D Three.js Scene for Simulation 01: The Zero Discovery Playground (शून्य चिनौँ)
 * Class 1 Mathematics - Chapter 5: Zero (शून्य)
 * Nepal Digital Education Platform
 */

import * as THREE from 'three';

export interface InteractiveEntity {
  id: string;
  type: 'APPLE' | 'BIRD' | 'DUCK' | 'BENCH_PERSON' | 'BASKET' | 'POND' | 'BENCH';
  mesh: THREE.Object3D;
  location: 'BASKET' | 'TREE' | 'POND' | 'BENCH';
  index: number;
}

export class ZeroPlaygroundEnvironment {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationFrameId: number | null = null;

  // Scene Objects
  private treeGroup: THREE.Group = new THREE.Group();
  private pondMesh: THREE.Mesh | null = null;
  private benchGroup: THREE.Group = new THREE.Group();
  private basketGroup: THREE.Group = new THREE.Group();
  private houseGroup: THREE.Group = new THREE.Group();

  // Dynamic Item Groups
  public apples: THREE.Group[] = [];
  public birds: THREE.Group[] = [];
  public ducks: THREE.Group[] = [];
  public benchPeople: THREE.Group[] = [];

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public onObjectClick?: (objectId: string, type: string) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe); // Soft morning Himalayan sky
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.035);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4.5, 9.5);
    this.camera.lookAt(0, 1.2, 0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.setupLighting();

    // 5. Environment
    this.buildTerrain();
    this.buildTree();
    this.buildPond();
    this.buildBench();
    this.buildBasketTable();
    this.buildVillageHouse();

    // 6. Event listeners
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('resize', this.onWindowResize);

    // 7. Render loop
    this.animate();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.1);
    sunLight.position.set(6, 12, 8);
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

    // Fill blue light from sky
    const skyLight = new THREE.HemisphereLight(0x93c5fd, 0x15803d, 0.4);
    this.scene.add(skyLight);
  }

  private buildTerrain() {
    // Green Grassy Ground
    const groundGeo = new THREE.PlaneGeometry(28, 28);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80, // Lush green
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Dirt footpath winding through playground
    const pathGeo = new THREE.RingGeometry(2.5, 3.8, 32, 1, 0, Math.PI * 0.9);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Himalayan warm clay
      roughness: 0.95,
    });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = -0.4;
    path.position.set(0, 0.01, 1);
    path.receiveShadow = true;
    this.scene.add(path);
  }

  private buildTree() {
    this.treeGroup.position.set(-3.6, 0, -1.5);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 3.2, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.6;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.treeGroup.add(trunk);

    // Main Branch extending horizontally toward center
    const branchGeo = new THREE.CylinderGeometry(0.12, 0.18, 2.2, 8);
    const branchMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const branch = new THREE.Mesh(branchGeo, branchMat);
    branch.rotation.z = Math.PI / 2.3;
    branch.position.set(1.1, 2.5, 0.2);
    branch.castShadow = true;
    this.treeGroup.add(branch);

    // Foliage Clusters
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), foliageMat);
    f1.position.set(0, 3.4, 0);
    f1.castShadow = true;
    this.treeGroup.add(f1);

    const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), foliageMat);
    f2.position.set(0.9, 3.2, 0.3);
    f2.castShadow = true;
    this.treeGroup.add(f2);

    const f3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), foliageMat);
    f3.position.set(-0.8, 3.0, -0.2);
    f3.castShadow = true;
    this.treeGroup.add(f3);

    this.scene.add(this.treeGroup);
  }

  private buildPond() {
    // Pond Water Disk
    const pondGeo = new THREE.CircleGeometry(1.6, 32);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Sparkling blue water
      roughness: 0.1,
      metalness: 0.3,
    });
    this.pondMesh = new THREE.Mesh(pondGeo, pondMat);
    this.pondMesh.rotation.x = -Math.PI / 2;
    this.pondMesh.position.set(3.4, 0.02, 0.5);
    this.pondMesh.receiveShadow = true;
    this.pondMesh.name = 'POND_TARGET';
    this.scene.add(this.pondMesh);

    // Pond Stone Rim
    const rimGeo = new THREE.TorusGeometry(1.65, 0.14, 8, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(3.4, 0.06, 0.5);
    rim.castShadow = true;
    this.scene.add(rim);
  }

  private buildBench() {
    this.benchGroup.position.set(0, 0, -2.6);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });

    // Seat plank
    const seatGeo = new THREE.BoxGeometry(2.4, 0.1, 0.6);
    const seat = new THREE.Mesh(seatGeo, woodMat);
    seat.position.y = 0.55;
    seat.castShadow = true;
    this.benchGroup.add(seat);

    // Backrest plank
    const backGeo = new THREE.BoxGeometry(2.4, 0.45, 0.08);
    const back = new THREE.Mesh(backGeo, woodMat);
    back.position.set(0, 0.95, -0.25);
    back.castShadow = true;
    this.benchGroup.add(back);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.55);
    [[-1.0, 0.28, -0.2], [1.0, 0.28, -0.2], [-1.0, 0.28, 0.2], [1.0, 0.28, 0.2]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      this.benchGroup.add(leg);
    });

    this.benchGroup.name = 'BENCH_TARGET';
    this.scene.add(this.benchGroup);
  }

  private buildBasketTable() {
    this.basketGroup.position.set(0, 0, 1.5);

    // Table
    const tableTopGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.15, 24);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 });
    const tableTop = new THREE.Mesh(tableTopGeo, woodMat);
    tableTop.position.y = 0.6;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    this.basketGroup.add(tableTop);

    // Center Pedestal
    const legGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.6, 16);
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.y = 0.3;
    leg.castShadow = true;
    this.basketGroup.add(leg);

    // Wicker Basket Bowl
    const basketGeo = new THREE.CylinderGeometry(0.7, 0.5, 0.35, 24, 1, true);
    const basketMat = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const basket = new THREE.Mesh(basketGeo, basketMat);
    basket.position.y = 0.85;
    basket.castShadow = true;
    basket.name = 'BASKET_CONTAINER';
    this.basketGroup.add(basket);

    this.scene.add(this.basketGroup);
  }

  private buildVillageHouse() {
    this.houseGroup.position.set(5.5, 0, -4.5);

    // Wall base
    const wallGeo = new THREE.BoxGeometry(3.6, 2.4, 3.2);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 1.2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.houseGroup.add(wall);

    // Sloped Clay Tile Roof
    const roofGeo = new THREE.ConeGeometry(2.8, 1.4, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }); // Red clay tile
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.1;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    this.houseGroup.add(roof);

    // Wooden Door
    const doorGeo = new THREE.PlaneGeometry(0.8, 1.4);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(-0.6, 0.7, 1.61);
    this.houseGroup.add(door);

    this.scene.add(this.houseGroup);
  }

  // ==========================================
  // DYNAMIC POPULATION METHODS
  // ==========================================

  /**
   * Set the exact number of Apples inside the central basket (0 to 5)
   */
  public setBasketApples(count: number) {
    // Clear old apples
    this.apples.forEach((a) => this.basketGroup.remove(a));
    this.apples = [];

    const appleOffsets = [
      [0, 0.85, 0],
      [-0.2, 0.88, 0.15],
      [0.2, 0.88, 0.15],
      [0, 0.92, -0.2],
      [-0.15, 0.95, -0.1],
    ];

    for (let i = 0; i < count; i++) {
      const apple = new THREE.Group();
      const pos = appleOffsets[i] || [0, 0.85, 0];

      // Apple Body
      const bodyGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      apple.add(body);

      // Apple Stem
      const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.15;
      apple.add(stem);

      apple.position.set(pos[0], pos[1], pos[2]);
      apple.name = `APPLE_${i}`;
      this.basketGroup.add(apple);
      this.apples.push(apple);
    }
  }

  /**
   * Set the exact number of Birds on the tree branch (0 to 4)
   */
  public setTreeBirds(count: number) {
    this.birds.forEach((b) => this.treeGroup.remove(b));
    this.birds = [];

    const branchBase = [1.1, 2.5, 0.2];
    const offsets = [
      [0.6, 2.75, 0.2],
      [0.9, 2.65, 0.22],
      [1.2, 2.55, 0.24],
      [1.5, 2.45, 0.26],
    ];

    for (let i = 0; i < count; i++) {
      const bird = new THREE.Group();
      const pos = offsets[i] || branchBase;

      // Body
      const bodyGeo = new THREE.SphereGeometry(0.1, 12, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 }); // Bluebird
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      bird.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.065, 10, 10);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0.08, 0.07, 0);
      bird.add(head);

      // Beak
      const beakGeo = new THREE.ConeGeometry(0.025, 0.06, 8);
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.rotation.z = -Math.PI / 2;
      beak.position.set(0.15, 0.07, 0);
      bird.add(beak);

      bird.position.set(pos[0], pos[1], pos[2]);
      bird.name = `BIRD_${i}`;
      this.treeGroup.add(bird);
      this.birds.push(bird);
    }
  }

  /**
   * Set the exact number of Ducks in the pond (0 to 4)
   */
  public setPondDucks(count: number) {
    this.ducks.forEach((d) => this.scene.remove(d));
    this.ducks = [];

    const pondCenter = [3.4, 0.1, 0.5];
    const duckAngles = [0, 1.6, 3.2, 4.8];

    for (let i = 0; i < count; i++) {
      const duck = new THREE.Group();
      const angle = duckAngles[i] || 0;
      const radius = 0.7;
      const x = pondCenter[0] + Math.cos(angle) * radius;
      const z = pondCenter[2] + Math.sin(angle) * radius;

      // Duck Body
      const bodyGeo = new THREE.SphereGeometry(0.13, 12, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // Yellow duckling
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.scale.set(1.4, 0.9, 1.0);
      body.castShadow = true;
      duck.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.08, 10, 10);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0.12, 0.1, 0);
      duck.add(head);

      // Orange Beak
      const beakGeo = new THREE.BoxGeometry(0.06, 0.025, 0.05);
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xea580c });
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.position.set(0.2, 0.09, 0);
      duck.add(beak);

      duck.position.set(x, 0.1, z);
      duck.name = `DUCK_${i}`;
      this.scene.add(duck);
      this.ducks.push(duck);
    }
  }

  /**
   * Set the exact number of Children on the bench (0 to 3)
   */
  public setBenchPeople(count: number) {
    this.benchPeople.forEach((p) => this.benchGroup.remove(p));
    this.benchPeople = [];

    const slotOffsets = [-0.65, 0, 0.65];

    for (let i = 0; i < count; i++) {
      const person = new THREE.Group();
      const x = slotOffsets[i] || 0;

      // Shirt body
      const shirtGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.45, 12);
      const shirtMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0xef4444 : i === 1 ? 0x3b82f6 : 0x10b981,
      });
      const shirt = new THREE.Mesh(shirtGeo, shirtMat);
      shirt.position.y = 0.85;
      shirt.castShadow = true;
      person.add(shirt);

      // Head
      const headGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.2;
      head.castShadow = true;
      person.add(head);

      person.position.set(x, 0, 0.05);
      person.name = `PERSON_${i}`;
      this.benchGroup.add(person);
      this.benchPeople.push(person);
    }
  }

  // ==========================================
  // CAMERA FOCUS PRESETS
  // ==========================================
  public focusOn(location: 'DEFAULT' | 'BASKET' | 'TREE' | 'POND' | 'BENCH') {
    if (location === 'BASKET') {
      this.camera.position.set(0, 2.5, 4.2);
      this.camera.lookAt(0, 0.9, 1.5);
    } else if (location === 'TREE') {
      this.camera.position.set(-1.8, 3.2, 2.4);
      this.camera.lookAt(-2.5, 2.6, -0.5);
    } else if (location === 'POND') {
      this.camera.position.set(3.4, 2.8, 3.6);
      this.camera.lookAt(3.4, 0.1, 0.5);
    } else if (location === 'BENCH') {
      this.camera.position.set(0, 2.2, 0.5);
      this.camera.lookAt(0, 0.7, -2.6);
    } else {
      // DEFAULT
      this.camera.position.set(0, 4.5, 9.5);
      this.camera.lookAt(0, 1.2, 0);
    }
  }

  // Pointer Click Interaction
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
        if (topObj.name.startsWith('APPLE')) {
          this.onObjectClick(topObj.name, 'APPLE');
        } else if (topObj.name.startsWith('BIRD')) {
          this.onObjectClick(topObj.name, 'BIRD');
        } else if (topObj.name.startsWith('DUCK')) {
          this.onObjectClick(topObj.name, 'DUCK');
        } else if (topObj.name.startsWith('PERSON')) {
          this.onObjectClick(topObj.name, 'BENCH_PERSON');
        } else if (topObj.name === 'BASKET_CONTAINER') {
          this.onObjectClick('BASKET', 'BASKET');
        } else if (topObj.name === 'POND_TARGET') {
          this.onObjectClick('POND', 'POND');
        } else if (topObj.name === 'BENCH_TARGET') {
          this.onObjectClick('BENCH', 'BENCH');
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

    // Subtle gentle bobbing for ducks in pond
    const time = Date.now() * 0.003;
    this.ducks.forEach((duck, idx) => {
      duck.position.y = 0.1 + Math.sin(time + idx * 1.5) * 0.02;
      duck.rotation.y += 0.005;
    });

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

