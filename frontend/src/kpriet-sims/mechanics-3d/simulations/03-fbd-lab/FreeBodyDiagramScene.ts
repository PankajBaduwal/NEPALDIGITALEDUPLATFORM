/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 03: Free-Body Diagram Laboratory
 * Unit I: Statics of Particles & Free-Body Analysis
 *
 * Demonstrates:
 * - Isolation of mechanical systems through conceptual cut boundaries
 * - Distinction between field forces (weight) and contact forces (normal, friction, tension)
 * - Support reaction modeling without third-law internal pair confusion
 * - Interactive force palette with automated analytical verification
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { VectorRenderer } from '../../core/VectorRenderer';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';

type ScenarioKey = 'block-incline' | 'suspended-knot' | 'ladder-wall' | 'supported-beam';

export class FreeBodyDiagramScene extends BaseMechanicsSimulation {
  private physicalAssemblyGroup = new THREE.Group();
  private isolatedBodyGroup = new THREE.Group();
  private fbdVectorsGroup = new THREE.Group();

  private activeScenario: ScenarioKey = 'block-incline';
  private showIsolatedOnly = false;

  // Active student toggles
  private studentForces = {
    weight: true,
    normal: true,
    friction: true,
    tension: false,
    applied: true,
    pinReactions: false,
    rollerReaction: false,
  };

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    this.scene.add(this.physicalAssemblyGroup);
    this.scene.add(this.isolatedBodyGroup);
    this.scene.add(this.fbdVectorsGroup);

    this.parameters['scenario'] = 'block-incline';
    this.parameters['isolatedView'] = false;
    this.parameters['includeWeight'] = true;
    this.parameters['includeNormal'] = true;
    this.parameters['includeFriction'] = true;
    this.parameters['includeApplied'] = true;

    this.rebuildScenario();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-isolated-boundary',
        index: 0,
        title: 'Stage 1: System Isolation & Boundary Identification',
        shortDescription: 'Draw a closed conceptual boundary isolating the body from all surrounding contact surfaces.',
        detailedExplanation:
          'A Free-Body Diagram (FBD) is a schematic drawing of an isolated physical body or subsystem, completely separated ' +
          'from its surroundings, showing all external forces and moments exerted ON the body by external agencies. ' +
          'Internal forces between particles of the body cancel in pairs (Newton\'s 3rd Law) and must never appear.',
        principles: [
          'Isolation Principle: Remove all physical supports and contacts',
          'Only forces acting ON the isolated body are drawn',
          'Never draw third-law action-reaction pairs on the same isolated body',
        ],
        equations: [
          '\\sum \\mathbf{F}_{ext} = 0 \\quad \\text{(Static Equilibrium)}',
        ],
        keyTerminology: [
          { term: 'Free-Body Diagram', definition: 'A diagram isolating a body and showing all external forces acting upon it.' },
          { term: 'External Force', definition: 'A force exerted on the system by an external agent outside the boundary.' },
        ],
        highlightComponentIds: ['isolated-body'],
        recommendedCamera: { position: [0, 2, 6], target: [0, 0.5, 0] },
      },
      {
        id: 'stage-field-forces',
        index: 1,
        title: 'Stage 2: Non-Contact Field Forces (Weight / Gravity)',
        shortDescription: 'Locate the center of gravity and apply the downward gravitational body force W = mg.',
        detailedExplanation:
          'Field forces act through space without requiring physical contact. Gravity acts vertically downward through the ' +
          'center of gravity of the isolated body regardless of whether the surface beneath is flat, inclined, or accelerating. ' +
          'A common misconception is orienting gravity perpendicular to an inclined ramp; gravity always points straight down toward Earth\'s center.',
        principles: [
          'Gravity vector is invariant to orientation: W = -m g ĵ',
          'Acts through center of gravity (CG)',
        ],
        equations: [
          '\\mathbf{W} = -m \\cdot g \\cdot \\hat{j}',
        ],
        keyTerminology: [
          { term: 'Body Force', definition: 'A force distributed over the entire volume of a body (e.g. gravity).' },
        ],
        highlightComponentIds: ['isolated-body', 'force-weight'],
        recommendedCamera: { position: [0, 2, 6], target: [0, 0.5, 0] },
      },
      {
        id: 'stage-contact-forces',
        index: 2,
        title: 'Stage 3: Normal Reactions, Friction & Applied Forces',
        shortDescription: 'Replace severed contact surfaces with perpendicular normal reactions N and tangential friction F.',
        detailedExplanation:
          'Wherever the boundary cuts across a physical contact surface, the contact interaction must be replaced by: ' +
          '1. A normal reaction N directed perpendicular to the contact plane pushing into the body (supports cannot pull). ' +
          '2. A friction force F acting tangentially along the contact plane, strictly opposing relative motion or impending slip.',
        principles: [
          'Normal Force N is strictly perpendicular (orthogonal) to the contact tangent',
          'Friction F is tangential and opposes impending relative displacement',
        ],
        equations: [
          '\\mathbf{R}_{contact} = \\mathbf{N} + \\mathbf{F}_s',
          'F_s \\le \\mu_s N',
        ],
        keyTerminology: [
          { term: 'Normal Reaction', definition: 'Compressive force preventing interpenetration across contact surfaces.' },
          { term: 'Friction Force', definition: 'Tangential shear resistance resisting surface sliding.' },
        ],
        highlightComponentIds: ['force-normal', 'force-friction'],
        recommendedCamera: { position: [0, 2, 6], target: [0, 0.5, 0] },
      },
      {
        id: 'stage-validation-test',
        index: 3,
        title: 'Stage 4: Automated FBD Verification & Error Diagnosis',
        shortDescription: 'Inspect completeness of the student\'s constructed diagram against rigorous Newtonian reference standards.',
        detailedExplanation:
          'Verify that all necessary forces are accounted for without omissions or extraneous forces. ' +
          'If the diagram matches the reference equilibrium model, equilibrium equations ΣFx = 0 and ΣFy = 0 can be successfully solved. ' +
          'Any missing force results in a mathematically indeterminate or physically erroneous calculation.',
        principles: [
          'Completeness: No necessary force omitted',
          'Parsimony: No internal or fictitious forces included',
        ],
        equations: [
          '\\sum F_x = 0, \\quad \\sum F_y = 0',
        ],
        keyTerminology: [
          { term: 'Equilibrium Verification', definition: 'Checking whether the force set is mathematically sufficient for statics.' },
        ],
        highlightComponentIds: ['isolated-body'],
        recommendedCamera: { position: [0, 2, 6], target: [0, 0.5, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('isolated-body', {
      id: 'isolated-body',
      name: 'Isolated System Body',
      category: 'body',
      material: 'Rigid Mechanical Subsystem',
      scientificRole: 'The primary physical object isolated within the conceptual free-body boundary.',
      specifications: 'Mass: 25 kg · Boundary: Closed 3D envelope',
      anchorPosition: [0, 0.6, 0],
    });

    this.components.set('force-weight', {
      id: 'force-weight',
      name: 'Gravitational Force Vector W',
      category: 'field-force',
      material: 'Gravity Field Interaction',
      scientificRole: 'Downward body force acting vertically through CG: W = mg = 245.3 N.',
      specifications: 'Magnitude: 245.3 N · Direction: Vertically downward (270°)',
      anchorPosition: [0, -0.4, 0],
    });

    this.components.set('force-normal', {
      id: 'force-normal',
      name: 'Normal Contact Reaction N',
      category: 'contact-force',
      material: 'Surface Compressive Interaction',
      scientificRole: 'Compressive reaction perpendicular to the supporting surface.',
      specifications: 'Direction: Normal to inclined plane (120°)',
      anchorPosition: [-0.3, 1.2, 0],
    });

    this.components.set('force-friction', {
      id: 'force-friction',
      name: 'Static Friction Force Fs',
      category: 'contact-force',
      material: 'Coulomb Contact Shear',
      scientificRole: 'Tangential reaction resisting downward sliding along the incline.',
      specifications: 'Direction: Upward parallel to incline (30°)',
      anchorPosition: [0.6, 0.9, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    this.showIsolatedOnly = stageIndex >= 1;
    this.parameters['isolatedView'] = this.showIsolatedOnly;
    this.rebuildScenario();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'scenario') this.activeScenario = value as ScenarioKey;
    if (key === 'isolatedView') this.showIsolatedOnly = Boolean(value);
    if (key === 'includeWeight') this.studentForces.weight = Boolean(value);
    if (key === 'includeNormal') this.studentForces.normal = Boolean(value);
    if (key === 'includeFriction') this.studentForces.friction = Boolean(value);
    if (key === 'includeApplied') this.studentForces.applied = Boolean(value);

    this.rebuildScenario();
  }

  private rebuildScenario(): void {
    this.physicalAssemblyGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.physicalAssemblyGroup.clear();
    this.isolatedBodyGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.isolatedBodyGroup.clear();
    this.fbdVectorsGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.fbdVectorsGroup.clear();

    if (this.activeScenario === 'block-incline') {
      const angleRad = (30 * Math.PI) / 180;

      // Physical ramp
      if (!this.showIsolatedOnly) {
        const rampShape = new THREE.Shape();
        rampShape.moveTo(-3, 0);
        rampShape.lineTo(3, 0);
        rampShape.lineTo(3, 3 * Math.tan(angleRad) * 2);
        rampShape.closePath();

        const rampGeo = new THREE.ExtrudeGeometry(rampShape, { depth: 1.2, bevelEnabled: false });
        rampGeo.translate(0, -0.2, -0.6);
        const rampMesh = new THREE.Mesh(rampGeo, MechanicalBuilder.materials.darkSteel);
        this.physicalAssemblyGroup.add(rampMesh);
      }

      // Block
      const blockMesh = MechanicalBuilder.createBlock(0.8, 0.5, 0.6, 'wood');
      blockMesh.position.set(0, 0.8, 0);
      blockMesh.rotation.z = angleRad;
      this.isolatedBodyGroup.add(blockMesh);

      // FBD Vectors
      const center = new THREE.Vector3(0, 0.8, 0);

      if (this.studentForces.weight) {
        // Downward weight (Red)
        this.fbdVectorsGroup.add(VectorRenderer.createForceArrow(center, new THREE.Vector3(0, -1.2, 0), 0xef4444));
      }

      if (this.studentForces.normal) {
        // Perpendicular normal (Blue)
        const normalVec = new THREE.Vector3(-Math.sin(angleRad), Math.cos(angleRad), 0).multiplyScalar(1.0);
        this.fbdVectorsGroup.add(VectorRenderer.createForceArrow(center, normalVec, 0x2563eb));
      }

      if (this.studentForces.friction) {
        // Tangential friction up ramp (Orange)
        const fricVec = new THREE.Vector3(Math.cos(angleRad), Math.sin(angleRad), 0).multiplyScalar(0.7);
        this.fbdVectorsGroup.add(VectorRenderer.createForceArrow(center, fricVec, 0xd97706));
      }

      // Diagnostic assessment
      const isCorrect = this.studentForces.weight && this.studentForces.normal && this.studentForces.friction;
      this.metrics['Scenario'] = 'Block on 30° Incline';
      this.metrics['FBD Status'] = isCorrect ? 'Valid & Complete (100%)' : 'Incomplete Force Balance';
      this.metrics['Forces Displayed'] = `${[
        this.studentForces.weight ? 'W' : '',
        this.studentForces.normal ? 'N' : '',
        this.studentForces.friction ? 'Fs' : '',
      ].filter(Boolean).join(', ')}`;
    }

    this.notifyState();
  }

  protected updatePhysics(_deltaTime: number): void {}
  protected updateVisuals(_deltaTime: number): void {}
}

export function mountFreeBodyDiagramSimulation(container: HTMLElement, options?: SimulationOptions) {
  return new FreeBodyDiagramScene(container, options);
}
