/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Module 4: Soil Permeability Laboratory (IS 2720 Part 17 / Part 36)
 * Constant-Head (Coarse Sand) & Falling-Head (Fine Sand / Silt)
 */

import * as THREE from 'three';
import { BaseGeotechnicalSimulation } from '../../core/BaseGeotechnicalSimulation';
import type { IBaseGeotechnicalSimulationOptions } from '../../core/BaseGeotechnicalSimulation';
import type { IPermeabilityParams } from '../../core/types';

export class PermeabilityScene extends BaseGeotechnicalSimulation {
  private cellGroup: THREE.Group;
  private constantHeadTankGroup: THREE.Group;
  private fallingHeadStandpipeGroup: THREE.Group;
  private waterLevelMesh: THREE.Mesh;
  private beakerWaterMesh: THREE.Mesh;
  private currentParams: IPermeabilityParams;
  private waterParticles: THREE.Points;
  private particlePositions: Float32Array;
  private flowActive = true;

  constructor(options: IBaseGeotechnicalSimulationOptions, initialParams: IPermeabilityParams) {
    super(options);
    this.currentParams = initialParams;

    this.defaultCameraPos.set(2.8, 2.2, 3.2);
    this.defaultTarget.set(0, 1.2, 0);
    this.resetCamera();

    // 1. Lab Bench
    const bench = this.createLaboratoryBench(3.2, 1.8, 0.85);
    this.labGroup.add(bench);

    // 2. Permeameter Cell
    this.cellGroup = this.buildPermeameterCell();
    this.labGroup.add(this.cellGroup);

    // 3. Constant Head Supply Reservoir
    this.constantHeadTankGroup = this.buildConstantHeadTank();
    this.labGroup.add(this.constantHeadTankGroup);

    // 4. Falling Head Standpipe Column
    this.fallingHeadStandpipeGroup = this.buildFallingHeadStandpipe();
    this.labGroup.add(this.fallingHeadStandpipeGroup);

    // 5. Collection Beaker & Outflow
    const { beakerWater } = this.buildCollectionStation();
    this.beakerWaterMesh = beakerWater;

    // 6. Water Streamline Particle System
    const { particles, positions } = this.buildWaterParticleSystem();
    this.waterParticles = particles;
    this.particlePositions = positions;
    this.cellGroup.add(this.waterParticles);

    // Reference to water level in standpipe
    this.waterLevelMesh = this.fallingHeadStandpipeGroup.children[2] as THREE.Mesh;

    this.updateApparatusVisibility();
  }

  private buildPermeameterCell(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0, 1.05, 0);

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });

    // Base Chamber with Outlet Tap
    const baseGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 32);
    const base = new THREE.Mesh(baseGeo, brassMat);
    base.position.y = 0.04;
    base.castShadow = true;
    group.add(base);

    // Lower Porous Stone Disc
    const porousStoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
    const porousStoneGeo = new THREE.CylinderGeometry(0.118, 0.118, 0.02, 32);
    const lowerStone = new THREE.Mesh(porousStoneGeo, porousStoneMat);
    lowerStone.position.y = 0.09;
    group.add(lowerStone);

    // Transparent Perspex Cell Cylinder (100mm ID, 127mm H)
    const cellGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.28, 32, 1, true);
    const cellMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      ior: 1.49,
    });
    const cell = new THREE.Mesh(cellGeo, cellMat);
    cell.position.y = 0.24;
    group.add(cell);

    // Soil Specimen Inside Cell
    const soilGeo = new THREE.CylinderGeometry(0.118, 0.118, 0.22, 32);
    const soilMat = new THREE.MeshStandardMaterial({
      color: this.currentParams.soilType === 'sand' ? 0xd4b16a : 0x7c5835,
      roughness: 0.95,
      metalness: 0.05,
    });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.21;
    soil.castShadow = true;
    group.add(soil);

    // Upper Porous Stone & Top Plate
    const upperStone = new THREE.Mesh(porousStoneGeo, porousStoneMat);
    upperStone.position.y = 0.33;
    group.add(upperStone);

    const topGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 32);
    const top = new THREE.Mesh(topGeo, brassMat);
    top.position.y = 0.41;
    top.castShadow = true;
    group.add(top);

    // Clamping Tie Rods
    [-0.14, 0.14].forEach((x) => {
      const rodGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.44, 16);
      const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.set(x, 0.22, 0);
      group.add(rod);
    });

    this.registerInteractive(cell, {
      id: 'permeameter-cell',
      name: 'Rigid Wall Soil Permeameter Chamber (IS 2720 Part 17)',
      functionDesc: 'Holds undisturbed or compacted soil specimen between upper and lower sintered porous bronze plates.',
      specification: 'Diameter: 100 mm | Specimen length: 127 mm | Transparent cast acrylic cylinder.',
    });

    return group;
  }

  private buildConstantHeadTank(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(-0.8, 1.4, 0);

    // Acrylic Supply Reservoir with Overflow Baffle
    const tankGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 32);
    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.88,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 0.175;
    tank.castShadow = true;
    group.add(tank);

    // Stand rod
    const standGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.9, 16);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.set(-0.16, 0, 0);
    group.add(stand);

    // Flexible silicone tube to permeameter
    const tubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0.3, 0.0, 0),
      new THREE.Vector3(0.6, -0.15, 0),
      new THREE.Vector3(0.8, -0.3, 0),
    ]);
    const tubeGeo = new THREE.TubeGeometry(tubeCurve, 20, 0.012, 12, false);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      transmission: 0.8,
      transparent: true,
      roughness: 0.2,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tube);

    this.registerInteractive(tank, {
      id: 'constant-head-tank',
      name: 'Adjustable Constant-Head Supply Reservoir',
      functionDesc: 'Maintains constant hydraulic head difference h via overflow weir baffle during high-permeability sand testing.',
      specification: 'Hydraulic head range: 100 mm to 600 mm | Constant spill rate overflow tube.',
    });

    return group;
  }

  private buildFallingHeadStandpipe(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(-0.8, 1.2, 0);

    // Graduated Glass Standpipe Tube (5mm bore)
    const pipeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 24, 1, true);
    const pipeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      transparent: true,
      roughness: 0.05,
    });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.y = 0.45;
    group.add(pipe);

    // Wooden / Aluminum graduated scale backing
    const scaleGeo = new THREE.BoxGeometry(0.06, 0.9, 0.01);
    const scaleMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.4 });
    const scale = new THREE.Mesh(scaleGeo, scaleMat);
    scale.position.set(0, 0.45, -0.02);
    group.add(scale);

    // Falling Meniscus Water Column Inside Standpipe
    const waterGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.5, 24);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.7,
      transparent: true,
      roughness: 0.1,
    });
    const waterCol = new THREE.Mesh(waterGeo, waterMat);
    waterCol.position.y = 0.25;
    group.add(waterCol);

    this.registerInteractive(pipe, {
      id: 'falling-head-standpipe',
      name: 'Graduated Glass Standpipe (IS 2720 Part 17)',
      functionDesc: 'Measures elapsed time t for water level to drop from initial head h1 to final head h2 in low-permeability soils.',
      specification: 'Internal diameter a: 5.0 mm | Graduated resolution: 1.0 mm | Working head: 1000 mm.',
    });

    return group;
  }

  private buildCollectionStation(): { beakerWater: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(0.7, 0.89, 0);

    // Glass Graduated Beaker (1000 mL)
    const beakerGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.22, 32, 1, true);
    const beakerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      transparent: true,
      roughness: 0.1,
    });
    const beaker = new THREE.Mesh(beakerGeo, beakerMat);
    beaker.position.y = 0.11;
    group.add(beaker);

    // Water volume inside beaker
    const waterGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.12, 32);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.8,
      transparent: true,
      roughness: 0.1,
    });
    const beakerWater = new THREE.Mesh(waterGeo, waterMat);
    beakerWater.position.y = 0.06;
    group.add(beakerWater);

    // Outflow silicone tube from cell to beaker
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, 0.2, 0),
      new THREE.Vector3(-0.2, 0.18, 0),
      new THREE.Vector3(0, 0.18, 0),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.009, 12, false);
    const tubeMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.8, transparent: true });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tube);

    this.labGroup.add(group);

    this.registerInteractive(beaker, {
      id: 'collection-beaker',
      name: 'Graduated Outflow Discharge Beaker (1000 mL)',
      functionDesc: 'Collects percolated water volume Q over measured duration t to determine discharge rate Q/t.',
      specification: 'Borosilicate glass graduated cylinder, 10 mL increments.',
    });

    return { beakerWater };
  }

  private buildWaterParticleSystem(): { particles: THREE.Points; positions: Float32Array } {
    const count = 120;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.16; // x inside specimen
      positions[i * 3 + 1] = 0.1 + Math.random() * 0.22; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.16; // z
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.012,
      transparent: true,
      opacity: 0.75,
    });

    const particles = new THREE.Points(geo, mat);
    return { particles, positions };
  }

  public updateParameters(params: IPermeabilityParams): void {
    this.currentParams = params;
    this.updateApparatusVisibility();
  }

  private updateApparatusVisibility(): void {
    if (this.currentParams.testType === 'constant-head') {
      this.constantHeadTankGroup.visible = true;
      this.fallingHeadStandpipeGroup.visible = false;
    } else {
      this.constantHeadTankGroup.visible = false;
      this.fallingHeadStandpipeGroup.visible = true;
    }
  }

  public update(delta: number): void {
    if (!this.flowActive) return;

    // Animate seepage particles moving downwards through soil
    const posAttr = this.waterParticles.geometry.attributes.position;
    if (posAttr) {
      const arr = posAttr.array as Float32Array;
      const speed = this.currentParams.testType === 'constant-head' ? 0.08 : 0.02;

      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1]! -= delta * speed;
        if (arr[i * 3 + 1]! < 0.1) {
          arr[i * 3 + 1] = 0.32;
        }
      }
      posAttr.needsUpdate = true;
    }
  }
}
