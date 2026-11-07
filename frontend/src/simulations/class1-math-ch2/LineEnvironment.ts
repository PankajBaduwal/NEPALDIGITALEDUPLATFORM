/**
 * LineEnvironment.ts
 * 3D Nepalese Village Environment with Straight & Curved Features
 * For Class 1 Mathematics Chapter 2: Lines (रेखाहरू)
 */
import * as THREE from 'three';

export interface LineElements {
  scene: THREE.Scene;
  straightRoad: THREE.Group;
  curvedRoad: THREE.Group;
  straightRail: THREE.Group;
  curvedPath: THREE.Group;
  straightFence: THREE.Group;
  curvedGarden: THREE.Group;
  straightStick: THREE.Group;
  ropeGroup: THREE.Group;
  straightBridge: THREE.Group;
  windingRiver: THREE.Group;
  highlightObject: (name: string, isStraight: boolean) => void;
  clearHighlights: () => void;
  setRopeState: (isStraight: boolean) => void;
  update: (delta: number) => void;
}

export function createLineEnvironment(scene: THREE.Scene): LineElements {
  // ── 1. LIGHTING ──────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.8);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.15);
  sunLight.position.set(20, 28, 22);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 70;
  const d = 22;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  const skyLight = new THREE.DirectionalLight(0xa5d8ff, 0.4);
  skyLight.position.set(-15, 12, -15);
  scene.add(skyLight);

  scene.background = new THREE.Color(0xbfe6ff);
  scene.fog = new THREE.Fog(0xbfe6ff, 35, 75);

  // ── 2. MOUNTAINS & GREEN ROLLING HILLS ───────────────────────
  const mountainGroup = new THREE.Group();
  const mountainMat = new THREE.MeshLambertMaterial({ color: 0x829db7 });
  const snowMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const peaks = [
    { x: -30, z: -38, h: 22, r: 14 },
    { x: -12, z: -45, h: 27, r: 17 },
    { x: 10, z: -42, h: 24, r: 16 },
    { x: 28, z: -39, h: 20, r: 13 },
  ];
  peaks.forEach((p) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 7), mountainMat);
    m.position.set(p.x, p.h / 2 - 2, p.z);
    mountainGroup.add(m);

    const snow = new THREE.Mesh(new THREE.ConeGeometry(p.r * 0.4, p.h * 0.35, 7), snowMat);
    snow.position.set(p.x, p.h * 0.85 - 2, p.z);
    mountainGroup.add(snow);
  });
  scene.add(mountainGroup);

  // ── 3. GROUND & LAWN ─────────────────────────────────────────
  const groundGeo = new THREE.CylinderGeometry(22, 22.5, 0.8, 36);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x58a855 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.4;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── 4. STRAIGHT VILLAGE ROAD (सिधा सडक) ───────────────────────
  const straightRoad = new THREE.Group();
  const asphaltMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
  const roadSurface = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 16), asphaltMat);
  roadSurface.position.set(-6, 0.04, 0);
  roadSurface.receiveShadow = true;
  straightRoad.add(roadSurface);

  // White center straight line
  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const straightCenterLine = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 15.6), whiteLineMat);
  straightCenterLine.position.set(-6, 0.05, 0);
  straightRoad.add(straightCenterLine);
  straightRoad.name = 'straight_road';
  scene.add(straightRoad);

  // ── 5. CURVED VILLAGE ROAD (बाङ्गो सडक) ────────────────────────
  const curvedRoad = new THREE.Group();
  const curvePoints: THREE.Vector3[] = [
    new THREE.Vector3(5, 0.04, -8),
    new THREE.Vector3(8, 0.04, -4),
    new THREE.Vector3(4, 0.04, 0),
    new THREE.Vector3(7, 0.04, 4),
    new THREE.Vector3(4, 0.04, 8),
  ];
  const roadCurve = new THREE.CatmullRomCurve3(curvePoints);
  const curvedRoadGeo = new THREE.TubeGeometry(roadCurve, 40, 1.1, 8, false);
  const curvedRoadMesh = new THREE.Mesh(curvedRoadGeo, asphaltMat);
  curvedRoadMesh.scale.set(1, 0.08, 1);
  curvedRoadMesh.receiveShadow = true;
  curvedRoad.add(curvedRoadMesh);

  // Yellow center curved line
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const curvedCenterGeo = new THREE.TubeGeometry(roadCurve, 40, 0.09, 6, false);
  const curvedCenterMesh = new THREE.Mesh(curvedCenterGeo, yellowLineMat);
  curvedCenterMesh.scale.set(1, 0.09, 1);
  curvedCenterMesh.position.y = 0.02;
  curvedRoad.add(curvedCenterMesh);
  curvedRoad.name = 'curved_road';
  scene.add(curvedRoad);

  // ── 6. STRAIGHT RAILWAY TRACK (सिधा रेलको लिक) ────────────────
  const straightRail = new THREE.Group();
  straightRail.position.set(-11, 0.06, 0);
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
  const woodSleeperMat = new THREE.MeshLambertMaterial({ color: 0x5a381e });

  // Two parallel rails
  const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 14), steelMat);
  leftRail.position.x = -0.55;
  straightRail.add(leftRail);

  const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 14), steelMat);
  rightRail.position.x = 0.55;
  straightRail.add(rightRail);

  // Wooden sleepers across
  for (let z = -6.5; z <= 6.5; z += 0.8) {
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 0.22), woodSleeperMat);
    sleeper.position.set(0, -0.02, z);
    straightRail.add(sleeper);
  }
  straightRail.name = 'straight_rail';
  scene.add(straightRail);

  // ── 7. STRAIGHT FENCE (सिधा बार) ──────────────────────────────
  const straightFence = new THREE.Group();
  straightFence.position.set(0, 0, -5.5);
  const fenceMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }); // White picket fence

  // Top and bottom horizontal rails
  const topRail = new THREE.Mesh(new THREE.BoxGeometry(8, 0.08, 0.08), fenceMat);
  topRail.position.y = 0.85;
  straightFence.add(topRail);

  const bottomRail = new THREE.Mesh(new THREE.BoxGeometry(8, 0.08, 0.08), fenceMat);
  bottomRail.position.y = 0.45;
  straightFence.add(bottomRail);

  // Vertical pickets
  for (let x = -3.8; x <= 3.8; x += 0.5) {
    const picket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.04), fenceMat);
    picket.position.set(x, 0.55, 0);
    picket.castShadow = true;
    straightFence.add(picket);
  }
  straightFence.name = 'straight_fence';
  scene.add(straightFence);

  // ── 8. CURVED GARDEN BOUNDARY (बाङ्गो बगैँचा घेरा) ────────────
  const curvedGarden = new THREE.Group();
  curvedGarden.position.set(0, 0, 5.5);
  const gardenBrickMat = new THREE.MeshLambertMaterial({ color: 0xc2410c }); // Terracotta bricks

  // Semi-circular arch of bricks
  for (let i = 0; i <= 14; i++) {
    const ang = (i / 14) * Math.PI;
    const bx = Math.cos(ang) * 3.5;
    const bz = Math.sin(ang) * 2.2;
    const brick = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), gardenBrickMat);
    brick.position.set(bx, 0.15, bz);
    brick.rotation.y = -ang + Math.PI / 2;
    brick.castShadow = true;
    curvedGarden.add(brick);
  }

  // Colourful flowers inside curved bed
  const flowerColors = [0xef4444, 0xf59e0b, 0xec4899, 0x8b5cf6];
  for (let j = 0; j < 12; j++) {
    const flAng = (j / 12) * Math.PI;
    const fl = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 6, 6),
      new THREE.MeshLambertMaterial({ color: flowerColors[j % flowerColors.length] })
    );
    fl.position.set(Math.cos(flAng) * 2.6, 0.25, Math.sin(flAng) * 1.6);
    curvedGarden.add(fl);
  }
  curvedGarden.name = 'curved_garden';
  scene.add(curvedGarden);

  // ── 9. STRAIGHT WOODEN STICK (सिधा काठको लठ्ठी) ───────────────
  const straightStick = new THREE.Group();
  straightStick.position.set(-1.8, 0.35, 1.5);
  const stickMat = new THREE.MeshLambertMaterial({ color: 0x854d0e });
  const stickMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8), stickMat);
  stickMesh.rotation.z = Math.PI / 2;
  stickMesh.castShadow = true;
  straightStick.add(stickMesh);
  straightStick.name = 'straight_stick';
  scene.add(straightStick);

  // ── 10. TUG-OF-WAR ROPE (सिधा र बाङ्गो डोरी) ───────────────────
  const ropeGroup = new THREE.Group();
  ropeGroup.position.set(0, 0.5, 2.8);
  const ropeMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });

  let ropeMesh: THREE.Mesh | null = null;

  function buildRope(isStraight: boolean) {
    if (ropeMesh) {
      ropeGroup.remove(ropeMesh);
      ropeMesh.geometry.dispose();
    }
    const points: THREE.Vector3[] = [];
    if (isStraight) {
      // Taut, straight rope
      for (let x = -3.2; x <= 3.2; x += 0.8) {
        points.push(new THREE.Vector3(x, 0, 0));
      }
    } else {
      // Bent, wavy curved rope
      points.push(new THREE.Vector3(-3.2, 0, 0));
      points.push(new THREE.Vector3(-1.8, 0, 0.7));
      points.push(new THREE.Vector3(-0.4, 0, -0.6));
      points.push(new THREE.Vector3(1.2, 0, 0.8));
      points.push(new THREE.Vector3(3.2, 0, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const ropeGeo = new THREE.TubeGeometry(curve, 32, 0.08, 8, false);
    ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
    ropeMesh.castShadow = true;
    ropeGroup.add(ropeMesh);
  }

  // Initial curved rope state
  buildRope(false);
  ropeGroup.name = 'rope';
  scene.add(ropeGroup);

  // ── 11. WINDING RIVER (बाङ्गो नदी) ───────────────────────────
  const windingRiver = new THREE.Group();
  const riverPoints = [
    new THREE.Vector3(-18, 0.02, 10),
    new THREE.Vector3(-12, 0.02, 6),
    new THREE.Vector3(-4, 0.02, 11),
    new THREE.Vector3(3, 0.02, 7),
    new THREE.Vector3(12, 0.02, 12),
    new THREE.Vector3(18, 0.02, 8),
  ];
  const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
  const riverGeo = new THREE.TubeGeometry(riverCurve, 40, 1.2, 8, false);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const riverMesh = new THREE.Mesh(riverGeo, riverMat);
  riverMesh.scale.set(1, 0.06, 1);
  riverMesh.receiveShadow = true;
  windingRiver.add(riverMesh);
  windingRiver.name = 'curved_river';
  scene.add(windingRiver);

  // ── 12. STRAIGHT BRIDGE (सिधा पुल) ────────────────────────────
  const straightBridge = new THREE.Group();
  straightBridge.position.set(-4, 0.18, 11);
  const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 3.4), bridgeMat);
  bridgeDeck.castShadow = true;
  straightBridge.add(bridgeDeck);

  // Railings on bridge
  const railLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 3.4), bridgeMat);
  railLeft.position.set(-0.75, 0.28, 0);
  straightBridge.add(railLeft);

  const railRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 3.4), bridgeMat);
  railRight.position.set(0.75, 0.28, 0);
  straightBridge.add(railRight);
  straightBridge.name = 'straight_bridge';
  scene.add(straightBridge);

  // ── 13. HIGHLIGHTING SYSTEM ──────────────────────────────────
  const activeHighlights: THREE.Mesh[] = [];

  function highlightObject(name: string, isStraight: boolean) {
    clearHighlights();
    const color = isStraight ? 0x2563eb : 0xef4444; // Blue for straight, Red for curved!
    const glowMat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });

    const target = scene.getObjectByName(name);
    if (target) {
      target.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const glow = new THREE.Mesh(child.geometry.clone(), glowMat);
          glow.position.copy(child.position);
          glow.rotation.copy(child.rotation);
          glow.scale.copy(child.scale).multiplyScalar(1.06);
          target.add(glow);
          activeHighlights.push(glow);
        }
      });
    }
  }

  function clearHighlights() {
    activeHighlights.forEach((h) => {
      if (h.parent) h.parent.remove(h);
      h.geometry.dispose();
    });
    activeHighlights.length = 0;
  }

  function setRopeState(isStraight: boolean) {
    buildRope(isStraight);
  }

  function update(delta: number) {
    // Gentle river water shimmer
    riverMesh.position.y = 0.02 + Math.sin(Date.now() * 0.003) * 0.01;
  }

  return {
    scene,
    straightRoad,
    curvedRoad,
    straightRail,
    curvedPath: curvedRoad,
    straightFence,
    curvedGarden,
    straightStick,
    ropeGroup,
    straightBridge,
    windingRiver,
    highlightObject,
    clearHighlights,
    setRopeState,
    update,
  };
}

