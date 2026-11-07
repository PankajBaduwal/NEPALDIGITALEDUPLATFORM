/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * MolecularBuilder System
 *
 * Provides standardized CPK element colors, van der Waals radii, ball-and-stick
 * bonds, space-filling representations, and curved electron-movement arrows.
 */

import * as THREE from 'three';

export interface ElementData {
  symbol: string;
  name: string;
  atomicNumber: number;
  cpkColor: number;
  covalentRadius: number;
  vdwRadius: number;
}

export const ELEMENT_DATA: Record<string, ElementData> = {
  H:  { symbol: 'H',  name: 'Hydrogen',   atomicNumber: 1,  cpkColor: 0xd1d5db, covalentRadius: 0.31, vdwRadius: 0.55 },
  C:  { symbol: 'C',  name: 'Carbon',     atomicNumber: 6,  cpkColor: 0x334155, covalentRadius: 0.76, vdwRadius: 0.85 },
  N:  { symbol: 'N',  name: 'Nitrogen',   atomicNumber: 7,  cpkColor: 0x3b82f6, covalentRadius: 0.71, vdwRadius: 0.80 },
  O:  { symbol: 'O',  name: 'Oxygen',     atomicNumber: 8,  cpkColor: 0xef4444, covalentRadius: 0.66, vdwRadius: 0.75 },
  F:  { symbol: 'F',  name: 'Fluorine',   atomicNumber: 9,  cpkColor: 0x86efac, covalentRadius: 0.57, vdwRadius: 0.70 },
  P:  { symbol: 'P',  name: 'Phosphorus', atomicNumber: 15, cpkColor: 0xf97316, covalentRadius: 1.07, vdwRadius: 1.00 },
  S:  { symbol: 'S',  name: 'Sulfur',     atomicNumber: 16, cpkColor: 0xeab308, covalentRadius: 1.05, vdwRadius: 1.00 },
  Cl: { symbol: 'Cl', name: 'Chlorine',   atomicNumber: 17, cpkColor: 0x22c55e, covalentRadius: 1.02, vdwRadius: 0.95 },
  Br: { symbol: 'Br', name: 'Bromine',    atomicNumber: 35, cpkColor: 0x991b1b, covalentRadius: 1.20, vdwRadius: 1.10 },
  I:  { symbol: 'I',  name: 'Iodine',     atomicNumber: 53, cpkColor: 0x7c3aed, covalentRadius: 1.39, vdwRadius: 1.25 },
  Fe: { symbol: 'Fe', name: 'Iron',       atomicNumber: 26, cpkColor: 0xe2e8f0, covalentRadius: 1.32, vdwRadius: 1.15 },
  Cu: { symbol: 'Cu', name: 'Copper',     atomicNumber: 29, cpkColor: 0xb45309, covalentRadius: 1.22, vdwRadius: 1.15 },
  Zn: { symbol: 'Zn', name: 'Zinc',       atomicNumber: 30, cpkColor: 0x94a3b8, covalentRadius: 1.22, vdwRadius: 1.15 },
  Pb: { symbol: 'Pb', name: 'Lead',       atomicNumber: 82, cpkColor: 0x64748b, covalentRadius: 1.46, vdwRadius: 1.25 },
  Pt: { symbol: 'Pt', name: 'Platinum',   atomicNumber: 78, cpkColor: 0xd1d5db, covalentRadius: 1.36, vdwRadius: 1.20 },
};

export class MolecularBuilder {
  private static materialCache = new Map<string, THREE.MeshStandardMaterial>();

  public static getMaterial(color: number, roughness = 0.35, metalness = 0.15, transparent = false, opacity = 1.0): THREE.MeshStandardMaterial {
    const key = `${color}_${roughness}_${metalness}_${transparent}_${opacity}`;
    if (!this.materialCache.has(key)) {
      this.materialCache.set(
        key,
        new THREE.MeshStandardMaterial({
          color,
          roughness,
          metalness,
          transparent,
          opacity,
        })
      );
    }
    return this.materialCache.get(key)!;
  }

  public static createAtom(
    element: string,
    position: [number, number, number] | THREE.Vector3,
    scaleFactor = 0.45,
    customColorOrId?: number | string,
    componentId?: string
  ): THREE.Mesh {
    const fallback = { symbol: 'C', name: 'Carbon', atomicNumber: 6, cpkColor: 0x334155, covalentRadius: 0.77, vdwRadius: 1.70 };
    const data = ELEMENT_DATA[element] || ELEMENT_DATA['C'] || fallback;
    const radius = data.covalentRadius * scaleFactor;
    let color = data.cpkColor;
    let cId = componentId;

    if (typeof customColorOrId === 'number') {
      color = customColorOrId;
    } else if (typeof customColorOrId === 'string') {
      cId = customColorOrId;
    }

    // Use cached geometry or build with 24 segments
    const segments = 24;
    const geo = new THREE.SphereGeometry(radius, segments, segments);
    const mat = this.getMaterial(color, 0.3, 0.1);
    const mesh = new THREE.Mesh(geo, mat);

    if (Array.isArray(position)) {
      mesh.position.set(...position);
    } else {
      mesh.position.copy(position);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { element: data.symbol, name: data.name, componentId: cId };
    return mesh;
  }

  public static createBond(
    pos1: THREE.Vector3,
    pos2: THREE.Vector3,
    orderOrRadius: 1 | 2 | 3 | number = 1,
    radiusOrColor: number = 0.065,
    customColor: number = 0xcbd5e1
  ): THREE.Group {
    let order: 1 | 2 | 3 = 1;
    let radius = 0.065;
    let color = customColor;

    if (orderOrRadius === 1 || orderOrRadius === 2 || orderOrRadius === 3) {
      order = orderOrRadius as 1 | 2 | 3;
      radius = radiusOrColor;
      color = customColor;
    } else {
      // orderOrRadius is the radius, radiusOrColor is the color
      radius = orderOrRadius;
      color = radiusOrColor;
      order = 1;
    }

    const group = new THREE.Group();
    const dir = new THREE.Vector3().subVectors(pos2, pos1);
    const length = dir.length();
    const mid = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);

    const offsetDir = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
    if (offsetDir.lengthSq() < 0.01) {
      offsetDir.set(1, 0, 0).cross(dir).normalize();
    }

    const offsets: number[] =
      order === 1 ? [0] : order === 2 ? [-0.09, 0.09] : [-0.12, 0, 0.12];

    const mat = this.getMaterial(color, 0.4, 0.2);

    for (const off of offsets) {
      const geo = new THREE.CylinderGeometry(radius, radius, length, 12);
      const cylinder = new THREE.Mesh(geo, mat);

      cylinder.position.copy(mid);
      if (off !== 0) {
        cylinder.position.addScaledVector(offsetDir, off);
      }

      // Orient cylinder along dir
      const rotAxis = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
      const rotAngle = Math.acos(new THREE.Vector3(0, 1, 0).dot(dir.clone().normalize()));
      if (rotAxis.lengthSq() > 0.001) {
        cylinder.setRotationFromAxisAngle(rotAxis, rotAngle);
      } else if (dir.y < 0) {
        cylinder.rotation.x = Math.PI;
      }

      cylinder.castShadow = true;
      group.add(cylinder);
    }

    return group;
  }

  /**
   * Curved electron movement arrow for organic reaction mechanisms (SN1, SN2, E1, E2, Arenium)
   */
  public static createCurvedArrow(
    startPos: THREE.Vector3,
    targetOrApex: THREE.Vector3,
    apexOrTarget?: number | THREE.Vector3,
    color = 0x38bdf8,
    _thickness = 0.03
  ): THREE.Group {
    const group = new THREE.Group();
    let mid: THREE.Vector3;
    let endPos: THREE.Vector3;
    let arrowColor = color;

    if (apexOrTarget instanceof THREE.Vector3) {
      // Called as: (startPos, midPos, endPos, color, thickness)
      mid = targetOrApex;
      endPos = apexOrTarget;
      arrowColor = typeof color === 'number' ? color : 0x38bdf8;
    } else {
      // Called as: (startPos, endPos, apexHeight, color)
      endPos = targetOrApex;
      const apexHeight = typeof apexOrTarget === 'number' ? apexOrTarget : 0.6;
      mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
      const normal = new THREE.Vector3(0, 1, 0);
      mid.addScaledVector(normal, apexHeight);
    }

    const curve = new THREE.QuadraticBezierCurve3(startPos, mid, endPos);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.03, 8, false);
    const mat = new THREE.MeshStandardMaterial({
      color: arrowColor,
      emissive: arrowColor,
      emissiveIntensity: 0.35,
      roughness: 0.3,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, mat);
    group.add(tubeMesh);

    // Arrowhead cone
    const tangent = curve.getTangent(1.0);
    const coneGeo = new THREE.ConeGeometry(0.09, 0.22, 12);
    const coneMesh = new THREE.Mesh(coneGeo, mat);
    coneMesh.position.copy(endPos);

    const rotAxis = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
    const rotAngle = Math.acos(new THREE.Vector3(0, 1, 0).dot(tangent));
    if (rotAxis.lengthSq() > 0.001) {
      coneMesh.setRotationFromAxisAngle(rotAxis, rotAngle);
    }
    group.add(coneMesh);

    return group;
  }
}
