/**
 * KPRIET Engineering Chemistry Virtual Laboratory
 * Simulation 3: Conformations and Stereochemistry
 *
 * Demonstrates:
 * - Conformational Analysis: Ethane and n-Butane (Staggered, Eclipsed, Gauche, Anti)
 * - Projections: 3D Ball-and-Stick, Newman Projection, Sawhorse Projection
 * - Chirality & Enantiomers: Non-superimposable mirror images (R/S Lactic Acid)
 * - Geometrical Isomerism: Cis/Trans and (E)/(Z) alkenes
 * - Interactive dihedral rotation and torsional energy profile
 */

import * as THREE from 'three';
import { BaseSimulation } from '../../core/BaseSimulation';
import type { SimulationOptions } from '../../core/types';
import { MolecularBuilder } from '../../core/MolecularBuilder';

export class StereochemistryScene extends BaseSimulation {
  private moleculeGroup = new THREE.Group();
  private frontCarbonGroup = new THREE.Group();
  private rearCarbonGroup = new THREE.Group();
  private mirrorPlaneGroup = new THREE.Group();

  // Conformational state
  private dihedralAngleDeg = 60; // 0 (eclipsed) to 60 (staggered) to 180 (anti)
  private currentMoleculeType: 'ethane' | 'butane' | 'chiral' | 'ez_alkene' = 'ethane';
  private currentProjection: '3d' | 'newman' | 'sawhorse' = '3d';

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.moleculeGroup = this.moleculeGroup || new THREE.Group();
    this.frontCarbonGroup = this.frontCarbonGroup || new THREE.Group();
    this.rearCarbonGroup = this.rearCarbonGroup || new THREE.Group();
    this.mirrorPlaneGroup = this.mirrorPlaneGroup || new THREE.Group();

    this.scene.add(this.moleculeGroup);
    this.moleculeGroup.add(this.frontCarbonGroup);
    this.moleculeGroup.add(this.rearCarbonGroup);
    this.scene.add(this.mirrorPlaneGroup);

    this.parameters['dihedral'] = 60;
    this.parameters['molecule'] = 'ethane';
    this.parameters['projection'] = '3d';

    this.buildCurrentState();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-ethane-conform',
        index: 0,
        title: 'Stage 1: Ethane Conformational Analysis — Staggered vs Eclipsed',
        shortDescription: 'Compare minimum-energy staggered conformation (60°) with torsionally strained eclipsed conformation (0°).',
        detailedExplanation:
          'Rotation around the carbon–carbon single σ-bond is hindered by torsional strain (Pitzer strain). ' +
          'In the staggered conformation (dihedral angle θ = 60°, 180°, 300°), electron pairs in adjacent C–H bonds are at maximum distance, ' +
          'stabilized by hyperconjugation into adjacent σ* orbitals. In the eclipsed conformation (θ = 0°, 120°, 240°), torsional repulsion ' +
          'destabilizes the molecule by 12.0 kJ/mol (2.9 kcal/mol; ~4.0 kJ/mol per eclipsing H–H interaction).',
        chemicalReactions: [
          'Torsional Barrier ΔE = 12.0 kJ/mol (2.9 kcal/mol)',
          'Eclipsing Interaction: H/H = 4.0 kJ/mol',
          'Rotational Frequency at 25 °C: ~10¹⁰ revolutions/sec',
        ],
        keyTerminology: [
          { term: 'Dihedral Angle (θ)', definition: 'Angle between two intersecting planes defined by H–C–C and C–C–H bonds.' },
          { term: 'Torsional Strain', definition: 'Repulsive interaction between bonding electron pairs passing each other in eclipsed alignment.' },
        ],
        highlightComponentIds: ['front-carbon', 'rear-carbon', 'cc-sigma-bond'],
        recommendedCamera: { position: [0, 2.5, 6.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-newman-sawhorse',
        index: 1,
        title: 'Stage 2: Standard Stereochemical Projections — Newman & Sawhorse',
        shortDescription: 'Inspect molecules directly down the C–C bond axis (Newman) and at a 45° perspective angle (Sawhorse).',
        detailedExplanation:
          'In a Newman projection, the viewer looks directly down the C1–C2 bond. The front carbon is represented by a central vertex ' +
          'with three radiating spokes, and the rear carbon is represented by a circle with three spokes extending from its circumference. ' +
          'In a Sawhorse projection, the C–C bond is viewed at an oblique angle, depicting spatial relationships in 3D perspective without occlusion.',
        chemicalReactions: [
          'Newman: Front Carbon (Vertex) + Rear Carbon (Circle)',
          'Sawhorse: Oblique perspective view highlighting dihedral offset',
        ],
        keyTerminology: [
          { term: 'Newman Projection', definition: 'End-on representation directly down a specified bond axis.' },
          { term: 'Sawhorse Projection', definition: 'Spatial drawing viewed from an angle above and to the right.' },
        ],
        highlightComponentIds: ['front-carbon', 'rear-carbon'],
        recommendedCamera: { position: [0, 0, 5.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-butane-pot-energy',
        index: 2,
        title: 'Stage 3: n-Butane Conformational Curve — Anti, Gauche & Syn-Periplanar',
        shortDescription: 'Examine steric hindrance (van der Waals strain) between bulky methyl groups across the C2–C3 axis.',
        detailedExplanation:
          'Rotation about the C2–C3 bond in n-butane generates non-equivalent conformations due to both torsional and steric strain: ' +
          '1. Anti (θ = 180°): Bulky CH₃ groups opposite; global energy minimum (0 kJ/mol). ' +
          '2. Gauche (θ = 60°): CH₃ groups adjacent; steric clash increases energy by 3.8 kJ/mol. ' +
          '3. Eclipsed H/CH₃ (θ = 120°): 16.0 kJ/mol barrier. ' +
          '4. Syn-Periplanar / Fully Eclipsed (θ = 0°): Methyl groups overlap directly; severe van der Waals repulsion yields global maximum (19.0 kJ/mol).',
        chemicalReactions: [
          'Anti (180°): 0 kJ/mol (Global Minimum)',
          'Gauche (60°): +3.8 kJ/mol (Local Minimum)',
          'Fully Eclipsed (0°): +19.0 kJ/mol (Global Maximum)',
        ],
        keyTerminology: [
          { term: 'Steric Strain', definition: 'Repulsion occurring when atoms approach closer than their van der Waals radii allow.' },
          { term: 'Gauche Interaction', definition: 'Steric clash between two non-hydrogen groups separated by a 60° torsion angle.' },
        ],
        highlightComponentIds: ['methyl-front', 'methyl-rear'],
        recommendedCamera: { position: [2.5, 3.0, 5.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-chirality-enantiomers',
        index: 3,
        title: 'Stage 4: Chirality & Enantiomer Mirror Images — R/S Stereoisomers',
        shortDescription: 'Demonstrate non-superimposability of mirror images at an sp³ asymmetric stereogenic center.',
        detailedExplanation:
          'A carbon bonded to four distinct substituents is an asymmetric stereocenter (chiral center). ' +
          'A chiral molecule and its non-superimposable mirror image form an enantiomeric pair (e.g. (R)-lactic acid and (S)-lactic acid). ' +
          'Enantiomers share identical physical properties (melting point, boiling point, density, NMR spectra) in an achiral environment, ' +
          'but rotate plane-polarized light in equal and opposite directions ([α]_D) and interact differently with chiral receptors and enzymes.',
        chemicalReactions: [
          'Cahn-Ingold-Prelog (CIP) Priority: –OH (1) > –COOH (2) > –CH₃ (3) > –H (4)',
          'Clockwise 1→2→3: (R)-Configuration · Counter-Clockwise: (S)-Configuration',
          'Specific Rotation: (S)-(+)-Lactic Acid [α]_D = +3.8° · (R)-(-)-Lactic Acid [α]_D = -3.8°',
        ],
        keyTerminology: [
          { term: 'Enantiomers', definition: 'Non-superimposable mirror-image stereoisomers.' },
          { term: 'Optical Activity', definition: 'Ability of chiral substances to rotate the plane of polarized light.' },
          { term: 'Racemic Mixture', definition: 'Equimolar 1:1 mixture of enantiomers exhibiting net zero optical rotation ([α]_D = 0).' },
        ],
        highlightComponentIds: ['chiral-center', 'hydroxyl-group', 'carboxyl-group'],
        recommendedCamera: { position: [0, 2.5, 6.0], target: [0, 0, 0] },
      },
      {
        id: 'stage-geometric-ez',
        index: 4,
        title: 'Stage 5: Geometrical Isomerism — Cis/Trans & (E)/(Z) Alkene Systems',
        shortDescription: 'Inspect rigid π-bond preventing rotation and defining distinct diastereomeric geometries.',
        detailedExplanation:
          'Because breaking a carbon–carbon π bond requires ~264 kJ/mol, rotation about C=C double bonds is restricted under ambient conditions. ' +
          'When each carbon of the double bond bears two distinct substituents, diastereomers exist: ' +
          'Z (zusammen = together): higher CIP priority groups on the same side of the double bond plane. ' +
          'E (entgegen = opposite): higher CIP priority groups on opposite sides. ' +
          'Diastereomers possess distinct physical properties (different melting points, dipole moments, boiling points, and solubility).',
        chemicalReactions: [
          'cis-2-Butene: Dipole μ = 0.33 D · Boiling Pt = +3.7 °C',
          'trans-2-Butene: Dipole μ = 0.00 D · Boiling Pt = +0.9 °C',
        ],
        keyTerminology: [
          { term: 'Diastereomers', definition: 'Stereoisomers that are not mirror images of one another.' },
          { term: 'CIP E/Z Nomenclature', definition: 'Rigorous stereochemical descriptor based on atomic number priorities.' },
        ],
        highlightComponentIds: ['alkene-double-bond'],
        recommendedCamera: { position: [0, 3.5, 5.0], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('front-carbon', {
      id: 'front-carbon',
      name: 'Front Carbon Atom (C1)',
      category: 'atom',
      material: 'sp³ Carbon Center',
      scientificRole: 'Acts as pivot axis in Newman projection representation.',
      specifications: 'Tetrahedral geometry · C–C Bond Length: 1.54 Å',
      anchorPosition: [0, 0, 0.77],
    });

    this.components.set('rear-carbon', {
      id: 'rear-carbon',
      name: 'Rear Carbon Atom (C2)',
      category: 'atom',
      material: 'sp³ Carbon Center',
      scientificRole: 'Rotates relative to front carbon to establish variable dihedral angles.',
      specifications: 'Rotational Degree of Freedom: 0° to 360°',
      anchorPosition: [0, 0, -0.77],
    });

    this.components.set('cc-sigma-bond', {
      id: 'cc-sigma-bond',
      name: 'C–C Single σ-Bond Axis',
      category: 'bond',
      material: 'Axial C(sp³)–C(sp³) Overlap',
      scientificRole: 'Cylindrically symmetric covalent bond permitting low-barrier internal rotation.',
      specifications: 'Bond Dissociation Energy: 348 kJ/mol · Torsional Barrier: 12 kJ/mol',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('chiral-center', {
      id: 'chiral-center',
      name: 'Asymmetric Chiral Carbon C*',
      category: 'stereocenter',
      material: 'sp³ Carbon with 4 Distinct Substituents',
      scientificRole: 'Lacks plane of symmetry (C_s) or inversion center (C_i); imparts molecular chirality.',
      specifications: 'Substituents: –OH, –COOH, –CH₃, –H · Point Group: C₁',
      anchorPosition: [0, 0, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.currentMoleculeType = 'ethane';
      this.currentProjection = '3d';
      this.dihedralAngleDeg = 60;
    } else if (stageIndex === 1) {
      this.currentMoleculeType = 'ethane';
      this.currentProjection = 'newman';
      this.dihedralAngleDeg = 60;
    } else if (stageIndex === 2) {
      this.currentMoleculeType = 'butane';
      this.currentProjection = '3d';
      this.dihedralAngleDeg = 180;
    } else if (stageIndex === 3) {
      this.currentMoleculeType = 'chiral';
      this.currentProjection = '3d';
    } else {
      this.currentMoleculeType = 'ez_alkene';
      this.currentProjection = '3d';
    }

    this.buildCurrentState();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'dihedral' && typeof value === 'number') {
      this.dihedralAngleDeg = value;
      this.rearCarbonGroup.rotation.z = (value * Math.PI) / 180;
      this.updateMetrics();
    }
  }

  private buildCurrentState(): void {
    this.frontCarbonGroup?.clear();
    this.rearCarbonGroup?.clear();
    this.mirrorPlaneGroup?.clear();

    if (this.currentMoleculeType === 'ethane') {
      this.buildEthane();
    } else if (this.currentMoleculeType === 'butane') {
      this.buildButane();
    } else if (this.currentMoleculeType === 'chiral') {
      this.buildChiralPair();
    } else {
      this.buildEZAlkene();
    }

    // Set camera for projection
    if (this.currentProjection === 'newman') {
      this.animateCameraTo([0, 0, 5.5], [0, 0, 0], 0.8);
    } else if (this.currentProjection === 'sawhorse') {
      this.animateCameraTo([3.2, 2.5, 3.8], [0, 0, 0], 0.8);
    }

    this.syncAnnotations();
    this.updateMetrics();
    this.notifyState();
  }

  private buildEthane(): void {
    const c1Pos = new THREE.Vector3(0, 0, 0.77);
    const c2Pos = new THREE.Vector3(0, 0, -0.77);

    // Front Carbon (C1)
    const c1 = MolecularBuilder.createAtom('C', [0, 0, 0], 0.52);
    this.frontCarbonGroup.position.copy(c1Pos);
    this.frontCarbonGroup.add(c1);

    // Front 3 Hydrogens at 120° in xy-plane, tilted slightly forward
    const r = 1.05;
    for (let i = 0; i < 3; i++) {
      const ang = (i * 2 * Math.PI) / 3;
      const hPos = new THREE.Vector3(r * Math.cos(ang), r * Math.sin(ang), 0.35);
      const hMesh = MolecularBuilder.createAtom('H', hPos, 0.38);
      const bond = MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), hPos, 1, 0.06);
      this.frontCarbonGroup.add(hMesh, bond);
    }

    // Rear Carbon (C2)
    const c2 = MolecularBuilder.createAtom('C', [0, 0, 0], 0.52);
    this.rearCarbonGroup.position.copy(c2Pos);
    this.rearCarbonGroup.add(c2);

    // Rear 3 Hydrogens
    for (let i = 0; i < 3; i++) {
      const ang = (i * 2 * Math.PI) / 3;
      const hPos = new THREE.Vector3(r * Math.cos(ang), r * Math.sin(ang), -0.35);
      const hMesh = MolecularBuilder.createAtom('H', hPos, 0.38);
      const bond = MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), hPos, 1, 0.06);
      this.rearCarbonGroup.add(hMesh, bond);
    }

    // C–C bond connecting groups
    const ccBond = MolecularBuilder.createBond(c1Pos, c2Pos, 1, 0.08);
    this.moleculeGroup.add(ccBond);

    // Apply dihedral rotation
    this.rearCarbonGroup.rotation.z = (this.dihedralAngleDeg * Math.PI) / 180;
  }

  private buildButane(): void {
    this.buildEthane();

    // Replace one H on front with Methyl CH₃ and one H on rear with Methyl CH₃
    const meFront = MolecularBuilder.createAtom('C', [0, 1.35, 0.45], 0.52, 0x0ea5e9);
    this.frontCarbonGroup.add(meFront);

    const meRear = MolecularBuilder.createAtom('C', [0, 1.35, -0.45], 0.52, 0x0ea5e9);
    this.rearCarbonGroup.add(meRear);
  }

  private buildChiralPair(): void {
    // Show (S)-Lactic acid on left, Mirror plane in middle, (R)-Lactic acid on right
    // Mirror plane at x = 0
    const planeGeo = new THREE.PlaneGeometry(3.0, 4.5);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.8,
    });
    const mirrorMesh = new THREE.Mesh(planeGeo, planeMat);
    mirrorMesh.position.set(0, 0, 0);
    this.mirrorPlaneGroup.add(mirrorMesh);

    // Function to build lactic acid molecule at specified x offset and chiral handedness
    const buildLactic = (offsetX: number, invertHandedness: boolean) => {
      const group = new THREE.Group();
      group.position.x = offsetX;

      const cCenter = MolecularBuilder.createAtom('C', [0, 0, 0], 0.55);
      group.add(cCenter);

      // Substituents: -OH (top), -COOH (right/left), -CH3 (bottom front), -H (bottom rear)
      const sign = invertHandedness ? -1 : 1;
      const ohPos = new THREE.Vector3(0, 1.3, 0);
      const coohPos = new THREE.Vector3(1.25 * sign, -0.35, 0);
      const ch3Pos = new THREE.Vector3(-0.6 * sign, -0.9, 0.95);
      const hPos = new THREE.Vector3(-0.6 * sign, -0.9, -0.95);

      const oh = MolecularBuilder.createAtom('O', ohPos, 0.48);
      const cooh = MolecularBuilder.createAtom('C', coohPos, 0.48, 0xef4444);
      const ch3 = MolecularBuilder.createAtom('C', ch3Pos, 0.48, 0x0ea5e9);
      const h = MolecularBuilder.createAtom('H', hPos, 0.35);

      group.add(
        oh, cooh, ch3, h,
        MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), ohPos, 1, 0.06),
        MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), coohPos, 1, 0.06),
        MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), ch3Pos, 1, 0.06),
        MolecularBuilder.createBond(new THREE.Vector3(0, 0, 0), hPos, 1, 0.06)
      );

      return group;
    };

    const leftEnantiomer = buildLactic(-1.85, false);
    const rightEnantiomer = buildLactic(1.85, true);

    this.moleculeGroup.add(leftEnantiomer, rightEnantiomer);
  }

  private buildEZAlkene(): void {
    // 2-Butene cis vs trans
    const c1Pos = new THREE.Vector3(-0.7, 0, 0);
    const c2Pos = new THREE.Vector3(0.7, 0, 0);

    const c1 = MolecularBuilder.createAtom('C', c1Pos, 0.52);
    const c2 = MolecularBuilder.createAtom('C', c2Pos, 0.52);
    const doubleBond = MolecularBuilder.createBond(c1Pos, c2Pos, 2, 0.07);

    // Substituents
    const ch3_1 = MolecularBuilder.createAtom('C', [-1.6, 1.0, 0], 0.48, 0x0ea5e9);
    const h1 = MolecularBuilder.createAtom('H', [-1.6, -1.0, 0], 0.35);

    const ch3_2 = MolecularBuilder.createAtom('C', [1.6, 1.0, 0], 0.48, 0x0ea5e9);
    const h2 = MolecularBuilder.createAtom('H', [1.6, -1.0, 0], 0.35);

    this.moleculeGroup.add(
      c1, c2, doubleBond,
      ch3_1, h1, ch3_2, h2,
      MolecularBuilder.createBond(c1Pos, new THREE.Vector3(-1.6, 1.0, 0), 1, 0.06),
      MolecularBuilder.createBond(c1Pos, new THREE.Vector3(-1.6, -1.0, 0), 1, 0.06),
      MolecularBuilder.createBond(c2Pos, new THREE.Vector3(1.6, 1.0, 0), 1, 0.06),
      MolecularBuilder.createBond(c2Pos, new THREE.Vector3(1.6, -1.0, 0), 1, 0.06)
    );
  }

  private updateMetrics(): void {
    if (this.currentMoleculeType === 'ethane') {
      const isStaggered = Math.abs((this.dihedralAngleDeg % 120) - 60) < 5;
      const isEclipsed = Math.abs(this.dihedralAngleDeg % 120) < 5;
      const energy = 6.0 * (1 - Math.cos((3 * this.dihedralAngleDeg * Math.PI) / 180));

      this.metrics = {
        'Molecule': 'Ethane (CH₃–CH₃)',
        'Dihedral Angle (θ)': `${this.dihedralAngleDeg.toFixed(1)}°`,
        'Conformation': isStaggered ? 'Staggered (Energy Minimum)' : isEclipsed ? 'Eclipsed (Energy Maximum)' : 'Skew Conformation',
        'Torsional Strain': `${energy.toFixed(2)} kJ/mol`,
        'Projection Mode': this.currentProjection.toUpperCase(),
      };
    } else if (this.currentMoleculeType === 'butane') {
      this.metrics = {
        'Molecule': 'n-Butane (CH₃–CH₂–CH₂–CH₃)',
        'Dihedral Angle': `${this.dihedralAngleDeg.toFixed(1)}°`,
        'Torsional + Steric Energy': this.dihedralAngleDeg === 180 ? '0.0 kJ/mol (Anti)' : this.dihedralAngleDeg === 60 ? '3.8 kJ/mol (Gauche)' : '19.0 kJ/mol (Syn)',
      };
    } else if (this.currentMoleculeType === 'chiral') {
      this.metrics = {
        'Pair': 'Lactic Acid Enantiomers',
        'Left Molecule': '(S)-(+)-Lactic Acid',
        'Right Molecule': '(R)-(-)-Lactic Acid',
        'Mirror Plane': 'Non-Superimposable',
        'Optical Rotation': 'Equal & Opposite (±3.8°)',
      };
    } else {
      this.metrics = {
        'Alkene System': '(Z)-2-Butene (cis)',
        'Rotational Barrier': '264 kJ/mol (Rigid π bond)',
        'Dipole Moment': '0.33 D',
        'Diastereomer': '(E)-2-Butene (trans, μ = 0 D)',
      };
    }
  }

  protected updateSimulation(_delta: number, time: number): void {
    // If not paused, slowly rotate molecule for spatial viewing when in 3D mode
    if (this.currentProjection === '3d' && this.currentMoleculeType !== 'chiral') {
      this.moleculeGroup.rotation.y = time * 0.2;
    } else {
      this.moleculeGroup.rotation.y = 0;
    }
  }
}

export function mountStereochemistrySimulation(
  container: HTMLElement,
  options?: any
): StereochemistryScene {
  return new StereochemistryScene(container, options);
}
