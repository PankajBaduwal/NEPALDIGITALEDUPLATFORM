/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 13: Wheel Friction and Rolling Resistance
 * Unit IV: Friction
 *
 * Demonstrates:
 * - Contact deformation mechanics and forward shift of normal reaction (offset b)
 * - Rolling resistance moment: M_r = N * b = W * b
 * - Minimum horizontal force for rolling: P_roll = (W * b) / R
 * - Kinematic comparison: Pure rolling (v = omega * R) vs. locked-wheel skidding (f_k = mu_k * W)
 * - Energy dissipation and mechanical efficiency of rolling versus sliding
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class RollingResistanceScene extends BaseMechanicsSimulation {
  private wheelGroup = new THREE.Group();
  private vectorGroup = new THREE.Group();
  private trackGroup = new THREE.Group();
  private contactPatchMesh!: THREE.Mesh;

  // Wheel parameters
  private wheelRadiusM = 0.6; // meters
  private wheelWidthM = 0.35;
  private wheelMassKg = 80.0;
  private loadMassKg = 250.0; // total normal load W = (m_wheel + m_load) * g
  private rollingCoeffB = 0.015; // meters (15 mm offset)
  protected _muStatic = 0.65;
  private muKinetic = 0.45;
  private isBrakedLocked = false; // Mode: Free rolling vs locked-wheel skidding

  // Dynamic state
  private wheelPosX = -2.5;
  private wheelRotAngle = 0.0;
  private wheelVelocity = 1.2; // m/s initial speed
  private trackLength = 7.0;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(12, 12);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.trackGroup);
    this.scene.add(this.wheelGroup);
    this.scene.add(this.vectorGroup);

    // Build rubber/steel test track
    const trackGeo = new THREE.BoxGeometry(this.trackLength, 0.15, 1.2);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.3,
      roughness: 0.8,
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, 0.075, 0);
    track.receiveShadow = true;
    this.trackGroup.add(track);

    // Deformed contact indentation patch
    const patchGeo = new THREE.PlaneGeometry(0.3, 0.45);
    patchGeo.rotateX(-Math.PI / 2);
    const patchMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.45 });
    this.contactPatchMesh = new THREE.Mesh(patchGeo, patchMat);
    this.contactPatchMesh.position.set(0, 0.151, 0);
    this.trackGroup.add(this.contactPatchMesh);

    // Build realistic spoked wheel
    this.buildWheel();

    this.parameters['wheelRadius'] = 0.6;
    this.parameters['loadMass'] = 250.0;
    this.parameters['rollingCoeffB'] = 15.0; // mm
    this.parameters['isLocked'] = 0; // 0 = rolling, 1 = locked skid

    this.recalculateAndRender();
  }

  private buildWheel(): void {
    while (this.wheelGroup.children.length > 0) {
      const child = this.wheelGroup.children[0] as THREE.Mesh;
      this.wheelGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    const rimGeo = new THREE.CylinderGeometry(this.wheelRadiusM, this.wheelRadiusM, this.wheelWidthM, 32, 1, true);
    rimGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark rubber
      roughness: 0.9,
      metalness: 0.1,
    });
    const tire = new THREE.Mesh(rimGeo, tireMat);
    tire.castShadow = true;
    this.wheelGroup.add(tire);

    // Inner rim
    const innerRimGeo = new THREE.CylinderGeometry(this.wheelRadiusM * 0.85, this.wheelRadiusM * 0.85, this.wheelWidthM * 0.95, 32);
    innerRimGeo.rotateZ(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const innerRim = new THREE.Mesh(innerRimGeo, rimMat);
    this.wheelGroup.add(innerRim);

    // Central hub
    const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, this.wheelWidthM * 1.1, 16);
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, rimMat);
    this.wheelGroup.add(hub);

    // 8 Radial Spokes to make rotation clearly visible
    const numSpokes = 8;
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
    for (let i = 0; i < numSpokes; i++) {
      const angle = (i * Math.PI * 2) / numSpokes;
      const spokeGeo = new THREE.CylinderGeometry(0.02, 0.02, this.wheelRadiusM * 0.8, 8);
      const spoke = new THREE.Mesh(spokeGeo, spokeMat);
      spoke.position.set(0, (Math.sin(angle) * this.wheelRadiusM * 0.4), (Math.cos(angle) * this.wheelRadiusM * 0.4));
      spoke.rotation.x = angle;
      this.wheelGroup.add(spoke);
    }
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-contact-deformation',
        index: 0,
        title: 'Stage 1: Contact Deformation & Forward Offset b',
        shortDescription: 'Tire and pavement deformation causes normal contact pressure to shift forward by distance b.',
        detailedExplanation:
          'Unlike idealized rigid line contact, real physical wheels deform elastically against the roadway. ' +
          'As the wheel rolls forward, material ahead of the axle is compressed while material behind relaxes. ' +
          'Due to viscoelastic hysteresis, the resultant normal contact force N shifts forward in the direction of motion by offset b.',
        principles: [
          'Deformable Contact Footprint',
          'Forward Shift of Normal Reaction: x_N = +b ahead of wheel center',
        ],
        equations: [
          'N = W = (m_{wheel} + m_{load}) \\cdot g',
          'M_r = N \\cdot b',
        ],
        keyTerminology: [
          { term: 'Coefficient of Rolling Resistance (b)', definition: 'The physical forward offset distance of the normal contact resultant, measured in mm.' },
          { term: 'Hysteresis Loss', definition: 'Energy lost as heat during loading and unloading cycles of tire rubber and ground.' },
        ],
        highlightComponentIds: ['tire', 'contact-patch'],
        recommendedCamera: { position: [0.0, 1.2, 2.5], target: [0, 0.6, 0] },
      },
      {
        id: 'stage-rolling-moment',
        index: 1,
        title: 'Stage 2: Rolling Resistance Resisting Moment M_r',
        shortDescription: 'The offset reaction creates a counter-clockwise resisting moment M_r = W · b retarding forward motion.',
        detailedExplanation:
          'Taking moments about the center of the wheel, the forward-offset normal force exerts a resisting torque ' +
          'M_r = N · b. To maintain rolling at steady speed, an external tractive force P applied at the axle must satisfy: ' +
          'P · R = M_r ⇒ P_{roll} = (W · b) / R.',
        principles: [
          'Resisting Moment: M_r = W · b',
          'Tractive Force Required: P_{roll} = (W · b) / R',
        ],
        equations: [
          'P_{roll} = \\frac{W \\cdot b}{R}',
        ],
        keyTerminology: [
          { term: 'Rolling Resistance Ratio (b/R)', definition: 'Dimensionless resistance factor, typically 0.01 to 0.02 for pneumatic tires.' },
        ],
        highlightComponentIds: ['wheel', 'normal-arrow'],
        recommendedCamera: { position: [0.5, 1.4, 2.8], target: [0, 0.6, 0] },
      },
      {
        id: 'stage-rolling-vs-sliding',
        index: 2,
        title: 'Stage 3: Rolling Resistance vs. Sliding Friction Comparison',
        shortDescription: 'Rolling resistance is typically 10 to 50 times smaller than sliding friction: (b/R) << mu_k.',
        detailedExplanation:
          'Consider a 330 kg wheel-load: sliding friction requires P_{slide} = μ_k · W ≈ 0.45 · 3237 N = 1456 N! ' +
          'In contrast, rolling with b = 15 mm on radius R = 600 mm requires only P_{roll} = (15 / 600) · 3237 N = 81 N! ' +
          'This profound order-of-magnitude reduction in resisting effort explains why wheeled transport revolutionized human engineering.',
        principles: [
          'Sliding Resistance: P_{slide} = μ_k · W',
          'Rolling Resistance: P_{roll} = (b/R) · W',
          'Transportation Advantage: P_{slide} / P_{roll} ≈ μ_k / (b/R) ≈ 20 to 50',
        ],
        equations: [
          '\\frac{P_{slide}}{P_{roll}} = \\frac{\\mu_k \\cdot R}{b}',
        ],
        keyTerminology: [
          { term: 'Mechanical Efficiency Ratio', definition: 'The factor by which rolling minimizes frictional energy dissipation relative to dragging.' },
        ],
        highlightComponentIds: ['wheel', 'track'],
        recommendedCamera: { position: [1.2, 1.6, 3.2], target: [0, 0.6, 0] },
      },
      {
        id: 'stage-skidding-skid',
        index: 3,
        title: 'Stage 4: Locked-Wheel Skidding & Braking Dissipation',
        shortDescription: 'When brakes lock the wheel, rotation halts (omega = 0) and high kinetic friction rapidly halts the vehicle.',
        detailedExplanation:
          'If the brakes freeze the wheel hub, rolling ceases. The contact patch slides violently against the track. ' +
          'The resistance force instantly jumps from P_{roll} (81 N) to kinetic friction f_k = μ_k · W (1456 N), ' +
          'generating intense deceleration a = -μ_k · g and flat-spot tire wear.',
        principles: [
          'Locked-Wheel Condition: ω = 0, v > 0',
          'Skidding Friction: F_{skid} = μ_k · W',
          'Deceleration: a_{skid} = -μ_k · g',
        ],
        equations: [
          'a_{skid} = -\\mu_k \\cdot g',
        ],
        keyTerminology: [
          { term: 'Skidding', definition: 'Translational motion without wheel rotation, governed entirely by Coulomb kinetic friction.' },
          { term: 'Flat-Spotting', definition: 'Localized abrasion damage on a tire tread caused by locked-wheel skidding.' },
        ],
        highlightComponentIds: ['wheel', 'contact-patch'],
        recommendedCamera: { position: [0.8, 1.4, 2.6], target: [0, 0.6, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.rollingCoeffB = 0.015;
      this.isBrakedLocked = false;
    } else if (stageIndex === 1) {
      this.rollingCoeffB = 0.025;
      this.isBrakedLocked = false;
    } else if (stageIndex === 2) {
      this.rollingCoeffB = 0.015;
      this.isBrakedLocked = false;
    } else if (stageIndex === 3) {
      this.rollingCoeffB = 0.015;
      this.isBrakedLocked = true;
    }
    this.parameters['rollingCoeffB'] = this.rollingCoeffB * 1000.0;
    this.parameters['isLocked'] = this.isBrakedLocked ? 1 : 0;
    this.wheelVelocity = 1.2;
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'wheelRadius') {
      this.wheelRadiusM = Math.max(0.2, Math.min(1.0, num));
      this.buildWheel();
    }
    if (key === 'loadMass') this.loadMassKg = Math.max(50, num);
    if (key === 'rollingCoeffB') this.rollingCoeffB = Math.max(1, num) / 1000.0;
    if (key === 'isLocked') this.isBrakedLocked = num > 0.5 || value === true;

    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    const g = 9.81;
    const totalMass = this.wheelMassKg + this.loadMassKg;
    const W = totalMass * g;
    const N = W;

    // Rolling resistance calculations
    const M_r = N * this.rollingCoeffB;
    const pRoll = M_r / this.wheelRadiusM;
    const pSlide = this.muKinetic * W;

    const resistanceForce = this.isBrakedLocked ? pSlide : pRoll;
    const decel = resistanceForce / totalMass;

    // Position wheel in 3D
    const wheelCenterY = 0.15 + this.wheelRadiusM;
    this.wheelGroup.position.set(this.wheelPosX, wheelCenterY, 0);
    this.wheelGroup.rotation.x = this.wheelRotAngle;

    // Contact patch follows wheel with forward offset b
    this.contactPatchMesh.position.x = this.wheelPosX + this.rollingCoeffB;

    // Redraw vector arrows
    this.vectorGroup.clear();

    const contactPoint = new THREE.Vector3(this.wheelPosX, 0.15, 0);
    const shiftedNormalPoint = new THREE.Vector3(this.wheelPosX + this.rollingCoeffB, 0.15, 0);

    // 1. Shifted Normal Reaction N (Upward, offset by b)
    const nLen = Math.min(1.8, Math.max(0.5, (N / 4000) * 1.5));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: shiftedNormalPoint,
        direction: new THREE.Vector3(0, 1, 0),
        length: nLen,
        color: 0x16a34a, // Green
        shaftRadius: 0.025,
        headRadius: 0.06,
      })
    );

    // 2. Weight Force W (Downward from axle center)
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: new THREE.Vector3(this.wheelPosX, wheelCenterY, 0),
        direction: new THREE.Vector3(0, -1, 0),
        length: nLen,
        color: 0x2563eb, // Blue
        shaftRadius: 0.025,
        headRadius: 0.06,
      })
    );

    // 3. Resisting Retarding Force at contact (Left: -X)
    const fResLen = Math.min(1.8, Math.max(0.3, (resistanceForce / 1500) * 1.5));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: contactPoint,
        direction: new THREE.Vector3(-1, 0, 0),
        length: fResLen,
        color: 0xd97706, // Amber
        shaftRadius: 0.025,
        headRadius: 0.06,
      })
    );

    // Annotations
    this.annotations.clear();
    this.annotations.add({
      id: 'wheel-state',
      title: this.isBrakedLocked ? 'LOCKED-WHEEL SKIDDING' : 'FREE ROLLING WITH RESISTANCE',
      text: this.isBrakedLocked
        ? `Kinetic Drag: ${pSlide.toFixed(0)} N | a = -${decel.toFixed(2)} m/s²`
        : `Rolling Drag: ${pRoll.toFixed(1)} N | a = -${decel.toFixed(2)} m/s²`,
      worldPosition: new THREE.Vector3(this.wheelPosX, wheelCenterY + 0.6, 0),
      type: this.isBrakedLocked ? 'danger' : 'success',
      category: 'Regime',
    });

    this.annotations.add({
      id: 'offset-b',
      title: `Reaction Shift: b = ${(this.rollingCoeffB * 1000).toFixed(1)} mm`,
      text: `Resisting Moment M_r = ${M_r.toFixed(1)} N·m`,
      worldPosition: new THREE.Vector3(this.wheelPosX + 0.35, 0.45, 0.3),
      type: 'info',
      category: 'Mechanics',
    });

    this.inspectedComponent = {
      id: 'wheel-assembly',
      name: 'Deformable Wheel & Contact Patch',
      type: 'Rolling Mechanical Element',
      description: 'Cylindrical wheel experiencing rolling resistance caused by asymmetric contact pressure.',
      properties: {
        'Wheel Radius (R)': `${(this.wheelRadiusM * 1000).toFixed(0)} mm`,
        'Total Mass (m)': `${totalMass.toFixed(0)} kg`,
        'Normal Load (W = mg)': `${W.toFixed(0)} N`,
        'Rolling Resistance Coeff (b)': `${(this.rollingCoeffB * 1000).toFixed(1)} mm`,
        'Resisting Moment (M_r = W·b)': `${M_r.toFixed(1)} N·m`,
        'Tractive Force to Roll (P_roll)': `${pRoll.toFixed(1)} N`,
        'Sliding Friction Force (P_slide)': `${pSlide.toFixed(1)} N`,
        'Advantage of Rolling vs. Sliding': `${(pSlide / pRoll).toFixed(1)}x less resistance`,
        'Current Regime': this.isBrakedLocked ? 'Skidding (Wheel Locked)' : 'Pure Rolling',
      },
    };

    this.metrics['Total Load W'] = `${W.toFixed(0)} N`;
    this.metrics['Offset b'] = `${(this.rollingCoeffB * 1000).toFixed(1)} mm`;
    this.metrics['Resisting Moment'] = `${M_r.toFixed(1)} N·m`;
    this.metrics['Rolling Drag'] = `${pRoll.toFixed(1)} N`;
    this.metrics['Regime'] = this.isBrakedLocked ? 'Locked Skidding' : 'Rolling';
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying && this.wheelVelocity > 0.02) {
      const g = 9.81;
      const totalMass = this.wheelMassKg + this.loadMassKg;
      const W = totalMass * g;
      const M_r = W * this.rollingCoeffB;
      const pRoll = M_r / this.wheelRadiusM;
      const pSlide = this.muKinetic * W;
      const resistanceForce = this.isBrakedLocked ? pSlide : pRoll;
      const decel = resistanceForce / totalMass;

      this.wheelVelocity -= decel * deltaSeconds * this.playbackSpeed;
      if (this.wheelVelocity < 0) this.wheelVelocity = 0;

      const dx = this.wheelVelocity * deltaSeconds * this.playbackSpeed;
      this.wheelPosX += dx;

      if (!this.isBrakedLocked) {
        // Pure rolling relation: dtheta = dx / R
        this.wheelRotAngle += dx / this.wheelRadiusM;
      }

      if (this.wheelPosX > 2.8) {
        this.wheelPosX = -2.8;
      }

      this.recalculateAndRender();
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.wheelPosX = -2.5;
    this.wheelRotAngle = 0.0;
    this.wheelVelocity = 1.2;
    this.recalculateAndRender();
  }
}
