/**
 * CharactersAndAnimals.ts
 * Procedural 3D Characters and Animals for Simulation 01
 */
import * as THREE from 'three';

export interface VillageCharacters {
  child: THREE.Group;
  cat: THREE.Group;
  dog: THREE.Group;
  bird: THREE.Group;
  rabbit: THREE.Group;
  elephantBig?: THREE.Group;
  elephantSmall?: THREE.Group;
  update: (delta: number) => void;
  moveCatTo: (x: number, y: number, z: number, duration?: number) => void;
  moveDogTo: (x: number, y: number, z: number, duration?: number) => void;
  moveBirdTo: (x: number, y: number, z: number, duration?: number) => void;
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
  smile.position.set(0, 1.78, 0.29);
  smile.rotation.x = Math.PI / 1.1;
  child.add(smile);

  // Nepali Dhaka Topi (नेपाली ढाका टोपी)
  const topiMat = new THREE.MeshLambertMaterial({ color: 0xbe123c });
  const topi = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.33, 0.28, 16), topiMat);
  topi.position.set(0, 2.16, 0);
  topi.rotation.z = -0.05;
  child.add(topi);

  scene.add(child);

  // ── 2. CUTE CAT (बिरालो) ──────────────────────────────────────
  const cat = new THREE.Group();
  cat.position.set(-5.5, 0, 1.5); // Starts in front of house veranda

  const catMat = new THREE.MeshLambertMaterial({ color: 0xf97316 }); // Friendly orange tabby
  const catWhite = new THREE.MeshLambertMaterial({ color: 0xffffff });

  // Body
  const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), catMat);
  catBody.scale.set(1.4, 0.9, 0.9);
  catBody.position.set(0, 0.32, 0);
  catBody.castShadow = true;
  cat.add(catBody);

  // Belly
  const catBelly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), catWhite);
  catBelly.scale.set(1.1, 0.8, 0.8);
  catBelly.position.set(0.05, 0.26, 0.12);
  cat.add(catBelly);

  // Head
  const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), catMat);
  catHead.position.set(0.42, 0.48, 0);
  catHead.castShadow = true;
  cat.add(catHead);

  // Pointy Ears
  const earGeo = new THREE.ConeGeometry(0.09, 0.16, 4);
  const leftEar = new THREE.Mesh(earGeo, catMat);
  leftEar.position.set(0.42, 0.72, 0.12);
  cat.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, catMat);
  rightEar.position.set(0.42, 0.72, -0.12);
  cat.add(rightEar);

  // Eyes
  const catEyeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Green eyes
  const catEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), catEyeMat);
  catEyeL.position.set(0.6, 0.52, 0.09);
  cat.add(catEyeL);

  const catEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), catEyeMat);
  catEyeR.position.set(0.6, 0.52, -0.09);
  cat.add(catEyeR);

  // Tail
  const catTail = new THREE.Group();
  catTail.position.set(-0.44, 0.36, 0);
  const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 6), catMat);
  tailMesh.position.set(-0.15, 0.18, 0);
  tailMesh.rotation.z = -0.6;
  catTail.add(tailMesh);
  cat.add(catTail);

  // Legs
  const legMat = catMat;
  const legPositions = [
    { x: 0.28, z: 0.16 },
    { x: 0.28, z: -0.16 },
    { x: -0.28, z: 0.16 },
    { x: -0.28, z: -0.16 },
  ];
  legPositions.forEach((lp) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 6), legMat);
    leg.position.set(lp.x, 0.12, lp.z);
    cat.add(leg);
  });

  scene.add(cat);

  // ── 3. FRIENDLY DOG (कुकुर) ──────────────────────────────────
  const dog = new THREE.Group();
  dog.position.set(-4.5, 0, 0.5); // Sits on the veranda outside the house

  const dogMat = new THREE.MeshLambertMaterial({ color: 0xb45309 }); // Golden brown Nepali Bhote dog
  const dogDark = new THREE.MeshLambertMaterial({ color: 0x78350f });

  // Body
  const dogBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), dogMat);
  dogBody.scale.set(1.4, 1.0, 0.95);
  dogBody.position.set(0, 0.48, 0);
  dogBody.castShadow = true;
  dog.add(dogBody);

  // Head & Snout
  const dogHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), dogMat);
  dogHead.position.set(0.52, 0.76, 0);
  dogHead.castShadow = true;
  dog.add(dogHead);

  const dogSnout = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.22), dogMat);
  dogSnout.position.set(0.76, 0.72, 0);
  dog.add(dogSnout);

  const dogNose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: 0x111827 }));
  dogNose.position.set(0.89, 0.76, 0);
  dog.add(dogNose);

  // Floppy Ears
  const leftEarDog = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.12), dogDark);
  leftEarDog.position.set(0.5, 0.8, 0.24);
  leftEarDog.rotation.x = 0.3;
  dog.add(leftEarDog);

  const rightEarDog = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.12), dogDark);
  rightEarDog.position.set(0.5, 0.8, -0.24);
  rightEarDog.rotation.x = -0.3;
  dog.add(rightEarDog);

  // Dog Tail (animated)
  const dogTail = new THREE.Group();
  dogTail.position.set(-0.55, 0.52, 0);
  const dogTailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.42, 6), dogMat);
  dogTailMesh.position.set(-0.15, 0.18, 0);
  dogTailMesh.rotation.z = -0.8;
  dogTail.add(dogTailMesh);
  dog.add(dogTail);

  // Dog Legs
  const dogLegs = [
    { x: 0.35, z: 0.2 },
    { x: 0.35, z: -0.2 },
    { x: -0.35, z: 0.2 },
    { x: -0.35, z: -0.2 },
  ];
  dogLegs.forEach((dl) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.35, 6), dogMat);
    l.position.set(dl.x, 0.18, dl.z);
    dog.add(l);
  });

  scene.add(dog);

  // ── 4. CHIRPING BIRD (चरा) ────────────────────────────────────
  const bird = new THREE.Group();
  bird.position.set(7.5, 3.8, -3.5); // Default placed above the tree

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
  rabbit.position.set(2.0, 0, 4.0); // Garden lawn

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

  // ── 6. ANIMATION & TWEEN HELPERS ──────────────────────────────
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
  function moveChildTo(x: number, y: number, z: number, dur = 1.2) {
    moveGroupTo(child, x, y, z, dur);
  }

  function update(delta: number) {
    time += delta;

    // Gentle breathing / idle swaying of child
    child.position.y = Math.sin(time * 2.5) * 0.02;
    child.rotation.y = Math.sin(time * 0.8) * 0.06;

    // Dog tail wagging
    dogTail.rotation.y = Math.sin(time * 12) * 0.5;

    // Cat tail curling
    catTail.rotation.z = -0.6 + Math.sin(time * 3) * 0.25;

    // Bird wings flapping
    leftWing.rotation.x = Math.sin(time * 16) * 0.6;
    rightWing.rotation.x = -Math.sin(time * 16) * 0.6;

    // Rabbit gentle hopping
    rabbit.position.y = Math.max(0, Math.sin(time * 3) * 0.08);

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
    update,
    moveCatTo,
    moveDogTo,
    moveBirdTo,
    moveChildTo,
  };
}

