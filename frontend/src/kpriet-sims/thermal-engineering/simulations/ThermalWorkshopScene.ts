/**
 * Module 8: Unified 3D Thermal Engineering Laboratory Bay
 * Unites Conduction test rig, Heat Exchanger rig, Steam Boiler, and VCR Chiller bench
 * into an integrated educational digital twin workshop.
 */

import * as THREE from 'three';
import { BaseThermalScene } from './BaseThermalScene';

export class ThermalWorkshopScene extends BaseThermalScene {
  private activeStation: 'all' | 'conduction' | 'exchanger' | 'boiler' | 'refrigeration' = 'all';

  public initScene(): void {
    this.createWorkshopLayout();
    this.createConductionRig(new THREE.Vector3(-6, 0, -5));
    this.createExchangerRig(new THREE.Vector3(6, 0, -5));
    this.createBoilerRig(new THREE.Vector3(-6, 0, 5));
    this.createRefrigerationRig(new THREE.Vector3(6, 0, 5));
  }

  private createWorkshopLayout(): void {
    // Demarcation yellow boundary lines on the shop floor
    const stations: Array<[number, number]> = [[-6, -5], [6, -5], [-6, 5], [6, 5]];
    for (const [x, z] of stations) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x - 3.5, 0.02, z - 3.5),
        new THREE.Vector3(x + 3.5, 0.02, z - 3.5),
        new THREE.Vector3(x + 3.5, 0.02, z + 3.5),
        new THREE.Vector3(x - 3.5, 0.02, z + 3.5),
        new THREE.Vector3(x - 3.5, 0.02, z - 3.5),
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: '#facc15', linewidth: 2 });
      const line = new THREE.Line(lineGeo, lineMat);
      this.scene.add(line);
    }
  }

  private createConductionRig(pos: THREE.Vector3): void {
    const group = new THREE.Group();
    // Workbench table
    const tableGeo = new THREE.BoxGeometry(4.5, 1.2, 2.5);
    const tableMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.6, 0);
    group.add(table);

    // Guarded hot plate cylinder apparatus
    const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.0, 24);
    cylGeo.rotateZ(Math.PI / 2);
    const cylMat = new THREE.MeshStandardMaterial({ color: '#f97316', metalness: 0.7, roughness: 0.3 });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.set(0, 1.5, 0);
    group.add(cyl);

    group.position.copy(pos);
    this.scene.add(group);
  }

  private createExchangerRig(pos: THREE.Vector3): void {
    const group = new THREE.Group();
    const tableGeo = new THREE.BoxGeometry(4.5, 1.2, 2.5);
    const tableMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.6, 0);
    group.add(table);

    // Double-pipe heat exchanger tube
    const tubeGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.2, 24);
    tubeGeo.rotateZ(Math.PI / 2);
    const tubeMat = new THREE.MeshPhysicalMaterial({ color: '#38bdf8', transparent: true, opacity: 0.7, roughness: 0.2 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.set(0, 1.6, 0);
    group.add(tube);

    group.position.copy(pos);
    this.scene.add(group);
  }

  private createBoilerRig(pos: THREE.Vector3): void {
    const group = new THREE.Group();
    // Firebox base
    const baseGeo = new THREE.BoxGeometry(2.5, 1.4, 2.5);
    const baseMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.7, 0);
    group.add(base);

    // Steam drum on top
    const drumGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 24);
    drumGeo.rotateZ(Math.PI / 2);
    const drumMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8, roughness: 0.25 });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drum.position.set(0, 2.1, 0);
    group.add(drum);

    group.position.copy(pos);
    this.scene.add(group);
  }

  private createRefrigerationRig(pos: THREE.Vector3): void {
    const group = new THREE.Group();
    const tableGeo = new THREE.BoxGeometry(4.5, 1.2, 2.5);
    const tableMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.6, 0);
    group.add(table);

    // Compressor dome
    const compGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.9, 20);
    const compMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9 });
    const comp = new THREE.Mesh(compGeo, compMat);
    comp.position.set(-1.0, 1.65, 0);
    group.add(comp);

    // Finned coil
    const coilGeo = new THREE.BoxGeometry(1.6, 0.8, 0.3);
    const coilMat = new THREE.MeshStandardMaterial({ color: '#06b6d4', metalness: 0.6, roughness: 0.4 });
    const coil = new THREE.Mesh(coilGeo, coilMat);
    coil.position.set(0.8, 1.7, 0);
    group.add(coil);

    group.position.copy(pos);
    this.scene.add(group);
  }

  public setStation(station: 'all' | 'conduction' | 'exchanger' | 'boiler' | 'refrigeration'): void {
    this.activeStation = station;
    if (station === 'conduction') {
      this.cameraTarget.set(-6, 1.5, -5);
      this.cameraRadius = 8;
    } else if (station === 'exchanger') {
      this.cameraTarget.set(6, 1.5, -5);
      this.cameraRadius = 8;
    } else if (station === 'boiler') {
      this.cameraTarget.set(-6, 1.8, 5);
      this.cameraRadius = 8;
    } else if (station === 'refrigeration') {
      this.cameraTarget.set(6, 1.5, 5);
      this.cameraRadius = 8;
    } else {
      this.cameraTarget.set(0, 1.5, 0);
      this.cameraRadius = 22;
    }
    this.updateCameraPosition();
  }

  public setParameters(params: { station?: 'all' | 'conduction' | 'exchanger' | 'boiler' | 'refrigeration' }): void {
    if (params.station) this.setStation(params.station);
  }

  public update(_delta: number): void {
    // Idle rotation when showing all stations
    if (this.activeStation === 'all' && !this.isDragging) {
      this.cameraTheta += 0.001;
      this.updateCameraPosition();
    }
  }
}
