/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * VectorRenderer — 3D Mechanical Vector & Moment Visualizer
 *
 * Implements high-precision 3D engineering representations:
 * - Direct vector arrows (cylindrical shaft + cone head)
 * - Curved moment/torque arrows (torus-arc + directional arrowhead)
 * - Component decomposition projection guides (dashed projection lines)
 * - Distributed load arrays (UDL & UVL force profiles with envelope header)
 * - Coordinate triad reference frames
 */

import * as THREE from 'three';

export interface ForceVectorOptions {
  shaftRadius?: number;
  headRadius?: number;
  headLength?: number;
  opacity?: number;
}

export class VectorRenderer {
  /**
   * Universal helper creating a force vector arrow from an object config
   */
  public static createArrow(params: {
    origin: THREE.Vector3;
    direction: THREE.Vector3;
    length: number;
    color: number;
    shaftRadius?: number;
    headRadius?: number;
    headLength?: number;
  }): THREE.Group {
    const dirNorm = params.direction.clone().normalize().multiplyScalar(params.length);
    return this.createForceArrow(params.origin, dirNorm, params.color, {
      shaftRadius: params.shaftRadius,
      headRadius: params.headRadius,
      headLength: params.headLength,
    });
  }

  /**
   * Constructs a 3D cylindrical force vector arrow with a conical tip
   */
  public static createForceArrow(
    origin: THREE.Vector3,
    directionAndMag: THREE.Vector3,
    colorHex: number = 0x2563eb,
    options: ForceVectorOptions = {}
  ): THREE.Group {
    const group = new THREE.Group();
    const length = directionAndMag.length();
    if (length < 0.001) return group;

    const shaftRadius = options.shaftRadius ?? 0.035;
    const headLength = Math.min(options.headLength ?? 0.35, length * 0.4);
    const headRadius = options.headRadius ?? shaftRadius * 2.8;
    const shaftLength = Math.max(0.001, length - headLength);

    // Material
    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.25,
      metalness: 0.6,
      transparent: (options.opacity ?? 1.0) < 1.0,
      opacity: options.opacity ?? 1.0,
    });

    // Shaft (Cylinder)
    const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLength, 16);
    shaftGeo.translate(0, shaftLength / 2, 0); // anchor at base
    const shaftMesh = new THREE.Mesh(shaftGeo, material);
    group.add(shaftMesh);

    // Head (Cone)
    const headGeo = new THREE.ConeGeometry(headRadius, headLength, 16);
    headGeo.translate(0, shaftLength + headLength / 2, 0);
    const headMesh = new THREE.Mesh(headGeo, material);
    group.add(headMesh);

    // Orient group along target vector
    group.position.copy(origin);
    const up = new THREE.Vector3(0, 1, 0);
    const dirNorm = directionAndMag.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dirNorm);
    group.setRotationFromQuaternion(quat);

    return group;
  }

  /**
   * Constructs a curved arc moment vector arrow around an axis
   */
  public static createCurvedMomentArrow(
    center: THREE.Vector3,
    radius: number = 0.6,
    startAngleRad: number = 0,
    endAngleRad: number = Math.PI * 1.3,
    clockwise: boolean = false,
    colorHex: number = 0xd97706
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(center);

    const tubeRadius = 0.03;
    const curvePoints: THREE.Vector3[] = [];
    const segments = 32;

    const angleSpan = endAngleRad - startAngleRad;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = clockwise ? startAngleRad - t * angleSpan : startAngleRad + t * angleSpan;
      curvePoints.push(new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0));
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, tubeRadius, 12, false);
    const material = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.2,
      metalness: 0.7,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, material);
    group.add(tubeMesh);

    // Arrowhead at endpoint
    const endPoint = curvePoints[curvePoints.length - 1]!;
    const prevPoint = curvePoints[curvePoints.length - 2]!;
    const tangent = endPoint.clone().sub(prevPoint).normalize();

    const coneGeo = new THREE.ConeGeometry(tubeRadius * 3.0, 0.2, 16);
    coneGeo.translate(0, 0.1, 0);
    const coneMesh = new THREE.Mesh(coneGeo, material);
    coneMesh.position.copy(endPoint);

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, tangent);
    coneMesh.setRotationFromQuaternion(quat);
    group.add(coneMesh);

    return group;
  }

  /**
   * Creates dashed lines illustrating Cartesian components (Fx along X, Fy along Y)
   */
  public static createDecompositionGuides(
    origin: THREE.Vector3,
    vector: THREE.Vector3,
    colorHex: number = 0x94a3b8
  ): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.LineDashedMaterial({
      color: colorHex,
      dashSize: 0.1,
      gapSize: 0.06,
    });

    const p0 = origin.clone();
    const pX = origin.clone().add(new THREE.Vector3(vector.x, 0, 0));
    const pXY = origin.clone().add(new THREE.Vector3(vector.x, vector.y, 0));
    const pXYZ = origin.clone().add(vector);

    // Line from p0 to pX
    const geoX = new THREE.BufferGeometry().setFromPoints([p0, pX]);
    const lineX = new THREE.Line(geoX, mat);
    lineX.computeLineDistances();
    group.add(lineX);

    // Line from pX to pXY
    const geoY = new THREE.BufferGeometry().setFromPoints([pX, pXY]);
    const lineY = new THREE.Line(geoY, mat);
    lineY.computeLineDistances();
    group.add(lineY);

    if (Math.abs(vector.z) > 0.001) {
      const geoZ = new THREE.BufferGeometry().setFromPoints([pXY, pXYZ]);
      const lineZ = new THREE.Line(geoZ, mat);
      lineZ.computeLineDistances();
      group.add(lineZ);
    }

    return group;
  }

  /**
   * Creates a series of downward force arrows representing a distributed load (UDL/UVL)
   */
  public static createDistributedLoad(
    startX: number,
    endX: number,
    y: number,
    z: number,
    qStart: number,
    qEnd: number,
    arrowCount: number = 7,
    colorHex: number = 0x0284c7
  ): THREE.Group {
    const group = new THREE.Group();
    const step = (endX - startX) / Math.max(1, arrowCount - 1);
    const topPoints: THREE.Vector3[] = [];

    for (let i = 0; i < arrowCount; i++) {
      const curX = startX + i * step;
      const t = i / (arrowCount - 1);
      const intensity = qStart + t * (qEnd - qStart);
      const height = Math.max(0.05, intensity * 0.4);

      const arrow = VectorRenderer.createForceArrow(
        new THREE.Vector3(curX, y + height, z),
        new THREE.Vector3(0, -height, 0),
        colorHex,
        { shaftRadius: 0.02, headRadius: 0.06, headLength: 0.12 }
      );
      group.add(arrow);

      topPoints.push(new THREE.Vector3(curX, y + height, z));
    }

    // Top envelope connection line
    const envelopeGeo = new THREE.BufferGeometry().setFromPoints(topPoints);
    const envelopeMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2 });
    const envelopeLine = new THREE.Line(envelopeGeo, envelopeMat);
    group.add(envelopeLine);

    return group;
  }

  /**
   * Reference Coordinate Triad (X=Red, Y=Green, Z=Blue)
   */
  public static createCoordinateTriad(size: number = 1.0): THREE.Group {
    const group = new THREE.Group();

    // X Axis - Red
    group.add(VectorRenderer.createForceArrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(size, 0, 0), 0xef4444, {
      shaftRadius: 0.02,
      headRadius: 0.05,
      headLength: 0.15,
    }));

    // Y Axis - Green
    group.add(VectorRenderer.createForceArrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, size, 0), 0x10b981, {
      shaftRadius: 0.02,
      headRadius: 0.05,
      headLength: 0.15,
    }));

    // Z Axis - Blue
    group.add(VectorRenderer.createForceArrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, size), 0x3b82f6, {
      shaftRadius: 0.02,
      headRadius: 0.05,
      headLength: 0.15,
    }));

    // Origin sphere
    const originGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const originMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const originMesh = new THREE.Mesh(originGeo, originMat);
    group.add(originMesh);

    return group;
  }
}
