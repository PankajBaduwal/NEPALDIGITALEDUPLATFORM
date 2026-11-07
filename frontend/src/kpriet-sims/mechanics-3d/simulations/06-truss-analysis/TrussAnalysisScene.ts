/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 06: Truss Analysis by Method of Joints
 * Unit II: Equilibrium of Rigid Bodies & Pin-Jointed Trusses
 *
 * Demonstrates:
 * - Ideal two-force member behavior (pure axial tension vs compression)
 * - Sequential equilibrium of concurrent joints (ΣFx = 0, ΣFy = 0)
 * - Zero-force member identification rules
 * - Visual tension (green) vs compression (red) stress distribution
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { VectorRenderer } from '../../core/VectorRenderer';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';

interface MemberData {
  id: string;
  name: string;
  from: string;
  to: string;
  force: number; // positive = tension, negative = compression
  mesh?: THREE.Mesh;
}

export class TrussAnalysisScene extends BaseMechanicsSimulation {
  private trussGroup = new THREE.Group();
  private jointsGroup = new THREE.Group();
  private loadsGroup = new THREE.Group();
  private reactionsGroup = new THREE.Group();
  private supportsGroup = new THREE.Group();

  // Joint coordinates (Pratt-Warren 5-node triangular truss)
  // Joint A (0,0), Joint B (2,0), Joint C (4,0), Joint D (1, 1.732), Joint E (3, 1.732)
  private joints = new Map<string, THREE.Vector3>([
    ['A', new THREE.Vector3(0, 0, 0)],
    ['B', new THREE.Vector3(2, 0, 0)],
    ['C', new THREE.Vector3(4, 0, 0)],
    ['D', new THREE.Vector3(1, 1.732, 0)],
    ['E', new THREE.Vector3(3, 1.732, 0)],
  ]);

  private members: MemberData[] = [
    { id: 'AB', name: 'Bottom Chort Member AB', from: 'A', to: 'B', force: 0 },
    { id: 'BC', name: 'Bottom Chord Member BC', from: 'B', to: 'C', force: 0 },
    { id: 'AD', name: 'Left Incline Member AD', from: 'A', to: 'D', force: 0 },
    { id: 'DE', name: 'Top Chord Member DE', from: 'D', to: 'E', force: 0 },
    { id: 'EC', name: 'Right Incline Member EC', from: 'E', to: 'C', force: 0 },
    { id: 'DB', name: 'Internal Web Member DB', from: 'D', to: 'B', force: 0 },
    { id: 'EB', name: 'Internal Web Member EB', from: 'E', to: 'B', force: 0 },
  ];

  private appliedLoadP = 50; // kN applied at Joint B downwards

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(12, 10);
    ground.position.y = -1.0;
    this.scene.add(ground);

    this.scene.add(this.trussGroup);
    this.scene.add(this.jointsGroup);
    this.scene.add(this.loadsGroup);
    this.scene.add(this.reactionsGroup);
    this.scene.add(this.supportsGroup);

    this.parameters['appliedLoad'] = 50;
    this.parameters['solveStep'] = 'all';

    this.solveTruss();
    this.rebuildVisuals();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-truss-geometry',
        index: 0,
        title: 'Stage 1: Two-Force Member Assumptions & External Reactions',
        shortDescription: 'Ideal pin-jointed truss: members experience only axial tension or compression without bending moments.',
        detailedExplanation:
          'In engineering mechanics, a simple planar truss consists of straight slender members connected at their ends by frictionless pins. ' +
          'All external loads are applied strictly at the joints. Consequently, every member is an ideal two-force member carrying purely axial force. ' +
          'Overall equilibrium (ΣFx = 0, ΣFy = 0, ΣMA = 0) determines external reactions: Ay = By = P / 2 = 25 kN for symmetric loading.',
        principles: [
          'Ideal Two-Force Member Hypothesis: Axial tension or compression only',
          'Frictionless Pin Joints with coplanar concurrent forces',
          'Determinacy condition: m = 2j - r (7 = 2(5) - 3 = 7)',
        ],
        equations: [
          'm = 2j - 3 \\quad \\text{(Static Determinacy Criterion)}',
          'A_y = C_y = \\frac{P}{2} = 25 \\text{ kN}',
        ],
        keyTerminology: [
          { term: 'Two-Force Member', definition: 'A structural member subjected to equal and opposite collinear forces at its ends.' },
          { term: 'Method of Joints', definition: 'Analyzing truss equilibrium joint-by-joint as concurrent particle systems.' },
        ],
        highlightComponentIds: ['member-AD', 'member-AB'],
        recommendedCamera: { position: [2, 1.8, 6.2], target: [2, 0.8, 0] },
      },
      {
        id: 'stage-joint-a-equilibrium',
        index: 1,
        title: 'Stage 2: Joint A Equilibrium (Solving Members AD and AB)',
        shortDescription: 'Isolate Joint A: ΣFy = 0 gives compression in AD (-28.9 kN); ΣFx = 0 gives tension in AB (+14.4 kN).',
        detailedExplanation:
          'Isolating Joint A yields two concurrent equations: ' +
          '1. ΣFy = Ay + F_AD · sin(60°) = 0 ⟹ F_AD = -Ay / sin(60°) = -25 / 0.866 = -28.9 kN (Compression). ' +
          '2. ΣFx = F_AB + F_AD · cos(60°) = 0 ⟹ F_AB = -(-28.9) · 0.5 = +14.4 kN (Tension). ' +
          'Positive signs denote tension (pulling away from joint); negative signs denote compression (pushing into joint).',
        principles: [
          'Tension (Green): Pulls away from joint pin',
          'Compression (Red): Pushes into joint pin',
        ],
        equations: [
          'F_{AD} = -\\frac{A_y}{\\sin(60^\\circ)} = -28.9 \\text{ kN (Compression)}',
          'F_{AB} = -F_{AD} \\cos(60^\\circ) = +14.4 \\text{ kN (Tension)}',
        ],
        keyTerminology: [
          { term: 'Tensile Force (+)', definition: 'Tends to elongate the member; pulls outward on the connecting pin.' },
          { term: 'Compressive Force (-)', definition: 'Tends to shorten the member; pushes inward against the connecting pin.' },
        ],
        highlightComponentIds: ['member-AD', 'member-AB'],
        recommendedCamera: { position: [2, 1.8, 6.2], target: [2, 0.8, 0] },
      },
      {
        id: 'stage-joint-d-equilibrium',
        index: 2,
        title: 'Stage 3: Joint D Equilibrium (Solving Top Chord DE and Web DB)',
        shortDescription: 'Isolate Joint D: F_DE = -28.9 kN (Compression) and F_DB = +28.9 kN (Tension).',
        detailedExplanation:
          'At Joint D, member forces F_AD is known from Joint A. ' +
          'Resolving perpendicular and parallel to the top chord yields the internal web tension F_DB and top chord compression F_DE. ' +
          'The top chord is subjected to heavy compression, which in structural design requires checking for Euler column buckling.',
        principles: [
          'Top Chord carries compressive forces in positive bending',
          'Web diagonals alternate between tension and compression',
        ],
        equations: [
          'F_{DE} = -28.9 \\text{ kN (Compression)}',
          'F_{DB} = +28.9 \\text{ kN (Tension)}',
        ],
        keyTerminology: [
          { term: 'Web Member', definition: 'Diagonal or vertical member connecting the top and bottom chords.' },
        ],
        highlightComponentIds: ['member-DE', 'member-DB'],
        recommendedCamera: { position: [2, 1.8, 6.2], target: [2, 0.8, 0] },
      },
      {
        id: 'stage-full-stress-distribution',
        index: 3,
        title: 'Stage 4: Complete Internal Axial Force Distribution',
        shortDescription: 'Review complete color-coded truss force map: Green = Tension, Red = Compression.',
        detailedExplanation:
          'The full truss force distribution illustrates the load path: ' +
          'Downward force P at central joint B pulls web members DB and EB in tension (+28.9 kN), ' +
          'which transfer load up to top joints D and E, squeezing top chord DE in compression (-28.9 kN) ' +
          'and inclines AD and EC in compression (-28.9 kN), while bottom chord AB and BC are stretched in tension (+14.4 kN).',
        principles: [
          'Load Path: Force travels through web members to supports',
          'Symmetry: Symmetrical truss under central load has identical mirrored member forces',
        ],
        equations: [
          'F_{AB} = F_{BC} = +14.4 \\text{ kN (T)}',
          'F_{AD} = F_{EC} = -28.9 \\text{ kN (C)}',
          'F_{DB} = F_{EB} = +28.9 \\text{ kN (T)}',
          'F_{DE} = -28.9 \\text{ kN (C)}',
        ],
        keyTerminology: [
          { term: 'Load Path', definition: 'The continuous sequence of structural members transferring load down to foundations.' },
        ],
        highlightComponentIds: ['member-AB', 'member-BC', 'member-DE'],
        recommendedCamera: { position: [2, 1.8, 6.2], target: [2, 0.8, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('member-AD', {
      id: 'member-AD',
      name: 'Left Incline Member AD',
      category: 'member',
      material: 'Compressive Structural Steel Strut (Red)',
      scientificRole: 'Transfers upper joint loads down to pin support A under heavy compression.',
      specifications: 'Force: -28.9 kN (Compression) · Length: 2.0 m',
      anchorPosition: [0.5, 0.866, 0],
    });

    this.components.set('member-AB', {
      id: 'member-AB',
      name: 'Bottom Chord Member AB',
      category: 'member',
      material: 'Tensile Structural Steel Tie (Green)',
      scientificRole: 'Resists horizontal spreading of the truss base under tension.',
      specifications: 'Force: +14.4 kN (Tension) · Length: 2.0 m',
      anchorPosition: [1.0, 0, 0],
    });

    this.components.set('member-DE', {
      id: 'member-DE',
      name: 'Top Chord Member DE',
      category: 'member',
      material: 'Compressive Top Flange Strut (Red)',
      scientificRole: 'Carries primary compressive bending thrust across the apex.',
      specifications: 'Force: -28.9 kN (Compression) · Length: 2.0 m',
      anchorPosition: [2.0, 1.732, 0],
    });

    this.components.set('member-DB', {
      id: 'member-DB',
      name: 'Diagonal Web Member DB',
      category: 'member',
      material: 'Tensile Web Diagonal (Green)',
      scientificRole: 'Transfers vertical load from joint B up to apex joint D.',
      specifications: 'Force: +28.9 kN (Tension) · Length: 2.0 m',
      anchorPosition: [1.5, 0.866, 0],
    });
  }

  private solveTruss(): void {
    const P = this.appliedLoadP;
    const sin60 = Math.sin(Math.PI / 3);
    const cos60 = Math.cos(Math.PI / 3);

    const Ay = P / 2; // 25 kN
    const F_AD = -Ay / sin60; // -28.87 kN (Compression)
    const F_AB = -F_AD * cos60; // +14.43 kN (Tension)
    const F_DB = Ay / sin60; // +28.87 kN (Tension)
    const F_DE = -F_DB * cos60 - F_AD * cos60; // -28.87 kN (Compression)
    const F_EB = F_DB;
    const F_BC = F_AB;
    const F_EC = F_AD;

    this.members.forEach((m) => {
      if (m.id === 'AB') m.force = F_AB;
      if (m.id === 'BC') m.force = F_BC;
      if (m.id === 'AD') m.force = F_AD;
      if (m.id === 'DE') m.force = F_DE;
      if (m.id === 'EC') m.force = F_EC;
      if (m.id === 'DB') m.force = F_DB;
      if (m.id === 'EB') m.force = F_EB;
    });

    this.metrics['Applied Load P'] = `${P} kN at Joint B`;
    this.metrics['Support Reaction Ay'] = `${Ay.toFixed(1)} kN`;
    this.metrics['Support Reaction Cy'] = `${Ay.toFixed(1)} kN`;
    this.metrics['Max Tension'] = `${F_DB.toFixed(1)} kN (DB, EB)`;
    this.metrics['Max Compression'] = `${Math.abs(F_AD).toFixed(1)} kN (AD, EC, DE)`;
  }

  private rebuildVisuals(): void {
    this.trussGroup.clear();
    this.jointsGroup.clear();
    this.loadsGroup.clear();
    this.reactionsGroup.clear();
    this.supportsGroup.clear();

    // 1. Members
    this.members.forEach((m) => {
      const p1 = this.joints.get(m.from)!;
      const p2 = this.joints.get(m.to)!;
      const dist = p1.distanceTo(p2);

      const color = m.force > 0.1 ? 0x10b981 : m.force < -0.1 ? 0xef4444 : 0x94a3b8;
      const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.3 });

      const geo = new THREE.CylinderGeometry(0.045, 0.045, dist, 16);
      geo.translate(0, dist / 2, 0);

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(p1);

      const up = new THREE.Vector3(0, 1, 0);
      const dir = p2.clone().sub(p1).normalize();
      mesh.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir));

      m.mesh = mesh;
      this.trussGroup.add(mesh);
    });

    // 2. Gusset Pins at Joints
    this.joints.forEach((pos) => {
      const pinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 16);
      pinGeo.rotateX(Math.PI / 2);
      const pin = new THREE.Mesh(pinGeo, MechanicalBuilder.materials.darkSteel);
      pin.position.copy(pos);
      this.jointsGroup.add(pin);
    });

    // 3. Supports at A and C
    const pinSupport = MechanicalBuilder.createPinSupport(0.4);
    pinSupport.position.copy(this.joints.get('A')!);
    this.supportsGroup.add(pinSupport);

    const rollerSupport = MechanicalBuilder.createRollerSupport(0.4);
    rollerSupport.position.copy(this.joints.get('C')!);
    this.supportsGroup.add(rollerSupport);

    // 4. Applied Load Vector at B
    const loadPos = this.joints.get('B')!;
    const loadArrow = VectorRenderer.createForceArrow(
      loadPos.clone().add(new THREE.Vector3(0, -0.1, 0)),
      new THREE.Vector3(0, -this.appliedLoadP * 0.025, 0),
      0x2563eb,
      { shaftRadius: 0.04, headRadius: 0.1 }
    );
    this.loadsGroup.add(loadArrow);

    // 5. Upward Reactions at A and C
    const ry = (this.appliedLoadP / 2) * 0.025;
    this.reactionsGroup.add(VectorRenderer.createForceArrow(new THREE.Vector3(0, -0.4, 0), new THREE.Vector3(0, ry, 0), 0x10b981));
    this.reactionsGroup.add(VectorRenderer.createForceArrow(new THREE.Vector3(4, -0.4, 0), new THREE.Vector3(0, ry, 0), 0x10b981));

    this.notifyState();
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.appliedLoadP = 50.0;
    } else if (stageIndex === 1) {
      this.appliedLoadP = 50.0;
    } else if (stageIndex === 2) {
      this.appliedLoadP = 50.0;
    } else if (stageIndex === 3) {
      this.appliedLoadP = 60.0;
    }
    this.parameters['appliedLoad'] = this.appliedLoadP;
    this.solveTruss();
    this.rebuildVisuals();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'appliedLoad') {
      this.appliedLoadP = Number(value);
      this.solveTruss();
      this.rebuildVisuals();
    }
  }

  protected updatePhysics(_deltaTime: number): void {}
  protected updateVisuals(_deltaTime: number): void {}
}

export function mountTrussAnalysisSimulation(container: HTMLElement, options?: SimulationOptions) {
  return new TrussAnalysisScene(container, options);
}
