/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 15: Curvilinear and Projectile Motion
 * Unit V: Dynamics of Particles and Rigid Bodies
 *
 * Demonstrates:
 * - 2D/3D projectile motion under gravitational field: x(t) = v0*cos(theta)*t, y(t) = h0 + v0*sin(theta)*t - 0.5*g*t^2
 * - Velocity vector tangent to path: v = (vx, vy), speed |v| = sqrt(vx^2 + vy^2)
 * - Curvilinear motion components: Tangential acceleration a_t and normal acceleration a_n = v^2 / rho
 * - Trajectory apex (maximum elevation) and total flight range R
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class ProjectileMotionScene extends BaseMechanicsSimulation {
  private cannonGroup = new THREE.Group();
  private projectileMesh!: THREE.Mesh;
  private trajectoryLine!: THREE.Line;
  private vectorGroup = new THREE.Group();
  private barrelMesh!: THREE.Mesh;

  // Projectile Parameters
  private v0 = 12.0; // initial speed (m/s)
  private launchAngleDeg = 45.0; // degrees
  private h0 = 1.0; // initial launch height (m)
  private g = 9.81; // m/s^2

  // Animation Time State
  private simTime = 0.0;
  private flightTime = 0.0;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(16, 16);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.cannonGroup);
    this.scene.add(this.vectorGroup);

    // Build Launch Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(0.35, 0.45, this.h0, 16);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedMat);
    pedestal.position.set(-5.0, this.h0 / 2, 0);
    this.cannonGroup.add(pedestal);

    // Pivot mount
    const pivotGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const pivot = new THREE.Mesh(pivotGeo, pivotMat);
    pivot.position.set(-5.0, this.h0, 0);
    this.cannonGroup.add(pivot);

    // Cannon Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.9, 16);
    barrelGeo.rotateZ(Math.PI / 2);
    barrelGeo.translate(0.45, 0, 0);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    this.barrelMesh = new THREE.Mesh(barrelGeo, barrelMat);
    this.barrelMesh.position.set(-5.0, this.h0, 0);
    this.barrelMesh.castShadow = true;
    this.cannonGroup.add(this.barrelMesh);

    // Projectile Sphere
    const projGeo = new THREE.SphereGeometry(0.14, 24, 24);
    const projMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red
      metalness: 0.8,
      roughness: 0.2,
    });
    this.projectileMesh = new THREE.Mesh(projGeo, projMat);
    this.projectileMesh.castShadow = true;
    this.scene.add(this.projectileMesh);

    // Trajectory Path Line
    const lineMat = new THREE.LineDashedMaterial({ color: 0x0284c7, dashSize: 0.15, gapSize: 0.08 });
    const lineGeo = new THREE.BufferGeometry();
    this.trajectoryLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(this.trajectoryLine);

    this.parameters['initialVelocity'] = 12.0;
    this.parameters['launchAngle'] = 45.0;
    this.parameters['initialHeight'] = 1.0;

    this.recalculateTrajectoryCurve();
    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-projectile-equations',
        index: 0,
        title: 'Stage 1: Orthogonal Independence of Motion',
        shortDescription: 'Horizontal motion is uniform (a_x = 0), while vertical motion experiences constant gravity (a_y = -g).',
        detailedExplanation:
          'Galileo proved that horizontal and vertical motions are completely independent. ' +
          'In the horizontal direction, zero net force produces constant velocity: v_x = v_0 · cos θ. ' +
          'In the vertical direction, gravity produces constant downward acceleration: v_y(t) = v_0 · sin θ - g·t. ' +
          'Combining these yields the famous parabolic trajectory.',
        principles: [
          'Horizontal Velocity: v_x = v_0 · cos(θ)',
          'Vertical Position: y(t) = h_0 + v_0 · sin(θ) · t - 0.5 · g · t²',
          'Trajectory Equation: y(x) = h_0 + x · tan(θ) - [g / (2 v_0² cos²θ)] · x²',
        ],
        equations: [
          'x(t) = v_0 \\cos\\theta \\cdot t',
          'y(t) = h_0 + v_0 \\sin\\theta \\cdot t - \\frac{1}{2} g t^2',
        ],
        keyTerminology: [
          { term: 'Orthogonal Independence', definition: 'The physical principle that perpendicular vector components do not affect each other.' },
          { term: 'Trajectory Parabola', definition: 'The planar curved path traced by a projectile under uniform gravity.' },
        ],
        highlightComponentIds: ['barrel', 'projectile'],
        recommendedCamera: { position: [0, 4.0, 9.0], target: [0, 2.0, 0] },
      },
      {
        id: 'stage-apex-and-range',
        index: 1,
        title: 'Stage 2: Trajectory Apex & Maximum Horizontal Range',
        shortDescription: 'At the apex, v_y = 0 at time t_apex = v0*sin(θ)/g. Total range R = vx * t_flight.',
        detailedExplanation:
          'At the highest point (apex), the vertical velocity momentarily vanishes (v_y = 0). ' +
          'The maximum elevation reached is H_{max} = h_0 + (v_0² sin²θ) / (2g). ' +
          'When landing on ground level (y = 0), the total flight time t_f is the positive root of the quadratic equation. ' +
          'For launch from ground (h_0 = 0), maximum range occurs at θ = 45° with R_{max} = v_0² / g.',
        principles: [
          'Apex Time: t_{apex} = (v_0 · sin θ) / g',
          'Maximum Height: H_{max} = h_0 + (v_0² · sin²θ) / (2g)',
          'Flight Time: t_f = [v_0 sin θ + sqrt(v_0² sin²θ + 2 g h_0)] / g',
        ],
        equations: [
          'H_{max} = h_0 + \\frac{v_0^2 \\sin^2\\theta}{2g}',
          'R = v_0 \\cos\\theta \\cdot t_f',
        ],
        keyTerminology: [
          { term: 'Apex (Vertex)', definition: 'The highest vertical point on the parabolic path where vertical velocity is zero.' },
          { term: 'Horizontal Range (R)', definition: 'The total horizontal displacement from launch point to ground impact.' },
        ],
        highlightComponentIds: ['projectile'],
        recommendedCamera: { position: [1.0, 3.5, 8.5], target: [1.0, 2.0, 0] },
      },
      {
        id: 'stage-tangential-normal-accel',
        index: 2,
        title: 'Stage 3: Tangential & Normal Acceleration Components',
        shortDescription: 'Total acceleration g resolves into tangential a_t (rate of speed change) and normal a_n = v^2 / rho (curvature).',
        detailedExplanation:
          'In curvilinear kinematics (Anna University Unit V), total acceleration resolves along moving intrinsic coordinates: ' +
          'tangential unit vector e_t (along velocity) and normal unit vector e_n (toward center of curvature). ' +
          'Tangential acceleration a_t = -g · (v_y / v) causes speed to change. ' +
          'Normal acceleration a_n = g · (v_x / v) causes direction to bend, where instantaneous radius of curvature ρ = v² / a_n.',
        principles: [
          'Total Acceleration: a = a_t · e_t + a_n · e_n',
          'Tangential Acceleration: a_t = dv/dt = -g · (v_y / v)',
          'Normal Acceleration: a_n = v² / ρ = g · (v_x / v)',
          'Radius of Curvature: ρ = v³ / (g · v_x)',
        ],
        equations: [
          'a_t = -g \\frac{v_y}{v}',
          'a_n = \\frac{v^2}{\\rho} = g \\frac{v_x}{v}',
          '\\rho = \\frac{v^3}{g v_x}',
        ],
        keyTerminology: [
          { term: 'Normal Acceleration (a_n)', definition: 'Component of acceleration perpendicular to path causing change in velocity direction.' },
          { term: 'Radius of Curvature (ρ)', definition: 'Radius of the osculating circle fitting the curve at that point.' },
        ],
        highlightComponentIds: ['projectile', 'vel-arrow'],
        recommendedCamera: { position: [0.5, 2.8, 6.0], target: [0, 1.8, 0] },
      },
      {
        id: 'stage-flight-scrubbing',
        index: 3,
        title: 'Stage 4: Playback, Time Scrubbing & Angle Comparison',
        shortDescription: 'Adjust launch angle from 15° to 75° to see complementary angle ranges and apex variations.',
        detailedExplanation:
          'From ground level (h_0 = 0), complementary launch angles (e.g., 30° and 60°) achieve the identical horizontal range R, ' +
          'because sin(2 · 30°) = sin(2 · 60°) = sin(60°) = 0.866. ' +
          'However, the steeper 60° trajectory achieves higher apex altitude and longer hang time!',
        principles: [
          'Complementary Angle Theorem: R(θ) = R(90° - θ)  (when h_0 = 0)',
          'Hang Time varies as sin(θ)',
        ],
        equations: [
          'R(\\theta) = \\frac{v_0^2 \\sin(2\\theta)}{g} = R(90^\\circ - \\theta)',
        ],
        keyTerminology: [
          { term: 'Complementary Angles', definition: 'Angles summing to 90 degrees that produce identical range under ideal flat launch.' },
        ],
        highlightComponentIds: ['barrel', 'projectile'],
        recommendedCamera: { position: [0, 4.0, 9.0], target: [0, 2.0, 0] },
      },
    ];
  }

  private recalculateTrajectoryCurve(): void {
    const rad = THREE.MathUtils.degToRad(this.launchAngleDeg);
    this.barrelMesh.rotation.z = rad;

    const vx = this.v0 * Math.cos(rad);
    const vy = this.v0 * Math.sin(rad);

    // Compute flight time t_f
    const discriminant = vy * vy + 2 * this.g * this.h0;
    this.flightTime = (vy + Math.sqrt(discriminant)) / this.g;

    // Build trajectory point line
    const points: THREE.Vector3[] = [];
    const numPoints = 80;
    const startX = -5.0;

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * this.flightTime;
      const px = startX + vx * t;
      const py = Math.max(0, this.h0 + vy * t - 0.5 * this.g * t * t);
      points.push(new THREE.Vector3(px, py, 0));
    }

    this.trajectoryLine.geometry.dispose();
    this.trajectoryLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.trajectoryLine.computeLineDistances();
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.launchAngleDeg = 45.0;
      this.v0 = 12.0;
      this.h0 = 1.0;
    } else if (stageIndex === 1) {
      this.launchAngleDeg = 55.0;
      this.v0 = 14.0;
      this.h0 = 1.0;
    } else if (stageIndex === 2) {
      this.launchAngleDeg = 35.0;
      this.v0 = 12.0;
      this.h0 = 1.0;
    } else if (stageIndex === 3) {
      this.launchAngleDeg = 60.0;
      this.v0 = 15.0;
      this.h0 = 0.5;
    }
    this.parameters['launchAngle'] = this.launchAngleDeg;
    this.parameters['initialVelocity'] = this.v0;
    this.parameters['initialHeight'] = this.h0;
    this.simTime = 0.0;
    this.recalculateTrajectoryCurve();
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'initialVelocity') this.v0 = Math.min(25.0, Math.max(2.0, num));
    if (key === 'launchAngle') this.launchAngleDeg = Math.min(85.0, Math.max(10.0, num));
    if (key === 'initialHeight') this.h0 = Math.min(4.0, Math.max(0.2, num));

    this.simTime = 0.0;
    this.recalculateTrajectoryCurve();
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    const rad = THREE.MathUtils.degToRad(this.launchAngleDeg);
    const vx = this.v0 * Math.cos(rad);
    const vy0 = this.v0 * Math.sin(rad);

    const t = Math.min(this.flightTime, this.simTime);
    const currentX = -5.0 + vx * t;
    const currentY = Math.max(0.14, this.h0 + vy0 * t - 0.5 * this.g * t * t);
    const currentVy = vy0 - this.g * t;
    const currentSpeed = Math.sqrt(vx * vx + currentVy * currentVy);

    // Apex calculations
    const tApex = vy0 / this.g;
    const hMax = this.h0 + (vy0 * vy0) / (2 * this.g);
    const totalRange = vx * this.flightTime;

    // Tangential & normal acceleration
    const at = -this.g * (currentVy / currentSpeed);
    const an = this.g * (vx / currentSpeed);
    const rho = (currentSpeed * currentSpeed * currentSpeed) / (this.g * vx);

    // Update projectile 3D position
    this.projectileMesh.position.set(currentX, currentY, 0);

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    const projPos = new THREE.Vector3(currentX, currentY, 0);

    // 1. Instantaneous Velocity Vector (Tangent)
    const vDir = new THREE.Vector3(vx, currentVy, 0).normalize();
    const vLen = Math.min(2.2, Math.max(0.4, (currentSpeed / this.v0) * 1.5));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: projPos,
        direction: vDir,
        length: vLen,
        color: 0x2563eb, // Blue
        shaftRadius: 0.025,
        headRadius: 0.06,
      })
    );

    // 2. Gravity / Total Acceleration Vector (Down)
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: projPos,
        direction: new THREE.Vector3(0, -1, 0),
        length: 1.0,
        color: 0x16a34a, // Green
        shaftRadius: 0.022,
        headRadius: 0.055,
      })
    );

    // Annotations
    this.annotations.clear();
    this.annotations.add({
      id: 'projectile-kinematics',
      title: `Flight State: t = ${t.toFixed(2)} / ${this.flightTime.toFixed(2)} s`,
      text: `Speed |v| = ${currentSpeed.toFixed(1)} m/s (vx = ${vx.toFixed(1)}, vy = ${currentVy.toFixed(1)} m/s)`,
      worldPosition: projPos.clone().add(new THREE.Vector3(0, 0.45, 0)),
      type: 'info',
      category: 'Curvilinear Kinematics',
    });

    this.annotations.add({
      id: 'apex-range-data',
      title: `Apex: H_max = ${hMax.toFixed(2)} m | Range R = ${totalRange.toFixed(2)} m`,
      text: `Apex Time: ${tApex.toFixed(2)} s | Curvature ρ = ${rho.toFixed(1)} m`,
      worldPosition: new THREE.Vector3(-5.0 + totalRange / 2, hMax + 0.4, 0),
      type: 'success',
      category: 'Trajectory Extrema',
    });

    this.inspectedComponent = {
      id: 'projectile-sphere',
      name: 'Curvilinear Projectile Mass',
      type: 'Planar Trajectory Particle',
      description: 'Mass moving under constant vertical gravity and zero horizontal drag in intrinsic coordinates.',
      properties: {
        'Launch Speed (v0)': `${this.v0.toFixed(1)} m/s`,
        'Launch Angle (θ)': `${this.launchAngleDeg.toFixed(1)}°`,
        'Initial Height (h0)': `${this.h0.toFixed(2)} m`,
        'Horizontal Velocity (vx = const)': `${vx.toFixed(2)} m/s`,
        'Instantaneous Vertical Velocity (vy)': `${currentVy.toFixed(2)} m/s`,
        'Total Instantaneous Speed (|v|)': `${currentSpeed.toFixed(2)} m/s`,
        'Tangential Acceleration (a_t)': `${at.toFixed(2)} m/s²`,
        'Normal Acceleration (a_n)': `${an.toFixed(2)} m/s²`,
        'Radius of Curvature (ρ)': `${rho.toFixed(2)} m`,
        'Maximum Elevation (H_max)': `${hMax.toFixed(2)} m`,
        'Total Flight Range (R)': `${totalRange.toFixed(2)} m`,
      },
    };

    this.metrics['Launch Angle θ'] = `${this.launchAngleDeg.toFixed(1)}°`;
    this.metrics['Speed |v|'] = `${currentSpeed.toFixed(1)} m/s`;
    this.metrics['Max Height H'] = `${hMax.toFixed(2)} m`;
    this.metrics['Total Range R'] = `${totalRange.toFixed(2)} m`;
    this.metrics['Flight Time'] = `${this.flightTime.toFixed(2)} s`;
    this.metrics['Curvature ρ'] = `${rho.toFixed(1)} m`;
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying) {
      this.simTime += deltaSeconds * this.playbackSpeed;
      if (this.simTime >= this.flightTime) {
        this.simTime = this.flightTime;
        this.pause();
      }
      this.recalculateAndRender();
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.simTime = 0.0;
    this.recalculateAndRender();
  }
}
