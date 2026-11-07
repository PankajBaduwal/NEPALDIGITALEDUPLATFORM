/**
 * Module 1: Universal Testing Machine (UTM) Tensile & Compression Material Testing
 * Official Syllabus: Unit I & Lab Exp 1 (Tension test on mild steel rod)
 * Conforming to IS 1608 / ASTM E8
 */

import * as THREE from 'three';
import { BaseSolidMechanicsSimulation } from '../../core/BaseSolidMechanicsSimulation';
import { SolidMechanicsCalculator } from '../../core/SolidMechanicsCalculator';
import type { MaterialType } from '../../core/types';

export class UtmMaterialTestScene extends BaseSolidMechanicsSimulation {
  private crosshead!: THREE.Mesh;
  private specimenMesh!: THREE.Mesh;
  private upperGrip!: THREE.Mesh;
  private lowerGrip!: THREE.Mesh;
  private extensometerMesh!: THREE.Group;
  private loadArrow!: THREE.ArrowHelper;

  protected async setupSimulationObjects(): Promise<void> {
    this.stages = [
      {
        name: 'Isometric Overall',
        cameraPosition: [1.8, 1.6, 2.2],
        cameraTarget: [0, 1.0, 0],
        description: 'Universal Testing Machine complete assembly with specimen and instrumentation.',
      },
      {
        name: 'Specimen Gauge Close-up',
        cameraPosition: [0, 1.0, 0.8],
        cameraTarget: [0, 1.0, 0],
        description: 'Cylindrical tensile specimen with electronic clip-on extensometer and gauge marks.',
      },
      {
        name: 'Hydraulic Crosshead & Load Cell',
        cameraPosition: [0, 1.8, 1.2],
        cameraTarget: [0, 1.6, 0],
        description: 'Upper movable crosshead, digital load cell, and upper pneumatic wedge grip.',
      },
    ];

    const utmGroup = new THREE.Group();

    // 1. Heavy Cast Iron Base Table
    const baseGeo = new THREE.BoxGeometry(0.9, 0.25, 0.6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.125;
    utmGroup.add(baseMesh);

    // 2. Twin Hardened Steel Guide Columns
    const colGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.8, 24);
    const colMat = this.steelMaterial;

    const leftCol = new THREE.Mesh(colGeo, colMat);
    leftCol.position.set(-0.32, 1.15, 0);
    utmGroup.add(leftCol);

    const rightCol = new THREE.Mesh(colGeo, colMat);
    rightCol.position.set(0.32, 1.15, 0);
    utmGroup.add(rightCol);

    // 3. Top Stationary Crosshead
    const topBeamGeo = new THREE.BoxGeometry(0.85, 0.18, 0.35);
    const topBeam = new THREE.Mesh(topBeamGeo, baseMat);
    topBeam.position.set(0, 1.95, 0);
    utmGroup.add(topBeam);

    // 4. Movable Hydraulic Crosshead
    const crossheadGeo = new THREE.BoxGeometry(0.82, 0.16, 0.34);
    this.crosshead = new THREE.Mesh(crossheadGeo, this.darkSteelMaterial);
    this.crosshead.position.set(0, 1.5, 0);
    this.crosshead.userData.inspection = {
      id: 'hydraulic-crosshead',
      name: 'Movable Hydraulic Crosshead',
      category: 'loading',
      description: 'Precision servo-hydraulic actuated crosshead providing controlled crosshead displacement rates conforming to IS 1608.',
      specifications: { 'Maximum Capacity': '100 kN', 'Stroke Range': '250 mm', Actuation: 'Closed-loop Servo-Hydraulic' },
    };
    utmGroup.add(this.crosshead);
    this.registerInspectable(this.crosshead);

    // 5. Lower Stationary Grip
    const gripGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.16, 20);
    this.lowerGrip = new THREE.Mesh(gripGeo, this.steelMaterial);
    this.lowerGrip.position.set(0, 0.35, 0);
    this.lowerGrip.userData.inspection = {
      id: 'lower-grip',
      name: 'Lower Wedge Action Tensile Grip',
      category: 'fixture',
      description: 'Self-tightening serrated wedge jaws designed to securely clamp round and flat tensile specimens without slippage.',
      specifications: { 'Grip Type': 'Mechanical Wedge Action', 'Clamping Range': '4 - 16 mm Diameter' },
    };
    utmGroup.add(this.lowerGrip);
    this.registerInspectable(this.lowerGrip);

    // 6. Upper Movable Grip (attached to crosshead)
    this.upperGrip = new THREE.Mesh(gripGeo, this.steelMaterial);
    this.upperGrip.position.set(0, 1.35, 0);
    this.upperGrip.userData.inspection = {
      id: 'upper-grip',
      name: 'Upper Wedge Grip & Digital Load Cell',
      category: 'instrumentation',
      description: 'Transfers axial tensile pulling force from the hydraulic crosshead directly through an inline strain-gauge load cell.',
      specifications: { 'Accuracy Class': 'Grade 0.5 per ISO 7500-1', 'Overload Protection': '150%' },
    };
    utmGroup.add(this.upperGrip);
    this.registerInspectable(this.upperGrip);

    // 7. Tensile Specimen (Standard Round Bar)
    const specimenGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.8, 32);
    this.specimenMesh = new THREE.Mesh(specimenGeo, this.steelMaterial);
    this.specimenMesh.position.set(0, 0.85, 0);
    this.specimenMesh.userData.inspection = {
      id: 'tensile-specimen',
      name: 'Standard Tensile Test Specimen (IS 1608 / ASTM E8)',
      category: 'structural',
      description: 'Precision machined cylindrical test specimen with 12 mm gauge diameter and 50 mm calibrated gauge length.',
      specifications: { 'Gauge Diameter (d0)': '12.0 mm', 'Original Gauge Length (L0)': '50.0 mm', Standard: 'IS 1608:2018' },
    };
    utmGroup.add(this.specimenMesh);
    this.registerInspectable(this.specimenMesh);

    // 8. Electronic Clip-on Extensometer
    this.extensometerMesh = new THREE.Group();
    const extBodyGeo = new THREE.BoxGeometry(0.08, 0.12, 0.05);
    const extBodyMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.6, roughness: 0.3 });
    const extBody = new THREE.Mesh(extBodyGeo, extBodyMat);
    extBody.position.set(0.07, 0.85, 0);

    const extKnife1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.02), this.darkSteelMaterial);
    extKnife1.position.set(0.03, 0.89, 0);
    const extKnife2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.02), this.darkSteelMaterial);
    extKnife2.position.set(0.03, 0.81, 0);

    this.extensometerMesh.add(extBody, extKnife1, extKnife2);
    this.extensometerMesh.userData.inspection = {
      id: 'extensometer',
      name: 'Electronic Clip-On Extensometer (Class 0.5)',
      category: 'instrumentation',
      description: 'Dual knife-edge axial extensometer with high-resolution LVDT sensor measuring infinitesimal elastic strains to 0.1 micron precision.',
      specifications: { 'Gauge Length': '50.0 mm', Travel: '+10 mm / -2.5 mm', Resolution: '0.0001 mm' },
    };
    utmGroup.add(this.extensometerMesh);
    this.registerInspectable(this.extensometerMesh);

    // 9. Load Direction Arrow (Upward Tensile Pull)
    this.loadArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1.6, 0), 0.25, 0xef4444, 0.08, 0.05);
    utmGroup.add(this.loadArrow);

    this.scene.add(utmGroup);

    // Default Parameters
    this.state.parameters = {
      appliedForceKN: 20,
      gaugeDiameterMm: 12,
      gaugeLengthMm: 50,
      materialKey: 'mild-steel',
      deformationScale: 100,
    };

    this.updateCalculations();
  }

  protected updatePhysics(delta: number): void {
    // Subtle idle hydraulic pulsation
    if (this.loadArrow) {
      const pulse = Math.sin(this.clock.getElapsedTime() * 3) * 0.02;
      this.loadArrow.setLength(0.25 + pulse, 0.08, 0.05);
    }
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const force = Number(this.state.parameters.appliedForceKN || 20);
    const d = Number(this.state.parameters.gaugeDiameterMm || 12);
    const L0 = Number(this.state.parameters.gaugeLengthMm || 50);
    const matKey = (this.state.parameters.materialKey as MaterialType) || 'mild-steel';
    const scale = Number(this.state.parameters.deformationScale || 100);

    const res = SolidMechanicsCalculator.calculateUtmTest(force, d, L0, matKey);

    // Update 3D Visual Mesh Deformation
    const d_meters = d / 1000;
    const visualElongation = (res.elongationMm / 1000) * scale;
    const newLength = 0.8 + visualElongation;

    // Specimen necking reduction if plastic
    const neckingRatio = res.isYielded ? Math.max(0.7, 1 - (res.engineeringStrain - 0.002) * 1.5) : 1.0;
    this.specimenMesh.scale.set(neckingRatio, newLength / 0.8, neckingRatio);
    this.specimenMesh.position.y = 0.45 + newLength / 2;

    // Move upper grip and crosshead
    this.upperGrip.position.y = 0.45 + newLength + 0.08;
    this.crosshead.position.y = 0.45 + newLength + 0.22;
    this.loadArrow.position.y = this.crosshead.position.y + 0.12;

    // Update Metrics HUD
    this.state.metrics = {
      'Applied Force (P)': `${res.appliedForceKN.toFixed(1)} kN`,
      'Cross-Section Area (A₀)': `${res.crossSectionAreaMm2.toFixed(1)} mm²`,
      'Engineering Stress (σ)': `${res.engineeringStressMPa.toFixed(1)} MPa`,
      'Engineering Strain (ε)': `${(res.engineeringStrain * 1e6).toFixed(0)} µε`,
      'Total Elongation (ΔL)': `${res.elongationMm.toFixed(4)} mm`,
      'True Stress (σ_true)': `${res.trueStressMPa.toFixed(1)} MPa`,
      'Yield Status': res.isYielded ? 'PLASTIC FLOW (Yielded)' : 'LINEAR ELASTIC (Hookean)',
      'Visual Mag Scale': `${scale}x Magnified`,
    };

    this.notify();
  }
}
