import * as THREE from 'three';
import { BaseConcreteSimulation } from '../../core/BaseConcreteSimulation';
import type { ICompressionTestParams, ICompressionTestResult } from '../../core/types';

export class CompressiveStrengthScene extends BaseConcreteSimulation {
  private ctmGroup: THREE.Group;
  private upperPlatenMesh!: THREE.Mesh;
  private lowerPlatenMesh!: THREE.Mesh;
  private specimenMesh: THREE.Mesh | null = null;
  private digitalGaugeMesh!: THREE.Mesh;
  private gaugeCanvas: HTMLCanvasElement;
  private gaugeTexture: THREE.CanvasTexture;

  private currentParams: ICompressionTestParams | null = null;
  private currentResult: ICompressionTestResult | null = null;

  constructor(container: HTMLElement) {
    super(container);
    this.ctmGroup = new THREE.Group();

    this.gaugeCanvas = document.createElement('canvas');
    this.gaugeCanvas.width = 512;
    this.gaugeCanvas.height = 256;
    this.gaugeTexture = new THREE.CanvasTexture(this.gaugeCanvas);

    this.drawCtmDisplay(0, 0, 0, 'STANDBY');

    this.buildCtmMachine();
    this.scene.add(this.ctmGroup);

    this.resetCamera(new THREE.Vector3(1.4, 1.4, 1.9), new THREE.Vector3(0, 0.95, 0));
  }

  private buildCtmMachine(): void {
    const frameBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4, roughness: 0.4 });
    const steelDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const platenSteel = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });

    // 1. Massive Base & Hydraulic Ram Cylinder (2000 kN capacity CTM per IS 14858)
    const baseBed = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.8), frameBlue);
    baseBed.position.set(0, 0.2, 0);
    baseBed.castShadow = true;
    this.ctmGroup.add(baseBed);

    // Hydraulic Ram Cylinder
    const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.35, 32), chrome);
    ram.position.set(0, 0.48, 0);
    this.ctmGroup.add(ram);

    // 2. Heavy Reaction Columns (Twin 100mm solid steel tie rods)
    for (const x of [-0.36, 0.36]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 24), chrome);
      col.position.set(x, 1.15, 0);
      col.castShadow = true;
      this.ctmGroup.add(col);
    }

    // Fixed Top Reaction Beam
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 0.5), frameBlue);
    topBeam.position.set(0, 1.9, 0);
    topBeam.castShadow = true;
    this.ctmGroup.add(topBeam);

    // Spherically Seated Upper Platen (Self-aligning per IS 516)
    const upperBall = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), steelDark);
    upperBall.position.set(0, 1.75, 0);
    upperBall.rotation.x = Math.PI;
    this.ctmGroup.add(upperBall);

    this.upperPlatenMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 32), platenSteel);
    this.upperPlatenMesh.position.set(0, 1.58, 0);
    this.ctmGroup.add(this.upperPlatenMesh);

    // Lower Movable Bearing Platen
    this.lowerPlatenMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 32), platenSteel);
    this.lowerPlatenMesh.position.set(0, 0.68, 0);
    this.ctmGroup.add(this.lowerPlatenMesh);

    // Safety Mesh Guard Door (Wireframe on front)
    const guardGeo = new THREE.WireframeGeometry(new THREE.BoxGeometry(0.68, 0.95, 0.02));
    const guardMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 });
    const guardDoor = new THREE.LineSegments(guardGeo, guardMat);
    guardDoor.position.set(0, 1.15, 0.32);
    this.ctmGroup.add(guardDoor);

    // 3. Digital Load Indicator Head on Swing Arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12), chrome);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.55, 1.25, 0);
    this.ctmGroup.add(arm);

    const hudMat = new THREE.MeshBasicMaterial({ map: this.gaugeTexture });
    this.digitalGaugeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.05), hudMat);
    this.digitalGaugeMesh.position.set(0.75, 1.25, 0.05);
    this.digitalGaugeMesh.rotation.y = -Math.PI / 6;
    this.ctmGroup.add(this.digitalGaugeMesh);
  }

  private drawCtmDisplay(loadKn: number, rateKnSec: number, strengthMpa: number, status: string): void {
    const ctx = this.gaugeCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 244);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('PIYUSHDHARA CTM-2000 DIGITAL', 20, 36);

    ctx.fillStyle = status === 'CRUSHED' ? '#ef4444' : '#10b981';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`STATE: ${status}`, 280, 36);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText('APPLIED LOAD:', 24, 85);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 42px monospace';
    ctx.fillText(`${loadKn.toFixed(1)} kN`, 24, 135);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText('COMPRESSIVE STRENGTH:', 260, 85);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 42px monospace';
    ctx.fillText(`${strengthMpa.toFixed(2)} MPa`, 260, 135);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`PACE RATE: ${rateKnSec.toFixed(1)} kN/s (IS 516: 0.2 - 0.4 MPa/s)`, 24, 210);

    this.gaugeTexture.needsUpdate = true;
  }

  public updateExperiment(params: ICompressionTestParams, result: ICompressionTestResult): void {
    this.currentParams = params;
    this.currentResult = result;

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.8,
      metalness: 0.1,
    });

    if (this.specimenMesh) {
      this.ctmGroup.remove(this.specimenMesh);
      this.specimenMesh.geometry.dispose();
      (this.specimenMesh.material as THREE.Material).dispose();
      this.specimenMesh = null;
    }

    const wM = params.measuredWidthMm / 1000;
    const dM = params.measuredDepthMm / 1000;
    const hM = params.measuredHeightMm / 1000;
    const offsetXM = params.centeringOffsetMm / 1000;

    const isCrushed = params.appliedLoadKn >= result.failureLoadKn * 0.99;

    if (params.specimenGeometry === 'cylinder_150x300') {
      const geo = new THREE.CylinderGeometry(wM / 2, wM / 2, hM, 32);
      this.specimenMesh = new THREE.Mesh(geo, concreteMat);
    } else {
      const geo = new THREE.BoxGeometry(wM, hM, dM);

      // Cracking pattern if crushed
      if (isCrushed) {
        const pos = geo.attributes.position;
        if (pos) {
          for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            // Hourglass pyramidal spalling
            const hourGlass = Math.cos((y / (hM / 2)) * (Math.PI / 2));
            pos.setX(i, x * (1 + 0.15 * hourGlass));
          }
          geo.computeVertexNormals();
        }
      }
      this.specimenMesh = new THREE.Mesh(geo, concreteMat);
    }

    this.specimenMesh.position.set(offsetXM, 0.71 + hM / 2, 0);
    this.specimenMesh.castShadow = true;
    this.ctmGroup.add(this.specimenMesh);

    // Adjust upper platen position to touch top of specimen
    this.upperPlatenMesh.position.y = 0.71 + hM + 0.03;

    // Telemetry
    const currentStress = (params.appliedLoadKn * 1000) / result.effectiveAreaMm2;
    this.drawCtmDisplay(
      params.appliedLoadKn,
      params.loadingRateKnSec,
      currentStress,
      isCrushed ? 'CRUSHED' : params.appliedLoadKn > 0 ? 'LOADING' : 'READY'
    );
  }

  protected onUpdate(_time: number): void {}

  public override dispose(): void {
    super.dispose();
    this.gaugeTexture.dispose();
  }
}
