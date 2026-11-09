/**
 * CharactersAndAnimals.ts
 * Procedural 3D Characters and Animals for Class 1 Mathematics Chapter 1
 * Features: Child (आशिष), Cat (बिरालो), Dog (कुकुर), Bird (चरा), Rabbit (खरायो),
 * Butterfly (पुतली), Cow (गाई), Goat (बाख्रा) with idle and movement animations.
 */
import * as THREE from 'three';

export interface VillageCharacters {
  child: THREE.Group;
  cat: THREE.Group;
  dog: THREE.Group;
  bird: THREE.Group;
  rabbit: THREE.Group;
  butterfly: THREE.Group;
  cow: THREE.Group;
  goat: THREE.Group;
  update: (delta: number) => void;
  moveCatTo: (x: number, y: number, z: number, duration?: number) => void;
  moveDogTo: (x: number, y: number, z: number, duration?: number) => void;
  moveBirdTo: (x: number, y: number, z: number, duration?: number) => void;
  moveRabbitTo: (x: number, y: number, z: number, duration?: number) => void;
  moveButterflyTo: (x: number, y: number, z: number, duration?: number) => void;
  moveChildTo: (x: number, y: number, z: number, duration?: number) => void;
}

export function createCharactersAndAnimals(scene: THREE.Scene): VillageCharacters {
  let time = 0;

  // ── 1. FRIENDLY NEPALI CHILD (आशिष / Maya) ────────────────────
  const child = new THREE.Group();
  child.position.set(-1.0, 0, 4.0);

  // Shoes & Feet
  const shoeMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.38), shoeMat);
  leftFoot.position.set(-0.22, 0.06, 0.06);
  child.add(leftFoot);

  const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.38), shoeMat);
  rightFoot.position.set(0.22, 0.06, 0.06);
  child.add(rightFoot);

  // Pants (सुरवाल)
  const pantsMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8), pantsMat);
  leftLeg.position.set(-0.22, 0.45, 0);
  child.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8), pantsMat);
  rightLeg.position.set(0.22, 0.45, 0);
  child.add(rightLeg);

  // Torso & Tunic (दौरा सुरवाल / Blue School Uniform)
  const tunicMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.75, 0.42), tunicMat);
  torso.position.set(0, 1.15, 0);
  torso.castShadow = true;
  child.add(torso);

  // Arms
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), tunicMat);
  leftArm.position.set(-0.44, 1.15, 0);
  leftArm.rotation.z = 0.2;
  child.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), tunicMat);
  rightArm.position.set(0.44, 1.15, 0);
  rightArm.rotation.z = -0.2;
  child.add(rightArm);

  // Hands (Skin tone)
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xe0ac69 });
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
  leftHand.position.set(-0.52, 0.85, 0);
  child.add(leftHand);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
  rightHand.position.set(0.52, 0.85, 0);
  child.add(rightHand);

  // Head & Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.18, 8), skinMat);
  neck.position.set(0, 1.6, 0);
  child.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), skinMat);
  head.position.set(0, 1.88, 0);
  head.castShadow = true;
  child.add(head);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
  leftEye.position.set(-0.11, 1.92, 0.28);
  child.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
  rightEye.position.set(0.11, 1.92, 0.28);
  child.add(rightEye);

  // Smile
  const smileGeo = new THREE.TorusGeometry(0.09, 0.02, 6, 10, Math.PI);
  const smileMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
  const smile = new THREE.Mesh(smileGeo, smileMat);
  smile.rotation.x = Math.PI / 2;
  smile.rotation.z = Math.PI;
  smile.position.set(0, 1.76, 0.3);
  child.add(smile);

  // Traditional Nepali Topi (ढाका टोपी)
  const topiMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
  const topi = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.28, 12), topiMat);
  topi.position.set(0, 2.22, 0);
  topi.rotation.x = -0.1;
  child.add(topi);

  scene.add(child);

  // ── 2. PLAYFUL CAT (बिरालो) ──────────────────────────────────
  const cat = new THREE.Group();
  cat.position.set(-5.2, 0, 1.6); // Default outside on veranda

  const catMat = new THREE.MeshLambertMaterial({ color: 0xe67e22 }); // Ginger tabby
  const catWhite = new THREE.MeshLambertMaterial({ color: 0xffffff });

  // Cat Body
  const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), catMat);
  catBody.scale.set(0.9, 1.1, 1.3);
  catBody.position.y = 0.38;
  catBody.castShadow = true;
  cat.add(catBody);

  // Cat Head
  const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), catMat);
  catHead.position.set(0, 0.62, 0.32);
  catHead.castShadow = true;
  cat.add(catHead);

  // Cat Ears
  const earGeo = new THREE.ConeGeometry(0.08, 0.16, 4);
  const leftEarCat = new THREE.Mesh(earGeo, catMat);
  leftEarCat.position.set(-0.14, 0.82, 0.32);
  leftEarCat.rotation.z = 0.25;
  cat.add(leftEarCat);

  const rightEarCat = new THREE.Mesh(earGeo, catMat);
  rightEarCat.position.set(0.14, 0.82, 0.32);
  rightEarCat.rotation.z = -0.25;
  cat.add(rightEarCat);

  // Cat Eyes
  const catEyeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const leftCatEye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), catEyeMat);
  leftCatEye.position.set(-0.08, 0.66, 0.52);
  cat.add(leftCatEye);

  const rightCatEye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), catEyeMat);
  rightCatEye.position.set(0.08, 0.66, 0.52);
  cat.add(rightCatEye);

  // Cat Tail (animated)
  const catTail = new THREE.Group();
  catTail.position.set(0, 0.35, -0.42);
  const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.55, 6), catMat);
  tailMesh.position.set(0, 0.25, -0.1);
  tailMesh.rotation.x = -0.6;
  catTail.add(tailMesh);
  cat.add(catTail);

  // Cat Paws
  const pawOffsets = [
    { x: -0.16, z: 0.22 },
    { x: 0.16, z: 0.22 },
    { x: -0.18, z: -0.2 },
    { x: 0.18, z: -0.2 },
  ];
  pawOffsets.forEach((p) => {
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), catWhite);
    paw.position.set(p.x, 0.07, p.z);
    cat.add(paw);
  });

  scene.add(cat);

  // ── 3. LOYAL VILLAGE DOG (कुकुर) ──────────────────────────────
  const dog = new THREE.Group();
  dog.position.set(-3.8, 0, 2.2); // Outside in front of veranda

  const dogMat = new THREE.MeshLambertMaterial({ color: 0xb45309 }); // Golden brown
  const dogDark = new THREE.MeshLambertMaterial({ color: 0x78350f });

  const dogBody = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 0.9), dogMat);
  dogBody.position.y = 0.48;
  dogBody.castShadow = true;
  dog.add(dogBody);

  const dogHead = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), dogMat);
  dogHead.position.set(0, 0.76, 0.48);
  dogHead.castShadow = true;
  dog.add(dogHead);

  const dogSnout = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), dogMat);
  dogSnout.position.set(0, 0.72, 0.7);
  dog.add(dogSnout);

  const dogNose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), new THREE.MeshBasicMaterial({ color: 0x111827 }));
  dogNose.position.set(0, 0.76, 0.82);
  dog.add(dogNose);

  // Floppy Ears
  const leftEarDog = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.12), dogDark);
  leftEarDog.position.set(-0.22, 0.78, 0.44);
  leftEarDog.rotation.z = -0.3;
  dog.add(leftEarDog);

  const rightEarDog = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.12), dogDark);
  rightEarDog.position.set(0.22, 0.78, 0.44);
  rightEarDog.rotation.z = 0.3;
  dog.add(rightEarDog);

  // Dog Tail (animated)
  const dogTail = new THREE.Group();
  dogTail.position.set(0, 0.52, -0.45);
  const dogTailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.42, 6), dogMat);
  dogTailMesh.position.set(0, 0.18, -0.15);
  dogTailMesh.rotation.x = -0.8;
  dogTail.add(dogTailMesh);
  dog.add(dogTail);

  // Dog Legs
  const dogLegs = [
    { x: -0.2, z: 0.3 },
    { x: 0.2, z: 0.3 },
    { x: -0.2, z: -0.3 },
    { x: 0.2, z: -0.3 },
  ];
  dogLegs.forEach((dl) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.32, 6), dogMat);
    l.position.set(dl.x, 0.16, dl.z);
    dog.add(l);
  });

  scene.add(dog);

  // ── 4. CHIRPING BIRD (चरा) ────────────────────────────────────
  const bird = new THREE.Group();
  bird.position.set(7.5, 4.4, -3.5); // Default placed above the tree

  const birdMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 }); // Turquoise bluebird
  const beakMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });

  const birdBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), birdMat);
  birdBody.scale.set(1.3, 1, 1);
  bird.add(birdBody);

  const birdHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), birdMat);
  birdHead.position.set(0.18, 0.12, 0);
  bird.add(birdHead);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), beakMat);
  beak.position.set(0.32, 0.12, 0);
  beak.rotation.z = -Math.PI / 2;
  bird.add(beak);

  // Wings (Animated)
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.18), birdMat);
  leftWing.position.set(0, 0.08, 0.16);
  bird.add(leftWing);

  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.18), birdMat);
  rightWing.position.set(0, 0.08, -0.16);
  bird.add(rightWing);

  scene.add(bird);

  // ── 5. CUTE HOPPING RABBIT (खरायो) ────────────────────────────
  const rabbit = new THREE.Group();
  rabbit.position.set(7.5, 0, -2.2); // Default below the tree

  const rabbitMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
  const rabbitBody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), rabbitMat);
  rabbitBody.position.y = 0.22;
  rabbit.add(rabbitBody);

  const rabbitHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), rabbitMat);
  rabbitHead.position.set(0.18, 0.36, 0);
  rabbit.add(rabbitHead);

  // Upright Rabbit Ears
  const earMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
  const rabbitEarL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.3, 6), earMat);
  rabbitEarL.position.set(0.15, 0.58, 0.08);
  rabbitEarL.rotation.z = -0.15;
  rabbit.add(rabbitEarL);

  const rabbitEarR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.3, 6), earMat);
  rabbitEarR.position.set(0.15, 0.58, -0.08);
  rabbitEarR.rotation.z = -0.15;
  rabbit.add(rabbitEarR);

  scene.add(rabbit);

  // ── 6. FLUTTERING BUTTERFLY (पुतली) ──────────────────────────
  const butterfly = new THREE.Group();
  butterfly.position.set(-1.5, 1.4, 2.2); // Default hovering above flower

  const bFlyBodyMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
  const bFlyWingMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e, side: THREE.DoubleSide });

  const bFlyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 6), bFlyBodyMat);
  bFlyBody.rotation.x = Math.PI / 2;
  butterfly.add(bFlyBody);

  const bFlyLeftWing = new THREE.Mesh(new THREE.CircleGeometry(0.18, 8), bFlyWingMat);
  bFlyLeftWing.position.set(-0.16, 0.02, 0);
  bFlyLeftWing.rotation.x = Math.PI / 2;
  butterfly.add(bFlyLeftWing);

  const bFlyRightWing = new THREE.Mesh(new THREE.CircleGeometry(0.18, 8), bFlyWingMat);
  bFlyRightWing.position.set(0.16, 0.02, 0);
  bFlyRightWing.rotation.x = Math.PI / 2;
  butterfly.add(bFlyRightWing);

  scene.add(butterfly);

  // ── 7. BACKGROUND COW & GOAT (गाई र बाख्रा) ──────────────────
  const cow = new THREE.Group();
  cow.position.set(13.5, 0, -12); // Background meadow
  const cowMat = new THREE.MeshLambertMaterial({ color: 0xfaf5ef });
  const cowSpotMat = new THREE.MeshLambertMaterial({ color: 0x334155 });

  const cowBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.8), cowMat);
  cowBody.position.y = 1.1;
  cow.add(cowBody);

  const cowSpot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.82), cowSpotMat);
  cowSpot.position.set(0.2, 1.1, 0);
  cow.add(cowSpot);

  const cowHead = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.5), cowMat);
  cowHead.position.set(1.0, 1.5, 0);
  cow.add(cowHead);

  [
    { x: -0.6, z: -0.3 },
    { x: 0.6, z: -0.3 },
    { x: -0.6, z: 0.3 },
    { x: 0.6, z: 0.3 },
  ].forEach((pos) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 6), cowMat);
    leg.position.set(pos.x, 0.35, pos.z);
    cow.add(leg);
  });
  cow.scale.set(0.85, 0.85, 0.85);
  scene.add(cow);

  // Small Goat
  const goat = new THREE.Group();
  goat.position.set(11, 0, -8.5);
  const goatMat = new THREE.MeshLambertMaterial({ color: 0x475569 });

  const goatBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.45), goatMat);
  goatBody.position.y = 0.65;
  goat.add(goatBody);

  const goatHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.3), goatMat);
  goatHead.position.set(0.55, 0.9, 0);
  goat.add(goatHead);

  [
    { x: -0.35, z: -0.16 },
    { x: 0.35, z: -0.16 },
    { x: -0.35, z: 0.16 },
    { x: 0.35, z: 0.16 },
  ].forEach((pos) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.45, 6), goatMat);
    leg.position.set(pos.x, 0.22, pos.z);
    goat.add(leg);
  });
  goat.scale.set(0.75, 0.75, 0.75);
  scene.add(goat);

  // ── 8. ANIMATION & TWEEN HELPERS ──────────────────────────────
  interface MoveTarget {
    group: THREE.Group;
    startX: number;
    startY: number;
    startZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
    progress: number;
    speed: number;
  }
  const moveTargets: MoveTarget[] = [];

  function moveGroupTo(group: THREE.Group, x: number, y: number, z: number, duration = 1.0) {
    const existingIdx = moveTargets.findIndex((m) => m.group === group);
    const speed = duration > 0 ? 1 / duration : 10;
    const target: MoveTarget = {
      group,
      startX: group.position.x,
      startY: group.position.y,
      startZ: group.position.z,
      targetX: x,
      targetY: y,
      targetZ: z,
      progress: 0,
      speed,
    };
    if (existingIdx >= 0) {
      moveTargets[existingIdx] = target;
    } else {
      moveTargets.push(target);
    }
  }

  function moveCatTo(x: number, y: number, z: number, dur = 1.2) {
    moveGroupTo(cat, x, y, z, dur);
  }
  function moveDogTo(x: number, y: number, z: number, dur = 1.2) {
    moveGroupTo(dog, x, y, z, dur);
  }
  function moveBirdTo(x: number, y: number, z: number, dur = 1.0) {
    moveGroupTo(bird, x, y, z, dur);
  }
  function moveRabbitTo(x: number, y: number, z: number, dur = 1.0) {
    moveGroupTo(rabbit, x, y, z, dur);
  }
  function moveButterflyTo(x: number, y: number, z: number, dur = 0.9) {
    moveGroupTo(butterfly, x, y, z, dur);
  }
  function moveChildTo(x: number, y: number, z: number, dur = 1.2) {
    moveGroupTo(child, x, y, z, dur);
  }

  function update(delta: number) {
    time += delta;

    // Gentle breathing / idle swaying of child
    child.position.y = Math.sin(time * 2.5) * 0.02;

    // Dog tail wagging
    dogTail.rotation.y = Math.sin(time * 12) * 0.5;

    // Cat tail curling
    catTail.rotation.z = -0.6 + Math.sin(time * 3) * 0.25;

    // Bird wings flapping
    leftWing.rotation.x = Math.sin(time * 16) * 0.6;
    rightWing.rotation.x = -Math.sin(time * 16) * 0.6;

    // Rabbit gentle hopping
    rabbit.position.y = Math.max(0, Math.sin(time * 3) * 0.08);

    // Butterfly fluttering
    bFlyLeftWing.rotation.z = Math.sin(time * 22) * 0.8;
    bFlyRightWing.rotation.z = -Math.sin(time * 22) * 0.8;
    butterfly.position.y += Math.sin(time * 4) * 0.003;

    // Background cow idle
    cowHead.rotation.y = Math.sin(time * 0.8) * 0.12;

    // Update ongoing smooth interpolations
    for (let i = moveTargets.length - 1; i >= 0; i--) {
      const mt = moveTargets[i];
      mt.progress += delta * mt.speed;
      const t = Math.min(1, mt.progress);
      // Smooth ease-in-out
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      mt.group.position.x = mt.startX + (mt.targetX - mt.startX) * ease;
      mt.group.position.y = mt.startY + (mt.targetY - mt.startY) * ease;
      mt.group.position.z = mt.startZ + (mt.targetZ - mt.startZ) * ease;

      // Face target direction
      const dx = mt.targetX - mt.startX;
      const dz = mt.targetZ - mt.startZ;
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        mt.group.rotation.y = Math.atan2(dx, dz);
      }

      if (t >= 1) {
        moveTargets.splice(i, 1);
      }
    }
  }

  return {
    child,
    cat,
    dog,
    bird,
    rabbit,
    butterfly,
    cow,
    goat,
    update,
    moveCatTo,
    moveDogTo,
    moveBirdTo,
    moveRabbitTo,
    moveButterflyTo,
    moveChildTo,
  };
}
