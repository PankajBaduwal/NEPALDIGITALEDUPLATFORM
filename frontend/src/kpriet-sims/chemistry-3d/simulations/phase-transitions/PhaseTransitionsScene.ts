/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 7: Phase Transitions and Water Phase Diagram
 *
 * Demonstrates:
 * - Solid Ice Ih: Open hexagonal crystalline lattice with ordered H-bonding (O–H···O) explaining lower density
 * - Liquid Water: Dense, dynamic fluctuating hydrogen-bond network with picosecond restructuring
 * - Water Vapour: Rapid translational kinetic molecular motion, large mean free path
 * - Synchronized Thermodynamic P-T Phase Diagram with:
 *   - Fusion curve (negative slope dP/dT < 0 due to ice expansion ΔV_fus < 0)
 *   - Vaporization curve (Clausius-Clapeyron ln(P2/P1) = -ΔH_vap/R (1/T2 - 1/T1))
 *   - Triple Point (0.01 °C, 0.00603 atm) where all three phases coexist
 *   - Critical Point (373.95 °C, 217.75 atm) where meniscus vanishes into supercritical fluid
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';
import { MolecularBuilder } from '../../core/MolecularBuilder';

export type WaterPhase = 'ice' | 'liquid' | 'vapor' | 'supercritical';

export class PhaseTransitionsScene extends BaseSimulation {
  private latticeGroup = new THREE.Group();
  private liquidMoleculesGroup = new THREE.Group();
  private vaporGroup = new THREE.Group();
  private hBondsGroup = new THREE.Group();

  // Dynamic thermodynamic state
  private temperatureC = 25; // °C
  private pressureAtm = 1.0; // atm
  private currentPhase: WaterPhase = 'liquid';

  // Molecular positions for liquid/vapor physics
  private waterMolecules: {
    mesh: THREE.Group;
    velocity: THREE.Vector3;
    basePos: THREE.Vector3;
  }[] = [];

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.latticeGroup = this.latticeGroup || new THREE.Group();
    this.liquidMoleculesGroup = this.liquidMoleculesGroup || new THREE.Group();
    this.vaporGroup = this.vaporGroup || new THREE.Group();
    this.hBondsGroup = this.hBondsGroup || new THREE.Group();

    this.scene.add(this.latticeGroup);
    this.scene.add(this.liquidMoleculesGroup);
    this.scene.add(this.vaporGroup);
    this.scene.add(this.hBondsGroup);

    this.recalculatePhase();
    this.buildCurrentState();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-ice-ih-lattice',
        index: 0,
        title: 'Stage 1: Ice Ih Hexagonal Crystal Lattice & Hydrogen Bonding',
        shortDescription: 'Open tetrahedral cage structure with ordered H-bonds explaining why ice floats on water.',
        detailedExplanation:
          'In ordinary ice (Ice Ih), every water molecule acts as a donor in two hydrogen bonds and an acceptor in two hydrogen bonds, ' +
          'forming a rigid, open tetrahedral network with hexagonal channels. ' +
          'The O···O distance is 2.76 Å with an open cage volume that renders ice ~9% less dense (0.917 g/cm³) than liquid water at 0 °C (0.9998 g/cm³). ' +
          'This anomalous expansion causes the negative melting curve slope (dP/dT < 0) in water’s phase diagram.',
        chemicalReactions: [
          'Density: Ice (0.917 g/cm³) < Water (1.000 g/cm³) at 0 °C',
          'Clapeyron Equation: dP/dT = ΔH_fus / (T · ΔV_fus) < 0 (since ΔV_fus = V_liq - V_ice < 0)',
          'H-Bond Length: 1.77 Å · Covalent O–H: 0.96 Å · H–O–H Angle: 104.5°',
        ],
        keyTerminology: [
          { term: 'Ice Ih', definition: 'Hexagonal crystalline phase of ice stable at terrestrial atmospheric pressures.' },
          { term: 'Anomalous Expansion', definition: 'Volume increase upon freezing caused by rigid tetrahedral hydrogen bond orientation.' },
          { term: 'Negative Clapeyron Slope', definition: 'Increasing pressure lowers the melting point of ice (e.g. regelation).' },
        ],
        highlightComponentIds: ['ice-hexagonal-ring', 'hydrogen-bond-link'],
        recommendedCamera: { position: [0, 3.5, 6.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-liquid-water-dynamics',
        index: 1,
        title: 'Stage 2: Liquid Water — Dynamic Picosecond Hydrogen-Bond Network',
        shortDescription: 'Thermal energy collapses the open lattice into a dense, rapidly restructuring liquid fluid.',
        detailedExplanation:
          'Upon melting (ΔH_fus = 6.01 kJ/mol), roughly 15% of hydrogen bonds rupture, allowing collapsed water molecules to slip into ' +
          'the hexagonal interstitial cavities, producing maximum density at 3.98 °C. ' +
          'In liquid water, hydrogen bonds continuously break and reform on a sub-picosecond timescale (~10⁻¹² s), ' +
          'acting as a transient, fluctuating percolating network that provides high dielectric constant (ε_r = 78.4) and massive heat capacity (4.184 J/g·K).',
        chemicalReactions: [
          'H₂O(s) ⇌ H₂O(l) (ΔH_fus = 6.01 kJ/mol at 0 °C)',
          'Specific Heat Capacity: c_p = 4.184 J/(g·K) (buffers planetary climate)',
          'Hydrogen Bond Lifetime: τ_HB ≈ 1.0 to 1.5 picoseconds',
        ],
        keyTerminology: [
          { term: 'Percolating Network', definition: 'Transient 3D interconnected hydrogen-bonded cluster spanning the entire macroscopic liquid.' },
          { term: 'Maximum Density at 4 °C', definition: 'Balance between thermal lattice collapse (density increase) and kinetic expansion (density decrease).' },
        ],
        highlightComponentIds: ['liquid-cluster', 'hydrogen-bond-link'],
        recommendedCamera: { position: [2.5, 3.0, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-vapor-molecular-motion',
        index: 2,
        title: 'Stage 3: Water Vapour — Maxwell-Boltzmann Kinetic Motion',
        shortDescription: 'Complete thermal dissociation of H-bonds into high-velocity translational gas molecules.',
        detailedExplanation:
          'At the boiling point (100 °C at 1 atm, ΔH_vap = 40.66 kJ/mol), intermolecular hydrogen bonds are completely overcome by thermal kinetic energy (k_B T). ' +
          'Water vapour molecules occupy over 1,600 times the volume of the liquid state. ' +
          'Molecules travel in straight paths punctuated by elastic collisions with root-mean-square speeds described by the Maxwell-Boltzmann distribution (v_rms = √(3RT/M) ≈ 650 m/s at 100 °C).',
        chemicalReactions: [
          'H₂O(l) ⇌ H₂O(g) (ΔH_vap = 40.66 kJ/mol at 100 °C)',
          'Clausius-Clapeyron: ln(P₂/P₁) = -(ΔH_vap / R) (1/T₂ - 1/T₁)',
          'RMS Speed: v_rms = √(3RT / M) ≈ 650 m/s at 373 K',
        ],
        keyTerminology: [
          { term: 'Latent Heat of Vaporization', definition: 'Enthalpy required to sever all intermolecular hydrogen bonds and expand against atmosphere.' },
          { term: 'Mean Free Path', definition: 'Average distance travelled by a water molecule between successive intermolecular collisions (~100 nm).' },
        ],
        highlightComponentIds: ['vapor-molecule'],
        recommendedCamera: { position: [0, 2.5, 6.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-triple-point',
        index: 3,
        title: 'Stage 4: The Triple Point (T = 0.01 °C, P = 0.00603 atm / 611 Pa)',
        shortDescription: 'Precise thermodynamic invariant where solid ice, liquid water, and water vapour coexist in equilibrium.',
        detailedExplanation:
          'By Gibbs Phase Rule: F = C - P + 2. For water (single component C = 1) at three coexisting phases (P = 3), ' +
          'the degrees of freedom F = 1 - 3 + 2 = 0 (invariant point). ' +
          'Solid, liquid, and vapor coexist in simultaneous thermodynamic equilibrium strictly at 273.16 K (0.01 °C) and 611.65 Pa (0.00603 atm). ' +
          'Below this pressure, liquid water cannot exist; warming ice leads directly to sublimation into vapour.',
        chemicalReactions: [
          'Gibbs Phase Rule: F = C - P + 2 = 1 - 3 + 2 = 0 (Zero Degrees of Freedom)',
          'Sublimation Curve ∩ Fusion Curve ∩ Vaporization Curve = (0.01 °C, 0.00603 atm)',
          'Universal Temperature Standard: Defined the Kelvin thermodynamic scale prior to 2019 SI redefinition.',
        ],
        keyTerminology: [
          { term: 'Invariant Point', definition: 'State where thermodynamic temperature and pressure are fixed with zero degrees of freedom.' },
          { term: 'Sublimation', definition: 'Direct phase transformation from solid to vapour without passing through a liquid intermediate.' },
        ],
        highlightComponentIds: ['ice-hexagonal-ring', 'liquid-cluster', 'vapor-molecule'],
        recommendedCamera: { position: [3.0, 2.5, 4.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-critical-point',
        index: 4,
        title: 'Stage 5: Critical Point (T = 373.95 °C, P = 217.75 atm) & Supercritical Fluid',
        shortDescription: 'Liquid and vapour densities converge, meniscus vanishes into a homogeneous supercritical fluid.',
        detailedExplanation:
          'As temperature and pressure rise along the vaporization curve, liquid water expands while compressed water vapor becomes denser. ' +
          'At the Critical Point (373.95 °C, 217.75 atm), the densities of liquid and vapor become identical (ρ_c = 0.322 g/cm³). ' +
          'Surface tension drops to zero and the liquid-vapor meniscus vanishes entirely. ' +
          'Supercritical water behaves as a dense, high-temperature non-polar solvent capable of dissolving oils and decomposing persistent organic pollutants.',
        chemicalReactions: [
          'Critical Conditions: T_c = 373.95 °C (647.10 K) · P_c = 217.75 atm (22.06 MPa)',
          'Critical Density: ρ_c = 0.322 g/cm³ · Surface Tension σ = 0 N/m',
          'Supercritical Water Oxidation (SCWO): Destroys hazardous toxic chemical waste',
        ],
        keyTerminology: [
          { term: 'Supercritical Fluid', definition: 'State of matter above critical temperature and pressure with gas-like diffusivity and liquid-like density.' },
          { term: 'Meniscus Disappearance', definition: 'Vanishing of the boundary between liquid and vapor phases as surface tension approaches zero.' },
        ],
        highlightComponentIds: ['supercritical-cluster'],
        recommendedCamera: { position: [0, 2.8, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('ice-hexagonal-ring', {
      id: 'ice-hexagonal-ring',
      name: 'Hexagonal Ice Ih Ring Unit',
      category: 'crystal',
      material: 'Tetrahedrally Coordinated Ice Crystal',
      scientificRole: 'Maintains open crystalline channels resulting in lower density than liquid water.',
      specifications: 'O···O Distance: 2.76 Å · Coordination Number: strictly 4 · Density: 0.917 g/cm³',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('hydrogen-bond-link', {
      id: 'hydrogen-bond-link',
      name: 'Intermolecular Hydrogen Bond (O–H···O)',
      category: 'interaction',
      material: 'Dipole-Dipole Electrostatic & Partial Covalent Bond',
      scientificRole: 'Responsible for anomalously high melting and boiling points of water.',
      specifications: 'Bond Enthalpy: ~21 kJ/mol · Length: 1.77 Å',
      anchorPosition: [0.8, 0.4, 0],
    });

    this.components.set('liquid-cluster', {
      id: 'liquid-cluster',
      name: 'Liquid Water Molecular Cluster',
      category: 'fluid',
      material: 'Fluctuating Dipolar H₂O Fluid',
      scientificRole: 'Dense arrangement with interstitial water molecules occupying former lattice voids.',
      specifications: 'Density: 1.000 g/cm³ at 4 °C · Dynamic Viscosity: 0.89 mPa·s at 25 °C',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('vapor-molecule', {
      id: 'vapor-molecule',
      name: 'Isolated Water Vapour Molecule',
      category: 'gas',
      material: 'Translational Gas Phase H₂O',
      scientificRole: 'Zero permanent intermolecular hydrogen bonds; exhibits high Maxwell-Boltzmann velocities.',
      specifications: 'Dipole Moment: 1.85 Debye · Mean Free Path: ~100 nm at 1 atm',
      anchorPosition: [0, 1.5, 0],
    });

    this.components.set('supercritical-cluster', {
      id: 'supercritical-cluster',
      name: 'Supercritical Water Fluid State',
      category: 'supercritical',
      material: 'Homogeneous High-Density Fluid',
      scientificRole: 'No phase boundary or surface tension; acts as powerful non-polar organic solvent.',
      specifications: 'Dielectric Constant drops from 78 to ~6 · Infinite Miscibility with Gases',
      anchorPosition: [0, 0, 0],
    });
  }

  public setTemperature(tC: number): void {
    this.temperatureC = tC;
    this.recalculatePhase();
    this.buildCurrentState();
  }

  public setPressure(pAtm: number): void {
    this.pressureAtm = pAtm;
    this.recalculatePhase();
    this.buildCurrentState();
  }

  private recalculatePhase(): void {
    const t = this.temperatureC;
    const p = this.pressureAtm;

    if (t > 374 && p > 218) {
      this.currentPhase = 'supercritical';
    } else if (p < 0.006) {
      // Below triple point pressure: either ice or vapor
      this.currentPhase = t < 0.01 ? 'ice' : 'vapor';
    } else {
      // Approximate water phase boundary curves
      // Melting curve: Tm decreases very slightly with P (from 0 °C down to ~-22 °C at 2000 atm)
      const tMelt = 0.0 - 0.0074 * (p - 1.0);
      // Boiling curve: Clausius-Clapeyron approx
      const tBoil = 100 * Math.pow(p, 0.28);

      if (t < tMelt) {
        this.currentPhase = 'ice';
      } else if (t < tBoil) {
        this.currentPhase = 'liquid';
      } else {
        this.currentPhase = 'vapor';
      }
    }
  }

  protected onStageChanged(stageIndex: number): void {
    // Stage defaults align with pedagogy
    switch (stageIndex) {
      case 0:
        this.temperatureC = -15;
        this.pressureAtm = 1.0;
        break;
      case 1:
        this.temperatureC = 25;
        this.pressureAtm = 1.0;
        break;
      case 2:
        this.temperatureC = 120;
        this.pressureAtm = 1.0;
        break;
      case 3:
        this.temperatureC = 0.01;
        this.pressureAtm = 0.006;
        break;
      case 4:
        this.temperatureC = 390;
        this.pressureAtm = 230;
        break;
    }
    this.recalculatePhase();
    this.buildCurrentState();
  }

  protected onModeChanged(_mode: string): void {
    this.buildCurrentState();
  }

  protected onViewModeChanged(_viewMode: string): void {
    this.buildCurrentState();
  }

  private clearGroups(): void {
    const groups = [this.latticeGroup, this.liquidMoleculesGroup, this.vaporGroup, this.hBondsGroup];
    for (const g of groups) {
      g?.clear?.();
    }
    this.waterMolecules = [];
  }

  private buildCurrentState(): void {
    this.clearGroups();

    const stage = this.currentStageIndex;

    if (stage === 0 || this.currentPhase === 'ice') {
      this.buildIceLattice();
    } else if (stage === 1 || this.currentPhase === 'liquid') {
      this.buildLiquidWater();
    } else if (stage === 2 || this.currentPhase === 'vapor') {
      this.buildVaporPhase();
    } else if (stage === 3) {
      this.buildTriplePointCoexistence();
    } else if (stage === 4 || this.currentPhase === 'supercritical') {
      this.buildSupercriticalState();
    }

    this.annotations.add({
      id: 'ann-thermo-state',
      text: `T = ${this.temperatureC.toFixed(1)} °C · P = ${this.pressureAtm.toFixed(3)} atm [${this.currentPhase.toUpperCase()}]`,
      position: new THREE.Vector3(0, 2.5, 0),
      priority: 1,
    });
  }

  // Stage 0: Hexagonal open ice lattice (Ice Ih)
  private buildIceLattice(): void {
    const ringRadius = 1.6;
    const ringNodes: THREE.Vector3[] = [];

    // Build hexagonal ring of water molecules
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const yOffset = (i % 2 === 0 ? 0.35 : -0.35); // Chair-like puckering
      const pos = new THREE.Vector3(ringRadius * Math.cos(angle), yOffset, ringRadius * Math.sin(angle));
      ringNodes.push(pos);

      // Add H2O molecule
      const oAtom = MolecularBuilder.createAtom('O', pos, 0.32, 'ice-hexagonal-ring');
      this.latticeGroup.add(oAtom);

      // Two covalent hydrogens
      const h1Pos = new THREE.Vector3(pos.x + 0.35 * Math.cos(angle + 0.5), pos.y + 0.25, pos.z + 0.35 * Math.sin(angle + 0.5));
      const h2Pos = new THREE.Vector3(pos.x + 0.35 * Math.cos(angle - 0.5), pos.y - 0.25, pos.z + 0.35 * Math.sin(angle - 0.5));
      this.latticeGroup.add(MolecularBuilder.createAtom('H', h1Pos, 0.18, 'ice-hexagonal-ring'));
      this.latticeGroup.add(MolecularBuilder.createAtom('H', h2Pos, 0.18, 'ice-hexagonal-ring'));
      this.latticeGroup.add(MolecularBuilder.createBond(pos, h1Pos, 0.05, 0x94a3b8));
      this.latticeGroup.add(MolecularBuilder.createBond(pos, h2Pos, 0.05, 0x94a3b8));
    }

    // Hydrogen bonds connecting the hexagonal ring (cyan dashed cylinders)
    for (let i = 0; i < 6; i++) {
      const nextIdx = (i + 1) % 6;
      const nodeA = ringNodes[i];
      const nodeB = ringNodes[nextIdx];
      if (nodeA && nodeB) {
        const hBond = MolecularBuilder.createBond(nodeA, nodeB, 0.04, 0x06b6d4);
        hBond.userData = { componentId: 'hydrogen-bond-link' };
        this.hBondsGroup.add(hBond);
      }
    }

    // Add an upper and lower ring layer to emphasize open channels
    const upperCenter = new THREE.Vector3(0, 1.8, 0);
    const upperAtom = MolecularBuilder.createAtom('O', upperCenter, 0.32, 'ice-hexagonal-ring');
    this.latticeGroup.add(upperAtom);
    const firstNode = ringNodes[0];
    if (firstNode) {
      this.hBondsGroup.add(MolecularBuilder.createBond(firstNode, upperCenter, 0.04, 0x06b6d4));
    }

    this.annotations.add({
      id: 'ann-open-channel',
      text: 'Open Hexagonal Channel (Low Density Ice Ih)',
      position: new THREE.Vector3(0, 0, 0),
      priority: 1,
    });
  }

  // Stage 1: Liquid water with dynamic clustering
  private buildLiquidWater(): void {
    const moleculeCount = 18;
    const boxSize = 2.4;

    for (let i = 0; i < moleculeCount; i++) {
      const group = new THREE.Group();
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * boxSize * 2,
        (Math.random() - 0.5) * boxSize * 1.5,
        (Math.random() - 0.5) * boxSize * 2
      );
      group.position.copy(pos);

      const oMesh = MolecularBuilder.createAtom('O', new THREE.Vector3(0, 0, 0), 0.28, 'liquid-cluster');
      const h1Mesh = MolecularBuilder.createAtom('H', new THREE.Vector3(0.28, 0.22, 0), 0.16, 'liquid-cluster');
      const h2Mesh = MolecularBuilder.createAtom('H', new THREE.Vector3(-0.28, 0.22, 0), 0.16, 'liquid-cluster');
      group.add(oMesh);
      group.add(h1Mesh);
      group.add(h2Mesh);
      group.add(MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.28, 0.22, 0), 0.04, 0x94a3b8));
      group.add(MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.28, 0.22, 0), 0.04, 0x94a3b8));

      this.liquidMoleculesGroup.add(group);

      this.waterMolecules.push({
        mesh: group,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8),
        basePos: pos.clone(),
      });
    }

    // Connect close neighbors with dynamic hydrogen bonds
    for (let i = 0; i < this.waterMolecules.length; i++) {
      const molI = this.waterMolecules[i];
      if (!molI) continue;
      for (let j = i + 1; j < this.waterMolecules.length; j++) {
        const molJ = this.waterMolecules[j];
        if (!molJ) continue;
        const dist = molI.basePos.distanceTo(molJ.basePos);
        if (dist < 1.4) {
          const hb = MolecularBuilder.createBond(molI.basePos, molJ.basePos, 0.03, 0x06b6d4);
          this.hBondsGroup.add(hb);
        }
      }
    }
  }

  // Stage 2: Water Vapour in rapid kinetic motion
  private buildVaporPhase(): void {
    const vaporCount = 10;
    const boxSize = 3.2;

    for (let i = 0; i < vaporCount; i++) {
      const group = new THREE.Group();
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * boxSize * 2,
        (Math.random() - 0.5) * boxSize * 1.5,
        (Math.random() - 0.5) * boxSize * 2
      );
      group.position.copy(pos);

      const oMesh = MolecularBuilder.createAtom('O', new THREE.Vector3(0, 0, 0), 0.26, 'vapor-molecule');
      const h1Mesh = MolecularBuilder.createAtom('H', new THREE.Vector3(0.26, 0.2, 0), 0.15, 'vapor-molecule');
      const h2Mesh = MolecularBuilder.createAtom('H', new THREE.Vector3(-0.26, 0.2, 0), 0.15, 'vapor-molecule');
      group.add(oMesh);
      group.add(h1Mesh);
      group.add(h2Mesh);

      this.vaporGroup.add(group);

      this.waterMolecules.push({
        mesh: group,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 3.5),
        basePos: pos.clone(),
      });
    }
  }

  // Stage 3: Triple point coexistence (Solid on bottom left, liquid in center, vapor above)
  private buildTriplePointCoexistence(): void {
    this.buildIceLattice();
    this.latticeGroup.position.set(-2.0, -1.0, 0);

    // Liquid droplet in center
    const dropGeo = new THREE.SphereGeometry(1.0, 24, 24);
    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      transmission: 0.7,
      ior: 1.333,
    });
    const droplet = new THREE.Mesh(dropGeo, dropMat);
    droplet.position.set(0.8, -0.6, 0);
    droplet.userData = { componentId: 'liquid-cluster' };
    this.liquidMoleculesGroup.add(droplet);

    // Vapor molecules hovering at top
    for (let i = 0; i < 5; i++) {
      const vPos = new THREE.Vector3((i - 2) * 1.0, 1.8 + Math.sin(i) * 0.4, 0);
      const vMol = MolecularBuilder.createAtom('O', vPos, 0.22, 'vapor-molecule');
      this.vaporGroup.add(vMol);
    }

    this.annotations.add({
      id: 'ann-triple-equil',
      text: 'Triple Point Coexistence: Solid + Liquid + Vapor in Equilibrium',
      position: new THREE.Vector3(0, 0, 1.5),
      priority: 1,
    });
  }

  // Stage 4: Supercritical state (homogeneous supercritical fluid with gold shimmer)
  private buildSupercriticalState(): void {
    const scCount = 28;
    const boxSize = 2.6;

    for (let i = 0; i < scCount; i++) {
      const group = new THREE.Group();
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * boxSize * 2,
        (Math.random() - 0.5) * boxSize * 1.6,
        (Math.random() - 0.5) * boxSize * 2
      );
      group.position.copy(pos);

      // Gold-orange coloration indicating supercritical state
      const oMesh = MolecularBuilder.createAtom('O', new THREE.Vector3(0, 0, 0), 0.26, 'supercritical-cluster');
      group.add(oMesh);
      this.liquidMoleculesGroup.add(group);

      this.waterMolecules.push({
        mesh: group,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.2),
        basePos: pos.clone(),
      });
    }

    this.annotations.add({
      id: 'ann-sc-fluid',
      text: 'Supercritical Water: No Meniscus (Liquid Density + Gas Diffusivity)',
      position: new THREE.Vector3(0, 0, 1.5),
      priority: 1,
    });
  }

  protected updateSimulation(delta: number): void {
    if (this.isPlaying && this.waterMolecules.length > 0) {
      const bounds = 2.8;
      for (const mol of this.waterMolecules) {
        mol.mesh.position.addScaledVector(mol.velocity, delta * this.playbackSpeed);

        // Elastic box boundary reflection
        if (Math.abs(mol.mesh.position.x) > bounds) mol.velocity.x *= -1;
        if (Math.abs(mol.mesh.position.y) > bounds * 0.8) mol.velocity.y *= -1;
        if (Math.abs(mol.mesh.position.z) > bounds) mol.velocity.z *= -1;
      }
    }
  }
}
