/**
 * 3D Drilling, Milling, and Shaping Machines Comparison Scene (Unit III / Exp 3 & 4)
 * Visualizes kinematic cutting motion vs feed motion for each fundamental machine tool.
 */

import * as THREE from 'three';
import { BaseMachiningSimulation } from '../BaseMachiningSimulation';
import type { MachineToolType, MillingOperationType, MillingFeedMode, DrillingOperationType } from '../../core/types';

export class MachineToolsComparisonScene extends BaseMachiningSimulation {
  private activeMachine: MachineToolType = 'drilling';
  private drillGroup = new THREE.Group();
  private millGroup = new THREE.Group();
  private shaperGroup = new THREE.Group();

  // Drilling components
  private drillBitMesh!: THREE.Mesh;
  private drillWorkpieceMesh!: THREE.Mesh;
  private drillHoleMesh!: THREE.Mesh;
  private drillSpindleGroup = new THREE.Group();
  private drillProgress = 0;

  // Milling components
  private millCutterMesh!: THREE.Mesh;
  private millTableGroup = new THREE.Group();
  private millWorkpieceMesh!: THREE.Mesh;
  private millCutStepMesh!: THREE.Mesh;
  private millProgress = 0;

  // Shaping components
  private shaperRamGroup = new THREE.Group();
  private shaperClapperBox!: THREE.Mesh;
  private shaperToolMesh!: THREE.Mesh;
  private shaperTableGroup = new THREE.Group();
  private shaperWorkpieceMesh!: THREE.Mesh;
  private shaperCutSurfaceMesh!: THREE.Mesh;
  private shaperCycleTime = 0;

  // Parameters
  private isRunning = true;
  private drillDiameterMm = 20;
  private drillDepthMm = 45;
  private drillFeedMmRev = 0.2;
  private drillRpm = 480;

  private millCutterDiameterMm = 80;
  private millDepthOfCutMm = 3;
  private millWidthOfCutMm = 50;
  private millRpm = 350;
  private millFeedMode: MillingFeedMode = 'up-milling';
  private millOperation: MillingOperationType = 'face-milling';

  private shaperStrokeLengthMm = 200;
  private shaperStrokesPerMin = 40;
  private shaperFeedMmStroke = 0.5;
  private shaperDepthMm = 2.0;

  constructor(container: HTMLElement) {
    super(container);
    this.scene.add(this.drillGroup, this.millGroup, this.shaperGroup);
    this.buildDrillingMachine();
    this.buildMillingMachine();
    this.buildShapingMachine();
    this.setActiveMachine('drilling');
  }

  public setActiveMachine(machine: MachineToolType): void {
    this.activeMachine = machine;
    this.drillGroup.visible = machine === 'drilling';
    this.millGroup.visible = machine === 'milling';
    this.shaperGroup.visible = machine === 'shaping';

    if (machine === 'drilling') {
      this.resetCamera(13, 3.2, Math.PI / 4, Math.PI / 3.6);
    } else if (machine === 'milling') {
      this.resetCamera(15, 3.0, Math.PI / 3.5, Math.PI / 3.2);
    } else {
      this.resetCamera(14, 2.8, Math.PI / 3.2, Math.PI / 3.2);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. DRILLING MACHINE (Pillar Drill Press)
  // ─────────────────────────────────────────────────────────────
  private buildDrillingMachine(): void {
    // Heavy Base
    const baseGeo = new THREE.BoxGeometry(3.6, 0.6, 4.4);
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
    const base = new THREE.Mesh(baseGeo, ironMat);
    base.position.set(0, 0.3, 0);
    this.drillGroup.add(base);

    // Cylindrical Column (Z-pillar)
    const colGeo = new THREE.CylinderGeometry(0.5, 0.5, 8.0, 32);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.85 });
    const column = new THREE.Mesh(colGeo, colMat);
    column.position.set(0, 4.0, -1.4);
    this.drillGroup.add(column);

    // Adjustable Drill Table (clamped on column)
    const tableArmGeo = new THREE.BoxGeometry(1.4, 0.5, 2.2);
    const tableArm = new THREE.Mesh(tableArmGeo, ironMat);
    tableArm.position.set(0, 2.2, -0.6);
    this.drillGroup.add(tableArm);

    const tableGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 32);
    const tableTop = new THREE.Mesh(tableGeo, ironMat);
    tableTop.position.set(0, 2.5, 0.2);
    this.drillGroup.add(tableTop);

    // Machine Vise on Table
    const viseGeo = new THREE.BoxGeometry(1.6, 0.6, 1.4);
    const viseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const vise = new THREE.Mesh(viseGeo, viseMat);
    vise.position.set(0, 2.9, 0.2);
    this.drillGroup.add(vise);

    // Workpiece Block held in Vise
    const workGeo = new THREE.BoxGeometry(1.8, 1.2, 1.6);
    const workMat = new THREE.MeshStandardMaterial({ color: 0x8a929a, metalness: 0.85, roughness: 0.35 });
    this.drillWorkpieceMesh = new THREE.Mesh(workGeo, workMat);
    this.drillWorkpieceMesh.position.set(0, 3.6, 0.2);
    this.drillGroup.add(this.drillWorkpieceMesh);

    // Visual Hole Cylinder (dark metallic interior that grows deeper)
    const holeGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 24);
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    this.drillHoleMesh = new THREE.Mesh(holeGeo, holeMat);
    this.drillHoleMesh.position.set(0, 4.2, 0.2);
    this.drillHoleMesh.scale.set(1, 0.01, 1);
    this.drillGroup.add(this.drillHoleMesh);

    // Drill Head (Top gearbox with motor)
    const headGeo = new THREE.BoxGeometry(2.4, 1.8, 3.8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 7.2, -0.6);
    this.drillGroup.add(head);

    // Feed Handwheel with 3 spokes
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const handleGroup = new THREE.Group();
    handleGroup.position.set(1.3, 6.8, 0.2);
    for (let s = 0; s < 3; s++) {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 12), spokeMat);
      spoke.rotation.x = (s * 2 * Math.PI) / 3;
      handleGroup.add(spoke);
    }
    this.drillGroup.add(handleGroup);

    // Spindle Quill & Chuck
    this.drillSpindleGroup.position.set(0, 6.2, 0.2);
    this.drillGroup.add(this.drillSpindleGroup);

    const quillGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.4, 24);
    const quillMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.9, roughness: 0.1 });
    const quill = new THREE.Mesh(quillGeo, quillMat);
    this.drillSpindleGroup.add(quill);

    const drillChuckGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.8, 24);
    const drillChuck = new THREE.Mesh(drillChuckGeo, ironMat);
    drillChuck.position.y = -0.9;
    this.drillSpindleGroup.add(drillChuck);

    // High Speed Steel Twist Drill Bit (Helical Flutes)
    const bitLength = 1.8;
    const bitGeo = new THREE.CylinderGeometry(0.2, 0.2, bitLength, 16);
    const bitMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    this.drillBitMesh = new THREE.Mesh(bitGeo, bitMat);
    this.drillBitMesh.position.y = -2.0;
    this.drillSpindleGroup.add(this.drillBitMesh);

    // 118° Drill Conical Chisel Edge Tip
    const tipGeo = new THREE.ConeGeometry(0.2, 0.24, 16);
    const tip = new THREE.Mesh(tipGeo, bitMat);
    tip.rotation.x = Math.PI;
    tip.position.y = -bitLength / 2 - 0.12;
    this.drillBitMesh.add(tip);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MILLING MACHINE (Knee & Column Milling Machine)
  // ─────────────────────────────────────────────────────────────
  private buildMillingMachine(): void {
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.5 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    // Base & Heavy Column
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, 5.2), ironMat);
    base.position.set(0, 0.3, 0);
    this.millGroup.add(base);

    const col = new THREE.Mesh(new THREE.BoxGeometry(2.4, 6.8, 4.0), new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.4, metalness: 0.6 }));
    col.position.set(0, 3.6, -1.0);
    this.millGroup.add(col);

    // Overarm bridging forward
    const overarm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 3.8), ironMat);
    overarm.position.set(0, 6.8, 0.2);
    this.millGroup.add(overarm);

    // Knee elevating slide
    const knee = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 3.0), ironMat);
    knee.position.set(0, 2.8, 0.5);
    this.millGroup.add(knee);

    // Saddle & T-slotted Machine Table (moves along X axis)
    this.millTableGroup.position.set(0, 3.9, 0.8);
    this.millGroup.add(this.millTableGroup);

    const tableGeo = new THREE.BoxGeometry(5.4, 0.4, 1.8);
    const tableMesh = new THREE.Mesh(tableGeo, steelMat);
    this.millTableGroup.add(tableMesh);

    // Workpiece Block mounted on table
    const workGeo = new THREE.BoxGeometry(2.6, 1.0, 1.4);
    const workMat = new THREE.MeshStandardMaterial({ color: 0x8a929a, metalness: 0.85, roughness: 0.35 });
    this.millWorkpieceMesh = new THREE.Mesh(workGeo, workMat);
    this.millWorkpieceMesh.position.set(0, 0.7, 0);
    this.millTableGroup.add(this.millWorkpieceMesh);

    // Milled Surface Shoulder Step (shows metal removal)
    const cutStepGeo = new THREE.BoxGeometry(1.2, 0.3, 1.4);
    const cutStepMat = new THREE.MeshStandardMaterial({ color: 0xd4d8dd, metalness: 0.95, roughness: 0.15 });
    this.millCutStepMesh = new THREE.Mesh(cutStepGeo, cutStepMat);
    this.millCutStepMesh.position.set(0.6, 1.1, 0);
    this.millTableGroup.add(this.millCutStepMesh);

    // Spindle / Arbor with Multi-Tooth Milling Cutter
    const arbor = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.6, 24), steelMat);
    arbor.position.set(0, 5.6, 0.8);
    this.millGroup.add(arbor);

    // Face / Plain Milling Cutter with Teeth
    const cutterGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.7, 24);
    const cutterMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.25 });
    this.millCutterMesh = new THREE.Mesh(cutterGeo, cutterMat);
    this.millCutterMesh.position.set(0, 4.6, 0.8);
    this.millGroup.add(this.millCutterMesh);

    // Radial Cutting Teeth inserts around circumference
    for (let t = 0; t < 12; t++) {
      const angle = (t * 2 * Math.PI) / 12;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.22), steelMat);
      tooth.position.set(Math.cos(angle) * 0.8, 0, Math.sin(angle) * 0.8);
      tooth.rotation.y = angle;
      this.millCutterMesh.add(tooth);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. SHAPING MACHINE (Crank & Slotted Lever Shaper)
  // ─────────────────────────────────────────────────────────────
  private buildShapingMachine(): void {
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.5 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    // Shaper Base & Column housing Bull Gear and Slotted Link
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.6, 3.6), ironMat);
    base.position.set(0, 0.3, 0);
    this.shaperGroup.add(base);

    const col = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.2, 2.8), new THREE.MeshStandardMaterial({ color: 0x4338ca, roughness: 0.5, metalness: 0.6 }));
    col.position.set(-0.8, 2.6, 0);
    this.shaperGroup.add(col);

    // Work Table with Box Cross-Feed Support (moves along Z axis)
    this.shaperTableGroup.position.set(1.5, 2.2, 0);
    this.shaperGroup.add(this.shaperTableGroup);

    const tblGeo = new THREE.BoxGeometry(1.8, 1.4, 2.0);
    const tableMesh = new THREE.Mesh(tblGeo, ironMat);
    this.shaperTableGroup.add(tableMesh);

    // Workpiece Block mounted in Shaper Vise
    const workGeo = new THREE.BoxGeometry(1.4, 0.7, 1.4);
    const workMat = new THREE.MeshStandardMaterial({ color: 0x8a929a, metalness: 0.85, roughness: 0.35 });
    this.shaperWorkpieceMesh = new THREE.Mesh(workGeo, workMat);
    this.shaperWorkpieceMesh.position.set(0, 1.0, 0);
    this.shaperTableGroup.add(this.shaperWorkpieceMesh);

    // Machined surface layer (shows metal peeled away by reciprocating tool)
    const cutSurfGeo = new THREE.BoxGeometry(1.4, 0.1, 1.4);
    const cutSurfMat = new THREE.MeshStandardMaterial({ color: 0xd4d8dd, metalness: 0.95, roughness: 0.15 });
    this.shaperCutSurfaceMesh = new THREE.Mesh(cutSurfGeo, cutSurfMat);
    this.shaperCutSurfaceMesh.position.set(0, 1.35, 0);
    this.shaperTableGroup.add(this.shaperCutSurfaceMesh);

    // Reciprocating Ram (moves horizontally along X axis)
    this.shaperRamGroup.position.set(0, 4.9, 0);
    this.shaperGroup.add(this.shaperRamGroup);

    const ramGeo = new THREE.BoxGeometry(5.2, 0.8, 1.8);
    const ramMesh = new THREE.Mesh(ramGeo, steelMat);
    this.shaperRamGroup.add(ramMesh);

    // Tool Head on front of Ram with Clapper Box & Tool Post
    const thGeo = new THREE.BoxGeometry(0.8, 1.2, 1.0);
    const thMesh = new THREE.Mesh(thGeo, ironMat);
    thMesh.position.set(2.6, -0.4, 0);
    this.shaperRamGroup.add(thMesh);

    // Hinged Clapper Box (swings forward on return stroke to prevent tool wear)
    const clapperGeo = new THREE.BoxGeometry(0.4, 0.8, 0.7);
    this.shaperClapperBox = new THREE.Mesh(clapperGeo, steelMat);
    this.shaperClapperBox.position.set(0.3, -0.2, 0);
    thMesh.add(this.shaperClapperBox);

    // Single point shaper tool bit
    const toolGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const toolMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    this.shaperToolMesh = new THREE.Mesh(toolGeo, toolMat);
    this.shaperToolMesh.position.set(0.15, -0.5, 0);
    this.shaperClapperBox.add(this.shaperToolMesh);
  }

  // ─────────────────────────────────────────────────────────────
  // ANIMATION LOOP
  // ─────────────────────────────────────────────────────────────
  public updateAnimation(delta: number, _elapsed: number): void {
    if (!this.isRunning) return;

    if (this.activeMachine === 'drilling') {
      // 1. Spindle continuous high speed rotation
      const rps = this.drillRpm / 60;
      this.drillSpindleGroup.rotation.y += delta * rps * 2 * Math.PI;

      // 2. Feed downwards into workpiece
      this.drillProgress += delta * 0.3;
      if (this.drillProgress > 1.0) this.drillProgress = 0;

      // Move drill spindle down
      const maxDown = 1.0;
      const currentDown = maxDown * this.drillProgress;
      this.drillSpindleGroup.position.y = 6.2 - currentDown;

      // Deepen hole
      this.drillHoleMesh.scale.y = Math.max(0.01, this.drillProgress);
      this.drillHoleMesh.position.y = 4.2 - (0.5 * this.drillProgress);

    } else if (this.activeMachine === 'milling') {
      // 1. Milling Cutter continuous rotation
      const rps = this.millRpm / 60;
      this.millCutterMesh.rotation.y += delta * rps * 2 * Math.PI;

      // 2. Table horizontal feed motion
      this.millProgress += delta * 0.2;
      if (this.millProgress > 1.0) this.millProgress = 0;

      // Move table along X axis
      this.millTableGroup.position.x = -1.5 + 3.0 * this.millProgress;

    } else if (this.activeMachine === 'shaping') {
      // Quick Return Mechanism Animation (cutting stroke vs return stroke)
      // Cycle: forward cutting (0 to 0.6) slow; return (0.6 to 1.0) fast (Ratio 1.5:1)
      const strokeSec = 60 / this.shaperStrokesPerMin;
      this.shaperCycleTime = (this.shaperCycleTime + delta) % strokeSec;
      const phase = this.shaperCycleTime / strokeSec;

      let ramX = 0;
      if (phase < 0.6) {
        // Forward cutting stroke: slow uniform motion forward (tool cutting metal)
        const p = phase / 0.6;
        ramX = -1.2 + 2.4 * p;
        this.shaperClapperBox.rotation.z = 0; // Clapper pressed tight against seat
      } else {
        // Quick return stroke: fast acceleration back (clapper box swings open)
        const p = (phase - 0.6) / 0.4;
        ramX = 1.2 - 2.4 * p;
        this.shaperClapperBox.rotation.z = 0.25; // Clapper lifts up slightly to clear work
      }

      this.shaperRamGroup.position.x = ramX;

      // Small table cross feed increment after each full stroke
      const totalCycleCount = Math.floor(this.clock.getElapsedTime() / strokeSec);
      this.shaperTableGroup.position.z = -0.5 + ((totalCycleCount * 0.05) % 1.0);
    }
  }

  public updateParameters(params: {
    machine?: MachineToolType;
    isRunning?: boolean;
    drillDiameterMm?: number;
    drillDepthMm?: number;
    drillRpm?: number;
    drillFeedMmRev?: number;
    millRpm?: number;
    millDepthOfCutMm?: number;
    millFeedMode?: MillingFeedMode;
    millOperation?: MillingOperationType;
    shaperStrokeLengthMm?: number;
    shaperStrokesPerMin?: number;
    shaperDepthMm?: number;
  }): void {
    if (params.machine) this.setActiveMachine(params.machine);
    if (params.isRunning !== undefined) this.isRunning = params.isRunning;
    if (params.drillDiameterMm !== undefined) this.drillDiameterMm = params.drillDiameterMm;
    if (params.drillDepthMm !== undefined) this.drillDepthMm = params.drillDepthMm;
    if (params.drillRpm !== undefined) this.drillRpm = params.drillRpm;
    if (params.drillFeedMmRev !== undefined) this.drillFeedMmRev = params.drillFeedMmRev;
    if (params.millRpm !== undefined) this.millRpm = params.millRpm;
    if (params.millDepthOfCutMm !== undefined) this.millDepthOfCutMm = params.millDepthOfCutMm;
    if (params.millFeedMode !== undefined) this.millFeedMode = params.millFeedMode;
    if (params.millOperation !== undefined) this.millOperation = params.millOperation;
    if (params.shaperStrokeLengthMm !== undefined) this.shaperStrokeLengthMm = params.shaperStrokeLengthMm;
    if (params.shaperStrokesPerMin !== undefined) this.shaperStrokesPerMin = params.shaperStrokesPerMin;
    if (params.shaperDepthMm !== undefined) this.shaperDepthMm = params.shaperDepthMm;
  }
}
