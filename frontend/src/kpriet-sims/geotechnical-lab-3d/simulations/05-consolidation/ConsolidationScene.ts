/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Module 5: Soil Consolidation Laboratory (IS 2720 Part 15 / Terzaghi 1D Consolidation)
 */

import * as THREE from 'three';
import { BaseGeotechnicalSimulation } from '../../core/BaseGeotechnicalSimulation';
import type { IBaseGeotechnicalSimulationOptions } from '../../core/BaseGeotechnicalSimulation';
import type { IConsolidationParams } from '../../core/types';

export class ConsolidationScene extends BaseGeotechnicalSimulation {
  private cellGroup: THREE.Group;
  private leverArmGroup: THREE.Group;
  private dialGaugeGroup: THREE.Group;
  private dialNeedleMesh: THREE.Mesh;
  private weightsGroup: THREE.Group;
  private currentParams: IConsolidationParams;
  private currentSettlementMm = 0;

  constructor(options: IBaseGeotechnicalSimulationOptions, initialParams: IConsolidationParams) {
    super(options);
    this.currentParams = initialParams;

    this.defaultCameraPos.set(2.4, 2.0, 2.8);
    this.defaultTarget.set(0, 1.15, 0);
    this.resetCamera();

    // 1. Heavy Rigid Testing Bench
    const bench = this.createLaboratoryBench(3.0, 1.6, 0.85);
    this.labGroup.add(bench);

    // 2. Oedometer Sturdy Cast Iron Frame
    this.buildOedometerFrame();

    // 3. Brass Consolidation Cell with Water Reservoir
    this.cellGroup = this.buildConsolidationCell();
    this.labGroup.add(this.cellGroup);

    // 4. 10:1 Lever Loading Arm & Weight Hanger
    const { leverGroup, weightsGroup } = this.buildLeverLoadingSystem();
    this.leverArmGroup = leverGroup;
    this.weightsGroup = weightsGroup;
    this.labGroup.add(this.leverArmGroup);

    // 5. Precision Dial Gauge
    const { gaugeGroup, needle } = this.buildPrecisionDialGauge();
    this.dialGaugeGroup = gaugeGroup;
    this.dialNeedleMesh = needle;
    this.labGroup.add(this.dialGaugeGroup);
  }

  private buildOedometerFrame(): void {
    const frameGroup = new THREE.Group();
    frameGroup.position.set(0, 0.89, 0);

    const castIronMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.6,
    });

    // Base casting
    const baseGeo = new THREE.BoxGeometry(0.8, 0.08, 0.5);
    const base = new THREE.Mesh(baseGeo, castIronMat);
    base.position.y = 0.04;
    base.castShadow = true;
    frameGroup.add(base);

    // Twin upright columns
    const colGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.55, 16);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    const colL = new THREE.Mesh(colGeo, colMat);
    colL.position.set(-0.25, 0.35, 0);
    colL.castShadow = true;
    frameGroup.add(colL);

    const colR = new THREE.Mesh(colGeo, colMat);
    colR.position.set(0.25, 0.35, 0);
    colR.castShadow = true;
    frameGroup.add(colR);

    // Top Crosshead Beam
    const beamGeo = new THREE.BoxGeometry(0.6, 0.05, 0.08);
    const beam = new THREE.Mesh(beamGeo, castIronMat);
    beam.position.y = 0.62;
    beam.castShadow = true;
    frameGroup.add(beam);

    this.labGroup.add(frameGroup);
  }

  private buildConsolidationCell(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0, 0.97, 0);

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.85 });
    const porousStoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });

    // Water reservoir bath
    const bathGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 32);
    const bathMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.8,
      transparent: true,
      roughness: 0.1,
    });
    const bath = new THREE.Mesh(bathGeo, bathMat);
    bath.position.y = 0.04;
    group.add(bath);

    // Brass Specimen Ring (60mm ID x 20mm H)
    const ringGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.045, 32, 1, true);
    const ring = new THREE.Mesh(ringGeo, brassMat);
    ring.position.y = 0.035;
    group.add(ring);

    // Cohesive Soil Sample Core
    const soilGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.038, 32);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.95 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.035;
    group.add(soil);

    // Upper Porous Stone & Perforated Brass Loading Cap
    const stoneGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.015, 32);
    const upperStone = new THREE.Mesh(stoneGeo, porousStoneMat);
    upperStone.position.y = 0.06;
    group.add(upperStone);

    const capGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.02, 32);
    const cap = new THREE.Mesh(capGeo, brassMat);
    cap.position.y = 0.075;
    group.add(cap);

    // Steel Spherical Ball Seating (self-aligning)
    const ballGeo = new THREE.SphereGeometry(0.015, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.y = 0.095;
    group.add(ball);

    this.registerInteractive(bath, {
      id: 'consolidation-cell',
      name: 'Fixed-Ring Oedometer Consolidation Cell (IS 2720 Part 15)',
      functionDesc: 'Maintains 100% saturation of 60mm diameter x 20mm high soil specimen with two-way drainage through porous stones.',
      specification: 'Internal ring diameter: 60 mm | Initial thickness: 20 mm | Max test pressure: 800 kPa.',
    });

    return group;
  }

  private buildLeverLoadingSystem(): { leverGroup: THREE.Group; weightsGroup: THREE.Group } {
    const group = new THREE.Group();
    group.position.set(-0.35, 1.3, 0);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });

    // Pivot Fulcrum Knife Edge
    const fulcrumGeo = new THREE.ConeGeometry(0.03, 0.06, 4);
    const fulcrum = new THREE.Mesh(fulcrumGeo, steelMat);
    fulcrum.rotation.y = Math.PI / 4;
    group.add(fulcrum);

    // 10:1 Ratio Lever Arm (Extends forward)
    const armGeo = new THREE.BoxGeometry(0.85, 0.04, 0.02);
    const arm = new THREE.Mesh(armGeo, steelMat);
    arm.position.set(-0.35, 0.04, 0);
    arm.castShadow = true;
    group.add(arm);

    // Counterbalance Weight
    const counterGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 24);
    const counter = new THREE.Mesh(counterGeo, steelMat);
    counter.position.set(0.08, 0.04, 0);
    group.add(counter);

    // Hanging Weight Hanger at far end
    const hangerRodGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.5, 16);
    const hangerRod = new THREE.Mesh(hangerRodGeo, steelMat);
    hangerRod.position.set(-0.75, -0.25, 0);
    group.add(hangerRod);

    // Weights Group (Slotted cast iron discs)
    const weightsGroup = new THREE.Group();
    weightsGroup.position.set(-0.75, -0.45, 0);
    group.add(weightsGroup);

    this.rebuildWeights(weightsGroup, this.currentParams.loadIncrementKPa);

    this.registerInteractive(arm, {
      id: 'lever-loading-arm',
      name: '10:1 Mechanical Lever Ratio Loading System',
      functionDesc: 'Multiplies hanger slotted weights by 10x to deliver precise compressive stress increments (25 to 800 kPa).',
      specification: 'Mechanical lever amplification: 10:1 | Counterbalanced knife-edge fulcrum.',
    });

    return { leverGroup: group, weightsGroup };
  }

  private rebuildWeights(group: THREE.Group, loadKPa: number): void {
    // Clear existing
    while (group.children.length > 0) {
      const c = group.children[0]!;
      group.remove(c);
      if (c instanceof THREE.Mesh) c.geometry.dispose();
    }

    const weightMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.5 });
    const count = Math.min(8, Math.max(1, Math.round(loadKPa / 100)));

    for (let i = 0; i < count; i++) {
      const discGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.022, 24);
      const disc = new THREE.Mesh(discGeo, weightMat);
      disc.position.y = i * 0.025;
      disc.castShadow = true;
      group.add(disc);
    }
  }

  private buildPrecisionDialGauge(): { gaugeGroup: THREE.Group; needle: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(0, 1.25, 0);

    // Outer Chrome Casing (50mm dial)
    const casingGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.025, 32);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.rotation.x = Math.PI / 2;
    group.add(casing);

    // White Dial Face with Incremental Scale
    const faceGeo = new THREE.CircleGeometry(0.058, 32);
    const faceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = 0.013;
    group.add(face);

    // Red Needle Pointer
    const needleGeo = new THREE.ConeGeometry(0.003, 0.045, 8);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.set(0, 0.02, 0.015);
    group.add(needle);

    // Measuring Spindle Plunger extending down to specimen ball
    const spindleGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.22, 16);
    const spindle = new THREE.Mesh(spindleGeo, casingMat);
    spindle.position.y = -0.12;
    group.add(spindle);

    this.registerInteractive(casing, {
      id: 'settlement-dial-gauge',
      name: 'High-Precision Digital / Mechanical Dial Gauge (IS 2720 Part 15)',
      functionDesc: 'Records 1D consolidation settlement ΔH with 0.002 mm (2 µm) travel sensitivity.',
      specification: 'Range: 10 mm | Least count: 0.002 mm | Spring-loaded contact tip.',
    });

    return { gaugeGroup: group, needle };
  }

  public updateParameters(params: IConsolidationParams, cumulativeSettlementMm: number): void {
    this.currentParams = params;
    this.currentSettlementMm = cumulativeSettlementMm;
    this.rebuildWeights(this.weightsGroup, params.loadIncrementKPa);

    // Needle rotates proportional to settlement (1 full revolution = 1.0 mm)
    const revolutions = cumulativeSettlementMm;
    this.dialNeedleMesh.rotation.z = -revolutions * Math.PI * 2;
  }

  public update(delta: number): void {
    // Subtle lever arm vibration
    this.leverArmGroup.rotation.z = Math.sin(Date.now() * 0.003) * 0.001;
  }
}
