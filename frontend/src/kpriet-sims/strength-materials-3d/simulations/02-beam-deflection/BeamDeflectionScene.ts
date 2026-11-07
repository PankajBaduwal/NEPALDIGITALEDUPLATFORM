import * as THREE from 'three';
import { BaseSomSimulation } from '../../core/BaseSomSimulation';
import type { IBeamParams, IBeamCalculationResult } from '../../core/types';
import { SOM_MATERIALS } from '../../core/SomMaterials';

export class BeamDeflectionScene extends BaseSomSimulation {
  private rigGroup: THREE.Group;
  private beamMesh: THREE.Mesh | null = null;
  private undeformedGhostMesh: THREE.LineSegments | null = null;
  private leftSupportMesh: THREE.Group;
  private rightSupportMesh: THREE.Group;
  private loadArrowsGroup: THREE.Group;
  private dialIndicatorGroup: THREE.Group;
  private dialNeedle: THREE.Mesh;
  private dialCanvas: HTMLCanvasElement;
  private dialTexture: THREE.CanvasTexture;
  private dialFaceMesh: THREE.Mesh;

  private currentParams: IBeamParams | null = null;
  private currentResult: IBeamCalculationResult | null = null;

  constructor(container: HTMLElement) {
    super(container);
    this.rigGroup = new THREE.Group();
    this.leftSupportMesh = new THREE.Group();
    this.rightSupportMesh = new THREE.Group();
    this.loadArrowsGroup = new THREE.Group();
    this.dialIndicatorGroup = new THREE.Group();

    // Dial indicator face canvas
    this.dialCanvas = document.createElement('canvas');
    this.dialCanvas.width = 256;
    this.dialCanvas.height = 256;
    this.dialTexture = new THREE.CanvasTexture(this.dialCanvas);
    this.drawDialFace(0);

    const dialMat = new THREE.MeshBasicMaterial({ map: this.dialTexture });
    this.dialFaceMesh = new THREE.Mesh(new THREE.CircleGeometry(0.09, 32), dialMat);

    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const needleGeo = new THREE.BoxGeometry(0.004, 0.07, 0.002);
    needleGeo.translate(0, 0.035, 0.002);
    this.dialNeedle = new THREE.Mesh(needleGeo, needleMat);

    this.buildTestRig();
    this.scene.add(this.rigGroup);

    // Initial camera position
    this.resetCamera(new THREE.Vector3(2.2, 1.8, 3.2), new THREE.Vector3(0, 0.8, 0));
  }

  private buildTestRig(): void {
    const frameSteel = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
    });
    const standSteel = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.6,
      roughness: 0.4,
    });

    // Heavy Structural Test Bed (Twin I-Beams)
    const bedGeo = new THREE.BoxGeometry(4.2, 0.15, 0.6);
    const bed = new THREE.Mesh(bedGeo, frameSteel);
    bed.position.set(0, 0.45, 0);
    bed.receiveShadow = true;
    bed.castShadow = true;
    this.rigGroup.add(bed);

    // Support Pedestals for test bed
    for (const x of [-1.6, 1.6]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.55), standSteel);
      leg.position.set(x, 0.225, 0);
      leg.castShadow = true;
      this.rigGroup.add(leg);
    }

    // Reaction Columns and Top Loading Crossbeam
    for (const x of [-1.9, 1.9]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), frameSteel);
      col.position.set(x, 1.25, 0);
      col.castShadow = true;
      this.rigGroup.add(col);
    }
    const topReaction = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.15, 0.2), frameSteel);
    topReaction.position.set(0, 2.05, 0);
    topReaction.castShadow = true;
    this.rigGroup.add(topReaction);

    // Add support holders
    this.buildSupports();
    this.rigGroup.add(this.leftSupportMesh);
    this.rigGroup.add(this.rightSupportMesh);

    // Add load arrows group
    this.rigGroup.add(this.loadArrowsGroup);

    // Build dial indicator
    this.buildDialIndicator();
    this.rigGroup.add(this.dialIndicatorGroup);
  }

  private buildSupports(): void {
    const supportSteel = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Sky engineering
      metalness: 0.5,
      roughness: 0.35,
    });
    const rollerChrome = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.1,
    });

    // Left Support - Knife Edge / Pin
    const pinBase = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), supportSteel);
    pinBase.rotation.y = Math.PI / 4;
    pinBase.position.y = 0.09;
    this.leftSupportMesh.add(pinBase);
    const pinRoller = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 16), rollerChrome);
    pinRoller.rotation.x = Math.PI / 2;
    pinRoller.position.y = 0.18;
    this.leftSupportMesh.add(pinRoller);

    // Right Support - Roller on flat plate
    const rollerBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.22), supportSteel);
    rollerBase.position.y = 0.025;
    this.rightSupportMesh.add(rollerBase);

    const rCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16), rollerChrome);
    rCyl.rotation.x = Math.PI / 2;
    rCyl.position.y = 0.09;
    this.rightSupportMesh.add(rCyl);

    const rollerTopPlate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.2), supportSteel);
    rollerTopPlate.position.y = 0.15;
    this.rightSupportMesh.add(rollerTopPlate);
  }

  private buildDialIndicator(): void {
    const chrome = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });

    // Magnetic Base Stand
    const magBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.1), casingMat);
    magBase.position.set(0, 0.57, -0.22);
    this.dialIndicatorGroup.add(magBase);

    // Articulated Stand Rod
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.55, 12), chrome);
    rod.position.set(0, 0.85, -0.22);
    this.dialIndicatorGroup.add(rod);

    // Cross clamp arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.25, 12), chrome);
    arm.rotation.x = Math.PI / 2;
    arm.position.set(0, 1.05, -0.1);
    this.dialIndicatorGroup.add(arm);

    // Gauge Housing
    const casing = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 32), casingMat);
    casing.rotation.x = Math.PI / 2;
    casing.position.set(0, 1.05, 0.05);
    this.dialIndicatorGroup.add(casing);

    // Face mesh
    this.dialFaceMesh.position.set(0, 1.05, 0.071);
    this.dialIndicatorGroup.add(this.dialFaceMesh);

    // Needle
    this.dialNeedle.position.set(0, 1.05, 0.073);
    this.dialIndicatorGroup.add(this.dialNeedle);

    // Plunger Pin touching top of beam
    const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.35, 12), chrome);
    plunger.position.set(0, 0.88, 0.05);
    this.dialIndicatorGroup.add(plunger);
  }

  private drawDialFace(deflectionMm: number): void {
    const ctx = this.dialCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 256, 256);

    // Dial background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    // Dial bezel
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#0284c7';
    ctx.stroke();

    // Ticks
    for (let i = 0; i < 100; i++) {
      const angle = (i * Math.PI * 2) / 100 - Math.PI / 2;
      const isMajor = i % 10 === 0;
      const r1 = 114;
      const r2 = isMajor ? 96 : 104;

      ctx.lineWidth = isMajor ? 3 : 1;
      ctx.strokeStyle = isMajor ? '#0f172a' : '#64748b';
      ctx.beginPath();
      ctx.moveTo(128 + r1 * Math.cos(angle), 128 + r1 * Math.sin(angle));
      ctx.lineTo(128 + r2 * Math.cos(angle), 128 + r2 * Math.sin(angle));
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const numR = 82;
        ctx.fillText(`${i}`, 128 + numR * Math.cos(angle), 128 + numR * Math.sin(angle));
      }
    }

    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0.01 mm / DIV', 128, 155);
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`δ: ${deflectionMm.toFixed(2)} mm`, 128, 180);

    this.dialTexture.needsUpdate = true;
  }

  public updateExperiment(params: IBeamParams, result: IBeamCalculationResult): void {
    this.currentParams = params;
    this.currentResult = result;

    const spanM = params.spanM;
    const visualScaleX = 2.4 / Math.max(1, spanM); // fit span within ~2.4m
    const leftX = (-spanM / 2) * visualScaleX;
    const rightX = (spanM / 2) * visualScaleX;
    const supportTopY = 0.45 + 0.18; // 0.63

    // Position supports
    this.leftSupportMesh.position.set(leftX, 0.45, 0);
    this.rightSupportMesh.position.set(rightX, 0.45, 0);

    // If Cantilever, hide right support and replace left with clamp block
    if (params.supportType === 'cantilever') {
      this.rightSupportMesh.visible = false;
      this.leftSupportMesh.position.set(leftX - 0.1, 0.45, 0);
    } else {
      this.rightSupportMesh.visible = true;
    }

    // Dial Indicator Position
    const dialLocX = (params.measurementPositionM - spanM / 2) * visualScaleX;
    this.dialIndicatorGroup.position.set(dialLocX, 0, 0);
    const measuredDeflectionMm = Math.abs(result.deflectionAtInspection * 1000);
    this.drawDialFace(measuredDeflectionMm);
    // Dial needle rotates 1 full rev (360 deg) per 1mm
    const needleAngle = -(measuredDeflectionMm * Math.PI * 2);
    this.dialNeedle.rotation.z = needleAngle;

    // Beam Material
    const matInfo = SOM_MATERIALS[params.materialId];
    const beamMat = new THREE.MeshStandardMaterial({
      color: matInfo.colorHex,
      roughness: matInfo.roughness,
      metalness: matInfo.metalness,
    });

    // Reconstruct 3D Deflected Beam
    if (this.beamMesh) {
      this.rigGroup.remove(this.beamMesh);
      this.beamMesh.geometry.dispose();
      (this.beamMesh.material as THREE.Material).dispose();
      this.beamMesh = null;
    }
    if (this.undeformedGhostMesh) {
      this.rigGroup.remove(this.undeformedGhostMesh);
      this.undeformedGhostMesh.geometry.dispose();
      this.undeformedGhostMesh = null;
    }

    // Build Deformed Curve
    const numPts = result.points.length;
    const points: THREE.Vector3[] = [];
    const ghostPoints: THREE.Vector3[] = [];
    const amp = params.visualAmplification;

    for (let i = 0; i < numPts; i++) {
      const pt = result.points[i];
      if (pt) {
        const vx = (pt.x - spanM / 2) * visualScaleX;
        const vy = supportTopY + 0.05 - pt.deflection * amp;
        points.push(new THREE.Vector3(vx, vy, 0));
        ghostPoints.push(new THREE.Vector3(vx, supportTopY + 0.05, 0));
      }
    }

    // Extrude rectangular or circular section along curve
    const curve = new THREE.CatmullRomCurve3(points);
    const beamH = Math.max(0.04, Math.min(0.12, (params.dimensions.depth || params.dimensions.diameter || 0.1) * 1.5));
    const beamW = Math.max(0.04, Math.min(0.1, (params.dimensions.width || params.dimensions.diameter || 0.05) * 1.5));

    const tubeGeo = new THREE.BoxGeometry(beamW, beamH, spanM * visualScaleX, 1, 1, 60);
    const posAttr = tubeGeo.attributes.position;
    if (posAttr) {
      for (let i = 0; i < posAttr.count; i++) {
        const z = posAttr.getZ(i);
        const t = (z + (spanM * visualScaleX) / 2) / (spanM * visualScaleX);
        const clampedT = Math.max(0, Math.min(1, t));
        const ptOnCurve = curve.getPointAt(clampedT);
        const deflY = ptOnCurve.y - (supportTopY + 0.05);

        posAttr.setZ(i, posAttr.getX(i));
        posAttr.setX(i, (clampedT - 0.5) * (spanM * visualScaleX));
        posAttr.setY(i, posAttr.getY(i) + deflY + supportTopY + 0.05);
      }
      tubeGeo.computeVertexNormals();
    }

    this.beamMesh = new THREE.Mesh(tubeGeo, beamMat);
    this.beamMesh.castShadow = true;
    this.rigGroup.add(this.beamMesh);

    // Undeformed ghost wireframe (if toggled)
    if (params.showUndeformedGhost) {
      const ghostGeo = new THREE.BufferGeometry().setFromPoints(ghostPoints);
      const ghostLineMat = new THREE.LineDashedMaterial({
        color: 0x94a3b8,
        dashSize: 0.04,
        gapSize: 0.02,
      });
      const line = new THREE.Line(ghostGeo, ghostLineMat);
      line.computeLineDistances();
      this.undeformedGhostMesh = line as any;
      this.rigGroup.add(this.undeformedGhostMesh!);
    }

    // Render Load Indicators (Arrows & UDL Combs)
    this.renderLoads(params, visualScaleX, supportTopY + 0.05);
  }

  private renderLoads(params: IBeamParams, visualScaleX: number, beamTopY: number): void {
    while (this.loadArrowsGroup.children.length > 0) {
      const child = this.loadArrowsGroup.children[0];
      if (child) {
        this.loadArrowsGroup.remove(child);
      }
    }

    const arrowMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.2 });

    params.loads.forEach((load: IBeamParams['loads'][number]) => {
      if (load.type === 'point') {
        const xPos = (load.positionM - params.spanM / 2) * visualScaleX;
        const arrow = new THREE.ArrowHelper(
          new THREE.Vector3(0, -1, 0),
          new THREE.Vector3(xPos, beamTopY + 0.45, 0),
          0.38,
          0xef4444,
          0.12,
          0.06
        );
        this.loadArrowsGroup.add(arrow);
      } else if (load.type === 'udl') {
        const startX = (load.positionM - params.spanM / 2) * visualScaleX;
        const endX = ((load.positionM + (load.lengthM || 1)) - params.spanM / 2) * visualScaleX;
        const steps = 7;
        for (let i = 0; i <= steps; i++) {
          const xi = startX + ((endX - startX) * i) / steps;
          const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(xi, beamTopY + 0.25, 0),
            0.2,
            0xf97316,
            0.06,
            0.03
          );
          this.loadArrowsGroup.add(arrow);
        }
        // Top horizontal connecting bar for UDL
        const barGeo = new THREE.BoxGeometry(endX - startX, 0.015, 0.015);
        const bar = new THREE.Mesh(barGeo, arrowMat);
        bar.position.set((startX + endX) / 2, beamTopY + 0.25, 0);
        this.loadArrowsGroup.add(bar);
      }
    });
  }

  protected onUpdate(_time: number): void {}

  public override dispose(): void {
    super.dispose();
    this.dialTexture.dispose();
  }
}
