/**
 * Module 4: Beam Bending Stress & Elastic Deflection Laboratory
 * Official Syllabus: Unit II & Unit III & Lab Exp 5 (Deflection test on beams)
 * Theory of Simple Bending (IS 800 / Euler-Bernoulli)
 */

import * as THREE from 'three';
import { BaseSolidMechanicsSimulation } from '../../core/BaseSolidMechanicsSimulation';
import { SolidMechanicsCalculator } from '../../core/SolidMechanicsCalculator';
import type { BeamSupportType, BeamCrossSectionType, MaterialType } from '../../core/types';

export class BeamBendingDeflectionScene extends BaseSolidMechanicsSimulation {
  private beamLine!: THREE.Line;
  private dialGaugeGroup!: THREE.Group;
  private dialPointerMesh!: THREE.Mesh;
  private crossSectionPrism!: THREE.Group;
  private pointLoadArrow!: THREE.ArrowHelper;

  protected async setupSimulationObjects(): Promise<void> {
    this.stages = [
      {
        name: 'Isometric Overall',
        cameraPosition: [2.2, 1.6, 2.5],
        cameraTarget: [0, 0.7, 0],
        description: 'Complete beam flexure testing frame with midspan dial test indicator and supports.',
      },
      {
        name: 'Dial Gauge Close-up',
        cameraPosition: [0, 1.1, 0.9],
        cameraTarget: [0, 0.8, 0],
        description: 'High-precision plunger dial gauge measuring elastic central deflection in millimeters.',
      },
      {
        name: 'Stress Prism Section',
        cameraPosition: [0.9, 1.2, 0.6],
        cameraTarget: [0.6, 0.75, 0],
        description: 'Linear flexural stress distribution prism: Compression on upper fibers, tension on lower fibers.',
      },
    ];

    const flexureGroup = new THREE.Group();

    // 1. Rigid Laboratory Test Bed
    const bedGeo = new THREE.BoxGeometry(2.8, 0.14, 0.6);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, 0.35, 0);
    flexureGroup.add(bed);

    // 2. Adjustable Knife-Edge Supports
    const supGeo = new THREE.ConeGeometry(0.08, 0.22, 4);
    supGeo.rotateY(Math.PI / 4);

    const leftSup = new THREE.Mesh(supGeo, this.darkSteelMaterial);
    leftSup.position.set(-1.1, 0.52, 0);
    flexureGroup.add(leftSup);

    const rightSup = new THREE.Mesh(supGeo, this.darkSteelMaterial);
    rightSup.position.set(1.1, 0.52, 0);
    flexureGroup.add(rightSup);

    // 3. Deformed Elastic Beam Geometry (Smooth Polyline)
    const points: THREE.Vector3[] = [];
    const count = 40;
    for (let i = 0; i <= count; i++) {
      const x = -1.1 + (i / count) * 2.2;
      points.push(new THREE.Vector3(x, 0.63, 0));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
    this.beamLine = new THREE.Line(lineGeo, lineMat);
    this.beamLine.userData.inspection = {
      id: 'elastic-beam',
      name: 'Flexural Test Specimen (Euler-Bernoulli Elastic Curve)',
      category: 'structural',
      description: 'Elastic deflection curve satisfying differential equation EI·d²v/dx² = M(x).',
      specifications: { 'Governing Law': 'Euler-Bernoulli Beam Theory', Modulus: 'E = 205 GPa (Structural Steel)' },
    };
    flexureGroup.add(this.beamLine);
    this.registerInspectable(this.beamLine);

    // 4. Dial Test Indicator (DTI)
    this.dialGaugeGroup = new THREE.Group();
    const dialCase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 32), this.steelMaterial);
    dialCase.rotation.x = Math.PI / 2;

    const dialFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.085, 32),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    dialFace.position.z = 0.022;

    // Dial Needle / Pointer
    const pointerGeo = new THREE.BoxGeometry(0.006, 0.07, 0.004);
    pointerGeo.translate(0, 0.035, 0.025);
    this.dialPointerMesh = new THREE.Mesh(pointerGeo, this.redMarkerMaterial);

    // Plunger Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 16), this.steelMaterial);
    stem.position.y = -0.15;

    this.dialGaugeGroup.add(dialCase, dialFace, this.dialPointerMesh, stem);
    this.dialGaugeGroup.position.set(0, 0.9, 0);
    this.dialGaugeGroup.userData.inspection = {
      id: 'dial-test-indicator',
      name: 'Precision Dial Test Indicator (0.01 mm / Div)',
      category: 'instrumentation',
      description: 'Spring-loaded plunger dial gauge measuring central beam deflection under increasing transverse loads.',
      specifications: { Range: '0 - 25 mm', Graduation: '0.01 mm / division', Standard: 'IS 2092' },
    };
    flexureGroup.add(this.dialGaugeGroup);
    this.registerInspectable(this.dialGaugeGroup);

    // 5. Stress Prism Visualization at Section
    this.crossSectionPrism = new THREE.Group();
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.12), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    topBar.position.set(0.6, 0.72, 0); // Compressive Top
    const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.12), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
    bottomBar.position.set(0.6, 0.54, 0); // Tensile Bottom
    this.crossSectionPrism.add(topBar, bottomBar);
    this.crossSectionPrism.userData.inspection = {
      id: 'bending-stress-prism',
      name: 'Cross-Section Bending Stress Prism',
      category: 'structural',
      description: 'Linear flexural stress distribution: Red represents top fiber compression (-σ), blue represents bottom fiber tension (+σ).',
      specifications: { 'Flexure Formula': 'σ = (M · y) / I = M / Z', 'Neutral Axis': 'y = 0 (Zero Normal Stress)' },
    };
    flexureGroup.add(this.crossSectionPrism);
    this.registerInspectable(this.crossSectionPrism);

    // 6. Point Load Downward Arrow
    this.pointLoadArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 1.25, 0),
      0.35,
      0xef4444,
      0.1,
      0.06
    );
    flexureGroup.add(this.pointLoadArrow);

    this.scene.add(flexureGroup);

    // Default Parameters
    this.state.parameters = {
      beamLengthM: 3.0,
      supportType: 'simply-supported',
      crossSectionType: 'rectangular',
      bMm: 100,
      hMm: 200,
      loadKN: 20,
      isUDL: false,
      materialKey: 'structural-steel',
      deformationScale: 100,
    };

    this.updateCalculations();
  }

  protected updatePhysics(delta: number): void {
    if (this.pointLoadArrow) {
      const pulse = Math.sin(this.clock.getElapsedTime() * 3) * 0.02;
      this.pointLoadArrow.setLength(0.35 + pulse, 0.1, 0.06);
    }
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const L = Number(this.state.parameters.beamLengthM || 3.0);
    const support = (this.state.parameters.supportType as BeamSupportType) || 'simply-supported';
    const section = (this.state.parameters.crossSectionType as BeamCrossSectionType) || 'rectangular';
    const b = Number(this.state.parameters.bMm || 100);
    const h = Number(this.state.parameters.hMm || 200);
    const load = Number(this.state.parameters.loadKN || 20);
    const isUDL = Boolean(this.state.parameters.isUDL);
    const matKey = (this.state.parameters.materialKey as MaterialType) || 'structural-steel';
    const scale = Number(this.state.parameters.deformationScale || 100);

    const res = SolidMechanicsCalculator.calculateBeamBending(L, support, section, b, h, load, isUDL, matKey);

    // Update 3D Beam Deflection Curve
    const count = 40;
    const positions = (this.beamLine.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const visualMaxDefl = (res.maxDeflectionMm / 1000) * scale;

    for (let i = 0; i <= count; i++) {
      const frac = i / count;
      const x = -1.1 + frac * 2.2;
      const midFactor = Math.sin(frac * Math.PI); // Parabolic shape
      const y = 0.63 - visualMaxDefl * midFactor;
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
    }
    const posAttr = this.beamLine.geometry.attributes.position;
    if (posAttr) posAttr.needsUpdate = true;

    // Rotate Dial Gauge Needle (1 full revolution = 1 mm deflection)
    const needleRevolutions = (res.maxDeflectionMm % 1.0) * Math.PI * 2;
    this.dialPointerMesh.rotation.z = -needleRevolutions;

    this.state.metrics = {
      'Applied Load (W)': `${load.toFixed(1)} kN (${isUDL ? 'UDL' : 'Point Load'})`,
      'Section Modulus (Z)': `${res.sectionModulusMm3.toLocaleString()} mm³`,
      'Moment of Inertia (I)': `${(res.secondMomentOfAreaMm4 / 1e6).toFixed(2)} × 10⁶ mm⁴`,
      'Max Bending Moment': `${res.maxBendingMomentKNm.toFixed(2)} kN·m`,
      'Max Bending Stress': `${res.maxBendingStressMPa.toFixed(1)} MPa`,
      'Max Deflection (δ)': `${res.maxDeflectionMm.toFixed(3)} mm (at midspan)`,
      'Serviceability (L/250)': `${res.allowableDeflectionLimitMm.toFixed(1)} mm (${res.isDeflectionServiceable ? 'PASS' : 'EXCEEDED'})`,
      'Visual Magnification': `${scale}x Magnified`,
    };

    this.notify();
  }
}
