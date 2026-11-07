/**
 * 3D Chip Formation and Cutting Mechanics Simulation Scene (Unit I / Exp 5)
 * Visualizes Orthogonal Cutting, Primary Shear Zone (φ), Tool Rake (α),
 * Chip flow, Built-Up Edge (BUE), and 3D Merchant Circle Force Vectors.
 */

import * as THREE from 'three';
import { BaseMachiningSimulation } from '../BaseMachiningSimulation';
import type { ChipType, WorkpieceMaterialId } from '../../core/types';
import { MachiningCalculator } from '../../core/MachiningCalculator';

export class ChipFormationMechanicsScene extends BaseMachiningSimulation {
  private mechanicsGroup = new THREE.Group();
  private workpieceMesh!: THREE.Mesh;
  private cuttingToolMesh!: THREE.Mesh;
  private chipRibbonMesh!: THREE.Mesh;
  private shearPlaneMesh!: THREE.Mesh;
  private bueMesh!: THREE.Mesh;
  private forceVectorsGroup = new THREE.Group();
  private flowParticles!: THREE.Points;
  private flowPositions!: Float32Array;

  // Process Parameters
  private rakeAngleDeg = 15;
  private uncutChipThicknessMm = 0.3;
  private cuttingSpeedMMin = 60;
  private chipType: ChipType = 'continuous';
  private materialId: WorkpieceMaterialId = 'mild-steel';
  private isBUEEnabled = false;
  private showForceVectors = true;

  private particleCount = 240;
  private animProgress = 0;

  constructor(container: HTMLElement) {
    super(container);
    this.scene.add(this.mechanicsGroup);
    this.mechanicsGroup.add(this.forceVectorsGroup);
    this.buildOrthogonalCuttingModel();
    this.resetCamera(8, 1.8, Math.PI / 4, Math.PI / 3.4);
  }

  private buildOrthogonalCuttingModel(): void {
    // 1. Unmachined Workpiece Base (moves right to left towards cutting tool)
    const workGeo = new THREE.BoxGeometry(6.0, 2.0, 2.4);
    const workMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.8,
      roughness: 0.4,
    });
    this.workpieceMesh = new THREE.Mesh(workGeo, workMat);
    this.workpieceMesh.position.set(-1.0, 1.0, 0);
    this.workpieceMesh.castShadow = true;
    this.mechanicsGroup.add(this.workpieceMesh);

    // 2. Single-Point Cutting Tool Wedge
    this.updateToolMesh();

    // 3. Primary Shear Plane Zone Indicator (Angle φ)
    const shearGeo = new THREE.PlaneGeometry(1.6, 2.4);
    const shearMat = new THREE.MeshBasicMaterial({
      color: 0xef4444, // Red heat zone
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    this.shearPlaneMesh = new THREE.Mesh(shearGeo, shearMat);
    this.mechanicsGroup.add(this.shearPlaneMesh);

    // 4. Built-Up Edge (BUE) Wedge on Tool Tip
    const bueGeo = new THREE.ConeGeometry(0.2, 0.4, 4);
    const bueMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Cold worked hardened metal cap
      roughness: 0.7,
      metalness: 0.6,
    });
    this.bueMesh = new THREE.Mesh(bueGeo, bueMat);
    this.bueMesh.position.set(1.1, 2.0, 0);
    this.bueMesh.rotation.z = -Math.PI / 3;
    this.bueMesh.visible = false;
    this.mechanicsGroup.add(this.bueMesh);

    // 5. Curled Chip Geometry
    this.updateChipMesh();

    // 6. Plastic Flow Streamline Particles
    this.setupFlowParticles();

    // 7. Merchant Circle Force Vectors
    this.updateForceVectors();
  }

  private updateToolMesh(): void {
    if (this.cuttingToolMesh) {
      if (this.cuttingToolMesh.geometry) this.cuttingToolMesh.geometry.dispose();
      this.mechanicsGroup.remove(this.cuttingToolMesh);
    }

    const alphaRad = (this.rakeAngleDeg * Math.PI) / 180;
    const clearanceRad = (6 * Math.PI) / 180;

    // Tool wedge vertices (cutting edge at x=1.0, y=2.0)
    const vertices = new Float32Array([
      // Front (Z = 1.2)
      1.0, 2.0, 1.2,                                    // Cutting tip
      1.0 + Math.sin(clearanceRad) * 2.0, 0.0, 1.2,     // Flank bottom
      3.2, 0.0, 1.2,                                    // Base
      3.2, 3.5, 1.2,                                    // Top right
      1.0 + Math.sin(alphaRad) * 2.0, 2.0 + Math.cos(alphaRad) * 2.0, 1.2, // Rake top

      // Back (Z = -1.2)
      1.0, 2.0, -1.2,
      1.0 + Math.sin(clearanceRad) * 2.0, 0.0, -1.2,
      3.2, 0.0, -1.2,
      3.2, 3.5, -1.2,
      1.0 + Math.sin(alphaRad) * 2.0, 2.0 + Math.cos(alphaRad) * 2.0, -1.2,
    ]);

    const indices = [
      0, 1, 2,  0, 2, 3,  0, 3, 4, // Front face
      5, 7, 6,  5, 8, 7,  5, 9, 8, // Back face
      0, 5, 6,  0, 6, 1,           // Flank face
      1, 6, 7,  1, 7, 2,           // Bottom face
      2, 7, 8,  2, 8, 3,           // Back shank face
      3, 8, 9,  3, 9, 4,           // Top face
      4, 9, 5,  4, 5, 0,           // Rake face
    ];

    const toolGeo = new THREE.BufferGeometry();
    toolGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    toolGeo.setIndex(indices);
    toolGeo.computeVertexNormals();

    const toolMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Golden Titanium Nitride
      metalness: 0.9,
      roughness: 0.25,
    });
    this.cuttingToolMesh = new THREE.Mesh(toolGeo, toolMat);
    this.mechanicsGroup.add(this.cuttingToolMesh);
  }

  private updateChipMesh(): void {
    if (this.chipRibbonMesh) {
      if (this.chipRibbonMesh.geometry) this.chipRibbonMesh.geometry.dispose();
      this.mechanicsGroup.remove(this.chipRibbonMesh);
    }

    const alphaRad = (this.rakeAngleDeg * Math.PI) / 180;
    const forces = MachiningCalculator.calculateMerchantForces({
      rakeAngleDeg: this.rakeAngleDeg,
      uncutChipThicknessMm: this.uncutChipThicknessMm,
      widthOfCutMm: 3.0,
      cuttingSpeedMMin: this.cuttingSpeedMMin,
      materialId: this.materialId,
    });

    const phiRad = forces.shearAngleRad;

    // Position Shear plane visual mesh
    if (this.shearPlaneMesh) {
      this.shearPlaneMesh.rotation.y = Math.PI / 2;
      this.shearPlaneMesh.rotation.x = -phiRad;
      this.shearPlaneMesh.position.set(0.6, 2.3, 0);
    }

    // Build curved chip extrusion along spiral path
    const points: THREE.Vector3[] = [];
    const numPoints = 28;
    const chipThickScale = forces.chipThicknessMm * 2.0;

    for (let i = 0; i <= numPoints; i++) {
      const u = i / numPoints;
      if (this.chipType === 'discontinuous') {
        // Segmented broken chip
        const x = 1.0 + Math.sin(alphaRad) * (u * 1.6);
        const y = 2.0 + Math.cos(alphaRad) * (u * 1.6);
        points.push(new THREE.Vector3(x, y, 0));
      } else {
        // Continuous curling spiral ribbon
        const spiralRadius = 1.0 + u * 0.8;
        const spiralAngle = alphaRad + u * 2.4;
        const x = 1.0 + Math.sin(spiralAngle) * spiralRadius;
        const y = 2.0 + Math.cos(spiralAngle) * spiralRadius;
        points.push(new THREE.Vector3(x, y, 0));
      }
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const chipGeo = new THREE.TubeGeometry(curve, 32, 0.25 + chipThickScale * 0.1, 12, false);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.3,
    });
    this.chipRibbonMesh = new THREE.Mesh(chipGeo, chipMat);
    this.mechanicsGroup.add(this.chipRibbonMesh);
  }

  private setupFlowParticles(): void {
    const pGeo = new THREE.BufferGeometry();
    this.flowPositions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      this.flowPositions[idx] = -3.5 + Math.random() * 4.0;
      this.flowPositions[idx + 1] = 1.0 + Math.random() * 1.0;
      this.flowPositions[idx + 2] = (Math.random() - 0.5) * 2.0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.flowPositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
    });
    this.flowParticles = new THREE.Points(pGeo, pMat);
    this.mechanicsGroup.add(this.flowParticles);
  }

  private updateForceVectors(): void {
    while (this.forceVectorsGroup.children.length > 0) {
      const child = this.forceVectorsGroup.children[0];
      if (child) {
        this.forceVectorsGroup.remove(child);
      } else {
        break;
      }
    }

    if (!this.showForceVectors) return;

    const forces = MachiningCalculator.calculateMerchantForces({
      rakeAngleDeg: this.rakeAngleDeg,
      uncutChipThicknessMm: this.uncutChipThicknessMm,
      widthOfCutMm: 3.0,
      cuttingSpeedMMin: this.cuttingSpeedMMin,
      materialId: this.materialId,
    });

    const origin = new THREE.Vector3(1.0, 2.0, 1.4);
    const scale = 0.0016; // 1000 N -> 1.6 units

    // 1. Cutting Force Fc (Green - in direction of cutting motion: -X)
    const dirFc = new THREE.Vector3(-1, 0, 0);
    const lenFc = Math.max(0.4, forces.cuttingForceFc * scale);
    const arrowFc = new THREE.ArrowHelper(dirFc, origin, lenFc, 0x10b981, 0.3, 0.18);
    this.forceVectorsGroup.add(arrowFc);

    // 2. Thrust Force Ft (Blue - perpendicular: -Y)
    const dirFt = new THREE.Vector3(0, -1, 0);
    const lenFt = Math.max(0.2, forces.thrustForceFt * scale);
    const arrowFt = new THREE.ArrowHelper(dirFt, origin, lenFt, 0x38bdf8, 0.25, 0.15);
    this.forceVectorsGroup.add(arrowFt);

    // 3. Resultant Force R (Purple)
    const dirR = new THREE.Vector3(-forces.cuttingForceFc, -forces.thrustForceFt, 0).normalize();
    const lenR = Math.max(0.5, forces.resultantForceR * scale);
    const arrowR = new THREE.ArrowHelper(dirR, origin, lenR, 0xa855f7, 0.35, 0.2);
    this.forceVectorsGroup.add(arrowR);

    // 4. Shear Force Fs (Red - along shear plane)
    const phi = forces.shearAngleRad;
    const dirFs = new THREE.Vector3(-Math.cos(phi), Math.sin(phi), 0).normalize();
    const lenFs = Math.max(0.3, forces.shearForceFs * scale);
    const arrowFs = new THREE.ArrowHelper(dirFs, origin, lenFs, 0xef4444, 0.25, 0.15);
    this.forceVectorsGroup.add(arrowFs);

    // 5. Friction Force F (Orange - along rake face)
    const alpha = forces.rakeAngleRad;
    const dirF = new THREE.Vector3(Math.sin(alpha), Math.cos(alpha), 0).normalize();
    const lenF = Math.max(0.3, forces.frictionForceF * scale);
    const arrowF = new THREE.ArrowHelper(dirF, origin, lenF, 0xf97316, 0.25, 0.15);
    this.forceVectorsGroup.add(arrowF);
  }

  public updateAnimation(delta: number, _elapsed: number): void {
    // Flow metal grain particles through shear plane into chip
    const pos = this.flowPositions;
    if (!pos || !this.flowParticles) return;
    const speed = (this.cuttingSpeedMMin / 60) * 1.5;
    const alphaRad = (this.rakeAngleDeg * Math.PI) / 180;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const curX = pos[idx] ?? 0;
      const curY = pos[idx + 1] ?? 0;
      if (curX < 1.0) {
        // Approaching shear plane in horizontal workpiece
        pos[idx] = curX + delta * speed;
      } else {
        // Crossed shear plane: flows up tool rake face
        pos[idx] = curX + delta * speed * Math.sin(alphaRad) * 0.6;
        pos[idx + 1] = curY + delta * speed * Math.cos(alphaRad) * 0.6;

        // Reset if leaving chip top
        if ((pos[idx + 1] ?? 0) > 4.5) {
          pos[idx] = -3.5 + Math.random() * 1.0;
          pos[idx + 1] = 1.0 + Math.random() * 1.0;
        }
      }
    }
    const positionAttr = this.flowParticles.geometry.attributes.position;
    if (positionAttr) {
      positionAttr.needsUpdate = true;
    }
  }

  public updateParameters(params: {
    rakeAngleDeg?: number;
    uncutChipThicknessMm?: number;
    cuttingSpeedMMin?: number;
    chipType?: ChipType;
    materialId?: WorkpieceMaterialId;
    isBUEEnabled?: boolean;
    showVectors?: boolean;
  }): void {
    if (params.rakeAngleDeg !== undefined) this.rakeAngleDeg = params.rakeAngleDeg;
    if (params.uncutChipThicknessMm !== undefined) this.uncutChipThicknessMm = params.uncutChipThicknessMm;
    if (params.cuttingSpeedMMin !== undefined) this.cuttingSpeedMMin = params.cuttingSpeedMMin;
    if (params.chipType !== undefined) this.chipType = params.chipType;
    if (params.materialId !== undefined) this.materialId = params.materialId;
    if (params.isBUEEnabled !== undefined) {
      this.isBUEEnabled = params.isBUEEnabled;
      this.bueMesh.visible = this.isBUEEnabled;
    }
    if (params.showVectors !== undefined) {
      this.showForceVectors = params.showVectors;
    }

    this.updateToolMesh();
    this.updateChipMesh();
    this.updateForceVectors();
  }
}
