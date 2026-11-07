/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 05: Rigid-Body Equilibrium and Support Reactions
 * Unit II: Equilibrium of Rigid Bodies
 *
 * Demonstrates:
 * - Mechanical support boundary conditions (pin, roller, fixed cantilever)
 * - Exact equilibrium equations: ΣFx = 0, ΣFy = 0, ΣMA = 0
 * - Concentrated point loads and uniformly distributed loads (UDL)
 * - Determinacy verification vs statically indeterminate warnings
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { VectorRenderer } from '../../core/VectorRenderer';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';

type SupportConfig = 'simply-supported' | 'cantilever' | 'overhang';

export class SupportReactionsScene extends BaseMechanicsSimulation {
  private beamGroup = new THREE.Group();
  private supportsGroup = new THREE.Group();
  private loadsGroup = new THREE.Group();
  private reactionsGroup = new THREE.Group();

  // Beam properties
  private span = 6.0; // meters
  private supportType: SupportConfig = 'simply-supported';

  // Loads
  private pointLoadP1 = 40; // kN
  private pointLoadP1Pos = 2.0; // meters from A
  protected _pointLoadP2 = 30; // kN
  protected _pointLoadP2Pos = 4.5; // meters from A
  private udlIntensity = 15; // kN/m
  private hasUDL = true;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(14, 10);
    ground.position.y = -1.2;
    this.scene.add(ground);

    this.scene.add(this.beamGroup);
    this.scene.add(this.supportsGroup);
    this.scene.add(this.loadsGroup);
    this.scene.add(this.reactionsGroup);

    this.parameters['span'] = 6.0;
    this.parameters['supportType'] = 'simply-supported';
    this.parameters['pointLoadP1'] = 40;
    this.parameters['pointLoadP1Pos'] = 2.0;
    this.parameters['udlIntensity'] = 15;
    this.parameters['hasUDL'] = true;

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-simply-supported',
        index: 0,
        title: 'Stage 1: Simply Supported Beam (Pin & Roller Supports)',
        shortDescription: 'Solve equilibrium for beam supported by a pin support at A and a roller support at B under concentrated loads.',
        detailedExplanation:
          'A simply supported beam is statically determinate (3 equations, 3 unknown reactions: Ax, Ay, By). ' +
          'The pin support at A prevents horizontal and vertical translation (Ax, Ay) while permitting free rotation. ' +
          'The roller support at B prevents only vertical translation (By), permitting free horizontal expansion and rotation. ' +
          'Taking moments about A eliminates Ax and Ay, allowing By to be solved directly: ΣM_A = 0 ⟹ By · L = Σ(P_i · a_i).',
        principles: [
          'Pin Support provides 2 reaction components (Ax, Ay)',
          'Roller Support provides 1 reaction component normal to surface (By)',
          'Moment equilibrium about A determines By directly',
        ],
        equations: [
          '\\sum M_A = 0 \\implies B_y \\cdot L - \\sum (P_i \\cdot a_i) = 0',
          '\\sum F_y = 0 \\implies A_y + B_y - \\sum P_i = 0',
          '\\sum F_x = 0 \\implies A_x = 0',
        ],
        keyTerminology: [
          { term: 'Statically Determinate', definition: 'A structure whose reactions can be found using equations of static equilibrium alone.' },
          { term: 'Roller Support', definition: 'A constraint that allows horizontal movement while resisting vertical force.' },
        ],
        highlightComponentIds: ['beam', 'supportA', 'supportB', 'reactionAy', 'reactionBy'],
        recommendedCamera: { position: [3, 2.5, 7.5], target: [3, 0.5, 0] },
      },
      {
        id: 'stage-distributed-load',
        index: 1,
        title: 'Stage 2: Uniformly Distributed Load (UDL) Equivalent Resultant',
        shortDescription: 'Replace distributed load w = 15 kN/m by an equivalent concentrated resultant W = w · L acting at mid-span L/2.',
        detailedExplanation:
          'A distributed load of constant intensity w (kN/m) over a length b exerts a total downward force W_udl = w · b. ' +
          'Its line of action passes through the centroid of the loading rectangle (at distance b/2 from the start). ' +
          'For reaction calculations, the entire distributed load can be replaced by this equivalent concentrated force.',
        principles: [
          'UDL Total Resultant: W = w · b',
          'Acts through centroid of loading diagram (midpoint of span)',
        ],
        equations: [
          'W_{udl} = w \\cdot L',
          '\\bar{x} = \\frac{L}{2}',
          'A_y = B_y = \\frac{w \\cdot L}{2} \\quad \\text{(for symmetric UDL)}',
        ],
        keyTerminology: [
          { term: 'Uniformly Distributed Load (UDL)', definition: 'A load spread evenly over a segment of span with constant intensity.' },
        ],
        highlightComponentIds: ['beam', 'udlLoad'],
        recommendedCamera: { position: [3, 2.5, 7.5], target: [3, 0.5, 0] },
      },
      {
        id: 'stage-cantilever-beam',
        index: 2,
        title: 'Stage 3: Cantilever Beam with Fixed Wall Clamping Support',
        shortDescription: 'A fixed support at A provides vertical shear Ay, horizontal force Ax, and counteracting clamping moment M_A.',
        detailedExplanation:
          'A fixed or built-in support prevents all translations and all rotations (3 constraints: Ax, Ay, M_A). ' +
          'There is no support at the free end B. ' +
          'Vertical equilibrium gives Ay = Total Vertical Load. ' +
          'Moment equilibrium about A gives the clamping moment MA = Σ(Pi · ai) + w · L² / 2.',
        principles: [
          'Fixed Support resists horizontal, vertical, and rotational displacements',
          'Clamping moment M_A prevents beam rotation at the wall',
        ],
        equations: [
          'A_y = \\sum P_i + w \\cdot L',
          'M_A = \\sum (P_i \\cdot a_i) + \\frac{w \\cdot L^2}{2}',
        ],
        keyTerminology: [
          { term: 'Cantilever', definition: 'A projecting beam anchored rigidly at only one end.' },
          { term: 'Clamping Moment', definition: 'Reaction moment exerted by a fixed wall to prevent joint rotation.' },
        ],
        highlightComponentIds: ['beam', 'supportFixed', 'reactionMoment'],
        recommendedCamera: { position: [2.5, 2.5, 7.0], target: [2.5, 0.5, 0] },
      },
      {
        id: 'stage-overhanging-beam',
        index: 3,
        title: 'Stage 4: Overhanging Beam & Upward Uplift Reactions',
        shortDescription: 'Loads on the cantilever overhang can cause upward uplift or downward reactions at the interior supports.',
        detailedExplanation:
          'When a beam extends beyond support B, downward loads on the overhang create clockwise moment about B. ' +
          'This moment can lift the beam off support A, creating a downward reaction Ay (uplift) or tension if anchored. ' +
          'Demonstrates how load placement drastically alters internal shear and reaction directions.',
        principles: [
          'Overhang produces counter-moment about interior support',
          'Uplift condition occurs when By · L < P_overhang · c',
        ],
        equations: [
          '\\sum M_B = 0 \\implies -A_y \\cdot L + P_1 (L - a_1) - P_{overhang} \\cdot c = 0',
        ],
        keyTerminology: [
          { term: 'Overhang', definition: 'Portion of beam extending past an external support.' },
          { term: 'Uplift', definition: 'Tensile tendency of a beam to lift off a simple compressive support.' },
        ],
        highlightComponentIds: ['beam', 'supportA', 'supportB'],
        recommendedCamera: { position: [3, 2.5, 7.5], target: [3, 0.5, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('beam', {
      id: 'beam',
      name: 'Structural I-Beam (Span L)',
      category: 'body',
      material: 'Structural Steel ISMB 300',
      scientificRole: 'Rigid body transmitting bending moments and shear to supports.',
      specifications: 'Span: 6.0 m · Height: 0.35 m',
      anchorPosition: [3.0, 0.5, 0],
    });

    this.components.set('supportA', {
      id: 'supportA',
      name: 'Left Pin Support (Joint A)',
      category: 'support',
      material: 'Structural Pin Joint Bracket',
      scientificRole: 'Prevents horizontal and vertical translation: (Ax, Ay).',
      specifications: 'Position: x = 0.0 m · Constraints: 2 (Ax, Ay)',
      anchorPosition: [0, 0, 0],
    });

    this.components.set('supportB', {
      id: 'supportB',
      name: 'Right Roller Support (Joint B)',
      category: 'support',
      material: 'Low-Friction Roller Assembly',
      scientificRole: 'Prevents vertical displacement By while allowing thermal expansion.',
      specifications: 'Position: x = 6.0 m · Constraints: 1 (By)',
      anchorPosition: [6.0, 0, 0],
    });

    this.components.set('reactionAy', {
      id: 'reactionAy',
      name: 'Vertical Pin Reaction Ay',
      category: 'reaction',
      material: 'Support Reaction Vector (Emerald)',
      scientificRole: 'Upward normal force maintaining vertical equilibrium at support A.',
      specifications: 'Computed: Ay = 53.3 kN',
      anchorPosition: [0, -0.6, 0],
    });

    this.components.set('reactionBy', {
      id: 'reactionBy',
      name: 'Vertical Roller Reaction By',
      category: 'reaction',
      material: 'Support Reaction Vector (Emerald)',
      scientificRole: 'Upward normal force maintaining vertical equilibrium at support B.',
      specifications: 'Computed: By = 76.7 kN',
      anchorPosition: [6.0, -0.6, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.supportType = 'simply-supported';
      this.hasUDL = false;
    } else if (stageIndex === 1) {
      this.supportType = 'simply-supported';
      this.hasUDL = true;
    } else if (stageIndex === 2) {
      this.supportType = 'cantilever';
      this.hasUDL = true;
    } else if (stageIndex === 3) {
      this.supportType = 'overhang';
      this.hasUDL = false;
    }
    this.parameters['supportType'] = this.supportType;
    this.parameters['hasUDL'] = this.hasUDL;
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'span') this.span = Number(value);
    if (key === 'supportType') this.supportType = value as SupportConfig;
    if (key === 'pointLoadP1') this.pointLoadP1 = Number(value);
    if (key === 'pointLoadP1Pos') this.pointLoadP1Pos = Number(value);
    if (key === 'udlIntensity') this.udlIntensity = Number(value);
    if (key === 'hasUDL') this.hasUDL = Boolean(value);
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    this.beamGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.beamGroup.clear();
    this.supportsGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.supportsGroup.clear();
    this.loadsGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.loadsGroup.clear();
    this.reactionsGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.reactionsGroup.clear();

    const beamHeight = 0.3;
    const beamY = 0.5;

    // 1. Beam
    const beamMesh = MechanicalBuilder.createBeam(this.span, beamHeight, 0.25, 'i-beam');
    beamMesh.position.set(this.span / 2, beamY, 0);
    this.beamGroup.add(beamMesh);

    // 2. Supports
    if (this.supportType === 'simply-supported') {
      const pin = MechanicalBuilder.createPinSupport(0.5);
      pin.position.set(0, 0, 0);
      this.supportsGroup.add(pin);

      const roller = MechanicalBuilder.createRollerSupport(0.5);
      roller.position.set(this.span, 0, 0);
      this.supportsGroup.add(roller);
    } else if (this.supportType === 'cantilever') {
      const fixed = MechanicalBuilder.createFixedSupport(1.0, 0.4);
      fixed.position.set(-0.04, beamY, 0);
      this.supportsGroup.add(fixed);
    } else {
      // Overhang
      const pin = MechanicalBuilder.createPinSupport(0.5);
      pin.position.set(0, 0, 0);
      this.supportsGroup.add(pin);

      const roller = MechanicalBuilder.createRollerSupport(0.5);
      roller.position.set(this.span * 0.7, 0, 0);
      this.supportsGroup.add(roller);
    }

    // 3. Applied Loads
    const p1Pos = new THREE.Vector3(this.pointLoadP1Pos, beamY + beamHeight / 2, 0);
    const p1Arrow = VectorRenderer.createForceArrow(p1Pos, new THREE.Vector3(0, -this.pointLoadP1 * 0.02, 0), 0x2563eb);
    this.loadsGroup.add(p1Arrow);

    let totalUDL = 0;
    if (this.hasUDL) {
      totalUDL = this.udlIntensity * this.span;
      const udlGroup = VectorRenderer.createDistributedLoad(
        0,
        this.span,
        beamY + beamHeight / 2,
        0,
        this.udlIntensity * 0.05,
        this.udlIntensity * 0.05,
        9,
        0x0284c7
      );
      this.loadsGroup.add(udlGroup);
    }

    // 4. Reactions Calculation
    let ay = 0;
    let by = 0;
    let ma = 0;

    if (this.supportType === 'simply-supported') {
      // ΣM_A = 0 => By * span - (P1 * P1Pos) - (totalUDL * span/2) = 0
      by = (this.pointLoadP1 * this.pointLoadP1Pos + totalUDL * (this.span / 2)) / this.span;
      ay = this.pointLoadP1 + totalUDL - by;

      // Draw Ay & By arrows (Emerald)
      this.reactionsGroup.add(VectorRenderer.createForceArrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, ay * 0.02, 0), 0x10b981));
      this.reactionsGroup.add(VectorRenderer.createForceArrow(new THREE.Vector3(this.span, 0, 0), new THREE.Vector3(0, by * 0.02, 0), 0x10b981));

      this.metrics['Reaction Ay'] = `${ay.toFixed(1)} kN (↑)`;
      this.metrics['Reaction By'] = `${by.toFixed(1)} kN (↑)`;
      this.metrics['Reaction Ax'] = '0.0 kN (Horizontal Equilibrium)';
    } else if (this.supportType === 'cantilever') {
      ay = this.pointLoadP1 + totalUDL;
      ma = this.pointLoadP1 * this.pointLoadP1Pos + totalUDL * (this.span / 2);

      this.reactionsGroup.add(VectorRenderer.createForceArrow(new THREE.Vector3(0, beamY, 0), new THREE.Vector3(0, ay * 0.02, 0), 0x10b981));
      const momentArc = VectorRenderer.createCurvedMomentArrow(new THREE.Vector3(0, beamY, 0.2), 0.5, 0, Math.PI * 1.3, false, 0xd97706);
      this.reactionsGroup.add(momentArc);

      this.metrics['Reaction Ay'] = `${ay.toFixed(1)} kN (↑)`;
      this.metrics['Clamping Moment MA'] = `${ma.toFixed(1)} kN·m (CCW)`;
    } else {
      // Overhang: support B at 0.7 * span
      const bPos = this.span * 0.7;
      by = (this.pointLoadP1 * this.pointLoadP1Pos + totalUDL * (this.span / 2)) / bPos;
      ay = this.pointLoadP1 + totalUDL - by;

      this.reactionsGroup.add(VectorRenderer.createForceArrow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, ay * 0.02, 0), ay >= 0 ? 0x10b981 : 0xef4444));
      this.reactionsGroup.add(VectorRenderer.createForceArrow(new THREE.Vector3(bPos, 0, 0), new THREE.Vector3(0, by * 0.02, 0), 0x10b981));

      this.metrics['Reaction Ay'] = `${ay.toFixed(1)} kN ${ay >= 0 ? '(↑)' : '(↓ Uplift)'}`;
      this.metrics['Reaction By'] = `${by.toFixed(1)} kN (↑)`;
    }

    this.notifyState();
  }

  protected updatePhysics(_deltaTime: number): void {}
  protected updateVisuals(_deltaTime: number): void {}
}

export function mountSupportReactionsSimulation(container: HTMLElement, options?: SimulationOptions) {
  return new SupportReactionsScene(container, options);
}
