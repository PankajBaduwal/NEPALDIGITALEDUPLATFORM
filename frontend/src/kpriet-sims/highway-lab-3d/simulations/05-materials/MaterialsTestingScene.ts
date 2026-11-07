/**
 * Module 5: Highway Material Testing Laboratory
 * U25CE402 — Highway Engineering
 * Aggregate Impact, Los Angeles Abrasion, Bitumen Penetration, and Ring & Ball Softening Apparatus
 */

import * as THREE from 'three';
import { BaseHighwaySimulation, type IBaseHighwaySimulationOptions } from '../../core/BaseHighwaySimulation';
import type { IMaterialsTestingState } from '../../core/types';

export class MaterialsTestingScene extends BaseHighwaySimulation {
  private apparatusGroup: THREE.Group;
  private hammerMesh: THREE.Mesh | null = null;
  private laDrumMesh: THREE.Mesh | null = null;
  private needleMesh: THREE.Mesh | null = null;
  private ballMeshes: THREE.Mesh[] = [];

  private isRunningTest = false;
  private testTimer = 0;
  private hammerBlows = 0;
  private selectedTest = 'impact';

  constructor(options: IBaseHighwaySimulationOptions) {
    super(options);
    this.apparatusGroup = new THREE.Group();
    this.highwayGroup.add(this.apparatusGroup);

    this.defaultCameraPos.set(2.5, 2.0, 3.2);
    this.defaultTarget.set(0, 0.8, 0);
    this.resetCamera();
  }

  public setTestType(testType: string): void {
    this.selectedTest = testType;
    this.isRunningTest = false;
    this.testTimer = 0;
    this.hammerBlows = 0;

    // Clear existing apparatus
    this.interactiveObjects.clear();
    while (this.apparatusGroup.children.length > 0) {
      const child = this.apparatusGroup.children[0];
      if (child) {
        this.apparatusGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }

    if (testType === 'impact' || testType === 'crushing') {
      this.buildImpactApparatus();
    } else if (testType === 'abrasion') {
      this.buildAbrasionDrum();
    } else if (testType === 'penetration') {
      this.buildPenetrometer();
    } else if (testType === 'softening') {
      this.buildRingAndBallApparatus();
    }
  }

  private buildImpactApparatus(): void {
    const group = new THREE.Group();

    // Heavy Cast Iron Base
    const baseGeo = new THREE.BoxGeometry(1.2, 0.25, 1.0);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.position.y = 0.125;
    group.add(base);

    // Cylindrical Cup with Aggregates
    const cupGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 24);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(0, 0.375, 0);
    group.add(cup);

    // Vertical Guide Columns
    const colGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.4, 16);
    const col1 = new THREE.Mesh(colGeo, metalMat);
    col1.position.set(-0.35, 0.95, 0);
    const col2 = new THREE.Mesh(colGeo, metalMat);
    col2.position.set(0.35, 0.95, 0);
    group.add(col1);
    group.add(col2);

    // Top cross-head
    const topGeo = new THREE.BoxGeometry(0.9, 0.08, 0.2);
    const topHead = new THREE.Mesh(topGeo, metalMat);
    topHead.position.set(0, 1.65, 0);
    group.add(topHead);

    // 13.5-14.0 kg Impact Hammer (falls 380 mm)
    const hammerGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 24);
    const hammerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    this.hammerMesh = new THREE.Mesh(hammerGeo, hammerMat);
    this.hammerMesh.position.set(0, 1.2, 0);
    this.hammerMesh.castShadow = true;
    group.add(this.hammerMesh);

    this.apparatusGroup.add(group);

    this.registerInteractive(cup, {
      id: 'impact-cup',
      name: 'Standard Cylindrical Steel Cup (IS: 2386 Part IV)',
      category: 'Impact Test',
      description: 'Internal diameter 102 mm, depth 50 mm, holding 3 layers of 10.0 mm to 12.5 mm aggregates tamped 25 times each.',
      specReference: 'IS: 2386 (Part IV)-1963',
      dimensions: 'Internal Dia: 102 mm, Depth: 50 mm',
    });

    this.registerInteractive(this.hammerMesh, {
      id: 'impact-hammer',
      name: 'Standard 13.5-14.0 kg Falling Hammer',
      category: 'Impact Test',
      description: 'Drops freely through vertical height of 380 ± 5 mm onto aggregate specimen for exactly 15 blows at 1 blow/second.',
      specReference: 'IS: 2386 (Part IV)-1963 Clause 2.3',
      dimensions: 'Weight: 13.7 kg, Free fall height: 380 mm',
    });
  }

  private buildAbrasionDrum(): void {
    const group = new THREE.Group();

    // Steel frame
    const frameGeo = new THREE.BoxGeometry(1.6, 0.15, 1.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 0.075;
    group.add(frame);

    // Rotating Drum (700 mm dia, 500 mm length)
    const drumGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 32);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    this.laDrumMesh = new THREE.Mesh(drumGeo, drumMat);
    this.laDrumMesh.rotation.z = Math.PI / 2;
    this.laDrumMesh.position.set(0, 0.75, 0);
    this.laDrumMesh.castShadow = true;
    group.add(this.laDrumMesh);

    // Motor drive housing
    const motorGeo = new THREE.BoxGeometry(0.35, 0.5, 0.4);
    const motor = new THREE.Mesh(motorGeo, frameMat);
    motor.position.set(-0.7, 0.75, 0);
    group.add(motor);

    this.apparatusGroup.add(group);

    this.registerInteractive(this.laDrumMesh, {
      id: 'la-drum',
      name: 'Los Angeles Abrasion Cylinder (IS: 2386 Part IV)',
      category: 'Abrasion Test',
      description: 'Hollow steel cylinder (711 mm internal dia, 508 mm internal length) with longitudinal steel shelf, rotated at 30-33 rpm for 500 revolutions with 12 abrasive cast iron spheres.',
      specReference: 'IS: 2386 (Part IV)-1963 Clause 4.0',
      dimensions: 'Dia: 711 mm, Length: 508 mm, Speed: 30-33 RPM',
    });
  }

  private buildPenetrometer(): void {
    const group = new THREE.Group();

    // Base with water bath plate
    const baseGeo = new THREE.BoxGeometry(0.8, 0.15, 0.7);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.075;
    group.add(base);

    // Bitumen Sample Container Cup
    const cupGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.15, 24);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 }); // Black shiny bitumen
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(0, 0.225, 0);
    group.add(cup);

    // Vertical Stand & Dial Gauge
    const mastGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 16);
    const mast = new THREE.Mesh(mastGeo, baseMat);
    mast.position.set(0, 0.65, -0.22);
    group.add(mast);

    // Circular Dial Indicator (0.1 mm precision)
    const dialGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 32);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(0, 0.95, -0.15);
    group.add(dial);

    // Penetration Needle (100g total weight)
    const needleGeo = new THREE.CylinderGeometry(0.008, 0.002, 0.35, 12);
    const needleMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95 });
    this.needleMesh = new THREE.Mesh(needleGeo, needleMat);
    this.needleMesh.position.set(0, 0.48, 0);
    group.add(this.needleMesh);

    this.apparatusGroup.add(group);

    this.registerInteractive(cup, {
      id: 'bitumen-cup',
      name: 'Standard Bitumen Cup in Water Bath at 25°C',
      category: 'Penetration Test',
      description: 'Holds VG-30 bitumen sample cooled at room temperature and conditioned in water bath at 25.0 ± 0.1°C for 1.5 hours.',
      specReference: 'IS: 1203-1978 & IS: 73-2013',
      dimensions: 'Diameter: 55 mm, Depth: 35 mm',
    });

    this.registerInteractive(dial, {
      id: 'dial-indicator',
      name: 'Penetrometer Dial Gauge (0.1 mm Units)',
      category: 'Penetration Test',
      description: 'Direct reading dial calibrated to 0.1 mm (1 penetration unit) with release trigger mechanism for exactly 5.0 seconds under 100g weight.',
      specReference: 'IS: 1203-1978 Clause 2.1',
      dimensions: 'Precision: 1/10 mm (1 unit)',
    });
  }

  private buildRingAndBallApparatus(): void {
    const group = new THREE.Group();

    // Heat resistant glass beaker (600 ml)
    const beakerGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      transmission: 0.9,
    });
    const beaker = new THREE.Mesh(beakerGeo, glassMat);
    beaker.position.set(0, 0.5, 0);
    group.add(beaker);

    // Water level inside beaker
    const waterGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.65, 32);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 0.45, 0);
    group.add(water);

    // Brass support ring frame
    const ringGeo = new THREE.TorusGeometry(0.1, 0.02, 16, 32);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const leftRing = new THREE.Mesh(ringGeo, brassMat);
    leftRing.rotation.x = Math.PI / 2;
    leftRing.position.set(-0.12, 0.55, 0);
    group.add(leftRing);

    const rightRing = new THREE.Mesh(ringGeo, brassMat);
    rightRing.rotation.x = Math.PI / 2;
    rightRing.position.set(0.12, 0.55, 0);
    group.add(rightRing);

    // Steel balls (9.5 mm dia, 3.5g)
    this.ballMeshes = [];
    const ballGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 });

    const ball1 = new THREE.Mesh(ballGeo, steelMat);
    ball1.position.set(-0.12, 0.58, 0);
    group.add(ball1);
    this.ballMeshes.push(ball1);

    const ball2 = new THREE.Mesh(ballGeo, steelMat);
    ball2.position.set(0.12, 0.58, 0);
    group.add(ball2);
    this.ballMeshes.push(ball2);

    this.apparatusGroup.add(group);

    this.registerInteractive(beaker, {
      id: 'softening-beaker',
      name: 'Ring & Ball Bath with Thermometer (IS: 1205)',
      category: 'Softening Point Test',
      description: 'Distilled water bath heated uniformly at 5.0 ± 0.5°C per minute with electric stirrer until bitumen softens and steel ball touches base plate 25 mm below.',
      specReference: 'IS: 1205-1978 & IS: 73-2013',
      dimensions: 'Ball: 9.5 mm (3.5g), Drop distance: 25.4 mm',
    });
  }

  public triggerTestRun(): void {
    this.isRunningTest = true;
    this.testTimer = 0;
    this.hammerBlows = 0;
  }

  public update(delta: number, elapsed: number): void {
    if (!this.isRunningTest) return;

    this.testTimer += delta;

    if (this.selectedTest === 'impact' && this.hammerMesh) {
      // 15 hammer blows (1 per second)
      const cycle = this.testTimer % 1.0;
      if (cycle < 0.25) {
        // Falling down
        this.hammerMesh.position.y = 1.2 - (cycle / 0.25) * 0.7;
      } else {
        // Lifting up
        this.hammerMesh.position.y = 0.5 + ((cycle - 0.25) / 0.75) * 0.7;
      }
      if (this.testTimer > 15.0) {
        this.isRunningTest = false;
        this.hammerMesh.position.y = 1.2;
      }
    } else if (this.selectedTest === 'abrasion' && this.laDrumMesh) {
      // Drum rotates at 33 RPM
      this.laDrumMesh.rotation.x += delta * 3.5;
      if (this.testTimer > 10.0) {
        this.isRunningTest = false;
      }
    } else if (this.selectedTest === 'penetration' && this.needleMesh) {
      // Needle descends 65 units (6.5 mm = 0.065 m) over 5 seconds
      if (this.testTimer <= 5.0) {
        const penetrationProgress = this.testTimer / 5.0;
        this.needleMesh.position.y = 0.48 - penetrationProgress * 0.065;
      } else {
        this.isRunningTest = false;
      }
    } else if (this.selectedTest === 'softening') {
      // Steel balls sagging down through bitumen
      if (this.testTimer <= 8.0) {
        const sag = (this.testTimer / 8.0) * 0.12;
        this.ballMeshes.forEach((b) => {
          b.position.y = 0.58 - sag;
        });
      } else {
        this.isRunningTest = false;
      }
    }
  }
}
