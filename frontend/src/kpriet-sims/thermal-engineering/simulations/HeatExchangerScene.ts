/**
 * Module 3: Heat Exchanger 3D Scene
 * Visualizes Concentric Double-Pipe & Shell-and-Tube heat exchangers with parallel/counter flow,
 * flowing hot & cold fluid streams, dynamic thermography color shifts, and inlet/outlet nozzles.
 */

import * as THREE from 'three';
import { BaseThermalScene } from './BaseThermalScene';
import type { HeatExchangerFlowType, HeatExchangerResult } from '../core/types';

export class HeatExchangerScene extends BaseThermalScene {
  private flowType: HeatExchangerFlowType = 'counter';

  // Shell and Tube Meshes
  private outerShellMesh!: THREE.Mesh;
  private innerTubeMesh!: THREE.Mesh;
  private baffles: THREE.Mesh[] = [];

  // Fluid Particles
  private hotParticles!: THREE.Points;
  private coldParticles!: THREE.Points;
  private hotParticleCount = 80;
  private coldParticleCount = 80;

  // Nozzles
  private hotInNozzle!: THREE.Mesh;
  private hotOutNozzle!: THREE.Mesh;
  private coldInNozzle!: THREE.Mesh;
  private coldOutNozzle!: THREE.Mesh;

  private hotSpeed = 2.0;
  private coldSpeed = 2.0;

  public initScene(): void {
    const exchangerLength = 8.0;

    // 1. Transparent Outer Shell (Annulus)
    const shellGeo = new THREE.CylinderGeometry(1.2, 1.2, exchangerLength, 32, 1, true);
    shellGeo.rotateZ(Math.PI / 2);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 0.2,
      side: THREE.DoubleSide,
    });
    this.outerShellMesh = new THREE.Mesh(shellGeo, shellMat);
    this.outerShellMesh.position.set(0, 2.0, 0);
    this.scene.add(this.outerShellMesh);

    // 2. Inner Heat Exchange Tube with Thermal Color Gradient
    const tubeGeo = new THREE.CylinderGeometry(0.5, 0.5, exchangerLength, 32, 32);
    tubeGeo.rotateZ(Math.PI / 2);

    const count = tubeGeo.attributes.position!.count;
    const colors = new Float32Array(count * 3);
    const pos = tubeGeo.attributes.position!;

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const norm = (x + exchangerLength / 2) / exchangerLength; // 0 to 1
      // Red at hot inlet (x = -4) cooling down to amber/yellow (x = +4)
      colors[i * 3] = 1.0 - norm * 0.3;
      colors[i * 3 + 1] = 0.2 + norm * 0.5;
      colors[i * 3 + 2] = 0.1;
    }
    tubeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const tubeMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.7,
      roughness: 0.25,
    });
    this.innerTubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.innerTubeMesh.position.set(0, 2.0, 0);
    this.scene.add(this.innerTubeMesh);

    // 3. Segmental Baffles in the Shell
    for (let i = -2; i <= 2; i++) {
      const bGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.08, 32, 1, false, 0, Math.PI * 1.4);
      bGeo.rotateZ(Math.PI / 2);
      const bMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.6, roughness: 0.4 });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(i * 1.3, 2.0, 0);
      if (i % 2 === 0) bMesh.rotation.x = Math.PI;
      this.scene.add(bMesh);
      this.baffles.push(bMesh);
    }

    // 4. Hot Stream Particles (inside inner tube: -4 to +4)
    const hotPGeo = new THREE.BufferGeometry();
    const hotPPos = new Float32Array(this.hotParticleCount * 3);
    for (let i = 0; i < this.hotParticleCount; i++) {
      hotPPos[i * 3] = -4 + Math.random() * 8;
      hotPPos[i * 3 + 1] = 2.0 + (Math.random() - 0.5) * 0.6;
      hotPPos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    hotPGeo.setAttribute('position', new THREE.BufferAttribute(hotPPos, 3));
    const hotPMat = new THREE.PointsMaterial({ color: '#ef4444', size: 0.09, transparent: true, opacity: 0.85 });
    this.hotParticles = new THREE.Points(hotPGeo, hotPMat);
    this.scene.add(this.hotParticles);

    // 5. Cold Stream Particles (in outer annular shell)
    const coldPGeo = new THREE.BufferGeometry();
    const coldPPos = new Float32Array(this.coldParticleCount * 3);
    for (let i = 0; i < this.coldParticleCount; i++) {
      coldPPos[i * 3] = -4 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.65 + Math.random() * 0.45;
      coldPPos[i * 3 + 1] = 2.0 + Math.sin(angle) * radius;
      coldPPos[i * 3 + 2] = Math.cos(angle) * radius;
    }
    coldPGeo.setAttribute('position', new THREE.BufferAttribute(coldPPos, 3));
    const coldPMat = new THREE.PointsMaterial({ color: '#06b6d4', size: 0.09, transparent: true, opacity: 0.85 });
    this.coldParticles = new THREE.Points(coldPGeo, coldPMat);
    this.scene.add(this.coldParticles);

    // 6. Fluid Nozzles & Flanges
    const nozzleMatRed = new THREE.MeshStandardMaterial({ color: '#dc2626', metalness: 0.7, roughness: 0.3 });
    const nozzleMatBlue = new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.7, roughness: 0.3 });
    const nGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16);

    // Hot In (left cap)
    this.hotInNozzle = new THREE.Mesh(nGeo, nozzleMatRed);
    this.hotInNozzle.rotation.z = Math.PI / 2;
    this.hotInNozzle.position.set(-4.4, 2.0, 0);
    this.scene.add(this.hotInNozzle);

    // Hot Out (right cap)
    this.hotOutNozzle = new THREE.Mesh(nGeo, nozzleMatRed);
    this.hotOutNozzle.rotation.z = Math.PI / 2;
    this.hotOutNozzle.position.set(4.4, 2.0, 0);
    this.scene.add(this.hotOutNozzle);

    // Cold In & Out (radial ports on shell)
    this.coldInNozzle = new THREE.Mesh(nGeo, nozzleMatBlue);
    this.coldInNozzle.position.set(3.2, 3.2, 0);
    this.scene.add(this.coldInNozzle);

    this.coldOutNozzle = new THREE.Mesh(nGeo, nozzleMatBlue);
    this.coldOutNozzle.position.set(-3.2, 3.2, 0);
    this.scene.add(this.coldOutNozzle);

    // End Flange Caps
    const capGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.2, 32);
    capGeo.rotateZ(Math.PI / 2);
    const capMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.25 });

    const leftCap = new THREE.Mesh(capGeo, capMat);
    leftCap.position.set(-4.0, 2.0, 0);
    this.scene.add(leftCap);

    const rightCap = new THREE.Mesh(capGeo, capMat);
    rightCap.position.set(4.0, 2.0, 0);
    this.scene.add(rightCap);
  }

  public setParameters(params: { flowType?: HeatExchangerFlowType; result?: HeatExchangerResult }): void {
    if (params.flowType) {
      this.flowType = params.flowType;
      // Adjust cold nozzle positions depending on flow direction
      if (this.flowType === 'parallel') {
        this.coldInNozzle.position.set(-3.2, 3.2, 0);
        this.coldOutNozzle.position.set(3.2, 3.2, 0);
      } else {
        this.coldInNozzle.position.set(3.2, 3.2, 0);
        this.coldOutNozzle.position.set(-3.2, 3.2, 0);
      }
    }
  }

  public update(delta: number): void {
    // 1. Hot stream flows left-to-right (positive X)
    const hotPos = this.hotParticles.geometry.attributes.position as THREE.BufferAttribute;
    const hotArr = hotPos.array as Float32Array;

    for (let i = 0; i < this.hotParticleCount; i++) {
      let x = hotArr[i * 3] ?? 0;
      x += delta * this.hotSpeed;
      if (x > 3.9) x = -3.9;
      hotArr[i * 3] = x;
    }
    hotPos.needsUpdate = true;

    // 2. Cold stream flows right-to-left in Counter-flow (negative X) or left-to-right in Parallel-flow
    const coldPos = this.coldParticles.geometry.attributes.position as THREE.BufferAttribute;
    const coldArr = coldPos.array as Float32Array;
    const direction = this.flowType === 'counter' ? -1 : 1;

    for (let i = 0; i < this.coldParticleCount; i++) {
      let x = coldArr[i * 3] ?? 0;
      x += delta * this.coldSpeed * direction;

      if (this.flowType === 'counter') {
        if (x < -3.9) x = 3.9;
      } else {
        if (x > 3.9) x = -3.9;
      }
      coldArr[i * 3] = x;
    }
    coldPos.needsUpdate = true;
  }
}
