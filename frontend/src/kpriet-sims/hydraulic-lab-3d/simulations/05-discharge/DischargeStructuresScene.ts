import * as THREE from 'three';
import { BaseHydraulicSimulation, type IApparatusComponent } from '../../core/BaseHydraulicSimulation';
import type { IDischargeStructureInputs, IDischargeStructureOutputs } from '../../core/types';
import { HydraulicCalculator } from '../../core/HydraulicCalculator';

export class DischargeStructuresScene extends BaseHydraulicSimulation {
  private orificeTankMesh!: THREE.Mesh;
  private jetLineMesh!: THREE.Line;
  private vNotchPlateGroup!: THREE.Group;
  private nappeMesh!: THREE.Mesh;
  private currentInputs: IDischargeStructureInputs;
  private currentOutputs: IDischargeStructureOutputs;

  constructor(
    container: HTMLElement,
    initialInputs: IDischargeStructureInputs,
    onComponentSelected?: (comp: IApparatusComponent | null) => void
  ) {
    super(container, onComponentSelected);
    this.currentInputs = initialInputs;
    this.currentOutputs = HydraulicCalculator.calculateDischargeStructure(initialInputs);

    this.buildApparatus();
    this.applyState(initialInputs);
  }

  private buildApparatus(): void {
    const apparatusRoot = new THREE.Group();
    apparatusRoot.position.set(0, 0.55, 0);

    // 1. Constant-Head Supply Tank (Left side)
    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.88,
      transparent: true,
      roughness: 0.1,
      ior: 1.49,
    });
    const tankGeo = new THREE.BoxGeometry(0.5, 0.7, 0.4);
    this.orificeTankMesh = new THREE.Mesh(tankGeo, tankMat);
    this.orificeTankMesh.position.set(-0.6, 0.35, 0);
    apparatusRoot.add(this.orificeTankMesh);

    this.registerComponent(
      'constant_head_tank',
      'Constant-Head Orifice Supply Tank',
      this.orificeTankMesh,
      'Overhead constant-head tank with internal overflow weir maintaining a steady piezometric water head H over the orifice plate.',
      'Head Range H: 50 to 350 mm | Material: Acrylic Chamber',
      'v_th = √(2·g·H)'
    );

    // Circular Orifice Plate on front-right wall of tank
    const orificePlateGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.015, 24);
    const orificePlateMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
    const orificePlate = new THREE.Mesh(orificePlateGeo, orificePlateMat);
    orificePlate.rotation.z = Math.PI / 2;
    orificePlate.position.set(-0.35, 0.15, 0);
    apparatusRoot.add(orificePlate);

    this.registerComponent(
      'circular_orifice',
      'Sharp-Edged Circular Orifice Plate',
      orificePlate,
      'Standard sharp-beveled circular orifice plate (D = 20mm) discharging a free atmospheric jet with pronounced vena contracta.',
      'Diameter d₀: 20 mm | Bevel angle: 45° | Cd ≈ 0.62',
      'Q = Cd · a₀ · √(2·g·H)'
    );

    // 2. Parabolic Jet Trajectory Line Mesh
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      points.push(new THREE.Vector3(-0.34 + i * 0.04, 0.15 - Math.pow(i * 0.04, 2) * 0.8, 0));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3 });
    this.jetLineMesh = new THREE.Line(lineGeo, lineMat);
    apparatusRoot.add(this.jetLineMesh);

    // 3. V-Notch / Rectangular Weir Channel (Right side)
    this.vNotchPlateGroup = new THREE.Group();
    this.vNotchPlateGroup.position.set(0.4, 0.25, 0);

    const weirChannelGeo = new THREE.BoxGeometry(0.8, 0.35, 0.3);
    const weirChannelMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transmission: 0.9,
      transparent: true,
      roughness: 0.1,
    });
    const weirChannel = new THREE.Mesh(weirChannelGeo, weirChannelMat);
    this.vNotchPlateGroup.add(weirChannel);

    // Brass V-Notch Plate (90-degree triangular notch)
    const notchPlateGeo = new THREE.BoxGeometry(0.015, 0.3, 0.28);
    const notchPlateMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });
    const notchPlate = new THREE.Mesh(notchPlateGeo, notchPlateMat);
    notchPlate.position.set(0.38, 0.05, 0);
    this.vNotchPlateGroup.add(notchPlate);

    // Falling Liquid Nappe
    const nappeGeo = new THREE.ConeGeometry(0.08, 0.2, 16);
    const nappeMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.85,
      transparent: true,
      roughness: 0.1,
    });
    this.nappeMesh = new THREE.Mesh(nappeGeo, nappeMat);
    this.nappeMesh.rotation.z = Math.PI;
    this.nappeMesh.position.set(0.44, -0.05, 0);
    this.vNotchPlateGroup.add(this.nappeMesh);

    apparatusRoot.add(this.vNotchPlateGroup);
    this.registerComponent(
      'v_notch_weir',
      '90° Triangular V-Notch Weir Apparatus',
      this.vNotchPlateGroup,
      'Precision brass 90° V-notch weir plate providing accurate discharge measurement especially at low flow rates, governed by Thomson formula.',
      'Included angle: 90° | Crest Height: 150 mm | Cd ≈ 0.60',
      'Q = (8/15) · Cd · √(2g) · tan(θ/2) · H^(5/2)'
    );

    this.scene.add(apparatusRoot);
  }

  public applyState(inputs: IDischargeStructureInputs): void {
    this.currentInputs = inputs;
    this.currentOutputs = HydraulicCalculator.calculateDischargeStructure(inputs);

    // Update jet trajectory points based on actual calculated parabolic fall
    const traj = this.currentOutputs.jetTrajectoryPoints;
    if (traj && traj.length > 0) {
      const pts: THREE.Vector3[] = [];
      const startX = -0.34;
      const startY = 0.15;
      traj.forEach((pt) => {
        pts.push(new THREE.Vector3(startX + pt.x * 0.7, startY - pt.y * 0.6, 0));
      });
      this.jetLineMesh.geometry.setFromPoints(pts);
    }

    // Toggle structure visibility emphasis
    if (inputs.structureType === 'circular_orifice') {
      this.jetLineMesh.visible = true;
      this.nappeMesh.visible = false;
    } else {
      this.jetLineMesh.visible = false;
      this.nappeMesh.visible = true;

      // Nappe scale with head H
      const nappeScale = Math.min(2.0, Math.max(0.4, inputs.headOverCrestOrificeM / 0.1));
      this.nappeMesh.scale.set(nappeScale, nappeScale, nappeScale);
    }
  }

  protected update(dt: number): void {
    // Jet ripple effect
  }

  public getOutputs(): IDischargeStructureOutputs {
    return this.currentOutputs;
  }
}
