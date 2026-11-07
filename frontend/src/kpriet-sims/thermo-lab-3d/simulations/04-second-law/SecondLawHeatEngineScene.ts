/**
 * 3D Simulation Scene: Second Law of Thermodynamics, Heat Engines & Refrigerators (Unit II)
 * - Hot Reservoir T_H (Glowing high-temperature thermal source)
 * - Cyclic Heat Engine / Refrigerator core
 * - Cold Reservoir T_L (Cryogenic/cooling thermal sink)
 * - Mechanical Work Output / Input Shaft
 * - Visual Clausius Inequality & Entropy Generation
 */

import * as THREE from 'three';
import { BaseThermoSimulation } from '../../core/BaseThermoSimulation';
import type { ThermalDeviceType } from '../../core/types';

export class SecondLawHeatEngineScene extends BaseThermoSimulation {
  private hotSourceMesh!: THREE.Mesh;
  private coldSinkMesh!: THREE.Mesh;
  private engineCoreMesh!: THREE.Mesh;
  private flywheelMesh!: THREE.Mesh;
  private heatInletBeam!: THREE.Mesh;
  private heatRejectionBeam!: THREE.Mesh;
  private workShaftMesh!: THREE.Mesh;
  private hotLight!: THREE.PointLight;
  private coldLight!: THREE.PointLight;

  private currentDevice: ThermalDeviceType = 'heat-engine';
  private hotTempK = 800;
  private coldTempK = 300;
  private isReversible = false;

  public buildScene(): void {
    const group = new THREE.Group();
    group.name = 'SecondLawGroup';

    // 1. High Temperature Thermal Reservoir (Source at top)
    const hotGeo = new THREE.BoxGeometry(6, 2.5, 6);
    const hotMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.6,
      metalness: 0.4,
      roughness: 0.3,
    });
    this.hotSourceMesh = new THREE.Mesh(hotGeo, hotMat);
    this.hotSourceMesh.position.set(0, 10, 0);
    group.add(this.hotSourceMesh);

    this.hotLight = new THREE.PointLight(0xff4422, 2.0, 15);
    this.hotLight.position.set(0, 8.5, 0);
    group.add(this.hotLight);

    // 2. Cold Temperature Thermal Reservoir (Sink at bottom)
    const coldGeo = new THREE.BoxGeometry(6, 2.5, 6);
    const coldMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
      metalness: 0.4,
      roughness: 0.3,
    });
    this.coldSinkMesh = new THREE.Mesh(coldGeo, coldMat);
    this.coldSinkMesh.position.set(0, 1.3, 0);
    group.add(this.coldSinkMesh);

    this.coldLight = new THREE.PointLight(0x00f0ff, 1.8, 15);
    this.coldLight.position.set(0, 2.6, 0);
    group.add(this.coldLight);

    // 3. Cyclic Machine Core (Heat Engine / Refrigerator / Heat Pump)
    const coreGeo = new THREE.CylinderGeometry(2.2, 2.2, 2.5, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.85,
      roughness: 0.2,
    });
    this.engineCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.engineCoreMesh.position.set(0, 5.5, 0);
    group.add(this.engineCoreMesh);

    // Rotating Flywheel on Engine Core
    const flyGeo = new THREE.TorusGeometry(2.6, 0.25, 16, 32);
    const flyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    this.flywheelMesh = new THREE.Mesh(flyGeo, flyMat);
    this.flywheelMesh.rotation.x = Math.PI / 2;
    this.engineCoreMesh.add(this.flywheelMesh);

    // Output / Input Work Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.35, 0.35, 4.5, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    this.workShaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    this.workShaftMesh.rotation.z = Math.PI / 2;
    this.workShaftMesh.position.set(4, 5.5, 0);
    group.add(this.workShaftMesh);

    // 4. Heat Q_H Energy Flow Conduit (Top to Core)
    const beamInGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.0, 16);
    const beamInMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    this.heatInletBeam = new THREE.Mesh(beamInGeo, beamInMat);
    this.heatInletBeam.position.set(0, 7.7, 0);
    group.add(this.heatInletBeam);

    // 5. Heat Q_L Energy Flow Conduit (Core to Bottom)
    const beamOutGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.0, 16);
    const beamOutMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    this.heatRejectionBeam = new THREE.Mesh(beamOutGeo, beamOutMat);
    this.heatRejectionBeam.position.set(0, 3.3, 0);
    group.add(this.heatRejectionBeam);

    this.scene.add(group);
    this.resetCamera(15, 8, 16);
  }

  public updateAnimation(delta: number, elapsedTime: number): void {
    // 1. Rotate flywheel
    const speed = this.currentDevice === 'heat-engine' ? 6 : -6;
    this.flywheelMesh.rotation.z += delta * speed;
    this.workShaftMesh.rotation.x += delta * speed;

    // 2. Pulse thermal reservoir emissive glow
    const pulseH = 0.5 + Math.sin(elapsedTime * 4) * 0.2;
    (this.hotSourceMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulseH;

    const pulseC = 0.4 + Math.cos(elapsedTime * 3) * 0.15;
    (this.coldSinkMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulseC;
  }

  public updateParameters(params: {
    deviceType?: ThermalDeviceType;
    hotTempK?: number;
    coldTempK?: number;
    isReversible?: boolean;
  }): void {
    if (params.deviceType) {
      this.currentDevice = params.deviceType;
    }
    if (params.hotTempK !== undefined) {
      this.hotTempK = params.hotTempK;
    }
    if (params.coldTempK !== undefined) {
      this.coldTempK = params.coldTempK;
    }
    if (params.isReversible !== undefined) {
      this.isReversible = params.isReversible;
    }
  }
}
