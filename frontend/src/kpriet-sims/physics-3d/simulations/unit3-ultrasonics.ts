/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * Unit III: Ultrasonics and Its Applications
 * Simulations 11 to 15
 */

import * as THREE from 'three';
import { BaseSimulation } from '../core/BaseSimulation';
import type { SimulationOptions, ParameterDefinition } from '../core/types';

// =========================================================================
// Simulation 11: 3D Ultrasonic Wave Explorer
// =========================================================================
export class UltrasonicWavesScene extends BaseSimulation {
  private wavePlanesGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'frequencyKHz',
        label: 'Ultrasonic Frequency (f)',
        description: 'Frequency of ultrasonic wave (above audible range: f > 20 kHz)',
        type: 'number',
        min: 20,
        max: 2000,
        step: 20,
        unit: 'kHz',
        defaultValue: 40,
      },
      {
        key: 'medium',
        label: 'Propagation Medium',
        description: 'Acoustic propagation speed and density of medium',
        type: 'select',
        options: [
          { label: 'Water (v = 1480 m/s, ρ = 1000 kg/m³)', value: 'water' },
          { label: 'Air (v = 343 m/s, ρ = 1.2 kg/m³)', value: 'air' },
          { label: 'Mild Steel (v = 5900 m/s, ρ = 7850 kg/m³)', value: 'steel' },
          { label: 'Human Soft Tissue (v = 1540 m/s, Medical Ultrasound)', value: 'tissue' },
        ],
        defaultValue: 'water',
      },
    ];
  }

  protected initScene(): void {
    this.wavePlanesGroup = new THREE.Group();
    const planeGeo = new THREE.BoxGeometry(0.04, 3.0, 3.0);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2,
    });

    for (let i = 0; i < 28; i++) {
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.position.x = -3.5 + i * 0.26;
      this.wavePlanesGroup.add(plane);
    }

    this.wavePlanesGroup.name = 'ultrasonic-field';
    this.wavePlanesGroup.userData = { componentId: 'ultrasonic-field' };
    this.scene.add(this.wavePlanesGroup);

    // Ultrasonic Transducer Horn
    const hornGeo = new THREE.CylinderGeometry(0.6, 1.2, 1.5, 32);
    hornGeo.rotateZ(Math.PI / 2);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(-4.5, 0, 0);
    this.scene.add(horn);

    this.parameters.frequencyKHz = 40;
    this.parameters.medium = 'water';
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-ultrasonic-propagation',
        index: 0,
        title: 'Stage 1: Longitudinal Compressions & Acoustic Wavelength',
        shortDescription: 'Inspect compression and rarefaction wavefronts: λ = v / f.',
        detailedExplanation:
          'Ultrasonic waves are acoustic longitudinal mechanical waves with frequencies exceeding human hearing (f > 20 kHz). ' +
          'Particles oscillate in the direction of wave propagation, generating alternating regions of high pressure (compression) and low pressure (rarefaction).',
        physicsFormulas: ['v = f · λ', 'T = 1 / f', 'Z = ρ · v (Acoustic Impedance)'],
        highlightComponentIds: ['ultrasonic-field'],
        recommendedCamera: { position: [0, 2.5, 6.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('ultrasonic-field', {
      id: 'ultrasonic-field',
      name: 'Acoustic Longitudinal Pressure Field',
      scientificRole: 'Alternating high-pressure compression planes and low-pressure rarefaction planes',
      materialsAndSpecs: 'Acoustic velocity range: v = 343–5900 m/s',
      physicalPrinciples: 'Wave equation ∂²p/∂x² = (1/v²) ∂²p/∂t² where v = √(K/ρ).',
    });
  }

  protected updatePhysics(_delta: number): void {
    const freqKHz = Number(this.parameters.frequencyKHz || 40);
    const med = String(this.parameters.medium || 'water');

    let v = 1480; // m/s
    let rho = 1000;
    if (med === 'air') { v = 343; rho = 1.2; }
    else if (med === 'steel') { v = 5900; rho = 7850; }
    else if (med === 'tissue') { v = 1540; rho = 1060; }

    const f = freqKHz * 1000;
    const lambdaM = v / f;
    const lambdaMm = lambdaM * 1000;
    const Z = rho * v; // Pa·s/m (Rayl)

    // Modulate plane positions to show longitudinal wave motion
    this.wavePlanesGroup.children.forEach((obj, idx) => {
      const plane = obj as THREE.Mesh;
      const basePos = -3.5 + idx * 0.26;
      const wavePhase = (basePos * 4.0) - (this.currentTime * 6.0);
      const disp = Math.sin(wavePhase) * 0.08;
      plane.position.x = basePos + disp;
    });

    this.metrics['soundSpeedMPerS'] = `${v} m/s`;
    this.metrics['wavelengthMm'] = Number(lambdaMm.toFixed(3));
    this.metrics['acousticImpedanceMRayl'] = Number((Z / 1e6).toFixed(3));
    this.metrics['periodMicroSec'] = Number(((1 / f) * 1e6).toFixed(3));
  }
}

// =========================================================================
// Simulation 12: 3D Piezoelectric & Magnetostriction Oscillators
// =========================================================================
export class PiezoMagnetoScene extends BaseSimulation {
  private piezoGroup!: THREE.Group;
  private magnetoGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'oscillatorType',
        label: 'Ultrasonic Generator Mechanism',
        description: 'Inverse piezoelectric effect (Quartz/PZT) vs Joule magnetostriction (Nickel rod)',
        type: 'select',
        options: [
          { label: 'Piezoelectric Oscillator (Quartz Crystal, High f > 1 MHz)', value: 'piezo' },
          { label: 'Magnetostriction Oscillator (Ferromagnetic Rod, f < 100 kHz)', value: 'magneto' },
        ],
        defaultValue: 'piezo',
      },
      {
        key: 'tuningFreqKHz',
        label: 'Applied Tank Circuit Frequency (f)',
        description: 'Electrical LC tank circuit driving frequency',
        type: 'number',
        min: 20,
        max: 500,
        step: 5,
        unit: 'kHz',
        defaultValue: 50,
      },
    ];
  }

  protected initScene(): void {
    this.piezoGroup = new THREE.Group();
    this.magnetoGroup = new THREE.Group();

    // 1. Piezoelectric Quartz Crystal Element
    const crystalGeo = new THREE.BoxGeometry(2.0, 1.2, 0.4);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.name = 'quartz-crystal';

    // Top & Bottom Gold Electrodes
    const elecMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    const topElec = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.45), elecMat);
    topElec.position.y = 0.64;
    const botElec = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.45), elecMat);
    botElec.position.y = -0.64;

    this.piezoGroup.add(crystal, topElec, botElec);
    this.piezoGroup.name = 'piezo-generator';
    this.piezoGroup.userData = { componentId: 'piezo-generator' };

    // 2. Magnetostriction Nickel Rod and Solenoid Coil
    const rodGeo = new THREE.CylinderGeometry(0.25, 0.25, 3.8, 32);
    rodGeo.rotateZ(Math.PI / 2);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const nickelRod = new THREE.Mesh(rodGeo, rodMat);

    // Excitation Coil Rings
    const coilGroup = new THREE.Group();
    for (let i = -1.2; i <= 1.2; i += 0.3) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.05, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 })
      );
      ring.position.x = i;
      ring.rotateY(Math.PI / 2);
      coilGroup.add(ring);
    }

    this.magnetoGroup.add(nickelRod, coilGroup);
    this.magnetoGroup.name = 'magneto-generator';
    this.magnetoGroup.userData = { componentId: 'magneto-generator' };
    this.magnetoGroup.visible = false;

    this.scene.add(this.piezoGroup, this.magnetoGroup);

    this.parameters.oscillatorType = 'piezo';
    this.parameters.tuningFreqKHz = 50;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-production-physics',
        index: 0,
        title: 'Stage 1: Piezoelectric & Magnetostrictive Resonance',
        shortDescription: 'Understand how alternating electrical or magnetic fields drive mechanical resonance.',
        detailedExplanation:
          'Piezoelectric effect: An applied alternating electric field causes mechanical contraction and expansion along the polar axis. ' +
          'At resonance (f = (p / 2l) · √(Y/ρ)), maximum amplitude ultrasonic waves are radiated into the medium. ' +
          'Magnetostriction: When a ferromagnetic rod (Nickel) is placed in an alternating magnetic field, its length changes at twice the magnetic field frequency.',
        physicsFormulas: [
          'Piezoelectric Resonance: f = (p / 2l) · √(Y / ρ)',
          'Magnetostriction Resonance: f = (1 / 2l) · √(Y / ρ)',
        ],
        highlightComponentIds: ['piezo-generator', 'magneto-generator'],
        recommendedCamera: { position: [0, 1.5, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('piezo-generator', {
      id: 'piezo-generator',
      name: 'X-Cut Quartz Crystal Transducer',
      scientificRole: 'Generates high-frequency ultrasound via the inverse piezoelectric effect',
      materialsAndSpecs: 'Single-crystal Quartz: Y = 7.9 × 10¹⁰ N/m², ρ = 2650 kg/m³, length l = 20 mm',
      physicalPrinciples: 'Electromechanical coupling: Electric polarization P_i = d_ijk σ_jk produces mechanical strain.',
    });
    this.components.set('magneto-generator', {
      id: 'magneto-generator',
      name: 'Nickel Magnetostrictive Resonator Rod',
      scientificRole: 'Generates high-power low-frequency ultrasound via magnetic domain reorientation',
      materialsAndSpecs: 'Pure Nickel rod: Y = 21.4 × 10¹⁰ N/m², ρ = 8900 kg/m³, length l = 0.15 m',
      physicalPrinciples: 'Joule magnetostriction: Longitudinal strain λ_s = Δl / l induced by magnetic field H.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const type = String(this.parameters.oscillatorType || 'piezo');
    const fTuning = Number(this.parameters.tuningFreqKHz || 50);

    if (type === 'piezo') {
      this.piezoGroup.visible = true;
      this.magnetoGroup.visible = false;

      // Resonant frequency for 20mm quartz: f0 = (1 / 2*0.02) * sqrt(7.9e10 / 2650) = 136.5 kHz
      const f0 = 136.5;
      const Q = 35;
      const resp = 1.0 / Math.sqrt(Math.pow(1 - Math.pow(fTuning / f0, 2), 2) + Math.pow(fTuning / (f0 * Q), 2));

      // Visual vibration
      this.piezoGroup.scale.y = 1.0 + Math.sin(this.currentTime * 15) * Math.min(resp * 0.05, 0.35);

      this.metrics['naturalResonantFreq'] = '136.5 kHz';
      this.metrics['amplitudeGain'] = Number(resp.toFixed(2));
      this.metrics['efficiency'] = `${(Math.min(resp, 10) * 8.5).toFixed(1)} %`;
    } else {
      this.piezoGroup.visible = false;
      this.magnetoGroup.visible = true;

      // Resonant frequency for 150mm nickel: f0 = (1 / 2*0.15) * sqrt(21.4e10 / 8900) = 16.3 kHz
      const f0 = 16.3;
      const Q = 20;
      const resp = 1.0 / Math.sqrt(Math.pow(1 - Math.pow(fTuning / f0, 2), 2) + Math.pow(fTuning / (f0 * Q), 2));

      this.magnetoGroup.scale.x = 1.0 + Math.sin(this.currentTime * 15) * Math.min(resp * 0.05, 0.35);

      this.metrics['naturalResonantFreq'] = '16.3 kHz';
      this.metrics['amplitudeGain'] = Number(resp.toFixed(2));
      this.metrics['efficiency'] = `${(Math.min(resp, 10) * 6.2).toFixed(1)} %`;
    }
  }
}

// =========================================================================
// Simulation 13: 3D Ultrasonic Velocity Measurement Laboratory
// =========================================================================
export class UltrasonicVelocityScene extends BaseSimulation {
  private acousticCellMesh!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'interferometerSeparationMm',
        label: 'Micrometer Reflector Separation (d)',
        description: 'Distance moved by reflector plate between successive nodal current minima',
        type: 'number',
        min: 10,
        max: 50,
        step: 0.5,
        unit: 'mm',
        defaultValue: 25,
      },
      {
        key: 'generatorFreqKHz',
        label: 'Crystal Excitation Frequency (f)',
        description: 'Frequency of ultrasonic generator crystal',
        type: 'number',
        min: 1000,
        max: 5000,
        step: 500,
        unit: 'kHz',
        defaultValue: 2000,
      },
    ];
  }

  protected initScene(): void {
    // Glass Acoustic Liquid Cell
    const cellGeo = new THREE.BoxGeometry(2.5, 3.2, 2.5);
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    });
    this.acousticCellMesh = new THREE.Mesh(cellGeo, cellMat);
    this.acousticCellMesh.name = 'acoustic-cell';
    this.acousticCellMesh.userData = { componentId: 'acoustic-cell' };
    this.scene.add(this.acousticCellMesh);

    // Micrometer Head at top
    const microGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.4, 24);
    const microMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85 });
    const microHead = new THREE.Mesh(microGeo, microMat);
    microHead.position.y = 2.3;
    this.scene.add(microHead);

    this.parameters.interferometerSeparationMm = 25;
    this.parameters.generatorFreqKHz = 2000;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-acoustic-interferometer',
        index: 0,
        title: 'Stage 1: Standing Waves & Velocity in Liquids',
        shortDescription: 'Determine ultrasonic velocity via acoustic standing wave wavelength: v = f · λ = 2 · f · d_nodes.',
        detailedExplanation:
          'Ultrasonic waves generated at the base reflect off a movable metallic plate. ' +
          'Superposition creates acoustic standing waves. As the micrometer moves by distance d across n half-wavelengths, d = n · (λ / 2), giving v = 2 · d · f / n.',
        physicsFormulas: ['v = f · λ', 'd = n · (λ / 2) ⟹ λ = (2 · d) / n', 'v = (2 · d · f) / n'],
        highlightComponentIds: ['acoustic-cell'],
        recommendedCamera: { position: [0, 1.8, 5.0], target: [0, 0.5, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('acoustic-cell', {
      id: 'acoustic-cell',
      name: 'High-Precision Acoustic Interferometer Cell',
      scientificRole: 'Holds liquid sample with ultrasonic quartz transmitter and micrometer-controlled reflector',
      materialsAndSpecs: 'Borosilicate cell, distilled water / organic liquid, micrometer pitch = 0.01 mm',
      physicalPrinciples: 'Acoustic standing-wave node detection through anode current minima in crystal driver circuit.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const dMm = Number(this.parameters.interferometerSeparationMm || 25);
    const fKHz = Number(this.parameters.generatorFreqKHz || 2000);
    const f = fKHz * 1000;

    // In water, true velocity is ~1482 m/s
    // Half-wavelength at 2 MHz is λ/2 = 1482 / (2 * 2e6) = 0.3705 mm
    // Over d = 25 mm, number of nodes n = d / (λ/2)
    const trueVelocity = 1482; // m/s
    const halfLambdaMm = (trueVelocity / (2 * f)) * 1000;
    const nNodes = Math.round(dMm / halfLambdaMm);
    const measuredLambdaMm = (2 * dMm) / nNodes;
    const measuredVelocity = (measuredLambdaMm / 1000) * f;

    this.metrics['ultrasonicVelocity'] = `${measuredVelocity.toFixed(1)} m/s`;
    this.metrics['wavelengthMm'] = Number(measuredLambdaMm.toFixed(4));
    this.metrics['numberOfNodes'] = nNodes;
    this.metrics['halfWavelengthSpacing'] = `${halfLambdaMm.toFixed(3)} mm`;
  }
}

// =========================================================================
// Simulation 14: 3D SONAR & Underwater Echo Ranging
// =========================================================================
export class SonarRangingScene extends BaseSimulation {
  private vesselMesh!: THREE.Mesh;
  private submarineTarget!: THREE.Mesh;
  private seabedMesh!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'targetDepthM',
        label: 'Submarine Target Distance (R)',
        description: 'True underwater acoustic distance to detected target',
        type: 'number',
        min: 100,
        max: 3000,
        step: 50,
        unit: 'm',
        defaultValue: 1200,
      },
      {
        key: 'waterSalinitySpeed',
        label: 'Ocean Seawater Sound Speed (v)',
        description: 'Sound speed dependent on temperature, salinity, and depth (Mackenzie equation)',
        type: 'select',
        options: [
          { label: 'Standard Seawater (v = 1500 m/s at 15°C, 35 ppt)', value: '1500' },
          { label: 'Warm Surface Tropical (v = 1530 m/s at 25°C)', value: '1530' },
          { label: 'Cold Deep Arctic (v = 1440 m/s at 0°C)', value: '1440' },
        ],
        defaultValue: '1500',
      },
    ];
  }

  protected initScene(): void {
    // Surface Vessel (Ship)
    const hullGeo = new THREE.BoxGeometry(2.5, 0.7, 1.0);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    this.vesselMesh = new THREE.Mesh(hullGeo, hullMat);
    this.vesselMesh.position.set(0, 2.2, 0);
    this.vesselMesh.name = 'sonar-vessel';
    this.vesselMesh.userData = { componentId: 'sonar-vessel' };
    this.scene.add(this.vesselMesh);

    // Submarine Target
    const subGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.0, 24);
    subGeo.rotateZ(Math.PI / 2);
    const subMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    this.submarineTarget = new THREE.Mesh(subGeo, subMat);
    this.submarineTarget.position.set(0, -1.2, 0);
    this.submarineTarget.name = 'submarine-target';
    this.submarineTarget.userData = { componentId: 'submarine-target' };
    this.scene.add(this.submarineTarget);

    // Seabed
    const bedGeo = new THREE.PlaneGeometry(12, 8);
    bedGeo.rotateX(-Math.PI / 2);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    this.seabedMesh = new THREE.Mesh(bedGeo, bedMat);
    this.seabedMesh.position.y = -2.6;
    this.scene.add(this.seabedMesh);

    this.parameters.targetDepthM = 1200;
    this.parameters.waterSalinitySpeed = '1500';
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-sonar-ranging',
        index: 0,
        title: 'Stage 1: Active SONAR Pulse-Echo Travel Time',
        shortDescription: 'Calculate target distance from two-way acoustic transit time: R = (v · Δt) / 2.',
        detailedExplanation:
          'Active SONAR (Sound Navigation and Ranging) transmits an acoustic pulse that propagates at seawater sound speed v, ' +
          'reflects off the target’s acoustic impedance mismatch, and returns as an echo after round-trip time Δt.',
        physicsFormulas: ['Range R = (v · Δt) / 2', 'Round-trip time Δt = (2 · R) / v'],
        highlightComponentIds: ['sonar-vessel', 'submarine-target'],
        recommendedCamera: { position: [0, 0.8, 6.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('sonar-vessel', {
      id: 'sonar-vessel',
      name: 'Naval Surface Vessel with Hull-Mounted SONAR Array',
      scientificRole: 'Active piezoelectric sonar projector and hydrophone receiver array',
      materialsAndSpecs: 'Operating acoustic frequency f = 20–50 kHz',
      physicalPrinciples: 'Pulse-echo ranging and beamforming based on acoustic round-trip travel time.',
    });
    this.components.set('submarine-target', {
      id: 'submarine-target',
      name: 'Submerged Target Hull',
      scientificRole: 'Acoustic reflector presenting target strength TS = 10 log₁₀(I_reflected / I_incident)',
      materialsAndSpecs: 'Steel pressure hull, Target Strength TS ≈ +15 dB',
      physicalPrinciples: 'Specular and diffuse backscatter governed by acoustic impedance mismatch between steel and seawater.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const rangeM = Number(this.parameters.targetDepthM || 1200);
    const soundSpeed = Number(this.parameters.waterSalinitySpeed || 1500);

    // Two-way transit time Δt in seconds
    const deltaTSeconds = (2 * rangeM) / soundSpeed;

    this.metrics['roundTripTimeSec'] = Number(deltaTSeconds.toFixed(4));
    this.metrics['calculatedRangeM'] = `${rangeM} m`;
    this.metrics['oneWayTravelTime'] = `${(deltaTSeconds / 2).toFixed(4)} s`;
    this.metrics['acousticSpeed'] = `${soundSpeed} m/s`;
  }
}

// =========================================================================
// Simulation 15: 3D Non-Destructive Testing (NDT) & Ultrasonic Scanning
// =========================================================================
export class NDTScanningScene extends BaseSimulation {
  private testBlockMesh!: THREE.Mesh;
  private probeMesh!: THREE.Mesh;
  private flawMesh!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'probePositionX',
        label: 'Probe Scan Coordinate (x)',
        description: 'Position of ultrasonic transducer across test block surface',
        type: 'number',
        min: -2.0,
        max: 2.0,
        step: 0.1,
        unit: 'm',
        defaultValue: 0.0,
      },
      {
        key: 'flawDepthMm',
        label: 'Internal Flaw Depth (d_flaw)',
        description: 'True depth of internal shrinkage crack / void beneath surface',
        type: 'number',
        min: 20,
        max: 80,
        step: 5,
        unit: 'mm',
        defaultValue: 45,
      },
    ];
  }

  protected initScene(): void {
    // Solid Steel Test Block (Semi-transparent so student sees internal flaw)
    const blockGeo = new THREE.BoxGeometry(5.0, 2.0, 2.0);
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.5,
    });
    this.testBlockMesh = new THREE.Mesh(blockGeo, blockMat);
    this.testBlockMesh.name = 'test-block';
    this.testBlockMesh.userData = { componentId: 'test-block' };
    this.scene.add(this.testBlockMesh);

    // Ultrasonic Probe (Transducer)
    const probeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 24);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
    this.probeMesh = new THREE.Mesh(probeGeo, probeMat);
    this.probeMesh.position.set(0, 1.3, 0);
    this.scene.add(this.probeMesh);

    // Internal Flaw / Void
    const flawGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const flawMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5 });
    this.flawMesh = new THREE.Mesh(flawGeo, flawMat);
    this.flawMesh.position.set(0, 0, 0);
    this.scene.add(this.flawMesh);

    this.parameters.probePositionX = 0;
    this.parameters.flawDepthMm = 45;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-ndt-pulse-echo',
        index: 0,
        title: 'Stage 1: Ultrasonic Pulse-Echo Flaw Detection (A-Scan)',
        shortDescription: 'Locate internal defects by measuring reflection echo time: d = (v_steel · t) / 2.',
        detailedExplanation:
          'High-frequency longitudinal ultrasonic pulses (2–5 MHz) travel through the metal at longitudinal velocity v = 5900 m/s. ' +
          'Discontinuities (cracks, voids, slag) cause strong acoustic reflections due to the metal-air acoustic impedance mismatch.',
        physicsFormulas: ['d_flaw = (v_steel · t_flaw) / 2', 'd_backwall = (v_steel · t_backwall) / 2'],
        highlightComponentIds: ['test-block'],
        recommendedCamera: { position: [0, 1.8, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('test-block', {
      id: 'test-block',
      name: 'Forged Steel Reference Calibration Block',
      scientificRole: 'Test component containing artificial internal calibration flaw at known depth',
      materialsAndSpecs: 'Carbon steel ASTM A36: v = 5900 m/s, thickness T = 100 mm',
      physicalPrinciples: 'Acoustic reflection coefficient R = (Z₂ - Z₁) / (Z₂ + Z₁) ≈ -1.0 at metal-air interface.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const probeX = Number(this.parameters.probePositionX || 0);
    const flawDepth = Number(this.parameters.flawDepthMm || 45); // mm
    const vSteel = 5900; // m/s
    const blockThicknessMm = 100; // mm

    // Position probe
    if (this.probeMesh) {
      this.probeMesh.position.x = probeX;
    }

    // Position flaw
    if (this.flawMesh) {
      this.flawMesh.position.y = 1.0 - (flawDepth / 100) * 2.0;
    }

    // Check if probe is over the flaw (|probeX| < 0.3)
    const isOverFlaw = Math.abs(probeX) < 0.35;
    const tFlawMicroSec = (2 * (flawDepth / 1000) / vSteel) * 1e6;
    const tBackwallMicroSec = (2 * (blockThicknessMm / 1000) / vSteel) * 1e6;

    this.metrics['backwallEchoTime'] = `${tBackwallMicroSec.toFixed(2)} µs`;
    this.metrics['flawEchoDetected'] = isOverFlaw ? `${tFlawMicroSec.toFixed(2)} µs (FLAW CONFIRMED)` : 'None (Sound Metal)';
    this.metrics['detectedDepth'] = isOverFlaw ? `${flawDepth} mm` : 'Clear';
    this.metrics['soundVelocity'] = `${vSteel} m/s`;
  }
}
