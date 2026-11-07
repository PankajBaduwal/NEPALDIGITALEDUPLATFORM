/**
 * Module 1 — Interactive Metallic Crystal Structures (BCC, FCC, HCP)
 * High-fidelity 3D lattice models, unit cell sharing, and crystallographic planes
 */

import * as THREE from 'three';
import { BaseMetallurgySimulation } from '../BaseMetallurgySimulation';
import type { CrystalStructureType } from '../../core/types';

export class CrystalStructuresScene extends BaseMetallurgySimulation {
  private currentStructure: CrystalStructureType = 'bcc';
  private viewMode: 'ball-and-stick' | 'space-filling' = 'ball-and-stick';
  private showSlipPlane: boolean = true;
  private autoRotate: boolean = true;

  private latticeGroup: THREE.Group = new THREE.Group();
  private planeMesh: THREE.Mesh | null = null;
  private wireframeBox: THREE.LineSegments | null = null;

  protected initScene(): void {
    this.scene.add(this.latticeGroup);
    this.camera.position.set(3.5, 3.0, 5.0);
    this.controls.target.set(0, 1.2, 0);
    this.controls.update();
    this.buildLattice();
  }

  private buildLattice(): void {
    // Clear previous elements
    while (this.latticeGroup.children.length > 0) {
      const child = this.latticeGroup.children[0];
      if (child) {
        this.latticeGroup.remove(child);
      } else {
        break;
      }
    }

    if (this.currentStructure === 'bcc') {
      this.buildBCC();
    } else if (this.currentStructure === 'fcc') {
      this.buildFCC();
    } else {
      this.buildHCP();
    }
  }

  private buildBCC(): void {
    const a = 2.4; // unit cell edge length in units
    const halfA = a / 2;
    // For BCC, body diagonal is 4r = a√3 => r = a√3 / 4
    const r = this.viewMode === 'space-filling' ? (a * Math.sqrt(3)) / 4 : 0.28;

    const cornerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Sky cyan for corner atoms (1/8th shared)
      metalness: 0.8,
      roughness: 0.25,
    });
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald green for body-centered atom (100% inside)
      metalness: 0.85,
      roughness: 0.2,
    });

    const sphereGeo = new THREE.SphereGeometry(r, 32, 32);

    // 8 Corner Atoms
    const corners: [number, number, number][] = [
      [-halfA, 1.2 - halfA, -halfA],
      [halfA, 1.2 - halfA, -halfA],
      [-halfA, 1.2 + halfA, -halfA],
      [halfA, 1.2 + halfA, -halfA],
      [-halfA, 1.2 - halfA, halfA],
      [halfA, 1.2 - halfA, halfA],
      [-halfA, 1.2 + halfA, halfA],
      [halfA, 1.2 + halfA, halfA],
    ];

    corners.forEach(([x, y, z]) => {
      const mesh = new THREE.Mesh(sphereGeo, cornerMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      this.latticeGroup.add(mesh);
    });

    // 1 Body-Centred Atom
    const centerAtom = new THREE.Mesh(sphereGeo, centerMat);
    centerAtom.position.set(0, 1.2, 0);
    centerAtom.castShadow = true;
    this.latticeGroup.add(centerAtom);

    // Unit Cell Wireframe Box
    const boxGeo = new THREE.BoxGeometry(a, a, a);
    const edges = new THREE.EdgesGeometry(boxGeo);
    this.wireframeBox = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 })
    );
    this.wireframeBox.position.set(0, 1.2, 0);
    this.latticeGroup.add(this.wireframeBox);

    // Slip Plane: {110} Close-Packed Plane
    if (this.showSlipPlane) {
      const planeGeo = new THREE.PlaneGeometry(a * Math.sqrt(2), a);
      const planeMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      this.planeMesh = new THREE.Mesh(planeGeo, planeMat);
      this.planeMesh.position.set(0, 1.2, 0);
      this.planeMesh.rotation.y = Math.PI / 4;
      this.latticeGroup.add(this.planeMesh);
    }
  }

  private buildFCC(): void {
    const a = 2.6;
    const halfA = a / 2;
    // For FCC, face diagonal is 4r = a√2 => r = a√2 / 4
    const r = this.viewMode === 'space-filling' ? (a * Math.sqrt(2)) / 4 : 0.28;

    const cornerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Corner atoms (1/8 shared)
      metalness: 0.8,
      roughness: 0.25,
    });
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber gold for face center atoms (1/2 shared)
      metalness: 0.85,
      roughness: 0.2,
    });

    const sphereGeo = new THREE.SphereGeometry(r, 32, 32);

    // 8 Corner Atoms
    const corners: [number, number, number][] = [
      [-halfA, 1.2 - halfA, -halfA],
      [halfA, 1.2 - halfA, -halfA],
      [-halfA, 1.2 + halfA, -halfA],
      [halfA, 1.2 + halfA, -halfA],
      [-halfA, 1.2 - halfA, halfA],
      [halfA, 1.2 - halfA, halfA],
      [-halfA, 1.2 + halfA, halfA],
      [halfA, 1.2 + halfA, halfA],
    ];

    corners.forEach(([x, y, z]) => {
      const mesh = new THREE.Mesh(sphereGeo, cornerMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      this.latticeGroup.add(mesh);
    });

    // 6 Face-Centred Atoms
    const faces: [number, number, number][] = [
      [0, 1.2, -halfA], // Back
      [0, 1.2, halfA],  // Front
      [-halfA, 1.2, 0], // Left
      [halfA, 1.2, 0],  // Right
      [0, 1.2 + halfA, 0], // Top
      [0, 1.2 - halfA, 0], // Bottom
    ];

    faces.forEach(([x, y, z]) => {
      const mesh = new THREE.Mesh(sphereGeo, faceMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      this.latticeGroup.add(mesh);
    });

    // Wireframe edges
    const boxGeo = new THREE.BoxGeometry(a, a, a);
    const edges = new THREE.EdgesGeometry(boxGeo);
    this.wireframeBox = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 })
    );
    this.wireframeBox.position.set(0, 1.2, 0);
    this.latticeGroup.add(this.wireframeBox);

    // Slip Plane: {111} Octahedral Close-Packed Plane
    if (this.showSlipPlane) {
      const geom = new THREE.BufferGeometry();
      // Triangle connecting 3 face corners: (halfA, -halfA, -halfA), (-halfA, halfA, -halfA), (-halfA, -halfA, halfA)
      const vertices = new Float32Array([
        halfA, 1.2 - halfA, -halfA,
        -halfA, 1.2 + halfA, -halfA,
        -halfA, 1.2 - halfA, halfA,
      ]);
      geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geom.computeVertexNormals();

      const planeMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      this.planeMesh = new THREE.Mesh(geom, planeMat);
      this.latticeGroup.add(this.planeMesh);
    }
  }

  private buildHCP(): void {
    const a = 1.4; // basal hexagonal radius
    const c = a * Math.sqrt(8 / 3); // ideal c/a ≈ 1.633 => ~2.28
    const r = this.viewMode === 'space-filling' ? a / 2 : 0.25;

    const cornerMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.3 });
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
    const midMat = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.9, roughness: 0.2 }); // Pink interstitial atoms

    const sphereGeo = new THREE.SphereGeometry(r, 28, 28);

    // Top and Bottom Basal Hexagons (6 corners + 1 center on each)
    const basalAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];

    // Bottom plane y = 1.2 - c/2
    const yBottom = 1.2 - c / 2;
    basalAngles.forEach((ang) => {
      const mesh = new THREE.Mesh(sphereGeo, cornerMat);
      mesh.position.set(a * Math.cos(ang), yBottom, a * Math.sin(ang));
      this.latticeGroup.add(mesh);
    });
    const bottomCenter = new THREE.Mesh(sphereGeo, faceMat);
    bottomCenter.position.set(0, yBottom, 0);
    this.latticeGroup.add(bottomCenter);

    // Top plane y = 1.2 + c/2
    const yTop = 1.2 + c / 2;
    basalAngles.forEach((ang) => {
      const mesh = new THREE.Mesh(sphereGeo, cornerMat);
      mesh.position.set(a * Math.cos(ang), yTop, a * Math.sin(ang));
      this.latticeGroup.add(mesh);
    });
    const topCenter = new THREE.Mesh(sphereGeo, faceMat);
    topCenter.position.set(0, yTop, 0);
    this.latticeGroup.add(topCenter);

    // 3 Mid-plane atoms at y = 1.2 (in alternating triangular interstitial sites)
    const midAngles = [Math.PI / 6, (5 * Math.PI) / 6, (9 * Math.PI) / 6];
    const rMid = a * 0.58; // tucked into triangular hollows
    midAngles.forEach((ang) => {
      const mesh = new THREE.Mesh(sphereGeo, midMat);
      mesh.position.set(rMid * Math.cos(ang), 1.2, rMid * Math.sin(ang));
      this.latticeGroup.add(mesh);
    });

    // Hexagonal Prism Wireframe
    const lineMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
    const points: THREE.Vector3[] = [];

    // Bottom loop
    for (let i = 0; i <= 6; i++) {
      const ang = (i % 6) * (Math.PI / 3);
      points.push(new THREE.Vector3(a * Math.cos(ang), yBottom, a * Math.sin(ang)));
    }
    // Top loop
    for (let i = 0; i <= 6; i++) {
      const ang = (i % 6) * (Math.PI / 3);
      points.push(new THREE.Vector3(a * Math.cos(ang), yTop, a * Math.sin(ang)));
    }
    // Vertical ribs
    for (let i = 0; i < 6; i++) {
      const ang = i * (Math.PI / 3);
      points.push(new THREE.Vector3(a * Math.cos(ang), yBottom, a * Math.sin(ang)));
      points.push(new THREE.Vector3(a * Math.cos(ang), yTop, a * Math.sin(ang)));
    }
    const hexWireGeo = new THREE.BufferGeometry().setFromPoints(points);
    this.latticeGroup.add(new THREE.LineSegments(hexWireGeo, lineMat));

    // Basal slip plane {0001}
    if (this.showSlipPlane) {
      const basalGeo = new THREE.CircleGeometry(a, 6);
      const basalMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(basalGeo, basalMat);
      plane.rotation.x = Math.PI / 2;
      plane.position.y = yTop;
      this.latticeGroup.add(plane);
    }
  }

  public updateAnimation(delta: number, _elapsed: number): void {
    if (this.autoRotate) {
      this.latticeGroup.rotation.y += delta * 0.4;
    }
  }

  public updateParameters(params: {
    structure?: CrystalStructureType;
    viewMode?: 'ball-and-stick' | 'space-filling';
    showSlipPlane?: boolean;
    autoRotate?: boolean;
  }): void {
    let rebuild = false;
    if (params.structure !== undefined && params.structure !== this.currentStructure) {
      this.currentStructure = params.structure;
      rebuild = true;
    }
    if (params.viewMode !== undefined && params.viewMode !== this.viewMode) {
      this.viewMode = params.viewMode;
      rebuild = true;
    }
    if (params.showSlipPlane !== undefined && params.showSlipPlane !== this.showSlipPlane) {
      this.showSlipPlane = params.showSlipPlane;
      rebuild = true;
    }
    if (params.autoRotate !== undefined) {
      this.autoRotate = params.autoRotate;
    }

    if (rebuild) {
      this.buildLattice();
    }
  }
}
