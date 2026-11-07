/**
 * 3D Lathe Machine and Turning Operations Simulation Scene (Unit II / Exp 1 & 2)
 * Fully modeled: Bed, Headstock, Chuck, Workpiece, Carriage, Cross-Slide, Compound Rest,
 * Tool Post, Cutting Tool, Tailstock, Lead Screw, and dynamic chip extrusion.
 */

import * as THREE from 'three';
import { BaseMachiningSimulation } from '../BaseMachiningSimulation';
import type { TurningOperation, WorkpieceMaterialId } from '../../core/types';
import { WORKPIECE_MATERIALS } from '../../core/MachiningMaterials';

export class LatheTurningScene extends BaseMachiningSimulation {
  // Machine Groups
  private machineRoot = new THREE.Group();
  private spindleGroup = new THREE.Group();
  private chuckMesh!: THREE.Mesh;
  private workpieceGroup = new THREE.Group();
  private workpieceRawMesh!: THREE.Mesh;
  private workpieceMachinedMesh!: THREE.Mesh;
  private workpieceShoulderMesh!: THREE.Mesh;
  private carriageGroup = new THREE.Group();
  private crossSlideGroup = new THREE.Group();
  private compoundRestGroup = new THREE.Group();
  private toolPostGroup = new THREE.Group();
  private toolMesh!: THREE.Mesh;
  private tailstockGroup = new THREE.Group();
  private leadScrewMesh!: THREE.Mesh;
  private chipParticles!: THREE.Points;
  private chipPositions!: Float32Array;

  // Process Parameters
  private operation: TurningOperation = 'plain-turning';
  private materialId: WorkpieceMaterialId = 'mild-steel';
  private isMachiningRunning = true;
  private rawDiameterMm = 50;
  private rawLengthMm = 180;
  private depthOfCutMm = 2.0;
  private feedMmRev = 0.25;
  private spindleSpeedRpm = 650;
  private cutLengthMm = 100;
  private taperAngleDeg = 8;

  // Tool Travel State
  private toolProgress = 0; // 0 to 1
  private spindleAngle = 0;
  private chipCount = 180;

  constructor(container: HTMLElement) {
    super(container);
    this.buildLatheMachine();
    this.resetCamera(15, 2.8, Math.PI / 3.8, Math.PI / 3.4);
  }

  private buildLatheMachine(): void {
    this.scene.add(this.machineRoot);

    // 1. Lathe Bed & Cast Iron Ways
    const bedLength = 12;
    const bedWidth = 3.6;
    const bedHeight = 1.4;

    const bedGeo = new THREE.BoxGeometry(bedLength, bedHeight, bedWidth);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.5,
    });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.set(1.5, bedHeight / 2, 0);
    bedMesh.castShadow = true;
    bedMesh.receiveShadow = true;
    this.machineRoot.add(bedMesh);

    // Bed Prismatic Guideway Inverted-V Rails (hardened steel finish)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.9,
    });
    const railGeo = new THREE.BoxGeometry(bedLength - 0.2, 0.12, 0.4);
    const frontRail = new THREE.Mesh(railGeo, railMat);
    frontRail.position.set(1.5, bedHeight + 0.06, 1.1);
    const rearRail = new THREE.Mesh(railGeo, railMat);
    rearRail.position.set(1.5, bedHeight + 0.06, -1.1);
    this.machineRoot.add(frontRail, rearRail);

    // Lathe Legs & Chip Pan Tray
    const legGeo = new THREE.BoxGeometry(1.6, 1.8, 3.2);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-3.5, 0.9, 0);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(6.5, 0.9, 0);
    this.machineRoot.add(leftLeg, rightLeg);

    // Chip Pan
    const panGeo = new THREE.BoxGeometry(bedLength + 1, 0.2, bedWidth + 1.2);
    const panMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.4 });
    const chipPan = new THREE.Mesh(panGeo, panMat);
    chipPan.position.set(1.5, 1.6, 0);
    this.machineRoot.add(chipPan);

    // 2. Headstock Casting
    const headGeo = new THREE.BoxGeometry(2.8, 3.0, 3.4);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // PiyushDhara Industrial Cyan Accent
      roughness: 0.4,
      metalness: 0.6,
    });
    const headstock = new THREE.Mesh(headGeo, headMat);
    headstock.position.set(-3.8, 3.0, 0);
    headstock.castShadow = true;
    this.machineRoot.add(headstock);

    // Speed levers on Headstock
    const leverGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12);
    const knobGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const leverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const knobMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });

    for (let i = 0; i < 3; i++) {
      const lever = new THREE.Mesh(leverGeo, leverMat);
      const knob = new THREE.Mesh(knobGeo, knobMat);
      knob.position.y = 0.35;
      lever.add(knob);
      lever.rotation.x = Math.PI / 2;
      lever.rotation.z = (i - 1) * 0.4;
      lever.position.set(-3.2 + (i - 1) * 0.5, 3.4, 1.75);
      this.machineRoot.add(lever);
    }

    // 3. Spindle & 3-Jaw Self-Centering Chuck
    const spindleAxisY = 3.2;
    this.spindleGroup.position.set(-2.4, spindleAxisY, 0);
    this.machineRoot.add(this.spindleGroup);

    // Chuck body (Cylinder along X axis)
    const chuckGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.9, 36);
    const chuckMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.3,
      metalness: 0.85,
    });
    this.chuckMesh = new THREE.Mesh(chuckGeo, chuckMat);
    this.chuckMesh.rotation.z = Math.PI / 2;
    this.spindleGroup.add(this.chuckMesh);

    // 3 Stepped Chuck Jaws (120° apart)
    const jawGeo = new THREE.BoxGeometry(0.3, 0.45, 0.5);
    const jawMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.9 });
    for (let j = 0; j < 3; j++) {
      const angle = (j * 2 * Math.PI) / 3;
      const jaw = new THREE.Mesh(jawGeo, jawMat);
      jaw.position.set(0.55, Math.cos(angle) * 0.9, Math.sin(angle) * 0.9);
      this.chuckMesh.add(jaw);
    }

    // 4. Workpiece (Rotates with Spindle)
    this.spindleGroup.add(this.workpieceGroup);
    this.updateWorkpieceMesh();

    // 5. Tailstock (Right end of Bed)
    this.tailstockGroup.position.set(6.0, 1.5, 0);
    this.machineRoot.add(this.tailstockGroup);

    const tsBaseGeo = new THREE.BoxGeometry(2.0, 1.2, 2.4);
    const tsBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const tsBase = new THREE.Mesh(tsBaseGeo, tsBaseMat);
    tsBase.position.y = 0.6;
    this.tailstockGroup.add(tsBase);

    // Tailstock Quill barrel along Spindle Axis
    const quillGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.4, 24);
    const quillMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.9, roughness: 0.15 });
    const quill = new THREE.Mesh(quillGeo, quillMat);
    quill.rotation.z = Math.PI / 2;
    quill.position.set(-0.8, spindleAxisY - 1.5, 0);
    this.tailstockGroup.add(quill);

    // 60° Conical Dead Centre tip
    const centreGeo = new THREE.ConeGeometry(0.35, 0.7, 24);
    const centreMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.95, roughness: 0.1 });
    const centre = new THREE.Mesh(centreGeo, centreMat);
    centre.rotation.z = Math.PI / 2;
    centre.position.set(-2.3, spindleAxisY - 1.5, 0);
    this.tailstockGroup.add(centre);

    // Tailstock Handwheel
    const hwGeo = new THREE.TorusGeometry(0.65, 0.08, 16, 32);
    const hwMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const handwheel = new THREE.Mesh(hwGeo, hwMat);
    handwheel.rotation.y = Math.PI / 2;
    handwheel.position.set(1.1, spindleAxisY - 1.5, 0);
    this.tailstockGroup.add(handwheel);

    // 6. Lead Screw & Feed Rod
    const screwGeo = new THREE.CylinderGeometry(0.1, 0.1, bedLength - 1, 16);
    const screwMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.3 });
    this.leadScrewMesh = new THREE.Mesh(screwGeo, screwMat);
    this.leadScrewMesh.rotation.z = Math.PI / 2;
    this.leadScrewMesh.position.set(1.5, 1.2, 1.6);
    this.machineRoot.add(this.leadScrewMesh);

    // 7. Carriage, Cross-Slide, Compound Rest & Tool Post
    this.carriageGroup.position.set(0, 1.5, 0);
    this.machineRoot.add(this.carriageGroup);

    // Saddle (H-shaped casting bridging the bed)
    const saddleGeo = new THREE.BoxGeometry(2.4, 0.5, 3.4);
    const saddleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const saddle = new THREE.Mesh(saddleGeo, saddleMat);
    saddle.position.y = 0.25;
    this.carriageGroup.add(saddle);

    // Apron (Front apron hanging below ways)
    const apronGeo = new THREE.BoxGeometry(2.2, 1.4, 0.6);
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, -0.6, 1.8);
    this.carriageGroup.add(apron);

    // Apron Handwheel
    const apronHw = new THREE.Mesh(hwGeo, hwMat);
    apronHw.scale.set(0.6, 0.6, 0.6);
    apronHw.position.set(-0.6, -0.6, 2.15);
    this.carriageGroup.add(apronHw);

    // Cross-Slide (moves along Z axis in Three.js coordinates)
    this.crossSlideGroup.position.set(0, 0.55, 0);
    this.carriageGroup.add(this.crossSlideGroup);

    const csGeo = new THREE.BoxGeometry(1.8, 0.35, 2.2);
    const csMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.35 });
    const csMesh = new THREE.Mesh(csGeo, csMat);
    this.crossSlideGroup.add(csMesh);

    // Compound Rest (rotatable circular base)
    this.compoundRestGroup.position.set(0, 0.25, 0.2);
    this.crossSlideGroup.add(this.compoundRestGroup);

    const crBaseGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
    const crBase = new THREE.Mesh(crBaseGeo, csMat);
    this.compoundRestGroup.add(crBase);

    const crTopGeo = new THREE.BoxGeometry(1.2, 0.3, 1.0);
    const crTop = new THREE.Mesh(crTopGeo, csMat);
    crTop.position.y = 0.25;
    this.compoundRestGroup.add(crTop);

    // 4-Way Quick-Change Tool Post
    this.toolPostGroup.position.set(0, 0.5, 0);
    this.compoundRestGroup.add(this.toolPostGroup);

    const tpGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const tpMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
    const toolPost = new THREE.Mesh(tpGeo, tpMat);
    this.toolPostGroup.add(toolPost);

    // Clamping handle on top
    const tpHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 12), leverMat);
    tpHandle.position.y = 0.6;
    this.toolPostGroup.add(tpHandle);

    // Lathe Tool Shank (HSS square shank) & Brazed Carbide Insert
    const toolShankGeo = new THREE.BoxGeometry(0.3, 0.3, 1.6);
    const toolShankMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    this.toolMesh = new THREE.Mesh(toolShankGeo, toolShankMat);
    this.toolMesh.position.set(0, 0.1, -0.7);
    this.toolPostGroup.add(this.toolMesh);

    // Gold/Yellow Titanium Nitride (TiN) coated carbide insert tip
    const insertGeo = new THREE.ConeGeometry(0.18, 0.35, 4);
    const insertMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Golden TiN
      metalness: 0.9,
      roughness: 0.2,
    });
    const insert = new THREE.Mesh(insertGeo, insertMat);
    insert.rotation.x = Math.PI / 2;
    insert.rotation.y = Math.PI / 4;
    insert.position.set(0, 0, -0.85);
    this.toolMesh.add(insert);

    // 8. Dynamic Curling Chips Particles
    this.setupChipParticles();
  }

  private setupChipParticles(): void {
    const pGeo = new THREE.BufferGeometry();
    this.chipPositions = new Float32Array(this.chipCount * 3);

    for (let i = 0; i < this.chipCount; i++) {
      const idx = i * 3;
      this.chipPositions[idx] = 0;
      this.chipPositions[idx + 1] = -100; // hidden initially
      this.chipPositions[idx + 2] = 0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.chipPositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.14,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.chipParticles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.chipParticles);
  }

  private updateWorkpieceMesh(): void {
    // Clear existing workpiece segments
    while (this.workpieceGroup.children.length > 0) {
      const child = this.workpieceGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      this.workpieceGroup.remove(child);
    }

    const matData = WORKPIECE_MATERIALS[this.materialId] || WORKPIECE_MATERIALS['mild-steel'];
    const workMat = new THREE.MeshStandardMaterial({
      color: matData.colorHex,
      roughness: matData.roughness,
      metalness: matData.metalness,
    });

    const machinedMat = new THREE.MeshStandardMaterial({
      color: matData.colorHex,
      roughness: 0.18,
      metalness: 0.92, // High specular finish on cut surface
    });

    const scale = 0.05; // 50mm -> 2.5 Three.js units
    const rawRadius = (this.rawDiameterMm / 2) * scale;
    const finalRadius = Math.max(0.2, (this.rawDiameterMm / 2 - this.depthOfCutMm) * scale);
    const totalLen = this.rawLengthMm * scale;
    const cutLen = Math.min(totalLen * 0.85, (this.cutLengthMm * scale) * this.toolProgress);
    const unmachinedLen = Math.max(0.1, totalLen - cutLen);

    // Segment 1: Unmachined Workpiece Stock (held at tailstock side)
    const rawGeo = new THREE.CylinderGeometry(rawRadius, rawRadius, unmachinedLen, 36);
    this.workpieceRawMesh = new THREE.Mesh(rawGeo, workMat);
    this.workpieceRawMesh.rotation.z = Math.PI / 2;
    this.workpieceRawMesh.position.set(cutLen + unmachinedLen / 2, 0, 0);
    this.workpieceRawMesh.castShadow = true;
    this.workpieceGroup.add(this.workpieceRawMesh);

    // Segment 2: Machined Workpiece Zone (Diameter reduced by 2 * depthOfCut)
    if (cutLen > 0.05) {
      let machGeo: THREE.BufferGeometry;

      if (this.operation === 'taper-turning') {
        const taperAngleRad = (this.taperAngleDeg * Math.PI) / 180;
        const taperEndRadius = Math.max(0.1, rawRadius - cutLen * Math.tan(taperAngleRad));
        machGeo = new THREE.CylinderGeometry(rawRadius, taperEndRadius, cutLen, 36);
      } else {
        machGeo = new THREE.CylinderGeometry(finalRadius, finalRadius, cutLen, 36);
      }

      this.workpieceMachinedMesh = new THREE.Mesh(machGeo, machinedMat);
      this.workpieceMachinedMesh.rotation.z = Math.PI / 2;
      this.workpieceMachinedMesh.position.set(cutLen / 2, 0, 0);
      this.workpieceMachinedMesh.castShadow = true;
      this.workpieceGroup.add(this.workpieceMachinedMesh);

      // Chamfered shoulder transition ring
      const shoulderGeo = new THREE.CylinderGeometry(rawRadius, finalRadius, 0.08, 36);
      this.workpieceShoulderMesh = new THREE.Mesh(shoulderGeo, machinedMat);
      this.workpieceShoulderMesh.rotation.z = Math.PI / 2;
      this.workpieceShoulderMesh.position.set(cutLen, 0, 0);
      this.workpieceGroup.add(this.workpieceShoulderMesh);
    }
  }

  public updateAnimation(delta: number, _elapsed: number): void {
    if (!this.isMachiningRunning) return;

    // 1. Spindle & Workpiece Continuous Rotation
    const revPerSec = this.spindleSpeedRpm / 60;
    this.spindleAngle += delta * revPerSec * 2 * Math.PI;
    this.spindleGroup.rotation.x = this.spindleAngle;
    this.leadScrewMesh.rotation.y += delta * revPerSec * Math.PI;

    // 2. Carriage & Tool Feed Advance
    const feedSpeedUnits = (this.feedMmRev * revPerSec * 0.05) * 0.8; // scaled feed rate
    this.toolProgress += (delta * feedSpeedUnits) / Math.max(1, this.cutLengthMm * 0.05);

    if (this.toolProgress > 1.0) {
      this.toolProgress = 0.0; // cycle back for continuous teaching demonstration
    }

    // 3. Update Carriage X Position & Cross-Slide Z Position according to Operation
    const scale = 0.05;
    const startX = -2.4 + (this.rawLengthMm * scale);
    const cutDist = (this.cutLengthMm * scale) * this.toolProgress;
    const toolX = -2.4 + cutDist;
    const rawR = (this.rawDiameterMm / 2) * scale;
    const cutR = (this.rawDiameterMm / 2 - this.depthOfCutMm) * scale;

    this.carriageGroup.position.x = toolX;

    if (this.operation === 'facing') {
      // Facing moves tool across Z axis into the face
      this.crossSlideGroup.position.z = rawR * (1 - this.toolProgress);
      this.carriageGroup.position.x = -2.4 + this.rawLengthMm * scale;
    } else if (this.operation === 'taper-turning') {
      const taperRad = (this.taperAngleDeg * Math.PI) / 180;
      this.crossSlideGroup.position.z = (rawR - cutDist * Math.tan(taperRad)) + 0.9;
    } else {
      this.crossSlideGroup.position.z = cutR + 0.9;
    }

    // 4. Update Workpiece Mesh Geometry
    this.updateWorkpieceMesh();

    // 5. Emit Curling Chip Stream from Tool Contact Point
    const contactX = toolX;
    const contactY = 3.2;
    const contactZ = this.crossSlideGroup.position.z - 0.9;

    const pos = this.chipPositions;
    if (pos && this.chipParticles) {
      for (let i = 0; i < this.chipCount; i++) {
        const idx = i * 3;
        const currentY = pos[idx + 1] ?? 0;
        if (currentY < 1.4) {
          // Respawn chip at tool cutting point
          pos[idx] = contactX + (Math.random() - 0.5) * 0.1;
          pos[idx + 1] = contactY + (Math.random() - 0.5) * 0.1;
          pos[idx + 2] = contactZ + (Math.random() - 0.5) * 0.1;
        } else {
          // Chip curls upwards then falls into chip tray
          pos[idx] = (pos[idx] ?? 0) - delta * 1.5;
          pos[idx + 1] = currentY - delta * 2.5;
          pos[idx + 2] = (pos[idx + 2] ?? 0) + delta * 1.8;
        }
      }
      const positionAttr = this.chipParticles.geometry.attributes.position;
      if (positionAttr) {
        positionAttr.needsUpdate = true;
      }
    }
  }

  public updateParameters(params: {
    operation?: TurningOperation;
    materialId?: WorkpieceMaterialId;
    rawDiameterMm?: number;
    rawLengthMm?: number;
    depthOfCutMm?: number;
    feedMmRev?: number;
    spindleSpeedRpm?: number;
    cutLengthMm?: number;
    taperAngleDeg?: number;
    isRunning?: boolean;
    resetProgress?: boolean;
  }): void {
    if (params.operation !== undefined) this.operation = params.operation;
    if (params.materialId !== undefined) this.materialId = params.materialId;
    if (params.rawDiameterMm !== undefined) this.rawDiameterMm = params.rawDiameterMm;
    if (params.rawLengthMm !== undefined) this.rawLengthMm = params.rawLengthMm;
    if (params.depthOfCutMm !== undefined) this.depthOfCutMm = params.depthOfCutMm;
    if (params.feedMmRev !== undefined) this.feedMmRev = params.feedMmRev;
    if (params.spindleSpeedRpm !== undefined) this.spindleSpeedRpm = params.spindleSpeedRpm;
    if (params.cutLengthMm !== undefined) this.cutLengthMm = params.cutLengthMm;
    if (params.taperAngleDeg !== undefined) this.taperAngleDeg = params.taperAngleDeg;
    if (params.isRunning !== undefined) this.isMachiningRunning = params.isRunning;
    if (params.resetProgress) this.toolProgress = 0;

    this.updateWorkpieceMesh();
  }
}
