/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 6: Coordination Chemistry and Crystal Field Theory
 *
 * Demonstrates:
 * - Coordination Geometries: Octahedral [ML₆], Tetrahedral [ML₄], Square Planar [ML₄]
 * - 3D d-Orbital Spatial Orientations relative to ligand electrostatic field (dxy, dyz, dxz, dx²-y², dz²)
 * - Crystal Field Splitting Energy Diagrams (Δo in Oh, Δt in Td, Δsp in D4h)
 * - Spectrochemical Series & Ligand Field Strength (Weak field high-spin vs Strong field low-spin)
 * - d–d Electronic Transitions & Complementary Color Transmission
 * - Magnetic Moments: Spin-only formula μ_eff = √(n(n+2)) Bohr Magnetons (Paramagnetism vs Diamagnetism)
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';
import { MolecularBuilder } from '../../core/MolecularBuilder';
import { OrbitalsRenderer } from '../../core/OrbitalsRenderer';

export type ComplexGeometry = 'octahedral' | 'tetrahedral' | 'square-planar';

export interface ComplexData {
  id: string;
  name: string;
  formula: string;
  metal: string;
  metalOx: string;
  dElectrons: number;
  geometry: ComplexGeometry;
  ligand: string;
  fieldStrength: 'weak' | 'strong';
  deltaOct: number; // in cm^-1
  absorbedColor: string; // nm / description
  transmittedHex: number; // 0x...
  unpairedElectrons: number;
  magneticMoment: number; // in BM
  description: string;
}

export const KNOWN_COMPLEXES: ComplexData[] = [
  {
    id: 'fe-h2o-6',
    name: 'Hexaaquairon(II)',
    formula: '[Fe(H₂O)₆]²⁺',
    metal: 'Fe',
    metalOx: '+2',
    dElectrons: 6,
    geometry: 'octahedral',
    ligand: 'H₂O',
    fieldStrength: 'weak',
    deltaOct: 10400,
    absorbedColor: 'Infrared / Red (~960 nm)',
    transmittedHex: 0x86efac, // Pale green
    unpairedElectrons: 4,
    magneticMoment: 4.90,
    description: 'High-spin d⁶ complex. Weak field H₂O ligand (Δo < P pairing energy). 4 unpaired electrons make it strongly paramagnetic with a pale green hue.',
  },
  {
    id: 'fe-cn-6',
    name: 'Hexacyanidoferrate(III)',
    formula: '[Fe(CN)₆]³⁻',
    metal: 'Fe',
    metalOx: '+3',
    dElectrons: 5,
    geometry: 'octahedral',
    ligand: 'CN⁻',
    fieldStrength: 'strong',
    deltaOct: 35000,
    absorbedColor: 'Violet / Near UV (~350 nm)',
    transmittedHex: 0xfde047, // Bright yellow
    unpairedElectrons: 1,
    magneticMoment: 1.73,
    description: 'Low-spin d⁵ complex. Strong field CN⁻ ligand (Δo >> P). All 5 electrons occupy t₂g with only 1 unpaired electron (weakly paramagnetic, vivid yellow).',
  },
  {
    id: 'cu-h2o-6',
    name: 'Hexaaquacopper(II)',
    formula: '[Cu(H₂O)₆]²⁺',
    metal: 'Cu',
    metalOx: '+2',
    dElectrons: 9,
    geometry: 'octahedral',
    ligand: 'H₂O',
    fieldStrength: 'weak',
    deltaOct: 12600,
    absorbedColor: 'Red-Orange (~800 nm)',
    transmittedHex: 0x38bdf8, // Sky blue
    unpairedElectrons: 1,
    magneticMoment: 1.73,
    description: 'd⁹ complex with Jahn-Teller tetragonal distortion. Absorbs red-orange light, transmitting characteristic brilliant copper(II) hydrated blue.',
  },
  {
    id: 'co-nh3-6',
    name: 'Hexaamminecobalt(III)',
    formula: '[Co(NH₃)₆]³⁺',
    metal: 'Co',
    metalOx: '+3',
    dElectrons: 6,
    geometry: 'octahedral',
    ligand: 'NH₃',
    fieldStrength: 'strong',
    deltaOct: 22900,
    absorbedColor: 'Blue (~475 nm)',
    transmittedHex: 0xf97316, // Orange
    unpairedElectrons: 0,
    magneticMoment: 0.0,
    description: 'Low-spin d⁶ complex. Strong field NH₃ produces t₂g⁶ eg⁰ configuration with zero unpaired electrons (diamagnetic, orange transmitted color).',
  },
  {
    id: 'ni-cn-4',
    name: 'Tetracyanidonickelate(II)',
    formula: '[Ni(CN)₄]²⁻',
    metal: 'Ni',
    metalOx: '+2',
    dElectrons: 8,
    geometry: 'square-planar',
    ligand: 'CN⁻',
    fieldStrength: 'strong',
    deltaOct: 28000,
    absorbedColor: 'Ultraviolet / Deep Violet',
    transmittedHex: 0xfef08a, // Pale yellow
    unpairedElectrons: 0,
    magneticMoment: 0.0,
    description: 'Square planar d⁸ complex. Strong field CN⁻ drives large splitting with dx²-y² orbital unoccupied, resulting in a diamagnetic complex.',
  },
  {
    id: 'co-cl-4',
    name: 'Tetrachloridocobaltate(II)',
    formula: '[CoCl₄]²⁻',
    metal: 'Co',
    metalOx: '+2',
    dElectrons: 7,
    geometry: 'tetrahedral',
    ligand: 'Cl⁻',
    fieldStrength: 'weak',
    deltaOct: 5500,
    absorbedColor: 'Yellow-Green (~660 nm)',
    transmittedHex: 0x2563eb, // Deep cobalt blue
    unpairedElectrons: 3,
    magneticMoment: 3.87,
    description: 'Tetrahedral d⁷ complex. Inverted splitting (e⁴ t₂³) with small Δt = (4/9)Δo. High-spin with 3 unpaired electrons, transmitting intense royal blue.',
  },
];

export class CoordinationChemistryScene extends BaseSimulation {
  private complexGroup = new THREE.Group();
  private ligandsGroup = new THREE.Group();
  private orbitalsGroup = new THREE.Group();
  private cftEnergyGroup = new THREE.Group();

  // Active state
  private selectedComplexIndex = 0;
  private showOrbitals = true;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.complexGroup = this.complexGroup || new THREE.Group();
    this.ligandsGroup = this.ligandsGroup || new THREE.Group();
    this.orbitalsGroup = this.orbitalsGroup || new THREE.Group();
    this.cftEnergyGroup = this.cftEnergyGroup || new THREE.Group();

    this.scene.add(this.complexGroup);
    this.scene.add(this.ligandsGroup);
    this.scene.add(this.orbitalsGroup);
    this.scene.add(this.cftEnergyGroup);

    this.buildCurrentStageView();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-coordination-geometry',
        index: 0,
        title: 'Stage 1: Coordination Geometry & Ligand Assembly',
        shortDescription: 'Inspect octahedral [ML₆], tetrahedral [ML₄], and square planar [ML₄] geometries.',
        detailedExplanation:
          'Coordination complexes consist of a central transition metal cation surrounded by a symmetric array of electron-pair donor ligands (Lewis bases). ' +
          'In octahedral complexes [ML₆]ⁿ⁺, six ligands coordinate along the ±x, ±y, and ±z Cartesian axes. ' +
          'In tetrahedral complexes [ML₄]ⁿ⁺, four ligands occupy alternate vertices of a cube. ' +
          'In square planar complexes (common for d⁸ metals like Ni²⁺, Pt²⁺), four ligands lie strictly in the xy plane.',
        chemicalReactions: [
          'Octahedral: Coordination Number 6 · Point Group O_h · Bond Angles: strictly 90° and 180°',
          'Tetrahedral: Coordination Number 4 · Point Group T_d · Bond Angles: 109.47°',
          'Square Planar: Coordination Number 4 · Point Group D_4h · Bond Angles: 90° and 180°',
        ],
        keyTerminology: [
          { term: 'Coordination Sphere', definition: 'The central metal ion and its directly bonded primary ligand shell.' },
          { term: 'Coordination Number', definition: 'The total number of ligand donor atoms directly attached to the metal center.' },
        ],
        highlightComponentIds: ['metal-center', 'ligand-atom'],
        recommendedCamera: { position: [3.2, 2.5, 4.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-d-orbitals-overlap',
        index: 1,
        title: 'Stage 2: 3D d-Orbital Spatial Orientation in Crystal Field',
        shortDescription: 'Examine the five degenerate d-orbitals interacting with the incoming ligand electrostatic field.',
        detailedExplanation:
          'In an isolated free metal ion, all five 3d orbitals (dxy, dyz, dxz, dx²-y², dz²) are strictly degenerate. ' +
          'When negative ligand point charges approach, electrostatic repulsion destabilizes the d-electrons. ' +
          'Crucially, this repulsion is non-uniform: orbitals pointing directly along the axes toward the ligands (dx²-y² and dz², forming the eg set) ' +
          'experience intense repulsion and rise in energy, while orbitals pointing between the axes (dxy, dyz, dxz, forming the t₂g set) experience less repulsion and fall in energy relative to the spherical barycenter.',
        chemicalReactions: [
          'Octahedral: e_g (dx²-y², dz²) raised by +0.6 Δ_o (+6 Dq)',
          'Octahedral: t₂_g (dxy, dyz, dxz) lowered by -0.4 Δ_o (-4 Dq)',
          'Barycenter Rule: 3 × (-0.4) + 2 × (+0.6) = 0 (Total energy conserved)',
        ],
        keyTerminology: [
          { term: 't₂g Orbitals', definition: 'Triply degenerate set (dxy, dyz, dxz) oriented between Cartesian axes, minimizing ligand repulsion.' },
          { term: 'eg Orbitals', definition: 'Doubly degenerate set (dx²-y², dz²) pointing directly along internuclear ligand bond axes.' },
          { term: 'Barycenter', definition: 'The average spherical energy level of the five d-orbitals before anisotropic field splitting.' },
        ],
        highlightComponentIds: ['eg-orbital-lobe', 't2g-orbital-lobe'],
        recommendedCamera: { position: [2.5, 3.0, 4.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-splitting-spectrochemical',
        index: 2,
        title: 'Stage 3: Spectrochemical Series & High-Spin vs Low-Spin Configurations',
        shortDescription: 'Compare weak-field (Δo < P, high-spin) with strong-field (Δo > P, low-spin) electron filling.',
        detailedExplanation:
          'The magnitude of crystal field splitting (Δo) is governed by ligand field strength via the Spectrochemical Series: ' +
          'I⁻ < Br⁻ < Cl⁻ < F⁻ < OH⁻ < H₂O < NH₃ < en < NO₂⁻ < CN⁻ < CO. ' +
          'Weak-field ligands (e.g. H₂O, Cl⁻) induce small Δo where Hund’s rule favors promoting electrons to eg rather than paying electron pairing energy (P), producing High-Spin complexes with maximum unpaired electrons. ' +
          'Strong-field ligands (e.g. CN⁻, CO) produce large Δo (Δo > P), forcing electrons to pair up in t₂g first, producing Low-Spin complexes.',
        chemicalReactions: [
          'Spectrochemical Series: I⁻ < Br⁻ < Cl⁻ < F⁻ < H₂O < NH₃ < NO₂⁻ < CN⁻ < CO',
          'High-Spin Criterion: Δ_o < P (Pairing Energy) → e.g. [Fe(H₂O)₆]²⁺: t₂_g⁴ e_g² (4 unpaired e⁻)',
          'Low-Spin Criterion: Δ_o > P → e.g. [Fe(CN)₆]⁴⁻: t₂_g⁶ e_g⁰ (0 unpaired e⁻, Diamagnetic)',
        ],
        keyTerminology: [
          { term: 'Pairing Energy (P)', definition: 'Coulombic repulsion and quantum exchange energy required to pair two electrons within a single spatial orbital.' },
          { term: 'High-Spin Complex', definition: 'Electron distribution that maximizes total spin S by occupying eg before pairing in t₂g.' },
          { term: 'Low-Spin Complex', definition: 'Electron distribution where large Δo forces complete pairing in t₂g before any eg occupation.' },
        ],
        highlightComponentIds: ['cft-energy-levels', 'metal-center'],
        recommendedCamera: { position: [0, 2.5, 5.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-dd-transition-color',
        index: 3,
        title: 'Stage 4: d–d Electronic Transitions & Complementary Visible Color',
        shortDescription: 'Absorption of photon hν = Δo promotes a t₂g electron to eg, imparting characteristic solution color.',
        detailedExplanation:
          'When white light passes through a solution containing a coordination complex, photons matching the energy gap Δo ' +
          '(ΔE = hν = hc/λ) are absorbed, exciting an electron from the lower t₂g set into the higher eg set (Laporte-forbidden, vibronically allowed d–d transition). ' +
          'The human eye perceives the complementary color transmitted. ' +
          'For example, [Cu(H₂O)₆]²⁺ absorbs red-orange (~800 nm) and appears brilliant cyan-blue; [Co(NH₃)₆]³⁺ absorbs blue (~475 nm) and appears vivid orange.',
        chemicalReactions: [
          'd–d Excitation: t₂_g^x e_g^y + hν (λ = hc/Δ_o) → t₂_g^(x-1) e_g^(y+1)',
          'Beer-Lambert Absorption: A = ε · c · l (ε_d-d ~ 1 to 100 L·mol⁻¹·cm⁻¹)',
          'Complementary Colors: Absorbed Red ↔ Transmitted Green/Cyan; Absorbed Blue ↔ Transmitted Orange/Yellow',
        ],
        keyTerminology: [
          { term: 'd–d Transition', definition: 'Electronic transition between split d-orbital sublevels induced by absorption of visible photons.' },
          { term: 'Complementary Color', definition: 'The perceived hue resulting from subtraction of absorbed wavelengths from white light.' },
        ],
        highlightComponentIds: ['transmitted-color-glow', 'metal-center'],
        recommendedCamera: { position: [2.0, 2.0, 4.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-magnetic-properties',
        index: 4,
        title: 'Stage 5: Magnetic Moments (Paramagnetism vs Diamagnetism)',
        shortDescription: 'Calculate spin-only magnetic moment μ_eff = √(n(n+2)) Bohr Magnetons from unpaired d-electrons.',
        detailedExplanation:
          'The magnetic properties of coordination complexes depend directly on the number of unpaired electrons (n). ' +
          'Complexes with one or more unpaired electrons are paramagnetic (drawn into magnetic fields). ' +
          'The magnetic moment is quantitatively predicted by the spin-only formula: μ_eff = √(n(n+2)) Bohr Magnetons (BM). ' +
          'Complexes with all electrons paired (n = 0, such as low-spin d⁶ [Co(NH₃)₆]³⁺ or square-planar d⁸ [Ni(CN)₄]²⁻) are diamagnetic (weakly repelled by magnetic fields, μ = 0 BM).',
        chemicalReactions: [
          'Spin-Only Formula: μ_eff = √[n(n + 2)] Bohr Magnetons (BM)',
          'n = 1: μ = 1.73 BM · n = 2: μ = 2.83 BM · n = 3: μ = 3.87 BM',
          'n = 4: μ = 4.90 BM · n = 5: μ = 5.92 BM · n = 0: μ = 0.00 BM (Diamagnetic)',
        ],
        keyTerminology: [
          { term: 'Paramagnetism', definition: 'Attraction into an external magnetic field caused by the magnetic dipole moment of unpaired electron spins.' },
          { term: 'Diamagnetism', definition: 'Weak repulsion from magnetic fields arising from paired electrons where all orbital and spin moments cancel.' },
          { term: 'Bohr Magneton (BM)', definition: 'Natural unit for electron magnetic dipole moment: μ_B = eħ / 2m_e = 9.274 × 10⁻²⁴ J/T.' },
        ],
        highlightComponentIds: ['magnetic-dipole-vector', 'metal-center'],
        recommendedCamera: { position: [2.5, 2.5, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    const comp = KNOWN_COMPLEXES[this.selectedComplexIndex] ?? KNOWN_COMPLEXES[0]!;

    this.components.set('metal-center', {
      id: 'metal-center',
      name: `Central Metal Ion (${comp.metal}^${comp.metalOx})`,
      category: 'metal',
      material: `Transition Metal Cation (${comp.metal} with d^${comp.dElectrons} configuration)`,
      scientificRole: 'Acts as Lewis acid accepting electron pairs into empty hybridized valence orbitals.',
      specifications: `Ionic Radius: ~0.65 Å · Electron Configuration: 3d^${comp.dElectrons}`,
      anchorPosition: [0, 0, 0],
    });

    this.components.set('ligand-atom', {
      id: 'ligand-atom',
      name: `Coordinating Ligand (${comp.ligand})`,
      category: 'ligand',
      material: 'Lewis Base Electron Donor',
      scientificRole: 'Donates lone electron pair to form coordinate covalent bond (metal-ligand bond).',
      specifications: `Field Strength: ${comp.fieldStrength.toUpperCase()} · Splitting: Δ = ${comp.deltaOct} cm⁻¹`,
      anchorPosition: [1.6, 0, 0],
    });

    this.components.set('eg-orbital-lobe', {
      id: 'eg-orbital-lobe',
      name: 'eg High-Energy Orbital (dx²-y² / dz²)',
      category: 'orbital',
      material: 'Electronic Probability Cloud |ψ|²',
      scientificRole: 'Points directly along M–L bond axes; raised by +0.6 Δo above barycenter due to maximum electrostatic repulsion.',
      specifications: 'Degeneracy: Doubly degenerate (eg set in Oh)',
      anchorPosition: [0, 0.9, 0],
    });

    this.components.set('t2g-orbital-lobe', {
      id: 't2g-orbital-lobe',
      name: 't₂g Low-Energy Orbital (dxy / dyz / dxz)',
      category: 'orbital',
      material: 'Electronic Probability Cloud |ψ|²',
      scientificRole: 'Points between axes into interstitial spaces; stabilized by -0.4 Δo below barycenter.',
      specifications: 'Degeneracy: Triply degenerate (t₂g set in Oh)',
      anchorPosition: [0.65, 0.65, 0],
    });

    this.components.set('cft-energy-levels', {
      id: 'cft-energy-levels',
      name: 'Crystal Field Energy Diagram',
      category: 'cft',
      material: 'Quantized Electronic Energy Sublevels',
      scientificRole: 'Depicts orbital splitting Δo and electron occupancy according to Hund’s rule and Pauli exclusion.',
      specifications: `Splitting Δ: ${comp.deltaOct} cm⁻¹ · Spin State: ${comp.unpairedElectrons > 0 ? 'Paramagnetic' : 'Diamagnetic'}`,
      anchorPosition: [-2.5, 0, 0],
    });
  }

  public setComplexIndex(index: number): void {
    if (index >= 0 && index < KNOWN_COMPLEXES.length) {
      this.selectedComplexIndex = index;
      this.initComponents();
      this.buildCurrentStageView();
    }
  }

  public toggleOrbitals(): void {
    this.showOrbitals = !this.showOrbitals;
    this.orbitalsGroup.visible = this.showOrbitals;
  }

  protected onStageChanged(_stageIndex: number): void {
    this.buildCurrentStageView();
  }

  protected onModeChanged(_mode: string): void {
    this.buildCurrentStageView();
  }

  protected onViewModeChanged(_viewMode: string): void {
    this.buildCurrentStageView();
  }

  private clearGroups(): void {
    const groups = [this.complexGroup, this.ligandsGroup, this.orbitalsGroup, this.cftEnergyGroup];
    for (const g of groups) {
      g?.clear?.();
    }
  }

  private buildCurrentStageView(): void {
    this.clearGroups();

    const comp = KNOWN_COMPLEXES[this.selectedComplexIndex] ?? KNOWN_COMPLEXES[0]!;
    const stage = this.currentStageIndex;

    // 1. Build Central Metal Ion with characteristic transmitted complex aura
    const metalGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const metalMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 0.5,
    });
    const metalMesh = new THREE.Mesh(metalGeo, metalMat);
    metalMesh.userData = { componentId: 'metal-center' };
    this.complexGroup.add(metalMesh);

    // Complementary color aura (translucent sphere enclosing complex)
    const auraGeo = new THREE.SphereGeometry(2.3, 32, 32);
    const auraMat = new THREE.MeshPhysicalMaterial({
      color: comp.transmittedHex,
      transparent: true,
      opacity: stage >= 3 ? 0.35 : 0.15,
      roughness: 0.1,
      transmission: 0.6,
      emissive: comp.transmittedHex,
      emissiveIntensity: stage >= 3 ? 0.4 : 0.1,
      depthWrite: false,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.userData = { componentId: 'transmitted-color-glow' };
    this.complexGroup.add(auraMesh);

    // 2. Build Ligands based on geometry
    const bondRadius = 1.75;
    const ligandPositions: THREE.Vector3[] = [];

    if (comp.geometry === 'octahedral') {
      ligandPositions.push(
        new THREE.Vector3(bondRadius, 0, 0),
        new THREE.Vector3(-bondRadius, 0, 0),
        new THREE.Vector3(0, bondRadius, 0),
        new THREE.Vector3(0, -bondRadius, 0),
        new THREE.Vector3(0, 0, bondRadius),
        new THREE.Vector3(0, 0, -bondRadius)
      );
    } else if (comp.geometry === 'tetrahedral') {
      // 4 corners of a cube
      const d = bondRadius / Math.sqrt(3);
      ligandPositions.push(
        new THREE.Vector3(d, d, d),
        new THREE.Vector3(-d, -d, d),
        new THREE.Vector3(-d, d, -d),
        new THREE.Vector3(d, -d, -d)
      );
    } else if (comp.geometry === 'square-planar') {
      ligandPositions.push(
        new THREE.Vector3(bondRadius, 0, 0),
        new THREE.Vector3(-bondRadius, 0, 0),
        new THREE.Vector3(0, bondRadius, 0),
        new THREE.Vector3(0, -bondRadius, 0)
      );
    }

    for (let i = 0; i < ligandPositions.length; i++) {
      const pos = ligandPositions[i];
      if (!pos) continue;
      // Ligand donor atom sphere
      const donorAtom = MolecularBuilder.createAtom(
        comp.ligand.includes('O') ? 'O' : comp.ligand.includes('N') ? 'N' : comp.ligand.includes('Cl') ? 'Cl' : 'C',
        pos,
        0.35,
        'ligand-atom'
      );
      this.ligandsGroup.add(donorAtom);

      // Coordinate covalent M←L bond cylinder
      const bond = MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), pos, 0.08, 0x64748b);
      this.ligandsGroup.add(bond);
    }

    // 3. Build 3D d-orbital lobes in stage 1 and beyond
    if (stage >= 1) {
      // eg set: dz² (axial torus + lobes) and dx²-y²
      const egLobe1 = OrbitalsRenderer.createDOrbital('z2');
      egLobe1.userData = { componentId: 'eg-orbital-lobe' };
      this.orbitalsGroup.add(egLobe1);

      // t2g set: rotated 45° between axes (dxy)
      const t2gGroup = OrbitalsRenderer.createDOrbital('xy');
      t2gGroup.userData = { componentId: 't2g-orbital-lobe' };
      this.orbitalsGroup.add(t2gGroup);
    }

    // 4. In stage 2 & 4, add CFT energy diagram lines & electron dots on the left
    if (stage >= 2) {
      this.buildCFTEnergyDiagram(comp);
    }

    this.annotations.add({
      id: 'ann-complex-formula',
      text: `${comp.formula} (${comp.name})`,
      position: new THREE.Vector3(0, 2.4, 0),
      priority: 1,
    });

    if (stage === 3) {
      this.annotations.add({
        id: 'ann-color-trans',
        text: `Absorbs: ${comp.absorbedColor} → Transmits: ${comp.name.split('(')[0]} Color`,
        position: new THREE.Vector3(0, -2.4, 0),
        priority: 1,
      });
    }

    if (stage === 4) {
      this.annotations.add({
        id: 'ann-magnetic',
        text: `μ_eff = ${comp.magneticMoment} BM (${comp.unpairedElectrons} unpaired e⁻, ${comp.unpairedElectrons > 0 ? 'Paramagnetic' : 'Diamagnetic'})`,
        position: new THREE.Vector3(0, -2.4, 0),
        priority: 1,
      });
    }
  }

  // Draw 2D floating crystal field splitting energy levels
  private buildCFTEnergyDiagram(comp: ComplexData): void {
    const xBase = -3.2;

    if (comp.geometry === 'octahedral') {
      // Lower t2g (3 horizontal line segments)
      const t2gY = -0.6;
      for (let i = 0; i < 3; i++) {
        const p1 = new THREE.Vector3(xBase + i * 0.5 - 0.4, t2gY, 0);
        const p2 = new THREE.Vector3(xBase + i * 0.5 + 0.1, t2gY, 0);
        this.cftEnergyGroup.add(MolecularBuilder.createBond(p1, p2, 0.04, 0x06b6d4));
      }

      // Upper eg (2 horizontal line segments)
      const egY = 0.8;
      for (let i = 0; i < 2; i++) {
        const p1 = new THREE.Vector3(xBase + i * 0.6 - 0.2, egY, 0);
        const p2 = new THREE.Vector3(xBase + i * 0.6 + 0.3, egY, 0);
        this.cftEnergyGroup.add(MolecularBuilder.createBond(p1, p2, 0.04, 0xef4444));
      }

      // Splitting arrow Δo
      const arrow = MolecularBuilder.createBond(
        new THREE.Vector3(xBase + 1.3, t2gY, 0),
        new THREE.Vector3(xBase + 1.3, egY, 0),
        0.03,
        0xfacc15
      );
      this.cftEnergyGroup.add(arrow);

      this.annotations.add({
        id: 'ann-cft-levels',
        text: `CFT Splitting Δ_o = ${comp.deltaOct} cm⁻¹ (t₂g vs eg)`,
        position: new THREE.Vector3(xBase + 0.4, 1.4, 0),
        priority: 2,
      });
    }
  }

  protected updateSimulation(delta: number): void {
    if (this.isPlaying) {
      // Gentle orbital slow precession
      this.orbitalsGroup.rotation.y += delta * 0.2 * this.playbackSpeed;
    }
  }
}
