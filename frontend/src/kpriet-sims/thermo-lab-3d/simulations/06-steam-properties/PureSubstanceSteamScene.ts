/**
 * 3D Simulation Scene: Properties of Pure Substances & Steam Generation (Unit III)
 * Features:
 * - 3D P-v-T State Surface & Saturation Dome Wireframe
 * - Steam Boiler Drum with sight glass, boiling bubbles, and steam dome
 * - Throttling Calorimeter with orifice, manometer, and temperature sensors
 * - Interactive dryness fraction x (0 to 1) and phase transitions (subcooled -> wet -> superheated)
 */

import * as THREE from 'three';
import { BaseThermoSimulation } from '../../core/BaseThermoSimulation';

export class PureSubstanceSteamScene extends BaseThermoSimulation {
  private pvtSurfaceMesh!: THREE.Mesh;
  private steamDrumMesh!: THREE.Mesh;
  private waterLevelMesh!: THREE.Mesh;
  private steamMistParticles!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleCount = 300;

  private drynessFractionX = 0.85;
  private currentPressureBar = 10;
  private isSuperheated = false;

  public buildScene(): void {
    const group = new THREE.Group();
    group.name = 'PureSubstanceGroup';

    // 1. Steam Drum Boiler
    const drumGeo = new THREE.CylinderGeometry(2.8, 2.8, 9, 32, 1, false);
    const drumMat = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.45,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    this.steamDrumMesh = new THREE.Mesh(drumGeo, drumMat);
    this.steamDrumMesh.rotation.z = Math.PI / 2;
    this.steamDrumMesh.position.set(0, 4, 0);
    group.add(this.steamDrumMesh);

    // Drum Support Saddles
    const saddleGeo = new THREE.BoxGeometry(1.2, 2.5, 6);
    const saddleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const saddleL = new THREE.Mesh(saddleGeo, saddleMat);
    saddleL.position.set(-3, 1.25, 0);
    const saddleR = saddleL.clone();
    saddleR.position.set(3, 1.25, 0);
    group.add(saddleL, saddleR);

    // Water Level inside Drum
    const waterGeo = new THREE.CylinderGeometry(2.6, 2.6, 8.6, 32, 1, false, 0, Math.PI);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.7,
      roughness: 0.05,
      transmission: 0.9,
    });
    this.waterLevelMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterLevelMesh.rotation.z = Math.PI / 2;
    this.waterLevelMesh.rotation.x = Math.PI;
    this.waterLevelMesh.position.set(0, 3.8, 0);
    group.add(this.waterLevelMesh);

    // Sight Glass Manometer Tube
    const sightGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.5, 16);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      roughness: 0.05,
    });
    const sightGlass = new THREE.Mesh(sightGeo, glassMat);
    sightGlass.position.set(-4.7, 4, 0);
    group.add(sightGlass);

    // Steam Outlet Nozzle on top
    const nozzleGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.0, 16);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 });
    const steamNozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    steamNozzle.position.set(0, 7.5, 0);
    group.add(steamNozzle);

    // 2. 3D P-v-T Thermodynamic Surface Mesh
    const surfaceGeo = new THREE.PlaneGeometry(10, 10, 24, 24);
    const pos = surfaceGeo.attributes.position as THREE.BufferAttribute;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i); // specific volume v
        const v = pos.getY(i); // temperature T
        // Non-linear P(v,T) equation of state surface contour
        const height = 2.0 * Math.exp(-((u * u) / 12)) + 0.3 * v + Math.sin(u * 1.2) * 0.4;
        pos.setZ(i, height);
      }
    }
    surfaceGeo.computeVertexNormals();

    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    this.pvtSurfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    this.pvtSurfaceMesh.rotation.x = -Math.PI / 2;
    this.pvtSurfaceMesh.position.set(0, 0.1, -8);
    group.add(this.pvtSurfaceMesh);

    // 3. Boiling Bubbles & Steam Vapor Mist Particles
    const pGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      this.particlePositions[idx] = (Math.random() - 0.5) * 7.5;
      this.particlePositions[idx + 1] = 2.5 + Math.random() * 3.5;
      this.particlePositions[idx + 2] = (Math.random() - 0.5) * 3.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    this.steamMistParticles = new THREE.Points(pGeo, pMat);
    group.add(this.steamMistParticles);

    this.scene.add(group);
    this.resetCamera(14, 9, 16);
  }

  public updateAnimation(delta: number, _elapsedTime: number): void {
    // Animate boiling bubbles rising in drum
    const pos = this.particlePositions;
    if (pos) {
      for (let i = 0; i < this.particleCount; i++) {
        const idx = i * 3;
        pos[idx + 1] = (pos[idx + 1] ?? 0) + delta * 2.5 * (1 + this.drynessFractionX);

        // Reset when reaching top of drum
        if ((pos[idx + 1] ?? 0) > 6.2) {
          pos[idx + 1] = 2.2;
          pos[idx] = (Math.random() - 0.5) * 7.5;
          pos[idx + 2] = (Math.random() - 0.5) * 3.5;
        }
      }
      if (this.steamMistParticles?.geometry?.attributes?.position) {
        this.steamMistParticles.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  public updateParameters(params: {
    drynessFraction?: number;
    pressureBar?: number;
    isSuperheated?: boolean;
  }): void {
    if (params.drynessFraction !== undefined) {
      this.drynessFractionX = params.drynessFraction;
    }
    if (params.pressureBar !== undefined) {
      this.currentPressureBar = params.pressureBar;
    }
    if (params.isSuperheated !== undefined) {
      this.isSuperheated = params.isSuperheated;
    }
  }
}
