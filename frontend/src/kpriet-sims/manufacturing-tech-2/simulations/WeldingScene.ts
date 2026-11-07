/**
 * 3D Welding Processes & Weld Joint Visualizer
 * Visualizes SMAW, GMAW, GTAW with 5 standard joint configurations,
 * dynamic electric arc, traveling molten pool, HAZ gradient, and defect flags.
 */

import * as THREE from 'three';
import { BaseManufacturing2Scene } from './BaseManufacturing2Scene';
import type { WeldingProcess, WeldJointType } from '../core/types';

export class WeldingScene extends BaseManufacturing2Scene {
  private platesGroup = new THREE.Group();
  private torchGroup = new THREE.Group();
  private arcLight!: THREE.PointLight;
  private weldBeadMesh!: THREE.Mesh;
  private hazMesh!: THREE.Mesh;

  private currentProcess: WeldingProcess = 'gmaw';
  private currentJoint: WeldJointType = 'butt';
  private isWelding = false;
  private progress = 0;

  constructor(container: HTMLElement) {
    super(container);
    this.cameraRadius = 10;
    this.cameraTarget.set(0, 1.2, 0);
    this.updateCameraPosition();

    this.scene.add(this.platesGroup);
    this.scene.add(this.torchGroup);

    this.buildTorch();
    this.buildJoint('butt');
  }

  private buildTorch(): void {
    // Torch Body / Handle
    const handleGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 16);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.z = Math.PI / 4;
    handle.position.set(0.8, 2.8, 0);
    this.torchGroup.add(handle);

    // Copper Gas Nozzle / Cup
    const nozzleGeo = new THREE.ConeGeometry(0.35, 1.2, 16);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.9 });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(0, 1.8, 0);
    this.torchGroup.add(nozzle);

    // Tungsten / Wire Electrode
    const wireGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.set(0, 1.1, 0);
    this.torchGroup.add(wire);

    // Dynamic Electric Arc Light (Bright Blue/White)
    this.arcLight = new THREE.PointLight(0x60a5fa, 0, 8);
    this.arcLight.position.set(0, 0.7, 0);
    this.torchGroup.add(this.arcLight);
  }

  public buildJoint(jointType: WeldJointType): void {
    this.currentJoint = jointType;

    // Clear previous plate geometry
    while (this.platesGroup.children.length > 0) {
      const obj = this.platesGroup.children[0]!;
      this.platesGroup.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    }

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.7 });

    if (jointType === 'butt') {
      // Two plates side-by-side with V-groove
      const plate1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 4.0), steelMat);
      plate1.position.set(-1.6, 0.5, 0);
      const plate2 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 4.0), steelMat);
      plate2.position.set(1.6, 0.5, 0);
      this.platesGroup.add(plate1, plate2);
    } else if (jointType === 'lap') {
      // Overlapping plates
      const plate1 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 4.0), steelMat);
      plate1.position.set(-1.0, 0.4, 0);
      const plate2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 4.0), steelMat);
      plate2.position.set(1.0, 0.7, 0);
      this.platesGroup.add(plate1, plate2);
    } else if (jointType === 'tee') {
      // T-joint: horizontal base plate + vertical web
      const basePlate = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.3, 4.0), steelMat);
      basePlate.position.set(0, 0.3, 0);
      const webPlate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 4.0), steelMat);
      webPlate.position.set(0, 1.7, 0);
      this.platesGroup.add(basePlate, webPlate);
    } else if (jointType === 'corner') {
      // L-shaped corner joint
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 4.0), steelMat);
      p1.position.set(-1.35, 0.3, 0);
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 4.0), steelMat);
      p2.position.set(0.3, 1.4, 0);
      this.platesGroup.add(p1, p2);
    } else {
      // Edge joint: two parallel touching plates
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.0, 4.0), steelMat);
      p1.position.set(-0.2, 1.1, 0);
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.0, 4.0), steelMat);
      p2.position.set(0.2, 1.1, 0);
      this.platesGroup.add(p1, p2);
    }

    // Solidified Weld Bead line
    const beadGeo = new THREE.CylinderGeometry(0.22, 0.22, 4.0, 16);
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.6,
      metalness: 0.6,
      wireframe: false,
    });
    this.weldBeadMesh = new THREE.Mesh(beadGeo, beadMat);
    this.weldBeadMesh.rotation.x = Math.PI / 2;
    this.weldBeadMesh.position.set(0, 0.65, 0);
    this.weldBeadMesh.scale.set(0.01, 1, 0.01); // hidden until welded
    this.platesGroup.add(this.weldBeadMesh);

    // Heat Affected Zone (HAZ) Thermal Glow
    const hazGeo = new THREE.PlaneGeometry(1.2, 4.0);
    const hazMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed, // Temper color purple/blue
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
    });
    this.hazMesh = new THREE.Mesh(hazGeo, hazMat);
    this.hazMesh.rotation.x = Math.PI / 2;
    this.hazMesh.position.set(0, 0.66, 0);
    this.platesGroup.add(this.hazMesh);
  }

  public setProcess(process: WeldingProcess): void {
    this.currentProcess = process;
  }

  public startWelding(): void {
    this.isWelding = true;
  }

  public resetWelding(): void {
    this.isWelding = false;
    this.progress = 0;
    this.torchGroup.position.set(0, 0, -2.0);
    this.arcLight.intensity = 0;
    this.weldBeadMesh.scale.set(0.01, 1, 0.01);
    (this.hazMesh.material as THREE.MeshBasicMaterial).opacity = 0;
  }

  public update(delta: number): void {
    if (this.isWelding) {
      this.progress += delta * 0.3;
      const currentZ = -2.0 + this.progress * 4.0;
      this.torchGroup.position.set(0, 0, currentZ);

      // Arc flicker
      this.arcLight.intensity = 5.0 + Math.random() * 4.0;

      // Expand weld bead
      const beadScale = Math.min(1.0, this.progress);
      this.weldBeadMesh.scale.set(beadScale, 1, beadScale);
      (this.hazMesh.material as THREE.MeshBasicMaterial).opacity = Math.min(0.5, this.progress * 0.6);

      if (this.progress >= 1.0) {
        this.isWelding = false;
        this.arcLight.intensity = 0;
      }
    }
  }
}
