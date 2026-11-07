import * as THREE from 'three';
import { BaseHydraulicSimulation, type IApparatusComponent } from '../../core/BaseHydraulicSimulation';
import type { IPipeFrictionInputs, IPipeFrictionOutputs } from '../../core/types';
import { HydraulicCalculator } from '../../core/HydraulicCalculator';

export class PipeFrictionScene extends BaseHydraulicSimulation {
  private mercuryLeftMesh!: THREE.Mesh;
  private mercuryRightMesh!: THREE.Mesh;
  private valveWheel!: THREE.Mesh;
  private currentInputs: IPipeFrictionInputs;
  private currentOutputs: IPipeFrictionOutputs;

  constructor(
    container: HTMLElement,
    initialInputs: IPipeFrictionInputs,
    onComponentSelected?: (comp: IApparatusComponent | null) => void
  ) {
    super(container, onComponentSelected);
    this.currentInputs = initialInputs;
    this.currentOutputs = HydraulicCalculator.calculatePipeLosses(initialInputs);

    this.buildApparatus();
    this.applyState(initialInputs);
  }

  private buildApparatus(): void {
    const apparatusRoot = new THREE.Group();
    apparatusRoot.position.set(0, 0.6, 0);

    // 1. Dual Parallel Pipe Network
    // Upper Pipe: Smooth Drawn Brass (D=25mm)
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.25,
    });
    const brassGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.8, 32);
    const brassPipe = new THREE.Mesh(brassGeo, brassMat);
    brassPipe.rotation.z = Math.PI / 2;
    brassPipe.position.set(0, 0.28, 0.15);
    brassPipe.castShadow = true;
    apparatusRoot.add(brassPipe);

    this.registerComponent(
      'brass_pipe',
      'Smooth Drawn Brass Pipe Test Section',
      brassPipe,
      'Hydraulically smooth drawn brass pipe (D = 25mm, ε = 0.0015mm) used to measure laminar and smooth turbulent friction factors obeying the Blasius formula.',
      'Diameter: 25 mm | Absolute Roughness ε: 0.0015 mm | Length: 2.0 m',
      'h_f = f · (L/D) · (v² / 2g)'
    );

    // Lower Pipe: Commercial Steel (D=32mm)
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.75,
      roughness: 0.45,
    });
    const steelGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.8, 32);
    const steelPipe = new THREE.Mesh(steelGeo, steelMat);
    steelPipe.rotation.z = Math.PI / 2;
    steelPipe.position.set(0, 0.12, -0.15);
    steelPipe.castShadow = true;
    apparatusRoot.add(steelPipe);

    this.registerComponent(
      'steel_pipe',
      'Commercial Steel Pipe Section',
      steelPipe,
      'Commercial carbon steel pipe (D = 32mm, ε = 0.045mm) demonstrating transitional and rough turbulent boundary friction governed by the Colebrook-White equation.',
      'Diameter: 32 mm | Absolute Roughness ε: 0.045 mm | Length: 2.0 m',
      '1/√f = -2 · log₁₀( (ε/D)/3.7 + 2.51/(Re√f) )'
    );

    // 2. Centrifugal Supply Pump
    const pumpGroup = new THREE.Group();
    const pumpVoluteGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 24);
    const pumpVoluteMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.4 });
    const pumpVolute = new THREE.Mesh(pumpVoluteGeo, pumpVoluteMat);
    pumpVolute.rotation.x = Math.PI / 2;
    pumpGroup.add(pumpVolute);

    const motorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 24);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.z = -0.12;
    pumpGroup.add(motor);

    pumpGroup.position.set(-0.95, 0.2, 0);
    apparatusRoot.add(pumpGroup);

    this.registerComponent(
      'supply_pump',
      'Variable-Speed Circulating Water Pump',
      pumpGroup,
      'Centrifugal laboratory pump supplying steady discharge across Reynolds regimes from laminar through high turbulent numbers.',
      'Power: 0.75 kW | Head: 15 m max | Flow: 0.1 to 8.0 L/s'
    );

    // 3. Control Valve with Handwheel
    const valveGroup = new THREE.Group();
    const valveBodyGeo = new THREE.BoxGeometry(0.06, 0.08, 0.06);
    const valveBodyMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.6 });
    const valveBody = new THREE.Mesh(valveBodyGeo, valveBodyMat);
    valveGroup.add(valveBody);

    const wheelGeo = new THREE.TorusGeometry(0.035, 0.008, 12, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5 });
    this.valveWheel = new THREE.Mesh(wheelGeo, wheelMat);
    this.valveWheel.rotation.x = Math.PI / 2;
    this.valveWheel.position.y = 0.06;
    valveGroup.add(this.valveWheel);

    valveGroup.position.set(0.65, 0.28, 0.15);
    apparatusRoot.add(valveGroup);

    this.registerComponent(
      'control_valve',
      'Regulating Gate Valve',
      valveGroup,
      'Throttle valve for adjusting discharge and investigating minor local head loss h_m = k · v²/(2g) as the opening changes from 1 to 4 turns.',
      'Loss Coefficient k: 0.15 (full open) to 18.0 (nearly closed)'
    );

    // 4. Differential Mercury U-Tube Manometer
    const manometerGroup = new THREE.Group();
    manometerGroup.position.set(0, 0.45, -0.4);

    // Backboard with graduation scale
    const boardGeo = new THREE.BoxGeometry(0.24, 0.6, 0.015);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    manometerGroup.add(board);

    // Glass U-tube
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      transparent: true,
      roughness: 0.05,
    });
    // Left vertical glass leg
    const legGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.45, 16);
    const leftLeg = new THREE.Mesh(legGeo, tubeMat);
    leftLeg.position.set(-0.04, 0, 0.015);
    manometerGroup.add(leftLeg);

    // Right vertical glass leg
    const rightLeg = new THREE.Mesh(legGeo, tubeMat);
    rightLeg.position.set(0.04, 0, 0.015);
    manometerGroup.add(rightLeg);

    // Mercury fluid columns (silver-metallic)
    const hgMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
    const hgGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.2, 16);

    this.mercuryLeftMesh = new THREE.Mesh(hgGeo, hgMat);
    this.mercuryLeftMesh.position.set(-0.04, -0.05, 0.015);
    manometerGroup.add(this.mercuryLeftMesh);

    this.mercuryRightMesh = new THREE.Mesh(hgGeo, hgMat);
    this.mercuryRightMesh.position.set(0.04, -0.05, 0.015);
    manometerGroup.add(this.mercuryRightMesh);

    apparatusRoot.add(manometerGroup);
    this.registerComponent(
      'differential_manometer',
      'Inverted U-Tube Differential Manometer',
      manometerGroup,
      'High-precision differential manometer measuring head difference h_f between pressure tapping stations across the pipe length L.',
      'Fluid: Mercury (Sp. Gr. 13.6) | Deflection: h_f = y_m · (S_m - S_w)',
      'h_f = f · (L/D) · (v² / 2g)'
    );

    this.scene.add(apparatusRoot);
  }

  public applyState(inputs: IPipeFrictionInputs): void {
    this.currentInputs = inputs;
    this.currentOutputs = HydraulicCalculator.calculatePipeLosses(inputs);

    // Update Mercury column deflection Δy = h_f / (13.6 - 1) = h_f / 12.6
    const totalLossM = this.currentOutputs.totalHeadLossM;
    const hgDeflectionM = Math.min(0.18, Math.max(0.01, totalLossM / 12.6));

    // Left leg pushes down, right leg rises
    this.mercuryLeftMesh.position.y = -0.05 - hgDeflectionM / 2;
    this.mercuryLeftMesh.scale.y = 1 + hgDeflectionM * 2;

    this.mercuryRightMesh.position.y = -0.05 + hgDeflectionM / 2;
    this.mercuryRightMesh.scale.y = 1 - hgDeflectionM * 2;

    // Rotate valve wheel according to turns open
    const turns = inputs.minorLossFittings.gateValveTurnsOpen;
    this.valveWheel.rotation.z = turns * (Math.PI / 2);
  }

  protected update(dt: number): void {
    // Idle loop
  }

  public getOutputs(): IPipeFrictionOutputs {
    return this.currentOutputs;
  }
}
