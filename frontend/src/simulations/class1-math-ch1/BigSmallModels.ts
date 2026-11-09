/**
 * BigSmallModels.ts
 * Procedural 3D Models and Environment for Big and Small World (ठूलो र सानो संसार)
 * Grade 1 Mathematics • Chapter 1: आकारप्रकार र स्थान
 * Features: Animals, Fruits & Veggies, Traditional Nepali Objects, Toys, Mithu Guide, and Comparison Podiums.
 */
import * as THREE from 'three';

// ── COLOR PALETTES ──────────────────────────────────────────────
const PALETTE = {
  // Animals
  elephantGrey: 0x808b96,
  elephantEar: 0x95a5a6,
  tusks: 0xfef9e7,
  cowWhite: 0xfdfefe,
  cowBlack: 0x1b2631,
  cowNose: 0xfadbd8,
  goatBrown: 0xb9770e,
  goatHorns: 0x5d6d7e,
  dogGolden: 0xd4ac0d,
  catOrange: 0xe67e22,
  rabbitWhite: 0xfcfcfc,
  rabbitInnerEar: 0xf9e79f,
  mouseGrey: 0x7f8c8d,
  birdBlue: 0x2980b9,
  birdYellow: 0xf1c40f,

  // Fruits
  watermelonGreen: 0x196f3d,
  watermelonStripe: 0x114b28,
  pumpkinOrange: 0xd35400,
  pumpkinStem: 0x27ae60,
  cabbageGreen: 0x2ecc71,
  appleRed: 0xc0392b,
  orangeColor: 0xe67e22,
  bananaYellow: 0xf4d03f,
  grapesPurple: 0x6c3483,
  strawberryRed: 0xe74c3c,

  // Traditional Objects
  clayTerracotta: 0xb03a2e,
  clayDark: 0x78281f,
  bambooLight: 0xd4ac0d,
  bambooDark: 0x9a7d0a,
  brassGold: 0xd4af37,
  bronzePlate: 0xb7950b,
  woodenTheki: 0x6e2c00,

  // Toys
  basketballOrange: 0xd35400,
  tennisGreen: 0x82e0aa,
  teddyBrown: 0x873600,
  teddySnout: 0xedbb99,
  carRed: 0x922b21,
  carBlue: 0x1f618d,
  blockBlue: 0x2471a3,
  blockYellow: 0xf39c12,

  // Mithu Character
  mithuBody: 0x27ae60, // Himalayan green parrot
  mithuBeak: 0xe74c3c,
  mithuBelly: 0xa9dfbf,
  mithuTail: 0x1abc9c,

  // Podiums & Environment
  podiumWood: 0x4a235a,
  podiumLight: 0xebf5fb,
  podiumHighlight: 0xf1c40f,
  grassGreen: 0x52be80,
  grassDark: 0x145a32,
  skyBlue: 0xd4efdf,
};

// ── UTILITY: CREATE MATERIAL WITH CLEAN SHADING ─────────────────
function createMat(color: number, roughness: number = 0.5): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.1,
  });
}

// ─────────────────────────────────────────────────────────────────
// 1. COMPARISON STUDIO PODIUMS & ENVIRONMENT
// ─────────────────────────────────────────────────────────────────
export interface ComparisonStudio {
  scene: THREE.Scene;
  podiumLeft: THREE.Group;
  podiumRight: THREE.Group;
  podiumCenter: THREE.Group;
  slot1: THREE.Group;
  slot2: THREE.Group;
  slot3: THREE.Group;
  mithu: THREE.Group;
  setTheme: (isDark: boolean) => void;
  update: (delta: number) => void;
}

export function createComparisonStudio(scene: THREE.Scene): ComparisonStudio {
  // ── LIGHTS ───────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.82);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfffaed, 1.25);
  mainLight.position.set(12, 22, 14);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 50;
  const d = 14;
  mainLight.shadow.camera.left = -d;
  mainLight.shadow.camera.right = d;
  mainLight.shadow.camera.top = d;
  mainLight.shadow.camera.bottom = -d;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xaed6f1, 0.4);
  fillLight.position.set(-14, 12, -10);
  scene.add(fillLight);

  // ── GROUND / MEADOW PLATFORM ──────────────────────────────────
  const groundGroup = new THREE.Group();
  scene.add(groundGroup);

  // Large rounded meadow circular disc
  const groundGeo = new THREE.CylinderGeometry(14, 14.5, 0.6, 64);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x78c99a,
    roughness: 0.8,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.3;
  ground.receiveShadow = true;
  groundGroup.add(ground);

  // Wooden outer boundary ring
  const ringGeo = new THREE.TorusGeometry(14.2, 0.35, 16, 64);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.6 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.05;
  groundGroup.add(ring);

  // Soft backdrop hills/mountains
  for (let i = 0; i < 5; i++) {
    const hillR = 4 + (i % 3) * 1.5;
    const hillGeo = new THREE.ConeGeometry(hillR, 7 + i, 32);
    const hillMat = new THREE.MeshStandardMaterial({ color: 0xa3e4d7, roughness: 0.9 });
    const hill = new THREE.Mesh(hillGeo, hillMat);
    const angle = (Math.PI / 4) * (i - 2);
    hill.position.set(Math.sin(angle) * 18, 1.5, Math.cos(angle) * -18);
    groundGroup.add(hill);
  }

  // ── PODIUM BUILDER HELPER ─────────────────────────────────────
  function buildPodium(x: number, z: number, labelText: string, colorHex: number): THREE.Group {
    const pod = new THREE.Group();
    pod.position.set(x, 0, z);

    // Stepped pedestal base
    const baseGeo = new THREE.CylinderGeometry(1.5, 1.7, 0.45, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.225;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    pod.add(baseMesh);

    // Marble top ring
    const topGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.1, 32);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0.5;
    topMesh.receiveShadow = true;
    pod.add(topMesh);

    // Golden indicator ring on top
    const ringGeo = new THREE.RingGeometry(1.2, 1.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f, side: THREE.DoubleSide });
    const indicatorRing = new THREE.Mesh(ringGeo, ringMat);
    indicatorRing.rotation.x = -Math.PI / 2;
    indicatorRing.position.y = 0.56;
    pod.add(indicatorRing);

    return pod;
  }

  // Two Main Comparison Podiums (A on Left, B on Right)
  const podiumLeft = buildPodium(-2.6, 0, 'A', 0x2e86c1); // Blue base
  const podiumRight = buildPodium(2.6, 0, 'B', 0x27ae60); // Green base
  const podiumCenter = buildPodium(0, 0, 'C', 0x8e44ad); // Purple center (hidden by default)
  podiumCenter.visible = false;
  scene.add(podiumLeft);
  scene.add(podiumRight);
  scene.add(podiumCenter);

  // Three Ordering Slots for Mode 3 (Arranging by Size)
  const slot1 = buildPodium(-3.6, 0, '1', 0xd35400); // Slot 1: Smallest
  const slot2 = buildPodium(0, 0, '2', 0x16a085);    // Slot 2: Medium
  const slot3 = buildPodium(3.6, 0, '3', 0x2980b9);   // Slot 3: Biggest
  slot1.visible = false;
  slot2.visible = false;
  slot3.visible = false;
  scene.add(slot1);
  scene.add(slot2);
  scene.add(slot3);

  // ── MITHU GUIDE CHARACTER ─────────────────────────────────────
  const mithu = createMithuGuide();
  mithu.position.set(-5.6, 1.2, 1.5);
  scene.add(mithu);

  // ── UPDATE & THEME CONTROLS ───────────────────────────────────
  let time = 0;
  function update(delta: number) {
    time += delta;
    // Mithu idle float and subtle wing flutter
    mithu.position.y = 1.2 + Math.sin(time * 2.2) * 0.12;
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
      groundMat.color.setHex(0x2e4053);
      ambientLight.color.setHex(0x85929e);
      ambientLight.intensity = 0.65;
      mainLight.color.setHex(0xd6eaf8);
      mainLight.intensity = 0.9;
    } else {
      scene.background = new THREE.Color(0xf5f7f2);
      scene.fog = new THREE.FogExp2(0xf5f7f2, 0.015);
      groundMat.color.setHex(0x78c99a);
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 0.85;
      mainLight.color.setHex(0xfffaed);
      mainLight.intensity = 1.25;
    }
  }

  return {
    scene,
    podiumLeft,
    podiumRight,
    podiumCenter,
    slot1,
    slot2,
    slot3,
    mithu,
    setTheme,
    update,
  };
}

// ─────────────────────────────────────────────────────────────────
// 2. MITHU GUIDE CHARACTER (Himalayan Parrot Friend)
// ─────────────────────────────────────────────────────────────────
function createMithuGuide(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'MithuGuide';

  // Body
  const bodyGeo = new THREE.SphereGeometry(0.55, 24, 24);
  bodyGeo.scale(0.85, 1.15, 0.85);
  const bodyMat = createMat(PALETTE.mithuBody, 0.4);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  g.add(body);

  // Cute belly patch
  const bellyGeo = new THREE.SphereGeometry(0.42, 20, 20);
  bellyGeo.scale(0.7, 0.9, 0.4);
  const bellyMat = createMat(PALETTE.mithuBelly, 0.5);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.position.set(0, -0.05, 0.38);
  g.add(belly);

  // Big expressive eyes
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

  [-0.18, 0.18].forEach((x) => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), eyeWhiteMat);
    eyeWhite.position.set(x, 0.22, 0.36);
    g.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 14), pupilMat);
    pupil.position.set(x, 0.22, 0.49);
    g.add(pupil);

    // Eye catchlight sparkle
    const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeWhiteMat);
    sparkle.position.set(x + 0.03, 0.25, 0.55);
    g.add(sparkle);
  });

  // Curved cheerful beak
  const beakGeo = new THREE.ConeGeometry(0.12, 0.32, 16);
  const beakMat = createMat(PALETTE.mithuBeak, 0.3);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.rotation.x = Math.PI / 2.3;
  beak.position.set(0, 0.08, 0.54);
  g.add(beak);

  // Wings (animated)
  const wingGeo = new THREE.BoxGeometry(0.1, 0.5, 0.3);
  const wingMat = createMat(0x1e8449, 0.4);

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.name = 'leftWing';
  leftWing.position.set(-0.52, 0.05, 0);
  g.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.name = 'rightWing';
  rightWing.position.set(0.52, 0.05, 0);
  g.add(rightWing);

  // Feather Tail
  const tailGeo = new THREE.CylinderGeometry(0.04, 0.18, 0.7, 8);
  const tailMat = createMat(PALETTE.mithuTail, 0.4);
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.rotation.x = -Math.PI / 3;
  tail.position.set(0, -0.4, -0.45);
  g.add(tail);

  // Tiny top crest feathers
  const crestGeo = new THREE.ConeGeometry(0.06, 0.25, 8);
  const crest = new THREE.Mesh(crestGeo, createMat(0xf1c40f, 0.3));
  crest.position.set(0, 0.65, 0);
  crest.rotation.x = -0.2;
  g.add(crest);

  g.scale.set(0.9, 0.9, 0.9);
  return g;
}

// ─────────────────────────────────────────────────────────────────
// 3. ANIMAL 3D PROCEDURAL MODELS
// ─────────────────────────────────────────────────────────────────

// ELEPHANT (हात्ती) - Natural large body
export function createElephantModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Elephant';
  const grey = createMat(PALETTE.elephantGrey, 0.6);
  const earMat = createMat(PALETTE.elephantEar, 0.7);
  const tuskMat = createMat(PALETTE.tusks, 0.3);

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 2.2), grey);
  body.position.set(0, 1.4, 0);
  body.castShadow = true;
  g.add(body);

  // 4 Big Pillar Legs
  const legGeo = new THREE.CylinderGeometry(0.24, 0.28, 1.0, 16);
  [
    [-0.55, 0.5, 0.75],
    [0.55, 0.5, 0.75],
    [-0.55, 0.5, -0.75],
    [0.55, 0.5, -0.75],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, grey);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    g.add(leg);
  });

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.95), grey);
  head.position.set(0, 1.85, 1.35);
  head.castShadow = true;
  g.add(head);

  // Big Flapping Ears
  const earGeo = new THREE.BoxGeometry(0.1, 0.9, 0.7);
  const leftEar = new THREE.Mesh(earGeo, earMat);
  leftEar.position.set(-0.62, 1.85, 1.25);
  leftEar.rotation.y = -0.2;
  g.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, earMat);
  rightEar.position.set(0.62, 1.85, 1.25);
  rightEar.rotation.y = 0.2;
  g.add(rightEar);

  // Curved Trunk (सूँढ)
  const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.6, 12), grey);
  trunk1.position.set(0, 1.45, 1.85);
  trunk1.rotation.x = 0.3;
  g.add(trunk1);

  const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.55, 12), grey);
  trunk2.position.set(0, 1.05, 2.05);
  trunk2.rotation.x = -0.35;
  g.add(trunk2);

  // Ivory Tusks
  [-0.24, 0.24].forEach((x) => {
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 8), tuskMat);
    tusk.rotation.x = Math.PI / 2.6;
    tusk.position.set(x, 1.42, 1.88);
    g.add(tusk);
  });

  return g;
}

// MOUSE (मुसो) - Tiny body, big round ears, thin tail
export function createMouseModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Mouse';
  const grey = createMat(PALETTE.mouseGrey, 0.5);
  const pink = createMat(0xf5b7b1, 0.4);

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), grey);
  body.scale.set(0.8, 0.7, 1.2);
  body.position.set(0, 0.2, 0);
  body.castShadow = true;
  g.add(body);

  // Head with pointy nose
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 16), grey);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 0.2, 0.32);
  g.add(head);

  // Pink nose dot
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), pink);
  nose.position.set(0, 0.2, 0.5);
  g.add(nose);

  // Round ears
  [-0.14, 0.14].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), pink);
    ear.rotation.x = Math.PI / 2.5;
    ear.position.set(x, 0.34, 0.25);
    g.add(ear);
  });

  // Long thin tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.6, 8), pink);
  tail.rotation.x = -Math.PI / 3;
  tail.position.set(0, 0.15, -0.4);
  g.add(tail);

  return g;
}

// COW (गाई) - Spotted friendly cow
export function createCowModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Cow';
  const white = createMat(PALETTE.cowWhite, 0.5);
  const black = createMat(PALETTE.cowBlack, 0.5);
  const hornMat = createMat(0x7f8c8d, 0.3);

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, 1.7), white);
  body.position.set(0, 1.05, 0);
  body.castShadow = true;
  g.add(body);

  // Spots
  const spot1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.5), black);
  spot1.position.set(0.45, 1.2, 0.3);
  g.add(spot1);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.75, 12);
  [
    [-0.4, 0.38, 0.6],
    [0.4, 0.38, 0.6],
    [-0.4, 0.38, -0.6],
    [0.4, 0.38, -0.6],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, white);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    g.add(leg);
  });

  // Head & Muzzle
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.7), white);
  head.position.set(0, 1.35, 0.95);
  g.add(head);

  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.35), createMat(PALETTE.cowNose));
  muzzle.position.set(0, 1.22, 1.35);
  g.add(muzzle);

  // Horns
  [-0.24, 0.24].forEach((x) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 8), hornMat);
    horn.position.set(x, 1.75, 0.9);
    horn.rotation.z = x > 0 ? -0.3 : 0.3;
    g.add(horn);
  });

  return g;
}

// GOAT (बाख्रा) - Agile Nepali mountain goat
export function createGoatModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Goat';
  const brown = createMat(PALETTE.goatBrown, 0.6);
  const hornMat = createMat(PALETTE.goatHorns, 0.4);

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 1.1), brown);
  body.position.set(0, 0.75, 0);
  body.castShadow = true;
  g.add(body);

  // 4 Legs
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8);
  [
    [-0.25, 0.28, 0.4],
    [0.25, 0.28, 0.4],
    [-0.25, 0.28, -0.4],
    [0.25, 0.28, -0.4],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, brown);
    leg.position.set(x, y, z);
    g.add(leg);
  });

  // Head with curved horns
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.5), brown);
  head.position.set(0, 1.05, 0.65);
  g.add(head);

  [-0.14, 0.14].forEach((x) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 8), hornMat);
    horn.position.set(x, 1.32, 0.58);
    horn.rotation.x = -0.4;
    g.add(horn);
  });

  return g;
}

// DOG (कुकुर)
export function createDogModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Dog';
  const golden = createMat(PALETTE.dogGolden, 0.5);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.95), golden);
  body.position.set(0, 0.55, 0);
  body.castShadow = true;
  g.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.42, 0.45), golden);
  head.position.set(0, 0.82, 0.52);
  g.add(head);

  // Snout
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.32), golden);
  snout.position.set(0, 0.75, 0.78);
  g.add(snout);

  // Floppy ears
  [-0.24, 0.24].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.18), createMat(0xa04000));
    ear.position.set(x, 0.8, 0.48);
    g.add(ear);
  });

  return g;
}

// CAT (बिरालो)
export function createCatModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Cat';
  const orange = createMat(PALETTE.catOrange, 0.4);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.75), orange);
  body.position.set(0, 0.4, 0);
  body.castShadow = true;
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), orange);
  head.position.set(0, 0.58, 0.42);
  g.add(head);

  // Pointy ears
  [-0.14, 0.14].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), orange);
    ear.position.set(x, 0.78, 0.42);
    g.add(ear);
  });

  return g;
}

// RABBIT (खरायो)
export function createRabbitModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Rabbit';
  const white = createMat(PALETTE.rabbitWhite, 0.3);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), white);
  body.scale.set(0.85, 0.85, 1.15);
  body.position.set(0, 0.35, 0);
  body.castShadow = true;
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), white);
  head.position.set(0, 0.55, 0.3);
  g.add(head);

  // Long vertical ears
  [-0.1, 0.1].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.45, 8), white);
    ear.position.set(x, 0.85, 0.25);
    ear.rotation.z = x > 0 ? -0.1 : 0.1;
    g.add(ear);
  });

  return g;
}

// BIRD (चरा)
export function createBirdModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Bird';
  const blue = createMat(PALETTE.birdBlue, 0.4);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), blue);
  body.scale.set(0.8, 0.9, 1.2);
  body.position.set(0, 0.25, 0);
  g.add(body);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), createMat(0xf39c12));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.28, 0.35);
  g.add(beak);

  return g;
}

// ─────────────────────────────────────────────────────────────────
// 4. FRUITS & VEGETABLES 3D PROCEDURAL MODELS
// ─────────────────────────────────────────────────────────────────

// WATERMELON (खर्बुजा) - Big, striped green
export function createWatermelonModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Watermelon';
  const green = createMat(PALETTE.watermelonGreen, 0.3);

  const melon = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), green);
  melon.scale.set(1.0, 0.95, 1.2);
  melon.position.set(0, 0.8, 0);
  melon.castShadow = true;
  g.add(melon);

  // Curled vine stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.25, 8), createMat(0x145a32));
  stem.position.set(0, 1.65, 0);
  g.add(stem);

  return g;
}

// PUMPKIN (फर्सी) - Large ribbed orange gourd
export function createPumpkinModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Pumpkin';
  const orange = createMat(PALETTE.pumpkinOrange, 0.5);

  // Combine 6 overlapping spheres for the ribbed segments
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 16), orange);
    seg.scale.set(0.65, 0.85, 0.95);
    seg.rotation.y = angle;
    seg.position.set(0, 0.7, 0);
    seg.castShadow = true;
    g.add(seg);
  }

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8), createMat(0x1e8449));
  stem.position.set(0, 1.45, 0);
  g.add(stem);

  return g;
}

// CABBAGE (बन्दाकोबी)
export function createCabbageModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Cabbage';
  const green = createMat(PALETTE.cabbageGreen, 0.6);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 20), green);
  head.position.set(0, 0.65, 0);
  head.castShadow = true;
  g.add(head);

  return g;
}

// APPLE (स्याउ)
export function createAppleModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Apple';
  const red = createMat(PALETTE.appleRed, 0.2);

  const apple = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), red);
  apple.scale.set(1.0, 0.95, 1.0);
  apple.position.set(0, 0.42, 0);
  apple.castShadow = true;
  g.add(apple);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.18, 6), createMat(0x5d4037));
  stem.position.set(0, 0.85, 0);
  g.add(stem);

  return g;
}

// ORANGE (सुन्तला)
export function createOrangeModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Orange';
  const orange = createMat(PALETTE.orangeColor, 0.4);

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), orange);
  mesh.position.set(0, 0.38, 0);
  mesh.castShadow = true;
  g.add(mesh);

  return g;
}

// BANANA (केरा)
export function createBananaModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Banana';
  const yellow = createMat(PALETTE.bananaYellow, 0.3);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, 0.25, 0),
    new THREE.Vector3(-0.1, 0.1, 0),
    new THREE.Vector3(0.2, 0.15, 0),
    new THREE.Vector3(0.45, 0.35, 0),
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.12, 8, false);
  const mesh = new THREE.Mesh(tubeGeo, yellow);
  mesh.castShadow = true;
  g.add(mesh);

  return g;
}

// GRAPES (अङ्गुर)
export function createGrapesModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Grapes';
  const purple = createMat(PALETTE.grapesPurple, 0.2);

  for (let i = 0; i < 12; i++) {
    const r = 0.12;
    const grape = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 12), purple);
    const row = Math.floor(i / 4);
    const col = i % 4;
    grape.position.set((col - 1.5) * 0.16, 0.45 - row * 0.16, (Math.random() - 0.5) * 0.1);
    grape.castShadow = true;
    g.add(grape);
  }

  return g;
}

// STRAWBERRY (स्ट्रबेरी) - Tiny conical red fruit
export function createStrawberryModel(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Strawberry';
  const red = createMat(PALETTE.strawberryRed, 0.25);
  const green = createMat(0x27ae60, 0.4);

  const berry = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 16), red);
  berry.rotation.x = Math.PI;
  berry.position.set(0, 0.18, 0);
  berry.castShadow = true;
  g.add(berry);

  // Green leafy crown
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.05, 0.04, 6), green);
  crown.position.set(0, 0.34, 0);
  g.add(crown);

  return g;
}

// ─────────────────────────────────────────────────────────────────
// 5. TRADITIONAL NEPALI OBJECTS 3D MODELS
// ─────────────────────────────────────────────────────────────────

// TRADITIONAL CLAY POT / GAGRI (माटोको भाँडो / घैँटो)
export function createClayPotModel(scale: number = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ClayPot';
  const clay = createMat(PALETTE.clayTerracotta, 0.6);

  // Earthen rounded belly
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.7 * scale, 24, 24), clay);
  belly.position.set(0, 0.7 * scale, 0);
  belly.castShadow = true;
  g.add(belly);

  // Flared neck & rim
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.38 * scale, 0.32 * scale, 0.35 * scale, 20), clay);
  neck.position.set(0, 1.4 * scale, 0);
  g.add(neck);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42 * scale, 0.07 * scale, 12, 24), clay);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 1.58 * scale, 0);
  g.add(rim);

  return g;
}

// WOVEN BAMBOO BASKET / DOKO (बाँसको टोकरी / डोको)
export function createBasketModel(scale: number = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Basket';
  const bamboo = createMat(PALETTE.bambooLight, 0.7);

  const basket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75 * scale, 0.45 * scale, 0.85 * scale, 20, 1, true),
    bamboo
  );
  basket.position.set(0, 0.45 * scale, 0);
  basket.castShadow = true;
  g.add(basket);

  // Rim ring
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.76 * scale, 0.06 * scale, 12, 24), createMat(PALETTE.bambooDark));
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 0.88 * scale, 0);
  g.add(rim);

  return g;
}

// TRADITIONAL BRONZE PLATE (काँसको थाल)
export function createPlateModel(scale: number = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Plate';
  const brass = createMat(PALETTE.bronzePlate, 0.25);

  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.85 * scale, 0.75 * scale, 0.12 * scale, 32), brass);
  plate.position.set(0, 0.06 * scale, 0);
  plate.castShadow = true;
  g.add(plate);

  return g;
}

// TRADITIONAL WATER CONTAINER / THEKI (ठेकी / अम्खोरा)
export function createWaterContainerModel(scale: number = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Theki';
  const wood = createMat(PALETTE.woodenTheki, 0.45);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45 * scale, 0.65 * scale, 0.9 * scale, 24), wood);
  base.position.set(0, 0.45 * scale, 0);
  base.castShadow = true;
  g.add(base);

  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * scale, 0.42 * scale, 0.45 * scale, 24), wood);
  top.position.set(0, 1.05 * scale, 0);
  g.add(top);

  return g;
}

// ─────────────────────────────────────────────────────────────────
// 6. TOYS 3D PROCEDURAL MODELS
// ─────────────────────────────────────────────────────────────────

// BALL (बल) - Basketball / Tennis / Marble
export function createBallModel(scale: number = 1.0, type: 'basketball' | 'tennis' | 'marble' = 'basketball'): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Ball';
  const col = type === 'basketball' ? PALETTE.basketballOrange : type === 'tennis' ? PALETTE.tennisGreen : 0x3498db;
  const ballMat = createMat(col, 0.3);

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.65 * scale, 24, 24), ballMat);
  ball.position.set(0, 0.65 * scale, 0);
  ball.castShadow = true;
  g.add(ball);

  return g;
}

// TEDDY BEAR (गुडिया)
export function createTeddyModel(scale: number = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.name = 'Teddy';
  const fur = createMat(PALETTE.teddyBrown, 0.7);
  const snoutMat = createMat(PALETTE.teddySnout, 0.6);

  // Plump body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55 * scale, 20, 20), fur);
  body.position.set(0, 0.6 * scale, 0);
  body.castShadow = true;
  g.add(body);

  // Round head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42 * scale, 20, 20), fur);
  head.position.set(0, 1.35 * scale, 0);
  g.add(head);

  // Snout
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 14, 14), snoutMat);
  snout.position.set(0, 1.28 * scale, 0.32 * scale);
  g.add(snout);

  // Ears
  [-0.3 * scale, 0.3 * scale].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16 * scale, 14, 14), fur);
    ear.position.set(x, 1.68 * scale, 0.05 * scale);
    g.add(ear);
  });

  return g;
}

// TOY CAR (खेलौना गाडी)
export function createToyCarModel(scale: number = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ToyCar';
  const bodyMat = createMat(PALETTE.carRed, 0.3);
  const wheelMat = createMat(0x1c2833, 0.4);

  // Car chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.7 * scale, 0.35 * scale, 1.2 * scale), bodyMat);
  chassis.position.set(0, 0.35 * scale, 0);
  chassis.castShadow = true;
  g.add(chassis);

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.55 * scale, 0.32 * scale, 0.65 * scale), createMat(0xd4e6f1));
  cabin.position.set(0, 0.68 * scale, -0.05 * scale);
  g.add(cabin);

  // 4 Wheels
  const wGeo = new THREE.CylinderGeometry(0.16 * scale, 0.16 * scale, 0.12 * scale, 16);
  wGeo.rotateZ(Math.PI / 2);
  [
    [-0.38 * scale, 0.18 * scale, 0.4 * scale],
    [0.38 * scale, 0.18 * scale, 0.4 * scale],
    [-0.38 * scale, 0.18 * scale, -0.4 * scale],
    [0.38 * scale, 0.18 * scale, -0.4 * scale],
  ].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wGeo, wheelMat);
    wheel.position.set(x, y, z);
    g.add(wheel);
  });

  return g;
}

// BUILDING BLOCKS (काठको ब्लक)
export function createBlocksModel(scale: number = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.name = 'BuildingBlocks';

  const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.6 * scale, 0.6 * scale, 0.6 * scale), createMat(PALETTE.blockBlue));
  b1.position.set(0, 0.3 * scale, 0);
  b1.castShadow = true;
  g.add(b1);

  const b2 = new THREE.Mesh(new THREE.ConeGeometry(0.42 * scale, 0.5 * scale, 4), createMat(PALETTE.blockYellow));
  b2.rotation.y = Math.PI / 4;
  b2.position.set(0, 0.85 * scale, 0);
  g.add(b2);

  return g;
}

// ─────────────────────────────────────────────────────────────────
// 7. MASTER OBJECT GENERATOR FACTORY
// ─────────────────────────────────────────────────────────────────
export interface ObjectMetadata {
  id: string;
  nameEn: string;
  nameNe: string;
  category: 'animals' | 'fruits' | 'traditional' | 'toys';
  sizeLevel: number; // 1 (smallest) to 5 (biggest)
}

export function createBigSmallObject(id: string, scaleMultiplier: number = 1.0): THREE.Group {
  let model: THREE.Group;

  switch (id) {
    // Animals
    case 'elephant':
      model = createElephantModel();
      break;
    case 'mouse':
      model = createMouseModel();
      break;
    case 'cow':
      model = createCowModel();
      break;
    case 'goat':
      model = createGoatModel();
      break;
    case 'dog':
      model = createDogModel();
      break;
    case 'cat':
      model = createCatModel();
      break;
    case 'rabbit':
      model = createRabbitModel();
      break;
    case 'bird':
      model = createBirdModel();
      break;

    // Fruits & Veggies
    case 'watermelon':
      model = createWatermelonModel();
      break;
    case 'pumpkin':
      model = createPumpkinModel();
      break;
    case 'cabbage':
      model = createCabbageModel();
      break;
    case 'apple':
      model = createAppleModel();
      break;
    case 'orange':
      model = createOrangeModel();
      break;
    case 'banana':
      model = createBananaModel();
      break;
    case 'grapes':
      model = createGrapesModel();
      break;
    case 'strawberry':
      model = createStrawberryModel();
      break;

    // Traditional Objects
    case 'clay_pot_large':
      model = createClayPotModel(1.4);
      break;
    case 'clay_pot_medium':
      model = createClayPotModel(0.95);
      break;
    case 'clay_pot_small':
      model = createClayPotModel(0.55);
      break;
    case 'basket_large':
      model = createBasketModel(1.4);
      break;
    case 'basket_small':
      model = createBasketModel(0.65);
      break;
    case 'plate_large':
      model = createPlateModel(1.4);
      break;
    case 'plate_small':
      model = createPlateModel(0.65);
      break;
    case 'theki_large':
      model = createWaterContainerModel(1.35);
      break;
    case 'theki_small':
      model = createWaterContainerModel(0.65);
      break;

    // Toys
    case 'ball_big':
      model = createBallModel(1.4, 'basketball');
      break;
    case 'ball_medium':
      model = createBallModel(0.9, 'tennis');
      break;
    case 'ball_small':
      model = createBallModel(0.48, 'marble');
      break;
    case 'teddy_large':
      model = createTeddyModel(1.35);
      break;
    case 'teddy_small':
      model = createTeddyModel(0.65);
      break;
    case 'car_large':
      model = createToyCarModel(1.35);
      break;
    case 'car_small':
      model = createToyCarModel(0.65);
      break;
    case 'blocks_large':
      model = createBlocksModel(1.35);
      break;
    case 'blocks_small':
      model = createBlocksModel(0.65);
      break;

    default:
      model = createBallModel(scaleMultiplier);
      break;
  }

  // Apply any visual scale factor multiplier
  if (scaleMultiplier !== 1.0) {
    model.scale.multiplyScalar(scaleMultiplier);
  }

  model.userData = {
    objectId: id,
    isSelectable: true,
  };

  return model;
}

