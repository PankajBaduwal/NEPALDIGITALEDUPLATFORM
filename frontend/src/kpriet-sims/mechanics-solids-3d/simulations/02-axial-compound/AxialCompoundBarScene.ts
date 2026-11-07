/**
 * Module 2: Axial Deformation & Compound Bars
 * Official Syllabus: Unit I (Deformation of simple and compound bars, Thermal stresses, Elastic constants)
 */

import * as THREE from 'three';
import { BaseSolidMechanicsSimulation } from '../../core/BaseSolidMechanicsSimulation';
import { SolidMechanicsCalculator } from '../../core/SolidMechanicsCalculator';
import type { MaterialType } from '../../core/types';

export class AxialCompoundBarScene extends BaseSolidMechanicsSimulation {
  private coreBarMesh!: THREE.Mesh;
  private sleeveBarMesh!: THREE.Mesh;
  private leftEndPlate!: THREE.Mesh;
  private rightEndPlate!: THREE.Mesh;
  private loadArrow!: THREE.ArrowHelper;

  protected async setupSimulationObjects(): Promise<void> {
    this.stages = [
      {
        name: 'Isometric View',
        cameraPosition: [2.0, 1.4, 2.2],
        cameraTarget: [0, 0.7, 0],
        description: 'Complete axial fixture showing concentric core rod, outer sleeve, and rigid end plates.',
      },
      {
        name: 'End Flange & Load Cell',
        cameraPosition: [1.2, 1.0, 0.8],
        cameraTarget: [0.8, 0.7, 0],
        description: 'Rigid end flange plate distributing axial pulling load across compound cross-sections.',
      },
      {
        name: 'Cross-Section Interface',
        cameraPosition: [0, 1.6, 0.1],
        cameraTarget: [0, 0.7, 0],
        description: 'Top cutaway view revealing bimetallic interface between inner core and outer sleeve.',
      },
    ];

    const rigGroup = new THREE.Group();

    // 1. Rigid Base Support Table
    const tableGeo = new THREE.BoxGeometry(2.4, 0.15, 0.6);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.35, 0);
    rigGroup.add(table);

    // 2. Fixed Left Abutment Wall
    const wallGeo = new THREE.BoxGeometry(0.18, 0.55, 0.5);
    const wall = new THREE.Mesh(wallGeo, this.darkSteelMaterial);
    wall.position.set(-0.95, 0.7, 0);
    wall.userData.inspection = {
      id: 'fixed-abutment',
      name: 'Rigid Reaction Abutment',
      category: 'fixture',
      description: 'Massive rigid reaction fixture restraining the left end against axial translation.',
      specifications: { Restraint: 'Fixed Zero Displacement (u = 0)', Capacity: '200 kN' },
    };
    rigGroup.add(wall);
    this.registerInspectable(wall);

    // 3. Inner Core Bar (Steel)
    const coreGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.6, 32);
    coreGeo.rotateZ(Math.PI / 2);
    this.coreBarMesh = new THREE.Mesh(coreGeo, this.steelMaterial);
    this.coreBarMesh.position.set(0, 0.7, 0);
    this.coreBarMesh.userData.inspection = {
      id: 'inner-core-bar',
      name: 'Internal Solid Core Rod (Mild Steel)',
      category: 'structural',
      description: 'Inner cylindrical core bar carrying proportional share of total tensile load based on its axial stiffness (A₁·E₁).',
      specifications: { 'Diameter (d1)': '20.0 mm', 'Young Modulus (E1)': '200 GPa', 'Yield Strength': '250 MPa' },
    };
    rigGroup.add(this.coreBarMesh);
    this.registerInspectable(this.coreBarMesh);

    // 4. Outer Concentric Sleeve Bar (Copper / Brass)
    const sleeveGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 32);
    sleeveGeo.rotateZ(Math.PI / 2);
    this.sleeveBarMesh = new THREE.Mesh(sleeveGeo, this.copperMaterial);
    this.sleeveBarMesh.position.set(0, 0.7, 0);
    this.sleeveBarMesh.userData.inspection = {
      id: 'outer-sleeve-bar',
      name: 'Outer Concentric Sleeve (Commercial Copper)',
      category: 'structural',
      description: 'Hollow cylindrical outer sleeve bonded or clamped to the core. Subject to equal axial strain in parallel loading.',
      specifications: { 'Outer Diameter (d2)': '35.0 mm', 'Young Modulus (E2)': '115 GPa', 'Thermal Expansion': '16.5 µm/m·K' },
    };
    rigGroup.add(this.sleeveBarMesh);
    this.registerInspectable(this.sleeveBarMesh);

    // 5. Left and Right Rigid End Plates
    const plateGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 24);
    plateGeo.rotateZ(Math.PI / 2);
    this.leftEndPlate = new THREE.Mesh(plateGeo, this.darkSteelMaterial);
    this.leftEndPlate.position.set(-0.82, 0.7, 0);
    rigGroup.add(this.leftEndPlate);

    this.rightEndPlate = new THREE.Mesh(plateGeo, this.steelMaterial);
    this.rightEndPlate.position.set(0.82, 0.7, 0);
    this.rightEndPlate.userData.inspection = {
      id: 'rigid-end-flange',
      name: 'Rigid End Distribution Flange',
      category: 'fixture',
      description: 'Infinitely rigid clamping plate ensuring identical axial extension (ΔL₁ = ΔL₂) across both concentric members.',
      specifications: { Function: 'Strain Compatibility Enforcer', Material: 'High-Strength Forged Alloy' },
    };
    rigGroup.add(this.rightEndPlate);
    this.registerInspectable(this.rightEndPlate);

    // 6. Right Tensile Pull Arrow
    this.loadArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0.84, 0.7, 0),
      0.35,
      0xef4444,
      0.1,
      0.06
    );
    rigGroup.add(this.loadArrow);

    this.scene.add(rigGroup);

    // Default Parameters
    this.state.parameters = {
      totalForceKN: 60,
      lengthM: 1.2,
      material1Key: 'mild-steel',
      diameter1Mm: 20,
      isCompound: true,
      material2Key: 'copper',
      diameter2Mm: 35,
      deltaTempC: 0,
      deformationScale: 200,
    };

    this.updateCalculations();
  }

  protected updatePhysics(delta: number): void {
    if (this.loadArrow) {
      const pulse = Math.sin(this.clock.getElapsedTime() * 4) * 0.02;
      this.loadArrow.setLength(0.35 + pulse, 0.1, 0.06);
    }
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const P = Number(this.state.parameters.totalForceKN || 60);
    const L = Number(this.state.parameters.lengthM || 1.2);
    const mat1 = (this.state.parameters.material1Key as MaterialType) || 'mild-steel';
    const d1 = Number(this.state.parameters.diameter1Mm || 20);
    const isCompound = Boolean(this.state.parameters.isCompound !== false);
    const mat2 = (this.state.parameters.material2Key as MaterialType) || 'copper';
    const d2 = Number(this.state.parameters.diameter2Mm || 35);
    const dT = Number(this.state.parameters.deltaTempC || 0);
    const scale = Number(this.state.parameters.deformationScale || 200);

    const res = SolidMechanicsCalculator.calculateAxialCompoundBar(P, L, mat1, d1, isCompound, mat2, d2, dT);

    // Toggle sleeve visibility
    this.sleeveBarMesh.visible = isCompound;

    // Visual extension scaling
    const visualExtension = (res.elongationMm / 1000) * scale;
    const baseLength = 1.6;
    const currentL = baseLength + visualExtension;

    this.coreBarMesh.scale.set(1, currentL / baseLength, 1);
    this.rightEndPlate.position.x = 0.8 + visualExtension;
    this.loadArrow.position.x = this.rightEndPlate.position.x + 0.04;

    this.state.metrics = {
      'Total Axial Load (P)': `${res.totalForceKN.toFixed(1)} kN`,
      'Total Elongation (ΔL)': `${res.elongationMm.toFixed(4)} mm`,
      'Bar 1 Force (P₁)': `${res.bar1.forceShareKN.toFixed(1)} kN`,
      'Bar 1 Stress (σ₁)': `${res.bar1.stressMPa.toFixed(1)} MPa (FOS: ${res.bar1.safetyFactor})`,
      'Bar 2 Force (P₂)': isCompound && res.bar2 ? `${res.bar2.forceShareKN.toFixed(1)} kN` : 'N/A',
      'Bar 2 Stress (σ₂)': isCompound && res.bar2 ? `${res.bar2.stressMPa.toFixed(1)} MPa` : 'N/A',
      'Thermal Stress': `${res.thermalStressMPa.toFixed(1)} MPa (ΔT: ${dT}°C)`,
      'Visual Scale': `${scale}x Magnification`,
    };

    this.notify();
  }
}
