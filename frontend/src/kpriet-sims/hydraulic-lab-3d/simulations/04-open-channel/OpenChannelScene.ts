import * as THREE from 'three';
import { BaseHydraulicSimulation, type IApparatusComponent } from '../../core/BaseHydraulicSimulation';
import type { IOpenChannelInputs, IOpenChannelOutputs } from '../../core/types';
import { HydraulicCalculator } from '../../core/HydraulicCalculator';

export class OpenChannelScene extends BaseHydraulicSimulation {
  private flumeTiltGroup!: THREE.Group;
  private sluiceGateMesh!: THREE.Mesh;
  private supercriticalWaterMesh!: THREE.Mesh;
  private hydraulicJumpRollerMesh!: THREE.Mesh;
  private subcriticalWaterMesh!: THREE.Mesh;
  private hookGaugeGroup!: THREE.Group;
  private currentInputs: IOpenChannelInputs;
  private currentOutputs: IOpenChannelOutputs;

  constructor(
    container: HTMLElement,
    initialInputs: IOpenChannelInputs,
    onComponentSelected?: (comp: IApparatusComponent | null) => void
  ) {
    super(container, onComponentSelected);
    this.currentInputs = initialInputs;
    this.currentOutputs = HydraulicCalculator.calculateOpenChannel(initialInputs);

    this.buildApparatus();
    this.applyState(initialInputs);
  }

  private buildApparatus(): void {
    const apparatusRoot = new THREE.Group();
    apparatusRoot.position.set(0, 0.58, 0);

    // Tilting Flume Root
    this.flumeTiltGroup = new THREE.Group();

    // 1. Transparent Glass-Walled Flume Channel (2.2m long x 0.4m wide x 0.45m high)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.92,
      opacity: 0.95,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
    });
    const channelBedMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.3,
    });

    // Stainless steel channel bed
    const bedGeo = new THREE.BoxGeometry(2.2, 0.02, 0.35);
    const bedMesh = new THREE.Mesh(bedGeo, channelBedMat);
    bedMesh.position.y = 0.01;
    this.flumeTiltGroup.add(bedMesh);

    // Glass side walls
    const wallGeo = new THREE.BoxGeometry(2.2, 0.35, 0.015);
    const frontWall = new THREE.Mesh(wallGeo, glassMat);
    frontWall.position.set(0, 0.175, 0.175);
    this.flumeTiltGroup.add(frontWall);

    const backWall = new THREE.Mesh(wallGeo, glassMat);
    backWall.position.set(0, 0.175, -0.175);
    this.flumeTiltGroup.add(backWall);

    apparatusRoot.add(this.flumeTiltGroup);
    this.registerComponent(
      'tilting_flume',
      'Tilting Open-Channel Hydraulic Flume',
      this.flumeTiltGroup,
      'Laboratory rectangular flume with glass observation sidewalls and adjustable bed slope S₀ used for studying specific energy, critical flow, and hydraulic jump phenomena.',
      'Dimensions: 2200 × 350 × 350 mm | Bed Slope S₀: 0.05% to 3.0%',
      'Fr = V / √(g · y)'
    );

    // 2. Upstream Adjustable Sluice Gate
    const gateGroup = new THREE.Group();
    gateGroup.position.set(-0.75, 0, 0);

    const gatePlateGeo = new THREE.BoxGeometry(0.02, 0.32, 0.34);
    const gatePlateMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    this.sluiceGateMesh = new THREE.Mesh(gatePlateGeo, gatePlateMat);
    this.sluiceGateMesh.position.y = 0.22;
    gateGroup.add(this.sluiceGateMesh);

    // Gate lifting spindle and handwheel
    const spindleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 16);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.position.y = 0.38;
    gateGroup.add(spindle);

    const wheelGeo = new THREE.TorusGeometry(0.04, 0.008, 12, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.y = 0.48;
    gateGroup.add(wheel);

    this.flumeTiltGroup.add(gateGroup);
    this.registerComponent(
      'sluice_gate',
      'Sharp-Crested Sluice Gate',
      gateGroup,
      'Vertical undershot control gate producing supercritical shooting flow (Fr₁ > 1.0) with contracted depth y₁ = Cc · a downstream of the opening.',
      'Opening a: 20 to 150 mm | Contraction Coeff Cc ≈ 0.61'
    );

    // 3. Water Meshes (Supercritical Layer, Jump Roller, and Subcritical Tailwater)
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.75,
      transparent: true,
      roughness: 0.1,
      ior: 1.333,
    });

    // Supercritical rapid water layer (from gate -0.75m to jump start ~ -0.1m)
    const scGeo = new THREE.BoxGeometry(0.65, 0.04, 0.34);
    this.supercriticalWaterMesh = new THREE.Mesh(scGeo, waterMat);
    this.supercriticalWaterMesh.position.set(-0.425, 0.02, 0);
    this.flumeTiltGroup.add(this.supercriticalWaterMesh);

    // Hydraulic Jump Roller (turbulent aerated wedge)
    const rollerGeo = new THREE.BoxGeometry(0.4, 0.12, 0.34);
    const rollerMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.75,
      roughness: 0.5,
    });
    this.hydraulicJumpRollerMesh = new THREE.Mesh(rollerGeo, rollerMat);
    this.hydraulicJumpRollerMesh.position.set(0.1, 0.07, 0);
    this.flumeTiltGroup.add(this.hydraulicJumpRollerMesh);

    // Subcritical deeper tranquil tailwater (from jump to outlet 0.3m to 1.1m)
    const subGeo = new THREE.BoxGeometry(0.8, 0.16, 0.34);
    this.subcriticalWaterMesh = new THREE.Mesh(subGeo, waterMat);
    this.subcriticalWaterMesh.position.set(0.7, 0.09, 0);
    this.flumeTiltGroup.add(this.subcriticalWaterMesh);

    this.registerComponent(
      'hydraulic_jump',
      'Hydraulic Jump Phenomenon',
      this.hydraulicJumpRollerMesh,
      'Stationary hydraulic jump dissipating kinetic energy as rapid supercritical flow (Fr > 1) abruptly transitions to tranquil subcritical flow (Fr < 1) satisfying the Belanger conjugate depth relation.',
      'Conjugate Depth: y₂/y₁ = 0.5 · [√(1 + 8·Fr₁²) - 1] | Energy Loss: ΔE = (y₂ - y₁)³ / (4·y₁·y₂)',
      'Fr = V / √(g·y)'
    );

    // 4. Hook Depth Gauge for water surface level readings
    this.hookGaugeGroup = new THREE.Group();
    this.hookGaugeGroup.position.set(0.7, 0.25, 0);

    const gaugeStemGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.3, 16);
    const gaugeStemMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const gaugeStem = new THREE.Mesh(gaugeStemGeo, gaugeStemMat);
    this.hookGaugeGroup.add(gaugeStem);

    const micrometerHeadGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 24);
    const micrometerHeadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const micrometerHead = new THREE.Mesh(micrometerHeadGeo, micrometerHeadMat);
    micrometerHead.position.y = 0.16;
    this.hookGaugeGroup.add(micrometerHead);

    this.flumeTiltGroup.add(this.hookGaugeGroup);
    this.registerComponent(
      'hook_gauge',
      'Vernier Hook Gauge',
      this.hookGaugeGroup,
      'Precision micrometer hook gauge lowered to the water surface until the inverted point touches the meniscus, giving exact subcritical tailwater depth y₂.',
      'Precision: ±0.1 mm'
    );

    this.scene.add(apparatusRoot);
  }

  public applyState(inputs: IOpenChannelInputs): void {
    this.currentInputs = inputs;
    this.currentOutputs = HydraulicCalculator.calculateOpenChannel(inputs);

    // 1. Bed Slope Tilt (around left pivot)
    const slopeAngleRad = Math.atan(inputs.bedSlopePct / 100);
    this.flumeTiltGroup.rotation.z = -slopeAngleRad;

    // 2. Sluice Gate Opening
    const gateOpenY = Math.max(0.03, inputs.sluiceGateOpeningM * 1.5);
    this.sluiceGateMesh.position.y = 0.16 + gateOpenY;

    // 3. Supercritical depth y1
    const y1Vis = Math.max(0.015, Math.min(0.08, this.currentOutputs.initialDepthY1M * 1.5));
    this.supercriticalWaterMesh.scale.y = y1Vis / 0.04;
    this.supercriticalWaterMesh.position.y = y1Vis / 2 + 0.01;

    // 4. Subcritical conjugate depth y2
    const y2Vis = Math.max(0.04, Math.min(0.28, this.currentOutputs.conjugateDepthY2M * 1.4));
    this.subcriticalWaterMesh.scale.y = y2Vis / 0.16;
    this.subcriticalWaterMesh.position.y = y2Vis / 2 + 0.01;

    // 5. Jump Roller Wedge
    if (this.currentOutputs.hydraulicJumpOccurs) {
      this.hydraulicJumpRollerMesh.visible = true;
      const jumpHVis = y2Vis - y1Vis;
      this.hydraulicJumpRollerMesh.scale.y = Math.max(0.2, jumpHVis / 0.12);
      this.hydraulicJumpRollerMesh.position.y = y1Vis + jumpHVis / 2 + 0.01;
    } else {
      this.hydraulicJumpRollerMesh.visible = false;
    }

    // 6. Hook Gauge resting on subcritical water surface
    this.hookGaugeGroup.position.y = y2Vis + 0.12;
  }

  protected update(dt: number): void {
    // Animate jump roller foam agitation
    if (this.hydraulicJumpRollerMesh && this.hydraulicJumpRollerMesh.visible) {
      const time = performance.now() * 0.01;
      this.hydraulicJumpRollerMesh.position.y += Math.sin(time) * 0.001;
    }
  }

  public getOutputs(): IOpenChannelOutputs {
    return this.currentOutputs;
  }
}
