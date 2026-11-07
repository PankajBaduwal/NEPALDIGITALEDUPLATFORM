/**
 * Module 2: Road Alignment and Geometric Design
 * U25CE402 — Highway Engineering
 * Horizontal curve radius, Stopping Sight Distance (SSD), Overtaking Sight Distance (OSD), Setback & Sight Triangle
 */

import * as THREE from 'three';
import { BaseHighwaySimulation, type IBaseHighwaySimulationOptions } from '../../core/BaseHighwaySimulation';
import type { IGeometricDesignState } from '../../core/types';
import { HighwayCalculator } from '../../core/HighwayCalculator';

export class GeometricDesignScene extends BaseHighwaySimulation {
  private roadCurvatureGroup: THREE.Group;
  private sightEnvelopeGroup: THREE.Group;
  private vehicleGroup: THREE.Group;
  private vehicleMesh: THREE.Group;
  private vehicleProgress = 0;
  private currentSpeed = 80;
  private currentRadius = 250;

  constructor(options: IBaseHighwaySimulationOptions) {
    super(options);
    this.roadCurvatureGroup = new THREE.Group();
    this.sightEnvelopeGroup = new THREE.Group();
    this.vehicleGroup = new THREE.Group();
    this.vehicleMesh = new THREE.Group();

    this.highwayGroup.add(this.roadCurvatureGroup);
    this.highwayGroup.add(this.sightEnvelopeGroup);
    this.highwayGroup.add(this.vehicleGroup);

    this.defaultCameraPos.set(0, 45, 60);
    this.defaultTarget.set(0, 0, 0);
    this.resetCamera();

    this.buildVehicleMesh();
  }

  private buildVehicleMesh(): void {
    // Standard car body
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.8, 4.0);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.7, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    this.vehicleMesh.add(body);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 2.2);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.2, -0.3);
    cabin.castShadow = true;
    this.vehicleMesh.add(cabin);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const positions: [number, number, number][] = [
      [-0.95, 0.35, 1.2],
      [0.95, 0.35, 1.2],
      [-0.95, 0.35, -1.2],
      [0.95, 0.35, -1.2],
    ];
    positions.forEach(([x, y, z]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, y, z);
      this.vehicleMesh.add(w);
    });

    this.vehicleGroup.add(this.vehicleMesh);
  }

  public rebuildCurve(state: IGeometricDesignState): void {
    this.currentSpeed = state.speedKmph;
    this.currentRadius = state.radiusM;

    // Clear curve and sight elements
    while (this.roadCurvatureGroup.children.length > 0) {
      const child = this.roadCurvatureGroup.children[0];
      if (child) {
        this.roadCurvatureGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }
    while (this.sightEnvelopeGroup.children.length > 0) {
      const child = this.sightEnvelopeGroup.children[0];
      if (child) {
        this.sightEnvelopeGroup.remove(child);
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      }
    }

    const R = Math.max(state.radiusM, 40);
    const roadWidth = 7.0;
    const arcAngleRad = Math.PI / 2.5; // 72 degrees of circular arc
    const segments = 64;

    // Build curved road ribbon
    const roadShapePoints: THREE.Vector3[] = [];
    const innerPoints: THREE.Vector3[] = [];
    const outerPoints: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const theta = -arcAngleRad / 2 + (i / segments) * arcAngleRad;
      const cx = R * Math.sin(theta);
      const cz = R * Math.cos(theta) - R;

      const innerX = (R - roadWidth / 2) * Math.sin(theta);
      const innerZ = (R - roadWidth / 2) * Math.cos(theta) - R;
      const outerX = (R + roadWidth / 2) * Math.sin(theta);
      const outerZ = (R + roadWidth / 2) * Math.cos(theta) - R;

      innerPoints.push(new THREE.Vector3(innerX, 0.05, innerZ));
      outerPoints.push(new THREE.Vector3(outerX, 0.05, outerZ));
      roadShapePoints.push(new THREE.Vector3(cx, 0.05, cz));
    }

    // Road surface mesh using triangle strip
    const geom = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];

    for (let i = 0; i < segments; i++) {
      const p1 = innerPoints[i];
      const p2 = outerPoints[i];
      const p3 = innerPoints[i + 1];
      const p4 = outerPoints[i + 1];
      if (!p1 || !p2 || !p3 || !p4) continue;

      // Tri 1
      vertices.push(p1.x, p1.y, p1.z);
      vertices.push(p2.x, p2.y, p2.z);
      vertices.push(p3.x, p3.y, p3.z);

      // Tri 2
      vertices.push(p2.x, p2.y, p2.z);
      vertices.push(p4.x, p4.y, p4.z);
      vertices.push(p3.x, p3.y, p3.z);

      uvs.push(0, i / segments, 1, i / segments, 0, (i + 1) / segments);
      uvs.push(1, i / segments, 1, (i + 1) / segments, 0, (i + 1) / segments);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.computeVertexNormals();

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const roadMesh = new THREE.Mesh(geom, roadMat);
    roadMesh.receiveShadow = true;
    this.roadCurvatureGroup.add(roadMesh);

    // Register interactive road
    this.registerInteractive(roadMesh, {
      id: 'curved-alignment',
      name: 'Horizontal Circular Curve (IRC: 73)',
      category: 'Geometric Design',
      description: `Circular alignment of radius R = ${R} m for design speed V = ${state.speedKmph} km/h. Minimum ruling radius required = ${HighwayCalculator.calculateGeometricDesign(state.speedKmph, state.radiusM, state.longitudinalSlopePercent).rulingRadiusM} m.`,
      specReference: 'IRC: 73-1980 Table 6',
      dimensions: `Radius: ${R} m, Carriageway: ${roadWidth} m, Arc: ${(arcAngleRad * 180 / Math.PI).toFixed(0)}°`,
    });

    // Centreline yellow arc
    const curvePath = new THREE.CatmullRomCurve3(roadShapePoints);
    const tubeGeo = new THREE.TubeGeometry(curvePath, 64, 0.08, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const centreline = new THREE.Mesh(tubeGeo, tubeMat);
    this.roadCurvatureGroup.add(centreline);

    // Sight Distance cone / line of sight
    const results = HighwayCalculator.calculateGeometricDesign(state.speedKmph, state.radiusM, state.longitudinalSlopePercent);
    const ssdM = results.ssdM;

    // Visual line of sight chord from start of curve
    const startPt = roadShapePoints[0];
    const endSightIdx = Math.min(Math.floor((ssdM / (R * arcAngleRad)) * segments), segments);
    const endSightPt = roadShapePoints[endSightIdx] || roadShapePoints[segments];

    if (startPt && endSightPt) {
      // Sight Ray line
      const sightLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startPt.x, 1.2, startPt.z),
        new THREE.Vector3(endSightPt.x, 0.15, endSightPt.z),
      ]);
      const sightLineMat = new THREE.LineDashedMaterial({
        color: 0xef4444,
        dashSize: 1.5,
        gapSize: 0.8,
        linewidth: 3,
      });
      const sightLine = new THREE.Line(sightLineGeo, sightLineMat);
      sightLine.computeLineDistances();
      this.sightEnvelopeGroup.add(sightLine);

      // Lateral Obstruction Building/Wall inside inner edge
      const midChord = new THREE.Vector3().lerpVectors(startPt, endSightPt, 0.5);
      const wallGeo = new THREE.BoxGeometry(4, 3, 2);
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(midChord.x * 0.9, 1.5, midChord.z * 0.9);
      wall.castShadow = true;
      this.sightEnvelopeGroup.add(wall);

      this.registerInteractive(wall, {
        id: 'lateral-obstruction',
        name: 'Sight Distance Obstruction (Cut Slope/Structure)',
        category: 'Sight Triangle',
        description: `Lateral clearance required for stopping sight distance of ${ssdM} m. Setback distance m = ${results.setbackDistanceM} m from road centreline.`,
        specReference: 'IRC: 73-1980 Clause 7.6',
        dimensions: `Setback required: ${results.setbackDistanceM} m`,
      });
    }
  }

  public update(delta: number, elapsed: number): void {
    // Animate car driving along curve
    const R = Math.max(this.currentRadius, 40);
    const arcAngleRad = Math.PI / 2.5;
    const angularSpeed = (this.currentSpeed * 1000 / 3600) / R; // rad/s

    this.vehicleProgress += angularSpeed * delta * 0.4;
    const currentTheta = -arcAngleRad / 2 + (this.vehicleProgress % arcAngleRad);

    const x = R * Math.sin(currentTheta);
    const z = R * Math.cos(currentTheta) - R;

    this.vehicleMesh.position.set(x, 0.05, z);
    this.vehicleMesh.rotation.y = currentTheta + Math.PI / 2;
  }
}
