/**
 * TallShortModels.ts
 * Procedural 3D Models and Environment for Tall and Short Adventure (अग्लो र होचो साहसिक यात्रा)
 * Grade 1 Mathematics • Chapter 1: आकारप्रकार र स्थान (Shapes & Position)
 * Focus: Comparing vertical heights from a common ground plane (Y = 0).
 */
import * as THREE from 'three';

// ── COLOR PALETTES ──────────────────────────────────────────────
const PALETTE = {
  // Environment
  grassDay: 0x58d68d,
  grassNight: 0x1e3a2f,
  soil: 0x873600,
  mountainFar: 0xa3e4d7,

  // Trees & Nature
  pineGreen: 0x196f3d,
  pineGreenDark: 0x145a32,
  trunkBrown: 0x6e2c00,
  leafGreen: 0x27ae60,
  bambooGreen: 0x2ecc71,
  flowerYellow: 0xf4d03f,

  // Houses
  wallStone: 0xd5dbdb,
  wallClay: 0xd35400,
  roofTile: 0x922b21,
  woodBeam: 0x5d4037,
  windowGlass: 0xaed6f1,

  // People
  skinTone: 0xedbb99,
  dauraBlue: 0x1f618d,
  dauraRed: 0xb03a2e,
  suruwalWhite: 0xfdfefe,
  hairBlack: 0x1c2833,

  // Flag & Poles
  poleSteel: 0xd0d3d4,
  nepalFlagRed: 0xc0392b,
  nepalFlagBlue: 0x1a5276,

  // Laser Guides & Markers
  laserTall: 0x27ae60,   // Green for tall
  laserShort: 0xe67e22,  // Orange/Amber for short
  rulerLine: 0x3498db,   // Blue dashed ruler line
  groundLine: 0xf1c40f,  // Golden common ground reference

  // Mithu Character
  mithuBody: 0x27ae60,
  mithuBeak: 0xe74c3c,
  mithuBelly: 0xa9dfbf,
};

function createMat(color: number, roughness: number = 0.5): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.1 });
}

// ─────────────────────────────────────────────────────────────────
// 1. HEIGHT WORLD ENVIRONMENT & COMMON GROUND STUDIO
// ─────────────────────────────────────────────────────────────────
export interface HeightStudio {
  scene: THREE.Scene;
  groundPlane: THREE.Mesh;
  mithu: THREE.Group;
  podiumLeft: THREE.Group;
  podiumRight: THREE.Group;
  podiumCenter: THREE.Group;
  slot1: THREE.Group;
  slot2: THREE.Group;
  slot3: THREE.Group;
  heightGuideLines: THREE.Group;
  setTheme: (isDark: boolean) => void;
  update: (delta: number) => void;
  showHeightGuides: (itemAHeight: number, itemBHeight: number, xA?: number, xB?: number) => void;
  clearHeightGuides: () => void;
}

export function createHeightStudio(scene: THREE.Scene): HeightStudio {
  // ── LIGHTS ───────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.82);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfffaed, 1.25);
  mainLight.position.set(12, 24, 15);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 60;
  const d = 16;
  mainLight.shadow.camera.left = -d;
  mainLight.shadow.camera.right = d;
  mainLight.shadow.camera.top = d;
  mainLight.shadow.camera.bottom = -d;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xaed6f1, 0.4);
  fillLight.position.set(-14, 14, -10);
  scene.add(fillLight);

  // ── COMMON FLAT GROUND PLANE (Y = 0) ─────────────────────────
  // Ground disc where all items rest with their bottoms at Y = 0
  const groundGeo = new THREE.CylinderGeometry(15, 15.5, 0.5, 64);
  const groundMat = new THREE.MeshStandardMaterial({ color: PALETTE.grassDay, roughness: 0.8 });
  const groundPlane = new THREE.Mesh(groundGeo, groundMat);
  groundPlane.position.y = -0.25;
  groundPlane.receiveShadow = true;
  scene.add(groundPlane);

  // Golden Baseline Datum Line on Ground Plane
  const baselineGeo = new THREE.BoxGeometry(12, 0.05, 0.25);
  const baselineMat = new THREE.MeshBasicMaterial({ color: PALETTE.groundLine });
  const baseline = new THREE.Mesh(baselineGeo, baselineMat);
  baseline.position.set(0, 0.02, 0);
  scene.add(baseline);

  // Distant Himalayan Peaks
  for (let i = 0; i < 5; i++) {
    const r = 5 + (i % 3) * 1.5;
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(r, 9 + i * 1.2, 32),
      createMat(PALETTE.mountainFar, 0.9)
    );
    const angle = (Math.PI / 4) * (i - 2);
    cone.position.set(Math.sin(angle) * 22, 3, Math.cos(angle) * -22);
    scene.add(cone);
  }

  // ── PODIUMS / GROUND MARKERS ─────────────────────────────────
  function buildGroundPodium(x: number, label: string, colorHex: number): THREE.Group {
    const pod = new THREE.Group();
    pod.position.set(x, 0, 0);

    // Flat circular ground base (flush with ground at Y = 0)
    const discGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.06, 32);
    const discMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = 0.03;
    disc.receiveShadow = true;
    pod.add(disc);

    // Glowing boundary ring
    const ringGeo = new THREE.RingGeometry(1.25, 1.38, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.065;
    pod.add(ring);

    return pod;
  }

  const podiumLeft = buildGroundPodium(-2.8, 'A', 0x2e86c1);
  const podiumRight = buildGroundPodium(2.8, 'B', 0x27ae60);
  const podiumCenter = buildGroundPodium(0, 'C', 0x8e44ad);
  podiumCenter.visible = false;
  scene.add(podiumLeft);
  scene.add(podiumRight);
  scene.add(podiumCenter);

  // 3 Slots for Mode 3 Ordering
  const slot1 = buildGroundPodium(-3.6, '1', 0xd35400); // Shortest
  const slot2 = buildGroundPodium(0, '2', 0x16a085);    // Medium
  const slot3 = buildGroundPodium(3.6, '3', 0x2980b9);   // Tallest
  slot1.visible = false;
  slot2.visible = false;
  slot3.visible = false;
  scene.add(slot1);
  scene.add(slot2);
  scene.add(slot3);

  // ── HEIGHT GUIDE VISUALIZER GROUP ────────────────────────────
  const heightGuideLines = new THREE.Group();
  scene.add(heightGuideLines);

  function showHeightGuides(itemAHeight: number, itemBHeight: number, xA: number = -2.8, xB: number = 2.8) {
    clearHeightGuides();

    // 1. Vertical laser line for Object A
    const laserAGeo = new THREE.CylinderGeometry(0.04, 0.04, itemAHeight, 8);
    laserAGeo.translate(0, itemAHeight / 2, 0);
    const isATaller = itemAHeight >= itemBHeight;
    const laserAMat = new THREE.MeshBasicMaterial({ color: isATaller ? PALETTE.laserTall : PALETTE.laserShort });
    const laserA = new THREE.Mesh(laserAGeo, laserAMat);
    laserA.position.set(xA - 1.2, 0, 0);
    heightGuideLines.add(laserA);

    // Peak marker cap A
    const capAGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const capA = new THREE.Mesh(capAGeo, laserAMat);
    capA.position.set(xA - 1.2, itemAHeight, 0);
    heightGuideLines.add(capA);

    // 2. Vertical laser line for Object B
    const laserBGeo = new THREE.CylinderGeometry(0.04, 0.04, itemBHeight, 8);
    laserBGeo.translate(0, itemBHeight / 2, 0);
    const isBTaller = itemBHeight >= itemAHeight;
    const laserBMat = new THREE.MeshBasicMaterial({ color: isBTaller ? PALETTE.laserTall : PALETTE.laserShort });
    const laserB = new THREE.Mesh(laserBGeo, laserBMat);
    laserB.position.set(xB + 1.2, 0, 0);
    heightGuideLines.add(laserB);

    // Peak marker cap B
    const capBGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const capB = new THREE.Mesh(capBGeo, laserBMat);
    capB.position.set(xB + 1.2, itemBHeight, 0);
    heightGuideLines.add(capB);

    // 3. Horizontal peak comparison line across both peaks
    const span = Math.abs(xB - xA) + 2.4;
    const midX = (xA + xB) / 2;

    // Line from A peak to B position
    const hLineAGeo = new THREE.CylinderGeometry(0.025, 0.025, span, 8);
    hLineAGeo.rotateZ(Math.PI / 2);
    const hLineA = new THREE.Mesh(hLineAGeo, new THREE.MeshBasicMaterial({ color: laserAMat.color }));
    hLineA.position.set(midX, itemAHeight, 0);
    heightGuideLines.add(hLineA);

    const hLineBGeo = new THREE.CylinderGeometry(0.025, 0.025, span, 8);
    hLineBGeo.rotateZ(Math.PI / 2);
    const hLineB = new THREE.Mesh(hLineBGeo, new THREE.MeshBasicMaterial({ color: laserBMat.color }));
    hLineB.position.set(midX, itemBHeight, 0);
    heightGuideLines.add(hLineB);
  }

  function clearHeightGuides() {
    while (heightGuideLines.children.length > 0) {
      heightGuideLines.remove(heightGuideLines.children[0]);
    }
  }

  // ── MITHU GUIDE CHARACTER ─────────────────────────────────────
  const mithu = createMithuHeightGuide();
  mithu.position.set(-5.6, 1.4, 1.5);
  scene.add(mithu);

  // ── UPDATE & THEME ───────────────────────────────────────────
  let time = 0;
  function update(delta: number) {
    time += delta;
    mithu.position.y = 1.4 + Math.sin(time * 2.2) * 0.12;
    mithu.rotation.y = Math.sin(time * 1.5) * 0.15 + 0.3;

    // Wing flap
    const leftWing = mithu.getObjectByName('leftWing');
    const rightWing = mithu.getObjectByName('rightWing');
    if (leftWing) leftWing.rotation.z = Math.sin(time * 5.0) * 0.25 - 0.4;
    if (rightWing) rightWing.rotation.z = -Math.sin(time * 5.0) * 0.25 + 0.4;
  }

  function setTheme(isDark: boolean) {
    if (isDark) {
      scene.background = new THREE.Color(0x202b38);
      scene.fog = new THREE.FogExp2(0x202b38, 0.02);
      groundMat.color.setHex(PALETTE.grassNight);
      ambientLight.color.setHex(0x85929e);
      ambientLight.intensity = 0.65;
      mainLight.color.setHex(0xd6eaf8);
      mainLight.intensity = 0.9;
    } else {
      scene.background = new THREE.Color(0xf5f7f2);
      scene.fog = new THREE.FogExp2(0xf5f7f2, 0.015);
      groundMat.color.setHex(PALETTE.grassDay);
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 0.85;
      mainLight.color.setHex(0xfffaed);
      mainLight.intensity = 1.25;
    }
  }

  return {
    scene,
    groundPlane,
    mithu,
    podiumLeft,
    podiumRight,
    podiumCenter,
    slot1,
    slot2,
    slot3,
    heightGuideLines,
    setTheme,
    update,
    showHeightGuides,
    clearHeightGuides,
  };
}

// ─────────────────────────────────────────────────────────────────
// 2. MITHU GUIDE CHARACTER (Points up for Tall, down for Short)
// ─────────────────────────────────────────────────────────────────
function createMithuHeightGuide(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'MithuHeightGuide';

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 24, 24),
    createMat(PALETTE.mithuBody, 0.4)
  );
  body.scale.set(0.85, 1.15, 0.85);
  body.castShadow = true;
  g.add(body);

  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 20, 20),
    createMat(PALETTE.mithuBelly, 0.5)
  );
  belly.scale.set(0.7, 0.9, 0.4);
  belly.position.set(0, -0.05, 0.38);
  g.add(belly);

  // Eyes
  [-0.18, 0.18].forEach((x) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eyeWhite.position.set(x, 0.22, 0.36);
    g.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 14), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    pupil.position.set(x, 0.22, 0.49);
    g.add(pupil);
  });

  // Beak
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 16), createMat(PALETTE.mithuBeak, 0.3));
  beak.rotation.x = Math.PI / 2.3;
  beak.position.set(0, 0.08, 0.54);
  g.add(beak);

  // Wings
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.3), createMat(0x1e8449, 0.4));
  leftWing.name = 'leftWing';
  leftWing.position.set(-0.52, 0.05, 0);
  g.add(leftWing);

  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.3), createMat(0x1e8449, 0.4));
  rightWing.name = 'rightWing';
  rightWing.position.set(0.52, 0.05, 0);
  g.add(rightWing);

  g.scale.set(0.9, 0.9, 0.9);
  return g;
}

// ─────────────────────────────────────────────────────────────────
// 3. TREE MODELS WITH ACCURATE VERTICAL HEIGHT
// ─────────────────────────────────────────────────────────────────

// TALL PINE TREE (अग्लो सल्लाको रूख) - Height: 4.8m
export function createTallPineTreeModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'TallPineTree';
  g.userData.height = 4.8;

  // Trunk from Y=0 to Y=2.2
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.24, 2.2, 12),
    createMat(PALETTE.trunkBrown, 0.7)
  );
  trunk.position.set(0, 1.1, 0);
  trunk.castShadow = true;
  g.add(trunk);

  // 3 Tiers of Conical Foliage reaching up to Y=4.8
  const tiers = [
    { r: 1.4, h: 1.6, y: 2.0 },
    { r: 1.1, h: 1.5, y: 2.8 },
    { r: 0.8, h: 1.4, y: 3.6 },
  ];
  tiers.forEach((t) => {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(t.r, t.h, 16),
      createMat(PALETTE.pineGreen, 0.6)
    );
    cone.position.set(0, t.y + t.h / 2, 0);
    cone.castShadow = true;
    g.add(cone);
  });

  return g;
}

// SHORT FRUIT TREE (होचो फलको रूख) - Height: 2.5m
export function createShortFruitTreeModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ShortFruitTree';
  g.userData.height = 2.5;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 1.2, 12),
    createMat(PALETTE.trunkBrown, 0.7)
  );
  trunk.position.set(0, 0.6, 0);
  trunk.castShadow = true;
  g.add(trunk);

  // Round bushy canopy peaking at Y=2.5
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 20, 20),
    createMat(PALETTE.leafGreen, 0.5)
  );
  canopy.position.set(0, 1.5, 0);
  canopy.castShadow = true;
  g.add(canopy);

  // Red fruit dots
  for (let i = 0; i < 6; i++) {
    const fruit = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      createMat(0xe74c3c, 0.3)
    );
    const angle = (i * Math.PI) / 3;
    fruit.position.set(Math.sin(angle) * 0.9, 1.5 + (i % 2) * 0.3, Math.cos(angle) * 0.9);
    g.add(fruit);
  }

  return g;
}

// SHORT BUSH / FLOWER PLANT (होचो फूलको बोट) - Height: 1.3m
export function createShortBushModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ShortBush';
  g.userData.height = 1.3;

  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 16, 16),
    createMat(PALETTE.leafGreen, 0.6)
  );
  bush.position.set(0, 0.65, 0);
  bush.castShadow = true;
  g.add(bush);

  // Yellow Marigold Flowers on top
  for (let i = 0; i < 5; i++) {
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      createMat(PALETTE.flowerYellow, 0.3)
    );
    const angle = (i * Math.PI * 2) / 5;
    flower.position.set(Math.sin(angle) * 0.45, 1.15, Math.cos(angle) * 0.45);
    g.add(flower);
  }

  return g;
}

// ─────────────────────────────────────────────────────────────────
// 4. VILLAGE HOUSES WITH ACCURATE VERTICAL HEIGHT
// ─────────────────────────────────────────────────────────────────

// TALL TWO-STOREY HOUSE (अग्लो दुईतले घर) - Height: 4.6m (Narrow width: 2.2m)
export function createTallTwoStoreyHouseModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'TallTwoStoreyHouse';
  g.userData.height = 4.6;

  // Ground Floor + First Floor Walls reaching Y=3.4
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 3.4, 2.2),
    createMat(PALETTE.wallStone, 0.6)
  );
  walls.position.set(0, 1.7, 0);
  walls.castShadow = true;
  g.add(walls);

  // Pitched Roof peaking at Y=4.6
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 1.2, 4),
    createMat(PALETTE.roofTile, 0.5)
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 4.0, 0);
  roof.castShadow = true;
  g.add(roof);

  // Windows & Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.05), createMat(PALETTE.woodBeam));
  door.position.set(0, 0.55, 1.12);
  g.add(door);

  const window1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.05), createMat(PALETTE.windowGlass));
  window1.position.set(0, 2.4, 1.12);
  g.add(window1);

  return g;
}

// SHORT SINGLE-STOREY COTTAGE (होचो एकतले घर) - Height: 2.4m
export function createShortOneStoreyHouseModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ShortOneStoreyHouse';
  g.userData.height = 2.4;

  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.6, 2.0),
    createMat(PALETTE.wallClay, 0.6)
  );
  walls.position.set(0, 0.8, 0);
  walls.castShadow = true;
  g.add(walls);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.9, 0.8, 4),
    createMat(PALETTE.roofTile, 0.5)
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 2.0, 0);
  roof.castShadow = true;
  g.add(roof);

  return g;
}

// WIDE BUT SHORT VILLAGE SHED/HUT (चौडा तर होचो घर) - Height: 2.0m, Width: 4.2m!
// Crucial pedagogical model: Wide overall size, yet physically SHORT!
export function createWideShortHutModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'WideShortHut';
  g.userData.height = 2.0;

  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 1.3, 2.2),
    createMat(PALETTE.wallClay, 0.7)
  );
  walls.position.set(0, 0.65, 0);
  walls.castShadow = true;
  g.add(walls);

  // Broad low roof peaking at Y=2.0
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.7, 2.5),
    createMat(0x78281f, 0.5)
  );
  roof.position.set(0, 1.65, 0);
  roof.castShadow = true;
  g.add(roof);

  return g;
}

// ─────────────────────────────────────────────────────────────────
// 5. HUMAN CHARACTERS WITH ACCURATE VERTICAL HEIGHT
// ─────────────────────────────────────────────────────────────────

// TALL ADULT FATHER / TEACHER (अग्लो बुबा) - Height: 3.2m
export function createTallAdultModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'TallAdult';
  g.userData.height = 3.2;

  const skin = createMat(PALETTE.skinTone, 0.4);
  const tunic = createMat(PALETTE.dauraBlue, 0.5);
  const pants = createMat(PALETTE.suruwalWhite, 0.6);
  const hair = createMat(PALETTE.hairBlack, 0.3);

  // Legs from Y=0 to Y=1.4
  [-0.2, 0.2].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.4, 8), pants);
    leg.position.set(x, 0.7, 0);
    g.add(leg);
  });

  // Torso from Y=1.4 to Y=2.5
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.45), tunic);
  torso.position.set(0, 1.95, 0);
  torso.castShadow = true;
  g.add(torso);

  // Head from Y=2.5 to Y=3.2 (with Nepali Dhaka Topi)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), skin);
  head.position.set(0, 2.75, 0);
  g.add(head);

  // Traditional Nepali Dhaka Topi peaking at Y=3.2
  const topi = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.3, 16), createMat(0x922b21, 0.5));
  topi.position.set(0, 3.05, 0);
  g.add(topi);

  return g;
}

// SHORT CHILD (होचो बाबु / नानी) - Height: 1.6m
export function createShortChildModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ShortChild';
  g.userData.height = 1.6;

  const skin = createMat(PALETTE.skinTone, 0.4);
  const shirt = createMat(0x27ae60, 0.5);
  const shorts = createMat(0x1f618d, 0.6);

  // Legs from Y=0 to Y=0.7
  [-0.14, 0.14].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.7, 8), shorts);
    leg.position.set(x, 0.35, 0);
    g.add(leg);
  });

  // Torso from Y=0.7 to Y=1.2
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.3), shirt);
  torso.position.set(0, 0.95, 0);
  torso.castShadow = true;
  g.add(torso);

  // Head from Y=1.2 to Y=1.6
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), skin);
  head.position.set(0, 1.38, 0);
  g.add(head);

  return g;
}

// ─────────────────────────────────────────────────────────────────
// 6. FLAGPOLES WITH ACCURATE VERTICAL HEIGHT & NEPAL FLAG
// ─────────────────────────────────────────────────────────────────

// FLAGPOLE BUILDER
export function createFlagpoleModel(poleHeight: number): THREE.Group {
  const g = new THREE.Group();
  g.name = `Flagpole_${poleHeight}`;
  g.userData.height = poleHeight;

  // Thin Steel Pole from Y=0 to Y=poleHeight
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, poleHeight, 16),
    createMat(PALETTE.poleSteel, 0.2)
  );
  pole.position.set(0, poleHeight / 2, 0);
  pole.castShadow = true;
  g.add(pole);

  // Golden finial ball at top
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    createMat(0xf1c40f, 0.1)
  );
  ball.position.set(0, poleHeight, 0);
  g.add(ball);

  // Double-Pennant Flag of Nepal
  const flagGroup = new THREE.Group();
  flagGroup.position.set(0.06, poleHeight - 0.9, 0);

  // Top Triangle
  const shape1 = new THREE.Shape();
  shape1.moveTo(0, 0.85);
  shape1.lineTo(0.9, 0.42);
  shape1.lineTo(0, 0.42);
  shape1.closePath();
  const flag1 = new THREE.Mesh(new THREE.ShapeGeometry(shape1), createMat(PALETTE.nepalFlagRed, 0.3));
  flagGroup.add(flag1);

  // Bottom Triangle
  const shape2 = new THREE.Shape();
  shape2.moveTo(0, 0.42);
  shape2.lineTo(0.9, -0.05);
  shape2.lineTo(0, -0.05);
  shape2.closePath();
  const flag2 = new THREE.Mesh(new THREE.ShapeGeometry(shape2), createMat(PALETTE.nepalFlagRed, 0.3));
  flagGroup.add(flag2);

  g.add(flagGroup);
  return g;
}

// ─────────────────────────────────────────────────────────────────
// 7. MASTER OBJECT GENERATOR FACTORY
// ─────────────────────────────────────────────────────────────────
export function createTallShortObject(id: string, customHeight?: number): THREE.Group {
  let model: THREE.Group;

  switch (id) {
    // Trees
    case 'tree_pine_tall':
      model = createTallPineTreeModel();
      break;
    case 'tree_fruit_short':
      model = createShortFruitTreeModel();
      break;
    case 'plant_bush_short':
      model = createShortBushModel();
      break;

    // Houses
    case 'house_tall_2storey':
      model = createTallTwoStoreyHouseModel();
      break;
    case 'house_short_1storey':
      model = createShortOneStoreyHouseModel();
      break;
    case 'house_wide_short_hut':
      model = createWideShortHutModel();
      break;

    // People
    case 'person_tall_adult':
      model = createTallAdultModel();
      break;
    case 'person_short_child':
      model = createShortChildModel();
      break;

    // Flagpoles
    case 'flagpole_tall':
      model = createFlagpoleModel(customHeight || 4.8);
      break;
    case 'flagpole_medium':
      model = createFlagpoleModel(customHeight || 3.4);
      break;
    case 'flagpole_short':
      model = createFlagpoleModel(customHeight || 2.0);
      break;

    default:
      model = createTallPineTreeModel();
      break;
  }

  model.userData.objectId = id;
  model.userData.isSelectable = true;
  return model;
}

