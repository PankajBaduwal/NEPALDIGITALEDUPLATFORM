/**
 * Module 3: Superelevation and Road Cross-Slope
 * U25CE402 — Highway Engineering
 * Superelevation Banking, Force Vector Polygon (W, P, N, F), and Curve Extra Widening (Wm + Wps)
 */

import * as THREE from 'three';
import { BaseHighwaySimulation, type IBaseHighwaySimulationOptions } from '../../core/BaseHighwaySimulation';
import type { ISuperelevationState } from '../../core/types';
import { HighwayCalculator } from '../../core/HighwayCalculator';

export class SuperelevationScene extends BaseHighwaySimulation {
  private corridorGroup: THREE.Group;
  private vectorsGroup: THREE.Group;
  private wideningOverlayGroup: THREE.Group;
  private vehicleGroup: THREE.Group;

  constructor(options: IBaseHighwaySimulationOptions) {
    super(options);
    this.corridorGroup = new THREE.Group();
    this.vectorsGroup = new THREE.Group();
    this.wideningOverlayGroup = new THREE.Group();
    this.vehicleGroup = new THREE.Group();

    this.highwayGroup.add(this.corridorGroup);
    this.highwayGroup.add(this.vectorsGroup);
    this.highwayGroup.add(this.wideningOverlayGroup);
    this.highwayGroup.add(this.vehicleGroup);

    this.defaultCameraPos.set(0, 3.5, 14);
    this.defaultTarget.set(0, 1.2, 0);
    this.resetCamera();
  }

  public rebuildSuperelevation(state: ISuperelevationState): void {
    // Clear groups
    while (this.corridorGroup.children.length > 0) {
      const child = this.corridorGroup.children[0];
      if (child) {
        this.corridorGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }
    while (this.vectorsGroup.children.length > 0) {
      const child = this.vectorsGroup.children[0];
      if (child) {
        this.vectorsGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }
    while (this.wideningOverlayGroup.children.length > 0) {
      const child = this.wideningOverlayGroup.children[0];
      if (child) {
        this.wideningOverlayGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }
    while (this.vehicleGroup.children.length > 0) {
      const child = this.vehicleGroup.children[0];
      if (child) {
        this.vehicleGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }

    const roadW = state.roadWidth;
    const roadL = 25.0;
    const calc = HighwayCalculator.calculateSuperelevation(state.speedKmph, state.radiusM, state.roadWidth, state.terrain);
    const widening = HighwayCalculator.calculateExtraWidening(state.speedKmph, state.radiusM, state.lanes);

    // Banking angle theta
    const bankAngle = Math.atan(calc.providedSuperelevation);
    const totalW = roadW + widening.totalWideningM;
    const outerRaise = roadW * calc.providedSuperelevation;

    // Road slab tilted around inner edge or centreline
    const slabGeo = new THREE.BoxGeometry(totalW, 0.35, roadL);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.8,
      metalness: 0.1,
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.rotation.z = bankAngle;
    // Position so inner edge is at ground elevation
    const yCenter = 0.5 + (roadW / 2) * Math.sin(bankAngle);
    slab.position.set(0, yCenter, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    this.corridorGroup.add(slab);

    this.registerInteractive(slab, {
      id: 'superelevated-deck',
      name: `Banked Carriageway (e = ${(calc.providedSuperelevation * 100).toFixed(2)}%)`,
      category: 'Superelevation',
      description: `Cross-slope banking designed per IRC: 73 for V = ${state.speedKmph} km/h, R = ${state.radiusM} m. Outer edge elevation = +${(outerRaise * 1000).toFixed(0)} mm. Status: ${calc.designSummary}`,
      specReference: 'IRC: 73-1980 Clause 7.2',
      dimensions: `Width: ${totalW.toFixed(2)} m, Slope e: ${(calc.providedSuperelevation * 100).toFixed(2)}% (1 in ${(1 / calc.providedSuperelevation).toFixed(1)})`,
      formula: 'e = V² / (225 R) for 75% design speed counteracting centrifugal force',
    });

    // Extra Widening Ribbon highlight on the inner curve side
    const widenGeo = new THREE.BoxGeometry(widening.totalWideningM, 0.36, roadL);
    const widenMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const widenMesh = new THREE.Mesh(widenGeo, widenMat);
    widenMesh.rotation.z = bankAngle;
    const widenOffset = -totalW / 2 + widening.totalWideningM / 2;
    widenMesh.position.set(
      widenOffset * Math.cos(bankAngle),
      yCenter + widenOffset * Math.sin(bankAngle),
      0
    );
    this.wideningOverlayGroup.add(widenMesh);

    this.registerInteractive(widenMesh, {
      id: 'extra-widening',
      name: `Curve Extra Widening We = ${widening.totalWideningM} m`,
      category: 'Widening (IRC: 73)',
      description: `Mechanical widening Wm = ${widening.mechanicalWideningM} m (off-tracking of rear wheels) + Psychological widening Wps = ${widening.psychologicalWideningM} m (steering difficulty at speed). Total width = ${widening.totalRoadWidthM} m.`,
      specReference: 'IRC: 73-1980 Clause 7.5',
      dimensions: `Wm: ${widening.mechanicalWideningM} m, Wps: ${widening.psychologicalWideningM} m`,
      formula: 'We = Wm + Wps = (n·l²)/(2R) + V/(9.5√R)',
    });

    // Vehicle sitting on banked road
    const carGroup = new THREE.Group();
    const carBodyGeo = new THREE.BoxGeometry(2.0, 1.0, 4.2);
    const carBodyMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.6, roughness: 0.2 });
    const carBody = new THREE.Mesh(carBodyGeo, carBodyMat);
    carBody.position.y = 0.6;
    carGroup.add(carBody);

    const cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2.4);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.3, -0.2);
    carGroup.add(cabin);

    carGroup.rotation.z = bankAngle;
    carGroup.position.set(0, yCenter + 0.25, 0);
    this.vehicleGroup.add(carGroup);

    // Engineering Force Vectors at CG of Vehicle
    const cgPos = new THREE.Vector3(0, yCenter + 1.2, 0);

    // 1. Gravity Vector W (Downwards, Yellow)
    const arrowW = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      cgPos,
      1.6,
      0xfacc15,
      0.35,
      0.2
    );
    this.vectorsGroup.add(arrowW);

    // 2. Centrifugal Force P (Outwards to right, Red)
    const arrowP = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      cgPos,
      Math.min(2.2, 0.8 + (state.speedKmph / 100) * 1.0),
      0xef4444,
      0.35,
      0.2
    );
    this.vectorsGroup.add(arrowP);

    // 3. Normal Reaction N (Perpendicular to banked deck, Green)
    const normalDir = new THREE.Vector3(-Math.sin(bankAngle), Math.cos(bankAngle), 0).normalize();
    const arrowN = new THREE.ArrowHelper(
      normalDir,
      cgPos,
      1.8,
      0x10b981,
      0.35,
      0.2
    );
    this.vectorsGroup.add(arrowN);

    // 4. Lateral Friction Vector F (Inward down slope, Cyan)
    const frictionDir = new THREE.Vector3(-Math.cos(bankAngle), -Math.sin(bankAngle), 0).normalize();
    const arrowF = new THREE.ArrowHelper(
      frictionDir,
      cgPos,
      1.2,
      0x06b6d4,
      0.3,
      0.18
    );
    this.vectorsGroup.add(arrowF);
  }

  public update(delta: number, elapsed: number): void {
    // Gentle pulse on vectors
    const s = 1.0 + Math.sin(elapsed * 3) * 0.04;
    this.vectorsGroup.scale.set(s, s, s);
  }
}
