/**
 * Module 6: Columns Buckling & Thin Cylinders Pressure Vessels
 * Official Syllabus: Unit V & Lab Exp 9 (Simulation of thin cylindrical shell under internal pressure)
 * Euler's Buckling Theory & Thin-Wall Vessel Membrane Theory
 */

import * as THREE from 'three';
import { BaseSolidMechanicsSimulation } from '../../core/BaseSolidMechanicsSimulation';
import { SolidMechanicsCalculator } from '../../core/SolidMechanicsCalculator';
import type { ColumnEndCondition, MaterialType } from '../../core/types';

export class ColumnsThinCylinderScene extends BaseSolidMechanicsSimulation {
  private columnMeshGroup!: THREE.Group;
  private cylinderMeshGroup!: THREE.Group;
  private columnLine!: THREE.Line;
  private topBucklingRam!: THREE.Mesh;
  private pressureGaugeGroup!: THREE.Group;
  private gaugeNeedle!: THREE.Mesh;

  protected async setupSimulationObjects(): Promise<void> {
    this.stages = [
      {
        name: 'Isometric Overall',
        cameraPosition: [2.2, 1.8, 2.5],
        cameraTarget: [0, 1.0, 0],
        description: 'Combined column buckling apparatus and pressurized thin cylindrical pressure vessel.',
      },
      {
        name: 'Column Buckling Close-up',
        cameraPosition: [-0.6, 1.2, 1.2],
        cameraTarget: [-0.6, 1.0, 0],
        description: 'Euler slender column buckling under axial compressive thrust with variable end fixtures.',
      },
      {
        name: 'Pressure Vessel Close-up',
        cameraPosition: [0.7, 1.1, 1.2],
        cameraTarget: [0.7, 0.8, 0],
        description: 'Thin cylindrical shell under internal pressure displaying circumferential hoop and longitudinal stresses.',
      },
    ];

    const mainGroup = new THREE.Group();

    // 1. Column Buckling Subsystem (Left side: x = -0.6)
    this.columnMeshGroup = new THREE.Group();
    this.columnMeshGroup.position.set(-0.6, 0, 0);

    const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.4), this.darkSteelMaterial);
    colBase.position.set(0, 0.06, 0);
    this.columnMeshGroup.add(colBase);

    // Vertical Frame Pillars
    const framePillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8), this.steelMaterial);
    framePillar1.position.set(-0.18, 1.0, 0);
    const framePillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8), this.steelMaterial);
    framePillar2.position.set(0.18, 1.0, 0);
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.25), this.darkSteelMaterial);
    topFrame.position.set(0, 1.95, 0);
    this.columnMeshGroup.add(framePillar1, framePillar2, topFrame);

    // Deformed Buckling Column (Polyline)
    const colPoints: THREE.Vector3[] = [];
    const colSegs = 30;
    for (let i = 0; i <= colSegs; i++) {
      colPoints.push(new THREE.Vector3(0, 0.15 + (i / colSegs) * 1.6, 0));
    }
    const colLineGeo = new THREE.BufferGeometry().setFromPoints(colPoints);
    this.columnLine = new THREE.Line(
      colLineGeo,
      new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 4 })
    );
    this.columnLine.userData.inspection = {
      id: 'euler-column',
      name: 'Slender Structural Column (Euler Buckling)',
      category: 'structural',
      description: 'Slender circular steel column subject to axial compressive thrust P. Buckles when P reaches Euler critical load P_cr.',
      specifications: { 'Critical Load': 'P_cr = (π² · E · I) / Le²', Slenderness: 'λ = Le / k' },
    };
    this.columnMeshGroup.add(this.columnLine);
    this.registerInspectable(this.columnLine);

    // Top Hydraulic Loading Ram
    this.topBucklingRam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2), this.steelMaterial);
    this.topBucklingRam.position.set(0, 1.85, 0);
    this.columnMeshGroup.add(this.topBucklingRam);

    mainGroup.add(this.columnMeshGroup);

    // 2. Thin Cylindrical Pressure Vessel Subsystem (Right side: x = +0.7)
    this.cylinderMeshGroup = new THREE.Group();
    this.cylinderMeshGroup.position.set(0.7, 0, 0);

    const cylSaddles = new THREE.Group();
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.4), this.darkSteelMaterial);
    s1.position.set(-0.35, 0.5, 0);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.4), this.darkSteelMaterial);
    s2.position.set(0.35, 0.5, 0);
    cylSaddles.add(s1, s2);
    this.cylinderMeshGroup.add(cylSaddles);

    // Pressure Vessel Shell (Translucent Acrylic / Steel)
    const cylShellGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 32);
    cylShellGeo.rotateZ(Math.PI / 2);
    const cylShellMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      metalness: 0.6,
      roughness: 0.3,
    });
    const cylShell = new THREE.Mesh(cylShellGeo, cylShellMat);
    cylShell.position.set(0, 0.7, 0);

    // Hemispherical End Caps
    const hemi1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), cylShellMat);
    hemi1.rotation.z = -Math.PI / 2;
    hemi1.position.set(0.5, 0.7, 0);

    const hemi2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), cylShellMat);
    hemi2.rotation.z = Math.PI / 2;
    hemi2.position.set(-0.5, 0.7, 0);

    cylShell.userData.inspection = {
      id: 'thin-cylinder-vessel',
      name: 'Thin Cylindrical Pressure Vessel (IS 2825)',
      category: 'structural',
      description: 'Thin-wall shell (D/t ≥ 20) under internal fluid pressure p. Subject to circumferential hoop stress and axial longitudinal stress.',
      specifications: { 'Hoop Stress': 'σ_h = (p · D) / (2t)', 'Longitudinal Stress': 'σ_L = (p · D) / (4t)', 'Ratio': 'σ_h = 2 · σ_L' },
    };
    this.cylinderMeshGroup.add(cylShell, hemi1, hemi2);
    this.registerInspectable(cylShell);

    // Dial Pressure Manometer on Top of Vessel
    this.pressureGaugeGroup = new THREE.Group();
    const gCase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24), this.steelMaterial);
    gCase.position.set(0, 0.98, 0);
    const gFace = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    gFace.position.set(0, 0.98, 0.016);

    const gNeedle = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.05, 0.002), this.redMarkerMaterial);
    gNeedle.geometry.translate(0, 0.025, 0);
    gNeedle.position.set(0, 0.98, 0.018);
    this.gaugeNeedle = gNeedle;

    this.pressureGaugeGroup.add(gCase, gFace, this.gaugeNeedle);
    this.pressureGaugeGroup.userData.inspection = {
      id: 'bourdon-pressure-gauge',
      name: 'Bourdon Tube Pressure Manometer',
      category: 'instrumentation',
      description: 'Measures internal hydrostatic test pressure in MPa conforming to IS 3624 standards.',
      specifications: { Range: '0 - 10 MPa', Class: 'Grade 1.0' },
    };
    this.cylinderMeshGroup.add(this.pressureGaugeGroup);
    this.registerInspectable(this.pressureGaugeGroup);

    mainGroup.add(this.cylinderMeshGroup);
    this.scene.add(mainGroup);

    // Default Parameters
    this.state.parameters = {
      columnLengthM: 2.0,
      columnDiameterMm: 40,
      endCondition: 'both-pinned',
      axialLoadKN: 30,
      internalPressureMPa: 2.5,
      cylinderDiameterMm: 400,
      wallThicknessMm: 8,
      materialKey: 'mild-steel',
      deformationScale: 50,
    };

    this.updateCalculations();
  }

  protected updatePhysics(delta: number): void {
    // Subtle breathing pulse for pressure vessel
    if (this.cylinderMeshGroup) {
      const breath = 1.0 + Math.sin(this.clock.getElapsedTime() * 2) * 0.005;
      this.cylinderMeshGroup.scale.set(breath, breath, breath);
    }
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const L_col = Number(this.state.parameters.columnLengthM || 2.0);
    const d_col = Number(this.state.parameters.columnDiameterMm || 40);
    const endCond = (this.state.parameters.endCondition as ColumnEndCondition) || 'both-pinned';
    const p_int = Number(this.state.parameters.internalPressureMPa || 2.5);
    const D_cyl = Number(this.state.parameters.cylinderDiameterMm || 400);
    const t_cyl = Number(this.state.parameters.wallThicknessMm || 8);
    const matKey = (this.state.parameters.materialKey as MaterialType) || 'mild-steel';
    const axialP = Number(this.state.parameters.axialLoadKN || 30);
    const scale = Number(this.state.parameters.deformationScale || 50);

    const res = SolidMechanicsCalculator.calculateColumnCylinder(
      L_col,
      d_col,
      endCond,
      p_int,
      D_cyl,
      t_cyl,
      matKey
    );

    // Update Buckled Column Curve
    const count = 30;
    const positions = (this.columnLine.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const loadRatio = Math.min(1.5, axialP / res.eulerBucklingLoadKN);
    const buckledAmplitude = 0.15 * Math.sqrt(Math.max(0, loadRatio - 0.5));

    for (let i = 0; i <= count; i++) {
      const frac = i / count;
      const y = 0.15 + frac * 1.6;
      let x = 0;

      if (loadRatio >= 0.7) {
        if (endCond === 'both-pinned') {
          x = buckledAmplitude * Math.sin(frac * Math.PI);
        } else if (endCond === 'both-fixed') {
          x = buckledAmplitude * 0.5 * (1 - Math.cos(frac * Math.PI * 2));
        } else if (endCond === 'one-fixed-one-free') {
          x = buckledAmplitude * (1 - Math.cos(frac * Math.PI * 0.5));
        } else {
          x = buckledAmplitude * Math.sin(frac * Math.PI) * frac;
        }
      }

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
    }
    const posAttr = this.columnLine.geometry.attributes.position;
    if (posAttr) posAttr.needsUpdate = true;

    // Rotate Bourdon Gauge Needle
    const needleAngle = (p_int / 10.0) * Math.PI * 1.5;
    this.gaugeNeedle.rotation.z = -needleAngle;

    this.state.metrics = {
      'Euler Buckling Load (P_cr)': `${res.eulerBucklingLoadKN.toFixed(1)} kN`,
      'Slenderness Ratio (λ)': `${res.slendernessRatio.toFixed(1)} (${res.endCondition})`,
      'Rankine Safe Load': `${res.safeWorkingLoadKN.toFixed(1)} kN (FOS: 2.5)`,
      'Internal Pressure (p)': `${res.internalPressureMPa.toFixed(2)} MPa`,
      'Hoop Stress (σ_h)': `${res.hoopStressMPa.toFixed(1)} MPa (pD/2t)`,
      'Longitudinal Stress (σ_L)': `${res.longitudinalStressMPa.toFixed(1)} MPa (pD/4t)`,
      'Volumetric Strain': `${res.volumetricStrainMicro.toFixed(1)} µε`,
      'Thin Shell Check (D/t)': `${(D_cyl / t_cyl).toFixed(1)} (${res.isThinShell ? 'VALID THIN SHELL' : 'THICK CYLINDER'})`,
    };

    this.notify();
  }
}
