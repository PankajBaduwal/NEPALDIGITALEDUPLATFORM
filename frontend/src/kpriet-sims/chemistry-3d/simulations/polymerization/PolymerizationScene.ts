/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 5: Polymerization at the Molecular Scale
 *
 * Demonstrates:
 * - Monomer activation and reactive double bonds (C=C π-cleavage)
 * - Free-radical addition polymerization (Initiation, Propagation, Termination)
 * - Condensation / Step-growth polymerization (Nylon-6,6 with eliminated H₂O byproducts)
 * - Chain architectures: Linear (HDPE) vs Branched (LDPE) vs Cross-linked network (Thermosets / Bakelite)
 * - Tacticity: Isotactic vs Syndiotactic vs Atactic stereochemical arrangements
 * - Direct connection between molecular microstructure and macroscopic thermomechanical properties (Tg, Tm, modulus)
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';
import { MolecularBuilder } from '../../core/MolecularBuilder';
import { OrbitalsRenderer } from '../../core/OrbitalsRenderer';

export type PolymerType = 'addition' | 'condensation';
export type TacticityMode = 'isotactic' | 'syndiotactic' | 'atactic';

export class PolymerizationScene extends BaseSimulation {
  private monomersGroup = new THREE.Group();
  private polymerChainsGroup = new THREE.Group();
  private byproductsGroup = new THREE.Group();
  private crosslinksGroup = new THREE.Group();

  // Interactive parameters
  private activePolymerType: PolymerType = 'addition';
  private repeatUnits = 8;
  private tacticity: TacticityMode = 'isotactic';
  private crosslinkDensity = 0.05; // 5%

  public get polymerType(): PolymerType {
    return this.activePolymerType;
  }

  public get density(): number {
    return this.crosslinkDensity;
  }

  // Animation state
  private growthProgress = 0.0;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.monomersGroup = this.monomersGroup || new THREE.Group();
    this.polymerChainsGroup = this.polymerChainsGroup || new THREE.Group();
    this.byproductsGroup = this.byproductsGroup || new THREE.Group();
    this.crosslinksGroup = this.crosslinksGroup || new THREE.Group();

    this.scene.add(this.monomersGroup);
    this.scene.add(this.polymerChainsGroup);
    this.scene.add(this.byproductsGroup);
    this.scene.add(this.crosslinksGroup);

    this.buildCurrentStageView();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-monomer-activation',
        index: 0,
        title: 'Stage 1: Monomer Structure & Reactive Double Bond (C=C π-Cleavage)',
        shortDescription: 'Examine ethylene and vinyl monomers with reactive π-bonds ready for radical addition.',
        detailedExplanation:
          'Addition polymers originate from unsaturated vinyl monomers (CH₂=CH–R). The carbon-carbon double bond consists of a strong σ bond (347 kJ/mol) ' +
          'and a weaker, exposed π bond (267 kJ/mol). An initiator radical (R•) attacks the π-electron cloud, homolytically cleaving the π bond ' +
          'and generating a new reactive alkyl radical at the monomer terminus.',
        chemicalReactions: [
          'Initiator Activation: R–O–O–R (heat/UV) → 2 RO• (Benzoyl Peroxide / AIBN)',
          'Chain Initiation: RO• + CH₂=CH–R → RO–CH₂–ĊH–R (Active Chain Radical)',
        ],
        keyTerminology: [
          { term: 'Monomer', definition: 'Low molecular weight unsaturated molecule capable of repeated addition to form high polymers.' },
          { term: 'Homolytic Cleavage', definition: 'Symmetric bond breaking where each bonding partner retains one electron to form free radicals.' },
        ],
        highlightComponentIds: ['monomer-core', 'pi-double-bond', 'initiator-radical'],
        recommendedCamera: { position: [0, 2.5, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-chain-propagation',
        index: 1,
        title: 'Stage 2: Free-Radical Chain Growth Propagation',
        shortDescription: 'Active macroradical repeatedly adds incoming monomers in microsecond cascades.',
        detailedExplanation:
          'During propagation, the macroradical terminus successively attacks incoming monomer molecules. Each addition extends the continuous ' +
          'carbon-carbon backbone by two carbon atoms while transferring the unpaired radical electron to the new chain tip. ' +
          'This rapid addition occurs at rates of thousands of monomer additions per second without producing any small-molecule byproducts.',
        chemicalReactions: [
          'RO–(CH₂–CHR)_n–CH₂–ĊH–R + CH₂=CHR → RO–(CH₂–CHR)_(n+1)–CH₂–ĊH–R',
          'Propagation Rate: R_p = k_p [M•][M]',
          'Typical Lifetime of Active Radical: 10⁻³ to 10⁻¹ seconds',
        ],
        keyTerminology: [
          { term: 'Propagation', definition: 'Successive addition of monomer units to a growing active chain center.' },
          { term: 'Degree of Polymerization (DP)', definition: 'Average number of repeat units in the macromolecular chain (DP = M_n / M_0).' },
        ],
        highlightComponentIds: ['growing-chain-tip', 'backbone-carbon'],
        recommendedCamera: { position: [0, 3.0, 6.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-condensation-polymerization',
        index: 2,
        title: 'Stage 3: Condensation (Step-Growth) Polymerization & H₂O Elimination',
        shortDescription: 'Difunctional monomers form amide/ester linkages with release of stoichiometric water byproducts.',
        detailedExplanation:
          'Unlike addition polymers, condensation (step-growth) polymerization proceeds between difunctional monomers possessing reactive end-groups. ' +
          'For Nylon-6,6, adipic acid (dicarboxylic acid) reacts with hexamethylenediamine (diamine). ' +
          'Each peptide/amide link (–CO–NH–) eliminates one water molecule (H₂O). Chain growth occurs between any molecular sizes (monomers, dimers, oligomers).',
        chemicalReactions: [
          'n HOOC–(CH₂)₄–COOH + n H₂N–(CH₂)₆–NH₂ → [–CO–(CH₂)₄–CO–NH–(CH₂)₆–NH–]_n + 2n H₂O',
          'Carothers Equation: X_n = 1 / (1 - p) (where p = fractional functional group conversion)',
        ],
        keyTerminology: [
          { term: 'Step-Growth', definition: 'Polymerization mechanism where chains grow by reaction between any two molecular species present in the medium.' },
          { term: 'Byproduct Elimination', definition: 'Stoichiometric release of small volatile molecules (H₂O, HCl, CH₃OH) during condensation.' },
        ],
        highlightComponentIds: ['amide-linkage', 'water-byproduct'],
        recommendedCamera: { position: [0, 2.8, 5.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-chain-tacticity',
        index: 3,
        title: 'Stage 4: Polymer Tacticity (Isotactic, Syndiotactic, Atactic)',
        shortDescription: 'Spatial arrangement of pendant groups (–CH₃, –Cl, –Ph) along the zigzag carbon backbone.',
        detailedExplanation:
          'Tacticity describes the stereochemical regularity of chiral carbon centers along a vinyl polymer chain. ' +
          'In Isotactic polymers (Ziegler-Natta catalyzed), all substituents lie on the same side of the backbone, enabling close packing into dense crystalline lattices with high melting points (e.g. i-PP Tm = 165 °C). ' +
          'In Syndiotactic polymers, substituents alternate regularly. In Atactic polymers (free-radical), random orientations prevent crystallization, yielding soft amorphous glasses.',
        chemicalReactions: [
          'Isotactic: All (R) or all (S) stereocenters → High Crystallinity (~65%), Tm = 165 °C',
          'Syndiotactic: Alternating (R,S,R,S) → Moderate Crystallinity, Tm = 130 °C',
          'Atactic: Random configuration → Amorphous (0% Crystallinity), Tg = -10 °C (Rubber/Wax)',
        ],
        keyTerminology: [
          { term: 'Isotactic', definition: 'All pendant substituents positioned on the same stereochemical side of the planar zigzag backbone.' },
          { term: 'Syndiotactic', definition: 'Pendant substituents strictly alternating above and below the chain backbone.' },
          { term: 'Atactic', definition: 'Random spatial distribution of pendant groups causing complete loss of stereoregularity.' },
        ],
        highlightComponentIds: ['pendant-substituent', 'backbone-carbon'],
        recommendedCamera: { position: [2.5, 2.5, 4.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-crosslinked-networks',
        index: 4,
        title: 'Stage 5: Architecture — Linear vs Branched vs Cross-Linked Thermosets',
        shortDescription: 'Compare thermoplastic linear meltable chains with irreversible 3D covalent thermoset networks.',
        detailedExplanation:
          'Macroscopic polymer behaviour is fundamentally governed by molecular architecture. ' +
          'Linear polymers (HDPE) slide past one another above their glass transition/melting temperature, rendering them recyclable thermoplastics. ' +
          'Cross-linked networks (Bakelite, vulcanized rubber, epoxy resins) contain permanent covalent bridges linking chains into a continuous single giant macromolecule. ' +
          'They cannot melt or dissolve, decomposing only at extreme temperatures (Thermosets).',
        chemicalReactions: [
          'Linear HDPE: Density 0.96 g/cm³ · Modulus 1.1 GPa · Recyclable Resin Code #2',
          'Thermoset Bakelite: Phenol + Formaldehyde 3D cross-linked resin · Rigid & Non-melting',
          'Vulcanization: Polyisoprene + Sulfur (S₈) → Disulfide bridges (–C–S_x–C–)',
        ],
        keyTerminology: [
          { term: 'Thermoplastic', definition: 'Linear or branched polymer that softens reversibly on heating and hardens on cooling.' },
          { term: 'Thermoset', definition: 'Polymer network cured permanently into an infusible, insoluble 3D network through covalent cross-links.' },
          { term: 'Gel Point', definition: 'Critical conversion where an infinite covalent 3D network first spans the macroscopic reactor volume.' },
        ],
        highlightComponentIds: ['crosslink-bridge', 'polymer-chain-a', 'polymer-chain-b'],
        recommendedCamera: { position: [3.5, 3.5, 5.5], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('monomer-core', {
      id: 'monomer-core',
      name: 'Vinyl Monomer (Ethylene / Propylene)',
      category: 'monomer',
      material: 'Unsaturated Hydrocarbon (H₂C=CH–R)',
      scientificRole: 'Building block containing high electron-density sp² π-system ready for radical addition.',
      specifications: 'Bond Length C=C: 1.34 Å · π-Bond Energy: 267 kJ/mol',
      anchorPosition: [-2.0, 0, 0],
    });

    this.components.set('pi-double-bond', {
      id: 'pi-double-bond',
      name: 'Reactive π-Bond Cloud',
      category: 'bond',
      material: 'Lateral 2p-2p Electron Cloud',
      scientificRole: 'Undergoes homolytic cleavage when attacked by initiating or propagating free radicals.',
      specifications: 'Cleavage Energy: ~267 kJ/mol',
      anchorPosition: [-2.0, 0.4, 0],
    });

    this.components.set('initiator-radical', {
      id: 'initiator-radical',
      name: 'Peroxide Initiator Radical (RO•)',
      category: 'initiator',
      material: 'Oxygen-Centered Free Radical',
      scientificRole: 'Attacks monomer double bond to start the chain growth cascade.',
      specifications: 'Unpaired Spin: S = 1/2 · Electrophilic Free Radical',
      anchorPosition: [-3.2, 0.5, 0],
    });

    this.components.set('backbone-carbon', {
      id: 'backbone-carbon',
      name: 'Planar Zigzag sp³ Carbon Backbone',
      category: 'chain',
      material: 'Covalent C–C Single Bond Chain',
      scientificRole: 'Provides mechanical tensile strength along the macromolecular axis.',
      specifications: 'C–C Bond Length: 1.54 Å · C–C–C Angle: 109.5°',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('pendant-substituent', {
      id: 'pendant-substituent',
      name: 'Pendant Group (–CH₃ / –Cl / –Ph)',
      category: 'substituent',
      material: 'Methyl / Chloride / Phenyl Group',
      scientificRole: 'Determines chain stiffness, intermolecular interactions, and stereochemical tacticity.',
      specifications: 'Stereochemistry: Governs Crystallinity and Glass Transition (Tg)',
      anchorPosition: [0.5, 0.8, 0],
    });

    this.components.set('amide-linkage', {
      id: 'amide-linkage',
      name: '–CO–NH– Amide (Peptide) Linkage',
      category: 'linkage',
      material: 'Planar Resonance-Stabilized Carbonyl-Nitrogen Link',
      scientificRole: 'Forms interchain hydrogen bonds (–N–H···O=C–) imparting high tensile strength to Nylon.',
      specifications: 'H-Bond Energy: ~20 kJ/mol · Partial Double Bond Character',
      anchorPosition: [0, 0.3, 0],
    });

    this.components.set('water-byproduct', {
      id: 'water-byproduct',
      name: 'Eliminated Water Molecule (H₂O)',
      category: 'byproduct',
      material: 'Condensation Byproduct',
      scientificRole: 'Must be continuously removed under vacuum in industrial reactors to drive Carothers equilibrium forward.',
      specifications: 'Molecular Weight: 18.015 g/mol · Enthalpy of Vaporization: 40.7 kJ/mol',
      anchorPosition: [1.2, 1.5, 0],
    });

    this.components.set('crosslink-bridge', {
      id: 'crosslink-bridge',
      name: 'Covalent Cross-Link Bridge (–CH₂– / –S_x–)',
      category: 'crosslink',
      material: 'Permanent Interchain Covalent Bond',
      scientificRole: 'Binds individual macromolecular chains into an insoluble, non-melting 3D network.',
      specifications: 'Network Modulus: G = ρRT / M_c · Prevents plastic flow',
      anchorPosition: [0, 1.2, 0],
    });
  }

  protected onStageChanged(_stageIndex: number): void {
    this.growthProgress = 0.0;
    this.buildCurrentStageView();
  }

  protected onModeChanged(_mode: string): void {
    this.buildCurrentStageView();
  }

  protected onViewModeChanged(_viewMode: string): void {
    this.buildCurrentStageView();
  }

  public setRepeatUnits(count: number): void {
    this.repeatUnits = Math.max(4, Math.min(20, count));
    this.buildCurrentStageView();
  }

  public setTacticity(tacticity: TacticityMode): void {
    this.tacticity = tacticity;
    this.buildCurrentStageView();
  }

  public setCrosslinkDensity(density: number): void {
    this.crosslinkDensity = density;
    this.buildCurrentStageView();
  }

  private clearGroups(): void {
    const groups = [this.monomersGroup, this.polymerChainsGroup, this.byproductsGroup, this.crosslinksGroup];
    for (const g of groups) {
      g?.clear?.();
    }
  }

  private buildCurrentStageView(): void {
    this.clearGroups();

    const stage = this.currentStageIndex;

    switch (stage) {
      case 0:
        this.buildMonomerActivation();
        break;
      case 1:
        this.buildChainPropagation();
        break;
      case 2:
        this.buildCondensationPolymerization();
        break;
      case 3:
        this.buildTacticityView();
        break;
      case 4:
        this.buildCrosslinkedNetwork();
        break;
      default:
        this.buildMonomerActivation();
        break;
    }
  }

  // Stage 0: Isolated Monomers and Initiator Radical
  private buildMonomerActivation(): void {
    // Radical RO• initiator on left
    const roPos = new THREE.Vector3(-3.2, 0.4, 0);
    this.monomersGroup.add(MolecularBuilder.createAtom('O', roPos, 0.32, 'initiator-radical'));
    const rGroupPos = new THREE.Vector3(-4.0, 0.4, 0);
    this.monomersGroup.add(MolecularBuilder.createAtom('C', rGroupPos, 0.28, 'initiator-radical'));
    this.monomersGroup.add(MolecularBuilder.createBond(rGroupPos, roPos, 0.08, 0xef4444));

    // Radical electron dot (neon yellow)
    const radDotGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const radDotMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const radDot = new THREE.Mesh(radDotGeo, radDotMat);
    radDot.position.set(-3.0, 0.75, 0);
    this.monomersGroup.add(radDot);

    // Monomer 1 (Propylene): CH2 = CH(CH3)
    const c1 = new THREE.Vector3(-1.2, 0, 0);
    const c2 = new THREE.Vector3(0.1, 0, 0);
    const c3 = new THREE.Vector3(0.8, 1.0, 0); // Methyl pendant

    this.monomersGroup.add(MolecularBuilder.createAtom('C', c1, 0.32, 'monomer-core'));
    this.monomersGroup.add(MolecularBuilder.createAtom('C', c2, 0.32, 'monomer-core'));
    this.monomersGroup.add(MolecularBuilder.createAtom('C', c3, 0.30, 'pendant-substituent'));

    // C=C double bond (two cylinders)
    this.monomersGroup.add(MolecularBuilder.createBond(new THREE.Vector3(c1.x, c1.y + 0.07, c1.z), new THREE.Vector3(c2.x, c2.y + 0.07, c2.z), 0.06, 0x475569));
    this.monomersGroup.add(MolecularBuilder.createBond(new THREE.Vector3(c1.x, c1.y - 0.07, c1.z), new THREE.Vector3(c2.x, c2.y - 0.07, c2.z), 0.06, 0x475569));
    // C2 - C3 single bond
    this.monomersGroup.add(MolecularBuilder.createBond(c2, c3, 0.07, 0x64748b));

    // π-electron cloud lobes on C1 and C2
    const pi1 = OrbitalsRenderer.createPOrbital('y', 0.8);
    pi1.position.copy(c1);
    const pi2 = OrbitalsRenderer.createPOrbital('y', 0.8);
    pi2.position.copy(c2);
    this.monomersGroup.add(pi1);
    this.monomersGroup.add(pi2);

    // Incoming attack arrow from radical to C1
    const arrow = MolecularBuilder.createCurvedArrow(roPos, c1, 0.6, 0xec4899);
    this.monomersGroup.add(arrow);

    this.annotations.add({
      id: 'ann-monomer',
      text: 'Propylene Monomer (CH₂=CH–CH₃ with π cloud)',
      position: new THREE.Vector3(-0.5, 1.6, 0),
      priority: 1,
    });
    this.annotations.add({
      id: 'ann-initiator',
      text: 'RO• Initiator Radical (Homolytic attack)',
      position: new THREE.Vector3(-3.2, 1.3, 0),
      priority: 1,
    });
  }

  // Stage 1: Free Radical Chain Growth Propagation
  private buildChainPropagation(): void {
    const n = this.repeatUnits;
    const carbonStepX = 0.85;
    const carbonStepY = 0.55;
    const startX = -((n * carbonStepX) / 2);

    const positions: THREE.Vector3[] = [];

    // Zigzag carbon backbone
    for (let i = 0; i < n * 2; i++) {
      const x = startX + i * carbonStepX;
      const y = (i % 2 === 0 ? 1 : -1) * carbonStepY;
      const z = 0;
      const pos = new THREE.Vector3(x, y, z);
      positions.push(pos);

      const isTip = i === n * 2 - 1;
      const cMesh = MolecularBuilder.createAtom('C', pos, 0.30, isTip ? 'growing-chain-tip' : 'backbone-carbon');
      this.polymerChainsGroup.add(cMesh);

      // Connect to previous carbon
      if (i > 0) {
        const prevPos = positions[i - 1];
        if (prevPos) {
          this.polymerChainsGroup.add(MolecularBuilder.createBond(prevPos, pos, 0.08, 0x475569));
        }
      }

      // Add pendant methyl group on every second carbon (propylene repeat unit)
      if (i % 2 === 1) {
        const pendantPos = new THREE.Vector3(x, y - 0.9, 0);
        this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', pendantPos, 0.28, 'pendant-substituent'));
        this.polymerChainsGroup.add(MolecularBuilder.createBond(pos, pendantPos, 0.07, 0x10b981));
      }
    }

    // Growing chain tip radical dot
    const tipPos = positions[positions.length - 1];
    if (tipPos) {
      const tipRadGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const tipRadMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const tipRadMesh = new THREE.Mesh(tipRadGeo, tipRadMat);
      tipRadMesh.position.set(tipPos.x + 0.35, tipPos.y + 0.35, tipPos.z);
      this.polymerChainsGroup.add(tipRadMesh);

      // Incoming next monomer waiting to attach
      const nextMonomerC1 = new THREE.Vector3(tipPos.x + 1.6, tipPos.y, 0);
      const nextMonomerC2 = new THREE.Vector3(tipPos.x + 2.7, tipPos.y - 0.4, 0);
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', nextMonomerC1, 0.30, 'monomer-core'));
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', nextMonomerC2, 0.30, 'monomer-core'));
      this.polymerChainsGroup.add(MolecularBuilder.createBond(nextMonomerC1, nextMonomerC2, 0.07, 0x475569));

      this.annotations.add({
        id: 'ann-chain-tip',
        text: 'Active Macroradical Tip (~10³ additions/sec)',
        position: new THREE.Vector3(tipPos.x, tipPos.y + 1.0, 0),
        priority: 1,
      });
    }
  }

  // Stage 2: Step-Growth Condensation Polymerization (Nylon-6,6) + H2O byproducts
  private buildCondensationPolymerization(): void {
    const chainLength = 3; // 3 repeat units of Nylon 6,6
    let currentX = -3.8;

    for (let unit = 0; unit < chainLength; unit++) {
      // Adipic acid portion: C(=O) - (CH2)4 - C(=O)
      const cCarbonyl1 = new THREE.Vector3(currentX, 0, 0);
      const o1 = new THREE.Vector3(currentX, 0.85, 0);
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', cCarbonyl1, 0.30, 'amide-linkage'));
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('O', o1, 0.28, 'amide-linkage'));
      this.polymerChainsGroup.add(MolecularBuilder.createBond(cCarbonyl1, o1, 0.07, 0xef4444));

      currentX += 1.0;
      const cAlkyl1 = new THREE.Vector3(currentX, -0.3, 0);
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', cAlkyl1, 0.28, 'backbone-carbon'));
      this.polymerChainsGroup.add(MolecularBuilder.createBond(cCarbonyl1, cAlkyl1, 0.07, 0x475569));

      currentX += 1.0;
      const cCarbonyl2 = new THREE.Vector3(currentX, 0, 0);
      const o2 = new THREE.Vector3(currentX, 0.85, 0);
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', cCarbonyl2, 0.30, 'amide-linkage'));
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('O', o2, 0.28, 'amide-linkage'));
      this.polymerChainsGroup.add(MolecularBuilder.createBond(cCarbonyl2, o2, 0.07, 0xef4444));
      this.polymerChainsGroup.add(MolecularBuilder.createBond(cAlkyl1, cCarbonyl2, 0.07, 0x475569));

      // Amide nitrogen: -NH-
      currentX += 0.9;
      const nPos = new THREE.Vector3(currentX, -0.1, 0);
      const hPos = new THREE.Vector3(currentX, -0.85, 0);
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('N', nPos, 0.30, 'amide-linkage'));
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('H', hPos, 0.18, 'amide-linkage'));
      this.polymerChainsGroup.add(MolecularBuilder.createBond(cCarbonyl2, nPos, 0.08, 0x3b82f6));
      this.polymerChainsGroup.add(MolecularBuilder.createBond(nPos, hPos, 0.05, 0x94a3b8));

      // Hexamethylene segment (CH2)6 portion
      currentX += 0.9;
      const cAmine1 = new THREE.Vector3(currentX, 0.2, 0);
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', cAmine1, 0.28, 'backbone-carbon'));
      this.polymerChainsGroup.add(MolecularBuilder.createBond(nPos, cAmine1, 0.07, 0x475569));

      currentX += 0.9;
    }

    // Eliminate 3 Water molecules hovering above
    const waterCoords = [
      new THREE.Vector3(-2.0, 1.8, 0),
      new THREE.Vector3(0.5, 2.0, 0),
      new THREE.Vector3(2.5, 1.8, 0),
    ];

    for (const w of waterCoords) {
      this.byproductsGroup.add(MolecularBuilder.createAtom('O', w, 0.28, 'water-byproduct'));
      const h1 = new THREE.Vector3(w.x - 0.35, w.y - 0.25, w.z);
      const h2 = new THREE.Vector3(w.x + 0.35, w.y - 0.25, w.z);
      this.byproductsGroup.add(MolecularBuilder.createAtom('H', h1, 0.16, 'water-byproduct'));
      this.byproductsGroup.add(MolecularBuilder.createAtom('H', h2, 0.16, 'water-byproduct'));
      this.byproductsGroup.add(MolecularBuilder.createBond(w, h1, 0.05, 0x94a3b8));
      this.byproductsGroup.add(MolecularBuilder.createBond(w, h2, 0.05, 0x94a3b8));
    }

    this.annotations.add({
      id: 'ann-amide-link',
      text: '–CO–NH– Amide Linkage (Nylon-6,6)',
      position: new THREE.Vector3(-1.0, 0.9, 0),
      priority: 1,
    });
    this.annotations.add({
      id: 'ann-h2o-byproduct',
      text: 'Eliminated H₂O Byproduct (Condensation)',
      position: new THREE.Vector3(0.5, 2.6, 0),
      priority: 1,
    });
  }

  // Stage 3: Stereochemical Tacticity (Isotactic, Syndiotactic, Atactic)
  private buildTacticityView(): void {
    const n = 10;
    const stepX = 0.9;
    const startX = -((n * stepX) / 2);

    for (let i = 0; i < n; i++) {
      const x = startX + i * stepX;
      const y = (i % 2 === 0 ? 0.3 : -0.3);
      const cPos = new THREE.Vector3(x, y, 0);

      this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', cPos, 0.28, 'backbone-carbon'));
      if (i > 0) {
        const prevPos = new THREE.Vector3(startX + (i - 1) * stepX, ((i - 1) % 2 === 0 ? 0.3 : -0.3), 0);
        this.polymerChainsGroup.add(MolecularBuilder.createBond(prevPos, cPos, 0.08, 0x475569));
      }

      // Add stereochemical substituent (-CH3) based on active tacticity
      let zOffset = 0;
      if (this.tacticity === 'isotactic') {
        zOffset = 0.85; // All facing forward (+z)
      } else if (this.tacticity === 'syndiotactic') {
        zOffset = (i % 2 === 0 ? 0.85 : -0.85); // Strictly alternating forward/back
      } else {
        // Atactic (deterministic pseudo-random based on index)
        const pseudoRand = (Math.sin(i * 99.7) > 0 ? 0.85 : -0.85);
        zOffset = pseudoRand;
      }

      const pendantPos = new THREE.Vector3(x, y + 0.6, zOffset);
      this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', pendantPos, 0.26, 'pendant-substituent'));
      this.polymerChainsGroup.add(MolecularBuilder.createBond(cPos, pendantPos, 0.06, 0x10b981));
    }

    const tactName = this.tacticity.charAt(0).toUpperCase() + this.tacticity.slice(1);
    this.annotations.add({
      id: 'ann-tacticity',
      text: `${tactName} Polypropylene (R-group stereoregularity)`,
      position: new THREE.Vector3(0, 1.4, 0),
      priority: 1,
    });
  }

  // Stage 4: Cross-linked 3D network vs Linear chains
  private buildCrosslinkedNetwork(): void {
    const chainCount = 3;
    const pointsPerChain = 8;
    const stepX = 1.0;
    const startX = -((pointsPerChain * stepX) / 2);

    const chainY = [-1.4, 0, 1.4];

    // Build 3 parallel polymer chains
    for (let c = 0; c < chainCount; c++) {
      const yBase = chainY[c] ?? 0;
      for (let i = 0; i < pointsPerChain; i++) {
        const x = startX + i * stepX;
        const y = yBase + (i % 2 === 0 ? 0.2 : -0.2);
        const pos = new THREE.Vector3(x, y, 0);

        this.polymerChainsGroup.add(MolecularBuilder.createAtom('C', pos, 0.26, c === 0 ? 'polymer-chain-a' : 'polymer-chain-b'));
        if (i > 0) {
          const prevPos = new THREE.Vector3(startX + (i - 1) * stepX, yBase + ((i - 1) % 2 === 0 ? 0.2 : -0.2), 0);
          this.polymerChainsGroup.add(MolecularBuilder.createBond(prevPos, pos, 0.07, 0x475569));
        }
      }
    }

    // Add covalent cross-link bridges between Chain 0 and 1, and Chain 1 and 2
    const crosslinkIndices = [2, 5];
    const y0 = chainY[0] ?? -1.4;
    const y1 = chainY[1] ?? 0;
    const y2 = chainY[2] ?? 1.4;
    for (const idx of crosslinkIndices) {
      const x = startX + idx * stepX;
      // Bridge between chain 0 and 1
      const p1 = new THREE.Vector3(x, y0 + (idx % 2 === 0 ? 0.2 : -0.2), 0);
      const p2 = new THREE.Vector3(x, y1 + (idx % 2 === 0 ? 0.2 : -0.2), 0);
      this.crosslinksGroup.add(MolecularBuilder.createBond(p1, p2, 0.10, 0xf59e0b)); // Amber covalent crosslink

      // Bridge between chain 1 and 2 (staggered)
      const x2 = startX + (idx + 1) * stepX;
      const p3 = new THREE.Vector3(x2, y1 + ((idx + 1) % 2 === 0 ? 0.2 : -0.2), 0);
      const p4 = new THREE.Vector3(x2, y2 + ((idx + 1) % 2 === 0 ? 0.2 : -0.2), 0);
      this.crosslinksGroup.add(MolecularBuilder.createBond(p3, p4, 0.10, 0xf59e0b));
    }

    this.annotations.add({
      id: 'ann-crosslink',
      text: 'Covalent Cross-Link Bridges (Thermoset / Infusible 3D Giant Molecule)',
      position: new THREE.Vector3(0, 0, 0.8),
      priority: 1,
    });
  }

  protected updateSimulation(delta: number): void {
    if (this.isPlaying) {
      this.growthProgress = (this.growthProgress + delta * 0.4 * this.playbackSpeed) % 1.0;
    }
  }
}
