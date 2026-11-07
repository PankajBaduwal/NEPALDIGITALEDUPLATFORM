import * as THREE from 'three';
import { BaseSomSimulation } from '../../core/BaseSomSimulation';
import type { IStressStrainParams, IStressStrainResult } from '../../core/types';
import { SOM_MATERIALS } from '../../core/SomMaterials';

export class StressStrainScene extends BaseSomSimulation {
  private rigGroup: THREE.Group;
  private specimenMesh: THREE.Mesh | null = null;
  private fixedGrip!: THREE.Mesh;
  private movingGrip!: THREE.Mesh;
  private loadIndicatorArrow: THREE.ArrowHelper | null = null;
  private mohrCubeGroup: THREE.Group;
  private dimensionMarkersGroup: THREE.Group;

  private currentParams: IStressStrainParams | null = null;
  private currentResult: IStressStrainResult | null = null;

  constructor(container: HTMLElement) {
    super(container);
    this.rigGroup = new THREE.Group();
    this.mohrCubeGroup = new THREE.Group();
    this.dimensionMarkersGroup = new THREE.Group();

    this.buildHorizontalTestRig();
    this.buildMohrStressCube();

    this.scene.add(this.rigGroup);
    this.scene.add(this.mohrCubeGroup);
    this.scene.add(this.dimensionMarkersGroup);

    // Initial camera position looking at horizontal specimen and Mohr cube
    this.resetCamera(new THREE.Vector3(1.8, 1.4, 2.6), new THREE.Vector3(0, 0.75, 0));
  }

  private buildHorizontalTestRig(): void {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.35 });

    // Rig Bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.5), frameMat);
    bed.position.set(0, 0.45, 0);
    bed.castShadow = true;
    this.rigGroup.add(bed);

    // Twin Guide Tie-Rods
    for (const z of [-0.15, 0.15]) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.3, 24), chromeMat);
      rod.rotation.z = Math.PI / 2;
      rod.position.set(0, 0.6, z);
      this.rigGroup.add(rod);
    }

    // Left Fixed End-Reaction Block
    const leftBlock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.45), frameMat);
    leftBlock.position.set(-1.0, 0.65, 0);
    this.rigGroup.add(leftBlock);

    // Fixed Wedge Jaw Grip
    this.fixedGrip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.14), gripMat);
    this.fixedGrip.position.set(-0.84, 0.65, 0);
    this.rigGroup.add(this.fixedGrip);

    // Right Movable Actuator Head & Grip
    this.movingGrip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.14), gripMat);
    this.movingGrip.position.set(0.84, 0.65, 0);
    this.rigGroup.add(this.movingGrip);

    const rightActuator = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 24), chromeMat);
    rightActuator.rotation.z = Math.PI / 2;
    rightActuator.position.set(1.0, 0.65, 0);
    this.rigGroup.add(rightActuator);
  }

  private buildMohrStressCube(): void {
    // 3D Infinitesimal Stress Element floating to the side
    this.mohrCubeGroup.position.set(0.9, 1.3, 0);

    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.2,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), cubeMat);
    this.mohrCubeGroup.add(cube);

    // Wireframe outline
    const wireGeo = new THREE.WireframeGeometry(new THREE.BoxGeometry(0.22, 0.22, 0.22));
    const wire = new THREE.LineSegments(wireGeo, new THREE.LineBasicMaterial({ color: 0x0284c7 }));
    this.mohrCubeGroup.add(wire);
  }

  public updateExperiment(params: IStressStrainParams, result: IStressStrainResult): void {
    this.currentParams = params;
    this.currentResult = result;

    const isTension = params.loadType === 'tension';
    const matInfo = SOM_MATERIALS[params.materialId];

    // Specimen Material Appearance
    const specMat = new THREE.MeshStandardMaterial({
      color: matInfo.colorHex,
      roughness: matInfo.roughness,
      metalness: matInfo.metalness,
    });

    // Reconstruct Deformed Specimen
    if (this.specimenMesh) {
      this.rigGroup.remove(this.specimenMesh);
      this.specimenMesh.geometry.dispose();
      (this.specimenMesh.material as THREE.Material).dispose();
      this.specimenMesh = null;
    }

    // Baseline dimensions
    const baseVisualL = 1.4; // visual span between grips
    const strain = result.axialStrain;
    const visualAmp = 40; // exaggerated for clear educational visibility of Poisson effect
    const visualL = baseVisualL * (1 + strain * visualAmp);
    const nu = matInfo.poissonsRatio;
    const lateralFactor = 1 - nu * strain * visualAmp;

    const r0 = 0.045 * Math.max(0.7, Math.min(1.4, Math.sqrt(params.crossSectionAreaMm2 / 300)));
    const rx = Math.max(0.015, r0 * lateralFactor);

    const specGeo = new THREE.CylinderGeometry(rx, rx, visualL, 32);
    specGeo.rotateZ(Math.PI / 2); // align along X axis
    this.specimenMesh = new THREE.Mesh(specGeo, specMat);
    this.specimenMesh.position.set(0, 0.65, 0);
    this.specimenMesh.castShadow = true;
    this.rigGroup.add(this.specimenMesh);

    // Update grip position
    this.movingGrip.position.x = visualL / 2 + 0.06;
    this.fixedGrip.position.x = -visualL / 2 - 0.06;

    // Load Arrow
    if (this.loadIndicatorArrow) {
      this.rigGroup.remove(this.loadIndicatorArrow);
      this.loadIndicatorArrow = null;
    }
    const arrowDir = isTension ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-1, 0, 0);
    const arrowOrigin = isTension ? new THREE.Vector3(visualL / 2 + 0.15, 0.65, 0) : new THREE.Vector3(visualL / 2 + 0.55, 0.65, 0);
    this.loadIndicatorArrow = new THREE.ArrowHelper(
      arrowDir,
      arrowOrigin,
      0.35,
      isTension ? 0xef4444 : 0x0284c7,
      0.1,
      0.05
    );
    this.rigGroup.add(this.loadIndicatorArrow);

    // Update Mohr Cube arrows based on Principal Stress
    this.updateMohrCubeVisuals(result.mohrCircle.principalStress1, result.mohrCircle.principalStress2, result.mohrCircle.maxShearStress);
  }

  private updateMohrCubeVisuals(sigma1: number, _sigma2: number, _tauMax: number): void {
    // Smooth pulse or scale of stress element
    const scaleFactor = 1 + Math.min(0.4, Math.abs(sigma1) / 400e6);
    this.mohrCubeGroup.scale.set(scaleFactor, 1 / Math.sqrt(scaleFactor), 1 / Math.sqrt(scaleFactor));
  }

  protected onUpdate(_time: number): void {}

  public override dispose(): void {
    super.dispose();
  }
}
