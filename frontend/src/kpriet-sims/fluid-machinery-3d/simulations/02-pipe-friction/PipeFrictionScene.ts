import * as THREE from 'three';
import { BaseFluidMachinerySimulation } from '../../core/BaseFluidMachinerySimulation';
import { FluidMachineryCalculator } from '../../core/FluidMachineryCalculator';
import type { ParameterControlDefinition, StageDefinition } from '../../core/types';

export class PipeFrictionScene extends BaseFluidMachinerySimulation {
  private pipeMeshes: THREE.Mesh[] = [];
  private leftManometerLiquid!: THREE.Mesh;
  private rightManometerLiquid!: THREE.Mesh;
  private waterFlowParticles!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleCount = 180;

  constructor(container: HTMLElement) {
    super(container);
    this.initialCameraPosition.set(2.6, 2.0, 3.4);
    this.initialCameraTarget.set(0, 1.0, 0);
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.target.copy(this.initialCameraTarget);
    this.controls.update();

    this.initStages();
    this.initParameters();
    this.buildPipeFrictionRig();
    this.updateCalculations();
  }

  private initStages(): void {
    this.stages = [
      {
        id: 'stage-friction-overview',
        title: '1. Multi-Pipe Friction Manifold',
        description:
          'Inspect the multi-pipe testing manifold featuring parallel test conduits of 15 mm, 20 mm, and 25 mm bore with isolation valves.',
        educationalFocus:
          'Flow through circular conduits experiences viscous wall shear stress causing irreversible frictional pressure loss (Darcy-Weisbach).',
        equations: [
          'Major Frictional Loss: h_f = (4 · f · L · v²) / (2 · g · D)',
          'Reynolds Number: Re = (ρ · v · D) / μ',
        ],
        cameraPosition: [2.6, 2.0, 3.4],
        cameraTarget: [0, 1.0, 0],
      },
      {
        id: 'stage-manometer-reading',
        title: '2. Differential Mercury Manometer',
        description:
          'Observe the U-tube mercury manometer deflection (y). The difference in meniscus levels directly measures frictional head loss.',
        educationalFocus:
          'Hydrostatic pressure balance: h_f = y · (S_Hg / S_w - 1) = y · (13.6 - 1) = 12.6 · y.',
        equations: [
          'Head Loss: h_f = y · (S_m - 1)',
          'Friction Factor: f = (2 · g · D · h_f) / (4 · L · v²)',
        ],
        cameraPosition: [-0.3, 1.4, 1.8],
        cameraTarget: [-0.3, 1.1, 0],
      },
      {
        id: 'stage-laminar-turbulent',
        title: '3. Laminar vs Turbulent Regimes & Moody Chart',
        description:
          'Vary the discharge rate to shift flow from smooth laminar (Re < 2000, f = 64/Re) to turbulent (Re > 4000, Blasius/Colebrook).',
        educationalFocus:
          'In laminar flow, friction depends solely on Reynolds number. In turbulent flow, pipe wall relative roughness also dictates head loss.',
        equations: [
          'Laminar: f_Darcy = 64 / Re',
          'Turbulent: f_Darcy = 0.3164 / Re^0.25',
        ],
        cameraPosition: [1.2, 1.5, 2.2],
        cameraTarget: [0, 1.0, 0],
      },
    ];
  }

  private initParameters(): void {
    this.availableParameters = [
      {
        id: 'flowRateLps',
        label: 'Flow Rate (Q)',
        unit: 'L/s',
        min: 0.1,
        max: 3.5,
        step: 0.1,
        defaultValue: 1.4,
        description: 'Flow rate pumped through the selected test pipe.',
        category: 'flow',
      },
      {
        id: 'pipeDiameterMm',
        label: 'Pipe Diameter (D)',
        unit: 'mm',
        min: 15,
        max: 30,
        step: 5,
        defaultValue: 20,
        description: 'Internal bore diameter of the active test conduit.',
        category: 'geometry',
      },
      {
        id: 'pipeLengthM',
        label: 'Tapping Length (L)',
        unit: 'm',
        min: 1.0,
        max: 3.0,
        step: 0.2,
        defaultValue: 2.0,
        description: 'Distance between piezometric pressure tapping ports.',
        category: 'geometry',
      },
    ];

    this.state.parameters = {
      flowRateLps: 1.4,
      pipeDiameterMm: 20,
      pipeLengthM: 2.0,
    };
    this.state.selectedParameterValues = { ...this.state.parameters };
  }

  private buildPipeFrictionRig(): void {
    const rig = new THREE.Group();

    // 1. Table Stand
    const benchGeo = new THREE.BoxGeometry(2.6, 0.08, 0.9);
    const bench = new THREE.Mesh(benchGeo, this.castIronMaterial);
    bench.position.set(0, 0.75, 0);
    bench.receiveShadow = true;
    rig.add(bench);

    // 2. Three Parallel Pipes (15mm, 20mm, 25mm)
    const pipeY = [0.95, 1.05, 1.15];
    const diameters = [0.015, 0.02, 0.025];
    const pipeLength = 2.2;

    pipeY.forEach((y, i) => {
      const d = diameters[i]!;
      const geo = new THREE.CylinderGeometry(d, d, pipeLength, 16);
      geo.rotateZ(Math.PI / 2);
      const mesh = new THREE.Mesh(geo, i === 1 ? this.brassMaterial : this.steelMaterial);
      mesh.position.set(0, y, (i - 1) * 0.14);
      mesh.userData.inspection = {
        id: `pipe-${d * 1000}mm`,
        name: `Calibrated Test Pipe (${d * 1000} mm Bore)`,
        category: 'hydraulic',
        description: `Precision drawn conduit with piezometric tapping points separated by 2.0 m.`,
        specifications: { 'Internal Diameter': `${d * 1000} mm`, Material: i === 1 ? 'Drawn Brass' : 'Galvanized Iron', Length: '2200 mm' },
      };
      rig.add(mesh);
      this.pipeMeshes.push(mesh);
    });

    // 3. U-Tube Differential Manometer Board
    const boardGeo = new THREE.BoxGeometry(0.3, 0.9, 0.04);
    const board = new THREE.Mesh(boardGeo, this.floorMaterial);
    board.position.set(-0.3, 1.35, -0.28);
    rig.add(board);

    // Clear U-Tube glass
    const uTubeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.7, 12);
    const leftTube = new THREE.Mesh(uTubeGeo, this.acrylicMaterial);
    leftTube.position.set(-0.35, 1.35, -0.25);
    rig.add(leftTube);

    const rightTube = new THREE.Mesh(uTubeGeo, this.acrylicMaterial);
    rightTube.position.set(-0.25, 1.35, -0.25);
    rig.add(rightTube);

    // Mercury Meniscus Meshes
    const mercGeoL = new THREE.CylinderGeometry(0.0065, 0.0065, 0.25, 12);
    this.leftManometerLiquid = new THREE.Mesh(mercGeoL, this.mercuryMaterial);
    this.leftManometerLiquid.position.set(-0.35, 1.2, -0.25);
    rig.add(this.leftManometerLiquid);

    const mercGeoR = new THREE.CylinderGeometry(0.0065, 0.0065, 0.25, 12);
    this.rightManometerLiquid = new THREE.Mesh(mercGeoR, this.mercuryMaterial);
    this.rightManometerLiquid.position.set(-0.25, 1.2, -0.25);
    rig.add(this.rightManometerLiquid);

    board.userData.inspection = {
      id: 'differential-manometer',
      name: 'U-Tube Differential Mercury Manometer',
      category: 'measurement',
      description: 'Measures differential pressure drop across upstream and downstream pressure taps (h = 12.6 · y).',
      specifications: { 'Manometric Fluid': 'Mercury (SG = 13.6)', 'Scale Range': '0 to 600 mm', Accuracy: '± 1 mm' },
    };

    // 4. Particles for water flow
    const pos = new Float32Array(this.particleCount * 3);
    for (let i = 0; i < this.particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * pipeLength;
      pos[i * 3 + 1] = 1.05 + (Math.random() - 0.5) * 0.012;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.012;
    }
    this.particlePositions = pos;
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.018, transparent: true, opacity: 0.85 });
    this.waterFlowParticles = new THREE.Points(pGeo, pMat);
    rig.add(this.waterFlowParticles);

    // 5. Collecting tank and valve
    const tankGeo = new THREE.BoxGeometry(0.35, 0.5, 0.35);
    const tank = new THREE.Mesh(tankGeo, this.castIronMaterial);
    tank.position.set(1.15, 0.95, 0);
    rig.add(tank);

    this.scene.add(rig);
  }

  protected updatePhysics(delta: number): void {
    if (!this.waterFlowParticles || !this.particlePositions) return;
    const v = Number(this.state.metrics['Mean Velocity (v)']?.toString().replace(' m/s', '') || 1.2);
    const halfL = 1.1;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      this.particlePositions[idx] = (this.particlePositions[idx] ?? 0) + v * delta * 0.5;
      if ((this.particlePositions[idx] ?? 0) > halfL) {
        this.particlePositions[idx] = -halfL;
      }
    }
    const posAttr = this.waterFlowParticles.geometry.attributes.position;
    if (posAttr) posAttr.needsUpdate = true;
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const Q = Number(this.state.parameters.flowRateLps || 1.4);
    const D = Number(this.state.parameters.pipeDiameterMm || 20);
    const L = Number(this.state.parameters.pipeLengthM || 2.0);

    const res = FluidMachineryCalculator.calculatePipeFriction(Q, D, L);

    // Update mercury columns (y deflection)
    const yNorm = THREE.MathUtils.clamp((res.manometerDeflection / 40) * 0.15, 0.02, 0.28);
    if (this.leftManometerLiquid && this.rightManometerLiquid) {
      // High pressure upstream pushes left column down, right column up
      this.leftManometerLiquid.scale.set(1, 1 - yNorm, 1);
      this.rightManometerLiquid.scale.set(1, 1 + yNorm, 1);
      this.leftManometerLiquid.position.y = 1.2 - yNorm * 0.1;
      this.rightManometerLiquid.position.y = 1.2 + yNorm * 0.1;
    }

    this.state.metrics = {
      'Discharge (Q)': `${Q.toFixed(2)} L/s`,
      'Mean Velocity (v)': `${res.velocity.toFixed(2)} m/s`,
      'Reynolds Number (Re)': `${res.reynoldsNumber.toLocaleString()}`,
      'Flow Regime': res.flowRegime,
      'Darcy Friction Factor (f)': `${res.frictionFactor.toFixed(4)}`,
      'Major Head Loss (hf)': `${res.majorHeadLoss.toFixed(3)} m`,
      'Total Head Loss': `${res.totalHeadLoss.toFixed(3)} m`,
      'Manometer Deflection (y)': `${res.manometerDeflection.toFixed(1)} cm of Hg`,
    };
    this.notify();
  }
}
