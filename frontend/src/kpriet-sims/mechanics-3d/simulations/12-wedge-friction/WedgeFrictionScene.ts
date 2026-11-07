/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 12: Wedge Friction and Load Lifting
 * Unit IV: Friction
 *
 * Demonstrates:
 * - Mechanical advantage and multi-interface dry friction in wedge mechanisms
 * - Friction angle phi = arctan(mu) and normal/tangential contact decompositions
 * - Lifting effort: P = W * tan(alpha + 2*phi)
 * - Lowering/withdrawal effort: P' = W * tan(alpha - 2*phi)
 * - Self-locking condition: alpha < 2*phi (prevents back-driving under load)
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class WedgeFrictionScene extends BaseMechanicsSimulation {
  private wedgeGroup = new THREE.Group();
  private blockGroup = new THREE.Group();
  private guidesGroup = new THREE.Group();
  private vectorGroup = new THREE.Group();

  // Wedge and Block meshes
  private wedgeMesh!: THREE.Mesh;
  private loadBlockMesh!: THREE.Mesh;
  private hydraulicRamMesh!: THREE.Mesh;

  // Parameters
  private wedgeAngleDeg = 15.0; // alpha (degrees)
  private loadMassKg = 500.0; // kg (W = mg)
  private muFriction = 0.25; // friction coefficient at all interfaces
  private isWithdrawalMode = false;

  // Animation displacement
  private wedgeDisplacementX = 0.0; // meters pushed inwards
  private wedgeMaxStroke = 1.2;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(10, 10);
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.guidesGroup);
    this.scene.add(this.wedgeGroup);
    this.scene.add(this.blockGroup);
    this.scene.add(this.vectorGroup);

    // Build vertical guide columns
    const guideGeo = new THREE.BoxGeometry(0.15, 3.2, 0.8);
    const guideMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.2,
    });

    const leftGuide = new THREE.Mesh(guideGeo, guideMat);
    leftGuide.position.set(-0.55, 1.6, 0);
    leftGuide.castShadow = true;
    this.guidesGroup.add(leftGuide);

    const rightGuide = new THREE.Mesh(guideGeo, guideMat);
    rightGuide.position.set(0.55, 1.6, 0);
    rightGuide.castShadow = true;
    this.guidesGroup.add(rightGuide);

    // Hydraulic ram cylinder on left
    const ramGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16);
    ramGeo.rotateZ(Math.PI / 2);
    const ramMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const ramCylinder = new THREE.Mesh(ramGeo, ramMat);
    ramCylinder.position.set(-2.2, 0.25, 0);
    this.guidesGroup.add(ramCylinder);

    const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 16);
    rodGeo.rotateZ(Math.PI / 2);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    this.hydraulicRamMesh = new THREE.Mesh(rodGeo, rodMat);
    this.hydraulicRamMesh.position.set(-1.2, 0.25, 0);
    this.guidesGroup.add(this.hydraulicRamMesh);

    this.parameters['wedgeAngle'] = 15.0;
    this.parameters['loadMass'] = 500.0;
    this.parameters['muFriction'] = 0.25;
    this.parameters['mode'] = 0; // 0 = Lifting, 1 = Lowering

    this.rebuildMeshes();
    this.recalculateAndRender();
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-wedge-geometry',
        index: 0,
        title: 'Stage 1: Wedge Angle & Interface Kinematics',
        shortDescription: 'Triangular wedge of angle α converts horizontal displacement Δx into vertical lift Δy = Δx tan α.',
        detailedExplanation:
          'A wedge is a simple machine that utilizes an inclined plane driven beneath a load. ' +
          'As the horizontal wedge advances by Δx, the vertical load block is forced upward by Δy = Δx · tan α. ' +
          'Small wedge angles offer tremendous mechanical advantage at the cost of requiring longer driving stroke.',
        principles: [
          'Kinematic Relation: Δy = Δx · tan(α)',
          'Mechanical Advantage: MA = 1 / tan(α)',
        ],
        equations: [
          '\\Delta y = \\Delta x \\cdot \\tan \\alpha',
        ],
        keyTerminology: [
          { term: 'Wedge Taper Angle (α)', definition: 'The acute angle of the inclined wedge face.' },
          { term: 'Kinematic Transformation', definition: 'Conversion of high-speed horizontal effort into high-force vertical displacement.' },
        ],
        highlightComponentIds: ['wedge', 'block'],
        recommendedCamera: { position: [2.5, 2.2, 4.0], target: [0, 1.0, 0] },
      },
      {
        id: 'stage-friction-angles',
        index: 1,
        title: 'Stage 2: Multi-Interface Friction & Reaction Resultants',
        shortDescription: 'Friction operates simultaneously at three contacts: floor, wedge-block interface, and vertical guide.',
        detailedExplanation:
          'At each contact interface, the resultant reaction R tilts relative to the surface normal by friction angle Φ = arctan(μ). ' +
          'At the inclined contact, the inclination angle α adds directly to the friction angle Φ. ' +
          'Therefore, the inclined resultant reaction makes total angle (α + Φ) with the vertical.',
        principles: [
          'Friction Angle: Φ = arctan(μ)',
          'Resultant Reaction Tilt: R = N / cos(Φ)',
        ],
        equations: [
          '\\Phi = \\arctan(\\mu)',
        ],
        keyTerminology: [
          { term: 'Friction Angle (Φ)', definition: 'The maximum angle that total contact reaction can make with the surface normal before slipping occurs.' },
        ],
        highlightComponentIds: ['wedge', 'guides'],
        recommendedCamera: { position: [2.2, 1.8, 3.5], target: [0, 0.8, 0] },
      },
      {
        id: 'stage-lifting-effort',
        index: 2,
        title: 'Stage 3: Lifting Effort Equation & Equilibrium',
        shortDescription: 'Horizontal effort required to lift vertical load W: P = W · tan(α + 2Φ).',
        detailedExplanation:
          'Solving the coupled simultaneous equilibrium equations of both the vertical load block and the driving wedge ' +
          'demonstrates that total horizontal effort is: P = W · tan(α + 2Φ). ' +
          'Notice how friction drastically increases the required driving force beyond the frictionless case P_ideal = W · tan α.',
        principles: [
          'Lifting Force: P = W · tan(α + 2Φ)',
          'Ideal Frictionless Force: P_{ideal} = W · tan(α)',
          'Efficiency: η = P_{ideal} / P = tan(α) / tan(α + 2Φ)',
        ],
        equations: [
          'P = W \\cdot \\tan(\\alpha + 2\\Phi)',
          '\\eta = \\frac{\\tan\\alpha}{\\tan(\\alpha + 2\\Phi)}',
        ],
        keyTerminology: [
          { term: 'Wedge Efficiency (η)', definition: 'Ratio of ideal frictionless effort to actual effort with dry friction.' },
        ],
        highlightComponentIds: ['hydraulic-ram', 'wedge'],
        recommendedCamera: { position: [2.5, 2.2, 4.0], target: [0, 1.0, 0] },
      },
      {
        id: 'stage-self-locking',
        index: 3,
        title: 'Stage 4: Self-Locking Condition & Withdrawal Effort',
        shortDescription: 'If α < 2Φ, the wedge is self-locking: the load cannot push it out. To lower the load: P\' = W · tan(α - 2Φ).',
        detailedExplanation:
          'When driving effort P is removed, the heavy load W attempts to kick the wedge out. ' +
          'If the taper angle α is smaller than 2Φ, the withdrawal effort P\' = W · tan(α - 2Φ) is negative, ' +
          'meaning that pulling the wedge out requires an external reverse force. The mechanism is self-locking! ' +
          'If α > 2Φ, the wedge is back-drivable and pops out dangerously under load.',
        principles: [
          'Withdrawal Force: P\' = W · tan(α - 2Φ)',
          'Self-Locking Criterion: α < 2Φ  (or tan(α/2) < μ)',
          'Back-Drivable Hazard: α > 2Φ  (spontaneous ejection)',
        ],
        equations: [
          'P\' = W \\cdot \\tan(\\alpha - 2\\Phi)',
          '\\text{Self-Locking Criterion: } \\alpha < 2\\Phi',
        ],
        keyTerminology: [
          { term: 'Self-Locking', definition: 'The property where friction prevents reverse motion regardless of how large the applied load is.' },
          { term: 'Back-Drivability', definition: 'The tendency of a load to force the wedge backward when input effort is released.' },
        ],
        highlightComponentIds: ['wedge', 'block'],
        recommendedCamera: { position: [2.8, 2.2, 4.2], target: [0, 1.0, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.wedgeAngleDeg = 10.0;
      this.isWithdrawalMode = false;
      this.rebuildMeshes();
    } else if (stageIndex === 1) {
      this.wedgeAngleDeg = 15.0;
      this.muFriction = 0.25;
      this.isWithdrawalMode = false;
      this.rebuildMeshes();
    } else if (stageIndex === 2) {
      this.wedgeAngleDeg = 12.0;
      this.loadMassKg = 500.0;
      this.isWithdrawalMode = false;
      this.rebuildMeshes();
    } else if (stageIndex === 3) {
      // Stage 4: Self-locking condition and withdrawal mode
      this.wedgeAngleDeg = 12.0;
      this.isWithdrawalMode = true;
      this.rebuildMeshes();
    }
    this.parameters['wedgeAngle'] = this.wedgeAngleDeg;
    this.parameters['mode'] = this.isWithdrawalMode ? 1 : 0;
    this.wedgeDisplacementX = 0.0;
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'wedgeAngle') {
      this.wedgeAngleDeg = Math.min(35, Math.max(5, num));
      this.rebuildMeshes();
    }
    if (key === 'loadMass') this.loadMassKg = Math.max(50, num);
    if (key === 'muFriction') this.muFriction = Math.min(0.6, Math.max(0.02, num));
    if (key === 'mode') this.isWithdrawalMode = num > 0.5 || value === true;

    this.recalculateAndRender();
  }

  private rebuildMeshes(): void {
    if (this.wedgeMesh) {
      this.wedgeGroup.remove(this.wedgeMesh);
      if (this.wedgeMesh.geometry) this.wedgeMesh.geometry.dispose();
    }
    if (this.loadBlockMesh) {
      this.blockGroup.remove(this.loadBlockMesh);
      if (this.loadBlockMesh.geometry) this.loadBlockMesh.geometry.dispose();
    }

    const rad = THREE.MathUtils.degToRad(this.wedgeAngleDeg);
    const wedgeLength = 2.0;
    const wedgeHeight = wedgeLength * Math.tan(rad);
    const wedgeWidth = 0.7;

    // Custom Wedge Prism Geometry
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(wedgeLength, 0);
    shape.lineTo(0, wedgeHeight);
    shape.closePath();

    const extrudeSettings = { depth: wedgeWidth, bevelEnabled: false };
    const wedgeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    wedgeGeo.translate(-wedgeLength / 2, 0, -wedgeWidth / 2);

    const wedgeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Technical Blue
      metalness: 0.6,
      roughness: 0.3,
    });
    this.wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat);
    this.wedgeMesh.castShadow = true;
    this.wedgeGroup.add(this.wedgeMesh);

    // Load Block with beveled bottom matching wedge angle
    const blockWidth = 0.95;
    const blockHeight = 1.2;
    const blockDepth = 0.7;

    const blockShape = new THREE.Shape();
    blockShape.moveTo(-blockWidth / 2, 0);
    blockShape.lineTo(blockWidth / 2, -blockWidth * Math.tan(rad));
    blockShape.lineTo(blockWidth / 2, blockHeight);
    blockShape.lineTo(-blockWidth / 2, blockHeight);
    blockShape.closePath();

    const blockGeo = new THREE.ExtrudeGeometry(blockShape, { depth: blockDepth, bevelEnabled: false });
    blockGeo.translate(0, 0, -blockDepth / 2);

    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate Steel
      metalness: 0.7,
      roughness: 0.3,
    });
    this.loadBlockMesh = new THREE.Mesh(blockGeo, blockMat);
    this.loadBlockMesh.castShadow = true;
    this.blockGroup.add(this.loadBlockMesh);
  }

  private recalculateAndRender(): void {
    const alpha = THREE.MathUtils.degToRad(this.wedgeAngleDeg);
    const phi = Math.atan(this.muFriction);
    const g = 9.81;
    const W = this.loadMassKg * g;

    // Lifting effort: P = W * tan(alpha + 2*phi)
    const angleSum = alpha + 2 * phi;
    const pLift = angleSum < Math.PI / 2 ? W * Math.tan(angleSum) : 999999;

    // Withdrawal effort: P' = W * tan(alpha - 2*phi)
    const angleDiff = alpha - 2 * phi;
    const pWithdraw = W * Math.tan(angleDiff);

    const isSelfLocking = alpha < 2 * phi;
    const efficiency = (Math.tan(alpha) / Math.tan(angleSum)) * 100;

    // Calculate vertical lift of the block based on current wedge displacement
    const liftY = this.wedgeDisplacementX * Math.tan(alpha);

    // Position wedge and block
    this.wedgeGroup.position.set(-0.2 + this.wedgeDisplacementX, 0, 0);
    this.blockGroup.position.set(0, 0.2 + liftY, 0);
    this.hydraulicRamMesh.position.x = -1.2 + this.wedgeDisplacementX;

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    // 1. Driving Force P arrow (Horizontal pushing right)
    const pEffort = this.isWithdrawalMode ? Math.abs(pWithdraw) : pLift;
    const pLen = Math.min(2.0, Math.max(0.4, (pEffort / 5000) * 1.5));
    const pDir = this.isWithdrawalMode && isSelfLocking ? new THREE.Vector3(-1, 0, 0) : new THREE.Vector3(1, 0, 0);

    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: new THREE.Vector3(-1.2 + this.wedgeDisplacementX, 0.25, 0),
        direction: pDir,
        length: pLen,
        color: 0xef4444, // Red
        shaftRadius: 0.03,
        headRadius: 0.07,
      })
    );

    // 2. Load Weight W Arrow (Down from block)
    const wLen = Math.min(2.0, Math.max(0.5, (W / 5000) * 1.5));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: new THREE.Vector3(0, 1.2 + liftY, 0),
        direction: new THREE.Vector3(0, -1, 0),
        length: wLen,
        color: 0x2563eb, // Blue
        shaftRadius: 0.03,
        headRadius: 0.07,
      })
    );

    // 3. Inclined Reaction Resultant Arrow
    const rLen = Math.min(1.8, Math.max(0.4, (W / 4000) * 1.5));
    const rDir = new THREE.Vector3(Math.sin(alpha + phi), Math.cos(alpha + phi), 0).normalize();
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: new THREE.Vector3(0, 0.3 + liftY, 0),
        direction: rDir,
        length: rLen,
        color: 0x16a34a, // Green
        shaftRadius: 0.025,
        headRadius: 0.06,
      })
    );

    // Annotations
    this.annotations.clear();
    this.annotations.add({
      id: 'effort-status',
      title: this.isWithdrawalMode ? `Withdrawal Force: ${Math.abs(pWithdraw).toFixed(0)} N` : `Lifting Effort: ${pLift.toFixed(0)} N`,
      text: this.isWithdrawalMode
        ? isSelfLocking
          ? 'SELF-LOCKING: Reverse pull required to withdraw!'
          : 'BACK-DRIVABLE: Ejected spontaneously by load'
        : `Ideal P: ${(W * Math.tan(alpha)).toFixed(0)} N | Efficiency η = ${efficiency.toFixed(1)}%`,
      worldPosition: new THREE.Vector3(-0.8 + this.wedgeDisplacementX, 0.8, 0.5),
      type: isSelfLocking ? 'success' : 'warning',
      category: 'Effort',
    });

    this.annotations.add({
      id: 'locking-status',
      title: `Angle α = ${this.wedgeAngleDeg.toFixed(1)}° vs 2Φ = ${(THREE.MathUtils.radToDeg(2 * phi)).toFixed(1)}°`,
      text: isSelfLocking ? 'Self-Locking (α < 2Φ)' : 'Non-Locking (α > 2Φ)',
      worldPosition: new THREE.Vector3(0, 2.0 + liftY, 0),
      type: 'info',
      category: 'Kinematics',
    });

    this.inspectedComponent = {
      id: 'wedge-system',
      name: 'Double Wedge & Vertical Load Lift Mechanism',
      type: 'Simple Machine with Multi-Friction Interfaces',
      description: 'Lifting mechanism converting horizontal hydraulic effort into vertical elevation with friction.',
      properties: {
        'Wedge Angle (α)': `${this.wedgeAngleDeg.toFixed(1)}°`,
        'Friction Angle (Φ)': `${THREE.MathUtils.radToDeg(phi).toFixed(1)}° (μ = ${this.muFriction.toFixed(2)})`,
        'Self-Locking Angle Threshold (2Φ)': `${THREE.MathUtils.radToDeg(2 * phi).toFixed(1)}°`,
        'Load Mass (W = mg)': `${W.toFixed(0)} N (${this.loadMassKg.toFixed(0)} kg)`,
        'Ideal Lifting Effort (P_ideal)': `${(W * Math.tan(alpha)).toFixed(0)} N`,
        'Actual Lifting Effort (P)': `${pLift.toFixed(0)} N`,
        'Withdrawal Force (P\')': `${pWithdraw.toFixed(0)} N`,
        'Self-Locking Status': isSelfLocking ? 'YES (Self-Locking)' : 'NO (Unstable / Back-drivable)',
        'Mechanical Efficiency (η)': `${efficiency.toFixed(1)}%`,
        'Current Vertical Lift (Δy)': `${(liftY * 1000).toFixed(0)} mm`,
      },
    };

    this.metrics['Wedge Angle α'] = `${this.wedgeAngleDeg.toFixed(1)}°`;
    this.metrics['Load Weight W'] = `${W.toFixed(0)} N`;
    this.metrics['Lifting Effort P'] = `${pLift.toFixed(0)} N`;
    this.metrics['Withdrawal P\''] = `${pWithdraw.toFixed(0)} N`;
    this.metrics['Efficiency η'] = `${efficiency.toFixed(1)}%`;
    this.metrics['Self-Locking'] = isSelfLocking ? 'YES (α < 2Φ)' : 'NO (α > 2Φ)';
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying) {
      const speed = 0.4 * deltaSeconds * this.playbackSpeed;
      if (!this.isWithdrawalMode) {
        // Pushing in
        this.wedgeDisplacementX += speed;
        if (this.wedgeDisplacementX > this.wedgeMaxStroke) {
          this.wedgeDisplacementX = this.wedgeMaxStroke;
          this.pause();
        }
      } else {
        // Withdrawing
        this.wedgeDisplacementX -= speed;
        if (this.wedgeDisplacementX < 0) {
          this.wedgeDisplacementX = 0;
          this.pause();
        }
      }
      this.recalculateAndRender();
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.wedgeDisplacementX = 0.0;
    this.recalculateAndRender();
  }
}
