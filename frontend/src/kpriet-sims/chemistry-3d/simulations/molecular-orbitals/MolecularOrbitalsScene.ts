/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 1: Molecular Orbitals and Hybridization
 *
 * Visualizes atomic orbitals (s, px, py, pz, d), orbital hybridization (sp, sp², sp³),
 * sigma and pi bonding overlaps, and representative molecules (CH₄, C₂H₄, C₂H₂).
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';
import { OrbitalsRenderer } from '../../core/OrbitalsRenderer';
import { MolecularBuilder } from '../../core/MolecularBuilder';

export class MolecularOrbitalsScene extends BaseSimulation {
  private orbitalsGroup = new THREE.Group();
  private moleculesGroup = new THREE.Group();

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.orbitalsGroup = this.orbitalsGroup || new THREE.Group();
    this.moleculesGroup = this.moleculesGroup || new THREE.Group();
    this.scene.add(this.orbitalsGroup);
    this.scene.add(this.moleculesGroup);

    // Initial default view
    this.buildCurrentView();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-1-atomic',
        index: 0,
        title: 'Stage 1: Isolated Atomic Orbitals (s, px, py, pz, d)',
        shortDescription: 'Inspect foundational atomic orbital wavefunctions with phase coloration.',
        detailedExplanation:
          'Atomic orbitals represent one-electron wavefunctions ψ(r,θ,φ) derived from the Schrödinger equation. ' +
          'The s orbital is spherically symmetric with single phase (+ψ). The three degenerate 2p orbitals (px, py, pz) possess ' +
          'nodal planes passing through the nucleus with alternating phase signs (+ψ cyan, -ψ amber).',
        chemicalReactions: [
          'ψ(2s) = (1/4√2π)(2 - r/a₀) e^(-r/2a₀)',
          'ψ(2p_z) = (1/4√2π)(r/a₀) e^(-r/2a₀) cos(θ)',
        ],
        keyTerminology: [
          { term: 'Wavefunction Phase', definition: 'Mathematical sign (+ or -) of ψ; determines constructive vs destructive interference.' },
          { term: 'Nodal Plane', definition: 'Spatial surface where wavefunction amplitude and electron probability density are strictly zero.' },
        ],
        highlightComponentIds: ['pz-lobe', 'nucleus'],
        recommendedCamera: { position: [0, 2.5, 6.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-2-hybrid',
        index: 1,
        title: 'Stage 2: Linear Combination & Hybridization (sp, sp², sp³)',
        shortDescription: 'Observe constructive combination of s and p wavefunctions forming directional hybrid lobes.',
        detailedExplanation:
          'Hybridization is the mathematical mixing of non-equivalent atomic orbitals on a central atom to minimize electronic repulsion (VSEPR theory). ' +
          'Constructive overlap between s and p lobes produces an enlarged directional major lobe with enhanced bonding overlap capacity, and a diminished minor back-lobe.',
        chemicalReactions: [
          'sp³ = ¼(s + px + py + pz) [Tetrahedral 109.5°]',
          'sp² = ⅓(s + px + py) [Trigonal Planar 120°]',
          'sp  = ½(s + pz) [Linear 180°]',
        ],
        keyTerminology: [
          { term: 'Directionality', definition: 'Concentration of electron probability along bonding internuclear axes.' },
          { term: 'Hybrid Character', definition: 'Ratio of s to p orbital contribution governing bond length, angle, and electronegativity.' },
        ],
        highlightComponentIds: ['sp3-lobe', 'carbon-core'],
        recommendedCamera: { position: [3.5, 2.5, 4.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-3-methane',
        index: 2,
        title: 'Stage 3: Methane (CH₄) — sp³ Tetrahedral σ-Bonding',
        shortDescription: 'Examine 4 identical C(sp³)–H(1s) sigma bonds with 109.47° bond angles.',
        detailedExplanation:
          'Carbon promotes a 2s electron to 2p and hybridizes into four equivalent sp³ orbitals directed towards the corners of a regular tetrahedron. ' +
          'Head-on (axial) overlap with four spherical Hydrogen 1s orbitals forms four localized, high-strength σ(C–H) bonds.',
        chemicalReactions: [
          'C(2s² 2p²) → C*(2s¹ 2p_x¹ 2p_y¹ 2p_z¹) → C[sp³]⁴',
          'Bond Angle: 109° 28\' · Bond Length: 1.09 Å · Bond Dissociation: 439 kJ/mol',
        ],
        keyTerminology: [
          { term: 'Sigma (σ) Bond', definition: 'Covalent bond formed by direct head-on axial overlap with cylindrical symmetry around internuclear axis.' },
          { term: 'Tetrahedral Angle', definition: '109.47° derived from cos(θ) = -1/3 for symmetric sp³ hybridization.' },
        ],
        highlightComponentIds: ['methane-c', 'methane-ch-sigma'],
        recommendedCamera: { position: [3.0, 2.8, 4.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-4-ethene',
        index: 3,
        title: 'Stage 4: Ethene (C₂H₄) — sp² Trigonal Planar & Lateral π-Overlap',
        shortDescription: 'Inspect coplanar σ framework and lateral parallel overlap of unhybridized 2p_z orbitals forming a π bond.',
        detailedExplanation:
          'Each carbon undergoes sp² hybridization, creating three planar lobes at 120°. The remaining unhybridized 2p_z orbital sits strictly perpendicular to the molecular plane. ' +
          'Lateral, parallel overlap of adjacent 2p_z orbitals creates an electron density cloud above and below the internuclear axis, forming the double bond π component.',
        chemicalReactions: [
          'C=C Double Bond = 1 σ(sp²–sp²) + 1 π(2p_z–2p_z)',
          'Rotational Barrier: ~264 kJ/mol (prevents free rotation at room temperature)',
        ],
        keyTerminology: [
          { term: 'Pi (π) Bond', definition: 'Covalent bond formed by lateral (side-by-side) overlap with an electron density nodal plane coincident with the molecular axis.' },
          { term: 'Restricted Rotation', definition: 'Energy required to break π-overlap creates rigid cis/trans stereoisomeric geometry.' },
        ],
        highlightComponentIds: ['ethene-pi-cloud', 'ethene-cc-sigma'],
        recommendedCamera: { position: [0, 4.0, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-5-ethyne',
        index: 4,
        title: 'Stage 5: Ethyne (C₂H₂) — sp Linear Architecture & Cylindrical Dual π-System',
        shortDescription: 'Explore 180° linear geometry with two mutually perpendicular π bonds forming a cylindrical electron sheath.',
        detailedExplanation:
          'Each carbon mixes one 2s and one 2p orbital to form two linear sp hybrids at 180°. ' +
          'Two unhybridized p orbitals (px and py) remain on each carbon atom. Their mutually orthogonal side-by-side overlap produces two independent π bonds, ' +
          'yielding a cylindrical sheath of negative electron density enclosing the carbon-carbon triple bond.',
        chemicalReactions: [
          'C≡C Triple Bond = 1 σ(sp–sp) + 2 π(2p_x, 2p_y)',
          'Bond Length: 1.20 Å · C-H Bond Length: 1.06 Å · Acidity: pKa ~ 25',
        ],
        keyTerminology: [
          { term: 'Orthogonal π Systems', definition: 'Two independent pi bonds oriented at 90° to one another, preventing interaction.' },
          { term: 's-Character Acidity', definition: '50% s-character pulls electrons closer to carbon, stabilizing the conjugate acetylide carbanion.' },
        ],
        highlightComponentIds: ['ethyne-triple-bond', 'ethyne-linear-core'],
        recommendedCamera: { position: [0, 2.0, 5.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-6-antibonding',
        index: 5,
        title: 'Stage 6: Molecular Orbital Theory — Bonding (σ, π) vs Antibonding (σ*, π*)',
        shortDescription: 'Compare constructive interference (low energy) with destructive out-of-phase interference (nodal repulsive plane).',
        detailedExplanation:
          'According to LCAO-MO theory, combination of N atomic orbitals yields N molecular orbitals. ' +
          'In-phase addition (ψ_A + ψ_B) produces bonding MOs with enhanced electron density between nuclei, shielding positively charged cores. ' +
          'Out-of-phase subtraction (ψ_A - ψ_B) creates antibonding MOs with an internuclear node, exposing nuclei to mutual electrostatic repulsion.',
        chemicalReactions: [
          'ψ(σ) = (1/√2)[ψ(1s_A) + ψ(1s_B)]  (Bonding, E < E_AO)',
          'ψ(σ*) = (1/√2)[ψ(1s_A) - ψ(1s_B)] (Antibonding, E > E_AO)',
          'Bond Order = ½ (N_b - N_a)',
        ],
        keyTerminology: [
          { term: 'Constructive Interference', definition: 'Wave amplitudes add, increasing probability |ψ|² between nuclei.' },
          { term: 'Antibonding Node', definition: 'Plane of zero electron density between atoms that destabilizes the diatomic system.' },
        ],
        highlightComponentIds: ['mo-bonding', 'mo-antibonding-node'],
        recommendedCamera: { position: [0, 2.5, 6.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('nucleus', {
      id: 'nucleus',
      name: 'Atomic Nucleus',
      category: 'atomic',
      material: 'Protons & Neutrons (Z = 6 Carbon)',
      scientificRole: 'Positively charged nuclear core creating electrostatic Coulomb attraction V(r) = -Ze²/4πε₀r.',
      specifications: 'Charge: +6e · Radius: ~2.7 fm',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('pz-lobe', {
      id: 'pz-lobe',
      name: '2p_z Atomic Orbital Lobe',
      category: 'orbital',
      material: 'Electronic Probability Cloud |ψ|²',
      scientificRole: 'Angular component Y₁₀(θ,φ) ∝ cos(θ); exhibits a nodal plane in the xy-plane.',
      specifications: 'Radial Principal Quantum No: n=2, l=1, m_l=0',
      anchorPosition: [0, 0.85, 0],
    });

    this.components.set('sp3-lobe', {
      id: 'sp3-lobe',
      name: 'sp³ Hybrid Orbital Lobe',
      category: 'hybrid',
      material: 'Linear Combination of 2s + 2px + 2py + 2pz',
      scientificRole: 'Directional asymmetric lobe providing maximal orbital overlap along tetrahedral vertices.',
      specifications: 'Composition: 25% s, 75% p · Inter-lobe Angle: 109.47°',
      anchorPosition: [0.75, 0.75, 0.75],
    });

    this.components.set('methane-c', {
      id: 'methane-c',
      name: 'Carbon Central Atom (CH₄)',
      category: 'molecular',
      material: 'Covalent Carbon Core',
      scientificRole: 'Undergoes sp³ hybridization to accommodate four equivalent covalent bonds.',
      specifications: 'Oxidation State: -4 in CH₄ · Electronegativity: 2.55 Pauling',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('methane-ch-sigma', {
      id: 'methane-ch-sigma',
      name: 'C–H σ(sp³–1s) Covalent Bond',
      category: 'bond',
      material: 'Two-Electron Shared Axial Overlap',
      scientificRole: 'Symmetric localized electron density along C–H internuclear vector.',
      specifications: 'Bond Enthalpy: 439 kJ/mol · Length: 1.087 Å',
      anchorPosition: [0.65, 0.65, 0.65],
    });

    this.components.set('ethene-pi-cloud', {
      id: 'ethene-pi-cloud',
      name: 'Lateral π-Bond Electron Cloud',
      category: 'bond',
      material: 'Delocalized π-Electron Density',
      scientificRole: 'Formed by parallel side-by-side overlap of 2p_z orbitals; electron density resides above/below nodal plane.',
      specifications: 'Overlap Integral S_π ≈ 0.25 · Rotational Barrier: 264 kJ/mol',
      anchorPosition: [0, 0.85, 0],
    });

    this.components.set('ethyne-triple-bond', {
      id: 'ethyne-triple-bond',
      name: 'Carbon-Carbon Triple Bond (σ + 2π)',
      category: 'bond',
      material: 'Cylindrical 6-Electron System',
      scientificRole: 'Two orthogonal π systems enclosing axial σ(sp-sp) bond in a continuous negative cylinder.',
      specifications: 'Bond Length: 1.203 Å · Dissociation Energy: 839 kJ/mol',
      anchorPosition: [0, 0, 0],
    });
  }

  protected onStageChanged(_stageIndex: number): void {
    this.buildCurrentView();
  }

  protected onModeChanged(_mode: string): void {
    this.buildCurrentView();
  }

  protected onViewModeChanged(_viewMode: string): void {
    this.buildCurrentView();
  }

  private buildCurrentView(): void {
    // Clear dynamic scene groups
    this.orbitalsGroup?.clear();
    this.moleculesGroup?.clear();

    const stage = this.currentStageIndex;

    // Stage 0: Isolated Atomic Orbitals
    if (stage === 0) {
      // Carbon nucleus at center
      const nucleus = MolecularBuilder.createAtom('C', [0, 0, 0], 0.35);
      this.moleculesGroup.add(nucleus);

      // Show pz and px orbitals
      const pz = OrbitalsRenderer.createPOrbital('z', 1.45);
      const px = OrbitalsRenderer.createPOrbital('x', 1.45);
      const py = OrbitalsRenderer.createPOrbital('y', 1.45);
      this.orbitalsGroup.add(pz, px, py);

      // Coordinate axes
      const axesHelper = new THREE.AxesHelper(2.0);
      this.orbitalsGroup.add(axesHelper);

      this.metrics = {
        'Active Orbital': '2p_x, 2p_y, 2p_z',
        'Principal No (n)': 2,
        'Azimuthal No (l)': 1,
        'Magnetic No (m_l)': '-1, 0, +1',
        'Nodal Planes': 1,
      };
    }
    // Stage 1: Hybridization Transformation (sp³)
    else if (stage === 1) {
      const nucleus = MolecularBuilder.createAtom('C', [0, 0, 0], 0.35);
      this.moleculesGroup.add(nucleus);

      const sp3 = OrbitalsRenderer.createHybridOrbitals('sp3');
      this.orbitalsGroup.add(sp3);

      this.metrics = {
        'Hybrid Type': 'sp³ (Tetrahedral)',
        's-Character': '25 %',
        'p-Character': '75 %',
        'Bond Angle': '109.47°',
        'Degeneracy': '4 equivalent lobes',
      };
    }
    // Stage 2: Methane CH₄ Molecule
    else if (stage === 2) {
      const c = MolecularBuilder.createAtom('C', [0, 0, 0], 0.55);
      this.moleculesGroup.add(c);

      const d = 1.35;
      const hPositions: [number, number, number][] = [
        [d, d, d],
        [-d, -d, d],
        [-d, d, -d],
        [d, -d, -d],
      ];

      hPositions.forEach((pos) => {
        const h = MolecularBuilder.createAtom('H', pos, 0.42);
        const bond = MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos), 1, 0.08);
        this.moleculesGroup.add(h, bond);
      });

      // Show semi-transparent sp³ lobes along C-H bonds
      const sp3 = OrbitalsRenderer.createHybridOrbitals('sp3', { opacity: 0.45 });
      this.orbitalsGroup.add(sp3);

      this.metrics = {
        'Molecular Formula': 'CH₄ (Methane)',
        'Geometry': 'Regular Tetrahedral',
        'Symmetry Point Group': 'T_d',
        'C-H Bond Length': '1.087 Å',
        'Dipole Moment': '0.00 D (Non-polar)',
      };
    }
    // Stage 3: Ethene C₂H₄ (sp² + lateral π overlap)
    else if (stage === 3) {
      const c1Pos = new THREE.Vector3(-0.85, 0, 0);
      const c2Pos = new THREE.Vector3(0.85, 0, 0);

      const c1 = MolecularBuilder.createAtom('C', c1Pos, 0.55);
      const c2 = MolecularBuilder.createAtom('C', c2Pos, 0.55);
      const ccSigma = MolecularBuilder.createBond(c1Pos, c2Pos, 1, 0.09);
      this.moleculesGroup.add(c1, c2, ccSigma);

      // Hydrogens on C1
      const h11 = MolecularBuilder.createAtom('H', [-1.65, 0.95, 0], 0.38);
      const h12 = MolecularBuilder.createAtom('H', [-1.65, -0.95, 0], 0.38);
      const b11 = MolecularBuilder.createBond(c1Pos, new THREE.Vector3(-1.65, 0.95, 0), 1, 0.06);
      const b12 = MolecularBuilder.createBond(c1Pos, new THREE.Vector3(-1.65, -0.95, 0), 1, 0.06);

      // Hydrogens on C2
      const h21 = MolecularBuilder.createAtom('H', [1.65, 0.95, 0], 0.38);
      const h22 = MolecularBuilder.createAtom('H', [1.65, -0.95, 0], 0.38);
      const b21 = MolecularBuilder.createBond(c2Pos, new THREE.Vector3(1.65, 0.95, 0), 1, 0.06);
      const b22 = MolecularBuilder.createBond(c2Pos, new THREE.Vector3(1.65, -0.95, 0), 1, 0.06);

      this.moleculesGroup.add(h11, h12, b11, b12, h21, h22, b21, b22);

      // Show lateral π electron cloud above and below the C-C axis
      const piCloud = OrbitalsRenderer.createMolecularOrbital('pi', { opacity: 0.65 });
      this.orbitalsGroup.add(piCloud);

      this.metrics = {
        'Molecular Formula': 'C₂H₄ (Ethene)',
        'Hybridization': 'sp² (Trigonal Planar)',
        'C=C Bond Order': '2.0 (1 σ + 1 π)',
        'H-C-H Angle': '117.4°',
        'Rotational Barrier': '264 kJ/mol',
      };
    }
    // Stage 4: Ethyne C₂H₂ (sp + two orthogonal π systems)
    else if (stage === 4) {
      const c1Pos = new THREE.Vector3(-0.65, 0, 0);
      const c2Pos = new THREE.Vector3(0.65, 0, 0);
      const h1Pos = new THREE.Vector3(-1.75, 0, 0);
      const h2Pos = new THREE.Vector3(1.75, 0, 0);

      const c1 = MolecularBuilder.createAtom('C', c1Pos, 0.52);
      const c2 = MolecularBuilder.createAtom('C', c2Pos, 0.52);
      const h1 = MolecularBuilder.createAtom('H', h1Pos, 0.38);
      const h2 = MolecularBuilder.createAtom('H', h2Pos, 0.38);

      const ccBond = MolecularBuilder.createBond(c1Pos, c2Pos, 3, 0.07);
      const ch1Bond = MolecularBuilder.createBond(c1Pos, h1Pos, 1, 0.06);
      const ch2Bond = MolecularBuilder.createBond(c2Pos, h2Pos, 1, 0.06);

      this.moleculesGroup.add(c1, c2, h1, h2, ccBond, ch1Bond, ch2Bond);

      // Show cylindrical orthogonal π cloud
      const pi1 = OrbitalsRenderer.createMolecularOrbital('pi', { opacity: 0.5 });
      const pi2 = OrbitalsRenderer.createMolecularOrbital('pi', { opacity: 0.5 });
      pi2.rotation.x = Math.PI / 2; // orthogonal 90°
      this.orbitalsGroup.add(pi1, pi2);

      this.metrics = {
        'Molecular Formula': 'C₂H₂ (Ethyne / Acetylene)',
        'Hybridization': 'sp (Linear 180°)',
        'C≡C Bond Length': '1.203 Å',
        'Total π Systems': '2 Orthogonal π Bonds',
        'Terminal pKa': '~25 (Acidic proton)',
      };
    }
    // Stage 5: Bonding vs Antibonding MOs (σ vs σ*)
    else {
      const c1Pos = new THREE.Vector3(-0.9, 0, 0);
      const c2Pos = new THREE.Vector3(0.9, 0, 0);
      const atomA = MolecularBuilder.createAtom('H', c1Pos, 0.35);
      const atomB = MolecularBuilder.createAtom('H', c2Pos, 0.35);
      this.moleculesGroup.add(atomA, atomB);

      // Top: Bonding σ
      const sigmaGroup = OrbitalsRenderer.createMolecularOrbital('sigma', { opacity: 0.75 });
      sigmaGroup.position.y = 1.3;
      // Bottom: Antibonding σ*
      const sigmaStarGroup = OrbitalsRenderer.createMolecularOrbital('sigma_star', { opacity: 0.75 });
      sigmaStarGroup.position.y = -1.3;

      this.orbitalsGroup.add(sigmaGroup, sigmaStarGroup);

      this.metrics = {
        'MO Type Top': 'σ (Bonding, In-Phase +ψ)',
        'MO Type Bottom': 'σ* (Antibonding, Out-of-Phase)',
        'Internuclear Nodal Plane': 'Present in σ* (E > E_AO)',
        'Net Bond Order': '1.0 in H₂ (2 electrons in σ)',
      };
    }

    this.syncAnnotations();
    this.notifyState();
  }

  protected updateSimulation(_delta: number, time: number): void {
    // Gentle natural rotation of isolated atomic orbitals or molecules for enhanced 3D spatial comprehension
    if (this.currentStageIndex === 0 || this.currentStageIndex === 1) {
      this.orbitalsGroup.rotation.y = time * 0.25;
    } else {
      this.orbitalsGroup.rotation.y = 0;
    }
  }
}

export function mountMolecularOrbitalsSimulation(
  container: HTMLElement,
  options?: any
): MolecularOrbitalsScene {
  return new MolecularOrbitalsScene(container, options);
}
