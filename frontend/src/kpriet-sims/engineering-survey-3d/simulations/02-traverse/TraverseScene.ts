/**
 * Engineering Survey (U25CE303) — Theodolite / Total Station Traversing 3D Scene
 * B.E. Civil Engineering — Semester III
 * PiyushDhara Eduverse Academic Portal
 *
 * Implements:
 * - 4-station polygon traverse (Stations A, B, C, D) with ground pegs.
 * - Electronic Total Station with optical plummet, horizontal circle, and display.
 * - Retro-reflective prism mounted on survey range pole.
 * - Sightline visualization, bearing compass, and Bowditch closing workflow.
 */

import * as THREE from 'three';
import { BaseSurveySimulation } from '../../core/BaseSurveySimulation';
import type { TraverseStation, TraverseObservation } from '../../core/types';

export class TraverseScene extends BaseSurveySimulation {
  private totalStationGroup: THREE.Group;
  private prismPoleGroup: THREE.Group;
  private tripodGroup: THREE.Group;
  private laserBeamMesh: THREE.Line | null = null;
  private stationsMarkerGroup: THREE.Group;

  // Closed traverse polygon stations
  public readonly traverseStations: TraverseStation[] = [
    { id: 'st-a', code: 'Station A', x: 0, y: 0, z: 100.0, description: 'Occupied instrument station' },
    { id: 'st-b', code: 'Station B', x: 25.0, y: 15.0, z: 100.6, description: 'Foresight traverse station B' },
    { id: 'st-c', code: 'Station C', x: 18.0, y: 38.0, z: 101.2, description: 'Traverse turn station C' },
    { id: 'st-d', code: 'Station D', x: -12.0, y: 22.0, z: 99.8, description: 'Backsight reference station D' },
  ];

  private currentTargetIndex = 1; // Aiming at Station B initially
  private horizontalAngle = 45.0; // deg
  private verticalAngle = 1.2; // deg
  private isPlummetCentered = true;

  constructor(container: HTMLElement) {
    super(container);

    this.totalStationGroup = new THREE.Group();
    this.prismPoleGroup = new THREE.Group();
    this.tripodGroup = new THREE.Group();
    this.stationsMarkerGroup = new THREE.Group();

    this.buildTotalStation();
    this.buildPrismPole();
    this.buildStationPegs();
    this.buildTraversePolygonLine();
    this.buildReticleCamera();

    this.aimAtTarget(1);
  }

  private buildTotalStation(): void {
    // 1. Heavy Aluminum Tripod
    const legGeo = new THREE.CylinderGeometry(0.035, 0.02, 1.5, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.3 });

    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(Math.sin(angle) * 0.5, 0.75, Math.cos(angle) * 0.5);
      leg.rotation.z = Math.sin(angle) * 0.3;
      leg.rotation.x = -Math.cos(angle) * 0.3;
      leg.castShadow = true;
      this.tripodGroup.add(leg);
    }

    // Tribrach base
    const baseGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.08, 16);
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    const base = new THREE.Mesh(baseGeo, darkMetal);
    base.position.y = 1.48;
    this.tripodGroup.add(base);

    this.scene.add(this.tripodGroup);

    // 2. Total Station Standards (Alidade frame)
    const alidadeGeo = new THREE.BoxGeometry(0.24, 0.32, 0.16);
    const tsMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }); // Trimble/Topcon gold-amber
    const alidade = new THREE.Mesh(alidadeGeo, tsMat);
    alidade.position.y = 1.68;
    alidade.castShadow = true;
    this.totalStationGroup.add(alidade);

    // Electronic LCD Display & Keypad
    const screenGeo = new THREE.PlaneGeometry(0.12, 0.08);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 }); // Glowing cyan-blue LCD
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.68, 0.085);
    this.totalStationGroup.add(screen);

    // Central Telescope
    const scopeGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.38, 24);
    scopeGeo.rotateX(Math.PI / 2);
    const scope = new THREE.Mesh(scopeGeo, darkMetal);
    scope.position.set(0, 1.72, 0);
    scope.castShadow = true;
    this.totalStationGroup.add(scope);

    // Objective lens with red laser emitter ring
    const laserRingGeo = new THREE.RingGeometry(0.02, 0.04, 16);
    const laserRingMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const laserRing = new THREE.Mesh(laserRingGeo, laserRingMat);
    laserRing.position.set(0, 1.72, -0.191);
    this.totalStationGroup.add(laserRing);

    // Laser optical plummet beam pointing directly down to ground peg
    const plummetGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 1.48, 0),
      new THREE.Vector3(0, 0.02, 0),
    ]);
    const plummetMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
    const plummetLine = new THREE.Line(plummetGeo, plummetMat);
    this.totalStationGroup.add(plummetLine);

    this.scene.add(this.totalStationGroup);
  }

  private buildPrismPole(): void {
    // 2-meter yellow survey range pole with red bands
    const poleHeight = 2.15;
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, poleHeight, 16);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = poleHeight / 2;
    pole.castShadow = true;
    this.prismPoleGroup.add(pole);

    // Target prism housing & reflector
    const targetPlateGeo = new THREE.BoxGeometry(0.18, 0.18, 0.02);
    const targetPlateMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }); // Red target plate with yellow chevrons
    const targetPlate = new THREE.Mesh(targetPlateGeo, targetPlateMat);
    targetPlate.position.set(0, 2.0, 0);
    this.prismPoleGroup.add(targetPlate);

    // Glass corner-cube prism cylinder
    const prismGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16);
    prismGeo.rotateX(Math.PI / 2);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.95,
      roughness: 0.1,
    });
    const prism = new THREE.Mesh(prismGeo, prismMat);
    prism.position.set(0, 2.0, 0.03);
    this.prismPoleGroup.add(prism);

    this.scene.add(this.prismPoleGroup);
  }

  private buildStationPegs(): void {
    // Wooden survey pegs driven into ground at each station
    this.traverseStations.forEach((st) => {
      const pegGroup = new THREE.Group();
      pegGroup.position.set(st.x, 0, -st.y); // Three.js -Z is surveying North

      const pegGeo = new THREE.BoxGeometry(0.1, 0.25, 0.1);
      const pegMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
      const peg = new THREE.Mesh(pegGeo, pegMat);
      peg.position.y = 0.12;
      pegGroup.add(peg);

      // Red central nail marker
      const nailGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.02, 8);
      const nailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const nail = new THREE.Mesh(nailGeo, nailMat);
      nail.position.y = 0.25;
      pegGroup.add(nail);

      this.stationsMarkerGroup.add(pegGroup);
    });

    this.scene.add(this.stationsMarkerGroup);
  }

  private buildTraversePolygonLine(): void {
    // Green dashed polygon line connecting A -> B -> C -> D -> A
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= this.traverseStations.length; i++) {
      const st = this.traverseStations[i % this.traverseStations.length];
      if (st) {
        points.push(new THREE.Vector3(st.x, 0.08, -st.y));
      }
    }

    const polyGeo = new THREE.BufferGeometry().setFromPoints(points);
    const polyMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      dashSize: 1.5,
      gapSize: 0.8,
      linewidth: 2,
    });
    const polyLine = new THREE.Line(polyGeo, polyMat);
    polyLine.computeLineDistances();
    this.scene.add(polyLine);
  }

  private buildReticleCamera(): void {
    this.reticleCamera = new THREE.PerspectiveCamera(12, 1, 0.1, 300);
    this.reticleCamera.position.set(0, 1.72, 0);

    // Crosshairs HUD
    const hudGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
    const hLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.08, 0, -0.3),
        new THREE.Vector3(0.08, 0, -0.3),
      ]),
      lineMat
    );
    hudGroup.add(hLine);

    const vLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -0.08, -0.3),
        new THREE.Vector3(0, 0.08, -0.3),
      ]),
      lineMat
    );
    hudGroup.add(vLine);

    // Diaphragm ring
    const ringGeo = new THREE.RingGeometry(0.075, 0.16, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, -0.3);
    hudGroup.add(ring);

    this.reticleCamera.add(hudGroup);
    this.scene.add(this.reticleCamera);
  }

  public aimAtTarget(stationIndex: number): void {
    if (stationIndex < 0 || stationIndex >= this.traverseStations.length) return;
    const target = this.traverseStations[stationIndex];
    if (!target) return;
    this.currentTargetIndex = stationIndex;

    // Place prism pole at target station
    const targetWorldX = target.x;
    const targetWorldZ = -target.y; // Survey Northing maps to -Z
    this.prismPoleGroup.position.set(targetWorldX, 0, targetWorldZ);

    // Compute bearing and angle from Station A (0, 0)
    const dx = target.x;
    const dy = target.y; // Northing
    let wcbRad = Math.atan2(dx, dy); // 0 at North (+Y), 90 at East (+X)
    if (wcbRad < 0) wcbRad += 2 * Math.PI;
    this.horizontalAngle = Number(((wcbRad * 180) / Math.PI).toFixed(2));

    // Rotate total station
    this.totalStationGroup.rotation.y = -wcbRad;

    // Laser sight line
    if (this.laserBeamMesh) {
      this.scene.remove(this.laserBeamMesh);
      this.laserBeamMesh.geometry.dispose();
    }
    const laserPoints = [
      new THREE.Vector3(0, 1.72, 0),
      new THREE.Vector3(targetWorldX, 2.0, targetWorldZ),
    ];
    const laserGeo = new THREE.BufferGeometry().setFromPoints(laserPoints);
    const laserMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
    this.laserBeamMesh = new THREE.Line(laserGeo, laserMat);
    this.scene.add(this.laserBeamMesh);

    // Orient reticle camera
    if (this.reticleCamera) {
      this.reticleCamera.position.set(0, 1.72, 0);
      this.reticleCamera.lookAt(new THREE.Vector3(targetWorldX, 2.0, targetWorldZ));
    }
  }

  public getObservation(): TraverseObservation {
    const fromSt = this.traverseStations[0];
    const toSt = this.traverseStations[this.currentTargetIndex];

    const dx = (toSt?.x || 0) - (fromSt?.x || 0);
    const dy = (toSt?.y || 0) - (fromSt?.y || 0);
    const dz = (toSt?.z || 100.0) - (fromSt?.z || 100.0);
    const horizDist = Math.hypot(dx, dy);
    const slopeDist = Math.hypot(horizDist, dz);
    const vertAngle = Number(((Math.atan2(dz, horizDist || 1) * 180) / Math.PI).toFixed(2));

    return {
      fromStation: fromSt?.code || 'Station A',
      toStation: toSt?.code || 'Station B',
      horizontalAngleDeg: this.horizontalAngle,
      slopeDistanceM: Number(slopeDist.toFixed(3)),
      verticalAngleDeg: vertAngle,
      observedBearingDeg: this.horizontalAngle,
    };
  }

  public setPlummetCentered(centered: boolean): void {
    this.isPlummetCentered = centered;
    if (!centered) {
      this.totalStationGroup.position.set(0.04, 0, -0.03); // centering error
    } else {
      this.totalStationGroup.position.set(0, 0, 0);
    }
  }

  public getCurrentTargetIndex(): number {
    return this.currentTargetIndex;
  }

  protected updateSimulation(): void {
    // Pulse laser beam opacity
    if (this.laserBeamMesh && this.laserBeamMesh.material instanceof THREE.LineBasicMaterial) {
      this.laserBeamMesh.material.opacity = 0.7 + 0.3 * Math.sin(Date.now() * 0.008);
    }
  }

  public override dispose(): void {
    if (this.laserBeamMesh) {
      this.scene.remove(this.laserBeamMesh);
      this.laserBeamMesh.geometry.dispose();
    }
    super.dispose();
  }
}
