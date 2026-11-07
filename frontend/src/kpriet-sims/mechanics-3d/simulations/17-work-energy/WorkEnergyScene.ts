/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 17: Work–Energy Principle
 * Unit V: Dynamics of Particles and Rigid Bodies
 *
 * Demonstrates:
 * - Conservation of mechanical energy and work-energy theorem:
 *   T1 + V_g1 + V_e1 + U_{1->2}^{non-conservative} = T2 + V_g2 + V_e2
 * - Potential energy conversion: V_g = m*g*h
 * - Kinetic energy: T = 0.5*m*v^2
 * - Elastic spring compression: V_e = 0.5*k*x^2
 * - Dissipative friction loss along rough section: W_loss = mu_k * m * g * d
 * - Real-time energy balance synchronization and visual energy allocation meters
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class WorkEnergyScene extends BaseMechanicsSimulation {
  private trackGroup = new THREE.Group();
  private cartMesh!: THREE.Mesh;
  private springMesh!: THREE.Mesh;
  private vectorGroup = new THREE.Group();

  // Physical parameters
  private massKg = 5.0; // mass of cart
  private startHeightM = 2.4; // initial height on ramp
  private springStiffnessK = 800.0; // N/m
  private muFriction = 0.12; // friction along flat track
  private g = 9.81;

  // Track profile geometry
  private rampRadius = 2.4;
  private springRestLength = 0.8;
  private springAnchorX = 4.2;

  // Dynamic state
  private cartS = 0.0; // path coordinate (0 = top of ramp)
  private cartVel = 0.0;
  private springCompression = 0.0;
  private accumulatedWorkFriction = 0.0;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(14, 14);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.trackGroup);
    this.scene.add(this.vectorGroup);

    // Build curved ramp + flat track
    this.buildTrack();

    // Build Cart
    const cartGeo = new THREE.BoxGeometry(0.5, 0.25, 0.4);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
    this.cartMesh = new THREE.Mesh(cartGeo, cartMat);
    this.cartMesh.castShadow = true;
    this.scene.add(this.cartMesh);

    // Build Bumper Spring at end of track
    this.springMesh = MechanicalBuilder.createSpring(0.8, 0.12, 10, 0xd97706);
    this.springMesh.position.set(this.springAnchorX - 0.8 / 2, 0.15, 0);
    this.scene.add(this.springMesh);

    // Spring rigid backing wall
    const wallGeo = new THREE.BoxGeometry(0.2, 0.6, 0.6);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(this.springAnchorX + 0.1, 0.3, 0);
    this.trackGroup.add(wall);

    this.parameters['cartMass'] = 5.0;
    this.parameters['initialHeight'] = 2.4;
    this.parameters['springStiffness'] = 800.0;
    this.parameters['frictionCoeff'] = 0.12;

    this.resetExperiment();
  }

  private buildTrack(): void {
    this.trackGroup.clear();

    // Curved Ramp curve down to y=0
    const numSegments = 30;
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= numSegments; i++) {
      const angle = Math.PI + (i / numSegments) * (Math.PI / 2);
      const x = -3.5 + this.rampRadius + this.rampRadius * Math.cos(angle);
      const y = this.rampRadius + this.rampRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Flat extension
    points.push(new THREE.Vector3(this.springAnchorX, 0, 0));

    const spline = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(spline, 64, 0.08, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const trackMesh = new THREE.Mesh(tubeGeo, tubeMat);
    trackMesh.receiveShadow = true;
    this.trackGroup.add(trackMesh);

    // Friction rough strip indicator (x = 0.5 to 2.5)
    const fricStripGeo = new THREE.PlaneGeometry(2.0, 0.4);
    fricStripGeo.rotateX(-Math.PI / 2);
    const fricStripMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.9 });
    const fricStrip = new THREE.Mesh(fricStripGeo, fricStripMat);
    fricStrip.position.set(1.5, 0.005, 0);
    this.trackGroup.add(fricStrip);
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-energy-overview',
        index: 0,
        title: 'Stage 1: Work–Energy Principle & Total Mechanical Energy',
        shortDescription: 'Total mechanical energy E = T + V_g + V_e is conserved in the absence of non-conservative work.',
        detailedExplanation:
          'The work-energy principle states that the change in kinetic energy of a system equals total work done: ' +
          'ΔT = W_{total} = W_{conservative} + W_{non-conservative}. ' +
          'Grouping conservative forces into potential energy functions yields: ' +
          'T_1 + V_{g1} + V_{e1} + W_{fric} = T_2 + V_{g2} + V_{e2}.',
        principles: [
          'Kinetic Energy: T = 0.5 · m · v²',
          'Gravitational PE: V_g = m · g · h',
          'Spring Elastic PE: V_e = 0.5 · k · x²',
        ],
        equations: [
          'T_1 + V_1 + U_{1\\to 2}^{nc} = T_2 + V_2',
          'E_{total} = \\frac{1}{2} m v^2 + m g h + \\frac{1}{2} k x^2 + W_{loss}',
        ],
        keyTerminology: [
          { term: 'Conservative Force', definition: 'Force (such as gravity or ideal spring) whose work depends only on initial and final positions.' },
          { term: 'Non-Conservative Work', definition: 'Path-dependent work (such as friction) converting mechanical energy into heat.' },
        ],
        highlightComponentIds: ['cart', 'track', 'spring'],
        recommendedCamera: { position: [1.0, 3.2, 6.0], target: [0.5, 1.2, 0] },
      },
      {
        id: 'stage-potential-to-kinetic',
        index: 1,
        title: 'Stage 2: Gravitational PE to Kinetic Energy Conversion',
        shortDescription: 'As the cart descends the ramp (h -> 0), potential energy m*g*h converts entirely into kinetic energy 0.5*m*v^2.',
        detailedExplanation:
          'At the release crest (h = h_0), the cart has pure potential energy V_g = m·g·h_0 and zero velocity. ' +
          'As it reaches the bottom of the curved slope (h = 0), all gravitational potential energy converts to kinetic energy: ' +
          'm·g·h_0 = (1/2)·m·v_bottom² ⇒ v_bottom = sqrt(2·g·h_0). ' +
          'Notice that this maximum speed is completely independent of cart mass!',
        principles: [
          'Bottom Velocity: v_{bottom} = sqrt(2 · g · h_0)',
          'Complete Lossless Energy Exchange: ΔT = -ΔV_g',
        ],
        equations: [
          'v_{bottom} = \\sqrt{2 g h_0}',
        ],
        keyTerminology: [
          { term: 'Kinetic Energy (T)', definition: 'The capacity of a moving body to do mechanical work by virtue of its speed.' },
        ],
        highlightComponentIds: ['cart', 'track'],
        recommendedCamera: { position: [-1.0, 2.5, 4.5], target: [-1.0, 1.2, 0] },
      },
      {
        id: 'stage-frictional-work',
        index: 2,
        title: 'Stage 3: Dissipative Friction Work Along Rough Track',
        shortDescription: 'Traveling across rough strip d dissipates mechanical energy: W_loss = mu_k * m * g * d.',
        detailedExplanation:
          'As the cart traverses the rough horizontal section (colored dark red), friction exerts retarding force f_k = μ_k · m · g. ' +
          'Work done by friction is strictly negative: W_{fric} = -f_k · d. ' +
          'This non-conservative dissipation permanently reduces total available mechanical energy.',
        principles: [
          'Friction Force: f_k = μ_k · m · g',
          'Dissipated Thermal Energy: W_{loss} = f_k · d',
          'Speed Reduction: v_after = sqrt(v_before² - 2 · μ_k · g · d)',
        ],
        equations: [
          'W_{loss} = \\mu_k m g d',
        ],
        keyTerminology: [
          { term: 'Dissipation', definition: 'Irreversible thermodynamic degradation of mechanical work into internal heat.' },
        ],
        highlightComponentIds: ['cart'],
        recommendedCamera: { position: [1.5, 2.0, 4.0], target: [1.5, 0.5, 0] },
      },
      {
        id: 'stage-spring-compression',
        index: 3,
        title: 'Stage 4: Buffer Spring Compression & Maximum Deflection',
        shortDescription: 'Remaining kinetic energy is stored elastically: 0.5*m*v^2 = 0.5*k*x_max^2.',
        detailedExplanation:
          'Upon striking the end buffer spring, the cart decelerates as the spring compresses by distance x. ' +
          'Restoring force F = -k·x does negative work, converting kinetic energy into elastic strain energy: ' +
          'V_e = (1/2)·k·x². At maximum compression x_{max}, the cart momentarily halts (v = 0).',
        principles: [
          'Spring Potential Energy: V_e = 0.5 · k · x²',
          'Maximum Spring Deflection: x_{max} = v · sqrt(m / k)',
        ],
        equations: [
          'x_{max} = v \\sqrt{\\frac{m}{k}}',
        ],
        keyTerminology: [
          { term: 'Elastic Potential Energy', definition: 'Strain energy stored in reversible mechanical deformation of a spring.' },
        ],
        highlightComponentIds: ['spring', 'cart'],
        recommendedCamera: { position: [3.5, 1.8, 3.5], target: [3.5, 0.4, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.massKg = 5.0;
      this.startHeightM = 2.4;
      this.springStiffnessK = 800.0;
      this.muFriction = 0.0;
    } else if (stageIndex === 1) {
      this.massKg = 5.0;
      this.startHeightM = 2.4;
      this.muFriction = 0.0;
    } else if (stageIndex === 2) {
      this.massKg = 5.0;
      this.startHeightM = 2.4;
      this.muFriction = 0.18;
    } else if (stageIndex === 3) {
      this.massKg = 5.0;
      this.startHeightM = 2.4;
      this.springStiffnessK = 500.0;
      this.muFriction = 0.05;
    }
    this.parameters['cartMass'] = this.massKg;
    this.parameters['initialHeight'] = this.startHeightM;
    this.parameters['springStiffness'] = this.springStiffnessK;
    this.parameters['frictionCoeff'] = this.muFriction;
    this.resetExperiment();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'cartMass') this.massKg = Math.max(0.5, num);
    if (key === 'initialHeight') this.startHeightM = Math.max(0.5, Math.min(3.5, num));
    if (key === 'springStiffness') this.springStiffnessK = Math.max(100, num);
    if (key === 'frictionCoeff') this.muFriction = Math.max(0, Math.min(0.5, num));

    this.resetExperiment();
  }

  private recalculateAndRender(): void {
    const totalInitialE = this.massKg * this.g * this.startHeightM;

    // Calculate cart Cartesian position from path coordinate cartS
    let px = -3.5;
    let py = this.startHeightM;
    let currentH = 0;

    const arcLength = (Math.PI / 2) * this.rampRadius;
    if (this.cartS <= arcLength) {
      // On curved ramp
      const fraction = this.cartS / arcLength;
      const angle = Math.PI + fraction * (Math.PI / 2);
      px = -3.5 + this.rampRadius + this.rampRadius * Math.cos(angle);
      py = this.rampRadius + this.rampRadius * Math.sin(angle);
      currentH = py;
    } else {
      // On flat track
      const flatTravel = this.cartS - arcLength;
      px = -3.5 + this.rampRadius + flatTravel;
      py = 0.125;
      currentH = 0;
    }

    // Spring contact position
    const springContactX = this.springAnchorX - this.springRestLength;
    if (px >= springContactX) {
      this.springCompression = Math.max(0, px - springContactX);
    } else {
      this.springCompression = 0;
    }

    // Energy components
    const PE_grav = this.massKg * this.g * currentH;
    const PE_spring = 0.5 * this.springStiffnessK * (this.springCompression * this.springCompression);
    const KE = Math.max(0, totalInitialE - PE_grav - PE_spring - this.accumulatedWorkFriction);
    this.cartVel = Math.sqrt((2 * KE) / this.massKg);

    // Position cart mesh
    this.cartMesh.position.set(px, py + 0.125, 0);

    // Update spring geometry scale
    const currentSpringLen = Math.max(0.1, this.springRestLength - this.springCompression);
    const scaleFactor = currentSpringLen / this.springRestLength;
    this.springMesh.scale.x = scaleFactor;
    this.springMesh.position.x = this.springAnchorX - currentSpringLen / 2;

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    // Velocity arrow
    if (this.cartVel > 0.1) {
      const vLen = Math.min(2.0, Math.max(0.3, (this.cartVel / 6.0) * 1.5));
      this.vectorGroup.add(
        VectorRenderer.createArrow({
          origin: new THREE.Vector3(px, py + 0.35, 0),
          direction: new THREE.Vector3(1, 0, 0),
          length: vLen,
          color: 0x2563eb, // Blue
        })
      );
    }

    // Spring restoring force arrow
    if (this.springCompression > 0.02) {
      const fSpring = this.springStiffnessK * this.springCompression;
      const fLen = Math.min(1.8, Math.max(0.4, (fSpring / 500) * 1.5));
      this.vectorGroup.add(
        VectorRenderer.createArrow({
          origin: new THREE.Vector3(px, py + 0.125, 0),
          direction: new THREE.Vector3(-1, 0, 0),
          length: fLen,
          color: 0xef4444, // Red
        })
      );
    }

    // Annotations
    this.annotations.clear();
    this.annotations.add({
      id: 'energy-bars',
      title: `Energy Balance: E_tot = ${totalInitialE.toFixed(1)} J`,
      text: `KE: ${KE.toFixed(1)} J | Grav PE: ${PE_grav.toFixed(1)} J | Spring PE: ${PE_spring.toFixed(1)} J | Loss: ${this.accumulatedWorkFriction.toFixed(1)} J`,
      worldPosition: new THREE.Vector3(px, py + 0.8, 0),
      type: 'info',
      category: 'Work-Energy',
    });

    this.inspectedComponent = {
      id: 'work-energy-system',
      name: 'Work-Energy Track & Bumper Spring',
      type: 'Conservative / Dissipative Dynamic System',
      description: 'System demonstrating interchange of gravitational, kinetic, and elastic potential energies with friction loss.',
      properties: {
        'Cart Mass (m)': `${this.massKg.toFixed(1)} kg`,
        'Total Initial Energy (E0)': `${totalInitialE.toFixed(1)} J`,
        'Instantaneous Kinetic Energy (T)': `${KE.toFixed(1)} J`,
        'Gravitational PE (V_g)': `${PE_grav.toFixed(1)} J`,
        'Spring Elastic PE (V_e)': `${PE_spring.toFixed(1)} J`,
        'Frictional Heat Dissipated (W_loss)': `${this.accumulatedWorkFriction.toFixed(1)} J`,
        'Cart Velocity (v)': `${this.cartVel.toFixed(2)} m/s`,
        'Spring Deflection (x)': `${(this.springCompression * 1000).toFixed(0)} mm`,
        'Spring Restoring Force (F_s)': `${(this.springStiffnessK * this.springCompression).toFixed(1)} N`,
      },
    };

    this.metrics['Kinetic Energy T'] = `${KE.toFixed(1)} J`;
    this.metrics['Gravitational PE'] = `${PE_grav.toFixed(1)} J`;
    this.metrics['Spring Elastic PE'] = `${PE_spring.toFixed(1)} J`;
    this.metrics['Friction Dissipated'] = `${this.accumulatedWorkFriction.toFixed(1)} J`;
    this.metrics['Cart Velocity'] = `${this.cartVel.toFixed(2)} m/s`;
    this.metrics['Spring Deflection'] = `${(this.springCompression * 1000).toFixed(0)} mm`;
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying) {
      const dt = deltaSeconds * this.playbackSpeed;
      const arcLength = (Math.PI / 2) * this.rampRadius;

      // Check if inside friction zone (x between 0.5 and 2.5)
      const currentX = -3.5 + this.rampRadius + (this.cartS - arcLength);
      if (this.cartS > arcLength && currentX >= 0.5 && currentX <= 2.5) {
        const ds = this.cartVel * dt;
        const dW = this.muFriction * this.massKg * this.g * ds;
        this.accumulatedWorkFriction += dW;
      }

      const ds = this.cartVel * dt;
      this.cartS += ds;

      // Turnaround or stop at maximum spring compression
      const totalInitialE = this.massKg * this.g * this.startHeightM;
      const maxAvailableSpringE = totalInitialE - this.accumulatedWorkFriction;
      const maxDeflection = Math.sqrt((2 * maxAvailableSpringE) / this.springStiffnessK);
      const maxPathS = arcLength + (this.springAnchorX - this.springRestLength - (-3.5 + this.rampRadius)) + maxDeflection;

      if (this.cartS >= maxPathS) {
        this.cartS = maxPathS;
        this.pause();
      }

      this.recalculateAndRender();
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.cartS = 0.0;
    this.cartVel = 0.0;
    this.springCompression = 0.0;
    this.accumulatedWorkFriction = 0.0;
    this.recalculateAndRender();
  }
}
