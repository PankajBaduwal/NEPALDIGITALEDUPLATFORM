/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 4: Aromaticity and Functional-Group Transformations
 *
 * Demonstrates:
 * - Benzene aromaticity: Planar sp² hexagon, 6 cyclic p_z orbitals, cyclic π delocalization (Hückel 4n+2)
 * - Electrophilic Aromatic Substitution (EAS): Nitration / Halogenation mechanism
 *   (Electrophile attack → Arenium ion / Wheland σ-complex intermediate → Proton loss & aromaticity restoration)
 * - Alcohol and Aldehyde oxidation cascade (Ethanol → Acetaldehyde → Acetic acid)
 * - Diazotization & Azo-Dye Coupling (Aniline → Diazonium salt → Azo dye chromophore)
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';
import { MolecularBuilder } from '../../core/MolecularBuilder';
import { OrbitalsRenderer } from '../../core/OrbitalsRenderer';

export class AromaticReactionsScene extends BaseSimulation {
  private benzeneGroup = new THREE.Group();
  private orbitalsGroup = new THREE.Group();
  private electrophileGroup = new THREE.Group();
  private functionalGroup = new THREE.Group();
  private intermediatesGroup = new THREE.Group();

  // Animation parameters
  private reactionProgress = 0.0;
  private selectedElectrophile: 'NO2+' | 'Br+' | 'SO3' = 'NO2+';

  public get electrophile(): string {
    return this.selectedElectrophile;
  }

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.benzeneGroup = this.benzeneGroup || new THREE.Group();
    this.orbitalsGroup = this.orbitalsGroup || new THREE.Group();
    this.electrophileGroup = this.electrophileGroup || new THREE.Group();
    this.functionalGroup = this.functionalGroup || new THREE.Group();
    this.intermediatesGroup = this.intermediatesGroup || new THREE.Group();

    this.scene.add(this.benzeneGroup);
    this.scene.add(this.orbitalsGroup);
    this.scene.add(this.electrophileGroup);
    this.scene.add(this.functionalGroup);
    this.scene.add(this.intermediatesGroup);

    this.buildCurrentStageView();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-benzene-aromaticity',
        index: 0,
        title: 'Stage 1: Benzene Planar Geometry & Cyclic 6π Delocalization',
        shortDescription: 'Inspect the planar D₆h regular hexagonal ring and cyclic continuous π electron cloud.',
        detailedExplanation:
          'Benzene (C₆H₆) possesses a planar hexagonal carbon ring with sp² hybridization. All six C–C bonds are equivalent (1.399 Å), ' +
          'intermediate between single (1.54 Å) and double (1.34 Å) bonds. Each carbon contributes one unhybridized 2p_z orbital perpendicular to the molecular plane. ' +
          'Lateral cyclic overlap forms a completely delocalized 6-electron π cloud extending above and below the ring plane, fulfilling Hückel’s [4n + 2] rule (n = 1) with extraordinary resonance stabilization energy (~152 kJ/mol).',
        chemicalReactions: [
          'Hückel Rule: 4n + 2 = 6 π electrons (n = 1)',
          'Resonance Energy = ~152 kJ/mol (36 kcal/mol)',
          'C–C Bond Length: 1.399 Å · C–C–C Bond Angle: strictly 120°',
        ],
        keyTerminology: [
          { term: 'Aromaticity', definition: 'Enhanced thermodynamic stability resulting from cyclic, planar, completely conjugated (4n+2) π-electron systems.' },
          { term: 'Delocalized π-Cloud', definition: 'Continuous electron density torus located symmetrically above and below the carbon ring plane.' },
          { term: 'Resonance Energy', definition: 'Energy difference between the real delocalized benzene molecule and hypothetical localized 1,3,5-cyclohexatriene.' },
        ],
        highlightComponentIds: ['benzene-ring-core', 'pi-cloud-upper', 'pi-cloud-lower'],
        recommendedCamera: { position: [0, 3.2, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-eas-electrophile-approach',
        index: 1,
        title: 'Stage 2: Electrophilic Aromatic Substitution (EAS) — Electrophile Approach',
        shortDescription: 'The strong electrophile (NO₂⁺ / Br⁺) coordinates with the electron-dense benzene π-cloud.',
        detailedExplanation:
          'Because benzene has a high concentration of electron density above and below its ring, it acts as a nucleophile toward strong electrophiles. ' +
          'In nitration, nitric acid activated by sulfuric acid generates the linear nitronium ion (NO₂⁺). ' +
          'The electrophile approaches perpendicular to the ring, forming an initial weak electrostatic π-complex.',
        chemicalReactions: [
          'HNO₃ + 2 H₂SO₄ ⇌ NO₂⁺ + H₃O⁺ + 2 HSO₄⁻ (Electrophile Generation)',
          'C₆H₆ + NO₂⁺ → [C₆H₆···NO₂⁺] (π-Complex Formation)',
        ],
        keyTerminology: [
          { term: 'Nitronium Ion (NO₂⁺)', definition: 'Linear electrophilic cation with full positive formal charge on nitrogen (:O=N⁺=O:).' },
          { term: 'π-Complex', definition: 'Weak non-covalent association between electrophile and the aromatic π-electron cloud.' },
        ],
        highlightComponentIds: ['electrophile-species', 'benzene-ring-core'],
        recommendedCamera: { position: [2.5, 3.0, 4.0], target: [0, 0.5, 0] },
      },
      {
        id: 'stage-eas-arenium-intermediate',
        index: 2,
        title: 'Stage 3: Arenium Ion (Wheland Intermediate / σ-Complex)',
        shortDescription: 'Two π-electrons form a C–E bond, creating a non-aromatic carbocation with allylic delocalization.',
        detailedExplanation:
          'The rate-determining step (RDS) involves electrophilic attack where two π-electrons form a new covalent C–NO₂ bond. ' +
          'The attacked carbon converts from planar sp² to tetrahedral sp³. Aromaticity is temporarily disrupted, yielding the high-energy ' +
          'Arenium ion (Wheland σ-complex). The positive charge is resonance-delocalized over the ortho and para positions across the remaining five carbons.',
        chemicalReactions: [
          'C₆H₆ + NO₂⁺ → [C₆H₆(NO₂)]⁺ (Arenium Ion / σ-Complex, Rate-Determining Step)',
          'Resonance: Positive charge distributed at C2, C4, C6 (ortho/para carbons)',
        ],
        keyTerminology: [
          { term: 'Wheland Intermediate (σ-Complex)', definition: 'Non-aromatic cyclohexadienyl cation intermediate with 4 π-electrons delocalized across 5 carbons.' },
          { term: 'Loss of Aromaticity', definition: 'Temporary loss of resonance stabilization requiring high activation energy (ΔG‡).' },
        ],
        highlightComponentIds: ['sp3-carbon', 'arenium-positive-cloud', 'electrophile-bonded'],
        recommendedCamera: { position: [1.5, 2.5, 4.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-eas-aromaticity-restoration',
        index: 3,
        title: 'Stage 4: Deprotonation & Restoration of Aromaticity',
        shortDescription: 'A weak base abstracts the proton from the sp³ carbon, re-establishing the stable 6π aromatic ring.',
        detailedExplanation:
          'Unlike alkenes which undergo electrophilic addition, the arenium intermediate rapidly loses a proton (H⁺) to a weak base (HSO₄⁻ or H₂O). ' +
          'The two electrons from the C–H bond collapse back into the ring system, returning the sp³ carbon to sp² planar hybridization ' +
          'and instantly restoring the thermodynamic stability of the 6π aromatic sextet. The product is nitrobenzene.',
        chemicalReactions: [
          '[C₆H₆(NO₂)]⁺ + HSO₄⁻ → C₆H₅NO₂ + H₂SO₄',
          'Driving Force: Large thermodynamic restoration of ~152 kJ/mol resonance energy.',
        ],
        keyTerminology: [
          { term: 'Proton Abstraction', definition: 'Rapid deprotonation of sp³ ring carbon with C-H σ electrons returning to the π-system.' },
          { term: 'Substitution vs Addition', definition: 'Substitution preserves the stable aromatic ring; addition would permanently destroy aromaticity.' },
        ],
        highlightComponentIds: ['leaving-proton', 'nitrobenzene-product'],
        recommendedCamera: { position: [2.0, 2.8, 4.2], target: [0, 0, 0] },
      },
      {
        id: 'stage-alcohol-oxidation',
        index: 4,
        title: 'Stage 5: Functional-Group Transformations — Alcohol Oxidation Cascade',
        shortDescription: 'Oxidation of Ethanol (primary alcohol) to Acetaldehyde and Acetic Acid.',
        detailedExplanation:
          'Primary alcohols undergo oxidation by removal of two hydrogens (one from oxygen, one α-hydrogen from carbon). ' +
          'Controlled oxidation with Pyridinium Chlorochromate (PCC) yields an aldehyde (Acetaldehyde) without over-oxidation. ' +
          'Strong oxidizers (KMnO₄, CrO₃ / Jones reagent) hydrate the aldehyde to a gem-diol and oxidize it further to a carboxylic acid (Acetic Acid).',
        chemicalReactions: [
          'CH₃CH₂OH + [O] (PCC) → CH₃CHO + H₂O (Primary Alcohol → Aldehyde)',
          'CH₃CHO + [O] (Jones / KMnO₄) → CH₃COOH (Aldehyde → Carboxylic Acid)',
        ],
        keyTerminology: [
          { term: 'α-Hydrogen Abstraction', definition: 'Elimination of C-H bond adjacent to -OH group to generate the carbonyl C=O double bond.' },
          { term: 'Over-Oxidation', definition: 'Unchecked oxidation of intermediate aldehyde hydrate to carboxylic acid by aqueous oxidants.' },
        ],
        highlightComponentIds: ['carbonyl-group', 'hydroxyl-group'],
        recommendedCamera: { position: [0, 2.5, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-diazotization-azodye',
        index: 5,
        title: 'Stage 6: Diazotization & Azo-Dye Coupling Synthesis',
        shortDescription: 'Conversion of primary aromatic amine to Diazonium cation and coupling with 2-Naphthol to form an orange Azo Dye.',
        detailedExplanation:
          'Aniline (C₆H₅NH₂) reacts with nitrous acid (NaNO₂ + HCl) at 0–5 °C to yield Benzene Diazonium Chloride ([C₆H₅N≡N]⁺ Cl⁻). ' +
          'The diazonium cation acts as a weak electrophile and couples with electron-rich phenoxide or 2-naphtholate in alkaline medium. ' +
          'This electrophilic aromatic coupling forms an extended conjugated azo compound containing the –N=N– chromophore, producing brilliant orange/red azo dyes used across textile engineering.',
        chemicalReactions: [
          'C₆H₅NH₂ + NaNO₂ + 2 HCl (0–5°C) → [C₆H₅–N≡N]⁺ Cl⁻ + NaCl + 2 H₂O (Diazotization)',
          '[C₆H₅–N≡N]⁺ + C₁₀H₇O⁻ → C₆H₅–N=N–C₁₀H₆OH (Azo Coupling, Orange Dye)',
        ],
        keyTerminology: [
          { term: 'Diazonium Cation', definition: 'Resonance-stabilized aromatic diazo cation with –N⁺≡N leaving-group precursor.' },
          { term: 'Chromophore', definition: 'Extended conjugated –N=N– azo linkage that absorbs visible light (~480 nm) and reflects vivid color.' },
        ],
        highlightComponentIds: ['azo-chromophore', 'diazonium-group'],
        recommendedCamera: { position: [0, 2.2, 5.8], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('benzene-ring-core', {
      id: 'benzene-ring-core',
      name: 'Benzene Hexagonal Carbon Core',
      category: 'molecular',
      material: 'Planar sp² Hybridized Carbons (D₆h symmetry)',
      scientificRole: 'Rigid planar ring framework with six identical C–C bonds of length 1.399 Å.',
      specifications: 'Resonance Energy: 152 kJ/mol · Angle: 120°',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('pi-cloud-upper', {
      id: 'pi-cloud-upper',
      name: 'Delocalized Upper π-Cloud',
      category: 'orbital',
      material: 'Delocalized Electron Probability Torus',
      scientificRole: 'Continuous ring of constructive wave interference residing 0.7 Å above carbon plane.',
      specifications: 'Electron Population: 3 electrons (upper lobe) · Phase: +ψ',
      anchorPosition: [0, 0.75, 0],
    });

    this.components.set('pi-cloud-lower', {
      id: 'pi-cloud-lower',
      name: 'Delocalized Lower π-Cloud',
      category: 'orbital',
      material: 'Delocalized Electron Probability Torus',
      scientificRole: 'Continuous ring of constructive wave interference residing 0.7 Å below carbon plane.',
      specifications: 'Electron Population: 3 electrons (lower lobe) · Phase: -ψ',
      anchorPosition: [0, -0.75, 0],
    });

    this.components.set('electrophile-species', {
      id: 'electrophile-species',
      name: 'Electrophilic Nitronium Cation (NO₂⁺)',
      category: 'reactive-species',
      material: 'Linear Electron-Deficient Species',
      scientificRole: 'Electron acceptor attacking the electron-rich aromatic π-cloud.',
      specifications: 'Formal Charge: +1 · Geometry: Linear 180° · N–O Length: 1.15 Å',
      anchorPosition: [0, 1.8, 0],
    });

    this.components.set('sp3-carbon', {
      id: 'sp3-carbon',
      name: 'Tetrahedral sp³ Carbon in Arenium Ion',
      category: 'reactive-species',
      material: 'Tetrahedral Intermediate Carbon Center',
      scientificRole: 'Carries both hydrogen and electrophile; interrupts ring conjugation.',
      specifications: 'Hybridization: sp³ · Geometry: Tetrahedral (109.5°)',
      anchorPosition: [0, 0, 1.4],
    });

    this.components.set('arenium-positive-cloud', {
      id: 'arenium-positive-cloud',
      name: 'Wheland Cation Delocalization (C2, C4, C6)',
      category: 'intermediate',
      material: 'Pentadienyl Cationic Conjugated System',
      scientificRole: 'Delocalizes +1 charge over five remaining carbons across ortho/para positions.',
      specifications: 'System: 4 π-electrons over 5 p-orbitals',
      anchorPosition: [0, 0.4, -0.4],
    });

    this.components.set('azo-chromophore', {
      id: 'azo-chromophore',
      name: '–N=N– Azo Chromophore Linkage',
      category: 'chromophore',
      material: 'Conjugated Di-azo Bridge',
      scientificRole: 'Couples two aromatic ring systems, narrowing HOMO-LUMO bandgap to absorb blue light and impart bright orange/red coloration.',
      specifications: 'Absorption λ_max: 485 nm · Transmitted Color: Bright Orange-Red',
      anchorPosition: [0, 0, 0],
    });
  }

  protected onStageChanged(_stageIndex: number): void {
    this.reactionProgress = 0.0;
    this.buildCurrentStageView();
  }

  protected onModeChanged(_mode: string): void {
    this.buildCurrentStageView();
  }

  protected onViewModeChanged(_viewMode: string): void {
    this.buildCurrentStageView();
  }

  public setElectrophile(electrophile: 'NO2+' | 'Br+' | 'SO3'): void {
    this.selectedElectrophile = electrophile;
    this.buildCurrentStageView();
  }

  private clearGroups(): void {
    const groups = [this.benzeneGroup, this.orbitalsGroup, this.electrophileGroup, this.functionalGroup, this.intermediatesGroup];
    for (const g of groups) {
      g?.clear?.();
    }
  }

  private buildCurrentStageView(): void {
    this.clearGroups();

    const stage = this.currentStageIndex;

    switch (stage) {
      case 0:
        this.buildBenzeneAromaticity();
        break;
      case 1:
        this.buildElectrophileApproach();
        break;
      case 2:
        this.buildAreniumIntermediate();
        break;
      case 3:
        this.buildAromaticityRestoration();
        break;
      case 4:
        this.buildAlcoholOxidation();
        break;
      case 5:
        this.buildDiazotizationAzoDye();
        break;
      default:
        this.buildBenzeneAromaticity();
        break;
    }
  }

  // Stage 0: Ground-state Benzene with planar hexagon + π-cloud rings
  private buildBenzeneAromaticity(): void {
    const ringRadius = 1.4;
    const carbonPositions: THREE.Vector3[] = [];
    const hydrogenPositions: THREE.Vector3[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      carbonPositions.push(new THREE.Vector3(ringRadius * Math.cos(angle), 0, ringRadius * Math.sin(angle)));
      hydrogenPositions.push(new THREE.Vector3((ringRadius + 1.0) * Math.cos(angle), 0, (ringRadius + 1.0) * Math.sin(angle)));
    }

    // Carbons and C-C bonds
    for (let i = 0; i < 6; i++) {
      const posC = carbonPositions[i]!;
      const cMesh = MolecularBuilder.createAtom('C', posC, 0.32, 'benzene-ring-core');
      this.benzeneGroup.add(cMesh);

      const nextIdx = (i + 1) % 6;
      const nextPosC = carbonPositions[nextIdx]!;
      const bond = MolecularBuilder.createBond(posC, nextPosC, 0.09, 0x475569);
      this.benzeneGroup.add(bond);

      // C-H bonds and hydrogens
      const hMesh = MolecularBuilder.createAtom('H', hydrogenPositions[i]!, 0.20, 'benzene-h');
      this.benzeneGroup.add(hMesh);
      const chBond = MolecularBuilder.createBond(posC, hydrogenPositions[i]!, 0.05, 0x94a3b8);
      this.benzeneGroup.add(chBond);

      // 6 p_z orbital lobes at each carbon
      const pzGroup = OrbitalsRenderer.createPOrbital('y', 1.0);
      pzGroup.position.copy(posC);
      this.orbitalsGroup.add(pzGroup);
    }

    // Symmetrical delocalized π-electron cloud toruses (upper +ψ cyan, lower -ψ amber)
    const upperTorusGeo = new THREE.TorusGeometry(ringRadius, 0.38, 24, 48);
    const upperTorusMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4, // Cyan
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      transmission: 0.4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.25,
      depthWrite: false,
    });
    const upperTorus = new THREE.Mesh(upperTorusGeo, upperTorusMat);
    upperTorus.rotation.x = Math.PI / 2;
    upperTorus.position.y = 0.65;
    upperTorus.userData = { componentId: 'pi-cloud-upper' };
    this.orbitalsGroup.add(upperTorus);

    const lowerTorusGeo = new THREE.TorusGeometry(ringRadius, 0.38, 24, 48);
    const lowerTorusMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b, // Amber
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      transmission: 0.4,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
      depthWrite: false,
    });
    const lowerTorus = new THREE.Mesh(lowerTorusGeo, lowerTorusMat);
    lowerTorus.rotation.x = Math.PI / 2;
    lowerTorus.position.y = -0.65;
    lowerTorus.userData = { componentId: 'pi-cloud-lower' };
    this.orbitalsGroup.add(lowerTorus);

    this.annotations.add({
      id: 'ann-deloc-cloud',
      text: 'Delocalized 6π Cloud (+ψ / -ψ)',
      position: new THREE.Vector3(0, 1.25, 0),
      priority: 1,
    });
  }

  // Stage 1: Electrophile approaches perpendicular to π-cloud
  private buildElectrophileApproach(): void {
    this.buildBenzeneAromaticity();

    // Nitronium ion (O=N⁺=O) or Bromonium approaching at y = 2.0
    const ePos = new THREE.Vector3(0, 2.2, 0);
    const nAtom = MolecularBuilder.createAtom('N', ePos, 0.32, 'electrophile-species');
    this.electrophileGroup.add(nAtom);

    const o1Pos = new THREE.Vector3(-0.95, 2.2, 0);
    const o2Pos = new THREE.Vector3(0.95, 2.2, 0);
    const o1 = MolecularBuilder.createAtom('O', o1Pos, 0.28, 'electrophile-species');
    const o2 = MolecularBuilder.createAtom('O', o2Pos, 0.28, 'electrophile-species');
    this.electrophileGroup.add(o1);
    this.electrophileGroup.add(o2);

    this.electrophileGroup.add(MolecularBuilder.createBond(ePos, o1Pos, 0.08, 0xef4444));
    this.electrophileGroup.add(MolecularBuilder.createBond(ePos, o2Pos, 0.08, 0xef4444));

    // Curved electron arrow from π-cloud to N+
    const arrow = MolecularBuilder.createCurvedArrow(
      new THREE.Vector3(0, 0.7, 0.5),
      new THREE.Vector3(0, 1.5, 0.2),
      ePos,
      0xec4899,
      0.035
    );
    this.electrophileGroup.add(arrow);

    this.annotations.add({
      id: 'ann-no2-plus',
      text: 'Linear Nitronium Cation (:O=N⁺=O:)',
      position: new THREE.Vector3(0, 2.7, 0),
      priority: 1,
    });
  }

  // Stage 2: Arenium ion (Wheland intermediate)
  private buildAreniumIntermediate(): void {
    const ringRadius = 1.4;
    const carbonPositions: THREE.Vector3[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      carbonPositions.push(new THREE.Vector3(ringRadius * Math.cos(angle), 0, ringRadius * Math.sin(angle)));
    }

    // C1 is the sp³ carbon carrying both H and NO₂
    const c1Pos = carbonPositions[0]!; // (1.4, 0, 0)
    const sp3C = MolecularBuilder.createAtom('C', c1Pos, 0.34, 'sp3-carbon');
    this.intermediatesGroup.add(sp3C);

    // H pointing up-right
    const hPos = new THREE.Vector3(c1Pos.x + 0.65, 0.75, c1Pos.z);
    this.intermediatesGroup.add(MolecularBuilder.createAtom('H', hPos, 0.20, 'leaving-proton'));
    this.intermediatesGroup.add(MolecularBuilder.createBond(c1Pos, hPos, 0.05, 0x94a3b8));

    // NO₂ pointing down-right
    const no2Pos = new THREE.Vector3(c1Pos.x + 0.75, -0.75, c1Pos.z);
    this.intermediatesGroup.add(MolecularBuilder.createAtom('N', no2Pos, 0.30, 'electrophile-bonded'));
    this.intermediatesGroup.add(MolecularBuilder.createBond(c1Pos, no2Pos, 0.08, 0x3b82f6));

    // O atoms on NO2
    const o1 = new THREE.Vector3(no2Pos.x + 0.6, no2Pos.y - 0.4, no2Pos.z + 0.3);
    const o2 = new THREE.Vector3(no2Pos.x + 0.6, no2Pos.y - 0.4, no2Pos.z - 0.3);
    this.intermediatesGroup.add(MolecularBuilder.createAtom('O', o1, 0.26, 'electrophile-bonded'));
    this.intermediatesGroup.add(MolecularBuilder.createAtom('O', o2, 0.26, 'electrophile-bonded'));
    this.intermediatesGroup.add(MolecularBuilder.createBond(no2Pos, o1, 0.07, 0xef4444));
    this.intermediatesGroup.add(MolecularBuilder.createBond(no2Pos, o2, 0.07, 0xef4444));

    // Other 5 carbons form the pentadienyl cation framework
    for (let i = 1; i < 6; i++) {
      const cMesh = MolecularBuilder.createAtom('C', carbonPositions[i]!, 0.32, 'benzene-ring-core');
      this.intermediatesGroup.add(cMesh);

      // Connect bonds
      const prevIdx = i - 1;
      this.intermediatesGroup.add(MolecularBuilder.createBond(carbonPositions[prevIdx]!, carbonPositions[i]!, 0.09, 0x475569));

      // H atoms on C2-C6
      const angle = (i * Math.PI) / 3;
      const hP = new THREE.Vector3((ringRadius + 0.95) * Math.cos(angle), 0, (ringRadius + 0.95) * Math.sin(angle));
      this.intermediatesGroup.add(MolecularBuilder.createAtom('H', hP, 0.20, 'benzene-h'));
      this.intermediatesGroup.add(MolecularBuilder.createBond(carbonPositions[i]!, hP, 0.05, 0x94a3b8));
    }
    // Connect C5 to C0
    this.intermediatesGroup.add(MolecularBuilder.createBond(carbonPositions[5]!, carbonPositions[0]!, 0.09, 0x475569));

    // Horseshoe allylic delocalized cation glow over C2–C6
    const arcCurve = new THREE.CatmullRomCurve3([
      carbonPositions[1]!,
      carbonPositions[2]!,
      carbonPositions[3]!,
      carbonPositions[4]!,
      carbonPositions[5]!,
    ]);
    const tubeGeo = new THREE.TubeGeometry(arcCurve, 32, 0.28, 12, false);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xec4899, // Pink cation resonance
      transparent: true,
      opacity: 0.5,
      roughness: 0.3,
      emissive: 0xdb2777,
      emissiveIntensity: 0.4,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.userData = { componentId: 'arenium-positive-cloud' };
    this.intermediatesGroup.add(tubeMesh);

    this.annotations.add({
      id: 'ann-arenium-cation',
      text: 'Wheland σ-Complex (sp³ C1, + charge delocalized over C2–C6)',
      position: new THREE.Vector3(0, 1.4, 0),
      priority: 1,
    });
  }

  // Stage 3: Restoration of Aromaticity (Nitrobenzene + H+)
  private buildAromaticityRestoration(): void {
    const ringRadius = 1.4;
    const carbonPositions: THREE.Vector3[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      carbonPositions.push(new THREE.Vector3(ringRadius * Math.cos(angle), 0, ringRadius * Math.sin(angle)));
    }

    // Carbons and ring bonds
    for (let i = 0; i < 6; i++) {
      const posC = carbonPositions[i]!;
      const cMesh = MolecularBuilder.createAtom('C', posC, 0.32, 'benzene-ring-core');
      this.benzeneGroup.add(cMesh);

      const nextIdx = (i + 1) % 6;
      this.benzeneGroup.add(MolecularBuilder.createBond(posC, carbonPositions[nextIdx]!, 0.09, 0x475569));

      if (i > 0) {
        const angle = (i * Math.PI) / 3;
        const hP = new THREE.Vector3((ringRadius + 0.95) * Math.cos(angle), 0, (ringRadius + 0.95) * Math.sin(angle));
        this.benzeneGroup.add(MolecularBuilder.createAtom('H', hP, 0.20, 'benzene-h'));
        this.benzeneGroup.add(MolecularBuilder.createBond(posC, hP, 0.05, 0x94a3b8));
      }
    }

    // C1 is attached to NO2 group in plane
    const c1Pos = carbonPositions[0]!;
    const nPos = new THREE.Vector3(c1Pos.x + 1.2, 0, 0);
    this.benzeneGroup.add(MolecularBuilder.createAtom('N', nPos, 0.32, 'nitrobenzene-product'));
    this.benzeneGroup.add(MolecularBuilder.createBond(c1Pos, nPos, 0.09, 0x3b82f6));

    const o1 = new THREE.Vector3(nPos.x + 0.7, 0.6, 0);
    const o2 = new THREE.Vector3(nPos.x + 0.7, -0.6, 0);
    this.benzeneGroup.add(MolecularBuilder.createAtom('O', o1, 0.28, 'nitrobenzene-product'));
    this.benzeneGroup.add(MolecularBuilder.createAtom('O', o2, 0.28, 'nitrobenzene-product'));
    this.benzeneGroup.add(MolecularBuilder.createBond(nPos, o1, 0.08, 0xef4444));
    this.benzeneGroup.add(MolecularBuilder.createBond(nPos, o2, 0.08, 0xef4444));

    // Restored π-rings
    const upperTorusGeo = new THREE.TorusGeometry(ringRadius, 0.35, 20, 40);
    const torusMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981, // Emerald: restored stable aromatic state
      transparent: true,
      opacity: 0.5,
      roughness: 0.2,
      emissive: 0x059669,
      emissiveIntensity: 0.3,
    });
    const upperTorus = new THREE.Mesh(upperTorusGeo, torusMat);
    upperTorus.rotation.x = Math.PI / 2;
    upperTorus.position.y = 0.6;
    this.orbitalsGroup.add(upperTorus);

    // Free H+ leaving to base
    const hPlusPos = new THREE.Vector3(c1Pos.x + 0.8, 1.8, 0.8);
    this.electrophileGroup.add(MolecularBuilder.createAtom('H', hPlusPos, 0.16, 'leaving-proton'));

    this.annotations.add({
      id: 'ann-nitrobenzene',
      text: 'Nitrobenzene (Aromatic sextet fully restored, ΔG = -152 kJ/mol)',
      position: new THREE.Vector3(0, 1.3, 0),
      priority: 1,
    });
  }

  // Stage 4: Alcohol Oxidation Cascade (Ethanol -> Acetaldehyde -> Acetic Acid)
  private buildAlcoholOxidation(): void {
    // Left: Ethanol CH3-CH2-OH
    const c1 = new THREE.Vector3(-3.8, 0, 0);
    const c2 = new THREE.Vector3(-2.6, 0, 0);
    const o1 = new THREE.Vector3(-1.9, 0.8, 0);
    const h1 = new THREE.Vector3(-1.2, 0.8, 0);

    this.functionalGroup.add(MolecularBuilder.createAtom('C', c1, 0.32, 'hydroxyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('C', c2, 0.32, 'hydroxyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('O', o1, 0.28, 'hydroxyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('H', h1, 0.18, 'hydroxyl-group'));
    this.functionalGroup.add(MolecularBuilder.createBond(c1, c2, 0.08, 0x475569));
    this.functionalGroup.add(MolecularBuilder.createBond(c2, o1, 0.08, 0xef4444));
    this.functionalGroup.add(MolecularBuilder.createBond(o1, h1, 0.05, 0x94a3b8));

    // Middle: Acetaldehyde CH3-CHO (PCC oxidation)
    const c3 = new THREE.Vector3(-0.6, 0, 0);
    const c4 = new THREE.Vector3(0.6, 0, 0);
    const o2 = new THREE.Vector3(1.1, 0.9, 0);
    const h2 = new THREE.Vector3(1.1, -0.8, 0);

    this.functionalGroup.add(MolecularBuilder.createAtom('C', c3, 0.32, 'carbonyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('C', c4, 0.32, 'carbonyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('O', o2, 0.28, 'carbonyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('H', h2, 0.18, 'carbonyl-group'));
    this.functionalGroup.add(MolecularBuilder.createBond(c3, c4, 0.08, 0x475569));
    // Carbonyl double bond
    this.functionalGroup.add(MolecularBuilder.createBond(new THREE.Vector3(c4.x - 0.05, c4.y, c4.z), new THREE.Vector3(o2.x - 0.05, o2.y, o2.z), 0.05, 0xef4444));
    this.functionalGroup.add(MolecularBuilder.createBond(new THREE.Vector3(c4.x + 0.05, c4.y, c4.z), new THREE.Vector3(o2.x + 0.05, o2.y, o2.z), 0.05, 0xef4444));
    this.functionalGroup.add(MolecularBuilder.createBond(c4, h2, 0.05, 0x94a3b8));

    // Right: Acetic Acid CH3-COOH (Jones reagent oxidation)
    const c5 = new THREE.Vector3(2.6, 0, 0);
    const c6 = new THREE.Vector3(3.8, 0, 0);
    const o3 = new THREE.Vector3(4.3, 0.9, 0); // =O
    const o4 = new THREE.Vector3(4.5, -0.7, 0); // -OH
    const h3 = new THREE.Vector3(5.2, -0.7, 0);

    this.functionalGroup.add(MolecularBuilder.createAtom('C', c5, 0.32, 'carbonyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('C', c6, 0.32, 'carbonyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('O', o3, 0.28, 'carbonyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('O', o4, 0.28, 'hydroxyl-group'));
    this.functionalGroup.add(MolecularBuilder.createAtom('H', h3, 0.18, 'hydroxyl-group'));
    this.functionalGroup.add(MolecularBuilder.createBond(c5, c6, 0.08, 0x475569));
    this.functionalGroup.add(MolecularBuilder.createBond(c6, o3, 0.08, 0xef4444));
    this.functionalGroup.add(MolecularBuilder.createBond(c6, o4, 0.08, 0xef4444));
    this.functionalGroup.add(MolecularBuilder.createBond(o4, h3, 0.05, 0x94a3b8));

    this.annotations.add({
      id: 'ann-ethanol',
      text: 'Ethanol (1° Alcohol)',
      position: new THREE.Vector3(-2.6, 1.4, 0),
      priority: 1,
    });
    this.annotations.add({
      id: 'ann-acetaldehyde',
      text: 'Acetaldehyde [PCC]',
      position: new THREE.Vector3(0.6, 1.4, 0),
      priority: 1,
    });
    this.annotations.add({
      id: 'ann-acetic-acid',
      text: 'Acetic Acid [Jones / KMnO₄]',
      position: new THREE.Vector3(3.8, 1.4, 0),
      priority: 1,
    });
  }

  // Stage 5: Azo-Dye Coupling Synthesis (Aniline -> Diazonium -> Azo Dye chromophore)
  private buildDiazotizationAzoDye(): void {
    // Left: Benzene ring of Diazonium / Azo dye
    const ring1Center = new THREE.Vector3(-2.2, 0, 0);
    const ringRadius = 1.1;

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const pos = new THREE.Vector3(ring1Center.x + ringRadius * Math.cos(angle), ringRadius * Math.sin(angle), 0);
      this.functionalGroup.add(MolecularBuilder.createAtom('C', pos, 0.26, 'benzene-ring-core'));

      const nextAngle = ((i + 1) * Math.PI) / 3;
      const nextPos = new THREE.Vector3(ring1Center.x + ringRadius * Math.cos(nextAngle), ringRadius * Math.sin(nextAngle), 0);
      this.functionalGroup.add(MolecularBuilder.createBond(pos, nextPos, 0.07, 0x475569));
    }

    // Azo Bridge: –N=N– connecting Ring 1 to Ring 2
    const n1Pos = new THREE.Vector3(-0.6, 0.3, 0);
    const n2Pos = new THREE.Vector3(0.6, -0.3, 0);

    this.functionalGroup.add(MolecularBuilder.createAtom('N', n1Pos, 0.30, 'azo-chromophore'));
    this.functionalGroup.add(MolecularBuilder.createAtom('N', n2Pos, 0.30, 'azo-chromophore'));

    // C(ring1) to N1 bond
    const cAttach1 = new THREE.Vector3(ring1Center.x + ringRadius, 0, 0);
    this.functionalGroup.add(MolecularBuilder.createBond(cAttach1, n1Pos, 0.08, 0x3b82f6));

    // N=N double bond (chromophore) with vivid orange-red emission
    const azoBond1 = MolecularBuilder.createBond(
      new THREE.Vector3(n1Pos.x, n1Pos.y + 0.06, n1Pos.z),
      new THREE.Vector3(n2Pos.x, n2Pos.y + 0.06, n2Pos.z),
      0.06,
      0xf97316 // Vivid orange
    );
    const azoBond2 = MolecularBuilder.createBond(
      new THREE.Vector3(n1Pos.x, n1Pos.y - 0.06, n1Pos.z),
      new THREE.Vector3(n2Pos.x, n2Pos.y - 0.06, n2Pos.z),
      0.06,
      0xf97316
    );
    this.functionalGroup.add(azoBond1);
    this.functionalGroup.add(azoBond2);

    // Right: 2-Naphthol aromatic ring system
    const ring2Center = new THREE.Vector3(2.2, 0, 0);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const pos = new THREE.Vector3(ring2Center.x + ringRadius * Math.cos(angle), ringRadius * Math.sin(angle), 0);
      this.functionalGroup.add(MolecularBuilder.createAtom('C', pos, 0.26, 'benzene-ring-core'));

      const nextAngle = ((i + 1) * Math.PI) / 3;
      const nextPos = new THREE.Vector3(ring2Center.x + ringRadius * Math.cos(nextAngle), ringRadius * Math.sin(nextAngle), 0);
      this.functionalGroup.add(MolecularBuilder.createBond(pos, nextPos, 0.07, 0x475569));
    }
    const cAttach2 = new THREE.Vector3(ring2Center.x - ringRadius, 0, 0);
    this.functionalGroup.add(MolecularBuilder.createBond(n2Pos, cAttach2, 0.08, 0x3b82f6));

    // OH on Naphthol
    const ohPos = new THREE.Vector3(ring2Center.x + ringRadius * 0.5, ringRadius * 0.86 + 0.6, 0);
    this.functionalGroup.add(MolecularBuilder.createAtom('O', ohPos, 0.28, 'hydroxyl-group'));
    this.functionalGroup.add(MolecularBuilder.createBond(new THREE.Vector3(ring2Center.x + ringRadius * 0.5, ringRadius * 0.86, 0), ohPos, 0.07, 0xef4444));

    this.annotations.add({
      id: 'ann-azo-chromophore',
      text: '–N=N– Azo Chromophore (λ_max = 485 nm, Brilliant Orange Dye)',
      position: new THREE.Vector3(0, 1.2, 0),
      priority: 1,
    });
  }

  protected updateSimulation(delta: number): void {
    if (this.isPlaying) {
      this.reactionProgress = (this.reactionProgress + delta * 0.3 * this.playbackSpeed) % 1.0;
    }
  }
}
