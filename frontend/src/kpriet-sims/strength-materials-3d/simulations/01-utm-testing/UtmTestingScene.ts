import * as THREE from 'three';
import { BaseSomSimulation } from '../../core/BaseSomSimulation';
import type { IUtmParams, IUtmCalculationResult } from '../../core/types';
import { SOM_MATERIALS } from '../../core/SomMaterials';

export class UtmTestingScene extends BaseSomSimulation {
  private machineGroup: THREE.Group;
  private upperCrosshead: THREE.Group;
  private specimenMesh: THREE.Mesh | null = null;
  private extensometerGroup: THREE.Group;
  private upperGrip!: THREE.Mesh;
  private lowerGrip!: THREE.Mesh;
  private upperPlaten!: THREE.Mesh;
  private lowerPlaten!: THREE.Mesh;
  private digitalDisplayMesh!: THREE.Mesh;
  private digitalCanvas: HTMLCanvasElement;
  private digitalTexture: THREE.CanvasTexture;

  private currentResult: IUtmCalculationResult | null = null;
  private currentParams: IUtmParams | null = null;

  constructor(container: HTMLElement) {
    super(container);
    this.machineGroup = new THREE.Group();
    this.upperCrosshead = new THREE.Group();
    this.extensometerGroup = new THREE.Group();

    // Setup digital HUD canvas
    this.digitalCanvas = document.createElement('canvas');
    this.digitalCanvas.width = 512;
    this.digitalCanvas.height = 256;
    this.digitalTexture = new THREE.CanvasTexture(this.digitalCanvas);

    // Initial dummy display
    this.updateDigitalHud(0, 0, 0, false);

    // Build realistic UTM
    this.buildUtmMachine();
    this.scene.add(this.machineGroup);

    // Initial camera position
    this.resetCamera(new THREE.Vector3(1.6, 1.4, 2.2), new THREE.Vector3(0, 1.05, 0));
  }

  private buildUtmMachine(): void {
    const steelDark = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35,
    });
    const chrome = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });
    const paintedBody = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Engineering blue
      metalness: 0.3,
      roughness: 0.4,
    });
    const warningYellow = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.2,
      roughness: 0.5,
    });

    // 1. Massive Cast Iron Base Bed
    const baseGeo = new THREE.BoxGeometry(1.4, 0.45, 0.9);
    const base = new THREE.Mesh(baseGeo, paintedBody);
    base.position.y = 0.225;
    base.castShadow = true;
    base.receiveShadow = true;
    this.machineGroup.add(base);

    // Base Levelling Feet
    for (const x of [-0.6, 0.6]) {
      for (const z of [-0.35, 0.35]) {
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16), steelDark);
        foot.position.set(x, 0.04, z);
        this.machineGroup.add(foot);
      }
    }

    // 2. Twin High-Tensile Chrome Columns
    const colGeo = new THREE.CylinderGeometry(0.065, 0.065, 2.3, 32);
    const leftCol = new THREE.Mesh(colGeo, chrome);
    leftCol.position.set(-0.48, 1.35, 0);
    leftCol.castShadow = true;
    this.machineGroup.add(leftCol);

    const rightCol = new THREE.Mesh(colGeo, chrome);
    rightCol.position.set(0.48, 1.35, 0);
    rightCol.castShadow = true;
    this.machineGroup.add(rightCol);

    // Threaded Lead Screws behind columns
    const screwGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 16);
    const leftScrew = new THREE.Mesh(screwGeo, steelDark);
    leftScrew.position.set(-0.35, 1.3, -0.05);
    this.machineGroup.add(leftScrew);

    const rightScrew = new THREE.Mesh(screwGeo, steelDark);
    rightScrew.position.set(0.35, 1.3, -0.05);
    this.machineGroup.add(rightScrew);

    // 3. Fixed Top Crosshead (Reaction Beam)
    const topBeamGeo = new THREE.BoxGeometry(1.2, 0.28, 0.35);
    const topBeam = new THREE.Mesh(topBeamGeo, paintedBody);
    topBeam.position.set(0, 2.35, 0);
    topBeam.castShadow = true;
    this.machineGroup.add(topBeam);

    // 4. Movable Crosshead (Hydraulic / Lead Screw Driven)
    const crossheadGeo = new THREE.BoxGeometry(1.15, 0.24, 0.38);
    const crossheadBody = new THREE.Mesh(crossheadGeo, paintedBody);
    crossheadBody.castShadow = true;
    this.upperCrosshead.add(crossheadBody);

    // Bushings for columns
    for (const x of [-0.48, 0.48]) {
      const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.26, 24), steelDark);
      bush.position.set(x, 0, 0);
      this.upperCrosshead.add(bush);
    }

    // Upper Wedge Grip Housing (for Tensile)
    const gripHousingGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.18, 16);
    this.upperGrip = new THREE.Mesh(gripHousingGeo, steelDark);
    this.upperGrip.position.set(0, -0.16, 0);
    this.upperGrip.castShadow = true;
    this.upperCrosshead.add(this.upperGrip);

    // Upper Compression Platen
    const platenGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 32);
    this.upperPlaten = new THREE.Mesh(platenGeo, chrome);
    this.upperPlaten.position.set(0, -0.16, 0);
    this.upperPlaten.visible = false;
    this.upperCrosshead.add(this.upperPlaten);

    // Add Movable crosshead to machine
    this.upperCrosshead.position.set(0, 1.5, 0);
    this.machineGroup.add(this.upperCrosshead);

    // 5. Lower Grip & Platen (Mounted on Base Bed)
    const lowerGripHousing = new THREE.CylinderGeometry(0.09, 0.12, 0.18, 16);
    this.lowerGrip = new THREE.Mesh(lowerGripHousing, steelDark);
    this.lowerGrip.position.set(0, 0.54, 0);
    this.lowerGrip.castShadow = true;
    this.machineGroup.add(this.lowerGrip);

    this.lowerPlaten = new THREE.Mesh(platenGeo, chrome);
    this.lowerPlaten.position.set(0, 0.54, 0);
    this.lowerPlaten.visible = false;
    this.machineGroup.add(this.lowerPlaten);

    // 6. Integrated Electronic Load Cell & Digital Indicator
    const loadCellGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 24);
    const loadCell = new THREE.Mesh(loadCellGeo, warningYellow);
    loadCell.position.set(0, 2.18, 0);
    this.machineGroup.add(loadCell);

    // Digital Telemetry Console mounted on column
    const consoleArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 12), steelDark);
    consoleArm.rotation.z = Math.PI / 2;
    consoleArm.position.set(0.65, 1.45, 0);
    this.machineGroup.add(consoleArm);

    const displayMat = new THREE.MeshBasicMaterial({ map: this.digitalTexture });
    const screenGeo = new THREE.BoxGeometry(0.42, 0.28, 0.06);
    this.digitalDisplayMesh = new THREE.Mesh(screenGeo, displayMat);
    this.digitalDisplayMesh.position.set(0.85, 1.45, 0.05);
    this.digitalDisplayMesh.rotation.y = -Math.PI / 6;
    this.machineGroup.add(this.digitalDisplayMesh);

    // 7. Electronic Extensometer
    this.buildExtensometer();
    this.machineGroup.add(this.extensometerGroup);
  }

  private buildExtensometer(): void {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.3 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });

    const gaugeBlock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.05), bodyMat);
    gaugeBlock.position.set(0.14, 0.95, 0);
    this.extensometerGroup.add(gaugeBlock);

    // Upper knife edge contact
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8), armMat);
    upperArm.rotation.z = Math.PI / 2;
    upperArm.position.set(0.07, 1.02, 0);
    this.extensometerGroup.add(upperArm);

    // Lower knife edge contact
    const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8), armMat);
    lowerArm.rotation.z = Math.PI / 2;
    lowerArm.position.set(0.07, 0.88, 0);
    this.extensometerGroup.add(lowerArm);
  }

  private updateDigitalHud(loadKn: number, dispMm: number, stressMpa: number, fractured: boolean): void {
    const ctx = this.digitalCanvas.getContext('2d');
    if (!ctx) return;

    // Dark terminal styling
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 244);

    // Header
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('PIYUSHDHARA SOM-UTM MK-IV', 20, 36);

    ctx.fillStyle = fractured ? '#ef4444' : '#10b981';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(fractured ? 'STATUS: SPECIMEN FRACTURED' : 'STATUS: ACQUIRING DATA', 260, 36);

    // Load Cell
    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText('LOAD (CELL #01):', 24, 82);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`${loadKn.toFixed(2)} kN`, 24, 122);

    // Extensometer Displacement
    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText('DISPLACEMENT (LVDT):', 260, 82);
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`${dispMm.toFixed(3)} mm`, 260, 122);

    // Engineering Stress
    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText('AXIAL STRESS (σ):', 24, 175);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 34px monospace';
    ctx.fillText(`${stressMpa.toFixed(1)} MPa`, 24, 215);

    // Gauge Length
    const l0 = this.currentParams?.gaugeLengthMm || 50;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px monospace';
    ctx.fillText(`L₀: ${l0.toFixed(1)} mm`, 260, 185);

    this.digitalTexture.needsUpdate = true;
  }

  public updateExperiment(params: IUtmParams, result: IUtmCalculationResult): void {
    this.currentParams = params;
    this.currentResult = result;

    const isTension = params.testType === 'tension';
    this.upperGrip.visible = isTension;
    this.lowerGrip.visible = isTension;
    this.upperPlaten.visible = !isTension;
    this.lowerPlaten.visible = !isTension;
    this.extensometerGroup.visible = isTension;

    // Specimen Material Appearance
    const matInfo = SOM_MATERIALS[params.materialId];
    const specMat = new THREE.MeshStandardMaterial({
      color: matInfo.colorHex,
      roughness: matInfo.roughness,
      metalness: matInfo.metalness,
    });

    // Reconstruct Specimen Geometry
    if (this.specimenMesh) {
      this.machineGroup.remove(this.specimenMesh);
      this.specimenMesh.geometry.dispose();
      (this.specimenMesh.material as THREE.Material).dispose();
      this.specimenMesh = null;
    }

    const L0_visual = 0.5; // Visual standard length in meters
    const gaugeLen = params.gaugeLengthMm;
    const dispMm = result.displacement * 1000;
    const deltaRatio = dispMm / gaugeLen; // elongation ratio
    const currentLen = Math.max(0.1, L0_visual * (1 + deltaRatio));

    // Position of upper crosshead based on current length
    const specimenCenterY = 0.63 + currentLen / 2;
    this.upperCrosshead.position.y = 0.63 + currentLen + 0.16;

    const isNecking = result.stage === 'necking' || result.stage === 'fractured';

    if (params.specimenShape === 'round') {
      const radius = Math.max(0.015, (params.diameterMm / 1000) * 1.5);
      const radialSegments = 32;
      const heightSegments = 40;
      const geo = new THREE.CylinderGeometry(radius, radius, currentLen, radialSegments, heightSegments);

      if (isNecking) {
        const pos = geo.attributes.position;
        if (pos) {
          const halfH = currentLen / 2;
          const reduction = Math.max(0.5, result.instantaneousDiameter / (params.diameterMm / 1000));
          for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const distNorm = y / (halfH * 0.35);
            const factor = 1 - (1 - reduction) * Math.exp(-distNorm * distNorm);
            pos.setX(i, pos.getX(i) * factor);
            pos.setZ(i, pos.getZ(i) * factor);
          }
          geo.computeVertexNormals();
        }
      }

      this.specimenMesh = new THREE.Mesh(geo, specMat);
    } else {
      const w = Math.max(0.02, ((params.widthMm || 20) / 1000) * 1.5);
      const t = Math.max(0.015, ((params.thicknessMm || 10) / 1000) * 1.5);
      const geo = new THREE.BoxGeometry(w, currentLen, t, 10, 30, 10);

      if (isNecking) {
        const pos = geo.attributes.position;
        if (pos) {
          const halfH = currentLen / 2;
          const reduction = Math.max(0.5, result.instantaneousDiameter / (params.diameterMm / 1000));
          for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const distNorm = y / (halfH * 0.35);
            const factor = 1 - (1 - reduction) * Math.exp(-distNorm * distNorm);
            pos.setX(i, pos.getX(i) * factor);
            pos.setZ(i, pos.getZ(i) * factor);
          }
          geo.computeVertexNormals();
        }
      }

      this.specimenMesh = new THREE.Mesh(geo, specMat);
    }

    this.specimenMesh.position.set(0, specimenCenterY, 0);
    this.specimenMesh.castShadow = true;
    this.machineGroup.add(this.specimenMesh);

    // Update Digital Telemetry
    this.updateDigitalHud(
      result.load / 1000,
      result.displacement * 1000,
      result.engineeringStress / 1e6,
      result.isFractured
    );
  }

  protected onUpdate(_time: number): void {}

  public override dispose(): void {
    super.dispose();
    this.digitalTexture.dispose();
  }
}
