/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * MechanicalBuilder — 3D Procedural Engineering Components
 *
 * Provides physical engineering representations:
 * - Structural beams, supports (pin, roller, fixed), truss members & joints
 * - Pulleys, tension cables, hanging weights, friction blocks
 * - Inclined ramps, ladders, wedges, wheels, dynamics carts, helical springs
 */

import * as THREE from 'three';

export class MechanicalBuilder {
  /**
   * Material palette for realistic engineering mechanics
   */
  public static materials = {
    steel: new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.35 }),
    darkSteel: new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.4 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.1, roughness: 0.85 }),
    wood: new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.05, roughness: 0.75 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.1, roughness: 0.9 }),
    ground: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.1, roughness: 0.9 }),
    cable: new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.5 }),
    spring: new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 }),
    indicatorGreen: new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.5, roughness: 0.3 }),
    indicatorRed: new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.3 }),
  };

  /**
   * Pin Support (triangle + pin joint + ground plate)
   */
  public static createPinSupport(height: number = 0.5): THREE.Group {
    const group = new THREE.Group();

    // Triangle bracket
    const shape = new THREE.Shape();
    shape.moveTo(-height * 0.5, 0);
    shape.lineTo(height * 0.5, 0);
    shape.lineTo(0, height);
    shape.closePath();

    const extrudeSettings = { depth: 0.15, bevelEnabled: false };
    const triGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    triGeo.translate(0, 0, -0.075);
    const triMesh = new THREE.Mesh(triGeo, this.materials.darkSteel);
    group.add(triMesh);

    // Pin cylinder at apex
    const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16);
    pinGeo.rotateX(Math.PI / 2);
    pinGeo.translate(0, height, 0);
    const pinMesh = new THREE.Mesh(pinGeo, this.materials.brass);
    group.add(pinMesh);

    // Ground base plate
    const baseGeo = new THREE.BoxGeometry(height * 1.3, 0.04, 0.25);
    baseGeo.translate(0, -0.02, 0);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.steel);
    group.add(baseMesh);

    return group;
  }

  /**
   * Roller Support (bracket + 2 ground rollers + base)
   */
  public static createRollerSupport(height: number = 0.5): THREE.Group {
    const group = new THREE.Group();

    // Upper triangle bracket
    const shape = new THREE.Shape();
    shape.moveTo(-height * 0.45, height * 0.25);
    shape.lineTo(height * 0.45, height * 0.25);
    shape.lineTo(0, height);
    shape.closePath();

    const extrudeSettings = { depth: 0.15, bevelEnabled: false };
    const triGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    triGeo.translate(0, 0, -0.075);
    const triMesh = new THREE.Mesh(triGeo, this.materials.darkSteel);
    group.add(triMesh);

    // Pin cylinder at apex
    const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16);
    pinGeo.rotateX(Math.PI / 2);
    pinGeo.translate(0, height, 0);
    const pinMesh = new THREE.Mesh(pinGeo, this.materials.brass);
    group.add(pinMesh);

    // Two roller cylinders
    const rollerR = height * 0.11;
    const rollerGeo = new THREE.CylinderGeometry(rollerR, rollerR, 0.2, 16);
    rollerGeo.rotateX(Math.PI / 2);

    const r1 = new THREE.Mesh(rollerGeo, this.materials.steel);
    r1.position.set(-height * 0.25, rollerR, 0);
    group.add(r1);

    const r2 = new THREE.Mesh(rollerGeo, this.materials.steel);
    r2.position.set(height * 0.25, rollerR, 0);
    group.add(r2);

    // Ground base plate
    const baseGeo = new THREE.BoxGeometry(height * 1.3, 0.04, 0.25);
    baseGeo.translate(0, -0.02, 0);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.darkSteel);
    group.add(baseMesh);

    return group;
  }

  /**
   * Fixed / Cantilever Support (vertical back wall plate with ground hatch)
   */
  public static createFixedSupport(height: number = 1.0, depth: number = 0.3): THREE.Group {
    const group = new THREE.Group();

    const wallGeo = new THREE.BoxGeometry(0.08, height, depth);
    const wallMesh = new THREE.Mesh(wallGeo, this.materials.darkSteel);
    group.add(wallMesh);

    // Hatch ridges
    for (let y = -height / 2 + 0.1; y < height / 2; y += 0.15) {
      const ridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, depth * 0.9, 8);
      ridgeGeo.rotateX(Math.PI / 2);
      ridgeGeo.translate(-0.04, y, 0);
      const ridge = new THREE.Mesh(ridgeGeo, this.materials.steel);
      group.add(ridge);
    }

    return group;
  }

  /**
   * Pulley assembly (rim wheel + groove + bracket)
   */
  public static createPulley(radius: number = 0.35, thickness: number = 0.1): THREE.Group {
    const group = new THREE.Group();

    // Wheel
    const wheelGeo = new THREE.CylinderGeometry(radius, radius, thickness, 32);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMesh = new THREE.Mesh(wheelGeo, this.materials.steel);
    group.add(wheelMesh);

    // Inner grove indenter
    const hubGeo = new THREE.CylinderGeometry(radius * 0.3, radius * 0.3, thickness * 1.2, 24);
    hubGeo.rotateX(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, this.materials.brass);
    group.add(hubMesh);

    // Axle pin
    const axleGeo = new THREE.CylinderGeometry(radius * 0.1, radius * 0.1, thickness * 1.8, 16);
    axleGeo.rotateX(Math.PI / 2);
    const axleMesh = new THREE.Mesh(axleGeo, this.materials.darkSteel);
    group.add(axleMesh);

    return group;
  }

  /**
   * Structural Beam (Rectangular or I-Beam)
   */
  public static createBeam(length: number, height: number = 0.2, depth: number = 0.15, type: 'rect' | 'i-beam' = 'rect'): THREE.Group {
    const group = new THREE.Group();

    if (type === 'rect') {
      const geo = new THREE.BoxGeometry(length, height, depth);
      const mesh = new THREE.Mesh(geo, this.materials.steel);
      mesh.castShadow = true;
      group.add(mesh);
    } else {
      // I-Beam: Top flange, web, bottom flange
      const flangeH = height * 0.2;
      const webT = depth * 0.3;

      const topFlange = new THREE.Mesh(new THREE.BoxGeometry(length, flangeH, depth), this.materials.steel);
      topFlange.position.y = (height - flangeH) / 2;
      group.add(topFlange);

      const botFlange = new THREE.Mesh(new THREE.BoxGeometry(length, flangeH, depth), this.materials.steel);
      botFlange.position.y = -(height - flangeH) / 2;
      group.add(botFlange);

      const web = new THREE.Mesh(new THREE.BoxGeometry(length, height - 2 * flangeH, webT), this.materials.steel);
      group.add(web);
    }

    return group;
  }

  /**
   * Tension Cable between two 3D points
   */
  public static createCable(p1: THREE.Vector3, p2: THREE.Vector3, radius: number = 0.015): THREE.Mesh {
    const dist = p1.distanceTo(p2);
    const geo = new THREE.CylinderGeometry(radius, radius, Math.max(0.001, dist), 12);
    geo.translate(0, dist / 2, 0);

    const mesh = new THREE.Mesh(geo, this.materials.cable);
    mesh.position.copy(p1);

    const up = new THREE.Vector3(0, 1, 0);
    const dir = p2.clone().sub(p1).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    mesh.setRotationFromQuaternion(quat);

    return mesh;
  }

  /**
   * Hanging mass load (Cylinder with top eyelet)
   */
  public static createHangingLoad(_massKg: number, radius: number = 0.25, height: number = 0.4): THREE.Group {
    const group = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 24);
    bodyGeo.translate(0, -height / 2, 0);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.darkSteel);
    group.add(bodyMesh);

    // Top loop eyelet
    const eyeletGeo = new THREE.TorusGeometry(0.06, 0.015, 12, 24);
    eyeletGeo.translate(0, 0.06, 0);
    const eyeletMesh = new THREE.Mesh(eyeletGeo, this.materials.brass);
    group.add(eyeletMesh);

    return group;
  }

  /**
   * Block on inclined plane / surface
   */
  public static createBlock(width: number = 0.5, height: number = 0.35, depth: number = 0.4, mat: 'wood' | 'steel' | 'rubber' = 'wood'): THREE.Mesh {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const material = mat === 'steel' ? this.materials.steel : mat === 'rubber' ? this.materials.rubber : this.materials.wood;
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true;
    return mesh;
  }

  /**
   * Leaning Ladder with side rails and rungs
   */
  public static createLadder(length: number = 4.0, width: number = 0.6, rungCount: number = 10): THREE.Group {
    const group = new THREE.Group();
    const railRadius = 0.035;
    const rungRadius = 0.02;

    // Left & Right Rails
    const railGeo = new THREE.CylinderGeometry(railRadius, railRadius, length, 16);
    railGeo.translate(0, length / 2, 0);

    const leftRail = new THREE.Mesh(railGeo, this.materials.steel);
    leftRail.position.x = -width / 2;
    group.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, this.materials.steel);
    rightRail.position.x = width / 2;
    group.add(rightRail);

    // Rungs
    const step = length / (rungCount + 1);
    for (let i = 1; i <= rungCount; i++) {
      const rungGeo = new THREE.CylinderGeometry(rungRadius, rungRadius, width, 12);
      rungGeo.rotateZ(Math.PI / 2);
      rungGeo.translate(0, i * step, 0);
      const rungMesh = new THREE.Mesh(rungGeo, this.materials.brass);
      group.add(rungMesh);
    }

    return group;
  }

  /**
   * Helical 3D procedural spring
   */
  public static createSpring(length: number = 1.0, radius: number = 0.12, coils: number = 8, wireRadius: number = 0.018): THREE.Mesh {
    const points: THREE.Vector3[] = [];
    const totalSamples = coils * 32;

    for (let i = 0; i <= totalSamples; i++) {
      const t = i / totalSamples;
      const angle = t * coils * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = t * length;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, totalSamples, wireRadius, 8, false);
    return new THREE.Mesh(tubeGeo, this.materials.spring);
  }

  /**
   * Wheel with hub, rim, and axle
   */
  public static createWheel(radius: number = 0.5, thickness: number = 0.2): THREE.Group {
    const group = new THREE.Group();

    // Tire rim
    const rimGeo = new THREE.CylinderGeometry(radius, radius, thickness, 32);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, this.materials.rubber);
    group.add(rimMesh);

    // Inner hub
    const hubGeo = new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, thickness * 1.05, 24);
    hubGeo.rotateZ(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, this.materials.steel);
    group.add(hubMesh);

    // Center axle
    const axleGeo = new THREE.CylinderGeometry(radius * 0.12, radius * 0.12, thickness * 1.5, 16);
    axleGeo.rotateZ(Math.PI / 2);
    const axleMesh = new THREE.Mesh(axleGeo, this.materials.darkSteel);
    group.add(axleMesh);

    return group;
  }

  /**
   * Laboratory Ground Plane with reference grid
   */
  public static createGround(sizeX: number = 16, sizeZ: number = 16): THREE.Group {
    const group = new THREE.Group();

    const planeGeo = new THREE.PlaneGeometry(sizeX, sizeZ);
    planeGeo.rotateX(-Math.PI / 2);
    const planeMesh = new THREE.Mesh(planeGeo, this.materials.ground);
    planeMesh.receiveShadow = true;
    group.add(planeMesh);

    const grid = new THREE.GridHelper(Math.max(sizeX, sizeZ), Math.round(Math.max(sizeX, sizeZ)), 0x94a3b8, 0xe2e8f0);
    grid.position.y = 0.001;
    group.add(grid);

    return group;
  }
}
