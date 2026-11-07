/**
 * 3D Casting Processes and Mould Design Visualizer
 * Shows Cope & Drag mould cross-section, pouring basin, sprue, runner, riser,
 * molten metal flow animation, thermal solidification color gradient, and shakeout.
 */

import * as THREE from 'three';
import { BaseManufacturing2Scene } from './BaseManufacturing2Scene';

export class CastingScene extends BaseManufacturing2Scene {
  private mouldGroup = new THREE.Group();
  private copeBox!: THREE.Mesh;
  private dragBox!: THREE.Mesh;
  private moltenStream!: THREE.Mesh;
  private castingPart!: THREE.Mesh;
  private riserMesh!: THREE.Mesh;

  private isPouring = false;
  private pourProgress = 0;
  private isSolidifying = false;
  private solidProgress = 0;
  private mouldOpen = false;

  constructor(container: HTMLElement) {
    super(container);
    this.cameraRadius = 13;
    this.cameraTarget.set(0, 1.8, 0);
    this.updateCameraPosition();

    this.scene.add(this.mouldGroup);
    this.buildMouldAssembly();
  }

  private buildMouldAssembly(): void {
    // 1. Lower Drag Mould Box (Green sand brownish grey)
    const dragGeo = new THREE.BoxGeometry(6.5, 1.8, 5.0);
    const sandMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, metalness: 0.1 });
    this.dragBox = new THREE.Mesh(dragGeo, sandMat);
    this.dragBox.position.set(0, 0.9, 0);
    this.mouldGroup.add(this.dragBox);

    // 2. Upper Cope Mould Box
    const copeGeo = new THREE.BoxGeometry(6.5, 1.8, 5.0);
    this.copeBox = new THREE.Mesh(copeGeo, sandMat);
    this.copeBox.position.set(0, 2.7, 0);
    this.mouldGroup.add(this.copeBox);

    // Flask Clamps & Alignment Pins
    const pinGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 16);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
    const pinLeft = new THREE.Mesh(pinGeo, pinMat);
    pinLeft.position.set(-3.1, 1.8, 0);
    const pinRight = new THREE.Mesh(pinGeo, pinMat);
    pinRight.position.set(3.1, 1.8, 0);
    this.mouldGroup.add(pinLeft, pinRight);

    // 3. Pouring Basin & Tapered Sprue Channel
    const sprueGeo = new THREE.CylinderGeometry(0.35, 0.22, 1.8, 24);
    const channelMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Hot metal red
    const sprue = new THREE.Mesh(sprueGeo, channelMat);
    sprue.position.set(-1.8, 2.7, 0);
    this.mouldGroup.add(sprue);

    // 4. Casting Cavity / Finished Casting (Flanged Mechanical Part)
    const cavityGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.9, 32);
    const castMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Initial molten state
      roughness: 0.4,
      metalness: 0.6,
    });
    this.castingPart = new THREE.Mesh(cavityGeo, castMat);
    this.castingPart.position.set(0.3, 1.6, 0);
    this.mouldGroup.add(this.castingPart);

    // 5. Feeder Riser (Top Cylindrical)
    const riserGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.6, 24);
    this.riserMesh = new THREE.Mesh(riserGeo, castMat);
    this.riserMesh.position.set(0.3, 2.8, 0);
    this.mouldGroup.add(this.riserMesh);

    // Pouring Ladle Stream
    const streamGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 12);
    const streamMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    this.moltenStream = new THREE.Mesh(streamGeo, streamMat);
    this.moltenStream.position.set(-1.8, 4.2, 0);
    this.moltenStream.visible = false;
    this.mouldGroup.add(this.moltenStream);
  }

  public startPouring(): void {
    this.isPouring = true;
    this.isSolidifying = false;
    this.pourProgress = 0;
    this.solidProgress = 0;
    this.moltenStream.visible = true;
  }

  public toggleMouldSeparation(): void {
    this.mouldOpen = !this.mouldOpen;
    this.copeBox.position.y = this.mouldOpen ? 4.8 : 2.7;
    this.riserMesh.visible = this.mouldOpen;
  }

  public resetCasting(): void {
    this.isPouring = false;
    this.isSolidifying = false;
    this.pourProgress = 0;
    this.solidProgress = 0;
    this.moltenStream.visible = false;
    this.mouldOpen = false;
    this.copeBox.position.y = 2.7;
    (this.castingPart.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
  }

  public update(delta: number): void {
    if (this.isPouring) {
      this.pourProgress += delta * 0.4;
      if (this.pourProgress >= 1.0) {
        this.isPouring = false;
        this.moltenStream.visible = false;
        this.isSolidifying = true;
      }
    }

    if (this.isSolidifying) {
      this.solidProgress += delta * 0.25;
      // Thermal cooling color transition: Red 0xef4444 -> Orange 0xf97316 -> Dark Grey 0x334155
      const mat = this.castingPart.material as THREE.MeshStandardMaterial;
      if (this.solidProgress < 0.5) {
        mat.color.lerpColors(new THREE.Color(0xef4444), new THREE.Color(0xf97316), this.solidProgress * 2);
      } else {
        mat.color.lerpColors(new THREE.Color(0xf97316), new THREE.Color(0x334155), (this.solidProgress - 0.5) * 2);
      }

      if (this.solidProgress >= 1.0) {
        this.isSolidifying = false;
      }
    }
  }
}
