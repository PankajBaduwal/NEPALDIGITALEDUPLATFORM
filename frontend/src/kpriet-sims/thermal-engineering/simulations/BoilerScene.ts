/**
 * Module 4: Industrial Steam Boiler 3D Scene
 * Visualizes a multi-tube industrial boiler (drum, water tubes, furnace combustion flame,
 * steam header, safety valve, and pressure gauge).
 */

import * as THREE from 'three';
import { BaseThermalScene } from './BaseThermalScene';
import type { BoilerParams, BoilerResult } from '../core/types';

export class BoilerScene extends BaseThermalScene {
  private drumMesh!: THREE.Mesh;
  private furnaceBox!: THREE.Mesh;
  private flameParticles!: THREE.Points;
  private flameCount = 100;

  // Mountings
  private safetyValve!: THREE.Mesh;
  private pressureGauge!: THREE.Mesh;
  private waterLevelGlass!: THREE.Mesh;

  private waterTubes: THREE.Mesh[] = [];

  public initScene(): void {
    // 1. Combustion Furnace Firebox Base
    const furnaceGeo = new THREE.BoxGeometry(4.5, 2.0, 3.5);
    const furnaceMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.7,
      metalness: 0.5,
    });
    this.furnaceBox = new THREE.Mesh(furnaceGeo, furnaceMat);
    this.furnaceBox.position.set(0, 1.0, 0);
    this.furnaceBox.castShadow = true;
    this.scene.add(this.furnaceBox);

    // Furnace viewing port / grate opening
    const portGeo = new THREE.BoxGeometry(1.5, 0.9, 0.2);
    const portMat = new THREE.MeshBasicMaterial({ color: '#ea580c' });
    const port = new THREE.Mesh(portGeo, portMat);
    port.position.set(0, 1.0, 1.76);
    this.scene.add(port);

    // 2. Combustion Flame Particles
    const flameGeo = new THREE.BufferGeometry();
    const flamePos = new Float32Array(this.flameCount * 3);
    for (let i = 0; i < this.flameCount; i++) {
      flamePos[i * 3] = (Math.random() - 0.5) * 2.2;
      flamePos[i * 3 + 1] = 0.5 + Math.random() * 1.0;
      flamePos[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
    flameGeo.setAttribute('position', new THREE.BufferAttribute(flamePos, 3));
    const flameMat = new THREE.PointsMaterial({
      color: '#f97316',
      size: 0.14,
      transparent: true,
      opacity: 0.9,
    });
    this.flameParticles = new THREE.Points(flameGeo, flameMat);
    this.scene.add(this.flameParticles);

    // 3. Inclined Water Tube Bank
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16);
        tubeGeo.rotateZ(Math.PI / 8); // 15-degree incline for natural thermosiphon circulation
        const tubeMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.7, roughness: 0.3 });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.position.set(-1.0 + r * 0.5, 2.5 + c * 0.35, -0.8 + c * 0.8);
        tube.castShadow = true;
        this.scene.add(tube);
        this.waterTubes.push(tube);
      }
    }

    // 4. Steam Drum on Top
    const drumGeo = new THREE.CylinderGeometry(0.85, 0.85, 4.2, 32);
    drumGeo.rotateZ(Math.PI / 2);
    const drumMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      metalness: 0.8,
      roughness: 0.25,
    });
    this.drumMesh = new THREE.Mesh(drumGeo, drumMat);
    this.drumMesh.position.set(0, 4.3, 0);
    this.drumMesh.castShadow = true;
    this.scene.add(this.drumMesh);

    // Drum dished hemispherical ends
    const endGeo = new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const endLeft = new THREE.Mesh(endGeo, drumMat);
    endLeft.rotation.z = Math.PI / 2;
    endLeft.position.set(-2.1, 4.3, 0);
    this.scene.add(endLeft);

    const endRight = new THREE.Mesh(endGeo, drumMat);
    endRight.rotation.z = -Math.PI / 2;
    endRight.position.set(2.1, 4.3, 0);
    this.scene.add(endRight);

    // 5. Critical Mountings
    // A. Safety Valve (Dual Spring-Loaded Valve on drum top)
    const valveGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 16);
    const valveMat = new THREE.MeshStandardMaterial({ color: '#dc2626', metalness: 0.7, roughness: 0.3 });
    this.safetyValve = new THREE.Mesh(valveGeo, valveMat);
    this.safetyValve.position.set(-0.8, 5.3, 0);
    this.scene.add(this.safetyValve);

    // B. Bourdon Tube Pressure Gauge
    const gaugeBodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    gaugeBodyGeo.rotateX(Math.PI / 2);
    const gaugeMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.4, roughness: 0.4 });
    this.pressureGauge = new THREE.Mesh(gaugeBodyGeo, gaugeMat);
    this.pressureGauge.position.set(0.8, 5.2, 0.85);
    this.scene.add(this.pressureGauge);

    // C. Water Level Gauge Glass Indicator
    const glassGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 16);
    const glassMat = new THREE.MeshPhysicalMaterial({ color: '#38bdf8', transparent: true, opacity: 0.65, roughness: 0.1 });
    this.waterLevelGlass = new THREE.Mesh(glassGeo, glassMat);
    this.waterLevelGlass.position.set(1.9, 4.3, 0.9);
    this.scene.add(this.waterLevelGlass);

    // 6. Chimney Flue Gas Stack
    const stackGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.5, 24);
    const stackMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.7, roughness: 0.4 });
    const stack = new THREE.Mesh(stackGeo, stackMat);
    stack.position.set(-2.5, 3.2, 0);
    this.scene.add(stack);
  }

  public setParameters(_params: { boilerParams?: BoilerParams; result?: BoilerResult }): void {
    // Dynamic updates to operating pressure or fuel rate
  }

  public update(delta: number): void {
    // Flame particle oscillation
    const pos = this.flameParticles.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < this.flameCount; i++) {
      let y = arr[i * 3 + 1] ?? 0;
      y += delta * 1.5;
      if (y > 1.8) y = 0.5 + Math.random() * 0.3;
      arr[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
  }
}
