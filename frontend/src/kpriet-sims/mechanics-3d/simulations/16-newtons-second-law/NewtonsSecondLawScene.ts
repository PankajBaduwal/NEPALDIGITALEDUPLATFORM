/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 16: Newton's Second Law and Connected Bodies
 * Unit V: Dynamics of Particles and Rigid Bodies
 *
 * Demonstrates:
 * - D'Alembert's principle and Newton's second law for connected systems: ΣF = m · a
 * - Coupled equations of motion for cart (m1) on friction track and hanging mass (m2):
 *   a = [(m2 - mu_k * m1) / (m1 + m2)] * g
 *   T = [m1 * m2 * (1 + mu_k) / (m1 + m2)] * g
 * - Inextensible string constraint and frictionless pulley torque balance
 * - Free-body diagram vector visualization for both isolated bodies
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class NewtonsSecondLawScene extends BaseMechanicsSimulation {
  private benchGroup = new THREE.Group();
  private cartGroup = new THREE.Group();
  private hangingGroup = new THREE.Group();
  private vectorGroup = new THREE.Group();
  private pulleyMesh!: THREE.Mesh;
  private cableLine!: THREE.Line;

  // System parameters
  private m1 = 4.0; // cart mass (kg)
  private m2 = 2.0; // hanging mass (kg)
  private muTrack = 0.15; // kinetic friction
  private g = 9.81;

  // Kinematic state
  private cartX = -2.0; // initial cart position on track
  private hangingY = 1.6; // initial hanging mass elevation
  private velocity = 0.0;
  private pulleyAngle = 0.0;
  protected _maxTravel = 3.2;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(12, 12);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.benchGroup);
    this.scene.add(this.cartGroup);
    this.scene.add(this.hangingGroup);
    this.scene.add(this.vectorGroup);

    // Build Elevated Laboratory Bench (Table height = 2.2 m)
    const benchTopGeo = new THREE.BoxGeometry(5.0, 0.15, 1.2);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const benchTop = new THREE.Mesh(benchTopGeo, benchMat);
    benchTop.position.set(-0.5, 2.2, 0);
    benchTop.receiveShadow = true;
    this.benchGroup.add(benchTop);

    // Bench legs
    const legGeo = new THREE.BoxGeometry(0.12, 2.2, 0.12);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const legPositions = [
      [-2.8, 1.1, -0.5],
      [-2.8, 1.1, 0.5],
      [1.8, 1.1, -0.5],
      [1.8, 1.1, 0.5],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x!, y!, z!);
      this.benchGroup.add(leg);
    });

    // Pulley mounted at bench edge (x = 2.05, y = 2.35)
    const pulleySub = MechanicalBuilder.createPulley(0.18, 0.06);
    this.pulleyMesh = (pulleySub.children[0] as THREE.Mesh) || new THREE.Mesh();
    pulleySub.position.set(2.05, 2.35, 0);
    this.benchGroup.add(pulleySub);

    // Build Cart (m1)
    const cartBodyGeo = new THREE.BoxGeometry(0.65, 0.22, 0.45);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const cartBody = new THREE.Mesh(cartBodyGeo, cartMat);
    cartBody.position.y = 0.2;
    cartBody.castShadow = true;
    this.cartGroup.add(cartBody);

    // Cart wheels
    const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    [-0.2, 0.2].forEach((x) => {
      [-0.24, 0.24].forEach((z) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.position.set(x, 0.08, z);
        this.cartGroup.add(w);
      });
    });

    // Build Hanging Weight (m2)
    const hangGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.35, 16);
    const hangMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.8, roughness: 0.2 });
    const hangWeight = new THREE.Mesh(hangGeo, hangMat);
    hangWeight.castShadow = true;
    this.hangingGroup.add(hangWeight);

    // Cable Line connecting cart to hanging mass
    const cableMat = new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 2 });
    const cableGeo = new THREE.BufferGeometry();
    this.cableLine = new THREE.Line(cableGeo, cableMat);
    this.scene.add(this.cableLine);

    this.parameters['cartMass'] = 4.0;
    this.parameters['hangingMass'] = 2.0;
    this.parameters['frictionCoeff'] = 0.15;

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-coupled-system',
        index: 0,
        title: 'Stage 1: System Kinematic Constraint & Free-Body Diagrams',
        shortDescription: 'Inextensible cable constraint forces both bodies to share identical acceleration magnitude a.',
        detailedExplanation:
          'Because the cable is inextensible and taut, every increment of horizontal displacement dx of the cart ' +
          'corresponds to an equal vertical descent dy of the hanging mass. ' +
          'Differentiating twice confirms that both bodies accelerate with equal magnitude: a_cart = a_hanging = a.',
        principles: [
          'Kinematic Cable Constraint: s_1 + s_2 = L_string = const',
          'Acceleration Equivalence: a_1 = a_2 = a',
        ],
        equations: [
          '\\frac{d^2 s_1}{dt^2} = \\frac{d^2 s_2}{dt^2} = a',
        ],
        keyTerminology: [
          { term: 'Kinematic Constraint', definition: 'Geometric restriction relating coordinates and derivatives of connected bodies.' },
          { term: 'Inextensible Cable', definition: 'Idealized string that does not stretch under tension.' },
        ],
        highlightComponentIds: ['cart', 'hanging-mass', 'pulley'],
        recommendedCamera: { position: [1.2, 3.2, 5.0], target: [0.5, 1.8, 0] },
      },
      {
        id: 'stage-equations-of-motion',
        index: 1,
        title: 'Stage 2: Newton\'s Second Law for Isolated Bodies',
        shortDescription: 'For m2: m2*g - T = m2*a. For m1: T - f_k = m1*a.',
        detailedExplanation:
          'Isolating hanging mass m2: gravity pulls down (m2·g) and tension pulls up (T), yielding m2·g - T = m2·a. ' +
          'Isolating cart m1: cable tension pulls right (T) while kinetic friction f_k = μ_k · m1 · g opposes motion, ' +
          'yielding T - μ_k · m1 · g = m1 · a.',
        principles: [
          'Hanging Body Kinetics: m_2 · g - T = m_2 · a',
          'Cart Horizontal Kinetics: T - f_k = m_1 · a',
          'Normal Reaction on Cart: N_1 = m_1 · g',
        ],
        equations: [
          'm_2 g - T = m_2 a',
          'T - \\mu_k m_1 g = m_1 a',
        ],
        keyTerminology: [
          { term: 'Internal Cable Tension (T)', definition: 'The transmitted pulling force exerted equally on both ends of the light cord.' },
        ],
        highlightComponentIds: ['cart', 'hanging-mass'],
        recommendedCamera: { position: [1.2, 3.2, 5.0], target: [0.5, 1.8, 0] },
      },
      {
        id: 'stage-coupled-solution',
        index: 2,
        title: 'Stage 3: Coupled Acceleration and Cable Tension Equations',
        shortDescription: 'Adding equations eliminates T: a = [(m2 - mu_k*m1)/(m1 + m2)]*g.',
        detailedExplanation:
          'Summing both equations eliminates internal tension T: ' +
          '(m2·g - T) + (T - μ_k·m1·g) = (m1 + m2)·a. ' +
          'Solving yields system acceleration: a = [(m2 - μ_k·m1) / (m1 + m2)] · g. ' +
          'Back-substituting into either equation yields the tension: T = [m1·m2·(1 + μ_k) / (m1 + m2)] · g.',
        principles: [
          'Coupled Acceleration: a = g · (m_2 - μ_k · m_1) / (m_1 + m_2)',
          'Cable Tension: T = g · [m_1 · m_2 · (1 + μ_k)] / (m_1 + m_2)',
        ],
        equations: [
          'a = \\frac{m_2 - \\mu_k m_1}{m_1 + m_2} g',
          'T = \\frac{m_1 m_2 (1 + \\mu_k)}{m_1 + m_2} g',
        ],
        keyTerminology: [
          { term: 'System Mass', definition: 'The combined inertia (m1 + m2) that must be accelerated by the net external driving force.' },
        ],
        highlightComponentIds: ['pulley', 'cable'],
        recommendedCamera: { position: [1.5, 3.0, 4.5], target: [0.5, 1.8, 0] },
      },
      {
        id: 'stage-atwood-comparison',
        index: 3,
        title: 'Stage 4: Mass Ratio Variation & Static Threshold',
        shortDescription: 'If m2 <= mu_s * m1, motion is prevented by friction (a = 0, T = m2*g).',
        detailedExplanation:
          'When hanging mass m2 is too light, the gravitational driving force m2·g cannot overcome static friction ' +
          'f_{s,max} = μ_s · m1 · g. The system remains stationary with zero acceleration and tension exactly equal to m2·g. ' +
          'Increasing m2 beyond the threshold initiates rapid dynamic acceleration.',
        principles: [
          'Static Threshold: m_2 ≤ μ_s · m_1 ⇒ a = 0',
          'Dynamic Drive: m_2 > μ_s · m_1 ⇒ a > 0',
        ],
        equations: [
          '\\text{Static Equilibrium if: } m_2 g \\le \\mu_s m_1 g',
        ],
        keyTerminology: [
          { term: 'Driving Potential', definition: 'Excess gravitational force m2·g exceeding frictional resistance f_k.' },
        ],
        highlightComponentIds: ['cart', 'hanging-mass'],
        recommendedCamera: { position: [1.2, 3.2, 5.0], target: [0.5, 1.8, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.m1 = 4.0;
      this.m2 = 2.0;
      this.muTrack = 0.15;
    } else if (stageIndex === 1) {
      this.m1 = 4.0;
      this.m2 = 2.0;
      this.muTrack = 0.15;
    } else if (stageIndex === 2) {
      this.m1 = 3.0;
      this.m2 = 3.0;
      this.muTrack = 0.1;
    } else if (stageIndex === 3) {
      // Static threshold lock: m2*g < mu_track*m1*g => a = 0
      this.m1 = 6.0;
      this.m2 = 0.5;
      this.muTrack = 0.25;
    }
    this.parameters['cartMass'] = this.m1;
    this.parameters['hangingMass'] = this.m2;
    this.parameters['frictionCoeff'] = this.muTrack;
    this.resetExperiment();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'cartMass') this.m1 = Math.max(0.5, num);
    if (key === 'hangingMass') this.m2 = Math.max(0.2, num);
    if (key === 'frictionCoeff') this.muTrack = Math.min(0.8, Math.max(0.0, num));

    this.resetExperiment();
  }

  private recalculateAndRender(): void {
    const drivingForce = this.m2 * this.g - this.muTrack * this.m1 * this.g;
    const totalMass = this.m1 + this.m2;
    const accel = drivingForce > 0 ? drivingForce / totalMass : 0.0;
    const tension = drivingForce > 0 ? (this.m1 * this.m2 * (1 + this.muTrack) * this.g) / totalMass : this.m2 * this.g;

    // Position cart on bench (surface at y = 2.275)
    this.cartGroup.position.set(this.cartX, 2.275, 0);

    // Position hanging mass
    const pulleyX = 2.05;
    const pulleyY = 2.35;
    this.hangingGroup.position.set(pulleyX + 0.18, this.hangingY, 0);

    // Update Cable Path Points
    const cartFront = new THREE.Vector3(this.cartX + 0.35, 2.45, 0);
    const pulleyTop = new THREE.Vector3(pulleyX, pulleyY + 0.18, 0);
    const pulleyRight = new THREE.Vector3(pulleyX + 0.18, pulleyY, 0);
    const hangTop = new THREE.Vector3(pulleyX + 0.18, this.hangingY + 0.2, 0);

    const cablePoints = [cartFront, pulleyTop, pulleyRight, hangTop];
    this.cableLine.geometry.dispose();
    this.cableLine.geometry = new THREE.BufferGeometry().setFromPoints(cablePoints);

    // Rotate pulley
    this.pulleyMesh.rotation.z = this.pulleyAngle;

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    // 1. Tension Arrow on Cart (pulling right)
    const tLen = Math.min(1.8, Math.max(0.4, (tension / 50) * 1.5));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: cartFront,
        direction: new THREE.Vector3(1, 0, 0),
        length: tLen,
        color: 0x2563eb, // Blue
        shaftRadius: 0.02,
        headRadius: 0.05,
      })
    );

    // 2. Friction Arrow on Cart (opposing motion / left)
    const fK = this.muTrack * this.m1 * this.g;
    if (fK > 0.1) {
      const fLen = Math.min(1.5, Math.max(0.2, (fK / 50) * 1.5));
      this.vectorGroup.add(
        VectorRenderer.createArrow({
          origin: new THREE.Vector3(this.cartX, 2.28, 0),
          direction: new THREE.Vector3(-1, 0, 0),
          length: fLen,
          color: 0xd97706, // Amber
          shaftRadius: 0.02,
          headRadius: 0.05,
        })
      );
    }

    // 3. Tension Arrow on Hanging Mass (pulling up)
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: hangTop,
        direction: new THREE.Vector3(0, 1, 0),
        length: tLen,
        color: 0x2563eb, // Blue
        shaftRadius: 0.02,
        headRadius: 0.05,
      })
    );

    // 4. Weight Arrow on Hanging Mass (pulling down)
    const w2Len = Math.min(1.8, Math.max(0.4, ((this.m2 * this.g) / 50) * 1.5));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: new THREE.Vector3(pulleyX + 0.18, this.hangingY, 0),
        direction: new THREE.Vector3(0, -1, 0),
        length: w2Len,
        color: 0xef4444, // Red
        shaftRadius: 0.02,
        headRadius: 0.05,
      })
    );

    // Annotations
    this.annotations.clear();
    this.annotations.add({
      id: 'system-accel',
      title: accel > 0 ? `Accelerating: a = ${accel.toFixed(2)} m/s²` : 'STATIC LOCK (Friction Restrained)',
      text: `Cable Tension T = ${tension.toFixed(1)} N | Velocity v = ${this.velocity.toFixed(2)} m/s`,
      worldPosition: new THREE.Vector3(this.cartX, 3.1, 0),
      type: accel > 0 ? 'success' : 'warning',
      category: 'Coupled Kinetics',
    });

    this.annotations.add({
      id: 'hanging-data',
      title: `Hanging Load: ${(this.m2 * this.g).toFixed(1)} N`,
      text: `m2 = ${this.m2.toFixed(1)} kg | Net F_y = ${(this.m2 * this.g - tension).toFixed(1)} N`,
      worldPosition: new THREE.Vector3(pulleyX + 0.7, this.hangingY, 0),
      type: 'info',
      category: 'Forces',
    });

    this.inspectedComponent = {
      id: 'atwood-bench',
      name: 'Connected Bodies Bench Apparatus',
      type: 'Coupled 2-Body Dynamical System',
      description: 'Classic Atwood bench demonstrator governed by Newton\'s second law and string constraint.',
      properties: {
        'Cart Mass (m1)': `${this.m1.toFixed(1)} kg`,
        'Hanging Mass (m2)': `${this.m2.toFixed(1)} kg`,
        'Track Friction Coeff (μ_k)': `${this.muTrack.toFixed(2)}`,
        'Kinetic Friction Force (f_k)': `${fK.toFixed(1)} N`,
        'Hanging Weight (W2 = m2·g)': `${(this.m2 * this.g).toFixed(1)} N`,
        'Coupled Acceleration (a)': `${accel.toFixed(2)} m/s²`,
        'Cable Tension (T)': `${tension.toFixed(1)} N`,
        'System Total Mass': `${totalMass.toFixed(1)} kg`,
        'Current Velocity': `${this.velocity.toFixed(2)} m/s`,
      },
    };

    this.metrics['Cart Mass m1'] = `${this.m1.toFixed(1)} kg`;
    this.metrics['Hanging Mass m2'] = `${this.m2.toFixed(1)} kg`;
    this.metrics['Coupled Accel a'] = `${accel.toFixed(2)} m/s²`;
    this.metrics['Cable Tension T'] = `${tension.toFixed(1)} N`;
    this.metrics['Velocity v'] = `${this.velocity.toFixed(2)} m/s`;
    this.metrics['State'] = accel > 0 ? 'Accelerating' : 'Static Lock';
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying) {
      const drivingForce = this.m2 * this.g - this.muTrack * this.m1 * this.g;
      const totalMass = this.m1 + this.m2;
      const accel = drivingForce > 0 ? drivingForce / totalMass : 0.0;

      if (accel > 0) {
        this.velocity += accel * deltaSeconds * this.playbackSpeed;
        const ds = this.velocity * deltaSeconds * this.playbackSpeed;

        this.cartX += ds;
        this.hangingY -= ds;
        this.pulleyAngle -= ds / 0.18;

        // Check travel limits (cart hits pulley or weight hits ground)
        if (this.cartX >= 1.4 || this.hangingY <= 0.25) {
          this.pause();
        }

        this.recalculateAndRender();
      }
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.cartX = -2.0;
    this.hangingY = 1.6;
    this.velocity = 0.0;
    this.pulleyAngle = 0.0;
    this.recalculateAndRender();
  }
}
