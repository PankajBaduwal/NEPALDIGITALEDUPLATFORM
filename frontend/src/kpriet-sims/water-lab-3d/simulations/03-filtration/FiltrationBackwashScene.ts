/**
 * Module 3: Rapid Sand Filtration & Fluidized Bed Backwashing
 * U25CE403 — Water Supply and Wastewater Engineering
 * Cutaway Rapid Filter Box with Graded Sand, Underdrains, Troughs & Dynamic Bed Expansion
 */

import * as THREE from 'three';
import { BaseWaterSimulation, type IBaseWaterSimulationOptions } from '../../core/BaseWaterSimulation';
import type { IFiltrationState } from '../../core/types';
import { EnvironmentalCalculator } from '../../core/EnvironmentalCalculator';

export class FiltrationBackwashScene extends BaseWaterSimulation {
  private filterBoxGroup: THREE.Group;
  private sandBedMesh: THREE.Mesh | null = null;
  private bubblesGroup: THREE.Group;
  private isBackwashing = false;
  private baseSandHeight = 1.2;
  private targetSandHeight = 1.2;
  private currentSandHeight = 1.2;

  constructor(options: IBaseWaterSimulationOptions) {
    super(options);
    this.filterBoxGroup = new THREE.Group();
    this.bubblesGroup = new THREE.Group();
    this.waterLabGroup.add(this.filterBoxGroup);
    this.waterLabGroup.add(this.bubblesGroup);

    this.defaultCameraPos.set(0, 5, 10);
    this.defaultTarget.set(0, 1.8, 0);
    this.resetCamera();
  }

  public rebuildFilter(state: IFiltrationState): void {
    while (this.filterBoxGroup.children.length > 0) {
      const child = this.filterBoxGroup.children[0];
      if (child) {
        this.filterBoxGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }
    while (this.bubblesGroup.children.length > 0) {
      const child = this.bubblesGroup.children[0];
      if (child) {
        this.bubblesGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }

    this.isBackwashing = state.isBackwashing;
    const calc = EnvironmentalCalculator.calculateFiltration(state);
    const boxW = 5.0;
    const boxL = 5.0;
    const boxH = 4.0;

    // Bed expansion target
    this.baseSandHeight = state.sandDepthM * 2.0; // scale for visualization
    const expansionRatio = 1.0 + (calc.bedExpansionPercent / 100.0);
    this.targetSandHeight = state.isBackwashing ? this.baseSandHeight * expansionRatio : this.baseSandHeight;

    // Materials
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.2,
      transmission: 0.95,
      roughness: 0.05,
    });
    const gravelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 });
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 }); // Filter sand
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.55 });

    // 1. Concrete Filter Box (3 walls + base)
    const baseGeo = new THREE.BoxGeometry(boxW, 0.4, boxL);
    const base = new THREE.Mesh(baseGeo, concreteMat);
    base.position.y = 0.2;
    this.filterBoxGroup.add(base);

    // Front Glass Cutaway Wall
    const glassGeo = new THREE.BoxGeometry(boxW, boxH, 0.1);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, boxH / 2 + 0.4, boxL / 2);
    this.filterBoxGroup.add(glass);

    // Back & Side Concrete Walls
    const backWall = new THREE.Mesh(glassGeo, concreteMat);
    backWall.position.set(0, boxH / 2 + 0.4, -boxL / 2);
    this.filterBoxGroup.add(backWall);

    const sideGeo = new THREE.BoxGeometry(0.1, boxH, boxL);
    const leftWall = new THREE.Mesh(sideGeo, concreteMat);
    leftWall.position.set(-boxW / 2, boxH / 2 + 0.4, 0);
    this.filterBoxGroup.add(leftWall);

    // 2. Underdrain Manifold & Perforated Laterals
    const manifoldGeo = new THREE.CylinderGeometry(0.15, 0.15, boxL - 0.6, 16);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const manifold = new THREE.Mesh(manifoldGeo, metalMat);
    manifold.rotation.x = Math.PI / 2;
    manifold.position.set(0, 0.55, 0);
    this.filterBoxGroup.add(manifold);

    // Lateral pipes branching off
    for (let z = -boxL / 2 + 0.8; z <= boxL / 2 - 0.8; z += 0.8) {
      const latGeo = new THREE.CylinderGeometry(0.04, 0.04, boxW - 0.6, 12);
      const lateral = new THREE.Mesh(latGeo, metalMat);
      lateral.rotation.z = Math.PI / 2;
      lateral.position.set(0, 0.55, z);
      this.filterBoxGroup.add(lateral);
    }

    // 3. Supporting Graded Gravel Bed (0.45m thickness)
    const gravelGeo = new THREE.BoxGeometry(boxW - 0.2, 0.6, boxL - 0.2);
    const gravel = new THREE.Mesh(gravelGeo, gravelMat);
    gravel.position.set(0, 0.9, 0);
    this.filterBoxGroup.add(gravel);

    // 4. Sand Filter Bed (0.6m thickness, dynamic expansion)
    const sandGeo = new THREE.BoxGeometry(boxW - 0.2, this.currentSandHeight, boxL - 0.2);
    this.sandBedMesh = new THREE.Mesh(sandGeo, sandMat);
    this.sandBedMesh.position.set(0, 1.2 + this.currentSandHeight / 2, 0);
    this.filterBoxGroup.add(this.sandBedMesh);

    // 5. Standing Water Layer Above Bed
    const waterGeo = new THREE.BoxGeometry(boxW - 0.2, 1.2, boxL - 0.2);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 3.0, 0);
    this.filterBoxGroup.add(water);

    // 6. Washwater Troughs (V-shaped concrete gutters at top)
    const troughGeo = new THREE.BoxGeometry(0.5, 0.4, boxL - 0.2);
    const trough1 = new THREE.Mesh(troughGeo, concreteMat);
    trough1.position.set(-1.4, 3.4, 0);
    this.filterBoxGroup.add(trough1);

    const trough2 = new THREE.Mesh(troughGeo, concreteMat);
    trough2.position.set(1.4, 3.4, 0);
    this.filterBoxGroup.add(trough2);

    // 7. Air Scour / Fluidization Bubbles
    if (state.isBackwashing) {
      const bubbleGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
      for (let i = 0; i < 40; i++) {
        const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
        bubble.position.set(
          -boxW / 2 + 0.4 + Math.random() * (boxW - 0.8),
          1.2 + Math.random() * 2.2,
          -boxL / 2 + 0.4 + Math.random() * (boxL - 0.8)
        );
        this.bubblesGroup.add(bubble);
      }
    }

    this.registerInteractive(this.sandBedMesh, {
      id: 'filter-media',
      name: `Quartz Filter Sand Bed (${state.sandDepthM} m Depth, D10 = ${state.effectiveSizeD10Mm} mm)`,
      category: 'Filter Media',
      description: `Filtration rate: ${state.filtrationRateM3M2Hr} m³/(m²·hr) (5000 L/m²/hr). Clean head loss: ${calc.cleanBedHeadLossM} m. Current clogged head loss: ${calc.cloggedHeadLossM} m. Fluidized bed expansion: ${calc.bedExpansionPercent}%.`,
      specReference: 'IS: 8419-1977 / CPHEEO',
      dimensions: `Area: ${state.bedAreaM2} m², Depth: ${state.sandDepthM} m, Cu: ${state.uniformityCoeffCu}`,
      formula: 'Carmen-Kozeny Head Loss: hf = f\' · [(1-e)/e³] · (L/d) · (v²/g)',
    });
  }

  public setBackwashMode(isBackwash: boolean): void {
    this.isBackwashing = isBackwash;
    this.targetSandHeight = isBackwash ? this.baseSandHeight * 1.3 : this.baseSandHeight;
  }

  public update(delta: number, elapsed: number): void {
    // Smooth bed expansion transition
    if (this.sandBedMesh && Math.abs(this.currentSandHeight - this.targetSandHeight) > 0.01) {
      this.currentSandHeight += (this.targetSandHeight - this.currentSandHeight) * delta * 4;
      this.sandBedMesh.scale.y = this.currentSandHeight / this.baseSandHeight;
      this.sandBedMesh.position.y = 1.2 + this.currentSandHeight / 2;
    }

    // Rise bubbles during backwashing
    if (this.isBackwashing) {
      this.bubblesGroup.children.forEach((b) => {
        b.position.y += delta * 1.5;
        if (b.position.y > 3.6) {
          b.position.y = 1.2 + Math.random() * 0.3;
        }
      });
    }
  }
}
