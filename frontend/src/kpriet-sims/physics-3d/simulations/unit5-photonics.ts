/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * Unit V: Photonics
 * Simulations 21 to 25
 */

import * as THREE from 'three';
import { BaseSimulation } from '../core/BaseSimulation';
import type { SimulationOptions, ParameterDefinition } from '../core/types';

// =========================================================================
// Simulation 21: 3D Interaction of Radiation with Matter
// =========================================================================
export class RadiationMatterScene extends BaseSimulation {
  private atomGroundMesh!: THREE.Mesh;
  private atomExcitedMesh!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'interactionProcess',
        label: 'Quantum Interaction Mode',
        description: 'The three fundamental Einstein radiation-matter interactions',
        type: 'select',
        options: [
          { label: 'Stimulated Emission (Photon triggers coherent twin: B₂₁ ρ N₂)', value: 'stimulated' },
          { label: 'Spontaneous Emission (Natural decay emitting random photon: A₂₁ N₂)', value: 'spontaneous' },
          { label: 'Induced Absorption (Incoming photon excites electron: B₁₂ ρ N₁)', value: 'absorption' },
        ],
        defaultValue: 'stimulated',
      },
      {
        key: 'photonWavelengthNm',
        label: 'Transition Photon Wavelength (λ)',
        description: 'Wavelength corresponding to energy separation: ΔE = h·c / λ',
        type: 'number',
        min: 400,
        max: 800,
        step: 10,
        unit: 'nm',
        defaultValue: 632.8,
      },
    ];
  }

  protected initScene(): void {
    // Energy Level Shelves (E1 Ground, E2 Excited)
    const shelfGeo = new THREE.BoxGeometry(4.0, 0.08, 1.5);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });

    const e1Shelf = new THREE.Mesh(shelfGeo, shelfMat);
    e1Shelf.position.y = -1.2;
    const e2Shelf = new THREE.Mesh(shelfGeo, shelfMat);
    e2Shelf.position.y = 1.2;

    this.scene.add(e1Shelf, e2Shelf);

    // Electron in ground state
    const electronGeo = new THREE.SphereGeometry(0.2, 24, 24);
    const eMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 });
    this.atomGroundMesh = new THREE.Mesh(electronGeo, eMat);
    this.atomGroundMesh.position.set(-1.0, -1.0, 0);

    // Electron in excited state
    this.atomExcitedMesh = new THREE.Mesh(electronGeo.clone(), eMat.clone());
    this.atomExcitedMesh.position.set(1.0, 1.4, 0);

    this.atomExcitedMesh.name = 'quantum-states';
    this.atomExcitedMesh.userData = { componentId: 'quantum-states' };

    this.scene.add(this.atomGroundMesh, this.atomExcitedMesh);

    this.parameters.interactionProcess = 'stimulated';
    this.parameters.photonWavelengthNm = 632.8;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-einstein-coefficients',
        index: 0,
        title: 'Stage 1: Einstein’s Relations & Coherent Emission',
        shortDescription: 'In stimulated emission, the emitted photon is identical in frequency, phase, and direction.',
        detailedExplanation:
          'Einstein showed that thermodynamic equilibrium in a blackbody radiation field requires: B₁₂ = B₂₁ (absorption and stimulated emission probabilities are equal) ' +
          'and A₂₁ / B₂₁ = (8π h ν³) / c³. ' +
          'Stimulated emission produces light that has identical energy (hν), polarization, phase, and direction of propagation as the incident photon—the foundation of laser amplification.',
        physicsFormulas: ['ΔE = E₂ - E₁ = h · c / λ', 'Rate_stim = B₂₁ · ρ(ν) · N₂', 'B₁₂ = B₂₁ (Einstein Relation)'],
        highlightComponentIds: ['quantum-states'],
        recommendedCamera: { position: [0, 1.0, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('quantum-states', {
      id: 'quantum-states',
      name: 'Two-Level Atomic Quantum System',
      scientificRole: 'Quantized energy states E₁ and E₂ demonstrating Einstein’s radiative transitions',
      materialsAndSpecs: 'He-Ne laser transition: λ = 632.8 nm (Red), ΔE = 1.96 eV',
      physicalPrinciples: 'Bohr frequency condition hν = E₂ - E₁ with stimulated coherence.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const proc = String(this.parameters.interactionProcess || 'stimulated');
    const lambdaNm = Number(this.parameters.photonWavelengthNm || 632.8);

    // Energy ΔE in eV: ΔE = 1239.84 / λ(nm)
    const deltaEEv = 1239.84 / lambdaNm;
    const freqHz = (2.99792458e8 / (lambdaNm * 1e-9));

    this.metrics['transitionEnergyEV'] = `${deltaEEv.toFixed(3)} eV`;
    this.metrics['opticalFrequency'] = `${(freqHz / 1e12).toFixed(2)} THz`;
    this.metrics['processCoherence'] = proc === 'stimulated' ? 'PERFECT COHERENCE (Same Phase, Polarization, Direction)' : 'INCOHERENT / RANDOM';
    this.metrics['laserGainContribution'] = proc === 'stimulated' ? '+1 Amplified Photon (Gain)' : proc === 'absorption' ? '-1 Photon (Loss)' : 'Spontaneous Noise';
  }
}

// =========================================================================
// Simulation 22: 3D Laser Principles (Population Inversion & Cavity)
// =========================================================================
export class LaserPrinciplesScene extends BaseSimulation {
  private laserCavityMesh!: THREE.Mesh;
  private laserBeamMesh!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'pumpRate',
        label: 'Optical/Electrical Pumping Level (W_p)',
        description: 'Excitation rate transferring atoms from ground state into upper laser level',
        type: 'number',
        min: 10,
        max: 100,
        step: 5,
        unit: '%',
        defaultValue: 65,
      },
      {
        key: 'outputCouplerReflectivity',
        label: 'Output Mirror Reflectivity (R₂)',
        description: 'Reflectance of partially transmitting output mirror',
        type: 'number',
        min: 80,
        max: 99,
        step: 1,
        unit: '%',
        defaultValue: 95,
      },
    ];
  }

  protected initScene(): void {
    // 1. Resonator Mirrors
    const mirrorGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    mirrorGeo.rotateZ(Math.PI / 2);

    // High reflector (R1 = 100%)
    const r1 = new THREE.Mesh(mirrorGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 }));
    r1.position.x = -2.6;

    // Output coupler (R2 = 95%)
    const r2 = new THREE.Mesh(mirrorGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, transparent: true, opacity: 0.7 }));
    r2.position.x = 2.6;

    this.scene.add(r1, r2);

    // 2. Laser Active Medium Cylinder
    const mediumGeo = new THREE.CylinderGeometry(0.4, 0.4, 4.8, 32);
    mediumGeo.rotateZ(Math.PI / 2);
    const mediumMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    });
    this.laserCavityMesh = new THREE.Mesh(mediumGeo, mediumMat);
    this.laserCavityMesh.name = 'active-medium';
    this.laserCavityMesh.userData = { componentId: 'active-medium' };
    this.scene.add(this.laserCavityMesh);

    // 3. Output Laser Beam
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.0, 16);
    beamGeo.rotateZ(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    this.laserBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.laserBeamMesh.position.x = 4.2;
    this.scene.add(this.laserBeamMesh);

    this.parameters.pumpRate = 65;
    this.parameters.outputCouplerReflectivity = 95;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-population-inversion-threshold',
        index: 0,
        title: 'Stage 1: Population Inversion & Laser Threshold Condition',
        shortDescription: 'Lasing requires N₂ > N₁ (population inversion) and round-trip gain G · R₁ · R₂ ≥ 1.',
        detailedExplanation:
          'Under Boltzmann thermal equilibrium, lower states always hold more atoms than higher states: N₂ / N₁ = e^(-ΔE / kT) < 1. ' +
          'Through external pumping into a broad pump band followed by fast non-radiative decay into a long-lived metastable state, ' +
          'population inversion (N₂ > N₁) is achieved, producing net optical gain.',
        physicsFormulas: [
          'Population Inversion: N₂ > (g₂ / g₁) · N₁',
          'Round-trip Condition: e^(2γL) · R₁ · R₂ = 1',
          'Threshold Gain: γ_th = (1 / 2L) · ln[1 / (R₁ · R₂)]',
        ],
        highlightComponentIds: ['active-medium'],
        recommendedCamera: { position: [0, 1.5, 6.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('active-medium', {
      id: 'active-medium',
      name: 'Laser Gain Medium & Optical Cavity Resonator',
      scientificRole: 'Hosts metastable energy state providing stimulated emission amplification',
      materialsAndSpecs: 'Ruby (Cr³⁺:Al₂O₃) or Nd:YAG or He-Ne gas tube, Cavity length L = 0.3 m',
      physicalPrinciples: 'Fabry–Pérot longitudinal cavity modes: L = m · (λ / 2).',
    });
  }

  protected updatePhysics(_delta: number): void {
    const pump = Number(this.parameters.pumpRate || 65);
    const R2Pct = Number(this.parameters.outputCouplerReflectivity || 95);
    const R1 = 0.999;
    const R2 = R2Pct / 100;
    const L = 0.3; // 30 cm

    // Threshold gain: gamma_th = (1 / 2L) * ln(1 / (R1 * R2))
    const gammaTh = (1 / (2 * L)) * Math.log(1 / (R1 * R2));

    // Simulated available gain proportional to pump level
    const availableGain = (pump / 100) * 8.5; // m^-1
    const isLasing = availableGain >= gammaTh;

    if (this.laserBeamMesh) {
      this.laserBeamMesh.visible = isLasing;
    }

    this.metrics['populationInversion'] = isLasing ? 'ACHIEVED (N₂ > N₁)' : 'SUB-THRESHOLD (N₂ ≤ N₁)';
    this.metrics['thresholdGainGamma'] = `${gammaTh.toFixed(2)} m⁻¹`;
    this.metrics['actualGainGamma'] = `${availableGain.toFixed(2)} m⁻¹`;
    this.metrics['lasingState'] = isLasing ? 'ACTIVE LASING BEAM' : 'Spontaneous Fluorescence Only';
  }
}

// =========================================================================
// Simulation 23: 3D CO₂ Laser & Semiconductor Diode Laser Systems
// =========================================================================
export class CO2DiodeLaserScene extends BaseSimulation {
  private co2Group!: THREE.Group;
  private diodeGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'laserType',
        label: 'Laser System Architecture',
        description: 'Continuous Wave High-Power CO₂ Gas Laser vs Miniature Semiconductor Injection Laser Diode',
        type: 'select',
        options: [
          { label: 'CO₂ Molecular Gas Laser (λ = 10.6 µm Far-IR, Industrial Cutting)', value: 'co2' },
          { label: 'GaAs/AlGaAs Semiconductor Diode Laser (λ = 850 nm Near-IR, Optical Comms)', value: 'diode' },
        ],
        defaultValue: 'co2',
      },
      {
        key: 'drivePower',
        label: 'Drive Input (Discharge Current / Diode Current)',
        description: 'Input electrical excitation',
        type: 'number',
        min: 20,
        max: 100,
        step: 5,
        unit: 'mA or %',
        defaultValue: 60,
      },
    ];
  }

  protected initScene(): void {
    this.co2Group = new THREE.Group();
    this.diodeGroup = new THREE.Group();

    // 1. Industrial CO2 Gas Laser Tube
    const tubeGeo = new THREE.CylinderGeometry(0.5, 0.5, 5.0, 32);
    tubeGeo.rotateZ(Math.PI / 2);
    const co2Mat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.5, roughness: 0.1 });
    const tube = new THREE.Mesh(tubeGeo, co2Mat);

    // Water Cooling Jacket
    const jacketGeo = new THREE.CylinderGeometry(0.75, 0.75, 4.2, 32);
    jacketGeo.rotateZ(Math.PI / 2);
    const jacket = new THREE.Mesh(jacketGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 }));

    this.co2Group.add(tube, jacket);
    this.co2Group.name = 'co2-laser-system';
    this.co2Group.userData = { componentId: 'laser-system' };

    // 2. Semiconductor Diode Laser (Miniature TO-can package with optical facet)
    const canGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32);
    const canMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const toCan = new THREE.Mesh(canGeo, canMat);
    toCan.position.y = 0.6;

    this.diodeGroup.add(toCan);
    this.diodeGroup.name = 'diode-laser-system';
    this.diodeGroup.userData = { componentId: 'laser-system' };
    this.diodeGroup.visible = false;

    this.scene.add(this.co2Group, this.diodeGroup);

    this.parameters.laserType = 'co2';
    this.parameters.drivePower = 60;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-gas-vs-diode-lasers',
        index: 0,
        title: 'Stage 1: Molecular Vibration vs Direct-Bandgap Heterojunction Lasing',
        shortDescription: 'Compare CO₂ vibrational-rotational infrared lasing with semiconductor injection lasing.',
        detailedExplanation:
          'CO₂ Laser: A 4-level molecular gas laser using a mixture of CO₂, N₂, and He (1:2:3). ' +
          'Electric discharge excites N₂ vibrational levels (v=1), which resonantly transfer energy via collisions to the (00°1) asymmetric stretch level of CO₂. ' +
          'Laser transition occurs from (00°1) to (10°0) emitting far-infrared radiation at 10.6 µm. ' +
          'Semiconductor Laser: Heavily doped direct-bandgap P-N heterojunction under high forward injection where stimulated recombination between degenerate states emits coherent photons.',
        physicsFormulas: [
          'CO₂ Transition: (00°1) ⟶ (10°0), λ = 10.6 µm',
          'Diode Lasing: hν ≈ E_g, λ = h·c / E_g',
        ],
        highlightComponentIds: ['laser-system'],
        recommendedCamera: { position: [0, 1.8, 5.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('laser-system', {
      id: 'laser-system',
      name: 'Engineered Laser Source Assembly',
      scientificRole: 'State-of-the-art optical radiation generator with active gain medium',
      materialsAndSpecs: 'CO₂ Gas Mixture: CO₂ : N₂ : He = 1 : 2 : 3 | Diode: GaAs/AlGaAs double heterostructure',
      physicalPrinciples: 'Resonant collisional energy transfer (CO₂) vs stimulated electron-hole band recombination (Diode).',
    });
  }

  protected updatePhysics(_delta: number): void {
    const type = String(this.parameters.laserType || 'co2');
    const drive = Number(this.parameters.drivePower || 60);

    if (type === 'co2') {
      this.co2Group.visible = true;
      this.diodeGroup.visible = false;
      this.metrics['emissionWavelength'] = '10.6 µm (Far-Infrared)';
      this.metrics['activeTransition'] = 'CO₂ Asymmetric Stretch (00°1) ⟶ Symmetric (10°0)';
      this.metrics['opticalPowerOutput'] = `${(drive * 12.5).toFixed(0)} W (High Power Industrial CW)`;
      this.metrics['overallEfficiency'] = '15–20 %';
    } else {
      this.co2Group.visible = false;
      this.diodeGroup.visible = true;
      this.metrics['emissionWavelength'] = '850 nm (Near-Infrared)';
      this.metrics['activeTransition'] = 'Direct Bandgap Conduction-to-Valence Recombination';
      this.metrics['opticalPowerOutput'] = `${(drive * 0.8).toFixed(1)} mW (Optical Telecommunications)`;
      this.metrics['overallEfficiency'] = '45–55 %';
    }
  }
}

// =========================================================================
// Simulation 24: 3D Total Internal Reflection & Optical Fibre Propagation
// =========================================================================
export class TotalInternalReflectionScene extends BaseSimulation {
  private fiberCoreMesh!: THREE.Mesh;
  private fiberCladdingMesh!: THREE.Mesh;
  private rayPathGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'coreIndexN1',
        label: 'Core Refractive Index (n₁)',
        description: 'Higher refractive index of central light-guiding glass core',
        type: 'number',
        min: 1.45,
        max: 1.65,
        step: 0.01,
        unit: 'index',
        defaultValue: 1.50,
      },
      {
        key: 'claddingIndexN2',
        label: 'Cladding Refractive Index (n₂)',
        description: 'Lower refractive index of surrounding outer glass cladding (must be n₂ < n₁)',
        type: 'number',
        min: 1.40,
        max: 1.55,
        step: 0.01,
        unit: 'index',
        defaultValue: 1.45,
      },
      {
        key: 'launchAngleDeg',
        label: 'Ray Launch Angle at Air Interface (θ_0)',
        description: 'Angle of incident light ray entering the fiber face from air',
        type: 'number',
        min: 0,
        max: 45,
        step: 1,
        unit: '°',
        defaultValue: 15,
      },
    ];
  }

  protected initScene(): void {
    // 1. Outer Glass Cladding (Transparent cylinder)
    const cladGeo = new THREE.CylinderGeometry(1.2, 1.2, 6.0, 32);
    cladGeo.rotateZ(Math.PI / 2);
    const cladMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
    });
    this.fiberCladdingMesh = new THREE.Mesh(cladGeo, cladMat);
    this.scene.add(this.fiberCladdingMesh);

    // 2. High-Index Glass Core (Central cylinder)
    const coreGeo = new THREE.CylinderGeometry(0.65, 0.65, 6.0, 32);
    coreGeo.rotateZ(Math.PI / 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      transparent: true,
      opacity: 0.5,
      roughness: 0.05,
    });
    this.fiberCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.fiberCoreMesh.name = 'optical-fiber';
    this.fiberCoreMesh.userData = { componentId: 'optical-fiber' };
    this.scene.add(this.fiberCoreMesh);

    // 3. Propagating Light Ray Line
    this.rayPathGroup = new THREE.Group();
    const points = [
      new THREE.Vector3(-4.0, -0.4, 0),
      new THREE.Vector3(-3.0, 0, 0),
      new THREE.Vector3(-1.5, 0.55, 0),
      new THREE.Vector3(0.0, -0.55, 0),
      new THREE.Vector3(1.5, 0.55, 0),
      new THREE.Vector3(3.0, -0.55, 0),
      new THREE.Vector3(4.0, 0.2, 0),
    ];
    const rayGeo = new THREE.BufferGeometry().setFromPoints(points);
    const rayMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 3 });
    const rayLine = new THREE.Line(rayGeo, rayMat);
    this.rayPathGroup.add(rayLine);
    this.scene.add(this.rayPathGroup);

    this.parameters.coreIndexN1 = 1.50;
    this.parameters.claddingIndexN2 = 1.45;
    this.parameters.launchAngleDeg = 15;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-tir-acceptance-cone',
        index: 0,
        title: 'Stage 1: Snell’s Law, Critical Angle & Numerical Aperture',
        shortDescription: 'Light rays launched within the acceptance cone undergo repeated Total Internal Reflection.',
        detailedExplanation:
          'When light in core (n₁) hits cladding (n₂ < n₁) at angle θ_i exceeding the critical angle θ_c = arcsin(n₂ / n₁), ' +
          '100% of light energy reflects back with zero refraction loss. ' +
          'The maximum entrance angle in air is the Acceptance Angle θ_a: sin(θ_a) = NA = √(n₁² - n₂²).',
        physicsFormulas: [
          'Critical Angle: θ_c = arcsin(n₂ / n₁)',
          'Numerical Aperture: NA = √(n₁² - n₂²)',
          'Acceptance Angle: θ_max = arcsin(NA)',
          'Fractional Index Change: Δ = (n₁ - n₂) / n₁',
        ],
        highlightComponentIds: ['optical-fiber'],
        recommendedCamera: { position: [0, 1.8, 6.2], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('optical-fiber', {
      id: 'optical-fiber',
      name: 'Step-Index Multimode Optical Fiber Waveguide',
      scientificRole: 'Dielectric waveguide transmitting optical data signals via Total Internal Reflection',
      materialsAndSpecs: 'Fused silica: Core n₁ = 1.45–1.65, Cladding n₂ = 1.40–1.55 (n₁ > n₂ required)',
      physicalPrinciples: 'Maxwell’s boundary conditions for electromagnetic waves at dielectric interface.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const n1 = Math.max(1.41, Number(this.parameters.coreIndexN1 || 1.50));
    const n2 = Math.min(n1 - 0.005, Number(this.parameters.claddingIndexN2 || 1.45));
    const theta0Deg = Number(this.parameters.launchAngleDeg || 15);

    // Critical Angle θ_c at core-cladding boundary
    const criticalAngleDeg = (Math.asin(n2 / n1) * 180) / Math.PI;

    // Numerical Aperture NA = sqrt(n1^2 - n2^2)
    const NA = Math.sqrt(Math.max(0, Math.pow(n1, 2) - Math.pow(n2, 2)));
    const acceptanceAngleDeg = (Math.asin(Math.min(1.0, NA)) * 180) / Math.PI;

    const isGuided = theta0Deg <= acceptanceAngleDeg;

    this.metrics['criticalAngleThetaC'] = `${criticalAngleDeg.toFixed(2)}°`;
    this.metrics['numericalAperture'] = Number(NA.toFixed(3));
    this.metrics['acceptanceAngleThetaA'] = `${acceptanceAngleDeg.toFixed(2)}°`;
    this.metrics['propagationMode'] = isGuided ? 'GUIDED RAY (Total Internal Reflection Active)' : 'REFRACTED LEAKY MODE (Ray Escapes Cladding)';
  }
}

// =========================================================================
// Simulation 25: 3D Fibre-Optic Endoscopy & Optical Sensors
// =========================================================================
export class FibreEndoscopySensorsScene extends BaseSimulation {
  private endoscopeGroup!: THREE.Group;
  private sensorGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'deviceMode',
        label: 'Fiber Photonics Application',
        description: 'Endoscopic imaging bundle vs microbend fiber intensity sensor',
        type: 'select',
        options: [
          { label: 'Medical & Industrial Endoscopy (Illumination + Coherent Imaging)', value: 'endoscopy' },
          { label: 'Fiber-Optic Microbend Sensor (Pressure / Displacement Sensing)', value: 'sensor' },
        ],
        defaultValue: 'endoscopy',
      },
      {
        key: 'sensorDisplacementUm',
        label: 'Applied Measurand (Displacement / Pressure)',
        description: 'Mechanical displacement causing microbend scattering losses',
        type: 'number',
        min: 0,
        max: 500,
        step: 25,
        unit: 'µm',
        defaultValue: 150,
      },
    ];
  }

  protected initScene(): void {
    this.endoscopeGroup = new THREE.Group();
    this.sensorGroup = new THREE.Group();

    // 1. Flexible Endoscope Tube
    const endoCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.0, 0, 0),
      new THREE.Vector3(-1.0, 0.5, 0),
      new THREE.Vector3(1.0, -0.4, 0),
      new THREE.Vector3(2.5, 0.2, 0),
    ]);
    const endoGeo = new THREE.TubeGeometry(endoCurve, 32, 0.35, 16, false);
    const endoMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.3 });
    const endoTube = new THREE.Mesh(endoGeo, endoMat);

    // Tip camera lens head
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 24), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 }));
    head.position.set(2.5, 0.2, 0);
    this.endoscopeGroup.add(endoTube, head);
    this.endoscopeGroup.name = 'endoscope-system';
    this.endoscopeGroup.userData = { componentId: 'photonics-application' };

    // 2. Microbend Sensor Corrugated Deformer
    const deformerTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 1.0), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    deformerTop.position.set(0, 0.6, 0);
    const deformerBot = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 1.0), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    deformerBot.position.set(0, -0.6, 0);

    // Optical fiber passing through deformer
    const fiberMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5.0, 16), new THREE.MeshStandardMaterial({ color: 0x059669 }));
    fiberMesh.rotateZ(Math.PI / 2);

    this.sensorGroup.add(deformerTop, deformerBot, fiberMesh);
    this.sensorGroup.name = 'sensor-system';
    this.sensorGroup.userData = { componentId: 'photonics-application' };
    this.sensorGroup.visible = false;

    this.scene.add(this.endoscopeGroup, this.sensorGroup);

    this.parameters.deviceMode = 'endoscopy';
    this.parameters.sensorDisplacementUm = 150;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-fiber-applications',
        index: 0,
        title: 'Stage 1: Coherent Imaging Bundles vs Fiber Sensing Transduction',
        shortDescription: 'Trace illumination and returned images in endoscopes and intensity modulation in sensors.',
        detailedExplanation:
          'Endoscopy uses two separate fiber bundles: an incoherent bundle (randomized fibers) to carry intense illumination light to the cavity, ' +
          'and a coherent bundle (spatially mapped 1-to-1 fibers) that transmits the reflected image intact to the ocular eyepiece or camera sensor. ' +
          'Fiber sensors modulate light properties (intensity, phase, wavelength, polarization) in response to external environmental parameters (pressure, strain, temperature).',
        highlightComponentIds: ['photonics-application'],
        recommendedCamera: { position: [0, 1.5, 5.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('photonics-application', {
      id: 'photonics-application',
      name: 'Advanced Fiber Optic Transduction System',
      scientificRole: 'Medical diagnostic endoscopy and intrinsic/extrinsic fiber-optic physical sensors',
      materialsAndSpecs: 'Coherent fiber array (50,000 pixels, 10 µm core pitch) | Microbend displacement sensor',
      physicalPrinciples: 'Spatial image transmission through organized core arrays and radiative microbend scattering loss.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const mode = String(this.parameters.deviceMode || 'endoscopy');
    const dispUm = Number(this.parameters.sensorDisplacementUm || 150);

    if (mode === 'endoscopy') {
      this.endoscopeGroup.visible = true;
      this.sensorGroup.visible = false;
      this.metrics['illuminationPath'] = 'Incoherent Non-aligned Optical Fiber Bundle';
      this.metrics['imagingPath'] = 'Coherent 1-to-1 Spatially Mapped Fiber Array';
      this.metrics['imageResolution'] = '50,000 Pixel Fibers';
      this.metrics['lightLossRate'] = '0.2 dB/m';
    } else {
      this.endoscopeGroup.visible = false;
      this.sensorGroup.visible = true;

      // Microbend attenuation model: loss (dB) ~ k * displacement
      const lossDb = (dispUm / 500) * 8.5; // up to 8.5 dB loss
      const transmittedPowerPct = Math.pow(10, -lossDb / 10) * 100;

      this.metrics['appliedDisplacement'] = `${dispUm} µm`;
      this.metrics['inducedAttenuationLoss'] = `${lossDb.toFixed(2)} dB`;
      this.metrics['transmittedLightPower'] = `${transmittedPowerPct.toFixed(1)} %`;
      this.metrics['transductionSensitivity'] = '0.017 dB/µm';
    }
  }
}
