/**
 * 3D Simulation Scene: Gas Power Cycles (Otto, Diesel, Dual, Brayton) (Unit V)
 * Features:
 * - 4-Stroke Engine Cutaway with reciprocating Piston, Connecting Rod, and Crankshaft
 * - Intake and Exhaust poppet valves opening and closing with camshaft timing
 * - Spark Plug / Fuel Injector firing flash during power stroke
 * - Gas turbine combustor and turbine mode for Brayton cycle
 */

import * as THREE from 'three';
import { BaseThermoSimulation } from '../../core/BaseThermoSimulation';
import type { GasCycleType } from '../../core/types';

export class GasPowerCyclesScene extends BaseThermoSimulation {
  private currentCycle: GasCycleType = 'otto';
  private compressionRatio = 8.5;
  private engineRpm = 1200;

  // Mechanical Components
  private engineBlockMesh!: THREE.Mesh;
  private cylinderLinerMesh!: THREE.Mesh;
  private pistonMesh!: THREE.Mesh;
  private connectingRodMesh!: THREE.Mesh;
  private crankshaftGroup!: THREE.Group;
  private flywheelMesh!: THREE.Mesh;
  private intakeValveMesh!: THREE.Mesh;
  private exhaustValveMesh!: THREE.Mesh;
  private combustionFlashLight!: THREE.PointLight;
  private combustionMesh!: THREE.Mesh;

  // Kinematic parameters
  private crankAngle = 0; // radians
  private strokeLength = 3.6; // BDC to TDC
  private rodLength = 5.2;

  public buildScene(): void {
    const group = new THREE.Group();
    group.name = 'GasPowerEngineGroup';

    // 1. Transparent Glass Cylinder Liner
    const cylRadius = 2.4;
    const cylHeight = 7.5;
    const cylGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 32, 1, true);
    const cylMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    this.cylinderLinerMesh = new THREE.Mesh(cylGeo, cylMat);
    this.cylinderLinerMesh.position.set(0, 6.5, 0);
    group.add(this.cylinderLinerMesh);

    // Engine Block Half-Shell
    const blockGeo = new THREE.BoxGeometry(7, 12, 7);
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.4,
      wireframe: true,
    });
    this.engineBlockMesh = new THREE.Mesh(blockGeo, blockMat);
    this.engineBlockMesh.position.set(0, 5, 0);
    group.add(this.engineBlockMesh);

    // 2. Piston Head
    const pistonGeo = new THREE.CylinderGeometry(cylRadius - 0.05, cylRadius - 0.05, 1.4, 32);
    const pistonMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.85,
      roughness: 0.2,
    });
    this.pistonMesh = new THREE.Mesh(pistonGeo, pistonMat);
    this.pistonMesh.position.set(0, 6.5, 0);
    group.add(this.pistonMesh);

    // Piston rings
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.TorusGeometry(cylRadius - 0.02, 0.04, 8, 32);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.4 - r * 0.25, 0);
      this.pistonMesh.add(ring);
    }

    // 3. Connecting Rod
    const rodGeo = new THREE.BoxGeometry(0.35, this.rodLength, 0.5);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    this.connectingRodMesh = new THREE.Mesh(rodGeo, rodMat);
    this.connectingRodMesh.position.set(0, 4, 0);
    group.add(this.connectingRodMesh);

    // 4. Crankshaft Assembly
    this.crankshaftGroup = new THREE.Group();
    this.crankshaftGroup.position.set(0, 1.5, 0); // Crank center

    const crankWebGeo = new THREE.BoxGeometry(1.2, 2.0, 0.4);
    const crankWeb = new THREE.Mesh(crankWebGeo, rodMat);
    crankWeb.position.set(0, 0.8, 0);
    this.crankshaftGroup.add(crankWeb);

    // Flywheel
    const flyGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.6, 32);
    const flyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    this.flywheelMesh = new THREE.Mesh(flyGeo, flyMat);
    this.flywheelMesh.rotation.x = Math.PI / 2;
    this.flywheelMesh.position.set(0, 0, -2.5);
    this.crankshaftGroup.add(this.flywheelMesh);

    group.add(this.crankshaftGroup);

    // 5. Overhead Valves & Cylinder Head
    const valveGeo = new THREE.CylinderGeometry(0.5, 0.1, 2.2, 16);
    const valveMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

    this.intakeValveMesh = new THREE.Mesh(valveGeo, valveMat);
    this.intakeValveMesh.position.set(-1.1, 10.2, 0);
    group.add(this.intakeValveMesh);

    this.exhaustValveMesh = new THREE.Mesh(valveGeo, valveMat);
    this.exhaustValveMesh.position.set(1.1, 10.2, 0);
    group.add(this.exhaustValveMesh);

    // 6. Spark Plug / Fuel Injector Combustion Flash
    const combGeo = new THREE.SphereGeometry(1.8, 16, 16);
    const combMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0,
    });
    this.combustionMesh = new THREE.Mesh(combGeo, combMat);
    this.combustionMesh.position.set(0, 9.2, 0);
    group.add(this.combustionMesh);

    this.combustionFlashLight = new THREE.PointLight(0xff6600, 0, 10);
    this.combustionFlashLight.position.set(0, 9.2, 0);
    group.add(this.combustionFlashLight);

    this.scene.add(group);
    this.resetCamera(13, 8, 16);
  }

  public updateAnimation(delta: number, _elapsedTime: number): void {
    // Crankshaft angular velocity
    const radPerSec = (this.engineRpm * 2 * Math.PI) / 60;
    this.crankAngle = (this.crankAngle + radPerSec * delta * 0.15) % (Math.PI * 4); // 720 degrees 4-stroke cycle

    // Crank throw radius
    const crankRadius = this.strokeLength / 2;
    const crankY = 1.5;

    // Crank pin coordinates
    const pinX = crankRadius * Math.sin(this.crankAngle);
    const pinY = crankY + crankRadius * Math.cos(this.crankAngle);

    // Piston kinematics: y_p = r*cos(theta) + sqrt(l^2 - (r*sin(theta))^2)
    const sinAngle = Math.sin(this.crankAngle);
    const pistonY = crankY + crankRadius * Math.cos(this.crankAngle) + Math.sqrt(this.rodLength * this.rodLength - (crankRadius * sinAngle) * (crankRadius * sinAngle));

    this.pistonMesh.position.y = pistonY;

    // Update connecting rod position and rotation
    this.connectingRodMesh.position.set(pinX / 2, (pistonY + pinY) / 2, 0);
    const rodAngle = Math.atan2(pinX, pistonY - pinY);
    this.connectingRodMesh.rotation.z = -rodAngle;

    // Rotate crankshaft and flywheel
    this.crankshaftGroup.rotation.z = -this.crankAngle;

    // 4-Stroke Cycle Events (0 to 4*PI radians):
    // 0 to PI: Suction Stroke (Intake open)
    // PI to 2*PI: Compression Stroke (Both closed)
    // 2*PI to 3*PI: Expansion / Power Stroke (Spark fires at 2*PI, power expansion)
    // 3*PI to 4*PI: Exhaust Stroke (Exhaust open)
    const cyclePhase = this.crankAngle;

    // Intake valve lifts during suction
    if (cyclePhase < Math.PI) {
      this.intakeValveMesh.position.y = 10.2 - 0.4 * Math.sin(cyclePhase);
    } else {
      this.intakeValveMesh.position.y = 10.2;
    }

    // Exhaust valve lifts during exhaust
    if (cyclePhase > Math.PI * 3) {
      this.exhaustValveMesh.position.y = 10.2 - 0.4 * Math.sin(cyclePhase - Math.PI * 3);
    } else {
      this.exhaustValveMesh.position.y = 10.2;
    }

    // Combustion flash at top of compression stroke (around 2*PI)
    const flashWindow = Math.abs(cyclePhase - Math.PI * 2);
    if (flashWindow < 0.3) {
      const intensity = 1.0 - flashWindow / 0.3;
      this.combustionFlashLight.intensity = intensity * 4.0;
      (this.combustionMesh.material as THREE.MeshBasicMaterial).opacity = intensity * 0.8;
      this.combustionMesh.scale.set(1 + intensity * 0.5, 1 + intensity * 0.5, 1 + intensity * 0.5);
    } else {
      this.combustionFlashLight.intensity = 0;
      (this.combustionMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  }

  public updateParameters(params: {
    cycleType?: GasCycleType;
    compressionRatio?: number;
    rpm?: number;
  }): void {
    if (params.cycleType) {
      this.currentCycle = params.cycleType;
    }
    if (params.compressionRatio !== undefined) {
      this.compressionRatio = params.compressionRatio;
    }
    if (params.rpm !== undefined) {
      this.engineRpm = params.rpm;
    }
  }
}
