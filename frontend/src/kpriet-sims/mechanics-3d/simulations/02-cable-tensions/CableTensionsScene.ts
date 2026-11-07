/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 02: Particle Equilibrium and Cable Tensions
 * Unit I: Statics of Particles
 *
 * Demonstrates:
 * - Suspended loads supported by multiple flexible cables
 * - Equilibrium of concurrent force systems at knot/ring joint
 * - Lami's theorem for coplanar three-force systems
 * - Spatial 3D cable tension resolution and slack detection
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { VectorRenderer } from '../../core/VectorRenderer';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';

export class CableTensionsScene extends BaseMechanicsSimulation {
  private rigGroup = new THREE.Group();
  private vectorsGroup = new THREE.Group();
  private ringMesh!: THREE.Mesh;
  private loadGroup = new THREE.Group();

  // Anchors & Knot positions
  private anchorA = new THREE.Vector3(-2.5, 2.5, 0);
  private anchorB = new THREE.Vector3(2.5, 2.5, 0);
  private anchorC = new THREE.Vector3(0, 2.5, 2.0); // 3D anchor
  private knotPos = new THREE.Vector3(0, 0, 0);

  private loadMassKg = 100; // 100 kg => W = 981 N
  private is3D = false;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    // Ground & Ceiling supports
    const ceilingGeo = new THREE.BoxGeometry(7, 0.15, 4);
    ceilingGeo.translate(0, 2.575, 0);
    const ceilingMesh = new THREE.Mesh(ceilingGeo, MechanicalBuilder.materials.concrete);
    this.scene.add(ceilingMesh);

    // Central ring / knot
    const ringGeo = new THREE.TorusGeometry(0.1, 0.025, 16, 32);
    this.ringMesh = new THREE.Mesh(ringGeo, MechanicalBuilder.materials.brass);
    this.scene.add(this.ringMesh);

    // Suspended load
    this.loadGroup = MechanicalBuilder.createHangingLoad(this.loadMassKg, 0.35, 0.6);
    this.scene.add(this.loadGroup);

    this.scene.add(this.rigGroup);
    this.scene.add(this.vectorsGroup);

    this.parameters['loadMass'] = 100;
    this.parameters['anchorASpan'] = 2.5;
    this.parameters['anchorBSpan'] = 2.5;
    this.parameters['riggingMode'] = '2-Cable';

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-assembly-geometry',
        index: 0,
        title: 'Stage 1: Cable Geometry & Knot Idealization',
        shortDescription: 'Examine cable anchor points A and B supporting load W via frictionless concurrent central ring C.',
        detailedExplanation:
          'Flexible cables can only support axial tension along their longitudinal axis (they buckle under compression and bending). ' +
          'The central connecting ring is treated as a concurrent particle at which all cable lines of action intersect. ' +
          'Gravity exerts a direct downward force W = m · g = (100 kg)(9.81 m/s²) = 981 N.',
        principles: [
          'Uniaxial Tensile Nature of Flexible Cables (T ≥ 0)',
          'Concurrent Equilibrium at Ring: ΣF = T_A + T_B + W = 0',
          'Gravitational Load: W = mg',
        ],
        equations: [
          'W = m \\cdot g',
          '\\mathbf{T} = T \\cdot \\hat{u}_{cable}',
        ],
        keyTerminology: [
          { term: 'Cable Tension', definition: 'Internal tensile force directed strictly along the cable away from the joint.' },
          { term: 'Concurrent Knot', definition: 'The physical junction modeled as a single particle with zero dimensions.' },
        ],
        highlightComponentIds: ['ring', 'cableA', 'cableB', 'load'],
        recommendedCamera: { position: [0, 1.2, 5.8], target: [0, 0.8, 0] },
      },
      {
        id: 'stage-equilibrium-equations',
        index: 1,
        title: 'Stage 2: Analytical Equilibrium of Joint C (ΣFx = 0, ΣFy = 0)',
        shortDescription: 'Solve simultaneous linear equations: -T_A cos θ_A + T_B cos θ_B = 0 and T_A sin θ_A + T_B sin θ_B - W = 0.',
        detailedExplanation:
          'Setting horizontal forces to zero yields T_A cos θ_A = T_B cos θ_B, proving that cable horizontal components must balance each other exactly. ' +
          'Setting vertical forces to zero yields T_A sin θ_A + T_B sin θ_B = W. ' +
          'As the cables approach a horizontal orientation (θ → 0°), required tension approaches infinity (T → ∞), proving why a cable can never be pulled perfectly horizontal under gravity.',
        principles: [
          'Horizontal Force Balance: T_A cos θ_A = T_B cos θ_B',
          'Vertical Force Balance: T_A sin θ_A + T_B sin θ_B = W',
          'Geometric Singularity: Infinite tension as inclination θ approaches 0°',
        ],
        equations: [
          '\\sum F_x = -T_A \\cos\\theta_A + T_B \\cos\\theta_B = 0',
          '\\sum F_y = T_A \\sin\\theta_A + T_B \\sin\\theta_B - W = 0',
        ],
        keyTerminology: [
          { term: 'Sag / Droop', definition: 'Vertical deflection necessary for vertical force components to equilibrate gravity.' },
        ],
        highlightComponentIds: ['ring', 'cableA', 'cableB'],
        recommendedCamera: { position: [0, 1.2, 5.8], target: [0, 0.8, 0] },
      },
      {
        id: 'stage-lamis-theorem',
        index: 2,
        title: 'Stage 3: Lami\'s Theorem for Three Concurrent Coplanar Forces',
        shortDescription: 'Apply Lami\'s trigonometric ratio: T_A / sin α = T_B / sin β = W / sin γ where angles are opposite to each force.',
        detailedExplanation:
          'When three coplanar forces acting on a particle maintain static equilibrium, each force magnitude is directly proportional to the sine of the angle between the other two forces: ' +
          'T_A / sin(β) = T_B / sin(α) = W / sin(γ). ' +
          'Lami\'s theorem provides an immediate, elegant solution without requiring component resolution when interior angles are known.',
        principles: [
          'Sine Law for Closed Force Triangles',
          'Proportionality of Opposing Angles',
        ],
        equations: [
          '\\frac{T_A}{\\sin\\alpha} = \\frac{T_B}{\\sin\\beta} = \\frac{W}{\\sin\\gamma}',
        ],
        keyTerminology: [
          { term: 'Lami\'s Theorem', definition: 'Trigonometric relation for 3 concurrent forces in planar equilibrium.' },
        ],
        highlightComponentIds: ['ring', 'load'],
        recommendedCamera: { position: [0, 1.2, 5.8], target: [0, 0.8, 0] },
      },
      {
        id: 'stage-3d-tripod-rigging',
        index: 3,
        title: 'Stage 4: 3D Spatial Rigging (3 Non-Coplanar Cables)',
        shortDescription: 'Solve 3x3 linear system for spatial equilibrium: ΣFx = 0, ΣFy = 0, ΣFz = 0 across anchors A, B, and C.',
        detailedExplanation:
          'When supported by three non-coplanar cables, the system has three independent equations: ΣFx = 0, ΣFy = 0, and ΣFz = 0. ' +
          'Tensions are determined uniquely if and only if the three cable direction vectors are linearly independent (det(U) ≠ 0). ' +
          'If any calculated tension is negative, that cable goes slack, requiring redistribution of the load.',
        principles: [
          'Spatial Determinacy: 3 unknown cable tensions matched with 3 Cartesian equilibrium equations',
          'Slack Cable Criterion: Tension must be strictly non-negative (T_i ≥ 0)',
        ],
        equations: [
          '\\begin{bmatrix} u_{Ax} & u_{Bx} & u_{Cx} \\\\ u_{Ay} & u_{By} & u_{Cy} \\\\ u_{Az} & u_{Bz} & u_{Cz} \\end{bmatrix} \\begin{bmatrix} T_A \\\\ T_B \\\\ T_C \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ W \\\\ 0 \\end{bmatrix}',
        ],
        keyTerminology: [
          { term: 'Spatial Rigging', definition: 'Cables anchored in 3D space to stabilize loads against lateral wind and sway.' },
        ],
        highlightComponentIds: ['ring', 'cableA', 'cableB', 'cableC'],
        recommendedCamera: { position: [3.5, 3.0, 4.5], target: [0, 1.0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('ring', {
      id: 'ring',
      name: 'Concurrent Junction Ring C',
      category: 'joint',
      material: 'Forged Brass Master Link',
      scientificRole: 'Point of concurrent force application where all cables converge.',
      specifications: 'Location: (0, 0, 0) · Working Load Limit: 50 kN',
      anchorPosition: [0, 0, 0],
      meshRef: this.ringMesh,
    });

    this.components.set('cableA', {
      id: 'cableA',
      name: 'Left Anchor Cable CA',
      category: 'cable',
      material: 'Galvanized Steel Wire Rope',
      scientificRole: 'Provides tensile force TA with upward and leftward components.',
      specifications: 'Anchor A: (-2.5, 2.5, 0) · 6x19 IWRC Wire Rope',
      anchorPosition: [-1.25, 1.25, 0],
    });

    this.components.set('cableB', {
      id: 'cableB',
      name: 'Right Anchor Cable CB',
      category: 'cable',
      material: 'Galvanized Steel Wire Rope',
      scientificRole: 'Provides tensile force TB with upward and rightward components.',
      specifications: 'Anchor B: (2.5, 2.5, 0) · 6x19 IWRC Wire Rope',
      anchorPosition: [1.25, 1.25, 0],
    });

    this.components.set('cableC', {
      id: 'cableC',
      name: 'Out-of-Plane Cable CC',
      category: 'cable',
      material: 'High-Tensile Rigging Sling',
      scientificRole: 'Provides Z-axis lateral stability in 3D rigging mode.',
      specifications: 'Anchor C: (0, 2.5, 2.0)',
      anchorPosition: [0, 1.25, 1.0],
    });

    this.components.set('load', {
      id: 'load',
      name: 'Suspended Dead Weight (W)',
      category: 'body',
      material: 'Cast Iron Calibrated Test Weight',
      scientificRole: 'Applies downward gravity force W = mg.',
      specifications: 'Mass: 100 kg · Force: 981 N downwards',
      anchorPosition: [0, -0.6, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    this.is3D = stageIndex === 3;
    this.parameters['riggingMode'] = this.is3D ? '3-Cable' : '2-Cable';
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'loadMass') this.loadMassKg = Number(value);
    if (key === 'anchorASpan') this.anchorA.x = -Number(value);
    if (key === 'anchorBSpan') this.anchorB.x = Number(value);
    if (key === 'riggingMode') this.is3D = value === '3-Cable';
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    this.rigGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.rigGroup.clear();
    this.vectorsGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.vectorsGroup.clear();

    const W = this.loadMassKg * 9.81; // in Newtons
    this.loadGroup.position.set(0, -0.1, 0);

    // Cable A
    this.rigGroup.add(MechanicalBuilder.createCable(this.knotPos, this.anchorA, 0.02));
    // Cable B
    this.rigGroup.add(MechanicalBuilder.createCable(this.knotPos, this.anchorB, 0.02));

    // Anchor brackets
    const bracketA = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.2), MechanicalBuilder.materials.darkSteel);
    bracketA.position.copy(this.anchorA);
    this.rigGroup.add(bracketA);

    const bracketB = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.2), MechanicalBuilder.materials.darkSteel);
    bracketB.position.copy(this.anchorB);
    this.rigGroup.add(bracketB);

    let tA = 0;
    let tB = 0;
    let tC = 0;

    const scale = 0.0018; // 1 N = 0.0018 Three.js units

    if (!this.is3D) {
      // 2D Planar Equilibrium:
      // T_A * cos(θ_A) = T_B * cos(θ_B)
      // T_A * sin(θ_A) + T_B * sin(θ_B) = W
      const dirA = this.anchorA.clone().sub(this.knotPos).normalize();
      const dirB = this.anchorB.clone().sub(this.knotPos).normalize();

      // Matrix: [dirA.x, dirB.x; dirA.y, dirB.y] [TA; TB] = [0; W]
      const det = dirA.x * dirB.y - dirA.y * dirB.x;
      if (Math.abs(det) > 1e-4) {
        tA = (0 * dirB.y - dirB.x * W) / det;
        tB = (dirA.x * W - 0 * dirA.y) / det;
      }

      // Vectors at ring
      this.vectorsGroup.add(VectorRenderer.createForceArrow(this.knotPos, dirA.clone().multiplyScalar(tA * scale), 0x2563eb));
      this.vectorsGroup.add(VectorRenderer.createForceArrow(this.knotPos, dirB.clone().multiplyScalar(tB * scale), 0xd97706));
      this.vectorsGroup.add(VectorRenderer.createForceArrow(this.knotPos, new THREE.Vector3(0, -W * scale, 0), 0xef4444));

      this.metrics['Load W'] = `${W.toFixed(0)} N`;
      this.metrics['Tension TA'] = `${Math.abs(tA).toFixed(1)} N`;
      this.metrics['Tension TB'] = `${Math.abs(tB).toFixed(1)} N`;
      this.metrics['Status'] = tA >= 0 && tB >= 0 ? 'Taut Equilibrium' : 'Slack Cable Warning';
    } else {
      // 3D Spatial Equilibrium with Anchor C
      this.rigGroup.add(MechanicalBuilder.createCable(this.knotPos, this.anchorC, 0.02));
      const bracketC = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.2), MechanicalBuilder.materials.darkSteel);
      bracketC.position.copy(this.anchorC);
      this.rigGroup.add(bracketC);

      const uA = this.anchorA.clone().sub(this.knotPos).normalize();
      const uB = this.anchorB.clone().sub(this.knotPos).normalize();
      const uC = this.anchorC.clone().sub(this.knotPos).normalize();

      // Solve 3x3 system: [uA uB uC] [TA TB TC]^T = [0 W 0]^T
      // Matrix inversion:
      const m = new THREE.Matrix3().set(uA.x, uB.x, uC.x, uA.y, uB.y, uC.y, uA.z, uB.z, uC.z);
      const inv = m.clone().invert();
      const rhs = new THREE.Vector3(0, W, 0);
      rhs.applyMatrix3(inv);

      tA = rhs.x;
      tB = rhs.y;
      tC = rhs.z;

      this.vectorsGroup.add(VectorRenderer.createForceArrow(this.knotPos, uA.multiplyScalar(tA * scale), 0x2563eb));
      this.vectorsGroup.add(VectorRenderer.createForceArrow(this.knotPos, uB.multiplyScalar(tB * scale), 0xd97706));
      this.vectorsGroup.add(VectorRenderer.createForceArrow(this.knotPos, uC.multiplyScalar(tC * scale), 0x7c3aed));
      this.vectorsGroup.add(VectorRenderer.createForceArrow(this.knotPos, new THREE.Vector3(0, -W * scale, 0), 0xef4444));

      this.metrics['Load W'] = `${W.toFixed(0)} N`;
      this.metrics['Tension TA'] = `${Math.abs(tA).toFixed(1)} N`;
      this.metrics['Tension TB'] = `${Math.abs(tB).toFixed(1)} N`;
      this.metrics['Tension TC'] = `${Math.abs(tC).toFixed(1)} N`;
      this.metrics['Status'] = tA >= 0 && tB >= 0 && tC >= 0 ? 'Stable 3D Equilibrium' : 'Partial Slack Detected';
    }

    this.notifyState();
  }

  protected updatePhysics(_deltaTime: number): void {}
  protected updateVisuals(_deltaTime: number): void {}
}

export function mountCableTensionsSimulation(container: HTMLElement, options?: SimulationOptions) {
  return new CableTensionsScene(container, options);
}
