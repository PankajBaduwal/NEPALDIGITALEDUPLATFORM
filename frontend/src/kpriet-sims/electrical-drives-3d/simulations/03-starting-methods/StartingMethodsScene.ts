/**
 * 3D Motor Starting Methods Simulation Scene
 * Course Code: U25EE305 / ME3393 / EE8353
 */

import * as THREE from 'three';
import { BaseDrivesSimulation } from '../BaseDrivesSimulation';
import type { StartingMethod } from '../../core/types';

export class StartingMethodsScene extends BaseDrivesSimulation {
  private starterGroup: THREE.Group = new THREE.Group();
  private motorRotor: THREE.Mesh | null = null;
  private currentMethod: StartingMethod = 'dol';
  private contactors: { mesh: THREE.Mesh; isClosed: boolean }[] = [];
  private motorSpeedRPM: number = 0;
  private targetSpeedRPM: number = 1440;
  private currentAmps: number = 10.8;
  private isAccelerating: boolean = false;
  private timerSec: number = 0;

  public initScene(): void {
    // 1. Industrial Control Cabinet / Starter Enclosure
    const cabinetGeo = new THREE.BoxGeometry(2.4, 3.2, 0.8);
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Light industrial enclosure grey
      metalness: 0.6,
      roughness: 0.4,
    });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.position.set(-1.8, 1.6, 0);
    this.scene.add(cabinet);

    // Cabinet DIN Rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    [-0.5, 0.3, 1.0].forEach((yPos) => {
      const railGeo = new THREE.BoxGeometry(2.1, 0.08, 0.04);
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(-1.8, 1.6 + yPos, 0.42);
      this.scene.add(rail);
    });

    // 2. Three Electromechanical Contactors on Top Rail (M, STAR, DELTA)
    const contactorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const movingPlungerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }); // Red when open, green when closed

    [-0.6, 0.0, 0.6].forEach((xOffset, idx) => {
      const cBox = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.35), contactorMat);
      cBox.position.set(-1.8 + xOffset, 2.6, 0.58);
      this.scene.add(cBox);

      // Moving contact indicator
      const plunger = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.06), movingPlungerMat.clone());
      plunger.position.set(-1.8 + xOffset, 2.6, 0.76);
      this.scene.add(plunger);
      this.contactors.push({ mesh: plunger, isClosed: false });
    });

    // 3. Autotransformer Coils (Middle DIN Rail)
    const coilMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.3 });
    [-0.5, 0.0, 0.5].forEach((xOffset) => {
      const autoCoil = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 24), coilMat);
      autoCoil.position.set(-1.8 + xOffset, 1.9, 0.58);
      this.scene.add(autoCoil);
    });

    // 4. Solid-State Soft Starter Thyristor Heatsink (Bottom DIN Rail)
    const heatsinkMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.25 });
    const heatsink = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 0.25), heatsinkMat);
    heatsink.position.set(-1.8, 1.1, 0.54);
    this.scene.add(heatsink);

    // 5. Test Motor on Right Bed
    const bedGeo = new THREE.BoxGeometry(2.4, 0.3, 2.0);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(1.8, 0.15, 0);
    this.scene.add(bed);

    // Motor Stator Frame
    const mStatorGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.6, 32);
    const mStatorMat = new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.7, roughness: 0.35 });
    const mStator = new THREE.Mesh(mStatorGeo, mStatorMat);
    mStator.rotation.z = Math.PI / 2;
    mStator.position.set(1.8, 1.2, 0);
    this.scene.add(mStator);

    // Motor Rotating Shaft & Disc
    const mShaftGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.6, 24);
    const mShaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    this.motorRotor = new THREE.Mesh(mShaftGeo, mShaftMat);
    this.motorRotor.rotation.z = Math.PI / 2;
    this.motorRotor.position.set(1.8, 1.2, 0);

    // Tachometer disc on shaft
    const discGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
    const discMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = 1.0;
    this.motorRotor.add(disc);

    this.scene.add(this.motorRotor);

    // 6. Cable Conduit linking Starter Cabinet to Motor
    const conduitGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 16);
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.6 });
    const conduit = new THREE.Mesh(conduitGeo, conduitMat);
    conduit.rotation.z = Math.PI / 2;
    conduit.position.set(0, 0.45, 0);
    this.scene.add(conduit);

    this.resetCamera({ x: 0, y: 3.2, z: 5.8 }, { x: 0, y: 1.4, z: 0 });
  }

  public updateAnimation(delta: number, elapsed: number): void {
    if (this.isAccelerating) {
      this.timerSec += delta;
      const tAcc = this.currentMethod === 'dol' ? 2.2 : this.currentMethod === 'star-delta' ? 5.0 : 4.0;
      const progress = Math.min(1.0, this.timerSec / tAcc);
      this.motorSpeedRPM = this.targetSpeedRPM * Math.pow(progress, 1.3);

      if (progress >= 1.0) {
        this.isAccelerating = false;
      }
    }

    if (this.motorRotor) {
      const angularSpeed = (this.motorSpeedRPM * 2 * Math.PI) / 60;
      this.motorRotor.rotation.x += angularSpeed * delta;
    }
  }

  public updateParameters(params: Record<string, any>): void {
    if (params.startingMethod !== undefined) {
      this.currentMethod = params.startingMethod as StartingMethod;
      this.updateContactorVisuals();
    }
    if (params.isStarting !== undefined && params.isStarting) {
      this.isAccelerating = true;
      this.timerSec = 0;
      this.motorSpeedRPM = 0;
    }
    if (params.targetSpeedRPM !== undefined) {
      this.targetSpeedRPM = Number(params.targetSpeedRPM);
    }
    if (params.currentAmps !== undefined) {
      this.currentAmps = Number(params.currentAmps);
    }
  }

  private updateContactorVisuals(): void {
    // Update contactor indicator plungers
    this.contactors.forEach((c, idx) => {
      let isEngaged = false;
      if (this.currentMethod === 'dol' && idx === 0) isEngaged = true;
      else if (this.currentMethod === 'star-delta' && (idx === 0 || idx === 1)) isEngaged = true;
      else if (this.currentMethod === 'auto-transformer' && idx === 1) isEngaged = true;

      const mat = c.mesh.material as THREE.MeshStandardMaterial;
      if (isEngaged) {
        mat.color.setHex(0x10b981); // Green energized
        c.mesh.position.z = 0.74; // Plunger pulls in
      } else {
        mat.color.setHex(0xef4444); // Red de-energized
        c.mesh.position.z = 0.77;
      }
    });
  }
}
