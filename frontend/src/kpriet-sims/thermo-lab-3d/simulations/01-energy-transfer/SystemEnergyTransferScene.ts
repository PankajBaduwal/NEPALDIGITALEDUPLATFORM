/**
 * 3D Simulation Scene: Thermodynamic System & Boundary Energy Transfer (Unit I)
 * Visualizes:
 * - Transparent thermodynamic system boundary (Closed system vs Open control volume)
 * - Piston-cylinder with moving piston head, boundary work interaction W = integral P dV
 * - Thermal burner / heat coil with radiative heat flux Q
 * - Molecular kinetic gas particles bouncing inside with velocities proportional to Temperature T
 * - Shaft work paddle agitator stirring the working medium
 */

import * as THREE from 'three';
import { BaseThermoSimulation } from '../../core/BaseThermoSimulation';

export class SystemEnergyTransferScene extends BaseThermoSimulation {
  private cylinderMesh!: THREE.Mesh;
  private pistonMesh!: THREE.Mesh;
  private burnerMesh!: THREE.Mesh;
  private flameMesh!: THREE.Mesh;
  private paddleShaftMesh!: THREE.Mesh;
  private paddleBladesMesh!: THREE.Mesh;
  private gasParticles!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleVelocities!: Float32Array;
  private flameLight!: THREE.PointLight;

  private currentVolumeRatio = 1.0;
  private currentTemperature = 300;
  private isHeating = true;
  private isPaddleStirring = true;
  private particleCount = 400;

  public buildScene(): void {
    const group = new THREE.Group();
    group.name = 'SystemEnergyTransferGroup';

    // 1. Transparent Glass Cylinder (System Boundary)
    const cylRadius = 3.5;
    const cylHeight = 8;
    const cylGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 32, 1, true);
    const cylMat = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
      thickness: 0.5,
      side: THREE.DoubleSide,
    });
    this.cylinderMesh = new THREE.Mesh(cylGeo, cylMat);
    this.cylinderMesh.position.set(0, cylHeight / 2 + 1, 0);
    group.add(this.cylinderMesh);

    // Cylinder Base Base Plate
    const baseGeo = new THREE.CylinderGeometry(cylRadius + 0.5, cylRadius + 0.5, 0.6, 32);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2,
    });
    const baseMesh = new THREE.Mesh(baseGeo, metalMat);
    baseMesh.position.set(0, 1.3, 0);
    group.add(baseMesh);

    // 2. Movable Piston Head
    const pistonGeo = new THREE.CylinderGeometry(cylRadius - 0.05, cylRadius - 0.05, 0.8, 32);
    const pistonMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      metalness: 0.7,
      roughness: 0.3,
    });
    this.pistonMesh = new THREE.Mesh(pistonGeo, pistonMat);
    this.pistonMesh.position.set(0, 5, 0);
    this.pistonMesh.castShadow = true;
    group.add(this.pistonMesh);

    // Piston Rod
    const rodGeo = new THREE.CylinderGeometry(0.3, 0.3, 6, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const rodMesh = new THREE.Mesh(rodGeo, rodMat);
    rodMesh.position.set(0, 3, 0);
    this.pistonMesh.add(rodMesh);

    // 3. Heat Source (Burner Coil underneath with glow)
    const burnerGeo = new THREE.TorusGeometry(2.2, 0.25, 16, 32);
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
    this.burnerMesh = new THREE.Mesh(burnerGeo, burnerMat);
    this.burnerMesh.rotation.x = Math.PI / 2;
    this.burnerMesh.position.set(0, 0.4, 0);
    group.add(this.burnerMesh);

    // Flame / Radiant Thermal Glow Mesh
    const flameGeo = new THREE.ConeGeometry(1.8, 1.2, 16);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.85,
    });
    this.flameMesh = new THREE.Mesh(flameGeo, flameMat);
    this.flameMesh.position.set(0, 0.8, 0);
    group.add(this.flameMesh);

    this.flameLight = new THREE.PointLight(0xff7700, 2.5, 10);
    this.flameLight.position.set(0, 0.8, 0);
    group.add(this.flameLight);

    // 4. Shaft Work Stirrer / Paddle
    const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.5, 12);
    this.paddleShaftMesh = new THREE.Mesh(shaftGeo, rodMat);
    this.paddleShaftMesh.position.set(1.5, 3.2, 0);
    group.add(this.paddleShaftMesh);

    const bladeGeo = new THREE.BoxGeometry(1.4, 0.6, 0.08);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.4 });
    this.paddleBladesMesh = new THREE.Mesh(bladeGeo, bladeMat);
    this.paddleBladesMesh.position.set(0, -1.5, 0);
    this.paddleShaftMesh.add(this.paddleBladesMesh);

    // 5. Molecular Kinetic Gas Particles
    const pGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const r = Math.random() * (cylRadius - 0.4);
      const theta = Math.random() * Math.PI * 2;
      this.particlePositions[idx] = r * Math.cos(theta);
      this.particlePositions[idx + 1] = 1.8 + Math.random() * 2.8;
      this.particlePositions[idx + 2] = r * Math.sin(theta);

      this.particleVelocities[idx] = (Math.random() - 0.5) * 2;
      this.particleVelocities[idx + 1] = (Math.random() - 0.5) * 2;
      this.particleVelocities[idx + 2] = (Math.random() - 0.5) * 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.22,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.gasParticles = new THREE.Points(pGeo, pMat);
    group.add(this.gasParticles);

    this.scene.add(group);
    this.resetCamera(12, 8, 14);
  }

  public updateAnimation(delta: number, elapsedTime: number): void {
    // 1. Move Piston dynamically to current volume height
    const targetPistonY = 2.0 + this.currentVolumeRatio * 3.5;
    this.pistonMesh.position.y += (targetPistonY - this.pistonMesh.position.y) * 0.1;

    // 2. Animate Flame flicker
    if (this.isHeating) {
      const flicker = 1.0 + Math.sin(elapsedTime * 15) * 0.15;
      this.flameMesh.scale.set(flicker, flicker, flicker);
      this.flameLight.intensity = 2.5 * flicker;
      this.flameMesh.visible = true;
    } else {
      this.flameMesh.visible = false;
      this.flameLight.intensity = 0;
    }

    // 3. Rotate Paddle Stirrer (Shaft Work W_s)
    if (this.isPaddleStirring) {
      this.paddleShaftMesh.rotation.y += delta * 6;
    }

    // 4. Update Molecular Gas Particles based on Temperature
    const tempFactor = Math.sqrt(this.currentTemperature / 300);
    const maxPistonTop = this.pistonMesh.position.y - 0.3;
    const minCylBottom = 1.6;
    const cylRadiusLimit = 3.2;

    const pos = this.particlePositions;
    const vel = this.particleVelocities;

    if (pos && vel) {
      for (let i = 0; i < this.particleCount; i++) {
        const idx = i * 3;
        pos[idx] = (pos[idx] ?? 0) + (vel[idx] ?? 0) * tempFactor * delta * 2;
        pos[idx + 1] = (pos[idx + 1] ?? 0) + (vel[idx + 1] ?? 0) * tempFactor * delta * 2;
        pos[idx + 2] = (pos[idx + 2] ?? 0) + (vel[idx + 2] ?? 0) * tempFactor * delta * 2;

        // Radial boundary collision
        const curX = pos[idx] ?? 0;
        const curZ = pos[idx + 2] ?? 0;
        const r = Math.sqrt(curX * curX + curZ * curZ);
        if (r > cylRadiusLimit && r > 0.0001) {
          pos[idx] = (curX / r) * cylRadiusLimit;
          pos[idx + 2] = (curZ / r) * cylRadiusLimit;
          vel[idx] = -(vel[idx] ?? 0);
          vel[idx + 2] = -(vel[idx + 2] ?? 0);
        }

        // Vertical piston & bottom collisions
        const curY = pos[idx + 1] ?? 0;
        if (curY > maxPistonTop) {
          pos[idx + 1] = maxPistonTop;
          vel[idx + 1] = -Math.abs(vel[idx + 1] ?? 1);
        } else if (curY < minCylBottom) {
          pos[idx + 1] = minCylBottom;
          vel[idx + 1] = Math.abs(vel[idx + 1] ?? 1);
        }
      }

      if (this.gasParticles?.geometry?.attributes?.position) {
        this.gasParticles.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  public updateParameters(params: {
    volumeRatio?: number;
    temperatureK?: number;
    isHeating?: boolean;
    isStirring?: boolean;
  }): void {
    if (params.volumeRatio !== undefined) {
      this.currentVolumeRatio = Math.max(0.3, Math.min(2.0, params.volumeRatio));
    }
    if (params.temperatureK !== undefined) {
      this.currentTemperature = params.temperatureK;
    }
    if (params.isHeating !== undefined) {
      this.isHeating = params.isHeating;
    }
    if (params.isStirring !== undefined) {
      this.isPaddleStirring = params.isStirring;
    }
  }
}
