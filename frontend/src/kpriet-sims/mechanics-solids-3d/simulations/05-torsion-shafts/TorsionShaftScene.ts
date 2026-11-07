/**
 * Module 5: Torsion of Circular Shafts (Solid & Hollow)
 * Official Syllabus: Unit IV & Lab Exp 3 & Lab Exp 10 (Torsion test on mild steel rod, Torsion simulation)
 * Formula: T/J = tau/r = G*theta/L
 */

import * as THREE from 'three';
import { BaseSolidMechanicsSimulation } from '../../core/BaseSolidMechanicsSimulation';
import { SolidMechanicsCalculator } from '../../core/SolidMechanicsCalculator';
import type { MaterialType } from '../../core/types';

export class TorsionShaftScene extends BaseSolidMechanicsSimulation {
  private shaftMesh!: THREE.Mesh;
  private torqueChuck!: THREE.Mesh;
  private protractorDial!: THREE.Group;
  private dialNeedle!: THREE.Mesh;
  private torqueRingArrow!: THREE.Group;

  protected async setupSimulationObjects(): Promise<void> {
    this.stages = [
      {
        name: 'Isometric Overall',
        cameraPosition: [2.0, 1.4, 2.2],
        cameraTarget: [0, 0.7, 0],
        description: 'Torsion testing machine assembly with driving chuck, specimen shaft, and angle protractor.',
      },
      {
        name: 'Protractor & Torque Meter',
        cameraPosition: [1.2, 0.9, 0.8],
        cameraTarget: [0.8, 0.7, 0],
        description: 'Digital protractor measuring angle of twist θ in degrees and torque sensor telemetry.',
      },
      {
        name: 'Shaft Section Profile',
        cameraPosition: [0, 1.2, 0.9],
        cameraTarget: [0, 0.7, 0],
        description: 'Radial shear stress distribution: Zero at center axis, maximum τ_max at outer perimeter radius.',
      },
    ];

    const torsionRig = new THREE.Group();

    // 1. Heavy Machine Bed
    const bedGeo = new THREE.BoxGeometry(2.4, 0.16, 0.5);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, 0.35, 0);
    torsionRig.add(bed);

    // 2. Fixed Left Headstock / Clamp
    const headstockGeo = new THREE.BoxGeometry(0.3, 0.45, 0.4);
    const headstock = new THREE.Mesh(headstockGeo, this.darkSteelMaterial);
    headstock.position.set(-0.85, 0.65, 0);
    headstock.userData.inspection = {
      id: 'fixed-headstock',
      name: 'Fixed Reaction Headstock Chuck',
      category: 'fixture',
      description: 'Heavy duty splined chuck rigidly restraining the left end against rotational twist (θ = 0).',
      specifications: { Restraint: 'Torsional Fixity (θ = 0 rad)', TorqueCapacity: '5000 N·m' },
    };
    torsionRig.add(headstock);
    this.registerInspectable(headstock);

    // 3. Test Shaft (Solid or Hollow Cylinder)
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    this.shaftMesh = new THREE.Mesh(shaftGeo, this.steelMaterial);
    this.shaftMesh.position.set(0, 0.7, 0);
    this.shaftMesh.userData.inspection = {
      id: 'torsion-shaft-specimen',
      name: 'Circular Torsion Shaft Specimen',
      category: 'structural',
      description: 'Solid or hollow circular cylindrical shaft transmitting torque with linear radial shear stress distribution.',
      specifications: { 'Torsion Formula': 'T / J = τ / r = G · θ / L', PolarInertia: 'J = π·(D⁴ - d⁴) / 32' },
    };
    torsionRig.add(this.shaftMesh);
    this.registerInspectable(this.shaftMesh);

    // 4. Rotating Tailstock Chuck
    const chuckGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.16, 24);
    chuckGeo.rotateZ(Math.PI / 2);
    this.torqueChuck = new THREE.Mesh(chuckGeo, this.steelMaterial);
    this.torqueChuck.position.set(0.8, 0.7, 0);
    this.torqueChuck.userData.inspection = {
      id: 'driving-chuck',
      name: 'Torque Actuator & Driving Chuck',
      category: 'loading',
      description: 'Worm-gear motor or manual handwheel applying pure torsional twisting moment T without axial forces.',
      specifications: { 'Torque Range': '0 - 2000 N·m', 'Angular Resolution': '0.01 Degree' },
    };
    torsionRig.add(this.torqueChuck);
    this.registerInspectable(this.torqueChuck);

    // 5. Angular Twist Protractor Dial
    this.protractorDial = new THREE.Group();
    const dialRing = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.18, 32),
      new THREE.MeshStandardMaterial({ color: 0x10b981, side: THREE.DoubleSide })
    );
    dialRing.rotation.y = Math.PI / 2;

    const needleGeo = new THREE.BoxGeometry(0.006, 0.16, 0.004);
    needleGeo.translate(0, 0.08, 0);
    this.dialNeedle = new THREE.Mesh(needleGeo, this.redMarkerMaterial);
    this.dialNeedle.position.set(0.01, 0, 0);

    this.protractorDial.add(dialRing, this.dialNeedle);
    this.protractorDial.position.set(0.9, 0.7, 0);
    this.protractorDial.userData.inspection = {
      id: 'angular-protractor',
      name: 'Circular Angle of Twist Protractor',
      category: 'instrumentation',
      description: 'Precision circular graduated vernier scale indicating torsional angular deformation θ in degrees.',
      specifications: { Range: '0 - 360 Degrees', 'Vernier Precision': '0.1°' },
    };
    torsionRig.add(this.protractorDial);
    this.registerInspectable(this.protractorDial);

    // 6. Ring Arrow indicating Torque Direction
    this.torqueRingArrow = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(0.15, 0.015, 8, 24, Math.PI * 1.5);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.y = Math.PI / 2;

    const coneHead = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 12), ringMat);
    coneHead.position.set(0, 0.15, 0);
    coneHead.rotation.x = Math.PI / 2;

    this.torqueRingArrow.add(ringMesh, coneHead);
    this.torqueRingArrow.position.set(0.8, 0.7, 0);
    torsionRig.add(this.torqueRingArrow);

    this.scene.add(torsionRig);

    // Default Parameters
    this.state.parameters = {
      appliedTorqueNm: 800,
      shaftLengthM: 1.2,
      outerDiameterMm: 50,
      isHollow: false,
      innerDiameterMm: 30,
      materialKey: 'mild-steel',
      deformationScale: 20,
    };

    this.updateCalculations();
  }

  protected updatePhysics(delta: number): void {
    if (this.torqueRingArrow) {
      this.torqueRingArrow.rotation.x += delta * 1.2;
    }
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const T = Number(this.state.parameters.appliedTorqueNm || 800);
    const L = Number(this.state.parameters.shaftLengthM || 1.2);
    const D = Number(this.state.parameters.outerDiameterMm || 50);
    const isHollow = Boolean(this.state.parameters.isHollow);
    const d = Number(this.state.parameters.innerDiameterMm || 30);
    const matKey = (this.state.parameters.materialKey as MaterialType) || 'mild-steel';
    const scale = Number(this.state.parameters.deformationScale || 20);

    const res = SolidMechanicsCalculator.calculateTorsionShaft(T, L, D, isHollow, d, matKey);

    // Rotate Driving Chuck and Dial Needle by magnified twist angle
    const visualTwistRad = res.angleOfTwistRad * scale;
    this.torqueChuck.rotation.x = visualTwistRad;
    this.dialNeedle.rotation.x = visualTwistRad;

    // Change shaft color if hollow
    (this.shaftMesh.material as THREE.MeshStandardMaterial).color.set(isHollow ? 0x38bdf8 : 0x94a3b8);

    this.state.metrics = {
      'Applied Torque (T)': `${res.appliedTorqueNm.toFixed(1)} N·m`,
      'Shaft Configuration': isHollow ? `Hollow (D=${D} mm, d=${d} mm)` : `Solid (D=${D} mm)`,
      'Polar Inertia (J)': `${(res.polarSecondMomentMm4 / 1e3).toFixed(1)} × 10³ mm⁴`,
      'Polar Modulus (Z_p)': `${res.polarSectionModulusMm3.toFixed(1)} mm³`,
      'Max Shear Stress (τ)': `${res.maxShearStressMPa.toFixed(1)} MPa (at outer radius)`,
      'Angle of Twist (θ)': `${res.angleOfTwistDeg.toFixed(2)}° (${(res.angleOfTwistRad * 1000).toFixed(1)} mrad)`,
      'Torsional Stiffness': `${(res.torsionalStiffnessNmPerRad / 1000).toFixed(1)} kN·m/rad`,
      'Weight Savings': res.weightSavingsPercentage ? `${res.weightSavingsPercentage.toFixed(1)}% vs Solid` : 'Solid Reference',
    };

    this.notify();
  }
}
