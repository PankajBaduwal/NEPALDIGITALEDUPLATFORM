/**
 * Module 4: Activated Sludge Wastewater Treatment Plant (WWTP / STP)
 * U25CE403 — Water Supply and Wastewater Engineering
 * Full biological treatment train: Bar Screen, Grit Chamber, PST, Aeration Basin (ASP), Secondary Clarifier & RAS/WAS
 */

import * as THREE from 'three';
import { BaseWaterSimulation, type IBaseWaterSimulationOptions } from '../../core/BaseWaterSimulation';
import type { IWastewaterState } from '../../core/types';
import { EnvironmentalCalculator } from '../../core/EnvironmentalCalculator';

export class WastewaterTreatmentScene extends BaseWaterSimulation {
  private plantGroup: THREE.Group;
  private bubblesGroup: THREE.Group;
  private sstBridge: THREE.Group | null = null;

  constructor(options: IBaseWaterSimulationOptions) {
    super(options);
    this.plantGroup = new THREE.Group();
    this.bubblesGroup = new THREE.Group();
    this.waterLabGroup.add(this.plantGroup);
    this.waterLabGroup.add(this.bubblesGroup);

    this.defaultCameraPos.set(15, 11, 20);
    this.defaultTarget.set(0, 1.4, 0);
    this.resetCamera();

    this.buildWastewaterTrain();
  }

  private buildWastewaterTrain(): void {
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

    const rawSewageMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, transparent: true, opacity: 0.8 }); // Dark murky grey-brown
    const mlssMat = new THREE.MeshStandardMaterial({ color: 0x715033, transparent: true, opacity: 0.85 }); // Aerated golden-brown MLSS
    const effluentMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.6 }); // Clean secondary effluent

    // ─────────────────────────────────────────────────────────────
    // 1. Mechanical Bar Screen Channel (X: -12, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const screenGroup = new THREE.Group();
    screenGroup.position.set(-12, 0, 0);

    const channelGeo = new THREE.BoxGeometry(2.8, 1.4, 1.6);
    const channel = new THREE.Mesh(channelGeo, concreteMat);
    channel.position.y = 0.7;
    screenGroup.add(channel);

    // Inclined bar screen (60° incline)
    const barGeo = new THREE.BoxGeometry(0.04, 1.6, 0.04);
    for (let z = -0.6; z <= 0.6; z += 0.15) {
      const bar = new THREE.Mesh(barGeo, metalMat);
      bar.rotation.z = Math.PI / 3;
      bar.position.set(0, 0.8, z);
      screenGroup.add(bar);
    }

    this.plantGroup.add(screenGroup);

    this.registerInteractive(screenGroup, {
      id: 'bar-screen',
      name: 'Mechanical Coarse Bar Screen',
      category: 'Preliminary Treatment',
      description: 'Removes rags, plastics, and large floating debris (clear spacing 20 mm, velocity through rack 0.6 to 0.9 m/s) preventing pump clogging and mechanical damage.',
      specReference: 'CPHEEO Sewerage Manual Clause 8.2',
      dimensions: 'Channel: 2.8 m × 1.6 m, Screen Incline: 60°',
    });

    // ─────────────────────────────────────────────────────────────
    // 2. Vortex Grit Chamber (X: -8, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const gritGroup = new THREE.Group();
    gritGroup.position.set(-8, 0, 0);

    const gritTankGeo = new THREE.CylinderGeometry(1.6, 1.1, 2.2, 24);
    const gritTank = new THREE.Mesh(gritTankGeo, concreteMat);
    gritTank.position.y = 1.1;
    gritGroup.add(gritTank);

    const gritWaterGeo = new THREE.CylinderGeometry(1.5, 1.0, 1.8, 24);
    const gritWater = new THREE.Mesh(gritWaterGeo, rawSewageMat);
    gritWater.position.y = 1.1;
    gritGroup.add(gritWater);

    this.plantGroup.add(gritGroup);

    this.registerInteractive(gritGroup, {
      id: 'grit-chamber',
      name: 'Vortex / Aerated Grit Chamber',
      category: 'Preliminary Treatment',
      description: 'Separates heavy inert mineral particles (sand, gravel, cinders with d ≥ 0.2 mm and Gs ≥ 2.65) by controlled vortex flow before primary clarification.',
      specReference: 'CPHEEO Clause 8.3 (Detention: 60 seconds)',
      dimensions: 'Diameter: 3.2 m, Controlled Velocity: 0.3 m/s',
    });

    // ─────────────────────────────────────────────────────────────
    // 3. Primary Sedimentation Tank (PST) (X: -4, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const pstGroup = new THREE.Group();
    pstGroup.position.set(-4, 0, 0);

    const pstGeo = new THREE.BoxGeometry(3.6, 2.2, 3.8);
    const pst = new THREE.Mesh(pstGeo, concreteMat);
    pst.position.y = 1.1;
    pstGroup.add(pst);

    const pstWaterGeo = new THREE.BoxGeometry(3.4, 1.8, 3.6);
    const pstWater = new THREE.Mesh(pstWaterGeo, rawSewageMat);
    pstWater.position.y = 1.15;
    pstGroup.add(pstWater);

    this.plantGroup.add(pstGroup);

    this.registerInteractive(pstGroup, {
      id: 'pst-tank',
      name: 'Primary Sedimentation Tank (PST)',
      category: 'Primary Treatment',
      description: 'Settles settleable organic solids by plain gravity sedimentation without chemicals. Achieves 30 - 40% BOD5 reduction and 50 - 70% TSS reduction.',
      specReference: 'CPHEEO Clause 8.4 (SOR: 35 - 45 m³/m²/day, HRT: 2.0 hr)',
      dimensions: '3.6 m × 3.8 m × 2.2 m, Sludge Hopper: Bottom apex',
    });

    // ─────────────────────────────────────────────────────────────
    // 4. Aeration Basin (Activated Sludge Process) (X: 1.5, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const aspGroup = new THREE.Group();
    aspGroup.position.set(1.5, 0, 0);

    const aspGeo = new THREE.BoxGeometry(5.4, 2.6, 4.4);
    const asp = new THREE.Mesh(aspGeo, concreteMat);
    asp.position.y = 1.3;
    aspGroup.add(asp);

    const mlssWaterGeo = new THREE.BoxGeometry(5.2, 2.2, 4.2);
    const mlssWater = new THREE.Mesh(mlssWaterGeo, mlssMat);
    mlssWater.position.y = 1.35;
    aspGroup.add(mlssWater);

    // Fine bubble diffuser grid on bottom
    const gridPipeGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.0, 12);
    for (let x = -2.0; x <= 2.0; x += 1.0) {
      const p = new THREE.Mesh(gridPipeGeo, metalMat);
      p.rotation.x = Math.PI / 2;
      p.position.set(x, 0.4, 0);
      aspGroup.add(p);
    }

    // Aeration bubbles
    const bubbleGeo = new THREE.SphereGeometry(0.05, 6, 6);
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    for (let i = 0; i < 60; i++) {
      const b = new THREE.Mesh(bubbleGeo, bubbleMat);
      b.position.set(
        -1.0 + Math.random() * 4.6,
        0.5 + Math.random() * 1.8,
        -1.8 + Math.random() * 3.6
      );
      this.bubblesGroup.add(b);
    }

    this.plantGroup.add(aspGroup);

    this.registerInteractive(aspGroup, {
      id: 'asp-aeration',
      name: 'Activated Sludge Aeration Basin (ASP)',
      category: 'Secondary Biological Treatment',
      description: 'Aerated mixed liquor tank (MLSS 2500 - 3500 mg/L) where heterotrophic aerobic microorganisms biochemically oxidize soluble and colloidal organic matter into CO₂, H₂O, and new bacterial cell mass.',
      specReference: 'CPHEEO Clause 8.5 (HRT: 6 - 8 hr, F/M: 0.2 - 0.4 kg/kg·day, SRT: 5 - 15 days)',
      dimensions: 'Basin Volume: 3500 m³, DO maintained ≥ 2.0 mg/L',
      formula: 'F/M = (Q · S₀) / (V · X); Biomass Yield Px = Y_obs · Q · (S₀ - S)',
    });

    // ─────────────────────────────────────────────────────────────
    // 5. Secondary Clarifier / Final Settling Tank (X: 7.5, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const sstGroup = new THREE.Group();
    sstGroup.position.set(7.5, 0, 0);

    const sstWallGeo = new THREE.CylinderGeometry(3.2, 3.2, 2.6, 32, 1, true);
    const sstWall = new THREE.Mesh(sstWallGeo, concreteMat);
    sstWall.position.y = 1.3;
    sstGroup.add(sstWall);

    const sstWaterGeo = new THREE.CylinderGeometry(3.1, 3.1, 2.3, 32);
    const sstWater = new THREE.Mesh(sstWaterGeo, effluentMat);
    sstWater.position.y = 1.25;
    sstGroup.add(sstWater);

    // Revolving bridge
    this.sstBridge = new THREE.Group();
    this.sstBridge.position.set(0, 2.7, 0);
    const bridgeGeo = new THREE.BoxGeometry(6.4, 0.15, 0.4);
    const bridge = new THREE.Mesh(bridgeGeo, metalMat);
    this.sstBridge.add(bridge);
    sstGroup.add(this.sstBridge);

    this.plantGroup.add(sstGroup);

    this.registerInteractive(sstGroup, {
      id: 'sst-clarifier',
      name: 'Secondary Clarifier & Sludge Recycle Pump Well',
      category: 'Secondary Clarification',
      description: 'Separates biological sludge flocs from treated effluent. Sludge is drawn from bottom: Return Activated Sludge (RAS) recycled to aeration tank; Waste Activated Sludge (WAS) sent to sludge thickener.',
      specReference: 'CPHEEO Clause 8.6 (SOR: 15 - 25 m³/m²/day, SVI: 80 - 150 mL/g)',
      dimensions: 'Diameter: 6.4 m, Depth: 3.5 m',
      formula: 'Recycle Ratio R = X / (Xr - X)',
    });

    // ─────────────────────────────────────────────────────────────
    // 6. Treated Effluent & Disinfection Outlet (X: 12.5, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const outGroup = new THREE.Group();
    outGroup.position.set(12.5, 0, 0);

    const outBoxGeo = new THREE.BoxGeometry(2.8, 1.6, 2.8);
    const outBox = new THREE.Mesh(outBoxGeo, concreteMat);
    outBox.position.y = 0.8;
    outGroup.add(outBox);

    const outWaterGeo = new THREE.BoxGeometry(2.6, 1.4, 2.6);
    const outWater = new THREE.Mesh(outWaterGeo, effluentMat);
    outWater.position.y = 0.85;
    outGroup.add(outWater);

    this.plantGroup.add(outGroup);

    this.registerInteractive(outGroup, {
      id: 'treated-outfall',
      name: 'Treated Effluent Outfall (CPCB Compliant)',
      category: 'Tertiary & Discharge',
      description: 'Polished and disinfected final effluent ready for agricultural irrigation, industrial cooling, or safe discharge into inland surface waters per CPCB standards (BOD ≤ 30 mg/L, TSS ≤ 50 mg/L).',
      specReference: 'CPCB Environment (Protection) Rules Schedule VI',
      dimensions: 'BOD ≤ 20 mg/L, COD ≤ 250 mg/L, pH 6.5 - 8.5',
    });

    // Connecting RAS Recycle Pipeline back to ASP
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, metalness: 0.8 }); // Purple for recycled sludge
    const rasGeo = new THREE.CylinderGeometry(0.08, 0.08, 6.0, 16);
    const rasPipe = new THREE.Mesh(rasGeo, pipeMat);
    rasPipe.rotation.z = Math.PI / 2;
    rasPipe.position.set(4.5, 0.3, 2.0);
    this.plantGroup.add(rasPipe);
  }

  public updateWastewaterState(_state: IWastewaterState): void {
    // Dynamic updates
  }

  public rebuildPlant(_state?: any): void {
    // Re-renders or updates WWTP units
  }

  public update(delta: number, elapsed: number): void {
    // Revolve secondary clarifier scraper bridge
    if (this.sstBridge) {
      this.sstBridge.rotation.y += delta * 0.06;
    }

    // Aeration bubble animation
    this.bubblesGroup.children.forEach((b) => {
      b.position.y += delta * 1.8;
      if (b.position.y > 2.4) {
        b.position.y = 0.5 + Math.random() * 0.2;
      }
    });
  }
}
