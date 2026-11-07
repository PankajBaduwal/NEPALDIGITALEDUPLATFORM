import * as THREE from 'three';
import { BaseFluidMachinerySimulation } from '../../core/BaseFluidMachinerySimulation';
import { FluidMachineryCalculator } from '../../core/FluidMachineryCalculator';
import type { ParameterControlDefinition, StageDefinition } from '../../core/types';

export class PumpsScene extends BaseFluidMachinerySimulation {
  private centrifugalImpellerMesh!: THREE.Mesh;
  private reciprocatingCrankMesh!: THREE.Group;
  private reciprocatingPistonMesh!: THREE.Mesh;
  private deliveryPressureNeedle!: THREE.Mesh;
  private suctionVacuumNeedle!: THREE.Mesh;

  constructor(container: HTMLElement) {
    super(container);
    this.initialCameraPosition.set(2.8, 2.2, 3.4);
    this.initialCameraTarget.set(0, 0.9, 0);
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.target.copy(this.initialCameraTarget);
    this.controls.update();

    this.initStages();
    this.initParameters();
    this.buildPumpsInstallation();
    this.updateCalculations();
  }

  private initStages(): void {
    this.stages = [
      {
        id: 'stage-centrifugal-pump',
        title: '1. Centrifugal Pump Performance Rig (Exp 6)',
        description:
          'Inspect the single-stage centrifugal pump driven by an induction motor with spiral volute casing, delivery pressure gauge, and suction vacuum gauge.',
        educationalFocus:
          'Mechanical energy is transferred to fluid via backward-curved impeller vanes, converting kinetic energy into pressure head in the expanding volute.',
        equations: [
          'Total Manometric Head: H_m = H_d + H_s + z',
          'Hydraulic Power: P_hyd = (ρ · g · Q · H_m) / 1000 kW',
          'Overall Efficiency: η_o = (P_hyd / P_in) · 100%',
        ],
        cameraPosition: [-0.6, 1.6, 2.2],
        cameraTarget: [-0.6, 0.9, 0],
      },
      {
        id: 'stage-reciprocating-pump',
        title: '2. Reciprocating Pump & Indicator Diagram (Exp 7)',
        description:
          'Observe the double-acting reciprocating pump with crank mechanism, suction/delivery air vessels, and indicator diagram work per stroke.',
        educationalFocus:
          'Positive displacement action: piston suction draws liquid in; piston delivery forces liquid against system head. Air vessels eliminate acceleration head.',
        equations: [
          'Theoretical Discharge: Q_th = (A · L · N) / 60',
          'Percentage Slip: s% = [(Q_th - Q_act) / Q_th] · 100%',
        ],
        cameraPosition: [0.9, 1.5, 2.2],
        cameraTarget: [0.9, 0.9, 0],
      },
      {
        id: 'stage-characteristic-curves',
        title: '3. Operating Characteristics & Affinity Laws',
        description:
          'Throttle the delivery valve or vary drive speed to trace the operational H-Q and η-Q characteristic curves from shut-off head to peak efficiency.',
        educationalFocus:
          'Affinity Laws: Discharge Q ∝ N, Head H ∝ N², Power P ∝ N³. Throttling increases delivery head while reducing volumetric discharge.',
        equations: [
          'Affinity Head: H₁ / H₂ = (N₁ / N₂)² = (D₁ / D₂)',
          'Specific Speed: N_s = [N · √Q] / H_m^(3/4)',
        ],
        cameraPosition: [0, 2.0, 3.2],
        cameraTarget: [0, 0.9, 0],
      },
    ];
  }

  private initParameters(): void {
    this.availableParameters = [
      {
        id: 'activePump',
        label: 'Active Machine',
        unit: 'type',
        min: 0,
        max: 1,
        step: 1,
        defaultValue: 0,
        description: '0: Centrifugal Pump (Exp 6), 1: Reciprocating Pump (Exp 7).',
        category: 'machine',
      },
      {
        id: 'speedRpm',
        label: 'Drive Speed (N)',
        unit: 'rpm',
        min: 1400,
        max: 3000,
        step: 100,
        defaultValue: 2800,
        description: 'Rotational speed of the electric drive motor.',
        category: 'machine',
      },
      {
        id: 'deliveryValveOpeningPercent',
        label: 'Delivery Valve',
        unit: '%',
        min: 10,
        max: 100,
        step: 5,
        defaultValue: 75,
        description: 'Delivery valve opening percentage for throttling system resistance.',
        category: 'flow',
      },
      {
        id: 'flowRateLps',
        label: 'Discharge (Q)',
        unit: 'L/s',
        min: 0.5,
        max: 8.0,
        step: 0.5,
        defaultValue: 4.5,
        description: 'Operating volumetric discharge.',
        category: 'flow',
      },
    ];

    this.state.parameters = {
      activePump: 0,
      speedRpm: 2800,
      deliveryValveOpeningPercent: 75,
      flowRateLps: 4.5,
    };
    this.state.selectedParameterValues = { ...this.state.parameters };
  }

  private buildPumpsInstallation(): void {
    const installGroup = new THREE.Group();

    // 1. Concrete Foundation Plinth
    const plinthGeo = new THREE.BoxGeometry(3.2, 0.25, 1.4);
    const plinth = new THREE.Mesh(plinthGeo, this.floorMaterial);
    plinth.position.set(0, 0.125, 0);
    installGroup.add(plinth);

    // ==========================================
    // A. CENTRIFUGAL PUMP UNIT (LEFT)
    // ==========================================
    const cpGroup = new THREE.Group();
    cpGroup.position.set(-0.85, 0.25, 0);

    // Motor
    const motorGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.45, 20);
    motorGeo.rotateZ(Math.PI / 2);
    const motor = new THREE.Mesh(motorGeo, this.castIronMaterial);
    motor.position.set(-0.35, 0.35, 0);
    cpGroup.add(motor);

    // Volute Casing
    const voluteGeo = new THREE.TorusGeometry(0.2, 0.08, 16, 32);
    const volute = new THREE.Mesh(voluteGeo, this.brassMaterial);
    volute.position.set(0.18, 0.35, 0);
    volute.rotation.y = Math.PI / 2;
    cpGroup.add(volute);

    // Impeller (spinning inside)
    const impGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16);
    impGeo.rotateZ(Math.PI / 2);
    this.centrifugalImpellerMesh = new THREE.Mesh(impGeo, this.steelMaterial);
    this.centrifugalImpellerMesh.position.set(0.18, 0.35, 0);
    cpGroup.add(this.centrifugalImpellerMesh);

    // Suction Pipe with Foot Valve (dropping into sump below)
    const suctGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16);
    const suctPipe = new THREE.Mesh(suctGeo, this.steelMaterial);
    suctPipe.position.set(0.18, -0.05, 0);
    cpGroup.add(suctPipe);

    // Delivery Pipe with Valve & Bourdon Gauge
    const delivGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.7, 16);
    const delivPipe = new THREE.Mesh(delivGeo, this.steelMaterial);
    delivPipe.position.set(0.18, 0.75, 0);
    cpGroup.add(delivPipe);

    // Delivery Gauge Dial
    const gaugeDialGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 20);
    gaugeDialGeo.rotateX(Math.PI / 2);
    const gaugeDial = new THREE.Mesh(gaugeDialGeo, this.steelMaterial);
    gaugeDial.position.set(0.18, 0.9, 0.06);
    cpGroup.add(gaugeDial);

    // Delivery Needle
    const needleGeo = new THREE.BoxGeometry(0.004, 0.04, 0.002);
    this.deliveryPressureNeedle = new THREE.Mesh(needleGeo, this.brassMaterial);
    this.deliveryPressureNeedle.position.set(0.18, 0.9, 0.075);
    cpGroup.add(this.deliveryPressureNeedle);

    cpGroup.userData.inspection = {
      id: 'centrifugal-pump',
      name: 'Single-Stage Volute Centrifugal Pump (Exp 6)',
      category: 'machine',
      description: 'Centrifugal pump test rig with vacuum suction gauge, Bourdon delivery gauge, and wattmeter measurement.',
      specifications: { 'Motor Rating': '3.0 kW (4.0 HP)', 'Rated Speed': '2800 RPM', Impeller: 'Backward-Curved Shrouded', 'Suction/Delivery Bore': '50 mm / 40 mm' },
    };
    installGroup.add(cpGroup);

    // ==========================================
    // B. RECIPROCATING PUMP UNIT (RIGHT)
    // ==========================================
    const rpGroup = new THREE.Group();
    rpGroup.position.set(0.85, 0.25, 0);

    // Cylinder Body
    const cylGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 16);
    cylGeo.rotateZ(Math.PI / 2);
    const cylMesh = new THREE.Mesh(cylGeo, this.castIronMaterial);
    cylMesh.position.set(0, 0.35, 0);
    rpGroup.add(cylMesh);

    // Piston
    const pistonGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16);
    pistonGeo.rotateZ(Math.PI / 2);
    this.reciprocatingPistonMesh = new THREE.Mesh(pistonGeo, this.steelMaterial);
    this.reciprocatingPistonMesh.position.set(0, 0.35, 0);
    rpGroup.add(this.reciprocatingPistonMesh);

    // Crank Flywheel & Mechanism
    this.reciprocatingCrankMesh = new THREE.Group();
    this.reciprocatingCrankMesh.position.set(0.45, 0.35, 0);

    const flywheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.03, 24);
    flywheelGeo.rotateX(Math.PI / 2);
    const flywheel = new THREE.Mesh(flywheelGeo, this.castIronMaterial);
    this.reciprocatingCrankMesh.add(flywheel);

    const crankPinGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.06, 12);
    const crankPin = new THREE.Mesh(crankPinGeo, this.brassMaterial);
    crankPin.position.set(0.1, 0, 0.03);
    this.reciprocatingCrankMesh.add(crankPin);
    rpGroup.add(this.reciprocatingCrankMesh);

    // Suction & Delivery Air Vessels (Hemispherical Cap Cylinders)
    const vesselGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 16);
    const airVesselD = new THREE.Mesh(vesselGeo, this.castIronMaterial);
    airVesselD.position.set(-0.15, 0.65, 0);
    rpGroup.add(airVesselD);

    const airVesselS = new THREE.Mesh(vesselGeo, this.castIronMaterial);
    airVesselS.position.set(0.15, 0.65, 0);
    rpGroup.add(airVesselS);

    rpGroup.userData.inspection = {
      id: 'reciprocating-pump',
      name: 'Double-Acting Reciprocating Pump with Air Vessels (Exp 7)',
      category: 'machine',
      description: 'Positive displacement piston pump equipped with suction and delivery air vessels to smooth cyclic acceleration head.',
      specifications: { 'Bore Diameter D': '75 mm', 'Stroke Length L': '150 mm', 'Air Vessels': 'Suction & Delivery fitted', 'Theoretical Q': '2.0 L/s at 180 RPM' },
    };
    installGroup.add(rpGroup);

    this.scene.add(installGroup);
  }

  protected updatePhysics(delta: number): void {
    const isCentrifugal = Number(this.state.parameters.activePump ?? 0) === 0;
    const rpm = Number(this.state.parameters.speedRpm || 2800);

    if (isCentrifugal && this.centrifugalImpellerMesh) {
      // Rotate centrifugal impeller at speed proportional to N
      this.centrifugalImpellerMesh.rotation.x += delta * (rpm / 60) * Math.PI * 0.4;
    } else if (!isCentrifugal && this.reciprocatingCrankMesh && this.reciprocatingPistonMesh) {
      // Reciprocating crank rotation & linear piston stroke
      const crankAngle = this.state.currentTime * 4.0;
      this.reciprocatingCrankMesh.rotation.z = crankAngle;
      // Linear simple harmonic motion of piston: x = r * cos(theta)
      this.reciprocatingPistonMesh.position.x = 0.08 * Math.cos(crankAngle);
    }
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const isCentrifugal = Number(this.state.parameters.activePump ?? 0) === 0;
    const speed = Number(this.state.parameters.speedRpm || 2800);
    const valve = Number(this.state.parameters.deliveryValveOpeningPercent || 75);
    const Q = Number(this.state.parameters.flowRateLps || 4.5);

    if (isCentrifugal) {
      const res = FluidMachineryCalculator.calculateCentrifugalPump(Q, speed, valve);

      // Deflect delivery pressure needle
      if (this.deliveryPressureNeedle) {
        const needleAngle = (res.totalManometricHead / 45) * Math.PI * 1.5;
        this.deliveryPressureNeedle.rotation.z = -needleAngle;
      }

      this.state.metrics = {
        'Pump Type': 'Centrifugal (Exp 6)',
        'Speed (N)': `${res.speedRpm} RPM`,
        'Discharge (Q)': `${res.flowRateLps.toFixed(2)} L/s`,
        'Suction Vacuum': `${res.suctionHead.toFixed(2)} m of water`,
        'Delivery Head': `${res.deliveryHead.toFixed(2)} m of water`,
        'Total Manometric Head (Hm)': `${res.totalManometricHead.toFixed(2)} m`,
        'Hydraulic Power (Ph)': `${res.hydraulicPowerKW.toFixed(3)} kW`,
        'Input Power (Pin)': `${res.inputPowerKW.toFixed(3)} kW`,
        'Overall Efficiency (ηo)': `${res.overallEfficiencyPercent.toFixed(2)}%`,
        'Specific Speed (Ns)': `${res.specificSpeed.toFixed(1)} rpm`,
        Status: res.operatingPointStatus,
      };
    } else {
      // Reciprocating pump
      const res = FluidMachineryCalculator.calculateReciprocatingPump(75, 150, 180, 3.0, 15.0, true);

      this.state.metrics = {
        'Pump Type': 'Reciprocating (Exp 7)',
        'Bore × Stroke': '75 mm × 150 mm',
        'Speed (N)': `${res.speedRpm} RPM`,
        'Theoretical Flow (Qth)': `${res.theoreticalDischargeLps.toFixed(3)} L/s`,
        'Actual Flow (Qact)': `${res.actualDischargeLps.toFixed(3)} L/s`,
        'Percentage Slip (s%)': `${res.slipPercent.toFixed(2)}%`,
        'Discharge Coeff (Cd)': `${res.coefficientOfDischarge.toFixed(4)}`,
        'Indicated Power': `${(res.indicatedPowerWatts / 1000).toFixed(3)} kW`,
        'Brake Power': `${(res.brakePowerWatts / 1000).toFixed(3)} kW`,
        'Mechanical Efficiency': `${res.mechanicalEfficiencyPercent.toFixed(2)}%`,
        'Air Vessels': 'Fitted (Acceleration Head Minimized)',
      };
    }

    this.notify();
  }
}
