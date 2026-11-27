/**
 * ThreeModelFactory.ts
 * Procedural 3D model builders for Grade 4 Science simulations.
 * Uses Three.js primitives and custom materials to create stylized,
 * museum-grade educational 3D objects with zero external mesh loading lag.
 */
import * as THREE from 'three';
import { ThreeTextureFactory } from './ThreeTextureFactory';

export class ThreeModelFactory {
  // ─── 1. LABORATORY APPARATUS ───────────────────────────────────────────────

  /**
   * Transparent Water Tank for Floating & Sinking Lab
   */
  static createWaterTank(width = 8, height = 5, depth = 5, waterLevel = 0.75): THREE.Group {
    const group = new THREE.Group();

    // Glass Tank Walls (Thin transparent box with clearcoat)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.5,
      side: THREE.DoubleSide,
    });

    const tankGeo = new THREE.BoxGeometry(width, height, depth);
    const tankMesh = new THREE.Mesh(tankGeo, glassMat);
    tankMesh.position.y = height / 2;
    group.add(tankMesh);

    // Tank Frame (Sturdy teal metal rim & base)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.3,
      metalness: 0.7,
    });
    const baseGeo = new THREE.BoxGeometry(width + 0.3, 0.25, depth + 0.3);
    const baseMesh = new THREE.Mesh(baseGeo, frameMat);
    baseMesh.position.y = 0.125;
    group.add(baseMesh);

    // Water Volume
    const waterHeight = height * waterLevel;
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      transmission: 0.6,
      ior: 1.333,
    });
    const waterGeo = new THREE.BoxGeometry(width - 0.1, waterHeight, depth - 0.1);
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = waterHeight / 2 + 0.05;
    group.add(waterMesh);

    // Water Surface ripple plane
    const surfaceGeo = new THREE.PlaneGeometry(width - 0.15, depth - 0.15);
    const surfaceMat = new THREE.MeshStandardMaterial({
      map: ThreeTextureFactory.createWaterTexture(),
      transparent: true,
      opacity: 0.8,
      roughness: 0.2,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.rotation.x = -Math.PI / 2;
    surfaceMesh.position.y = waterHeight;
    group.add(surfaceMesh);

    // Measurement scale marks on front glass
    const marksGroup = new THREE.Group();
    const markMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    for (let y = 1; y < height; y += 0.8) {
      const lineGeo = new THREE.BoxGeometry(0.8, 0.04, 0.02);
      const lineMesh = new THREE.Mesh(lineGeo, markMat);
      lineMesh.position.set(-width / 2 + 0.5, y, depth / 2 + 0.02);
      marksGroup.add(lineMesh);
    }
    group.add(marksGroup);

    return group;
  }

  /**
   * Laboratory Glass Beaker with graduated markings and liquid
   */
  static createBeaker(radius = 1.2, height = 3.0, liquidColor = 0x38bdf8, liquidRatio = 0.6): THREE.Group {
    const group = new THREE.Group();

    // Glass cylinder
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      transmission: 0.9,
    });
    const beakerGeo = new THREE.CylinderGeometry(radius, radius * 0.95, height, 32, 1, true);
    const beakerMesh = new THREE.Mesh(beakerGeo, glassMat);
    beakerMesh.position.y = height / 2;
    group.add(beakerMesh);

    // Glass bottom
    const bottomGeo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, 0.1, 32);
    const bottomMesh = new THREE.Mesh(bottomGeo, glassMat);
    bottomMesh.position.y = 0.05;
    group.add(bottomMesh);

    // Liquid cylinder
    if (liquidRatio > 0.05) {
      const lHeight = height * liquidRatio;
      const lMat = new THREE.MeshStandardMaterial({
        color: liquidColor,
        transparent: true,
        opacity: 0.75,
        roughness: 0.2,
      });
      const lGeo = new THREE.CylinderGeometry(radius * 0.9, radius * 0.88, lHeight, 32);
      const lMesh = new THREE.Mesh(lGeo, lMat);
      lMesh.position.y = lHeight / 2 + 0.08;
      group.add(lMesh);
    }

    return group;
  }

  /**
   * Dual-Pan Balance Scale for Measurement Lab
   */
  static createBalanceScale(tiltAngle = 0): THREE.Group {
    const group = new THREE.Group();
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.2,
    });

    // Heavy base
    const baseGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.4, 32);
    const baseMesh = new THREE.Mesh(baseGeo, brassMat);
    baseMesh.position.y = 0.2;
    group.add(baseMesh);

    // Vertical Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.25, 0.35, 6, 24);
    const pillarMesh = new THREE.Mesh(pillarGeo, brassMat);
    pillarMesh.position.y = 3.2;
    group.add(pillarMesh);

    // Center Fulcrum Pivot
    const pivotSphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), brassMat);
    pivotSphere.position.y = 6.2;
    group.add(pivotSphere);

    // Tilting Crossbeam
    const beamGroup = new THREE.Group();
    beamGroup.position.y = 6.2;
    beamGroup.rotation.z = tiltAngle;

    const beamGeo = new THREE.BoxGeometry(7, 0.25, 0.3);
    const beamMesh = new THREE.Mesh(beamGeo, brassMat);
    beamGroup.add(beamMesh);

    // Left & Right Strings and Pans
    const panGeo = new THREE.CylinderGeometry(1.4, 1.2, 0.2, 32);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });

    // Left pan
    const leftPanGroup = new THREE.Group();
    leftPanGroup.position.set(-3.2, -2.5, 0);
    const leftPanMesh = new THREE.Mesh(panGeo, brassMat);
    leftPanGroup.add(leftPanMesh);
    // string
    const lString = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.5), stringMat);
    lString.position.set(-3.2, -1.25, 0);
    beamGroup.add(lString);
    beamGroup.add(leftPanGroup);

    // Right pan
    const rightPanGroup = new THREE.Group();
    rightPanGroup.position.set(3.2, -2.5, 0);
    const rightPanMesh = new THREE.Mesh(panGeo, brassMat);
    rightPanGroup.add(rightPanMesh);
    const rString = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.5), stringMat);
    rString.position.set(3.2, -1.25, 0);
    beamGroup.add(rString);
    beamGroup.add(rightPanGroup);

    group.add(beamGroup);
    return group;
  }

  // ─── 2. BUOYANCY OBJECTS ──────────────────────────────────────────────────

  /**
   * Faceted 3D River Stone
   */
  static createStone(scale = 1.0): THREE.Group {
    const group = new THREE.Group();
    const stoneGeo = new THREE.DodecahedronGeometry(0.8 * scale, 1);
    // Deform vertices slightly for natural rock look
    const pos = stoneGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = (i * 13) % 7;
      pos.setXYZ(i, pos.getX(i) * (0.9 + u * 0.03), pos.getY(i) * (0.8 + u * 0.04), pos.getZ(i) * (0.9 + u * 0.02));
    }
    stoneGeo.computeVertexNormals();

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(stoneGeo, stoneMat);
    mesh.castShadow = true;
    group.add(mesh);
    return group;
  }

  /**
   * Textured Pine Wood Block
   */
  static createWoodBlock(scale = 1.0): THREE.Group {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.4 * scale, 0.7 * scale, 1.0 * scale);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      map: ThreeTextureFactory.createWoodTexture('#b45309'),
      roughness: 0.65,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    group.add(mesh);
    return group;
  }

  /**
   * Organic 3D Leaf with stem
   */
  static createLeaf(scale = 1.0): THREE.Group {
    const group = new THREE.Group();

    // Curved Leaf blade using Shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.6, 0.8, 0, 1.8);
    shape.quadraticCurveTo(-0.6, 0.8, 0, 0);

    const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      map: ThreeTextureFactory.createLeafTexture(),
      roughness: 0.4,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(scale, scale, scale);
    mesh.rotation.x = Math.PI * 0.1;
    group.add(mesh);

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.6);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = -0.9 * scale;
    group.add(stem);

    return group;
  }

  /**
   * Embossed Metal Coin
   */
  static createCoin(scale = 1.0): THREE.Group {
    const group = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.7 * scale, 0.7 * scale, 0.12 * scale, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.9,
      roughness: 0.2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Rim highlight
    const rimGeo = new THREE.TorusGeometry(0.65 * scale, 0.04 * scale, 8, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.95, roughness: 0.15 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    group.add(rim);

    return group;
  }

  // ─── 3. ELECTRONICS & ENERGY ──────────────────────────────────────────────

  /**
   * 3D Cylindrical D-Cell Battery with markings
   */
  static createBattery(): THREE.Group {
    const group = new THREE.Group();

    // Body cylinder
    const bodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.4, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.2;
    group.add(body);

    // Positive Gold Band
    const bandGeo = new THREE.CylinderGeometry(0.81, 0.81, 0.7, 32);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 2.05;
    group.add(band);

    // Positive terminal (+)
    const nubiGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.35, 24);
    const termMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const nubi = new THREE.Mesh(nubiGeo, termMat);
    nubi.position.y = 2.55;
    group.add(nubi);

    // Negative terminal plate (-)
    const negGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.08, 32);
    const neg = new THREE.Mesh(negGeo, termMat);
    neg.position.y = 0.04;
    group.add(neg);

    return group;
  }

  /**
   * 3D Filament Lightbulb with dynamic glowing point light
   */
  static createLightbulb(isLit = false): { group: THREE.Group; light: THREE.PointLight; glowMesh: THREE.Mesh } {
    const group = new THREE.Group();

    // Screw base (threaded look)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, metalness: 0.85, roughness: 0.25 });
    const baseGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 24);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.4;
    group.add(base);

    // Glass bulb envelope (Sphere merged with cone)
    const bulbMat = new THREE.MeshPhysicalMaterial({
      color: isLit ? 0xfef08a : 0xffffff,
      transparent: true,
      opacity: isLit ? 0.9 : 0.4,
      roughness: 0.1,
      transmission: 0.8,
      emissive: isLit ? 0xfbbf24 : 0x000000,
      emissiveIntensity: isLit ? 1.5 : 0,
    });
    const bulbGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.y = 1.6;
    group.add(bulbMesh);

    // Tungsten filament wire
    const filMat = new THREE.MeshBasicMaterial({ color: isLit ? 0xffffff : 0x52525b });
    const filGeo = new THREE.TorusGeometry(0.2, 0.03, 8, 16);
    const fil = new THREE.Mesh(filGeo, filMat);
    fil.position.y = 1.6;
    group.add(fil);

    // Dynamic light source
    const light = new THREE.PointLight(0xffea00, isLit ? 3.0 : 0, 8);
    light.position.y = 1.6;
    group.add(light);

    // Glowing halo shell
    const glowGeo = new THREE.SphereGeometry(1.3, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: isLit ? 0.25 : 0,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.y = 1.6;
    group.add(glowMesh);

    return { group, light, glowMesh };
  }

  /**
   * 3D Knife Switch (Interactive Circuit component)
   */
  static createKnifeSwitch(isOpen = true): { group: THREE.Group; lever: THREE.Group } {
    const group = new THREE.Group();

    // Insulated base board
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const baseGeo = new THREE.BoxGeometry(3.0, 0.3, 1.8);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.15;
    group.add(base);

    // Brass Contact clips
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
    const clip1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.4), brassMat);
    clip1.position.set(-1.0, 0.5, 0);
    group.add(clip1);

    const clip2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.4), brassMat);
    clip2.position.set(1.0, 0.5, 0);
    group.add(clip2);

    // Hinged Lever Arm
    const lever = new THREE.Group();
    lever.position.set(-1.0, 0.5, 0);
    lever.rotation.z = isOpen ? Math.PI / 4 : 0;

    const bladeGeo = new THREE.BoxGeometry(2.2, 0.12, 0.2);
    const blade = new THREE.Mesh(bladeGeo, brassMat);
    blade.position.x = 1.1;
    lever.add(blade);

    // Plastic grip handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const handleGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 16);
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(2.1, 0, 0);
    handle.rotation.z = Math.PI / 2;
    lever.add(handle);

    group.add(lever);
    return { group, lever };
  }

  /**
   * 3D Alnico Bar Magnet with Red North and Blue South
   */
  static createBarMagnet(): THREE.Group {
    const group = new THREE.Group();

    // North Pole (Red)
    const nMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.4 });
    const nGeo = new THREE.BoxGeometry(2.0, 0.8, 1.2);
    const nMesh = new THREE.Mesh(nGeo, nMat);
    nMesh.position.x = -1.0;
    group.add(nMesh);

    // South Pole (Blue)
    const sMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3, metalness: 0.4 });
    const sGeo = new THREE.BoxGeometry(2.0, 0.8, 1.2);
    const sMesh = new THREE.Mesh(sGeo, sMat);
    sMesh.position.x = 1.0;
    group.add(sMesh);

    return group;
  }

  // ─── 4. ICT COMPUTER WORKSTATION ──────────────────────────────────────────

  /**
   * 3D LCD Desktop Monitor with Stand
   */
  static createMonitor(): THREE.Group {
    const group = new THREE.Group();
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 });

    // Screen Bezel
    const bezelGeo = new THREE.BoxGeometry(4.2, 2.6, 0.25);
    const bezel = new THREE.Mesh(bezelGeo, caseMat);
    bezel.position.y = 2.4;
    group.add(bezel);

    // Screen Display Panel
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      map: ThreeTextureFactory.createCircuitBoardTexture(),
    });
    const screenGeo = new THREE.PlaneGeometry(3.9, 2.3);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 2.4, 0.13);
    group.add(screen);

    // Stand neck & base
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16);
    const neck = new THREE.Mesh(neckGeo, caseMat);
    neck.position.y = 0.8;
    group.add(neck);

    const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.15, 32);
    const base = new THREE.Mesh(baseGeo, caseMat);
    base.position.y = 0.08;
    group.add(base);

    return group;
  }

  /**
   * 3D Computer Tower (System Unit)
   */
  static createSystemUnit(): THREE.Group {
    const group = new THREE.Group();
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 });

    // Chassis
    const towerGeo = new THREE.BoxGeometry(1.6, 3.8, 3.2);
    const tower = new THREE.Mesh(towerGeo, caseMat);
    tower.position.y = 1.9;
    group.add(tower);

    // Glowing Power LED button
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const ledGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.rotation.x = Math.PI / 2;
    led.position.set(0, 3.2, 1.62);
    group.add(led);

    // Front ventilating grilles
    const grillMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    for (let y = 1.0; y < 2.8; y += 0.3) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.05), grillMat);
      slot.position.set(0, y, 1.62);
      group.add(slot);
    }

    return group;
  }

  /**
   * 3D Keyboard with individual keys
   */
  static createKeyboard(): THREE.Group {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

    // Tray angled slightly
    const trayGeo = new THREE.BoxGeometry(3.6, 0.18, 1.4);
    const tray = new THREE.Mesh(trayGeo, baseMat);
    tray.position.y = 0.09;
    tray.rotation.x = 0.05;
    group.add(tray);

    // Keycaps grid
    const keyMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3 });
    const spaceMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 12; c++) {
        if (r === 3 && c > 3 && c < 8) continue; // Space bar area
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.22), keyMat);
        key.position.set(-1.5 + c * 0.27, 0.2, -0.45 + r * 0.3);
        group.add(key);
      }
    }

    // Space bar
    const spaceBar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.22), spaceMat);
    spaceBar.position.set(0, 0.2, 0.45);
    group.add(spaceBar);

    return group;
  }

  // ─── 5. BOTANY & NATURE ───────────────────────────────────────────────────

  /**
   * Lush 3D Tree with trunk and foliage clusters
   */
  static createTree(scale = 1.0, foliageColor = 0x16a34a): THREE.Group {
    const group = new THREE.Group();

    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      map: ThreeTextureFactory.createWoodTexture('#78350f'),
      roughness: 0.9,
    });
    const trunkGeo = new THREE.CylinderGeometry(0.4 * scale, 0.6 * scale, 3.5 * scale, 12);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = (3.5 * scale) / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // Canopy (3 intersecting soft spheres for natural fullness)
    const leafMat = new THREE.MeshStandardMaterial({
      color: foliageColor,
      roughness: 0.7,
      flatShading: true,
    });

    const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8 * scale, 1), leafMat);
    c1.position.y = 3.8 * scale;
    c1.castShadow = true;
    group.add(c1);

    const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4 * scale, 1), leafMat);
    c2.position.set(0.8 * scale, 3.4 * scale, 0.4 * scale);
    c2.castShadow = true;
    group.add(c2);

    const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3 * scale, 1), leafMat);
    c3.position.set(-0.7 * scale, 3.5 * scale, -0.3 * scale);
    c3.castShadow = true;
    group.add(c3);

    return group;
  }

  /**
   * Himalayan Pine Conifer Tree
   */
  static createPineTree(scale = 1.0): THREE.Group {
    const group = new THREE.Group();

    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x582f0e, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 2.0 * scale, 8), trunkMat);
    trunk.position.y = 1.0 * scale;
    group.add(trunk);

    // 3 Tiers of Conifer cones
    const needleMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8, flatShading: true });

    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.6 * scale, 2.0 * scale, 8), needleMat);
    cone1.position.y = 2.2 * scale;
    group.add(cone1);

    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.3 * scale, 1.8 * scale, 8), needleMat);
    cone2.position.y = 3.2 * scale;
    group.add(cone2);

    const cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.9 * scale, 1.5 * scale, 8), needleMat);
    cone3.position.y = 4.1 * scale;
    group.add(cone3);

    return group;
  }

  /**
   * 3D Metamorphosis Butterfly with Flapping Wings
   */
  static createButterfly(): { group: THREE.Group; leftWing: THREE.Mesh; rightWing: THREE.Mesh } {
    const group = new THREE.Group();

    // Body thorax & abdomen
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.5 });
    const bodyGeo = new THREE.CylinderGeometry(0.08, 0.06, 1.0, 12);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Head with antennae
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), bodyMat);
    head.position.z = -0.55;
    group.add(head);

    // Wing Shape
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.bezierCurveTo(0.8, 0.8, 1.5, 0.4, 1.2, -0.6);
    wingShape.bezierCurveTo(0.8, -1.0, 0.3, -0.6, 0, 0);

    const wingGeo = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Vibrant Monarch Orange
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(0.05, 0, 0);
    group.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.scale.x = -1;
    rightWing.position.set(-0.05, 0, 0);
    group.add(rightWing);

    return { group, leftWing, rightWing };
  }

  // ─── 6. ASTRONOMY & EARTH ─────────────────────────────────────────────────

  /**
   * 3D Earth Globe with Day/Night Lighting and Atmospheric Rim Glow
   */
  static createEarthGlobe(radius = 3.5): { globe: THREE.Group; earthMesh: THREE.Mesh; cloudsMesh: THREE.Mesh } {
    const globe = new THREE.Group();

    // Earth Sphere with high-res procedural map
    const earthGeo = new THREE.SphereGeometry(radius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: ThreeTextureFactory.createEarthTexture(),
      roughness: 0.45,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globe.add(earthMesh);

    // Semi-transparent Cloud Layer rotating slightly faster
    const cloudsGeo = new THREE.SphereGeometry(radius * 1.025, 48, 48);
    const cloudsMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
      roughness: 1.0,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globe.add(cloudsMesh);

    // Atmosphere Rim Aura
    const auraGeo = new THREE.SphereGeometry(radius * 1.08, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    globe.add(auraMesh);

    // Nepal Marker Pin (Himalayan Peak Indicator)
    // Lat ~ 28°N, Lng ~ 84°E on sphere
    const phi = (90 - 28) * (Math.PI / 180);
    const theta = (84 + 180) * (Math.PI / 180);
    const px = -(radius * 1.02) * Math.sin(phi) * Math.cos(theta);
    const py = (radius * 1.02) * Math.cos(phi);
    const pz = (radius * 1.02) * Math.sin(phi) * Math.sin(theta);

    const pinMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const pin = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 12), pinMat);
    pin.position.set(px, py, pz);
    pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(px, py, pz).normalize());
    globe.add(pin);

    return { globe, earthMesh, cloudsMesh };
  }

  // ─── 5. HIGH-FIDELITY FAUNA & ZOOLOGICAL SPECIMENS ────────────────────────

  /**
   * Nepal National Bird: Danfe (Himalayan Monal - Lophophorus impejanus)
   * High-detail iridescent plumage, fan crest, folded wings, and tail
   */
  static createDanfe(scale = 1.0): { group: THREE.Group; headGroup: THREE.Group; tailGroup: THREE.Group } {
    const group = new THREE.Group();
    group.scale.set(scale, scale, scale);

    const featherMat = new THREE.MeshStandardMaterial({
      map: ThreeTextureFactory.createDanfeFeatherTexture(),
      roughness: 0.35,
      metalness: 0.45,
    });

    const bodyGeo = new THREE.SphereGeometry(1.2, 24, 24);
    bodyGeo.scale(1.1, 0.9, 1.5);
    const body = new THREE.Mesh(bodyGeo, featherMat);
    body.position.set(0, 1.3, 0);
    body.castShadow = true;
    group.add(body);

    // Breast / Underbelly (Rich velvety green-black)
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.6 });
    const bellyGeo = new THREE.SphereGeometry(1.0, 16, 16);
    bellyGeo.scale(0.9, 0.7, 1.2);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, 0.9, 0.1);
    group.add(belly);

    // Head and Neck Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.8, 1.1);

    // Neck
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.8, 16), neckMat);
    neck.rotation.x = -0.3;
    neck.position.set(0, 0.3, 0.2);
    headGroup.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), neckMat);
    head.position.set(0, 0.7, 0.45);
    headGroup.add(head);

    // Crest (5 fan spatula plumes)
    const crestMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    for (let i = -2; i <= 2; i++) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), crestMat);
      stem.position.set(i * 0.06, 1.05, 0.45);
      stem.rotation.z = -i * 0.15;
      stem.rotation.x = -0.2;
      headGroup.add(stem);

      const spatula = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), crestMat);
      spatula.scale.set(1.5, 0.5, 1.0);
      spatula.position.set(i * 0.12, 1.28, 0.4);
      headGroup.add(spatula);
    }

    // Beak
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 8), beakMat);
    beak.rotation.x = Math.PI / 2 + 0.2;
    beak.position.set(0, 0.65, 0.85);
    headGroup.add(beak);

    // Eyes
    for (let side of [-1, 1]) {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      eyeWhite.position.set(side * 0.35, 0.75, 0.52);
      headGroup.add(eyeWhite);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      pupil.position.set(side * 0.38, 0.75, 0.58);
      headGroup.add(pupil);
    }
    group.add(headGroup);

    // Folded Wings
    for (let side of [-1, 1]) {
      const wingGeo = new THREE.BoxGeometry(0.2, 0.9, 1.8);
      wingGeo.scale(1.0, 0.8, 1.0);
      const wing = new THREE.Mesh(wingGeo, featherMat);
      wing.position.set(side * 1.05, 1.3, -0.2);
      wing.rotation.y = side * 0.1;
      group.add(wing);
    }

    // Fan Tail Group
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 1.2, -1.3);
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });
    for (let i = -3; i <= 3; i++) {
      const feather = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 1.2), tailMat);
      feather.position.set(i * 0.12, 0, -0.5);
      feather.rotation.y = i * 0.08;
      tailGroup.add(feather);
    }
    tailGroup.rotation.x = -0.3;
    group.add(tailGroup);

    // Sturdy Perching Legs & Claws
    const legMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.7 });
    for (let side of [-1, 1]) {
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8), legMat);
      thigh.position.set(side * 0.45, 0.55, 0);
      group.add(thigh);

      // 3 Forward Claws
      for (let c = -1; c <= 1; c++) {
        const claw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.3), legMat);
        claw.position.set(side * 0.45 + c * 0.08, 0.1, 0.15);
        group.add(claw);
      }
    }

    return { group, headGroup, tailGroup };
  }

  /**
   * Anatomically Detailed Tree Frog with moist skin & rhythmic vocal sac
   */
  static createFrog(scale = 1.0): { group: THREE.Group; throatMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.scale.set(scale, scale, scale);

    const skinMat = new THREE.MeshStandardMaterial({
      map: ThreeTextureFactory.createFrogSkinTexture(),
      roughness: 0.25,
      metalness: 0.1,
    });

    // Body
    const bodyGeo = new THREE.SphereGeometry(1.0, 24, 24);
    bodyGeo.scale(1.2, 0.65, 1.4);
    const body = new THREE.Mesh(bodyGeo, skinMat);
    body.position.set(0, 0.65, 0);
    body.castShadow = true;
    group.add(body);

    // Bulging Frog Eyes on top
    for (let side of [-1, 1]) {
      const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), skinMat);
      eyeSocket.position.set(side * 0.55, 1.05, 0.6);
      group.add(eyeSocket);

      const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.1 }));
      eyeBall.position.set(side * 0.55, 1.1, 0.7);
      group.add(eyeBall);

      const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.04), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      pupil.position.set(side * 0.55, 1.1, 0.88);
      group.add(pupil);
    }

    // Throat / Inflatable Vocal Sac
    const throatMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      transparent: true,
      opacity: 0.85,
      roughness: 0.3,
    });
    const throatGeo = new THREE.SphereGeometry(0.45, 16, 16);
    throatGeo.scale(1.2, 0.8, 1.0);
    const throatMesh = new THREE.Mesh(throatGeo, throatMat);
    throatMesh.position.set(0, 0.42, 0.7);
    group.add(throatMesh);

    // Folded Muscular Z-Hind Legs
    for (let side of [-1, 1]) {
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 1.1, 12), skinMat);
      thigh.position.set(side * 1.1, 0.6, -0.4);
      thigh.rotation.z = side * 0.8;
      thigh.rotation.x = -0.4;
      group.add(thigh);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 1.0, 12), skinMat);
      shin.position.set(side * 1.1, 0.3, 0.1);
      shin.rotation.z = -side * 0.6;
      group.add(shin);

      // Webbed foot pad
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.7), skinMat);
      foot.position.set(side * 1.0, 0.05, 0.4);
      group.add(foot);
    }

    // Forelegs
    for (let side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.65, 8), skinMat);
      arm.position.set(side * 0.75, 0.35, 0.65);
      arm.rotation.z = -side * 0.3;
      group.add(arm);
    }

    return { group, throatMesh };
  }

  /**
   * Anatomically Detailed Garden Snail with coiled calcium shell & tentacles
   */
  static createSnail(scale = 1.0): { group: THREE.Group; footMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.scale.set(scale, scale, scale);

    // 1. Coiled Spiral Shell
    const shellMat = new THREE.MeshStandardMaterial({
      map: ThreeTextureFactory.createSnailShellTexture(),
      roughness: 0.4,
      metalness: 0.05,
    });
    const shellGeo = new THREE.SphereGeometry(1.1, 32, 32);
    shellGeo.scale(1.0, 1.2, 0.7);
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.set(0, 1.2, -0.2);
    shell.rotation.z = 0.2;
    shell.castShadow = true;
    group.add(shell);

    // 2. Soft Translucent Fleshy Foot
    const footMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.5,
      transparent: true,
      opacity: 0.92,
    });
    const footGeo = new THREE.BoxGeometry(0.8, 0.3, 2.8);
    footGeo.scale(1, 1, 1);
    const footMesh = new THREE.Mesh(footGeo, footMat);
    footMesh.position.set(0, 0.15, 0.2);
    group.add(footMesh);

    // 3. Head & Sensory Tentacles
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), footMat);
    head.position.set(0, 0.5, 1.4);
    group.add(head);

    // Upper Eye Stalks (Ommatophores)
    for (let side of [-1, 1]) {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.6, 8), footMat);
      stalk.position.set(side * 0.18, 0.9, 1.55);
      stalk.rotation.x = 0.4;
      stalk.rotation.z = side * 0.25;
      group.add(stalk);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      eye.position.set(side * 0.24, 1.15, 1.7);
      group.add(eye);
    }

    return { group, footMesh };
  }

  /**
   * Anatomically Detailed Himalayan Trout with scaled skin & wagging fin
   */
  static createTrout(scale = 1.0): { group: THREE.Group; tailFin: THREE.Mesh } {
    const group = new THREE.Group();
    group.scale.set(scale, scale, scale);

    const scaleMat = new THREE.MeshStandardMaterial({
      map: ThreeTextureFactory.createFishScaleTexture(),
      roughness: 0.2,
      metalness: 0.35,
    });

    // Hydrodynamic Torpedo Body
    const bodyGeo = new THREE.SphereGeometry(0.9, 24, 24);
    bodyGeo.scale(0.65, 1.0, 2.6);
    const body = new THREE.Mesh(bodyGeo, scaleMat);
    body.position.set(0, 0, 0);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Dorsal Fin (Top)
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.0, 4), finMat);
    dorsal.rotation.z = Math.PI;
    dorsal.rotation.x = -0.5;
    dorsal.position.set(0, 1.0, -0.2);
    group.add(dorsal);

    // Pectoral Fins (Sides)
    for (let side of [-1, 1]) {
      const pect = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.8), finMat);
      pect.position.set(side * 0.65, -0.2, 0.6);
      pect.rotation.y = side * 0.8;
      pect.rotation.z = -side * 0.4;
      group.add(pect);
    }

    // Caudal (Tail) Fin
    const tailGeo = new THREE.PlaneGeometry(0.9, 1.4);
    const tailFin = new THREE.Mesh(tailGeo, finMat);
    tailFin.position.set(0, 0, -2.5);
    tailFin.rotation.y = Math.PI / 2;
    group.add(tailFin);

    // Eyes
    for (let side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      eye.position.set(side * 0.45, 0.2, 1.6);
      group.add(eye);
    }

    return { group, tailFin };
  }

  /**
   * Metamorphosis Tadpole Stage
   */
  static createTadpole(hasLegs = false): { group: THREE.Group; tail: THREE.Mesh } {
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Head/Torso
    const headGeo = new THREE.SphereGeometry(0.65, 16, 16);
    headGeo.scale(0.85, 0.75, 1.2);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 0, 0);
    group.add(head);

    // Wavy Translucent Tail
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      side: THREE.DoubleSide,
    });
    const tailGeo = new THREE.PlaneGeometry(0.6, 2.2);
    const tail = new THREE.Mesh(tailGeo, finMat);
    tail.position.set(0, 0, -1.5);
    tail.rotation.y = Math.PI / 2;
    group.add(tail);

    if (hasLegs) {
      // Small developing hind legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
      for (let side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.5, 8), legMat);
        leg.position.set(side * 0.5, -0.2, -0.4);
        leg.rotation.z = side * 0.7;
        group.add(leg);
      }
    }

    return { group, tail };
  }

  /**
   * Procedural Curved Flexible Circuit Wire
   */
  static createCurvedWire(p1: THREE.Vector3, p2: THREE.Vector3, color = 0xef4444, archY = 0.8): THREE.Mesh {
    const mid = new THREE.Vector3(
      (p1.x + p2.x) / 2,
      Math.max(p1.y, p2.y) + archY,
      (p1.z + p2.z) / 2 + 0.4
    );
    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.065, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.35,
      metalness: 0.3,
    });
    return new THREE.Mesh(tubeGeo, tubeMat);
  }
}


