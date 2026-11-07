/**
 * 3D Simulation Scene: Thermodynamic Processes Explorer (Unit I)
 * Isobaric, Isochoric, Isothermal, Isentropic, Polytropic
 */

import * as THREE from 'three';
import { BaseThermoSimulation } from '../../core/BaseThermoSimulation';
import type { ThermodynamicProcessType } from '../../core/types';

export class ThermodynamicProcessesScene extends BaseThermoSimulation {
  private cylinderMesh!: THREE.Mesh;
  private pistonMesh!: THREE.Mesh;
  private weightsGroup!: THREE.Group;
  private insulationBlanketMesh!: THREE.Mesh;
  private lockingPinsGroup!: THREE.Group;
  private bathMesh!: THREE.Mesh;

  private currentProcess: ThermodynamicProcessType = 'isobaric';
  private currentVolumeM3 = 0.5;
  private initialVolumeM3 = 0.5;
  private isPinLocked = false;
  private isInsulated = false;

  public buildScene(): void {
    const group = new THREE.Group();
    group.name = 'ProcessesGroup';

    // 1. Transparent Glass Cylinder
    const cylRadius = 3.2;
    const cylHeight = 8;
    const cylGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 32, 1, true);
    const cylMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      thickness: 0.5,
      side: THREE.DoubleSide,
    });
    this.cylinderMesh = new THREE.Mesh(cylGeo, cylMat);
    this.cylinderMesh.position.set(0, cylHeight / 2 + 1, 0);
    group.add(this.cylinderMesh);

    // 2. Base Flange
    const baseGeo = new THREE.CylinderGeometry(cylRadius + 0.6, cylRadius + 0.6, 0.6, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, 1.3, 0);
    group.add(baseMesh);

    // 3. Piston with Loading Rod
    const pistonGeo = new THREE.CylinderGeometry(cylRadius - 0.05, cylRadius - 0.05, 0.7, 32);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.8, roughness: 0.2 });
    this.pistonMesh = new THREE.Mesh(pistonGeo, pistonMat);
    this.pistonMesh.position.set(0, 4.5, 0);
    group.add(this.pistonMesh);

    const rodGeo = new THREE.CylinderGeometry(0.25, 0.25, 5, 16);
    const rodMesh = new THREE.Mesh(rodGeo, baseMat);
    rodMesh.position.set(0, 2.5, 0);
    this.pistonMesh.add(rodMesh);

    // Weights platform on top of rod
    const platGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.3, 32);
    const platMesh = new THREE.Mesh(platGeo, baseMat);
    platMesh.position.set(0, 5, 0);
    this.pistonMesh.add(platMesh);

    // 4. Removable Calibration Weights
    this.weightsGroup = new THREE.Group();
    for (let w = 0; w < 4; w++) {
      const weightGeo = new THREE.CylinderGeometry(1.8 - w * 0.25, 1.8 - w * 0.25, 0.4, 24);
      const weightMat = new THREE.MeshStandardMaterial({
        color: w % 2 === 0 ? 0xf59e0b : 0xd97706,
        metalness: 0.9,
        roughness: 0.2,
      });
      const weight = new THREE.Mesh(weightGeo, weightMat);
      weight.position.set(0, 5.35 + w * 0.45, 0);
      this.weightsGroup.add(weight);
    }
    this.pistonMesh.add(this.weightsGroup);

    // 5. Locking Pins (for Isochoric Process V = C)
    this.lockingPinsGroup = new THREE.Group();
    const pinGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.5, 12);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 });
    const pinL = new THREE.Mesh(pinGeo, pinMat);
    pinL.rotation.z = Math.PI / 2;
    pinL.position.set(-2.8, 4.5, 0);
    const pinR = pinL.clone();
    pinR.position.set(2.8, 4.5, 0);
    this.lockingPinsGroup.add(pinL, pinR);
    this.lockingPinsGroup.visible = false;
    group.add(this.lockingPinsGroup);

    // 6. Thermal Insulation Blanket (for Isentropic Process Q = 0)
    const insulGeo = new THREE.CylinderGeometry(cylRadius + 0.3, cylRadius + 0.3, cylHeight, 32, 1, true);
    const insulMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.8,
    });
    this.insulationBlanketMesh = new THREE.Mesh(insulGeo, insulMat);
    this.insulationBlanketMesh.position.set(0, cylHeight / 2 + 1, 0);
    this.insulationBlanketMesh.visible = false;
    group.add(this.insulationBlanketMesh);

    // 7. Constant Temperature Water Bath (for Isothermal Process T = C)
    const bathGeo = new THREE.BoxGeometry(10, 3, 10);
    const bathMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      transmission: 0.9,
    });
    this.bathMesh = new THREE.Mesh(bathGeo, bathMat);
    this.bathMesh.position.set(0, 1.5, 0);
    this.bathMesh.visible = false;
    group.add(this.bathMesh);

    this.scene.add(group);
    this.resetCamera(13, 10, 16);
  }

  public updateAnimation(_delta: number, elapsedTime: number): void {
    // Dynamic piston position reflecting current volume
    const targetY = 2.0 + (this.currentVolumeM3 / this.initialVolumeM3) * 2.5;
    this.pistonMesh.position.y += (targetY - this.pistonMesh.position.y) * 0.1;

    // Pulse thermal glow if isothermal or isobaric
    if (this.currentProcess === 'isothermal') {
      this.bathMesh.position.y = 1.5 + Math.sin(elapsedTime * 2) * 0.05;
    }
  }

  public updateParameters(params: {
    processType?: ThermodynamicProcessType;
    volumeM3?: number;
    initialVolumeM3?: number;
  }): void {
    if (params.processType) {
      this.currentProcess = params.processType;
      this.lockingPinsGroup.visible = this.currentProcess === 'isochoric';
      this.insulationBlanketMesh.visible = this.currentProcess === 'isentropic';
      this.bathMesh.visible = this.currentProcess === 'isothermal';
    }
    if (params.volumeM3 !== undefined) {
      this.currentVolumeM3 = params.volumeM3;
    }
    if (params.initialVolumeM3 !== undefined) {
      this.initialVolumeM3 = params.initialVolumeM3;
    }
  }
}
