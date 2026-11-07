/**
 * Module 5: Vapor Compression Refrigeration (VCR) Cycle 3D Scene
 * Visualizes closed refrigerant loop: Compressor, Condenser, Expansion Valve, and Evaporator
 * with high/low pressure color coding and circulating refrigerant particles.
 */

import * as THREE from 'three';
import { BaseThermalScene } from './BaseThermalScene';
import type { RefrigerationParams, RefrigerationResult } from '../core/types';

export class RefrigerationScene extends BaseThermalScene {
  // Main Components
  private compressorMesh!: THREE.Mesh;
  private condenserCoil!: THREE.Group;
  private expansionValve!: THREE.Mesh;
  private evaporatorCoil!: THREE.Group;

  // Circulating Particles
  private refrigerantParticles!: THREE.Points;
  private particleCount = 120;
  private loopPathPoints: THREE.Vector3[] = [];

  public initScene(): void {
    // 1. Hermetic Compressor (Base Center Left)
    const compGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.6, 32);
    const compMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.2,
    });
    this.compressorMesh = new THREE.Mesh(compGeo, compMat);
    this.compressorMesh.position.set(-3.0, 1.2, 0);
    this.compressorMesh.castShadow = true;
    this.scene.add(this.compressorMesh);

    // Compressor dome top cap
    const capGeo = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, compMat);
    cap.position.set(-3.0, 2.0, 0);
    this.scene.add(cap);

    // 2. Finned Air-Cooled Condenser (Top Center)
    this.condenserCoil = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 16);
      tubeGeo.rotateZ(Math.PI / 2);
      const tubeMat = new THREE.MeshStandardMaterial({ color: '#ea580c', metalness: 0.7, roughness: 0.3 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(0, 3.6 + i * 0.3, 0);
      this.condenserCoil.add(tube);
    }
    // Condenser cooling fins
    for (let f = -15; f <= 15; f++) {
      const finGeo = new THREE.BoxGeometry(0.02, 1.3, 0.4);
      const finMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8, roughness: 0.3 });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(f * 0.11, 4.05, 0);
      this.condenserCoil.add(fin);
    }
    this.scene.add(this.condenserCoil);

    // 3. Thermostatic Expansion Valve (Right Center)
    const txvGeo = new THREE.ConeGeometry(0.35, 0.8, 16);
    const txvMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.7, roughness: 0.3 });
    this.expansionValve = new THREE.Mesh(txvGeo, txvMat);
    this.expansionValve.rotation.z = Math.PI / 2;
    this.expansionValve.position.set(3.0, 2.4, 0);
    this.scene.add(this.expansionValve);

    // 4. Evaporator Chiller Coil (Bottom Center)
    this.evaporatorCoil = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 16);
      tubeGeo.rotateZ(Math.PI / 2);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: '#06b6d4',
        emissive: '#0891b2',
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(0, 0.8 + i * 0.3, 0);
      this.evaporatorCoil.add(tube);
    }
    this.scene.add(this.evaporatorCoil);

    // 5. Connective Refrigerant Piping Loop
    this.buildRefrigerantLoop();
  }

  private buildRefrigerantLoop(): void {
    // 4 Key State Points defining the rectangular closed loop
    // Point 1: Compressor Inlet (-3, 1.2)
    // Point 2: Compressor Outlet to Condenser (-3, 4.0 -> 0, 4.0)
    // Point 3: Condenser to Expansion Valve (0, 4.0 -> 3, 2.4)
    // Point 4: Expansion Valve to Evaporator (3, 2.4 -> 0, 1.0 -> -3, 1.2)

    this.loopPathPoints = [
      new THREE.Vector3(-3.0, 1.2, 0), // Point 1: Evap outlet / Comp inlet
      new THREE.Vector3(-3.0, 4.0, 0), // Discharge pipe
      new THREE.Vector3(0.0, 4.0, 0),  // Condenser (High P superheated -> subcooled)
      new THREE.Vector3(3.0, 4.0, 0),  // Condenser exit
      new THREE.Vector3(3.0, 2.4, 0),  // Point 3 -> Point 4: TXV Throttling
      new THREE.Vector3(3.0, 1.2, 0),  // Low-pressure mixture
      new THREE.Vector3(0.0, 1.2, 0),  // Evaporator (Heat absorption)
    ];

    // Circulating Particles along the loop
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(this.particleCount * 3);
    const pColors = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const t = i / this.particleCount; // progress around loop
      const pt = this.getPointOnLoop(t);
      pPos[i * 3] = pt.x;
      pPos[i * 3 + 1] = pt.y;
      pPos[i * 3 + 2] = pt.z;

      // Color coding: Red/Orange on high-pressure side (top), Blue/Cyan on low-pressure side (bottom)
      if (pt.y > 2.6) {
        pColors[i * 3] = 0.95; pColors[i * 3 + 1] = 0.35; pColors[i * 3 + 2] = 0.1;
      } else {
        pColors[i * 3] = 0.1; pColors[i * 3 + 1] = 0.75; pColors[i * 3 + 2] = 0.95;
      }
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.1,
      transparent: true,
      opacity: 0.9,
    });

    this.refrigerantParticles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.refrigerantParticles);
  }

  private getPointOnLoop(t: number): THREE.Vector3 {
    const pts = this.loopPathPoints;
    const numSegments = pts.length;
    const totalT = (t % 1) * numSegments;
    const idx = Math.floor(totalT);
    const frac = totalT - idx;

    const p1 = pts[idx % numSegments]!;
    const p2 = pts[(idx + 1) % numSegments]!;

    return new THREE.Vector3().lerpVectors(p1, p2, frac);
  }

  public setParameters(_params: { refParams?: RefrigerationParams; result?: RefrigerationResult }): void {
    // Dynamic updates
  }

  public update(delta: number): void {
    const pos = this.refrigerantParticles.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const speed = 0.25;

    for (let i = 0; i < this.particleCount; i++) {
      let t = (i / this.particleCount + performance.now() * 0.001 * speed) % 1;
      const pt = this.getPointOnLoop(t);
      arr[i * 3] = pt.x;
      arr[i * 3 + 1] = pt.y;
      arr[i * 3 + 2] = pt.z;
    }
    pos.needsUpdate = true;
  }
}
