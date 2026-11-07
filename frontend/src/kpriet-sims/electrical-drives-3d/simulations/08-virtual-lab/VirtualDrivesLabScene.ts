/**
 * 3D Virtual Electrical Drives Laboratory Scene Controller
 * Course Code: U25EE305 / ME3393 / EE8353
 */

import * as THREE from 'three';
import { BaseDrivesSimulation } from '../BaseDrivesSimulation';

export class VirtualDrivesLabScene extends BaseDrivesSimulation {
  private rotorGroup: THREE.Group = new THREE.Group();
  private needleTacho: THREE.Mesh | null = null;
  private needleAmps: THREE.Mesh | null = null;
  private needleVolts: THREE.Mesh | null = null;
  private motorRPM: number = 1440;
  private currentAmps: number = 10.8;
  private voltageV: number = 415;
  private isRunning: boolean = true;

  public initScene(): void {
    const labBench = new THREE.Group();

    // 1. Heavy Wooden/Steel Workstation Lab Table
    const tableTopGeo = new THREE.BoxGeometry(5.6, 0.35, 2.8);
    const tableTopMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.3,
      roughness: 0.7,
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.set(0, 0.175, 0);
    labBench.add(tableTop);

    // Table Tubular Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 });
    [-2.6, 2.6].forEach((xPos) => {
      [-1.2, 1.2].forEach((zPos) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(xPos, -0.625, zPos);
        labBench.add(leg);
      });
    });

    // 2. Motor-Generator (M-G) Set on Vibration Isolation Bed
    const mgBedGeo = new THREE.BoxGeometry(3.6, 0.25, 1.6);
    const mgBedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.35 });
    const mgBed = new THREE.Mesh(mgBedGeo, mgBedMat);
    mgBed.position.set(0, 0.45, 0.2);
    labBench.add(mgBed);

    // Motor (Left Machine)
    const motorStatorGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.3, 32);
    const motorStatorMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.8, roughness: 0.3 });
    const motorStator = new THREE.Mesh(motorStatorGeo, motorStatorMat);
    motorStator.rotation.z = Math.PI / 2;
    motorStator.position.set(-1.0, 1.3, 0.2);
    labBench.add(motorStator);

    // Generator / Dynamic Load (Right Machine)
    const genStatorGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.3, 32);
    const genStatorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.35 });
    const genStator = new THREE.Mesh(genStatorGeo, genStatorMat);
    genStator.rotation.z = Math.PI / 2;
    genStator.position.set(1.0, 1.3, 0.2);
    labBench.add(genStator);

    // Coupled Drive Shaft & Flexible Rubber Tyre Coupling
    this.rotorGroup = new THREE.Group();
    this.rotorGroup.position.set(0, 1.3, 0.2);

    const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.4, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    this.rotorGroup.add(shaft);

    const couplingGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 24);
    const couplingMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const coupling = new THREE.Mesh(couplingGeo, couplingMat);
    coupling.rotation.z = Math.PI / 2;
    this.rotorGroup.add(coupling);

    labBench.add(this.rotorGroup);

    // 3. Laboratory Instrumentation Console (Back Rack)
    const rackGeo = new THREE.BoxGeometry(5.2, 1.6, 0.6);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, 1.6, -1.0);
    labBench.add(rack);

    // 4 Analog / Digital Meter Bezels (Voltmeter, Ammeter, Wattmeter 1, Wattmeter 2)
    const meterMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

    [-1.8, -0.6, 0.6, 1.8].forEach((xPos, idx) => {
      // Meter Frame
      const mFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      mFrame.position.set(xPos, 1.6, -0.68);
      labBench.add(mFrame);

      // Meter Face Plate
      const mFace = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.02), meterMat);
      mFace.position.set(xPos, 1.6, -0.63);
      labBench.add(mFace);

      // Indicator Needle
      const needle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.02), needleMat);
      needle.position.set(xPos, 1.6, -0.61);
      needle.rotation.z = (idx - 1.5) * 0.25;
      labBench.add(needle);

      if (idx === 0) this.needleVolts = needle;
      else if (idx === 1) this.needleAmps = needle;
      else if (idx === 2) this.needleTacho = needle;
    });

    // 4. Three-Phase Variac (Rotary Auto-Transformer Knob on Left)
    const variacGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
    const variacMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const variac = new THREE.Mesh(variacGeo, variacMat);
    variac.position.set(-2.0, 0.5, 0.8);
    labBench.add(variac);

    const dialKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    dialKnob.position.set(-2.0, 0.7, 0.8);
    labBench.add(dialKnob);

    // 5. Terminal Connection Board with 4mm Banana Sockets (Right)
    const terminalBoardGeo = new THREE.BoxGeometry(1.2, 0.1, 0.8);
    const terminalBoardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const termBoard = new THREE.Mesh(terminalBoardGeo, terminalBoardMat);
    termBoard.position.set(2.0, 0.4, 0.8);
    labBench.add(termBoard);

    // Banana Socket Jacks (Red, Yellow, Blue, Black Neutral)
    const jackColors = [0xef4444, 0xeab308, 0x3b82f6, 0x18181b];
    jackColors.forEach((color, idx) => {
      const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16), new THREE.MeshStandardMaterial({ color }));
      jack.position.set(1.7 + idx * 0.2, 0.48, 0.8);
      labBench.add(jack);
    });

    this.scene.add(labBench);
    this.resetCamera({ x: 0, y: 3.4, z: 5.4 }, { x: 0, y: 1.4, z: 0 });
  }

  public updateAnimation(delta: number, elapsed: number): void {
    if (this.isRunning) {
      const angularSpeed = (this.motorRPM * 2 * Math.PI) / 60;
      this.rotorGroup.rotation.x += angularSpeed * delta;
    }

    // Dynamic meter needle jitter for realistic lab instruments
    if (this.needleAmps) {
      const jitter = (Math.sin(elapsed * 12) + Math.cos(elapsed * 17)) * 0.02;
      this.needleAmps.rotation.z = -0.3 + (this.currentAmps / 30) * 0.8 + jitter;
    }
  }

  public updateParameters(params: Record<string, any>): void {
    if (params.motorRPM !== undefined) {
      this.motorRPM = Number(params.motorRPM);
    }
    if (params.currentAmps !== undefined) {
      this.currentAmps = Number(params.currentAmps);
    }
    if (params.voltageV !== undefined) {
      this.voltageV = Number(params.voltageV);
    }
    if (params.isRunning !== undefined) {
      this.isRunning = Boolean(params.isRunning);
    }
  }
}
