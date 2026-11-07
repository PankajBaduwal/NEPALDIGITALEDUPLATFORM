/**
 * 3D Virtual Machining Workshop Scene (Unit IV / Integrated Workshop)
 * Combines machine tool selection, operation execution, toolpath guidance,
 * and virtual Vernier Caliper dimensional metrology measurement.
 */

import * as THREE from 'three';
import { BaseMachiningSimulation } from '../BaseMachiningSimulation';
import type { MachineToolType, WorkpieceMaterialId, TurningOperation } from '../../core/types';
import { WORKPIECE_MATERIALS } from '../../core/MachiningMaterials';

export class VirtualWorkshopScene extends BaseMachiningSimulation {
  private workshopRoot = new THREE.Group();
  private workpieceMesh!: THREE.Mesh;
  private machinedSegmentMesh!: THREE.Mesh;
  private toolHolderMesh!: THREE.Mesh;
  private toolpathLineMesh!: THREE.Line;
  private caliperGroup = new THREE.Group();

  // Process Parameters
  private selectedMachine: MachineToolType = 'lathe';
  private selectedOperation: TurningOperation = 'step-turning';
  private materialId: WorkpieceMaterialId = 'mild-steel';
  private initialDiameterMm = 50;
  private finalDiameterMm = 44;
  private lengthMm = 140;
  private cutLengthMm = 70;
  private isMachiningActive = false;
  private isCaliperActive = false;
  private cutProgress = 0; // 0 to 1

  constructor(container: HTMLElement) {
    super(container);
    this.scene.add(this.workshopRoot);
    this.buildWorkshopEnvironment();
    this.buildWorkpiece();
    this.buildToolHolder();
    this.buildToolpathGuide();
    this.buildVirtualCaliper();
    this.resetCamera(13, 2.5, Math.PI / 3.6, Math.PI / 3.4);
  }

  private buildWorkshopEnvironment(): void {
    // Workshop table / bench
    const benchGeo = new THREE.BoxGeometry(10, 1.2, 5.0);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.3,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.6, 0);
    bench.receiveShadow = true;
    this.workshopRoot.add(bench);

    // Rotary Chuck Head (left side)
    const chuckGeo = new THREE.CylinderGeometry(1.6, 1.6, 1.0, 32);
    const chuckMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
    const chuck = new THREE.Mesh(chuckGeo, chuckMat);
    chuck.rotation.z = Math.PI / 2;
    chuck.position.set(-3.2, 2.4, 0);
    this.workshopRoot.add(chuck);

    // Tailstock support (right side)
    const tsGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16);
    const tsMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const tailstock = new THREE.Mesh(tsGeo, tsMat);
    tailstock.rotation.z = Math.PI / 2;
    tailstock.position.set(3.8, 2.4, 0);
    this.workshopRoot.add(tailstock);
  }

  private buildWorkpiece(): void {
    const mat = WORKPIECE_MATERIALS[this.materialId] || WORKPIECE_MATERIALS['mild-steel'];
    const scale = 0.04;
    const r0 = (this.initialDiameterMm / 2) * scale;
    const totalL = this.lengthMm * scale;

    // Uncut stock cylinder
    const rawGeo = new THREE.CylinderGeometry(r0, r0, totalL, 32);
    const rawMat = new THREE.MeshStandardMaterial({
      color: mat.colorHex,
      roughness: mat.roughness,
      metalness: mat.metalness,
    });
    this.workpieceMesh = new THREE.Mesh(rawGeo, rawMat);
    this.workpieceMesh.rotation.z = Math.PI / 2;
    this.workpieceMesh.position.set(0, 2.4, 0);
    this.workpieceMesh.castShadow = true;
    this.workshopRoot.add(this.workpieceMesh);

    // Turned Step cylinder (grows as progress advances)
    const rf = (this.finalDiameterMm / 2) * scale;
    const cutL = Math.max(0.01, (this.cutLengthMm * scale) * this.cutProgress);
    const machGeo = new THREE.CylinderGeometry(rf, rf, cutL, 32);
    const machMat = new THREE.MeshStandardMaterial({
      color: mat.colorHex,
      roughness: 0.15,
      metalness: 0.95,
    });
    this.machinedSegmentMesh = new THREE.Mesh(machGeo, machMat);
    this.machinedSegmentMesh.rotation.z = Math.PI / 2;
    this.machinedSegmentMesh.position.set(-totalL / 2 + cutL / 2, 2.4, 0);
    this.workshopRoot.add(this.machinedSegmentMesh);
  }

  private buildToolHolder(): void {
    const holderGeo = new THREE.BoxGeometry(0.8, 0.8, 1.4);
    const holderMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
    this.toolHolderMesh = new THREE.Mesh(holderGeo, holderMat);
    this.toolHolderMesh.position.set(0, 2.4, 1.8);
    this.workshopRoot.add(this.toolHolderMesh);

    // Golden carbide tip pointing towards workpiece
    const tipGeo = new THREE.ConeGeometry(0.18, 0.4, 4);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.rotation.x = -Math.PI / 2;
    tip.position.set(0, 0, -0.8);
    this.toolHolderMesh.add(tip);
  }

  private buildToolpathGuide(): void {
    // Fluorescent Green toolpath wireframe guide
    const points: THREE.Vector3[] = [
      new THREE.Vector3(-2.8, 2.4, 1.6),
      new THREE.Vector3(-2.8, 2.4, 0.9),
      new THREE.Vector3(0.0, 2.4, 0.9),
      new THREE.Vector3(0.0, 2.4, 1.6),
    ];
    const pathGeo = new THREE.BufferGeometry().setFromPoints(points);
    const pathMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      dashSize: 0.2,
      gapSize: 0.1,
    });
    this.toolpathLineMesh = new THREE.Line(pathGeo, pathMat);
    this.toolpathLineMesh.computeLineDistances();
    this.workshopRoot.add(this.toolpathLineMesh);
  }

  private buildVirtualCaliper(): void {
    // 3D Digital Vernier Caliper Model
    this.caliperGroup.position.set(0, 4.0, 0);
    this.caliperGroup.visible = false;
    this.workshopRoot.add(this.caliperGroup);

    const beamMat = new THREE.MeshStandardMaterial({ color: 0xd4d8dd, metalness: 0.9, roughness: 0.2 });
    const jawMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });

    // Caliper main beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.35, 0.08), beamMat);
    this.caliperGroup.add(beam);

    // Fixed main jaw (left)
    const fixedJaw = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.8, 0.08), jawMat);
    fixedJaw.position.set(-2.8, -0.8, 0);
    this.caliperGroup.add(fixedJaw);

    // Sliding jaw with LCD display
    const slidingGroup = new THREE.Group();
    slidingGroup.position.set(-0.8, 0, 0);
    this.caliperGroup.add(slidingGroup);

    const slideJaw = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.8, 0.08), jawMat);
    slideJaw.position.set(0, -0.8, 0);
    slidingGroup.add(slideJaw);

    // LCD Digital Display Housing
    const lcdHousing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.25), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    lcdHousing.position.set(0.4, 0.3, 0.1);
    slidingGroup.add(lcdHousing);

    const lcdScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ color: 0x064e3b }));
    lcdScreen.position.set(0.4, 0.3, 0.23);
    slidingGroup.add(lcdScreen);
  }

  public updateAnimation(delta: number, _elapsed: number): void {
    if (this.isMachiningActive) {
      this.cutProgress += delta * 0.25;
      if (this.cutProgress > 1.0) {
        this.cutProgress = 1.0;
        this.isMachiningActive = false;
      }

      // Revolve workpiece
      this.workpieceMesh.rotation.y += delta * 12;
      this.machinedSegmentMesh.rotation.y += delta * 12;

      // Advance tool along X axis
      const scale = 0.04;
      const totalL = this.lengthMm * scale;
      const cutL = (this.cutLengthMm * scale) * this.cutProgress;
      const toolX = -totalL / 2 + cutL;
      this.toolHolderMesh.position.x = toolX;

      // Update turned cylinder geometry
      const rf = (this.finalDiameterMm / 2) * scale;
      this.machinedSegmentMesh.scale.y = Math.max(0.01, this.cutProgress);
      this.machinedSegmentMesh.position.x = -totalL / 2 + cutL / 2;
    }
  }

  public updateParameters(params: {
    machine?: MachineToolType;
    operation?: TurningOperation;
    materialId?: WorkpieceMaterialId;
    initialDiameterMm?: number;
    finalDiameterMm?: number;
    lengthMm?: number;
    cutLengthMm?: number;
    isActive?: boolean;
    showCaliper?: boolean;
    resetProgress?: boolean;
  }): void {
    if (params.machine) this.selectedMachine = params.machine;
    if (params.operation) this.selectedOperation = params.operation;
    if (params.materialId) this.materialId = params.materialId;
    if (params.initialDiameterMm) this.initialDiameterMm = params.initialDiameterMm;
    if (params.finalDiameterMm) this.finalDiameterMm = params.finalDiameterMm;
    if (params.lengthMm) this.lengthMm = params.lengthMm;
    if (params.cutLengthMm) this.cutLengthMm = params.cutLengthMm;
    if (params.isActive !== undefined) this.isMachiningActive = params.isActive;
    if (params.showCaliper !== undefined) {
      this.isCaliperActive = params.showCaliper;
      this.caliperGroup.visible = this.isCaliperActive;
    }
    if (params.resetProgress) {
      this.cutProgress = 0;
      this.isMachiningActive = false;
    }
  }
}
