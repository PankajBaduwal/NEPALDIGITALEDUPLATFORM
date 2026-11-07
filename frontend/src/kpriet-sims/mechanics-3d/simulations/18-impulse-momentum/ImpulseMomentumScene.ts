/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 18: Impulse, Momentum and Impact
 * Unit V: Dynamics of Particles and Rigid Bodies
 *
 * Demonstrates:
 * - Conservation of linear momentum: m1*v1 + m2*v2 = m1*v1' + m2*v2'
 * - Newton's law of collision and coefficient of restitution: e = (v2' - v1') / (v1 - v2)
 * - Post-collision velocities:
 *   v1' = [(m1 - e*m2)*v1 + (1 + e)*m2*v2] / (m1 + m2)
 *   v2' = [(m2 - e*m1)*v2 + (1 + e)*m1*v1] / (m1 + m2)
 * - Impulse of impact force: J = m1*(v1' - v1) = -m2*(v2' - v2)
 * - Kinetic energy dissipation: ΔE_k = 0.5 * [m1*m2/(m1+m2)] * (1 - e^2) * (v1 - v2)^2
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class ImpulseMomentumScene extends BaseMechanicsSimulation {
  private trackGroup = new THREE.Group();
  private cart1Group = new THREE.Group();
  private cart2Group = new THREE.Group();
  private vectorGroup = new THREE.Group();
  private impactSpark!: THREE.Mesh;

  // Collision parameters
  private m1 = 3.0; // mass of cart 1 (kg)
  private m2 = 2.0; // mass of cart 2 (kg)
  private v1Initial = 2.0; // initial velocity cart 1 (m/s)
  private v2Initial = -1.2; // initial velocity cart 2 (m/s)
  private restitutionE = 0.75; // coefficient of restitution (0 to 1)

  // Dynamic state
  private pos1 = -2.5;
  private pos2 = 2.5;
  private vel1 = 2.0;
  private vel2 = -1.2;
  private hasCollided = false;
  private impactTime = 0.0;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(12, 12);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.trackGroup);
    this.scene.add(this.cart1Group);
    this.scene.add(this.cart2Group);
    this.scene.add(this.vectorGroup);

    // Track
    const trackGeo = new THREE.BoxGeometry(8.0, 0.1, 0.8);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, 0.05, 0);
    track.receiveShadow = true;
    this.trackGroup.add(track);

    // Cart 1 (Blue)
    const c1Geo = new THREE.BoxGeometry(0.65, 0.25, 0.45);
    const c1Mat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const c1Body = new THREE.Mesh(c1Geo, c1Mat);
    c1Body.position.y = 0.2;
    c1Body.castShadow = true;
    this.cart1Group.add(c1Body);

    // Cart 2 (Orange)
    const c2Geo = new THREE.BoxGeometry(0.65, 0.25, 0.45);
    const c2Mat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.6, roughness: 0.3 });
    const c2Body = new THREE.Mesh(c2Geo, c2Mat);
    c2Body.position.y = 0.2;
    c2Body.castShadow = true;
    this.cart2Group.add(c2Body);

    // Impact flash ring
    const sparkGeo = new THREE.RingGeometry(0.05, 0.35, 16);
    sparkGeo.rotateY(Math.PI / 2);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    this.impactSpark = new THREE.Mesh(sparkGeo, sparkMat);
    this.scene.add(this.impactSpark);

    this.parameters['cart1Mass'] = 3.0;
    this.parameters['cart2Mass'] = 2.0;
    this.parameters['cart1Velocity'] = 2.0;
    this.parameters['cart2Velocity'] = -1.2;
    this.parameters['restitutionE'] = 0.75;

    this.resetExperiment();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-momentum-conservation',
        index: 0,
        title: 'Stage 1: Linear Momentum Conservation Principle',
        shortDescription: 'In an isolated collision, total momentum is strictly conserved: P_total = m1*v1 + m2*v2 = const.',
        detailedExplanation:
          'During collinear collision, internal contact impact forces between the two bodies are equal and opposite ' +
          'by Newton\'s third law. Since net external force along the track is zero, the total linear momentum ' +
          'P = m1·v1 + m2·v2 remains identical before, during, and after impact.',
        principles: [
          'Linear Momentum: P = m · v',
          'Conservation Law: m_1 · v_1 + m_2 · v_2 = m_1 · v_1\' + m_2 · v_2\'',
        ],
        equations: [
          'm_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\'',
        ],
        keyTerminology: [
          { term: 'Linear Momentum (P)', definition: 'Product of mass and velocity of a moving body (kg·m/s).' },
          { term: 'Isolated System', definition: 'System subject to zero net external horizontal forces.' },
        ],
        highlightComponentIds: ['cart1', 'cart2'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0.3, 0] },
      },
      {
        id: 'stage-restitution-law',
        index: 1,
        title: 'Stage 2: Newton\'s Law of Collision & Restitution (e)',
        shortDescription: 'Coefficient of restitution e = (v2\' - v1\') / (v1 - v2) measures elasticity of impact.',
        detailedExplanation:
          'Newton observed that the relative velocity of separation is proportional to the relative velocity of approach: ' +
          '(v2\' - v1\') = e · (v1 - v2). ' +
          'When e = 1.0, impact is perfectly elastic (no energy loss). ' +
          'When e = 0, collision is perfectly plastic (carts lock together). ' +
          'Real engineering collisions typically exhibit e between 0.4 and 0.85.',
        principles: [
          'Approach Velocity: v_{rel} = v_1 - v_2',
          'Separation Velocity: v\'_{rel} = v_2\' - v_1\'',
          'Restitution Coefficient: e = (v_2\' - v_1\') / (v_1 - v_2)',
        ],
        equations: [
          'e = \\frac{v_2\' - v_1\'}{v_1 - v_2}',
        ],
        keyTerminology: [
          { term: 'Coefficient of Restitution (e)', definition: 'Dimensionless ratio of separation speed to approach speed.' },
        ],
        highlightComponentIds: ['cart1', 'cart2'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0.3, 0] },
      },
      {
        id: 'stage-impulse-calculation',
        index: 2,
        title: 'Stage 3: Impact Impulse & Force-Time Exchange',
        shortDescription: 'Impulse J = ∫ F dt = m1*(v1\' - v1) represents the momentum transfer between bodies.',
        detailedExplanation:
          'During the brief collision duration Δt, intense internal normal forces generate impulse ' +
          'J = ∫ F dt. Cart 1 receives impulse -J (reducing its momentum), while Cart 2 receives impulse +J. ' +
          'The impulse equals the change in linear momentum of each individual body.',
        principles: [
          'Impulse-Momentum Theorem: J = ΔP = m · Δv',
          'Equal & Opposite Transfer: J_1 = -J_2',
        ],
        equations: [
          'J = m_1 (v_1\' - v_1) = -m_2 (v_2\' - v_2)',
        ],
        keyTerminology: [
          { term: 'Impulse (J)', definition: 'Integral of force over the duration of contact (N·s or kg·m/s).' },
        ],
        highlightComponentIds: ['impact-zone'],
        recommendedCamera: { position: [0, 1.8, 3.2], target: [0, 0.3, 0] },
      },
      {
        id: 'stage-energy-loss-analysis',
        index: 3,
        title: 'Stage 4: Kinetic Energy Loss in Inelastic Impact',
        shortDescription: 'Inelastic impact dissipates kinetic energy into deformation, sound, and thermal heat.',
        detailedExplanation:
          'While momentum is strictly conserved in every collision, kinetic energy is conserved ONLY when e = 1.0! ' +
          'For any e < 1.0, kinetic energy loss is: ' +
          'ΔE_k = (1/2) · [m1·m2 / (m1 + m2)] · (1 - e²) · (v1 - v2)². ' +
          'In a perfectly plastic collision (e = 0), maximum possible kinetic energy is dissipated.',
        principles: [
          'Initial Kinetic Energy: E_{k1} = 0.5 · m1 · v1² + 0.5 · m2 · v2²',
          'Final Kinetic Energy: E_{k2} = 0.5 · m1 · v1\'² + 0.5 · m2 · v2\'²',
          'Dissipated Loss: ΔE_k = E_{k1} - E_{k2}',
        ],
        equations: [
          '\\Delta E_k = \\frac{1}{2} \\frac{m_1 m_2}{m_1 + m_2} (1 - e^2) (v_1 - v_2)^2',
        ],
        keyTerminology: [
          { term: 'Energy Dissipation Factor (1 - e²)', definition: 'Fraction of kinetic energy converted into non-recoverable internal energy.' },
        ],
        highlightComponentIds: ['cart1', 'cart2'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0.3, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.restitutionE = 1.0;
      this.v1Initial = 2.0;
      this.v2Initial = -1.2;
    } else if (stageIndex === 1) {
      this.restitutionE = 0.75;
      this.v1Initial = 2.0;
      this.v2Initial = -1.2;
    } else if (stageIndex === 2) {
      this.restitutionE = 0.5;
      this.v1Initial = 2.0;
      this.v2Initial = -1.2;
    } else if (stageIndex === 3) {
      this.restitutionE = 0.0;
      this.v1Initial = 2.0;
      this.v2Initial = -1.2;
    }
    this.parameters['restitutionE'] = this.restitutionE;
    this.parameters['cart1Velocity'] = this.v1Initial;
    this.parameters['cart2Velocity'] = this.v2Initial;
    this.resetExperiment();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'cart1Mass') this.m1 = Math.max(0.5, num);
    if (key === 'cart2Mass') this.m2 = Math.max(0.5, num);
    if (key === 'cart1Velocity') this.v1Initial = num;
    if (key === 'cart2Velocity') this.v2Initial = num;
    if (key === 'restitutionE') this.restitutionE = Math.min(1.0, Math.max(0.0, num));

    this.resetExperiment();
  }

  private recalculateAndRender(): void {
    // Total Initial Momentum
    const pTotal = this.m1 * this.vel1 + this.m2 * this.vel2;
    const ke1 = 0.5 * this.m1 * (this.vel1 * this.vel1);
    const ke2 = 0.5 * this.m2 * (this.vel2 * this.vel2);
    const keTotal = ke1 + ke2;

    // Position carts
    this.cart1Group.position.set(this.pos1, 0.05, 0);
    this.cart2Group.position.set(this.pos2, 0.05, 0);

    // Impact flash position
    if (this.hasCollided) {
      this.impactSpark.position.set((this.pos1 + this.pos2) / 2, 0.25, 0);
    }

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    // Velocity arrows on Cart 1 & Cart 2
    if (Math.abs(this.vel1) > 0.05) {
      const len1 = Math.min(1.8, Math.max(0.3, (Math.abs(this.vel1) / 3.0) * 1.5));
      this.vectorGroup.add(
        VectorRenderer.createArrow({
          origin: new THREE.Vector3(this.pos1, 0.45, 0),
          direction: new THREE.Vector3(Math.sign(this.vel1), 0, 0),
          length: len1,
          color: 0x2563eb, // Blue
        })
      );
    }

    if (Math.abs(this.vel2) > 0.05) {
      const len2 = Math.min(1.8, Math.max(0.3, (Math.abs(this.vel2) / 3.0) * 1.5));
      this.vectorGroup.add(
        VectorRenderer.createArrow({
          origin: new THREE.Vector3(this.pos2, 0.45, 0),
          direction: new THREE.Vector3(Math.sign(this.vel2), 0, 0),
          length: len2,
          color: 0xea580c, // Orange
        })
      );
    }

    // Annotations
    this.annotations.clear();
    this.annotations.add({
      id: 'momentum-status',
      title: `Momentum: P_tot = ${pTotal.toFixed(2)} kg·m/s (Conserved)`,
      text: `Cart 1: v1 = ${this.vel1.toFixed(2)} m/s | Cart 2: v2 = ${this.vel2.toFixed(2)} m/s`,
      worldPosition: new THREE.Vector3(0, 0.9, 0),
      type: 'info',
      category: 'Conservation Laws',
    });

    this.annotations.add({
      id: 'restitution-status',
      title: `Restitution e = ${this.restitutionE.toFixed(2)}`,
      text: this.restitutionE === 1.0 ? 'PERFECTLY ELASTIC (ΔE = 0)' : this.restitutionE === 0 ? 'PERFECTLY PLASTIC (Max Loss)' : 'INELASTIC COLLISION',
      worldPosition: new THREE.Vector3(0, 1.3, 0),
      type: this.restitutionE === 1.0 ? 'success' : 'warning',
      category: 'Impact Mechanics',
    });

    this.inspectedComponent = {
      id: 'impact-rig',
      name: 'Collinear Impact Dynamic Apparatus',
      type: '2-Body Collision Conservation System',
      description: 'Linear track apparatus verifying conservation of momentum, coefficient of restitution, and kinetic energy loss.',
      properties: {
        'Cart 1 Mass (m1)': `${this.m1.toFixed(1)} kg`,
        'Cart 2 Mass (m2)': `${this.m2.toFixed(1)} kg`,
        'Total Momentum (P_tot)': `${pTotal.toFixed(3)} kg·m/s`,
        'Total Kinetic Energy (KE)': `${keTotal.toFixed(2)} J`,
        'Cart 1 Velocity (v1)': `${this.vel1.toFixed(2)} m/s`,
        'Cart 2 Velocity (v2)': `${this.vel2.toFixed(2)} m/s`,
        'Coefficient of Restitution (e)': `${this.restitutionE.toFixed(2)}`,
        'Impact Status': this.hasCollided ? 'Post-Collision' : 'Pre-Collision Approach',
      },
    };

    this.metrics['Total Momentum P'] = `${pTotal.toFixed(2)} kg·m/s`;
    this.metrics['Total KE'] = `${keTotal.toFixed(2)} J`;
    this.metrics['Cart 1 Velocity'] = `${this.vel1.toFixed(2)} m/s`;
    this.metrics['Cart 2 Velocity'] = `${this.vel2.toFixed(2)} m/s`;
    this.metrics['Restitution e'] = `${this.restitutionE.toFixed(2)}`;
    this.metrics['Impact Status'] = this.hasCollided ? 'Post-Collision' : 'Pre-Collision';
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying) {
      const dt = deltaSeconds * this.playbackSpeed;

      this.pos1 += this.vel1 * dt;
      this.pos2 += this.vel2 * dt;

      // Check collision condition (cart width = 0.65m, contact when pos2 - pos1 <= 0.65)
      const cartWidth = 0.65;
      if (!this.hasCollided && this.pos2 - this.pos1 <= cartWidth) {
        this.hasCollided = true;
        this.impactTime = 0.15; // flash timer

        // Compute post-collision velocities
        const u1 = this.vel1;
        const u2 = this.vel2;
        const e = this.restitutionE;
        const mTotal = this.m1 + this.m2;

        const v1Prime = ((this.m1 - e * this.m2) * u1 + (1 + e) * this.m2 * u2) / mTotal;
        const v2Prime = ((this.m2 - e * this.m1) * u2 + (1 + e) * this.m1 * u1) / mTotal;

        this.vel1 = v1Prime;
        this.vel2 = v2Prime;
      }

      // Flash decay
      if (this.impactTime > 0) {
        this.impactTime -= dt;
        const mat = this.impactSpark.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, this.impactTime / 0.15);
      }

      // Stop if carts leave track limits
      if (this.pos1 < -3.8 || this.pos2 > 3.8 || this.pos1 > 3.8 || this.pos2 < -3.8) {
        this.pause();
      }

      this.recalculateAndRender();
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.pos1 = -2.5;
    this.pos2 = 2.5;
    this.vel1 = this.v1Initial;
    this.vel2 = this.v2Initial;
    this.hasCollided = false;
    this.impactTime = 0.0;
    const mat = this.impactSpark.material as THREE.MeshBasicMaterial;
    mat.opacity = 0;
    this.recalculateAndRender();
  }
}
