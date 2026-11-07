import * as THREE from 'three';
import { BaseFluidMachinerySimulation } from '../../core/BaseFluidMachinerySimulation';
import { FluidMachineryCalculator } from '../../core/FluidMachineryCalculator';
import type { ParameterControlDefinition, StageDefinition } from '../../core/types';

export class TurbinesScene extends BaseFluidMachinerySimulation {
  private peltonRunnerMesh!: THREE.Group;
  private francisRunnerMesh!: THREE.Group;
  private peltonWaterJetMesh!: THREE.Mesh;
  private brakeDrumMesh!: THREE.Mesh;

  constructor(container: HTMLElement) {
    super(container);
    this.initialCameraPosition.set(2.8, 2.4, 3.6);
    this.initialCameraTarget.set(0, 1.0, 0);
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.target.copy(this.initialCameraTarget);
    this.controls.update();

    this.initStages();
    this.initParameters();
    this.buildTurbinesRig();
    this.updateCalculations();
  }

  private initStages(): void {
    this.stages = [
      {
        id: 'stage-pelton-wheel',
        title: '1. Pelton Wheel Impulse Turbine (Exp 8)',
        description:
          'Inspect the tangential impulse Pelton wheel driven by a high-velocity water jet through a spear nozzle discharging onto ellipsoidal split buckets.',
        educationalFocus:
          'Water potential energy is converted entirely into kinetic energy in the spear nozzle (v = Cv·√(2gH)). The jet strikes bucket splitter ridges, deflecting 165° to transfer momentum.',
        equations: [
          'Jet Velocity: v₁ = C_v · √(2 · g · H_net)',
          'Hydraulic Power: P_hyd = (ρ · g · Q · H_net) / 1000 kW',
          'Brake Power: P_s = [2π · N · (W - S) · R_b · g] / 60000 kW',
        ],
        cameraPosition: [-0.8, 1.6, 2.2],
        cameraTarget: [-0.8, 1.0, 0],
      },
      {
        id: 'stage-francis-turbine',
        title: '2. Francis Reaction Turbine & Draft Tube (Exp 9)',
        description:
          'Examine the mixed-flow Francis turbine featuring a spiral scroll casing, adjustable guide vanes, runner, and divergent draft tube.',
        educationalFocus:
          'Water enters with both pressure and kinetic energy. The draft tube creates suction vacuum at runner exit, recovering residual kinetic energy and increasing effective net head.',
        equations: [
          'Draft Tube Recovery Head: h_d = (v_exit² - v_tailrace²) / (2g)',
          'Specific Speed: N_s = [N · √P_s] / H^(5/4)',
        ],
        cameraPosition: [0.8, 1.6, 2.2],
        cameraTarget: [0.8, 1.0, 0],
      },
      {
        id: 'stage-unit-quantities',
        title: '3. Unit Quantities & Speed Regulation',
        description:
          'Vary the brake dynamometer loading to observe rotational speed drop, torque increase, and optimal operating efficiency peak.',
        educationalFocus:
          'Unit Quantities allow scaling turbine performance to 1 meter head: Unit Speed Nu = N/√H, Unit Discharge Qu = Q/√H, Unit Power Pu = P/H^(3/2).',
        equations: [
          'Unit Speed: N_u = N / √H',
          'Unit Discharge: Q_u = Q / √H',
          'Unit Power: P_u = P / H^(3/2)',
        ],
        cameraPosition: [0, 2.2, 3.4],
        cameraTarget: [0, 1.0, 0],
      },
    ];
  }

  private initParameters(): void {
    this.availableParameters = [
      {
        id: 'activeTurbine',
        label: 'Turbine Unit',
        unit: 'type',
        min: 0,
        max: 1,
        step: 1,
        defaultValue: 0,
        description: '0: Pelton Wheel (Exp 8), 1: Francis Turbine (Exp 9).',
        category: 'machine',
      },
      {
        id: 'netHeadM',
        label: 'Net Head (H)',
        unit: 'm',
        min: 15,
        max: 45,
        step: 1,
        defaultValue: 30,
        description: 'Net effective hydraulic head supplied to turbine inlet.',
        category: 'flow',
      },
      {
        id: 'spearOpeningPercent',
        label: 'Spear / Vane Opening',
        unit: '%',
        min: 20,
        max: 100,
        step: 5,
        defaultValue: 70,
        description: 'Spear needle actuator (Pelton) or guide vane opening (Francis).',
        category: 'flow',
      },
      {
        id: 'brakeDeadWeightKg',
        label: 'Dead Weights (W)',
        unit: 'kg',
        min: 5,
        max: 35,
        step: 1,
        defaultValue: 18,
        description: 'Dead weight load placed on rope brake dynamometer hanger.',
        category: 'machine',
      },
    ];

    this.state.parameters = {
      activeTurbine: 0,
      netHeadM: 30,
      spearOpeningPercent: 70,
      brakeDeadWeightKg: 18,
    };
    this.state.selectedParameterValues = { ...this.state.parameters };
  }

  private buildTurbinesRig(): void {
    const mainGroup = new THREE.Group();

    // 1. Concrete Foundation Plinth
    const foundationGeo = new THREE.BoxGeometry(3.4, 0.25, 1.4);
    const foundation = new THREE.Mesh(foundationGeo, this.floorMaterial);
    foundation.position.set(0, 0.125, 0);
    mainGroup.add(foundation);

    // ==========================================
    // A. PELTON WHEEL TURBINE RIG (LEFT)
    // ==========================================
    const peltonGroup = new THREE.Group();
    peltonGroup.position.set(-0.9, 0.25, 0);

    // Casing (cast iron with acrylic viewing window)
    const casingGeo = new THREE.BoxGeometry(0.7, 0.8, 0.35);
    const casing = new THREE.Mesh(casingGeo, this.castIronMaterial);
    casing.position.set(0, 0.6, 0);
    peltonGroup.add(casing);

    const windowGeo = new THREE.PlaneGeometry(0.5, 0.5);
    const acrylicWin = new THREE.Mesh(windowGeo, this.acrylicMaterial);
    acrylicWin.position.set(0, 0.6, 0.176);
    peltonGroup.add(acrylicWin);

    // Spear Nozzle & Penstock Pipe
    const nozzleGeo = new THREE.CylinderGeometry(0.02, 0.045, 0.35, 16);
    nozzleGeo.rotateZ(Math.PI / 2);
    const nozzle = new THREE.Mesh(nozzleGeo, this.brassMaterial);
    nozzle.position.set(-0.35, 0.35, 0);
    peltonGroup.add(nozzle);

    // Water Jet (high velocity cone)
    const jetGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.22, 12);
    jetGeo.rotateZ(Math.PI / 2);
    this.peltonWaterJetMesh = new THREE.Mesh(jetGeo, this.waterMaterial);
    this.peltonWaterJetMesh.position.set(-0.12, 0.35, 0);
    peltonGroup.add(this.peltonWaterJetMesh);

    // Pelton Runner Wheel & Buckets
    this.peltonRunnerMesh = new THREE.Group();
    this.peltonRunnerMesh.position.set(0.05, 0.6, 0);

    const discGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 24);
    discGeo.rotateX(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, this.steelMaterial);
    this.peltonRunnerMesh.add(disc);

    // 16 Double Hemispherical Buckets
    const bucketCount = 16;
    for (let i = 0; i < bucketCount; i++) {
      const angle = (i / bucketCount) * Math.PI * 2;
      const bktGeo = new THREE.BoxGeometry(0.035, 0.045, 0.025);
      const bkt = new THREE.Mesh(bktGeo, this.brassMaterial);
      bkt.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0);
      bkt.rotation.z = angle;
      this.peltonRunnerMesh.add(bkt);
    }
    peltonGroup.add(this.peltonRunnerMesh);

    // Rope Brake Dynamometer Drum (attached to shaft)
    const drumGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 24);
    drumGeo.rotateX(Math.PI / 2);
    this.brakeDrumMesh = new THREE.Mesh(drumGeo, this.castIronMaterial);
    this.brakeDrumMesh.position.set(0.05, 0.6, -0.25);
    peltonGroup.add(this.brakeDrumMesh);

    peltonGroup.userData.inspection = {
      id: 'pelton-turbine',
      name: 'Pelton Wheel Impulse Turbine (Exp 8)',
      category: 'machine',
      description: 'Tangential impulse turbine with spear needle nozzle, 16 double-ellipsoidal runner buckets, and rope brake dynamometer.',
      specifications: { 'Rated Net Head': '30 m', 'Spear Nozzle Bore': '28 mm', 'Runner Pitch Diameter': '440 mm', 'Brake Drum Radius': '150 mm' },
    };
    mainGroup.add(peltonGroup);

    // ==========================================
    // B. FRANCIS TURBINE RIG (RIGHT)
    // ==========================================
    const francisGroup = new THREE.Group();
    francisGroup.position.set(0.9, 0.25, 0);

    // Spiral Scroll Casing (Volute geometry)
    const spiralGeo = new THREE.TorusGeometry(0.25, 0.09, 16, 32);
    const spiral = new THREE.Mesh(spiralGeo, this.castIronMaterial);
    spiral.position.set(0, 0.65, 0);
    spiral.rotation.x = Math.PI / 2;
    francisGroup.add(spiral);

    // Conical Draft Tube (descending below runner into tailrace)
    const draftGeo = new THREE.CylinderGeometry(0.09, 0.16, 0.55, 16);
    const draftTube = new THREE.Mesh(draftGeo, this.acrylicMaterial);
    draftTube.position.set(0, 0.25, 0);
    francisGroup.add(draftTube);

    // Francis Mixed-Flow Runner
    this.francisRunnerMesh = new THREE.Group();
    this.francisRunnerMesh.position.set(0, 0.65, 0);
    const frHubGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.08, 16);
    const frHub = new THREE.Mesh(frHubGeo, this.brassMaterial);
    this.francisRunnerMesh.add(frHub);

    // 12 Curved reaction blades
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.04, 0.06, 0.01);
      const blade = new THREE.Mesh(bladeGeo, this.steelMaterial);
      blade.position.set(Math.cos(angle) * 0.1, 0, Math.sin(angle) * 0.1);
      blade.rotation.y = angle + 0.4;
      this.francisRunnerMesh.add(blade);
    }
    francisGroup.add(this.francisRunnerMesh);

    francisGroup.userData.inspection = {
      id: 'francis-turbine',
      name: 'Francis Mixed-Flow Reaction Turbine (Exp 9)',
      category: 'machine',
      description: 'Inward reaction turbine with spiral casing, adjustable aerofoil guide vanes, runner, and kinetic-recovery draft tube.',
      specifications: { 'Rated Net Head': '18 m', 'Runner Diameter': '180 mm', 'Draft Tube': 'Conical Divergent (Vacuum Recovery)', 'Specific Speed': '85 metric' },
    };
    mainGroup.add(francisGroup);

    this.scene.add(mainGroup);
  }

  protected updatePhysics(delta: number): void {
    const isPelton = Number(this.state.parameters.activeTurbine ?? 0) === 0;

    if (isPelton && this.peltonRunnerMesh) {
      // Pelton runner rotation
      const rpm = Number(this.state.metrics['Rotational Speed (N)']?.toString().replace(' RPM', '') || 750);
      this.peltonRunnerMesh.rotation.z -= delta * (rpm / 60) * Math.PI * 0.3;
      if (this.brakeDrumMesh) {
        this.brakeDrumMesh.rotation.z -= delta * (rpm / 60) * Math.PI * 0.3;
      }
    } else if (!isPelton && this.francisRunnerMesh) {
      // Francis runner rotation around vertical shaft
      this.francisRunnerMesh.rotation.y += delta * 12.0;
    }
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const isPelton = Number(this.state.parameters.activeTurbine ?? 0) === 0;
    const H = Number(this.state.parameters.netHeadM || 30);
    const spear = Number(this.state.parameters.spearOpeningPercent || 70);
    const deadW = Number(this.state.parameters.brakeDeadWeightKg || 18);
    const springW = 3.5;

    if (isPelton) {
      // Speed drops as brake load increases: N = N_no_load - k * W
      const noLoadRpm = 1150 * (Math.sqrt(H) / Math.sqrt(30));
      const speedRpm = Math.max(350, Math.round(noLoadRpm - (deadW - springW) * 22));

      const res = FluidMachineryCalculator.calculatePeltonTurbine(H, spear, speedRpm, deadW, springW);

      this.state.metrics = {
        'Turbine Type': 'Pelton Wheel Impulse (Exp 8)',
        'Net Supply Head (H)': `${H.toFixed(1)} m`,
        'Spear Opening': `${spear}%`,
        'Discharge (Q)': `${res.dischargeLps.toFixed(2)} L/s`,
        'Jet Velocity (v1)': `${res.jetVelocity.toFixed(2)} m/s`,
        'Rotational Speed (N)': `${res.speedRpm} RPM`,
        'Net Brake Force (W-S)': `${(deadW - springW).toFixed(1)} kg (${res.netBrakeLoadN.toFixed(1)} N)`,
        'Brake Torque (T)': `${res.brakeShaftTorqueNm.toFixed(2)} N·m`,
        'Hydraulic Power (Phyd)': `${res.hydraulicInputPowerKW.toFixed(3)} kW`,
        'Brake Shaft Power (Ps)': `${res.brakeShaftPowerKW.toFixed(3)} kW`,
        'Overall Efficiency (ηo)': `${res.overallEfficiencyPercent.toFixed(2)}%`,
        'Specific Speed (Ns)': `${res.specificSpeed.toFixed(1)} metric`,
        'Unit Speed (Nu)': `${res.unitSpeed.toFixed(1)}`,
      };
    } else {
      // Francis turbine
      const guideAngle = 32.0;
      const speedRpm = 1100;
      const res = FluidMachineryCalculator.calculateFrancisTurbine(H, guideAngle, speedRpm, deadW, springW);

      this.state.metrics = {
        'Turbine Type': 'Francis Reaction (Exp 9)',
        'Net Supply Head (H)': `${H.toFixed(1)} m`,
        'Guide Vane Angle': `${guideAngle}°`,
        'Discharge (Q)': `${res.dischargeLps.toFixed(2)} L/s`,
        'Rotational Speed (N)': `${res.speedRpm} RPM`,
        'Brake Torque (T)': `${res.brakeTorqueNm.toFixed(2)} N·m`,
        'Brake Shaft Power (Ps)': `${res.brakeShaftPowerKW.toFixed(3)} kW`,
        'Overall Efficiency (ηo)': `${res.overallEfficiencyPercent.toFixed(2)}%`,
        'Draft Tube Vacuum': `${res.draftTubePressureKPa.toFixed(2)} kPa`,
        'Specific Speed (Ns)': `${res.specificSpeed.toFixed(1)} metric`,
        'Unit Speed (Nu)': `${res.unitSpeed.toFixed(1)}`,
      };
    }

    this.notify();
  }
}
