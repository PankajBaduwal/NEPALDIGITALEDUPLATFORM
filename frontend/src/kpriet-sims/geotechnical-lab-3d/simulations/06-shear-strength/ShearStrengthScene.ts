/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Module 6: Soil Shear Strength Laboratory (IS 2720 Part 10 UCC / Part 13 Direct Shear)
 */

import * as THREE from 'three';
import { BaseGeotechnicalSimulation } from '../../core/BaseGeotechnicalSimulation';
import type { IBaseGeotechnicalSimulationOptions } from '../../core/BaseGeotechnicalSimulation';
import type { IShearStrengthParams } from '../../core/types';

export class ShearStrengthScene extends BaseGeotechnicalSimulation {
  private directShearGroup: THREE.Group;
  private uccGroup: THREE.Group;
  private shearBoxTopMesh: THREE.Mesh;
  private uccSpecimenMesh: THREE.Mesh;
  private provingRingNeedle: THREE.Mesh;
  private currentParams: IShearStrengthParams;
  private shearingProgress = 0;
  private isTesting = false;

  constructor(options: IBaseGeotechnicalSimulationOptions, initialParams: IShearStrengthParams) {
    super(options);
    this.currentParams = initialParams;

    this.defaultCameraPos.set(2.6, 2.2, 3.0);
    this.defaultTarget.set(0, 1.15, 0);
    this.resetCamera();

    // 1. Lab Bench
    const bench = this.createLaboratoryBench(3.2, 1.8, 0.85);
    this.labGroup.add(bench);

    // 2. Direct Shear Apparatus
    const { group: directShearGroup, shearBoxTop, provingNeedle } = this.buildDirectShearApparatus();
    this.directShearGroup = directShearGroup;
    this.shearBoxTopMesh = shearBoxTop;
    this.provingRingNeedle = provingNeedle;
    this.labGroup.add(this.directShearGroup);

    // 3. Unconfined Compression Testing Machine (UCC)
    const { group: uccGroup, specimen } = this.buildUCCApparatus();
    this.uccGroup = uccGroup;
    this.uccSpecimenMesh = specimen;
    this.labGroup.add(this.uccGroup);

    this.updateApparatusVisibility();
  }

  private buildDirectShearApparatus(): { group: THREE.Group; shearBoxTop: THREE.Mesh; provingNeedle: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(-0.2, 0.89, 0);

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 });

    // Water trough container
    const troughGeo = new THREE.BoxGeometry(0.5, 0.12, 0.32);
    const trough = new THREE.Mesh(troughGeo, steelMat);
    trough.position.y = 0.06;
    trough.castShadow = true;
    group.add(trough);

    // Split Brass Shear Box - Lower Half (60x60mm, fixed to carriage)
    const lowerBoxGeo = new THREE.BoxGeometry(0.18, 0.05, 0.18);
    const lowerBox = new THREE.Mesh(lowerBoxGeo, brassMat);
    lowerBox.position.set(0, 0.13, 0);
    group.add(lowerBox);

    // Split Brass Shear Box - Upper Half (60x60mm, driven horizontally)
    const upperBoxGeo = new THREE.BoxGeometry(0.18, 0.05, 0.18);
    const upperBox = new THREE.Mesh(upperBoxGeo, brassMat);
    upperBox.position.set(0, 0.18, 0);
    upperBox.castShadow = true;
    group.add(upperBox);

    // Proving Ring Assembly (measures horizontal force F)
    const ringGeo = new THREE.TorusGeometry(0.09, 0.015, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(0.32, 0.18, 0);
    group.add(ring);

    // Dial gauge inside proving ring
    const dialFaceGeo = new THREE.CircleGeometry(0.038, 24);
    const dialFaceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dialFace = new THREE.Mesh(dialFaceGeo, dialFaceMat);
    dialFace.rotation.y = Math.PI / 2;
    dialFace.position.set(0.32, 0.18, 0.001);
    group.add(dialFace);

    const needleGeo = new THREE.ConeGeometry(0.003, 0.03, 8);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const provingNeedle = new THREE.Mesh(needleGeo, needleMat);
    provingNeedle.position.set(0.32, 0.18, 0.005);
    group.add(provingNeedle);

    // Vertical Loading Yoke & Weight Hanger (applies normal load N)
    const yokeGeo = new THREE.BoxGeometry(0.04, 0.45, 0.22);
    const yoke = new THREE.Mesh(yokeGeo, steelMat);
    yoke.position.set(0, 0.35, 0);
    group.add(yoke);

    this.registerInteractive(upperBox, {
      id: 'direct-shear-box',
      name: 'Split Shear Box (60 x 60 mm) (IS 2720 Part 13)',
      functionDesc: 'Forces horizontal shearing along predefined failure plane to determine shear strength parameters c and φ.',
      specification: 'Internal dimensions: 60 x 60 x 50 mm | Strain-controlled rate: 1.25 mm/min.',
    });

    this.registerInteractive(ring, {
      id: 'proving-ring',
      name: 'High-Precision Proving Ring (2.5 kN)',
      functionDesc: 'Measures horizontal shear resistance force Fs by elastic diametral deflection.',
      specification: 'Capacity: 2.5 kN | Calibration constant: 0.002 kN/division.',
    });

    return { group, shearBoxTop: upperBox, provingNeedle };
  }

  private buildUCCApparatus(): { group: THREE.Group; specimen: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(-0.2, 0.89, 0);

    const castMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.7 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.95 });

    // Sturdy Load Frame Base
    const baseGeo = new THREE.BoxGeometry(0.45, 0.08, 0.35);
    const base = new THREE.Mesh(baseGeo, castMat);
    base.position.y = 0.04;
    group.add(base);

    // Twin Vertical Guide Pillars
    [-0.16, 0.16].forEach((x) => {
      const pillarGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.65, 16);
      const pillar = new THREE.Mesh(pillarGeo, steelMat);
      pillar.position.set(x, 0.4, 0);
      group.add(pillar);
    });

    // Top Crosshead
    const crossheadGeo = new THREE.BoxGeometry(0.42, 0.06, 0.08);
    const crosshead = new THREE.Mesh(crossheadGeo, castMat);
    crosshead.position.y = 0.72;
    group.add(crosshead);

    // Upper Proving Ring
    const ringGeo = new THREE.TorusGeometry(0.065, 0.012, 16, 24);
    const ring = new THREE.Mesh(ringGeo, steelMat);
    ring.position.y = 0.6;
    group.add(ring);

    // Lower Motorized Platen
    const platenGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 32);
    const platen = new THREE.Mesh(platenGeo, steelMat);
    platen.position.y = 0.12;
    group.add(platen);

    // Cylindrical Cohesive Soil Specimen (38 mm dia x 76 mm height)
    const specimenGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.16, 24);
    const specimenMat = new THREE.MeshStandardMaterial({
      color: 0x5c4033, // Clay brown
      roughness: 0.9,
    });
    const specimen = new THREE.Mesh(specimenGeo, specimenMat);
    specimen.position.y = 0.22;
    specimen.castShadow = true;
    group.add(specimen);

    this.registerInteractive(specimen, {
      id: 'ucc-specimen',
      name: 'Unconfined Cylindrical Cohesive Specimen (IS 2720 Part 10)',
      functionDesc: 'Undergoes unconfined axial compression without lateral confining pressure (σ3 = 0) to measure qu and cu.',
      specification: 'Diameter d0: 38 mm | Length L0: 76 mm | Aspect ratio: 2:1.',
    });

    return { group, specimen };
  }

  public updateParameters(params: IShearStrengthParams): void {
    this.currentParams = params;
    this.updateApparatusVisibility();
  }

  private updateApparatusVisibility(): void {
    if (this.currentParams.testType === 'direct-shear') {
      this.directShearGroup.visible = true;
      this.uccGroup.visible = false;
    } else {
      this.directShearGroup.visible = false;
      this.uccGroup.visible = true;
    }
  }

  public setTesting(active: boolean): void {
    this.isTesting = active;
  }

  public update(delta: number): void {
    if (this.isTesting) {
      this.shearingProgress += delta * 0.5;

      if (this.currentParams.testType === 'direct-shear') {
        // Displace top box horizontally
        const disp = (Math.sin(this.shearingProgress) + 1) * 0.015;
        this.shearBoxTopMesh.position.x = disp;
        this.provingRingNeedle.rotation.z = -this.shearingProgress * 4;
      } else {
        // Bulge UCC specimen under axial strain
        const strainFactor = Math.min(0.2, (Math.sin(this.shearingProgress * 0.5) + 1) * 0.08);
        this.uccSpecimenMesh.scale.set(1.0 + strainFactor * 1.5, 1.0 - strainFactor, 1.0 + strainFactor * 1.5);
      }
    }
  }
}
