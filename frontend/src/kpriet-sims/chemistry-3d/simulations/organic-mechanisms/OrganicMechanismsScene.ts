/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 2: Organic Reaction Mechanisms (SN1, SN2, E1, E2)
 *
 * Demonstrates:
 * - SN2: Concerted backside attack, [Nu···C···LG]‡ transition state, Walden inversion
 * - SN1: Stepwise unimolecular ionization, planar carbocation intermediate, nucleophilic trapping
 * - E2: Concerted bimolecular elimination, anti-periplanar geometry, simultaneous C=C formation
 * - E1: Stepwise carbocation formation followed by deprotonation to alkene
 * - Electron-flow curved arrows and reaction coordinate energy profiles
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';
import { MolecularBuilder } from '../../core/MolecularBuilder';

export type MechanismType = 'SN2' | 'SN1' | 'E2' | 'E1';

export class OrganicMechanismsScene extends BaseSimulation {
  private substrateGroup = new THREE.Group();
  private nucleophileGroup = new THREE.Group();
  private intermediateGroup = new THREE.Group();
  private arrowsGroup = new THREE.Group();
  private activeMech: MechanismType = 'SN2';

  // Animation interpolation state
  private reactionProgress = 0.0; // 0 to 1

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.substrateGroup = this.substrateGroup || new THREE.Group();
    this.nucleophileGroup = this.nucleophileGroup || new THREE.Group();
    this.intermediateGroup = this.intermediateGroup || new THREE.Group();
    this.arrowsGroup = this.arrowsGroup || new THREE.Group();

    this.scene.add(this.substrateGroup);
    this.scene.add(this.nucleophileGroup);
    this.scene.add(this.intermediateGroup);
    this.scene.add(this.arrowsGroup);

    this.buildCurrentMechanism();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-sn2-backside',
        index: 0,
        title: 'Stage 1: SN2 Bimolecular Substitution — Backside Attack & Walden Inversion',
        shortDescription: 'Concerted 180° backside approach of nucleophile OH⁻ causing simultaneous bond formation and cleavage.',
        detailedExplanation:
          'In the SN2 mechanism, the strongly nucleophilic hydroxide ion (OH⁻) attacks the electrophilic carbon from strictly opposite ' +
          'to the polar C–Br bond (180° trajectory). As the C···O bond begins forming, the C···Br bond lengthens in a single concerted step. ' +
          'The three non-reacting hydrogen substituents pass through a planar transition state, inverting configuration like an umbrella in a gale (Walden Inversion).',
        chemicalReactions: [
          'CH₃Br + OH⁻ → [HO···CH₃···Br]‡ → CH₃OH + Br⁻',
          'Rate = k [CH₃Br][OH⁻] (Second Order Kinetics)',
          'Stereochemistry: 100% Inversion of Configuration',
        ],
        keyTerminology: [
          { term: 'Backside Attack', definition: 'Nucleophile donates electron pair into the empty σ*(C–Br) antibonding molecular orbital at 180°.' },
          { term: 'Pentacoordinate Transition State', definition: 'Trigonal bipyramidal geometry with carbon partially bonded to both nucleophile and leaving group.' },
          { term: 'Walden Inversion', definition: 'Inversion of stereochemical configuration at the chiral or prochiral carbon center.' },
        ],
        highlightComponentIds: ['electrophilic-carbon', 'nucleophile-oh', 'leaving-group-br'],
        recommendedCamera: { position: [0, 2.5, 6.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-sn1-carbocation',
        index: 1,
        title: 'Stage 2: SN1 Unimolecular Substitution — Ionization & Planar Carbocation',
        shortDescription: 'Rate-determining heterolysis to an sp² planar carbocation followed by rapid nucleophilic trapping.',
        detailedExplanation:
          'In tertiary halides such as tert-butyl bromide, steric crowding prevents backside attack. Instead, polar protic solvent assists ' +
          'heterolytic departure of the bromide leaving group in the slow, rate-determining step. The resulting planar, sp²-hybridized carbocation ' +
          'exhibits an empty 2p_z orbital accessible to nucleophiles from both top and bottom faces, yielding racemic mixtures at chiral centers.',
        chemicalReactions: [
          '(CH₃)₃C–Br → [(CH₃)₃C]⁺ + Br⁻  (Slow / Rate-Determining)',
          '[(CH₃)₃C]⁺ + H₂O → (CH₃)₃C–OH + H⁺ (Fast)',
          'Rate = k [(CH₃)₃C–Br] (First Order Kinetics)',
        ],
        keyTerminology: [
          { term: 'Carbocation Intermediate', definition: 'Planar 6-valence-electron species stabilized by hyperconjugation and alkyl inductive effects.' },
          { term: 'Racemization', definition: 'Equal probability attack from front and back faces producing a 50:50 enantiomeric mixture.' },
        ],
        highlightComponentIds: ['tertiary-carbocation', 'leaving-group-br'],
        recommendedCamera: { position: [3.5, 2.0, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-e2-concerted',
        index: 2,
        title: 'Stage 3: E2 Bimolecular Elimination — Anti-Periplanar Geometry',
        shortDescription: 'Strong base abstracts β-proton with simultaneous double bond formation and leaving group expulsion.',
        detailedExplanation:
          'In the E2 elimination, a strong base (e.g. ethoxide EtO⁻) removes a proton from the β-carbon while the leaving group departs from the α-carbon. ' +
          'For effective orbital overlap, the C–H and C–Br bonds must lie in the same plane with a 180° dihedral angle (anti-periplanar conformation). ' +
          'This permits smooth continuous overlap between the breaking σ(C–H) and σ(C–Br) orbitals to generate the new π(C=C) double bond.',
        chemicalReactions: [
          'CH₃–CH(Br)–CH₃ + EtO⁻ → CH₃–CH=CH₂ + EtOH + Br⁻',
          'Rate = k [Alkyl Halide][Base] (Second Order)',
          'Stereoelectronic Requirement: Anti-Periplanar Conformation (θ = 180°)',
        ],
        keyTerminology: [
          { term: 'Anti-Periplanar', definition: 'Conformation where β-hydrogen and α-leaving group lie in the same plane oriented at 180°.' },
          { term: 'Zaitsev\'s Rule', definition: 'Elimination predominantly generates the most highly substituted, thermodynamically stable alkene.' },
        ],
        highlightComponentIds: ['beta-hydrogen', 'leaving-group-br', 'alkene-double-bond'],
        recommendedCamera: { position: [2.5, 3.5, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-e1-stepwise',
        index: 3,
        title: 'Stage 4: E1 Unimolecular Elimination — Carbocation Deprotonation',
        shortDescription: 'Unimolecular ionization followed by base deprotonation of adjacent β-carbon.',
        detailedExplanation:
          'E1 shares its rate-determining step with SN1: unimolecular heterolysis to form a stable carbocation. ' +
          'Under elevated temperatures or with weakly nucleophilic bases, a solvent molecule abstracts a β-proton instead of attacking the positive carbon, ' +
          'collapsing the C–H bonding pair into the empty p-orbital to yield an alkene.',
        chemicalReactions: [
          'Step 1: (CH₃)₃C–Br → [(CH₃)₃C]⁺ + Br⁻ (Rate-Determining)',
          'Step 2: [(CH₃)₃C]⁺ + H₂O → (CH₃)₂C=CH₂ + H₃O⁺ (Fast Deprotonation)',
        ],
        keyTerminology: [
          { term: 'Thermodynamic Control', definition: 'Product distribution governed by alkene relative stability (trans > cis, tetrasubstituted > disubstituted).' },
        ],
        highlightComponentIds: ['tertiary-carbocation'],
        recommendedCamera: { position: [0, 2.8, 5.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('electrophilic-carbon', {
      id: 'electrophilic-carbon',
      name: 'Electrophilic Carbon Center',
      category: 'reaction-center',
      material: 'sp³ Carbon with Partial Positive Charge (δ+)',
      scientificRole: 'Polarized by electronegative bromine (χ = 2.96 vs χ_C = 2.55); target of nucleophilic attack.',
      specifications: 'Net Dipole: ~1.82 D · Hybridization: sp³ → [sp²]‡ → sp³',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('nucleophile-oh', {
      id: 'nucleophile-oh',
      name: 'Hydroxide Nucleophile (OH⁻)',
      category: 'nucleophile',
      material: 'Hard Oxygen Anion with 3 Lone Pairs',
      scientificRole: 'Electron-rich Lewis base that donates electron pair into empty σ* orbital.',
      specifications: 'Charge: -1.0e · Nucleophilicity: High in protic solvents',
      anchorPosition: [-2.2, 0, 0],
    });

    this.components.set('leaving-group-br', {
      id: 'leaving-group-br',
      name: 'Bromide Leaving Group (Br⁻)',
      category: 'leaving-group',
      material: 'Polarizable Halogen Atom',
      scientificRole: 'Departs with the bonding electron pair due to weak C–Br bond (280 kJ/mol) and stable Br⁻ conjugate base.',
      specifications: 'Ionic Radius: 1.96 Å · pKa of HBr: -9.0 (Weak conjugate base = Good leaving group)',
      anchorPosition: [1.8, 0, 0],
    });

    this.components.set('tertiary-carbocation', {
      id: 'tertiary-carbocation',
      name: 'tert-Butyl Carbocation Intermediate',
      category: 'intermediate',
      material: 'Tricoordinate sp² Carbon Cation',
      scientificRole: 'Planar intermediate with empty 2p orbital stabilized by 9 hyperconjugative C–H σ bonds.',
      specifications: 'C–C–C Bond Angles: 120° · Lifetime: ~10⁻⁹ to 10⁻¹² s in polar solvent',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('beta-hydrogen', {
      id: 'beta-hydrogen',
      name: 'β-Hydrogen Atom (Anti-Periplanar)',
      category: 'proton',
      material: 'Acidic C(β)–H Proton',
      scientificRole: 'Abstracted by base; its σ electrons fall into the forming C=C π orbital.',
      specifications: 'Dihedral Angle to Br: 180° · Bond Length: 1.09 Å',
      anchorPosition: [-0.9, 1.2, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) this.activeMech = 'SN2';
    else if (stageIndex === 1) this.activeMech = 'SN1';
    else if (stageIndex === 2) this.activeMech = 'E2';
    else this.activeMech = 'E1';

    this.reactionProgress = 0;
    this.buildCurrentMechanism();
  }

  private buildCurrentMechanism(): void {
    this.substrateGroup?.clear();
    this.nucleophileGroup?.clear();
    this.intermediateGroup?.clear();
    this.arrowsGroup?.clear();

    if (this.activeMech === 'SN2') {
      this.buildSN2State(0);
    } else if (this.activeMech === 'SN1') {
      this.buildSN1State(0);
    } else if (this.activeMech === 'E2') {
      this.buildE2State(0);
    } else {
      this.buildE1State(0);
    }

    this.syncAnnotations();
    this.notifyState();
  }

  private buildSN2State(prog: number): void {
    // prog = 0 (reactants) -> 0.5 (transition state) -> 1.0 (products)
    const cPos = new THREE.Vector3(0, 0, 0);

    // Leaving group Br position: starts at 1.4, departs to 3.2
    const brX = 1.4 + prog * 1.8;
    const brPos = new THREE.Vector3(brX, 0, 0);

    // Nucleophile OH position: approaches from -2.8 to -1.35
    const ohX = -2.8 + prog * 1.45;
    const ohPos = new THREE.Vector3(ohX, 0, 0);

    // Umbrella inversion of 3 hydrogens on Carbon:
    // When prog = 0: H's angle backward (-x)
    // When prog = 0.5: planar (x = 0)
    // When prog = 1.0: H's angle forward (+x, Walden inversion!)
    const hSpread = 1.05;
    const hX = -0.38 + prog * 0.76; // moves from -0.38 to +0.38

    const h1Pos = new THREE.Vector3(hX, hSpread, 0);
    const h2Pos = new THREE.Vector3(hX, -hSpread * 0.5, hSpread * 0.866);
    const h3Pos = new THREE.Vector3(hX, -hSpread * 0.5, -hSpread * 0.866);

    // Draw central Carbon
    const cMesh = MolecularBuilder.createAtom('C', cPos, 0.52);
    // Draw Leaving Group Br
    const brMesh = MolecularBuilder.createAtom('Br', brPos, 0.68);
    // Draw Nucleophile O and H
    const oMesh = MolecularBuilder.createAtom('O', ohPos, 0.5);
    const ohHPos = new THREE.Vector3(ohX - 0.75, 0.45, 0);
    const ohHMesh = MolecularBuilder.createAtom('H', ohHPos, 0.35);
    const ohBond = MolecularBuilder.createBond(ohPos, ohHPos, 1, 0.05);

    // Draw H atoms and bonds
    const h1 = MolecularBuilder.createAtom('H', h1Pos, 0.38);
    const h2 = MolecularBuilder.createAtom('H', h2Pos, 0.38);
    const h3 = MolecularBuilder.createAtom('H', h3Pos, 0.38);

    const b1 = MolecularBuilder.createBond(cPos, h1Pos, 1, 0.06);
    const b2 = MolecularBuilder.createBond(cPos, h2Pos, 1, 0.06);
    const b3 = MolecularBuilder.createBond(cPos, h3Pos, 1, 0.06);

    this.substrateGroup.add(cMesh, brMesh, h1, h2, h3, b1, b2, b3);
    this.nucleophileGroup.add(oMesh, ohHMesh, ohBond);

    // Bonds to C:
    if (prog < 0.85) {
      const cBrBond = MolecularBuilder.createBond(cPos, brPos, 1, 0.065, prog > 0.3 ? 0xf59e0b : 0xcbd5e1);
      this.substrateGroup.add(cBrBond);
    }
    if (prog > 0.15) {
      const cOBond = MolecularBuilder.createBond(cPos, ohPos, 1, 0.065, prog < 0.7 ? 0x06b6d4 : 0xcbd5e1);
      this.substrateGroup.add(cOBond);
    }

    // Curved electron arrow from OH lone pair to Carbon
    if (prog < 0.45) {
      const arrow = MolecularBuilder.createCurvedArrow(ohPos.clone().add(new THREE.Vector3(0, 0.3, 0)), cPos, 0.65, 0x06b6d4);
      this.arrowsGroup.add(arrow);
    }

    this.metrics = {
      'Mechanism': 'SN2 (Concerted Bimolecular Substitution)',
      'Substrate': 'Bromomethane (CH₃Br)',
      'Nucleophile': 'Hydroxide (OH⁻)',
      'Transition State': '[HO···CH₃···Br]‡',
      'Inversion Progress': `${Math.round(prog * 100)} %`,
      'Reaction Barrier ΔG‡': '~78 kJ/mol',
    };
  }

  private buildSN1State(prog: number): void {
    // Tertiary butyl substrate: C(CH3)3-Br
    const cPos = new THREE.Vector3(0, 0, 0);
    const brX = 1.35 + prog * 2.2;
    const brPos = new THREE.Vector3(brX, 0, 0);

    const cMesh = MolecularBuilder.createAtom('C', cPos, 0.55);
    const brMesh = MolecularBuilder.createAtom('Br', brPos, 0.68);
    this.substrateGroup.add(cMesh, brMesh);

    // 3 Methyl groups planarizing from tetrahedral to 120° trigonal planar
    const ang1 = 0, ang2 = (2 * Math.PI) / 3, ang3 = (4 * Math.PI) / 3;
    const r = 1.35;
    const meX = -0.35 * (1 - prog); // planarizes to x = 0

    const m1Pos = new THREE.Vector3(meX, r * Math.sin(ang1), r * Math.cos(ang1));
    const m2Pos = new THREE.Vector3(meX, r * Math.sin(ang2), r * Math.cos(ang2));
    const m3Pos = new THREE.Vector3(meX, r * Math.sin(ang3), r * Math.cos(ang3));

    const m1 = MolecularBuilder.createAtom('C', m1Pos, 0.45);
    const m2 = MolecularBuilder.createAtom('C', m2Pos, 0.45);
    const m3 = MolecularBuilder.createAtom('C', m3Pos, 0.45);

    const b1 = MolecularBuilder.createBond(cPos, m1Pos, 1, 0.08);
    const b2 = MolecularBuilder.createBond(cPos, m2Pos, 1, 0.08);
    const b3 = MolecularBuilder.createBond(cPos, m3Pos, 1, 0.08);

    this.substrateGroup.add(m1, m2, m3, b1, b2, b3);

    if (prog < 0.6) {
      const cBrBond = MolecularBuilder.createBond(cPos, brPos, 1, 0.07);
      this.substrateGroup.add(cBrBond);
    }

    this.metrics = {
      'Mechanism': 'SN1 (Stepwise Unimolecular)',
      'Substrate': 'tert-Butyl Bromide',
      'Intermediate': 'Planar [(CH₃)₃C]⁺ Carbocation',
      'Leaving Group': 'Solvated Bromide (Br⁻)',
      'Carbocation Stability': '3° > 2° > 1° > Methyl',
      'Rate Law': 'Rate = k [R–Br]',
    };
  }

  private buildE2State(prog: number): void {
    // 2-Bromopropane E2 elimination to propene
    const cAlphaPos = new THREE.Vector3(0.65, 0, 0);
    const cBetaPos = new THREE.Vector3(-0.65, 0, 0);

    const cAlpha = MolecularBuilder.createAtom('C', cAlphaPos, 0.52);
    const cBeta = MolecularBuilder.createAtom('C', cBetaPos, 0.52);
    const ccBond = MolecularBuilder.createBond(cBetaPos, cAlphaPos, prog > 0.6 ? 2 : 1, 0.08);

    // Br is down on alpha carbon
    const brY = -1.25 - prog * 1.5;
    const brPos = new THREE.Vector3(0.65, brY, 0);
    const brMesh = MolecularBuilder.createAtom('Br', brPos, 0.65);

    // H is UP on beta carbon (anti-periplanar 180° to Br)
    const hY = 1.15 + prog * 1.2;
    const hPos = new THREE.Vector3(-0.65, hY, 0);
    const hMesh = MolecularBuilder.createAtom('H', hPos, 0.35);

    this.substrateGroup.add(cAlpha, cBeta, ccBond, brMesh, hMesh);

    if (prog < 0.5) {
      const cBrBond = MolecularBuilder.createBond(cAlphaPos, brPos, 1, 0.06);
      const cHBond = MolecularBuilder.createBond(cBetaPos, hPos, 1, 0.06);
      this.substrateGroup.add(cBrBond, cHBond);
    }

    this.metrics = {
      'Mechanism': 'E2 (Concerted Bimolecular Elimination)',
      'Substrate': 'Isopropyl Bromide',
      'Stereo Requirement': 'Anti-Periplanar (θ = 180°)',
      'Product': 'Propene (CH₃–CH=CH₂)',
      'Byproduct': 'Ethanol + Bromide',
    };
  }

  private buildE1State(prog: number): void {
    this.buildSN1State(prog);
    this.metrics['Mechanism'] = 'E1 (Unimolecular Elimination to Alkene)';
    this.metrics['Competes With'] = 'SN1 Substitution at High Temperature';
  }

  protected updateSimulation(_delta: number, time: number): void {
    // Animate reaction progress cyclic ramp 0 -> 1 -> 0
    const cycle = (time * 0.5) % 2.0;
    const prog = cycle <= 1.0 ? cycle : 2.0 - cycle;
    this.reactionProgress = Math.max(0, Math.min(1, prog));

    // Rebuild active mechanism state
    this.substrateGroup?.clear();
    this.nucleophileGroup?.clear();
    this.intermediateGroup?.clear();
    this.arrowsGroup?.clear();

    if (this.activeMech === 'SN2') {
      this.buildSN2State(this.reactionProgress);
    } else if (this.activeMech === 'SN1') {
      this.buildSN1State(this.reactionProgress);
    } else if (this.activeMech === 'E2') {
      this.buildE2State(this.reactionProgress);
    } else {
      this.buildE1State(this.reactionProgress);
    }
  }
}

export function mountOrganicMechanismsSimulation(
  container: HTMLElement,
  options?: any
): OrganicMechanismsScene {
  return new OrganicMechanismsScene(container, options);
}
