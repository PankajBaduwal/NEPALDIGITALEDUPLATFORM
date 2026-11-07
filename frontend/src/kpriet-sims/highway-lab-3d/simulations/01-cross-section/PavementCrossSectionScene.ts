/**
 * Module 1: 3D Pavement Layers and Road Cross-Section
 * U25CE402 — Highway Engineering
 * Interactive cutaway for Flexible & Rigid Pavements, Camber Crown, Kerbs, Shoulders & Drains
 */

import * as THREE from 'three';
import { BaseHighwaySimulation, type IBaseHighwaySimulationOptions } from '../../core/BaseHighwaySimulation';
import type { IPavementCrossSectionState } from '../../core/types';
import { HighwayCalculator } from '../../core/HighwayCalculator';

export class PavementCrossSectionScene extends BaseHighwaySimulation {
  private pavementMeshGroup: THREE.Group;
  private markingsGroup: THREE.Group;
  private drainageGroup: THREE.Group;
  private explodedOffset = 0;
  private targetExploded = 0;

  constructor(options: IBaseHighwaySimulationOptions) {
    super(options);
    this.pavementMeshGroup = new THREE.Group();
    this.markingsGroup = new THREE.Group();
    this.drainageGroup = new THREE.Group();
    this.highwayGroup.add(this.pavementMeshGroup);
    this.highwayGroup.add(this.markingsGroup);
    this.highwayGroup.add(this.drainageGroup);

    this.defaultCameraPos.set(10, 6, 12);
    this.defaultTarget.set(0, 0.8, 0);
    this.resetCamera();
  }

  public setExplodedView(exploded: boolean): void {
    this.targetExploded = exploded ? 0.35 : 0;
  }

  public rebuildRoadCrossSection(state: IPavementCrossSectionState): void {
    // Clear existing meshes
    this.interactiveObjects.clear();
    while (this.pavementMeshGroup.children.length > 0) {
      const child = this.pavementMeshGroup.children[0];
      if (child) {
        this.pavementMeshGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }
    while (this.markingsGroup.children.length > 0) {
      const child = this.markingsGroup.children[0];
      if (child) {
        this.markingsGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }
    while (this.drainageGroup.children.length > 0) {
      const child = this.drainageGroup.children[0];
      if (child) {
        this.drainageGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }

    const roadLength = state.length;
    const laneWidth = state.carriagewayWidth / state.lanes;
    const halfRoadWidth = state.carriagewayWidth / 2;
    const shoulderW = state.shoulderWidth;
    let currentY = 0;

    // Build layers from bottom (Subgrade) to top
    // Colors and textures for layers
    const layerColors: Record<string, number> = {
      'subgrade': 0x854d0e, // Earth brown
      'gsb': 0xa1a1aa,      // Granular grey
      'wmm': 0x64748b,      // Crushed stone grey
      'dlc': 0x94a3b8,      // Dry lean concrete light grey
      'dbm': 0x334155,      // Dark asphalt
      'bc': 0x18181b,       // Fresh blacktop wearing course
      'pqc': 0xd1d5db,      // Cement concrete slab
    };

    state.layers.forEach((layer, idx) => {
      const thicknessM = layer.thicknessMm / 1000;
      const layerY = currentY + thicknessM / 2;
      const isTop = idx === state.layers.length - 1;
      const layerWidth = state.carriagewayWidth + (isTop ? 0 : 0.4 * (state.layers.length - 1 - idx));

      // Layer box mesh
      const geo = new THREE.BoxGeometry(layerWidth, thicknessM, roadLength);
      const mat = new THREE.MeshStandardMaterial({
        color: layerColors[layer.id] || 0x475569,
        roughness: 0.85,
        metalness: 0.1,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, layerY, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // User data for exploded animation
      mesh.userData = {
        baseY: layerY,
        explodeMultiplier: idx,
      };

      this.pavementMeshGroup.add(mesh);

      // Register interactive layer
      this.registerInteractive(mesh, {
        id: layer.id,
        name: layer.name,
        category: 'Pavement Layer',
        description: `${layer.name} (${layer.thicknessMm} mm thick). Material: ${layer.material}. Specification: ${layer.specification}. Function: ${layer.function}`,
        specReference: layer.specification,
        dimensions: `Thickness: ${layer.thicknessMm} mm, Width: ${layerWidth.toFixed(2)} m, Length: ${roadLength} m`,
        formula: 'V = L × b × t (Rectangular Layer)',
      });

      currentY += thicknessM;
    });

    // Paved/Earthen Shoulders on both sides
    const shoulderThickness = 0.25;
    const shoulderGeo = new THREE.BoxGeometry(shoulderW, shoulderThickness, roadLength);
    const shoulderMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.9,
    });

    const leftShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    leftShoulder.position.set(-(halfRoadWidth + shoulderW / 2), currentY - shoulderThickness / 2, 0);
    leftShoulder.receiveShadow = true;
    this.pavementMeshGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    rightShoulder.position.set(halfRoadWidth + shoulderW / 2, currentY - shoulderThickness / 2, 0);
    rightShoulder.receiveShadow = true;
    this.pavementMeshGroup.add(rightShoulder);

    this.registerInteractive(leftShoulder, {
      id: 'shoulder-left',
      name: 'Left Shoulder (IRC: 73)',
      category: 'Road Element',
      description: `Earthen/paved shoulder of width ${shoulderW} m providing lateral support, emergency breakdown space, and side drainage slope.`,
      specReference: 'IRC: 73-1980 Clause 6.4',
      dimensions: `Width: ${shoulderW} m, Length: ${roadLength} m`,
    });

    // Road Markings (Centreline & Edge lines)
    const markingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Edge lines
    const edgeLineGeo = new THREE.PlaneGeometry(0.15, roadLength);
    const leftEdge = new THREE.Mesh(edgeLineGeo, markingMat);
    leftEdge.rotation.x = -Math.PI / 2;
    leftEdge.position.set(-halfRoadWidth + 0.1, currentY + 0.005, 0);
    this.markingsGroup.add(leftEdge);

    const rightEdge = new THREE.Mesh(edgeLineGeo, markingMat);
    rightEdge.rotation.x = -Math.PI / 2;
    rightEdge.position.set(halfRoadWidth - 0.1, currentY + 0.005, 0);
    this.markingsGroup.add(rightEdge);

    // Centreline dashed markings
    if (state.lanes >= 2) {
      const dashCount = Math.floor(roadLength / 6);
      const dashGeo = new THREE.PlaneGeometry(0.12, 3.0);
      for (let i = -dashCount / 2; i <= dashCount / 2; i++) {
        const dash = new THREE.Mesh(dashGeo, yellowMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, currentY + 0.006, i * 6.0);
        this.markingsGroup.add(dash);
      }
    }

    // Side V-shaped Drainage Ditch on right side
    const drainWidth = 1.2;
    const drainDepth = 0.5;
    const drainShape = new THREE.Shape();
    drainShape.moveTo(0, 0);
    drainShape.lineTo(drainWidth / 2, -drainDepth);
    drainShape.lineTo(drainWidth, 0);
    drainShape.closePath();

    const extrudeSettings = { depth: roadLength, bevelEnabled: false };
    const drainGeo = new THREE.ExtrudeGeometry(drainShape, extrudeSettings);
    const drainMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
    const drainMesh = new THREE.Mesh(drainGeo, drainMat);
    drainMesh.position.set(halfRoadWidth + shoulderW + 0.2, currentY - 0.1, -roadLength / 2);
    this.drainageGroup.add(drainMesh);

    this.registerInteractive(drainMesh, {
      id: 'side-drain',
      name: 'Longitudinal Side Drain (MORTH)',
      category: 'Drainage',
      description: 'Side longitudinal unlined/lined catch drain designed to intercept surface runoff from pavement and side embankment.',
      specReference: 'IRC: SP: 42-2014 & MORTH 309',
      dimensions: `Width: ${drainWidth} m, Depth: ${drainDepth} m`,
    });
  }

  public update(delta: number, elapsed: number): void {
    // Animate smooth explosion of layers
    if (Math.abs(this.explodedOffset - this.targetExploded) > 0.001) {
      this.explodedOffset += (this.targetExploded - this.explodedOffset) * delta * 5;
      this.pavementMeshGroup.children.forEach((child) => {
        if (child.userData && child.userData.baseY !== undefined) {
          child.position.y = child.userData.baseY + (child.userData.explodeMultiplier || 0) * this.explodedOffset;
        }
      });
    }
  }
}
