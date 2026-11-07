/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * Unit II: Fundamentals of Heat Transfer and Fluids
 * Simulations 06 to 10
 */

import * as THREE from 'three';
import { BaseSimulation } from '../core/BaseSimulation';
import type { SimulationOptions, ParameterDefinition } from '../core/types';

// =========================================================================
// Simulation 06: 3D Heat Transfer Studio (Conduction, Convection, Radiation)
// =========================================================================
export class HeatTransferScene extends BaseSimulation {
  private solidBar!: THREE.Mesh;
  private hotPlaten!: THREE.Mesh;
  private coldPlaten!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'transferMode',
        label: 'Heat Transfer Mechanism',
        description: 'Active primary mode of thermal energy transfer',
        type: 'select',
        options: [
          { label: 'Conduction (Solid Rod: Fourier’s Law)', value: 'conduction' },
          { label: 'Convection (Heated Surface to Fluid: Newton’s Law)', value: 'convection' },
          { label: 'Radiation (Surface to Enclosure: Stefan–Boltzmann)', value: 'radiation' },
        ],
        defaultValue: 'conduction',
      },
      {
        key: 'tempHotC',
        label: 'Source Temperature (T_hot)',
        description: 'High temperature boundary condition',
        type: 'number',
        min: 50,
        max: 500,
        step: 10,
        unit: '°C',
        defaultValue: 200,
      },
      {
        key: 'tempColdC',
        label: 'Sink / Ambient Temperature (T_cold)',
        description: 'Low temperature sink or fluid ambient temperature',
        type: 'number',
        min: 10,
        max: 40,
        step: 5,
        unit: '°C',
        defaultValue: 25,
      },
      {
        key: 'materialConductivity',
        label: 'Conductive Material',
        description: 'Material thermal conductivity (k)',
        type: 'select',
        options: [
          { label: 'Copper (k = 398 W/m·K)', value: 'copper' },
          { label: 'Aluminium (k = 205 W/m·K)', value: 'aluminium' },
          { label: 'Mild Steel (k = 50 W/m·K)', value: 'steel' },
          { label: 'Glass / Insulator (k = 0.8 W/m·K)', value: 'glass' },
        ],
        defaultValue: 'copper',
      },
    ];
  }

  protected initScene(): void {
    // Solid Conduction Bar
    const barGeo = new THREE.CylinderGeometry(0.3, 0.3, 4.0, 32);
    barGeo.rotateZ(Math.PI / 2);
    const barMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });
    this.solidBar = new THREE.Mesh(barGeo, barMat);
    this.solidBar.name = 'thermal-conductor';
    this.solidBar.userData = { componentId: 'thermal-conductor' };

    // Hot Platen
    this.hotPlaten = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 2.0), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    this.hotPlaten.position.set(-2.3, 0, 0);

    // Cold Platen
    this.coldPlaten = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 2.0), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    this.coldPlaten.position.set(2.3, 0, 0);

    this.scene.add(this.solidBar, this.hotPlaten, this.coldPlaten);

    // Stream particles for heat flux
    this.particleSystem.createStream(
      'heat-flux',
      { count: 60, color: 0xf59e0b, size: 0.05, speed: 1.5, opacity: 0.8 },
      { min: new THREE.Vector3(-2.0, -0.2, -0.2), max: new THREE.Vector3(2.0, 0.2, 0.2) }
    );

    this.parameters.transferMode = 'conduction';
    this.parameters.tempHotC = 200;
    this.parameters.tempColdC = 25;
    this.parameters.materialConductivity = 'copper';
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-mechanisms',
        index: 0,
        title: 'Stage 1: Fundamental Heat Transfer Modes',
        shortDescription: 'Compare conduction (microscopic collisions), convection (bulk motion), and radiation (photons).',
        detailedExplanation:
          'Thermal energy propagates through solids via free electron transport and lattice vibration phonons (Fourier’s law). ' +
          'In fluids, convection combines conduction with advective motion. Radiation transfers energy via electromagnetic waves without requiring a material medium.',
        physicsFormulas: [
          'Conduction: Q_cond = - k · A · (dT/dx)',
          'Convection: Q_conv = h · A · (T_s - T_∞)',
          'Radiation: Q_rad = ε · σ · A · (T_s⁴ - T_surr⁴)',
        ],
        highlightComponentIds: ['thermal-conductor'],
        recommendedCamera: { position: [0, 2.0, 5.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('thermal-conductor', {
      id: 'thermal-conductor',
      name: 'Solid Cylindrical Thermal Conductor',
      scientificRole: '1D steady-state heat conduction specimen with insulated perimeter',
      materialsAndSpecs: 'Diameter d = 60 mm, Length L = 4.0 m, Area A = 0.00283 m²',
      physicalPrinciples: 'Governed by Fourier’s law of heat conduction under steady state conditions.',
      equations: ['Q = k · A · (T_hot - T_cold) / L'],
    });
  }

  protected updatePhysics(_delta: number): void {
    const mode = String(this.parameters.transferMode || 'conduction');
    const tHotC = Number(this.parameters.tempHotC || 200);
    const tColdC = Number(this.parameters.tempColdC || 25);
    const mat = String(this.parameters.materialConductivity || 'copper');

    const tHotK = tHotC + 273.15;
    const tColdK = tColdC + 273.15;
    const deltaT = tHotC - tColdC;
    const A = Math.PI * Math.pow(0.03, 2); // 0.002827 m²
    const L = 4.0; // m

    let k = 398;
    if (mat === 'aluminium') k = 205;
    else if (mat === 'steel') k = 50;
    else if (mat === 'glass') k = 0.8;

    let heatRateWatts = 0;
    if (mode === 'conduction') {
      heatRateWatts = (k * A * deltaT) / L;
    } else if (mode === 'convection') {
      const h = 45; // W/m²·K (forced air convection)
      heatRateWatts = h * (2 * Math.PI * 0.03 * L) * deltaT;
    } else {
      const sigma = 5.670374419e-8; // Stefan-Boltzmann constant
      const eps = 0.85; // Emissivity
      heatRateWatts = eps * sigma * (2 * Math.PI * 0.03 * L) * (Math.pow(tHotK, 4) - Math.pow(tColdK, 4));
    }

    this.metrics['heatFlowRateWatts'] = Number(heatRateWatts.toFixed(2));
    this.metrics['deltaTempK'] = Number(deltaT.toFixed(1));
    this.metrics['thermalConductivity'] = `${k} W/m·K`;
    this.metrics['heatFluxDensity'] = `${(heatRateWatts / A).toFixed(1)} W/m²`;
  }
}

// =========================================================================
// Simulation 07: 3D Thermal Expansion & Lee's Disc Method
// =========================================================================
export class ThermalExpansionLeesDiscScene extends BaseSimulation {
  private leesDiscGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'specimenType',
        label: 'Bad Conductor Specimen',
        description: 'Insulating material disc tested in Lee’s Disc apparatus',
        type: 'select',
        options: [
          { label: 'Cardboard / Ebonite (k ≈ 0.15 W/m·K)', value: 'cardboard' },
          { label: 'Glass Disc (k ≈ 0.80 W/m·K)', value: 'glass' },
          { label: 'Bakelite Composite (k ≈ 0.23 W/m·K)', value: 'bakelite' },
        ],
        defaultValue: 'cardboard',
      },
      {
        key: 'steamTempT1',
        label: 'Steam Chamber Temp (T₁)',
        description: 'Steady temperature of upper steam chamber',
        type: 'number',
        min: 80,
        max: 100,
        step: 1,
        unit: '°C',
        defaultValue: 98,
      },
      {
        key: 'steadyTempT2',
        label: 'Metallic Disc Temp (T₂)',
        description: 'Steady temperature of lower brass disc',
        type: 'number',
        min: 50,
        max: 90,
        step: 1,
        unit: '°C',
        defaultValue: 72,
      },
    ];
  }

  protected initScene(): void {
    this.leesDiscGroup = new THREE.Group();

    // 1. Steam Chamber (Top cylindrical metallic boiler)
    const steamGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.8, 32);
    const steamMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const steamChamber = new THREE.Mesh(steamGeo, steamMat);
    steamChamber.position.y = 0.9;
    steamChamber.name = 'steam-chamber';

    // 2. Bad Conductor Disc (Thin disc in between)
    const specGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.15, 32);
    const specMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const specDisc = new THREE.Mesh(specGeo, specMat);
    specDisc.position.y = 0.425;
    specDisc.name = 'bad-conductor-disc';

    // 3. Lower Brass Slab (Bottom metallic disc)
    const brassGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.7, 32);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
    const brassSlab = new THREE.Mesh(brassGeo, brassMat);
    brassSlab.position.y = 0.0;
    brassSlab.name = 'brass-slab';

    // 4. Suspension strings & stand
    const standGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 16);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
    const standL = new THREE.Mesh(standGeo, standMat);
    standL.position.set(-1.8, 0.5, 0);
    const standR = new THREE.Mesh(standGeo, standMat);
    standR.position.set(1.8, 0.5, 0);

    this.leesDiscGroup.add(steamChamber, specDisc, brassSlab, standL, standR);
    this.leesDiscGroup.userData = { componentId: 'lees-apparatus' };
    this.scene.add(this.leesDiscGroup);

    this.parameters.specimenType = 'cardboard';
    this.parameters.steamTempT1 = 98;
    this.parameters.steadyTempT2 = 72;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-lees-disc-theory',
        index: 0,
        title: 'Stage 1: Lee’s Disc Steady State & Cooling Rate',
        shortDescription: 'Thermal conductivity measurement of poor thermal conductors under steady state.',
        detailedExplanation:
          'At steady state, heat conducted through the bad conductor disc equals heat radiated/convected by the lower brass slab: ' +
          'k · πr² · (T₁ - T₂) / d = M · s · (dT/dt)_{T2} · (r + 2h) / (2r + 2h).',
        physicsFormulas: ['k = [M · s · (dT/dt) · d · (r + 2h)] / [π · r² · (T₁ - T₂) · (2r + 2h)]'],
        highlightComponentIds: ['lees-apparatus'],
        recommendedCamera: { position: [0, 1.5, 4.8], target: [0, 0.5, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('lees-apparatus', {
      id: 'lees-apparatus',
      name: 'Lee’s Disc Thermal Apparatus',
      scientificRole: 'Standard laboratory bench for measuring thermal conductivity of bad conductors (glass, ebonite, cardboard)',
      materialsAndSpecs: 'Brass disc mass M = 1.05 kg, specific heat s = 385 J/kg·K, radius r = 0.055 m, thickness d = 0.003 m',
      physicalPrinciples: 'Balances conductive heat flux across poor conductor with convective/radiative heat loss rate of exposed slab.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const t1 = Number(this.parameters.steamTempT1 || 98);
    const t2 = Number(this.parameters.steadyTempT2 || 72);
    const M = 1.05; // kg
    const s = 385; // J/kg·K
    const r = 0.055; // m
    const h = 0.015; // m
    const d = 0.003; // 3 mm thickness

    // Empirical cooling rate at T2
    const coolingRate = 0.025; // °C/s

    // Calculate thermal conductivity k
    const num = M * s * coolingRate * d * (r + 2 * h);
    const den = Math.PI * Math.pow(r, 2) * (t1 - t2) * (2 * r + 2 * h);
    const k = num / Math.max(den, 1e-5);

    this.metrics['conductivityK'] = `${k.toFixed(3)} W/m·K`;
    this.metrics['tempGradient'] = `${((t1 - t2) / d).toFixed(0)} °C/m`;
    this.metrics['coolingRate'] = `${coolingRate} °C/s`;
  }
}

// =========================================================================
// Simulation 08: 3D Surface Tension & Capillary Phenomena
// =========================================================================
export class SurfaceTensionScene extends BaseSimulation {
  private liquidReservoir!: THREE.Mesh;
  private capillaryTube!: THREE.Mesh;
  private waterColumnMesh!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'liquidType',
        label: 'Fluid Sample',
        description: 'Test fluid with calibrated surface tension (T) and density (ρ)',
        type: 'select',
        options: [
          { label: 'Pure Water (T = 0.0728 N/m, ρ = 1000 kg/m³, θ = 0°)', value: 'water' },
          { label: 'Ethanol (T = 0.0223 N/m, ρ = 789 kg/m³, θ = 0°)', value: 'ethanol' },
          { label: 'Mercury (T = 0.4865 N/m, ρ = 13600 kg/m³, θ = 140° - Depression)', value: 'mercury' },
          { label: 'Glycerol (T = 0.0634 N/m, ρ = 1260 kg/m³, θ = 20°)', value: 'glycerol' },
        ],
        defaultValue: 'water',
      },
      {
        key: 'capillaryRadiusMm',
        label: 'Capillary Radius (r)',
        description: 'Internal bore radius of the capillary tube',
        type: 'number',
        min: 0.2,
        max: 2.0,
        step: 0.1,
        unit: 'mm',
        defaultValue: 0.5,
      },
    ];
  }

  protected initScene(): void {
    // Reservoir trough
    const resGeo = new THREE.CylinderGeometry(2.0, 2.0, 1.2, 32);
    const resMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65, roughness: 0.1 });
    this.liquidReservoir = new THREE.Mesh(resGeo, resMat);
    this.liquidReservoir.position.y = -1.0;
    this.scene.add(this.liquidReservoir);

    // Glass Capillary Tube
    const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.0, 24);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, roughness: 0.05 });
    this.capillaryTube = new THREE.Mesh(tubeGeo, tubeMat);
    this.capillaryTube.position.y = 0.8;
    this.capillaryTube.name = 'capillary-tube';
    this.capillaryTube.userData = { componentId: 'capillary-tube' };
    this.scene.add(this.capillaryTube);

    // Liquid column inside tube
    const colGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.0, 24);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 });
    this.waterColumnMesh = new THREE.Mesh(colGeo, colMat);
    this.waterColumnMesh.position.y = 0.0;
    this.scene.add(this.waterColumnMesh);

    this.parameters.liquidType = 'water';
    this.parameters.capillaryRadiusMm = 0.5;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-capillary-ascent',
        index: 0,
        title: 'Stage 1: Jurin’s Law & Meniscus Equilibrium',
        shortDescription: 'Upward surface tension force balances hydrostatic weight of the liquid column.',
        detailedExplanation:
          'Surface tension acts along the circular perimeter 2πr with contact angle θ. ' +
          'Vertical upward force 2πr·T·cosθ balances the downward weight πr²h·ρ·g, giving Jurin’s Law: h = 2T·cosθ / (ρ·g·r).',
        physicsFormulas: ['h = (2 · T · cosθ) / (ρ · g · r)'],
        keyTerminology: [
          { term: 'Surface Tension (T)', definition: 'Contractile tangential force per unit length acting along a liquid interface (N/m).' },
          { term: 'Contact Angle (θ)', definition: 'Angle between liquid-gas interface and solid wall inside the liquid.' },
        ],
        highlightComponentIds: ['capillary-tube'],
        recommendedCamera: { position: [0, 0.5, 4.0], target: [0, 0.2, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('capillary-tube', {
      id: 'capillary-tube',
      name: 'Precision Borosilicate Capillary Tube',
      scientificRole: 'Narrow cylindrical tube providing high surface-area-to-volume ratio for capillary pressure',
      materialsAndSpecs: 'Calibrated bore radius r = 0.2–2.0 mm',
      physicalPrinciples: 'Laplace capillary pressure ΔP = 2T/R_meniscus balanced against hydrostatic pressure ρgh.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const liquid = String(this.parameters.liquidType || 'water');
    const rMm = Number(this.parameters.capillaryRadiusMm || 0.5);
    const rM = (rMm / 1000);
    const g = 9.80665;

    let T = 0.0728; // N/m
    let rho = 1000; // kg/m³
    let thetaDeg = 0;
    let liquidColor = 0x0284c7;

    switch (liquid) {
      case 'water': T = 0.0728; rho = 1000; thetaDeg = 0; liquidColor = 0x0284c7; break;
      case 'ethanol': T = 0.0223; rho = 789; thetaDeg = 0; liquidColor = 0x38bdf8; break;
      case 'mercury': T = 0.4865; rho = 13600; thetaDeg = 140; liquidColor = 0x94a3b8; break;
      case 'glycerol': T = 0.0634; rho = 1260; thetaDeg = 20; liquidColor = 0x10b981; break;
    }

    const thetaRad = (thetaDeg * Math.PI) / 180;
    const hM = (2 * T * Math.cos(thetaRad)) / (rho * g * rM);
    const hMm = hM * 1000;

    if (this.waterColumnMesh) {
      const visualH = Math.max(0.1, Math.min(Math.abs(hMm) * 0.08, 2.5));
      this.waterColumnMesh.scale.y = visualH;
      this.waterColumnMesh.position.y = (hMm >= 0 ? visualH / 2 : -visualH / 2) - 0.4;
      (this.waterColumnMesh.material as THREE.MeshStandardMaterial).color.setHex(liquidColor);
    }

    this.metrics['capillaryHeightMm'] = Number(hMm.toFixed(2));
    this.metrics['surfaceTension'] = `${T} N/m`;
    this.metrics['contactAngle'] = `${thetaDeg}°`;
    this.metrics['density'] = `${rho} kg/m³`;
  }
}

// =========================================================================
// Simulation 09: 3D Poiseuille Flow & Viscosity Experiment
// =========================================================================
export class PoiseuilleViscosityScene extends BaseSimulation {
  private tubeMesh!: THREE.Mesh;
  private flowParticlesGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'liquid',
        label: 'Working Fluid',
        description: 'Fluid dynamic viscosity coefficient (η)',
        type: 'select',
        options: [
          { label: 'Water (η = 1.00 mPa·s at 20°C)', value: 'water' },
          { label: 'Castor Oil (η = 985 mPa·s)', value: 'castor' },
          { label: 'Glycerine (η = 1410 mPa·s)', value: 'glycerine' },
          { label: 'Motor Oil SAE 30 (η = 200 mPa·s)', value: 'motor-oil' },
        ],
        defaultValue: 'water',
      },
      {
        key: 'pressureDiffKPa',
        label: 'Pressure Drop (ΔP)',
        description: 'Hydrostatic pressure head difference driving laminar flow',
        type: 'number',
        min: 1,
        max: 50,
        step: 1,
        unit: 'kPa',
        defaultValue: 10,
      },
      {
        key: 'capillaryRadiusMm',
        label: 'Tube Bore Radius (R)',
        description: 'Internal radius of narrow capillary tube (critical R⁴ dependence)',
        type: 'number',
        min: 0.5,
        max: 2.5,
        step: 0.1,
        unit: 'mm',
        defaultValue: 1.0,
      },
    ];
  }

  protected initScene(): void {
    // Transparent horizontal tube
    const tubeGeo = new THREE.CylinderGeometry(0.5, 0.5, 5.0, 32);
    tubeGeo.rotateZ(Math.PI / 2);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.1 });
    this.tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.tubeMesh.name = 'poiseuille-tube';
    this.tubeMesh.userData = { componentId: 'poiseuille-tube' };
    this.scene.add(this.tubeMesh);

    // Parabolic velocity profile indicators
    this.flowParticlesGroup = new THREE.Group();
    for (let r = -0.4; r <= 0.4; r += 0.08) {
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-2.2, r, 0), 1.0, 0x10b981);
      this.flowParticlesGroup.add(arrow);
    }
    this.scene.add(this.flowParticlesGroup);

    this.parameters.liquid = 'water';
    this.parameters.pressureDiffKPa = 10;
    this.parameters.capillaryRadiusMm = 1.0;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-hagan-poiseuille',
        index: 0,
        title: 'Stage 1: Hagen–Poiseuille Parabolic Laminar Velocity Profile',
        shortDescription: 'Laminar flow through circular tubes with non-slip boundary condition at walls.',
        detailedExplanation:
          'Fluid velocity follows a parabolic profile v(r) = (ΔP / 4ηL)(R² - r²). ' +
          'Integrating across cross-section gives the Hagen–Poiseuille volumetric discharge equation Q = (π · ΔP · R⁴) / (8 · η · L).',
        physicsFormulas: ['Q = (π · ΔP · R⁴) / (8 · η · L)', 'v(r) = (ΔP / 4ηL) · (R² - r²)'],
        keyTerminology: [
          { term: 'Viscosity (η)', definition: 'Measure of fluid resistance to gradual shear deformation (Pa·s).' },
          { term: 'R⁴ Sensitivity', definition: 'Doubling tube radius increases volumetric flow rate by 2⁴ = 16 times.' },
        ],
        highlightComponentIds: ['poiseuille-tube'],
        recommendedCamera: { position: [0, 1.2, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('poiseuille-tube', {
      id: 'poiseuille-tube',
      name: 'Precision Glass Capillary Viscometer',
      scientificRole: 'Horizontal calibrated capillary tube under constant hydrostatic pressure drop',
      materialsAndSpecs: 'Length L = 0.5 m, Radius R = 0.5–2.5 mm',
      physicalPrinciples: 'Newtonian laminar shear stress τ = η (dv/dr) with zero-slip velocity at boundaries.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const liquid = String(this.parameters.liquid || 'water');
    const dPKPa = Number(this.parameters.pressureDiffKPa || 10);
    const rMm = Number(this.parameters.capillaryRadiusMm || 1.0);

    const deltaP = dPKPa * 1000; // Pa
    const R = (rMm / 1000); // m
    const L = 0.5; // m

    let eta = 1.00e-3; // Pa·s (water)
    if (liquid === 'castor') eta = 0.985;
    else if (liquid === 'glycerine') eta = 1.410;
    else if (liquid === 'motor-oil') eta = 0.200;

    // Volumetric flow rate Q in m³/s
    const Q = (Math.PI * deltaP * Math.pow(R, 4)) / (8 * eta * L);
    const QLitrePerMin = Q * 1000 * 60;
    const vMax = (deltaP * Math.pow(R, 2)) / (4 * eta * L);

    // Update arrows length according to parabolic profile
    this.flowParticlesGroup.children.forEach((obj, idx) => {
      const arrow = obj as THREE.ArrowHelper;
      const rPos = -0.4 + idx * 0.08;
      const rNorm = Math.abs(rPos / 0.4);
      const vFrac = Math.max(0.05, 1.0 - rNorm * rNorm);
      arrow.setLength(vFrac * 1.5, 0.2, 0.1);
    });

    this.metrics['flowRateLitreMin'] = Number(QLitrePerMin.toFixed(3));
    this.metrics['vMaxMPerS'] = Number(vMax.toFixed(2));
    this.metrics['viscosityCoefficient'] = `${eta} Pa·s`;
    this.metrics['reynoldsNumber'] = Number(((1000 * vMax * (2 * R)) / eta).toFixed(0));
  }
}

// =========================================================================
// Simulation 10: 3D Thermal Systems (Solar Heater, Microwave, Exchanger, Radiator, Tower)
// =========================================================================
export class ThermalSystemsScene extends BaseSimulation {
  private stationsGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'activeStation',
        label: 'Thermal Engineering System',
        description: 'Select industrial thermal engineering plant station',
        type: 'select',
        options: [
          { label: 'Solar Water Heater (Glazed Collector & Storage Tank)', value: 'solar' },
          { label: 'Microwave Oven Cavity (Electromagnetic RF Heating)', value: 'microwave' },
          { label: 'Shell & Tube Heat Exchanger (Counter-flow Heat Balance)', value: 'exchanger' },
          { label: 'Fin-Tube Automotive Radiator (Convective Air Cooling)', value: 'radiator' },
          { label: 'Evaporative Cooling Tower (Counterflow Air/Water Drift)', value: 'tower' },
        ],
        defaultValue: 'solar',
      },
      {
        key: 'systemPowerLevel',
        label: 'Energy Input Level',
        description: 'Solar irradiance (W/m²), microwave power (W), or thermal duty (kW)',
        type: 'number',
        min: 200,
        max: 1200,
        step: 50,
        unit: 'W or W/m²',
        defaultValue: 800,
      },
    ];
  }

  protected initScene(): void {
    this.stationsGroup = new THREE.Group();

    // 1. Solar Collector Model
    const solarBox = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 2.2), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 }));
    solarBox.rotation.x = -0.35;
    solarBox.name = 'station-solar';
    solarBox.userData = { componentId: 'thermal-system' };

    // Glass cover
    const glassCover = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.05, 2.1), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 }));
    glassCover.position.y = 0.18;
    solarBox.add(glassCover);

    this.stationsGroup.add(solarBox);
    this.scene.add(this.stationsGroup);

    this.parameters.activeStation = 'solar';
    this.parameters.systemPowerLevel = 800;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-energy-balance',
        index: 0,
        title: 'Stage 1: First Law Thermal System Energy Balances',
        shortDescription: 'Analyze energy conservation: Q_in = Q_useful + Q_losses.',
        detailedExplanation:
          'Every practical engineering system demonstrates heat transfer laws: solar collectors utilize greenhouse trapping of solar radiation, ' +
          'microwave cavities utilize dipolar water molecule relaxation at 2.45 GHz, and heat exchangers balance enthalpy changes: m_h · c_p · ΔT_h = m_c · c_p · ΔT_c.',
        highlightComponentIds: ['thermal-system'],
        recommendedCamera: { position: [0, 2.5, 6.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('thermal-system', {
      id: 'thermal-system',
      name: 'Engineered Thermal Energy Conversion System',
      scientificRole: 'First Law thermodynamic control volume exchanging sensible and latent thermal energy',
      materialsAndSpecs: 'Solar Collector area A = 2.0 m², Optical Efficiency η₀ = 0.78, Heat Loss Coefficient U_L = 4.5 W/m²·K',
      physicalPrinciples: 'Hottel–Whillier–Bliss thermal efficiency equation: η = η₀ - U_L (T_in - T_amb) / I.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const station = String(this.parameters.activeStation || 'solar');
    const power = Number(this.parameters.systemPowerLevel || 800);

    if (station === 'solar') {
      const irradiance = power; // W/m²
      const A = 2.0; // m²
      const qUseful = A * (0.75 * irradiance - 4.5 * (60 - 25));
      const efficiency = (qUseful / (A * irradiance)) * 100;
      this.metrics['usefulHeatGain'] = `${Math.max(0, qUseful).toFixed(1)} W`;
      this.metrics['thermalEfficiency'] = `${Math.max(0, efficiency).toFixed(1)} %`;
      this.metrics['waterOutletTemp'] = `${(25 + qUseful / (0.02 * 4184)).toFixed(1)} °C`;
    } else if (station === 'microwave') {
      this.metrics['microwavePower'] = `${power} W`;
      this.metrics['rfFrequency'] = '2.45 GHz (ISM Band)';
      this.metrics['dielectricLossHeatRate'] = `${(power * 0.88).toFixed(1)} W`;
    } else {
      this.metrics['thermalDuty'] = `${(power / 10).toFixed(1)} kW`;
      this.metrics['lmtd'] = '24.6 °C';
      this.metrics['effectiveness'] = '78.5 %';
    }
  }
}
