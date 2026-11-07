/**
 * 3D Variable Frequency Drive (VFD) Scene Controller
 * Course Code: U25EE305 / ME3393 / EE8353
 */

import * as THREE from 'three';
import { BaseDrivesSimulation } from '../BaseDrivesSimulation';

export class VFDScene extends BaseDrivesSimulation {
  private motorRotor: THREE.Mesh | null = null;
  private ledDisplayMesh: THREE.Mesh | null = null;
  private outputFrequencyHz: number = 50;
  private motorRPM: number = 1440;
  private isRunning: boolean = true;
  private dcBusVoltageV: number = 587;

  public initScene(): void {
    const vfdBench = new THREE.Group();

    // 1. Bench Base
    const benchGeo = new THREE.BoxGeometry(4.8, 0.3, 2.4);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.15, 0);
    vfdBench.add(bench);

    // 2. VFD Industrial Cabinet (Left Side)
    const vfdGroup = new THREE.Group();
    vfdGroup.position.set(-1.4, 1.6, 0);

    const cabinetGeo = new THREE.BoxGeometry(1.6, 2.4, 0.9);
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    vfdGroup.add(cabinet);

    // Transparent Smoked Acrylic Window Door
    const windowGeo = new THREE.BoxGeometry(1.4, 1.8, 0.05);
    const windowMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transmission: 0.85,
      opacity: 1.0,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(0, 0, 0.48);
    vfdGroup.add(win);

    // Internal Power Stage: 6-Pack IGBT Inverter Module on Aluminum Heatsink
    const heatsinkGeo = new THREE.BoxGeometry(1.2, 0.8, 0.3);
    const heatsinkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const heatsink = new THREE.Mesh(heatsinkGeo, heatsinkMat);
    heatsink.position.set(0, -0.4, 0.15);
    vfdGroup.add(heatsink);

    // 6 IGBT Modules (Small black packages with gold terminals)
    const igbtMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 });
    [-0.4, 0.0, 0.4].forEach((xPos) => {
      [0.15, -0.15].forEach((yPos) => {
        const igbt = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.08), igbtMat);
        igbt.position.set(xPos, -0.4 + yPos, 0.32);
        vfdGroup.add(igbt);
      });
    });

    // DC Link Capacitor Bank (4 Blue Cylindrical Electrolytic Capacitors)
    const capMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.6, roughness: 0.3 });
    [-0.3, 0.3].forEach((xPos) => {
      [0.45, 0.75].forEach((yPos) => {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.4, 24), capMat);
        cap.position.set(xPos, yPos, 0.2);
        vfdGroup.add(cap);
      });
    });

    // Operator Keypad with 7-Segment LED Display (Top front)
    const keypadGeo = new THREE.BoxGeometry(0.8, 0.4, 0.08);
    const keypadMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const keypad = new THREE.Mesh(keypadGeo, keypadMat);
    keypad.position.set(0, 0.85, 0.52);

    // Digital LED Display Screen
    const ledGeo = new THREE.BoxGeometry(0.5, 0.2, 0.02);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Bright green 7-segment display
    this.ledDisplayMesh = new THREE.Mesh(ledGeo, ledMat);
    this.ledDisplayMesh.position.set(0, 0.05, 0.05);
    keypad.add(this.ledDisplayMesh);
    vfdGroup.add(keypad);

    vfdBench.add(vfdGroup);

    // 3. Driven 3-Phase Induction Motor (Right Side)
    const motorGroup = new THREE.Group();
    motorGroup.position.set(1.4, 1.25, 0);

    const statorGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 32);
    const statorMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.75, roughness: 0.35 });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.rotation.z = Math.PI / 2;
    motorGroup.add(stator);

    // Motor Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.5, 24);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    this.motorRotor = new THREE.Mesh(shaftGeo, shaftMat);
    this.motorRotor.rotation.z = Math.PI / 2;
    motorGroup.add(this.motorRotor);

    // Speed disc on shaft with visual stripe
    const discGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 24);
    const discMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = 0.9;
    this.motorRotor.add(disc);

    vfdBench.add(motorGroup);

    // 4. Heavy Power Cable connecting VFD output to Motor terminals
    const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 16);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.rotation.z = Math.PI / 2;
    cable.position.set(0, 0.45, 0);
    vfdBench.add(cable);

    this.scene.add(vfdBench);
    this.resetCamera({ x: 0, y: 3.0, z: 5.2 }, { x: 0, y: 1.4, z: 0 });
  }

  public updateAnimation(delta: number, elapsed: number): void {
    if (this.motorRotor && this.isRunning) {
      const angularSpeed = (this.motorRPM * 2 * Math.PI) / 60;
      this.motorRotor.rotation.x += angularSpeed * delta;
    }
  }

  public updateParameters(params: Record<string, any>): void {
    if (params.outputFrequencyHz !== undefined) {
      this.outputFrequencyHz = Number(params.outputFrequencyHz);
    }
    if (params.rotorSpeedRPM !== undefined) {
      this.motorRPM = Number(params.rotorSpeedRPM);
    }
    if (params.isRunning !== undefined) {
      this.isRunning = Boolean(params.isRunning);
    }
    if (params.dcBusVoltageV !== undefined) {
      this.dcBusVoltageV = Number(params.dcBusVoltageV);
    }
  }
}
