/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 8: Surface Adsorption and Heterogeneous Catalysis
 *
 * Demonstrates:
 * - Solid Catalyst Surface Slab: Pt(111) metallic close-packed terrace with active atomic sites and step defects
 * - Physisorption vs Chemisorption: Van der Waals multi-layer vs specific covalent monolayer
 * - Langmuir Adsorption Isotherm: θ = KP / (1 + KP) (Monolayer saturation, localized equivalent sites)
 * - Freundlich Adsorption Isotherm: x/m = k P^(1/n) (Heterogeneous surface distribution)
 * - Complete Heterogeneous Catalytic Cycle (Langmuir-Hinshelwood Mechanism for CO + ½O₂ → CO₂):
 *   1. Gas diffusion & Physisorption
 *   2. Dissociative Chemisorption of O₂ into atomic oxygen (O_ads)
 *   3. Surface diffusion and C–O bond formation (CO_ads + O_ads → CO₂_ads)
 *   4. Spontaneous Product Desorption regenerating pristine active surface sites
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';
import { MolecularBuilder } from '../../core/MolecularBuilder';

export type IsothermModel = 'langmuir' | 'freundlich';

export class AdsorptionCatalysisScene extends BaseSimulation {
  private catalystSlabGroup = new THREE.Group();
  private surfaceSitesGroup = new THREE.Group();
  private gasMoleculesGroup = new THREE.Group();
  private adsorbedMoleculesGroup = new THREE.Group();
  private reactionIntermediatesGroup = new THREE.Group();

  // Thermodynamic & kinetic parameters
  private pressureAtm = 1.0;
  private temperatureK = 450;
  private activeModel: IsothermModel = 'langmuir';
  private adsorptionConstantK = 1.5; // Langmuir K

  public get temperature(): number {
    return this.temperatureK;
  }

  public get model(): IsothermModel {
    return this.activeModel;
  }

  // Reaction animation state
  private catalyticCycleProgress = 0.0;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.catalystSlabGroup = this.catalystSlabGroup || new THREE.Group();
    this.surfaceSitesGroup = this.surfaceSitesGroup || new THREE.Group();
    this.gasMoleculesGroup = this.gasMoleculesGroup || new THREE.Group();
    this.adsorbedMoleculesGroup = this.adsorbedMoleculesGroup || new THREE.Group();
    this.reactionIntermediatesGroup = this.reactionIntermediatesGroup || new THREE.Group();

    this.scene.add(this.catalystSlabGroup);
    this.scene.add(this.surfaceSitesGroup);
    this.scene.add(this.gasMoleculesGroup);
    this.scene.add(this.adsorbedMoleculesGroup);
    this.scene.add(this.reactionIntermediatesGroup);

    this.buildCurrentStageView();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-catalyst-surface-slab',
        index: 0,
        title: 'Stage 1: Solid Catalyst Surface — Pt(111) Crystal Terrace & Active Sites',
        shortDescription: 'Inspect the close-packed platinum atomic lattice with high-energy coordinatively unsaturated surface sites.',
        detailedExplanation:
          'Heterogeneous catalysis takes place at the solid-gas interface of transition metal crystals. ' +
          'A Pt(111) facet forms a hexagonal close-packed terrace where surface atoms have coordination number 9 (compared to 12 in the bulk). ' +
          'These coordinatively unsaturated surface atoms possess dangling d-orbital electron density with high surface free energy, ' +
          'providing active sites capable of lowering activation energy barriers for chemical transformations.',
        chemicalReactions: [
          'Surface Free Energy: γ = (1/2) (E_slab - N · E_bulk) / Area',
          'Pt(111) Coordination: CN = 9 (Surface terrace atoms) vs CN = 12 (Bulk)',
          'Pt–Pt Interatomic Distance: 2.77 Å (FCC crystal structure)',
        ],
        keyTerminology: [
          { term: 'Active Site', definition: 'Specific surface atomic arrangement where reactant molecules bind and undergo catalytic reaction.' },
          { term: 'Coordinatively Unsaturated Site (CUS)', definition: 'Surface metal atom missing bulk nearest neighbors with available bonding orbitals.' },
        ],
        highlightComponentIds: ['pt-terrace-atom', 'active-coordination-site'],
        recommendedCamera: { position: [0, 3.5, 5.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-physisorption-vs-chemisorption',
        index: 1,
        title: 'Stage 2: Physisorption vs Chemisorption Mechanisms',
        shortDescription: 'Compare reversible Van der Waals physisorption with covalent, chemical electron-transfer chemisorption.',
        detailedExplanation:
          'Physisorption is governed by non-specific, long-range London dispersion forces (ΔH_ads ~ -10 to -35 kJ/mol) with zero activation energy. ' +
          'It is reversible, occurs at low temperatures, and can form multilayer adsorption (BET isotherm). ' +
          'In contrast, Chemisorption involves direct orbital overlap and electron transfer, forming genuine chemical bonds (ΔH_ads ~ -100 to -400 kJ/mol). ' +
          'It is highly specific, requires activation energy, and is strictly restricted to a single monolayer.',
        chemicalReactions: [
          'Physisorption: ΔH_ads = -20 to -40 kJ/mol · Multilayer (BET isotherm) · Non-specific',
          'Chemisorption: ΔH_ads = -100 to -400 kJ/mol · Strict Monolayer · High specificity',
          'Lennard-Jones Potential Curve: Crossover between physisorption and chemisorption wells',
        ],
        keyTerminology: [
          { term: 'Physisorption', definition: 'Weak non-covalent adsorption driven by induced dipole van der Waals interactions.' },
          { term: 'Chemisorption', definition: 'Strong adsorption involving chemical bond formation and electronic restructuring with the substrate.' },
        ],
        highlightComponentIds: ['physisorbed-molecule', 'chemisorbed-adatom'],
        recommendedCamera: { position: [2.5, 2.8, 4.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-langmuir-isotherm-coverage',
        index: 2,
        title: 'Stage 3: Langmuir Adsorption Isotherm & Surface Site Occupancy (θ)',
        shortDescription: 'Evaluate fractional site coverage θ = KP / (1 + KP) as a function of gas partial pressure.',
        detailedExplanation:
          'Irving Langmuir’s model is based on four core postulates: (1) All surface sites are energetically equivalent; (2) Each site can hold at most one adsorbate molecule; ' +
          '(3) No lateral interactions exist between adsorbed molecules; and (4) Adsorption dynamic equilibrium: Rate of Adsorption (r_a = k_a P (1-θ)) equals Rate of Desorption (r_d = k_d θ). ' +
          'At low pressure (KP << 1), θ ≈ KP (Henry’s law, first order). At high pressure (KP >> 1), θ → 1 (asymptotic saturation, zero order in pressure).',
        chemicalReactions: [
          'Langmuir Isotherm: θ = (K · P) / (1 + K · P)',
          'Equilibrium Constant: K = (k_a / k_d) = K₀ · e^(-ΔH_ads / RT)',
          'Low P Limit: θ ≈ K · P (1st Order) · High P Limit: θ → 1.0 (0th Order Saturation)',
        ],
        keyTerminology: [
          { term: 'Fractional Coverage (θ)', definition: 'Ratio of occupied surface active sites to the total available active site capacity (N_ads / N_total).' },
          { term: 'Monolayer Saturation', definition: 'Plateau where 100% of available surface sites are occupied, preventing further chemisorption.' },
        ],
        highlightComponentIds: ['monolayer-adsorbate', 'active-coordination-site'],
        recommendedCamera: { position: [0, 3.2, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-dissociative-chemisorption',
        index: 3,
        title: 'Stage 4: Dissociative Chemisorption (O₂ → 2 O_ads)',
        shortDescription: 'Diatomic oxygen dissociates spontaneously on adjacent Pt hollow sites.',
        detailedExplanation:
          'Many catalytic reactions require initial bond cleavage on the surface. ' +
          'When an O₂ molecule approaches the Pt(111) surface, electron back-donation from platinum d-bands into the antibonding π* orbital ' +
          'of O₂ ruptures the O=O double bond (dissociation barrier: ~0.15 eV). ' +
          'The resulting oxygen atoms bind individually at three-fold hollow fcc surface sites as atomic adatoms (O_ads), ready for subsequent reaction.',
        chemicalReactions: [
          'O₂(g) + 2 * → 2 O* (Dissociative Chemisorption on Pt active sites *)',
          'Dissociation Activation Energy: E_act ≈ 15 kJ/mol on clean Pt(111)',
          'Adsorption Energy: ΔE_ads(O) = -3.8 eV per atom',
        ],
        keyTerminology: [
          { term: 'Dissociative Chemisorption', definition: 'Process in which a molecule splits into constituent atoms or radicals upon binding to surface sites.' },
          { term: 'Three-Fold Hollow Site', definition: 'High-symmetry site coordinated by three surface metal atoms offering deepest binding potential.' },
        ],
        highlightComponentIds: ['dissociated-o-adatom', 'pt-terrace-atom'],
        recommendedCamera: { position: [2.0, 2.5, 4.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-catalytic-cycle-desorption',
        index: 4,
        title: 'Stage 5: Langmuir-Hinshelwood Surface Reaction & Product Desorption',
        shortDescription: 'Surface reaction between CO_ads and O_ads forms CO₂ which desorbs immediately into the gas stream.',
        detailedExplanation:
          'In the Langmuir-Hinshelwood mechanism, both reacting species must be adsorbed on the surface before reacting. ' +
          'Adsorbed carbon monoxide (CO_ads) diffuses across terrace sites and reacts with atomic oxygen (O_ads) to form an activated complex [CO···O]‡. ' +
          'Upon bond formation, carbon dioxide (CO₂) possesses a closed-shell electronic structure with zero affinity for the platinum surface; ' +
          'it spontaneously desorbs into the gas phase, regenerating free active sites on the catalyst surface.',
        chemicalReactions: [
          'CO(g) + * ⇌ CO* (Molecular Adsorption)',
          'CO* + O* → [CO···O]‡ → CO₂(g) + 2 * (Langmuir-Hinshelwood Step & Desorption)',
          'Industrial Application: Catalytic Converters in automotive exhaust purification',
        ],
        keyTerminology: [
          { term: 'Langmuir-Hinshelwood Mechanism', definition: 'Reaction pathway where two distinct chemical species react while both are adsorbed on the surface.' },
          { term: 'Spontaneous Desorption', definition: 'Rapid release of weakly bound product molecules, preventing catalyst site poisoning.' },
        ],
        highlightComponentIds: ['co2-product-molecule', 'pt-terrace-atom'],
        recommendedCamera: { position: [0, 2.8, 5.2], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('pt-terrace-atom', {
      id: 'pt-terrace-atom',
      name: 'Platinum Surface Terrace Atom Pt(111)',
      category: 'catalyst',
      material: 'Metallic Platinum (5d⁹ 6s¹)',
      scientificRole: 'Close-packed surface atom with d-band center positioned to optimize reactant adsorption and bond activation.',
      specifications: 'Lattice Constant a = 3.92 Å · Work Function: 5.65 eV',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('active-coordination-site', {
      id: 'active-coordination-site',
      name: 'Three-Fold FCC Hollow Active Site',
      category: 'surface-site',
      material: 'Inter-Atomic Electrostatic Potential Well',
      scientificRole: 'Deep potential energy minimum capable of binding atomic adatoms (O, H, N).',
      specifications: 'Coordination: 3 nearest Pt atoms · Binding Energy: -3.8 eV for O',
      anchorPosition: [0.7, 0.4, 0.4],
    });

    this.components.set('physisorbed-molecule', {
      id: 'physisorbed-molecule',
      name: 'Physisorbed Gas Molecule',
      category: 'adsorbate',
      material: 'Intact Gas Molecule held by Van der Waals forces',
      scientificRole: 'Transient precursor state residing 3–4 Å above the metal surface.',
      specifications: 'Adsorption Energy: -25 kJ/mol · Readily desorbs with thermal fluctuation',
      anchorPosition: [-1.5, 1.2, 0],
    });

    this.components.set('chemisorbed-adatom', {
      id: 'chemisorbed-adatom',
      name: 'Chemisorbed Oxygen Adatom (O_ads)',
      category: 'adsorbate',
      material: 'Direct Covalent-Metal Bonded Atom',
      scientificRole: 'Substantially alters surface work function; ready for nucleophilic/electrophilic surface attack.',
      specifications: 'Pt–O Bond Length: 2.02 Å · Adsorption Enthalpy: -360 kJ/mol',
      anchorPosition: [0, 0.5, 0],
    });

    this.components.set('co2-product-molecule', {
      id: 'co2-product-molecule',
      name: 'Desorbing CO₂ Product Molecule',
      category: 'product',
      material: 'Linear Non-Polar Carbon Dioxide (O=C=O)',
      scientificRole: 'Zero surface affinity; desorbs immediately without blocking catalyst active sites.',
      specifications: 'Bond Length: 1.16 Å · Enthalpy of Reaction: ΔH = -283 kJ/mol (Exothermic)',
      anchorPosition: [0, 1.8, 0],
    });
  }

  public setPressure(pAtm: number): void {
    this.pressureAtm = pAtm;
    this.buildCurrentStageView();
  }

  public setTemperature(tK: number): void {
    this.temperatureK = tK;
    this.buildCurrentStageView();
  }

  public setIsothermModel(model: IsothermModel): void {
    this.activeModel = model;
    this.buildCurrentStageView();
  }

  protected onStageChanged(_stageIndex: number): void {
    this.catalyticCycleProgress = 0.0;
    this.buildCurrentStageView();
  }

  protected onModeChanged(_mode: string): void {
    this.buildCurrentStageView();
  }

  protected onViewModeChanged(_viewMode: string): void {
    this.buildCurrentStageView();
  }

  private clearGroups(): void {
    const groups = [
      this.catalystSlabGroup,
      this.surfaceSitesGroup,
      this.gasMoleculesGroup,
      this.adsorbedMoleculesGroup,
      this.reactionIntermediatesGroup,
    ];
    for (const g of groups) {
      g?.clear?.();
    }
  }

  private buildCurrentStageView(): void {
    this.clearGroups();

    // 1. Build Platinum Catalyst Slab (Pt 111 terrace)
    this.buildPtCatalystSlab();

    const stage = this.currentStageIndex;

    switch (stage) {
      case 0:
        // Pristine terrace with glowing active sites
        this.buildPristineActiveSites();
        break;
      case 1:
        // Physisorption vs Chemisorption comparison
        this.buildPhysisorptionVsChemisorption();
        break;
      case 2:
        // Langmuir isotherm coverage
        this.buildLangmuirCoverage();
        break;
      case 3:
        // Dissociative chemisorption (O2 -> 2 O)
        this.buildDissociativeChemisorption();
        break;
      case 4:
        // Langmuir-Hinshelwood catalytic cycle (CO + O -> CO2)
        this.buildCatalyticReactionCycle();
        break;
      default:
        this.buildPristineActiveSites();
        break;
    }
  }

  // Build Pt(111) 2-layer atomic slab
  private buildPtCatalystSlab(): void {
    const rows = 5;
    const cols = 7;
    const spacing = 0.85;

    const ptMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8, // Platinum silver
      metalness: 0.9,
      roughness: 0.25,
      clearcoat: 0.6,
    });
    const ptGeo = new THREE.SphereGeometry(0.38, 24, 24);

    // Top layer (Terrace)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const xOffset = (r % 2 === 0 ? 0 : spacing * 0.5);
        const x = (c - cols / 2) * spacing + xOffset;
        const z = (r - rows / 2) * spacing * 0.866;
        const y = 0;

        const atom = new THREE.Mesh(ptGeo, ptMat);
        atom.position.set(x, y, z);
        atom.userData = { componentId: 'pt-terrace-atom' };
        this.catalystSlabGroup.add(atom);
      }
    }

    // Subsurface support base plate
    const baseGeo = new THREE.BoxGeometry(cols * spacing + 0.5, 0.4, rows * spacing * 0.866 + 0.5);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -0.4, 0);
    this.catalystSlabGroup.add(baseMesh);
  }

  // Stage 0: Show glowing three-fold hollow active coordination sites
  private buildPristineActiveSites(): void {
    const siteCoords = [
      new THREE.Vector3(-1.2, 0.35, -0.8),
      new THREE.Vector3(0.0, 0.35, -0.8),
      new THREE.Vector3(1.2, 0.35, -0.8),
      new THREE.Vector3(-0.6, 0.35, 0.0),
      new THREE.Vector3(0.6, 0.35, 0.0),
      new THREE.Vector3(-1.2, 0.35, 0.8),
      new THREE.Vector3(0.0, 0.35, 0.8),
      new THREE.Vector3(1.2, 0.35, 0.8),
    ];

    const siteGeo = new THREE.RingGeometry(0.12, 0.22, 16);
    const siteMat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald glow
      side: THREE.DoubleSide,
    });

    for (const s of siteCoords) {
      const ring = new THREE.Mesh(siteGeo, siteMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(s);
      ring.userData = { componentId: 'active-coordination-site' };
      this.surfaceSitesGroup.add(ring);
    }

    this.annotations.add({
      id: 'ann-pt-terrace',
      text: 'Pt(111) Coordination Unsaturated Active Sites (CN = 9)',
      position: new THREE.Vector3(0, 1.2, 0),
      priority: 1,
    });
  }

  // Stage 1: Physisorption (left) vs Chemisorption (right)
  private buildPhysisorptionVsChemisorption(): void {
    // Left: Physisorbed CO molecule hovering 1.2 units above surface (weak VDW)
    const phyPos = new THREE.Vector3(-1.8, 1.2, 0);
    const phyC = MolecularBuilder.createAtom('C', phyPos, 0.26, 'physisorbed-molecule');
    const phyO = MolecularBuilder.createAtom('O', new THREE.Vector3(phyPos.x, phyPos.y + 0.45, phyPos.z), 0.24, 'physisorbed-molecule');
    this.adsorbedMoleculesGroup.add(phyC);
    this.adsorbedMoleculesGroup.add(phyO);
    this.adsorbedMoleculesGroup.add(MolecularBuilder.createBond(phyPos, new THREE.Vector3(phyPos.x, phyPos.y + 0.45, phyPos.z), 0.06, 0xef4444));

    // Weak VDW interaction dashed lines
    const vdwLine = MolecularBuilder.createBond(phyPos, new THREE.Vector3(phyPos.x, 0.35, phyPos.z), 0.02, 0x38bdf8);
    this.adsorbedMoleculesGroup.add(vdwLine);

    this.annotations.add({
      id: 'ann-physisorption',
      text: 'Physisorption (ΔH = -25 kJ/mol, Van der Waals, Reversible)',
      position: new THREE.Vector3(-1.8, 2.1, 0),
      priority: 1,
    });

    // Right: Chemisorbed O adatom sitting directly in 3-fold hollow site
    const chemPos = new THREE.Vector3(1.5, 0.4, 0);
    const chemO = MolecularBuilder.createAtom('O', chemPos, 0.32, 'chemisorbed-adatom');
    this.adsorbedMoleculesGroup.add(chemO);

    // Strong chemical covalent bonds to 3 surface Pt atoms
    const ptNeighbors = [
      new THREE.Vector3(1.1, 0.0, -0.4),
      new THREE.Vector3(1.9, 0.0, -0.4),
      new THREE.Vector3(1.5, 0.0, 0.4),
    ];
    for (const pt of ptNeighbors) {
      this.adsorbedMoleculesGroup.add(MolecularBuilder.createBond(chemPos, pt, 0.06, 0xf59e0b)); // Amber covalent bond
    }

    this.annotations.add({
      id: 'ann-chemisorption',
      text: 'Chemisorption (ΔH = -360 kJ/mol, Strong Covalent Pt–O Bond)',
      position: new THREE.Vector3(1.5, 1.4, 0),
      priority: 1,
    });
  }

  // Stage 2: Langmuir isotherm coverage simulation
  private buildLangmuirCoverage(): void {
    // Fractional coverage theta = KP / (1 + KP)
    const theta = (this.adsorptionConstantK * this.pressureAtm) / (1 + this.adsorptionConstantK * this.pressureAtm);
    const maxSites = 12;
    const occupiedCount = Math.round(theta * maxSites);

    const sitePositions = [
      new THREE.Vector3(-1.8, 0.4, -0.8),
      new THREE.Vector3(-0.9, 0.4, -0.8),
      new THREE.Vector3(0.0, 0.4, -0.8),
      new THREE.Vector3(0.9, 0.4, -0.8),
      new THREE.Vector3(1.8, 0.4, -0.8),
      new THREE.Vector3(-1.35, 0.4, 0.0),
      new THREE.Vector3(-0.45, 0.4, 0.0),
      new THREE.Vector3(0.45, 0.4, 0.0),
      new THREE.Vector3(1.35, 0.4, 0.0),
      new THREE.Vector3(-1.8, 0.4, 0.8),
      new THREE.Vector3(0.0, 0.4, 0.8),
      new THREE.Vector3(1.8, 0.4, 0.8),
    ];

    for (let i = 0; i < sitePositions.length; i++) {
      const pos = sitePositions[i];
      if (!pos) continue;
      if (i < occupiedCount) {
        // Chemisorbed CO molecule standing upright
        const cAtom = MolecularBuilder.createAtom('C', pos, 0.24, 'monolayer-adsorbate');
        const oAtom = MolecularBuilder.createAtom('O', new THREE.Vector3(pos.x, pos.y + 0.42, pos.z), 0.22, 'monolayer-adsorbate');
        this.adsorbedMoleculesGroup.add(cAtom);
        this.adsorbedMoleculesGroup.add(oAtom);
        this.adsorbedMoleculesGroup.add(MolecularBuilder.createBond(pos, new THREE.Vector3(pos.x, pos.y + 0.42, pos.z), 0.05, 0xef4444));
        this.adsorbedMoleculesGroup.add(MolecularBuilder.createBond(pos, new THREE.Vector3(pos.x, 0, pos.z), 0.05, 0x64748b));
      } else {
        // Empty active site ring
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.1, 0.18, 16),
          new THREE.MeshBasicMaterial({ color: 0x64748b, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.copy(pos);
        this.surfaceSitesGroup.add(ring);
      }
    }

    this.annotations.add({
      id: 'ann-langmuir-theta',
      text: `Langmuir Fractional Coverage θ = ${theta.toFixed(2)} (${occupiedCount}/${maxSites} sites occupied)`,
      position: new THREE.Vector3(0, 1.8, 0),
      priority: 1,
    });
  }

  // Stage 3: Dissociative Chemisorption (O2 -> 2 O)
  private buildDissociativeChemisorption(): void {
    // Two dissociated oxygen adatoms in neighboring hollow sites
    const o1Pos = new THREE.Vector3(-0.6, 0.4, 0);
    const o2Pos = new THREE.Vector3(0.6, 0.4, 0);

    this.adsorbedMoleculesGroup.add(MolecularBuilder.createAtom('O', o1Pos, 0.30, 'dissociated-o-adatom'));
    this.adsorbedMoleculesGroup.add(MolecularBuilder.createAtom('O', o2Pos, 0.30, 'dissociated-o-adatom'));

    // Broken bond dotted indicator
    const severedBond = MolecularBuilder.createBond(o1Pos, o2Pos, 0.03, 0xfacc15);
    this.adsorbedMoleculesGroup.add(severedBond);

    // Incoming gas phase O2 above
    const gO1 = new THREE.Vector3(0, 2.2, 0.2);
    const gO2 = new THREE.Vector3(0, 2.2, -0.3);
    this.gasMoleculesGroup.add(MolecularBuilder.createAtom('O', gO1, 0.26, 'gas-molecule'));
    this.gasMoleculesGroup.add(MolecularBuilder.createAtom('O', gO2, 0.26, 'gas-molecule'));
    this.gasMoleculesGroup.add(MolecularBuilder.createBond(gO1, gO2, 0.07, 0xef4444));

    // Downward arrow representing dissociative adsorption
    const arrow = MolecularBuilder.createCurvedArrow(
      new THREE.Vector3(0, 1.9, 0),
      new THREE.Vector3(0, 1.2, 0.3),
      new THREE.Vector3(0, 0.6, 0),
      0x10b981,
      0.035
    );
    this.adsorbedMoleculesGroup.add(arrow);

    this.annotations.add({
      id: 'ann-dissociation',
      text: 'Dissociative Chemisorption: O₂(g) + 2 * → 2 O*',
      position: new THREE.Vector3(0, 2.7, 0),
      priority: 1,
    });
  }

  // Stage 4: Langmuir-Hinshelwood catalytic cycle (CO* + O* -> CO2(g))
  private buildCatalyticReactionCycle(): void {
    // 1. Adsorbed CO on left
    const coPos = new THREE.Vector3(-0.8, 0.4, 0);
    this.adsorbedMoleculesGroup.add(MolecularBuilder.createAtom('C', coPos, 0.26, 'monolayer-adsorbate'));
    this.adsorbedMoleculesGroup.add(MolecularBuilder.createAtom('O', new THREE.Vector3(coPos.x, coPos.y + 0.4, coPos.z), 0.24, 'monolayer-adsorbate'));
    this.adsorbedMoleculesGroup.add(MolecularBuilder.createBond(coPos, new THREE.Vector3(coPos.x, coPos.y + 0.4, coPos.z), 0.06, 0xef4444));

    // 2. Adsorbed atomic O in middle
    const oPos = new THREE.Vector3(0.3, 0.4, 0);
    this.adsorbedMoleculesGroup.add(MolecularBuilder.createAtom('O', oPos, 0.28, 'dissociated-o-adatom'));

    // 3. Desorbing CO2 molecule taking flight on top right
    const co2Pos = new THREE.Vector3(1.5, 1.8, 0);
    const co2C = MolecularBuilder.createAtom('C', co2Pos, 0.26, 'co2-product-molecule');
    const co2O1 = MolecularBuilder.createAtom('O', new THREE.Vector3(co2Pos.x - 0.45, co2Pos.y, co2Pos.z), 0.24, 'co2-product-molecule');
    const co2O2 = MolecularBuilder.createAtom('O', new THREE.Vector3(co2Pos.x + 0.45, co2Pos.y, co2Pos.z), 0.24, 'co2-product-molecule');
    this.reactionIntermediatesGroup.add(co2C);
    this.reactionIntermediatesGroup.add(co2O1);
    this.reactionIntermediatesGroup.add(co2O2);
    this.reactionIntermediatesGroup.add(MolecularBuilder.createBond(co2C.position, co2O1.position, 0.06, 0xef4444));
    this.reactionIntermediatesGroup.add(MolecularBuilder.createBond(co2C.position, co2O2.position, 0.06, 0xef4444));

    // Flight vector arrow
    const flightArrow = MolecularBuilder.createBond(
      new THREE.Vector3(0.8, 0.8, 0),
      new THREE.Vector3(1.3, 1.5, 0),
      0.03,
      0x10b981
    );
    this.reactionIntermediatesGroup.add(flightArrow);

    this.annotations.add({
      id: 'ann-lh-cycle',
      text: 'Langmuir-Hinshelwood Step: CO* + O* → CO₂(g) ↑ (Spontaneous Desorption)',
      position: new THREE.Vector3(0, 2.5, 0),
      priority: 1,
    });
  }

  protected updateSimulation(delta: number): void {
    if (this.isPlaying) {
      this.catalyticCycleProgress = (this.catalyticCycleProgress + delta * 0.3 * this.playbackSpeed) % 1.0;
    }
  }
}
