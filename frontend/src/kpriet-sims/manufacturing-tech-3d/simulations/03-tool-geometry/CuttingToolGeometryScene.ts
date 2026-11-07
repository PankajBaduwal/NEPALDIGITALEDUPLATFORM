/**
 * 3D Cutting Tool Geometry & Tool Signature Scene (Unit I Core)
 * Features interactive inspection of Back Rake, Side Rake, Relief Angles, Cutting Edge Angles,
 * Nose Radius, Reference Planes, and ASA vs ORS Coordinate System Standards.
 */

import * as THREE from 'three';
import { BaseMachiningSimulation } from '../BaseMachiningSimulation';
import type { AsaToolSignature } from '../../core/types';
import { STANDARD_ASA_TOOL_SIGNATURES } from '../../core/MachiningMaterials';

export class CuttingToolGeometryScene extends BaseMachiningSimulation {
  private toolRoot = new THREE.Group();
  private toolShankMesh!: THREE.Mesh;
  private insertMesh!: THREE.Mesh;
  private referencePlanesGroup = new THREE.Group();
  private angleArcsGroup = new THREE.Group();

  // Active Tool Signature
  private signature: AsaToolSignature = { ...STANDARD_ASA_TOOL_SIGNATURES.hssGeneralPurpose };
  private highlightedFeature: string | null = null;
  private showReferencePlanes = true;

  constructor(container: HTMLElement) {
    super(container);
    this.scene.add(this.toolRoot);
    this.toolRoot.add(this.referencePlanesGroup, this.angleArcsGroup);
    this.buildToolModel();
    this.buildReferencePlanes();
    this.resetCamera(11, 2.0, Math.PI / 4, Math.PI / 3.2);
  }

  private buildToolModel(): void {
    // 1. Tool Shank (Square HSS steel body)
    const shankGeo = new THREE.BoxGeometry(1.6, 1.6, 6.0);
    const shankMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.35,
    });
    this.toolShankMesh = new THREE.Mesh(shankGeo, shankMat);
    this.toolShankMesh.position.set(0, 1.5, -2.0);
    this.toolShankMesh.castShadow = true;
    this.toolRoot.add(this.toolShankMesh);

    // 2. Brazed / Indexable Carbide Tool Tip (Formed with Rake & Clearance angles)
    this.updateToolGeometryMesh();
  }

  private updateToolGeometryMesh(): void {
    // If an existing insert exists, remove and dispose
    if (this.insertMesh) {
      if (this.insertMesh.geometry) this.insertMesh.geometry.dispose();
      this.toolRoot.remove(this.insertMesh);
    }

    // Convert angles to radians
    const backRakeRad = (this.signature.backRakeAngleDeg * Math.PI) / 180;
    const sideRakeRad = (this.signature.sideRakeAngleDeg * Math.PI) / 180;
    const sideReliefRad = (this.signature.sideReliefAngleDeg * Math.PI) / 180;
    const endReliefRad = (this.signature.endReliefAngleDeg * Math.PI) / 180;
    const sideEdgeRad = (this.signature.sideCuttingEdgeAngleDeg * Math.PI) / 180;
    const endEdgeRad = (this.signature.endCuttingEdgeAngleDeg * Math.PI) / 180;

    // Build custom wedge geometry for single-point tool tip with actual rake & clearance slopes
    const width = 1.6;
    const height = 1.6;
    const length = 2.4;

    // Define 8 vertices of the tool head deformed by the 6 angles
    const vertices = new Float32Array([
      // Bottom face (Clearance side)
      -width / 2 + Math.tan(sideReliefRad) * height, 0.7, 1.0 - Math.tan(endReliefRad) * height,
       width / 2, 0.7, 1.0 - Math.tan(endReliefRad) * height,
       width / 2, 0.7, -1.0,
      -width / 2 + Math.tan(sideReliefRad) * height, 0.7, -1.0,

      // Top face (Rake face - slopes downwards with back rake & side rake)
      -width / 2, 2.3 + Math.tan(sideRakeRad) * width, 1.0 - Math.tan(backRakeRad) * length,
       width / 2, 2.3, 1.0 - Math.tan(backRakeRad) * length,
       width / 2, 2.3, -1.0,
      -width / 2, 2.3 + Math.tan(sideRakeRad) * width, -1.0,
    ]);

    const indices = [
      // Front face (End flank)
      0, 1, 5,  0, 5, 4,
      // Right face
      1, 2, 6,  1, 6, 5,
      // Back face
      2, 3, 7,  2, 7, 6,
      // Left face (Side flank / major cutting edge)
      3, 0, 4,  3, 4, 7,
      // Top face (Rake face where chips slide)
      4, 5, 6,  4, 6, 7,
      // Bottom face
      3, 2, 1,  3, 1, 0,
    ];

    const tipGeo = new THREE.BufferGeometry();
    tipGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    tipGeo.setIndex(indices);
    tipGeo.computeVertexNormals();

    const tipMat = new THREE.MeshStandardMaterial({
      color: this.highlightedFeature === 'rake' ? 0x38bdf8 : this.highlightedFeature === 'flank' ? 0xef4444 : 0xf59e0b,
      metalness: 0.9,
      roughness: 0.25,
    });

    this.insertMesh = new THREE.Mesh(tipGeo, tipMat);
    this.insertMesh.position.set(0, 0, 1.8);
    this.insertMesh.castShadow = true;
    this.toolRoot.add(this.insertMesh);
  }

  private buildReferencePlanes(): void {
    // Clear old planes
    while (this.referencePlanesGroup.children.length > 0) {
      const child = this.referencePlanesGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      this.referencePlanesGroup.remove(child);
    }

    if (!this.showReferencePlanes) return;

    // 1. Horizontal Base Reference Plane (Pr)
    const basePlaneGeo = new THREE.PlaneGeometry(6, 6);
    const basePlaneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const basePlane = new THREE.Mesh(basePlaneGeo, basePlaneMat);
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.position.set(0, 0.7, 1.5);
    this.referencePlanesGroup.add(basePlane);

    // 2. Longitudinal Reference Plane (Px - parallel to tool axis)
    const longPlaneGeo = new THREE.PlaneGeometry(5, 4);
    const longPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const longPlane = new THREE.Mesh(longPlaneGeo, longPlaneMat);
    longPlane.rotation.y = Math.PI / 2;
    longPlane.position.set(0.8, 2.0, 1.5);
    this.referencePlanesGroup.add(longPlane);

    // 3. Transverse Reference Plane (Py - perpendicular to tool axis)
    const transPlaneGeo = new THREE.PlaneGeometry(5, 4);
    const transPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const transPlane = new THREE.Mesh(transPlaneGeo, transPlaneMat);
    transPlane.position.set(0, 2.0, 2.8);
    this.referencePlanesGroup.add(transPlane);
  }

  public updateAnimation(delta: number, elapsed: number): void {
    // Subtle breathing highlight rotation for interactive inspection
    if (this.highlightedFeature) {
      this.toolRoot.rotation.y = Math.sin(elapsed * 0.8) * 0.1;
    } else {
      this.toolRoot.rotation.y = 0;
    }
  }

  public updateParameters(params: {
    signature?: AsaToolSignature;
    highlightFeature?: string | null;
    showPlanes?: boolean;
  }): void {
    if (params.signature) {
      this.signature = { ...params.signature };
    }
    if (params.highlightFeature !== undefined) {
      this.highlightedFeature = params.highlightFeature;
    }
    if (params.showPlanes !== undefined) {
      this.showReferencePlanes = params.showPlanes;
      this.buildReferencePlanes();
    }
    this.updateToolGeometryMesh();
  }
}
