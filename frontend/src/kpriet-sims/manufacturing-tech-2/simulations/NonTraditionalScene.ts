/**
 * 3D Non-Traditional Machining Interactive Environment
 * Visualizes EDM (Spark Gap), ECM (Anodic Dissolution), Laser (Focused Beam), and Water-Jet (Supersonic Stream).
 */

import * as THREE from 'three';
import { BaseManufacturing2Scene } from './BaseManufacturing2Scene';
import type { NonTraditionalProcess } from '../core/types';

export class NonTraditionalScene extends BaseManufacturing2Scene {
  private activeProcess: NonTraditionalProcess = 'edm';
  private processGroup = new THREE.Group();

  // EDM specific
  private edmGroup = new THREE.Group();
  private electrodeMesh!: THREE.Mesh;
  private edmSparks!: THREE.Points;
  private sparkGeom = new THREE.BufferGeometry();

  // ECM specific
  private ecmGroup = new THREE.Group();
  private ecmTool!: THREE.Mesh;
  private electrolyteFlow!: THREE.Group;

  // Laser specific
  private laserGroup = new THREE.Group();
  private laserHead!: THREE.Mesh;
  private laserBeam!: THREE.Mesh;
  private laserSparks!: THREE.Points;

  // Waterjet specific
  private wjGroup = new THREE.Group();
  private wjNozzle!: THREE.Mesh;
  private wjStream!: THREE.Mesh;

  private isSimulating = false;
  private timeElapsed = 0;

  constructor(container: HTMLElement) {
    super(container);
    this.cameraRadius = 11;
    this.cameraTarget.set(0, 1.8, 0);
    this.updateCameraPosition();

    this.scene.add(this.processGroup);
    this.buildEDM();
    this.buildECM();
    this.buildLaser();
    this.buildWaterJet();

    this.switchProcess('edm');
  }

  private buildEDM(): void {
    this.processGroup.add(this.edmGroup);

    // Dielectric Tank with glass sides
    const tankGeo = new THREE.BoxGeometry(6, 2.5, 5);
    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 0.5,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 1.25;
    this.edmGroup.add(tank);

    // Tank Frame
    const frameGeo = new THREE.BoxGeometry(6.2, 0.2, 5.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
    const topFrame = new THREE.Mesh(frameGeo, frameMat);
    topFrame.position.y = 2.5;
    this.edmGroup.add(topFrame);

    // Conductive Steel Workpiece Anode (+)
    const wpGeo = new THREE.BoxGeometry(3.5, 0.8, 3.0);
    const wpMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.8 });
    const wp = new THREE.Mesh(wpGeo, wpMat);
    wp.position.set(0, 0.6, 0);
    this.edmGroup.add(wp);

    // Shaped Copper Electrode Tool Cathode (-)
    const elGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.0, 32);
    const elMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.2, metalness: 0.9 }); // Copper
    this.electrodeMesh = new THREE.Mesh(elGeo, elMat);
    this.electrodeMesh.position.set(0, 2.3, 0);
    this.edmGroup.add(this.electrodeMesh);

    // Spark Particles across gap
    const count = 80;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.4;
      pos[i * 3 + 1] = 1.05 + Math.random() * 0.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    this.sparkGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const sparkMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.12, transparent: true, opacity: 0.9 });
    this.edmSparks = new THREE.Points(this.sparkGeom, sparkMat);
    this.edmGroup.add(this.edmSparks);
  }

  private buildECM(): void {
    this.processGroup.add(this.ecmGroup);

    // Workpiece (Anode +)
    const wpGeo = new THREE.BoxGeometry(3.5, 0.8, 3.0);
    const wpMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.8 });
    const wp = new THREE.Mesh(wpGeo, wpMat);
    wp.position.set(0, 0.6, 0);
    this.ecmGroup.add(wp);

    // Cathode Tool (Contoured Copper)
    const toolGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 32);
    const toolMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.3, metalness: 0.85 });
    this.ecmTool = new THREE.Mesh(toolGeo, toolMat);
    this.ecmTool.position.set(0, 2.0, 0);
    this.ecmGroup.add(this.ecmTool);

    // Electrolyte Flow Channel Simulation
    this.electrolyteFlow = new THREE.Group();
    for (let i = 0; i < 24; i++) {
      const arrowGeo = new THREE.ConeGeometry(0.06, 0.25, 8);
      const arrowMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.rotation.x = Math.PI / 2;
      arrow.position.set((Math.random() - 0.5) * 2, 1.1, (Math.random() - 0.5) * 2);
      this.electrolyteFlow.add(arrow);
    }
    this.ecmGroup.add(this.electrolyteFlow);
  }

  private buildLaser(): void {
    this.processGroup.add(this.laserGroup);

    // Sheet Metal Workpiece
    const sheetGeo = new THREE.BoxGeometry(5.0, 0.2, 4.0);
    const sheetMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.9 });
    const sheet = new THREE.Mesh(sheetGeo, sheetMat);
    sheet.position.set(0, 1.0, 0);
    this.laserGroup.add(sheet);

    // Laser Cutting Head
    const headGeo = new THREE.ConeGeometry(0.6, 1.8, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
    this.laserHead = new THREE.Mesh(headGeo, headMat);
    this.laserHead.rotation.x = Math.PI;
    this.laserHead.position.set(0, 2.5, 0);
    this.laserGroup.add(this.laserHead);

    // Focused Optical Laser Beam (Intense Cyan/Violet)
    const beamGeo = new THREE.CylinderGeometry(0.02, 0.05, 1.4, 16);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    this.laserBeam = new THREE.Mesh(beamGeo, beamMat);
    this.laserBeam.position.set(0, 1.7, 0);
    this.laserGroup.add(this.laserBeam);

    // Incandescent Spatter Sparks
    const sparkGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(50 * 3);
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const sMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.09 });
    this.laserSparks = new THREE.Points(sparkGeo, sMat);
    this.laserGroup.add(this.laserSparks);
  }

  private buildWaterJet(): void {
    this.processGroup.add(this.wjGroup);

    // Workpiece Slab (Titanium/Granite)
    const slabGeo = new THREE.BoxGeometry(5.0, 0.5, 4.0);
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.4 });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.set(0, 0.8, 0);
    this.wjGroup.add(slab);

    // Abrasive Water Jet Nozzle
    const nozGeo = new THREE.CylinderGeometry(0.3, 0.15, 2.0, 32);
    const nozMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.9 });
    this.wjNozzle = new THREE.Mesh(nozGeo, nozMat);
    this.wjNozzle.position.set(0, 2.6, 0);
    this.wjGroup.add(this.wjNozzle);

    // Supersonic Coherent Water Stream
    const streamGeo = new THREE.CylinderGeometry(0.04, 0.06, 1.5, 16);
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
    });
    this.wjStream = new THREE.Mesh(streamGeo, streamMat);
    this.wjStream.position.set(0, 1.7, 0);
    this.wjGroup.add(this.wjStream);
  }

  public switchProcess(process: NonTraditionalProcess): void {
    this.activeProcess = process;
    this.edmGroup.visible = process === 'edm';
    this.ecmGroup.visible = process === 'ecm';
    this.laserGroup.visible = process === 'laser';
    this.wjGroup.visible = process === 'waterjet';
  }

  public setSimulating(simulating: boolean): void {
    this.isSimulating = simulating;
  }

  public update(delta: number): void {
    this.timeElapsed += delta;

    if (this.activeProcess === 'edm') {
      // Electrode servo oscillation & spark pulsation
      if (this.isSimulating) {
        this.electrodeMesh.position.y = 2.05 + Math.sin(this.timeElapsed * 15) * 0.05;
        this.edmSparks.visible = Math.sin(this.timeElapsed * 30) > -0.2;
      } else {
        this.electrodeMesh.position.y = 2.3;
        this.edmSparks.visible = false;
      }
    } else if (this.activeProcess === 'ecm') {
      // Electrolyte fluid arrows animation
      if (this.isSimulating) {
        this.electrolyteFlow.children.forEach((c) => {
          c.position.x += 1.5 * delta;
          if (c.position.x > 1.8) c.position.x = -1.8;
        });
      }
    } else if (this.activeProcess === 'laser') {
      if (this.isSimulating) {
        const xCut = Math.sin(this.timeElapsed * 2) * 1.5;
        this.laserHead.position.x = xCut;
        this.laserBeam.position.x = xCut;
        this.laserBeam.scale.y = 0.95 + Math.random() * 0.1;
      }
    } else if (this.activeProcess === 'waterjet') {
      if (this.isSimulating) {
        const xCut = Math.sin(this.timeElapsed * 1.5) * 1.6;
        this.wjNozzle.position.x = xCut;
        this.wjStream.position.x = xCut;
      }
    }
  }

  public override dispose(): void {
    super.dispose();
    this.sparkGeom.dispose();
  }
}
