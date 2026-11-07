/**
 * VillageEnvironment.ts
 * Procedural 3D Nepalese Village Playground Environment using Three.js
 */
import * as THREE from 'three';

export interface VillageElements {
  scene: THREE.Scene;
  house: THREE.Group;
  door: THREE.Group;
  table: THREE.Group;
  chair: THREE.Group;
  basket: THREE.Group;
  waterPot: THREE.Group;
  bag: THREE.Group;
  ball: THREE.Group;
  trees: THREE.Group[];
  update: (delta: number) => void;
  openDoor: (open: boolean) => void;
}

export function createVillageEnvironment(scene: THREE.Scene): VillageElements {
  // ── 1. LIGHTING ──────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xfff6e6, 0.75);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.1);
  sunLight.position.set(18, 30, 22);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 70;
  const d = 20;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x9bd8ff, 0.45);
  fillLight.position.set(-20, 15, -15);
  scene.add(fillLight);

  // ── 2. SKY & HIMALAYAN BACKGROUND ────────────────────────────
  scene.background = new THREE.Color(0xbfe3ff);
  scene.fog = new THREE.Fog(0xbfe3ff, 35, 75);

  // Distant Mountain Range
  const mountainGroup = new THREE.Group();
  const mountainMat = new THREE.MeshLambertMaterial({ color: 0x8aa8c7 });
  const snowMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const peaks = [
    { x: -28, z: -40, h: 22, r: 14 },
    { x: -10, z: -48, h: 28, r: 18 },
    { x: 12, z: -44, h: 25, r: 16 },
    { x: 30, z: -42, h: 20, r: 13 },
  ];

  peaks.forEach((p) => {
    const coneGeo = new THREE.ConeGeometry(p.r, p.h, 7);
    const m = new THREE.Mesh(coneGeo, mountainMat);
    m.position.set(p.x, p.h / 2 - 2, p.z);
    mountainGroup.add(m);

    // Snow Cap
    const snowGeo = new THREE.ConeGeometry(p.r * 0.4, p.h * 0.35, 7);
    const snow = new THREE.Mesh(snowGeo, snowMat);
    snow.position.set(p.x, p.h * 0.85 - 2, p.z);
    mountainGroup.add(snow);
  });
  scene.add(mountainGroup);

  // Rolling Green Hills
  const hillMat = new THREE.MeshLambertMaterial({ color: 0x489654 });
  const hill1 = new THREE.Mesh(new THREE.SphereGeometry(18, 16, 16), hillMat);
  hill1.scale.set(1.8, 0.6, 1.2);
  hill1.position.set(-18, -4, -26);
  scene.add(hill1);

  const hill2 = new THREE.Mesh(new THREE.SphereGeometry(22, 16, 16), hillMat);
  hill2.scale.set(2.0, 0.55, 1.4);
  hill2.position.set(16, -5, -28);
  scene.add(hill2);

  // ── 3. GROUND & GARDEN LAWN ──────────────────────────────────
  const groundGeo = new THREE.CylinderGeometry(20, 20.5, 0.8, 36);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x5fa855 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.4;
  ground.receiveShadow = true;
  scene.add(ground);

  // Stone Garden Pathway
  const pathGroup = new THREE.Group();
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0xc8c3b7 });
  const stoneCoords = [
    { x: -4, z: 0, r: 0.85 },
    { x: -3.2, z: 1.6, r: 0.9 },
    { x: -2.0, z: 3.2, r: 0.8 },
    { x: -0.5, z: 4.4, r: 0.95 },
    { x: 1.5, z: 5.2, r: 0.85 },
    { x: 3.8, z: 5.4, r: 0.9 },
  ];
  stoneCoords.forEach((sc) => {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(sc.r, sc.r * 1.05, 0.08, 10), stoneMat);
    stone.position.set(sc.x, 0.04, sc.z);
    stone.rotation.y = Math.random() * Math.PI;
    stone.receiveShadow = true;
    pathGroup.add(stone);
  });
  scene.add(pathGroup);

  // ── 4. TRADITIONAL NEPALI VILLAGE HOUSE ───────────────────────
  const house = new THREE.Group();
  house.position.set(-7.5, 0, -3.5);

  // Stone Foundation / Plinth
  const plinthMat = new THREE.MeshLambertMaterial({ color: 0x8b8579 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.5, 5.6), plinthMat);
  plinth.position.y = 0.25;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  house.add(plinth);

  // Veranda floor (पिँढी)
  const verandaMat = new THREE.MeshLambertMaterial({ color: 0xa45b34 });
  const veranda = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.15, 1.8), verandaMat);
  veranda.position.set(0, 0.55, 1.8);
  veranda.receiveShadow = true;
  house.add(veranda);

  // Veranda Pillars
  const pillarMat = new THREE.MeshLambertMaterial({ color: 0x53351d });
  const pillarPositions = [-2.8, -1.0, 1.0, 2.8];
  pillarPositions.forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.8, 8), pillarMat);
    pillar.position.set(px, 1.95, 2.5);
    pillar.castShadow = true;
    house.add(pillar);
  });

  // House Walls (Clay plaster with white top)
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xf4eee4 });
  const lowerWallMat = new THREE.MeshLambertMaterial({ color: 0xba5334 }); // Red mud foundation wall

  // Back Wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 0.25), wallMat);
  backWall.position.set(0, 2.1, -1.8);
  backWall.castShadow = true;
  house.add(backWall);

  // Left Wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 3.8), wallMat);
  leftWall.position.set(-3.0, 2.1, 0.1);
  leftWall.castShadow = true;
  house.add(leftWall);

  // Right Wall
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 3.8), wallMat);
  rightWall.position.set(3.0, 2.1, 0.1);
  rightWall.castShadow = true;
  house.add(rightWall);

  // Front Wall (Split with Doorway Opening)
  const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.2, 0.25), wallMat);
  frontWallLeft.position.set(-2.0, 2.1, 1.0);
  frontWallLeft.castShadow = true;
  house.add(frontWallLeft);

  const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.25), wallMat);
  frontWallRight.position.set(1.8, 2.1, 1.0);
  frontWallRight.castShadow = true;
  house.add(frontWallRight);

  const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.25), wallMat);
  frontWallTop.position.set(-0.05, 3.25, 1.0);
  frontWallTop.castShadow = true;
  house.add(frontWallTop);

  // Lower Red Clay Base Band
  const baseBand = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.8, 3.9), lowerWallMat);
  baseBand.position.set(0, 0.9, 0.1);
  house.add(baseBand);

  // Carved Wooden Window (आँखीझ्याल)
  const windowFrameMat = new THREE.MeshLambertMaterial({ color: 0x3d2314 });
  const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.32), windowFrameMat);
  windowFrame.position.set(1.8, 2.3, 1.0);
  house.add(windowFrame);

  // Openable Door (Hinged at left)
  const doorGroup = new THREE.Group();
  doorGroup.position.set(-0.95, 0.5, 1.0); // Hinge location
  const doorLeafMat = new THREE.MeshLambertMaterial({ color: 0x6e3d1b });
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.3, 0.1), doorLeafMat);
  doorLeaf.position.set(0.8, 1.15, 0); // Offset from hinge
  doorLeaf.castShadow = true;
  doorGroup.add(doorLeaf);

  // Door handle
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshLambertMaterial({ color: 0xd4af37 }));
  handle.position.set(1.45, 1.15, 0.08);
  doorGroup.add(handle);

  house.add(doorGroup);

  // Traditional Sloped Terracotta Roof (छाना)
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x933e24 });
  const roofWood = new THREE.MeshLambertMaterial({ color: 0x3f2212 });

  const mainRoofGeo = new THREE.ConeGeometry(5.6, 2.2, 4);
  const mainRoof = new THREE.Mesh(mainRoofGeo, roofMat);
  mainRoof.position.set(0, 4.7, 0.6);
  mainRoof.rotation.y = Math.PI / 4;
  mainRoof.scale.set(1.2, 1, 0.95);
  mainRoof.castShadow = true;
  house.add(mainRoof);

  // Roof wooden trim edge
  const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.15, 5.8), roofWood);
  roofTrim.position.set(0, 3.75, 0.6);
  house.add(roofTrim);

  scene.add(house);

  // ── 5. WOODEN TABLE & CHAIR IN THE GARDEN ────────────────────
  const table = new THREE.Group();
  table.position.set(4.5, 0, 0.5);

  const woodTableMat = new THREE.MeshLambertMaterial({ color: 0x7c4e2a });
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.14, 20), woodTableMat);
  tableTop.position.y = 1.35;
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  table.add(tableTop);

  // 4 Table Legs
  const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 1.35, 8);
  const legOffsets = [
    { x: -0.9, z: -0.9 },
    { x: 0.9, z: -0.9 },
    { x: -0.9, z: 0.9 },
    { x: 0.9, z: 0.9 },
  ];
  legOffsets.forEach((pos) => {
    const leg = new THREE.Mesh(legGeo, woodTableMat);
    leg.position.set(pos.x, 1.35 / 2, pos.z);
    leg.castShadow = true;
    table.add(leg);
  });
  scene.add(table);

  // Wooden Chair / Stool
  const chair = new THREE.Group();
  chair.position.set(2.4, 0, 0.5);
  const chairSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16), woodTableMat);
  chairSeat.position.y = 0.75;
  chairSeat.castShadow = true;
  chair.add(chairSeat);

  const chairLegOffsets = [
    { x: -0.4, z: -0.4 },
    { x: 0.4, z: -0.4 },
    { x: -0.4, z: 0.4 },
    { x: 0.4, z: 0.4 },
  ];
  chairLegOffsets.forEach((pos) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.75, 8), woodTableMat);
    leg.position.set(pos.x, 0.75 / 2, pos.z);
    leg.castShadow = true;
    chair.add(leg);
  });
  scene.add(chair);

  // ── 6. TRADITIONAL WOVEN BASKET (डोको / टोकरी) ───────────────
  const basket = new THREE.Group();
  basket.position.set(0.5, 0, 3.2);

  const basketMat = new THREE.MeshLambertMaterial({ color: 0xd29d5b });
  // Hollow conical woven basket
  const basketOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.55, 0.9, 16, 1, true),
    basketMat
  );
  basketOuter.position.y = 0.45;
  basketOuter.castShadow = true;
  basket.add(basketOuter);

  // Basket Bottom
  const basketBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 16), basketMat);
  basketBottom.position.y = 0.03;
  basket.add(basketBottom);

  // Basket Rim
  const rimMat = new THREE.MeshLambertMaterial({ color: 0x9e6a32 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 8, 20), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.9;
  basket.add(rim);

  scene.add(basket);

  // ── 7. NEPALI BRASS WATER VESSEL (गाग्री / पानीको भाँडो) ──────
  const waterPot = new THREE.Group();
  waterPot.position.set(4.5, 1.42, 0.5); // Default placed above the table

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xdfab35,
    roughness: 0.35,
    metalness: 0.65,
  });

  const potBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), brassMat);
  potBody.position.y = 0.42;
  potBody.scale.set(1.1, 1, 1.1);
  potBody.castShadow = true;
  waterPot.add(potBody);

  const potNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.25, 16), brassMat);
  potNeck.position.y = 0.82;
  waterPot.add(potNeck);

  const potRim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 16), brassMat);
  potRim.rotation.x = Math.PI / 2;
  potRim.position.y = 0.95;
  waterPot.add(potRim);

  scene.add(waterPot);

  // ── 8. SCHOOL BAG (झोला) ─────────────────────────────────────
  const bag = new THREE.Group();
  bag.position.set(4.5, 0.25, 0.5); // Default placed below the table

  const bagMat = new THREE.MeshLambertMaterial({ color: 0x2563eb });
  const pocketMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });

  const bagMain = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.4), bagMat);
  bagMain.position.y = 0.38;
  bagMain.castShadow = true;
  bag.add(bagMain);

  const bagPocket = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.15), pocketMat);
  bagPocket.position.set(0, 0.28, 0.22);
  bag.add(bagPocket);

  scene.add(bag);

  // ── 9. COLOURFUL PLAY BALL (बल) ──────────────────────────────
  const ball = new THREE.Group();
  ball.position.set(0.5, 0.3, 3.2); // Default placed inside the basket

  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.3,
  });
  const ballSphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), ballMat);
  ballSphere.castShadow = true;
  ball.add(ballSphere);

  // Yellow stripe around ball
  const stripeMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.03, 8, 20), stripeMat);
  ball.add(stripe);

  scene.add(ball);

  // ── 10. TREES & FLOWER PATCHES ───────────────────────────────
  const trees: THREE.Group[] = [];

  function createPineTree(x: number, z: number, scale = 1): THREE.Group {
    const t = new THREE.Group();
    t.position.set(x, 0, z);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a381e });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.32 * scale, 1.8 * scale, 8), trunkMat);
    trunk.position.y = 0.9 * scale;
    trunk.castShadow = true;
    t.add(trunk);

    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2d6b38 });
    const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.6 * scale, 1.8 * scale, 8), foliageMat);
    tier1.position.y = 2.1 * scale;
    tier1.castShadow = true;
    t.add(tier1);

    const tier2 = new THREE.Mesh(new THREE.ConeGeometry(1.2 * scale, 1.6 * scale, 8), foliageMat);
    tier2.position.y = 3.0 * scale;
    tier2.castShadow = true;
    t.add(tier2);

    const tier3 = new THREE.Mesh(new THREE.ConeGeometry(0.8 * scale, 1.4 * scale, 8), foliageMat);
    tier3.position.y = 3.8 * scale;
    tier3.castShadow = true;
    t.add(tier3);

    scene.add(t);
    return t;
  }

  // Pine tree behind garden table
  const tree1 = createPineTree(7.5, -3.5, 1.35);
  trees.push(tree1);

  // Smaller tree on left edge
  const tree2 = createPineTree(-14, 2.5, 1.0);
  trees.push(tree2);

  // Blooming Rhododendron Tree (गुराँस)
  const rhodoTree = new THREE.Group();
  rhodoTree.position.set(-1.5, 0, -6.5);
  const rhodoTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 2.2, 8),
    new THREE.MeshLambertMaterial({ color: 0x4e3118 })
  );
  rhodoTrunk.position.y = 1.1;
  rhodoTree.add(rhodoTrunk);

  const rhodoLeaves = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.8, 1),
    new THREE.MeshLambertMaterial({ color: 0x3d7e48 })
  );
  rhodoLeaves.position.y = 2.8;
  rhodoLeaves.castShadow = true;
  rhodoTree.add(rhodoLeaves);

  // Red flower clusters
  const flowerMat = new THREE.MeshLambertMaterial({ color: 0xec4899 });
  for (let i = 0; i < 7; i++) {
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), flowerMat);
    const ang = (i / 7) * Math.PI * 2;
    fl.position.set(Math.cos(ang) * 1.5, 2.8 + Math.sin(ang * 2) * 0.4, Math.sin(ang) * 1.5);
    rhodoTree.add(fl);
  }
  scene.add(rhodoTree);
  trees.push(rhodoTree);

  // Flower Beds on the Lawn
  const flowerBedColors = [0xf59e0b, 0xec4899, 0xa855f7, 0xef4444];
  const flowerBedOffsets = [
    { x: -5, z: 4.5 },
    { x: 3, z: 3.5 },
    { x: 6, z: 4.5 },
    { x: -6.5, z: 3.2 },
  ];
  flowerBedOffsets.forEach((fpos, idx) => {
    const fGroup = new THREE.Group();
    fGroup.position.set(fpos.x, 0, fpos.z);
    for (let j = 0; j < 5; j++) {
      const col = flowerBedColors[(idx + j) % flowerBedColors.length];
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 6, 6),
        new THREE.MeshLambertMaterial({ color: col })
      );
      fl.position.set((Math.random() - 0.5) * 0.9, 0.15 + Math.random() * 0.15, (Math.random() - 0.5) * 0.9);
      fGroup.add(fl);
    }
    scene.add(fGroup);
  });

  // ── 11. DOOR CONTROL ─────────────────────────────────────────
  let targetDoorAngle = 0;
  let currentDoorAngle = 0;

  function openDoor(open: boolean) {
    targetDoorAngle = open ? -Math.PI * 0.65 : 0;
  }

  function update(delta: number) {
    if (Math.abs(currentDoorAngle - targetDoorAngle) > 0.01) {
      currentDoorAngle += (targetDoorAngle - currentDoorAngle) * Math.min(1, delta * 6);
      doorGroup.rotation.y = currentDoorAngle;
    }
  }

  return {
    scene,
    house,
    door: doorGroup,
    table,
    chair,
    basket,
    waterPot,
    bag,
    ball,
    trees,
    update,
    openDoor,
  };
}

