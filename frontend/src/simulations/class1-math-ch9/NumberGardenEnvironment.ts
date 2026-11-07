/**
 * NumberGardenEnvironment.ts
 * 3D Three.js Scene for Simulation 01: Number Garden 11–20 (११ देखि २० सम्मको सङ्ख्या बगैँचा)
 * Class 1 Mathematics - Chapter 9: Numbers 11 to 20 (११ देखि २० सम्मका सङ्ख्याहरू)
 * Nepal Digital Education Platform
 */

import * as THREE from 'three';

export type GardenObjectType = 'APPLES' | 'FLOWERS' | 'BUTTERFLIES' | 'BALLOONS';

export interface ClickedGardenObject {
  id: number;
}

export class NumberGardenEnvironment {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationFrameId: number | null = null;

  // Scene Root Groups
  private gardenGroup = new THREE.Group();
  private orchardGroup = new THREE.Group();
  private flowerbedGroup = new THREE.Group();
  private displayGroup = new THREE.Group();

  // Countable Meshes (11 to 20 objects)
  public gardenObjects: THREE.Group[] = [];
  public countedIndices: Set<number> = new Set();

  // State
  private currentType: GardenObjectType = 'APPLES';
  private currentCount: number = 12;
  public onObjectClick?: (info: ClickedGardenObject) => void;

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Camera targets
  private targetCameraPos = new THREE.Vector3(0, 5.0, 10.5);
  private targetCameraLookAt = new THREE.Vector3(0, 1.4, 0);
  private currentCameraLookAt = new THREE.Vector3(0, 1.4, 0);

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe);
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.02);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 5.0, 10.5);
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
    this.buildGardenStructures();

    // 6. Initial Objects (12 apples)
    this.setObjects('APPLES', 12, new Set());

    // 7. Event listeners
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('resize', this.onWindowResize);

    // 8. Render loop
    this.animate();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.25);
    sunLight.position.set(8, 14, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 32;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x166534, 0.45);
    this.scene.add(hemiLight);
  }

  private buildTerrain() {
    const groundGeo = new THREE.PlaneGeometry(36, 36);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Terracotta pebble path
    const pathGeo = new THREE.RingGeometry(3.2, 4.6, 32);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.02;
    path.receiveShadow = true;
    this.scene.add(path);
  }

  private buildGardenStructures() {
    // Center Display Table
    const tableGeo = new THREE.BoxGeometry(3.2, 0.75, 1.8);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.375, 0);
    table.castShadow = true;
    table.receiveShadow = true;
    this.displayGroup.add(table);

    // Left Orchard Tree
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 4.0, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(-4.5, 2.0, -2.5);
    trunk.castShadow = true;
    this.orchardGroup.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8), foliageMat);
    f1.position.set(-4.5, 4.2, -2.5);
    f1.castShadow = true;
    this.orchardGroup.add(f1);

    // Right Flowerbed Base
    const bedGeo = new THREE.BoxGeometry(3.6, 0.2, 1.6);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(4.5, 0.1, -1.0);
    bed.receiveShadow = true;
    this.flowerbedGroup.add(bed);

    this.scene.add(this.displayGroup);
    this.scene.add(this.orchardGroup);
    this.scene.add(this.flowerbedGroup);
  }

  private create3DObject(type: GardenObjectType): THREE.Group {
    const group = new THREE.Group();

    if (type === 'APPLES') {
      const apple = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 })
      );
      apple.castShadow = true;
      group.add(apple);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.07),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      stem.position.y = 0.16;
      group.add(stem);
    } else if (type === 'FLOWERS') {
      const petals = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.14),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 })
      );
      petals.castShadow = true;
      group.add(petals);

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfacc15 })
      );
      center.position.y = 0.04;
      group.add(center);
    } else if (type === 'BUTTERFLIES') {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      group.add(body);

      const wingMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.4 });
      const wingGeo = new THREE.BoxGeometry(0.24, 0.01, 0.14);
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.13, 0.02, 0);
      group.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(0.13, 0.02, 0);
      group.add(rightWing);
    } else if (type === 'BALLOONS') {
      const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 })
      );
      balloon.scale.set(1.0, 1.25, 1.0);
      balloon.castShadow = true;
      group.add(balloon);

      const string = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.35),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
      );
      string.position.y = -0.28;
      group.add(string);
    }

    return group;
  }

  // ── Set Countable Objects (11 to 20) ──────────────────────────────

  public setObjects(
    type: GardenObjectType,
    count: number,
    counted: Set<number>
  ) {
    this.currentType = type;
    this.currentCount = count;
    this.countedIndices = new Set(counted);

    this.gardenObjects.forEach((m) => {
      if (m.parent) m.parent.remove(m);
    });
    this.gardenObjects = [];

    // Arrange neatly in two rows of up to 10 on the display table
    // Row 1 (Group of 10) in the back, Row 2 (Remainder 1-10) in the front
    const row1Count = Math.min(10, count);
    const row2Count = Math.max(0, count - 10);

    for (let i = 0; i < count; i++) {
      const obj = this.create3DObject(type);
      const isCounted = this.countedIndices.has(i);

      let x = 0;
      let z = 0;
      if (i < 10) {
        // First ten items (Ten group)
        x = -1.2 + (i % 10) * 0.27;
        z = -0.3;
      } else {
        // Additional ones (11 to 20)
        x = -1.2 + (i - 10) * 0.27;
        z = 0.35;
      }

      obj.position.set(x, 0.95, z);
      obj.userData = { id: i, interactive: true };

      if (isCounted) {
        // Emissive golden aura indicator
        const aura = new THREE.Mesh(
          new THREE.RingGeometry(0.16, 0.2, 16),
          new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
        );
        aura.rotation.x = Math.PI / 2;
        aura.position.y = -0.14;
        obj.add(aura);
      }

      this.displayGroup.add(obj);
      this.gardenObjects.push(obj);
    }
  }

  // ── Camera Presets ───────────────────────────────────────────────

  public setCameraPreset(preset: 'GARDEN' | 'TABLE' | 'TREE') {
    switch (preset) {
      case 'GARDEN':
        this.targetCameraPos.set(0, 5.0, 10.5);
        this.targetCameraLookAt.set(0, 1.4, 0);
        break;
      case 'TABLE':
        this.targetCameraPos.set(0, 3.2, 3.8);
        this.targetCameraLookAt.set(0, 0.95, 0);
        break;
      case 'TREE':
        this.targetCameraPos.set(-3.5, 3.6, 3.2);
        this.targetCameraLookAt.set(-4.5, 2.5, -2.5);
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
            this.onObjectClick({ id: curr.userData.id });
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

    // Subtle gentle floating
    const time = performance.now() * 0.002;
    this.gardenObjects.forEach((obj, i) => {
      obj.rotation.y = Math.sin(time + i) * 0.08;
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

