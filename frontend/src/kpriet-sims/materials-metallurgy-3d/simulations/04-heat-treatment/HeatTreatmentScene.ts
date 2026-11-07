/**
 * Module 4 — Industrial Heat-Treatment Process & Furnace Thermal Simulator
 * 3D Electric resistance furnace, incandescent thermal radiation, and quench tank
 */

import * as THREE from 'three';
import { BaseMetallurgySimulation } from '../BaseMetallurgySimulation';
import type { HeatTreatmentProcessType, QuenchMedium } from '../../core/types';

export class HeatTreatmentScene extends BaseMetallurgySimulation {
  private process: HeatTreatmentProcessType = 'hardening-quench';
  private quenchMedium: QuenchMedium = 'water';
  private furnaceTempC: number = 860;
  private currentSpecimenTempC: number = 860;
  private isCycleRunning: boolean = false;
  private cycleTimeSec: number = 0;

  private furnaceGroup: THREE.Group = new THREE.Group();
  private specimenMesh: THREE.Mesh | null = null;
  private heatingCoils: THREE.Mesh[] = [];
  private quenchTankMesh: THREE.Mesh | null = null;
  private steamParticles: THREE.Points | null = null;
  private specimenMaterial: THREE.MeshStandardMaterial | null = null;

  protected initScene(): void {
    this.camera.position.set(4.5, 4.0, 7.0);
    this.controls.target.set(0, 1.5, 0);
    this.controls.update();

    this.scene.add(this.furnaceGroup);
    this.buildFurnaceAndQuenchTank();
    this.buildSteamParticleSystem();
    this.updateThermalIncandescence();
  }

  private buildFurnaceAndQuenchTank(): void {
    // 1. Industrial Box Furnace Outer Shell (Steel enclosure)
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Slate industrial paint
      metalness: 0.6,
      roughness: 0.4,
    });
    const shellGeo = new THREE.BoxGeometry(3.0, 2.5, 2.8);
    const outerShell = new THREE.Mesh(shellGeo, shellMat);
    outerShell.position.set(-1.8, 1.6, 0);
    outerShell.castShadow = true;
    this.furnaceGroup.add(outerShell);

    // Furnace Chamber Interior (Refractory ceramic cavity)
    const cavityMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Warm refractory firebrick
      roughness: 0.9,
    });
    const cavityGeo = new THREE.BoxGeometry(2.2, 1.6, 2.0);
    const cavity = new THREE.Mesh(cavityGeo, cavityMat);
    cavity.position.set(-1.8, 1.6, 0.45);
    this.furnaceGroup.add(cavity);

    // Glowing Electric Resistance Heating Coils (Nichrome wire coils on walls)
    const coilMat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff2200,
      emissiveIntensity: 1.2,
      roughness: 0.3,
    });
    const coilGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 16);
    for (let i = -0.5; i <= 0.5; i += 0.3) {
      const coilLeft = new THREE.Mesh(coilGeo, coilMat);
      coilLeft.position.set(-2.8, 1.6 + i, 0.45);
      coilLeft.rotation.z = Math.PI / 2;
      this.furnaceGroup.add(coilLeft);
      this.heatingCoils.push(coilLeft);
    }

    // Specimen on Hearth
    this.specimenMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      emissive: 0xff3300,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.3,
    });
    const specGeo = new THREE.BoxGeometry(0.8, 0.4, 0.6);
    this.specimenMesh = new THREE.Mesh(specGeo, this.specimenMaterial);
    this.specimenMesh.position.set(-1.8, 1.05, 0.45);
    this.specimenMesh.castShadow = true;
    this.furnaceGroup.add(this.specimenMesh);

    // 2. Quench Tank (Right side)
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const tankGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    this.quenchTankMesh = new THREE.Mesh(tankGeo, tankMat);
    this.quenchTankMesh.position.set(2.0, 1.0, 0);
    this.furnaceGroup.add(this.quenchTankMesh);

    // Quench Liquid Surface
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Cool blue water/brine or amber oil
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
    });
    const liquidGeo = new THREE.BoxGeometry(1.6, 0.1, 1.6);
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.set(2.0, 1.8, 0);
    this.furnaceGroup.add(liquid);
  }

  private buildSteamParticleSystem(): void {
    const particleCount = 60;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 2.0 + (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = 1.9 + Math.random() * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
    });
    this.steamParticles = new THREE.Points(geo, pMat);
    this.steamParticles.visible = false;
    this.scene.add(this.steamParticles);
  }

  private updateThermalIncandescence(): void {
    if (!this.specimenMaterial) return;

    // Incandescent color transition from Black -> Cherry Red (700°C) -> Bright Orange (850°C) -> White Yellow (1100°C)
    const T = this.currentSpecimenTempC;
    if (T < 500) {
      this.specimenMaterial.emissive.setHex(0x000000);
      this.specimenMaterial.emissiveIntensity = 0;
    } else if (T < 750) {
      this.specimenMaterial.emissive.setHex(0x7f1d1d); // Dark cherry
      this.specimenMaterial.emissiveIntensity = ((T - 500) / 250) * 0.5;
    } else if (T < 900) {
      this.specimenMaterial.emissive.setHex(0xea580c); // Bright orange
      this.specimenMaterial.emissiveIntensity = 0.5 + ((T - 750) / 150) * 0.5;
    } else {
      this.specimenMaterial.emissive.setHex(0xfef08a); // Bright yellow
      this.specimenMaterial.emissiveIntensity = 1.2;
    }
  }

  public updateAnimation(delta: number, _elapsed: number): void {
    if (this.isCycleRunning) {
      this.cycleTimeSec += delta;

      // Stage 1: In furnace soaking (0 to 3s)
      if (this.cycleTimeSec < 3.0) {
        if (this.specimenMesh) {
          this.specimenMesh.position.set(-1.8, 1.05, 0.45);
        }
        this.currentSpecimenTempC = this.furnaceTempC;
        if (this.steamParticles) this.steamParticles.visible = false;
      }
      // Stage 2: Transfer to quench tank (3s to 5s)
      else if (this.cycleTimeSec < 5.0) {
        const t = (this.cycleTimeSec - 3.0) / 2.0;
        const x = -1.8 + t * 3.8;
        const y = 1.05 + Math.sin(t * Math.PI) * 1.5;
        if (this.specimenMesh) {
          this.specimenMesh.position.set(x, y, 0.45 * (1 - t));
        }
      }
      // Stage 3: Submerged in quench medium (5s to 9s)
      else if (this.cycleTimeSec < 9.0) {
        if (this.specimenMesh) {
          this.specimenMesh.position.set(2.0, 1.2, 0);
        }
        // Cooling down
        const coolingFactor = this.quenchMedium === 'water' || this.quenchMedium === 'brine' ? 180 : 70;
        this.currentSpecimenTempC = Math.max(25, this.currentSpecimenTempC - delta * coolingFactor);

        if (this.steamParticles) {
          this.steamParticles.visible = this.currentSpecimenTempC > 100;
          const pos = this.steamParticles.geometry.attributes.position;
          if (pos) {
            for (let i = 0; i < pos.count; i++) {
              let y = pos.getY(i) + delta * 1.2;
              if (y > 3.5) y = 1.9;
              pos.setY(i, y);
            }
            pos.needsUpdate = true;
          }
        }
      } else {
        this.isCycleRunning = false;
        if (this.steamParticles) this.steamParticles.visible = false;
      }

      this.updateThermalIncandescence();
    }
  }

  public updateParameters(params: {
    process?: HeatTreatmentProcessType;
    quenchMedium?: QuenchMedium;
    furnaceTempC?: number;
    startCycle?: boolean;
  }): void {
    if (params.process !== undefined) {
      this.process = params.process;
    }
    if (params.quenchMedium !== undefined) {
      this.quenchMedium = params.quenchMedium;
    }
    if (params.furnaceTempC !== undefined) {
      this.furnaceTempC = params.furnaceTempC;
      this.currentSpecimenTempC = params.furnaceTempC;
      this.updateThermalIncandescence();
    }
    if (params.startCycle) {
      this.isCycleRunning = true;
      this.cycleTimeSec = 0;
      this.currentSpecimenTempC = this.furnaceTempC;
    }
  }
}
