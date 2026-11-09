/**
 * VillageEnvironment.ts
 * Procedural 3D Nepalese Village Playground Environment using Three.js
 * Supports Light & Dark themes, interactive door, toy box, roof cutaway, and spatial drop zones.
 */
import * as THREE from 'three';

export interface VillageElements {
  scene: THREE.Scene;
  house: THREE.Group;
  roof: THREE.Mesh;
  door: THREE.Group;
  table: THREE.Group;
  chair: THREE.Group;
  basket: THREE.Group;
  toyBox: THREE.Group;
  toyBoxLid: THREE.Group;
  waterPot: THREE.Group;
  bag: THREE.Group;
  ball: THREE.Group;
  teddy: THREE.Group;
  toyCar: THREE.Group;
  largeFlower: THREE.Group;
  trees: THREE.Group[];
  update: (delta: number) => void;
  openDoor: (open: boolean) => void;
  openToyBox: (open: boolean) => void;
  setRoofCutaway: (cutaway: boolean) => void;
  setTheme: (isDark: boolean) => void;
  highlightZone: (zone: 'house' | 'basket' | 'box' | 'table_above' | 'table_below' | 'tree' | 'flower' | null) => void;
}

export function createVillageEnvironment(scene: THREE.Scene): VillageElements {
  // ── 1. LIGHTING ──────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xfff6e6, 0.78);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.15);
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

  // Warm Lantern for Veranda (Glows warmly in Dark Mode)
  const lanternLight = new THREE.PointLight(0xffaa44, 0, 8);
  lanternLight.position.set(-7.5, 2.4, 1.8);
  scene.add(lanternLight);

  const tableLanternLight = new THREE.PointLight(0xffaa44, 0, 6);
  tableLanternLight.position.set(4.5, 1.8, 0.5);
  scene.add(tableLanternLight);

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

  // House Interior Floor (Warm timber planks)
  const floorMat = new THREE.MeshLambertMaterial({ color: 0xc4824d });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.08, 3.6), floorMat);
  floor.position.set(0, 0.54, 0);
  floor.receiveShadow = true;
  house.add(floor);

  // Straw Mat / Sukul (सुकुल) inside room
  const rugMat = new THREE.MeshLambertMaterial({ color: 0xca8a04 });
  const rug = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 1.8), rugMat);
  rug.position.set(-1.0, 0.58, -0.6);
  house.add(rug);

  // Small Wooden Shelf inside room
  const shelfWoodMat = new THREE.MeshLambertMaterial({ color: 0x5a381e });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.4), shelfWoodMat);
  shelf.position.set(1.8, 1.2, -1.4);
  house.add(shelf);

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
  const roofMat = new THREE.MeshLambertMaterial({
    color: 0x933e24,
    transparent: true,
    opacity: 1.0,
  });
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

  // ── 7. WOODEN TOY BOX / CHEST (बाकस) ─────────────────────────
  const toyBox = new THREE.Group();
  toyBox.position.set(-2.2, 0, -0.8);

  const boxWoodMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
  const boxTrimMat = new THREE.MeshLambertMaterial({ color: 0x78350f });

  // Main hollow body (open top)
  const boxBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 1.2), boxWoodMat);
  boxBase.position.y = 0.35;
  boxBase.castShadow = true;
  boxBase.receiveShadow = true;
  toyBox.add(boxBase);

  // Openable Lid hinged at the back
  const toyBoxLid = new THREE.Group();
  toyBoxLid.position.set(0, 0.7, -0.6); // Hinge line
  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 1.25), boxTrimMat);
  lidMesh.position.set(0, 0.05, 0.6); // Offset from hinge
  lidMesh.castShadow = true;
  toyBoxLid.add(lidMesh);
  toyBox.add(toyBoxLid);

  scene.add(toyBox);

  // ── 8. NEPALI BRASS WATER VESSEL (गाग्री / पानीको भाँडो) ──────
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

  // ── 9. SCHOOL BAG (झोला) ─────────────────────────────────────
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

  // ── 10. COLOURFUL PLAY BALL (बल) ─────────────────────────────
  const ball = new THREE.Group();
  ball.position.set(0.5, 0.3, 3.2); // Default placed inside the basket

  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.3,
  });
  const ballSphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), ballMat);
  ballSphere.castShadow = true;
  ball.add(ballSphere);

  const stripeMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.03, 8, 20), stripeMat);
  ball.add(stripe);

  scene.add(ball);

  // ── 11. TEDDY BEAR (गुडिया) ──────────────────────────────────
  const teddy = new THREE.Group();
  teddy.position.set(-2.2, 0.35, -0.8); // Default inside toy box

  const bearMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
  const snoutMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // Body
  const bearBody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), bearMat);
  bearBody.scale.set(1, 1.15, 0.95);
  bearBody.position.y = 0.28;
  bearBody.castShadow = true;
  teddy.add(bearBody);

  // Head
  const bearHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), bearMat);
  bearHead.position.set(0, 0.52, 0);
  bearHead.castShadow = true;
  teddy.add(bearHead);

  // Ears
  const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), bearMat);
  leftEar.position.set(-0.16, 0.65, 0);
  teddy.add(leftEar);
  const rightEar = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), bearMat);
  rightEar.position.set(0.16, 0.65, 0);
  teddy.add(rightEar);

  // Snout
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), snoutMat);
  snout.position.set(0, 0.49, 0.16);
  teddy.add(snout);

  // Eyes & Nose
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
  leftEye.position.set(-0.07, 0.54, 0.18);
  teddy.add(leftEye);
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
  rightEye.position.set(0.07, 0.54, 0.18);
  teddy.add(rightEye);

  scene.add(teddy);

  // ── 12. TOY CAR (खेलौना गाडी) ─────────────────────────────────
  const toyCar = new THREE.Group();
  toyCar.position.set(-1.0, 0.15, 0.5); // Default on lawn outside

  const carBodyMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });

  const carBody = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.38), carBodyMat);
  carBody.position.y = 0.15;
  carBody.castShadow = true;
  toyCar.add(carBody);

  const carCabin = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.34), new THREE.MeshLambertMaterial({ color: 0x38bdf8 }));
  carCabin.position.set(-0.06, 0.32, 0);
  toyCar.add(carCabin);

  // Wheels
  [
    { x: -0.22, z: -0.2 },
    { x: 0.22, z: -0.2 },
    { x: -0.22, z: 0.2 },
    { x: 0.22, z: 0.2 },
  ].forEach((wpos) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wpos.x, 0.09, wpos.z);
    wheel.castShadow = true;
    toyCar.add(wheel);
  });

  scene.add(toyCar);

  // ── 13. LARGE BLOOMING FLOWER (for butterfly above/below) ─────
  const largeFlower = new THREE.Group();
  largeFlower.position.set(-1.5, 0, 2.2);

  // Stem
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.75, 8), stemMat);
  stem.position.y = 0.38;
  stem.castShadow = true;
  largeFlower.add(stem);

  // Leaves
  const leafGeo = new THREE.SphereGeometry(0.18, 8, 8);
  leafGeo.scale(1.4, 0.2, 0.6);
  const leftLeaf = new THREE.Mesh(leafGeo, stemMat);
  leftLeaf.position.set(-0.2, 0.28, 0);
  leftLeaf.rotation.z = -0.35;
  largeFlower.add(leftLeaf);

  const rightLeaf = new THREE.Mesh(leafGeo, stemMat);
  rightLeaf.position.set(0.2, 0.35, 0);
  rightLeaf.rotation.z = 0.35;
  largeFlower.add(rightLeaf);

  // Center head
  const flowerCenterMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
  const centerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), flowerCenterMat);
  centerMesh.position.y = 0.75;
  largeFlower.add(centerMesh);

  // Petals (8 bright golden petals)
  const petalMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), petalMat);
    petal.scale.set(1.4, 0.25, 0.7);
    petal.rotation.y = angle;
    petal.position.set(Math.cos(angle) * 0.32, 0.75, Math.sin(angle) * 0.32);
    petal.castShadow = true;
    largeFlower.add(petal);
  }

  scene.add(largeFlower);

  // ── 14. TREES & FLOWER PATCHES ───────────────────────────────
  const trees: THREE.Group[] = [];

  function createPineTree(x: number, z: number, scale = 1): THREE.Group {
    const t = new THREE.Group();
    t.position.set(x, 0, z);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a381e });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * scale, 0.34 * scale, 2.0 * scale, 8), trunkMat);
    trunk.position.y = 1.0 * scale;
    trunk.castShadow = true;
    t.add(trunk);

    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2d6b38 });
    const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.8 * scale, 2.0 * scale, 8), foliageMat);
    tier1.position.y = 2.4 * scale;
    tier1.castShadow = true;
    t.add(tier1);

    const tier2 = new THREE.Mesh(new THREE.ConeGeometry(1.4 * scale, 1.8 * scale, 8), foliageMat);
    tier2.position.y = 3.4 * scale;
    tier2.castShadow = true;
    t.add(tier2);

    const tier3 = new THREE.Mesh(new THREE.ConeGeometry(0.9 * scale, 1.5 * scale, 8), foliageMat);
    tier3.position.y = 4.3 * scale;
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

  // ── 15. DYNAMIC TARGET HIGHLIGHT GLOW RING ────────────────────
  const highlightRingGeo = new THREE.RingGeometry(0.95, 1.25, 32);
  const highlightRingMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const highlightRing = new THREE.Mesh(highlightRingGeo, highlightRingMat);
  highlightRing.rotation.x = -Math.PI / 2;
  highlightRing.position.set(0, 0.05, 0);
  highlightRing.visible = false;
  scene.add(highlightRing);

  // ── 16. ANIMATION & CONTROLS ─────────────────────────────────
  let targetDoorAngle = 0;
  let currentDoorAngle = 0;
  let targetBoxAngle = 0;
  let currentBoxAngle = -Math.PI * 0.45; // Default open for toy access

  function openDoor(open: boolean) {
    targetDoorAngle = open ? -Math.PI * 0.65 : 0;
  }

  function openToyBox(open: boolean) {
    targetBoxAngle = open ? -Math.PI * 0.55 : 0;
  }

  function setRoofCutaway(cutaway: boolean) {
    if (cutaway) {
      (mainRoof.material as THREE.MeshLambertMaterial).opacity = 0.22;
      mainRoof.material.depthWrite = false;
    } else {
      (mainRoof.material as THREE.MeshLambertMaterial).opacity = 1.0;
      mainRoof.material.depthWrite = true;
    }
  }

  function setTheme(isDark: boolean) {
    if (isDark) {
      scene.background = new THREE.Color(0x111c2e);
      if (scene.fog) scene.fog.color.setHex(0x111c2e);
      ambientLight.color.setHex(0x384a68);
      ambientLight.intensity = 0.6;
      sunLight.intensity = 0.35;
      sunLight.color.setHex(0x7dd3fc);
      lanternLight.intensity = 2.2;
      tableLanternLight.intensity = 1.8;
      groundMat.color.setHex(0x274a2f);
    } else {
      scene.background = new THREE.Color(0xbfe3ff);
      if (scene.fog) scene.fog.color.setHex(0xbfe3ff);
      ambientLight.color.setHex(0xfff6e6);
      ambientLight.intensity = 0.78;
      sunLight.intensity = 1.15;
      sunLight.color.setHex(0xfffaed);
      lanternLight.intensity = 0;
      tableLanternLight.intensity = 0;
      groundMat.color.setHex(0x5fa855);
    }
  }

  function highlightZone(zone: 'house' | 'basket' | 'box' | 'table_above' | 'table_below' | 'tree' | 'flower' | null) {
    if (!zone) {
      highlightRing.visible = false;
      return;
    }
    highlightRing.visible = true;
    if (zone === 'basket') {
      highlightRing.position.set(0.5, 0.08, 3.2);
      highlightRing.scale.set(0.85, 0.85, 0.85);
      highlightRingMat.color.setHex(0x3b82f6);
    } else if (zone === 'box') {
      highlightRing.position.set(-2.2, 0.08, -0.8);
      highlightRing.scale.set(1.1, 1.1, 1.1);
      highlightRingMat.color.setHex(0x10b981);
    } else if (zone === 'house') {
      highlightRing.position.set(-7.5, 0.08, -1.8);
      highlightRing.scale.set(2.8, 2.8, 2.8);
      highlightRingMat.color.setHex(0xf59e0b);
    } else if (zone === 'table_above') {
      highlightRing.position.set(4.5, 1.45, 0.5);
      highlightRing.scale.set(1.4, 1.4, 1.4);
      highlightRingMat.color.setHex(0xec4899);
    } else if (zone === 'table_below') {
      highlightRing.position.set(4.5, 0.08, 0.5);
      highlightRing.scale.set(1.2, 1.2, 1.2);
      highlightRingMat.color.setHex(0x8b5cf6);
    } else if (zone === 'tree') {
      highlightRing.position.set(7.5, 0.08, -3.5);
      highlightRing.scale.set(2.2, 2.2, 2.2);
      highlightRingMat.color.setHex(0x22c55e);
    } else if (zone === 'flower') {
      highlightRing.position.set(-1.5, 0.08, 2.2);
      highlightRing.scale.set(0.9, 0.9, 0.9);
      highlightRingMat.color.setHex(0xf43f5e);
    }
  }

  let timeAccum = 0;
  function update(delta: number) {
    timeAccum += delta;

    // Smooth door animation
    if (Math.abs(currentDoorAngle - targetDoorAngle) > 0.01) {
      currentDoorAngle += (targetDoorAngle - currentDoorAngle) * Math.min(1, delta * 6);
      doorGroup.rotation.y = currentDoorAngle;
    }

    // Smooth toy box lid animation
    if (Math.abs(currentBoxAngle - targetBoxAngle) > 0.01) {
      currentBoxAngle += (targetBoxAngle - currentBoxAngle) * Math.min(1, delta * 6);
      toyBoxLid.rotation.x = currentBoxAngle;
    }

    // Pulse highlight ring
    if (highlightRing.visible) {
      const pulse = 1 + Math.sin(timeAccum * 5) * 0.08;
      highlightRing.scale.multiplyScalar(pulse / (highlightRing.scale.x || 1));
    }
  }

  return {
    scene,
    house,
    roof: mainRoof,
    door: doorGroup,
    table,
    chair,
    basket,
    toyBox,
    toyBoxLid,
    waterPot,
    bag,
    ball,
    teddy,
    toyCar,
    largeFlower,
    trees,
    update,
    openDoor,
    openToyBox,
    setRoofCutaway,
    setTheme,
    highlightZone,
  };
}
