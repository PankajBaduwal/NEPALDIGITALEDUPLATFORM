import * as THREE from 'three';
import { BaseFluidMachinerySimulation } from '../../core/BaseFluidMachinerySimulation';
import { FluidMachineryCalculator } from '../../core/FluidMachineryCalculator';
import type { ParameterControlDefinition, StageDefinition } from '../../core/types';

export class BernoulliScene extends BaseFluidMachinerySimulation {
  private piezometerWaterMeshes: THREE.Mesh[] = [];
  private conduitMesh!: THREE.Mesh;
  private streamlineParticles!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleCount = 200;

  constructor(container: HTMLElement) {
    super(container);
    this.initialCameraPosition.set(2.8, 2.2, 3.2);
    this.initialCameraTarget.set(0, 1.1, 0);
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.target.copy(this.initialCameraTarget);
    this.controls.update();

    this.initStages();
    this.initParameters();
    this.buildBernoulliApparatus();
    this.updateCalculations();
  }

  private initStages(): void {
    this.stages = [
      {
        id: 'stage-apparatus',
        title: '1. Apparatus Familiarization',
        description:
          'Inspect the constant-head supply tank, transparent converging-diverging venturi conduit, and 9 vertical piezometer manometer tubes.',
        educationalFocus:
          'Learn the physical layout of the Bernoulli demonstration test rig. Water flows from high potential head into the conduit.',
        equations: [
          'Total Energy H = (p / ρg) + (v² / 2g) + z = Constant',
          'Continuity Equation: Q = A₁v₁ = A₂v₂ = A(x) · v(x)',
        ],
        cameraPosition: [2.8, 2.2, 3.2],
        cameraTarget: [0, 1.1, 0],
      },
      {
        id: 'stage-throat-dynamics',
        title: '2. Venturi Throat Dynamics',
        description:
          'Observe the dramatic drop in piezometric pressure head at the constricted throat (Section 5) accompanied by maximum kinetic velocity head.',
        educationalFocus:
          'As the cross-sectional area decreases to half, flow velocity doubles and velocity head increases fourfold, causing pressure head to plummet.',
        equations: [
          'Velocity: v = Q / A(x)',
          'Velocity Head: h_v = v² / (2g)',
          'Piezometric Head: h_p = H_total - h_v - z',
        ],
        cameraPosition: [0.8, 1.6, 2.0],
        cameraTarget: [0, 1.1, 0],
      },
      {
        id: 'stage-diffuser-recovery',
        title: '3. Diffuser Pressure Recovery & Head Loss',
        description:
          'Follow the diverging diffuser cone where fluid decelerates and kinetic head converts back into static pressure head with slight boundary layer loss.',
        educationalFocus:
          'Compare the inlet total head with the outlet total head. The difference reflects small frictional loss along the conduit walls.',
        equations: [
          'Diffuser Deceleration: v_outlet < v_throat',
          'Head Loss: h_L = H_inlet - H_outlet',
        ],
        cameraPosition: [1.8, 1.4, 2.4],
        cameraTarget: [0.4, 1.1, 0],
      },
    ];
  }

  private initParameters(): void {
    this.availableParameters = [
      {
        id: 'dischargeLps',
        label: 'Flow Rate (Q)',
        unit: 'L/s',
        min: 0.5,
        max: 5.0,
        step: 0.1,
        defaultValue: 2.2,
        description: 'Volumetric discharge regulated via inlet supply valve.',
        category: 'flow',
      },
      {
        id: 'inletDiameterMm',
        label: 'Inlet Diameter (D1)',
        unit: 'mm',
        min: 40,
        max: 65,
        step: 1,
        defaultValue: 50,
        description: 'Internal bore diameter of inlet and outlet sections.',
        category: 'geometry',
      },
      {
        id: 'throatDiameterMm',
        label: 'Throat Diameter (D2)',
        unit: 'mm',
        min: 18,
        max: 32,
        step: 1,
        defaultValue: 24,
        description: 'Internal bore diameter at the constricted throat section.',
        category: 'geometry',
      },
    ];

    this.state.parameters = {
      dischargeLps: 2.2,
      inletDiameterMm: 50,
      throatDiameterMm: 24,
    };
    this.state.selectedParameterValues = { ...this.state.parameters };
  }

  private buildBernoulliApparatus(): void {
    const rigGroup = new THREE.Group();

    // 1. Table / Support Frame
    const frameGeo = new THREE.BoxGeometry(2.4, 0.08, 0.8);
    const tableTop = new THREE.Mesh(frameGeo, this.castIronMaterial);
    tableTop.position.set(0, 0.8, 0);
    tableTop.receiveShadow = true;
    rigGroup.add(tableTop);

    // 4 Steel legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8);
    const legPositions = [
      [-1.1, 0.4, -0.35],
      [1.1, 0.4, -0.35],
      [-1.1, 0.4, 0.35],
      [1.1, 0.4, 0.35],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, this.steelMaterial);
      leg.position.set(x!, y!, z!);
      rigGroup.add(leg);
    });

    // 2. Constant Head Supply Tank (Left)
    const tankGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.9, 24);
    const tank = new THREE.Mesh(tankGeo, this.acrylicMaterial);
    tank.position.set(-1.0, 1.35, 0);
    tank.userData.inspection = {
      id: 'supply-tank',
      name: 'Constant-Head Overhead Supply Tank',
      category: 'hydraulic',
      description: 'Provides constant hydrostatic pressure head to maintain steady, pulse-free conduit flow.',
      specifications: { 'Internal Diameter': '440 mm', Height: '900 mm', Material: 'Transparent Cast Acrylic' },
    };
    rigGroup.add(tank);

    // Water volume inside tank
    const tankWaterGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.8, 24);
    const tankWater = new THREE.Mesh(tankWaterGeo, this.waterMaterial);
    tankWater.position.set(-1.0, 1.3, 0);
    rigGroup.add(tankWater);

    // 3. Converging-Diverging Venturi Conduit
    // Modeled with lathe geometry along X axis
    const conduitLength = 1.4;
    const conduitGroup = new THREE.Group();
    conduitGroup.position.set(0, 1.0, 0);

    // 9 sections along the conduit
    const pointsCount = 9;
    const startX = -conduitLength / 2;
    const dx = conduitLength / (pointsCount - 1);

    for (let i = 0; i < pointsCount - 1; i++) {
      const x1 = startX + i * dx;
      const x2 = startX + (i + 1) * dx;
      const frac1 = i / (pointsCount - 1);
      const frac2 = (i + 1) / (pointsCount - 1);

      const r1 = (frac1 <= 0.5 ? 0.05 - 0.026 * (frac1 / 0.5) : 0.024 + 0.026 * ((frac1 - 0.5) / 0.5)) / 2;
      const r2 = (frac2 <= 0.5 ? 0.05 - 0.026 * (frac2 / 0.5) : 0.024 + 0.026 * ((frac2 - 0.5) / 0.5)) / 2;

      const segGeo = new THREE.CylinderGeometry(r2, r1, dx, 16);
      segGeo.rotateZ(Math.PI / 2);
      const segMesh = new THREE.Mesh(segGeo, this.acrylicMaterial);
      segMesh.position.set((x1 + x2) / 2, 0, 0);
      conduitGroup.add(segMesh);
    }

    conduitGroup.userData.inspection = {
      id: 'venturi-conduit',
      name: 'Converging-Diverging Venturi Test Conduit',
      category: 'hydraulic',
      description: 'Precision machined acrylic conduit with 9 pressure tapping ports along its centerline.',
      specifications: { 'Inlet / Outlet Bore': '50 mm', 'Throat Bore': '24 mm', Length: '1400 mm' },
    };
    rigGroup.add(conduitGroup);

    // 4. Nine Vertical Piezometer Tubes & Water Columns
    const piezometerGroup = new THREE.Group();
    piezometerGroup.position.set(0, 1.0, 0);

    for (let i = 0; i < pointsCount; i++) {
      const x = startX + i * dx;
      // Acrylic outer tube
      const tubeGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.7, 12);
      const tubeMesh = new THREE.Mesh(tubeGeo, this.acrylicMaterial);
      tubeMesh.position.set(x, 0.35, 0);
      piezometerGroup.add(tubeMesh);

      // Inner liquid column (height updated by physics)
      const waterColGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.4, 12);
      const waterColMesh = new THREE.Mesh(waterColGeo, this.waterMaterial);
      waterColMesh.position.set(x, 0.2, 0);
      piezometerGroup.add(waterColMesh);
      this.piezometerWaterMeshes.push(waterColMesh);

      // Section identification marker
      const ringGeo = new THREE.TorusGeometry(0.012, 0.002, 8, 16);
      const ring = new THREE.Mesh(ringGeo, this.brassMaterial);
      ring.position.set(x, 0.02, 0);
      ring.rotation.x = Math.PI / 2;
      piezometerGroup.add(ring);
    }

    rigGroup.add(piezometerGroup);

    // 5. Streamline Particles
    const pos = new Float32Array(this.particleCount * 3);
    for (let i = 0; i < this.particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * conduitLength;
      pos[i * 3 + 1] = 1.0 + (Math.random() - 0.5) * 0.03;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    }
    this.particlePositions = pos;

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.022,
      transparent: true,
      opacity: 0.8,
    });
    this.streamlineParticles = new THREE.Points(particleGeo, particleMat);
    rigGroup.add(this.streamlineParticles);

    // 6. Outlet Collecting Tank (Right)
    const collectTankGeo = new THREE.BoxGeometry(0.35, 0.45, 0.35);
    const collectTank = new THREE.Mesh(collectTankGeo, this.castIronMaterial);
    collectTank.position.set(1.0, 1.05, 0);
    collectTank.userData.inspection = {
      id: 'collecting-tank',
      name: 'Volumetric Measuring Tank with Piezometer',
      category: 'measurement',
      description: 'Collects conduit discharge over timed intervals to determine actual flow rate (Q = A·R/t).',
      specifications: { 'Plan Dimensions': '350 mm × 350 mm', Height: '450 mm', Scale: 'Graduated mm glass tube' },
    };
    rigGroup.add(collectTank);

    this.scene.add(rigGroup);
  }

  protected updatePhysics(delta: number): void {
    // Animate streamlines through converging-diverging section
    if (!this.streamlineParticles) return;

    const conduitLength = 1.4;
    const halfL = conduitLength / 2;
    const Q = Number(this.state.parameters.dischargeLps || 2.2);

    if (!this.particlePositions || !this.streamlineParticles) return;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const x = this.particlePositions[idx] ?? 0;
      // Normalize position: 0 (inlet) to 1 (outlet)
      const frac = THREE.MathUtils.clamp((x + halfL) / conduitLength, 0, 1);
      // Throat is at frac = 0.5 -> velocity peaks
      const localD = frac <= 0.5 ? 0.05 - 0.026 * (frac / 0.5) : 0.024 + 0.026 * ((frac - 0.5) / 0.5);
      const localA = (Math.PI * Math.pow(localD, 2)) / 4;
      const v = (Q / 1000) / localA;

      this.particlePositions[idx] = (this.particlePositions[idx] ?? 0) + v * delta * 0.4;
      if ((this.particlePositions[idx] ?? 0) > halfL) {
        this.particlePositions[idx] = -halfL;
      }
    }
    const posAttr = this.streamlineParticles.geometry.attributes.position;
    if (posAttr) posAttr.needsUpdate = true;
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const Q_lps = Number(this.state.parameters.dischargeLps || 2.2);
    const d1 = Number(this.state.parameters.inletDiameterMm || 50);
    const d2 = Number(this.state.parameters.throatDiameterMm || 24);

    const res = FluidMachineryCalculator.calculateBernoulliTheorem(Q_lps, d1, d2);

    // Update 3D piezometer water columns
    res.sections.forEach((sec, idx) => {
      const mesh = this.piezometerWaterMeshes[idx];
      if (mesh) {
        const h = THREE.MathUtils.clamp(sec.pressureHead * 0.35, 0.04, 0.65);
        mesh.scale.set(1, h / 0.4, 1);
        mesh.position.y = h / 2;
      }
    });

    this.state.metrics = {
      'Discharge (Q)': `${Q_lps.toFixed(2)} L/s`,
      'Inlet Velocity (v1)': `${res.inletVelocity.toFixed(2)} m/s`,
      'Throat Velocity (v2)': `${res.throatVelocity.toFixed(2)} m/s`,
      'Inlet Pressure Head (h1)': `${res.inletPressureHead.toFixed(3)} m`,
      'Throat Pressure Head (h2)': `${res.throatPressureHead.toFixed(3)} m`,
      'Total Head Loss': `${res.headLossTotal.toFixed(3)} m`,
      'Continuity Check': 'A₁v₁ = A₂v₂ = Q',
      'Energy Error': `${res.energyConservationErrorPercent.toFixed(2)}%`,
    };
    this.notify();
  }
}
