/**
 * 3D Three-Phase Induction Motor & Rotating Magnetic Field (RMF) Scene Controller
 * Course Code: U25EE305 / ME3393 / EE8353
 */

import * as THREE from 'three';
import { BaseDrivesSimulation } from '../BaseDrivesSimulation';

export class InductionMotorScene extends BaseDrivesSimulation {
  private rotorGroup: THREE.Group = new THREE.Group();
  private rmfArrow: THREE.ArrowHelper | null = null;
  private statorCoils: THREE.Mesh[] = [];
  private syncSpeedRPM: number = 1500;
  private rotorSpeedRPM: number = 1440;
  private slip: number = 0.04;
  private isRunning: boolean = true;
  private currentRotorRPM: number = 0;
  private rmfAngle: number = 0;

  public initScene(): void {
    const motorAssembly = new THREE.Group();

    // 1. Ribbed Cast-Iron Stator Housing with Cooling Fins
    const housingGroup = new THREE.Group();
    const mainHousingGeo = new THREE.CylinderGeometry(1.65, 1.65, 2.4, 32);
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e, // Industrial teal / emerald green motor casing
      metalness: 0.7,
      roughness: 0.4,
    });
    const mainHousing = new THREE.Mesh(mainHousingGeo, housingMat);
    mainHousing.rotation.z = Math.PI / 2;
    housingGroup.add(mainHousing);

    // Stator Cooling Fins (Radial fins around circumference)
    const finMat = new THREE.MeshStandardMaterial({ color: 0x115e59, metalness: 0.75, roughness: 0.35 });
    for (let i = 0; i < 20; i++) {
      const finAngle = (i * 2 * Math.PI) / 20;
      const finGeo = new THREE.BoxGeometry(2.3, 0.25, 0.06);
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(0, 1.75 * Math.cos(finAngle), 1.75 * Math.sin(finAngle));
      fin.rotation.x = -finAngle;
      housingGroup.add(fin);
    }

    // Top Terminal Box (for 6 terminal studs: U1-U2, V1-V2, W1-W2)
    const boxGeo = new THREE.BoxGeometry(0.8, 0.5, 0.8);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x134e4a, metalness: 0.8, roughness: 0.3 });
    const terminalBox = new THREE.Mesh(boxGeo, boxMat);
    terminalBox.position.set(0, 1.95, 0);
    housingGroup.add(terminalBox);

    // Terminal Gland
    const glandGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16);
    const glandMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const gland = new THREE.Mesh(glandGeo, glandMat);
    gland.position.set(0.48, 1.95, 0);
    gland.rotation.z = Math.PI / 2;
    housingGroup.add(gland);

    // Base mounting feet
    const feetGeo = new THREE.BoxGeometry(2.6, 0.3, 2.6);
    const feetMat = new THREE.MeshStandardMaterial({ color: 0x042f2e, metalness: 0.9, roughness: 0.45 });
    const feet = new THREE.Mesh(feetGeo, feetMat);
    feet.position.set(0, -1.5, 0);
    housingGroup.add(feet);

    housingGroup.position.set(0, 1.6, 0);
    motorAssembly.add(housingGroup);

    // 2. Three-Phase Distributed Stator Windings (Red, Yellow, Blue coils)
    const phaseColors = [0xef4444, 0xeab308, 0x3b82f6]; // Phase U (R), Phase V (Y), Phase W (B)
    for (let i = 0; i < 12; i++) {
      const angle = (i * 2 * Math.PI) / 12;
      const color = phaseColors[i % 3];
      const coilGeo = new THREE.BoxGeometry(2.1, 0.18, 0.14);
      const coilMat = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.8,
        roughness: 0.25,
        emissive: color,
        emissiveIntensity: 0.15,
      });
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.set(0, 1.6 + 1.25 * Math.cos(angle), 1.25 * Math.sin(angle));
      this.statorCoils.push(coil);
      motorAssembly.add(coil);
    }

    // 3. Squirrel Cage Rotor Assembly
    this.rotorGroup = new THREE.Group();
    this.rotorGroup.position.set(0, 1.6, 0);

    // High grade steel rotor shaft
    const shaftGeo = new THREE.CylinderGeometry(0.22, 0.22, 4.4, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    this.rotorGroup.add(shaft);

    // Laminated Silicon Steel Rotor Core
    const rotorCoreGeo = new THREE.CylinderGeometry(0.98, 0.98, 1.6, 32);
    const rotorCoreMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.4 });
    const rotorCore = new THREE.Mesh(rotorCoreGeo, rotorCoreMat);
    rotorCore.rotation.z = Math.PI / 2;
    this.rotorGroup.add(rotorCore);

    // Heavy Copper/Aluminum End-Rings (Short-circuiting the bars at each end)
    const endRingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    [-0.82, 0.82].forEach((xPos) => {
      const ringGeo = new THREE.TorusGeometry(0.94, 0.08, 16, 32);
      const ring = new THREE.Mesh(ringGeo, endRingMat);
      ring.position.x = xPos;
      ring.rotation.y = Math.PI / 2;
      this.rotorGroup.add(ring);
    });

    // Skewed Squirrel Cage Rotor Bars (e.g. 18 skewed bars)
    const barMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
    const skewAngleOffset = 0.12; // Skewed bars prevent cogging and crawling
    for (let i = 0; i < 18; i++) {
      const angle = (i * 2 * Math.PI) / 18;
      const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.64, 8);
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, 0.96 * Math.cos(angle), 0.96 * Math.sin(angle));
      bar.rotation.z = Math.PI / 2;
      bar.rotation.y = skewAngleOffset;
      this.rotorGroup.add(bar);
    }

    // Cooling fan blades at non-drive end
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    for (let i = 0; i < 8; i++) {
      const fAngle = (i * 2 * Math.PI) / 8;
      const bladeGeo = new THREE.BoxGeometry(0.12, 0.35, 0.08);
      const blade = new THREE.Mesh(bladeGeo, fanMat);
      blade.position.set(-1.1, 0.6 * Math.cos(fAngle), 0.6 * Math.sin(fAngle));
      this.rotorGroup.add(blade);
    }

    // Drive end shaft extension with keyway
    const keywayGeo = new THREE.BoxGeometry(0.4, 0.06, 0.06);
    const keywayMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const keyway = new THREE.Mesh(keywayGeo, keywayMat);
    keyway.position.set(1.9, 0.21, 0);
    this.rotorGroup.add(keyway);

    motorAssembly.add(this.rotorGroup);

    // 4. Rotating Magnetic Field (RMF) Vector Indicator (Golden phasor arrow)
    const rmfDir = new THREE.Vector3(0, 1, 0);
    const rmfOrigin = new THREE.Vector3(0, 1.6, 0);
    this.rmfArrow = new THREE.ArrowHelper(rmfDir, rmfOrigin, 1.5, 0xfacc15, 0.3, 0.2);
    motorAssembly.add(this.rmfArrow);

    this.scene.add(motorAssembly);
    this.resetCamera({ x: 3.6, y: 3.2, z: 4.6 }, { x: 0, y: 1.6, z: 0 });
  }

  public updateAnimation(delta: number, elapsed: number): void {
    if (!this.isRunning) {
      this.currentRotorRPM = Math.max(0, this.currentRotorRPM - 400 * delta);
    } else {
      const diff = this.rotorSpeedRPM - this.currentRotorRPM;
      this.currentRotorRPM += diff * Math.min(1.0, delta * 3.0);
    }

    // 1. Rotate the Stator Rotating Magnetic Field (RMF) at exact Synchronous Speed Ns
    const syncAngularSpeed = (this.syncSpeedRPM * 2 * Math.PI) / 60;
    this.rmfAngle += syncAngularSpeed * delta;

    if (this.rmfArrow) {
      const dir = new THREE.Vector3(0, Math.cos(this.rmfAngle), Math.sin(this.rmfAngle)).normalize();
      this.rmfArrow.setDirection(dir);
    }

    // Modulate stator coil emission to demonstrate 3-phase alternating current waves
    this.statorCoils.forEach((coil, idx) => {
      const phaseOffset = (idx % 3) * ((2 * Math.PI) / 3);
      const intensity = 0.15 + 0.35 * Math.max(0, Math.sin(this.rmfAngle - phaseOffset));
      (coil.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    });

    // 2. Rotate the Rotor at Rotor Speed Nr = Ns · (1 - s)
    const rotorAngularSpeed = (this.currentRotorRPM * 2 * Math.PI) / 60;
    this.rotorGroup.rotation.x += rotorAngularSpeed * delta;
  }

  public updateParameters(params: Record<string, any>): void {
    if (params.syncSpeedRPM !== undefined) {
      this.syncSpeedRPM = Number(params.syncSpeedRPM);
    }
    if (params.rotorSpeedRPM !== undefined) {
      this.rotorSpeedRPM = Number(params.rotorSpeedRPM);
    }
    if (params.slip !== undefined) {
      this.slip = Number(params.slip);
    }
    if (params.isRunning !== undefined) {
      this.isRunning = Boolean(params.isRunning);
    }
  }
}
