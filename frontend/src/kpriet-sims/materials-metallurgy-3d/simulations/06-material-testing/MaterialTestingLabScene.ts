/**
 * Module 6 — Virtual Material Testing Laboratory
 * Switchable 3D testing rigs: Universal Tensile, Multi-Indenter Hardness & Charpy Impact Pendulum
 */

import * as THREE from 'three';
import { BaseMetallurgySimulation } from '../BaseMetallurgySimulation';
import type { HardnessTestType } from '../../core/types';

export class MaterialTestingLabScene extends BaseMetallurgySimulation {
  private activeTest: 'tensile' | 'hardness' | 'impact' = 'hardness';
  private hardnessType: HardnessTestType = 'brinell';
  private testInProgress: boolean = false;
  private testProgress: number = 0; // 0 to 1

  private rigGroup: THREE.Group = new THREE.Group();
  private animatedMovingPart: THREE.Object3D | null = null;
  private pendulumArm: THREE.Group | null = null;
  private specimenObject: THREE.Mesh | null = null;

  protected initScene(): void {
    this.camera.position.set(3.5, 3.2, 5.5);
    this.controls.target.set(0, 1.6, 0);
    this.controls.update();

    this.scene.add(this.rigGroup);
    this.buildActiveTestingRig();
  }

  private buildActiveTestingRig(): void {
    // Clear old elements
    while (this.rigGroup.children.length > 0) {
      const child = this.rigGroup.children[0];
      if (child) {
        this.rigGroup.remove(child);
      } else {
        break;
      }
    }
    this.animatedMovingPart = null;
    this.pendulumArm = null;

    if (this.activeTest === 'hardness') {
      this.buildHardnessTester();
    } else if (this.activeTest === 'impact') {
      this.buildCharpyImpactTester();
    } else {
      this.buildTensileTester();
    }
  }

  // 1. Hardness Tester (Brinell / Rockwell / Vickers Benchtop Machine)
  private buildHardnessTester(): void {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.25 });

    // Machine Base Casting
    const baseGeo = new THREE.BoxGeometry(2.0, 0.4, 2.2);
    const base = new THREE.Mesh(baseGeo, frameMat);
    base.position.set(0, 0.2, 0);
    base.receiveShadow = true;
    this.rigGroup.add(base);

    // Vertical Column & Overarm Head
    const colGeo = new THREE.BoxGeometry(0.6, 2.8, 0.8);
    const col = new THREE.Mesh(colGeo, frameMat);
    col.position.set(-0.6, 1.8, 0);
    this.rigGroup.add(col);

    const headGeo = new THREE.BoxGeometry(1.6, 0.6, 0.8);
    const head = new THREE.Mesh(headGeo, frameMat);
    head.position.set(0, 3.0, 0);
    this.rigGroup.add(head);

    // Elevating Screw Anvil (leadscrew wheel supporting specimen)
    const anvilGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 32);
    const anvil = new THREE.Mesh(anvilGeo, chromeMat);
    anvil.position.set(0.4, 0.8, 0);
    this.rigGroup.add(anvil);

    // Polished Metal Test Block on Anvil
    const specGeo = new THREE.BoxGeometry(0.7, 0.25, 0.7);
    this.specimenObject = new THREE.Mesh(specGeo, brassMat);
    this.specimenObject.position.set(0.4, 1.325, 0);
    this.rigGroup.add(this.specimenObject);

    // Moving Indenter Ram (descends to indent)
    const ramGroup = new THREE.Group();
    const ramGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 24);
    const ram = new THREE.Mesh(ramGeo, chromeMat);
    ram.position.y = 0.4;
    ramGroup.add(ram);

    // Indenter Tip (Sphere for Brinell, Cone for Rockwell, Pyramid for Vickers)
    if (this.hardnessType === 'brinell') {
      const tipGeo = new THREE.SphereGeometry(0.08, 24, 24);
      const tip = new THREE.Mesh(tipGeo, chromeMat);
      tip.position.y = 0.04;
      ramGroup.add(tip);
    } else {
      const coneGeo = new THREE.ConeGeometry(0.06, 0.15, 24);
      const tip = new THREE.Mesh(coneGeo, chromeMat);
      tip.rotation.x = Math.PI;
      tip.position.y = 0.05;
      ramGroup.add(tip);
    }

    ramGroup.position.set(0.4, 2.2, 0);
    this.animatedMovingPart = ramGroup;
    this.rigGroup.add(ramGroup);

    // Dial Gauge Indicator on Top Head
    const dialGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 32);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(0.4, 3.0, 0.45);
    this.rigGroup.add(dial);
  }

  // 2. Charpy Impact Tester (Pendulum with 300J Hammer)
  private buildCharpyImpactTester(): void {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    // Sturdy Cast Iron A-Frame Pillars
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 0.3), frameMat);
    p1.position.set(-0.9, 1.6, 0);
    this.rigGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 0.3), frameMat);
    p2.position.set(0.9, 1.6, 0);
    this.rigGroup.add(p2);

    // Top Bearing Axle
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 24), steelMat);
    axle.rotation.z = Math.PI / 2;
    axle.position.set(0, 3.1, 0);
    this.rigGroup.add(axle);

    // Specimen Anvil Support at bottom center (y = 0.8)
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.4), frameMat);
    anvil.position.set(0, 0.35, 0);
    this.rigGroup.add(anvil);

    // V-Notch Charpy Specimen (10 x 10 x 55 mm)
    const spec = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.1, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85 })
    );
    spec.position.set(0, 0.75, 0);
    this.specimenObject = spec;
    this.rigGroup.add(spec);

    // Graduated Circular Scale Dial
    const scaleDisc = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 0.75, 48),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    scaleDisc.position.set(1.05, 3.1, 0);
    scaleDisc.rotation.y = Math.PI / 2;
    this.rigGroup.add(scaleDisc);

    // Swinging Pendulum Assembly (Pivot at y = 3.1)
    this.pendulumArm = new THREE.Group();
    this.pendulumArm.position.set(0, 3.1, 0);

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 16), steelMat);
    rod.position.y = -1.1;
    this.pendulumArm.add(rod);

    // Striking Edge Hammer Head (Tup)
    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.25), steelMat);
    hammer.position.set(0, -2.2, 0);
    this.pendulumArm.add(hammer);

    // Initial release position: 140° angle
    this.pendulumArm.rotation.z = -((140 * Math.PI) / 180);
    this.rigGroup.add(this.pendulumArm);
  }

  // 3. Tensile Testing Machine (Servo-Hydraulic Dual Column)
  private buildTensileTester(): void {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const colMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });

    // Lower Frame Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 1.4), frameMat);
    base.position.set(0, 0.25, 0);
    this.rigGroup.add(base);

    // Dual Hardened Chrome Guide Columns
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.6, 32), colMat);
    c1.position.set(-0.85, 2.2, 0);
    this.rigGroup.add(c1);

    const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.6, 32), colMat);
    c2.position.set(0.85, 2.2, 0);
    this.rigGroup.add(c2);

    // Fixed Top Crosshead
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 0.8), frameMat);
    topBeam.position.set(0, 3.9, 0);
    this.rigGroup.add(topBeam);

    // Lower Wedge Grip
    const lowerGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.5, 24), frameMat);
    lowerGrip.position.set(0, 0.75, 0);
    this.rigGroup.add(lowerGrip);

    // Moving Servo Crosshead
    const crossheadGroup = new THREE.Group();
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 0.8), frameMat);
    crossheadGroup.add(beam);

    const upperGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.5, 24), frameMat);
    upperGrip.position.set(0, -0.4, 0);
    crossheadGroup.add(upperGrip);

    crossheadGroup.position.set(0, 2.6, 0);
    this.animatedMovingPart = crossheadGroup;
    this.rigGroup.add(crossheadGroup);

    // Dogbone Specimen
    const spec = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9 })
    );
    spec.position.set(0, 1.5, 0);
    this.specimenObject = spec;
    this.rigGroup.add(spec);
  }

  public updateAnimation(delta: number, _elapsed: number): void {
    if (this.testInProgress) {
      this.testProgress += delta * 0.8;

      if (this.activeTest === 'hardness' && this.animatedMovingPart) {
        // Ram lowers, indents, then retracts
        if (this.testProgress < 0.5) {
          const t = this.testProgress / 0.5;
          this.animatedMovingPart.position.y = 2.2 - t * 0.75; // contacts specimen at y = 1.45
        } else if (this.testProgress < 1.0) {
          const t = (this.testProgress - 0.5) / 0.5;
          this.animatedMovingPart.position.y = 1.45 + t * 0.75;
        } else {
          this.testInProgress = false;
          this.testProgress = 0;
          this.animatedMovingPart.position.y = 2.2;
        }
      } else if (this.activeTest === 'impact' && this.pendulumArm) {
        // Pendulum swings down from -140° through 0° and swings up to final angle ~ +50°
        if (this.testProgress < 1.0) {
          const angle = -140 + this.testProgress * (140 + 55);
          this.pendulumArm.rotation.z = (angle * Math.PI) / 180;
          // Specimen breaks at bottom dead center (angle ≈ 0)
          if (angle > -10 && this.specimenObject) {
            this.specimenObject.position.x = 0.5;
            this.specimenObject.rotation.z = Math.PI / 4;
          }
        } else {
          this.testInProgress = false;
          this.testProgress = 0;
        }
      } else if (this.activeTest === 'tensile' && this.animatedMovingPart) {
        // Crosshead moves up
        if (this.testProgress < 1.0) {
          this.animatedMovingPart.position.y = 2.6 + this.testProgress * 0.4;
          if (this.specimenObject) {
            this.specimenObject.scale.y = 1.0 + this.testProgress * 0.35;
          }
        } else {
          this.testInProgress = false;
          this.testProgress = 0;
        }
      }
    }
  }

  public updateParameters(params: {
    activeTest?: 'tensile' | 'hardness' | 'impact';
    hardnessType?: HardnessTestType;
    triggerTest?: boolean;
  }): void {
    let rebuild = false;
    if (params.activeTest !== undefined && params.activeTest !== this.activeTest) {
      this.activeTest = params.activeTest;
      rebuild = true;
    }
    if (params.hardnessType !== undefined && params.hardnessType !== this.hardnessType) {
      this.hardnessType = params.hardnessType;
      rebuild = true;
    }

    if (rebuild) {
      this.buildActiveTestingRig();
    }

    if (params.triggerTest) {
      this.testInProgress = true;
      this.testProgress = 0;
    }
  }
}
