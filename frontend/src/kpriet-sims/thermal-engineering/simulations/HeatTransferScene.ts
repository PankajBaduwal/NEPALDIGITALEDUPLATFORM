/**
 * Module 1: Heat Transfer Explorer 3D Scene
 * Visualizes Conduction (Fourier's law rod with thermal gradient),
 * Convection (fluid boundary layer flow), and Radiation (Stefan-Boltzmann emission waves).
 */

import * as THREE from 'three';
import { BaseThermalScene } from './BaseThermalScene';
import type { HeatTransferMode } from '../core/types';

export class HeatTransferScene extends BaseThermalScene {
  private currentMode: HeatTransferMode = 'conduction';

  // Conduction objects
  private rodMesh!: THREE.Mesh;
  private hotBlockMesh!: THREE.Mesh;
  private coldBlockMesh!: THREE.Mesh;
  private fluxParticles!: THREE.Points;
  private fluxVelocities: THREE.Vector3[] = [];

  // Convection objects
  private plateMesh!: THREE.Mesh;
  private airStreamParticles!: THREE.Points;

  // Radiation objects
  private sphereMesh!: THREE.Mesh;
  private radiationRings: THREE.Mesh[] = [];

  // Active Parameters
  private tempHot = 120;
  private tempCold = 25;
  private heatFlux = 500;

  public initScene(): void {
    this.createConductionModel();
    this.createConvectionModel();
    this.createRadiationModel();
    this.setMode('conduction');
  }

  private createConductionModel(): void {
    // 1. Hot source block
    const hotGeo = new THREE.BoxGeometry(1.5, 3, 2);
    const hotMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#dc2626',
      emissiveIntensity: 0.4,
      metalness: 0.6,
      roughness: 0.3,
    });
    this.hotBlockMesh = new THREE.Mesh(hotGeo, hotMat);
    this.hotBlockMesh.position.set(-3.75, 1.5, 0);
    this.hotBlockMesh.castShadow = true;
    this.scene.add(this.hotBlockMesh);

    // 2. Cold sink block
    const coldGeo = new THREE.BoxGeometry(1.5, 3, 2);
    const coldMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.3,
      metalness: 0.6,
      roughness: 0.3,
    });
    this.coldBlockMesh = new THREE.Mesh(coldGeo, coldMat);
    this.coldBlockMesh.position.set(3.75, 1.5, 0);
    this.coldBlockMesh.castShadow = true;
    this.scene.add(this.coldBlockMesh);

    // 3. Conduction Rod with Vertex Colors (Thermal Gradient from Red to Blue)
    const rodGeo = new THREE.CylinderGeometry(0.6, 0.6, 6, 32, 32);
    rodGeo.rotateZ(Math.PI / 2); // Horizontal axis along X

    const count = rodGeo.attributes.position!.count;
    const colors = new Float32Array(count * 3);
    const pos = rodGeo.attributes.position!;

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i); // ranges from -3 to +3
      const norm = (x + 3) / 6; // 0 (hot) to 1 (cold)
      // Lerp from Orange-Red (#ea580c) to Cyan-Blue (#0284c7)
      const r = (1 - norm) * 0.95 + norm * 0.05;
      const g = (1 - norm) * 0.25 + norm * 0.55;
      const b = (1 - norm) * 0.05 + norm * 0.85;

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    rodGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const rodMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.5,
      roughness: 0.35,
    });
    this.rodMesh = new THREE.Mesh(rodGeo, rodMat);
    this.rodMesh.position.set(0, 1.5, 0);
    this.rodMesh.castShadow = true;
    this.scene.add(this.rodMesh);

    // 4. Heat Flux Particles inside the rod
    const particleCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 5.6;
      pPos[i * 3 + 1] = 1.5 + (Math.random() - 0.5) * 0.8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
      this.fluxVelocities.push(new THREE.Vector3(1.5 + Math.random() * 2, 0, 0));
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
      color: '#fbbf24',
      size: 0.08,
      transparent: true,
      opacity: 0.85,
    });
    this.fluxParticles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.fluxParticles);
  }

  private createConvectionModel(): void {
    // Heated Horizontal Surface Plate
    const plateGeo = new THREE.BoxGeometry(6, 0.4, 4);
    const plateMat = new THREE.MeshStandardMaterial({
      color: '#f97316',
      emissive: '#c2410c',
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.4,
    });
    this.plateMesh = new THREE.Mesh(plateGeo, plateMat);
    this.plateMesh.position.set(0, 0.5, 0);
    this.scene.add(this.plateMesh);

    // Flowing ambient air particles above the plate
    const count = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pPos[i * 3] = -4 + Math.random() * 8;
      pPos[i * 3 + 1] = 0.8 + Math.random() * 2.5;
      pPos[i * 3 + 2] = -2 + Math.random() * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
      color: '#67e8f9',
      size: 0.07,
      transparent: true,
      opacity: 0.75,
    });
    this.airStreamParticles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.airStreamParticles);
  }

  private createRadiationModel(): void {
    // Radiant Emitter Sphere
    const sphereGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: '#f43f5e',
      emissive: '#be123c',
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.7,
    });
    this.sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    this.sphereMesh.position.set(0, 2, 0);
    this.scene.add(this.sphereMesh);

    // Expanding spherical radiation wave rings
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.RingGeometry(1.6 + i * 0.8, 1.7 + i * 0.8, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#fb7185',
        transparent: true,
        opacity: 0.6 - i * 0.12,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 2, 0);
      ring.rotation.x = Math.PI / 2;
      this.scene.add(ring);
      this.radiationRings.push(ring);
    }
  }

  public setMode(mode: HeatTransferMode): void {
    this.currentMode = mode;

    // Toggle Conduction elements
    const isCond = mode === 'conduction';
    this.rodMesh.visible = isCond;
    this.hotBlockMesh.visible = isCond;
    this.coldBlockMesh.visible = isCond;
    this.fluxParticles.visible = isCond;

    // Toggle Convection elements
    const isConv = mode === 'convection';
    this.plateMesh.visible = isConv;
    this.airStreamParticles.visible = isConv;

    // Toggle Radiation elements
    const isRad = mode === 'radiation';
    this.sphereMesh.visible = isRad;
    this.radiationRings.forEach((r) => (r.visible = isRad));
  }

  public setParameters(params: { tempHot?: number; tempCold?: number; heatFlux?: number; mode?: HeatTransferMode }): void {
    if (params.mode) this.setMode(params.mode);
    if (params.tempHot !== undefined) this.tempHot = params.tempHot;
    if (params.tempCold !== undefined) this.tempCold = params.tempCold;
    if (params.heatFlux !== undefined) this.heatFlux = params.heatFlux;

    // Update emissive heat glow
    if (this.currentMode === 'conduction') {
      const hotMat = this.hotBlockMesh.material as THREE.MeshStandardMaterial;
      hotMat.emissiveIntensity = Math.min(1.0, 0.2 + (this.tempHot / 300) * 0.6);
    } else if (this.currentMode === 'radiation') {
      const sphereMat = this.sphereMesh.material as THREE.MeshStandardMaterial;
      sphereMat.emissiveIntensity = Math.min(1.2, 0.3 + (this.tempHot / 400) * 0.7);
    }
  }

  public update(delta: number): void {
    if (this.currentMode === 'conduction' && this.fluxParticles.visible) {
      const pos = this.fluxParticles.geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;

      const speedFactor = Math.min(3.0, Math.max(0.4, this.heatFlux / 400));
      for (let i = 0; i < this.fluxVelocities.length; i++) {
        const vel = this.fluxVelocities[i];
        if (!vel) continue;

        const currentX = arr[i * 3] ?? 0;
        let newX = currentX + vel.x * delta * speedFactor;
        if (newX > 2.8) newX = -2.8;

        arr[i * 3] = newX;
      }
      pos.needsUpdate = true;
    } else if (this.currentMode === 'convection' && this.airStreamParticles.visible) {
      const pos = this.airStreamParticles.geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;

      for (let i = 0; i < pos.count; i++) {
        let x = arr[i * 3] ?? 0;
        let y = arr[i * 3 + 1] ?? 0;

        x += delta * 2.2;
        y += delta * 0.4; // Thermal buoyancy upward plume
        if (x > 4.0 || y > 3.5) {
          x = -4.0;
          y = 0.8 + Math.random() * 0.5;
        }

        arr[i * 3] = x;
        arr[i * 3 + 1] = y;
      }
      pos.needsUpdate = true;
    } else if (this.currentMode === 'radiation') {
      // Pulsing radiation wavefront expansion
      const time = performance.now() * 0.002;
      this.radiationRings.forEach((ring, idx) => {
        const scale = 1.0 + ((time + idx * 0.4) % 1.6);
        ring.scale.set(scale, scale, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.7 - scale * 0.35);
      });
    }
  }
}
