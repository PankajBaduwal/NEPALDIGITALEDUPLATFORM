/**
 * Module 1: 3D Conventional Water Treatment Plant Flowline
 * U25CE403 — Water Supply and Wastewater Engineering
 * Full treatment train: Cascade Aerator, Flash Mixer, Flocculator, Clarifier, Filters & Disinfection Sump
 */

import * as THREE from 'three';
import { BaseWaterSimulation, type IBaseWaterSimulationOptions } from '../../core/BaseWaterSimulation';
import type { IWtpState } from '../../core/types';
import { EnvironmentalCalculator } from '../../core/EnvironmentalCalculator';

export class WaterTreatmentPlantScene extends BaseWaterSimulation {
  private unitsGroup: THREE.Group;
  private pipesGroup: THREE.Group;
  private waterMeshes: THREE.Mesh[] = [];
  private flocculatorPaddles: THREE.Group[] = [];
  private clarifierBridge: THREE.Group | null = null;

  constructor(options: IBaseWaterSimulationOptions) {
    super(options);
    this.unitsGroup = new THREE.Group();
    this.pipesGroup = new THREE.Group();
    this.waterLabGroup.add(this.unitsGroup);
    this.waterLabGroup.add(this.pipesGroup);

    this.defaultCameraPos.set(16, 12, 22);
    this.defaultTarget.set(0, 1.5, 0);
    this.resetCamera();

    this.buildTreatmentPlantUnits();
    this.buildConnectingPipelines();
  }

  private buildTreatmentPlantUnits(): void {
    // Shared Materials
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

    // Water Materials with progressive visual purification:
    const rawWaterMat = new THREE.MeshStandardMaterial({
      color: 0x785535, // Turbid brown-green
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
    });
    const flocWaterMat = new THREE.MeshStandardMaterial({
      color: 0x5a7862, // Flocculated greenish
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    });
    const clearWaterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Clean azure potable water
      transparent: true,
      opacity: 0.65,
      roughness: 0.05,
    });

    // ─────────────────────────────────────────────────────────────
    // 1. Raw Water Intake & Pump House (X: -14, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const intakeGroup = new THREE.Group();
    intakeGroup.position.set(-14, 0, 0);

    const pumpHouseGeo = new THREE.BoxGeometry(3.5, 2.5, 3.5);
    const pumpHouse = new THREE.Mesh(pumpHouseGeo, concreteMat);
    pumpHouse.position.y = 1.25;
    pumpHouse.castShadow = true;
    intakeGroup.add(pumpHouse);

    const intakeWellGeo = new THREE.CylinderGeometry(1.5, 1.5, 2.0, 24);
    const intakeWell = new THREE.Mesh(intakeWellGeo, rawWaterMat);
    intakeWell.position.set(0, 1.0, 2.5);
    intakeGroup.add(intakeWell);
    this.waterMeshes.push(intakeWell);

    this.unitsGroup.add(intakeGroup);

    this.registerInteractive(intakeGroup, {
      id: 'unit-intake',
      name: 'River Intake & Low-Lift Raw Water Pumping Station',
      category: 'Intake Works',
      description: 'Collects raw river/reservoir water through coarse bar screens (25 mm clear spacing) preventing debris entry into transmission mains.',
      specReference: 'CPHEEO Water Supply Manual Section 5.3',
      dimensions: 'Capacity: 10 - 100 MLD with standby submersible pumps',
    });

    // ─────────────────────────────────────────────────────────────
    // 2. Cascade Aerator (X: -9, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const aeratorGroup = new THREE.Group();
    aeratorGroup.position.set(-9, 0, 0);

    // 4 stepped circular concrete trays
    const trayRadii = [2.2, 1.8, 1.4, 1.0];
    trayRadii.forEach((r, idx) => {
      const trayGeo = new THREE.CylinderGeometry(r, r, 0.25, 24);
      const tray = new THREE.Mesh(trayGeo, concreteMat);
      tray.position.y = 0.4 + idx * 0.45;
      tray.castShadow = true;
      aeratorGroup.add(tray);

      const waterRingGeo = new THREE.CylinderGeometry(r - 0.1, r - 0.1, 0.15, 24);
      const waterRing = new THREE.Mesh(waterRingGeo, rawWaterMat);
      waterRing.position.y = 0.5 + idx * 0.45;
      aeratorGroup.add(waterRing);
      this.waterMeshes.push(waterRing);
    });

    // Central supply pipe
    const riserGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 16);
    const riser = new THREE.Mesh(riserGeo, metalMat);
    riser.position.y = 1.25;
    aeratorGroup.add(riser);

    this.unitsGroup.add(aeratorGroup);

    this.registerInteractive(aeratorGroup, {
      id: 'unit-aerator',
      name: 'Cascade Aerator (4 Stepped Concrete Trays)',
      category: 'Pre-Treatment',
      description: 'Strips volatile taste/odour compounds (H₂S, CO₂), oxidizes soluble ferrous (Fe²⁺) and manganous (Mn²⁺) ions, and enriches dissolved oxygen (DO) to saturation.',
      specReference: 'CPHEEO Manual Clause 6.2 (Tray Area 0.03 m²/m³/hr)',
      dimensions: 'Diameter: 4.4 m, 4 Trays, Fall: 1.8 m',
      formula: 'Oxygen Deficit Reduction: D = D₀ · 10^(-k·t)',
    });

    // ─────────────────────────────────────────────────────────────
    // 3. Chemical Dosing & Flash Mixer (X: -5, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const flashGroup = new THREE.Group();
    flashGroup.position.set(-5, 0, 0);

    const flashTankGeo = new THREE.CylinderGeometry(1.1, 1.1, 2.2, 24);
    const flashTank = new THREE.Mesh(flashTankGeo, concreteMat);
    flashTank.position.y = 1.1;
    flashTank.castShadow = true;
    flashGroup.add(flashTank);

    const flashWaterGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.8, 24);
    const flashWater = new THREE.Mesh(flashWaterGeo, flocWaterMat);
    flashWater.position.y = 1.1;
    flashGroup.add(flashWater);
    this.waterMeshes.push(flashWater);

    // Impeller motor & shaft
    const motorGeo = new THREE.BoxGeometry(0.5, 0.4, 0.5);
    const motor = new THREE.Mesh(motorGeo, metalMat);
    motor.position.y = 2.4;
    flashGroup.add(motor);

    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 12);
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    shaft.position.y = 1.5;
    flashGroup.add(shaft);

    this.unitsGroup.add(flashGroup);

    this.registerInteractive(flashGroup, {
      id: 'unit-flash-mixer',
      name: 'Rapid Flash Mixer & Alum Dosing Chamber',
      category: 'Coagulation',
      description: 'High-speed impeller mixer operating at 400 - 600 RPM creating violent velocity gradient (G ≈ 600 - 800 s⁻¹) for instantaneous hydrolysis and destabilization of colloidal charge.',
      specReference: 'CPHEEO Clause 6.3 (Detention Time: 30 - 60 seconds)',
      dimensions: 'Diameter: 2.2 m, Depth: 2.2 m, G: 700 s⁻¹',
      formula: 'P = G² · μ · V (Power requirement in Watts)',
    });

    // ─────────────────────────────────────────────────────────────
    // 4. Mechanical Flocculator (X: -1.5, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const flocGroup = new THREE.Group();
    flocGroup.position.set(-1.5, 0, 0);

    const flocTankGeo = new THREE.BoxGeometry(3.6, 2.4, 3.6);
    const flocTank = new THREE.Mesh(flocTankGeo, concreteMat);
    flocTank.position.y = 1.2;
    flocTank.castShadow = true;
    flocGroup.add(flocTank);

    const flocWaterGeo = new THREE.BoxGeometry(3.4, 2.0, 3.4);
    const flocWater = new THREE.Mesh(flocWaterGeo, flocWaterMat);
    flocWater.position.y = 1.2;
    flocGroup.add(flocWater);
    this.waterMeshes.push(flocWater);

    // Rotating paddle wheel assembly
    const paddleShaft = new THREE.Group();
    paddleShaft.position.set(0, 1.2, 0);
    const bladeGeo = new THREE.BoxGeometry(2.8, 0.2, 0.05);
    const b1 = new THREE.Mesh(bladeGeo, metalMat);
    const b2 = new THREE.Mesh(bladeGeo, metalMat);
    b2.rotation.z = Math.PI / 2;
    paddleShaft.add(b1);
    paddleShaft.add(b2);
    flocGroup.add(paddleShaft);
    this.flocculatorPaddles.push(paddleShaft);

    this.unitsGroup.add(flocGroup);

    this.registerInteractive(flocGroup, {
      id: 'unit-flocculator',
      name: 'Mechanical Slow-Mixing Paddle Flocculator',
      category: 'Flocculation',
      description: 'Slow, gentle mixing (tip speed 0.3 - 0.4 m/s) with Camp-Stein Camp number G·t = 20,000 - 50,000 to agglomerate micro-flocs into heavy settleable macro-flocs.',
      specReference: 'CPHEEO Clause 6.4 (Detention Time: 20 - 30 minutes)',
      dimensions: 'Length: 3.6 m, Width: 3.6 m, Depth: 2.4 m',
      formula: 'Camp Number: G · t = 30,000',
    });

    // ─────────────────────────────────────────────────────────────
    // 5. Circular Clariflocculator / Clarifier (X: 3.5, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const clarifierGroup = new THREE.Group();
    clarifierGroup.position.set(3.5, 0, 0);

    const clarifierWallGeo = new THREE.CylinderGeometry(3.2, 3.2, 2.4, 32, 1, true);
    const clarifierWall = new THREE.Mesh(clarifierWallGeo, concreteMat);
    clarifierWall.position.y = 1.2;
    clarifierWall.castShadow = true;
    clarifierGroup.add(clarifierWall);

    const clarifierWaterGeo = new THREE.CylinderGeometry(3.1, 3.1, 2.1, 32);
    const clarifierWater = new THREE.Mesh(clarifierWaterGeo, clearWaterMat);
    clarifierWater.position.y = 1.15;
    clarifierGroup.add(clarifierWater);
    this.waterMeshes.push(clarifierWater);

    // Central influent well
    const wellGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 24, 1, true);
    const well = new THREE.Mesh(wellGeo, metalMat);
    well.position.y = 1.4;
    clarifierGroup.add(well);

    // Revolving scraper bridge
    this.clarifierBridge = new THREE.Group();
    this.clarifierBridge.position.set(0, 2.5, 0);
    const bridgeBeamGeo = new THREE.BoxGeometry(6.4, 0.15, 0.4);
    const bridgeBeam = new THREE.Mesh(bridgeBeamGeo, metalMat);
    this.clarifierBridge.add(bridgeBeam);
    clarifierGroup.add(this.clarifierBridge);

    this.unitsGroup.add(clarifierGroup);

    this.registerInteractive(clarifierGroup, {
      id: 'unit-clarifier',
      name: 'Circular Radial-Flow Clarifier (Sedimentation Tank)',
      category: 'Clarification',
      description: 'Continuous clarification with peripheral V-notch weirs. Settles chemical flocs via gravity with surface overflow rate (SOR) of 30 m³/(m²·day). Revolving scraper rakes sludge to central hopper.',
      specReference: 'CPHEEO Clause 6.5 (Detention: 2.0 - 2.5 hours)',
      dimensions: 'Diameter: 6.4 m, Side Water Depth: 3.2 m',
      formula: 'SOR = Q / A_surface ≤ 30 m³/(m²·day)',
    });

    // ─────────────────────────────────────────────────────────────
    // 6. Rapid Sand Filter Beds (X: 8.5, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const filterGroup = new THREE.Group();
    filterGroup.position.set(8.5, 0, 0);

    const filterBoxGeo = new THREE.BoxGeometry(3.8, 2.2, 4.2);
    const filterBox = new THREE.Mesh(filterBoxGeo, concreteMat);
    filterBox.position.y = 1.1;
    filterBox.castShadow = true;
    filterGroup.add(filterBox);

    // Multi-media cutaway layers inside filter box
    // Gravel bed
    const gravelGeo = new THREE.BoxGeometry(3.5, 0.4, 3.8);
    const gravelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const gravel = new THREE.Mesh(gravelGeo, gravelMat);
    gravel.position.y = 0.4;
    filterGroup.add(gravel);

    // Sand bed
    const sandGeo = new THREE.BoxGeometry(3.5, 0.6, 3.8);
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 }); // Sand yellow-amber
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.position.y = 0.9;
    filterGroup.add(sand);

    // Filter water layer above bed
    const filterWaterGeo = new THREE.BoxGeometry(3.5, 0.8, 3.8);
    const filterWater = new THREE.Mesh(filterWaterGeo, clearWaterMat);
    filterWater.position.y = 1.6;
    filterGroup.add(filterWater);
    this.waterMeshes.push(filterWater);

    this.unitsGroup.add(filterGroup);

    this.registerInteractive(filterGroup, {
      id: 'unit-filter-bed',
      name: 'Dual-Media Rapid Gravity Sand Filter',
      category: 'Filtration',
      description: 'Contains 0.6m graded quartz sand (D10 = 0.5 mm) supported on 0.45m graded gravel. Removes pin-point flocs, cysts, and residual turbidity. Backwashed using air scour + high-rate water wash.',
      specReference: 'CPHEEO Clause 6.6 (Rate: 5000 L/m²/hr = 120 m³/m²/day)',
      dimensions: 'Dual Beds: 3.8 m × 4.2 m, Underdrain: Manifold & lateral',
      formula: 'Clean Bed Head Loss via Carmen-Kozeny equation',
    });

    // ─────────────────────────────────────────────────────────────
    // 7. Clear Water Sump & Disinfection (X: 13.5, Z: 0)
    // ─────────────────────────────────────────────────────────────
    const sumpGroup = new THREE.Group();
    sumpGroup.position.set(13.5, 0, 0);

    const sumpGeo = new THREE.BoxGeometry(4.2, 1.8, 4.2);
    const sump = new THREE.Mesh(sumpGeo, concreteMat);
    sump.position.y = 0.9;
    sump.castShadow = true;
    sumpGroup.add(sump);

    const sumpWaterGeo = new THREE.BoxGeometry(4.0, 1.5, 4.0);
    const sumpWater = new THREE.Mesh(sumpWaterGeo, clearWaterMat);
    sumpWater.position.y = 0.95;
    sumpGroup.add(sumpWater);
    this.waterMeshes.push(sumpWater);

    this.unitsGroup.add(sumpGroup);

    this.registerInteractive(sumpGroup, {
      id: 'unit-clear-sump',
      name: 'Disinfection Contact Chamber & Clear Water Reservoir',
      category: 'Treated Storage',
      description: 'Provides minimum 30-min chlorine contact time to achieve 99.99% disinfection of waterborne pathogens. Stores potable water for high-lift transmission to elevated service reservoirs (ESR).',
      specReference: 'BIS 10500:2012 (Residual Chlorine: 0.2 to 1.0 mg/L)',
      dimensions: 'Storage: 2 hours capacity at design flow rate',
    });
  }

  private buildConnectingPipelines(): void {
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });

    // Pipeline interconnecting units along X-axis
    const pipePoints = [
      new THREE.Vector3(-14, 0.4, 0),
      new THREE.Vector3(-9, 0.4, 0),
      new THREE.Vector3(-5, 0.4, 0),
      new THREE.Vector3(-1.5, 0.4, 0),
      new THREE.Vector3(3.5, 0.4, 0),
      new THREE.Vector3(8.5, 0.4, 0),
      new THREE.Vector3(13.5, 0.4, 0),
    ];

    for (let i = 0; i < pipePoints.length - 1; i++) {
      const p1 = pipePoints[i];
      const p2 = pipePoints[i + 1];
      if (!p1 || !p2) continue;

      const dist = p1.distanceTo(p2);
      const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, dist, 16);
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set((p1.x + p2.x) / 2, 0.4, 0);
      pipe.castShadow = true;
      this.pipesGroup.add(pipe);
    }
  }

  public updateWtpSimulation(_state: IWtpState): void {
    // Flow indicators or state changes
  }

  public updateFlowRate(_capacityMld?: number): void {
    // Updates flow animation rate
  }

  public update(delta: number, elapsed: number): void {
    // Slowly rotate flocculator paddles (approx 3 RPM = 0.3 rad/s)
    this.flocculatorPaddles.forEach((paddle) => {
      paddle.rotation.z += delta * 0.4;
    });

    // Slowly revolve clarifier scraper bridge (approx 1 rev per 20 min)
    if (this.clarifierBridge) {
      this.clarifierBridge.rotation.y += delta * 0.08;
    }

    // Subtle water surface shimmer
    this.waterMeshes.forEach((mesh, idx) => {
      mesh.position.y += Math.sin(elapsed * 2.5 + idx) * 0.0006;
    });
  }
}
