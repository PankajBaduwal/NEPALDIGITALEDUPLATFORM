/**
 * PiyushDhara Eduverse — 3D Geotechnical Engineering Laboratory
 * Module 3: Standard Proctor Soil Compaction Laboratory (IS 2720 Part 7)
 */

import * as THREE from 'three';
import { BaseGeotechnicalSimulation } from '../../core/BaseGeotechnicalSimulation';
import type { IBaseGeotechnicalSimulationOptions } from '../../core/BaseGeotechnicalSimulation';

export class ProctorCompactionScene extends BaseGeotechnicalSimulation {
  private mouldGroup: THREE.Group;
  private rammerGroup: THREE.Group;
  private hammerMesh: THREE.Mesh;
  private soilLayerMesh: THREE.Mesh;
  private isCompacting = false;
  private blowCount = 0;
  private hammerDropProgress = 0;
  private currentLayer = 1;

  constructor(options: IBaseGeotechnicalSimulationOptions) {
    super(options);

    this.defaultCameraPos.set(2.4, 2.0, 2.8);
    this.defaultTarget.set(0, 1.15, 0);
    this.resetCamera();

    // 1. Heavy Lab Bench
    const bench = this.createLaboratoryBench(3.0, 1.6, 0.85);
    this.labGroup.add(bench);

    // 2. Heavy steel shock-absorbing mounting block
    const blockGeo = new THREE.BoxGeometry(0.6, 0.1, 0.6);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.8 });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.set(0, 0.9, 0);
    this.labGroup.add(block);

    // 3. Proctor Mould Assembly
    this.mouldGroup = this.buildProctorMould();
    this.labGroup.add(this.mouldGroup);

    // 4. Compacted Soil Core
    this.soilLayerMesh = this.buildSoilCore();
    this.mouldGroup.add(this.soilLayerMesh);

    // 5. Standard Proctor Drop Rammer
    const { rammerGroup, hammerMesh } = this.buildProctorRammer();
    this.rammerGroup = rammerGroup;
    this.hammerMesh = hammerMesh;
    this.labGroup.add(this.rammerGroup);

    // 6. Trimmer straightedge, soil mixing tray, and moisture spray
    this.buildAccessories();
  }

  private buildProctorMould(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0, 0.95, 0);

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.9,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.85,
    });

    // Detachable Base Plate
    const baseGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 32);
    const base = new THREE.Mesh(baseGeo, steelMat);
    base.position.y = 0.01;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Clamping Wing Nuts & Tie Rods
    [-0.18, 0.18].forEach((x) => {
      const rodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.38, 16);
      const rod = new THREE.Mesh(rodGeo, steelMat);
      rod.position.set(x, 0.19, 0);
      group.add(rod);

      const wingNutGeo = new THREE.BoxGeometry(0.04, 0.02, 0.015);
      const wingNut = new THREE.Mesh(wingNutGeo, brassMat);
      wingNut.position.set(x, 0.37, 0);
      group.add(wingNut);
    });

    // Main Cylindrical Mould Barrel (100mm ID, 127.3mm internal height)
    // Scaled: 100mm -> 0.20m, 127.3mm -> 0.25m
    const barrelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 32, 1, true);
    const barrel = new THREE.Mesh(barrelGeo, brassMat);
    barrel.position.y = 0.145;
    barrel.castShadow = true;
    group.add(barrel);

    // Detachable Upper Collar (60mm high)
    const collarGeo = new THREE.CylinderGeometry(0.122, 0.122, 0.12, 32, 1, true);
    const collar = new THREE.Mesh(collarGeo, steelMat);
    collar.position.y = 0.315;
    collar.castShadow = true;
    group.add(collar);

    this.registerInteractive(barrel, {
      id: 'proctor-mould',
      name: 'Standard Proctor Compaction Mould (IS 2720 Part 7)',
      functionDesc: 'Standard 1000 cm³ capacity cylindrical metal mould with detachable base plate and 60mm extension collar.',
      specification: 'Internal diameter: 100 mm | Effective height: 127.3 mm | Internal volume: 1000 cm³.',
    });

    return group;
  }

  private buildSoilCore(): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(0.098, 0.098, 0.18, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8a6240,
      roughness: 0.95,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.11;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private buildProctorRammer(): { rammerGroup: THREE.Group; hammerMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(0, 1.45, 0);

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.95,
    });

    // Outer Tubular Guide Sleeve (450mm length)
    const sleeveGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.6, 24, 1, true);
    const sleeve = new THREE.Mesh(sleeveGeo, chromeMat);
    sleeve.position.y = 0.3;
    group.add(sleeve);

    // Drop Hammer (2.6 kg cylindrical weight with 50mm circular face)
    const hammerGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.15, 24);
    const hammerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 });
    const hammer = new THREE.Mesh(hammerGeo, hammerMat);
    hammer.position.y = 0.45; // Top of drop
    hammer.castShadow = true;
    group.add(hammer);

    // Rammer Handle Rod
    const rodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.7, 16);
    const rod = new THREE.Mesh(rodGeo, chromeMat);
    rod.position.y = 0.7;
    hammer.add(rod);

    // T-Bar Handle
    const tbarGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 16);
    const tbar = new THREE.Mesh(tbarGeo, chromeMat);
    tbar.rotation.z = Math.PI / 2;
    tbar.position.y = 0.35;
    rod.add(tbar);

    this.registerInteractive(sleeve, {
      id: 'proctor-rammer',
      name: 'Standard Proctor Compaction Rammer (IS 2720 Part 7)',
      functionDesc: 'Drops 2.6 kg hammer through a free-fall distance of 310 mm to impart standard dynamic compaction energy (593 kJ/m³).',
      specification: 'Rammer mass: 2.60 kg | Free drop height: 310 mm | Circular face diameter: 50 mm.',
      safetyCaution: 'Keep fingers clear of guide sleeve vent holes during dynamic compaction.',
    });

    return { rammerGroup: group, hammerMesh: hammer };
  }

  private buildAccessories(): void {
    // Steel Straightedge Trimmer Blade
    const bladeGeo = new THREE.BoxGeometry(0.35, 0.03, 0.005);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.2 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(-0.6, 0.865, 0.3);
    blade.rotation.y = 0.4;
    this.labGroup.add(blade);

    // Soil preparation mixing tray
    const trayGeo = new THREE.BoxGeometry(0.55, 0.06, 0.45);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.7 });
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.set(0.7, 0.88, 0);
    this.labGroup.add(tray);

    const soilInTrayGeo = new THREE.BoxGeometry(0.52, 0.03, 0.42);
    const soilInTrayMat = new THREE.MeshStandardMaterial({ color: 0x785335, roughness: 0.95 });
    const soilInTray = new THREE.Mesh(soilInTrayGeo, soilInTrayMat);
    soilInTray.position.set(0.7, 0.905, 0);
    this.labGroup.add(soilInTray);
  }

  public triggerCompactionBlow(): void {
    this.isCompacting = true;
    this.hammerDropProgress = 0;
    this.blowCount++;
  }

  public update(delta: number): void {
    if (this.isCompacting) {
      this.hammerDropProgress += delta * 4.0; // Fast drop

      if (this.hammerDropProgress < 0.5) {
        // Falling down
        const t = this.hammerDropProgress / 0.5;
        this.hammerMesh.position.y = THREE.MathUtils.lerp(0.45, 0.05, t * t);
      } else if (this.hammerDropProgress < 1.0) {
        // Lifting back up
        const t = (this.hammerDropProgress - 0.5) / 0.5;
        this.hammerMesh.position.y = THREE.MathUtils.lerp(0.05, 0.45, t);
      } else {
        this.isCompacting = false;
        this.hammerMesh.position.y = 0.45;
      }
    }
  }
}
