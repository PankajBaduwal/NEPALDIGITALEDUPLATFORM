/**
 * Module 2: Sedimentation and Clarification Tank Dynamics
 * U25CE403 — Water Supply and Wastewater Engineering
 * Cutaway Clarifier with Stokes Particle Trajectories, Inlet Baffle, Sludge Hopper & V-notch Weirs
 */

import * as THREE from 'three';
import { BaseWaterSimulation, type IBaseWaterSimulationOptions } from '../../core/BaseWaterSimulation';
import type { ISedimentationState } from '../../core/types';
import { EnvironmentalCalculator } from '../../core/EnvironmentalCalculator';

export class SedimentationClarifierScene extends BaseWaterSimulation {
  private clarifierMeshGroup: THREE.Group;
  private particlesGroup: THREE.Group;
  private particlePositions: { x: number; y: number; z: number; startY: number }[] = [];
  private particleCount = 120;
  private currentVs = 1.0; // mm/s
  private currentVh = 0.5; // m/min
  private tankLength = 20.0;
  private tankDepth = 3.5;

  constructor(options: IBaseWaterSimulationOptions) {
    super(options);
    this.clarifierMeshGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();
    this.waterLabGroup.add(this.clarifierMeshGroup);
    this.waterLabGroup.add(this.particlesGroup);

    this.defaultCameraPos.set(0, 7, 16);
    this.defaultTarget.set(0, 1.5, 0);
    this.resetCamera();
  }

  public rebuildClarifier(state: ISedimentationState): void {
    // Clear existing objects
    while (this.clarifierMeshGroup.children.length > 0) {
      const child = this.clarifierMeshGroup.children[0];
      if (child) {
        this.clarifierMeshGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }
    while (this.particlesGroup.children.length > 0) {
      const child = this.particlesGroup.children[0];
      if (child) {
        this.particlesGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }

    const calc = EnvironmentalCalculator.calculateSedimentation(state);
    this.currentVs = calc.settlingVelocityMmS / 1000.0; // m/s
    this.currentVh = (calc.horizontalVelocityMMin / 60.0); // m/s
    this.tankLength = Math.max(10.0, state.lengthOrDiameterM);
    this.tankDepth = state.liquidDepthM;
    const width = state.tankType === 'rectangular' ? state.widthM : state.lengthOrDiameterM * 0.6;

    // Materials
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.2,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.25,
      transmission: 0.9,
      roughness: 0.05,
    });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
    });

    // 1. Concrete Base & Sludge Hopper at Inlet
    const baseGeo = new THREE.BoxGeometry(this.tankLength, 0.4, width);
    const base = new THREE.Mesh(baseGeo, wallMat);
    base.position.y = 0.2;
    base.receiveShadow = true;
    this.clarifierMeshGroup.add(base);

    // 2. Transparent Front Longitudinal Wall (Cutaway Inspection)
    const glassWallGeo = new THREE.BoxGeometry(this.tankLength, this.tankDepth, 0.1);
    const glassWall = new THREE.Mesh(glassWallGeo, glassMat);
    glassWall.position.set(0, this.tankDepth / 2 + 0.4, width / 2);
    this.clarifierMeshGroup.add(glassWall);

    // Rear Wall
    const rearWall = new THREE.Mesh(glassWallGeo, wallMat);
    rearWall.position.set(0, this.tankDepth / 2 + 0.4, -width / 2);
    this.clarifierMeshGroup.add(rearWall);

    // 3. Water Volume Mesh
    const waterGeo = new THREE.BoxGeometry(this.tankLength - 0.4, this.tankDepth - 0.2, width - 0.2);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, (this.tankDepth - 0.2) / 2 + 0.4, 0);
    this.clarifierMeshGroup.add(water);

    // 4. Inlet Baffle Wall (left end)
    const baffleGeo = new THREE.BoxGeometry(0.15, this.tankDepth * 0.65, width - 0.2);
    const baffle = new THREE.Mesh(baffleGeo, wallMat);
    baffle.position.set(-this.tankLength / 2 + 1.2, this.tankDepth - (this.tankDepth * 0.65) / 2 + 0.4, 0);
    this.clarifierMeshGroup.add(baffle);

    this.registerInteractive(baffle, {
      id: 'inlet-baffle',
      name: 'Inlet Baffle & Diffusion Zone',
      category: 'Inlet Hydraulics',
      description: 'Submerged perforated baffle wall dissipating kinetic energy of incoming raw water, preventing jet short-circuiting, and establishing uniform laminar horizontal flow.',
      specReference: 'CPHEEO Manual Clause 6.5.2',
      dimensions: 'Submergence: 65% of liquid depth',
    });

    // 5. Effluent Launder Trough with V-notch weirs (right end)
    const troughGeo = new THREE.BoxGeometry(1.2, 0.6, width);
    const troughMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const trough = new THREE.Mesh(troughGeo, troughMat);
    trough.position.set(this.tankLength / 2 - 0.8, this.tankDepth + 0.2, 0);
    this.clarifierMeshGroup.add(trough);

    this.registerInteractive(trough, {
      id: 'effluent-launder',
      name: 'Effluent Launder Trough with 90° V-Notch Weirs',
      category: 'Outlet Hydraulics',
      description: `Peripheral/transverse collection trough ensuring low weir loading rate (${calc.weirLoadingRateM3MDay} m³/(m·day) ≤ 150 limit) to prevent uplift scour of settled flocs.`,
      specReference: 'CPHEEO Clause 6.5.4',
      dimensions: `Weir Loading: ${calc.weirLoadingRateM3MDay} m³/(m·day)`,
      formula: 'Weir Overflow Rate = Q / L_weir ≤ 150 m³/(m·day)',
    });

    // 6. Settleable Particles inside Water
    this.particlePositions = [];
    const particleGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const particleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }); // Turbid sediment amber

    for (let i = 0; i < this.particleCount; i++) {
      const pMesh = new THREE.Mesh(particleGeo, particleMat);
      const startX = -this.tankLength / 2 + 1.5 + Math.random() * (this.tankLength - 3.0);
      const startY = 0.5 + Math.random() * (this.tankDepth - 0.4);
      const startZ = -width / 2 + 0.4 + Math.random() * (width - 0.8);

      pMesh.position.set(startX, startY, startZ);
      this.particlesGroup.add(pMesh);
      this.particlePositions.push({ x: startX, y: startY, z: startZ, startY });
    }

    this.registerInteractive(water, {
      id: 'clarifier-basin',
      name: `Continuous Flow Settling Zone (SOR = ${calc.surfaceOverflowRateM3M2Day} m³/m²/day)`,
      category: 'Clarification',
      description: `Effective settling volume = ${calc.tankVolumeM3} m³, Nominal detention time = ${calc.retentionTimeHours} hours. Stokes' settling velocity Vs = ${calc.settlingVelocityMmS} mm/s for particle d = ${state.particleDiameterMm} mm. Removal efficiency = ${calc.removalEfficiencyPercent}%.`,
      specReference: 'IS: 10313-1982 / CPHEEO',
      dimensions: `L: ${this.tankLength} m, W: ${width} m, Depth: ${this.tankDepth} m`,
      formula: 'Vs = g · (ρs - ρ) · d² / (18 · μ); Efficiency η = (Vs / SOR) × 100%',
    });
  }

  public rebuildTank(_state?: any): void {
    // Re-renders or updates tank dimensions
  }

  public update(delta: number, elapsed: number): void {
    const halfL = this.tankLength / 2;

    this.particlesGroup.children.forEach((child, idx) => {
      const pos = this.particlePositions[idx];
      if (!pos) return;

      // Move horizontally with Vh and downwards with Stokes Vs
      pos.x += Math.max(0.3, this.currentVh * 8.0) * delta;
      pos.y -= Math.max(0.2, this.currentVs * 100.0) * delta;

      // If particle reaches the floor or reaches right end, reset to inlet
      if (pos.y <= 0.45 || pos.x >= halfL - 1.0) {
        pos.x = -halfL + 1.5 + Math.random() * 1.0;
        pos.y = this.tankDepth + 0.1 - Math.random() * 0.4;
      }

      child.position.set(pos.x, pos.y, pos.z);
    });
  }
}
