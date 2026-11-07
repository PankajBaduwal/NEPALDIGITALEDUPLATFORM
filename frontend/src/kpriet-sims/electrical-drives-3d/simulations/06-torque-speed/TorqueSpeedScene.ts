/**
 * 3D Torque–Speed Characteristics & Dynamometer Test Rig Scene Controller
 * Course Code: U25EE305 / ME3393 / EE8353
 */

import * as THREE from 'three';
import { BaseDrivesSimulation } from '../BaseDrivesSimulation';

export class TorqueSpeedScene extends BaseDrivesSimulation {
  private rotorGroup: THREE.Group = new THREE.Group();
  private loadCellMesh: THREE.Mesh | null = null;
  private motorRPM: number = 1440;
  private loadTorqueNm: number = 25;
  private isRunning: boolean = true;

  public initScene(): void {
    const testRig = new THREE.Group();

    // 1. Cast-Iron Machined Test Bed
    const bedGeo = new THREE.BoxGeometry(5.2, 0.4, 2.2);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.35 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, 0.2, 0);
    testRig.add(bed);

    // T-Slots in test bed
    const slotMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    [-0.5, 0.5].forEach((zPos) => {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.05, 0.1), slotMat);
      slot.position.set(0, 0.4, zPos);
      testRig.add(slot);
    });

    // 2. Drive Motor Under Test (Left)
    const motorStatorGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.5, 32);
    const motorStatorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
    const motorStator = new THREE.Mesh(motorStatorGeo, motorStatorMat);
    motorStator.rotation.z = Math.PI / 2;
    motorStator.position.set(-1.4, 1.3, 0);
    testRig.add(motorStator);

    // 3. Rotating Coupled Drive Shaft & In-Line Torque Transducer
    this.rotorGroup = new THREE.Group();
    this.rotorGroup.position.set(0, 1.3, 0);

    const shaftGeo = new THREE.CylinderGeometry(0.14, 0.14, 4.4, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    this.rotorGroup.add(shaft);

    // Flexible Flanged Couplings between Motor and Dynamometer
    [-0.5, 0.5].forEach((xPos) => {
      const cGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 24);
      const cMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 });
      const coupling = new THREE.Mesh(cGeo, cMat);
      coupling.position.x = xPos;
      coupling.rotation.z = Math.PI / 2;
      this.rotorGroup.add(coupling);
    });

    // In-Line Optical Speed & Torque Sensor Wheel
    const sensorWheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 32);
    const sensorWheelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
    const sensorWheel = new THREE.Mesh(sensorWheelGeo, sensorWheelMat);
    sensorWheel.position.x = 0;
    sensorWheel.rotation.z = Math.PI / 2;
    this.rotorGroup.add(sensorWheel);

    testRig.add(this.rotorGroup);

    // 4. Eddy-Current / Magnetic Powder Dynamometer Absorber (Right)
    const dynoStatorGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.5, 32);
    const dynoStatorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.4 });
    const dynoStator = new THREE.Mesh(dynoStatorGeo, dynoStatorMat);
    dynoStator.rotation.z = Math.PI / 2;
    dynoStator.position.set(1.4, 1.3, 0);
    testRig.add(dynoStator);

    // Dynamometer Torque Reaction Arm & S-Beam Load Cell
    const armGeo = new THREE.BoxGeometry(0.12, 0.15, 0.9);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(1.4, 1.3, 0.75);
    testRig.add(arm);

    // S-Type Tension/Compression Load Cell attached to bed
    const cellGeo = new THREE.BoxGeometry(0.2, 0.4, 0.15);
    const cellMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    this.loadCellMesh = new THREE.Mesh(cellGeo, cellMat);
    this.loadCellMesh.position.set(1.4, 0.6, 1.15);
    testRig.add(this.loadCellMesh);

    // Digital Load Indicator readout pillar
    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(0, 1.0, -0.9);
    testRig.add(pillar);

    const screenGeo = new THREE.BoxGeometry(0.6, 0.4, 0.1);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.6, -0.9);
    testRig.add(screen);

    this.scene.add(testRig);
    this.resetCamera({ x: 0, y: 3.2, z: 5.2 }, { x: 0, y: 1.3, z: 0 });
  }

  public updateAnimation(delta: number, elapsed: number): void {
    if (this.isRunning) {
      const angularSpeed = (this.motorRPM * 2 * Math.PI) / 60;
      this.rotorGroup.rotation.x += angularSpeed * delta;
    }
  }

  public updateParameters(params: Record<string, any>): void {
    if (params.motorRPM !== undefined) {
      this.motorRPM = Number(params.motorRPM);
    }
    if (params.loadTorqueNm !== undefined) {
      this.loadTorqueNm = Number(params.loadTorqueNm);
    }
    if (params.isRunning !== undefined) {
      this.isRunning = Boolean(params.isRunning);
    }
  }
}
