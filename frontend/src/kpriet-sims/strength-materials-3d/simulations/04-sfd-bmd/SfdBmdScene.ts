import * as THREE from 'three';
import { BaseSomSimulation } from '../../core/BaseSomSimulation';
import type { IBeamParams, IBeamCalculationResult } from '../../core/types';
import { SOM_MATERIALS } from '../../core/SomMaterials';

export class SfdBmdScene extends BaseSomSimulation {
  private rigGroup: THREE.Group;
  private leftBeamMesh: THREE.Mesh | null = null;
  private rightBeamMesh: THREE.Mesh | null = null;
  private sectionPlaneGroup: THREE.Group;
  private leftSupportMesh: THREE.Group;
  private rightSupportMesh: THREE.Group;
  private loadArrowsGroup: THREE.Group;
  private reactionArrowsGroup: THREE.Group;
  private stressDistributionGroup: THREE.Group;

  private currentParams: IBeamParams | null = null;
  private currentResult: IBeamCalculationResult | null = null;

  constructor(container: HTMLElement) {
    super(container);
    this.rigGroup = new THREE.Group();
    this.sectionPlaneGroup = new THREE.Group();
    this.leftSupportMesh = new THREE.Group();
    this.rightSupportMesh = new THREE.Group();
    this.loadArrowsGroup = new THREE.Group();
    this.reactionArrowsGroup = new THREE.Group();
    this.stressDistributionGroup = new THREE.Group();

    this.buildTestBench();
    this.scene.add(this.rigGroup);
    this.scene.add(this.sectionPlaneGroup);
    this.scene.add(this.reactionArrowsGroup);
    this.scene.add(this.stressDistributionGroup);

    // Initial camera position looking at beam and cut plane
    this.resetCamera(new THREE.Vector3(2.4, 2.0, 3.4), new THREE.Vector3(0, 0.85, 0));
  }

  private buildTestBench(): void {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const supportMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });

    // Heavy base bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.18, 0.7), frameMat);
    bench.position.set(0, 0.45, 0);
    bench.castShadow = true;
    bench.receiveShadow = true;
    this.rigGroup.add(bench);

    // Bench supports
    for (const x of [-1.5, 1.5]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.6), frameMat);
      leg.position.set(x, 0.225, 0);
      leg.castShadow = true;
      this.rigGroup.add(leg);
    }

    // Left Support (Pin)
    const pin = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), supportMat);
    pin.rotation.y = Math.PI / 4;
    pin.position.y = 0.09;
    this.leftSupportMesh.add(pin);
    const pinPin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 16), rollerMat);
    pinPin.rotation.x = Math.PI / 2;
    pinPin.position.y = 0.18;
    this.leftSupportMesh.add(pinPin);
    this.rigGroup.add(this.leftSupportMesh);

    // Right Support (Roller)
    const rBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.24), supportMat);
    rBase.position.y = 0.025;
    this.rightSupportMesh.add(rBase);
    const rCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16), rollerMat);
    rCyl.rotation.x = Math.PI / 2;
    rCyl.position.y = 0.09;
    this.rightSupportMesh.add(rCyl);
    const rTop = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.22), supportMat);
    rTop.position.y = 0.15;
    this.rightSupportMesh.add(rTop);
    this.rigGroup.add(this.rightSupportMesh);

    this.rigGroup.add(this.loadArrowsGroup);

    // Section Cut Plane indicator (Yellow translucent grid plate)
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const cutPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.4), planeMat);
    this.sectionPlaneGroup.add(cutPlate);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.PlaneGeometry(0.3, 0.4)),
      new THREE.LineBasicMaterial({ color: 0xfbbf24 })
    );
    this.sectionPlaneGroup.add(wire);
  }

  public updateExperiment(params: IBeamParams, result: IBeamCalculationResult): void {
    this.currentParams = params;
    this.currentResult = result;

    const spanM = params.spanM;
    const visualScaleX = 2.4 / Math.max(1, spanM);
    const leftX = (-spanM / 2) * visualScaleX;
    const rightX = (spanM / 2) * visualScaleX;
    const supportTopY = 0.45 + 0.18; // 0.63

    this.leftSupportMesh.position.set(leftX, 0.45, 0);
    this.rightSupportMesh.position.set(rightX, 0.45, 0);

    // Section Cut Location
    const cutX = (params.measurementPositionM - spanM / 2) * visualScaleX;
    this.sectionPlaneGroup.position.set(cutX, supportTopY + 0.08, 0);

    // Reconstruct Split Beam (Left segment & Right segment separated by small gap at cut)
    if (this.leftBeamMesh) {
      this.rigGroup.remove(this.leftBeamMesh);
      this.leftBeamMesh.geometry.dispose();
      (this.leftBeamMesh.material as THREE.Material).dispose();
      this.leftBeamMesh = null;
    }
    if (this.rightBeamMesh) {
      this.rigGroup.remove(this.rightBeamMesh);
      this.rightBeamMesh.geometry.dispose();
      (this.rightBeamMesh.material as THREE.Material).dispose();
      this.rightBeamMesh = null;
    }

    const matInfo = SOM_MATERIALS[params.materialId];
    const beamMat = new THREE.MeshStandardMaterial({
      color: matInfo.colorHex,
      roughness: matInfo.roughness,
      metalness: matInfo.metalness,
    });

    const beamW = 0.1;
    const beamH = 0.14;
    const gap = 0.03; // gap to inspect internal section

    // Left segment length
    const leftLen = Math.max(0.05, (params.measurementPositionM) * visualScaleX - gap / 2);
    const leftCenter = leftX + leftLen / 2;
    const leftGeo = new THREE.BoxGeometry(leftLen, beamH, beamW);
    this.leftBeamMesh = new THREE.Mesh(leftGeo, beamMat);
    this.leftBeamMesh.position.set(leftCenter, supportTopY + beamH / 2, 0);
    this.leftBeamMesh.castShadow = true;
    this.rigGroup.add(this.leftBeamMesh);

    // Right segment length
    const rightLen = Math.max(0.05, (spanM - params.measurementPositionM) * visualScaleX - gap / 2);
    const rightCenter = rightX - rightLen / 2;
    const rightGeo = new THREE.BoxGeometry(rightLen, beamH, beamW);
    this.rightBeamMesh = new THREE.Mesh(rightGeo, beamMat);
    this.rightBeamMesh.position.set(rightCenter, supportTopY + beamH / 2, 0);
    this.rightBeamMesh.castShadow = true;
    this.rigGroup.add(this.rightBeamMesh);

    // Load Arrows
    this.renderLoads(params, visualScaleX, supportTopY + beamH);

    // Support Reaction Arrows
    this.renderReactions(result, leftX, rightX, supportTopY);

    // Internal Shear & Flexural Stress Distribution Visualizer on Cut Face
    this.renderInternalSectionForces(result, cutX, supportTopY + beamH / 2, beamH);
  }

  private renderLoads(params: IBeamParams, visualScaleX: number, topY: number): void {
    while (this.loadArrowsGroup.children.length > 0) {
      const child = this.loadArrowsGroup.children[0];
      if (child) {
        this.loadArrowsGroup.remove(child);
      }
    }
    params.loads.forEach((l: IBeamParams['loads'][number]) => {
      const xPos = (l.positionM - params.spanM / 2) * visualScaleX;
      const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(xPos, topY + 0.4, 0),
        0.35,
        0xef4444,
        0.1,
        0.05
      );
      this.loadArrowsGroup.add(arrow);
    });
  }

  private renderReactions(result: IBeamCalculationResult, leftX: number, rightX: number, bottomY: number): void {
    while (this.reactionArrowsGroup.children.length > 0) {
      const child = this.reactionArrowsGroup.children[0];
      if (child) {
        this.reactionArrowsGroup.remove(child);
      }
    }

    const raKn = result.reactions.reactionA / 1000;
    const rbKn = result.reactions.reactionB / 1000;

    if (Math.abs(raKn) > 0.01) {
      const dirA = raKn >= 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);
      const startA = raKn >= 0 ? new THREE.Vector3(leftX, bottomY - 0.35, 0) : new THREE.Vector3(leftX, bottomY + 0.1, 0);
      const arrowA = new THREE.ArrowHelper(dirA, startA, 0.32, 0x10b981, 0.1, 0.05);
      this.reactionArrowsGroup.add(arrowA);
    }

    if (Math.abs(rbKn) > 0.01) {
      const dirB = rbKn >= 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);
      const startB = rbKn >= 0 ? new THREE.Vector3(rightX, bottomY - 0.35, 0) : new THREE.Vector3(rightX, bottomY + 0.1, 0);
      const arrowB = new THREE.ArrowHelper(dirB, startB, 0.32, 0x10b981, 0.1, 0.05);
      this.reactionArrowsGroup.add(arrowB);
    }
  }

  private renderInternalSectionForces(result: IBeamCalculationResult, cutX: number, centerY: number, beamH: number): void {
    while (this.stressDistributionGroup.children.length > 0) {
      const child = this.stressDistributionGroup.children[0];
      if (child) {
        this.stressDistributionGroup.remove(child);
      }
    }

    const V = result.shearAtInspection;
    const M = result.bendingMomentAtInspection;

    // Shear Force Vector on Cut Plane
    if (Math.abs(V) > 0.1) {
      const shearDir = V >= 0 ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0);
      const shearArrow = new THREE.ArrowHelper(
        shearDir,
        new THREE.Vector3(cutX - 0.015, centerY + (V >= 0 ? 0.1 : -0.1), 0),
        0.2,
        0x38bdf8,
        0.06,
        0.03
      );
      this.stressDistributionGroup.add(shearArrow);
    }

    // Flexural Stress arrows (Compression on top, Tension on bottom for +ve bending moment)
    if (Math.abs(M) > 0.05) {
      const topTension = M < 0; // sagging vs hogging
      const topDir = topTension ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(-1, 0, 0);
      const topArrow = new THREE.ArrowHelper(
        topDir,
        new THREE.Vector3(cutX - 0.015, centerY + beamH / 2 - 0.02, 0),
        0.12,
        topTension ? 0xef4444 : 0x0284c7,
        0.04,
        0.02
      );
      this.stressDistributionGroup.add(topArrow);

      const botDir = topTension ? new THREE.Vector3(-1, 0, 0) : new THREE.Vector3(1, 0, 0);
      const botArrow = new THREE.ArrowHelper(
        botDir,
        new THREE.Vector3(cutX - 0.015, centerY - beamH / 2 + 0.02, 0),
        0.12,
        topTension ? 0x0284c7 : 0xef4444,
        0.04,
        0.02
      );
      this.stressDistributionGroup.add(botArrow);
    }
  }

  protected onUpdate(_time: number): void {}

  public override dispose(): void {
    super.dispose();
  }
}
