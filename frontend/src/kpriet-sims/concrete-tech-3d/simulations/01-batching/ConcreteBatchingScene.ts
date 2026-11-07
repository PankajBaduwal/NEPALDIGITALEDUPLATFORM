import * as THREE from 'three';
import { BaseConcreteSimulation } from '../../core/BaseConcreteSimulation';
import type { IBatchingInputs, IBatchingResult } from '../../core/types';

export class ConcreteBatchingScene extends BaseConcreteSimulation {
  private labGroup: THREE.Group;
  private drumGroup: THREE.Group;
  private drumMesh!: THREE.Mesh;
  private drumFlades!: THREE.Group;
  private concreteInsideMesh!: THREE.Mesh;
  private digitalScaleMesh!: THREE.Mesh;
  private scaleCanvas: HTMLCanvasElement;
  private scaleTexture: THREE.CanvasTexture;
  private cementBagGroup: THREE.Group;
  private aggregateTraysGroup: THREE.Group;
  private waterVesselMesh!: THREE.Mesh;

  private isMixing: boolean = false;
  private mixRotation: number = 0;

  constructor(container: HTMLElement) {
    super(container);
    this.labGroup = new THREE.Group();
    this.drumGroup = new THREE.Group();
    this.cementBagGroup = new THREE.Group();
    this.aggregateTraysGroup = new THREE.Group();

    // Scale HUD canvas
    this.scaleCanvas = document.createElement('canvas');
    this.scaleCanvas.width = 512;
    this.scaleCanvas.height = 256;
    this.scaleTexture = new THREE.CanvasTexture(this.scaleCanvas);

    this.drawScaleDisplay(0, 0, 'ZEROED');

    this.buildBatchingLab();
    this.scene.add(this.labGroup);

    this.resetCamera(new THREE.Vector3(2.2, 1.8, 2.8), new THREE.Vector3(0, 0.75, 0));
  }

  private buildBatchingLab(): void {
    const steelDark = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const safetyOrange = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.4, roughness: 0.4 });
    const stainlessSteel = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

    // 1. Concrete Mixer Stand
    const standFrame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), steelDark);
    standFrame.position.set(-0.6, 0.35, 0);
    standFrame.castShadow = true;
    this.labGroup.add(standFrame);

    // Motor Housing
    const motorBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.4), safetyOrange);
    motorBox.position.set(-0.6, 0.85, -0.25);
    this.labGroup.add(motorBox);

    // Drum Tilting Cradle & Pivot Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 16), steelDark);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(-0.6, 0.85, 0);
    this.labGroup.add(shaft);

    // 2. Concrete Mixer Tilting Drum (Conical Reversible Drum per IS 1791)
    const drumBodyGeo = new THREE.CylinderGeometry(0.35, 0.22, 0.55, 32);
    this.drumMesh = new THREE.Mesh(drumBodyGeo, safetyOrange);
    this.drumMesh.castShadow = true;

    // Drum opening ring
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.025, 16, 32), stainlessSteel);
    lip.position.y = 0.28;
    lip.rotation.x = Math.PI / 2;
    this.drumMesh.add(lip);

    // Concrete Mix inside drum
    const concreteGeo = new THREE.CylinderGeometry(0.31, 0.18, 0.35, 24);
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Grey cementitious paste
      roughness: 0.85,
      metalness: 0.05,
    });
    this.concreteInsideMesh = new THREE.Mesh(concreteGeo, concreteMat);
    this.concreteInsideMesh.position.y = -0.06;
    this.drumMesh.add(this.concreteInsideMesh);

    // Position drum assembly with 45-degree charging tilt
    this.drumGroup.add(this.drumMesh);
    this.drumGroup.position.set(-0.6, 0.85, 0.15);
    this.drumGroup.rotation.x = -Math.PI / 5;
    this.labGroup.add(this.drumGroup);

    // 3. Electronic Platform Weighing Scale (IS 10262 Batching Scale)
    const scaleBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.6), steelDark);
    scaleBase.position.set(0.65, 0.06, 0);
    scaleBase.castShadow = true;
    this.labGroup.add(scaleBase);

    const scalePan = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.03, 0.55), stainlessSteel);
    scalePan.position.set(0.65, 0.135, 0);
    this.labGroup.add(scalePan);

    // Scale Digital Column & Head
    const scalePole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 12), stainlessSteel);
    scalePole.position.set(0.95, 0.55, -0.25);
    this.labGroup.add(scalePole);

    const displayGeo = new THREE.BoxGeometry(0.32, 0.2, 0.05);
    const displayMat = new THREE.MeshBasicMaterial({ map: this.scaleTexture });
    this.digitalScaleMesh = new THREE.Mesh(displayGeo, displayMat);
    this.digitalScaleMesh.position.set(0.95, 1.0, -0.22);
    this.digitalScaleMesh.rotation.y = -Math.PI / 6;
    this.labGroup.add(this.digitalScaleMesh);

    // 4. Cement Bags & Storage Bin
    this.buildCementStorage();
    this.labGroup.add(this.cementBagGroup);

    // 5. Aggregate Trays (Fine Aggregate & Coarse Aggregate)
    this.buildAggregateTrays();
    this.labGroup.add(this.aggregateTraysGroup);

    // 6. Calibrated Water Vessel
    this.buildWaterVessel();
    this.labGroup.add(this.waterVesselMesh);
  }

  private buildCementStorage(): void {
    const bagMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7, metalness: 0.1 });
    // 50kg standard IS 12269 paper sack
    const bagGeo = new THREE.BoxGeometry(0.35, 0.14, 0.5);
    const bag1 = new THREE.Mesh(bagGeo, bagMat);
    bag1.position.set(0.65, 0.22, 0);
    bag1.castShadow = true;
    this.cementBagGroup.add(bag1);
  }

  private buildAggregateTrays(): void {
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95, metalness: 0.05 }); // Sand color
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.1 }); // 20mm basalt

    // Sand Pan (Zone II Fine Aggregate)
    const sandPan = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.38), trayMat);
    sandPan.position.set(0.2, 0.04, 0.8);
    const sandFill = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.07, 0.35), sandMat);
    sandFill.position.set(0.2, 0.075, 0.8);
    this.aggregateTraysGroup.add(sandPan);
    this.aggregateTraysGroup.add(sandFill);

    // Coarse Aggregate Pan (20mm down crushed granite)
    const stonePan = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.42), trayMat);
    stonePan.position.set(-0.35, 0.05, 0.85);
    const stoneFill = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.09, 0.39), stoneMat);
    stoneFill.position.set(-0.35, 0.095, 0.85);
    this.aggregateTraysGroup.add(stonePan);
    this.aggregateTraysGroup.add(stoneFill);
  }

  private buildWaterVessel(): void {
    const vesselMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const vesselGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.32, 24);
    this.waterVesselMesh = new THREE.Mesh(vesselGeo, vesselMat);
    this.waterVesselMesh.position.set(0.7, 0.16, 0.6);
  }

  private drawScaleDisplay(netMassKg: number, waterCement: number, status: string): void {
    const ctx = this.scaleCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 244);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('PIYUSHDHARA BATCH-SCALE MK-III', 20, 36);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`STATUS: ${status}`, 280, 36);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText('TOTAL BATCH MASS:', 24, 85);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 42px monospace';
    ctx.fillText(`${netMassKg.toFixed(2)} kg`, 24, 135);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText('EFFECTIVE w/c RATIO:', 260, 85);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 42px monospace';
    ctx.fillText(`${waterCement.toFixed(2)}`, 260, 135);

    ctx.fillStyle = '#64748b';
    ctx.font = '15px monospace';
    ctx.fillText('IS 10262:2019 BATCH DISPENSER CALIBRATED', 24, 210);

    this.scaleTexture.needsUpdate = true;
  }

  public setMixing(mixing: boolean): void {
    this.isMixing = mixing;
  }

  public updateExperiment(inputs: IBatchingInputs, result: IBatchingResult): void {
    this.drawScaleDisplay(result.totalBatchMassKg, result.effectiveWaterCementRatio, result.status.toUpperCase());

    // Update color and wetness of concrete paste inside mixer drum based on w/c
    const mat = this.concreteInsideMesh.material as THREE.MeshStandardMaterial;
    if (result.status === 'segregating') {
      mat.color.setHex(0x475569); // Dark watery paste
      mat.roughness = 0.3; // glossy sheen
    } else if (result.status === 'harsh') {
      mat.color.setHex(0x94a3b8); // Dry dusty grey
      mat.roughness = 0.95;
    } else {
      mat.color.setHex(0x64748b); // Healthy fresh concrete grey
      mat.roughness = 0.7;
    }
  }

  protected onUpdate(_time: number): void {
    if (this.isMixing) {
      this.mixRotation += 0.05;
      this.drumMesh.rotation.y = this.mixRotation;
    }
  }

  public override dispose(): void {
    super.dispose();
    this.scaleTexture.dispose();
  }
}
