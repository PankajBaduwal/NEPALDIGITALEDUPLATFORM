/**
 * Module 6: Environmental Water & Wastewater Quality Laboratory
 * U25CE403 / U25CE411 — Water Supply and Wastewater Engineering
 * 3D Apparatus: 6-Paddle Jar Test, Nephelometer, BOD Incubation Bottles & COD Reflux Condenser
 */

import * as THREE from 'three';
import { BaseWaterSimulation, type IBaseWaterSimulationOptions } from '../../core/BaseWaterSimulation';
import type { IWaterQualityLabState } from '../../core/types';
import { EnvironmentalCalculator } from '../../core/EnvironmentalCalculator';

export class WaterQualityLabScene extends BaseWaterSimulation {
  private labBenchGroup: THREE.Group;
  private jarTestPaddles: THREE.Mesh[] = [];
  private isTesting = false;
  private currentTest = 'jar-test';

  constructor(options: IBaseWaterSimulationOptions) {
    super(options);
    this.labBenchGroup = new THREE.Group();
    this.waterLabGroup.add(this.labBenchGroup);

    this.defaultCameraPos.set(0, 3.5, 5.5);
    this.defaultTarget.set(0, 1.2, 0);
    this.resetCamera();

    this.buildLaboratoryStations();
  }

  private buildLaboratoryStations(): void {
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }); // Lab slate bench
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.15 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
      transmission: 0.9,
      roughness: 0.1,
    });
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
    });

    // Main Laboratory Granite Benchtop
    const benchGeo = new THREE.BoxGeometry(7.0, 0.15, 2.2);
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.8, 0);
    bench.receiveShadow = true;
    this.labBenchGroup.add(bench);

    // Bench legs
    const legGeo = new THREE.BoxGeometry(0.12, 0.8, 2.0);
    const leg1 = new THREE.Mesh(legGeo, metalMat);
    leg1.position.set(-3.2, 0.4, 0);
    const leg2 = new THREE.Mesh(legGeo, metalMat);
    leg2.position.set(3.2, 0.4, 0);
    this.labBenchGroup.add(leg1);
    this.labBenchGroup.add(leg2);

    // ─────────────────────────────────────────────────────────────
    // Station 1: 6-Paddle Jar Test Apparatus (X: -2.0)
    // ─────────────────────────────────────────────────────────────
    const jarGroup = new THREE.Group();
    jarGroup.position.set(-1.8, 0.875, 0);

    // Motor housing top rail
    const railGeo = new THREE.BoxGeometry(2.6, 0.35, 0.45);
    const rail = new THREE.Mesh(railGeo, metalMat);
    rail.position.set(0, 1.4, 0);
    jarGroup.add(rail);

    // 4 Beakers (1000 mL glass beakers with paddles)
    this.jarTestPaddles = [];
    const beakerX = [-0.9, -0.3, 0.3, 0.9];
    beakerX.forEach((x, idx) => {
      // Glass beaker
      const beakerGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 24, 1, true);
      const beaker = new THREE.Mesh(beakerGeo, glassMat);
      beaker.position.set(x, 0.325, 0);
      jarGroup.add(beaker);

      // Water sample inside beaker
      const waterGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.55, 24);
      const water = new THREE.Mesh(waterGeo, liquidMat);
      water.position.set(x, 0.275, 0);
      jarGroup.add(water);

      // Stirrer shaft and paddle blade
      const shaftGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.9, 12);
      const shaft = new THREE.Mesh(shaftGeo, metalMat);
      shaft.position.set(x, 0.85, 0);
      jarGroup.add(shaft);

      const bladeGeo = new THREE.BoxGeometry(0.35, 0.1, 0.02);
      const blade = new THREE.Mesh(bladeGeo, metalMat);
      blade.position.set(x, 0.25, 0);
      jarGroup.add(blade);
      this.jarTestPaddles.push(blade);
    });

    this.labBenchGroup.add(jarGroup);

    this.registerInteractive(jarGroup, {
      id: 'jar-test-apparatus',
      name: 'Standard 6-Paddle Jar Test Apparatus (IS: 3025 Part 50)',
      category: 'Coagulation Optimization',
      description: 'Determines optimum coagulant alum dosage for raw water. Evaluates rapid mixing at 100 RPM for 1 min, slow flocculation at 30 RPM for 20 min, and quiescent settling for 30 min.',
      specReference: 'IS: 3025 (Part 50)-2001',
      dimensions: '4 × 1000 mL Beakers, Variable Speed: 20 to 150 RPM',
      formula: 'Optimum Dose = Min Alum yielding residual turbidity ≤ 1 NTU',
    });

    // ─────────────────────────────────────────────────────────────
    // Station 2: BOD Incubation Bottles & Titration Burette (X: 0.8)
    // ─────────────────────────────────────────────────────────────
    const bodGroup = new THREE.Group();
    bodGroup.position.set(0.6, 0.875, 0);

    // Titration Retort Stand & Burette (50 mL)
    const standBaseGeo = new THREE.BoxGeometry(0.4, 0.04, 0.3);
    const standBase = new THREE.Mesh(standBaseGeo, metalMat);
    standBase.position.set(-0.3, 0.02, 0);
    bodGroup.add(standBase);

    const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.2, 12);
    const rod = new THREE.Mesh(rodGeo, metalMat);
    rod.position.set(-0.4, 0.6, 0);
    bodGroup.add(rod);

    const buretteGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 16);
    const burette = new THREE.Mesh(buretteGeo, glassMat);
    burette.position.set(-0.3, 0.7, 0);
    bodGroup.add(burette);

    // 2 BOD Bottles (300 mL glass-stoppered)
    const bodGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 20);
    const b1 = new THREE.Mesh(bodGeo, glassMat);
    b1.position.set(0.1, 0.175, 0);
    bodGroup.add(b1);

    const b2 = new THREE.Mesh(bodGeo, glassMat);
    b2.position.set(0.4, 0.175, 0);
    bodGroup.add(b2);

    this.labBenchGroup.add(bodGroup);

    this.registerInteractive(bodGroup, {
      id: 'bod-station',
      name: 'BOD Incubation Bottles & Winkler Titration Station',
      category: 'Organic Load Testing',
      description: 'Measures 5-day Biochemical Oxygen Demand at 20°C per IS: 3025 Part 44. Initial DO (D1) and 5-day incubated DO (D2) determined by Azide modification of Winkler method.',
      specReference: 'IS: 3025 (Part 44)-1993',
      dimensions: '300 mL Glass Stoppered Bottles, 20.0 ± 1.0°C BOD Incubator',
      formula: 'BOD₅ = (D₁ - D₂) / P (mg/L)',
    });

    // ─────────────────────────────────────────────────────────────
    // Station 3: Digital Turbidimeter & pH Meter (X: 2.3)
    // ─────────────────────────────────────────────────────────────
    const meterGroup = new THREE.Group();
    meterGroup.position.set(2.3, 0.875, 0);

    // Digital meter chassis
    const chassisGeo = new THREE.BoxGeometry(0.7, 0.25, 0.6);
    const meterChassis = new THREE.Mesh(chassisGeo, metalMat);
    meterChassis.position.y = 0.125;
    meterGroup.add(meterChassis);

    // Digital LED display screen
    const screenGeo = new THREE.PlaneGeometry(0.35, 0.15);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Glowing green digital LED
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.rotation.x = -Math.PI / 4;
    screen.position.set(0, 0.22, 0.1);
    meterGroup.add(screen);

    // Glass Cuvette cell holder
    const cuvetteGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.18, 16);
    const cuvette = new THREE.Mesh(cuvetteGeo, glassMat);
    cuvette.position.set(0.2, 0.25, -0.1);
    meterGroup.add(cuvette);

    this.labBenchGroup.add(meterGroup);

    this.registerInteractive(meterGroup, {
      id: 'nephelometer-station',
      name: 'Digital Nephelometric Turbidimeter & pH Analyzer',
      category: 'Physical Parameter Testing',
      description: 'Measures scattered light at 90° to incident light beam in NTU (Nephelometric Turbidity Units). Standardized using Formazin polymer suspension (BIS 10500 potable limit: ≤ 1.0 NTU).',
      specReference: 'IS: 3025 (Part 10)-1984 & IS: 3025 (Part 11)',
      dimensions: 'Range: 0.01 to 1000 NTU, Accuracy: ± 2%',
      formula: 'Scattered Light Intensity proportional to Colloidal Turbidity',
    });
  }

  public setTestMode(testType: string): void {
    this.currentTest = testType;
  }

  public setTest(testType: string): void {
    this.setTestMode(testType);
  }

  public triggerTestSequence(): void {
    this.isTesting = true;
  }

  public update(delta: number, elapsed: number): void {
    // Revolve Jar test paddles when operating
    this.jarTestPaddles.forEach((paddle, idx) => {
      paddle.rotation.y += delta * (this.isTesting ? 6.0 : 1.5);
    });
  }
}
