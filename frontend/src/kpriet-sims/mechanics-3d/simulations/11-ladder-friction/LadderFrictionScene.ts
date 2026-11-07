/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Simulation 11: Ladder Friction
 * Unit IV: Friction
 *
 * Demonstrates:
 * - Equilibrium of non-concurrent force systems under dry friction constraints
 * - Normal reactions and friction forces at wall (B) and floor (A)
 * - Moment equilibrium about base: ΣM_A = 0
 * - Effect of climber position x along the ladder on limiting friction threshold
 * - Critical slip condition and safety factor FS against ladder slide-out
 */

import * as THREE from 'three';
import { BaseMechanicsSimulation } from '../../core/BaseMechanicsSimulation';
import type { SimulationOptions } from '../../core/types';
import { MechanicalBuilder } from '../../core/MechanicalBuilder';
import { VectorRenderer } from '../../core/VectorRenderer';

export class LadderFrictionScene extends BaseMechanicsSimulation {
  private ladderGroup = new THREE.Group();
  private vectorGroup = new THREE.Group();
  private wallMesh!: THREE.Mesh;
  private climberMesh!: THREE.Mesh;

  // Geometric & Physical Parameters
  private ladderLengthM = 5.0; // meters
  private ladderAngleDeg = 60.0; // inclination with horizontal
  private ladderMassKg = 30.0; // kg
  private climberMassKg = 75.0; // kg
  private climberPosM = 3.0; // distance along ladder from base (0 to L)
  private muFloor = 0.35;
  private muWall = 0.15; // wall friction (can be 0 for smooth wall)

  // Dynamic slip state
  private slipOffset = 0.0; // animates slip slide-out
  private isSlipped = false;

  private ladderSubGroup = new THREE.Group();

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    super(container, options);
    this.init();
  }

  protected initScene(): void {
    const ground = MechanicalBuilder.createGround(12, 12);
    ground.position.y = 0;
    this.scene.add(ground);

    // Vertical Brick/Concrete Wall at x = 0
    const wallGeo = new THREE.BoxGeometry(0.4, 6.0, 4.0);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Slate wall
      roughness: 0.8,
      metalness: 0.1,
    });
    this.wallMesh = new THREE.Mesh(wallGeo, wallMat);
    this.wallMesh.position.set(-0.2, 3.0, 0);
    this.wallMesh.castShadow = true;
    this.wallMesh.receiveShadow = true;
    this.scene.add(this.wallMesh);

    this.scene.add(this.ladderGroup);
    this.ladderGroup.add(this.ladderSubGroup);
    this.scene.add(this.vectorGroup);

    // Climber figure (stylized safety-suited engineer)
    const climberGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.7, 16);
    const climberMat = new THREE.MeshStandardMaterial({
      color: 0xea580c, // Safety Orange
      roughness: 0.5,
      metalness: 0.3,
    });
    this.climberMesh = new THREE.Mesh(climberGeo, climberMat);
    this.climberMesh.castShadow = true;

    // Climber helmet
    const headGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }); // Yellow hardhat
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.45;
    this.climberMesh.add(head);

    this.scene.add(this.climberMesh);

    this.parameters['ladderLength'] = 5.0;
    this.parameters['ladderAngle'] = 60.0;
    this.parameters['ladderMass'] = 30.0;
    this.parameters['climberMass'] = 75.0;
    this.parameters['climberPosition'] = 3.0;
    this.parameters['muFloor'] = 0.35;
    this.parameters['muWall'] = 0.15;

    this.buildLadder();
    this.recalculateAndRender();
  }

  private buildLadder(): void {
    // Dispose previous children
    while (this.ladderSubGroup.children.length > 0) {
      const child = this.ladderSubGroup.children[0] as THREE.Mesh;
      this.ladderSubGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    const railWidth = 0.5;
    const railThick = 0.08;
    const railGeo = new THREE.BoxGeometry(railThick, this.ladderLengthM, railThick);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Aluminium Slate
      metalness: 0.7,
      roughness: 0.3,
    });

    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(0, 0, -railWidth / 2);
    leftRail.castShadow = true;

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(0, 0, railWidth / 2);
    rightRail.castShadow = true;

    this.ladderSubGroup.add(leftRail);
    this.ladderSubGroup.add(rightRail);

    // Rungs along ladder
    const numRungs = Math.floor(this.ladderLengthM / 0.35);
    const rungGeo = new THREE.CylinderGeometry(0.025, 0.025, railWidth, 12);
    rungGeo.rotateX(Math.PI / 2);
    const rungMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

    for (let i = 1; i < numRungs; i++) {
      const rung = new THREE.Mesh(rungGeo, rungMat);
      rung.position.y = -this.ladderLengthM / 2 + (i * this.ladderLengthM) / numRungs;
      this.ladderSubGroup.add(rung);
    }
  }

  protected initStages(): void {
    this.stages = [
      {
        id: 'stage-ladder-setup',
        index: 0,
        title: 'Stage 1: System Geometry & Contact Points',
        shortDescription: 'Ladder of length L rests at angle θ between horizontal floor (Point A) and vertical wall (Point B).',
        detailedExplanation:
          'A ladder represents an archetypal non-concurrent planar mechanics problem. ' +
          'The base rests at point A on a floor with static friction coefficient μ_A. ' +
          'The top leans against a vertical wall at point B with friction coefficient μ_B. ' +
          'Both contact locations experience normal reaction forces perpendicular to the surfaces, plus tangent frictional forces.',
        principles: [
          'Horizontal Foot Coordinate: x_A = L · cos(θ)',
          'Vertical Wall Coordinate: y_B = L · sin(θ)',
        ],
        equations: [
          'x_A = L \\cdot \\cos\\theta',
          'y_B = L \\cdot \\sin\\theta',
        ],
        keyTerminology: [
          { term: 'Foot Contact (A)', definition: 'Point of support on the ground experiencing upward normal N_A and resisting friction F_A.' },
          { term: 'Wall Contact (B)', definition: 'Point of support on the vertical wall experiencing outward normal N_B and upward friction F_B.' },
        ],
        highlightComponentIds: ['ladder', 'foot-contact', 'wall-contact'],
        recommendedCamera: { position: [4.0, 3.2, 5.0], target: [1.2, 2.0, 0] },
      },
      {
        id: 'stage-moment-balance',
        index: 1,
        title: 'Stage 2: Moment Equilibrium About Base Point A',
        shortDescription: 'Apply ΣM_A = 0 to establish the relationship between weight moments and wall reaction N_B.',
        detailedExplanation:
          'Taking moments about base point A eliminates both base normal N_A and base friction F_A. ' +
          'Clockwise moments caused by ladder weight W_L (at L/2) and the climber W_p (at distance x) ' +
          'must be counteracted by anticlockwise moments from the wall contact reactions N_B and F_B.',
        principles: [
          'Moment of Ladder Weight: M_L = W_L · (L/2 · cos θ)',
          'Moment of Climber: M_p = W_p · (x · cos θ)',
          'Counteracting Moment: M_wall = N_B · (L · sin θ) + F_B · (L · cos θ)',
        ],
        equations: [
          '\\sum M_A = 0 \\implies N_B L \\sin\\theta + F_B L \\cos\\theta = W_L \\frac{L}{2}\\cos\\theta + W_p x \\cos\\theta',
        ],
        keyTerminology: [
          { term: 'Lever Arm', definition: 'Perpendicular distance from the line of action of each force to pivot point A.' },
          { term: 'Moment Center', definition: 'Point A chosen to eliminate unknown ground reactions from the moment equation.' },
        ],
        highlightComponentIds: ['climber', 'ladder'],
        recommendedCamera: { position: [3.2, 2.8, 4.5], target: [1.0, 1.8, 0] },
      },
      {
        id: 'stage-climber-ascend',
        index: 2,
        title: 'Stage 3: Load Position Effect on Required Friction',
        shortDescription: 'As the climber ascends higher (increasing x), the overturning moment rises, demanding higher base friction F_A.',
        detailedExplanation:
          'Because the climber\'s lever arm x · cos θ grows linearly with distance climbed, the wall reaction N_B ' +
          'must increase proportionally. From horizontal equilibrium (ΣF_x = 0), base friction F_A = N_B. ' +
          'Therefore, a ladder becomes significantly more prone to slipping as a worker ascends toward the top!',
        principles: [
          'Horizontal Equilibrium: F_A = N_B',
          'Linear Growth of Required Friction with Ascending Distance x',
        ],
        equations: [
          'F_{A,req} = N_B = \\frac{W_L/2 + W_p (x/L)}{\\tan\\theta + \\mu_B}',
        ],
        keyTerminology: [
          { term: 'Critical Climber Position (x_crit)', definition: 'The maximum height a person can reach before required friction exceeds available friction.' },
        ],
        highlightComponentIds: ['climber', 'friction-arrow'],
        recommendedCamera: { position: [3.5, 3.0, 4.5], target: [1.2, 2.0, 0] },
      },
      {
        id: 'stage-slip-condition',
        index: 3,
        title: 'Stage 4: Limiting Equilibrium & Slip Failure Criteria',
        shortDescription: 'When required friction F_A exceeds maximum available friction μ_A · N_A, catastrophic slipping occurs.',
        detailedExplanation:
          'Maximum available static friction at the floor is F_{A,max} = μ_A · N_A. ' +
          'The safety factor FS = F_{A,max} / F_{A,req}. If FS >= 1.0, the ladder is stable. ' +
          'If the ladder is inclined too flatly (small θ) or the climber goes beyond x_crit, FS drops below 1.0, ' +
          'and the base kicks violently outward while the top slides down the wall.',
        principles: [
          'Maximum Floor Friction: F_{A,max} = μ_A · N_A',
          'Factor of Safety: FS = F_{A,max} / F_{A,req}',
          'Safe Ladder Rule: Maintain inclination angle θ ≥ 75° (1:4 rule of OSHA standard)',
        ],
        equations: [
          'FS = \\frac{\\mu_A \\cdot N_A}{F_{A,req}} \\ge 1.0 \\quad (\\text{Stable})',
        ],
        keyTerminology: [
          { term: 'Factor of Safety (FS)', definition: 'Ratio of available friction capacity to the actual required resisting friction.' },
          { term: 'Slide-Out Failure', definition: 'Dynamic loss of contact equilibrium when floor friction capacity is exceeded.' },
        ],
        highlightComponentIds: ['ladder', 'foot-contact'],
        recommendedCamera: { position: [4.5, 3.2, 5.5], target: [1.2, 1.8, 0] },
      },
    ];
  }

  protected onStageChanged(stageIndex: number): void {
    if (stageIndex === 0) {
      this.ladderAngleDeg = 65.0;
      this.climberPosM = 1.2;
    } else if (stageIndex === 1) {
      this.ladderAngleDeg = 65.0;
      this.climberPosM = 2.5;
    } else if (stageIndex === 2) {
      this.ladderAngleDeg = 60.0;
      this.climberPosM = 3.6;
    } else if (stageIndex === 3) {
      this.ladderAngleDeg = 55.0;
      this.climberPosM = 4.4;
    }
    this.parameters['ladderAngle'] = this.ladderAngleDeg;
    this.parameters['climberPosition'] = this.climberPosM;
    this.slipOffset = 0.0;
    this.isSlipped = false;
    this.recalculateAndRender();
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    const num = Number(value);
    if (key === 'ladderLength') {
      this.ladderLengthM = Math.max(2.0, num);
      this.buildLadder();
    }
    if (key === 'ladderAngle') this.ladderAngleDeg = Math.min(85, Math.max(30, num));
    if (key === 'ladderMass') this.ladderMassKg = Math.max(5, num);
    if (key === 'climberMass') this.climberMassKg = Math.max(0, num);
    if (key === 'climberPosition') this.climberPosM = Math.min(this.ladderLengthM, Math.max(0, num));
    if (key === 'muFloor') this.muFloor = Math.max(0.05, num);
    if (key === 'muWall') this.muWall = Math.max(0.0, num);

    this.slipOffset = 0.0;
    this.isSlipped = false;
    this.recalculateAndRender();
  }

  private recalculateAndRender(): void {
    const rad = THREE.MathUtils.degToRad(this.ladderAngleDeg);
    const g = 9.81;

    const W_L = this.ladderMassKg * g;
    const W_p = this.climberMassKg * g;
    const W_tot = W_L + W_p;

    // Kinematic coordinates of foot (A) and top (B)
    const baseEffectiveX = this.ladderLengthM * Math.cos(rad) + this.slipOffset;
    const topEffectiveY = Math.max(0.1, this.ladderLengthM * Math.sin(rad) - this.slipOffset * Math.tan(rad));

    // Physics solution for reactions
    const tanTheta = Math.tan(rad);
    const xRatio = this.climberPosM / this.ladderLengthM;

    // N_B = [W_L/2 + W_p * xRatio] / (tanθ + μ_wall)
    const denom = tanTheta + this.muWall;
    const N_B = ((W_L * 0.5 + W_p * xRatio) / denom);
    const F_B = this.muWall * N_B;

    const N_A = W_tot - F_B;
    const F_A_req = N_B;
    const F_A_max = this.muFloor * N_A;

    const safetyFactor = F_A_max / Math.max(0.01, F_A_req);
    this.isSlipped = safetyFactor < 1.0;

    // Critical climber position where safetyFactor = 1.0
    const N_B_crit = (this.muFloor * W_tot) / (1 + this.muFloor * this.muWall);
    let x_crit = 0;
    if (W_p > 0) {
      const xRatioCrit = (N_B_crit * (tanTheta + this.muWall) - W_L * 0.5) / W_p;
      x_crit = Math.max(0, Math.min(this.ladderLengthM, xRatioCrit * this.ladderLengthM));
    } else {
      x_crit = this.ladderLengthM;
    }

    const footPos = new THREE.Vector3(baseEffectiveX, 0, 0);
    const topPos = new THREE.Vector3(0, topEffectiveY, 0);

    const ladderDir = new THREE.Vector3().subVectors(topPos, footPos).normalize();
    const ladderCenter = new THREE.Vector3().addVectors(footPos, topPos).multiplyScalar(0.5);

    // Orient existing 3D ladder group without reallocating geometries
    this.ladderSubGroup.position.copy(ladderCenter);
    const upVector = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, ladderDir);
    this.ladderSubGroup.setRotationFromQuaternion(quaternion);

    // Position Climber
    const climberWorldPos = footPos.clone().add(ladderDir.clone().multiplyScalar(this.climberPosM));
    climberWorldPos.z = 0;
    this.climberMesh.position.copy(climberWorldPos);

    // Clear and redraw vector arrows
    this.vectorGroup.clear();

    // 1. Normal Floor Reaction N_A (Up)
    const nALen = Math.min(2.0, Math.max(0.4, (N_A / 1000) * 1.6));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: footPos,
        direction: new THREE.Vector3(0, 1, 0),
        length: nALen,
        color: 0x16a34a, // Green
      })
    );

    // 2. Floor Friction F_A (pointing toward wall / left: -X)
    const fALen = Math.min(1.8, Math.max(0.3, (F_A_req / 1000) * 1.6));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: footPos,
        direction: new THREE.Vector3(-1, 0, 0),
        length: fALen,
        color: 0xd97706, // Amber
      })
    );

    // 3. Wall Reaction N_B (pointing away from wall / right: +X)
    const nBLen = Math.min(1.8, Math.max(0.3, (N_B / 1000) * 1.6));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: topPos,
        direction: new THREE.Vector3(1, 0, 0),
        length: nBLen,
        color: 0x2563eb, // Blue
      })
    );

    // 4. Climber Weight (Down)
    const wPLen = Math.min(1.8, Math.max(0.4, (W_p / 1000) * 1.6));
    this.vectorGroup.add(
      VectorRenderer.createArrow({
        origin: climberWorldPos,
        direction: new THREE.Vector3(0, -1, 0),
        length: wPLen,
        color: 0xef4444, // Red
      })
    );

    // Annotations
    this.annotations.clear();
    this.annotations.add({
      id: 'safety-status',
      title: this.isSlipped ? 'FAILURE: Slipped / Slide-Out' : `Stable (FS = ${safetyFactor.toFixed(2)})`,
      text: this.isSlipped
        ? `Required friction (${F_A_req.toFixed(0)} N) > Available (${F_A_max.toFixed(0)} N)`
        : `Floor friction margin: ${((1 - 1 / safetyFactor) * 100).toFixed(0)}% safety reserve`,
      worldPosition: climberWorldPos.clone().add(new THREE.Vector3(0.5, 0.5, 0)),
      type: this.isSlipped ? 'danger' : 'success',
      category: 'Stability',
    });

    this.annotations.add({
      id: 'foot-reactions',
      title: 'Floor Reactions (Point A)',
      text: `N_A = ${N_A.toFixed(0)} N | F_A = ${F_A_req.toFixed(0)} N (Max: ${F_A_max.toFixed(0)} N)`,
      worldPosition: footPos.clone().add(new THREE.Vector3(0.3, 0.4, 0)),
      type: 'info',
      category: 'Reactions',
    });

    this.annotations.add({
      id: 'wall-reactions',
      title: 'Wall Reactions (Point B)',
      text: `N_B = ${N_B.toFixed(0)} N | F_B = ${F_B.toFixed(0)} N`,
      worldPosition: topPos.clone().add(new THREE.Vector3(0.4, -0.2, 0)),
      type: 'info',
      category: 'Reactions',
    });

    this.inspectedComponent = {
      id: 'ladder',
      name: 'Leaning Industrial Ladder',
      type: 'Rigid Non-Concurrent Body',
      description: 'Standard 2-point supported structural member subject to dry friction constraints.',
      properties: {
        'Inclination Angle (θ)': `${this.ladderAngleDeg.toFixed(1)}°`,
        'Ladder Length (L)': `${this.ladderLengthM.toFixed(1)} m`,
        'Total Mass (Ladder + Climber)': `${(this.ladderMassKg + this.climberMassKg).toFixed(0)} kg`,
        'Climber Position (x)': `${this.climberPosM.toFixed(2)} m (${((this.climberPosM / this.ladderLengthM) * 100).toFixed(0)}% of length)`,
        'Critical Climber Height (x_crit)': `${x_crit.toFixed(2)} m`,
        'Floor Normal Reaction (N_A)': `${N_A.toFixed(1)} N`,
        'Required Floor Friction (F_A)': `${F_A_req.toFixed(1)} N`,
        'Max Available Floor Friction (F_A,max)': `${F_A_max.toFixed(1)} N`,
        'Wall Reaction (N_B)': `${N_B.toFixed(1)} N`,
        'Factor of Safety (FS)': safetyFactor.toFixed(2),
        'Status': this.isSlipped ? 'UNSTABLE (SLIPPED)' : 'SAFE EQUILIBRIUM',
      },
    };

    this.metrics['Ladder Angle'] = `${this.ladderAngleDeg.toFixed(1)}°`;
    this.metrics['Climber Position'] = `${this.climberPosM.toFixed(1)} m`;
    this.metrics['Floor Reaction N_A'] = `${N_A.toFixed(0)} N`;
    this.metrics['Floor Friction F_A'] = `${F_A_req.toFixed(0)} N`;
    this.metrics['Safety Factor'] = safetyFactor.toFixed(2);
    this.metrics['Status'] = this.isSlipped ? 'SLIPPED' : 'SAFE';
    this.notifyState();
  }

  public update(deltaSeconds: number): void {
    super.update(deltaSeconds);

    if (this.isPlaying && this.isSlipped) {
      // Animate catastrophic slide-out
      this.slipOffset += 1.2 * deltaSeconds * this.playbackSpeed;
      if (this.slipOffset > 1.8) {
        this.slipOffset = 1.8;
      }
      this.recalculateAndRender();
    }
  }

  public resetExperiment(): void {
    super.resetExperiment();
    this.slipOffset = 0.0;
    this.isSlipped = false;
    this.recalculateAndRender();
  }
}
