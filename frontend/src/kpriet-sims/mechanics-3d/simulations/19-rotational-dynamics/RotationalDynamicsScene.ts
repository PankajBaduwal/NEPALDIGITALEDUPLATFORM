/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 19: Rotational Motion of Rigid Bodies
 * Unit V: Dynamics of Particles and Rigid Bodies
 *
 * Demonstrates:
 * - Fixed-axis rotational dynamics: Στ = I · α
 * - Mass moment of inertia for distinct geometries:
 *   Solid Disc: I = 0.5 * M * R^2
 *   Thin Ring / Rim: I = M * R^2
 *   Hollow Cylinder: I = 0.5 * M * (R1^2 + R2^2)
 * - Angular kinematics: ω(t) = ω0 + α*t, θ(t) = θ0 + ω0*t + 0.5*α*t^2
 * - Rotational kinetic energy: T_rot = 0.5 * I * ω^2
 * - Torque-work equivalence: W = ∫ τ dθ = Δ(0.5 * I * ω^2)
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class RotationalDynamicsScene extends BaseMechanicsSimulation {
  private rotorGroup = new THREE.Group();
  private standGroup = new THREE.Group();
  private vectorGroup = new THREE.Group();
  private flywheelMesh!: THREE.Mesh;

  // Physical parameters
  private rotorMassKg = 25.0; // kg
  private rotorRadiusM = 0.6; // meters
  private appliedTorqueNm = 12.0; // N·m
  private dampingCoeff = 0.4; // N·m·s/rad
  private rotorType = 0; // 0 = Solid Disc (0.5 MR^2), 1 = Thin Ring (MR^2)

  // Dynamic state
  private angleTheta = 0.0; // rad
  private angularVelOmega = 0.0; // rad/s

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(10, 10);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.standGroup);
    this.scene.add(this.rotorGroup);
    this.scene.add(this.vectorGroup);

    // Build Bearing Mount Pedestals
    const pedGeo = new THREE.BoxGeometry(0.3, 1.6, 0.4);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });

    const leftPed = new THREE.Mesh(pedGeo, pedMat);
    leftPed.position.set(0, 0.8, -0.45);
    leftPed.castShadow = true;
    this.standGroup.add(leftPed);

    const rightPed = new THREE.Mesh(pedGeo, pedMat);
    rightPed.position.set(0, 0.8, 0.45);
    rightPed.castShadow = true;
    this.standGroup.add(rightPed);

    // Central Axle Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 16);
    shaftGeo.rotateX(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.set(0, 1.5, 0);
    this.standGroup.add(shaft);

    this.rotorGroup.position.set(0, 1.5, 0);

    // Build Flywheel Rotor
    this.buildFlywheel();

    this.parameters['rotorMass'] = 25.0;
    this.parameters['rotorRadius'] = 0.6;
    this.parameters['appliedTorque'] = 12.0;
    this.parameters['rotorGeometry'] = 0; // 0 = Solid Disc, 1 = Hollow Ring

    this.recalculateAndRender();
  }

  private buildFlywheel(): void {
    while (this.rotorGroup.children.length > 0) {
      const child = this.rotorGroup.children[0] as THREE.Mesh;
      this.rotorGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    const rimWidth = 0.2;
    if (this.rotorType === 0) {
      // Solid Disc
      const discGeo = new THREE.CylinderGeometry(this.rotorRadiusM, this.rotorRadiusM, rimWidth, 32);
      discGeo.rotateX(Math.PI / 2);
      const discMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
      this.flywheelMesh = new THREE.Mesh(discGeo, discMat);
      this.flywheelMesh.castShadow = true;
      this.rotorGroup.add(this.flywheelMesh);
    } else {
      // Hollow Ring / Rim with 6 Spokes
      const ringGeo = new THREE.CylinderGeometry(this.rotorRadiusM, this.rotorRadiusM, rimWidth, 32, 1, true);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
      this.flywheelMesh = new THREE.Mesh(ringGeo, ringMat);
      this.flywheelMesh.castShadow = true;
      this.rotorGroup.add(this.flywheelMesh);

      // Radial spokes
      const spokeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const spokeGeo = new THREE.CylinderGeometry(0.025, 0.025, this.rotorRadiusM * 0.95, 8);
        const spoke = new THREE.Mesh(spokeGeo, spokeMat);
        spoke.position.set(Math.sin(ang) * this.rotorRadiusM * 0.47, Math.cos(ang) * this.rotorRadiusM * 0.47, 0);
        spoke.rotation.z = -ang;
        this.rotorGroup.add(spoke);
      }
    }

    // High-visibility alignment dot/bar on rim
    const dotGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const dotMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(0, this.rotorRadiusM * 0.85, rimWidth / 2 + 0.02);
    this.rotorGroup.add(dot);
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-fixed-axis-torque',
        index: 0,
        title: 'Stage 1: Fixed-Axis Rotational Governing Equation (Στ = I · α)',
        shortDescription: 'Angular acceleration α is proportional to net torque and inversely proportional to moment of inertia I.',
        detailedExplanation:
          'Fixed-axis rotational dynamics is the rotational analogue of Newton\'s second law (F = m · a). ' +
          'Net torque acting about the axis of rotation produces angular acceleration α = dω/dt according to Στ = I · α. ' +
          'Here I represents the mass moment of inertia, measuring resistance to angular acceleration.',
        principles: [
          'Rotational Second Law: Στ = I · α',
          'Angular Acceleration: α = d²θ/dt² = dω/dt',
        ],
        equations: [
          '\\sum \\tau = I \\cdot \\alpha',
          '\\alpha = \\frac{\\tau_{net}}{I}',
        ],
        keyTerminology: [
          { term: 'Torque (τ)', definition: 'Rotational moment causing angular acceleration (N·m).' },
          { term: 'Mass Moment of Inertia (I)', definition: 'Second moment of mass measuring rotational inertia (kg·m²).' },
        ],
        highlightComponentIds: ['flywheel', 'shaft'],
        recommendedCamera: { position: [2.2, 2.2, 3.2], target: [0, 1.5, 0] },
      },
      {
        id: 'stage-inertia-geometry',
        index: 1,
        title: 'Stage 2: Geometry Influence on Mass Moment of Inertia',
        shortDescription: 'Solid disc: I = 0.5*M*R^2. Thin ring (all mass at perimeter): I = M*R^2 (double the inertia!).',
        detailedExplanation:
          'Because moment of inertia depends on the square of distance from axis (I = ∫ r² dm), ' +
          'mass concentrated at the outer rim contributes far more inertia than mass near the center. ' +
          'A hollow ring with all mass at radius R has exactly TWICE the moment of inertia of a solid disc ' +
          'of the identical mass and outer radius! Consequently, the solid disc accelerates twice as fast under equal torque.',
        principles: [
          'Solid Disc Inertia: I_{disc} = 0.5 · M · R²',
          'Thin Ring Inertia: I_{ring} = M · R²',
          'Acceleration Ratio: α_{disc} / α_{ring} = 2.0',
        ],
        equations: [
          'I_{disc} = \\frac{1}{2} M R^2',
          'I_{ring} = M R^2',
        ],
        keyTerminology: [
          { term: 'Flywheel Effect', definition: 'Using a heavy outer rim to maximize moment of inertia for kinetic energy storage.' },
        ],
        highlightComponentIds: ['flywheel'],
        recommendedCamera: { position: [1.8, 2.0, 2.8], target: [0, 1.5, 0] },
      },
      {
        id: 'stage-angular-kinematics',
        index: 2,
        title: 'Stage 3: Angular Kinematics and RPM Conversion',
        shortDescription: 'Angular velocity ω(t) = ω0 + α*t. Rotational speed in RPM = ω * 60 / (2π).',
        detailedExplanation:
          'Under constant torque, angular velocity grows linearly: ω(t) = ω_0 + α·t. ' +
          'Angular displacement in radians is θ(t) = ω_0·t + (1/2)·α·t². ' +
          'In engineering practice, rotational velocity is commonly specified in revolutions per minute (RPM): ' +
          'N = (60 · ω) / (2π).',
        principles: [
          'Angular Velocity: ω = dθ/dt (rad/s)',
          'Angular Position: θ = θ_0 + ω_0 · t + 0.5 · α · t²',
          'RPM Conversion: N = (60 / 2π) · ω ≈ 9.549 · ω',
        ],
        equations: [
          '\\omega(t) = \\omega_0 + \\alpha t',
          'N = \\frac{60 \\omega}{2\\pi}',
        ],
        keyTerminology: [
          { term: 'Radian per Second (rad/s)', definition: 'Standard SI unit of angular velocity.' },
          { term: 'Revolutions per Minute (RPM)', definition: 'Common mechanical engineering rotational speed unit.' },
        ],
        highlightComponentIds: ['flywheel', 'rotor-dot'],
        recommendedCamera: { position: [2.2, 2.0, 3.0], target: [0, 1.5, 0] },
      },
      {
        id: 'stage-rotational-energy',
        index: 3,
        title: 'Stage 4: Rotational Kinetic Energy and Torque Work',
        shortDescription: 'Rotational kinetic energy T_rot = 0.5 * I * ω^2 equals work done by driving torque W = τ * Δθ.',
        detailedExplanation:
          'Work done by the torque over angular displacement Δθ is W = τ · Δθ. ' +
          'By the work-energy theorem for rotation, this work converts directly into rotational kinetic energy: ' +
          'W = (1/2)·I·ω² - (1/2)·I·ω_0². Flywheels in automotive engines and power grids store energy precisely via this principle.',
        principles: [
          'Rotational Kinetic Energy: T_{rot} = 0.5 · I · ω²',
          'Torque Work: W_τ = τ · Δθ',
        ],
        equations: [
          'T_{rot} = \\frac{1}{2} I \\omega^2',
          'W = \\tau \\cdot \\Delta\\theta = \\Delta T_{rot}',
        ],
        keyTerminology: [
          { term: 'Flywheel Energy Storage', definition: 'Mechanical battery storing energy in the form of rotational kinetic energy.' },
        ],
        highlightComponentIds: ['flywheel'],
        recommendedCamera: { position: [2.0, 2.2, 3.2], target: [0, 1.5, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.rotorType = 0; // Solid Disc
      this.appliedTorqueNm = 12.0;
      this.rotorMassKg = 25.0;
      this.buildFlywheel();
    } else if (stageIndex === 1) {
      this.rotorType = 1; // Hollow Ring (Double inertia!)
      this.appliedTorqueNm = 12.0;
      this.rotorMassKg = 25.0;
      this.buildFlywheel();
    } else if (stageIndex === 2) {
      this.rotorType = 0;
      this.appliedTorqueNm = 18.0;
      this.buildFlywheel();
    } else if (stageIndex === 3) {
      this.rotorType = 0;
      this.appliedTorqueNm = 24.0;
      this.buildFlywheel();
    }
    this.parameters['rotorGeometry'] = this.rotorType;
    this.parameters['appliedTorque'] = this.appliedTorqueNm;
    this.parameters['rotorMass'] = this.rotorMassKg;
    this.angleTheta = 0.0;
    this.angularVelOmega = 0.0;
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'rotorMass') this.rotorMassKg = Math.max(2.0, num);
    if (key === 'rotorRadius') {
      this.rotorRadiusM = Math.max(0.2, Math.min(1.0, num));
      this.buildFlywheel();
    }
    if (key === 'appliedTorque') this.appliedTorqueNm = num;
    if (key === 'rotorGeometry') {
      this.rotorType = num > 0.5 ? 1 : 0;
      this.buildFlywheel();
    }

    this.recalculateAndRender();
  }

  private calculateInertia(): number {
    const M = this.rotorMassKg;
    const R = this.rotorRadiusM;
    return this.rotorType === 0 ? 0.5 * M * R * R : M * R * R;
  }

  private recalculateAndRender(): void {
    const I = this.calculateInertia();
    const netTorque = this.appliedTorqueNm - this.dampingCoeff * this.angularVelOmega;
    const alpha = netTorque / I;
    const rpm = (this.angularVelOmega * 60) / (2 * Math.PI);
    const keRot = 0.5 * I * (this.angularVelOmega * this.angularVelOmega);

    // Apply rotation angle to 3D rotor group
    this.rotorGroup.rotation.z = this.angleTheta;

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    // 1. Angular Velocity Vector along axle axis (Z-axis)
    if (Math.abs(this.angularVelOmega) > 0.1) {
      const wLen = Math.min(1.8, Math.max(0.4, (Math.abs(this.angularVelOmega) / 10) * 1.5));
      this.vectorGroup.add(
        VectorRenderer.createArrow({
          origin: new THREE.Vector3(0, 1.5, 0.6),
          direction: new THREE.Vector3(0, 0, Math.sign(this.angularVelOmega)),
          length: wLen,
          color: 0x2563eb, // Blue
          shaftRadius: 0.025,
          headRadius: 0.06,
        })
      );
    }

    // 2. Applied Torque Vector
    if (Math.abs(this.appliedTorqueNm) > 0.1) {
      const tLen = Math.min(1.8, Math.max(0.4, (Math.abs(this.appliedTorqueNm) / 20) * 1.5));
      this.vectorGroup.add(
        VectorRenderer.createArrow({
          origin: new THREE.Vector3(0, 1.5, -0.6),
          direction: new THREE.Vector3(0, 0, Math.sign(this.appliedTorqueNm)),
          length: tLen,
          color: 0xef4444, // Red
          shaftRadius: 0.025,
          headRadius: 0.06,
        })
      );
    }

    // Annotations
    this.annotations.clear();
    this.annotations.add({
      id: 'rotor-kinematics',
      title: `Angular Velocity: ${this.angularVelOmega.toFixed(2)} rad/s (${rpm.toFixed(0)} RPM)`,
      text: `Inertia I = ${I.toFixed(3)} kg·m² | α = ${alpha.toFixed(2)} rad/s² | KE = ${keRot.toFixed(1)} J`,
      worldPosition: new THREE.Vector3(0, 2.5, 0),
      type: 'info',
      category: 'Rotational Kinetics',
    });

    this.annotations.add({
      id: 'rotor-torque',
      title: `Torque τ = ${this.appliedTorqueNm.toFixed(1)} N·m`,
      text: `Damping: ${(this.dampingCoeff * this.angularVelOmega).toFixed(1)} N·m | Net τ = ${netTorque.toFixed(1)} N·m`,
      worldPosition: new THREE.Vector3(this.rotorRadiusM + 0.3, 1.5, 0),
      type: 'success',
      category: 'Applied Effort',
    });

    this.inspectedComponent = {
      id: 'flywheel-rotor',
      name: 'Fixed-Axis Rotational Flywheel',
      type: 'Rigid Body in Planar Rotation',
      description: 'Symmetric rotor governed by Euler\'s fixed-axis rotational dynamic equation.',
      properties: {
        'Rotor Geometry': this.rotorType === 0 ? 'Solid Disc (I = 0.5 MR²)' : 'Hollow Ring (I = MR²)',
        'Rotor Mass (M)': `${this.rotorMassKg.toFixed(1)} kg`,
        'Rotor Radius (R)': `${(this.rotorRadiusM * 1000).toFixed(0)} mm`,
        'Mass Moment of Inertia (I)': `${I.toFixed(4)} kg·m²`,
        'Applied Driving Torque (τ)': `${this.appliedTorqueNm.toFixed(1)} N·m`,
        'Angular Acceleration (α)': `${alpha.toFixed(2)} rad/s²`,
        'Angular Velocity (ω)': `${this.angularVelOmega.toFixed(2)} rad/s`,
        'Rotational Speed (RPM)': `${rpm.toFixed(1)} RPM`,
        'Rotational Kinetic Energy': `${keRot.toFixed(1)} J`,
      },
    };

    this.metrics['Geometry'] = this.rotorType === 0 ? 'Solid Disc' : 'Hollow Ring';
    this.metrics['Inertia I'] = `${I.toFixed(4)} kg·m²`;
    this.metrics['Torque τ'] = `${this.appliedTorqueNm.toFixed(1)} N·m`;
    this.metrics['Angular Accel α'] = `${alpha.toFixed(2)} rad/s²`;
    this.metrics['Angular Vel ω'] = `${this.angularVelOmega.toFixed(2)} rad/s`;
    this.metrics['Rotational RPM'] = `${rpm.toFixed(0)} RPM`;
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying) {
      const dt = deltaSeconds * this.playbackSpeed;
      const I = this.calculateInertia();
      const netTorque = this.appliedTorqueNm - this.dampingCoeff * this.angularVelOmega;
      const alpha = netTorque / I;

      this.angularVelOmega += alpha * dt;
      this.angleTheta += this.angularVelOmega * dt;

      this.recalculateAndRender();
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.angleTheta = 0.0;
    this.angularVelOmega = 0.0;
    this.recalculateAndRender();
  }
}
