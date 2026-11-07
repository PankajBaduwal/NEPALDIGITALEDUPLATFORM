import * as THREE from 'three';
import { BaseFluidMachinerySimulation } from '../../core/BaseFluidMachinerySimulation';
import { FluidMachineryCalculator } from '../../core/FluidMachineryCalculator';
import type { ParameterControlDefinition, StageDefinition } from '../../core/types';

export class FlowMetersScene extends BaseFluidMachinerySimulation {
  private rotameterFloat!: THREE.Mesh;
  private venturiManometerL!: THREE.Mesh;
  private venturiManometerR!: THREE.Mesh;
  private orificeManometerL!: THREE.Mesh;
  private orificeManometerR!: THREE.Mesh;

  constructor(container: HTMLElement) {
    super(container);
    this.initialCameraPosition.set(2.4, 2.2, 3.2);
    this.initialCameraTarget.set(0, 1.1, 0);
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.target.copy(this.initialCameraTarget);
    this.controls.update();

    this.initStages();
    this.initParameters();
    this.buildFlowMetersBench();
    this.updateCalculations();
  }

  private initStages(): void {
    this.stages = [
      {
        id: 'stage-venturimeter',
        title: '1. Calibration of Venturimeter (Exp 2)',
        description:
          'Observe the Venturimeter with 21° converging inlet and gradual 5°-7° diverging diffuser designed to prevent boundary layer separation.',
        educationalFocus:
          'Because flow streamlines adhere cleanly to the walls, eddy losses are minimal, yielding an exceptionally high discharge coefficient (Cd ≈ 0.96 to 0.98).',
        equations: [
          'Theoretical Discharge: Q_th = [a₁a₂ / √(a₁² - a₂²)] · √(2gh)',
          'Actual Discharge: Q_act = C_d · Q_th = A_tank · R / t',
        ],
        cameraPosition: [-0.6, 1.5, 2.0],
        cameraTarget: [-0.6, 1.1, 0],
      },
      {
        id: 'stage-orificemeter',
        title: '2. Calibration of Orifice Meter (Exp 3)',
        description:
          'Inspect the Orifice meter featuring a sharp-edged circular orifice plate clamped between pipeline flanges with corner pressure taps.',
        educationalFocus:
          'Flow contracts past the orifice opening to a minimum cross-sectional area (vena contracta). Intense eddy recirculation lowers Cd to 0.60–0.64.',
        equations: [
          'Vena Contracta: a_c = C_c · a₀',
          'Coefficient of Discharge: C_d = C_c · C_v ≈ 0.60 - 0.64',
        ],
        cameraPosition: [0.3, 1.5, 2.0],
        cameraTarget: [0.3, 1.1, 0],
      },
      {
        id: 'stage-rotameter',
        title: '3. Calibration of Rotameter (Exp 4)',
        description:
          'Observe the variable-area vertical rotameter where an upward fluid drag balances the buoyant weight of a precision float.',
        educationalFocus:
          'As discharge increases, the float rises along the tapered tube, enlarging the annular flow area until dynamic equilibrium is re-established.',
        equations: [
          'Equilibrium: Drag Force + Buoyancy = Weight of Float',
          'Annular Area A_a ∝ Height of Float y => Q ∝ y',
        ],
        cameraPosition: [1.2, 1.6, 1.8],
        cameraTarget: [1.2, 1.2, 0],
      },
    ];
  }

  private initParameters(): void {
    this.availableParameters = [
      {
        id: 'meterType',
        label: 'Active Apparatus',
        unit: 'type',
        min: 0,
        max: 2,
        step: 1,
        defaultValue: 0,
        description: '0: Venturimeter, 1: Orifice Meter, 2: Rotameter.',
        category: 'machine',
      },
      {
        id: 'manometerDeflectionCm',
        label: 'Manometer Head (y)',
        unit: 'cm Hg',
        min: 4,
        max: 35,
        step: 1,
        defaultValue: 18,
        description: 'Differential mercury manometer reading across tapping ports.',
        category: 'flow',
      },
      {
        id: 'inletDiameterMm',
        label: 'Pipe Diameter (d1)',
        unit: 'mm',
        min: 40,
        max: 60,
        step: 5,
        defaultValue: 50,
        description: 'Upstream inlet pipeline diameter.',
        category: 'geometry',
      },
      {
        id: 'throatDiameterMm',
        label: 'Throat/Orifice Bore (d2)',
        unit: 'mm',
        min: 20,
        max: 35,
        step: 1,
        defaultValue: 25,
        description: 'Internal constricted throat or orifice plate aperture diameter.',
        category: 'geometry',
      },
    ];

    this.state.parameters = {
      meterType: 0,
      manometerDeflectionCm: 18,
      inletDiameterMm: 50,
      throatDiameterMm: 25,
    };
    this.state.selectedParameterValues = { ...this.state.parameters };
  }

  private buildFlowMetersBench(): void {
    const benchGroup = new THREE.Group();

    // 1. Table
    const tableGeo = new THREE.BoxGeometry(2.8, 0.08, 0.9);
    const table = new THREE.Mesh(tableGeo, this.castIronMaterial);
    table.position.set(0, 0.8, 0);
    benchGroup.add(table);

    // 2. Venturimeter (Left Pipeline)
    const venturiGroup = new THREE.Group();
    venturiGroup.position.set(-0.7, 1.05, 0);

    // Inlet pipe
    const inletGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 16);
    inletGeo.rotateZ(Math.PI / 2);
    const inletMesh = new THREE.Mesh(inletGeo, this.brassMaterial);
    inletMesh.position.set(-0.25, 0, 0);
    venturiGroup.add(inletMesh);

    // Converging cone (21 deg)
    const convGeo = new THREE.CylinderGeometry(0.0125, 0.025, 0.1, 16);
    convGeo.rotateZ(Math.PI / 2);
    const convMesh = new THREE.Mesh(convGeo, this.brassMaterial);
    convMesh.position.set(-0.075, 0, 0);
    venturiGroup.add(convMesh);

    // Throat
    const throatGeo = new THREE.CylinderGeometry(0.0125, 0.0125, 0.05, 16);
    throatGeo.rotateZ(Math.PI / 2);
    const throatMesh = new THREE.Mesh(throatGeo, this.acrylicMaterial);
    venturiGroup.add(throatMesh);

    // Diverging diffuser cone (7 deg)
    const diffGeo = new THREE.CylinderGeometry(0.025, 0.0125, 0.25, 16);
    diffGeo.rotateZ(Math.PI / 2);
    const diffMesh = new THREE.Mesh(diffGeo, this.brassMaterial);
    diffMesh.position.set(0.15, 0, 0);
    venturiGroup.add(diffMesh);

    venturiGroup.userData.inspection = {
      id: 'venturimeter',
      name: 'Standard Calibrated Venturimeter',
      category: 'measurement',
      description: 'Streamlined differential pressure meter with 21° convergence and 7° divergence (Cd ≈ 0.97).',
      specifications: { 'Inlet Bore d1': '50 mm', 'Throat Bore d2': '25 mm', 'Convergence Angle': '21°', 'Diffuser Angle': '7°' },
    };
    benchGroup.add(venturiGroup);

    // 3. Orifice Meter (Center Pipeline)
    const orificeGroup = new THREE.Group();
    orificeGroup.position.set(0.2, 1.05, 0);

    const orPipeGeo1 = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 16);
    orPipeGeo1.rotateZ(Math.PI / 2);
    const orPipe1 = new THREE.Mesh(orPipeGeo1, this.steelMaterial);
    orPipe1.position.set(-0.13, 0, 0);
    orificeGroup.add(orPipe1);

    const orPipeGeo2 = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 16);
    orPipeGeo2.rotateZ(Math.PI / 2);
    const orPipe2 = new THREE.Mesh(orPipeGeo2, this.steelMaterial);
    orPipe2.position.set(0.13, 0, 0);
    orificeGroup.add(orPipe2);

    // Orifice Flange & Plate
    const flangeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 20);
    flangeGeo.rotateZ(Math.PI / 2);
    const flange = new THREE.Mesh(flangeGeo, this.brassMaterial);
    orificeGroup.add(flange);

    orificeGroup.userData.inspection = {
      id: 'orificemeter',
      name: 'Thin Sharp-Edged Orifice Meter',
      category: 'measurement',
      description: 'Compact flow meter creating a vena contracta with corner taps (Cd ≈ 0.62).',
      specifications: { 'Pipe Diameter d1': '50 mm', 'Orifice Diameter d0': '25 mm', 'Plate Material': 'Stainless Steel' },
    };
    benchGroup.add(orificeGroup);

    // 4. Rotameter (Right Vertical Tube)
    const rotameterGroup = new THREE.Group();
    rotameterGroup.position.set(1.0, 1.25, 0);

    // Tapered glass tube
    const glassGeo = new THREE.CylinderGeometry(0.022, 0.015, 0.55, 16);
    const glassTube = new THREE.Mesh(glassGeo, this.acrylicMaterial);
    rotameterGroup.add(glassTube);

    // Stainless steel float (moves vertically with Q)
    const floatGeo = new THREE.ConeGeometry(0.012, 0.025, 16);
    floatGeo.rotateX(Math.PI);
    this.rotameterFloat = new THREE.Mesh(floatGeo, this.steelMaterial);
    this.rotameterFloat.position.set(0, -0.1, 0);
    rotameterGroup.add(this.rotameterFloat);

    rotameterGroup.userData.inspection = {
      id: 'rotameter',
      name: 'Variable-Area Flow Rotameter',
      category: 'measurement',
      description: 'Precision tapered glass rotameter with self-centering plumb float.',
      specifications: { 'Scale Range': '0 to 3000 L/h', Accuracy: '± 1.5% F.S.', Tube: 'Borosilicate Tapered Glass' },
    };
    benchGroup.add(rotameterGroup);

    // 5. Differential Manometers
    const uTubeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.5, 12);
    const vManL = new THREE.Mesh(uTubeGeo, this.mercuryMaterial);
    vManL.position.set(-0.75, 1.45, -0.2);
    benchGroup.add(vManL);
    this.venturiManometerL = vManL;

    const vManR = new THREE.Mesh(uTubeGeo, this.mercuryMaterial);
    vManR.position.set(-0.65, 1.45, -0.2);
    benchGroup.add(vManR);
    this.venturiManometerR = vManR;

    this.scene.add(benchGroup);
  }

  protected updatePhysics(delta: number): void {
    // Subtle float vibration in rotameter representing turbulent buoyancy
    if (this.rotameterFloat) {
      const wobble = Math.sin(this.state.currentTime * 12) * 0.001;
      this.rotameterFloat.rotation.y += delta * 1.5;
    }
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const typeIdx = Number(this.state.parameters.meterType ?? 0);
    const meterTypes: ('venturimeter' | 'orificemeter' | 'rotameter')[] = ['venturimeter', 'orificemeter', 'rotameter'];
    const selectedType = meterTypes[typeIdx] || 'venturimeter';

    const y = Number(this.state.parameters.manometerDeflectionCm || 18);
    const d1 = Number(this.state.parameters.inletDiameterMm || 50);
    const d2 = Number(this.state.parameters.throatDiameterMm || 25);

    const res = FluidMachineryCalculator.calculateFlowMeter(selectedType, d1, d2, y);

    // Update rotameter float vertical height (proportional to actual discharge)
    if (this.rotameterFloat) {
      const floatY = THREE.MathUtils.clamp(-0.2 + (res.actualDischarge / 4.0) * 0.4, -0.22, 0.22);
      this.rotameterFloat.position.y = floatY;
    }

    // Update Venturi differential manometer
    if (this.venturiManometerL && this.venturiManometerR) {
      const deflNorm = (y / 35) * 0.12;
      this.venturiManometerL.position.y = 1.45 - deflNorm;
      this.venturiManometerR.position.y = 1.45 + deflNorm;
    }

    this.state.metrics = {
      Apparatus: selectedType === 'venturimeter' ? 'Venturimeter (Exp 2)' : selectedType === 'orificemeter' ? 'Orifice Meter (Exp 3)' : 'Rotameter (Exp 4)',
      'Manometer Head (y)': `${y.toFixed(1)} cm Hg`,
      'Water Head (h)': `${res.differentialHeadWater.toFixed(3)} m of water`,
      'Theoretical Flow (Qth)': `${res.theoreticalDischarge.toFixed(3)} L/s`,
      'Actual Flow (Qact)': `${res.actualDischarge.toFixed(3)} L/s`,
      'Discharge Coeff (Cd)': `${res.dischargeCoefficient.toFixed(4)}`,
      'Throat Velocity': `${res.velocityThroat.toFixed(2)} m/s`,
      'Pressure Drop': `${res.pressureDropKPa.toFixed(2)} kPa`,
    };
    this.notify();
  }
}
