/**
 * 3D Simulation Scene: Rankine Steam Power Plant Layout (Unit III / IV)
 * Complete Virtual Thermal Power Plant:
 * 1. Industrial Steam Boiler & Superheater Tower
 * 2. High-Pressure & Low-Pressure Turbines with Electric Generator
 * 3. Surface Condenser & Hyperbolic Cooling Tower
 * 4. Boiler Feed Pump (BFP) Skid & High-Pressure Piping Loop
 */

import * as THREE from 'three';
import { BaseThermoSimulation } from '../../core/BaseThermoSimulation';

export class RankinePowerPlantScene extends BaseThermoSimulation {
  private boilerTowerGroup!: THREE.Group;
  private turbineGenGroup!: THREE.Group;
  private condenserGroup!: THREE.Group;
  private coolingTowerMesh!: THREE.Mesh;
  private feedPumpGroup!: THREE.Group;
  private turbineRotors: THREE.Mesh[] = [];
  private loopParticles!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleCount = 350;

  private isReheatEnabled = false;
  private boilerPressureBar = 100;
  private condenserPressureBar = 0.1;

  public buildScene(): void {
    const group = new THREE.Group();
    group.name = 'RankinePowerPlantGroup';

    // 1. Steam Boiler & Superheater Tower
    this.boilerTowerGroup = new THREE.Group();
    this.boilerTowerGroup.position.set(-10, 0, 0);

    const boilerGeo = new THREE.BoxGeometry(6, 12, 6);
    const boilerMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.3,
    });
    const boiler = new THREE.Mesh(boilerGeo, boilerMat);
    boiler.position.set(0, 6, 0);
    this.boilerTowerGroup.add(boiler);

    // Chimney Stack
    const chimneyGeo = new THREE.CylinderGeometry(0.8, 1.2, 8, 24);
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(0, 16, 0);
    this.boilerTowerGroup.add(chimney);

    // Glowing Furnace Window
    const furnaceGeo = new THREE.PlaneGeometry(2, 2);
    const furnaceMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    const furnaceWindow = new THREE.Mesh(furnaceGeo, furnaceMat);
    furnaceWindow.position.set(0, 3, 3.01);
    this.boilerTowerGroup.add(furnaceWindow);

    group.add(this.boilerTowerGroup);

    // 2. Turbine & Generator Train
    this.turbineGenGroup = new THREE.Group();
    this.turbineGenGroup.position.set(0, 0, 4);

    // HP Turbine
    const hpGeo = new THREE.CylinderGeometry(1.4, 1.8, 3.5, 24);
    const turbineMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
    const hpTurbine = new THREE.Mesh(hpGeo, turbineMat);
    hpTurbine.rotation.z = Math.PI / 2;
    hpTurbine.position.set(-2, 3, 0);
    this.turbineGenGroup.add(hpTurbine);
    this.turbineRotors.push(hpTurbine);

    // LP Turbine
    const lpGeo = new THREE.CylinderGeometry(2.0, 2.6, 4.5, 24);
    const lpTurbine = new THREE.Mesh(lpGeo, turbineMat);
    lpTurbine.rotation.z = Math.PI / 2;
    lpTurbine.position.set(2.5, 3, 0);
    this.turbineGenGroup.add(lpTurbine);
    this.turbineRotors.push(lpTurbine);

    // Electric Generator
    const genGeo = new THREE.BoxGeometry(3.5, 3, 3);
    const genMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
    const generator = new THREE.Mesh(genGeo, genMat);
    generator.position.set(7, 3, 0);
    this.turbineGenGroup.add(generator);

    group.add(this.turbineGenGroup);

    // 3. Surface Condenser & Hyperbolic Cooling Tower
    this.condenserGroup = new THREE.Group();
    this.condenserGroup.position.set(2.5, 0, 4);

    const condGeo = new THREE.CylinderGeometry(2.2, 2.2, 5, 24);
    const condMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const condenser = new THREE.Mesh(condGeo, condMat);
    condenser.rotation.z = Math.PI / 2;
    condenser.position.set(0, 0.8, 0);
    this.condenserGroup.add(condenser);
    group.add(this.condenserGroup);

    // Hyperbolic Cooling Tower
    const ctPoints: THREE.Vector2[] = [
      new THREE.Vector2(4.5, 0),
      new THREE.Vector2(3.5, 4),
      new THREE.Vector2(2.8, 8), // waist
      new THREE.Vector2(3.2, 12), // lip
    ];
    const ctGeo = new THREE.LatheGeometry(ctPoints, 32);
    const ctMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8, metalness: 0.1 });
    this.coolingTowerMesh = new THREE.Mesh(ctGeo, ctMat);
    this.coolingTowerMesh.position.set(12, 0, -8);
    group.add(this.coolingTowerMesh);

    // 4. Boiler Feed Pump Skid
    this.feedPumpGroup = new THREE.Group();
    this.feedPumpGroup.position.set(-4, 0, -2);

    const pumpGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 16);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2 });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.rotation.x = Math.PI / 2;
    pump.position.set(0, 1, 0);
    this.feedPumpGroup.add(pump);
    group.add(this.feedPumpGroup);

    // 5. Interconnecting Steam / Water Piping Loop
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 });
    // Main Steam Line (Boiler to HP Turbine)
    const steamLineGeo = new THREE.CylinderGeometry(0.35, 0.35, 10, 16);
    const steamLine = new THREE.Mesh(steamLineGeo, pipeMat);
    steamLine.rotation.z = Math.PI / 2;
    steamLine.position.set(-6, 9, 2);
    group.add(steamLine);

    // 6. Water & Steam Cycle Loop Particles
    const pGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const t = (i / this.particleCount) * Math.PI * 2;
      this.particlePositions[idx] = Math.cos(t) * 9;
      this.particlePositions[idx + 1] = 3 + Math.sin(t) * 2;
      this.particlePositions[idx + 2] = Math.sin(t * 2) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.25,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.loopParticles = new THREE.Points(pGeo, pMat);
    group.add(this.loopParticles);

    this.scene.add(group);
    this.resetCamera(20, 14, 22);
  }

  public updateAnimation(delta: number, _elapsedTime: number): void {
    // 1. Rotate turbines
    for (const rotor of this.turbineRotors) {
      rotor.rotation.x += delta * 10;
    }

    // 2. Animate thermodynamic loop particles along path
    const pos = this.particlePositions;
    if (pos) {
      for (let i = 0; i < this.particleCount; i++) {
        const idx = i * 3;
        pos[idx] = (pos[idx] ?? 0) + delta * 3;
        if ((pos[idx] ?? 0) > 10) {
          pos[idx] = -10;
        }
      }
      if (this.loopParticles?.geometry?.attributes?.position) {
        this.loopParticles.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  public updateParameters(params: {
    isReheat?: boolean;
    boilerPressureBar?: number;
    condenserPressureBar?: number;
  }): void {
    if (params.isReheat !== undefined) {
      this.isReheatEnabled = params.isReheat;
    }
    if (params.boilerPressureBar !== undefined) {
      this.boilerPressureBar = params.boilerPressureBar;
    }
    if (params.condenserPressureBar !== undefined) {
      this.condenserPressureBar = params.condenserPressureBar;
    }
  }
}
