/**
 * 3D Metal Forming Processes Visualizer
 * Simulates Forging, Extrusion, Rolling, and Drawing with plastic deformation kinematics.
 */

import * as THREE from 'three';
import { BaseManufacturing2Scene } from './BaseManufacturing2Scene';
import type { FormingProcess } from '../core/types';

export class FormingScene extends BaseManufacturing2Scene {
  private activeProcess: FormingProcess = 'forging';

  // Forging Meshes
  private forgingGroup = new THREE.Group();
  private upperDie!: THREE.Mesh;
  private lowerDie!: THREE.Mesh;
  private billetMesh!: THREE.Mesh;

  // Extrusion Meshes
  private extrusionGroup = new THREE.Group();
  private ramMesh!: THREE.Mesh;
  private containerMesh!: THREE.Mesh;
  private extrudedProfile!: THREE.Mesh;

  // Rolling Meshes
  private rollingGroup = new THREE.Group();
  private topRoll!: THREE.Mesh;
  private bottomRoll!: THREE.Mesh;
  private rollingSheet!: THREE.Mesh;

  // Drawing Meshes
  private drawingGroup = new THREE.Group();
  private drawingDie!: THREE.Mesh;
  private drawnWire!: THREE.Mesh;

  private isDeforming = false;
  private strokeProgress = 0;

  constructor(container: HTMLElement) {
    super(container);
    this.cameraRadius = 12;
    this.cameraTarget.set(0, 1.6, 0);
    this.updateCameraPosition();

    this.scene.add(this.forgingGroup);
    this.scene.add(this.extrusionGroup);
    this.scene.add(this.rollingGroup);
    this.scene.add(this.drawingGroup);

    this.buildForging();
    this.buildExtrusion();
    this.buildRolling();
    this.buildDrawing();

    this.switchProcess('forging');
  }

  private buildForging(): void {
    const dieMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
    const hotMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5, metalness: 0.6 }); // Hot forging billet

    // Lower Stationary Anvil Die
    this.lowerDie = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 1.2, 32), dieMat);
    this.lowerDie.position.set(0, 0.6, 0);
    this.forgingGroup.add(this.lowerDie);

    // Upper Moving Press Die
    this.upperDie = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.2, 32), dieMat);
    this.upperDie.position.set(0, 3.2, 0);
    this.forgingGroup.add(this.upperDie);

    // Compressible Billet
    this.billetMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.4, 32), hotMat);
    this.billetMesh.position.set(0, 1.9, 0);
    this.forgingGroup.add(this.billetMesh);
  }

  private buildExtrusion(): void {
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
    const billetMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5, metalness: 0.7 });

    // Extrusion Container Tube
    this.containerMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4.0, 32, 1, true), steelMat);
    this.containerMesh.rotation.z = Math.PI / 2;
    this.containerMesh.position.set(-0.5, 1.6, 0);
    this.extrusionGroup.add(this.containerMesh);

    // Moving Ram Stem & Dummy Block
    this.ramMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 3.5, 32), steelMat);
    this.ramMesh.rotation.z = Math.PI / 2;
    this.ramMesh.position.set(-3.5, 1.6, 0);
    this.extrusionGroup.add(this.ramMesh);

    // Emerging Extruded Profile (I-beam or hollow rod)
    this.extrudedProfile = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3.0, 16), billetMat);
    this.extrudedProfile.rotation.z = Math.PI / 2;
    this.extrudedProfile.position.set(2.5, 1.6, 0);
    this.extrudedProfile.scale.set(1, 0.05, 1);
    this.extrusionGroup.add(this.extrudedProfile);
  }

  private buildRolling(): void {
    const rollMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.2, metalness: 0.9 });
    const sheetMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.8 });

    // Two-High Mill Work Rolls
    this.topRoll = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 4.0, 32), rollMat);
    this.topRoll.rotation.x = Math.PI / 2;
    this.topRoll.position.set(0, 2.7, 0);
    this.rollingGroup.add(this.topRoll);

    this.bottomRoll = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 4.0, 32), rollMat);
    this.bottomRoll.rotation.x = Math.PI / 2;
    this.bottomRoll.position.set(0, 0.5, 0);
    this.rollingGroup.add(this.bottomRoll);

    // Continuous Sheet entering thick and exiting thinner
    this.rollingSheet = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.4, 3.0), sheetMat);
    this.rollingSheet.position.set(0, 1.6, 0);
    this.rollingGroup.add(this.rollingSheet);
  }

  private buildDrawing(): void {
    const dieMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.95 }); // Tungsten carbide
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.85 }); // Copper wire

    // Tapered Drawing Die
    this.drawingDie = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.5, 1.0, 24), dieMat);
    this.drawingDie.rotation.z = Math.PI / 2;
    this.drawingDie.position.set(0, 1.6, 0);
    this.drawingGroup.add(this.drawingDie);

    // Wire pulled through
    this.drawnWire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6.0, 16), wireMat);
    this.drawnWire.rotation.z = Math.PI / 2;
    this.drawnWire.position.set(1.5, 1.6, 0);
    this.drawingGroup.add(this.drawnWire);
  }

  public switchProcess(process: FormingProcess): void {
    this.activeProcess = process;
    this.forgingGroup.visible = process === 'forging';
    this.extrusionGroup.visible = process === 'extrusion';
    this.rollingGroup.visible = process === 'rolling';
    this.drawingGroup.visible = process === 'drawing';
    this.resetForming();
  }

  public startForming(): void {
    this.isDeforming = true;
  }

  public resetForming(): void {
    this.isDeforming = false;
    this.strokeProgress = 0;
    this.upperDie.position.y = 3.2;
    this.billetMesh.scale.set(1, 1, 1);
    this.ramMesh.position.x = -3.5;
    this.extrudedProfile.scale.set(1, 0.05, 1);
    this.rollingSheet.position.x = 0;
  }

  public update(delta: number): void {
    if (this.activeProcess === 'forging') {
      if (this.isDeforming) {
        this.strokeProgress = Math.min(1.0, this.strokeProgress + delta * 0.6);
        // Ram moves down
        this.upperDie.position.y = 3.2 - this.strokeProgress * 0.8;
        // Billet flattens and barrels outward (conservation of volume: h down -> radius up)
        const scaleY = 1.0 - this.strokeProgress * 0.5;
        const scaleXZ = 1.0 / Math.sqrt(scaleY);
        this.billetMesh.scale.set(scaleXZ, scaleY, scaleXZ);
        this.billetMesh.position.y = 1.2 + (0.7 * scaleY);
      }
    } else if (this.activeProcess === 'rolling') {
      // Rotate work rolls
      this.topRoll.rotation.z -= 4 * delta;
      this.bottomRoll.rotation.z += 4 * delta;
      if (this.isDeforming) {
        this.rollingSheet.position.x += 1.8 * delta;
        if (this.rollingSheet.position.x > 3.0) this.rollingSheet.position.x = -3.0;
      }
    } else if (this.activeProcess === 'extrusion') {
      if (this.isDeforming) {
        this.strokeProgress = Math.min(1.0, this.strokeProgress + delta * 0.4);
        this.ramMesh.position.x = -3.5 + this.strokeProgress * 2.0;
        this.extrudedProfile.scale.set(1, this.strokeProgress * 1.5, 1);
      }
    } else if (this.activeProcess === 'drawing') {
      if (this.isDeforming) {
        this.drawnWire.position.x += 2.0 * delta;
        if (this.drawnWire.position.x > 3.5) this.drawnWire.position.x = 0.5;
      }
    }
  }
}
