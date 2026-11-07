/**
 * Engineering Survey (U25CE303) — Contour Survey & Terrain Mapping 3D Scene
 * B.E. Civil Engineering — Semester III
 * PiyushDhara Eduverse Academic Portal
 *
 * Implements:
 * - Continuous undulating 3D terrain surface with knoll, ridge, and valley.
 * - 7x7 grid survey elevation points with survey pins.
 * - Real-time contour lines interpolated directly from grid sample elevations.
 * - Orthographic top-down vs. 3D orbit camera toggling.
 */

import * as THREE from 'three';
import { BaseSurveySimulation } from '../../core/BaseSurveySimulation';
import { SurveyCalculator } from '../../core/SurveyCalculator';
import type { ContourMapModel, TerrainSamplePoint } from '../../core/types';

export class ContourScene extends BaseSurveySimulation {
  private contourModel: ContourMapModel;
  private contourLinesGroup: THREE.Group;
  private gridPinsGroup: THREE.Group;
  private terrainSurfaceMesh: THREE.Mesh | null = null;

  private contourInterval = 0.5; // meters
  private isTopDownView = false;
  private selectedPointId: string | null = null;

  constructor(container: HTMLElement) {
    super(container);

    this.contourLinesGroup = new THREE.Group();
    this.gridPinsGroup = new THREE.Group();

    this.contourModel = SurveyCalculator.generateContourModel(7, 8.0, this.contourInterval);

    this.buildTerrainMesh();
    this.buildGridPins();
    this.rebuildContourLines();

    this.scene.add(this.contourLinesGroup);
    this.scene.add(this.gridPinsGroup);
  }

  private buildTerrainMesh(): void {
    if (this.terrainSurfaceMesh) {
      this.scene.remove(this.terrainSurfaceMesh);
      this.terrainSurfaceMesh.geometry.dispose();
    }

    const { gridSize, gridSpacingM } = this.contourModel;
    const totalSpan = (gridSize - 1) * gridSpacingM;

    // High resolution grid geometry matching the sample points
    const segs = (gridSize - 1) * 6;
    const geo = new THREE.PlaneGeometry(totalSpan, totalSpan, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const wx = pos.getX(i);
        const wz = pos.getZ(i);

        // Same mathematical formula used in SurveyCalculator
        const elev =
          100.0 +
          4.2 * Math.sin(wx / 15) * Math.cos(wz / 15) +
          2.1 * Math.sin(wz / 10) +
          1.2 * Math.cos(wx / 8);

        // Visual ground height offset relative to base 100m datum
        pos.setY(i, (elev - 100.0) * 1.2);
      }
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x557a1e, // Topographic terrain green
      roughness: 0.85,
      metalness: 0.05,
      wireframe: false,
    });

    this.terrainSurfaceMesh = new THREE.Mesh(geo, mat);
    this.terrainSurfaceMesh.receiveShadow = true;
    this.scene.add(this.terrainSurfaceMesh);
  }

  private buildGridPins(): void {
    this.gridPinsGroup.clear();

    const pinGeo = new THREE.CylinderGeometry(0.06, 0.02, 0.6, 8);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }); // Yellow pin

    this.contourModel.points.forEach((pt) => {
      const pin = new THREE.Mesh(pinGeo, pinMat);
      const visualY = (pt.reducedLevel - 100.0) * 1.2 + 0.3;
      pin.position.set(pt.worldX, visualY, pt.worldZ);
      pin.castShadow = true;

      // Red flag or top marker
      const flagGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const flagMat = new THREE.MeshBasicMaterial({
        color: pt.isBenchmark ? 0xdc2626 : 0x0284c7,
      });
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.y = 0.32;
      pin.add(flag);

      this.gridPinsGroup.add(pin);
    });
  }

  public rebuildContourLines(): void {
    // Clear old lines
    while (this.contourLinesGroup.children.length > 0) {
      const child = this.contourLinesGroup.children[0] as THREE.Line;
      child.geometry.dispose();
      this.contourLinesGroup.remove(child);
    }

    this.contourModel = SurveyCalculator.generateContourModel(7, 8.0, this.contourInterval);

    // Group segments by elevation for color grading
    const segments = this.contourModel.segments;
    const { minElevation, maxElevation } = this.contourModel;
    const elevRange = maxElevation - minElevation || 1;

    segments.forEach((seg) => {
      const t = (seg.elevation - minElevation) / elevRange;
      // Elevation color gradient: Cyan -> Green -> Yellow -> Orange -> Crimson
      const color = new THREE.Color().setHSL(0.55 - t * 0.55, 0.9, 0.5);

      const y1 = (seg.elevation - 100.0) * 1.2 + 0.04; // slight elevation offset above terrain
      const y2 = (seg.elevation - 100.0) * 1.2 + 0.04;

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(seg.x1, y1, seg.z1),
        new THREE.Vector3(seg.x2, y2, seg.z2),
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color, linewidth: 2.5 });
      const line = new THREE.Line(lineGeo, lineMat);
      this.contourLinesGroup.add(line);
    });
  }

  public setContourInterval(interval: number): void {
    this.contourInterval = interval;
    this.rebuildContourLines();
  }

  public toggleViewMode(topDown: boolean): void {
    this.isTopDownView = topDown;
    if (topDown) {
      // Orthographic top-down plan view
      this.camera.position.set(0, 48, 0.001);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    } else {
      // 3D perspective oblique view
      this.camera.position.set(22, 20, 28);
      this.controls.target.set(0, 1.5, 0);
      this.controls.update();
    }
  }

  public getContourModel(): ContourMapModel {
    return this.contourModel;
  }

  public selectPoint(pt: TerrainSamplePoint | null): void {
    this.selectedPointId = pt ? pt.id : null;
  }

  public getSelectedPoint(): TerrainSamplePoint | null {
    if (!this.selectedPointId) return null;
    return this.contourModel.points.find((p) => p.id === this.selectedPointId) || null;
  }

  protected updateSimulation(): void {
    // Topographic dynamic markers
  }
}
