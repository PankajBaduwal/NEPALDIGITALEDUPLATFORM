/**
 * 3D Motor Braking Methods Scene Controller
 * Course Code: U25EE305 / ME3393 / EE8353
 */

import * as THREE from 'three';
import { BaseDrivesSimulation } from '../BaseDrivesSimulation';
import type { BrakingMethod } from '../../core/types';

export class BrakingScene extends BaseDrivesSimulation {
  private rotorGroup: THREE.Group = new THREE.Group();
  private resistorBank: THREE.Mesh[] = [];
  private torqueArrow: THREE.ArrowHelper | null = null;
  private currentMethod: BrakingMethod = 'dynamic-rheostatic';
  private motorSpeedRPM: number = 1440;
  private initialSpeedRPM: number = 1440;
  private isBraking: boolean = false;
  private brakingTimerSec: number = 0;
  private stoppingDurationSec: number = 2.0;

  public initScene(): void {
    const assembly = new THREE.Group();

    // 1. Heavy Rigid Foundation Bed
    const bedGeo = new THREE.BoxGeometry(4.8, 0.35, 2.2);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.4 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, 0.175, 0);
    assembly.add(bed);

    // 2. Drive Motor
    const mStatorGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.6, 32);
    const mStatorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });
    const mStator = new THREE.Mesh(mStatorGeo, mStatorMat);
    mStator.rotation.z = Math.PI / 2;
    mStator.position.set(-1.2, 1.25, 0);
    assembly.add(mStator);

    // 3. Rotating Assembly (Shaft + Massive Cast-Steel Flywheel)
    this.rotorGroup = new THREE.Group();
    this.rotorGroup.position.set(0, 1.25, 0);

    // Continuous Drive Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.15, 0.15, 4.4, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    this.rotorGroup.add(shaft);

    // Heavy High-Inertia Flywheel (J = 0.5 kg·m²)
    const flywheelGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.35, 36);
    const flywheelMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Cast steel rim
      metalness: 0.9,
      roughness: 0.25,
    });
    const flywheel = new THREE.Mesh(flywheelGeo, flywheelMat);
    flywheel.rotation.z = Math.PI / 2;
    flywheel.position.x = 0.8;

    // Flywheel Spokes (4 spokes)
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });
    for (let i = 0; i < 4; i++) {
      const spAngle = (i * Math.PI) / 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.2), spokeMat);
      spoke.position.set(0, 0.55 * Math.cos(spAngle), 0.55 * Math.sin(spAngle));
      flywheel.add(spoke);
    }
    this.rotorGroup.add(flywheel);
    assembly.add(this.rotorGroup);

    // Shaft Bearing Pedestals
    [-0.2, 1.8].forEach((xPos) => {
      const pGeo = new THREE.BoxGeometry(0.35, 1.1, 0.6);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.5 });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set(xPos, 0.725, 0);
      assembly.add(p);
    });

    // 4. Dynamic Braking Resistor Grid Bank (Mounted on back wall)
    const gridRackGeo = new THREE.BoxGeometry(1.6, 1.8, 0.5);
    const gridRackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7, roughness: 0.5 });
    const gridRack = new THREE.Mesh(gridRackGeo, gridRackMat);
    gridRack.position.set(-1.0, 2.6, -1.2);
    assembly.add(gridRack);

    // 6 Resistor Helical Tube Elements that glow when dissipating energy
    for (let r = 0; r < 6; r++) {
      const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x52525b,
        metalness: 0.6,
        roughness: 0.4,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.rotation.z = Math.PI / 2;
      tube.position.set(-1.0, 2.0 + (r * 0.22), -0.92);
      this.resistorBank.push(tube);
      assembly.add(tube);
    }

    // 5. Reverse Braking Torque Vector Indicator (Amber arrow opposing rotation)
    const torqueDir = new THREE.Vector3(0, 0, -1);
    const torqueOrigin = new THREE.Vector3(0.8, 2.6, 0);
    this.torqueArrow = new THREE.ArrowHelper(torqueDir, torqueOrigin, 1.0, 0xf59e0b, 0.25, 0.15);
    this.torqueArrow.visible = false;
    assembly.add(this.torqueArrow);

    this.scene.add(assembly);
    this.resetCamera({ x: 2.8, y: 3.2, z: 4.8 }, { x: 0, y: 1.4, z: 0 });
  }

  public updateAnimation(delta: number, elapsed: number): void {
    if (this.isBraking) {
      this.brakingTimerSec += delta;
      const progress = Math.min(1.0, this.brakingTimerSec / this.stoppingDurationSec);
      // Deceleration curve: speed drops rapidly to 0
      this.motorSpeedRPM = Math.max(0, this.initialSpeedRPM * Math.pow(1 - progress, 1.2));

      // Resistor thermal incandescence during dynamic braking
      if (this.currentMethod === 'dynamic-rheostatic') {
        const glowIntensity = Math.sin(progress * Math.PI) * 1.5;
        this.resistorBank.forEach((tube) => {
          const mat = tube.material as THREE.MeshStandardMaterial;
          mat.emissive.setHex(0xf97316); // Bright incandescent orange
          mat.emissiveIntensity = glowIntensity;
        });
      }

      if (progress >= 1.0) {
        this.isBraking = false;
        this.motorSpeedRPM = 0;
        if (this.torqueArrow) this.torqueArrow.visible = false;
        this.resistorBank.forEach((tube) => {
          (tube.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.0;
        });
      }
    }

    const angularSpeed = (this.motorSpeedRPM * 2 * Math.PI) / 60;
    this.rotorGroup.rotation.x += angularSpeed * delta;
  }

  public updateParameters(params: Record<string, any>): void {
    if (params.brakingMethod !== undefined) {
      this.currentMethod = params.brakingMethod as BrakingMethod;
    }
    if (params.triggerBrake !== undefined && params.triggerBrake) {
      this.isBraking = true;
      this.brakingTimerSec = 0;
      this.stoppingDurationSec = this.currentMethod === 'plugging-counter-current' ? 0.9 : this.currentMethod === 'dynamic-rheostatic' ? 2.2 : 3.8;
      if (this.torqueArrow) this.torqueArrow.visible = true;
    }
    if (params.motorSpeedRPM !== undefined) {
      this.motorSpeedRPM = Number(params.motorSpeedRPM);
      this.initialSpeedRPM = Number(params.motorSpeedRPM);
    }
  }
}
