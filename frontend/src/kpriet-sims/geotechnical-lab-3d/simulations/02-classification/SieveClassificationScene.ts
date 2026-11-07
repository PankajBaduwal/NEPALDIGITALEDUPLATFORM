/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Module 2: Soil Classification & Sieve Analysis (IS 2720 Part 4 / IS 1498)
 */

import * as THREE from 'three';
import { BaseGeotechnicalSimulation } from '../../core/BaseGeotechnicalSimulation';
import type { IBaseGeotechnicalSimulationOptions } from '../../core/BaseGeotechnicalSimulation';
import type { ISieveData } from '../../core/types';

export class SieveClassificationScene extends BaseGeotechnicalSimulation {
  private shakerGroup: THREE.Group;
  private sieveStackGroup: THREE.Group;
  private digitalBalanceGroup: THREE.Group;
  private isShaking = false;
  private shakeTime = 0;
  private balanceDisplaySprite: THREE.Sprite | null = null;

  constructor(options: IBaseGeotechnicalSimulationOptions, initialSieves: ISieveData[]) {
    super(options);

    this.defaultCameraPos.set(2.8, 2.2, 3.2);
    this.defaultTarget.set(0, 1.1, 0);
    this.resetCamera();

    // 1. Lab Bench
    const bench = this.createLaboratoryBench(3.2, 1.8, 0.85);
    this.labGroup.add(bench);

    // 2. Mechanical Sieve Shaker
    this.shakerGroup = this.buildMechanicalSieveShaker();
    this.labGroup.add(this.shakerGroup);

    // 3. Brass Sieve Stack
    this.sieveStackGroup = this.buildSieveStack(initialSieves);
    this.shakerGroup.add(this.sieveStackGroup);

    // 4. Digital Balance Station
    this.digitalBalanceGroup = this.buildDigitalBalance();
    this.labGroup.add(this.digitalBalanceGroup);

    // 5. Soil Sample Trays & Scoop
    this.buildSampleTrays();
  }

  private buildMechanicalSieveShaker(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(-0.6, 0.89, 0);

    // Heavy Cast Base
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.14, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.07;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Shaker Motor Housing
    const motorGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.6 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.y = 0.22;
    motor.castShadow = true;
    group.add(motor);

    // Rotary Speed Knob & Timer
    const knobGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(0, 0.22, 0.26);
    group.add(knob);

    // Twin Chrome Vertical Tie Rods
    const rodGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.85, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.95 });

    const rodL = new THREE.Mesh(rodGeo, rodMat);
    rodL.position.set(-0.25, 0.6, 0);
    rodL.castShadow = true;
    group.add(rodL);

    const rodR = new THREE.Mesh(rodGeo, rodMat);
    rodR.position.set(0.25, 0.6, 0);
    rodR.castShadow = true;
    group.add(rodR);

    // Clamping Top Yoke with Screw Handle
    const yokeGeo = new THREE.BoxGeometry(0.58, 0.04, 0.1);
    const yokeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.7 });
    const yoke = new THREE.Mesh(yokeGeo, yokeMat);
    yoke.position.set(0, 0.98, 0);
    yoke.castShadow = true;
    group.add(yoke);

    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 16);
    const handle = new THREE.Mesh(handleGeo, knobMat);
    handle.position.set(0, 1.03, 0);
    group.add(handle);

    this.registerInteractive(base, {
      id: 'shaker-motor',
      name: 'Motorized Gyratory Sieve Shaker (IS 2720 Part 4)',
      functionDesc: 'Imparts circular orbit and vertical tapping shocks (approx 200 oscillations/min) to separate dry granular particles without attrition.',
      specification: '220V 0.25 HP motor with integrated digital timer (preset: 10 minutes)',
      safetyCaution: 'Ensure clamping yoke thumbscrews are firmly tightened before starting.',
    });

    return group;
  }

  private buildSieveStack(sieves: ISieveData[]): THREE.Group {
    const stack = new THREE.Group();
    stack.position.set(0, 0.32, 0);

    const sieveCount = Math.max(5, sieves.length);
    const sieveHeight = 0.06;
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.85,
    });
    const meshWireMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.4,
      metalness: 0.9,
      wireframe: true,
    });

    for (let i = 0; i < sieveCount; i++) {
      const sieveData = sieves[i] || { sieveName: `Sieve #${i + 1}`, sieveSizeMm: 1.0 };
      const y = i * (sieveHeight + 0.005);

      // Outer brass cylindrical rim
      const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, sieveHeight, 32, 1, true);
      const rim = new THREE.Mesh(rimGeo, brassMat);
      rim.position.y = y;
      rim.castShadow = true;
      stack.add(rim);

      // Wire mesh cloth at bottom of each sieve
      const wireGeo = new THREE.CircleGeometry(0.198, 24);
      const wire = new THREE.Mesh(wireGeo, meshWireMat);
      wire.rotation.x = -Math.PI / 2;
      wire.position.y = y - sieveHeight / 2 + 0.002;
      stack.add(wire);

      this.registerInteractive(rim, {
        id: `sieve-${i}`,
        name: `IS Brass Test Sieve: ${sieveData.sieveName} (${sieveData.sieveSizeMm} mm)`,
        functionDesc: `Aperture size: ${sieveData.sieveSizeMm} mm per IS 460 (Part 1). Retains soil grains larger than ${sieveData.sieveSizeMm} mm.`,
        specification: 'Seamless spun brass frame, woven stainless steel wire mesh cloth.',
      });
    }

    // Top Dust Cover
    const lidGeo = new THREE.CylinderGeometry(0.205, 0.205, 0.02, 32);
    const lid = new THREE.Mesh(lidGeo, brassMat);
    lid.position.y = sieveCount * (sieveHeight + 0.005);
    stack.add(lid);

    return stack;
  }

  private buildDigitalBalance(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0.7, 0.89, 0);

    // Base body
    const bodyGeo = new THREE.BoxGeometry(0.38, 0.08, 0.35);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.04;
    body.castShadow = true;
    group.add(body);

    // Stainless steel weighing pan
    const panGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.015, 32);
    const panMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
    const pan = new THREE.Mesh(panGeo, panMat);
    pan.position.y = 0.09;
    pan.castShadow = true;
    group.add(pan);

    // Front digital LED display panel
    const displayGeo = new THREE.PlaneGeometry(0.2, 0.035);
    const displayMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(0, 0.04, 0.176);
    group.add(display);

    this.registerInteractive(pan, {
      id: 'digital-balance',
      name: 'Precision Electronic Top-Loading Balance',
      functionDesc: 'Measures sample mass retained on sieves with 0.01g readability and auto-tare capability.',
      specification: 'Capacity: 5000g | Readability: 0.01g | Compliant with IS 2720 testing standards.',
    });

    return group;
  }

  private buildSampleTrays(): void {
    const trayGeo = new THREE.BoxGeometry(0.28, 0.04, 0.22);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.8 });

    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.set(0.7, 0.89 + 0.11, 0);
    this.labGroup.add(tray);

    // Soil particles inside tray
    const soilGeo = new THREE.BoxGeometry(0.26, 0.02, 0.2);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0xd4b16a, roughness: 0.95 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.set(0.7, 0.89 + 0.13, 0);
    this.labGroup.add(soil);
  }

  public setShaking(active: boolean): void {
    this.isShaking = active;
  }

  public update(delta: number): void {
    if (this.isShaking) {
      this.shakeTime += delta * 35;
      // High-frequency vibration and slight horizontal wobble
      this.sieveStackGroup.position.x = Math.sin(this.shakeTime) * 0.008;
      this.sieveStackGroup.position.z = Math.cos(this.shakeTime * 1.3) * 0.006;
      this.sieveStackGroup.rotation.y = Math.sin(this.shakeTime * 0.8) * 0.015;
    } else {
      this.sieveStackGroup.position.set(0, 0.32, 0);
      this.sieveStackGroup.rotation.set(0, 0, 0);
    }
  }
}
