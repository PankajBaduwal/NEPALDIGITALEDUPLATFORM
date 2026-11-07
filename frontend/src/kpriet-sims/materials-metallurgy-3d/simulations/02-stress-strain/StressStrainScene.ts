/**
 * Module 2 — Engineering Material Properties & Stress-Strain Deformation
 * 3D Dogbone specimen under tensile load with elastic deformation, necking, and cup-and-cone fracture
 */

import * as THREE from 'three';
import { BaseMetallurgySimulation } from '../BaseMetallurgySimulation';
import type { AlloyCategoryId } from '../../core/types';
import { ENGINEERING_ALLOYS_DATABASE } from '../../core/MetallurgyMaterials';
import { MetallurgyCalculator } from '../../core/MetallurgyCalculator';

export class StressStrainScene extends BaseMetallurgySimulation {
  private selectedAlloyId: AlloyCategoryId = 'mild-steel-1020';
  private appliedLoadKN: number = 0;
  private maxLoadKN: number = 45;

  private topGrip: THREE.Mesh | null = null;
  private bottomGrip: THREE.Mesh | null = null;
  private specimenMesh: THREE.Mesh | null = null;
  private upperFractureMesh: THREE.Mesh | null = null;
  private lowerFractureMesh: THREE.Mesh | null = null;
  private loadArrow: THREE.ArrowHelper | null = null;

  protected initScene(): void {
    this.camera.position.set(0, 3.2, 5.5);
    this.controls.target.set(0, 2.0, 0);
    this.controls.update();

    this.buildTestingRig();
    this.updateSpecimenDeformation();
  }

  private buildTestingRig(): void {
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate steel grips
      metalness: 0.85,
      roughness: 0.3,
    });

    const gripGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.8, 32);

    // Bottom Fixed Hydraulic Grip (y = 0.4)
    this.bottomGrip = new THREE.Mesh(gripGeo, gripMat);
    this.bottomGrip.position.set(0, 0.4, 0);
    this.bottomGrip.receiveShadow = true;
    this.scene.add(this.bottomGrip);

    // Top Moving Hydraulic Grip (y = 3.6)
    this.topGrip = new THREE.Mesh(gripGeo, gripMat);
    this.topGrip.position.set(0, 3.6, 0);
    this.topGrip.castShadow = true;
    this.scene.add(this.topGrip);

    // Upward Load Indicator Arrow
    const dir = new THREE.Vector3(0, 1, 0);
    const origin = new THREE.Vector3(0, 4.1, 0);
    this.loadArrow = new THREE.ArrowHelper(dir, origin, 1.2, 0xef4444, 0.3, 0.2);
    this.scene.add(this.loadArrow);

    this.createSpecimenMesh(1.0, 0.35);
  }

  private createSpecimenMesh(elongationFactor: number, neckRadius: number): void {
    if (this.specimenMesh) {
      this.scene.remove(this.specimenMesh);
      this.specimenMesh.geometry.dispose();
    }
    if (this.upperFractureMesh) {
      this.scene.remove(this.upperFractureMesh);
      this.upperFractureMesh.geometry.dispose();
      this.upperFractureMesh = null;
    }
    if (this.lowerFractureMesh) {
      this.scene.remove(this.lowerFractureMesh);
      this.lowerFractureMesh.geometry.dispose();
      this.lowerFractureMesh = null;
    }

    const alloy = ENGINEERING_ALLOYS_DATABASE[this.selectedAlloyId];
    const specMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.25,
    });

    // Create contoured ASTM E8 standard dogbone profile
    // Total height = 2.4 * elongationFactor
    const length = 2.4 * elongationFactor;
    const rShoulder = 0.55;
    const rGrip = 0.65;
    const rGauge = neckRadius;

    const points: THREE.Vector2[] = [
      new THREE.Vector2(rGrip, -length / 2),
      new THREE.Vector2(rGrip, -length / 2 + 0.3),
      new THREE.Vector2(rShoulder, -length / 2 + 0.5),
      new THREE.Vector2(rGauge, 0), // center neck
      new THREE.Vector2(rShoulder, length / 2 - 0.5),
      new THREE.Vector2(rGrip, length / 2 - 0.3),
      new THREE.Vector2(rGrip, length / 2),
    ];

    const latheGeo = new THREE.LatheGeometry(points, 32);
    this.specimenMesh = new THREE.Mesh(latheGeo, specMat);
    this.specimenMesh.position.set(0, 2.0, 0);
    this.specimenMesh.castShadow = true;
    this.scene.add(this.specimenMesh);
  }

  private updateSpecimenDeformation(): void {
    const alloy = ENGINEERING_ALLOYS_DATABASE[this.selectedAlloyId];
    const d0 = 12.5; // mm standard ASTM E8 bar
    const L0 = 50.0; // mm gauge length

    const res = MetallurgyCalculator.calculateTensileState({
      appliedLoadKN: this.appliedLoadKN,
      originalDiameterMm: d0,
      gaugeLengthMm: L0,
      youngsModulusGPa: alloy.youngsModulusGPa,
      yieldStrengthMPa: alloy.yieldStrengthMPa,
      ultimateTensileStrengthMPa: alloy.ultimateTensileStrengthMPa,
      fractureStrain: (alloy.percentElongation / 100) * 1.4,
    });

    if (res.isFractured) {
      // Split specimen into cup-and-cone fractured halves
      if (this.specimenMesh) {
        this.scene.remove(this.specimenMesh);
      }

      if (!this.upperFractureMesh) {
        const halfMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.3 });
        const coneGeo = new THREE.ConeGeometry(0.24, 0.8, 24);
        const cupGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.8, 24);

        this.upperFractureMesh = new THREE.Mesh(coneGeo, halfMat);
        this.upperFractureMesh.position.set(0, 2.65, 0);
        this.scene.add(this.upperFractureMesh);

        this.lowerFractureMesh = new THREE.Mesh(cupGeo, halfMat);
        this.lowerFractureMesh.position.set(0, 1.35, 0);
        this.scene.add(this.lowerFractureMesh);
      }

      if (this.topGrip) this.topGrip.position.y = 3.9;
    } else {
      const elongationFactor = 1.0 + Math.min(0.4, res.engineeringStrain * 1.8);
      // Necking radius contracts as necking intensifies
      let neckR = 0.35 * (1.0 - res.engineeringStrain * 0.4);
      if (res.isNecking) {
        neckR = 0.24; // pronounced localized neck
      }

      this.createSpecimenMesh(elongationFactor, Math.max(0.2, neckR));

      // Move top grip upward proportionally
      const topY = 2.0 + (1.2 * elongationFactor) + 0.4;
      if (this.topGrip) this.topGrip.position.y = topY;
      if (this.loadArrow) this.loadArrow.position.y = topY + 0.5;
    }
  }

  public updateAnimation(_delta: number, _elapsed: number): void {}

  public updateParameters(params: {
    alloyId?: AlloyCategoryId;
    appliedLoadKN?: number;
  }): void {
    if (params.alloyId !== undefined && params.alloyId !== this.selectedAlloyId) {
      this.selectedAlloyId = params.alloyId;
      const alloy = ENGINEERING_ALLOYS_DATABASE[this.selectedAlloyId];
      // Max load based on UTS: F_max = UTS · A0 / 1000
      const A0 = (Math.PI * Math.pow(12.5, 2)) / 4;
      this.maxLoadKN = Math.round((alloy.ultimateTensileStrengthMPa * A0) / 1000);
      this.appliedLoadKN = 0;
    }
    if (params.appliedLoadKN !== undefined) {
      this.appliedLoadKN = params.appliedLoadKN;
    }
    this.updateSpecimenDeformation();
  }
}
