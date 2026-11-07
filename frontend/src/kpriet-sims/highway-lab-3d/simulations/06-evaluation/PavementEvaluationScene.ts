/**
 * Module 6: Pavement Evaluation and Overlay Design (Benkelman Beam Deflection)
 * U25CE402 — Highway Engineering
 * Benkelman Beam apparatus, 8.17-tonne loaded test truck, rebound deflection, and overlay design per IRC: 81
 */

import * as THREE from 'three';
import { BaseHighwaySimulation, type IBaseHighwaySimulationOptions } from '../../core/BaseHighwaySimulation';
import type { IPavementEvaluationState } from '../../core/types';
import { HighwayCalculator } from '../../core/HighwayCalculator';

export class PavementEvaluationScene extends BaseHighwaySimulation {
  private roadGroup: THREE.Group;
  private bbdGroup: THREE.Group;
  private truckGroup: THREE.Group;
  private distressGroup: THREE.Group;

  private isTruckMoving = false;
  private truckDistance = 0;
  private dialReading = 0;

  constructor(options: IBaseHighwaySimulationOptions) {
    super(options);
    this.roadGroup = new THREE.Group();
    this.bbdGroup = new THREE.Group();
    this.truckGroup = new THREE.Group();
    this.distressGroup = new THREE.Group();

    this.highwayGroup.add(this.roadGroup);
    this.highwayGroup.add(this.bbdGroup);
    this.highwayGroup.add(this.truckGroup);
    this.highwayGroup.add(this.distressGroup);

    this.defaultCameraPos.set(6.0, 4.0, 8.0);
    this.defaultTarget.set(0, 1.0, 0);
    this.resetCamera();

    this.buildRoadBase();
    this.buildBenkelmanBeam();
    this.buildTestTruck();
  }

  private buildRoadBase(): void {
    // Road surface slab
    const slabGeo = new THREE.BoxGeometry(7.0, 0.4, 25.0);
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = 0.2;
    slab.receiveShadow = true;
    this.roadGroup.add(slab);

    // Centreline marking
    const lineGeo = new THREE.PlaneGeometry(0.12, 25.0);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.405, 0);
    this.roadGroup.add(line);
  }

  private buildBenkelmanBeam(): void {
    // 1. Datum Frame / Reference Beam (rested on rear legs)
    const datumGeo = new THREE.BoxGeometry(0.08, 0.08, 1.8);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
    const datum = new THREE.Mesh(datumGeo, metalMat);
    datum.position.set(1.75, 0.6, 1.0);
    this.bbdGroup.add(datum);

    // Front adjustable legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 12);
    const leftLeg = new THREE.Mesh(legGeo, metalMat);
    leftLeg.position.set(1.5, 0.5, 0.2);
    const rightLeg = new THREE.Mesh(legGeo, metalMat);
    rightLeg.position.set(2.0, 0.5, 0.2);
    this.bbdGroup.add(leftLeg);
    this.bbdGroup.add(rightLeg);

    // 2. Slender Pivot Probe Beam (2:1 ratio: 2.44 m probe arm, 1.22 m dial arm)
    const probeGeo = new THREE.BoxGeometry(0.05, 0.05, 3.66);
    const probe = new THREE.Mesh(probeGeo, metalMat);
    probe.position.set(1.75, 0.6, 0.0);
    this.bbdGroup.add(probe);

    // Probe contact point tip touching pavement
    const tipGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const tip = new THREE.Mesh(tipGeo, metalMat);
    tip.position.set(1.75, 0.43, -1.8);
    this.bbdGroup.add(tip);

    // 3. Dial Gauge (0.01 mm division)
    const dialGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 24);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.set(1.75, 0.72, 1.22);
    this.bbdGroup.add(dial);

    this.registerInteractive(this.bbdGroup, {
      id: 'benkelman-beam',
      name: 'Benkelman Beam Deflection Apparatus (IRC: 81)',
      category: 'Pavement Evaluation',
      description: 'Standard 3.66 m lightweight aluminium beam with a 2:1 lever ratio (probe arm 2.44 m, dial arm 1.22 m). Measures rebound deflection of flexible pavement under 8170 kg rear axle load.',
      specReference: 'IRC: 81-1997 Guidelines for Flexible Pavement Overlays',
      dimensions: 'Total Length: 3.66 m, Ratio: 2:1, Dial gauge division: 0.01 mm',
      formula: 'True Deflection d = 2 × Dial Reading (0.01 mm)',
    });
  }

  private buildTestTruck(): void {
    // 8.17 Tonne (80 kN) Dual Wheel Rear Axle Test Truck
    const bodyGeo = new THREE.BoxGeometry(2.5, 1.8, 6.0);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(1.75, 1.8, -4.5);
    body.castShadow = true;
    this.truckGroup.add(body);

    // Dual Rear Wheels where BBD probe tip is placed in between
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.28, 24);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });

    // Inner and Outer Dual wheel on right side
    const w1 = new THREE.Mesh(wheelGeo, tireMat);
    w1.rotation.z = Math.PI / 2;
    w1.position.set(1.55, 0.55, -1.8);
    this.truckGroup.add(w1);

    const w2 = new THREE.Mesh(wheelGeo, tireMat);
    w2.rotation.z = Math.PI / 2;
    w2.position.set(1.95, 0.55, -1.8);
    this.truckGroup.add(w2);

    this.registerInteractive(body, {
      id: 'bbd-truck',
      name: 'Standard 8170 kg Dual-Wheel Axle Test Truck',
      category: 'Axle Loading',
      description: 'Rear axle loaded with sand bags to 8170 kg (4085 kg per dual wheel) with tyre pressure maintained at 5.6 kg/cm² (0.56 MPa) as mandated by IRC: 81.',
      specReference: 'IRC: 81-1997 Clause 4.2',
      dimensions: 'Axle load: 8170 kg (80 kN), Tyre pressure: 0.56 MPa',
    });
  }

  public rebuildDistress(state: IPavementEvaluationState): void {
    while (this.distressGroup.children.length > 0) {
      const child = this.distressGroup.children[0];
      if (child) {
        this.distressGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }

    if (state.distressType === 'cracking') {
      // Alligator / Fatigue cracking mesh decals
      const crackGeo = new THREE.PlaneGeometry(1.4, 2.5);
      const crackMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 1.0,
        wireframe: true,
      });
      const crackMesh = new THREE.Mesh(crackGeo, crackMat);
      crackMesh.rotation.x = -Math.PI / 2;
      crackMesh.position.set(1.75, 0.41, 0.5);
      this.distressGroup.add(crackMesh);

      this.registerInteractive(crackMesh, {
        id: 'fatigue-crack',
        name: 'Alligator / Fatigue Cracking (Structural Failure)',
        category: 'Pavement Distress',
        description: 'Interconnected polygon cracks caused by repetitive wheel load fatigue tensile strain at bottom of DBM layer. Severity: Moderate (15% wheel path area affected).',
        specReference: 'IRC: 81-1997 Clause 5.3',
        dimensions: 'Affected area: 3.5 m²',
      });
    } else if (state.distressType === 'rutting') {
      // Longitudinal depression groove in wheel path
      const rutGeo = new THREE.BoxGeometry(0.6, 0.05, 6.0);
      const rutMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
      const rutMesh = new THREE.Mesh(rutGeo, rutMat);
      rutMesh.position.set(1.75, 0.38, 0);
      this.distressGroup.add(rutMesh);

      this.registerInteractive(rutMesh, {
        id: 'rut-distress',
        name: 'Longitudinal Wheel Path Rutting (18 mm depth)',
        category: 'Pavement Distress',
        description: 'Permanent deformation accumulated in subgrade and unbound layers under repeated heavy commercial axle loads.',
        specReference: 'IRC: 81-1997 & IRC: 37-2018',
        dimensions: 'Rut depth: 18 mm, Length: 6.0 m',
      });
    }
  }

  public triggerDeflectionTest(): void {
    this.isTruckMoving = true;
    this.truckDistance = 0;
  }

  public update(delta: number, elapsed: number): void {
    if (!this.isTruckMoving) return;

    this.truckDistance += delta * 2.5; // Truck drives forward away from probe
    this.truckGroup.position.z = -this.truckDistance;

    // Deflection rebound stages: D0 (at 0m), D2.7 (at 2.7m), D9.0 (at 9m)
    if (this.truckDistance >= 12.0) {
      this.isTruckMoving = false;
      this.truckGroup.position.z = 0; // reset
    }
  }
}
