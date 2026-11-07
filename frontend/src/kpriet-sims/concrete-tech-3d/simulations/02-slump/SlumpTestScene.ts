import * as THREE from 'three';
import { BaseConcreteSimulation } from '../../core/BaseConcreteSimulation';
import type { ISlumpTestParams, ISlumpTestResult } from '../../core/types';

export class SlumpTestScene extends BaseConcreteSimulation {
  private rigGroup: THREE.Group;
  private basePlateMesh!: THREE.Mesh;
  private coneMesh!: THREE.Group;
  private concreteSlumpMesh: THREE.Mesh | null = null;
  private tampingRodMesh!: THREE.Mesh;
  private measuringScaleMesh!: THREE.Group;
  private rulerMarkerMesh!: THREE.Mesh;

  private currentParams: ISlumpTestParams | null = null;
  private currentResult: ISlumpTestResult | null = null;
  private isConeLifted: boolean = false;

  constructor(container: HTMLElement) {
    super(container);
    this.rigGroup = new THREE.Group();

    this.buildSlumpApparatus();
    this.scene.add(this.rigGroup);

    this.resetCamera(new THREE.Vector3(1.2, 1.2, 1.8), new THREE.Vector3(0, 0.45, 0));
  }

  private buildSlumpApparatus(): void {
    const galvanizedSteel = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
    });
    const chrome = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
    });
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.4,
    });

    // 1. Non-porous Heavy Base Plate (500mm x 500mm x 5mm per IS 1199)
    const plateGeo = new THREE.BoxGeometry(0.7, 0.02, 0.7);
    this.basePlateMesh = new THREE.Mesh(plateGeo, plateMat);
    this.basePlateMesh.position.set(0, 0.01, 0);
    this.basePlateMesh.receiveShadow = true;
    this.rigGroup.add(this.basePlateMesh);

    // 2. Standard Slump Cone (Frustum: Top dia 100mm, Bot dia 200mm, Height 300mm)
    this.coneMesh = new THREE.Group();
    const coneGeo = new THREE.CylinderGeometry(0.05, 0.10, 0.30, 32, 1, true); // hollow
    const coneBody = new THREE.Mesh(coneGeo, galvanizedSteel);
    coneBody.position.y = 0.15;
    coneBody.castShadow = true;
    this.coneMesh.add(coneBody);

    // Handles on opposite sides
    for (const sign of [-1, 1]) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.005, 8, 16, Math.PI), galvanizedSteel);
      handle.position.set(sign * 0.08, 0.20, 0);
      handle.rotation.z = sign * Math.PI / 2;
      this.coneMesh.add(handle);

      // Foot-pieces (clamps) at bottom
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.006, 0.03), galvanizedSteel);
      foot.position.set(sign * 0.11, 0.003, 0);
      this.coneMesh.add(foot);
    }

    this.coneMesh.position.set(0, 0.02, 0);
    this.rigGroup.add(this.coneMesh);

    // 3. Tamping Rod (16mm diameter x 600mm long with rounded bullet nose per IS 1199)
    const rodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.60, 16);
    this.tampingRodMesh = new THREE.Mesh(rodGeo, chrome);
    this.tampingRodMesh.position.set(0.25, 0.30, 0.15);
    this.tampingRodMesh.castShadow = true;
    this.rigGroup.add(this.tampingRodMesh);

    // 4. Measuring Scale / Bridge Bar
    this.buildMeasuringScale();
    this.rigGroup.add(this.measuringScaleMesh);
  }

  private buildMeasuringScale(): void {
    this.measuringScaleMesh = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });

    // Inverted cone support bar (rests on inverted cone or upright cone)
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.015, 0.02), steel);
    bridge.position.set(0, 0.32, 0);
    this.measuringScaleMesh.add(bridge);

    // Vertical graduated rule sliding down from bridge to top of concrete
    const ruleGeo = new THREE.BoxGeometry(0.015, 0.30, 0.005);
    this.rulerMarkerMesh = new THREE.Mesh(ruleGeo, brass);
    this.rulerMarkerMesh.position.set(0, 0.17, 0.015);
    this.measuringScaleMesh.add(this.rulerMarkerMesh);
  }

  public setConeLifted(lifted: boolean): void {
    this.isConeLifted = lifted;
    if (this.currentParams && this.currentResult) {
      this.updateExperiment(this.currentParams, this.currentResult);
    }
  }

  public updateExperiment(params: ISlumpTestParams, result: ISlumpTestResult): void {
    this.currentParams = params;
    this.currentResult = result;

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
      metalness: 0.1,
    });

    if (this.concreteSlumpMesh) {
      this.rigGroup.remove(this.concreteSlumpMesh);
      this.concreteSlumpMesh.geometry.dispose();
      (this.concreteSlumpMesh.material as THREE.Material).dispose();
      this.concreteSlumpMesh = null;
    }

    if (!this.isConeLifted) {
      // Cone is seated over fresh concrete
      this.coneMesh.position.set(0, 0.02, 0);
      this.measuringScaleMesh.visible = false;

      // Concrete is shaped exactly like inner cone (300mm high frustum)
      const geo = new THREE.CylinderGeometry(0.048, 0.098, 0.298, 32);
      this.concreteSlumpMesh = new THREE.Mesh(geo, concreteMat);
      this.concreteSlumpMesh.position.set(0, 0.17, 0);
      this.rigGroup.add(this.concreteSlumpMesh);
    } else {
      // Cone is lifted vertically beside the slump sample
      this.coneMesh.position.set(-0.25, 0.02, 0);
      this.measuringScaleMesh.visible = true;

      const slumpMm = result.slumpHeightMm;
      const subsidedHeightM = Math.max(0.04, 0.30 - slumpMm / 1000);

      // Model appropriate slump geometry based on type
      if (result.slumpType === 'collapse') {
        // Flattened puddle
        const geo = new THREE.CylinderGeometry(0.18, 0.22, subsidedHeightM, 32);
        this.concreteSlumpMesh = new THREE.Mesh(geo, concreteMat);
        this.concreteSlumpMesh.position.set(0, 0.02 + subsidedHeightM / 2, 0);
      } else if (result.slumpType === 'shear') {
        // Shear cleavage: diagonal slope
        const geo = new THREE.CylinderGeometry(0.06, 0.14, subsidedHeightM, 32);
        const pos = geo.attributes.position;
        if (pos) {
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            if (x > 0) {
              pos.setY(i, y - (subsidedHeightM * 0.45) * (x / 0.14));
            }
          }
          geo.computeVertexNormals();
        }
        this.concreteSlumpMesh = new THREE.Mesh(geo, concreteMat);
        this.concreteSlumpMesh.position.set(0, 0.02 + subsidedHeightM / 2, 0);
      } else {
        // True uniform subsidence
        const topRadius = 0.05 + (0.30 - subsidedHeightM) * 0.25;
        const botRadius = 0.10 + (0.30 - subsidedHeightM) * 0.25;
        const geo = new THREE.CylinderGeometry(topRadius, botRadius, subsidedHeightM, 32);
        this.concreteSlumpMesh = new THREE.Mesh(geo, concreteMat);
        this.concreteSlumpMesh.position.set(0, 0.02 + subsidedHeightM / 2, 0);
      }

      this.concreteSlumpMesh.castShadow = true;
      this.rigGroup.add(this.concreteSlumpMesh);

      // Update measuring bridge & ruler
      this.measuringScaleMesh.position.set(0, 0, 0);
      this.rulerMarkerMesh.position.y = (0.32 + (0.02 + subsidedHeightM)) / 2;
      this.rulerMarkerMesh.scale.y = Math.max(0.1, (0.32 - (0.02 + subsidedHeightM)) / 0.30);
    }
  }

  protected onUpdate(_time: number): void {}

  public override dispose(): void {
    super.dispose();
  }
}
