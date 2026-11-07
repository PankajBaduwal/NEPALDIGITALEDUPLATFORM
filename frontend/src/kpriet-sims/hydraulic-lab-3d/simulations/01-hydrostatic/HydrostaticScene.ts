import * as THREE from 'three';
import { BaseHydraulicSimulation, type IApparatusComponent } from '../../core/BaseHydraulicSimulation';
import type { IHydrostaticInputs, IHydrostaticOutputs } from '../../core/types';
import { HydraulicCalculator } from '../../core/HydraulicCalculator';

export class HydrostaticScene extends BaseHydraulicSimulation {
  private tankWaterMesh!: THREE.Mesh;
  private probeGroup!: THREE.Group;
  private submergedPlateGroup!: THREE.Group;
  private plateMesh!: THREE.Mesh;
  private centroidMarker!: THREE.Mesh;
  private copMarker!: THREE.Mesh;
  private forceArrowGroup!: THREE.Group;
  private currentInputs: IHydrostaticInputs;
  private currentOutputs: IHydrostaticOutputs;

  constructor(
    container: HTMLElement,
    initialInputs: IHydrostaticInputs,
    onComponentSelected?: (comp: IApparatusComponent | null) => void
  ) {
    super(container, onComponentSelected);
    this.currentInputs = initialInputs;
    this.currentOutputs = HydraulicCalculator.calculateHydrostatics(initialInputs);

    this.buildApparatus();
    this.applyState(initialInputs);
  }

  private buildApparatus(): void {
    const apparatusRoot = new THREE.Group();
    apparatusRoot.position.set(0, 0.54, 0);

    // 1. Transparent Acrylic Tank (1.2m long x 0.6m wide x 1.0m tall)
    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.88,
      opacity: 0.95,
      transparent: true,
      roughness: 0.1,
      ior: 1.49, // Acrylic
      metalness: 0.05,
    });

    const tankWalls = new THREE.Group();
    // Glass Box Walls (open top)
    const wallThickness = 0.02;
    const tankL = 1.0;
    const tankW = 0.6;
    const tankH = 0.9;

    // Bottom
    const bottomGeo = new THREE.BoxGeometry(tankL, wallThickness, tankW);
    const bottom = new THREE.Mesh(bottomGeo, tankMat);
    bottom.position.y = wallThickness / 2;
    tankWalls.add(bottom);

    // Front & Back
    const frontGeo = new THREE.BoxGeometry(tankL, tankH, wallThickness);
    const front = new THREE.Mesh(frontGeo, tankMat);
    front.position.set(0, tankH / 2, tankW / 2 - wallThickness / 2);
    tankWalls.add(front);

    const back = new THREE.Mesh(frontGeo, tankMat);
    back.position.set(0, tankH / 2, -tankW / 2 + wallThickness / 2);
    tankWalls.add(back);

    // Left & Right
    const sideGeo = new THREE.BoxGeometry(wallThickness, tankH, tankW - wallThickness * 2);
    const left = new THREE.Mesh(sideGeo, tankMat);
    left.position.set(-tankL / 2 + wallThickness / 2, tankH / 2, 0);
    tankWalls.add(left);

    const right = new THREE.Mesh(sideGeo, tankMat);
    right.position.set(tankL / 2 - wallThickness / 2, tankH / 2, 0);
    tankWalls.add(right);

    apparatusRoot.add(tankWalls);
    this.registerComponent(
      'tank_walls',
      'Acrylic Fluid Chamber',
      tankWalls,
      'High-clarity optical acrylic tank (1.0m × 0.6m × 0.9m) permitting distortion-free observation of submerged bodies and hydrostatic pressure regimes.',
      'Dimensions: 1000 × 600 × 900 mm | Material: Cast Acrylic (IOR 1.49)',
      'p = ρ · g · h'
    );

    // 2. Graduated Millimeter Depth Scale
    const scaleGroup = new THREE.Group();
    const ruleGeo = new THREE.BoxGeometry(0.04, tankH * 0.95, 0.005);
    const ruleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.3, roughness: 0.4 });
    const rule = new THREE.Mesh(ruleGeo, ruleMat);
    rule.position.set(-tankL / 2 + 0.05, tankH / 2, tankW / 2 - 0.03);
    scaleGroup.add(rule);

    // Graduation ticks
    for (let i = 0; i <= 10; i++) {
      const tickGeo = new THREE.BoxGeometry(0.02, 0.004, 0.008);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(-tankL / 2 + 0.05, (i / 10) * (tankH * 0.9) + 0.05, tankW / 2 - 0.025);
      scaleGroup.add(tick);
    }
    apparatusRoot.add(scaleGroup);
    this.registerComponent(
      'depth_scale',
      'Graduated Vertical Scale',
      scaleGroup,
      'Direct-reading vertical vernier depth gauge calibrated in millimeters to measure piezometric free surface height and sensor probe elevations.',
      'Resolution: 1.0 mm | Range: 0.0 to 1000.0 mm'
    );

    // 3. Dynamic Water Volume Mesh
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.75,
      opacity: 0.85,
      transparent: true,
      roughness: 0.08,
      ior: 1.333, // Water
      metalness: 0.1,
    });
    const waterGeo = new THREE.BoxGeometry(tankL - 0.05, 0.5, tankW - 0.05);
    this.tankWaterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.tankWaterMesh.position.set(0, 0.25, 0);
    apparatusRoot.add(this.tankWaterMesh);

    // 4. Movable Pressure Sensor Probe
    this.probeGroup = new THREE.Group();
    // Cable / Rod
    const rodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.8, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.y = 0.4;
    this.probeGroup.add(rod);

    // Sensor Transducer Tip (piezoelectric membrane)
    const tipGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.05, 16);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    this.probeGroup.add(tip);

    // Digital readout head
    const boxGeo = new THREE.BoxGeometry(0.08, 0.06, 0.04);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const readoutBox = new THREE.Mesh(boxGeo, boxMat);
    readoutBox.position.y = 0.8;
    this.probeGroup.add(readoutBox);

    this.probeGroup.position.set(-0.25, 0.4, 0);
    apparatusRoot.add(this.probeGroup);
    this.registerComponent(
      'pressure_probe',
      'Electronic Pressure Transducer Probe',
      this.probeGroup,
      'Calibrated piezoresistive membrane pressure probe submerged vertically to measure local gauge pressure p = ρ·g·h at any elevation.',
      'Operating Range: 0 to 50 kPa | Sensitivity: ±0.01 kPa',
      'p_gauge = ρ · g · h'
    );

    // 5. Submerged Plane Surface with Centroid & Center of Pressure Markers
    this.submergedPlateGroup = new THREE.Group();
    this.submergedPlateGroup.position.set(0.18, 0.5, 0);

    // The plate itself
    const plateGeo = new THREE.BoxGeometry(0.015, 0.35, 0.25);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      metalness: 0.4,
      roughness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    this.plateMesh = new THREE.Mesh(plateGeo, plateMat);
    this.plateMesh.position.y = -0.175;
    this.submergedPlateGroup.add(this.plateMesh);

    // Centroid marker (Cyan sphere)
    const centroidGeo = new THREE.SphereGeometry(0.016, 16, 16);
    const centroidMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    this.centroidMarker = new THREE.Mesh(centroidGeo, centroidMat);
    this.centroidMarker.position.set(0.015, -0.175, 0);
    this.submergedPlateGroup.add(this.centroidMarker);

    // Centre of Pressure marker (Magenta sphere)
    const copGeo = new THREE.SphereGeometry(0.018, 16, 16);
    const copMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });
    this.copMarker = new THREE.Mesh(copGeo, copMat);
    this.copMarker.position.set(0.015, -0.22, 0);
    this.submergedPlateGroup.add(this.copMarker);

    // Hydrostatic Resultant Force Vector Arrow
    this.forceArrowGroup = new THREE.Group();
    const arrowShaftGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.18, 16);
    const arrowShaftMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5 });
    const arrowShaft = new THREE.Mesh(arrowShaftGeo, arrowShaftMat);
    arrowShaft.rotation.z = Math.PI / 2;
    arrowShaft.position.x = 0.09;
    this.forceArrowGroup.add(arrowShaft);

    const arrowHeadGeo = new THREE.ConeGeometry(0.02, 0.05, 16);
    const arrowHeadMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const arrowHead = new THREE.Mesh(arrowHeadGeo, arrowHeadMat);
    arrowHead.rotation.z = -Math.PI / 2;
    arrowHead.position.x = 0.18;
    this.forceArrowGroup.add(arrowHead);

    this.submergedPlateGroup.add(this.forceArrowGroup);
    apparatusRoot.add(this.submergedPlateGroup);

    this.registerComponent(
      'submerged_plate',
      'Submerged Plane Surface Apparatus',
      this.submergedPlateGroup,
      'Pivoted plane surface used to determine the total hydrostatic resultant force and verify that the Centre of Pressure (h*) always lies below the Centroid (h_bar).',
      'Plane Area A = b · d | Second Moment IG = b·d³ / 12',
      'h* = h_bar + (IG · sin²θ) / (A · h_bar)'
    );

    this.scene.add(apparatusRoot);
  }

  public applyState(inputs: IHydrostaticInputs): void {
    this.currentInputs = inputs;
    this.currentOutputs = HydraulicCalculator.calculateHydrostatics(inputs);

    // 1. Update Water Height (max water depth ~ 0.85m in 3D scene scale)
    const visualWaterH = Math.max(0.08, Math.min(0.85, (inputs.waterDepth / 2.0) * 0.85));
    this.tankWaterMesh.scale.y = visualWaterH / 0.5;
    this.tankWaterMesh.position.y = visualWaterH / 2;

    // 2. Update Pressure Probe elevation
    // probeDepth is from water surface downward
    const visualProbeY = visualWaterH - (inputs.probeDepth / inputs.waterDepth) * visualWaterH;
    this.probeGroup.position.y = Math.max(0.03, visualProbeY);

    // 3. Update Submerged Plate angle and positions
    const angleRad = ((90 - inputs.plateAngleDeg) * Math.PI) / 180;
    this.submergedPlateGroup.rotation.z = -angleRad;

    // Position of centroid and COP on the plate
    const dHBar = this.currentOutputs.centroidDepthHBar;
    const dHStar = this.currentOutputs.centreOfPressureDepthHStar;
    const diff = Math.max(0.005, (dHStar - dHBar) * 0.8);

    this.copMarker.position.y = -0.175 - diff;
    this.forceArrowGroup.position.y = this.copMarker.position.y;

    // Arrow length proportional to resultant force
    const arrowScale = Math.min(2.5, Math.max(0.5, this.currentOutputs.totalResultantForce / 500));
    this.forceArrowGroup.scale.set(arrowScale, 1, 1);
  }

  protected update(dt: number): void {
    // Subtle fluid surface shimmering
    if (this.tankWaterMesh) {
      const time = performance.now() * 0.002;
      this.tankWaterMesh.rotation.y = Math.sin(time) * 0.005;
    }
  }

  public getOutputs(): IHydrostaticOutputs {
    return this.currentOutputs;
  }
}
