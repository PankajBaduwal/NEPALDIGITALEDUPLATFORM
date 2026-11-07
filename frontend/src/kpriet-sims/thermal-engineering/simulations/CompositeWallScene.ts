/**
 * Module 2: Composite Wall & Thermal Resistance 3D Scene
 * Visualizes multi-layer solid plane walls in series with 3D temperature profile polyline,
 * interface temperature drop slopes, and convective boundary films.
 */

import * as THREE from 'three';
import { BaseThermalScene } from './BaseThermalScene';
import type { CompositeWallParams, LayerCalculation } from '../core/types';

export class CompositeWallScene extends BaseThermalScene {
  private layerMeshes: THREE.Mesh[] = [];
  private tempLineMesh: THREE.Line | null = null;
  private fluxArrow: THREE.ArrowHelper | null = null;

  private currentParams: CompositeWallParams = {
    layers: [
      { id: '1', name: 'Refractory Firebrick', material: 'refractory-brick', thicknessMM: 120, thermalConductivityWMK: 1.25 },
      { id: '2', name: 'Glass Wool Insulation', material: 'glass-wool', thicknessMM: 80, thermalConductivityWMK: 0.038 },
      { id: '3', name: 'Structural Steel Shell', material: 'mild-steel', thicknessMM: 20, thermalConductivityWMK: 54.0 },
    ],
    surfaceAreaM2: 2.0,
    insideTempC: 800,
    outsideTempC: 35,
    innerConvectionH: 50,
    outerConvectionH: 20,
  };

  private currentCalcs: LayerCalculation[] = [];

  public initScene(): void {
    this.rebuildWall();
  }

  public setParameters(params: { wallParams?: CompositeWallParams; calcs?: LayerCalculation[] }): void {
    if (params.wallParams) this.currentParams = params.wallParams;
    if (params.calcs) this.currentCalcs = params.calcs;
    this.rebuildWall();
  }

  private rebuildWall(): void {
    // Clean old layers
    this.layerMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.layerMeshes = [];

    if (this.tempLineMesh) {
      this.scene.remove(this.tempLineMesh);
      this.tempLineMesh.geometry.dispose();
      (this.tempLineMesh.material as THREE.Material).dispose();
      this.tempLineMesh = null;
    }

    if (this.fluxArrow) {
      this.scene.remove(this.fluxArrow);
      this.fluxArrow = null;
    }

    const layers = this.currentParams.layers;
    const totalThickMM = layers.reduce((acc, l) => acc + l.thicknessMM, 0);
    const wallHeight = 4.0;
    const wallDepth = 3.5;
    const maxVisualWidth = 6.0;

    let startX = -maxVisualWidth / 2;
    const tempPoints: THREE.Vector3[] = [];

    // Inner convective ambient point
    const tMax = Math.max(100, this.currentParams.insideTempC);
    const tMin = this.currentParams.outsideTempC;
    const tempToY = (t: number) => {
      const norm = (t - tMin) / Math.max(1, tMax - tMin);
      return 0.5 + norm * 3.0; // Y height 0.5 to 3.5
    };

    tempPoints.push(new THREE.Vector3(startX - 0.8, tempToY(this.currentParams.insideTempC), 0));

    const colorPalette = ['#e11d48', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

    for (let i = 0; i < layers.length; i++) {
      const l = layers[i]!;
      const visualWidth = Math.max(0.4, (l.thicknessMM / totalThickMM) * maxVisualWidth);
      const centerX = startX + visualWidth / 2;

      // Layer box
      const geo = new THREE.BoxGeometry(visualWidth, wallHeight, wallDepth);
      const color = colorPalette[i % colorPalette.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: l.material === 'glass-wool' ? 0.9 : 0.4,
        metalness: l.material === 'mild-steel' ? 0.8 : 0.1,
        transparent: true,
        opacity: 0.85,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(centerX, wallHeight / 2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.layerMeshes.push(mesh);

      // Temperature line points at interfaces
      const calc = this.currentCalcs[i];
      const leftT = calc ? calc.interfaceTempLeftC : this.currentParams.insideTempC - i * 150;
      const rightT = calc ? calc.interfaceTempRightC : leftT - 100;

      tempPoints.push(new THREE.Vector3(startX, tempToY(leftT), wallDepth / 2 + 0.1));
      tempPoints.push(new THREE.Vector3(startX + visualWidth, tempToY(rightT), wallDepth / 2 + 0.1));

      startX += visualWidth;
    }

    // Outer convective ambient point
    tempPoints.push(new THREE.Vector3(startX + 0.8, tempToY(this.currentParams.outsideTempC), 0));

    // Create 3D Temperature Profile Curve
    const lineGeo = new THREE.BufferGeometry().setFromPoints(tempPoints);
    const lineMat = new THREE.LineBasicMaterial({ color: '#facc15', linewidth: 3 });
    this.tempLineMesh = new THREE.Line(lineGeo, lineMat);
    this.scene.add(this.tempLineMesh);

    // Heat Flux Arrow passing through the wall center
    this.fluxArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-maxVisualWidth / 2 - 1.2, wallHeight / 2, 0),
      maxVisualWidth + 2.4,
      '#f97316',
      0.6,
      0.35
    );
    this.scene.add(this.fluxArrow);
  }

  public update(_delta: number): void {
    // Gentle arrow pulsing
    if (this.fluxArrow) {
      const pulse = 1.0 + Math.sin(performance.now() * 0.003) * 0.05;
      this.fluxArrow.scale.set(1, pulse, pulse);
    }
  }
}
