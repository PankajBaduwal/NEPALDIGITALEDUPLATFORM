/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 14: Rectilinear Motion
 * Unit V: Dynamics of Particles and Rigid Bodies
 *
 * Demonstrates:
 * - Constant acceleration kinematics on calibrated linear track:
 *   s(t) = s0 + v0*t + 0.5*a*t^2
 *   v(t) = v0 + a*t
 *   v^2 = v0^2 + 2*a*(s - s0)
 * - Motion scrubbing along timeline with synchronized position, velocity, and acceleration vectors
 * - Direct comparison between uniform velocity (a=0) and uniformly accelerated motion
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class RectilinearMotionScene extends BaseMechanicsSimulation {
  private trackGroup = new THREE.Group();
  private cartGroup = new THREE.Group();
  private vectorGroup = new THREE.Group();
  private wheels: THREE.Mesh[] = [];

  // Kinematic parameters
  private s0 = -3.0; // initial position (m)
  private v0 = 0.5; // initial velocity (m/s)
  private accel = 0.8; // acceleration (m/s^2)
  private simTime = 0.0; // elapsed time (s)
  private maxDuration = 4.0; // seconds

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(12, 12);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.trackGroup);
    this.scene.add(this.cartGroup);
    this.scene.add(this.vectorGroup);

    // Build Calibrated Track (8 meters long, with ticks at every 0.5m)
    const trackLength = 8.0;
    const railGeo = new THREE.BoxGeometry(trackLength, 0.08, 0.06);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });

    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(0, 0.1, -0.3);
    this.trackGroup.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(0, 0.1, 0.3);
    this.trackGroup.add(rightRail);

    // Tick markers and distance labels
    for (let x = -3.5; x <= 3.5; x += 0.5) {
      const isMajor = Math.abs(x % 1.0) < 0.05;
      const sleeperGeo = new THREE.BoxGeometry(0.04, 0.04, isMajor ? 0.75 : 0.65);
      const sleeperMat = new THREE.MeshStandardMaterial({ color: isMajor ? 0x0284c7 : 0x94a3b8, roughness: 0.4 });
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(x, 0.08, 0);
      this.trackGroup.add(sleeper);
    }

    // Build Dynamic Laboratory Cart
    const cartBodyGeo = new THREE.BoxGeometry(0.7, 0.25, 0.55);
    const cartMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Technical Blue
      metalness: 0.6,
      roughness: 0.3,
    });
    const cartBody = new THREE.Mesh(cartBodyGeo, cartMat);
    cartBody.position.y = 0.22;
    cartBody.castShadow = true;
    this.cartGroup.add(cartBody);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });

    const offsets = [
      [-0.22, 0.09, -0.3],
      [0.22, 0.09, -0.3],
      [-0.22, 0.09, 0.3],
      [0.22, 0.09, 0.3],
    ];

    offsets.forEach(([x, y, z]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(x!, y!, z!);
      w.castShadow = true;
      this.wheels.push(w);
      this.cartGroup.add(w);
    });

    this.parameters['initialPosition'] = -3.0;
    this.parameters['initialVelocity'] = 0.5;
    this.parameters['acceleration'] = 0.8;

    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-kinematic-definitions',
        index: 0,
        title: 'Stage 1: Position, Velocity, and Acceleration Definitions',
        shortDescription: 'Fundamental derivatives: v = ds/dt and a = dv/dt = d²s/dt².',
        detailedExplanation:
          'Rectilinear motion is one-dimensional translation along a straight coordinate axis. ' +
          'Velocity is the first time-derivative of position v = ds/dt, measuring rate and direction of displacement. ' +
          'Acceleration is the time-derivative of velocity a = dv/dt, measuring how rapidly velocity changes.',
        principles: [
          'Velocity: v(t) = ds/dt',
          'Acceleration: a(t) = dv/dt = d²s/dt²',
        ],
        equations: [
          'v = \\frac{ds}{dt}',
          'a = \\frac{dv}{dt} = \\frac{d^2s}{dt^2}',
        ],
        keyTerminology: [
          { term: 'Position (s)', definition: 'Directed spatial coordinate measured from an arbitrary origin (s = 0).' },
          { term: 'Instantaneous Velocity (v)', definition: 'Vector tangent to path indicating speed and direction of travel.' },
        ],
        highlightComponentIds: ['cart', 'track'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0.3, 0] },
      },
      {
        id: 'stage-constant-accel-equations',
        index: 1,
        title: 'Stage 2: Constant Acceleration Governing Equations',
        shortDescription: 'Integration yields: s(t) = s0 + v0*t + 0.5*a*t^2 and v(t) = v0 + a*t.',
        detailedExplanation:
          'When acceleration a is constant, integrating twice with respect to time yields the famous Galilean equations: ' +
          'v(t) = v_0 + a·t and s(t) = s_0 + v_0·t + (1/2)·a·t². ' +
          'Eliminating time t gives the third relation independent of time: v² = v_0² + 2·a·(s - s_0).',
        principles: [
          'Position: s(t) = s_0 + v_0 · t + 0.5 · a · t²',
          'Velocity: v(t) = v_0 + a · t',
          'Time-Independent: v² = v_0² + 2 · a · (s - s_0)',
        ],
        equations: [
          's(t) = s_0 + v_0 t + \\frac{1}{2} a t^2',
          'v(t) = v_0 + a t',
          'v^2 = v_0^2 + 2 a (s - s_0)',
        ],
        keyTerminology: [
          { term: 'Uniform Acceleration', definition: 'Motion where velocity changes by equal amounts in equal time intervals.' },
        ],
        highlightComponentIds: ['cart', 'vel-arrow', 'accel-arrow'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0.3, 0] },
      },
      {
        id: 'stage-vector-directions',
        index: 2,
        title: 'Stage 3: Acceleration Vector vs. Velocity Vector Directions',
        shortDescription: 'If v and a share the same sign, speed increases (speeding up). If opposite, the cart slows down.',
        detailedExplanation:
          'A common student misconception is that negative acceleration always means moving backward. ' +
          'In reality, if velocity is positive (moving right) and acceleration is negative (pointing left), ' +
          'the object is simply decelerating while still advancing forward. ' +
          'Speed only reverses once velocity passes through zero.',
        principles: [
          'Speeding Up: sign(v) == sign(a)',
          'Slowing Down (Deceleration): sign(v) != sign(a)',
          'Instantaneous Turnaround: v = 0',
        ],
        equations: [
          '\\text{Speeding Up: } v \\cdot a > 0',
          '\\text{Slowing Down: } v \\cdot a < 0',
        ],
        keyTerminology: [
          { term: 'Deceleration / Retardation', definition: 'Acceleration vector acting in the opposite direction of velocity.' },
        ],
        highlightComponentIds: ['vel-arrow', 'accel-arrow'],
        recommendedCamera: { position: [1.2, 2.2, 3.8], target: [0.5, 0.3, 0] },
      },
      {
        id: 'stage-uniform-vs-accelerated',
        index: 3,
        title: 'Stage 4: Free Exploration & Motion Scrubbing',
        shortDescription: 'Scrub time or change acceleration to compare uniform velocity (a=0) against accelerated trajectories.',
        detailedExplanation:
          'Set a = 0 m/s² to observe pure uniform rectilinear velocity: displacement increases linearly with time (s = s_0 + v_0·t). ' +
          'Then introduce positive or negative acceleration to inspect parabolic displacement curves.',
        principles: [
          'Zero Acceleration: s(t) = s_0 + v_0 · t  (Linear)',
          'Non-Zero Acceleration: s(t) = Parabolic curvature',
        ],
        equations: [
          's(t)_{uniform} = s_0 + v_0 t \\quad (a = 0)',
        ],
        keyTerminology: [
          { term: 'Uniform Motion', definition: 'Motion with constant velocity and zero net force.' },
        ],
        highlightComponentIds: ['cart', 'track'],
        recommendedCamera: { position: [0, 2.5, 4.5], target: [0, 0.3, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.s0 = -3.0;
      this.v0 = 1.0;
      this.accel = 0.0;
    } else if (stageIndex === 1) {
      this.s0 = -3.0;
      this.v0 = 0.5;
      this.accel = 0.8;
    } else if (stageIndex === 2) {
      this.s0 = -2.5;
      this.v0 = 2.0;
      this.accel = -0.8;
    } else if (stageIndex === 3) {
      this.s0 = -3.0;
      this.v0 = 0.0;
      this.accel = 1.2;
    }
    this.parameters['initialPosition'] = this.s0;
    this.parameters['initialVelocity'] = this.v0;
    this.parameters['acceleration'] = this.accel;
    this.simTime = 0.0;
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'initialPosition') this.s0 = Math.min(2.5, Math.max(-3.5, num));
    if (key === 'initialVelocity') this.v0 = Math.min(3.0, Math.max(-2.0, num));
    if (key === 'acceleration') this.accel = Math.min(2.5, Math.max(-2.0, num));

    this.simTime = 0.0;
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    const t = this.simTime;
    const currentPos = this.s0 + this.v0 * t + 0.5 * this.accel * t * t;
    const currentVel = this.v0 + this.accel * t;

    // Update cart 3D position
    this.cartGroup.position.set(currentPos, 0, 0);

    // Rotate wheels based on displacement
    const wheelRadius = 0.09;
    const rot = -currentPos / wheelRadius;
    this.wheels.forEach((w) => {
      w.rotation.z = rot;
    });

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    const cartCenter = new THREE.Vector3(currentPos, 0.45, 0);

    // 1. Velocity Vector Arrow (Blue, +X or -X)
    if (Math.abs(currentVel) > 0.05) {
      const vDir = new THREE.Vector3(Math.sign(currentVel), 0, 0);
      const vLen = Math.min(2.0, Math.max(0.3, (Math.abs(currentVel) / 2.0) * 1.5));
      this.vectorGroup.add(
        VectorRenderer.createArrow({
          origin: cartCenter,
          direction: vDir,
          length: vLen,
          color: 0x2563eb, // Blue
          shaftRadius: 0.025,
          headRadius: 0.06,
        })
      );
    }

    // 2. Acceleration Vector Arrow (Green, +X or -X)
    if (Math.abs(this.accel) > 0.05) {
      const aDir = new THREE.Vector3(Math.sign(this.accel), 0, 0);
      const aLen = Math.min(1.8, Math.max(0.3, (Math.abs(this.accel) / 2.0) * 1.4));
      this.vectorGroup.add(
        VectorRenderer.createArrow({
          origin: cartCenter.clone().add(new THREE.Vector3(0, 0.25, 0)),
          direction: aDir,
          length: aLen,
          color: 0x16a34a, // Green
          shaftRadius: 0.022,
          headRadius: 0.055,
        })
      );
    }

    // Annotations
    this.annotations.clear();
    this.annotations.add({
      id: 'cart-kinematics',
      title: `Cart State at t = ${t.toFixed(2)} s`,
      text: `Pos: s = ${currentPos.toFixed(2)} m | Vel: v = ${currentVel.toFixed(2)} m/s | a = ${this.accel.toFixed(2)} m/s²`,
      worldPosition: cartCenter.clone().add(new THREE.Vector3(0, 0.6, 0)),
      type: 'info',
      category: 'Kinematics',
    });

    this.inspectedComponent = {
      id: 'rectilinear-cart',
      name: 'Instrumented Linear Dynamics Cart',
      type: 'Particle Idealization with Constant Acceleration',
      description: 'Translating body moving along calibrated track governed by Galilean kinematic equations.',
      properties: {
        'Elapsed Time (t)': `${t.toFixed(2)} s`,
        'Instantaneous Position s(t)': `${currentPos.toFixed(3)} m`,
        'Instantaneous Velocity v(t)': `${currentVel.toFixed(3)} m/s (${(currentVel * 3.6).toFixed(1)} km/h)`,
        'Constant Acceleration (a)': `${this.accel.toFixed(3)} m/s²`,
        'Initial Position (s0)': `${this.s0.toFixed(2)} m`,
        'Initial Velocity (v0)': `${this.v0.toFixed(2)} m/s`,
        'Displacement (s - s0)': `${(currentPos - this.s0).toFixed(3)} m`,
        'Motion Regime': Math.abs(this.accel) < 0.01 ? 'Uniform Velocity' : currentVel * this.accel >= 0 ? 'Speeding Up' : 'Decelerating',
      },
    };

    this.metrics['Position s(t)'] = `${currentPos.toFixed(2)} m`;
    this.metrics['Velocity v(t)'] = `${currentVel.toFixed(2)} m/s`;
    this.metrics['Acceleration a'] = `${this.accel.toFixed(2)} m/s²`;
    this.metrics['Elapsed Time t'] = `${t.toFixed(2)} s`;
    this.metrics['Motion Regime'] = Math.abs(this.accel) < 0.01 ? 'Uniform Velocity' : currentVel * this.accel >= 0 ? 'Accelerating' : 'Decelerating';
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying) {
      this.simTime += deltaSeconds * this.playbackSpeed;
      if (this.simTime > this.maxDuration) {
        this.simTime = this.maxDuration;
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
