/**
 * Interactive 3D CNC Machining Station
 * Displays machine table, workpiece, spindle, tool holder, carbide endmill,
 * animated 3-axis tool path, coordinate axes, and cutting indicators.
 */

import * as THREE from 'three';
import { BaseManufacturing2Scene } from './BaseManufacturing2Scene';
import type { CNCMachiningParams, ToolPathPoint } from '../core/types';

export class CNCMachiningScene extends BaseManufacturing2Scene {
  private machineGroup = new THREE.Group();
  private spindleGroup = new THREE.Group();
  private workpieceMesh!: THREE.Mesh;
  private toolMesh!: THREE.Mesh;
  private pathLine!: THREE.Line;
  private pathGeometry = new THREE.BufferGeometry();

  private toolPathPoints: ToolPathPoint[] = [];
  private currentStepIndex = 0;
  private isRunning = false;
  private playbackSpeed = 1.0;
  private toolPosition = new THREE.Vector3(0, 5, 0);

  // Sparks / chips particle system
  private chipsParticles!: THREE.Points;
  private chipsGeometry = new THREE.BufferGeometry();
  private chipVelocities: THREE.Vector3[] = [];

  constructor(container: HTMLElement) {
    super(container);
    this.cameraRadius = 12;
    this.cameraTarget.set(0, 1.5, 0);
    this.updateCameraPosition();
    this.buildCNCMachine();
  }

  private buildCNCMachine(): void {
    this.scene.add(this.machineGroup);

    // 1. Machine Bed Base (Cast iron grey)
    const bedGeo = new THREE.BoxGeometry(10, 0.8, 8);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = 0.4;
    bed.receiveShadow = true;
    this.machineGroup.add(bed);

    // 2. T-Slot Worktable (Ground steel)
    const tableGeo = new THREE.BoxGeometry(7, 0.4, 5);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.8 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 1.0;
    table.receiveShadow = true;
    this.machineGroup.add(table);

    // T-Slots grooved lines
    for (let z = -1.5; z <= 1.5; z += 1.0) {
      const slotGeo = new THREE.BoxGeometry(6.6, 0.05, 0.15);
      const slotMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(0, 1.21, z);
      this.machineGroup.add(slot);
    }

    // 3. Precision Machining Vise
    const viseGeo = new THREE.BoxGeometry(4.5, 0.6, 3.2);
    const viseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.7 });
    const vise = new THREE.Mesh(viseGeo, viseMat);
    vise.position.set(0, 1.5, 0);
    vise.castShadow = true;
    this.machineGroup.add(vise);

    // 4. Raw Workpiece (Aluminum alloy block)
    const wpGeo = new THREE.BoxGeometry(3.0, 1.0, 2.0);
    const wpMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.85,
    });
    this.workpieceMesh = new THREE.Mesh(wpGeo, wpMat);
    this.workpieceMesh.position.set(0, 2.3, 0);
    this.workpieceMesh.castShadow = true;
    this.workpieceMesh.receiveShadow = true;
    this.machineGroup.add(this.workpieceMesh);

    // 5. Spindle Head & Z-Axis Column
    this.scene.add(this.spindleGroup);

    const spindleBodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.0, 32);
    const spindleBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.6 });
    const spindleBody = new THREE.Mesh(spindleBodyGeo, spindleBodyMat);
    spindleBody.position.y = 2.0;
    this.spindleGroup.add(spindleBody);

    // Tool Holder (BT40 taper arbor)
    const holderGeo = new THREE.CylinderGeometry(0.5, 0.35, 1.0, 32);
    const holderMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.2, metalness: 0.9 });
    const holder = new THREE.Mesh(holderGeo, holderMat);
    holder.position.y = 0.2;
    this.spindleGroup.add(holder);

    // Solid Carbide Endmill Cutter
    const toolGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 16);
    const toolMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.95 });
    this.toolMesh = new THREE.Mesh(toolGeo, toolMat);
    this.toolMesh.position.y = -0.7;
    this.spindleGroup.add(this.toolMesh);

    // Coordinate Axes Helper at workpiece origin
    const axesHelper = new THREE.AxesHelper(1.8);
    axesHelper.position.set(0, 2.81, 0);
    this.machineGroup.add(axesHelper);

    // Tool Path Trajectory line
    const pathMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    this.pathLine = new THREE.Line(this.pathGeometry, pathMat);
    this.scene.add(this.pathLine);

    // Metal Chips Particle System
    const chipCount = 60;
    const chipPositions = new Float32Array(chipCount * 3);
    for (let i = 0; i < chipCount; i++) {
      chipPositions[i * 3] = 0;
      chipPositions[i * 3 + 1] = -100; // hide initially
      chipPositions[i * 3 + 2] = 0;
      this.chipVelocities.push(new THREE.Vector3());
    }
    this.chipsGeometry.setAttribute('position', new THREE.BufferAttribute(chipPositions, 3));
    const chipMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.08 });
    this.chipsParticles = new THREE.Points(this.chipsGeometry, chipMat);
    this.scene.add(this.chipsParticles);
  }

  public setToolPath(points: ToolPathPoint[]): void {
    this.toolPathPoints = points;
    this.currentStepIndex = 0;

    // Build static tool path line geometry
    const positions: number[] = [];
    points.forEach((p) => {
      // Scale mm coordinates to scene units (100mm = 2.5 scene units)
      const scale = 2.5 / 100;
      positions.push(p.x * scale, 2.8 + p.z * scale, p.y * scale);
    });

    this.pathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (points[0]) {
      const scale = 2.5 / 100;
      this.toolPosition.set(points[0].x * scale, 2.8 + points[0].z * scale, points[0].y * scale);
      this.spindleGroup.position.copy(this.toolPosition);
    }
  }

  public updateWorkpieceDimensions(params: CNCMachiningParams): void {
    const scale = 2.5 / 100;
    const w = params.workpieceLengthMM * scale;
    const h = params.workpieceHeightMM * scale;
    const d = params.workpieceWidthMM * scale;

    this.workpieceMesh.geometry.dispose();
    this.workpieceMesh.geometry = new THREE.BoxGeometry(w, h, d);
    this.workpieceMesh.position.y = 1.8 + h / 2;
  }

  public startMachining(): void {
    this.isRunning = true;
  }

  public pauseMachining(): void {
    this.isRunning = false;
  }

  public resetMachining(): void {
    this.isRunning = false;
    this.currentStepIndex = 0;
    if (this.toolPathPoints[0]) {
      const scale = 2.5 / 100;
      const p = this.toolPathPoints[0];
      this.toolPosition.set(p.x * scale, 2.8 + p.z * scale, p.y * scale);
      this.spindleGroup.position.copy(this.toolPosition);
    }
  }

  public setSpeed(speed: number): void {
    this.playbackSpeed = speed;
  }

  public getCurrentPoint(): ToolPathPoint | null {
    return this.toolPathPoints[this.currentStepIndex] || null;
  }

  public update(delta: number): void {
    // Spindle spinning animation
    if (this.isRunning) {
      this.toolMesh.rotation.y += 18 * delta;
    }

    if (!this.isRunning || this.toolPathPoints.length === 0) return;

    const targetPt = this.toolPathPoints[this.currentStepIndex];
    if (!targetPt) {
      this.isRunning = false;
      return;
    }

    const scale = 2.5 / 100;
    const targetPos = new THREE.Vector3(targetPt.x * scale, 2.8 + targetPt.z * scale, targetPt.y * scale);

    const stepSpeed = (targetPt.isCutting ? 2.5 : 8.0) * this.playbackSpeed;
    this.toolPosition.moveTowards(targetPos, stepSpeed * delta);
    this.spindleGroup.position.copy(this.toolPosition);

    // Chip generation when cutting
    if (targetPt.isCutting) {
      const posAttr = this.chipsGeometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < this.chipVelocities.length; i++) {
        const vel = this.chipVelocities[i];
        if (!vel) continue;
        if (Math.random() < 0.3) {
          arr[i * 3] = this.toolPosition.x;
          arr[i * 3 + 1] = this.toolPosition.y - 0.7;
          arr[i * 3 + 2] = this.toolPosition.z;
          vel.set(
            (Math.random() - 0.5) * 3,
            Math.random() * 2 + 1,
            (Math.random() - 0.5) * 3
          );
        } else {
          const x = arr[i * 3] ?? 0;
          const y = arr[i * 3 + 1] ?? 0;
          const z = arr[i * 3 + 2] ?? 0;
          arr[i * 3] = x + vel.x * delta;
          arr[i * 3 + 1] = y + vel.y * delta - 9.8 * delta * delta;
          arr[i * 3 + 2] = z + vel.z * delta;
        }
      }
      posAttr.needsUpdate = true;
    }

    if (this.toolPosition.distanceTo(targetPos) < 0.05) {
      this.currentStepIndex++;
      if (this.currentStepIndex >= this.toolPathPoints.length) {
        this.isRunning = false;
      }
    }
  }

  public override dispose(): void {
    super.dispose();
    this.pathGeometry.dispose();
    this.chipsGeometry.dispose();
  }
}

// Vector3 moveTowards helper
declare module 'three' {
  interface Vector3 {
    moveTowards(target: THREE.Vector3, maxDistanceDelta: number): this;
  }
}
THREE.Vector3.prototype.moveTowards = function (target: THREE.Vector3, maxDistanceDelta: number) {
  const diff = new THREE.Vector3().subVectors(target, this);
  const len = diff.length();
  if (len <= maxDistanceDelta || len === 0) {
    this.copy(target);
    return this;
  }
  return this.addScaledVector(diff, maxDistanceDelta / len);
};
