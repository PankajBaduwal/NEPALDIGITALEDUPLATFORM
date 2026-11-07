import * as THREE from 'three';
import { BaseConcreteSimulation } from '../../core/BaseConcreteSimulation';
import type { ICuringParams, ICuringStrengthResult } from '../../core/types';

export class CuringLabScene extends BaseConcreteSimulation {
  private labGroup: THREE.Group;
  private tankWaterMesh!: THREE.Mesh;
  private cubesInTankGroup: THREE.Group;
  private demouldedCubesGroup: THREE.Group;
  private curingMouldsGroup: THREE.Group;
  private tempTimeHudMesh!: THREE.Mesh;
  private hudCanvas: HTMLCanvasElement;
  private hudTexture: THREE.CanvasTexture;

  private currentParams: ICuringParams | null = null;
  private currentResult: ICuringStrengthResult | null = null;

  constructor(container: HTMLElement) {
    super(container);
    this.labGroup = new THREE.Group();
    this.cubesInTankGroup = new THREE.Group();
    this.demouldedCubesGroup = new THREE.Group();
    this.curingMouldsGroup = new THREE.Group();

    this.hudCanvas = document.createElement('canvas');
    this.hudCanvas.width = 512;
    this.hudCanvas.height = 256;
    this.hudTexture = new THREE.CanvasTexture(this.hudCanvas);

    this.drawCuringHud(27, 28, 'SUBMERGED (IS 516)', 100);

    this.buildCuringLab();
    this.scene.add(this.labGroup);

    this.resetCamera(new THREE.Vector3(2.2, 1.8, 2.8), new THREE.Vector3(0, 0.65, 0));
  }

  private buildCuringLab(): void {
    const tileMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.1, roughness: 0.2 });
    const stainlessSteel = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.6,
    });

    // 1. Thermostatically Controlled Water Curing Tank (IS 516: 27 ± 2 °C)
    const tankWallMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.5 });
    const tankOuter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 1.1), tankWallMat);
    tankOuter.position.set(-0.5, 0.35, 0);
    tankOuter.castShadow = true;
    this.labGroup.add(tankOuter);

    // Inner water volume
    this.tankWaterMesh = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.55, 0.98), waterMat);
    this.tankWaterMesh.position.set(-0.5, 0.38, 0);
    this.labGroup.add(this.tankWaterMesh);

    // Immersion heater thermostat coil
    const heater = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 16), stainlessSteel);
    heater.position.set(-1.1, 0.5, -0.35);
    this.labGroup.add(heater);

    // 2. Concrete Cubes inside curing water tank
    for (let i = 0; i < 6; i++) {
      const cubeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7, metalness: 0.1 });
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), cubeMat);
      const row = Math.floor(i / 3);
      const col = i % 3;
      cube.position.set(-0.9 + col * 0.4, 0.22, -0.25 + row * 0.5);
      cube.castShadow = true;
      this.cubesInTankGroup.add(cube);
    }
    this.labGroup.add(this.cubesInTankGroup);

    // 3. Work Bench for Demoulding & Inspection
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.8), tankWallMat);
    bench.position.set(1.1, 0.375, 0);
    bench.castShadow = true;
    this.labGroup.add(bench);

    // Demoulded test cube on bench ready for testing
    const testCubeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8, metalness: 0.05 });
    const testCube = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), testCubeMat);
    testCube.position.set(1.0, 0.825, 0);
    testCube.castShadow = true;
    this.demouldedCubesGroup.add(testCube);
    this.labGroup.add(this.demouldedCubesGroup);

    // 4. Heavy Cast Iron Moulds on bench (150mm cubes per IS 10086)
    const mouldMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
    const mould = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.17, 0.2), mouldMat);
    mould.position.set(1.3, 0.835, -0.2);
    this.curingMouldsGroup.add(mould);
    this.labGroup.add(this.curingMouldsGroup);

    // 5. Environmental Telemetry Screen on Wall
    const hudMat = new THREE.MeshBasicMaterial({ map: this.hudTexture });
    const hudScreen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.04), hudMat);
    hudScreen.position.set(0.1, 1.4, -0.5);
    this.tempTimeHudMesh = hudScreen;
    this.labGroup.add(hudScreen);
  }

  private drawCuringHud(tempC: number, ageDays: number, regime: string, pctStrength: number): void {
    const ctx = this.hudCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 244);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('CURING CHAMBER CONTROLLER', 20, 36);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`AGE: ${ageDays} DAYS`, 300, 36);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText('TANK TEMPERATURE:', 24, 85);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 40px monospace';
    ctx.fillText(`${tempC.toFixed(1)} °C`, 24, 130);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px monospace';
    ctx.fillText('STRENGTH MATURITY:', 260, 85);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 40px monospace';
    ctx.fillText(`${pctStrength.toFixed(1)} %`, 260, 130);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`REGIME: ${regime}`, 24, 195);
    ctx.fillText('IS 516 STANDARD COMPLIANT WATER BATH', 24, 225);

    this.hudTexture.needsUpdate = true;
  }

  public updateExperiment(params: ICuringParams, result: ICuringStrengthResult): void {
    this.currentParams = params;
    this.currentResult = result;

    const regimeLabel =
      params.curingRegime === 'water_submersion_27c'
        ? 'WATER SUBMERSION (27°C)'
        : params.curingRegime === 'accelerated_warm_55c'
        ? 'ACCELERATED 55°C'
        : params.curingRegime === 'steam_curing_65c'
        ? 'STEAM 65°C'
        : 'UNPROTECTED AIR DRY';

    this.drawCuringHud(params.temperatureC, params.ageDays, regimeLabel, result.pctOf28DayStrength);

    // Toggle water visibility if dry air curing
    this.tankWaterMesh.visible = params.curingRegime !== 'ambient_air_dry';
  }

  protected onUpdate(_time: number): void {}

  public override dispose(): void {
    super.dispose();
    this.hudTexture.dispose();
  }
}
