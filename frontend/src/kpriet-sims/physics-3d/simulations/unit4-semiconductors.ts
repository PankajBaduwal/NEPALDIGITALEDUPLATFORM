/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * Unit IV: Semiconductor Physics
 * Simulations 16 to 20
 */

import * as THREE from 'three';
import { BaseSimulation } from '../core/BaseSimulation';
import type { SimulationOptions, ParameterDefinition } from '../core/types';

// =========================================================================
// Simulation 16: 3D Semiconductor Band Structure (Direct vs Indirect)
// =========================================================================
export class BandStructureScene extends BaseSimulation {
  private conductionBandMesh!: THREE.Mesh;
  private valenceBandMesh!: THREE.Mesh;
  private transitionLine!: THREE.Line;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'materialType',
        label: 'Semiconductor Material',
        description: 'Direct vs Indirect bandgap semiconductor',
        type: 'select',
        options: [
          { label: 'Gallium Arsenide (GaAs: Direct E_g = 1.42 eV, Efficient Optoelectronic)', value: 'gaas' },
          { label: 'Silicon (Si: Indirect E_g = 1.12 eV, Phonon Assisted)', value: 'silicon' },
          { label: 'Germanium (Ge: Indirect E_g = 0.66 eV)', value: 'germanium' },
          { label: 'Indium Phosphide (InP: Direct E_g = 1.34 eV, Laser Diode)', value: 'inp' },
        ],
        defaultValue: 'gaas',
      },
      {
        key: 'photonEnergyEV',
        label: 'Incident Photon Energy (hν)',
        description: 'Energy of incoming photon attempting optical excitation',
        type: 'number',
        min: 0.5,
        max: 2.5,
        step: 0.05,
        unit: 'eV',
        defaultValue: 1.5,
      },
    ];
  }

  protected initScene(): void {
    // 3D Energy vs Wavevector (E-k) Parabolic Surface
    const cbGeo = new THREE.CylinderGeometry(1.8, 0.2, 1.6, 32, 16, true);
    const cbMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    this.conductionBandMesh = new THREE.Mesh(cbGeo, cbMat);
    this.conductionBandMesh.position.y = 1.6;
    this.conductionBandMesh.name = 'conduction-band';
    this.conductionBandMesh.userData = { componentId: 'energy-bands' };

    // Valence Band (Inverted paraboloid)
    const vbGeo = new THREE.CylinderGeometry(0.2, 1.8, 1.6, 32, 16, true);
    const vbMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    this.valenceBandMesh = new THREE.Mesh(vbGeo, vbMat);
    this.valenceBandMesh.position.y = -1.6;
    this.scene.add(this.conductionBandMesh, this.valenceBandMesh);

    // Transition optical arrow line
    const points = [new THREE.Vector3(0, -0.8, 0), new THREE.Vector3(0, 0.8, 0)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    this.transitionLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 }));
    this.scene.add(this.transitionLine);

    this.parameters.materialType = 'gaas';
    this.parameters.photonEnergyEV = 1.5;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-ek-diagram',
        index: 0,
        title: 'Stage 1: Direct vs Indirect Band Gaps & Crystal Momentum Conservation',
        shortDescription: 'In direct gap materials (GaAs), conduction minimum and valence maximum align at k = 0.',
        detailedExplanation:
          'In a direct bandgap semiconductor (GaAs, InP), the conduction band minimum and valence band maximum occur at the same wavevector (k = 0). ' +
          'Electrons can recombine directly with holes emitting a photon without requiring crystal momentum transfer. ' +
          'In indirect gap semiconductors (Si, Ge), conduction minimum is shifted by Δk; optical transitions require simultaneous emission/absorption of a phonon (lattice vibration), drastically reducing radiative recombination efficiency.',
        physicsFormulas: ['E_g = E_c(k) - E_v(k)', 'Photon Emission: Δk ≈ 0 (Direct)', 'Indirect: Δk = k_c - k_v ≠ 0 (Phonon Required)'],
        highlightComponentIds: ['energy-bands'],
        recommendedCamera: { position: [0, 1.5, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('energy-bands', {
      id: 'energy-bands',
      name: 'Electronic Energy-Wavevector (E-k) Band Dispersion',
      scientificRole: 'Bloch electron wavefunction energy dispersion in reciprocal lattice Brillouin zone',
      materialsAndSpecs: 'GaAs (Direct, Eg = 1.42 eV) | Si (Indirect, Eg = 1.12 eV, Δk_offset = 0.85 k_max)',
      physicalPrinciples: 'Schrödinger wave equation in periodic crystal potential yielding allowed energy bands and forbidden energy gaps.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const mat = String(this.parameters.materialType || 'gaas');
    const hnu = Number(this.parameters.photonEnergyEV || 1.5);

    let Eg = 1.42; // eV
    let isDirect = true;
    let kOffset = 0;

    switch (mat) {
      case 'gaas': Eg = 1.42; isDirect = true; kOffset = 0; break;
      case 'silicon': Eg = 1.12; isDirect = false; kOffset = 1.2; break;
      case 'germanium': Eg = 0.66; isDirect = false; kOffset = 1.0; break;
      case 'inp': Eg = 1.34; isDirect = true; kOffset = 0; break;
    }

    // Offset conduction band if indirect
    if (this.conductionBandMesh) {
      this.conductionBandMesh.position.x = kOffset;
      this.conductionBandMesh.position.y = (Eg / 2) + 0.8;
    }
    if (this.valenceBandMesh) {
      this.valenceBandMesh.position.y = -(Eg / 2) - 0.8;
    }

    const canAbsorb = hnu >= Eg;

    this.metrics['bandgapEnergyEg'] = `${Eg} eV`;
    this.metrics['bandgapClassification'] = isDirect ? 'Direct Band Gap (High Optoelectronic Efficiency)' : 'Indirect Band Gap (Phonon Assisted)';
    this.metrics['absorptionAllowed'] = canAbsorb ? 'YES (hν ≥ Eg)' : 'NO (hν < Eg: Transparent)';
    this.metrics['emissionEfficiency'] = isDirect ? '98% (LED & Laser Suitable)' : '< 0.1% (Inefficient Radiator)';
  }
}

// =========================================================================
// Simulation 17: 3D Intrinsic & Extrinsic Carrier Concentration
// =========================================================================
export class CarrierConcentrationScene extends BaseSimulation {
  private latticeGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'dopingType',
        label: 'Semiconductor Type',
        description: 'Intrinsic pure crystal vs N-type donor vs P-type acceptor',
        type: 'select',
        options: [
          { label: 'Intrinsic Pure Silicon (n = p = n_i)', value: 'intrinsic' },
          { label: 'N-Type Doped (Phosphorus Donor N_D = 10¹⁶ cm⁻³)', value: 'ntype' },
          { label: 'P-Type Doped (Boron Acceptor N_A = 10¹⁶ cm⁻³)', value: 'ptype' },
        ],
        defaultValue: 'intrinsic',
      },
      {
        key: 'temperatureKelvin',
        label: 'Operating Temperature (T)',
        description: 'Thermal lattice temperature influencing intrinsic carrier generation',
        type: 'number',
        min: 100,
        max: 600,
        step: 25,
        unit: 'K',
        defaultValue: 300,
      },
    ];
  }

  protected initScene(): void {
    this.latticeGroup = new THREE.Group();

    // 3D Diamond Cubic Lattice Schematic (Silicon atoms)
    const atomGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const siMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });

    for (let x = -1.5; x <= 1.5; x += 1.0) {
      for (let y = -1.5; y <= 1.5; y += 1.0) {
        for (let z = -1.5; z <= 1.5; z += 1.0) {
          const atom = new THREE.Mesh(atomGeo, siMat);
          atom.position.set(x, y, z);
          this.latticeGroup.add(atom);
        }
      }
    }

    this.latticeGroup.name = 'semiconductor-lattice';
    this.latticeGroup.userData = { componentId: 'semiconductor-lattice' };
    this.scene.add(this.latticeGroup);

    this.parameters.dopingType = 'intrinsic';
    this.parameters.temperatureKelvin = 300;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-mass-action-law',
        index: 0,
        title: 'Stage 1: Mass Action Law & Fermi Energy Level',
        shortDescription: 'Thermal carrier generation balances electron-hole recombination: n · p = n_i²(T).',
        detailedExplanation:
          'In thermal equilibrium, the product of electron concentration n and hole concentration p is strictly constant at a given temperature: n · p = n_i². ' +
          'Doping with Group V elements (P, As) adds extra electrons shifting Fermi level E_F upward near conduction band. ' +
          'Doping with Group III elements (B, Ga) introduces holes shifting E_F downward near valence band.',
        physicsFormulas: [
          'n_i² = N_c · N_v · e^(-E_g / kT)',
          'Mass Action Law: n · p = n_i²',
          'N-type: n ≈ N_D, p = n_i² / N_D',
          'P-type: p ≈ N_A, n = n_i² / N_A',
        ],
        highlightComponentIds: ['semiconductor-lattice'],
        recommendedCamera: { position: [0, 2.0, 5.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('semiconductor-lattice', {
      id: 'semiconductor-lattice',
      name: 'Single-Crystal Silicon Lattice with Doping Sites',
      scientificRole: '3D tetrahedral covalent semiconductor lattice hosting mobile electrons and holes',
      materialsAndSpecs: 'Silicon crystal: n_i = 1.5 × 10¹⁰ cm⁻³ at 300 K, E_g = 1.12 eV',
      physicalPrinciples: 'Fermi–Dirac statistics f(E) = 1 / [1 + e^((E - E_F)/kT)].',
    });
  }

  protected updatePhysics(_delta: number): void {
    const type = String(this.parameters.dopingType || 'intrinsic');
    const T = Number(this.parameters.temperatureKelvin || 300);

    // Intrinsic concentration n_i at T (empirical approximation for Silicon)
    // n_i(300K) ≈ 1.5e10 cm^-3
    const ni = 5.23e15 * Math.pow(T, 1.5) * Math.exp(-1.12 / (2 * 8.617333262e-5 * T));

    let n = ni;
    let p = ni;
    const ND = 1e16;
    const NA = 1e16;

    if (type === 'ntype') {
      n = ND;
      p = Math.pow(ni, 2) / ND;
    } else if (type === 'ptype') {
      p = NA;
      n = Math.pow(ni, 2) / NA;
    }

    this.metrics['electronConcentrationN'] = `${n.toExponential(2)} cm⁻³`;
    this.metrics['holeConcentrationP'] = `${p.toExponential(2)} cm⁻³`;
    this.metrics['intrinsicConcentrationNi'] = `${ni.toExponential(2)} cm⁻³`;
    this.metrics['majorityCarrier'] = type === 'ntype' ? 'Electrons (n >> p)' : type === 'ptype' ? 'Holes (p >> n)' : 'Balanced (n = p = n_i)';
  }
}

// =========================================================================
// Simulation 18: 3D Carrier Transport & P–N Junction Dynamics
// =========================================================================
export class CarrierTransportPNScene extends BaseSimulation {
  private pRegionMesh!: THREE.Mesh;
  private nRegionMesh!: THREE.Mesh;
  private depletionMesh!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'biasMode',
        label: 'Junction Bias Condition',
        description: 'Applied external electric potential across P-N junction',
        type: 'select',
        options: [
          { label: 'Thermal Equilibrium (V = 0 V, Built-in Potential V_bi)', value: 'equilibrium' },
          { label: 'Forward Bias (V = +0.7 V, Depletion Shrinks, High Current)', value: 'forward' },
          { label: 'Reverse Bias (V = -3.0 V, Depletion Widens, Leakage Current)', value: 'reverse' },
        ],
        defaultValue: 'equilibrium',
      },
    ];
  }

  protected initScene(): void {
    // P-Region (Left)
    this.pRegionMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.5, 2.0), new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3 }));
    this.pRegionMesh.position.set(-1.8, 0, 0);

    // N-Region (Right)
    this.nRegionMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.5, 2.0), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.3 }));
    this.nRegionMesh.position.set(1.8, 0, 0);

    // Depletion Region (Center)
    this.depletionMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.5, 2.0), new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.5 }));
    this.depletionMesh.position.set(0, 0, 0);
    this.depletionMesh.name = 'depletion-layer';
    this.depletionMesh.userData = { componentId: 'depletion-layer' };

    this.scene.add(this.pRegionMesh, this.nRegionMesh, this.depletionMesh);

    this.parameters.biasMode = 'equilibrium';
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-pn-junction-barrier',
        index: 0,
        title: 'Stage 1: Depletion Layer & Built-in Potential Barrier',
        shortDescription: 'Uncover how majority carrier diffusion forms uncompensated fixed space-charge ions.',
        detailedExplanation:
          'When P and N regions meet, mobile holes diffuse into N region leaving negative acceptor ions (NA⁻), ' +
          'and electrons diffuse into P region leaving positive donor ions (ND⁺). This creates a space charge region and built-in electric field E directed from N to P.',
        physicsFormulas: [
          'V_bi = (kT / q) · ln(N_A · N_D / n_i²)',
          'W = √[(2ε / q) · (V_bi - V) · (1/N_A + 1/N_D)]',
          'Shockley Diode: I = I_s · [e^(qV / ηkT) - 1]',
        ],
        highlightComponentIds: ['depletion-layer'],
        recommendedCamera: { position: [0, 1.8, 5.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('depletion-layer', {
      id: 'depletion-layer',
      name: 'Space Charge Depletion Layer',
      scientificRole: 'Carrier-depleted region containing fixed ionized donors and acceptors',
      materialsAndSpecs: 'Silicon abrupt junction: N_A = 10¹⁶ cm⁻³, N_D = 10¹⁶ cm⁻³, V_bi ≈ 0.70 V',
      physicalPrinciples: 'Poisson’s equation d²V/dx² = - ρ / ε governing internal electric field and potential barrier.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const mode = String(this.parameters.biasMode || 'equilibrium');

    let appliedV = 0.0;
    let widthScale = 1.0;
    let currentMa = 0.0;

    if (mode === 'forward') {
      appliedV = 0.68;
      widthScale = 0.4; // Barrier narrows
      currentMa = 45.2; // Exponential turn on
    } else if (mode === 'reverse') {
      appliedV = -3.0;
      widthScale = 1.8; // Barrier expands
      currentMa = -0.00001; // Tiny reverse saturation
    }

    if (this.depletionMesh) {
      this.depletionMesh.scale.x = widthScale;
    }

    this.metrics['appliedBiasVoltage'] = `${appliedV >= 0 ? '+' : ''}${appliedV.toFixed(2)} V`;
    this.metrics['junctionCurrent'] = `${currentMa} mA`;
    this.metrics['barrierHeight'] = `${Math.max(0, 0.70 - appliedV).toFixed(2)} V`;
    this.metrics['depletionWidthUm'] = `${(0.48 * widthScale).toFixed(2)} µm`;
  }
}

// =========================================================================
// Simulation 19: 3D Zener Diode & Voltage Regulation
// =========================================================================
export class ZenerDiodeScene extends BaseSimulation {
  private diodeMesh!: THREE.Mesh;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'inputVoltageVin',
        label: 'DC Input Voltage (V_in)',
        description: 'Unregulated DC source voltage',
        type: 'number',
        min: 0,
        max: 20,
        step: 0.5,
        unit: 'V',
        defaultValue: 12,
      },
      {
        key: 'zenerRatingVz',
        label: 'Zener Breakdown Voltage (V_Z)',
        description: 'Nominal Zener knee voltage rating',
        type: 'select',
        options: [
          { label: '5.1 V Zener (BZX55C5V1 - Quantum Tunneling)', value: '5.1' },
          { label: '6.8 V Zener (Zero Temp-Coeff Balance)', value: '6.8' },
          { label: '9.1 V Zener (Avalanche Multiplication)', value: '9.1' },
        ],
        defaultValue: '5.1',
      },
      {
        key: 'loadResistanceOhms',
        label: 'Load Resistance (R_L)',
        description: 'Load resistor drawing regulated current',
        type: 'number',
        min: 100,
        max: 2000,
        step: 100,
        unit: 'Ω',
        defaultValue: 500,
      },
    ];
  }

  protected initScene(): void {
    // 3D Zener Diode Glass Encapsulation
    const glassGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.8, 24);
    glassGeo.rotateZ(Math.PI / 2);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
    this.diodeMesh = new THREE.Mesh(glassGeo, glassMat);
    this.diodeMesh.name = 'zener-diode';
    this.diodeMesh.userData = { componentId: 'zener-diode' };

    // Black cathode band marker
    const bandGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.25, 24);
    bandGeo.rotateZ(Math.PI / 2);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.x = 0.5;
    this.diodeMesh.add(band);

    // Axial lead wires
    const leadGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.0, 16);
    leadGeo.rotateZ(Math.PI / 2);
    const leadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const leads = new THREE.Mesh(leadGeo, leadMat);
    this.diodeMesh.add(leads);

    this.scene.add(this.diodeMesh);

    this.parameters.inputVoltageVin = 12;
    this.parameters.zenerRatingVz = '5.1';
    this.parameters.loadResistanceOhms = 500;
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-voltage-regulation',
        index: 0,
        title: 'Stage 1: Reverse Breakdown & Constant Voltage Shunt Regulation',
        shortDescription: 'In reverse breakdown, Zener voltage remains constant despite fluctuating input voltage.',
        detailedExplanation:
          'When reverse bias exceeds the breakdown voltage V_Z, tunneling (Zener effect below 5V) or avalanche impact ionization (above 6V) occurs. ' +
          'The diode maintains a nearly constant voltage drop V_out = V_Z across varying load currents, absorbing excess current: I_Z = I_S - I_L.',
        physicsFormulas: ['V_out = V_Z (In Breakdown)', 'I_S = (V_in - V_Z) / R_S', 'I_Z = I_S - I_L where I_L = V_Z / R_L'],
        highlightComponentIds: ['zener-diode'],
        recommendedCamera: { position: [0, 1.2, 4.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('zener-diode', {
      id: 'zener-diode',
      name: 'Heavily Doped Zener Voltage Regulator Diode',
      scientificRole: 'Operates in reverse breakdown to clamp output voltage at predetermined V_Z',
      materialsAndSpecs: 'Silicon BZX55 series: V_Z = 5.1–9.1 V, Max power P_Z_max = 500 mW, R_S = 220 Ω',
      physicalPrinciples: 'Quantum mechanical band-to-band tunneling and high-field avalanche impact ionization.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const Vin = Number(this.parameters.inputVoltageVin || 12);
    const Vz = Number(this.parameters.zenerRatingVz || 5.1);
    const RL = Number(this.parameters.loadResistanceOhms || 500);
    const RS = 220; // Series resistance 220 ohms

    // Is circuit in breakdown?
    const unloadedVout = (Vin * RL) / (RS + RL);
    let Vout = 0;
    let IzMa = 0;
    let isRegulating = false;

    if (unloadedVout >= Vz) {
      isRegulating = true;
      Vout = Vz;
      const Is = (Vin - Vz) / RS;
      const IL = Vz / RL;
      IzMa = Math.max(0, (Is - IL) * 1000);
    } else {
      Vout = unloadedVout;
      IzMa = 0;
    }

    this.metrics['outputRegulatedVoltage'] = `${Vout.toFixed(2)} V`;
    this.metrics['zenerCurrentIz'] = `${IzMa.toFixed(1)} mA`;
    this.metrics['regulationState'] = isRegulating ? 'REGULATING (Breakdown Active)' : 'UNREGULATED (Below Knee)';
    this.metrics['zenerPowerDissipation'] = `${((IzMa / 1000) * Vout * 1000).toFixed(1)} mW`;
  }
}

// =========================================================================
// Simulation 20: 3D Semiconductor Device Explorer
// =========================================================================
export class SemiconductorDevicesScene extends BaseSimulation {
  private devicesGroup!: THREE.Group;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  public getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'deviceSelection',
        label: 'Active Semiconductor Device',
        description: 'Interactive cutaway inspection of essential solid-state devices',
        type: 'select',
        options: [
          { label: 'P-N Junction Rectifier Diode (1N4007)', value: 'diode' },
          { label: 'Bipolar Junction Transistor (NPN BJT: Emitter, Base, Collector)', value: 'bjt' },
          { label: 'Light Emitting Diode (LED: Direct Bandgap Electroluminescence)', value: 'led' },
        ],
        defaultValue: 'diode',
      },
    ];
  }

  protected initScene(): void {
    this.devicesGroup = new THREE.Group();

    // Generic TO-92 Transistor Package
    const to92Body = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.6, 24, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    const flatFace = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    flatFace.position.z = 0;
    this.devicesGroup.add(to92Body, flatFace);

    // 3 Leads (Emitter, Base, Collector)
    for (let i = -0.5; i <= 0.5; i += 0.5) {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
      pin.position.set(i, -1.6, 0);
      this.devicesGroup.add(pin);
    }

    this.devicesGroup.name = 'semiconductor-device';
    this.devicesGroup.userData = { componentId: 'semiconductor-device' };
    this.scene.add(this.devicesGroup);

    this.parameters.deviceSelection = 'bjt';
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-device-taxonomy',
        index: 0,
        title: 'Stage 1: Solid-State Electronic Device Architecture',
        shortDescription: 'Explore device internal junctions, terminal configurations, and switching modes.',
        detailedExplanation:
          'From simple two-terminal rectifiers to three-terminal amplifying bipolar transistors (BJT: I_C = β · I_B) ' +
          'and radiative optoelectronic devices, semiconductor physics forms the bedrock of modern integrated computing hardware.',
        highlightComponentIds: ['semiconductor-device'],
        recommendedCamera: { position: [0, 1.0, 4.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.set('semiconductor-device', {
      id: 'semiconductor-device',
      name: 'Engineered Discrete Semiconductor Component',
      scientificRole: 'Silicon solid-state circuit building block for rectification, switching, amplification, or light emission',
      materialsAndSpecs: 'Standard JEDEC packaging (TO-92, DO-41, 5mm T-1 3/4)',
      physicalPrinciples: 'Transport of electrons and holes governed by drift-diffusion, recombination, and carrier injection.',
    });
  }

  protected updatePhysics(_delta: number): void {
    const dev = String(this.parameters.deviceSelection || 'bjt');
    if (dev === 'bjt') {
      this.metrics['currentGainBeta'] = '180';
      this.metrics['vbeTurnOn'] = '0.68 V';
      this.metrics['operationalMode'] = 'Forward Active (Linear Amplifier)';
    } else if (dev === 'led') {
      this.metrics['forwardVoltage'] = '2.1 V (Green LED)';
      this.metrics['peakWavelength'] = '525 nm';
      this.metrics['internalQuantumEff'] = '82 %';
    } else {
      this.metrics['forwardVoltage'] = '0.7 V';
      this.metrics['peakInverseVoltage'] = '1000 V (1N4007)';
      this.metrics['reverseRecoveryTime'] = '2.0 µs';
    }
  }
}
