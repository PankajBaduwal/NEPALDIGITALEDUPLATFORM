/**
 * Module 3: Shear Force & Bending Moment Diagrams (SFD & BMD)
 * Official Syllabus: Unit II (Transverse loading on beams, Cantilevers, Simply supported, Overhanging beams)
 */

import * as THREE from 'three';
import { BaseSolidMechanicsSimulation } from '../../core/BaseSolidMechanicsSimulation';
import { SolidMechanicsCalculator } from '../../core/SolidMechanicsCalculator';
import type { BeamSupportType, PointLoad, UniformlyDistributedLoad } from '../../core/types';

export class SfdBmdBeamScene extends BaseSolidMechanicsSimulation {
  private beamMesh!: THREE.Mesh;
  private leftSupportMesh!: THREE.Group;
  private rightSupportMesh!: THREE.Group;
  private pointLoadArrow!: THREE.ArrowHelper;
  private udlMeshGroup!: THREE.Group;
  private sectionCutPlane!: THREE.Mesh;

  protected async setupSimulationObjects(): Promise<void> {
    this.stages = [
      {
        name: 'Isometric Overall',
        cameraPosition: [2.5, 2.0, 3.0],
        cameraTarget: [0, 0.8, 0],
        description: 'Complete beam assembly showing transverse point loads, supports, and internal cut section.',
      },
      {
        name: 'Left Support & Reaction',
        cameraPosition: [-1.4, 1.2, 1.0],
        cameraTarget: [-1.2, 0.8, 0],
        description: 'Left support reaction fixture (hinge/pin or fixed clamp) maintaining equilibrium.',
      },
      {
        name: 'Movable Section Cut',
        cameraPosition: [0, 1.4, 1.2],
        cameraTarget: [0, 0.8, 0],
        description: 'Virtual cutting plane exposing internal transverse shear force and bending moment at station x.',
      },
    ];

    const beamAssembly = new THREE.Group();

    // 1. Structural I-Beam / Prismatic Rectangular Beam
    const beamGeo = new THREE.BoxGeometry(3.0, 0.16, 0.1);
    this.beamMesh = new THREE.Mesh(beamGeo, this.steelMaterial);
    this.beamMesh.position.set(0, 0.8, 0);
    this.beamMesh.userData.inspection = {
      id: 'structural-beam',
      name: 'Transversely Loaded Structural Beam',
      category: 'structural',
      description: 'Prismatic structural steel beam resisting transverse shear forces and internal flexural bending moments.',
      specifications: { Span: '3.0 - 6.0 m', Section: 'ISMB 200 Flanged Section', Material: 'IS 2062 Structural Steel' },
    };
    beamAssembly.add(this.beamMesh);
    this.registerInspectable(this.beamMesh);

    // 2. Left Support (Hinged Pin / Fixed Clamp)
    this.leftSupportMesh = new THREE.Group();
    const pinTriangle = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.18, 4), this.darkSteelMaterial);
    pinTriangle.rotation.y = Math.PI / 4;
    pinTriangle.position.set(-1.4, 0.69, 0);
    this.leftSupportMesh.add(pinTriangle);
    this.leftSupportMesh.userData.inspection = {
      id: 'left-support',
      name: 'Left Reaction Fixture (Pin/Fixed)',
      category: 'fixture',
      description: 'Supports vertical reaction force R_A preventing vertical translational displacement.',
      specifications: { Type: 'Knife-Edge Hinge', 'Degree of Freedom': 'Rotational Only' },
    };
    beamAssembly.add(this.leftSupportMesh);
    this.registerInspectable(this.leftSupportMesh);

    // 3. Right Support (Roller)
    this.rightSupportMesh = new THREE.Group();
    const rollerCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16), this.steelMaterial);
    rollerCyl.rotation.z = Math.PI / 2;
    rollerCyl.position.set(1.4, 0.72, 0);
    this.rightSupportMesh.add(rollerCyl);
    this.rightSupportMesh.userData.inspection = {
      id: 'right-support',
      name: 'Right Support Fixture (Roller)',
      category: 'fixture',
      description: 'Roller support providing vertical reaction R_B while permitting longitudinal thermal expansion.',
      specifications: { Type: 'Cylindrical Roller', 'Horizontal Friction': 'Zero Ideal Roller' },
    };
    beamAssembly.add(this.rightSupportMesh);
    this.registerInspectable(this.rightSupportMesh);

    // 4. Point Load Arrow (Downward Red Arrow)
    this.pointLoadArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 1.4, 0),
      0.45,
      0xef4444,
      0.12,
      0.08
    );
    beamAssembly.add(this.pointLoadArrow);

    // 5. Uniformly Distributed Load (UDL) Block Representation
    this.udlMeshGroup = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(-1.0 + i * 0.33, 1.15, 0),
        0.22,
        0x38bdf8,
        0.06,
        0.04
      );
      this.udlMeshGroup.add(arrow);
    }
    beamAssembly.add(this.udlMeshGroup);

    // 6. Movable Virtual Section Cut Plane
    const cutGeo = new THREE.PlaneGeometry(0.18, 0.35);
    const cutMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    this.sectionCutPlane = new THREE.Mesh(cutGeo, cutMat);
    this.sectionCutPlane.rotation.y = Math.PI / 2;
    this.sectionCutPlane.position.set(0, 0.8, 0);
    this.sectionCutPlane.userData.inspection = {
      id: 'section-cut-plane',
      name: 'Internal Virtual Section Cut (Station x)',
      category: 'instrumentation',
      description: 'Internal plane exposing resultant shear force V(x) and bending moment M(x) satisfying static equilibrium.',
      specifications: { 'Equilibrium Equation': 'ΣFy = 0, ΣM = 0', 'Differential Law': 'dM/dx = V(x)' },
    };
    beamAssembly.add(this.sectionCutPlane);
    this.registerInspectable(this.sectionCutPlane);

    this.scene.add(beamAssembly);

    // Default Parameters
    this.state.parameters = {
      beamLengthM: 4.0,
      supportType: 'simply-supported',
      pointLoadMagnitudeKN: 20,
      pointLoadPositionM: 2.0,
      hasUDL: false,
      udlIntensityKNm: 8,
      sectionCutXM: 2.0,
    };

    this.updateCalculations();
  }

  protected updatePhysics(delta: number): void {
    if (this.pointLoadArrow) {
      const pulse = Math.sin(this.clock.getElapsedTime() * 3) * 0.02;
      this.pointLoadArrow.setLength(0.45 + pulse, 0.12, 0.08);
    }
  }

  protected onParameterChanged(key: string, value: number | string | boolean): void {
    this.updateCalculations();
  }

  private updateCalculations(): void {
    const L = Number(this.state.parameters.beamLengthM || 4.0);
    const support = (this.state.parameters.supportType as BeamSupportType) || 'simply-supported';
    const pLoad = Number(this.state.parameters.pointLoadMagnitudeKN || 20);
    const pPos = Number(this.state.parameters.pointLoadPositionM || 2.0);
    const hasUDL = Boolean(this.state.parameters.hasUDL);
    const wUDL = Number(this.state.parameters.udlIntensityKNm || 8);
    const cutX = Number(this.state.parameters.sectionCutXM || L / 2);

    const pointLoads: PointLoad[] = pLoad > 0 ? [{ id: 'p1', positionM: pPos, magnitudeKN: pLoad }] : [];
    const udls: UniformlyDistributedLoad[] = hasUDL ? [{ id: 'u1', startM: 0, endM: L, intensityKNm: wUDL }] : [];

    const res = SolidMechanicsCalculator.calculateSfdBmd(L, support, pointLoads, udls);

    // Update 3D Geometry
    this.udlMeshGroup.visible = hasUDL;
    const normCutX = (cutX / L - 0.5) * 2.8;
    this.sectionCutPlane.position.x = normCutX;

    const normLoadX = (pPos / L - 0.5) * 2.8;
    this.pointLoadArrow.position.set(normLoadX, 1.35, 0);

    // Get shear and moment at section cut
    const cutStation = res.points.find((pt) => Math.abs(pt.xM - cutX) < 0.1) || res.points[Math.floor(res.points.length / 2)];

    this.state.metrics = {
      'Left Reaction (R_A)': `${res.reactionLeftKN.toFixed(1)} kN`,
      'Right Reaction (R_B)': support !== 'cantilever' ? `${res.reactionRightKN.toFixed(1)} kN` : 'N/A',
      'Max Bending Moment': `${res.maxPositiveMomentKNm.toFixed(1)} kN·m (at x = ${res.maxPositiveMomentXM} m)`,
      'Max Shear Force': `${res.maxShearForceKN.toFixed(1)} kN`,
      'Shear at Cut V(x)': cutStation ? `${cutStation.shearForceKN.toFixed(1)} kN` : '0 kN',
      'Moment at Cut M(x)': cutStation ? `${cutStation.bendingMomentKNm.toFixed(1)} kN·m` : '0 kN·m',
      'Contraflexure Points': res.pointsOfContraflexureM.length > 0 ? `${res.pointsOfContraflexureM.join(', ')} m` : 'None',
      'Zero Shear Points': res.zeroShearPositionsM.length > 0 ? `${res.zeroShearPositionsM.join(', ')} m` : 'N/A',
    };

    this.notify();
  }
}
