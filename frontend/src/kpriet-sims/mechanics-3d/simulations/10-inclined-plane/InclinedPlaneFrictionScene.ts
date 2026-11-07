/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 10: Dry Friction and Inclined Plane
 * Unit IV: Friction
 *
 * Demonstrates:
 * - Coulomb dry friction law: f_s <= mu_s * N, f_k = mu_k * N
 * - Angle of repose / critical inclination angle: theta_c = arctan(mu_s)
 * - Static equilibrium vs. impending motion vs. kinetic accelerated sliding
 * - Force resolution along inclined coordinate axes (tangential and normal)
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class InclinedPlaneFrictionScene extends BaseMechanicsSimulation {
  private rampGroup = new THREE.Group();
  private blockMesh!: THREE.Mesh;
  private vectorGroup = new THREE.Group();
  private pivotGroup = new THREE.Group();

  // Physical parameters
  private inclineAngleDeg = 25.0; // degrees
  private blockMassKg = 10.0; // kg
  private muStatic = 0.45;
  private muKinetic = 0.35;
  private appliedForceN = 0.0; // applied parallel to incline (positive = up-plane)

  // Dynamic simulation state
  private blockPosAlongPlane = 0.0; // meters from rest position
  private blockVel = 0.0;
  private isSliding = false;
  private planeLength = 4.0;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(10, 10);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.pivotGroup);
    this.pivotGroup.position.set(-1.8, 0.1, 0);
    this.pivotGroup.add(this.rampGroup);
    this.rampGroup.add(this.vectorGroup);

    // Build the Ramp (Wedge Incline with smooth top surface)
    const rampWidth = 1.2;
    const rampThick = 0.15;
    const rampGeo = new THREE.BoxGeometry(this.planeLength, rampThick, rampWidth);
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.4,
      roughness: 0.6,
    });
    const rampBoard = new THREE.Mesh(rampGeo, rampMat);
    rampBoard.position.set(this.planeLength / 2, -rampThick / 2, 0);
    rampBoard.castShadow = true;
    rampBoard.receiveShadow = true;
    this.rampGroup.add(rampBoard);

    // Pivot pin at base
    const pivotPinGeo = new THREE.CylinderGeometry(0.08, 0.08, rampWidth + 0.1, 16);
    pivotPinGeo.rotateX(Math.PI / 2);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const pivotPin = new THREE.Mesh(pivotPinGeo, pinMat);
    this.pivotGroup.add(pivotPin);

    // Support stand beneath pivot
    const standGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.2, 16);
    const stand = new THREE.Mesh(standGeo, pinMat);
    stand.position.y = -0.1;
    this.pivotGroup.add(stand);

    // Build the sliding block
    const blockWidth = 0.5;
    const blockHeight = 0.35;
    const blockDepth = 0.5;
    const blockGeo = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // vibrant technical blue
      metalness: 0.5,
      roughness: 0.4,
    });
    this.blockMesh = new THREE.Mesh(blockGeo, blockMat);
    this.blockMesh.castShadow = true;
    this.blockMesh.position.set(2.2, blockHeight / 2, 0);
    this.rampGroup.add(this.blockMesh);

    this.parameters['inclineAngle'] = 25;
    this.parameters['blockMass'] = 10;
    this.parameters['muStatic'] = 0.45;
    this.parameters['muKinetic'] = 0.35;
    this.parameters['appliedForce'] = 0;

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-ramp-setup',
        index: 0,
        title: 'Stage 1: System Geometry & Gravity Resolution',
        shortDescription: 'Resolve weight W = mg into parallel (W sin θ) and normal (W cos θ) components.',
        detailedExplanation:
          'When a block rests on an inclined plane with angle θ, its weight W = mg acts vertically downward. ' +
          'We choose a coordinate system rotated along the plane: the perpendicular axis yields normal contact force N = W cos θ, ' +
          'while the parallel component W sin θ drives the block down the incline.',
        principles: [
          'Weight: W = m · g',
          'Normal Component: W_n = m · g · cos(θ)',
          'Tangential Component: W_t = m · g · sin(θ)',
        ],
        equations: [
          'W = m \\cdot g',
          'N = m \\cdot g \\cdot \\cos\\theta',
          'W_t = m \\cdot g \\cdot \\sin\\theta',
        ],
        keyTerminology: [
          { term: 'Inclination Angle (θ)', definition: 'The angle between the incline and the horizontal ground plane.' },
          { term: 'Normal Force (N)', definition: 'Perpendicular contact reaction exerted by the plane on the block.' },
        ],
        highlightComponentIds: ['block', 'ramp', 'normal-arrow'],
        recommendedCamera: { position: [2.5, 2.5, 4.5], target: [0.5, 0.8, 0] },
      },
      {
        id: 'stage-static-friction',
        index: 1,
        title: 'Stage 2: Static Friction Range & Limiting Friction',
        shortDescription: 'Static friction is self-adjusting (f_s <= mu_s * N) until the maximum limiting friction is reached.',
        detailedExplanation:
          'Coulomb\'s law specifies that static friction does not take a constant value; it provides exactly the resisting force ' +
          'needed to maintain equilibrium up to f_max = μ_s · N. If the downslope force W sin θ is less than f_max, ' +
          'the block remains perfectly stationary with f_s = W sin θ.',
        principles: [
          'Coulomb Static Inequality: |f_s| ≤ μ_s · N',
          'Maximum Limiting Friction: f_{s,max} = μ_s · N',
        ],
        equations: [
          'f_s = m \\cdot g \\cdot \\sin\\theta \\quad (\\text{when in equilibrium})',
          'f_{s,max} = \\mu_s \\cdot (m \\cdot g \\cdot \\cos\\theta)',
        ],
        keyTerminology: [
          { term: 'Limiting Friction', definition: 'The maximum possible tangential resistance before impending motion occurs.' },
          { term: 'Coefficient of Static Friction (μ_s)', definition: 'Dimensionless ratio representing microscopic roughness interlocking.' },
        ],
        highlightComponentIds: ['friction-arrow'],
        recommendedCamera: { position: [1.8, 2.0, 3.8], target: [0.5, 0.8, 0] },
      },
      {
        id: 'stage-angle-of-repose',
        index: 2,
        title: 'Stage 3: Angle of Repose & Impending Motion',
        shortDescription: 'When tan θ = mu_s, impending slipping occurs. This angle is the angle of repose θ_c.',
        detailedExplanation:
          'At the critical threshold of impending motion, downslope component equals limiting friction: ' +
          'm g sin θ_c = μ_s (m g cos θ_c). Dividing by cos θ yields tan θ_c = μ_s, or θ_c = arctan(μ_s). ' +
          'Notice that the angle of repose is completely independent of the mass of the block!',
        principles: [
          'Condition for Impending Slip: tan(θ_c) = μ_s',
          'Angle of Repose / Friction Angle: θ_c = arctan(μ_s) = Φ_s',
        ],
        equations: [
          '\\tan \\theta_c = \\mu_s \\implies \\theta_c = \\arctan(\\mu_s)',
        ],
        keyTerminology: [
          { term: 'Angle of Repose', definition: 'Maximum angle of an incline at which a body can remain at rest without sliding.' },
          { term: 'Impending Motion', definition: 'The state just before an object transitions from rest to motion.' },
        ],
        highlightComponentIds: ['ramp', 'block'],
        recommendedCamera: { position: [2.5, 2.5, 4.5], target: [0.5, 0.8, 0] },
      },
      {
        id: 'stage-kinetic-sliding',
        index: 3,
        title: 'Stage 4: Kinetic Sliding & Dynamic Acceleration',
        shortDescription: 'Once sliding begins, friction drops to f_k = mu_k * N, producing downslope acceleration a = g(sin θ - mu_k cos θ).',
        detailedExplanation:
          'When θ exceeds θ_c (or an external push overcomes f_max), microscopic surface bonds shear. ' +
          'Friction drops to kinetic friction f_k = μ_k · N, which is typically 15–30% lower than static friction. ' +
          'By Newton\'s second law: Σ F_t = m · a ⇒ m g sin θ - μ_k m g cos θ = m · a.',
        principles: [
          'Kinetic Friction: f_k = μ_k · N',
          'Downslope Acceleration: a = g · (sin θ - μ_k · cos θ)',
        ],
        equations: [
          'a = g \\cdot (\\sin\\theta - \\mu_k \\cdot \\cos\\theta)',
        ],
        keyTerminology: [
          { term: 'Kinetic Friction', definition: 'The retarding contact force between two surfaces moving relative to each other.' },
          { term: 'Stick-Slip Transition', definition: 'The sudden acceleration jump when static bonds yield to kinetic friction.' },
        ],
        highlightComponentIds: ['block', 'friction-arrow'],
        recommendedCamera: { position: [3.0, 2.8, 5.0], target: [0.5, 0.8, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.inclineAngleDeg = 15.0;
      this.appliedForceN = 0.0;
    } else if (stageIndex === 1) {
      this.inclineAngleDeg = 20.0;
      this.appliedForceN = 0.0;
    } else if (stageIndex === 2) {
      // Angle of repose: tan(θ_c) = μ_s (with μ_s = 0.45, θ_c ≈ 24.23°)
      this.inclineAngleDeg = THREE.MathUtils.radToDeg(Math.atan(this.muStatic));
      this.appliedForceN = 0.0;
    } else if (stageIndex === 3) {
      this.inclineAngleDeg = 35.0;
      this.appliedForceN = 0.0;
    }
    this.parameters['inclineAngle'] = this.inclineAngleDeg;
    this.parameters['appliedForce'] = this.appliedForceN;
    this.resetSimulation();
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'inclineAngle') this.inclineAngleDeg = num;
    if (key === 'blockMass') this.blockMassKg = Math.max(0.1, num);
    if (key === 'muStatic') this.muStatic = Math.max(0.01, num);
    if (key === 'muKinetic') this.muKinetic = Math.min(this.muStatic, Math.max(0.01, num));
    if (key === 'appliedForce') this.appliedForceN = num;

    this.resetSimulation();
    this.recalculateAndRender();
  }

  private resetSimulation(): void {
    this.blockPosAlongPlane = 0.0;
    this.blockVel = 0.0;
    this.isSliding = false;
  }

  private recalculateAndRender(): void {
    const rad = THREE.MathUtils.degToRad(this.inclineAngleDeg);
    this.rampGroup.rotation.z = rad;

    const g = 9.81;
    const W = this.blockMassKg * g;
    const N = W * Math.cos(rad);
    const W_t = W * Math.sin(rad); // down-slope

    // Net driving tangential force without friction
    // Positive = downslope driving force
    const drivingForce = W_t - this.appliedForceN;

    const f_s_max = this.muStatic * N;
    const f_k = this.muKinetic * N;

    let f_actual = 0;
    let netForce = 0;
    let stateStatus = 'Static Equilibrium';

    if (Math.abs(drivingForce) <= f_s_max) {
      // In static equilibrium
      f_actual = drivingForce;
      netForce = 0;
      this.isSliding = false;
      stateStatus = 'Static Equilibrium (Locked)';
    } else {
      // Sliding occurs!
      this.isSliding = true;
      const dir = Math.sign(drivingForce);
      f_actual = dir * f_k;
      netForce = drivingForce - f_actual;
      stateStatus = drivingForce > 0 ? 'Sliding Downhill (Accelerating)' : 'Pushed Uphill (Sliding)';
    }

    const accel = netForce / this.blockMassKg;
    const angleReposeDeg = THREE.MathUtils.radToDeg(Math.atan(this.muStatic));

    // Update block 3D position
    const initialPos = 2.2;
    const currentX = Math.max(0.4, Math.min(this.planeLength - 0.4, initialPos - this.blockPosAlongPlane));
    this.blockMesh.position.x = currentX;

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    const origin = new THREE.Vector3(currentX, 0.35 / 2, 0);

    // 1. Normal Force Arrow (perpendicular, up from ramp)
    const normDir = new THREE.Vector3(0, 1, 0);
    const normLen = Math.min(1.8, Math.max(0.4, (N / 100) * 1.5));
    const normArrow = VectorRenderer.createArrow({
      origin,
      direction: normDir,
      length: normLen,
      color: 0x16a34a, // Green
      shaftRadius: 0.025,
      headRadius: 0.06,
    });
    this.vectorGroup.add(normArrow);

    // 2. Friction Vector Arrow (along plane, opposing driving force)
    const fricDirX = drivingForce >= 0 ? 1 : -1;
    const fricLen = Math.min(1.5, Math.max(0.2, (Math.abs(f_actual) / 100) * 1.5));
    const fricArrow = VectorRenderer.createArrow({
      origin: new THREE.Vector3(currentX, 0.02, 0),
      direction: new THREE.Vector3(fricDirX, 0, 0),
      length: fricLen,
      color: 0xd97706, // Orange Amber
      shaftRadius: 0.022,
      headRadius: 0.055,
    });
    this.vectorGroup.add(fricArrow);

    // 3. Weight Arrow (world down vector transformed into ramp coordinates)
    const worldDown = new THREE.Vector3(0, -1, 0);
    const rampDown = worldDown.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), -rad);
    const weightLen = Math.min(1.8, Math.max(0.5, (W / 100) * 1.5));
    const weightArrow = VectorRenderer.createArrow({
      origin,
      direction: rampDown,
      length: weightLen,
      color: 0x2563eb, // Blue
      shaftRadius: 0.025,
      headRadius: 0.06,
    });
    this.vectorGroup.add(weightArrow);

    // Annotations
    const worldBlockPos = new THREE.Vector3();
    this.blockMesh.getWorldPosition(worldBlockPos);

    this.annotations.clear();
    this.annotations.add({
      id: 'block-state',
      title: `Block: ${stateStatus}`,
      text: `Mass: ${this.blockMassKg.toFixed(1)} kg | a = ${accel.toFixed(2)} m/s²`,
      worldPosition: worldBlockPos.clone().add(new THREE.Vector3(0, 0.45, 0)),
      type: this.isSliding ? 'warning' : 'success',
      category: 'Kinematics',
    });

    this.annotations.add({
      id: 'repose-angle',
      title: `Incline: ${this.inclineAngleDeg.toFixed(1)}°`,
      text: `Repose Angle θ_c = ${angleReposeDeg.toFixed(1)}° (μ_s = ${this.muStatic.toFixed(2)})`,
      worldPosition: new THREE.Vector3(-1.0, 0.6, 0.8),
      type: 'info',
      category: 'Friction',
    });

    this.annotations.add({
      id: 'contact-forces',
      title: 'Contact Forces',
      text: `N = ${N.toFixed(1)} N | f = ${Math.abs(f_actual).toFixed(1)} N (Max: ${f_s_max.toFixed(1)} N)`,
      worldPosition: worldBlockPos.clone().add(new THREE.Vector3(0.4, 0.2, 0)),
      type: 'info',
      category: 'Kinetics',
    });

    // Update inspection data
    this.inspectedComponent = {
      id: 'block',
      name: 'Sliding Block & Incline Contact',
      type: 'Mechanical Body with Dry Friction',
      description: 'Solid mass undergoing Coulomb contact friction against an adjustable inclined plane.',
      properties: {
        'Inclination Angle (θ)': `${this.inclineAngleDeg.toFixed(1)}°`,
        'Angle of Repose (θ_c)': `${angleReposeDeg.toFixed(1)}°`,
        'Block Mass (m)': `${this.blockMassKg.toFixed(1)} kg`,
        'Total Weight (W = mg)': `${W.toFixed(1)} N`,
        'Normal Force (N)': `${N.toFixed(1)} N`,
        'Parallel Component (W sin θ)': `${W_t.toFixed(1)} N`,
        'Max Static Friction (f_s,max)': `${f_s_max.toFixed(1)} N`,
        'Kinetic Friction (f_k)': `${f_k.toFixed(1)} N`,
        'Actual Friction Force (f)': `${Math.abs(f_actual).toFixed(1)} N`,
        'Linear Acceleration (a)': `${accel.toFixed(2)} m/s²`,
        'Current Regime': stateStatus,
      },
    };

    this.metrics['Incline Angle'] = `${this.inclineAngleDeg.toFixed(1)}°`;
    this.metrics['Repose Angle'] = `${angleReposeDeg.toFixed(1)}°`;
    this.metrics['Normal Force N'] = `${N.toFixed(1)} N`;
    this.metrics['Friction Force'] = `${Math.abs(f_actual).toFixed(1)} N`;
    this.metrics['Acceleration a'] = `${accel.toFixed(2)} m/s²`;
    this.metrics['Status'] = stateStatus;
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying && this.isSliding) {
      const g = 9.81;
      const rad = THREE.MathUtils.degToRad(this.inclineAngleDeg);
      const W = this.blockMassKg * g;
      const N = W * Math.cos(rad);
      const W_t = W * Math.sin(rad);
      const drivingForce = W_t - this.appliedForceN;
      const f_k = this.muKinetic * N;

      const netForce = drivingForce - Math.sign(drivingForce) * f_k;
      const accel = netForce / this.blockMassKg;

      this.blockVel += accel * deltaSeconds * this.playbackSpeed;
      this.blockPosAlongPlane += this.blockVel * deltaSeconds * this.playbackSpeed;

      // Bound to ramp limits
      if (this.blockPosAlongPlane > 1.8) {
        this.blockPosAlongPlane = 1.8;
        this.blockVel = 0;
      } else if (this.blockPosAlongPlane < -1.5) {
        this.blockPosAlongPlane = -1.5;
        this.blockVel = 0;
      }

      this.recalculateAndRender();
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.resetSimulation();
    this.recalculateAndRender();
  }
}
