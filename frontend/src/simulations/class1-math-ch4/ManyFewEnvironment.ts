/**
 * ManyFewEnvironment.ts
 * Procedural 3D Scene Engine for Class 1 Mathematics Chapter 4
 * Simulation 01: Many and Few Adventure (धेरै र थोरै चिनौँ)
 * Uses Three.js WebGL to render dual marketplace tables/baskets with procedural apples, mangoes, flowers, balls.
 */

import * as THREE from 'three';

export interface GroupItem3D {
  id: string;
  mesh: THREE.Object3D;
  basket: 'A' | 'B';
}

export class ManyFewEnvironment {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;

  public itemsGroupA: THREE.Group;
  public itemsGroupB: THREE.Group;
  public basketAMesh: THREE.Mesh;
  public basketBMesh: THREE.Mesh;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfef9c3); // Warm sunlight morning
    this.scene.fog = new THREE.FogExp2(0xfef9c3, 0.025);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4.5, 8.5);
    this.camera.lookAt(0, 1.2, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    this.itemsGroupA = new THREE.Group();
    this.itemsGroupB = new THREE.Group();
    this.scene.add(this.itemsGroupA);
    this.scene.add(this.itemsGroupB);

    this.initLights();
    this.initEnvironment();

    // Create baskets
    const basketGeo = new THREE.CylinderGeometry(1.6, 1.2, 0.6, 32, 1, true);
    const basketMatA = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Blue basket A
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    this.basketAMesh = new THREE.Mesh(basketGeo, basketMatA);
    this.basketAMesh.position.set(-2.5, 0.8, 0);
    this.basketAMesh.castShadow = true;
    this.basketAMesh.receiveShadow = true;
    this.scene.add(this.basketAMesh);

    const basketMatB = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber basket B
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    this.basketBMesh = new THREE.Mesh(basketGeo, basketMatB);
    this.basketBMesh.position.set(2.5, 0.8, 0);
    this.basketBMesh.castShadow = true;
    this.basketBMesh.receiveShadow = true;
    this.scene.add(this.basketBMesh);

    this.setupWindowResize();
    this.animate();
  }

  private initLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffedd5, 1.3);
    sun.position.set(8, 15, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    this.scene.add(sun);

    const hemi = new THREE.HemisphereLight(0xbae6fd, 0xfef08a, 0.5);
    this.scene.add(hemi);
  }

  private initEnvironment(): void {
    // Village wooden table / podium
    const tableGeo = new THREE.BoxGeometry(9.5, 0.4, 4.5);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.3;
    table.receiveShadow = true;
    this.scene.add(table);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x713f12 });
    [
      [-4.2, -1.8],
      [4.2, -1.8],
      [-4.2, 1.8],
      [4.2, 1.8],
    ].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, -0.4, z);
      this.scene.add(leg);
    });
  }

  /**
   * Set objects in Basket A and Basket B
   */
  public populateBaskets(
    countA: number,
    countB: number,
    itemType: 'apple' | 'mango' | 'flower' | 'ball' = 'apple'
  ): void {
    // Clear previous items
    while (this.itemsGroupA.children.length > 0) {
      this.itemsGroupA.remove(this.itemsGroupA.children[0]);
    }
    while (this.itemsGroupB.children.length > 0) {
      this.itemsGroupB.remove(this.itemsGroupB.children[0]);
    }

    // Populate Basket A
    for (let i = 0; i < countA; i++) {
      const mesh = this.createItemMesh(itemType);
      const angle = (i / Math.max(1, countA)) * Math.PI * 2;
      const radius = i === 0 ? 0 : 0.6 + (i % 2) * 0.35;
      mesh.position.set(-2.5 + Math.cos(angle) * radius, 0.9 + Math.floor(i / 5) * 0.3, Math.sin(angle) * radius);
      this.itemsGroupA.add(mesh);
    }

    // Populate Basket B
    for (let i = 0; i < countB; i++) {
      const mesh = this.createItemMesh(itemType);
      const angle = (i / Math.max(1, countB)) * Math.PI * 2;
      const radius = i === 0 ? 0 : 0.6 + (i % 2) * 0.35;
      mesh.position.set(2.5 + Math.cos(angle) * radius, 0.9 + Math.floor(i / 5) * 0.3, Math.sin(angle) * radius);
      this.itemsGroupB.add(mesh);
    }
  }

  private createItemMesh(itemType: 'apple' | 'mango' | 'flower' | 'ball'): THREE.Object3D {
    const group = new THREE.Group();

    if (itemType === 'apple') {
      const geo = new THREE.SphereGeometry(0.28, 20, 20);
      const mat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 });
      const apple = new THREE.Mesh(geo, mat);
      apple.castShadow = true;
      group.add(apple);

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.3;
      group.add(stem);
    } else if (itemType === 'mango') {
      const geo = new THREE.SphereGeometry(0.3, 20, 20);
      geo.scale(1, 1.4, 0.8);
      const mat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 });
      const mango = new THREE.Mesh(geo, mat);
      mango.castShadow = true;
      group.add(mango);
    } else if (itemType === 'ball') {
      const geo = new THREE.SphereGeometry(0.28, 20, 20);
      const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2 });
      const ball = new THREE.Mesh(geo, mat);
      ball.castShadow = true;
      group.add(ball);
    } else {
      // Flower
      const coreGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      for (let p = 0; p < 5; p++) {
        const pGeo = new THREE.SphereGeometry(0.12, 12, 12);
        pGeo.scale(1.4, 1, 0.4);
        const pMat = new THREE.MeshStandardMaterial({ color: 0xec4899 });
        const petal = new THREE.Mesh(pGeo, pMat);
        const a = (p / 5) * Math.PI * 2;
        petal.position.set(Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0);
        group.add(petal);
      }
    }

    return group;
  }

  /**
   * Raycast basket click: 'A' or 'B'
   */
  public raycastBasket(clientX: number, clientY: number): 'A' | 'B' | null {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects([this.basketAMesh, this.basketBMesh], true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit === this.basketAMesh) return 'A';
      if (hit === this.basketBMesh) return 'B';
    }

    // Also check item hits
    const hitA = this.raycaster.intersectObjects(this.itemsGroupA.children, true);
    if (hitA.length > 0) return 'A';

    const hitB = this.raycaster.intersectObjects(this.itemsGroupB.children, true);
    if (hitB.length > 0) return 'B';

    return null;
  }

  private setupWindowResize(): void {
    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const time = Date.now() * 0.002;

    // Gentle float on basket contents
    this.itemsGroupA.position.y = Math.sin(time) * 0.04;
    this.itemsGroupB.position.y = Math.sin(time + 1) * 0.04;

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

