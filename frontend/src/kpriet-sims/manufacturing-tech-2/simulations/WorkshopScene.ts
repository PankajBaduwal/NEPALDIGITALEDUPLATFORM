/**
 * 3D Integrated Manufacturing Workshop (Module 8)
 * Brings all syllabus processes into a unified industrial shop floor environment
 * with camera presets, workpiece inspection, and real-time process switching.
 */

import * as THREE from 'three';
import { BaseManufacturing2Scene } from './BaseManufacturing2Scene';

export class WorkshopScene extends BaseManufacturing2Scene {
  private bayGroup = new THREE.Group();
  private inspectionObject!: THREE.Mesh;
  private currentMode: 'cnc' | 'non-traditional' | 'welding' | 'casting' | 'forming' = 'cnc';
  private autoRotate = false;

  constructor(container: HTMLElement) {
    super(container);
    this.cameraRadius = 16;
    this.cameraTarget.set(0, 2.0, 0);
    this.updateCameraPosition();

    this.scene.add(this.bayGroup);
    this.buildWorkshopFloor();
    this.buildInspectionPart('cnc');
  }

  private buildWorkshopFloor(): void {
    // Factory Wall & Safety Demarcation Lines
    const lineGeo = new THREE.BoxGeometry(16, 0.02, 0.2);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Yellow safety line
    const safetyLine1 = new THREE.Mesh(lineGeo, lineMat);
    safetyLine1.position.set(0, 0.01, -6);
    const safetyLine2 = new THREE.Mesh(lineGeo, lineMat);
    safetyLine2.position.set(0, 0.01, 6);
    this.bayGroup.add(safetyLine1, safetyLine2);

    // Workshop Pedestal Table
    const tableGeo = new THREE.CylinderGeometry(3.5, 3.8, 1.2, 32);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.6, 0);
    table.receiveShadow = true;
    this.bayGroup.add(table);
  }

  public buildInspectionPart(mode: 'cnc' | 'non-traditional' | 'welding' | 'casting' | 'forming'): void {
    this.currentMode = mode;

    if (this.inspectionObject) {
      this.bayGroup.remove(this.inspectionObject);
      this.inspectionObject.geometry.dispose();
    }

    if (mode === 'cnc') {
      // 5-Axis Machined Turbine Impeller / Flanged Part
      const geo = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32);
      const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.9 });
      this.inspectionObject = new THREE.Mesh(geo, mat);
      this.inspectionObject.position.set(0, 2.6, 0);
    } else if (mode === 'non-traditional') {
      // Laser / EDM Micro-perforated Combustor Liner
      const geo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 32, 1, true);
      const mat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3, metalness: 0.8, side: THREE.DoubleSide });
      this.inspectionObject = new THREE.Mesh(geo, mat);
      this.inspectionObject.position.set(0, 2.4, 0);
    } else if (mode === 'welding') {
      // High-Pressure Welded Pipe Spool Joint
      const geo = new THREE.TorusGeometry(1.4, 0.4, 24, 64);
      const mat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.4, metalness: 0.7 });
      this.inspectionObject = new THREE.Mesh(geo, mat);
      this.inspectionObject.rotation.x = Math.PI / 2;
      this.inspectionObject.position.set(0, 2.4, 0);
    } else if (mode === 'casting') {
      // Engine Cylinder Block / Pump Casing
      const geo = new THREE.DodecahedronGeometry(1.4, 1);
      const mat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6, metalness: 0.5 });
      this.inspectionObject = new THREE.Mesh(geo, mat);
      this.inspectionObject.position.set(0, 2.5, 0);
    } else {
      // Forged Automotive Connecting Rod Blank
      const geo = new THREE.CapsuleGeometry(0.8, 1.8, 16, 32);
      const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.85 });
      this.inspectionObject = new THREE.Mesh(geo, mat);
      this.inspectionObject.position.set(0, 2.5, 0);
    }

    this.inspectionObject.castShadow = true;
    this.inspectionObject.receiveShadow = true;
    this.bayGroup.add(this.inspectionObject);
  }

  public setAutoRotate(auto: boolean): void {
    this.autoRotate = auto;
  }

  public update(delta: number): void {
    if (this.autoRotate && this.inspectionObject) {
      this.inspectionObject.rotation.y += 0.8 * delta;
      this.inspectionObject.rotation.x += 0.3 * delta;
    }
  }
}
