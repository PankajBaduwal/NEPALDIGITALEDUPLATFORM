/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 20: Impact Comparison and Conservation Laws
 * Unit V: Dynamics of Particles and Rigid Bodies
 *
 * Demonstrates:
 * - Direct comparative experiment across three fundamental collision regimes:
 *   1. Perfectly Elastic (e = 1.0): Both momentum AND kinetic energy conserved (ΔE = 0)
 *   2. Partially Inelastic (0 < e < 1.0): Momentum conserved, partial kinetic energy loss
 *   3. Perfectly Plastic / Inelastic (e = 0.0): Maximum kinetic energy dissipated, bodies latch together (v_common)
 * - Rigorous mathematical proof that momentum conservation DOES NOT imply kinetic energy conservation
 * - Common velocity for plastic impact: v_common = (m1*v1 + m2*v2) / (m1 + m2)
 * - Kinetic energy retention ratio: η_E = E_k,final / E_k,initial
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class ImpactConservationScene extends BaseMechanicsSimulation {
  private trackGroup = new THREE.Group();
  private cart1Group = new THREE.Group();
  private cart2Group = new THREE.Group();
  private vectorGroup = new THREE.Group();
  private latchMesh!: THREE.Mesh;

  // Collision model parameters
  private m1 = 4.0; // kg
  private m2 = 2.0; // kg
  private v1Initial = 1.8; // m/s
  private v2Initial = -1.2; // m/s
  private collisionRegime = 1; // 0 = Elastic (e=1.0), 1 = Inelastic (e=0.6), 2 = Plastic (e=0.0)

  // Dynamic state
  private pos1 = -2.4;
  private pos2 = 2.4;
  private vel1 = 1.8;
  private vel2 = -1.2;
  private hasImpacted = false;

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
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, 0.05, 0);
    this.trackGroup.add(track);

    // Cart 1 (Blue)
    const c1Geo = new THREE.BoxGeometry(0.7, 0.25, 0.45);
    const c1Mat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const c1Body = new THREE.Mesh(c1Geo, c1Mat);
    c1Body.position.y = 0.2;
    c1Body.castShadow = true;
    this.cart1Group.add(c1Body);

    // Cart 2 (Amber)
    const c2Geo = new THREE.BoxGeometry(0.7, 0.25, 0.45);
    const c2Mat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.3 });
    const c2Body = new THREE.Mesh(c2Geo, c2Mat);
    c2Body.position.y = 0.2;
    c2Body.castShadow = true;
    this.cart2Group.add(c2Body);

    // Magnetic latch between carts
    const latchGeo = new THREE.BoxGeometry(0.1, 0.12, 0.2);
    const latchMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.1 });
    this.latchMesh = new THREE.Mesh(latchGeo, latchMat);
    this.latchMesh.position.set(0.35, 0.2, 0);
    this.cart1Group.add(this.latchMesh);

    this.parameters['cart1Mass'] = 4.0;
    this.parameters['cart2Mass'] = 2.0;
    this.parameters['cart1Velocity'] = 1.8;
    this.parameters['cart2Velocity'] = -1.2;
    this.parameters['collisionModel'] = 1; // 0=Elastic, 1=Inelastic, 2=Plastic

    this.resetExperiment();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-regime-comparison',
        index: 0,
        title: 'Stage 1: Three Impact Regimes in Engineering Mechanics',
        shortDescription: 'Distinguish Elastic (e = 1), Inelastic (0 < e < 1), and Perfectly Plastic (e = 0) collisions.',
        detailedExplanation:
          'In all isolated mechanical collisions, linear momentum is unconditionally conserved because ' +
          'internal action-reaction forces cancel out completely (ΣF_ext = 0). ' +
          'However, kinetic energy behavior varies drastically depending on the coefficient of restitution e: ' +
          'perfectly elastic collisions conserve all kinetic energy, while plastic collisions dissipate the maximum possible energy.',
        principles: [
          'Universal Momentum Conservation: P_initial = P_final',
          'Restitution Range: 0 ≤ e ≤ 1',
        ],
        equations: [
          '\\Delta P = 0 \\quad (\\text{Always})',
          '\\Delta E_k = 0 \\iff e = 1.0 \\quad (\\text{Only Elastic})',
        ],
        keyTerminology: [
          { term: 'Collision Regime', definition: 'Classification based on the degree of kinetic energy preservation during impact.' },
        ],
        highlightComponentIds: ['cart1', 'cart2'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0.3, 0] },
      },
      {
        id: 'stage-elastic-impact',
        index: 1,
        title: 'Stage 2: Perfectly Elastic Impact (e = 1.0)',
        shortDescription: 'No kinetic energy is lost. Separation speed equals approach speed: |v2\' - v1\'| = |v1 - v2|.',
        detailedExplanation:
          'In a perfectly elastic impact (e = 1.0), mechanical work done during the compression phase is ' +
          '100% recovered during the restitution phase with zero plastic deformation or heat loss. ' +
          'Both linear momentum and total kinetic energy are simultaneously preserved.',
        principles: [
          'Momentum: m1·v1 + m2·v2 = m1·v1\' + m2·v2\'',
          'Kinetic Energy: 0.5·m1·v1² + 0.5·m2·v2² = 0.5·m1·v1\'² + 0.5·m2·v2\'²',
        ],
        equations: [
          'e = 1.0 \\implies \\Delta E_k = 0',
        ],
        keyTerminology: [
          { term: 'Elastic Restitution', definition: 'Full reversible recovery of elastic contact forces without permanent deformation.' },
        ],
        highlightComponentIds: ['cart1', 'cart2'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0.3, 0] },
      },
      {
        id: 'stage-plastic-impact',
        index: 2,
        title: 'Stage 3: Perfectly Plastic Impact (e = 0.0) & Common Velocity',
        shortDescription: 'Bodies stick together upon contact, moving with common velocity: v_c = (m1*v1 + m2*v2)/(m1 + m2).',
        detailedExplanation:
          'When e = 0, restitution is zero. The bodies latch together upon impact and travel as a single composite mass ' +
          'of inertia (m1 + m2). By conservation of momentum: (m1 + m2)·v_{common} = m1·v1 + m2·v2. ' +
          'This regime represents the theoretical upper bound of kinetic energy dissipation in impact mechanics.',
        principles: [
          'Common Final Velocity: v_{common} = (m_1·v_1 + m_2·v_2) / (m_1 + m_2)',
          'Maximum Energy Dissipation: ΔE_{k,max} = 0.5 · [m1·m2/(m1 + m2)] · (v1 - v2)²',
        ],
        equations: [
          'v_{common} = \\frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}',
          '\\Delta E_{k,max} = \\frac{1}{2} \\frac{m_1 m_2}{m_1 + m_2} (v_1 - v_2)^2',
        ],
        keyTerminology: [
          { term: 'Plastic Latching', definition: 'Complete cohesion or locking of colliding bodies preventing separation.' },
        ],
        highlightComponentIds: ['latch', 'cart1', 'cart2'],
        recommendedCamera: { position: [0, 2.0, 3.8], target: [0, 0.3, 0] },
      },
      {
        id: 'stage-retention-meter',
        index: 3,
        title: 'Stage 4: Energy Retention Metric & Educational Summary',
        shortDescription: 'Compare kinetic energy retention ratio η_E across different mass ratios and restitution values.',
        detailedExplanation:
          'Energy retention ratio η_E = E_{k,final} / E_{k,initial} illustrates why crash attenuators, vehicle crumple zones, ' +
          'and railway buffers are deliberately engineered with low restitution (e ≈ 0) ' +
          'to dissipate catastrophic kinetic energy rather than rebounding dangerously.',
        principles: [
          'Energy Retention Ratio: η_E = E_{k,final} / E_{k,initial}',
          'Automotive Crash Design: Minimizing e to absorb impact kinetic energy',
        ],
        equations: [
          '\\eta_E = \\frac{E_{k,final}}{E_{k,initial}} \\times 100\\%',
        ],
        keyTerminology: [
          { term: 'Crumple Zone', definition: 'Sacrificial structural area designed to plastically deform with e ≈ 0.' },
        ],
        highlightComponentIds: ['cart1', 'cart2'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0.3, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.collisionRegime = 1; // Inelastic comparison
      this.v1Initial = 1.8;
      this.v2Initial = -1.2;
    } else if (stageIndex === 1) {
      this.collisionRegime = 0; // Perfectly elastic
      this.v1Initial = 1.8;
      this.v2Initial = -1.2;
    } else if (stageIndex === 2) {
      this.collisionRegime = 2; // Perfectly plastic
      this.v1Initial = 1.8;
      this.v2Initial = -1.2;
    } else if (stageIndex === 3) {
      this.collisionRegime = 1;
      this.v1Initial = 2.0;
      this.v2Initial = -1.0;
    }
    this.parameters['collisionModel'] = this.collisionRegime;
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
    if (key === 'collisionModel') {
      this.collisionRegime = Math.round(num);
    }

    this.resetExperiment();
  }

  private getRestitution(): number {
    if (this.collisionRegime === 0) return 1.0; // Elastic
    if (this.collisionRegime === 2) return 0.0; // Plastic
    return 0.6; // Inelastic
  }

  private recalculateAndRender(): void {
    const e = this.getRestitution();
    const pTotal = this.m1 * this.vel1 + this.m2 * this.vel2;
    const ke1 = 0.5 * this.m1 * (this.vel1 * this.vel1);
    const ke2 = 0.5 * this.m2 * (this.vel2 * this.vel2);
    const keTotal = ke1 + ke2;

    const initialKE = 0.5 * this.m1 * (this.v1Initial * this.v1Initial) + 0.5 * this.m2 * (this.v2Initial * this.v2Initial);
    const retentionRatio = initialKE > 0 ? (keTotal / initialKE) * 100 : 100;

    // Position carts
    this.cart1Group.position.set(this.pos1, 0.05, 0);
    this.cart2Group.position.set(this.pos2, 0.05, 0);

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    // Velocity arrows
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
          color: 0xd97706, // Amber
        })
      );
    }

    // Annotations
    const regimeNames = ['PERFECTLY ELASTIC (e = 1.0)', 'INELASTIC (e = 0.60)', 'PERFECTLY PLASTIC (e = 0.0)'];
    this.annotations.clear();
    this.annotations.add({
      id: 'regime-title',
      title: regimeNames[this.collisionRegime] || 'Unknown Regime',
      text: `Momentum: P = ${pTotal.toFixed(2)} kg·m/s (Conserved) | KE: ${keTotal.toFixed(2)} J (${retentionRatio.toFixed(1)}% Retained)`,
      worldPosition: new THREE.Vector3(0, 1.0, 0),
      type: this.collisionRegime === 0 ? 'success' : this.collisionRegime === 2 ? 'danger' : 'warning',
      category: 'Regime Comparison',
    });

    this.annotations.add({
      id: 'cart-velocities',
      title: this.hasImpacted ? 'Post-Collision Velocities' : 'Pre-Collision Approach',
      text: `v1 = ${this.vel1.toFixed(2)} m/s | v2 = ${this.vel2.toFixed(2)} m/s`,
      worldPosition: new THREE.Vector3(0, 1.4, 0),
      type: 'info',
      category: 'Kinematics',
    });

    this.inspectedComponent = {
      id: 'impact-rig',
      name: 'Impact Comparison & Conservation Rig',
      type: 'Collision Regime Benchmark System',
      description: 'System demonstrating the distinct physical conservation laws governing elastic, inelastic, and plastic collisions.',
      properties: {
        'Selected Collision Model': regimeNames[this.collisionRegime] || 'Unknown Regime',
        'Coefficient of Restitution (e)': e.toFixed(2),
        'Cart 1 Mass (m1)': `${this.m1.toFixed(1)} kg`,
        'Cart 2 Mass (m2)': `${this.m2.toFixed(1)} kg`,
        'Total Momentum (P_tot)': `${pTotal.toFixed(3)} kg·m/s`,
        'Initial Total Kinetic Energy': `${initialKE.toFixed(2)} J`,
        'Current Total Kinetic Energy': `${keTotal.toFixed(2)} J`,
        'Kinetic Energy Retention (η_E)': `${retentionRatio.toFixed(1)}%`,
        'Energy Dissipated as Heat (ΔE_k)': `${(initialKE - keTotal).toFixed(2)} J`,
        'Cart 1 Velocity': `${this.vel1.toFixed(2)} m/s`,
        'Cart 2 Velocity': `${this.vel2.toFixed(2)} m/s`,
      },
    };

    this.metrics['Collision Model'] = this.collisionRegime === 0 ? 'Elastic (e=1)' : this.collisionRegime === 1 ? 'Inelastic (e=0.6)' : 'Plastic (e=0)';
    this.metrics['Restitution e'] = e.toFixed(2);
    this.metrics['Total Momentum'] = `${pTotal.toFixed(2)} kg·m/s`;
    this.metrics['Total KE'] = `${keTotal.toFixed(2)} J`;
    this.metrics['KE Retained'] = `${retentionRatio.toFixed(1)}%`;
    this.metrics['Cart 1 Velocity'] = `${this.vel1.toFixed(2)} m/s`;
    this.metrics['Cart 2 Velocity'] = `${this.vel2.toFixed(2)} m/s`;
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying) {
      const dt = deltaSeconds * this.playbackSpeed;

      this.pos1 += this.vel1 * dt;
      this.pos2 += this.vel2 * dt;

      // Contact when pos2 - pos1 <= 0.7m (cart width)
      const cartWidth = 0.7;
      if (!this.hasImpacted && this.pos2 - this.pos1 <= cartWidth) {
        this.hasImpacted = true;
        const e = this.getRestitution();
        const u1 = this.vel1;
        const u2 = this.vel2;
        const mTotal = this.m1 + this.m2;

        if (e === 0) {
          // Perfectly plastic common velocity
          const vCommon = (this.m1 * u1 + this.m2 * u2) / mTotal;
          this.vel1 = vCommon;
          this.vel2 = vCommon;
        } else {
          // Elastic / Inelastic
          const v1Prime = ((this.m1 - e * this.m2) * u1 + (1 + e) * this.m2 * u2) / mTotal;
          const v2Prime = ((this.m2 - e * this.m1) * u2 + (1 + e) * this.m1 * u1) / mTotal;
          this.vel1 = v1Prime;
          this.vel2 = v2Prime;
        }
      }

      // Stop if leaving track limits
      if (this.pos1 < -3.8 || this.pos2 > 3.8 || this.pos1 > 3.8 || this.pos2 < -3.8) {
        this.pause();
      }

      this.recalculateAndRender();
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.pos1 = -2.4;
    this.pos2 = 2.4;
    this.vel1 = this.v1Initial;
    this.vel2 = this.v2Initial;
    this.hasImpacted = false;
    this.recalculateAndRender();
  }
}
