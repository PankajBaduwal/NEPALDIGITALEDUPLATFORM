/**
 * Engineering Survey (U25CE303) — Distance Measurement & Instrument Operation 3D Scene
 * B.E. Civil Engineering — Semester III
 * PiyushDhara Eduverse Academic Portal
 *
 * Implements:
 * - Steel Taping vs. Electronic Distance Measurement (EDM).
 * - Ranging poles, spring balance tension, tape sag catenary, slope angle.
 * - Trigonometric reductions: H = S * cos(alpha), V = S * sin(alpha), RL calculation.
 */

import * as THREE from 'three';
import { BaseSurveySimulation } from '../../core/BaseSurveySimulation';
import type { DistanceTool, DistanceExperimentInput } from '../../core/types';

export class DistanceScene extends BaseSurveySimulation {
  private stationPGroup: THREE.Group;
  private stationQGroup: THREE.Group;
  private tapeMesh: THREE.Line | null = null;
  private edmBeamMesh: THREE.Line | null = null;
  private slopedTerrainMesh: THREE.Mesh | null = null;

  // Measurement State
  private tool: DistanceTool = 'total-station-edm';
  private slopeDistanceM = 30.0;
  private groundSlopeAngleDeg = 4.5; // Natural slope angle
  private instrumentHeightM = 1.50;
  private targetHeightM = 1.50;
  private stationP_RL = 100.0;
  private tapeTemperatureC = 32.0;
  private tapeTensionKg = 7.5;

  constructor(container: HTMLElement) {
    super(container);

    this.stationPGroup = new THREE.Group();
    this.stationQGroup = new THREE.Group();

    this.buildStations();
    this.updateTerrainProfile();
    this.renderMeasurementVisualization();
  }

  private buildStations(): void {
    // Station P (Origin)
    this.stationPGroup.position.set(-15, 0, 0);

    // Peg P
    const pegGeo = new THREE.BoxGeometry(0.12, 0.3, 0.12);
    const pegMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pegP = new THREE.Mesh(pegGeo, pegMat);
    pegP.position.y = 0.15;
    this.stationPGroup.add(pegP);

    // Total Station / Theodolite over Station P
    const instBodyGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.25, 16);
    const instMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    const instBody = new THREE.Mesh(instBodyGeo, instMat);
    instBody.position.y = this.instrumentHeightM;
    this.stationPGroup.add(instBody);

    // Tripod P
    for (let i = 0; i < 3; i++) {
      const legGeo = new THREE.CylinderGeometry(0.025, 0.015, this.instrumentHeightM, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const leg = new THREE.Mesh(legGeo, legMat);
      const angle = (i * 2 * Math.PI) / 3;
      leg.position.set(Math.sin(angle) * 0.4, this.instrumentHeightM / 2, Math.cos(angle) * 0.4);
      leg.rotation.z = Math.sin(angle) * 0.25;
      leg.rotation.x = -Math.cos(angle) * 0.25;
      this.stationPGroup.add(leg);
    }

    this.scene.add(this.stationPGroup);

    // Station Q (Target)
    this.scene.add(this.stationQGroup);
  }

  private updateTerrainProfile(): void {
    const slopeRad = (this.groundSlopeAngleDeg * Math.PI) / 180;
    const horizDist = this.slopeDistanceM * Math.cos(slopeRad);
    const vertRise = this.slopeDistanceM * Math.sin(slopeRad);

    // Position Station Q
    const qX = -15 + horizDist;
    const qY = vertRise;
    this.stationQGroup.position.set(qX, qY, 0);

    // Clear Station Q children and rebuild target pole & reflector
    this.stationQGroup.clear();

    // Target Peg Q
    const pegGeo = new THREE.BoxGeometry(0.12, 0.3, 0.12);
    const pegMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pegQ = new THREE.Mesh(pegGeo, pegMat);
    pegQ.position.y = 0.15;
    this.stationQGroup.add(pegQ);

    // Target Prism Pole / Ranging Rod at Q
    const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.2, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.y = 1.1;
    this.stationQGroup.add(rod);

    // Red alternating ranging bands
    for (let b = 0; b < 5; b += 2) {
      const bandGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.2, 16);
      const bandMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.y = 0.3 + b * 0.35;
      this.stationQGroup.add(band);
    }

    // Reflector Prism at target height
    const prismGeo = new THREE.BoxGeometry(0.14, 0.14, 0.04);
    const prismMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9 });
    const prism = new THREE.Mesh(prismGeo, prismMat);
    prism.position.set(0, this.targetHeightM, 0);
    this.stationQGroup.add(prism);

    // Sloped embankment plane connecting P to Q
    if (this.slopedTerrainMesh) {
      this.scene.remove(this.slopedTerrainMesh);
      this.slopedTerrainMesh.geometry.dispose();
    }

    const rampWidth = 6;
    const rampLength = Math.hypot(horizDist, vertRise) + 4;
    const rampGeo = new THREE.PlaneGeometry(rampLength, rampWidth);
    rampGeo.rotateZ(slopeRad);
    rampGeo.rotateX(-Math.PI / 2);

    const rampMat = new THREE.MeshStandardMaterial({
      color: 0x65a30d, // Grassy slope
      roughness: 0.85,
    });
    this.slopedTerrainMesh = new THREE.Mesh(rampGeo, rampMat);
    this.slopedTerrainMesh.position.set(-15 + horizDist / 2, vertRise / 2 - 0.02, 0);
    this.slopedTerrainMesh.receiveShadow = true;
    this.scene.add(this.slopedTerrainMesh);
  }

  public setMeasurementMode(tool: DistanceTool): void {
    this.tool = tool;
    this.renderMeasurementVisualization();
  }

  public setSlopeDistance(dist: number): void {
    this.slopeDistanceM = Math.max(5, Math.min(60, dist));
    this.updateTerrainProfile();
    this.renderMeasurementVisualization();
  }

  public setSlopeAngle(angleDeg: number): void {
    this.groundSlopeAngleDeg = Math.max(-10, Math.min(20, angleDeg));
    this.updateTerrainProfile();
    this.renderMeasurementVisualization();
  }

  public setTapeParameters(tempC: number, tensionKg: number): void {
    this.tapeTemperatureC = tempC;
    this.tapeTensionKg = tensionKg;
    this.renderMeasurementVisualization();
  }

  private renderMeasurementVisualization(): void {
    // Remove existing lines
    if (this.tapeMesh) {
      this.scene.remove(this.tapeMesh);
      this.tapeMesh.geometry.dispose();
      this.tapeMesh = null;
    }
    if (this.edmBeamMesh) {
      this.scene.remove(this.edmBeamMesh);
      this.edmBeamMesh.geometry.dispose();
      this.edmBeamMesh = null;
    }

    const slopeRad = (this.groundSlopeAngleDeg * Math.PI) / 180;
    const horizDist = this.slopeDistanceM * Math.cos(slopeRad);
    const vertRise = this.slopeDistanceM * Math.sin(slopeRad);

    const pPos = new THREE.Vector3(-15, this.instrumentHeightM, 0);
    const qPos = new THREE.Vector3(-15 + horizDist, vertRise + this.targetHeightM, 0);

    if (this.tool === 'total-station-edm') {
      // Crisp red infrared laser sight line
      const edmGeo = new THREE.BufferGeometry().setFromPoints([pPos, qPos]);
      const edmMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
      this.edmBeamMesh = new THREE.Line(edmGeo, edmMat);
      this.scene.add(this.edmBeamMesh);
    } else {
      // Catenary sagging steel tape curve
      const points: THREE.Vector3[] = [];
      const segments = 32;
      // Maximum sag depth proportional to (W*L)/(8*P)
      const maxSag = (0.02 * this.slopeDistanceM * this.slopeDistanceM) / (8 * Math.max(1, this.tapeTensionKg));
      const clampedSag = Math.min(0.6, maxSag * 0.15); // scaled visual sag

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = THREE.MathUtils.lerp(pPos.x, qPos.x, t);
        const yBase = THREE.MathUtils.lerp(pPos.y, qPos.y, t);
        // Parabolic / catenary sag: 4 * sag * t * (1 - t)
        const sagOffset = 4 * clampedSag * t * (1 - t);
        const y = yBase - sagOffset;
        points.push(new THREE.Vector3(x, y, 0));
      }

      const tapeGeo = new THREE.BufferGeometry().setFromPoints(points);
      const tapeMat = new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3 }); // Steel blue tape
      this.tapeMesh = new THREE.Line(tapeGeo, tapeMat);
      this.scene.add(this.tapeMesh);
    }
  }

  public getExperimentInput(): DistanceExperimentInput {
    return {
      tool: this.tool,
      slopeDistanceM: this.slopeDistanceM,
      verticalAngleDeg: this.groundSlopeAngleDeg,
      instrumentHeightM: this.instrumentHeightM,
      targetReflectorHeightM: this.targetHeightM,
      stationGroundElevationM: this.stationP_RL,
      tapeTemperatureC: this.tapeTemperatureC,
      standardTemperatureC: 20.0,
      tapeTensionKg: this.tapeTensionKg,
      standardTensionKg: 5.0,
    };
  }

  protected updateSimulation(): void {
    // Subtle laser beam pulsing
    if (this.edmBeamMesh && this.edmBeamMesh.material instanceof THREE.LineBasicMaterial) {
      this.edmBeamMesh.material.opacity = 0.8 + 0.2 * Math.sin(Date.now() * 0.01);
    }
  }

  public override dispose(): void {
    if (this.tapeMesh) {
      this.scene.remove(this.tapeMesh);
      this.tapeMesh.geometry.dispose();
    }
    if (this.edmBeamMesh) {
      this.scene.remove(this.edmBeamMesh);
      this.edmBeamMesh.geometry.dispose();
    }
    if (this.slopedTerrainMesh) {
      this.scene.remove(this.slopedTerrainMesh);
      this.slopedTerrainMesh.geometry.dispose();
    }
    super.dispose();
  }
}
