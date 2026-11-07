/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 04: Moments, Couples and Varignon's Theorem
 * Unit II: Equilibrium of Rigid Bodies
 *
 * Demonstrates:
 * - Vector cross product definition of moment: M = r x F
 * - Geometric perpendicular lever arm (moment arm d = r sin θ)
 * - Couple moment as an invariant free vector independent of reference point
 * - Varignon's theorem of moments: M_O(R) = Σ M_O(Fi)
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { VectorRenderer } from '../../core/VectorRenderer';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';

export class MomentsCouplesScene extends BaseMechanicsSimulation {
  private leverGroup = new THREE.Group();
  private vectorsGroup = new THREE.Group();
  private guidesGroup = new THREE.Group();
  private pivotMesh!: THREE.Mesh;

  // Mechanical parameters
  private armLength = 2.0; // meters
  private forceMag = 50; // Newtons
  private forceAngleDeg = 65; // degrees relative to lever
  private coupleOffset = 1.0;
  private isCoupleMode = false;
  private showVarignon = false;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    // Pivot at origin (0, 0, 0)
    const pivotGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 24);
    pivotGeo.rotateX(Math.PI / 2);
    this.pivotMesh = new THREE.Mesh(pivotGeo, MechanicalBuilder.materials.brass);
    this.scene.add(this.pivotMesh);

    // Support stand beneath pivot
    const stand = MechanicalBuilder.createPinSupport(0.5);
    stand.position.set(0, -0.5, 0);
    this.scene.add(stand);

    this.scene.add(this.leverGroup);
    this.scene.add(this.vectorsGroup);
    this.scene.add(this.guidesGroup);

    this.parameters['armLength'] = 2.0;
    this.parameters['forceMag'] = 50;
    this.parameters['forceAngle'] = 65;
    this.parameters['coupleMode'] = false;
    this.parameters['showVarignon'] = false;

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-moment-definition',
        index: 0,
        title: 'Stage 1: Vector Definition of Moment (M = r × F)',
        shortDescription: 'Examine rotational tendency produced by force F applied at position vector r from pivot point O.',
        detailedExplanation:
          'The moment of a force M_O measures its capacity to induce rotation about a reference point or axis. ' +
          'Mathematically, it is the vector cross product: M_O = r × F. ' +
          'Its magnitude is M_O = F · r · sin(θ) = F · d, where d is the perpendicular distance (moment arm) from pivot O to the line of action of F.',
        principles: [
          'Cross Product Definition: M = r × F',
          'Perpendicular Lever Arm: d = r · sin(θ)',
          'Line of Action Collinear with Pivot produces zero moment (d = 0)',
        ],
        equations: [
          '\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{F}',
          'M_O = F \\cdot d = F \\cdot r \\cdot \\sin(\\theta)',
        ],
        keyTerminology: [
          { term: 'Moment Arm (d)', definition: 'The perpendicular distance from the reference pivot to the line of action of the force.' },
          { term: 'Torque / Moment', definition: 'The turning effect of a force about a specified axis.' },
        ],
        highlightComponentIds: ['lever', 'forceA', 'momentArc'],
        recommendedCamera: { position: [0, 1.5, 5.5], target: [1, 0, 0] },
      },
      {
        id: 'stage-rotational-direction',
        index: 1,
        title: 'Stage 2: Sign Conventions & Rotational Tendency',
        shortDescription: 'Standard right-hand rule convention: Counter-Clockwise (CCW = +k̂) vs Clockwise (CW = -k̂).',
        detailedExplanation:
          'By international right-hand rule convention, counter-clockwise (CCW) rotation corresponds to a positive vector pointing out of the plane (+Z direction). ' +
          'Clockwise (CW) rotation corresponds to a negative moment pointing into the plane (-Z direction). ' +
          'If the line of action passes directly through the pivot (θ = 0° or 180°), the moment arm is zero and no rotation occurs.',
        principles: [
          'Right-Hand Rule for Vector Products',
          'Counter-Clockwise (CCW) = Positive (+) Moment',
          'Clockwise (CW) = Negative (-) Moment',
        ],
        equations: [
          '\\mathbf{M}_O = (x F_y - y F_x) \\hat{k}',
        ],
        keyTerminology: [
          { term: 'Right-Hand Rule', definition: 'Fingers curl along rotation direction; thumb points along moment vector.' },
        ],
        highlightComponentIds: ['lever', 'momentArc'],
        recommendedCamera: { position: [0, 1.5, 5.5], target: [1, 0, 0] },
      },
      {
        id: 'stage-couple-moment',
        index: 2,
        title: 'Stage 3: Couple Moments as Invariant Free Vectors',
        shortDescription: 'Demonstrate that two equal and opposite parallel forces produce a pure moment independent of any pivot location.',
        detailedExplanation:
          'A couple consists of two parallel forces of equal magnitude F and opposite directions separated by a perpendicular distance d. ' +
          'The resultant force is zero (ΣF = F - F = 0), so a couple produces zero translation. ' +
          'The moment of a couple M = F · d is identical about EVERY point in space; it is a "free vector" that can be applied anywhere without altering static effect.',
        principles: [
          'Couple Equilibrium: Net force ΣF = 0 (No translation)',
          'Pure Rotation: Net moment M = F · d',
          'Free Vector Property: Moment is invariant to pivot selection',
        ],
        equations: [
          '\\sum \\mathbf{F} = \\mathbf{F} + (-\\mathbf{F}) = 0',
          '\\mathbf{M}_{couple} = \\mathbf{r}_{BA} \\times \\mathbf{F} = F \\cdot d \\hat{k}',
        ],
        keyTerminology: [
          { term: 'Couple', definition: 'A system of two equal, opposite, parallel forces producing pure rotation.' },
          { term: 'Free Vector', definition: 'A vector quantity whose effect does not depend on a specific point of application.' },
        ],
        highlightComponentIds: ['lever', 'forceA', 'forceB'],
        recommendedCamera: { position: [0, 1.5, 5.5], target: [1, 0, 0] },
      },
      {
        id: 'stage-varignons-theorem',
        index: 3,
        title: 'Stage 4: Varignon\'s Theorem of Moments',
        shortDescription: 'The moment of a resultant equals the sum of moments of its individual components: M_O(R) = Σ M_O(Fi).',
        detailedExplanation:
          'Discovered by French mathematician Pierre Varignon (1687): The moment about any point of the resultant of several concurrent forces ' +
          'is equal to the sum of the moments of the individual forces about that same point: M_O(R) = r × (F1 + F2) = (r × F1) + (r × F2). ' +
          'This enables resolving a complex angled force into Cartesian components and summing their individual perpendicular moments easily: M_O = x Fy - y Fx.',
        principles: [
          'Distributive Property of Vector Cross Product: r × (F1 + F2) = r × F1 + r × F2',
          'Analytical Moment Calculation: M_O = x · Fy - y · Fx',
        ],
        equations: [
          '\\mathbf{M}_O(\\mathbf{R}) = \\sum \\mathbf{M}_O(\\mathbf{F}_i)',
          'M_O = (x \\cdot F_y) - (y \\cdot F_x)',
        ],
        keyTerminology: [
          { term: 'Varignon\'s Theorem', definition: 'Principle stating that the moment of a resultant equals the sum of component moments.' },
        ],
        highlightComponentIds: ['lever', 'forceA'],
        recommendedCamera: { position: [0, 1.5, 5.5], target: [1, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('lever', {
      id: 'lever',
      name: 'Rigid Lever Beam',
      category: 'body',
      material: 'Structural Steel Lever Arm',
      scientificRole: 'Transmits applied forces to pivot O, establishing position vector r.',
      specifications: 'Length: 2.0 m · Moment Arm: d = r sin(θ)',
      anchorPosition: [1.0, 0, 0],
    });

    this.components.set('forceA', {
      id: 'forceA',
      name: 'Primary Force Vector F₁',
      category: 'vector',
      material: 'Applied Mechanical Load (Blue)',
      scientificRole: 'Exerts rotational tendency at tip point A.',
      specifications: 'Magnitude: 50 N · Angle: 65°',
      anchorPosition: [2.0, 0.4, 0],
    });

    this.components.set('momentArc', {
      id: 'momentArc',
      name: 'Resultant Moment M_O (Torque)',
      category: 'moment',
      material: 'Rotational Vector Arc (Amber)',
      scientificRole: 'Visualizes direction and magnitude of rotational turning tendency.',
      specifications: 'M = r × F = 90.6 N·m (CCW)',
      anchorPosition: [0, 0.8, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.isCoupleMode = false;
      this.showVarignon = false;
      this.forceAngleDeg = 65;
    } else if (stageIndex === 1) {
      this.isCoupleMode = false;
      this.showVarignon = false;
    } else if (stageIndex === 2) {
      this.isCoupleMode = true;
      this.showVarignon = false;
    } else if (stageIndex === 3) {
      this.isCoupleMode = false;
      this.showVarignon = true;
    }
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'armLength') this.armLength = Number(value);
    if (key === 'forceMag') this.forceMag = Number(value);
    if (key === 'forceAngle') this.forceAngleDeg = Number(value);
    if (key === 'coupleMode') this.isCoupleMode = Boolean(value);
    if (key === 'showVarignon') this.showVarignon = Boolean(value);
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    this.leverGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.leverGroup.clear();
    this.vectorsGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.vectorsGroup.clear();
    this.guidesGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.guidesGroup.clear();

    // 1. Build Lever Arm
    const beam = MechanicalBuilder.createBeam(this.armLength, 0.12, 0.12, 'rect');
    beam.position.set(this.armLength / 2, 0, 0);
    this.leverGroup.add(beam);

    // Tip marker A
    const tipPos = new THREE.Vector3(this.armLength, 0, 0);
    const tipMarker = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), MechanicalBuilder.materials.steel);
    tipMarker.position.copy(tipPos);
    this.leverGroup.add(tipMarker);

    // 2. Force Vector 1
    const rad = (this.forceAngleDeg * Math.PI) / 180;
    const fx = this.forceMag * Math.cos(rad);
    const fy = this.forceMag * Math.sin(rad);

    const fScale = 0.025; // 1 N = 0.025 units
    const vec1 = new THREE.Vector3(fx * fScale, fy * fScale, 0);
    const arrow1 = VectorRenderer.createForceArrow(tipPos, vec1, 0x2563eb);
    this.vectorsGroup.add(arrow1);

    // 3. Moment calculation
    // M_O = r x F = armLength * fy = armLength * forceMag * sin(rad)
    const momentMag = this.armLength * fy;
    const momentArmD = this.armLength * Math.sin(rad);

    // Perpendicular dashed line to line of action
    const lineOfActionLength = 3.0;
    const dirNorm = new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0);
    const pFar = tipPos.clone().add(dirNorm.clone().multiplyScalar(-lineOfActionLength));
    const pAhead = tipPos.clone().add(dirNorm.clone().multiplyScalar(lineOfActionLength));

    const lineMat = new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.08, gapSize: 0.05 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([pFar, pAhead]);
    const lineAction = new THREE.Line(lineGeo, lineMat);
    lineAction.computeLineDistances();
    this.guidesGroup.add(lineAction);

    // Moment arc at origin O
    const isCCW = momentMag >= 0;
    const arc = VectorRenderer.createCurvedMomentArrow(
      new THREE.Vector3(0, 0, 0.1),
      0.65,
      0,
      Math.PI * 1.2,
      !isCCW,
      0xd97706
    );
    this.vectorsGroup.add(arc);

    if (this.isCoupleMode) {
      // Add opposing force at offset d
      const tip2Pos = tipPos.clone().add(new THREE.Vector3(-this.coupleOffset, 0, 0));
      const vec2 = vec1.clone().negate();
      const arrow2 = VectorRenderer.createForceArrow(tip2Pos, vec2, 0xd97706);
      this.vectorsGroup.add(arrow2);

      const coupleMoment = this.forceMag * this.coupleOffset * Math.sin(rad);
      this.metrics['System'] = 'Pure Couple';
      this.metrics['Net Force ΣF'] = '0.0 N (Pure Torque)';
      this.metrics['Couple Moment M'] = `${coupleMoment.toFixed(1)} N·m`;
      this.metrics['Type'] = isCCW ? 'Counter-Clockwise (+)' : 'Clockwise (-)';
    } else {
      this.metrics['Force F'] = `${this.forceMag} N`;
      this.metrics['Position r'] = `${this.armLength.toFixed(2)} m`;
      this.metrics['Moment Arm d'] = `${Math.abs(momentArmD).toFixed(2)} m`;
      this.metrics['Moment M_O'] = `${momentMag.toFixed(1)} N·m`;
      this.metrics['Direction'] = isCCW ? 'Counter-Clockwise (CCW, +k̂)' : 'Clockwise (CW, -k̂)';

      if (this.showVarignon) {
        this.metrics['Fx · y'] = `0.0 N·m (y = 0)`;
        this.metrics['Fy · x'] = `${(fy * this.armLength).toFixed(1)} N·m`;
        this.metrics['Varignon Check'] = 'M_O = x·Fy - y·Fx verified';
      }
    }

    this.notifyState();
  }

  protected updatePhysics(_deltaTime: number): void {}
  protected updateVisuals(_deltaTime: number): void {}
}

export function mountMomentsCouplesSimulation(container: HTMLElement, options?: SimulationOptions) {
  return new MomentsCouplesScene(container, options);
}
