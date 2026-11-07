/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 01: 2D and 3D Force Systems
 * Unit I: Statics of Particles
 *
 * Demonstrates:
 * - Resolution of coplanar & spatial forces into orthogonal components
 * - Vector resultant construction via analytical & parallelogram methods
 * - Direction cosines (cos θx, cos θy, cos θz) in three dimensions
 * - Concurrent particle equilibrium verification (ΣF = 0)
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { VectorRenderer } from '../../core/VectorRenderer';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';

export class ForceSystemsScene extends BaseMechanicsSimulation {
  private particleMesh!: THREE.Mesh;
  private vectorsGroup = new THREE.Group();
  private guidesGroup = new THREE.Group();
  private triadGroup = new THREE.Group();
  private groundGroup = new THREE.Group();

  // Forces data
  private forces = [
    { id: 'f1', name: 'Force Vector F₁', mag: 60, angleDeg: 35, elevDeg: 0, color: 0x2563eb },
    { id: 'f2', name: 'Force Vector F₂', mag: 45, angleDeg: 120, elevDeg: 0, color: 0xd97706 },
    { id: 'f3', name: 'Force Vector F₃', mag: 50, angleDeg: 230, elevDeg: 0, color: 0x7c3aed },
    { id: 'f4', name: 'Equilibrant / Fourth Force F₄', mag: 0, angleDeg: 0, elevDeg: 0, color: 0x059669 },
  ];

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    // Ground plane
    this.groundGroup = MechanicalBuilder.createGround(12, 12);
    this.groundGroup.position.y = -1.5;
    this.scene.add(this.groundGroup);

    // Coordinate axes triad
    this.triadGroup = VectorRenderer.createCoordinateTriad(2.2);
    this.scene.add(this.triadGroup);

    // Central Particle
    const sphereGeo = new THREE.SphereGeometry(0.18, 32, 32);
    this.particleMesh = new THREE.Mesh(sphereGeo, MechanicalBuilder.materials.darkSteel);
    this.particleMesh.castShadow = true;
    this.scene.add(this.particleMesh);

    this.scene.add(this.vectorsGroup);
    this.scene.add(this.guidesGroup);

    // Default parameters
    this.parameters['dimension'] = '2D';
    this.parameters['f1Mag'] = 60;
    this.parameters['f1Angle'] = 35;
    this.parameters['f2Mag'] = 45;
    this.parameters['f2Angle'] = 120;
    this.parameters['showComponents'] = true;
    this.parameters['equilibrate'] = false;

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-coordinate-resolution',
        index: 0,
        title: 'Stage 1: Reference Axes & Force Vector Components',
        shortDescription: 'Decompose coplanar forces into orthogonal horizontal (Fx = F cos θ) and vertical (Fy = F sin θ) components.',
        detailedExplanation:
          'Every concurrent force acting on a particle can be resolved into rectangular components along reference Cartesian axes. ' +
          'For a force of magnitude F at angle θ with the horizontal: Fx = F cos(θ) and Fy = F sin(θ). ' +
          'Orthogonal resolution transforms vector addition from geometric construction into exact scalar algebraic summation.',
        principles: [
          'Orthogonal Cartesian Decomposition',
          'Linear Superposition of Force Components',
          'Particle Model: Mass concentrated at a dimensionless point',
        ],
        equations: [
          'F_x = F \\cdot \\cos(\\theta)',
          'F_y = F \\cdot \\sin(\\theta)',
          'F = \\sqrt{F_x^2 + F_y^2}',
        ],
        keyTerminology: [
          { term: 'Concurrent Forces', definition: 'Forces whose lines of action intersect at a single common point.' },
          { term: 'Orthogonal Components', definition: 'Mutually perpendicular projections along coordinate axes.' },
        ],
        highlightComponentIds: ['particle', 'f1', 'f2'],
        recommendedCamera: { position: [0, 0, 7], target: [0, 0, 0] },
      },
      {
        id: 'stage-resultant-construction',
        index: 1,
        title: 'Stage 2: Resultant Force Vector Construction',
        shortDescription: 'Determine single equivalent resultant vector R = ΣF = (ΣFx)î + (ΣFy)ĵ and its inclination angle α.',
        detailedExplanation:
          'The resultant force R represents the single force that produces the exact dynamic effect of the entire force system. ' +
          'It is computed by summing all horizontal components ΣFx and vertical components ΣFy. ' +
          'The magnitude is R = √( (ΣFx)² + (ΣFy)² ) and the angle of inclination with the positive X-axis is α = arctan(ΣFy / ΣFx).',
        principles: [
          'Parallelogram Law of Vector Addition',
          'Analytical Summation: R_x = ΣF_ix, R_y = ΣF_iy',
          'Equivalence of Systems: Resultant replaces all concurrent forces',
        ],
        equations: [
          'R_x = \\sum F_x = F_{1x} + F_{2x} + F_{3x}',
          'R_y = \\sum F_y = F_{1y} + F_{2y} + F_{3y}',
          'R = \\sqrt{R_x^2 + R_y^2} \\quad \\text{at} \\quad \\alpha = \\arctan\\left(\\frac{R_y}{R_x}\\right)',
        ],
        keyTerminology: [
          { term: 'Resultant (R)', definition: 'The single vector whose physical effect equals that of multiple combined forces.' },
          { term: 'Inclination Angle (α)', definition: 'The counter-clockwise orientation of the resultant relative to the positive X-axis.' },
        ],
        highlightComponentIds: ['particle', 'resultant'],
        recommendedCamera: { position: [0, 1.5, 6.5], target: [0, 0, 0] },
      },
      {
        id: 'stage-3d-spatial',
        index: 2,
        title: 'Stage 3: 3D Spatial Force Systems & Direction Cosines',
        shortDescription: 'Analyze spatial concurrent forces using direction cosines where Fx = F cos θx, Fy = F cos θy, Fz = F cos θz.',
        detailedExplanation:
          'In three-dimensional mechanics, a force vector is defined by its magnitude F and its direction angles (θx, θy, θz) with respect to the Cartesian axes. ' +
          'The components are Fx = F cos θx, Fy = F cos θy, and Fz = F cos θz, subject to the fundamental identity: cos² θx + cos² θy + cos² θz = 1. ' +
          'The unit vector λ = cos θx î + cos θy ĵ + cos θz k̂ defines the line of action.',
        principles: [
          'Spatial Direction Cosines: l = cos θx, m = cos θy, n = cos θz',
          'Identity: l² + m² + n² = 1',
          'Spatial Resultant: R = √(Rx² + Ry² + Rz²)',
        ],
        equations: [
          '\\mathbf{F} = F (\\cos\\theta_x \\hat{i} + \\cos\\theta_y \\hat{j} + \\cos\\theta_z \\hat{k})',
          '\\cos^2\\theta_x + \\cos^2\\theta_y + \\cos^2\\theta_z = 1',
        ],
        keyTerminology: [
          { term: 'Direction Cosines', definition: 'The cosines of the angles between a vector and the positive coordinate axes.' },
          { term: 'Unit Vector (λ)', definition: 'A dimensionless vector of length 1 pointing along the line of action.' },
        ],
        highlightComponentIds: ['particle', 'f1', 'f2', 'f3'],
        recommendedCamera: { position: [4, 3, 5], target: [0, 0, 0] },
      },
      {
        id: 'stage-equilibrium-condition',
        index: 3,
        title: 'Stage 4: Concurrent Particle Static Equilibrium (ΣF = 0)',
        shortDescription: 'Demonstrate Newton\'s First Law: particle remains at rest when the resultant force vanishes identically.',
        detailedExplanation:
          'A particle is in static equilibrium if and only if the vector sum of all external forces acting upon it is zero: ΣF = 0. ' +
          'This requires each scalar component to vanish independently: ΣFx = 0, ΣFy = 0, and ΣFz = 0. ' +
          'An equilibrant force E is equal in magnitude and opposite in direction to the resultant (E = -R), bringing the particle into immediate equilibrium.',
        principles: [
          'First Condition of Equilibrium: ΣF = 0',
          'Equilibrant Force: E = -R',
          'Null Acceleration: a = 0 when net external force is zero',
        ],
        equations: [
          '\\sum F_x = 0, \\quad \\sum F_y = 0, \\quad \\sum F_z = 0',
          '\\mathbf{E} = -\\mathbf{R} = -(\\sum \\mathbf{F})',
        ],
        keyTerminology: [
          { term: 'Static Equilibrium', definition: 'State where net force is zero and the particle remains permanently at rest.' },
          { term: 'Equilibrant', definition: 'A single force equal in magnitude and opposite in direction to the resultant.' },
        ],
        highlightComponentIds: ['particle', 'equilibrant'],
        recommendedCamera: { position: [0, 2, 6], target: [0, 0, 0] },
      },
    ];
  }

  protected initComponents(): void {
    this.components.clear();

    this.components.set('particle', {
      id: 'particle',
      name: 'Concurrent Particle (Origin)',
      category: 'particle',
      material: 'Rigid Idealized Point Mass',
      scientificRole: 'Point of concurrent force application with zero rotational freedom.',
      specifications: 'Coordinates: (0, 0, 0) · Degrees of Freedom: 3 Translational',
      anchorPosition: [0, 0, 0],
      meshRef: this.particleMesh,
    });

    this.components.set('f1', {
      id: 'f1',
      name: 'Applied Force F₁',
      category: 'vector',
      material: 'Vector Quantity (Blue)',
      scientificRole: 'Primary tension/pulling force acting along θ₁.',
      specifications: 'Magnitude: 60 N · Angle: 35°',
      anchorPosition: [1.8, 1.2, 0],
    });

    this.components.set('f2', {
      id: 'f2',
      name: 'Applied Force F₂',
      category: 'vector',
      material: 'Vector Quantity (Orange)',
      scientificRole: 'Secondary concurrent force acting in Quadrant II.',
      specifications: 'Magnitude: 45 N · Angle: 120°',
      anchorPosition: [-1.2, 2.0, 0],
    });

    this.components.set('resultant', {
      id: 'resultant',
      name: 'Resultant Force Vector R',
      category: 'vector',
      material: 'Vector Sum (Emerald Green)',
      scientificRole: 'Net resultant vector producing identical acceleration as all combined forces.',
      specifications: 'Computed: R = ΣF = √(Rx² + Ry² + Rz²)',
      anchorPosition: [0.8, 2.4, 0],
    });
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.parameters['dimension'] = '2D';
      this.parameters['equilibrate'] = false;
      this.forces[0]!.elevDeg = 0;
      this.forces[1]!.elevDeg = 0;
      this.forces[2]!.mag = 0;
    } else if (stageIndex === 1) {
      this.parameters['dimension'] = '2D';
      this.forces[2]!.mag = 50;
      this.forces[2]!.elevDeg = 0;
    } else if (stageIndex === 2) {
      this.parameters['dimension'] = '3D';
      this.forces[0]!.elevDeg = 25;
      this.forces[1]!.elevDeg = -15;
      this.forces[2]!.mag = 50;
      this.forces[2]!.elevDeg = 35;
    } else if (stageIndex === 3) {
      this.parameters['equilibrate'] = true;
    }
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    if (key === 'f1Mag') this.forces[0]!.mag = Number(value);
    if (key === 'f1Angle') this.forces[0]!.angleDeg = Number(value);
    if (key === 'f2Mag') this.forces[1]!.mag = Number(value);
    if (key === 'f2Angle') this.forces[1]!.angleDeg = Number(value);
    if (key === 'dimension') {
      const is3D = value === '3D';
      this.forces[0]!.elevDeg = is3D ? 25 : 0;
      this.forces[1]!.elevDeg = is3D ? -15 : 0;
      this.forces[2]!.elevDeg = is3D ? 30 : 0;
    }
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    this.vectorsGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.vectorsGroup.clear();
    this.guidesGroup.traverse((c) => {
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
    });
    this.guidesGroup.clear();

    const scale = 0.04; // 1 N = 0.04 Three.js units
    let rx = 0;
    let ry = 0;
    let rz = 0;

    const is3D = this.parameters['dimension'] === '3D';

    // Render active forces
    this.forces.forEach((f) => {
      if (f.mag <= 0) return;
      const rad = (f.angleDeg * Math.PI) / 180;
      const elev = is3D ? (f.elevDeg * Math.PI) / 180 : 0;

      const vx = f.mag * Math.cos(rad) * Math.cos(elev);
      const vy = f.mag * Math.sin(rad) * Math.cos(elev);
      const vz = is3D ? f.mag * Math.sin(elev) : 0;

      rx += vx;
      ry += vy;
      rz += vz;

      const vec = new THREE.Vector3(vx * scale, vy * scale, vz * scale);
      const arrow = VectorRenderer.createForceArrow(new THREE.Vector3(0, 0, 0), vec, f.color);
      this.vectorsGroup.add(arrow);

      // Decomposition dashed guides
      if (this.parameters['showComponents']) {
        const guides = VectorRenderer.createDecompositionGuides(new THREE.Vector3(0, 0, 0), vec, f.color);
        this.guidesGroup.add(guides);
      }
    });

    const rMag = Math.sqrt(rx * rx + ry * ry + rz * rz);
    const rVector = new THREE.Vector3(rx * scale, ry * scale, rz * scale);

    // Render Resultant or Equilibrant
    if (this.parameters['equilibrate']) {
      // Equilibrant = -R
      const eqVector = rVector.clone().negate();
      const eqArrow = VectorRenderer.createForceArrow(new THREE.Vector3(0, 0, 0), eqVector, 0x10b981, {
        shaftRadius: 0.045,
        headRadius: 0.12,
      });
      this.vectorsGroup.add(eqArrow);
      this.metrics['System State'] = 'Perfect Equilibrium (ΣF = 0)';
      this.metrics['Equilibrant Mag'] = `${rMag.toFixed(1)} N`;
    } else {
      // Resultant R (Green)
      if (rMag > 0.1) {
        const rArrow = VectorRenderer.createForceArrow(new THREE.Vector3(0, 0, 0), rVector, 0x10b981, {
          shaftRadius: 0.045,
          headRadius: 0.12,
        });
        this.vectorsGroup.add(rArrow);
      }
      this.metrics['Resultant Rx'] = `${rx.toFixed(1)} N`;
      this.metrics['Resultant Ry'] = `${ry.toFixed(1)} N`;
      if (is3D) this.metrics['Resultant Rz'] = `${rz.toFixed(1)} N`;
      this.metrics['Resultant R'] = `${rMag.toFixed(1)} N`;
      this.metrics['Angle α'] = `${((Math.atan2(ry, rx) * 180) / Math.PI).toFixed(1)}°`;
    }

    this.notifyState();
  }

  protected updatePhysics(_deltaTime: number): void {
    // Statics: deterministic state maintained by parameters
  }

  protected updateVisuals(_deltaTime: number): void {
    // Subtle hover animation on particle
    if (this.particleMesh) {
      this.particleMesh.rotation.y += 0.01;
    }
  }
}

export function mountForceSystemsSimulation(container: HTMLElement, options?: SimulationOptions) {
  return new ForceSystemsScene(container, options);
}
